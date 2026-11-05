import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';

export class DashboardController {
  static async getThongKe(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getThongKe();
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async getDoanhThu(req: Request, res: Response, next: NextFunction) {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const data = await DashboardService.getDoanhThu(year);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async getHoaDonChuaTT(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getHoaDonChuaTT();
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async getHopDongSapHet(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getHopDongSapHet();
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async getSuCoMoi(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getSuCoMoi();
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }
}
