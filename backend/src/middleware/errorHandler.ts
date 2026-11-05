import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (!err.statusCode || err.statusCode >= 500) console.error(err);

  const statusCode = err.statusCode || 500;
  let message = err.message || 'Lỗi hệ thống';

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu đã tồn tại trong hệ thống'
    });
  }

  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(400).json({
      success: false,
      message: 'Không thể xóa do dữ liệu này đang được sử dụng ở nơi khác'
    });
  }

  res.status(statusCode).json({
    success: false,
    message
  });
};
