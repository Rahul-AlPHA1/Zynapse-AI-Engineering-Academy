const PROVIDER_NAMES = { gemini: "Google Gemini", groq: "Groq" };
const DEFAULT_MODELS = { gemini: "gemini-2.5-flash", groq: "llama-3.3-70b-versatile" };
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

async function callGemini(key, model, messages, schema) {
  const systemText = messages.filter(m => m.role === "system").map(m => m.content).join("\n\n");
  const contents = messages
    .filter(m => m.role !== "system")
    .map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
  const generationConfig = { temperature: 0.25, responseMimeType: "application/json" };
  if (schema) generationConfig.responseSchema = schema;
  const body = { contents, generationConfig };
  if (systemText) body.systemInstruction = { parts: [{ text: systemText }] };
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${key}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
  );
  const text = await res.text();
  if (!res.ok) throw new Error(upstreamMsg("gemini", res.status, text));
  const data = text ? JSON.parse(text) : {};
  return (data?.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("");
}

async function callGroq(key, model, messages) {
  const body = { model, messages, temperature: 0.25, top_p: 0.9, max_completion_tokens: 8192, response_format: { type: "json_object" } };
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(upstreamMsg("groq", res.status, text));
  const data = text ? JSON.parse(text) : {};
  return data.choices?.[0]?.message?.content || "";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { provider, prompt, schema, type, model, key } = req.body || {};
    if (!isHostedProvider(provider))
      return res.status(400).json({ error: "Only Gemini and Groq are supported." });
    if (!prompt || typeof prompt !== "string")
      return res.status(400).json({ error: "prompt is required" });

    const { key: k, source } = resolveKey(provider, key);
    if (!k) throw new Error(`${ENV_KEYS[provider]} is not configured. Add it in Vercel env vars or AI Provider Settings.`);

    const m = typeof model === "string" && model.trim() ? model.trim() : DEFAULT_MODELS[provider];
    const jsonInstruction = `\n\nReturn ONLY raw JSON (${type === "array" ? "array" : "object"}). No markdown fences, no explanation.`;
    const messages = [{ role: "user", content: prompt + jsonInstruction }];
    const text = provider === "gemini" ? await callGemini(k, m, messages, schema) : await callGroq(k, m, messages);
    return res.status(200).json({ ok: true, text, provider, model: m, keySource: source });
  } catch (err) {
    return res.status(502).json({ ok: false, error: err instanceof Error ? err.message : "AI request failed" });
  }
}
