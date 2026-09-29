const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config/env');
const routes = require('./routes');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');

const app = express();

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration
const allowedOrigins = [
  config.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || config.NODE_ENV === 'development') {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root route handler providing API status and directory
app.get('/', (req, res) => {
  // If request accepts HTML, render a clean styled status page; otherwise JSON
  const isHtml = req.accepts('html', 'json') === 'html';
  
  if (isHtml) {
    return res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>FoodSave Backend API</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: #f7faf7;
            color: #1b1b1b;
            margin: 0;
            padding: 40px 20px;
            display: flex;
            justify-content: center;
          }
          .card {
            background: white;
            border-radius: 16px;
            padding: 36px;
            max-width: 640px;
            width: 100%;
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06);
            border: 1px solid #e5e7eb;
          }
          .badge {
            display: inline-block;
            background: #dcfce7;
            color: #15803d;
            font-weight: 700;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 0.8rem;
            margin-bottom: 12px;
          }
          h1 { margin: 0 0 8px 0; color: #2e7d32; font-size: 1.8rem; }
          p { color: #4b5563; line-height: 1.6; margin-top: 0; }
          .endpoint-list {
            background: #f8fafc;
            border-radius: 8px;
            padding: 16px 20px;
            margin: 20px 0;
            font-family: monospace;
            font-size: 0.9rem;
          }
          .endpoint-list li { margin: 8px 0; }
          .endpoint-list a { color: #0284c7; text-decoration: none; font-weight: 600; }
          .endpoint-list a:hover { text-decoration: underline; }
          .btn {
            display: inline-block;
            background: #2e7d32;
            color: white;
            font-weight: 600;
            padding: 10px 20px;
            border-radius: 8px;
            text-decoration: none;
          }
          .btn:hover { background: #1b5e20; }
        </style>
      </head>
      <body>
        <div class="card">
          <span class="badge">● Online & Operational</span>
          <h1>FoodSave REST API</h1>
          <p><em>"Save Food. Share Hope. Reduce Waste."</em></p>
          <p>The backend REST API server is actively running and ready to handle requests from the React frontend, mobile clients, and third-party integrations.</p>
          
          <h3>Key API Endpoints:</h3>
          <ul class="endpoint-list">
            <li>Health Check: <a href="/api/health">/api/health</a></li>
            <li>Donations Feed: <a href="/api/donations">/api/donations</a></li>
            <li>Categories: <a href="/api/categories">/api/categories</a></li>
            <li>Impact Metrics: <a href="/api/impact">/api/impact</a></li>
            <li>Auth Endpoints: /api/auth/login, /api/auth/register</li>
          </ul>

          <p>To view the full user interface, open the frontend application:</p>
          <a class="btn" href="${config.FRONTEND_URL}">Open FoodSave Web App (${config.FRONTEND_URL})</a>
        </div>
      </body>
      </html>
    `);
  }

  res.status(200).json({
    success: true,
    message: 'FoodSave REST API is running. "Save Food. Share Hope. Reduce Waste."',
    status: 'ONLINE',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      donations: '/api/donations',
      pickups: '/api/pickups',
      deliveries: '/api/deliveries',
      ngos: '/api/ngos',
      categories: '/api/categories',
      impact: '/api/impact',
      admin: '/api/admin'
    },
    frontendUrl: config.FRONTEND_URL
  });
});

// Apply rate limiter to /api
app.use('/api', apiLimiter);

// Mount API Routes
app.use('/api', routes);

// 404 handler
app.use(notFoundHandler);

// Centralized Error handler
app.use(errorHandler);

module.exports = app;
