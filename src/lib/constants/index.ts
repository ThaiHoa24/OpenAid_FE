// ============================================================
// OpenAid — UI Text Copy & System Constants (Full Tiếng Việt)
// ============================================================

export const APP_CONFIG = {
  name: "OpenAid",
  tagline: "Trao Gửi. Truy Vết. Tin Cậy.",
  subtitle: "Hệ thống điều phối quyên góp hiện vật & tình nguyện viên minh bạch",
  disclaimer: "OpenAid là nền tảng số điều phối minh bạch; hệ thống không giữ tiền và không trực tiếp vận chuyển hàng hóa.",
  traceabilityNote: "Truy vết được thực hiện ở cấp độ Lô hàng (Batch). Mọi bằng chứng bàn giao đều được kiểm toán bởi tổ chức phụ trách.",
};

export const NAV_LINKS = [
  { href: "/", label: "Trang chủ", key: "home" },
  { href: "/#featured-events", label: "Chiến dịch", key: "events" },
  { href: "/#how-it-works", label: "Quy trình", key: "how-it-works" },
  { href: "/track", label: "Tra cứu vận đơn", key: "track" },
  { href: "/about", label: "Giới thiệu", key: "about" },
];

export const SUPPORT_CATEGORIES = [
  { id: "Volunteer", label: "Tình nguyện viên", iconName: "Users" },
  { id: "Rice & Food", label: "Gạo & Lương thực", iconName: "Apple" },
  { id: "Water", label: "Nước sạch", iconName: "Droplets" },
  { id: "Clothes", label: "Quần áo ấm", iconName: "Shirt" },
  { id: "Medical Supplies", label: "Vật tư y tế", iconName: "HeartPulse" },
  { id: "Study Supplies", label: "Dụng cụ học tập", iconName: "GraduationCap" },
] as const;

export const AREAS = [
  "Tất cả khu vực",
  "Hòa Vang, Đà Nẵng",
  "Nam Trà My, Quảng Nam",
  "Mèo Vạc, Hà Giang",
  "A Lưới, Thừa Thiên Huế",
  "Đắk Glei, Kon Tum",
] as const;

export const TIME_FILTERS = [
  { id: "all", label: "Tất cả thời gian" },
  { id: "upcoming", label: "Sắp diễn ra (30 ngày tới)" },
  { id: "ongoing", label: "Đang phát động" },
  { id: "completed", label: "Đã hoàn thành / Đã phân phối" },
] as const;

export const SUPPORT_TYPES = [
  { id: "all", label: "Tất cả hình thức" },
  { id: "volunteer", label: "Tình nguyện viên" },
  { id: "inkind", label: "Hiện vật cứu trợ" },
] as const;

export const FEATURE_STRIP_ITEMS = [
  {
    iconName: "ShieldCheck",
    title: "Tổ chức được xác thực",
    desc: "Kiểm duyệt pháp lý nghiêm ngặt các tổ chức, hội từ thiện trước khi phát động chiến dịch.",
  },
  {
    iconName: "Package",
    title: "Mã vận đơn Tracking ID",
    desc: "Cấp mã tra cứu duy nhất cho từng lượt đóng góp hiện vật của nhà hảo tâm.",
  },
  {
    iconName: "Layers",
    title: "Truy vết cấp Lô hàng",
    desc: "Chuỗi vật lý khép kín: Hiện vật → Lô hàng (Batch) → Chuyến xe → Điểm phát → Bằng chứng.",
  },
  {
    iconName: "Clock",
    title: "Dòng thời gian công khai",
    desc: "Kiểm toán minh bạch: ai bàn giao, lúc nào, số lượng bao nhiêu kèm hình ảnh đối soát.",
  },
];

export const WORKFLOW_STEPS = [
  { step: "01", title: "Phát động", desc: "Tổ chức công bố danh mục nhu yếu phẩm và định mức cần tiếp nhận." },
  { step: "02", title: "Ứng tuyển", desc: "Tình nguyện viên đăng ký tham gia các vai trò thực địa cụ thể." },
  { step: "03", title: "Đóng góp", desc: "Nhà hảo tâm cam kết gửi hiện vật và nhận ngay mã Tracking ID tra cứu." },
  { step: "04", title: "Kiểm kho", desc: "Thủ kho nhập kho, đối soát số liệu và đóng gói thành các lô hàng (Batch)." },
  { step: "05", title: "Điều phối", desc: "Trưởng đoàn dẫn chuyến xe phân phối và ghi nhận phát quà tại điểm thôn xóm." },
  { step: "06", title: "Công khai", desc: "Đăng tải ảnh bằng chứng nghiệm thu đã làm mờ/bảo vệ quyền riêng tư người nhận." },
];

export const STATUS_CONFIG: Record<string, { label: string; color: string; dotColor: string }> = {
  DRAFT: { label: "Bản nháp", color: "bg-slate-100 text-slate-700 border-slate-200", dotColor: "bg-slate-400" },
  PUBLISHED: { label: "Đang phát động", color: "bg-emerald-50 text-emerald-800 border-emerald-200", dotColor: "bg-emerald-500" },
  CLOSED: { label: "Đã đóng tiếp nhận", color: "bg-blue-50 text-blue-800 border-blue-200", dotColor: "bg-blue-500" },
  COMPLETED: { label: "Đã hoàn thành", color: "bg-teal-50 text-teal-800 border-teal-200", dotColor: "bg-teal-600" },
  CANCELLED: { label: "Đã hủy", color: "bg-rose-50 text-rose-800 border-rose-200", dotColor: "bg-rose-500" },
  REJECTED: { label: "Từ chối", color: "bg-rose-50 text-rose-800 border-rose-200", dotColor: "bg-rose-500" },
  PENDING: { label: "Chờ duyệt", color: "bg-amber-50 text-amber-800 border-amber-200", dotColor: "bg-amber-500" },
  PREPARING: { label: "Đang chuẩn bị", color: "bg-amber-50 text-amber-800 border-amber-200", dotColor: "bg-amber-500" },
  IN_TRANSIT: { label: "Đang vận chuyển", color: "bg-sky-50 text-sky-800 border-sky-200", dotColor: "bg-sky-500" },
  ARRIVED: { label: "Đã đến điểm nhận", color: "bg-indigo-50 text-indigo-800 border-indigo-200", dotColor: "bg-indigo-500" },
  DISTRIBUTED: { label: "Đã trao tặng", color: "bg-emerald-50 text-emerald-800 border-emerald-200", dotColor: "bg-emerald-600" },
  SKIPPED: { label: "Bỏ qua", color: "bg-slate-100 text-slate-600 border-slate-200", dotColor: "bg-slate-400" },
  RECEIVED: { label: "Đã nhập kho", color: "bg-teal-50 text-teal-800 border-teal-200", dotColor: "bg-teal-500" },
  IN_BATCH: { label: "Đã gom vào lô", color: "bg-purple-50 text-purple-800 border-purple-200", dotColor: "bg-purple-500" },
  READY: { label: "Sẵn sàng xuất phát", color: "bg-emerald-50 text-emerald-800 border-emerald-200", dotColor: "bg-emerald-500" },
  ASSIGNED: { label: "Đã gán chuyến xe", color: "bg-sky-50 text-sky-800 border-sky-200", dotColor: "bg-sky-500" },
};
