# Hệ thống Quản lý Nhà trọ tích hợp Chatbox hỗ trợ 24/7 – Hướng dẫn chạy

## 1. Cài đặt & chạy

### Cơ sở dữ liệu (XAMPP / phpMyAdmin)
1. Bật Apache + MySQL trong XAMPP. Nếu chưa có database: tạo DB `quan_ly_nha_tro` (utf8mb4_unicode_ci) rồi Import `database/quan_ly_nha_tro.sql` (16 bảng).
2. Import tiếp `database/du_lieu_do_an.sql` (dữ liệu mẫu ~160 dòng).
   - File này **tự tạo 4 bảng mới** (quang_cao, yeu_cau_xem_phong, chatbot_mau_cau, chatbot_lich_su) nếu DB cũ của bạn chưa có, nên **chỉ cần import lại file này** là đủ.
   - Mỗi lần import, dữ liệu cũ bị xóa và nạp lại từ đầu (chạy lại nhiều lần không lỗi).

| Tài khoản | Mật khẩu | Vai trò |
|---|---|---|
| admin | 123456 | Chủ nhà |
| nhanvien | 123456 | Nhân viên |
| 0901234567 | 123456 | Người thuê (Nguyễn Văn An – phòng P101) |
| 0912345678 | 123456 | Người thuê ở ghép (Trần Thị Bình – phòng P101) |

### Backend
```
cd backend
npm install
npm run dev                 # http://localhost:5000 – thấy "Chatbot AI đã sẵn sàng" là OK
npm run danh-gia-chatbot    # (tùy chọn) in độ chính xác của mô hình chatbot
```

### Frontend
```
cd frontend
npm install
npm run dev        # http://localhost:5173
```
- Chưa đăng nhập: mở http://localhost:5173 sẽ thấy **trang giới thiệu nhà trọ** (`/gioi-thieu`) + nút **Hỗ trợ 24/7**.
- Bấm **Đăng nhập** để vào hệ thống.

> Thông tin nhà trọ (tên, địa chỉ, SĐT, **số tài khoản ngân hàng**, nội quy, tiện ích…) giờ sửa ở **`backend/src/config/nhaTro.ts`** – trang giới thiệu, hóa đơn (mã VietQR) và chatbot đều lấy từ đây.
> Điền `so_tai_khoan` + `ma_ngan_hang` thì hóa đơn của người thuê tự hiện mã QR VietQR.

---

## 2. Chatbox AI hỗ trợ 24/7 (mới)

- **Không dùng API bên ngoài**: mô hình **Naive Bayes** tự viết bằng TypeScript (`backend/src/chatbot/`), chạy ngay trên server.
- Hiểu tiếng Việt **không dấu, viết tắt** (ko, dc, bn, hdon…). 24 ý định, 280 câu mẫu.
- Trả lời **theo vai trò** bằng dữ liệu thật:
  - **Khách**: phòng trống (lọc giá, số người), giá, dịch vụ, khuyến mãi, thủ tục, nội quy, liên hệ, **đặt lịch xem phòng** (chatbot hỏi tên + SĐT rồi tự lưu).
  - **Người thuê**: hóa đơn cần trả, điện nước so với tháng trước, **dự báo tiền tháng sau**, hợp đồng, cách chuyển khoản, **báo sự cố** (AI tự đánh giá mức độ, sự cố nguy hiểm → Khẩn cấp).
  - **Chủ nhà / nhân viên**: tình hình nhà trọ, ai còn nợ, sự cố chưa xử lý, phòng chưa ghi điện nước, hợp đồng sắp hết hạn, khách mới đăng ký.
- Menu **Chatbot AI 24/7** (quản lý): thống kê, các câu chatbot **chưa hiểu** → bấm **Dạy** chọn ý định đúng → mô hình học lại ngay.
- Độ chính xác: **78%** trên bộ câu kiểm thử độc lập (98,5% trên bộ dùng khi xây dựng); mức độ sự cố 57,9%. Thời gian trả lời ~3 ms.
- Chống spam: tối đa 30 câu/phút/IP.

Thử nhanh: đăng nhập `0901234567` → bấm "Hỗ trợ 24/7" → hỏi "tháng này tôi phải đóng bao nhiêu", "dự báo tiền tháng sau", "muốn báo sự cố" → "vòi nước bị rỉ".

