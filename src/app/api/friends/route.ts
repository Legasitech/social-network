import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const actionSchema = z.object({
  userId: z.string().min(1),
  action: z.enum(["request", "accept", "reject", "remove"]),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const body = await req.json();
    const { userId, action } = actionSchema.parse(body);

    if (userId === user.id) {
      return NextResponse.json({ error: "Нельзя добавить себя" }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    if (action === "request") {
      const existing = await prisma.friendship.findFirst({
        where: {
          OR: [
            { senderId: user.id, receiverId: userId },
            { senderId: userId, receiverId: user.id },
          ],
        },
      });

      if (existing) {
        if (existing.status === "ACCEPTED") {
          return NextResponse.json({ error: "Уже друзья" }, { status: 400 });
        }
        if (existing.status === "PENDING") {
          return NextResponse.json({ error: "Заявка уже отправлена" }, { status: 400 });
        }
      }

      await prisma.friendship.create({
        data: {
          senderId: user.id,
          receiverId: userId,
          status: "PENDING",
        },
      });

      return NextResponse.json({ ok: true, status: "PENDING" });
    }

    if (action === "accept") {
      const friendship = await prisma.friendship.findFirst({
        where: {
          senderId: userId,
          receiverId: user.id,
          status: "PENDING",
        },
      });

      if (!friendship) {
        return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 });
      }

      await prisma.friendship.update({
        where: { id: friendship.id },
        data: { status: "ACCEPTED" },
      });

      return NextResponse.json({ ok: true, status: "ACCEPTED" });
    }

    if (action === "reject" || action === "remove") {
      await prisma.friendship.deleteMany({
        where: {
          OR: [
            { senderId: user.id, receiverId: userId },
            { senderId: userId, receiverId: user.id },
          ],
        },
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Неизвестное действие" }, { status: 400 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("Friends error:", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: user.id, status: "ACCEPTED" },
          { receiverId: user.id, status: "ACCEPTED" },
          { receiverId: user.id, status: "PENDING" },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            isOnline: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            isOnline: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const friends = friendships
      .filter((f) => f.status === "ACCEPTED")
      .map((f) => (f.senderId === user.id ? f.receiver : f.sender));

    const incoming = friendships
      .filter((f) => f.status === "PENDING" && f.receiverId === user.id)
      .map((f) => f.sender);

    return NextResponse.json({ friends, incoming });
  } catch (err) {
    console.error("Get friends error:", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
