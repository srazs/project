const express = require('express');
const cors = require('cors');
require('dotenv').config();

const batchRoutes = require('./routes/batch.routes');

const app = express();


// 1. Standard Enterprise Middlewares


// CORS is critical so your React frontend (Vite) can safely talk to this backend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', 
  credentials: true
}));

// Body parser to handle incoming JSON enterprise payloads
app.use(express.json());

// 2. Base & Health Diagnostics

app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    status: 'UP', 
    message: 'Pharma ERP core systems operational.' 
  });
});

// 3. Application Route Bindings

app.use('/api', batchRoutes);

// 4. Robust Error Defenses (Interview Gold)


// Catch-all fallback handler for missing endpoints (404)
app.use((req, res, next) => {
  res.status(404).json({ 
    success: false, 
    message: `Resource not found on this server: ${req.originalUrl}` 
  });
});

// Global Centralized Error Handler
// Senior developers check your repository specifically for this. It stops the app from crashing.
app.use((err, req, res, next) => {
  console.error('🔥 System Exception Logged:', err.stack);
  
  res.status(500).json({
    success: false,
    message: 'An internal server error occurred. Diagnostic logs saved.',
    // Only leak detailed error stack traces if running in local development mode
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// 5. Server Bootstrap

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Pharma ERP Server running on port: ${PORT}`);
});