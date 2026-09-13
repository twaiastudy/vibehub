import Link from "next/link";

import { getPrisma } from "@/lib/prisma";
import { ROLE_LABEL } from "@/lib/roles";

// Otherwise Next.js prerenders this at build time and freezes whatever
// projects existed then into the deployed output.
export const dynamic = "force-dynamic";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; studyGroup?: string }>;
}) {
  const { q, studyGroup } = await searchParams;
  const onlyStudyGroups = studyGroup === "1";
  const prisma = await getPrisma();
  const projects = await prisma.project.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { description: { contains: q } },
            ],
          }
        : {}),
      ...(onlyStudyGroups ? { isStudyGroup: true } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { members: true, _count: { select: { suggestions: true } } },
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">{onlyStudyGroups ? "讀書會 / 學習小隊" : "需求廣場"}</h1>
        <div className="flex gap-1 text-sm">
          <Link
            href="/projects"
            className={`rounded-full px-3 py-1 ${!onlyStudyGroups ? "bg-black text-white dark:bg-white dark:text-black" : "border border-black/15 dark:border-white/20"}`}
          >
            全部
          </Link>
          <Link
            href="/projects?studyGroup=1"
            className={`rounded-full px-3 py-1 ${onlyStudyGroups ? "bg-black text-white dark:bg-white dark:text-black" : "border border-black/15 dark:border-white/20"}`}
          >
            📚 讀書會
          </Link>
        </div>
      </div>

      <form className="mt-6 mb-6 flex gap-2">
        {onlyStudyGroups && <input type="hidden" name="studyGroup" value="1" />}
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="搜尋專案標題或描述…"
          className="flex-1 rounded border border-black/20 px-3 py-2 text-sm dark:border-white/20"
        />
        <button
          type="submit"
          className="rounded bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
        >
          搜尋
        </button>
      </form>

      {q && (
        <p className="mb-4 text-sm opacity-60">
          「{q}」找到 {projects.length} 筆
          {projects.length === 0 && (
            <>
              {" "}
              — <Link href="/projects" className="underline">清除搜尋</Link>
            </>
          )}
        </p>
      )}

      {projects.length === 0 && !q && (
        <p className="text-sm opacity-70">
          {onlyStudyGroups ? (
            <>
              還沒有讀書會,
              <Link href="/projects/new" className="underline">發起第一個學習小隊</Link>吧。
            </>
          ) : (
            <>
              還沒有專案,<Link href="/projects/new" className="underline">發布第一個需求</Link>吧。
            </>
          )}
        </p>
      )}

      <ul className="flex flex-col gap-4">
        {projects.map((project) => {
          const filledRoles = new Set<string>(project.members.map((m) => m.role));
          const neededRoles = Array.isArray(project.neededRoles) ? (project.neededRoles as string[]) : [];
          const openRoles = neededRoles.filter((role) => !filledRoles.has(role));
          return (
            <li key={project.id} className="rounded-lg border border-black/10 p-4 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Link href={`/projects/${project.id}`} className="text-lg font-medium hover:underline">
                  {project.title}
                </Link>
                {project.isStudyGroup && (
                  <span className="rounded-full bg-[var(--accent)]/15 px-2 py-0.5 text-xs font-medium text-[var(--accent)]">
                    📚 讀書會
                  </span>
                )}
                {project.websiteUrl && <span title={project.websiteUrl}>🔗</span>}
              </div>
              <p className="mt-1 text-sm opacity-70">{project.description}</p>
              <div className="mt-2 flex flex-wrap gap-3 text-xs opacity-60">
                <span>狀態:{project.status}</span>
                <span>
                  參與者:{project.members.length}
                  {project.isStudyGroup && project.capacity ? ` / ${project.capacity}` : ""}
                </span>
                <span>建議數:{project._count.suggestions}</span>
              </div>
              {openRoles.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {openRoles.map((role) => (
                    <span
                      key={role}
                      className="rounded-full border border-[var(--accent)]/40 px-2 py-0.5 text-xs font-medium text-[var(--accent)]"
                    >
                      缺 {ROLE_LABEL[role] ?? role}
                    </span>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
