import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { authApi, getErrorMessage } from '../../services/api';
import { Field, inputCls, btn } from './ui';

const DoiMatKhauForm: React.FC = () => {
  const [form, setForm] = useState({ mat_khau_cu: '', mat_khau_moi: '', xac_nhan: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.mat_khau_moi.length < 6) return toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
    if (form.mat_khau_moi !== form.xac_nhan) return toast.error('Xác nhận mật khẩu không khớp');
    if (form.mat_khau_moi === form.mat_khau_cu) return toast.error('Mật khẩu mới phải khác mật khẩu cũ');
    try {
      setLoading(true);
      const res = await authApi.changePassword({ mat_khau_cu: form.mat_khau_cu, mat_khau_moi: form.mat_khau_moi });
      toast.success(res.message || 'Đổi mật khẩu thành công');
      setForm({ mat_khau_cu: '', mat_khau_moi: '', xac_nhan: '' });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 max-w-md">
      <Field label="Mật khẩu hiện tại" required>
        <input type="password" required className={inputCls} value={form.mat_khau_cu} onChange={(e) => setForm({ ...form, mat_khau_cu: e.target.value })} autoComplete="current-password" />
      </Field>
      <Field label="Mật khẩu mới" required hint="Tối thiểu 6 ký tự">
        <input type="password" required className={inputCls} value={form.mat_khau_moi} onChange={(e) => setForm({ ...form, mat_khau_moi: e.target.value })} autoComplete="new-password" />
      </Field>
      <Field label="Nhập lại mật khẩu mới" required>
        <input type="password" required className={inputCls} value={form.xac_nhan} onChange={(e) => setForm({ ...form, xac_nhan: e.target.value })} autoComplete="new-password" />
      </Field>
      <button type="submit" disabled={loading} className={btn.primary}>
        {loading ? 'Đang lưu...' : 'Đổi mật khẩu'}
      </button>
    </form>
  );
};

export default DoiMatKhauForm;
