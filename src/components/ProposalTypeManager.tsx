
import React, { useState } from "react";
import { useProposalTypes } from "@/contexts/ProposalTypeContext";
import { CustomProposalType, ProposalField, FieldType } from "@/utils/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Edit, Save, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const typeSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(50),
  description: z.string().optional(),
});

const fieldSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(30).regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores are allowed"),
  label: z.string().min(2, "Label must be at least 2 characters").max(50),
  type: z.enum(["TEXT", "TEXTAREA", "NUMBER", "DATE", "SELECT", "CHECKBOX"]),
  required: z.boolean().default(false),
  description: z.string().optional(),
  options: z.string().optional(),
});

type TypeFormData = z.infer<typeof typeSchema>;
type FieldFormData = z.infer<typeof fieldSchema>;

const ProposalTypeManager: React.FC = () => {
  const { customTypes, createCustomType, updateCustomType, deleteCustomType } = useProposalTypes();
  const [selectedType, setSelectedType] = useState<CustomProposalType | null>(null);
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [editingField, setEditingField] = useState<ProposalField | null>(null);
  const [fields, setFields] = useState<ProposalField[]>([]);

  const typeForm = useForm<TypeFormData>({
    resolver: zodResolver(typeSchema),
    defaultValues: {
      name: "",
      description: "",
    }
  });

  const fieldForm = useForm<FieldFormData>({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      name: "",
      label: "",
      type: "TEXT",
      required: false,
      description: "",
      options: ""
    }
  });

  const handleSelectType = (type: CustomProposalType) => {
    setSelectedType(type);
    setFields(type.requiredFields);
    typeForm.reset({
      name: type.name,
      description: type.description || "",
    });
  };

  const handleCreateType = (data: TypeFormData) => {
    try {
      createCustomType({
        name: data.name,
        description: data.description,
        requiredFields: fields,
      });
      setShowTypeForm(false);
      typeForm.reset();
      setFields([]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create type");
    }
  };

  const handleUpdateType = () => {
    if (!selectedType) return;
    
    try {
      const data = typeForm.getValues();
      updateCustomType(selectedType.id, {
        name: data.name,
        description: data.description,
        requiredFields: fields,
      });
      setSelectedType(null);
      typeForm.reset();
      setFields([]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update type");
    }
  };

  const handleDeleteType = () => {
    if (!selectedType) return;
    
    try {
      deleteCustomType(selectedType.id);
      setSelectedType(null);
      typeForm.reset();
      setFields([]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete type");
    }
  };

  const handleAddField = (data: FieldFormData) => {
    const newField: ProposalField = {
      id: `field-${Date.now()}`,
      name: data.name,
      label: data.label,
      type: data.type as FieldType,
      required: data.required,
      description: data.description,
    };

    if (data.type === "SELECT" && data.options) {
      newField.options = data.options.split(",").map(opt => opt.trim());
    }

    if (editingField) {
      // Update existing field
      setFields(fields.map(f => f.id === editingField.id ? newField : f));
    } else {
      // Add new field
      setFields([...fields, newField]);
    }

    setShowFieldForm(false);
    setEditingField(null);
    fieldForm.reset();
  };

  const handleEditField = (field: ProposalField) => {
    setEditingField(field);
    fieldForm.reset({
      name: field.name,
      label: field.label,
      type: field.type,
      required: field.required,
      description: field.description || "",
      options: field.options ? field.options.join(", ") : "",
    });
    setShowFieldForm(true);
  };

  const handleDeleteField = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId));
  };

  const addNewType = () => {
    setSelectedType(null);
    setFields([]);
    typeForm.reset({
      name: "",
      description: "",
    });
    setShowTypeForm(true);
  };

  const addNewField = () => {
    setEditingField(null);
    fieldForm.reset({
      name: "",
      label: "",
      type: "TEXT",
      required: false,
      description: "",
      options: ""
    });
    setShowFieldForm(true);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Type List */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Proposal Types</CardTitle>
          <CardDescription>Manage custom proposal types</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {customTypes.map(type => (
                <Button
                  key={type.id}
                  variant={selectedType?.id === type.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleSelectType(type)}
                >
                  <div className="truncate">{type.name}</div>
                  <Badge className="ml-auto">{type.requiredFields.length} fields</Badge>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={addNewType}>
            <Plus className="mr-2 h-4 w-4" /> New Type
          </Button>
        </CardFooter>
      </Card>

      {/* Type Details */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>
            {selectedType ? `Edit: ${selectedType.name}` : "Create New Type"}
          </CardTitle>
          <CardDescription>
            {selectedType ? "Modify this proposal type" : "Define a new proposal type"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(showTypeForm || selectedType) && (
            <Form {...typeForm}>
              <form className="space-y-4">
                <FormField
                  control={typeForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter type name" {...field} />
                      </FormControl>
                      <FormDescription>
                        A clear name for this proposal type
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={typeForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe this proposal type" 
                          className="min-h-20"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Optional description of this proposal type
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          )}
          
          {(showTypeForm || selectedType) && (
            <>
              <div className="mt-6 mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium">Required Fields</h3>
                <Button variant="outline" onClick={addNewField}>
                  <Plus className="mr-2 h-4 w-4" /> Add Field
                </Button>
              </div>
              
              <ScrollArea className="h-[300px] border rounded-md p-4">
                {fields.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No fields defined. Add some fields to this proposal type.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {fields.map(field => (
                      <div key={field.id} className="flex items-center justify-between border p-3 rounded-md">
                        <div>
                          <div className="font-medium">{field.label}</div>
                          <div className="text-sm text-muted-foreground">
                            {field.name} ({field.type})
                            {field.required && <Badge variant="outline" className="ml-2">Required</Badge>}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditField(field)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteField(field.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </>
          )}
        </CardContent>
        
        {(showTypeForm || selectedType) && (
          <CardFooter className="flex justify-between">
            {selectedType ? (
              <>
                <Button variant="destructive" onClick={handleDeleteType}>Delete Type</Button>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => {
                    setSelectedType(null);
                    typeForm.reset();
                    setFields([]);
                  }}>Cancel</Button>
                  <Button onClick={handleUpdateType}>Save Changes</Button>
                </div>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => {
                  setShowTypeForm(false);
                  typeForm.reset();
                  setFields([]);
                }}>Cancel</Button>
                <Button onClick={typeForm.handleSubmit(handleCreateType)}>Create Type</Button>
              </>
            )}
          </CardFooter>
        )}
      </Card>

      {/* Field Form Dialog */}
      <Dialog open={showFieldForm} onOpenChange={setShowFieldForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingField ? "Edit Field" : "Add Field"}</DialogTitle>
            <DialogDescription>
              Define a field to collect information in this proposal type
            </DialogDescription>
          </DialogHeader>
          
          <Form {...fieldForm}>
            <form className="space-y-4" onSubmit={fieldForm.handleSubmit(handleAddField)}>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={fieldForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. budget_amount" {...field} />
                      </FormControl>
                      <FormDescription>
                        Used in code (no spaces)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={fieldForm.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Label</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Budget Amount" {...field} />
                      </FormControl>
                      <FormDescription>
                        Shown to users
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={fieldForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a field type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="TEXT">Text</SelectItem>
                          <SelectItem value="TEXTAREA">Text Area</SelectItem>
                          <SelectItem value="NUMBER">Number</SelectItem>
                          <SelectItem value="DATE">Date</SelectItem>
                          <SelectItem value="SELECT">Select (Dropdown)</SelectItem>
                          <SelectItem value="CHECKBOX">Checkbox</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The type of field to display
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={fieldForm.control}
                  name="required"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Required Field</FormLabel>
                        <FormDescription>
                          Must be filled by users
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              {fieldForm.watch("type") === "SELECT" && (
                <FormField
                  control={fieldForm.control}
                  name="options"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Options</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter options separated by commas" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Comma-separated list of options
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={fieldForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Field Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe what this field is for" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Helps users understand what to enter
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setShowFieldForm(false);
                  setEditingField(null);
                }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingField ? "Save Changes" : "Add Field"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProposalTypeManager;
