import "server-only";
import type { WeatherSummary } from "../lib/summary";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function callOpenRouter(prompt: string): Promise<WeatherSummary | null> {
  if (!OPENROUTER_API_KEY) return null;

  const model = process.env.OPENROUTER_MODEL ?? "deepseek/deepseek-chat";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://51pogoda.ru";

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": siteUrl,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 512,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[openrouter] ${res.status} ${body}`);
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
