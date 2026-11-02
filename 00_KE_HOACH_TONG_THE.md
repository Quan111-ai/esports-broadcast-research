# KẾ HOẠCH TỔNG THỂ: ỨNG DỤNG LIVESTREAM GIẢI ĐẤU CHUYÊN BIỆT CHO GAME MOBA & VALORANT (5v5)
*(Tập trung 100% vào các tựa game đối kháng 5v5: Liên Minh Huyền Thoại, Liên Quân Mobile, Liên Minh: Tốc Chiến và VALORANT - Điều khiển trên iPad - Tự động Real-time 100%)*

---

## 1. Tại sao việc chỉ tập trung vào Game MOBA (5v5) và VALORANT (5v5) là bước đi cực kỳ khôn ngoan?

Khi loại bỏ dòng game sinh tồn nhiều đội và chỉ tập trung vào **Game MOBA (Liên Minh Huyền Thoại, Liên Quân Mobile, Liên Minh: Tốc Chiến)** cùng **VALORANT**, toàn bộ ứng dụng của bạn trở nên **đồng nhất 100%**:
1. **Cùng cấu trúc 2 Đội đối đầu 5 đấu 5 (10 Tuyển thủ)**:
   - Mọi trận đấu đều là **Đội Xanh vs Đội Đỏ** (hoặc **Tấn Công vs Phòng Thủ**), mỗi bên đúng 5 người chơi.
   - Nhờ vậy, từ Sổ tay quản lý đội tuyển, Sơ đồ nhánh đấu (BO1, BO3, BO5), Màn hình Cấm/Chọn 10 người, cho đến Khung đồ họa trong trận đều dùng chung một bộ khung thiết kế cực kỳ gọn gàng!
2. **Đạt tốc độ Real-time 100% (Nhảy tức thời như giải đấu lớn)**:
   - Không còn phải xử lý bảng 48 người phức tạp; mọi thông số của 10 tuyển thủ (Tướng vừa chọn, Đổi tướng giây cuối, Mạng hạ gục, Tiền vàng, Rồng/Baron/Caesar, Đặt bom Spike) đều nhảy tức thời trong **0.05 – 0.1 giây** và khớp tuyệt đối với từng khung hình trận đấu.

---

## 2. Danh sách các Tựa Game Hỗ Trợ & Phương Thức Kết Nối Real-time Tốt Nhất

### Nhóm 1: Liên Minh Huyền Thoại (MOBA PC) - Real-time 0.05 giây
- **Cách vào phòng**: Tự tạo **Mã Phòng Giải Đấu** ngay trên iPad để gửi cho 10 tuyển thủ tự bay vào phòng, HOẶC tự bắt dính vào game đang mở trên máy Trọng tài.
- **Dữ liệu lấy tự động 100%**: Toàn bộ Cấm/Chọn tướng, Đổi tướng (Swap), Phép bổ trợ, Mạng hạ gục, Tiền vàng từng người, Trang bị vừa mua, Thời gian hồi sinh, Rồng nguyên tố, Sứ giả, Baron.

### Nhóm 2: VALORANT (5v5 PC) - Real-time 0.1 giây
- **Cách vào phòng**: Tự bắt trực tiếp vào phòng đấu tùy chọn trên máy Trọng tài hoặc Trọng tài Ảo tự vào ghế Quan sát bằng Mã Phòng Tổ Đội.
- **Dữ liệu lấy tự động 100%**: Chọn Đặc vụ (Agent Select) của 10 người, Bản đồ thi đấu, Tỉ số vòng đấu (Round), Tự động đảo bên sau vòng 12, Báo động đỏ tức thì khi Đặt bom Spike, Máu, Giáp, Súng đang cầm, Tiền mua súng và trạng thái Chiêu cuối của từng người.

