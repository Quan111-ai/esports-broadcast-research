# SỔ TAY VẬN HÀNH TOÀN DIỆN: HỆ THỐNG SẢN XUẤT VÀ PHÁT SÓNG GIẢI ĐẤU THỂ THAO ĐIỆN TỬ
**Cẩm Nang Thực Địa Dành Riêng Cho Đạo Diễn / Kỹ Thuật Viên Đơn Thân ("Anh Nam")**  
**Phiên bản**: 2.4.0 - Master Release  
**Phạm vi**: Tích hợp toàn diện 5 mô-đun (Skill 01 -> Skill 05), chuẩn hóa toàn bộ quy trình từ khâu chuẩn bị giải, kết nối 3-click, điều khiển luồng phát sóng kép (16:9 & TikTok 9:16), sử dụng bàn cứu hộ 1 giây, đến tự động cập nhật nhánh đấu và tính điểm Free Fire 12 đội.

---

## LỜI NÓI ĐẦU: TRIẾT LÝ VẬN HÀNH MỘT NGƯỜI

Trước đây, để tổ chức và phát sóng trực tiếp một giải đấu thể thao điện tử (Esports) đúng chuẩn truyền hình chuyên nghiệp, ban tổ chức cần một ê-kíp cồng kềnh gồm ít nhất 4 đến 5 người:
- 1 Trọng tài phòng đấu (ngồi tạo phòng, theo dõi cấm chọn, ghi tỉ số ra giấy).
- 1 Kỹ thuật viên OBS/vMix (ngồi căn chỉnh cửa sổ, gõ tên đội, đổi ảnh logo, chuyển cảnh thủ công).
- 1 Kỹ thuật viên đồ họa (ngồi làm Photoshop, xuất ảnh tỉ số, bảng điểm Excel).
- 1 Đạo diễn điều phối âm thanh và kênh livestream lên mạng.

Chỉ cần một người bấm nhầm phím hoặc mạng bị giật, buổi phát sóng sẽ lập tức xảy ra lỗi: Hiện sai tên tuyển thủ, tỉ số nhảy lùi về 0, hoặc màn hình livestream bị đen ngòm.

**Phần mềm này được sinh ra để thay đổi hoàn toàn điều đó!**  
Tất cả công việc phức tạp trên được tích hợp trọn vẹn vào **một ứng dụng duy nhất**. Toàn bộ hệ thống được thiết kế xoay quanh một người điều khiển duy nhất — chúng ta gọi thân mật là **"Anh Nam"**:
- **Không cần cài OBS Studio hay vMix** (Phần mềm tự vẽ đồ họa 60 FPS bằng card màn hình và tự phát trực tiếp lên mạng).
- **Không cần gõ lại tên đội hay copy ảnh logo từng trận** (Chọn trận trên sơ đồ giải là đồ họa tự đổi sau 0.05 giây).
- **Không cần bấm máy tính cộng điểm Free Fire** (Hệ thống tự đọc bảng kết quả sau 2 giây và tự cộng điểm theo luật quốc tế).
- **Có sẵn Bàn Cứu Hộ 1 Giây** (Chỉ cần 1 nút bấm hoặc 1 phím tắt là xử lý xong mọi trục trặc của tuyển thủ hoặc của game).

Cuốn sổ tay này sẽ hướng dẫn Anh Nam từng bước một, từ lúc mở máy tính vào buổi sáng cho đến khi trao cúp vô địch và tắt máy ra về.

---

## CHƯƠNG 1: BỨC TRANH TỔNG THỂ & 5 MẢNH GHÉP HỢP NHẤT

