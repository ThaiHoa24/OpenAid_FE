# OpenAid Frontend — Nền Tảng Điều Phối Cứu Trợ Hiện Vật & Tình Nguyện Minh Bạch

OpenAid là nền tảng quản trị và điều phối chuỗi cung ứng cứu trợ hiện vật kết hợp vận hành đội ngũ tình nguyện viên thực địa. Hệ thống giải quyết bài toán cốt lõi về **tính minh bạch và liên kết khép kín** trong hoạt động từ thiện: từ lúc phát động chiến dịch, nhà hảo tâm cam kết gửi hiện vật, tiếp nhận nhập kho, đóng gói lô hàng, điều phối chuyến xe, phân công đội ngũ tình nguyện viên đến khi bàn giao tận tay đồng bào và tra cứu theo dõi bằng **Mã Vận Đơn (Tracking ID)** độc bản.

Phiên bản hiện tại là **Frontend Production-Ready** xây dựng trên **Next.js 16.4.3 (App Router)**, tích hợp trực tiếp với **OpenAid Backend API (NestJS + Prisma + PostgreSQL)** thông qua hệ thống RESTful Services (`Axios` client + JWT Bearer Authentication).

> **Đề tài:** Đồ án Tốt nghiệp Capstone 1 (CMU-SE 450) – Viện Đào tạo Quốc tế, Đại học Duy Tân
>
> **Nhóm:** C1SE.102 | **GVHD:** ThS. Võ Đình Hiệu

---

## 🚀 Công Nghệ Sử Dụng

| Thành phần | Công nghệ & Phiên bản | Ghi chú |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.4.3 (App Router) | Webpack bundler, kiến trúc tách biệt route shell `src/app/` và giao diện `src/view/` |
| **Giao diện & Logic** | React 19.3.0, TypeScript 5 | Client Components tối ưu hóa tính tương tác cao, kiểm tra kiểu nghiêm ngặt (`strict`) |
| **Kết nối API & Bảo mật** | Axios 1.20 (`axiosClient`), JWT Bearer | Tự động đính kèm Access Token, bóc tách response envelope chuẩn từ Backend (`res.data.data`), xử lý lỗi 401/403 tập trung |
| **Hệ thống Styling** | Tailwind CSS 4 | Bảng màu nhận diện Forest Green (`#1F4D36`) & Amber (`#F28C1B`), container chuẩn 1440px, responsive toàn diện |
| **Hệ thống Icon** | Lucide React | Bộ biểu tượng vector nhất quán, ngữ nghĩa cao |
| **Đa ngôn ngữ (i18n)** | `LanguageProvider` (`vi` / `en`) | Hỗ trợ chuyển đổi ngôn ngữ Tiếng Việt & Tiếng Anh tức thì |
| **Kiểm toán & Cân đối**| Utility Functions (`verifyInventoryEquation`) | Xác minh phương trình bảo toàn kho vật tư và đối soát lô hàng |

---

## 👥 Kiến Trúc Phân Quyền & Các Vai Trò (RBAC 2 Tầng)

Hệ thống được thiết kế theo mô hình phân quyền 2 tầng đồng bộ chặt chẽ với Backend:

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
  * Duyệt hồ sơ thành lập tổ chức cứu trợ (`PATCH /api/admin/organizations/:id/review` kèm ghi vết `TransparencyLog`).
  * Giám sát dòng nhật ký kiểm toán toàn sàn (`GET /api/transparency/logs`).
  * Xem và quản lý toàn bộ chiến dịch ở mọi trạng thái (`GET /api/admin/events`).
  * Khóa/mở khóa tài khoản người dùng (`PATCH /api/admin/users/:id/active` — có cơ chế bảo vệ chống Admin tự khóa tài khoản của chính mình).

### 2. Ban Tổ Chức Cứu Trợ (System Role: `USER` + Organization Role: `ORGANIZER`)
* **Vai trò**: Các tổ chức từ thiện, đội nhóm thiện nguyện được phê duyệt tạo chiến dịch và điều phối hiện vật thực địa.
* **Nguyên tắc sở hữu & Cách ly dữ liệu (Organization-Scoped Authorization)**:
  * Mỗi tài khoản Organizer chỉ sở hữu và điều phối đúng các tài nguyên (Chiến dịch, Hàng cứu trợ, Kho bãi, Lô hàng, Chuyến xe, Tình nguyện viên) thuộc về **Tổ chức của mình**.
  * Bảo vệ kép ở cả tầng UI (`RoleGuard`, kiểm tra `activeOrganization`) và tầng Backend (`OrganizationAccessService`).
