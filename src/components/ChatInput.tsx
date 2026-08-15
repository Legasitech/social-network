"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, ImagePlus, Smile, X } from "lucide-react";
import { connectSocket, getSocket } from "@/lib/socket";
import { STICKER_PACKS } from "@/lib/stickers";

interface Props {
  conversationId: string;
  userId: string;
}

export default function ChatInput({ conversationId, userId }: Props) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [activePack, setActivePack] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const s = connectSocket(userId);
    s.emit("join:conversation", conversationId);
    textareaRef.current?.focus();
  }, [conversationId, userId]);

  const emitTyping = useCallback(
    (start: boolean) => {
      try {
        const s = getSocket();
        if (s.connected) {
          s.emit(start ? "typing:start" : "typing:stop", {
            conversationId,
            userId,
          });
        }
      } catch {
        /* ignore */
      }
    },
    [conversationId, userId]
  );

  function onChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value);
    emitTyping(true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => emitTyping(false), 1000);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function clearImage() {
    setImageFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function pushLocal(msg: {
    id: string;
    content?: string | null;
    imageUrl?: string | null;
    senderId: string;
    createdAt: string;
    pending?: boolean;
  }) {
    window.dispatchEvent(
      new CustomEvent("chat:local-message", { detail: msg })
    );
  }

  async function sendPayload(payload: {
    content?: string;
    imageUrl?: string;
  }) {
    const tempId = "tmp-" + Date.now();
    const now = new Date().toISOString();

    // Instant UI
    pushLocal({
      id: tempId,
      content: payload.content || null,
      imageUrl: payload.imageUrl || null,
      senderId: userId,
      createdAt: now,
      pending: true,
    });

    // Fire and forget style - don't block UI
    setLoading(true);
    fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, ...payload }),
    })
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        if (data.message) {
          pushLocal({
            id: data.message.id,
            content: data.message.content,
            imageUrl: data.message.imageUrl,
            senderId: data.message.senderId,
            createdAt: data.message.createdAt || now,
            pending: false,
          });
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        textareaRef.current?.focus();
      });
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if ((!content.trim() && !imageFile) || loading) return;

    const text = content.trim();
    setContent("");
    emitTyping(false);

    let imageUrl: string | undefined;
    if (imageFile) {
      const fd = new FormData();
      fd.append("file", imageFile);
      fd.append("type", "message");
      try {
        const up = await fetch("/api/upload", { method: "POST", body: fd });
        const upData = await up.json();
        if (up.ok) imageUrl = upData.url;
      } catch {
        /* ignore */
      }
      clearImage();
    }

    sendPayload({ content: text || undefined, imageUrl });
  }

  function sendSticker(imageUrl: string) {
    setShowStickers(false);
    sendPayload({ imageUrl });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="shrink-0 border-t border-[var(--border)]">
      {showStickers && (
        <div className="border-b border-[var(--border)] max-h-52 flex flex-col bg-[var(--card)]">
          <div className="flex gap-1 px-2 pt-2 overflow-x-auto">
            {STICKER_PACKS.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePack(i)}
                className={`px-3 py-1 text-xs rounded-lg whitespace-nowrap transition ${
                  activePack === i
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--background)] text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-2 grid grid-cols-5 sm:grid-cols-6 gap-1">
            {STICKER_PACKS[activePack]?.stickers.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => sendSticker(s.imageUrl)}
                className="aspect-square p-1 hover:bg-[var(--card-hover)] rounded-lg transition flex items-center justify-center"
                title={s.name}
              >
                <img
                  src={s.imageUrl}
                  alt={s.name}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {preview && (
        <div className="px-3 pt-2">
          <div className="relative inline-block">
            <img src={preview} alt="" className="h-16 rounded-lg object-cover" />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -top-1.5 -right-1.5 p-0.5 bg-[var(--card-hover)] rounded-full text-[var(--muted)]"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-3 flex items-end gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
          id="msg-image"
        />
        <label
          htmlFor="msg-image"
          className="p-2 text-[var(--muted)] hover:text-[var(--primary)] cursor-pointer transition shrink-0"
        >
          <ImagePlus size={20} />
        </label>
        <button
          type="button"
          onClick={() => setShowStickers(!showStickers)}
          className={`p-2 transition shrink-0 ${
            showStickers
              ? "text-[var(--primary)]"
              : "text-[var(--muted)] hover:text-[var(--primary)]"
          }`}
        >
          <Smile size={20} />
        </button>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder="Написать сообщение..."
          rows={1}
          className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2 text-[14px] text-[var(--foreground)] placeholder:text-[var(--muted-dark)] focus:outline-none focus:border-[var(--primary)] resize-none max-h-28 transition"
        />
        <button
          type="submit"
          disabled={(!content.trim() && !imageFile) || loading}
          className="p-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
