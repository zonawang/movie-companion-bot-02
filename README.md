# 電影夥伴 LINE Bot 02：多影城與分館場次

用 Google ADK 理解自然語言，查詢指定分館的電影場次，再用 TMDB 補電影介紹，並保存確認過的個人觀影票根。

本版延續 [movie-companion-bot-01](https://github.com/zonawang/movie-companion-bot-01) 的程式，新增全台威秀／MUVIE 品牌與分館登錄、城市查詢與多館場次比較。不是全台所有品牌影城資料庫。

## 已支援的分館

已擴充至 **全台 20 間威秀＋2 間 MUVIE**，另保留松菸誠品。據點依 2026-10-26 官方目錄逐館核對，22 間的第三方場次都已實際讀取驗證。完整名單、官方連結與驗證範圍見 [全台分館覆蓋](docs/vieshow-coverage.md)。

涵蓋台北、新北、桃園、新竹、苗栗、台中、台南、高雄與花蓮。可列出城市分館、查任一分館，或一次比較 2～3 間。

威秀官網從目前開發環境直接讀取會回傳 HTTP 403，因此這版使用開眼電影網的分館時刻表，**不宣稱串接威秀官方 API**。回覆分開附資料來源、讀取時間及威秀官方入口；第三方資料可能延遲或缺少版本，實際場次與售票以官網為準。誠品仍使用官方公開時刻表。沒有即時座位、票價或代訂票。

## 可以這樣問

- 「全台有哪些威秀可以查？」
- 「台南有哪些威秀？」
- 「花蓮威秀明天晚上六點後放什麼？」
- 「高雄威秀今晚的場次？」
- 「信義威秀今晚六點後有哪些電影？」
- 「西門威秀明天的場次？」
- 「比較信義威秀和西門威秀今晚六點後《片名》的場次。」
- 「松菸誠品今天放什麼？」
- 「《片名》在講什麼？有使用者評論嗎？」
- 「我昨天跟小安看了《片名》，心得是配樂很好聽。」→ 檢查票根草稿並點確認。
- 「我跟小安看過什麼？」

只說「威秀」「新竹威秀」或「大遠百威秀」等有多個候選的名稱，會先詢問分館。據點清單是 2026-10-26 核對快照，之後新開或異動需更新。電影版本依來源標示保留，沒有版本資訊就顯示「來源未標示版本」。片名篩選是文字比對，可能同時找到同名作品或續集，請核對來源原片名與版本。

## 本機啟動

需要 Node.js 24.13 以上、npm 11.8 以上。

```bash
git clone https://github.com/zonawang/movie-companion-bot-02.git
cd movie-companion-bot-02
npm ci
cp .env.example .env
```

在本機 `.env` 填入 Gemini、LINE 與（選用的）TMDB 設定：

```dotenv
GEMINI_API_KEY=你的_Gemini_key
GEMINI_MODEL=gemini-3.5-flash-lite
LINE_CHANNEL_SECRET=你的_LINE_Channel_secret
LINE_CHANNEL_ACCESS_TOKEN=你的_LINE_Channel_access_token
MOVIE_DATA_MODE=tmdb
TMDB_READ_ACCESS_TOKEN=你的_TMDB_Read_Access_Token
PORT=3000
SQLITE_PATH=./data/movie-bot.sqlite
```

`MOVIE_DATA_MODE=demo` 可不填 TMDB token，電影簡介與上映候選會標示為虛構示範資料；分館場次工具仍讀取實際公開來源，不受該模式影響。場次工具本身不需要 TMDB key。

```bash
npm start
```

將 HTTPS tunnel 指向本機服務，再設定 LINE webhook `/webhook`。可沿用既有電影 Bot 的 LINE 帳號；新 repo 不會自動繼承金鑰、票根資料庫或 webhook。若沿用原帳號，應先停止舊服務並確認 SQLite 路徑及資料備份，再切換，避免兩個程式同時操作同一資料庫。詳見 [LINE 設定與切換](docs/line-setup.md)。

沒有 LINE 設定時，只填 Gemini key 也可以 `npm run chat`，使用相同 ADK agent 在終端機對話。

## 驗證

```bash
npm test                  # 離線回歸測試，不呼叫付費模型
npm run smoke:cinemas     # 真實讀取信義、西門，不用 key
npm run smoke:cinemas:all # 真實逐館驗證全台 22 間，不用 key
npm run smoke:cinemas:national:adk # 真實模型驗證全台與跨城市查詢，需要 Gemini key
npm run smoke:cinemas:adk # 真實 Gemini → ADK → 分館／比較／明日場次，需要 Gemini key
```

其他保留的開發入口：`npm run demo`（離線票根示範）、`npm run smoke:adk`、`npm run smoke:tmdb`、`npm run smoke:cinema`（誠品）。真實模型測試會使用 API 額度；smoke scripts 使用記憶體資料庫，不傳送 LINE 訊息。詳見 [本版驗證紀錄](docs/verification.md)。

## 程式結構

| 檔案 | 責任 |
| --- | --- |
| `src/cinema-registry.mjs` | 品牌／城市篩選、別名與同名分館判別 |
| `src/vieshow-cinemas.json` | 全台 22 間分館 ID、來源與官方入口 |
| `src/cinema.mjs` | 分館路由、日期／時段／片名篩選、比較與固定格式回覆 |
| `src/eslite.mjs` | 誠品官網解析與快取 |
| `src/atmovies.mjs` | 威秀的開眼分館時刻表解析、日期核對、各館快取 |
| `src/schedule-page.mjs` | 有逾時與大小限制的公開頁面讀取 |
| `src/agent.mjs` | ADK agent 與九個 FunctionTool |
| `src/store.mjs` | SQLite、確認草稿、個人票根與事件佇列 |
| `src/app.mjs` / `src/line.mjs` | LINE webhook 簽章、事件處理與確認按鈕 |

新增影城時，在登錄表加入分館；相同來源可沿用解析器，來源不同時另加 provider。每間分館仍須驗證資料身分、日期與版本，不能只登錄名稱就視為支援。詳見 [多影城設計](docs/multi-cinema.md)。

ADK 負責選工具；程式負責查資料、驗證分館與日期、篩時間及輸出場次。模型不負責猜測場次。資料快取 5 分鐘，相同查詢合併；失敗後短時間降頻，過期快取不當成現在場次。凌晨時間保留來源日期，提示使用者核對實際入場日期。

## 保留的電影與票根功能

TMDB 上映候選、片名搜尋、繁中簡介、使用者評論連結、官網入口、觀影票根草稿及確認／取消、自己的票根搜尋都已保留。心得逐字保存，確認前不寫入票根；草稿 10 分鐘過期。搜尋最近 200 筆，最多顯示 20 筆。

目前仍為本機開發服務，尚未部署為常駐雲端服務。2026-10-26 已啟動新版本機服務並切換既有 LINE 帳號，官方 webhook 驗證為 200 OK；新增功能的手機收發仍待使用者實測。對話 session 放在記憶體，重啟後清除；票根放在本機 SQLite。正式部署需要另行安排持久儲存與工作佇列。

來源與聲明見 [關於與資料來源](docs/credits.md)。

This product uses the TMDB API but is not endorsed or certified by TMDB.
