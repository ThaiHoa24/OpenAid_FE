import type { Metadata } from "next";
import "@/styles/globals.css";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "OpenAid – Hệ Thống Điều Phối Cứu Trợ Hiện Vật & Tình Nguyện Viên Minh Bạch",
  description:
    "Nền tảng số điều phối minh bạch kết nối tổ chức từ thiện, nhà hảo tâm và tình nguyện viên với khả năng truy vết cấp Lô hàng (Batch).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased bg-[#FAF9F6] text-[#1C2B24] min-h-screen flex flex-col font-sans">
        <LanguageProvider>
          <ToastProvider>
            <AuthProvider>
              <AppShell>{children}</AppShell>
            </AuthProvider>
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
