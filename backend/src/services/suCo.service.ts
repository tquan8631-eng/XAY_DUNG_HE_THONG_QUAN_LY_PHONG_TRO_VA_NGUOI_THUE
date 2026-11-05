import pool from '../config/database';
import { AppError, buildUpdate } from '../utils/helpers';

export const MUC_DO = ['thap', 'trung_binh', 'cao', 'khan_cap'];
export const TRANG_THAI_SU_CO = ['cho_xuly', 'dang_xuly', 'da_xuly', 'tu_choy'];

const SELECT_SU_CO = `
  SELECT s.*, p.so_phong, nt.ho_ten AS nguoi_bao, nt.ho_ten, nt.so_dien_thoai
  FROM su_co s
  JOIN phong_tro p ON s.phong_id = p.id
  JOIN nguoi_thue nt ON s.nguoi_bao_id = nt.id
`;

export class SuCoService {
  static async getAll(filters: { trang_thai?: string; phong_id?: string; muc_do_uu_tien?: string; search?: string }, limit: number, offset: number) {
    const where: string[] = [];
    const params: any[] = [];
    if (filters.trang_thai) {
      where.push('s.trang_thai = ?');
      params.push(filters.trang_thai);
    }
    if (filters.phong_id) {
      where.push('s.phong_id = ?');
      params.push(filters.phong_id);
    }
    if (filters.muc_do_uu_tien) {
      where.push('s.muc_do_uu_tien = ?');
      params.push(filters.muc_do_uu_tien);
    }
    if (filters.search) {
      where.push('(s.tieu_de LIKE ? OR p.so_phong LIKE ? OR nt.ho_ten LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }
    const whereSql = where.length ? ' WHERE ' + where.join(' AND ') : '';

    const [rows] = await pool.query(
      `${SELECT_SU_CO} ${whereSql}
       ORDER BY FIELD(s.trang_thai, 'cho_xuly', 'dang_xuly', 'da_xuly', 'tu_choy'),
                FIELD(s.muc_do_uu_tien, 'khan_cap', 'cao', 'trung_binh', 'thap'), s.id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [countRows]: any = await pool.query(
      `SELECT COUNT(*) AS total FROM su_co s JOIN phong_tro p ON s.phong_id = p.id JOIN nguoi_thue nt ON s.nguoi_bao_id = nt.id ${whereSql}`,
      params
    );
    return { data: rows, total: Number(countRows[0].total) };
  }

  static async getById(id: number) {
    const [rows]: any = await pool.query(`${SELECT_SU_CO} WHERE s.id = ?`, [id]);
    if (rows.length === 0) throw new AppError(404, 'Không tìm thấy sự cố');
    return rows[0];
  }

  static async create(data: any) {
    const { phong_id, tieu_de, mo_ta, hinh_anh } = data;
    let { nguoi_bao_id } = data;
    if (!phong_id) throw new AppError(400, 'Vui lòng chọn phòng');
    if (!tieu_de?.trim()) throw new AppError(400, 'Tiêu đề không được để trống');
    const mucDo = MUC_DO.includes(data.muc_do_uu_tien) ? data.muc_do_uu_tien : 'trung_binh';

    if (!nguoi_bao_id) {
      const [hd]: any = await pool.query(
        `SELECT chu_hop_dong_id FROM hop_dong WHERE phong_id = ? AND trang_thai = 'con_han' ORDER BY id DESC LIMIT 1`,
        [phong_id]
      );
      if (hd.length === 0) throw new AppError(400, 'Phòng này chưa có người thuê, không thể ghi nhận sự cố');
      nguoi_bao_id = hd[0].chu_hop_dong_id;
    }

    const [result]: any = await pool.query(
      'INSERT INTO su_co (phong_id, nguoi_bao_id, tieu_de, mo_ta, hinh_anh, muc_do_uu_tien, trang_thai) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [phong_id, nguoi_bao_id, tieu_de.trim(), mo_ta || null, hinh_anh || null, mucDo,
        TRANG_THAI_SU_CO.includes(data.trang_thai) ? data.trang_thai : 'cho_xuly']
    );
    return result.insertId;
  }

  static async update(id: number, data: any) {
    if (data.muc_do_uu_tien && !MUC_DO.includes(data.muc_do_uu_tien)) throw new AppError(400, 'Mức độ ưu tiên không hợp lệ');
    if (data.trang_thai && !TRANG_THAI_SU_CO.includes(data.trang_thai)) throw new AppError(400, 'Trạng thái không hợp lệ');
    const { fields, values } = buildUpdate(data, ['tieu_de', 'mo_ta', 'hinh_anh', 'muc_do_uu_tien', 'trang_thai']);
    if (fields.length === 0) return;
    values.push(id);
    await pool.query(`UPDATE su_co SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  static async delete(id: number) {
    await pool.query('DELETE FROM su_co WHERE id = ?', [id]);
  }
}
