export const boDau = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');

const VIET_TAT: Record<string, string> = {
  ko: 'khong', k: 'khong', kg: 'khong', khg: 'khong', hok: 'khong', hong: 'khong', hem: 'khong',
  dc: 'duoc', dk: 'duoc', đc: 'duoc', duoc: 'duoc',
  bn: 'bao nhieu', bnh: 'bao nhieu', bnhieu: 'bao nhieu',
  j: 'gi', ntn: 'nhu the nao', sao: 'sao',
  tr: 'trieu', cu: 'trieu',
  wifi: 'internet', wi: 'internet', net: 'internet', mang: 'internet',
  sdt: 'so dien thoai', dt: 'dien thoai',
  hdon: 'hoa don', hđ: 'hoa don',
  mk: 'mat khau', pass: 'mat khau', password: 'mat khau',
  ac: 'may lanh', dieuhoa: 'may lanh',
  ok: 'dong y', oke: 'dong y', okie: 'dong y',
  thanks: 'cam on', thank: 'cam on', tks: 'cam on', thanku: 'cam on', camon: 'cam on',
  hi: 'xin chao', hello: 'xin chao', helo: 'xin chao', alo: 'xin chao',
  bye: 'tam biet', bb: 'tam biet',
  nc: 'nuoc', đ: 'dong', vnd: 'dong'
};

const TU_DUNG = new Set([
  'oi', 'nhe', 'nha', 'a', 'ah', 'ha', 'u', 'uh', 'vay', 'nhi', 'di', 'voi', 'giup', 'minh', 'toi', 'em', 'anh',
  'chi', 'ban', 'hoi', 'cai', 'la', 'thi', 'ma', 'nao', 'gium', 'dum', 'shop', 'ad', 'admin', 'cho', 've'
]);

export const chuanHoa = (cau: string): string => {
  const s = boDau(String(cau || '').toLowerCase())
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return s
    .split(' ')
    .map((w) => VIET_TAT[w] ?? w)
    .join(' ');
};

export const tachDacTrung = (cau: string): string[] => {
  const tu = chuanHoa(cau)
    .split(' ')
    .filter((w) => w && !TU_DUNG.has(w))
    .map((w) => (/^\d+$/.test(w) ? '<so>' : w));
  const dacTrung = [...tu];
  for (let i = 0; i < tu.length - 1; i++) dacTrung.push(`${tu[i]}_${tu[i + 1]}`);
  return dacTrung;
};
