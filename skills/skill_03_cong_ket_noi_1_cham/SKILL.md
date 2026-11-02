---
name: skill-03-cong-ket-noi-1-cham
description: |
  Kỹ năng số 3 (Chia để trị): Cổng kết nối 1 chạm linh hoạt theo từng game (Tự vào phòng bằng Mã Phòng, Trọng tài Ảo hoặc Bắt trực tiếp từ máy Trọng tài với tốc độ tức thời nhất) kèm bàn điều khiển cứu nguy 1 giây.
---

# SKILL 03: CỔNG KẾT NỐI LINH HOẠT "CHỌN GAME - VÀO PHÒNG - LÊN SÓNG" (TỐC ĐỘ TỨC THỜI)

## 1. Mục đích của mảnh ghép này (Nói dễ hiểu)
Người dùng không cần biết kỹ thuật bên dưới. Khi họ chọn một tựa game bất kỳ, bộ phận số 3 này sẽ **tự động chọn phương thức kết nối nhanh nhất (Real-time nhất, độ trễ gần bằng 0)** phù hợp với đúng tựa game đó để nhảy vào phòng đấu và lấy dữ liệu tức thời.

---

## 2. Cơ chế kết nối linh hoạt theo từng nhóm Game (Ưu tiên tốc độ nhanh nhất)

Khi người dùng bấm chọn Game trên màn hình, phần mềm cung cấp sẵn các chế độ vào phòng nhanh nhất cho game đó:

### Chế độ A: Tạo Mã Phòng / Tự bắt trực tiếp trên máy Trọng tài (Dành cho Liên Minh, VALORANT)
- **Tốc độ phản hồi**: Tức thời (0.1 giây - trong game vừa khóa tướng hoặc vừa có mạng hạ gục là ngoài livestream nhảy ngay lập tức).
- **Cách dùng**:
  1. Người dùng bấm nút **"Tạo Phòng Giải Đấu"** (với Liên Minh) để lấy mã gửi cho 2 đội, HOẶC chỉ cần mở game vào ngồi ghế Quan sát trên máy tính.
  2. Phần mềm tự động bắt chặt vào trò chơi ngay khi phòng đấu mở ra, lấy trực tiếp 100% thông số mà không cần qua trung gian.

### Chế độ B: Nhập Số Phòng + Mật khẩu để "Trọng tài Ảo" tự nhảy vào phòng (Dành cho Liên Quân, Tốc Chiến, Free Fire, VALORANT)
- **Tốc độ phản hồi**: Cực nhanh (0.2 - 0.5 giây) vì hình ảnh và dữ liệu được đọc trực tiếp từ "Trọng tài Ảo" chạy ngầm ngay bên trong hệ thống, không bị trễ do dây cáp bên ngoài.
- **Cách dùng**:
  1. Người dùng chọn Game (ví dụ: **Liên Quân** hoặc **Free Fire**).
  2. Gõ **Số Phòng (ID Phòng)** và **Mật khẩu** (hoặc bấm mời tài khoản `TrongTai_Live` vào phòng).
  3. Phần mềm tự điều khiển tài khoản Trọng tài nhảy vào đúng ô Khán giả của phòng đó -> Khi trận đấu bắt đầu, tự thu hình ảnh trận đấu + tự đọc mặt tướng, mạng hạ gục, bảng điểm đẩy thẳng lên sóng.

### Chế độ C: Cắm dây truyền màn hình từ Điện thoại Trọng tài (Chế độ Đạo diễn tự quay camera)
- **Khi nào dùng?**: Khi giải đấu có một Trọng tài chuyên nghiệp muốn tự tay cầm điện thoại vuốt bản đồ, phóng to vào các pha solo đẹp mắt.
- **Tốc độ phản hồi**: Quét hình ảnh tốc độ cao (30 đến 60 lần mỗi giây) ngay khi hình ảnh từ điện thoại vừa truyền vào máy tính để bắt mặt tướng và tỉ số tức thời.

---

## 3. Bàn điều khiển "Cứu nguy trong 1 giây" (Sửa nhanh không độ trễ)
Để đảm bảo buổi phát sóng không bao giờ có sai sót:
- **Gợi ý & Khóa tức thời**: Ngay khi máy vừa đọc được tướng hoặc bảng điểm (trong vòng 0.2 giây), thông tin hiện ngay lên bàn điều khiển. Nếu cần đổi tên tướng hoặc đảo vị trí 2 người chơi vừa đổi tướng cho nhau ở giây cuối, người trực chỉ cần bấm 1 chuột là trên màn hình livestream đổi ngay lập tức.
- **Đồng bộ chung 1 khuôn mẫu**: Dù lấy dữ liệu từ Chế độ A, B hay C, đầu ra của Skill 03 luôn là một gói dữ liệu thống nhất để gửi sang **Skill 04 (Quản lý giải đấu)** và **Skill 05 (Phát sóng trực tiếp)**.
