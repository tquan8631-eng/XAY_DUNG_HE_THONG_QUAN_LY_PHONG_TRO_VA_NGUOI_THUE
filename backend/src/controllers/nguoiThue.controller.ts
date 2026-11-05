import { Request, Response, NextFunction } from 'express';
import { NguoiThueService } from '../services/nguoiThue.service';

export class NguoiThueController {
  static async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const page =
        parseInt(req.query.page as string) || 1;

      const limit =
        parseInt(req.query.limit as string) || 20;

      const search =
        (req.query.search as string) || '';

      const phongId =
        (req.query.phong_id as string) || '';

      const trangThai =
        (req.query.trang_thai as string) || '';

      const result =
        await NguoiThueService.getAll(
          search,
          phongId,
          trangThai,
          limit,
          (page - 1) * limit
        );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = parseInt(req.params.id);

      const result =
        await NguoiThueService.getById(id);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await NguoiThueService.create(req.body);

      res.json({
        success: true,
        data: result,
        message: result.tai_khoan
          ? `Đã tạo người thuê và tài khoản đăng nhập: ${result.tai_khoan.ten_dang_nhap}`
          : 'Thêm người thuê thành công'
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = parseInt(req.params.id);

      await NguoiThueService.update(
        id,
        req.body
      );

      res.json({
        success: true,
        message: 'Cập nhật thành công'
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = parseInt(req.params.id);

      await NguoiThueService.delete(id);

      res.json({
        success: true,
        message: 'Xóa thành công'
      });
    } catch (error) {
      next(error);
    }
  }

  static async taoTaiKhoan(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await NguoiThueService.taoTaiKhoan(parseInt(req.params.id), req.body || {});
      res.json({
        success: true,
        data,
        message: data.dat_lai ? 'Đã đặt lại mật khẩu tài khoản người thuê' : 'Đã cấp tài khoản cho người thuê'
      });
    } catch (error) {
      next(error);
    }
  }

  static async xoaTaiKhoan(req: Request, res: Response, next: NextFunction) {
    try {
      await NguoiThueService.xoaTaiKhoan(parseInt(req.params.id));
      res.json({ success: true, message: 'Đã xóa tài khoản đăng nhập của người thuê' });
    } catch (error) {
      next(error);
    }
  }
}
