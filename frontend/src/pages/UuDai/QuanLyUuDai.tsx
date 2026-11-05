import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Eye, EyeOff, Megaphone, ExternalLink, Tag } from 'lucide-react';
import { quangCaoApi, getErrorMessage } from '../../services/api';
import { PageHeader, Field, inputCls, btn, FormActions } from '../../components/common/ui';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import FilterDropdown from '../../components/common/FilterDropdown';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

export const MAU_NEN: Record<string, { ten: string; cls: string }> = {
  indigo: { ten: 'Tím xanh', cls: 'from-indigo-500 to-violet-600' },
  rose: { ten: 'Hồng cam', cls: 'from-rose-500 to-orange-400' },
  emerald: { ten: 'Xanh lá', cls: 'from-emerald-500 to-teal-600' },
  amber: { ten: 'Vàng cam', cls: 'from-amber-500 to-orange-500' },
  sky: { ten: 'Xanh trời', cls: 'from-sky-500 to-blue-600' },
  violet: { ten: 'Tím hồng', cls: 'from-violet-500 to-fuchsia-600' }
};
const LOAI: Record<string, string> = { khuyen_mai: 'Khuyến mãi', thong_bao: 'Thông báo', gioi_thieu: 'Giới thiệu' };
const DOI_TUONG: Record<string, string> = { tat_ca: 'Tất cả', khach: 'Khách xem web', nguoi_thue: 'Người thuê' };

const RONG = { tieu_de: '', noi_dung: '', loai: 'khuyen_mai', ma_uu_dai: '', mau_nen: 'indigo', doi_tuong: 'tat_ca', ngay_bat_dau: '', ngay_ket_thuc: '', thu_tu: 0, trang_thai: 'hien' };

