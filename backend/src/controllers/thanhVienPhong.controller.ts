import { Request, Response, NextFunction } from 'express';
import { ThanhVienPhongService } from '../services/thanhVienPhong.service';

export class ThanhVienPhongController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ThanhVienPhongService.getAll((req.query.hop_dong_id as string) || '');
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const id = await ThanhVienPhongService.create(req.body);
      res.json({ success: true, data: { id } });
    } catch (error) { next(error); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await ThanhVienPhongService.delete(parseInt(req.params.id));
      res.json({ success: true, message: 'Xóa thành công' });
    } catch (error) { next(error); }
  }
}
