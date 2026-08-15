import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9_]+$/, "Только латиница, цифры и _"),
  description: z.string().max(1000).optional(),
  isPrivate: z.boolean().optional(),
});

export async function GET() {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const groups = await prisma.group.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        owner: { select: { id: true, username: true, displayName: true } },
        _count: { select: { members: true, posts: true } },
      },
    });

    return NextResponse.json({ groups });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const body = await req.json();
    const data = createSchema.parse(body);

    const existing = await prisma.group.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return NextResponse.json({ error: "Такой slug уже занят" }, { status: 400 });
    }

    const group = await prisma.group.create({
      data: {
        name: data.name,
        slug: data.slug.toLowerCase(),
        description: data.description || null,
        isPrivate: data.isPrivate || false,
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
      include: {
        owner: { select: { id: true, username: true, displayName: true } },
        _count: { select: { members: true } },
      },
    });

    return NextResponse.json({ group }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
