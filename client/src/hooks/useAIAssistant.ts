/**
 * useAIAssistant - React hook for AI Assistant chat functionality
 *
 * Uses Vercel AI SDK via tRPC for AI interactions with tool calling.
 * Replaces the legacy useOpenClaw hook.
 */

import { useCallback, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
}

interface UseAIAssistantReturn {
  // Messages
  messages: ChatMessage[];
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;

  // Status
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  isConfigured: boolean;

  // Context
  hasProfile: boolean;
  mentoradoName: string | null;
}

export function useAIAssistant(): UseAIAssistantReturn {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // tRPC queries and mutations
  const statusQuery = trpc.aiAssistant.status.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 60000, // Cache for 1 minute
  });

  const contextQuery = trpc.aiAssistant.getContext.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 30000,
  });

  const chatMutation = trpc.aiAssistant.chat.useMutation();

  // Send message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      setIsSending(true);
      setError(null);

      // Add user message immediately (optimistic update)
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);

      try {
        // Build message history for context
        const messageHistory = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        // Add the new user message
        messageHistory.push({ role: "user", content });

        const result = await chatMutation.mutateAsync({
          messages: messageHistory,
        });

        // Add assistant response
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: result.message,
          createdAt: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to send message";
        setError(errorMessage);
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
      } finally {
        setIsSending(false);
      }
    },
    [messages, chatMutation]
  );

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    sendMessage,
    clearMessages,
    isLoading: statusQuery.isLoading || contextQuery.isLoading,
    isSending,
    error,
    isConfigured: statusQuery.data?.configured ?? false,
    hasProfile: contextQuery.data?.hasProfile ?? false,
    mentoradoName: contextQuery.data?.mentorado?.nome ?? null,
  };
}
