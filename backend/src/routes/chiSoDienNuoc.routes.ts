import { Router } from 'express';
import { ChiSoDienNuocController } from '../controllers/chiSoDienNuoc.controller';
import { authenticateToken, authorize, quanLyOnly } from '../middleware/auth';

const router = Router();
router.use(authenticateToken, quanLyOnly);
router.get('/', ChiSoDienNuocController.getAll);
router.get('/chi-so-cu', ChiSoDienNuocController.getChiSoCu);
router.post('/', ChiSoDienNuocController.create);
router.put('/:id', ChiSoDienNuocController.update);
router.delete('/:id', authorize('chu_nha'), ChiSoDienNuocController.delete);
export default router;
