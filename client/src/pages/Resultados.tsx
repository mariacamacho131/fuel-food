/**
 * Resultados — Página de resultados de cálculo calórico
 * Design: Athletic Dashboard Oscuro — carbón + cian
 */

import { useLocation } from "wouter";
import { useNutrition } from "@/contexts/NutritionContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronRight, Flame, Scale, Activity, TrendingDown, AlertTriangle, CheckCircle, ChevronLeft } from "lucide-react";

function StatCard({ label, value, unit, color = "cyan", sub }: {
  label: string; value: string | number; unit?: string; color?: string; sub?: string;
}) {
  const colorMap: Record<string, string> = {
    cyan: "text-cyan-400", green: "text-green-400", orange: "text-orange-400",
    yellow: "text-yellow-400", red: "text-red-400", blue: "text-blue-400",
  };
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-end gap-1">
        <span className={cn("text-2xl font-bold", colorMap[color] || "text-cyan-400")}>
          {typeof value === "number" ? Math.round(value) : value}
        </span>
        {unit && <span className="text-gray-400 text-sm mb-0.5">{unit}</span>}
      </div>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

export default function Resultados() {
  const [, navigate] = useLocation();
  const { state } = useNutrition();
  const { resultadosCalorias: r, datosPersonales: d } = state;

  if (!r) {
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

  const objetivoColor = r.objetivo === "Pérdida de grasa" ? "orange" : r.objetivo === "Ganancia de masa muscular" ? "green" : "blue";
  const disponibilidadOk = r.disponibilidadEnergetica >= 30;

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Resultados</h1>
          <p className="text-gray-400 text-sm mt-1">Análisis calórico y composición corporal</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
          >
            <ChevronLeft size={16} className="mr-1" /> Editar datos
          </Button>
          <Button
            onClick={() => navigate("/macros")}
            className="bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-semibold"
          >
            Ver Macros <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
      </div>

      {/* Objetivo */}
      <div className={cn(
        "mb-6 px-5 py-4 rounded-xl border flex items-center gap-3",
        r.objetivo === "Pérdida de grasa" ? "bg-orange-500/10 border-orange-500/30" :
        r.objetivo === "Ganancia de masa muscular" ? "bg-green-500/10 border-green-500/30" :
        "bg-blue-500/10 border-blue-500/30"
      )}>
        <TrendingDown size={20} className={
          r.objetivo === "Pérdida de grasa" ? "text-orange-400" :
          r.objetivo === "Ganancia de masa muscular" ? "text-green-400" : "text-blue-400"
        } />
        <div>
          <p className="text-white font-semibold">{r.objetivo}</p>
          <p className="text-gray-400 text-sm">
            {d.peso} kg → {d.pesoObjetivo} kg
            {r.objetivo === "Pérdida de grasa" && ` · ${r.kgAPerder.toFixed(1)} kg a perder · ~${Math.ceil(r.semanasEstimadas)} semanas`}
          </p>
        </div>
      </div>

      {/* Metabolismo */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Flame size={14} className="text-cyan-400" /> Metabolismo
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Metabolismo Basal" value={r.metabolismoBasal} unit="kcal" color="cyan" />
          <StatCard label="Metabolismo Total" value={r.metabolismoTotal} unit="kcal" color="cyan" />
          <StatCard label="Gasto Deporte" value={r.gastoDeporte} unit="kcal" color="blue" sub="Semanal estimado" />
          <StatCard
            label="Calorías a Consumir"
            value={r.caloriasConsumir}
            unit="kcal"
            color={objetivoColor}
            sub={r.objetivo}
          />
        </div>
      </div>

      {/* Tabla de calorías por objetivo */}
      <div className="mb-6 bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Calorías según objetivo
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <div className={cn("p-3 rounded-lg border", r.objetivo === "Mantenimiento" ? "bg-blue-500/10 border-blue-500/40" : "bg-gray-800 border-gray-700")}>
            <p className="text-xs text-gray-500 mb-1">Mantenimiento</p>
            <p className="text-xl font-bold text-blue-400">{Math.round(r.caloriasMantenimiento)}</p>
            <p className="text-xs text-gray-500">kcal/día</p>
          </div>
          <div className={cn("p-3 rounded-lg border", r.objetivo === "Ganancia de masa muscular" ? "bg-green-500/10 border-green-500/40" : "bg-gray-800 border-gray-700")}>
            <p className="text-xs text-gray-500 mb-1">Ganancia muscular</p>
            <p className="text-xl font-bold text-green-400">{Math.round(r.caloriasGanancia)}</p>
            <p className="text-xs text-gray-500">kcal/día (+15%)</p>
          </div>
          <div className={cn("p-3 rounded-lg border", r.objetivo === "Pérdida de grasa" ? "bg-orange-500/10 border-orange-500/40" : "bg-gray-800 border-gray-700")}>
            <p className="text-xs text-gray-500 mb-1">Pérdida de grasa</p>
            <p className="text-xl font-bold text-orange-400">{Math.round(r.caloriasPerdida)}</p>
            <p className="text-xs text-gray-500">kcal/día (-{d.nivelGraso === "Poco" ? 10 : d.nivelGraso === "Medio" ? 15 : 20}%)</p>
          </div>
        </div>
      </div>

      {/* Composición corporal */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Scale size={14} className="text-cyan-400" /> Composición corporal
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="% Grasa" value={d.porcentajeGraso} unit="%" color="yellow" />
          <StatCard label="Masa Grasa" value={r.masaGrasa} unit="kg" color="orange" />
          <StatCard label="Masa Libre de Grasa" value={r.masaLibreGrasa} unit="kg" color="green" />
          <StatCard label="Peso Objetivo" value={d.pesoObjetivo} unit="kg" color="cyan" />
        </div>
      </div>

      {/* Disponibilidad energética */}
      <div className="mb-6 bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Activity size={14} className="text-cyan-400" /> Disponibilidad Energética
        </h2>
        {/* Barra visual de disponibilidad */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Disponibilidad Energética: <span className={cn("font-bold", disponibilidadOk ? "text-green-400" : "text-red-400")}>{r.disponibilidadEnergetica.toFixed(1)} kcal/kg FFM</span></span>
            <span className="text-xs text-gray-500">Mínimo: 30 | Óptimo: {d.genero === "Mujer" ? "45" : "40"}</span>
          </div>
          <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-red-500/40 rounded-full" style={{ width: "30%" }} />
            <div className="absolute inset-y-0 left-[30%] bg-yellow-500/40 rounded-full" style={{ width: "15%" }} />
            <div className="absolute inset-y-0 left-[45%] bg-green-500/40 rounded-full" style={{ width: "55%" }} />
            <div
              className={cn("absolute inset-y-0 left-0 rounded-full transition-all", disponibilidadOk ? "bg-green-500" : "bg-red-500")}
              style={{ width: `${Math.min((r.disponibilidadEnergetica / 60) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-0.5">
            <span>0</span><span>30</span><span>45</span><span>60+</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="p-3 bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Disponibilidad Energética</p>
            <p className={cn("text-xl font-bold", disponibilidadOk ? "text-green-400" : "text-red-400")}>
              {r.disponibilidadEnergetica.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500">kcal/kg FFM</p>
          </div>
          <div className="p-3 bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Mínimo recomendado</p>
            <p className="text-xl font-bold text-yellow-400">{Math.round(r.limiteMinimo)}</p>
            <p className="text-xs text-gray-500">kcal (40 × FFM)</p>
          </div>
          <div className="p-3 bg-gray-800 rounded-lg col-span-2 md:col-span-1">
            <div className="flex items-start gap-2">
              {disponibilidadOk ? (
                <CheckCircle size={16} className="text-green-400 mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" />
              )}
              <div>
                <p className={cn("text-sm font-medium", disponibilidadOk ? "text-green-400" : "text-red-400")}>
                  {disponibilidadOk ? "Disponibilidad óptima" : "Disponibilidad baja"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {d.genero === "Mujer"
                    ? "Mujer: >45 alta, 45 óptima, 30-45 baja, <30 muy baja"
                    : "Hombre: >40 alta, 40 óptima, 30-40 baja, <30 muy baja"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Proyección pérdida */}
      {r.objetivo === "Pérdida de grasa" && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Proyección de pérdida de grasa
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Kg a perder" value={r.kgAPerder.toFixed(1)} unit="kg" color="orange" />
            <StatCard label="% pérdida semanal" value={r.porcentajePerdidaSemanal} unit="%" color="yellow" />
            <StatCard label="Kg/semana" value={r.kgPerdidaSemanal.toFixed(2)} unit="kg" color="cyan" />
            <StatCard label="Semanas estimadas" value={Math.ceil(r.semanasEstimadas)} unit="sem" color="green" />
          </div>
        </div>
      )}
    </div>
  );
}
