import { Request, Response, NextFunction } from 'express';
import { DichVuService } from '../services/dichVu.service';

export class DichVuController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DichVuService.getAll();
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const id = await DichVuService.create(req.body);
      res.json({ success: true, data: { id } });
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      await DichVuService.update(parseInt(req.params.id), req.body);
      res.json({ success: true, message: 'Cập nhật thành công' });
    } catch (error) { next(error); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await DichVuService.delete(parseInt(req.params.id));
      res.json({ success: true, message: 'Xóa thành công' });
    } catch (error) { next(error); }
  }

  static async getDichVuPhong(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DichVuService.getDichVuPhong(parseInt(req.params.phongId));
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async addDichVuPhong(req: Request, res: Response, next: NextFunction) {
    try {
      await DichVuService.addDichVuPhong(req.body.phong_id, req.body.dich_vu_id, !!req.body.tat_ca_phong);
      res.json({ success: true, message: 'Thêm dịch vụ phòng thành công' });
    } catch (error) { next(error); }
  }

  static async removeDichVuPhong(req: Request, res: Response, next: NextFunction) {
    try {
      await DichVuService.removeDichVuPhong(parseInt(req.params.phongId), parseInt(req.params.dichVuId));
      res.json({ success: true, message: 'Xóa dịch vụ phòng thành công' });
    } catch (error) { next(error); }
  }
}
