
import React, { createContext, useContext, useState, useEffect } from "react";
import { Proposal, ProposalStatus, Comment, ProposalFormData, ProposalType } from "../utils/types";
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
  const { currentUser, getUserById } = useAuth();

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
    return proposals.filter(p => p.assignedTo === userId);
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

        // Update status based on approval flow
        if (proposal.status === ProposalStatus.PENDING_SUPERIOR) {
          updatedProposal.approvedBySuperior = true;
          updatedProposal.status = ProposalStatus.PENDING_ADMIN;
          toast.success("Proposal approved and forwarded to admin");
        } else if (proposal.status === ProposalStatus.PENDING_ADMIN) {
          updatedProposal.approvedByAdmin = true;
          updatedProposal.status = ProposalStatus.APPROVED;
          toast.success("Proposal fully approved");
        }
        
        return updatedProposal;
      })
    );
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
        addComment
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
