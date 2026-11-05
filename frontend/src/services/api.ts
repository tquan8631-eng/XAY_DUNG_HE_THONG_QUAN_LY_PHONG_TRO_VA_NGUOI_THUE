import axios, { AxiosResponse } from 'axios';
import { AuthUser, LoginPayload } from '../types';

export const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      if (!url.includes('/auth/dang-nhap') && !url.includes('/auth/doi-mat-khau') && !url.includes('/public/') && !url.includes('/chatbot/hoi')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/dang-nhap') window.location.href = '/dang-nhap';
      }
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (error: any, fallback = 'Có lỗi xảy ra') =>
  error?.response?.data?.message || error?.message || fallback;

export interface ListResult<T = any> {
  data: T[];
  total: number;
  totalPages: number;
  [key: string]: any;
}

export interface ApiBody<T = any> {
  success: boolean;
  data: T;
  message?: string;
  [key: string]: any;
}

const body = <T = any>(p: Promise<AxiosResponse<ApiBody<T>>>) => p.then((r) => r.data);

const data = <T = any>(p: Promise<AxiosResponse<ApiBody<T>>>) => p.then((r) => r.data.data);

const list = <T = any>(p: Promise<AxiosResponse<any>>, limit = 20): Promise<ListResult<T>> =>
  p.then((r) => {
    const b = r.data || {};
    const nested = b.data && !Array.isArray(b.data) && Array.isArray(b.data.data);
    const rows: T[] = Array.isArray(b.data) ? b.data : nested ? b.data.data : [];
    const total = Number(nested ? b.data.total : b.total ?? rows.length) || 0;
    const totalPages = Number(b.totalPages) || Math.max(Math.ceil(total / (limit || 20)), 1);
    const { data: _d, success: _s, ...rest } = b;
    return { ...rest, data: rows, total, totalPages };
  });

export const authApi = {
  login: (payload: LoginPayload) => body<{ token: string; user: AuthUser }>(apiClient.post('/auth/dang-nhap', payload)),
  logout: () => body(apiClient.post('/auth/dang-xuat')),
  getMe: () => data<AuthUser>(apiClient.get('/auth/me')),
  changePassword: (payload: { mat_khau_cu: string; mat_khau_moi: string }) => body(apiClient.put('/auth/doi-mat-khau', payload))
};

export const phongTroApi = {
  getAll: (params?: any) => list(apiClient.get('/phong-tro', { params }), params?.limit),
  getById: (id: number) => data(apiClient.get(`/phong-tro/${id}`)),
  create: (payload: any) => body(apiClient.post('/phong-tro', payload)),
  update: (id: number, payload: any) => body(apiClient.put(`/phong-tro/${id}`, payload)),
  delete: (id: number) => body(apiClient.delete(`/phong-tro/${id}`))
};

export const nguoiThueApi = {
  getAll: (params?: any) => list(apiClient.get('/nguoi-thue', { params }), params?.limit),
  getById: (id: number) => data(apiClient.get(`/nguoi-thue/${id}`)),
  create: (payload: any) => body(apiClient.post('/nguoi-thue', payload)),
  update: (id: number, payload: any) => body(apiClient.put(`/nguoi-thue/${id}`, payload)),
  delete: (id: number) => body(apiClient.delete(`/nguoi-thue/${id}`)),
  taoTaiKhoan: (id: number, payload: { ten_dang_nhap?: string; mat_khau?: string }) =>
    body(apiClient.post(`/nguoi-thue/${id}/tai-khoan`, payload)),
  xoaTaiKhoan: (id: number) => body(apiClient.delete(`/nguoi-thue/${id}/tai-khoan`))
};

export const thanhVienPhongApi = {
  getAll: (params?: any) => data<any[]>(apiClient.get('/thanh-vien-phong', { params })),
  create: (payload: any) => body(apiClient.post('/thanh-vien-phong', payload)),
  delete: (id: number) => body(apiClient.delete(`/thanh-vien-phong/${id}`))
};

export const hopDongApi = {
  getAll: (params?: any) => list(apiClient.get('/hop-dong', { params }), params?.limit),
  getById: (id: number) => data(apiClient.get(`/hop-dong/${id}`)),
  create: (payload: any) => body(apiClient.post('/hop-dong', payload)),
  update: (id: number, payload: any) => body(apiClient.put(`/hop-dong/${id}`, payload)),
  delete: (id: number) => body(apiClient.delete(`/hop-dong/${id}`))
};

