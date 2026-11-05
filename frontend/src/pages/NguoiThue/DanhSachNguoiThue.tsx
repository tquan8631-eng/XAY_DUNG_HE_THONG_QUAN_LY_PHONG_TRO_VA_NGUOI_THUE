import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Edit, Trash2, KeyRound, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

import api, { getErrorMessage } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import SearchBox from '../../components/common/SearchBox';
import FilterDropdown from '../../components/common/FilterDropdown';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import { PageHeader, Field, inputCls, btn, FormActions } from '../../components/common/ui';
import { gioiTinh, trangThaiNguoiThue } from '../../utils/formatters';
import { validateEmail, validatePhone } from '../../utils/validators';

const emptyForm = {
  ho_ten: '',
  so_dien_thoai: '',
  email: '',
  can_cuoc_cong_dan: '',
  ngay_sinh: '',
  gioi_tinh: 'nam',
  que_quan: '',
  da_dang_ky_tam_tru: false,
  trang_thai: 'dang_thue',
  tao_tai_khoan: true,
  ten_dang_nhap: '',
  mat_khau: ''
};

export const ThongTinDangNhapModal: React.FC<{ info: any; onClose: () => void }> = ({ info, onClose }) => {
  if (!info) return null;
  const text = `Tài khoản đăng nhập hệ thống nhà trọ\nTên đăng nhập: ${info.ten_dang_nhap}\nMật khẩu: ${info.mat_khau}\nVui lòng đổi mật khẩu sau khi đăng nhập.`;
  return (
    <Modal isOpen={!!info} onClose={onClose} title={info.dat_lai ? 'Đã đặt lại mật khẩu' : 'Đã cấp tài khoản'}>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">Gửi thông tin sau cho người thuê để họ đăng nhập vào cổng người thuê:</p>
        <div className="p-4 space-y-2 font-mono text-sm border rounded-lg bg-gray-50">
          <div>Tên đăng nhập: <strong>{info.ten_dang_nhap}</strong></div>
          <div>Mật khẩu: <strong>{info.mat_khau}</strong></div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            className={btn.secondary}
            onClick={() => {
              navigator.clipboard?.writeText(text);
              toast.success('Đã sao chép');
            }}
          >
            <Copy size={16} /> Sao chép
          </button>
          <button className={btn.primary} onClick={onClose}>Đóng</button>
        </div>
      </div>
    </Modal>
  );
};

