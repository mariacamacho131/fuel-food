/*
 * Menu — Menú unificado para seleccionar alimentos
 * Design: Athletic Dashboard Oscuro — carbón + cian
 * Lógica: Resta de intercambios en tiempo real y visualización de gramos
 * Mobile: Optimizado para pantallas pequeñas
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { useNutrition } from "@/contexts/NutritionContext";
import type { Alimento } from "@/contexts/NutritionContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronLeft, Plus, X } from "lucide-react";

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
  tipo,
  intercambios,
  alimentos,
  onAdd,
  comidaKey,
}: {
  tipo: "hc" | "proteina" | "grasa";
  intercambios: number;
  alimentos: Alimento[];
  onAdd: (id: string, tipo: "hc" | "proteina" | "grasa", intercambios: number) => void;
  comidaKey: string;
}) {
  const [open, setOpen] = useState(false);
  const [intVal, setIntVal] = useState(intercambios);
  const [search, setSearch] = useState("");
  
  const categoriaMap = { hc: "carbohidrato", proteina: "proteina", grasa: "grasa" };
  const filtrados = alimentos
    .filter(a => a.categoria === categoriaMap[tipo])
    .filter(a => a.nombre.toLowerCase().includes(search.toLowerCase()));

  const colorMap = {
    hc: "text-amber-400 border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20",
    proteina: "text-blue-400 border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20",
    grasa: "text-green-400 border-green-500/40 bg-green-500/10 hover:bg-green-500/20",
  };
  const labelMap = { hc: "HC", proteina: "Prot", grasa: "Grasa" };

  const handleSelect = (id: string) => {
    onAdd(id, tipo, intVal);
    setOpen(false);
    setSearch("");
    setIntVal(intercambios);
  };

  return (
    <div className="relative w-full md:w-auto">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full md:w-auto flex items-center justify-center gap-1.5 px-3 md:px-4 py-2 md:py-3 rounded-lg border text-xs md:text-sm font-semibold transition-all",
          colorMap[tipo]
        )}
      >
        <Plus size={14} className="md:w-4" /> {labelMap[tipo]}
      </button>
      
      {open && (
        <div 
          className="fixed inset-0 z-40 md:hidden" 
          onClick={() => setOpen(false)} 
        />
      )}
      
      {open && (
        <div className={cn(
          "fixed z-50 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-3 md:p-4",
          "bottom-0 left-0 right-0 rounded-b-none",
          "md:absolute md:bottom-auto md:left-1/2 md:right-auto md:-translate-x-1/2 md:top-full md:mt-2 md:w-96 md:rounded-b-xl"
        )}>
          <div className="mb-3">
            <input
              type="text"
              placeholder="Buscar alimento..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
              autoFocus
            />
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-gray-400 whitespace-nowrap">Intercambios:</span>
            <input
              type="number"
              step="0.1"
              value={intVal}
              onChange={e => setIntVal(parseFloat(e.target.value) || 0)}
              className="flex-1 text-center text-xs h-8 bg-gray-700 border border-gray-600 rounded text-white"
            />
          </div>
          <div className="max-h-64 md:max-h-72 overflow-y-auto space-y-1">
            {filtrados.length > 0 ? (
              filtrados.map(a => {
                const gr = calcularGramos(a, tipo, intVal);
                return (
                  <button
                    key={a.id}
                    onClick={() => handleSelect(a.id)}
                    className="w-full text-left px-2 md:px-3 py-2 rounded hover:bg-gray-700 transition-colors border border-transparent hover:border-gray-600"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm text-gray-200 font-medium truncate">{a.nombre}</p>
                        <p className="text-xs text-gray-500">{gr.toFixed(0)}g</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-400">{a.kcalPor100g} kcal/100g</p>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="text-xs text-gray-500 text-center py-4">No hay alimentos</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Menu() {
  const { state } = useNutrition();
  const [, setLocation] = useLocation();
  const [menu, setMenu] = useState<MenuDia>({
    desayuno: { alimentos: [] },
    comida: { alimentos: [] },
    merienda: { alimentos: [] },
    cena: { alimentos: [] },
    post: { alimentos: [] },
  });

  if (!state.macros || !state.distribucionDiaA) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-bold text-white mb-4">Completa el formulario primero</h1>
          <Button onClick={() => setLocation("/")} className="gap-2">
            <ChevronLeft size={16} /> Volver
          </Button>
        </div>
      </div>
    );
  }

  const dist = state.distribucionDiaA;

  const addAlimento = (comidaKey: ComidaKey, alimentoId: string, tipo: "hc" | "proteina" | "grasa", intercambios: number) => {
    setMenu(prev => ({
      ...prev,
      [comidaKey]: {
        alimentos: [
          ...prev[comidaKey].alimentos,
          { alimentoId, tipo, intercambios },
        ],
      },
    }));
  };

  const removeAlimento = (comidaKey: ComidaKey, index: number) => {
    setMenu(prev => ({
      ...prev,
      [comidaKey]: {
        alimentos: prev[comidaKey].alimentos.filter((_, i) => i !== index),
      },
    }));
  };

  const calcularTotalesComida = (comidaKey: ComidaKey) => {
    let totHc = 0, totProt = 0, totGrasa = 0, totKcal = 0, totGramosHc = 0, totGramosProt = 0, totGramosGrasa = 0;
    menu[comidaKey].alimentos.forEach(sel => {
      const alim = state.alimentos.find(a => a.id === sel.alimentoId);
      if (alim) {
        const gr = calcularGramos(alim, sel.tipo, sel.intercambios);
        const nutr = calcularNutriAlimento(alim, gr);
        totHc += nutr.hc;
        totProt += nutr.prot;
        totGrasa += nutr.grasa;
        totKcal += nutr.kcal;
        totGramosHc += sel.tipo === "hc" ? gr : 0;
        totGramosProt += sel.tipo === "proteina" ? gr : 0;
        totGramosGrasa += sel.tipo === "grasa" ? gr : 0;
      }
    });
    return { hc: totHc, prot: totProt, grasa: totGrasa, kcal: totKcal, gramosHc: totGramosHc, gramosProt: totGramosProt, gramosGrasa: totGramosGrasa };
  };

  const calcularTotalesDia = () => {
    let totHc = 0, totProt = 0, totGrasa = 0, totKcal = 0;
    comidas.forEach(c => {
      const t = calcularTotalesComida(c.key);
      totHc += t.hc;
      totProt += t.prot;
      totGrasa += t.grasa;
      totKcal += t.kcal;
    });
    return { hc: totHc, prot: totProt, grasa: totGrasa, kcal: totKcal };
  };

  const totales = calcularTotalesDia();

  const calcularIntercambiosConsumidos = (comidaKey: ComidaKey) => {
    let hc = 0, prot = 0, grasa = 0;
    menu[comidaKey].alimentos.forEach(sel => {
      if (sel.tipo === "hc") hc += sel.intercambios;
      else if (sel.tipo === "proteina") prot += sel.intercambios;
      else if (sel.tipo === "grasa") grasa += sel.intercambios;
    });
    return { hc, prot, grasa };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-3 md:p-8 pb-20 md:pb-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-1 md:mb-2">Menú del Día</h1>
          <p className="text-xs md:text-base text-gray-400">Selecciona los alimentos para cada comida</p>
        </div>

        {/* Resumen diario */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 md:p-6 mb-6 md:mb-8">
          <h2 className="text-xs md:text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 md:mb-4">Totales del Día</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            <div className="p-2 md:p-4 bg-blue-500/10 border border-blue-500/40 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Proteína</p>
              <p className="text-lg md:text-2xl font-bold text-blue-400">{totales.prot.toFixed(0)}g</p>
              <p className="text-xs text-gray-500 mt-1">de 143g</p>
            </div>
            <div className="p-2 md:p-4 bg-amber-500/10 border border-amber-500/40 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Hidratos</p>
              <p className="text-lg md:text-2xl font-bold text-amber-400">{totales.hc.toFixed(0)}g</p>
              <p className="text-xs text-gray-500 mt-1">de 186g</p>
            </div>
            <div className="p-2 md:p-4 bg-green-500/10 border border-green-500/40 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Grasas</p>
              <p className="text-lg md:text-2xl font-bold text-green-400">{totales.grasa.toFixed(0)}g</p>
              <p className="text-xs text-gray-500 mt-1">de 59g</p>
            </div>
            <div className="p-2 md:p-4 bg-orange-500/10 border border-orange-500/40 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Calorías</p>
              <p className="text-lg md:text-2xl font-bold text-orange-400">{totales.kcal.toFixed(0)}</p>
              <p className="text-xs text-gray-500 mt-1">de 1842 kcal</p>
            </div>
          </div>
        </div>

        {/* Comidas */}
        <div className="space-y-4 md:space-y-6">
          {comidas.map(comida => {
            const totalesComida = calcularTotalesComida(comida.key);
            const intercambiosConsumidos = calcularIntercambiosConsumidos(comida.key);
            const distComida = dist[comida.key];

            return (
              <div key={comida.key} className="bg-gray-900 border border-gray-800 rounded-xl p-3 md:p-6">
                {/* Header con emoji y título */}
                <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                  <h3 className="text-lg md:text-2xl font-semibold text-white flex items-center gap-2">
                    <span className="text-xl md:text-2xl">{comida.emoji}</span> 
                    <span className="text-base md:text-2xl">{comida.label}</span>
                  </h3>
                </div>

                {/* Raciones recomendadas vs consumidas */}
                <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4 md:mb-6 p-2 md:p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-1">Proteína</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <p className="text-base md:text-xl font-bold text-blue-400">{intercambiosConsumidos.prot.toFixed(1)}</p>
                      <p className="text-xs text-gray-500">/ {distComida.proteina.toFixed(1)}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">intercambios</p>
                    {intercambiosConsumidos.prot < distComida.proteina && (
                      <p className="text-xs text-yellow-400 mt-1">Faltan: {(distComida.proteina - intercambiosConsumidos.prot).toFixed(1)}</p>
                    )}
                    {intercambiosConsumidos.prot > distComida.proteina && (
                      <p className="text-xs text-red-400 mt-1">Exceso: {(intercambiosConsumidos.prot - distComida.proteina).toFixed(1)}</p>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-1">Hidratos</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <p className="text-base md:text-xl font-bold text-amber-400">{intercambiosConsumidos.hc.toFixed(1)}</p>
                      <p className="text-xs text-gray-500">/ {distComida.hc.toFixed(1)}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">intercambios</p>
                    {intercambiosConsumidos.hc < distComida.hc && (
                      <p className="text-xs text-yellow-400 mt-1">Faltan: {(distComida.hc - intercambiosConsumidos.hc).toFixed(1)}</p>
                    )}
                    {intercambiosConsumidos.hc > distComida.hc && (
                      <p className="text-xs text-red-400 mt-1">Exceso: {(intercambiosConsumidos.hc - distComida.hc).toFixed(1)}</p>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-1">Grasas</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <p className="text-base md:text-xl font-bold text-green-400">{intercambiosConsumidos.grasa.toFixed(1)}</p>
                      <p className="text-xs text-gray-500">/ {distComida.grasa.toFixed(1)}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">intercambios</p>
                    {intercambiosConsumidos.grasa < distComida.grasa && (
                      <p className="text-xs text-yellow-400 mt-1">Faltan: {(distComida.grasa - intercambiosConsumidos.grasa).toFixed(1)}</p>
                    )}
                    {intercambiosConsumidos.grasa > distComida.grasa && (
                      <p className="text-xs text-red-400 mt-1">Exceso: {(intercambiosConsumidos.grasa - distComida.grasa).toFixed(1)}</p>
                    )}
                  </div>
                </div>

                {/* Botones para añadir alimentos - CENTRADOS Y RESPONSIVE */}
                <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-4 md:mb-6">
                  <SelectorAlimento
                    tipo="proteina"
                    intercambios={Math.max(0, distComida.proteina - intercambiosConsumidos.prot)}
                    alimentos={state.alimentos}
                    onAdd={(id, tipo, int) => addAlimento(comida.key, id, tipo, int)}
                    comidaKey={comida.key}
                  />
                  <SelectorAlimento
                    tipo="hc"
                    intercambios={Math.max(0, distComida.hc - intercambiosConsumidos.hc)}
                    alimentos={state.alimentos}
                    onAdd={(id, tipo, int) => addAlimento(comida.key, id, tipo, int)}
                    comidaKey={comida.key}
                  />
                  <SelectorAlimento
                    tipo="grasa"
                    intercambios={Math.max(0, distComida.grasa - intercambiosConsumidos.grasa)}
                    alimentos={state.alimentos}
                    onAdd={(id, tipo, int) => addAlimento(comida.key, id, tipo, int)}
                    comidaKey={comida.key}
                  />
                </div>

                {/* Alimentos seleccionados */}
                <div className="space-y-2 mb-4">
                  {menu[comida.key].alimentos.length > 0 ? (
                    menu[comida.key].alimentos.map((sel, idx) => {
                      const alim = state.alimentos.find(a => a.id === sel.alimentoId);
                      if (!alim) return null;
                      const gr = calcularGramos(alim, sel.tipo, sel.intercambios);
                      const nutr = calcularNutriAlimento(alim, gr);
                      const colorMap = {
                        hc: "border-amber-500/40 bg-amber-500/10",
                        proteina: "border-blue-500/40 bg-blue-500/10",
                        grasa: "border-green-500/40 bg-green-500/10",
                      };
                      const tipoLabel = { hc: "HC", proteina: "Prot", grasa: "Grasa" };
                      return (
                        <div key={idx} className={cn("p-2 md:p-3 rounded-lg border flex justify-between items-start gap-2", colorMap[sel.tipo])}>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs md:text-sm font-medium text-gray-200 truncate">{alim.nombre}</p>
                            <p className="text-xs text-gray-400">{gr.toFixed(0)}g • {nutr.kcal.toFixed(0)} kcal • {sel.intercambios} int ({tipoLabel[sel.tipo]})</p>
                          </div>
                          <button
                            onClick={() => removeAlimento(comida.key, idx)}
                            className="text-gray-400 hover:text-red-400 transition-colors flex-shrink-0"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-gray-500 italic text-center py-2">Sin alimentos seleccionados</p>
                  )}
                </div>

                {/* Totales comida con gramos */}
                <div className="p-2 md:p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div>
                      <p className="text-gray-400">Proteína</p>
                      <p className="text-blue-400 font-semibold">{totalesComida.prot.toFixed(1)}g</p>
                      <p className="text-gray-500 text-xs">{totalesComida.gramosProt.toFixed(0)}g alim</p>
                    </div>
                    <div>
                      <p className="text-gray-400">HC</p>
                      <p className="text-amber-400 font-semibold">{totalesComida.hc.toFixed(1)}g</p>
                      <p className="text-gray-500 text-xs">{totalesComida.gramosHc.toFixed(0)}g alim</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Grasa</p>
                      <p className="text-green-400 font-semibold">{totalesComida.grasa.toFixed(1)}g</p>
                      <p className="text-gray-500 text-xs">{totalesComida.gramosGrasa.toFixed(0)}g alim</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Total</p>
                      <p className="text-cyan-400 font-semibold">{totalesComida.kcal.toFixed(0)} kcal</p>
                      <p className="text-gray-500 text-xs">{(totalesComida.gramosProt + totalesComida.gramosHc + totalesComida.gramosGrasa).toFixed(0)}g tot</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Botones */}
        <div className="flex flex-col-reverse md:flex-row gap-3 md:gap-4 justify-between mt-6 md:mt-8 fixed md:relative bottom-0 md:bottom-auto left-0 md:left-auto right-0 md:right-auto p-3 md:p-0 bg-gray-950 md:bg-transparent border-t md:border-t-0 border-gray-800">
          <Button variant="outline" onClick={() => setLocation("/macros")} className="gap-2 w-full md:w-auto">
            <ChevronLeft size={16} /> Volver
          </Button>
          <Button onClick={() => setLocation("/")} className="gap-2 bg-cyan-600 hover:bg-cyan-700 w-full md:w-auto">
            Guardar y Continuar →
          </Button>
        </div>
      </div>
    </div>
  );
}
