import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Building2, Bot, Receipt, Wrench, QrCode, ShieldCheck, Phone, MapPin, Mail, Clock, Tag, Users,
  Maximize, Layers, CheckCircle2, CalendarCheck, FileSignature, KeyRound, MessageCircle, Sparkles, LogIn, Copy
} from 'lucide-react';
import { publicApi, getErrorMessage } from '../services/api';
import { useNhaTro } from '../hooks/useNhaTro';
import { useAuth } from '../hooks/useAuth';
import { homePathFor } from '../contexts/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { inputCls, ngayHomNay } from '../components/common/ui';
import { TEN_HE_THONG } from '../config';
import ChatWidget from '../components/chatbot/ChatWidget';

const MAU_QC: Record<string, string> = {
  indigo: 'from-indigo-500 to-violet-600',
  rose: 'from-rose-500 to-orange-400',
  emerald: 'from-emerald-500 to-teal-600',
  amber: 'from-amber-500 to-orange-500',
  sky: 'from-sky-500 to-blue-600',
  violet: 'from-violet-500 to-fuchsia-600'
};

const TINH_NANG = [
  { icon: Bot, ten: 'Chatbox AI hỗ trợ 24/7', mo_ta: 'Hỏi phòng trống, giá, hóa đơn, báo sự cố bất kỳ lúc nào – trợ lý ảo trả lời ngay, kể cả lúc nửa đêm.' },
  { icon: Receipt, ten: 'Hóa đơn điện tử minh bạch', mo_ta: 'Hóa đơn hằng tháng ghi rõ chỉ số điện nước, đơn giá từng dịch vụ. Xem lại lịch sử mọi lúc.' },
  { icon: QrCode, ten: 'Thanh toán bằng mã VietQR', mo_ta: 'Quét mã QR là điền sẵn số tiền và nội dung chuyển khoản, không lo chuyển nhầm.' },
  { icon: Wrench, ten: 'Báo sự cố trực tuyến', mo_ta: 'Gửi yêu cầu sửa chữa qua web hoặc chatbot, AI tự đánh giá mức độ khẩn cấp để xử lý trước.' },
  { icon: FileSignature, ten: 'Hợp đồng rõ ràng', mo_ta: 'Thông tin hợp đồng, tiền cọc, ngày hết hạn luôn có trong tài khoản người thuê.' },
  { icon: ShieldCheck, ten: 'An ninh – riêng tư', mo_ta: 'Mỗi người thuê có tài khoản riêng, chỉ xem được dữ liệu của phòng mình.' }
];

const QUY_TRINH = [
  { icon: CalendarCheck, ten: 'Đặt lịch xem phòng', mo_ta: 'Qua form bên dưới hoặc nhắn chatbot' },
  { icon: Building2, ten: 'Xem phòng thực tế', mo_ta: 'Chủ nhà gọi xác nhận và dẫn xem' },
  { icon: FileSignature, ten: 'Ký hợp đồng & đặt cọc', mo_ta: 'Mang theo CCCD, ký hợp đồng' },
  { icon: KeyRound, ten: 'Nhận phòng & tài khoản', mo_ta: 'Nhận chìa khóa và tài khoản người thuê' }
];

const moChatbot = (cau?: string) => window.dispatchEvent(new CustomEvent('mo-chatbot', { detail: cau }));

