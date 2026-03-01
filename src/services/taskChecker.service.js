const { deepEqual } = require('../utils/json');

function checkSimple(taskPayload, answerPayload) {
  // ожидаем: payload.correct, answer.value
  const correct = taskPayload?.correct;
  const value = answerPayload?.value;
  return value !== undefined && correct !== undefined && value === correct;
}

function checkDragDrop(taskPayload, answerPayload) {
  // ожидаем: payload.correctMapping, answer.mapping
  // mapping — массив или объект (важно, чтобы учитель задавал одинаковый формат)
  return deepEqual(answerPayload?.mapping, taskPayload?.correctMapping);
}

function checkQa(taskPayload, answerPayload) {
  // ожидаем: payload.keywords: ["word1", "word2"], answer.text
  const text = String(answerPayload?.text || '').toLowerCase();
  const keywords = Array.isArray(taskPayload?.keywords) ? taskPayload.keywords : [];
  if (!text || keywords.length === 0) return false;

  // MVP: считаем верным, если найдено >= 50% ключевых слов
  const hits = keywords.filter(k => text.includes(String(k).toLowerCase())).length;
  return hits >= Math.ceil(keywords.length * 0.5);
}

function checkTask(type, taskPayload, answerPayload) {
  if (type === 'SIMPLE') return checkSimple(taskPayload, answerPayload);
  if (type === 'DRAG_DROP') return checkDragDrop(taskPayload, answerPayload);
  if (type === 'QA') return checkQa(taskPayload, answerPayload);
  return false;
}

module.exports = { checkTask };