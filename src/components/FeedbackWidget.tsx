// src/components/FeedbackWidget.tsx
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import axios from "axios";

const BASE_API_URL = import.meta.env.VITE_API_URL;

export const FeedbackWidget = () => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"feedback" | "bug">("feedback");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Pre-fill email if logged in
  const emailValue = email || user?.email || "";

  async function handleSubmit() {
    if (!message.trim()) {
      toast("Please enter a message", "warning");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${BASE_API_URL}/feedback`, {
        type,
        message,
        email: emailValue,
      });
      toast("Feedback sent — thank you!", "success");
      setOpen(false);
      setMessage("");
      setType("feedback");
    } catch {
      toast("Failed to send feedback", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    const handleChange = () => setIsMobile(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: "fixed",
          bottom: isMobile ? 55 : 24,
          right: 24,
          zIndex: 99,
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "7px 12px",
          borderRadius: 99,
          background: "#1a1a24",
          border: "0.5px solid rgba(255,255,255,0.1)",
          color: "#94a3b8",
          fontSize: 12,
          cursor: "pointer",
          transition: "all .15s",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)";
          e.currentTarget.style.color = "#e2e8f0";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
          e.currentTarget.style.color = "#94a3b8";
        }}
      >
        <span style={{ fontSize: 14 }}>{open ? "✕" : "💬"}</span>
        {open ? "Close" : "Feedback"}
      </button>

      {/* Popover form */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 64,
            right: 24,
            zIndex: 99,
            width: 320,
            background: "#111118",
            border: "0.5px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {/* Header */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0" }}>
              Send feedback
            </div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>
              Report a bug or share your thoughts
            </div>
          </div>

          {/* Type toggle */}
          <div style={{ display: "flex", gap: 6 }}>
            {(["feedback", "bug"] as const).map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                style={{
                  flex: 1,
                  padding: "5px 0",
                  borderRadius: 6,
                  fontSize: 12,
                  cursor: "pointer",
                  transition: "all .15s",
                  background: type === t ? "#6366f1" : "rgba(255,255,255,0.04)",
                  border: `0.5px solid ${type === t ? "#6366f1" : "rgba(255,255,255,0.08)"}`,
                  color: type === t ? "#fff" : "#94a3b8",
                }}
              >
                {t === "bug" ? " Bug report" : "💬 Feedback"}
              </button>
            ))}
          </div>

          {/* Message */}
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder={
              type === "bug"
                ? "Describe the bug — what happened, what did you expect?"
                : "What's on your mind?"
            }
            rows={4}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "0.5px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              padding: "8px 10px",
              color: "#e2e8f0",
              fontSize: 13,
              resize: "vertical",
              outline: "none",
              fontFamily: "inherit",
            }}
            onFocus={e => (e.target.style.borderColor = "rgba(99,102,241,0.4)")}
            onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
          />

          {/* Email */}
          <input
            value={emailValue}
            onChange={e => setEmail(e.target.value)}
            placeholder="Your email (optional)"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "0.5px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              padding: "7px 10px",
              color: "#e2e8f0",
              fontSize: 12,
              outline: "none",
            }}
            onFocus={e => (e.target.style.borderColor = "rgba(99,102,241,0.4)")}
            onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
          />

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting || !message.trim()}
            style={{
              padding: "8px 0",
              borderRadius: 8,
              background: "#6366f1",
              border: "none",
              color: "#fff",
              fontSize: 13,
              fontWeight: 500,
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting || !message.trim() ? 0.5 : 1,
              transition: "opacity .15s",
            }}
          >
            {submitting ? "Sending…" : "Send feedback"}
          </button>
        </div>
      )}
    </>
  );
};
