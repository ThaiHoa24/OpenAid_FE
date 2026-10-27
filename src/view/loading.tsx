export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-2 text-slate-500">
        <span className="w-5 h-5 block animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        <span className="text-sm font-medium">Đang tải...</span>
      </div>
    </div>
  );
}
