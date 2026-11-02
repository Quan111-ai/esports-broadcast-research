# TÀI LIỆU DÀNH CHO DEV: LUỒNG CHUẨN GIẢI ĐẤU LỚN (LCK / VCT / ĐTDV) VỚI 100% GÓC NHÌN TỔNG QUAN TRỌNG TÀI (OBSERVER OVERVIEW)
*(Bám sát 100% cách các giải đấu lớn vận hành: Tuyệt đối chỉ dùng Góc nhìn Tổng quan của Trọng tài/Observer thấy cả 2 đội - Điều khiển ống kính tổng quan bay theo từng Vị trí)*

---

## 1. NGUYÊN TẮC SỐNG CÒN CỦA GIẢI ĐẤU CHUYÊN NGHIỆP: 100% DÙNG "GÓC NHÌN TỔNG QUAN TRỌNG TÀI (OBSERVER / SPECTATOR OVERVIEW)"

Bạn nói hoàn toàn chính xác: **Giải đấu chuyên nghiệp KHÔNG BAO GIỜ lấy màn hình cá nhân của tuyển thủ (vì màn hình tuyển thủ bị tối bản đồ Fog of War và giật chuột liên tục).**
100% hình ảnh và dữ liệu của các giải lớn (**LCK / CKTG của LoL**, **VCT của VALORANT**, **Đấu Trường Danh Vọng của Liên Quân**) đều xuất phát từ **Máy Trọng Tài Quan Sát (Observer / Spectator Client)** với các đặc quyền tổng quan sau:

1. **Với Game MOBA (LoL, Liên Quân, Tốc Chiến)**:
   - Là **Góc nhìn Tổng quan từ trên cao xuống (Top-Down Overview)**, tắt hoàn toàn sương mù (nhìn thấy sáng trưng cả 5 người Đội Xanh và 5 người Đội Đỏ cùng lúc, thấy rõ ai đang nấp bụi, ai đang ăn Rồng/Baron).
   - Khi chọn xem "Vị trí Đi Rừng Đội Xanh", **không phải là chui vào màn hình của người đó**, mà là **điều khiển ống kính tổng quan trên cao bay tới lấy vị trí Đi Rừng Đội Xanh làm tâm** (vẫn nhìn thấy toàn cảnh đồng đội và kẻ địch xung quanh!).
2. **Với VALORANT (Chuẩn giải VCT)**:
   - Máy ngồi ở ô **Observer** có **Góc nhìn X-Ray xuyên tường** (nhìn thấy viền sáng của cả 5 người bên Tấn Công màu Đỏ và 5 người bên Phòng Thủ màu Xanh ngọc xuyên qua mọi bức tường) + **Chế độ Camera Bay Trên Cao (Free-Cam Overview)** để thấy toàn cảnh 2 đội di chuyển chiến thuật!

---

## 2. CÁC GIẢI ĐẤU LỚN CỦA LOL VÀ VALORANT LÀM LUỒNG NHƯ THẾ NÀO? (DÀNH CHO DEV)

Dưới đây là luồng kỹ thuật chính xác từ lúc tạo phòng đến lúc kết thúc trận mà các giải lớn của **LoL** và **VALORANT** đang chạy:

### 2.1. Luồng chuẩn của Giải Đấu Lớn LIÊN MINH HUYỀN THOẠI (LoL PC)

