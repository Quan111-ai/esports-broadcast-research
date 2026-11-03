# 14. HỆ THỐNG TÙY CHỈNH TOÀN DIỆN (CUSTOMIZATION ENGINE) NHƯ CÁC ĐỘI NGŨ SẢN XUẤT GIẢI ĐẤU CHUYÊN NGHIỆP

Tài liệu này giải thích cách các đội ngũ sản xuất giải đấu lớn (**LCK, LPL, LEC, VCS, Chung Kết Thế Giới** và các ekip làm giải chuyên nghiệp dùng `League Broadcast`, `LHM.gg`, `Singular.live`, `League Director`) tùy biến toàn bộ giao diện và luồng phát sóng của Liên Minh Huyền Thoại, đồng thời quy định kiến trúc để ứng dụng của chúng ta **cho phép người dùng tùy chỉnh 100% những thứ đó**.

---

## 1. BÍ MẬT KỸ THUẬT: TẠI SAO CÙNG 1 GAME LOL MÀ MỖI GIẢI ĐẤU LẠI CÓ GIAO DIỆN KHÁC HẲN NHAU?

Các đội ngũ làm giải đấu chuyên nghiệp **KHÔNG BAO GIỜ** dùng nguyên giao diện mặc định của game Liên Minh Huyền Thoại. Họ làm theo cơ chế **2 lớp (Two-Layer Broadcast Architecture)**:

1. **Lớp 1 - Tắt giao diện mặc định của Game bằng `Replay Render API` (`POST https://127.0.0.1:2999/replay/render`)**:
   * App gửi một gói JSON xuống cổng `2999` của máy Trọng tài để **ẩn sạch các bảng rườm rà mặc định của Riot**:
     * `interfaceScoreboard: false` (Ẩn bảng điểm mặc định dưới đáy).
     * `interfaceTimeline: false` (Ẩn thanh tua thời gian của Spectator).
     * `interfaceFrames: false` (Ẩn 10 khung avatar mặc định ở 2 bên sườn).
     * `interfaceTarget: false` (Ẩn khung thông tin mục tiêu mặc định ở góc trái trên).
   * Lúc này trên màn hình game chỉ còn lại: **Bản đồ 3D sắc nét + 10 Tướng kèm thanh máu + Bản đồ nhỏ (Minimap) ở góc phải dưới**.
2. **Lớp 2 - Phủ Lớp Giao Diện Đồ Họa Tùy Chỉnh (`HTML5 / CSS3 / React Overlay Engine`)**:
   * Toàn bộ Bảng tỉ số trên đỉnh, Đồng hồ Rồng/Baron, Khung 10 tướng 2 bên, Hộp thông tin tuyển thủ dưới đáy, và Màn hình Cấm/Chọn (Ban/Pick) đều là **các khối giao diện Web động (`HTML/CSS/JS` trong suốt)** lấy dữ liệu realtime từ `LCU API` và `Live Client Data API (2999)`.
   * Nhờ tách rời hoàn toàn khỏi giao diện cứng của game, chúng ta có thể **tùy chỉnh 100% màu sắc, bố cục, hình ảnh, hiệu ứng, luật chơi và góc máy** y hệt bất kỳ giải đấu lớn nào trên thế giới.

---

## 2. 6 NHÓM TÙY CHỈNH MÀ CÁC ĐỘI NGŨ LÀM GIẢI ĐẤU SỬ DỤNG (VÀ APP CỦA CHÚNG TA HỖ TRỢ TRỌN VẸN)

### Nhóm 1: Tùy chỉnh Giao diện & Thương hiệu Giải đấu (Theme & White-Label Studio)
1. **Đổi Theme Giải Đấu 1 Chạm (Preset Broadcast Skins)**:
   * Đổi toàn bộ kiểu dáng giao diện ngay lập tức theo phong cách: **`LCK Style` (Hàn Quốc - Tối giản, hiện đại)**, **`LPL / Worlds Style` (Hoành tráng, nhiều thông số)**, **`LEC Style` (Màu sắc trẻ trung)**, hoặc **`VCS Style`**.
