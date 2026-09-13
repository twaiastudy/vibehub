import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { getAuthOptions } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { JOINABLE_ROLES } from "@/lib/roles";

export async function GET() {
  const prisma = await getPrisma();
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: { members: true, _count: { select: { suggestions: true } } },
  });
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const prisma = await getPrisma();
  const session = await getServerSession(await getAuthOptions());
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, tags, neededRoles, ownerExpertise, websiteUrl } =
    (await request.json()) as {
      title?: string;
      description?: string;
      tags?: string[];
      neededRoles?: string[];
      ownerExpertise?: string;
      websiteUrl?: string;
    };
  if (!title || !description) {
    return NextResponse.json(
      { error: "title and description are required" },
      { status: 400 },
    );
  }

  const validNeededRoles = Array.isArray(neededRoles)
    ? neededRoles.filter((role) => (JOINABLE_ROLES as readonly string[]).includes(role))
    : [];

  const project = await prisma.project.create({
    data: {
      title,
      description,
      tags: Array.isArray(tags) ? tags : [],
      neededRoles: validNeededRoles,
      websiteUrl: websiteUrl?.trim() || null,
      members: {
        create: {
          userId: session.user.id,
          role: "OWNER",
          expertise: ownerExpertise?.trim() || null,
        },
      },
    },
    include: { members: true },
  });

  return NextResponse.json(project, { status: 201 });
}
