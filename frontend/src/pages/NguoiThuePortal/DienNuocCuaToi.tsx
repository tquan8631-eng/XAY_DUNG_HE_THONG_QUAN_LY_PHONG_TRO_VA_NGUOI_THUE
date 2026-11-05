import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import api, { getErrorMessage } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import { PageHeader, Card } from '../../components/common/ui';
import { formatDate, formatThangNam } from '../../utils/formatters';

const DienNuocCuaToi: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.portal
      .getChiSo()
      .then(setData)
      .catch((e) => toast.error(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  const chart = [...data]
    .reverse()
    .slice(-12)
    .map((c) => ({ thang: formatThangNam(c.thang_nam, true), dien: Number(c.dien_tieu_thu), nuoc: Number(c.nuoc_tieu_thu) }));

  const columns = [
    { key: 'thang_nam', label: 'Kỳ', render: (r: any) => <span className="font-medium">{formatThangNam(r.thang_nam, true)}</span> },
    { key: 'so_phong', label: 'Phòng' },
    { key: 'dien', label: 'Điện (cũ → mới)', render: (r: any) => `${r.chi_so_dien_cu} → ${r.chi_so_dien_moi}` },
    { key: 'dien_tieu_thu', label: 'Điện tiêu thụ', render: (r: any) => <b className="text-amber-600">{r.dien_tieu_thu} kWh</b> },
    { key: 'nuoc', label: 'Nước (cũ → mới)', render: (r: any) => `${r.chi_so_nuoc_cu} → ${r.chi_so_nuoc_moi}` },
    { key: 'nuoc_tieu_thu', label: 'Nước tiêu thụ', render: (r: any) => <b className="text-blue-600">{r.nuoc_tieu_thu} m³</b> },
    { key: 'ngay_ghi', label: 'Ngày ghi', render: (r: any) => formatDate(r.ngay_ghi) }
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Chỉ số điện nước" subtitle="Chỉ số được chủ nhà ghi hàng tháng, dùng để tính hóa đơn" />
      {chart.length > 1 && (
        <Card title="Xu hướng tiêu thụ">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="thang" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="dien" name="Điện (kWh)" stroke="#f59e0b" strokeWidth={2} />
                <Line type="monotone" dataKey="nuoc" name="Nước (m³)" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
      <DataTable columns={columns} data={data} loading={loading} emptyMessage="Chưa có chỉ số nào" />
    </div>
  );
};

export default DienNuocCuaToi;