* **Khu vực làm việc**: `/organizer/*` (`/organizer/dashboard`, `/organizer/organization`, `/organizer/events`, `/organizer/donations`, `/organizer/inventory`, `/organizer/batches`, `/organizer/trips`, `/organizer/volunteers`, `/organizer/transparency`).
* **Thao tác chính**:
  * **Trung tâm Điều hành (Operations Dashboard)**: Thống kê số liệu thực tế từ `/api/dashboard/events/:eventId`, giám sát lô hàng sẵn sàng gom xe, chuyến xe đang chạy trên đường.
  * **Quản lý Hồ sơ Tổ chức (`/organizer/organization`)**: Cập nhật thông tin liên hệ, mô tả và quản lý danh sách thành viên của tổ chức.
  * **Tiếp nhận quyên góp**: Xác nhận hàng về kho (`RECEIVED` — tự động cộng kho Khả dụng) hoặc Từ chối đóng góp không phù hợp (`REJECTED` kèm `rejectionReason`).
  * **Quản trị kho**: Tra cứu tồn kho theo tổ chức và sự kiện (`GET /api/inventory/organization/:orgId?eventId=...`), đối soát phương trình bảo toàn vật tư (`Received = Available + Reserved + Distributed + LostWrittenOff`).
  * **Đóng gói lô hàng (Batching)**: Gom các hiện vật đã nhận cùng loại vào lô (`POST /api/batches`), chuyển sang trạng thái `READY` (`PATCH /api/batches/:id/status`), và đối soát sau chuyến đi (`POST /api/batches/:id/reconcile`).
  * **Điều phối chuyến xe (Trip Dispatch)**: Lập chuyến xe mới (`POST /api/trips`), liên kết các lô hàng `READY`, bổ nhiệm Trưởng đoàn xe (`LEADER`), phân công tình nguyện viên, lập danh sách điểm cứu trợ.
  * **Thực địa & Minh bạch**: Cập nhật tiến độ điểm phát (`PATCH /api/distribution/points/:id/status`), ghi nhận số lượng trao tặng theo `tripBatchId` (`POST /api/distribution/records`), tải ảnh bằng chứng bàn giao (`POST /api/evidence`), thẩm định ảnh công khai (`PATCH /api/evidence/:id/review`) và tra cứu dòng thời gian minh bạch sự kiện (`GET /api/transparency/timeline`).

### 3. Người Dùng — Nhà Hảo Tâm (System Role: `USER` - Persona: Donor)
* **Khu vực làm việc**: `/donate/[eventId]`, `/my/donations`, `/track/[trackingId]`.
* **Thao tác chính**:
  * Chọn chiến dịch và cam kết quyên góp hiện vật theo danh mục nhu cầu thực tế (`GET /api/events/:id/donation-needs`, `POST /api/donations`), hỗ trợ đính kèm ảnh chụp kiện hàng (`POST /api/uploads`).
  * Nhận **Mã Vận Đơn (Tracking ID)** độc bản (`TRK-...`) kèm hướng dẫn địa chỉ kho tiếp nhận và hình thức gửi.
  * Theo dõi tiến độ hiện vật cá nhân: *Chờ nhập kho (`PENDING`) → Đã tiếp nhận (`RECEIVED`) → Đóng lô (`IN_BATCH`) → Đã bàn giao (`DISTRIBUTED`)*.
  * Chủ động **Hủy cam kết** khi còn ở trạng thái `PENDING` (`POST /api/donations/:id/cancel`).

