import { Request, Response, NextFunction } from 'express';

export const gioiHanTanSuat = (soLanToiDa: number, khoangMs: number, thongBao: string) => {
  const dem = new Map<string, { so: number; batDau: number }>();
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const r = dem.get(ip);
    if (!r || now - r.batDau > khoangMs) {
      dem.set(ip, { so: 1, batDau: now });
      if (dem.size > 5000) for (const [k, v] of dem) if (now - v.batDau > khoangMs) dem.delete(k);
      return next();
    }
    if (++r.so > soLanToiDa) return res.status(429).json({ success: false, message: thongBao });
    next();
  };
};
