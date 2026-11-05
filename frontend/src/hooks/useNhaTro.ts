import { useEffect, useState } from 'react';
import { publicApi } from '../services/api';
import { THONG_TIN_CHU_NHA, ThongTinNhaTro } from '../config';

let cache: ThongTinNhaTro | null = null;
let dangTai: Promise<ThongTinNhaTro> | null = null;

export const taiThongTinNhaTro = () => {
  if (cache) return Promise.resolve(cache);
  if (!dangTai) {
    dangTai = publicApi
      .thongTin()
      .then((d: any) => (cache = { ...THONG_TIN_CHU_NHA, ...d }))
      .catch(() => {
        dangTai = null;
        return THONG_TIN_CHU_NHA;
      });
  }
  return dangTai;
};

export const useNhaTro = (): ThongTinNhaTro => {
  const [info, setInfo] = useState<ThongTinNhaTro>(cache || THONG_TIN_CHU_NHA);
  useEffect(() => {
    let alive = true;
    taiThongTinNhaTro().then((d) => alive && setInfo(d));
    return () => {
      alive = false;
    };
  }, []);
  return info;
};
