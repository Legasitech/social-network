import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const sendSchema = z.object({
  conversationId: z.string().optional(),
  recipientId: z.string().optional(),
  content: z.string().max(4000).optional().nullable(),
  imageUrl: z.string().max(1000).optional().nullable(),
  stickerId: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const body = await req.json();
    const data = sendSchema.parse(body);

    if (!data.content?.trim() && !data.imageUrl && !data.stickerId) {
      return NextResponse.json({ error: "Пустое сообщение" }, { status: 400 });
    }

    let conversationId = data.conversationId;

    if (!conversationId && data.recipientId) {
      if (data.recipientId === user.id) {
        return NextResponse.json({ error: "Нельзя писать себе" }, { status: 400 });
      }
      const [user1Id, user2Id] =
        user.id < data.recipientId
          ? [user.id, data.recipientId]
          : [data.recipientId, user.id];

      const existing = await prisma.conversation.findUnique({
        where: { user1Id_user2Id: { user1Id, user2Id } },
        select: { id: true },
      });
      conversationId = existing
        ? existing.id
        : (
            await prisma.conversation.create({
              data: { user1Id, user2Id },
              select: { id: true },
            })
          ).id;
    }

    if (!conversationId) {
      return NextResponse.json(
        { error: "Укажи conversationId или recipientId" },
        { status: 400 }
      );
    }

    // Lightweight access check
    const conv = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ user1Id: user.id }, { user2Id: user.id }],
      },
      select: { id: true, user1Id: true, user2Id: true },
    });
    if (!conv) {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    }

    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId,
          senderId: user.id,
          content: data.content?.trim() || null,
          imageUrl: data.imageUrl || null,
          stickerId: data.stickerId || null,
        },
        select: {
          id: true,
          content: true,
          imageUrl: true,
          stickerId: true,
          senderId: true,
          conversationId: true,
          createdAt: true,
        },
      }),
      prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      }),
    ]);

    // Socket emit (non-blocking)
    try {
      const io = (global as any).io;
      if (io) {
        const payload = { ...message, createdAt: message.createdAt.toISOString() };
        io.to(`conversation:${conversationId}`).emit("message:new", payload);
        const otherId = conv.user1Id === user.id ? conv.user2Id : conv.user1Id;
        io.to(`user:${otherId}`).emit("conversation:update", {
          conversationId,
          lastMessage: payload,
        });
      }
    } catch {
      /* ignore */
    }

    return NextResponse.json(
      {
        message: {
          ...message,
          createdAt: message.createdAt.toISOString(),
        },
        conversationId,
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("Send message error:", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
