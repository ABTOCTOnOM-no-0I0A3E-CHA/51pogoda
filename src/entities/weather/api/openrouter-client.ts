import "server-only";
import https from "node:https";
import { SocksProxyAgent } from "socks-proxy-agent";
import { SITE } from "@/shared/config/site";
import type { WeatherSummary } from "../lib/summary";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

function getProxies(): string[] {
  const raw = process.env.OPENROUTER_PROXY;
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function fetchViaSocks(
  url: string,
  headers: Record<string, string>,
  body: string,
  proxyUrl: string,
): Promise<Response> {
  const agent = new SocksProxyAgent(proxyUrl, { timeout: 12_000 });
  const { hostname, pathname } = new URL(url);

  return new Promise((resolve, reject) => {
    const req = https.request(
      { hostname, port: 443, path: pathname, method: "POST", agent, headers },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString();
          const h = new Headers();
          for (const [k, v] of Object.entries(res.headers))
            if (v) h.set(k, Array.isArray(v) ? v.join(", ") : v);
          resolve(
            new Response(text, {
              status: res.statusCode ?? 500,
              statusText: res.statusMessage ?? "",
              headers: h,
            }),
          );
        });
      },
    );
    req.on("error", reject);
    req.setTimeout(15_000, () => req.destroy(new Error("proxy timeout")));
    req.write(body);
    req.end();
  });
}

export async function callOpenRouter(
  prompt: string,
): Promise<WeatherSummary | null> {
  if (!OPENROUTER_API_KEY) return null;

  const model = process.env.OPENROUTER_MODEL ?? "deepseek/deepseek-v4-flash";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    "HTTP-Referer": SITE.url,
  };
  const body = JSON.stringify({
    model,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 512,
  });

  const proxies = getProxies();
  let res: Response | null = null;

  for (const proxy of proxies) {
    try {
      const r = await fetchViaSocks(OPENROUTER_URL, headers, body, proxy);
      if (r.ok) {
        res = r;
        break;
      }
      console.error(`[openrouter] proxy ${proxy}: ${r.status}`);
    } catch (e) {
      console.error(`[openrouter] proxy ${proxy}: ${(e as Error).message}`);
    }
  }

  if (!res) {
    try {
      res = await fetch(OPENROUTER_URL, { method: "POST", headers, body });
    } catch (e) {
      console.error("[openrouter] direct:", (e as Error).message);
      return null;
    }
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`[openrouter] ${res.status} ${text}`);
    return null;
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;

  try {
    const parsed = JSON.parse(content) as WeatherSummary;
    if (typeof parsed.accurate !== "string" || typeof parsed.advice !== "string")
      return null;
    return { accurate: parsed.accurate, advice: parsed.advice };
  } catch {
    console.error("[openrouter] invalid JSON:", content.slice(0, 200));
    return null;
  }
}
