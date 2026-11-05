import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { ten_dang_nhap, mat_khau } = req.body;
      const data = await AuthService.login(ten_dang_nhap, mat_khau);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { mat_khau_cu, mat_khau_moi } = req.body;
      await AuthService.changePassword(req.user!.id, mat_khau_cu, mat_khau_moi);
      res.json({ success: true, message: 'Đổi mật khẩu thành công' });
    } catch (error) { next(error); }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AuthService.getProfile(req.user!.id);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }
}
