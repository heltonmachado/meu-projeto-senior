import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { logger } from './shared/infra/logger/pino.js';
import { requestId } from './shared/middlewares/requestId.js';
import { errorHandler } from './shared/middlewares/errorHandler.js';
import authRoutes from './modules/auth/auth.routes.js';
import productRoutes from './modules/products/product.routes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({
  origin: (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5173').split(','),
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(requestId);
app.use(pinoHttp({ logger }));
app.use(rateLimit({ windowMs: 15*60*1000, max: 100 }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

app.get('/', (req, res) => res.json({ message: 'API Senior OK', requestId: req.id }));
app.get('/health', async (req, res) => {
  try { res.json({ status: 'ok', uptime: process.uptime(), requestId: req.id }); }
  catch { res.status(503).json({ status: 'down' }); }
});

app.use((req, res) => res.status(404).json({ message: 'Rota nao encontrada' }));
app.use(errorHandler);

export default app;
