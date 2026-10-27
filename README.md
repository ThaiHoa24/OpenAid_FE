# OpenAid

OpenAid là ứng dụng điều phối quyên góp hiện vật và hoạt động tình nguyện. Hệ thống mô phỏng hành trình từ chiến dịch cứu trợ, cam kết đóng góp, nhập kho, gom lô hàng đến chuyến phân phối, bằng chứng bàn giao và tra cứu bằng Tracking ID.

Repository hiện chứa **frontend demo** xây dựng bằng Next.js. Các thao tác nghiệp vụ chạy qua mock service và lưu dữ liệu trong `localStorage` của trình duyệt. Có thể chạy demo mà không cần backend hoặc cơ sở dữ liệu riêng. Giao diện hiện sử dụng tiếng Việt.

## Công nghệ

| Thành phần | Công nghệ đang dùng |
| --- | --- |
| Framework | Next.js 16.4.3, App Router |
| Giao diện | React 19.3.0, TypeScript 5 |
| Styling | Tailwind CSS 4, CSS Modules |
| Icon | Lucide React |
| Trạng thái và phiên đăng nhập | React Context, hooks, `localStorage` |
| Dữ liệu | Mock service và dữ liệu seed trong mã nguồn |
| Kiểm tra mã nguồn | ESLint 9, cấu hình Next.js và TypeScript |

Phiên bản và dependency được khai báo trong [package.json](package.json), với bản khóa dependency tại [package-lock.json](package-lock.json).

## Cài đặt và chạy

### Yêu cầu

- Node.js **20.9.0 trở lên**, theo yêu cầu của phiên bản Next.js đang cài.
- npm.
- Trình duyệt cho phép sử dụng `localStorage`.

Chạy các lệnh sau tại thư mục gốc dự án:

