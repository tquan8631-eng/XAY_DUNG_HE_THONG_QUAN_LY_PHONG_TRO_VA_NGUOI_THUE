import pool from '../config/database';
import { AppError, buildUpdate } from '../utils/helpers';

const LOAI = ['theo_chi_so', 'co_dinh'];

export class DichVuService {
  static async getAll() {
    const [rows] = await pool.query(
      `SELECT dv.*, (SELECT COUNT(*) FROM dich_vu_phong dvp WHERE dvp.dich_vu_id = dv.id) AS so_phong_su_dung
       FROM dich_vu dv ORDER BY dv.id ASC`
    );
    return rows;
  }

  private static normalize(data: any, partial = false) {
    const d: any = { ...data };
    if (!partial || d.ten_dich_vu !== undefined) {
      if (!d.ten_dich_vu?.trim()) throw new AppError(400, 'Tên dịch vụ không được để trống');
      d.ten_dich_vu = d.ten_dich_vu.trim();
    }
    if (!partial || d.don_gia !== undefined) {
      if (isNaN(Number(d.don_gia)) || Number(d.don_gia) < 0) throw new AppError(400, 'Đơn giá không hợp lệ');
      d.don_gia = Number(d.don_gia);
    }
    if (!partial || d.don_vi_tinh !== undefined) {
      if (!d.don_vi_tinh?.trim()) throw new AppError(400, 'Đơn vị tính không được để trống');
    }
    if (!partial || d.loai_dich_vu !== undefined) {
      d.loai_dich_vu = String(d.loai_dich_vu || '').toLowerCase();
      if (!LOAI.includes(d.loai_dich_vu)) throw new AppError(400, 'Loại dịch vụ không hợp lệ');
    }
    return d;
  }

  static async create(data: any) {
    const d = DichVuService.normalize(data);
    const [result]: any = await pool.query(
      'INSERT INTO dich_vu (ten_dich_vu, don_gia, don_vi_tinh, loai_dich_vu) VALUES (?, ?, ?, ?)',
      [d.ten_dich_vu, d.don_gia, d.don_vi_tinh.trim(), d.loai_dich_vu]
    );

    if (data.ap_dung_tat_ca) {
      await pool.query('INSERT IGNORE INTO dich_vu_phong (phong_id, dich_vu_id) SELECT id, ? FROM phong_tro', [result.insertId]);
    }
    return result.insertId;
  }

  static async update(id: number, data: any) {
    const d = DichVuService.normalize(data, true);
    const { fields, values } = buildUpdate(d, ['ten_dich_vu', 'don_gia', 'don_vi_tinh', 'loai_dich_vu']);
    if (fields.length === 0) return;
    values.push(id);
    await pool.query(`UPDATE dich_vu SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  static async delete(id: number) {
    await pool.query('DELETE FROM dich_vu WHERE id = ?', [id]);
  }

  static async getDichVuPhong(phongId: number) {
    const [rows] = await pool.query(
      'SELECT dv.*, dvp.phong_id, dvp.dich_vu_id FROM dich_vu dv JOIN dich_vu_phong dvp ON dv.id = dvp.dich_vu_id WHERE dvp.phong_id = ?',
      [phongId]
    );
    return rows;
  }

  static async addDichVuPhong(phongId: number, dichVuId: number, tatCaPhong = false) {
    if (!dichVuId) throw new AppError(400, 'Vui lòng chọn dịch vụ');
    if (tatCaPhong) {
      await pool.query('INSERT IGNORE INTO dich_vu_phong (phong_id, dich_vu_id) SELECT id, ? FROM phong_tro', [dichVuId]);
      return;
    }
    if (!phongId) throw new AppError(400, 'Vui lòng chọn phòng');
    await pool.query('INSERT IGNORE INTO dich_vu_phong (phong_id, dich_vu_id) VALUES (?, ?)', [phongId, dichVuId]);
  }

  static async removeDichVuPhong(phongId: number, dichVuId: number) {
    await pool.query('DELETE FROM dich_vu_phong WHERE phong_id = ? AND dich_vu_id = ?', [phongId, dichVuId]);
  }
}
