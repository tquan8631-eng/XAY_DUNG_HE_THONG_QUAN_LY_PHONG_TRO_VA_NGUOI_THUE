import { Router } from 'express';
import { TaiKhoanController } from '../controllers/taiKhoan.controller';
import { authenticateToken, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticateToken, authorize('chu_nha'));
router.get('/', TaiKhoanController.getAll);
router.post('/', TaiKhoanController.create);
router.put('/:id', TaiKhoanController.update);
router.delete('/:id', TaiKhoanController.delete);
export default router;