2. **Tùy chỉnh Thương hiệu (Branding & Sponsor)**:
   * Đổi Logo Giải đấu, Tên giải, Màu chủ đạo (`Primary / Secondary / Accent Color`), Phông chữ (`Custom Fonts`), Hình nền chuyển cảnh.
   * Thay Logo, Tên viết tắt (`T1`, `GAM`, `GEN`), Màu sắc nhận diện riêng cho từng Đội.
   * **Gắn ảnh chân dung thật của Tuyển thủ (Player Cutout PNG / Webcam)**: Khi tuyển thủ khóa tướng ở màn hình Ban/Pick hoặc khi Admin bấm chọn vị trí trong trận, hiện ảnh chụp thật (hoặc luồng Camera mặt tuyển thủ) đè lên nền tướng.
   * **Quản lý Logo Nhà tài trợ (Sponsor Carousel)**: Thêm không giới hạn logo nhà tài trợ, cài đặt thời gian tự động xoay vòng (ví dụ: 15 giây đổi 1 logo) kèm mã QR khuyến mãi.

### Nhóm 2: Tùy chỉnh Bố cục Từng Khối Trên Màn Hình (Modular HUD Builder)
Người làm giải có thể **Bật / Tắt / Kéo thả vị trí / Chỉnh kích thước** của từng khối đồ họa độc lập trên cả màn hình Ngang `16:9` và Dọc `9:16`:
1. **Thanh Tỉ Số Đỉnh (Top Scoreboard Bar)**: Tùy chọn hiện/ẩn biểu đồ chênh lệch Vàng, số Trụ, số Rồng, Sứ Giả, Sâu Hư Không (`Voidgrubs`), Baron.
2. **Đồng hồ Đếm ngược Mục tiêu & Power Play**:
   * Tự động bật hộp **`Baron Power Play (+Vàng nhảy từng giây trong 3 phút)`** khi có đội ăn Baron.
   * Tự động hiện đồng hồ đếm ngược thời gian Rồng / Baron sắp hồi sinh.
3. **10 Khung Tuyển Thủ 2 Bên Sườn (Side Player Frames)**: Tùy chọn hiện thanh Máu/Mana, Phép bổ trợ, Chiêu cuối (`R`), Ngọc bổ trợ và Vàng hiện có trong túi.
4. **Bảng Đạo Diễn Dưới Đáy (Bottom Center Director Dock)**:
   * Chuyển đổi linh hoạt giữa 4 chế độ từ iPad: **(1) Bảng 10 Tuyển thủ & Trang bị**, **(2) Thẻ Cận cảnh 1 Vị trí đang chọn**, **(3) Bảng So kè 1v1 cùng đường (`Top vs Top`, `Mid vs Mid`...)**, **(4) Biểu đồ Chênh lệch Vàng / Sát thương theo thời gian**.

### Nhóm 3: Tùy chỉnh Luật Cấm/Chọn & Thể Thức Thi Đấu (Custom Draft & Series Rules)
Các đội ngũ tổ chức giải đấu thường xuyên áp dụng luật riêng ngoài khuôn khổ mặc định của game:
1. **Bật/Tắt Luật `Fearless Draft` (Cấm Chọn Không Trùng Lặp)**:
   * **Hard Fearless**: Toàn bộ tướng cả 2 đội đã chọn ở các ván trước tự động bị khóa và hiện danh sách "Tướng Đã Dùng" trên màn hình Cấm/Chọn của Ván 2, Ván 3, Ván 4, Ván 5.
   * **Soft Fearless**: Chỉ khóa các tướng mà chính đội đó đã dùng ở ván trước.
2. **2 Chế độ Cấm/Chọn Linh Hoạt**:
   * **Chế độ 1 - Tự động đọc từ Sảnh Game (`LCU Auto-Sync`)**: Tuyển thủ cấm chọn trực tiếp trong client LoL, giao diện tự nhảy theo `0.01s`.
   * **Chế độ 2 - Phòng Cấm/Chọn Web Độc Lập (`External Web Draft` kiểu Prodraft)**: Dành cho các giải muốn 2 Huấn luyện viên (Coach) cấm chọn trên Web/iPad trước với thời gian đếm ngược tùy chỉnh, hoặc giải có Ván 5 Chọn Ẩn (`Blind Pick`), sau đó mới vào game.
3. **Tùy chỉnh Thể thức (`BO1 / BO2 / BO3 / BO5 / BO7`)**: Tự động cộng điểm ván thắng trên thanh tỉ số và đổi bên Xanh/Đỏ chỉ bằng 1 chạm trên iPad.

