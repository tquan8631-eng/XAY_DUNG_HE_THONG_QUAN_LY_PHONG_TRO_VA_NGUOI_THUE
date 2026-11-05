const fs = require('fs');
const path = require('path');

const baseDir = 'c:\\phantichthietkehethong\\backend\\src';

const controllers = {
  'controllers/auth.controller.ts': `import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { ten_dang_nhap, mat_khau } = req.body;
      const data = await AuthService.login(ten_dang_nhap, mat_khau);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { mat_khau_cu, mat_khau_moi } = req.body;
      await AuthService.changePassword(req.user!.id, mat_khau_cu, mat_khau_moi);
      res.json({ success: true, message: 'Đổi mật khẩu thành công' });
    } catch (error) { next(error); }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try { res.json({ success: true, data: req.user }); } catch (error) { next(error); }
  }
}`,
  'controllers/phongTro.controller.ts': `import { Request, Response, NextFunction } from 'express';
import { PhongTroService } from '../services/phongTro.service';

export class PhongTroController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = (req.query.search as string) || '';
      const offset = (page - 1) * limit;
      const result = await PhongTroService.getAll(search, limit, offset);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await PhongTroService.getById(parseInt(req.params.id));
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const id = await PhongTroService.create(req.body);
      res.json({ success: true, data: { id } });
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      await PhongTroService.update(parseInt(req.params.id), req.body);
      res.json({ success: true, message: 'Cập nhật thành công' });
    } catch (error) { next(error); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await PhongTroService.delete(parseInt(req.params.id));
      res.json({ success: true, message: 'Xóa thành công' });
    } catch (error) { next(error); }
  }
}`,
  'controllers/nguoiThue.controller.ts': `import { Request, Response, NextFunction } from 'express';
import { NguoiThueService } from '../services/nguoiThue.service';

export class NguoiThueController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = (req.query.search as string) || '';
      const phong_id = (req.query.phong_id as string) || '';
      const result = await NguoiThueService.getAll(search, phong_id, limit, (page - 1) * limit);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await NguoiThueService.getById(parseInt(req.params.id));
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const id = await NguoiThueService.create(req.body);
      res.json({ success: true, data: { id } });
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      await NguoiThueService.update(parseInt(req.params.id), req.body);
      res.json({ success: true, message: 'Cập nhật thành công' });
    } catch (error) { next(error); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await NguoiThueService.delete(parseInt(req.params.id));
      res.json({ success: true, message: 'Xóa thành công' });
    } catch (error) { next(error); }
  }
}`,
  'controllers/thanhVienPhong.controller.ts': `import { Request, Response, NextFunction } from 'express';
import { ThanhVienPhongService } from '../services/thanhVienPhong.service';

export class ThanhVienPhongController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const hd_id = req.query.hop_dong_id;
      const data = hd_id ? await ThanhVienPhongService.getByHopDong(parseInt(hd_id as string)) : await ThanhVienPhongService.getAll();
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const id = await ThanhVienPhongService.create(req.body);
      res.json({ success: true, data: { id } });
    } catch (error) { next(error); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await ThanhVienPhongService.delete(parseInt(req.params.id));
      res.json({ success: true, message: 'Xóa thành công' });
    } catch (error) { next(error); }
  }
}`,
  'controllers/hopDong.controller.ts': `import { Request, Response, NextFunction } from 'express';
import { HopDongService } from '../services/hopDong.service';

export class HopDongController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const trang_thai = (req.query.trang_thai as string) || '';
      const sap_het_han = (req.query.sap_het_han as string) || 'false';
      const result = await HopDongService.getAll(trang_thai, sap_het_han, limit, (page - 1) * limit);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await HopDongService.getById(parseInt(req.params.id));
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const id = await HopDongService.create(req.body);
      res.json({ success: true, data: { id } });
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      await HopDongService.update(parseInt(req.params.id), req.body);
      res.json({ success: true, message: 'Cập nhật thành công' });
    } catch (error) { next(error); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await HopDongService.delete(parseInt(req.params.id));
      res.json({ success: true, message: 'Xóa thành công' });
    } catch (error) { next(error); }
  }
}`,
  'controllers/chiSoDienNuoc.controller.ts': `import { Request, Response, NextFunction } from 'express';
import { ChiSoDienNuocService } from '../services/chiSoDienNuoc.service';

export class ChiSoDienNuocController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const phong_id = (req.query.phong_id as string) || '';
      const thang_nam = (req.query.thang_nam as string) || '';
      const result = await ChiSoDienNuocService.getAll(phong_id, thang_nam, limit, (page - 1) * limit);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const id = await ChiSoDienNuocService.create(req.body);
      res.json({ success: true, data: { id } });
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      await ChiSoDienNuocService.update(parseInt(req.params.id), req.body);
      res.json({ success: true, message: 'Cập nhật thành công' });
    } catch (error) { next(error); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await ChiSoDienNuocService.delete(parseInt(req.params.id));
      res.json({ success: true, message: 'Xóa thành công' });
    } catch (error) { next(error); }
  }
}`,
  'controllers/dichVu.controller.ts': `import { Request, Response, NextFunction } from 'express';
import { DichVuService } from '../services/dichVu.service';

export class DichVuController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DichVuService.getAll();
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const id = await DichVuService.create(req.body);
      res.json({ success: true, data: { id } });
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      await DichVuService.update(parseInt(req.params.id), req.body);
      res.json({ success: true, message: 'Cập nhật thành công' });
    } catch (error) { next(error); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await DichVuService.delete(parseInt(req.params.id));
      res.json({ success: true, message: 'Xóa thành công' });
    } catch (error) { next(error); }
  }

  static async getDichVuPhong(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DichVuService.getDichVuPhong(parseInt(req.params.phongId));
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async addDichVuPhong(req: Request, res: Response, next: NextFunction) {
    try {
      await DichVuService.addDichVuPhong(req.body.phong_id, req.body.dich_vu_id);
      res.json({ success: true, message: 'Thêm dịch vụ phòng thành công' });
    } catch (error) { next(error); }
  }

  static async removeDichVuPhong(req: Request, res: Response, next: NextFunction) {
    try {
      await DichVuService.removeDichVuPhong(parseInt(req.params.phongId), parseInt(req.params.dichVuId));
      res.json({ success: true, message: 'Xóa dịch vụ phòng thành công' });
    } catch (error) { next(error); }
  }
}`,
  'controllers/hoaDon.controller.ts': `import { Request, Response, NextFunction } from 'express';
import { HoaDonService } from '../services/hoaDon.service';

export class HoaDonController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const thang_nam = (req.query.thang_nam as string) || '';
      const phong_id = (req.query.phong_id as string) || '';
      const trang_thai = (req.query.trang_thai as string) || '';
      const result = await HoaDonService.getAll(thang_nam, phong_id, trang_thai, limit, (page - 1) * limit);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await HoaDonService.getById(parseInt(req.params.id));
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async createTuDong(req: Request, res: Response, next: NextFunction) {
    try {
      const { hop_dong_id, thang_nam, han_thanhtoan } = req.body;
      const id = await HoaDonService.createTuDong(hop_dong_id, thang_nam, han_thanhtoan);
      res.json({ success: true, data: { id } });
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      await HoaDonService.update(parseInt(req.params.id), req.body);
      res.json({ success: true, message: 'Cập nhật thành công' });
    } catch (error) { next(error); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await HoaDonService.delete(parseInt(req.params.id));
      res.json({ success: true, message: 'Xóa thành công' });
    } catch (error) { next(error); }
  }
}`,
  'controllers/thanhToan.controller.ts': `import { Request, Response, NextFunction } from 'express';
import { ThanhToanService } from '../services/thanhToan.service';

export class ThanhToanController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const hoa_don_id = (req.query.hoa_don_id as string) || '';
      const result = await ThanhToanService.getAll(hoa_don_id, limit, (page - 1) * limit);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const id = await ThanhToanService.create(req.body);
      res.json({ success: true, data: { id } });
    } catch (error) { next(error); }
  }
}`,
  'controllers/suCo.controller.ts': `import { Request, Response, NextFunction } from 'express';
import { SuCoService } from '../services/suCo.service';

export class SuCoController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const trang_thai = (req.query.trang_thai as string) || '';
      const phong_id = (req.query.phong_id as string) || '';
      const muc_do_uu_tien = (req.query.muc_do_uu_tien as string) || '';
      const result = await SuCoService.getAll(trang_thai, phong_id, muc_do_uu_tien, limit, (page - 1) * limit);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await SuCoService.getById(parseInt(req.params.id));
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const id = await SuCoService.create(req.body);
      res.json({ success: true, data: { id } });
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      await SuCoService.update(parseInt(req.params.id), req.body);
      res.json({ success: true, message: 'Cập nhật thành công' });
    } catch (error) { next(error); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await SuCoService.delete(parseInt(req.params.id));
      res.json({ success: true, message: 'Xóa thành công' });
    } catch (error) { next(error); }
  }
}`,
  'controllers/taiKhoan.controller.ts': `import { Request, Response, NextFunction } from 'express';
import { TaiKhoanService } from '../services/taiKhoan.service';

export class TaiKhoanController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await TaiKhoanService.getAll();
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const id = await TaiKhoanService.create(req.body);
      res.json({ success: true, data: { id } });
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      await TaiKhoanService.update(parseInt(req.params.id), req.body);
      res.json({ success: true, message: 'Cập nhật thành công' });
    } catch (error) { next(error); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await TaiKhoanService.delete(parseInt(req.params.id));
      res.json({ success: true, message: 'Xóa thành công' });
    } catch (error) { next(error); }
  }
}`,
  'controllers/dashboard.controller.ts': `import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';

export class DashboardController {
  static async getThongKe(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getThongKe();
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async getDoanhThu(req: Request, res: Response, next: NextFunction) {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const data = await DashboardService.getDoanhThu(year);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async getHoaDonChuaTT(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getHoaDonChuaTT();
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async getHopDongSapHet(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getHopDongSapHet();
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async getSuCoMoi(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getSuCoMoi();
      res.json({ success: true, data });
    } catch (error) { next(error); }
  }
}`
};

Object.entries(controllers).forEach(([file, content]) => {
  fs.writeFileSync(path.join(baseDir, file), content);
});
console.log("Controllers created.");
