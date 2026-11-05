export interface TaiKhoan {
  id: number;
  ten_dang_nhap: string;
  vai_tro: 'chu_nha' | 'nhan_vien' | 'nguoi_thue';
  trang_thai: 'hoat_dong' | 'khoa';
  lan_dang_nhap_cuoi: string | null;
  ngay_tao: string;
}

export interface NguoiThue {
  id: number;
  tai_khoan_id: number | null;
  ho_ten: string;
  so_dien_thoai: string;
  email: string | null;
  can_cuoc_cong_dan: string;
  gioi_tinh: 'nam' | 'nu' | 'khac';
  ngay_sinh: string | null;
  que_quan: string | null;
  anh_cccd_mat_truoc: string | null;
  anh_cccd_mat_sau: string | null;
  da_dang_ky_tam_tru: boolean;
  trang_thai: 'dang_thue' | 'da_chuyen_di';
  ngay_tao: string;

  so_phong?: string;
  phong_id?: number;
}

export interface PhongTro {
  id: number;
  so_phong: string;
  tang: number;
  gia_thue: number;
  dien_tich: number | null;
  so_nguoi_toi_da: number;
  trang_thai: 'trong' | 'da_thue' | 'dang_bao_tri' | 'da_coc';
  mo_ta: string | null;
  ngay_tao: string;

  so_nguoi_hien_tai?: number;
}

export interface HopDong {
  id: number;
  ma_hop_dong: string;
  phong_id: number;
  chu_hop_dong_id: number;
  ngay_bat_dau: string;
  ngay_ket_thuc: string;
  tien_coc: number;
  trang_thai_tien_coc:
    | 'dang_giu'
    | 'da_hoan_tra'
    | 'da_khau_tru';
  ngay_chot_tien_hang_thang: number;
  trang_thai: 'con_han' | 'het_han' | 'da_huy';
  ngay_tao: string;

  so_phong?: string;
  ho_ten?: string;
  so_ngay_con_lai?: number;
}

export interface ThanhVienPhong {
  id: number;
  hop_dong_id: number;
  nguoi_thue_id: number;
  la_chu_hop_dong: boolean;
  ngay_vao_o: string;

  ho_ten?: string;
  so_dien_thoai?: string;
  so_phong?: string;
  ma_hop_dong?: string;
}

export interface ChiSoDienNuoc {
  id: number;
  phong_id: number;
  thang_nam: string;
  chi_so_dien_cu: number;
  chi_so_dien_moi: number;
  chi_so_nuoc_cu: number;
  chi_so_nuoc_moi: number;
  ngay_ghi: string;

  dien_tieu_thu?: number;
  nuoc_tieu_thu?: number;

  so_phong?: string;
}

export interface DichVu {
  id: number;
  ten_dich_vu: string;
  don_gia: number;
  don_vi_tinh: string;
  loai_dich_vu: 'theo_chi_so' | 'co_dinh';
}

export interface DichVuPhong {
  phong_id: number;
  dich_vu_id: number;
  ten_dich_vu?: string;
  don_gia?: number;
  don_vi_tinh?: string;
  loai_dich_vu?: string;
}

export interface HoaDon {
  id: number;
  ma_hoa_don: string;
  hop_dong_id: number;
  thang_nam: string;
  tien_phong: number;
  tong_tien: number;
  so_tien_da_tra: number;
  trang_thai:
    | 'chua_thanhtoan'
    | 'thanhtoan_motphan'
    | 'da_thanhtoan'
    | 'qua_han';
  han_thanhtoan: string;
  ngay_tao: string;

  so_phong?: string;
  ho_ten?: string;
  ma_hop_dong?: string;
  chi_tiet?: ChiTietHoaDon[];
}

export interface ChiTietHoaDon {
  id: number;
  hoa_don_id: number;
  ten_dich_vu: string;
  don_gia: number;
  so_luong: number;
  thanh_tien: number;
}

export interface NhatKyThanhToan {
  id: number;
  hoa_don_id: number;
  so_tien: number;
  phuong_thuc:
    | 'tien_mat'
    | 'chuyen_khoan'
    | 'momo'
    | 'vnpay';
  ma_giao_dich: string | null;
  ghi_chu: string | null;
  ngay_thanh_toan: string;

  ma_hoa_don?: string;
  so_phong?: string;
  ho_ten?: string;
}

export interface SuCo {
  id: number;
  phong_id: number;
  nguoi_bao_id: number;
  tieu_de: string;
  mo_ta: string | null;
  hinh_anh: string | null;
  muc_do_uu_tien:
    | 'thap'
    | 'trung_binh'
    | 'cao'
    | 'khan_cap';
  trang_thai:
    | 'cho_xuly'
    | 'dang_xuly'
    | 'da_xuly'
    | 'tu_choy';
  ngay_tao: string;

  so_phong?: string;
  ho_ten?: string;
}

export interface ThongKe {
  tong_phong: number;
  phong_da_thue: number;
  phong_trong: number;
  phong_bao_tri: number;
  phong_da_coc: number;
  tong_nguoi_thue: number;
  hop_dong_con_han: number;
  hop_dong_sap_het: number;
  hoa_don_chua_tt: number;
  tong_doanh_thu: number;
}

export interface DoanhThu {
  thang: string;
  doanh_thu: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface LoginPayload {
  ten_dang_nhap: string;
  mat_khau: string;
}

export type VaiTro = 'chu_nha' | 'nhan_vien' | 'nguoi_thue';

export interface AuthUser {
  id: number;
  ten_dang_nhap: string;
  vai_tro: VaiTro;
  nguoi_thue_id?: number | null;
  ho_ten?: string | null;
}
