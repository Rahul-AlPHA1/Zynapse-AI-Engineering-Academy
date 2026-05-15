export const config = { maxDuration: 10 };

export default function handler(_req, res) {
  res.status(200).json({
    ok: true,
    providers: {
      gemini: Boolean((process.env.GEMINI_API_KEY || "").trim()),
      groq: Boolean((process.env.GROQ_API_KEY || "").trim()),
    },
  });
}