```bash
npm ci
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000). Dữ liệu mẫu sẽ được khởi tạo khi ứng dụng truy cập mock database lần đầu.

Ảnh minh họa trong dữ liệu mẫu sử dụng URL bên ngoài, chủ yếu từ Unsplash; cần kết nối Internet để tải các ảnh này.

### Chạy bản production tại máy

```bash
npm run build
npm run start
```

### Các script hiện có

| Lệnh | Tác dụng |
| --- | --- |
| `npm run dev` | Chạy máy chủ phát triển Next.js |
| `npm run build` | Build production bằng `next build --webpack`, bao gồm kiểm tra TypeScript |
| `npm run start` | Chạy bản production đã build |
| `npm run lint` | Chạy ESLint |

Dự án chưa khai báo script `test`. Mã nguồn hiện còn các lỗi lint như `no-explicit-any` và `set-state-in-effect`; cần xử lý riêng khi tiếp tục phát triển.

## Tài khoản và dữ liệu demo

Các tài khoản dưới đây có trong [src/mocks/seedData.ts](src/mocks/seedData.ts). Mật khẩu chung: **`123456`**.

| Email | Vai trò | Khu vực sử dụng chính |
| --- | --- | --- |
| `user@openaid.demo` | Người dùng, tình nguyện viên, nhà tài trợ hiện vật | `/my/activities`, `/my/donations` |
| `organizer@openaid.demo` | Organizer của Helping Hands Da Nang | `/organizer/dashboard` |
| `admin@openaid.demo` | Quản trị viên hệ thống | `/admin/dashboard` |
| `volunteer.b@openaid.demo` | Người dùng thứ hai để thử phân công tình nguyện viên | Đăng nhập tại `/login` |
| `greenhope@openaid.demo` | Organizer của tổ chức Green Hope Youth Network đang chờ duyệt | Thử quy trình duyệt tổ chức |

Thanh **Chuyển Vai Trò Demo** cho phép chuyển nhanh giữa khách vãng lai, người dùng, Organizer và Admin. Những tài khoản khác có thể đăng nhập bằng email và mật khẩu tại `/login`.

Vai trò hệ thống gồm `USER` và `ADMIN`. Vai trò `ORGANIZER` thuộc quan hệ thành viên của tổ chức, được lưu trong `OrganizationMember`.

### Khôi phục dữ liệu mẫu

Nhấn biểu tượng khôi phục trên thanh chuyển vai trò và xác nhận. Thao tác này ghi đè mock database bằng dữ liệu seed, xóa các thay đổi và bản ghi đã tạo trong lần demo.

Sửa file seed không tự cập nhật database đã tồn tại trong trình duyệt. Sau khi sửa seed, cần khôi phục dữ liệu mẫu để nhận dữ liệu mới. Các trình duyệt hoặc origin khác nhau có bộ dữ liệu riêng.

### Tracking ID có thật trong seed

| Tracking ID | Hiện vật | Trạng thái ban đầu |
| --- | --- | --- |
| `DON-2026-7K3Q9X` | 50 kg gạo | `DISTRIBUTED` |
| `DON-2026-3H6V8B` | 60 kg gạo | `RECEIVED` |
| `DON-2026-5W9K2N` | 500 chai nước | `IN_BATCH` |
| `DON-2026-2F7J9K` | 50 kg gạo | `PENDING` |

Nhập các mã này tại `/track` hoặc truy cập `/track/<Tracking ID>`. Các mã gợi ý đang hiển thị trên giao diện `/track` chưa khớp dữ liệu seed; dùng bảng trên để thử tra cứu.

## Chức năng và đường dẫn

Ứng dụng hiện có **26 trang** được khai báo trong `src/app/`. Route group `(auth)` chỉ dùng để tổ chức thư mục, không xuất hiện trong URL.

### Trang công khai và tài khoản

| URL | Nội dung |
| --- | --- |
| `/` | Trang chủ: giới thiệu, chiến dịch nổi bật, quy trình và lời kêu gọi tham gia |
| `/about` | Giới thiệu nền tảng |
| `/events` | Khám phá chiến dịch đang phát động, tìm kiếm và giao diện bộ lọc |
| `/events/[id]` | Chi tiết chiến dịch, nhu cầu hiện vật, vai trò tình nguyện và nhật ký liên quan |
| `/track` | Nhập Tracking ID |
| `/track/[trackingId]` | Tra cứu đóng góp, lô hàng, chuyến phân phối, điểm phát và bằng chứng công khai |
| `/login` | Đăng nhập |
| `/register` | Đăng ký người dùng; có tùy chọn tạo hồ sơ tổ chức chờ duyệt |
| `/profile` | Xem và cập nhật hồ sơ của tài khoản đã đăng nhập |

### Khu vực người dùng

| URL | Nội dung |
| --- | --- |
| `/volunteer/apply/[eventId]` | Đăng ký một vai trò tình nguyện trong chiến dịch |
| `/donate/[eventId]` | Cam kết quyên góp hiện vật theo nhu cầu và nhận Tracking ID |
| `/my/activities` | Xem trạng thái đơn tình nguyện, giao diện QR và điểm danh mô phỏng |
| `/my/donations` | Xem, tìm kiếm và lọc đóng góp cá nhân; sao chép mã và mở trang tra cứu |

Các trang này dùng `RoleGuard` cho vai trò `user`. Tài khoản Organizer và Admin có khu vực điều phối riêng.

### Khu vực Organizer

| URL | Nội dung |
| --- | --- |
| `/organizer/dashboard` | Tổng quan hoạt động của tổ chức |
| `/organizer/events` | Tạo chiến dịch, khai báo nhu cầu hiện vật/vai trò tình nguyện, đổi trạng thái và xóa chiến dịch |
| `/organizer/events/[id]` | Theo dõi chi tiết chiến dịch, xét duyệt đơn tình nguyện và xem đóng góp |
| `/organizer/volunteers` | Duyệt hoặc từ chối đơn tình nguyện |
| `/organizer/donations` | Xác nhận đã nhận hoặc từ chối đóng góp hiện vật |
| `/organizer/inventory` | Xem tồn kho và đối chiếu phương trình cân đối |
| `/organizer/batches` | Gom các đóng góp đã nhận thành lô hàng, chuyển lô sang sẵn sàng và đối soát số lượng |
| `/organizer/trips` | Tạo chuyến, gán lô hàng/TNV/trưởng đoàn, quản lý điểm phát, ghi nhận phân phối và ảnh bằng chứng |
| `/organizer/transparency` | Xét duyệt bằng chứng công khai và xem nhật ký nghiệp vụ |

### Khu vực Admin

| URL | Nội dung |
| --- | --- |
| `/admin/dashboard` | Thống kê tổng quan nền tảng |
| `/admin/organizations` | Tìm kiếm tổ chức, duyệt và thay đổi trạng thái tổ chức |
| `/admin/users` | Tìm kiếm, kích hoạt hoặc vô hiệu hóa tài khoản |
| `/admin/events` | Theo dõi và thay đổi trạng thái chiến dịch trên nền tảng |

## Cấu trúc thư mục

```text
OpenAid/
├── public/                      # Tài nguyên tĩnh
├── src/
│   ├── app/                     # Khai báo route Next.js, import/export view
│   ├── view/                    # Giao diện trang, state và xử lý tương tác
│   │   ├── (auth)/              # Đăng nhập, đăng ký
│   │   ├── about/
│   │   ├── admin/
│   │   ├── donate/
│   │   ├── events/
│   │   ├── my/
│   │   ├── organizer/
│   │   ├── profile/
│   │   ├── track/
│   │   ├── volunteer/
│   │   ├── layout.tsx           # Root layout, metadata và providers
│   │   ├── page.tsx             # Nội dung trang chủ
│   │   ├── error.tsx
│   │   ├── loading.tsx
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── auth/                # RoleGuard
│   │   ├── layout/              # AppShell, RoleSwitcherBar
│   │   ├── sections/            # Header, Footer, Hero, các section trang chủ
│   │   └── ui/                  # Button, Badge, modal, toast, ProgressBar...
│   ├── styles/
│   │   ├── globals.css          # Tailwind, theme và CSS chung
│   │   ├── Header.module.css
│   │   └── ProgressBar.module.css
│   ├── hooks/                   # useAuth, useTranslation
│   ├── providers/               # LanguageProvider
│   ├── services/                # Các mock service nghiệp vụ
│   ├── mocks/                   # seedData.ts
│   ├── types/                   # Model, trạng thái và kiểu dữ liệu dùng chung
│   ├── constants/               # Storage key, danh mục nghiệp vụ, tài khoản demo
│   ├── lib/                     # Hằng số giao diện và tiện ích
│   ├── i18n/                    # Bản dịch tiếng Việt
│   └── utils/                   # ID, định dạng và kiểm tra cân đối kho
├── AGENTS.md                    # Hướng dẫn làm việc với phiên bản Next.js đã cài
├── next.config.ts               # Cấu hình Next.js và rewrite /api
├── postcss.config.mjs
├── eslint.config.mjs
├── tsconfig.json
├── package.json
└── package-lock.json
```

## Quy ước tổ chức mã nguồn

### `app` chỉ khai báo route và import/export

Giao diện được viết trong `src/view/` với cấu trúc thư mục tương ứng. Ví dụ [src/app/events/page.tsx](src/app/events/page.tsx):

```tsx
import EventsDiscoveryPage from "@/view/events/page";

