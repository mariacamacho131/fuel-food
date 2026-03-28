/**
 * MenuDiaA — Menú para días de entrenamiento
 * Design: Athletic Dashboard Oscuro — carbón + cian
 * Permite seleccionar alimentos por comida y calcula gramos automáticamente según intercambios
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { useNutrition } from "@/contexts/NutritionContext";
import type { Alimento } from "@/contexts/NutritionContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronLeft, Plus, X, ChevronDown, ChevronUp } from "lucide-react";

const comidas = [
  { key: "desayuno", label: "Desayuno", emoji: "🌅" },
  { key: "comida", label: "Comida", emoji: "🍽️" },
  { key: "merienda", label: "Merienda", emoji: "🍎" },
  { key: "cena", label: "Cena", emoji: "🌙" },
  { key: "post", label: "Post-entreno", emoji: "💪" },
] as const;

type ComidaKey = typeof comidas[number]["key"];

interface AlimentoSeleccionado {
  alimentoId: string;
  tipo: "hc" | "proteina" | "grasa";
  intercambios: number;
}

interface MenuComida {
  alimentos: AlimentoSeleccionado[];
}

type MenuDia = Record<ComidaKey, MenuComida>;

function calcularGramos(alimento: Alimento, tipo: "hc" | "proteina" | "grasa", intercambios: number): number {
  // 1 intercambio = 100 kcal
  const kcalObjetivo = intercambios * 100;
  if (alimento.kcalPor100g === 0) return 0;
  return (kcalObjetivo / alimento.kcalPor100g) * 100;
}

function calcularNutriAlimento(alimento: Alimento, gramos: number) {
  return {
    kcal: (alimento.kcalPor100g * gramos) / 100,
    hc: (alimento.hcPor100g * gramos) / 100,
    prot: (alimento.proteinaPor100g * gramos) / 100,
    grasa: (alimento.grasaPor100g * gramos) / 100,
  };
}

function SelectorAlimento({
  tipo, intercambios, alimentos, onAdd
}: {
  tipo: "hc" | "proteina" | "grasa";
  intercambios: number;
  alimentos: Alimento[];
  onAdd: (id: string, tipo: "hc" | "proteina" | "grasa", intercambios: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [intVal, setIntVal] = useState(intercambios);
  const filtrados = alimentos.filter(a => a.categoria === tipo);

  const colorMap = {
    hc: "text-amber-400 border-amber-500/40 bg-amber-500/10",
    proteina: "text-blue-400 border-blue-500/40 bg-blue-500/10",
    grasa: "text-green-400 border-green-500/40 bg-green-500/10",
  };
  const labelMap = { hc: "HC", proteina: "Prot", grasa: "Grasa" };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn("flex items-center gap-1.5 px-2 py-1 rounded border text-xs font-medium transition-all", colorMap[tipo])}
      >
        <Plus size={10} /> {labelMap[tipo]}
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-72 p-3">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-gray-400">Intercambios:</span>
            <input
              type="number" step="0.1" value={intVal}
              onChange={e => setIntVal(parseFloat(e.target.value) || 0)}
              className="w-16 text-center text-xs h-6 bg-gray-700 border border-gray-600 rounded text-white"
            />
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {filtrados.map(a => {
              const gr = calcularGramos(a, tipo, intVal);
              return (
                <button
                  key={a.id}
                  onClick={() => { onAdd(a.id, tipo, intVal); setOpen(false); }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-700 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-200">{a.nombre}</span>
                    <span className="text-xs text-gray-400">{Math.round(gr)}g</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MenuDiaA() {
  const [, navigate] = useLocation();
  const { state } = useNutrition();
  const { distribucionDiaA: dist, alimentos, macros: m } = state;

  const [menu, setMenu] = useState<MenuDia>({
    desayuno: { alimentos: [] },
    comida: { alimentos: [] },
    merienda: { alimentos: [] },
    cena: { alimentos: [] },
    post: { alimentos: [] },
  });

  const [expandidos, setExpandidos] = useState<Record<ComidaKey, boolean>>({
    desayuno: true, comida: true, merienda: true, cena: true, post: true,
  });

  if (!m) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Primero completa el formulario y calcula tus macros.</p>
          <Button onClick={() => navigate("/")} className="bg-cyan-500 hover:bg-cyan-400 text-gray-950">
            Ir al formulario
          </Button>
        </div>
      </div>
    );
  }

  const addAlimento = (comida: ComidaKey, id: string, tipo: "hc" | "proteina" | "grasa", intercambios: number) => {
    setMenu(prev => ({
      ...prev,
      [comida]: {
        alimentos: [...prev[comida].alimentos, { alimentoId: id, tipo, intercambios }],
      },
    }));
  };

  const removeAlimento = (comida: ComidaKey, idx: number) => {
    setMenu(prev => ({
      ...prev,
      [comida]: {
        alimentos: prev[comida].alimentos.filter((_, i) => i !== idx),
      },
    }));
  };

  // Calcular totales del día
  let totalKcal = 0, totalHC = 0, totalProt = 0, totalGrasa = 0;
  Object.values(menu).forEach(c => {
    c.alimentos.forEach(a => {
      const alim = alimentos.find(al => al.id === a.alimentoId);
      if (!alim) return;
      const gr = calcularGramos(alim, a.tipo, a.intercambios);
      const n = calcularNutriAlimento(alim, gr);
      totalKcal += n.kcal; totalHC += n.hc; totalProt += n.prot; totalGrasa += n.grasa;
    });
  });

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Menú Día A</h1>
          <p className="text-gray-400 text-sm mt-1">Días de entrenamiento — Construye tu menú por comidas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/macros")}
            className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent">
            <ChevronLeft size={16} className="mr-1" /> Macros
          </Button>
          <Button onClick={() => navigate("/menu-b")} className="bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-semibold">
            Menú Día B <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
      </div>

      {/* Resumen del día */}
      <div className="mb-6 grid grid-cols-4 gap-3">
        {[
          { label: "Kcal", val: Math.round(totalKcal), target: Math.round(m.kcalTotales), color: "text-cyan-400" },
          { label: "HC", val: totalHC.toFixed(1), target: Math.round(m.hidratosGrTotal), color: "text-amber-400" },
          { label: "Proteína", val: totalProt.toFixed(1), target: Math.round(m.proteinaGrTotal), color: "text-blue-400" },
          { label: "Grasa", val: totalGrasa.toFixed(1), target: Math.round(m.grasasGrTotal), color: "text-green-400" },
        ].map(item => (
          <div key={item.label} className="bg-gray-900 border border-gray-800 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">{item.label}</p>
            <p className={cn("text-xl font-bold", item.color)}>{item.val}</p>
            <p className="text-xs text-gray-600">/ {item.target}</p>
          </div>
        ))}
      </div>

      {/* Comidas */}
      <div className="space-y-4">
        {comidas.map(({ key, label, emoji }) => {
          const distComida = dist[key];
          const menuComida = menu[key];
          const isOpen = expandidos[key];

          // Calcular totales de esta comida
          let cKcal = 0, cHC = 0, cProt = 0, cGrasa = 0;
          menuComida.alimentos.forEach(a => {
            const alim = alimentos.find(al => al.id === a.alimentoId);
            if (!alim) return;
            const gr = calcularGramos(alim, a.tipo, a.intercambios);
            const n = calcularNutriAlimento(alim, gr);
            cKcal += n.kcal; cHC += n.hc; cProt += n.prot; cGrasa += n.grasa;
          });

          return (
            <div key={key} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              {/* Header comida */}
              <button
                onClick={() => setExpandidos(prev => ({ ...prev, [key]: !prev[key] }))}
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{emoji}</span>
                  <div className="text-left">
                    <span className="text-sm font-semibold text-white">{label}</span>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-amber-400">HC: {distComida.hc}</span>
                      <span className="text-xs text-blue-400">Prot: {distComida.proteina}</span>
                      <span className="text-xs text-green-400">Grasa: {distComida.grasa}</span>
                      <span className="text-xs text-gray-500">intercambios</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {cKcal > 0 && (
                    <span className="text-xs text-gray-400">{Math.round(cKcal)} kcal</span>
                  )}
                  {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </button>

              {/* Contenido comida */}
              {isOpen && (
                <div className="px-5 pb-4 border-t border-gray-800">
                  {/* Alimentos añadidos */}
                  {menuComida.alimentos.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {menuComida.alimentos.map((a, idx) => {
                        const alim = alimentos.find(al => al.id === a.alimentoId);
                        if (!alim) return null;
                        const gr = calcularGramos(alim, a.tipo, a.intercambios);
                        const n = calcularNutriAlimento(alim, gr);
                        return (
                          <div key={idx} className="flex items-center gap-3 p-2 bg-gray-800/50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "text-xs px-1.5 py-0.5 rounded font-medium",
                                  a.tipo === "hc" ? "bg-amber-500/20 text-amber-400" :
                                  a.tipo === "proteina" ? "bg-blue-500/20 text-blue-400" :
                                  "bg-green-500/20 text-green-400"
                                )}>
                                  {a.tipo === "hc" ? "HC" : a.tipo === "proteina" ? "Prot" : "Grasa"}
                                </span>
                                <span className="text-sm text-gray-200">{alim.nombre}</span>
                              </div>
                              <div className="flex gap-3 mt-1">
                                <span className="text-xs text-gray-400 font-medium">{Math.round(gr)}g</span>
                                <span className="text-xs text-gray-500">{Math.round(n.kcal)} kcal</span>
                                <span className="text-xs text-amber-400/70">HC:{n.hc.toFixed(1)}</span>
                                <span className="text-xs text-blue-400/70">P:{n.prot.toFixed(1)}</span>
                                <span className="text-xs text-green-400/70">G:{n.grasa.toFixed(1)}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => removeAlimento(key, idx)}
                              className="text-gray-600 hover:text-red-400 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Botones añadir */}
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs text-gray-500">Añadir:</span>
                    {(["hc", "proteina", "grasa"] as const).map(tipo => (
                      <SelectorAlimento
                        key={tipo}
                        tipo={tipo}
                        intercambios={dist[key][tipo === "hc" ? "hc" : tipo === "proteina" ? "proteina" : "grasa"]}
                        alimentos={alimentos}
                        onAdd={(id, t, i) => addAlimento(key, id, t, i)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
