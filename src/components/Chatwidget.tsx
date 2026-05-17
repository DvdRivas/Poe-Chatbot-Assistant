import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";
import { usePoeChat } from "./UsePoe";
import { POE_CONFIG } from "./Poe.config";
import ReactMarkdown from "react-markdown";

// ─────────────────────────────────────────────────────────────
//  ChatWidget
//  Componente autocontenido: botón FAB + ventana de chat.
//  Solo necesita ser montado una vez en App.tsx.
//  Toda la configuración viene de src/config/poe.config.ts
// ─────────────────────────────────────────────────────────────

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, loading, error, send, stop, reset } = usePoeChat();

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { title, placeholder, accentColor } = POE_CONFIG.widget;

  // Auto-scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus al abrir
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    send(input);
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // ── Render ────────────────────────────────────────────────

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, fontFamily: "system-ui, sans-serif" }}>

      {/* ── Ventana de chat ── */}
      {open && (
        <div style={{
          position: "absolute",
          bottom: 68,
          right: 0,
          width: 340,
          height: 500,
          background: "#fff",
          borderRadius: 16,
          border: "1px solid rgba(0,0,0,0.1)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}>

          {/* Header */}
          <div style={{
            background: accentColor,
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}>
            {/* Cambiar avatar dependiendo si es imagen o texto */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>            
            {/* Texto */}
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "rgba(255,255,255,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 600, color: "#fff",
              }}>
                {title.slice(0, 2).toUpperCase()}
              </div>

            {/* Imagen */}
              {/* <img
                src="D5.jpg"
                alt="avatar"
                style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }}
              /> */}

              <div> 
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{title}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
                  {loading ? "Respondiendo…" : "En línea"}
                </div>
              </div>
            </div>
            {/* Botón limpiar */}
            <button onClick={reset} title="Nueva conversación" style={btnBase}>
              ↺
            </button>
          </div>

          {/* Mensajes */}
          <div style={{
            flex: 1, overflowY: "auto",
            padding: "14px 12px",
            display: "flex", flexDirection: "column", gap: 10,
            background: "#f8f9fb",
          }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{
                display: "flex",
                flexDirection: msg.role === "user" ? "row-reverse" : "row",
                alignItems: "flex-end",
                gap: 7,
              }}>            
                {/* Avatar solo para el asistente, */}
            {/* Cambiar avatar dependiendo si es imagen o texto */}
                {msg.role === "assistant" && (
                  ///////////// Texto ////////////////
                  <div style={{
                    width: 26, height: 26, borderRadius: "50%",
                    background: accentColor, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 9, fontWeight: 600, color: "#fff",
                  }}>
                    {title.slice(0, 2).toUpperCase()}
                  </div>
                //////////////// Imagen ///////////////
                // <img
                //   src="D5.jpg"
                //   alt="avatar"
                //   style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }}
                // />
                )}

                <div style={{
                  maxWidth: "78%",
                  background: msg.role === "user" ? accentColor : "#fff",
                  color: msg.role === "user" ? "#fff" : "#1a1a2e",
                  padding: "9px 12px",
                  borderRadius: 14,
                  borderBottomLeftRadius: msg.role === "assistant" ? 3 : 14,
                  borderBottomRightRadius: msg.role === "user" ? 3 : 14,
                  fontSize: 13,
                  lineHeight: 1.5,
                  border: msg.role === "assistant" ? "1px solid rgba(0,0,0,0.07)" : "none",
                }}>
                  {/* Indicador de escritura */}
                  {msg.streaming && msg.content === "" ? (
                    <TypingDots color={accentColor} />
                  ) : (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  )}
                  <div style={{ fontSize: 10, opacity: 0.45, marginTop: 4, textAlign: "right" }}>
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: "#fee2e2", color: "#991b1b",
              fontSize: 12, padding: "8px 14px",
              borderTop: "1px solid #fca5a5", flexShrink: 0,
            }}>
              {error}
            </div>
          )}

          {/* Input */}
          <div style={{
            display: "flex", alignItems: "flex-end", gap: 8,
            padding: "10px 12px",
            borderTop: "1px solid rgba(0,0,0,0.07)",
            background: "#fff", flexShrink: 0,
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={1}
              disabled={loading}
              style={{
                flex: 1, resize: "none",
                border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: 10, padding: "8px 11px",
                fontSize: 13, fontFamily: "inherit",
                lineHeight: 1.4, outline: "none",
                background: "#f8f9fb", color: "#1a1a2e",
                maxHeight: 100, overflowY: "auto",
              }}
            />
            {loading ? (
              <button onClick={stop} style={{ ...sendBtn, background: "#ef4444" }} aria-label="Detener">
                ■
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                style={{ ...sendBtn, background: accentColor, opacity: input.trim() ? 1 : 0.35 }}
                aria-label="Enviar"
              >
                ➤
              </button>
            )}
          </div>

          <div style={{ textAlign: "center", fontSize: 10, color: "#aaa", padding: "5px 0 7px", background: "#fff" }}>
            Powered by <strong>Poe & WayLearn</strong>
          </div>
        </div>
      )}

      {/* ── Botón FAB ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Cerrar chat" : "Abrir chat"}
        style={{
          width: 54, height: 54,
          borderRadius: "50%",
          background: accentColor,
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 22,
          boxShadow: `0 4px 18px ${accentColor}66`,
          transition: "transform 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}

// ─── Estilos compartidos ────────────────────────────────────

const btnBase: React.CSSProperties = {
  background: "rgba(255,255,255,0.15)",
  border: "none", borderRadius: 8,
  color: "#fff", width: 28, height: 28,
  display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", fontSize: 16,
};

const sendBtn: React.CSSProperties = {
  width: 34, height: 34, borderRadius: "50%",
  border: "none", color: "#fff",
  display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", flexShrink: 0, fontSize: 14,
  transition: "transform 0.15s",
};

// ─── Indicador de escritura ─────────────────────────────────

function TypingDots({ color }: { color: string }) {
  return (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center", padding: "2px 0" }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{
          width: 7, height: 7, borderRadius: "50%",
          background: color, opacity: 0.5,
          display: "inline-block",
          animation: `bounce 1.2s ${i * 0.2}s infinite ease-in-out`,
        }} />
      ))}
      <style>{`
        @keyframes bounce {
          0%,80%,100%{transform:translateY(0);opacity:.5}
          40%{transform:translateY(-5px);opacity:1}
        }
      `}</style>
    </span>
  );
}