import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Zap, Droplets } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../services/api';
import { formatDate, formatThangNam } from '../../utils/formatters';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import { PageHeader, Field, inputCls, btn, FormActions, thangNamHienTai, ngayHomNay } from '../../components/common/ui';
import { useAuth } from '../../hooks/useAuth';

const emptyForm = {
  phong_id: '',
  thang_nam: '',
  chi_so_dien_cu: '',
  chi_so_dien_moi: '',
  chi_so_nuoc_cu: '',
  chi_so_nuoc_moi: '',
  ngay_ghi: ''
};

const DanhSachChiSo: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [thangNam, setThangNam] = useState(thangNamHienTai());
  const [phongFilter, setPhongFilter] = useState('');
  const [phongList, setPhongList] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>(emptyForm);
  const [goiY, setGoiY] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.phongTro.getAll({ limit: 500 }).then((r) => setPhongList(r.data)).catch(() => undefined);
  }, []);

  useEffect(() => {
    fetchData();
  }, [page, thangNam, phongFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.chiSoDienNuoc.getAll({ page, limit: 20, thang_nam: thangNam, phong_id: phongFilter });
      setData(res.data);
      setTotalPages(res.totalPages);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Lỗi khi tải danh sách chỉ số'));
    } finally {
      setLoading(false);
    }
  };

  const layChiSoCu = async (phong_id: string, thang_nam: string) => {
    if (!phong_id || !thang_nam) return;
    try {
      const cu = await api.chiSoDienNuoc.getChiSoCu(Number(phong_id), thang_nam);
      setFormData((f: any) => ({ ...f, chi_so_dien_cu: String(cu.chi_so_dien_cu), chi_so_nuoc_cu: String(cu.chi_so_nuoc_cu) }));
      setGoiY(cu.tu_ky ? `Chỉ số cũ lấy từ kỳ ${formatThangNam(cu.tu_ky, true)}` : 'Phòng chưa có kỳ trước, vui lòng nhập chỉ số cũ');
    } catch {
      setGoiY('');
    }
  };

  const handleOpenModal = (item?: any, phongId?: number) => {
    setGoiY('');
    if (item) {
      setSelectedId(item.id);
      setFormData({
        phong_id: String(item.phong_id),
        thang_nam: item.thang_nam,
        chi_so_dien_cu: String(item.chi_so_dien_cu),
        chi_so_dien_moi: String(item.chi_so_dien_moi),
        chi_so_nuoc_cu: String(item.chi_so_nuoc_cu),
        chi_so_nuoc_moi: String(item.chi_so_nuoc_moi),
        ngay_ghi: String(item.ngay_ghi).substring(0, 10)
      });
    } else {
      setSelectedId(null);
      const f = { ...emptyForm, phong_id: phongId ? String(phongId) : '', thang_nam: thangNam, ngay_ghi: ngayHomNay() };
      setFormData(f);
      if (phongId) layChiSoCu(String(phongId), thangNam);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = {
      ...formData,
      phong_id: Number(formData.phong_id),
      chi_so_dien_cu: Number(formData.chi_so_dien_cu),
      chi_so_dien_moi: Number(formData.chi_so_dien_moi),
      chi_so_nuoc_cu: Number(formData.chi_so_nuoc_cu),
      chi_so_nuoc_moi: Number(formData.chi_so_nuoc_moi)
    };
    if (p.chi_so_dien_moi < p.chi_so_dien_cu) return toast.error('Chỉ số điện mới phải ≥ chỉ số cũ');
    if (p.chi_so_nuoc_moi < p.chi_so_nuoc_cu) return toast.error('Chỉ số nước mới phải ≥ chỉ số cũ');
    try {
      setSaving(true);
      if (selectedId) {
        await api.chiSoDienNuoc.update(selectedId, p);
        toast.success('Cập nhật chỉ số thành công');
      } else {
        await api.chiSoDienNuoc.create(p);
        toast.success('Ghi chỉ số thành công');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.chiSoDienNuoc.delete(deleteId);
      toast.success('Xóa chỉ số thành công');
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleteId(null);
    }
  };

  const phongChuaGhi = phongFilter
    ? []
    : phongList.filter((p) => p.trang_thai === 'da_thue' && !data.some((d) => d.phong_id === p.id));

  const columns = [
    { key: 'so_phong', label: 'Phòng', render: (row: any) => <span className="font-medium">{row.so_phong}</span> },
    { key: 'thang_nam', label: 'Kỳ', render: (row: any) => formatThangNam(row.thang_nam, true) },
    {
      key: 'dien',
      label: 'Điện (cũ → mới)',
      render: (row: any) => (
        <span>
          {row.chi_so_dien_cu} → {row.chi_so_dien_moi} <b className="text-amber-600">({row.dien_tieu_thu} kWh)</b>
        </span>
      )
    },
    {
      key: 'nuoc',
      label: 'Nước (cũ → mới)',
      render: (row: any) => (
        <span>
          {row.chi_so_nuoc_cu} → {row.chi_so_nuoc_moi} <b className="text-blue-600">({row.nuoc_tieu_thu} m³)</b>
        </span>
      )
    },
    { key: 'ngay_ghi', label: 'Ngày ghi', render: (row: any) => formatDate(row.ngay_ghi) },
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
  const dienTT = Number(formData.chi_so_dien_moi || 0) - Number(formData.chi_so_dien_cu || 0);
  const nuocTT = Number(formData.chi_so_nuoc_moi || 0) - Number(formData.chi_so_nuoc_cu || 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chỉ Số Điện Nước"
        subtitle="Ghi chỉ số hàng tháng làm căn cứ tính hóa đơn"
        actions={
          <button onClick={() => handleOpenModal()} className={btn.primary}>
            <Plus className="w-5 h-5" /> Ghi chỉ số
          </button>
        }
      />

      <div className="p-6 space-y-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row">
          <Field label="Kỳ (tháng/năm)" className="sm:w-56">
            <input type="month" value={thangNam} onChange={(e) => { setThangNam(e.target.value); setPage(1); }} className={inputCls} />
          </Field>
          <Field label="Phòng" className="sm:w-56">
            <select className={inputCls} value={phongFilter} onChange={(e) => { setPhongFilter(e.target.value); setPage(1); }}>
              <option value="">Tất cả phòng</option>
              {phongList.map((p) => <option key={p.id} value={p.id}>Phòng {p.so_phong}</option>)}
            </select>
          </Field>
        </div>

        {!loading && phongChuaGhi.length > 0 && (
          <div className="p-3 text-sm border rounded-lg bg-amber-50 border-amber-200 text-amber-900">
            <p className="mb-2 font-medium">Phòng đang cho thuê chưa ghi chỉ số kỳ {formatThangNam(thangNam, true)}:</p>
            <div className="flex flex-wrap gap-2">
              {phongChuaGhi.map((p) => (
                <button key={p.id} onClick={() => handleOpenModal(undefined, p.id)} className="px-3 py-1 bg-white border rounded-full border-amber-300 hover:bg-amber-100">
                  + {p.so_phong}
                </button>
              ))}
            </div>
          </div>
        )}

        <DataTable columns={columns} data={data} loading={loading} emptyMessage="Chưa có chỉ số nào trong kỳ này" />
        {!loading && totalPages > 1 && (
          <div className="flex justify-end">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedId ? 'Cập nhật chỉ số' : 'Ghi chỉ số mới'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Phòng" required>
              <select
                required
                className={inputCls}
                value={formData.phong_id}
                disabled={!!selectedId}
                onChange={(e) => {
                  set('phong_id', e.target.value);
                  layChiSoCu(e.target.value, formData.thang_nam);
                }}
              >
                <option value="">-- Chọn phòng --</option>
                {phongList.map((p) => <option key={p.id} value={p.id}>Phòng {p.so_phong}</option>)}
              </select>
            </Field>
            <Field label="Kỳ" required>
              <input
                type="month"
                required
                className={inputCls}
                value={formData.thang_nam}
                disabled={!!selectedId}
                onChange={(e) => {
                  set('thang_nam', e.target.value);
                  layChiSoCu(formData.phong_id, e.target.value);
                }}
              />
            </Field>
          </div>
          {goiY && <p className="text-xs text-teal-700">{goiY}</p>}

          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-amber-50">
            <div className="flex items-center justify-between col-span-2 font-medium text-gray-900">
              <span className="flex items-center gap-2"><Zap size={16} className="text-amber-500" /> Điện</span>
              <span className="text-sm text-amber-700">Tiêu thụ: {dienTT >= 0 ? dienTT : '?'} kWh</span>
            </div>
            <Field label="Chỉ số cũ" required>
              <input type="number" required min={0} className={inputCls} value={formData.chi_so_dien_cu} onChange={(e) => set('chi_so_dien_cu', e.target.value)} />
            </Field>
            <Field label="Chỉ số mới" required>
              <input type="number" required min={0} className={inputCls} value={formData.chi_so_dien_moi} onChange={(e) => set('chi_so_dien_moi', e.target.value)} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-blue-50">
            <div className="flex items-center justify-between col-span-2 font-medium text-gray-900">
              <span className="flex items-center gap-2"><Droplets size={16} className="text-blue-500" /> Nước</span>
              <span className="text-sm text-blue-700">Tiêu thụ: {nuocTT >= 0 ? nuocTT : '?'} m³</span>
            </div>
            <Field label="Chỉ số cũ" required>
              <input type="number" required min={0} className={inputCls} value={formData.chi_so_nuoc_cu} onChange={(e) => set('chi_so_nuoc_cu', e.target.value)} />
            </Field>
            <Field label="Chỉ số mới" required>
              <input type="number" required min={0} className={inputCls} value={formData.chi_so_nuoc_moi} onChange={(e) => set('chi_so_nuoc_moi', e.target.value)} />
            </Field>
          </div>

          <Field label="Ngày ghi" required>
            <input type="date" required className={inputCls} value={formData.ngay_ghi} onChange={(e) => set('ngay_ghi', e.target.value)} />
          </Field>
          <FormActions onCancel={() => setIsModalOpen(false)} loading={saving} />
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} title="Xóa chỉ số" message="Bạn có chắc chắn muốn xóa bản ghi này?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
};

export default DanhSachChiSo;
