# HƯỚNG DẪN KỸ THUẬT CỔNG KẾT NỐI 1 CHẠM VÀ BÀN CỨU HỘ KHẨN CẤP 1 GIÂY

> **Tài liệu kỹ thuật thuộc Module R2 / Milestone 2**  
> **Áp dụng cho**: Cổng kết nối trung tâm, chuẩn hóa dữ liệu đa tựa game (LoL, VALORANT, AoV, Wild Rift, Free Fire) và bàn cứu nguy phát sóng tức thời  
> **Mục tiêu**: Hiện thực hóa quy trình vận hành tối giản 3 Cú Nhấp Chuột ("Chọn Game -> Vào Phòng -> Lên Sóng"), đóng gói dữ liệu trận đấu vào cấu trúc chuẩn `MatchTelemetryEvent`, giám sát nhịp tim đường truyền (500ms) kèm bộ đệm đóng băng (Freeze-Frame Buffer), và cung cấp bàn điều khiển can thiệp khẩn cấp trong 1 giây với phím tắt (F1-F4, Ctrl+P) cùng cơ chế khóa trường dữ liệu (`is_manual_locked`).

---

## 1. TỔNG QUAN VÀ VAI TRÒ TRỤC THẦN KINH TRUNG ƯƠNG

Trong mô hình phòng phát sóng thể thao điện tử tinh gọn một người vận hành (Single-Operator Studio), **Cổng Kết Nối 1 Chạm (Flexible 1-Click Gateway)** và **Bàn Cứu Hộ Khẩn Cấp (Instant Rescue Panel)** đóng vai trò là "Trục thần kinh trung ương":

- **Đầu vào (Ingress từ Skill 01 & Skill 02)**: Tiếp nhận các luồng dữ liệu thô dị thể từ các API cục bộ PC (LCU WebSocket, LiveClientData HTTPS, Ares REST) và luồng nhận diện hình ảnh Mobile (Spectator Bot, Direct UVC GPU OCR).
- **Trục xử lý (Gateway Core)**:
  1. Tự động hóa quá trình nhận diện phòng đấu qua 3 cú nhấp chuột.
  2. Chuẩn hóa mọi biến động dị thể của 3 thể loại game (MOBA, Tactical Shooter, Battle Royale) thành một cấu trúc gói tin thống nhất duy nhất (`MatchTelemetryEvent`).
  3. Duy trì nhịp tim kết nối (Heartbeat 500ms), bảo vệ luồng livestream không bị giật số 0 khi game gặp trục trặc bằng bộ đệm đóng băng (Freeze-Frame Buffer).
  4. Cung cấp bàn phím cứu nguy khẩn cấp cho phép kỹ thuật viên sửa đè dữ liệu sai trong vòng **dưới 1 giây**.
- **Đầu ra (Egress sang Skill 04 & Skill 05)**:
  - Cung cấp dữ liệu kết thúc trận cho **Skill 04** để tự động tính điểm và nhảy nhánh đấu (Tournament DAG Advancer).
  - Bắn luồng dữ liệu 60 FPS trực tiếp vào **Skill 05** để vẽ 6 Cảnh phát sóng (Broadcast Scenes) và phát trực tiếp đa nền tảng (Ngang 16:9 & Dọc 9:16 TikTok).

---

## 2. QUY TRÌNH VẬN HÀNH 3 CÚ NHẤP CHUỘT ("3-CLICK WORKFLOW")

Giao diện được thiết kế để kỹ thuật viên (ví dụ: "Anh Nam") có thể khởi động trọn vẹn một buổi livestream giải đấu chuyên nghiệp chỉ với đúng 3 cú nhấp chuột:

