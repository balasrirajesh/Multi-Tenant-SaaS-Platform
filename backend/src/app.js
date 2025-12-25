const db = require('./config/db');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const runMigrations = require('./utils/runMigrations');


// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Health Check Endpoint (MANDATORY)
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.status(200).json({
      status: 'ok',
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected'
    });
  }
});


// Default route
app.get('/', (req, res) => {
  res.json({ message: 'Multi-Tenant SaaS Backend Running' });
});

// Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await runMigrations();
    app.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
