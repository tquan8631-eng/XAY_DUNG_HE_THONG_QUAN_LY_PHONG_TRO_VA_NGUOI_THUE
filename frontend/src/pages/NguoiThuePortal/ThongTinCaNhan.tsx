import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DoiMatKhauForm from '../../components/common/DoiMatKhauForm';
import { PageHeader, Card, Field, InfoRow, inputCls, btn } from '../../components/common/ui';
import { formatDateTime, trangThaiNguoiThue } from '../../utils/formatters';
import Badge from '../../components/common/Badge';

const ThongTinCaNhan: React.FC = () => {
  const [info, setInfo] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const d = await api.portal.getThongTin();
      setInfo(d);
      setForm({
        so_dien_thoai: d.so_dien_thoai || '',
        email: d.email || '',
        ngay_sinh: d.ngay_sinh ? String(d.ngay_sinh).substring(0, 10) : '',
        gioi_tinh: d.gioi_tinh || 'nam',
        que_quan: d.que_quan || ''
      });
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.portal.updateThongTin(form);
      toast.success(res.message || 'Đã cập nhật');
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner /></div>;
  if (!info) return null;

  const st = trangThaiNguoiThue(info.trang_thai);
  const set = (k: string, v: string) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <PageHeader title="Thông tin cá nhân" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Hồ sơ" className="lg:col-span-1">
          <InfoRow label="Họ tên" value={info.ho_ten} />
          <InfoRow label="CCCD" value={info.can_cuoc_cong_dan} />
          <InfoRow label="Tạm trú" value={info.da_dang_ky_tam_tru ? 'Đã đăng ký' : 'Chưa đăng ký'} />
          <InfoRow label="Trạng thái" value={<Badge text={st.label} color={st.color} />} />
          <InfoRow label="Tên đăng nhập" value={info.ten_dang_nhap} />
          <InfoRow label="Đăng nhập gần nhất" value={formatDateTime(info.lan_dang_nhap_cuoi) || '-'} />
          <p className="mt-3 text-xs text-gray-500">Họ tên và CCCD do chủ nhà quản lý. Liên hệ chủ nhà nếu cần sửa.</p>
        </Card>

        <Card title="Cập nhật thông tin liên hệ" className="lg:col-span-2">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Số điện thoại" required>
                <input required className={inputCls} value={form.so_dien_thoai} onChange={(e) => set('so_dien_thoai', e.target.value)} />
              </Field>
              <Field label="Email">
                <input type="email" className={inputCls} value={form.email} onChange={(e) => set('email', e.target.value)} />
              </Field>
              <Field label="Ngày sinh">
                <input type="date" className={inputCls} value={form.ngay_sinh} onChange={(e) => set('ngay_sinh', e.target.value)} />
              </Field>
              <Field label="Giới tính">
                <select className={inputCls} value={form.gioi_tinh} onChange={(e) => set('gioi_tinh', e.target.value)}>
                  <option value="nam">Nam</option>
                  <option value="nu">Nữ</option>
                  <option value="khac">Khác</option>
                </select>
              </Field>
              <Field label="Quê quán" className="sm:col-span-2">
                <input className={inputCls} value={form.que_quan} onChange={(e) => set('que_quan', e.target.value)} />
              </Field>
            </div>
            <button type="submit" disabled={saving} className={`${btn.primary} !bg-teal-600 hover:!bg-teal-700`}>
              {saving ? 'Đang lưu...' : 'Lưu thông tin'}
            </button>
          </form>
        </Card>
      </div>

      <Card title="Đổi mật khẩu">
        <DoiMatKhauForm />
      </Card>
    </div>
  );
};

export default ThongTinCaNhan;
