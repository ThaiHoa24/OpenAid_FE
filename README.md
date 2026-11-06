# OpenAid — Nền Tảng Điều Phối Cứu Trợ Hiện Vật & Tình Nguyện Minh Bạch

OpenAid là nền tảng quản trị và điều phối chuỗi cung ứng cứu trợ hiện vật kết hợp vận hành đội ngũ tình nguyện viên thực địa. Hệ thống giải quyết bài toán cốt lõi về **tính minh bạch và liên kết khép kín** trong hoạt động từ thiện: từ lúc phát động chiến dịch, nhà hảo tâm cam kết gửi hiện vật, tiếp nhận nhập kho, đóng gói lô hàng, điều phối chuyến xe, phân công đội ngũ tình nguyện viên đến khi bàn giao tận tay đồng bào và tra cứu theo dõi bằng **Mã Vận Đơn (Tracking ID)** độc bản.

Phiên bản hiện tại là **Frontend Demo hoàn chỉnh** xây dựng trên Next.js 16 (App Router), vận hành bằng kiến trúc **Mock Service phản ứng (Reactive Mock Services)** lưu trữ dữ liệu trong `localStorage` của trình duyệt, sẵn sàng tích hợp Backend API.

---

## 🚀 Công Nghệ Sử Dụng

| Thành phần | Công nghệ & Phiên bản | Ghi chú |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.4.3 (App Router) | Webpack bundler, kiến trúc tách biệt `src/app/` và `src/view/` |
| **Giao diện & Logic** | React 19.3.0, TypeScript 5.9 | Client Components tối ưu hóa tính tương tác cao |
| **Hệ thống Styling** | Tailwind CSS 4.2.1 | Forest green `#1F4D36`, container chuẩn 1440px, responsive toàn diện |
| **Hệ thống Icon** | Lucide React | Bộ biểu tượng vector nhất quán, ngữ nghĩa cao |
| **Quản lý Phiên & State**| React Context, Custom Hooks, Reactive Storage Event | Tự động đồng bộ UI khi dữ liệu `localStorage` thay đổi (`openaid-db-changed`) |
| **Kiểm toán & Cân đối**| Utility Functions | Xác minh phương trình bảo toàn kho vật tư và đối soát lô hàng |

---

## 👥 Kiến Trúc Phân Quyền & Các Vai Trò (Roles)

Hệ thống được thiết kế theo mô hình phân quyền 2 tầng linh hoạt:

