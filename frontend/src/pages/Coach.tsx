import { FormEvent, useState } from "react";
import { api } from "@/api/client";
import "./Coach.css";

interface Message {
  role: "user" | "coach";
  text: string;
}

const SUGGESTIONS = [
  "What should I focus on in my workout today?",
  "How can I improve recovery on rest days?",
  "What should I eat after a workout?",
  "How do I stay consistent with my fitness goal?",
];

export default function Coach() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "coach",
      text: "Hi! I'm your FitPlan AI Coach. Ask me about your progress, workouts, rest days, or fitness goals.",
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

  function handleSuggestionClick(text: string) {
    if (loading) return;
    setInput(text);
  }

  return (
    <div className="fp-coach-page">
      <header className="fp-coach-header">
        <div className="fp-coach-header-copy">
          <span className="fp-coach-eyebrow">PERSONAL GUIDANCE</span>
          <h1>AI Coach</h1>
          <p>
            Get personalized fitness guidance based on your profile,
            workouts, and recent activity.
          </p>
        </div>

        <div className="fp-coach-status-card">
          <span className="fp-coach-status-dot" />
          <div>
            <strong>AI Coach ready</strong>
            <small>Real-time guidance</small>
          </div>
        </div>
      </header>

      <section className="fp-coach-shell">
        <aside className="fp-coach-sidebar">
          <div className="fp-coach-sidebar-top">
            <div className="fp-coach-sidebar-icon" aria-hidden="true">
              AI
            </div>

            <div>
              <span className="fp-coach-sidebar-label">FITPLAN COACH</span>
              <h2>Ask smarter fitness questions</h2>
              <p>
                Get guidance for workouts, recovery, nutrition,
                consistency, and progress.
              </p>
            </div>
          </div>

          <div className="fp-coach-feature-list">
            <div className="fp-coach-feature">
              <span>01</span>
              <div>
                <strong>Workout help</strong>
                <p>Exercise guidance and training tips.</p>
              </div>
            </div>

            <div className="fp-coach-feature">
              <span>02</span>
              <div>
                <strong>Recovery advice</strong>
                <p>Rest-day and soreness support.</p>
              </div>
            </div>

            <div className="fp-coach-feature">
              <span>03</span>
              <div>
                <strong>Nutrition support</strong>
                <p>Simple food and meal guidance.</p>
              </div>
            </div>
          </div>

          <div className="fp-coach-topic-tags">
            <span>Workouts</span>
            <span>Recovery</span>
            <span>Nutrition</span>
            <span>Progress</span>
          </div>
        </aside>

        <div className="fp-coach-chat">
          <div className="fp-coach-chat-topbar">
            <div>
              <strong>Conversation</strong>
              <p>Your AI fitness assistant</p>
            </div>

            <span className="fp-coach-chat-pill">
              {messages.length} message{messages.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="fp-coach-messages">
            {messages.length === 1 && !loading && (
              <div className="fp-coach-welcome">
                <div className="fp-coach-welcome-icon">?</div>
                <div>
                  <strong>Start with a quick question</strong>
                  <p>
                    Use one of these prompts or type your own message below.
                  </p>
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                className={`fp-coach-message fp-coach-message--${message.role}`}
                key={`${message.role}-${index}`}
              >
                <div className="fp-coach-message-avatar">
                  {message.role === "user" ? "You" : "AI"}
                </div>

                <div className="fp-coach-message-bubble">
                  {message.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="fp-coach-message fp-coach-message--coach">
                <div className="fp-coach-message-avatar">AI</div>
                <div className="fp-coach-message-bubble fp-coach-thinking">
                  <span />
                  <span />
                  <span />
                  <em>Coach is thinking...</em>
                </div>
              </div>
            )}
          </div>

          <div className="fp-coach-suggestions">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={loading}
                className="fp-coach-suggestion-btn"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <form className="fp-coach-composer" onSubmit={handleSubmit}>
            <div className="fp-coach-input-wrap">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask your coach something..."
                disabled={loading}
                aria-label="Message your AI Coach"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !input.trim()}
            >
              Send
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
