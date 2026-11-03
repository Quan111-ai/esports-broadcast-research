# LUỒNG CHÍNH THỐNG 100% CỦA GAME LIÊN MINH HUYỀN THOẠI (RIOT OFFICIAL PIPELINE)
*(Giải mã toàn bộ hệ thống API chính thống của Riot Games: Cái nào cần nộp hồ sơ xin duyệt, cái nào mở sẵn trong bộ cài game để code chạy thật ngay lập tức)*

---

## 1. GIẢI ĐÁP THẮC MẮC: "PHẢI XIN API CỦA RIOT ĐÚNG KHÔNG?"

**Đúng một nửa — và nửa còn lại là tin cực vui cho Dev!**
Trong hệ sinh thái chính thống của Riot Games dành cho Liên Minh Huyền Thoại (LoL), Riot chia làm **2 nhóm API chính thức**:

### Nhóm 1: API Đám Mây trên Web (`Riot Tournament API v5` tại `developer.riotgames.com`) -> PHẢI XIN DUYỆT
- **Dùng để làm gì?**:
  - Chỉ dùng cho đúng 2 việc ở ngoài trận đấu:
    1. Gọi lên máy chủ Riot để sinh ra dòng **Mã Phòng Giải Đấu (`Tournament Code`)** gửi cho 10 người chơi dán vào game là tự bay vào phòng.
    2. Khi hết trận, máy chủ Riot tự gửi bảng thống kê kết quả cuối trận về máy chủ web của bạn.
- **Điều kiện để xin Riot duyệt (`Production Tournament Key`)**:
  - Bạn vào `https://developer.riotgames.com/` đăng nhập tài khoản Riot:
    * **Development Key**: Cấp ngay lập tức trong 10 giây (nhưng 24 tiếng phải bấm làm mới 1 lần, và chỉ gọi được cổng giả lập `tournament-stub`).
    * **Production Key (Có quyền tạo Tournament Code thật)**: Bạn phải bấm *Register Product* và **Riot bắt buộc bạn phải có sẵn bản phần mềm chạy thử (MVP/Prototype)** để họ kiểm tra xem ứng dụng của bạn có thật không rồi mới duyệt (thường mất 5 - 14 ngày).

### Nhóm 2: 4 Bộ API Chính Thống Mở Sẵn Ngay Trong Bộ Cài Game LoL Trên Máy Tính -> KHÔNG CẦN XIN PHÉP, CHẠY NGAY 100%!
Đây mới là "trái tim" của mọi phần mềm Livestream giải đấu LoL trên thế giới (như *League Broadcast*, *LHM.gg*, *League Director* của chính Riot):
- Riot **đã mở sẵn 4 bộ API chính thống ngay bên trong trò chơi trên máy tính Windows** (không cần API Key trên web, không giới hạn số lần gọi, không cần đợi ai duyệt):
  1. **`LCU API` (League Client Update API)**: Điều khiển sảnh chờ, tự động tạo phòng đấu giải và đọc **100% quá trình Cấm/Chọn (Ban/Pick)** theo thời gian thực (0.01 giây).
  2. **`Live Client Data API` (`https://127.0.0.1:2999/liveclientdata/`)**: Đọc **100% thông số trong trận đấu** trên máy Trọng tài (Spectator) theo thời gian thực (Mạng, КDA, Trang bị 10 người, Rồng, Sứ giả, Baron).
  3. **`Replay / Spectator Director API` (`https://127.0.0.1:2999/replay/`)**: Điều khiển **Ống kính Tổng quan của Trọng tài (Camera Position / Follow Player 1..10)** và ẩn/hiện các khung giao diện mặc định của game.
  4. **`Data Dragon` & `CommunityDragon`**: Kho tải tự động toàn bộ ảnh tướng, ảnh trang phục, ảnh kỹ năng, trang bị chính hãng của Riot theo từng phiên bản mới nhất.

---

## 2. LUỒNG CHÍNH THỐNG 5 BƯỚC CỦA GAME LOL (ĐỂ ĐI ĐƯỜNG KHÓ TRƯỚC NGAY HÔM NAY)

