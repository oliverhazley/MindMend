// src/scripts/chat.js

import { API_BASE_URL } from "./config.js";
import { requireAuth } from "./router.js";

export function initChat() {
  console.log("Chat page loaded");

  // Require auth before loading chat page
  if (!requireAuth()) return;

  const chatWindow = document.getElementById("chatWindow");
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");

  if (chatForm && chatWindow && chatInput) {
    chatForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const userMsg = chatInput.value.trim();
      if (!userMsg) return;

      // Display user message
      const userBubble = document.createElement("div");
      userBubble.className = "p-2 bg-accent text-white rounded-md self-end max-w-sm ml-auto";
      userBubble.innerText = userMsg;
      chatWindow.appendChild(userBubble);
      chatInput.value = "";

      // Call chatbot API
      try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify({ message: userMsg }),
        });

        if (!response.ok) {
          throw new Error(`Chat request failed: ${response.statusText}`);
        }

        const data = await response.json();
        const botReply = data.reply || "No reply available.";

        // Display bot reply
        const botBubble = document.createElement("div");
        botBubble.className = "p-2 bg-gray-700 text-gray-200 rounded-md self-start max-w-sm mr-auto";
        botBubble.innerText = botReply;
        chatWindow.appendChild(botBubble);
      } catch (error) {
        console.error("Error in chat:", error);
      }

      // Scroll to bottom
      chatWindow.scrollTop = chatWindow.scrollHeight;
    });
  }
}
