/**
 * useMoltbot - React hook for Moltbot chat functionality
 *
 * Provides:
 * - Session management (create, terminate)
 * - Message sending and history
 * - Real-time WebSocket updates
 * - Connection status
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

interface UseMoltbotReturn {
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

export function useMoltbot(): UseMoltbotReturn {
  const { isAuthenticated, user } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // tRPC mutations and queries
  const createSessionMutation = trpc.moltbot.createWebchatSession.useMutation();
  const terminateSessionMutation = trpc.moltbot.terminateSession.useMutation();
  const sendMessageMutation = trpc.moltbot.sendMessage.useMutation();
  const statusQuery = trpc.moltbot.getStatus.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Get active sessions on mount
  const activeSessionsQuery = trpc.moltbot.getActiveSessions.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Get message history when session changes
  const historyQuery = trpc.moltbot.getMessageHistory.useQuery(
    { sessionId: sessionId ?? "", limit: 100 },
    { enabled: !!sessionId }
  );

  // Restore active session on mount
  useEffect(() => {
    if (activeSessionsQuery.data?.length) {
      const webchatSession = activeSessionsQuery.data.find((s) => s.channelType === "webchat");
      if (webchatSession) {
        setSessionId(webchatSession.sessionId);
      }
    }
  }, [activeSessionsQuery.data]);

  // Load message history when session is set
  useEffect(() => {
    if (historyQuery.data?.items) {
      setMessages(
        historyQuery.data.items.map(
          (m: { id: number; role: string; content: string; createdAt: Date }) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
            createdAt: new Date(m.createdAt),
          })
        )
      );
    }
  }, [historyQuery.data]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!sessionId || !isAuthenticated || !user?.id) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/moltbot?userId=${user.id}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "subscribe", sessionId }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "message" && data.role === "assistant") {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              role: "assistant",
              content: data.content,
              createdAt: new Date(),
            },
          ]);
          setIsSending(false);
        }
      } catch (_err) {}
    };

    ws.onerror = (_err) => {
      setError("Connection error");
    };

    ws.onclose = () => {};

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [sessionId, isAuthenticated, user?.id]);

  // Create new chat session
  const createSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createSessionMutation.mutateAsync({});
      setSessionId(result.sessionId);
      setMessages([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session");
    } finally {
      setIsLoading(false);
    }
  }, [createSessionMutation]);

  // End current session
  const endSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      await terminateSessionMutation.mutateAsync({ sessionId });
      setSessionId(null);
      setMessages([]);
      wsRef.current?.close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to end session");
    }
  }, [sessionId, terminateSessionMutation]);

  // Send message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!sessionId || !content.trim()) return;

      setIsSending(true);
      setError(null);

      // Optimistic update - add user message immediately
      const tempId = Date.now();
      setMessages((prev) => [
        ...prev,
        {
          id: tempId,
          role: "user",
          content,
          createdAt: new Date(),
        },
      ]);

      try {
        await sendMessageMutation.mutateAsync({
          sessionId,
          content,
        });
        // Assistant response will come via WebSocket
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send message");
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setIsSending(false);
      }
    },
    [sessionId, sendMessageMutation]
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
    isConnected: statusQuery.data?.isGatewayConnected ?? false,
    error,
  };
}
