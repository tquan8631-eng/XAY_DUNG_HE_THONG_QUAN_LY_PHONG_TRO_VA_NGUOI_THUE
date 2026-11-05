export class AppError {
  statusCode: number;
  message: string;
  constructor(statusCode: number, message: string) {
    this.statusCode = statusCode;
    this.message = message;
  }
}

export const buildUpdate = (data: any, allowed: string[]) => {
  const fields: string[] = [];
  const values: any[] = [];
  for (const key of allowed) {
    if (data[key] === undefined) continue;
    let value = data[key];
    if (value === '') value = null;
    fields.push(`${key} = ?`);
    values.push(value);
  }
  return { fields, values };
};

export const toLower = (v: any, fallback: string) =>
  typeof v === 'string' && v.trim() ? v.trim().toLowerCase() : fallback;

export const isThangNam = (v: any) =>
  typeof v === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(v);

export const pageParams = (query: any, defaultLimit = 20) => {
  const page = Math.max(parseInt(query.page as string) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit as string) || defaultLimit, 1), 1000);
  return { page, limit, offset: (page - 1) * limit };
};
