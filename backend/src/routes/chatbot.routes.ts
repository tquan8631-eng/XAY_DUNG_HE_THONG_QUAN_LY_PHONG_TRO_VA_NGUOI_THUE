import { Router } from 'express';
import { ChatbotController as C } from '../controllers/chatbot.controller';
import { authenticateToken, optionalAuth, quanLyOnly } from '../middleware/auth';
import { gioiHanTanSuat } from '../middleware/rateLimit';

const router = Router();

router.post('/hoi', gioiHanTanSuat(30, 60_000, 'Bạn gửi quá nhanh, vui lòng chờ một chút'), optionalAuth, C.hoi);
router.get('/goi-y', optionalAuth, C.goiY);

router.use(authenticateToken, quanLyOnly);
router.get('/thong-ke', C.thongKe);
router.get('/lich-su', C.lichSu);
router.post('/lich-su/:id/bo-qua', C.boQua);
router.get('/y-dinh', C.dsYDinh);
router.get('/mau-cau', C.dsMauCau);
router.post('/mau-cau', C.themMauCau);
router.delete('/mau-cau/:id', C.xoaMauCau);
export default router;
