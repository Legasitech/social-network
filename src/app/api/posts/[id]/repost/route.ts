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

    const original = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: { select: { id: true, username: true, displayName: true } } },
    });

    if (!original) {
      return NextResponse.json({ error: "Пост не найден" }, { status: 404 });
    }

    // Check if already reposted
    const existing = await prisma.repost.findUnique({
      where: { postId_userId: { postId, userId: user.id } },
    });

    if (existing) {
      // Un-repost
      await prisma.repost.delete({ where: { id: existing.id } });
      // Also delete the repost post if exists
      await prisma.post.deleteMany({
        where: { originalPostId: postId, authorId: user.id },
      });
      return NextResponse.json({ reposted: false });
    }

    // Create repost record + a post that references original
    await prisma.$transaction([
      prisma.repost.create({
        data: { postId, userId: user.id },
      }),
      prisma.post.create({
        data: {
          content: original.content,
          imageUrl: original.imageUrl,
          authorId: user.id,
          originalPostId: postId,
        },
      }),
    ]);

    return NextResponse.json({ reposted: true });
  } catch (err) {
    console.error("Repost error:", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