```
+----------------------------------------------------------------------------------------------------+
| CÚ NHẤP 1: CHỌN TỰA GAME THI ĐẤU                                                                    |
|                                                                                                    |
|  [ 1. Liên Minh Huyền Thoại ]   [ 2. VALORANT ]   [ 3. Liên Quân Mobile ]                          |
|  [ 4. LMHT: Tốc Chiến ]         [ 5. Free Fire (Sinh Tồn 12 Đội) ]                                 |
+----------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+----------------------------------------------------------------------------------------------------+
| CÚ NHẤP 2: VÀO PHÒNG ĐẤU (TỰ ĐỘNG BẮT ĐÚNG PHƯƠNG THỨC TỐI ƯU CỦA GAME ĐÓ)                         |
|                                                                                                    |
|  - Đối với PC (LoL, VALORANT):                                                                     |
|    Bấm: [ TỰ ĐỘNG TÌM PHÒNG ĐẤU ĐANG MỞ ]  hoặc Dán: [ MÃ GIẢI ĐẤU TOURNAMENT CODE ]               |
|  - Đối với Mobile (Liên Quân, Tốc Chiến, Free Fire):                                               |
|    Nhập: [ ID Phòng: 889922 ] + [ Pass: 1234 ] -> Bấm: [ MỜI TRỌNG TÀI ẢO VÀO PHÒNG ]             |
|    (Hoặc nếu cắm cáp HDMI/UVC: Bấm [ NHẬN TÍN HIỆU ĐIỆN THOẠI TRỌNG TÀI ])                         |
|                                                                                                    |
|  ==> ĐÈN BÁO TRẠNG THÁI: [ XANH LÁ: ĐÃ KẾT NỐI THÀNH CÔNG TRONG 0.2 GIÂY ]                         |
+----------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+----------------------------------------------------------------------------------------------------+
| CÚ NHẤP 3: LÊN SÓNG PHÁT TRỰC TIẾP (GO LIVE)                                                       |
|                                                                                                    |
|  Bấm nút đỏ lớn: [ BẮT ĐẦU PHÁT SÓNG TOÀN BỘ CÁC NỀN TẢNG ]                                        |
|  - Tự động nạp tên và logo 2 đội từ Sổ tay giải đấu (Skill 04) lên màn hình chờ (Scene 1)         |
|  - Tự động bật luồng mã hóa NVENC đẩy sang YouTube, Facebook (16:9) và TikTok Live (9:16)        |
+----------------------------------------------------------------------------------------------------+
```

### Phân tích chi tiết từng cú nhấp:
1. **Cú nhấp 1 - Chọn Tựa Game**:
   - Khi chọn một tựa game, hệ thống tự động nạp cấu hình `GameProfileSchema` tương ứng và kích hoạt driver chuyên biệt ở tầng nền:
     - Chọn *Liên Minh*: Mở LCU Lockfile Watcher và lắng nghe cổng LiveClientData 2999.
     - Chọn *VALORANT*: Mở Ares Client Lockfile Watcher và kích hoạt Direct3D 11 Desktop Duplication OCR.
     - Chọn *Liên Quân / Tốc Chiến*: Kích hoạt FSM Trọng tài Ảo trong Android Container hoặc bắt luồng DirectShow UVC.
     - Chọn *Free Fire*: Kích hoạt FSM Trọng tài Ảo (vào slot 48) và nạp sẵn mô hình nhận diện bảng xếp hạng 12 đội.
2. **Cú nhấp 2 - Vào Phòng Đấu**:
   - Hệ thống tự động thực hiện tiến trình bắt tay (Handshake).
   - Với PC, quá trình quét PID và kiểm tra cổng mạng hoàn tất trong **< 150ms**.
   - Với Mobile, Trọng tài Ảo tự động nhập mã phòng và ngồi vào ghế Khán giả trong **< 500ms**.
   - Màn hình phản hồi trạng thái: Chuyển sang màu Xanh lá `[ĐÃ KẾT NỐI - ĐỘ TRỄ: 8ms]`.
3. **Cú nhấp 3 - Lên Sóng (Go Live)**:
   - Hệ thống phát tín hiệu kích hoạt đồng bộ sang **Skill 04** (lấy danh sách cặp đấu, logo đội) và **Skill 05** (kết xuất đồ họa và bắt đầu phát sóng).

---

## 3. KIẾN TRÚC BỘ CHUẨN HÓA DỮ LIỆU THỜI GIAN THỰC (UNIFIED NORMALIZED DATA SCHEMA)

Do hệ thống phục vụ đồng thời 3 thể loại game có luật chơi và thuộc tính hoàn toàn khác nhau:
- **MOBA (LoL, AoV, Wild Rift)**: Đội Xanh vs Đội Đỏ, 5v5, trụ, rồng, baron, vàng chênh lệch, cấm/chọn tướng.
- **Tactical Shooter (VALORANT)**: Tấn Công vs Phòng Thủ, 5v5, tỉ số vòng đấu (rounds), đặt/gỡ Spike, máu/giáp/súng.
- **Battle Royale (Free Fire)**: 12 đội (48 người), vòng bo, số người sống sót, đội bị loại (bay màu), điểm hạng + điểm kill.

