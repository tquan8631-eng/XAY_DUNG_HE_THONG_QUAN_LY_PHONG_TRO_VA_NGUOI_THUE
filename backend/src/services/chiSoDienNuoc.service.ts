import pool from '../config/database';
import { AppError, buildUpdate, isThangNam } from '../utils/helpers';

export class ChiSoDienNuocService {
  static async getAll(phong_id: string, thang_nam: string, limit: number, offset: number) {
    const where: string[] = [];
    const params: any[] = [];
    if (phong_id) {
      where.push('c.phong_id = ?');
      params.push(phong_id);
    }
    if (thang_nam) {
      where.push('c.thang_nam = ?');
      params.push(thang_nam);
    }
    const whereSql = where.length ? ' WHERE ' + where.join(' AND ') : '';

    const [rows] = await pool.query(
      `SELECT c.*, p.so_phong,
              (c.chi_so_dien_moi - c.chi_so_dien_cu) AS dien_tieu_thu,
              (c.chi_so_nuoc_moi - c.chi_so_nuoc_cu) AS nuoc_tieu_thu
       FROM chi_so_dien_nuoc c JOIN phong_tro p ON c.phong_id = p.id
       ${whereSql}
       ORDER BY c.thang_nam DESC, p.so_phong ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [countRows]: any = await pool.query(`SELECT COUNT(*) AS total FROM chi_so_dien_nuoc c ${whereSql}`, params);
    return { data: rows, total: Number(countRows[0].total) };
  }

  static async getChiSoCu(phong_id: string, thang_nam: string) {
    const [rows]: any = await pool.query(
      `SELECT thang_nam, chi_so_dien_moi, chi_so_nuoc_moi FROM chi_so_dien_nuoc
       WHERE phong_id = ? AND thang_nam < ? ORDER BY thang_nam DESC LIMIT 1`,
      [phong_id, thang_nam || '9999-12']
    );
    if (rows.length === 0) return { chi_so_dien_cu: 0, chi_so_nuoc_cu: 0, tu_ky: null };
    return { chi_so_dien_cu: rows[0].chi_so_dien_moi, chi_so_nuoc_cu: rows[0].chi_so_nuoc_moi, tu_ky: rows[0].thang_nam };
  }

  private static validate(d: any) {
    const nums = ['chi_so_dien_cu', 'chi_so_dien_moi', 'chi_so_nuoc_cu', 'chi_so_nuoc_moi'];
    for (const k of nums) {
      if (d[k] === undefined || d[k] === null || d[k] === '' || isNaN(Number(d[k])) || Number(d[k]) < 0) {
        throw new AppError(400, 'Các chỉ số điện nước phải là số không âm');
      }
      d[k] = Number(d[k]);
    }
    if (d.chi_so_dien_moi < d.chi_so_dien_cu) throw new AppError(400, 'Chỉ số điện mới không được nhỏ hơn chỉ số cũ');
    if (d.chi_so_nuoc_moi < d.chi_so_nuoc_cu) throw new AppError(400, 'Chỉ số nước mới không được nhỏ hơn chỉ số cũ');
  }

  static async create(data: any) {
    const d = { ...data };
    if (!d.phong_id) throw new AppError(400, 'Vui lòng chọn phòng');
    if (!isThangNam(d.thang_nam)) throw new AppError(400, 'Kỳ ghi chỉ số không hợp lệ (YYYY-MM)');
    ChiSoDienNuocService.validate(d);

    const [dup]: any = await pool.query('SELECT id FROM chi_so_dien_nuoc WHERE phong_id = ? AND thang_nam = ?', [d.phong_id, d.thang_nam]);
    if (dup.length > 0) throw new AppError(400, `Phòng này đã được ghi chỉ số cho kỳ ${d.thang_nam}`);

    const [result]: any = await pool.query(
      `INSERT INTO chi_so_dien_nuoc (phong_id, thang_nam, chi_so_dien_cu, chi_so_dien_moi, chi_so_nuoc_cu, chi_so_nuoc_moi, ngay_ghi)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [d.phong_id, d.thang_nam, d.chi_so_dien_cu, d.chi_so_dien_moi, d.chi_so_nuoc_cu, d.chi_so_nuoc_moi,
        d.ngay_ghi || new Date().toISOString().slice(0, 10)]
    );
    return result.insertId;
  }

  static async update(id: number, data: any) {
    const [cur]: any = await pool.query('SELECT * FROM chi_so_dien_nuoc WHERE id = ?', [id]);
    if (cur.length === 0) throw new AppError(404, 'Không tìm thấy bản ghi');
    const merged = { ...cur[0], ...data };
    ChiSoDienNuocService.validate(merged);
    if (!isThangNam(merged.thang_nam)) throw new AppError(400, 'Kỳ ghi chỉ số không hợp lệ (YYYY-MM)');

    const { fields, values } = buildUpdate(merged, [
      'phong_id', 'thang_nam', 'chi_so_dien_cu', 'chi_so_dien_moi', 'chi_so_nuoc_cu', 'chi_so_nuoc_moi', 'ngay_ghi'
    ]);
    values.push(id);
    await pool.query(`UPDATE chi_so_dien_nuoc SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  static async delete(id: number) {
    await pool.query('DELETE FROM chi_so_dien_nuoc WHERE id = ?', [id]);
  }
}
