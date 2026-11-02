# HỒ SƠ ĐẶC TẢ DỰ ÁN LỚN: TOÀN BỘ BẢNG USE CASE, TEST CASE, DỮ LIỆU & QUẢN TRỊ HỆ THỐNG
**Dự án**: Phần mềm Livestream Giải đấu Game Đa Nền Tảng "Tất cả trong một" (PC & Mobile)
**Nguyên tắc biên soạn**: Viết bằng ngôn ngữ đời thường, rõ ràng, đầy đủ 10 bộ bảng tiêu chuẩn của một dự án phần mềm quy mô lớn.

---

## MỤC LỤC 10 BỘ BẢNG TRONG HỒ SƠ NÀY

1. **Bảng 1**: Bảng Phân vai Người dùng & Phân quyền thao tác (Role & Permission Matrix)
2. **Bảng 2**: Bảng Tổng hợp 30 Tình huống Sử dụng (Master Use Case Catalog: `UC-01` -> `UC-30`)
3. **Bảng 3**: Bảng Đặc tả Chi tiết 6 Luồng Use Case Cốt lõi (Detailed Use Case Specifications)
4. **Bảng 4**: Bảng Danh mục Màn hình & Trạng thái Giao diện (Screen & State Matrix: `SCR-01` -> `SCR-12`)
5. **Bảng 5**: Bảng Thiết kế Lưu trữ Dữ liệu (Data Dictionary: 7 Bảng dữ liệu cốt lõi)
6. **Bảng 6**: Bảng Cam kết Tốc độ Thời gian thực & Phương thức Vào phòng theo từng Game (Real-Time SLA Matrix)
7. **Bảng 7**: Bảng Tổng hợp 50 Kịch bản Kiểm thử (Master Test Case Suite: `TC-01` -> `TC-50`)
8. **Bảng 8**: Bảng Ma trận Truy vết Yêu cầu từ Đầu đến Cuối (Requirements Traceability Matrix - RTM)
9. **Bảng 9**: Bảng Quản trị Sự cố & Phương án Cứu nguy Khi Đang Phát Sóng (Risk & Failover Matrix)
10. **Bảng 10**: Bảng Phân kỳ Triển khai & Checklist Nghiệm thu Dự án Lớn (Milestone & UAT Sign-off Matrix)

---

## 1. BẢNG 1: PHÂN VAI NGƯỜI DÙNG & PHÂN QUYỀN THAO TÁC (ROLE MATRIX)

Trong một giải đấu thực tế (từ giải phòng máy 1 người làm tất cả cho đến giải lớn có ê-kíp 4-5 người), phần mềm chia rõ các vai trò sau:

| Mã Vai Trò | Tên Vai Trò (Đời thường) | Mô tả công việc chính | Quyền tạo/sửa Giải & Đội | Quyền Kết nối Phòng Game | Quyền Bấm Chuyển Cảnh & Sửa Điểm Nóng | Quyền Bấm Phát Sóng (Go Live) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ROLE-01** | **Người Vận Hành Toàn Quyền (1 Người Cân Tất)** | Người làm giải vừa tổ chức, vừa kết nối game, vừa bấm phát sóng trên 1 máy tính duy nhất | Có toàn quyền | Có toàn quyền | Có toàn quyền | Có toàn quyền |
| **ROLE-02** | **Trưởng Ban Tổ Chức Giải** | Người lập giải, nhận đăng ký đội, chia bảng đấu, duyệt kết quả chung cuộc | Có toàn quyền | Chỉ xem | Chỉ xem | Không |
| **ROLE-03** | **Đạo Diễn Hình Ảnh (Người Trực Máy Live)** | Người ngồi trước máy phát sóng, bấm chuyển cảnh, kiểm tra tên tướng, bật/tắt luồng live | Chỉ xem | Có toàn quyền | Có toàn quyền | Có toàn quyền |
| **ROLE-04** | **Trọng Tài Phòng Đấu** | Người tạo phòng trong game, kiểm tra tuyển thủ vào đúng chỗ, báo tạm dừng khi có lỗi mạng | Không | Có (Nhập mã phòng / Điều khiển camera) | Có (Chỉ phần xác nhận kết quả ván đấu) | Không |
| **ROLE-05** | **Bình Luận Viên (Caster)** | Người ngồi trước camera bình luận trận đấu, cần nhìn màn hình phụ để đọc thông số hai đội | Không | Không | Không (Chỉ xem màn hình thông số tóm tắt) | Không |
| **ROLE-06** | **Hệ Thống Trọng Tài Ảo (Bot Tự Động)** | Tài khoản game tự động của phần mềm nhảy vào phòng đấu khi được nhập Số Phòng + Mật khẩu | Tự động | Tự động vào ghế Khán giả & gửi hình/số liệu | Tự động điền tướng & điểm | Không |

---

## 2. BẢNG 2: TỔNG HỢP 30 TÌNH HUỐNG SỬ DỤNG (MASTER USE CASE CATALOG)

Toàn bộ 30 tình huống sử dụng của phần mềm được chia theo đúng **5 Mảnh ghép (5 Skills)** của dự án:

### Nhóm 1: Cổng Kết Nối Game Máy Tính & Điện Thoại (Skill 01 + Skill 02 + Skill 03)

| Mã UC | Tên Tình Huống Sử Dụng (Use Case) | Người Thực Hiện | Mảnh Ghép | Mức Ưu Tiên | Tóm Tắt Cách Hoạt Động (Ngôn Ngữ Đời Thường) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UC-01** | Chọn tựa game thi đấu cho giải | Người Vận Hành | Skill 03 | Bắt buộc | Bấm chọn 1 trong 5 game (Liên Minh, VALORANT, Liên Quân, Tốc Chiến, Free Fire) để phần mềm nạp đúng mẫu bảng điểm và kho ảnh tướng của game đó. |
| **UC-02** | Tự động tạo Mã Phòng Giải Đấu (Game PC) | Người Vận Hành | Skill 01, 03 | Bắt buộc | Bấm 1 nút để phần mềm tự tạo phòng đấu Liên Minh Huyền Thoại và sinh ra mã phòng gửi cho 10 người chơi dán vào game. |
| **UC-03** | Tự động bắt vào Game đang mở trên máy tính | Người Vận Hành | Skill 01, 03 | Bắt buộc | Khi máy tính đang mở sẵn Liên Minh hoặc VALORANT, phần mềm tự tìm thấy và kết nối ngay trong 1 giây mà không cần cài đặt gì thêm. |
| **UC-04** | Nhập Số Phòng + Mật khẩu để Trọng tài Ảo tự vào phòng | Người Vận Hành | Skill 02, 03 | Bắt buộc | Người dùng gõ Số Phòng (ID) và Mật khẩu (Liên Quân, Free Fire, Tốc Chiến, VALORANT); tài khoản Trọng tài Ảo tự nhảy vào ghế Khán giả trong phòng đó. |
| **UC-05** | Kết nối hình ảnh từ Điện thoại Trọng tài qua dây cáp/Wi-Fi | Trọng Tài / Vận Hành | Skill 02, 03 | Bắt buộc | Cắm dây truyền màn hình từ điện thoại trọng tài vào máy tính; phần mềm tự nhận khung hình và căn chỉnh đúng vị trí các ô tướng, ô điểm. |
| **UC-06** | Tự động đọc quá trình Cấm/Chọn tướng (Ban/Pick) tức thời | Hệ Thống Tự Động | Skill 01, 02 | Bắt buộc | Ngay khi người chơi trong game vừa chọn hoặc khóa tướng, phần mềm nhận ra trong 0.1 - 0.3 giây và hiện mặt tướng + tên người chơi lên màn hình live. |
| **UC-07** | Tự động đọc thông số Trong Trận Đấu (MOBA & Bắn súng) | Hệ Thống Tự Động | Skill 01, 02 | Bắt buộc | Tự động cập nhật số mạng hạ gục, số tiền, số trụ, Rồng/Baron, tỉ số vòng đấu, trạng thái đặt bom Spike mỗi giây một lần. |
| **UC-08** | Tự động theo dõi trạng thái sống còn 12 đội (Free Fire) | Hệ Thống Tự Động | Skill 02 | Bắt buộc | Đếm số người còn sống của từng đội trong 12 đội lúc đang bắn; đội nào bị hạ hết 4 người thì tự hiện thông báo đội đó bị loại. |
| **UC-09** | Tự động chụp & đọc Bảng kết quả cuối trận Free Fire (2 giây) | Hệ Thống Tự Động | Skill 02 | Bắt buộc | Khi trận Free Fire kết thúc, tự chụp màn hình bảng kết quả và đọc tên 12 đội, thứ hạng (Top 1-12) và số mạng hạ gục chỉ trong 2 giây. |
| **UC-10** | Sửa nóng tên tướng / Đảo vị trí người chơi trong 1 giây | Đạo Diễn Hình Ảnh | Skill 03 | Bắt buộc | Khi 2 tuyển thủ đổi tướng ở giây cuối hoặc máy nhìn nhầm, người trực bấm chuột đổi lại tướng hoặc kéo thả đổi chỗ 2 người ngay lập tức. |
| **UC-11** | Tự động tải bổ sung ảnh tướng mới khi Game cập nhật | Hệ Thống Tự Động | Skill 01, 02 | Cao | Khi game ra bản cập nhật có tướng mới, phần mềm tự tải ảnh vị tướng đó về máy để không bao giờ bị ô trống trên livestream. |

### Nhóm 2: Sổ Tay Quản Lý Giải Đấu, Đội Tuyển & Tự Động Tính Điểm (Skill 04)

