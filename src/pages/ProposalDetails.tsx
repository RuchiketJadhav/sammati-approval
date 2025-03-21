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
  FileText
} from "lucide-react";

const ProposalDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProposalById, approveProposal, rejectProposal, resubmitProposal } = useProposals();
  const { currentUser } = useAuth();
  const [rejectionReason, setRejectionReason] = useState("");
  const [approvalComment, setApprovalComment] = useState("");

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
  
  const canApprove = 
    (isAssignee && proposal.status === ProposalStatus.PENDING_SUPERIOR) || 
    (isAdmin && proposal.status === ProposalStatus.PENDING_ADMIN);
  
  const canReject = 
    (isAssignee && proposal.status === ProposalStatus.PENDING_SUPERIOR) || 
    (isAdmin && proposal.status === ProposalStatus.PENDING_ADMIN);
  
  const canResubmit = isCreator && proposal.status === ProposalStatus.REJECTED;

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

                {proposal.status === ProposalStatus.REJECTED && proposal.rejectionReason && (
                  <div className="bg-destructive/5 border border-destructive/20 p-4 rounded-md mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <h3 className="text-sm font-medium">Rejection Reason</h3>
                    </div>
                    <p className="text-destructive/80">{proposal.rejectionReason}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0 flex flex-wrap gap-3">
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