## 3. Quảng cáo & khách xem phòng (mới)

| Chức năng | Ở đâu |
|---|---|
| Trang giới thiệu: phòng trống, ưu đãi, bảng giá, tính năng hệ thống, tiện ích, quy trình thuê, form đăng ký xem phòng | `/gioi-thieu` (công khai) |
| Quản lý banner khuyến mãi / thông báo (đối tượng, thời gian, mã ưu đãi, màu, lượt xem) | Menu **Quảng cáo & ưu đãi** |
| Banner ưu đãi cho người thuê | Trang Tổng quan của người thuê |
| Danh sách khách đăng ký (từ website + chatbot), đổi trạng thái, ghi chú, **tạo nhanh người thuê** | Menu **Khách xem phòng** |
| Thông báo số khách mới | Trang Tổng quan của chủ nhà |

API mới: `/api/chatbot/*`, `/api/public/*` (ưu đãi: `/api/public/uu-dai`), `/api/uu-dai`, `/api/yeu-cau-xem-phong`, `/api/portal/uu-dai`.

---

## 4. Tài khoản người thuê – cách hoạt động

- Chủ nhà vào **Người thuê → Thêm người thuê**, tick “Tạo tài khoản đăng nhập” (mặc định bật).
  - Tên đăng nhập mặc định = **số điện thoại**, mật khẩu mặc định = **6 số cuối CCCD** (có thể tự nhập).
  - Sau khi lưu, hệ thống hiện hộp thông tin đăng nhập để sao chép gửi cho người thuê.
- Người thuê cũ chưa có tài khoản: bấm biểu tượng 🔑 hoặc “+ Cấp tài khoản” ở danh sách, hoặc vào trang chi tiết.
- Đặt lại mật khẩu, khóa/mở khóa, xóa tài khoản: ở trang chi tiết người thuê hoặc mục **Tài khoản**.
- Khi đăng nhập, hệ thống tự điều hướng theo vai trò:
  - Chủ nhà / nhân viên → `/` (giao diện quản lý, màu tím)
  - Người thuê → `/cua-toi` (cổng người thuê, màu xanh ngọc)

## 5. Giao diện người thuê

| Trang | Chức năng |
|---|---|
| Tổng quan | Phòng đang thuê, số tiền cần trả, số ngày hợp đồng còn lại, hóa đơn gần nhất, biểu đồ điện nước |
| Phòng của tôi | Thông tin phòng, dịch vụ + đơn giá, danh sách người ở cùng, liên hệ chủ nhà |
| Hợp đồng | Các hợp đồng đã/đang tham gia, tiền cọc, thanh tiến độ thời hạn |
| Hóa đơn | Lọc chưa thanh toán / đã thanh toán / quá hạn; chi tiết từng khoản, chỉ số điện nước, hướng dẫn chuyển khoản + QR, in/lưu PDF |
| Lịch sử thanh toán | Các lần đã đóng tiền |
| Điện nước | Lịch sử chỉ số + biểu đồ tiêu thụ |
| Báo sự cố | Gửi báo hỏng hóc (có gợi ý nhanh), theo dõi trạng thái, hủy khi chủ nhà chưa xử lý |
| Thông tin cá nhân | Sửa SĐT, email, ngày sinh, quê quán; đổi mật khẩu |

**Bảo mật:** người thuê chỉ gọi được API `/api/portal/*`, mọi truy vấn đều lọc theo chính người đó
(không xem được hóa đơn/phòng của người khác – đã test). Các API quản lý trả 403 nếu người thuê gọi.

## 6. Các lỗi đã sửa ở phần chủ nhà