### Nhóm 3: Liên Quân Mobile & Liên Minh: Tốc Chiến (MOBA Điện Thoại) - Real-time 0.1 giây (Đồng bộ từng khung hình)
- **Cách vào phòng**: Người cầm iPad chỉ cần gõ **Số Phòng (ID Phòng) + Mật khẩu**, tài khoản **Trọng tài Ảo** tự động nhảy vào ngồi ghế Khán giả của phòng đấu đó.
- **Dữ liệu lấy tự động 100% (Khớp tuyệt đối 0.00 giây lệch giữa hình và số)**:
  - Lúc Cấm/Chọn: Tự nhận diện mặt tướng đang nhấp nháy chọn, tướng đã khóa, tướng bị cấm của cả 2 đội và **tự động đổi chỗ ngay khi 2 tuyển thủ bấm đổi tướng (Swap) trong game**.
  - Lúc Trong trận: Tự động đọc tỉ số mạng hạ gục, tổng lượng vàng hai đội, thời gian trận đấu, số trụ, Rồng/Tà Thần Caesar/Baron và chỉ số KDA của 10 tuyển thủ.

---

## 3. Cấu trúc "Chia để trị" 5 Mảnh Ghép (Đồng nhất cho chuẩn 5v5)

1. **Mảnh ghép 1 (`skill_01`)**: Bộ bắt dữ liệu tức thời cho Game 5v5 trên PC (Liên Minh Huyền Thoại, VALORANT).
2. **Mảnh ghép 2 (`skill_02`)**: Trọng tài Ảo tự vào phòng & Bộ đọc 60 khung hình/giây cho Game MOBA Điện Thoại (Liên Quân Mobile, Liên Minh: Tốc Chiến).
3. **Mảnh ghép 3 (`skill_03`)**: Cổng kết nối 1 Chạm trên iPad (Chọn Game -> Nhập Số Phòng -> Lên Sóng) và đồng bộ 10 tuyển thủ 5v5.
4. **Mảnh ghép 4 (`skill_04`)**: Sổ tay Quản lý Giải đấu 5v5 (Hồ sơ Đội 5 người, Sơ đồ nhánh đấu Loại trực tiếp / Nhánh thắng-thua / Vòng tròn, Tự nhảy tỉ số BO1/BO3/BO5 & Chấm MVP).
5. **Mảnh ghép 5 (`skill_05`)**: Phòng Đồ họa 6 Cảnh 5v5 & Phát sóng trực tiếp đồng thời Màn Ngang (YouTube/Facebook) + Màn Dọc (TikTok) không cần OBS/vMix.


---

## 4. Bộ 3 Công Nghệ AI Siêu Nhẹ Chính Thức Trong Kế Hoạch (Nhẹ - Nhanh - Hiệu Quả)

Chúng ta chốt đưa đúng **3 tính năng AI siêu nhẹ và khả thi nhất** vào lõi phần mềm:

1. **AI 1 - "Mắt Thần Siêu Nhẹ" nhận diện Tướng (Kể cả khi mặc Trang phục / Skin lạ) trong 0,005 giây**:
   - Thay vì quét toàn bộ màn hình gây nặng máy, phần mềm chỉ cắt đúng 10 ô nhỏ ở vị trí 10 tuyển thủ đưa vào mô hình AI siêu nhẹ (dưới 5MB).
   - Nhận diện chính xác 99,9% tên tướng Liên Quân và Tốc Chiến kể cả khi mặc Skin hiếm hoặc có hiệu ứng chớp sáng lúc khóa tướng, chỉ tốn dưới 2% CPU.
2. **AI 2 - "Tự Động Lia Khung Hình Dọc TikTok Theo Pha Giao Tranh" (AI Smart Auto-Crop 9:16)**:
   - Tự phát hiện vị trí các thanh máu và hiệu ứng tung chiêu trên màn hình ngang -> Tự động trượt khung hình dọc của TikTok bám sát theo đúng góc đang đánh nhau để người xem trên điện thoại không bao giờ bị khuất pha solo hay giao tranh tổng.
3. **AI 3 (Điểm số 4) - "Tự Bắt Khoảnh Khắc Highlight & Tự Chèn Chữ Phụ Đề TikTok"**:
   - Kết hợp 2 tín hiệu: (1) Sự kiện nhảy mạng lớn (Triple Kill, Quadra Kill, Penta Kill, Ace, Cướp Baron/Caesar) + (2) Độ hét hào hứng của Bình luận viên.
   - Tự động cắt lấy 15 giây trước và 10 giây sau pha đó theo khung dọc TikTok, đồng thời tự nhận diện lời nói của Bình luận viên để chèn dòng chữ phụ đề nảy lên giữa màn hình. Vừa hết trận là 10 tuyển thủ quét mã QR trên iPad tải về đăng TikTok được ngay!
