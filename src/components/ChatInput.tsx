"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Send, ImagePlus, Sticker, X } from "lucide-react";
import { connectSocket, getSocket } from "@/lib/socket";

interface StickerItem {
  id: string;
  imageUrl: string;
  emoji?: string | null;
}

interface Pack {
  id: string;
  name: string;
  stickers: StickerItem[];
}

interface Props {
  conversationId: string;
  userId: string;
  onNewMessage?: (msg: any) => void;
}

export default function ChatInput({ conversationId, userId, onNewMessage }: Props) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [activePack, setActivePack] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const s = connectSocket(userId);
    s.emit("join:conversation", conversationId);

    const onMessage = (msg: any) => {
      if (msg.conversationId === conversationId) {
        onNewMessage?.(msg);
        router.refresh();
      }
    };
    s.on("message:new", onMessage);

    return () => {
      s.emit("leave:conversation", conversationId);
      s.off("message:new", onMessage);
    };
  }, [conversationId, userId, onNewMessage, router]);

  useEffect(() => {
    if (showStickers && packs.length === 0) {
      fetch("/api/stickers")
        .then((r) => r.json())
        .then((d) => setPacks(d.packs || []))
        .catch(() => {});
    }
  }, [showStickers, packs.length]);

  const emitTyping = useCallback(
    (start: boolean) => {
      const s = getSocket();
      if (!s.connected) return;
      s.emit(start ? "typing:start" : "typing:stop", {
        conversationId,
        userId,
      });
    },
    [conversationId, userId]
  );

  function onChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value);
    emitTyping(true);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => emitTyping(false), 1500);
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

  async function sendMessage(payload: {
    content?: string;
    imageUrl?: string;
    stickerId?: string;
  }) {
    setLoading(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, ...payload }),
      });
      if (res.ok) {
        const data = await res.json();
        // emit via socket for realtime
        const s = getSocket();
        if (s.connected && data.message) {
          s.emit("message:send", {
            ...data.message,
            conversationId,
          });
          // also broadcast from client side for peers
          s.to?.(`conversation:${conversationId}`);
        }
        router.refresh();
        onNewMessage?.(data.message);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
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
      const up = await fetch("/api/upload", { method: "POST", body: fd });
      const upData = await up.json();
      if (!up.ok) {
        setContent(text);
        return;
      }
      imageUrl = upData.url;
      clearImage();
    }

    await sendMessage({ content: text || undefined, imageUrl });
  }

  async function sendSticker(stickerId: string) {
    setShowStickers(false);
    await sendMessage({ stickerId });
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
        <div className="border-b border-[var(--border)] bg-[var(--card)] max-h-56 overflow-hidden flex flex-col">
          <div className="flex gap-1 px-2 pt-2 overflow-x-auto">
            {packs.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setActivePack(i)}
                className={`px-3 py-1 text-xs rounded-lg whitespace-nowrap ${
                  activePack === i
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--background)] text-[var(--muted)]"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-2 grid grid-cols-6 gap-1">
            {(packs[activePack]?.stickers || []).map((s) => (
              <button
                key={s.id}
                onClick={() => sendSticker(s.id)}
                className="aspect-square p-1 hover:bg-[var(--card-hover)] rounded-lg transition"
              >
                <img src={s.imageUrl} alt={s.emoji || ""} className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
        </div>
      )}

      {preview && (
        <div className="px-3 pt-2">
          <div className="relative inline-block">
            <img src={preview} alt="" className="h-20 rounded-lg object-cover" />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -top-1 -right-1 p-0.5 bg-black/70 rounded-full text-white"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="p-3 flex items-end gap-2"
      >
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
            showStickers ? "text-[var(--primary)]" : "text-[var(--muted)] hover:text-[var(--primary)]"
          }`}
        >
          <Sticker size={20} />
        </button>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder="Написать сообщение..."
          rows={1}
          className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[15px] text-[var(--foreground)] placeholder:text-[var(--muted-dark)] focus:outline-none focus:border-[var(--primary)] resize-none max-h-32 transition"
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
