function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;

  // Prisma ошибки можно аккуратно нормализовать
  const isProd = process.env.NODE_ENV === 'production';

  const payload = {
    error: status === 500 ? 'Internal server error' : err.message,
  };

  if (!isProd) {
    payload.details = {
      name: err.name,
      stack: err.stack,
      code: err.code,
    };
  }

  // Логируем всегда
  console.error('[ERROR]', {
    status,
    message: err.message,
    path: req.originalUrl,
    method: req.method,
    code: err.code,
  });

  res.status(status).json(payload);
}

module.exports = errorHandler;