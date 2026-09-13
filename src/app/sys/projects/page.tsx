import { getPrisma } from "@/lib/prisma";
import { ProjectRow } from "./project-row";

export const dynamic = "force-dynamic";

export default async function SysProjectsPage() {
  const prisma = await getPrisma();

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      members: { where: { role: "OWNER" }, include: { user: { select: { name: true } } } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">專案</h1>
      <ul className="mt-6 flex flex-col gap-2">
        {projects.map((project) => (
          <ProjectRow
            key={project.id}
            project={{
              id: project.id,
              title: project.title,
              status: project.status,
              ownerName: project.members[0]?.user.name ?? "匿名",
            }}
          />
        ))}
      </ul>
    </div>
  );
}
