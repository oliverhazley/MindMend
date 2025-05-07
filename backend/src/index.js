import express from 'express';
import cors from 'cors';

import userRouter from './routers/userRouter.js';
import chatRouter from './routers/chatRouter.js';
import hrvRouter from './routers/hrvRouter.js';

const app = express();
const PORT = process.env.PORT //|| 3000; // Use Azure's PORT in production
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost'; // Listen on all interfaces in production

const allowedOrigins = [
  'http://localhost:5173', // Frontend dev server
  'https://mind-mend.live', // Production domain
  'https://www.mind-mend.live',
];

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}));
app.use(express.json());

// Routes
app.use('/api/users', userRouter);
app.use('/api/chat', chatRouter);
app.use('/api/hrv', hrvRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});

