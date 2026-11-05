import { Request, Response, NextFunction } from 'express';

import { PhongTroService } from '../services/phongTro.service';

export class PhongTroController {
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

      const trang_thai =
        (req.query.trang_thai as string) || '';

      const offset =
        (page - 1) * limit;

      console.log('GET PHONG TRO:', {
        page,
        limit,
        search,
        trang_thai,
        offset
      });

      const result =
        await PhongTroService.getAll(
          search,
          trang_thai,
          limit,
          offset
        );

      const totalPages =
        Math.ceil(result.total / limit);

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
      const id =
        parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID phòng không hợp lệ'
        });
      }

      const result =
        await PhongTroService.getById(id);

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
      const id =
        await PhongTroService.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Thêm phòng thành công',
        data: {
          id
        }
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
      const id =
        parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID phòng không hợp lệ'
        });
      }

      await PhongTroService.update(
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
      const id =
        parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID phòng không hợp lệ'
        });
      }

      await PhongTroService.delete(id);

      res.json({
        success: true,
        message: 'Xóa phòng thành công'
      });
    } catch (error: any) {
      console.error('LỖI XÓA PHÒNG:', error);

      if (error?.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }

      next(error);
    }
  }
}
