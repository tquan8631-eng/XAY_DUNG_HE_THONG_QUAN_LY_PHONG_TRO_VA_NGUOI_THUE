import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Printer, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import HoaDonView from '../../components/HoaDonView';
import { Card, InfoRow, btn } from '../../components/common/ui';
import { formatCurrency } from '../../utils/formatters';
import { useNhaTro } from '../../hooks/useNhaTro';

const copy = (text: string) => {
  navigator.clipboard?.writeText(text);
  toast.success('Đã sao chép');
};

const ChiTietHoaDonCuaToi: React.FC = () => {
  const nhaTro = useNhaTro();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hoaDon, setHoaDon] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.portal
      .getHoaDonById(Number(id))
      .then(setHoaDon)
      .catch((e) => {
        toast.error(getErrorMessage(e));
        navigate('/cua-toi/hoa-don');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner /></div>;
  if (!hoaDon) return null;

  const conLai = Number(hoaDon.tong_tien) - Number(hoaDon.so_tien_da_tra || 0);
  const noiDungCK = `${hoaDon.ma_hoa_don} PHONG ${hoaDon.so_phong}`;
  const ck = nhaTro;
  const qrUrl = ck.so_tai_khoan
    ? `https://img.vietqr.io/image/${ck.ma_ngan_hang}-${ck.so_tai_khoan}-compact2.png?amount=${conLai}&addInfo=${encodeURIComponent(noiDungCK)}&accountName=${encodeURIComponent(ck.chu_tai_khoan)}`
    : '';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between hide-on-print">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <button onClick={() => navigate('/cua-toi/hoa-don')} className="flex items-center hover:text-teal-600">
            <ArrowLeft className="w-4 h-4 mr-1" /> Hóa đơn
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="font-medium text-gray-900">{hoaDon.ma_hoa_don}</span>
        </div>
        <button onClick={() => window.print()} className={btn.secondary}>
          <Printer size={16} /> In / Lưu PDF
        </button>
      </div>

      {conLai > 0 && (
        <div className="hide-on-print">
          <Card title="Hướng dẫn thanh toán">
            <div className="flex flex-col gap-6 md:flex-row">
              {qrUrl && (
                <div className="flex flex-col items-center shrink-0">
                  <img src={qrUrl} alt="Mã QR chuyển khoản" className="w-56 h-auto border rounded-lg" />
                  <p className="mt-1 text-xs text-gray-500">Quét mã bằng app ngân hàng</p>
                </div>
              )}
              <div className="flex-1">
                <InfoRow label="Số tiền cần thanh toán" value={<span className="text-lg text-red-600">{formatCurrency(conLai)}</span>} />
                <InfoRow label="Ngân hàng" value={ck.ngan_hang} />
                <InfoRow
                  label="Số tài khoản"
                  value={
                    ck.so_tai_khoan ? (
                      <button className="inline-flex items-center gap-1 hover:text-teal-700" onClick={() => copy(ck.so_tai_khoan)}>
                        {ck.so_tai_khoan} <Copy size={14} />
                      </button>
                    ) : (
                      'Liên hệ chủ nhà'
                    )
                  }
                />
                <InfoRow label="Chủ tài khoản" value={ck.chu_tai_khoan} />
                <InfoRow
                  label="Nội dung chuyển khoản"
                  value={
                    <button className="inline-flex items-center gap-1 hover:text-teal-700" onClick={() => copy(noiDungCK)}>
                      {noiDungCK} <Copy size={14} />
                    </button>
                  }
                />
                <p className="mt-3 text-xs text-gray-500">
                  Sau khi chuyển khoản hoặc đóng tiền mặt, chủ nhà sẽ xác nhận và trạng thái hóa đơn sẽ được cập nhật. Liên hệ: {ck.so_dien_thoai}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <HoaDonView hoaDon={hoaDon} />
    </div>
  );
};

export default ChiTietHoaDonCuaToi;
