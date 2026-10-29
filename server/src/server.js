import dotenv from 'dotenv';
import app from './app.js';
import { initializeDatabase } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  console.log('----------------------------------------------------');
  console.log('Smart Welfare Scheme Eligibility Prediction Engine');
  console.log('Starting backend server...');
  console.log('----------------------------------------------------');

  try {
    // Initialize Database (MySQL with resilient fallback)
    await initializeDatabase();

    const server = app.listen(PORT, () => {
      console.log(`[SERVER] API listening on http://localhost:${PORT}`);
      console.log(`[SERVER] Health check: http://localhost:${PORT}/api/v1/health`);
      console.log(`[SERVER] Ready to process eligibility prediction requests.`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('[SERVER] SIGTERM received, shutting down gracefully...');
      server.close(() => {
        console.log('[SERVER] Process terminated.');
      });
    });
  } catch (err) {
    console.error('[SERVER ERROR] Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();
