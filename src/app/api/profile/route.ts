import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  status: z.string().max(100).optional().nullable(),
  avatarUrl: z.string().max(500).optional().nullable().or(z.literal("")),
  coverUrl: z.string().max(500).optional().nullable().or(z.literal("")),
});

export async function PATCH(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const body = await req.json();
    const data = updateSchema.parse(body);

    const updateData: Record<string, unknown> = {};
    if (data.displayName !== undefined) updateData.displayName = data.displayName;
    if (data.bio !== undefined) updateData.bio = data.bio || null;
    if (data.city !== undefined) updateData.city = data.city || null;
    if (data.status !== undefined) updateData.status = data.status || null;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl || null;
    if (data.coverUrl !== undefined) updateData.coverUrl = data.coverUrl || null;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        coverUrl: true,
        bio: true,
        city: true,
        status: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("Update profile error:", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