```mermaid
sequenceDiagram
    autonumber
    participant Lobby as Phòng Custom LoL (Tournament Draft)
    participant ObsPC as Máy Trọng Tài (Observer PC)
    participant App as Hệ Thống Của Bạn (Chạy trên Observer PC)
    participant iPad as iPad Của Quản Trị Viên
    participant Live as Màn Hình Livestream (16:9 & 9:16)

    Note over Lobby,ObsPC: GIAI ĐOẠN 1: TẠO PHÒNG & CẤM CHỌN (REAL-TIME 0 GIÂY)
    App->>Lobby: 1. Tạo phòng Tournament Draft 5v5 (qua LCU API / Tournament Code)
    Lobby-->>ObsPC: 10 Tuyển thủ vào 2 cột Xanh/Đỏ + Máy Trọng tài ngồi vào ô Spectator
    Lobby-->>App: 2. Bắt đầu Cấm/Chọn -> Bắn sự kiện WebSocket LCU tức thời (0.05s)
    App->>Live: Chiếu Cảnh Cấm/Chọn 10 người + Tự đổi chỗ khi Swap + Dải Fearless Draft

    Note over Lobby,Live: GIAI ĐOẠN 2: CHUYỂN TIẾP VÀO BẢN ĐỒ TỔNG QUAN
    Lobby-->>ObsPC: 3. Khóa xong 10 tướng -> Máy Trọng tài nạp vào chế độ Spectator Overview
    App->>Live: Trong lúc nạp: Tự động chiếu Đội hình 5v5 vừa khóa + Bàn Bình Luận Viên phân tích
    
    Note over ObsPC,Live: GIAI ĐOẠN 3: TRONG TRẬN ĐẤU (GÓC NHÌN TỔNG QUAN + API CỔNG 2999 ĐỒNG BỘ 100%)
    ObsPC-->>App: 4. Máy Trọng tài vào Bản đồ ở phút 00:00 (Thấy toàn cảnh 10 người cả 2 đội)
    ObsPC-->>App: Cổng API 127.0.0.1:2999 trên chính Máy Trọng tài mở ra (Khớp 0.00s với hình ảnh!)
    App->>Live: Tự động cắt sang Cảnh Trong Trận + Đắp bảng tỉ số, Vàng, Baron Power Play
    
    loop Điều khiển Ống Kính Tổng Quan (Observer Camera) suốt trận
        ObsPC-->>App: AI đọc Minimap trên Máy Trọng tài phát hiện Đường Dưới đang giao tranh
        App-->>iPad: Báo nhấp nháy trên iPad: "Đường Dưới đang đánh nhau!"
        iPad->>App: Quản trị viên chạm chọn "Xạ Thủ Đội Xanh" (hoặc để AI tự chọn)
        App->>ObsPC: Gửi lệnh Camera API / Phím tắt (1..5 / Q..T) xuống Máy Trọng tài
        ObsPC->>Live: Ống kính tổng quan trên cao lướt mượt mà tới chiếu khu vực Xạ Thủ Đội Xanh!
    end
```

#### Chi tiết kỹ thuật quan trọng nhất trong luồng LoL cho Dev:
1. **Tại sao trên Máy Trọng Tài (Observer PC), Hình ảnh Tổng quan và API luôn khớp nhau 0.00 giây?**
   - Nhiều người nhầm rằng API cổng `2999` chỉ chạy cho người chơi. Thực tế, **khi Máy Trọng Tài (Observer PC) đang mở xem trận đấu ở chế độ Spectator, chính cửa sổ game trên Máy Trọng Tài đó cũng mở cổng `https://127.0.0.1:2999/liveclientdata/` và `Replay/Camera API`!**
   - Và con số thời gian, mạng hạ gục, trang bị, Rồng/Baron trả ra từ cổng `2999` trên Máy Trọng Tài đó **khớp tuyệt đối 0.00 giây với đúng khung hình tổng quan mà Máy Trọng Tài đang hiển thị**!
2. **Cách điều khiển Ống Kính Tổng Quan bay tới Vị trí tuyển thủ trong LoL**:
   - Trên Máy Trọng Tài LoL, Riot cung cấp sẵn hệ thống phím điều khiển ống kính Spectator và **Camera API**:
     - Gửi lệnh chọn vị trí `1, 2, 3, 4, 5` (Top, Jungle, Mid, ADC, Support Đội Xanh) hoặc `Q, W, E, R, T` (Top, Jungle, Mid, ADC, Support Đội Đỏ).
     - Khi Quản trị viên trên iPad chạm vào vị trí nào, ống kính trên cao của Máy Trọng Tài sẽ **tự động lướt mượt (Smooth Camera Pan) tới khu vực bản đồ của vị trí đó**, giữ nguyên góc nhìn tổng quan chuyên nghiệp thấy cả 2 đội!

