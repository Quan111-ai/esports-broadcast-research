# MA TRẬN KẾT NỐI REAL-TIME TỐI ƯU THEO TỪNG TỰA GAME (PER-GAME CONNECTION MATRIX)

> **Tài liệu chuẩn hóa kỹ thuật thuộc Module R1 / Milestone 1**  
> **Phạm vi áp dụng**: 7 tựa game Esports hàng đầu (Liên Minh Huyền Thoại, VALORANT, Dota 2, Counter-Strike 2, Liên Quân Mobile, Liên Minh: Tốc Chiến, Free Fire)  
> **Mục tiêu**: Cung cấp bản đồ định tuyến tối ưu (Optimal Routing Map) giúp hệ thống phát sóng tự động chọn phương thức trích xuất dữ liệu nhanh nhất, ổn định nhất và an toàn nhất qua 4 giai đoạn trận đấu, kèm theo lộ trình chuyển mạch dự phòng tức thời khi có sự cố.

---

## 1. TỔNG QUAN VÀ NGUYÊN TẮC XẾP HẠNG PHƯƠNG THỨC KẾT NỐI

Trong sản xuất livestream thể thao điện tử, mỗi tựa game có nền tảng công nghệ, cơ chế bảo vệ chống gian lận và giao diện mở khác nhau. Để đạt được tốc độ phản hồi thời gian thực (< 50ms trên PC, < 100ms trên Mobile), hệ thống phân loại và xếp hạng các phương thức kết nối dựa trên 4 tiêu chí cốt lõi:

1. **Tốc độ phản hồi (Latency SLA)**: Độ trễ tính từ lúc sự kiện xảy ra trong game đến khi gói dữ liệu về đến bộ điều khiển đồ họa phát sóng.
2. **Mức độ tự động hóa (Automation Level)**: Mức độ không cần con người can thiệp (0-Click hoặc 1-Click).
3. **Tính toàn vẹn và độ tin cậy (Data Reliability)**: Dữ liệu là giá trị số học tuyệt đối từ API chính thức hay qua suy luận thị giác máy tính (Computer Vision/OCR).
4. **An toàn bảo mật (Anticheat Compliance)**: 100% không vi phạm Điều khoản dịch vụ (ToS) của nhà phát hành (Riot Vanguard, Valve VAC, Garena Security Engine, Tencent Anti-Cheat).

### 4 Giai đoạn vòng đời trận đấu được chuẩn hóa:
- **Pre-Match (Trước trận / Chuẩn bị phòng)**: Tạo phòng đấu, nạp danh sách 2 đội, kiểm tra trọng tài vào ghế khán giả.
- **Ban/Pick (Cấm & Chọn)**: Lượt cấm tướng/đặc vụ, lượt chọn nhấp nháy, thời gian đếm ngược và khóa chính thức.
- **In-Game (Trong trận đấu)**: Tỉ số mạng, thời gian trận, mục tiêu lớn (Rồng/Baron/Trụ), trạng thái sống/chết, kinh tế/vàng, bom Spike, vòng bo sinh tồn.
- **Post-Match (Kết thúc trận)**: Xác định đội thắng cuộc, bảng tổng kết điểm số, thống kê MVP, bảng xếp hạng 12 đội (Free Fire).

---

## 2. BẢNG MA TRẬN KẾT NỐI REAL-TIME TOÀN DIỆN CHO 7 TỰA GAME

Bảng dưới đây thống kê chi tiết toàn bộ 7 tựa game qua 4 giai đoạn thi đấu:

