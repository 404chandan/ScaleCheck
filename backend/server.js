import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import db from './services/database.js';
import analysisRoutes from './routes/analysisRoutes.js';
import loadTestRoutes from './routes/loadTestRoutes.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/analysis', analysisRoutes);
app.use('/api/loadtest', loadTestRoutes);

// Healthcheck
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: db.isMongo ? 'MongoDB' : 'Local NeDB (Fallback)',
    timestamp: new Date()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error.', details: err.message });
});

// Connect to Database first then start listening
async function startServer() {
  await db.connect();
  
  app.listen(config.port, () => {
    console.log(`===============================================`);
    console.log(`ScaleCheck Backend listening on port ${config.port}`);
    console.log(`Health endpoint: http://localhost:${config.port}/health`);
    console.log(`Active DB: ${db.isMongo ? 'MongoDB' : 'NeDB Local File'}`);
    console.log(`===============================================`);
  });
}

startServer();
