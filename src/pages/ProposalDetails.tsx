
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProposal } from "@/contexts/ProposalContext";
import { Proposal, ProposalStatus, UserRole } from "@/utils/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Calendar, FileText, Building, ArrowLeft, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Layout from "@/components/Layout";
import CommentSection from "@/components/CommentSection";

const ProposalDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { 
    getProposalById, 
    approveProposal, 
    rejectProposal, 
    requestRevision, 
    resubmitProposal,
    approveAsApprover, 
    rejectAsApprover, 
    requestRevisionAsApprover,
    approveAsRegistrar,
    rejectAsRegistrar,
    requestRevisionAsRegistrar,
    canResubmit,
    getApprovalProgress
  } = useProposal();
  
  const [proposal, setProposal] = useState<Proposal | undefined>(undefined);
  const [rejectionReason, setRejectionReason] = useState("");
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (id) {
      const foundProposal = getProposalById(id);
      setProposal(foundProposal);
      
      if (foundProposal) {
        setProgress(getApprovalProgress(foundProposal.id));
      }
    }
  }, [id, getProposalById, getApprovalProgress]);
  
  if (!proposal) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <p>Proposal not found</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const getStatusBadge = (status: ProposalStatus) => {
    switch (status) {
      case ProposalStatus.DRAFT:
        return <Badge variant="outline">Draft</Badge>;
      case ProposalStatus.PENDING_SUPERIOR:
        return <Badge variant="secondary">Pending Superior</Badge>;
      case ProposalStatus.PENDING_ADMIN:
        return <Badge variant="secondary">Pending Admin</Badge>;
      case ProposalStatus.PENDING_APPROVERS:
        return <Badge variant="secondary">Pending Approvers</Badge>;
      case ProposalStatus.PENDING_REGISTRAR:
        return <Badge variant="secondary">Pending Registrar</Badge>;
      case ProposalStatus.APPROVED:
        return <Badge variant="success">Approved</Badge>;
      case ProposalStatus.REJECTED:
        return <Badge variant="destructive">Rejected</Badge>;
      case ProposalStatus.NEEDS_REVISION:
        return <Badge variant="warning">Needs Revision</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderProposalTypeDetails = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {proposal.budget && (
          <div className="bg-muted/30 p-3 rounded-md">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground">Budget</h3>
            </div>
            <p>{proposal.budget}</p>
          </div>
        )}
        {proposal.timeline && (
          <div className="bg-muted/30 p-3 rounded-md">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground">Timeline</h3>
            </div>
            <p>{proposal.timeline}</p>
          </div>
        )}
        {proposal.justification && (
          <div className="bg-muted/30 p-3 rounded-md">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground">Business Justification</h3>
            </div>
            <p>{proposal.justification}</p>
          </div>
        )}
        {proposal.department && (
          <div className="bg-muted/30 p-3 rounded-md">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground">Department</h3>
            </div>
            <p>{proposal.department}</p>
          </div>
        )}
        {proposal.fieldValues && Object.keys(proposal.fieldValues).length > 0 && (
          Object.entries(proposal.fieldValues).map(([key, value]) => (
            <div key={key} className="bg-muted/30 p-3 rounded-md">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-muted-foreground capitalize">
                  {key.replace(/_/g, ' ')}
                </h3>
              </div>
              <p>{value?.toString()}</p>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderApprovalSteps = () => {
    if (!proposal.approvalSteps || proposal.approvalSteps.length === 0) {
      return null;
    }

    // Only show approval steps to admin and registrar
    if (currentUser?.role !== UserRole.ADMIN && currentUser?.role !== UserRole.REGISTRAR) {
      return null;
    }

    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Approval Steps</h3>
        <div className="space-y-3">
          {proposal.approvalSteps.map((step, index) => (
            <div key={index} className="flex items-center p-3 rounded-md bg-muted/30">
              <div className={`mr-3 ${
                step.status === "approved" ? "text-green-500" : 
                step.status === "rejected" ? "text-red-500" : 
                step.status === "resubmit" ? "text-amber-500" : "text-slate-400"
              }`}>
                {step.status === "approved" ? (
                  <CheckCircle className="h-5 w-5" />
                ) : step.status === "rejected" ? (
                  <XCircle className="h-5 w-5" />
                ) : step.status === "resubmit" ? (
                  <AlertCircle className="h-5 w-5" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-current"></div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{step.userName}</p>
                <p className="text-sm text-muted-foreground capitalize">{step.userRole.toLowerCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium capitalize">{step.status}</p>
                {step.timestamp && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(step.timestamp).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Main render
  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold">{proposal.title}</h1>
          <div className="ml-auto">
            {getStatusBadge(proposal.status)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Proposal Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-6">{proposal.description}</p>
                
                {renderProposalTypeDetails()}
                
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Approval Progress</h3>
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">{Math.round(progress)}% complete</p>
                </div>

                {renderApprovalSteps()}
                
                {/* Action buttons based on user role and proposal status */}
                {/* ... Additional action buttons and controls based on user permissions and proposal status */}
              </CardContent>
            </Card>
          </div>
          
          <div>
            <CommentSection proposalId={proposal.id} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProposalDetails;
