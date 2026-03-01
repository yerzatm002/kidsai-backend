const prisma = require('../utils/prisma');
const { ai, google } = require('../utils/gemini');
const { buildPrompt } = require('./aiPrompt.service');
const { containsPII, redactPII } = require('../utils/pii');
const { recordAIRequest } = require('./aiRequest.service'); // для ачивки AI_EXPLORER

function getFallback(lang) {
  if (lang === 'kz') {
    return [
      'Мен қазір уақытша қолжетімсізбін. Мынадай тәсіл жасап көр:',
      '1) Тақырыптағы негізгі ұғымды ата.',
      '2) 1–2 сөйлеммен өз сөзіңмен түсіндір.',
      '3) Мысал келтір.',
    ].join('\n');
  }
  return [
    'Я временно недоступен. Попробуй так:',
    '1) Назови ключевое понятие темы.',
    '2) Объясни его 1–2 предложениями своими словами.',
    '3) Приведи пример.',
  ].join('\n');
}

async function getTopicContext(topicId, lang) {
  // MVP: берём Topic + первый Lesson (если есть). Можно расширить под lessonId.
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: {
      lessons: { orderBy: { orderIndex: 'asc' }, take: 1 },
    },
  });
  if (!topic) return null;

  const isRu = lang === 'ru';
  const lesson = topic.lessons?.[0];

  return {
    topicTitle: isRu ? topic.titleRu : topic.titleKz,
    topicDesc: isRu ? topic.descriptionRu : topic.descriptionKz,
    lessonContext: lesson ? (isRu ? lesson.contentRu : lesson.contentKz) : '',
  };
}

async function help({ userId, topicId, mode, lang, question }) {
  // 1) PII check
  if (containsPII(question)) {
    const err = new Error(lang === 'kz'
      ? 'Жеке деректерді (телефон/email/құжат) жібермеңіз. Сұрақты жеке дерексіз қайта жазыңыз.'
      : 'Не отправляйте персональные данные (телефон/email/документы). Переформулируйте вопрос без них.');
    err.statusCode = 400;
    throw err;
  }

  // 2) контекст по теме
  const ctx = await getTopicContext(topicId, lang);
  if (!ctx) {
    const err = new Error('Topic not found');
    err.statusCode = 404;
    throw err;
  }

  const safeQuestion = redactPII(question);
  const prompt = buildPrompt({
    lang,
    mode,
    ...ctx,
    question: safeQuestion,
  });

  // 3) safety settings + генерация (пример передачи config показан в cookbook) :contentReference[oaicite:5]{index=5}
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const maxOutputTokens = Number(process.env.AI_MAX_OUTPUT_TOKENS || 300);
  const temperature = Number(process.env.AI_TEMPERATURE || 0.4);

  const safetySettings = [
    { category: google.HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: google.HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
    { category: google.HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: google.HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
    { category: google.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: google.HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
    { category: google.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: google.HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
    // опционально:
    { category: google.HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY, threshold: google.HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
  ];

  // 4) логируем запрос (опционально)
  const log = await prisma.aIRequestLog.create({
    data: { userId, topicId, mode, lang, question: safeQuestion, prompt },
  });

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        safetySettings,
        maxOutputTokens,
        temperature,
      },
    });

    // Safety: если candidate.finishReason === SAFETY, response.text будет пустым (cookbook) :contentReference[oaicite:6]{index=6}
    const finishReason = response?.candidates?.[0]?.finishReason;
    const text = response?.text || '';

    const blocked = finishReason === 'SAFETY' || !text.trim();
    const finalText = blocked ? getFallback(lang) : text;

    await prisma.aIRequestLog.update({
      where: { id: log.id },
      data: { response: finalText, blocked },
    });

    // 5) учитываем для ачивки (AI_EXPLORER)
    await recordAIRequest(userId);

    return { answer: finalText, blocked };
  } catch (e) {
    await prisma.aIRequestLog.update({
      where: { id: log.id },
      data: { error: String(e?.message || e) },
    });

    // fallback при недоступности/ошибке
    await recordAIRequest(userId);
    return { answer: getFallback(lang), blocked: true, fallback: true };
  }
}

module.exports = { help };