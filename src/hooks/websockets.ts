// src/hooks/useWebSocket.ts
import { useAuth } from "@/context/AuthContext";
import { useEffect, useRef, useCallback } from "react";

interface WebSocketMessage {
  event: string;
  task_id?: string;
  paper_id?: string;
  status?: string;
  progress?: number;
  stage_message?: string;
  worker_name?: string;
  result?: any;
  error?: string;
}

export const useWebSocket = (
  userId: string | null,
  token: string | null,
  onMessage: (data: WebSocketMessage) => void,
) => {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const onMessageRef = useRef(onMessage); // ← store in ref
  const { setWebsocketConnected, logout } = useAuth();

  // Keep ref current without triggering reconnect
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const connect = useCallback(() => {
    if (!userId || !token) return;

    const url = `${import.meta.env.VITE_WS_URL}/ws/${userId}?token=${token}`;
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      setWebsocketConnected(true);
    };

    ws.current.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        onMessageRef.current(data); // ← call via ref, not direct
        console.log("WebSocket message received:", data);
      } catch {
        console.error("Failed to parse WebSocket message");
      }
    };

    ws.current.onclose = event => {
      setWebsocketConnected(false);
      if (event.code === 4001 || event.code === 4002 || event.code === 4003) {
        console.log("WebSocket closed due to auth error — not reconnecting");
        logout();
        return;
      }

      if (event.code === 1008) {
        console.log("Auth failed — not reconnecting");
        return;
      }
      console.log("WebSocket disconnected — reconnecting in 3s");
      reconnectTimer.current = setTimeout(connect, 3000);
    };

    ws.current.onerror = () => {
      ws.current?.close();
    };
  }, [userId, token]); // ← onMessage removed from deps

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current ?? undefined);
      ws.current?.close();
    };
  }, [connect]);
};
