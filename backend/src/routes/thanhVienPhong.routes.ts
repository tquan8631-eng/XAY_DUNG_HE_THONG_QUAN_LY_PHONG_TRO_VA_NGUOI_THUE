import { Router } from 'express';
import { ThanhVienPhongController } from '../controllers/thanhVienPhong.controller';
import { authenticateToken, quanLyOnly } from '../middleware/auth';

const router = Router();
router.use(authenticateToken, quanLyOnly);
router.get('/', ThanhVienPhongController.getAll);
router.post('/', ThanhVienPhongController.create);
router.delete('/:id', ThanhVienPhongController.delete);
export default router;
