import pool from '../config/database';
import { AppError, buildUpdate } from '../utils/helpers';
import { THONG_TIN_NHA_TRO } from '../config/nhaTro';

const LOAI = ['khuyen_mai', 'thong_bao', 'gioi_thieu'];
const DOI_TUONG = ['tat_ca', 'khach', 'nguoi_thue'];
const MAU = ['indigo', 'rose', 'emerald', 'amber', 'sky', 'violet'];
const COT = ['tieu_de', 'noi_dung', 'loai', 'ma_uu_dai', 'mau_nen', 'doi_tuong', 'ngay_bat_dau', 'ngay_ket_thuc', 'thu_tu', 'trang_thai'];
const DANG_HIEU_LUC = `trang_thai = 'hien' AND (ngay_bat_dau IS NULL OR ngay_bat_dau <= CURDATE())
  AND (ngay_ket_thuc IS NULL OR ngay_ket_thuc >= CURDATE())`;

const kiemTra = (d: any, taoMoi: boolean) => {
  if (taoMoi && !String(d.tieu_de || '').trim()) throw new AppError(400, 'Vui lòng nhập tiêu đề');
  if (d.loai !== undefined && !LOAI.includes(d.loai)) throw new AppError(400, 'Loại quảng cáo không hợp lệ');
  if (d.doi_tuong !== undefined && !DOI_TUONG.includes(d.doi_tuong)) throw new AppError(400, 'Đối tượng không hợp lệ');
  if (d.mau_nen !== undefined && !MAU.includes(d.mau_nen)) d.mau_nen = 'indigo';
  if (d.trang_thai !== undefined && !['hien', 'an'].includes(d.trang_thai)) throw new AppError(400, 'Trạng thái không hợp lệ');
  if (d.ngay_bat_dau && d.ngay_ket_thuc && d.ngay_bat_dau > d.ngay_ket_thuc)
    throw new AppError(400, 'Ngày kết thúc phải sau ngày bắt đầu');
};

export class QuangCaoService {
  static async getAll(q: any) {
    const where: string[] = [];
    const params: any[] = [];
    if (q.trang_thai) { where.push('trang_thai = ?'); params.push(q.trang_thai); }
    if (q.loai) { where.push('loai = ?'); params.push(q.loai); }
    if (q.search) { where.push('(tieu_de LIKE ? OR ma_uu_dai LIKE ?)'); params.push(`%${q.search}%`, `%${q.search}%`); }
    const [rows]: any = await pool.query(
      `SELECT *, (${DANG_HIEU_LUC}) AS dang_chay FROM quang_cao ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
       ORDER BY thu_tu ASC, id DESC`,
      params
    );
    return rows.map((r: any) => ({ ...r, dang_chay: !!r.dang_chay }));
  }

  static async create(d: any) {
    kiemTra(d, true);
    const { fields, values } = buildUpdate(d, COT);
    const [r]: any = await pool.query(`INSERT INTO quang_cao SET ${fields.join(', ')}`, values);
    return r.insertId;
  }

  static async update(id: number, d: any) {
    kiemTra(d, false);
    const { fields, values } = buildUpdate(d, COT);
    if (!fields.length) throw new AppError(400, 'Không có dữ liệu cập nhật');
    const [r]: any = await pool.query(`UPDATE quang_cao SET ${fields.join(', ')} WHERE id = ?`, [...values, id]);
    if (!r.affectedRows) throw new AppError(404, 'Không tìm thấy quảng cáo');
  }

  static async delete(id: number) {
    const [r]: any = await pool.query('DELETE FROM quang_cao WHERE id = ?', [id]);
    if (!r.affectedRows) throw new AppError(404, 'Không tìm thấy quảng cáo');
  }

  static async dangChay(doiTuong: 'khach' | 'nguoi_thue') {
    const [rows] = await pool.query(
      `SELECT id, tieu_de, noi_dung, loai, ma_uu_dai, mau_nen, ngay_ket_thuc FROM quang_cao
       WHERE ${DANG_HIEU_LUC} AND doi_tuong IN ('tat_ca', ?) ORDER BY thu_tu ASC, id DESC`,
      [doiTuong]
    );
    return rows;
  }

  static async tangLuotXem(id: number) {
    await pool.query('UPDATE quang_cao SET luot_xem = luot_xem + 1 WHERE id = ?', [id]);
  }
}

