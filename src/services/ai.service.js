const { GoogleGenerativeAI } = require("@google/genai");

const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const MAX_OUTPUT_TOKENS = Number(process.env.AI_MAX_OUTPUT_TOKENS || 300);

function buildPrompt({ lang, mode, question, lessonSnippet }) {
  const isRu = lang === "ru";

  const system = isRu
    ? "Ты доброжелательный помощник для детей. Пиши простыми словами, коротко и безопасно."
    : "Сен балаларға арналған көмекшісің. Қарапайым, қысқа және қауіпсіз түрде жауап бер.";

  let task;
  if (mode === "explain") {
    task = isRu
      ? `Объясни вопрос ребёнку простыми словами: ${question}`
      : `Сұрақты балаға қарапайым тілмен түсіндір: ${question}`;
  } else if (mode === "hint") {
    task = isRu
      ? `Дай подсказку без прямого ответа: ${question}`
      : `Дәл жауап бермей, ишара/кеңес бер: ${question}`;
  } else {
    // quiz
    task = isRu
      ? `Сделай мини-викторину (3 вопроса) по уроку и в конце попроси ответить 1/2/3: ${question}`
      : `Сабақ бойынша 3 сұрақтан тұратын шағын викторина жаса да соңында 1/2/3 деп жауап беруін сұра: ${question}`;
  }

  return `${system}

Контекст урока (кратко):
${lessonSnippet}

Задание:
${task}

Правила безопасности:
- Не проси личные данные (имя, адрес, телефон).
- Никаких опасных инструкций.
- Если вопрос не по уроку — мягко верни к теме.
`;
}

async function help({ topicId, lang, mode, question, lessonSnippet }) {
  if (!process.env.GEMINI_API_KEY) {
    return { answer: "AI временно недоступен (нет ключа).", blocked: true, fallback: true };
  }

  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const prompt = buildPrompt({ lang, mode, question, lessonSnippet });

  // В @google/genai делаем generateContent через модель
  const model = client.getGenerativeModel({ model: MODEL });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      temperature: Number(process.env.AI_TEMPERATURE || 0.4),
    },
  });

  const text =
    result?.response?.candidates?.[0]?.content?.parts?.map(p => p.text).join("") ||
    result?.response?.text?.() ||
    "Не удалось получить ответ.";

  return { answer: text, blocked: false };
}

module.exports = { help };