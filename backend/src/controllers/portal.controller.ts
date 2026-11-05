import { Request, Response, NextFunction } from 'express';
import { PortalService } from '../services/portal.service';

type Handler = (req: Request) => Promise<any>;

const wrap = (fn: Handler, message?: string) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await fn(req);
    res.json({ success: true, data, ...(message ? { message } : {}) });
  } catch (error) {
    next(error);
  }
};

export class PortalController {
  static tongQuan = wrap((req) => PortalService.tongQuan(req.user!.id));
  static getThongTin = wrap((req) => PortalService.getThongTin(req.user!.id));
  static updateThongTin = wrap((req) => PortalService.updateThongTin(req.user!.id, req.body || {}), 'Cập nhật thông tin thành công');
  static getPhong = wrap((req) => PortalService.getPhong(req.user!.id));
  static getHopDong = wrap((req) => PortalService.getHopDong(req.user!.id));
  static getHoaDon = wrap((req) => PortalService.getHoaDon(req.user!.id, (req.query.trang_thai as string) || ''));
  static getHoaDonById = wrap((req) => PortalService.getHoaDonById(req.user!.id, parseInt(req.params.id)));
  static getThanhToan = wrap((req) => PortalService.getThanhToan(req.user!.id));
  static getChiSo = wrap((req) => PortalService.getChiSo(req.user!.id));
  static getSuCo = wrap((req) => PortalService.getSuCo(req.user!.id));
  static createSuCo = wrap(async (req) => ({ id: await PortalService.createSuCo(req.user!.id, req.body || {}) }), 'Đã gửi báo cáo sự cố');
  static huySuCo = wrap((req) => PortalService.huySuCo(req.user!.id, parseInt(req.params.id)), 'Đã hủy báo cáo sự cố');
}
