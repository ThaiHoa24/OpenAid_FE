"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, Users, Truck, Clock } from "lucide-react";
import { eventService } from "@/services/eventService";

export function StatsBar() {
  const [stats, setStats] = useState({
    totalEvents: 18,
    totalVolunteers: 1250,
    totalDonations: 8400,
    totalDistributedKg: 38500,
  });

  useEffect(() => {
    let isMounted = true;
    eventService
      .getAll({ status: "PUBLISHED" })
      .then((events) => {
        if (!isMounted) return;
        if (Array.isArray(events) && events.length > 0) {
          setStats((prev) => ({
            ...prev,
            totalEvents: events.length,
          }));
        }
      })
      .catch(() => {
        // Fallback to baseline default display values
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Boxed Stats Floor with High Elevation & Glass Accents */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl py-5 px-6 sm:py-6 sm:px-8 border border-[#E5E7E0] shadow-card hover:shadow-hover transition-all duration-300">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          {/* Stat 1: 100% Traceability */}
          <div className="flex items-center gap-3.5 group pt-3 lg:pt-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0B3B24] to-[#185535] text-[#4ADE80] border border-emerald-500/25 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-subtle">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#1C2B24] tracking-tight leading-none">
                100%
              </p>
              <p className="text-xs font-bold text-[#1F4D36] leading-tight mt-1">
                Cấp mã Tracking ID
              </p>
              <p className="text-[11px] text-[#5F6F66]">Truy vết nguồn gốc cấp lô</p>
            </div>
          </div>

          {/* Stat 2: Total Volunteers */}
          <div className="flex items-center gap-3.5 group pt-3 lg:pt-0 lg:pl-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0B3B24] to-[#185535] text-[#4ADE80] border border-emerald-500/25 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-subtle">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#1C2B24] tracking-tight leading-none">
                {stats.totalVolunteers.toLocaleString()}+
              </p>
              <p className="text-xs font-bold text-[#1F4D36] leading-tight mt-1">
                Tình nguyện viên
              </p>
              <p className="text-[11px] text-[#5F6F66]">Sẵn sàng tiếp ứng thực địa</p>
            </div>
          </div>

          {/* Stat 3: Total Deliveries / Kg */}
          <div className="flex items-center gap-3.5 group pt-3 lg:pt-0 lg:pl-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0B3B24] to-[#185535] text-[#4ADE80] border border-emerald-500/25 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-subtle">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#1C2B24] tracking-tight leading-none">
                {(stats.totalDistributedKg / 1000).toFixed(1)}k+
              </p>
              <p className="text-xs font-bold text-[#1F4D36] leading-tight mt-1">
                Kg hàng cứu trợ
              </p>
              <p className="text-[11px] text-[#5F6F66]">Đã bàn giao tại thôn bản</p>
            </div>
          </div>

          {/* Stat 4: 24/7 Transparency */}
          <div className="flex items-center gap-3.5 group pt-3 lg:pt-0 lg:pl-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0B3B24] to-[#185535] text-[#4ADE80] border border-emerald-500/25 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-subtle">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#1C2B24] tracking-tight leading-none">
                24/7
              </p>
              <p className="text-xs font-bold text-[#1F4D36] leading-tight mt-1">
                Đối soát công khai
              </p>
              <p className="text-[11px] text-[#5F6F66]">Tra cứu không cần tài khoản</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