### 4. Người Dùng — Tình Nguyện Viên (System Role: `USER` - Persona: Volunteer)
* **Khu vực làm việc**: `/volunteer/apply/[eventId]`, `/my/activities`.
* **Thao tác chính**:
  * Nộp đơn ứng tuyển vị trí thực địa (`POST /api/volunteers/apply`) kèm thông tin kỹ năng, phương tiện, liên hệ khẩn cấp và cam kết an toàn (`notes`).
  * Xem tiến trình xét duyệt hồ sơ (`GET /api/volunteers/my`), nhận thông tin điều phối chuyến xe và điểm danh Check-in / Check-out ca trực thực địa.

---

## 🔄 Chuỗi Nghiệp Vụ Khép Kín & Phương Trình Bảo Toàn

### Phương trình Cân đối Bảo toàn Kho (Inventory Invariant):
$$\text{Received} = \text{Available} + \text{Reserved} + \text{Distributed} + \text{LostWrittenOff}$$

### Phương trình Đối soát Lô hàng (Batch Reconciliation):
$$\text{TotalQuantity} = \text{DistributedQuantity} + \text{ReturnedQuantity} + \text{LostQuantity}$$

---

## 🗺️ Bản Đồ Điều Hướng & 28 Tuyến Giao Diện (Routing Map)

Tất cả các route trong `src/app/` đều tuân thủ kiến trúc chuẩn: khai báo route shell và import component tương ứng từ `src/view/`.

### 1. Trang Công Khai & Xác Thực (10 routes)
| Đường dẫn | View Tương Ứng | Chức năng chính |
| :--- | :--- | :--- |
| `/` | `src/view/page.tsx` | Trang chủ: Giới thiệu, chiến dịch tiêu biểu, quy trình minh bạch |
| `/about` | `src/view/about/page.tsx` | Giới thiệu sứ mệnh nền tảng OpenAid |
| `/events` | `src/view/events/page.tsx` | Khám phá chiến dịch cứu trợ, tìm kiếm và lọc danh mục |
| `/events/[id]` | `src/view/events/[id]/page.tsx` | Chi tiết chiến dịch: Tiến độ hiện vật, chỉ tiêu TNV, điều phối viên |
| `/track` | `src/view/track/page.tsx` | Cổng tra cứu Mã Vận Đơn tập trung |
| `/track/[trackingId]` | `src/view/track/[trackingId]/page.tsx` | Hành trình chi tiết công khai: Lịch sử quyên góp, lô hàng, chuyến xe, điểm phát và ảnh thực địa đã duyệt |
| `/login` | `src/view/(auth)/login/page.tsx` | Đăng nhập tài khoản qua JWT hoặc chọn đăng nhập demo nhanh |
| `/register` | `src/view/(auth)/register/page.tsx` | Đăng ký tài khoản kèm xác thực mã OTP qua email & đăng ký tổ chức |
| `/forgot-password` | `src/view/(auth)/forgot-password/page.tsx` | Khôi phục mật khẩu qua mã xác thực OTP gửi về email |
| `/profile` | `src/view/profile/page.tsx` | Xem/cập nhật hồ sơ cá nhân (`fullName`, `phone`, `avatarUrl`), tải ảnh đại diện và đăng ký thành lập tổ chức mới |

### 2. Khu Vực Người Dùng Cá Nhân — Volunteer & Donor (4 routes)
| Đường dẫn | View Tương Ứng | Chức năng chính |
| :--- | :--- | :--- |
| `/donate/[eventId]` | `src/view/donate/[eventId]/page.tsx` | Đóng góp hiện vật: Chọn nhu cầu, nhập số lượng, tải ảnh kiện hàng, nhận Tracking ID |
| `/volunteer/apply/[eventId]` | `src/view/volunteer/apply/[eventId]/page.tsx` | Ứng tuyển TNV: Chọn vai trò, tiến độ hạn ngạch, kỹ năng, số liên hệ khẩn cấp, cam kết an toàn |
| `/my/activities` | `src/view/my/activities/page.tsx` | Quản lý đơn tình nguyện cá nhân, xem lịch trình chuyến xe và trạng thái điểm danh |
| `/my/donations` | `src/view/my/donations/page.tsx` | Sổ theo dõi đóng góp cá nhân: Lọc trạng thái, xem mã Tracking ID, hủy cam kết `PENDING` |

