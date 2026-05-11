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
import StatusTrackingPage from '@/pages/StatusTrackingPage';
import NotFound from "./pages/NotFound";
import SignFailedPage from "./pages/SignFailedPage";
import SignSuccessPage from "./pages/SignSuccessPage";

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
          <Route path="/cek-status" element={<StatusTrackingPage />} />
          <Route path="/sign-success" element={<SignSuccessPage />} />
          <Route path="/sign-failed" element={<SignFailedPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;