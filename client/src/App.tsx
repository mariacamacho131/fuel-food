import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { NutritionProvider } from "./contexts/NutritionContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Resultados from "./pages/Resultados";
import Macros from "./pages/Macros";
import MenuDiaA from "./pages/MenuDiaA";
import MenuDiaB from "./pages/MenuDiaB";
import DiaPartido from "./pages/DiaPartido";
import Alimentos from "./pages/Alimentos";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/resultados" component={Resultados} />
        <Route path="/macros" component={Macros} />
        <Route path="/menu-a" component={MenuDiaA} />
        <Route path="/menu-b" component={MenuDiaB} />
        <Route path="/partido" component={DiaPartido} />
        <Route path="/alimentos" component={Alimentos} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <NutritionProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </NutritionProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
