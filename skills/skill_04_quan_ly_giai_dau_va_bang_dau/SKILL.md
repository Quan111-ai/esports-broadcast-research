---
name: skill-04-quan-ly-giai-dau-va-bang-dau
description: |
  Kỹ năng số 4 (Chia để trị): Sổ tay quản lý giải đấu, danh sách đội tuyển, hình ảnh tuyển thủ, sơ đồ nhánh đấu và tự động tính điểm bảng xếp hạng.
---

# SKILL 04: QUẢN LÝ GIẢI ĐẤU, ĐỘI TUYỂN, NHÁNH ĐẤU VÀ TỰ ĐỘNG TÍNH ĐIỂM

## 1. Mục đích của mảnh ghép này (Nói dễ hiểu)
Trước đây, người làm giải đấu phải dùng một trang web bên ngoài để chia cặp đấu, dùng một bảng Excel để cộng điểm, rồi lại phải tự copy từng cái tên đội, từng tấm ảnh logo dán vào phần mềm livestream trước mỗi trận đấu. Làm như vậy rất mất thời gian và cực kỳ dễ nhầm tên đội trước thành tên đội sau.

Bộ phận số 4 này gom toàn bộ công việc tổ chức giải đấu vào ngay bên trong phần mềm, để **chọn trận nào trên sơ đồ giải là toàn bộ hình ảnh, tên tuổi của trận đó tự nạp vào màn hình livestream ngay lập tức**.

---

## 2. Những tính năng cụ thể trong bộ phận này

### A. Hồ sơ Đội tuyển và Tuyển thủ (Chỉ cần nhập 1 lần dùng cho cả giải)
- **Quản lý Đội tuyển**: Tên đầy đủ của đội (ví dụ: *Saigon Phantom*), tên viết tắt 3 chữ cái để hiện lên bảng tỉ số (ví dụ: *SGP*), ảnh Logo đội (nền trong suốt), màu đại diện của đội.
- **Quản lý Tuyển thủ**: Tên thi đấu trong game, vị trí thi đấu (Đường trên, Đi rừng, Đường giữa, Xạ thủ, Hỗ trợ...), và ảnh chân dung của tuyển thủ (nếu đội bóng chưa có ảnh chân dung thì phần mềm tự lấy hình bóng mặc định thật ngầu thay thế để giao diện không bao giờ bị trống).
- **Nhập nhanh**: Cho phép nhập danh sách cả chục đội cùng lúc từ một file danh sách đăng ký hoặc kéo thả cả thư mục ảnh vào.

### B. Tự động vẽ Sơ đồ Nhánh đấu và Lịch thi đấu
Hỗ trợ đầy đủ các kiểu tổ chức giải đấu phổ biến nhất:
1. **Đấu loại trực tiếp (Thắng đi tiếp, thua bị loại)**: Dành cho giải 4 đội, 8 đội, 16 đội, 32 đội.
2. **Nhánh thắng - Nhánh thua (Thua 1 lần vẫn còn cơ hội làm lại ở nhánh dưới)**: Rất hay dùng cho bán kết, chung kết.
3. **Đấu vòng tròn tính điểm**: Các đội lần lượt gặp nhau để chọn ra đội nhiều điểm nhất.
4. **Đấu tính điểm tổng qua nhiều ván (Dành riêng cho Free Fire / Sinh tồn)**:
   - Cho phép người tổ chức tự cài đặt quy tắc cộng điểm của giải (Ví dụ: Đứng Hạng 1 được 12 điểm, Hạng 2 được 9 điểm... mỗi mạng hạ gục được cộng thêm 1 điểm).

### C. Tự động đồng bộ với Phòng Livestream
1. **Trước trận**: Người điều khiển chỉ cần bấm chuột vào cặp đấu **"Trận Tứ kết 1: Đội A gặp Đội B"** trên sơ đồ nhánh đấu -> Toàn bộ logo, màu áo, tên viết tắt và 10 tuyển thủ của Đội A và Đội B tự động hiển thị sẵn trên các cảnh livestream.
2. **Sau mỗi ván đấu**: Khi Đội A thắng ván 1, tỉ số tự nhảy lên **1 - 0**. Khi Đội A thắng đủ 2 ván (trong kèo chạm 2 - BO3), phần mềm tự động điền tên Đội A vào vòng Bán kết trên sơ đồ giải đấu và sẵn sàng chiếu sơ đồ mới nhất lên màn hình cho khán giả xem.
3. **Với Free Fire**: Sau mỗi ván bắn (Ván 1, Ván 2, Ván 3...), điểm của 12 đội tự động cộng dồn vào Bảng Tổng Sắp, tự chỉ ra đội nào vừa tăng hạng, đội nào vừa tụt hạng.
