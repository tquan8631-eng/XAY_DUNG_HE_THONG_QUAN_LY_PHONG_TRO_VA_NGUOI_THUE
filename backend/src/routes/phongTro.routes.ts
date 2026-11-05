import { Router } from 'express';
import { PhongTroController } from '../controllers/phongTro.controller';
import { authenticateToken, authorize, quanLyOnly } from '../middleware/auth';

const router = Router();
router.use(authenticateToken, quanLyOnly);
router.get('/', PhongTroController.getAll);
router.get('/:id', PhongTroController.getById);
router.post('/', PhongTroController.create);
router.put('/:id', PhongTroController.update);
router.delete('/:id', authorize('chu_nha'), PhongTroController.delete);
export default router;
