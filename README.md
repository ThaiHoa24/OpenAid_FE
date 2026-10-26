# 🤝 OpenAid — Transparent In-Kind Donation & Volunteer Coordination System

> **OpenAid** là hệ thống điều phối cứu trợ hiện vật và quản lý tình nguyện viên minh bạch toàn diện (Capstone Project 1 • CMU-SE 450 • Nhóm C1SE.102 • Đại Học Duy Tân).
> 
> 🚀 **Frontend MVP hoàn chỉnh đã được xây dựng 100%** bằng **Next.js 16 + React 19 + TypeScript + TailwindCSS 4**, tích hợp mock service reactive đầy đủ, lưu trữ `localStorage`, hỗ trợ toàn bộ 10 bước kịch bản demo hội đồng mà không cần backend.

---

## ⚡ Hướng dẫn chạy thử nghiệm & Demo nhanh (Quick Start)

### 1. Khởi chạy ứng dụng
```bash
npm run dev
# Mở trình duyệt tại: http://localhost:3000
```

### 2. Các tài khoản Demo có sẵn (1-Click Switcher trên thanh điều hướng)
- 🛡️ **Admin Hệ thống**: `admin@openaid.demo` (Pass: `123456`) — Toàn quyền kiểm duyệt tổ chức, thành viên, chiến dịch toàn sàn.
- 🏢 **Organizer (Quỹ Đà Nẵng)**: `organizer@openaid.demo` (Pass: `123456`) — Ban Tổ Chức chiến dịch Hòa Vang: duyệt TNV, tiếp nhận hiện vật, kiểm toán kho NFR05, đóng lô hàng, lên chuyến xe và kiểm duyệt ảnh minh chứng.
- 👤 **Người dùng / TNV / Donor**: `user@openaid.demo` (Pass: `123456`) — Đăng ký tình nguyện viên, cam kết hiện vật, nhận mã Tracking ID và điểm danh ca trực.
- 🔄 **Nút "Reset Dữ liệu Demo"**: Luôn xuất hiện trên thanh Topbar màu hổ phách để đưa toàn bộ hệ thống về trạng thái mẫu ban đầu bất cứ lúc nào.

---

## 📑 Mục lục

