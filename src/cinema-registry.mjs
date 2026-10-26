export const cinemas = Object.freeze([
  {
    id: 'eslite-songyan', brand: '誠品', city: '台北', name: '松菸誠品電影院', provider: 'eslite',
    aliases: ['松菸誠品', '誠品松菸', '誠品電影院', '誠品', 'eslite'],
    sourceUrl: 'https://meet.eslite.com/tw/tc/gallery/movieschedule/201803020001',
    bookingUrl: 'https://arthouse.eslite.com/visAgreement.aspx',
  },
  {
    id: 'vieshow-xinyi', brand: '威秀', city: '台北', name: '台北信義威秀影城', provider: 'atmovies',
    aliases: ['信義威秀', '信義威秀影城', '台北信義威秀', '威秀信義'],
    sourceNames: ['台北信義威秀', '台北信義威秀影城'], theaterCode: 't02a01', areaCode: 'a02',
    sourceUrl: 'https://www.atmovies.com.tw/showtime/t02a01/a02/',
    bookingUrl: 'https://www.vscinemas.com.tw/theater/detail.aspx?id=1',
  },
  {
    id: 'vieshow-ximen', brand: '威秀', city: '台北', name: '台北西門威秀影城', provider: 'atmovies',
    aliases: ['西門威秀', '西門威秀影城', '台北西門威秀', '威秀西門'],
    sourceNames: ['台北西門威秀影城', '台北西門威秀'], theaterCode: 't02b08', areaCode: 'a02',
    sourceUrl: 'https://www.atmovies.com.tw/showtime/t02b08/a02/',
    bookingUrl: 'https://www.vscinemas.com.tw/theater/detail.aspx?id=31',
  },
].map(cinema => Object.freeze({ ...cinema, aliases: Object.freeze(cinema.aliases), ...(cinema.sourceNames ? { sourceNames: Object.freeze(cinema.sourceNames) } : {}) })));

export const normalizeName = value => value.normalize('NFKC').toLowerCase().replaceAll('臺', '台').replace(/\s+/g, '');

export function findCinema(name) {
  const key = normalizeName(name);
  return cinemas.find(cinema => [cinema.id, cinema.name, ...cinema.aliases].some(alias => normalizeName(alias) === key));
}

export function listCinemas({ brand = '', city = '' } = {}) {
  const brandKey = normalizeName(brand).replace(/影城$/, '');
  const cityKey = normalizeName(city).replace(/市$/, '');
  const matches = cinemas.filter(cinema => (!brandKey || normalizeName(cinema.brand) === brandKey || (brandKey === 'vieshow' && cinema.brand === '威秀'))
    && (!cityKey || normalizeName(cinema.city) === cityKey));
  return {
    status: 'ok', cinemas: matches.map(({ id, brand, city, name, sourceUrl, bookingUrl }) => ({ id, brand, city, name, sourceUrl, bookingUrl })),
    notice: '僅列出本 Bot 已串接的分館，不是全台或該品牌的完整據點名單。',
  };
}

export function formatCinemaList(result) {
  return ['目前可查場次的分館：', ...result.cinemas.map(cinema => `${cinema.name}（${cinema.brand}／${cinema.city}）`),
    result.cinemas.length ? '請指定分館與日期，例如「信義威秀今晚六點後的場次」。' : '目前沒有符合條件的已串接分館。', result.notice].join('\n');
}
