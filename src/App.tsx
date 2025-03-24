
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProposalProvider } from "./contexts/ProposalContext";
import { ProposalTypeProvider } from "./contexts/ProposalTypeContext";
import Index from "./pages/Index";
import CreateProposal from "./pages/CreateProposal";
import ProposalDetails from "./pages/ProposalDetails";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ManageProposalTypes from "./pages/ManageProposalTypes";
import { motion, AnimatePresence } from "framer-motion";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ProposalTypeProvider>
          <ProposalProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/create-proposal" element={<CreateProposal />} />
                  <Route path="/proposal/:id" element={<ProposalDetails />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/manage-types" element={<ManageProposalTypes />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AnimatePresence>
            </BrowserRouter>
          </ProposalProvider>
        </ProposalTypeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