| Tựa Game & Thể Loại | Giai Đoạn Trận Đấu | Phương Thức Ưu Tiên 1 (Tối Ưu & Nhanh Nhất) | Phương Thức Dự Phòng (Ưu Tiên 2 - Fallback) | Giao Thức / Công Nghệ | Độ Trễ Dự Kiến | An Toàn Anticheat | Tự Động Hóa |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Liên Minh Huyền Thoại (LoL)**<br>*PC - MOBA (5v5)* | **Pre-Match** | Riot Tournament Code API (v5) | LCU Local REST API (`/lol-lobby`) | HTTPS / LCU REST | < 100 ms | Tuyệt đối (Official API) | 100% |
| | **Ban/Pick** | LCU WebSocket Event (`lol-champ-select`) | LCU Polling REST (10 Hz) | WSS (`wss://127.0.0.1:<port>`) | **< 10 ms** | Tuyệt đối (Official API) | 100% |
| | **In-Game** | LiveClientData In-Game Stream (Port 2999) | Direct3D 11 Desktop Duplication OCR | Local HTTPS (`port 2999`) | **< 50 ms** | Tuyệt đối (Official API) | 100% |
| | **Post-Match** | Tournament Webhook Callback | LiveClientData EndGame Event | Webhook POST / HTTPS | < 200 ms | Tuyệt đối (Official API) | 100% |
| **2. VALORANT**<br>*PC - Tactical Shooter (5v5)* | **Pre-Match** | Local Riot Client Party API | Spectator Lobby Auto-Attach | Local REST HTTPS | < 100 ms | Tuyệt đối (Official Client) | 100% |
| | **Ban/Pick** | Local Pregame API (`/pregame/v1`) | Direct3D 11 60 FPS Agent OCR | Local HTTPS / D3D11 Capture | **< 30 ms** | Tuyệt đối (Official Client) | 100% |
| | **In-Game** | Direct3D 11 High-FPS HUD OCR (60 FPS) | Overwolf Game Events Provider (GEP) | D3D11 DDA + CNN Tensor | **< 40 ms** | Tuyệt đối (Screen Layer) | 100% |
| | **Post-Match** | Core-Game Match Details API | Direct3D Post-Match Screen OCR | Local HTTPS / D3D11 Capture | < 500 ms | Tuyệt đối (Official Client) | 100% |
| **3. Dota 2**<br>*PC - MOBA (5v5)*<br>*(Chuẩn tham chiếu Valve)* | **Pre-Match** | Native Game State Integration (GSI) | Khởi tạo phòng tùy chọn thủ công | HTTP JSON Push (`/dota2gsi`) | < 10 ms | Tuyệt đối (Valve GSI) | 100% |
| | **Ban/Pick** | Native GSI (`draft` payload) | Nhập tay trên bàn cứu hộ | HTTP JSON Push (`/dota2gsi`) | **< 5 ms** | Tuyệt đối (Valve GSI) | 100% |
| | **In-Game** | Native GSI (`map`, `hero`, `player`) | Quét màn hình OBS Window Capture | HTTP JSON Push (20 Hz) | **< 5 ms** | Tuyệt đối (Valve GSI) | 100% |
| | **Post-Match** | Native GSI (`map.win_team`) | Bảng tổng kết Web API | HTTP JSON Push | < 5 ms | Tuyệt đối (Valve GSI) | 100% |
| **4. Counter-Strike 2 (CS2)**<br>*PC - Tactical FPS (5v5)*<br>*(Chuẩn tham chiếu Valve)* | **Pre-Match** | Native Game State Integration (GSI) | Khởi tạo phòng tùy chọn thủ công | HTTP JSON Push (`/cs2gsi`) | < 10 ms | Tuyệt đối (Valve GSI) | 100% |
| | **Ban/Pick** | Map Ban/Pick qua GSI Event | Chọn Map thủ công trên Sổ tay | HTTP JSON Push / Webhook | < 10 ms | Tuyệt đối (Valve GSI) | 100% |
| | **In-Game** | Native GSI (`round`, `allplayers`) | DirectShow HUD Reader | HTTP JSON Push (50 Hz) | **< 5 ms** | Tuyệt đối (Valve GSI) | 100% |
| | **Post-Match** | Native GSI (`round.win_team`) | End-Game Scoreboard OCR | HTTP JSON Push | < 5 ms | Tuyệt đối (Valve GSI) | 100% |
| **5. Liên Quân Mobile (AoV)**<br>*Mobile - MOBA (5v5)* | **Pre-Match** | Trọng tài Ảo (Bot Container) nhập Room ID | Cắm dây HDMI Capture từ điện thoại | ADB Socket / DirectShow UVC | < 1.0 s | An toàn 100% (No game mod) | 95% |
| | **Ban/Pick** | Thị giác máy tính GPU (CUDA Template Match) | Kỹ thuật viên sửa trên Bàn cứu hộ | CUDA NCC / ONNX MobileNetV4 | **< 100 ms** | An toàn 100% (Screen Layer) | 98% |
| | **In-Game** | Deep Digit CNN OCR quét HUD Top Bar | Quét định kỳ 2 giây/lần | DirectX DDA + CNN Tensor | **< 100 ms** | An toàn 100% (Screen Layer) | 99% |
| | **Post-Match** | Quét màn hình Tổng kết MVP & KDA | Bấm xác nhận 1 chạm trên Bàn cứu hộ | Batch PP-OCRv4 GPU Engine | < 1.0 s | An toàn 100% (Screen Layer) | 95% |
| **6. LoL: Wild Rift (Tốc Chiến)**<br>*Mobile - MOBA (5v5)* | **Pre-Match** | Trọng tài Ảo (Bot Container) nhập Room ID | Cắm dây HDMI Capture từ điện thoại | ADB Socket / DirectShow UVC | < 1.0 s | An toàn 100% (No game mod) | 95% |
| | **Ban/Pick** | Thị giác máy tính GPU (CUDA Template Match) | Kỹ thuật viên sửa trên Bàn cứu hộ | CUDA NCC / ONNX MobileNetV4 | **< 100 ms** | An toàn 100% (Screen Layer) | 98% |
| | **In-Game** | Deep Digit CNN OCR quét HUD (Kills/Gold) | Quét định kỳ 1 giây/lần | DirectX DDA + CNN Tensor | **< 100 ms** | An toàn 100% (Screen Layer) | 99% |
| | **Post-Match** | Quét màn hình Thống kê Cuối trận | Bấm xác nhận 1 chạm trên Bàn cứu hộ | Batch PP-OCRv4 GPU Engine | < 1.0 s | An toàn 100% (Screen Layer) | 95% |
| **7. Free Fire**<br>*Mobile - Battle Royale (12 Đội - 48 Người)* | **Pre-Match** | Trọng tài Ảo tự vào slot Quan Sát (48) | Cắm dây truyền hình ảnh điện thoại | ADB Socket / DirectShow UVC | < 1.5 s | An toàn 100% (No game mod) | 95% |
| | **Ban/Pick** | Chọn Bản đồ thi đấu (Map Selection) | Nạp sẵn từ Lịch thi đấu (Skill 04) | Trạng thái phòng / UI Event | < 100 ms | An toàn 100% | 100% |
| | **In-Game** | Quét danh sách 12 Đội & Vùng Killfeed | Quét số người sống sót (Alive Count) | OpenCV Contour + Status Mask | **< 150 ms** | An toàn 100% (Screen Layer) | 95% |
| | **Post-Match** | **Bóc tách Tự động Bảng Xếp hạng 12 Đội** | **Sửa nhanh trên Bàn cứu hộ 1-Giây** | **Batch PP-OCRv4 + Fuzzy Match** | **< 650 ms** | An toàn 100% (Đạt chuẩn < 2s) | **99%** |

