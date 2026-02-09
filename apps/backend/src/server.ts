import app from './app';
import connectDB from './config/database';

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Start server
const server = app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   🏗️  Sustainable Construction Management API           ║
  ║                                                           ║
  ║   Server running in ${process.env.NODE_ENV || 'development'} mode                    ║
  ║   Port: ${PORT}                                           ║
  ║   URL: http://localhost:${PORT}                           ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('❌ Unhandled Rejection:', err.message);
  // Close server & exit process
  server.close(() => process.exit(1));
});
