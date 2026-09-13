import { NextResponse } from "next/server";

import { getAdminUserId } from "@/lib/admin";
import { getPrisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminUserId = await getAdminUserId();
  if (!adminUserId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const { isAdmin } = (await request.json()) as { isAdmin?: boolean };
  const prisma = await getPrisma();

  // Never let the last admin lock themselves out.
  if (id === adminUserId && isAdmin === false) {
    const remainingAdmins = await prisma.user.count({ where: { isAdmin: true, id: { not: id } } });
    if (remainingAdmins === 0) {
      return NextResponse.json({ error: "不能移除最後一位管理員" }, { status: 400 });
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data: { isAdmin: Boolean(isAdmin) },
  });

  return NextResponse.json({ id: user.id, isAdmin: user.isAdmin });
}
