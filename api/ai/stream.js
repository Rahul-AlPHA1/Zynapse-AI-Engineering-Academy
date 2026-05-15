export const config = { maxDuration: 60 };

const PROVIDER_NAMES = { gemini: "Google Gemini", groq: "Groq" };
const DEFAULT_MODELS = { gemini: "gemini-2.5-flash", groq: "llama-3.1-8b-instant" };
const ENV_KEYS = { gemini: "GEMINI_API_KEY", groq: "GROQ_API_KEY" };

function isHostedProvider(p) { return p === "gemini" || p === "groq"; }

function resolveKey(provider, suppliedKey) {
  const user = typeof suppliedKey === "string" ? suppliedKey.trim() : "";
  return { key: user || (process.env[ENV_KEYS[provider]] || "").trim(), source: user ? "user" : "hosted" };
}

function upstreamMsg(provider, status, body) {
  const limited = status === 401 || status === 403 || status === 429;
  const hint = limited
    ? `${PROVIDER_NAMES[provider]} key is unavailable or quota-limited. Add your own ${ENV_KEYS[provider]} in AI Provider Settings.`
    : `${PROVIDER_NAMES[provider]} request failed.`;
  return `${hint}${body ? ` Upstream: ${body.slice(0, 800)}` : ""}`;
}

function buildGeminiBody(messages) {
  const systemText = messages.filter(m => m.role === "system").map(m => m.content).join("\n\n");
  const contents = messages
    .filter(m => m.role !== "system")
    .map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
  const body = {
    contents,
    generationConfig: {
      temperature: 0.25,
      maxOutputTokens: 4096,
    },
  };
  if (systemText) body.systemInstruction = { parts: [{ text: systemText }] };
  return body;
}

function writeStreamHeaders({ provider, source, res }) {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("X-Zynapse-Provider", provider);
  res.setHeader("X-Zynapse-Key-Source", source);
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();
}

async function streamGemini({ key, model, messages, source, res }) {
  const upstream = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse&key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildGeminiBody(messages)),
    }
  );
  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => upstream.statusText);
    throw new Error(upstreamMsg("gemini", upstream.status, text));
  }

  writeStreamHeaders({ provider: "gemini", source, res });
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      try {
        const json = JSON.parse(trimmed.slice(5).trim());
        const parts = json?.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.text) res.write(part.text);
        }
      } catch {
        // Skip keep-alive or malformed SSE fragments.
      }
    }
  }
}

async function streamGroq({ key, model, messages, source, res }) {
  const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.25,
      top_p: 0.9,
      max_completion_tokens: 2048,
      stream: true,
    }),
  });
  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => upstream.statusText);
    throw new Error(upstreamMsg("groq", upstream.status, text));
  }

  writeStreamHeaders({ provider: "groq", source, res });
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      const trimmed = line.replace(/^data:\s*/, "").trim();
      if (!trimmed || trimmed === "[DONE]") continue;
      try {
        const json = JSON.parse(trimmed);
        const chunk = json.choices?.[0]?.delta?.content;
        if (chunk) res.write(chunk);
      } catch {
        // Skip malformed SSE fragments.
      }
    }
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { provider, messages, model, key } = req.body || {};
    if (!isHostedProvider(provider))
      return res.status(400).json({ error: "Only Gemini and Groq are supported." });
    if (!Array.isArray(messages) || messages.length === 0)
      return res.status(400).json({ error: "messages are required" });

    const { key: k, source } = resolveKey(provider, key);
    if (!k) throw new Error(`${ENV_KEYS[provider]} is not configured. Add it in Vercel env vars or AI Provider Settings.`);

    const m = typeof model === "string" && model.trim() ? model.trim() : DEFAULT_MODELS[provider];
    if (provider === "gemini") await streamGemini({ key: k, model: m, messages, source, res });
    else await streamGroq({ key: k, model: m, messages, source, res });
    return res.end();
  } catch (err) {
    if (res.headersSent) {
      return res.end();
    }
    return res.status(502).json({ ok: false, error: err instanceof Error ? err.message : "AI stream failed" });
  }
}
