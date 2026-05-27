import { useState } from "react";
import { Users, ShieldAlert, Car } from "lucide-react";
import AdminReportsPanel from "../pages/administrador/AdminReportPanel";
import AdminUsersPanel from "../pages/administrador/AdminUsersPanel";
import AdminAdsPanel from "../pages/administrador/AdminAdsPanel";
import { useTranslation } from "react-i18next";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"reports" | "users" | "ads">(
    "reports",
  );

  const tabs = [
    {
      id: "reports",
      label: t("admin_panel.reports_tab", "Reportes"),
      icon: <ShieldAlert size={20} />,
    },
    {
      id: "users",
      label: t("admin_panel.users_tab", "Usuarios"),
      icon: <Users size={20} />,
    },
    {
      id: "ads",
      label: t("admin_panel.ads_tab", "Anuncios"),
      icon: <Car size={20} />,
    },
  ] as const;

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-black uppercase mb-8 flex items-center gap-3">
          <div className="bg-red-600 p-2 rounded-lg">
            <ShieldAlert size={28} />
          </div>
          {t("admin_panel.title", "Panel de Moderación")}
        </h1>

        {/* Selector de Pestañas */}
        <div className="flex gap-2 mb-8 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold uppercase text-xs transition-all ${
                activeTab === tab.id
                  ? "bg-white text-black shadow-lg"
                  : "text-zinc-500 hover:text-white hover:bg-zinc-800"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="animate-in fade-in duration-500">
          {activeTab === "reports" && <AdminReportsPanel />}
          {activeTab === "users" && <AdminUsersPanel />}
          {activeTab === "ads" && <AdminAdsPanel />}
        </div>
      </div>
    </div>
  );
}
