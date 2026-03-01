const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/ig;
const PHONE = /(\+?\d[\d\s().-]{7,}\d)/g;
const IIN_KZ = /\b\d{12}\b/g;                // Казахстан ИИН (12 цифр)
const CARD = /\b(?:\d[ -]*?){13,19}\b/g;     // грубо: 13-19 цифр

function containsPII(text) {
  const t = String(text || '');
  return EMAIL.test(t) || PHONE.test(t) || IIN_KZ.test(t) || CARD.test(t);
}

function redactPII(text) {
  return String(text || '')
    .replace(EMAIL, '[EMAIL]')
    .replace(PHONE, '[PHONE]')
    .replace(IIN_KZ, '[ID]')
    .replace(CARD, '[CARD]');
}

module.exports = { containsPII, redactPII };