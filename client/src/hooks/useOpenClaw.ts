/**
 * useOpenClaw - React hook for AI chat functionality
 *
 * Simplified hook that uses the aiAssistant router.
 * Provides session-like behavior using local state.
 */

import { useCallback, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

interface UseOpenClawReturn {
  // Session
  sessionId: string | null;
  isActive: boolean;
  createSession: () => Promise<void>;
  endSession: () => Promise<void>;

  // Messages
  messages: ChatMessage[];
  sendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  isSending: boolean;

  // Status
  isConnected: boolean;
  error: string | null;
}

export function useOpenClaw(): UseOpenClawReturn {
  const { isAuthenticated } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // tRPC mutations and queries
  const chatMutation = trpc.aiAssistant.chat.useMutation();
  const statusQuery = trpc.aiAssistant.status.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Check if AI is configured
  const isConfigured = statusQuery.data?.configured ?? false;

  // Create new chat session (now just simulated locally)
  const createSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Generate a local session ID
      const newSessionId = `session_${Date.now()}`;
      setSessionId(newSessionId);
      setMessages([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // End current session
  const endSession = useCallback(async () => {
    setSessionId(null);
    setMessages([]);
  }, []);

  // Send message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!sessionId || !content.trim()) return;

      setIsSending(true);
      setError(null);

      // Optimistic update - add user message immediately
      const tempId = Date.now();
      const userMessage: ChatMessage = {
        id: tempId,
        role: "user",
        content,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      try {
        // Build message history for context
        const messageHistory = messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));
        messageHistory.push({ role: "user", content });

        // Call the chat mutation
        const result = await chatMutation.mutateAsync({ messages: messageHistory });

        // Add assistant response
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            role: "assistant" as const,
            content: result.message,
            createdAt: new Date(),
          },
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send message");
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      } finally {
        setIsSending(false);
      }
    },
    [sessionId, messages, chatMutation]
  );

  return {
    sessionId,
    isActive: !!sessionId,
    createSession,
    endSession,
    messages,
    sendMessage,
    isLoading,
    isSending,
    isConnected: isConfigured,
    error,
  };
}
