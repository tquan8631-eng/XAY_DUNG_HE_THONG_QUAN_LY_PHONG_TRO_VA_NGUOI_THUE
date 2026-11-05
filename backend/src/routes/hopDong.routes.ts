import { Router } from 'express';
import { HopDongController } from '../controllers/hopDong.controller';
import { authenticateToken, authorize, quanLyOnly } from '../middleware/auth';

const router = Router();
router.use(authenticateToken, quanLyOnly);
router.get('/', HopDongController.getAll);
router.get('/:id', HopDongController.getById);
router.post('/', HopDongController.create);
router.put('/:id', HopDongController.update);
router.delete('/:id', authorize('chu_nha'), HopDongController.delete);
export default router;
