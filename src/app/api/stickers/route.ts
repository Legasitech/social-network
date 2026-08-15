import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const packs = await prisma.stickerPack.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        stickers: {
          orderBy: { id: "asc" },
        },
      },
    });

    return NextResponse.json({ packs });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
