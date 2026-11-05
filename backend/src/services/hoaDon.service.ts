import pool from '../config/database';
import { AppError, buildUpdate, isThangNam } from '../utils/helpers';

const SELECT_HOA_DON = `
  SELECT h.*, p.so_phong, p.id AS phong_id, hd.ma_hop_dong, hd.chu_hop_dong_id,
         nt.ho_ten, nt.so_dien_thoai,
         (h.tong_tien - h.so_tien_da_tra) AS con_lai
  FROM hoa_don h
  JOIN hop_dong hd ON h.hop_dong_id = hd.id
  JOIN phong_tro p ON hd.phong_id = p.id
  JOIN nguoi_thue nt ON hd.chu_hop_dong_id = nt.id
`;

const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x.toISOString().slice(0, 10);
};

const laDien = (ten: string) => /điện|dien/i.test(ten);
const laNuoc = (ten: string) => /nước|nuoc/i.test(ten);

export class HoaDonService {
  static async capNhatQuaHan() {
    await pool.query(
      `UPDATE hoa_don SET trang_thai = 'qua_han'
       WHERE trang_thai IN ('chua_thanhtoan', 'thanhtoan_motphan') AND han_thanhtoan < CURDATE()`
    );
  }

  static async getAll(filters: { thang_nam?: string; phong_id?: string; trang_thai?: string; search?: string; hop_dong_id?: string }, limit: number, offset: number) {
    await HoaDonService.capNhatQuaHan();

    const where: string[] = [];
    const params: any[] = [];
    if (filters.thang_nam) {
      where.push('h.thang_nam = ?');
      params.push(filters.thang_nam);
    }
    if (filters.phong_id) {
      where.push('hd.phong_id = ?');
      params.push(filters.phong_id);
    }
    if (filters.hop_dong_id) {
      where.push('h.hop_dong_id = ?');
      params.push(filters.hop_dong_id);
    }
    if (filters.trang_thai) {
      where.push('h.trang_thai = ?');
      params.push(filters.trang_thai.toLowerCase());
    }
    if (filters.search) {
      where.push('(h.ma_hoa_don LIKE ? OR p.so_phong LIKE ? OR nt.ho_ten LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }
    const whereSql = where.length ? ' WHERE ' + where.join(' AND ') : '';

    const [rows] = await pool.query(`${SELECT_HOA_DON} ${whereSql} ORDER BY h.thang_nam DESC, h.id DESC LIMIT ? OFFSET ?`, [
      ...params,
      limit,
      offset
    ]);
    const [countRows]: any = await pool.query(
      `SELECT COUNT(*) AS total, COALESCE(SUM(h.tong_tien),0) AS tong_tien, COALESCE(SUM(h.so_tien_da_tra),0) AS da_thu
       FROM hoa_don h JOIN hop_dong hd ON h.hop_dong_id = hd.id
       JOIN phong_tro p ON hd.phong_id = p.id JOIN nguoi_thue nt ON hd.chu_hop_dong_id = nt.id ${whereSql}`,
      params
    );

    return {
      data: rows,
      total: Number(countRows[0].total),
      tong_hop: { tong_tien: Number(countRows[0].tong_tien), da_thu: Number(countRows[0].da_thu) }
    };
  }

  static async getById(id: number) {
    await HoaDonService.capNhatQuaHan();
    const [rows]: any = await pool.query(`${SELECT_HOA_DON} WHERE h.id = ?`, [id]);
    if (rows.length === 0) throw new AppError(404, 'Không tìm thấy hóa đơn');
    const hoaDon = rows[0];

    const [chiTiet] = await pool.query('SELECT * FROM chi_tiet_hoa_don WHERE hoa_don_id = ? ORDER BY id', [id]);
    const [thanhToan] = await pool.query('SELECT * FROM nhat_ky_thanh_toan WHERE hoa_don_id = ? ORDER BY ngay_thanh_toan DESC', [id]);
    const [phong]: any = await pool.query('SELECT id, so_phong, tang, dien_tich FROM phong_tro WHERE id = ?', [hoaDon.phong_id]);
    const [chiSo]: any = await pool.query('SELECT * FROM chi_so_dien_nuoc WHERE phong_id = ? AND thang_nam = ?', [
      hoaDon.phong_id,
      hoaDon.thang_nam
    ]);

    return {
      ...hoaDon,
      phong: phong[0] || null,
      chu_hop_dong: { id: hoaDon.chu_hop_dong_id, ho_ten: hoaDon.ho_ten, so_dien_thoai: hoaDon.so_dien_thoai },
      chi_so: chiSo[0] || null,
      chi_tiet: chiTiet,
      lich_su_thanh_toan: thanhToan
    };
  }

  static async createTuDong(hop_dong_id: number, thang_nam: string, han_thanhtoan?: string) {
    if (!hop_dong_id) throw new AppError(400, 'Vui lòng chọn hợp đồng');
    if (!isThangNam(thang_nam)) throw new AppError(400, 'Kỳ hóa đơn không hợp lệ (YYYY-MM)');

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [hdRows]: any = await conn.query(
        `SELECT hd.*, p.gia_thue, p.so_phong FROM hop_dong hd JOIN phong_tro p ON hd.phong_id = p.id WHERE hd.id = ?`,
        [hop_dong_id]
      );
      if (hdRows.length === 0) throw new AppError(404, 'Không tìm thấy hợp đồng');
      const hopDong = hdRows[0];
      if (hopDong.trang_thai !== 'con_han') throw new AppError(400, `Hợp đồng ${hopDong.ma_hop_dong} không còn hiệu lực`);

      const [dup]: any = await conn.query('SELECT id FROM hoa_don WHERE hop_dong_id = ? AND thang_nam = ?', [hop_dong_id, thang_nam]);
      if (dup.length > 0) throw new AppError(400, `Phòng ${hopDong.so_phong} đã có hóa đơn kỳ ${thang_nam}`);

      const [dvRows]: any = await conn.query(
        'SELECT dv.* FROM dich_vu dv JOIN dich_vu_phong dvp ON dv.id = dvp.dich_vu_id WHERE dvp.phong_id = ? ORDER BY dv.id',
        [hopDong.phong_id]
      );
      const [csRows]: any = await conn.query('SELECT * FROM chi_so_dien_nuoc WHERE phong_id = ? AND thang_nam = ?', [
        hopDong.phong_id,
        thang_nam
      ]);
      const cs = csRows[0];
      if (!cs && dvRows.some((d: any) => d.loai_dich_vu === 'theo_chi_so')) {
        throw new AppError(400, `Phòng ${hopDong.so_phong} chưa có chỉ số điện nước kỳ ${thang_nam}`);
      }
      const [[tv]]: any = await conn.query('SELECT COUNT(*) AS c FROM thanh_vien_phong WHERE hop_dong_id = ?', [hop_dong_id]);
      const soNguoi = Math.max(Number(tv.c), 1);

      const chiTiet: any[] = [
        { ten_dich_vu: 'Tiền phòng', don_gia: Number(hopDong.gia_thue), so_luong: 1, thanh_tien: Number(hopDong.gia_thue) }
      ];

      for (const dv of dvRows) {
        let so_luong = 1;
        if (dv.loai_dich_vu === 'theo_chi_so') {
          if (laDien(dv.ten_dich_vu)) so_luong = cs.chi_so_dien_moi - cs.chi_so_dien_cu;
          else if (laNuoc(dv.ten_dich_vu)) so_luong = cs.chi_so_nuoc_moi - cs.chi_so_nuoc_cu;
        } else if (/người|nguoi/i.test(dv.don_vi_tinh)) {
          so_luong = soNguoi;
        }
        chiTiet.push({
          ten_dich_vu: dv.ten_dich_vu,
          don_gia: Number(dv.don_gia),
          so_luong,
          thanh_tien: Number(dv.don_gia) * so_luong
        });
      }

      const tong_tien = chiTiet.reduce((s, c) => s + c.thanh_tien, 0);
      const ma_hoa_don = `HD${thang_nam.replace('-', '')}-${String(hop_dong_id).padStart(4, '0')}`;
      const han = han_thanhtoan || addDays(new Date(), 7);

      const [ins]: any = await conn.query(
        `INSERT INTO hoa_don (ma_hoa_don, hop_dong_id, thang_nam, tien_phong, tong_tien, han_thanhtoan)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [ma_hoa_don, hop_dong_id, thang_nam, hopDong.gia_thue, tong_tien, han]
      );
      for (const ct of chiTiet) {
        await conn.query(
          'INSERT INTO chi_tiet_hoa_don (hoa_don_id, ten_dich_vu, don_gia, so_luong, thanh_tien) VALUES (?, ?, ?, ?, ?)',
          [ins.insertId, ct.ten_dich_vu, ct.don_gia, ct.so_luong, ct.thanh_tien]
        );
      }

      await conn.commit();
      return ins.insertId;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  static async createHangLoat(thang_nam: string, han_thanhtoan?: string) {
    if (!isThangNam(thang_nam)) throw new AppError(400, 'Kỳ hóa đơn không hợp lệ (YYYY-MM)');
    const [hds]: any = await pool.query(
      `SELECT hd.id, p.so_phong FROM hop_dong hd JOIN phong_tro p ON hd.phong_id = p.id
       WHERE hd.trang_thai = 'con_han'
         AND NOT EXISTS (SELECT 1 FROM hoa_don h WHERE h.hop_dong_id = hd.id AND h.thang_nam = ?)
       ORDER BY p.so_phong`,
      [thang_nam]
    );
    const thanh_cong: any[] = [];
    const loi: any[] = [];
    for (const hd of hds) {
      try {
        const id = await HoaDonService.createTuDong(hd.id, thang_nam, han_thanhtoan);
        thanh_cong.push({ id, so_phong: hd.so_phong });
      } catch (e: any) {
        loi.push({ so_phong: hd.so_phong, message: e.message || 'Lỗi không xác định' });
      }
    }
    return { thanh_cong, loi };
  }

  static async update(id: number, data: any) {
    const payload: any = {};
    if (data.han_thanhtoan) payload.han_thanhtoan = data.han_thanhtoan;
    if (data.trang_thai) {
      const t = String(data.trang_thai).toLowerCase();
      if (!['chua_thanhtoan', 'thanhtoan_motphan', 'da_thanhtoan', 'qua_han'].includes(t)) {
        throw new AppError(400, 'Trạng thái không hợp lệ');
      }
      payload.trang_thai = t;
    }
    const { fields, values } = buildUpdate(payload, ['han_thanhtoan', 'trang_thai']);
    if (fields.length === 0) return;
    values.push(id);
    await pool.query(`UPDATE hoa_don SET ${fields.join(', ')} WHERE id = ?`, values);

    if (payload.han_thanhtoan && !payload.trang_thai) {
      await pool.query(
        `UPDATE hoa_don SET trang_thai = IF(so_tien_da_tra > 0, 'thanhtoan_motphan', 'chua_thanhtoan')
         WHERE id = ? AND trang_thai = 'qua_han' AND han_thanhtoan >= CURDATE()`,
        [id]
      );
    }
  }

  static async delete(id: number) {
    const [[tt]]: any = await pool.query('SELECT COUNT(*) AS c FROM nhat_ky_thanh_toan WHERE hoa_don_id = ?', [id]);
    if (Number(tt.c) > 0) throw new AppError(400, 'Không thể xóa hóa đơn đã có thanh toán');
    await pool.query('DELETE FROM hoa_don WHERE id = ?', [id]);
  }
}
