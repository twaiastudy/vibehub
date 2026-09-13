import { getPrisma } from "@/lib/prisma";
import { awardPoints } from "@/lib/points";

// Matches the "辦讀書會 +200" line in the points-economy table (README).
export const STUDY_GROUP_COMPLETION_BONUS = 200;

/**
 * Call after a study-group project (Project.isStudyGroup) is closed.
 * Pays every OWNER once — guarded by ledger-entry existence rather than a
 * transaction, same pattern as the referral milestone checks, since D1 has
 * no interactive transactions to check-then-write inside.
 */
export async function checkStudyGroupCompletion(projectId: string) {
  const prisma = await getPrisma();
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { isStudyGroup: true },
  });
  if (!project?.isStudyGroup) return;

  const owners = await prisma.projectMember.findMany({
    where: { projectId, role: "OWNER" },
    select: { userId: true },
  });

  for (const owner of owners) {
    const alreadyPaid = await prisma.pointsLedgerEntry.findFirst({
      where: {
        userId: owner.userId,
        reason: "STUDY_GROUP_COMPLETED",
        refType: "Project",
        refId: projectId,
      },
      select: { id: true },
    });
    if (alreadyPaid) continue;

    await awardPoints({
      userId: owner.userId,
      amount: STUDY_GROUP_COMPLETION_BONUS,
      reason: "STUDY_GROUP_COMPLETED",
      refType: "Project",
      refId: projectId,
    });
  }
}