**Backend**
- `hop_dong.service`: dùng cột không tồn tại `nt.cccd` → toàn bộ trang Hợp đồng lỗi 500. Đã sửa.
- Các hàm `update` ghép thẳng mọi field từ request vào SQL (lỗi khi frontend gửi thừa field, và có thể sửa cột không được phép) → chuyển sang whitelist.
- Dashboard không yêu cầu đăng nhập → đã thêm xác thực.
- Không phân quyền: người thuê có thể gọi mọi API quản lý → thêm `quanLyOnly` cho tất cả route quản lý.
- Hóa đơn: chặn tạo trùng (cùng hợp đồng + tháng), tự chuyển **quá hạn**, dịch vụ đơn vị “người” nhân số người ở, mã hóa đơn dạng `HD202609-0001`, thêm **tạo hàng loạt** cho tất cả phòng; không cho xóa hóa đơn đã có thanh toán.
- Thanh toán: kiểm tra số tiền > 0 và không vượt số còn nợ; lọc theo phương thức/ngày.
- Hợp đồng: không cho lập 2 hợp đồng còn hạn cho 1 phòng, kiểm tra ngày; kết thúc/hủy HĐ tự trả phòng về “Trống” và người thuê sang “Đã chuyển đi”.
- Thành viên phòng: kiểm tra số người tối đa, không cho 1 người ở 2 HĐ còn hạn.
- Chỉ số điện nước: API lấy **chỉ số cũ tự động** từ kỳ trước; chặn ghi trùng kỳ.
- Sự cố: chủ nhà tạo hộ thì tự lấy người đứng tên HĐ làm người báo (trước đây lỗi vì thiếu `nguoi_bao_id`).
- Cột DATE trả về dạng `YYYY-MM-DD` (trước bị lệch 1 ngày do múi giờ khi sửa form).

**Frontend** (trước đó 53 lỗi TypeScript, `npm run build` không chạy được → nay 0 lỗi, build OK)
- `api.ts` trả dữ liệu không thống nhất nên nhiều trang luôn trống (Hợp đồng, Hóa đơn, Dịch vụ, Điện nước, Sự cố, Thanh toán, Tài khoản). Đã chuẩn hóa.
- Nhiều trang dùng giá trị kiểu cũ `CHO_XU_LY`, `TIEN_MAT`, `CHU_NHA`, `BAT_BUOC`… không khớp database → đã đổi đúng giá trị (`cho_xuly`, `tien_mat`, `chu_nha`, `co_dinh`…). Trang Tài khoản trước đây luôn báo “không có quyền”.
- Sai đường dẫn API: đổi mật khẩu (POST→PUT), dịch vụ phòng (`/dich-vu-phong` → `/dich-vu/phong`).
- `ConfirmDialog` nhận `onCancel` nhưng component chỉ có `onClose` → nút Hủy không hoạt động. Đã sửa.
- Lọc người thuê gửi sai tham số `trangThai` → `trang_thai`.
- Hoàn thiện các trang còn để “đang cập nhật”: Chi tiết phòng (thành viên, thêm/bỏ dịch vụ, hợp đồng, điện nước, hóa đơn, sự cố), Chi tiết người thuê, Chi tiết hợp đồng (thêm/xóa người ở ghép, tạo hóa đơn, kết thúc HĐ).
- Thêm trang Đổi mật khẩu cho chủ nhà/nhân viên; menu Tài khoản chỉ hiện với chủ nhà.

## 7. API cổng người thuê (tham khảo)
```
GET    /api/portal/tong-quan
GET    /api/portal/thong-tin          PUT /api/portal/thong-tin
GET    /api/portal/phong
GET    /api/portal/hop-dong
GET    /api/portal/hoa-don?trang_thai=   GET /api/portal/hoa-don/:id
GET    /api/portal/thanh-toan
GET    /api/portal/chi-so-dien-nuoc
GET    /api/portal/su-co              POST /api/portal/su-co     DELETE /api/portal/su-co/:id
POST   /api/nguoi-thue/:id/tai-khoan   (chủ nhà cấp / đặt lại mật khẩu)
DELETE /api/nguoi-thue/:id/tai-khoan
POST   /api/hoa-don/tao-hang-loat
GET    /api/chi-so-dien-nuoc/chi-so-cu?phong_id=&thang_nam=
```

## 8. Lỗi thường gặp

**Trang web trắng tinh (nhất là trên Cốc Cốc / có cài chặn quảng cáo):** trình chặn quảng cáo chặn các file có tên như "quảng cáo", "banner". Bản này đã đổi hết tên file và đường dẫn (`/uu-dai` thay cho `/quang-cao`) nên không còn bị chặn. Nếu vẫn trắng: tắt chặn quảng cáo cho `localhost`, rồi bấm `Ctrl + F5`.

**`'ts-node' is not recognized` / `'vite' is not recognized`:** chưa cài thư viện → chạy `npm install` trong thư mục backend / frontend.
