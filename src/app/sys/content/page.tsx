import { getPrisma } from "@/lib/prisma";
import { ContentRow } from "./content-row";

export const dynamic = "force-dynamic";

export default async function SysContentPage() {
  const prisma = await getPrisma();

  const [suggestions, comments] = await Promise.all([
    prisma.suggestion.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { author: { select: { name: true } }, project: { select: { title: true } } },
    }),
    prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { author: { select: { name: true } } },
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold">內容審核</h1>

      <section className="mt-6">
        <h2 className="text-lg font-medium">最近的建議</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {suggestions.map((s) => (
            <ContentRow
              key={s.id}
              kind="suggestion"
              id={s.id}
              author={s.author.name ?? "匿名"}
              content={`[${s.project.title}] ${s.content}`}
            />
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-medium">最近的留言</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {comments.map((c) => (
            <ContentRow key={c.id} kind="comment" id={c.id} author={c.author.name ?? "匿名"} content={c.content} />
          ))}
        </ul>
      </section>
    </div>
  );
}
