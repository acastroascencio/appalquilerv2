import { useApp } from "../../context/AppContext";
import {
  LayoutDashboard,
  Building2,
  Users,
  Settings,
  Building,
  Zap,
} from "lucide-react";

export default function Sidebar() {
  const { activePage, setActivePage, setSelectedInquilinoId } = useApp();

  const menuItems = [
    { id: "dashboard", label: "Inicio", desktopLabel: "Resumen", icon: LayoutDashboard },
    { id: "departamentos", label: "Inmuebles", desktopLabel: "Departamentos", icon: Building2 },
    { id: "inquilinos", label: "Inquilinos", desktopLabel: "Inquilinos", icon: Users },
    { id: "consumo", label: "Consumo", desktopLabel: "Registrar consumo", icon: Zap },
    { id: "configuracion", label: "Ajustes", desktopLabel: "Configuracion", icon: Settings },
  ];

  const handleNavigation = (pageId) => {
    setSelectedInquilinoId(null);
    setActivePage(pageId);
  };

  const renderItem = (item, mode) => {
    const Icon = item.icon;
    const isActive = activePage === item.id;

    if (mode === "mobile") {
      return (
        <button
          key={item.id}
          type="button"
          onClick={() => handleNavigation(item.id)}
          className={`flex min-h-[70px] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-center text-[12px] font-extrabold leading-tight transition-colors ${
            isActive
              ? "bg-blue-700 text-white shadow-sm shadow-blue-950/20 dark:bg-blue-500 dark:text-slate-950"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
          aria-current={isActive ? "page" : undefined}
        >
          <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
          <span className="block max-w-full leading-tight">{item.label}</span>
        </button>
      );
    }

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => handleNavigation(item.id)}
        className={`flex min-h-14 w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-base font-extrabold transition-all duration-200 ${
          isActive
            ? "bg-blue-700 text-white shadow-md shadow-blue-950/20 dark:bg-blue-500 dark:text-slate-950"
            : "text-slate-300 hover:bg-slate-800 hover:text-white"
        }`}
        aria-current={isActive ? "page" : undefined}
      >
        <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
        <span>{item.desktopLabel}</span>
      </button>
    );
  };

  return (
    <>
      <aside className="hidden min-h-screen w-72 shrink-0 flex-col bg-slate-950 text-white shadow-xl lg:flex">
        <div className="flex items-center gap-3 border-b border-slate-800 p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white shadow-md dark:bg-blue-500 dark:text-slate-950">
            <Building className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold leading-tight tracking-wide">AlquilerApp</h1>
            <span className="text-sm font-semibold text-slate-400">Gestion de inmuebles</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6" aria-label="Navegacion principal">
          {menuItems.map((item) => renderItem(item, "desktop"))}
        </nav>

        <div className="border-t border-slate-800 p-4 text-center">
          <p className="text-xs font-semibold text-slate-500">v2.0.0 · Admin</p>
        </div>
      </aside>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid min-h-[86px] grid-cols-5 gap-1 border-t border-slate-200 bg-white/95 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-2xl backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 lg:hidden"
        aria-label="Navegacion principal movil"
      >
        {menuItems.map((item) => renderItem(item, "mobile"))}
      </nav>
    </>
  );
}
