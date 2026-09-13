import { NextResponse } from "next/server";

import { getAdminUserId } from "@/lib/admin";
import { getPrisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminUserId = await getAdminUserId();
  if (!adminUserId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const prisma = await getPrisma();

  // Cascades to members/suggestions/comments/updates via onDelete: Cascade.
  await prisma.project.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
