import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './api/auth/auth.routes.js';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
    // In a production app, you should restrict the origin to your frontend's domain
    origin: '*' 
}));
app.use(express.json()); // for parsing application/json

// API Routes
app.use('/api/auth', authRoutes);

// A simple test route
app.get('/', (req, res) => {
    res.send('Hello from the Urban Connect Stream backend!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});