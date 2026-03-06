const { GoogleGenAI } = require("@google/genai");

const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const MAX_OUTPUT_TOKENS = Number(process.env.AI_MAX_OUTPUT_TOKENS || 300);

async function help({ lang, mode, question, lessonSnippet }) {
  if (!process.env.GEMINI_API_KEY) {
    return { answer: "AI временно недоступен.", blocked: true, fallback: true };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `Ты детский помощник.
Язык: ${lang}
Режим: ${mode}
Контекст урока: ${lessonSnippet}
Вопрос: ${question}`;

  const resp = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      temperature: Number(process.env.AI_TEMPERATURE || 0.4),
    },
  });

  const text =
    resp?.candidates?.[0]?.content?.parts?.map(p => p.text).join("") ||
    "Не удалось получить ответ.";

  return { answer: text, blocked: false };
}

module.exports = { help };