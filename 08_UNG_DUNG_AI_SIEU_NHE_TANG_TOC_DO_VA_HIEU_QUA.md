# KẾ HOẠCH CHÍNH THỨC: 3 MODULE AI SIÊU NHẸ TRONG ỨNG DỤNG (MOBA 5v5 & VALORANT)
*(Đã chốt đưa vào kế hoạch triển khai chính thức: Nhẹ máy dưới 2% CPU - Phản hồi 0,005 giây - Tự động hóa hoàn toàn)*

---

## 1. Module AI số 1: AI "Mắt Thần Siêu Nhẹ" nhận diện Tướng (Kể cả khi mặc Trang phục / Skin lạ) trong 0,005 giây
*(Nằm ở Mảnh ghép 2 - Kết nối Game MOBA Điện Thoại: Liên Quân Mobile & Liên Minh: Tốc Chiến)*

- **Vấn đề giải quyết**:
  Ở Liên Quân và Tốc Chiến, mỗi vị tướng có nhiều bộ Trang phục (Skin) làm thay đổi màu sắc và hình dáng khuôn mặt, cộng thêm hiệu ứng tia chớp lóa sáng lúc bấm khóa tướng.
- **Cách hoạt động nhẹ và nhanh**:
  1. Không quét toàn bộ màn hình video lớn (tránh làm nóng và nặng máy).
  2. Chỉ cắt đúng **10 ô vuông nhỏ** tại tọa độ của 10 người chơi đưa vào mô hình AI siêu nhẹ (nặng chưa tới 5MB).
  3. Mô hình đã học sẵn cả ảnh tướng mặc định lẫn toàn bộ ảnh Trang phục (Skin) -> Trả ra kết quả chính xác **99,9%** chỉ trong **0,005 giây (5 phần nghìn giây)**, tiêu tốn **dưới 2% CPU**.

---

## 2. Module AI số 2: AI "Tự Động Lia Khung Hình Dọc TikTok Theo Pha Giao Tranh" (AI Smart Auto-Crop 9:16)
*(Nằm ở Mảnh ghép 5 - Phòng Hình Ảnh & Phát Sóng Đa Nền Tảng Ngang/Dọc)*

- **Vấn đề giải quyết**:
  Khi chuyển từ màn hình ngang (16:9) của game MOBA / VALORANT sang màn hình dọc (9:16) của TikTok, nếu chỉ cắt cứng ở chính giữa màn hình thì những pha solo hoặc giao tranh diễn ra ở góc trái / góc phải sẽ bị lọt ra ngoài khung hình dọc.
- **Cách hoạt động nhẹ và nhanh**:
  1. AI theo dõi mật độ xuất hiện của các thanh máu tướng và hiệu ứng tung chiêu trên khung hình ngang.
  2. Khi phát hiện pha đánh nhau đang diễn ra lệch sang bên trái hoặc bên phải, **khung cắt dọc 9:16 của luồng TikTok tự động trượt êm ái (lia máy mượt như người quay phim) sang đúng khu vực đang giao tranh đó**.
  3. Khi hết giao tranh, khung hình tự động trở về vị trí trung tâm mượt mà.

---

## 3. Module AI số 3: AI "Tự Động Bắt Khoảnh Khắc Highlight & Tự Chèn Chữ Phụ Đề TikTok"
*(Nằm ở Mảnh ghép 5 - Ghi hình & Quà tặng Highlight cho 10 Tuyển thủ sau trận)*

- **Vấn đề giải quyết**:
  Giúp tạo ra các clip ngắn 30 giây chuẩn xu hướng TikTok ngay lập tức khi trận đấu vừa kết thúc mà không cần người ngồi tua lại video cắt tay hay gõ từng dòng chữ phụ đề.
- **Cách hoạt động nhẹ và nhanh**:
  1. **Tự động bắt khoảnh khắc**: Ngay trong trận đấu, khi hệ thống thấy sự kiện nhảy mạng lớn (**Triple Kill, Quadra Kill, Penta Kill, Ace, Cướp Baron/Tà Thần Caesar**) kết hợp với **cường độ âm thanh cao trào của Bình luận viên**, hệ thống tự động trích xuất đoạn video **15 giây trước và 10 giây sau khoảnh khắc đó** từ bộ nhớ đệm.
  2. **Tự động dàn khung dọc & chèn chữ phụ đề**: Đoạn video 30 giây được xuất theo khung dọc TikTok (đã có AI số 2 lia đúng tâm giao tranh), đồng thời AI nhận diện giọng nói tự động chuyển lời bình luận hào hứng của Bình luận viên thành **dòng chữ phụ đề nảy lên giữa màn hình** kèm tên tuyển thủ và logo giải đấu.
  3. **Sẵn sàng trong 3 giây**: Ngay khi nổ nhà chính, 10 tuyển thủ quét mã QR trên iPad là tải được ngay clip hoàn chỉnh của mình về đăng TikTok!
