// src/routes/chatRouter.js
import express from "express";
import { handleChatMessage } from "../controllers/chatController.js";

const router = express.Router();

// POST /api/chat
router.post("/", handleChatMessage);

export default router;
