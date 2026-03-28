import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-8xl font-bold text-gray-800 mb-4">404</p>
        <h1 className="text-2xl font-semibold text-white mb-2">Página no encontrada</h1>
        <p className="text-gray-400 text-sm mb-8">La página que buscas no existe o ha sido movida.</p>
        <Button
          className="bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-semibold"
          onClick={() => setLocation("/")}
        >
          <Home className="w-4 h-4 mr-2" />
          Volver al inicio
        </Button>
      </div>
    </div>
  );
}
