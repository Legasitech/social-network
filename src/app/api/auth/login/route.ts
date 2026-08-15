import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";

const loginSchema = z.object({
  emailOrUsername: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = loginSchema.parse(body);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.emailOrUsername.toLowerCase() },
          { username: data.emailOrUsername.toLowerCase() },
        ],
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 });
    }

    const valid = await verifyPassword(data.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 });
    }

    await createSession(user.id);

    // Update online status
    await prisma.user.update({
      where: { id: user.id },
      data: { isOnline: true, lastSeenAt: new Date() },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("Login error:", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
