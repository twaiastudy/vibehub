# VibeHub

一個連結「vibe coding 專案發起人」與「社群參與者」的協作平台:發布需求、收集建議、協助測試,並用點數(可累積、可審核)鼓勵參與。部署在 Cloudflare Workers,資料庫用 Cloudflare D1。

## 目前範圍(Phase 1)

- Landing page(`/`)+ 需求廣場(`/projects`,支援關鍵字搜尋):發布/瀏覽專案,一個專案可有多個參與者,各自標記功能性角色(`ProjectMember.role`:OWNER 發起人 / DEVELOPER 開發者 / TESTER 測試者 / DESIGNER UI 設計 / DOMAIN_EXPERT 領域專家 / PROJECT_MANAGER 專案經理 / BUSINESS_MANAGER 業務經理 / OTHER 其他),專案可標注「還缺哪些角色」的招募清單,也可以填上線後的 `websiteUrl`
- 建議留言 + 討論串:任何登入使用者都能對專案留建議,**任何人**(不限發起人)都能在建議下方留言討論(`Comment`),讓領域專家與開發者可以直接對話;專案 OWNER 可「採納」建議並發點數
- 進度動態(`ProjectUpdate`):OWNER 可對整個專案發布進度回報(例如「這次修好了 XX、YY」),獨立於單則建議的討論串之外
- 點數系統:採納建議、新手禮包、邀請獎勵等都會透過 append-only 的 `PointsLedgerEntry` 帳本發放點數,`User.pointsBalance` 只能由帳本交易更新,不可直接寫入;`/leaderboard` 有點數與邀請人數兩個排行榜
- 分階段邀請獎勵:邀請連結 `/invite/[userId]`,依「邀請成功 → 對方完成第一次任務 → 對方完成第一個專案 → 對方第一次報名課程」四階段發放 VP,獎勵活動而非邀請本身,抵抗灌水帳號
- Vibe Passport(`/u/[id]`):公開個人頁,顯示 VP、參與專案、被採納建議數、邀請人數,累積 VP 達門檻會顯示 🎓 Mentor 徽章(`src/lib/mentor.ts`,門檻式計算,非儲存欄位)
- 課程(`/courses`):累積 VP 達 Mentor 門檻才能開課,報名要付點數(`Course.pointsCost`,每堂課自訂);標記為「基礎課程」的定價建議是新手禮包的一半,讓新用戶剛好夠報名 2 堂 —— 不是另外做一個「免費名額」欄位,單純是定價的自然結果
- 後台(`/sys`):`User.isAdmin` 欄位控管,管理員可以互相授予管理員身份、手動調整任何人的點數、強制結案或刪除專案、刪除不當的建議與留言

尚未實作:測試任務協作、競賽模組、簽到/招生。下方「產品願景」是更完整的長期規劃。

## 產品願景:AI 實作型社群／人才生態系

VibeHub 的長期定位不只是「專案媒合平台」,而是「AI 實作型社群／人才生態系」。核心迴圈從原本的

```
找需求 → 找隊友 → 做專案 → 賺點數
```

擴充成

```
學習 → 找需求 → 組隊 → 實作 → 發表 → 累積聲望 → 賺點數 → 教學 → 再帶新的人
```

一句話定位:**學 AI、找需求、組隊做專案、累積作品與點數,進一步成為 Mentor 與講師。**

### 七大核心模組

| 模組 | 說明 | 現況 |
| --- | --- | --- |
| **Learn｜學習** | 不只是上課,而是「看課 → 跟做 → 完成作品 → 取得徽章 → 進入專案」,涵蓋 AI/Vibe Coding 入門、Prompt、API/MCP/Agent、LINE Bot、自動化等主題 | 已有地基(課程報名/計價,還沒有「跟做→徽章」的進度追蹤) |
| **Challenge｜需求** | 「找需求」升級成 AI Challenge Marketplace,需求方可設定預算、截止時間、難度、點數獎勵,把真實問題變成 AI 專案題目 | 需要擴充(目前需求廣場只有基本搜尋) |
| **Team｜組隊** | 不只是「找隊友」,而是完整專案組隊(PM、AI、Vibe Coder、UI、Domain Expert),甚至由 AI 主動推薦缺什麼角色 | 已有地基(`ProjectMember` 角色系統 + 招募清單) |
| **Build｜專案實作** | 平台核心,每個專案有「需求 → 任務 → 成員 → GitHub → Demo → 成果」的完整生命週期 | 已有地基(專案主頁 + 討論串 + 進度動態 + 網站連結) |
| **Point｜點數經濟** | 點數不只是獎勵,而是平台內的經濟循環:貢獻 → 點數 → 能力 → 更多機會 → 更多貢獻 | 已有地基(append-only 帳本 + 排行榜 + 課程消費,賺與花都有了) |
| **Community｜讀書會** | 不做傳統論壇,而是「學習小隊」:6～10 人一組,每週一個主題 → 實作 → 分享 Demo → Code Review → 點數獎勵 | 全新模組(建議重用現有 Project/角色模型) |
| **Teach｜開課** | 把 VibeHub 從「學習平台」變成人才生態系的關鍵層:學習者 → 做專案 → 累積作品 → 成為 Mentor → 開讀書會 → 開課 → 成為講師 | 已有地基(Mentor 門檻 + 開課/報名/計價已上線,還沒有讀書會) |

### VibeHub Profile(AI 能力履歷)

