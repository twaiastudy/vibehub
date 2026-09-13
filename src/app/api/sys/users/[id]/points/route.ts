import { NextResponse } from "next/server";

import { getAdminUserId } from "@/lib/admin";
import { awardPoints } from "@/lib/points";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminUserId = await getAdminUserId();
  if (!adminUserId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const { amount } = (await request.json()) as { amount?: number };

  if (!Number.isInteger(amount) || amount === 0) {
    return NextResponse.json({ error: "amount must be a non-zero integer" }, { status: 400 });
  }

  // refId records which admin made the adjustment, for audit purposes.
  const entry = await awardPoints({
    userId: id,
    amount: amount as number,
    reason: "MANUAL_ADJUSTMENT",
    refType: "AdminAdjustment",
    refId: adminUserId,
  });

  return NextResponse.json(entry);
}
