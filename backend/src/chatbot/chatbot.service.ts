import pool from '../config/database';
import { THONG_TIN_NHA_TRO as NT } from '../config/nhaTro';
import { NaiveBayes } from './naiveBayes';
import { Y_DINH, MUC_DO_MAU, laNguyHiem } from './duLieuHuanLuyen';
import { chuanHoa } from './vietnamese';
import { HoaDonService } from '../services/hoaDon.service';
import { PortalService } from '../services/portal.service';
import { DashboardService } from '../services/dashboard.service';
import { AppError } from '../utils/helpers';

export interface NguoiDung {
  id: number;
  vai_tro: string;
}
export interface NguCanh {
  cho?: 'mo_ta_su_co' | 'thong_tin_xem_phong';
  phong_id?: number | null;
  ngay_hen?: string | null;
}
export interface PhanHoi {
  tra_loi: string;
  y_dinh: string;
  do_tin_cay: number;
  goi_y: string[];
  the?: { loai: 'phong' | 'quang_cao' | 'hoa_don'; du_lieu: any[] };
  nut?: Array<{ nhan: string; duong_dan: string }>;
  ngu_canh?: NguCanh | null;
  phan_tich?: Array<{ y_dinh: string; ten: string; xac_suat: number }>;
}

const NGUONG_HIEU = 0.3;
const TEN_Y_DINH: Record<string, string> = Object.fromEntries(Y_DINH.map((y) => [y.ma, y.ten]));
const MUC_DO_TEN: Record<string, string> = { thap: 'Thấp', trung_binh: 'Trung bình', cao: 'Cao', khan_cap: 'Khẩn cấp' };

const LOAI_TRU: Record<string, string[]> = {
  nguoi_thue: ['thong_ke', 'khach_dang_ky'],
  chu_nha: ['phong_cua_toi', 'du_bao'],
  nhan_vien: ['phong_cua_toi', 'du_bao'],
  khach: []
};

const moHinh = new NaiveBayes(1);
const moHinhMucDo = new NaiveBayes(1);
let soMauHeThong = 0;
let soMauQuanLy = 0;
let daHuanLuyen = false;

export const huanLuyenLai = async () => {
  const duLieu: Array<[string, string]> = Y_DINH.flatMap((y) => y.mau.map((m) => [m, y.ma] as [string, string]));
  soMauHeThong = duLieu.length;
  try {
    const [rows]: any = await pool.query('SELECT y_dinh, cau_mau FROM chatbot_mau_cau');
    const hopLe = rows.filter((r: any) => TEN_Y_DINH[r.y_dinh]);
    soMauQuanLy = hopLe.length;
    for (const r of hopLe) duLieu.push([r.cau_mau, r.y_dinh]);
  } catch {
    soMauQuanLy = 0;
  }
  moHinh.huanLuyen(duLieu);
  moHinhMucDo.huanLuyen(MUC_DO_MAU);
  daHuanLuyen = true;
};

const damBaoHuanLuyen = async () => {
  if (!daHuanLuyen) await huanLuyenLai();
};

export const duDoanMucDo = (moTa: string): string => {
  if (laNguyHiem(moTa)) return 'khan_cap';
  if (!moHinhMucDo.soTuDaBiet(moTa)) return 'trung_binh';
  return moHinhMucDo.duDoan(moTa)[0]?.nhan || 'trung_binh';
};

const tien = (n: any) => `${Number(n || 0).toLocaleString('vi-VN')} ₫`;
const ngayVN = (d: any) => {
  if (!d) return '';
  const s = typeof d === 'string' ? d.slice(0, 10) : new Date(d).toISOString().slice(0, 10);
  const [y, m, day] = s.split('-');
  return `${day}/${m}/${y}`;
};
const kyVN = (tn: string) => `${tn.slice(5, 7)}/${tn.slice(0, 4)}`;
const ngayHomNay = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const thangHienTai = () => ngayHomNay().slice(0, 7);
const congThang = (tn: string, k: number) => {
  let y = Number(tn.slice(0, 4));
  let m = Number(tn.slice(5, 7)) + k;
  while (m > 12) { m -= 12; y++; }
  while (m < 1) { m += 12; y--; }
  return `${y}-${String(m).padStart(2, '0')}`;
};
const TRANG_THAI_HD: Record<string, string> = {
  chua_thanhtoan: 'Chưa thanh toán', thanhtoan_motphan: 'Thanh toán một phần', da_thanhtoan: 'Đã thanh toán', qua_han: 'Quá hạn'
};
const TRANG_THAI_SC: Record<string, string> = { cho_xuly: 'Chờ xử lý', dang_xuly: 'Đang xử lý', da_xuly: 'Đã xử lý', tu_choy: 'Từ chối' };
const laQuanLy = (u: NguoiDung | null) => u?.vai_tro === 'chu_nha' || u?.vai_tro === 'nhan_vien';
const laNguoiThue = (u: NguoiDung | null) => u?.vai_tro === 'nguoi_thue';

export const trichThongTin = (cau: string) => {
  const s = chuanHoa(cau);
  const kq: { thang?: string; phong?: string; giaMax?: number; giaMin?: number; soNguoi?: number; sdt?: string; ngay?: string } = {};

  const mThang = s.match(/\b(?:thang|t)\s*(\d{1,2})(?:\s+(?:nam\s+)?(\d{4}))?\b/) || s.match(/\b(\d{1,2})\s+(\d{4})\b/);
  if (/thang (nay|hien tai)/.test(s)) kq.thang = thangHienTai();
  else if (/thang (truoc|roi)/.test(s)) kq.thang = congThang(thangHienTai(), -1);
  else if (/thang (sau|toi)/.test(s)) kq.thang = congThang(thangHienTai(), 1);
  else if (mThang && Number(mThang[1]) >= 1 && Number(mThang[1]) <= 12) {
    const now = thangHienTai();
    let y = mThang[2] ? Number(mThang[2]) : Number(now.slice(0, 4));
    if (!mThang[2] && Number(mThang[1]) > Number(now.slice(5, 7))) y -= 1;
    kq.thang = `${y}-${String(Number(mThang[1])).padStart(2, '0')}`;
  }

  const mPhong = s.match(/\bp(?:hong)?\s*(\d{3})\b/);
  if (mPhong) kq.phong = `P${mPhong[1]}`;

  const mGia = s.match(/(\d+(?:\s\d+)?)\s*(?:trieu|tr)\s*(\d)?/);
  if (mGia) {
    let so = Number(mGia[1].replace(' ', '.'));
    if (mGia[2]) so += Number(mGia[2]) / 10;
    const gia = so * 1_000_000;
    if (/(duoi|toi da|khong qua|re hon|it hon|tam|khoang|loanh quanh)/.test(s)) kq.giaMax = /(tam|khoang|loanh quanh)/.test(s) ? gia * 1.1 : gia;
    else if (/(tren|tu|hon)/.test(s)) kq.giaMin = gia;
    else kq.giaMax = gia * 1.1;
  }

  const mNguoi = s.match(/(\d)\s*nguoi/);
  if (mNguoi) kq.soNguoi = Number(mNguoi[1]);

  const raw = String(cau || '').replace(/(\d)[\s.\-](?=\d)/g, '$1');
  const mSdt = raw.match(/(?:\+84|84)?(0?\d{9,10})/);
  if (mSdt) {
    let sdt = mSdt[1];
    if (!sdt.startsWith('0')) sdt = '0' + sdt;
    if (/^0\d{9}$/.test(sdt)) kq.sdt = sdt;
  }

  const today = new Date();
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const mNgay = s.match(/\b(\d{1,2})\s(\d{1,2})(?:\s(\d{4}))?\b/) && String(cau).match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{4}))?/);
  if (mNgay) {
    const d = new Date(Number(mNgay[3] || today.getFullYear()), Number(mNgay[2]) - 1, Number(mNgay[1]));
    if (!isNaN(d.getTime())) kq.ngay = fmt(d);
  } else if (/\bngay mai\b/.test(s) || /(?<!\p{L})mai(?!\p{L})/u.test(String(cau))) {
    const d = new Date(today); d.setDate(d.getDate() + 1); kq.ngay = fmt(d);
  } else if (/(hom nay|chieu nay|toi nay|sang nay)/.test(s)) kq.ngay = fmt(today);
  else if (/(thu 7|thu bay|cuoi tuan)/.test(s)) {
    const d = new Date(today); d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7)); kq.ngay = fmt(d);
  } else if (/chu nhat/.test(s)) {
    const d = new Date(today); d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7)); kq.ngay = fmt(d);
  }
  return kq;
};

