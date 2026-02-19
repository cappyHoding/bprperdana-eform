import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import DepositoWizard from "./features/deposito/DepositoWizard";
import TabunganWizard from "./features/tabungan/TabunganWizard";
import PinjamanWizard from "./features/pinjaman/PinjamanWizard";
import PengkinianWizard from "./features/pengkinian/PengkinianWizard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/deposito" element={<DepositoWizard />} />
          <Route path="/tabungan" element={<TabunganWizard />} />
          <Route path="/pinjaman" element={<PinjamanWizard />} />
          <Route path="/pengkinian-data" element={<PengkinianWizard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;