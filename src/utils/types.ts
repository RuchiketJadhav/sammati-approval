
export enum ProposalStatus {
  DRAFT = "DRAFT",
  PENDING_SUPERIOR = "PENDING_SUPERIOR",
  PENDING_ADMIN = "PENDING_ADMIN",
  PENDING_APPROVERS = "PENDING_APPROVERS",
  PENDING_REGISTRAR = "PENDING_REGISTRAR",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED"
}

export enum UserRole {
  USER = "USER",
  SUPERIOR = "SUPERIOR",
  ADMIN = "ADMIN",
  APPROVER = "APPROVER",
  REGISTRAR = "REGISTRAR"
}

// Base ProposalType enum for backward compatibility
export enum ProposalType {
  BUDGET = "BUDGET",
  EQUIPMENT = "EQUIPMENT",
  HIRING = "HIRING",
  OTHER = "OTHER"
}

// New interface for custom proposal types
export interface CustomProposalType {
  id: string;
  name: string;
  description?: string;
  requiredFields: ProposalField[];
  createdAt: number;
  createdBy: string;
  updatedAt: number;
}

export enum FieldType {
  TEXT = "TEXT",
  TEXTAREA = "TEXTAREA",
  NUMBER = "NUMBER",
  DATE = "DATE",
  SELECT = "SELECT",
  CHECKBOX = "CHECKBOX"
}

export interface ProposalField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[]; // For SELECT type fields
  description?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Comment {
  id: string;
  proposalId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  timestamp: number;
}

export interface ApprovalStep {
  userId: string;
  userName: string;
  userRole: UserRole;
  status: "pending" | "approved" | "rejected";
  timestamp?: number;
  comment?: string;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdByName: string;
  createdAt: number;
  updatedAt: number;
  status: ProposalStatus;
  assignedTo: string;
  assignedToName: string;
  approvedBySuperior?: boolean;
  approvedByAdmin?: boolean;
  rejectedBy?: string;
  rejectedByName?: string;
  rejectionReason?: string;
  comments: Comment[];
  // Type fields
  type: ProposalType | string; // String for custom types
  customTypeId?: string; // Reference to a custom type
  // Dynamic fields based on customTypeId
  fieldValues?: Record<string, any>;
  // Legacy fields (kept for backward compatibility)
  budget?: string;
  timeline?: string;
  justification?: string;
  department?: string;
  // Multi-approver workflow
  approvers?: string[]; // List of user IDs who need to approve
  approvalSteps?: ApprovalStep[]; // History of the approval process
  pendingApprovers?: string[]; // List of user IDs who still need to approve
  assignedToRegistrar?: boolean;
  // When a proposal is resubmitted
  resubmitted?: boolean;
  resubmittedAt?: number;
}

export type ProposalFormData = {
  title: string;
  description: string;
  assignedTo: string;
  type: ProposalType | string;
  customTypeId?: string;
  fieldValues?: Record<string, any>;
  // Legacy fields
  budget?: string;
  timeline?: string;
  justification?: string;
  department?: string;
};
