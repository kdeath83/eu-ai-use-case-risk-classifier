import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import classifyRoutes from './routes/classify';
import reportRoutes from './routes/report';
import healthRoutes from './routes/health';

const app = express();
const PORT = process.env.PORT || 4000;

// Security: helmet headers
app.use(helmet());

// Security: rate limiting (100 requests per 15 min window per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// Security: tighten CORS to known origins
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(morgan('dev'));

// Security: cap JSON body to 500KB to prevent DoS
app.use(express.json({ limit: '500kb' }));

app.use('/api/health', healthRoutes);
app.use('/api/classify', classifyRoutes);
app.use('/api/report', reportRoutes);

app.get('/', (_req, res) => {
  res.json({
    message: 'EU AI Use Case Risk Classifier API',
    docs: {
      classify: 'POST /api/classify - Run full classification',
      report: 'POST /api/report/export - Export JSON report',
      preview: 'POST /api/report/preview - Preview report summary',
      health: 'GET /api/health - Health check'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
