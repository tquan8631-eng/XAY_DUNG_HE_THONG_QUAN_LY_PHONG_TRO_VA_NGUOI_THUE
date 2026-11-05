import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface UserPayload {
  id: number;
  ten_dang_nhap: string;
  vai_tro: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

import { JWT_SECRET } from '../services/auth.service';

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Không tìm thấy token xác thực'
    });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      message: 'Định dạng token không hợp lệ'
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;

    req.user = decoded;

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại'
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Chưa xác thực người dùng'
      });
    }

    if (!roles.includes(req.user.vai_tro)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thực hiện hành động này'
      });
    }

    next();
  };
};

export const quanLyOnly = authorize('chu_nha', 'nhan_vien');

export const nguoiThueOnly = authorize('nguoi_thue');

export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  const parts = (req.headers.authorization || '').split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    try {
      req.user = jwt.verify(parts[1], JWT_SECRET) as UserPayload;
    } catch {
    }
  }
  next();
};
