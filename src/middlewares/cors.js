const cors = require('cors');

function corsMiddleware() {
  const origin = process.env.CORS_ORIGIN;

  return cors({
    origin: (requestOrigin, cb) => {
      // Разрешаем запросы без Origin (например, curl/health checks)
      if (!requestOrigin) return cb(null, true);

      if (!origin) return cb(new Error('CORS_ORIGIN is not set'), false);
      if (requestOrigin === origin) return cb(null, true);

      return cb(new Error(`CORS blocked for origin: ${requestOrigin}`), false);
    },
    credentials: true, // важно для refresh cookie
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
}

module.exports = corsMiddleware;