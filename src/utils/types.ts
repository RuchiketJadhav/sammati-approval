
export enum ProposalStatus {
  DRAFT = "DRAFT",
  PENDING_SUPERIOR = "PENDING_SUPERIOR",
  PENDING_ADMIN = "PENDING_ADMIN",
  PENDING_APPROVERS = "PENDING_APPROVERS",
  PENDING_REGISTRAR = "PENDING_REGISTRAR",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  NEEDS_REVISION = "NEEDS_REVISION"
}

export enum UserRole {
  USER = "USER",
  SUPERIOR = "SUPERIOR",
  ADMIN = "ADMIN",
  APPROVER = "APPROVER",
  REGISTRAR = "REGISTRAR"
}

export enum ProposalType {
  BUDGET = "BUDGET",
  EQUIPMENT = "EQUIPMENT",
  HIRING = "HIRING",
  OTHER = "OTHER"
}

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
  status: "pending" | "approved" | "rejected" | "resubmit";
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
  type: ProposalType | string;
  customTypeId?: string;
  fieldValues?: Record<string, any>;
  budget?: string;
  timeline?: string;
  justification?: string;
  department?: string;
  approvers?: string[];
  approvalSteps?: ApprovalStep[];
  pendingApprovers?: string[];
  assignedToRegistrar?: boolean;
  resubmitted?: boolean;
  resubmittedAt?: number;
  approversAssigned?: boolean;
  needsReassignment?: boolean;
  rejectedByRegistrar?: boolean; // Flag to track registrar rejections
}

export type ProposalFormData = {
  title: string;
  description: string;
  assignedTo: string;
  type: ProposalType | string;
  customTypeId?: string;
  fieldValues?: Record<string, any>;
  budget?: string;
  timeline?: string;
  justification?: string;
  department?: string;
};