export const goiYTheoVaiTro = (u: NguoiDung | null): string[] => {
  if (laNguoiThue(u)) return ['Tháng này tôi phải đóng bao nhiêu?', 'Dự báo tiền tháng sau', 'Hợp đồng còn bao lâu?', 'Báo sự cố', 'Cách chuyển khoản'];
  if (laQuanLy(u)) return ['Tình hình nhà trọ tháng này', 'Phòng nào còn nợ tiền?', 'Hợp đồng sắp hết hạn', 'Sự cố chưa xử lý', 'Khách đăng ký xem phòng'];
  return ['Còn phòng trống không?', 'Giá điện nước thế nào?', 'Có khuyến mãi gì không?', 'Thủ tục thuê phòng', 'Đặt lịch xem phòng'];
};

const canDangNhap = (viec: string): Partial<PhanHoi> => ({
  tra_loi: `Để ${viec}, bạn cần **đăng nhập tài khoản người thuê** (tài khoản do chủ nhà cấp: tên đăng nhập là số điện thoại).\nNếu chưa thuê phòng, mình có thể giúp bạn tìm phòng trống hoặc đặt lịch xem phòng nhé!`,
  nut: [{ nhan: 'Đăng nhập', duong_dan: '/dang-nhap' }]
});

const khongCoQuyen = (): Partial<PhanHoi> => ({
  tra_loi: 'Thông tin này chỉ dành cho chủ nhà và nhân viên quản lý. Bạn có thể hỏi mình về phòng, hóa đơn, hợp đồng hoặc báo sự cố nhé.'
});

type XuLy = (u: NguoiDung | null, cau: string, tt: ReturnType<typeof trichThongTin>) => Promise<Partial<PhanHoi>>;

const layTenNguoiDung = async (u: NguoiDung | null) => {
  if (!u) return '';
  const [rows]: any = await pool.query(
    'SELECT tk.ten_dang_nhap, nt.ho_ten FROM tai_khoan tk LEFT JOIN nguoi_thue nt ON nt.tai_khoan_id = tk.id WHERE tk.id = ?',
    [u.id]
  );
  return rows[0]?.ho_ten?.split(' ').slice(-1)[0] || rows[0]?.ten_dang_nhap || '';
};

const dsPhongTrong = async () => {
  const [rows]: any = await pool.query(
    `SELECT p.id, p.so_phong, p.tang, p.gia_thue, p.dien_tich, p.so_nguoi_toi_da, p.mo_ta,
            GROUP_CONCAT(dv.ten_dich_vu ORDER BY dv.id SEPARATOR ', ') AS dich_vu
     FROM phong_tro p
     LEFT JOIN dich_vu_phong dvp ON dvp.phong_id = p.id
     LEFT JOIN dich_vu dv ON dv.id = dvp.dich_vu_id
     WHERE p.trang_thai = 'trong'
     GROUP BY p.id ORDER BY p.gia_thue`
  );
  return rows.map((r: any) => ({ ...r, gia_thue: Number(r.gia_thue) }));
};

const quangCaoDangChay = async (doiTuong: string[]) => {
  const [rows]: any = await pool.query(
    `SELECT * FROM quang_cao WHERE trang_thai = 'hien' AND doi_tuong IN (?)
       AND (ngay_bat_dau IS NULL OR ngay_bat_dau <= CURDATE()) AND (ngay_ket_thuc IS NULL OR ngay_ket_thuc >= CURDATE())
     ORDER BY thu_tu, id DESC`,
    [doiTuong]
  );
  return rows;
};

