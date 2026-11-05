const fs = require('fs');
const path = require('path');

const baseDir = 'c:\\phantichthietkehethong\\backend\\src';

const routes = {
  'routes/auth.routes.ts': `import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();
router.post('/dang-nhap', AuthController.login);
router.post('/dang-xuat', authenticateToken, (req, res) => res.json({ success: true, message: 'Đăng xuất thành công' }));
router.put('/doi-mat-khau', authenticateToken, AuthController.changePassword);
router.get('/me', authenticateToken, AuthController.getMe);
export default router;`,

  'routes/phongTro.routes.ts': `import { Router } from 'express';
import { PhongTroController } from '../controllers/phongTro.controller';
import { authenticateToken, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);
router.get('/', PhongTroController.getAll);
router.get('/:id', PhongTroController.getById);
router.post('/', authorize('chu_nha', 'nhan_vien'), PhongTroController.create);
router.put('/:id', authorize('chu_nha', 'nhan_vien'), PhongTroController.update);
router.delete('/:id', authorize('chu_nha'), PhongTroController.delete);
export default router;`,

  'routes/nguoiThue.routes.ts': `import { Router } from 'express';
import { NguoiThueController } from '../controllers/nguoiThue.controller';
import { authenticateToken, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);
router.get('/', NguoiThueController.getAll);
router.get('/:id', NguoiThueController.getById);
router.post('/', authorize('chu_nha', 'nhan_vien'), NguoiThueController.create);
router.put('/:id', authorize('chu_nha', 'nhan_vien'), NguoiThueController.update);
router.delete('/:id', authorize('chu_nha'), NguoiThueController.delete);
export default router;`,

  'routes/thanhVienPhong.routes.ts': `import { Router } from 'express';
import { ThanhVienPhongController } from '../controllers/thanhVienPhong.controller';
import { authenticateToken, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);
router.get('/', ThanhVienPhongController.getAll);
router.post('/', authorize('chu_nha', 'nhan_vien'), ThanhVienPhongController.create);
router.delete('/:id', authorize('chu_nha', 'nhan_vien'), ThanhVienPhongController.delete);
export default router;`,

  'routes/hopDong.routes.ts': `import { Router } from 'express';
import { HopDongController } from '../controllers/hopDong.controller';
import { authenticateToken, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);
router.get('/', HopDongController.getAll);
router.get('/:id', HopDongController.getById);
router.post('/', authorize('chu_nha', 'nhan_vien'), HopDongController.create);
router.put('/:id', authorize('chu_nha', 'nhan_vien'), HopDongController.update);
router.delete('/:id', authorize('chu_nha'), HopDongController.delete);
export default router;`,

  'routes/chiSoDienNuoc.routes.ts': `import { Router } from 'express';
import { ChiSoDienNuocController } from '../controllers/chiSoDienNuoc.controller';
import { authenticateToken, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);
router.get('/', ChiSoDienNuocController.getAll);
router.post('/', authorize('chu_nha', 'nhan_vien'), ChiSoDienNuocController.create);
router.put('/:id', authorize('chu_nha', 'nhan_vien'), ChiSoDienNuocController.update);
router.delete('/:id', authorize('chu_nha'), ChiSoDienNuocController.delete);
export default router;`,

  'routes/dichVu.routes.ts': `import { Router } from 'express';
import { DichVuController } from '../controllers/dichVu.controller';
import { authenticateToken, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);
router.get('/', DichVuController.getAll);
router.post('/', authorize('chu_nha', 'nhan_vien'), DichVuController.create);
router.put('/:id', authorize('chu_nha', 'nhan_vien'), DichVuController.update);
router.delete('/:id', authorize('chu_nha'), DichVuController.delete);
router.get('/phong/:phongId', DichVuController.getDichVuPhong);
router.post('/phong', authorize('chu_nha', 'nhan_vien'), DichVuController.addDichVuPhong);
router.delete('/phong/:phongId/:dichVuId', authorize('chu_nha', 'nhan_vien'), DichVuController.removeDichVuPhong);
export default router;`,

  'routes/hoaDon.routes.ts': `import { Router } from 'express';
import { HoaDonController } from '../controllers/hoaDon.controller';
import { authenticateToken, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);
router.get('/', HoaDonController.getAll);
router.get('/:id', HoaDonController.getById);
router.post('/tao-tu-dong', authorize('chu_nha', 'nhan_vien'), HoaDonController.createTuDong);
router.put('/:id', authorize('chu_nha', 'nhan_vien'), HoaDonController.update);
router.delete('/:id', authorize('chu_nha'), HoaDonController.delete);
export default router;`,

  'routes/thanhToan.routes.ts': `import { Router } from 'express';
import { ThanhToanController } from '../controllers/thanhToan.controller';
import { authenticateToken, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);
router.get('/', ThanhToanController.getAll);
router.post('/', authorize('chu_nha', 'nhan_vien'), ThanhToanController.create);
export default router;`,

  'routes/suCo.routes.ts': `import { Router } from 'express';
import { SuCoController } from '../controllers/suCo.controller';
import { authenticateToken, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);
router.get('/', SuCoController.getAll);
router.get('/:id', SuCoController.getById);
router.post('/', SuCoController.create);
router.put('/:id', authorize('chu_nha', 'nhan_vien'), SuCoController.update);
router.delete('/:id', authorize('chu_nha'), SuCoController.delete);
export default router;`,

  'routes/taiKhoan.routes.ts': `import { Router } from 'express';
import { TaiKhoanController } from '../controllers/taiKhoan.controller';
import { authenticateToken, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticateToken, authorize('chu_nha'));
router.get('/', TaiKhoanController.getAll);
router.post('/', TaiKhoanController.create);
router.put('/:id', TaiKhoanController.update);
router.delete('/:id', TaiKhoanController.delete);
export default router;`,

  'routes/dashboard.routes.ts': `import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticateToken, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticateToken, authorize('chu_nha', 'nhan_vien'));
router.get('/thong-ke', DashboardController.getThongKe);
router.get('/doanh-thu', DashboardController.getDoanhThu);
router.get('/hoa-don-chua-tt', DashboardController.getHoaDonChuaTT);
router.get('/hop-dong-sap-het', DashboardController.getHopDongSapHet);
router.get('/su-co-moi', DashboardController.getSuCoMoi);
export default router;`,

  'app.ts': `import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth.routes';
import phongTroRoutes from './routes/phongTro.routes';
import nguoiThueRoutes from './routes/nguoiThue.routes';
import thanhVienPhongRoutes from './routes/thanhVienPhong.routes';
import hopDongRoutes from './routes/hopDong.routes';
import chiSoDienNuocRoutes from './routes/chiSoDienNuoc.routes';
import dichVuRoutes from './routes/dichVu.routes';
import hoaDonRoutes from './routes/hoaDon.routes';
import thanhToanRoutes from './routes/thanhToan.routes';
import suCoRoutes from './routes/suCo.routes';
import taiKhoanRoutes from './routes/taiKhoan.routes';
import dashboardRoutes from './routes/dashboard.routes';

dotenv.config();

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/phong-tro', phongTroRoutes);
app.use('/api/nguoi-thue', nguoiThueRoutes);
app.use('/api/thanh-vien-phong', thanhVienPhongRoutes);
app.use('/api/hop-dong', hopDongRoutes);
app.use('/api/chi-so-dien-nuoc', chiSoDienNuocRoutes);
app.use('/api/dich-vu', dichVuRoutes);
app.use('/api/hoa-don', hoaDonRoutes);
app.use('/api/thanh-toan', thanhToanRoutes);
app.use('/api/su-co', suCoRoutes);
app.use('/api/tai-khoan', taiKhoanRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(\`Server is running on port \${PORT}\`);
});
`
};

Object.entries(routes).forEach(([file, content]) => {
  fs.writeFileSync(path.join(baseDir, file), content);
});
console.log("Routes and App created.");
