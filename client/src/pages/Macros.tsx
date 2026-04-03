/**
 * Macros — Distribución de macronutrientes e intercambios por comida
 * Design: Athletic Dashboard Oscuro — carbón + cian
 * Fiel a la Hoja 2 del Excel: proteína, grasas, hidratos por descarte + distribución editable
 */

import { useLocation } from "wouter";
import { useNutrition, distribucionPorDefecto } from "@/contexts/NutritionContext";
import type { DistribucionDia, DistribucionComida } from "@/contexts/NutritionContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronLeft, RotateCcw, Info, Pill } from "lucide-react";

// Colores por macro
const macroColors = {
  hc: { bg: "bg-amber-500/15", border: "border-amber-500/40", text: "text-amber-400", label: "Hidratos" },
  proteina: { bg: "bg-blue-500/15", border: "border-blue-500/40", text: "text-blue-400", label: "Proteína" },
  grasa: { bg: "bg-green-500/15", border: "border-green-500/40", text: "text-green-400", label: "Grasa" },
};

const comidas = [
  { key: "desayuno", label: "Desayuno" },
  { key: "comida", label: "Comida" },
  { key: "merienda", label: "Merienda" },
  { key: "cena", label: "Cena" },
  { key: "post", label: "Post (Opcional)" },
] as const;

type ComidaKey = typeof comidas[number]["key"];

function calcularTotales(dist: DistribucionDia) {
  const keys: ComidaKey[] = ["desayuno", "comida", "merienda", "cena", "post"];
  return {
    hc: keys.reduce((s, k) => s + (dist[k].hc || 0), 0),
    proteina: keys.reduce((s, k) => s + (dist[k].proteina || 0), 0),
    grasa: keys.reduce((s, k) => s + (dist[k].grasa || 0), 0),
  };
}

