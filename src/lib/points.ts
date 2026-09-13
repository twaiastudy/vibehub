import { LedgerReason } from "@prisma/client";

import { getPrisma } from "@/lib/prisma";

// Single anchor constant everything else derives from: the foundational
// course price suggestion (src/lib/courses.ts) and the invite-course
// referral bonus are both computed relative to this, so tuning the signup
// bonus keeps course pricing/rewards proportionally in sync instead of
// three independently-maintained numbers.
export const WELCOME_BONUS_POINTS = 10;

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

/**
 * Spends points: `amount` is the positive cost. Returns null (and writes
 * nothing) if the balance is insufficient. The balance check and
 * decrement happen as one atomic conditional update (`WHERE pointsBalance
 * >= amount`) so two concurrent spends can't both succeed against a
 * balance that only covers one of them — D1 can't hold an interactive
 * transaction open to check-then-write, so the guard has to live in the
 * update's WHERE clause instead. The ledger entry is written just after,
 * as a separate statement; there's a narrow window where the decrement
 * could succeed without the entry following it, but that's the same
 * D1-imposed tradeoff as everywhere else in this file.
 */
export async function spendPoints(params: {
  userId: string;
  amount: number;
  reason: LedgerReason;
  refType?: string;
  refId?: string;
}) {
  const { userId, amount, reason, refType, refId } = params;
  if (amount <= 0) {
    throw new Error("spendPoints amount must be positive");
  }
  const prisma = await getPrisma();

  const { count } = await prisma.user.updateMany({
    where: { id: userId, pointsBalance: { gte: amount } },
    data: { pointsBalance: { decrement: amount } },
  });
  if (count === 0) {
    return null;
  }

  return prisma.pointsLedgerEntry.create({
    data: { userId, amount: -amount, reason, refType, refId },
  });
}