Hệ thống hoạt động như một cỗ máy khép kín gồm 5 bộ phận ăn khớp với nhau:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CHUỖI TRUYỀN DẪN 5 MẢNH GHÉP HỢP NHẤT                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  MẢNH GHÉP 1 & 2: THU DỮ LIỆU TỰ ĐỘNG TỪ GAME (INGRESS)                    │
│  - PC Game (LoL, VALORANT): Bắt cổng mạng cục bộ trong < 50 mili-giây.      │
│  - Mobile Game (Liên Quân, Tốc Chiến, Free Fire): Trọng tài Ảo tự vào phòng │
│    hoặc Nhận dạng hình ảnh trực tiếp từ màn hình điện thoại (OCR < 300ms).  │
│                                      │                                      │
│                                      ▼                                      │
│  MẢNH GHÉP 3: CỔNG KẾT NỐI 1 CHẠM & BÀN CỨU HỘ KHẨN CẤP                     │
│  - Quy trình 3-Click: Chọn Game -> Vào Phòng -> Lên Sóng.                   │
│  - Chuẩn hóa toàn bộ số liệu trận đấu về một mối.                           │
│  - Bàn Cứu Hộ 1 Giây: Đảo tướng 1 chạm, phím F1-F4 sửa tỉ số, Ctrl+P che màn│
│                                      │                                      │
│                  ┌───────────────────┴───────────────────┐                  │
│                  ▼                                       ▼                  │
│  MẢNH GHÉP 4: BỘ NÃO GIẢI ĐẤU             MẢNH GHÉP 5: PHÒNG ĐỒ HỌA & PHÁT  │
│  (TOURNAMENT ENGINE)                      (GRAPHICS STUDIO & STREAMING)     │
│  - Quản lý Logo, Tuyển thủ, Màu áo.       - Vẽ trực tiếp 6 Cảnh quay 60 FPS │
│  - Tự nhảy nhánh đấu (Thắng đi tiếp).     - Không cần cài OBS hay vMix.      │
│  - Tự cộng điểm Free Fire 12 đội          - Phát đồng thời: Khung Ngang     │
│    và xử lý hòa điểm 4 bậc.                 (YouTube) & Khung Dọc (TikTok). │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## CHƯƠNG 2: GIAI ĐOẠN 1 - CHUẨN BỊ TRƯỚC GIẢI ĐẤU (SETUP)
*(Thực hiện trước giờ lên sóng từ 20 đến 30 phút)*

### 1. Tạo Mới Giải Đấu
1. Mở phần mềm, bấm vào biểu tượng chiếc cúp **"Sổ Tay Giải Đấu"** ở thanh điều hướng bên trái.
2. Bấm nút **[ + Tạo Giải Đấu Mới ]**, điền thông tin cơ bản:
   - **Tên giải đấu**: Ví dụ *Đấu Trường Danh Vọng Mùa Đông 2026* hoặc *Giải Sinh Tồn Free Fire Đại Học Bách Khoa*.
   - **Tựa game thi đấu**: Chọn 1 trong 5 game (Liên Minh Huyền Thoại, VALORANT, Liên Quân Mobile, Tốc Chiến, Free Fire).
   - **Thể thức thi đấu**:
     - *Loại trực tiếp (Single Elimination)*: Thua 1 trận là bị loại (BO1, BO3 hoặc BO5).
     - *Nhánh thắng - Nhánh thua (Double Elimination)*: Thua 1 trận vẫn còn cơ hội làm lại ở nhánh dưới.
     - *Đấu vòng tròn (Round-Robin)*: Các đội chia bảng đá vòng tròn tính điểm.
     - *Bắn súng sinh tồn (Free Fire 12 Đội)*: 12 đội cùng bắn từ 4 đến 6 ván tính điểm tích lũy.

### 2. Nạp Danh Sách Đội Tuyển & Hình Ảnh (Chỉ Mất 1 Phút)
Anh Nam có thể chọn 1 trong 2 cách cực kỳ nhanh:
- **Cách Kéo Thả Thư Mục (Khuyên dùng)**: Chuẩn bị sẵn một thư mục ngoài Desktop chứa các folder con mang tên đội (ví dụ `SGP`, `FL`, `WAG`), bên trong có file `logo.png` và ảnh chân dung các tuyển thủ. Bấm giữ chuột kéo cả thư mục đó thả thẳng vào phần mềm. Hệ thống sẽ tự động đọc hết tất cả các đội trong 3 giây!
- **Cách Nhập File Excel/CSV**: Bấm nút **[ Nhập File CSV ]** và chọn file danh sách đăng ký do ban tổ chức gửi.

