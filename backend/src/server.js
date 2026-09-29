const app = require('./app');
const config = require('./config/env');
const { initCronJobs } = require('./utils/cron');

// Uncaught exceptions & rejections handlers for maximum stability
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

const server = app.listen(config.PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 FoodSave Backend Server Running on port ${config.PORT}`);
  console.log(`📡 Environment: ${config.NODE_ENV}`);
  console.log(`🌐 Base URL: http://localhost:${config.PORT}`);
  console.log(`🏥 Health Check: http://localhost:${config.PORT}/api/health`);
  console.log(`===============================================`);

  // Initialize background jobs
  try {
    initCronJobs();
  } catch (err) {
    console.error('Warning: Failed initializing background jobs:', err.message);
  }
});

// Handle server errors (e.g. port already in use)
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n======================================================`);
    console.error(`❌ [PORT CONFLICT] Port ${config.PORT} is already in use.`);
    console.error(`💡 Another instance of FoodSave backend is already active on port ${config.PORT}.`);
    console.error(`   To free port ${config.PORT} on Windows PowerShell:`);
    console.error(`   Stop-Process -Id (Get-NetTCPConnection -LocalPort ${config.PORT}).OwningProcess -Force`);
    console.error(`======================================================\n`);
  } else {
    console.error('❌ Server startup error:', err);
  }
  process.exit(1);
});

// Graceful shutdown handling (for Ctrl+C, nodemon, and OS termination)
const shutdown = (signal) => {
  console.log(`Received ${signal}, closing FoodSave HTTP server cleanly...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
  // Unref timer so it doesn't hold event loop open
  setTimeout(() => process.exit(0), 1500).unref();
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = server;
