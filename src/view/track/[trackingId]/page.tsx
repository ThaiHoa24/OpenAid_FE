"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  Package,
  Layers,
  Truck,
  MapPin,
  Clock,
  ShieldCheck,
  ArrowLeft,
  Calendar,
  Building2,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
} from "lucide-react";
import { transparencyService } from "@/services/transparencyService";
import type { PublicTrackingResult } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { APP_CONFIG } from "@/lib/constants";

export default function TrackingDetailPage({
  params,
}: {
  params: Promise<{ trackingId: string }>;
}) {
  const resolvedParams = use(params);
  const trackingId = resolvedParams.trackingId;

  const [data, setData] = useState<PublicTrackingResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<{
    imageUrl: string;
    caption: string;
    distributionPointName: string;
  } | null>(null);

  useEffect(() => {
    transparencyService.trackByTrackingId(trackingId).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [trackingId]);

  if (loading) {
    return (
      <div className="max-w-[1240px] mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#1F4D36] border-t-transparent animate-spin mx-auto" />
        <p className="text-sm font-semibold text-[#5F6F66]">
          Đang tải dữ liệu kiểm toán cho mã {trackingId}...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-[1240px] mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#1C2B24]">
          Không Tìm Thấy Mã Vận Đơn
        </h2>
        <p className="text-sm text-[#5F6F66] max-w-md mx-auto">
          Hệ thống không tìm thấy lượt đóng góp nào khớp với mã &quot;{trackingId}&quot;. Vui lòng kiểm tra lại mã hoặc thử một trong các mã mẫu trên hệ thống.
        </p>
        <Button href="/track" variant="primary">
          Quay lại tra cứu
        </Button>
      </div>
    );
  }

  const { donation, batch, trip, distributionPoints, publicEvidences, timeline } = data;

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/track"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#1C2B24] hover:text-[#1F4D36] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại tra cứu</span>
        </Link>
        <span className="text-xs font-mono font-bold text-[#5F6F66]">
          MÃ VẬN ĐƠN: {donation.trackingId}
        </span>
      </div>

      {/* Main Donation Summary Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#E5E7E0] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#1F4D36]">
              Hồ sơ đóng góp đã xác thực
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C2B24]">
              {donation.quantity} {donation.unit} {donation.itemType}
            </h1>
            <p className="text-xs text-[#5F6F66]">
              Chiến dịch: <span className="font-bold text-[#1C2B24]">{donation.eventTitle}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge status={donation.status} />
          </div>
        </div>

        {/* 4 Pipeline Stages (Donation -> Warehouse -> Batch -> Delivered) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1C2B24]">
              <Package className="w-4 h-4 text-[#1F4D36]" />
              <span>1. Tiếp nhận cam kết</span>
            </div>
            <p className="text-xs text-[#5F6F66]">
              {new Date(donation.createdAt).toLocaleDateString("vi-VN")}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1C2B24]">
              <Building2 className="w-4 h-4 text-[#1F4D36]" />
              <span>2. Tổ chức phụ trách</span>
            </div>
            <p className="text-xs text-[#5F6F66] truncate">
              {donation.organizationName}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1C2B24]">
              <Layers className="w-4 h-4 text-[#1F4D36]" />
              <span>3. Mã Lô hàng (Batch)</span>
            </div>
            <p className="text-xs text-[#5F6F66] font-mono font-bold">
              {batch ? batch.batchCode : "Chờ đóng gói"}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1C2B24]">
              <Truck className="w-4 h-4 text-[#1F4D36]" />
              <span>4. Chuyến xe phân phối</span>
            </div>
            <p className="text-xs text-[#5F6F66] font-mono font-bold">
              {trip ? trip.tripCode : "Chờ điều phối"}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Left Column Distribution Points & Evidence | Right Column Vertical Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Columns: Points & Evidence */}
        <div className="lg:col-span-7 space-y-8">
          {/* Distribution Points */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7E0] shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1C2B24] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#1F4D36]" />
                <span>Điểm trao quà thực địa</span>
              </h3>
              <span className="text-xs text-[#5F6F66]">
                {distributionPoints.length} điểm trong lộ trình
              </span>
            </div>

            {distributionPoints.length === 0 ? (
              <p className="text-xs text-[#5F6F66]">
                Chưa có điểm trao quà nào được kích hoạt cho lô hàng này.
              </p>
            ) : (
              <div className="space-y-4">
                {distributionPoints.map((pt) => (
                  <div
                    key={pt.id}
                    className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E5E7E0] space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#1F4D36] text-white flex items-center justify-center text-xs font-bold">
                          {pt.order}
                        </span>
                        <h4 className="font-bold text-sm text-[#1C2B24]">
                          {pt.name}
                        </h4>
                      </div>
                      <Badge status={pt.status} />
                    </div>
                    <p className="text-xs text-[#5F6F66] pl-8">{pt.address}</p>
                    {pt.records.length > 0 && (
                      <div className="pl-8 pt-1 text-[11px] font-semibold text-[#1F4D36]">
                        Đã bàn giao: {pt.records.map((r) => `${r.distributedQuantity} ${r.unit}`).join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Verified Evidence Photos */}
          {publicEvidences.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7E0] shadow-xs space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#1C2B24] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Hình ảnh bằng chứng thực địa</span>
                </h3>
                <p className="text-xs text-[#5F6F66] mt-1">
                  Hình ảnh đã được ban điều phối kiểm duyệt đối soát và tuân thủ chính sách bảo vệ nhân phẩm người nhận.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {publicEvidences.map((ev, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedPhoto(ev)}
                    className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 cursor-pointer border border-[#E5E7E0]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ev.imageUrl}
                      alt={ev.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                      <Eye className="w-5 h-5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 5 Columns: Vertical Transparency Timeline */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7E0] shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-lg font-bold text-[#1C2B24] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#1F4D36]" />
              <span>Dòng thời gian minh bạch</span>
            </h3>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Bất biến
            </span>
          </div>

          <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5E7E0]">
            {timeline.map((log) => (
              <div key={log.id} className="relative space-y-1 text-xs">
                {/* Timeline dot */}
                <span className="absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white bg-[#1F4D36] shadow-xs" />

                <div className="flex items-center justify-between text-[#5F6F66]">
                  <span className="font-bold text-[#1C2B24]">{log.action}</span>
                  <span className="text-[10px] font-mono">
                    {new Date(log.timestamp).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <p className="text-[#5F6F66] leading-relaxed">{log.description}</p>

                <div className="flex items-center gap-2 pt-0.5 text-[10px] text-[#5F6F66]/80">
                  <span className="font-semibold text-[#1F4D36]">{log.actorRole}</span>
                  <span>•</span>
                  <span>{new Date(log.timestamp).toLocaleDateString("vi-VN")}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Privacy Notice Box */}
          <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E5E7E0] text-[11px] text-[#5F6F66] space-y-1">
            <p className="font-bold text-[#1C2B24]">Truy vết cấp Lô hàng (Batch-Level)</p>
            <p>
              Để bảo vệ quyền riêng tư và danh dự của người nhận quà, tên cá nhân và địa chỉ nhà chi tiết không hiển thị trên bảng tra cứu công khai.
            </p>
          </div>
        </div>
      </div>

      {/* Modal for viewing clicked evidence photo */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl space-y-4 p-4">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-bold text-[#1F4D36]">
                {selectedPhoto.distributionPointName}
              </span>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="p-1 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedPhoto.imageUrl}
              alt={selectedPhoto.caption}
              className="w-full rounded-2xl max-h-[350px] object-cover"
            />
            <p className="text-xs text-[#5F6F66] px-1">{selectedPhoto.caption}</p>
          </div>
        </div>
      )}
    </div>
  );
}
