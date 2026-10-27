import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "@/styles/globals.css";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { AppShell } from "@/components/layout/AppShell";

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

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
    <html lang="vi" className={`${jakartaSans.variable} ${inter.variable}`}>
      <body className="antialiased bg-[#FAF9F6] text-[#1C2B24] min-h-screen flex flex-col font-sans selection:bg-[#F28C1B]/20 selection:text-[#1F4D36]">
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
