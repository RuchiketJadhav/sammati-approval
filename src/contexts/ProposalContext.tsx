import React, { createContext, useContext, useState, useEffect } from "react";
import { Proposal, ProposalStatus, Comment, ProposalFormData, ProposalType, ApprovalStep, UserRole } from "../utils/types";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

interface ProposalContextType {
  proposals: Proposal[];
  getUserProposals: (userId: string) => Proposal[];
  getAssignedProposals: (userId: string) => Proposal[];
  getProposalById: (id: string) => Proposal | undefined;
  createProposal: (data: ProposalFormData) => Proposal;
  updateProposal: (id: string, data: Partial<Proposal>) => void;
  deleteProposal: (id: string) => void;
  approveProposal: (id: string, comment?: string) => void;
  rejectProposal: (id: string, reason: string) => void;
  requestRevision: (id: string, reason: string) => void;
  resubmitProposal: (id: string) => void;
  addComment: (proposalId: string, text: string) => void;
  assignApprovers: (proposalId: string, approverIds: string[]) => void;
  approveAsApprover: (proposalId: string, comment?: string) => void;
  rejectAsApprover: (proposalId: string, reason: string) => void;
  assignToRegistrar: (proposalId: string) => void;
  approveAsRegistrar: (proposalId: string, comment?: string) => void;
  rejectAsRegistrar: (proposalId: string, reason: string) => void;
  requestRevisionAsRegistrar: (proposalId: string, reason: string) => void;
  getApprovalProgress: (proposalId: string) => number;
  getPendingApprovers: (proposalId: string) => string[];
  canResubmit: (proposal: Proposal, userId: string) => boolean;
  hasAllApproversResponded: (proposalId: string) => boolean;
}

const ProposalContext = createContext<ProposalContextType | undefined>(undefined);

const DEMO_PROPOSALS: Proposal[] = [
  {
    id: "proposal1",
    title: "Marketing Budget Increase",
    description: "Request to increase Q3 marketing budget by 15% to support new product launch.",
    createdBy: "user1",
    createdByName: "John Doe",
    createdAt: Date.now() - 86400000 * 2, // 2 days ago
    updatedAt: Date.now() - 86400000 * 2,
    status: ProposalStatus.PENDING_SUPERIOR,
    assignedTo: "user2",
    assignedToName: "Jane Smith",
    type: ProposalType.BUDGET,
    budget: "$15,000",
    timeline: "Q3 2023",
    comments: []
  },
  {
    id: "proposal2",
    title: "Office Equipment Upgrade",
    description: "Proposal to upgrade office computers and monitors for the design team.",
    createdBy: "user1",
    createdByName: "John Doe",
    createdAt: Date.now() - 86400000 * 5, // 5 days ago
    updatedAt: Date.now() - 86400000 * 3, // 3 days ago
    status: ProposalStatus.APPROVED,
    assignedTo: "user2",
    assignedToName: "Jane Smith",
    approvedBySuperior: true,
    approvedByAdmin: true,
    type: ProposalType.EQUIPMENT,
    budget: "$8,500",
    justification: "Current equipment is over 5 years old and significantly slowing down productivity.",
    timeline: "Next month",
    comments: [
      {
        id: "comment1",
        proposalId: "proposal2",
        userId: "user2",
        userName: "Jane Smith",
        userAvatar: "https://i.pravatar.cc/150?img=2",
        text: "I approve this request. The design team needs this upgrade.",
        timestamp: Date.now() - 86400000 * 4
      },
      {
        id: "comment2",
        proposalId: "proposal2",
        userId: "user3",
        userName: "Alex Johnson",
        userAvatar: "https://i.pravatar.cc/150?img=3",
        text: "Approved. Please proceed with the procurement process.",
        timestamp: Date.now() - 86400000 * 3
      }
    ]
  },
  {
    id: "proposal3",
    title: "New Hiring Request",
    description: "Request to open a new position for a Senior Developer in the backend team.",
    createdBy: "user1",
    createdByName: "John Doe",
    createdAt: Date.now() - 86400000 * 7, // 7 days ago
    updatedAt: Date.now() - 86400000 * 6, // 6 days ago
    status: ProposalStatus.REJECTED,
    assignedTo: "user4",
    assignedToName: "Sarah Williams",
    rejectedBy: "user4",
    rejectedByName: "Sarah Williams",
    rejectionReason: "We need more details about the budget implications and specific requirements for this position.",
    type: ProposalType.HIRING,
    department: "Engineering",
    justification: "Increased workload due to new projects.",
    timeline: "Q2 2023",
    comments: [
      {
        id: "comment3",
        proposalId: "proposal3",
        userId: "user4",
        userName: "Sarah Williams",
        userAvatar: "https://i.pravatar.cc/150?img=4",
        text: "We need more details about the budget implications and specific requirements for this position.",
        timestamp: Date.now() - 86400000 * 6
      }
    ]
  }
];

