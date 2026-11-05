import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bot, Send, X, MessageCircle, RotateCcw, Sparkles, Tag, Home, Receipt } from 'lucide-react';
import { chatbotApi, ChatPhanHoi, getErrorMessage } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency } from '../../utils/formatters';

interface TinNhan {
  tu: 'nguoi_dung' | 'bot';
  noi_dung: string;
  phan_hoi?: ChatPhanHoi;
  luc: Date;
}

const VanBan: React.FC<{ text: string }> = ({ text }) => {
  const dong = text.split('\n');
  return (
    <>
      {dong.map((d, i) => (
        <React.Fragment key={i}>
          {d.split(/(\*\*[^*]+\*\*|`[^`]+`|_[^_]+_)/g).map((p, j) => {
            if (/^\*\*[^*]+\*\*$/.test(p)) return <b key={j}>{p.slice(2, -2)}</b>;
            if (/^`[^`]+`$/.test(p))
              return (
                <code key={j} className="px-1 py-0.5 font-mono text-xs font-semibold text-rose-700 bg-rose-50 rounded">
                  {p.slice(1, -1)}
                </code>
              );
            if (/^_[^_]+_$/.test(p)) return <i key={j} className="text-gray-500">{p.slice(1, -1)}</i>;
            return <React.Fragment key={j}>{p}</React.Fragment>;
          })}
          {i < dong.length - 1 && <br />}
        </React.Fragment>
      ))}
    </>
  );
};

const MAU_QC: Record<string, string> = {
  indigo: 'from-indigo-500 to-violet-500',
  rose: 'from-rose-500 to-orange-400',
  emerald: 'from-emerald-500 to-teal-500',
  amber: 'from-amber-500 to-orange-500',
  sky: 'from-sky-500 to-blue-500',
  violet: 'from-violet-500 to-fuchsia-500'
};

