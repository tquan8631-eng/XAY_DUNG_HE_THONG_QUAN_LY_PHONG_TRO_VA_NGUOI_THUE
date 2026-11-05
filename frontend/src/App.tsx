import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { useAuth } from './hooks/useAuth';
import { homePathFor } from './contexts/AuthContext';
import MainLayout from './components/layout/MainLayout';
import LoadingSpinner from './components/common/LoadingSpinner';

import DangNhap from './pages/DangNhap';
import DoiMatKhau from './pages/DoiMatKhau';
import GioiThieu from './pages/GioiThieu';

import Dashboard from './pages/Dashboard';
import DanhSachPhong from './pages/PhongTro/DanhSachPhong';
import ChiTietPhong from './pages/PhongTro/ChiTietPhong';
import DanhSachNguoiThue from './pages/NguoiThue/DanhSachNguoiThue';
import ChiTietNguoiThue from './pages/NguoiThue/ChiTietNguoiThue';
import DanhSachHopDong from './pages/HopDong/DanhSachHopDong';
import ChiTietHopDong from './pages/HopDong/ChiTietHopDong';
import DanhSachChiSo from './pages/DienNuoc/DanhSachChiSo';
import DanhSachDichVu from './pages/DichVu/DanhSachDichVu';
import DanhSachHoaDon from './pages/HoaDon/DanhSachHoaDon';
import ChiTietHoaDon from './pages/HoaDon/ChiTietHoaDon';
import LichSuThanhToan from './pages/ThanhToan/LichSuThanhToan';
import DanhSachSuCo from './pages/SuCo/DanhSachSuCo';
import QuanLyTaiKhoan from './pages/TaiKhoan/QuanLyTaiKhoan';
import QuanLyChatbot from './pages/Chatbot/QuanLyChatbot';
import QuanLyUuDai from './pages/UuDai/QuanLyUuDai';
import DanhSachKhachXemPhong from './pages/KhachXemPhong/DanhSachKhachXemPhong';

import TongQuanNguoiThue from './pages/NguoiThuePortal/TongQuan';
import PhongCuaToi from './pages/NguoiThuePortal/PhongCuaToi';
import HopDongCuaToi from './pages/NguoiThuePortal/HopDongCuaToi';
import HoaDonCuaToi from './pages/NguoiThuePortal/HoaDonCuaToi';
import ChiTietHoaDonCuaToi from './pages/NguoiThuePortal/ChiTietHoaDonCuaToi';
import ThanhToanCuaToi from './pages/NguoiThuePortal/ThanhToanCuaToi';
import DienNuocCuaToi from './pages/NguoiThuePortal/DienNuocCuaToi';
import SuCoCuaToi from './pages/NguoiThuePortal/SuCoCuaToi';
import ThongTinCaNhan from './pages/NguoiThuePortal/ThongTinCaNhan';

const RoleRoute: React.FC<{ roles: string[]; children: React.ReactNode; guestTo?: string }> = ({ roles, children, guestTo = '/dang-nhap' }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner text="Đang tải..." />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to={guestTo} replace />;
  if (!roles.includes(user!.vai_tro)) return <Navigate to={homePathFor(user)} replace />;
  return <>{children}</>;
};

const QUAN_LY = ['chu_nha', 'nhan_vien'];

const App: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <>
      <Toaster position="top-right" />
      <Routes>

        <Route path="/gioi-thieu" element={<GioiThieu />} />

        <Route
          path="/dang-nhap"
          element={isAuthenticated ? <Navigate to={homePathFor(user)} replace /> : <DangNhap />}
        />

        <Route
          path="/cua-toi"
          element={
            <RoleRoute roles={['nguoi_thue']}>
              <MainLayout />
            </RoleRoute>
          }
        >
          <Route index element={<TongQuanNguoiThue />} />
          <Route path="phong" element={<PhongCuaToi />} />
          <Route path="hop-dong" element={<HopDongCuaToi />} />
          <Route path="hoa-don" element={<HoaDonCuaToi />} />
          <Route path="hoa-don/:id" element={<ChiTietHoaDonCuaToi />} />
          <Route path="thanh-toan" element={<ThanhToanCuaToi />} />
          <Route path="dien-nuoc" element={<DienNuocCuaToi />} />
          <Route path="su-co" element={<SuCoCuaToi />} />
          <Route path="tai-khoan" element={<ThongTinCaNhan />} />
          <Route path="*" element={<Navigate to="/cua-toi" replace />} />
        </Route>

        <Route
          path="/"
          element={
            <RoleRoute roles={QUAN_LY} guestTo="/gioi-thieu">
              <MainLayout />
            </RoleRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="phong-tro" element={<DanhSachPhong />} />
          <Route path="phong-tro/:id" element={<ChiTietPhong />} />
          <Route path="nguoi-thue" element={<DanhSachNguoiThue />} />
          <Route path="nguoi-thue/:id" element={<ChiTietNguoiThue />} />
          <Route path="hop-dong" element={<DanhSachHopDong />} />
          <Route path="hop-dong/:id" element={<ChiTietHopDong />} />
          <Route path="dien-nuoc" element={<DanhSachChiSo />} />
          <Route path="dich-vu" element={<DanhSachDichVu />} />
          <Route path="hoa-don" element={<DanhSachHoaDon />} />
          <Route path="hoa-don/:id" element={<ChiTietHoaDon />} />
          <Route path="thanh-toan" element={<LichSuThanhToan />} />
          <Route path="su-co" element={<DanhSachSuCo />} />
          <Route path="khach-xem-phong" element={<DanhSachKhachXemPhong />} />
          <Route path="uu-dai" element={<QuanLyUuDai />} />
          <Route path="chatbot" element={<QuanLyChatbot />} />
          <Route
            path="tai-khoan"
            element={
              <RoleRoute roles={['chu_nha']}>
                <QuanLyTaiKhoan />
              </RoleRoute>
            }
          />
          <Route path="doi-mat-khau" element={<DoiMatKhau />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
