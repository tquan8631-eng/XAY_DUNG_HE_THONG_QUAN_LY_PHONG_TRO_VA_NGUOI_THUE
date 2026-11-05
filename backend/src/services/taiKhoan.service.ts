import pool from '../config/database';
import bcrypt from 'bcryptjs';
import { AppError, buildUpdate } from '../utils/helpers';

const VAI_TRO = ['chu_nha', 'nhan_vien', 'nguoi_thue'];

export class TaiKhoanService {
  static async getAll(search = '', vai_tro = '', limit = 20, offset = 0) {
    const where: string[] = [];
    const params: any[] = [];
    if (search) {
      where.push('(tk.ten_dang_nhap LIKE ? OR nt.ho_ten LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (vai_tro) {
      where.push('tk.vai_tro = ?');
      params.push(vai_tro);
    }
    const whereSql = where.length ? ' WHERE ' + where.join(' AND ') : '';

    const [rows] = await pool.query(
      `SELECT tk.id, tk.ten_dang_nhap, tk.vai_tro, tk.trang_thai, tk.lan_dang_nhap_cuoi, tk.ngay_tao,
              nt.id AS nguoi_thue_id, nt.ho_ten
       FROM tai_khoan tk
       LEFT JOIN nguoi_thue nt ON nt.tai_khoan_id = tk.id
       ${whereSql}
       ORDER BY tk.id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [count]: any = await pool.query(
      `SELECT COUNT(*) AS total FROM tai_khoan tk LEFT JOIN nguoi_thue nt ON nt.tai_khoan_id = tk.id ${whereSql}`,
      params
    );
    return { data: rows, total: Number(count[0].total) };
  }

  static async create(data: any) {
    const { ten_dang_nhap, mat_khau, vai_tro, trang_thai, nguoi_thue_id } = data;
    if (!ten_dang_nhap?.trim()) throw new AppError(400, 'Tên đăng nhập không được để trống');
    if (!mat_khau || mat_khau.length < 6) throw new AppError(400, 'Mật khẩu phải có ít nhất 6 ký tự');
    const role = VAI_TRO.includes(vai_tro) ? vai_tro : 'nguoi_thue';

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const hash = await bcrypt.hash(mat_khau, 10);
      const [result]: any = await conn.query(
        'INSERT INTO tai_khoan (ten_dang_nhap, mat_khau, vai_tro, trang_thai) VALUES (?, ?, ?, ?)',
        [ten_dang_nhap.trim(), hash, role, trang_thai === 'khoa' ? 'khoa' : 'hoat_dong']
      );

      if (role === 'nguoi_thue') {
        if (!nguoi_thue_id) throw new AppError(400, 'Vui lòng chọn người thuê để liên kết tài khoản');
        const [nt]: any = await conn.query('SELECT id, tai_khoan_id FROM nguoi_thue WHERE id = ?', [nguoi_thue_id]);
        if (nt.length === 0) throw new AppError(404, 'Không tìm thấy người thuê');
        if (nt[0].tai_khoan_id) throw new AppError(400, 'Người thuê này đã có tài khoản');
        await conn.query('UPDATE nguoi_thue SET tai_khoan_id = ? WHERE id = ?', [result.insertId, nguoi_thue_id]);
      }

      await conn.commit();
      return result.insertId;
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  }

  static async update(id: number, data: any, currentUserId: number) {
    const payload: any = {};
    if (data.mat_khau) {
      if (data.mat_khau.length < 6) throw new AppError(400, 'Mật khẩu phải có ít nhất 6 ký tự');
      payload.mat_khau = await bcrypt.hash(data.mat_khau, 10);
    }
    if (data.trang_thai) {
      if (id === currentUserId && data.trang_thai === 'khoa') {
        throw new AppError(400, 'Bạn không thể tự khóa tài khoản của mình');
      }
      payload.trang_thai = data.trang_thai === 'khoa' ? 'khoa' : 'hoat_dong';
    }
    if (data.vai_tro && VAI_TRO.includes(data.vai_tro) && data.vai_tro !== 'nguoi_thue') {
      if (id === currentUserId && data.vai_tro !== 'chu_nha') {
        throw new AppError(400, 'Bạn không thể tự hạ quyền của mình');
      }
      const [cur]: any = await pool.query('SELECT vai_tro FROM tai_khoan WHERE id = ?', [id]);
      if (cur[0]?.vai_tro !== 'nguoi_thue') payload.vai_tro = data.vai_tro;
    }
    const { fields, values } = buildUpdate(payload, ['mat_khau', 'trang_thai', 'vai_tro']);
    if (fields.length === 0) return;
    values.push(id);
    await pool.query(`UPDATE tai_khoan SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  static async delete(id: number, currentUserId: number) {
    if (id === currentUserId) throw new AppError(400, 'Bạn không thể xóa tài khoản đang đăng nhập');

    await pool.query('DELETE FROM tai_khoan WHERE id = ?', [id]);
  }
}
