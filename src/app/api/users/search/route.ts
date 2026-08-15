import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const q = req.nextUrl.searchParams.get("q")?.trim() || "";
    if (q.length < 1) {
      return NextResponse.json({ users: [] });
    }

    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: user.id } },
          {
            OR: [
              { username: { contains: q, mode: "insensitive" } },
              { displayName: { contains: q, mode: "insensitive" } },
            ],
          },
        ],
      },
      take: 20,
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        city: true,
        isOnline: true,
      },
      orderBy: { displayName: "asc" },
    });

    return NextResponse.json({ users });
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
