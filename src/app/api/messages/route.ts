import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const sendSchema = z.object({
  conversationId: z.string().optional(),
  recipientId: z.string().optional(),
  content: z.string().max(4000).optional().nullable(),
  imageUrl: z.string().optional().nullable(),
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

      let conv = await prisma.conversation.findUnique({
        where: { user1Id_user2Id: { user1Id, user2Id } },
      });

      if (!conv) {
        conv = await prisma.conversation.create({
          data: { user1Id, user2Id },
        });
      }

      conversationId = conv.id;
    }

    if (!conversationId) {
      return NextResponse.json(
        { error: "Укажи conversationId или recipientId" },
        { status: 400 }
      );
    }

    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conv || (conv.user1Id !== user.id && conv.user2Id !== user.id)) {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: user.id,
        content: data.content?.trim() || null,
        imageUrl: data.imageUrl || null,
        stickerId: data.stickerId || null,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        sticker: true,
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    // Emit via global Socket.io if available
    try {
      const io = (global as any).io;
      if (io) {
        io.to(`conversation:${conversationId}`).emit("message:new", {
          ...message,
          conversationId,
        });
        // notify the other user for conversation list update
        const otherId =
          conv.user1Id === user.id ? conv.user2Id : conv.user1Id;
        io.to(`user:${otherId}`).emit("conversation:update", {
          conversationId,
          lastMessage: message,
        });
      }
    } catch (e) {
      console.error("Socket emit error:", e);
    }

    return NextResponse.json({ message, conversationId }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("Send message error:", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
