/**
 * Alimentos — Base de datos de alimentos ampliable
 * Design: Athletic Dashboard Oscuro — carbón + cian
 */

import { useState } from "react";
import { useNutrition } from "@/contexts/NutritionContext";
import type { Alimento } from "@/contexts/NutritionContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Plus, Search, Trash2, X, ChevronDown } from "lucide-react";
import { toast } from "sonner";

const categorias = [
  { value: "todos", label: "Todos" },
  { value: "carbohidrato", label: "Carbohidratos" },
  { value: "proteina", label: "Proteínas" },
  { value: "grasa", label: "Grasas" },
] as const;

const categoriaColors: Record<string, string> = {
  carbohidrato: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  proteina: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  grasa: "bg-green-500/15 text-green-400 border-green-500/30",
};

const categoriaLabels: Record<string, string> = {
  carbohidrato: "HC",
  proteina: "Prot",
  grasa: "Grasa",
};

const alimentoVacio: Omit<Alimento, "id"> = {
  nombre: "",
  categoria: "carbohidrato",
  gramosPorRacion: 100,
  kcalPor100g: 0,
  hcPor100g: 0,
  proteinaPor100g: 0,
  grasaPor100g: 0,
  nota: "",
};

export default function Alimentos() {
  const { state, addAlimento, removeAlimento } = useNutrition();
  const { alimentos } = state;

  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<"todos" | "carbohidrato" | "proteina" | "grasa">("todos");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoAlimento, setNuevoAlimento] = useState<Omit<Alimento, "id">>(alimentoVacio);

  const alimentosFiltrados = alimentos.filter(a => {
    const matchBusqueda = a.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const matchCategoria = categoriaFiltro === "todos" || a.categoria === categoriaFiltro;
    return matchBusqueda && matchCategoria;
  });

  const handleAñadir = () => {
    if (!nuevoAlimento.nombre.trim()) {
      toast.error("El nombre del alimento es obligatorio");
      return;
    }
    if (nuevoAlimento.kcalPor100g <= 0) {
      toast.error("Las calorías por 100g deben ser mayores que 0");
      return;
    }
    addAlimento(nuevoAlimento);
    setNuevoAlimento(alimentoVacio);
    setMostrarFormulario(false);
    toast.success(`${nuevoAlimento.nombre} añadido a la base de datos`);
  };

  const handleEliminar = (id: string, nombre: string) => {
    if (id.startsWith("custom-")) {
      removeAlimento(id);
      toast.success(`${nombre} eliminado`);
    } else {
      toast.error("No se pueden eliminar alimentos del sistema base");
    }
  };

  // Calcular gramos para 1 intercambio (100 kcal)
  const gramosParaIntercambio = (a: Alimento) => {
    if (a.kcalPor100g === 0) return 0;
    return Math.round((100 / a.kcalPor100g) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Base de Alimentos</h1>
          <p className="text-gray-400 text-sm mt-1">{alimentos.length} alimentos · Añade los tuyos propios</p>
        </div>
        <Button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-semibold"
        >
          <Plus size={16} className="mr-1" /> Nuevo alimento
        </Button>
      </div>

      {/* Formulario nuevo alimento */}
      {mostrarFormulario && (
        <div className="mb-6 bg-gray-900 border border-cyan-500/30 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-cyan-400">Añadir nuevo alimento</h2>
            <button onClick={() => setMostrarFormulario(false)} className="text-gray-500 hover:text-gray-300">
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Nombre */}
            <div className="col-span-2 md:col-span-3">
              <Label className="text-gray-300 text-xs mb-1.5 block">Nombre del alimento *</Label>
              <Input
                value={nuevoAlimento.nombre}
                onChange={e => setNuevoAlimento(p => ({ ...p, nombre: e.target.value }))}
                placeholder="Ej: Arroz integral"
                className="bg-gray-800 border-gray-700 text-white focus:border-cyan-500"
              />
            </div>

            {/* Categoría */}
            <div>
              <Label className="text-gray-300 text-xs mb-1.5 block">Categoría *</Label>
              <div className="flex gap-2">
                {(["carbohidrato", "proteina", "grasa"] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setNuevoAlimento(p => ({ ...p, categoria: cat }))}
                    className={cn(
                      "flex-1 py-1.5 rounded border text-xs font-medium transition-all",
                      nuevoAlimento.categoria === cat
                        ? categoriaColors[cat]
                        : "bg-gray-800 border-gray-700 text-gray-400"
                    )}
                  >
                    {categoriaLabels[cat]}
                  </button>
                ))}
              </div>
            </div>

            {/* Kcal/100g */}
            <div>
              <Label className="text-gray-300 text-xs mb-1.5 block">Kcal / 100g *</Label>
              <Input
                type="number"
                value={nuevoAlimento.kcalPor100g || ""}
                onChange={e => setNuevoAlimento(p => ({ ...p, kcalPor100g: parseFloat(e.target.value) || 0 }))}
                className="bg-gray-800 border-gray-700 text-white focus:border-cyan-500"
              />
            </div>

            {/* Gramos por ración */}
            <div>
              <Label className="text-gray-300 text-xs mb-1.5 block">Gramos por ración</Label>
              <Input
                type="number"
                value={nuevoAlimento.gramosPorRacion || ""}
                onChange={e => setNuevoAlimento(p => ({ ...p, gramosPorRacion: parseFloat(e.target.value) || 0 }))}
                className="bg-gray-800 border-gray-700 text-white focus:border-cyan-500"
              />
            </div>

            {/* HC */}
            <div>
              <Label className="text-gray-300 text-xs mb-1.5 block">HC / 100g (g)</Label>
              <Input
                type="number"
                value={nuevoAlimento.hcPor100g || ""}
                onChange={e => setNuevoAlimento(p => ({ ...p, hcPor100g: parseFloat(e.target.value) || 0 }))}
                className="bg-gray-800 border-gray-700 text-white focus:border-cyan-500"
              />
            </div>

            {/* Proteína */}
            <div>
              <Label className="text-gray-300 text-xs mb-1.5 block">Proteína / 100g (g)</Label>
              <Input
                type="number"
                value={nuevoAlimento.proteinaPor100g || ""}
                onChange={e => setNuevoAlimento(p => ({ ...p, proteinaPor100g: parseFloat(e.target.value) || 0 }))}
                className="bg-gray-800 border-gray-700 text-white focus:border-cyan-500"
              />
            </div>

            {/* Grasa */}
            <div>
              <Label className="text-gray-300 text-xs mb-1.5 block">Grasa / 100g (g)</Label>
              <Input
                type="number"
                value={nuevoAlimento.grasaPor100g || ""}
                onChange={e => setNuevoAlimento(p => ({ ...p, grasaPor100g: parseFloat(e.target.value) || 0 }))}
                className="bg-gray-800 border-gray-700 text-white focus:border-cyan-500"
              />
            </div>

            {/* Nota */}
            <div className="col-span-2 md:col-span-3">
              <Label className="text-gray-300 text-xs mb-1.5 block">Nota (opcional)</Label>
              <Input
                value={nuevoAlimento.nota || ""}
                onChange={e => setNuevoAlimento(p => ({ ...p, nota: e.target.value }))}
                placeholder="Ej: Cocido, sin sal..."
                className="bg-gray-800 border-gray-700 text-white focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Preview */}
          {nuevoAlimento.kcalPor100g > 0 && (
            <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <p className="text-xs text-gray-400 mb-1">Preview: 1 intercambio (100 kcal) =</p>
              <p className="text-sm text-white font-medium">
                {gramosParaIntercambio(nuevoAlimento as Alimento)}g de {nuevoAlimento.nombre || "este alimento"}
              </p>
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <Button onClick={handleAñadir} className="bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-semibold">
              <Plus size={14} className="mr-1" /> Añadir alimento
            </Button>
            <Button variant="outline" onClick={() => setMostrarFormulario(false)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800">
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <Input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar alimento..."
            className="pl-8 bg-gray-900 border-gray-700 text-white focus:border-cyan-500"
          />
        </div>
        <div className="flex gap-2">
          {categorias.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategoriaFiltro(cat.value as typeof categoriaFiltro)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                categoriaFiltro === cat.value
                  ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400"
                  : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de alimentos */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-xs text-gray-500 font-medium px-4 py-3">Alimento</th>
                <th className="text-center text-xs text-gray-500 font-medium px-3 py-3">Cat.</th>
                <th className="text-center text-xs text-gray-500 font-medium px-3 py-3">Kcal/100g</th>
                <th className="text-center text-xs text-amber-400 font-medium px-3 py-3">HC/100g</th>
                <th className="text-center text-xs text-blue-400 font-medium px-3 py-3">Prot/100g</th>
                <th className="text-center text-xs text-green-400 font-medium px-3 py-3">Grasa/100g</th>
                <th className="text-center text-xs text-gray-500 font-medium px-3 py-3">g/intercambio</th>
                <th className="text-center text-xs text-gray-500 font-medium px-3 py-3">g/ración</th>
                <th className="px-3 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {alimentosFiltrados.map((a, idx) => (
                <tr key={a.id} className={cn("border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors", idx % 2 === 0 ? "" : "bg-gray-900/30")}>
                  <td className="px-4 py-2.5">
                    <div>
                      <span className="text-sm text-gray-200">{a.nombre}</span>
                      {a.nota && <p className="text-xs text-gray-500">{a.nota}</p>}
                      {a.id.startsWith("custom-") && (
                        <span className="text-xs text-cyan-400 bg-cyan-500/10 px-1 rounded">Personalizado</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={cn("text-xs px-1.5 py-0.5 rounded border", categoriaColors[a.categoria])}>
                      {categoriaLabels[a.categoria]}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center text-xs text-gray-300">{a.kcalPor100g}</td>
                  <td className="px-3 py-2.5 text-center text-xs text-amber-400">{a.hcPor100g}</td>
                  <td className="px-3 py-2.5 text-center text-xs text-blue-400">{a.proteinaPor100g}</td>
                  <td className="px-3 py-2.5 text-center text-xs text-green-400">{a.grasaPor100g}</td>
                  <td className="px-3 py-2.5 text-center text-xs text-gray-400">{gramosParaIntercambio(a)}g</td>
                  <td className="px-3 py-2.5 text-center text-xs text-gray-400">{a.gramosPorRacion}g</td>
                  <td className="px-3 py-2.5 text-center">
                    <button
                      onClick={() => handleEliminar(a.id, a.nombre)}
                      className={cn(
                        "transition-colors",
                        a.id.startsWith("custom-")
                          ? "text-gray-600 hover:text-red-400"
                          : "text-gray-800 cursor-not-allowed"
                      )}
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {alimentosFiltrados.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-gray-500 text-sm">No se encontraron alimentos con ese filtro.</p>
          </div>
        )}
      </div>
    </div>
  );
}
