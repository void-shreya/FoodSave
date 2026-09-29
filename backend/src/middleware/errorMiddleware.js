const config = require('../config/env');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  
  if (config.NODE_ENV !== 'production' && statusCode === 500) {
    console.error('💥 Unhandled Server Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error occurred',
    error: err.code || 'SERVER_ERROR',
    ...(config.NODE_ENV === 'development' && { stack: err.stack })
  });
};

const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
    error: 'NOT_FOUND'
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
