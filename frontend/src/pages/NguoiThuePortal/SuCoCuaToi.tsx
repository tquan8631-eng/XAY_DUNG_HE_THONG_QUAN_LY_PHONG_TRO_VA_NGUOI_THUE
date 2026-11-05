import React, { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { PageHeader, Field, inputCls, btn, FormActions } from '../../components/common/ui';
import { formatDateTime, mucDoUuTien, trangThaiSuCo, MUC_DO_OPTIONS } from '../../utils/formatters';

const emptyForm = { tieu_de: '', mo_ta: '', muc_do_uu_tien: 'trung_binh' };

const GOI_Y = ['Hỏng bóng đèn', 'Vòi nước rò rỉ', 'Máy lạnh không mát', 'Tắc bồn cầu', 'Mất điện', 'Hỏng khóa cửa'];

const SuCoCuaToi: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [huyId, setHuyId] = useState<number | null>(null);

  const fetchData = () => {
    setLoading(true);
    api.portal
      .getSuCo()
      .then(setData)
      .catch((e) => toast.error(getErrorMessage(e)))
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.portal.createSuCo(form);
      toast.success(res.message || 'Đã gửi báo cáo sự cố');
      setOpen(false);
      setForm(emptyForm);
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const huy = async () => {
    if (!huyId) return;
    try {
      await api.portal.huySuCo(huyId);
      toast.success('Đã hủy báo cáo');
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setHuyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Báo sự cố"
        subtitle="Báo hỏng hóc trong phòng để chủ nhà xử lý"
        actions={
          <button className={`${btn.primary} !bg-teal-600 hover:!bg-teal-700`} onClick={() => setOpen(true)}>
            <Plus size={18} /> Báo sự cố mới
          </button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-10"><LoadingSpinner /></div>
      ) : data.length === 0 ? (
        <EmptyState title="Chưa có sự cố nào" description="Khi có hỏng hóc trong phòng, hãy bấm “Báo sự cố mới”." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {data.map((s) => {
            const st = trangThaiSuCo(s.trang_thai);
            const md = mucDoUuTien(s.muc_do_uu_tien);
            return (
              <div key={s.id} className="p-5 bg-white border border-gray-200 shadow-sm rounded-xl">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900">{s.tieu_de}</h3>
                  <Badge text={st.label} color={st.color} />
                </div>
                {s.mo_ta && <p className="mt-2 text-sm text-gray-600 whitespace-pre-line">{s.mo_ta}</p>}
                <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-gray-500">
                  <Badge text={md.label} color={md.color} />
                  <span>Phòng {s.so_phong}</span>
                  <span>•</span>
                  <span>{s.cua_toi ? 'Bạn báo' : `${s.nguoi_bao} báo`}</span>
                  <span>•</span>
                  <span>{formatDateTime(s.ngay_tao)}</span>
                </div>
                {!!s.cua_toi && s.trang_thai === 'cho_xuly' && (
                  <button onClick={() => setHuyId(s.id)} className="inline-flex items-center gap-1 mt-3 text-xs text-red-600 hover:underline">
                    <X size={14} /> Hủy báo cáo
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Báo sự cố mới">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Tiêu đề" required>
            <input required className={inputCls} value={form.tieu_de} onChange={(e) => setForm({ ...form, tieu_de: e.target.value })} placeholder="VD: Vòi nước nhà tắm bị rò rỉ" />
            <div className="flex flex-wrap gap-1 mt-2">
              {GOI_Y.map((g) => (
                <button type="button" key={g} onClick={() => setForm({ ...form, tieu_de: g })} className="px-2 py-0.5 text-xs border rounded-full hover:bg-gray-50">
                  {g}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Mô tả chi tiết">
            <textarea rows={4} className={inputCls} value={form.mo_ta} onChange={(e) => setForm({ ...form, mo_ta: e.target.value })} placeholder="Mô tả vị trí, tình trạng, thời gian thuận tiện để sửa..." />
          </Field>
          <Field label="Mức độ">
            <select className={inputCls} value={form.muc_do_uu_tien} onChange={(e) => setForm({ ...form, muc_do_uu_tien: e.target.value })}>
              {MUC_DO_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <FormActions onCancel={() => setOpen(false)} loading={saving} submitText="Gửi báo cáo" />
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!huyId} title="Hủy báo cáo sự cố" message="Bạn có chắc muốn hủy báo cáo này?" onConfirm={huy} onCancel={() => setHuyId(null)} />
    </div>
  );
};

export default SuCoCuaToi;
