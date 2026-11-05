import { Request, Response, NextFunction } from 'express';
import { QuangCaoService, YeuCauXemPhongService, PublicService } from '../services/quangCao.service';

const wrap = (fn: (req: Request) => Promise<any> | any, message?: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await fn(req);
      res.json({ success: true, data, ...(message ? { message } : {}) });
    } catch (e) {
      next(e);
    }
  };
const list = (fn: (req: Request) => Promise<any[]>) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await fn(req);
    res.json({ success: true, data, total: data.length, totalPages: 1 });
  } catch (e) {
    next(e);
  }
};
const id = (req: Request) => parseInt(req.params.id);

export class QuangCaoController {
  static getAll = list((req) => QuangCaoService.getAll(req.query));
  static create = wrap(async (req) => ({ id: await QuangCaoService.create(req.body || {}) }), 'Đã tạo quảng cáo');
  static update = wrap((req) => QuangCaoService.update(id(req), req.body || {}), 'Đã cập nhật quảng cáo');
  static delete = wrap((req) => QuangCaoService.delete(id(req)), 'Đã xóa quảng cáo');
}

export class YeuCauXemPhongController {
  static getAll = list((req) => YeuCauXemPhongService.getAll(req.query) as Promise<any[]>);
  static update = wrap((req) => YeuCauXemPhongService.update(id(req), req.body || {}), 'Đã cập nhật yêu cầu');
  static delete = wrap((req) => YeuCauXemPhongService.delete(id(req)), 'Đã xóa yêu cầu');
}

export class PublicController {
  static thongTin = wrap(() => PublicService.thongTin());
  static phongTrong = wrap(() => PublicService.phongTrong());
  static quangCao = wrap(() => QuangCaoService.dangChay('khach'));
  static xemQuangCao = wrap((req) => QuangCaoService.tangLuotXem(id(req)));
  static dangKy = wrap(
    async (req) => ({ id: await YeuCauXemPhongService.create(req.body || {}, 'website') }),
    'Đăng ký thành công! Chủ nhà sẽ liên hệ với bạn sớm.'
  );
  static quangCaoNguoiThue = wrap(() => QuangCaoService.dangChay('nguoi_thue'));
}
