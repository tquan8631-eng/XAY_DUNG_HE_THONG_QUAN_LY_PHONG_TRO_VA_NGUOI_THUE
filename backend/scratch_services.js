const fs = require('fs');
const path = require('path');

const baseDir = 'c:\\phantichthietkehethong\\backend\\src';
const dirs = ['services', 'controllers', 'routes'];

dirs.forEach(d => {
  const p = path.join(baseDir, d);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

const files = {
  'services/auth.service.ts': `import pool from '../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AuthService {
  static async login(ten_dang_nhap: string, mat_khau: string) {
    const [rows]: any = await pool.query('SELECT * FROM tai_khoan WHERE ten_dang_nhap = ? AND trang_thai = "hoat_dong"', [ten_dang_nhap]);
    if (rows.length === 0) throw { statusCode: 401, message: 'Tài khoản không tồn tại hoặc đã bị khóa' };

    const user = rows[0];
    const isMatch = await bcrypt.compare(mat_khau, user.mat_khau);
    if (!isMatch) throw { statusCode: 401, message: 'Mật khẩu không chính xác' };

    await pool.query('UPDATE tai_khoan SET lan_dang_nhap_cuoi = NOW() WHERE id = ?', [user.id]);

    const token = jwt.sign(
      { id: user.id, ten_dang_nhap: user.ten_dang_nhap, vai_tro: user.vai_tro },
      process.env.JWT_SECRET || 'nha_tro_jwt_secret_key_2024',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return { token, user: { id: user.id, ten_dang_nhap: user.ten_dang_nhap, vai_tro: user.vai_tro } };
  }

  static async changePassword(id: number, mat_khau_cu: string, mat_khau_moi: string) {
    const [rows]: any = await pool.query('SELECT mat_khau FROM tai_khoan WHERE id = ?', [id]);
    if (rows.length === 0) throw { statusCode: 404, message: 'Tài khoản không tồn tại' };

    const isMatch = await bcrypt.compare(mat_khau_cu, rows[0].mat_khau);
    if (!isMatch) throw { statusCode: 400, message: 'Mật khẩu cũ không chính xác' };

    const hash = await bcrypt.hash(mat_khau_moi, 10);
    await pool.query('UPDATE tai_khoan SET mat_khau = ? WHERE id = ?', [hash, id]);
  }
}`,
  'services/phongTro.service.ts': `import pool from '../config/database';

export class PhongTroService {
  static async getAll(search: string, limit: number, offset: number) {
    let query = 'SELECT * FROM phong_tro';
    let params: any[] = [];
    if (search) {
      query += ' WHERE so_phong LIKE ? OR mo_ta LIKE ?';
      params.push(\`%\${search}%\`, \`%\${search}%\`);
    }
    query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);

    let countQuery = 'SELECT COUNT(*) as total FROM phong_tro';
    let countParams: any[] = [];
    if (search) {
      countQuery += ' WHERE so_phong LIKE ? OR mo_ta LIKE ?';
      countParams.push(\`%\${search}%\`, \`%\${search}%\`);
    }
    const [countRows]: any = await pool.query(countQuery, countParams);

    return { data: rows, total: countRows[0].total };
  }

  static async getById(id: number) {
    const [phongRows]: any = await pool.query('SELECT * FROM phong_tro WHERE id = ?', [id]);
    if (phongRows.length === 0) throw { statusCode: 404, message: 'Không tìm thấy phòng trọ' };

    const [thanhVienRows] = await pool.query(\`
      SELECT tv.*, nt.ho_ten, nt.so_dien_thoai
      FROM thanh_vien_phong tv
      JOIN nguoi_thue nt ON tv.nguoi_thue_id = nt.id
      JOIN hop_dong hd ON tv.hop_dong_id = hd.id
      WHERE hd.phong_id = ? AND hd.trang_thai = 'con_han'\`, [id]);

    const [hopDongRows] = await pool.query('SELECT * FROM hop_dong WHERE phong_id = ? ORDER BY id DESC', [id]);
    const [dichVuRows] = await pool.query(\`
      SELECT dv.* FROM dich_vu dv
      JOIN dich_vu_phong dvp ON dv.id = dvp.dich_vu_id
      WHERE dvp.phong_id = ?\`, [id]);

    return { ...phongRows[0], thanh_vien: thanhVienRows, hop_dong: hopDongRows, dich_vu: dichVuRows };
  }

  static async create(data: any) {
    const { so_phong, tang, gia_thue, dien_tich, so_nguoi_toi_da, mo_ta } = data;
    const [result]: any = await pool.query(
      'INSERT INTO phong_tro (so_phong, tang, gia_thue, dien_tich, so_nguoi_toi_da, mo_ta) VALUES (?, ?, ?, ?, ?, ?)',
      [so_phong, tang || 1, gia_thue || 0, dien_tich || null, so_nguoi_toi_da || 2, mo_ta || null]
    );
    return result.insertId;
  }

  static async update(id: number, data: any) {
    const fields: string[] = [];
    const values: any[] = [];
    Object.keys(data).forEach(key => {
      fields.push(\`\${key} = ?\`);
      values.push(data[key]);
    });
    if (fields.length === 0) return;

    values.push(id);
    await pool.query(\`UPDATE phong_tro SET \${fields.join(', ')} WHERE id = ?\`, values);
  }

  static async delete(id: number) {
    await pool.query('DELETE FROM phong_tro WHERE id = ?', [id]);
  }
}`,
  'services/nguoiThue.service.ts': `import pool from '../config/database';

export class NguoiThueService {
  static async getAll(search: string, phongId: string, limit: number, offset: number) {
    let query = 'SELECT nt.* FROM nguoi_thue nt';
    let countQuery = 'SELECT COUNT(DISTINCT nt.id) as total FROM nguoi_thue nt';
    let whereClauses: string[] = [];
    let params: any[] = [];

    if (phongId) {
      query += ' JOIN thanh_vien_phong tv ON nt.id = tv.nguoi_thue_id JOIN hop_dong hd ON tv.hop_dong_id = hd.id';
      countQuery += ' JOIN thanh_vien_phong tv ON nt.id = tv.nguoi_thue_id JOIN hop_dong hd ON tv.hop_dong_id = hd.id';
      whereClauses.push('hd.phong_id = ?');
      params.push(phongId);
    }

    if (search) {
      whereClauses.push('(nt.ho_ten LIKE ? OR nt.so_dien_thoai LIKE ?)');
      params.push(\`%\${search}%\`, \`%\${search}%\`);
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
      countQuery += ' WHERE ' + whereClauses.join(' AND ');
    }

    query += ' GROUP BY nt.id ORDER BY nt.id DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    const [countRows]: any = await pool.query(countQuery, params.slice(0, -2));

    return { data: rows, total: countRows[0].total };
  }

  static async getById(id: number) {
    const [rows]: any = await pool.query('SELECT * FROM nguoi_thue WHERE id = ?', [id]);
    if (rows.length === 0) throw { statusCode: 404, message: 'Không tìm thấy người thuê' };
    return rows[0];
  }

  static async create(data: any) {
    const { ho_ten, so_dien_thoai, email, can_cuoc_cong_dan, gioi_tinh, ngay_sinh, que_quan } = data;
    const [result]: any = await pool.query(
      'INSERT INTO nguoi_thue (ho_ten, so_dien_thoai, email, can_cuoc_cong_dan, gioi_tinh, ngay_sinh, que_quan) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [ho_ten, so_dien_thoai, email, can_cuoc_cong_dan, gioi_tinh || 'nam', ngay_sinh || null, que_quan || null]
    );
    return result.insertId;
  }

  static async update(id: number, data: any) {
    const fields: string[] = [];
    const values: any[] = [];
    Object.keys(data).forEach(key => {
      fields.push(\`\${key} = ?\`);
      values.push(data[key]);
    });
    if (fields.length === 0) return;

    values.push(id);
    await pool.query(\`UPDATE nguoi_thue SET \${fields.join(', ')} WHERE id = ?\`, values);
  }

  static async delete(id: number) {
    await pool.query('DELETE FROM nguoi_thue WHERE id = ?', [id]);
  }
}`,
  'services/thanhVienPhong.service.ts': `import pool from '../config/database';

export class ThanhVienPhongService {
  static async getAll() {
    const [rows] = await pool.query('SELECT * FROM thanh_vien_phong');
    return rows;
  }

  static async getByHopDong(hopDongId: number) {
    const [rows] = await pool.query(
      'SELECT tv.*, nt.ho_ten, nt.so_dien_thoai FROM thanh_vien_phong tv JOIN nguoi_thue nt ON tv.nguoi_thue_id = nt.id WHERE tv.hop_dong_id = ?',
      [hopDongId]
    );
    return rows;
  }

  static async create(data: any) {
    const { hop_dong_id, nguoi_thue_id, la_chu_hop_dong, ngay_vao_o } = data;
    const [result]: any = await pool.query(
      'INSERT INTO thanh_vien_phong (hop_dong_id, nguoi_thue_id, la_chu_hop_dong, ngay_vao_o) VALUES (?, ?, ?, ?)',
      [hop_dong_id, nguoi_thue_id, la_chu_hop_dong || 0, ngay_vao_o]
    );
    return result.insertId;
  }

  static async delete(id: number) {
    await pool.query('DELETE FROM thanh_vien_phong WHERE id = ?', [id]);
  }
}`,
  'services/hopDong.service.ts': `import pool from '../config/database';

export class HopDongService {
  static async getAll(trang_thai: string, sap_het_han: string, limit: number, offset: number) {
    let query = 'SELECT hd.*, p.so_phong, nt.ho_ten as chu_hop_dong FROM hop_dong hd JOIN phong_tro p ON hd.phong_id = p.id JOIN nguoi_thue nt ON hd.chu_hop_dong_id = nt.id';
    let countQuery = 'SELECT COUNT(*) as total FROM hop_dong hd';
    let whereClauses: string[] = [];
    let params: any[] = [];

    if (trang_thai) {
      whereClauses.push('hd.trang_thai = ?');
      params.push(trang_thai);
    }

    if (sap_het_han === 'true') {
      whereClauses.push('hd.trang_thai = "con_han" AND hd.ngay_ket_thuc <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)');
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
      countQuery += ' WHERE ' + whereClauses.join(' AND ');
    }

    query += ' ORDER BY hd.id DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    const [countRows]: any = await pool.query(countQuery, params.slice(0, -2));

    return { data: rows, total: countRows[0].total };
  }

  static async getById(id: number) {
    const [rows]: any = await pool.query('SELECT hd.*, p.so_phong, nt.ho_ten as chu_hop_dong FROM hop_dong hd JOIN phong_tro p ON hd.phong_id = p.id JOIN nguoi_thue nt ON hd.chu_hop_dong_id = nt.id WHERE hd.id = ?', [id]);
    if (rows.length === 0) throw { statusCode: 404, message: 'Không tìm thấy hợp đồng' };
    return rows[0];
  }

  static async create(data: any) {
    const { ma_hop_dong, phong_id, chu_hop_dong_id, ngay_bat_dau, ngay_ket_thuc, tien_coc, ngay_chot_tien_hang_thang } = data;
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [result]: any = await connection.query(
        'INSERT INTO hop_dong (ma_hop_dong, phong_id, chu_hop_dong_id, ngay_bat_dau, ngay_ket_thuc, tien_coc, ngay_chot_tien_hang_thang) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [ma_hop_dong, phong_id, chu_hop_dong_id, ngay_bat_dau, ngay_ket_thuc, tien_coc || 0, ngay_chot_tien_hang_thang || 1]
      );

      await connection.query('UPDATE phong_tro SET trang_thai = "da_thue" WHERE id = ?', [phong_id]);

      await connection.query(
        'INSERT INTO thanh_vien_phong (hop_dong_id, nguoi_thue_id, la_chu_hop_dong, ngay_vao_o) VALUES (?, ?, 1, ?)',
        [result.insertId, chu_hop_dong_id, ngay_bat_dau]
      );

      await connection.commit();
      return result.insertId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async update(id: number, data: any) {
    const fields: string[] = [];
    const values: any[] = [];
    Object.keys(data).forEach(key => {
      fields.push(\`\${key} = ?\`);
      values.push(data[key]);
    });
    if (fields.length === 0) return;

    values.push(id);
    await pool.query(\`UPDATE hop_dong SET \${fields.join(', ')} WHERE id = ?\`, values);

    if (data.trang_thai === 'het_han' || data.trang_thai === 'da_huy') {
      const [hd]: any = await pool.query('SELECT phong_id FROM hop_dong WHERE id = ?', [id]);
      if (hd.length > 0) {
        await pool.query('UPDATE phong_tro SET trang_thai = "trong" WHERE id = ?', [hd[0].phong_id]);
      }
    }
  }

  static async delete(id: number) {
    await pool.query('DELETE FROM hop_dong WHERE id = ?', [id]);
  }
}`,
  'services/chiSoDienNuoc.service.ts': `import pool from '../config/database';

export class ChiSoDienNuocService {
  static async getAll(phong_id: string, thang_nam: string, limit: number, offset: number) {
    let query = 'SELECT c.*, p.so_phong FROM chi_so_dien_nuoc c JOIN phong_tro p ON c.phong_id = p.id';
    let countQuery = 'SELECT COUNT(*) as total FROM chi_so_dien_nuoc c';
    let whereClauses: string[] = [];
    let params: any[] = [];

    if (phong_id) {
      whereClauses.push('c.phong_id = ?');
      params.push(phong_id);
    }
    if (thang_nam) {
      whereClauses.push('c.thang_nam = ?');
      params.push(thang_nam);
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
      countQuery += ' WHERE ' + whereClauses.join(' AND ');
    }

    query += ' ORDER BY c.ngay_ghi DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    const [countRows]: any = await pool.query(countQuery, params.slice(0, -2));

    return { data: rows, total: countRows[0].total };
  }

  static async create(data: any) {
    const { phong_id, thang_nam, chi_so_dien_cu, chi_so_dien_moi, chi_so_nuoc_cu, chi_so_nuoc_moi, ngay_ghi } = data;

    if (chi_so_dien_moi < chi_so_dien_cu) throw { statusCode: 400, message: 'Chỉ số điện mới không được nhỏ hơn chỉ số cũ' };
    if (chi_so_nuoc_moi < chi_so_nuoc_cu) throw { statusCode: 400, message: 'Chỉ số nước mới không được nhỏ hơn chỉ số cũ' };

    const [result]: any = await pool.query(
      'INSERT INTO chi_so_dien_nuoc (phong_id, thang_nam, chi_so_dien_cu, chi_so_dien_moi, chi_so_nuoc_cu, chi_so_nuoc_moi, ngay_ghi) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [phong_id, thang_nam, chi_so_dien_cu, chi_so_dien_moi, chi_so_nuoc_cu, chi_so_nuoc_moi, ngay_ghi || new Date()]
    );
    return result.insertId;
  }

  static async update(id: number, data: any) {
    const fields: string[] = [];
    const values: any[] = [];
    Object.keys(data).forEach(key => {
      fields.push(\`\${key} = ?\`);
      values.push(data[key]);
    });
    if (fields.length === 0) return;

    values.push(id);
    await pool.query(\`UPDATE chi_so_dien_nuoc SET \${fields.join(', ')} WHERE id = ?\`, values);
  }

  static async delete(id: number) {
    await pool.query('DELETE FROM chi_so_dien_nuoc WHERE id = ?', [id]);
  }
}`,
  'services/dichVu.service.ts': `import pool from '../config/database';

export class DichVuService {
  static async getAll() {
    const [rows] = await pool.query('SELECT * FROM dich_vu ORDER BY id DESC');
    return rows;
  }

  static async create(data: any) {
    const { ten_dich_vu, don_gia, don_vi_tinh, loai_dich_vu } = data;
    const [result]: any = await pool.query(
      'INSERT INTO dich_vu (ten_dich_vu, don_gia, don_vi_tinh, loai_dich_vu) VALUES (?, ?, ?, ?)',
      [ten_dich_vu, don_gia || 0, don_vi_tinh, loai_dich_vu]
    );
    return result.insertId;
  }

  static async update(id: number, data: any) {
    const fields: string[] = [];
    const values: any[] = [];
    Object.keys(data).forEach(key => {
      fields.push(\`\${key} = ?\`);
      values.push(data[key]);
    });
    if (fields.length === 0) return;

    values.push(id);
    await pool.query(\`UPDATE dich_vu SET \${fields.join(', ')} WHERE id = ?\`, values);
  }

  static async delete(id: number) {
    await pool.query('DELETE FROM dich_vu WHERE id = ?', [id]);
  }

  static async getDichVuPhong(phongId: number) {
    const [rows] = await pool.query(
      'SELECT dv.* FROM dich_vu dv JOIN dich_vu_phong dvp ON dv.id = dvp.dich_vu_id WHERE dvp.phong_id = ?',
      [phongId]
    );
    return rows;
  }

  static async addDichVuPhong(phongId: number, dichVuId: number) {
    await pool.query('INSERT IGNORE INTO dich_vu_phong (phong_id, dich_vu_id) VALUES (?, ?)', [phongId, dichVuId]);
  }

  static async removeDichVuPhong(phongId: number, dichVuId: number) {
    await pool.query('DELETE FROM dich_vu_phong WHERE phong_id = ? AND dich_vu_id = ?', [phongId, dichVuId]);
  }
}`,
  'services/hoaDon.service.ts': `import pool from '../config/database';

export class HoaDonService {
  static async getAll(thang_nam: string, phong_id: string, trang_thai: string, limit: number, offset: number) {
    let query = 'SELECT h.*, p.so_phong, hd.ma_hop_dong FROM hoa_don h JOIN hop_dong hd ON h.hop_dong_id = hd.id JOIN phong_tro p ON hd.phong_id = p.id';
    let countQuery = 'SELECT COUNT(*) as total FROM hoa_don h JOIN hop_dong hd ON h.hop_dong_id = hd.id';
    let whereClauses: string[] = [];
    let params: any[] = [];

    if (thang_nam) {
      whereClauses.push('h.thang_nam = ?');
      params.push(thang_nam);
    }
    if (phong_id) {
      whereClauses.push('hd.phong_id = ?');
      params.push(phong_id);
    }
    if (trang_thai) {
      whereClauses.push('h.trang_thai = ?');
      params.push(trang_thai);
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
      countQuery += ' WHERE ' + whereClauses.join(' AND ');
    }

    query += ' ORDER BY h.id DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    const [countRows]: any = await pool.query(countQuery, params.slice(0, -2));

    return { data: rows, total: countRows[0].total };
  }

  static async getById(id: number) {
    const [rows]: any = await pool.query('SELECT h.*, p.so_phong, hd.ma_hop_dong FROM hoa_don h JOIN hop_dong hd ON h.hop_dong_id = hd.id JOIN phong_tro p ON hd.phong_id = p.id WHERE h.id = ?', [id]);
    if (rows.length === 0) throw { statusCode: 404, message: 'Không tìm thấy hóa đơn' };

    const [chiTiet] = await pool.query('SELECT * FROM chi_tiet_hoa_don WHERE hoa_don_id = ?', [id]);
    const [thanhToan] = await pool.query('SELECT * FROM nhat_ky_thanh_toan WHERE hoa_don_id = ? ORDER BY ngay_thanh_toan DESC', [id]);

    return { ...rows[0], chi_tiet: chiTiet, lich_su_thanh_toan: thanhToan };
  }

  static async createTuDong(hop_dong_id: number, thang_nam: string, han_thanhtoan: string) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Lấy thông tin hợp đồng & phòng
      const [hdRows]: any = await connection.query('SELECT hd.*, p.gia_thue, p.id as p_id FROM hop_dong hd JOIN phong_tro p ON hd.phong_id = p.id WHERE hd.id = ? AND hd.trang_thai = "con_han"', [hop_dong_id]);
      if (hdRows.length === 0) throw new Error('Hợp đồng không hợp lệ hoặc đã hết hạn');
      const hopDong = hdRows[0];
      const phongId = hopDong.p_id;

      // 2. Lấy chỉ số điện nước
      const [csRows]: any = await connection.query('SELECT * FROM chi_so_dien_nuoc WHERE phong_id = ? AND thang_nam = ?', [phongId, thang_nam]);
      if (csRows.length === 0) throw new Error('Chưa có chỉ số điện nước cho tháng này');
      const cs = csRows[0];

      // 3. Lấy dịch vụ phòng
      const [dvRows]: any = await connection.query('SELECT dv.* FROM dich_vu dv JOIN dich_vu_phong dvp ON dv.id = dvp.dich_vu_id WHERE dvp.phong_id = ?', [phongId]);

      // 4. Tính toán chi tiết
      let tong_tien = 0;
      let chiTietData: any[] = [];

      // Tiền phòng
      chiTietData.push({
        ten_dich_vu: 'Tiền phòng',
        don_gia: hopDong.gia_thue,
        so_luong: 1,
        thanh_tien: hopDong.gia_thue
      });
      tong_tien += Number(hopDong.gia_thue);

      for (let dv of dvRows) {
        let so_luong = 1;
        if (dv.loai_dich_vu === 'theo_chi_so') {
          if (dv.ten_dich_vu.toLowerCase().includes('điện') || dv.ten_dich_vu.toLowerCase().includes('dien')) {
            so_luong = cs.chi_so_dien_moi - cs.chi_so_dien_cu;
          } else if (dv.ten_dich_vu.toLowerCase().includes('nước') || dv.ten_dich_vu.toLowerCase().includes('nuoc')) {
            so_luong = cs.chi_so_nuoc_moi - cs.chi_so_nuoc_cu;
          }
        }
        let thanh_tien = Number(dv.don_gia) * so_luong;
        chiTietData.push({
          ten_dich_vu: dv.ten_dich_vu,
          don_gia: dv.don_gia,
          so_luong: so_luong,
          thanh_tien: thanh_tien
        });
        tong_tien += thanh_tien;
      }

      // 5. Tạo hóa đơn
      const ma_hoa_don = 'HD' + Date.now();
      const [hdInsert]: any = await connection.query(
        'INSERT INTO hoa_don (ma_hoa_don, hop_dong_id, thang_nam, tien_phong, tong_tien, han_thanhtoan) VALUES (?, ?, ?, ?, ?, ?)',
        [ma_hoa_don, hop_dong_id, thang_nam, hopDong.gia_thue, tong_tien, han_thanhtoan]
      );
      const hoa_don_id = hdInsert.insertId;

      // 6. Thêm chi tiết hóa đơn
      for (let ct of chiTietData) {
        await connection.query(
          'INSERT INTO chi_tiet_hoa_don (hoa_don_id, ten_dich_vu, don_gia, so_luong, thanh_tien) VALUES (?, ?, ?, ?, ?)',
          [hoa_don_id, ct.ten_dich_vu, ct.don_gia, ct.so_luong, ct.thanh_tien]
        );
      }

      await connection.commit();
      return hoa_don_id;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async update(id: number, data: any) {
    const fields: string[] = [];
    const values: any[] = [];
    Object.keys(data).forEach(key => {
      fields.push(\`\${key} = ?\`);
      values.push(data[key]);
    });
    if (fields.length === 0) return;

    values.push(id);
    await pool.query(\`UPDATE hoa_don SET \${fields.join(', ')} WHERE id = ?\`, values);
  }

  static async delete(id: number) {
    await pool.query('DELETE FROM hoa_don WHERE id = ?', [id]);
  }
}`,
  'services/thanhToan.service.ts': `import pool from '../config/database';

export class ThanhToanService {
  static async getAll(hoa_don_id: string, limit: number, offset: number) {
    let query = 'SELECT t.*, h.ma_hoa_don, hd.ma_hop_dong FROM nhat_ky_thanh_toan t JOIN hoa_don h ON t.hoa_don_id = h.id JOIN hop_dong hd ON h.hop_dong_id = hd.id';
    let countQuery = 'SELECT COUNT(*) as total FROM nhat_ky_thanh_toan t';
    let params: any[] = [];

    if (hoa_don_id) {
      query += ' WHERE t.hoa_don_id = ?';
      countQuery += ' WHERE t.hoa_don_id = ?';
      params.push(hoa_don_id);
    }

    query += ' ORDER BY t.id DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    const [countRows]: any = await pool.query(countQuery, params.slice(0, -2));

    return { data: rows, total: countRows[0].total };
  }

  static async create(data: any) {
    const { hoa_don_id, so_tien, phuong_thuc, ma_giao_dich, ghi_chu } = data;
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [hdRows]: any = await connection.query('SELECT * FROM hoa_don WHERE id = ? FOR UPDATE', [hoa_don_id]);
      if (hdRows.length === 0) throw new Error('Không tìm thấy hóa đơn');

      const hoaDon = hdRows[0];
      const so_tien_tra = Number(so_tien);

      const [result]: any = await connection.query(
        'INSERT INTO nhat_ky_thanh_toan (hoa_don_id, so_tien, phuong_thuc, ma_giao_dich, ghi_chu) VALUES (?, ?, ?, ?, ?)',
        [hoa_don_id, so_tien_tra, phuong_thuc || 'chuyen_khoan', ma_giao_dich || null, ghi_chu || null]
      );

      const so_tien_da_tra_moi = Number(hoaDon.so_tien_da_tra) + so_tien_tra;
      let trang_thai = 'chua_thanhtoan';

      if (so_tien_da_tra_moi >= Number(hoaDon.tong_tien)) {
        trang_thai = 'da_thanhtoan';
      } else if (so_tien_da_tra_moi > 0) {
        trang_thai = 'thanhtoan_motphan';
      }

      await connection.query(
        'UPDATE hoa_don SET so_tien_da_tra = ?, trang_thai = ? WHERE id = ?',
        [so_tien_da_tra_moi, trang_thai, hoa_don_id]
      );

      await connection.commit();
      return result.insertId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}`,
  'services/suCo.service.ts': `import pool from '../config/database';

export class SuCoService {
  static async getAll(trang_thai: string, phong_id: string, muc_do_uu_tien: string, limit: number, offset: number) {
    let query = 'SELECT s.*, p.so_phong, nt.ho_ten as nguoi_bao FROM su_co s JOIN phong_tro p ON s.phong_id = p.id JOIN nguoi_thue nt ON s.nguoi_bao_id = nt.id';
    let countQuery = 'SELECT COUNT(*) as total FROM su_co s';
    let whereClauses: string[] = [];
    let params: any[] = [];

    if (trang_thai) {
      whereClauses.push('s.trang_thai = ?');
      params.push(trang_thai);
    }
    if (phong_id) {
      whereClauses.push('s.phong_id = ?');
      params.push(phong_id);
    }
    if (muc_do_uu_tien) {
      whereClauses.push('s.muc_do_uu_tien = ?');
      params.push(muc_do_uu_tien);
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
      countQuery += ' WHERE ' + whereClauses.join(' AND ');
    }

    query += ' ORDER BY s.id DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    const [countRows]: any = await pool.query(countQuery, params.slice(0, -2));

    return { data: rows, total: countRows[0].total };
  }

  static async getById(id: number) {
    const [rows]: any = await pool.query('SELECT s.*, p.so_phong, nt.ho_ten as nguoi_bao FROM su_co s JOIN phong_tro p ON s.phong_id = p.id JOIN nguoi_thue nt ON s.nguoi_bao_id = nt.id WHERE s.id = ?', [id]);
    if (rows.length === 0) throw { statusCode: 404, message: 'Không tìm thấy sự cố' };
    return rows[0];
  }

  static async create(data: any) {
    const { phong_id, nguoi_bao_id, tieu_de, mo_ta, hinh_anh, muc_do_uu_tien } = data;
    const [result]: any = await pool.query(
      'INSERT INTO su_co (phong_id, nguoi_bao_id, tieu_de, mo_ta, hinh_anh, muc_do_uu_tien) VALUES (?, ?, ?, ?, ?, ?)',
      [phong_id, nguoi_bao_id, tieu_de, mo_ta || null, hinh_anh || null, muc_do_uu_tien || 'trung_binh']
    );
    return result.insertId;
  }

  static async update(id: number, data: any) {
    const fields: string[] = [];
    const values: any[] = [];
    Object.keys(data).forEach(key => {
      fields.push(\`\${key} = ?\`);
      values.push(data[key]);
    });
    if (fields.length === 0) return;

    values.push(id);
    await pool.query(\`UPDATE su_co SET \${fields.join(', ')} WHERE id = ?\`, values);
  }

  static async delete(id: number) {
    await pool.query('DELETE FROM su_co WHERE id = ?', [id]);
  }
}`,
  'services/taiKhoan.service.ts': `import pool from '../config/database';
import bcrypt from 'bcryptjs';

export class TaiKhoanService {
  static async getAll() {
    const [rows] = await pool.query('SELECT id, ten_dang_nhap, vai_tro, trang_thai, lan_dang_nhap_cuoi, ngay_tao FROM tai_khoan ORDER BY id DESC');
    return rows;
  }

  static async create(data: any) {
    const { ten_dang_nhap, mat_khau, vai_tro } = data;
    const hash = await bcrypt.hash(mat_khau, 10);
    const [result]: any = await pool.query(
      'INSERT INTO tai_khoan (ten_dang_nhap, mat_khau, vai_tro) VALUES (?, ?, ?)',
      [ten_dang_nhap, hash, vai_tro || 'nguoi_thue']
    );
    return result.insertId;
  }

  static async update(id: number, data: any) {
    const fields: string[] = [];
    const values: any[] = [];
    if (data.mat_khau) {
      data.mat_khau = await bcrypt.hash(data.mat_khau, 10);
    }
    Object.keys(data).forEach(key => {
      fields.push(\`\${key} = ?\`);
      values.push(data[key]);
    });
    if (fields.length === 0) return;

    values.push(id);
    await pool.query(\`UPDATE tai_khoan SET \${fields.join(', ')} WHERE id = ?\`, values);
  }

  static async delete(id: number) {
    await pool.query('DELETE FROM tai_khoan WHERE id = ?', [id]);
  }
}`,
  'services/dashboard.service.ts': `import pool from '../config/database';

export class DashboardService {
  static async getThongKe() {
    const [phongRows]: any = await pool.query(\`
      SELECT trang_thai, COUNT(*) as count
      FROM phong_tro GROUP BY trang_thai\`);

    const [ntRows]: any = await pool.query('SELECT COUNT(*) as count FROM nguoi_thue WHERE trang_thai = "dang_thue"');
    const [hdRows]: any = await pool.query('SELECT COUNT(*) as count FROM hop_dong WHERE trang_thai = "con_han"');
    const [hoaDonRows]: any = await pool.query('SELECT COUNT(*) as count FROM hoa_don WHERE trang_thai = "chua_thanhtoan"');
    const [doanhThuRows]: any = await pool.query('SELECT SUM(so_tien) as total FROM nhat_ky_thanh_toan WHERE MONTH(ngay_thanh_toan) = MONTH(CURRENT_DATE()) AND YEAR(ngay_thanh_toan) = YEAR(CURRENT_DATE())');

    return {
      phong_tro: phongRows,
      nguoi_thue_active: ntRows[0].count,
      hop_dong_active: hdRows[0].count,
      hoa_don_chua_tt: hoaDonRows[0].count,
      doanh_thu_thang_nay: doanhThuRows[0].total || 0
    };
  }

  static async getDoanhThu(year: number) {
    const query = \`
      SELECT MONTH(ngay_thanh_toan) as thang, SUM(so_tien) as doanh_thu
      FROM nhat_ky_thanh_toan
      WHERE YEAR(ngay_thanh_toan) = ?
      GROUP BY MONTH(ngay_thanh_toan)
      ORDER BY thang\`;
    const [rows] = await pool.query(query, [year]);
    return rows;
  }

  static async getHoaDonChuaTT() {
    const [rows] = await pool.query(\`
      SELECT h.*, p.so_phong
      FROM hoa_don h JOIN hop_dong hd ON h.hop_dong_id = hd.id JOIN phong_tro p ON hd.phong_id = p.id
      WHERE h.trang_thai IN ('chua_thanhtoan', 'thanhtoan_motphan', 'qua_han')
      ORDER BY h.han_thanhtoan ASC LIMIT 10\`);
    return rows;
  }

  static async getHopDongSapHet() {
    const [rows] = await pool.query(\`
      SELECT hd.*, p.so_phong, nt.ho_ten
      FROM hop_dong hd JOIN phong_tro p ON hd.phong_id = p.id JOIN nguoi_thue nt ON hd.chu_hop_dong_id = nt.id
      WHERE hd.trang_thai = 'con_han' AND hd.ngay_ket_thuc <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
      ORDER BY hd.ngay_ket_thuc ASC LIMIT 10\`);
    return rows;
  }

  static async getSuCoMoi() {
    const [rows] = await pool.query(\`
      SELECT s.*, p.so_phong
      FROM su_co s JOIN phong_tro p ON s.phong_id = p.id
      WHERE s.trang_thai = 'cho_xuly' OR s.trang_thai = 'dang_xuly'
      ORDER BY s.muc_do_uu_tien DESC, s.ngay_tao DESC LIMIT 10\`);
    return rows;
  }
}`
};

Object.entries(files).forEach(([file, content]) => {
  fs.writeFileSync(path.join(baseDir, file), content);
});

console.log("Services created.");
