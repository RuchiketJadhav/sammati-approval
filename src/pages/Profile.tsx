
import React from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useProposals } from "@/contexts/ProposalContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ProposalStatus, UserRole } from "@/utils/types";
import { motion } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserRound, LogOut, UserPlus } from "lucide-react";

const Profile: React.FC = () => {
  const { currentUser, logout, users, login } = useAuth();
  const { getUserProposals, getAssignedProposals } = useProposals();
  
  if (!currentUser) {
    return (
      <Layout>
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Please log in to view your profile
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="w-full">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Log in (Demo)
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Demo Users</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {users.map((user) => (
                  <DropdownMenuItem
                    key={user.id}
                    onClick={() => login(user.id)}
                  >
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>
                      {user.name} ({user.role})
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </CardFooter>
        </Card>
      </Layout>
    );
  }

  const myProposals = getUserProposals(currentUser.id);
  const assignedProposals = getAssignedProposals(currentUser.id);

  const pendingProposals = myProposals.filter(
    p => p.status === ProposalStatus.PENDING_SUPERIOR || 
         p.status === ProposalStatus.PENDING_ADMIN
  ).length;
  
  const approvedProposals = myProposals.filter(
    p => p.status === ProposalStatus.APPROVED
  ).length;
  
  const rejectedProposals = myProposals.filter(
    p => p.status === ProposalStatus.REJECTED
  ).length;
  
  const pendingReviews = assignedProposals.filter(
    p => (currentUser.role === UserRole.SUPERIOR && p.status === ProposalStatus.PENDING_SUPERIOR) ||
         (currentUser.role === UserRole.ADMIN && p.status === ProposalStatus.PENDING_ADMIN)
  ).length;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="mb-8">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <Avatar className="h-16 w-16">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback className="text-lg">
                  {currentUser.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{currentUser.name}</CardTitle>
                <CardDescription>{currentUser.email}</CardDescription>
                <div className="flex items-center mt-1 p-1 px-2 bg-secondary rounded-full w-fit">
                  <UserRound className="mr-1 h-3 w-3" />
                  <span className="text-xs font-medium">
                    {currentUser.role}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardFooter className="pt-2">
              <Button variant="outline" className="ml-auto" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Proposals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{myProposals.length}</p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Pending Proposals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{pendingProposals}</p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  {currentUser.role !== UserRole.USER ? "Pending Reviews" : "Approved Proposals"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">
                  {currentUser.role !== UserRole.USER ? pendingReviews : approvedProposals}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {currentUser.role !== UserRole.USER && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Role-specific Functionality</CardTitle>
                <CardDescription>
                  {currentUser.role === UserRole.SUPERIOR
                    ? "As a Superior, you can review proposals assigned to you and approve or reject them."
                    : "As an Admin, you have the final approval authority for proposals that have been approved by superiors."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  {currentUser.role === UserRole.SUPERIOR ? (
                    <>
                      <li>Review proposals assigned to you</li>
                      <li>Approve proposals to forward them to Admin</li>
                      <li>Reject proposals with feedback</li>
                      <li>Add comments to proposals</li>
                    </>
                  ) : (
                    <>
                      <li>Final review of pre-approved proposals</li>
                      <li>Grant final approval for proposals</li>
                      <li>Reject any proposal with feedback</li>
                      <li>View all proposals in the system</li>
                      <li>Add comments to any proposal</li>
                    </>
                  )}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