不只是一般會員資料,而是可以被企業檢視、用來「找人才」的能力履歷 —— 目前的 Vibe Passport(`/u/[id]`)是這個概念的雛形,長期可以擴充成:等級(Vibe Coder Lv.X)、Reputation 分數、完成專案數、Team 專案數、完課數、讀書會數、擅長工具標籤(AI Agent / LINE Bot / GAS 等)。

### 點數經濟:賺與花要對稱

| 可以「賺」 | 可以「花」 |
| --- | --- |
| 完成專案 +100 | 報名進階課程 |
| 解決需求 +200 | 參加工作坊 |
| 教學 +300 | 找人協作 |
| 辦讀書會 +200 | AI API 額度 |
| Code Review +30 | 專案資源 |
| 發表作品 +50 | Mentor 諮詢 |
| 協助新手 +50 | 參加特殊 Challenge |
| 回答問題 +10 | |

「花」的部分已經有第一個真實場景:報名課程要付點數(`/courses`)。其他花費項目(工作坊、AI API 額度、Mentor 諮詢等)尚未開始。

### MVP 範圍建議

不建議一開始就做滿七個模組,第一階段收斂成 5 個入口:🏠 首頁・📚 學習・🚀 專案・👥 社群・🏆 我的。其中「學習」底下放課程／讀書會／Challenge,「專案」底下放找需求／找隊友／我的專案,「我的」底下放作品／點數／徽章／能力／聲望。

**特別建議**:把「課程、讀書會、開課」都放在同一個 Learn → Teach 生態裡,不要獨立做成一個線上課程平台 —— 這樣才能延續 VibeHub 原本「做中學、組隊、賺點數」的特色。

## 開發環境設定

1. 複製環境變數範本並填入實際值:

   ```bash
   cp .env.example .env
   ```

   - `DATABASE_URL`:保留預設值即可,Prisma CLI 指令需要這個欄位存在,但實際資料庫是 Cloudflare D1(透過 Workers binding 存取,見下方),這個值在執行期完全不會被用到
   - `NEXTAUTH_SECRET`:`openssl rand -base64 32`
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`:[Google Cloud Console OAuth 用戶端](https://console.cloud.google.com/apis/credentials),Authorized redirect URI 設為 `http://localhost:3000/api/auth/callback/google`

2. 安裝套件並建立本機 D1 資料庫:

   ```bash
   npm install
   npm run db:migrate:local
   ```

3. 啟動開發伺服器:

   ```bash
   npm run dev
   ```

## 部署到 Cloudflare

```bash
npx wrangler login          # 認證正確的 Cloudflare 帳號
npx wrangler d1 create vibehub   # 首次設定才需要,之後把 database_id 填進 wrangler.jsonc
npm run db:migrate:remote   # 套用 migration 到正式 D1
npm run deploy              # build + 部署
```

部署後需另外設定 secrets 才能讓 Google 登入運作:

```bash
npx wrangler secret put NEXTAUTH_SECRET
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
```

## 常用指令

| 指令 | 說明 |
| --- | --- |
| `npm run dev` | 啟動開發伺服器(<http://localhost:3000>),透過 `initOpenNextCloudflareForDev` 模擬本機 D1 |
| `npm run build` | 一般 Next.js production build(型別檢查用) |
| `npm run preview` | build 成 Cloudflare Worker 並用 `wrangler dev` 本機預覽(真正的 workerd runtime) |
| `npm run deploy` | build 並部署到 Cloudflare |
| `npm run lint` | ESLint 檢查 |
| `npm run prisma:generate` | 重新產生 Prisma Client(修改 schema 後) |
| `npm run db:migrate:local` | 套用 D1 migration 到本機(`wrangler dev`/`next dev` 用) |
| `npm run db:migrate:remote` | 套用 D1 migration 到正式環境 |

## 為什麼是 D1,而不是 Postgres

這個專案原本用 Postgres + 一般的 Prisma Client,後來改用 Cloudflare D1,因為 Prisma 的預設 Query Engine 是原生二進位檔,Cloudflare Workers 的沙箱環境完全無法載入任何原生執行檔或透過網路 TCP 連線一般的 Postgres(除非額外導入 Hyperdrive 或 Neon 這類走 HTTP/WebSocket 的 serverless driver)。D1 是 Cloudflare 原生的 SQLite,透過 Workers binding 存取,不需要任何網路連線設定。

啟用方式踩過的坑,記錄起來給未來的自己:

- `prisma/schema.prisma` 的 generator 只需要 `previewFeatures = ["driverAdapters"]`,**不要**額外設定 `engineType = "client"` 或 `runtime = "workerd"` — 這是給 Prisma 全新的「engine-less client」模式用的,目前在 OpenNext 的打包流程下,wasm 動態載入會被打包成 `fs.readFileSync`,在 Workers 上找不到檔案而炸掉
- `next.config.ts` 一定要加 `serverExternalPackages: ["@prisma/client", ".prisma/client"]`,讓 Next.js 不要去打包這兩個套件,保留 Prisma 自己的 wasm dynamic import 邏輯不被 esbuild 改寫
- `src/lib/prisma.ts` 的 Prisma Client 不能是模組層級的單例 —— D1 binding (`env.DB`) 只能在請求範圍內透過 `getCloudflareContext()` 拿到,所以是 `export async function getPrisma()`,每個 route/page 內自己呼叫
- SQLite 沒有原生陣列型別,`Project.tags` 用 `Json` 型別存
- D1 的 `$transaction` 只支援循序(陣列)形式的批次寫入,不支援互動式的 callback 形式(`src/lib/points.ts` 的 `awardPoints` 用的是前者)
