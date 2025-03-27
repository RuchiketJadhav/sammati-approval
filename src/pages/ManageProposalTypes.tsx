
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
  const isRegistrar = currentUser?.role === UserRole.REGISTRAR;
  const hasAccess = isAdmin || isRegistrar;

  return (
    <Layout>
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Sammati - Manage Proposal Types</h1>
        
        {!hasAccess ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-amber-600">
                <Shield className="mr-2" /> Admin or Registrar Access Required
              </CardTitle>
              <CardDescription>
                You need administrator or registrar privileges to manage proposal types.
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
