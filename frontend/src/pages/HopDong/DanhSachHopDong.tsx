import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../services/api';
import { formatCurrency, formatDate, trangThaiHopDong } from '../../utils/formatters';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import FilterDropdown from '../../components/common/FilterDropdown';
import SearchBox from '../../components/common/SearchBox';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import { PageHeader, Field, inputCls, btn, FormActions, ngayHomNay } from '../../components/common/ui';
import { useAuth } from '../../hooks/useAuth';

const addMonths = (date: string, months: number) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  d.setDate(d.getDate() - 1);
  return d.toISOString().substring(0, 10);
};

export const HopDongForm: React.FC<{
  editing: any | null;
  onClose: () => void;
  onSaved: () => void;
  defaultPhongId?: number;
}> = ({ editing, onClose, onSaved, defaultPhongId }) => {
  const [phongList, setPhongList] = useState<any[]>([]);
  const [nguoiThueList, setNguoiThueList] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(() =>
    editing
      ? {
          ma_hop_dong: editing.ma_hop_dong,
          phong_id: String(editing.phong_id),
          chu_hop_dong_id: String(editing.chu_hop_dong_id),
          ngay_bat_dau: String(editing.ngay_bat_dau).substring(0, 10),
          ngay_ket_thuc: String(editing.ngay_ket_thuc).substring(0, 10),
          tien_coc: String(Number(editing.tien_coc) || 0),
          trang_thai_tien_coc: editing.trang_thai_tien_coc || 'dang_giu',
          ngay_chot_tien_hang_thang: editing.ngay_chot_tien_hang_thang || 5,
          trang_thai: editing.trang_thai || 'con_han'
        }
      : {
          ma_hop_dong: `HD${Date.now().toString().slice(-6)}`,
          phong_id: defaultPhongId ? String(defaultPhongId) : '',
          chu_hop_dong_id: '',
          ngay_bat_dau: ngayHomNay(),
          ngay_ket_thuc: addMonths(ngayHomNay(), 12),
          tien_coc: '',
          trang_thai_tien_coc: 'dang_giu',
          ngay_chot_tien_hang_thang: 5,
          trang_thai: 'con_han'
        }
  );

  useEffect(() => {
    if (editing) return;
    Promise.all([api.phongTro.getAll({ limit: 500 }), api.nguoiThue.getAll({ limit: 1000 })])
      .then(([p, n]) => {
        setPhongList(p.data.filter((x: any) => x.trang_thai === 'trong' || x.trang_thai === 'da_coc'));
        setNguoiThueList(n.data);
      })
      .catch((e) => toast.error(getErrorMessage(e)));
  }, [editing]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const chonPhong = (id: string) => {
    const p = phongList.find((x) => String(x.id) === id);
    setForm((f: any) => ({ ...f, phong_id: id, tien_coc: f.tien_coc || (p ? String(Number(p.gia_thue)) : '') }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.ngay_ket_thuc <= form.ngay_bat_dau) return toast.error('Ngày kết thúc phải sau ngày bắt đầu');
    try {
      setSaving(true);
      const payload = {
        ...form,
        phong_id: Number(form.phong_id),
        chu_hop_dong_id: Number(form.chu_hop_dong_id),
        tien_coc: Number(form.tien_coc) || 0,
        ngay_chot_tien_hang_thang: Number(form.ngay_chot_tien_hang_thang)
      };
      if (editing) {
        await api.hopDong.update(editing.id, payload);
        toast.success('Cập nhật hợp đồng thành công');
      } else {
        await api.hopDong.create(payload);
        toast.success('Lập hợp đồng thành công');
      }
      onSaved();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={editing ? `Cập nhật hợp đồng ${editing.ma_hop_dong}` : 'Lập hợp đồng mới'} size="xl">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Mã hợp đồng" required>
            <input className={inputCls} required disabled={!!editing} value={form.ma_hop_dong} onChange={(e) => set('ma_hop_dong', e.target.value)} />
          </Field>
          <Field label="Phòng" required hint={editing ? undefined : 'Chỉ hiển thị phòng trống / đã cọc'}>
            {editing ? (
              <input className={inputCls} disabled value={`Phòng ${editing.so_phong}`} />
            ) : (
              <select className={inputCls} required value={form.phong_id} onChange={(e) => chonPhong(e.target.value)}>
                <option value="">-- Chọn phòng --</option>
                {phongList.map((p) => (
                  <option key={p.id} value={p.id}>
                    Phòng {p.so_phong} – {formatCurrency(p.gia_thue)}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Người đứng tên hợp đồng" required className="sm:col-span-2">
            {editing ? (
              <input className={inputCls} disabled value={editing.chu_hop_dong?.ho_ten || editing.ho_ten} />
            ) : (
              <select className={inputCls} required value={form.chu_hop_dong_id} onChange={(e) => set('chu_hop_dong_id', e.target.value)}>
                <option value="">-- Chọn người thuê --</option>
                {nguoiThueList.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.ho_ten} – {n.so_dien_thoai} {n.so_phong ? `(đang ở ${n.so_phong})` : ''}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Ngày bắt đầu" required>
            <input type="date" className={inputCls} required value={form.ngay_bat_dau} onChange={(e) => set('ngay_bat_dau', e.target.value)} />
          </Field>
          <Field label="Ngày kết thúc" required>
            <div className="flex gap-2">
              <input type="date" className={inputCls} required value={form.ngay_ket_thuc} onChange={(e) => set('ngay_ket_thuc', e.target.value)} />
              {[6, 12].map((m) => (
                <button key={m} type="button" className="px-2 text-xs border rounded-lg hover:bg-gray-50 whitespace-nowrap" onClick={() => set('ngay_ket_thuc', addMonths(form.ngay_bat_dau, m))}>
                  {m}th
                </button>
              ))}
            </div>
          </Field>
          <Field label="Tiền cọc (VNĐ)">
            <input type="number" min={0} className={inputCls} value={form.tien_coc} onChange={(e) => set('tien_coc', e.target.value)} />
          </Field>
          <Field label="Trạng thái tiền cọc">
            <select className={inputCls} value={form.trang_thai_tien_coc} onChange={(e) => set('trang_thai_tien_coc', e.target.value)}>
              <option value="dang_giu">Đang giữ</option>
              <option value="da_hoan_tra">Đã hoàn trả</option>
              <option value="da_khau_tru">Đã khấu trừ</option>
            </select>
          </Field>
          <Field label="Ngày chốt tiền hàng tháng" hint="Từ 1 đến 28">
            <input type="number" min={1} max={28} className={inputCls} value={form.ngay_chot_tien_hang_thang} onChange={(e) => set('ngay_chot_tien_hang_thang', e.target.value)} />
          </Field>
          {editing && (
            <Field label="Trạng thái hợp đồng">
              <select className={inputCls} value={form.trang_thai} onChange={(e) => set('trang_thai', e.target.value)}>
                <option value="con_han">Còn hạn</option>
                <option value="het_han">Hết hạn (trả phòng)</option>
                <option value="da_huy">Đã hủy</option>
              </select>
            </Field>
          )}
        </div>
        {editing && form.trang_thai !== 'con_han' && editing.trang_thai === 'con_han' && (
          <div className="flex gap-2 p-3 text-sm rounded-lg bg-amber-50 text-amber-800">
            <AlertTriangle size={18} className="shrink-0" />
            Kết thúc hợp đồng sẽ chuyển phòng về trạng thái “Trống” và người thuê sang “Đã chuyển đi”.
          </div>
        )}
        <FormActions onCancel={onClose} loading={saving} submitText={editing ? 'Lưu thay đổi' : 'Lập hợp đồng'} />
      </form>
    </Modal>
  );
};

const DanhSachHopDong: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [sapHetHan, setSapHetHan] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, [page, statusFilter, search, sapHetHan]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.hopDong.getAll({ page, limit: 10, trang_thai: statusFilter, search, sap_het_han: sapHetHan ? 'true' : undefined });
      setData(res.data);
      setTotalPages(res.totalPages);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Lỗi khi tải danh sách hợp đồng'));
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.hopDong.delete(deleteId);
      toast.success('Xóa hợp đồng thành công');
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleteId(null);
    }
  };

  const columns = [
    { key: 'ma_hop_dong', label: 'Mã hợp đồng', render: (row: any) => <span className="font-medium text-indigo-600">{row.ma_hop_dong}</span> },
    { key: 'so_phong', label: 'Phòng', render: (row: any) => row.so_phong },
    {
      key: 'ho_ten',
      label: 'Người đứng tên',
      render: (row: any) => (
        <div>
          <p className="font-medium text-gray-900">{row.ho_ten}</p>
          <p className="text-xs text-gray-500">{row.so_thanh_vien} người ở</p>
        </div>
      )
    },
    {
      key: 'thoi_han',
      label: 'Thời hạn',
      render: (row: any) => (
        <div>
          <p>
            {formatDate(row.ngay_bat_dau)} → {formatDate(row.ngay_ket_thuc)}
          </p>
          {row.trang_thai === 'con_han' && row.so_ngay_con_lai <= 30 && (
            <p className={`text-xs font-medium ${row.so_ngay_con_lai < 0 ? 'text-red-600' : 'text-amber-600'}`}>
              {row.so_ngay_con_lai < 0 ? `Đã quá hạn ${-row.so_ngay_con_lai} ngày` : `Còn ${row.so_ngay_con_lai} ngày`}
            </p>
          )}
        </div>
      )
    },
    { key: 'gia_thue', label: 'Giá thuê', render: (row: any) => formatCurrency(row.gia_thue) },
    { key: 'tien_coc', label: 'Tiền cọc', render: (row: any) => formatCurrency(row.tien_coc) },
    {
      key: 'trang_thai',
      label: 'Trạng thái',
      render: (row: any) => {
        const s = trangThaiHopDong(row.trang_thai);
        return <Badge text={s.label} color={s.color} />;
      }
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (row: any) => (
        <div className="flex items-center gap-1">
          <button
            title="Sửa"
            className={`${btn.icon} text-indigo-600`}
            onClick={(e) => {
              e.stopPropagation();
              setEditing(row);
              setFormOpen(true);
            }}
          >
            <Edit className="w-5 h-5" />
          </button>
          {user?.vai_tro === 'chu_nha' && (
            <button
              title="Xóa"
              className={`${btn.icon} text-red-600`}
              onClick={(e) => {
                e.stopPropagation();
                setDeleteId(row.id);
              }}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Hợp Đồng"
        actions={
          <button
            className={btn.primary}
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="w-5 h-5" /> Lập hợp đồng
          </button>
        }
      />

      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center">
          <div className="w-full sm:w-1/3">
            <SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Tìm mã HĐ, phòng, người thuê..." />
          </div>
          <div className="w-full sm:w-1/4">
            <FilterDropdown
              label="Trạng thái"
              options={[
                { label: 'Còn hạn', value: 'con_han' },
                { label: 'Hết hạn', value: 'het_han' },
                { label: 'Đã hủy', value: 'da_huy' }
              ]}
              value={statusFilter}
              onChange={(v) => { setStatusFilter(v); setPage(1); }}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={sapHetHan} onChange={(e) => { setSapHetHan(e.target.checked); setPage(1); }} />
            Sắp hết hạn (≤ 30 ngày)
          </label>
        </div>

        <DataTable columns={columns} data={data} loading={loading} onRowClick={(row: any) => navigate(`/hop-dong/${row.id}`)} />
        {!loading && totalPages > 1 && (
          <div className="flex justify-end mt-4">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      {formOpen && (
        <HopDongForm
          editing={editing}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            fetchData();
          }}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Xóa hợp đồng"
        message="Chỉ xóa được hợp đồng chưa phát sinh hóa đơn. Với hợp đồng đã có hóa đơn, hãy chuyển trạng thái sang Hết hạn/Đã hủy."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default DanhSachHopDong;