```text
┌────────────────────────────────────────────────────────┐
│               TẦNG HỆ THỐNG (SystemRole)               │
│                                                        │
│       ┌──────────────────────┐  ┌──────────────────┐   │
│       │        ADMIN         │  │       USER       │   │
│       └──────────┬───────────┘  └────────┬─────────┘   │
└──────────────────┼───────────────────────┼─────────────┘
                   │                       │
┌──────────────────┼───────────────────────┼─────────────┐
│                  │                       │             │
│      ┌───────────▼───────────┐           │             │
│      │ Quản trị viên nền tảng│           │             │
│      └───────────────────────┘           │             │
│                                          │             │
│   ┌──────────────────────────────────────┴─────────┐   │
│   │           TẦNG TỔ CHỨC (OrganizationRole)      │   │
│   │                                                │   │
│   │   ┌────────────────────┐ ┌─────────────────┐   │   │
│   │   │     ORGANIZER      │ │     MEMBER      │   │   │
│   │   │  (Ban Tổ Chức NGO) │ │   (Thành viên)  │   │   │
│   │   └────────────────────┘ └─────────────────┘   │   │
│   │                                                │   │
│   │         PERSONAS (Người dùng cá nhân):         │   │
│   │      • Tình Nguyện Viên (Volunteer)            │   │
│   │      • Nhà Hảo Tâm (Donor)                     │   │
│   └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

### 1. Quản Trị Viên (System Role: `ADMIN`)
* **Vai trò**: Đại diện cơ quan quản lý/nền tảng cấp cao, có toàn quyền giám sát hệ thống.
* **Khu vực làm việc**: `/admin/*` (`/admin/dashboard`, `/admin/organizations`, `/admin/users`, `/admin/events`).
* **Thao tác chính**:
  * Duyệt hồ sơ thành lập tổ chức cứu trợ (1-click Quick Approve hoặc Từ chối kèm lý do).
  * Giám sát dòng nhật ký kiểm toán (Live Audit Trail Stream) theo thời gian thực.
  * Quản lý trạng thái chiến dịch và khóa/kích hoạt tài khoản người dùng trên nền tảng.

### 2. Ban Tổ Chức Cứu Trợ (System Role: `USER` + Organization Role: `ORGANIZER`)
* **Vai trò**: Các tổ chức phi chính phủ (NGO), đội nhóm thiện nguyện được cấp phép tạo chiến dịch và điều phối hiện vật thực địa.
* **Khu vực làm việc**: `/organizer/*` (`/organizer/dashboard`, `/organizer/events`, `/organizer/donations`, `/organizer/inventory`, `/organizer/batches`, `/organizer/trips`, `/organizer/volunteers`, `/organizer/transparency`).
* **Thao tác chính**:
  * **Trung tâm Điều hành (Operations Dashboard)**: Giám sát lô hàng sẵn sàng gom xe, chuyến xe đang chạy trên đường, truy cập nhanh Action Center.
  * **Tiếp nhận quyên góp**: Xác nhận hàng về kho (tự động cộng kho Khả dụng) hoặc Từ chối đóng góp không phù hợp.
  * **Quản trị kho**: Đối soát phương trình bảo toàn vật tư (`Received = Available + Reserved + Distributed + LostWrittenOff`).
  * **Đóng gói lô hàng (Batching)**: Gom các hiện vật cùng loại vào lô, gán mã lô, đưa sang trạng thái `READY`.
  * **Điều phối chuyến xe (Trip Dispatch)**: Tạo chuyến, liên kết các lô hàng `READY`, bổ nhiệm Trưởng đoàn xe, phân công tình nguyện viên, lập danh sách điểm cứu trợ.
  * **Thực địa & Minh bạch**: Cập nhật tiến độ xe đến điểm phát, ghi nhận số lượng trao tặng, tải ảnh bằng chứng bàn giao, đối soát số lượng dư/thiếu và duyệt ảnh công khai.

### 3. Người Dùng — Nhà Hảo Tâm (System Role: `USER` - Persona: Donor)
* **Khu vực làm việc**: `/donate/[eventId]`, `/my/donations`, `/track/[trackingId]`.
* **Thao tác chính**:
  * Chọn chiến dịch và cam kết quyên góp hiện vật theo danh mục nhu cầu thực tế.
  * Nhận **Mã Vận Đơn (Tracking ID)** độc bản kèm hướng dẫn địa chỉ kho tiếp nhận và hình thức gửi (trực tiếp, bưu cục, gửi chành xe).
  * Theo dõi tiến độ hiện vật cá nhân: *Chờ nhập kho → Đã tiếp nhận → Đóng lô → Lên chuyến xe → Đã bàn giao tận tay*.
  * Chủ động **Hủy cam kết** khi chưa gửi hàng để tự động giải phóng hạn ngạch cho nhà hảo tâm khác.

### 4. Người Dùng — Tình Nguyện Viên (System Role: `USER` - Persona: Volunteer)
* **Khu vực làm việc**: `/volunteer/apply/[eventId]`, `/my/activities`.
* **Thao tác chính**:
  * Nộp đơn ứng tuyển vị trí thực địa kèm thông tin năng lực, phương tiện, liên hệ khẩn cấp và cam kết an toàn.
  * Xem tiến trình xét duyệt hồ sơ, chủ động **Rút đơn** nếu có việc đột xuất.
  * Nhận **Lệnh Điều Động Chuyến Xe (Dispatch Order)** & **Bấm xem Chi Tiết Chuyến Đi**: Bấm vào từng chiến dịch đã đăng ký để mở cửa sổ chi tiết toàn diện chuyến xe: xem lộ trình từng điểm trao quà (vật tư bàn giao, giờ đến, ảnh thực địa), danh sách Lô hàng trên xe, danh bạ đồng đội trong đoàn xe và cẩm nang an toàn thực địa.
  * **Điểm danh thực địa**: Bấm xác thực có mặt trực tiếp hoặc xuất trình mã QR cá nhân cho Trưởng đoàn quét, lưu vết thời gian vào hệ thống kiểm toán.

---

## 🔄 Chuỗi Nghiệp Vụ Khép Kín (End-to-End Operational Lifecycle)

Hệ thống liên kết chặt chẽ các khâu để loại bỏ hoàn toàn các "điểm nghẽn" dữ liệu:

```text
[Nhà Hảo Tâm]               [Ban Tổ Chức]                  [Đoàn Phân Phối]            [Công Khai]
      │                           │                               │                         │
      │ 1. Cam kết hiện vật       │                               │                         │
      ├──────────────────────────►│                               │                         │
      │  (Cấp Tracking ID)        │ 2. Tiếp nhận & Kiểm định      │                         │
      │                           ├───────────────┐               │                         │
      │                           │ Cộng Kho Khả Dụng             │                         │
      │                           │               │               │                         │
      │                           │ 3. Đóng gói Lô hàng           │                         │
      │                           ├───────────────┤               │                         │
      │                           │ Chuyển Kho Tạm Giữ (Reserved) │                         │
      │                           │               │               │                         │
      │ 4. TNV Nộp hồ sơ          │ 5. Duyệt đơn & Phân công      │                         │
      ├──────────────────────────►├───────────────┬──────────────►│                         │
      │                           │ Gán Lô + Phân công xe         │                         │
      │                           │                               │ 6. Nhận Lệnh Điều Động  │
      │                           │                               │    & Điểm danh QR       │
      │                           │                               ├────────────────────────►│
      │                           │                               │                         │
      │                           │                               │ 7. Xe chạy & Trao quà   │
      │                           │                               ├───────────────┐         │
      │                           │                               │ Ghi nhận số lượng & Ảnh │
      │                           │ 8. Hoàn tất chuyến & Đối soát │               │         │
      │                           │◄──────────────────────────────┼───────────────┘         │
      │                           │ Tự động cân bằng kho bảo toàn │                         │
      │                           │               │               │                         │
      │ 9. Tra cứu hành trình     │ 10. Duyệt ảnh công khai       │                         │
      ├───────────────────────────┴───────────────┴───────────────┴────────────────────────►│
      │  Minh bạch: Từ cam kết đến biên bản bàn giao thực tế tại thôn bản                   │
```

### Phương trình Cân đối Bảo toàn Kho (Inventory Invariant):
$$\text{Received} = \text{Available} + \text{Reserved} + \text{Distributed} + \text{LostWrittenOff}$$

### Phương trình Đối soát Lô hàng (Batch Reconciliation):
$$\text{TotalQuantity} = \text{DistributedQuantity} + \text{ReturnedQuantity} + \text{LostQuantity}$$

---

## 🗺️ Bản Đồ Điều Hướng & 26 Tuyến Giao Diện (Routing Map)

Tất cả các route trong `src/app/` đều tuân thủ kiến trúc chuẩn: chỉ khai báo route và import view tương ứng từ `src/view/`.

### 1. Trang Công Khai & Xác Thực
| Đường dẫn | View Tương Ứng | Chức năng chính |
| :--- | :--- | :--- |
| `/` | `src/view/page.tsx` | Trang chủ: Giới thiệu, chiến dịch tiêu biểu, quy trình minh bạch |
| `/about` | `src/view/about/page.tsx` | Giới thiệu sứ mệnh nền tảng OpenAid |
| `/events` | `src/view/events/page.tsx` | Khám phá chiến dịch cứu trợ, tìm kiếm và lọc danh mục |
| `/events/[id]` | `src/view/events/[id]/page.tsx` | Chi tiết chiến dịch: Tiến độ hiện vật, chỉ tiêu TNV, điều phối viên |
| `/track` | `src/view/track/page.tsx` | Cổng tra cứu Mã Vận Đơn tập trung |
| `/track/[trackingId]` | `src/view/track/[trackingId]/page.tsx` | Hành trình chi tiết: Lịch sử đóng lô, chuyến xe, ảnh thực địa đã duyệt |
| `/login` | `src/view/(auth)/login/page.tsx` | Đăng nhập tài khoản hoặc chọn đăng nhập demo nhanh |
| `/register` | `src/view/(auth)/register/page.tsx` | Đăng ký tài khoản người dùng hoặc nộp hồ sơ thành lập tổ chức cứu trợ |
| `/profile` | `src/view/profile/page.tsx` | Xem và cập nhật thông tin cá nhân |

### 2. Khu Vực Người Dùng Cá Nhân (Personas: Volunteer & Donor)
| Đường dẫn | View Tương Ứng | Chức năng chính |
| :--- | :--- | :--- |
| `/volunteer/apply/[eventId]` | `src/view/volunteer/apply/[eventId]/page.tsx` | Ứng tuyển TNV: Chọn vai trò, tiến độ hạn ngạch, cam kết an toàn, số liên hệ khẩn cấp |
| `/donate/[eventId]` | `src/view/donate/[eventId]/page.tsx` | Đóng góp hiện vật: Chọn nhu cầu, nhập số lượng, phương thức gửi, nhận Tracking ID |
| `/my/activities` | `src/view/my/activities/page.tsx` | Quản lý đơn tình nguyện: Rút đơn, nhận Lệnh điều động chuyến xe, xuất trình mã QR & Điểm danh thực địa |
| `/my/donations` | `src/view/my/donations/page.tsx` | Sổ theo dõi đóng góp: Lọc trạng thái, xem mã lô/chuyến xe, hủy cam kết PENDING |

### 3. Khu Vực Ban Tổ Chức Cứu Trợ (Organizer)
| Đường dẫn | View Tương Ứng | Chức năng chính |
| :--- | :--- | :--- |
| `/organizer/dashboard` | `src/view/organizer/dashboard/page.tsx` | Bảng điều hành: Live Batches, Active Trips, Action Center, thanh tiến độ kho vật tư |
| `/organizer/events` | `src/view/organizer/events/page.tsx` | Quản lý chiến dịch của tổ chức: Tạo mới, cập nhật nhu cầu hiện vật & vị trí TNV |
| `/organizer/events/[id]` | `src/view/organizer/events/[id]/page.tsx` | Bảng điều khiển riêng từng chiến dịch, duyệt nhanh đơn TNV và đóng góp |
| `/organizer/donations` | `src/view/organizer/donations/page.tsx` | Tiếp nhận hiện vật: Xác nhận nhận hàng vào kho, từ chối đóng góp sai lệch |
| `/organizer/inventory` | `src/view/organizer/inventory/page.tsx` | Kiểm kê kho: Đối chiếu phương trình cân đối kho, lịch sử nhập/xuất |
| `/organizer/batches` | `src/view/organizer/batches/page.tsx` | Đóng gói lô hàng: Gom hiện vật, chuyển trạng thái READY, đối soát sau chuyến đi |
| `/organizer/trips` | `src/view/organizer/trips/page.tsx` | Điều phối chuyến xe: Tạo chuyến, phân công Trưởng đoàn & TNV, quản lý lộ trình trao quà, ghi nhận bàn giao & banner chuyển tiếp đối soát lô |
| `/organizer/volunteers` | `src/view/organizer/volunteers/page.tsx` | Quản trị nhân lực: Duyệt/từ chối đơn ứng tuyển, kiểm tra danh sách có mặt |
| `/organizer/transparency` | `src/view/organizer/transparency/page.tsx` | Trung tâm minh bạch: Thẩm định ảnh bằng chứng trao quà trước khi công bố ra cộng đồng |

### 4. Khu Vực Quản Trị Hệ Thống (Admin)
| Đường dẫn | View Tương Ứng | Chức năng chính |
| :--- | :--- | :--- |
| `/admin/dashboard` | `src/view/admin/dashboard/page.tsx` | Thống kê toàn sàn, hàng đợi duyệt nhanh tổ chức (Quick Approve Queue), Live Audit Trail |
| `/admin/organizations` | `src/view/admin/organizations/page.tsx` | Thẩm định hồ sơ tổ chức thiện nguyện, kích hoạt hoặc tạm dừng |
| `/admin/users` | `src/view/admin/users/page.tsx` | Danh bạ người dùng toàn hệ thống, cấp quyền hoặc khóa tài khoản |
| `/admin/events` | `src/view/admin/events/page.tsx` | Giám sát và kiểm duyệt toàn bộ chiến dịch trên nền tảng |

---

## 💻 Cài Đặt & Khởi Chạy Ứng Dụng

### Yêu Cầu Môi Trường
* **Node.js**: Phiên bản `20.9.0` trở lên (khuyến nghị Node 20 LTS hoặc 22 LTS).
* **Trình duyệt**: Hỗ trợ HTML5 và `localStorage`.

### Các Bước Cài Đặt
```bash
# 1. Cài đặt các gói phụ thuộc
npm ci

# 2. Khởi chạy máy chủ phát triển
npm run dev
```

Mở trình duyệt tại: **[http://localhost:3000](http://localhost:3000)**. Dữ liệu hạt giống (Seed Data) sẽ được tự động khởi tạo vào `localStorage` trong lần truy cập đầu tiên.

### Build Kiểm Tra Bản Production
```bash
# Biên dịch và kiểm tra TypeScript toàn bộ dự án
npm run build

# Chạy bản production cục bộ
npm run start
```

---

## 🔑 Tài Khoản Demo & Kịch Bản Trải Nghiệm Liên Hoàn

### Danh Sách Tài Khoản Mẫu (Mật khẩu chung: `123456`)

| Email | Vai trò | Khu vực hoạt động chính | Mục đích demo |
| :--- | :--- | :--- | :--- |
| `user@openaid.demo` | `USER` | `/my/activities`, `/my/donations` | Trải nghiệm nộp đơn TNV, cam kết hiện vật, nhận Lệnh điều động xe, điểm danh thực địa |
| `organizer@openaid.demo` | `ORGANIZER` | `/organizer/dashboard` | Quản lý tổ chức *Helping Hands Da Nang*, điều hành kho, gom lô, điều phối đoàn xe |
| `admin@openaid.demo` | `ADMIN` | `/admin/dashboard` | Duyệt tổ chức mới, giám sát kiểm toán hệ thống |
| `volunteer.b@openaid.demo` | `USER` | `/my/activities` | Tài khoản TNV thứ hai để thử phân công Trưởng đoàn / Đội ngũ chuyến xe |
| `greenhope@openaid.demo` | `ORGANIZER` (Pending) | `/profile` | Tổ chức *Green Hope Youth Network* đang chờ Admin duyệt |

> [!TIP]
> Sử dụng thanh **Chuyển Vai Trò Demo (Role Switcher Bar)** ở mép trên màn hình để chuyển đổi tức thì giữa các vai trò mà không cần đăng xuất/đăng nhập lại. Bạn cũng có thể nhấn nút **Khôi phục dữ liệu mẫu** bất kỳ lúc nào để đưa database về trạng thái ban đầu.

### Mã Vận Đơn (Tracking ID) Sẵn Có Để Thử Nghiệm

| Tracking ID | Hiện vật | Trạng thái mẫu | Có thể tra cứu tại |
| :--- | :--- | :--- | :--- |
| `DON-2026-7K3Q9X` | 50 kg gạo ST25 | `DISTRIBUTED` (Đã bàn giao, có ảnh thực địa) | `/track/DON-2026-7K3Q9X` |
| `DON-2026-5W9K2N` | 500 chai nước suối | `IN_BATCH` (Đã gom vào lô hàng cứu trợ) | `/track/DON-2026-5W9K2N` |
| `DON-2026-3H6V8B` | 60 kg gạo | `RECEIVED` (Đã tiếp nhận vào kho tổng) | `/track/DON-2026-3H6V8B` |
| `DON-2026-2F7J9K` | 50 kg gạo | `PENDING` (Chờ người hảo tâm chuyển tới kho) | `/track/DON-2026-2F7J9K` |

---

## 🎬 Kịch Bản Thử Nghiệm Chuỗi Vận Hành Thực Tế (Walkthrough)

Để cảm nhận rõ nhất tính liên kết xuyên suốt giữa các Role trong OpenAid, hãy thử trải nghiệm theo chuỗi tương tác sau:

1. **Bước 1 — Duyệt Tổ Chức (Role: Admin)**:
   * Chuyển sang `admin@openaid.demo`, vào `/admin/dashboard`.
   * Tại mục **Tổ Chức Chờ Thẩm Định**, nhấn nút **Duyệt hồ sơ** cho *Green Hope Youth Network*.
2. **Bước 2 — Cam Kết Quyên Góp Hiện Vật (Role: Donor)**:
   * Chuyển sang `user@openaid.demo`, vào `/events` và chọn chiến dịch *Cứu Trợ Lũ Lụt Hòa Vang*.
   * Nhấn **Quyên Góp Hiện Vật**, chọn nhu cầu *Áo Phao*, cam kết *10 Cái*, chọn hình thức gửi *Gửi Bưu Cục*.
   * Nhận được **Mã Vận Đơn** (VD: `DON-2026-XXXXXX`). Vào `/my/donations` để kiểm tra.
3. **Bước 3 — Tiếp Nhận Vào Kho Cứu Trợ (Role: Organizer)**:
   * Chuyển sang `organizer@openaid.demo`, vào `/organizer/donations`.
   * Nhấn **Xác nhận đã nhận hàng**. Vào `/organizer/inventory` kiểm tra: Số lượng áo phao đã được cộng vào **Khả Dụng (Available)** và phương trình kho bảo toàn tuyệt đối.
4. **Bước 4 — Ứng Tuyển & Phê Duyệt Tình Nguyện Viên (Role: Volunteer & Organizer)**:
   * Chuyển sang `user@openaid.demo`, vào `/volunteer/apply/evt-1`, chọn vai trò *Hỗ trợ vận chuyển & điều phối*, điền số khẩn cấp và cam kết.
   * Chuyển sang `organizer@openaid.demo`, vào `/organizer/volunteers` và nhấn **Phê Duyệt**.
5. **Bước 5 — Đóng Gói Lô Hàng & Lập Chuyến Xe (Role: Organizer)**:
   * Vào `/organizer/batches`, nhấn **Tạo Lô Mới**, chọn các hiện vật đã nhận, hoàn tất gom lô và chuyển sang **Sẵn Sàng (READY)**.
   * Vào `/organizer/trips`, nhấn **Lên Lịch Chuyến Mới**: Chọn lô hàng vừa tạo, bổ nhiệm `user@openaid.demo` làm **Trưởng đoàn**, thêm các điểm trao quà tại xã Hòa Phong.
6. **Bước 6 — Nhận Lệnh Điều Động & Điểm Danh (Role: Volunteer)**:
   * Chuyển sang `user@openaid.demo`, vào `/my/activities`.
   * Quan sát card hoạt động: Lập tức xuất hiện mục **Lệnh Điều Động Chuyến Xe** hiển thị vai trò *Trưởng đoàn điều phối 👑*, ngày đi và số điểm trao quà.
   * Nhấn nút **Điểm Danh** hoặc mở **Mã QR** để ghi nhận thời gian có mặt thực địa vào nhật ký.
7. **Bước 7 — Xe Lên Đường & Trao Quà Tại Điểm (Role: Organizer / Leader)**:
   * Tại `/organizer/trips`, chuyển trạng thái xe: *Chuẩn bị xuất phát → Đang trên đường*.
   * Tại điểm phát, nhấn **Bàn giao & Ghi nhận ảnh**: Nhập số lượng phát thực tế, ảnh chứng thực và xác nhận bảo mật.
   * Hoàn thành chuyến xe: Banner đề xuất xuất hiện dẫn thẳng đến `/organizer/batches` để **Đối soát Lô hàng**.
8. **Bước 8 — Duyệt Minh Bạch & Tra Cứu Công Khai (Role: Organizer & Khách)**:
   * Vào `/organizer/transparency`, duyệt ảnh bằng chứng sang trạng thái **Công khai**.
   * Chuyển sang **Khách vãng lai**, vào `/track` và gõ Mã Vận Đơn ở Bước 2. Toàn bộ hành trình từ lúc đóng góp đến bức ảnh bà con nhận quà tại thôn bản hiển thị rõ ràng, xác thực 100%.

---

## 📁 Cấu Trúc Thư Mục Dự Án

```text
OpenAid/
├── public/                      # Static assets & icons
├── src/
│   ├── app/                     # Next.js App Router (Chỉ định tuyến & export Views)
│   ├── view/                    # Triển khai giao diện, UX và state của từng trang
│   │   ├── (auth)/              # Màn hình đăng nhập, đăng ký
│   │   ├── about/               # Trang giới thiệu
│   │   ├── admin/               # Quản trị viên (Dashboard, Users, Orgs, Events)
│   │   ├── donate/              # Form cam kết đóng góp hiện vật
│   │   ├── events/              # Khám phá và chi tiết chiến dịch
│   │   ├── my/                  # Hoạt động cá nhân (/my/activities, /my/donations)
│   │   ├── organizer/           # Ban tổ chức (Dashboard, Inventory, Batches, Trips...)
│   │   ├── profile/             # Hồ sơ tài khoản
│   │   ├── track/               # Tra cứu hành trình hiện vật theo Tracking ID
│   │   └── volunteer/           # Form đăng ký tình nguyện viên
│   ├── components/
│   │   ├── auth/                # RoleGuard, bảo vệ tuyến theo quyền
│   │   ├── layout/              # AppShell (1440px), RoleSwitcherBar, Navbar, Footer
│   │   └── ui/                  # Button, Badge, Modal, ToastProvider, ProgressBar...
│   ├── services/                # Reactive Mock Services (Storage, Trip, Batch, Donation...)
│   ├── mocks/                   # Seed Data khởi tạo mẫu (Users, Events, Inventory...)
│   ├── hooks/                   # useAuth, useTranslation
│   ├── types/                   # Định nghĩa TypeScript Models & Interfaces
│   ├── styles/                  # globals.css (Tailwind 4) & Component CSS modules
│   └── utils/                   # ID generators, date formatters, inventory invariant checks
├── next.config.ts               # Cấu hình Next.js và API rewrite
├── tsconfig.json                # Cấu hình TypeScript 5 & path alias @/*
├── package.json                 # Khai báo dependency chính
└── README.md                    # Tài liệu hướng dẫn dự án OpenAid
```

---

## 🛡️ Cam Kết Chất Lượng Mã Nguồn

* **Chuẩn hóa Giao diện**: Mọi view được đồng bộ cấu trúc khoảng đệm (`pb-12 / pb-16`), khung bao chuẩn `max-w-[1440px]`, màu nhận diện thương hiệu chủ đạo Forest Green (`#1F4D36`) và Amber (`#F28C1B`).
* **Đầy đủ liên kết**: Không có nút bấm "chết" hay thiếu phản hồi; các thao tác quan trọng đều có modal xác nhận, kiểm tra dữ liệu trước khi gửi và thông báo Toast kịp thời.
* **Biên dịch Production sạch**: Dự án đạt kết quả build thành công 24/24 routes không phát sinh lỗi kiểu dữ liệu TypeScript hay đụng độ gói.

---
*Dự án OpenAid — Vì một cộng đồng thiện nguyện minh bạch, trách nhiệm và gắn kết.*