Nếu bạn muốn "đi đường khó trước" (tức là làm thẳng phần lõi kỹ thuật bắt dữ liệu thật và điều khiển camera thật từ cửa sổ game LoL trên máy tính), đây là **5 bước kỹ thuật chính thống** theo đúng thứ tự:

### BƯỚC 1: Tự động bắt vào `LCU API` (Cửa sổ Sảnh chờ & Phòng đấu LoL)
- **Cơ chế kỹ thuật**:
  - Khi người dùng mở bảng **League of Legends Client** trên Windows, trò chơi tự sinh ra file `lockfile` tại thư mục cài game (hoặc đọc từ tiến trình `LeagueClientUx.exe` qua lệnh `wmic` / `Get-CimInstance`).
  - Nội dung file `lockfile` có dạng: `LeagueClient:12345:54321:password123:https` (Trong đó `54321` là cổng Port, `password123` là mật khẩu xác thực Basic Auth `riot:password123`).
- **Phần mềm của bạn làm gì ở Bước 1?**:
  - Tự động đọc `Port` và `Password` này -> Mở kết nối **WebSocket (`wss://127.0.0.1:{port}/`)**.
  - Gọi hàm chính thống `POST /lol-lobby/v2/lobby` (với `queueId` Custom Tournament Draft 5v5) để **tự động tạo Phòng Đấu Giải 5v5** ngay trên máy Trọng tài (và khi nào bạn xin xong `Tournament API Key` của Riot thì chỉ cần thêm 1 dòng gọi `POST /lol/tournament/v5/codes` là có luôn Mã Giải Đấu!).

### BƯỚC 2: Bắt Cấm / Chọn (Ban / Pick) Real-time 0.01 giây qua `LCU WebSocket`
- **Cơ chế kỹ thuật**:
  - Khi phòng đấu bước vào giai đoạn Cấm/Chọn, `LCU WebSocket` bắn liên tục sự kiện `/lol-champ-select/v1/session`.
- **Dữ liệu JSON chính thống trả về**:
  - `myTeam` (5 vị trí Đội Xanh) và `theirTeam` (5 vị trí Đội Đỏ): Biết chính xác từng vị trí (`cellId` từ 0 đến 9), tên người chơi, vị trí đi đường (`assignedPosition`), phép bổ trợ (`spell1Id`, `spell2Id`), tướng đang chọn.
  - `actions`: Toàn bộ các lượt **Cấm (Ban)** và **Chọn (Pick)** đang nhấp nháy (`inProgress: true`) hay đã khóa (`completed: true`), kèm lúc 2 tuyển thủ **Đổi tướng cho nhau (Swap)**!
  - `timer`: Thời gian đếm ngược của từng lượt suy nghĩ tính bằng mili-giây (`adjustedTimeLeftInPhase`).

### BƯỚC 3: Đọc Thông Số Trong Trận Đấu qua `Live Client Data API` (`127.0.0.1:2999`)
- **Cơ chế kỹ thuật**:
  - Khi máy Trọng tài (Spectator) tải xong bản đồ vào trận, cửa sổ `League of Legends.exe` tự mở cổng `https://127.0.0.1:2999/liveclientdata/allgamedata`.
- **Dữ liệu JSON chính thống trả về mỗi 0.1 giây**:
  - `gameData.gameTime`: Thời gian chính xác của trận đấu đang chiếu trên màn hình Trọng tài.
  - `allPlayers`: Danh sách 10 người chơi (5 người `ORDER` - Đội Xanh, 5 người `CHAOS` - Đội Đỏ) kèm:
    * Tên tướng (`championName`), Cấp độ (`level`), Trạng thái chết (`isDead`) và số giây hồi sinh (`respawnTimer`).
    * Chỉ số `scores`: `kills`, `deaths`, `assists`, `creepScore` (chỉ số lính), `wardScore`.
    * Túi đồ 6 ô (`items`): Mã món đồ, tên món đồ, giá tiền (từ đó tính ra chính xác giá trị trang bị / lượng vàng của từng vị trí và chênh lệch vàng giữa 2 đội!).
  - `events.Events`: Danh sách mọi sự kiện kèm mốc thời gian (`EventTime`):
    * Ai vừa giết ai (`ChampionKill`: `KillerName`, `VictimName`, `Assisters`), chuỗi hạ gục (`Multikill`: Double/Triple/Quadra/Penta Kill), Quét sạch (`Ace`).
    * Mục tiêu lớn: `DragonKill` (`DragonType`: Fire, Earth, Water, Air, Hextech, Chemtech, Elder), `HeraldKill`, `BaronKill` (dùng để bật ngay đồng hồ đếm ngược **Baron Power Play 180 giây**!), `TurretKilled`, `InhibKilled`, `GameEnd`.

