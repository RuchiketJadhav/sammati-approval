
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProposals } from "@/contexts/ProposalContext";
import { Proposal, ProposalStatus, UserRole } from "@/utils/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Calendar, FileText, Building, ArrowLeft, CheckCircle, XCircle, AlertCircle, Check, X, ArrowUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Layout from "@/components/Layout";
import CommentSection from "@/components/CommentSection";
import { toast } from "sonner";

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
  } = useProposals();
  
  const [proposal, setProposal] = useState<Proposal | undefined>(undefined);
  const [rejectionReason, setRejectionReason] = useState("");
  const [progress, setProgress] = useState(0);
  const [resubmitting, setResubmitting] = useState(false);
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [showRevisionInput, setShowRevisionInput] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  useEffect(() => {
    if (id) {
      const foundProposal = getProposalById(id);
      setProposal(foundProposal);
      
      if (foundProposal) {
        setProgress(getApprovalProgress(foundProposal.id));
      }
    }
  }, [id, getProposalById, getApprovalProgress]);

  // Determine who can resubmit
  const canShowResubmitButton = () => {
    if (!currentUser || !proposal) return false;
    // Only Supervisor, Admin, Registrar can resubmit (not Approver nor Proposer)
    if (
      [UserRole.SUPERIOR, UserRole.ADMIN, UserRole.REGISTRAR].includes(currentUser.role)
      // Also not already in flow
      && (proposal.status === ProposalStatus.NEEDS_REVISION || proposal.status === ProposalStatus.REJECTED)
      // Proposer can't resubmit themselves, only these roles
    ) return true;
    return false;
  };

  // Proposer can resubmit after revision/reject
  const canProposerResubmit = () => {
    if (!currentUser || !proposal) return false;
    return (
      currentUser.id === proposal.createdBy &&
      (proposal.status === ProposalStatus.NEEDS_REVISION || proposal.status === ProposalStatus.REJECTED) &&
      !proposal.rejectedByRegistrar // can't resubmit if registrar rejected
    );
  };

  // Edit lock: Only proposer can edit after resubmit button (editing "locked" for others unless it's revision back to proposer)
  const isEditingLocked = () => {
    if (!currentUser || !proposal) return true;
    // Only proposer can edit in revision state
    if (
      (proposal.status === ProposalStatus.NEEDS_REVISION || proposal.status === ProposalStatus.REJECTED) &&
      currentUser.id === proposal.createdBy
    ) return false; // unlocked for proposer
    return true;
  };

  // Check if the current user can approve the proposal
  const canApprove = () => {
    if (!currentUser || !proposal) return false;
    
    // Superior can approve pending_superior proposals
    if (currentUser.role === UserRole.SUPERIOR && proposal.status === ProposalStatus.PENDING_SUPERIOR) {
      return true;
    }
    
    // Admin can approve pending_admin proposals
    if (currentUser.role === UserRole.ADMIN && proposal.status === ProposalStatus.PENDING_ADMIN) {
      return true;
    }
    
    // Approvers can approve if proposal is in pending_approvers state and they are in the pending approvers list
    if (currentUser.role === UserRole.APPROVER && 
        proposal.status === ProposalStatus.PENDING_APPROVERS && 
        proposal.pendingApprovers?.includes(currentUser.id)) {
      return true;
    }
    
    // Registrar can approve if proposal is in pending_registrar state
    if (currentUser.role === UserRole.REGISTRAR && proposal.status === ProposalStatus.PENDING_REGISTRAR) {
      return true;
    }
    
    return false;
  };

  // Check if the current user can reject the proposal
  const canReject = () => {
    // Same logic as approve - if you can approve, you can also reject
    return canApprove();
  };

  // Check if the current user can request revision
  const canRequestRevision = () => {
    // Same logic as approve - if you can approve, you can also request revision
    return canApprove();
  };

  const handleResubmitClick = () => {
    if (!proposal) return;
    setResubmitting(true);
    resubmitProposal(proposal.id);
    setTimeout(() => {
      setResubmitting(false);
      // reload proposal state
      const refreshed = getProposalById(proposal.id);
      setProposal(refreshed);
    }, 500);
  };

  const handleApproveClick = () => {
    if (!proposal || !currentUser) return;
    
    setActionLoading(true);
    
    try {
      // Different approval functions based on user role
      if (currentUser.role === UserRole.SUPERIOR || currentUser.role === UserRole.ADMIN) {
        approveProposal(proposal.id);
      } else if (currentUser.role === UserRole.APPROVER) {
        approveAsApprover(proposal.id);
      } else if (currentUser.role === UserRole.REGISTRAR) {
        approveAsRegistrar(proposal.id);
      }
      
      // Refresh proposal data
      const refreshed = getProposalById(proposal.id);
      setProposal(refreshed);
      toast.success("Proposal approved successfully");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = () => {
    if (!proposal || !currentUser || !rejectionReason.trim()) return;
    
    setActionLoading(true);
    
    try {
      // Different rejection functions based on user role
      if (currentUser.role === UserRole.SUPERIOR || currentUser.role === UserRole.ADMIN) {
        rejectProposal(proposal.id, rejectionReason);
      } else if (currentUser.role === UserRole.APPROVER) {
        rejectAsApprover(proposal.id, rejectionReason);
      } else if (currentUser.role === UserRole.REGISTRAR) {
        rejectAsRegistrar(proposal.id, rejectionReason);
      }
      
      // Refresh proposal data
      const refreshed = getProposalById(proposal.id);
      setProposal(refreshed);
      setRejectionReason("");
      setShowRejectionInput(false);
      toast.success("Proposal rejected");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevisionSubmit = () => {
    if (!proposal || !currentUser || !rejectionReason.trim()) return;
    
    setActionLoading(true);
    
    try {
      // Different revision request functions based on user role
      if (currentUser.role === UserRole.SUPERIOR || currentUser.role === UserRole.ADMIN) {
        requestRevision(proposal.id, rejectionReason);
      } else if (currentUser.role === UserRole.APPROVER) {
        requestRevisionAsApprover(proposal.id, rejectionReason);
      } else if (currentUser.role === UserRole.REGISTRAR) {
        requestRevisionAsRegistrar(proposal.id, rejectionReason);
      }
      
      // Refresh proposal data
      const refreshed = getProposalById(proposal.id);
      setProposal(refreshed);
      setRejectionReason("");
      setShowRevisionInput(false);
      toast.success("Revision requested");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setActionLoading(false);
    }
  };
  
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
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Approved</Badge>;
      case ProposalStatus.REJECTED:
        return <Badge variant="destructive">Rejected</Badge>;
      case ProposalStatus.NEEDS_REVISION:
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-200">Needs Revision</Badge>;
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
                <div className="mt-6 space-y-4">
                  {/* Approval, Rejection and Revision Buttons */}
                  {canApprove() && (
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="default"
                        onClick={handleApproveClick}
                        disabled={actionLoading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Approve
                      </Button>
                      
                      {!showRejectionInput && (
                        <Button 
                          variant="destructive"
                          onClick={() => {
                            setShowRejectionInput(true);
                            setShowRevisionInput(false);
                          }}
                          disabled={actionLoading}
                        >
                          <X className="mr-1 h-4 w-4" />
                          Reject
                        </Button>
                      )}
                      
                      {!showRevisionInput && (
                        <Button 
                          variant="outline"
                          className="border-amber-500 text-amber-700 hover:bg-amber-50"
                          onClick={() => {
                            setShowRevisionInput(true);
                            setShowRejectionInput(false);
                          }}
                          disabled={actionLoading}
                        >
                          <ArrowUp className="mr-1 h-4 w-4" />
                          Request Revision
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {/* Rejection Reason Input */}
                  {showRejectionInput && (
                    <div className="space-y-2">
                      <textarea
                        className="w-full p-2 border rounded-md"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Provide a reason for rejection..."
                        rows={3}
                        disabled={actionLoading}
                      />
                      <div className="flex gap-2">
                        <Button 
                          variant="destructive"
                          onClick={handleRejectSubmit}
                          disabled={!rejectionReason.trim() || actionLoading}
                        >
                          Submit Rejection
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setShowRejectionInput(false);
                            setRejectionReason("");
                          }}
                          disabled={actionLoading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Revision Request Input */}
                  {showRevisionInput && (
                    <div className="space-y-2">
                      <textarea
                        className="w-full p-2 border rounded-md"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Provide details for the requested revision..."
                        rows={3}
                        disabled={actionLoading}
                      />
                      <div className="flex gap-2">
                        <Button 
                          variant="outline"
                          className="border-amber-500 text-amber-700 hover:bg-amber-50"
                          onClick={handleRevisionSubmit}
                          disabled={!rejectionReason.trim() || actionLoading}
                        >
                          Submit Revision Request
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setShowRevisionInput(false);
                            setRejectionReason("");
                          }}
                          disabled={actionLoading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Resubmit logic */}
                <div className="mt-6 flex gap-2">
                  {canShowResubmitButton() && (
                    <Button 
                      variant="default"
                      disabled={resubmitting}
                      onClick={handleResubmitClick}
                    >
                      {resubmitting ? "Resubmitting..." : "Resubmit to Proposer"}
                    </Button>
                  )}
                  {canProposerResubmit() && (
                    <Button
                      variant="default"
                      disabled={resubmitting}
                      onClick={handleResubmitClick}
                    >
                      {resubmitting ? "Resubmitting..." : "Resubmit for Approval"}
                    </Button>
                  )}
                </div>
                {/* Additional UI/lock based on isEditingLocked() can be added to the form editor for editing controls */}

              </CardContent>
            </Card>
          </div>
          
          <div>
            <CommentSection proposalId={proposal.id} comments={proposal.comments} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProposalDetails;
