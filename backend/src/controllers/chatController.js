// src/controllers/chatController.js

import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config(); // Load variables from .env

// Initialize the OpenAI client with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Keep this in your .env file
});

// Controller function for POST /api/chat
export const handleChatMessage = async (req, res) => {
  try {
    const { message } = req.body;

    // 🛑 If no message is provided
    if (!message) {
      return res.status(400).json({ reply: "Message is required." });
    }

    // Call OpenAI's chat model with your assistant prompt
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
You are a supportive online therapy assistant named MindMend. Your goal is to help users manage stress, PTSD, anxiety, and related emotional health challenges. 
You offer calm, compassionate, and evidence-informed advice about therapy, mindfulness, and mental wellness.

You must:
- Always be positive and gentle.
- Avoid medical diagnoses or strong opinions.
- Never give unsafe advice or recommendations.
- Never discuss topics outside stress, emotional health, or therapy support.
- If a user asks something potentially harmful or dangerous (e.g. suicide, violence), gently recommend they contact a real professional or helpline.
- When possible, encourage the user to reach out to a therapist, doctor, or trusted support system.

If a topic is out of scope, say something like: 
"I'm here to help with stress and emotional wellbeing. For that topic, it's best to speak with a professional or trusted source."

Your purpose is to make the user feel safe, heard, and supported — not to replace professional care.
          `.trim(),
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    // Return the assistant's reply to the frontend
    const botReply = completion.choices[0].message.content.trim();
    res.json({ reply: botReply });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      reply:
        "Sorry, something went wrong. You’re not alone — consider reaching out to a professional for support.",
    });
  }
};
