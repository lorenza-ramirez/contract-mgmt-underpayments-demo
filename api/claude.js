// Vercel serverless function: relays requests to the Anthropic API so the key stays on the server.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: "ANTHROPIC_API_KEY is not set" });
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { system, messages } = body || {};
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, system, messages }),
    });
    const text = await upstream.text();
    res.status(upstream.status).setHeader("content-type", "application/json").send(text);
  } catch (e) {
    res.status(500).json({ error: String(e && e.message ? e.message : e) });
  }
}
