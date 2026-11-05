import { Request, Response, NextFunction } from 'express';
import { HopDongService } from '../services/hopDong.service';

export class HopDongController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await HopDongService.getAll(
        {
          trang_thai: (req.query.trang_thai as string) || '',
          sap_het_han: (req.query.sap_het_han as string) || 'false',
          search: (req.query.search as string) || '',
          phong_id: (req.query.phong_id as string) || ''
        },
        limit,
        (page - 1) * limit
      );

      const totalPages = Math.ceil(result.total / limit);

      res.json({
        success: true,
        data: result.data,
        total: result.total,
        totalPages
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
      const data = await HopDongService.getById(
        parseInt(req.params.id)
      );

      res.json({
        success: true,
        data
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
      const id = await HopDongService.create(req.body);

      res.json({
        success: true,
        data: { id }
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
      await HopDongService.update(
        parseInt(req.params.id),
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
      await HopDongService.delete(
        parseInt(req.params.id)
      );

      res.json({
        success: true,
        message: 'Xóa thành công'
      });
    } catch (error) {
      next(error);
    }
  }
}
