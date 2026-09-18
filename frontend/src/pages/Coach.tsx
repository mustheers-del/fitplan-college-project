import { FormEvent, useState } from "react";
import { api } from "@/api/client";
import "./Coach.css";

interface Message {
  role: "user" | "coach";
  text: string;
}

export default function Coach() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "coach",
      text: "Hi! I�m your FitPlan AI Coach. Ask me about your progress, workouts, rest days, or fitness goals.",
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
    <div className="coach-page">
      <div className="coach-page-heading"><span className="section-label">PERSONAL GUIDANCE</span><h1>AI Coach</h1><p>Get personalized fitness guidance based on your profile and recent logs.</p></div>
      <div className="coach-chat">
        <div className="coach-messages">
          {messages.map((message, index) => (
            <div className={`coach-message ${message.role}`} key={`${message.role}-${index}`}>
              {message.text}
            </div>
          ))}

          {loading && (
            <div className="coach-message coach">Coach is thinking...</div>
          )}
        </div>

        <form className="coach-composer" onSubmit={handleSubmit}>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask your coach something..."
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
