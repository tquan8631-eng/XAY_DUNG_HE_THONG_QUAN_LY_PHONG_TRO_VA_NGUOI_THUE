import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../services/api';
import {
  formatCurrency, formatDate, formatThangNam, trangThaiPhong, trangThaiHopDong,
  trangThaiHoaDon, trangThaiSuCo, mucDoUuTien
} from '../../utils/formatters';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { btn, inputCls } from '../../components/common/ui';

const Table: React.FC<{ headers: string[]; children: React.ReactNode; empty: boolean; emptyText?: string }> = ({
  headers,
  children,
  empty,
  emptyText = 'Chưa có dữ liệu'
}) =>
  empty ? (
    <p className="py-8 text-center text-gray-500">{emptyText}</p>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-xs text-gray-600 uppercase bg-gray-50">
          <tr>{headers.map((h) => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y">{children}</tbody>
      </table>
    </div>
  );

const ChiTietPhong: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [phong, setPhong] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('thanh-vien');
  const [tatCaDichVu, setTatCaDichVu] = useState<any[]>([]);
  const [dichVuChon, setDichVuChon] = useState('');

  useEffect(() => {
    fetchPhong();
    api.dichVu.getAll().then(setTatCaDichVu).catch(() => undefined);
  }, [id]);

  const fetchPhong = async () => {
    try {
      setLoading(true);
      setPhong(await api.phongTro.getById(Number(id)));
    } catch (error) {
      toast.error(getErrorMessage(error, 'Lỗi khi tải thông tin phòng'));
      navigate('/phong-tro');
    } finally {
      setLoading(false);
    }
  };

  const themDichVu = async () => {
    if (!dichVuChon) return;
    try {
      await api.dichVu.addDichVuPhong({ phong_id: Number(id), dich_vu_id: Number(dichVuChon) });
      toast.success('Đã thêm dịch vụ cho phòng');
      setDichVuChon('');
      fetchPhong();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const boDichVu = async (dichVuId: number) => {
    try {
      await api.dichVu.removeDichVuPhong(Number(id), dichVuId);
      toast.success('Đã bỏ dịch vụ khỏi phòng');
      fetchPhong();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }
  if (!phong) return null;

  const status = trangThaiPhong(phong.trang_thai);
  const hopDongHienTai = phong.hop_dong?.find((h: any) => h.trang_thai === 'con_han');
  const dichVuChuaCo = tatCaDichVu.filter((d) => !phong.dich_vu?.some((x: any) => x.id === d.id));

  const tabs = [
    { id: 'thanh-vien', label: `Thành viên (${phong.thanh_vien?.length || 0})` },
    { id: 'dich-vu', label: `Dịch vụ (${phong.dich_vu?.length || 0})` },
    { id: 'hop-dong', label: `Hợp đồng (${phong.hop_dong?.length || 0})` },
    { id: 'dien-nuoc', label: 'Điện nước' },
    { id: 'hoa-don', label: 'Hóa đơn' },
    { id: 'su-co', label: `Sự cố (${phong.su_co?.length || 0})` }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <button onClick={() => navigate('/phong-tro')} className="flex items-center hover:text-indigo-600">
          <ArrowLeft className="w-4 h-4 mr-1" /> Phòng trọ
        </button>
        <ChevronRight className="w-4 h-4" />
        <span className="font-medium text-gray-900">Phòng {phong.so_phong}</span>
      </div>

      <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="mb-2 text-2xl font-bold text-gray-900">Phòng {phong.so_phong}</h1>
              <div className="flex flex-wrap gap-x-4 text-sm text-gray-500">
                <span>Tầng {phong.tang}</span>
                <span>•</span>
                <span>{phong.dien_tich} m²</span>
                <span>•</span>
                <span>Tối đa {phong.so_nguoi_toi_da} người</span>
              </div>
            </div>
            <Badge text={status.label} color={status.color} />
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg md:grid-cols-4 bg-gray-50">
            <div>
              <p className="mb-1 text-sm text-gray-500">Giá thuê</p>
              <p className="font-semibold text-gray-900">{formatCurrency(phong.gia_thue)}</p>
            </div>
            <div>
              <p className="mb-1 text-sm text-gray-500">Đang ở</p>
              <p className="font-semibold text-gray-900">
                {phong.thanh_vien?.length || 0}/{phong.so_nguoi_toi_da} người
              </p>
            </div>
            <div className="col-span-2">
              <p className="mb-1 text-sm text-gray-500">Hợp đồng hiện tại</p>
              {hopDongHienTai ? (
                <Link to={`/hop-dong/${hopDongHienTai.id}`} className="font-semibold text-indigo-600 hover:underline">
                  {hopDongHienTai.ma_hop_dong} – {hopDongHienTai.ten_nguoi_thue} (đến {formatDate(hopDongHienTai.ngay_ket_thuc)})
                </Link>
              ) : (
                <p className="text-sm text-gray-900">Chưa có — {phong.mo_ta || 'Không có mô tả'}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex overflow-x-auto border-t border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-[300px]">
        {activeTab === 'thanh-vien' && (
          <Table headers={['Họ tên', 'Số điện thoại', 'Vai trò', 'Ngày vào ở']} empty={!phong.thanh_vien?.length} emptyText="Phòng chưa có người ở">
            {phong.thanh_vien?.map((tv: any) => (
              <tr key={tv.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/nguoi-thue/${tv.nguoi_thue_id}`)}>
                <td className="px-4 py-3 font-medium text-gray-900">{tv.ho_ten}</td>
                <td className="px-4 py-3">{tv.so_dien_thoai}</td>
                <td className="px-4 py-3">
                  {tv.la_chu_hop_dong ? <Badge text="Đứng tên HĐ" color="bg-indigo-100 text-indigo-800" /> : 'Thành viên'}
                </td>
                <td className="px-4 py-3">{formatDate(tv.ngay_vao_o)}</td>
              </tr>
            ))}
          </Table>
        )}

        {activeTab === 'dich-vu' && (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <select className={`${inputCls} sm:w-72`} value={dichVuChon} onChange={(e) => setDichVuChon(e.target.value)}>
                <option value="">-- Chọn dịch vụ để thêm --</option>
                {dichVuChuaCo.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.ten_dich_vu} ({formatCurrency(d.don_gia)}/{d.don_vi_tinh})
                  </option>
                ))}
              </select>
              <button onClick={themDichVu} disabled={!dichVuChon} className={btn.primary}>
                <Plus size={16} /> Thêm dịch vụ
              </button>
            </div>
            <Table headers={['Dịch vụ', 'Đơn giá', 'Cách tính', '']} empty={!phong.dich_vu?.length} emptyText="Phòng chưa đăng ký dịch vụ nào">
              {phong.dich_vu?.map((dv: any) => (
                <tr key={dv.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{dv.ten_dich_vu}</td>
                  <td className="px-4 py-3">
                    {formatCurrency(dv.don_gia)} / {dv.don_vi_tinh}
                  </td>
                  <td className="px-4 py-3">{dv.loai_dich_vu === 'theo_chi_so' ? 'Theo chỉ số' : 'Cố định hàng tháng'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => boDichVu(dv.id)} className="text-red-600 hover:text-red-800" title="Bỏ dịch vụ">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        )}

        {activeTab === 'hop-dong' && (
          <Table headers={['Mã HĐ', 'Người đứng tên', 'Thời hạn', 'Tiền cọc', 'Trạng thái']} empty={!phong.hop_dong?.length}>
            {phong.hop_dong?.map((hd: any) => {
              const st = trangThaiHopDong(hd.trang_thai);
              return (
                <tr key={hd.id} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/hop-dong/${hd.id}`)}>
                  <td className="px-4 py-3 font-medium text-indigo-600">{hd.ma_hop_dong}</td>
                  <td className="px-4 py-3">{hd.ten_nguoi_thue}</td>
                  <td className="px-4 py-3">
                    {formatDate(hd.ngay_bat_dau)} → {formatDate(hd.ngay_ket_thuc)}
                  </td>
                  <td className="px-4 py-3">{formatCurrency(hd.tien_coc)}</td>
                  <td className="px-4 py-3"><Badge text={st.label} color={st.color} /></td>
                </tr>
              );
            })}
          </Table>
        )}

        {activeTab === 'dien-nuoc' && (
          <Table headers={['Kỳ', 'Điện (cũ → mới)', 'Tiêu thụ', 'Nước (cũ → mới)', 'Tiêu thụ', 'Ngày ghi']} empty={!phong.chi_so?.length}>
            {phong.chi_so?.map((c: any) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium">{formatThangNam(c.thang_nam, true)}</td>
                <td className="px-4 py-3">{c.chi_so_dien_cu} → {c.chi_so_dien_moi}</td>
                <td className="px-4 py-3 font-semibold text-amber-600">{c.dien_tieu_thu} kWh</td>
                <td className="px-4 py-3">{c.chi_so_nuoc_cu} → {c.chi_so_nuoc_moi}</td>
                <td className="px-4 py-3 font-semibold text-blue-600">{c.nuoc_tieu_thu} m³</td>
                <td className="px-4 py-3">{formatDate(c.ngay_ghi)}</td>
              </tr>
            ))}
          </Table>
        )}

        {activeTab === 'hoa-don' && (
          <Table headers={['Mã hóa đơn', 'Kỳ', 'Tổng tiền', 'Đã trả', 'Trạng thái']} empty={!phong.hoa_don?.length}>
            {phong.hoa_don?.map((h: any) => {
              const st = trangThaiHoaDon(h.trang_thai);
              return (
                <tr key={h.id} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/hoa-don/${h.id}`)}>
                  <td className="px-4 py-3 font-medium text-indigo-600">{h.ma_hoa_don}</td>
                  <td className="px-4 py-3">{formatThangNam(h.thang_nam, true)}</td>
                  <td className="px-4 py-3">{formatCurrency(h.tong_tien)}</td>
                  <td className="px-4 py-3">{formatCurrency(h.so_tien_da_tra)}</td>
                  <td className="px-4 py-3"><Badge text={st.label} color={st.color} /></td>
                </tr>
              );
            })}
          </Table>
        )}

        {activeTab === 'su-co' && (
          <Table headers={['Tiêu đề', 'Người báo', 'Mức độ', 'Ngày báo', 'Trạng thái']} empty={!phong.su_co?.length}>
            {phong.su_co?.map((s: any) => {
              const st = trangThaiSuCo(s.trang_thai);
              const md = mucDoUuTien(s.muc_do_uu_tien);
              return (
                <tr key={s.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{s.tieu_de}</td>
                  <td className="px-4 py-3">{s.nguoi_bao}</td>
                  <td className="px-4 py-3"><Badge text={md.label} color={md.color} /></td>
                  <td className="px-4 py-3">{formatDate(s.ngay_tao)}</td>
                  <td className="px-4 py-3"><Badge text={st.label} color={st.color} /></td>
                </tr>
              );
            })}
          </Table>
        )}
      </div>
    </div>
  );
};

export default ChiTietPhong;
