
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text, action } = req.body || {};

    if (!text || typeof text !== "string" || text.length > 20000) {
      return res.status(400).json({
        error: "Text is required and must be under 20,000 characters.",
      });
    }

    const prompts = {
      summarize: `Summarize these student notes in clear English. Use headings, key points, and a short revision summary:\n\n${text}`,
      explain: `Explain this topic to a college student in simple language, with an example:\n\n${text}`,
      quiz: `Create 5 multiple-choice questions from these notes. Give four options per question, the correct answer, and a brief explanation:\n\n${text}`,
    };

    if (!prompts[action]) {
      return res.status(400).json({ error: "Invalid study tool." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "AI server key is not configured." });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompts[action] }] }],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data);
      return res.status(502).json({ error: "AI service request failed." });
    }

    const result = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("\n");

    if (!result) {
      return res.status(502).json({ error: "AI returned an empty response." });
    }

    return res.status(200).json({ result });
  } catch (error) {
    console.error("AI endpoint error:", error);
    return res.status(500).json({ error: "Something went wrong." });
  }
}