const GioiThieu: React.FC = () => {
  const nt = useNhaTro();
  const { user, isAuthenticated } = useAuth();
  const [duLieu, setDuLieu] = useState<any>(null);
  const [quangCao, setQuangCao] = useState<any[]>([]);
  const [form, setForm] = useState({ ho_ten: '', so_dien_thoai: '', phong_id: '', ngay_hen: ngayHomNay(1), ghi_chu: '' });
  const [dangGui, setDangGui] = useState(false);
  const [daGui, setDaGui] = useState(false);

  useEffect(() => {
    document.title = `${nt.ten_nha_tro} – ${TEN_HE_THONG}`;
  }, [nt.ten_nha_tro]);

  useEffect(() => {
    publicApi.phongTrong().then(setDuLieu).catch(() => setDuLieu({ phong: [], dich_vu: [], thong_ke: {} }));
    publicApi
      .quangCao()
      .then((ds) => {
        setQuangCao(ds);

        ds.forEach((q) => {
          const k = `qc_xem_${q.id}`;
          try {
            if (sessionStorage.getItem(k)) return;
            sessionStorage.setItem(k, '1');
          } catch {
          }
          publicApi.xemQuangCao(q.id).catch(() => {});
        });
      })
      .catch(() => {});
  }, []);

  const datLich = (phongId: number) => {
    setForm((f) => ({ ...f, phong_id: String(phongId) }));
    document.getElementById('dang-ky')?.scrollIntoView({ behavior: 'smooth' });
  };

  const guiDangKy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.ho_ten.trim() || !form.so_dien_thoai.trim()) return toast.error('Vui lòng nhập họ tên và số điện thoại');
    setDangGui(true);
    try {
      const r = await publicApi.dangKyXemPhong({ ...form, phong_id: form.phong_id ? Number(form.phong_id) : null });
      toast.success(r.message || 'Đăng ký thành công');
      setDaGui(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDangGui(false);
    }
  };

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).then(() => toast.success(`Đã sao chép mã ${text}`)).catch(() => {});
  };

  const tk = duLieu?.thong_ke || {};
  const phong: any[] = duLieu?.phong || [];
  const dichVu: any[] = duLieu?.dich_vu || [];

  return (
    <div className="min-h-screen bg-white">

      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/90 backdrop-blur">
        <div className="flex items-center justify-between h-16 max-w-6xl px-4 mx-auto">
          <a href="#" className="flex items-center gap-2 min-w-0">
            <div className="flex items-center justify-center text-white rounded-lg w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600">
              <Building2 size={20} />
            </div>
            <div className="min-w-0">
              <p className="font-bold leading-tight text-gray-900 truncate">{nt.ten_nha_tro}</p>
              <p className="text-[11px] text-gray-500 leading-tight hidden sm:block">Quản lý thông minh · Chatbox hỗ trợ 24/7</p>
            </div>
          </a>
          <nav className="items-center hidden gap-6 text-sm font-medium text-gray-600 md:flex">
            <a href="#phong-trong" className="hover:text-indigo-600">Phòng trống</a>
            <a href="#uu-dai" className="hover:text-indigo-600">Ưu đãi</a>
            <a href="#tinh-nang" className="hover:text-indigo-600">Vì sao chọn chúng tôi</a>
            <a href="#dang-ky" className="hover:text-indigo-600">Liên hệ</a>
          </nav>
          {isAuthenticated ? (
            <Link to={homePathFor(user)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
              Vào trang của tôi
            </Link>
          ) : (
            <Link to="/dang-nhap" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-50">
              <LogIn size={16} /> Đăng nhập
            </Link>
          )}
        </div>
      </header>

      <section className="relative overflow-hidden text-white bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600">
        <div className="absolute rounded-full -top-24 -right-24 w-96 h-96 bg-white/10 blur-2xl" />
        <div className="absolute rounded-full -bottom-32 -left-20 w-80 h-80 bg-fuchsia-400/20 blur-2xl" />
        <div className="relative grid items-center max-w-6xl gap-10 px-4 py-16 mx-auto md:py-20 md:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 text-xs font-semibold rounded-full bg-white/15">
              <Sparkles size={14} /> {TEN_HE_THONG}
            </span>
            <h1 className="text-3xl font-extrabold leading-tight md:text-[2.6rem]">
              Tìm phòng trọ ưng ý,<br />
              <span className="text-amber-300">hỏi gì cũng có trả lời 24/7</span>
            </h1>
            <p className="mt-4 text-base text-indigo-100 md:text-lg">{nt.slogan}</p>
            <div className="flex flex-wrap gap-3 mt-7">
              <a href="#phong-trong" className="px-5 py-3 font-semibold text-indigo-700 bg-white rounded-xl hover:bg-indigo-50">
                Xem phòng trống
              </a>
              <button onClick={() => moChatbot('Còn phòng trống không?')} className="inline-flex items-center gap-2 px-5 py-3 font-semibold border rounded-xl border-white/40 hover:bg-white/10">
                <MessageCircle size={18} /> Chat với trợ lý 24/7
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-10 max-w-md">
              {[
                { so: tk.phong_trong ?? '–', nhan: 'phòng đang trống' },
                { so: tk.gia_thap_nhat ? `${(tk.gia_thap_nhat / 1e6).toLocaleString('vi-VN')}tr` : '–', nhan: 'giá chỉ từ / tháng' },
                { so: '24/7', nhan: 'chatbot hỗ trợ' }
              ].map((s) => (
                <div key={s.nhan} className="p-3 rounded-xl bg-white/10">
                  <p className="text-2xl font-bold">{s.so}</p>
                  <p className="text-xs text-indigo-100">{s.nhan}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:block">
            <div className="max-w-sm p-4 ml-auto text-gray-800 bg-white shadow-2xl rounded-2xl rotate-1">
              <div className="flex items-center gap-2 pb-3 mb-3 border-b">
                <div className="flex items-center justify-center w-8 h-8 text-indigo-600 bg-indigo-100 rounded-full"><Bot size={18} /></div>
                <div>
                  <p className="text-sm font-semibold">Trợ lý ảo nhà trọ</p>
                  <p className="text-[11px] text-green-600">● Đang trực tuyến</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p className="px-3 py-2 ml-auto text-white bg-indigo-600 rounded-2xl rounded-br-sm w-fit">Còn phòng dưới 3 triệu không ạ?</p>
                <p className="px-3 py-2 bg-gray-100 rounded-2xl rounded-bl-sm w-fit max-w-[85%]">
                  Hiện có <b>{tk.phong_trong ?? 1} phòng trống</b> phù hợp 🏠. Đang có ưu đãi <b>giảm 50% tháng đầu</b>!
                </p>
                <p className="px-3 py-2 ml-auto text-white bg-indigo-600 rounded-2xl rounded-br-sm w-fit">Mai mình qua xem được không?</p>
                <p className="px-3 py-2 bg-gray-100 rounded-2xl rounded-bl-sm w-fit max-w-[85%]">Được ạ! Bạn cho mình xin họ tên và số điện thoại nhé 📞</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {quangCao.length > 0 && (
        <section id="uu-dai" className="max-w-6xl px-4 py-14 mx-auto scroll-mt-16">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold tracking-wide text-rose-500 uppercase">Ưu đãi đang diễn ra</p>
            <h2 className="mt-1 text-3xl font-bold text-gray-900">Thuê ngay – nhận quà liền tay</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {quangCao.map((q) => (
              <div key={q.id} className={`relative p-6 overflow-hidden text-white shadow-lg rounded-2xl bg-gradient-to-br ${MAU_QC[q.mau_nen] || MAU_QC.indigo}`}>
                <div className="absolute w-32 h-32 rounded-full -right-8 -top-8 bg-white/10" />
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold uppercase rounded bg-white/20">
                  <Tag size={12} /> {q.loai === 'khuyen_mai' ? 'Khuyến mãi' : q.loai === 'thong_bao' ? 'Thông báo' : 'Giới thiệu'}
                </span>
                <h3 className="mt-3 text-xl font-bold">{q.tieu_de}</h3>
                <p className="mt-2 text-sm opacity-90">{q.noi_dung}</p>
                <div className="flex items-center justify-between mt-5">
                  {q.ma_uu_dai ? (
                    <button onClick={() => copy(q.ma_uu_dai)} className="inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-sm font-bold tracking-wider border border-dashed rounded-lg border-white/70 hover:bg-white/10">
                      {q.ma_uu_dai} <Copy size={13} />
                    </button>
                  ) : <span />}
                  {q.ngay_ket_thuc && <span className="text-xs opacity-80">Đến {formatDate(q.ngay_ket_thuc)}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section id="phong-trong" className="py-14 bg-gray-50 scroll-mt-16">
        <div className="max-w-6xl px-4 mx-auto">
          <div className="flex flex-col items-start justify-between gap-2 mb-8 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold tracking-wide text-indigo-600 uppercase">Phòng đang cho thuê</p>
              <h2 className="mt-1 text-3xl font-bold text-gray-900">Còn {tk.phong_trong ?? 0} phòng trống / {tk.tong_phong ?? 0} phòng</h2>
            </div>
            <button onClick={() => moChatbot('Tư vấn giúp tôi chọn phòng phù hợp')} className="text-sm font-medium text-indigo-600 hover:underline">
              Chưa biết chọn phòng nào? Hỏi chatbot →
            </button>
          </div>
          {phong.length === 0 ? (
            <div className="p-10 text-center bg-white border border-gray-200 rounded-2xl">
              <p className="text-lg font-semibold text-gray-800">Hiện tại nhà trọ đã kín phòng 😥</p>
              <p className="mt-1 text-gray-500">Để lại thông tin bên dưới, chủ nhà sẽ báo ngay khi có phòng trống.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {phong.map((p) => (
                <div key={p.id} className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl">
                  <div className="relative flex items-center justify-center h-36 bg-gradient-to-br from-indigo-100 to-violet-100">
                    <Building2 size={56} className="text-indigo-300" />
                    <span className="absolute px-2 py-1 text-xs font-semibold text-white rounded-md top-3 left-3 bg-emerald-500">Còn trống</span>
                    {quangCao.some((q) => q.loai === 'khuyen_mai') && (
                      <span className="absolute px-2 py-1 text-xs font-semibold text-white rounded-md top-3 right-3 bg-rose-500">Có ưu đãi</span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-bold text-gray-900">Phòng {p.so_phong}</h3>
                      <p className="text-lg font-bold text-rose-600">{formatCurrency(p.gia_thue)}<span className="text-xs font-normal text-gray-500">/tháng</span></p>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1"><Layers size={14} /> Tầng {p.tang}</span>
                      <span className="flex items-center gap-1"><Maximize size={14} /> {p.dien_tich} m²</span>
                      <span className="flex items-center gap-1"><Users size={14} /> Tối đa {p.so_nguoi_toi_da} người</span>
                    </div>
                    {p.mo_ta && <p className="mt-2 text-sm text-gray-500">{p.mo_ta}</p>}
                    <button onClick={() => datLich(p.id)} className="w-full py-2.5 mt-4 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700">
                      Đặt lịch xem phòng
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {dichVu.length > 0 && (
            <div className="p-5 mt-8 bg-white border border-gray-200 rounded-2xl">
              <p className="mb-3 font-semibold text-gray-800">Bảng giá dịch vụ (công khai, tính đúng chỉ số)</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {dichVu.map((d) => (
                  <div key={d.ten_dich_vu} className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50">
                    <span className="text-sm text-gray-600">{d.ten_dich_vu}</span>
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(d.don_gia)}/{d.don_vi_tinh}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section id="tinh-nang" className="max-w-6xl px-4 py-16 mx-auto scroll-mt-16">
        <div className="max-w-2xl mx-auto mb-10 text-center">
          <p className="text-sm font-semibold tracking-wide text-indigo-600 uppercase">Vì sao chọn chúng tôi</p>
          <h2 className="mt-1 text-3xl font-bold text-gray-900">Nhà trọ quản lý bằng công nghệ</h2>
          <p className="mt-3 text-gray-500">Mọi thứ đều minh bạch và tra cứu được trên điện thoại – không còn cảnh chờ chủ nhà nhắn tin báo tiền.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TINH_NANG.map((t) => (
            <div key={t.ten} className="p-6 transition-shadow border border-gray-200 rounded-2xl hover:shadow-md">
              <div className="flex items-center justify-center w-12 h-12 mb-4 text-indigo-600 bg-indigo-50 rounded-xl">
                <t.icon size={24} />
              </div>
              <h3 className="font-semibold text-gray-900">{t.ten}</h3>
              <p className="mt-1.5 text-sm text-gray-500">{t.mo_ta}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 text-white bg-gray-900">
        <div className="grid max-w-6xl gap-12 px-4 mx-auto lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">Tiện ích tại {nt.ten_nha_tro}</h2>
            <ul className="mt-5 space-y-3">
              {(nt.tien_ich || []).map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-gray-200">
                  <CheckCircle2 size={18} className="mt-0.5 text-emerald-400 flex-shrink-0" /> {t}
                </li>
              ))}
            </ul>
            {nt.tien_coc && (
              <p className="p-4 mt-6 text-sm text-gray-300 rounded-xl bg-white/5">
                💰 <b className="text-white">Tiền cọc:</b> {nt.tien_coc}. Hợp đồng tối thiểu {nt.thoi_han_toi_thieu}.
              </p>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold">Thuê phòng chỉ 4 bước</h2>
            <div className="mt-5 space-y-4">
              {QUY_TRINH.map((b, i) => (
                <div key={b.ten} className="flex items-center gap-4">
                  <div className="relative flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-300">
                    <b.icon size={22} />
                    <span className="absolute flex items-center justify-center w-5 h-5 text-[11px] font-bold text-white bg-indigo-500 rounded-full -top-1.5 -right-1.5">{i + 1}</span>
                  </div>
                  <div>
                    <p className="font-semibold">{b.ten}</p>
                    <p className="text-sm text-gray-400">{b.mo_ta}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="dang-ky" className="max-w-6xl px-4 py-16 mx-auto scroll-mt-16">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <p className="text-sm font-semibold tracking-wide text-indigo-600 uppercase">Liên hệ</p>
            <h2 className="mt-1 text-3xl font-bold text-gray-900">Đăng ký xem phòng</h2>
            <p className="mt-3 text-gray-500">Để lại thông tin, chủ nhà sẽ gọi lại xác nhận lịch hẹn. Hoặc nhắn ngay cho chatbot – trả lời tức thì 24/7.</p>
            <div className="mt-6 space-y-3 text-sm text-gray-700">
              <p className="flex items-start gap-3"><MapPin size={18} className="text-indigo-600 mt-0.5" /> {nt.dia_chi}</p>
              <p className="flex items-center gap-3"><Phone size={18} className="text-indigo-600" /> {nt.so_dien_thoai}{nt.zalo ? ` (Zalo: ${nt.zalo})` : ''}</p>
              {nt.email && <p className="flex items-center gap-3"><Mail size={18} className="text-indigo-600" /> {nt.email}</p>}
              {nt.gio_xem_phong && <p className="flex items-center gap-3"><Clock size={18} className="text-indigo-600" /> Xem phòng: {nt.gio_xem_phong}</p>}
            </div>
            <button onClick={() => moChatbot()} className="inline-flex items-center gap-2 px-4 py-2.5 mt-6 text-sm font-semibold text-indigo-700 rounded-xl bg-indigo-50 hover:bg-indigo-100">
              <Bot size={18} /> Hỏi trợ lý ảo 24/7
            </button>
          </div>

          <div className="p-6 bg-white border border-gray-200 shadow-sm lg:col-span-3 rounded-2xl md:p-8">
            {daGui ? (
              <div className="py-10 text-center">
                <CheckCircle2 size={56} className="mx-auto text-emerald-500" />
                <p className="mt-4 text-xl font-bold text-gray-900">Đã nhận đăng ký của bạn!</p>
                <p className="mt-2 text-gray-500">Chủ nhà sẽ gọi cho bạn qua số {form.so_dien_thoai} trong thời gian sớm nhất.</p>
                <button onClick={() => { setDaGui(false); setForm({ ...form, ho_ten: '', so_dien_thoai: '', ghi_chu: '' }); }} className="mt-5 text-sm font-medium text-indigo-600 hover:underline">
                  Đăng ký thêm
                </button>
              </div>
            ) : (
              <form onSubmit={guiDangKy} className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Họ tên <span className="text-red-500">*</span></label>
                  <input className={inputCls} value={form.ho_ten} onChange={(e) => setForm({ ...form, ho_ten: e.target.value })} placeholder="Nguyễn Văn A" maxLength={100} />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Số điện thoại <span className="text-red-500">*</span></label>
                  <input className={inputCls} value={form.so_dien_thoai} onChange={(e) => setForm({ ...form, so_dien_thoai: e.target.value })} placeholder="09xx xxx xxx" inputMode="tel" maxLength={15} />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Phòng muốn xem</label>
                  <select className={inputCls} value={form.phong_id} onChange={(e) => setForm({ ...form, phong_id: e.target.value })}>
                    <option value="">-- Phòng nào cũng được --</option>
                    {phong.map((p) => (
                      <option key={p.id} value={p.id}>Phòng {p.so_phong} – {formatCurrency(p.gia_thue)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Ngày hẹn xem</label>
                  <input type="date" className={inputCls} min={ngayHomNay()} value={form.ngay_hen} onChange={(e) => setForm({ ...form, ngay_hen: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block mb-1 text-sm font-medium text-gray-700">Ghi chú</label>
                  <textarea className={inputCls} rows={3} value={form.ghi_chu} onChange={(e) => setForm({ ...form, ghi_chu: e.target.value })} placeholder="Giờ có thể đến xem, số người ở, mã ưu đãi..." maxLength={500} />
                </div>
                <button type="submit" disabled={dangGui} className="py-3 font-semibold text-white bg-indigo-600 sm:col-span-2 rounded-xl hover:bg-indigo-700 disabled:opacity-50">
                  {dangGui ? 'Đang gửi...' : 'Gửi đăng ký xem phòng'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer className="py-8 text-sm text-center text-gray-500 border-t border-gray-100">
        <p className="font-medium text-gray-700">{nt.ten_nha_tro}</p>
        <p className="mt-1">{TEN_HE_THONG}</p>
        <p className="mt-1">© {new Date().getFullYear()} · <Link to="/dang-nhap" className="text-indigo-600 hover:underline">Đăng nhập hệ thống</Link></p>
      </footer>

      <ChatWidget />
    </div>
  );
};

export default GioiThieu;