---

## 3. PHÂN TÍCH LỘ TRÌNH DỰ PHÒNG TỪNG TỰA GAME (FALLBACK TREES)

Hệ thống triển khai cây logic dự phòng (Fallback Tree) đa tầng. Khi một kênh giao tiếp gặp sự cố, luồng phát sóng tự động chuyển dịch sang kênh dự phòng trong chưa đầy 100 mili-giây mà không làm gián đoạn buổi phát trực tiếp.

```
                           CÂY LOGIC DỰ PHÒNG (FALLBACK DECISION TREE)
                                                |
        +---------------------------------------+---------------------------------------+
        |                                                                               |
        v (NHÓM GAME PC)                                                                v (NHÓM GAME MOBILE)
[Kênh 1: Local API / LCU / GSI]                                         [Kênh 1: Trọng tài Ảo (Bot Container)]
        |                                                                               |
        +-- (Mất kết nối > 1500ms)                                                      +-- (Lỗi Container / Đơ giả lập)
        v                                                                               v
[Kênh 2: Direct3D 11 Screen OCR (60 FPS)]                               [Kênh 2: Cáp HDMI UVC / Type-C Scrcpy]
        |                                                                               |
        +-- (Chớp màn hình / Game Crash)                                                +-- (Camera rung mờ / Mạng giật)
        v                                                                               v
[Kênh 3: Freeze Frame Buffer (Giữ nguyên tỉ số)]                        [Kênh 3: Freeze Frame Buffer (Giữ nguyên điểm)]
        |                                                                               |
        v (Kỹ thuật viên can thiệp)                                                     v (Kỹ thuật viên can thiệp)
[CHỐT CHẶN: BÀN CỨU HỘ 1 GIÂY (F1 - F4, is_manual_locked)]              [CHỐT CHẶN: BÀN CỨU HỘ 1 GIÂY (F1 - F4, is_manual_locked)]
```

