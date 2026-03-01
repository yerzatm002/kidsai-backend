function calcLevel(totalXp) {
  // Простая формула для MVP (можно заменить позже):
  // 1 уровень: 0-99, 2: 100-199, ...
  return Math.floor((totalXp || 0) / 100) + 1;
}

module.exports = { calcLevel };