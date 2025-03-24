
import React from "react";
import Layout from "@/components/Layout";
import ProposalTypeManager from "@/components/ProposalTypeManager";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/utils/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

const ManageProposalTypes: React.FC = () => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === UserRole.ADMIN;

  return (
    <Layout>
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Manage Proposal Types</h1>
        
        {!isAdmin ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-amber-600">
                <Shield className="mr-2" /> Admin Access Required
              </CardTitle>
              <CardDescription>
                You need administrator privileges to manage proposal types.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <ProposalTypeManager />
        )}
      </div>
    </Layout>
  );
};

export default ManageProposalTypes;
