# OpenAid Frontend — Nền Tảng Điều Phối Cứu Trợ Hiện Vật & Tình Nguyện Minh Bạch

OpenAid là nền tảng quản trị và điều phối chuỗi cung ứng cứu trợ hiện vật kết hợp vận hành đội ngũ tình nguyện viên thực địa. Hệ thống giải quyết bài toán cốt lõi về **tính minh bạch và liên kết khép kín** trong hoạt động từ thiện: từ lúc phát động chiến dịch, nhà hảo tâm cam kết gửi hiện vật, tiếp nhận nhập kho, đóng gói lô hàng, điều phối chuyến xe, phân công đội ngũ tình nguyện viên đến khi bàn giao tận tay đồng bào và tra cứu theo dõi bằng **Mã Vận Đơn (Tracking ID)** độc bản.

Ứng dụng Frontend được xây dựng trên **Next.js 16.4.3 (App Router)**, **React 19.3.0**, **TypeScript 5** và **Tailwind CSS 4**, tích hợp trực tiếp với **OpenAid Backend API (`OpenAid_BE`)** thông qua `Axios` client + JWT Bearer Authentication.

> **Đề tài:** Đồ án Tốt nghiệp Capstone 1 (CMU-SE 450) – Viện Đào tạo Quốc tế, Đại học Duy Tân
>
> **Nhóm:** C1SE.102 | **GVHD:** ThS. Võ Đình Hiệu

---

## Công Nghệ Sử Dụng

| Thành phần | Công nghệ & Phiên bản | Ghi chú |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.4.3 (App Router) | Webpack bundler (`next build --webpack`), tách biệt route shell `src/app/` và UI `src/view/` |
| **Giao diện & Logic** | React 19.3.0, TypeScript 5 | Client Components tương tác cao, kiểm tra kiểu `strict` |
| **Kết nối API & Bảo mật** | Axios 1.20 (`axiosClient`), JWT Bearer | Tự động đính kèm Access Token, unwrap response envelope (`res.data.data`), tự xóa token khi gặp `401` |
| **Styling & Hiệu ứng** | Tailwind CSS 4, Lenis (`lenis`) | Bảng màu Forest Green (`#1F4D36`) & Amber (`#F28C1B`), smooth scrolling |
| **Hệ thống Icon** | Lucide React (`lucide-react`) | Bộ biểu tượng vector nhất quán |
| **Đa ngôn ngữ (i18n)** | `LanguageProvider` (`vi` / `en`) | Hỗ trợ chuyển đổi Tiếng Việt & Tiếng Anh |
| **Kiểm toán & Cân đối** | `verifyInventoryEquation` (`src/utils/`) | Xác minh phương trình bảo toàn kho vật tư (`NFR05`) trên giao diện |

---

## Kiến Trúc Phân Quyền & Các Vai Trò (RBAC 2 Tầng)

Hệ thống đồng bộ mô hình phân quyền 2 tầng với Backend:

```text
TẦNG HỆ THỐNG (SystemRole)
├── ADMIN : Quản trị viên nền tảng (/admin/*)
└── USER  : Người dùng thông thường
            ├── TẦNG TỔ CHỨC (OrganizationRole)
            │   ├── ORGANIZER : Ban tổ chức cứu trợ (/organizer/*)
            │   └── MEMBER    : Thành viên tổ chức
            └── PERSONA CÁ NHÂN (User)
                ├── Nhà hảo tâm (/donate/*, /my/donations)
                └── Tình nguyện viên (/volunteer/apply/*, /my/activities)
```

* **Quản Trị Viên (`ADMIN`)**: Duyệt hồ sơ thành lập tổ chức (`APPROVED` / `REJECTED` / `SUSPENDED`), quản lý khóa/mở khóa tài khoản user, kiểm duyệt và xuất báo cáo toàn bộ chiến dịch, giám sát audit logs.
* **Ban Tổ Chức (`ORGANIZER`)**: Quản lý hồ sơ tổ chức & thành viên; tạo/phát động/đóng chiến dịch; tiếp nhận hiện vật (`RECEIVED` / `REJECTED`); theo dõi sổ cái kho bãi (`NFR05`); đóng gói lô hàng (`DRAFT` → `READY` → đối soát `reconcile`); lập & điều phối chuyến xe (`SCHEDULED` → `PREPARING` → `IN_TRANSIT` → `COMPLETED`); duyệt đơn TNV & thẩm định ảnh bằng chứng công khai.
* **Người Dùng (`USER`)**: Khám phá chiến dịch, ứng tuyển TNV (tự động nhận diện trạng thái đơn đã nộp), cam kết quyên góp hiện vật kèm ảnh kiện hàng, nhận Tracking ID, hủy cam kết `PENDING`, xem lịch trình chuyến xe được phân công và Check-in thực địa.
* **Tài khoản demo (seed)**: Có thể tự đăng nhập tại `/login` với các tài khoản mẫu (`admin@openaid.demo`, `organizer@openaid.demo`, `user@openaid.demo`, mật khẩu `123456` theo `OpenAid_BE/prisma/seed.mjs`) hoặc đăng ký tài khoản mới tại `/register`.

