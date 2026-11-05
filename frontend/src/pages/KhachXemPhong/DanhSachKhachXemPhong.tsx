import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Phone, Trash2, Bot, Globe, StickyNote, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { yeuCauXemPhongApi, getErrorMessage } from '../../services/api';
import { PageHeader, inputCls, btn } from '../../components/common/ui';
import DataTable, { Column } from '../../components/common/DataTable';
import FilterDropdown from '../../components/common/FilterDropdown';
import SearchBox from '../../components/common/SearchBox';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Modal from '../../components/common/Modal';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

const TRANG_THAI: Record<string, { label: string; cls: string }> = {
  moi: { label: 'Mới', cls: 'bg-red-100 text-red-700' },
  da_lien_he: { label: 'Đã liên hệ', cls: 'bg-blue-100 text-blue-700' },
  da_thue: { label: 'Đã thuê', cls: 'bg-green-100 text-green-700' },
  huy: { label: 'Hủy', cls: 'bg-gray-100 text-gray-600' }
};

const DanhSachKhachXemPhong: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ds, setDs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [trangThai, setTrangThai] = useState('');
  const [search, setSearch] = useState('');
  const [xoa, setXoa] = useState<any>(null);
  const [ghiChu, setGhiChu] = useState<any>(null);

  const tai = useCallback(() => {
    setLoading(true);
    yeuCauXemPhongApi
      .getAll({ trang_thai: trangThai || undefined, search: search || undefined })
      .then((r) => setDs(r.data))
      .catch((e) => toast.error(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [trangThai, search]);

  useEffect(() => {
    tai();
  }, [tai]);

  const capNhat = async (id: number, payload: any, thongBao = 'Đã cập nhật') => {
    try {
      await yeuCauXemPhongApi.update(id, payload);
      toast.success(thongBao);
      tai();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const soMoi = ds.filter((d) => d.trang_thai === 'moi').length;

  const columns: Column<any>[] = [
    {
      key: 'ho_ten',
      label: 'Khách',
      render: (r) => (
        <div>
          <p className="font-medium text-gray-900">{r.ho_ten}</p>
          <a href={`tel:${r.so_dien_thoai}`} className="flex items-center gap-1 text-xs text-indigo-600 hover:underline">
            <Phone size={12} /> {r.so_dien_thoai}
          </a>
        </div>
      )
    },
    {
      key: 'phong',
      label: 'Phòng quan tâm',
      render: (r) => (r.so_phong ? <span>{r.so_phong} <span className="text-xs text-gray-500">({formatCurrency(r.gia_thue)})</span></span> : <span className="text-gray-400">Chưa chọn</span>)
    },
    { key: 'ngay_hen', label: 'Ngày hẹn', render: (r) => (r.ngay_hen ? formatDate(r.ngay_hen) : '—') },
    {
      key: 'nguon',
      label: 'Nguồn',
      render: (r) => (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${r.nguon === 'chatbot' ? 'bg-violet-100 text-violet-700' : 'bg-sky-100 text-sky-700'}`}>
          {r.nguon === 'chatbot' ? <Bot size={12} /> : <Globe size={12} />} {r.nguon === 'chatbot' ? 'Chatbot' : 'Website'}
        </span>
      )
    },
    { key: 'ngay_tao', label: 'Gửi lúc', render: (r) => <span className="text-xs text-gray-500">{formatDateTime(r.ngay_tao)}</span> },
    {
      key: 'trang_thai',
      label: 'Trạng thái',
      render: (r) => (
        <select
          value={r.trang_thai}
          onChange={(e) => capNhat(r.id, { trang_thai: e.target.value })}
          className={`text-xs font-medium rounded-full px-2 py-1 border-0 cursor-pointer ${TRANG_THAI[r.trang_thai]?.cls}`}
        >
          {Object.entries(TRANG_THAI).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      )
    },
    {
      key: 'thao_tac',
      label: '',
      render: (r) => (
        <div className="flex justify-end gap-1">
          <button className={btn.icon} title={r.ghi_chu || 'Ghi chú'} onClick={() => setGhiChu({ id: r.id, ghi_chu: r.ghi_chu || '' })}>
            <StickyNote size={16} className={r.ghi_chu ? 'text-amber-500' : 'text-gray-400'} />
          </button>
          {r.trang_thai !== 'da_thue' && (
            <button className={btn.icon} title="Tạo người thuê từ khách này" onClick={() => navigate(`/nguoi-thue?tao_moi=1&ho_ten=${encodeURIComponent(r.ho_ten)}&so_dien_thoai=${r.so_dien_thoai}`)}>
              <UserPlus size={16} className="text-emerald-600" />
            </button>
          )}
          {user?.vai_tro === 'chu_nha' && (
            <button className={btn.icon} title="Xóa" onClick={() => setXoa(r)}>
              <Trash2 size={16} className="text-red-500" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Khách đăng ký xem phòng"
        subtitle={`Khách để lại thông tin trên trang giới thiệu hoặc qua chatbot 24/7${soMoi ? ` · ${soMoi} khách mới chưa liên hệ` : ''}`}
      />

      <div className="flex flex-col gap-3 p-4 bg-white border border-gray-200 rounded-xl sm:flex-row sm:items-center">
        <SearchBox value={search} onChange={setSearch} placeholder="Tìm tên, số điện thoại..." className="sm:w-72" />
        <FilterDropdown
          label="Trạng thái"
          value={trangThai}
          onChange={setTrangThai}
          options={[{ value: '', label: 'Tất cả' }, ...Object.entries(TRANG_THAI).map(([value, v]) => ({ value, label: v.label }))]}
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl">
        <DataTable columns={columns} data={ds} loading={loading} emptyMessage="Chưa có khách đăng ký xem phòng" />
      </div>

      <Modal isOpen={!!ghiChu} onClose={() => setGhiChu(null)} title="Ghi chú" size="sm">
        {ghiChu && (
          <div className="space-y-4">
            <textarea className={inputCls} rows={5} value={ghiChu.ghi_chu} onChange={(e) => setGhiChu({ ...ghiChu, ghi_chu: e.target.value })} maxLength={500} />
            <div className="flex justify-end gap-3">
              <button className={btn.secondary} onClick={() => setGhiChu(null)}>Hủy</button>
              <button
                className={btn.primary}
                onClick={async () => {
                  await capNhat(ghiChu.id, { ghi_chu: ghiChu.ghi_chu }, 'Đã lưu ghi chú');
                  setGhiChu(null);
                }}
              >
                Lưu
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!xoa}
        onClose={() => setXoa(null)}
        onConfirm={async () => {
          try {
            await yeuCauXemPhongApi.delete(xoa.id);
            toast.success('Đã xóa');
            setXoa(null);
            tai();
          } catch (e) {
            toast.error(getErrorMessage(e));
          }
        }}
        title="Xóa yêu cầu"
        message={`Xóa yêu cầu xem phòng của ${xoa?.ho_ten}?`}
        confirmText="Xóa"
      />
    </div>
  );
};

export default DanhSachKhachXemPhong;
