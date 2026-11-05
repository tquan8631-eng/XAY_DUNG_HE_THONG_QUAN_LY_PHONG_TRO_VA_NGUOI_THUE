import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { Card, InfoRow, PageHeader } from '../../components/common/ui';
import { formatCurrency, formatDate, gioiTinh } from '../../utils/formatters';
import { useNhaTro } from '../../hooks/useNhaTro';

const PhongCuaToi: React.FC = () => {
  const nhaTro = useNhaTro();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.portal
      .getPhong()
      .then(setData)
      .catch((e) => toast.error(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner /></div>;

  if (!data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Phòng của tôi" />
        <EmptyState title="Bạn chưa có phòng" description="Bạn hiện không có hợp đồng thuê phòng nào còn hiệu lực. Vui lòng liên hệ chủ nhà." />
      </div>
    );
  }

  const { phong, hop_dong, thanh_vien, dich_vu } = data;

  return (
    <div className="space-y-6">
      <PageHeader title={`Phòng ${phong.so_phong}`} subtitle={`Tầng ${phong.tang} • ${phong.dien_tich} m² • Tối đa ${phong.so_nguoi_toi_da} người`} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Thông tin phòng">
          <InfoRow label="Giá thuê" value={<span className="text-teal-700">{formatCurrency(phong.gia_thue)} / tháng</span>} />
          <InfoRow label="Diện tích" value={`${phong.dien_tich} m²`} />
          <InfoRow label="Số người đang ở" value={`${thanh_vien.length}/${phong.so_nguoi_toi_da}`} />
          <InfoRow label="Mô tả" value={phong.mo_ta || '-'} />
          <InfoRow label="Ngày chốt tiền hàng tháng" value={`Ngày ${hop_dong.ngay_chot_tien_hang_thang}`} />
        </Card>

        <Card title="Liên hệ chủ nhà">
          <InfoRow label="Nhà trọ" value={nhaTro.ten_nha_tro} />
          <InfoRow label="Địa chỉ" value={nhaTro.dia_chi} />
          <InfoRow label="Điện thoại" value={<a href={`tel:${nhaTro.so_dien_thoai.replace(/\s/g, '')}`} className="text-teal-700">{nhaTro.so_dien_thoai}</a>} />
        </Card>
      </div>

      <Card title="Dịch vụ đang sử dụng">
        {dich_vu.length ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {dich_vu.map((dv: any) => (
              <div key={dv.id} className="p-4 border rounded-lg">
                <p className="font-medium text-gray-900">{dv.ten_dich_vu}</p>
                <p className="text-lg font-semibold text-teal-700">{formatCurrency(dv.don_gia)}</p>
                <p className="text-xs text-gray-500">
                  / {dv.don_vi_tinh} • {dv.loai_dich_vu === 'theo_chi_so' ? 'theo chỉ số' : 'hàng tháng'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Phòng chưa đăng ký dịch vụ nào.</p>
        )}
      </Card>

      <Card title="Thành viên trong phòng">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-600 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Họ tên</th>
                <th className="px-4 py-3 text-left">Giới tính</th>
                <th className="px-4 py-3 text-left">Số điện thoại</th>
                <th className="px-4 py-3 text-left">Vai trò</th>
                <th className="px-4 py-3 text-left">Ngày vào ở</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {thanh_vien.map((tv: any) => (
                <tr key={tv.id} className={tv.la_toi ? 'bg-teal-50' : ''}>
                  <td className="px-4 py-3 font-medium">
                    {tv.ho_ten} {tv.la_toi ? <span className="text-xs text-teal-700">(Bạn)</span> : null}
                  </td>
                  <td className="px-4 py-3">{gioiTinh(tv.gioi_tinh)}</td>
                  <td className="px-4 py-3">{tv.so_dien_thoai}</td>
                  <td className="px-4 py-3">{tv.la_chu_hop_dong ? <Badge text="Đứng tên HĐ" color="bg-teal-100 text-teal-800" /> : 'Ở ghép'}</td>
                  <td className="px-4 py-3">{formatDate(tv.ngay_vao_o)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default PhongCuaToi;
