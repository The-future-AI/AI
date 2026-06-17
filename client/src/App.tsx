import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import TopicDetail from "./pages/TopicDetail";
import PontoCego from "./pages/PontoCego";
import Metodologia from "./pages/Metodologia";
import Busca from "./pages/Busca";
import OutletProfile from "./pages/OutletProfile";
import Planos from "./pages/Planos";
import Admin from "./pages/Admin";
import Eleicoes from "./pages/Eleicoes";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/topico/:id" component={TopicDetail} />
      <Route path="/ponto-cego" component={PontoCego} />
      <Route path="/metodologia" component={Metodologia} />
      <Route path="/busca" component={Busca} />
      <Route path="/veiculo/:slug" component={OutletProfile} />
      <Route path="/planos" component={Planos} />
      <Route path="/admin" component={Admin} />
      <Route path="/eleicoes" component={Eleicoes} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
