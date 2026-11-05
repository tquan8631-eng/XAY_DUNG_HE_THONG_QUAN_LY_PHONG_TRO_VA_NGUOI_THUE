import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft, KeyRound, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../services/api';
import { formatDate, formatCurrency, gioiTinh, trangThaiNguoiThue, trangThaiHopDong } from '../../utils/formatters';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Card, InfoRow, btn } from '../../components/common/ui';
import { CapTaiKhoanModal, ThongTinDangNhapModal } from './DanhSachNguoiThue';
import { useAuth } from '../../hooks/useAuth';

const ChiTietNguoiThue: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [nguoiThue, setNguoiThue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [capTaiKhoan, setCapTaiKhoan] = useState<any>(null);
  const [thongTinDangNhap, setThongTinDangNhap] = useState<any>(null);
  const [confirmXoaTk, setConfirmXoaTk] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setNguoiThue(await api.nguoiThue.getById(Number(id)));
    } catch (error) {
      toast.error(getErrorMessage(error, 'Lỗi khi tải thông tin người thuê'));
      navigate('/nguoi-thue');
    } finally {
      setLoading(false);
    }
  };

  const toggleKhoa = async () => {
    try {
      const khoa = nguoiThue.trang_thai_tai_khoan !== 'khoa';
      await api.taiKhoan.update(nguoiThue.tai_khoan_id, { trang_thai: khoa ? 'khoa' : 'hoat_dong' });
      toast.success(khoa ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản');
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const xoaTaiKhoan = async () => {
    try {
      await api.nguoiThue.xoaTaiKhoan(Number(id));
      toast.success('Đã xóa tài khoản đăng nhập');
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setConfirmXoaTk(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner /></div>;
  if (!nguoiThue) return null;

  const st = trangThaiNguoiThue(nguoiThue.trang_thai);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <button onClick={() => navigate('/nguoi-thue')} className="flex items-center hover:text-indigo-600">
          <ArrowLeft className="w-4 h-4 mr-1" /> Người thuê
        </button>
        <ChevronRight className="w-4 h-4" />
        <span className="font-medium text-gray-900">{nguoiThue.ho_ten}</span>
      </div>

      <div className="flex flex-col justify-between gap-4 p-6 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex-row sm:items-start">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-gray-900">{nguoiThue.ho_ten}</h1>
          <p className="text-gray-500">
            {nguoiThue.so_dien_thoai} • {nguoiThue.email || 'Chưa cập nhật email'}
          </p>
          {nguoiThue.so_phong && <p className="mt-1 text-sm text-indigo-600">Đang ở phòng: {nguoiThue.so_phong}</p>}
        </div>
        <Badge text={st.label} color={st.color} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Thông tin cá nhân" className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <div>
              <InfoRow label="Giới tính" value={gioiTinh(nguoiThue.gioi_tinh)} />
              <InfoRow label="Ngày sinh" value={formatDate(nguoiThue.ngay_sinh) || '-'} />
              <InfoRow label="CCCD" value={nguoiThue.can_cuoc_cong_dan} />
            </div>
            <div>
              <InfoRow label="Quê quán" value={nguoiThue.que_quan || '-'} />
              <InfoRow label="Tạm trú" value={nguoiThue.da_dang_ky_tam_tru ? '✅ Đã đăng ký' : '⚠️ Chưa đăng ký'} />
              <InfoRow label="Ngày tạo hồ sơ" value={formatDate(nguoiThue.ngay_tao)} />
            </div>
          </div>
        </Card>

        <Card title="Tài khoản đăng nhập">
          {nguoiThue.tai_khoan_id ? (
            <div className="space-y-4">
              <InfoRow label="Tên đăng nhập" value={nguoiThue.ten_dang_nhap} />
              <InfoRow
                label="Trạng thái"
                value={
                  <Badge
                    text={nguoiThue.trang_thai_tai_khoan === 'khoa' ? 'Đã khóa' : 'Hoạt động'}
                    color={nguoiThue.trang_thai_tai_khoan === 'khoa' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}
                  />
                }
              />
              <div className="flex flex-wrap gap-2">
                <button className={btn.secondary} onClick={() => setCapTaiKhoan(nguoiThue)}>
                  <KeyRound size={16} /> Đặt lại mật khẩu
                </button>
                {user?.vai_tro === 'chu_nha' && (
                  <button className={btn.secondary} onClick={toggleKhoa}>
                    {nguoiThue.trang_thai_tai_khoan === 'khoa' ? 'Mở khóa' : 'Khóa'}
                  </button>
                )}
                {user?.vai_tro === 'chu_nha' && (
                  <button className={`${btn.secondary} text-red-600`} onClick={() => setConfirmXoaTk(true)}>
                    <UserX size={16} /> Xóa TK
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-sm text-gray-600">
              <p>Người thuê này chưa có tài khoản để đăng nhập cổng người thuê.</p>
              <button className={btn.primary} onClick={() => setCapTaiKhoan(nguoiThue)}>
                <KeyRound size={16} /> Cấp tài khoản
              </button>
            </div>
          )}
        </Card>
      </div>

      <Card title="Lịch sử thuê phòng">
        {nguoiThue.hop_dong?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-600 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Mã HĐ</th>
                  <th className="px-4 py-3 text-left">Phòng</th>
                  <th className="px-4 py-3 text-left">Vai trò</th>
                  <th className="px-4 py-3 text-left">Thời hạn</th>
                  <th className="px-4 py-3 text-left">Giá thuê</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {nguoiThue.hop_dong.map((hd: any) => {
                  const s = trangThaiHopDong(hd.trang_thai);
                  return (
                    <tr key={hd.id} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/hop-dong/${hd.id}`)}>
                      <td className="px-4 py-3 font-medium text-indigo-600">{hd.ma_hop_dong}</td>
                      <td className="px-4 py-3">{hd.so_phong}</td>
                      <td className="px-4 py-3">{hd.la_chu_hop_dong ? 'Đứng tên' : 'Ở ghép'}</td>
                      <td className="px-4 py-3">
                        {formatDate(hd.ngay_bat_dau)} → {formatDate(hd.ngay_ket_thuc)}
                      </td>
                      <td className="px-4 py-3">{formatCurrency(hd.gia_thue)}</td>
                      <td className="px-4 py-3"><Badge text={s.label} color={s.color} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-6 text-center text-gray-500">Chưa có hợp đồng nào</p>
        )}
      </Card>

      <CapTaiKhoanModal
        nguoiThue={capTaiKhoan}
        onClose={() => setCapTaiKhoan(null)}
        onDone={(info) => {
          setCapTaiKhoan(null);
          setThongTinDangNhap(info);
          fetchData();
        }}
      />
      <ThongTinDangNhapModal info={thongTinDangNhap} onClose={() => setThongTinDangNhap(null)} />
      <ConfirmDialog
        isOpen={confirmXoaTk}
        title="Xóa tài khoản đăng nhập"
        message="Người thuê sẽ không thể đăng nhập nữa. Hồ sơ người thuê vẫn được giữ lại."
        onConfirm={xoaTaiKhoan}
        onCancel={() => setConfirmXoaTk(false)}
      />
    </div>
  );
};

export default ChiTietNguoiThue;
