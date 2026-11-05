import pool from '../config/database';
import bcrypt from 'bcryptjs';
import { AppError } from '../utils/helpers';

const normGioiTinh = (v: any) => (v === 'nu' ? 'nu' : v === 'khac' ? 'khac' : 'nam');
const normTrangThai = (v: any) => (v === 'da_chuyen_di' ? 'da_chuyen_di' : 'dang_thue');

const SELECT_NGUOI_THUE = `
  SELECT
    nt.*,
    tk.ten_dang_nhap,
    tk.trang_thai AS trang_thai_tai_khoan,
    GROUP_CONCAT(DISTINCT CASE WHEN hd.trang_thai = 'con_han' THEN p.so_phong END
                 ORDER BY p.so_phong SEPARATOR ', ') AS so_phong
  FROM nguoi_thue nt
  LEFT JOIN tai_khoan tk ON nt.tai_khoan_id = tk.id
  LEFT JOIN thanh_vien_phong tv ON nt.id = tv.nguoi_thue_id
  LEFT JOIN hop_dong hd ON tv.hop_dong_id = hd.id
  LEFT JOIN phong_tro p ON hd.phong_id = p.id
`;

export class NguoiThueService {
  static async getAll(search = '', phongId = '', trangThai = '', limit = 10, offset = 0) {
    const where: string[] = [];
    const params: any[] = [];

    if (search) {
      where.push('(nt.ho_ten LIKE ? OR nt.so_dien_thoai LIKE ? OR nt.can_cuoc_cong_dan LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (phongId) {
      where.push('p.id = ?');
      params.push(phongId);
    }
    if (trangThai) {
      where.push('nt.trang_thai = ?');
      params.push(trangThai);
    }
    const whereSql = where.length ? ` WHERE ${where.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `${SELECT_NGUOI_THUE} ${whereSql} GROUP BY nt.id ORDER BY nt.id DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [countRows]: any = await pool.query(
      `SELECT COUNT(DISTINCT nt.id) AS total
       FROM nguoi_thue nt
       LEFT JOIN thanh_vien_phong tv ON nt.id = tv.nguoi_thue_id
       LEFT JOIN hop_dong hd ON tv.hop_dong_id = hd.id
       LEFT JOIN phong_tro p ON hd.phong_id = p.id
       ${whereSql}`,
      params
    );

    return { data: rows, total: Number(countRows[0]?.total || 0) };
  }

  static async getById(id: number) {
    const [rows]: any = await pool.query(`${SELECT_NGUOI_THUE} WHERE nt.id = ? GROUP BY nt.id`, [id]);
    if (rows.length === 0) throw new AppError(404, 'Không tìm thấy người thuê');

    const [hopDong] = await pool.query(
      `SELECT hd.id, hd.ma_hop_dong, hd.ngay_bat_dau, hd.ngay_ket_thuc, hd.trang_thai,
              tv.la_chu_hop_dong, tv.ngay_vao_o, p.so_phong, p.id AS phong_id, p.gia_thue
       FROM thanh_vien_phong tv
       JOIN hop_dong hd ON tv.hop_dong_id = hd.id
       JOIN phong_tro p ON hd.phong_id = p.id
       WHERE tv.nguoi_thue_id = ?
       ORDER BY hd.id DESC`,
      [id]
    );

    return { ...rows[0], hop_dong: hopDong };
  }

  static async create(data: any) {
    const {
      ho_ten, so_dien_thoai, email, can_cuoc_cong_dan, gioi_tinh, ngay_sinh, que_quan,
      anh_cccd_mat_truoc, anh_cccd_mat_sau, da_dang_ky_tam_tru, trang_thai,
      tao_tai_khoan, ten_dang_nhap, mat_khau
    } = data;

    if (!ho_ten?.trim()) throw new AppError(400, 'Họ tên không được để trống');
    if (!so_dien_thoai?.trim()) throw new AppError(400, 'Số điện thoại không được để trống');
    if (!can_cuoc_cong_dan?.trim()) throw new AppError(400, 'Căn cước công dân không được để trống');

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [result]: any = await conn.query(
        `INSERT INTO nguoi_thue (ho_ten, so_dien_thoai, email, can_cuoc_cong_dan, gioi_tinh, ngay_sinh,
          que_quan, anh_cccd_mat_truoc, anh_cccd_mat_sau, da_dang_ky_tam_tru, trang_thai)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          ho_ten.trim(), so_dien_thoai.trim(), email?.trim() || null, can_cuoc_cong_dan.trim(),
          normGioiTinh(gioi_tinh), ngay_sinh || null, que_quan?.trim() || null,
          anh_cccd_mat_truoc || null, anh_cccd_mat_sau || null, da_dang_ky_tam_tru ? 1 : 0,
          normTrangThai(trang_thai)
        ]
      );

      let taiKhoan = null;
      if (tao_tai_khoan) {
        taiKhoan = await NguoiThueService.createAccountTx(conn, result.insertId, {
          ten_dang_nhap: ten_dang_nhap || so_dien_thoai.trim(),
          mat_khau: mat_khau || can_cuoc_cong_dan.trim().slice(-6)
        });
      }

      await conn.commit();
      return { id: result.insertId, tai_khoan: taiKhoan };
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  }

  private static async createAccountTx(conn: any, nguoiThueId: number, opts: { ten_dang_nhap: string; mat_khau: string }) {
    const username = String(opts.ten_dang_nhap || '').trim();
    const password = String(opts.mat_khau || '');
    if (!username) throw new AppError(400, 'Tên đăng nhập không được để trống');
    if (password.length < 6) throw new AppError(400, 'Mật khẩu phải có ít nhất 6 ký tự');

    const [exists]: any = await conn.query('SELECT id FROM tai_khoan WHERE ten_dang_nhap = ?', [username]);
    if (exists.length > 0) throw new AppError(400, `Tên đăng nhập "${username}" đã tồn tại`);

    const hash = await bcrypt.hash(password, 10);
    const [tk]: any = await conn.query(
      `INSERT INTO tai_khoan (ten_dang_nhap, mat_khau, vai_tro, trang_thai) VALUES (?, ?, 'nguoi_thue', 'hoat_dong')`,
      [username, hash]
    );
    await conn.query('UPDATE nguoi_thue SET tai_khoan_id = ? WHERE id = ?', [tk.insertId, nguoiThueId]);
    return { id: tk.insertId, ten_dang_nhap: username, mat_khau: password };
  }

  static async taoTaiKhoan(id: number, data: any) {
    const [rows]: any = await pool.query('SELECT * FROM nguoi_thue WHERE id = ?', [id]);
    if (rows.length === 0) throw new AppError(404, 'Không tìm thấy người thuê');
    const nt = rows[0];

    const mat_khau = data.mat_khau || String(nt.can_cuoc_cong_dan).slice(-6);

    if (nt.tai_khoan_id) {
      if (mat_khau.length < 6) throw new AppError(400, 'Mật khẩu phải có ít nhất 6 ký tự');
      const hash = await bcrypt.hash(mat_khau, 10);
      await pool.query(`UPDATE tai_khoan SET mat_khau = ?, trang_thai = 'hoat_dong' WHERE id = ?`, [hash, nt.tai_khoan_id]);
      const [tk]: any = await pool.query('SELECT ten_dang_nhap FROM tai_khoan WHERE id = ?', [nt.tai_khoan_id]);
      return { id: nt.tai_khoan_id, ten_dang_nhap: tk[0]?.ten_dang_nhap, mat_khau, dat_lai: true };
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const tk = await NguoiThueService.createAccountTx(conn, id, {
        ten_dang_nhap: data.ten_dang_nhap || nt.so_dien_thoai,
        mat_khau
      });
      await conn.commit();
      return { ...tk, dat_lai: false };
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  }

  static async xoaTaiKhoan(id: number) {
    const [rows]: any = await pool.query('SELECT tai_khoan_id FROM nguoi_thue WHERE id = ?', [id]);
    if (rows.length === 0) throw new AppError(404, 'Không tìm thấy người thuê');
    if (!rows[0].tai_khoan_id) throw new AppError(400, 'Người thuê chưa có tài khoản');
    await pool.query('DELETE FROM tai_khoan WHERE id = ?', [rows[0].tai_khoan_id]);
  }

  static async update(id: number, data: any) {
    const allowedFields = [
      'ho_ten', 'so_dien_thoai', 'email', 'can_cuoc_cong_dan', 'gioi_tinh', 'ngay_sinh', 'que_quan',
      'anh_cccd_mat_truoc', 'anh_cccd_mat_sau', 'da_dang_ky_tam_tru', 'trang_thai'
    ];
    const fields: string[] = [];
    const values: any[] = [];

    for (const key of allowedFields) {
      if (data[key] === undefined) continue;
      let value = data[key];
      if (key === 'gioi_tinh') value = normGioiTinh(value);
      if (key === 'trang_thai') value = normTrangThai(value);
      if (key === 'da_dang_ky_tam_tru') value = value ? 1 : 0;
      if (['email', 'ngay_sinh', 'que_quan', 'anh_cccd_mat_truoc', 'anh_cccd_mat_sau'].includes(key)) {
        value = value || null;
      }
      fields.push(`${key} = ?`);
      values.push(value);
    }
    if (fields.length === 0) return;
    values.push(id);
    await pool.query(`UPDATE nguoi_thue SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  static async delete(id: number) {
    const [rows]: any = await pool.query('SELECT tai_khoan_id FROM nguoi_thue WHERE id = ?', [id]);
    if (rows.length === 0) throw new AppError(404, 'Không tìm thấy người thuê');

    const [[hd]]: any = await pool.query('SELECT COUNT(*) AS c FROM hop_dong WHERE chu_hop_dong_id = ?', [id]);
    const [[tv]]: any = await pool.query('SELECT COUNT(*) AS c FROM thanh_vien_phong WHERE nguoi_thue_id = ?', [id]);
    const [[sc]]: any = await pool.query('SELECT COUNT(*) AS c FROM su_co WHERE nguoi_bao_id = ?', [id]);
    if (Number(hd.c) + Number(tv.c) + Number(sc.c) > 0) {
      throw new AppError(
        400,
        'Không thể xóa: người thuê đã có hợp đồng / sự cố trong hệ thống. Hãy chuyển trạng thái sang "Đã chuyển đi".'
      );
    }

    await pool.query('DELETE FROM nguoi_thue WHERE id = ?', [id]);
    if (rows[0].tai_khoan_id) {
      await pool.query('DELETE FROM tai_khoan WHERE id = ?', [rows[0].tai_khoan_id]);
    }
  }
}
