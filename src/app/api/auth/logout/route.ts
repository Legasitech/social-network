import { NextResponse } from "next/server";
import { destroySession, getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const user = await getSession();
  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { isOnline: false, lastSeenAt: new Date() },
    });
  }
  await destroySession();
  return NextResponse.json({ ok: true });
}
