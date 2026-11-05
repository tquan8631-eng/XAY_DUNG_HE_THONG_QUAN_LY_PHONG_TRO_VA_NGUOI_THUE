import { Router } from 'express';
import { DichVuController } from '../controllers/dichVu.controller';
import { authenticateToken, authorize, quanLyOnly } from '../middleware/auth';

const router = Router();
router.use(authenticateToken, quanLyOnly);
router.get('/', DichVuController.getAll);
router.post('/', DichVuController.create);
router.get('/phong/:phongId', DichVuController.getDichVuPhong);
router.post('/phong', DichVuController.addDichVuPhong);
router.delete('/phong/:phongId/:dichVuId', DichVuController.removeDichVuPhong);
router.put('/:id', DichVuController.update);
router.delete('/:id', authorize('chu_nha'), DichVuController.delete);
export default router;
