import pool from '../config/database';
import { HoaDonService } from './hoaDon.service';

export class DashboardService {
  static async getThongKe() {
    await HoaDonService.capNhatQuaHan();

    const [[congNo]]: any = await pool.query(`
      SELECT COALESCE(SUM(tong_tien - so_tien_da_tra), 0) AS total
      FROM hoa_don WHERE trang_thai <> 'da_thanhtoan'
    `);

    const [[sapHet]]: any = await pool.query(`
      SELECT COUNT(*) AS count FROM hop_dong
      WHERE trang_thai = 'con_han' AND ngay_ket_thuc <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
    `);

    const [[suCo]]: any = await pool.query(`
      SELECT COUNT(*) AS count FROM su_co WHERE trang_thai IN ('cho_xuly', 'dang_xuly')
    `);

    const [phongRows]: any = await pool.query(`
      SELECT trang_thai, COUNT(*) AS count
      FROM phong_tro
      GROUP BY trang_thai
    `);

    const [tongPhongRows]: any = await pool.query(`
      SELECT COUNT(*) AS count
      FROM phong_tro
    `);

    const [phongTrongRows]: any = await pool.query(`
      SELECT COUNT(*) AS count
      FROM phong_tro
      WHERE trang_thai = 'trong'
    `);

    const [phongDaThueRows]: any = await pool.query(`
      SELECT COUNT(*) AS count
      FROM phong_tro
      WHERE trang_thai = 'da_thue'
    `);

    const [ntRows]: any = await pool.query(`
      SELECT COUNT(*) AS count
      FROM nguoi_thue
      WHERE trang_thai = 'dang_thue'
    `);

    const [hdRows]: any = await pool.query(`
      SELECT COUNT(*) AS count
      FROM hop_dong
      WHERE trang_thai = 'con_han'
    `);

    const [hoaDonRows]: any = await pool.query(`
      SELECT COUNT(*) AS count
      FROM hoa_don
      WHERE trang_thai IN (
        'chua_thanhtoan',
        'thanhtoan_motphan',
        'qua_han'
      )
    `);

    const [doanhThuRows]: any = await pool.query(`
      SELECT COALESCE(SUM(so_tien), 0) AS total
      FROM nhat_ky_thanh_toan
      WHERE MONTH(ngay_thanh_toan) = MONTH(CURRENT_DATE())
        AND YEAR(ngay_thanh_toan) = YEAR(CURRENT_DATE())
    `);

    const [[khachMoi]]: any = await pool.query(
      `SELECT COUNT(*) AS count FROM yeu_cau_xem_phong WHERE trang_thai = 'moi'`
    );

    return {
      khach_xem_phong_moi: Number(khachMoi.count),
      tong_phong: Number(tongPhongRows[0].count),
      phong_trong: Number(phongTrongRows[0].count),
      phong_da_thue: Number(phongDaThueRows[0].count),
      phong_tro: phongRows,
      nguoi_thue_active: Number(ntRows[0].count),
      hop_dong_active: Number(hdRows[0].count),
      hoa_don_chua_tt: Number(hoaDonRows[0].count),
      doanh_thu_thang_nay: Number(doanhThuRows[0].total),
      cong_no: Number(congNo.total),
      hop_dong_sap_het: Number(sapHet.count),
      su_co_chua_xu_ly: Number(suCo.count)
    };
  }

  static async getDoanhThu(year: number) {
    const query = `
      SELECT
        MONTH(ngay_thanh_toan) AS thang,
        SUM(so_tien) AS doanh_thu
      FROM nhat_ky_thanh_toan
      WHERE YEAR(ngay_thanh_toan) = ?
      GROUP BY MONTH(ngay_thanh_toan)
      ORDER BY thang
    `;

    const [rows]: any = await pool.query(query, [year]);

    return Array.from({ length: 12 }, (_, i) => {
      const found = rows.find((r: any) => Number(r.thang) === i + 1);
      return { thang: i + 1, doanh_thu: Number(found?.doanh_thu || 0) };
    });
  }

  static async getHoaDonChuaTT() {
    await HoaDonService.capNhatQuaHan();
    const [rows] = await pool.query(`
      SELECT h.*, p.so_phong
      FROM hoa_don h
      JOIN hop_dong hd ON h.hop_dong_id = hd.id
      JOIN phong_tro p ON hd.phong_id = p.id
      WHERE h.trang_thai IN (
        'chua_thanhtoan',
        'thanhtoan_motphan',
        'qua_han'
      )
      ORDER BY h.han_thanhtoan ASC
      LIMIT 10
    `);

    return rows;
  }

  static async getHopDongSapHet() {
    const [rows] = await pool.query(`
      SELECT hd.*, p.so_phong, nt.ho_ten
      FROM hop_dong hd
      JOIN phong_tro p ON hd.phong_id = p.id
      JOIN nguoi_thue nt ON hd.chu_hop_dong_id = nt.id
      WHERE hd.trang_thai = 'con_han'
        AND hd.ngay_ket_thuc <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
      ORDER BY hd.ngay_ket_thuc ASC
      LIMIT 10
    `);

    return rows;
  }

  static async getSuCoMoi() {
    const [rows] = await pool.query(`
      SELECT s.*, p.so_phong
      FROM su_co s
      JOIN phong_tro p ON s.phong_id = p.id
      WHERE s.trang_thai = 'cho_xuly'
         OR s.trang_thai = 'dang_xuly'
      ORDER BY FIELD(s.muc_do_uu_tien, 'khan_cap', 'cao', 'trung_binh', 'thap'), s.ngay_tao DESC
      LIMIT 10
    `);

    return rows;
  }
}