const XU_LY: Record<string, XuLy> = {
  chao_hoi: async (u) => {
    const ten = await layTenNguoiDung(u);
    const gio = new Date().getHours();
    const buoi = gio < 11 ? 'buổi sáng' : gio < 14 ? 'buổi trưa' : gio < 18 ? 'buổi chiều' : 'buổi tối';
    const vaiTro = laNguoiThue(u) ? 'tra hóa đơn, hợp đồng, báo sự cố' : laQuanLy(u) ? 'xem nhanh tình hình nhà trọ, công nợ, sự cố' : 'tìm phòng trống, xem giá, khuyến mãi và đặt lịch xem phòng';
    return { tra_loi: `Chào ${buoi}${ten ? ` ${ten}` : ''}! 👋 Mình là trợ lý ảo của **${NT.ten_nha_tro}**, hỗ trợ 24/7.\nMình có thể giúp bạn ${vaiTro}. Bạn cần gì cứ hỏi nhé!` };
  },
  cam_on: async () => ({ tra_loi: 'Không có gì ạ! Nếu cần thêm gì cứ nhắn mình bất cứ lúc nào nhé 😊' }),
  tam_biet: async () => ({ tra_loi: `Tạm biệt bạn! Chúc bạn một ngày tốt lành. Mình luôn ở đây 24/7 nếu bạn cần hỗ trợ.` }),
  tro_giup: async (u) => {
    const ds = laNguoiThue(u)
      ? ['Tiền phải đóng, hóa đơn từng tháng', 'Điện nước đã dùng và **dự báo tiền tháng sau**', 'Hợp đồng, tiền cọc', '**Báo sự cố** ngay trong khung chat (tự đánh giá mức độ)', 'Cách chuyển khoản, nội quy, liên hệ chủ nhà']
      : laQuanLy(u)
        ? ['Tình hình nhà trọ, doanh thu tháng này', 'Phòng nào còn nợ, hóa đơn quá hạn', 'Hợp đồng sắp hết hạn', 'Sự cố chưa xử lý, phòng chưa ghi điện nước', 'Khách đăng ký xem phòng mới']
        : ['Tìm **phòng trống** theo giá, số người', 'Giá phòng, giá điện nước và dịch vụ', 'Khuyến mãi đang có', 'Thủ tục thuê, nội quy, tiện ích', '**Đặt lịch xem phòng** ngay trong khung chat'];
    return { tra_loi: `Mình là chatbot AI chạy ngay trên hệ thống (không cần Internet bên ngoài). Bạn có thể hỏi mình:\n${ds.map((d) => `• ${d}`).join('\n')}\n\nCứ gõ tự nhiên như nhắn tin, có dấu hay không dấu đều được.` };
  },

  phong_trong: async (u, _c, tt) => {
    let phong = await dsPhongTrong();
    const tong = phong.length;
    if (tt.giaMax) phong = phong.filter((p: any) => p.gia_thue <= tt.giaMax!);
    if (tt.giaMin) phong = phong.filter((p: any) => p.gia_thue >= tt.giaMin!);
    if (tt.soNguoi) phong = phong.filter((p: any) => p.so_nguoi_toi_da >= tt.soNguoi!);
    if (tong === 0) {
      return {
        tra_loi: `Hiện tại ${NT.ten_nha_tro} **đã kín phòng** 😥. Bạn để lại số điện thoại, khi có phòng trống chủ nhà sẽ báo ngay cho bạn nhé!`,
        ngu_canh: { cho: 'thong_tin_xem_phong' }
      };
    }
    if (phong.length === 0) {
      return { tra_loi: `Hiện có ${tong} phòng trống nhưng chưa có phòng phù hợp điều kiện của bạn. Đây là các phòng đang trống:`, the: { loai: 'phong', du_lieu: await dsPhongTrong() } };
    }
    const km = await quangCaoDangChay(['tat_ca', 'khach']);
    return {
      tra_loi: `Hiện có **${phong.length} phòng trống** phù hợp${tt.giaMax ? ` (giá dưới ${tien(tt.giaMax)})` : ''}${tt.soNguoi ? ` cho ${tt.soNguoi} người` : ''}:` +
        (km.length && !laNguoiThue(u) ? `\n🎁 Đang có ưu đãi: **${km[0].tieu_de}**.` : ''),
      the: { loai: 'phong', du_lieu: phong },
      nut: [{ nhan: 'Đặt lịch xem phòng', duong_dan: '/gioi-thieu#dang-ky' }]
    };
  },

  gia_phong: async (_u, _c, tt) => {
    if (tt.phong) {
      const [r]: any = await pool.query('SELECT * FROM phong_tro WHERE so_phong = ?', [tt.phong]);
      if (r.length) {
        const p = r[0];
        const trang = p.trang_thai === 'trong' ? 'đang **trống**, có thể đặt lịch xem' : 'hiện **đã có người thuê**';
        return { tra_loi: `Phòng ${p.so_phong} (tầng ${p.tang}, ${p.dien_tich} m², tối đa ${p.so_nguoi_toi_da} người) giá **${tien(p.gia_thue)}/tháng**, ${trang}.` };
      }
    }
    const [r]: any = await pool.query('SELECT MIN(gia_thue) AS mn, MAX(gia_thue) AS mx FROM phong_tro');
    const trong = await dsPhongTrong();
    return {
      tra_loi: `Giá thuê tại ${NT.ten_nha_tro} từ **${tien(r[0].mn)}** đến **${tien(r[0].mx)}**/tháng tùy diện tích và tầng (chưa gồm điện nước, dịch vụ).` +
        (trong.length ? `\nCác phòng đang trống:` : '\nHiện chưa có phòng trống.'),
      the: trong.length ? { loai: 'phong', du_lieu: trong } : undefined
    };
  },

  gia_dich_vu: async () => {
    const [dv]: any = await pool.query('SELECT * FROM dich_vu ORDER BY id');
    const dong = dv.map((d: any) =>
      `• **${d.ten_dich_vu}**: ${tien(d.don_gia)}/${d.don_vi_tinh}${d.loai_dich_vu === 'theo_chi_so' ? ' (theo chỉ số công tơ)' : /người/i.test(d.don_vi_tinh) ? ' (nhân số người ở)' : ' (cố định mỗi tháng)'}`
    );
    return { tra_loi: `Bảng giá dịch vụ hiện tại:\n${dong.join('\n')}\n\nTiền điện nước = (chỉ số mới − chỉ số cũ) × đơn giá. Hóa đơn được lập cuối mỗi tháng, xem trực tuyến trên hệ thống.` };
  },

  lien_he: async () => ({
    tra_loi: `📍 **${NT.ten_nha_tro}**\n• Địa chỉ: ${NT.dia_chi}\n• Điện thoại / Zalo: **${NT.so_dien_thoai}**\n• Email: ${NT.email}\n• Giờ xem phòng: ${NT.gio_xem_phong}`
  }),

  khuyen_mai: async (u) => {
    const doiTuong = laNguoiThue(u) ? ['tat_ca', 'nguoi_thue'] : laQuanLy(u) ? ['tat_ca', 'khach', 'nguoi_thue'] : ['tat_ca', 'khach'];
    const ds = (await quangCaoDangChay(doiTuong)).filter((q: any) => q.loai === 'khuyen_mai');
    if (!ds.length) return { tra_loi: 'Hiện chưa có chương trình khuyến mãi nào. Bạn quay lại sau nhé, chủ nhà thường có ưu đãi đầu mỗi quý!' };
    return {
      tra_loi: `Đang có **${ds.length} chương trình ưu đãi** 🎉:\n${ds.map((q: any) => `• **${q.tieu_de}**${q.ma_uu_dai ? ` – mã \`${q.ma_uu_dai}\`` : ''}${q.ngay_ket_thuc ? ` (đến ${ngayVN(q.ngay_ket_thuc)})` : ''}`).join('\n')}`,
      the: { loai: 'quang_cao', du_lieu: ds }
    };
  },

  thu_tuc_thue: async () => ({
    tra_loi: `Thủ tục thuê phòng rất đơn giản:\n1️⃣ Đặt lịch xem phòng (ngay trong khung chat này hoặc gọi ${NT.so_dien_thoai})\n2️⃣ Chuẩn bị: ${NT.giay_to.join('; ')}\n3️⃣ Ký hợp đồng – thời hạn tối thiểu **${NT.thoi_han_toi_thieu}**\n4️⃣ ${NT.tien_coc}\n5️⃣ Nhận phòng và tài khoản để xem hóa đơn, báo sự cố trực tuyến\n\nChủ nhà hỗ trợ đăng ký tạm trú cho người thuê.`
  }),

  dat_lich_xem: async (_u, cau, tt) => {
    let phongId: number | null = null;
    if (tt.phong) {
      const [r]: any = await pool.query('SELECT id FROM phong_tro WHERE so_phong = ?', [tt.phong]);
      phongId = r[0]?.id || null;
    }
    if (tt.sdt) return taoYeuCauXemPhong(cau, tt, phongId);
    return {
      tra_loi: `Rất vui được đón bạn đến xem phòng${tt.phong ? ` **${tt.phong}**` : ''}${tt.ngay ? ` vào ngày **${ngayVN(tt.ngay)}**` : ''}! 🏠\nBạn cho mình xin **họ tên và số điện thoại** để chủ nhà gọi xác nhận nhé.\n(Ví dụ: Nguyễn Văn A 0901234567)`,
      ngu_canh: { cho: 'thong_tin_xem_phong', phong_id: phongId, ngay_hen: tt.ngay || null }
    };
  },

  noi_quy: async () => ({ tra_loi: `Nội quy chính của nhà trọ:\n${NT.noi_quy.map((n) => `• ${n}`).join('\n')}` }),
  tien_ich: async () => ({ tra_loi: `Tiện ích tại ${NT.ten_nha_tro}:\n${NT.tien_ich.map((n) => `✅ ${n}`).join('\n')}` }),

  hoa_don: async (u, _c, tt) => {
    if (laQuanLy(u)) {
      await HoaDonService.capNhatQuaHan();
      const [rows]: any = await pool.query(
        `SELECT h.id, h.thang_nam, h.tong_tien - h.so_tien_da_tra AS con_lai, h.trang_thai, h.han_thanhtoan, p.so_phong
         FROM hoa_don h JOIN hop_dong hd ON h.hop_dong_id = hd.id JOIN phong_tro p ON hd.phong_id = p.id
         WHERE h.trang_thai <> 'da_thanhtoan'
         ORDER BY FIELD(h.trang_thai, 'qua_han', 'thanhtoan_motphan', 'chua_thanhtoan'), h.han_thanhtoan`
      );
      if (!rows.length) return { tra_loi: '🎉 Tất cả hóa đơn đều đã được thanh toán đủ!' };
      const tong = rows.reduce((s: number, r: any) => s + Number(r.con_lai), 0);
      const quaHan = rows.filter((r: any) => r.trang_thai === 'qua_han').length;
      return {
        tra_loi: `Có **${rows.length} hóa đơn** chưa thanh toán xong, tổng công nợ **${tien(tong)}**${quaHan ? `, trong đó **${quaHan} hóa đơn quá hạn**` : ''}:\n` +
          rows.slice(0, 6).map((r: any) => `• Phòng ${r.so_phong} – kỳ ${kyVN(r.thang_nam)}: còn ${tien(r.con_lai)} (${TRANG_THAI_HD[r.trang_thai]}, hạn ${ngayVN(r.han_thanhtoan)})`).join('\n') +
          (rows.length > 6 ? `\n… và ${rows.length - 6} hóa đơn khác.` : ''),
        nut: [{ nhan: 'Mở danh sách hóa đơn', duong_dan: '/hoa-don' }]
      };
    }
    if (!laNguoiThue(u)) return canDangNhap('xem hóa đơn của bạn');
    const ds: any[] = (await PortalService.getHoaDon(u!.id)) as any[];
    if (!ds.length) return { tra_loi: 'Bạn chưa có hóa đơn nào. Hóa đơn được lập vào cuối mỗi tháng.' };
    if (tt.thang) {
      let h = ds.find((x) => x.thang_nam === tt.thang);
      let ghiChu = '';

      if (!h && tt.thang === thangHienTai()) {
        h = ds[0];
        ghiChu = `_Kỳ ${kyVN(tt.thang)} chưa lập hóa đơn (lập vào cuối tháng), đây là hóa đơn gần nhất._\n`;
      }
      if (!h) return { tra_loi: `Chưa có hóa đơn kỳ ${kyVN(tt.thang)}. Các kỳ đã có: ${ds.map((x) => kyVN(x.thang_nam)).join(', ')}.` };
      const ct = await HoaDonService.getById(h.id);
      return {
        tra_loi: ghiChu + `Hóa đơn kỳ **${kyVN(h.thang_nam)}** (${h.ma_hoa_don}): tổng **${tien(h.tong_tien)}**, đã trả ${tien(h.so_tien_da_tra)}, còn **${tien(h.con_lai)}** – ${TRANG_THAI_HD[h.trang_thai]}.\n` +
          (ct.chi_tiet as any[]).map((c: any) => `• ${c.ten_dich_vu}: ${Number(c.so_luong)} × ${tien(c.don_gia)} = ${tien(c.thanh_tien)}`).join('\n'),
        nut: [{ nhan: 'Xem chi tiết & thanh toán', duong_dan: `/cua-toi/hoa-don/${h.id}` }]
      };
    }
    const no = ds.filter((x) => x.trang_thai !== 'da_thanhtoan');
    if (!no.length) {
      return { tra_loi: `Bạn **không còn nợ** khoản nào 🎉. Hóa đơn gần nhất kỳ ${kyVN(ds[0].thang_nam)}: ${tien(ds[0].tong_tien)} – đã thanh toán.` };
    }
    const tong = no.reduce((s, x) => s + Number(x.con_lai), 0);
    return {
      tra_loi: `Bạn cần thanh toán **${tien(tong)}**:\n` +
        no.map((x) => `• Kỳ ${kyVN(x.thang_nam)}: còn ${tien(x.con_lai)} – hạn ${ngayVN(x.han_thanhtoan)}${x.trang_thai === 'qua_han' ? ' ⚠️ **đã quá hạn**' : ''}`).join('\n'),
      the: { loai: 'hoa_don', du_lieu: no },
      nut: [{ nhan: 'Xem & thanh toán', duong_dan: `/cua-toi/hoa-don/${no[0].id}` }]
    };
  },

  tien_dien_nuoc: async (u, _c, tt) => {
    if (laQuanLy(u)) {
      const ky = tt.thang || thangHienTai();
      const [rows]: any = await pool.query(
        `SELECT p.so_phong FROM phong_tro p WHERE p.trang_thai = 'da_thue'
           AND NOT EXISTS (SELECT 1 FROM chi_so_dien_nuoc c WHERE c.phong_id = p.id AND c.thang_nam = ?) ORDER BY p.so_phong`,
        [ky]
      );
      return {
        tra_loi: rows.length
          ? `Kỳ ${kyVN(ky)} còn **${rows.length} phòng chưa ghi chỉ số**: ${rows.map((r: any) => r.so_phong).join(', ')}.`
          : `Tất cả phòng đang thuê đã được ghi chỉ số kỳ ${kyVN(ky)} ✅.`,
        nut: [{ nhan: 'Ghi chỉ số điện nước', duong_dan: '/dien-nuoc' }]
      };
    }
    if (!laNguoiThue(u)) return canDangNhap('xem chỉ số điện nước phòng bạn');
    const ds: any[] = (await PortalService.getChiSo(u!.id)) as any[];
    if (!ds.length) return { tra_loi: 'Chưa có chỉ số điện nước nào được ghi cho phòng của bạn.' };
    const idx = tt.thang ? ds.findIndex((x) => x.thang_nam === tt.thang) : 0;
    if (idx < 0) return { tra_loi: `Chưa có chỉ số kỳ ${kyVN(tt.thang!)}. Các kỳ đã ghi: ${ds.map((x) => kyVN(x.thang_nam)).join(', ')}.` };
    const c = ds[idx];
    const truoc = ds[idx + 1];
    const soSanh = (moi: number, cu: number, dv: string) => {
      if (!cu) return '';
      const pt = Math.round(((moi - cu) / cu) * 100);
      return pt === 0 ? ' (bằng tháng trước)' : ` (${pt > 0 ? 'tăng' : 'giảm'} ${Math.abs(pt)}% so với tháng trước: ${cu} ${dv})`;
    };
    let goiY = '';
    if (truoc && Number(c.dien_tieu_thu) > Number(truoc.dien_tieu_thu) * 1.2) {
      goiY = '\n💡 Điện tăng khá nhiều: bạn kiểm tra máy lạnh (để 26–27°C), tắt bình nóng lạnh khi không dùng nhé.';
    }
    if (truoc && Number(c.nuoc_tieu_thu) > Number(truoc.nuoc_tieu_thu) * 1.5) {
      goiY += '\n💡 Nước tăng bất thường, có thể vòi hoặc bồn cầu bị rò rỉ – bạn có thể báo sự cố ngay tại đây.';
    }
    return {
      tra_loi: `Kỳ **${kyVN(c.thang_nam)}** – phòng ${c.so_phong}:\n` +
        `⚡ Điện: ${c.chi_so_dien_cu} → ${c.chi_so_dien_moi} = **${c.dien_tieu_thu} kWh**${soSanh(Number(c.dien_tieu_thu), Number(truoc?.dien_tieu_thu), 'kWh')}\n` +
        `💧 Nước: ${c.chi_so_nuoc_cu} → ${c.chi_so_nuoc_moi} = **${c.nuoc_tieu_thu} m³**${soSanh(Number(c.nuoc_tieu_thu), Number(truoc?.nuoc_tieu_thu), 'm³')}` + goiY
    };
  },

  du_bao: async (u) => {
    if (!laNguoiThue(u)) return laQuanLy(u) ? khongCoQuyen() : canDangNhap('dự báo tiền tháng sau');
    const kq = await duBaoHoaDon(u!.id);
    if (!kq) return { tra_loi: 'Chưa đủ dữ liệu điện nước để dự báo (cần ít nhất 1 tháng). Bạn hỏi lại sau khi có hóa đơn đầu tiên nhé.' };
    return {
      tra_loi: `📈 Dự báo hóa đơn kỳ **${kyVN(kq.ky)}** của phòng ${kq.so_phong}: khoảng **${tien(kq.tong)}**\n` +
        `• Tiền phòng: ${tien(kq.tien_phong)}\n• Điện ≈ ${kq.dien} kWh × ${tien(kq.gia_dien)} = ${tien(kq.tien_dien)}\n• Nước ≈ ${kq.nuoc} m³ × ${tien(kq.gia_nuoc)} = ${tien(kq.tien_nuoc)}\n• Dịch vụ cố định: ${tien(kq.co_dinh)}\n` +
        `_Dự báo bằng ${kq.phuong_phap} trên ${kq.so_thang} tháng gần nhất, số thực tế có thể chênh lệch._`
    };
  },

  thanh_toan: async (u) => {
    const ck = NT.so_tai_khoan
      ? `• Ngân hàng: **${NT.ngan_hang}**\n• Số tài khoản: **${NT.so_tai_khoan}**\n• Chủ tài khoản: ${NT.chu_tai_khoan}`
      : `• Chuyển khoản theo thông tin chủ nhà cung cấp (liên hệ ${NT.so_dien_thoai})`;
    if (!laNguoiThue(u)) {
      return { tra_loi: `Người thuê có thể thanh toán bằng **chuyển khoản / quét mã VietQR** hoặc tiền mặt:\n${ck}\nSau khi nhận tiền, chủ nhà ghi nhận trên hệ thống và hóa đơn chuyển sang "Đã thanh toán".` };
    }
    const ds: any[] = (await PortalService.getHoaDon(u!.id)) as any[];
    const no = ds.find((x) => x.trang_thai !== 'da_thanhtoan');
    const tt: any[] = (await PortalService.getThanhToan(u!.id)) as any[];
    return {
      tra_loi: `Bạn thanh toán bằng chuyển khoản (quét mã VietQR trong trang hóa đơn) hoặc tiền mặt:\n${ck}\n` +
        (no ? `• Nội dung chuyển khoản: **${no.ma_hoa_don} PHONG ${no.so_phong}** – số tiền ${tien(no.con_lai)}\n` : '') +
        (tt.length ? `\nLần thanh toán gần nhất: ${tien(tt[0].so_tien)} ngày ${ngayVN(tt[0].ngay_thanh_toan)} (hóa đơn ${tt[0].ma_hoa_don}).` : '\nBạn chưa có lần thanh toán nào.'),
      nut: no ? [{ nhan: 'Mở hóa đơn để quét mã QR', duong_dan: `/cua-toi/hoa-don/${no.id}` }] : [{ nhan: 'Lịch sử thanh toán', duong_dan: '/cua-toi/thanh-toan' }]
    };
  },

  hop_dong: async (u) => {
    if (laQuanLy(u)) {
      const [rows]: any = await pool.query(
        `SELECT hd.id, hd.ma_hop_dong, hd.ngay_ket_thuc, DATEDIFF(hd.ngay_ket_thuc, CURDATE()) AS con, p.so_phong, nt.ho_ten
         FROM hop_dong hd JOIN phong_tro p ON hd.phong_id = p.id JOIN nguoi_thue nt ON hd.chu_hop_dong_id = nt.id
         WHERE hd.trang_thai = 'con_han' AND hd.ngay_ket_thuc <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) ORDER BY hd.ngay_ket_thuc`
      );
      if (!rows.length) return { tra_loi: 'Không có hợp đồng nào hết hạn trong 30 ngày tới ✅.' };
      return {
        tra_loi: `Có **${rows.length} hợp đồng** sắp hết hạn trong 30 ngày:\n` +
          rows.map((r: any) => `• Phòng ${r.so_phong} – ${r.ho_ten}: hết hạn ${ngayVN(r.ngay_ket_thuc)} (còn ${r.con} ngày)`).join('\n') +
          '\nNên liên hệ người thuê để gia hạn hoặc chuẩn bị đăng tin cho thuê.',
        nut: [{ nhan: 'Mở danh sách hợp đồng', duong_dan: '/hop-dong' }]
      };
    }
    if (!laNguoiThue(u)) return XU_LY.thu_tuc_thue(u, '', {});
    const ds: any[] = (await PortalService.getHopDong(u!.id)) as any[];
    const hd = ds.find((x) => x.trang_thai === 'con_han') || ds[0];
    if (!hd) return { tra_loi: 'Bạn chưa có hợp đồng thuê phòng nào trên hệ thống.' };
    const coc: Record<string, string> = { dang_giu: 'chủ nhà đang giữ', da_hoan_tra: 'đã hoàn trả', da_khau_tru: 'đã khấu trừ' };
    return {
      tra_loi: `Hợp đồng **${hd.ma_hop_dong}** – phòng ${hd.so_phong}:\n• Thời hạn: ${ngayVN(hd.ngay_bat_dau)} → **${ngayVN(hd.ngay_ket_thuc)}**` +
        (hd.trang_thai === 'con_han' ? ` (còn **${hd.so_ngay_con_lai} ngày**)` : ' (đã kết thúc)') +
        `\n• Tiền cọc: ${tien(hd.tien_coc)} – ${coc[hd.trang_thai_tien_coc] || ''}\n• Ngày chốt tiền: ngày ${hd.ngay_chot_tien_hang_thang} hằng tháng\n` +
        `Muốn gia hạn hoặc trả phòng, bạn báo chủ nhà trước ít nhất 30 ngày (${NT.so_dien_thoai}).`,
      nut: [{ nhan: 'Xem hợp đồng', duong_dan: '/cua-toi/hop-dong' }]
    };
  },

  bao_su_co: async (u, cau) => {
    if (laQuanLy(u)) return { tra_loi: 'Quản lý ghi nhận sự cố tại trang Sự cố nhé.', nut: [{ nhan: 'Mở trang Sự cố', duong_dan: '/su-co' }] };
    if (!laNguoiThue(u)) return canDangNhap('báo sự cố cho phòng của bạn');
    const conLai = chuanHoa(cau).split(' ').filter((w) => !['toi', 'muon', 'bao', 'su', 'co', 'hong', 'can', 'sua', 'nho', 'giup', 'minh', 'em', 'oi', 'a', 'cho', 'hu', 'cai', 'bi', 'phong', 'chua'].includes(w));
    if (conLai.length < 2) {
      return {
        tra_loi: 'Bạn mô tả giúp mình sự cố đang gặp nhé (ví dụ: "vòi nước nhà tắm bị rỉ", "ổ cắm có tia lửa"). Mình sẽ tự đánh giá mức độ và chuyển ngay cho chủ nhà.',
        ngu_canh: { cho: 'mo_ta_su_co' }
      };
    }
    return taoSuCo(u!, cau);
  },

  tinh_trang_su_co: async (u) => {
    if (laQuanLy(u)) {
      const [rows]: any = await pool.query(
        `SELECT s.tieu_de, s.muc_do_uu_tien, s.trang_thai, p.so_phong FROM su_co s JOIN phong_tro p ON s.phong_id = p.id
         WHERE s.trang_thai IN ('cho_xuly', 'dang_xuly') ORDER BY FIELD(s.muc_do_uu_tien, 'khan_cap', 'cao', 'trung_binh', 'thap'), s.id`
      );
      if (!rows.length) return { tra_loi: 'Không có sự cố nào đang chờ xử lý ✅.' };
      return {
        tra_loi: `Có **${rows.length} sự cố** chưa xử lý xong:\n` +
          rows.map((r: any) => `• ${r.so_phong}: ${r.tieu_de} – mức ${MUC_DO_TEN[r.muc_do_uu_tien]}, ${TRANG_THAI_SC[r.trang_thai]}`).join('\n'),
        nut: [{ nhan: 'Mở trang Sự cố', duong_dan: '/su-co' }]
      };
    }
    if (!laNguoiThue(u)) return canDangNhap('xem tình trạng sự cố');
    const ds: any[] = (await PortalService.getSuCo(u!.id)) as any[];
    if (!ds.length) return { tra_loi: 'Phòng bạn chưa có sự cố nào được báo. Nếu có gì hỏng, cứ mô tả cho mình để báo chủ nhà nhé!' };
    return {
      tra_loi: `Các sự cố gần đây của phòng bạn:\n` + ds.slice(0, 5).map((s) => `• ${s.tieu_de} – **${TRANG_THAI_SC[s.trang_thai]}** (báo ngày ${ngayVN(s.ngay_tao)})`).join('\n'),
      nut: [{ nhan: 'Xem tất cả sự cố', duong_dan: '/cua-toi/su-co' }]
    };
  },

  phong_cua_toi: async (u) => {
    if (!laNguoiThue(u)) return laQuanLy(u) ? khongCoQuyen() : canDangNhap('xem thông tin phòng của bạn');
    const d: any = await PortalService.getPhong(u!.id);
    if (!d) return { tra_loi: 'Bạn hiện không có hợp đồng thuê phòng nào còn hiệu lực.' };
    return {
      tra_loi: `Bạn đang ở **phòng ${d.phong.so_phong}** (tầng ${d.phong.tang}, ${d.phong.dien_tich} m², giá ${tien(d.phong.gia_thue)}/tháng).\n` +
        `• Thành viên (${d.thanh_vien.length}/${d.phong.so_nguoi_toi_da}): ${d.thanh_vien.map((t: any) => t.ho_ten).join(', ')}\n` +
        `• Dịch vụ: ${d.dich_vu.map((x: any) => x.ten_dich_vu).join(', ') || 'không có'}`,
      nut: [{ nhan: 'Xem phòng của tôi', duong_dan: '/cua-toi/phong' }]
    };
  },

  tai_khoan: async (u) => ({
    tra_loi: u
      ? `• Đổi mật khẩu: vào **${laNguoiThue(u) ? 'Thông tin cá nhân' : 'Đổi mật khẩu'}** ở menu bên trái.\n• Quên mật khẩu hoặc tài khoản bị khóa: liên hệ chủ nhà (${NT.so_dien_thoai}) để được đặt lại.`
      : `Tài khoản người thuê do chủ nhà cấp khi ký hợp đồng: tên đăng nhập là **số điện thoại**, mật khẩu ban đầu là **6 số cuối CCCD**. Quên mật khẩu thì liên hệ chủ nhà (${NT.so_dien_thoai}) để đặt lại nhé.`,
    nut: u ? [{ nhan: laNguoiThue(u) ? 'Thông tin cá nhân' : 'Đổi mật khẩu', duong_dan: laNguoiThue(u) ? '/cua-toi/tai-khoan' : '/doi-mat-khau' }] : [{ nhan: 'Đăng nhập', duong_dan: '/dang-nhap' }]
  }),

  thong_ke: async (u) => {
    if (!laQuanLy(u)) return khongCoQuyen();
    const t: any = await DashboardService.getThongKe();
    const lapDay = t.tong_phong ? Math.round((t.phong_da_thue / t.tong_phong) * 100) : 0;
    const [[yc]]: any = await pool.query(`SELECT COUNT(*) AS c FROM yeu_cau_xem_phong WHERE trang_thai = 'moi'`);
    return {
      tra_loi: `📊 Tình hình ${NT.ten_nha_tro} hôm nay:\n• Phòng: ${t.phong_da_thue}/${t.tong_phong} đang thuê (lấp đầy **${lapDay}%**), ${t.phong_trong} phòng trống\n` +
        `• Người thuê: ${t.nguoi_thue_active} – hợp đồng còn hạn: ${t.hop_dong_active} (${t.hop_dong_sap_het} sắp hết hạn)\n` +
        `• Doanh thu tháng này: **${tien(t.doanh_thu_thang_nay)}**\n• Công nợ: **${tien(t.cong_no)}** (${t.hoa_don_chua_tt} hóa đơn)\n` +
        `• Sự cố chưa xử lý: ${t.su_co_chua_xu_ly} – khách mới đăng ký xem phòng: ${yc.c}`,
      nut: [{ nhan: 'Mở trang Tổng quan', duong_dan: '/' }]
    };
  },

  khach_dang_ky: async (u) => {
    if (!laQuanLy(u)) return XU_LY.dat_lich_xem(u, '', {});
    const [rows]: any = await pool.query(
      `SELECT y.*, p.so_phong FROM yeu_cau_xem_phong y LEFT JOIN phong_tro p ON y.phong_id = p.id
       WHERE y.trang_thai = 'moi' ORDER BY y.id DESC`
    );
    if (!rows.length) return { tra_loi: 'Chưa có khách mới đăng ký xem phòng.', nut: [{ nhan: 'Mở danh sách khách', duong_dan: '/khach-xem-phong' }] };
    return {
      tra_loi: `Có **${rows.length} khách mới** đăng ký xem phòng:\n` +
        rows.map((r: any) => `• ${r.ho_ten} – ${r.so_dien_thoai}${r.so_phong ? ` – phòng ${r.so_phong}` : ''}${r.ngay_hen ? ` – hẹn ${ngayVN(r.ngay_hen)}` : ''} (${r.nguon === 'chatbot' ? 'qua chatbot' : 'qua website'})`).join('\n'),
      nut: [{ nhan: 'Mở danh sách khách', duong_dan: '/khach-xem-phong' }]
    };
  }
};

