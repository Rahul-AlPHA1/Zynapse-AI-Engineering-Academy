import { isHostedProvider, runHostedProvider } from "./_shared.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { provider, messages, model, key } = req.body || {};
    if (!isHostedProvider(provider)) {
      return res.status(400).json({ error: "Only Gemini and Groq are available through the hosted proxy." });
    }
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages are required" });
    }

    const result = await runHostedProvider({ provider, messages, model, key });
    return res.status(200).json({ ok: true, ...result });
  } catch (error) {
    return res.status(502).json({ ok: false, error: error instanceof Error ? error.message : "AI request failed" });
  }
}