### Nhóm 4: Tùy chỉnh Góc Máy 3D & Tầm Nhìn Trọng Tài (`League Director` Camera & Fog Control)
Thông qua cổng chính thống `https://127.0.0.1:2999/replay/render`, Đạo diễn trên iPad có thể làm những trò mà chỉ giải lớn mới có:
1. **Bật/Tắt Sương Mù Tầm Nhìn (`Fog of War Toggle`)**:
   * Chỉ với 1 nút bấm trên iPad, chuyển màn hình Trọng tài giữa 3 chế độ: **`Thấy Cả 2 Đội (All Vision)`**, **`Chỉ Thấy Tầm Nhìn Đội Xanh (Blue Fog)`**, hoặc **`Chỉ Thấy Tầm Nhìn Đội Đỏ (Red Fog)`** (Cực kỳ đắt giá khi phân tích pha rình bắt trong bụi cỏ hoặc kiểm soát mắt khu vực Baron!).
2. **Góc Máy Điện Ảnh 3D (`3D Cinematic Camera Presets`)**:
   * Chỉnh độ cao/xa của góc nhìn (`Field of View - Zoom Out toàn cảnh combat 5v5`) hoặc bấm nút nghiêng góc máy 3D (`Pitch/Yaw`) tại Hang Baron / Hang Rồng như LCK.
3. **Điều khiển Camera Lia 10 Vị trí + 1v1 Matchup**: Chạm vào bất kỳ vị trí nào (`Top, Jungle, Mid, ADC, Support`) trên iPad hoặc để AI Auto-Observer tự lia theo điểm nóng trên Minimap.

### Nhóm 5: Tùy chỉnh Thẻ Đồ Họa Đột Biến Trên Sóng (`Custom Lower-Thirds & Pop-up Cards`)
Trong lúc trận đấu đang diễn ra, Đạo diễn có thể bắn các bảng thông tin tùy chỉnh từ iPad lên màn hình:
1. **Thẻ Giới thiệu Bình Luận Viên (`Caster Lower-Third`)**: Hiện tên + Facebook/TikTok của 2 BLV.
2. **Thẻ Thống Kê / Câu Hỏi Bình Chọn (`Custom Stat / Poll Card`)**: Ví dụ *"Thành tích đối đầu: Đội A thắng 3 - Đội B thắng 1"*, *"Ai sẽ ăn Chiến Công Đầu?"*.
3. **Thẻ Thông Báo Khẩn / Tạm Dừng Kỹ Thuật (`Technical Pause Banner`)**: Khi tuyển thủ rớt mạng/lỗi chuột, bấm 1 nút trên iPad để hiện bảng *"Tạm dừng kỹ thuật - Vui lòng chờ trong giây lát"* kèm nhạc chờ.

### Nhóm 6: Tùy chỉnh Luồng Cảnh Phát Sóng & Hiệu ứng Chuyển Cảnh (`Scene Flow & Stinger Transitions`)
Một giải đấu chuyên nghiệp là một chuỗi các cảnh nối tiếp nhau mượt mà, tất cả đều đổi được từ iPad:
1. **`Cảnh 1 - Đếm ngược chờ giải (Starting Soon)`**: Đồng hồ đếm ngược + Lịch thi đấu hôm nay + Nhạc nền.
2. **`Cảnh 2 - Sơ đồ Nhánh đấu / Bảng xếp hạng (Bracket & Standings)`**: Tự động cập nhật đội thắng đi tiếp.
3. **`Cảnh 3 - Bàn Bình Luận (Caster Desk 2 Cam)`**: Khung hình cho 2 BLV nhận định trước trận.
4. **`Cảnh 4 - Màn hình Cấm/Chọn (Ban/Pick Draft)`**: Tự động bật khi sảnh game bắt đầu cấm chọn.
5. **`Cảnh 5 - Đội hình Ra quân (5v5 Lineup / VS Screen)`**: Che thời gian chờ tải trận (Loading/Spectator Buffer).
6. **`Cảnh 6 - Màn hình Trong Trận (In-Game Spectator Live)`**: Giao diện thi đấu chính + Replay 15s góc máy phụ (PiP).
7. **`Cảnh 7 - Bảng Thống Kê Sau Trận & Vinh Danh MVP (Post-Game Damage & MVP)`**: Tự động lấy tổng sát thương, KDA, Vàng để vinh danh tuyển thủ xuất sắc nhất ván.
* **Hiệu ứng Chuyển cảnh (`Custom Stinger Video .webm`)**: Người dùng tải lên video logo giải đấu của mình (có nền trong suốt Alpha Channel), mỗi khi chuyển giữa 7 cảnh trên hoặc khi bật Replay 15s, logo giải sẽ quét ngang màn hình kèm âm thanh chuyển cảnh.
