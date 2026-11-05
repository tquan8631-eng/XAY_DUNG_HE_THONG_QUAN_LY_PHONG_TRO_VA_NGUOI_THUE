import { Request, Response, NextFunction } from 'express';
import { SuCoService } from '../services/suCo.service';
import { pageParams } from '../utils/helpers';

export class SuCoController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, offset } = pageParams(req.query);
      const q = req.query as any;
      const result = await SuCoService.getAll(
        { trang_thai: q.trang_thai || '', phong_id: q.phong_id || '', muc_do_uu_tien: q.muc_do_uu_tien || '', search: q.search || '' },
        limit,
        offset
      );
      res.json({ success: true, data: result.data, total: result.total, page, totalPages: Math.ceil(result.total / limit) });
    } catch (error) { next(error); }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await SuCoService.getById(parseInt(req.params.id));
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const id = await SuCoService.create(req.body);
      res.json({ success: true, data: { id } });
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      await SuCoService.update(parseInt(req.params.id), req.body);
      res.json({ success: true, message: 'Cập nhật thành công' });
    } catch (error) { next(error); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await SuCoService.delete(parseInt(req.params.id));
      res.json({ success: true, message: 'Xóa thành công' });
    } catch (error) { next(error); }
  }
}
