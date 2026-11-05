import { Request, Response, NextFunction } from 'express';
import { HoaDonService } from '../services/hoaDon.service';
import { pageParams } from '../utils/helpers';

export class HoaDonController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, offset } = pageParams(req.query);
      const q = req.query as any;
      const result = await HoaDonService.getAll(
        { thang_nam: q.thang_nam || '', phong_id: q.phong_id || '', trang_thai: q.trang_thai || '', search: q.search || '', hop_dong_id: q.hop_dong_id || '' },
        limit,
        offset
      );
      res.json({ success: true, ...result, page, totalPages: Math.ceil(result.total / limit) });
    } catch (error) { next(error); }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await HoaDonService.getById(parseInt(req.params.id));
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async createTuDong(req: Request, res: Response, next: NextFunction) {
    try {
      const { hop_dong_id, thang_nam, han_thanhtoan } = req.body;
      const id = await HoaDonService.createTuDong(Number(hop_dong_id), thang_nam, han_thanhtoan);
      res.json({ success: true, data: { id }, message: 'Tạo hóa đơn thành công' });
    } catch (error) { next(error); }
  }

  static async createHangLoat(req: Request, res: Response, next: NextFunction) {
    try {
      const { thang_nam, han_thanhtoan } = req.body;
      const data = await HoaDonService.createHangLoat(thang_nam, han_thanhtoan);
      res.json({
        success: true,
        data,
        message: `Đã tạo ${data.thanh_cong.length} hóa đơn${data.loi.length ? `, ${data.loi.length} phòng lỗi` : ''}`
      });
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      await HoaDonService.update(parseInt(req.params.id), req.body);
      res.json({ success: true, message: 'Cập nhật thành công' });
    } catch (error) { next(error); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await HoaDonService.delete(parseInt(req.params.id));
      res.json({ success: true, message: 'Xóa thành công' });
    } catch (error) { next(error); }
  }
}
