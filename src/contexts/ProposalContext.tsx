
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
  resubmitProposal: (id: string) => void;
  addComment: (proposalId: string, text: string) => void;
  assignApprovers: (proposalId: string, approverIds: string[]) => void;
  approveAsApprover: (proposalId: string, comment?: string) => void;
  assignToRegistrar: (proposalId: string) => void;
  approveAsRegistrar: (proposalId: string, comment?: string) => void;
  getApprovalProgress: (proposalId: string) => number;
  getPendingApprovers: (proposalId: string) => string[];
}

const ProposalContext = createContext<ProposalContextType | undefined>(undefined);

// Demo data
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

  // Load demo data or from localStorage
  useEffect(() => {
    const savedProposals = localStorage.getItem("proposals");
    if (savedProposals) {
      setProposals(JSON.parse(savedProposals));
    } else {
      setProposals(DEMO_PROPOSALS);
    }
  }, []);

  // Save proposals to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("proposals", JSON.stringify(proposals));
  }, [proposals]);

  const getUserProposals = (userId: string) => {
    return proposals.filter(p => p.createdBy === userId);
  };

  const getAssignedProposals = (userId: string) => {
    const user = getUserById(userId);
    
    return proposals.filter(p => {
      // Filter out approved proposals
      if (p.status === ProposalStatus.APPROVED) {
        return false;
      }
      
      // Include if directly assigned to the user
      if (p.assignedTo === userId) {
        return true;
      }
      
      // Include if pending admin and the user is admin
      if (p.status === ProposalStatus.PENDING_ADMIN && user?.role === UserRole.ADMIN) {
        return true;
      }

      // Include if user is one of the pending approvers
      if (p.status === ProposalStatus.PENDING_APPROVERS && 
          p.pendingApprovers?.includes(userId)) {
        return true;
      }

      // Include if pending registrar and user is a registrar
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
      // Add optional fields if they exist
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
    
    // Check if user has permission to edit
    if (currentUser.id !== proposal.createdBy) 
      throw new Error("You do not have permission to edit this proposal");
      
    // Check if proposal can be edited
    if (proposal.status !== ProposalStatus.DRAFT && 
        proposal.status !== ProposalStatus.REJECTED)
      throw new Error("This proposal cannot be edited as it is under review");
    
    // If assignedTo has changed, update assignedToName
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
        
        // Create a copy to modify
        const updatedProposal = { ...proposal, updatedAt: Date.now() };
        
        // Add comment if provided
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

        // Create or update approval steps
        if (!updatedProposal.approvalSteps) {
          updatedProposal.approvalSteps = [];
        }

        // Update status based on approval flow
        if (proposal.status === ProposalStatus.PENDING_SUPERIOR) {
          updatedProposal.approvedBySuperior = true;
          updatedProposal.status = ProposalStatus.PENDING_ADMIN;
          
          // Add approval step
          updatedProposal.approvalSteps.push({
            userId: currentUser.id,
            userName: currentUser.name,
            userRole: currentUser.role,
            status: "approved",
            timestamp: Date.now(),
            comment: comment
          });
          
          // When a superior approves, assign to an admin
          const admins = getAdmins();
          if (admins.length > 0) {
            // Assign to the first admin for simplicity
            const admin = admins[0];
            updatedProposal.assignedTo = admin.id;
            updatedProposal.assignedToName = admin.name;
          }
          
          toast.success("Proposal approved and forwarded to admin");
        } else if (proposal.status === ProposalStatus.PENDING_ADMIN) {
          updatedProposal.approvedByAdmin = true;
          updatedProposal.status = ProposalStatus.PENDING_APPROVERS;
          
          // Add approval step
          updatedProposal.approvalSteps.push({
            userId: currentUser.id,
            userName: currentUser.name,
            userRole: currentUser.role,
            status: "approved",
            timestamp: Date.now(),
            comment: comment
          });
          
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
        
        // Create a list of approval steps for the new approvers
        const approvalSteps = proposal.approvalSteps || [];
        const newApprovalSteps = [...approvalSteps];
        
        approverIds.forEach(approverId => {
          const approver = getUserById(approverId);
          if (!approver) return;
          
          newApprovalSteps.push({
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
          approvalSteps: newApprovalSteps,
          updatedAt: Date.now()
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
        
        // Create a copy
        const updatedProposal = { ...proposal, updatedAt: Date.now() };
        
        // Add comment if provided
        if (comment) {
          const newComment: Comment = {
            id: `comment${Date.now()}`,
            proposalId,
            userId: currentUser.id,
            userName: currentUser.name,
            userAvatar: currentUser.avatar,
            text: comment,
            timestamp: Date.now()
          };
          updatedProposal.comments = [...proposal.comments, newComment];
        }
        
        // Update approval steps
        const approvalSteps = updatedProposal.approvalSteps || [];
        const updatedSteps = approvalSteps.map(step => {
          if (step.userId === currentUser.id && step.status === "pending") {
            return {
              ...step,
              status: "approved",
              timestamp: Date.now(),
              comment
            };
          }
          return step;
        });
        updatedProposal.approvalSteps = updatedSteps;
        
        // Remove from pending approvers
        const pendingApprovers = (updatedProposal.pendingApprovers || [])
          .filter(id => id !== currentUser.id);
        updatedProposal.pendingApprovers = pendingApprovers;
        
        // Check if all approvers have approved
        if (pendingApprovers.length === 0) {
          updatedProposal.status = ProposalStatus.PENDING_REGISTRAR;
          toast.success("All approvers have approved. Proposal moved to Registrar.");
        } else {
          toast.success("Proposal approved. Waiting for other approvers.");
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
        
        // Create a copy
        const updatedProposal = { ...proposal, updatedAt: Date.now() };
        
        // Add comment if provided
        if (comment) {
          const newComment: Comment = {
            id: `comment${Date.now()}`,
            proposalId,
            userId: currentUser.id,
            userName: currentUser.name,
            userAvatar: currentUser.avatar,
            text: comment,
            timestamp: Date.now()
          };
          updatedProposal.comments = [...proposal.comments, newComment];
        }
        
        // Update approval steps
        const approvalSteps = updatedProposal.approvalSteps || [];
        approvalSteps.push({
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          status: "approved",
          timestamp: Date.now(),
          comment
        });
        updatedProposal.approvalSteps = approvalSteps;
        
        // Final approval
        updatedProposal.status = ProposalStatus.APPROVED;
        toast.success("Proposal has received final approval");
        
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
        
        // Add rejection comment
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
        
        // Reset rejection info and set status back to PENDING_SUPERIOR
        return {
          ...proposal,
          status: ProposalStatus.PENDING_SUPERIOR,
          rejectedBy: undefined,
          rejectedByName: undefined,
          rejectionReason: undefined,
          approvedBySuperior: false,
          approvedByAdmin: false,
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
        resubmitProposal,
        addComment,
        assignApprovers,
        approveAsApprover,
        assignToRegistrar,
        approveAsRegistrar,
        getApprovalProgress,
        getPendingApprovers
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
