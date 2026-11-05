import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Printer, CreditCard, CalendarClock, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../services/api';
import { formatCurrency, PHUONG_THUC_OPTIONS } from '../../utils/formatters';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import HoaDonView from '../../components/HoaDonView';
import { btn, Field, inputCls, FormActions } from '../../components/common/ui';
import { useAuth } from '../../hooks/useAuth';

const ChiTietHoaDon: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hoaDon, setHoaDon] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [payOpen, setPayOpen] = useState(false);
  const [payment, setPayment] = useState({ so_tien: '', phuong_thuc: 'tien_mat', ma_giao_dich: '', ghi_chu: '' });
  const [hanOpen, setHanOpen] = useState(false);
  const [hanMoi, setHanMoi] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await api.hoaDon.getById(Number(id));
      setHoaDon(data);
      setHanMoi(String(data.han_thanhtoan).substring(0, 10));
      setPayment((p) => ({ ...p, so_tien: String(Number(data.tong_tien) - Number(data.so_tien_da_tra || 0)) }));
    } catch (error) {
      toast.error(getErrorMessage(error, 'Lỗi khi tải hóa đơn'));
      navigate('/hoa-don');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.thanhToan.create({ hoa_don_id: Number(id), ...payment, so_tien: Number(payment.so_tien) });
      toast.success('Ghi nhận thanh toán thành công');
      setPayOpen(false);
      setPayment({ so_tien: '', phuong_thuc: 'tien_mat', ma_giao_dich: '', ghi_chu: '' });
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const giaHan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.hoaDon.update(Number(id), { han_thanhtoan: hanMoi });
      toast.success('Đã cập nhật hạn thanh toán');
      setHanOpen(false);
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const xoa = async () => {
    try {
      await api.hoaDon.delete(Number(id));
      toast.success('Đã xóa hóa đơn');
      navigate('/hoa-don');
    } catch (error) {
      toast.error(getErrorMessage(error));
      setConfirmDelete(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner /></div>;
  if (!hoaDon) return null;

  const conLai = Number(hoaDon.tong_tien) - Number(hoaDon.so_tien_da_tra || 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center hide-on-print">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <button onClick={() => navigate('/hoa-don')} className="flex items-center hover:text-indigo-600">
            <ArrowLeft className="w-4 h-4 mr-1" /> Hóa đơn
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="font-medium text-gray-900">{hoaDon.ma_hoa_don}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => window.print()} className={btn.secondary}>
            <Printer size={16} /> In hóa đơn
          </button>
          {conLai > 0 && (
            <>
              <button onClick={() => setHanOpen(true)} className={btn.secondary}>
                <CalendarClock size={16} /> Gia hạn
              </button>
              <button onClick={() => setPayOpen(true)} className={btn.primary}>
                <CreditCard size={16} /> Ghi nhận thanh toán
              </button>
            </>
          )}
          {user?.vai_tro === 'chu_nha' && Number(hoaDon.so_tien_da_tra) === 0 && (
            <button onClick={() => setConfirmDelete(true)} className={`${btn.secondary} text-red-600`}>
              <Trash2 size={16} /> Xóa
            </button>
          )}
        </div>
      </div>

      <HoaDonView hoaDon={hoaDon} />

      <Modal isOpen={payOpen} onClose={() => setPayOpen(false)} title="Ghi nhận thanh toán">
        <form onSubmit={handlePayment} className="space-y-4">
          <Field label="Số tiền thanh toán (VNĐ)" required hint={`Còn phải trả: ${formatCurrency(conLai)}`}>
            <input type="number" required min={1} max={conLai} className={inputCls} value={payment.so_tien} onChange={(e) => setPayment({ ...payment, so_tien: e.target.value })} />
          </Field>
          <Field label="Phương thức" required>
            <select className={inputCls} value={payment.phuong_thuc} onChange={(e) => setPayment({ ...payment, phuong_thuc: e.target.value })}>
              {PHUONG_THUC_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          {payment.phuong_thuc !== 'tien_mat' && (
            <Field label="Mã giao dịch">
              <input className={inputCls} value={payment.ma_giao_dich} onChange={(e) => setPayment({ ...payment, ma_giao_dich: e.target.value })} />
            </Field>
          )}
          <Field label="Ghi chú">
            <textarea rows={2} className={inputCls} value={payment.ghi_chu} onChange={(e) => setPayment({ ...payment, ghi_chu: e.target.value })} />
          </Field>
          <FormActions onCancel={() => setPayOpen(false)} loading={saving} submitText="Xác nhận thanh toán" />
        </form>
      </Modal>

      <Modal isOpen={hanOpen} onClose={() => setHanOpen(false)} title="Gia hạn thanh toán">
        <form onSubmit={giaHan} className="space-y-4">
          <Field label="Hạn thanh toán mới" required>
            <input type="date" required className={inputCls} value={hanMoi} onChange={(e) => setHanMoi(e.target.value)} />
          </Field>
          <FormActions onCancel={() => setHanOpen(false)} loading={saving} />
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDelete}
        title="Xóa hóa đơn"
        message="Bạn có chắc muốn xóa hóa đơn này? Có thể tạo lại sau khi sửa chỉ số / dịch vụ."
        onConfirm={xoa}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
};

export default ChiTietHoaDon;
