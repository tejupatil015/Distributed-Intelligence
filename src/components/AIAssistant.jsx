
import { useEffect } from "react";
import "@n8n/chat/style.css";
import { createChat } from "@n8n/chat";

export default function AIAssistant() {
  useEffect(() => {
    createChat({
      webhookUrl:
        "https://abcde1.app.n8n.cloud/webhook/03d61084-2117-4ca4-b860-b73f0ed4e2fb/chat",
      mode: "window",
      loadPreviousSession: true,
      showWelcomeScreen: false,
      defaultLanguage: "en",
      initialMessages: [
        "Hello! Welcome to Distributed Intelligence.",
        "Ask me about inventory, demand forecasting, stock levels, locations, and business recommendations."
      ],
      i18n: {
        en: {
          title: "DI Intelligence Assistant",
          subtitle: "Your smart business assistant",
          inputPlaceholder: "Ask anything about your business..."
        }
      }
    });
  }, []);

  return null;
}
