
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import Layout from "@/components/Layout";
import CommentSection from "@/components/CommentSection";
import { useProposals } from "@/contexts/ProposalContext";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Proposal, ProposalStatus, UserRole, ProposalType } from "@/utils/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Clock,
  CheckCircle,
  Upload,
  XCircle,
  AlertTriangle,
  Calendar,
  DollarSign,
  Building,
  FileText,
  Users,
  CheckSquare,
  PlusCircle,
  Edit
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const ProposalDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    getProposalById, 
    approveProposal, 
    rejectProposal, 
    resubmitProposal, 
    approveAsApprover,
    assignApprovers,
    assignToRegistrar,
    approveAsRegistrar,
    getApprovalProgress
  } = useProposals();
  const { currentUser, users } = useAuth();
  const [rejectionReason, setRejectionReason] = useState("");
  const [approvalComment, setApprovalComment] = useState("");
  const [selectedApprovers, setSelectedApprovers] = useState<string[]>([]);

  if (!id) {
    navigate("/");
    return null;
  }

  const proposal = getProposalById(id);
  
  if (!proposal) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-medium mb-2">Proposal not found</h2>
          <p className="text-muted-foreground mb-6">
            The proposal you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  if (!currentUser) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-medium mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">
            Please log in to view proposal details.
          </p>
          <Button onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  const isCreator = currentUser.id === proposal.createdBy;
  const isAssignee = currentUser.id === proposal.assignedTo;
  const isAdmin = currentUser.role === UserRole.ADMIN;
  const isRegistrar = currentUser.role === UserRole.REGISTRAR;
  const isPendingApprover = proposal.pendingApprovers?.includes(currentUser.id);
  
  // Add a new variable to check if the user should see approval details
  const canSeeApprovalDetails = isAdmin || isRegistrar;
  
  const canApprove = 
    (isAssignee && proposal.status === ProposalStatus.PENDING_SUPERIOR) || 
    (isAdmin && proposal.status === ProposalStatus.PENDING_ADMIN);
  
  const canReject = 
    (isAssignee && proposal.status === ProposalStatus.PENDING_SUPERIOR) || 
    (isAdmin && proposal.status === ProposalStatus.PENDING_ADMIN);
  
  const canResubmit = isCreator && proposal.status === ProposalStatus.REJECTED;
  
  const canAssignApprovers = isAdmin && proposal.status === ProposalStatus.PENDING_APPROVERS;
  
  const canApproveAsApprover = isPendingApprover && proposal.status === ProposalStatus.PENDING_APPROVERS;
  
  const canSendToRegistrar = isAdmin && 
                            proposal.status === ProposalStatus.PENDING_APPROVERS && 
                            proposal.pendingApprovers?.length === 0;
  
  const canApproveAsRegistrar = isRegistrar && proposal.status === ProposalStatus.PENDING_REGISTRAR;

  const canEdit = isCreator && 
                 (proposal.status === ProposalStatus.DRAFT || 
                  proposal.status === ProposalStatus.REJECTED ||
                  proposal.status === ProposalStatus.PENDING_SUPERIOR);

  const approvalProgress = getApprovalProgress(proposal.id);

  const getStatusBadge = (status: ProposalStatus) => {
    switch (status) {
      case ProposalStatus.DRAFT:
        return (
          <Badge variant="outline" className="bg-muted/50">
            <Clock className="mr-1 h-3 w-3" />
            Draft
          </Badge>
        );
      case ProposalStatus.PENDING_SUPERIOR:
        return (
          <Badge variant="outline" className="badge-pending">
            <Clock className="mr-1 h-3 w-3" />
            Pending Superior
          </Badge>
        );
      case ProposalStatus.PENDING_ADMIN:
        return (
          <Badge variant="outline" className="badge-warning">
            <Clock className="mr-1 h-3 w-3" />
            Pending Admin
          </Badge>
        );
      case ProposalStatus.PENDING_APPROVERS:
        return (
          <Badge variant="outline" className="badge-info">
            <Users className="mr-1 h-3 w-3" />
            Pending Approvers
          </Badge>
        );
      case ProposalStatus.PENDING_REGISTRAR:
        return (
          <Badge variant="outline" className="badge-warning">
            <CheckSquare className="mr-1 h-3 w-3" />
            Pending Registrar
          </Badge>
        );
      case ProposalStatus.APPROVED:
        return (
          <Badge variant="outline" className="badge-success">
            <CheckCircle className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        );
      case ProposalStatus.REJECTED:
        return (
          <Badge variant="outline" className="badge-destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        );
    }
  };

  const renderProposalTypeDetails = () => {
    switch(proposal.type) {
      case ProposalType.BUDGET:
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
          </div>
        );
      case ProposalType.EQUIPMENT:
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
            {proposal.justification && (
              <div className="bg-muted/30 p-3 rounded-md">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-muted-foreground">Justification</h3>
                </div>
                <p>{proposal.justification}</p>
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
          </div>
        );
      case ProposalType.HIRING:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {proposal.department && (
              <div className="bg-muted/30 p-3 rounded-md">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-muted-foreground">Department</h3>
                </div>
                <p>{proposal.department}</p>
              </div>
            )}
            {proposal.justification && (
              <div className="bg-muted/30 p-3 rounded-md">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-muted-foreground">Justification</h3>
                </div>
                <p>{proposal.justification}</p>
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
          </div>
        );
      case ProposalType.OTHER:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
                  <h3 className="text-sm font-medium text-muted-foreground">Justification</h3>
                </div>
                <p>{proposal.justification}</p>
              </div>
            )}
          </div>
        );
    }
  };

  const handleApprove = () => {
    approveProposal(proposal.id, approvalComment);
    setApprovalComment("");
  };

  const handleReject = () => {
    rejectProposal(proposal.id, rejectionReason);
    setRejectionReason("");
  };

  const handleResubmit = () => {
    resubmitProposal(proposal.id);
  };
  
  const handleApproveAsApprover = () => {
    approveAsApprover(proposal.id, approvalComment);
    setApprovalComment("");
  };
  
  const handleAssignApprovers = () => {
    if (selectedApprovers.length === 0) {
      alert("Please select at least one approver");
      return;
    }
    assignApprovers(proposal.id, selectedApprovers);
    setSelectedApprovers([]);
  };
  
  const handleSendToRegistrar = () => {
    assignToRegistrar(proposal.id);
  };
  
  const handleApproveAsRegistrar = () => {
    approveAsRegistrar(proposal.id, approvalComment);
    setApprovalComment("");
  };
  
  const toggleApprover = (userId: string) => {
    if (selectedApprovers.includes(userId)) {
      setSelectedApprovers(selectedApprovers.filter(id => id !== userId));
    } else {
      setSelectedApprovers([...selectedApprovers, userId]);
    }
  };

  const renderApprovalSteps = () => {
    if (!proposal.approvalSteps || proposal.approvalSteps.length === 0) {
      return null;
    }
    
    // Only render for admin and registrar
    if (!canSeeApprovalDetails) {
      return null;
    }

    return (
      <div className="mb-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Approval Process</h3>
        
        <div className="mb-4">
          <Progress value={approvalProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {Math.round(approvalProgress)}% complete
          </p>
        </div>
        
        <div className="space-y-3">
          {proposal.approvalSteps.map((step, index) => (
            <div key={index} className="border border-border rounded-md p-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{step.userName}</p>
                  <p className="text-sm text-muted-foreground capitalize">{step.userRole.toLowerCase()}</p>
                </div>
                <div>
                  {step.status === "approved" ? (
                    <Badge variant="outline" className="badge-success">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Approved
                    </Badge>
                  ) : step.status === "rejected" ? (
                    <Badge variant="outline" className="badge-destructive">
                      <XCircle className="mr-1 h-3 w-3" />
                      Rejected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="badge-pending">
                      <Clock className="mr-1 h-3 w-3" />
                      Pending
                    </Badge>
                  )}
                </div>
              </div>
              
              {step.timestamp && (
                <p className="text-xs text-muted-foreground mt-1">
                  {format(step.timestamp, "MMM d, yyyy 'at' h:mm a")}
                </p>
              )}
              
              {step.comment && (
                <p className="text-sm mt-2 bg-muted/20 p-2 rounded-md">
                  "{step.comment}"
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const renderApproverSelector = () => {
    if (!canAssignApprovers) return null;
    
    const potentialApprovers = users.filter(user => 
      user.role === UserRole.APPROVER || 
      user.role === UserRole.SUPERIOR
    );
    
    if (potentialApprovers.length === 0) {
      return (
        <div className="mt-4 p-4 bg-muted/20 rounded-md">
          <p className="text-sm text-muted-foreground">
            No users with approver permissions found.
          </p>
        </div>
      );
    }
    
    return (
      <div className="mt-4 border border-border p-4 rounded-md">
        <h3 className="font-medium mb-3">Assign Approvers</h3>
        <div className="space-y-3 mb-4">
          {potentialApprovers.map(user => (
            <div key={user.id} className="flex items-center space-x-2">
              <Checkbox 
                id={user.id}
                checked={selectedApprovers.includes(user.id)}
                onCheckedChange={() => toggleApprover(user.id)}
              />
              <label 
                htmlFor={user.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {user.name} ({user.role})
              </label>
            </div>
          ))}
        </div>
        <Button onClick={handleAssignApprovers} className="mt-2">
          <PlusCircle className="mr-2 h-4 w-4" />
          Assign Selected Approvers
        </Button>
      </div>
    );
  };

  const handleEditProposal = () => {
    navigate(`/proposal/edit/${proposal.id}`);
  };

  return (
    <Layout>
      <div className="flex items-center mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate("/")} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-semibold">Proposal Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-2xl">{proposal.title}</CardTitle>
                  {getStatusBadge(proposal.status)}
                </div>
                <CardDescription>
                  Created by {proposal.createdByName} on {format(proposal.createdAt, "MMMM d, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                  <p className="whitespace-pre-line">{proposal.description}</p>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Proposal Type: <span className="capitalize">{proposal.type.toLowerCase().replace('_', ' ')}</span>
                  </h3>
                  {renderProposalTypeDetails()}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-muted/30 p-3 rounded-md">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Assigned To</h3>
                    <p>{proposal.assignedToName}</p>
                  </div>
                  
                  <div className="bg-muted/30 p-3 rounded-md">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Current Status</h3>
                    <p>{proposal.status.replace(/_/g, " ")}</p>
                  </div>
                </div>

                {renderApprovalSteps()}

                {proposal.status === ProposalStatus.REJECTED && proposal.rejectionReason && (
                  <div className="bg-destructive/5 border border-destructive/20 p-4 rounded-md mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <h3 className="text-sm font-medium">Rejection Reason</h3>
                    </div>
                    <p className="text-destructive/80">{proposal.rejectionReason}</p>
                  </div>
                )}

                {renderApproverSelector()}
              </CardContent>
              <CardFooter className="pt-0 flex flex-wrap gap-3">
                {canEdit && (
                  <Button onClick={handleEditProposal} variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Proposal
                  </Button>
                )}
                
                {canApprove && (
                  <div className="w-full">
                    <Textarea
                      placeholder="Add a comment with your approval (optional)"
                      value={approvalComment}
                      onChange={(e) => setApprovalComment(e.target.value)}
                      className="mb-3"
                    />
                    <Button onClick={handleApprove} className="ml-auto">
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                )}
                
                {canApproveAsApprover && (
                  <div className="w-full">
                    <Textarea
                      placeholder="Add a comment with your approval (optional)"
                      value={approvalComment}
                      onChange={(e) => setApprovalComment(e.target.value)}
                      className="mb-3"
                    />
                    <Button onClick={handleApproveAsApprover}>
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      Approve as Reviewer
                    </Button>
                  </div>
                )}
                
                {canApproveAsRegistrar && (
                  <div className="w-full">
                    <Textarea
                      placeholder="Add a comment with your final approval (optional)"
                      value={approvalComment}
                      onChange={(e) => setApprovalComment(e.target.value)}
                      className="mb-3"
                    />
                    <Button onClick={handleApproveAsRegistrar}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Final Approval
                    </Button>
                  </div>
                )}
                
                {canSendToRegistrar && (
                  <Button onClick={handleSendToRegistrar} className="ml-auto">
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Send to Registrar
                  </Button>
                )}
                
                {canReject && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="text-destructive">
                        <ThumbsDown className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reject Proposal</AlertDialogTitle>
                        <AlertDialogDescription>
                          Please provide a reason for rejection. The proposer will be able to view this feedback.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="py-2">
                        <Textarea
                          placeholder="Reason for rejection"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleReject} 
                          disabled={!rejectionReason.trim()}
                          className="bg-destructive text-destructive-foreground"
                        >
                          Submit Rejection
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                
                {canResubmit && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button>
                        <Upload className="mr-2 h-4 w-4" />
                        Resubmit
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Resubmit Proposal</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will reset the proposal status and send it back for approval. Any previous rejections will be cleared.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleResubmit}>
                          Resubmit
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="lg:col-span-1"
        >
          <Card>
            <CardContent className="pt-6">
              <CommentSection proposalId={proposal.id} comments={proposal.comments} />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default ProposalDetails;
