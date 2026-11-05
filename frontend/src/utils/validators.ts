export const validateRequired = (value: any, fieldName: string): string | null => {
  if (value === undefined || value === null || String(value).trim() === '') {
    return `${fieldName} không được để trống`;
  }
  return null;
};

export const validatePhone = (phone: string): string | null => {
  const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
  if (!phoneRegex.test(phone)) {
    return 'Số điện thoại không hợp lệ';
  }
  return null;
};

export const validateEmail = (email: string | null | undefined): string | null => {
  if (!email) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Email không hợp lệ';
  }
  return null;
};

export const validatePositiveNumber = (value: number | string, fieldName: string): string | null => {
  const num = Number(value);
  if (isNaN(num) || num <= 0) {
    return `${fieldName} phải là số lớn hơn 0`;
  }
  return null;
};

export const validateDateRange = (start: string | Date, end: string | Date): string | null => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (startDate > endDate) {
    return 'Ngày kết thúc phải sau ngày bắt đầu';
  }
  return null;
};
