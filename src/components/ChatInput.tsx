"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";

interface Props {
  conversationId: string;
}

export default function ChatInput({ conversationId }: Props) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!content.trim() || loading) return;

    setLoading(true);
    const text = content.trim();
    setContent("");

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, content: text }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        setContent(text);
      }
    } catch {
      setContent(text);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 border-t border-[var(--border)] flex items-end gap-2 shrink-0"
    >
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Написать сообщение..."
        rows={1}
        className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[15px] text-[var(--foreground)] placeholder:text-[var(--muted-dark)] focus:outline-none focus:border-[var(--primary)] resize-none max-h-32 transition"
      />
      <button
        type="submit"
        disabled={!content.trim() || loading}
        className="p-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
      >
        <Send size={18} />
      </button>
    </form>
  );
}