- [Tổng quan dự án](#-tổng-quan-dự-án)
- [Chuỗi nghiệp vụ chính](#-chuỗi-nghiệp-vụ-chính-end-to-end)
- [Đối tượng người dùng (Actors)](#-đối-tượng-người-dùng-actors)
- [Các module chức năng](#-các-module-chức-năng)
- [Tech Stack](#-tech-stack)
- [Cấu trúc thư mục đề xuất (Frontend)](#-cấu-trúc-thư-mục-đề-xuất-frontend)
- [Hướng dẫn cài đặt & chạy dự án](#-hướng-dẫn-cài-đặt--chạy-dự-án)
- [Scripts có sẵn](#-scripts-có-sẵn)
- [Quy ước đặt tên & coding conventions](#-quy-ước-đặt-tên--coding-conventions)
- [Biến môi trường](#-biến-môi-trường)
- [Các trang cần xây dựng (Frontend Roadmap)](#-các-trang-cần-xây-dựng-frontend-roadmap)
- [API Endpoints dự kiến (để FE kết nối)](#-api-endpoints-dự-kiến-để-fe-kết-nối)
- [Data Flow & State Management](#-data-flow--state-management)
- [Trạng thái (Status) quan trọng](#-trạng-thái-status-quan-trọng)
- [Demo Scenario](#-demo-scenario)
- [Sprint Plan (Frontend Focus)](#-sprint-plan-frontend-focus)
- [Tài liệu tham khảo](#-tài-liệu-tham-khảo)

---

## 🌟 Tổng quan dự án

**OpenAid Version 1.0 (MVP)** tập trung vào 3 nhóm nghiệp vụ cốt lõi:

| # | Nhóm nghiệp vụ | Mô tả ngắn |
|---|----------------|-------------|
| 1 | **Volunteer Management** | Sự kiện, vai trò TNV, đăng ký, duyệt, điểm danh |
| 2 | **Donation & Inventory** | Nhu cầu quyên góp, Tracking ID, Kho hàng, Donation Batch |
| 3 | **Distribution & Transparency** | Chuyến phân phối, xác nhận, bằng chứng, Timeline minh bạch, báo cáo |

### Kiến trúc tổng thể

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│              Next.js 16 + React 19 + TailwindCSS 4          │
│     (Event List, Volunteer Form, Donation Form, Dashboard,  │
│      Organizer Console, Public Tracking, Admin Console)     │
└─────────────────────┬───────────────────────────────────────┘
                      │ REST API (HTTP / JSON)
┌─────────────────────▼───────────────────────────────────────┐
│                  APPLICATION LAYER                          │
│           NestJS (TypeScript) — Modular Monolith            │
│  ┌──────────┬──────────┬────────────┬────────────────────┐  │
│  │ Auth &   │ Event &  │ Donation & │ Trip &             │  │
│  │ User     │ Volunteer│ Inventory  │ Distribution       │  │
│  ├──────────┼──────────┼────────────┼────────────────────┤  │
│  │ Org      │          │ Batch      │ Transparency &     │  │
│  │          │          │            │ Report             │  │
│  ├──────────┴──────────┴────────────┴────────────────────┤  │
│  │                      Admin                            │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────────┘
                      │ Prisma ORM
┌─────────────────────▼───────────────────────────────────────┐
│                      DATA LAYER                             │
│  PostgreSQL (business data)  +  File Storage (evidence)     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔗 Chuỗi nghiệp vụ chính (End-to-End)

```
Event → Volunteer/Donation → Inventory → Donation Batch → Distribution Trip
  → Distribution Confirmation → Evidence → Transparency Timeline → Report
```

> **Tiêu chí demo thành công:** Người xem có thể truy vết từ Event → Volunteer → Donation → Batch → Trip → Distribution → Evidence → Report mà không cần ai giải thích "phần này chưa nối".

---

## 👥 Đối tượng người dùng (Actors)

| Actor | Vai trò | Cần đăng nhập? |
|-------|---------|:-:|
| **Organizer / Organization** | Đăng sự kiện, duyệt TNV, xác nhận quyên góp, quản lý kho/batch/trip, cập nhật bằng chứng, xem Dashboard | ✅ |
| **Volunteer** | Tìm sự kiện, đăng ký vai trò, xem lịch sử hoạt động, điểm danh, tham gia trip | ✅ |
| **Donor** | Xem nhu cầu quyên góp, đăng ký đóng góp hiện vật, nhận Tracking ID, theo dõi timeline | ✅ |
| **Platform Admin** | Quản lý tài khoản, duyệt tổ chức, kiểm duyệt sự kiện | ✅ |
| **Public Visitor** | Tra cứu trạng thái công khai bằng Tracking ID | ❌ |

> **Lưu ý:** Một tài khoản có thể đóng nhiều vai trò (TNV ở sự kiện này, nhà tài trợ ở sự kiện khác). Hệ thống chỉ có 2 system role: `USER` và `ADMIN`. `ORGANIZER` là vai trò cấp tổ chức (qua `OrganizationMember`).

---

## 📦 Các module chức năng

### Module 1: Account, Organization & Admin
- Đăng ký, đăng nhập, quản lý hồ sơ (không có social login)
- Tạo hồ sơ tổ chức; Admin duyệt cho tổ chức hoạt động
- Quản lý cơ bản: users, organizations, events
- Phân quyền: system role (`USER` / `ADMIN`) + organization role (`MEMBER` / `ORGANIZER`)

### Module 2: Event Management & Discovery
- CRUD sự kiện: tên, mô tả, thời gian, địa điểm, liên hệ
- Khai báo nhu cầu TNV (vai trò, số lượng) và nhu cầu hiện vật (loại, số lượng mục tiêu, đơn vị)
- Event Discovery: danh sách, tìm kiếm, lọc theo khu vực/thời gian/loại hỗ trợ
- Trạng thái sự kiện: `Draft → Published → Closed` hoặc `Published → Cancelled`

### Module 3: Volunteer Participation
- Chọn vai trò và gửi đơn đăng ký; Organizer duyệt/từ chối
- My Volunteer Activities: xem các sự kiện đã đăng ký / được duyệt
- Check-in / Check-out bằng QR hoặc nút xác nhận

### Module 4: Donation, Tracking ID & Inventory
- Donor xem Donation Needs, đăng ký hiện vật, nhận Tracking ID duy nhất (VD: `DON-2026-7K3Q9X`)
- Tổ chức xác nhận nhận hàng → cập nhật vào Inventory là `Available`
- Inventory theo đơn vị (kg, thùng, chai, suất...): `Available` / `Reserved` / `Distributed` / `Lost`
- **Công thức bất biến:** `Received = Available + Reserved + Distributed + Lost/Written-off`

### Module 5: Donation Batch
- Organizer nhóm các donation cùng Event, cùng loại hàng, cùng đơn vị thành 1 Batch (VD: `RICE-BATCH-001 = 100 kg`)
- Một Donation chỉ thuộc tối đa 1 Batch (không tách)
- Khi tạo Batch: `Available → Reserved`

### Module 6: Distribution Trip
- Tạo chuyến phân phối cho 1 Event: ngày giờ, điểm xuất phát, điểm đến, TNV đã duyệt, batch, Distribution Points
- Trip Status: `Scheduled → Preparing → In Transit → Completed` hoặc `Cancelled`
- Distribution Point Status: `Pending → Arrived → Distributed` hoặc `Skipped`
- Trip Leader (1 TNV được chỉ định) có quyền cập nhật trạng thái

### Module 7: Distribution Confirmation & Evidence
- Trip Leader/Organizer ghi nhận số lượng phân phối cho mỗi Batch tại mỗi Distribution Point
- Upload ảnh bằng chứng (giới hạn kích thước & định dạng)
- Evidence flow: `Upload → Xác nhận quyền riêng tư → Organizer review → Hiển thị công khai`

### Module 8: Transparency, Dashboard & Report
- **Transparency Log:** thời gian, người thực hiện, trạng thái cũ/mới, bằng chứng
- **Transparency Timeline:** hiển thị dạng timeline theo thời gian
- **Public Tracking:** nhập Tracking ID → xem trạng thái công khai (không cần đăng nhập)
- **Dashboard & Report:** tổng hợp TNV, donations, batches, trips, số liệu Needed/Pledged/Received/Distributed

---

## ⚙️ Tech Stack

### Frontend (Phần bạn sẽ làm)

| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| **Next.js** | 16.4.3 | Framework React — App Router, SSR/SSG, API Routes |
| **React** | 19.3.0 | UI Library |
| **TailwindCSS** | 4.x | CSS Utility-first framework |
| **TypeScript** | 5.x | Type-safe JavaScript |
| **Turbopack** | Tích hợp sẵn | Dev bundler nhanh (thay Webpack trong dev) |

### Backend (Đội BE phát triển riêng)

| Công nghệ | Mục đích |
|-----------|----------|
| NestJS (TypeScript) | REST API, Modular Monolith |
| Prisma | ORM, migrations |
| PostgreSQL | Database |
| JWT | Authentication & Authorization |
| Swagger/OpenAPI | API Documentation |
| Docker / Docker Compose | Deployment |

### Thư viện bổ sung nên cài thêm cho FE

```bash
# UI Components — chọn 1 trong các bộ sau (khuyến nghị shadcn/ui vì nhẹ, customizable)
npx shadcn@latest init

# Icons
npm install lucide-react

# Form handling
npm install react-hook-form @hookform/resolvers zod

# HTTP client (gọi API)
npm install axios
# hoặc dùng fetch() tích hợp sẵn của Next.js

# State management (nếu cần global state)
npm install zustand
# hoặc dùng React Context + useReducer

# Date formatting
npm install date-fns

# QR Code
npm install qrcode react-qr-code html5-qrcode

# File upload preview
npm install react-dropzone

# Toast notifications
npm install sonner
# hoặc react-hot-toast
```

> ⚠️ **Lưu ý:** Đây là Next.js 16 — có thể có breaking changes so với phiên bản cũ hơn.
> Luôn đọc docs tại `node_modules/next/dist/docs/` trước khi sử dụng các API mới.

---

## 📁 Cấu trúc thư mục đề xuất (Frontend)

```
OpenAid/
├── app/                          # 📌 App Router — mỗi folder = 1 route
│   ├── layout.tsx                # Root layout (font, metadata, providers)
│   ├── page.tsx                  # Trang chủ "/" — Landing Page / Event Discovery
│   ├── globals.css               # TailwindCSS global styles
│   ├── favicon.ico
│   │
│   ├── (auth)/                   # 🔐 Route group — Auth pages (không ảnh hưởng URL)
│   │   ├── login/
│   │   │   └── page.tsx          # "/login" — Đăng nhập
│   │   ├── register/
│   │   │   └── page.tsx          # "/register" — Đăng ký
│   │   └── layout.tsx            # Layout chung cho auth pages (centered, minimal)
│   │
│   ├── (main)/                   # 🏠 Route group — Các trang chính (có header/footer)
│   │   ├── layout.tsx            # Layout chung: Header + Sidebar (nếu có) + Footer
│   │   ├── events/
│   │   │   ├── page.tsx          # "/events" — Danh sách sự kiện (Event Discovery)
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # "/events/[id]" — Chi tiết sự kiện
│   │   │       ├── volunteer/
│   │   │       │   └── page.tsx  # "/events/[id]/volunteer" — Đăng ký TNV
│   │   │       └── donate/
│   │   │           └── page.tsx  # "/events/[id]/donate" — Đăng ký quyên góp
│   │   │
│   │   ├── my-activities/
│   │   │   └── page.tsx          # "/my-activities" — Lịch sử TNV của tôi
│   │   │
│   │   ├── my-donations/
│   │   │   └── page.tsx          # "/my-donations" — Danh sách quyên góp của tôi
│   │   │
│   │   ├── profile/
│   │   │   └── page.tsx          # "/profile" — Hồ sơ cá nhân
│   │   │
│   │   └── tracking/
│   │       └── page.tsx          # "/tracking" — Public Tracking (nhập Tracking ID)
│   │
│   ├── organizer/                # 🏢 Organizer Console (cần role ORGANIZER)
│   │   ├── layout.tsx            # Layout riêng cho Organizer (sidebar navigation)
│   │   ├── events/
│   │   │   ├── page.tsx          # Quản lý sự kiện của tổ chức
│   │   │   ├── new/
│   │   │   │   └── page.tsx      # Tạo sự kiện mới
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # Chi tiết/chỉnh sửa sự kiện
│   │   │       ├── volunteers/
│   │   │       │   └── page.tsx  # Duyệt đơn TNV
│   │   │       ├── donations/
│   │   │       │   └── page.tsx  # Xác nhận quyên góp
│   │   │       ├── inventory/
│   │   │       │   └── page.tsx  # Quản lý kho hàng
│   │   │       ├── batches/
│   │   │       │   ├── page.tsx  # Danh sách Donation Batch
│   │   │       │   └── new/
│   │   │       │       └── page.tsx  # Tạo Batch mới
│   │   │       ├── trips/
│   │   │       │   ├── page.tsx  # Danh sách Distribution Trip
│   │   │       │   ├── new/
│   │   │       │   │   └── page.tsx  # Tạo Trip mới
│   │   │       │   └── [tripId]/
│   │   │       │       └── page.tsx  # Chi tiết & cập nhật Trip
│   │   │       └── timeline/
│   │   │           └── page.tsx  # Transparency Timeline
│   │   │
│   │   ├── organization/
│   │   │   └── page.tsx          # Quản lý thông tin tổ chức
│   │   │
│   │   └── dashboard/
│   │       └── page.tsx          # Dashboard & Report
│   │
│   ├── admin/                    # 🛡️ Admin Console (cần role ADMIN)
│   │   ├── layout.tsx            # Layout riêng cho Admin
│   │   ├── page.tsx              # Admin Dashboard
│   │   ├── users/
│   │   │   └── page.tsx          # Quản lý users
│   │   ├── organizations/
│   │   │   └── page.tsx          # Duyệt / quản lý tổ chức
│   │   └── events/
│   │       └── page.tsx          # Kiểm duyệt sự kiện
│   │
│   └── api/                      # (Tùy chọn) API Routes nếu cần proxy
│       └── ...
│
├── components/                   # 🧩 Shared components
│   ├── ui/                       # Atomic UI components (Button, Input, Card, Modal...)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── modal.tsx
│   │   ├── badge.tsx
│   │   ├── table.tsx
│   │   ├── select.tsx
│   │   ├── textarea.tsx
│   │   ├── avatar.tsx
│   │   └── ...
│   ├── layout/                   # Layout components
│   │   ├── header.tsx            # Header / Navbar
│   │   ├── footer.tsx            # Footer
│   │   ├── sidebar.tsx           # Sidebar navigation
│   │   └── mobile-nav.tsx        # Mobile navigation
│   ├── forms/                    # Form components tái sử dụng
│   │   ├── event-form.tsx
│   │   ├── donation-form.tsx
│   │   ├── volunteer-form.tsx
│   │   └── ...
│   ├── cards/                    # Card components
│   │   ├── event-card.tsx        # Card hiển thị sự kiện
│   │   ├── donation-card.tsx
│   │   └── trip-card.tsx
│   ├── timeline/                 # Timeline components
│   │   ├── timeline.tsx
│   │   └── timeline-item.tsx
│   ├── tracking/                 # Public tracking components
│   │   ├── tracking-search.tsx
│   │   └── tracking-result.tsx
│   └── dashboard/                # Dashboard components
│       ├── stats-card.tsx
│       ├── chart.tsx
│       └── summary-table.tsx
│
├── lib/                          # 🔧 Utilities & configurations
│   ├── api.ts                    # Axios instance / fetch wrapper (baseURL, interceptors)
│   ├── auth.ts                   # Auth helpers (getToken, isAuthenticated, etc.)
│   ├── utils.ts                  # Utility functions chung
│   ├── constants.ts              # Constants (status enums, role enums, etc.)
│   ├── validations.ts            # Zod schemas cho form validation
│   └── types.ts                  # TypeScript interfaces & types
│
├── hooks/                        # 🪝 Custom React hooks
│   ├── use-auth.ts               # Hook quản lý authentication state
│   ├── use-events.ts             # Hook fetch/mutate events
│   ├── use-donations.ts          # Hook fetch/mutate donations
│   └── ...
│
├── contexts/                     # 🌐 React Context providers
│   ├── auth-context.tsx          # AuthProvider (user state, login/logout)
│   └── ...
│
├── public/                       # 📁 Static assets
│   ├── images/
│   │   └── logo.svg              # Logo OpenAid
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── next.config.ts                # Cấu hình Next.js
├── tailwind.config.ts            # (Tùy chọn) Cấu hình TailwindCSS nếu cần extend
├── tsconfig.json                 # Cấu hình TypeScript
├── eslint.config.mjs             # Cấu hình ESLint
├── package.json                  # Dependencies & scripts
└── README.md                     # 📖 File này
```

### Giải thích quy ước thư mục Next.js 16 (App Router)

| Quy ước | Ý nghĩa |
|---------|---------|
| `app/` | Thư mục gốc của App Router — mỗi folder là 1 route segment |
| `page.tsx` | File bắt buộc để tạo route công khai |
| `layout.tsx` | Layout bao bọc các route con — tự động wrap `children` |
| `loading.tsx` | UI hiển thị khi đang load (Suspense fallback) |
| `error.tsx` | Error boundary cho route segment |
| `not-found.tsx` | UI khi không tìm thấy (404) |
| `(folder)` | **Route Group** — nhóm folder mà KHÔNG tạo URL segment |
| `[param]` | **Dynamic Route** — segment động (VD: `/events/123`) |
| `_folder` | **Private Folder** — không route, dùng để chứa utils/components nội bộ |

---

## 🚀 Hướng dẫn cài đặt & chạy dự án

### Yêu cầu hệ thống

- **Node.js** >= 18.18.0 (khuyến nghị 20.x hoặc 22.x)
- **npm** >= 9.x (đi kèm Node.js)
- **Git**

### Bước 1: Clone repository

```bash
git clone <repository-url>
cd OpenAid
```

### Bước 2: Cài đặt dependencies

```bash
npm install
```

### Bước 3: Tạo file biến môi trường

```bash
# Tạo file .env.local ở thư mục gốc
cp .env.example .env.local
# Hoặc tạo thủ công (xem mục Biến môi trường bên dưới)
```

### Bước 4: Chạy development server

```bash
npm run dev
```

Mở trình duyệt tại [http://localhost:3000](http://localhost:3000).

### Bước 5: Build production

```bash
npm run build
npm run start
```

---

## 📜 Scripts có sẵn

| Script | Lệnh | Mô tả |
|--------|-------|-------|
| `dev` | `npm run dev` | Chạy dev server với Turbopack (hot reload nhanh) |
| `build` | `npm run build` | Build production |
| `start` | `npm run start` | Chạy production server (sau khi build) |
| `lint` | `npm run lint` | Kiểm tra lỗi code với ESLint |

---

## 📝 Quy ước đặt tên & Coding Conventions

### Đặt tên file

| Loại | Quy ước | Ví dụ |
|------|---------|-------|
| Component | `kebab-case.tsx` | `event-card.tsx`, `donation-form.tsx` |
| Page | `page.tsx` (bắt buộc) | `app/events/page.tsx` |
| Layout | `layout.tsx` (bắt buộc) | `app/(main)/layout.tsx` |
| Hook | `use-*.ts` | `use-auth.ts`, `use-events.ts` |
| Utility | `kebab-case.ts` | `api.ts`, `constants.ts` |
| Type/Interface | `kebab-case.ts` hoặc gộp trong `types.ts` | `lib/types.ts` |

### Đặt tên biến & hàm

```typescript
// ✅ Components: PascalCase
export default function EventCard() { ... }

// ✅ Hooks: camelCase, bắt đầu bằng "use"
export function useAuth() { ... }

// ✅ Functions: camelCase
export function formatDate(date: Date): string { ... }

// ✅ Constants: UPPER_SNAKE_CASE
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
export const EVENT_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED',
} as const;

// ✅ Types/Interfaces: PascalCase
interface Event {
  id: string;
  name: string;
  status: EventStatus;
}
type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'CANCELLED';
```

### Server vs Client Components

```typescript
// Server Component (mặc định trong Next.js App Router)
// — KHÔNG cần directive, chạy trên server
// — Có thể fetch data trực tiếp, truy cập database
// — KHÔNG dùng được useState, useEffect, onClick, v.v.
export default async function EventsPage() {
  const events = await fetch(`${API_URL}/events`);
  return <div>...</div>;
}

// Client Component — cần "use client" ở dòng đầu tiên
// — Chạy trên browser
// — Dùng được hooks, event handlers, browser APIs
"use client";
export default function EventFilter() {
  const [search, setSearch] = useState('');
  return <input onChange={(e) => setSearch(e.target.value)} />;
}
```

> **Quy tắc:** Giữ Server Component càng nhiều càng tốt. Chỉ thêm `"use client"` khi component cần tương tác (form, click, state...).

---

## 🔐 Biến môi trường

Tạo file `.env.local` ở thư mục gốc:

```env
# ====================================
# API Configuration
# ====================================
# URL của Backend API (NestJS)
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# ====================================
# Authentication
# ====================================
# (Nếu cần verify JWT ở phía FE hoặc middleware)
# NEXT_PUBLIC_JWT_SECRET=your-secret-key

# ====================================
# File Upload
# ====================================
# Giới hạn kích thước file upload (bytes)
NEXT_PUBLIC_MAX_FILE_SIZE=5242880
# Định dạng file cho phép
NEXT_PUBLIC_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp

# ====================================
# App Configuration
# ====================================
NEXT_PUBLIC_APP_NAME=OpenAid
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> ⚠️ **Quan trọng:** Biến có prefix `NEXT_PUBLIC_` sẽ được expose ra browser. KHÔNG đặt secret keys với prefix này!

---

## 🗂️ Các trang cần xây dựng (Frontend Roadmap)

### 🟢 Nhóm 1: Auth & Profile (Sprint 2 — W3-W4)

| Trang | Route | Mô tả | Priority |
|-------|-------|-------|:--------:|
| Đăng ký | `/register` | Form: name, email, password, confirm password | 🔴 High |
| Đăng nhập | `/login` | Form: email, password; lưu JWT token | 🔴 High |
| Hồ sơ cá nhân | `/profile` | Xem & sửa thông tin cá nhân | 🟡 Medium |

### 🟢 Nhóm 2: Event & Discovery (Sprint 2 — W3-W4)

| Trang | Route | Mô tả | Priority |
|-------|-------|-------|:--------:|
| Trang chủ / Event Discovery | `/` hoặc `/events` | Danh sách sự kiện; tìm kiếm, lọc theo khu vực/thời gian/loại | 🔴 High |
| Chi tiết sự kiện | `/events/[id]` | Hiển thị đầy đủ thông tin, nhu cầu TNV & hiện vật, tiến độ | 🔴 High |
| Tạo sự kiện (Organizer) | `/organizer/events/new` | Form tạo sự kiện + khai báo nhu cầu | 🔴 High |
| Quản lý sự kiện (Organizer) | `/organizer/events` | Danh sách sự kiện của tổ chức | 🔴 High |

### 🟡 Nhóm 3: Volunteer (Sprint 3 — W5-W6)

| Trang | Route | Mô tả | Priority |
|-------|-------|-------|:--------:|
| Đăng ký TNV | `/events/[id]/volunteer` | Chọn vai trò, gửi đơn | 🔴 High |
| Duyệt đơn TNV (Organizer) | `/organizer/events/[id]/volunteers` | Danh sách đơn, duyệt/từ chối | 🔴 High |
| Hoạt động của tôi | `/my-activities` | Lịch sử TNV (đã đăng ký, đã duyệt, trạng thái) | 🔴 High |
| Điểm danh | (tích hợp trong event detail) | QR hoặc nút xác nhận check-in/out | 🟡 Medium |

### 🟡 Nhóm 4: Donation & Inventory (Sprint 3-4 — W5-W7)

| Trang | Route | Mô tả | Priority |
|-------|-------|-------|:--------:|
| Đăng ký quyên góp | `/events/[id]/donate` | Chọn loại hàng, nhập số lượng, nhận Tracking ID | 🔴 High |
| Quyên góp của tôi | `/my-donations` | Danh sách & trạng thái quyên góp | 🔴 High |
| Xác nhận quyên góp (Org) | `/organizer/events/[id]/donations` | Xác nhận đã nhận / từ chối | 🔴 High |
| Quản lý kho (Org) | `/organizer/events/[id]/inventory` | Hiển thị Available/Reserved/Distributed | 🔴 High |

### 🟠 Nhóm 5: Batch & Trip (Sprint 4 — W7-W8)

| Trang | Route | Mô tả | Priority |
|-------|-------|-------|:--------:|
| Quản lý Batch (Org) | `/organizer/events/[id]/batches` | Danh sách batch, tạo batch mới | 🔴 High |
| Tạo Batch | `/organizer/events/[id]/batches/new` | Chọn donations cùng loại → nhóm thành batch | 🔴 High |
| Quản lý Trip (Org) | `/organizer/events/[id]/trips` | Danh sách chuyến phân phối | 🔴 High |
| Tạo Trip | `/organizer/events/[id]/trips/new` | Chọn batch, TNV, distribution points | 🔴 High |
| Chi tiết & cập nhật Trip | `/organizer/events/[id]/trips/[tripId]` | Cập nhật status, xác nhận phân phối, upload bằng chứng | 🔴 High |

### 🔵 Nhóm 6: Transparency & Dashboard (Sprint 5 — W9-W10)

| Trang | Route | Mô tả | Priority |
|-------|-------|-------|:--------:|
| Transparency Timeline | `/organizer/events/[id]/timeline` | Timeline dạng vertical, hiển thị log | 🔴 High |
| Public Tracking | `/tracking` | Nhập Tracking ID → xem trạng thái công khai | 🔴 High |
| Dashboard (Org) | `/organizer/dashboard` | Tổng hợp số liệu: TNV, donations, batches, trips | 🟡 Medium |
| Báo cáo minh bạch | (tích hợp trong Dashboard) | Needed/Pledged/Received/Distributed | 🟡 Medium |

### ⚪ Nhóm 7: Admin Console (Sprint 5 — W10)

| Trang | Route | Mô tả | Priority |
|-------|-------|-------|:--------:|
| Admin Dashboard | `/admin` | Tổng quan hệ thống | 🟡 Medium |
| Quản lý Users | `/admin/users` | Danh sách, tìm kiếm, khóa/mở khóa | 🟡 Medium |
| Quản lý Organizations | `/admin/organizations` | Duyệt / vô hiệu hóa tổ chức | 🟡 Medium |
| Quản lý Events | `/admin/events` | Kiểm duyệt sự kiện | 🟡 Medium |

---

## 🔌 API Endpoints dự kiến (để FE kết nối)

> ⚠️ Danh sách này là **dự kiến** dựa trên tài liệu Proposal. API thực tế sẽ do đội BE cung cấp qua Swagger.

### Auth

```
POST   /api/auth/register          # Đăng ký tài khoản
POST   /api/auth/login             # Đăng nhập, trả về JWT
POST   /api/auth/logout            # Đăng xuất (invalidate token)
GET    /api/auth/me                # Lấy thông tin user hiện tại
PUT    /api/auth/profile           # Cập nhật hồ sơ
```

### Organizations

```
POST   /api/organizations              # Tạo tổ chức
GET    /api/organizations/:id          # Chi tiết tổ chức
PUT    /api/organizations/:id          # Cập nhật tổ chức
POST   /api/organizations/:id/members  # Thêm thành viên
```

### Events

```
GET    /api/events                     # Danh sách sự kiện (có filter & search)
POST   /api/events                     # Tạo sự kiện mới
GET    /api/events/:id                 # Chi tiết sự kiện
PUT    /api/events/:id                 # Cập nhật sự kiện
PATCH  /api/events/:id/status          # Thay đổi trạng thái (publish, close, cancel)
GET    /api/events/:id/volunteer-roles # Danh sách vai trò TNV
GET    /api/events/:id/donation-needs  # Danh sách nhu cầu hiện vật
```

### Volunteers

```
POST   /api/events/:id/volunteer-applications     # Nộp đơn TNV
GET    /api/events/:id/volunteer-applications     # Danh sách đơn (Organizer)
PATCH  /api/volunteer-applications/:id/approve    # Duyệt đơn
PATCH  /api/volunteer-applications/:id/reject     # Từ chối đơn
GET    /api/my/activities                          # Hoạt động TNV của tôi
POST   /api/volunteer-applications/:id/check-in   # Điểm danh vào
POST   /api/volunteer-applications/:id/check-out  # Điểm danh ra
```

### Donations

```
POST   /api/events/:id/donations       # Tạo quyên góp mới → nhận Tracking ID
GET    /api/my/donations               # Quyên góp của tôi
GET    /api/events/:id/donations       # Danh sách quyên góp (Organizer)
PATCH  /api/donations/:id/confirm      # Xác nhận đã nhận hàng
PATCH  /api/donations/:id/reject       # Từ chối / không nhận
```

### Inventory

```
GET    /api/events/:id/inventory       # Xem kho hàng (Available/Reserved/Distributed)
```

### Donation Batches

```
GET    /api/events/:id/batches         # Danh sách batches
POST   /api/events/:id/batches         # Tạo batch mới
GET    /api/batches/:id                # Chi tiết batch
PATCH  /api/batches/:id/status         # Cập nhật trạng thái batch
```

### Distribution Trips

```
GET    /api/events/:id/trips           # Danh sách trips
POST   /api/events/:id/trips           # Tạo trip mới
GET    /api/trips/:id                  # Chi tiết trip
PATCH  /api/trips/:id/status           # Cập nhật trạng thái trip
PATCH  /api/distribution-points/:id/status  # Cập nhật trạng thái điểm phân phối
POST   /api/distribution-points/:id/records # Ghi nhận số lượng phân phối
POST   /api/trips/:id/evidence         # Upload bằng chứng
```

### Transparency & Tracking

```
GET    /api/tracking/:trackingId       # Public Tracking (không cần auth)
GET    /api/events/:id/timeline        # Timeline của sự kiện
GET    /api/batches/:id/timeline       # Timeline của batch
GET    /api/trips/:id/timeline         # Timeline của trip
```

### Dashboard & Report

```
GET    /api/events/:id/dashboard       # Số liệu tổng hợp của sự kiện
GET    /api/organizations/:id/dashboard # Dashboard tổng của tổ chức
```

### Admin

```
GET    /api/admin/users                # Danh sách users
PATCH  /api/admin/users/:id            # Cập nhật user (khóa/mở)
GET    /api/admin/organizations        # Danh sách tổ chức
PATCH  /api/admin/organizations/:id/approve    # Duyệt tổ chức
PATCH  /api/admin/organizations/:id/disable    # Vô hiệu hóa tổ chức
GET    /api/admin/events               # Danh sách sự kiện (kiểm duyệt)
```

---

## 🔄 Data Flow & State Management

### Chiến lược quản lý state

```
┌──────────────────────────────────────────────────────┐
│                     State Architecture               │
├──────────────────────────────────────────────────────┤
│                                                      │
│  1. SERVER STATE (data từ API)                       │
│     → Dùng fetch() trong Server Components           │
│     → Hoặc SWR / React Query cho Client Components   │
│     → Cache & revalidate qua Next.js caching         │
│                                                      │
│  2. AUTH STATE (user đăng nhập)                      │
│     → React Context (AuthProvider)                   │
│     → JWT lưu trong httpOnly cookie hoặc localStorage│
│                                                      │
│  3. UI STATE (form, modal, filter...)                │
│     → useState / useReducer tại component            │
│     → Không cần global state cho UI                  │
│                                                      │
│  4. URL STATE (search params, filters)               │
│     → useSearchParams() của Next.js                  │
│     → Giúp shareable URL, back/forward hoạt động     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Ví dụ flow Authentication

```typescript
// lib/api.ts — Tạo fetch wrapper có kèm JWT
export async function apiFetch(endpoint: string, options?: RequestInit) {
  const token = getToken(); // Lấy JWT từ cookie/localStorage

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  if (res.status === 401) {
    // Redirect to login
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'API Error');
  }

  return res.json();
}
```

---

## 🏷️ Trạng thái (Status) quan trọng

Các trạng thái và luồng chuyển đổi mà FE cần hiển thị & xử lý:

### Event Status

```
Draft ──→ Published ──→ Closed
              │
              └──→ Cancelled
```

### Volunteer Application Status

```
Pending ──→ Approved
   │
   └──→ Rejected
```

### Donation Status

```
Pending ──→ Received ──→ In Batch ──→ Distributed
   │
   └──→ Rejected
   │
   └──→ Cancelled
```

### Donation Batch Status

```
Draft ──→ Ready ──→ Assigned ──→ Distributed
                       │
                       └──→ Ready  (nếu Trip bị Cancelled)
```

### Distribution Trip Status

```
Scheduled ──→ Preparing ──→ In Transit ──→ Completed
     │
     └──→ Cancelled  (chỉ trước khi có Distribution Point nào đã Distributed)
```

### Distribution Point Status

```
Pending ──→ Arrived ──→ Distributed
   │
   └──→ Skipped
```

### Inventory Flow

```
Donation confirmed ──→ Available (thêm vào kho)
Available ──→ Reserved (gán vào Batch)
Reserved ──→ Distributed (xác nhận phân phối)
Reserved ──→ Available (trả lại kho — returned)
Reserved ──→ Lost/Written-off (thất thoát — ghi chú)
```

---

## 🎬 Demo Scenario

Kịch bản demo cuối kỳ: **Sự kiện "Hỗ trợ vùng lũ Hòa Vang"**

| Bước | Hành động | Actor |
|:----:|-----------|-------|
| 1 | Organizer tạo Event: cần 20 TNV, 500 kg gạo, 1.000 chai nước | Organizer |
| 2 | TNV A đăng ký vai trò Vận chuyển; TNV B đăng ký vai trò Phân phối; Organizer duyệt | Volunteer → Organizer |
| 3 | Donor A góp 20 kg gạo, Donor B 50 kg, Donor C 30 kg; hệ thống tạo Tracking IDs; Event hiển thị Needed 500 kg / Pledged 100 kg | Donor |
| 4 | Tổ chức xác nhận nhận hàng; Inventory hiển thị 100 kg gạo Available | Organizer |
| 5 | Organizer tạo RICE-BATCH-001 = 100 kg (Inventory: Available 0 kg, Reserved 100 kg) | Organizer |
| 6 | Organizer tạo TRIP-001 đến Hòa Bắc, gán Batch + 2 TNV (1 Trip Leader) | Organizer |
| 7 | Trip Leader cập nhật: Preparing → In Transit; mỗi Distribution Point: Pending → Arrived → Distributed, cập nhật số lượng + ảnh | Trip Leader |
| 8 | Batch hoàn thành phân phối; Transparency Timeline hiển thị các bước | System |
| 9 | Donor nhập Tracking ID → xem Batch, Trip, Distribution Points, bằng chứng công khai | Donor |
| 10 | Organizer mở Dashboard → tạo báo cáo tổng kết minh bạch | Organizer |

---

## 📅 Sprint Plan (Frontend Focus)

| Sprint | Tuần | Frontend Tasks |
|:------:|:----:|----------------|
| **Sprint 1** | W1-W2 | Setup project skeleton, cấu hình TailwindCSS, tạo components UI cơ bản (Button, Input, Card...), layout system (Header, Footer, Sidebar), thiết kế wireframes |
| **Sprint 2** | W3-W4 | Trang Login/Register, Profile, tạo AuthProvider; Event List, Event Detail, Event Form (Organizer); kết nối API Auth & Event |
| **Sprint 3** | W5-W6 | Volunteer Form, Application Review, My Activities, Check-in UI; Donation Form, My Donations, Donation Confirmation; kết nối API Volunteer & Donation |
| **Sprint 4** | W7-W8 | Inventory View, Batch Management, Trip Management (CRUD + status updates); kết nối API Inventory, Batch, Trip |
| **Sprint 5** | W9-W10 | Distribution Confirmation UI, Evidence Upload, Transparency Timeline, Public Tracking, Dashboard & Report, Admin Console |
| **Sprint 6** | W11-W12 | End-to-end testing, bug fixing, responsive polish, chuẩn bị demo data, final demo |

---

## 📚 Tài liệu tham khảo

| Tài liệu | Link |
|-----------|------|
| Next.js 16 Docs (local) | `node_modules/next/dist/docs/` |
| Next.js Official Docs | https://nextjs.org/docs |
| React 19 Docs | https://react.dev |
| TailwindCSS v4 Docs | https://tailwindcss.com/docs |
| shadcn/ui | https://ui.shadcn.com |
| TypeScript Handbook | https://www.typescriptlang.org/docs |
| React Hook Form | https://react-hook-form.com |
| Zod (Validation) | https://zod.dev |
| Zustand (State) | https://zustand-demo.pmnd.rs |
| Lucide Icons | https://lucide.dev |

---

## 👨‍💻 Team C1SE.102

| Thành viên | Vai trò | Trách nhiệm chính |
|-----------|---------|-------------------|
| **Hoa, Phan Vinh Thai** | Scrum Master | **Frontend Lead** — Next.js, TailwindCSS, UI/UX, System Integration |
| **Tinh, Ta Quang** | Developer | Backend — Auth, Organization, Event, Volunteer, Swagger API |
| **Hoang, Tran Le** | Developer | Backend — Donation, Inventory, Batch, Trip, File Upload, Transparency Log |
| **Tuong, Dang Phuoc** | Product Owner | QA Lead — SRS, Test Plan, Postman Testing, Seed Data, **Frontend Support** |

---

> 💡 **Tip:** Khi bắt đầu code FE, hãy làm theo thứ tự:
> 1. Setup layout system (Header, Footer, Sidebar) → chạy được trên tất cả trang
> 2. Làm Auth (Login/Register) + AuthProvider → có thể test các trang cần đăng nhập
> 3. Làm Event Discovery + Event Detail → có dữ liệu để hiển thị
> 4. Lần lượt làm theo chuỗi nghiệp vụ: Volunteer → Donation → Inventory → Batch → Trip → Transparency
> 5. Cuối cùng là Dashboard, Admin, và polish UI

---

*Cập nhật lần cuối: 25/10/2026*
