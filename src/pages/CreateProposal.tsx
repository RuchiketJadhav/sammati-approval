
import React from "react";
import Layout from "@/components/Layout";
import ProposalForm from "@/components/ProposalForm";
import { useParams } from "react-router-dom";

const CreateProposal: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {id ? "Edit Proposal" : "Create New Proposal"}
        </h1>
        <ProposalForm />
      </div>
    </Layout>
  );
};

export default CreateProposal;
