import React, { useEffect, useState } from 'react';
import { Megaphone, Tag, X } from 'lucide-react';
import { portalApi } from '../services/api';
import { formatDate } from '../utils/formatters';

const MAU: Record<string, string> = {
  indigo: 'from-indigo-500 to-violet-600',
  rose: 'from-rose-500 to-orange-400',
  emerald: 'from-emerald-500 to-teal-600',
  amber: 'from-amber-500 to-orange-500',
  sky: 'from-sky-500 to-blue-600',
  violet: 'from-violet-500 to-fuchsia-600'
};

const UuDaiNoiBat: React.FC = () => {
  const [ds, setDs] = useState<any[]>([]);
  const [an, setAn] = useState<number[]>([]);

  useEffect(() => {
    portalApi.getQuangCao().then(setDs).catch(() => setDs([]));
  }, []);

  const hien = ds.filter((q) => !an.includes(q.id));
  if (!hien.length) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {hien.map((q) => (
        <div key={q.id} className={`relative p-5 overflow-hidden text-white rounded-xl shadow-sm bg-gradient-to-r ${MAU[q.mau_nen] || MAU.indigo}`}>
          <div className="absolute w-28 h-28 rounded-full -right-6 -top-10 bg-white/10" />
          <button onClick={() => setAn([...an, q.id])} className="absolute p-1 rounded-md top-2 right-2 hover:bg-white/20" title="Ẩn">
            <X size={14} />
          </button>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase opacity-90">
            {q.loai === 'thong_bao' ? <Megaphone size={13} /> : <Tag size={13} />}
            {q.loai === 'thong_bao' ? 'Thông báo từ chủ nhà' : 'Ưu đãi cho người thuê'}
          </p>
          <p className="mt-1.5 text-lg font-bold pr-6">{q.tieu_de}</p>
          {q.noi_dung && <p className="mt-1 text-sm opacity-90">{q.noi_dung}</p>}
          <div className="flex items-center gap-3 mt-3 text-xs">
            {q.ma_uu_dai && <span className="px-2 py-1 font-mono font-bold border border-dashed rounded border-white/70">{q.ma_uu_dai}</span>}
            {q.ngay_ket_thuc && <span className="opacity-80">Đến {formatDate(q.ngay_ket_thuc)}</span>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UuDaiNoiBat;
