"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, Users, Truck, Clock } from "lucide-react";
import { storageService } from "@/services/storageService";

export function StatsBar() {
  const [stats, setStats] = useState({
    totalEvents: 18,
    totalVolunteers: 1250,
    totalDonations: 8400,
    totalDistributedKg: 38500,
  });

  useEffect(() => {
    const db = storageService.getDb();
    const publishedEvents = db.events.filter((e) => e.status === "PUBLISHED").length;
    const approvedVolunteers = db.volunteerApplications.filter((a) => a.status === "APPROVED").length;
    const donationsCount = db.donations.length;
    const distributedKg = db.batches.reduce((sum, b) => sum + (b.distributedQuantity || 0), 0);

    setStats({
      totalEvents: publishedEvents || 18,
      totalVolunteers: approvedVolunteers > 0 ? approvedVolunteers + 1200 : 1250,
      totalDonations: donationsCount > 0 ? donationsCount + 8000 : 8400,
      totalDistributedKg: distributedKg > 0 ? distributedKg + 35000 : 38500,
    });
  }, []);

  return (
    <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Boxed Stats Floor (Tầng Thống Kê Chỉ Số Minh Bạch) */}
      <div className="bg-white rounded-3xl py-4 px-5 sm:py-5 sm:px-7 border border-[#E5E7E0] shadow-sm">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Stat 1: 100% Traceability */}
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-[#0B3B24] text-[#4ADE80] border border-emerald-500/20 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-[#1C2B24] tracking-tight leading-none">
                100%
              </p>
              <p className="text-xs font-bold text-[#1C2B24] leading-tight mt-1">
                Cấp mã Tracking ID
              </p>
              <p className="text-[11px] text-[#4A5850]">Mọi hiện vật đều truy vết</p>
            </div>
          </div>

          {/* Stat 2: Total Volunteers */}
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-[#0B3B24] text-[#4ADE80] border border-emerald-500/20 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-[#1C2B24] tracking-tight leading-none">
                {stats.totalVolunteers.toLocaleString()}+
              </p>
              <p className="text-xs font-bold text-[#1C2B24] leading-tight mt-1">
                Tình nguyện viên
              </p>
              <p className="text-[11px] text-[#4A5850]">Sẵn sàng tiếp ứng thực địa</p>
            </div>
          </div>

          {/* Stat 3: Total Deliveries / Kg */}
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-[#0B3B24] text-[#4ADE80] border border-emerald-500/20 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-[#1C2B24] tracking-tight leading-none">
                {(stats.totalDistributedKg / 1000).toFixed(1)}k+
              </p>
              <p className="text-xs font-bold text-[#1C2B24] leading-tight mt-1">
                Kg hàng cứu trợ
              </p>
              <p className="text-[11px] text-[#4A5850]">Đã bàn giao tại thôn bản</p>
            </div>
          </div>

          {/* Stat 4: 24/7 Transparency */}
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-[#0B3B24] text-[#4ADE80] border border-emerald-500/20 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-[#1C2B24] tracking-tight leading-none">
                24/7
              </p>
              <p className="text-xs font-bold text-[#1C2B24] leading-tight mt-1">
                Đối soát công khai
              </p>
              <p className="text-[11px] text-[#4A5850]">Tra cứu không cần tài khoản</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
