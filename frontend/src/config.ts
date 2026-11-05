export const TEN_HE_THONG = 'Hệ thống Quản lý Nhà trọ tích hợp Chatbox hỗ trợ 24/7';
export const TEN_NGAN = 'Nhà trọ 24/7';

export interface ThongTinNhaTro {
  ten_nha_tro: string;
  slogan?: string;
  dia_chi: string;
  so_dien_thoai: string;
  zalo?: string;
  email?: string;
  gio_xem_phong?: string;
  ngan_hang: string;
  ma_ngan_hang: string;
  so_tai_khoan: string;
  chu_tai_khoan: string;
  tien_coc?: string;
  thoi_han_toi_thieu?: string;
  giay_to?: string[];
  noi_quy?: string[];
  tien_ich?: string[];
}

export const THONG_TIN_CHU_NHA: ThongTinNhaTro = {
  ten_nha_tro: 'Nhà trọ An Bình',
  dia_chi: '123 Đường ABC, Phường XYZ, TP. Hồ Chí Minh',
  so_dien_thoai: '0900 000 000',
  ngan_hang: 'Vietcombank',
  ma_ngan_hang: 'VCB',
  so_tai_khoan: '',
  chu_tai_khoan: 'NGUYEN VAN CHU NHA'
};