---

## Bản Đồ Điều Hướng (29 Routes)

Tất cả các route trong `src/app/` là route shell re-export từ `src/view/`.

### 1. Trang Công Khai & Xác Thực (11 routes)
| Đường dẫn | View Tương Ứng | Chức năng chính |
| :--- | :--- | :--- |
| `/` | `src/view/page.tsx` | Trang chủ: Hero slideshow, tính năng, chiến dịch nổi bật, quy trình |
| `/about` | `src/view/about/page.tsx` | Giới thiệu sứ mệnh nền tảng OpenAid |
| `/how-it-works` | `src/view/how-it-works/page.tsx` | Quy trình vận hành & minh bạch chuỗi cung ứng cứu trợ |
| `/events` | `src/view/events/page.tsx` | Khám phá, tìm kiếm và lọc chiến dịch cứu trợ |
| `/events/[id]` | `src/view/events/[id]/page.tsx` | Chi tiết chiến dịch: Tiến độ hiện vật, chỉ tiêu TNV, chuyến xe, minh bạch |
| `/track` | `src/view/track/page.tsx` | Cổng tra cứu Mã Vận Đơn tập trung |
| `/track/[trackingId]` | `src/view/track/[trackingId]/page.tsx` | Hành trình chi tiết công khai: Quyên góp, lô hàng, chuyến xe, điểm phát, ảnh thực địa |
| `/login` | `src/view/(auth)/login/page.tsx` | Đăng nhập JWT & đăng nhập demo 1-Click |
| `/register` | `src/view/(auth)/register/page.tsx` | Đăng ký tài khoản kèm OTP email & đăng ký tổ chức |
| `/forgot-password` | `src/view/(auth)/forgot-password/page.tsx` | Khôi phục mật khẩu qua OTP email |
| `/profile` | `src/view/profile/page.tsx` | Cập nhật hồ sơ cá nhân, tải ảnh đại diện & đăng ký tổ chức mới |

### 2. Khu Vực Người Dùng Cá Nhân (4 routes)
| Đường dẫn | View Tương Ứng | Chức năng chính |
| :--- | :--- | :--- |
| `/donate/[eventId]` | `src/view/donate/[eventId]/page.tsx` | Cam kết quyên góp hiện vật, tải ảnh kiện hàng, nhận Tracking ID |
| `/volunteer/apply/[eventId]` | `src/view/volunteer/apply/[eventId]/page.tsx` | Nộp đơn ứng tuyển TNV chi tiết |
| `/my/activities` | `src/view/my/activities/page.tsx` | Theo dõi đơn TNV, chuyến xe được phân công, mã QR & Check-in |
| `/my/donations` | `src/view/my/donations/page.tsx` | Theo dõi lịch sử quyên góp, sao chép Tracking ID, hủy đơn `PENDING` |

### 3. Khu Vực Ban Tổ Chức — Organizer (10 routes)
| Đường dẫn | View Tương Ứng | Chức năng chính |
| :--- | :--- | :--- |
| `/organizer/dashboard` | `src/view/organizer/dashboard/page.tsx` | Trung tâm điều hành, Action Center, tiến độ nhu yếu phẩm & xuất báo cáo |
| `/organizer/organization` | `src/view/organizer/organization/page.tsx` | Quản lý hồ sơ tổ chức & danh sách thành viên |
| `/organizer/events` | `src/view/organizer/events/page.tsx` | Tạo mới & quản lý danh sách chiến dịch của tổ chức |
| `/organizer/events/[id]` | `src/view/organizer/events/[id]/page.tsx` | Quản lý chi tiết chiến dịch: duyệt TNV, xem quyên góp, chỉnh sửa thông tin |
| `/organizer/donations` | `src/view/organizer/donations/page.tsx` | Tiếp nhận hiện vật vào kho (`RECEIVED`) hoặc từ chối (`REJECTED`) |
| `/organizer/inventory` | `src/view/organizer/inventory/page.tsx` | Sổ cái kho bãi & kiểm tra phương trình bảo toàn `NFR05` |
| `/organizer/batches` | `src/view/organizer/batches/page.tsx` | Đóng gói lô hàng (`Batch`), chuyển `READY` và đối soát sau chuyến đi |
| `/organizer/trips` | `src/view/organizer/trips/page.tsx` | Lập chuyến xe, phân công Trưởng đoàn & TNV, ghi nhận bàn giao & tải ảnh |
| `/organizer/volunteers` | `src/view/organizer/volunteers/page.tsx` | Duyệt/từ chối đơn ứng tuyển TNV & theo dõi điểm danh |
| `/organizer/transparency` | `src/view/organizer/transparency/page.tsx` | Kiểm duyệt ảnh bằng chứng công khai & xem nhật ký minh bạch sự kiện |