export const chiSoDienNuocApi = {
  getAll: (params?: any) => list(apiClient.get('/chi-so-dien-nuoc', { params }), params?.limit),
  getChiSoCu: (phong_id: number, thang_nam: string) =>
    data<{ chi_so_dien_cu: number; chi_so_nuoc_cu: number; tu_ky: string | null }>(
      apiClient.get('/chi-so-dien-nuoc/chi-so-cu', { params: { phong_id, thang_nam } })
    ),
  create: (payload: any) => body(apiClient.post('/chi-so-dien-nuoc', payload)),
  update: (id: number, payload: any) => body(apiClient.put(`/chi-so-dien-nuoc/${id}`, payload)),
  delete: (id: number) => body(apiClient.delete(`/chi-so-dien-nuoc/${id}`))
};

export const dichVuApi = {
  getAll: () => data<any[]>(apiClient.get('/dich-vu')),
  create: (payload: any) => body(apiClient.post('/dich-vu', payload)),
  update: (id: number, payload: any) => body(apiClient.put(`/dich-vu/${id}`, payload)),
  delete: (id: number) => body(apiClient.delete(`/dich-vu/${id}`)),
  getDichVuPhong: (phongId: number) => data<any[]>(apiClient.get(`/dich-vu/phong/${phongId}`)),
  addDichVuPhong: (payload: { phong_id?: number; dich_vu_id: number; tat_ca_phong?: boolean }) =>
    body(apiClient.post('/dich-vu/phong', payload)),
  removeDichVuPhong: (phongId: number, dichVuId: number) => body(apiClient.delete(`/dich-vu/phong/${phongId}/${dichVuId}`))
};

export const hoaDonApi = {
  getAll: (params?: any) => list(apiClient.get('/hoa-don', { params }), params?.limit),
  getById: (id: number) => data(apiClient.get(`/hoa-don/${id}`)),
  createTuDong: (payload: { hop_dong_id: number; thang_nam: string; han_thanhtoan?: string }) =>
    body(apiClient.post('/hoa-don/tao-tu-dong', payload)),
  createHangLoat: (payload: { thang_nam: string; han_thanhtoan?: string }) =>
    body<{ thanh_cong: any[]; loi: any[] }>(apiClient.post('/hoa-don/tao-hang-loat', payload)),
  update: (id: number, payload: any) => body(apiClient.put(`/hoa-don/${id}`, payload)),
  delete: (id: number) => body(apiClient.delete(`/hoa-don/${id}`))
};

export const thanhToanApi = {
  getAll: (params?: any) => list(apiClient.get('/thanh-toan', { params }), params?.limit),
  create: (payload: any) => body(apiClient.post('/thanh-toan', payload))
};

export const suCoApi = {
  getAll: (params?: any) => list(apiClient.get('/su-co', { params }), params?.limit),
  getById: (id: number) => data(apiClient.get(`/su-co/${id}`)),
  create: (payload: any) => body(apiClient.post('/su-co', payload)),
  update: (id: number, payload: any) => body(apiClient.put(`/su-co/${id}`, payload)),
  delete: (id: number) => body(apiClient.delete(`/su-co/${id}`))
};

export const taiKhoanApi = {
  getAll: (params?: any) => list(apiClient.get('/tai-khoan', { params }), params?.limit),
  create: (payload: any) => body(apiClient.post('/tai-khoan', payload)),
  update: (id: number, payload: any) => body(apiClient.put(`/tai-khoan/${id}`, payload)),
  delete: (id: number) => body(apiClient.delete(`/tai-khoan/${id}`))
};

export const dashboardApi = {
  getThongKe: () => data(apiClient.get('/dashboard/thong-ke')),
  getDoanhThu: (year?: number) => data<any[]>(apiClient.get('/dashboard/doanh-thu', { params: { year } })),
  getHoaDonChuaTT: () => data<any[]>(apiClient.get('/dashboard/hoa-don-chua-tt')),
  getHopDongSapHet: () => data<any[]>(apiClient.get('/dashboard/hop-dong-sap-het')),
  getSuCoMoi: () => data<any[]>(apiClient.get('/dashboard/su-co-moi'))
};