> **MẸO CHO ANH NAM - KHÔNG LO THIẾU ẢNH TUYỂN THỦ**:  
> Nếu một đội phong trào mới đăng ký mà chưa kịp chụp ảnh chân dung studio, Anh Nam **cứ yên tâm bấm tiếp tục**. Phần mềm có tính năng **Ảnh Bóng Mặc Định Ngầu (Fallback Silhouette)**. Hệ thống sẽ tự động ghép hình bóng một chiến binh esport chuyên nghiệp mang màu áo của đội đó lên màn hình. Đảm bảo giao diện livestream lúc nào cũng lung linh, không bao giờ bị ô đen hay lỗi ảnh.

### 3. Cài Đặt Khóa Phát Sóng (Stream Key) Các Nền Tảng
Vào mục **"Cài Đặt Phát Sóng"**, dán mã Stream Key một lần duy nhất:
- **Kênh Ngang (16:9)**: Dán Stream Key của YouTube Live hoặc Facebook Gaming.
- **Kênh Dọc (9:16)**: Dán Stream Key của TikTok Live (hoặc Facebook Reels).
- Đèn báo bên cạnh chuyển sang **Màu Xanh Lục** báo hiệu đường truyền Internet đã thông suốt.

---

## CHƯƠNG 3: GIAI ĐOẠN 2 - QUY TRÌNH KẾT NỐI 3-CLICK VÀO TRẬN ĐẤU
*(Thực hiện đúng 3 cú nhấp chuột là lên sóng ngay)*

Khi các tuyển thủ đã sẵn sàng trong phòng game, Anh Nam chỉ cần thao tác đúng 3 bước:

```
+-----------------------------------------------------------------------------------------+
| CLICK 1: CHỌN TỰA GAME ĐANG THI ĐẤU                                                     |
| [ Liên Minh Huyền Thoại ]  [ VALORANT ]  [ Liên Quân Mobile ]  [ Tốc Chiến ]  [ Free Fire ]|
+-----------------------------------------------------------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------------+
| CLICK 2: VÀO PHÒNG ĐẤU                                                                  |
| - Game PC: Bấm [ Tự Động Bắt Game ] HOẶC Dán [ Mã Phòng Giải Đấu ]                     |
| - Game Mobile: Gõ [ ID Phòng: 889922 ] + [ Pass: 1234 ] -> Bấm [ Gọi Trọng Tài Ảo ]     |
|   (HOẶC Cắm Cáp Capture Điện Thoại -> Bấm [ Nhận Tín Hiệu HDMI ])                       |
|   => ĐÈN BÁO XANH LÁ CÂY: [ ĐÃ KẾT NỐI VÀ KHỚP DỮ LIỆU TRONG 0.2 GIÂY ]                |
+-----------------------------------------------------------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------------+
| CLICK 3: BẤM NÚT ĐỎ LỚN: [ BẮT ĐẦU PHÁT SÓNG TRỰC TIẾP (GO LIVE) ]                     |
| => Hình ảnh lập tức phát đồng thời lên YouTube (16:9) và TikTok (9:16 dọc nét căng)!     |
+-----------------------------------------------------------------------------------------+
```

### Chi Tiết Cụ Thể Từng Tựa Game:
1. **Liên Minh Huyền Thoại (LoL)**:
   - Nếu có mã Tournament Code từ ban tổ chức: Dán mã vào ô, phần mềm tự tạo phòng và tự kéo 10 tuyển thủ vào đúng vị trí.
   - Nếu đánh phòng Custom thường: Anh Nam chỉ cần mở Client game LoL ở chế độ Quan sát (Spectator), bấm nút **[ Tự Động Bắt Game ]**, phần mềm sẽ tự kết nối qua cổng mạng cục bộ trong chưa đầy 50 mili-giây.
2. **VALORANT**:
   - Mở game VALORANT và ngồi ở vị trí Trọng tài (Observer). Phần mềm tự động nhận diện trận đấu, tự đọc vòng đấu (Round 1, 2... 13), tự theo dõi trạng thái quả bom Spike (đang đặt, đang gỡ hay đã phát nổ).
