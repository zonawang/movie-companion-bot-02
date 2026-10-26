import vieshowCinemas from './vieshow-cinemas.json' with { type: 'json' };

export const vieshowCoverage = Object.freeze({
  verifiedOn: '2026-10-26', officialCount: 20, muvieCount: 2,
  officialDirectory: 'https://www.vscinemas.com.tw/theater/',
  muvieDirectory: 'https://www.vscinemas.com.tw/theater/index2.aspx',
});

export const cinemas = Object.freeze([
  {
    id: 'eslite-songyan', brand: '誠品', city: '台北', name: '松菸誠品電影院', provider: 'eslite',
    aliases: ['松菸誠品', '誠品松菸', '誠品電影院', '誠品', 'eslite'],
    sourceUrl: 'https://meet.eslite.com/tw/tc/gallery/movieschedule/201803020001',
    bookingUrl: 'https://arthouse.eslite.com/visAgreement.aspx',
  },
  ...vieshowCinemas,
].map(cinema => Object.freeze({ ...cinema, aliases: Object.freeze(cinema.aliases), ...(cinema.sourceNames ? { sourceNames: Object.freeze(cinema.sourceNames) } : {}) })));

export const normalizeName = value => value.normalize('NFKC').toLowerCase().replaceAll('臺', '台').replace(/\s+/g, '');
const aliases = new Map();
for (const cinema of cinemas) {
  for (const alias of new Set([cinema.id, cinema.name, ...cinema.aliases].map(normalizeName))) {
    if (!aliases.has(alias)) aliases.set(alias, []);
    aliases.get(alias).push(cinema);
  }
}
const cities = {
  台北市: ['台北'], 新北市: ['新北'], 桃園市: ['桃園'], 新竹市: ['新竹'], 苗栗縣: ['苗栗'], 台中市: ['台中'], 台南市: ['台南'], 高雄市: ['高雄'], 花蓮縣: ['花蓮'],
  頭份: ['苗栗'], 頭份市: ['苗栗'], 吉安: ['花蓮'], 吉安鄉: ['花蓮'],
  雙北: ['台北', '新北'], 北部: ['台北', '新北', '桃園', '新竹', '苗栗'], 中部: ['台中'], 南部: ['台南', '高雄'], 東部: ['花蓮'],
};
function cityMatches(cinema, input) {
  const key = normalizeName(input);
  return !key || ['全台', '全台灣', '台灣', '全國'].includes(key) || (cities[key] || [key]).includes(cinema.city);
}
function brandMatches(cinema, input) {
  const key = normalizeName(input).replace(/影城$/, '');
  if (!key) return true;
  if (['威秀', 'vieshow'].includes(key)) return cinema.brand === '威秀';
  if (['muvie', 'muviecinemas'].includes(key)) return cinema.subBrand === 'MUVIE';
  return normalizeName(cinema.brand) === key;
}

export function matchCinemas(name) {
  const key = normalizeName(name);
  if (!key) return [];
  if (aliases.has(key)) return aliases.get(key);
  if (['威秀', '威秀影城', 'vieshow', 'muvie', 'muviecinemas'].includes(key)) return cinemas.filter(cinema => brandMatches(cinema, key));
  const place = key.replace(/威秀影城|威秀|muviecinemas|muvie/g, '');
  if (place !== key) return cinemas.filter(cinema => brandMatches(cinema, /muvie/.test(key) ? 'muvie' : '威秀') && cityMatches(cinema, place));
  return [];
}
export function findCinema(name) {
  const matches = matchCinemas(name);
  return matches.length === 1 ? matches[0] : undefined;
}

export function listCinemas({ brand = '', city = '' } = {}) {
  const matches = cinemas.filter(cinema => brandMatches(cinema, brand) && cityMatches(cinema, city));
  return {
    status: 'ok', cinemas: matches.map(({ id, brand, subBrand, city, name, sourceUrl, bookingUrl }) => ({ id, brand, subBrand, city, name, sourceUrl, bookingUrl })),
    notice: `威秀據點依 ${vieshowCoverage.verifiedOn} 官方目錄核對：20 間威秀及 2 間 MUVIE；之後新開或異動需更新，非全台所有品牌影城名單。`,
  };
}
export function formatCinemaList(result) {
  const lines = [`目前可查場次的分館（${result.cinemas.length} 間）：`];
  for (const city of [...new Set(result.cinemas.map(cinema => cinema.city))]) {
    lines.push(`${city}：`, ...result.cinemas.filter(cinema => cinema.city === city).map(cinema => `・${cinema.name}`));
  }
  lines.push(result.cinemas.length ? '請指定分館與日期，例如「台南南紡威秀今晚六點後的場次」。' : '目前沒有符合條件的已串接分館。', result.notice);
  return lines.join('\n');
}