export default EventsDiscoveryPage;
```

Khi sửa giao diện danh sách chiến dịch, sửa [src/view/events/page.tsx](src/view/events/page.tsx).

Các file `layout.tsx`, `error.tsx`, `loading.tsx` và `not-found.tsx` trong `app` cũng import/export nội dung từ `view`. Root layout export thêm metadata; `app/error.tsx` giữ chỉ thị `"use client"` theo yêu cầu Next.js. `favicon.ico` vẫn nằm trong `app` để Next.js nhận diện.

Alias `@/*` trỏ đến `src/*`, được cấu hình trong [tsconfig.json](tsconfig.json). Logic dùng lại giữa các trang đặt trong `components/`, `hooks/`, `services/` hoặc `utils/` tùy trách nhiệm.

### Tailwind và CSS riêng

- Ưu tiên Tailwind cho bố cục, khoảng cách, màu sắc, responsive và các style thông thường.
- CSS toàn ứng dụng đặt tại [src/styles/globals.css](src/styles/globals.css), được import trong `src/view/layout.tsx`.
- CSS cần viết riêng đặt tại `src/styles/<TênComponent>.module.css` và import vào component tương ứng.
- Dữ liệu style thay đổi khi chạy được truyền bằng biến CSS. Hiện tại, `Header.module.css` quản lý vị trí/kích thước hiệu ứng menu; `ProgressBar.module.css` quản lý chiều rộng thanh tiến độ.
- Các trang dùng chung [ProgressBar](src/components/ui/ProgressBar.tsx), với class Tailwind riêng cho phần nền, màu và chiều cao.

### Hướng dẫn Next.js trong dự án

Theo [AGENTS.md](AGENTS.md), trước khi thay đổi code Next.js cần đọc hướng dẫn tương ứng tại `node_modules/next/dist/docs/`. Dự án dùng Next.js 16.4.3; cần kiểm tra tài liệu đi kèm thay vì áp dụng mặc định các quy ước của phiên bản khác.

## Dữ liệu và xử lý nghiệp vụ

Luồng xử lý hiện tại:

```text
View / Component
    → Hook / Mock Service
    → storageService
    → localStorage
```

[storageService](src/services/storageService.ts) khởi tạo database từ seed, đọc/ghi dữ liệu và phát sự kiện `openaid-db-changed`. [AuthProvider](src/hooks/useAuth.tsx) quản lý phiên, tổ chức đang hoạt động và theo dõi thay đổi dữ liệu. Các trang có thể tải lại dữ liệu qua các sự kiện này hoặc sau khi hoàn tất thao tác.

| Service | Trách nhiệm |
| --- | --- |
| `authService` | Đăng nhập, đăng ký, hồ sơ và quan hệ thành viên tổ chức |
| `eventService` | Tìm kiếm, tạo/cập nhật, đổi trạng thái và xóa chiến dịch |
| `volunteerService` | Đơn tình nguyện, xét duyệt, hàm check-in/check-out |
| `donationService` | Cam kết hiện vật, cấp Tracking ID, xác nhận nhận, từ chối và hủy cam kết |
| `inventoryService` | Truy vấn kho theo tổ chức/chiến dịch và kiểm tra cân đối |
| `batchService` | Gom lô, kiểm tra điều kiện hiện vật và đối soát lô |
| `tripService` | Chuyến phân phối, phân công TNV, điểm phát và số lượng bàn giao |
| `transparencyService` | Bằng chứng, xét duyệt công khai, nhật ký và tra cứu Tracking ID |
| `adminService` | Thống kê, tài khoản và xét duyệt tổ chức |
| `storageService` | Đọc/ghi, khôi phục mock database và thêm nhật ký |

Các hàm trong service không đồng nghĩa đều đã có thao tác tương ứng trên giao diện. Ví dụ service có check-in/check-out, nhưng nút điểm danh hiện tại ở `/my/activities` chỉ thay đổi state của trang.

### Dữ liệu lưu trong trình duyệt

| Key | Nội dung |
| --- | --- |
| `openaid_mock_db_v1` | Toàn bộ mock database |
| `openaid_auth_session_v1` | ID tài khoản đang đăng nhập |
| `currentUser` | Bản sao thông tin tài khoản đăng nhập |
| `openaid-language` | Ngôn ngữ giao diện; hiện tại là `vi` |

Seed có dữ liệu cho người dùng, tổ chức, chiến dịch, đơn tình nguyện, nhu cầu hiện vật, đóng góp, kho, lô hàng, chuyến xe, điểm phát, bản ghi phân phối, bằng chứng và nhật ký. Các kiểu dữ liệu được khai báo tại [src/types/index.ts](src/types/index.ts).

### Quy trình hiện vật

```text
Chiến dịch → Cam kết hiện vật → Xác nhận nhận hàng → Kho
          → Lô hàng → Chuyến phân phối → Điểm phát → Bằng chứng
```

Một số quy tắc đang được xử lý trong mock service:

- Chỉ chiến dịch `PUBLISHED` tiếp nhận đăng ký tình nguyện và đóng góp hiện vật. Tổ chức phải `APPROVED` mới được công bố chiến dịch.
- Lô hàng gom các đóng góp `RECEIVED`, chưa thuộc lô khác, cùng chiến dịch, loại hàng và đơn vị; tổng số lượng phải phù hợp tồn kho khả dụng.
- Chuyến phân phối cần lô `READY`, TNV có đơn `APPROVED`, trưởng đoàn trong danh sách được chọn và ít nhất một điểm phát.
- Khi hoàn thành chuyến, các điểm phải ở trạng thái `DISTRIBUTED` hoặc `SKIPPED`; service đối soát các lô hàng liên quan.
- Đăng bằng chứng cần chú thích và xác nhận quyền riêng tư. Trang tra cứu chỉ nhận ảnh bằng chứng có trạng thái `APPROVED_PUBLIC`.
- Tracking ID gắn với lượt đóng góp; hành trình phân phối được truy vết qua lô hàng.

Phương trình cân đối kho được kiểm tra trong [src/utils/index.ts](src/utils/index.ts):

```text
received = available + reserved + distributed + lostWrittenOff
```

Khi đối soát lô:

```text
totalQuantity = distributedQuantity + returnedQuantity + lostQuantity
```

### Các trạng thái trong model

| Đối tượng | Trạng thái |
| --- | --- |
| Tổ chức | `PENDING`, `APPROVED`, `DISABLED` |
| Chiến dịch | `DRAFT`, `PUBLISHED`, `CLOSED`, `CANCELLED` |
| Đơn tình nguyện | `PENDING`, `APPROVED`, `REJECTED` |
| Đóng góp | `PENDING`, `RECEIVED`, `REJECTED`, `IN_BATCH`, `DISTRIBUTED`, `CANCELLED` |
| Lô hàng | `DRAFT`, `READY`, `ASSIGNED`, `DISTRIBUTED` |
| Chuyến phân phối | `SCHEDULED`, `PREPARING`, `IN_TRANSIT`, `COMPLETED`, `CANCELLED` |
| Điểm phát | `PENDING`, `ARRIVED`, `DISTRIBUTED`, `SKIPPED` |
| Bằng chứng | `PENDING_REVIEW`, `APPROVED_PUBLIC`, `REJECTED_PUBLIC` |

## Kịch bản demo gợi ý

1. Chạy ứng dụng, khôi phục dữ liệu mẫu nếu cần, rồi vào `/track` để thử các mã có trong bảng Tracking ID.
2. Chuyển sang `user@openaid.demo`, mở chiến dịch Hòa Vang tại `/events/evt-1` và cam kết hiện vật qua `/donate/evt-1`. Ghi lại mã Tracking ID được cấp.
3. Chuyển sang Organizer, vào `/organizer/donations` để xác nhận đã nhận phần hiện vật vừa cam kết. Kiểm tra thay đổi tại `/organizer/inventory`.
4. Vào `/organizer/batches`, gom các đóng góp đủ điều kiện thành lô sẵn sàng phân phối.
5. Tại `/organizer/trips`, tạo chuyến với lô hàng, các TNV đã được duyệt, trưởng đoàn và điểm phát. Có thể duyệt thêm TNV tại `/organizer/volunteers`.
6. Chuyển chuyến qua các bước chuẩn bị, vận chuyển; ghi nhận số lượng phát tại điểm, URL ảnh bằng chứng và xác nhận quyền riêng tư.
7. Duyệt ảnh tại `/organizer/transparency`, hoàn tất các điểm phát và chuyến phân phối, rồi kiểm tra đối soát kho/lô.
8. Chuyển về khách vãng lai và tra cứu Tracking ID đã ghi để xem hành trình cùng ảnh được duyệt công khai.

Để thử quản trị, đăng nhập Admin và mở `/admin/organizations`: dữ liệu seed có Green Hope Youth Network ở trạng thái `PENDING`.

## Cấu hình kết nối backend

[next.config.ts](next.config.ts) đã có rewrite:

```text
/api/:path* → BACKEND_API_URL/api/:path*
```

Biến môi trường duy nhất đang được đọc trong mã cấu hình là `BACKEND_API_URL`, mặc định `http://localhost:3001`. Có thể tạo `.env.local` ở thư mục gốc để đổi địa chỉ:

```dotenv
BACKEND_API_URL=http://localhost:3001
```

Cấu hình này chuẩn bị đường dẫn proxy cho việc tích hợp sau này. **Các service hiện tại vẫn đọc/ghi mock database**, chưa gọi HTTP API. Axios đã được khai báo trong dependency nhưng chưa được sử dụng trong `src/`. Repository chưa có backend, schema database hoặc API handler triển khai nghiệp vụ.

## Giới hạn hiện tại

- Xác thực, mật khẩu và phân quyền đang được mô phỏng ở phía trình duyệt. Dữ liệu lưu cục bộ, không dùng chung giữa các thiết bị; cần backend để vận hành với dữ liệu thật.
- QR tại `/my/activities` là hình minh họa bằng icon. Nút điểm danh chỉ thay đổi state hiện tại, chưa lưu qua service; chưa có luồng quét QR thực tế.
- Bộ lọc thời gian và hình thức hỗ trợ tại `/events` đã có giao diện nhưng chưa được áp dụng vào truy vấn dữ liệu.
- Ảnh được ghi nhận bằng URL. Xác nhận quyền riêng tư là bước nhập liệu; ứng dụng chưa tự làm mờ ảnh hoặc tải file lên dịch vụ lưu trữ.
- Một số nội dung và số liệu giới thiệu ở trang chủ là dữ liệu minh họa, không phải thống kê vận hành thực tế.
- Dữ liệu seed dùng mốc thời gian cố định năm 2026. Giao diện hiện chỉ có bản dịch tiếng Việt.
