import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes';
import { swaggerUi, specs } from './config/swagger';

dotenv.config();

const app = express();

// --- DEBUG LOGGING MIDDLEWARE ---
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const method = req.method;
  const authHeader = req.headers.authorization;

  // Log request details for debugging in Railway (commented for production)
  // console.log(`[DEBUG] ${new Date().toISOString()} | Method: ${method} | Origin: ${origin || 'No Origin'} | URL: ${req.url}`);
  // if (authHeader) {
  //   console.log(`[DEBUG] Auth Header Present: ${authHeader.substring(0, 15)}...`);
  // }
  next();
});

// --- DYNAMIC CORS CONFIGURATION ---
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(o => o.trim().replace(/\/$/, ''));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.trim().replace(/\/$/, '');

    // console.log("[CORS CHECK]", {
    //   origin: cleanOrigin,
    //   allowed: allowedOrigins
    // });

    if (allowedOrigins.includes(cleanOrigin)) {
      return callback(null, true);
    }

    console.warn("[CORS BLOCKED]", cleanOrigin);

    // ❗ JANGAN THROW ERROR
    return callback(null, false);
  },
  credentials: true
}));

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://validator.swagger.io"],
      connectSrc: ["'self'", "*"],
    },
  },
}));
app.use(morgan('dev'));
app.use(express.json());

app.use('/api', routes);

// Swagger Documentation
app.use(['/api-docs', '/api/docs'], swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'HIPMI Pemenangan API Documentation'
}));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

export default app;
