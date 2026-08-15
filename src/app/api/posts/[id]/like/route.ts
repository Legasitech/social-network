import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { id: postId } = await params;

    const existing = await prisma.like.findUnique({
      where: {
        postId_userId: { postId, userId: user.id },
      },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      return NextResponse.json({ liked: false });
    }

    await prisma.like.create({
      data: { postId, userId: user.id },
    });

    return NextResponse.json({ liked: true });
  } catch (err) {
    console.error("Like error:", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
