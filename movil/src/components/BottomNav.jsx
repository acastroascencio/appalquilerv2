import React from "react";
import { Home, Building, User } from "lucide-react";

export default function BottomNav({ paginaActiva, setPaginaActiva }) {
  const itemsMenu = [
    { id: "inicio", label: "Inicio", icon: Home },
    { id: "departamentos", label: "Departamentos", icon: Building },
    { id: "cuenta", label: "Mi Cuenta", icon: User },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 h-[80px] bg-slate-950 border-t border-slate-800 flex items-center justify-around px-4 shadow-2xl z-40"
      aria-label="Navegación principal de la aplicación"
    >
      {itemsMenu.map((item) => {
        const Icono = item.icon;
        const estaActivo = paginaActiva === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setPaginaActiva(item.id)}
            className={`flex-1 flex flex-col items-center justify-center h-[70px] rounded-lg transition-all duration-150 focus:ring-4 focus:ring-blue-600 focus:outline-none ${
              estaActivo 
                ? "text-blue-500 font-black scale-105" 
                : "text-slate-400 font-bold hover:text-white"
            }`}
            aria-current={estaActivo ? "page" : undefined}
          >
            <Icono className="h-7 w-7 mb-1" aria-hidden="true" />
            <span className="text-xs tracking-wide">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
