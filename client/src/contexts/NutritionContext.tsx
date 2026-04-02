/**
 * NutritionContext — Estado global y motor de cálculo de NutritionFC
 * Design: Athletic Dashboard Oscuro — carbón + cian + verde lima
 *
 * Implementa FIELMENTE todas las fórmulas del Excel:
 * - Hoja 1: Metabolismo basal (6 fórmulas), total, objetivo, gasto deportivo, composición corporal
 * - Hoja 2: Macronutrientes (proteína, grasas, hidratos por descarte), intercambios por comida
 * - Hojas 3-5: Menú Día A, Día B, Día de Partido
 */

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";

const STORAGE_KEY = "nutrition-fc-state-v1";

function loadFromStorage(): Partial<NutritionState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveToStorage(state: NutritionState) {
  try {
    // No guardar los alimentos base para ahorrar espacio; solo los custom
    const customAlimentos = state.alimentos.filter(a => a.id.startsWith("custom-"));
    const toSave = { ...state, alimentos: customAlimentos };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // silencioso
  }
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type Genero = "Mujer" | "Hombre";
export type TipoDeportista = "No deportista" | "Amateur" | "Elite";
export type PasosNivel = "Sedentario" | "Activo" | "Muy activo";
export type NumEntrenamientos = "Ninguno" | "Uno" | "Dos" | "Tres" | "Cuatro" | "Cinco" | "Seis" | "Siete" | "Más siete";
export type NivelGraso = "Poco" | "Medio" | "Alto";

export interface DatosPersonales {
  peso: number;
  pesoObjetivo: number;
  edad: number;
  altura: number;
  porcentajeGraso: number; // valor numérico introducido por el usuario
  nivelGraso: NivelGraso; // "Poco" | "Medio" | "Alto"
  genero: Genero;
  tipoDeportista: TipoDeportista;
  pasosDiarios: PasosNivel;
  numEntrenamientos: NumEntrenamientos;
}

export interface GastoDeporte {
  futbolBaloncestoTrotar: number;
  pesas: number;
  caminar9min: number;
  correr6min: number;
  correr5min: number;
  correr4_5min: number;
  correr3_75min: number;
  correr3_2min: number;
  deportesRaqueta: number;
  escalada: number;
}

export interface ResultadosCalcCalorias {
  metabolismoBasal: number;
  metabolismoTotal: number;
  objetivo: "Pérdida de grasa" | "Ganancia de masa muscular" | "Mantenimiento";
  caloriasConsumir: number;
  gastoDeporte: number;
  masaGrasa: number;
  masaLibreGrasa: number;
  disponibilidadEnergetica: number;
  limiteMinimo: number;
  kgAPerder: number;
  porcentajePerdidaSemanal: number;
  kgPerdidaSemanal: number;
  semanasEstimadas: number;
  // Calorías por objetivo
  caloriasMantenimiento: number;
  caloriasGanancia: number;
  caloriasPerdida: number;
}

export interface MacroNutrientes {
  proteinaGrKg: number;
  proteinaGrTotal: number;
  proteinaKcal: number;
  proteinaPct: number;
  proteinaIntercambios: number;

  grasasGrKg: number;
  grasasGrTotal: number;
  grasasKcal: number;
  grasasPct: number;
  grasasIntercambios: number;

  hidratosGrKg: number;
  hidratosGrTotal: number;
  hidratosKcal: number;
  hidratosPct: number;
  hidratosIntercambios: number;

  kcalTotales: number;

  // Suplementos
  creatina: number;
  cafeina: number;
  betaAlanina: number;

  // Hidratos día off
  hidratosOffGrKg: number;
}

export interface DistribucionComida {
  hc: number;
  proteina: number;
  grasa: number;
}

export interface DistribucionDia {
  desayuno: DistribucionComida;
  comida: DistribucionComida;
  merienda: DistribucionComida;
  cena: DistribucionComida;
  post: DistribucionComida;
  lacteos: number; // número de raciones de lácteos (restan 0.5 HC)
}

export interface Alimento {
  id: string;
  nombre: string;
  categoria: "carbohidrato" | "proteina" | "grasa";
  gramosPorRacion: number;
  kcalPor100g: number;
  hcPor100g: number;
  proteinaPor100g: number;
  grasaPor100g: number;
  nota?: string;
}

export interface NutritionState {
  // Paso actual del wizard
  pasoActual: number;
  pasoMaxAlcanzado: number;

  // Datos de entrada
  datosPersonales: DatosPersonales;
  gastoDeporte: GastoDeporte;

  // Resultados calculados
  resultadosCalorias: ResultadosCalcCalorias | null;
  macros: MacroNutrientes | null;

  // Distribución de intercambios
  distribucionDiaA: DistribucionDia;
  distribucionDiaB: DistribucionDia;

  // Base de datos de alimentos
  alimentos: Alimento[];
}

// ─── Datos iniciales ──────────────────────────────────────────────────────────

const datosIniciales: DatosPersonales = {
  peso: 65,
  pesoObjetivo: 58,
  edad: 25,
  altura: 164,
  porcentajeGraso: 25,
  nivelGraso: "Medio",
  genero: "Mujer",
  tipoDeportista: "Amateur",
  pasosDiarios: "Sedentario",
  numEntrenamientos: "Dos",
};

const gastoInicialDeporte: GastoDeporte = {
  futbolBaloncestoTrotar: 0,
  pesas: 0,
  caminar9min: 0,
  correr6min: 0,
  correr5min: 0,
  correr4_5min: 0,
  correr3_75min: 0,
  correr3_2min: 0,
  deportesRaqueta: 0,
  escalada: 0,
};

// ─── Base de datos de alimentos (del Excel) ───────────────────────────────────

export const alimentosBase: Alimento[] = [
  // CARBOHIDRATOS — Desayuno/Merienda
  { id: "pan-integral", nombre: "Pan integral o blanco", categoria: "carbohidrato", gramosPorRacion: 30, kcalPor100g: 265, hcPor100g: 50, proteinaPor100g: 8, grasaPor100g: 2 },
  { id: "avena", nombre: "Avena o Harina", categoria: "carbohidrato", gramosPorRacion: 30, kcalPor100g: 375, hcPor100g: 66, proteinaPor100g: 13, grasaPor100g: 7 },
  { id: "copos-maiz", nombre: "Copos de maíz", categoria: "carbohidrato", gramosPorRacion: 30, kcalPor100g: 370, hcPor100g: 84, proteinaPor100g: 7, grasaPor100g: 1 },
  { id: "pan-tostado", nombre: "Pan tostado integral", categoria: "carbohidrato", gramosPorRacion: 2, kcalPor100g: 380, hcPor100g: 70, proteinaPor100g: 10, grasaPor100g: 5 },
  { id: "tortitas-maiz", nombre: "Tortitas de maíz o arroz", categoria: "carbohidrato", gramosPorRacion: 4, kcalPor100g: 390, hcPor100g: 82, proteinaPor100g: 7, grasaPor100g: 2 },
  { id: "pan-thins", nombre: "Pan thins sandwich", categoria: "carbohidrato", gramosPorRacion: 1, kcalPor100g: 240, hcPor100g: 48, proteinaPor100g: 9, grasaPor100g: 2 },
  { id: "pan-wasa", nombre: "Pan wasa", categoria: "carbohidrato", gramosPorRacion: 4, kcalPor100g: 340, hcPor100g: 67, proteinaPor100g: 10, grasaPor100g: 3 },
  { id: "fajitas-trigo", nombre: "Fajitas trigo normal (40gr)", categoria: "carbohidrato", gramosPorRacion: 1, kcalPor100g: 310, hcPor100g: 53, proteinaPor100g: 9, grasaPor100g: 7 },
  { id: "fajitas-pequenas", nombre: "Fajitas pequeñas (20gr)", categoria: "carbohidrato", gramosPorRacion: 2, kcalPor100g: 310, hcPor100g: 53, proteinaPor100g: 9, grasaPor100g: 7 },
  { id: "miel-datil", nombre: "Miel o Dátil", categoria: "carbohidrato", gramosPorRacion: 30, kcalPor100g: 300, hcPor100g: 75, proteinaPor100g: 1, grasaPor100g: 0 },
  { id: "fruta", nombre: "Fruta (pieza mediana)", categoria: "carbohidrato", gramosPorRacion: 1, kcalPor100g: 55, hcPor100g: 13, proteinaPor100g: 1, grasaPor100g: 0 },
  // CARBOHIDRATOS — Comida/Cena
  { id: "arroz-pasta-seco", nombre: "Arroz, Quinoa o Pasta seco", categoria: "carbohidrato", gramosPorRacion: 30, kcalPor100g: 350, hcPor100g: 75, proteinaPor100g: 8, grasaPor100g: 1 },
  { id: "arroz-pasta-cocido", nombre: "Arroz, Quinoa Pasta cocido", categoria: "carbohidrato", gramosPorRacion: 100, kcalPor100g: 130, hcPor100g: 27, proteinaPor100g: 3, grasaPor100g: 0 },
  { id: "vasitos-quinoa", nombre: "Vasitos de quinoa cocida", categoria: "carbohidrato", gramosPorRacion: 1, kcalPor100g: 120, hcPor100g: 22, proteinaPor100g: 4, grasaPor100g: 2 },
  { id: "patata", nombre: "Patata", categoria: "carbohidrato", gramosPorRacion: 120, kcalPor100g: 80, hcPor100g: 17, proteinaPor100g: 2, grasaPor100g: 0 },
  { id: "boniato", nombre: "Boniato", categoria: "carbohidrato", gramosPorRacion: 100, kcalPor100g: 90, hcPor100g: 20, proteinaPor100g: 2, grasaPor100g: 0 },
  { id: "pasta-legumbre", nombre: "Pasta de legumbre", categoria: "carbohidrato", gramosPorRacion: 50, kcalPor100g: 340, hcPor100g: 55, proteinaPor100g: 22, grasaPor100g: 3 },
  { id: "legumbre-seco", nombre: "Legumbre en seco", categoria: "carbohidrato", gramosPorRacion: 40, kcalPor100g: 340, hcPor100g: 60, proteinaPor100g: 23, grasaPor100g: 1 },
  { id: "legumbre-cocida", nombre: "Legumbre cocida", categoria: "carbohidrato", gramosPorRacion: 200, kcalPor100g: 130, hcPor100g: 22, proteinaPor100g: 8, grasaPor100g: 0 },
  { id: "noquis", nombre: "Ñoquis", categoria: "carbohidrato", gramosPorRacion: 70, kcalPor100g: 160, hcPor100g: 32, proteinaPor100g: 4, grasaPor100g: 1 },
  { id: "ravioli-carne", nombre: "Ravioli de carne", categoria: "carbohidrato", gramosPorRacion: 75, kcalPor100g: 200, hcPor100g: 25, proteinaPor100g: 10, grasaPor100g: 7 },
  { id: "pan-comida", nombre: "Pan", categoria: "carbohidrato", gramosPorRacion: 40, kcalPor100g: 265, hcPor100g: 50, proteinaPor100g: 8, grasaPor100g: 2 },
  // PROTEÍNAS — Desayuno/Merienda
  { id: "leche", nombre: "Vaso de leche (250ml)", categoria: "proteina", gramosPorRacion: 250, kcalPor100g: 47, hcPor100g: 5, proteinaPor100g: 3.2, grasaPor100g: 1.5 },
  { id: "jamon-serrano", nombre: "Jamón serrano", categoria: "proteina", gramosPorRacion: 80, kcalPor100g: 250, hcPor100g: 0, proteinaPor100g: 30, grasaPor100g: 14 },
  { id: "pavo", nombre: "Pavo", categoria: "proteina", gramosPorRacion: 100, kcalPor100g: 107, hcPor100g: 0, proteinaPor100g: 22, grasaPor100g: 2 },
  { id: "queso-cottage", nombre: "Queso cottage", categoria: "proteina", gramosPorRacion: 200, kcalPor100g: 98, hcPor100g: 3, proteinaPor100g: 11, grasaPor100g: 4 },
  { id: "salmon-ahumado", nombre: "Salmón ahumado", categoria: "proteina", gramosPorRacion: 100, kcalPor100g: 180, hcPor100g: 0, proteinaPor100g: 25, grasaPor100g: 9 },
  { id: "queso-burgos", nombre: "Queso burgos", categoria: "proteina", gramosPorRacion: 240, kcalPor100g: 130, hcPor100g: 2, proteinaPor100g: 10, grasaPor100g: 9 },
  { id: "huevos", nombre: "Huevos", categoria: "proteina", gramosPorRacion: 4, kcalPor100g: 155, hcPor100g: 1, proteinaPor100g: 13, grasaPor100g: 11 },
  { id: "claras", nombre: "Claras de huevo", categoria: "proteina", gramosPorRacion: 4, kcalPor100g: 52, hcPor100g: 1, proteinaPor100g: 11, grasaPor100g: 0 },
  { id: "whey", nombre: "Whey (1 cazo)", categoria: "proteina", gramosPorRacion: 1, kcalPor100g: 380, hcPor100g: 8, proteinaPor100g: 75, grasaPor100g: 5 },
  { id: "yogur-natural", nombre: "Yogur natural", categoria: "proteina", gramosPorRacion: 4, kcalPor100g: 60, hcPor100g: 5, proteinaPor100g: 4, grasaPor100g: 2 },
  { id: "yogur-proteico", nombre: "Yogur proteico", categoria: "proteina", gramosPorRacion: 250, kcalPor100g: 70, hcPor100g: 5, proteinaPor100g: 10, grasaPor100g: 0 },
  // PROTEÍNAS — Comida/Cena
  { id: "carne-blanca", nombre: "Carne blanca (pollo, pavo)", categoria: "proteina", gramosPorRacion: 100, kcalPor100g: 165, hcPor100g: 0, proteinaPor100g: 31, grasaPor100g: 4 },
  { id: "pescado-blanco", nombre: "Pescado blanco", categoria: "proteina", gramosPorRacion: 130, kcalPor100g: 90, hcPor100g: 0, proteinaPor100g: 20, grasaPor100g: 1 },
  { id: "calamar-sepia", nombre: "Calamar, sepia", categoria: "proteina", gramosPorRacion: 150, kcalPor100g: 92, hcPor100g: 2, proteinaPor100g: 18, grasaPor100g: 1 },
  { id: "lomo-picada", nombre: "Lomo, carne picada", categoria: "proteina", gramosPorRacion: 120, kcalPor100g: 200, hcPor100g: 0, proteinaPor100g: 26, grasaPor100g: 10 },
  { id: "pescado-azul", nombre: "Pescado azul (salmón, caballa)", categoria: "proteina", gramosPorRacion: 120, kcalPor100g: 200, hcPor100g: 0, proteinaPor100g: 20, grasaPor100g: 13 },
  { id: "carne-roja", nombre: "Carne roja", categoria: "proteina", gramosPorRacion: 130, kcalPor100g: 250, hcPor100g: 0, proteinaPor100g: 26, grasaPor100g: 15 },
  { id: "queso-fresco", nombre: "Queso fresco", categoria: "proteina", gramosPorRacion: 100, kcalPor100g: 130, hcPor100g: 2, proteinaPor100g: 10, grasaPor100g: 9 },
  { id: "tofu", nombre: "Tofu", categoria: "proteina", gramosPorRacion: 220, kcalPor100g: 80, hcPor100g: 2, proteinaPor100g: 8, grasaPor100g: 5 },
  { id: "tempeh-seitan", nombre: "Tempeh, seitán, heura", categoria: "proteina", gramosPorRacion: 120, kcalPor100g: 190, hcPor100g: 10, proteinaPor100g: 20, grasaPor100g: 7 },
  { id: "queso-fresco-entero", nombre: "Queso fresco entero", categoria: "proteina", gramosPorRacion: 250, kcalPor100g: 130, hcPor100g: 2, proteinaPor100g: 10, grasaPor100g: 9 },
  { id: "pasta-legumbre-prot", nombre: "Pasta de legumbre (proteína)", categoria: "proteina", gramosPorRacion: 50, kcalPor100g: 340, hcPor100g: 55, proteinaPor100g: 22, grasaPor100g: 3 },
  { id: "soja-texturizada", nombre: "Soja texturizada", categoria: "proteina", gramosPorRacion: 50, kcalPor100g: 330, hcPor100g: 30, proteinaPor100g: 50, grasaPor100g: 3 },
  // GRASAS
  { id: "aceite-oliva", nombre: "Aceite de Oliva", categoria: "grasa", gramosPorRacion: 10, kcalPor100g: 900, hcPor100g: 0, proteinaPor100g: 0, grasaPor100g: 100 },
  { id: "aguacate", nombre: "Aguacate", categoria: "grasa", gramosPorRacion: 50, kcalPor100g: 160, hcPor100g: 2, proteinaPor100g: 2, grasaPor100g: 15 },
  { id: "queso-curado", nombre: "Queso curado", categoria: "grasa", gramosPorRacion: 25, kcalPor100g: 400, hcPor100g: 1, proteinaPor100g: 25, grasaPor100g: 33 },
  { id: "frutos-secos", nombre: "Frutos secos", categoria: "grasa", gramosPorRacion: 20, kcalPor100g: 600, hcPor100g: 10, proteinaPor100g: 20, grasaPor100g: 55 },
  { id: "hummus", nombre: "Hummus", categoria: "grasa", gramosPorRacion: 40, kcalPor100g: 170, hcPor100g: 15, proteinaPor100g: 8, grasaPor100g: 10 },
  { id: "mahonesa", nombre: "Mahonesa", categoria: "grasa", gramosPorRacion: 13, kcalPor100g: 680, hcPor100g: 1, proteinaPor100g: 1, grasaPor100g: 75 },
  { id: "quesos-oveja-cabra", nombre: "Quesos (oveja, cabra)", categoria: "grasa", gramosPorRacion: 30, kcalPor100g: 370, hcPor100g: 1, proteinaPor100g: 22, grasaPor100g: 30 },
  { id: "chocolate-negro", nombre: "Chocolate negro", categoria: "grasa", gramosPorRacion: 20, kcalPor100g: 550, hcPor100g: 40, proteinaPor100g: 7, grasaPor100g: 40 },
  { id: "semillas-chia", nombre: "Semillas de Chía", categoria: "grasa", gramosPorRacion: 35, kcalPor100g: 490, hcPor100g: 42, proteinaPor100g: 17, grasaPor100g: 31 },
];

// ─── Motor de Cálculo (fiel al Excel) ─────────────────────────────────────────

export function calcularMetabolismoBasal(d: DatosPersonales): number {
  const { peso, edad, altura, genero, tipoDeportista } = d;
  if (genero === "Mujer") {
    if (tipoDeportista === "No deportista") {
      // Owen: 795 + (7.18 * Peso)
      return 795 + 7.18 * peso;
    } else if (tipoDeportista === "Elite") {
      // Teen Half: (11.936 * Peso) + (587.728 * (Altura/100)) - (8.129 * Edad)
      return 11.936 * peso + 587.728 * (altura / 100) - 8.129 * edad;
    } else {
      // Amateur — Harris: 655.095 + (9.563 * Peso) + (1.844 * Altura) - (4.675 * Edad)
      return 655.095 + 9.563 * peso + 1.844 * altura - 4.675 * edad;
    }
  } else {
    if (tipoDeportista === "No deportista") {
      // Mifflin: 10 * Peso + 6.25 * Altura - 5 * Edad + 5
      return 10 * peso + 6.25 * altura - 5 * edad + 5;
    } else if (tipoDeportista === "Elite") {
      // Lorenzo: -857 + (9 * Peso) + (11.7 * Altura)
      return -857 + 9 * peso + 11.7 * altura;
    } else {
      // Amateur — Harris: 66.473 + (13.751 * Peso) + (5.003 * Altura) - (6.775 * Edad)
      return 66.473 + 13.751 * peso + 5.003 * altura - 6.775 * edad;
    }
  }
}

export function calcularFactorActividad(pasos: PasosNivel, entrenos: NumEntrenamientos): number {
  const tabla: Record<PasosNivel, Record<NumEntrenamientos, number>> = {
    Sedentario: {
      Ninguno: 1.2, Uno: 1.2, Dos: 1.3, Tres: 1.4, Cuatro: 1.5,
      Cinco: 1.5, Seis: 1.5, Siete: 1.5, "Más siete": 1.5,
    },
    Activo: {
      Ninguno: 1.3, Uno: 1.3, Dos: 1.4, Tres: 1.5, Cuatro: 1.6,
      Cinco: 1.7, Seis: 1.8, Siete: 1.9, "Más siete": 2.0,
    },
    "Muy activo": {
      Ninguno: 1.4, Uno: 1.4, Dos: 1.5, Tres: 1.6, Cuatro: 1.7,
      Cinco: 1.8, Seis: 1.9, Siete: 2.0, "Más siete": 2.2,
    },
  };
  return tabla[pasos][entrenos] ?? 1.2;
}

export function calcularGastoDeporte(g: GastoDeporte, peso: number): number {
  return (
    0.14 * g.futbolBaloncestoTrotar * peso +
    0.086 * g.pesas * peso +
    0.12 * g.caminar9min * peso +
    0.184 * g.correr6min * peso +
    0.21 * g.correr5min * peso +
    0.245 * g.correr4_5min * peso +
    0.28 * g.correr3_75min * peso +
    0.315 * g.correr3_2min * peso +
    0.123 * g.deportesRaqueta * peso +
    0.193 * g.escalada * peso
  );
}

export function calcularResultadosCalorias(
  d: DatosPersonales,
  g: GastoDeporte
): ResultadosCalcCalorias {
  const mb = calcularMetabolismoBasal(d);
  const factor = calcularFactorActividad(d.pasosDiarios, d.numEntrenamientos);
  const metabolismoTotal = mb * factor;

  const objetivo: ResultadosCalcCalorias["objetivo"] =
    d.pesoObjetivo < d.peso
      ? "Pérdida de grasa"
      : d.pesoObjetivo > d.peso
      ? "Ganancia de masa muscular"
      : "Mantenimiento";

  const gastoDeporte = calcularGastoDeporte(g, d.peso);

  const masaGrasa = d.peso * (d.porcentajeGraso / 100);
  const masaLibreGrasa = d.peso - masaGrasa;
  const limiteMinimo = 40 * masaLibreGrasa;

  // Calorías por objetivo (fórmulas del Excel)
  const caloriasMantenimiento = metabolismoTotal;
  const caloriasGanancia = metabolismoTotal * 1.15;

  // Déficit según nivel de grasa
  const pctDeficit = d.nivelGraso === "Poco" ? 0.10 : d.nivelGraso === "Medio" ? 0.15 : 0.20;
  const caloriasPerdida = metabolismoTotal * (1 - pctDeficit);

  const caloriasConsumir =
    objetivo === "Pérdida de grasa"
      ? caloriasPerdida
      : objetivo === "Ganancia de masa muscular"
      ? caloriasGanancia
      : caloriasMantenimiento;

  const disponibilidadEnergetica =
    masaLibreGrasa > 0
      ? (caloriasConsumir - gastoDeporte) / masaLibreGrasa
      : 0;

  const kgAPerder = Math.max(0, d.peso - d.pesoObjetivo);
  const porcentajePerdidaSemanal =
    d.nivelGraso === "Poco" ? 0.25 : d.nivelGraso === "Medio" ? 0.5 : 0.75;
  const kgPerdidaSemanal = (porcentajePerdidaSemanal * d.peso) / 100;
  const semanasEstimadas = kgPerdidaSemanal > 0 ? kgAPerder / kgPerdidaSemanal : 0;

  return {
    metabolismoBasal: mb,
    metabolismoTotal,
    objetivo,
    caloriasConsumir,
    gastoDeporte,
    masaGrasa,
    masaLibreGrasa,
    disponibilidadEnergetica,
    limiteMinimo,
    kgAPerder,
    porcentajePerdidaSemanal,
    kgPerdidaSemanal,
    semanasEstimadas,
    caloriasMantenimiento,
    caloriasGanancia,
    caloriasPerdida,
  };
}

export function calcularMacros(
  d: DatosPersonales,
  res: ResultadosCalcCalorias
): MacroNutrientes {
  const { peso, genero, nivelGraso } = d;
  const { objetivo, caloriasConsumir } = res;

  // Proteína (gr/kg) — fórmula K12 del Excel
  let proteinaGrKg: number;
  if (
    (genero === "Mujer" && peso >= 70 && (nivelGraso === "Alto" || nivelGraso === "Medio")) ||
    (genero === "Hombre" && peso >= 80 && (nivelGraso === "Alto" || nivelGraso === "Medio"))
  ) {
    proteinaGrKg = 2.0;
  } else {
    proteinaGrKg = 2.2;
  }

  // Grasas (gr/kg) — fórmula K13 del Excel
  let grasasGrKg: number;
  if (objetivo === "Pérdida de grasa") {
    if (genero === "Mujer") {
      if (peso >= 75) grasasGrKg = 0.8;
      else if (peso >= 70) grasasGrKg = 0.9;
      else if (peso >= 65) grasasGrKg = 0.9;
      else if (peso >= 60) grasasGrKg = 1.0;
      else if (peso >= 55) grasasGrKg = 1.0;
      else grasasGrKg = 1.1;
    } else {
      if (peso >= 75) grasasGrKg = 0.8;
      else if (peso >= 70) grasasGrKg = 0.8;
      else if (peso >= 65) grasasGrKg = 0.9;
      else if (peso >= 60) grasasGrKg = 0.9;
      else if (peso >= 55) grasasGrKg = 1.0;
      else grasasGrKg = 1.1;
    }
  } else if (objetivo === "Mantenimiento") {
    if (peso >= 70) grasasGrKg = 1.0;
    else if (peso >= 60) grasasGrKg = 1.1;
    else if (peso >= 55) grasasGrKg = 1.1;
    else grasasGrKg = 1.2;
  } else {
    // Ganancia
    if (peso >= 70) grasasGrKg = 1.1;
    else if (peso >= 60) grasasGrKg = 1.2;
    else if (peso >= 55) grasasGrKg = 1.3;
    else grasasGrKg = 1.4;
  }

  const proteinaGrTotal = peso * proteinaGrKg;
  const proteinaKcal = proteinaGrTotal * 4;
  const grasasGrTotal = peso * grasasGrKg;
  const grasasKcal = grasasGrTotal * 9;

  // Hidratos por descarte — fórmula K14 del Excel
  const hidratosKcal = caloriasConsumir - proteinaKcal - grasasKcal;
  const hidratosGrTotal = hidratosKcal / 4;
  const hidratosGrKg = hidratosGrTotal / peso;
  if (caloriasConsumir <= 0) {
  return {
    proteinaGrKg: 0,
    proteinaGrTotal: 0,
    proteinaKcal: 0,
    proteinaPct: 0,
    proteinaIntercambios: 0,
    grasasGrKg: 0,
    grasasGrTotal: 0,
    grasasKcal: 0,
    grasasPct: 0,
    grasasIntercambios: 0,
    hidratosGrKg: 0,
    hidratosGrTotal: 0,
    hidratosKcal: 0,
    hidratosPct: 0,
    hidratosIntercambios: 0,
    kcalTotales: 0,
    creatina: 0,
    cafeina: 0,
    betaAlanina: 0,
    hidratosOffGrKg: 0,
  };
}

  const proteinaPct = (proteinaKcal / caloriasConsumir) * 100;
  const grasasPct = (grasasKcal / caloriasConsumir) * 100;
  const hidratosPct = (hidratosKcal / caloriasConsumir) * 100;

  // Intercambios (1 intercambio = 100 kcal)
  const proteinaIntercambios = proteinaKcal / 100;
  const grasasIntercambios = grasasKcal / 100;
  const hidratosIntercambios = hidratosKcal / 100;

  // Suplementos
  const creatina = peso * 0.1;
  const cafeina = peso * 3;
  const betaAlanina = peso * 65;

  // Hidratos día off (fórmula J30 del Excel)
  const hidratosOffGrKg = (() => {
    const h = hidratosGrKg;
    if (h > 7.5) return h - 2.3;
    if (h >= 6.5) return h - 2.1;
    if (h >= 5.5) return h - 2.0;
    if (h >= 5.0) return h - 1.5;
    if (h >= 4.5) return h - 1.0;
    if (h >= 4.0) return h - 1.0;
    if (h >= 3.5) return h - 1.0;
    return h - 0.9;
  })();

  return {
    proteinaGrKg, proteinaGrTotal, proteinaKcal, proteinaPct, proteinaIntercambios,
    grasasGrKg, grasasGrTotal, grasasKcal, grasasPct, grasasIntercambios,
    hidratosGrKg, hidratosGrTotal, hidratosKcal, hidratosPct, hidratosIntercambios,
    kcalTotales: caloriasConsumir,
    creatina, cafeina, betaAlanina,
    hidratosOffGrKg,
  };
}

// ─── Distribución por defecto ─────────────────────────────────────────────────

export function distribucionPorDefecto(macros: MacroNutrientes, lacteos: number = 2): DistribucionDia {
  const hcTotal = macros.hidratosIntercambios - lacteos * 0.5;
  const protTotal = macros.proteinaIntercambios;
  const graTotal = macros.grasasIntercambios - 3; // -3 por aceite de oliva fijo

  return {
    desayuno: { hc: parseFloat((hcTotal * 0.25).toFixed(1)), proteina: parseFloat((protTotal * 0.2).toFixed(1)), grasa: parseFloat((graTotal * 0.25).toFixed(1)) },
    comida: { hc: parseFloat((hcTotal * 0.30).toFixed(1)), proteina: parseFloat((protTotal * 0.30).toFixed(1)), grasa: parseFloat((graTotal * 0.30).toFixed(1)) },
    merienda: { hc: parseFloat((hcTotal * 0.15).toFixed(1)), proteina: parseFloat((protTotal * 0.15).toFixed(1)), grasa: parseFloat((graTotal * 0.15).toFixed(1)) },
    cena: { hc: parseFloat((hcTotal * 0.25).toFixed(1)), proteina: parseFloat((protTotal * 0.25).toFixed(1)), grasa: parseFloat((graTotal * 0.25).toFixed(1)) },
    post: { hc: parseFloat((hcTotal * 0.05).toFixed(1)), proteina: parseFloat((protTotal * 0.10).toFixed(1)), grasa: 0 },
    lacteos,
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface NutritionContextType {
  state: NutritionState;
  setPasoActual: (paso: number) => void;
  updateDatosPersonales: (datos: Partial<DatosPersonales>) => void;
  updateGastoDeporte: (gasto: Partial<GastoDeporte>) => void;
  calcular: () => void;
  updateDistribucionDiaA: (dist: DistribucionDia) => void;
  updateDistribucionDiaB: (dist: DistribucionDia) => void;
  addAlimento: (alimento: Omit<Alimento, "id">) => void;
  removeAlimento: (id: string) => void;
}

const NutritionContext = createContext<NutritionContextType | null>(null);

export function NutritionProvider({ children }: { children: React.ReactNode }) {
  const savedState = loadFromStorage();

  const [state, setState] = useState<NutritionState>({
    ...({} as NutritionState), // placeholder para TypeScript
    pasoActual: savedState?.pasoActual ?? 0,
    pasoMaxAlcanzado: savedState?.pasoMaxAlcanzado ?? 0,
    datosPersonales: savedState?.datosPersonales ?? datosIniciales,
    gastoDeporte: savedState?.gastoDeporte ?? gastoInicialDeporte,
    resultadosCalorias: savedState?.resultadosCalorias ?? null,
    macros: savedState?.macros ?? null,
    distribucionDiaA: savedState?.distribucionDiaA ?? {
      desayuno: { hc: 1.2, proteina: 1, grasa: 0.7 },
      comida: { hc: 1, proteina: 1, grasa: 1 },
      merienda: { hc: 1, proteina: 0, grasa: 0.6 },
      cena: { hc: 1, proteina: 1, grasa: 0.6 },
      post: { hc: 0, proteina: 0, grasa: 0 },
      lacteos: 2,
    },
    distribucionDiaB: savedState?.distribucionDiaB ?? {
      desayuno: { hc: 0.8, proteina: 1, grasa: 1 },
      comida: { hc: 1, proteina: 1, grasa: 1.7 },
      merienda: { hc: 0, proteina: 0, grasa: 0 },
      cena: { hc: 1, proteina: 1, grasa: 1.9 },
      post: { hc: 0, proteina: 0, grasa: 0 },
      lacteos: 2,
    },
    // Combinar alimentos base con los custom guardados
    alimentos: [
      ...alimentosBase,
      ...(savedState?.alimentos?.filter(a => a.id.startsWith("custom-")) ?? []),
    ],
  });

  // Persistir en localStorage cuando el estado cambia
  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  const setPasoActual = useCallback((paso: number) => {
    setState(prev => ({
      ...prev,
      pasoActual: paso,
      pasoMaxAlcanzado: Math.max(prev.pasoMaxAlcanzado, paso),
    }));
  }, []);

  const updateDatosPersonales = useCallback((datos: Partial<DatosPersonales>) => {
    setState(prev => ({
      ...prev,
      datosPersonales: { ...prev.datosPersonales, ...datos },
    }));
  }, []);

  const updateGastoDeporte = useCallback((gasto: Partial<GastoDeporte>) => {
    setState(prev => ({
      ...prev,
      gastoDeporte: { ...prev.gastoDeporte, ...gasto },
    }));
  }, []);

  const calcular = useCallback(() => {
    setState(prev => {
      const res = calcularResultadosCalorias(prev.datosPersonales, prev.gastoDeporte);
      const macros = calcularMacros(prev.datosPersonales, res);
      const distA = distribucionPorDefecto(macros, prev.distribucionDiaA.lacteos);
      const distB = distribucionPorDefecto(macros, prev.distribucionDiaB.lacteos);
      return {
        ...prev,
        resultadosCalorias: res,
        macros,
        distribucionDiaA: distA,
        distribucionDiaB: distB,
      };
    });
  }, []);

  const updateDistribucionDiaA = useCallback((dist: DistribucionDia) => {
    setState(prev => ({ ...prev, distribucionDiaA: dist }));
  }, []);

  const updateDistribucionDiaB = useCallback((dist: DistribucionDia) => {
    setState(prev => ({ ...prev, distribucionDiaB: dist }));
  }, []);

  const addAlimento = useCallback((alimento: Omit<Alimento, "id">) => {
    const id = `custom-${Date.now()}`;
    setState(prev => ({
      ...prev,
      alimentos: [...prev.alimentos, { ...alimento, id }],
    }));
  }, []);

  const removeAlimento = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      alimentos: prev.alimentos.filter(a => a.id !== id),
    }));
  }, []);

  const value = useMemo(() => ({
    state, setPasoActual, updateDatosPersonales, updateGastoDeporte,
    calcular, updateDistribucionDiaA, updateDistribucionDiaB,
    addAlimento, removeAlimento,
  }), [state, setPasoActual, updateDatosPersonales, updateGastoDeporte,
    calcular, updateDistribucionDiaA, updateDistribucionDiaB,
    addAlimento, removeAlimento]);

  return (
    <NutritionContext.Provider value={value}>
      {children}
    </NutritionContext.Provider>
  );
}

export function useNutrition() {
  const ctx = useContext(NutritionContext);
  if (!ctx) throw new Error("useNutrition must be used within NutritionProvider");
  return ctx;
}
