import { Router } from 'express';
import { HoaDonController } from '../controllers/hoaDon.controller';
import { authenticateToken, authorize, quanLyOnly } from '../middleware/auth';

const router = Router();
router.use(authenticateToken, quanLyOnly);
router.get('/', HoaDonController.getAll);
router.post('/tao-tu-dong', HoaDonController.createTuDong);
router.post('/tao-hang-loat', HoaDonController.createHangLoat);
router.get('/:id', HoaDonController.getById);
router.put('/:id', HoaDonController.update);
router.delete('/:id', authorize('chu_nha'), HoaDonController.delete);
export default router;
