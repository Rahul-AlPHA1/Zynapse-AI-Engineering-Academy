import { GoogleGenAI, Type } from "@google/genai";

export interface AIDetailedQuestion {
  question: string;
  definition: string;
  keyPoints: string[];
  scenario: string;
}

export interface AIPlanResponse {
  planTitle: string;
  overview: string;
  schedule: { day: string; description: string }[];
  detailedQuestions: AIDetailedQuestion[];
}

export type AIProvider =
  | "gemini"
  | "groq"
  | "claude"
  | "openai"
  | "mistral"
  | "together"
  | "deepseek"
  | "nvidia"
  | "ollama";

export const LOCAL_OLLAMA_MODEL = "gemma2:2b";
export const LOCAL_OLLAMA_MODEL_NAME = "Gemma 2 2B";

export interface ProviderConfig {
  id: AIProvider;
  name: string;
  baseUrl: string;
  keyStorageKey: string;
  defaultModel: string;
  models: { id: string; name: string; description: string }[];
  requiresKey: boolean;
  isLocal?: boolean;
}

export const PROVIDER_CONFIGS: Record<AIProvider, ProviderConfig> = {
  gemini: {
    id: "gemini",
    name: "Google Gemini",
    baseUrl: "https://generativelanguage.googleapis.com",
    keyStorageKey: "GEMINI_API_KEY",
    defaultModel: "gemini-2.5-flash",
    requiresKey: true,
    models: [
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", description: "Most capable, best reasoning" },
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", description: "Fast & smart, recommended" },
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", description: "Stable, reliable" },
      { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", description: "1M context window" },
      { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", description: "Fast & affordable" },
    ],
  },
  groq: {
    id: "groq",
    name: "Groq",
    baseUrl: "https://api.groq.com/openai/v1",
    keyStorageKey: "GROQ_API_KEY",
    defaultModel: "llama-3.3-70b-versatile",
    requiresKey: true,
    models: [
      { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B", description: "Best quality on Groq" },
      { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B Instant", description: "Ultra fast" },
      { id: "qwen/qwen3-32b", name: "Qwen3 32B", description: "Strong multilingual reasoning" },
      { id: "openai/gpt-oss-20b", name: "GPT OSS 20B", description: "Fast open-weight model" },
      { id: "openai/gpt-oss-120b", name: "GPT OSS 120B", description: "Large open-weight model" },
      { id: "deepseek-r1-distill-llama-70b", name: "DeepSeek R1 (Groq)", description: "Reasoning model" },
      { id: "qwen-qwq-32b", name: "QwQ 32B", description: "Strong reasoning" },
      { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B", description: "MoE architecture" },
      { id: "gemma2-9b-it", name: "Gemma 2 9B", description: "Google's open model" },
    ],
  },
  claude: {
    id: "claude",
    name: "Claude (Anthropic)",
    baseUrl: "https://api.anthropic.com/v1",
    keyStorageKey: "CLAUDE_API_KEY",
    defaultModel: "claude-sonnet-4-6",
    requiresKey: true,
    models: [
      { id: "claude-opus-4-7", name: "Claude Opus 4.7", description: "Most capable Claude" },
      { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6", description: "Best balance, recommended" },
      { id: "claude-haiku-4-5", name: "Claude Haiku 4.5", description: "Fastest & cheapest" },
      { id: "claude-3-5-sonnet-latest", name: "Claude 3.5 Sonnet", description: "Excellent for code" },
    ],
  },
  openai: {
    id: "openai",
    name: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    keyStorageKey: "OPENAI_API_KEY",
    defaultModel: "gpt-4o-mini",
    requiresKey: true,
    models: [
      { id: "gpt-4o", name: "GPT-4o", description: "Most capable GPT" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", description: "Fast & cheap, recommended" },
      { id: "o1", name: "o1", description: "Best reasoning model" },
      { id: "o1-mini", name: "o1 Mini", description: "Fast reasoning" },
      { id: "o3-mini", name: "o3 Mini", description: "Latest reasoning" },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo", description: "128K context" },
    ],
  },
  mistral: {
    id: "mistral",
    name: "Mistral AI",
    baseUrl: "https://api.mistral.ai/v1",
    keyStorageKey: "MISTRAL_API_KEY",
    defaultModel: "mistral-small-latest",
    requiresKey: true,
    models: [
      { id: "mistral-large-latest", name: "Mistral Large", description: "Most capable Mistral" },
      { id: "mistral-small-latest", name: "Mistral Small", description: "Fast & affordable" },
      { id: "codestral-latest", name: "Codestral", description: "Best for code generation" },
      { id: "open-mixtral-8x22b", name: "Mixtral 8x22B", description: "Large MoE model" },
    ],
  },
  together: {
    id: "together",
    name: "Together AI",
    baseUrl: "https://api.together.xyz/v1",
    keyStorageKey: "TOGETHER_API_KEY",
    defaultModel: "meta-llama/Llama-3-70b-chat-hf",
    requiresKey: true,
    models: [
      { id: "meta-llama/Llama-3-70b-chat-hf", name: "Llama 3 70B", description: "Best open model" },
      { id: "meta-llama/Llama-3-8b-chat-hf", name: "Llama 3 8B", description: "Fast & free-tier friendly" },
      { id: "mistralai/Mixtral-8x22B-Instruct-v0.1", name: "Mixtral 8x22B", description: "Large context" },
      { id: "deepseek-ai/deepseek-r1", name: "DeepSeek R1", description: "Open reasoning model" },
      { id: "Qwen/Qwen2.5-72B-Instruct-Turbo", name: "Qwen 2.5 72B", description: "Excellent reasoning" },
    ],
  },
  deepseek: {
    id: "deepseek",
    name: "DeepSeek",
    baseUrl: "https://api.deepseek.com/v1",
    keyStorageKey: "DEEPSEEK_API_KEY",
    defaultModel: "deepseek-chat",
    requiresKey: true,
    models: [
      { id: "deepseek-chat", name: "DeepSeek Chat (V3)", description: "Best overall, very cheap" },
      { id: "deepseek-coder", name: "DeepSeek Coder", description: "Specialized for code" },
      { id: "deepseek-reasoner", name: "DeepSeek R1", description: "Best reasoning model" },
    ],
  },
  nvidia: {
    id: "nvidia",
    name: "NVIDIA NIM",
    baseUrl: "https://integrate.api.nvidia.com/v1",
    keyStorageKey: "NVIDIA_API_KEY",
    defaultModel: "meta/llama-3.1-70b-instruct",
    requiresKey: true,
    models: [
      { id: "meta/llama-3.1-70b-instruct", name: "Llama 3.1 70B", description: "Best on NVIDIA NIM" },
      { id: "meta/llama-3.1-8b-instruct", name: "Llama 3.1 8B", description: "Fast inference" },
      { id: "mistralai/mixtral-8x22b-instruct-v0.1", name: "Mixtral 8x22B", description: "Large MoE" },
      { id: "microsoft/phi-3.5-mini-instruct", name: "Phi 3.5 Mini", description: "Small but capable" },
    ],
  },
  ollama: {
    id: "ollama",
    name: "Ollama (Local)",
    baseUrl: "http://localhost:11434",
    keyStorageKey: "",
    defaultModel: LOCAL_OLLAMA_MODEL,
    requiresKey: false,
    isLocal: true,
    models: [
      { id: LOCAL_OLLAMA_MODEL, name: "Gemma 2 2B (1.6GB)", description: "Single low-end CPU default" },
    ],
  },
};

const ls = (key: string) =>
  typeof window !== "undefined" ? localStorage.getItem(key)?.trim() || "" : "";

export const getAIConfig = () => ({
  gemini: ls("GEMINI_API_KEY") || (typeof process !== "undefined" ? process.env?.GEMINI_API_KEY || "" : ""),
  groq: ls("GROQ_API_KEY"),
  claude: ls("CLAUDE_API_KEY"),
  openai: ls("OPENAI_API_KEY"),
  mistral: ls("MISTRAL_API_KEY"),
  together: ls("TOGETHER_API_KEY"),
  deepseek: ls("DEEPSEEK_API_KEY"),
  nvidia: ls("NVIDIA_API_KEY"),
  ollamaUrl: ls("OLLAMA_URL") || "http://localhost:11434",

  geminiModel: ls("GEMINI_MODEL") || PROVIDER_CONFIGS.gemini.defaultModel,
  groqModel: ls("GROQ_MODEL") || PROVIDER_CONFIGS.groq.defaultModel,
  claudeModel: ls("CLAUDE_MODEL") || PROVIDER_CONFIGS.claude.defaultModel,
  openaiModel: ls("OPENAI_MODEL") || PROVIDER_CONFIGS.openai.defaultModel,
  mistralModel: ls("MISTRAL_MODEL") || PROVIDER_CONFIGS.mistral.defaultModel,
  togetherModel: ls("TOGETHER_MODEL") || PROVIDER_CONFIGS.together.defaultModel,
  deepseekModel: ls("DEEPSEEK_MODEL") || PROVIDER_CONFIGS.deepseek.defaultModel,
  nvidiaModel: ls("NVIDIA_MODEL") || PROVIDER_CONFIGS.nvidia.defaultModel,
  ollamaModel: ls("OLLAMA_MODEL") || PROVIDER_CONFIGS.ollama.defaultModel,

  primaryProvider: (ls("AI_PROVIDER") as AIProvider) || "gemini",
  fallbackEnabled: ls("AI_FALLBACK") !== "false",
  fallbackChain: ls("AI_FALLBACK_CHAIN")
    ? (JSON.parse(ls("AI_FALLBACK_CHAIN")) as AIProvider[])
    : (["gemini", "groq", "deepseek", "claude", "openai", "mistral", "together", "nvidia", "ollama"] as AIProvider[]),
});

type AIConfig = ReturnType<typeof getAIConfig>;

function languageOutputPolicy(language: string) {
  const lower = language.toLowerCase();
  const roman = lower.includes("roman") || lower.includes("hinglish");

  if (roman) {
    return "Use English alphabet / Latin letters only. Do not use Urdu, Hindi, Arabic, Chinese, Japanese, or Korean script.";
  }

  return "Use the selected language naturally. Do not fall back to English except for technical terms that are clearer in English.";
}

function getMissingProviderReason(provider: AIProvider, cfg: AIConfig) {
  switch (provider) {
    case "gemini":
      return cfg.gemini ? null : "Gemini API key not set";
    case "groq":
      return cfg.groq ? null : "Groq API key not set";
    case "claude":
      return cfg.claude ? null : "Claude API key not set";
    case "openai":
      return cfg.openai ? null : "OpenAI API key not set";
    case "mistral":
      return cfg.mistral ? null : "Mistral API key not set";
    case "together":
      return cfg.together ? null : "Together AI key not set";
    case "deepseek":
      return cfg.deepseek ? null : "DeepSeek API key not set";
    case "nvidia":
      return cfg.nvidia ? null : "NVIDIA API key not set";
    case "ollama":
      return null;
  }
}

type OllamaModelTag = {
  name?: string;
  model?: string;
  details?: {
    family?: string;
    families?: string[];
  };
};

function isUsableOllamaChatModel(model: OllamaModelTag) {
  const name = (model.name || model.model || "").toLowerCase();
  const families = [model.details?.family, ...(model.details?.families || [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return Boolean(name) &&
    !name.includes("embed") &&
    !name.includes("nomic-embed") &&
    !families.includes("bert");
}

function shouldUseOllamaProxy(ollamaUrl: string) {
  try {
    const url = new URL(ollamaUrl);
    return ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  } catch {
    return true;
  }
}

function ollamaApiUrl(ollamaUrl: string, path: "status" | "chat" | "generate" | "ensure-model") {
  if (shouldUseOllamaProxy(ollamaUrl)) {
    return path === "status" ? "/api/ollama/status" : `/api/ollama/${path}`;
  }

  return `${ollamaUrl}/api/${path === "status" ? "tags" : path}`;
}

async function resolveOllamaModel(ollamaUrl: string, configuredModel: string) {
  const requiredModel = LOCAL_OLLAMA_MODEL;
  try {
    const res = await fetch(ollamaApiUrl(ollamaUrl, "status"));
    if (!res.ok) return requiredModel;

    const data = await res.json();
    const installed = ((data.models || []) as OllamaModelTag[])
      .filter(isUsableOllamaChatModel)
      .map((model) => model.name || model.model || "")
      .filter(Boolean);

    if (installed.includes(requiredModel)) return requiredModel;

    const configuredBase = requiredModel.split(":")[0];
    const closeMatch = installed.find((model) => model.split(":")[0] === configuredBase);
    const selected = closeMatch || requiredModel;

    if (selected !== configuredModel && typeof window !== "undefined") {
      localStorage.setItem("OLLAMA_MODEL", selected);
      console.info(`[AI] Ollama is locked to "${requiredModel}". Using "${selected}".`);
    }

    return selected;
  } catch {
    return requiredModel;
  }
}

async function ensureLocalOllamaModel(ollamaUrl: string) {
  if (!shouldUseOllamaProxy(ollamaUrl)) return;

  const res = await fetch(ollamaApiUrl(ollamaUrl, "ensure-model"), { method: "POST" });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || `Install ${LOCAL_OLLAMA_MODEL} with: ollama pull ${LOCAL_OLLAMA_MODEL}`);
  }
}

function extractJson(text: string): string {
  const fence = text.match(/```json\n?([\s\S]*?)\n?```/);
  if (fence) return fence[1].trim();
  const firstBrace = text.indexOf("{");
  const firstBracket = text.indexOf("[");
  if (firstBrace !== -1 || firstBracket !== -1) {
    const start = firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket) ? firstBrace : firstBracket;
    const end = text.lastIndexOf(start === firstBrace ? "}" : "]");
    if (end !== -1) return text.slice(start, end + 1);
  }
  return text;
}

// ─── OpenAI-compatible fetch (Groq, OpenAI, Mistral, Together, DeepSeek, NVIDIA) ───
function buildOpenAICompatBody(
  baseUrl: string,
  model: string,
  messages: { role: string; content: string }[],
  options: { stream?: boolean; jsonMode?: boolean } = {},
) {
  const isGroq = baseUrl.includes("api.groq.com");
  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: 0.25,
    top_p: 0.9,
  };

  if (options.stream) body.stream = true;
  if (options.jsonMode) body.response_format = { type: "json_object" };

  if (isGroq) body.max_completion_tokens = 16384;
  else body.max_tokens = 8192;

  return body;
}

async function fetchOpenAICompat(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[],
  jsonMode = false,
  extraHeaders: Record<string, string> = {}
): Promise<string> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...extraHeaders,
    },
    body: JSON.stringify(buildOpenAICompatBody(baseUrl, model, messages, { jsonMode })),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`${baseUrl} error ${res.status}: ${errText}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

// ─── OpenAI-compatible streaming ───
async function* streamOpenAICompat(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[],
  extraHeaders: Record<string, string> = {}
): AsyncGenerator<string> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...extraHeaders,
    },
    body: JSON.stringify(buildOpenAICompatBody(baseUrl, model, messages, { stream: true })),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`${baseUrl} stream error ${res.status}: ${errText || res.statusText}`);
  }
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      const trimmed = line.replace(/^data: /, "").trim();
      if (!trimmed || trimmed === "[DONE]") continue;
      try {
        const json = JSON.parse(trimmed);
        const chunk = json.choices?.[0]?.delta?.content;
        if (chunk) yield chunk;
      } catch { /* skip malformed */ }
    }
  }
}

// ─── Single provider execution (JSON structured) ───
async function executeAIProvider(
  provider: AIProvider,
  prompt: string,
  schema: unknown,
  type: "object" | "array"
): Promise<string> {
  const cfg = getAIConfig();
  const jsonInstruction = `\n\nReturn ONLY raw JSON (${type}). No markdown fences, no explanation.`;

  switch (provider) {
    case "gemini": {
      const ai = new GoogleGenAI({ apiKey: cfg.gemini });
      const res = await ai.models.generateContent({
        model: cfg.geminiModel,
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: schema as never },
      });
      return res.text || "";
    }

    case "groq":
      if (!cfg.groq) throw new Error("Groq API key not set");
      return fetchOpenAICompat(
        "https://api.groq.com/openai/v1",
        cfg.groq, cfg.groqModel,
        [{ role: "user", content: prompt + jsonInstruction }],
        true
      );

    case "claude": {
      if (!cfg.claude) throw new Error("Claude API key not set");
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": cfg.claude,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: cfg.claudeModel,
          max_tokens: 4096,
          messages: [{ role: "user", content: prompt + jsonInstruction }],
        }),
      });
      if (!res.ok) throw new Error(`Claude error ${res.status}: ${await res.text()}`);
      const data = await res.json();
      return extractJson(data.content?.[0]?.text || "");
    }

    case "openai":
      if (!cfg.openai) throw new Error("OpenAI API key not set");
      return fetchOpenAICompat(
        "https://api.openai.com/v1",
        cfg.openai, cfg.openaiModel,
        [{ role: "user", content: prompt + jsonInstruction }],
        true
      );

    case "mistral":
      if (!cfg.mistral) throw new Error("Mistral API key not set");
      return fetchOpenAICompat(
        "https://api.mistral.ai/v1",
        cfg.mistral, cfg.mistralModel,
        [{ role: "user", content: prompt + jsonInstruction }],
        true
      );

    case "together":
      if (!cfg.together) throw new Error("Together AI key not set");
      return fetchOpenAICompat(
        "https://api.together.xyz/v1",
        cfg.together, cfg.togetherModel,
        [{ role: "user", content: prompt + jsonInstruction }],
        true
      );

    case "deepseek":
      if (!cfg.deepseek) throw new Error("DeepSeek API key not set");
      return fetchOpenAICompat(
        "https://api.deepseek.com/v1",
        cfg.deepseek, cfg.deepseekModel,
        [{ role: "user", content: prompt + jsonInstruction }],
        true
      );

    case "nvidia":
      if (!cfg.nvidia) throw new Error("NVIDIA API key not set");
      return fetchOpenAICompat(
        "https://integrate.api.nvidia.com/v1",
        cfg.nvidia, cfg.nvidiaModel,
        [{ role: "user", content: prompt + jsonInstruction }],
        false
      ).then(extractJson);

    case "ollama": {
      await ensureLocalOllamaModel(cfg.ollamaUrl);
      const model = await resolveOllamaModel(cfg.ollamaUrl, cfg.ollamaModel);
      const res = await fetch(ollamaApiUrl(cfg.ollamaUrl, "generate"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          prompt: prompt + jsonInstruction,
          stream: false,
          format: "json",
          options: { temperature: 0.2, num_ctx: 4096, num_predict: 1024, num_thread: 4 },
        }),
      });
      if (!res.ok) {
        const errorBody = await res.text().catch(() => "");
        throw new Error(`Ollama error ${res.status}${errorBody ? `: ${errorBody}` : ""}`);
      }
      const data = await res.json();
      return data.response || "";
    }

    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

// ─── Streaming: yields text chunks ───
async function* streamProviderContent(
  messages: { role: string; content: string }[],
  provider: AIProvider
): AsyncGenerator<string> {
  const cfg = getAIConfig();

  switch (provider) {
    case "gemini": {
      const ai = new GoogleGenAI({ apiKey: cfg.gemini });
      const lastMsg = messages[messages.length - 1].content;
      const systemMsg = messages.find((m) => m.role === "system")?.content || "";
      const stream = await ai.models.generateContentStream({
        model: cfg.geminiModel,
        contents: lastMsg,
        config: systemMsg ? { systemInstruction: systemMsg } : undefined,
      });
      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) yield text;
      }
      break;
    }

    case "groq":
      if (!cfg.groq) throw new Error("Groq API key not set");
      yield* streamOpenAICompat("https://api.groq.com/openai/v1", cfg.groq, cfg.groqModel, messages);
      break;

    case "claude": {
      if (!cfg.claude) throw new Error("Claude API key not set");
      const systemMsg = messages.find((m) => m.role === "system");
      const userMsgs = messages.filter((m) => m.role !== "system");
      const body: Record<string, unknown> = {
        model: cfg.claudeModel,
        max_tokens: 4096,
        stream: true,
        messages: userMsgs,
      };
      if (systemMsg) body.system = systemMsg.content;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": cfg.claude,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Claude stream error ${res.status}`);
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() || "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const ev = JSON.parse(line.slice(6));
              if (ev.type === "content_block_delta") yield ev.delta?.text || "";
            } catch { /* skip */ }
          }
        }
      }
      break;
    }

    case "openai":
      if (!cfg.openai) throw new Error("OpenAI API key not set");
      yield* streamOpenAICompat("https://api.openai.com/v1", cfg.openai, cfg.openaiModel, messages);
      break;

    case "mistral":
      if (!cfg.mistral) throw new Error("Mistral API key not set");
      yield* streamOpenAICompat("https://api.mistral.ai/v1", cfg.mistral, cfg.mistralModel, messages);
      break;

    case "together":
      if (!cfg.together) throw new Error("Together AI key not set");
      yield* streamOpenAICompat("https://api.together.xyz/v1", cfg.together, cfg.togetherModel, messages);
      break;

    case "deepseek":
      if (!cfg.deepseek) throw new Error("DeepSeek API key not set");
      yield* streamOpenAICompat("https://api.deepseek.com/v1", cfg.deepseek, cfg.deepseekModel, messages);
      break;

    case "nvidia":
      if (!cfg.nvidia) throw new Error("NVIDIA API key not set");
      yield* streamOpenAICompat("https://integrate.api.nvidia.com/v1", cfg.nvidia, cfg.nvidiaModel, messages);
      break;

    case "ollama": {
      await ensureLocalOllamaModel(cfg.ollamaUrl);
      const model = await resolveOllamaModel(cfg.ollamaUrl, cfg.ollamaModel);
      const res = await fetch(ollamaApiUrl(cfg.ollamaUrl, "chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
          options: { temperature: 0.2, num_ctx: 4096, num_predict: 768, num_thread: 4 },
        }),
      });
      if (!res.ok) {
        const errorBody = await res.text().catch(() => "");
        throw new Error(`Ollama stream error ${res.status}${errorBody ? `: ${errorBody}` : ""}`);
      }
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() || "";
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const ev = JSON.parse(line);
            if (ev.message?.content) yield ev.message.content;
          } catch { /* skip */ }
        }
      }
      break;
    }
  }
}

