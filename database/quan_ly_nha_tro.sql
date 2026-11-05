
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

CREATE TABLE `chi_so_dien_nuoc` (
  `id` int(11) NOT NULL,
  `phong_id` int(11) NOT NULL,
  `thang_nam` varchar(7) NOT NULL,
  `chi_so_dien_cu` int(11) NOT NULL,
  `chi_so_dien_moi` int(11) NOT NULL,
  `chi_so_nuoc_cu` int(11) NOT NULL,
  `chi_so_nuoc_moi` int(11) NOT NULL,
  `ngay_ghi` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `chi_tiet_hoa_don` (
  `id` int(11) NOT NULL,
  `hoa_don_id` int(11) NOT NULL,
  `ten_dich_vu` varchar(50) NOT NULL,
  `don_gia` decimal(12,2) NOT NULL,
  `so_luong` float NOT NULL,
  `thanh_tien` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `dich_vu` (
  `id` int(11) NOT NULL,
  `ten_dich_vu` varchar(50) NOT NULL,
  `don_gia` decimal(12,2) NOT NULL DEFAULT 0.00,
  `don_vi_tinh` varchar(20) NOT NULL,
  `loai_dich_vu` enum('theo_chi_so','co_dinh') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `dich_vu_phong` (
  `phong_id` int(11) NOT NULL,
  `dich_vu_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `hoa_don` (
  `id` int(11) NOT NULL,
  `ma_hoa_don` varchar(50) NOT NULL,
  `hop_dong_id` int(11) NOT NULL,
  `thang_nam` varchar(7) NOT NULL,
  `tien_phong` decimal(12,2) NOT NULL,
  `tong_tien` decimal(12,2) NOT NULL,
  `so_tien_da_tra` decimal(12,2) DEFAULT 0.00,
  `trang_thai` enum('chua_thanhtoan','thanhtoan_motphan','da_thanhtoan','qua_han') DEFAULT 'chua_thanhtoan',
  `han_thanhtoan` date NOT NULL,
  `ngay_tao` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `hop_dong` (
  `id` int(11) NOT NULL,
  `ma_hop_dong` varchar(50) NOT NULL,
  `phong_id` int(11) NOT NULL,
  `chu_hop_dong_id` int(11) NOT NULL,
  `ngay_bat_dau` date NOT NULL,
  `ngay_ket_thuc` date NOT NULL,
  `tien_coc` decimal(12,2) DEFAULT 0.00,
  `trang_thai_tien_coc` enum('dang_giu','da_hoan_tra','da_khau_tru') DEFAULT 'dang_giu',
  `ngay_chot_tien_hang_thang` int(11) DEFAULT 1,
  `trang_thai` enum('con_han','het_han','da_huy') DEFAULT 'con_han',
  `ngay_tao` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `nguoi_thue` (
  `id` int(11) NOT NULL,
  `tai_khoan_id` int(11) DEFAULT NULL,
  `ho_ten` varchar(100) NOT NULL,
  `so_dien_thoai` varchar(15) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `can_cuoc_cong_dan` varchar(20) NOT NULL,
  `gioi_tinh` enum('nam','nu','khac') DEFAULT 'nam',
  `ngay_sinh` date DEFAULT NULL,
  `que_quan` varchar(255) DEFAULT NULL,
  `anh_cccd_mat_truoc` varchar(255) DEFAULT NULL,
  `anh_cccd_mat_sau` varchar(255) DEFAULT NULL,
  `da_dang_ky_tam_tru` tinyint(1) DEFAULT 0,
  `trang_thai` enum('dang_thue','da_chuyen_di') DEFAULT 'dang_thue',
  `ngay_tao` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `nhat_ky_thanh_toan` (
  `id` int(11) NOT NULL,
  `hoa_don_id` int(11) NOT NULL,
  `so_tien` decimal(12,2) NOT NULL,
  `phuong_thuc` enum('tien_mat','chuyen_khoan','momo','vnpay') DEFAULT 'chuyen_khoan',
  `ma_giao_dich` varchar(100) DEFAULT NULL,
  `ghi_chu` text DEFAULT NULL,
  `ngay_thanh_toan` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `phong_tro` (
  `id` int(11) NOT NULL,
  `so_phong` varchar(20) NOT NULL,
  `tang` int(11) DEFAULT 1,
  `gia_thue` decimal(12,2) NOT NULL DEFAULT 0.00,
  `dien_tich` float DEFAULT NULL,
  `so_nguoi_toi_da` int(11) DEFAULT 2,
  `trang_thai` enum('trong','da_thue','dang_bao_tri','da_coc') DEFAULT 'trong',
  `mo_ta` text DEFAULT NULL,
  `ngay_tao` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `su_co` (
  `id` int(11) NOT NULL,
  `phong_id` int(11) NOT NULL,
  `nguoi_bao_id` int(11) NOT NULL,
  `tieu_de` varchar(150) NOT NULL,
  `mo_ta` text DEFAULT NULL,
  `hinh_anh` varchar(255) DEFAULT NULL,
  `muc_do_uu_tien` enum('thap','trung_binh','cao','khan_cap') DEFAULT 'trung_binh',
  `trang_thai` enum('cho_xuly','dang_xuly','da_xuly','tu_choy') DEFAULT 'cho_xuly',
  `ngay_tao` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `tai_khoan` (
  `id` int(11) NOT NULL,
  `ten_dang_nhap` varchar(50) NOT NULL,
  `mat_khau` varchar(255) NOT NULL,
  `vai_tro` enum('chu_nha','nhan_vien','nguoi_thue') NOT NULL DEFAULT 'nguoi_thue',
  `trang_thai` enum('hoat_dong','khoa') DEFAULT 'hoat_dong',
  `lan_dang_nhap_cuoi` datetime DEFAULT NULL,
  `ngay_tao` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `thanh_vien_phong` (
  `id` int(11) NOT NULL,
  `hop_dong_id` int(11) NOT NULL,
  `nguoi_thue_id` int(11) NOT NULL,
  `la_chu_hop_dong` tinyint(1) DEFAULT 0,
  `ngay_vao_o` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `chi_so_dien_nuoc`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_phong_thang` (`phong_id`,`thang_nam`);

ALTER TABLE `chi_tiet_hoa_don`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_cthd_hoadon` (`hoa_don_id`);

ALTER TABLE `dich_vu`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ten_dich_vu` (`ten_dich_vu`);

ALTER TABLE `dich_vu_phong`
  ADD PRIMARY KEY (`phong_id`,`dich_vu_id`),
  ADD KEY `fk_dvp_dichvu` (`dich_vu_id`);

ALTER TABLE `hoa_don`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ma_hoa_don` (`ma_hoa_don`),
  ADD KEY `fk_hoadon_hopdong` (`hop_dong_id`);

ALTER TABLE `hop_dong`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ma_hop_dong` (`ma_hop_dong`),
  ADD KEY `fk_hopdong_phong` (`phong_id`),
  ADD KEY `fk_hopdong_nguoithue` (`chu_hop_dong_id`);

ALTER TABLE `nguoi_thue`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `so_dien_thoai` (`so_dien_thoai`),
  ADD UNIQUE KEY `can_cuoc_cong_dan` (`can_cuoc_cong_dan`),
  ADD UNIQUE KEY `tai_khoan_id` (`tai_khoan_id`);

ALTER TABLE `nhat_ky_thanh_toan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_nktt_hoadon` (`hoa_don_id`);

ALTER TABLE `phong_tro`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `so_phong` (`so_phong`);

ALTER TABLE `su_co`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_suco_phong` (`phong_id`),
  ADD KEY `fk_suco_nguoithue` (`nguoi_bao_id`);

ALTER TABLE `tai_khoan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ten_dang_nhap` (`ten_dang_nhap`);

ALTER TABLE `thanh_vien_phong`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_tvphong_hopdong` (`hop_dong_id`),
  ADD KEY `fk_tvphong_nguoithue` (`nguoi_thue_id`);

ALTER TABLE `chi_so_dien_nuoc`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `chi_tiet_hoa_don`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `dich_vu`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `hoa_don`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `hop_dong`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `nguoi_thue`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `nhat_ky_thanh_toan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `phong_tro`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `su_co`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `tai_khoan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `thanh_vien_phong`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `chi_so_dien_nuoc`
  ADD CONSTRAINT `fk_chisodn_phong` FOREIGN KEY (`phong_id`) REFERENCES `phong_tro` (`id`);

ALTER TABLE `chi_tiet_hoa_don`
  ADD CONSTRAINT `fk_cthd_hoadon` FOREIGN KEY (`hoa_don_id`) REFERENCES `hoa_don` (`id`) ON DELETE CASCADE;

ALTER TABLE `dich_vu_phong`
  ADD CONSTRAINT `fk_dvp_dichvu` FOREIGN KEY (`dich_vu_id`) REFERENCES `dich_vu` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_dvp_phong` FOREIGN KEY (`phong_id`) REFERENCES `phong_tro` (`id`) ON DELETE CASCADE;

ALTER TABLE `hoa_don`
  ADD CONSTRAINT `fk_hoadon_hopdong` FOREIGN KEY (`hop_dong_id`) REFERENCES `hop_dong` (`id`);

ALTER TABLE `hop_dong`
  ADD CONSTRAINT `fk_hopdong_nguoithue` FOREIGN KEY (`chu_hop_dong_id`) REFERENCES `nguoi_thue` (`id`),
  ADD CONSTRAINT `fk_hopdong_phong` FOREIGN KEY (`phong_id`) REFERENCES `phong_tro` (`id`);

ALTER TABLE `nguoi_thue`
  ADD CONSTRAINT `fk_nguoithue_taikhoan` FOREIGN KEY (`tai_khoan_id`) REFERENCES `tai_khoan` (`id`) ON DELETE SET NULL;

ALTER TABLE `nhat_ky_thanh_toan`
  ADD CONSTRAINT `fk_nktt_hoadon` FOREIGN KEY (`hoa_don_id`) REFERENCES `hoa_don` (`id`);

ALTER TABLE `su_co`
  ADD CONSTRAINT `fk_suco_nguoithue` FOREIGN KEY (`nguoi_bao_id`) REFERENCES `nguoi_thue` (`id`),
  ADD CONSTRAINT `fk_suco_phong` FOREIGN KEY (`phong_id`) REFERENCES `phong_tro` (`id`);

ALTER TABLE `thanh_vien_phong`
  ADD CONSTRAINT `fk_tvphong_hopdong` FOREIGN KEY (`hop_dong_id`) REFERENCES `hop_dong` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_tvphong_nguoithue` FOREIGN KEY (`nguoi_thue_id`) REFERENCES `nguoi_thue` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

SET NAMES utf8mb4;

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
