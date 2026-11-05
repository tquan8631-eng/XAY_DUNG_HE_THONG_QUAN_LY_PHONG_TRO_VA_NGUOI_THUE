import pool from '../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/helpers';

export const JWT_SECRET =
  process.env.JWT_SECRET ||
  '3a41da76807e21e5f5195f844bcdf747da88a3b7680234a62dd1080e0115d665';

export class AuthService {
  static async getProfile(taiKhoanId: number) {
    const [rows]: any = await pool.query(
      `SELECT tk.id, tk.ten_dang_nhap, tk.vai_tro, tk.trang_thai,
              nt.id AS nguoi_thue_id, nt.ho_ten
       FROM tai_khoan tk
       LEFT JOIN nguoi_thue nt ON nt.tai_khoan_id = tk.id
       WHERE tk.id = ?`,
      [taiKhoanId]
    );
    if (rows.length === 0) throw new AppError(401, 'Tài khoản không tồn tại');
    const u = rows[0];
    if (u.trang_thai !== 'hoat_dong') throw new AppError(401, 'Tài khoản đã bị khóa');
    return {
      id: u.id,
      ten_dang_nhap: u.ten_dang_nhap,
      vai_tro: u.vai_tro,
      nguoi_thue_id: u.nguoi_thue_id || null,
      ho_ten: u.ho_ten || null
    };
  }

  static async login(ten_dang_nhap: string, mat_khau: string) {
    if (!ten_dang_nhap || !mat_khau) {
      throw new AppError(400, 'Vui lòng nhập tên đăng nhập và mật khẩu');
    }

    const [rows]: any = await pool.query(
      'SELECT * FROM tai_khoan WHERE ten_dang_nhap = ?',
      [ten_dang_nhap.trim()]
    );

    if (rows.length === 0) {
      throw new AppError(401, 'Tài khoản không tồn tại');
    }

    const user = rows[0];

    if (user.trang_thai !== 'hoat_dong') {
      throw new AppError(401, 'Tài khoản đã bị khóa, vui lòng liên hệ chủ nhà');
    }

    const isMatch = await bcrypt.compare(mat_khau, user.mat_khau);
    if (!isMatch) {
      throw new AppError(401, 'Mật khẩu không chính xác');
    }

    const profile = await AuthService.getProfile(user.id);

    if (profile.vai_tro === 'nguoi_thue' && !profile.nguoi_thue_id) {
      throw new AppError(
        403,
        'Tài khoản người thuê chưa được liên kết với hồ sơ người thuê. Vui lòng liên hệ chủ nhà.'
      );
    }

    await pool.query('UPDATE tai_khoan SET lan_dang_nhap_cuoi = NOW() WHERE id = ?', [user.id]);

    const token = jwt.sign(
      { id: user.id, ten_dang_nhap: user.ten_dang_nhap, vai_tro: user.vai_tro },
      JWT_SECRET,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as jwt.SignOptions['expiresIn'] }
    );

    return { token, user: profile };
  }

  static async changePassword(id: number, mat_khau_cu: string, mat_khau_moi: string) {
    if (!mat_khau_cu || !mat_khau_moi) {
      throw new AppError(400, 'Vui lòng nhập đầy đủ mật khẩu cũ và mới');
    }
    if (mat_khau_moi.length < 6) {
      throw new AppError(400, 'Mật khẩu mới phải có ít nhất 6 ký tự');
    }

    const [rows]: any = await pool.query('SELECT mat_khau FROM tai_khoan WHERE id = ?', [id]);
    if (rows.length === 0) throw new AppError(404, 'Tài khoản không tồn tại');

    const isMatch = await bcrypt.compare(mat_khau_cu, rows[0].mat_khau);
    if (!isMatch) throw new AppError(400, 'Mật khẩu cũ không chính xác');

    const hash = await bcrypt.hash(mat_khau_moi, 10);
    await pool.query('UPDATE tai_khoan SET mat_khau = ? WHERE id = ?', [hash, id]);
  }
}