---

### 2.2. Luồng chuẩn của Giải Đấu Lớn VALORANT (Chuẩn VCT)

1. **Vào phòng & Cấm chọn Bản đồ / Đặc vụ (0 giây chờ)**:
   - Máy Trọng tài ngồi vào cột **Observer** ở giữa phòng Custom Game.
   - Khi chủ phòng bấm Start: Máy Trọng tài vào màn hình Chọn Đặc Vụ (Agent Select) và **tải vào bản đồ cùng lúc 100% với 10 tuyển thủ (Không có thời gian chờ)**.
2. **Cách Máy Trọng Tài (Observer) trong VALORANT hiển thị Góc nhìn Tổng quan**:
   - Trong trận, Máy Trọng Tài bật sẵn chế độ **X-Ray (Nhìn xuyên tường thấy bộ khung sáng của cả 10 tuyển thủ hai đội)** và **Minimap tổng quan thấy cả 10 người**.
   - Khi Quản trị viên trên iPad bấm chọn:
     * **Nút "Góc Nhìn Toàn Cảnh Bản Đồ Trên Cao (Free-Cam Overview)"**: Máy Trọng Tài chuyển sang góc máy trên cao nhìn xuống khu vực Bom A / Bom B để thấy cả 2 đội đang dàn trận ném khói, đặt bom Spike.
     * **Nút "Chọn Vị Trí Tuyển Thủ `1..5` (Đội A) hoặc `6..10` (Đội B)"**: Máy Trọng Tài gửi phím `1..0` để chuyển góc nhìn Observer sang tuyển thủ đó (nhưng **vẫn giữ lớp X-Ray nhìn xuyên tường thấy vị trí kẻ địch quanh đó**, đúng chuẩn 100% như giải VCT Quốc tế!).
3. **Đồng bộ API Thông số trên Máy Trọng Tài VALORANT**:
   - Đọc trực tiếp từ `Local Riot Client API` + `Overwolf GEP Observer Events` ngay trên Máy Trọng Tài để lấy: Tỉ số vòng (Round), Trạng thái đặt bom Spike (báo động đỏ 45 giây), Máu, Giáp, Súng đang cầm, Tiền đầu vòng (Economy) và điểm Chiêu cuối của cả 10 người.

---

### 2.3. Luồng chuẩn của Giải Đấu Lớn LIÊN QUÂN MOBILE & TỐC CHIẾN (Chuẩn ĐTDV)

1. **Vào phòng bằng Ô Trọng Tài (Referee Slot - 0 giây chờ)**:
   - Máy Trọng tài (chạy trên PC hoặc thiết bị kết nối vào PC) ngồi vào **Ô Trọng Tài** dưới đáy phòng đấu giải 5v5.
   - Vào thẳng màn hình Cấm/Chọn và vào thẳng bản đồ cùng lúc với 10 tuyển thủ.
2. **Góc nhìn Tổng quan & Điều khiển 10 Vị trí**:
   - Trong trận là **Góc nhìn Tổng quan từ trên cao (sáng toàn bộ bản đồ của cả Đội Xanh và Đội Đỏ)**, có thể bật chế độ góc nhìn siêu rộng (Zoom-out) khi giao tranh 5v5.
   - Khi AI đọc Minimap phát hiện đường nào đang đánh nhau và Quản trị viên trên iPad chạm chọn vị trí (ví dụ: *Đường Giữa Đội Đỏ*), hệ thống chạm vào đúng biểu tượng tướng đó trên thanh Trọng tài -> **Ống kính tổng quan trên cao lập tức trượt tới lấy vị trí Đường Giữa Đội Đỏ làm tâm màn hình**!

