require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const healthRoutes = require('./routes/health.routes');
const debugRoutes = require('./routes/debug.routes');
const authRoutes = require('./routes/auth.routes');
const teacherRoutes = require('./routes/teacher.routes');
const topicRoutes = require('./routes/topic.routes');
const teacherContentRoutes = require('./routes/teacherContent.routes');
const taskRoutes = require('./routes/task.routes');
const testRoutes = require('./routes/test.routes');
const lessonViewRoutes = require('./routes/lessonView.routes');
const meRoutes = require('./routes/me.routes');
const fileRoutes = require('./routes/file.routes');
const aiRoutes = require('./routes/ai.routes');
const meProgressRoutes = require('./routes/meProgress.routes');
const teacherStudentsRoutes = require('./routes/teacherStudents.routes');
const feedbackRoutes = require('./routes/feedback.routes');

const corsMiddleware = require('./middlewares/cors');
const errorHandler = require('./middlewares/errorHandler');

const cookieParser = require('cookie-parser');
const app = express();

/**
 * Security & basic middleware
 */
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // чтобы картинки из Supabase не ломались
}));
app.use(cookieParser());
app.use(corsMiddleware());
/**
 * CORS: allow Vercel domain only.
 * If you later use httpOnly cookies for refresh tokens,
 * keep credentials: true and ensure frontend sends credentials.
 */
const corsOrigin = process.env.CORS_ORIGIN;
app.use(
  cors({
    origin: corsOrigin ? [corsOrigin] : false,
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

/**
 * Global rate limiter (soft, for MVP)
 * Later we will add stricter limiters for auth and AI endpoints separately.
 */
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

/**
 * Routes
 */
app.use(healthRoutes);
app.use(debugRoutes);
app.use(authRoutes);
app.use(teacherRoutes);
app.use(topicRoutes);
app.use(teacherContentRoutes);
app.use(taskRoutes);
app.use(testRoutes);
app.use(lessonViewRoutes);
app.use(meRoutes);
app.use(fileRoutes);
app.use(aiRoutes);
app.use(meProgressRoutes);
app.use(teacherStudentsRoutes);
app.use(feedbackRoutes);
/**
 * 404
 */
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

/**
 * Error handler (minimal MVP)
 */
app.use(errorHandler);

app.set('trust proxy', 1); // если приложение будет за прокси (например, Vercel), чтобы rate limiter корректно работал по IP

module.exports = app;