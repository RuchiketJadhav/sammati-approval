
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { ProposalProvider } from "./contexts/ProposalContext";
import { ProposalTypeProvider } from "./contexts/ProposalTypeContext";
import { useAuth } from "./contexts/AuthContext";
import Index from "./pages/Index";
import CreateProposal from "./pages/CreateProposal";
import ProposalDetails from "./pages/ProposalDetails";
import Profile from "./pages/Profile";
import ManageProposalTypes from "./pages/ManageProposalTypes";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { Toaster } from "@/components/ui/sonner";
import "./App.css";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/proposal/new" element={<ProtectedRoute><CreateProposal /></ProtectedRoute>} />
      <Route path="/proposal/edit/:id" element={<ProtectedRoute><CreateProposal /></ProtectedRoute>} />
      <Route path="/proposal/:id" element={<ProtectedRoute><ProposalDetails /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/manage-proposal-types" element={<ProtectedRoute><ManageProposalTypes /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProposalTypeProvider>
          <ProposalProvider>
            <Router>
              <AppRoutes />
              <Toaster />
            </Router>
          </ProposalProvider>
        </ProposalTypeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