// ─── Fallback chain executor ───
export async function* streamContent(
  messages: { role: string; content: string }[],
  provider?: AIProvider
): AsyncGenerator<string> {
  const cfg = getAIConfig();

  if (provider) {
    yield* streamProviderContent(messages, provider);
    return;
  }

  const chain = cfg.fallbackEnabled
    ? [cfg.primaryProvider, ...cfg.fallbackChain.filter((p) => p !== cfg.primaryProvider)]
    : [cfg.primaryProvider];

  let lastError: Error | null = null;
  for (const currentProvider of chain) {
    try {
      const missingReason = getMissingProviderReason(currentProvider, cfg);
      if (missingReason) {
        lastError = new Error(missingReason);
        if (!cfg.fallbackEnabled) break;
        continue;
      }

      let receivedAnyChunk = false;
      for await (const chunk of streamProviderContent(messages, currentProvider)) {
        receivedAnyChunk = true;
        yield chunk;
      }
      if (receivedAnyChunk) return;
      throw new Error(`${PROVIDER_CONFIGS[currentProvider].name} returned an empty response`);
    } catch (err: unknown) {
      lastError = err as Error;
      console.warn(`[AI] ${currentProvider} stream failed:`, lastError.message);
      if (!cfg.fallbackEnabled) break;
    }
  }

  throw new Error(`All providers failed: ${lastError?.message || "No provider returned content"}`);
}

