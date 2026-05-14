import { isHostedProvider, runHostedProvider } from "./_shared.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { provider, prompt, schema, type, model, key } = req.body || {};
    if (!isHostedProvider(provider)) {
      return res.status(400).json({ error: "Only Gemini and Groq are available through the hosted proxy." });
    }
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "prompt is required" });
    }

    const jsonInstruction = `\n\nReturn ONLY raw JSON (${type === "array" ? "array" : "object"}). No markdown fences, no explanation.`;
    const result = await runHostedProvider({
      provider,
      messages: [{ role: "user", content: prompt + jsonInstruction }],
      model,
      key,
      jsonMode: true,
      schema,
    });
    return res.status(200).json({ ok: true, ...result });
  } catch (error) {
    return res.status(502).json({ ok: false, error: error instanceof Error ? error.message : "AI request failed" });
  }
}