### 3.1. Phân tích Nhóm Game PC

#### A. Liên Minh Huyền Thoại (LoL)
- **Đường truyền chính**: LCU WSS (Ban/Pick, < 10ms) và LiveClientData HTTPS Port 2999 (In-Game, < 50ms).
- **Lộ trình dự phòng**: Nếu cổng `2999` bị lỗi (ví dụ do thiết lập tường lửa Windows chặn kết nối cục bộ), hệ thống tự động kích hoạt module Direct3D 11 Screen OCR để đọc thanh tỉ số trên màn hình quan sát. Thời gian chuyển đổi: **< 50ms**.
- **Chốt chặn an toàn**: Bộ đệm đóng băng (Freeze Frame) giữ nguyên tỉ số mạng và lượng vàng cuối cùng nếu client bị đóng đột ngột.

#### B. VALORANT
- **Đường truyền chính**: Local Ares REST API (Giai đoạn chọn đặc vụ, < 30ms) và Direct3D 11 Desktop Duplication OCR 60 FPS (In-Game, < 40ms).
- **Lộ trình dự phòng**: Sử dụng sự kiện Overwolf Game Events Provider (GEP) nếu người dùng đã cài sẵn Overwolf trên máy.
- **Chốt chặn an toàn**: Bàn cứu hộ khẩn cấp với phím tắt `Ctrl + P` chuyển sang màn hình Tạm dừng kỹ thuật khi trận đấu có tranh chấp.

#### C. Dota 2 & Counter-Strike 2 (CS2)
- **Đường truyền chính**: Native HTTP JSON Push (GSI) với tần số 20Hz - 50Hz, độ trễ < 5ms.
- **Lộ trình dự phòng**: Nếu file `.cfg` chưa được tạo hoặc cổng HTTP bị xung đột, chuyển sang chế độ đọc màn hình bằng OpenCV DirectShow.

---

### 3.2. Phân tích Nhóm Game Mobile

#### A. Liên Quân Mobile & Tốc Chiến
- **Đường truyền chính**: Chế độ A - Trọng tài Ảo (Spectator Bot Container) xuất khung hình trực tiếp qua VRAM DMA-BUF (< 3ms), kết hợp bộ nhận diện tướng GPU CUDA (< 100ms).
- **Lộ trình dự phòng**: Chế độ B - Trọng tài thực tế cắm cáp HDMI qua card capture UVC hoặc cáp Type-C Scrcpy. Module chuẩn hóa tọa độ tự động bù trừ viền đen và tai thỏ.
- **Chốt chặn an toàn**: Nếu hai tuyển thủ hoán đổi tướng ở 1 giây cuối, kỹ thuật viên bấm nút **Đảo Tướng 1 Chạm** trên giao diện Bàn Cứu Hộ để sửa tức thì trong < 50ms.

#### B. Free Fire (Sinh Tồn 12 Đội)
- **Đường truyền chính**: Bộ bóc tách siêu tốc **Batch PP-OCRv4 Mobile GPU + Deep Digit CNN + Fuzzy Matching** bóc tách bảng xếp hạng 12 đội trong chưa đầy **650 mili-giây** ngay khi xuất hiện chữ "BOOYAH!".
- **Lộ trình dự phòng**: Nếu màn hình cuối trận bị tuyển thủ bấm bỏ qua quá nhanh, hệ thống trích xuất lại khung hình sắc nét nhất từ bộ đệm trượt 10 frame (Sliding Buffer).
- **Chốt chặn an toàn**: Kết quả 12 đội hiển thị ngay trên bảng kiểm duyệt của Bàn Cứu Hộ. Kỹ thuật viên chỉ cần liếc mắt xác nhận trong 1 giây là bảng xếp hạng tổng điểm tự động phát sóng lên livestream.