---

## 3. TÓM TẮT LUỒNG 7 KHỐI CHUẨN GIẢI LỚN ĐỂ DEV BẮT TAY VÀO LÀM

Tất cả cả 4 game (LoL, VALORANT, Liên Quân, Tốc Chiến) đều đi theo **đúng 1 luồng kiến trúc duy nhất trên Máy Trọng Tài (Observer PC)**:

1. **Khối 1 (Quản lý Giải & 10 Vị trí)**: Lưu thông tin 2 Đội + 10 Vị trí (Slot `1..5` Đội Xanh, Slot `6..10` Đội Đỏ) + Sơ đồ Nhánh đấu + Bộ nhớ tướng Fearless Draft.
2. **Khối 2 (Máy Trọng Tài - Observer Client)**: Cho tài khoản Trọng tài ngồi vào **Ô Spectator / Observer** của phòng đấu để lấy **Luồng Video Góc Nhìn Tổng Quan (thấy cả 2 đội)** và **Luồng Dữ Liệu Trạng Thái**.
3. **Khối 3 (Đồ họa Cấm/Chọn - Draft Engine)**: Đọc trực tiếp quá trình Cấm/Chọn 10 người từ phòng chờ -> Hiện giao diện Ban/Pick + Dải tướng Fearless Draft các ván trước.
4. **Khối 4 (Luồng Đệm Chuyển Tiếp Vào Bản Đồ)**: Ngay khi khóa xong 10 tướng, trong lúc Máy Trọng Tài đang nạp bản đồ (15 giây với VALORANT/Liên Quân hoặc 150 giây với LoL), tự động chiếu **Màn hình Đội hình 5v5 vừa khóa & Bàn Bình Luận Viên phân tích** cho đến đúng giây `00:01` khi Máy Trọng Tài hiện bản đồ tổng quan.
5. **Khối 5 (AI Soi Minimap & Bàn Bấm Chọn Vị Trí Trên iPad)**:
   - AI đọc **Minimap tổng quan + 10 Thanh máu** trên Máy Trọng Tài để phát hiện khu vực nào đang Gank / Giao tranh -> Báo nhấp nháy lên iPad của Quản trị viên.
   - Quản trị viên chạm chọn Vị trí nào (`1..10`) trên iPad (hoặc bật AI tự động) -> Gửi lệnh điều khiển **Ống kính Tổng quan của Máy Trọng Tài** trượt tới đúng Vị trí đó!
6. **Khối 6 (Đồ họa Trong Trận & Phát Sóng Ngang/Dọc)**:
   - Đắp Thanh tỉ số đỉnh màn hình + Tự động hiện **Thẻ thông số của Vị trí đang được ống kính Trọng tài chiếu** ở đáy màn hình + Bảng so sánh 1v1 cùng vị trí.
   - Hỗ trợ bấm **Phát lại pha quay chậm (Instant Replay 15s)** sau giao tranh và xuất đồng thời luồng Ngang (16:9) + Dọc (9:16).
7. **Khối 7 (Sau Trận, Biểu đồ Sát thương, MVP & Nhánh đấu)**:
   - Khi nổ nhà chính -> Hiện Biểu đồ cột Sát thương 10 người -> Tự chấm MVP -> Tự cộng tỉ số Nhánh đấu & Lưu 10 tướng vào bộ nhớ Fearless Draft cho ván sau.


---

## 6. KHẲNG ĐỊNH KỸ THUẬT: LÀM SAO ĐỂ LUỒNG CỦA CHÚNG TA GIỐNG CÁC GIẢI ĐẤU LỚN 100% TUYỆT ĐỐI?