export const portalApi = {
  tongQuan: () => data(apiClient.get('/portal/tong-quan')),
  getThongTin: () => data(apiClient.get('/portal/thong-tin')),
  updateThongTin: (payload: any) => body(apiClient.put('/portal/thong-tin', payload)),
  getPhong: () => data(apiClient.get('/portal/phong')),
  getHopDong: () => data<any[]>(apiClient.get('/portal/hop-dong')),
  getHoaDon: (trang_thai?: string) => data<any[]>(apiClient.get('/portal/hoa-don', { params: { trang_thai } })),
  getHoaDonById: (id: number) => data(apiClient.get(`/portal/hoa-don/${id}`)),
  getThanhToan: () => data<any[]>(apiClient.get('/portal/thanh-toan')),
  getChiSo: () => data<any[]>(apiClient.get('/portal/chi-so-dien-nuoc')),
  getSuCo: () => data<any[]>(apiClient.get('/portal/su-co')),
  createSuCo: (payload: any) => body(apiClient.post('/portal/su-co', payload)),
  huySuCo: (id: number) => body(apiClient.delete(`/portal/su-co/${id}`)),
  getQuangCao: () => data<any[]>(apiClient.get('/portal/uu-dai'))
};

export interface ChatPhanHoi {
  tra_loi: string;
  y_dinh: string;
  do_tin_cay: number;
  goi_y: string[];
  the?: { loai: 'phong' | 'quang_cao' | 'hoa_don'; du_lieu: any[] } | null;
  nut?: { nhan: string; duong_dan: string }[];
  ngu_canh?: any;
  phan_tich?: { y_dinh: string; ten: string; xac_suat: number }[];
}

export const chatbotApi = {
  hoi: (cau_hoi: string, ngu_canh?: any) => data<ChatPhanHoi>(apiClient.post('/chatbot/hoi', { cau_hoi, ngu_canh })),
  goiY: () => data<string[]>(apiClient.get('/chatbot/goi-y')),
  thongKe: () => data(apiClient.get('/chatbot/thong-ke')),
  lichSu: (params?: any) => list(apiClient.get('/chatbot/lich-su', { params }), params?.limit),
  boQua: (id: number) => body(apiClient.post(`/chatbot/lich-su/${id}/bo-qua`)),
  dsYDinh: () => data<any[]>(apiClient.get('/chatbot/y-dinh')),
  dsMauCau: () => data<any[]>(apiClient.get('/chatbot/mau-cau')),
  themMauCau: (payload: { y_dinh: string; cau_mau: string; lich_su_id?: number }) => body(apiClient.post('/chatbot/mau-cau', payload)),
  xoaMauCau: (id: number) => body(apiClient.delete(`/chatbot/mau-cau/${id}`))
};

export const publicApi = {
  thongTin: () => data(apiClient.get('/public/thong-tin')),
  phongTrong: () => data(apiClient.get('/public/phong-trong')),
  quangCao: () => data<any[]>(apiClient.get('/public/uu-dai')),
  xemQuangCao: (id: number) => body(apiClient.post(`/public/uu-dai/${id}/xem`)),
  dangKyXemPhong: (payload: any) => body(apiClient.post('/public/dang-ky-xem-phong', payload))
};

export const quangCaoApi = {
  getAll: (params?: any) => list(apiClient.get('/uu-dai', { params })),
  create: (payload: any) => body(apiClient.post('/uu-dai', payload)),
  update: (id: number, payload: any) => body(apiClient.put(`/uu-dai/${id}`, payload)),
  delete: (id: number) => body(apiClient.delete(`/uu-dai/${id}`))
};

export const yeuCauXemPhongApi = {
  getAll: (params?: any) => list(apiClient.get('/yeu-cau-xem-phong', { params })),
  update: (id: number, payload: any) => body(apiClient.put(`/yeu-cau-xem-phong/${id}`, payload)),
  delete: (id: number) => body(apiClient.delete(`/yeu-cau-xem-phong/${id}`))
};

const api = {
  auth: authApi,
  phongTro: phongTroApi,
  nguoiThue: nguoiThueApi,
  thanhVienPhong: thanhVienPhongApi,
  hopDong: hopDongApi,
  chiSoDienNuoc: chiSoDienNuocApi,
  dichVu: dichVuApi,
  hoaDon: hoaDonApi,
  thanhToan: thanhToanApi,
  suCo: suCoApi,
  taiKhoan: taiKhoanApi,
  dashboard: dashboardApi,
  portal: portalApi,
  chatbot: chatbotApi,
  public: publicApi,
  quangCao: quangCaoApi,
  yeuCauXemPhong: yeuCauXemPhongApi
};

export default api;
