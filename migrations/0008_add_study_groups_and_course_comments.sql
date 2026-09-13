-- Migration number: 0008 	 2026-09-13T02:28:14.546Z

-- Plain ADD COLUMN instead of Prisma's generated RedefineTables (drop+recreate)
-- pattern: Project already has real linked rows in production, and a
-- drop+recreate has previously cascade-deleted child rows on D1 (see CLAUDE.md).
-- Both new columns are optional/defaulted, so a rebuild is unnecessary here.
ALTER TABLE "Project" ADD COLUMN "isStudyGroup" BOOLEAN NOT NULL DEFAULT 0;
ALTER TABLE "Project" ADD COLUMN "capacity" INTEGER;

-- CreateTable
CREATE TABLE "CourseComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CourseComment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CourseComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
