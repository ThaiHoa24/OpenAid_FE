"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <h2 className="text-xl font-bold text-slate-800 mb-2">Đã xảy ra lỗi!</h2>
      <p className="text-slate-500 mb-4 text-sm">{error.message || "Không thể tải trang."}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition"
      >
        Thử lại
      </button>
    </div>
  );
}
