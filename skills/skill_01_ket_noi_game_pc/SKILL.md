---
name: skill-01-ket-noi-game-pc
description: |
  Kỹ năng số 1 (Chia để trị): Tự động lấy thông tin trực tiếp từ các trò chơi trên máy tính (Liên Minh Huyền Thoại, VALORANT, Dota 2, CS2) mà không cần người dùng nhập tay.
---

# SKILL 01: TỰ ĐỘNG LẤY THÔNG TIN TỪ GAME MÁY TÍNH (LIÊN MINH, VALORANT)

## 1. Mục đích của mảnh ghép này (Nói dễ hiểu)
Khi trọng tài hoặc người quay phát mở trò chơi Liên Minh Huyền Thoại hoặc VALORANT trên máy tính để xem trận đấu, bộ phận này có nhiệm vụ âm thầm "hỏi" thẳng trò chơi xem chuyện gì đang diễn ra bên trong và báo về cho phần mềm livestream mỗi giây một lần.

Người điều khiển livestream **không cần phải tự gõ tên tướng, không cần tự đếm mạng hạ gục hay tự bấm giờ**.

---

## 2. Bộ phận này phải lấy được những thông tin gì?

### Giai đoạn 1: Lúc hai đội đang Cấm và Chọn tướng (Trước khi vào trận)
- Đội bên Xanh và Đội bên Đỏ đang tới lượt ai suy nghĩ?
- Đồng hồ đếm ngược còn bao nhiêu giây?
- Mỗi bên đã **Cấm (Ban)** những vị tướng nào?
- Từng người chơi (từ số 1 đến số 5 của mỗi đội) đang nhấp nháy định chọn tướng gì, và đã **Khóa (Pick)** chính thức vị tướng nào?
- Họ mang theo phép bổ trợ gì (Tốc Biến, Thiêu Đốt, Trừng Phạt...)?

### Giai đoạn 2: Lúc trận đấu đang diễn ra
- **Với Liên Minh Huyền Thoại**:
  - Thời gian trận đấu đã chạy được bao nhiêu phút, bao nhiêu giây.
  - Tổng số mạng hạ gục của Đội Xanh và Đội Đỏ.
  - Tổng số tiền (vàng) của từng đội để biết đội nào đang giàu hơn, dẫn trước bao nhiêu tiền.
  - Số trụ đã phá, số Rồng (Rồng Lửa, Rồng Nước, Rồng Công Nghệ...), Sứ Giả, Baron mà mỗi đội đã ăn được.
  - Thông tin của từng người trong 10 người chơi: Đang cấp mấy, giết được mấy mạng - chết mấy lần - hỗ trợ mấy lần, đã mua những món đồ gì trong túi, nếu vừa bị hạ gục thì còn mấy giây nữa sẽ sống lại.
- **Với VALORANT**:
  - Tỉ số các vòng đấu (Round) hiện tại là bao nhiêu (ví dụ: 7 - 5).
  - Đội nào đang bên Tấn Công (Đặt bom Spike), đội nào đang bên Phòng Thủ (Gỡ bom).
  - Bom Spike đã được đặt hay chưa? (Để màn hình livestream tự hiện hiệu ứng nhấp nháy báo động đỏ).
  - Từng người chơi còn bao nhiêu máu, đang cầm súng gì, còn bao nhiêu tiền mua súng và chiêu cuối đã sẵn sàng chưa.

---

## 3. Cách thức hoạt động (Theo ngôn ngữ đời thường)
1. **Tự tìm trò chơi**: Ngay khi người dùng mở Liên Minh hoặc VALORANT trên máy tính, bộ phận này tự phát hiện trò chơi đã bật mà không bắt người dùng phải đi tìm thư mục cài game.
2. **Đọc qua cửa ngõ hợp lệ của nhà làm game**: Chỉ đọc các thông tin mà nhà sản xuất game (Riot Games) cho phép lấy ra từ máy của người xem (Spectator), đảm bảo **tuyệt đối an toàn, không bao giờ làm khóa tài khoản game hay bị phần mềm chống gian lận chặn**.
3. **Tự tải sẵn kho hình ảnh**: Khi game có tướng mới hoặc trang phục mới ở bản cập nhật mới, bộ phận này tự tải hình ảnh tướng và biểu tượng trang bị mới nhất về máy tính để hiển thị không bao giờ bị thiếu ảnh.

---

## 4. Kết quả bàn giao cho mảnh ghép tiếp theo
Sau khi lấy được thông tin từ trò chơi, bộ phận này đóng gói gọn gàng và gửi ngay sang cho **Skill 03 (Cổng kết nối 1 chạm)** để chuẩn bị đưa lên màn hình phát sóng.