| Mã UC | Tên Tình Huống Sử Dụng (Use Case) | Người Thực Hiện | Mảnh Ghép | Mức Ưu Tiên | Tóm Tắt Cách Hoạt Động (Ngôn Ngữ Đời Thường) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UC-12** | Tạo giải đấu mới và chọn thể thức thi đấu | Trưởng BTC / Vận Hành | Skill 04 | Bắt buộc | Nhập tên giải, logo giải, chọn thể thức: Loại trực tiếp, Nhánh thắng-thua, Vòng tròn tính điểm, hoặc Đấu tính điểm nhiều ván (Free Fire). |
| **UC-13** | Nhập nhanh danh sách Đội tuyển & Ảnh Tuyển thủ | Trưởng BTC / Vận Hành | Skill 04 | Bắt buộc | Nhập tên đội, tên viết tắt 3 chữ cái, màu đội, kéo thả thư mục ảnh logo đội và ảnh chân dung tách nền của các tuyển thủ vào phần mềm. |
| **UC-14** | Tự động bốc thăm và vẽ Sơ đồ Nhánh đấu (Bracket) | Trưởng BTC / Vận Hành | Skill 04 | Bắt buộc | Bấm nút chia cặp đấu tự động hoặc tự sắp xếp cặp đấu cho 4, 8, 16, 32 đội; phần mềm tự vẽ sơ đồ nhánh đấu chuẩn truyền hình. |
| **UC-15** | Cài đặt công thức tính điểm cho giải Sinh tồn (Free Fire) | Trưởng BTC / Vận Hành | Skill 04 | Bắt buộc | Cài đặt số điểm cho từng thứ hạng (ví dụ Top 1 = 12 điểm, Top 2 = 9 điểm...) và số điểm cho mỗi mạng hạ gục (1 mạng = 1 điểm). |
| **UC-16** | Chọn cặp đấu để nạp tự động toàn bộ thông tin lên phòng Live | Đạo Diễn Hình Ảnh | Skill 04 | Bắt buộc | Bấm vào cặp đấu "Đội A vs Đội B" trên nhánh đấu -> Logo, tên đội, màu áo, ảnh 10 người chơi tự nạp sẵn vào toàn bộ các cảnh phát sóng. |
| **UC-17** | Tự động cộng tỉ số ván đấu và đẩy đội thắng vào vòng sau | Hệ Thống / Vận Hành | Skill 04 | Bắt buộc | Khi kết thúc ván đấu, tự động tăng tỉ số (ví dụ từ 1-0 lên 2-0) và tự điền tên đội thắng vào nhánh Bán kết/Chung kết trên sơ đồ giải. |
| **UC-18** | Tự động cộng dồn Bảng Xếp Hạng Tổng qua nhiều ván (Free Fire) | Hệ Thống Tự Động | Skill 04 | Bắt buộc | Sau mỗi ván bắn, tự cộng điểm Hạng + điểm Hạ gục của 12 đội vào bảng tổng sắp (Ván 1 + Ván 2 + Ván 3...), tự xếp hạng từ 1 đến 12. |
| **UC-19** | Tự động gợi ý và bình chọn Tuyển thủ Xuất sắc nhất (MVP) | Hệ Thống / Vận Hành | Skill 04 | Cao | Dựa vào số mạng, hỗ trợ và sát thương cuối trận, phần mềm tự chọn ra người chơi hay nhất ván để chiếu lên màn hình vinh danh MVP. |

### Nhóm 3: Phòng Đồ Họa 6 Cảnh Quay & Phát Sóng Đa Nền Tảng (Skill 05)

| Mã UC | Tên Tình Huống Sử Dụng (Use Case) | Người Thực Hiện | Mảnh Ghép | Mức Ưu Tiên | Tóm Tắt Cách Hoạt Động (Ngôn Ngữ Đời Thường) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UC-20** | Tự động chuyển cảnh theo diễn biến trận đấu | Hệ Thống / Đạo Diễn | Skill 05 | Bắt buộc | Khi game vào Cấm/Chọn -> Tự bật Cảnh 3; Khi vào trận -> Tự bật Cảnh 4; Khi nổ nhà chính -> Tự bật Cảnh 5 (hoặc bấm tay 1 chạm). |
| **UC-21** | Điều khiển Cảnh 1 (Màn hình Chờ & Đếm ngược trước trận) | Đạo Diễn Hình Ảnh | Skill 05 | Bắt buộc | Hiển thị logo 2 đội sắp đấu, đồng hồ đếm ngược, lịch thi đấu trong ngày và phát nhạc nền sôi động trong lúc chờ người chơi vào phòng. |
| **UC-22** | Điều khiển Cảnh 2 (Bàn Bình Luận Viên - Caster Cam) | Đạo Diễn Hình Ảnh | Skill 05 | Bắt buộc | Ghép hình ảnh từ 1 hoặc 2 camera của Bình luận viên kèm bảng tên Bình luận viên và tỉ số cặp đấu hiện tại. |
| **UC-23** | Hiển thị Cảnh 3 & Cảnh 4 (Đồ họa Cấm/Chọn & Trong Trận) | Hệ Thống Tự Động | Skill 05 | Bắt buộc | Tự động đắp lớp áo đồ họa Cấm/Chọn (có hiệu ứng động) và thanh tỉ số, bảng vàng, thông tin 10 tuyển thủ đè lên hình ảnh trận đấu. |
| **UC-24** | Hiển thị Cảnh 5 (Bảng Tổng Sắp, Nhánh Đấu & Vinh danh MVP) | Đạo Diễn Hình Ảnh | Skill 05 | Bắt buộc | Chiếu bảng kết quả sau trận, hình ảnh lớn của tuyển thủ MVP và sơ đồ nhánh đấu vừa được cập nhật điểm. |
| **UC-25** | Bấm nút Khẩn cấp Cảnh 6 (Tạm dừng Kỹ thuật - Che màn hình) | Đạo Diễn / Trọng Tài | Skill 05 | Bắt buộc | Khi tuyển thủ rớt mạng cần dừng trận, bấm 1 nút là che ngay màn hình game (chống lộ vị trí trên live) và hiện thông báo tạm dừng. |
| **UC-26** | Chèn thời gian trễ chống nhìn trộm livestream (Stream Delay) | Đạo Diễn Hình Ảnh | Skill 05 | Cao | Cho phép cài đặt phát chậm hơn thực tế 15 giây, 30 giây hoặc 2 phút nếu giải đấu yêu cầu chống tuyển thủ mở điện thoại xem trộm. |
| **UC-27** | Phát trực tiếp đồng thời lên YouTube, Facebook, TikTok, Twitch | Đạo Diễn Hình Ảnh | Skill 05 | Bắt buộc | Nhập khóa phát sóng của các kênh một lần duy nhất; bấm "Lên Sóng" là phát cùng lúc lên cả 4 nền tảng mà không cần mở OBS/vMix. |
| **UC-28** | Tự động dàn trang Màn hình Ngang (16:9) và Màn hình Dọc (9:16) | Hệ Thống Tự Động | Skill 05 | Bắt buộc | Cùng một trận đấu nhưng kênh YouTube/Facebook nhận khung ngang chuẩn TV, còn kênh TikTok tự nhận khung dọc dễ nhìn trên điện thoại. |
| **UC-29** | Tự động ghi hình trận đấu nét cao vào ổ cứng máy tính | Hệ Thống Tự Động | Skill 05 | Cao | Vừa phát trực tiếp vừa lưu lại file video gốc chất lượng cao vào ổ cứng để làm tư liệu cắt video ngắn (Highlight) sau giải. |
| **UC-30** | Thay đổi giao diện màu sắc & Logo Nhà tài trợ giải đấu | Trưởng BTC / Vận Hành | Skill 05 | Trung bình | Cho phép đổi tông màu chủ đạo của giải và thêm danh sách logo nhà tài trợ tự động chạy xoay vòng ở góc màn hình. |

---

## 3. BẢNG 3: ĐẶC TẢ CHI TIẾT 6 LUỒNG USE CASE CỐT LÕI (DETAILED USE CASE SPECS)

Dưới đây là bảng mô tả từng bước đi (từ lúc bấm nút đến lúc xử lý lỗi) của 6 tính năng quan trọng nhất trong phần mềm:

### 3.1. Đặc tả `UC-04`: Nhập Số Phòng + Mật khẩu để Trọng tài Ảo tự vào phòng và Lên sóng
| Hạng mục | Nội dung chi tiết (Ngôn ngữ đời thường) |
| :--- | :--- |
| **Mục tiêu** | Người dùng chỉ cần chọn game, gõ Số Phòng + Mật khẩu là phần mềm tự vào phòng lấy cả hình ảnh lẫn số liệu trận đấu. |
| **Điều kiện trước khi làm** | Trọng tài hoặc chủ phòng đã tạo xong phòng đấu tùy chọn trong game (Liên Quân, Tốc Chiến, Free Fire, VALORANT) và có Số Phòng. |
| **Các bước thực hiện chuẩn** | **Bước 1**: Người dùng bấm chọn biểu tượng Game trên màn hình chính.<br>**Bước 2**: Người dùng nhập **Số Phòng (ID Phòng)** và **Mật khẩu phòng** (nếu có), sau đó bấm nút **"Vào Phòng"**. <br>**Bước 3**: Phần mềm đánh thức tài khoản **Trọng tài Ảo** đang trực sẵn, tự gõ Số Phòng + Mật khẩu và nhảy vào ngồi ở ô **Quan sát (Khán giả)** của phòng đấu trong vòng 3-5 giây.<br>**Bước 4**: Trên màn hình phần mềm hiện hình ảnh trực tiếp bên trong phòng chờ kèm danh sách các người chơi đang ngồi trong phòng.<br>**Bước 5**: Khi chủ phòng bấm bắt đầu trận đấu, phần mềm tự động thu hình ảnh + đọc dữ liệu trận đấu theo thời gian thực. |
| **Xử lý khi gặp tình huống bất thường** | - **Tình huống A (Gõ sai Số Phòng hoặc Mật khẩu)**: Sau 3 giây, phần mềm báo rõ tiếng Việt: *"Không tìm thấy phòng hoặc sai mật khẩu, vui lòng kiểm tra lại"* để người dùng nhập lại ngay.<br>- **Tình huống B (Ô Khán giả trong phòng đã kín chỗ)**: Phần mềm báo: *"Ô Trọng tài trong phòng đã đầy, vui lòng bảo chủ phòng trống 1 ghế Quan sát"* hoặc chuyển ngay sang chế độ nhận hình ảnh trực tiếp từ máy chủ phòng.<br>- **Tình huống C (Tài khoản Trọng tài Ảo số 1 đang bận)**: Phần mềm tự động lấy tài khoản Trọng tài Ảo số 2 trong kho dự phòng vào thay thế ngay lập tức. |

