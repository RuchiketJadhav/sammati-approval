
import React from "react";
import Layout from "@/components/Layout";
import ProposalForm from "@/components/ProposalForm";
import { useParams } from "react-router-dom";

const CreateProposal: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <ProposalForm />
      </div>
    </Layout>
  );
};

export default CreateProposal;
