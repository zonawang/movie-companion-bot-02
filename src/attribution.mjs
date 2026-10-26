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
    '支援松菸誠品，以及依 2026-10-26 官方目錄登錄的 20 間威秀與 2 間 MUVIE。誠品場次來自官方；威秀場次來自開眼電影網第三方資料，可能延遲或缺少版本，以威秀官網為準。回覆附資料來源與讀取時間，沒有即時座位或票價資訊。',
    '個人票根由你確認後儲存。',
    'This product uses the TMDB API but is not endorsed or certified by TMDB.',
    creditsUrl,
  ].join('\n') };
}
