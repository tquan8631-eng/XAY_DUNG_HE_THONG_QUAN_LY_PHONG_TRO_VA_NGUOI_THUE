import { Router } from 'express';
import { NguoiThueController } from '../controllers/nguoiThue.controller';
import { authenticateToken, authorize, quanLyOnly } from '../middleware/auth';

const router = Router();
router.use(authenticateToken, quanLyOnly);
router.get('/', NguoiThueController.getAll);
router.get('/:id', NguoiThueController.getById);
router.post('/', NguoiThueController.create);
router.put('/:id', NguoiThueController.update);
router.delete('/:id', authorize('chu_nha'), NguoiThueController.delete);

router.post('/:id/tai-khoan', NguoiThueController.taoTaiKhoan);
router.delete('/:id/tai-khoan', authorize('chu_nha'), NguoiThueController.xoaTaiKhoan);
export default router;
