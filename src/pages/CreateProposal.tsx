
import React from "react";
import Layout from "@/components/Layout";
import ProposalForm from "@/components/ProposalForm";

const CreateProposal: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <ProposalForm />
      </div>
    </Layout>
  );
};

export default CreateProposal;