3. **Liên Quân Mobile & Liên Minh: Tốc Chiến**:
   - Nhập `ID Phòng` và `Mật khẩu` do tuyển thủ cung cấp, bấm **[ Gọi Trọng Tài Ảo ]**. Một tài khoản quan sát ngầm sẽ tự động tham gia phòng đấu trong vòng 0.5 giây.
   - Hoặc nếu cắm dây capture card từ máy điện thoại của trọng tài vào PC: Bấm **[ Nhận Màn Hình Capture ]**, phần mềm tự kích hoạt bộ đọc hình ảnh AI (OCR) để đọc mặt tướng và số mạng hạ gục.
4. **Free Fire (12 Đội Sinh Tồn)**:
   - Nhập ID phòng custom 48 người, chọn chế độ **Theo Dõi 12 Đội**. Phần mềm tự động chuẩn bị sẵn bộ nhận diện bảng xếp hạng cuối ván.

---

## CHƯƠNG 4: GIAI ĐOẠN 3 - ĐIỀU KHIỂN PHÁT SÓNG TRỰC TIẾP (LIVE PRODUCTION)
*(Anh Nam ngồi thư giãn như một đạo diễn truyền hình thực thụ)*

### 1. Kho 6 Cảnh Quay Tiêu Chuẩn & Phím Tắt Vận Hành
Anh Nam có thể bấm chuột trên màn hình hoặc dùng hàng phím `F1` đến `F6` trên bàn phím để chuyển đổi giữa 6 cảnh phát sóng:

| Phím Tắt | Tên Cảnh Phát Sóng | Khi Nào Sử Dụng? | Bố Cục Hình Ảnh Hiển Thị |
|:---:|:---|:---|:---|
| **`F1`** | **Màn hình Chờ / Đếm Ngược** | Trước giờ khai mạc, hoặc lúc nghỉ giải lao giữa 2 trận đấu. | Khung nền video động sôi động, logo giải đấu, đồng hồ đếm ngược giờ G, thông tin cặp đấu Đội A vs Đội B, dòng chữ chạy lịch thi đấu phía dưới. |
| **`F2`** | **Màn hình Cấm & Chọn Tướng** | Khi hai đội bắt đầu vào giai đoạn cấm chọn tướng (Draft). *(Phần mềm tự động bật khi game vào draft)* | Hai cột 5 ô tướng hai bên, hiện rõ mặt tướng đang chọn nhấp nháy, ảnh chân dung tuyển thủ, các tướng bị cấm ở dưới và đồng hồ đếm ngược từng lượt chọn. |
| **`F3`** | **Màn hình Trong Trận Đấu** | Khi trận đấu chính thức bắt đầu, tướng xuất hiện trên bản đồ. *(Phần mềm tự động bật khi thời gian chạy)* | Màn hình game toàn phần sắc nét. Thanh tỉ số nằm ở viền trên (Logo 2 đội, Tỉ số ván, Thời gian, Số Kill, Chênh lệch tiền). Khung camera Bình luận viên góc dưới. |
| **`F4`** | **Chiếu Lại Pha Đẹp (Highlight)** | Ngay sau một pha giao tranh tổng nảy lửa, có người đạt Penta Kill hoặc quét sạch. | Hiệu ứng chuyển cảnh Stinger mạ vàng, nhấp nháy chữ "PHÁT LẠI / REPLAY", chiếu chậm lại 15 giây pha combat vừa diễn ra kèm bảng thống kê sát thương. Sau 15s tự động quay lại Cảnh 3. |
| **`F5`** | **Bảng Tổng Kết & Xếp Hạng** | Khi nhà chính nổ hoặc khi hết ván bắn Free Fire. *(Phần mềm tự động bật khi hết trận)* | - Với MOBA/FPS: Bảng so sánh chỉ số sát thương, lượng vàng của 10 tuyển thủ.<br>- Với Free Fire: Bảng xếp hạng 12 đội tự động cập nhật, có mũi tên xanh tăng hạng, đỏ tụt hạng. |
| **`F6`** | **Lễ Vinh Danh MVP & Trao Giải** | Sau khi kết thúc cặp trận (ví dụ thắng 2-0 trong BO3). | Ảnh tuyển thủ xuất sắc nhất trận (MVP) tỏa sáng rực rỡ kèm chỉ số KDA ấn tượng, bên cạnh là Sơ đồ Nhánh Đấu giải vừa được cập nhật đội thắng vào vòng trong. |

