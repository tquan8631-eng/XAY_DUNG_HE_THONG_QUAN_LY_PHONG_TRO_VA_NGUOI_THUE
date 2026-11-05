import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth.routes';
import phongTroRoutes from './routes/phongTro.routes';
import nguoiThueRoutes from './routes/nguoiThue.routes';
import thanhVienPhongRoutes from './routes/thanhVienPhong.routes';
import hopDongRoutes from './routes/hopDong.routes';
import chiSoDienNuocRoutes from './routes/chiSoDienNuoc.routes';
import dichVuRoutes from './routes/dichVu.routes';
import hoaDonRoutes from './routes/hoaDon.routes';
import thanhToanRoutes from './routes/thanhToan.routes';
import suCoRoutes from './routes/suCo.routes';
import taiKhoanRoutes from './routes/taiKhoan.routes';
import dashboardRoutes from './routes/dashboard.routes';
import portalRoutes from './routes/portal.routes';
import chatbotRoutes from './routes/chatbot.routes';
import { publicRoutes, quangCaoRoutes, yeuCauXemPhongRoutes } from './routes/quangCao.routes';
import { huanLuyenLai } from './chatbot/chatbot.service';

dotenv.config();

const app = express();

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.set('trust proxy', 'loopback');
app.use(express.json({ limit: '1mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/phong-tro', phongTroRoutes);
app.use('/api/nguoi-thue', nguoiThueRoutes);
app.use('/api/thanh-vien-phong', thanhVienPhongRoutes);
app.use('/api/hop-dong', hopDongRoutes);
app.use('/api/chi-so-dien-nuoc', chiSoDienNuocRoutes);
app.use('/api/dich-vu', dichVuRoutes);
app.use('/api/hoa-don', hoaDonRoutes);
app.use('/api/thanh-toan', thanhToanRoutes);
app.use('/api/su-co', suCoRoutes);
app.use('/api/tai-khoan', taiKhoanRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/portal', portalRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/uu-dai', quangCaoRoutes);
app.use('/api/yeu-cau-xem-phong', yeuCauXemPhongRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'Không tìm thấy API' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  huanLuyenLai()
    .then(() => console.log('Chatbot AI đã sẵn sàng (Naive Bayes, chạy cục bộ)'))
    .catch((e) => console.error('Không huấn luyện được chatbot:', e.message));
});
