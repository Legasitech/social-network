import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_SIZE = 8 * 1024 * 1024; // 8MB

const FOLDER_MAP: Record<string, string> = {
  avatar: "avatars",
  cover: "covers",
  post: "posts",
  message: "messages",
  sticker: "stickers",
};

export async function POST(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) || "post";

    if (!file) {
      return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Только JPEG, PNG, WebP, GIF" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Максимум 8 МБ" }, { status: 400 });
    }

    const folder = FOLDER_MAP[type] || "posts";
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext)
      ? ext
      : "jpg";
    const filename = `${randomUUID()}.${safeExt}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(uploadDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const url = `/uploads/${folder}/${filename}`;

    return NextResponse.json({ url, filename });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Ошибка загрузки" }, { status: 500 });
  }
}
