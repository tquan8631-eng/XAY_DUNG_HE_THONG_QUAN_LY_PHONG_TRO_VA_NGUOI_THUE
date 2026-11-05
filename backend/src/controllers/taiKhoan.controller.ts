import { Request, Response, NextFunction } from 'express';
import { TaiKhoanService } from '../services/taiKhoan.service';
import { pageParams } from '../utils/helpers';

export class TaiKhoanController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, offset } = pageParams(req.query);
      const result = await TaiKhoanService.getAll(
        (req.query.search as string) || '',
        (req.query.vai_tro as string) || '',
        limit,
        offset
      );
      res.json({ success: true, data: result.data, total: result.total, page, totalPages: Math.ceil(result.total / limit) });
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const id = await TaiKhoanService.create(req.body);
      res.json({ success: true, data: { id }, message: 'Tạo tài khoản thành công' });
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      await TaiKhoanService.update(parseInt(req.params.id), req.body, req.user!.id);
      res.json({ success: true, message: 'Cập nhật thành công' });
    } catch (error) { next(error); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await TaiKhoanService.delete(parseInt(req.params.id), req.user!.id);
      res.json({ success: true, message: 'Xóa thành công' });
    } catch (error) { next(error); }
  }
}
