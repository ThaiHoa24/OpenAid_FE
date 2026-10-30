# OPENAID – PRODUCT BACKLOG
## Hệ Thống Điều Phối Quyên Góp Hiện Vật & Hoạt Động Tình Nguyện Minh Bạch
**Mã dự án:** C1SE.102 | **Môn học:** CMU-SE 450 – Capstone Project 1  
**Đơn vị đào tạo:** Viện Đào tạo Quốc tế (IS), Đại học Duy Tân (DTU)  
**Giảng viên hướng dẫn:** ThS. Võ Đình Hiệu  
**Nhóm phát triển:** C1SE.102  
- **Phan Vĩnh Thái Hòa** – Scrum Master / Frontend Lead (ID: 29211153917)
- **Đặng Phước Tường** – Product Owner / QA Lead (ID: 25213109843)
- **Tạ Quang Tính** – Backend Developer (ID: 29219051994)
- **Trần Lê Hoàng** – Backend Developer (ID: 28212703240)

---

## MỤC LỤC
1. [Ý Nghĩa & Mục Đích Của Product Backlog](#1-ý-nghĩa--mục-đích-của-product-backlog)
2. [Nguyên Tắc Quản Lý & Quy Ước Backlog (Agile / Scrum Standards)](#2-nguyên-tắc-quản-lý--quy-ước-backlog-agile--scrum-standards)
   - 2.1. Cấu trúc User Story chuẩn
   - 2.2. Tiêu chuẩn INVEST
   - 2.3. Quy ước mức độ ưu tiên (MoSCoW)
   - 2.4. Quy ước ước lượng điểm quy mô (Story Points)
   - 2.5. Tiêu chí sẵn sàng (Definition of Ready - DoR)
   - 2.6. Định nghĩa hoàn thành (Definition of Done - DoD)
3. [Chân Dung Tác Nhân & Phân Quyền (Personas & Roles)](#3-chân-dung-tác-nhân--phân-quyền-personas--roles)
4. [Danh Sách Chi Tiết Product Backlog (Epics & User Stories)](#4-danh-sách-chi-tiết-product-backlog-epics--user-stories)
   - [Epic 01: Quản Trị Tài Khoản, Xác Thực & Hồ Sơ (Authentication & Profile)](#epic-01-quản-trị-tài-khoản-xác-thực--hồ-sơ-authentication--profile)
   - [Epic 02: Quản Lý Tổ Chức Thiện Nguyện (Organization Management)](#epic-02-quản-lý-tổ-chức-thiện-nguyện-organization-management)
   - [Epic 03: Quản Lý & Khám Phá Chiến Dịch Cứu Trợ (Event Management & Discovery)](#epic-03-quản-lý--khám-phá-chiến-dịch-cứu-trợ-event-management--discovery)
   - [Epic 04: Điều Phối Tình Nguyện Viên & Điểm Danh (Volunteer Recruitment & Attendance)](#epic-04-điều-phối-tình-nguyện-viên--điểm-danh-volunteer-recruitment--attendance)
   - [Epic 05: Tiếp Nhận Quyên Góp Hiện Vật & Cấp Mã Tracking ID (In-Kind Donation & Tracking)](#epic-05-tiếp-nhận-quyên-góp-hiện-vật--cấp-mã-tracking-id-in-kind-donation--tracking)
   - [Epic 06: Quản Lý Kho Hiện Vật & Đóng Gói Lô Hàng (Inventory & Donation Batching)](#epic-06-quản-lý-kho-hiện-vật--đóng-gói-lô-hàng-inventory--donation-batching)
   - [Epic 07: Kế Hoạch Chuyến Phân Phối & Lộ Trình Điểm Phát (Distribution Trip Management)](#epic-07-kế-hoạch-chuyến-phân-phối--lộ-trình-điểm-phát-distribution-trip-management)
   - [Epic 08: Bàn Giao Hiện Trường & Minh Chứng Quyền Riêng Tư (Handover & Evidence Review)](#epic-08-bàn-giao-hiện-trường--minh-chứng-quyền-riêng-tư-handover--evidence-review)
   - [Epic 09: Tra Cứu Minh Bạch Công Khai & Dòng Thời Gian (Public Tracking & Timeline)](#epic-09-tra-cứu-minh-bạch-công-khai--dòng-thời-gian-public-tracking--timeline)
   - [Epic 10: Bảng Điều Khiển, Báo Cáo & Quản Trị Hệ Thống (Dashboard & Platform Admin)](#epic-10-bảng-điều-khiển-báo-cáo--quản-trị-hệ-thống-dashboard--platform-admin)
   - [Epic 11: Nền Tảng Kỹ Thuật, REST API & Dữ Liệu Demo (Technical Enablers & System Quality)](#epic-11-nền-tảng-kỹ-thuật-rest-api--dữ-liệu-demo-technical-enablers--system-quality)
5. [Ma Trận Truy Vết Yêu Cầu (Requirements Traceability Matrix - RTM)](#5-ma-trận-truy-vết-yêu-cầu-requirements-traceability-matrix---rtm)
6. [Kế Hoạch Phân Bổ Sprint Backlog (12 Tuần / 6 Sprints)](#6-kế-hoạch-phân-bổ-sprint-backlog-12-tuần--6-sprints)
7. [Quy Trình Tinh Chỉnh & Cập Nhật Backlog (Backlog Refinement Process)](#7-quy-trình-tinh-chỉnh--cập-nhật-backlog-backlog-refinement-process)

---

## 1. Ý Nghĩa & Mục Đích Của Product Backlog

### 1.1. Khái niệm và Ý nghĩa cốt lõi
Trong khung làm việc **Agile/Scrum** và kỹ nghệ phần mềm chuyên nghiệp (đặc biệt theo chuẩn chương trình đào tạo kỹ sư phần mềm Carnegie Mellon University - CMU), **Product Backlog** là tài liệu danh mục yêu cầu sống (*living document*), đóng vai trò là **nguồn sự thật duy nhất (Single Source of Truth - SSOT)** cho mọi hạng mục công việc mà nhóm dự án cần thực hiện để xây dựng, cải tiến và hoàn thiện sản phẩm **OpenAid**.

File `PRODUCT_BACKLOG.md` này có ý nghĩa chiến lược và thực tiễn:
1. **Chuyển hóa Tầm nhìn & Mục tiêu Đồ án (Project Scope & Vision):** Cụ thể hóa các đề xuất trong đề cương [Project Proposal (C1SE.102)](file:///d:/%C4%90%E1%BB%92%20%C3%81N%20CAPS1/OpenAid/src/app/docx/Proposal/C1SE.102_ProjectProposal.docx) thành các câu chuyện người dùng (User Stories) có thể lập trình, kiểm thử và chuyển giao được.
2. **Quản trị Phạm vi Nghiệp vụ (Scope Management):** Đảm bảo giải quyết bài toán nhức nhối trong cứu trợ từ thiện thực tế: xóa bỏ tình trạng rời rạc trên Facebook/Zalo/Excel, cung cấp quy trình khép kín từ **Chiến dịch $\rightarrow$ Tình nguyện viên $\rightarrow$ Quyên góp hiện vật $\rightarrow$ Nhập kho $\rightarrow$ Gom lô $\rightarrow$ Chuyến xe $\rightarrow$ Điểm phát $\rightarrow$ Minh chứng bàn giao $\rightarrow$ Tra cứu Tracking ID công khai**.
3. **Cơ sở cho việc Lập Kế hoạch Sprint (Sprint Planning):** Cung cấp danh mục các hạng mục đã được phân rã, gán độ ưu tiên (MoSCoW), định lượng độ phức tạp (Story Points) để Product Owner và nhóm lập trình bốc việc vào từng Sprint (từ Sprint 1 đến Sprint 6 trong kế hoạch 12 tuần của học kỳ Capstone 1).
4. **Cầu nối giao tiếp giữa các bên (Stakeholder Alignment):** Giúp Giảng viên hướng dẫn (Mentor), Hội đồng chấm đồ án (Review Panel), Product Owner (Đặng Phước Tường), Scrum Master (Phan Vĩnh Thái Hòa) và các Kỹ sư Backend (Tạ Quang Tính, Trần Lê Hoàng) có chung một thước đo thống nhất về tiến độ, chất lượng và phạm vi nghiệm thu.

---

## 2. Nguyên Tắc Quản Lý & Quy Ước Backlog (Agile / Scrum Standards)

### 2.1. Cấu trúc User Story chuẩn
Mỗi câu chuyện người dùng trong Product Backlog được chuẩn hóa theo mẫu Agile quốc tế:
> **Là một (As a)** `[Tác nhân / Vai trò người dùng]`,  
> **Tôi muốn (I want to)** `[Thao tác / Chức năng mong muốn]`,  
> **Để (So that)** `[Giá trị nghiệp vụ / Lợi ích đạt được]`.

Mỗi User Story bắt buộc đi kèm **Tiêu chí chấp nhận (Acceptance Criteria - AC)** viết theo cú pháp **BDD (Behavior-Driven Development: Given - When - Then)** để phục vụ công tác kiểm thử tự động và thủ công.

### 2.2. Tiêu chuẩn INVEST
Mọi User Story trong backlog đều được nhóm rà soát theo tiêu chuẩn **INVEST**:
- **I (Independent):** Độc lập tối đa, hạn chế phụ thuộc chéo giữa các story trong cùng một sprint.
- **N (Negotiable):** Linh hoạt thảo luận chi tiết cài đặt giữa PO và Developer.
- **V (Valuable):** Mang lại giá trị trực tiếp cho người dùng cuối hoặc kiến trúc hệ thống.
- **E (Estimable):** Đủ rõ ràng để nhóm kỹ thuật ước lượng được khối lượng công việc.
- **S (Small):** Kích thước vừa vặn để hoàn thành trọn vẹn trong một chu kỳ Sprint 2 tuần.
- **T (Testable):** Có tiêu chí kiểm thử cụ thể (AC) để QA/PO nghiệm thu Passed/Failed.

### 2.3. Quy ước mức độ ưu tiên (MoSCoW)
- **Must Have (M):** Các tính năng cốt lõi bắt buộc phải có để hoàn thành chuỗi nghiệp vụ xuyên suốt (*End-to-End Golden Chain*). Nếu thiếu, hệ thống OpenAid không thể demo hoặc nghiệm thu (Ví dụ: Đăng ký hiện vật, Cấp Tracking ID, Nhập kho cân đối, Gom lô, Chuyến phân phối, Minh chứng, Tra cứu công khai).
- **Should Have (S):** Các tính năng quan trọng gia tăng tính hoàn thiện, bảo mật và trải nghiệm, dự kiến hoàn thành trong phạm vi Capstone 1 (Ví dụ: Bộ lọc nâng cao, Duyệt kiểm duyệt ảnh quyền riêng tư, Check-in TNV, Bảng thống kê).
- **Could Have (C):** Các tính năng tiện ích, được triển khai nếu còn thời gian (Ví dụ: Đổi trạng thái bằng QR Code, Xuất báo cáo nâng cao). Nếu tiến độ bị trễ, các tính năng này sẽ được giảm tải đầu tiên.
- **Won't Have (W - Phase 2):** Các tính năng vượt phạm vi Capstone 1, để dành phát triển sau (Ví dụ: Cổng thanh toán tiền mặt, AI tự động nhận diện khuôn mặt làm mờ ảnh, GPS tracking thời gian thực, Ứng dụng di động native).

### 2.4. Quy ước ước lượng điểm quy mô (Story Points)
Nhóm áp dụng dãy số **Fibonacci cải tiến (1, 2, 3, 5, 8, 13)** thông qua kỹ thuật **Planning Poker**:
- **1 Point:** Tác vụ rất đơn giản, giao diện tĩnh hoặc sửa đổi cấu hình nhỏ (< 2 giờ làm việc).
- **2 Points:** Chức năng đơn giản, form nhập liệu cơ bản, API CRUD chuẩn (khoảng 0.5 ngày).
- **3 Points:** Tính năng mức trung bình, có logic kiểm tra điều kiện (validation) và cập nhật giao diện (khoảng 1 ngày).
- **5 Points:** Tính năng phức tạp, liên quan đến tương tác nhiều thực thể dữ liệu, thay đổi trạng thái có điều kiện (khoảng 2-3 ngày).
- **8 Points:** Tính năng rất phức tạp, liên quan đến nghiệp vụ cốt lõi xuyên suốt (như logic cân đối kho, gom lô, chuyến xe phân phối đa điểm) (khoảng 3-5 ngày).
- **13 Points:** Quá lớn (Epic nhỏ), cần tiếp tục phân rã thành các story 3, 5 điểm trước khi đưa vào Sprint.

### 2.5. Tiêu chí sẵn sàng (Definition of Ready - DoR)
Một User Story được coi là **Ready** để đưa vào Sprint Backlog khi thỏa mãn:
1. Đã mô tả rõ ràng theo cấu trúc *As a... I want... So that...*
2. Tiêu chí chấp thuận (Acceptance Criteria) được viết cụ thể, không còn mơ hồ.
3. Đã xác định rõ các ràng buộc kỹ thuật, API contract và thực thể CSDL liên quan.
4. Đã có thiết kế giao diện phác thảo (Wireframe / Figma) hoặc quy ước UI thống nhất.
5. Đã được nhóm đánh giá và gán điểm Story Points (không vượt quá 8 points).
6. Không bị chặn (*blocked*) bởi các tính năng phụ thuộc chưa hoàn thành.

### 2.6. Định nghĩa hoàn thành (Definition of Done - DoD)
Một User Story được coi là **Done** và được PO chấp thuận khi:
1. Mã nguồn Frontend & Backend tuân thủ đúng coding standards và lint rules của dự án.
2. Đã viết và pass toàn bộ Unit Test / API Test trên Postman cho các luồng chính và biên.
3. Nghiệp vụ tuân thủ nghiêm ngặt các quy tắc toàn vẹn dữ liệu (Phương trình cân đối kho, Thứ tự trạng thái hợp lệ).
4. Nhật ký minh bạch (*TransparencyLog*) tự động ghi nhận đầy đủ (Ai thao tác, Thời gian, Trạng thái cũ $\rightarrow$ Trạng thái mới, Minh chứng đính kèm).
5. Code đã được tạo Pull Request trên GitHub, có ít nhất 1 thành viên review và merge vào nhánh `main`/`develop`.
6. Chạy thử nghiệm thành công trên môi trường cục bộ/staging với dữ liệu seed mẫu mà không phát sinh lỗi vỡ layout hoặc lỗi console.

---

## 3. Chân Dung Tác Nhân & Phân Quyền (Personas & Roles)

Hệ thống OpenAid áp dụng mô hình phân quyền chặt chẽ kết hợp giữa **System Role (Cấp hệ thống)** và **Organization Role (Cấp tổ chức)**:

| Tác nhân (Actor) | Vai trò hệ thống | Vai trò tổ chức | Mô tả & Trách nhiệm chính |
| :--- | :--- | :--- | :--- |
| **Khách vãng lai (Public Visitor)** | Chưa đăng nhập / Khách | Không | Xem trang chủ, tìm kiếm sự kiện, tra cứu hành trình cứu trợ bằng **Tracking ID**, xem dòng thời gian và ảnh minh chứng công khai. |
| **Nhà hảo tâm (In-Kind Donor)** | `USER` | Tùy chọn | Đăng ký cam kết đóng góp hiện vật theo danh mục chiến dịch kêu gọi, nhận mã Tracking ID, theo dõi tình trạng hàng quyên góp cá nhân tại `/my/donations`. |
| **Tình nguyện viên (Volunteer)** | `USER` | Tùy chọn | Nộp đơn ứng tuyển vào các vị trí chiến dịch, theo dõi kết quả xét duyệt tại `/my/activities`, thực hiện điểm danh (Check-in/out), tham gia chuyến xe cứu trợ, chụp ảnh minh chứng. |
| **Điều phối viên (Organizer)** | `USER` | `ORGANIZER` (hoặc `MEMBER`) | Đại diện cho Tổ chức từ thiện được phê duyệt; tạo và quản lý chiến dịch; duyệt tình nguyện viên; xác nhận nhập kho; gom lô hàng; điều hành chuyến phân phối; kiểm duyệt minh chứng quyền riêng tư. |
| **Quản trị viên (Platform Admin)** | `ADMIN` | Toàn quyền kiểm soát | Quản trị toàn bộ người dùng; thẩm định và kích hoạt/vô hiệu hóa Tổ chức thiện nguyện; kiểm duyệt chiến dịch toàn sàn. |

---

## 4. Danh Sách Chi Tiết Product Backlog (Epics & User Stories)

```
                              TỔNG QUAN PHÂN RÃ EPICS CỦA OPENAID
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│  [EPIC 01] Quản trị Tài khoản & Phân quyền (Auth & RBAC) ─────────────────────────┐               │
│  [EPIC 02] Quản lý Tổ chức Thiện nguyện (Organizations) ──────────────────────────┤               │
│  [EPIC 03] Quản lý Chiến dịch & Khám phá Sự kiện (Events) ────────────────────────┼─── HỆ THỐNG   │
│  [EPIC 04] Tuyển tình nguyện viên & Điểm danh (Volunteers & Check-in) ────────────┤    OPENAID    │
│  [EPIC 05] Quyên góp Hiện vật & Cấp Mã Tracking ID (Donations & Tracking) ────────┤    VẬN HÀNH   │
│  [EPIC 06] Quản lý Kho Cân đối & Gom Lô Hàng (Inventory & Batches) ───────────────┤   MINH BẠCH   │
│  [EPIC 07] Chuyến Xe Cứu Trợ & Lộ trình Điểm phát (Trips & Distribution Points) ──┤               │
│  [EPIC 08] Bàn Giao Hiện Trường & Minh Chứng Quyền Riêng Tư (Handover & Proof) ───┤               │
│  [EPIC 09] Tra cứu Công khai & Dòng thời gian (Public Tracking & Timeline) ───────┤               │
│  [EPIC 10] Bảng Điều Khiển & Quản Trị Hệ Thống (Dashboard & Admin) ───────────────┤               │
│  [EPIC 11] Nền tảng Kỹ thuật & Chất lượng Hệ thống (Technical Enablers) ──────────┘               │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### EPIC 01: Quản Trị Tài Khoản, Xác Thực & Hồ Sơ (Authentication & Profile)
*Liên kết yêu cầu: KF01 | FR01, FR02, FR03 | NFR02*

#### US-01: Đăng ký tài khoản người dùng mới
- **Mô tả:** Là một người dùng mới, tôi muốn đăng ký tài khoản bằng email, mật khẩu và họ tên, để tôi có thể tham gia quyên góp hoặc đăng ký tình nguyện viên trên hệ thống.
- **Độ ưu tiên:** Must Have (M) | **Ước lượng:** 3 Story Points | **Sprint:** Sprint 2
- **Tiêu chí chấp nhận (AC):**
  - **AC1.1:** Given người dùng nhập email hợp lệ chưa tồn tại và mật khẩu $\ge$ 6 ký tự, When nhấn "Đăng ký", Then hệ thống tạo tài khoản mới với vai trò mặc định `USER`, mật khẩu được băm an toàn (bcrypt), lưu vào hệ thống và tự động đăng nhập.
  - **AC1.2:** Given người dùng nhập email đã tồn tại trong hệ thống, When nhấn "Đăng ký", Then hiển thị thông báo lỗi rõ ràng "Email đã được sử dụng".
  - **AC1.3:** Form đăng ký có tùy chọn đăng ký kèm thông tin tổ chức thiện nguyện (nếu người dùng là đại diện tổ chức).

#### US-02: Đăng nhập hệ thống & Cấp phiên làm việc (JWT)
- **Mô tả:** Là một người dùng đã có tài khoản, tôi muốn đăng nhập bằng email và mật khẩu, để tôi truy cập vào các tính năng bảo mật tương ứng với quyền hạn của mình.
- **Độ ưu tiên:** Must Have (M) | **Ước lượng:** 3 Story Points | **Sprint:** Sprint 2
- **Tiêu chí chấp nhận (AC):**
  - **AC2.1:** Given email và mật khẩu chính xác, When nhấn "Đăng nhập", Then hệ thống cấp token phiên đăng nhập (JWT / session), lưu vào storage và chuyển hướng người dùng đến trang phù hợp với vai trò.
  - **AC2.2:** Given sai thông tin xác thực, When nhấn "Đăng nhập", Then hiển thị lỗi "Email hoặc mật khẩu không chính xác", không tiết lộ cụ thể trường nào sai.
  - **AC2.3:** Hỗ trợ thanh "Chuyển Vai Trò Demo" (Demo Role Switcher) trong môi trường prototype để thuận tiện chuyển nhanh giữa Guest, User, Organizer, Admin.

#### US-03: Xem và cập nhật hồ sơ cá nhân
- **Mô tả:** Là một người dùng đã đăng nhập, tôi muốn xem và cập nhật thông tin cá nhân (họ tên, số điện thoại, kỹ năng, ghi chú), để tổ chức thiện nguyện có thể liên lạc khi cần thiết.
- **Độ ưu tiên:** Should Have (S) | **Ước lượng:** 2 Story Points | **Sprint:** Sprint 2
- **Tiêu chí chấp nhận (AC):**
  - **AC3.1:** Given người dùng truy cập trang `/profile`, When thông tin hợp lệ được gửi, Then hệ thống lưu cập nhật và hiển thị toast thông báo thành công.
  - **AC3.2:** Người dùng không được phép tự ý thay đổi địa chỉ email đăng nhập và vai trò hệ thống (`systemRole`).

---

### EPIC 02: Quản Lý Tổ Chức Thiện Nguyện (Organization Management)
*Liên kết yêu cầu: KF02 | FR03, FR04 | NFR02, NFR08*

#### US-04: Đăng ký thành lập hồ sơ Tổ chức thiện nguyện
- **Mô tả:** Là đại diện một tổ chức thiện nguyện, tôi muốn nộp hồ sơ đăng ký tổ chức (tên, mô tả, địa bàn hoạt động, giấy phép/minh chứng pháp lý), để tổ chức của tôi được vận hành hợp pháp trên nền tảng.
- **Độ ưu tiên:** Must Have (M) | **Ước lượng:** 3 Story Points | **Sprint:** Sprint 2
- **Tiêu chí chấp nhận (AC):**
  - **AC4.1:** Given form tạo tổ chức điền đầy đủ thông tin, When gửi duyệt, Then trạng thái tổ chức được khởi tạo là `PENDING`.
  - **AC4.2:** Người gửi đơn tự động trở thành thành viên đầu tiên với vai trò `ORGANIZER` của tổ chức đó trong bảng `OrganizationMember`.

#### US-05: Admin xét duyệt hồ sơ Tổ chức
- **Mô tả:** Là Quản trị viên hệ thống (Admin), tôi muốn xem danh sách các tổ chức đang chờ duyệt và phê duyệt hoặc từ chối, để đảm bảo tính minh bạch và uy tín của các tổ chức tham gia.
- **Độ ưu tiên:** Must Have (M) | **Ước lượng:** 3 Story Points | **Sprint:** Sprint 2
- **Tiêu chí chấp nhận (AC):**
  - **AC5.1:** Given tổ chức có trạng thái `PENDING`, When Admin nhấn "Phê duyệt" tại `/admin/organizations`, Then trạng thái chuyển thành `APPROVED`, cho phép tổ chức đăng bài chiến dịch.
  - **AC5.2:** When Admin nhấn "Vô hiệu hóa" (`DISABLED`), Then tổ chức đó không thể đăng tải chiến dịch mới hoặc duyệt phân phối hàng hóa.

---

### EPIC 03: Quản Lý & Khám Phá Chiến Dịch Cứu Trợ (Event Management & Discovery)
*Liên kết yêu cầu: KF03, KF04 | FR05, FR06, FR07 | NFR04, NFR05*

#### US-06: Tạo bản nháp chiến dịch cứu trợ
- **Mô tả:** Là một Organizer của tổ chức đã được duyệt, tôi muốn tạo chiến dịch cứu trợ mới (tên, mô tả, địa điểm cứu trợ, thời gian bắt đầu/kết thúc, người liên hệ), để chuẩn bị phát động hoạt động cứu trợ.
- **Độ ưu tiên:** Must Have (M) | **Ước lượng:** 3 Story Points | **Sprint:** Sprint 2
- **Tiêu chí chấp nhận (AC):**
  - **AC6.1:** Given tổ chức sở hữu có trạng thái `APPROVED`, When lưu thông tin sự kiện hợp lệ, Then sự kiện được tạo với trạng thái `DRAFT`.
  - **AC6.2:** Chiến dịch ở trạng thái `DRAFT` chỉ hiển thị trong khu vực quản lý của Organizer, không xuất hiện ở trang khám phá công khai và có thể bị xóa hoàn toàn.

#### US-07: Khai báo Nhu cầu Hiện vật & Chỉ tiêu Tình nguyện viên
- **Mô tả:** Là một Organizer, tôi muốn khai báo danh sách hiện vật cần quyên góp (loại hàng, số lượng mục tiêu, đơn vị tính chuẩn) và các vị trí tình nguyện viên cần tuyển, để kêu gọi cộng đồng hỗ trợ chính xác.
- **Độ ưu tiên:** Must Have (M) | **Ước lượng:** 5 Story Points | **Sprint:** Sprint 2
- **Tiêu chí chấp nhận (AC):**
  - **AC7.1:** Organizer có thể thêm nhiều mục nhu cầu hiện vật (`DonationNeed`) chọn từ danh mục chuẩn (ví dụ: Gạo - kg, Nước suối - chai, Thuốc men - hộp, Mì tôm - thùng).
  - **AC7.2:** Organizer có thể thêm nhiều vai trò TNV (`VolunteerRole`: Hậu cần, Vận chuyển, Y tế, Phân phát) cùng chỉ tiêu số lượng cần tuyển.

#### US-08: Công bố (Publish) hoặc Đóng/Hủy chiến dịch
- **Mô tả:** Là một Organizer, tôi muốn công bố chiến dịch ra cộng đồng hoặc kết thúc chiến dịch khi hoàn thành, để điều phối tiếp nhận đóng góp kịp thời.
- **Độ ưu tiên:** Must Have (M) | **Ước lượng:** 3 Story Points | **Sprint:** Sprint 2
- **Tiêu chí chấp nhận (AC):**
  - **AC8.1:** Given chiến dịch `DRAFT` có đủ thông tin và ít nhất 1 nhu cầu hoặc vai trò TNV, When Organizer chọn "Công bố", Then trạng thái chuyển thành `PUBLISHED`.
  - **AC8.2:** Quy tắc bảo toàn dữ liệu: Chiến dịch một khi đã `PUBLISHED` và đã phát sinh đơn đăng ký/đóng góp thì **tuyệt đối không được xóa cứng (hard delete)** khỏi CSDL, chỉ được chuyển trạng thái sang `CLOSED` hoặc `CANCELLED`.

#### US-09: Tìm kiếm & Khám phá chiến dịch công khai
- **Mô tả:** Là một khách vãng lai hoặc người dùng, tôi muốn duyệt danh sách chiến dịch, tìm kiếm theo từ khóa và lọc theo khu vực địa lý, để tìm các hoạt động cứu trợ tôi muốn tham gia.
- **Độ ưu tiên:** Must Have (M) | **Ước lượng:** 3 Story Points | **Sprint:** Sprint 2
- **Tiêu chí chấp nhận (AC):**
  - **AC9.1:** Trang `/events` hiển thị danh sách các chiến dịch đang `PUBLISHED` kèm thanh tiến độ hoàn thành chỉ tiêu hiện vật và tình nguyện viên.
  - **AC9.2:** Tìm kiếm phản hồi nhanh < 3s, hỗ trợ tìm kiếm không dấu/có dấu theo tên chiến dịch và địa điểm.

---

### EPIC 04: Điều Phối Tình Nguyện Viên & Điểm Danh (Volunteer Recruitment & Attendance)
*Liên kết yêu cầu: KF05, KF06, KF07 | FR08, FR09, FR10, FR11 | NFR04, NFR06*

#### US-10: Đăng ký ứng tuyển vai trò Tình nguyện viên
- **Mô tả:** Là một tình nguyện viên, tôi muốn nộp đơn ứng tuyển vào một vai trò cụ thể trong chiến dịch cứu trợ (kèm kinh nghiệm, ghi chú sức khỏe), để tham gia đóng góp sức mình cho hoạt động thực địa.
- **Độ ưu tiên:** Must Have (M) | **Ước lượng:** 3 Story Points | **Sprint:** Sprint 3
- **Tiêu chí chấp nhận (AC):**
  - **AC10.1:** Given chiến dịch đang `PUBLISHED`, When TNV chọn vai trò và gửi đơn đăng ký tại `/volunteer/apply/[eventId]`, Then hệ thống tạo bản ghi `VolunteerApplication` với trạng thái `PENDING`.
  - **AC10.2:** Người dùng không thể đăng ký trùng lặp 2 lần vào cùng một vai trò trong cùng một chiến dịch.

#### US-11: Quản lý và Xét duyệt đơn Tình nguyện viên
- **Mô tả:** Là một Organizer, tôi muốn xem danh sách đơn ứng tuyển và duyệt (`APPROVE`) hoặc từ chối (`REJECT`), để tuyển chọn nhân sự phù hợp cho chiến dịch.
- **Độ ưu tiên:** Must Have (M) | **Ước lượng:** 3 Story Points | **Sprint:** Sprint 3
- **Tiêu chí chấp nhận (AC):**
  - **AC11.1:** Tại trang `/organizer/volunteers`, Organizer xem chi tiết hồ sơ ứng viên và chọn "Phê duyệt" hoặc "Từ chối" kèm lý do.
  - **AC11.2:** Khi số lượng đơn duyệt đạt đủ chỉ tiêu vai trò (`recruitedQuantity >= maxQuantity`), hệ thống cảnh báo đủ chỉ tiêu nhưng vẫn cho phép duyệt dự phòng nếu cần.

#### US-12: Theo dõi hoạt động cá nhân & Điểm danh (Check-in/out)
- **Mô tả:** Là một tình nguyện viên, tôi muốn xem lịch sử tham gia và thực hiện điểm danh khi đến địa điểm tập kết, để ghi nhận công sức đóng góp của mình.
- **Độ ưu tiên:** Should Have (S) | **Ước lượng:** 3 Story Points | **Sprint:** Sprint 3
- **Tiêu chí chấp nhận (AC):**
  - **AC12.1:** Trang `/my/activities` hiển thị đầy đủ danh sách các chiến dịch đã ứng tuyển, trạng thái duyệt (`PENDING`, `APPROVED`, `REJECTED`).
  - **AC12.2:** Với đơn `APPROVED`, TNV có thể bấm nút xác nhận điểm danh hoặc quét mã QR mô phỏng, hệ thống lưu dấu vết thời gian vào `VolunteerAttendance`.

---

### EPIC 05: Tiếp Nhận Quyên Góp Hiện Vật & Cấp Mã Tracking ID (In-Kind Donation & Tracking)
*Liên kết yêu cầu: KF08 | FR12, FR13, FR14 | NFR02, NFR05, NFR06*

#### US-13: Đăng ký cam kết quyên góp hiện vật & Nhận Tracking ID
- **Mô tả:** Là một nhà hảo tâm (Donor), tôi muốn chọn danh mục hiện vật cần thiết của chiến dịch và đăng ký số lượng đóng góp, để hệ thống cấp mã định danh tra cứu duy nhất cho phần quà của tôi.
- **Độ ưu tiên:** Must Have (M) | **Ước lượng:** 5 Story Points | **Sprint:** Sprint 3
- **Tiêu chí chấp nhận (AC):**
  - **AC13.1:** Given chiến dịch `PUBLISHED`, When Donor chọn loại hiện vật, nhập số lượng cam kết ($\ge 1$), đính kèm hình ảnh vật phẩm (tùy chọn) tại `/donate/[eventId]`, Then hệ thống tạo bản ghi `Donation` với trạng thái ban đầu là `PENDING`.
  - **AC13.2:** Hệ thống tự động sinh một mã **Tracking ID** duy nhất, không tuần tự, dễ đọc (ví dụ: `DON-2026-7K3Q9X`) và cấp cho Donor.
  - **AC13.3:** Nhu cầu hiện vật là mục tiêu định hướng: Nếu tổng cam kết vượt chỉ tiêu, hệ thống hiển thị cảnh báo nhẹ nhưng vẫn cho phép ghi nhận cam kết.

#### US-14: Quản lý danh sách quyên góp cá nhân
- **Mô tả:** Là một Donor, tôi muốn vào trang quản lý cá nhân để xem lại toàn bộ các phần hiện vật đã cam kết, trạng thái tiếp nhận và sao chép mã Tracking ID, để tôi tiện theo dõi tiến độ.
- **Độ ưu tiên:** Must Have (M) | **Ước lượng:** 2 Story Points | **Sprint:** Sprint 3
- **Tiêu chí chấp nhận (AC):**
  - **AC14.1:** Trang `/my/donations` liệt kê trực quan các khoản quyên góp, lọc theo trạng thái (`PENDING`, `RECEIVED`, `IN_BATCH`, `DISTRIBUTED`, `CANCELLED`).
  - **AC14.2:** Có nút 1-click sao chép Tracking ID và nút mở nhanh trang tra cứu hành trình `/track/[trackingId]`.

#### US-15: Xác nhận thực nhận hoặc Từ chối hiện vật quyên góp
- **Mô tả:** Là một Organizer tại điểm tiếp nhận, tôi muốn xác nhận kiện hàng thực tế đã được chuyển đến kho của tổ chức hoặc từ chối nếu không đúng quy cách, để cập nhật chính xác số liệu kho.
- **Độ ưu tiên:** Must Have (M) | **Ước lượng:** 5 Story Points | **Sprint:** Sprint 3
- **Tiêu chí chấp nhận (AC):**
  - **AC15.1:** Tại giao diện `/organizer/donations`, Organizer tìm kiếm theo Tracking ID hoặc tên người gửi; khi nhấn "Xác nhận nhận hàng", trạng thái chuyển từ `PENDING` $\rightarrow$ `RECEIVED`.
  - **AC15.2:** Ngay khi chuyển sang `RECEIVED`, hệ thống **tự động tăng số lượng tồn kho khả dụng (`Available`)** của mặt hàng đó trong kho của tổ chức tương ứng với chiến dịch.
  - **AC15.3:** Nếu hiện vật bị hỏng hóc hoặc không đúng yêu cầu, Organizer chọn "Từ chối" (`REJECTED`) kèm ghi chú lý do; số lượng cam kết bị hủy và không ghi nhận vào kho.

---

### EPIC 06: Quản Lý Kho Hiện Vật & Đóng Gói Lô Hàng (Inventory & Donation Batching)
*Liên kết yêu cầu: KF09, KF10 | FR15, FR16 | NFR01, NFR05*

#### US-16: Quản lý Tồn kho Hiện vật & Kiểm tra Phương trình Cân đối
- **Mô tả:** Là một Organizer, tôi muốn theo dõi biến động số lượng tồn kho theo từng chiến dịch và kiểm tra tính cân đối số liệu, để đảm bảo không thất thoát hiện vật cứu trợ.
- **Độ ưu tiên:** Must Have (M) | **Ước lượng:** 5 Story Points | **Sprint:** Sprint 4
- **Tiêu chí chấp nhận (AC):**
  - **AC16.1:** Trang `/organizer/inventory` hiển thị chi tiết số lượng của từng mặt hàng theo 4 trạng thái: Khả dụng (`Available`), Đã giữ chỗ gom lô (`Reserved`), Đã phân phối xong (`Distributed`), Hao hụt/Hủy bỏ (`LostWrittenOff`).
  - **AC16.2:** **Phương trình cân đối kho bất biến:** Hệ thống liên tục kiểm tra và xác nhận:
    $$\text{Received} = \text{Available} + \text{Reserved} + \text{Distributed} + \text{LostWrittenOff}$$
    Nếu phát hiện sai lệch số liệu, hệ thống hiển thị cảnh báo đỏ và ghi nhận lỗi vào log nghiệp vụ.

#### US-17: Tạo Lô hàng quyên góp (Donation Batch)
- **Mô tả:** Là một Organizer, tôi muốn gom các khoản quyên góp lẻ đã nhận thuộc cùng chiến dịch, cùng loại hàng và đơn vị tính thành một Lô hàng (Batch), để chuẩn bị xếp lên xe vận chuyển.
- **Độ ưu tiên:** Must Have (M) | **Ước lượng:** 5 Story Points | **Sprint:** Sprint 4
- **Tiêu chí chấp nhận (AC):**
  - **AC17.1:** Quy tắc gom lô: Chỉ các đóng góp có trạng thái `RECEIVED`, cùng `eventId`, cùng danh mục hiện vật và đơn vị mới được phép gộp vào chung một `DonationBatch`.
  - **AC17.2:** **Quy tắc 1-Đóng góp 1-Lô:** Mỗi đóng góp chỉ thuộc về tối đa một Lô hàng duy nhất (không xé lẻ kiện hàng ở MVP).
  - **AC17.3:** Khi tạo Lô hàng thành công:
    - Trạng thái các khoản đóng góp thành phần chuyển thành `IN_BATCH`.
    - Lô hàng được khởi tạo với trạng thái `READY`.
    - Số lượng hiện vật tương ứng trong kho chuyển từ **`Available` $\rightarrow$ `Reserved`** (đã giữ chỗ cho chuyến đi, không thể dùng tạo lô khác).

---

### EPIC 07: Kế Hoạch Chuyến Phân Phối & Lộ Trình Điểm Phát (Distribution Trip Management)
*Liên kết yêu cầu: KF11 | FR17, FR18 | NFR04, NFR05, NFR06*

#### US-18: Lập kế hoạch Chuyến xe phân phối cứu trợ (Distribution Trip)
- **Mô tả:** Là một Organizer, tôi muốn tạo chuyến xe cứu trợ, gán các lô hàng sẵn sàng, chọn tình nguyện viên phụ trách và thiết lập danh sách điểm phát theo thứ tự, để tổ chức vận chuyển hàng hóa đến bà con vùng khó khăn.
- **Độ ưu tiên:** Must Have (M) | **Ước lượng:** 8 Story Points | **Sprint:** Sprint 4
- **Tiêu chí chấp nhận (AC):**
  - **AC18.1:** Chỉ các lô hàng có trạng thái `READY` và cùng `eventId` với Chuyến xe mới được phép đưa vào chuyến. Khi gán vào chuyến, trạng thái lô chuyển sang `ASSIGNED`.
  - **AC18.2:** Chỉ các tình nguyện viên đã được duyệt đơn (`APPROVED`) cho chiến dịch này mới được phân công vào chuyến. Phải chỉ định chính xác **1 Trưởng đoàn (Trip Leader)** và các thành viên đoàn (Members).
  - **AC18.3:** Thiết lập danh sách các điểm phát cứu trợ (`DistributionPoint`) theo thứ tự ưu tiên (Order: 1, 2, 3...) kèm địa chỉ và dự kiến người nhận.
  - **AC18.4:** Trạng thái chuyến đi khởi tạo là `SCHEDULED`.

#### US-19: Cập nhật Trạng thái Chuyến xe & Điểm phát thực địa
- **Mô tả:** Là Trưởng đoàn cứu trợ (Trip Leader) hoặc Organizer, tôi muốn cập nhật trạng thái di chuyển của chuyến xe và từng điểm phát, để ghi nhận tiến độ thực địa theo thời gian thực.
- **Độ ưu tiên:** Must Have (M) | **Ước lượng:** 5 Story Points | **Sprint:** Sprint 4
- **Tiêu chí chấp nhận (AC):**
  - **AC19.1:** Vòng đời trạng thái Chuyến xe tuân thủ nghiêm ngặt:
    $$\text{Scheduled} \longrightarrow \text{Preparing} \longrightarrow \text{In Transit} \longrightarrow \text{Completed}$$
  - **AC19.2:** Vòng đời trạng thái từng Điểm phát tuân thủ:
    $$\text{Pending} \longrightarrow \text{Arrived} \longrightarrow \text{Distributed (hoặc Skipped)}$$
  - **AC19.3:** **Điều kiện hoàn thành chuyến đi:** Chuyến xe chỉ được phép chuyển sang trạng thái `COMPLETED` khi **tất cả** các điểm phát thành phần đều đã ở trạng thái `DISTRIBUTED` hoặc `SKIPPED`.
  - **AC19.4:** **Quy tắc hủy chuyến:** Chuyến đi chỉ được phép hủy (`CANCELLED`) khi chưa có bất kỳ điểm phát nào chuyển sang `DISTRIBUTED`. Khi chuyến bị hủy, các lô hàng liên quan được giải phóng khỏi chuyến, chuyển trạng thái từ `ASSIGNED` về `READY`, lượng tồn kho vẫn giữ nguyên ở mức `Reserved` và có thể gán cho chuyến khác.

---

### EPIC 08: Bàn Giao Hiện Trường & Minh Chứng Quyền Riêng Tư (Handover & Evidence Review)
*Liên kết yêu cầu: KF12 | FR19, FR20, FR25 | NFR03, NFR05, NFR06*

#### US-20: Ghi nhận số lượng bàn giao thực tế tại điểm phát
- **Mô tả:** Là Trip Leader hoặc Organizer, tôi muốn ghi nhận số lượng hiện vật thực tế đã trao cho bà con tại mỗi điểm phát theo từng lô hàng, để đối soát số lượng chính xác với kho.
- **Độ ưu tiên:** Must Have (M) | **Ước lượng:** 5 Story Points | **Sprint:** Sprint 5
- **Tiêu chí chấp nhận (AC):**
  - **AC20.1:** Tại mỗi điểm phát, ghi nhận bản ghi `DistributionRecord` (gồm: Lô hàng, Điểm phát, Số lượng phát thực tế).
  - **AC20.2:** Tổng số lượng phát qua tất cả các điểm của một lô hàng không được vượt quá tổng dung lượng của lô hàng đó.
  - **AC20.3:** Nếu có chênh lệch (thừa/thiếu/hỏng hóc do vận chuyển):
    - Hàng còn thừa / trả về: Trả về trạng thái `Available` trong kho.
    - Hàng mất mát / hư hỏng: Ghi nhận vào `LostWrittenOff` kèm văn bản ghi chú lý do.
    $$\text{Lô hàng} = \text{Phát thực tế} + \text{Thu hồi trả về} + \text{Hao hụt ghi giảm}$$

#### US-21: Tải lên hình ảnh minh chứng & Cam kết bảo vệ quyền riêng tư
- **Mô tả:** Là một tình nguyện viên trong chuyến đi, tôi muốn tải lên ảnh chụp bàn giao hiện vật/biên bản nhận hàng, kèm cam kết không xâm phạm quyền riêng tư của người nhận hỗ trợ, để cung cấp minh chứng cho nhà hảo tâm.
- **Độ ưu tiên:** Should Have (S) | **Ước lượng:** 3 Story Points | **Sprint:** Sprint 5
- **Tiêu chí chấp nhận (AC):**
  - **AC21.1:** Hỗ trợ tải lên định dạng hình ảnh hợp lệ (JPG, PNG, WebP), dung lượng tối đa $\le$ 5MB/ảnh.
  - **AC21.2:** **Xác nhận bảo vệ quyền riêng tư:** Bắt buộc người tải ảnh phải tích chọn checkbox xác nhận: *"Tôi xác nhận hình ảnh đã được che mờ/cắt bỏ thông tin nhận diện nhạy cảm của người thụ hưởng hoặc đã nhận được sự đồng thuận theo quy định bảo vệ dữ liệu cá nhân"*.
  - **AC21.3:** Ảnh sau khi tải lên có trạng thái ban đầu là `PENDING_REVIEW` (chờ duyệt).

#### US-22: Xét duyệt công khai minh chứng bàn giao
- **Mô tả:** Là một Organizer, tôi muốn kiểm tra các hình ảnh minh chứng do TNV gửi lên và duyệt cho phép hiển thị công khai hoặc từ chối, để đảm bảo hình ảnh đúng thuần phong mỹ tục và tôn trọng người thụ hưởng.
- **Độ ưu tiên:** Should Have (S) | **Ước lượng:** 3 Story Points | **Sprint:** Sprint 5
- **Tiêu chí chấp nhận (AC):**
  - **AC22.1:** Tại trang `/organizer/transparency`, Organizer duyệt từng ảnh: Chuyển sang `APPROVED_PUBLIC` hoặc `REJECTED_PUBLIC`.
  - **AC22.2:** **Chỉ những hình ảnh có trạng thái `APPROVED_PUBLIC` mới được phép xuất hiện trên trang tra cứu công khai** `/track/[trackingId]` và Dòng thời gian chiến dịch.

---

### EPIC 09: Tra Cứu Minh Bạch Công Khai & Dòng Thời Gian (Public Tracking & Timeline)
*Liên kết yêu cầu: KF13, KF14 | FR20, FR21, FR22 | NFR01, NFR03, NFR06*

#### US-23: Tra cứu hành trình hiện vật bằng Tracking ID (Public Tracking)
- **Mô tả:** Là một nhà hảo tâm hoặc người dân bất kỳ, tôi muốn nhập mã Tracking ID vào thanh tra cứu công khai, để xem phần quà quyên góp của tôi đã được chuyển đến đâu và trao cho ai.
- **Độ ưu tiên:** Must Have (M) | **Ước lượng:** 5 Story Points | **Sprint:** Sprint 5
- **Tiêu chí chấp nhận (AC):**
  - **AC23.1:** Không yêu cầu đăng nhập: Truy cập `/track`, nhập Tracking ID hợp lệ (ví dụ: `DON-2026-7K3Q9X`) $\rightarrow$ chuyển hướng sang `/track/[trackingId]`.
  - **AC23.2:** Hiển thị toàn bộ hành trình truy vết:
    - Thông tin hiện vật cam kết (Loại hàng, số lượng, thời gian gửi).
    - Trạng thái tiếp nhận tại kho tổ chức.
    - Mã Lô hàng (Batch ID) tiếp nhận.
    - Chuyến xe cứu trợ, Trưởng đoàn phụ trách, Danh sách các điểm phát hàng.
    - Hình ảnh minh chứng bàn giao thực tế (chỉ hiển thị ảnh đã `APPROVED_PUBLIC`).
  - **AC23.3:** **Bảo mật dữ liệu cá nhân (Privacy by Design):** Trang tra cứu công khai **không hiển thị** số điện thoại, địa chỉ nhà riêng hoặc danh tính cá nhân chi tiết của người quyên góp và người nhận cứu trợ.

#### US-24: Tự động ghi vết dòng thời gian minh bạch (Transparency Timeline & Log)
- **Mô tả:** Là một người theo dõi hệ thống, tôi muốn dòng thời gian của khoản quyên góp/chiến dịch được ghi nhận tự động theo trình tự thời gian, để đảm bảo tính bất biến và không thể chối bỏ (*auditability*).
- **Độ ưu tiên:** Must Have (M) | **Ước lượng:** 3 Story Points | **Sprint:** Sprint 5
- **Tiêu chí chấp nhận (AC):**
  - **AC24.1:** Mỗi khi có thay đổi trạng thái quan trọng (Tạo cam kết $\rightarrow$ Nhận kho $\rightarrow$ Vào lô $\rightarrow$ Lên xe $\rightarrow$ Đến điểm phát $\rightarrow$ Hoàn thành bàn giao), hệ thống tự động ghi một bản ghi `TransparencyLog` gồm: Thời gian chính xác, Tác nhân thực hiện (Actor), Trạng thái cũ $\rightarrow$ Trạng thái mới, Minh chứng liên quan.
  - **AC24.2:** Giao diện Dòng thời gian biểu diễn trực quan dạng timeline dọc với các mốc trạng thái, biểu tượng trạng thái rõ ràng và thời gian chi tiết.

---

### EPIC 10: Bảng Điều Khiển, Báo Cáo & Quản Trị Hệ Thống (Dashboard & Platform Admin)
*Liên kết yêu cầu: KF15, KF16 | FR23, FR24 | NFR01, NFR04*

#### US-25: Bảng điều khiển tổng hợp hoạt động của Tổ chức (Organizer Dashboard)
- **Mô tả:** Là một Organizer, tôi muốn xem bảng tóm tắt số liệu tổng quan của tổ chức, để nắm bắt nhanh tình hình hoạt động và ra quyết định điều phối.
- **Độ ưu tiên:** Should Have (S) | **Ước lượng:** 3 Story Points | **Sprint:** Sprint 5
- **Tiêu chí chấp nhận (AC):**
  - **AC25.1:** Trang `/organizer/dashboard` hiển thị các thẻ thống kê trực quan: Tổng số chiến dịch, Tổng tình nguyện viên đã duyệt, Tổng số lượng hiện vật theo 4 chỉ số (Cần kêu gọi / Đã cam kết / Đã tiếp nhận / Đã trao tay).
  - **AC25.2:** Hiển thị danh sách các chuyến xe đang chuẩn bị hoặc đang di chuyển cần xử lý gấp.

#### US-26: Quản trị Tài khoản & Chiến dịch toàn sàn (Admin Console)
- **Mô tả:** Là Quản trị viên hệ thống (Admin), tôi muốn quản lý danh sách người dùng, kích hoạt/khóa tài khoản và theo dõi trạng thái các chiến dịch, để giữ gìn trật tự và an toàn cho toàn bộ nền tảng.
- **Độ ưu tiên:** Should Have (S) | **Ước lượng:** 3 Story Points | **Sprint:** Sprint 5
- **Tiêu chí chấp nhận (AC):**
  - **AC26.1:** Trang `/admin/users` cho phép tìm kiếm người dùng, kích hoạt hoặc khóa tài khoản vi phạm.
  - **AC26.2:** Trang `/admin/events` cho phép theo dõi toàn bộ chiến dịch trên hệ thống, có quyền can thiệp tạm ngưng chiến dịch có dấu hiệu bất thường.

---

### EPIC 11: Nền Tảng Kỹ Thuật, REST API & Dữ Liệu Demo (Technical Enablers & System Quality)
*Liên kết yêu cầu: KF17 | FR26 | NFR01, NFR02, NFR07, NFR08, NFR09, NFR10*

#### US-27: Thiết kế Khung dự án & Quy ước Hợp đồng API (API Contracts & Architecture Skeleton)
- **Mô tả:** Là Kiến trúc sư & Lập trình viên hệ thống, tôi muốn xây dựng cấu trúc dự án chuẩn (Next.js Frontend, Modular Monolith Architecture, Prisma Schema, TypeScript types), để toàn đội ngũ có thể phát triển song song hiệu quả.
- **Độ ưu tiên:** Must Have (M) | **Ước lượng:** 5 Story Points | **Sprint:** Sprint 1
- **Tiêu chí chấp nhận (AC):**
  - **AC27.1:** Thiết lập hoàn chỉnh cấu trúc dự án Next.js App Router, Tailwind CSS, TypeScript và ESLint.
  - **AC27.2:** Định nghĩa đầy đủ toàn bộ Interfaces, Enums, Types cho các thực thể nghiệp vụ tại `src/types/index.ts`.
  - **AC27.3:** Xây dựng Mock Storage Service (`storageService`) hỗ trợ lưu trữ cục bộ qua `localStorage` và cơ chế phát sự kiện phản ứng `openaid-db-changed` để phục vụ demo hoàn chỉnh mà không bị phụ thuộc kết nối mạng.

#### US-28: Khởi tạo Bộ Dữ liệu Mẫu (Seed Data) & Kịch bản Trình diễn Hoàn chỉnh
- **Mô tả:** Là QA Lead và nhóm phát triển, tôi muốn xây dựng bộ dữ liệu mẫu phong phú và kịch bản demo chuẩn xác (Chiến dịch Lũ lụt Hòa Vang), để phục vụ kiểm thử và báo cáo đồ án mượt mà.
- **Độ ưu tiên:** Must Have (M) | **Ước lượng:** 3 Story Points | **Sprint:** Sprint 1 & 6
- **Tiêu chí chấp nhận (AC):**
  - **AC28.1:** File `seedData.ts` cung cấp đầy đủ dữ liệu liên kết chặt chẽ cho: 5 tài khoản mẫu, 2 tổ chức, 2 chiến dịch lớn, 4 mã Tracking ID thật bao phủ đủ 4 trạng thái (`DISTRIBUTED`, `RECEIVED`, `IN_BATCH`, `PENDING`).
  - **AC28.2:** Có nút chức năng "Khôi phục dữ liệu mẫu" (Reset Seed Data) trên thanh công cụ demo để đưa toàn bộ hệ thống về trạng thái chuẩn chỉ trong 1 thao tác.

---

## 5. Ma Trận Truy Vết Yêu Cầu (Requirements Traceability Matrix - RTM)

Bảng ma trận truy vết đảm bảo **100% các tính năng chủ chốt (KF01 - KF17) và yêu cầu chức năng (FR01 - FR26)** trong đề cương được hiện thực hóa qua các User Stories:

| Mã KF | Mã FR | Tên yêu cầu chức năng | User Story tương ứng | Độ ưu tiên | Mức độ bao phủ |
| :---: | :---: | :--- | :---: | :---: | :---: |
| **KF01** | FR01 | Xác thực tài khoản người dùng (Register, Login, Hash) | US-01, US-02 | Must | 100% |
| **KF01** | FR02 | Quản lý thông tin hồ sơ cá nhân | US-03 | Should | 100% |
| **KF02** | FR03 | Phân quyền truy cập theo vai trò (RBAC - User/Admin/Org) | US-02, US-04 | Must | 100% |
| **KF02** | FR04 | Đăng ký & Xét duyệt tổ chức thiện nguyện | US-04, US-05 | Must | 100% |
| **KF03** | FR05 | Quản lý vòng đời chiến dịch (Draft, Published, Closed...) | US-06, US-08 | Must | 100% |
| **KF03** | FR06 | Khai báo vai trò TNV & Nhu cầu hiện vật | US-07 | Must | 100% |
| **KF04** | FR07 | Khám phá, tìm kiếm và lọc chiến dịch cứu trợ | US-09 | Must | 100% |
| **KF05** | FR08 | Đăng ký ứng tuyển vai trò tình nguyện viên | US-10 | Must | 100% |
| **KF05** | FR09 | Organizer xét duyệt đơn đăng ký tình nguyện viên | US-11 | Must | 100% |
| **KF06** | FR10 | Quản lý danh sách hoạt động tình nguyện cá nhân | US-12 | Must | 100% |
| **KF07** | FR11 | Điểm danh thực địa TNV (Check-in/Check-out) | US-12 | Should | 100% |
| **KF08** | FR12 | Đăng ký cam kết hiện vật & Cấp mã Tracking ID | US-13 | Must | 100% |
| **KF08** | FR13 | Quản lý danh mục quyên góp cá nhân | US-14 | Must | 100% |
| **KF09** | FR14 | Organizer xác nhận thực nhận / từ chối hiện vật | US-15 | Must | 100% |
| **KF09** | FR15 | Quản lý kho cân đối: Available $\rightarrow$ Reserved $\rightarrow$ Distributed | US-16 | Must | 100% |
| **KF10** | FR16 | Gom lô hàng quyên góp (Donation Batching) | US-17 | Must | 100% |
| **KF11** | FR17 | Tạo chuyến xe cứu trợ, gán TNV & danh sách điểm phát | US-18 | Must | 100% |
| **KF11** | FR18 | Cập nhật tiến độ Chuyến xe & Điểm phát | US-19 | Must | 100% |
| **KF12** | FR19 | Ghi nhận phân phối tại điểm & Đối soát kho | US-20 | Must | 100% |
| **KF12** | FR25 | Tải ảnh minh chứng & Cam kết bảo vệ quyền riêng tư | US-21, US-22 | Should | 100% |
| **KF13** | FR20 | Tự động ghi nhận vết nghiệp vụ (Transparency Log) | US-24 | Must | 100% |
| **KF13** | FR21 | Hiển thị Dòng thời gian minh bạch (Transparency Timeline) | US-24 | Must | 100% |
| **KF14** | FR22 | Tra cứu công khai hành trình bằng Tracking ID | US-23 | Must | 100% |
| **KF15** | FR23 | Bảng điều khiển thống kê số liệu (Organizer Dashboard) | US-25 | Should | 100% |
| **KF16** | FR24 | Bảng điều khiển quản trị viên hệ thống (Admin Console) | US-26 | Should | 100% |
| **KF17** | FR26 | Kiến trúc kỹ thuật, hợp đồng API & Dữ liệu Seed | US-27, US-28 | Must | 100% |

---

## 6. Kế Hoạch Phân Bổ Sprint Backlog (12 Tuần / 6 Sprints)

Chu kỳ dự án kéo dài 12 tuần với 6 Sprint (mỗi Sprint 2 tuần). Đội ngũ 4 thành viên phối hợp chặt chẽ:
- **M1 (Thái Hòa):** Scrum Master, Frontend Lead, UI Architecture, Integration.
- **M2 (Quang Tính):** Backend Developer (Auth, Org, Event, Volunteer).
- **M3 (Lê Hoàng):** Backend Developer (Donation, Inventory, Batch, Trip, Evidence).
- **M4 (Phước Tường):** Product Owner, QA Lead, API Testing, Documentation, UI Support.

```
                                  LỘ TRÌNH 6 SPRINTS (12 TUẦN)
 Sprint 1 (W1-W2) ──► Sprint 2 (W3-W4) ──► Sprint 3 (W5-W6) ──► Sprint 4 (W7-W8) ──► Sprint 5 (W9-W10) ──► Sprint 6 (W11-W12)
 ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     ┌──────────────┐
 │ Foundation   │    │ Identity &   │    │ Volunteer &  │    │ Inventory,   │    │ Transparency │     │ Hardening,   │
 │ & Baseline   │    │ Events       │    │ Donations    │    │ Batches &    │    │ Dashboard &  │     │ Testing &    │
 │              │    │              │    │              │    │ Trips        │    │ Public Track │     │ Final Demo   │
 └──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘     └──────────────┘
```

### Chi tiết kế hoạch từng Sprint:

| Sprint | Tuần | Mục tiêu chính (Sprint Goal) | Các User Stories thực hiện | Phân công | Điểm SP | Điểm mốc kiểm tra (Checkpoint) |
| :---: | :---: | :--- | :--- | :---: | :---: | :--- |
| **Sprint 1** | W1 – W2 | Thiết lập nền móng dự án, kiến trúc hệ thống, API contracts, Wireframe UI và seed dataset | US-27, US-28 | Cả nhóm | **8 SP** | Hoàn thành bộ tài liệu Baseline, khung dự án Next.js & TypeScript types chạy thông suốt. |
| **Sprint 2** | W3 – W4 | Hoàn thành xác thực, phân quyền, quản lý tổ chức và tạo/khám phá sự kiện cứu trợ | US-01, US-02, US-03, US-04, US-05, US-06, US-07, US-08, US-09 | M1, M2 | **27 SP** | **Checkpoint 1:** Luồng Đăng nhập $\rightarrow$ Tạo tổ chức $\rightarrow$ Duyệt tổ chức $\rightarrow$ Tạo và công bố sự kiện chạy thông suốt. |
| **Sprint 3** | W5 – W6 | Hoàn thành quy trình tuyển tình nguyện viên, cam kết hiện vật, sinh mã Tracking ID và tiếp nhận kho | US-10, US-11, US-12, US-13, US-14, US-15 | M1, M2, M3, M4 | **21 SP** | **Checkpoint 2:** Ứng tuyển TNV $\rightarrow$ Duyệt TNV; Cam kết hiện vật $\rightarrow$ Cấp Tracking ID $\rightarrow$ Xác nhận nhận hàng $\rightarrow$ Tăng kho khả dụng. |
| **Sprint 4** | W7 – W8 | Hoàn thành quản lý tồn kho cân đối, đóng gói lô hàng và quản lý chuyến xe cứu trợ đa điểm phát | US-16, US-17, US-18, US-19 | M1, M3 | **23 SP** | **Checkpoint 3:** Kiểm tra bất biến kho; Gom lô $\rightarrow$ Giữ chỗ (`Reserved`); Lập chuyến xe $\rightarrow$ Gán lô $\rightarrow$ Khởi hành chuyến xe. |
| **Sprint 5** | W9 – W10 | Hoàn tất phân phối hiện trường, kiểm duyệt ảnh quyền riêng tư, dòng thời gian và tra cứu công khai | US-20, US-21, US-22, US-23, US-24, US-25, US-26 | M1, M3, M4 | **25 SP** | **Checkpoint 4 & 5:** Ghi nhận phát $\rightarrow$ Duyệt ảnh $\rightarrow$ Hoàn thành chuyến xe $\rightarrow$ Tra cứu công khai thành công bằng Tracking ID. |
| **Sprint 6** | W11 – W12 | Kiểm thử đầu-cuối (E2E), tối ưu hóa hiệu năng, đóng gói tài liệu kỹ thuật và diễn tập kịch bản demo | Đóng gói toàn bộ hệ thống, sửa lỗi, hoàn thiện tài liệu | Cả nhóm | **Không SP mới** | **OpenAid v1.0:** Hoàn thành video/kịch bản demo thông suốt không lỗi, sẵn sàng bảo vệ đồ án tốt nghiệp. |

---

## 7. Quy Trình Tinh Chỉnh & Cập Nhật Backlog (Backlog Refinement Process)

Để đảm bảo Product Backlog luôn phản ánh chính xác tình trạng thực tế và mục tiêu tốt nghiệp, nhóm tuân thủ quy trình vận hành định kỳ:

```
                  QUY TRÌNH TINH CHỈNH PRODUCT BACKLOG (REFINEMENT)
  ┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
  │  1. Thu thập Yêu │       │  2. Phân rã &    │       │  3. Ước lượng    │
  │  cầu & Góp ý     │ ───►  │  Viết AC (BDD)   │ ───►  │  Story Points    │
  │  (PO / Mentor)   │       │  (PO & SM)       │       │  (Planning Poker)│
  └──────────────────┘       └──────────────────┘       └──────────────────┘
                                                                  │
  ┌──────────────────┐       ┌──────────────────┐                 ▼
  │  5. Đưa vào      │       │  4. Rà soát DoR  │       ┌──────────────────┐
  │  Sprint Backlog  │ ◄───  │  (Definition of  │ ◄───  │  Ưu tiên hóa     │
  │  (Sprint Plan)   │       │   Ready)         │       │  (MoSCoW)        │
  └──────────────────┘       └──────────────────┘       └──────────────────┘
```

1. **Họp tinh chỉnh Backlog (Backlog Grooming/Refinement):** Diễn ra vào giữa mỗi Sprint (thứ Tư tuần thứ 2 của Sprint). Product Owner (Phước Tường) chủ trì cùng Scrum Master (Thái Hòa) và đội ngũ kỹ thuật để giải thích chi tiết các User Stories của Sprint tiếp theo.
2. **Chiến lược ứng phó trễ hạn (De-scoping Strategy):** Nếu tiến độ Sprint bị chậm do phát sinh lỗi kỹ thuật phức tạp:
   - **Tuyệt đối không cắt giảm:** Chuỗi nghiệp vụ cốt lõi xuyên suốt (*Golden Chain*): `Sự kiện` $\rightarrow$ `Cam kết hiện vật` $\rightarrow$ `Nhập kho` $\rightarrow$ `Gom lô` $\rightarrow$ `Chuyến xe` $\rightarrow$ `Minh chứng` $\rightarrow$ `Tra cứu Tracking ID`.
   - **Ưu tiên cắt giảm / đơn giản hóa trước:** Check-in bằng QR code thực tế (thay bằng nút bấm xác nhận), các chức năng kiểm duyệt chuyên sâu của Admin và các biểu đồ thứ cấp trên Dashboard.
3. **Cập nhật tài liệu sống:** Bất kỳ thay đổi nào về quy tắc nghiệp vụ hoặc cấu trúc API phải được cập nhật đồng bộ ngay vào file `PRODUCT_BACKLOG.md` và `README.md` của dự án.