async function executeWithFallback(
  prompt: string,
  schema: unknown,
  type: "object" | "array"
): Promise<string> {
  const cfg = getAIConfig();
  const chain = cfg.fallbackEnabled
    ? [cfg.primaryProvider, ...cfg.fallbackChain.filter((p) => p !== cfg.primaryProvider)]
    : [cfg.primaryProvider];

  let lastError: Error | null = null;
  for (const provider of chain) {
    try {
      const missingReason = getMissingProviderReason(provider, cfg);
      if (missingReason) {
        lastError = new Error(missingReason);
        if (!cfg.fallbackEnabled) break;
        continue;
      }

      return await executeAIProvider(provider, prompt, schema, type);
    } catch (err: unknown) {
      lastError = err as Error;
      console.warn(`[AI] ${provider} failed:`, lastError.message);
      if (!cfg.fallbackEnabled) break;
    }
  }
  throw new Error(`All AI providers failed. Last: ${lastError?.message}`);
}

// ─── Test connection for a provider ───
export async function testProviderConnection(provider: AIProvider): Promise<{ ok: boolean; message: string }> {
  try {
    const messages = [{ role: "user", content: 'Reply with exactly: {"ok":true}' }];
    let result = "";
    for await (const chunk of streamContent(messages, provider)) {
      result += chunk;
      if (result.length > 200) break;
    }
    return { ok: true, message: "Connected successfully" };
  } catch (err: unknown) {
    return { ok: false, message: (err as Error).message };
  }
}

