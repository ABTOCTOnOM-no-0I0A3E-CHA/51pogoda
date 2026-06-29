const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "qwen2.5:7b";

export async function callOllama(prompt: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        temperature: 0.3,
        format: "json",
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Ollama ${response.status}${text ? `: ${text}` : ""}`);
    }

    const data = (await response.json()) as { response?: string };
    if (!data.response) {
      throw new Error("Ollama: пустой ответ");
    }

    return data.response;
  } finally {
    clearTimeout(timer);
  }
}
