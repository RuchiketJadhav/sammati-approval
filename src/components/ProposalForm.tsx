import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useProposals } from "@/contexts/ProposalContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole, ProposalFormData, ProposalType, ProposalStatus } from "@/utils/types";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters"),
  assignedTo: z.string().min(1, "Please select a user to assign to"),
  type: z.enum(["BUDGET", "EQUIPMENT", "HIRING", "OTHER"]),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  justification: z.string().optional(),
  department: z.string().optional(),
});

type ProposalFormValues = z.infer<typeof formSchema>;

const ProposalForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { createProposal, getProposalById, updateProposal } = useProposals();
  const { users, currentUser } = useAuth();
  const navigate = useNavigate();
  const [proposalType, setProposalType] = useState<ProposalType>(ProposalType.OTHER);
  
  const otherUsers = users.filter(user => user.id !== currentUser?.id);
  const isEditMode = Boolean(id);
  const currentProposal = id ? getProposalById(id) : null;
  
  const canEdit = currentProposal ? 
    currentUser?.id === currentProposal.createdBy && 
    (currentProposal.status === ProposalStatus.DRAFT || 
     currentProposal.status === ProposalStatus.REJECTED) : true;

  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: currentProposal ? {
      title: currentProposal.title,
      description: currentProposal.description,
      assignedTo: currentProposal.assignedTo,
      type: currentProposal.type || ProposalType.OTHER,
      budget: currentProposal.budget,
      timeline: currentProposal.timeline,
      justification: currentProposal.justification,
      department: currentProposal.department,
    } : {
      title: "",
      description: "",
      assignedTo: "",
      type: ProposalType.OTHER,
      budget: "",
      timeline: "",
      justification: "",
      department: "",
    }
  });

  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'type') {
        setProposalType(value.type as ProposalType);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

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
                      <SelectItem value={ProposalType.BUDGET}>Budget Request</SelectItem>
                      <SelectItem value={ProposalType.EQUIPMENT}>Equipment Request</SelectItem>
                      <SelectItem value={ProposalType.HIRING}>Hiring Request</SelectItem>
                      <SelectItem value={ProposalType.OTHER}>Other</SelectItem>
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
            
            {proposalType === ProposalType.BUDGET && (
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Amount</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter the requested budget amount" {...field} />
                    </FormControl>
                    <FormDescription>
                      Specify the exact budget amount needed
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {proposalType === ProposalType.EQUIPMENT && (
              <>
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Cost</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the estimated cost" {...field} />
                      </FormControl>
                      <FormDescription>
                        The approximate cost of the requested equipment
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="justification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Justification</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Explain why this equipment is necessary" 
                          className="min-h-20"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Provide clear reasons why this equipment is needed
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            {proposalType === ProposalType.HIRING && (
              <>
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the department for the new hire" {...field} />
                      </FormControl>
                      <FormDescription>
                        The department where the new position will be located
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="justification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hiring Justification</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Explain why this position is necessary" 
                          className="min-h-20"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Provide clear reasons why this position needs to be filled
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            {(proposalType === ProposalType.BUDGET || proposalType === ProposalType.EQUIPMENT || proposalType === ProposalType.HIRING) && (
              <FormField
                control={form.control}
                name="timeline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timeline</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter the expected timeline" {...field} />
                    </FormControl>
                    <FormDescription>
                      When do you need this approved by?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
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
