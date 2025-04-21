import express from 'express';
import cors from 'cors';


import userRouter from './routers/userRouter.js';
import chatRouter from "./routers/chatRouter.js";
import hrvRouter from "./routers/hrvRouter.js";

const hostname = 'localhost';
const port = 3000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/hrv", hrvRouter);

// Start server
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
