import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Bot, Brain, MessageSquare, CheckCircle2, HelpCircle, GraduationCap, Trash2, X, Sparkles } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { chatbotApi, getErrorMessage } from '../../services/api';
import { PageHeader, Card, inputCls, btn } from '../../components/common/ui';
import StatCard from '../../components/common/StatCard';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDateTime } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

const VAI_TRO: Record<string, string> = { khach: 'Khách', nguoi_thue: 'Người thuê', chu_nha: 'Chủ nhà', nhan_vien: 'Nhân viên' };

const QuanLyChatbot: React.FC = () => {
  const { user } = useAuth();
  const [tk, setTk] = useState<any>(null);
  const [tab, setTab] = useState<'chua_hieu' | 'tat_ca' | 'mau_cau'>('chua_hieu');
  const [lichSu, setLichSu] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mauCau, setMauCau] = useState<any[]>([]);
  const [yDinh, setYDinh] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [day, setDay] = useState<{ id?: number; cau: string; y_dinh: string } | null>(null);
  const [dangLuu, setDangLuu] = useState(false);

  const taiThongKe = useCallback(() => chatbotApi.thongKe().then(setTk).catch((e) => toast.error(getErrorMessage(e))), []);

  const taiDanhSach = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'mau_cau') setMauCau(await chatbotApi.dsMauCau());
      else {
        const r = await chatbotApi.lichSu({ chua_hieu: tab === 'chua_hieu' ? 1 : undefined, page, limit: 15 });
        setLichSu(r.data);
        setTotalPages(r.totalPages);
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [tab, page]);

  useEffect(() => {
    taiThongKe();
    chatbotApi.dsYDinh().then(setYDinh).catch(() => {});
  }, [taiThongKe]);
  useEffect(() => {
    taiDanhSach();
  }, [taiDanhSach]);

  const luuDay = async () => {
    if (!day) return;
    if (!day.y_dinh) return toast.error('Chọn ý định đúng cho câu hỏi');
    setDangLuu(true);
    try {
      const r = await chatbotApi.themMauCau({ y_dinh: day.y_dinh, cau_mau: day.cau, lich_su_id: day.id });
      toast.success(r.message || 'Đã dạy chatbot');
      setDay(null);
      taiThongKe();
      taiDanhSach();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setDangLuu(false);
    }
  };

  const boQua = async (id: number) => {
    await chatbotApi.boQua(id).catch((e) => toast.error(getErrorMessage(e)));
    taiThongKe();
    taiDanhSach();
  };

  const xoaMau = async (id: number) => {
    try {
      await chatbotApi.xoaMauCau(id);
      toast.success('Đã xóa câu mẫu và huấn luyện lại');
      taiThongKe();
      taiDanhSach();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const mh = tk?.mo_hinh;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chatbot AI hỗ trợ 24/7"
        subtitle="Mô hình phân loại ý định Naive Bayes chạy ngay trên máy chủ – không dùng API AI bên ngoài"
        actions={
          <button className={btn.primary} onClick={() => setDay({ cau: '', y_dinh: '' })}>
            <GraduationCap size={16} /> Dạy câu mới
          </button>
        }
      />

      {!tk ? (
        <div className="flex justify-center py-10"><LoadingSpinner /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Tổng câu hỏi" value={tk.tong_cau_hoi} icon={<MessageSquare />} color="indigo" subtitle="Từ khách, người thuê, quản lý" />
            <StatCard title="Tỷ lệ hiểu" value={`${tk.ty_le_hieu}%`} icon={<CheckCircle2 />} color="green" subtitle={`${tk.so_cau_hieu} câu trả lời đúng ý định`} />
            <StatCard title="Câu chưa hiểu" value={tk.cau_chua_xu_ly} icon={<HelpCircle />} color={tk.cau_chua_xu_ly ? 'red' : 'green'} subtitle="Cần quản lý dạy thêm" />
            <StatCard title="Mô hình" value={`${mh.so_y_dinh} ý định`} icon={<Brain />} color="purple" subtitle={`${mh.so_mau_he_thong + mh.so_mau_quan_ly} câu mẫu · ${mh.so_dac_trung} đặc trưng`} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card title="Số câu hỏi 14 ngày gần nhất" className="lg:col-span-2">
              <div className="h-64">
                {tk.theo_ngay.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tk.theo_ngay.map((r: any) => ({ ...r, ngay: r.ngay.slice(8, 10) + '/' + r.ngay.slice(5, 7), chua_hieu: r.so - r.hieu }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="ngay" fontSize={12} />
                      <YAxis allowDecimals={false} fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="hieu" name="Hiểu được" stackId="a" fill="#6366f1" />
                      <Bar dataKey="chua_hieu" name="Chưa hiểu" stackId="a" fill="#f43f5e" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="py-20 text-sm text-center text-gray-400">Chưa có câu hỏi nào</p>
                )}
              </div>
            </Card>
            <Card title="Chủ đề được hỏi nhiều">
              {tk.theo_y_dinh.length === 0 ? (
                <p className="text-sm text-gray-400">Chưa có dữ liệu</p>
              ) : (
                <div className="space-y-2.5">
                  {tk.theo_y_dinh.map((r: any) => (
                    <div key={r.y_dinh}>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">{r.ten}</span>
                        <span className="font-medium text-gray-900">{r.so}</span>
                      </div>
                      <div className="h-1.5 mt-1 bg-gray-100 rounded-full">
                        <div className="h-1.5 bg-indigo-500 rounded-full" style={{ width: `${(r.so / tk.theo_y_dinh[0].so) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 mt-3 text-xs text-gray-500 border-t">
                    Theo người hỏi: {tk.theo_vai_tro.map((v: any) => `${VAI_TRO[v.vai_tro] || v.vai_tro} ${v.so}`).join(' · ')}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </>
      )}

      <Card
        title={
          <div className="flex flex-wrap gap-1">
            {[
              { k: 'chua_hieu', t: `Câu chưa hiểu${tk?.cau_chua_xu_ly ? ` (${tk.cau_chua_xu_ly})` : ''}` },
              { k: 'tat_ca', t: 'Lịch sử hỏi đáp' },
              { k: 'mau_cau', t: 'Câu mẫu đã dạy' }
            ].map((x) => (
              <button
                key={x.k}
                onClick={() => { setTab(x.k as any); setPage(1); }}
                className={`px-3 py-1.5 text-sm rounded-lg ${tab === x.k ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {x.t}
              </button>
            ))}
          </div>
        }
      >
        {loading ? (
          <div className="flex justify-center py-8"><LoadingSpinner /></div>
        ) : tab === 'mau_cau' ? (
          mauCau.length === 0 ? (
            <p className="py-6 text-sm text-center text-gray-400">Chưa dạy thêm câu nào. Mô hình đang dùng {mh?.so_mau_he_thong} câu mẫu có sẵn.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-500 bg-gray-50">
                  <tr><th className="px-3 py-2">Câu mẫu</th><th className="px-3 py-2">Ý định</th><th className="px-3 py-2">Ngày dạy</th><th /></tr>
                </thead>
                <tbody>
                  {mauCau.map((m) => (
                    <tr key={m.id} className="border-t">
                      <td className="px-3 py-2 text-gray-800">"{m.cau_mau}"</td>
                      <td className="px-3 py-2"><span className="px-2 py-0.5 text-xs text-indigo-700 bg-indigo-50 rounded-full">{m.ten_y_dinh}</span></td>
                      <td className="px-3 py-2 text-gray-500">{formatDateTime(m.ngay_tao)}</td>
                      <td className="px-3 py-2 text-right">
                        <button onClick={() => xoaMau(m.id)} className={`${btn.icon} text-red-500`} title="Xóa"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : lichSu.length === 0 ? (
          <p className="py-6 text-sm text-center text-gray-400">
            {tab === 'chua_hieu' ? '🎉 Không có câu nào chatbot chưa hiểu.' : 'Chưa có câu hỏi nào.'}
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-500 bg-gray-50">
                  <tr>
                    <th className="px-3 py-2">Thời gian</th>
                    <th className="px-3 py-2">Người hỏi</th>
                    <th className="px-3 py-2">Câu hỏi</th>
                    <th className="px-3 py-2">AI đoán</th>
                    <th className="px-3 py-2 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {lichSu.map((r) => (
                    <tr key={r.id} className="align-top border-t">
                      <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{formatDateTime(r.ngay_tao)}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{r.ten_dang_nhap || VAI_TRO[r.vai_tro] || r.vai_tro}</td>
                      <td className="px-3 py-2 text-gray-800 max-w-xs">{r.cau_hoi}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${r.da_hieu ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          {r.ten_y_dinh || 'Không rõ'} · {Math.round(Number(r.do_tin_cay) * 100)}%
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        <button onClick={() => setDay({ id: r.id, cau: r.cau_hoi, y_dinh: r.da_hieu ? r.y_dinh : '' })} className="px-2 py-1 text-xs font-medium text-indigo-700 rounded-md bg-indigo-50 hover:bg-indigo-100">
                          Dạy
                        </button>
                        {!r.da_hieu && !r.da_xu_ly && (
                          <button onClick={() => boQua(r.id)} className="px-2 py-1 ml-1 text-xs text-gray-500 rounded-md hover:bg-gray-100">Bỏ qua</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && <div className="mt-4"><Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} /></div>}
          </>
        )}
      </Card>

      <div className="flex items-start gap-3 p-4 text-sm text-indigo-900 border border-indigo-100 rounded-xl bg-indigo-50">
        <Bot size={20} className="flex-shrink-0 mt-0.5" />
        <div>
          <b>Chatbot hoạt động thế nào?</b> Câu hỏi được chuẩn hóa (bỏ dấu, đổi từ viết tắt như "ko", "dc", "bn"), tách thành từ đơn và cặp từ,
          rồi mô hình <b>Naive Bayes</b> tính xác suất thuộc từng ý định. Nếu độ tin cậy ≥ {Math.round((mh?.nguong || 0.3) * 100)}% chatbot truy vấn dữ liệu
          thật (phòng trống, hóa đơn, hợp đồng...) để trả lời; thấp hơn thì gợi ý câu hỏi và ghi vào mục "Câu chưa hiểu" để {user?.vai_tro === 'chu_nha' ? 'bạn' : 'quản lý'} dạy thêm.
        </div>
      </div>

      <Modal isOpen={!!day} onClose={() => setDay(null)} title="Dạy chatbot" size="md">
        {day && (
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Câu hỏi <span className="text-red-500">*</span></label>
              <input className={inputCls} value={day.cau} onChange={(e) => setDay({ ...day, cau: e.target.value })} disabled={!!day.id} placeholder="VD: mấy giờ đóng cổng" maxLength={255} />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Câu này thuộc ý định <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 gap-1.5 max-h-72 overflow-y-auto custom-scrollbar">
                {yDinh.map((y) => (
                  <button
                    key={y.ma}
                    type="button"
                    onClick={() => setDay({ ...day, y_dinh: y.ma })}
                    title={`VD: ${y.vi_du.join(' / ')}`}
                    className={`px-2.5 py-2 text-left text-xs rounded-lg border ${day.y_dinh === y.ma ? 'border-indigo-500 bg-indigo-50 text-indigo-800 font-semibold' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                  >
                    {y.ten} <span className="text-gray-400">({y.so_mau})</span>
                  </button>
                ))}
              </div>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-gray-500">
              <Sparkles size={13} /> Sau khi lưu, mô hình được huấn luyện lại ngay – câu tương tự sẽ được hiểu đúng.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button className={btn.secondary} onClick={() => setDay(null)}><X size={16} /> Hủy</button>
              <button className={btn.primary} onClick={luuDay} disabled={dangLuu || !day.cau.trim()}>
                <GraduationCap size={16} /> {dangLuu ? 'Đang huấn luyện...' : 'Lưu & huấn luyện'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default QuanLyChatbot;