function MacroDonut({ pct, color, label }: { pct: number; color: string; label: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(pct, 100) / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#1f2937" strokeWidth="8" />
        <circle
          cx="36" cy="36" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
          style={{ transition: "stroke-dasharray 0.5s ease" }}
        />
        <text x="36" y="40" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">
          {Math.round(pct)}%
        </text>
      </svg>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
}

function DistribucionEditor({
  titulo, dist, onUpdate, totalHC, totalProt, totalGrasa, lacteos, onLacteosChange
}: {
  titulo: string;
  dist: DistribucionDia;
  onUpdate: (d: DistribucionDia) => void;
  totalHC: number;
  totalProt: number;
  totalGrasa: number;
  lacteos: number;
  onLacteosChange: (n: number) => void;
}) {
  const totales = calcularTotales(dist);
  const faltanHC = totalHC - totales.hc;
  const faltanProt = totalProt - totales.proteina;
  const faltanGrasa = totalGrasa - totales.grasa;

  const updateComida = (comida: ComidaKey, macro: keyof DistribucionComida, valor: number) => {
    onUpdate({
      ...dist,
      [comida]: { ...dist[comida], [macro]: valor },
    });
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h3 className="text-base font-semibold text-white mb-4">{titulo}</h3>

      {/* Lácteos */}
      <div className="mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700 flex items-center gap-3">
        <Info size={14} className="text-cyan-400 shrink-0" />
        <div className="flex-1">
          <div>
            <p className="text-xs text-gray-300 font-medium">Raciones de lácteos</p>
            <p className="text-xs text-gray-500">Cada ración resta 0.5 intercambios de HC del total disponible</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onLacteosChange(Math.max(0, lacteos - 1))}
            className="w-6 h-6 rounded bg-gray-700 text-white text-sm hover:bg-gray-600 flex items-center justify-center">−</button>
          <span className="text-white font-bold w-4 text-center">{lacteos}</span>
          <button onClick={() => onLacteosChange(lacteos + 1)}
            className="w-6 h-6 rounded bg-gray-700 text-white text-sm hover:bg-gray-600 flex items-center justify-center">+</button>
        </div>
      </div>

      {/* Tabla de distribución */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left text-gray-500 text-xs font-medium pb-2 w-32">Comida</th>
              <th className="text-center text-amber-400 text-xs font-medium pb-2">HC</th>
              <th className="text-center text-blue-400 text-xs font-medium pb-2">Proteína</th>
              <th className="text-center text-green-400 text-xs font-medium pb-2">Grasa</th>
            </tr>
          </thead>
          <tbody className="space-y-1">
            {comidas.map(({ key, label }) => (
              <tr key={key} className="border-t border-gray-800">
                <td className="py-2 text-gray-300 text-xs">{label}</td>
                {(["hc", "proteina", "grasa"] as const).map(macro => (
                  <td key={macro} className="py-2 px-1 text-center">
                    <Input
                      type="number"
                      step="0.1"
                      value={dist[key][macro] || ""}
                      placeholder="0"
                      onChange={e => updateComida(key, macro, parseFloat(e.target.value) || 0)}
                      className={cn(
                        "w-16 text-center text-xs h-7 bg-gray-800 border-gray-700 focus:border-cyan-500 mx-auto",
                        macro === "hc" ? "focus:border-amber-500" :
                        macro === "proteina" ? "focus:border-blue-500" : "focus:border-green-500"
                      )}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-700">
              <td className="pt-2 text-xs text-gray-400 font-medium">Total usado</td>
              <td className="pt-2 text-center text-amber-400 text-xs font-bold">{totales.hc.toFixed(1)}</td>
              <td className="pt-2 text-center text-blue-400 text-xs font-bold">{totales.proteina.toFixed(1)}</td>
              <td className="pt-2 text-center text-green-400 text-xs font-bold">{totales.grasa.toFixed(1)}</td>
            </tr>
            <tr>
              <td className="text-xs text-gray-500">Disponible</td>
              <td className="text-center text-xs text-gray-400">{totalHC.toFixed(1)}</td>
              <td className="text-center text-xs text-gray-400">{totalProt.toFixed(1)}</td>
              <td className="text-center text-xs text-gray-400">{totalGrasa.toFixed(1)}</td>
            </tr>
            <tr>
              <td className="text-xs font-medium text-gray-300">Faltan</td>
              <td className={cn("text-center text-xs font-bold", Math.abs(faltanHC) < 0.1 ? "text-green-400" : faltanHC > 0 ? "text-amber-400" : "text-red-400")}>
                {faltanHC.toFixed(1)}
              </td>
              <td className={cn("text-center text-xs font-bold", Math.abs(faltanProt) < 0.1 ? "text-green-400" : faltanProt > 0 ? "text-blue-400" : "text-red-400")}>
                {faltanProt.toFixed(1)}
              </td>
              <td className={cn("text-center text-xs font-bold", Math.abs(faltanGrasa) < 0.1 ? "text-green-400" : faltanGrasa > 0 ? "text-green-400" : "text-red-400")}>
                {faltanGrasa.toFixed(1)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default function Macros() {
  const [, navigate] = useLocation();
  const { state, updateDistribucionDiaA, updateDistribucionDiaB } = useNutrition();
  const { macros: m, resultadosCalorias: r, distribucionDiaA, distribucionDiaB, datosPersonales } = state;

  if (!m || !r) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Primero completa el formulario de datos personales.</p>
          <Button onClick={() => navigate("/")} className="bg-cyan-500 hover:bg-cyan-400 text-gray-950">
            Ir al formulario
          </Button>
        </div>
      </div>
    );
  }

  // Totales disponibles para distribución (intercambios = kcal / 100)
  const totalHC_A = m.hidratosIntercambios - distribucionDiaA.lacteos * 0.5;
  const totalHC_B = ((m.hidratosOffGrKg * datosPersonales.peso * 4) / 100) - distribucionDiaB.lacteos * 0.5;
  const totalProt = m.proteinaIntercambios;
  const totalGrasa = m.grasasIntercambios - 3; // -3 aceite fijo

  const resetDiaA = () => updateDistribucionDiaA(distribucionPorDefecto(m, distribucionDiaA.lacteos));
  const resetDiaB = () => updateDistribucionDiaB(distribucionPorDefecto(m, distribucionDiaB.lacteos));

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Macronutrientes</h1>
          <p className="text-gray-400 text-sm mt-1">Distribución calculada y personalización por comida</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/resultados")}
            className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent">
            <ChevronLeft size={16} className="mr-1" /> Resultados
          </Button>
          <Button onClick={() => navigate("/menu")} className="bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-semibold">
            Ir al Menú <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
      </div>

      {/* Resumen de macros */}
      <div className="mb-6 bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Distribución calculada — {Math.round(m.kcalTotales)} kcal/día
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Proteína */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Proteína</span>
              <span className="text-xs text-blue-400 font-medium">{m.proteinaPct.toFixed(1)}%</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">{m.proteinaGrKg.toFixed(1)} <span className="text-sm font-normal text-gray-400">gr/kg</span></p>
            <p className="text-sm text-gray-300 mt-1">{Math.round(m.proteinaGrTotal)} gr · {Math.round(m.proteinaKcal)} kcal</p>
            <p className="text-xs text-gray-500 mt-1">{m.proteinaIntercambios.toFixed(1)} intercambios</p>
          </div>

          {/* Hidratos */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Hidratos</span>
              <span className="text-xs text-amber-400 font-medium">{m.hidratosPct.toFixed(1)}%</span>
            </div>
            <p className="text-2xl font-bold text-amber-400">{m.hidratosGrKg.toFixed(1)} <span className="text-sm font-normal text-gray-400">gr/kg</span></p>
            <p className="text-sm text-gray-300 mt-1">{Math.round(m.hidratosGrTotal)} gr · {Math.round(m.hidratosKcal)} kcal</p>
            <p className="text-xs text-gray-500 mt-1">{m.hidratosIntercambios.toFixed(1)} intercambios</p>
            <p className="text-xs text-cyan-400 mt-1">Día off: {m.hidratosOffGrKg.toFixed(1)} gr/kg</p>
          </div>

          {/* Grasas */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Grasas</span>
              <span className="text-xs text-green-400 font-medium">{m.grasasPct.toFixed(1)}%</span>
            </div>
            <p className="text-2xl font-bold text-green-400">{m.grasasGrKg.toFixed(1)} <span className="text-sm font-normal text-gray-400">gr/kg</span></p>
            <p className="text-sm text-gray-300 mt-1">{Math.round(m.grasasGrTotal)} gr · {Math.round(m.grasasKcal)} kcal</p>
            <p className="text-xs text-gray-500 mt-1">{m.grasasIntercambios.toFixed(1)} intercambios</p>
          </div>
        </div>

        {/* Donuts */}
        <div className="flex justify-center gap-8 mt-5">
          <MacroDonut pct={m.proteinaPct} color="#60a5fa" label="Proteína" />
          <MacroDonut pct={m.hidratosPct} color="#fbbf24" label="Hidratos" />
          <MacroDonut pct={m.grasasPct} color="#34d399" label="Grasas" />
        </div>
      </div>

      {/* Suplementos */}
      <div className="mb-6 bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Pill size={14} className="text-cyan-400" /> Suplementos recomendados
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="p-3 bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Creatina</p>
            <p className="text-lg font-bold text-cyan-400">{m.creatina.toFixed(1)} g</p>
            <p className="text-xs text-gray-500">0.1 gr/kg · Diario</p>
          </div>
          <div className="p-3 bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Cafeína</p>
            <p className="text-lg font-bold text-cyan-400">{m.cafeina.toFixed(0)} mg</p>
            <p className="text-xs text-gray-500">3 mg/kg · 45-60' pre</p>
          </div>
          <div className="p-3 bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Beta Alanina</p>
            <p className="text-lg font-bold text-cyan-400">{(m.betaAlanina / 1000).toFixed(1)} g</p>
            <p className="text-xs text-gray-500">65 mg/kg · 8 semanas</p>
          </div>
        </div>
      </div>

      {/* Distribución por comidas */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Distribución de intercambios por comida
        </h2>
        <p className="text-xs text-gray-500">1 intercambio = 100 kcal</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Día A */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-cyan-400">Día A — Entrenamiento</h3>
            <button onClick={resetDiaA} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300">
              <RotateCcw size={12} /> Restablecer
            </button>
          </div>
          <DistribucionEditor
            titulo="Día A (Entrenamiento)"
            dist={distribucionDiaA}
            onUpdate={updateDistribucionDiaA}
            totalHC={totalHC_A}
            totalProt={totalProt}
            totalGrasa={totalGrasa}
            lacteos={distribucionDiaA.lacteos}
            onLacteosChange={n => updateDistribucionDiaA({ ...distribucionDiaA, lacteos: n })}
          />
        </div>

        {/* Día B */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Día B — Descanso</h3>
            <button onClick={resetDiaB} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300">
              <RotateCcw size={12} /> Restablecer
            </button>
          </div>
          <DistribucionEditor
            titulo="Día B (Descanso)"
            dist={distribucionDiaB}
            onUpdate={updateDistribucionDiaB}
            totalHC={totalHC_B}
            totalProt={totalProt}
            totalGrasa={totalGrasa}
            lacteos={distribucionDiaB.lacteos}
            onLacteosChange={n => updateDistribucionDiaB({ ...distribucionDiaB, lacteos: n })}
          />
        </div>
      </div>
    </div>
  );
}
