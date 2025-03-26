
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import ProposalCard from "@/components/ProposalCard";
import { useAuth } from "@/contexts/AuthContext";
import { useProposals } from "@/contexts/ProposalContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, InboxIcon, PenTool, ListFilter } from "lucide-react";
import { UserRole, ProposalStatus } from "@/utils/types";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { proposals, getUserProposals, getAssignedProposals } = useProposals();
  const [activeTab, setActiveTab] = useState("mine");
  const navigate = useNavigate();

  if (!currentUser) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center">
          <h1 className="text-3xl font-semibold mb-4">Welcome to ApprovalFlow</h1>
          <p className="text-muted-foreground text-center max-w-md mb-8">
            A streamlined approval system for managing proposals. Please log in to continue.
          </p>
        </div>
      </Layout>
    );
  }

  // Get proposals based on user role
  const myProposals = getUserProposals(currentUser.id);
  const assignedProposals = getAssignedProposals(currentUser.id);
  
  // For registrars, we need to show all proposals in the "all" tab
  const allProposals = useMemo(() => {
    if (currentUser.role === UserRole.REGISTRAR) {
      // For registrar, show all proposals in the system
      return proposals;
    } else if (currentUser.role === UserRole.ADMIN) {
      // Admin already sees all proposals
      return proposals;
    }
    // For other users, they don't see this tab
    return [];
  }, [proposals, currentUser.role]);

  // Count pending admin approvals specifically for the badge
  const pendingAdminCount = currentUser.role === UserRole.ADMIN 
    ? proposals.filter(p => p.status === ProposalStatus.PENDING_ADMIN).length 
    : 0;

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">
            {currentUser.role === UserRole.USER
              ? "Manage your proposals and track their status"
              : currentUser.role === UserRole.REGISTRAR
              ? "Review, approve, and manage all proposals in the system"
              : "Review and manage proposals assigned to you"}
          </p>
        </div>
        <Button onClick={() => navigate("/create-proposal")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Proposal
        </Button>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="mine" className="flex items-center">
            <PenTool className="mr-2 h-4 w-4" />
            <span>My Proposals</span>
            {myProposals.length > 0 && (
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
                {myProposals.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="assigned" className="flex items-center">
            <InboxIcon className="mr-2 h-4 w-4" />
            <span>Assigned to Me</span>
            {assignedProposals.length > 0 && (
              <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                pendingAdminCount > 0 && currentUser.role === UserRole.ADMIN 
                  ? "bg-pending/20 text-pending" 
                  : "bg-muted"
              }`}>
                {assignedProposals.length}
              </span>
            )}
          </TabsTrigger>
          {(currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.REGISTRAR) && (
            <TabsTrigger value="all" className="flex items-center">
              <ListFilter className="mr-2 h-4 w-4" />
              <span>All Proposals</span>
              {allProposals.length > 0 && (
                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
                  {allProposals.length}
                </span>
              )}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="mine" className="mt-0">
          {myProposals.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {myProposals.map((proposal) => (
                <ProposalCard key={proposal.id} proposal={proposal} />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No proposals yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't created any proposals yet.
              </p>
              <Button onClick={() => navigate("/create-proposal")}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create your first proposal
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="assigned" className="mt-0">
          {assignedProposals.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {assignedProposals.map((proposal) => (
                <ProposalCard key={proposal.id} proposal={proposal} />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No proposals assigned</h3>
              <p className="text-muted-foreground">
                You don't have any proposals assigned for review.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-0">
          {allProposals.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {allProposals.map((proposal) => (
                <ProposalCard key={proposal.id} proposal={proposal} />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">No proposals</h3>
              <p className="text-muted-foreground">
                There are no proposals in the system.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Dashboard;
