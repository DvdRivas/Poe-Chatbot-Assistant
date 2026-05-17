import { useState, useCallback, useRef, } from "react";
import { POE_CONFIG } from "./Poe.config";

// ─── Types ────────────────────────────────────

export type Role = "user" | "assistant";

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  streaming?: boolean;
}

// ─── Generador aleatorio de IDs ────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 10);

export function usePoeChat() {
  const { botName, accessKey, widget } = POE_CONFIG;
  const [messages, setMessages] = useState<Message[]>(() => {
    const HIST = localStorage.getItem("conversation");
    console.log(HIST)
    if (HIST !== null) {
      return JSON.parse(HIST).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    }

    return [
      {
        id: uid(),
        role: "assistant",
        content: widget.welcomeMessage,
        timestamp: new Date(),
      }
    ]
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ── Message Handler ──────────
  
  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      setError(null);

      const userMsg: Message = {
        id: uid(),
        role: "user",
        content: text.trim(),
        timestamp: new Date(),
      };

      const replyId = uid();
      const replyMsg: Message = {
        id: replyId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        streaming: true,
      };

      setMessages((prev) => [...prev, userMsg, replyMsg]);
      setLoading(true);

      abortRef.current = new AbortController();

      try {
        const apiMessages = messages
          .filter(msg => !msg.streaming && msg.content)
          .concat([userMsg])
          .map(msg => ({
            role: msg.role,
            content: msg.content,
          }));

        const response = await fetch('/poe-api/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessKey}`,
          },
          body: JSON.stringify({
            model: botName,
            messages: apiMessages,
            stream: true,
          }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No se pudo leer el stream");

        const decoder = new TextDecoder();
        let accumulated = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;
            
            if (trimmedLine.startsWith('data: ')) {
              try {
                const jsonStr = trimmedLine.slice(6);
                const parsed = JSON.parse(jsonStr);
                const content = parsed.choices[0]?.delta?.content || '';
                
                if (content) {
                  accumulated += content;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === replyId ? { ...m, content: accumulated } : m
                    )
                  );
                }
              } catch (e) {
                console.error('Error parsing SSE:', e);
              }
            }
          }
        }

      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        const msg = err instanceof Error ? err.message : "Error desconocido.";
        console.error("Error en send:", err);
        setError(msg);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === replyId ? { ...m, content: `⚠️ Error: ${msg}` } : m
          )
        );
      } finally {
        setLoading(false);
        setMessages((prev) => {
        const updated = prev.map((m) =>
          m.id === replyId ? { ...m, streaming: false } : m
        );
        localStorage.setItem("conversation", JSON.stringify(updated));
        return updated;
      });
      }
    },
    [botName, accessKey, loading, messages]
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  // ── Borrar conversación ─────────────────────
  
  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([
      {
        id: uid(),
        role: "assistant",
        content: widget.welcomeMessage,
        timestamp: new Date(),
      },
    ]);
    setError(null);
    setLoading(false);
    localStorage.removeItem("conversation");

  }, [widget.welcomeMessage]);

  return { messages, loading, error, send, stop, reset };
}