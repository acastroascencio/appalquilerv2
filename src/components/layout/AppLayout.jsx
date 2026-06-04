import Sidebar from "./Sidebar";
import { useApp } from "../../context/AppContext";
import { LogOut, User } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";

export default function AppLayout({
  children,
  sesionActiva,
  onSignOut,
  theme,
  resolvedTheme,
  onToggleTheme,
}) {
  const { config, activePage, selectedInquilinoId } = useApp();
  const displayName = sesionActiva?.user?.nombre || config?.titular || "Administrador";

  const getPageTitle = () => {
    if (selectedInquilinoId) return "Ficha detallada del inquilino";
    switch (activePage) {
      case "dashboard":
        return "Resumen principal";
      case "departamentos":
        return "Gestion de departamentos";
      case "inquilinos":
        return "Gestion de inquilinos";
      case "consumo":
        return "Registro de consumo";
      case "configuracion":
        return "Configuracion del sistema";
      default:
        return "AlquilerApp";
    }
  };

  return (
    <div className="flex min-h-screen overflow-x-hidden font-sans text-slate-800 antialiased dark:text-slate-100">
      <Sidebar />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col pb-24 lg:pb-0">
        <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-sm shadow-slate-200/60 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 dark:shadow-none sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-wide text-blue-700 dark:text-blue-300 lg:hidden">
              AlquilerApp
            </p>
            <h2 className="truncate text-xl font-black tracking-tight text-slate-950 dark:text-slate-50 sm:text-2xl">
              {getPageTitle()}
            </h2>
          </div>

          <div className="flex items-center gap-2 pl-3 sm:gap-3">
            <div className="hidden text-right sm:block">
              <p className="max-w-52 truncate text-sm font-extrabold text-slate-800 dark:text-slate-100">
                {displayName}
              </p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Propietario</p>
            </div>
            <ThemeToggle theme={theme} resolvedTheme={resolvedTheme} onToggle={onToggleTheme} label={false} />
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-600 shadow-inner dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              <User className="h-5 w-5" aria-hidden="true" />
            </div>
            <button
              type="button"
              onClick={onSignOut}
              className="hidden min-h-12 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-extrabold text-red-700 transition-colors hover:bg-red-50 dark:border-red-900/70 dark:bg-slate-950 dark:text-red-300 dark:hover:bg-red-950/30 sm:flex"
              title="Cerrar sesion"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span>Salir</span>
            </button>
          </div>
        </header>

        <main className="page-enter mx-auto flex-1 w-full max-w-7xl overflow-y-auto overflow-x-hidden px-4 py-5 sm:px-6 sm:py-7 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
