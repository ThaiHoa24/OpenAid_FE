"use client";

import React from "react";
import Link from "next/link";
import {
  HeartHandshake,
  ShieldCheck,
  Package,
  Truck,
  FileCheck2,
  Users,
  Layers,
  Search,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Heart,
  Calendar,
  Eye,
} from "lucide-react";
import { WORKFLOW_STEPS } from "@/lib/constants";

export default function HowItWorksPage() {
  const detailedSteps = [
    {
      num: "01",
      title: "Phát Động Chiến Dịch & Định Mức Nhu Cầu",
      subtitle: "Khảo sát thực tế • Minh bạch chỉ tiêu",
      desc: "Tổ chức cứu trợ sau khi xác thực pháp lý sẽ khảo sát thực địa tại các xã, thôn vùng thiên tai để đưa ra danh mục hiện vật thiết yếu (gạo, nước sạch, thuốc men, áo ấm...) kèm số lượng định mức cụ thể, tránh tình trạng dư thừa hoặc cứu trợ tự phát.",
      icon: Calendar,
      role: "Ban tổ chức",
      color: "from-emerald-600 to-teal-700",
      highlight: "Có khảo sát thực tế & hạn mức rõ ràng",
    },
    {
      num: "02",
      title: "Tuyển Chọn & Phân Phối Tình Nguyện Viên",
      subtitle: "Ghi danh minh bạch • Điểm danh mã QR",
      desc: "Tình nguyện viên đăng ký vào từng vị trí rõ ràng: thủ kho tiếp nhận, hậu cần đóng gói, tài xế vượt lũ, điều phối thực địa. Mỗi bạn có mã QR định danh phục vụ chấm công và tích lũy chứng nhận thiện nguyện.",
      icon: Users,
      role: "Tình nguyện viên",
      color: "from-teal-600 to-emerald-700",
      highlight: "Chấm công bằng QR • Hồ sơ số hóa",
    },
    {
      num: "03",
      title: "Cam Kết Hiện Vật & Cấp Mã Tracking ID",
      subtitle: "Phi tài chính • Cấp mã tra cứu duy nhất",
      desc: "Nhà hảo tâm chọn loại hàng và số lượng cam kết gửi về kho tập kết. Ngay lập tức, hệ thống cấp một mã Tracking ID độc nhất (ví dụ DON-2026-7K3Q9X) để nhà hảo tâm theo dõi trạng thái kiện hàng từ lúc gửi đến lúc phát.",
      icon: Package,
      role: "Nhà hảo tâm",
      color: "from-[#F28C1B] to-[#D9740F]",
      highlight: "Không giữ tiền mặt • 100% Hiện vật",
    },
    {
      num: "04",
      title: "Nhập Kho, Cân Đối & Gom Lô Hàng (Batch)",
      subtitle: "Sổ cái điện tử • Niêm phong kiện hàng",
      desc: "Hàng đến kho được thủ kho cân đo, kiểm đếm chất lượng và nhập vào Sổ cái kho bãi số hóa. Các hiện vật lẻ được đóng gói thành các Lô hàng (Batch) lớn có niêm phong để chuẩn bị vận chuyển an toàn.",
      icon: Layers,
      role: "Thủ kho & Hậu cần",
      color: "from-blue-600 to-indigo-700",
      highlight: "Quản lý truy vết cấp Lô hàng bất biến",
    },
    {
      num: "05",
      title: "Chuyến Xe Vận Chuyển & Phân Phát Thôn Bản",
      subtitle: "Lộ trình thực tế • Bàn giao tận tay",
      desc: "Các Lô hàng được xếp lên xe tải chuyên dụng có đăng ký hành trình. Đội xe cùng điều phối viên đưa hàng đến từng nhà văn hóa thôn, điểm trường hoặc trao trực tiếp cho các hộ dân chịu ảnh hưởng lũ lụt, sạt lở.",
      icon: Truck,
      role: "Đội xe & Thực địa",
      color: "from-amber-600 to-orange-700",
      highlight: "Bàn giao có xác nhận của địa phương",
    },
    {
      num: "06",
      title: "Biên Bản Đối Soát & Dòng Thời Gian Công Khai",
      subtitle: "Hình ảnh nghiệm thu • Tôn trọng quyền riêng tư",
      desc: "Biên bản bàn giao có chữ ký chính quyền địa phương và hình ảnh trao quà thực tế được tải lên hệ thống. Khuôn mặt người nhận được làm mờ để bảo vệ phẩm giá, trong khi toàn bộ số liệu được kiểm toán công khai.",
      icon: FileCheck2,
      role: "Kiểm toán cộng đồng",
      color: "from-[#1F4D36] to-[#143D29]",
      highlight: "Công khai 100% hình ảnh & biên bản",
    },
  ];

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 sm:space-y-16">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1F4D36] via-[#143D29] to-[#0E2C1D] rounded-3xl sm:rounded-[32px] p-6 sm:p-10 lg:p-12 text-white shadow-card border border-emerald-900/40">
        {/* Decorative background glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F28C1B]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4 sm:space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[#F28C1B] text-xs font-bold tracking-wide">
            <Sparkles className="w-4 h-4 text-[#F28C1B]" />
            <span>QUY TRÌNH MINH BẠCH KHÉP KÍN 100% HIỆN VẬT</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight sm:leading-snug">
            Từ Hiện Vật Đóng Góp Đến Tận Tay Đồng Bào Vùng Lũ
          </h1>

          <p className="text-sm sm:text-base text-gray-200/90 leading-relaxed max-w-2xl">
            OpenAid giải quyết bài toán cốt lõi của thiện nguyện truyền thống: <strong className="text-white">Lo ngại thất thoát và thiếu minh bạch</strong>. Bằng chuỗi truy vết Lô hàng (Batch Traceability) và nhật ký hình ảnh thực địa, mọi người đều có thể kiểm tra hành trình món quà của mình.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              href="/track"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F28C1B] hover:bg-[#D9740F] text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              <Search className="w-4 h-4" />
              <span>Tra cứu thử một mã vận đơn</span>
            </Link>

            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all hover:-translate-y-0.5"
            >
              <span>Xem các chiến dịch đang tiếp nhận</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Core Pillars Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-[#E5E7E0] shadow-2xs hover:shadow-subtle transition-all space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#F28C1B] flex items-center justify-center border border-amber-200/60 font-bold">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <h3 className="font-bold text-sm text-[#1C2B24]">Không Giữ Tiền Mặt</h3>
          <p className="text-xs text-[#5F6F66] leading-relaxed">
            Hệ thống hoàn toàn phi tài chính. Toàn bộ chuỗi vận hành chỉ tiếp nhận và luân chuyển nhu yếu phẩm thực tế.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#E5E7E0] shadow-2xs hover:shadow-subtle transition-all space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#1F4D36] flex items-center justify-center border border-emerald-200/60 font-bold">
            <Package className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#1C2B24]">Mã Tracking Bất Biến</h3>
          <p className="text-xs text-[#5F6F66] leading-relaxed">
            Mỗi lượt gửi hàng đều mang một mã ID riêng biệt, liên kết trực tiếp vào sổ cái lô hàng xuất kho.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#E5E7E0] shadow-2xs hover:shadow-subtle transition-all space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center border border-teal-200/60 font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#1C2B24]">Truy Vết Cấp Lô Hàng</h3>
          <p className="text-xs text-[#5F6F66] leading-relaxed">
            Gom hiện vật lẻ vào Lô hàng (Batch) niêm phong, kiểm soát trọng lượng và số lượng xuất - nhập - tồn chính xác.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#E5E7E0] shadow-2xs hover:shadow-subtle transition-all space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-800 flex items-center justify-center border border-purple-200/60 font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#1C2B24]">Hình Ảnh Đối Soát Thực Địa</h3>
          <p className="text-xs text-[#5F6F66] leading-relaxed">
            Hình ảnh phát quà và biên bản bàn giao được công khai trên dòng thời gian, bảo vệ danh tính bà con.
          </p>
        </div>
      </div>

      {/* Section: 6 Detailed Steps */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#1F4D36]">
              <span className="w-5 h-[2px] bg-[#1F4D36] inline-block" />
              <span>Chuỗi 6 Bước Vận Hành</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C2B24] tracking-tight">
              Chi Tiết Từng Giai Đoạn Điều Phối
            </h2>
          </div>
          <p className="text-xs text-[#5F6F66] max-w-md">
            Mỗi giai đoạn được phụ trách bởi các chủ thể cụ thể và được xác thực chéo qua hệ thống nhật ký điện tử.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {detailedSteps.map((step) => {
            const IconComponent = step.icon;
            return (
              <div
                key={step.num}
                className="bg-white rounded-3xl p-6 border border-[#E5E7E0] shadow-card hover:shadow-hover transition-all duration-300 flex flex-col justify-between space-y-4 group hover:-translate-y-1"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-slate-300 group-hover:text-[#F28C1B] transition-colors">
                      {step.num}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#E6EFE3] text-[#1F4D36] border border-[#1F4D36]/15">
                      {step.role}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1F4D36] to-[#143D29] text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:from-[#F28C1B] group-hover:to-[#D9740F] transition-all">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-[#1C2B24] leading-snug group-hover:text-[#1F4D36] transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-[11px] font-medium text-[#F28C1B]">
                        {step.subtitle}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-[#4A5850] leading-relaxed pt-1">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] font-semibold text-[#1F4D36]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1F4D36] shrink-0" />
                  <span>{step.highlight}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Role-Specific Perspective Cards */}
      <div className="bg-[#F4F1EA] rounded-3xl p-6 sm:p-8 border border-[#E5E7E0] space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#1F4D36]">
            <HeartHandshake className="w-4 h-4 text-[#F28C1B]" />
            <span>Phối Hợp Nhịp Nhàng 3 Bên</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1C2B24]">
            Bạn Là Ai Trong Hành Trình Này?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Persona 1 */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#F28C1B] bg-amber-50 px-2.5 py-0.5 rounded-full inline-block border border-amber-200/60">
                Nhà hảo tâm
              </span>
              <h3 className="font-bold text-sm sm:text-base text-[#1C2B24]">
                Gửi trọn niềm tin, an tâm kiểm tra
              </h3>
              <p className="text-xs text-[#5F6F66] leading-relaxed">
                Đóng góp theo đúng nhu cầu thiết thực của bà con. Bạn nhận mã vận đơn để theo dõi từng bước di chuyển của hàng hóa và xem ảnh thực địa khi hàng đến nơi.
              </p>
            </div>
            <Link
              href="/events"
              className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-[#1F4D36] hover:bg-[#163b29] text-white text-xs font-bold transition group"
            >
              <span>Xem danh sách cần hỗ trợ</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Persona 2 */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block border border-emerald-200/60">
                Tình nguyện viên
              </span>
              <h3 className="font-bold text-sm sm:text-base text-[#1C2B24]">
                Cống hiến sức trẻ với quy trình chuẩn
              </h3>
              <p className="text-xs text-[#5F6F66] leading-relaxed">
                Được phân công vai trò rõ ràng, có điểm danh QR điện tử, được bảo hiểm an toàn trong các chuyến đi và nhận chứng nhận hoạt động có xác thực.
              </p>
            </div>
            <Link
              href="/events"
              className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition group"
            >
              <span>Ứng tuyển chiến dịch</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Persona 3 */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-full inline-block border border-purple-200/60">
                Tổ chức cứu trợ
              </span>
              <h3 className="font-bold text-sm sm:text-base text-[#1C2B24]">
                Công cụ số chuyên nghiệp, giảm áp lực
              </h3>
              <p className="text-xs text-[#5F6F66] leading-relaxed">
                Hệ thống hỗ trợ quản lý kho, gom hàng thành Lô (Batch), lên lịch trình xe và báo cáo kiểm toán tự động, thay thế hoàn toàn sổ sách thủ công.
              </p>
            </div>
            <Link
              href="/organizer/dashboard"
              className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-[#1C2B24] hover:bg-black text-white text-xs font-bold transition group"
            >
              <span>Bàn điều phối Organizer</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom CTA Block */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E5E7E0] shadow-card flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl text-center sm:text-left">
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#1C2B24]">
            Bạn Đã Có Mã Vận Đơn Hiện Vật?
          </h3>
          <p className="text-xs sm:text-sm text-[#5F6F66] leading-relaxed">
            Nhập mã kiểm tra ngay hành trình hàng hóa từ lúc nhập kho tập kết đến tận điểm thôn bản.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <Link
            href="/track"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1F4D36] hover:bg-[#143D29] text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            <Search className="w-4 h-4" />
            <span>Tra cứu vận đơn ngay</span>
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-[#1C2B24] font-bold text-xs sm:text-sm transition-all"
          >
            <span>Về Sứ Mệnh OpenAid</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