### 4. Khu Vực Quản Trị Hệ Thống — Admin (4 routes)
| Đường dẫn | View Tương Ứng | Chức năng chính |
| :--- | :--- | :--- |
| `/admin/dashboard` | `src/view/admin/dashboard/page.tsx` | Thống kê toàn sàn, duyệt nhanh tổ chức & Live Audit Trail |
| `/admin/organizations` | `src/view/admin/organizations/page.tsx` | Thẩm định hồ sơ tổ chức (`PENDING` → `APPROVED` / `REJECTED` / `SUSPENDED`) |
| `/admin/users` | `src/view/admin/users/page.tsx` | Danh sách người dùng, tổ chức trực thuộc, khóa/mở khóa tài khoản |
| `/admin/events` | `src/view/admin/events/page.tsx` | Giám sát, kiểm duyệt & xuất báo cáo toàn bộ chiến dịch |

---

## Cài Đặt & Khởi Chạy Ứng Dụng

### 1. Yêu Cầu Môi Trường
* **Node.js**: `20.9.0` trở lên (khuyến nghị Node 22 LTS).
* **Backend Server**: `OpenAid_BE` đang chạy tại `http://localhost:3001`.

### 2. Cấu Hình Biến Môi Trường (`.env.local`)
Tạo file `.env.local` tại thư mục gốc `OpenAid_FE/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3. Cài Đặt & Chạy

```bash
# Cài đặt dependencies
npm ci

# Chạy chế độ phát triển
npm run dev
```

Mở trình duyệt tại **[http://localhost:3000](http://localhost:3000)**.

### 4. Build & Kiểm Tra

```bash
# Kiểm tra TypeScript
npx tsc --noEmit

# Kiểm tra lint
npm run lint

# Build bản Production (Webpack)
npm run build

# Chạy bản Production
npm run start
```

---

## Cấu Trúc Thư Mục

```text
OpenAid_FE/
├── public/                        # Static assets & SVG icons
├── src/
│   ├── app/                       # Next.js App Router (29 route shells re-export từ src/view/)
│   ├── view/                      # Giao diện, state & logic của từng trang
│   │   ├── (auth)/                # /login, /register, /forgot-password
│   │   ├── about/                 # /about
│   │   ├── admin/                 # /admin/*
│   │   ├── donate/[eventId]/      # /donate/[eventId]
│   │   ├── events/                # /events, /events/[id]
│   │   ├── how-it-works/          # /how-it-works
│   │   ├── my/                    # /my/activities, /my/donations
│   │   ├── organizer/             # /organizer/*
│   │   ├── profile/               # /profile
│   │   ├── track/                 # /track, /track/[trackingId]
│   │   └── volunteer/apply/[eventId]/ # /volunteer/apply/[eventId]
│   ├── components/
│   │   ├── animation/             # SmoothScroll (Lenis)
│   │   ├── auth/                  # RoleGuard
│   │   ├── layout/                # AppShell
│   │   ├── sections/              # Header, Footer, Hero, FeaturedEvents, StatsBar...
│   │   └── ui/                    # Badge, Button, ConfirmModal, ProgressBar, StatusBadge, ToastProvider
│   ├── constants/                 # Hằng số & style badges
│   ├── hooks/                     # useAuth, useTranslation
│   ├── i18n/                      # Từ điển đa ngôn ngữ (vi.ts, types.ts)
│   ├── lib/
│   │   ├── api/                   # axiosClient, tokenStorage
│   │   └── constants/             # Hằng số khu vực, bộ lọc
│   ├── providers/                 # LanguageProvider
│   ├── services/                  # Tầng gọi REST API (admin, auth, batch, dashboard, donation,
│   │                              # event, inventory, organization, transparency, trip, upload, volunteer)
│   ├── styles/                    # globals.css & CSS Modules
│   ├── types/                     # TypeScript Models & Interfaces
│   └── utils/                     # Formatters, calculatePercentage, verifyInventoryEquation
├── next.config.ts
├── tsconfig.json
├── package.json
└── README.md
```
