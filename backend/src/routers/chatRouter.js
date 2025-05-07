// src/routes/chatRouter.js
import express from 'express';
import {handleChatMessage} from '../controllers/chatController.js';
import {authenticate} from '../middlewares/authentication.js';

const chatRouter = express.Router();

chatRouter.use(authenticate);

chatRouter.post('/', handleChatMessage);

export default chatRouter;
