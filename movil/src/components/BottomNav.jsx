import { Building, Home, User, Users, Zap } from "lucide-react";

export default function BottomNav({ paginaActiva, setPaginaActiva }) {
  const itemsMenu = [
    { id: "inicio", label: "Inicio", icon: Home },
    { id: "consumo", label: "Consumo", icon: Zap },
    { id: "inquilinos", label: "Inquilinos", icon: Users },
    { id: "departamentos", label: "Inmuebles", icon: Building },
    { id: "cuenta", label: "Cuenta", icon: User },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 grid min-h-[84px] grid-cols-5 gap-1.5 border-t border-slate-200 bg-white/95 px-2 pb-2 pt-2 shadow-2xl backdrop-blur"
      aria-label="Navegación principal de la aplicación"
    >
      {itemsMenu.map((item) => {
        const Icono = item.icon;
        const estaActivo = paginaActiva === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setPaginaActiva(item.id)}
            className={`flex min-h-16 min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl px-1 py-2 text-center text-[11px] font-extrabold leading-tight transition-colors duration-150 ${
              estaActivo
                ? "bg-blue-700 text-white"
                : "text-slate-500 hover:bg-slate-100"
            }`}
            aria-current={estaActivo ? "page" : undefined}
          >
            <Icono className="h-6 w-6 shrink-0" aria-hidden="true" />
            <span className="block max-w-full truncate">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
