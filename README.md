# 電影夥伴 LINE Bot 02：全台影城與分館場次

用 Google ADK 理解自然語言，查詢指定分館的電影場次，再用 TMDB 補電影介紹，並保存確認過的個人觀影票根。

本版延續 [movie-companion-bot-01](https://github.com/zonawang/movie-companion-bot-01) 的程式，新增跨品牌與縣市查詢、全台清單分頁及多館場次比較，並保留威秀／MUVIE 與松菸誠品。

## 實作文章

- [今晚要去哪間看？用 Google ADK 把電影夥伴擴充到全台影城查詢](medium.md)

## 全台影城覆蓋

已登錄 **108 個影城／放映場館**，範圍為 2026-10-26 開眼電影網 18 個分區目錄，依地址區分為 20 個縣市。不是全台完整營業名冊，也不保證涵蓋之後新開、停業或改名的據點。

- **102 個可解析日期與場次**：含威秀／MUVIE、秀泰、國賓、新光、in89、喜樂時代、美麗華、美麗新、百老匯、地方戲院及放映場館。
- **6 個僅圖片時刻表入口**：府中15、國家電影及視聽文化中心、桃園光影文化館、中壢光影電影館、中山73、花蓮鐵道電影院。回覆提供圖片與網站，不推測日期或時間。
- 影城清單可用品牌、縣市篩選，每頁 25 間，可接續說「下一頁」；場次比較每次 2～3 館。

完整名單、來源、網站入口與逐館能力見 [全台覆蓋表](docs/taiwan-coverage.md)。原有的 [威秀 20 間＋MUVIE 2 間核對紀錄](docs/vieshow-coverage.md) 保留。

誠品場次仍使用官方公開來源；其他影城使用開眼電影網第三方時刻表，**不宣稱串接各影城官方 API**。回覆標示來源、讀取時間與核對入口。非威秀影城的網站連結由來源頁提供，與已核對的官方入口分別標示。資料可能延遲或缺少版本，實際放映、售票及營業資訊以影城為準。沒有即時座位、票價或代訂票。

## 可以這樣問

- 「全台有哪些影城？先列第一頁。」
- 「下一頁。」
- 「台中有哪些秀泰？」
- 「高雄有哪些國賓？」
- 「澎湖 in89 今晚六點後有哪些場次？」
- 「府中15今天有哪些電影？」（目前回圖片入口）
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

只說「威秀」「新竹威秀」或「大遠百威秀」等有多個候選的名稱，會先詢問分館。據點清單是 2026-10-26 來源快照，之後新開或異動需更新。新竹市與新竹縣各自篩選；品牌／名稱分組不等同股權或經營權認定。電影版本依來源標示保留，沒有版本資訊就顯示「來源未標示版本」。片名篩選是文字比對，可能同時找到同名作品或續集，請核對來源原片名與版本。

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
npm test                  # 50 項離線回歸測試，不呼叫付費模型
npm run smoke:cinemas:taiwan # 逐一驗證 108 個來源，不用 key
npm run smoke:cinemas:taiwan:adk # 真實模型驗證翻頁、跨品牌及圖片入口
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
| `src/vieshow-cinemas.json` | 全台 22 間威秀／MUVIE 的來源與官方入口 |
| `src/taiwan-cinemas.json` / `src/taiwan-coverage.json` | 其他 85 個據點、縣市、來源能力與覆蓋範圍 |
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

目前仍為本機開發服務，尚未部署為常駐雲端服務。既有 LINE 帳號使用本機 3001 與 HTTPS tunnel；本次擴充的手機收發仍待使用者操作確認。對話 session 放在記憶體，重啟後清除；票根放在本機 SQLite。正式部署需要另行安排持久儲存與工作佇列。

來源與聲明見 [關於與資料來源](docs/credits.md)。

This product uses the TMDB API but is not endorsed or certified by TMDB.