### 2. Phát Sóng Đồng Thời: Ngang Cho YouTube & Dọc Cho TikTok
Anh Nam không cần phải chỉnh gì cả, phần mềm tự động làm điều kỳ diệu này:
- **Trên máy tính và TV (YouTube/Facebook - Khung Ngang 16:9)**: Khán giả thưởng thức trọn vẹn màn hình game chuẩn truyền hình truyền thống.
- **Trên điện thoại (TikTok Live - Khung Dọc 9:16)**: Phần mềm tự động **tái cấu trúc hình ảnh 3 tầng thông minh**:
  1. *Tầng Đỉnh*: Phóng to bảng tỉ số và thời gian lên $140\%$ đưa lên sát mép trên để người xem điện thoại nhìn rõ mồn một.
  2. *Tầng Giữa*: Cắt cúp thông minh vùng trung tâm $1080 \times 1080$ nơi diễn ra các pha combat lớn của game.
  3. *Tầng Chân*: Đặt khung hình Bình luận viên kích thước lớn kèm khung đọc tin nhắn bình luận của khán giả TikTok.

---

## CHƯƠNG 5: GIAI ĐOẠN 4 - BÀN CỨU HỘ 1 GIÂY & XỬ LÝ MỌI SỰ CỐ THỰC ĐỊA
*(Kỹ năng quan trọng nhất giúp Anh Nam làm chủ hoàn toàn buổi phát sóng)*

Trong thể thao điện tử, sự cố ngoài ý muốn luôn có thể xảy ra bất cứ lúc nào. Khi có biến, Anh Nam **tuyệt đối không được cuống**, chỉ cần nhìn vào **Bàn Cứu Hộ Khẩn Cấp** ở góc dưới màn hình:

```
+----------------------------------------------------------------------------------------------------+
|                                BÀN CỨU HỘ KHẨN CẤP (RESCUE CONTROL PANEL)                          |
+----------------------------------------------------------------------------------------------------+
| [ F1 ] Xanh +1 Mạng  | [ F3 ] Đỏ +1 Mạng  || [ Ctrl + P ] TẠM DỪNG KỸ THUẬT (CHE MÀN HÌNH GAME < 0.1S)|
| [ F2 ] Xanh -1 Mạng  | [ F4 ] Đỏ -1 Mạng  || [ Ctrl + B ] BẬT CẤM CHỌN       | [ Ctrl + G ] VÀO GAME |
+----------------------------------------------------------------------------------------------------+
| ĐỘI XANH (Saigon Phantom)                 | ĐIỀU CHỈNH NHANH                 | ĐỘI ĐỎ (Team Flash)         |
| Tỉ số: [ 1 ] [ + ] [ - ] [ Khóa Tự Động ] | Vàng Xanh: [ 14.5k ] [ +500 ]    | Tỉ số: [ 0 ] [ + ] [ - ]    |
| Tướng 1: [ Nakroth   v ]                  | Vàng Đỏ:   [ 12.1k ] [ +500 ]    | Tướng 1: [ Elsu      v ]    |
+----------------------------------------------------------------------------------------------------+
| ĐẢO TƯỚNG 1 CHẠM (SWAP):                                                                           |
| [ Bângg (Nakroth) ] <====== NÚT ĐẢO HAI CHIỀU ======> [ Fish (Krixi) ]                              |
| Bấm 1 nút -> Hoán đổi tức thì tướng giữa Người 1 & Người 2 trên màn hình Livestream (< 50ms)       |
+----------------------------------------------------------------------------------------------------+
```

### Hướng Dẫn Xử Lý 5 Tình Huống Khẩn Cấp Thường Gặp:

#### Tình huống 1: Trọng tài trong game hô "PAUSE" (Tạm dừng kỹ thuật do tuyển thủ lỗi máy)
- **Nguy cơ**: Nếu livestream vẫn chiếu màn hình game đứng yên, khán giả sẽ nhìn thấy toàn bộ vị trí cắm mắt và chiến thuật của hai đội, làm lộ bí mật trận đấu.
- **Cách Anh Nam xử lý trong 0.1 giây**:
  - Gõ ngay phím tắt **`Ctrl + P`** (hoặc bấm phím **`Space`**, hoặc bấm chiếc Nút Đỏ to đùng trên màn hình).
  - **Ngay lập tức**: Màn hình game bị che khuất hoàn toàn bởi giao diện đẹp mắt: *"TRẬN ĐẤU ĐANG TẠM DỪNG KỸ THUẬT - SẼ TRỞ LẠI SAU GIÂY LÁT"*. Nhạc chờ nhẹ nhàng tự phát, camera Bình luận viên tự mở lớn để BLV giao lưu với người xem.
  - Khi trọng tài thông báo tiếp tục trận đấu: Bấm lại **`Ctrl + P`**, màn hình game sẽ hiện lại mượt mà.

