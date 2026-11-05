import pool from '../config/database';

export class PhongTroService {
  static async getAll(
    search: string,
    trang_thai: string,
    limit: number,
    offset: number
  ) {
    let query = `
      SELECT phong_tro.*,
        (SELECT COUNT(*) FROM thanh_vien_phong tv
           JOIN hop_dong hd ON tv.hop_dong_id = hd.id
          WHERE hd.phong_id = phong_tro.id AND hd.trang_thai = 'con_han') AS so_nguoi_hien_tai,
        (SELECT nt.ho_ten FROM hop_dong hd JOIN nguoi_thue nt ON hd.chu_hop_dong_id = nt.id
          WHERE hd.phong_id = phong_tro.id AND hd.trang_thai = 'con_han' ORDER BY hd.id DESC LIMIT 1) AS nguoi_dai_dien
      FROM phong_tro
      WHERE 1 = 1
    `;

    const params: any[] = [];

    if (search && search.trim() !== '') {
      query += `
        AND (
          so_phong LIKE ?
          OR mo_ta LIKE ?
        )
      `;

      params.push(
        `%${search.trim()}%`,
        `%${search.trim()}%`
      );
    }

    if (trang_thai && trang_thai.trim() !== '') {
      const status = trang_thai
        .trim()
        .toLowerCase();

      let dbStatus = status;

      if (status === 'trong') {
        dbStatus = 'trong';
      }

      else if (
        status === 'dang_thue' ||
        status === 'da_thue'
      ) {
        dbStatus = 'da_thue';
      }

      else if (
        status === 'dang_sua_chua' ||
        status === 'dang_bao_tri'
      ) {
        dbStatus = 'dang_bao_tri';
      }

      else if (status === 'da_coc') {
        dbStatus = 'da_coc';
      }

      query += `
        AND trang_thai = ?
      `;

      params.push(dbStatus);
    }

    query += `
      ORDER BY so_phong ASC
      LIMIT ? OFFSET ?
    `;

    params.push(
      limit,
      offset
    );

    const [rows] =
      await pool.query(
        query,
        params
      );

    let countQuery = `
      SELECT COUNT(*) AS total
      FROM phong_tro
      WHERE 1 = 1
    `;

    const countParams: any[] = [];

    if (
      search &&
      search.trim() !== ''
    ) {
      countQuery += `
        AND (
          so_phong LIKE ?
          OR mo_ta LIKE ?
        )
      `;

      countParams.push(
        `%${search.trim()}%`,
        `%${search.trim()}%`
      );
    }

    if (
      trang_thai &&
      trang_thai.trim() !== ''
    ) {
      const status =
        trang_thai
          .trim()
          .toLowerCase();

      let dbStatus = status;

      if (status === 'trong') {
        dbStatus = 'trong';
      }

      else if (
        status === 'dang_thue' ||
        status === 'da_thue'
      ) {
        dbStatus = 'da_thue';
      }

      else if (
        status === 'dang_sua_chua' ||
        status === 'dang_bao_tri'
      ) {
        dbStatus = 'dang_bao_tri';
      }

      else if (status === 'da_coc') {
        dbStatus = 'da_coc';
      }

      countQuery += `
        AND trang_thai = ?
      `;

      countParams.push(
        dbStatus
      );
    }

    const [countRows]: any =
      await pool.query(
        countQuery,
        countParams
      );

    return {
      data: rows,
      total:
        countRows[0]?.total || 0
    };
  }

  static async getById(
    id: number
  ) {
    const [phongRows]: any =
      await pool.query(
        `
        SELECT *
        FROM phong_tro
        WHERE id = ?
        `,
        [id]
      );

    if (
      phongRows.length === 0
    ) {
      throw {
        statusCode: 404,
        message:
          'Không tìm thấy phòng trọ'
      };
    }

    const [thanhVienRows] =
      await pool.query(`
        SELECT
          tv.*,
          nt.ho_ten,
          nt.so_dien_thoai
        FROM thanh_vien_phong tv
        JOIN nguoi_thue nt
          ON tv.nguoi_thue_id = nt.id
        JOIN hop_dong hd
          ON tv.hop_dong_id = hd.id
        WHERE hd.phong_id = ?
          AND hd.trang_thai = 'con_han'
      `, [id]);

    const [hopDongRows] =
      await pool.query(`
        SELECT hd.*, nt.ho_ten AS ten_nguoi_thue
        FROM hop_dong hd
        JOIN nguoi_thue nt ON hd.chu_hop_dong_id = nt.id
        WHERE hd.phong_id = ?
        ORDER BY hd.id DESC
      `, [id]);

    const [chiSoRows] = await pool.query(
      `SELECT *, (chi_so_dien_moi - chi_so_dien_cu) AS dien_tieu_thu, (chi_so_nuoc_moi - chi_so_nuoc_cu) AS nuoc_tieu_thu
       FROM chi_so_dien_nuoc WHERE phong_id = ? ORDER BY thang_nam DESC LIMIT 12`,
      [id]
    );

    const [hoaDonRows] = await pool.query(
      `SELECT h.* FROM hoa_don h JOIN hop_dong hd ON h.hop_dong_id = hd.id
       WHERE hd.phong_id = ? ORDER BY h.thang_nam DESC LIMIT 12`,
      [id]
    );

    const [suCoRows] = await pool.query(
      `SELECT s.*, nt.ho_ten AS nguoi_bao FROM su_co s JOIN nguoi_thue nt ON s.nguoi_bao_id = nt.id
       WHERE s.phong_id = ? ORDER BY s.id DESC LIMIT 20`,
      [id]
    );

    const [dichVuRows] =
      await pool.query(`
        SELECT
          dv.*
        FROM dich_vu dv
        JOIN dich_vu_phong dvp
          ON dv.id = dvp.dich_vu_id
        WHERE dvp.phong_id = ?
      `, [id]);

    return {
      ...phongRows[0],
      thanh_vien: thanhVienRows,
      hop_dong: hopDongRows,
      dich_vu: dichVuRows,
      chi_so: chiSoRows,
      hoa_don: hoaDonRows,
      su_co: suCoRows
    };
  }

