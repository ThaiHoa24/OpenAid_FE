import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <h2 className="text-3xl font-bold text-slate-800 mb-2">404</h2>
      <p className="text-slate-500 mb-6">Trang bạn tìm kiếm không tồn tại.</p>
      <Link
        href="/"
        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition"
      >
        Về trang chủ
      </Link>
    </div>
  );
}