### 3.2. Đặc tả `UC-06` & `UC-10`: Tự động bắt Cấm/Chọn tướng tức thời & Bàn phím cứu nguy 1 giây
| Hạng mục | Nội dung chi tiết (Ngôn ngữ đời thường) |
| :--- | :--- |
| **Mục tiêu** | Tự động hiển thị mặt tướng đang cấm/chọn lên màn hình phát sóng trong chưa đầy nửa giây, và cho phép sửa tay trong 1 giây nếu tuyển thủ đổi tướng. |
| **Điều kiện trước khi làm** | Phần mềm đã kết nối vào phòng đấu và hai đội bước vào màn hình Cấm/Chọn tướng. |
| **Các bước thực hiện chuẩn** | **Bước 1**: Phần mềm nhận tín hiệu trận đấu vừa bước vào giai đoạn Cấm/Chọn -> Tự động bật **Cảnh 3 (Màn hình Cấm/Chọn)**.<br>**Bước 2**: Mỗi 0.1 giây (với game PC) hoặc 0.2 giây (với game Điện thoại), phần mềm kiểm tra xem ô Cấm và ô Chọn của 10 người chơi có thay đổi gì không.<br>**Bước 3**: Khi người chơi số 1 Đội Xanh vừa nhấp nháy chọn tướng -> Trên màn hình phát sóng, ô số 1 Đội Xanh hiện ảnh tướng đó ở trạng thái "Đang suy nghĩ".<br>**Bước 4**: Khi người chơi bấm "Khóa tướng" -> Trên màn hình phát sóng chạy hiệu ứng khóa tướng sáng rực kèm tên vị tướng và tên tuyển thủ. |
| **Xử lý khi gặp tình huống bất thường** | - **Tình huống A (Hai người chơi đổi tướng cho nhau ở 2 giây cuối)**: Người trực máy chỉ cần dùng chuột kéo ô người chơi số 1 thả vào ô người chơi số 3 trên bàn điều khiển -> Hai vị tướng đổi chỗ cho nhau ngay lập tức trên livestream.<br>- **Tình huống B (Màn hình điện thoại bị thông báo che mất mặt tướng)**: Phần mềm giữ nguyên hình ảnh cuối cùng hợp lệ và nhấp nháy nhắc người trực; người trực gõ 2 chữ cái đầu tên tướng (ví dụ gõ `FL` ra ngay `Florentino`) để khóa bằng tay trong 1 giây. |

### 3.3. Đặc tả `UC-09` & `UC-18`: Tự động chụp & đọc Bảng kết quả 12 đội Free Fire trong 2 giây
| Hạng mục | Nội dung chi tiết (Ngôn ngữ đời thường) |
| :--- | :--- |
| **Mục tiêu** | Thay thế hoàn toàn việc nhập điểm Excel bằng tay: Tự đọc thứ hạng (Top 1-12) và số mạng hạ gục của cả 12 đội ngay khi trận đấu kết thúc. |
| **Điều kiện trước khi làm** | Giải đấu Free Fire đã cài đặt sẵn công thức tính điểm (ở `UC-15`) và trận đấu vừa kết thúc, hiện bảng tổng kết trong game. |
| **Các bước thực hiện chuẩn** | **Bước 1**: Ngay khi màn hình game xuất hiện chữ "BOOYAH" và chuyển sang Bảng Kết Quả Trận Đấu, phần mềm tự động chụp lại khung hình nét nhất.<br>**Bước 2**: Bộ mắt đọc tự động cắt 12 dòng tương ứng với 12 đội, đọc chính xác: Tên đội, Thứ hạng sinh tồn (từ 1 đến 12) và Số mạng hạ gục.<br>**Bước 3**: Chỉ sau 2 giây, toàn bộ bảng điểm tính sẵn (Điểm Hạng + Điểm Hạ Gục = Tổng Điểm Ván) hiện lên màn hình điều khiển của người trực máy.<br>**Bước 4**: Người trực máy nhìn lướt qua, bấm nút **"Xác Nhận & Đẩy Lên Sóng"** -> Bảng Xếp Hạng Tổng sau các ván đấu hiện lên livestream với hiệu ứng vinh danh đội Top 1. |
| **Xử lý khi gặp tình huống bất thường** | - **Tình huống A (Tên người chơi trong game đặt ký tự đặc biệt quá rối)**: Phần mềm đối chiếu theo vị trí ô đội tuyển (Slot 1 đến Slot 12) đã đăng ký từ đầu phòng đấu nên dù tên có ký tự lạ vẫn nhận đúng đội 100%.<br>- **Tình huống B (Người trực muốn trừ điểm phạt 1 đội vi phạm luật giải)**: Trên bảng xác nhận có sẵn ô "Điểm cộng/trừ", người trực gõ `-2` vào đội vi phạm rồi bấm Xác nhận. |

### 3.4. Đặc tả `UC-28`: Tự động phát đồng thời Màn Ngang (16:9) và Màn Dọc (9:16 cho TikTok)
| Hạng mục | Nội dung chi tiết (Ngôn ngữ đời thường) |
| :--- | :--- |
| **Mục tiêu** | Chỉ dùng 1 máy tính nhưng vừa phát hình ngang cho người xem YouTube/Facebook trên TV/máy tính, vừa phát hình dọc vừa khít màn hình điện thoại cho người xem TikTok. |
| **Điều kiện trước khi làm** | Người dùng đã bật chế độ "Phát song song Ngang & Dọc" và nhập khóa phát sóng của YouTube/Facebook + TikTok. |
| **Các bước thực hiện chuẩn** | **Bước 1**: Từ 1 nguồn hình ảnh trận đấu gốc, phần mềm tự tạo ra 2 khung vẽ ngầm bên trong máy.<br>**Bước 2 (Khung Ngang 16:9)**: Giữ nguyên toàn cảnh bản đồ game, đặt thanh tỉ số dài ở mép trên, 2 cột 10 người chơi ở 2 mép trái/phải, camera bình luận viên ở góc dưới.<br>**Bước 3 (Khung Dọc 9:16 cho TikTok)**: Phần mềm tự động lấy khu vực giao tranh chính ở giữa màn hình đặt vào trung tâm chiều dọc; đặt bảng tỉ số thu gọn thật to rõ ở phần trán phía trên; đặt camera bình luận viên ở phần chân phía dưới.<br>**Bước 4**: Nén và gửi đồng thời luồng Ngang lên YouTube/Facebook và luồng Dọc lên TikTok. |
| **Xử lý khi gặp tình huống bất thường** | - **Tình huống A (Máy tính cấu hình trung bình bị quá tải khi chạy 2 luồng)**: Phần mềm tự động giảm nhẹ độ phân giải của luồng phụ xuống mức vừa đủ nét trên điện thoại (720x1280) để ưu tiên giữ độ mượt 60 khung hình/giây không bị giật. |

---

## 4. BẢNG 4: DANH MỤC MÀN HÌNH & TRẠNG THÁI GIAO DIỆN (SCREEN & STATE MATRIX)

Phần mềm gồm **6 Màn hình điều khiển dành cho người làm giải** và **6 Màn hình đồ họa phát sóng dành cho khán giả xem live**:

| Mã Màn Hình | Tên Màn Hình | Dành Cho Ai Nhìn | Trạng Thái 1: Khi Mới Mở (Chưa có dữ liệu) | Trạng Thái 2: Khi Đang Chạy Bình Thường | Trạng Thái 3: Khi Gặp Sự Cố / Mất Kết Nối |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SCR-01** | **Màn Hình Chọn Game & Tạo Giải** | Người Vận Hành | Hiện 5 nút chọn Game lớn + Nút "Tạo giải đấu mới" hoặc "Mở giải đấu cũ". | Hiện danh sách các giải đấu đang diễn ra và trận đấu sắp tới gần nhất. | Báo nhắc nếu ổ cứng máy tính còn trống dưới 5GB (để lưu video). |
| **SCR-02** | **Màn Hình Quản Lý Đội & Nhánh Đấu** | Trưởng BTC / Vận Hành | Hiện khung trống kèm nút "Nhập danh sách đội mẫu" và "Kéo thả thư mục ảnh". | Hiện sơ đồ nhánh đấu trực quan; trận nào đang đánh có viền sáng xanh. | Tự tô màu vàng vào đội nào còn thiếu ảnh Logo (tự thay bằng Logo mặc định). |
| **SCR-03** | **Màn Hình Cổng Kết Nối Phòng Game (1 Chạm)** | Người Vận Hành / Trọng Tài | Hiện ô nhập "Số Phòng + Mật khẩu" hoặc nút "Tự tìm Game trên máy tính". | Đèn báo xanh lá: "Đã kết nối - Tốc độ phản hồi: 0.1 giây" kèm hình thu nhỏ của game. | Đèn chuyển cam: "Đang tự kết nối lại vào phòng..." và giữ nguyên dữ liệu cuối cùng. |
| **SCR-04** | **Bàn Điều Khiển Trực Tiếp & Cứu Nguy 1 Giây** | Đạo Diễn Hình Ảnh | Hiện 10 ô người chơi trống (hoặc 12 đội Free Fire) đang chờ vào trận. | Tự động nhảy ảnh tướng, KDA, tiền; các nút đổi tướng nhanh luôn sáng sẵn để bấm. | Viền đỏ nhấp nháy ở đúng ô vị tướng mà máy nghi ngờ nhìn chưa rõ để người trực bấm xác nhận. |
| **SCR-05** | **Bàn Đạo Diễn Chuyển Cảnh (6 Cảnh Quay)** | Đạo Diễn Hình Ảnh | Mặc định chọn sẵn "Cảnh 1 - Màn hình chờ trước trận". | Bên trái hiện Cảnh xem trước (Preview), bên phải hiện Cảnh đang phát sóng (Program). | Có nút đỏ lớn "TẠM DỪNG KHẨN CẤP (CHE MÀN HÌNH)" luôn nằm cố định ở góc trên cùng. |
| **SCR-06** | **Màn Hình Quản Lý Kênh Phát Sóng (Ngành & Dọc)** | Đạo Diễn Hình Ảnh | Hiện 4 ô: YouTube, Facebook, TikTok, Twitch ở trạng thái "Chưa bật". | Hiện tốc độ mạng gửi đi, số giây đã phát sóng và trạng thái "Đang Live ổn định". | Nếu 1 kênh (ví dụ TikTok) bị rớt mạng, tự động nối lại ngầm cho kênh đó mà không làm ngắt YouTube/Facebook. |
| **SCR-07** | **Cảnh Phát Sóng 1: Màn Hình Chờ Trước Trận** | Khán Giả Xem Live | Hiện tên giải đấu và dòng chữ "Trận đấu sẽ bắt đầu sau ít phút". | Hiện Logo Đội A vs Đội B, tỉ số BO3/BO5, đồng hồ đếm ngược và lịch các trận trong ngày. | Nếu quá giờ đếm ngược về 00:00 mà chưa vào trận, tự đổi dòng chữ thành "Hai đội đang chuẩn bị vào phòng đấu". |
| **SCR-08** | **Cảnh Phát Sóng 2: Bàn Bình Luận Viên** | Khán Giả Xem Live | Hiện khung nền giải đấu nếu chưa bật camera Bình luận viên. | Hiện 1 hoặc 2 khung hình Bình luận viên kèm tên và nhận định trước trận. | Nếu camera Bình luận viên bị lỏng dây, tự động chuyển sang ảnh đại diện của Bình luận viên kèm tiếng nói. |
| **SCR-09** | **Cảnh Phát Sóng 3: Đồ Họa Cấm/Chọn Tướng** | Khán Giả Xem Live | Hiện 10 khung người chơi cùng ảnh chân dung và tên thi đấu của 2 đội. | Hiện hiệu ứng chọn tướng, cấm tướng, đồng hồ đếm ngược chạy mượt theo từng phần mười giây. | Nếu không lấy được đồng hồ đếm ngược, tự ẩn con số giây đi mà vẫn giữ nguyên mặt các tướng đã chọn. |
| **SCR-10** | **Cảnh Phát Sóng 4: Đồ Họa Trong Trận Đấu** | Khán Giả Xem Live | Hiện khung hình game sạch kèm thanh tỉ số 2 đội ở trên đỉnh. | Hiện đầy đủ: Thanh tỉ số, mạng hạ gục, chênh lệch vàng, thời gian Rồng/Baron, hoặc danh sách 12 đội còn sống. | Nếu nguồn dữ liệu số bị ngắt tạm thời, vẫn giữ nguyên hình ảnh game và tỉ số ván đấu để khán giả xem bình thường. |
| **SCR-11** | **Cảnh Phát Sóng 5: Bảng Xếp Hạng & Vinh Danh MVP** | Khán Giả Xem Live | Hiện kết quả thắng/thua của cặp đấu vừa xong. | Hiện ảnh lớn Tuyển thủ MVP + Thông số ấn tượng, sau đó chuyển sang Sơ đồ nhánh đấu / Bảng tổng sắp 12 đội. | Nếu chưa có ảnh chân dung tuyển thủ MVP, tự động dùng hình ảnh vị tướng người đó vừa chơi làm hình nền chính. |
| **SCR-12** | **Cảnh Phát Sóng 6: Màn Hình Tạm Dừng Kỹ Thuật** | Khán Giả Xem Live | Luôn nạp sẵn trong bộ nhớ để bật lên trong 0.05 giây khi bấm nút. | Che kín 100% màn hình trận đấu, bật nhạc chờ nhẹ và hiện thông báo "Trận đấu đang tạm dừng kỹ thuật". | Chỉ tắt cảnh này khi Đạo diễn bấm xác nhận "Quay lại trận đấu" để tránh lộ hình ảnh ngoài ý muốn. |

---

## 5. BẢNG 5: THIẾT KẾ LƯU TRỮ DỮ LIỆU (DATA DICTIONARY - 7 BẢNG DỮ LIỆU CỐT LÕI)

Để phần mềm quản lý được hàng chục giải đấu mà không bị lẫn lộn, dữ liệu bên trong máy tính được tổ chức thành 7 bảng rõ ràng sau:

| STT | Tên Bảng Lưu Trữ | Dùng Để Lưu Cái Gì? | Các Cột Thông Tin Chính Trong Bảng (Viết Dễ Hiểu) | Ví Dụ Thực Tế |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Bảng Giải Đấu (`Tournaments`)** | Lưu thông tin chung của từng giải đấu | Mã giải, Tên giải đấu, Tựa game thi đấu, Thể thức chia bảng, Quy tắc tính điểm, Tông màu chủ đạo, Danh sách logo nhà tài trợ | Giải: *Giải Sinh Viên Toàn Quốc 2026* - Game: *Liên Quân Mobile* - Thể thức: *Loại trực tiếp 16 đội* |
| **2** | **Bảng Đội Tuyển (`Teams`)** | Lưu hồ sơ các đội tham gia giải | Mã đội, Tên đầy đủ, Tên viết tắt (3-4 chữ cái), Đường dẫn ảnh Logo nền trong suốt, Màu đại diện của đội, Thứ hạng hạt giống | Đội: *Tia Chớp Đỏ* - Viết tắt: *TCD* - Màu: *Đỏ tươi* |
| **3** | **Bảng Tuyển Thủ (`Players`)** | Lưu thông tin và ảnh từng người chơi | Mã người chơi, Thuộc Đội nào, Tên thi đấu trong game, Mã tài khoản game (nếu có), Vị trí thi đấu, Đường dẫn ảnh chân dung tách nền | Tên: *TCD.NamPro* - Vị trí: *Đi rừng* - Ảnh: `nampro.png` |
| **4** | **Bảng Cặp Đấu & Nhánh Đấu (`Matches_Bracket`)** | Lưu sơ đồ nhánh đấu và lịch các trận | Mã trận đấu, Vòng đấu (Tứ kết / Bán kết / Chung kết), Đội Xanh, Đội Đỏ, Kiểu đấu (Chạm 1, Chạm 2, Chạm 3), Tỉ số hiện tại, Đội chiến thắng, Trận tiếp theo sẽ nhảy tới | *Tứ kết 1*: Đội TCD (2) vs Đội Rồng Xanh (1) -> Đội TCD tự nhảy vào *Bán kết 1* |
| **5** | **Bảng Phiên Kết Nối Phòng Game (`Room_Sessions`)** | Lưu cách phần mềm đang nối vào phòng game | Mã phiên, Tựa game, Kiểu kết nối (Mã giải đấu / Trọng tài Ảo / Dây truyền màn hình), Số Phòng (ID), Mật khẩu phòng, Tài khoản Trọng tài Ảo đang dùng, Độ trễ hiện tại | Game: *Free Fire* - Số Phòng: `889922` - Mật khẩu: `123` - Trọng tài Ảo: `Bot_Live_01` - Độ trễ: `0.2 giây` |
| **6** | **Bảng Trạng Thái Trận Đấu Tức Thời (`Live_Match_State`)** | Lưu mọi con số đang nhảy từng giây trong trận | Giai đoạn hiện tại (Đang chờ / Đang Cấm Chọn / Đang Đánh / Đã Xong), Thời gian đồng hồ, Danh sách tướng Cấm, Danh sách tướng Chọn của 10 người, Điểm Hạ gục / Chết / Hỗ trợ, Lượng tiền 2 bên, Rồng / Baron / Bom Spike | Phút `14:25` - Đội Xanh: `12 mạng (32.5k vàng)` vs Đội Đỏ: `8 mạng (29.1k vàng)` |
| **7** | **Bảng Kết Quả & Xếp Hạng Sinh Tồn (`BR_Standings`)** | Lưu điểm qua từng ván của 12 đội Free Fire | Mã ván đấu (Ván 1, Ván 2... Ván 6), Mã đội (1 trong 12 đội), Thứ hạng sinh tồn trong ván (Top 1 -> Top 12), Số mạng hạ gục trong ván, Điểm Hạng, Điểm Mạng, Tổng Điểm Cộng Dồn, Thay đổi thứ hạng (Tăng/Giảm mấy bậc) | Ván 1 - Đội TCD: *Hạng 1 (12 điểm) + 10 mạng (10 điểm) = 22 điểm (Đứng Top 1)* |

---

## 6. BẢNG 6: MA TRẬN PHƯƠNG THỨC VÀO PHÒNG & CAM KẾT TỐC ĐỘ THỜI GIAN THỰC (REAL-TIME SLA MATRIX)

Bảng này quy định rõ: Với từng tựa game, phần mềm sẽ dùng cách nào làm **Cách Chính (Nhanh nhất)** và **Cách Dự Phòng**, cùng cam kết tốc độ tối đa từ lúc sự kiện xảy ra trong game đến lúc hiện lên màn hình livestream:

