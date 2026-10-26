export const creditsUrl = 'https://github.com/zonawang/movie-companion-bot-02/blob/main/docs/credits.md';

export function tmdbAttribution(sources = []) {
  const links = [...new Set(sources)].filter(value => {
    try { const url = new URL(value); return url.protocol === 'https:' && url.hostname === 'www.themoviedb.org'; }
    catch { return false; }
  }).slice(0, 3);
  return [
    '資料來源：TMDB（https://www.themoviedb.org）',
    ...links,
    `關於與資料來源：${creditsUrl}`,
  ].join('\n');
}

export function aboutReply() {
  return { text: [
    '電影夥伴｜關於與資料來源',
    '電影資料來自 TMDB；評論是使用者評論，不代表專業影評或整體共識。',
    '已登錄開眼 2026-10-26 目錄的 108 個據點：102 個可解析場次、6 個僅圖片入口；非全台完整營業名冊。誠品場次來自官方；其他影城使用開眼第三方資料，可能延遲或缺少版本，實際場次以影城為準。回覆附資料來源與讀取時間，沒有即時座位或票價資訊。',
    '個人票根由你確認後儲存。',
    'This product uses the TMDB API but is not endorsed or certified by TMDB.',
    creditsUrl,
  ].join('\n') };
}