### 3. Khu Vực Ban Tổ Chức Cứu Trợ — Organizer (10 routes)
| Đường dẫn | View Tương Ứng | Chức năng chính |
| :--- | :--- | :--- |
| `/organizer/dashboard` | `src/view/organizer/dashboard/page.tsx` | Bảng điều hành tổng quan: Live Batches, Active Trips, Action Center, tiến độ kho vật tư |
| `/organizer/organization` | `src/view/organizer/organization/page.tsx` | Quản lý thông tin hồ sơ tổ chức và danh sách thành viên điều phối |
| `/organizer/events` | `src/view/organizer/events/page.tsx` | Quản lý danh sách chiến dịch của tổ chức: Tạo mới, cập nhật nhu cầu hiện vật & vị trí TNV |
| `/organizer/events/[id]` | `src/view/organizer/events/[id]/page.tsx` | Bảng điều khiển riêng từng chiến dịch, quản lý trạng thái, duyệt nhanh đơn TNV và đóng góp |
| `/organizer/donations` | `src/view/organizer/donations/page.tsx` | Tiếp nhận hiện vật: Xác nhận nhận hàng vào kho (`RECEIVED`) hoặc từ chối (`REJECTED`) |
| `/organizer/inventory` | `src/view/organizer/inventory/page.tsx` | Kiểm kê kho: Đối chiếu phương trình cân đối bảo toàn kho theo tổ chức và chiến dịch |
| `/organizer/batches` | `src/view/organizer/batches/page.tsx` | Đóng gói lô hàng: Gom hiện vật `RECEIVED`, chuyển trạng thái `READY`, đối soát sau chuyến đi |
| `/organizer/trips` | `src/view/organizer/trips/page.tsx` | Điều phối chuyến xe: Tạo chuyến, phân công Trưởng đoàn & TNV, quản lý lộ trình và ghi nhận bàn giao |
| `/organizer/volunteers` | `src/view/organizer/volunteers/page.tsx` | Quản trị nhân lực: Duyệt/từ chối đơn ứng tuyển, điểm danh Check-in / Check-out |
| `/organizer/transparency` | `src/view/organizer/transparency/page.tsx` | Trung tâm minh bạch: Thẩm định ảnh bằng chứng trao quà và xem dòng thời gian kiểm toán theo sự kiện |

### 4. Khu Vực Quản Trị Hệ Thống — Admin (4 routes)
| Đường dẫn | View Tương Ứng | Chức năng chính |
| :--- | :--- | :--- |
| `/admin/dashboard` | `src/view/admin/dashboard/page.tsx` | Thống kê toàn sàn, hàng đợi duyệt nhanh tổ chức, Live Audit Trail |
| `/admin/organizations` | `src/view/admin/organizations/page.tsx` | Thẩm định hồ sơ tổ chức thiện nguyện (`PENDING` → `APPROVED` / `REJECTED`) |
| `/admin/users` | `src/view/admin/users/page.tsx` | Danh bạ người dùng toàn hệ thống, khóa hoặc mở khóa tài khoản |
| `/admin/events` | `src/view/admin/events/page.tsx` | Giám sát và kiểm duyệt toàn bộ chiến dịch ở mọi trạng thái (`GET /api/admin/events`) |

---

## 💻 Cài Đặt & Khởi Chạy Ứng Dụng

### 1. Yêu Cầu Môi Trường
* **Node.js**: Phiên bản `20.9.0` trở lên (khuyến nghị Node 20 LTS hoặc 22 LTS).
* **Backend Server**: `OpenAid_BE` đang chạy tại `http://localhost:3001` (mặc định).

### 2. Cấu Hình Biến Môi Trường (`.env.local`)
Tạo hoặc kiểm tra file `.env.local` tại thư mục gốc `OpenAid_FE/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3. Cài Đặt & Chạy Chế Độ Phát Triển
```bash
# 1. Cài đặt các gói phụ thuộc
npm ci

# 2. Khởi chạy máy chủ phát triển
npm run dev
```

Mở trình duyệt tại: **[http://localhost:3000](http://localhost:3000)**.

### 4. Build & Chạy Bản Production
```bash
# Biên dịch Webpack và kiểm tra TypeScript toàn bộ 28 routes
npm run build