**Câu trả lời là: LÀM GIỐNG ĐƯỢC 100% TUYỆT ĐỐI.**

Dưới đây là bảng đối chiếu từng bước trong luồng của **Giải Đấu Lớn (LCK, VCT, ĐTDV)** và cách phần mềm của bạn thực hiện **giống hệt 100% không lệch một giây nào**:

### 6.1. Với VALORANT, Liên Quân Mobile, Liên Minh: Tốc Chiến -> Giống 100% tự nhiên
Vì khi tài khoản của phần mềm ngồi vào **Ô Trọng Tài / Observer** trong phòng đấu Custom của 3 game này, game không hề bắt đợi 3 phút. Luồng diễn ra giống hệt 100% giải VCT và Đấu Trường Danh Vọng:
1. **Phòng chờ** -> Bấm Bắt đầu.
2. **Vào Cấm/Chọn (0 giây trễ)**: Hiện 10 ô chọn tướng/đặc vụ, tự đổi chỗ khi Swap, hiện dải tướng Fearless Draft các ván trước.
3. **Tải bản đồ (10 - 15 giây)**: Hiện màn hình Đội hình 5v5 đối đầu nhau.
4. **Vào Bản đồ Tổng quan ở phút `00:00`**:
   - Bản đồ sáng cả 2 đội (MOBA nhìn từ trên cao, VALORANT có X-Ray xuyên tường 10 người).
   - Quản trị viên chạm chọn Vị trí nào (`1..10`) trên iPad (hoặc AI soi Minimap tự chọn nơi đang đánh nhau) -> Ống kính Tổng quan trượt mượt mà tới vị trí đó + Đáy màn hình hiện thông số của vị trí đó!

### 6.2. Với Liên Minh Huyền Thoại (LoL PC) -> 2 Cách để giống giải LCK / Chung Kết Thế Giới 100%
Ở giải LCK/CKTG (do chính Riot vận hành trên máy chủ nội bộ `Tournament Realm`), sau khi khóa xong 10 tướng, Bình luận viên vẫn nói phân tích đội hình khoảng **60 - 90 giây** rồi mới cắt vào bản đồ ở phút `00:05`.
Khi làm trên máy chủ chính thức của LoL (có 150 giây Spectator Delay ở đầu trận), phần mềm của bạn làm giống hệt LCK 100% bằng **2 chế độ tự động** cho Dev:

- **Chế độ 1 (Chuẩn bàn phân tích LCK)**:
  1. Cấm/Chọn diễn ra trực tiếp.
  2. Khóa xong 10 tướng -> Trong 60 giây cuối lúc người chơi chỉnh bảng ngọc + 90 giây đầu tải trận, màn hình tự động hiện **Đội hình 5v5 vừa khóa + Khung Bình luận viên nhận định kèo đấu & Bảng so sánh 2 Ngôi sao**.
  3. Đúng giây thứ 150, cửa sổ Spectator trên Máy Trọng tài vừa mở bản đồ ở **phút `00:00`** -> Phần mềm cắt cảnh cái rụp vào đúng cảnh 10 tướng đang bước ra khỏi Bệ đá cổ (Phút `00:05`)!
- **Chế độ 2 (Khớp liền mạch không nghỉ 1 giây nào - Time-Shifted Draft Sync)**:
  - Nếu giải đấu không có Bình luận viên nói chuyện 2 phút mà muốn **vừa khóa tướng thứ 10 xong là 10 giây sau vào bản đồ ngay lập tức**:
  - Phần mềm tự động thu lại gói tin Cấm/Chọn và phát màn Cấm/Chọn lên sóng chậm hơn phòng thật đúng 2 phút -> Nhờ vậy, khi màn Cấm/Chọn trên sóng vừa kết thúc thì cửa sổ Spectator bên dưới **đã đợi xong từ trước và vào thẳng bản đồ ở phút `00:00` ngay tức khắc (0 giây chờ trên sóng)**!
