
import React, { createContext, useContext, useState, useEffect } from "react";
import { CustomProposalType, ProposalType, ProposalField, FieldType, UserRole } from "../utils/types";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

// Example custom fields for built-in types
const BUDGET_FIELDS: ProposalField[] = [
  {
    id: "budget-amount",
    name: "budget",
    label: "Budget Amount",
    type: FieldType.NUMBER,
    required: true,
    description: "Specify the exact budget amount needed"
  },
  {
    id: "budget-timeline",
    name: "timeline",
    label: "Timeline",
    type: FieldType.TEXT,
    required: false,
    description: "When do you need this approved by?"
  }
];

const EQUIPMENT_FIELDS: ProposalField[] = [
  {
    id: "equipment-cost",
    name: "budget",
    label: "Estimated Cost",
    type: FieldType.NUMBER,
    required: true,
    description: "The approximate cost of the requested equipment"
  },
  {
    id: "equipment-justification",
    name: "justification",
    label: "Business Justification",
    type: FieldType.TEXTAREA,
    required: true,
    description: "Provide clear reasons why this equipment is needed"
  },
  {
    id: "equipment-timeline",
    name: "timeline",
    label: "Timeline",
    type: FieldType.TEXT,
    required: false,
    description: "When do you need this approved by?"
  }
];

const HIRING_FIELDS: ProposalField[] = [
  {
    id: "hiring-department",
    name: "department",
    label: "Department",
    type: FieldType.TEXT,
    required: true,
    description: "The department where the new position will be located"
  },
  {
    id: "hiring-justification",
    name: "justification",
    label: "Hiring Justification",
    type: FieldType.TEXTAREA,
    required: true,
    description: "Provide clear reasons why this position needs to be filled"
  },
  {
    id: "hiring-timeline",
    name: "timeline",
    label: "Timeline",
    type: FieldType.TEXT,
    required: false,
    description: "When do you need this position filled by?"
  }
];

// Default custom proposal types
const DEFAULT_CUSTOM_TYPES: CustomProposalType[] = [
  {
    id: "budget-type",
    name: "Budget Request",
    description: "Request for budget allocation",
    requiredFields: BUDGET_FIELDS,
    createdAt: Date.now(),
    createdBy: "system",
    updatedAt: Date.now()
  },
  {
    id: "equipment-type",
    name: "Equipment Request",
    description: "Request for new equipment",
    requiredFields: EQUIPMENT_FIELDS,
    createdAt: Date.now(),
    createdBy: "system",
    updatedAt: Date.now()
  },
  {
    id: "hiring-type",
    name: "Hiring Request",
    description: "Request to hire new personnel",
    requiredFields: HIRING_FIELDS,
    createdAt: Date.now(),
    createdBy: "system",
    updatedAt: Date.now()
  }
];

interface ProposalTypeContextType {
  customTypes: CustomProposalType[];
  getCustomTypeById: (id: string) => CustomProposalType | undefined;
  createCustomType: (data: Omit<CustomProposalType, "id" | "createdAt" | "updatedAt" | "createdBy">) => CustomProposalType;
  updateCustomType: (id: string, data: Partial<CustomProposalType>) => void;
  deleteCustomType: (id: string) => void;
  getDefaultFieldsForType: (type: ProposalType | string) => ProposalField[];
  getProposalTypeOptions: () => Array<{ label: string; value: string }>;
}

const ProposalTypeContext = createContext<ProposalTypeContextType | undefined>(undefined);

export const ProposalTypeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customTypes, setCustomTypes] = useState<CustomProposalType[]>([]);
  const { currentUser } = useAuth();

  // Load custom types from localStorage or use defaults
  useEffect(() => {
    const savedTypes = localStorage.getItem("customProposalTypes");
    if (savedTypes) {
      setCustomTypes(JSON.parse(savedTypes));
    } else {
      setCustomTypes(DEFAULT_CUSTOM_TYPES);
    }
  }, []);

  // Save custom types to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("customProposalTypes", JSON.stringify(customTypes));
  }, [customTypes]);

  const getCustomTypeById = (id: string) => {
    return customTypes.find(type => type.id === id);
  };

  const createCustomType = (data: Omit<CustomProposalType, "id" | "createdAt" | "updatedAt" | "createdBy">) => {
    if (!currentUser) throw new Error("You must be logged in to create a custom type");
    if (currentUser.role !== UserRole.ADMIN) throw new Error("Only admins can create custom types");

    const newType: CustomProposalType = {
      id: `type-${Date.now()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: currentUser.id,
      ...data
    };

    setCustomTypes(prev => [...prev, newType]);
    toast.success("Custom proposal type created successfully");
    return newType;
  };

  const updateCustomType = (id: string, data: Partial<CustomProposalType>) => {
    if (!currentUser) throw new Error("You must be logged in to update a custom type");
    if (currentUser.role !== UserRole.ADMIN) throw new Error("Only admins can update custom types");

    const typeExists = getCustomTypeById(id);
    if (!typeExists) throw new Error("Custom type not found");

    setCustomTypes(prev =>
      prev.map(type =>
        type.id === id
          ? {
              ...type,
              ...data,
              updatedAt: Date.now()
            }
          : type
      )
    );
    toast.success("Custom proposal type updated successfully");
  };

  const deleteCustomType = (id: string) => {
    if (!currentUser) throw new Error("You must be logged in to delete a custom type");
    if (currentUser.role !== UserRole.ADMIN) throw new Error("Only admins can delete custom types");

    setCustomTypes(prev => prev.filter(type => type.id !== id));
    toast.success("Custom proposal type deleted successfully");
  };

  const getDefaultFieldsForType = (type: ProposalType | string): ProposalField[] => {
    // First check if it's a custom type ID
    const customType = getCustomTypeById(type as string);
    if (customType) {
      return customType.requiredFields;
    }

    // If not, map to default fields based on built-in types
    switch (type) {
      case ProposalType.BUDGET:
        return BUDGET_FIELDS;
      case ProposalType.EQUIPMENT:
        return EQUIPMENT_FIELDS;
      case ProposalType.HIRING:
        return HIRING_FIELDS;
      default:
        return [];
    }
  };

  const getProposalTypeOptions = () => {
    // Combine built-in types with custom types
    const builtInOptions = [
      { label: "Budget Request", value: ProposalType.BUDGET },
      { label: "Equipment Request", value: ProposalType.EQUIPMENT },
      { label: "Hiring Request", value: ProposalType.HIRING },
      { label: "Other", value: ProposalType.OTHER }
    ];

    const customOptions = customTypes.map(type => ({
      label: type.name,
      value: type.id
    }));

    return [...builtInOptions, ...customOptions];
  };

  return (
    <ProposalTypeContext.Provider
      value={{
        customTypes,
        getCustomTypeById,
        createCustomType,
        updateCustomType,
        deleteCustomType,
        getDefaultFieldsForType,
        getProposalTypeOptions
      }}
    >
      {children}
    </ProposalTypeContext.Provider>
  );
};

export const useProposalTypes = () => {
  const context = useContext(ProposalTypeContext);
  if (context === undefined) {
    throw new Error("useProposalTypes must be used within a ProposalTypeProvider");
  }
  return context;
};
