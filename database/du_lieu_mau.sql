
SET NAMES utf8mb4;
SET @hash = '$2a$10$z8nFSy.2fWsE344WmEkuauAdDg0VFHOQ1QlqyU36t5sIpuOgx9W22';

INSERT IGNORE INTO tai_khoan (ten_dang_nhap, mat_khau, vai_tro, trang_thai) VALUES
  ('admin',    @hash, 'chu_nha',   'hoat_dong'),
  ('nhanvien', @hash, 'nhan_vien', 'hoat_dong');

INSERT IGNORE INTO phong_tro (so_phong, tang, gia_thue, dien_tich, so_nguoi_toi_da, trang_thai, mo_ta) VALUES
  ('P101', 1, 2500000, 20, 2, 'trong', 'Phòng có gác lửng, WC riêng'),
  ('P102', 1, 2300000, 18, 2, 'trong', 'Phòng thoáng, cửa sổ lớn'),
  ('P201', 2, 3000000, 25, 3, 'trong', 'Có ban công, máy lạnh'),
  ('P202', 2, 2800000, 22, 2, 'dang_bao_tri', 'Đang sơn lại');

INSERT IGNORE INTO dich_vu (ten_dich_vu, don_gia, don_vi_tinh, loai_dich_vu) VALUES
  ('Điện',     3500,   'kWh',   'theo_chi_so'),
  ('Nước',     15000,  'm3',    'theo_chi_so'),
  ('Internet', 100000, 'phòng', 'co_dinh'),
  ('Rác',      20000,  'người', 'co_dinh');

INSERT IGNORE INTO dich_vu_phong (phong_id, dich_vu_id)
  SELECT p.id, d.id FROM phong_tro p CROSS JOIN dich_vu d
  WHERE p.so_phong IN ('P101', 'P102', 'P201', 'P202')
    AND d.ten_dich_vu IN ('Điện', 'Nước', 'Internet', 'Rác');

INSERT IGNORE INTO tai_khoan (ten_dang_nhap, mat_khau, vai_tro, trang_thai) VALUES
  ('0901234567', @hash, 'nguoi_thue', 'hoat_dong'),
  ('0912345678', @hash, 'nguoi_thue', 'hoat_dong');

INSERT IGNORE INTO nguoi_thue (tai_khoan_id, ho_ten, so_dien_thoai, email, can_cuoc_cong_dan, gioi_tinh, ngay_sinh, que_quan, da_dang_ky_tam_tru, trang_thai)
  SELECT id, 'Nguyễn Văn An', '0901234567', 'an.nguyen@example.com', '079200123456', 'nam', '2000-05-12', 'Đồng Nai', 1, 'dang_thue'
  FROM tai_khoan WHERE ten_dang_nhap = '0901234567';

INSERT IGNORE INTO nguoi_thue (tai_khoan_id, ho_ten, so_dien_thoai, email, can_cuoc_cong_dan, gioi_tinh, ngay_sinh, que_quan, da_dang_ky_tam_tru, trang_thai)
  SELECT id, 'Trần Thị Bình', '0912345678', 'binh.tran@example.com', '079301654321', 'nu', '2001-11-03', 'Long An', 0, 'dang_thue'
  FROM tai_khoan WHERE ten_dang_nhap = '0912345678';

INSERT IGNORE INTO hop_dong (ma_hop_dong, phong_id, chu_hop_dong_id, ngay_bat_dau, ngay_ket_thuc, tien_coc, trang_thai_tien_coc, ngay_chot_tien_hang_thang, trang_thai)
  SELECT 'HD-MAU-001', p.id, n.id, '2026-07-01', '2027-06-30', 2500000, 'dang_giu', 5, 'con_han'
  FROM phong_tro p, nguoi_thue n
  WHERE p.so_phong = 'P101' AND n.can_cuoc_cong_dan = '079200123456';

INSERT INTO thanh_vien_phong (hop_dong_id, nguoi_thue_id, la_chu_hop_dong, ngay_vao_o)
  SELECT hd.id, n.id, IF(n.id = hd.chu_hop_dong_id, 1, 0), '2026-07-01'
  FROM hop_dong hd, nguoi_thue n
  WHERE hd.ma_hop_dong = 'HD-MAU-001' AND n.can_cuoc_cong_dan IN ('079200123456', '079301654321')
    AND NOT EXISTS (SELECT 1 FROM thanh_vien_phong tv WHERE tv.hop_dong_id = hd.id AND tv.nguoi_thue_id = n.id);

UPDATE phong_tro SET trang_thai = 'da_thue' WHERE so_phong = 'P101';

INSERT IGNORE INTO chi_so_dien_nuoc (phong_id, thang_nam, chi_so_dien_cu, chi_so_dien_moi, chi_so_nuoc_cu, chi_so_nuoc_moi, ngay_ghi)
  SELECT id, '2026-07', 1000, 1120, 50, 58, '2026-07-31' FROM phong_tro WHERE so_phong = 'P101';
INSERT IGNORE INTO chi_so_dien_nuoc (phong_id, thang_nam, chi_so_dien_cu, chi_so_dien_moi, chi_so_nuoc_cu, chi_so_nuoc_moi, ngay_ghi)
  SELECT id, '2026-08', 1120, 1265, 58, 67, '2026-08-31' FROM phong_tro WHERE so_phong = 'P101';
