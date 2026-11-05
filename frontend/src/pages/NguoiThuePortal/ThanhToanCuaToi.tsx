import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import { PageHeader } from '../../components/common/ui';
import { formatCurrency, formatDateTime, formatThangNam, phuongThucThanhToan } from '../../utils/formatters';

const ThanhToanCuaToi: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.portal
      .getThanhToan()
      .then(setData)
      .catch((e) => toast.error(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  const tong = data.reduce((s, t) => s + Number(t.so_tien), 0);

  const columns = [
    { key: 'ngay_thanh_toan', label: 'Thời gian', render: (r: any) => formatDateTime(r.ngay_thanh_toan) },
    { key: 'ma_hoa_don', label: 'Hóa đơn', render: (r: any) => <span className="font-medium text-teal-700">{r.ma_hoa_don}</span> },
    { key: 'thang_nam', label: 'Kỳ', render: (r: any) => formatThangNam(r.thang_nam, true) },
    { key: 'so_tien', label: 'Số tiền', render: (r: any) => <span className="font-semibold text-green-600">{formatCurrency(r.so_tien)}</span> },
    { key: 'phuong_thuc', label: 'Phương thức', render: (r: any) => phuongThucThanhToan(r.phuong_thuc) },
    { key: 'ma_giao_dich', label: 'Mã GD', render: (r: any) => r.ma_giao_dich || '-' },
    { key: 'ghi_chu', label: 'Ghi chú', render: (r: any) => r.ghi_chu || '-' }
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Lịch sử thanh toán" subtitle={`Tổng đã thanh toán: ${formatCurrency(tong)}`} />
      <DataTable columns={columns} data={data} loading={loading} onRowClick={(r: any) => navigate(`/cua-toi/hoa-don/${r.hoa_don_id}`)} emptyMessage="Chưa có giao dịch nào" />
    </div>
  );
};

export default ThanhToanCuaToi;