#### Tình huống 2: Tuyển thủ đổi tướng cho nhau ở 1 giây cuối cùng trước khi vào trận
- **Nguy cơ**: Trong lúc cấm chọn, người đi rừng chọn tướng cho người đi đường giữa, đến giây cuối cùng họ mới bấm đổi cho nhau. Màn hình livestream nếu không cập nhật kịp sẽ hiện sai tên người cầm tướng.
- **Cách Anh Nam xử lý trong 0.5 giây**:
  - Trên Bàn cứu hộ, nhìn vào danh sách 2 tuyển thủ vừa đổi tướng.
  - Bấm vào biểu tượng **[ Mũi Tên Đảo Hai Chiều ]** ở giữa 2 người đó.
  - Xong! Đồ họa trên livestream lập tức hoán đổi vị trí ảnh đại diện và tên tướng của 2 người đó trong vòng chưa đầy 50 mili-giây.

#### Tình huống 3: Mạng chập chờn khiến hệ thống đọc sai 1 mạng hạ gục
- **Nguy cơ**: Tỉ số thực tế trong game là 5 - 3 nhưng do màn hình bị mờ nên hệ thống nhận diện thành 4 - 3.
- **Cách Anh Nam xử lý trong 1 giây**:
  - Dùng ngón tay gõ nhanh phím tắt:
    - Bấm **`F1`**: Đội Xanh cộng ngay 1 mạng (Bấm `F2` nếu muốn trừ 1 mạng).
    - Bấm **`F3`**: Đội Đỏ cộng ngay 1 mạng (Bấm `F4` nếu muốn trừ 1 mạng).
  - Hệ thống tự động **Khóa trường số mạng này lại (`is_manual_locked = true`)**, duy trì đúng con số Anh Nam vừa sửa và không cho hệ thống tự động nhảy đè lên nữa.

#### Tình huống 4: Mạng Internet của máy thi đấu bị rớt giữa chừng
- **Nguy cơ**: Phần mềm livestream cũ sẽ bị giật khung hình hoặc tỉ số nhảy về số 0 tròn trĩnh khiến khán giả la ó.
- **Cách hệ thống tự động cứu nguy**:
  - Phần mềm tích hợp tính năng **Đóng Băng Khung Hình An Toàn (Freeze Frame Buffer)**. Nếu quá 1.5 giây không nhận được tín hiệu mới từ game, hệ thống sẽ giữ nguyên vẹn toàn bộ bảng điểm, tỉ số và khung hình cuối cùng trên livestream. Khán giả xem ở nhà hoàn toàn không phát hiện ra lỗi mạng.
  - Hệ thống âm thầm tự động kết nối lại ở tầng nền. Khi có mạng trở lại, số liệu sẽ tự đồng bộ êm ái.

#### Tình huống 5: Trọng tài quyết định trừ điểm phạt một đội trong giải Free Fire
- **Cách Anh Nam xử lý**:
  - Mở bảng điểm 12 đội ở Cảnh 5, nhấp đúp chuột vào ô điểm của đội bị phạt.
  - Nhập số điểm trừ (ví dụ `-2`), bấm Enter.
  - Hệ thống tự động trừ điểm và tự động tính toán lại toàn bộ thứ tự bảng tổng sắp ngay tức khắc.

---

## CHƯƠNG 6: GIAI ĐOẠN 5 - KẾT THÚC VÁN, TỰ ĐỘNG TÍNH ĐIỂM & NHẢY NHÁNH ĐẤU
*(Hết trận chỉ việc bấm chuyển cảnh, không cần tính toán bằng tay)*

