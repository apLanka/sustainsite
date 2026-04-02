import app from './app';
import connectDB from './config/database';
const PORT = process.env.PORT || 5000;
connectDB();
const server = app.listen(PORT, () => {
    console.log(`
      🏗️  Sustainable Construction Management API
      Server running in ${process.env.NODE_ENV || 'development'} mode
      Port: ${PORT}
      URL: http://localhost:${PORT}
  `);
});
process.on('unhandledRejection', (err: Error) => {
    console.error('❌ Unhandled Rejection:', err.message);
    server.close(() => process.exit(1));
});
