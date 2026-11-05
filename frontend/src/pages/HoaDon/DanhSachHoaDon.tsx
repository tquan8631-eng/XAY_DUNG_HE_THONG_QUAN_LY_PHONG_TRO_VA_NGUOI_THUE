import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../services/api';
import { formatCurrency, formatDate, formatThangNam, trangThaiHoaDon, TRANG_THAI_HOA_DON_OPTIONS } from '../../utils/formatters';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import FilterDropdown from '../../components/common/FilterDropdown';
import SearchBox from '../../components/common/SearchBox';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import StatCard from '../../components/common/StatCard';
import { PageHeader, Field, inputCls, btn, FormActions, thangNamHienTai, ngayHomNay } from '../../components/common/ui';
import { Receipt, Wallet, AlertCircle } from 'lucide-react';

const DanhSachHoaDon: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [tongHop, setTongHop] = useState({ tong_tien: 0, da_thu: 0 });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [thangNamFilter, setThangNamFilter] = useState(thangNamHienTai());
  const [search, setSearch] = useState('');

  const [hopDongList, setHopDongList] = useState<any[]>([]);
  const [modal, setModal] = useState<'' | 'mot' | 'loat'>('');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ hop_dong_id: '', thang_nam: thangNamHienTai(), han_thanhtoan: ngayHomNay(7) });
  const [ketQuaLoat, setKetQuaLoat] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [page, statusFilter, thangNamFilter, search]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.hoaDon.getAll({ page, limit: 10, trang_thai: statusFilter, thang_nam: thangNamFilter, search });
      setData(res.data);
      setTotal(res.total);
      setTongHop(res.tong_hop || { tong_tien: 0, da_thu: 0 });
      setTotalPages(res.totalPages);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Lỗi khi tải danh sách hóa đơn'));
    } finally {
      setLoading(false);
    }
  };

  const openModal = async (type: 'mot' | 'loat') => {
    setFormData({ hop_dong_id: '', thang_nam: thangNamFilter || thangNamHienTai(), han_thanhtoan: ngayHomNay(7) });
    if (type === 'mot') {
      try {
        const res = await api.hopDong.getAll({ limit: 500, trang_thai: 'con_han' });
        setHopDongList(res.data);
      } catch (error) {
        return toast.error(getErrorMessage(error, 'Không thể tải danh sách hợp đồng'));
      }
    }
    setModal(type);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (modal === 'mot') {
        const res = await api.hoaDon.createTuDong({ ...formData, hop_dong_id: Number(formData.hop_dong_id) });
        toast.success('Tạo hóa đơn thành công');
        setModal('');
        navigate(`/hoa-don/${res.data.id}`);
      } else {
        const res = await api.hoaDon.createHangLoat({ thang_nam: formData.thang_nam, han_thanhtoan: formData.han_thanhtoan });
        toast.success(res.message || 'Hoàn tất');
        setModal('');
        setKetQuaLoat(res.data);
        setThangNamFilter(formData.thang_nam);
        fetchData();
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'ma_hoa_don', label: 'Mã HĐ', render: (row: any) => <span className="font-medium text-indigo-600">{row.ma_hoa_don}</span> },
    {
      key: 'so_phong',
      label: 'Phòng / Người thuê',
      render: (row: any) => (
        <div>
          <p className="font-medium text-gray-900">Phòng {row.so_phong}</p>
          <p className="text-xs text-gray-500">{row.ho_ten}</p>
        </div>
      )
    },
    { key: 'thang_nam', label: 'Kỳ', render: (row: any) => formatThangNam(row.thang_nam, true) },
    { key: 'tong_tien', label: 'Tổng tiền', render: (row: any) => <span className="font-semibold">{formatCurrency(row.tong_tien)}</span> },
    { key: 'so_tien_da_tra', label: 'Đã trả', render: (row: any) => <span className="text-green-600">{formatCurrency(row.so_tien_da_tra)}</span> },
    { key: 'han_thanhtoan', label: 'Hạn TT', render: (row: any) => formatDate(row.han_thanhtoan) },
    {
      key: 'trang_thai',
      label: 'Trạng thái',
      render: (row: any) => {
        const s = trangThaiHoaDon(row.trang_thai);
        return <Badge text={s.label} color={s.color} />;
      }
    },
    {
      key: 'actions',
      label: '',
      render: (row: any) => (
        <button className={`${btn.icon} text-indigo-600`} onClick={(e) => { e.stopPropagation(); navigate(`/hoa-don/${row.id}`); }}>
          <Eye className="w-5 h-5" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Hóa Đơn"
        actions={
          <>
            <button onClick={() => openModal('loat')} className={btn.success}>
              <Layers className="w-5 h-5" /> Tạo hàng loạt
            </button>
            <button onClick={() => openModal('mot')} className={btn.primary}>
              <Plus className="w-5 h-5" /> Tạo hóa đơn
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title={`Số hóa đơn ${thangNamFilter ? formatThangNam(thangNamFilter, true) : ''}`} value={total} icon={<Receipt />} color="indigo" />
        <StatCard title="Tổng phải thu" value={formatCurrency(tongHop.tong_tien)} icon={<Wallet />} color="blue" />
        <StatCard title="Đã thu / Còn nợ" value={formatCurrency(tongHop.da_thu)} subtitle={`Còn nợ: ${formatCurrency(tongHop.tong_tien - tongHop.da_thu)}`} icon={<AlertCircle />} color="green" />
      </div>

      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-end">
          <Field label="Kỳ" className="lg:w-48">
            <div className="flex gap-2">
              <input type="month" value={thangNamFilter} onChange={(e) => { setThangNamFilter(e.target.value); setPage(1); }} className={inputCls} />
              {thangNamFilter && (
                <button className="px-2 text-xs text-gray-500 hover:text-gray-800" onClick={() => setThangNamFilter('')} title="Xem tất cả kỳ">
                  Tất cả
                </button>
              )}
            </div>
          </Field>
          <div className="lg:w-1/3">
            <SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Tìm mã HĐ, phòng, người thuê..." />
          </div>
          <div className="lg:w-1/4">
            <FilterDropdown label="Trạng thái" options={TRANG_THAI_HOA_DON_OPTIONS} value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }} />
          </div>
        </div>

        <DataTable columns={columns} data={data} loading={loading} onRowClick={(row: any) => navigate(`/hoa-don/${row.id}`)} emptyMessage="Không có hóa đơn nào" />
        {!loading && totalPages > 1 && (
          <div className="flex justify-end mt-4">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <Modal isOpen={!!modal} onClose={() => setModal('')} title={modal === 'mot' ? 'Tạo hóa đơn cho 1 phòng' : 'Tạo hóa đơn hàng loạt'}>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Kỳ hóa đơn" required>
              <input type="month" required className={inputCls} value={formData.thang_nam} onChange={(e) => setFormData({ ...formData, thang_nam: e.target.value })} />
            </Field>
            <Field label="Hạn thanh toán" required>
              <input type="date" required className={inputCls} value={formData.han_thanhtoan} onChange={(e) => setFormData({ ...formData, han_thanhtoan: e.target.value })} />
            </Field>
          </div>
          {modal === 'mot' && (
            <Field label="Hợp đồng" required>
              <select required className={inputCls} value={formData.hop_dong_id} onChange={(e) => setFormData({ ...formData, hop_dong_id: e.target.value })}>
                <option value="">-- Chọn hợp đồng còn hạn --</option>
                {hopDongList.map((h) => (
                  <option key={h.id} value={h.id}>
                    Phòng {h.so_phong} – {h.ho_ten} ({h.ma_hop_dong})
                  </option>
                ))}
              </select>
            </Field>
          )}
          <div className="p-3 text-sm text-blue-800 rounded-lg bg-blue-50">
            {modal === 'loat'
              ? 'Hệ thống tạo hóa đơn cho TẤT CẢ hợp đồng còn hạn chưa có hóa đơn trong kỳ. Phòng chưa ghi chỉ số điện nước sẽ bị bỏ qua và báo lỗi.'
              : 'Hệ thống tự tính tiền phòng, điện nước (theo chỉ số đã ghi) và các dịch vụ phòng đang dùng.'}
          </div>
          <FormActions onCancel={() => setModal('')} loading={saving} submitText="Tạo hóa đơn" />
        </form>
      </Modal>

      <Modal isOpen={!!ketQuaLoat} onClose={() => setKetQuaLoat(null)} title="Kết quả tạo hóa đơn">
        {ketQuaLoat && (
          <div className="space-y-4 text-sm">
            <p className="text-green-700">✅ Tạo thành công: {ketQuaLoat.thanh_cong.length} hóa đơn {ketQuaLoat.thanh_cong.map((x: any) => x.so_phong).join(', ')}</p>
            {ketQuaLoat.loi.length > 0 && (
              <div>
                <p className="mb-1 font-medium text-red-700">❌ Không tạo được:</p>
                <ul className="pl-5 space-y-1 text-red-700 list-disc">
                  {ketQuaLoat.loi.map((l: any) => <li key={l.so_phong}>{l.message}</li>)}
                </ul>
              </div>
            )}
            {ketQuaLoat.thanh_cong.length === 0 && ketQuaLoat.loi.length === 0 && <p>Tất cả hợp đồng đã có hóa đơn cho kỳ này.</p>}
            <div className="flex justify-end">
              <button className={btn.primary} onClick={() => setKetQuaLoat(null)}>Đóng</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DanhSachHoaDon;
