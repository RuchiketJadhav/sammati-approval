
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useProposals } from "@/contexts/ProposalContext";
import { useProposalTypes } from "@/contexts/ProposalTypeContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole, ProposalFormData, ProposalType, ProposalStatus, FieldType } from "@/utils/types";
import { Checkbox } from "@/components/ui/checkbox";

// Updated schema to accept both ProposalType enum values and custom type IDs
const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters"),
  assignedTo: z.string().min(1, "Please select a user to assign to"),
  // Accept any string for type to support both enum values and custom type IDs
  type: z.string().min(1, "Please select a proposal type"),
  customTypeId: z.string().optional(),
  // Dynamic fields will be handled separately
  fieldValues: z.record(z.any()).optional(),
  // Legacy fields
  budget: z.string().optional(),
  timeline: z.string().optional(),
  justification: z.string().optional(),
  department: z.string().optional(),
});

type ProposalFormValues = z.infer<typeof formSchema>;

interface ProposalFormProps {
  proposalId?: string;
}

const ProposalForm: React.FC<ProposalFormProps> = ({ proposalId }) => {
  const { createProposal, getProposalById, updateProposal } = useProposals();
  const { users, currentUser } = useAuth();
  const { getProposalTypeOptions, getCustomTypeById, getDefaultFieldsForType } = useProposalTypes();
  const navigate = useNavigate();
  
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedTypeFields, setSelectedTypeFields] = useState<any[]>([]);
  
  const otherUsers = users.filter(user => user.id !== currentUser?.id);
  const isEditMode = Boolean(proposalId);
  const currentProposal = proposalId ? getProposalById(proposalId) : null;
  
  const canEdit = currentProposal ? 
    currentUser?.id === currentProposal.createdBy && 
    (currentProposal.status === ProposalStatus.DRAFT || 
     currentProposal.status === ProposalStatus.REJECTED) : true;

  const proposalTypeOptions = getProposalTypeOptions();

  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: currentProposal ? {
      title: currentProposal.title,
      description: currentProposal.description,
      assignedTo: currentProposal.assignedTo,
      type: currentProposal.type.toString(),
      customTypeId: currentProposal.customTypeId,
      fieldValues: currentProposal.fieldValues || {},
      budget: currentProposal.budget,
      timeline: currentProposal.timeline,
      justification: currentProposal.justification,
      department: currentProposal.department,
    } : {
      title: "",
      description: "",
      assignedTo: "",
      type: ProposalType.OTHER,
      customTypeId: "",
      fieldValues: {},
      budget: "",
      timeline: "",
      justification: "",
      department: "",
    }
  });

  // Update fields when type changes
  useEffect(() => {
    const type = form.watch("type");
    if (type) {
      setSelectedType(type);
      const fields = getDefaultFieldsForType(type);
      setSelectedTypeFields(fields);
    }
  }, [form.watch("type"), getDefaultFieldsForType]);

  const onSubmit = (values: ProposalFormValues) => {
    try {
      if (isEditMode && currentProposal) {
        updateProposal(currentProposal.id, values as ProposalFormData);
        navigate(`/proposal/${currentProposal.id}`);
      } else {
        const newProposal = createProposal(values as ProposalFormData);
        navigate(`/proposal/${newProposal.id}`);
      }
    } catch (error) {
      console.error("Error with proposal:", error);
      form.setError("root", { 
        message: error instanceof Error ? error.message : "Failed to process proposal"
      });
    }
  };

  if (!currentUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? "Edit Proposal" : "Create New Proposal"}</CardTitle>
          <CardDescription>You must be logged in to {isEditMode ? "edit" : "create"} a proposal</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!canEdit) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cannot Edit Proposal</CardTitle>
          <CardDescription>
            This proposal cannot be edited because it is currently under review
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Render dynamic fields based on selected type
  const renderDynamicFields = () => {
    if (!selectedTypeFields.length) return null;

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Type-specific Fields</h3>
        {selectedTypeFields.map((field) => (
          <FormField
            key={field.id}
            control={form.control}
            name={`fieldValues.${field.name}`}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  {renderFieldInput(field, formField)}
                </FormControl>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </div>
    );
  };

  // Render the appropriate input component based on field type
  const renderFieldInput = (field, formField) => {
    switch (field.type) {
      case FieldType.TEXT:
        return <Input {...formField} />;
      case FieldType.TEXTAREA:
        return <Textarea className="min-h-20" {...formField} />;
      case FieldType.NUMBER:
        return <Input type="number" {...formField} />;
      case FieldType.DATE:
        return <Input type="date" {...formField} />;
      case FieldType.CHECKBOX:
        return (
          <Checkbox
            checked={formField.value}
            onCheckedChange={formField.onChange}
          />
        );
      case FieldType.SELECT:
        return (
          <Select
            onValueChange={formField.onChange}
            defaultValue={formField.value}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return <Input {...formField} />;
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">{isEditMode ? "Edit Proposal" : "Create New Proposal"}</CardTitle>
        <CardDescription>
          Fill out the form below to {isEditMode ? "update your" : "submit a new"} proposal for approval
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proposal Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a proposal type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {proposalTypeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the type of proposal you are submitting
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proposal Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a clear title for your proposal" {...field} />
                  </FormControl>
                  <FormDescription>
                    A concise title that summarizes your proposal
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your proposal in detail" 
                      className="min-h-32"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Provide all necessary details for your proposal
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Render dynamic fields based on selected type */}
            {renderDynamicFields()}
            
            <FormField
              control={form.control}
              name="assignedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign To User</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user to assign" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {otherUsers.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the user who will review this proposal
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.formState.errors.root && (
              <p className="text-destructive text-sm">{form.formState.errors.root.message}</p>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => navigate("/")}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {isEditMode ? "Update" : "Submit"} Proposal
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default ProposalForm;