Hệ thống định nghĩa một phong bì gói tin dữ liệu chuẩn hóa đa hình duy nhất (**Polymorphic Envelope**): `MatchTelemetryEvent`.

```
+----------------------------------------------------------------------------------------------------+
|                                      MatchTelemetryEvent ENVELOPE                                  |
|                                                                                                    |
|  - event_id: string (UUIDv4)                - sequence_id: number (Tăng dần chống đảo gói)         |
|  - timestamp_utc: string (ISO 8601)         - timestamp_game_ms: number (Thời gian trong ván)      |
|  - game_id: "lol" | "valorant" | "lien_quan" | "wild_rift" | "free_fire"                           |
|  - game_genre: "MOBA" | "TACTICAL_SHOOTER" | "BATTLE_ROYALE"                                       |
|  - match_id: string                         - game_number: number (Ván 1, 2, 3...)                 |
|  - phase: "LOBBY" | "BAN_PICK" | "LOADING" | "IN_GAME" | "TECH_PAUSE" | "POST_MATCH"              |
|  - is_paused: boolean                       - metadata: { is_manual_locked: boolean, source: string}|
+----------------------------------------------------------------------------------------------------+
                                                  |
                        +-------------------------+-------------------------+
                        |                         |                         |
                        v                         v                         v
               [ MobaPayload ]        [ TacticalShooterPayload ]    [ BattleRoyalePayload ]
               - Blue/Red Team        - Attacking/Defending Team    - 12 Teams Standings
               - Gold Difference      - Round Score (13-11)         - Alive Teams / Players
               - Towers / Dragons     - Spike Status & Site         - Zone Phase & Killfeed
               - 10 Players State     - 10 Players Loadout          - Elimination Feed
```

### 3.1. Định nghĩa Cấu trúc TypeScript Chuẩn

