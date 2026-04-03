/*
 * Layout principal — Athletic Dashboard Oscuro
 * Sidebar izquierdo con navegación entre secciones + área de contenido principal
 * Optimizado para mobile con sidebar colapsable
 */

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useNutrition } from "@/contexts/NutritionContext";
import { cn } from "@/lib/utils";
import {
  Calculator, BarChart3, UtensilsCrossed, Calendar, Trophy, Database, ChevronRight, Menu, X,
  PieChart, Lock
} from "lucide-react";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663411491932/HeqmeGRYAW4QbTnBi6aChF/logo-fuelfood-color_bd7f5309.webp";

const navItems = [
  { path: "/", label: "Mis Datos", icon: Calculator, step: 0, desc: "Datos personales y deporte" },
  { path: "/resultados", label: "Resultados", icon: BarChart3, step: 1, desc: "Calorías y composición" },
  { path: "/macros", label: "Macronutrientes", icon: PieChart, step: 2, desc: "Distribución de macros" },
  { path: "/menu", label: "Menú del Día", icon: UtensilsCrossed, step: 3, desc: "Selecciona tus alimentos" },
  { path: "/alimentos", label: "Alimentos", icon: Database, step: 4, desc: "Base de datos" },
];

// Alimentos siempre accesible; resultados/macros/menús requieren cálculo previo
const ALWAYS_ACCESSIBLE = new Set(["/", "/alimentos"]);

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { state } = useNutrition();
  const { pasoMaxAlcanzado, resultadosCalorias } = state;

  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Mobile menu button */}
      <div className="fixed top-0 left-0 right-0 z-50 md:hidden bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <img src={LOGO_URL} alt="FuelFood" className="h-8 w-auto" />
        <div className="w-10" />
      </div>

      {/* Overlay para cerrar sidebar en mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:static top-0 left-0 bottom-0 z-40 w-64 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col transition-transform duration-300 md:translate-x-0 pt-16 md:pt-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo (desktop only) */}
        <div className="hidden md:flex px-4 py-4 border-b border-gray-800 items-center justify-center">
          <img
            src={LOGO_URL}
            alt="FuelFood"
            className="w-36 h-auto object-contain"
          />
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item, idx) => {
            const isActive = location === item.path;
            const isUnlocked = ALWAYS_ACCESSIBLE.has(item.path) || resultadosCalorias !== null || item.step === 0;
            const Icon = item.icon;

            return (
              <Link key={item.path} href={item.path}>
                <div
                  onClick={() => setSidebarOpen(false)}
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
                    "flex items-center justify-center w-8 h-8 rounded-md transition-colors flex-shrink-0",
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
      <main className="flex-1 overflow-auto w-full md:w-auto pt-16 md:pt-0">
        {children}
      </main>
    </div>
  );
}
