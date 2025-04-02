
import React, { useState } from "react";
import { format } from "date-fns";
import { Comment as CommentType } from "@/utils/types";
import { useProposals } from "@/contexts/ProposalContext";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CommentSectionProps {
  proposalId: string;
  comments: CommentType[];
}

const CommentSection: React.FC<CommentSectionProps> = ({ proposalId, comments }) => {
  const [comment, setComment] = useState("");
  const { addComment } = useProposals();
  const { currentUser } = useAuth();

  // Filter out comments made by approvers - we'll show these in the approval steps section instead
  const regularComments = comments.filter(comment => 
    !comment.text.startsWith("Rejected:") && 
    !comment.text.startsWith("Revision requested:") &&
    !comment.text.startsWith("Revision requested by Registrar:")
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      addComment(proposalId, comment);
      setComment("");
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Comments</h3>
      
      <div className="space-y-4">
        {regularComments.length > 0 ? (
          <ScrollArea className="h-[400px] pr-4">
            <AnimatePresence>
              {regularComments
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex space-x-3 p-3 rounded-lg bg-muted/30 mb-3"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.userAvatar} alt={comment.userName} />
                      <AvatarFallback>
                        {comment.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between mb-1">
                        <h4 className="text-sm font-medium">{comment.userName}</h4>
                        <span className="text-xs text-muted-foreground">
                          {format(comment.timestamp, "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                      <p className="text-sm">{comment.text}</p>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </ScrollArea>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No comments yet
          </p>
        )}
      </div>

      {currentUser && (
        <form onSubmit={handleSubmit} className="pt-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 flex gap-3">
              <Avatar className="h-9 w-9 hidden md:block">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback>
                  {currentUser.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 resize-none min-h-[80px]"
              />
            </div>
            <Button 
              type="submit" 
              disabled={!comment.trim()}
              className="ml-auto"
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CommentSection;
