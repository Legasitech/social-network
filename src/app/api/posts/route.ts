import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createPostSchema = z.object({
  content: z.string().min(1, "Напиши что-нибудь").max(5000),
  imageUrl: z.string().max(500).optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const body = await req.json();
    const data = createPostSchema.parse(body);

    const post = await prisma.post.create({
      data: {
        content: data.content.trim(),
        imageUrl: data.imageUrl || null,
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        _count: { select: { likes: true, comments: true } },
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("Create post error:", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const posts = await prisma.post.findMany({
      take: 30,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        originalPost: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
        likes: { select: { userId: true } },
        _count: { select: { likes: true, comments: true, repostRecords: true } },
      },
    });

    return NextResponse.json({ posts });
  } catch (err) {
    console.error("Get posts error:", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
