import pool from '../config/database';
import { AppError } from '../utils/helpers';

const PHUONG_THUC = ['tien_mat', 'chuyen_khoan', 'momo', 'vnpay'];

export class ThanhToanService {
  static async getAll(filters: { hoa_don_id?: string; phuong_thuc?: string; tu_ngay?: string; den_ngay?: string }, limit: number, offset: number) {
    const where: string[] = [];
    const params: any[] = [];
    if (filters.hoa_don_id) {
      where.push('t.hoa_don_id = ?');
      params.push(filters.hoa_don_id);
    }
    if (filters.phuong_thuc) {
      where.push('t.phuong_thuc = ?');
      params.push(filters.phuong_thuc.toLowerCase());
    }
    if (filters.tu_ngay) {
      where.push('DATE(t.ngay_thanh_toan) >= ?');
      params.push(filters.tu_ngay);
    }
    if (filters.den_ngay) {
      where.push('DATE(t.ngay_thanh_toan) <= ?');
      params.push(filters.den_ngay);
    }
    const whereSql = where.length ? ' WHERE ' + where.join(' AND ') : '';
    const from = `FROM nhat_ky_thanh_toan t
      JOIN hoa_don h ON t.hoa_don_id = h.id
      JOIN hop_dong hd ON h.hop_dong_id = hd.id
      JOIN phong_tro p ON hd.phong_id = p.id
      JOIN nguoi_thue nt ON hd.chu_hop_dong_id = nt.id`;

    const [rows] = await pool.query(
      `SELECT t.*, h.ma_hoa_don, h.thang_nam, hd.ma_hop_dong, p.so_phong, nt.ho_ten
       ${from} ${whereSql} ORDER BY t.ngay_thanh_toan DESC, t.id DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [countRows]: any = await pool.query(
      `SELECT COUNT(*) AS total, COALESCE(SUM(t.so_tien), 0) AS tong_tien ${from} ${whereSql}`,
      params
    );
    return { data: rows, total: Number(countRows[0].total), tong_tien: Number(countRows[0].tong_tien) };
  }

  static async create(data: any) {
    const { hoa_don_id, so_tien, phuong_thuc, ma_giao_dich, ghi_chu } = data;
    const pt = String(phuong_thuc || 'chuyen_khoan').toLowerCase();
    if (!PHUONG_THUC.includes(pt)) throw new AppError(400, 'Phương thức thanh toán không hợp lệ');
    const soTien = Number(so_tien);
    if (!soTien || soTien <= 0) throw new AppError(400, 'Số tiền thanh toán phải lớn hơn 0');

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [hdRows]: any = await conn.query('SELECT * FROM hoa_don WHERE id = ? FOR UPDATE', [hoa_don_id]);
      if (hdRows.length === 0) throw new AppError(404, 'Không tìm thấy hóa đơn');
      const hoaDon = hdRows[0];

      const conLai = Number(hoaDon.tong_tien) - Number(hoaDon.so_tien_da_tra);
      if (conLai <= 0) throw new AppError(400, 'Hóa đơn này đã được thanh toán đủ');
      if (soTien > conLai) throw new AppError(400, `Số tiền vượt quá số còn phải trả (${conLai.toLocaleString('vi-VN')} đ)`);

      const [result]: any = await conn.query(
        'INSERT INTO nhat_ky_thanh_toan (hoa_don_id, so_tien, phuong_thuc, ma_giao_dich, ghi_chu) VALUES (?, ?, ?, ?, ?)',
        [hoa_don_id, soTien, pt, ma_giao_dich || null, ghi_chu || null]
      );

      const daTra = Number(hoaDon.so_tien_da_tra) + soTien;
      const quaHan = new Date(hoaDon.han_thanhtoan) < new Date(new Date().toISOString().slice(0, 10));
      const trang_thai = daTra >= Number(hoaDon.tong_tien) ? 'da_thanhtoan' : quaHan ? 'qua_han' : 'thanhtoan_motphan';

      await conn.query('UPDATE hoa_don SET so_tien_da_tra = ?, trang_thai = ? WHERE id = ?', [daTra, trang_thai, hoa_don_id]);

      await conn.commit();
      return result.insertId;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }
}
