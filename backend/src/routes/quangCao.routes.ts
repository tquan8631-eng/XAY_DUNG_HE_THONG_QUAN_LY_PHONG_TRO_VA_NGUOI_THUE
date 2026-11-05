import { Router } from 'express';
import { QuangCaoController as Q, YeuCauXemPhongController as Y, PublicController as P } from '../controllers/quangCao.controller';
import { authenticateToken, authorize, quanLyOnly } from '../middleware/auth';
import { gioiHanTanSuat } from '../middleware/rateLimit';

export const publicRoutes = Router();
publicRoutes.get('/thong-tin', P.thongTin);
publicRoutes.get('/phong-trong', P.phongTrong);
publicRoutes.get('/uu-dai', P.quangCao);
publicRoutes.post('/uu-dai/:id/xem', gioiHanTanSuat(60, 60_000, 'Quá nhiều yêu cầu'), P.xemQuangCao);
publicRoutes.post('/dang-ky-xem-phong', gioiHanTanSuat(5, 10 * 60_000, 'Bạn đã gửi quá nhiều lần, vui lòng thử lại sau'), P.dangKy);

export const quangCaoRoutes = Router();
quangCaoRoutes.use(authenticateToken, quanLyOnly);
quangCaoRoutes.get('/', Q.getAll);
quangCaoRoutes.post('/', Q.create);
quangCaoRoutes.put('/:id', Q.update);
quangCaoRoutes.delete('/:id', authorize('chu_nha'), Q.delete);

export const yeuCauXemPhongRoutes = Router();
yeuCauXemPhongRoutes.use(authenticateToken, quanLyOnly);
yeuCauXemPhongRoutes.get('/', Y.getAll);
yeuCauXemPhongRoutes.put('/:id', Y.update);
yeuCauXemPhongRoutes.delete('/:id', authorize('chu_nha'), Y.delete);
