function normalizeSingle(a) {
  if (!a) return null;
  return a.value ?? null;
}

function normalizeMulti(a) {
  if (!a) return [];
  const values = Array.isArray(a.values) ? a.values : [];
  // сортируем для устойчивости сравнения
  return values.map(String).sort();
}

function gradeQuestion(q, userAnswer) {
  if (q.type === 'SINGLE') {
    const userVal = normalizeSingle(userAnswer);
    const correctVal = q.correctAnswer?.value ?? null;
    return userVal !== null && userVal === correctVal;
  }

  if (q.type === 'MULTI') {
    const userVals = normalizeMulti(userAnswer);
    const correctVals = Array.isArray(q.correctAnswer?.values)
      ? q.correctAnswer.values.map(String).sort()
      : [];
    if (userVals.length !== correctVals.length) return false;
    for (let i = 0; i < userVals.length; i++) {
      if (userVals[i] !== correctVals[i]) return false;
    }
    return true;
  }

  return false;
}

function gradeTest(questions, answers) {
  const review = [];
  let score = 0;

  for (const q of questions) {
    const userAnswer = answers?.[q.id];
    const isCorrect = gradeQuestion(q, userAnswer);
    if (isCorrect) score += 1;

    review.push({
      questionId: q.id,
      isCorrect,
      correct: q.correctAnswer, // возвращаем после сабмита (опционально)
    });
  }

  return { score, maxScore: questions.length, review };
}

module.exports = { gradeTest };