
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `quang_cao` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tieu_de` varchar(150) NOT NULL,
  `noi_dung` text DEFAULT NULL,
  `loai` enum('khuyen_mai','thong_bao','gioi_thieu') NOT NULL DEFAULT 'khuyen_mai',
  `ma_uu_dai` varchar(30) DEFAULT NULL,
  `mau_nen` varchar(20) NOT NULL DEFAULT 'indigo',
  `doi_tuong` enum('tat_ca','khach','nguoi_thue') NOT NULL DEFAULT 'tat_ca',
  `ngay_bat_dau` date DEFAULT NULL,
  `ngay_ket_thuc` date DEFAULT NULL,
  `thu_tu` int(11) NOT NULL DEFAULT 0,
  `luot_xem` int(11) NOT NULL DEFAULT 0,
  `trang_thai` enum('hien','an') NOT NULL DEFAULT 'hien',
  `ngay_tao` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `yeu_cau_xem_phong` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ho_ten` varchar(100) NOT NULL,
  `so_dien_thoai` varchar(15) NOT NULL,
  `phong_id` int(11) DEFAULT NULL,
  `ngay_hen` date DEFAULT NULL,
  `ghi_chu` text DEFAULT NULL,
  `nguon` enum('website','chatbot') NOT NULL DEFAULT 'website',
  `trang_thai` enum('moi','da_lien_he','da_thue','huy') NOT NULL DEFAULT 'moi',
  `ngay_tao` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_ycxp_phong` (`phong_id`),
  CONSTRAINT `fk_ycxp_phong` FOREIGN KEY (`phong_id`) REFERENCES `phong_tro` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `chatbot_mau_cau` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `y_dinh` varchar(50) NOT NULL,
  `cau_mau` varchar(255) NOT NULL,
  `ngay_tao` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_y_dinh` (`y_dinh`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `chatbot_lich_su` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tai_khoan_id` int(11) DEFAULT NULL,
  `vai_tro` varchar(20) NOT NULL DEFAULT 'khach',
  `cau_hoi` text NOT NULL,
  `y_dinh` varchar(50) DEFAULT NULL,
  `do_tin_cay` float DEFAULT NULL,
  `da_hieu` tinyint(1) NOT NULL DEFAULT 1,
  `tra_loi` text DEFAULT NULL,
  `da_xu_ly` tinyint(1) NOT NULL DEFAULT 0,
  `ngay_tao` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_cbls_taikhoan` (`tai_khoan_id`),
  CONSTRAINT `fk_cbls_taikhoan` FOREIGN KEY (`tai_khoan_id`) REFERENCES `tai_khoan` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELETE FROM `chatbot_lich_su`;
DELETE FROM `chatbot_mau_cau`;
DELETE FROM `yeu_cau_xem_phong`;
DELETE FROM `quang_cao`;
DELETE FROM `su_co`;
DELETE FROM `nhat_ky_thanh_toan`;
DELETE FROM `chi_tiet_hoa_don`;
DELETE FROM `hoa_don`;
DELETE FROM `chi_so_dien_nuoc`;
DELETE FROM `thanh_vien_phong`;
DELETE FROM `hop_dong`;
DELETE FROM `nguoi_thue`;
DELETE FROM `dich_vu_phong`;
DELETE FROM `dich_vu`;
DELETE FROM `phong_tro`;
DELETE FROM `tai_khoan`;

INSERT INTO `tai_khoan` (`id`, `ten_dang_nhap`, `mat_khau`, `vai_tro`, `trang_thai`, `lan_dang_nhap_cuoi`, `ngay_tao`) VALUES
  (1, 'admin', '$2a$10$z8nFSy.2fWsE344WmEkuauAdDg0VFHOQ1QlqyU36t5sIpuOgx9W22', 'chu_nha', 'hoat_dong', '2026-09-30 08:15:00', '2025-12-01 07:00:00'),
  (2, 'nhanvien', '$2a$10$z8nFSy.2fWsE344WmEkuauAdDg0VFHOQ1QlqyU36t5sIpuOgx9W22', 'nhan_vien', 'hoat_dong', '2026-09-29 17:40:00', '2025-12-01 07:05:00'),
  (3, '0901234567', '$2a$10$z8nFSy.2fWsE344WmEkuauAdDg0VFHOQ1QlqyU36t5sIpuOgx9W22', 'nguoi_thue', 'hoat_dong', '2026-09-21 20:05:00', '2026-01-02 09:00:00'),
  (4, '0912345678', '$2a$10$z8nFSy.2fWsE344WmEkuauAdDg0VFHOQ1QlqyU36t5sIpuOgx9W22', 'nguoi_thue', 'hoat_dong', '2026-09-22 20:10:00', '2026-01-02 09:00:00'),
  (5, '0933456789', '$2a$10$z8nFSy.2fWsE344WmEkuauAdDg0VFHOQ1QlqyU36t5sIpuOgx9W22', 'nguoi_thue', 'hoat_dong', '2026-09-23 20:15:00', '2026-01-02 09:00:00'),
  (6, '0977889900', '$2a$10$z8nFSy.2fWsE344WmEkuauAdDg0VFHOQ1QlqyU36t5sIpuOgx9W22', 'nguoi_thue', 'hoat_dong', NULL, '2026-01-02 09:00:00'),
  (7, '0388123456', '$2a$10$z8nFSy.2fWsE344WmEkuauAdDg0VFHOQ1QlqyU36t5sIpuOgx9W22', 'nguoi_thue', 'hoat_dong', '2026-09-25 20:25:00', '2026-01-02 09:00:00'),
  (8, '0355667788', '$2a$10$z8nFSy.2fWsE344WmEkuauAdDg0VFHOQ1QlqyU36t5sIpuOgx9W22', 'nguoi_thue', 'hoat_dong', '2026-09-26 20:30:00', '2026-01-02 09:00:00'),
  (9, '0766554433', '$2a$10$z8nFSy.2fWsE344WmEkuauAdDg0VFHOQ1QlqyU36t5sIpuOgx9W22', 'nguoi_thue', 'hoat_dong', '2026-09-27 20:35:00', '2026-01-02 09:00:00'),
  (10, '0869112233', '$2a$10$z8nFSy.2fWsE344WmEkuauAdDg0VFHOQ1QlqyU36t5sIpuOgx9W22', 'nguoi_thue', 'hoat_dong', NULL, '2026-01-02 09:00:00'),
  (11, '0912000111', '$2a$10$z8nFSy.2fWsE344WmEkuauAdDg0VFHOQ1QlqyU36t5sIpuOgx9W22', 'nguoi_thue', 'khoa', '2026-09-29 20:45:00', '2026-01-02 09:00:00');

INSERT INTO `phong_tro` (`id`, `so_phong`, `tang`, `gia_thue`, `dien_tich`, `so_nguoi_toi_da`, `trang_thai`, `mo_ta`, `ngay_tao`) VALUES
  (1, 'P101', 1, 2500000, 20, 2, 'da_thue', 'Gác lửng, WC riêng', '2025-12-01 08:00:00'),
  (2, 'P102', 1, 2300000, 18, 2, 'da_thue', 'Cửa sổ thoáng, WC riêng', '2025-12-01 08:00:00'),
  (3, 'P103', 1, 2400000, 19, 2, 'da_thue', 'Có kệ bếp', '2025-12-01 08:00:00'),
  (4, 'P104', 1, 2200000, 16, 1, 'dang_bao_tri', 'Đang sửa lại nhà vệ sinh', '2025-12-01 08:00:00'),
  (5, 'P201', 2, 3000000, 25, 3, 'da_thue', 'Ban công, máy lạnh', '2025-12-01 08:00:00'),
  (6, 'P202', 2, 2800000, 22, 2, 'da_thue', 'Máy lạnh, tủ lạnh mini', '2025-12-01 08:00:00'),
  (7, 'P203', 2, 2700000, 22, 2, 'trong', 'Phòng góc, 2 cửa sổ', '2025-12-01 08:00:00'),
  (8, 'P204', 2, 2900000, 24, 3, 'da_thue', 'Bếp riêng, máy nước nóng', '2025-12-01 08:00:00');

INSERT INTO `dich_vu` (`id`, `ten_dich_vu`, `don_gia`, `don_vi_tinh`, `loai_dich_vu`) VALUES
  (1, 'Điện', 3500, 'kWh', 'theo_chi_so'),
  (2, 'Nước', 15000, 'm3', 'theo_chi_so'),
  (3, 'Internet', 100000, 'phòng', 'co_dinh'),
  (4, 'Rác', 20000, 'người', 'co_dinh');

INSERT INTO `dich_vu_phong` (`phong_id`, `dich_vu_id`) VALUES
  (1, 1),
  (1, 2),
  (1, 3),
  (1, 4),
  (2, 1),
  (2, 2),
  (3, 1),
  (3, 2),
  (3, 4),
  (4, 1),
  (4, 2),
  (5, 1),
  (5, 2),
  (5, 3),
  (6, 1),
  (6, 2),
  (6, 4),
  (7, 1),
  (7, 2),
  (8, 1),
  (8, 2),
  (8, 3);

INSERT INTO `nguoi_thue` (`id`, `tai_khoan_id`, `ho_ten`, `so_dien_thoai`, `email`, `can_cuoc_cong_dan`, `gioi_tinh`, `ngay_sinh`, `que_quan`, `anh_cccd_mat_truoc`, `anh_cccd_mat_sau`, `da_dang_ky_tam_tru`, `trang_thai`, `ngay_tao`) VALUES
  (1, 3, 'Nguyễn Văn An', '0901234567', 'an.nguyen@gmail.com', '079200123456', 'nam', '2000-05-12', 'Đồng Nai', NULL, NULL, 1, 'dang_thue', '2026-01-02 09:00:00'),
  (2, 4, 'Trần Thị Bình', '0912345678', 'binh.tran@gmail.com', '079301654321', 'nu', '2001-11-03', 'Long An', NULL, NULL, 1, 'dang_thue', '2026-01-02 09:00:00'),
  (3, 5, 'Lê Quốc Cường', '0933456789', 'cuong.le@gmail.com', '075099112233', 'nam', '1999-02-20', 'Bến Tre', NULL, NULL, 1, 'dang_thue', '2026-01-02 09:00:00'),
  (4, 6, 'Phạm Ngọc Dung', '0977889900', NULL, '083302445566', 'nu', '2002-08-15', 'Tiền Giang', NULL, NULL, 0, 'dang_thue', '2026-01-02 09:00:00'),
  (5, 7, 'Hoàng Minh Đức', '0388123456', 'duc.hoang@gmail.com', '040098778899', 'nam', '1998-12-01', 'Nghệ An', NULL, NULL, 1, 'dang_thue', '2026-01-02 09:00:00'),
  (6, 8, 'Võ Thu Hà', '0355667788', 'ha.vo@gmail.com', '052303334455', 'nu', '2003-04-09', 'Bình Định', NULL, NULL, 1, 'dang_thue', '2026-01-02 09:00:00'),
  (7, 9, 'Đặng Gia Huy', '0766554433', NULL, '092201556677', 'nam', '2001-07-27', 'Cần Thơ', NULL, NULL, 1, 'dang_thue', '2026-01-02 09:00:00'),
  (8, 10, 'Bùi Mỹ Linh', '0869112233', 'linh.bui@gmail.com', '066300998877', 'nu', '2000-10-18', 'Đắk Lắk', NULL, NULL, 0, 'dang_thue', '2026-01-02 09:00:00'),
  (9, 11, 'Đỗ Tuấn Khoa', '0912000111', 'khoa.do@gmail.com', '038097223344', 'nam', '1997-03-05', 'Thanh Hóa', NULL, NULL, 1, 'da_chuyen_di', '2026-01-02 09:00:00');

INSERT INTO `hop_dong` (`id`, `ma_hop_dong`, `phong_id`, `chu_hop_dong_id`, `ngay_bat_dau`, `ngay_ket_thuc`, `tien_coc`, `trang_thai_tien_coc`, `ngay_chot_tien_hang_thang`, `trang_thai`, `ngay_tao`) VALUES
  (1, 'HD202607-001', 1, 1, '2026-07-01', '2027-06-30', 2500000, 'dang_giu', 5, 'con_han', '2026-07-01 08:30:00'),
  (2, 'HD202510-002', 2, 3, '2025-10-01', '2026-10-15', 2300000, 'dang_giu', 5, 'con_han', '2025-10-01 08:30:00'),
  (3, 'HD202602-003', 3, 4, '2026-02-01', '2027-01-31', 2400000, 'dang_giu', 5, 'con_han', '2026-02-01 08:30:00'),
  (4, 'HD202601-004', 5, 5, '2026-01-01', '2026-12-31', 3000000, 'dang_giu', 5, 'con_han', '2026-01-01 08:30:00'),
  (5, 'HD202603-005', 6, 7, '2026-03-01', '2027-02-28', 2800000, 'dang_giu', 5, 'con_han', '2026-03-01 08:30:00'),
  (6, 'HD202606-006', 8, 8, '2026-06-01', '2027-05-31', 2900000, 'dang_giu', 5, 'con_han', '2026-06-01 08:30:00'),
  (7, 'HD202601-007', 7, 9, '2026-01-01', '2026-07-31', 2700000, 'da_hoan_tra', 5, 'het_han', '2026-01-01 08:30:00');

INSERT INTO `thanh_vien_phong` (`id`, `hop_dong_id`, `nguoi_thue_id`, `la_chu_hop_dong`, `ngay_vao_o`) VALUES
  (1, 1, 1, 1, '2026-07-01'),
  (2, 1, 2, 0, '2026-07-01'),
  (3, 2, 3, 1, '2025-10-01'),
  (4, 3, 4, 1, '2026-02-01'),
  (5, 4, 5, 1, '2026-01-01'),
  (6, 4, 6, 0, '2026-01-01'),
  (7, 5, 7, 1, '2026-03-01'),
  (8, 6, 8, 1, '2026-06-01'),
  (9, 7, 9, 1, '2026-01-01');

INSERT INTO `chi_so_dien_nuoc` (`id`, `phong_id`, `thang_nam`, `chi_so_dien_cu`, `chi_so_dien_moi`, `chi_so_nuoc_cu`, `chi_so_nuoc_moi`, `ngay_ghi`) VALUES
  (1, 1, '2026-08', 1000, 1145, 50, 59, '2026-08-31'),
  (2, 2, '2026-08', 2310, 2385, 120, 125, '2026-08-31'),
  (3, 3, '2026-08', 870, 940, 64, 69, '2026-08-31'),
  (4, 5, '2026-08', 1520, 1712, 88, 101, '2026-08-31'),
  (5, 6, '2026-08', 640, 705, 40, 44, '2026-08-31'),
  (6, 8, '2026-08', 300, 372, 15, 20, '2026-08-31'),
  (7, 1, '2026-09', 1145, 1280, 59, 67, '2026-09-30'),
  (8, 2, '2026-09', 2385, 2452, 125, 129, '2026-09-30'),
  (9, 3, '2026-09', 940, 1012, 69, 73, '2026-09-30'),
  (10, 5, '2026-09', 1712, 1890, 101, 113, '2026-09-30'),
  (11, 8, '2026-09', 372, 441, 20, 24, '2026-09-30');

INSERT INTO `hoa_don` (`id`, `ma_hoa_don`, `hop_dong_id`, `thang_nam`, `tien_phong`, `tong_tien`, `so_tien_da_tra`, `trang_thai`, `han_thanhtoan`, `ngay_tao`) VALUES
  (1, 'HD202608-0001', 1, '2026-08', 2500000, 3282500, 3282500, 'da_thanhtoan', '2026-09-10', '2026-09-01 08:00:00'),
  (2, 'HD202608-0002', 2, '2026-08', 2300000, 2637500, 2637500, 'da_thanhtoan', '2026-09-10', '2026-09-01 08:00:00'),
  (3, 'HD202608-0003', 3, '2026-08', 2400000, 2740000, 0, 'qua_han', '2026-09-10', '2026-09-01 08:00:00'),
  (4, 'HD202608-0004', 4, '2026-08', 3000000, 3967000, 3967000, 'da_thanhtoan', '2026-09-10', '2026-09-01 08:00:00'),
  (5, 'HD202608-0005', 5, '2026-08', 2800000, 3107500, 1500000, 'qua_han', '2026-09-10', '2026-09-01 08:00:00'),
  (6, 'HD202608-0006', 6, '2026-08', 2900000, 3327000, 3327000, 'da_thanhtoan', '2026-09-10', '2026-09-01 08:00:00'),
  (7, 'HD202609-0001', 1, '2026-09', 2500000, 3232500, 0, 'chua_thanhtoan', '2026-10-10', '2026-09-30 08:00:00'),
  (8, 'HD202609-0002', 2, '2026-09', 2300000, 2594500, 2594500, 'da_thanhtoan', '2026-10-10', '2026-09-30 08:00:00'),
  (9, 'HD202609-0003', 3, '2026-09', 2400000, 2732000, 0, 'chua_thanhtoan', '2026-10-10', '2026-09-30 08:00:00'),
  (10, 'HD202609-0004', 4, '2026-09', 3000000, 3903000, 1000000, 'thanhtoan_motphan', '2026-10-10', '2026-09-30 08:00:00'),
  (11, 'HD202609-0006', 6, '2026-09', 2900000, 3301500, 0, 'chua_thanhtoan', '2026-10-10', '2026-09-30 08:00:00');

INSERT INTO `chi_tiet_hoa_don` (`id`, `hoa_don_id`, `ten_dich_vu`, `don_gia`, `so_luong`, `thanh_tien`) VALUES
  (1, 1, 'Tiền phòng', 2500000, 1, 2500000),
  (2, 1, 'Điện', 3500, 145, 507500),
  (3, 1, 'Nước', 15000, 9, 135000),
  (4, 1, 'Internet', 100000, 1, 100000),
  (5, 1, 'Rác', 20000, 2, 40000),
  (6, 2, 'Tiền phòng', 2300000, 1, 2300000),
  (7, 2, 'Điện', 3500, 75, 262500),
  (8, 2, 'Nước', 15000, 5, 75000),
  (9, 3, 'Tiền phòng', 2400000, 1, 2400000),
  (10, 3, 'Điện', 3500, 70, 245000),
  (11, 3, 'Nước', 15000, 5, 75000),
  (12, 3, 'Rác', 20000, 1, 20000),
  (13, 4, 'Tiền phòng', 3000000, 1, 3000000),
  (14, 4, 'Điện', 3500, 192, 672000),
  (15, 4, 'Nước', 15000, 13, 195000),
  (16, 4, 'Internet', 100000, 1, 100000),
  (17, 5, 'Tiền phòng', 2800000, 1, 2800000),
  (18, 5, 'Điện', 3500, 65, 227500),
  (19, 5, 'Nước', 15000, 4, 60000),
  (20, 5, 'Rác', 20000, 1, 20000),
  (21, 6, 'Tiền phòng', 2900000, 1, 2900000),
  (22, 6, 'Điện', 3500, 72, 252000),
  (23, 6, 'Nước', 15000, 5, 75000),
  (24, 6, 'Internet', 100000, 1, 100000),
  (25, 7, 'Tiền phòng', 2500000, 1, 2500000),
  (26, 7, 'Điện', 3500, 135, 472500),
  (27, 7, 'Nước', 15000, 8, 120000),
  (28, 7, 'Internet', 100000, 1, 100000),
  (29, 7, 'Rác', 20000, 2, 40000),
  (30, 8, 'Tiền phòng', 2300000, 1, 2300000),
  (31, 8, 'Điện', 3500, 67, 234500),
  (32, 8, 'Nước', 15000, 4, 60000),
  (33, 9, 'Tiền phòng', 2400000, 1, 2400000),
  (34, 9, 'Điện', 3500, 72, 252000),
  (35, 9, 'Nước', 15000, 4, 60000),
  (36, 9, 'Rác', 20000, 1, 20000),
  (37, 10, 'Tiền phòng', 3000000, 1, 3000000),
  (38, 10, 'Điện', 3500, 178, 623000),
  (39, 10, 'Nước', 15000, 12, 180000),
  (40, 10, 'Internet', 100000, 1, 100000),
  (41, 11, 'Tiền phòng', 2900000, 1, 2900000),
  (42, 11, 'Điện', 3500, 69, 241500),
  (43, 11, 'Nước', 15000, 4, 60000),
  (44, 11, 'Internet', 100000, 1, 100000);

INSERT INTO `nhat_ky_thanh_toan` (`id`, `hoa_don_id`, `so_tien`, `phuong_thuc`, `ma_giao_dich`, `ghi_chu`, `ngay_thanh_toan`) VALUES
  (1, 1, 3282500, 'chuyen_khoan', 'CH260904000101', NULL, '2026-09-04 19:20:00'),
  (2, 2, 2637500, 'tien_mat', NULL, NULL, '2026-09-06 08:45:00'),
  (3, 4, 2000000, 'momo', 'MO260903000403', 'Trả trước một phần', '2026-09-03 10:00:00'),
  (4, 4, 1967000, 'chuyen_khoan', 'CH260912000404', NULL, '2026-09-12 21:05:00'),
  (5, 5, 1500000, 'tien_mat', NULL, 'Trả trước một phần', '2026-09-08 18:30:00'),
  (6, 6, 3327000, 'vnpay', 'VN260909000606', NULL, '2026-09-09 07:50:00'),
  (7, 8, 2594500, 'chuyen_khoan', 'CH260930000807', NULL, '2026-09-30 09:10:00'),
  (8, 10, 1000000, 'momo', 'MO260930001008', 'Trả trước một phần', '2026-09-30 20:00:00');

INSERT INTO `su_co` (`id`, `phong_id`, `nguoi_bao_id`, `tieu_de`, `mo_ta`, `hinh_anh`, `muc_do_uu_tien`, `trang_thai`, `ngay_tao`) VALUES
  (1, 5, 5, 'Máy lạnh không mát', 'Máy lạnh chỉ ra gió, không lạnh.', NULL, 'cao', 'da_xuly', '2026-06-12 20:15:00'),
  (2, 2, 3, 'Khóa cửa bị kẹt', 'Khóa cửa chính khó mở.', NULL, 'trung_binh', 'da_xuly', '2026-07-03 08:40:00'),
  (3, 6, 7, 'Mạng wifi yếu', 'Wifi rớt mạng buổi tối.', NULL, 'thap', 'tu_choy', '2026-08-15 21:30:00'),
  (4, 3, 4, 'Tắc bồn cầu', 'Bồn cầu bị nghẹt, xả không xuống.', NULL, 'khan_cap', 'dang_xuly', '2026-09-26 07:10:00'),
  (5, 8, 8, 'Bóng đèn phòng tắm bị cháy', 'Bóng đèn nhà tắm không sáng.', NULL, 'thap', 'dang_xuly', '2026-09-27 19:45:00'),
  (6, 1, 2, 'Vòi sen bị rỉ nước', 'Vòi sen nhà tắm rỉ nước ở chỗ nối.', NULL, 'trung_binh', 'cho_xuly', '2026-09-29 20:10:00');

INSERT INTO `quang_cao` (`id`, `tieu_de`, `noi_dung`, `loai`, `ma_uu_dai`, `mau_nen`, `doi_tuong`, `ngay_bat_dau`, `ngay_ket_thuc`, `thu_tu`, `luot_xem`, `trang_thai`, `ngay_tao`) VALUES
  (1, 'Giảm 50% tiền phòng tháng đầu', 'Áp dụng cho khách ký hợp đồng từ 6 tháng trở lên trong tháng 10–11/2026. Nhắn chatbot hoặc gọi chủ nhà để giữ phòng.', 'khuyen_mai', 'THANGDAU50', 'rose', 'khach', '2026-10-01', '2026-11-30', 1, 128, 'hien', '2026-09-01 08:00:00'),
  (2, 'Miễn phí Internet 3 tháng', 'Phòng mới thuê được miễn phí Internet cáp quang 3 tháng đầu, tốc độ 150 Mbps.', 'khuyen_mai', 'WIFI3THANG', 'indigo', 'khach', '2026-09-15', '2026-12-31', 2, 96, 'hien', '2026-09-01 08:00:00'),
  (3, 'Giới thiệu bạn bè – nhận 200.000 ₫', 'Người thuê giới thiệu bạn thuê phòng thành công được giảm 200.000 ₫ vào hóa đơn tháng kế tiếp.', 'khuyen_mai', 'BANBE200', 'emerald', 'tat_ca', '2026-09-01', '2026-12-31', 3, 64, 'hien', '2026-09-01 08:00:00'),
  (4, 'Lịch bảo trì máy bơm nước 12/10', 'Nhà trọ tạm ngưng cấp nước từ 8h–10h sáng Chủ nhật 12/10/2026 để bảo trì máy bơm. Mong các bạn thông cảm.', 'thong_bao', NULL, 'amber', 'nguoi_thue', '2026-10-01', '2026-10-12', 4, 21, 'hien', '2026-09-01 08:00:00');

INSERT INTO `yeu_cau_xem_phong` (`id`, `ho_ten`, `so_dien_thoai`, `phong_id`, `ngay_hen`, `ghi_chu`, `nguon`, `trang_thai`, `ngay_tao`) VALUES
  (1, 'Ngô Thanh Tâm', '0938111222', 7, '2026-10-08', 'Muốn xem phòng buổi chiều sau 17h', 'website', 'moi', '2026-10-05 21:15:00'),
  (2, 'Lý Bảo Ngọc', '0977333444', 7, '2026-10-06', 'Hỏi qua chatbot, đi 2 người', 'chatbot', 'da_lien_he', '2026-10-03 09:40:00'),
  (3, 'Dương Quốc Huy', '0909555666', NULL, NULL, 'Cần phòng dưới 3 triệu', 'website', 'huy', '2026-09-20 14:00:00');

ALTER TABLE `tai_khoan` AUTO_INCREMENT = 12;
ALTER TABLE `phong_tro` AUTO_INCREMENT = 9;
ALTER TABLE `dich_vu` AUTO_INCREMENT = 5;
ALTER TABLE `nguoi_thue` AUTO_INCREMENT = 10;
ALTER TABLE `hop_dong` AUTO_INCREMENT = 8;
ALTER TABLE `thanh_vien_phong` AUTO_INCREMENT = 10;
ALTER TABLE `chi_so_dien_nuoc` AUTO_INCREMENT = 12;
ALTER TABLE `hoa_don` AUTO_INCREMENT = 12;
ALTER TABLE `chi_tiet_hoa_don` AUTO_INCREMENT = 45;
ALTER TABLE `nhat_ky_thanh_toan` AUTO_INCREMENT = 9;
ALTER TABLE `su_co` AUTO_INCREMENT = 7;
ALTER TABLE `quang_cao` AUTO_INCREMENT = 5;
ALTER TABLE `yeu_cau_xem_phong` AUTO_INCREMENT = 4;
ALTER TABLE `chatbot_mau_cau` AUTO_INCREMENT = 1;
ALTER TABLE `chatbot_lich_su` AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;