  static async create(
    data: any
  ) {
    const {
      so_phong,
      tang,
      gia_thue,
      dien_tich,
      so_nguoi_toi_da,
      trang_thai,
      mo_ta
    } = data;

    const [result]: any =
      await pool.query(
        `
        INSERT INTO phong_tro
        (
          so_phong,
          tang,
          gia_thue,
          dien_tich,
          so_nguoi_toi_da,
          trang_thai,
          mo_ta
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          so_phong,
          tang || 1,
          gia_thue || 0,
          dien_tich || null,
          so_nguoi_toi_da || 2,

          trang_thai
            ? trang_thai.toLowerCase()
            : 'trong',

          mo_ta || null
        ]
      );

    return result.insertId;
  }

  static async update(
    id: number,
    data: any
  ) {
    const allowedFields = [
      'so_phong',
      'tang',
      'gia_thue',
      'dien_tich',
      'so_nguoi_toi_da',
      'trang_thai',
      'mo_ta'
    ];

    const fields: string[] = [];
    const values: any[] = [];

    Object.keys(data).forEach(
      (key) => {
        if (
          allowedFields.includes(key)
        ) {
          fields.push(
            `${key} = ?`
          );

          let value =
            data[key];

          if (
            key === 'trang_thai' &&
            typeof value === 'string'
          ) {
            const status =
              value
                .trim()
                .toLowerCase();

            if (
              status === 'dang_thue' ||
              status === 'da_thue'
            ) {
              value = 'da_thue';
            }

            else if (
              status === 'dang_sua_chua' ||
              status === 'dang_bao_tri'
            ) {
              value = 'dang_bao_tri';
            }

            else if (
              status === 'trong'
            ) {
              value = 'trong';
            }

            else if (
              status === 'da_coc'
            ) {
              value = 'da_coc';
            }
          }

          values.push(value);
        }
      }
    );

    if (
      fields.length === 0
    ) {
      return;
    }

    values.push(id);

    await pool.query(
      `
      UPDATE phong_tro
      SET ${fields.join(', ')}
      WHERE id = ?
      `,
      values
    );
  }

  static async delete(
    id: number
  ) {
    const [phongRows]: any =
      await pool.query(
        `
        SELECT id, so_phong
        FROM phong_tro
        WHERE id = ?
        `,
        [id]
      );

    if (
      phongRows.length === 0
    ) {
      throw {
        statusCode: 404,
        message:
          'Không tìm thấy phòng trọ'
      };
    }

    const soPhong =
      phongRows[0].so_phong;

    const [chiSoRows]: any =
      await pool.query(
        `
        SELECT COUNT(*) AS total
        FROM chi_so_dien_nuoc
        WHERE phong_id = ?
        `,
        [id]
      );

    const [dichVuRows]: any =
      await pool.query(
        `
        SELECT COUNT(*) AS total
        FROM dich_vu_phong
        WHERE phong_id = ?
        `,
        [id]
      );

    const [hopDongRows]: any =
      await pool.query(
        `
        SELECT COUNT(*) AS total
        FROM hop_dong
        WHERE phong_id = ?
        `,
        [id]
      );

    const [suCoRows]: any =
      await pool.query(
        `
        SELECT COUNT(*) AS total
        FROM su_co
        WHERE phong_id = ?
        `,
        [id]
      );

    const coChiSo =
      Number(
        chiSoRows[0]?.total || 0
      ) > 0;

    const coDichVu =
      Number(
        dichVuRows[0]?.total || 0
      ) > 0;

    const coHopDong =
      Number(
        hopDongRows[0]?.total || 0
      ) > 0;

    const coSuCo =
      Number(
        suCoRows[0]?.total || 0
      ) > 0;

    if (
      coChiSo ||
      coDichVu ||
      coHopDong ||
      coSuCo
    ) {
      const relatedTables: string[] = [];

      if (coChiSo) {
        relatedTables.push(
          'chỉ số điện nước'
        );
      }

      if (coDichVu) {
        relatedTables.push(
          'dịch vụ phòng'
        );
      }

      if (coHopDong) {
        relatedTables.push(
          'hợp đồng'
        );
      }

      if (coSuCo) {
        relatedTables.push(
          'sự cố'
        );
      }

      throw {
        statusCode: 400,
        message:
          `Không thể xóa phòng ${soPhong} vì đang có dữ liệu liên quan: ${relatedTables.join(', ')}.`
      };
    }

    try {
      await pool.query(
        `
        DELETE FROM phong_tro
        WHERE id = ?
        `,
        [id]
      );
    } catch (error: any) {
      console.error(
        'LỖI MYSQL KHI XÓA PHÒNG:',
        error
      );

      if (
        error.code ===
          'ER_ROW_IS_REFERENCED_2' ||
        error.code ===
          'ER_ROW_IS_REFERENCED'
      ) {
        throw {
          statusCode: 400,
          message:
            `Không thể xóa phòng ${soPhong} vì dữ liệu này đang được sử dụng ở nơi khác.`
        };
      }

      throw error;
    }
  }
}