```typescript
export type GameGenre = 'MOBA' | 'TACTICAL_SHOOTER' | 'BATTLE_ROYALE';

export type SupportedGameId = 
  | 'lol' 
  | 'valorant' 
  | 'lien_quan' 
  | 'wild_rift' 
  | 'free_fire';

export type GamePhase = 
  | 'LOBBY' 
  | 'BAN_PICK' 
  | 'LOADING' 
  | 'IN_GAME' 
  | 'TECH_PAUSE' 
  | 'POST_MATCH' 
  | 'SERIES_ENDED';

export interface PlayerState {
  player_id: string;
  slot_index: number;             // 0-4 (MOBA/FPS), 0-3 (Squad)
  gamertag: string;               // Tên hiển thị trong game
  character_id: string;           // Mã ID tướng / đặc vụ
  character_name: string;         // Tên tướng (Nakroth, Jett, Aatrox...)
  is_alive: boolean;              // Còn sống hay đã chết
  respawn_timer_seconds: number;  // Thời gian đếm ngược hồi sinh (0 nếu sống)
  health_current: number;         // Máu hiện tại
  health_max: number;             // Máu tối đa
  kills: number;                  // Số mạng hạ gục
  deaths: number;                 // Số lần nằm xuống
  assists: number;                // Số lần hỗ trợ
  net_worth: number;              // Lượng vàng / Kinh tế tích lũy
  ultimate_ready: boolean;        // Chiêu cuối sẵn sàng chưa
  items: (string | number)[];     // Danh sách trang bị / súng
  ban_pick_status?: {
    is_picking: boolean;          // Đang tới lượt chọn nhấp nháy
    is_locked: boolean;           // Đã bấm khóa chính thức
    pick_order: number;
  };
}

export interface TeamState {
  team_id: string;
  side: 'BLUE' | 'RED' | 'ATTACKER' | 'DEFENDER' | string;
  name: string;
  short_code: string;
  logo_url: string;
  color_hex: string;
  score: number;                  // Số ván thắng hoặc số vòng thắng
  kills: number;                  // Tổng số mạng hạ gục
  total_gold_or_economy: number;
  roster: PlayerState[];
}

export interface MobaPayload {
  game_time_seconds: number;
  blue_team: TeamState & {
    towers_destroyed: number;
    dragons_killed: number;
    barons_killed: number;
    bans: string[];
  };
  red_team: TeamState & {
    towers_destroyed: number;
    dragons_killed: number;
    barons_killed: number;
    bans: string[];
  };
  gold_difference: number;        // Dương: Xanh dẫn; Âm: Đỏ dẫn
}

export interface TacticalShooterPayload {
  current_round: number;
  round_time_remaining_ms: number;
  round_phase: 'BUY' | 'COMBAT' | 'POST_ROUND';
  attacking_team: TeamState;
  defending_team: TeamState;
  spike_state: 'IDLE' | 'CARRIED' | 'PLANTED' | 'DEFUSING' | 'DETONATED' | 'DEFUSED';
  plant_site?: 'A' | 'B' | 'C';
  defuse_progress_pct: number;    // 0 - 100%
}

export interface BRTeamSummary {
  team_id: string;
  slot_number: number;            // 1 đến 12
  team_name: string;
  team_short_code: string;
  logo_url: string;
  alive_players_count: number;    // 0 đến 4
  is_eliminated: boolean;         // Đã bay màu chưa
  elimination_rank?: number;      // Dừng chân ở Hạng mấy (1 đến 12)
  match_kills: number;            // Số kill trong ván
  placement_points: number;       // Điểm hạng theo quy tắc
  kill_points: number;            // Điểm kill (1 điểm / kill)
  total_match_points: number;     // Tổng điểm ván = Hạng + Kill
  players: PlayerState[];
}

export interface BattleRoyalePayload {
  match_index: number;
  alive_teams_count: number;      // Số đội còn sống (ví dụ 8/12)
  alive_players_count: number;    // Số người còn sống (ví dụ 27/48)
  zone_phase: number;             // Vòng bo co lại số 1 đến 6
  teams: BRTeamSummary[];
}

export interface MatchTelemetryEvent {
  event_id: string;               // UUIDv4
  sequence_id: number;            // Bộ đếm tăng dần
  timestamp_utc: string;          // ISO 8601
  timestamp_game_ms: number;
  game_id: SupportedGameId;
  game_genre: GameGenre;
  match_id: string;
  game_number: number;
  phase: GamePhase;
  is_paused: boolean;
  payload: MobaPayload | TacticalShooterPayload | BattleRoyalePayload;
  metadata: {
    is_manual_locked: boolean;    // Cờ báo hiệu kỹ thuật viên đang sửa tay
    locked_fields?: string[];     // Danh sách các trường bị khóa ghi đè
    source: string;               // Nguồn dữ liệu (LCU, LiveClientData, Bot, OCR)
    confidence_score: number;     // Điểm tin cậy (0.0 đến 1.0)
  };
}
```

---

## 4. CỖ MÁY TRẠNG THÁI KẾT NỐI VÀ BẢO VỆ ĐƯỜNG TRUYỀN (CONNECTION HEALTH STATE MACHINE)

Để đảm bảo buổi phát sóng trực tiếp không bao giờ bị "treo" hay chớp giật màn hình khi trận đấu hoặc mạng gặp sự cố:

```
+--------------+      Bắt đầu dò cổng/bot       +--------------+      Bắt tay thành công      +--------------+
| DISCONNECTED | -----------------------------> |   SCANNING   | ---------------------------> |  CONNECTED   |
+--------------+                                +--------------+                              +--------------+
       ^                                                                                             |
       |                                       Mất gói > 3000ms                                      v
       |                              +----------------------------------+                    +--------------+
       +----------------------------- |           RECONNECTING           | <----------------- |  STREAMING   |
          Vượt quá 5 lần kết nối lại  +----------------------------------+                    +--------------+
                                                      ^                                              |
                                                      | Trễ gói > 1500ms                             | Nhịp tim 500ms
                                                      +------------------- [ STALE_WARNING ] <-------+ (Bình thường)
                                                                            (Bật Freeze-Frame)
```

### 4.1. Quy tắc Giám sát Nhịp tim (Heartbeat Rules)
1. **Chu kỳ gửi gói kiểm tra (Heartbeat Interval)**: Mỗi **500ms**, hệ thống gửi gói thăm dò sức khỏe đường truyền tới client game hoặc module OCR.
2. **Ngưỡng Cảnh báo Dữ liệu Cũ (Stale Warning Threshold - 1500ms)**:
   - Nếu quá **1500ms** không có gói tin telemetry mới:
   - Hệ thống chuyển sang trạng thái `STALE_WARNING` và bật đèn vàng cảnh báo trên thanh điều khiển.
   - **Kích hoạt Bộ đệm Đóng băng (Freeze-Frame Buffer)**: Giữ nguyên 100% tỉ số, tên tướng và thời gian trận đấu trên màn hình livestream. Tuyệt đối không để xảy ra hiện tượng bảng điểm nhảy về 0 hoặc màn hình bị đen.
