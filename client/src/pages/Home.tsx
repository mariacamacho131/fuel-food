/**
 * Home — Formulario paso a paso de datos personales
 * Design: Athletic Dashboard Oscuro — carbón + cian
 * Pasos: 1) Datos básicos, 2) % Graso visual, 3) Gasto deportivo
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useNutrition } from "@/contexts/NutritionContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  User, Activity, ChevronRight, ChevronLeft, Check,
  Dumbbell, Footprints, Flame, Info
} from "lucide-react";
import type { Genero, TipoDeportista, PasosNivel, NumEntrenamientos, NivelGraso, GastoDeporte } from "@/contexts/NutritionContext";
import { calcularFactorActividad } from "@/contexts/NutritionContext";

// CDN images
const IMG_MUJERES = "https://d2xsxph8kpxj0f.cloudfront.net/310519663411491932/HeqmeGRYAW4QbTnBi6aChF/body-fat-women-exguHmtGv6tiK8ensUqWDd.webp";
const IMG_HOMBRES = "https://d2xsxph8kpxj0f.cloudfront.net/310519663411491932/HeqmeGRYAW4QbTnBi6aChF/body-fat-men-oCgYcnKaSd4VEoRuBiUgBV.webp";

const PASOS = [
  { id: 0, label: "Datos básicos", icon: User },
  { id: 1, label: "% Grasa corporal", icon: Flame },
  { id: 2, label: "Actividad física", icon: Activity },
  { id: 3, label: "Gasto deportivo", icon: Dumbbell },
];

const RANGOS_GRASA_MUJER = [
  { label: "12–14%", value: 13, nivel: "Poco" as NivelGraso },
  { label: "15–17%", value: 16, nivel: "Poco" as NivelGraso },
  { label: "18–20%", value: 19, nivel: "Poco" as NivelGraso },
  { label: "21–23%", value: 22, nivel: "Medio" as NivelGraso },
  { label: "24–26%", value: 25, nivel: "Medio" as NivelGraso },
  { label: "27–29%", value: 28, nivel: "Medio" as NivelGraso },
  { label: "30–35%", value: 32, nivel: "Alto" as NivelGraso },
  { label: "36–40%", value: 38, nivel: "Alto" as NivelGraso },
  { label: "50%+", value: 50, nivel: "Alto" as NivelGraso },
];

const RANGOS_GRASA_HOMBRE = [
  { label: "3–4%", value: 3.5, nivel: "Poco" as NivelGraso },
  { label: "6–7%", value: 6.5, nivel: "Poco" as NivelGraso },
  { label: "10–12%", value: 11, nivel: "Poco" as NivelGraso },
  { label: "15%", value: 15, nivel: "Poco" as NivelGraso },
  { label: "20%", value: 20, nivel: "Medio" as NivelGraso },
  { label: "25%", value: 25, nivel: "Medio" as NivelGraso },
  { label: "30%", value: 30, nivel: "Alto" as NivelGraso },
  { label: "35%", value: 35, nivel: "Alto" as NivelGraso },
  { label: "40%", value: 40, nivel: "Alto" as NivelGraso },
];

const deportes: { key: keyof GastoDeporte; label: string; factor: number }[] = [
  { key: "futbolBaloncestoTrotar", label: "Fútbol, baloncesto, trotar", factor: 0.14 },
  { key: "pesas", label: "Entrenamiento de pesas", factor: 0.086 },
  { key: "caminar9min", label: "Caminar ligero (9 min/km)", factor: 0.12 },
  { key: "correr6min", label: "Correr a 6 min/km", factor: 0.184 },
  { key: "correr5min", label: "Correr a 5 min/km", factor: 0.21 },
  { key: "correr4_5min", label: "Correr a 4,5 min/km", factor: 0.245 },
  { key: "correr3_75min", label: "Correr a 3,75 min/km", factor: 0.28 },
  { key: "correr3_2min", label: "Correr a 3,2 min/km", factor: 0.315 },
  { key: "deportesRaqueta", label: "Raqueta, voley, nadar, bici (100W)", factor: 0.123 },
  { key: "escalada", label: "Escalada", factor: 0.193 },
];

export default function Home() {
  const [, navigate] = useLocation();
  const { state, updateDatosPersonales, updateGastoDeporte, calcular, setPasoActual } = useNutrition();
  // state.resultadosCalorias y state.pasoMaxAlcanzado usados en bienvenida
  const { datosPersonales, gastoDeporte } = state;

  const [paso, setPaso] = useState(0);
  const [imagenGrasa, setImagenGrasa] = useState<"mujer" | "hombre">(
    datosPersonales.genero === "Mujer" ? "mujer" : "hombre"
  );

  useEffect(() => {
    setImagenGrasa(datosPersonales.genero === "Mujer" ? "mujer" : "hombre");
  }, [datosPersonales.genero]);

  const avanzar = () => {
    if (paso < PASOS.length - 1) {
      setPaso(p => p + 1);
    } else {
      calcular();
      setPasoActual(1);
      navigate("/resultados");
    }
  };

  const retroceder = () => {
    if (paso > 0) setPaso(p => p - 1);
  };

  const rangosGrasa = datosPersonales.genero === "Mujer" ? RANGOS_GRASA_MUJER : RANGOS_GRASA_HOMBRE;

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">Calculadora Nutricional</h1>
        <p className="text-gray-400 text-xs md:text-sm mt-1">Completa los pasos para obtener tu plan personalizado</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1 md:gap-2 mb-6 md:mb-8 overflow-x-auto pb-2">
        {PASOS.map((p, idx) => {
          const Icon = p.icon;
          const isActive = idx === paso;
          const isDone = idx < paso;
          return (
            <div key={p.id} className="flex items-center gap-2">
              <button
                onClick={() => idx < paso && setPaso(idx)}
                className={cn(
                  "flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap",
                  isActive ? "bg-cyan-500 text-gray-950" :
                  isDone ? "bg-cyan-500/20 text-cyan-400 cursor-pointer hover:bg-cyan-500/30" :
                  "bg-gray-800 text-gray-500"
                )}
              >
                {isDone ? <Check size={12} /> : <Icon size={12} />}
                {p.label}
              </button>
              {idx < PASOS.length - 1 && (
                <ChevronRight size={14} className={isDone ? "text-cyan-500" : "text-gray-700"} />
              )}
            </div>
          );
        })}
      </div>

      {/* Pantalla de bienvenida (solo primera vez) */}
      {paso === 0 && !state.resultadosCalorias && state.pasoMaxAlcanzado === 0 && (
        <div className="mb-6 bg-gradient-to-r from-cyan-500/10 to-gray-900 border border-cyan-500/20 rounded-xl p-4 md:p-5 max-w-2xl">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h2 className="text-sm md:text-base font-semibold text-white mb-1">Bienvenido a NutritionFC</h2>
              <p className="text-xs md:text-sm text-gray-400">
                Completa los 4 pasos para obtener tu plan nutricional personalizado: calorías, macros, menú semanal y protocolo de competición.
              </p>
              <div className="flex gap-2 md:gap-4 mt-3 flex-wrap">
                {["Datos personales", "% Grasa corporal", "Actividad física", "Gasto deportivo"].map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                      <span className="text-cyan-400 text-xs font-bold">{i + 1}</span>
                    </div>
                    <span className="text-xs text-gray-400">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Paso 0: Datos básicos */}
      {paso === 0 && (
        <div className="max-w-2xl w-full">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6">
            <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
              <User size={18} className="text-cyan-400" /> Datos personales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {/* Género */}
              <div className="col-span-2">
                <Label className="text-gray-300 text-sm mb-2 block">Género</Label>
                <div className="flex gap-3">
                  {(["Mujer", "Hombre"] as Genero[]).map(g => (
                    <button
                      key={g}
                      onClick={() => updateDatosPersonales({ genero: g })}
                      className={cn(
                        "flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all",
                        datosPersonales.genero === g
                          ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400"
                          : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Peso */}
              <div>
                <Label className="text-gray-300 text-sm mb-1.5 block">Peso actual (kg)</Label>
                <Input
                  type="number"
                  value={datosPersonales.peso}
                  onChange={e => {
  const val = parseFloat(e.target.value);
  if (!isNaN(val)) updateDatosPersonales({ peso: val });
}}
                  className="bg-gray-800 border-gray-700 text-white focus:border-cyan-500"
                />
              </div>

              {/* Peso objetivo */}
              <div>
                <Label className="text-gray-300 text-sm mb-1.5 block">
                  Peso objetivo (kg)
                  <span className="text-gray-500 text-xs ml-1">(= mantener, &lt; perder, &gt; ganar)</span>
                </Label>
                <Input
                  type="number"
                  value={datosPersonales.pesoObjetivo}
                  onChange={e => {
  const val = parseFloat(e.target.value);
  if (!isNaN(val)) updateDatosPersonales({ pesoObjetivo: val });
}}
                  className="bg-gray-800 border-gray-700 text-white focus:border-cyan-500"
                />
              </div>

              {/* Edad */}
              <div>
                <Label className="text-gray-300 text-sm mb-1.5 block">Edad (años)</Label>
                <Input
                  type="number"
                  value={datosPersonales.edad}
                  onChange={e => {
  const val = parseInt(e.target.value);
  if (!isNaN(val)) updateDatosPersonales({ edad: val });
}}
                  className="bg-gray-800 border-gray-700 text-white focus:border-cyan-500"
                />
              </div>

              {/* Altura */}
              <div>
                <Label className="text-gray-300 text-sm mb-1.5 block">Altura (cm)</Label>
                <Input
                  type="number"
                  value={datosPersonales.altura}
                  onChange={e => {
  const val = parseFloat(e.target.value);
  if (!isNaN(val)) updateDatosPersonales({ altura: val });
}}
                  className="bg-gray-800 border-gray-700 text-white focus:border-cyan-500"
                />
              </div>

              {/* Tipo deportista */}
              <div className="col-span-2">
                <Label className="text-gray-300 text-sm mb-2 block">Tipo de deportista</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["No deportista", "Amateur", "Elite"] as TipoDeportista[]).map(t => (
                    <button
                      key={t}
                      onClick={() => updateDatosPersonales({ tipoDeportista: t })}
                      className={cn(
                        "py-2 rounded-lg border text-sm font-medium transition-all",
                        datosPersonales.tipoDeportista === t
                          ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400"
                          : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Objetivo calculado */}
            {datosPersonales.peso > 0 && datosPersonales.pesoObjetivo > 0 && (
              <div className={cn(
                "mt-4 px-4 py-2.5 rounded-lg border text-sm font-medium",
                datosPersonales.pesoObjetivo < datosPersonales.peso
                  ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                  : datosPersonales.pesoObjetivo > datosPersonales.peso
                  ? "bg-green-500/10 border-green-500/30 text-green-400"
                  : "bg-blue-500/10 border-blue-500/30 text-blue-400"
              )}>
                Objetivo: {
                  datosPersonales.pesoObjetivo < datosPersonales.peso ? "Pérdida de grasa" :
                  datosPersonales.pesoObjetivo > datosPersonales.peso ? "Ganancia de masa muscular" :
                  "Mantenimiento"
                }
              </div>
            )}
          </div>
        </div>
      )}

      {/* Paso 1: % Grasa corporal */}
      {paso === 1 && (
        <div className="max-w-4xl">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <Flame size={18} className="text-cyan-400" /> Porcentaje de grasa corporal
            </h2>
            <p className="text-gray-400 text-sm mb-5">
              Observa las imágenes de referencia y selecciona el rango que mejor se aproxime a tu situación actual.
            </p>

            {/* Selector de imagen */}
            <div className="flex gap-2 mb-5">
              {(["mujer", "hombre"] as const).map(g => (
                <button
                  key={g}
                  onClick={() => setImagenGrasa(g)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-medium border transition-all capitalize",
                    imagenGrasa === g
                      ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400"
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                  )}
                >
                  Referencia {g}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Imagen de referencia */}
              <div className="rounded-xl overflow-hidden border border-gray-700">
                <img
                  src={imagenGrasa === "mujer" ? IMG_MUJERES : IMG_HOMBRES}
                  alt={`Referencia % grasa ${imagenGrasa}`}
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Selector de rango */}
              <div>
                <p className="text-gray-300 text-sm font-medium mb-3">
                  Selecciona tu rango ({datosPersonales.genero}):
                </p>
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {rangosGrasa.map(rango => {
                    const isSelected = datosPersonales.porcentajeGraso === rango.value;
                    return (
                      <button
                        key={rango.label}
                        onClick={() => updateDatosPersonales({
                          porcentajeGraso: rango.value,
                          nivelGraso: rango.nivel,
                        })}
                        className={cn(
                          "py-2 px-3 rounded-lg border text-xs font-medium transition-all",
                          isSelected
                            ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400"
                            : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
                        )}
                      >
                        {rango.label}
                        <div className={cn(
                          "text-xs mt-0.5",
                          rango.nivel === "Poco" ? "text-green-400" :
                          rango.nivel === "Medio" ? "text-yellow-400" : "text-orange-400"
                        )}>
                          {rango.nivel}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Ajuste fino */}
                <div>
                  <Label className="text-gray-300 text-sm mb-1.5 block">
                    O introduce el valor exacto:
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={datosPersonales.porcentajeGraso}
                      onChange={e => {
  const val = parseFloat(e.target.value);
  if (!isNaN(val)) {
    const nivel: NivelGraso =
      datosPersonales.genero === "Mujer"
        ? val < 20 ? "Poco" : val < 30 ? "Medio" : "Alto"
        : val < 15 ? "Poco" : val < 25 ? "Medio" : "Alto";
    updateDatosPersonales({ porcentajeGraso: val, nivelGraso: nivel });
  }
}}
                      className="bg-gray-800 border-gray-700 text-white focus:border-cyan-500 w-24"
                    />
                    <span className="text-gray-400 text-sm">%</span>
                    <span className={cn(
                      "px-2 py-1 rounded text-xs font-medium",
                      datosPersonales.nivelGraso === "Poco" ? "bg-green-500/15 text-green-400" :
                      datosPersonales.nivelGraso === "Medio" ? "bg-yellow-500/15 text-yellow-400" :
                      "bg-orange-500/15 text-orange-400"
                    )}>
                      Nivel: {datosPersonales.nivelGraso}
                    </span>
                  </div>
                </div>

                {/* Info sobre niveles */}
                <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="flex items-start gap-2">
                    <Info size={14} className="text-cyan-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-gray-400">
                      El nivel de grasa determina el déficit calórico recomendado:
                      <span className="text-green-400"> Poco (10%)</span>,
                      <span className="text-yellow-400"> Medio (15%)</span>,
                      <span className="text-orange-400"> Alto (20%)</span>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Paso 2: Actividad física */}
      {paso === 2 && (
        <div className="max-w-2xl">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
              <Activity size={18} className="text-cyan-400" /> Nivel de actividad diaria
            </h2>

            {/* Pasos diarios */}
            <div className="mb-6">
              <Label className="text-gray-300 text-sm font-medium mb-3 block flex items-center gap-2">
                <Footprints size={14} className="text-cyan-400" /> Pasos diarios
              </Label>
              <div className="space-y-2">
                {([
                  { value: "Sedentario", desc: "Menos de 4.000 pasos/día" },
                  { value: "Activo", desc: "Entre 5.000 y 8.000 pasos/día" },
                  { value: "Muy activo", desc: "10.000 pasos o más" },
                ] as { value: PasosNivel; desc: string }[]).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateDatosPersonales({ pasosDiarios: opt.value })}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-lg border text-sm transition-all",
                      datosPersonales.pasosDiarios === opt.value
                        ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400"
                        : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
                    )}
                  >
                    <span className="font-medium">{opt.value}</span>
                    <span className="text-xs text-gray-500">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Factor de actividad calculado */}
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Factor de actividad calculado:</span>
                <span className="text-lg font-bold text-cyan-400">
                  ×{calcularFactorActividad(datosPersonales.pasosDiarios, datosPersonales.numEntrenamientos).toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Metabolismo total = Basal × {calcularFactorActividad(datosPersonales.pasosDiarios, datosPersonales.numEntrenamientos).toFixed(2)}
              </p>
            </div>

            {/* Número de entrenamientos */}
            <div>
              <Label className="text-gray-300 text-sm font-medium mb-3 block flex items-center gap-2">
                <Dumbbell size={14} className="text-cyan-400" /> Entrenamientos semanales
                <span className="text-gray-500 text-xs font-normal">(gym + campo)</span>
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {(["Ninguno", "Uno", "Dos", "Tres", "Cuatro", "Cinco", "Seis", "Siete", "Más siete"] as NumEntrenamientos[]).map(n => (
                  <button
                    key={n}
                    onClick={() => updateDatosPersonales({ numEntrenamientos: n })}
                    className={cn(
                      "py-2 rounded-lg border text-sm font-medium transition-all",
                      datosPersonales.numEntrenamientos === n
                        ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400"
                        : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Paso 3: Gasto deportivo */}
      {paso === 3 && (
        <div className="max-w-2xl">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <Dumbbell size={18} className="text-cyan-400" /> Gasto por deporte
            </h2>
            <p className="text-gray-400 text-sm mb-5">
              Introduce los minutos semanales de cada actividad. Deja en 0 las que no practiques.
            </p>

            <div className="space-y-3">
              {deportes.map(d => {
                const valor = gastoDeporte[d.key] as number;
                const gasto = d.factor * valor * datosPersonales.peso;
                return (
                  <div key={d.key} className="flex items-center gap-3">
                    <div className="flex-1">
                      <span className="text-sm text-gray-300">{d.label}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Input
                        type="number"
                        value={valor || ""}
                        placeholder="0"
                        onChange={e => updateGastoDeporte({ [d.key]: parseFloat(e.target.value) || 0 })}
                        className="bg-gray-800 border-gray-700 text-white focus:border-cyan-500 w-20 text-center"
                      />
                      <span className="text-gray-500 text-xs w-6">min</span>
                      {gasto > 0 && (
                        <span className="text-cyan-400 text-xs w-16 text-right">
                          {Math.round(gasto)} kcal
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total gasto */}
            {Object.values(gastoDeporte).some(v => v > 0) && (
              <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Gasto total semanal estimado:</span>
                  <span className="text-cyan-400 font-bold">
                    {Math.round(
                      deportes.reduce((sum, d) => sum + d.factor * (gastoDeporte[d.key] as number) * datosPersonales.peso, 0)
                    )} kcal
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navegación */}
      <div className="flex items-center gap-3 mt-6 max-w-2xl">
        {paso > 0 && (
          <Button
            variant="outline"
            onClick={retroceder}
            className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <ChevronLeft size={16} className="mr-1" /> Anterior
          </Button>
        )}
        <Button
          onClick={avanzar}
          className="bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-semibold ml-auto"
        >
          {paso === PASOS.length - 1 ? (
            <>Calcular mi plan <Check size={16} className="ml-1" /></>
          ) : (
            <>Siguiente <ChevronRight size={16} className="ml-1" /></>
          )}
        </Button>
      </div>
    </div>
  );
}
