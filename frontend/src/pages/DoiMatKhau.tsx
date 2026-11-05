import React from 'react';
import { PageHeader, Card } from '../components/common/ui';
import DoiMatKhauForm from '../components/common/DoiMatKhauForm';
import { useAuth } from '../hooks/useAuth';
import { vaiTro } from '../utils/formatters';

const DoiMatKhau: React.FC = () => {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <PageHeader title="Đổi mật khẩu" subtitle={`Tài khoản: ${user?.ten_dang_nhap} (${vaiTro(user?.vai_tro || '').label})`} />
      <Card>
        <DoiMatKhauForm />
      </Card>
    </div>
  );
};

export default DoiMatKhau;
