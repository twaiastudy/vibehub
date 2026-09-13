import type { PrismaClient } from "@prisma/client";

import { getPrisma } from "@/lib/prisma";
import { awardPoints } from "@/lib/points";
import { getReferralCourseBonusAmount } from "@/lib/courses";

// Rewards go to the inviter for the invitee's real activity, not for the
// invite itself, so a batch of throwaway signups earns nothing on its own.
export const REFERRAL_POINTS = {
  SIGNUP: 20,
  FIRST_TASK: 50,
  FIRST_PROJECT: 100,
} as const;

async function alreadyRewarded(
  prisma: PrismaClient,
  inviterId: string,
  inviteeId: string,
  reason: "REFERRAL_SIGNUP" | "REFERRAL_FIRST_TASK" | "REFERRAL_FIRST_PROJECT" | "REFERRAL_FIRST_COURSE",
) {
  const existing = await prisma.pointsLedgerEntry.findFirst({
    where: { userId: inviterId, reason, refType: "Referral", refId: inviteeId },
    select: { id: true },
  });
  return existing !== null;
}

/**
 * Links invitee -> inviter, at most once per user (first inviter wins).
 * The conditional update is the only guard against a double-accept race
 * awarding SIGNUP points twice.
 */
export async function acceptReferral(inviteeId: string, inviterId: string) {
  if (inviteeId === inviterId) {
    throw new Error("Cannot refer yourself");
  }
  const prisma = await getPrisma();

  const { count } = await prisma.user.updateMany({
    where: { id: inviteeId, referredById: null },
    data: { referredById: inviterId },
  });
  if (count === 0) {
    return null;
  }

  return awardPoints({
    userId: inviterId,
    amount: REFERRAL_POINTS.SIGNUP,
    reason: "REFERRAL_SIGNUP",
    refType: "Referral",
    refId: inviteeId,
  });
}

/** Call after any suggestion of `inviteeId`'s gets accepted. */
export async function checkFirstTaskReferral(inviteeId: string) {
  const prisma = await getPrisma();
  const invitee = await prisma.user.findUnique({
    where: { id: inviteeId },
    select: { referredById: true },
  });
  if (!invitee?.referredById) return;
  if (await alreadyRewarded(prisma, invitee.referredById, inviteeId, "REFERRAL_FIRST_TASK")) return;

  const acceptedCount = await prisma.suggestion.count({
    where: { authorId: inviteeId, status: "ACCEPTED" },
  });
  if (acceptedCount < 1) return;

  await awardPoints({
    userId: invitee.referredById,
    amount: REFERRAL_POINTS.FIRST_TASK,
    reason: "REFERRAL_FIRST_TASK",
    refType: "Referral",
    refId: inviteeId,
  });
}

/** Call after a project owned by `inviteeId` is closed. */
export async function checkFirstProjectReferral(inviteeId: string) {
  const prisma = await getPrisma();
  const invitee = await prisma.user.findUnique({
    where: { id: inviteeId },
    select: { referredById: true },
  });
  if (!invitee?.referredById) return;
  if (await alreadyRewarded(prisma, invitee.referredById, inviteeId, "REFERRAL_FIRST_PROJECT")) return;

  const closedOwnedCount = await prisma.projectMember.count({
    where: { userId: inviteeId, role: "OWNER", project: { status: "CLOSED" } },
  });
  if (closedOwnedCount < 1) return;

  await awardPoints({
    userId: invitee.referredById,
    amount: REFERRAL_POINTS.FIRST_PROJECT,
    reason: "REFERRAL_FIRST_PROJECT",
    refType: "Referral",
    refId: inviteeId,
  });
}

/** Call after `inviteeId` successfully enrolls in a course. */
export async function checkFirstCourseReferral(inviteeId: string) {
  const prisma = await getPrisma();
  const invitee = await prisma.user.findUnique({
    where: { id: inviteeId },
    select: { referredById: true },
  });
  if (!invitee?.referredById) return;
  if (await alreadyRewarded(prisma, invitee.referredById, inviteeId, "REFERRAL_FIRST_COURSE")) return;

  const enrollmentCount = await prisma.enrollment.count({ where: { userId: inviteeId } });
  if (enrollmentCount < 1) return;

  const bonus = await getReferralCourseBonusAmount();
  await awardPoints({
    userId: invitee.referredById,
    amount: bonus,
    reason: "REFERRAL_FIRST_COURSE",
    refType: "Referral",
    refId: inviteeId,
  });
}
