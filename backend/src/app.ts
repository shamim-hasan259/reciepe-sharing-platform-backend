import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './app/config';
import globalErrorHandler from './app/middleware/errorHandler';
import notFound from './app/middleware/notFound';
import router from './app/routes';

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS setup supporting cookies
app.use(
  cors({
    origin: [config.client_url, 'http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'stripe-signature']
  })
);

// Logging
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// Stripe webhook raw parser exemption (must be before express.json for webhook)
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payment/webhook') {
    next();
  } else {
    express.json({ limit: '10mb' })(req, res, next);
  }
});

app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Root & Health check
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to RecipeHub API - Recipe Sharing Platform',
    version: '1.0.0',
    documentation: '/api/docs',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    environment: config.env,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', router);

// Error Handling Middleware
app.use(notFound);
app.use(globalErrorHandler);

export default app;
