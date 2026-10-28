
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Only POST requests are allowed." });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "GEMINI_API_KEY is missing from Vercel environment variables.",
    });
  }

  const { mode, text = "", file } = req.body || {};

  const instructions = {
    summarize:
      "Read the supplied notes or document carefully. Create clear revision notes with the main idea, key points, definitions, examples and a short revision tip.",
    explain:
      "Read the supplied material carefully. Explain it step by step in simple language, define technical terms, give examples and finish with a short recap.",
    quiz:
      "Read the supplied material carefully. Create 8 exam-practice questions, including MCQs and short-answer questions. Provide correct answers and brief explanations in a separate answer key.",
  };

  if (!Object.hasOwn(instructions, mode)) {
    return res.status(400).json({ error: "Unsupported study tool mode." });
  }

  if (typeof text !== "string" || text.length > 30000) {
    return res.status(400).json({
      error: "Text must be 30,000 characters or less.",
    });
  }

  if (!text.trim() && !file) {
    return res.status(400).json({
      error: "Enter notes or upload a photo/PDF.",
    });
  }

  if (file) {
    if (
      typeof file.data !== "string" ||
      !["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "application/pdf"].includes(file.mimeType)
    ) {
      return res.status(400).json({
        error: "Unsupported file. Upload a JPG, PNG, WEBP, HEIC or PDF.",
      });
    }

    if (file.data.length > 14_000_000) {
      return res.status(413).json({
        error: "File is too large to process. Try a smaller file under 10 MB.",
      });
    }
  }

  const parts = [
    {
      text:
        instructions[mode] +
        "\n\nUse only the provided material as the source. If any text is unreadable, say so instead of guessing." +
        (text.trim() ? "\n\nUser's notes or topic:\n" + text.trim() : ""),
    },
  ];

  if (file) {
    parts.push({
      inline_data: {
        mime_type: file.mimeType,
        data: file.data,
      },
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", response.status, data);

      return res.status(response.status === 429 || response.status === 503 ? 503 : 502).json({
        error:
          response.status === 429
            ? "Gemini request limit reached. Wait and try again."
            : response.status === 503
              ? "Gemini is busy right now. Please try again shortly."
              : response.status === 404
                ? "Gemini model is unavailable. Check the model name and API access."
                : response.status === 401 || response.status === 403
                  ? "Gemini API key or project access is invalid."
                  : "Gemini could not process the request. Check Vercel Runtime Logs.",
      });
    }

    const result = (data.candidates?.[0]?.content?.parts || [])
      .map((part) => part.text || "")
      .join("\n")
      .trim();

    if (!result) {
      return res.status(502).json({
        error: "Gemini returned no text. Please try again.",
      });
    }

    return res.status(200).json({ result });
  } catch (error) {
    console.error("CampusFlow AI error:", error);

    return res.status(error.name === "AbortError" ? 504 : 500).json({
      error:
        error.name === "AbortError"
          ? "AI took too long to respond. Try a smaller file or try again."
          : "Could not connect to Gemini. Please try again.",
    });
  } finally {
    clearTimeout(timeout);
  }
}
