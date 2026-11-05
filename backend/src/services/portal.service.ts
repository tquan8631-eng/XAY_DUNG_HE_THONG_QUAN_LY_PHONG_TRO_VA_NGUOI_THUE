import pool from '../config/database';
import { AppError, buildUpdate } from '../utils/helpers';
import { HoaDonService } from './hoaDon.service';
import { MUC_DO } from './suCo.service';

export class PortalService {
  static async getNguoiThue(taiKhoanId: number) {
    const [rows]: any = await pool.query('SELECT * FROM nguoi_thue WHERE tai_khoan_id = ?', [taiKhoanId]);
    if (rows.length === 0) throw new AppError(403, 'Tài khoản chưa được liên kết với hồ sơ người thuê');
    return rows[0];
  }

  static async getHopDongHienTai(nguoiThueId: number) {
    const [rows]: any = await pool.query(
      `SELECT hd.*, tv.la_chu_hop_dong, tv.ngay_vao_o,
              p.so_phong, p.tang, p.gia_thue, p.dien_tich, p.so_nguoi_toi_da, p.mo_ta AS mo_ta_phong,
              nt.ho_ten AS ten_chu_hop_dong, nt.so_dien_thoai AS sdt_chu_hop_dong,
              DATEDIFF(hd.ngay_ket_thuc, CURDATE()) AS so_ngay_con_lai
       FROM thanh_vien_phong tv
       JOIN hop_dong hd ON tv.hop_dong_id = hd.id
       JOIN phong_tro p ON hd.phong_id = p.id
       JOIN nguoi_thue nt ON hd.chu_hop_dong_id = nt.id
       WHERE tv.nguoi_thue_id = ? AND hd.trang_thai = 'con_han'
       ORDER BY hd.id DESC LIMIT 1`,
      [nguoiThueId]
    );
    return rows[0] || null;
  }

  static async tongQuan(taiKhoanId: number) {
    await HoaDonService.capNhatQuaHan();
    const nt = await PortalService.getNguoiThue(taiKhoanId);
    const hopDong = await PortalService.getHopDongHienTai(nt.id);

    const [[no]]: any = await pool.query(
      `SELECT COUNT(*) AS so_hoa_don, COALESCE(SUM(h.tong_tien - h.so_tien_da_tra), 0) AS tong_no
       FROM hoa_don h JOIN thanh_vien_phong tv ON tv.hop_dong_id = h.hop_dong_id
       WHERE tv.nguoi_thue_id = ? AND h.trang_thai <> 'da_thanhtoan'`,
      [nt.id]
    );
    const [[sc]]: any = await pool.query(
      `SELECT COUNT(*) AS c FROM su_co WHERE nguoi_bao_id = ? AND trang_thai IN ('cho_xuly', 'dang_xuly')`,
      [nt.id]
    );
    const [hoaDonGanNhat]: any = await pool.query(
      `SELECT h.* FROM hoa_don h JOIN thanh_vien_phong tv ON tv.hop_dong_id = h.hop_dong_id
       WHERE tv.nguoi_thue_id = ? ORDER BY h.thang_nam DESC, h.id DESC LIMIT 1`,
      [nt.id]
    );
    const [chiSo]: any = hopDong
      ? await pool.query(
          `SELECT *, (chi_so_dien_moi - chi_so_dien_cu) AS dien_tieu_thu, (chi_so_nuoc_moi - chi_so_nuoc_cu) AS nuoc_tieu_thu
           FROM chi_so_dien_nuoc WHERE phong_id = ? ORDER BY thang_nam DESC LIMIT 6`,
          [hopDong.phong_id]
        )
      : [[]];

    return {
      nguoi_thue: { id: nt.id, ho_ten: nt.ho_ten, so_dien_thoai: nt.so_dien_thoai, trang_thai: nt.trang_thai },
      hop_dong: hopDong ? { ...hopDong, so_ngay_con_lai: Number(hopDong.so_ngay_con_lai) } : null,
      hoa_don_chua_tt: Number(no.so_hoa_don),
      tong_no: Number(no.tong_no),
      su_co_dang_mo: Number(sc.c),
      hoa_don_gan_nhat: hoaDonGanNhat[0] || null,
      chi_so_gan_day: [...chiSo].reverse()
    };
  }

  static async getThongTin(taiKhoanId: number) {
    const nt = await PortalService.getNguoiThue(taiKhoanId);
    const [tk]: any = await pool.query('SELECT ten_dang_nhap, lan_dang_nhap_cuoi FROM tai_khoan WHERE id = ?', [taiKhoanId]);
    return { ...nt, ...tk[0] };
  }