const taoSuCo = async (u: NguoiDung, moTa: string): Promise<Partial<PhanHoi>> => {
  const mucDo = duDoanMucDo(moTa);
  const tieuDe = moTa.trim().replace(/^(tôi|mình|em|cho)?\s*(muốn\s*)?(báo\s*(sự cố|hỏng)\s*(là|:)?)?\s*/i, '');
  const td = (tieuDe || moTa).trim();
  try {
    await PortalService.createSuCo(u.id, {
      tieu_de: (td.charAt(0).toUpperCase() + td.slice(1)).slice(0, 140),
      mo_ta: `${moTa.trim()}\n(Gửi qua chatbot)`,
      muc_do_uu_tien: mucDo
    });
  } catch (e: any) {
    return { tra_loi: e?.message || 'Không gửi được báo cáo sự cố, bạn thử lại sau nhé.' };
  }
  const loiKhuyen = mucDo === 'khan_cap' ? '\n⚠️ Đây là sự cố **nguy hiểm**: hãy ngắt cầu dao / khóa van nước nếu có thể và gọi ngay chủ nhà ' + NT.so_dien_thoai + '.' : '';
  return {
    tra_loi: `✅ Đã gửi báo cáo sự cố cho chủ nhà.\n• Nội dung: "${td}"\n• Mức độ (AI đánh giá): **${MUC_DO_TEN[mucDo]}**${loiKhuyen}\nBạn theo dõi tiến độ ở mục Báo sự cố nhé.`,
    nut: [{ nhan: 'Xem sự cố của tôi', duong_dan: '/cua-toi/su-co' }],
    ngu_canh: null
  };
};

