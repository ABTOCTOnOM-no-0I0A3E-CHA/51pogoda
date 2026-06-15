import { randomUUID } from "node:crypto";
/* fetch берём из undici (не глобальный): иначе кастомный Agent несовместим */
import { Agent, fetch } from "undici";
import { RU_ROOT_CA, RU_SUB_CA } from "./gigachat-ca";

const OAUTH_URL = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth";
const CHAT_URL = "https://gigachat.devices.sberbank.ru/api/v1/chat/completions";
const MODEL = process.env.GIGACHAT_MODEL ?? "GigaChat";
const SCOPE = process.env.GIGACHAT_SCOPE ?? "GIGACHAT_API_PERS";

/*
  Сбер подписывает сертификаты корневым УЦ Минцифры, которого нет в дефолтном
  бандле Node. Доверяем ему точечно — только для запросов к GigaChat, проверку
  TLS НЕ отключаем (rejectUnauthorized остаётся включённым).
*/
const sberDispatcher = new Agent({ connect: { ca: [RU_ROOT_CA, RU_SUB_CA] } });

interface TokenCache {
  token: string;
  expiresAt: number;
}
let cached: TokenCache | null = null;

async function getAccessToken(): Promise<string> {
  const authKey = process.env.GIGACHAT_AUTH_KEY;
  if (!authKey) throw new Error("GIGACHAT_AUTH_KEY not set");

  /* Токен живёт ~30 мин — переиспользуем, обновляем за минуту до истечения */
  if (cached && cached.expiresAt - 60_000 > Date.now()) {
    return cached.token;
  }

  const res = await fetch(OAUTH_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authKey}`,
      RqUID: randomUUID(),
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: `scope=${encodeURIComponent(SCOPE)}`,
    dispatcher: sberDispatcher,
  });

  if (!res.ok) {
    throw new Error(`GigaChat OAuth ${res.status}`);
  }

  const data = (await res.json()) as { access_token?: string; expires_at?: number };
  if (!data.access_token) {
    throw new Error("GigaChat OAuth: пустой access_token");
  }

  cached = {
    token: data.access_token,
    /* expires_at приходит в мс epoch; если нет — считаем 30 минут от now */
    expiresAt: data.expires_at ?? Date.now() + 30 * 60_000,
  };
  return cached.token;
}

export async function callGigaChat(prompt: string): Promise<string> {
  const token = await getAccessToken();

  const res = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      max_tokens: 400,
    }),
    dispatcher: sberDispatcher,
  });

  if (!res.ok) {
    /* Токен мог протухнуть раньше срока — сбрасываем кэш на следующую попытку */
    if (res.status === 401) cached = null;
    throw new Error(`GigaChat ${res.status}`);
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("GigaChat: пустой ответ");
  }
  return content;
}
