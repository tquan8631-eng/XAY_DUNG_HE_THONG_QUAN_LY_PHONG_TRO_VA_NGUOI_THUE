import { Router } from 'express';
import { ThanhToanController } from '../controllers/thanhToan.controller';
import { authenticateToken, quanLyOnly } from '../middleware/auth';

const router = Router();
router.use(authenticateToken, quanLyOnly);
router.get('/', ThanhToanController.getAll);
router.post('/', ThanhToanController.create);
export default router;
