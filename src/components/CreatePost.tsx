"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, X } from "lucide-react";

interface Props {
  displayName: string;
  avatarUrl?: string | null;
}

export default function CreatePost({ displayName, avatarUrl }: Props) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setError("Максимум 8 МБ");
      return;
    }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  }

  function clearImage() {
    setImageFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || loading) return;

    setLoading(true);
    setError("");

    try {
      let imageUrl: string | null = null;

      if (imageFile) {
        const fd = new FormData();
        fd.append("file", imageFile);
        fd.append("type", "post");
        const up = await fetch("/api/upload", { method: "POST", body: fd });
        const upData = await up.json();
        if (!up.ok) {
          setError(upData.error || "Ошибка загрузки фото");
          setLoading(false);
          return;
        }
        imageUrl = upData.url;
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          imageUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка");
        return;
      }

      setContent("");
      clearImage();
      router.refresh();
    } catch {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="w-10 h-10 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-semibold shrink-0">
              {displayName[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Что у вас нового?"
              rows={3}
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-[15px] text-[var(--foreground)] placeholder:text-[var(--muted-dark)] focus:outline-none focus:border-[var(--primary)] resize-none transition"
            />

            {preview && (
              <div className="relative mt-2 inline-block">
                <img
                  src={preview}
                  alt=""
                  className="max-h-48 rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-black/80"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-400 mt-1.5">{error}</p>
            )}

            <div className="flex justify-between items-center mt-2">
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={onFileChange}
                  className="hidden"
                  id="post-image"
                />
                <label
                  htmlFor="post-image"
                  className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--primary)] cursor-pointer transition"
                >
                  <ImagePlus size={18} />
                  Фото
                </label>
              </div>
              <button
                type="submit"
                disabled={!content.trim() || loading}
                className="px-5 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-medium rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? "Публикуем..." : "Опубликовать"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