3. **Ngưỡng Kết nối lại Tự động (Exponential Backoff Reconnect - 3000ms)**:
   - Nếu mất tín hiệu vượt quá **3000ms**, hệ thống chuyển sang `RECONNECTING` và kích hoạt luồng kết nối lại ngầm theo chu kỳ lũy thừa:
     `500ms -> 1000ms -> 2000ms -> 4000ms`.
   - Khi kết nối thành công trở lại, hệ thống gửi yêu cầu `FullStateSnapshotSync` để lấy toàn bộ trạng thái mới nhất, đối chiếu `sequence_id` và tiếp tục luồng phát sóng bình thường.
4. **Phòng ngừa Đảo gói và Gói tin trùng lặp (Sequence Tracking)**:
   - Mọi gói tin mang `sequence_id <= last_received_sequence_id` sẽ tự động bị loại bỏ để tránh tình huống độ trễ mạng làm tỉ số bị nhảy lùi về quá khứ.

---

## 5. BÀN ĐIỀU KHIỂN CỨU HỘ KHẨN CẤP TRONG 1 GIÂY ("NÚT CỨU HỘ")

Trong thể thao điện tử, các sự cố ngoài dự kiến luôn có thể xảy ra:
- Tuyển thủ hoán đổi tướng ở 1 giây cuối cùng trước khi vào trận.
- Trọng tài quyết định hủy 1 mạng hoặc cộng điểm phạt do lỗi máy tính.
- Camera điện thoại bị rung mờ khiến thuật toán OCR đọc nhầm 1 con số.

Bàn Cứu Hộ cho phép người vận hành **can thiệp và sửa đúng con số trong vòng dưới 1 giây** mà khán giả không nhận ra sự cố:

```
+----------------------------------------------------------------------------------------------------+
|                             BÀN CỨU HỘ KHẨN CẤP TRỰC QUAN (RESCUE CONTROL PANEL)                   |
+----------------------------------------------------------------------------------------------------+
| PHÍM TẮT TỐC ĐỘ CAO (HOTKEYS):                                                                     |
| [ F1 ] Xanh +1 Mạng  | [ F3 ] Đỏ +1 Mạng  || [ Ctrl + P ] TẠM DỪNG KỸ THUẬT (BẬT SCENE CHE MÀN HÌNH)|
| [ F2 ] Xanh -1 Mạng  | [ F4 ] Đỏ -1 Mạng  || [ Ctrl + Space ] TẠM DỪNG / TIẾP TỤC ĐẾM GIỜ TRẬN     |
| [ Ctrl + B ] VÀO CẢNH CẤM CHỌN            || [ Ctrl + G ] VÀO CẢNH TRONG TRẬN                      |
+----------------------------------------------------------------------------------------------------+
| ĐỘI XANH (Saigon Phantom)                  | THÔNG SỐ ĐIỀU KHIỂN NHANH      | ĐỘI ĐỎ (Team Flash)         |
| Tỉ số ván: [ 1 ] [ + ] [ - ] [ Khóa Sửa ]  | Vàng Xanh: [ 14.5k ] [ +500 ]  | Tỉ số ván: [ 0 ] [ + ] [ - ]|
| Mạng Đội:  [ 8 ] [ + ] [ - ] [ Khóa Sửa ]  | Vàng Đỏ:   [ 12.1k ] [ +500 ]  | Mạng Đội:  [ 5 ] [ + ] [ - ]|
| Trụ phá:   [ 3 ]     Rồng: [ 2 ]           | Chênh lệch: [ +2.4k Xanh ]     | Trụ phá:   [ 1 ]  Rồng: [ 0]|
+----------------------------------------------------------------------------------------------------+
| ĐẢO TƯỚNG 1 CHẠM (1-CLICK HERO SWAP CHO TÌNH HUỐNG ĐỔI TƯỚNG GIÂY 0):                              |
| Slot 1: [ Bângg (Nakroth) ] <======== NÚT ĐẢO HAI CHIỀU ========> Slot 2: [ Fish (Krixi) ]          |
| Bấm 1 nút -> Hoán đổi vị trí và ảnh chân dung 2 tuyển thủ trên Livestream ngay tức thì (< 50ms)    |
+----------------------------------------------------------------------------------------------------+
| TRẠNG THÁI KHÓA GHI ĐÈ: [ is_manual_locked: BẬT CHO TRƯỜNG "MẠNG ĐỘI XANH" ]                       |
| [ BẤM NÚT NÀY ĐỂ MỞ LẠI TÍNH NĂNG ĐỒNG BỘ TỰ ĐỘNG TỪ GAME (UNLOCK AUTO-SYNC) ]                     |
+----------------------------------------------------------------------------------------------------+
```

