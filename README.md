# ESPORTS BROADCAST STUDIO - HỒ SƠ THIẾT KẾ & KIẾN TRÚC TOÀN DIỆN (MOBA 5v5 & VALORANT)

Dự án phần mềm điều khiển và phát sóng trực tiếp giải đấu Esports chuyên nghiệp theo chuẩn các giải đấu lớn (**LCK / VCS / Chung Kết Thế Giới** của Liên Minh Huyền Thoại, **Đấu Trường Danh Vọng** của Liên Quân Mobile, **VCT** của VALORANT, **Liên Minh: Tốc Chiến**).

- **Kiến trúc cốt lõi**: App Lõi chạy trên **Windows PC (Máy Trọng tài / Observer PC)** + Giao diện **Bàn Đạo Diễn Cảm Ứng mở trên iPad** qua Mã QR (Local WebSocket).
- **Trọng tâm Giai đoạn 1 (Ngày mai bắt đầu)**: Xây dựng trọn vẹn luồng **Liên Minh Huyền Thoại (LoL PC)** với 100% Góc nhìn Tổng quan Trọng tài (Spectator Overview), AI đọc Minimap gợi ý vị trí giao tranh, và Bàn bấm chọn chiếu 10 Vị trí (`Top, Jungle, Mid, ADC, Support` của Đội Xanh / Đội Đỏ) trên iPad.

---

## Danh mục 13 Tài liệu Thiết kế trong Dự án

1. [00_KE_HOACH_TONG_THE.md](./00_KE_HOACH_TONG_THE.md): Kế hoạch tổng thể (Chia để trị 5 mảnh ghép & Bộ 3 công nghệ AI siêu nhẹ).
2. [01_KICH_BAN_SU_DUNG_THUC_TE.md](./01_KICH_BAN_SU_DUNG_THUC_TE.md): Kịch bản vận hành thực tế từ A đến Z.
3. [02_TOAN_BO_BANG_USECASE_TESTCASE_DU_AN_LON.md](./02_TOAN_BO_BANG_USECASE_TESTCASE_DU_AN_LON.md): Trọn bộ 10 bảng đặc tả dự án lớn (30 Use Cases, 50 Test Cases, Bảng dữ liệu, Bảng màn hình, Quản trị rủi ro).
4. [03_TAT_CA_CHUC_NANG_CUA_UNG_DUNG.md](./03_TAT_CA_CHUC_NANG_CUA_UNG_DUNG.md): Tổng hợp toàn bộ chức năng của ứng dụng chuẩn 5v5.
5. [04_KICH_BAN_KIEM_TIEN_THUC_TE.md](./04_KICH_BAN_KIEM_TIEN_THUC_TE.md): Khảo sát giá thị trường Việt Nam & Quốc tế.
6. [05_BAO_CAO_DU_AN_IPAD_CONTROLLER_VA_BANG_GIA.md](./05_BAO_CAO_DU_AN_IPAD_CONTROLLER_VA_BANG_GIA.md): Báo cáo mô hình điều khiển trên iPad & Bảng giá trọn gói 1 lần (`790k / 1.990k / 3.900k`).
7. [06_QUY_TRINH_NGUOI_DUNG_TU_TAI_APP_DEN_KET_THUC_GIAI.md](./06_QUY_TRINH_NGUOI_DUNG_TU_TAI_APP_DEN_KET_THUC_GIAI.md): Quy trình 8 bước của người dùng từ lúc mở iPad đến lúc kết thúc giải.
8. [07_TONG_HOP_NUT_BAM_VA_SO_DO_LUONG_NGUOI_DUNG.md](./07_TONG_HOP_NUT_BAM_VA_SO_DO_LUONG_NGUOI_DUNG.md): Tổng hợp 31 nút bấm trên iPad & 4 sơ đồ luồng hoạt động (Mermaid Diagrams).
9. [08_UNG_DUNG_AI_SIEU_NHE_TANG_TOC_DO_VA_HIEU_QUA.md](./08_UNG_DUNG_AI_SIEU_NHE_TANG_TOC_DO_VA_HIEU_QUA.md): Kế hoạch 3 Module AI siêu nhẹ đã chốt.
10. [09_PHAN_LOAI_CHUC_NANG_GIAO_DIEN_NGHIEP_DU_VA_CHUYEN_NGHIEP.md](./09_PHAN_LOAI_CHUC_NANG_GIAO_DIEN_NGHIEP_DU_VA_CHUYEN_NGHIEP.md): Phân loại giao diện Tối cần thiết vs Cần thiết (Chế độ Giải Nghiệp Dư vs Giải Chuyên Nghiệp).
11. [10_KIEN_TRUC_7_CHUC_NANG_LON_VA_LUONG_CHO_DEV.md](./10_KIEN_TRUC_7_CHUC_NANG_LON_VA_LUONG_CHO_DEV.md): Tài liệu dành cho Dev: 7 Chức năng lớn & Luồng chuẩn Giải đấu lớn 100% Góc nhìn Tổng quan Trọng tài (Observer Overview).
12. [11_CHOT_NEN_TANG_VA_CONG_NGHE_TOI_UU_CHO_DEV.md](./11_CHOT_NEN_TANG_VA_CONG_NGHE_TOI_UU_CHO_DEV.md): Chốt nền tảng (Lõi Windows PC + Điều khiển trên iPad qua Web nội bộ) & Tech Stack.
13. [12_CHOT_KE_HOACH_NGAY_MAI_BAT_DAU_VOI_LOL.md](./12_CHOT_KE_HOACH_NGAY_MAI_BAT_DAU_VOI_LOL.md): Tổng kết các ý đã chốt hôm nay & Kế hoạch ngày mai bắt đầu với Liên Minh Huyền Thoại (LoL).