---

## 4. CƠ CHẾ CHUYỂN MẠCH TỰ ĐỘNG KHI GẶP SỰ CỐ (AUTOMATED RESILIENCE LOGIC)

Hệ thống vận hành theo cỗ máy trạng thái kết nối thông minh (Connection State Machine):

1. **Chu kỳ kiểm tra nhịp tim (Heartbeat Interval)**: Mỗi 500ms gửi gói kiểm tra đường truyền (`ping/health`).
2. **Ngưỡng cảnh báo dữ liệu cũ (Stale Threshold - 1500ms)**:
   - Nếu sau 1500ms không nhận được gói tin telemetry mới: Bật cảnh báo vàng `STALE_WARNING` trên thanh điều khiển.
   - Kích hoạt cơ chế **Freeze Frame Buffer**: Cố định 100% đồ họa trên màn hình livestream, tuyệt đối không nhảy số về 0.
3. **Ngưỡng rớt kết nối cứng (Hard Disconnect Threshold - 3000ms)**:
   - Nếu mất tín hiệu vượt quá 3000ms: Tự động kích hoạt luồng kết nối lại ngầm (Exponential Backoff: 500ms -> 1000ms -> 2000ms -> 4000ms).
   - Tự động chuyển nguồn dữ liệu sang Kênh Dự Phòng 2.
4. **Cơ chế Khóa Trường Sửa Tay (`is_manual_locked`)**:
   - Khi kỹ thuật viên can thiệp sửa một thông số bất kỳ (ví dụ: cộng 1 mạng bằng phím `F1`):
   - Trường dữ liệu đó được đóng dấu `is_manual_locked = true`.
   - Mọi dữ liệu tự động gửi về sau đó từ game sẽ **bị bỏ qua** đối với riêng trường này, bảo vệ quyền can thiệp tối cao của người vận hành.
   - Nút `Mở Khóa Tự Động` trên giao diện cho phép khôi phục lại đồng bộ máy bất kỳ lúc nào.

---

## 5. BẢNG TRA CỨU NHANH DÀNH CHO KỸ THUẬT VIÊN VẬN HÀNH ("ANH NAM")

| Tựa Game Bạn Muốn Phát | Thao Tác Cần Làm Lúc Mở Đầu | Chế Độ Khuyên Dùng | Thời Gian Chờ Kết Nối |
| :--- | :--- | :--- | :--- |
| **Liên Minh Huyền Thoại** | Mở Client LoL -> Dán mã Tournament Code hoặc mở trận đấu tùy chọn | **Tự động bắt qua Lockfile** | **0.1 Giây** (Chữ xanh [ĐÃ KẾT NỐI]) |
| **VALORANT** | Mở Riot Client -> Vào phòng Custom Game ngồi ghế Spectator | **Tự động bắt qua Riot Client + Màn hình** | **0.2 Giây** |
| **Dota 2 / CS2** | Copy 1 file `.cfg` vào thư mục game -> Mở game xem | **Valve GSI tự động đẩy dữ liệu** | **Tức thời (0 Giây)** |
| **Liên Quân Mobile** | Gõ `ID Phòng: 889922` + `Mật khẩu: 1234` | **Trọng tài Ảo (Tự động vào ghế khán giả)** | **0.5 - 1.0 Giây** |
| **Tốc Chiến** | Gõ `ID Phòng` + `Mật khẩu` (hoặc cắm cáp HDMI từ máy trọng tài) | **Trọng tài Ảo HOẶC Cắm Cáp UVC** | **0.5 Giây** |
| **Free Fire (12 Đội)** | Gõ `ID Phòng` + Mời tài khoản bot vào slot Quan Sát phòng 48 | **Trọng tài Ảo + OCR Tự Động 12 Đội** | **1.0 Giây** |
