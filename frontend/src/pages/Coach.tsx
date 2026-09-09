import { FormEvent, useState } from "react";
import { api } from "@/api/client";

interface Message {
  role: "user" | "coach";
  text: string;
}

export default function Coach() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "coach",
      text: "Hi! I’m your FitPlan AI Coach. Ask me about your progress, workouts, rest days, or fitness goals.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const message = input.trim();

    if (!message || loading) {
      return;
    }

    setMessages((current) => [
      ...current,
      { role: "user", text: message },
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await api.coachMessage(message);

      setMessages((current) => [
        ...current,
        { role: "coach", text: response.reply },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "coach",
          text: "Sorry, I could not connect to the AI Coach right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      <div style={{ marginBottom: "24px" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "30px",
            fontWeight: 700,
          }}
        >
          AI Coach
        </h1>

        <p
          style={{
            marginTop: "8px",
            color: "var(--c-text-secondary, #6b7280)",
          }}
        >
          Get personalized fitness guidance based on your profile and recent logs.
        </p>
      </div>

      <div
        style={{
          minHeight: "450px",
          display: "flex",
          flexDirection: "column",
          border: "1px solid var(--c-border, #e5e7eb)",
          borderRadius: "12px",
          background: "var(--c-surface, #ffffff)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            flex: 1,
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            overflowY: "auto",
          }}
        >
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              style={{
                alignSelf:
                  message.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "75%",
                padding: "12px 16px",
                borderRadius: "12px",
                background:
                  message.role === "user"
                    ? "var(--c-primary, #2563eb)"
                    : "var(--c-bg, #f3f4f6)",
                color:
                  message.role === "user"
                    ? "#ffffff"
                    : "var(--c-text, #111827)",
                lineHeight: 1.5,
              }}
            >
              {message.text}
            </div>
          ))}

          {loading && (
            <div
              style={{
                alignSelf: "flex-start",
                padding: "12px 16px",
                borderRadius: "12px",
                background: "var(--c-bg, #f3f4f6)",
                color: "var(--c-text-secondary, #6b7280)",
              }}
            >
              Coach is thinking...
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            gap: "10px",
            padding: "16px",
            borderTop: "1px solid var(--c-border, #e5e7eb)",
          }}
        >
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask your coach something..."
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px",
              border: "1px solid var(--c-border, #d1d5db)",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            style={{
              padding: "12px 20px",
              border: "none",
              borderRadius: "8px",
              background: "var(--c-primary, #2563eb)",
              color: "#ffffff",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
