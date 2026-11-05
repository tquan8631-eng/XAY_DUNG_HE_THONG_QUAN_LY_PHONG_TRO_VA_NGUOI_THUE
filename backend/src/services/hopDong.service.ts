import pool from '../config/database';
import { AppError, buildUpdate, toLower } from '../utils/helpers';

const SELECT_HOP_DONG = `
  SELECT
    hd.*,
    p.so_phong, p.gia_thue, p.tang, p.dien_tich, p.so_nguoi_toi_da,
    nt.ho_ten AS ten_nguoi_thue, nt.so_dien_thoai, nt.can_cuoc_cong_dan AS cccd, nt.email,
    DATEDIFF(hd.ngay_ket_thuc, CURDATE()) AS so_ngay_con_lai,
    (SELECT COUNT(*) FROM thanh_vien_phong tv WHERE tv.hop_dong_id = hd.id) AS so_thanh_vien
  FROM hop_dong hd
  JOIN phong_tro p ON hd.phong_id = p.id
  JOIN nguoi_thue nt ON hd.chu_hop_dong_id = nt.id
`;

const format = (row: any) => ({
  ...row,
  ho_ten: row.ten_nguoi_thue,
  so_ngay_con_lai: Number(row.so_ngay_con_lai),
  so_thanh_vien: Number(row.so_thanh_vien),
  phong: { id: row.phong_id, so_phong: row.so_phong, gia_thue: row.gia_thue, tang: row.tang, dien_tich: row.dien_tich },
  chu_hop_dong: {
    id: row.chu_hop_dong_id,
    ho_ten: row.ten_nguoi_thue,
    so_dien_thoai: row.so_dien_thoai,
    cccd: row.cccd,
    email: row.email
  }
});

