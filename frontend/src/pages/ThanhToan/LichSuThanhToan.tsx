import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../services/api';
import { formatCurrency, formatDateTime, formatThangNam, phuongThucThanhToan, PHUONG_THUC_OPTIONS } from '../../utils/formatters';
import DataTable from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import FilterDropdown from '../../components/common/FilterDropdown';
import { PageHeader, Field, inputCls } from '../../components/common/ui';

const LichSuThanhToan: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tongTien, setTongTien] = useState(0);
  const [phuongThuc, setPhuongThuc] = useState('');
  const [tuNgay, setTuNgay] = useState('');
  const [denNgay, setDenNgay] = useState('');

  useEffect(() => {
    fetchData();
  }, [page, phuongThuc, tuNgay, denNgay]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.thanhToan.getAll({ page, limit: 15, phuong_thuc: phuongThuc, tu_ngay: tuNgay, den_ngay: denNgay });
      setData(res.data);
      setTotalPages(res.totalPages);
      setTongTien(Number(res.tong_tien || 0));
    } catch (error) {
      toast.error(getErrorMessage(error, 'Lỗi khi tải lịch sử thanh toán'));
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'ngay_thanh_toan', label: 'Thời gian', render: (row: any) => formatDateTime(row.ngay_thanh_toan) },
    { key: 'ma_hoa_don', label: 'Hóa đơn', render: (row: any) => <span className="font-medium text-indigo-600">{row.ma_hoa_don}</span> },
    { key: 'so_phong', label: 'Phòng', render: (row: any) => `${row.so_phong} (${formatThangNam(row.thang_nam, true)})` },
    { key: 'ho_ten', label: 'Người thuê' },
    { key: 'so_tien', label: 'Số tiền', render: (row: any) => <span className="font-medium text-green-600">{formatCurrency(row.so_tien)}</span> },
    { key: 'phuong_thuc', label: 'Phương thức', render: (row: any) => phuongThucThanhToan(row.phuong_thuc) },
    { key: 'ma_giao_dich', label: 'Mã GD', render: (row: any) => row.ma_giao_dich || '-' },
    { key: 'ghi_chu', label: 'Ghi chú', render: (row: any) => row.ghi_chu || '-' }
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Lịch Sử Thanh Toán" subtitle={`Tổng tiền theo bộ lọc: ${formatCurrency(tongTien)}`} />

      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-end">
          <div className="lg:w-1/4">
            <FilterDropdown label="Phương thức" options={PHUONG_THUC_OPTIONS} value={phuongThuc} onChange={(v) => { setPhuongThuc(v); setPage(1); }} />
          </div>
          <Field label="Từ ngày" className="lg:w-44">
            <input type="date" className={inputCls} value={tuNgay} onChange={(e) => { setTuNgay(e.target.value); setPage(1); }} />
          </Field>
          <Field label="Đến ngày" className="lg:w-44">
            <input type="date" className={inputCls} value={denNgay} onChange={(e) => { setDenNgay(e.target.value); setPage(1); }} />
          </Field>
        </div>

        <DataTable columns={columns} data={data} loading={loading} onRowClick={(row: any) => navigate(`/hoa-don/${row.hoa_don_id}`)} emptyMessage="Chưa có giao dịch nào" />
        {!loading && totalPages > 1 && (
          <div className="flex justify-end mt-4">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default LichSuThanhToan;
