type AIProvider = "gemini" | "groq";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const PROVIDER_NAMES: Record<AIProvider, string> = {
  gemini: "Google Gemini",
  groq: "Groq",
};

const DEFAULT_MODELS: Record<AIProvider, string> = {
  gemini: "gemini-2.5-flash",
  groq: "llama-3.3-70b-versatile",
};

const ENV_KEYS: Record<AIProvider, string> = {
  gemini: "GEMINI_API_KEY",
  groq: "GROQ_API_KEY",
};

export function isHostedProvider(provider: string): provider is AIProvider {
  return provider === "gemini" || provider === "groq";
}

function readKey(provider: AIProvider, suppliedKey?: unknown) {
  const userKey = typeof suppliedKey === "string" ? suppliedKey.trim() : "";
  return {
    key: userKey || (process.env[ENV_KEYS[provider]] || "").trim(),
    source: userKey ? "user" : "hosted",
  };
}

function upstreamError(provider: AIProvider, status: number, body: string) {
  const quotaHint = status === 401 || status === 403 || status === 429;
  const hint = quotaHint
    ? `${PROVIDER_NAMES[provider]} hosted key is unavailable or quota-limited. Add your own ${ENV_KEYS[provider]} in AI Provider Settings to continue.`
    : `${PROVIDER_NAMES[provider]} request failed.`;
  return `${hint}${body ? ` Upstream: ${body.slice(0, 800)}` : ""}`;
}

function geminiContents(messages: ChatMessage[]) {
  return messages
    .filter((message) => message.role !== "system")
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    }));
}

function geminiText(data: any) {
  return (data?.candidates?.[0]?.content?.parts || [])
    .map((part: { text?: string }) => part.text || "")
    .join("");
}

async function callGemini(params: {
  key: string;
  model: string;
  messages: ChatMessage[];
  jsonMode?: boolean;
  schema?: unknown;
}) {
  const systemText = params.messages
    .filter((message) => message.role === "system")
    .map((message) => message.content)
    .join("\n\n");
  const generationConfig: Record<string, unknown> = {
    temperature: 0.25,
  };

  if (params.jsonMode) {
    generationConfig.responseMimeType = "application/json";
    if (params.schema) generationConfig.responseSchema = params.schema;
  }

  const body: Record<string, unknown> = {
    contents: geminiContents(params.messages),
    generationConfig,
  };
  if (systemText) body.systemInstruction = { parts: [{ text: systemText }] };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(params.model)}:generateContent?key=${params.key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  const dataText = await res.text();
  if (!res.ok) throw new Error(upstreamError("gemini", res.status, dataText));
  const data = dataText ? JSON.parse(dataText) : {};
  return geminiText(data);
}

async function callGroq(params: {
  key: string;
  model: string;
  messages: ChatMessage[];
  jsonMode?: boolean;
}) {
  const body: Record<string, unknown> = {
    model: params.model,
    messages: params.messages,
    temperature: 0.25,
    top_p: 0.9,
    max_completion_tokens: 8192,
  };
  if (params.jsonMode) body.response_format = { type: "json_object" };

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.key}`,
    },
    body: JSON.stringify(body),
  });
  const dataText = await res.text();
  if (!res.ok) throw new Error(upstreamError("groq", res.status, dataText));
  const data = dataText ? JSON.parse(dataText) : {};
  return data.choices?.[0]?.message?.content || "";
}

export async function runHostedProvider(params: {
  provider: AIProvider;
  key?: unknown;
  model?: unknown;
  messages: ChatMessage[];
  jsonMode?: boolean;
  schema?: unknown;
}) {
  const { key, source } = readKey(params.provider, params.key);
  if (!key) {
    throw new Error(
      `${ENV_KEYS[params.provider]} is not configured on this deployment. Add it in Vercel, or add your own key in AI Provider Settings.`,
    );
  }

  const model = typeof params.model === "string" && params.model.trim()
    ? params.model.trim()
    : DEFAULT_MODELS[params.provider];
  const text = params.provider === "gemini"
    ? await callGemini({ key, model, messages: params.messages, jsonMode: params.jsonMode, schema: params.schema })
    : await callGroq({ key, model, messages: params.messages, jsonMode: params.jsonMode });

  return { text, provider: params.provider, model, keySource: source };
}

