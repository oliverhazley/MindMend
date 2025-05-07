// src/routes/chatRouter.js
import express from "express";
import { handleChatMessage } from "../controllers/chatController.js";
import authenticate from '../middlewares/authentication.js';

const router = express.Router();

// Chat routes are protected
router.post("/", authenticate, handleChatMessage);

export default router;

