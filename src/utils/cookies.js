function getRefreshCookieOptions() {
  const secure = String(process.env.COOKIE_SECURE || 'false') === 'true';
  const sameSite = (process.env.COOKIE_SAMESITE || 'lax');

  return {
    httpOnly: true,
    secure,
    sameSite, // 'lax'|'strict'|'none'
    path: '/api/auth/refresh',
    maxAge: Number(process.env.REFRESH_TOKEN_TTL_DAYS || 14) * 24 * 60 * 60 * 1000,
  };
}

module.exports = { getRefreshCookieOptions };