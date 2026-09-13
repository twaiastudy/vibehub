import { LedgerReason } from "@prisma/client";

import { getPrisma } from "@/lib/prisma";

/**
 * Points must never be changed by writing pointsBalance directly.
 * Every change is an append-only ledger entry, applied to the balance
 * in the same transaction, so history stays auditable and concurrent
 * awards can't race each other. Uses the sequential (batched) form of
 * $transaction rather than the interactive callback form, since D1
 * only supports batching independent statements, not holding a
 * connection open across awaited round-trips.
 */
export async function awardPoints(params: {
  userId: string;
  amount: number;
  reason: LedgerReason;
  refType?: string;
  refId?: string;
}) {
  const { userId, amount, reason, refType, refId } = params;
  const prisma = await getPrisma();

  const [entry] = await prisma.$transaction([
    prisma.pointsLedgerEntry.create({
      data: { userId, amount, reason, refType, refId },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { pointsBalance: { increment: amount } },
    }),
  ]);

  return entry;
}