export const CapTaiKhoanModal: React.FC<{ nguoiThue: any; onClose: () => void; onDone: (info: any) => void }> = ({
  nguoiThue,
  onClose,
  onDone
}) => {
  const [tenDangNhap, setTenDangNhap] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [loading, setLoading] = useState(false);
  const daCo = !!nguoiThue?.tai_khoan_id;

  useEffect(() => {
    if (nguoiThue) {
      setTenDangNhap(nguoiThue.ten_dang_nhap || nguoiThue.so_dien_thoai || '');
      setMatKhau(String(nguoiThue.can_cuoc_cong_dan || '').slice(-6));
    }
  }, [nguoiThue]);

  if (!nguoiThue) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (matKhau.length < 6) return toast.error('Mật khẩu phải có ít nhất 6 ký tự');
    try {
      setLoading(true);
      const res = await api.nguoiThue.taoTaiKhoan(nguoiThue.id, { ten_dang_nhap: tenDangNhap.trim(), mat_khau: matKhau });
      toast.success(res.message || 'Thành công');
      onDone(res.data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={!!nguoiThue} onClose={onClose} title={daCo ? 'Đặt lại mật khẩu người thuê' : 'Cấp tài khoản cho người thuê'}>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-gray-600">
          Người thuê: <strong>{nguoiThue.ho_ten}</strong>
        </p>
        <Field label="Tên đăng nhập" required={!daCo} hint={daCo ? 'Tài khoản đã tồn tại, chỉ đặt lại mật khẩu' : 'Mặc định là số điện thoại'}>
          <input className={inputCls} value={tenDangNhap} disabled={daCo} required onChange={(e) => setTenDangNhap(e.target.value)} />
        </Field>
        <Field label={daCo ? 'Mật khẩu mới' : 'Mật khẩu'} required hint="Mặc định là 6 số cuối CCCD">
          <input className={inputCls} value={matKhau} required minLength={6} onChange={(e) => setMatKhau(e.target.value)} />
        </Field>
        <FormActions onCancel={onClose} loading={loading} submitText={daCo ? 'Đặt lại mật khẩu' : 'Cấp tài khoản'} />
      </form>
    </Modal>
  );
};

const DanhSachNguoiThue: React.FC = () => {
  const navigate = useNavigate();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>(emptyForm);

  const [capTaiKhoan, setCapTaiKhoan] = useState<any>(null);
  const [thongTinDangNhap, setThongTinDangNhap] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [page, statusFilter, search]);

  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (searchParams.get('tao_moi') !== '1') return;
    setSelectedId(null);
    setFormData({ ...emptyForm, ho_ten: searchParams.get('ho_ten') || '', so_dien_thoai: searchParams.get('so_dien_thoai') || '' });
    setIsModalOpen(true);
    setSearchParams({}, { replace: true });
  }, [searchParams]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.nguoiThue.getAll({ page, limit: 10, search, trang_thai: statusFilter });
      setData(res.data);
      setTotalPages(res.totalPages);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Lỗi tải danh sách người thuê'));
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item?: any) => {
    if (item) {
      setSelectedId(item.id);
      setFormData({
        ...emptyForm,
        ho_ten: item.ho_ten || '',
        so_dien_thoai: item.so_dien_thoai || '',
        email: item.email || '',
        can_cuoc_cong_dan: item.can_cuoc_cong_dan || '',
        ngay_sinh: item.ngay_sinh ? String(item.ngay_sinh).substring(0, 10) : '',
        gioi_tinh: item.gioi_tinh || 'nam',
        que_quan: item.que_quan || '',
        da_dang_ky_tam_tru: !!item.da_dang_ky_tam_tru,
        trang_thai: item.trang_thai || 'dang_thue',
        tao_tai_khoan: false
      });
    } else {
      setSelectedId(null);
      setFormData(emptyForm);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneErr = validatePhone(formData.so_dien_thoai.trim());
    if (phoneErr) return toast.error(phoneErr);
    const emailErr = validateEmail(formData.email.trim());
    if (emailErr) return toast.error(emailErr);
    if (!/^\d{9,12}$/.test(formData.can_cuoc_cong_dan.trim())) return toast.error('CCCD phải gồm 9–12 chữ số');

    const payload: any = {
      ho_ten: formData.ho_ten.trim(),
      so_dien_thoai: formData.so_dien_thoai.trim(),
      email: formData.email.trim() || null,
      can_cuoc_cong_dan: formData.can_cuoc_cong_dan.trim(),
      ngay_sinh: formData.ngay_sinh || null,
      gioi_tinh: formData.gioi_tinh,
      que_quan: formData.que_quan.trim() || null,
      da_dang_ky_tam_tru: formData.da_dang_ky_tam_tru,
      trang_thai: formData.trang_thai
    };

    try {
      setSaving(true);
      if (selectedId) {
        await api.nguoiThue.update(selectedId, payload);
        toast.success('Cập nhật người thuê thành công');
      } else {
        if (formData.tao_tai_khoan) {
          payload.tao_tai_khoan = true;
          payload.ten_dang_nhap = formData.ten_dang_nhap.trim() || undefined;
          payload.mat_khau = formData.mat_khau || undefined;
        }
        const res = await api.nguoiThue.create(payload);
        toast.success(res.message || 'Thêm người thuê thành công');
        if (res.data?.tai_khoan) setThongTinDangNhap(res.data.tai_khoan);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Có lỗi xảy ra khi lưu người thuê'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      await api.nguoiThue.delete(selectedId);
      toast.success('Xóa người thuê thành công');
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không thể xóa người thuê'));
    } finally {
      setIsConfirmOpen(false);
      setSelectedId(null);
    }
  };

  const columns = [
    { key: 'ho_ten', label: 'Họ tên', render: (row: any) => <span className="font-medium text-gray-900">{row.ho_ten}</span> },
    { key: 'so_dien_thoai', label: 'Số điện thoại' },
    { key: 'can_cuoc_cong_dan', label: 'CCCD' },
    {
      key: 'so_phong',
      label: 'Phòng',
      render: (row: any) =>
        row.so_phong ? <span className="font-medium text-indigo-600">{row.so_phong}</span> : <span className="text-gray-400">Chưa có</span>
    },
    { key: 'gioi_tinh', label: 'Giới tính', render: (row: any) => gioiTinh(row.gioi_tinh) },
    {
      key: 'tai_khoan',
      label: 'Tài khoản',
      render: (row: any) =>
        row.tai_khoan_id ? (
          <div className="flex items-center gap-2">
            <Badge
              text={row.ten_dang_nhap}
              color={row.trang_thai_tai_khoan === 'khoa' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}
            />
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCapTaiKhoan(row);
            }}
            className="text-xs font-medium text-teal-700 hover:underline"
          >
            + Cấp tài khoản
          </button>
        )
    },
    {
      key: 'trang_thai',
      label: 'Trạng thái',
      render: (row: any) => {
        const st = trangThaiNguoiThue(row.trang_thai);
        return <Badge text={st.label} color={st.color} />;
      }
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (row: any) => (
        <div className="flex items-center gap-1">
          <button
            title={row.tai_khoan_id ? 'Đặt lại mật khẩu' : 'Cấp tài khoản'}
            onClick={(e) => {
              e.stopPropagation();
              setCapTaiKhoan(row);
            }}
            className={`${btn.icon} text-teal-600`}
          >
            <KeyRound className="w-5 h-5" />
          </button>
          <button
            title="Sửa"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenModal(row);
            }}
            className={`${btn.icon} text-indigo-600`}
          >
            <Edit className="w-5 h-5" />
          </button>
          <button
            title="Xóa"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedId(row.id);
              setIsConfirmOpen(true);
            }}
            className={`${btn.icon} text-red-600`}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      )
    }
  ];

  const set = (k: string, v: any) => setFormData((f: any) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Người Thuê"
        subtitle="Quản lý hồ sơ người thuê và cấp tài khoản đăng nhập cổng người thuê"
        actions={
          <button onClick={() => handleOpenModal()} className={btn.primary}>
            <Plus className="w-5 h-5" /> Thêm người thuê
          </button>
        }
      />

      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row">
          <div className="w-full sm:w-1/3">
            <SearchBox
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Tìm theo tên, SĐT, CCCD..."
            />
          </div>
          <div className="w-full sm:w-1/4">
            <FilterDropdown
              label="Trạng thái"
              options={[
                { label: 'Đang thuê', value: 'dang_thue' },
                { label: 'Đã chuyển đi', value: 'da_chuyen_di' }
              ]}
              value={statusFilter}
              onChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
            />
          </div>
        </div>

        <DataTable columns={columns} data={data} loading={loading} onRowClick={(row: any) => navigate(`/nguoi-thue/${row.id}`)} />

        {!loading && totalPages > 1 && (
          <div className="flex justify-end mt-4">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedId ? 'Cập nhật người thuê' : 'Thêm người thuê mới'} size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Họ tên" required>
              <input required className={inputCls} value={formData.ho_ten} onChange={(e) => set('ho_ten', e.target.value)} />
            </Field>
            <Field label="Số điện thoại" required>
              <input required className={inputCls} value={formData.so_dien_thoai} onChange={(e) => set('so_dien_thoai', e.target.value)} />
            </Field>
            <Field label="CCCD" required>
              <input required className={inputCls} value={formData.can_cuoc_cong_dan} onChange={(e) => set('can_cuoc_cong_dan', e.target.value)} />
            </Field>
            <Field label="Email">
              <input type="email" className={inputCls} value={formData.email} onChange={(e) => set('email', e.target.value)} />
            </Field>
            <Field label="Ngày sinh">
              <input type="date" className={inputCls} value={formData.ngay_sinh} onChange={(e) => set('ngay_sinh', e.target.value)} />
            </Field>
            <Field label="Giới tính">
              <select className={inputCls} value={formData.gioi_tinh} onChange={(e) => set('gioi_tinh', e.target.value)}>
                <option value="nam">Nam</option>
                <option value="nu">Nữ</option>
                <option value="khac">Khác</option>
              </select>
            </Field>
            <Field label="Quê quán" className="sm:col-span-2">
              <input className={inputCls} value={formData.que_quan} onChange={(e) => set('que_quan', e.target.value)} />
            </Field>
            <Field label="Trạng thái">
              <select className={inputCls} value={formData.trang_thai} onChange={(e) => set('trang_thai', e.target.value)}>
                <option value="dang_thue">Đang thuê</option>
                <option value="da_chuyen_di">Đã chuyển đi</option>
              </select>
            </Field>
            <label className="flex items-center gap-2 mt-6 text-sm text-gray-700">
              <input type="checkbox" checked={formData.da_dang_ky_tam_tru} onChange={(e) => set('da_dang_ky_tam_tru', e.target.checked)} />
              Đã đăng ký tạm trú
            </label>
          </div>

          {!selectedId && (
            <div className="p-4 space-y-3 border border-teal-200 rounded-lg bg-teal-50">
              <label className="flex items-center gap-2 text-sm font-medium text-teal-900">
                <input type="checkbox" checked={formData.tao_tai_khoan} onChange={(e) => set('tao_tai_khoan', e.target.checked)} />
                Tạo tài khoản đăng nhập cho người thuê
              </label>
              {formData.tao_tai_khoan && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Tên đăng nhập" hint="Để trống = dùng số điện thoại">
                    <input className={inputCls} value={formData.ten_dang_nhap} placeholder={formData.so_dien_thoai} onChange={(e) => set('ten_dang_nhap', e.target.value)} />
                  </Field>
                  <Field label="Mật khẩu" hint="Để trống = 6 số cuối CCCD">
                    <input className={inputCls} value={formData.mat_khau} placeholder={formData.can_cuoc_cong_dan.slice(-6)} onChange={(e) => set('mat_khau', e.target.value)} />
                  </Field>
                </div>
              )}
            </div>
          )}

          <FormActions onCancel={() => setIsModalOpen(false)} loading={saving} submitText={selectedId ? 'Lưu thay đổi' : 'Thêm người thuê'} />
        </form>
      </Modal>

      <CapTaiKhoanModal
        nguoiThue={capTaiKhoan}
        onClose={() => setCapTaiKhoan(null)}
        onDone={(info) => {
          setCapTaiKhoan(null);
          setThongTinDangNhap(info);
          fetchData();
        }}
      />
      <ThongTinDangNhapModal info={thongTinDangNhap} onClose={() => setThongTinDangNhap(null)} />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Xóa người thuê"
        message="Bạn có chắc chắn muốn xóa người thuê này? Tài khoản đăng nhập (nếu có) cũng sẽ bị xóa. Người thuê đã có hợp đồng sẽ không thể xóa."
        onConfirm={handleDelete}
        onCancel={() => {
          setIsConfirmOpen(false);
          setSelectedId(null);
        }}
      />
    </div>
  );
};

export default DanhSachNguoiThue;
