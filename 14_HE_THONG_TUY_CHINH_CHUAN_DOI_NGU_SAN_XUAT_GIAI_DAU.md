# 14. TẬP TRUNG 100% VÀO "THAO TÁC ĐIỀU KHIỂN" CHUẨN ĐẠO DIỄN GIẢI ĐẤU LỚN (LCK / VCS / WORLDS)

> **Nguyên tắc cốt lõi cho Dev (Kế hoạch tinh gọn)**:
> Không làm các công cụ kéo-thả thiết kế đồ họa rườm rà. Khung giao diện (HUD/Overlay) được **đóng chuẩn theo mẫu Giải đấu lớn sẵn 100%** (chỉ cần nhập Tên Giải, Tên 2 Đội, Logo 2 Đội là chạy). Toàn bộ sức mạnh của ứng dụng tập trung vào việc giúp **Người Quản Trị (Đạo diễn cầm iPad) THAO TÁC ĐIỀU KHIỂN TRẬN ĐẤU y hệt bàn đạo diễn của giải lớn**.

---

## 1. CƠ CHẾ NỀN TẢNG (TỰ ĐỘNG CHẠY NGẦM 100%)

Ngay khi vào trận trên máy Trọng tài (Spectator PC):
1. App tự động gọi `POST https://127.0.0.1:2999/replay/render` để **ẩn các bảng mặc định thô cứng của game**, chỉ giữ lại Bản đồ 3D + 10 Tướng + Minimap.
2. App tự động phủ **Khung Giao Diện Chuẩn Giải Lớn (LCK/Worlds Style)** lên trên và tự nhảy thông số Vàng, Mạng hạ gục, Trụ, Rồng, Baron Power Play, Trang bị theo thời gian thực (`0.00s`).

---

## 2. 4 NHÓM THAO TÁC CỦA ĐẠO DIỄN TRÊN IPAD (GIỐNG HỆT GIẢI ĐẤU LỚN)

### Thao tác 1: Điều khiển Trước trận & Cấm/Chọn (Pre-Match & Draft)
* **1 chạm Tạo Phòng Giải Đấu**: Chọn thể thức (`BO1 / BO3 / BO5`), bật/tắt luật **`Fearless Draft` (Cấm chọn trùng tướng các ván trước)** -> App tự mở phòng `Tournament Draft 5v5` trong LoL.
* **Tự động chạy màn hình Cấm/Chọn (`Ban/Pick`)**: Tuyển thủ cấm/chọn tới đâu, giao diện tự nhảy ảnh tướng, tên tuyển thủ, đồng hồ đếm ngược tới đó.
* **Tự động chuyển cảnh chờ vào trận**: Khóa xong 10 tướng -> Tự chuyển sang màn hình *"Đội hình ra quân 5v5"* trong lúc chờ game tải bản đồ.

### Thao tác 2: Điều khiển Chọn Vị Trí & Lia Camera Trọng Tài (Cốt lõi nhất trong trận)
Trên màn hình iPad có **10 nút Vị trí (`Top, Jungle, Mid, ADC, Support` của Đội Xanh & Đội Đỏ)** kèm cảnh báo nhấp nháy từ **AI đọc Minimap**:
* **Chạm vào 1 Vị trí bất kỳ (Ví dụ: `Jungle Đội Xanh`)**:
  1. Camera Tổng quan Trọng tài trên PC lập tức lia tới vị trí của `Jungle Đội Xanh`.
  2. Dưới đáy màn hình hiện thẻ thông số chi tiết của tuyển thủ đó.
* **Chạm nút `So kè 1v1 cùng đường` (Ví dụ: `Mid vs Mid`)**:
  1. Dưới đáy màn hình bật bảng đối đầu trực tiếp giữa `Mid Xanh` và `Mid Đỏ` (So sánh Chênh lệch Vàng, Lính, KDA, Trang bị).
* **Bật `AI Auto-Director (Tự động)`**:
  1. Khi Admin bận tay, AI đọc Minimap thấy đường nào có gank/giao tranh (tụ 3-4 tướng hoặc tụt máu nhanh) sẽ tự động lia Camera Trọng tài tới vị trí đó.

### Thao tác 3: 4 Nút Nghiệp Vụ Đặc Trưng Của Đạo Diễn Giải Lớn (Trong trận)
Đạo diễn giải lớn chỉ cần đúng **4 nút bấm nghiệp vụ này** trên iPad trong lúc trận đấu đang diễn ra:
1. **Nút Đổi Tầm Nhìn Sương Mù (`Fog of War`: `Cả 2 Đội` / `Chỉ Đội Xanh` / `Chỉ Đội Đỏ`)**:
   * Cho khán giả thấy chính xác Đội Đỏ có nhìn thấy Đội Xanh đang ăn Baron hay đang nấp trong bụi cỏ hay không (Gọi thẳng qua API `127.0.0.1:2999/replay/render`).
2. **Nút Đổi Bảng Thông Tin Dưới Đáy (`Bảng 10 Người` <-> `So Kè 1v1` <-> `Biểu Đồ Chênh Lệch Vàng`)**:
   * Khi trận đấu đang farm hòa hoãn, bấm bật *Biểu đồ Vàng* hoặc *Bảng 10 người* để Bình luận viên phân tích.
3. **Nút Phát Lại Pha Giao Tranh (`Replay 15 Giây`)**:
   * Ngay sau khi có mạng hạ gục hoặc combat xong, bấm 1 chạm để phát lại 15 giây vừa diễn ra (hoặc để chế độ Tự động phát Replay khi có Triple/Quadra/Pentakill), xong tự quay về trực tiếp.
4. **Nút Tạm Dừng Kỹ Thuật (`Technical Pause`)**:
   * Khi trong game có người bấm `/pause`, bấm 1 nút để che màn hình bằng bảng *"Tạm dừng kỹ thuật"* chuẩn giải đấu.

### Thao tác 4: Kết thúc Ván đấu & Chuyển Ván (Post-Match)
* Nhà chính nổ -> App tự động bật **Bảng Thống Kê Sát Thương (Damage Dealt Chart)** và gợi ý **Tuyển thủ MVP**.
* Admin bấm 1 nút **"Cộng tỉ số & Đổi bên sang Ván 2"** -> App tự đảo bên Xanh/Đỏ, lưu 10 tướng ván vừa rồi vào danh sách cấm chọn lại (`Fearless Draft`) và sẵn sàng cho ván tiếp theo.
