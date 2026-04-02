export default async function handler(req, res) {
  // =========================
  // CORS FIX (IMPORTANT)
  // =========================
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // =========================
  // HEALTH CHECK
  // =========================
  if (req.method !== "POST") {
    return res.status(200).json({ message: "API is working. Use POST request." });
  }

  const { message } = req.body || {};

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // =========================
    // CALL OPENAI
    // =========================
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful tax assistant." },
          { role: "user", content: message }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    // =========================
    // HANDLE OPENAI ERRORS
    // =========================
    if (!response.ok) {
      return res.status(500).json({
        error: data?.error?.message || "OpenAI API error",
        full: data
      });
    }

    const reply = data?.choices?.[0]?.message?.content;

    return res.status(200).json({
      reply: reply || "No response generated"
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message || "Server error"
    });
  }
}
