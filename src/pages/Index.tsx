import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import ProposalCard from "@/components/ProposalCard";
import { useAuth } from "@/contexts/AuthContext";
import { useProposals } from "@/contexts/ProposalContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, InboxIcon, PenTool } from "lucide-react";
import { UserRole } from "@/utils/types";
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

  const myProposals = getUserProposals(currentUser.id);
  const assignedProposals = getAssignedProposals(currentUser.id);

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
              <span className="ml-2 rounded-full bg-pending/20 text-pending px-2 py-0.5 text-xs">
                {assignedProposals.length}
              </span>
            )}
          </TabsTrigger>
          {currentUser.role === UserRole.ADMIN && (
            <TabsTrigger value="all" className="flex items-center">
              <span>All Proposals</span>
              {proposals.length > 0 && (
                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
                  {proposals.length}
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
          {proposals.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {proposals.map((proposal) => (
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
