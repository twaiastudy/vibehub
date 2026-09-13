import { getPrisma } from "@/lib/prisma";
import { WELCOME_BONUS_POINTS } from "@/lib/points";

// A brand-new user's signup bonus should cover exactly two foundational
// courses, so the free-trial effect falls out of pricing alone — no
// separate "free credits" field on User.
export const SUGGESTED_FOUNDATIONAL_COURSE_PRICE = Math.floor(WELCOME_BONUS_POINTS / 2);

/**
 * What the inviter earns when their invitee's first course enrollment
 * happens (see checkFirstCourseReferral in src/lib/referrals.ts). Pegged
 * to the cheapest foundational course actually on offer, falling back to
 * the suggested default if none exist yet, so this number moves with
 * real course pricing instead of being a separately-maintained constant.
 */
export async function getReferralCourseBonusAmount(): Promise<number> {
  const prisma = await getPrisma();
  const cheapestFoundational = await prisma.course.findFirst({
    where: { isFoundational: true },
    orderBy: { pointsCost: "asc" },
    select: { pointsCost: true },
  });
  return cheapestFoundational?.pointsCost ?? SUGGESTED_FOUNDATIONAL_COURSE_PRICE;
}