  static async updateThongTin(taiKhoanId: number, data: any) {
    const nt = await PortalService.getNguoiThue(taiKhoanId);
    if (data.so_dien_thoai !== undefined && !String(data.so_dien_thoai).trim()) {
      throw new AppError(400, 'Số điện thoại không được để trống');
    }
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) throw new AppError(400, 'Email không hợp lệ');
    if (data.gioi_tinh && !['nam', 'nu', 'khac'].includes(data.gioi_tinh)) delete data.gioi_tinh;

    const { fields, values } = buildUpdate(data, ['so_dien_thoai', 'email', 'que_quan', 'ngay_sinh', 'gioi_tinh']);
    if (fields.length === 0) return;
    values.push(nt.id);
    await pool.query(`UPDATE nguoi_thue SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  static async getPhong(taiKhoanId: number) {
    const nt = await PortalService.getNguoiThue(taiKhoanId);
    const hopDong = await PortalService.getHopDongHienTai(nt.id);
    if (!hopDong) return null;

    const [thanhVien] = await pool.query(
      `SELECT tv.id, tv.la_chu_hop_dong, tv.ngay_vao_o, n.ho_ten, n.gioi_tinh,
              CASE WHEN n.id = ? THEN n.so_dien_thoai ELSE CONCAT(LEFT(n.so_dien_thoai, 3), '****', RIGHT(n.so_dien_thoai, 3)) END AS so_dien_thoai,
              (n.id = ?) AS la_toi
       FROM thanh_vien_phong tv JOIN nguoi_thue n ON tv.nguoi_thue_id = n.id
       WHERE tv.hop_dong_id = ? ORDER BY tv.la_chu_hop_dong DESC, tv.id`,
      [nt.id, nt.id, hopDong.id]
    );
    const [dichVu] = await pool.query(
      `SELECT dv.* FROM dich_vu dv JOIN dich_vu_phong dvp ON dv.id = dvp.dich_vu_id WHERE dvp.phong_id = ? ORDER BY dv.id`,
      [hopDong.phong_id]
    );

    return {
      phong: {
        id: hopDong.phong_id,
        so_phong: hopDong.so_phong,
        tang: hopDong.tang,
        gia_thue: hopDong.gia_thue,
        dien_tich: hopDong.dien_tich,
        so_nguoi_toi_da: hopDong.so_nguoi_toi_da,
        mo_ta: hopDong.mo_ta_phong
      },
      hop_dong: { ...hopDong, so_ngay_con_lai: Number(hopDong.so_ngay_con_lai) },
      thanh_vien: thanhVien,
      dich_vu: dichVu
    };
  }

  static async getHopDong(taiKhoanId: number) {
    const nt = await PortalService.getNguoiThue(taiKhoanId);
    const [rows] = await pool.query(
      `SELECT hd.*, tv.la_chu_hop_dong, tv.ngay_vao_o, p.so_phong, p.gia_thue, p.tang, p.dien_tich,
              c.ho_ten AS ten_chu_hop_dong, DATEDIFF(hd.ngay_ket_thuc, CURDATE()) AS so_ngay_con_lai
       FROM thanh_vien_phong tv
       JOIN hop_dong hd ON tv.hop_dong_id = hd.id
       JOIN phong_tro p ON hd.phong_id = p.id
       JOIN nguoi_thue c ON hd.chu_hop_dong_id = c.id
       WHERE tv.nguoi_thue_id = ?
       ORDER BY FIELD(hd.trang_thai, 'con_han', 'het_han', 'da_huy'), hd.id DESC`,
      [nt.id]
    );
    return rows;
  }

  static async getHoaDon(taiKhoanId: number, trang_thai = '') {
    await HoaDonService.capNhatQuaHan();
    const nt = await PortalService.getNguoiThue(taiKhoanId);
    const params: any[] = [nt.id];
    let where = '';
    if (trang_thai === 'chua_thanhtoan_all') {
      where = ` AND h.trang_thai <> 'da_thanhtoan'`;
    } else if (trang_thai) {
      where = ' AND h.trang_thai = ?';
      params.push(trang_thai);
    }
    const [rows] = await pool.query(
      `SELECT h.*, p.so_phong, hd.ma_hop_dong, (h.tong_tien - h.so_tien_da_tra) AS con_lai
       FROM hoa_don h
       JOIN thanh_vien_phong tv ON tv.hop_dong_id = h.hop_dong_id
       JOIN hop_dong hd ON h.hop_dong_id = hd.id
       JOIN phong_tro p ON hd.phong_id = p.id
       WHERE tv.nguoi_thue_id = ? ${where}
       ORDER BY h.thang_nam DESC, h.id DESC`,
      params
    );
    return rows;
  }

  static async getHoaDonById(taiKhoanId: number, id: number) {
    const nt = await PortalService.getNguoiThue(taiKhoanId);
    const [own]: any = await pool.query(
      `SELECT 1 FROM hoa_don h JOIN thanh_vien_phong tv ON tv.hop_dong_id = h.hop_dong_id
       WHERE h.id = ? AND tv.nguoi_thue_id = ?`,
      [id, nt.id]
    );
    if (own.length === 0) throw new AppError(404, 'Không tìm thấy hóa đơn');
    return HoaDonService.getById(id);
  }

  static async getThanhToan(taiKhoanId: number) {
    const nt = await PortalService.getNguoiThue(taiKhoanId);
    const [rows] = await pool.query(
      `SELECT t.*, h.ma_hoa_don, h.thang_nam, p.so_phong
       FROM nhat_ky_thanh_toan t
       JOIN hoa_don h ON t.hoa_don_id = h.id
       JOIN thanh_vien_phong tv ON tv.hop_dong_id = h.hop_dong_id
       JOIN hop_dong hd ON h.hop_dong_id = hd.id
       JOIN phong_tro p ON hd.phong_id = p.id
       WHERE tv.nguoi_thue_id = ?
       ORDER BY t.ngay_thanh_toan DESC`,
      [nt.id]
    );
    return rows;
  }

  static async getChiSo(taiKhoanId: number) {
    const nt = await PortalService.getNguoiThue(taiKhoanId);
    const [rows] = await pool.query(
      `SELECT DISTINCT c.*, p.so_phong,
              (c.chi_so_dien_moi - c.chi_so_dien_cu) AS dien_tieu_thu,
              (c.chi_so_nuoc_moi - c.chi_so_nuoc_cu) AS nuoc_tieu_thu
       FROM chi_so_dien_nuoc c
       JOIN phong_tro p ON c.phong_id = p.id
       JOIN hop_dong hd ON hd.phong_id = c.phong_id
       JOIN thanh_vien_phong tv ON tv.hop_dong_id = hd.id
       WHERE tv.nguoi_thue_id = ?
         AND c.thang_nam >= DATE_FORMAT(tv.ngay_vao_o, '%Y-%m')
         AND c.thang_nam <= DATE_FORMAT(hd.ngay_ket_thuc, '%Y-%m')
       ORDER BY c.thang_nam DESC`,
      [nt.id]
    );
    return rows;
  }

  static async getSuCo(taiKhoanId: number) {
    const nt = await PortalService.getNguoiThue(taiKhoanId);
    const hopDong = await PortalService.getHopDongHienTai(nt.id);

    const [rows] = await pool.query(
      `SELECT s.*, p.so_phong, n.ho_ten AS nguoi_bao, (s.nguoi_bao_id = ?) AS cua_toi
       FROM su_co s JOIN phong_tro p ON s.phong_id = p.id JOIN nguoi_thue n ON s.nguoi_bao_id = n.id
       WHERE s.nguoi_bao_id = ? OR s.phong_id = ?
       ORDER BY s.id DESC`,
      [nt.id, nt.id, hopDong?.phong_id || 0]
    );
    return rows;
  }

  static async createSuCo(taiKhoanId: number, data: any) {
    const nt = await PortalService.getNguoiThue(taiKhoanId);
    const hopDong = await PortalService.getHopDongHienTai(nt.id);
    if (!hopDong) throw new AppError(400, 'Bạn chưa có hợp đồng thuê phòng còn hạn nên không thể báo sự cố');
    if (!data.tieu_de?.trim()) throw new AppError(400, 'Vui lòng nhập tiêu đề sự cố');

    const [result]: any = await pool.query(
      `INSERT INTO su_co (phong_id, nguoi_bao_id, tieu_de, mo_ta, hinh_anh, muc_do_uu_tien) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        hopDong.phong_id,
        nt.id,
        data.tieu_de.trim(),
        data.mo_ta?.trim() || null,
        data.hinh_anh || null,
        MUC_DO.includes(data.muc_do_uu_tien) ? data.muc_do_uu_tien : 'trung_binh'
      ]
    );
    return result.insertId;
  }

  static async huySuCo(taiKhoanId: number, id: number) {
    const nt = await PortalService.getNguoiThue(taiKhoanId);
    const [rows]: any = await pool.query('SELECT * FROM su_co WHERE id = ? AND nguoi_bao_id = ?', [id, nt.id]);
    if (rows.length === 0) throw new AppError(404, 'Không tìm thấy sự cố');
    if (rows[0].trang_thai !== 'cho_xuly') throw new AppError(400, 'Chỉ có thể hủy sự cố đang chờ xử lý');
    await pool.query('DELETE FROM su_co WHERE id = ?', [id]);
  }
}
