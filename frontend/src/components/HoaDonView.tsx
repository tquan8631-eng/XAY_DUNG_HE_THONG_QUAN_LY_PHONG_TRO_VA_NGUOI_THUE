import React from 'react';
import Badge from './common/Badge';
import { formatCurrency, formatDate, formatDateTime, formatThangNam, trangThaiHoaDon, phuongThucThanhToan } from '../utils/formatters';
import { useNhaTro } from '../hooks/useNhaTro';

const HoaDonView: React.FC<{ hoaDon: any }> = ({ hoaDon }) => {
  const nhaTro = useNhaTro();
  const status = trangThaiHoaDon(hoaDon.trang_thai);
  const conLai = Number(hoaDon.tong_tien) - Number(hoaDon.so_tien_da_tra || 0);

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm md:p-8 print-container">
        <div className="flex flex-col justify-between gap-4 pb-6 mb-6 border-b sm:flex-row sm:items-start">
          <div>
            <p className="text-sm font-semibold text-gray-500">{nhaTro.ten_nha_tro}</p>
            <p className="mb-3 text-xs text-gray-400">{nhaTro.dia_chi}</p>
            <h1 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">HÓA ĐƠN TIỀN PHÒNG</h1>
            <p className="text-gray-600">
              Mã hóa đơn: <span className="font-semibold text-gray-900">{hoaDon.ma_hoa_don}</span>
            </p>
            <p className="text-gray-600">
              Kỳ thanh toán: <span className="font-semibold text-gray-900">{formatThangNam(hoaDon.thang_nam)}</span>
            </p>
          </div>
          <div className="sm:text-right">
            <Badge text={status.label} color={status.color} />
            <p className="mt-2 text-sm text-gray-500">Ngày lập: {formatDate(hoaDon.ngay_tao)}</p>
            <p className={`text-sm ${hoaDon.trang_thai === 'qua_han' ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
              Hạn thanh toán: {formatDate(hoaDon.han_thanhtoan)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-500 uppercase">Phòng</h3>
            <p className="text-lg font-semibold text-gray-900">Phòng {hoaDon.so_phong}</p>
            {hoaDon.phong && (
              <p className="text-gray-600">
                Tầng {hoaDon.phong.tang} • {hoaDon.phong.dien_tich} m²
              </p>
            )}
            <p className="text-sm text-gray-500">Hợp đồng: {hoaDon.ma_hop_dong}</p>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-500 uppercase">Người thuê</h3>
            <p className="text-lg font-semibold text-gray-900">{hoaDon.ho_ten}</p>
            <p className="text-gray-600">{hoaDon.so_dien_thoai}</p>
          </div>
        </div>

        {hoaDon.chi_so && (
          <div className="grid grid-cols-1 gap-3 mb-6 text-sm sm:grid-cols-2">
            <div className="p-3 rounded-lg bg-amber-50">
              ⚡ Điện: {hoaDon.chi_so.chi_so_dien_cu} → {hoaDon.chi_so.chi_so_dien_moi} ={' '}
              <b>{hoaDon.chi_so.chi_so_dien_moi - hoaDon.chi_so.chi_so_dien_cu} kWh</b>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              💧 Nước: {hoaDon.chi_so.chi_so_nuoc_cu} → {hoaDon.chi_so.chi_so_nuoc_moi} ={' '}
              <b>{hoaDon.chi_so.chi_so_nuoc_moi - hoaDon.chi_so.chi_so_nuoc_cu} m³</b>
            </div>
          </div>
        )}

        <div className="mb-8 overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Khoản thu</th>
                <th className="px-4 py-3 text-xs font-medium text-right text-gray-500 uppercase">Đơn giá</th>
                <th className="px-4 py-3 text-xs font-medium text-right text-gray-500 uppercase">Số lượng</th>
                <th className="px-4 py-3 text-xs font-medium text-right text-gray-500 uppercase">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {hoaDon.chi_tiet?.map((item: any) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.ten_dich_vu}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-500">{formatCurrency(item.don_gia)}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-500">{Number(item.so_luong)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-right text-gray-900">{formatCurrency(item.thanh_tien)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-full space-y-3 sm:w-1/2">
            <div className="flex justify-between text-gray-600">
              <span>Tổng cộng:</span>
              <span className="font-semibold text-gray-900">{formatCurrency(hoaDon.tong_tien)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Đã thanh toán:</span>
              <span className="font-semibold text-green-600">{formatCurrency(hoaDon.so_tien_da_tra || 0)}</span>
            </div>
            <div className="flex justify-between pt-3 text-lg font-bold border-t">
              <span>Còn phải trả:</span>
              <span className={conLai > 0 ? 'text-red-600' : 'text-green-600'}>{formatCurrency(conLai)}</span>
            </div>
          </div>
        </div>
      </div>

      {hoaDon.lich_su_thanh_toan?.length > 0 && (
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hide-on-print">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Lịch sử thanh toán</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Thời gian</th>
                  <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Phương thức</th>
                  <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Mã GD</th>
                  <th className="px-4 py-3 text-xs font-medium text-right text-gray-500 uppercase">Số tiền</th>
                  <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {hoaDon.lich_su_thanh_toan.map((tt: any) => (
                  <tr key={tt.id}>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDateTime(tt.ngay_thanh_toan)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{phuongThucThanhToan(tt.phuong_thuc)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{tt.ma_giao_dich || '-'}</td>
                    <td className="px-4 py-3 text-sm font-medium text-right text-green-600">{formatCurrency(tt.so_tien)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{tt.ghi_chu || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          aside, header, .hide-on-print { display: none !important; }
          .print-container { border: none !important; box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
};

export default HoaDonView;
