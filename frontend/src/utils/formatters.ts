export const formatCurrency = (
  amount: number | string | undefined | null
): string => {
  if (amount === undefined || amount === null || amount === '') {
    return '0 ₫';
  }

  const value = Number(amount);

  if (Number.isNaN(value)) {
    return '0 ₫';
  }

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

export const formatDate = (
  dateString: string | undefined | null
): string => {
  if (!dateString) return '';

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

export const formatDateTime = (
  dateString: string | undefined | null
): string => {
  if (!dateString) return '';

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export const trangThaiPhong = (status: string) => {
  switch (status) {
    case 'trong':
      return {
        label: 'Trống',
        color: 'bg-green-100 text-green-800',
      };

    case 'da_thue':
      return {
        label: 'Đã thuê',
        color: 'bg-blue-100 text-blue-800',
      };

    case 'dang_bao_tri':
      return {
        label: 'Đang bảo trì',
        color: 'bg-red-100 text-red-800',
      };

    case 'da_coc':
      return {
        label: 'Đã cọc',
        color: 'bg-yellow-100 text-yellow-800',
      };

    default:
      return {
        label: 'Không xác định',
        color: 'bg-gray-100 text-gray-800',
      };
  }
};

export const trangThaiHopDong = (status: string) => {
  switch (status) {
    case 'con_han':
      return {
        label: 'Còn hạn',
        color: 'bg-green-100 text-green-800',
      };

    case 'het_han':
      return {
        label: 'Hết hạn',
        color: 'bg-red-100 text-red-800',
      };

    case 'da_huy':
      return {
        label: 'Đã hủy',
        color: 'bg-gray-100 text-gray-800',
      };

    default:
      return {
        label: 'Không xác định',
        color: 'bg-gray-100 text-gray-800',
      };
  }
};

export const trangThaiTienCoc = (status: string) => {
  switch (status) {
    case 'dang_giu':
      return {
        label: 'Đang giữ',
        color: 'bg-yellow-100 text-yellow-800',
      };

    case 'da_hoan_tra':
      return {
        label: 'Đã hoàn trả',
        color: 'bg-green-100 text-green-800',
      };

    case 'da_khau_tru':
      return {
        label: 'Đã khấu trừ',
        color: 'bg-red-100 text-red-800',
      };

    default:
      return {
        label: 'Không xác định',
        color: 'bg-gray-100 text-gray-800',
      };
  }
};

export const trangThaiHoaDon = (status: string) => {
  switch (status) {
    case 'chua_thanhtoan':
      return {
        label: 'Chưa thanh toán',
        color: 'bg-red-100 text-red-800',
      };

    case 'thanhtoan_motphan':
      return {
        label: 'Thanh toán một phần',
        color: 'bg-yellow-100 text-yellow-800',
      };

    case 'da_thanhtoan':
      return {
        label: 'Đã thanh toán',
        color: 'bg-green-100 text-green-800',
      };

    case 'qua_han':
      return {
        label: 'Quá hạn',
        color: 'bg-purple-100 text-purple-800',
      };

    default:
      return {
        label: 'Không xác định',
        color: 'bg-gray-100 text-gray-800',
      };
  }
};

export const trangThaiSuCo = (status: string) => {
  switch (status) {
    case 'cho_xuly':
      return {
        label: 'Chờ xử lý',
        color: 'bg-red-100 text-red-800',
      };

    case 'dang_xuly':
      return {
        label: 'Đang xử lý',
        color: 'bg-yellow-100 text-yellow-800',
      };

    case 'da_xuly':
      return {
        label: 'Đã xử lý',
        color: 'bg-green-100 text-green-800',
      };

    case 'tu_choy':
      return {
        label: 'Từ chối',
        color: 'bg-gray-100 text-gray-800',
      };

    default:
      return {
        label: 'Không xác định',
        color: 'bg-gray-100 text-gray-800',
      };
  }
};

export const mucDoUuTien = (level: string) => {
  switch (level) {
    case 'thap':
      return {
        label: 'Thấp',
        color: 'bg-blue-100 text-blue-800',
      };

    case 'trung_binh':
      return {
        label: 'Trung bình',
        color: 'bg-yellow-100 text-yellow-800',
      };

    case 'cao':
      return {
        label: 'Cao',
        color: 'bg-orange-100 text-orange-800',
      };

    case 'khan_cap':
      return {
        label: 'Khẩn cấp',
        color: 'bg-red-100 text-red-800',
      };

    default:
      return {
        label: 'Không xác định',
        color: 'bg-gray-100 text-gray-800',
      };
  }
};

export const phuongThucThanhToan = (method: string) => {
  switch (method) {
    case 'tien_mat':
      return 'Tiền mặt';

    case 'chuyen_khoan':
      return 'Chuyển khoản';

    case 'momo':
      return 'Ví MoMo';

    case 'vnpay':
      return 'VNPay';

    default:
      return method;
  }
};

export const gioiTinh = (gender: string) => {
  switch (gender) {
    case 'nam':
      return 'Nam';

    case 'nu':
      return 'Nữ';

    case 'khac':
      return 'Khác';

    default:
      return gender || '';
  }
};

export const trangThaiNguoiThue = (status: string) => {
  switch (status) {
    case 'dang_thue':
      return {
        label: 'Đang thuê',
        color: 'bg-green-100 text-green-800',
      };

    case 'da_chuyen_di':
      return {
        label: 'Đã chuyển đi',
        color: 'bg-gray-100 text-gray-800',
      };

    default:
      return {
        label: 'Không xác định',
        color: 'bg-gray-100 text-gray-800',
      };
  }
};

export const formatThangNam = (tn: string | undefined | null, short = false): string => {
  if (!tn) return '';
  const [y, m] = tn.split('-');
  return short ? `${m}/${y}` : `Tháng ${m}/${y}`;
};

export const vaiTro = (role: string) => {
  switch (role) {
    case 'chu_nha':
      return { label: 'Chủ nhà', color: 'bg-purple-100 text-purple-800' };
    case 'nhan_vien':
      return { label: 'Nhân viên', color: 'bg-blue-100 text-blue-800' };
    case 'nguoi_thue':
      return { label: 'Người thuê', color: 'bg-emerald-100 text-emerald-800' };
    default:
      return { label: role, color: 'bg-gray-100 text-gray-800' };
  }
};

export const PHUONG_THUC_OPTIONS = [
  { value: 'tien_mat', label: 'Tiền mặt' },
  { value: 'chuyen_khoan', label: 'Chuyển khoản' },
  { value: 'momo', label: 'Ví MoMo' },
  { value: 'vnpay', label: 'VNPay' }
];

export const MUC_DO_OPTIONS = [
  { value: 'thap', label: 'Thấp' },
  { value: 'trung_binh', label: 'Trung bình' },
  { value: 'cao', label: 'Cao' },
  { value: 'khan_cap', label: 'Khẩn cấp' }
];

export const TRANG_THAI_SU_CO_OPTIONS = [
  { value: 'cho_xuly', label: 'Chờ xử lý' },
  { value: 'dang_xuly', label: 'Đang xử lý' },
  { value: 'da_xuly', label: 'Đã xử lý' },
  { value: 'tu_choy', label: 'Từ chối' }
];

export const TRANG_THAI_HOA_DON_OPTIONS = [
  { value: 'chua_thanhtoan', label: 'Chưa thanh toán' },
  { value: 'thanhtoan_motphan', label: 'Thanh toán một phần' },
  { value: 'da_thanhtoan', label: 'Đã thanh toán' },
  { value: 'qua_han', label: 'Quá hạn' }
];
