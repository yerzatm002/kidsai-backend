const jwt = require('jsonwebtoken');

function signAccessToken(payload) {
  const minutes = Number(process.env.ACCESS_TOKEN_TTL_MIN || 15);
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: `${minutes}m` });
}

function signRefreshToken(payload) {
  const days = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 14);
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: `${days}d` });
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};