import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();
router.post('/dang-nhap', AuthController.login);
router.post('/dang-xuat', authenticateToken, (req, res) => res.json({ success: true, message: 'Đăng xuất thành công' }));
router.put('/doi-mat-khau', authenticateToken, AuthController.changePassword);
router.get('/me', authenticateToken, AuthController.getMe);
export default router;