### 5.1. Danh mục Phím tắt Vận hành Tốc độ cao (Fast Hotkeys)
- `F1` / `F2`: Tăng / Giảm 1 mạng Đội Xanh (Blue Kills).
- `F3` / `F4`: Tăng / Giảm 1 mạng Đội Đỏ (Red Kills).
- `Ctrl + P`: Kích hoạt ngay lập tức **Cảnh Tạm Dừng Kỹ Thuật (Scene 6)**: Tự động che mờ màn hình game để bảo mật vị trí cắm mắt và chiến thuật của tuyển thủ, phát nhạc chờ giải đấu.
- `Ctrl + Space`: Tạm dừng / Tiếp tục chạy đồng hồ đếm giờ trận đấu.
- `Ctrl + B`: Chuyển nhanh sang Cảnh Cấm Chọn (Ban/Pick Scene).
- `Ctrl + G`: Chuyển nhanh vào Cảnh Trong Trận (In-Game Scene).
- `Ctrl + Enter`: Mở hộp thoại gõ nhanh thông số điểm cho cả hai đội.

### 5.2. Cơ chế Khóa Trường Ghi Đè Thủ Công (`is_manual_locked`)
Để ngăn tình trạng sau khi kỹ thuật viên vừa sửa tay một con số xong, tiến trình tự động lại đọc dữ liệu cũ từ game và ghi đè làm sai số trở lại:
1. Khi người dùng sửa bất kỳ ô thông số nào trên Bàn Cứu Hộ:
   - Hệ thống tự động kích hoạt cờ `is_manual_locked = true` cho riêng trường dữ liệu đó (ví dụ: `locked_fields: ["blue_team.score"]`).
   - Mọi gói tin telemetry tự động gửi về từ game sau đó sẽ **bị bỏ qua đối với riêng trường thông tin đã bị khóa**. Các trường khác (như lượng vàng, thời gian trận, trang bị) vẫn tiếp tục được cập nhật tự động bình thường.
2. Khi sự cố trong game đã được giải quyết hoặc muốn chuyển giao lại toàn quyền cho máy tính:
   - Kỹ thuật viên chỉ cần bấm nút `Mở Khóa Tự Động (Unlock Auto-Sync)`.

### 5.3. Cập nhật Giao diện Lạc quan (Optimistic UI Mutation < 10ms)
Mọi thao tác bấm nút phím tắt hoặc sửa số trên Bàn Cứu Hộ được cập nhật trực tiếp vào bộ nhớ đồ họa cục bộ trong **chưa đầy 10ms**, đảm bảo khung hình livestream kế tiếp (trong chu kỳ 60 FPS = 16.6ms) phản ánh ngay lập tức con số đã sửa mà không có bất kỳ độ trễ nào.

---

## 6. MÃ NGUỒN SẢN XUẤT: BỘ BẮT TAY, CHUẨN HÓA VÀ BÀN CỨU HỘ KHẨN CẤP (PYTHON)

Dưới đây là mã nguồn lõi hiện thực hóa toàn bộ logic của Module R2:

```python
import time
import uuid
from typing import Dict, Any, Optional

class TelemetryNormalizer:
    """Bộ chuẩn hóa dữ liệu đa tựa game sang MatchTelemetryEvent."""
    def __init__(self, match_id: str, game_id: str, game_genre: str):
        self.match_id = match_id
        self.game_id = game_id
        self.game_genre = game_genre
        self.sequence_id = 0
        self.manual_locks = {}  # Lưu trữ các trường bị kỹ thuật viên khóa sửa tay

    def set_manual_lock(self, field_path: str, value: Any):
        """Khóa cứng một trường thông tin do kỹ thuật viên can thiệp bằng tay."""
        self.manual_locks[field_path] = value

    def clear_manual_lock(self, field_path: str):
        """Mở khóa để tiếp tục đồng bộ tự động từ game."""
        if field_path in self.manual_locks:
            del self.manual_locks[field_path]

    def create_event(self, raw_payload: Dict[str, Any], phase: str, source: str) -> Dict[str, Any]:
        """Đóng gói dữ liệu thành gói tin MatchTelemetryEvent chuẩn."""
        self.sequence_id += 1
        
        # Áp dụng các giá trị ghi đè từ Bàn Cứu Hộ nếu có khóa thủ công
        for field, locked_val in self.manual_locks.items():
            self._apply_override(raw_payload, field, locked_val)

        return {
            "event_id": str(uuid.uuid4()),
            "sequence_id": self.sequence_id,
            "timestamp_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "timestamp_game_ms": int(raw_payload.get("game_time_seconds", 0) * 1000),
            "game_id": self.game_id,
            "game_genre": self.game_genre,
            "match_id": self.match_id,
            "game_number": raw_payload.get("game_number", 1),
            "phase": phase,
            "is_paused": raw_payload.get("is_paused", False),
            "payload": raw_payload,
            "metadata": {
                "is_manual_locked": len(self.manual_locks) > 0,
                "locked_fields": list(self.manual_locks.keys()),
                "source": source,
                "confidence_score": raw_payload.get("confidence_score", 1.0)
            }
        }

    def _apply_override(self, payload: dict, path: str, val: Any):
        """Ghi đè giá trị vào cấu trúc dữ liệu theo đường dẫn dấu chấm."""
        keys = path.split(".")
        d = payload
        for k in keys[:-1]:
            if k not in d or not isinstance(d[k], dict):
                d[k] = {}
            d = d[k]
        d[keys[-1]] = val


class ConnectionHealthMonitor:
    """Cỗ máy trạng thái giám sát sức khỏe đường truyền kết nối."""
    def __init__(self, heartbeat_interval_ms=500, stale_threshold_ms=1500, disconnect_threshold_ms=3000):
        self.heartbeat_interval_ms = heartbeat_interval_ms
        self.stale_threshold_ms = stale_threshold_ms
        self.disconnect_threshold_ms = disconnect_threshold_ms
        
        self.state = "DISCONNECTED"  # DISCONNECTED, SCANNING, CONNECTED, STREAMING, STALE_WARNING, RECONNECTING
        self.last_heartbeat_time = 0.0
        self.last_valid_frame_buffer = None  # Freeze Frame Buffer

    def on_packet_received(self, packet: dict):
        """Xử lý khi nhận được gói tin dữ liệu mới từ game."""
        self.last_heartbeat_time = time.time() * 1000.0
        self.last_valid_frame_buffer = packet  # Cập nhật bộ đệm khung hình hợp lệ
        if self.state in ["DISCONNECTED", "SCANNING", "RECONNECTING", "STALE_WARNING"]:
            self.state = "STREAMING"

    def check_health(self) -> str:
        """Kiểm tra nhịp tim định kỳ mỗi chu kỳ vòng lặp."""
        now = time.time() * 1000.0
        elapsed = now - self.last_heartbeat_time

        if self.last_heartbeat_time == 0.0:
            self.state = "DISCONNECTED"
        elif elapsed > self.disconnect_threshold_ms:
            self.state = "RECONNECTING"
        elif elapsed > self.stale_threshold_ms:
            self.state = "STALE_WARNING"
        else:
            self.state = "STREAMING"

        return self.state

    def get_safe_display_payload(self) -> Optional[dict]:
        """Lấy dữ liệu an toàn để hiển thị trên màn hình phát sóng."""
        # Ngay cả khi bị STALE_WARNING hoặc RECONNECTING, vẫn trả về khung hình đệm cuối cùng
        return self.last_valid_frame_buffer


class EmergencyRescueController:
    """Bộ điều khiển xử lý phím tắt và thao tác can thiệp khẩn cấp của Bàn Cứu Hộ."""
    def __init__(self, normalizer: TelemetryNormalizer, on_scene_switch_callback=None):
        self.normalizer = normalizer
        self.on_scene_switch = on_scene_switch_callback

    def handle_hotkey(self, hotkey_code: str, current_payload: dict):
        """Xử lý các phím tắt can thiệp nhanh trong 1 giây."""
        if hotkey_code == "F1":
            # Xanh +1 Mạng
            current_kills = current_payload.get("blue_team", {}).get("score", 0) + 1
            self.normalizer.set_manual_lock("blue_team.score", current_kills)
            print(f"[RESCUE] Đã cộng 1 mạng cho Đội Xanh: {current_kills} (is_manual_locked: ON)")

        elif hotkey_code == "F2":
            # Xanh -1 Mạng
            current_kills = max(0, current_payload.get("blue_team", {}).get("score", 0) - 1)
            self.normalizer.set_manual_lock("blue_team.score", current_kills)

        elif hotkey_code == "F3":
            # Đỏ +1 Mạng
            current_kills = current_payload.get("red_team", {}).get("score", 0) + 1
            self.normalizer.set_manual_lock("red_team.score", current_kills)

        elif hotkey_code == "F4":
            # Đỏ -1 Mạng
            current_kills = max(0, current_payload.get("red_team", {}).get("score", 0) - 1)
            self.normalizer.set_manual_lock("red_team.score", current_kills)

        elif hotkey_code == "CTRL_P":
            # Tạm dừng kỹ thuật: Che mờ màn hình game ngay lập tức
            if self.on_scene_switch:
                self.on_scene_switch("SCENE_TECH_PAUSE")
            print("[RESCUE] ĐÃ KÍCH HOẠT MÀN HÌNH TẠM DỪNG KỸ THUẬT (SCENE 6)")

    def swap_heroes_1_click(self, current_payload: dict, slot_a: int, slot_b: int):
        """Hoán đổi tức thì vị trí tướng giữa 2 người chơi (tình huống đổi tướng giây 0)."""
        blue_roster = current_payload.get("blue_team", {}).get("roster", [])
        if slot_a < len(blue_roster) and slot_b < len(blue_roster):
            hero_a = blue_roster[slot_a]["character_name"]
            hero_b = blue_roster[slot_b]["character_name"]
            blue_roster[slot_a]["character_name"] = hero_b
            blue_roster[slot_b]["character_name"] = hero_a
            
            # Khóa trạng thái sửa tay
            self.normalizer.set_manual_lock("blue_team.roster", blue_roster)
            print(f"[RESCUE] Đã đảo tướng 1 chạm: {hero_a} <-> {hero_b} trong < 50ms.")
```

