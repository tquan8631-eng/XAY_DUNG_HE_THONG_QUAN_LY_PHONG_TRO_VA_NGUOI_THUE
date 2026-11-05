import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Edit, UserPlus, Trash2, Receipt, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../services/api';
import {
  formatCurrency, formatDate, formatThangNam, trangThaiHopDong, trangThaiTienCoc, trangThaiHoaDon
} from '../../utils/formatters';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Card, InfoRow, btn, Field, inputCls, FormActions, ngayHomNay, thangNamHienTai } from '../../components/common/ui';
import { HopDongForm } from './DanhSachHopDong';

const ChiTietHopDong: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hopDong, setHopDong] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const [themTvOpen, setThemTvOpen] = useState(false);
  const [nguoiThueList, setNguoiThueList] = useState<any[]>([]);
  const [tvForm, setTvForm] = useState({ nguoi_thue_id: '', ngay_vao_o: ngayHomNay() });
  const [xoaTvId, setXoaTvId] = useState<number | null>(null);

  const [hoaDonOpen, setHoaDonOpen] = useState(false);
  const [hdForm, setHdForm] = useState({ thang_nam: thangNamHienTai(), han_thanhtoan: ngayHomNay(7) });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setHopDong(await api.hopDong.getById(Number(id)));
    } catch (error) {
      toast.error(getErrorMessage(error, 'Lỗi khi tải thông tin hợp đồng'));
      navigate('/hop-dong');
    } finally {
      setLoading(false);
    }
  };

  const moThemThanhVien = async () => {
    try {
      const res = await api.nguoiThue.getAll({ limit: 1000 });
      const idsTrongHd = new Set(hopDong.thanh_vien.map((t: any) => t.nguoi_thue_id));
      setNguoiThueList(res.data.filter((n: any) => !idsTrongHd.has(n.id) && !n.so_phong));
      setTvForm({ nguoi_thue_id: '', ngay_vao_o: ngayHomNay() });
      setThemTvOpen(true);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const themThanhVien = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.thanhVienPhong.create({ hop_dong_id: Number(id), nguoi_thue_id: Number(tvForm.nguoi_thue_id), ngay_vao_o: tvForm.ngay_vao_o });
      toast.success('Đã thêm thành viên vào phòng');
      setThemTvOpen(false);
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const xoaThanhVien = async () => {
    if (!xoaTvId) return;
    try {
      await api.thanhVienPhong.delete(xoaTvId);
      toast.success('Đã xóa thành viên khỏi phòng');
      fetchData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setXoaTvId(null);
    }
  };

  const taoHoaDon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.hoaDon.createTuDong({ hop_dong_id: Number(id), ...hdForm });
      toast.success('Tạo hóa đơn thành công');
      setHoaDonOpen(false);
      navigate(`/hoa-don/${res.data.id}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner /></div>;
  if (!hopDong) return null;

  const st = trangThaiHopDong(hopDong.trang_thai);
  const coc = trangThaiTienCoc(hopDong.trang_thai_tien_coc);
  const conHan = hopDong.trang_thai === 'con_han';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between hide-on-print">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <button onClick={() => navigate('/hop-dong')} className="flex items-center hover:text-indigo-600">
            <ArrowLeft className="w-4 h-4 mr-1" /> Hợp đồng
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="font-medium text-gray-900">{hopDong.ma_hop_dong}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={btn.secondary} onClick={() => window.print()}>
            <Printer size={16} /> In
          </button>
          {conHan && (
            <button className={btn.success} onClick={() => setHoaDonOpen(true)}>
              <Receipt size={16} /> Tạo hóa đơn
            </button>
          )}
          <button className={btn.primary} onClick={() => setEditOpen(true)}>
            <Edit size={16} /> Sửa / Kết thúc HĐ
          </button>
        </div>
      </div>

      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm print-container">
        <div className="flex items-start justify-between pb-4 mb-4 border-b">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hợp đồng {hopDong.ma_hop_dong}</h1>
            <p className="mt-1 text-gray-500">
              Phòng{' '}
              <Link to={`/phong-tro/${hopDong.phong_id}`} className="font-medium text-indigo-600 hover:underline">
                {hopDong.so_phong}
              </Link>{' '}
              • Tầng {hopDong.tang} • {hopDong.dien_tich} m²
            </p>
          </div>
          <div className="text-right">
            <Badge text={st.label} color={st.color} />
            {conHan && (
              <p className={`mt-2 text-sm ${hopDong.so_ngay_con_lai <= 30 ? 'text-amber-600 font-medium' : 'text-gray-500'}`}>
                {hopDong.so_ngay_con_lai >= 0 ? `Còn ${hopDong.so_ngay_con_lai} ngày` : `Quá hạn ${-hopDong.so_ngay_con_lai} ngày`}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-500 uppercase">Thông tin hợp đồng</h3>
            <InfoRow label="Ngày bắt đầu" value={formatDate(hopDong.ngay_bat_dau)} />
            <InfoRow label="Ngày kết thúc" value={formatDate(hopDong.ngay_ket_thuc)} />
            <InfoRow label="Giá thuê" value={formatCurrency(hopDong.gia_thue)} />
            <InfoRow label="Tiền cọc" value={formatCurrency(hopDong.tien_coc)} />
            <InfoRow label="Trạng thái tiền cọc" value={<Badge text={coc.label} color={coc.color} />} />
            <InfoRow label="Ngày chốt tiền hàng tháng" value={`Ngày ${hopDong.ngay_chot_tien_hang_thang}`} />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-500 uppercase">Người đứng tên</h3>
            <InfoRow
              label="Họ tên"
              value={
                <Link to={`/nguoi-thue/${hopDong.chu_hop_dong_id}`} className="text-indigo-600 hover:underline">
                  {hopDong.chu_hop_dong?.ho_ten}
                </Link>
              }
            />
            <InfoRow label="Số điện thoại" value={hopDong.chu_hop_dong?.so_dien_thoai} />
            <InfoRow label="CCCD" value={hopDong.chu_hop_dong?.cccd} />
            <InfoRow label="Email" value={hopDong.chu_hop_dong?.email || '-'} />
          </div>
        </div>
      </div>

      <Card
        title={`Thành viên phòng (${hopDong.thanh_vien?.length || 0}/${hopDong.so_nguoi_toi_da})`}
        actions={
          conHan && hopDong.thanh_vien?.length < hopDong.so_nguoi_toi_da ? (
            <button className={btn.secondary} onClick={moThemThanhVien}>
              <UserPlus size={16} /> Thêm người ở ghép
            </button>
          ) : undefined
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-600 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Họ tên</th>
                <th className="px-4 py-3 text-left">SĐT</th>
                <th className="px-4 py-3 text-left">CCCD</th>
                <th className="px-4 py-3 text-left">Vai trò</th>
                <th className="px-4 py-3 text-left">Ngày vào ở</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {hopDong.thanh_vien?.map((tv: any) => (
                <tr key={tv.id}>
                  <td className="px-4 py-3 font-medium">
                    <Link to={`/nguoi-thue/${tv.nguoi_thue_id}`} className="hover:text-indigo-600">{tv.ho_ten}</Link>
                  </td>
                  <td className="px-4 py-3">{tv.so_dien_thoai}</td>
                  <td className="px-4 py-3">{tv.can_cuoc_cong_dan}</td>
                  <td className="px-4 py-3">
                    {tv.la_chu_hop_dong ? <Badge text="Đứng tên" color="bg-indigo-100 text-indigo-800" /> : 'Ở ghép'}
                  </td>
                  <td className="px-4 py-3">{formatDate(tv.ngay_vao_o)}</td>
                  <td className="px-4 py-3 text-right">
                    {!tv.la_chu_hop_dong && conHan && (
                      <button className="text-red-600 hover:text-red-800" title="Xóa khỏi phòng" onClick={() => setXoaTvId(tv.id)}>
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Hóa đơn của hợp đồng">
        {hopDong.hoa_don?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-600 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Mã hóa đơn</th>
                  <th className="px-4 py-3 text-left">Kỳ</th>
                  <th className="px-4 py-3 text-right">Tổng tiền</th>
                  <th className="px-4 py-3 text-right">Đã trả</th>
                  <th className="px-4 py-3 text-left">Hạn TT</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {hopDong.hoa_don.map((h: any) => {
                  const s = trangThaiHoaDon(h.trang_thai);
                  return (
                    <tr key={h.id} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/hoa-don/${h.id}`)}>
                      <td className="px-4 py-3 font-medium text-indigo-600">{h.ma_hoa_don}</td>
                      <td className="px-4 py-3">{formatThangNam(h.thang_nam, true)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(h.tong_tien)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(h.so_tien_da_tra)}</td>
                      <td className="px-4 py-3">{formatDate(h.han_thanhtoan)}</td>
                      <td className="px-4 py-3"><Badge text={s.label} color={s.color} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-6 text-center text-gray-500">Chưa có hóa đơn</p>
        )}
      </Card>

      {editOpen && (
        <HopDongForm
          editing={hopDong}
          onClose={() => setEditOpen(false)}
          onSaved={() => {
            setEditOpen(false);
            fetchData();
          }}
        />
      )}

      <Modal isOpen={themTvOpen} onClose={() => setThemTvOpen(false)} title="Thêm người ở ghép">
        <form onSubmit={themThanhVien} className="space-y-4">
          <Field label="Người thuê" required hint="Chỉ hiển thị người chưa ở phòng nào. Thêm hồ sơ mới ở mục Người thuê nếu chưa có.">
            <select required className={inputCls} value={tvForm.nguoi_thue_id} onChange={(e) => setTvForm({ ...tvForm, nguoi_thue_id: e.target.value })}>
              <option value="">-- Chọn người thuê --</option>
              {nguoiThueList.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.ho_ten} – {n.so_dien_thoai}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Ngày vào ở" required>
            <input type="date" required className={inputCls} value={tvForm.ngay_vao_o} onChange={(e) => setTvForm({ ...tvForm, ngay_vao_o: e.target.value })} />
          </Field>
          <FormActions onCancel={() => setThemTvOpen(false)} loading={saving} submitText="Thêm vào phòng" />
        </form>
      </Modal>

      <Modal isOpen={hoaDonOpen} onClose={() => setHoaDonOpen(false)} title={`Tạo hóa đơn – Phòng ${hopDong.so_phong}`}>
        <form onSubmit={taoHoaDon} className="space-y-4">
          <Field label="Kỳ hóa đơn" required>
            <input type="month" required className={inputCls} value={hdForm.thang_nam} onChange={(e) => setHdForm({ ...hdForm, thang_nam: e.target.value })} />
          </Field>
          <Field label="Hạn thanh toán" required>
            <input type="date" required className={inputCls} value={hdForm.han_thanhtoan} onChange={(e) => setHdForm({ ...hdForm, han_thanhtoan: e.target.value })} />
          </Field>
          <p className="p-3 text-sm text-blue-800 rounded-lg bg-blue-50">
            Hệ thống tự tính tiền phòng + điện nước (theo chỉ số đã ghi của kỳ) + các dịch vụ của phòng.
          </p>
          <FormActions onCancel={() => setHoaDonOpen(false)} loading={saving} submitText="Tạo hóa đơn" />
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!xoaTvId}
        title="Xóa thành viên khỏi phòng"
        message="Người này sẽ không còn là thành viên của hợp đồng (không xem được hóa đơn phòng này nữa)."
        onConfirm={xoaThanhVien}
        onCancel={() => setXoaTvId(null)}
      />

      <style>{`
        @media print {
          aside, header, .hide-on-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default ChiTietHopDong;
