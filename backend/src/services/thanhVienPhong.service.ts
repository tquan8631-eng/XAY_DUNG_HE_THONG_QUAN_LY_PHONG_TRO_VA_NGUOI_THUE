import pool from '../config/database';
import { AppError } from '../utils/helpers';

export class ThanhVienPhongService {
  static async getAll(hopDongId?: string) {
    const params: any[] = [];
    let where = '';
    if (hopDongId) {
      where = 'WHERE tv.hop_dong_id = ?';
      params.push(hopDongId);
    }
    const [rows] = await pool.query(
      `SELECT tv.*, nt.ho_ten, nt.so_dien_thoai, nt.can_cuoc_cong_dan, hd.ma_hop_dong, p.so_phong
       FROM thanh_vien_phong tv
       JOIN nguoi_thue nt ON tv.nguoi_thue_id = nt.id
       JOIN hop_dong hd ON tv.hop_dong_id = hd.id
       JOIN phong_tro p ON hd.phong_id = p.id
       ${where}
       ORDER BY tv.la_chu_hop_dong DESC, tv.id`,
      params
    );
    return rows;
  }

  static async create(data: any) {
    const { hop_dong_id, nguoi_thue_id, ngay_vao_o } = data;
    if (!hop_dong_id || !nguoi_thue_id) throw new AppError(400, 'Thiếu hợp đồng hoặc người thuê');

    const [hd]: any = await pool.query(
      `SELECT hd.*, p.so_nguoi_toi_da FROM hop_dong hd JOIN phong_tro p ON hd.phong_id = p.id WHERE hd.id = ?`,
      [hop_dong_id]
    );
    if (hd.length === 0) throw new AppError(404, 'Không tìm thấy hợp đồng');
    if (hd[0].trang_thai !== 'con_han') throw new AppError(400, 'Chỉ thêm thành viên vào hợp đồng còn hạn');

    const [[cnt]]: any = await pool.query('SELECT COUNT(*) AS c FROM thanh_vien_phong WHERE hop_dong_id = ?', [hop_dong_id]);
    if (Number(cnt.c) >= Number(hd[0].so_nguoi_toi_da)) {
      throw new AppError(400, `Phòng đã đủ số người tối đa (${hd[0].so_nguoi_toi_da} người)`);
    }

    const [dup]: any = await pool.query(
      `SELECT tv.id FROM thanh_vien_phong tv JOIN hop_dong h ON tv.hop_dong_id = h.id
       WHERE tv.nguoi_thue_id = ? AND h.trang_thai = 'con_han'`,
      [nguoi_thue_id]
    );
    if (dup.length > 0) throw new AppError(400, 'Người này đang ở trong một hợp đồng còn hạn khác');

    const [result]: any = await pool.query(
      'INSERT INTO thanh_vien_phong (hop_dong_id, nguoi_thue_id, la_chu_hop_dong, ngay_vao_o) VALUES (?, ?, 0, ?)',
      [hop_dong_id, nguoi_thue_id, ngay_vao_o || new Date().toISOString().slice(0, 10)]
    );
    await pool.query(`UPDATE nguoi_thue SET trang_thai = 'dang_thue' WHERE id = ?`, [nguoi_thue_id]);
    return result.insertId;
  }

  static async delete(id: number) {
    const [rows]: any = await pool.query('SELECT * FROM thanh_vien_phong WHERE id = ?', [id]);
    if (rows.length === 0) throw new AppError(404, 'Không tìm thấy thành viên');
    if (rows[0].la_chu_hop_dong) throw new AppError(400, 'Không thể xóa người đứng tên hợp đồng');
    await pool.query('DELETE FROM thanh_vien_phong WHERE id = ?', [id]);
    await pool.query(
      `UPDATE nguoi_thue SET trang_thai = 'da_chuyen_di' WHERE id = ? AND NOT EXISTS (
         SELECT 1 FROM thanh_vien_phong tv JOIN hop_dong h ON tv.hop_dong_id = h.id
         WHERE tv.nguoi_thue_id = ? AND h.trang_thai = 'con_han')`,
      [rows[0].nguoi_thue_id, rows[0].nguoi_thue_id]
    );
  }
}
