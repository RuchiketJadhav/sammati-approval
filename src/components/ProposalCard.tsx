
import React from "react";
import { format } from "date-fns";
import { Proposal, ProposalStatus } from "@/utils/types";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  XCircle, 
  User, 
  Calendar,
  DollarSign,
  Timer
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ProposalCardProps {
  proposal: Proposal;
  className?: string;
}

const ProposalCard: React.FC<ProposalCardProps> = ({ proposal, className }) => {
  const getStatusBadge = (status: ProposalStatus) => {
    switch (status) {
      case ProposalStatus.DRAFT:
        return (
          <Badge variant="outline" className="bg-muted/50">
            <Clock className="mr-1 h-3 w-3" />
            Draft
          </Badge>
        );
      case ProposalStatus.PENDING_SUPERIOR:
        return (
          <Badge variant="outline" className="badge-pending">
            <Clock className="mr-1 h-3 w-3" />
            Pending Superior
          </Badge>
        );
      case ProposalStatus.PENDING_ADMIN:
        return (
          <Badge variant="outline" className="badge-warning">
            <Clock className="mr-1 h-3 w-3" />
            Pending Admin
          </Badge>
        );
      case ProposalStatus.APPROVED:
        return (
          <Badge variant="outline" className="badge-success">
            <CheckCircle className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        );
      case ProposalStatus.REJECTED:
        return (
          <Badge variant="outline" className="badge-destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="badge-pending">
            <Clock className="mr-1 h-3 w-3" />
            {status.replace("_", " ")}
          </Badge>
        );
    }
  };

  // Function to render proposal details based on the fields available
  const renderProposalDetails = () => {
    const details = [];
    
    if (proposal.budget) {
      details.push(
        <div key="budget" className="flex items-center text-sm mb-1">
          <DollarSign className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium mr-1">Budget:</span> {proposal.budget}
        </div>
      );
    }
    
    if (proposal.timeline) {
      details.push(
        <div key="timeline" className="flex items-center text-sm mb-1">
          <Timer className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium mr-1">Timeline:</span> {proposal.timeline}
        </div>
      );
    }
    
    if (proposal.department) {
      details.push(
        <div key="department" className="flex items-center text-sm mb-1">
          <span className="font-medium mr-1">Department:</span> {proposal.department}
        </div>
      );
    }
    
    if (proposal.justification) {
      details.push(
        <div key="justification" className="flex items-center text-sm mb-1">
          <span className="font-medium mr-1">Justification:</span> 
          <span className="truncate">{proposal.justification.length > 50 ? `${proposal.justification.substring(0, 50)}...` : proposal.justification}</span>
        </div>
      );
    }
    
    // Render any additional custom fields from fieldValues if they exist
    if (proposal.fieldValues) {
      Object.entries(proposal.fieldValues).forEach(([key, value]) => {
        // Skip fields we've already displayed
        if (!['budget', 'timeline', 'department', 'justification'].includes(key) && value) {
          details.push(
            <div key={key} className="flex items-center text-sm mb-1">
              <span className="font-medium mr-1">{key.charAt(0).toUpperCase() + key.slice(1)}:</span> 
              {typeof value === 'string' ? 
                (value.length > 50 ? `${value.substring(0, 50)}...` : value) : 
                String(value)}
            </div>
          );
        }
      });
    }
    
    return details.length > 0 ? (
      <div className="border-t border-border/50 pt-3 mb-3">
        {details}
      </div>
    ) : null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className={className}
    >
      <Link to={`/proposal/${proposal.id}`}>
        <Card className="overflow-hidden h-full transition-all hover:shadow-md border border-border/50">
          <CardHeader className="p-4 pb-0">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-medium line-clamp-1">{proposal.title}</h3>
              {getStatusBadge(proposal.status)}
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
              {proposal.description}
            </p>
            
            {renderProposalDetails()}
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <User className="mr-1 h-3.5 w-3.5" />
                <span>Created by {proposal.createdByName}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-1 h-3.5 w-3.5" />
                <span>{format(proposal.createdAt, "MMM d, yyyy")}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={`https://i.pravatar.cc/150?img=${proposal.assignedTo.slice(-1)}`} />
                <AvatarFallback>
                  {proposal.assignedToName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">Assigned to {proposal.assignedToName}</span>
            </div>
            <span className="text-primary">
              <ArrowRight className="h-4 w-4" />
            </span>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
};

export default ProposalCard;