### BƯỚC 4: Điều khiển Ống Kính Tổng Quan Trọng Tài & AI Soi Minimap (`Replay / Camera API` + Phím Tắt Trọng Tài)
- **Cơ chế kỹ thuật chính thống của Riot**:
  1. Trong file `C:\Riot Games\League of Legends\Config\game.cfg` trên máy Trọng tài, phần mềm tự động bật dòng `EnableReplayApi=1`.
  2. Lúc này, cổng `https://127.0.0.1:2999/replay/render` mở ra cho phép phần mềm của bạn:
     - Ẩn các bảng giao diện thừa của Spectator (`interfaceScoreboard`, `interfaceChat`, `interfaceFrames`) để nhường chỗ cho bộ khung Đồ họa Giải đấu của bạn.
     - Đọc và điều khiển tọa độ Ống kính Tổng quan (`cameraPosition`, `cameraMode`, `selectionName`).
  3. Kết hợp với bộ phím điều khiển Spectator chuẩn của LoL:
     - Chọn 5 vị trí Đội Xanh (Top, Jungle, Mid, ADC, Sup): Phím `1`, `2`, `3`, `4`, `5`.
     - Chọn 5 vị trí Đội Đỏ (Top, Jungle, Mid, ADC, Sup): Phím `Q`, `W`, `E`, `R`, `T`.
     - Bật Camera Đạo diễn tự động (`Directed Camera`): Phím `D`.
     - Tua lại xem pha quay chậm 15 giây trước (`Instant Replay` ngay trong Spectator của LoL): Phím `BackSpace` (hoặc gọi `POST /replay/playback` lùi `time` lại 15 giây!).

---

## 3. LỘ TRÌNH "ĐI ĐƯỜNG KHÓ TRƯỚC" (LÀM NGAY PHẦN LÕI KẾT NỐI GAME LOL THẬT)

Vì cả 4 bước kỹ thuật khó nhất ở trên (`LCU API` + `Live Client API 2999` + `Spectator Camera & Replay API` + `Data Dragon`) đều **mở sẵn 100% trên máy tính không cần đợi xin phép**, chúng ta nên đi theo đúng thứ tự này:

1. **Chặng 1 (Khó nhất - Làm đầu tiên)**: Viết **Bộ Lõi Kết Nối LoL (`LoL Official Connector`)** chạy trên máy Windows của bạn:
   - Tự tìm tiến trình LoL đang mở -> Tự đọc `lockfile` -> Bắt trực tiếp gói tin Cấm/Chọn (`LCU WebSocket`).
   - Tự kết nối cổng `127.0.0.1:2999` khi vào trận -> Đọc toàn bộ 10 vị trí, KDA, Vàng, Rồng, Baron Power Play.
   - Tự gửi lệnh điều khiển Ống kính Tổng quan (`1..5`, `Q..T`, `Replay API`) để nhảy camera giữa 10 vị trí.
2. **Chặng 2**: Dựng **Bàn Điều Khiển iPad (Qua Web nội bộ) + Màn hình Đồ họa Cấm/Chọn & Trong trận chuẩn LCK** nối trực tiếp vào Bộ Lõi ở Chặng 1.
3. **Chặng 3**: Đem chính sản phẩm đã chạy mượt ở Chặng 1 + Chặng 2 nộp lên `developer.riotgames.com` để lấy thêm **`Production Tournament API Key`** (tự sinh mã `Tournament Code`).
