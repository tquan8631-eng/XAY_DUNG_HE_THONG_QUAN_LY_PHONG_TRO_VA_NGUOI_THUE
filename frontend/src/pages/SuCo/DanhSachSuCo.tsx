import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../services/api';
import { formatDate, mucDoUuTien, trangThaiSuCo, MUC_DO_OPTIONS, TRANG_THAI_SU_CO_OPTIONS } from '../../utils/formatters';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import FilterDropdown from '../../components/common/FilterDropdown';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import { PageHeader, Field, inputCls, btn, FormActions } from '../../components/common/ui';
import { useAuth } from '../../hooks/useAuth';

const emptyForm = { phong_id: '', tieu_de: '', mo_ta: '', muc_do_uu_tien: 'trung_binh', trang_thai: 'cho_xuly' };

const statusSelectColor: Record<string, string> = {
  cho_xuly: 'bg-red-100 text-red-800',
  dang_xuly: 'bg-yellow-100 text-yellow-800',
  da_xuly: 'bg-green-100 text-green-800',
  tu_choy: 'bg-gray-100 text-gray-800'
};

const DanhSachSuCo: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [mucDoFilter, setMucDoFilter] = useState('');
  const [phongList, setPhongList] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [page, statusFilter, mucDoFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.suCo.getAll({ page, limit: 10, trang_thai: statusFilter, muc_do_uu_tien: mucDoFilter });
      setData(res.data);
      setTotalPages(res.totalPages);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Lỗi khi tải danh sách sự cố'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async (item?: any) => {
    if (!item && phongList.length === 0) {
      try {
        const res = await api.phongTro.getAll({ limit: 500, trang_thai: 'da_thue' });
        setPhongList(res.data);
      } catch {
      }
    }
    setSelected(item || null);
    setFormData(
      item
        ? { phong_id: String(item.phong_id), tieu_de: item.tieu_de, mo_ta: item.mo_ta || '', muc_do_uu_tien: item.muc_do_uu_tien, trang_thai: item.trang_thai }
        : emptyForm
    );
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (selected) {
        const { tieu_de, mo_ta, muc_do_uu_tien, trang_thai } = formData;
        await api.suCo.update(selected.id, { tieu_de, mo_ta, muc_do_uu_tien, trang_thai });
        toast.success('Cập nhật sự cố thành công');
      } else {
        await api.suCo.create({ ...formData, phong_id: Number(formData.phong_id) });
        toast.success('Ghi nhận sự cố thành công');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: number, trang_thai: string) => {
    try {
      await api.suCo.update(id, { trang_thai });
      toast.success('Cập nhật trạng thái thành công');
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.suCo.delete(deleteId);
      toast.success('Xóa sự cố thành công');
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleteId(null);
    }
  };

  const columns = [
    { key: 'so_phong', label: 'Phòng', render: (row: any) => <span className="font-medium">{row.so_phong}</span> },
    {
      key: 'tieu_de',
      label: 'Sự cố',
      render: (row: any) => (
        <div className="max-w-xs whitespace-normal">
          <p className="font-medium text-gray-900">{row.tieu_de}</p>
          {row.mo_ta && <p className="text-xs text-gray-500 line-clamp-2">{row.mo_ta}</p>}
        </div>
      )
    },
    { key: 'nguoi_bao', label: 'Người báo', render: (row: any) => (
      <div>
        <p>{row.nguoi_bao}</p>
        <p className="text-xs text-gray-500">{row.so_dien_thoai}</p>
      </div>
    ) },
    {
      key: 'muc_do_uu_tien',
      label: 'Mức độ',
      render: (row: any) => {
        const md = mucDoUuTien(row.muc_do_uu_tien);
        return <Badge text={md.label} color={md.color} />;
      }
    },
    { key: 'ngay_tao', label: 'Ngày báo', render: (row: any) => formatDate(row.ngay_tao) },
    {
      key: 'trang_thai',
      label: 'Trạng thái',
      render: (row: any) => (
        <select
          value={row.trang_thai}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => handleStatusChange(row.id, e.target.value)}
          className={`text-xs font-medium rounded-full px-2 py-1 border-0 cursor-pointer ${statusSelectColor[row.trang_thai] || ''}`}
        >
          {TRANG_THAI_SU_CO_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (row: any) => (
        <div className="flex items-center gap-1">
          <button className={`${btn.icon} text-indigo-600`} onClick={() => handleOpenModal(row)}>
            <Edit className="w-5 h-5" />
          </button>
          {user?.vai_tro === 'chu_nha' && (
            <button className={`${btn.icon} text-red-600`} onClick={() => setDeleteId(row.id)}>
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      )
    }
  ];

  const set = (k: string, v: string) => setFormData((f: any) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Sự Cố"
        subtitle="Sự cố do người thuê báo qua cổng người thuê sẽ hiển thị tại đây"
        actions={
          <button onClick={() => handleOpenModal()} className={btn.primary}>
            <Plus className="w-5 h-5" /> Ghi nhận sự cố
          </button>
        }
      />

      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row">
          <div className="sm:w-1/4">
            <FilterDropdown label="Trạng thái" options={TRANG_THAI_SU_CO_OPTIONS} value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }} />
          </div>
          <div className="sm:w-1/4">
            <FilterDropdown label="Mức độ" options={MUC_DO_OPTIONS} value={mucDoFilter} onChange={(v) => { setMucDoFilter(v); setPage(1); }} />
          </div>
        </div>

        <DataTable columns={columns} data={data} loading={loading} emptyMessage="Không có sự cố nào" />
        {!loading && totalPages > 1 && (
          <div className="flex justify-end mt-4">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selected ? 'Cập nhật sự cố' : 'Ghi nhận sự cố'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Phòng" required hint={selected ? undefined : 'Người báo mặc định là người đứng tên hợp đồng của phòng'}>
            {selected ? (
              <input disabled className={inputCls} value={`Phòng ${selected.so_phong} – ${selected.nguoi_bao}`} />
            ) : (
              <select required className={inputCls} value={formData.phong_id} onChange={(e) => set('phong_id', e.target.value)}>
                <option value="">-- Chọn phòng đang cho thuê --</option>
                {phongList.map((p) => <option key={p.id} value={p.id}>Phòng {p.so_phong}</option>)}
              </select>
            )}
          </Field>
          <Field label="Tiêu đề" required>
            <input required className={inputCls} value={formData.tieu_de} onChange={(e) => set('tieu_de', e.target.value)} />
          </Field>
          <Field label="Mô tả chi tiết">
            <textarea rows={3} className={inputCls} value={formData.mo_ta} onChange={(e) => set('mo_ta', e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Mức độ ưu tiên">
              <select className={inputCls} value={formData.muc_do_uu_tien} onChange={(e) => set('muc_do_uu_tien', e.target.value)}>
                {MUC_DO_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Trạng thái">
              <select className={inputCls} value={formData.trang_thai} onChange={(e) => set('trang_thai', e.target.value)}>
                {TRANG_THAI_SU_CO_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
          </div>
          <FormActions onCancel={() => setIsModalOpen(false)} loading={saving} />
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} title="Xóa sự cố" message="Bạn có chắc chắn muốn xóa sự cố này?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
};

export default DanhSachSuCo;
