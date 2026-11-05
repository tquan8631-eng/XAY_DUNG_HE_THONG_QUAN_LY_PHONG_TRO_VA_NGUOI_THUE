import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DoorOpen, Receipt, AlertTriangle, CalendarClock, ArrowRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { Card, InfoRow, btn } from '../../components/common/ui';
import UuDaiNoiBat from '../../components/UuDaiNoiBat';
import { formatCurrency, formatDate, formatThangNam, trangThaiHoaDon } from '../../utils/formatters';

const TongQuan: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.portal
      .tongQuan()
      .then(setData)
      .catch((e) => toast.error(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner /></div>;
  if (!data) return null;

  const hd = data.hop_dong;
  const hoaDon = data.hoa_don_gan_nhat;
  const chiSo = (data.chi_so_gan_day || []).map((c: any) => ({
    thang: formatThangNam(c.thang_nam, true),
    dien: Number(c.dien_tieu_thu),
    nuoc: Number(c.nuoc_tieu_thu)
  }));

  return (
    <div className="space-y-6">
      <div className="p-6 text-white shadow-sm rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500">
        <p className="text-sm opacity-90">Xin chào,</p>
        <h1 className="text-2xl font-bold">{data.nguoi_thue.ho_ten}</h1>
        <p className="mt-1 text-sm opacity-90">
          {hd ? `Bạn đang thuê phòng ${hd.so_phong} (tầng ${hd.tang})` : 'Bạn hiện chưa có hợp đồng thuê phòng còn hiệu lực.'}
        </p>
      </div>

      <UuDaiNoiBat />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Phòng đang thuê" value={hd ? hd.so_phong : '—'} subtitle={hd ? formatCurrency(hd.gia_thue) + '/tháng' : undefined} icon={<DoorOpen />} color="bg-teal-50 text-teal-600" />
        <StatCard title="Cần thanh toán" value={formatCurrency(data.tong_no)} subtitle={`${data.hoa_don_chua_tt} hóa đơn chưa thanh toán xong`} icon={<Receipt />} color={data.tong_no > 0 ? 'red' : 'green'} />
        <StatCard
          title="Hợp đồng còn"
          value={hd ? `${hd.so_ngay_con_lai} ngày` : '—'}
          subtitle={hd ? `Đến ${formatDate(hd.ngay_ket_thuc)}` : undefined}
          icon={<CalendarClock />}
          color={hd && hd.so_ngay_con_lai <= 30 ? 'yellow' : 'blue'}
        />
        <StatCard title="Sự cố đang xử lý" value={data.su_co_dang_mo} icon={<AlertTriangle />} color="yellow" />
      </div>

      {hd && hd.so_ngay_con_lai <= 30 && (
        <div className="p-4 text-sm border rounded-lg bg-amber-50 border-amber-200 text-amber-900">
          ⏰ Hợp đồng của bạn sẽ hết hạn vào <b>{formatDate(hd.ngay_ket_thuc)}</b>. Vui lòng liên hệ chủ nhà nếu muốn gia hạn.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card
          title="Hóa đơn gần nhất"
          actions={<Link to="/cua-toi/hoa-don" className="text-sm text-teal-700 hover:underline">Xem tất cả</Link>}
        >
          {hoaDon ? (
            <div className="space-y-2">
              <InfoRow label="Mã hóa đơn" value={hoaDon.ma_hoa_don} />
              <InfoRow label="Kỳ" value={formatThangNam(hoaDon.thang_nam)} />
              <InfoRow label="Tổng tiền" value={formatCurrency(hoaDon.tong_tien)} />
              <InfoRow label="Còn phải trả" value={<span className="text-red-600">{formatCurrency(Number(hoaDon.tong_tien) - Number(hoaDon.so_tien_da_tra))}</span>} />
              <InfoRow label="Hạn thanh toán" value={formatDate(hoaDon.han_thanhtoan)} />
              <InfoRow label="Trạng thái" value={<Badge {...(() => { const s = trangThaiHoaDon(hoaDon.trang_thai); return { text: s.label, color: s.color }; })()} />} />
              <button className={`${btn.primary} w-full mt-3 !bg-teal-600 hover:!bg-teal-700`} onClick={() => navigate(`/cua-toi/hoa-don/${hoaDon.id}`)}>
                Xem chi tiết & thanh toán <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <p className="py-6 text-center text-gray-500">Chưa có hóa đơn nào</p>
          )}
        </Card>

        <Card title="Điện nước tiêu thụ gần đây" actions={<Link to="/cua-toi/dien-nuoc" className="text-sm text-teal-700 hover:underline">Chi tiết</Link>}>
          {chiSo.length ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chiSo}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="thang" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="dien" name="Điện (kWh)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="nuoc" name="Nước (m³)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-6 text-center text-gray-500">Chưa có dữ liệu chỉ số</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default TongQuan;
