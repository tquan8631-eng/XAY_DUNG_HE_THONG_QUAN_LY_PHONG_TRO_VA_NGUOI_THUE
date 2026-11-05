import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  FileText,
  AlertCircle,
  Wallet,
  DoorOpen,
  CheckCircle,
  Clock
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import { dashboardApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate, formatThangNam } from '../utils/formatters';
import StatCard from '../components/common/StatCard';
import DataTable from '../components/common/DataTable';
import LoadingSpinner from '../components/common/LoadingSpinner';

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6B7280'];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [thongKe, setThongKe] = useState<any>(null);
  const [doanhThu, setDoanhThu] = useState<any[]>([]);
  const [hoaDonChuaTT, setHoaDonChuaTT] = useState<any[]>([]);
  const [hopDongSapHet, setHopDongSapHet] = useState<any[]>([]);
  const [suCoMoi, setSuCoMoi] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [
        thongKeResponse,
        doanhThuResponse,
        hoaDonResponse,
        hopDongResponse,
        suCoResponse
      ] = await Promise.all([
        dashboardApi.getThongKe(),
        dashboardApi.getDoanhThu(),
        dashboardApi.getHoaDonChuaTT(),
        dashboardApi.getHopDongSapHet(),
        dashboardApi.getSuCoMoi()
      ]);

      const thongKeData = thongKeResponse;
      const doanhThuData = doanhThuResponse;
      const hoaDonData = hoaDonResponse;
      const hopDongData = hopDongResponse;
      const suCoData = suCoResponse;

      setThongKe(thongKeData || null);
      setDoanhThu(Array.isArray(doanhThuData) ? doanhThuData : []);
      setHoaDonChuaTT(Array.isArray(hoaDonData) ? hoaDonData : []);
      setHopDongSapHet(Array.isArray(hopDongData) ? hopDongData : []);
      setSuCoMoi(Array.isArray(suCoData) ? suCoData : []);
    } catch (error) {
      console.error('Lỗi tải dữ liệu Tổng quan:', error);

      setThongKe(null);
      setDoanhThu([]);
      setHoaDonChuaTT([]);
      setHopDongSapHet([]);
      setSuCoMoi([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const phongTro = Array.isArray(thongKe?.phong_tro)
    ? thongKe.phong_tro
    : [];

  const phongDangThue =
    Number(
      phongTro.find((item: any) => item.trang_thai === 'da_thue')?.count
    ) || 0;

  const phongTrong =
    Number(
      phongTro.find((item: any) => item.trang_thai === 'trong')?.count
    ) || 0;

  const phongBaoTri =
    Number(
      phongTro.find(
        (item: any) => item.trang_thai === 'dang_bao_tri'
      )?.count
    ) || 0;

  const phongDatCoc =
    Number(
      phongTro.find((item: any) => item.trang_thai === 'da_coc')?.count
    ) || 0;

  const tongPhong = phongTro.reduce(
    (total: number, item: any) => total + Number(item.count || 0),
    0
  );

  const tongNguoiThue = Number(thongKe?.nguoi_thue_active) || 0;
  const hopDongHoatDong = Number(thongKe?.hop_dong_active) || 0;
  const hoaDonChuaThanhToan =
    Number(thongKe?.hoa_don_chua_tt) || 0;
  const doanhThuThangNay =
    Number(thongKe?.doanh_thu_thang_nay) || 0;

  const phongData = [
    {
      name: 'Đang thuê',
      value: phongDangThue
    },
    {
      name: 'Trống',
      value: phongTrong
    },
    {
      name: 'Đang bảo trì',
      value: phongBaoTri
    },
    {
      name: 'Đã cọc',
      value: phongDatCoc
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Tổng Quan
        </h1>
      </div>

      {Number(thongKe?.khach_xem_phong_moi) > 0 && (
        <button
          onClick={() => navigate('/khach-xem-phong')}
          className="flex items-center justify-between w-full p-4 text-left border rounded-xl bg-violet-50 border-violet-200 hover:bg-violet-100"
        >
          <span className="text-sm text-violet-900">
            📩 Có <b>{thongKe.khach_xem_phong_moi} khách mới</b> đăng ký xem phòng (qua trang giới thiệu / chatbot 24/7) chưa được liên hệ.
          </span>
          <span className="text-sm font-medium text-violet-700 whitespace-nowrap">Xem ngay →</span>
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng phòng"
          value={tongPhong}
          icon={<Building2 className="text-indigo-600" />}
          color="bg-indigo-100"
        />

        <StatCard
          title="Đang thuê"
          value={phongDangThue}
          icon={<CheckCircle className="text-emerald-600" />}
          color="bg-emerald-100"
        />

        <StatCard
          title="Phòng trống"
          value={phongTrong}
          icon={<DoorOpen className="text-amber-600" />}
          color="bg-amber-100"
        />

        <StatCard
          title="Người thuê"
          value={tongNguoiThue}
          icon={<Users className="text-blue-600" />}
          color="bg-blue-100"
        />

        <StatCard
          title="Hợp đồng active"
          value={hopDongHoatDong}
          icon={<FileText className="text-purple-600" />}
          color="bg-purple-100"
        />

        <StatCard
          title="HĐ sắp hết hạn"
          value={Number(thongKe?.hop_dong_sap_het ?? hopDongSapHet.length)}
          icon={<Clock className="text-orange-600" />}
          color="bg-orange-100"
        />

        <StatCard
          title="Hóa đơn chưa TT"
          value={hoaDonChuaThanhToan}
          subtitle={`Công nợ: ${formatCurrency(thongKe?.cong_no || 0)}`}
          icon={<AlertCircle className="text-red-600" />}
          color="bg-red-100"
        />

        <StatCard
          title="Doanh thu tháng này"
          value={formatCurrency(doanhThuThangNay)}
          icon={<Wallet className="text-green-600" />}
          color="bg-green-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Doanh thu theo tháng (năm nay)
          </h2>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={doanhThu}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="thang"
                  tickFormatter={(value) => `T${value}`}
                />

                <YAxis
                  tickFormatter={(value) =>
                    `${Number(value) / 1000000}M`
                  }
                />

                <Tooltip
                  formatter={(value) =>
                    formatCurrency(Number(value))
                  }
                />

                <Legend />

                <Bar
                  dataKey="doanh_thu"
                  name="Doanh thu"
                  fill="#4f46e5"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Tình trạng phòng
          </h2>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={phongData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
>
                  {phongData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Hóa đơn chưa thanh toán
          </h2>

          <DataTable
            columns={[
              {
                key: 'so_phong',
                label: 'Phòng',
                render: (row: any) => row.so_phong || '-'
              },
              {
                key: 'thang_nam',
                label: 'Kỳ',
                render: (row: any) => formatThangNam(row.thang_nam, true)
              },
              {
                key: 'tong_tien',
                label: 'Còn nợ',
                render: (row: any) =>
                  formatCurrency(Number(row.tong_tien || 0) - Number(row.so_tien_da_tra || 0))
              }
            ]}
            data={hoaDonChuaTT}
            loading={false}
            emptyMessage="Không có hóa đơn nợ"
            onRowClick={(row: any) => navigate(`/hoa-don/${row.id}`)}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            HĐ sắp hết hạn
          </h2>

          <DataTable
            columns={[
              {
                key: 'so_phong',
                label: 'Phòng',
                render: (row: any) => row.so_phong || '-'
              },
              {
                key: 'ngay_ket_thuc',
                label: 'Ngày hết hạn',
                render: (row: any) =>
                  row.ngay_ket_thuc
                    ? formatDate(row.ngay_ket_thuc)
                    : '-'
              }
            ]}
            data={hopDongSapHet}
            loading={false}
            emptyMessage="Không có hợp đồng sắp hết hạn"
            onRowClick={(row: any) => navigate(`/hop-dong/${row.id}`)}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Sự cố mới
          </h2>

          <DataTable
            columns={[
              {
                key: 'so_phong',
                label: 'Phòng',
                render: (row: any) => row.so_phong || '-'
              },
              {
                key: 'tieu_de',
                label: 'Tiêu đề',
                render: (row: any) => row.tieu_de || '-'
              }
            ]}
            data={suCoMoi}
            loading={false}
            emptyMessage="Không có sự cố mới"
            onRowClick={() => navigate('/su-co')}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
