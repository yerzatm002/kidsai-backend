function clip(text, maxLen = 1800) {
  const t = String(text || '');
  return t.length > maxLen ? t.slice(0, maxLen) + '…' : t;
}

function buildPrompt({ lang, mode, topicTitle, topicDesc, lessonContext, question }) {
  const isRu = lang === 'ru';

  const system = isRu
    ? `Ты безопасный детский помощник по обучению. 
Объясняй просто, дружелюбно и короткими шагами.
Не проси и не повторяй персональные данные (телефон, адрес, почта, документы).
Если вопрос опасный или взрослый — вежливо откажись и предложи безопасную альтернативу.`
    : `Сен қауіпсіз балаларға арналған оқу көмекшісісің.
Қарапайым, жылы тілмен, қысқа қадамдармен түсіндір.
Жеке деректерді сұрама және қайталама (телефон, мекенжай, email, құжат).
Егер сұрақ қауіпті/ересектерге арналса — сыпайы түрде бас тартып, қауіпсіз балама ұсын.`;

  const modeHint = isRu
    ? `Режим ответа: ${mode || 'explain'} (explain/hint/quiz).`
    : `Жауап режимі: ${mode || 'explain'} (explain/hint/quiz).`;

  const context = isRu
    ? `ТЕМА: ${topicTitle}\nОПИСАНИЕ: ${topicDesc || ''}\nКОНТЕКСТ УРОКА:\n${lessonContext || ''}`
    : `ТАҚЫРЫП: ${topicTitle}\nСИПАТТАМА: ${topicDesc || ''}\nСАБАҚ КОНТЕКСТІ:\n${lessonContext || ''}`;

  const user = isRu
    ? `Вопрос ученика: ${question}`
    : `Оқушы сұрағы: ${question}`;

  return `${system}\n\n${modeHint}\n\n${clip(context)}\n\n${user}`;
}

module.exports = { buildPrompt };