import { Request, Response, NextFunction } from 'express';
import { hoi, goiYTheoVaiTro, ChatbotQuanLy } from '../chatbot/chatbot.service';
import { AppError, pageParams } from '../utils/helpers';

const wrap = (fn: (req: Request) => Promise<any> | any, message?: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await fn(req);
      res.json({ success: true, data, ...(message ? { message } : {}) });
    } catch (e) {
      next(e);
    }
  };

const nguoiDung = (req: Request) => (req.user ? { id: req.user.id, vai_tro: req.user.vai_tro } : null);

export class ChatbotController {
  static hoi = wrap((req) => {
    const cau = String(req.body?.cau_hoi || '').trim();
    if (!cau) throw new AppError(400, 'Vui lòng nhập câu hỏi');
    if (cau.length > 500) throw new AppError(400, 'Câu hỏi quá dài (tối đa 500 ký tự)');
    return hoi(cau, nguoiDung(req), req.body?.ngu_canh || null);
  });
  static goiY = wrap((req) => goiYTheoVaiTro(nguoiDung(req)));
  static thongKe = wrap(() => ChatbotQuanLy.thongKe());
  static lichSu = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, offset } = pageParams(req.query, 20);
      const { data, total } = await ChatbotQuanLy.lichSu(req.query.chua_hieu === '1', limit, offset);
      res.json({ success: true, data, total, page, totalPages: Math.ceil(total / limit) });
    } catch (e) {
      next(e);
    }
  };
  static dsYDinh = wrap(() => ChatbotQuanLy.dsYDinh());
  static dsMauCau = wrap(() => ChatbotQuanLy.dsMauCau());
  static themMauCau = wrap(
    async (req) => ({ id: await ChatbotQuanLy.themMauCau(req.body?.y_dinh, req.body?.cau_mau, req.body?.lich_su_id) }),
    'Đã dạy chatbot câu mới và huấn luyện lại mô hình'
  );
  static xoaMauCau = wrap((req) => ChatbotQuanLy.xoaMauCau(parseInt(req.params.id)), 'Đã xóa câu mẫu');
  static boQua = wrap((req) => ChatbotQuanLy.boQua(parseInt(req.params.id)), 'Đã bỏ qua câu hỏi');
}