### 1. Với Game MOBA / VALORANT (Đấu Đối Kháng 5v5)
1. Khi nhà chính đối phương phát nổ hoặc kết thúc vòng 13 của VALORANT:
   - Hệ thống tự động ghi nhận đội chiến thắng ván đó.
   - Tỉ số trên bảng điểm tự động nhảy từ **`1 - 0`** lên **`2 - 0`**.
2. Khi một đội đạt đủ số ván thắng quy định (ví dụ thắng 2 ván trong kèo BO3):
   - Phần mềm tự động đánh dấu hoàn thành cặp đấu.
   - **Tên và logo của đội thắng tự động được điền vào trận Bán kết tiếp theo trên sơ đồ giải đấu**.
   - Nếu là giải nhánh thua (Double Elimination), tên đội thua cũng tự động được xếp xuống nhánh dưới đúng theo lịch thi đấu đã định sẵn.
3. Anh Nam chỉ cần bấm phím **`F6`**: Màn hình livestream sẽ chiếu hình ảnh vinh danh tuyển thủ MVP kèm theo sơ đồ nhánh đấu mới nhất để khán giả nắm được lịch thi đấu vòng sau.

### 2. Với Game Free Fire (Bắn Súng Sinh Tồn 12 Đội)
Đây là phần việc trước đây tốn nhiều thời gian nhất của ban tổ chức (thường phải mất 10 - 15 phút ngồi bấm máy tính cộng từng mạng hạ gục của 12 đội):
1. **Sau khi ván bắn kết thúc**:
   - Màn hình game hiện bảng thành tích từ Hạng 1 đến Hạng 12.
   - Bộ đọc màn hình tự động quét toàn bộ bảng kết quả trong đúng **2 giây**.
2. **Hệ thống tự động tính điểm theo luật quốc tế**:
   - Tự động cộng điểm thứ hạng: Top 1 (12đ), Top 2 (9đ), Top 3 (8đ)... Top 10 (1đ), Top 11-12 (0đ).
   - Tự động cộng điểm hạ gục: Mỗi mạng hạ gục được cộng thêm 1 điểm.
   - Tự động cộng dồn vào **Bảng Tổng Điểm Tích Lũy Qua Các Ván**.
3. **Tự động xử lý tình huống các đội bằng điểm nhau (Tie-Breaker 4 Cấp)**:
   - Nếu có 2 hay nhiều đội bằng điểm, phần mềm tự động so sánh theo đúng luật thi đấu chính thức:
     - *Ưu tiên 1*: Đội nào có nhiều ván đạt Booyah (Hạng 1) hơn xếp trên.
     - *Ưu tiên 2*: Nếu vẫn bằng, đội nào có tổng số Kill toàn giải nhiều hơn xếp trên.
     - *Ưu tiên 3*: Nếu vẫn bằng, đội nào có thứ hạng cao hơn ở ván đấu gần nhất xếp trên.
4. Anh Nam chỉ cần bấm phím **`F5`**: Toàn bộ bảng tổng sắp 12 đội đẹp mắt lập tức hiện lên màn hình livestream, có sẵn các mũi tên xanh chỉ đội vừa leo hạng và mũi tên đỏ chỉ đội vừa tụt hạng.

---

## CHƯƠNG 7: BẢNG KIỂM TRA TRƯỚC GIỜ LÊN SÓNG (GO-LIVE PREFLIGHT CHECKLIST)
*(Anh Nam dành đúng 3 phút kiểm tra 10 dấu tích này trước khi bấm Go Live)*

