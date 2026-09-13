import Link from "next/link";

// Deliberately static — no DB call, no `dynamic = "force-dynamic"`. Next.js
// prerenders this to plain HTML at build time, so Cloudflare serves it
// straight from the edge as a static asset without invoking the Worker at
// all (the same speed as a Cloudflare Pages deployment, but as part of the
// same Workers project as the dynamic routes).
const FEATURES = [
  {
    icon: "🔍",
    title: "找需求、找隊友",
    body: "全站搜尋專案,每個專案標註還缺開發者、測試者、UI、還是領域專家。",
  },
  {
    icon: "🛠️",
    title: "組隊實作",
    body: "認領角色、送出建議、幫忙測試,把想法真的做出來,不是紙上談兵。",
  },
  {
    icon: "🎓",
    title: "累積作品與聲望",
    body: "每個貢獻都算進 VP 與 Vibe Passport,做出成績之後,換你帶新的人。",
  },
  {
    icon: "🤝",
    title: "人才與商機媒合",
    body: "鼓勵開課、辦讀書會等教學活動,也透過 PM、業務等角色促成真實的人才與商機媒合。",
  },
];

export default function LandingPage() {
  return (
    <div>
      <section className="mx-auto max-w-2xl px-6 pt-16 pb-10 text-center">
        <p className="inline-block rounded-full border border-[var(--accent)]/30 bg-[var(--accent-soft)] px-3 py-1 text-sm font-medium text-[var(--accent)]">
          VibeHub｜AI 實作與人才共創平台
        </p>
        <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
          學 AI、找需求、組隊做專案,累積作品與聲望
        </h1>
        <p className="mt-4 text-lg opacity-80">
          「有想法,就上 VibeHub;會 AI,就一起把它做出來 —— 做出成績,就換你帶下一個人。」
        </p>

        <form action="/projects" className="mt-8 flex gap-2">
          <input
            type="text"
            name="q"
            placeholder="搜尋專案,例如:退休金計算工具、AI 客服…"
            className="flex-1 rounded-lg border border-black/20 px-4 py-3 text-sm dark:border-white/20"
          />
          <button
            type="submit"
            className="rounded-lg bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            搜尋
          </button>
        </form>

        <p className="mt-3 text-sm opacity-60">瀏覽免費,不需要登入</p>

        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link
            href="/projects"
            className="rounded-lg border border-black/15 px-5 py-2.5 text-sm font-semibold transition hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
          >
            探索需求廣場
          </Link>
          <Link
            href="/projects/new"
            className="rounded-lg border border-black/15 px-5 py-2.5 text-sm font-semibold transition hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
          >
            發布你的需求
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-black/10 p-5 text-center dark:border-white/10"
            >
              <span className="text-2xl">{feature.icon}</span>
              <h3 className="mt-2 font-semibold">{feature.title}</h3>
              <p className="mt-1 text-sm opacity-70">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-black/10 py-6 text-center text-xs opacity-50 dark:border-white/10">
        VibeHub · 有想法就上來,會 AI 就一起做出來
      </footer>
    </div>
  );
}
