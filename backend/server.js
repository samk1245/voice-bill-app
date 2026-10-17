import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authRoutes from './routes/authRoutes.js';
import storeRoutes from './routes/storeRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import nlpRoutes from './routes/nlpRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Security and utility middlewares
app.use(helmet({
  contentSecurityPolicy: false // Disable to allow loading fonts/images from outside if needed in dev
}));
app.use(cors({
  origin: '*', // Allow all origins for dev sandbox setup
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Healthcheck API
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Healthy', 
    database: process.env.MONGODB_URI ? 'MongoDB (Production)' : 'JSON File Sandbox (Local)',
    timestamp: new Date()
  });
});

// Register Core APIs
app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/nlp', nlpRoutes);

// Mock image asset route (for simulating local uploads in Sandbox mode)
app.get('/uploads/:filename', (req, res) => {
  res.status(200).send('Mock Image Asset');
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({ 
    message: 'An internal server error occurred', 
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Database connection & Server initialization
const startServer = async () => {
  const mongoURI = process.env.MONGODB_URI;
  if (mongoURI) {
    try {
      await mongoose.connect(mongoURI);
      console.log('Successfully connected to MongoDB Cluster (Production Mode)');
    } catch (err) {
      console.error('MongoDB database connection failed. Server shutting down:', err);
      process.exit(1);
    }
  } else {
    console.log('No MONGODB_URI environment variable detected.');
    console.log('Database Layer running in Local Sandbox Mode using config/db_fallback.json');
  }

  app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`Health check ready at http://localhost:${PORT}/api/health`);
  });
};

startServer();
export default app;
