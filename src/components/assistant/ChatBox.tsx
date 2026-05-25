"use client";

import { useEffect, useRef, useState } from "react";
import { useSelectedState } from "@/components/states/SelectedStateContext";

type AssistantResponse = {
  question: string;
  message: string;
};

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

function LinkifiedText({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s)]+)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("http://") || part.startsWith("https://")) {
          return (
            <a
              key={`${part}-${index}`}
              href={part}
              target="_blank"
              rel="noreferrer"
              className="font-bold text-sky-700 underline decoration-sky-300 underline-offset-4"
            >
              {part}
            </a>
          );
        }

        return <span key={`${part}-${index}`}>{part}</span>;
      })}
    </>
  );
}

export function ChatBox() {
  const { selectedStateCode } = useSelectedState();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hello, I am your DMV assistant. How can I help you?",
    },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function sendMessage() {
    const question = input.trim();

    if (!question || isLoading) {
      return;
    }

    setInput("");
    setIsLoading(true);

    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        role: "user",
        text: question,
      },
    ]);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          stateCode: selectedStateCode,
        }),
      });

      const data = (await response.json()) as AssistantResponse;

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: data.message,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto flex h-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
      <div className="shrink-0 border-b border-slate-200 px-5 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-sky-700">
              DMV AI Assistant
            </p>
            <h1 className="mt-1 text-xl font-black text-slate-950">
              Official DMV-focused study help
            </h1>
          </div>

          <span className="rounded-2xl bg-sky-50 px-4 py-2 text-xs font-black text-sky-700">
            {selectedStateCode ?? "No state"}
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-slate-50/70 px-4 py-6 sm:px-6">
        {messages.map((message) => {
          const isUser = message.role === "user";

          return (
            <div
              key={message.id}
              className={isUser ? "flex justify-end" : "flex justify-start"}
            >
              <div
                className={
                  isUser
                    ? "max-w-[82%] rounded-3xl rounded-br-md bg-slate-950 px-5 py-4 text-sm font-semibold leading-7 text-white shadow-lg"
                    : "max-w-[82%] whitespace-pre-line rounded-3xl rounded-bl-md border border-slate-200 bg-white px-5 py-4 text-sm font-semibold leading-7 text-slate-700 shadow-sm"
                }
              >
                <LinkifiedText text={message.text} />
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-3xl rounded-bl-md border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-500 shadow-sm">
              Thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0 border-t border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                sendMessage();
              }
            }}
            placeholder="Ask about DMV rules, official links, road tests, road signs, or documents..."
            className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
          />

          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="rounded-2xl bg-slate-950 px-6 py-4 text-sm font-black text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Ask AI
          </button>
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-500">
          This is not an official DMV website. For real learner stories, use the Experiences page.
        </p>
      </div>
    </section>
  );
}

