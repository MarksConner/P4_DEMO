import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Button } from "../design_system/components/ui/Button";
import { Input } from "../design_system/components/ui/Input";
import ChatClient from "../api_client/Chat";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    text: "Hi! Ask me about your schedule and I can help plan your day.",
  },
];

export const AiChatPanel = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [chatId, setChatId] = useState<string>(
    () => localStorage.getItem("chat_id") || ""
  );

  useEffect(() => {
    const loadHistory = async () => {
      if (!chatId) return;

      const api = new ChatClient();
      try {
        const res = await api.getChatHistory(chatId);
        if (!res.ok) return;

        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) return;

        const historyMessages: ChatMessage[] = data.map((m: any) => ({
          id: m.message_id ?? `m-${Date.now()}-${Math.random()}`,
          role: m.sender_is ? "user" : "assistant",
          text: m.content ?? "",
        }));

        setMessages(historyMessages);
      } catch {
      }
    };

    loadHistory();
  }, [chatId]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: draft.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setDraft("");
    sendMessageToApi(userMessage);
  };

  const sendMessageToApi = async (message: ChatMessage) => {
    const api = new ChatClient();

    try {
      let currentChatId = chatId;

      if (!currentChatId) {
        const firstRes = await api.createChat(message.text);
        if (!firstRes.ok) throw new Error("Failed to start chat");

        const chatIdFromApi: string = await firstRes.json();
        currentChatId = chatIdFromApi;

        setChatId(chatIdFromApi);
        localStorage.setItem("chat_id", chatIdFromApi);
      } else {
        const sendRes = await api.sendMessage(currentChatId, message.text);
        if (!sendRes.ok) throw new Error("Failed to send message");
      }

      const historyRes = await api.getChatHistory(currentChatId);
      if (!historyRes.ok) throw new Error("Failed to fetch chat history");

      const data = await historyRes.json();
      const historyMessages: ChatMessage[] = (Array.isArray(data) ? data : []).map(
        (m: any) => ({
          id: m.message_id ?? `m-${Date.now()}-${Math.random()}`,
          role: m.sender_is ? "user" : "assistant",
          text: m.content ?? "",
        })
      );

      if (historyMessages.length > 0) {
        setMessages(historyMessages);
      }
    } catch {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        text: "Sorry, there was an error processing your request.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <Stack sx={{ height: "100%", minHeight: 0 }} spacing={2}>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          pr: 0.5,
        }}
      >
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              alignSelf: message.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%",
              px: 1.5,
              py: 1,
              borderRadius: 2,
              bgcolor:
                message.role === "user" ? "primary.main" : "background.paper",
              color:
                message.role === "user"
                  ? "primary.contrastText"
                  : "text.primary",
              border: message.role === "user" ? undefined : "1px solid",
              borderColor: message.role === "user" ? undefined : "divider",
            }}
          >
            <Typography variant="body2">{message.text}</Typography>
          </Box>
        ))}
      </Box>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}
      >
        <Input
          placeholder="Ask about your schedule..."
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          sx={{ flex: 1 }}
        />
        <Button type="submit" disabled={!draft.trim()}>
          Send
        </Button>
      </Box>
    </Stack>
  );
};