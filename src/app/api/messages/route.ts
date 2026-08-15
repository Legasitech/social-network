import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const sendSchema = z.object({
  conversationId: z.string().optional(),
  recipientId: z.string().optional(),
  content: z.string().min(1).max(4000),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const body = await req.json();
    const data = sendSchema.parse(body);

    let conversationId = data.conversationId;

    // Create conversation if needed
    if (!conversationId && data.recipientId) {
      if (data.recipientId === user.id) {
        return NextResponse.json({ error: "Нельзя писать себе" }, { status: 400 });
      }

      // Normalize order so unique constraint works
      const [user1Id, user2Id] =
        user.id < data.recipientId
          ? [user.id, data.recipientId]
          : [data.recipientId, user.id];

      let conv = await prisma.conversation.findUnique({
        where: {
          user1Id_user2Id: { user1Id, user2Id },
        },
      });

      if (!conv) {
        conv = await prisma.conversation.create({
          data: { user1Id, user2Id },
        });
      }

      conversationId = conv.id;
    }

    if (!conversationId) {
      return NextResponse.json({ error: "Укажи conversationId или recipientId" }, { status: 400 });
    }

    // Verify access
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
        content: data.content.trim(),
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
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    return NextResponse.json({ message, conversationId }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("Send message error:", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
