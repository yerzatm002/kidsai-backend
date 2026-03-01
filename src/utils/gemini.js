const google = require('@google/genai');

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error('GEMINI_API_KEY is missing');

const ai = new google.GoogleGenAI({ apiKey });

module.exports = { ai, google };