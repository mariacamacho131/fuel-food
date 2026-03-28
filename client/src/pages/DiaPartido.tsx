/**
 * DiaPartido — Protocolo nutricional para día de competición
 * Design: Athletic Dashboard Oscuro — carbón + cian
 * Basado en la Hoja 5 del Excel: carga de hidratos pre-partido
 */

import { useLocation } from "wouter";
import { useNutrition } from "@/contexts/NutritionContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Trophy, Clock, Zap, Droplets, ChevronRight, ChevronLeft } from "lucide-react";

const IMG_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663411491932/HeqmeGRYAW4QbTnBi6aChF/image1_0745ef9b.png";

interface TiempoProtocolo {
  tiempo: string;
  descripcion: string;
  alimentos: string[];
  hc?: number;
  kcal?: number;
}

export default function DiaPartido() {
  const [, navigate] = useLocation();
  const { state } = useNutrition();
  const { macros: m, datosPersonales: d } = state;

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

  // Cálculos del día de partido (Hoja 5 del Excel)
  // Pre-partido: 2-3g HC/kg en las 3-4h previas
  const hcPrePartido = d.peso * 2.5;
  // Durante: 30-60g HC/hora
  const hcDurante60 = 60;
  const hcDurante45 = 45;
  // Post: 1-1.2g HC/kg + 0.3g Prot/kg
  const hcPost = d.peso * 1.1;
  const protPost = d.peso * 0.3;

  // Hidratación
  const aguaPrePartido = d.peso * 5; // 5ml/kg 2h antes
  const aguaDurante = 500; // 500ml/h
  const aguaPost = d.peso * 1.5; // 1.5L/kg perdido (estimado)

  const protocolo: TiempoProtocolo[] = [
    {
      tiempo: "Noche anterior",
      descripcion: "Cena de carga de glucógeno",
      alimentos: [
        "Pasta o arroz: " + Math.round(d.peso * 2) + "g",
        "Proteína magra: " + Math.round(d.peso * 0.3) + "g",
        "Verduras cocidas",
        "Evitar fibra excesiva y grasas",
      ],
      hc: d.peso * 2,
      kcal: d.peso * 2 * 4 + d.peso * 0.3 * 4,
    },
    {
      tiempo: "3-4h antes",
      descripcion: "Comida pre-partido principal",
      alimentos: [
        "Arroz o pasta: " + Math.round(hcPrePartido * 0.6) + "g",
        "Pollo o pavo: " + Math.round(d.peso * 0.3) + "g",
        "Verduras cocidas (poca fibra)",
        "Aceite de oliva: 1 cucharada",
      ],
      hc: hcPrePartido * 0.6,
      kcal: hcPrePartido * 0.6 * 4 + d.peso * 0.3 * 4,
    },
    {
      tiempo: "1-2h antes",
      descripcion: "Snack pre-partido",
      alimentos: [
        "Plátano o dátiles: " + Math.round(hcPrePartido * 0.3) + "g HC",
        "Tortitas de arroz: 2-3 unidades",
        "Gel energético (opcional)",
      ],
      hc: hcPrePartido * 0.3,
      kcal: hcPrePartido * 0.3 * 4,
    },
    {
      tiempo: "30min antes",
      descripcion: "Activación final",
      alimentos: [
        "Cafeína: " + Math.round(m.cafeina) + "mg",
        "Gel energético: 1 unidad (25g HC)",
        "Agua: " + aguaPrePartido + "ml",
      ],
      hc: 25,
    },
    {
      tiempo: "Durante (cada 45-60min)",
      descripcion: "Reposición energética",
      alimentos: [
        "Gel energético: 1 unidad (" + hcDurante45 + "-" + hcDurante60 + "g HC)",
        "Bebida isotónica: 500ml",
        "Plátano (si hay descanso)",
        "Agua: " + aguaDurante + "ml/h",
      ],
      hc: hcDurante45,
    },
    {
      tiempo: "0-30min post",
      descripcion: "Recuperación inmediata",
      alimentos: [
        "Proteína: " + Math.round(protPost) + "g (whey o leche)",
        "HC rápidos: " + Math.round(hcPost * 0.5) + "g (plátano, dátiles)",
        "Agua: 500ml mínimo",
      ],
      hc: hcPost * 0.5,
      kcal: protPost * 4 + hcPost * 0.5 * 4,
    },
    {
      tiempo: "1-2h post",
      descripcion: "Comida de recuperación",
      alimentos: [
        "Arroz o patata: " + Math.round(hcPost * 0.5) + "g HC",
        "Carne o pescado: " + Math.round(d.peso * 0.4) + "g",
        "Verduras variadas",
        "Aceite de oliva",
      ],
      hc: hcPost * 0.5,
      kcal: hcPost * 0.5 * 4 + d.peso * 0.4 * 4,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Trophy size={22} className="text-yellow-400" /> Día de Partido
          </h1>
          <p className="text-gray-400 text-sm mt-1">Protocolo nutricional para competición</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/menu-b")}
            className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent">
            <ChevronLeft size={16} className="mr-1" /> Menú B
          </Button>
          <Button onClick={() => navigate("/alimentos")} className="bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-semibold">
            Alimentos <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
      </div>

      {/* Resumen de necesidades */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-amber-400" />
            <span className="text-xs text-gray-400">HC Pre-partido</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">{Math.round(hcPrePartido)}g</p>
          <p className="text-xs text-gray-500">2.5 gr/kg · 3-4h antes</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-blue-400" />
            <span className="text-xs text-gray-400">HC Durante</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">30-60g</p>
          <p className="text-xs text-gray-500">Por hora de juego</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-green-400" />
            <span className="text-xs text-gray-400">HC Post</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{Math.round(hcPost)}g</p>
          <p className="text-xs text-gray-500">1.1 gr/kg · 0-2h post</p>
        </div>
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Droplets size={14} className="text-cyan-400" />
            <span className="text-xs text-gray-400">Hidratación</span>
          </div>
          <p className="text-2xl font-bold text-cyan-400">{aguaPrePartido}ml</p>
          <p className="text-xs text-gray-500">5ml/kg · 2h antes</p>
        </div>
      </div>

      {/* Protocolo temporal */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5 flex items-center gap-2">
          <Clock size={14} className="text-cyan-400" /> Protocolo temporal
        </h2>
        <div className="relative">
          {/* Línea vertical */}
          <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-700" />
          <div className="space-y-5">
            {protocolo.map((item, idx) => (
              <div key={idx} className="flex gap-4 relative">
                {/* Punto */}
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 z-10",
                  idx === 3 ? "bg-yellow-500/20 border-yellow-500" :
                  idx === 4 ? "bg-cyan-500/20 border-cyan-500" :
                  idx >= 5 ? "bg-green-500/20 border-green-500" :
                  "bg-gray-800 border-gray-600"
                )}>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    idx === 3 ? "bg-yellow-400" :
                    idx === 4 ? "bg-cyan-400" :
                    idx >= 5 ? "bg-green-400" :
                    "bg-gray-500"
                  )} />
                </div>
                {/* Contenido */}
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "text-xs font-bold",
                      idx === 3 ? "text-yellow-400" :
                      idx === 4 ? "text-cyan-400" :
                      idx >= 5 ? "text-green-400" :
                      "text-gray-300"
                    )}>
                      {item.tiempo}
                    </span>
                    {item.hc && (
                      <span className="text-xs text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                        ~{Math.round(item.hc)}g HC
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{item.descripcion}</p>
                  <ul className="space-y-0.5">
                    {item.alimentos.map((a, i) => (
                      <li key={i} className="text-xs text-gray-300 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-gray-600 shrink-0" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notas importantes */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Notas importantes
        </h2>
        <div className="space-y-2">
          {[
            "Nunca pruebes alimentos o estrategias nuevas el día del partido. Usa lo que ya conoces.",
            "La carga de glucógeno es más efectiva si los días previos has reducido el entrenamiento.",
            "Evita alimentos ricos en fibra, grasas y proteínas de difícil digestión en las 3h previas.",
            "La cafeína (" + Math.round(m.cafeina) + "mg) debe tomarse 45-60 minutos antes del calentamiento.",
            "Si el partido es por la tarde, el desayuno puede ser más abundante en HC.",
          ].map((nota, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-cyan-400 text-xs mt-0.5 shrink-0">•</span>
              <p className="text-xs text-gray-400">{nota}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