const taoYeuCauXemPhong = async (cau: string, tt: ReturnType<typeof trichThongTin>, phongId: number | null, ngayHen?: string | null): Promise<Partial<PhanHoi>> => {
  const raw = String(cau).replace(/(\d)[\s.\-](?=\d)/g, '$1');

  const TU_BO = ['tên tôi là', 'tên mình là', 'tên em là', 'tôi tên', 'mình tên', 'em tên', 'tôi là', 'mình là', 'em là', 'họ tên', 'họ và tên',
    'số điện thoại', 'điện thoại', 'sđt', 'sdt', 'tên', 'là', 'của', 'mình', 'tôi', 'em', 'nhé', 'nha', 'ạ', 'phòng\\s*[a-z]?\\d+', '[a-z]\\d{3}', 'đặt lịch', 'xem phòng',
    'chiều nay', 'sáng nay', 'tối nay', 'hôm nay', 'ngày mai', 'cuối tuần', 'thứ \\d', 'chủ nhật', 'phòng\\s*[a-z]?\\d+', 'ngày\\s*[\\d/]*', 'lúc\\s*\\d+\\s*h?'];
  const reBo = new RegExp(`(?<![\\p{L}\\d])(?:${TU_BO.join('|')})(?![\\p{L}\\d])`, 'giu');
  let ten = raw
    .replace(/(?:\+84|84)?0?\d{9,10}/g, ' ')
    .replace(reBo, ' ')

    .replace(/(?<!\p{L})(?:mai|qua|tới|đến|được không|được|không|muốn|xin|cho|ơi|với|vậy|giúp|hẹn|lịch|xem|phòng|anh|chị|ok)(?!\p{L})/gu, ' ')
    .replace(/[^\p{L}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (ten.split(' ').length > 5 || ten.length < 2) ten = '';
  ten = ten.split(' ').map((w) => w.charAt(0).toLocaleUpperCase('vi') + w.slice(1).toLocaleLowerCase('vi')).join(' ');
  const ngay = tt.ngay || ngayHen || null;
  await pool.query(
    `INSERT INTO yeu_cau_xem_phong (ho_ten, so_dien_thoai, phong_id, ngay_hen, ghi_chu, nguon) VALUES (?, ?, ?, ?, ?, 'chatbot')`,
    [ten || 'Khách từ chatbot', tt.sdt, phongId, ngay, `Tin nhắn: ${cau}`.slice(0, 500)]
  );
  return {
    tra_loi: `🎉 Đã ghi nhận lịch xem phòng${ten ? ` cho **${ten}**` : ''} – SĐT **${tt.sdt}**${ngay ? `, ngày **${ngayVN(ngay)}**` : ''}.\nChủ nhà sẽ gọi xác nhận trong thời gian sớm nhất (giờ xem phòng: ${NT.gio_xem_phong}). Cảm ơn bạn!`,
    ngu_canh: null
  };
};

export const duBaoHoaDon = async (taiKhoanId: number) => {
  const d: any = await PortalService.getPhong(taiKhoanId);
  if (!d) return null;
  const [cs]: any = await pool.query(
    `SELECT thang_nam, chi_so_dien_moi - chi_so_dien_cu AS dien, chi_so_nuoc_moi - chi_so_nuoc_cu AS nuoc
     FROM chi_so_dien_nuoc WHERE phong_id = ? ORDER BY thang_nam DESC LIMIT 6`,
    [d.phong.id]
  );
  if (!cs.length) return null;
  const chuoi = [...cs].reverse();
  const duBao = (ys: number[]) => {
    const n = ys.length;
    if (n < 3) return ys.reduce((a, b) => a + b, 0) / n;
    const xs = ys.map((_, i) => i);
    const mx = xs.reduce((a, b) => a + b, 0) / n;
    const my = ys.reduce((a, b) => a + b, 0) / n;
    const b = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0) / xs.reduce((s, x) => s + (x - mx) ** 2, 0);
    return Math.max(0, my + b * (n - mx));
  };
  const dien = Math.round(duBao(chuoi.map((r: any) => Number(r.dien))));
  const nuoc = Math.round(duBao(chuoi.map((r: any) => Number(r.nuoc))));
  const dv: any[] = d.dich_vu;
  const giaDien = Number(dv.find((x) => /điện|dien/i.test(x.ten_dich_vu) && x.loai_dich_vu === 'theo_chi_so')?.don_gia || 0);
  const giaNuoc = Number(dv.find((x) => /nước|nuoc/i.test(x.ten_dich_vu) && x.loai_dich_vu === 'theo_chi_so')?.don_gia || 0);
  const coDinh = dv
    .filter((x) => x.loai_dich_vu === 'co_dinh')
    .reduce((s, x) => s + Number(x.don_gia) * (/người|nguoi/i.test(x.don_vi_tinh) ? d.thanh_vien.length : 1), 0);
  const tienPhong = Number(d.phong.gia_thue);
  return {
    ky: congThang(chuoi[chuoi.length - 1].thang_nam, 1),
    so_phong: d.phong.so_phong,
    so_thang: chuoi.length,
    phuong_phap: chuoi.length >= 3 ? 'hồi quy tuyến tính' : 'trung bình',
    dien, nuoc, gia_dien: giaDien, gia_nuoc: giaNuoc,
    tien_dien: dien * giaDien, tien_nuoc: nuoc * giaNuoc, co_dinh: coDinh, tien_phong: tienPhong,
    tong: tienPhong + dien * giaDien + nuoc * giaNuoc + coDinh
  };
};

const ghiLichSu = async (u: NguoiDung | null, cau: string, yDinh: string, doTinCay: number, daHieu: boolean, traLoi: string) => {
  try {
    await pool.query(
      'INSERT INTO chatbot_lich_su (tai_khoan_id, vai_tro, cau_hoi, y_dinh, do_tin_cay, da_hieu, tra_loi) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [u?.id || null, u?.vai_tro || 'khach', cau.slice(0, 1000), yDinh, doTinCay, daHieu ? 1 : 0, traLoi.slice(0, 2000)]
    );
  } catch {
  }
};

export const hoi = async (cauHoi: string, u: NguoiDung | null, nguCanh?: NguCanh | null): Promise<PhanHoi> => {
  await damBaoHuanLuyen();
  const cau = String(cauHoi || '').trim().slice(0, 500);
  if (!cau) throw new AppError(400, 'Bạn chưa nhập câu hỏi');
  const vaiTro = u?.vai_tro || 'khach';
  const huy = /^(huy|thoi|khong|khong can|bo qua|dung lai)$/.test(chuanHoa(cau));

  if (nguCanh?.cho && huy) {
    const ph: PhanHoi = { tra_loi: 'Đã hủy. Bạn cần mình hỗ trợ gì khác không?', y_dinh: 'huy', do_tin_cay: 1, goi_y: goiYTheoVaiTro(u), ngu_canh: null };
    await ghiLichSu(u, cau, 'huy', 1, true, ph.tra_loi);
    return ph;
  }
  if (nguCanh?.cho === 'mo_ta_su_co' && laNguoiThue(u)) {
    const kq = await taoSuCo(u!, cau);
    const ph: PhanHoi = { tra_loi: kq.tra_loi!, y_dinh: 'bao_su_co', do_tin_cay: 1, goi_y: goiYTheoVaiTro(u), nut: kq.nut, ngu_canh: null };
    await ghiLichSu(u, cau, 'bao_su_co', 1, true, ph.tra_loi);
    return ph;
  }
  if (nguCanh?.cho === 'thong_tin_xem_phong') {
    const tt = trichThongTin(cau);
    if (tt.sdt) {
      const kq = await taoYeuCauXemPhong(cau, tt, nguCanh.phong_id || null, nguCanh.ngay_hen);
      const ph: PhanHoi = { tra_loi: kq.tra_loi!, y_dinh: 'dat_lich_xem', do_tin_cay: 1, goi_y: goiYTheoVaiTro(u), ngu_canh: null };
      await ghiLichSu(u, cau, 'dat_lich_xem', 1, true, ph.tra_loi);
      return ph;
    }
  }

  const loaiTru = LOAI_TRU[vaiTro] || [];
  const ketQua = moHinh.duDoan(cau).filter((k) => !loaiTru.includes(k.nhan));
  const tong = ketQua.reduce((s, k) => s + k.xacSuat, 0) || 1;
  const xepHang = ketQua.map((k) => ({ ...k, xacSuat: k.xacSuat / tong }));
  const top = xepHang[0];
  const phanTich = laQuanLy(u)
    ? xepHang.slice(0, 3).map((k) => ({ y_dinh: k.nhan, ten: TEN_Y_DINH[k.nhan], xac_suat: Math.round(k.xacSuat * 1000) / 10 }))
    : undefined;

  if (!top || moHinh.soTuDaBiet(cau) === 0 || top.xacSuat < NGUONG_HIEU) {
    const goiY = xepHang.slice(0, 3).map((k) => Y_DINH.find((y) => y.ma === k.nhan)!.mau[0]);
    const tra =
      moHinh.soTuDaBiet(cau) === 0
        ? `Xin lỗi, mình chưa hiểu câu hỏi này 😅. Bạn thử hỏi cách khác, hoặc liên hệ chủ nhà ${NT.so_dien_thoai} nhé.`
        : `Mình chưa chắc ý bạn lắm 🤔. Có phải bạn muốn hỏi một trong các câu dưới đây không?`;
    await ghiLichSu(u, cau, top?.nhan || 'khong_ro', top?.xacSuat || 0, false, tra);
    return {
      tra_loi: tra,
      y_dinh: 'khong_ro',
      do_tin_cay: Math.round((top?.xacSuat || 0) * 1000) / 1000,
      goi_y: moHinh.soTuDaBiet(cau) === 0 ? goiYTheoVaiTro(u) : [...new Set(goiY.map((g) => g.charAt(0).toUpperCase() + g.slice(1) + '?'))],
      phan_tich: phanTich,
      ngu_canh: null
    };
  }

  const tt = trichThongTin(cau);
  const kq = await XU_LY[top.nhan](u, cau, tt);
  const ph: PhanHoi = {
    tra_loi: kq.tra_loi || '',
    y_dinh: top.nhan,
    do_tin_cay: Math.round(top.xacSuat * 1000) / 1000,
    goi_y: kq.goi_y || goiYTheoVaiTro(u),
    the: kq.the,
    nut: kq.nut,
    ngu_canh: kq.ngu_canh === undefined ? null : kq.ngu_canh,
    phan_tich: phanTich
  };
  await ghiLichSu(u, cau, top.nhan, top.xacSuat, true, ph.tra_loi);
  return ph;
};

export const ChatbotQuanLy = {
  async thongKe() {
    await damBaoHuanLuyen();
    const [[tong]]: any = await pool.query(
      `SELECT COUNT(*) AS tong, COALESCE(SUM(da_hieu), 0) AS hieu, COUNT(DISTINCT DATE(ngay_tao)) AS so_ngay,
              SUM(da_hieu = 0 AND da_xu_ly = 0) AS chua_xu_ly FROM chatbot_lich_su`
    );
    const [theoVaiTro]: any = await pool.query('SELECT vai_tro, COUNT(*) AS so FROM chatbot_lich_su GROUP BY vai_tro');
    const [theoYDinh]: any = await pool.query(
      `SELECT y_dinh, COUNT(*) AS so FROM chatbot_lich_su WHERE da_hieu = 1 GROUP BY y_dinh ORDER BY so DESC LIMIT 8`
    );
    const [theoNgay]: any = await pool.query(
      `SELECT DATE_FORMAT(ngay_tao, '%Y-%m-%d') AS ngay, COUNT(*) AS so, SUM(da_hieu) AS hieu
       FROM chatbot_lich_su WHERE ngay_tao >= DATE_SUB(CURDATE(), INTERVAL 13 DAY) GROUP BY ngay ORDER BY ngay`
    );
    const mh = moHinh.thongKe();
    return {
      tong_cau_hoi: Number(tong.tong),
      so_cau_hieu: Number(tong.hieu),
      ty_le_hieu: Number(tong.tong) ? Math.round((Number(tong.hieu) / Number(tong.tong)) * 1000) / 10 : 0,
      cau_chua_xu_ly: Number(tong.chua_xu_ly || 0),
      theo_vai_tro: theoVaiTro,
      theo_y_dinh: theoYDinh.map((r: any) => ({ ...r, ten: TEN_Y_DINH[r.y_dinh] || r.y_dinh })),
      theo_ngay: theoNgay.map((r: any) => ({ ...r, so: Number(r.so), hieu: Number(r.hieu) })),
      mo_hinh: { so_y_dinh: mh.so_nhan, so_mau_he_thong: soMauHeThong, so_mau_quan_ly: soMauQuanLy, so_dac_trung: mh.so_dac_trung, nguong: NGUONG_HIEU }
    };
  },

  async lichSu(chiChuaHieu: boolean, limit: number, offset: number) {
    const where = chiChuaHieu ? 'WHERE l.da_hieu = 0 AND l.da_xu_ly = 0' : '';
    const [rows]: any = await pool.query(
      `SELECT l.*, tk.ten_dang_nhap FROM chatbot_lich_su l LEFT JOIN tai_khoan tk ON l.tai_khoan_id = tk.id
       ${where} ORDER BY l.id DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    const [[c]]: any = await pool.query(`SELECT COUNT(*) AS total FROM chatbot_lich_su l ${where}`);
    return { data: rows.map((r: any) => ({ ...r, ten_y_dinh: TEN_Y_DINH[r.y_dinh] || r.y_dinh })), total: Number(c.total) };
  },

  dsYDinh() {
    const tk = moHinh.thongKe().mau_theo_nhan as Record<string, number>;
    return Y_DINH.map((y) => ({ ma: y.ma, ten: y.ten, so_mau: tk[y.ma] || 0, vi_du: y.mau.slice(0, 3) }));
  },

  async dsMauCau() {
    const [rows] = await pool.query('SELECT * FROM chatbot_mau_cau ORDER BY id DESC');
    return (rows as any[]).map((r) => ({ ...r, ten_y_dinh: TEN_Y_DINH[r.y_dinh] || r.y_dinh }));
  },

  async themMauCau(yDinh: string, cauMau: string, lichSuId?: number) {
    if (!TEN_Y_DINH[yDinh]) throw new AppError(400, 'Ý định không hợp lệ');
    const cau = String(cauMau || '').trim();
    if (cau.length < 2) throw new AppError(400, 'Câu mẫu quá ngắn');
    const [r]: any = await pool.query('INSERT INTO chatbot_mau_cau (y_dinh, cau_mau) VALUES (?, ?)', [yDinh, cau.slice(0, 255)]);
    if (lichSuId) await pool.query('UPDATE chatbot_lich_su SET da_xu_ly = 1 WHERE id = ?', [lichSuId]);
    await huanLuyenLai();
    return r.insertId;
  },

  async boQua(lichSuId: number) {
    await pool.query('UPDATE chatbot_lich_su SET da_xu_ly = 1 WHERE id = ?', [lichSuId]);
  },

  async xoaMauCau(id: number) {
    await pool.query('DELETE FROM chatbot_mau_cau WHERE id = ?', [id]);
    await huanLuyenLai();
  }
};
