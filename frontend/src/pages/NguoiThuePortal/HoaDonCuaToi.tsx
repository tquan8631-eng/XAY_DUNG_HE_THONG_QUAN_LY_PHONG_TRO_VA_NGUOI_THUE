import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import { PageHeader } from '../../components/common/ui';
import { formatCurrency, formatDate, formatThangNam, trangThaiHoaDon } from '../../utils/formatters';

const TABS = [
  { value: '', label: 'Tất cả' },
  { value: 'chua_thanhtoan_all', label: 'Chưa thanh toán xong' },
  { value: 'da_thanhtoan', label: 'Đã thanh toán' },
  { value: 'qua_han', label: 'Quá hạn' }
];

const HoaDonCuaToi: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.portal
      .getHoaDon(tab)
      .then(setData)
      .catch((e) => toast.error(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [tab]);

  const tongNo = data.filter((h) => h.trang_thai !== 'da_thanhtoan').reduce((s, h) => s + Number(h.con_lai), 0);

  const columns = [
    { key: 'thang_nam', label: 'Kỳ', render: (r: any) => <span className="font-medium text-gray-900">{formatThangNam(r.thang_nam)}</span> },
    { key: 'ma_hoa_don', label: 'Mã hóa đơn' },
    { key: 'tong_tien', label: 'Tổng tiền', render: (r: any) => formatCurrency(r.tong_tien) },
    { key: 'so_tien_da_tra', label: 'Đã trả', render: (r: any) => <span className="text-green-600">{formatCurrency(r.so_tien_da_tra)}</span> },
    {
      key: 'con_lai',
      label: 'Còn lại',
      render: (r: any) => <span className={Number(r.con_lai) > 0 ? 'text-red-600 font-semibold' : 'text-gray-400'}>{formatCurrency(r.con_lai)}</span>
    },
    { key: 'han_thanhtoan', label: 'Hạn thanh toán', render: (r: any) => formatDate(r.han_thanhtoan) },
    {
      key: 'trang_thai',
      label: 'Trạng thái',
      render: (r: any) => {
        const s = trangThaiHoaDon(r.trang_thai);
        return <Badge text={s.label} color={s.color} />;
      }
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Hóa đơn của tôi" subtitle={tongNo > 0 ? `Tổng số tiền cần thanh toán: ${formatCurrency(tongNo)}` : 'Bạn không còn khoản nợ nào 🎉'} />

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-2 text-sm rounded-full border transition-colors ${
              tab === t.value ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={data} loading={loading} onRowClick={(r: any) => navigate(`/cua-toi/hoa-don/${r.id}`)} emptyMessage="Không có hóa đơn nào" />
    </div>
  );
};

export default HoaDonCuaToi;