```
[  ] 1. Máy tính đã cắm dây mạng LAN có dây (Hạn chế tối đa dùng Wi-Fi để tránh rớt gói).
[  ] 2. Đã nạp đầy đủ danh sách các đội và logo trong Sổ Tay Giải Đấu (Đã có tích xanh).
[  ] 3. Đã bấm chọn Cặp Đấu chuẩn bị thi đấu trên Sơ đồ (Đèn báo GPU Texture báo READY).
[  ] 4. Đã bật game hoặc cắm dây capture điện thoại (Hình ảnh game hiện rõ nét trên màn xem trước).
[  ] 5. Đã thử bấm Click 2: Đèn trạng thái báo [ XANH LÁ CÂY - ĐÃ KẾT NỐI VÀ KHỚP DỮ LIỆU ].
[  ] 6. Đã kiểm tra Stream Key của YouTube và TikTok Live (Đều báo kết nối sẵn sàng).
[  ] 7. Đã cắm tai nghe và nói thử vào micro: Cột sóng âm thanh nhảy đều, âm lượng đạt chuẩn -14 LUFS.
[  ] 8. Camera Bình luận viên đã lên hình, góc nhìn sáng rõ, không bị ngược sáng.
[  ] 9. Đã bấm phím F1 chọn Cảnh 1 (Màn hình Chờ đếm ngược) làm cảnh mở màn.
[  ] 10. Tay sẵn sàng đặt hờ lên phím cách [ Space ] hoặc [ Ctrl + P ] để ứng cứu khi cần!
```
**Tất cả 10 mục đều OK? Bấm nút đỏ [ BẮT ĐẦU PHÁT SÓNG ] và tự tin làm chủ buổi livestream!**

---

## CHƯƠNG 8: BẢNG TRA CỨU PHÍM TẮT TOÀN NĂNG (CHEAT SHEET DÁN CẠNH MÀN HÌNH)

Anh Nam có thể in trang này ra và dán ngay cạnh bàn làm việc để tra cứu trong chớp mắt:

| Phím Tắt | Chức Năng Nhanh | Kết Quả Phản Hồi |
|---|---|---|
| **`F1`** | Bật **Cảnh 1: Màn hình Chờ Trước Trận** | Hiện đồng hồ đếm ngược, logo giải và thông tin cặp đấu |
| **`F2`** | Bật **Cảnh 2: Cấm & Chọn Tướng (Draft)** | Hiện 10 ô chọn tướng, thời gian draft và ảnh tuyển thủ |
| **`F3`** | Bật **Cảnh 3: Trong Trận Đấu Trực Tiếp** | Chiếu full màn hình game kèm thanh tỉ số đỉnh và cột KDA |
| **`F4`** | Bật **Cảnh 4: Phát Lại Highlight 15s** | Chạy clip quay chậm 15 giây pha giao tranh vừa qua |
| **`F5`** | Bật **Cảnh 5: Bảng Điểm & BXH 12 Đội** | Hiện bảng tổng kết chỉ số hoặc bảng điểm Free Fire tích lũy |
| **`F6`** | Bật **Cảnh 6: Vinh Danh Chiến Thắng & MVP** | Chiếu thẻ MVP tỏa sáng và sơ đồ nhánh đấu mới nhất |
| **`Ctrl + P`** hoặc **`Space`** | **CỨU NGUY: TẠM DỪNG KỸ THUẬT** | **Che màn hình game tức thì trong 0.1s**, bật nhạc chờ & mic BLV |
| **`F1`** *(Trên bàn cứu hộ)* | **Cộng 1 mạng cho Đội Xanh** | Tỉ số Kill Đội Xanh tăng ngay lập tức +1 trên sóng |
| **`F2`** *(Trên bàn cứu hộ)* | **Trừ 1 mạng cho Đội Xanh** | Tỉ số Kill Đội Xanh giảm ngay lập tức -1 trên sóng |
| **`F3`** *(Trên bàn cứu hộ)* | **Cộng 1 mạng cho Đội Đỏ** | Tỉ số Kill Đội Đỏ tăng ngay lập tức +1 trên sóng |
| **`F4`** *(Trên bàn cứu hộ)* | **Trừ 1 mạng cho Đội Đỏ** | Tỉ số Kill Đội Đỏ giảm ngay lập tức -1 trên sóng |
| **`Ctrl + Enter`** | Mở hộp thoại gõ nhanh số liệu | Nhập nhanh lại số vàng hoặc số ván thắng bằng tay |

---

## LỜI KẾT

Với cuốn cẩm nang này và phần mềm phát sóng thế hệ mới, Anh Nam không chỉ là một kỹ thuật viên đơn thuần, mà đã trở thành **một Tổng đạo diễn kiêm Giám đốc kỹ thuật của một Đài truyền hình thể thao điện tử hiện đại**. Chúc Anh Nam có những buổi phát sóng trực tiếp bùng nổ, mãn nhãn và không tì vết!
