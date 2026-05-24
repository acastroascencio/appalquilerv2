import React from "react";
import { useApp } from "../../context/AppContext";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Settings,
  Building,
  Zap
} from "lucide-react";

export default function Sidebar() {
  const { activePage, setActivePage, setSelectedInquilinoId } = useApp();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "departamentos", label: "Departamentos", icon: Building2 },
    { id: "inquilinos", label: "Inquilinos", icon: Users },
    { id: "consumo", label: "Registrar Consumo", icon: Zap },
    { id: "configuracion", label: "Configuración", icon: Settings },
  ];

  const handleNavigation = (pageId) => {
    setSelectedInquilinoId(null); // Limpia selección al navegar
    setActivePage(pageId);
  };

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col shadow-xl">
      {/* Header / Logo */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg text-white shadow-md">
          <Building className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight tracking-wide">AlquilerApp</h1>
          <span className="text-xs text-slate-400 font-medium">Gestión de Inmuebles</span>
        </div>
      </div>

      {/* Menú de Navegación */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                isActive 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/20" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-400"}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-center">
        <p className="text-xs text-slate-500 font-medium">v2.0.0 • Premium Admin</p>
      </div>
    </aside>
  );
}