// ─── Fetch available Ollama models from local server ───
export async function fetchOllamaModels(): Promise<string[]> {
  const cfg = getAIConfig();
  try {
    const res = await fetch(ollamaApiUrl(cfg.ollamaUrl, "status"));
    if (!res.ok) return [];
    const data = await res.json();
    return (data.models || [])
      .map((m: { name: string }) => m.name)
      .filter((name: string) => name === LOCAL_OLLAMA_MODEL || name.split(":")[0] === LOCAL_OLLAMA_MODEL.split(":")[0]);
  } catch {
    return [];
  }
}

// ─── Generate interview plan ───
export async function generateInterviewPlan(
  jd: string,
  resume: string,
  days: number,
  language = "English"
): Promise<AIPlanResponse> {
  const targetQuestions = days === 7 ? 150 : days === 15 ? 400 : days === 30 ? 1000 : 50;

  const prompt = `You are Zynapse, a Beast-Mode Senior Technical Interviewer for top-tier tech companies.
Analyze the following Job Description and Resume, and create a comprehensive advanced interview preparation plan for a ${days}-day timeline.

JD: ${jd}
Resume: ${resume || "No resume provided. Base plan purely on JD."}
Timeline: ${days} days
Target: ~${targetQuestions} questions total. Generate the FIRST BATCH of up to 30 advanced questions.

RULES:
- Questions must be advanced level (architectural, optimization, low-level constraints)
- 3-line concise definition per question
- Key points array (4-6 items)
- Real-life scenario (universal: Stripe, Uber, Netflix, not generic examples)
- Full output in ${language}
- ${languageOutputPolicy(language)}

Return JSON only.`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      planTitle: { type: Type.STRING },
      overview: { type: Type.STRING },
      schedule: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: { day: { type: Type.STRING }, description: { type: Type.STRING } },
          required: ["day", "description"],
        },
      },
      detailedQuestions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            definition: { type: Type.STRING },
            keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            scenario: { type: Type.STRING },
          },
          required: ["question", "definition", "keyPoints", "scenario"],
        },
      },
    },
    required: ["planTitle", "overview", "schedule", "detailedQuestions"],
  };

  const text = await executeWithFallback(prompt, schema, "object");
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("AI response was not valid JSON.");
  }
}