| Tựa Game | Phương Thức Ưu Tiên Số 1 (Tự động & Nhanh nhất) | Phương Thức Linh Hoạt Số 2 (Tiện lợi nhất) | Tốc Độ Bắt Cấm/Chọn Tướng | Tốc Độ Cập Nhật Tỉ Số Trong Trận | Tốc Độ Tổng Kết Bảng Điểm Cuối Trận | Mức Độ An Toàn Tài Khoản Game |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Liên Minh Huyền Thoại (PC)** | Tự tạo Mã Phòng Giải Đấu + Đọc trực tiếp từ cổng dữ liệu hợp lệ của game trên máy Trọng tài | Chỉ cần mở game vào xem bất kỳ phòng đấu nào là phần mềm tự bắt dính | **0.1 giây** (Tức thời 100%) | **0.1 - 0.2 giây** (Mạng, Vàng, Đồ, Rồng, Baron) | **0.5 giây** (Đầy đủ sát thương, KDA, MVP) | Tuyệt đối an toàn (Dùng cổng chính thức của Riot) |
| **VALORANT (PC)** | Đọc trực tiếp trạng thái Phòng đấu & Sự kiện trận đấu trên máy Trọng tài | Trọng tài Ảo tự vào phòng bằng Mã Tổ Đội + Đọc hình ảnh tốc độ cao | **0.2 giây** (Chọn Đặc vụ & Bản đồ) | **0.2 - 0.3 giây** (Tỉ số vòng, Đặt bom Spike, Tiền, Súng) | **1.0 giây** (Bảng điểm KDA & MVP toàn trận) | Tuyệt đối an toàn (Tuân thủ chuẩn chống gian lận Vanguard) |
| **Liên Quân Mobile (Điện thoại)** | Nhập **Số Phòng + Mật khẩu** -> **Trọng tài Ảo** tự nhảy vào ghế Khán giả và đọc luồng hình nội bộ 60 khung hình/giây | Cắm dây truyền màn hình từ điện thoại Trọng tài vào máy tính (Đạo diễn tự vuốt camera) | **0.2 - 0.4 giây** (Nhận diện mặt tướng vừa chọn & đồng hồ) | **0.3 - 0.5 giây** (Tỉ số mạng hạ gục, Vàng, Thời gian, Trụ) | **1.5 giây** (Đọc bảng tổng kết 10 người chơi & MVP) | Tuyệt đối an toàn (Chỉ nhìn hình ảnh từ ghế Khán giả, không can thiệp vào game) |
| **Liên Minh: Tốc Chiến (Điện thoại)** | Nhập **Số Phòng + Mật khẩu** (hoặc mời kết bạn) -> **Trọng tài Ảo** tự vào ghế Khán giả | Cắm dây truyền màn hình từ điện thoại Trọng tài vào máy tính | **0.2 - 0.4 giây** (Nhận diện tướng Cấm & Chọn của 10 người) | **0.3 - 0.5 giây** (Tỉ số mạng, Vàng, Rồng nguyên tố, Baron) | **1.5 giây** (Bảng kết quả cuối trận & MVP) | Tuyệt đối an toàn (100% xử lý ngoài luồng hình ảnh) |
| **Free Fire (Điện thoại - 12 Đội)** | Nhập **Số Phòng + Mật khẩu** -> **Trọng tài Ảo** tự nhảy vào ô Quan sát của phòng 48 người | Cắm dây truyền màn hình từ điện thoại Trọng tài vào máy tính | Không có Cấm/Chọn (Tự nạp danh sách 12 đội ở phòng chờ trong **1 giây**) | **0.5 giây** (Theo dõi số người còn sống của 12 đội & thông báo đội bị loại) | **2.0 giây** (Chụp và đọc xong toàn bộ Hạng + Số mạng của cả 12 đội, tự cộng điểm) | Tuyệt đối an toàn (Không cài bất kỳ phần mềm lạ nào vào điện thoại thi đấu) |

---

## 7. BẢNG 7: TỔNG HỢP 50 KỊCH BẢN KIỂM THỬ (MASTER TEST CASE SUITE: `TC-01` -> `TC-50`)

Đây là bảng danh sách 50 bài kiểm tra bắt buộc phải vượt qua khi xây dựng phần mềm để đảm bảo phần mềm chạy mượt, đúng tốc độ thời gian thực và không bao giờ bị sập giữa lúc đang phát sóng giải đấu:

### Phần A: Kiểm thử Kết nối Game Máy Tính - Liên Minh & VALORANT (`TC-01` -> `TC-10`)

| Mã TC | Tên Bài Kiểm Tra | Điều Kiện Chuẩn Bị | Thao Tác Thực Hiện | Kết Quả Mong Đợi (Đạt = `[PASS]`) | Mức Độ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Tự động phát hiện Liên Minh Huyền Thoại vừa mở | Máy tính đang mở phần mềm, chưa mở game | Mở Liên Minh Huyền Thoại lên máy tính | Trong vòng dưới 2 giây, phần mềm tự chuyển đèn xanh: *"Đã kết nối Liên Minh Huyền Thoại"* mà không cần bấm tìm thư mục. | Bắt buộc |
| **TC-02** | Tạo Mã Phòng Giải Đấu Liên Minh tự động | Đã chọn cặp đấu Đội A vs Đội B | Bấm nút "Tạo Mã Phòng Giải Đấu" | Phần mềm sinh ra mã phòng hợp lệ; khi người chơi dán mã vào game thì vào đúng phòng đấu tùy chọn. | Bắt buộc |
| **TC-03** | Tốc độ bắt tướng Đang Nhấp Nháy (Hover) trong Liên Minh | Đang ở màn hình Cấm/Chọn Liên Minh | Người chơi số 1 bấm vào ảnh tướng Lee Sin (chưa khóa) | Trong vòng **dưới 0.15 giây**, ô số 1 trên màn hình phát sóng hiện ngay ảnh Lee Sin ở trạng thái đang chọn. | Bắt buộc |
| **TC-04** | Tốc độ bắt tướng Đã Khóa (Lock-in) và tướng Cấm (Ban) | Đang ở màn hình Cấm/Chọn Liên Minh | Hai đội thực hiện đủ 10 lượt Cấm và 10 lượt Chọn | Cả 10 ô Cấm và 10 ô Chọn hiện đúng 100% tên tướng, ảnh tướng và phép bổ trợ với độ trễ **dưới 0.1 giây**. | Bắt buộc |
| **TC-05** | Đồng bộ thời gian, mạng hạ gục và vàng trong trận Liên Minh | Trận đấu Liên Minh đang diễn ra ở phút thứ 10 | Có 1 mạng hạ gục xảy ra trong game | Ngay lập tức (dưới 0.2 giây), tỉ số mạng trên thanh đỉnh màn hình tăng thêm 1 và chênh lệch vàng cập nhật đúng số thực tế. | Bắt buộc |
| **TC-06** | Tự động bắt biểu tượng Rồng, Sứ Giả, Baron | Đội Xanh vừa ăn xong Rồng Lửa | Quan sát thanh tỉ số trên màn hình phát sóng | Biểu tượng Rồng Lửa tự động hiện thêm vào bên Đội Xanh kèm đồng hồ đếm ngược thời gian Rồng ra tiếp theo. | Cao |
| **TC-07** | Tự động phát hiện VALORANT và đọc màn hình Chọn Đặc Vụ | Mở VALORANT vào phòng đấu tùy chọn | 10 người chơi chọn 10 Đặc vụ (Jett, Reyna, Omen...) | Phần mềm hiển thị đúng 100% chân dung 10 Đặc vụ của 2 đội Tấn Công và Phòng Thủ trong **0.2 giây**. | Bắt buộc |
| **TC-08** | Bắt trạng thái Đặt Bom (Spike Planted) trong VALORANT | Đang trong vòng đấu VALORANT | Đội Tấn Công vừa đặt bom Spike xuống đất | Trong vòng **0.2 giây**, thanh tỉ số trên đầu màn hình livestream tự chuyển sang hiệu ứng nhấp nháy đỏ báo động bom đã đặt. | Bắt buộc |
| **TC-09** | Tự động đổi bên Tấn Công / Phòng Thủ sau vòng 12 VALORANT | Kết thúc vòng đấu thứ 12 (Hết hiệp 1) | Sang vòng đấu thứ 13 (Đổi bên) | Phần mềm tự động đảo màu (Đỏ/Xanh ngọc) và biểu tượng Khiên/Kiếm của hai đội mà không làm nhầm điểm số. | Bắt buộc |
| **TC-10** | Khả năng tự nối lại khi trò chơi trên máy tính bị tắt đột ngột | Đang trong trận đấu PC | Giả lập tắt ngang game rồi mở lại vào xem tiếp | Phần mềm không bị văng hay treo màn hình; giữ nguyên tỉ số hiện tại và tự bắt lại dữ liệu ngay khi game mở lên lại. | Bắt buộc |

### Phần B: Kiểm thử Trọng Tài Ảo & Mắt Đọc Tốc Độ Cao Cho Game Điện Thoại (`TC-11` -> `TC-22`)

