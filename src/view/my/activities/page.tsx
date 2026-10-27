"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  QrCode,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { volunteerService } from "@/services";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function MyActivitiesPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrModal, setQrModal] = useState<any>(null);

  useEffect(() => {
    if (user) {
      volunteerService.getByUser(user.id).then((res: any[]) => {
        setApplications(res);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleCheckInToggle = (appId: string) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          const checkedIn = !app.checkedInAt;
          return {
            ...app,
            checkedInAt: checkedIn ? new Date().toISOString() : undefined,
          };
        }
        return app;
      })
    );
  };

  return (
    <RoleGuard allowedRoles={["user"]}>
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#1F4D36]">
          <UserCheck className="w-3.5 h-3.5" />
          <span>Khu Vực Cá Nhân</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#1C2B24] tracking-tight mt-1">
          Hoạt Động Tình Nguyện Của Tôi
        </h1>
        <p className="text-sm text-[#5F6F66]">
          Theo dõi trạng thái duyệt đơn, vị trí thực địa và điểm danh mã QR tại hiện trường.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-sm font-semibold text-[#5F6F66]">
          Đang tải danh sách hoạt động...
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white p-16 text-center rounded-3xl border border-[#E5E7E0] space-y-4">
          <p className="text-[#5F6F66] text-sm">
            Bạn chưa đăng ký tham gia chiến dịch thiện nguyện nào.
          </p>
          <Button href="/events" variant="primary">
            Khám phá chiến dịch đang phát động
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-3xl p-6 border border-[#E5E7E0] shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#5F6F66]">
                    ĐƠN-{app.id.substring(0, 8)}
                  </span>
                  <Badge status={app.status} />
                </div>

                <div>
                  <h3 className="font-bold text-base text-[#1C2B24] line-clamp-1">
                    {app.event?.title || "Chiến dịch cứu trợ"}
                  </h3>
                  <p className="text-xs font-semibold text-[#1F4D36] mt-0.5">
                    Vị trí: {app.role?.name || "Tình nguyện viên chung"}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-[#5F6F66]">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{app.event?.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{new Date(app.createdAt).toLocaleDateString("vi-VN")}</span>
                  </div>
                </div>
              </div>

              {/* Action: QR Check-in */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setQrModal(app)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#1C2B24] transition cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5 text-[#1F4D36]" />
                  <span>Mã QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCheckInToggle(app.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                    app.checkedInAt
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-[#1F4D36] text-white hover:bg-[#133724]"
                  }`}
                >
                  {app.checkedInAt ? "Đã điểm danh ✓" : "Điểm danh"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Modal */}
      {qrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4">
            <h3 className="text-base font-bold text-[#1C2B24]">
              Mã QR Điểm Danh Tình Nguyện Viên
            </h3>
            <div className="w-48 h-48 bg-slate-100 border-2 border-dashed border-[#1F4D36] rounded-2xl mx-auto flex items-center justify-center">
              <QrCode className="w-32 h-32 text-[#1F4D36]" />
            </div>
            <p className="text-xs text-[#5F6F66]">
              Xuất trình mã này cho Trưởng đoàn hoặc Điều phối viên tại điểm tập kết để xác thực có mặt.
            </p>
            <Button onClick={() => setQrModal(null)} variant="secondary" size="sm" className="w-full">
              Đóng
            </Button>
          </div>
        </div>
      )}
    </div>
    </RoleGuard>
  );
}