export class HopDongService {
  static async getAll(filters: { trang_thai?: string; sap_het_han?: string; search?: string; phong_id?: string }, limit: number, offset: number) {
    const where: string[] = [];
    const params: any[] = [];

    if (filters.trang_thai) {
      where.push('hd.trang_thai = ?');
      params.push(filters.trang_thai.toLowerCase());
    }
    if (filters.sap_het_han === 'true') {
      where.push(`hd.trang_thai = 'con_han' AND hd.ngay_ket_thuc <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)`);
    }
    if (filters.phong_id) {
      where.push('hd.phong_id = ?');
      params.push(filters.phong_id);
    }
    if (filters.search) {
      where.push('(hd.ma_hop_dong LIKE ? OR p.so_phong LIKE ? OR nt.ho_ten LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }
    const whereSql = where.length ? ' WHERE ' + where.join(' AND ') : '';

    const [rows]: any = await pool.query(`${SELECT_HOP_DONG} ${whereSql} ORDER BY hd.id DESC LIMIT ? OFFSET ?`, [
      ...params,
      limit,
      offset
    ]);
    const [countRows]: any = await pool.query(
      `SELECT COUNT(*) AS total FROM hop_dong hd
       JOIN phong_tro p ON hd.phong_id = p.id
       JOIN nguoi_thue nt ON hd.chu_hop_dong_id = nt.id ${whereSql}`,
      params
    );

    return { data: rows.map(format), total: Number(countRows[0]?.total || 0) };
  }

  static async getById(id: number) {
    const [rows]: any = await pool.query(`${SELECT_HOP_DONG} WHERE hd.id = ?`, [id]);
    if (rows.length === 0) throw new AppError(404, 'Không tìm thấy hợp đồng');

    const [thanhVien] = await pool.query(
      `SELECT tv.*, nt.ho_ten, nt.so_dien_thoai, nt.can_cuoc_cong_dan, nt.gioi_tinh, nt.trang_thai AS trang_thai_nguoi_thue
       FROM thanh_vien_phong tv JOIN nguoi_thue nt ON tv.nguoi_thue_id = nt.id
       WHERE tv.hop_dong_id = ? ORDER BY tv.la_chu_hop_dong DESC, tv.id`,
      [id]
    );
    const [hoaDon] = await pool.query(
      'SELECT id, ma_hoa_don, thang_nam, tong_tien, so_tien_da_tra, trang_thai, han_thanhtoan FROM hoa_don WHERE hop_dong_id = ? ORDER BY thang_nam DESC',
      [id]
    );

    return { ...format(rows[0]), thanh_vien: thanhVien, hoa_don: hoaDon };
  }

  static async create(data: any) {
    const { phong_id, chu_hop_dong_id, ngay_bat_dau, ngay_ket_thuc, tien_coc, trang_thai_tien_coc, ngay_chot_tien_hang_thang } = data;
    const ma_hop_dong = data.ma_hop_dong?.trim() || `HD${Date.now().toString().slice(-8)}`;

    if (!phong_id) throw new AppError(400, 'Vui lòng chọn phòng');
    if (!chu_hop_dong_id) throw new AppError(400, 'Vui lòng chọn người đứng tên hợp đồng');
    if (!ngay_bat_dau || !ngay_ket_thuc) throw new AppError(400, 'Vui lòng nhập ngày bắt đầu và ngày kết thúc');
    if (new Date(ngay_ket_thuc) <= new Date(ngay_bat_dau)) throw new AppError(400, 'Ngày kết thúc phải sau ngày bắt đầu');
    const ngayChot = Number(ngay_chot_tien_hang_thang || 1);
    if (ngayChot < 1 || ngayChot > 28) throw new AppError(400, 'Ngày chốt tiền hàng tháng phải từ 1 đến 28');

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [phong]: any = await conn.query('SELECT * FROM phong_tro WHERE id = ? FOR UPDATE', [phong_id]);
      if (phong.length === 0) throw new AppError(404, 'Không tìm thấy phòng');
      if (phong[0].trang_thai === 'dang_bao_tri') throw new AppError(400, 'Phòng đang bảo trì, không thể lập hợp đồng');

      const [active]: any = await conn.query(
        `SELECT id FROM hop_dong WHERE phong_id = ? AND trang_thai = 'con_han'`,
        [phong_id]
      );
      if (active.length > 0) throw new AppError(400, `Phòng ${phong[0].so_phong} đang có hợp đồng còn hạn`);

      const [nt]: any = await conn.query('SELECT id FROM nguoi_thue WHERE id = ?', [chu_hop_dong_id]);
      if (nt.length === 0) throw new AppError(404, 'Không tìm thấy người thuê');

      const [result]: any = await conn.query(
        `INSERT INTO hop_dong (ma_hop_dong, phong_id, chu_hop_dong_id, ngay_bat_dau, ngay_ket_thuc, tien_coc,
          trang_thai_tien_coc, ngay_chot_tien_hang_thang, trang_thai)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'con_han')`,
        [ma_hop_dong, phong_id, chu_hop_dong_id, ngay_bat_dau, ngay_ket_thuc, Number(tien_coc) || 0,
          toLower(trang_thai_tien_coc, 'dang_giu'), ngayChot]
      );

      await conn.query(`UPDATE phong_tro SET trang_thai = 'da_thue' WHERE id = ?`, [phong_id]);
      await conn.query(
        `INSERT INTO thanh_vien_phong (hop_dong_id, nguoi_thue_id, la_chu_hop_dong, ngay_vao_o) VALUES (?, ?, 1, ?)`,
        [result.insertId, chu_hop_dong_id, ngay_bat_dau]
      );
      await conn.query(`UPDATE nguoi_thue SET trang_thai = 'dang_thue' WHERE id = ?`, [chu_hop_dong_id]);

      await conn.commit();
      return result.insertId;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  static async update(id: number, data: any) {
    const [cur]: any = await pool.query('SELECT * FROM hop_dong WHERE id = ?', [id]);
    if (cur.length === 0) throw new AppError(404, 'Không tìm thấy hợp đồng');
    const hopDong = cur[0];

    const payload: any = { ...data };
    if (payload.trang_thai) payload.trang_thai = String(payload.trang_thai).toLowerCase();
    if (payload.trang_thai_tien_coc) payload.trang_thai_tien_coc = String(payload.trang_thai_tien_coc).toLowerCase();
    if (payload.tien_coc !== undefined) payload.tien_coc = Number(payload.tien_coc) || 0;

    const bd = payload.ngay_bat_dau || hopDong.ngay_bat_dau;
    const kt = payload.ngay_ket_thuc || hopDong.ngay_ket_thuc;
    if (new Date(kt) <= new Date(bd)) throw new AppError(400, 'Ngày kết thúc phải sau ngày bắt đầu');

    if (payload.trang_thai === 'con_han' && hopDong.trang_thai !== 'con_han') {
      const [other]: any = await pool.query(
        `SELECT id FROM hop_dong WHERE phong_id = ? AND trang_thai = 'con_han' AND id <> ?`,
        [hopDong.phong_id, id]
      );
      if (other.length > 0) throw new AppError(400, 'Phòng này đang có hợp đồng còn hạn khác');
    }

    const { fields, values } = buildUpdate(payload, [
      'ngay_bat_dau', 'ngay_ket_thuc', 'tien_coc', 'trang_thai_tien_coc', 'ngay_chot_tien_hang_thang', 'trang_thai'
    ]);
    if (fields.length === 0) return;
    values.push(id);
    await pool.query(`UPDATE hop_dong SET ${fields.join(', ')} WHERE id = ?`, values);

    if (payload.trang_thai === 'het_han' || payload.trang_thai === 'da_huy') {
      await pool.query(`UPDATE phong_tro SET trang_thai = 'trong' WHERE id = ?`, [hopDong.phong_id]);

      await pool.query(
        `UPDATE nguoi_thue nt
         JOIN thanh_vien_phong tv ON tv.nguoi_thue_id = nt.id AND tv.hop_dong_id = ?
         SET nt.trang_thai = 'da_chuyen_di'
         WHERE NOT EXISTS (
           SELECT 1 FROM thanh_vien_phong tv2 JOIN hop_dong h2 ON tv2.hop_dong_id = h2.id
           WHERE tv2.nguoi_thue_id = nt.id AND h2.trang_thai = 'con_han'
         )`,
        [id]
      );
    }
    if (payload.trang_thai === 'con_han') {
      await pool.query(`UPDATE phong_tro SET trang_thai = 'da_thue' WHERE id = ?`, [hopDong.phong_id]);
      await pool.query(
        `UPDATE nguoi_thue nt JOIN thanh_vien_phong tv ON tv.nguoi_thue_id = nt.id AND tv.hop_dong_id = ?
         SET nt.trang_thai = 'dang_thue'`,
        [id]
      );
    }
  }

  static async delete(id: number) {
    const [[hd]]: any = await pool.query('SELECT COUNT(*) AS c FROM hoa_don WHERE hop_dong_id = ?', [id]);
    if (Number(hd.c) > 0) {
      throw new AppError(400, 'Không thể xóa hợp đồng đã phát sinh hóa đơn. Hãy chuyển trạng thái sang "Đã hủy" hoặc "Hết hạn".');
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [rows]: any = await conn.query('SELECT phong_id, trang_thai FROM hop_dong WHERE id = ?', [id]);
      if (rows.length === 0) throw new AppError(404, 'Không tìm thấy hợp đồng');

      await conn.query('DELETE FROM thanh_vien_phong WHERE hop_dong_id = ?', [id]);
      await conn.query('DELETE FROM hop_dong WHERE id = ?', [id]);
      if (rows[0].trang_thai === 'con_han') {
        await conn.query(`UPDATE phong_tro SET trang_thai = 'trong' WHERE id = ?`, [rows[0].phong_id]);
      }
      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }
}
