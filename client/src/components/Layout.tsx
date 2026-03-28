/**
 * Layout principal — Athletic Dashboard Oscuro
 * Sidebar izquierdo con navegación entre secciones + área de contenido principal
 */

import { Link, useLocation } from "wouter";
import { useNutrition } from "@/contexts/NutritionContext";
import { cn } from "@/lib/utils";
import {
  Calculator, BarChart3, UtensilsCrossed, Calendar, Trophy, Database, ChevronRight,
  PieChart, Lock
} from "lucide-react";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663411491932/HeqmeGRYAW4QbTnBi6aChF/logo-fuelfood-color_bd7f5309.webp";

const navItems = [
  { path: "/", label: "Mis Datos", icon: Calculator, step: 0, desc: "Datos personales y deporte" },
  { path: "/resultados", label: "Resultados", icon: BarChart3, step: 1, desc: "Calorías y composición" },
  { path: "/macros", label: "Macronutrientes", icon: PieChart, step: 2, desc: "Distribución de macros" },
  { path: "/menu-a", label: "Menú Día A", icon: UtensilsCrossed, step: 3, desc: "Días de entrenamiento" },
  { path: "/menu-b", label: "Menú Día B", icon: Calendar, step: 4, desc: "Días de descanso" },
  { path: "/partido", label: "Día de Partido", icon: Trophy, step: 5, desc: "Protocolo competición" },
  { path: "/alimentos", label: "Alimentos", icon: Database, step: 6, desc: "Base de datos" },
];

// Alimentos siempre accesible; resultados/macros/menús requieren cálculo previo
const ALWAYS_ACCESSIBLE = new Set(["/", "/alimentos"]);

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { state } = useNutrition();
  const { pasoMaxAlcanzado, resultadosCalorias } = state;

  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-gray-800 flex items-center justify-center">
          <img
            src={LOGO_URL}
            alt="FuelFood"
            className="w-36 h-auto object-contain"
          />
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item, idx) => {
            const isActive = location === item.path;
            const isUnlocked = ALWAYS_ACCESSIBLE.has(item.path) || resultadosCalorias !== null || item.step === 0;
            const Icon = item.icon;

            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={cn(
                    "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer",
                    isActive
                      ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                      : isUnlocked
                      ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                      : "text-gray-600 cursor-not-allowed opacity-50"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-md transition-colors",
                    isActive ? "bg-cyan-500/20 text-cyan-400" : "bg-gray-800 text-gray-400 group-hover:bg-gray-700"
                  )}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={cn("text-sm font-medium truncate", isActive && "text-cyan-400")}>
                      {item.label}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{item.desc}</div>
                  </div>
                  {isActive && <ChevronRight size={14} className="text-cyan-400 shrink-0" />}
                  {!isUnlocked && !isActive && <Lock size={11} className="text-gray-600 shrink-0" />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Resumen rápido */}
        {resultadosCalorias && (
          <div className="mx-3 mb-3 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">Objetivo diario</p>
            <p className="text-lg font-bold text-cyan-400">{Math.round(resultadosCalorias.caloriasConsumir)} <span className="text-xs font-normal text-gray-400">kcal</span></p>
            <p className="text-xs text-gray-500">{resultadosCalorias.objetivo}</p>
          </div>
        )}
        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <p className="text-xs text-gray-600 text-center">Comer Para Rendir</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
