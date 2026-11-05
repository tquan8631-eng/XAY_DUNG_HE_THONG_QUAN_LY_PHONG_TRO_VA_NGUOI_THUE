import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticateToken, quanLyOnly } from '../middleware/auth';

const router = Router();
router.use(authenticateToken, quanLyOnly);
router.get('/thong-ke', DashboardController.getThongKe);
router.get('/doanh-thu', DashboardController.getDoanhThu);
router.get('/hoa-don-chua-tt', DashboardController.getHoaDonChuaTT);
router.get('/hop-dong-sap-het', DashboardController.getHopDongSapHet);
router.get('/su-co-moi', DashboardController.getSuCoMoi);
export default router;
