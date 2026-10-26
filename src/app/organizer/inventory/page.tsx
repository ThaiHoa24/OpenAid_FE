"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/ToastProvider";
import { useTranslation } from "@/hooks/useTranslation";
import { inventoryService, type EnrichedInventoryItem } from "@/services/inventoryService";
import { eventService, type EnrichedEvent } from "@/services/eventService";
import { 
  Building2, ShieldCheck, AlertTriangle, CheckCircle2, 
  Layers, Package, Filter, Loader2, ArrowRight, HelpCircle 
} from "lucide-react";

export default function OrganizerInventoryPage() {
  const { user, activeOrganization, isOrganizer, loginAsDemo } = useAuth();
  const { showToast } = useToast();
  const { t, formatDate } = useTranslation();

  const [inventory, setInventory] = useState<EnrichedInventoryItem[]>([]);
  const [events, setEvents] = useState<EnrichedEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!activeOrganization) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [inv, evs] = await Promise.all([
        inventoryService.getByOrganization(activeOrganization.id),
        eventService.getAll({ organizationId: activeOrganization.id, includeDrafts: true }),
      ]);
      setInventory(inv);
      setEvents(evs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganization]);

  useEffect(() => {
    loadData();

    const handleDataChange = () => loadData();
    window.addEventListener("openaid-db-changed", handleDataChange);
    return () => window.removeEventListener("openaid-db-changed", handleDataChange);
  }, [loadData]);

  if (!user || (!isOrganizer && user.systemRole !== "ADMIN")) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">{t("organizer.dashboard.accessDenied")}</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          {t("organizer.dashboard.accessDeniedDesc")}
        </p>
        <button
          onClick={() => loginAsDemo("organizer@openaid.demo")}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          {t("organizer.dashboard.loginAsOrganizerBtn")}
        </button>
      </div>
    );
  }

  const filteredInventory = inventory.filter((item) => {
    if (selectedEventId !== "ALL" && item.eventId !== selectedEventId) return false;
    return true;
  });

  const allValid = filteredInventory.every((i) => i.isEquationValid);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-emerald-600" />
            {t("organizer.inventory.title")}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {t("organizer.inventory.subtitle", { org: activeOrganization?.name || "Da Nang Fund" })}
          </p>
        </div>

        {/* Filter by Event dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          >
            <option value="ALL">{t("organizer.inventory.filterAllEvents")} ({events.length})</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* NFR05 Conservation Equation Banner */}
      <div className={`rounded-3xl p-6 border shadow-sm ${allValid ? "bg-emerald-50/70 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${allValid ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
              {allValid ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <div>
              <h3 className={`text-sm font-bold ${allValid ? "text-emerald-950" : "text-rose-950"}`}>
                {allValid ? t("organizer.inventory.nfr05ValidTitle") : t("organizer.inventory.nfr05InvalidTitle")}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {t("organizer.inventory.formulaDesc")} <code className="bg-white/80 px-2 py-0.5 rounded font-mono font-bold text-slate-800">{t("organizer.inventory.formulaCode")}</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${allValid ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-rose-100 text-rose-800 border-rose-300"}`}>
              {allValid ? t("organizer.inventory.balanceBadgeValid") : t("organizer.inventory.balanceBadgeInvalid")}
            </span>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      {isLoading ? (
        <div className="py-16 flex justify-center items-center text-slate-500 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          <span className="text-xs">{t("common.loading")}</span>
        </div>
      ) : filteredInventory.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">{t("organizer.inventory.tableItemUnit")}</th>
                  <th className="py-3.5 px-4">{t("organizer.inventory.tableCampaign")}</th>
                  <th className="py-3.5 px-4 text-right">{t("organizer.inventory.tableReceived")}</th>
                  <th className="py-3.5 px-4 text-right text-emerald-700">{t("organizer.inventory.tableAvailable")}</th>
                  <th className="py-3.5 px-4 text-right text-purple-700">{t("organizer.inventory.tableReserved")}</th>
                  <th className="py-3.5 px-4 text-right text-sky-700">{t("organizer.inventory.tableDistributed")}</th>
                  <th className="py-3.5 px-4 text-right text-rose-700">{t("organizer.inventory.tableLost")}</th>
                  <th className="py-3.5 px-4 text-center">{t("organizer.inventory.tableAudit")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 text-sm">{item.itemType}</div>
                      <div className="text-[11px] text-slate-400">{t("organizer.inventory.unitLabel")} {item.unit}</div>
                    </td>
                    <td className="py-4 px-4 max-w-xs">
                      <Link href={`/events/${item.eventId}`} className="text-emerald-700 hover:underline line-clamp-1 font-semibold">
                        {item.event?.title || "Campaign"}
                      </Link>
                      <div className="text-[11px] text-slate-400">
                        {t("organizer.inventory.updatedLabel")} {formatDate(item.updatedAt)}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-slate-900">
                      {item.received} {item.unit}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-emerald-600">
                      {item.available} {item.unit}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-purple-600">
                      {item.reserved} {item.unit}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-sky-600">
                      {item.distributed} {item.unit}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-rose-600">
                      {item.lostWrittenOff} {item.unit}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {item.isEquationValid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {t("organizer.inventory.auditExact")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {t("organizer.inventory.auditMismatch")}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200">
          <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">{t("organizer.inventory.noInventoryRecords")}</h3>
          <p className="text-xs text-slate-500 mt-1">
            {t("organizer.inventory.noInventoryDesc")}
          </p>
        </div>
      )}
    </div>
  );
}
