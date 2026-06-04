import Sidebar from "./Sidebar";
import { useApp } from "../../context/AppContext";
import { LogOut, User } from "lucide-react";

export default function AppLayout({ children, sesionActiva, onSignOut }) {
  const { config, activePage, selectedInquilinoId } = useApp();
  const displayName = sesionActiva?.user?.nombre || config?.titular || "Administrador";

  const getPageTitle = () => {
    if (selectedInquilinoId) return "Ficha detallada del inquilino";
    switch (activePage) {
      case "dashboard":
        return "Resumen principal";
      case "departamentos":
        return "Gestión de departamentos";
      case "inquilinos":
        return "Gestión de inquilinos";
      case "consumo":
        return "Registro de consumo";
      case "configuracion":
        return "Configuración del sistema";
      default:
        return "AlquilerApp";
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800 antialiased">
      <Sidebar />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col pb-24 lg:pb-0">
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-wide text-blue-700 lg:hidden">
              AlquilerApp
            </p>
            <h2 className="truncate text-lg font-extrabold tracking-tight text-slate-950 sm:text-xl">
              {getPageTitle()}
            </h2>
          </div>

          <div className="flex items-center gap-3 pl-3">
            <div className="hidden text-right sm:block">
              <p className="max-w-52 truncate text-sm font-extrabold text-slate-800">
                {displayName}
              </p>
              <p className="text-xs font-medium text-slate-500">Propietario</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-600 shadow-inner">
              <User className="h-5 w-5" aria-hidden="true" />
            </div>
            <button
              type="button"
              onClick={onSignOut}
              className="hidden min-h-11 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-extrabold text-red-700 transition-colors hover:bg-red-50 sm:flex"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span>Salir</span>
            </button>
          </div>
        </header>

        <main className="mx-auto flex-1 w-full max-w-7xl overflow-y-auto px-4 py-5 sm:px-6 sm:py-7 lg:p-8 page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}
