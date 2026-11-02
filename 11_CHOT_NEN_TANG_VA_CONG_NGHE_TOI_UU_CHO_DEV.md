# CHỐT NỀN TẢNG & KIẾN TRÚC KỸ THUẬT HỢP LÝ NHẤT CHO DEV
*(Phân tích thực tế giữa các nền tảng và chốt phương án tối ưu nhất về tốc độ code, độ ổn định Real-time và lợi nhuận ròng)*

---

## 1. KẾT LUẬN NGẮN GỌN: NỀN TẢNG NÀO HỢP LÝ NHẤT?

Sau khi cân đo đong đếm toàn bộ yêu cầu (bắt API Liên Minh & VALORANT trên PC, điều khiển Trọng tài Liên Quân & Tốc Chiến, chạy AI soi Minimap chọn vị trí, ghép đồ họa 60fps phát đồng thời Ngang + Dọc, và cho phép 1 người cầm iPad đi lại điều khiển), nền tảng hợp lý tuyệt đối là:

> **MÔ HÌNH LAI (HYBRID):**
> **1. Phần Lõi (Core App) cài trên MÁY TÍNH WINDOWS PC** *(Đặt cố định ở góc phòng để gánh toàn bộ việc nặng: chạy game, đọc API, chạy AI và phát sóng)*.
> **2. Phần Điều Khiển (Director Touch UI) chạy dưới dạng WEB APP NỘI BỘ mở trên IPAD / TABLET chỉ bằng 1 lần Quét Mã QR!**

---

## 2. TẠI SAO KHÔNG LÀM APP CHẠY ĐỘC LẬP 100% TRÊN IPAD MÀ PHẢI LẤY WINDOWS PC LÀM TRỤ SỞ CHÍNH?

Nếu bạn cố viết một ứng dụng chỉ chạy đơn độc trên chiếc iPad (iOS Native), bạn sẽ đụng phải **4 bức tường kỹ thuật và tiền bạc** rất lớn:

| Vấn Đề Kỹ Thuật & Chi Phí | Nếu Chỉ Làm App Đơn Độc Trên iPad | Khi Dùng Mô Hình "Lõi Windows PC + iPad Quét QR Điều Khiển" |
| :--- | :--- | :--- |
| **1. Chạy Liên Minh PC & VALORANT PC** | iPad **không thể cài** Liên Minh PC hay VALORANT. Bạn sẽ phải bỏ tiền túi đi thuê hàng chục máy chủ đám mây có Card màn hình rời (tốn 30 - 50 triệu/tháng tiền server). | Cài thẳng lên chiếc **Máy tính Windows PC có sẵn tại quán net / phòng giải**. Đọc trực tiếp API cổng `2999` và `LCU` trên máy đó với **chi phí máy chủ = 0 đồng!** |
| **2. Sức nặng khi vừa chạy AI + vừa phát 2 luồng Live 60fps** | iPad sẽ bị quá nhiệt, tụt khung hình và sập pin chỉ sau 30 - 45 phút nếu phải tự nén 2 luồng video Full HD 60fps liên tục. | Chiếc **Windows PC dùng điện nguồn và Card màn hình rời (NVIDIA/AMD)** gánh việc nén video và chạy AI nhẹ nhàng suốt 12 tiếng liên tục; còn **chiếc iPad chỉ hiển thị các nút bấm điều khiển nên mát rượi và siêu mượt!** |
| **3. Phí nền tảng & Duyệt App** | Apple thu mất **30% doanh thu** của bạn và mỗi lần sửa lỗi phải đợi Apple duyệt mất 2 - 5 ngày. | Thu tiền trực tiếp 100% qua QR Ngân hàng / Web (bạn giữ trọn **100% doanh thu**), muốn cập nhật tính năng mới là đẩy lên ngay trong 1 phút. |
| **4. Công sức Code của Dev** | Phải học và viết riêng code Swift/iOS cho iPad + code máy chủ phức tạp. | Toàn bộ Giao diện trên PC + Giao diện trên iPad + Lớp đồ họa Overlay đều viết chung bằng **1 bộ code duy nhất (React / TypeScript)**! |

---

## 3. CÁCH HOẠT ĐỘNG THỰC TẾ CỦA MÔ HÌNH "LÕI WINDOWS PC + IPAD QUÉT QR"

