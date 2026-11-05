import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { Card, InfoRow, PageHeader } from '../../components/common/ui';
import { formatCurrency, formatDate, trangThaiHopDong, trangThaiTienCoc } from '../../utils/formatters';

const HopDongCuaToi: React.FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.portal
      .getHopDong()
      .then(setList)
      .catch((e) => toast.error(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Hợp đồng thuê phòng" subtitle="Các hợp đồng bạn đứng tên hoặc là thành viên" />
      {list.length === 0 && <EmptyState title="Chưa có hợp đồng" description="Bạn chưa tham gia hợp đồng thuê phòng nào." />}

      {list.map((hd) => {
        const st = trangThaiHopDong(hd.trang_thai);
        const coc = trangThaiTienCoc(hd.trang_thai_tien_coc);
        const tongNgay = (new Date(hd.ngay_ket_thuc).getTime() - new Date(hd.ngay_bat_dau).getTime()) / 86400000;
        const daQua = Math.min(Math.max(tongNgay - Number(hd.so_ngay_con_lai), 0), tongNgay);
        const pct = tongNgay > 0 ? Math.round((daQua / tongNgay) * 100) : 0;
        return (
          <Card
            key={hd.id}
            title={
              <span>
                Hợp đồng {hd.ma_hop_dong} – Phòng {hd.so_phong}
              </span>
            }
            actions={<Badge text={st.label} color={st.color} />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <div>
                <InfoRow label="Người đứng tên" value={hd.ten_chu_hop_dong} />
                <InfoRow label="Vai trò của bạn" value={hd.la_chu_hop_dong ? 'Người đứng tên' : 'Thành viên ở ghép'} />
                <InfoRow label="Ngày bắt đầu" value={formatDate(hd.ngay_bat_dau)} />
                <InfoRow label="Ngày kết thúc" value={formatDate(hd.ngay_ket_thuc)} />
              </div>
              <div>
                <InfoRow label="Giá thuê" value={formatCurrency(hd.gia_thue)} />
                <InfoRow label="Tiền cọc" value={formatCurrency(hd.tien_coc)} />
                <InfoRow label="Trạng thái cọc" value={<Badge text={coc.label} color={coc.color} />} />
                <InfoRow label="Ngày chốt tiền" value={`Ngày ${hd.ngay_chot_tien_hang_thang} hàng tháng`} />
              </div>
            </div>
            {hd.trang_thai === 'con_han' && (
              <div className="mt-4">
                <div className="flex justify-between mb-1 text-xs text-gray-500">
                  <span>Thời gian hợp đồng đã qua: {pct}%</span>
                  <span>Còn {hd.so_ngay_con_lai} ngày</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full">
                  <div className={`h-2 rounded-full ${hd.so_ngay_con_lai <= 30 ? 'bg-amber-500' : 'bg-teal-500'}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default HopDongCuaToi;
