import React from "react";
import { useNavigate } from "react-router-dom";
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
import { UserRole, ProposalFormData } from "@/utils/types";

// Form schema with validation
const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters"),
  assignedTo: z.string().min(1, "Please select a superior")
});

// Make sure this type matches the ProposalFormData interface in types.ts
type ProposalFormValues = z.infer<typeof formSchema>;

const ProposalForm: React.FC = () => {
  const { createProposal } = useProposals();
  const { getSuperiors, currentUser } = useAuth();
  const navigate = useNavigate();
  
  const superiors = getSuperiors();

  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      assignedTo: ""
    }
  });

  const onSubmit = (values: ProposalFormValues) => {
    try {
      // Since our schema validation ensures all fields are present and valid,
      // we can safely assert that values matches ProposalFormData
      const newProposal = createProposal(values as ProposalFormData);
      navigate(`/proposal/${newProposal.id}`);
    } catch (error) {
      console.error("Error creating proposal:", error);
      form.setError("root", { 
        message: error instanceof Error ? error.message : "Failed to create proposal"
      });
    }
  };

  if (!currentUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create New Proposal</CardTitle>
          <CardDescription>You must be logged in to create a proposal</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (currentUser.role !== UserRole.USER) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create New Proposal</CardTitle>
          <CardDescription>Only users can create proposals</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Create New Proposal</CardTitle>
        <CardDescription>
          Fill out the form below to submit a new proposal for approval
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
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
            
            <FormField
              control={form.control}
              name="assignedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign To Superior</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a superior" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {superiors.map(superior => (
                        <SelectItem key={superior.id} value={superior.id}>
                          {superior.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the superior who will review this proposal
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
              Submit Proposal
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default ProposalForm;