---

## 7. HƯỚNG DẪN XỬ LÝ TÌNH HUỐNG THỰC CHIẾN CHO KỸ THUẬT VIÊN

1. **Tuyển thủ hoán đổi tướng ở giây 0 (Last-second Swap)**:
   - Trên màn hình giám sát, kỹ thuật viên thấy tuyển thủ cầm tướng khác với ô Ban/Pick.
   - Thao tác: Nhấp chuột vào nút **Đảo Tướng 1 Chạm** giữa 2 slot tuyển thủ trên Bàn Cứu Hộ.
   - Kết quả: Trong vòng 50 mili-giây, tên tướng và ảnh đại diện trên luồng livestream hoán đổi hoàn hảo, khán giả không nhận ra sự cố.
2. **Trò chơi bị tạm dừng do lỗi thiết bị của tuyển thủ (Technical Pause)**:
   - Trong game bấm nút Pause.
   - Thao tác: Kỹ thuật viên nhấn tổ hợp phím tắt `Ctrl + P`.
   - Kết quả: Trong 16 mili-giây, màn hình livestream tự động chuyển sang Cảnh 6 (Màn hình Tạm dừng Kỹ thuật), làm mờ màn hình thi đấu để tránh lộ chiến thuật cắm mắt, bật bài hát giải đấu và khung hình camera bình luận viên.
3. **Mạng internet của máy chủ game bị chập chờn (Network Stale)**:
   - Cổng kết nối không phản hồi gói tin mới trong hơn 1500ms.
   - Thao tác: Kỹ thuật viên **không cần làm gì cả**.
   - Kết quả: Hệ thống tự động kích hoạt **Bộ đệm Đóng băng (Freeze-Frame Buffer)** cố định nguyên vẹn tỉ số hiện tại; luồng ngầm tự động thử kết nối lại sau mỗi 500ms. Luồng livestream của khán giả hoàn toàn ổn định.