export const ProposalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const { currentUser, getUserById, getAdmins } = useAuth();

  useEffect(() => {
    const savedProposals = localStorage.getItem("proposals");
    if (savedProposals) {
      setProposals(JSON.parse(savedProposals));
    } else {
      setProposals(DEMO_PROPOSALS);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("proposals", JSON.stringify(proposals));
  }, [proposals]);

  const getUserProposals = (userId: string) => {
    return proposals.filter(p => p.createdBy === userId);
  };

  const getAssignedProposals = (userId: string) => {
    const user = getUserById(userId);
    
    return proposals.filter(p => {
      if (p.status === ProposalStatus.APPROVED) {
        return false;
      }
      
      if (p.assignedTo === userId) {
        return true;
      }
      
      if (p.status === ProposalStatus.PENDING_ADMIN && user?.role === UserRole.ADMIN) {
        return true;
      }

      if (p.status === ProposalStatus.PENDING_APPROVERS && 
          p.pendingApprovers?.includes(userId)) {
        return true;
      }

      if (p.status === ProposalStatus.PENDING_REGISTRAR && 
          user?.role === UserRole.REGISTRAR) {
        return true;
      }
      
      return false;
    });
  };

  const getProposalById = (id: string) => {
    return proposals.find(p => p.id === id);
  };

  const createProposal = (data: ProposalFormData) => {
    if (!currentUser) throw new Error("You must be logged in to create a proposal");
    
    const assignedUser = getUserById(data.assignedTo);
    if (!assignedUser) throw new Error("Assigned user not found");
    
    const newProposal: Proposal = {
      id: `proposal${Date.now()}`,
      title: data.title,
      description: data.description,
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: ProposalStatus.PENDING_SUPERIOR,
      assignedTo: data.assignedTo,
      assignedToName: assignedUser.name,
      type: data.type || ProposalType.OTHER,
      comments: [],
      ...(data.budget && { budget: data.budget }),
      ...(data.timeline && { timeline: data.timeline }),
      ...(data.justification && { justification: data.justification }),
      ...(data.department && { department: data.department }),
    };
    
    setProposals(prev => [...prev, newProposal]);
    toast.success("Proposal created successfully");
    return newProposal;
  };

  const updateProposal = (id: string, data: Partial<Proposal>) => {
    if (!currentUser) throw new Error("You must be logged in to update a proposal");
    
    const proposal = getProposalById(id);
    if (!proposal) throw new Error("Proposal not found");
    
    const isCreator = currentUser.id === proposal.createdBy;
    const isAdmin = currentUser.role === UserRole.ADMIN;
    
    if (!isCreator && !isAdmin) 
      throw new Error("You do not have permission to edit this proposal");
      
    const canEdit = isAdmin || (isCreator && 
      (proposal.status === ProposalStatus.DRAFT || 
       proposal.status === ProposalStatus.REJECTED ||
       proposal.status === ProposalStatus.PENDING_SUPERIOR ||
       proposal.status === ProposalStatus.NEEDS_REVISION));
    
    if (!canEdit)
      throw new Error("This proposal cannot be edited as it is under review");
    
    let assignedToName = proposal.assignedToName;
    if (data.assignedTo && data.assignedTo !== proposal.assignedTo) {
      const assignedUser = getUserById(data.assignedTo);
      if (!assignedUser) throw new Error("Assigned user not found");
      assignedToName = assignedUser.name;
    }
    
    setProposals(prev => 
      prev.map(p => 
        p.id === id 
          ? { 
              ...p, 
              ...data, 
              assignedToName, 
              updatedAt: Date.now() 
            } 
          : p
      )
    );
    toast.success("Proposal updated successfully");
  };

  const deleteProposal = (id: string) => {
    setProposals(prev => prev.filter(proposal => proposal.id !== id));
    toast.success("Proposal deleted successfully");
  };

  const approveProposal = (id: string, comment?: string) => {
    if (!currentUser) throw new Error("You must be logged in to approve a proposal");
    
    setProposals(prev => 
      prev.map(proposal => {
        if (proposal.id !== id) return proposal;
        
        const updatedProposal = { ...proposal, updatedAt: Date.now() };
        
        if (comment) {
          const newComment: Comment = {
            id: `comment${Date.now()}`,
            proposalId: id,
            userId: currentUser.id,
            userName: currentUser.name,
            userAvatar: currentUser.avatar,
            text: comment,
            timestamp: Date.now()
          };
          updatedProposal.comments = [...proposal.comments, newComment];
        }

        if (!updatedProposal.approvalSteps) {
          updatedProposal.approvalSteps = [];
        }

        if (proposal.status === ProposalStatus.PENDING_SUPERIOR) {
          updatedProposal.approvedBySuperior = true;
          updatedProposal.status = ProposalStatus.PENDING_ADMIN;
          
          const admins = getAdmins();
          if (admins.length > 0) {
            updatedProposal.assignedTo = admins[0].id;
            updatedProposal.assignedToName = admins[0].name;
          }
          
          toast.success("Proposal approved and forwarded to admin");
        } else if (proposal.status === ProposalStatus.PENDING_ADMIN) {
          updatedProposal.approvedByAdmin = true;
          updatedProposal.status = ProposalStatus.PENDING_APPROVERS;
          updatedProposal.approversAssigned = false; // Reset approver assignment status
          updatedProposal.needsReassignment = false; // Reset reassignment flag
          
          toast.success("Proposal approved. Please assign approvers.");
        }
        
        return updatedProposal;
      })
    );
  };

  const assignApprovers = (proposalId: string, approverIds: string[]) => {
    if (!currentUser) throw new Error("You must be logged in to assign approvers");
    if (currentUser.role !== UserRole.ADMIN) throw new Error("Only admins can assign approvers");
    
    setProposals(prev => 
      prev.map(proposal => {
        if (proposal.id !== proposalId) return proposal;
        
        if (proposal.status !== ProposalStatus.PENDING_APPROVERS) {
          throw new Error("This proposal is not ready for approver assignment");
        }
        
        // Check if reassignment is needed but not being done
        if (proposal.needsReassignment === true && approverIds.length === 0) {
          throw new Error("This proposal needs to have approvers reassigned after revision");
        }
        
        const approvalSteps = proposal.approvalSteps || [];
        const newApprovalSteps = [...approvalSteps];
        
        // Filter out any previous approver steps if we're reassigning after a revision
        const filteredApprovalSteps = newApprovalSteps.filter(step => 
          !approverIds.includes(step.userId) || 
          (step.userRole !== UserRole.APPROVER && step.userRole !== UserRole.SUPERIOR)
        );
        
        approverIds.forEach(approverId => {
          const approver = getUserById(approverId);
          if (!approver) return;
          
          filteredApprovalSteps.push({
            userId: approver.id,
            userName: approver.name,
            userRole: approver.role,
            status: "pending"
          });
        });
        
        toast.success(`Assigned ${approverIds.length} approvers to the proposal`);
        
        return {
          ...proposal,
          approvers: approverIds,
          pendingApprovers: approverIds,
          approvalSteps: filteredApprovalSteps,
          updatedAt: Date.now(),
          approversAssigned: true, // Mark approvers as assigned
          needsReassignment: false // Reset the reassignment flag
        };
      })
    );
  };
  
  const approveAsApprover = (proposalId: string, comment?: string) => {
    if (!currentUser) throw new Error("You must be logged in to approve");
    
    setProposals(prev => 
      prev.map(proposal => {
        if (proposal.id !== proposalId) return proposal;
        
        if (proposal.status !== ProposalStatus.PENDING_APPROVERS) {
          throw new Error("This proposal is not pending approver review");
        }
        
        if (!proposal.pendingApprovers?.includes(currentUser.id)) {
          throw new Error("You are not assigned as an approver for this proposal");
        }
        
        const updatedProposal = { ...proposal, updatedAt: Date.now() };
        
        const approvalSteps = updatedProposal.approvalSteps || [];
        const updatedSteps = approvalSteps.map(step => {
          if (step.userId === currentUser.id && step.status === "pending") {
            return {
              ...step,
              status: "approved" as const,
              timestamp: Date.now(),
              comment
            };
          }
          return step;
        });
        updatedProposal.approvalSteps = updatedSteps;
        
        const pendingApprovers = (updatedProposal.pendingApprovers || [])
          .filter(id => id !== currentUser.id);
        updatedProposal.pendingApprovers = pendingApprovers;
        
        // Only move to PENDING_REGISTRAR when ALL approvers have responded
        // (either approved or rejected)
        const allResponded = hasAllApproversResponded(proposal.id);
        
        if (pendingApprovers.length === 0 || allResponded) {
          updatedProposal.status = ProposalStatus.PENDING_REGISTRAR;
          toast.success("All approvers have responded. Proposal moved to Registrar.");
        } else {
          toast.success("Proposal approved. Waiting for other approvers.");
        }
        
        return updatedProposal;
      })
    );
  };
  
  const rejectAsApprover = (proposalId: string, reason: string) => {
    if (!currentUser) throw new Error("You must be logged in to reject a proposal");
    
    setProposals(prev => 
      prev.map(proposal => {
        if (proposal.id !== proposalId) return proposal;
        
        if (proposal.status !== ProposalStatus.PENDING_APPROVERS) {
          throw new Error("This proposal is not pending approver review");
        }
        
        if (!proposal.pendingApprovers?.includes(currentUser.id)) {
          throw new Error("You are not assigned as an approver for this proposal");
        }
        
        const updatedProposal = { ...proposal, updatedAt: Date.now() };
        
        // Add a comment for the rejection
        const newComment: Comment = {
          id: `comment${Date.now()}`,
          proposalId,
          userId: currentUser.id,
          userName: currentUser.name,
          userAvatar: currentUser.avatar,
          text: `Rejected: ${reason}`,
          timestamp: Date.now()
        };
        updatedProposal.comments = [...proposal.comments, newComment];
        
        const approvalSteps = updatedProposal.approvalSteps || [];
        const updatedSteps = approvalSteps.map(step => {
          if (step.userId === currentUser.id && step.status === "pending") {
            return {
              ...step,
              status: "rejected" as const,
              timestamp: Date.now(),
              comment: reason
            };
          }
          return step;
        });
        updatedProposal.approvalSteps = updatedSteps;
        
        const pendingApprovers = (updatedProposal.pendingApprovers || [])
          .filter(id => id !== currentUser.id);
        updatedProposal.pendingApprovers = pendingApprovers;
        
        // Even if an approver rejects, we wait for all approvers to respond
        const allResponded = hasAllApproversResponded(proposal.id);
        
        if (pendingApprovers.length === 0 || allResponded) {
          updatedProposal.status = ProposalStatus.PENDING_REGISTRAR;
          toast.success("All approvers have responded. Proposal moved to Registrar despite rejection.");
        } else {
          toast.info("Your rejection has been recorded. Waiting for other approvers to respond.");
        }
        
        return updatedProposal;
      })
    );
  };

  const assignToRegistrar = (proposalId: string) => {
    if (!currentUser) throw new Error("You must be logged in");
    if (currentUser.role !== UserRole.ADMIN) throw new Error("Only admins can assign to registrar");
    
    setProposals(prev => 
      prev.map(proposal => {
        if (proposal.id !== proposalId) return proposal;
        
        if (proposal.status !== ProposalStatus.PENDING_APPROVERS) {
          throw new Error("This proposal must be in approvers stage");
        }
        
        // Check if all approvers have responded
        const allApproversResponded = hasAllApproversResponded(proposalId);
        if (!allApproversResponded) {
          throw new Error("All approvers must respond before sending to registrar");
        }
        
        return {
          ...proposal,
          status: ProposalStatus.PENDING_REGISTRAR,
          assignedToRegistrar: true,
          updatedAt: Date.now()
        };
      })
    );
    
    toast.success("Proposal assigned to Registrar for final approval");
  };
  
  const approveAsRegistrar = (proposalId: string, comment?: string) => {
    if (!currentUser) throw new Error("You must be logged in");
    if (currentUser.role !== UserRole.REGISTRAR) throw new Error("Only registrars can perform final approval");
    
    setProposals(prev => 
      prev.map(proposal => {
        if (proposal.id !== proposalId) return proposal;
        
        if (proposal.status !== ProposalStatus.PENDING_REGISTRAR) {
          throw new Error("This proposal is not pending registrar approval");
        }
        
        const updatedProposal = { ...proposal, updatedAt: Date.now() };
        
        const approvalSteps = updatedProposal.approvalSteps || [];
        const newStep: ApprovalStep = {
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          status: "approved", 
          timestamp: Date.now(),
          comment
        };
        
        updatedProposal.approvalSteps = [...approvalSteps, newStep];
        
        updatedProposal.status = ProposalStatus.APPROVED;
        toast.success("Proposal has received final approval");
        
        return updatedProposal;
      })
    );
  };

  const rejectAsRegistrar = (proposalId: string, reason: string) => {
    if (!currentUser) throw new Error("You must be logged in");
    if (currentUser.role !== UserRole.REGISTRAR) throw new Error("Only registrars can reject at this stage");
    
    setProposals(prev => 
      prev.map(proposal => {
        if (proposal.id !== proposalId) return proposal;
        
        if (proposal.status !== ProposalStatus.PENDING_REGISTRAR) {
          throw new Error("This proposal is not pending registrar review");
        }
        
        const updatedProposal = { ...proposal, updatedAt: Date.now() };
        
        const approvalSteps = updatedProposal.approvalSteps || [];
        const newStep: ApprovalStep = {
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          status: "rejected", 
          timestamp: Date.now(),
          comment: reason
        };
        
        updatedProposal.approvalSteps = [...approvalSteps, newStep];
        
        updatedProposal.status = ProposalStatus.REJECTED;
        updatedProposal.rejectedBy = currentUser.id;
        updatedProposal.rejectedByName = currentUser.name;
        updatedProposal.rejectionReason = reason;
        updatedProposal.rejectedByRegistrar = true; // Set the flag to prevent resubmission
        
        toast.error("Proposal rejected by Registrar");
        return updatedProposal;
      })
    );
  };

  const requestRevisionAsRegistrar = (proposalId: string, reason: string) => {
    if (!currentUser) throw new Error("You must be logged in");
    if (currentUser.role !== UserRole.REGISTRAR) throw new Error("Only registrars can request revisions at this stage");
    
    setProposals(prev => 
      prev.map(proposal => {
        if (proposal.id !== proposalId) return proposal;
        
        if (proposal.status !== ProposalStatus.PENDING_REGISTRAR) {
          throw new Error("This proposal is not pending registrar review");
        }
        
        const updatedProposal = { ...proposal, updatedAt: Date.now() };
        
        const approvalSteps = updatedProposal.approvalSteps || [];
        const newStep: ApprovalStep = {
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          status: "resubmit", 
          timestamp: Date.now(),
          comment: reason
        };
        
        updatedProposal.approvalSteps = [...approvalSteps, newStep];
        
        updatedProposal.status = ProposalStatus.NEEDS_REVISION;
        updatedProposal.rejectionReason = reason;
        updatedProposal.needsReassignment = true; // Mark that reassignment is needed after revision
        
        const newComment: Comment = {
          id: `comment${Date.now()}`,
          proposalId,
          userId: currentUser.id,
          userName: currentUser.name,
          userAvatar: currentUser.avatar,
          text: `Revision requested by Registrar: ${reason}`,
          timestamp: Date.now()
        };
        
        updatedProposal.comments = [...proposal.comments, newComment];
        
        toast.info("Revision requested from the proposer");
        return updatedProposal;
      })
    );
  };

  const getApprovalProgress = (proposalId: string) => {
    const proposal = getProposalById(proposalId);
    if (!proposal || !proposal.approvalSteps) return 0;
    
    const totalSteps = proposal.approvalSteps.length;
    const completedSteps = proposal.approvalSteps.filter(
      step => step.status === "approved" || step.status === "rejected"
    ).length;
    
    return totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  };
  
  const getPendingApprovers = (proposalId: string) => {
    const proposal = getProposalById(proposalId);
    return proposal?.pendingApprovers || [];
  };

  const rejectProposal = (id: string, reason: string) => {
    if (!currentUser) throw new Error("You must be logged in to reject a proposal");
    
    setProposals(prev => 
      prev.map(proposal => {
        if (proposal.id !== id) return proposal;
        
        const newComment: Comment = {
          id: `comment${Date.now()}`,
          proposalId: id,
          userId: currentUser.id,
          userName: currentUser.name,
          userAvatar: currentUser.avatar,
          text: reason,
          timestamp: Date.now()
        };
        
        return {
          ...proposal,
          status: ProposalStatus.REJECTED,
          rejectedBy: currentUser.id,
          rejectedByName: currentUser.name,
          rejectionReason: reason,
          comments: [...proposal.comments, newComment],
          updatedAt: Date.now()
        };
      })
    );
    toast.error("Proposal rejected");
  };

  const resubmitProposal = (id: string) => {
    if (!currentUser) throw new Error("You must be logged in to resubmit a proposal");
    
    setProposals(prev => 
      prev.map(proposal => {
        if (proposal.id !== id) return proposal;
        
        return {
          ...proposal,
          status: ProposalStatus.PENDING_SUPERIOR,
          rejectedBy: undefined,
          rejectedByName: undefined,
          rejectionReason: undefined,
          approvedBySuperior: false,
          approvedByAdmin: false,
          resubmitted: true,
          resubmittedAt: Date.now(),
          approversAssigned: false, // Reset approver assignment status
          needsReassignment: false, // Reset reassignment flag
          updatedAt: Date.now()
        };
      })
    );
    toast.success("Proposal resubmitted successfully");
  };

  const addComment = (proposalId: string, text: string) => {
    if (!currentUser) throw new Error("You must be logged in to add a comment");
    
    const newComment: Comment = {
      id: `comment${Date.now()}`,
      proposalId,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      text,
      timestamp: Date.now()
    };
    
    setProposals(prev => 
      prev.map(proposal => 
        proposal.id === proposalId 
          ? {
              ...proposal,
              comments: [...proposal.comments, newComment],
              updatedAt: Date.now()
            }
          : proposal
      )
    );
    toast.success("Comment added");
  };

  const canResubmit = (proposal: Proposal, userId: string) => {
    // Check if the proposal was rejected by the registrar
    if (proposal.rejectedByRegistrar) {
      return false;
    }
    
    return proposal.createdBy === userId && 
      (proposal.status === ProposalStatus.NEEDS_REVISION || 
       proposal.status === ProposalStatus.REJECTED);
  };

  const requestRevision = (id: string, reason: string) => {
    if (!currentUser) throw new Error("You must be logged in to request revisions");
    
    setProposals(prev => 
      prev.map(proposal => {
        if (proposal.id !== id) return proposal;
        
        const newComment: Comment = {
          id: `comment${Date.now()}`,
          proposalId: id,
          userId: currentUser.id,
          userName: currentUser.name,
          userAvatar: currentUser.avatar,
          text: `Revision requested: ${reason}`,
          timestamp: Date.now()
        };
        
        return {
          ...proposal,
          status: ProposalStatus.NEEDS_REVISION,
          rejectionReason: reason,
          needsReassignment: true, // Mark that reassignment is needed after revision
          comments: [...proposal.comments, newComment],
          updatedAt: Date.now()
        };
      })
    );
    toast.info("Revision requested from the proposer");
  };

  const hasAllApproversResponded = (proposalId: string) => {
    const proposal = getProposalById(proposalId);
    if (!proposal || !proposal.approvers || !proposal.approvalSteps) return false;
    
    const approverResponseStatus = new Map<string, boolean>();
    
    // Mark each approver as having responded or not
    proposal.approvers.forEach(approverId => {
      approverResponseStatus.set(approverId, false);
    });
    
    // Update response status based on approval steps
    proposal.approvalSteps.forEach(step => {
      if (proposal.approvers?.includes(step.userId) && 
          (step.status === "approved" || step.status === "rejected" || step.status === "resubmit")) {
        approverResponseStatus.set(step.userId, true);
      }
    });
    
    // Check if all approvers have responded
    return Array.from(approverResponseStatus.values()).every(hasResponded => hasResponded);
  };

  return (
    <ProposalContext.Provider
      value={{
        proposals,
        getUserProposals,
        getAssignedProposals,
        getProposalById,
        createProposal,
        updateProposal,
        deleteProposal,
        approveProposal,
        rejectProposal,
        requestRevision,
        resubmitProposal,
        addComment,
        assignApprovers,
        approveAsApprover,
        rejectAsApprover,
        requestRevisionAsApprover: () => {}, // Placeholder since we removed the functionality
        assignToRegistrar,
        approveAsRegistrar,
        rejectAsRegistrar,
        requestRevisionAsRegistrar,
        getApprovalProgress,
        getPendingApprovers,
        canResubmit,
        hasAllApproversResponded
      }}
    >
      {children}
    </ProposalContext.Provider>
  );
};

export const useProposals = () => {
  const context = useContext(ProposalContext);
  if (context === undefined) {
    throw new Error("useProposals must be used within a ProposalProvider");
  }
  return context;
};
