import { Router } from 'express';
import { SuCoController } from '../controllers/suCo.controller';
import { authenticateToken, authorize, quanLyOnly } from '../middleware/auth';

const router = Router();
router.use(authenticateToken, quanLyOnly);
router.get('/', SuCoController.getAll);
router.get('/:id', SuCoController.getById);
router.post('/', SuCoController.create);
router.put('/:id', SuCoController.update);
router.delete('/:id', authorize('chu_nha'), SuCoController.delete);
export default router;
