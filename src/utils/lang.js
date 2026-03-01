function resolveLang(queryLang) {
  const lang = String(queryLang || 'kz').toLowerCase();
  return lang === 'ru' ? 'ru' : 'kz';
}

module.exports = { resolveLang };