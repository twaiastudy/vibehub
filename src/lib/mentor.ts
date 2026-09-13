// Mentor is a computed status, not a stored field — derived from
// pointsBalance so it can never drift out of sync with actual reputation.
// This is deliberately the smallest possible slice of the Learn/Teach
// flywheel: recognition only, no course/study-group system yet. If that
// gets built later, it should read this same threshold rather than
// introducing a separate "is this person allowed to teach" flag.
export const MENTOR_THRESHOLD_POINTS = 200;

export function isMentor(pointsBalance: number): boolean {
  return pointsBalance >= MENTOR_THRESHOLD_POINTS;
}