const QuanLyUuDai: React.FC = () => {
  const { user } = useAuth();
  const [ds, setDs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loc, setLoc] = useState('');
  const [form, setForm] = useState<any>(null);
  const [dangLuu, setDangLuu] = useState(false);
  const [xoa, setXoa] = useState<any>(null);

  const tai = useCallback(() => {
    setLoading(true);
    quangCaoApi
      .getAll({ loai: loc || undefined })
      .then((r) => setDs(r.data))
      .catch((e) => toast.error(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [loc]);

  useEffect(() => {
    tai();
  }, [tai]);

  const luu = async (e: React.FormEvent) => {
    e.preventDefault();
    setDangLuu(true);
    try {
      const { id, dang_chay, luot_xem, ngay_tao, ...payload } = form;
      const r = id ? await quangCaoApi.update(id, payload) : await quangCaoApi.create(payload);
      toast.success(r.message || 'Đã lưu');
      setForm(null);
      tai();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDangLuu(false);
    }
  };

  const doiTrangThai = async (q: any) => {
    try {
      await quangCaoApi.update(q.id, { trang_thai: q.trang_thai === 'hien' ? 'an' : 'hien' });
      tai();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const xacNhanXoa = async () => {
    try {
      await quangCaoApi.delete(xoa.id);
      toast.success('Đã xóa quảng cáo');
      setXoa(null);
      tai();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quảng cáo & ưu đãi"
        subtitle="Banner hiển thị trên trang giới thiệu, cổng người thuê và được chatbot giới thiệu cho khách"
        actions={
          <>
            <a href="/gioi-thieu" target="_blank" rel="noreferrer" className={btn.secondary}>
              <ExternalLink size={16} /> Xem trang giới thiệu
            </a>
            <button className={btn.primary} onClick={() => setForm({ ...RONG })}>
              <Plus size={16} /> Thêm quảng cáo
            </button>
          </>
        }
      />

      <FilterDropdown
        label="Loại"
        value={loc}
        onChange={setLoc}
        options={[{ value: '', label: 'Tất cả' }, ...Object.entries(LOAI).map(([value, label]) => ({ value, label }))]}
      />

      {loading ? (
        <div className="flex justify-center py-10"><LoadingSpinner /></div>
      ) : ds.length === 0 ? (
        <div className="py-16 text-center bg-white border border-gray-200 rounded-xl">
          <Megaphone size={40} className="mx-auto text-gray-300" />
          <p className="mt-3 text-gray-500">Chưa có quảng cáo nào</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {ds.map((q) => (
            <div key={q.id} className={`overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl ${q.trang_thai === 'an' ? 'opacity-60' : ''}`}>
              <div className={`p-5 text-white bg-gradient-to-br ${(MAU_NEN[q.mau_nen] || MAU_NEN.indigo).cls}`}>
                <div className="flex items-center justify-between text-[11px] font-semibold uppercase">
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/20"><Tag size={11} /> {LOAI[q.loai]}</span>
                  <span className="px-2 py-0.5 rounded bg-black/15">{DOI_TUONG[q.doi_tuong]}</span>
                </div>
                <h3 className="mt-3 text-lg font-bold">{q.tieu_de}</h3>
                <p className="mt-1 text-sm opacity-90 line-clamp-3">{q.noi_dung}</p>
                {q.ma_uu_dai && <span className="inline-block px-2 py-1 mt-3 font-mono text-sm font-bold border border-dashed rounded border-white/70">{q.ma_uu_dai}</span>}
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-xs text-gray-500">
                <div className="space-y-0.5">
                  <p>
                    {q.ngay_bat_dau || q.ngay_ket_thuc ? `${q.ngay_bat_dau ? formatDate(q.ngay_bat_dau) : '...'} → ${q.ngay_ket_thuc ? formatDate(q.ngay_ket_thuc) : '...'}` : 'Không giới hạn thời gian'}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded font-medium ${q.dang_chay ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {q.dang_chay ? 'Đang chạy' : q.trang_thai === 'an' ? 'Đã ẩn' : 'Ngoài thời gian'}
                    </span>
                    <span className="flex items-center gap-1"><Eye size={12} /> {q.luot_xem} lượt xem</span>
                  </p>
                </div>
                <div className="flex items-center">
                  <button className={btn.icon} title={q.trang_thai === 'hien' ? 'Ẩn' : 'Hiện'} onClick={() => doiTrangThai(q)}>
                    {q.trang_thai === 'hien' ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button className={`${btn.icon} text-indigo-600`} title="Sửa" onClick={() => setForm({ ...q, ma_uu_dai: q.ma_uu_dai || '', noi_dung: q.noi_dung || '', ngay_bat_dau: q.ngay_bat_dau || '', ngay_ket_thuc: q.ngay_ket_thuc || '' })}>
                    <Pencil size={16} />
                  </button>
                  {user?.vai_tro === 'chu_nha' && (
                    <button className={`${btn.icon} text-red-500`} title="Xóa" onClick={() => setXoa(q)}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!form} onClose={() => setForm(null)} title={form?.id ? 'Sửa quảng cáo' : 'Thêm quảng cáo'} size="lg">
        {form && (
          <form onSubmit={luu} className="space-y-4">

            <div className={`p-4 text-white rounded-xl bg-gradient-to-br ${(MAU_NEN[form.mau_nen] || MAU_NEN.indigo).cls}`}>
              <p className="font-bold">{form.tieu_de || 'Tiêu đề quảng cáo'}</p>
              <p className="text-sm opacity-90">{form.noi_dung || 'Nội dung mô tả ưu đãi...'}</p>
              {form.ma_uu_dai && <span className="inline-block px-2 py-0.5 mt-2 font-mono text-xs font-bold border border-dashed rounded">{form.ma_uu_dai}</span>}
            </div>
            <Field label="Tiêu đề" required>
              <input className={inputCls} value={form.tieu_de} onChange={(e) => setForm({ ...form, tieu_de: e.target.value })} maxLength={150} required />
            </Field>
            <Field label="Nội dung">
              <textarea className={inputCls} rows={3} value={form.noi_dung} onChange={(e) => setForm({ ...form, noi_dung: e.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Loại">
                <select className={inputCls} value={form.loai} onChange={(e) => setForm({ ...form, loai: e.target.value })}>
                  {Object.entries(LOAI).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </Field>
              <Field label="Hiển thị cho">
                <select className={inputCls} value={form.doi_tuong} onChange={(e) => setForm({ ...form, doi_tuong: e.target.value })}>
                  {Object.entries(DOI_TUONG).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </Field>
              <Field label="Mã ưu đãi" hint="Không bắt buộc">
                <input className={inputCls} value={form.ma_uu_dai} onChange={(e) => setForm({ ...form, ma_uu_dai: e.target.value.toUpperCase().replace(/\s/g, '') })} maxLength={30} />
              </Field>
              <Field label="Từ ngày">
                <input type="date" className={inputCls} value={form.ngay_bat_dau} onChange={(e) => setForm({ ...form, ngay_bat_dau: e.target.value })} />
              </Field>
              <Field label="Đến ngày">
                <input type="date" className={inputCls} value={form.ngay_ket_thuc} onChange={(e) => setForm({ ...form, ngay_ket_thuc: e.target.value })} />
              </Field>
              <Field label="Thứ tự" hint="Nhỏ hiển thị trước">
                <input type="number" className={inputCls} value={form.thu_tu} onChange={(e) => setForm({ ...form, thu_tu: Number(e.target.value) })} />
              </Field>
            </div>
            <Field label="Màu nền">
              <div className="flex flex-wrap gap-2">
                {Object.entries(MAU_NEN).map(([k, v]) => (
                  <button
                    type="button"
                    key={k}
                    onClick={() => setForm({ ...form, mau_nen: k })}
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${v.cls} ${form.mau_nen === k ? 'ring-2 ring-offset-2 ring-gray-800' : ''}`}
                    title={v.ten}
                  />
                ))}
              </div>
            </Field>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.trang_thai === 'hien'} onChange={(e) => setForm({ ...form, trang_thai: e.target.checked ? 'hien' : 'an' })} />
              Hiển thị quảng cáo này
            </label>
            <FormActions onCancel={() => setForm(null)} loading={dangLuu} />
          </form>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!xoa}
        onClose={() => setXoa(null)}
        onConfirm={xacNhanXoa}
        title="Xóa quảng cáo"
        message={`Xóa quảng cáo "${xoa?.tieu_de}"?`}
        confirmText="Xóa"
      />
    </div>
  );
};

export default QuanLyUuDai;
