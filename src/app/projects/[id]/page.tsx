import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

import { getAuthOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { ProjectDetail } from "./project-detail";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const prisma = await getPrisma();
  const session = await getServerSession(await getAuthOptions());

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      members: { include: { user: { select: { id: true, name: true, image: true } } } },
      suggestions: {
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { id: true, name: true, image: true } },
          comments: {
            orderBy: { createdAt: "asc" },
            include: { author: { select: { id: true, name: true, image: true } } },
          },
        },
      },
      updates: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { id: true, name: true, image: true } } },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const currentUserId = session?.user?.id ?? null;
  const isMember = currentUserId
    ? project.members.some((m) => m.userId === currentUserId)
    : false;
  const isOwner = currentUserId
    ? project.members.some((m) => m.userId === currentUserId && m.role === "OWNER")
    : false;

  return (
    <ProjectDetail
      project={{
        ...project,
        tags: Array.isArray(project.tags) ? (project.tags as string[]) : [],
        neededRoles: Array.isArray(project.neededRoles) ? (project.neededRoles as string[]) : [],
      }}
      isSignedIn={Boolean(currentUserId)}
      isMember={isMember}
      isOwner={isOwner}
    />
  );
}
