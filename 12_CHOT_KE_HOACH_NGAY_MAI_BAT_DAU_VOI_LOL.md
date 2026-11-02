# CHỐT KẾ HOẠCH TỔNG KẾT & LỘ TRÌNH NGÀY MAI (ƯU TIÊN SỐ 1: LIÊN MINH HUYỀN THOẠI - LOL)
*(Ghi chú toàn bộ các ý tưởng cốt lõi đã chốt để ngày mai bắt tay vào thực hiện)*

---

## 1. CÁC Ý TƯỞNG CỐT LÕI ĐÃ CHỐT HÔM NAY

1. **Phạm vi Game (Đồng nhất chuẩn 5 đấu 5)**:
   - Chỉ tập trung làm nhóm **Game MOBA 5v5 (Liên Minh Huyền Thoại, Liên Quân Mobile, Liên Minh: Tốc Chiến)** và **VALORANT (5v5)**. Loại bỏ hoàn toàn dòng game sinh tồn nhiều đội (Free Fire) để toàn bộ hệ thống đồng bộ 100% theo cấu trúc **Đội Xanh (5 Vị trí) vs Đội Đỏ (5 Vị trí)**.
   - **Giai đoạn đầu tiên (Ngày mai bắt đầu)**: Tập trung nung nấu và làm hoàn chỉnh cho **Liên Minh Huyền Thoại (LoL PC)** trước tiên theo đúng chuẩn giải đấu lớn (**LCK / VCS / Chung Kết Thế Giới**).

2. **Nền tảng Kiến trúc (Dành cho Dev)**:
   - **Phần Lõi (Core Engine)**: Cài trên **Máy tính Windows PC** (Máy Trọng tài / Observer PC) để gánh toàn bộ việc nặng: kết nối phòng game, đọc API trực tiếp, chạy AI soi Minimap, ghép đồ họa 60fps và phát sóng trực tiếp.
   - **Phần Điều Khiển (Director Touch UI)**: Tự phát ra trang Web nội bộ (qua mạng LAN / WebSocket) để **Người quản trị dùng iPad quét mã QR mở Bàn Đạo Diễn Cảm Ứng** đi lại điều khiển từ xa (hoặc bấm trực tiếp trên màn hình PC).

3. **Chuẩn Luồng Giải Đấu Lớn 100% (100% Góc Nhìn Tổng Quan Trọng Tài - Observer Overview)**:
   - Tuyệt đối không chui vào màn hình cá nhân của tuyển thủ; **100% hình ảnh lấy từ Máy Trọng Tài ngồi ở Ô Spectator / Observer** (Góc nhìn tổng quan từ trên cao thấy sáng cả 2 đội).
   - **3 Tính năng AI cốt lõi phục vụ Người Quản Trị**:
     * **AI 1 (Trọng tâm điều khiển trong trận)**: AI đọc **Bản đồ nhỏ (Minimap) + 10 Thanh máu** trên máy Trọng tài để tự động phát hiện đường nào đang có Gank / Giao tranh -> Báo nhấp nháy lên iPad của Quản trị viên. Quản trị viên chạm chọn **Vị trí nào (Top, Jungle, Mid, ADC, Support) của Đội nào (Xanh / Đỏ)** trên iPad -> Ống kính Tổng quan của máy Trọng tài tự động lướt mượt tới chiếu vị trí đó, đồng thời đáy màn hình tự hiện bảng thông số của tuyển thủ đó (kèm so sánh 1v1 cùng đường)!
     * **AI 2**: Tự động lia khung hình dọc **TikTok (9:16)** bám sát theo tâm giao tranh.
     * **AI 3**: Tự động nhận diện tướng (kể cả khi mặc Skin) trong 0.005s & Tự động đánh dấu pha ăn mạng lớn (Triple Kill -> Penta Kill / Giao tranh Baron) để phát lại **Quay chậm (Instant Replay 15s)** và xuất **Video Highlight TikTok** sau trận.

4. **Hai Chế độ Giao diện trên iPad (Nghiệp dư vs Chuyên nghiệp)**:
   - **Chế độ Giải Nghiệp Dư / Phong Trào**: Gọn, nhanh, tự động ẩn các ô ảnh chân dung/camera nếu giải nhỏ không có sẵn, chỉ giữ các thông số tối cần thiết.
   - **Chế độ Giải Chuyên Nghiệp (Chuẩn LCK / VCS / ĐTDV / VCT)**: Mở đầy đủ **Dải tướng Luật Cấm Chọn Toàn Cục (Fearless Draft)**, **Đồng hồ Baron/Caesar Power Play (+Vàng)**, **Biểu đồ chênh lệch Vàng**, **So sánh đối đầu 1v1**, **Pha quay chậm Instant Replay** và **Biểu đồ cột Sát thương 10 người sau trận**.

5. **Mô hình Kinh doanh & Bảng giá Trọn Gói (Mua 1 lần - Không thu lắt nhắt)**:
   - **Gói Dùng Thử (`0đ`)**: Giải nhỏ 4 đội (3 trận), có gắn Logo phần mềm.
   - **Gói 1 Giải Lẻ Trọn Gói (`790.000đ / 7 ngày` - Quốc tế: `$39 USD`)**: Mở khóa 100% tính năng cho 1 giải (lên tới 32 đội 5v5, toàn bộ kho giao diện động, phát song song Ngang 16:9 + Dọc 9:16, tự cắt Highlight).
   - **Gói Tháng Không Giới Hạn (`1.990.000đ / tháng` - Quốc tế: `$89 USD`)**: Dành cho Chuỗi phòng máy (Cyber Game) và Đội làm dịch vụ livestream.
   - **Gói Sự Kiện Lớn / Công Ty (`3.900.000đ / sự kiện` - Quốc tế: `$199 USD`)**: Cho phép 3 chiếc iPad cùng điều khiển đồng bộ.

---

## 2. VIỆC LÀM ĐẦU TIÊN CHO NGÀY MAI (TẬP TRUNG VÀO GAME LOL PC)

Ngày mai khi mở dự án lên, chúng ta sẽ bắt tay vào thiết kế sâu và code luồng chuẩn cho **Liên Minh Huyền Thoại (LoL PC)** gồm 7 bước nối tiếp nhau:
1. **Kết nối `LCU API` của LoL Client**: Tự động nhận diện phòng chờ Custom Tournament Draft, đọc 10 ô Cấm + 10 ô Chọn + Đổi tướng (Swap) + Lưu tướng các ván trước vào dải **Fearless Draft**.
2. **Luồng Chuyển tiếp (Buffer / Time-Shift Sync)**: Nối mượt từ lúc khóa tướng thứ 10 (qua Bàn Bình luận viên phân tích đội hình 5v5) tới đúng giây `00:00` khi cửa sổ Spectator mở Bản đồ Tổng quan.
3. **Đọc `Live Client Data API` (`127.0.0.1:2999`) trên máy Spectator**: Đồng bộ 0.00 giây Tỉ số mạng, Tổng vàng, Chênh lệch vàng, Rồng/Sứ giả/Baron Power Play, KDA và 6 ô trang bị của 10 vị trí.
4. **Điều khiển Ống kính Tổng quan Trọng tài (Spectator Camera API / Hotkeys `1..5` & `Q..T`) + AI soi Minimap**: Cho phép Quản trị viên chạm trên iPad chọn chiếu **Top / Jungle / Mid / ADC / Support của Đội Xanh hoặc Đội Đỏ** là ống kính trong game lướt tới vị trí đó ngay lập tức + hiện thẻ tuyển thủ ở đáy màn hình!