| Mã TC | Tên Bài Kiểm Tra | Điều Kiện Chuẩn Bị | Thao Tác Thực Hiện | Kết Quả Mong Đợi (Đạt = `[PASS]`) | Mức Độ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-11** | Trọng tài Ảo tự vào phòng Liên Quân bằng Số Phòng + Mật khẩu | Tạo sẵn 1 phòng đấu giải Liên Quân trên điện thoại | Nhập Số Phòng + Mật khẩu vào phần mềm và bấm "Vào Phòng" | Trong vòng **3 - 5 giây**, tài khoản Trọng tài Ảo tự xuất hiện ở ô Khán giả của phòng Liên Quân và truyền hình ảnh lên phần mềm. | Bắt buộc |
| **TC-12** | Trọng tài Ảo tự vào phòng Free Fire 48 người | Tạo sẵn 1 phòng tùy chọn Free Fire có mật khẩu | Nhập Số Phòng + Mật khẩu vào phần mềm và bấm "Vào Phòng" | Tài khoản Trọng tài Ảo tự vào đúng ô Quan sát (Spectator) của phòng Free Fire mà không nhảy nhầm vào ô người chơi. | Bắt buộc |
| **TC-13** | Báo lỗi rõ ràng khi người dùng gõ sai Số Phòng hoặc Mật khẩu | Mở màn hình nhập phòng | Cố tình gõ sai mật khẩu phòng đấu | Sau 3 giây, phần mềm hiện thông báo tiếng Việt rõ ràng: *"Sai mật khẩu phòng đấu, vui lòng nhập lại"* và cho nhập lại ngay. | Bắt buộc |
| **TC-14** | Tự động đổi sang Trọng tài Ảo dự phòng khi tài khoản số 1 bận | Tài khoản Trọng tài Ảo số 1 đang ở trong 1 trận khác | Bấm "Vào Phòng" cho trận đấu mới | Phần mềm tự lấy Tài khoản Trọng tài Ảo số 2 vào phòng mới mà người dùng không cần phải tự đăng nhập lại. | Cao |
| **TC-15** | Nhận diện mặt tướng Cấm/Chọn Liên Quân trong 0.3 giây | Đang ở màn hình Cấm/Chọn Liên Quân Mobile | Hai đội lần lượt cấm 8 tướng và chọn 10 tướng | Bộ mắt đọc nhận diện chính xác **tối thiểu 99%** mặt tướng (kể cả khi tướng có mặc trang phục) trong vòng **dưới 0.3 giây**. | Bắt buộc |
| **TC-16** | Nhận diện mặt tướng Cấm/Chọn Liên Minh: Tốc Chiến | Đang ở màn hình Cấm/Chọn Tốc Chiến | Hai đội thực hiện cấm và chọn tướng | Nhận diện đúng vị tướng ở cả 10 vị trí và hiển thị đồng bộ lên màn hình phát sóng trong **dưới 0.3 giây**. | Bắt buộc |
| **TC-17** | Đọc tỉ số mạng hạ gục và thời gian trong trận Liên Quân / Tốc Chiến | Trận đấu trên điện thoại đang diễn ra | Có mạng hạ gục mới làm số mạng nhảy từ 5 lên 6 | Trong vòng **0.4 giây**, con số mạng hạ gục trên bảng tỉ số của phần mềm tự nhảy từ 5 lên 6 khớp với trong game. | Bắt buộc |
| **TC-18** | Tự động căn khung hình khi đổi điện thoại màn hình dài/ngắn khác nhau | Thử truyền hình ảnh từ iPad (4:3), iPhone (19.5:9) và Android (20:9) | Cắm lần lượt từng thiết bị vào phần mềm | Phần mềm tự phát hiện viền đen và tự co giãn các ô nhìn mặt tướng đúng vị trí mà không bắt người dùng phải đo vẽ lại. | Bắt buộc |
| **TC-19** | Theo dõi trạng thái sống/chết của 12 đội Free Fire lúc đang bắn | Trận Free Fire đang có 12 đội giao tranh | Đội số 5 vừa bị bắn hạ người cuối cùng (4 người đều bị hạ) | Trong vòng **0.5 giây**, ô của Đội số 5 trên bảng mép màn hình tối xuống và hiện thông báo *"Đội số 5 dừng cuộc chơi"*. | Bắt buộc |
| **TC-20** | Tự động chụp & đọc Bảng kết quả 12 đội Free Fire trong 2 giây | Trận Free Fire vừa kết thúc, hiện bảng tổng kết | Để phần mềm tự chụp và đọc bảng kết quả | Trong vòng **dưới 2.0 giây**, phần mềm đọc đúng 100% Thứ hạng (Top 1-12) và Số mạng hạ gục của cả 12 đội. | Bắt buộc |
| **TC-21** | Chống đọc nhầm khi màn hình điện thoại có hiệu ứng khói lửa | Lúc khóa tướng có hiệu ứng chớp sáng trắng đè lên mặt tướng | Quan sát kết quả nhận diện của phần mềm | Phần mềm tự đợi 0.1 giây cho qua khung hình bị chớp trắng rồi mới chốt tên tướng, tuyệt đối không nhận nhầm sang tướng khác. | Bắt buộc |
| **TC-22** | Tự động nhận diện người chơi đạt MVP cuối trận trên Điện thoại | Màn hình tổng kết trận Liên Quân / Tốc Chiến hiện huy hiệu MVP | Quan sát màn hình điều khiển sau trận | Phần mềm tự khoanh đúng tên tuyển thủ có gắn biểu tượng MVP vàng và nạp sẵn ảnh người đó vào Cảnh vinh danh MVP. | Cao |

### Phần C: Kiểm thử Cổng 1 Chạm & Bàn Điều Khiển Cứu Nguy 1 Giây (`TC-23` -> `TC-30`)

| Mã TC | Tên Bài Kiểm Tra | Điều Kiện Chuẩn Bị | Thao Tác Thực Hiện | Kết Quả Mong Đợi (Đạt = `[PASS]`) | Mức Độ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-23** | Đổi nóng tên tướng bằng cách gõ 2 chữ cái đầu (Trong 1 giây) | Đang ở màn hình Cấm/Chọn, ô người chơi số 2 đang hiện tướng A | Người trực bấm vào ô số 2, gõ `NA` và bấm Enter (chọn Nakroth) | Tổng thời gian thao tác **dưới 1 giây**; trên màn hình livestream đổi ngay sang ảnh tướng Nakroth mượt mà, không bị nháy đen. | Bắt buộc |
| **TC-24** | Kéo thả đổi chỗ 2 vị tướng khi tuyển thủ đổi tướng giây cuối | Hai đội vừa khóa xong 10 tướng | Người trực kéo ô tướng của người chơi số 1 thả vào ô người chơi số 4 | Ảnh tướng của người số 1 và người số 4 đổi chỗ cho nhau ngay lập tức, trong khi tên và ảnh chân dung người chơi vẫn giữ đúng vị trí. | Bắt buộc |
| **TC-25** | Khóa bảo vệ không cho máy tự ghi đè sau khi người trực đã sửa tay | Người trực vừa tự bấm sửa ô người chơi số 3 thành tướng Florentino | Máy đọc màn hình tiếp tục quét các khung hình tiếp theo | Ô số 3 được gắn chốt khóa an toàn, máy tự động không được phép tự ý đổi ngược lại trừ khi người trực mở khóa. | Bắt buộc |
| **TC-26** | Bảng duyệt nhanh 2 giây trước khi tung Bảng điểm Free Fire lên sóng | Phần mềm vừa đọc xong bảng điểm 12 đội Free Fire | Bảng điểm hiện lên cho người trực kiểm tra, sửa thử 1 số mạng rồi bấm "Duyệt" | Ngay khi sửa 1 con số mạng, tổng điểm và thứ hạng tự tính lại tức thì; bấm "Duyệt" là bảng điểm chuẩn bay lên livestream. | Bắt buộc |
| **TC-27** | Bấm cộng/trừ tỉ số ván đấu (BO3/BO5) bằng phím tắt nhanh | Đang ở giữa trận đấu BO3 | Bấm phím tắt cộng 1 điểm cho Đội Xanh | Thanh tỉ số trên màn hình phát sóng nhảy ngay từ `0 - 0` lên `1 - 0` với hiệu ứng sáng điểm. | Bắt buộc |
| **TC-28** | Đảo bên Đội Xanh / Đội Đỏ chỉ bằng 1 nút bấm (Swap Sides) | Sang ván đấu thứ 2, hai đội đổi bên Xanh và Đỏ cho nhau | Bấm nút "Đổi bên Xanh - Đỏ" trên bàn điều khiển | Toàn bộ tên đội, logo, màu áo và danh sách 5 tuyển thủ của hai bên tự động đổi vị trí trái/phải cho nhau trong 0.1 giây. | Bắt buộc |
| **TC-29** | Chuyển đổi mượt mà từ chế độ Tự động sang Chỉnh tay khi đứt cáp | Đang dùng dây truyền màn hình điện thoại thì rút phăng dây cáp ra | Quan sát phản ứng của phần mềm | Phần mềm báo tiếng bíp nhẹ cho người trực, giữ nguyên toàn bộ tướng/điểm đang có và bật sẵn bàn phím chỉnh tay để tiếp tục làm giải không bị gián đoạn. | Bắt buộc |
| **TC-30** | Chạy thử liên tục 5 tựa game khác nhau trong cùng 1 phiên mở máy | Mở phần mềm 1 lần duy nhất | Lần lượt chọn Liên Minh -> Liên Quân -> Free Fire -> VALORANT -> Tốc Chiến | Khi chuyển từ game này sang game khác, phần mềm tự dọn sạch dữ liệu cũ và nạp giao diện game mới trong vòng **dưới 2 giây**, không bị tràn bộ nhớ. | Cao |

### Phần D: Kiểm thử Sổ Tay Quản Lý Giải Đấu, Nhánh Đấu & Tự Động Tính Điểm (`TC-31` -> `TC-39`)

| Mã TC | Tên Bài Kiểm Tra | Điều Kiện Chuẩn Bị | Thao Tác Thực Hiện | Kết Quả Mong Đợi (Đạt = `[PASS]`) | Mức Độ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-31** | Nhập nhanh 16 đội tuyển và 80 tuyển thủ cùng lúc | Có sẵn 1 thư mục ảnh Logo và danh sách tên 16 đội | Bấm "Nhập nhanh danh sách đội" và chọn thư mục | Toàn bộ 16 đội và 80 tuyển thủ được tạo xong trong vòng **5 giây**, tự ghép đúng ảnh logo và ảnh chân dung theo tên file. | Bắt buộc |
| **TC-32** | Tự động thay ảnh bóng mặc định khi tuyển thủ thiếu ảnh chân dung | Trong 10 tuyển thủ có 2 bạn sinh viên chưa kịp chụp ảnh chân dung | Bấm nạp cặp đấu lên màn hình phát sóng | 2 ô thiếu ảnh tự động hiển thị hình bóng tuyển thủ mặc định cực ngầu theo đúng màu áo đội, không bị hiện ô dấu hỏi hay ảnh vỡ. | Bắt buộc |
| **TC-33** | Tự động chia nhánh đấu Loại trực tiếp (8 đội, 16 đội) và Nhánh thắng-thua | Đã có danh sách 8 hoặc 16 đội | Chọn thể thức và bấm "Tạo sơ đồ nhánh đấu" | Sơ đồ nhánh đấu được vẽ chính xác các cặp Tứ kết, Bán kết, Chung kết (và Nhánh thua nếu chọn Double Elimination). | Bắt buộc |
| **TC-34** | Bấm chọn cặp đấu trên Nhánh đấu -> Tự nạp toàn bộ vào Phòng Live | Trên sơ đồ nhánh đấu, bấm vào trận "Tứ kết 2: Đội C vs Đội D" | Bấm nút "Đưa trận này lên Phòng Phát Sóng" | Trong vòng **0.5 giây**, tất cả 6 cảnh phát sóng đều tự thay sang Logo, Tên viết tắt và 10 tuyển thủ của Đội C và Đội D. | Bắt buộc |
| **TC-35** | Tự động đẩy đội thắng vào vòng tiếp theo khi đủ điểm BO3/BO5 | Kèo BO3 (chạm 2 thắng), Đội C đang dẫn 1-0 và vừa thắng tiếp ván 2 | Phần mềm cập nhật tỉ số thành 2-0 nghiêng về Đội C | Phần mềm tự đánh dấu Trận Tứ kết 2 đã hoàn thành và tự điền tên + logo Đội C vào ô chờ của Trận Bán kết 1. | Bắt buộc |
| **TC-36** | Cộng dồn chính xác Bảng Tổng Sắp Free Fire qua 6 ván đấu liên tiếp | Giải Free Fire thi đấu 6 ván (Map 1 -> Map 6) | Kết thúc từng ván, bấm xác nhận kết quả ván đó | Điểm tổng sau 6 ván của cả 12 đội được cộng dồn chính xác tuyệt đối: `Tổng điểm = Điểm Hạng 6 ván + Điểm Mạng 6 ván`. | Bắt buộc |
| **TC-37** | Xử lý tự động khi 2 đội bằng điểm nhau trên Bảng Xếp Hạng Free Fire | Đội A và Đội B có cùng tổng điểm là 65 điểm sau 6 ván | Quan sát vị trí xếp hạng của Đội A và Đội B | Phần mềm tự động xét chỉ số phụ theo đúng luật giải (Đội nào có nhiều lần đứng Top 1 hơn hoặc nhiều điểm Hạng hơn sẽ xếp trên). | Bắt buộc |
| **TC-38** | Hiển thị mũi tên Tăng hạng / Giảm hạng sau mỗi ván đấu | Sau Ván 2, Đội X từ hạng 8 vươn lên hạng 3 | Chiếu Bảng Xếp Hạng Tổng lên màn hình livestream | Bên cạnh tên Đội X tự hiện ký hiệu tăng `+5 bậc` màu xanh giúp Bình luận viên dễ dàng đọc diễn biến. | Cao |
| **TC-39** | Tự động lưu an toàn vào ổ cứng sau mỗi ván đấu (Chống mất điện) | Đang làm giải đến trận Bán kết thì máy tính bị sập nguồn đột ngột | Bật lại máy tính và mở lại phần mềm | Toàn bộ kết quả từ Vòng bảng đến Bán kết, tỉ số ván đang đánh dở và danh sách đội vẫn còn nguyên vẹn 100%, không mất 1 điểm nào. | Bắt buộc |

