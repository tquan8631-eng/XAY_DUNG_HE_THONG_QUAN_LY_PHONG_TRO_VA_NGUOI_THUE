import { Request, Response, NextFunction } from 'express';
import { ThanhToanService } from '../services/thanhToan.service';
import { pageParams } from '../utils/helpers';

export class ThanhToanController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, offset } = pageParams(req.query);
      const q = req.query as any;
      const result = await ThanhToanService.getAll(
        { hoa_don_id: q.hoa_don_id || '', phuong_thuc: q.phuong_thuc || '', tu_ngay: q.tu_ngay || '', den_ngay: q.den_ngay || '' },
        limit,
        offset
      );
      res.json({ success: true, ...result, page, totalPages: Math.ceil(result.total / limit) });
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const id = await ThanhToanService.create(req.body);
      res.json({ success: true, data: { id }, message: 'Ghi nhận thanh toán thành công' });
    } catch (error) { next(error); }
  }
}