1. Khách hàng tải bộ cài `.exe` của bạn về cài lên **1 chiếc máy tính Windows PC** ở nơi tổ chức giải (quán net nào hay giải đấu nào cũng có sẵn máy PC này).
2. Khi mở phần mềm trên PC lên:
   - Nếu khách không có iPad: Khách bấm điều khiển trực tiếp bằng chuột ngay trên màn hình chiếc PC đó luôn!
   - Nếu khách muốn **cầm iPad đi lại khắp phòng điều khiển từ xa**: Trên góc màn hình PC có nút **"Mở Điều Khiển Trên iPad (Hiện Mã QR)"**.
3. Khách lấy **iPad** (hoặc bất kỳ máy tính bảng Android, iPhone, Laptop phụ nào đang bắt chung mạng Wi-Fi) quét Mã QR đó:
   - Ngay lập tức, trên iPad mở ra giao diện **Bàn Đạo Diễn Cảm Ứng Toàn Màn Hình** nối trực tiếp với chiếc PC qua mạng nội bộ (WebSocket tốc độ **0,005 giây**).
   - Khách cầm iPad đi quanh phòng: Chạm chọn chiếu **Vị trí Đi Rừng Đội Xanh**, chạm chuyển cảnh, chạm bật Replay... chiếc PC ở góc phòng lập tức thực thi ngay tức khắc!

---

## 4. BỘ CÔNG NGHỆ (TECH STACK) KHUYÊN DÙNG ĐỂ DEV CODE NHANH NHẤT

Để một mình bạn (hoặc một nhóm nhỏ) code ra sản phẩm này nhanh nhất mà đạt chuẩn công nghiệp:

1. **Khung Ứng dụng Desktop trên Windows PC**:
   - Dùng **Electron (Node.js + TypeScript)** hoặc **Tauri**.
   - *Lý do*: Cực kỳ dễ đóng gói thành 1 file cài đặt `.exe`, dễ dàng đọc file Lockfile/API của Liên Minh & VALORANT và mở cổng WebSocket nội bộ cho iPad kết nối vào.
2. **Giao diện Điều khiển (PC + iPad) & Lớp Đồ họa Livestream (Overlays)**:
   - Dùng **React + TailwindCSS + Framer Motion** (kết nối thời gian thực qua **Socket.io / WebSocket**).
   - *Lý do*: Tất cả 6 cảnh đồ họa (Cấm/Chọn, Thanh tỉ số trong trận, Bảng so sánh 1v1, Nhánh đấu) thực chất là các trang Web nền trong suốt chạy ngay trong ứng dụng. Khi cần đổi màu hay thêm hiệu ứng động, bạn chỉ cần sửa vài dòng CSS/React.
3. **Bộเชื่อมต่อ Game & Điều khiển Vị trí (Camera Switcher)**:
   - *Với Liên Minh & VALORANT trên PC*: Đọc trực tiếp HTTP/WebSocket nội bộ (`127.0.0.1:2999`, `LCU API`) + dùng thư viện gửi phím tắt ảo (`SendInput` / `RobotJS`) để khi iPad bấm chọn Vị trí `1..10` là tự bấm phím chuyển camera trong cửa sổ Spectator ngay lập tức.
   - *Với Liên Quân & Tốc Chiến*: Thu màn hình từ trình giả lập Android chạy ngầm trên PC (hoặc điện thoại Trọng tài cắm cáp USB nối vào PC qua giao thức **`scrcpy` / `ADB`** độ trễ bằng 0). Khi iPad bấm chọn Vị trí `1..10`, hệ thống dùng lệnh `adb shell input tap X Y` chạm thẳng vào avatar vị trí đó trong 0,01 giây!
4. **Bộ AI Siêu Nhẹ (Soi Minimap & Nhận diện Tướng)**:
   - Dùng **ONNX Runtime (chạy trực tiếp trong Node.js hoặc Python đi kèm)** + **OpenCV**.
   - Cắt vùng ảnh Minimap và 10 ô tướng ngay trên RAM của máy PC, chạy mô hình nhận diện trong **0,005 giây**.
5. **Bộ Ghép Hình & Phát Sóng Đa Luồng (16:9 + 9:16)**:
   - Tích hợp **OBS WebSocket / `libobs` (hoặc `FFmpeg` gọi phần cứng `NVENC` của card màn hình)**.
   - Giúp ghép luồng video game + lớp đồ họa React nền trong suốt và bắn thẳng RTMP lên YouTube, Facebook, TikTok.