### Phần E: Kiểm thử Phòng Đồ Họa 6 Cảnh & Phát Sóng Đa Nền Tảng Ngang/Dọc (`TC-40` -> `TC-50`)

| Mã TC | Tên Bài Kiểm Tra | Điều Kiện Chuẩn Bị | Thao Tác Thực Hiện | Kết Quả Mong Đợi (Đạt = `[PASS]`) | Mức Độ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-40** | Chuyển đổi qua lại giữa 6 Cảnh quay mượt mà (60 khung hình/giây) | Đang phát sóng trực tiếp | Lần lượt bấm chuyển từ Cảnh 1 -> Cảnh 2 -> Cảnh 3 -> Cảnh 4 -> Cảnh 5 | Hiệu ứng chuyển cảnh chạy mượt ở tốc độ **60 khung hình/giây**, âm thanh không bị khựng hay nổ tiếng. | Bắt buộc |
| **TC-41** | Tự động chuyển cảnh theo trạng thái trận đấu (Chế độ Tự động) | Bật công tắc "Tự động chuyển cảnh theo Game" | Cho trận đấu đi từ Phòng chờ -> Cấm chọn -> Vào trận -> Kết thúc | Phần mềm tự chuyển đúng từ Cảnh 1 -> Cảnh 3 -> Cảnh 4 -> Cảnh 5 mà người trực không cần đụng tay vào chuột. | Bắt buộc |
| **TC-42** | Bấm nút Khẩn cấp Cảnh 6 (Tạm dừng Kỹ thuật) phản hồi tức thì | Đang chiếu trận đấu ở Cảnh 4, có tuyển thủ báo lỗi mạng | Bấm nút đỏ "Tạm Dừng Kỹ Thuật" | Trong vòng **0.05 giây (tức thì)**, màn hình trận đấu bị che kín hoàn toàn và chuyển sang màn hình thông báo tạm dừng. | Bắt buộc |
| **TC-43** | Kiểm tra bố cục Màn hình Ngang (16:9) cho YouTube và Facebook | Đang ở Cảnh 3 (Cấm/Chọn) và Cảnh 4 (Trong trận) | Kiểm tra hình ảnh xuất ra trên luồng Ngang 1920x1080 | Chữ nghĩa, tên tuyển thủ, mặt tướng, số vàng sắc nét, nằm gọn trong khung an toàn, không che mất bản đồ nhỏ hay thanh máu chính. | Bắt buộc |
| **TC-44** | Kiểm tra bố cục Màn hình Dọc (9:16) tự động cho TikTok | Đang ở Cảnh 3 và Cảnh 4 | Kiểm tra hình ảnh xuất ra trên luồng Dọc 1080x1920 bằng điện thoại | Khung dọc tự chia 3 tầng rõ rệt: Trên cùng là Bảng tỉ số chữ to -> Chính giữa là khu vực giao tranh game -> Dưới cùng là Camera Bình luận viên. | Bắt buộc |
| **TC-45** | Phát sóng trực tiếp đồng thời lên cả 4 kênh (YouTube, FB, TikTok, Twitch) | Đã nhập khóa phát sóng của cả 4 kênh | Bấm 1 nút "Bắt Đầu Phát Sóng (Go Live)" | Cả 4 kênh đều nhận tín hiệu phát trực tiếp cùng lúc; âm thanh game và tiếng микро của Bình luận viên khớp hoàn toàn với hình ảnh. | Bắt buộc |
| **TC-46** | Tự động nối lại ngầm khi 1 trong 4 kênh phát sóng bị chập chờn mạng | Đang phát cùng lúc lên YouTube và TikTok | Giả lập đường truyền tới TikTok bị ngắt 3 giây rồi có lại | Luồng YouTube vẫn chạy mượt không bị ảnh hưởng; luồng TikTok tự động kết nối lại ngầm mà người trực không cần bấm lại. | Bắt buộc |
| **TC-47** | Kiểm tra tính năng Làm trễ luồng phát chống nhìn trộm (Stream Delay) | Cài đặt độ trễ phát sóng là 30 giây | Thực hiện 1 thao tác trong game và bấm giờ | Đúng **30 giây sau**, hình ảnh VÀ các con số trên bảng tỉ số đồ họa cùng xuất hiện đồng bộ với nhau (không bị lỗi số nhảy trước hình 30 giây). | Bắt buộc |
| **TC-48** | Vừa phát sóng trực tiếp vừa ghi lại video gốc vào ổ cứng | Bật tính năng "Tự động lưu video trận đấu" | Phát sóng xong 1 trận đấu kéo dài 25 phút | Trong thư mục ổ cứng có ngay 1 file video `.mp4` nét căng, đặt tên tự động theo cặp đấu (ví dụ: `TuKet1_TCD_vs_RongDo_Van1.mp4`). | Cao |
| **TC-49** | Trộn âm thanh thông minh (Tự nhỏ nhạc nền khi Bình luận viên nói) | Đang bật nhạc nền ở Cảnh 1 và Cảnh 3 | Bình luận viên bắt đầu nói vào micro | Nhạc nền tự động nhỏ xuống êm ái để tiếng Bình luận viên nghe rõ ràng; khi Bình luận viên ngừng nói thì nhạc tự nâng lên lại. | Cao |
| **TC-50** | Kiểm tra độ bền chạy liên tục 8 tiếng (Nguyên 1 ngày giải đấu) | Cho phần mềm chạy liên tục qua 10 trận đấu trong suốt 8 tiếng đồng hồ | Theo dõi mức tiêu thụ máy tính từ trận 1 đến trận 10 | Máy tính vẫn chạy mát, tốc độ nhận diện tướng và tốc độ phát sóng ở trận thứ 10 vẫn nhanh như trận thứ 1, không bị đầy bộ nhớ hay đơ máy. | Bắt buộc |

---

## 8. BẢNG 8: MA TRẬN TRUY VẾT YÊU CẦU TỪ ĐẦU ĐẾN CUỐI (REQUIREMENTS TRACEABILITY MATRIX - RTM)

Bảng này giúp người quản lý dự án kiểm soát chặt chẽ: **Mỗi mảnh ghép (Skill) gồm những Use Case nào, nằm ở Màn hình nào, lưu vào Bảng dữ liệu nào và được kiểm tra bằng những Test Case nào**:

| Mảnh Ghép (Skill Chia Để Trị) | Các Tình Huống Sử Dụng (Use Cases) | Các Màn Hình Liên Quan (Screens) | Bảng Lưu Trữ Dữ Liệu (Data Tables) | Các Kịch Bản Kiểm Thử Đảm Bảo Chất Lượng (Test Cases) | Tiêu Chí Đạt Chuẩn (KPI Nghiệm Thu) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Mảnh ghép 1 (`Skill 01`)**: Tự động lấy thông tin từ Game Máy Tính (Liên Minh, VALORANT) | `UC-02`, `UC-03`, `UC-06`, `UC-07`, `UC-11` | `SCR-03`, `SCR-09`, `SCR-10` | `Room_Sessions`, `Live_Match_State` | `TC-01` -> `TC-10` | Độ trễ bắt dữ liệu **0.1 - 0.2 giây**; tự động nối vào game 100% không cần cấu hình tay. |
| **Mảnh ghép 2 (`Skill 02`)**: Trọng tài Ảo & Mắt đọc tốc độ cao cho Game Điện Thoại (Liên Quân, Tốc Chiến, Free Fire) | `UC-04`, `UC-05`, `UC-06`, `UC-07`, `UC-08`, `UC-09`, `UC-11` | `SCR-03`, `SCR-04`, `SCR-09`, `SCR-10`, `SCR-11` | `Room_Sessions`, `Live_Match_State`, `BR_Standings` | `TC-11` -> `TC-22` | Trọng tài Ảo tự vào phòng trong **3-5 giây**; nhận diện mặt tướng trong **0.3 giây**; đọc bảng điểm 12 đội Free Fire trong **2 giây**. |
| **Mảnh ghép 3 (`Skill 03`)**: Cổng kết nối 1 chạm & Bàn điều khiển cứu nguy 1 giây | `UC-01`, `UC-03`, `UC-04`, `UC-10` | `SCR-01`, `SCR-03`, `SCR-04` | `Room_Sessions`, `Live_Match_State` | `TC-23` -> `TC-30` | Gom cả 5 game về chung 1 nút bấm; sửa tay tướng hoặc đảo chỗ người chơi hoàn tất trong **dưới 1 giây**. |
| **Mảnh ghép 4 (`Skill 04`)**: Sổ tay Quản lý Giải đấu, Nhánh đấu & Tự động tính điểm | `UC-12`, `UC-13`, `UC-14`, `UC-15`, `UC-16`, `UC-17`, `UC-18`, `UC-19` | `SCR-01`, `SCR-02`, `SCR-11` | `Tournaments`, `Teams`, `Players`, `Matches_Bracket`, `BR_Standings` | `TC-31` -> `TC-39` | Bấm chọn trận trên nhánh đấu là nạp xong toàn bộ ảnh/tên đội trong **0.5 giây**; tự cộng điểm và nhảy nhánh đấu chính xác 100%. |
| **Mảnh ghép 5 (`Skill 05`)**: Phòng Đồ họa 6 Cảnh & Phát sóng trực tiếp Ngang/Dọc (Không cần OBS/vMix) | `UC-20` -> `UC-30` | `SCR-05`, `SCR-06`, `SCR-07` -> `SCR-12` | `Tournaments`, `Live_Match_State` | `TC-40` -> `TC-50` | Phát đồng thời Màn Ngang (16:9) & Màn Dọc (9:16 TikTok) ở **60 khung hình/giây**; nút che màn hình khẩn cấp tác động trong **0.05 giây**. |

