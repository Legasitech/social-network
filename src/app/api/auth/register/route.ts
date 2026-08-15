import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";

const registerSchema = z.object({
  email: z.string().email("Некорректный email"),
  username: z
    .string()
    .min(3, "Минимум 3 символа")
    .max(30, "Максимум 30 символов")
    .regex(/^[a-zA-Z0-9_]+$/, "Только латиница, цифры и _"),
  password: z.string().min(6, "Минимум 6 символов"),
  displayName: z.string().min(1, "Укажите имя").max(50),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    // Check uniqueness
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email.toLowerCase() }, { username: data.username.toLowerCase() }],
      },
    });

    if (existing) {
      if (existing.email === data.email.toLowerCase()) {
        return NextResponse.json({ error: "Email уже занят" }, { status: 400 });
      }
      return NextResponse.json({ error: "Юзернейм уже занят" }, { status: 400 });
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        username: data.username.toLowerCase(),
        passwordHash,
        displayName: data.displayName,
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
      },
    });

    await createSession(user.id);

    return NextResponse.json({ user }, { status: 201 });
    } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      {
        error: "Ошибка сервера",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
