
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { ProposalProvider } from "./contexts/ProposalContext";
import { ProposalTypeProvider } from "./contexts/ProposalTypeContext";
import Index from "./pages/Index";
import CreateProposal from "./pages/CreateProposal";
import ProposalDetails from "./pages/ProposalDetails";
import Profile from "./pages/Profile";
import ManageProposalTypes from "./pages/ManageProposalTypes";
import NotFound from "./pages/NotFound";
import { Toaster } from "@/components/ui/sonner";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProposalTypeProvider>
          <ProposalProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/proposal/new" element={<CreateProposal />} />
                <Route path="/proposal/edit/:id" element={<CreateProposal />} />
                <Route path="/proposal/:id" element={<ProposalDetails />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/manage-proposal-types" element={<ManageProposalTypes />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </Router>
          </ProposalProvider>
        </ProposalTypeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
