import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Home } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import { PageHeader, Field, inputCls, btn, FormActions } from '../../components/common/ui';
import { useAuth } from '../../hooks/useAuth';

const emptyForm = { ten_dich_vu: '', don_gia: '', don_vi_tinh: '', loai_dich_vu: 'co_dinh', ap_dung_tat_ca: true };

const DanhSachDichVu: React.FC = () => {
  const { user } = useAuth();
  const [dichVu, setDichVu] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setDichVu(await api.dichVu.getAll());
    } catch (error) {
      toast.error(getErrorMessage(error, 'Lỗi khi tải danh sách dịch vụ'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item?: any) => {
    if (item) {
      setSelectedId(item.id);
      setFormData({
        ten_dich_vu: item.ten_dich_vu,
        don_gia: String(Number(item.don_gia)),
        don_vi_tinh: item.don_vi_tinh,
        loai_dich_vu: item.loai_dich_vu,
        ap_dung_tat_ca: false
      });
    } else {
      setSelectedId(null);
      setFormData(emptyForm);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = { ...formData, don_gia: Number(formData.don_gia) };
      if (selectedId) {
        delete payload.ap_dung_tat_ca;
        await api.dichVu.update(selectedId, payload);
        toast.success('Cập nhật dịch vụ thành công');
      } else {
        await api.dichVu.create(payload);
        toast.success('Thêm dịch vụ mới thành công');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const apDungTatCa = async (row: any) => {
    try {
      await api.dichVu.addDichVuPhong({ dich_vu_id: row.id, tat_ca_phong: true });
      toast.success(`Đã áp dụng "${row.ten_dich_vu}" cho tất cả phòng`);
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.dichVu.delete(deleteId);
      toast.success('Xóa dịch vụ thành công');
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleteId(null);
    }
  };

  const columns = [
    { key: 'ten_dich_vu', label: 'Tên dịch vụ', render: (row: any) => <span className="font-medium text-gray-900">{row.ten_dich_vu}</span> },
    { key: 'don_gia', label: 'Đơn giá', render: (row: any) => `${formatCurrency(row.don_gia)} / ${row.don_vi_tinh}` },
    {
      key: 'loai_dich_vu',
      label: 'Cách tính',
      render: (row: any) =>
        row.loai_dich_vu === 'theo_chi_so' ? (
          <Badge text="Theo chỉ số" color="bg-amber-100 text-amber-800" />
        ) : (
          <Badge text={/người|nguoi/i.test(row.don_vi_tinh) ? 'Cố định × số người' : 'Cố định / tháng'} color="bg-blue-100 text-blue-800" />
        )
    },
    { key: 'so_phong_su_dung', label: 'Số phòng dùng', render: (row: any) => `${row.so_phong_su_dung} phòng` },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (row: any) => (
        <div className="flex items-center gap-1">
          <button title="Áp dụng cho tất cả phòng" className={`${btn.icon} text-teal-600`} onClick={() => apDungTatCa(row)}>
            <Home className="w-5 h-5" />
          </button>
          <button title="Sửa" className={`${btn.icon} text-indigo-600`} onClick={() => handleOpenModal(row)}>
            <Edit className="w-5 h-5" />
          </button>
          {user?.vai_tro === 'chu_nha' && (
            <button title="Xóa" className={`${btn.icon} text-red-600`} onClick={() => setDeleteId(row.id)}>
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      )
    }
  ];

  const set = (k: string, v: any) => setFormData((f: any) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Dịch Vụ"
        subtitle="Điện, nước tính theo chỉ số; các dịch vụ khác tính cố định hàng tháng (đơn vị “người” sẽ nhân số người ở)"
        actions={
          <button onClick={() => handleOpenModal()} className={btn.primary}>
            <Plus className="w-5 h-5" /> Thêm dịch vụ
          </button>
        }
      />

      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <DataTable columns={columns} data={dichVu} loading={loading} />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedId ? 'Cập nhật dịch vụ' : 'Thêm dịch vụ mới'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Tên dịch vụ" required hint="Dịch vụ theo chỉ số phải có chữ “Điện” hoặc “Nước” trong tên">
            <input required className={inputCls} value={formData.ten_dich_vu} onChange={(e) => set('ten_dich_vu', e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Đơn giá (VNĐ)" required>
              <input type="number" required min={0} className={inputCls} value={formData.don_gia} onChange={(e) => set('don_gia', e.target.value)} />
            </Field>
            <Field label="Đơn vị tính" required>
              <input required list="dvt" placeholder="kWh, m3, người, phòng..." className={inputCls} value={formData.don_vi_tinh} onChange={(e) => set('don_vi_tinh', e.target.value)} />
              <datalist id="dvt">
                <option value="kWh" />
                <option value="m3" />
                <option value="người" />
                <option value="phòng" />
                <option value="xe" />
              </datalist>
            </Field>
          </div>
          <Field label="Cách tính">
            <select className={inputCls} value={formData.loai_dich_vu} onChange={(e) => set('loai_dich_vu', e.target.value)}>
              <option value="theo_chi_so">Theo chỉ số (điện, nước)</option>
              <option value="co_dinh">Cố định hàng tháng</option>
            </select>
          </Field>
          {!selectedId && (
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={formData.ap_dung_tat_ca} onChange={(e) => set('ap_dung_tat_ca', e.target.checked)} />
              Áp dụng ngay cho tất cả phòng
            </label>
          )}
          <FormActions onCancel={() => setIsModalOpen(false)} loading={saving} />
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Xóa dịch vụ"
        message="Dịch vụ sẽ bị gỡ khỏi tất cả phòng. Các hóa đơn đã tạo không bị ảnh hưởng."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default DanhSachDichVu;
