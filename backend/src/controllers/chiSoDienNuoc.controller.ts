import { Request, Response, NextFunction } from 'express';
import { ChiSoDienNuocService } from '../services/chiSoDienNuoc.service';
import { pageParams } from '../utils/helpers';

export class ChiSoDienNuocController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, offset } = pageParams(req.query);
      const result = await ChiSoDienNuocService.getAll(
        (req.query.phong_id as string) || '',
        (req.query.thang_nam as string) || '',
        limit,
        offset
      );
      res.json({ success: true, data: result.data, total: result.total, page, totalPages: Math.ceil(result.total / limit) });
    } catch (error) { next(error); }
  }

  static async getChiSoCu(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ChiSoDienNuocService.getChiSoCu(req.query.phong_id as string, req.query.thang_nam as string);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const id = await ChiSoDienNuocService.create(req.body);
      res.json({ success: true, data: { id }, message: 'Ghi chỉ số thành công' });
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      await ChiSoDienNuocService.update(parseInt(req.params.id), req.body);
      res.json({ success: true, message: 'Cập nhật thành công' });
    } catch (error) { next(error); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await ChiSoDienNuocService.delete(parseInt(req.params.id));
      res.json({ success: true, message: 'Xóa thành công' });
    } catch (error) { next(error); }
  }
}