---

## 9. BẢNG 9: BẢNG QUẢN TRỊ SỰ CỐ & PHƯƠNG ÁN CỨU NGUY TỰ ĐỘNG KHI ĐANG LIVE (RISK & FAILOVER MATRIX)

Trong một buổi phát sóng giải đấu trực tiếp có hàng nghìn người đang xem, không được phép để màn hình bị đơ hay sai điểm. Bảng dưới đây quy định cách phần mềm tự động xử lý mọi sự cố:

| Mã Rủi Ro | Sự Cố Thực Tế Có Thể Xảy Ra Khi Đang Làm Giải | Mức Độ Nguy Hiểm | Cách Phần Mềm Tự Động Đỡ Đòn (Không Để Khán Giả Thấy Lỗi) | Thao Tác Của Người Trực Máy (Nếu Cần) |
| :--- | :--- | :--- | :--- | :--- |
| **RISK-01** | **Game vừa cập nhật phiên bản mới sáng nay**, đổi vị trí một vài nút hoặc thêm 1 vị tướng mới tinh | Cao | - Kho ảnh tướng tự động tải bản mới nhất khi vừa mở máy.<br>- Nếu bố cục màn hình điện thoại đổi nhẹ, phần mềm tự chuyển sang chế độ gợi ý nhanh trên Bàn cứu nguy (`SCR-04`). | Bấm chọn tên tướng mới trên bàn điều khiển (chỉ mất 1 giây) hoặc bấm nút "Cập nhật mẫu khung hình mới". |
| **RISK-02** | **Tài khoản Trọng tài Ảo bị chủ phòng kích nhầm ra ngoài** hoặc phòng đấu đặt lại mật khẩu mới | Cao | Phần mềm phát hiện ngay Trọng tài Ảo vừa rời phòng -> Tự giữ nguyên màn hình chờ đẹp mắt và hiện khung nhắc nhập lại mật khẩu mới hoặc tự nhảy lại vào phòng. | Bảo chủ phòng mở lại ghế Quan sát rồi bấm 1 nút "Vào lại phòng". |
| **RISK-03** | **Hai tuyển thủ trong đội đổi máy cho nhau hoặc đổi tướng ở giây cuối cùng** | Rất hay gặp | Phần mềm cho phép kéo thả đổi chỗ tên người chơi hoặc đổi chỗ vị tướng ngay trên màn hình điều khiển (`TC-24`). | Dùng chuột kéo thả 2 ô người chơi đổi chỗ cho nhau (mất đúng 1 giây). |
| **RISK-04** | **Đang dùng chế độ cắm dây từ điện thoại Trọng tài thì dây cáp bị lỏng / tuột** | Cao | Ngay tích tắc mất tín hiệu dây cáp, phần mềm tự động đóng băng khung hình cuối cùng (không để hiện màn hình đen hay nhiễu hạt) và giữ nguyên bảng tỉ số đang có. | Cắm chặt lại dây cáp -> Hình ảnh tự động nối lại ngay mà không cần khởi động lại buổi live. |
| **RISK-05** | **Đường truyền mạng tới 1 kênh (ví dụ TikTok) bị rớt tạm thời** trong khi YouTube/Facebook vẫn bình thường | Trung bình | Tách riêng từng kênh phát sóng độc lập: Kênh nào rớt thì phần mềm tự động kết nối lại ngầm cho riêng kênh đó mỗi 2 giây, tuyệt đối không làm đứt luồng YouTube/Facebook. | Không cần làm gì cả, phần mềm tự nối lại. |
| **RISK-06** | **Nếu cài đặt Làm trễ luồng phát (Stream Delay 30 giây)** thì bảng tỉ số nhảy trước khi hình ảnh trong game diễn ra | Rất cao (Lỗi lộ kết quả) | Phần mềm tự động đẩy cả **Hình ảnh game** VÀ **Dữ liệu bảng tỉ số** vào chung một "Đường ống chờ 30 giây" để khi lên sóng, hình tới đâu thì điểm mới nhảy tới đó (`TC-47`). | Chỉ cần chọn số giây muốn làm trễ, phần mềm tự đồng bộ cả hình lẫn điểm. |
| **RISK-07** | **Máy tính phát sóng bị mất điện hoặc tắt đột ngột giữa giải đấu** | Nghiêm trọng | Mọi thay đổi về tỉ số, nhánh đấu, bảng điểm 12 đội đều được tự động lưu ngầm vào ổ cứng ngay mỗi giây (`TC-39`). | Khi bật máy lên lại, phần mềm hỏi: *"Bạn có muốn tiếp tục ngay tại Ván 2 - Trận Bán kết 1 vừa đang làm dở không?"* -> Bấm Đồng ý là chạy tiếp ngay. |

---

## 10. BẢNG 10: BẢNG PHÂN KỲ TRIỂN KHAI & TIÊU CHÍ NGHIỆM THU DỰ ÁN LỚN (MILESTONE & UAT SIGN-OFF)

Để xây dựng phần mềm này thành công mà không bị dàn trải, dự án được chia làm **5 Giai đoạn bàn giao (Milestones)** rõ ràng:

| Giai Đoạn (Milestone) | Tên Giai Đoạn Triển Khai | Những Mảnh Ghép Được Xây Dựng | Sản Phẩm Bàn Giao Cụ Thể (Người Dùng Nhìn Thấy Gì?) | Các Test Case Bắt Buộc Vượt Qua Để Nghiệm Thu |
| :--- | :--- | :--- | :--- | :--- |
| **Giai đoạn 1 (M1)** | **Bộ Khung Giải Đấu & Phòng Phát Sóng Cơ Bản** | `Skill 04` (Quản lý giải đấu) + `Skill 05` (Phòng đồ họa 6 cảnh & Phát sóng Ngang/Dọc) + `Skill 03` (Bàn điều khiển) | Mở được phần mềm trên máy tính, tạo được giải đấu, nhập đội/tuyển thủ, vẽ nhánh đấu, bấm chuyển 6 cảnh đồ họa và phát sóng thử đồng thời màn Ngang (YouTube) + màn Dọc (TikTok). | `TC-23` -> `TC-28`, `TC-31` -> `TC-35`, `TC-40` -> `TC-45` |
| **Giai đoạn 2 (M2)** | **Kết Nối Tự Động Cho Game Máy Tính (Liên Minh & VALORANT)** | `Skill 01` (Đọc dữ liệu Game PC) ghép vào `Skill 03` | Mở Liên Minh hoặc VALORANT lên máy tính là phần mềm tự bắt dính; vào Cấm/Chọn và vào trận là bảng đồ họa trên livestream tự nhảy tướng, mạng, tiền, Rồng/Baron, bom Spike trong 0.1 giây. | `TC-01` -> `TC-10` |
| **Giai đoạn 3 (M3)** | **Trọng Tài Ảo & Mắt Đọc Tốc Độ Cao Cho Game MOBA Điện Thoại (Liên Quân & Tốc Chiến)** | `Skill 02` (Phần MOBA Mobile) ghép vào `Skill 03` | Nhập Số Phòng + Mật khẩu Liên Quân / Tốc Chiến để Trọng tài Ảo tự vào phòng (hoặc cắm dây điện thoại); tự nhận diện mặt tướng Cấm/Chọn và tỉ số trong trận dưới 0.3 giây. | `TC-11`, `TC-13` -> `TC-18`, `TC-21`, `TC-22` |
| **Giai đoạn 4 (M4)** | **Tự Động Hóa Hoàn Toàn Cho Giải Bắn Súng Sinh Tồn 12 Đội (Free Fire)** | `Skill 02` (Phần Free Fire) + `Skill 04` (Tính điểm nhiều ván) | Trọng tài Ảo tự vào phòng 48 người; tự đếm người còn sống của 12 đội trong trận; hết trận tự chụp và đọc xong bảng điểm 12 đội trong 2 giây, tự cộng điểm xếp hạng tổng qua nhiều ván. | `TC-12`, `TC-19`, `TC-20`, `TC-26`, `TC-36` -> `TC-38` |
| **Giai đoạn 5 (M5)** | **Hoàn Thiện Chống Lỗi, Ghi Hình & Đóng Gói Bản Cài Đặt Thương Mại** | Toàn bộ 5 Mảnh ghép (`Skill 01` -> `Skill 05`) | Phần mềm hoàn chỉnh có bộ cài đặt 1 chạm trên máy tính Windows, vượt qua bài kiểm tra chạy liên tục 8 tiếng không lỗi, tự nối lại mạng và tự khôi phục khi mất điện. | Toàn bộ `TC-01` -> `TC-50` đạt `[PASS]` 100% |