const TT_YEU_CAU = ['moi', 'da_lien_he', 'da_thue', 'huy'];
export class YeuCauXemPhongService {
  static async create(d: any, nguon: 'website' | 'chatbot' = 'website') {
    const hoTen = String(d.ho_ten || '').trim();
    const sdt = String(d.so_dien_thoai || '').replace(/[\s.-]/g, '');
    if (hoTen.length < 2) throw new AppError(400, 'Vui lòng nhập họ tên');
    if (!/^(0|\+84)\d{9,10}$/.test(sdt)) throw new AppError(400, 'Số điện thoại không hợp lệ');
    let phongId: number | null = d.phong_id ? Number(d.phong_id) : null;
    if (phongId) {
      const [[p]]: any = await pool.query('SELECT id FROM phong_tro WHERE id = ?', [phongId]);
      if (!p) phongId = null;
    }
    const ngay = /^\d{4}-\d{2}-\d{2}$/.test(d.ngay_hen || '') ? d.ngay_hen : null;

    const [[trung]]: any = await pool.query(
      `SELECT id FROM yeu_cau_xem_phong WHERE so_dien_thoai = ? AND trang_thai = 'moi'
       AND ngay_tao >= DATE_SUB(NOW(), INTERVAL 1 DAY)`,
      [sdt]
    );
    if (trung) {
      await pool.query('UPDATE yeu_cau_xem_phong SET phong_id = COALESCE(?, phong_id), ngay_hen = COALESCE(?, ngay_hen), ghi_chu = COALESCE(?, ghi_chu) WHERE id = ?',
        [phongId, ngay, d.ghi_chu || null, trung.id]);
      return trung.id;
    }
    const [r]: any = await pool.query(
      `INSERT INTO yeu_cau_xem_phong (ho_ten, so_dien_thoai, phong_id, ngay_hen, ghi_chu, nguon) VALUES (?, ?, ?, ?, ?, ?)`,
      [hoTen.slice(0, 100), sdt, phongId, ngay, String(d.ghi_chu || '').slice(0, 500) || null, nguon]
    );
    return r.insertId;
  }

  static async getAll(q: any) {
    const where: string[] = [];
    const params: any[] = [];
    if (q.trang_thai) { where.push('y.trang_thai = ?'); params.push(q.trang_thai); }
    if (q.search) { where.push('(y.ho_ten LIKE ? OR y.so_dien_thoai LIKE ?)'); params.push(`%${q.search}%`, `%${q.search}%`); }
    const [rows] = await pool.query(
      `SELECT y.*, p.so_phong, p.gia_thue FROM yeu_cau_xem_phong y LEFT JOIN phong_tro p ON y.phong_id = p.id
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY FIELD(y.trang_thai,'moi','da_lien_he','da_thue','huy'), y.id DESC`,
      params
    );
    return rows;
  }

  static async update(id: number, d: any) {
    if (d.trang_thai !== undefined && !TT_YEU_CAU.includes(d.trang_thai)) throw new AppError(400, 'Trạng thái không hợp lệ');
    const { fields, values } = buildUpdate(d, ['trang_thai', 'ghi_chu', 'ngay_hen', 'phong_id']);
    if (!fields.length) throw new AppError(400, 'Không có dữ liệu cập nhật');
    const [r]: any = await pool.query(`UPDATE yeu_cau_xem_phong SET ${fields.join(', ')} WHERE id = ?`, [...values, id]);
    if (!r.affectedRows) throw new AppError(404, 'Không tìm thấy yêu cầu');
  }

  static async delete(id: number) {
    const [r]: any = await pool.query('DELETE FROM yeu_cau_xem_phong WHERE id = ?', [id]);
    if (!r.affectedRows) throw new AppError(404, 'Không tìm thấy yêu cầu');
  }
}

export class PublicService {
  static thongTin() {
    return THONG_TIN_NHA_TRO;
  }

  static async phongTrong() {
    const [phong] = await pool.query(
      `SELECT id, so_phong, tang, gia_thue, dien_tich, so_nguoi_toi_da, mo_ta FROM phong_tro
       WHERE trang_thai = 'trong' ORDER BY gia_thue ASC`
    );
    const [dichVu] = await pool.query('SELECT ten_dich_vu, don_gia, don_vi_tinh FROM dich_vu ORDER BY id');
    const [[tk]]: any = await pool.query(
      `SELECT COUNT(*) AS tong_phong, SUM(trang_thai = 'trong') AS phong_trong, SUM(trang_thai = 'da_thue') AS da_thue,
              COALESCE(MIN(CASE WHEN trang_thai = 'trong' THEN gia_thue END), MIN(gia_thue)) AS gia_thap_nhat FROM phong_tro`
    );
    return {
      phong,
      dich_vu: dichVu,
      thong_ke: {
        tong_phong: Number(tk.tong_phong),
        phong_trong: Number(tk.phong_trong || 0),
        da_thue: Number(tk.da_thue || 0),
        gia_thap_nhat: Number(tk.gia_thap_nhat || 0)
      }
    };
  }
}