const ChatWidget: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mo, setMo] = useState(false);
  const [tinNhan, setTinNhan] = useState<TinNhan[]>([]);
  const [goiY, setGoiY] = useState<string[]>([]);
  const [nhap, setNhap] = useState('');
  const [dangGui, setDangGui] = useState(false);
  const [nguCanh, setNguCanh] = useState<any>(null);
  const [chuaDoc, setChuaDoc] = useState(true);
  const cuoiRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const laNguoiThue = user?.vai_tro === 'nguoi_thue';
  const laQuanLy = isAuthenticated && !laNguoiThue;
  const mauChinh = laNguoiThue ? 'bg-teal-600 hover:bg-teal-700' : 'bg-indigo-600 hover:bg-indigo-700';
  const vienChinh = laNguoiThue ? 'border-teal-200 text-teal-700 hover:bg-teal-50' : 'border-indigo-200 text-indigo-700 hover:bg-indigo-50';

  const loiChao = useMemo(() => {
    const ten = user?.ho_ten ? ` ${user.ho_ten.split(' ').slice(-1)[0]}` : '';
    if (laNguoiThue) return `Chào${ten}! 👋 Mình là **trợ lý ảo 24/7** của nhà trọ.\nMình có thể tra hóa đơn, điện nước, hợp đồng, dự báo tiền tháng sau và **ghi nhận sự cố** giúp bạn.`;
    if (laQuanLy) return `Chào${ten}! 👋 Mình là **trợ lý quản lý**.\nHỏi mình về công nợ, sự cố, hợp đồng sắp hết hạn, phòng chưa ghi điện nước hoặc khách đăng ký xem phòng nhé.`;
    return 'Xin chào! 👋 Mình là **trợ lý ảo hỗ trợ 24/7** của nhà trọ.\nMình giúp bạn tìm phòng trống, xem giá, khuyến mãi và **đặt lịch xem phòng** ngay tại đây.';
  }, [user, laNguoiThue, laQuanLy]);

  useEffect(() => {
    setTinNhan([{ tu: 'bot', noi_dung: loiChao, luc: new Date() }]);
    setNguCanh(null);
    chatbotApi.goiY().then(setGoiY).catch(() => setGoiY([]));
  }, [user?.id, loiChao]);

  useEffect(() => {
    cuoiRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [tinNhan, dangGui, mo]);

  useEffect(() => {
    if (mo) {
      setChuaDoc(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [mo]);

  useEffect(() => {
    const h = (e: Event) => {
      setMo(true);
      const cau = (e as CustomEvent).detail;
      if (typeof cau === 'string' && cau) setTimeout(() => gui(cau), 150);
    };
    window.addEventListener('mo-chatbot', h);
    return () => window.removeEventListener('mo-chatbot', h);
  });

  const gui = async (cau: string) => {
    const q = cau.trim();
    if (!q || dangGui) return;
    setNhap('');
    setTinNhan((ds) => [...ds, { tu: 'nguoi_dung', noi_dung: q, luc: new Date() }]);
    setDangGui(true);
    try {
      const ph = await chatbotApi.hoi(q, nguCanh);
      setNguCanh(ph.ngu_canh || null);
      if (ph.goi_y?.length) setGoiY(ph.goi_y);
      setTinNhan((ds) => [...ds, { tu: 'bot', noi_dung: ph.tra_loi, phan_hoi: ph, luc: new Date() }]);
      if (!mo) setChuaDoc(true);
    } catch (e) {
      setTinNhan((ds) => [...ds, { tu: 'bot', noi_dung: `⚠️ ${getErrorMessage(e, 'Không kết nối được máy chủ, bạn thử lại sau nhé.')}`, luc: new Date() }]);
    } finally {
      setDangGui(false);
    }
  };

  const moDuongDan = (url: string) => {
    const [path, hash] = url.split('#');
    if (path === location.pathname && hash) {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(url);
      if (hash) setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' }), 400);
    }
    if (window.innerWidth < 640) setMo(false);
  };

  const lamMoi = () => {
    setTinNhan([{ tu: 'bot', noi_dung: loiChao, luc: new Date() }]);
    setNguCanh(null);
    chatbotApi.goiY().then(setGoiY).catch(() => {});
  };

  const TheDuLieu: React.FC<{ ph: ChatPhanHoi }> = ({ ph }) => {
    if (!ph.the?.du_lieu?.length) return null;
    const ds = ph.the.du_lieu.slice(0, 6);
    if (ph.the.loai === 'phong') {
      return (
        <div className="mt-2 space-y-2">
          {ds.map((p: any) => (
            <div key={p.id} className="p-2.5 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-semibold text-gray-800">
                  <Home size={14} className="text-indigo-500" /> Phòng {p.so_phong}
                </span>
                <span className="text-sm font-bold text-rose-600">{formatCurrency(p.gia_thue)}</span>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">
                Tầng {p.tang} · {p.dien_tich} m² · tối đa {p.so_nguoi_toi_da} người
                {p.mo_ta ? ` · ${p.mo_ta}` : ''}
              </p>
              {!isAuthenticated && (
                <button
                  onClick={() => gui(`Tôi muốn đặt lịch xem phòng ${p.so_phong}`)}
                  className="mt-1.5 text-xs font-medium text-indigo-600 hover:underline"
                >
                  Đặt lịch xem phòng này →
                </button>
              )}
            </div>
          ))}
        </div>
      );
    }
    if (ph.the.loai === 'quang_cao') {
      return (
        <div className="mt-2 space-y-2">
          {ds.map((q: any) => (
            <div key={q.id} className={`p-2.5 text-white rounded-lg bg-gradient-to-r ${MAU_QC[q.mau_nen] || MAU_QC.indigo}`}>
              <p className="flex items-center gap-1.5 text-sm font-semibold">
                <Tag size={13} /> {q.tieu_de}
              </p>
              {q.noi_dung && <p className="mt-0.5 text-xs opacity-90 line-clamp-2">{q.noi_dung}</p>}
              {q.ma_uu_dai && (
                <span className="inline-block px-2 py-0.5 mt-1.5 font-mono text-xs font-bold tracking-wider bg-white/25 rounded">
                  {q.ma_uu_dai}
                </span>
              )}
            </div>
          ))}
        </div>
      );
    }
    if (ph.the.loai === 'hoa_don') {
      return (
        <div className="mt-2 space-y-1.5">
          {ds.map((h: any) => (
            <button
              key={h.id}
              onClick={() => moDuongDan(`/cua-toi/hoa-don/${h.id}`)}
              className="flex items-center justify-between w-full p-2 text-left bg-white border border-gray-200 rounded-lg hover:border-teal-300"
            >
              <span className="flex items-center gap-1.5 text-xs text-gray-700">
                <Receipt size={13} className="text-teal-600" /> {h.ma_hoa_don}
              </span>
              <span className="text-xs font-semibold text-red-600">{formatCurrency(h.con_lai)}</span>
            </button>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <>

      {!mo && (
        <button
          onClick={() => setMo(true)}
          className={`fixed z-40 flex items-center gap-2 py-3 pl-3 pr-4 text-white rounded-full shadow-lg bottom-5 right-5 hide-on-print ${mauChinh} transition-transform hover:scale-105`}
          aria-label="Mở chatbot hỗ trợ"
          data-testid="chat-toggle"
        >
          <span className="relative">
            <MessageCircle size={24} />
            {chuaDoc && <span className="absolute w-3 h-3 bg-red-500 border-2 border-white rounded-full -top-1 -right-1" />}
          </span>
          <span className="text-sm font-semibold">Hỗ trợ 24/7</span>
        </button>
      )}

      {mo && (
        <div
          className="fixed z-50 flex flex-col overflow-hidden bg-white border border-gray-200 shadow-2xl inset-0 sm:inset-auto sm:bottom-5 sm:right-5 sm:w-[380px] sm:h-[600px] sm:max-h-[calc(100vh-2.5rem)] sm:rounded-2xl hide-on-print"
          data-testid="chat-panel"
        >
          <div className={`flex items-center justify-between px-4 py-3 text-white ${laNguoiThue ? 'bg-teal-600' : 'bg-gradient-to-r from-indigo-600 to-violet-600'}`}>
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center rounded-full w-9 h-9 bg-white/20">
                <Bot size={20} />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">Trợ lý ảo nhà trọ</p>
                <p className="text-[11px] opacity-90">Trực tuyến 24/7 · AI chạy trên máy chủ nhà trọ</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={lamMoi} className="p-1.5 rounded-md hover:bg-white/20" title="Cuộc trò chuyện mới">
                <RotateCcw size={16} />
              </button>
              <button onClick={() => setMo(false)} className="p-1.5 rounded-md hover:bg-white/20" title="Thu nhỏ">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 px-3 py-4 space-y-3 overflow-y-auto bg-gray-50 custom-scrollbar">
            {tinNhan.map((m, i) =>
              m.tu === 'nguoi_dung' ? (
                <div key={i} className="flex justify-end">
                  <div className={`max-w-[80%] px-3 py-2 text-sm text-white rounded-2xl rounded-br-sm ${laNguoiThue ? 'bg-teal-600' : 'bg-indigo-600'}`}>
                    {m.noi_dung}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex items-end gap-2">
                  <div className="flex items-center justify-center flex-shrink-0 text-indigo-600 bg-indigo-100 rounded-full w-7 h-7">
                    <Bot size={15} />
                  </div>
                  <div className="max-w-[85%]">
                    <div className="px-3 py-2 text-sm leading-relaxed text-gray-800 bg-white border border-gray-200 rounded-2xl rounded-bl-sm shadow-sm">
                      <VanBan text={m.noi_dung} />
                      {m.phan_hoi && <TheDuLieu ph={m.phan_hoi} />}
                    </div>
                    {!!m.phan_hoi?.nut?.length && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {m.phan_hoi.nut.map((n) => (
                          <button
                            key={n.duong_dan + n.nhan}
                            onClick={() => moDuongDan(n.duong_dan)}
                            className={`px-2.5 py-1 text-xs font-medium bg-white border rounded-full ${vienChinh}`}
                          >
                            {n.nhan} →
                          </button>
                        ))}
                      </div>
                    )}

                    {!!m.phan_hoi?.phan_tich?.length && (
                      <p className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                        <Sparkles size={10} />
                        {m.phan_hoi.phan_tich.map((p) => `${p.ten} ${p.xac_suat}%`).join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
              )
            )}
            {dangGui && (
              <div className="flex items-end gap-2">
                <div className="flex items-center justify-center text-indigo-600 bg-indigo-100 rounded-full w-7 h-7">
                  <Bot size={15} />
                </div>
                <div className="flex gap-1 px-3 py-3 bg-white border border-gray-200 rounded-2xl">
                  {[0, 1, 2].map((k) => (
                    <span key={k} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${k * 150}ms` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={cuoiRef} />
          </div>

          {goiY.length > 0 && (
            <div className="flex gap-1.5 px-3 py-2 overflow-x-auto bg-white border-t border-gray-100 custom-scrollbar">
              {goiY.map((g) => (
                <button
                  key={g}
                  onClick={() => gui(g)}
                  disabled={dangGui}
                  className={`flex-shrink-0 px-2.5 py-1 text-xs bg-white border rounded-full whitespace-nowrap ${vienChinh} disabled:opacity-50`}
                >
                  {g}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              gui(nhap);
            }}
            className="flex items-center gap-2 p-3 bg-white border-t border-gray-200"
          >
            <input
              ref={inputRef}
              value={nhap}
              onChange={(e) => setNhap(e.target.value)}
              maxLength={500}
              placeholder={nguCanh?.cho === 'mo_ta_su_co' ? 'Mô tả sự cố bạn gặp...' : nguCanh?.cho === 'thong_tin_xem_phong' ? 'Họ tên và số điện thoại...' : 'Nhập câu hỏi...'}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
              data-testid="chat-input"
            />
            <button type="submit" disabled={!nhap.trim() || dangGui} className={`p-2.5 text-white rounded-full disabled:opacity-40 ${mauChinh}`} aria-label="Gửi">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
