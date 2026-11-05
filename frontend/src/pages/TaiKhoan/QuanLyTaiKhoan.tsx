import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../services/api';
import { formatDate, formatDateTime, vaiTro } from '../../utils/formatters';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import SearchBox from '../../components/common/SearchBox';
import FilterDropdown from '../../components/common/FilterDropdown';
import { PageHeader, Field, inputCls, btn, FormActions } from '../../components/common/ui';
import { useAuth } from '../../hooks/useAuth';

const emptyForm = { ten_dang_nhap: '', mat_khau: '', vai_tro: 'nhan_vien', trang_thai: 'hoat_dong', nguoi_thue_id: '' };

const QuanLyTaiKhoan: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [vaiTroFilter, setVaiTroFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>(emptyForm);
  const [nguoiThueChuaCoTk, setNguoiThueChuaCoTk] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [page, search, vaiTroFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.taiKhoan.getAll({ page, limit: 10, search, vai_tro: vaiTroFilter });
      setData(res.data);
      setTotalPages(res.totalPages);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Lỗi khi tải danh sách tài khoản'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async (item?: any) => {
    setSelected(item || null);
    setFormData(item ? { ...emptyForm, ten_dang_nhap: item.ten_dang_nhap, vai_tro: item.vai_tro, trang_thai: item.trang_thai } : emptyForm);
    if (!item) {
      try {
        const res = await api.nguoiThue.getAll({ limit: 1000 });
        setNguoiThueChuaCoTk(res.data.filter((n: any) => !n.tai_khoan_id));
      } catch {
        setNguoiThueChuaCoTk([]);
      }
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (selected) {
        const payload: any = { trang_thai: formData.trang_thai };
        if (selected.vai_tro !== 'nguoi_thue') payload.vai_tro = formData.vai_tro;
        if (formData.mat_khau) payload.mat_khau = formData.mat_khau;
        await api.taiKhoan.update(selected.id, payload);
        toast.success('Cập nhật tài khoản thành công');
      } else {
        if (formData.mat_khau.length < 6) return toast.error('Mật khẩu phải có ít nhất 6 ký tự');
        await api.taiKhoan.create({ ...formData, nguoi_thue_id: formData.nguoi_thue_id ? Number(formData.nguoi_thue_id) : undefined });
        toast.success('Thêm tài khoản thành công');
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
      await api.taiKhoan.delete(deleteId);
      toast.success('Xóa tài khoản thành công');
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleteId(null);
    }
  };

  const columns = [
    { key: 'ten_dang_nhap', label: 'Tên đăng nhập', render: (row: any) => <span className="font-medium text-gray-900">{row.ten_dang_nhap}</span> },
    { key: 'ho_ten', label: 'Người thuê liên kết', render: (row: any) => row.ho_ten || '-' },
    {
      key: 'vai_tro',
      label: 'Vai trò',
      render: (row: any) => {
        const v = vaiTro(row.vai_tro);
        return <Badge text={v.label} color={v.color} />;
      }
    },
    {
      key: 'trang_thai',
      label: 'Trạng thái',
      render: (row: any) => (
        <Badge
          text={row.trang_thai === 'hoat_dong' ? 'Hoạt động' : 'Bị khóa'}
          color={row.trang_thai === 'hoat_dong' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
        />
      )
    },
    { key: 'lan_dang_nhap_cuoi', label: 'Đăng nhập cuối', render: (row: any) => (row.lan_dang_nhap_cuoi ? formatDateTime(row.lan_dang_nhap_cuoi) : 'Chưa đăng nhập') },
    { key: 'ngay_tao', label: 'Ngày tạo', render: (row: any) => formatDate(row.ngay_tao) },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (row: any) =>
        row.id !== user?.id ? (
          <div className="flex items-center gap-1">
            <button className={`${btn.icon} text-indigo-600`} onClick={() => handleOpenModal(row)}>
              <Edit className="w-5 h-5" />
            </button>
            <button className={`${btn.icon} text-red-600`} onClick={() => setDeleteId(row.id)}>
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <span className="text-xs text-gray-400">(Bạn)</span>
        )
    }
  ];

  const set = (k: string, v: string) => setFormData((f: any) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Tài Khoản"
        subtitle="Tài khoản chủ nhà, nhân viên và người thuê"
        actions={
          <button onClick={() => handleOpenModal()} className={btn.primary}>
            <Plus className="w-5 h-5" /> Thêm tài khoản
          </button>
        }
      />

      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row">
          <div className="sm:w-1/3">
            <SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Tìm tên đăng nhập, họ tên..." />
          </div>
          <div className="sm:w-1/4">
            <FilterDropdown
              label="Vai trò"
              options={[
                { value: 'chu_nha', label: 'Chủ nhà' },
                { value: 'nhan_vien', label: 'Nhân viên' },
                { value: 'nguoi_thue', label: 'Người thuê' }
              ]}
              value={vaiTroFilter}
              onChange={(v) => { setVaiTroFilter(v); setPage(1); }}
            />
          </div>
        </div>
        <DataTable columns={columns} data={data} loading={loading} />
        {!loading && totalPages > 1 && (
          <div className="flex justify-end mt-4">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selected ? 'Cập nhật tài khoản' : 'Thêm tài khoản mới'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Tên đăng nhập" required>
            <input required disabled={!!selected} className={inputCls} value={formData.ten_dang_nhap} onChange={(e) => set('ten_dang_nhap', e.target.value)} />
          </Field>
          <Field label={selected ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'} required={!selected}>
            <input type="password" required={!selected} className={inputCls} value={formData.mat_khau} onChange={(e) => set('mat_khau', e.target.value)} />
          </Field>
          <Field label="Vai trò">
            <select className={inputCls} disabled={selected?.vai_tro === 'nguoi_thue'} value={formData.vai_tro} onChange={(e) => set('vai_tro', e.target.value)}>
              <option value="nhan_vien">Nhân viên</option>
              <option value="chu_nha">Chủ nhà</option>
              {(!selected || selected.vai_tro === 'nguoi_thue') && <option value="nguoi_thue">Người thuê</option>}
            </select>
          </Field>
          {!selected && formData.vai_tro === 'nguoi_thue' && (
            <Field label="Liên kết với người thuê" required hint="Chỉ hiển thị người thuê chưa có tài khoản">
              <select required className={inputCls} value={formData.nguoi_thue_id} onChange={(e) => set('nguoi_thue_id', e.target.value)}>
                <option value="">-- Chọn người thuê --</option>
                {nguoiThueChuaCoTk.map((n) => (
                  <option key={n.id} value={n.id}>{n.ho_ten} – {n.so_dien_thoai}</option>
                ))}
              </select>
            </Field>
          )}
          <Field label="Trạng thái">
            <select className={inputCls} value={formData.trang_thai} onChange={(e) => set('trang_thai', e.target.value)}>
              <option value="hoat_dong">Hoạt động</option>
              <option value="khoa">Khóa</option>
            </select>
          </Field>
          <FormActions onCancel={() => setIsModalOpen(false)} loading={saving} />
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} title="Xóa tài khoản" message="Bạn có chắc chắn muốn xóa tài khoản này? (Hồ sơ người thuê liên kết vẫn được giữ lại)" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
};

export default QuanLyTaiKhoan;