// ─── Load more interview questions ───
export async function loadMorePlanQuestions(
  jd: string,
  resume: string,
  days: number,
  currentCount: number,
  language = "English"
): Promise<AIDetailedQuestion[]> {
  const prompt = `You are Zynapse. We are generating an advanced interview prep for a ${days}-day timeline.
Already generated: ${currentCount} questions. Generate the NEXT BATCH of 30 advanced questions.

JD: ${jd}
Resume: ${resume || "Based on JD only"}

RULES: Advanced only, no repetition, universal real-life scenarios (Stripe/Uber/Netflix scale), output in ${language}.
${languageOutputPolicy(language)}
Return JSON array only.`;

  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING },
        definition: { type: Type.STRING },
        keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
        scenario: { type: Type.STRING },
      },
      required: ["question", "definition", "keyPoints", "scenario"],
    },
  };

  const text = await executeWithFallback(prompt, schema, "array");
  try {
    return JSON.parse(text);
  } catch {
    return [];
  }
}

// ─── Chat session (multi-turn) ───
export class ChatSessionAdapter {
  private history: { role: string; content: string }[] = [];

  constructor(language: string) {
    this.history.push({
      role: "system",
      content: `You are Zynapse, a Staff+ level Software Engineering Mentor and practical curriculum guide.

Respond in ${language}. ${languageOutputPolicy(language)}
Keep technical keywords in English in parentheses when translation may confuse the learner.

Your job is to teach deeply enough that the learner can move forward without opening another tutorial. For every explanation:
- Start from the learner's likely gap and define key terms.
- Explain WHY the concept matters, HOW it works, WHEN to use it, and WHEN not to use it.
- Use practical examples, runnable code/config where relevant, diagrams/tables when helpful, and real-world production context.
- Mention common mistakes, debugging tips, performance/security trade-offs, and interview angles when relevant.
- If the topic is C/C++/systems, cover memory, compilation, undefined behavior, pointers/references, and debugging carefully.
- If the topic is AI/ML, cover intuition, data flow, evaluation, failure modes, and implementation notes.
- If the user asks for a short answer, answer short; otherwise prefer complete, structured teaching.
- Be encouraging, but avoid filler. Be precise, complete, and senior-mentor practical.`,
    });
  }

  async sendMessage(params: { message: string }): Promise<{ text: string }> {
    this.history.push({ role: "user", content: params.message });
    const cfg = getAIConfig();
    const chain = cfg.fallbackEnabled
      ? [cfg.primaryProvider, ...cfg.fallbackChain.filter((p) => p !== cfg.primaryProvider)]
      : [cfg.primaryProvider];

    let lastError: Error | null = null;
    for (const provider of chain) {
      try {
        let text = "";
        for await (const chunk of streamContent(this.history, provider as AIProvider)) {
          text += chunk;
        }
        if (!text) throw new Error("Empty response");
        this.history.push({ role: "assistant", content: text });
        return { text };
      } catch (err: unknown) {
        lastError = err as Error;
        if (!cfg.fallbackEnabled) break;
      }
    }
    throw new Error(`All providers failed: ${lastError?.message}`);
  }

  async *sendMessageStream(message: string): AsyncGenerator<string> {
    this.history.push({ role: "user", content: message });
    let fullText = "";
    for await (const chunk of streamContent(this.history)) {
      fullText += chunk;
      yield chunk;
    }
    this.history.push({ role: "assistant", content: fullText });
  }
}

export function createChatSession(language = "English") {
  return new ChatSessionAdapter(language);
}