# Khởi chạy máy chủ Production
npm run start
```

---

## 📁 Cấu Trúc Thư Mục Dự Án

```text
OpenAid_FE/
├── public/                      # Static assets & icons
├── src/
│   ├── app/                     # Next.js App Router (28 route shells re-export từ src/view/)
│   ├── view/                    # Triển khai giao diện, UX và state của từng trang
│   │   ├── (auth)/              # Đăng nhập (/login), Đăng ký OTP (/register), Quên mật khẩu (/forgot-password)
│   │   ├── about/               # Trang giới thiệu (/about)
│   │   ├── admin/               # Quản trị viên (Dashboard, Users, Organizations, Events)
│   │   ├── donate/[eventId]/    # Trang cam kết đóng góp hiện vật & nhận Tracking ID
│   │   ├── events/              # Khám phá (/events) và chi tiết chiến dịch (/events/[id])
│   │   ├── my/                  # Hoạt động cá nhân (/my/activities, /my/donations)
│   │   ├── organizer/           # Ban tổ chức (Dashboard, Organization, Events, Donations, Inventory, Batches, Trips, Volunteers, Transparency)
│   │   ├── profile/             # Hồ sơ tài khoản & đăng ký thành lập tổ chức mới
│   │   ├── track/               # Cổng tra cứu (/track) & chi tiết hành trình (/track/[trackingId])
│   │   └── volunteer/apply/[eventId]/ # Trang nộp đơn đăng ký tình nguyện viên
│   ├── components/
│   │   ├── auth/                # RoleGuard bảo vệ tuyến theo phân quyền
│   │   ├── layout/              # AppShell, RoleSwitcherBar, Navbar, Footer
│   │   └── ui/                  # Button, Badge, StatusBadge, Modal, ToastProvider...
│   ├── lib/
│   │   ├── api/                 # axiosClient (interceptors, envelope unwrap) & tokenStorage (JWT)
│   │   └── constants.ts         # Cấu hình hằng số ứng dụng
│   ├── services/                # Tầng tích hợp REST API với OpenAid_BE:
│   │   ├── authService.ts       # Xác thực, OTP, phiên đăng nhập, hồ sơ & tạo tổ chức
│   │   ├── eventService.ts      # Chiến dịch, danh mục ItemType/Unit, nhu cầu quyên góp
│   │   ├── donationService.ts   # Quyên góp hiện vật, tiếp nhận/từ chối kho, hủy cam kết
│   │   ├── volunteerService.ts  # Ứng tuyển TNV, xét duyệt, Check-in/Check-out
│   │   ├── inventoryService.ts  # Tồn kho theo tổ chức và sự kiện
│   │   ├── batchService.ts      # Gom lô hàng, chuyển trạng thái READY, đối soát lô hàng
│   │   ├── tripService.ts       # Chuyến xe cứu trợ, lộ trình điểm phát & ghi nhận phân phối
│   │   ├── transparencyService.ts # Bằng chứng thực địa, tra cứu Tracking ID, timeline & audit logs
│   │   ├── organizationService.ts # Thông tin tổ chức và quản lý thành viên
│   │   ├── dashboardService.ts  # Thống kê số liệu sự kiện
│   │   ├── adminService.ts      # Quản trị người dùng, tổ chức, toàn bộ sự kiện & thống kê sàn
│   │   └── uploadService.ts     # Tải tệp hình ảnh lên máy chủ (/api/uploads)
│   ├── hooks/                   # useAuth, useTranslation
│   ├── i18n/                    # Từ điển đa ngôn ngữ (vi.ts, en.ts)
│   ├── providers/               # LanguageProvider
│   ├── types/                   # Định nghĩa TypeScript Models & Interfaces đồng bộ Prisma schema
│   ├── styles/                  # globals.css (Tailwind CSS 4)
│   └── utils/                   # Date formatters, kiểm tra phương trình bảo toàn kho
├── next.config.ts               # Cấu hình Next.js
├── tsconfig.json                # Cấu hình TypeScript 5 & path alias @/*
├── package.json                 # Khai báo dependencies & scripts
└── README.md                    # Tài liệu hướng dẫn dự án OpenAid Frontend
```

---
*Dự án OpenAid — Vì một cộng đồng thiện nguyện minh bạch, trách nhiệm và gắn kết.*
