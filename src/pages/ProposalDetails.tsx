
const renderProposalTypeDetails = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
      {proposal.budget && (
        <div className="bg-muted/30 p-3 rounded-md">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">Budget</h3>
          </div>
          <p>{proposal.budget}</p>
        </div>
      )}
      {proposal.timeline && (
        <div className="bg-muted/30 p-3 rounded-md">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">Timeline</h3>
          </div>
          <p>{proposal.timeline}</p>
        </div>
      )}
      {proposal.justification && (
        <div className="bg-muted/30 p-3 rounded-md">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">Business Justification</h3>
          </div>
          <p>{proposal.justification}</p>
        </div>
      )}
      {proposal.department && (
        <div className="bg-muted/30 p-3 rounded-md">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">Department</h3>
          </div>
          <p>{proposal.department}</p>
        </div>
      )}
      {proposal.fieldValues && Object.keys(proposal.fieldValues).length > 0 && (
        Object.entries(proposal.fieldValues).map(([key, value]) => (
          <div key={key} className="bg-muted/30 p-3 rounded-md">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground capitalize">
                {key.replace(/_/g, ' ')}
              </h3>
            </div>
            <p>{value?.toString()}</p>
          </div>
        ))
      )}
    </div>
  );
};
