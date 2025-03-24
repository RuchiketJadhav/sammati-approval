
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserRole } from "@/utils/types";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  PlusCircle,
  User,
  LogOut,
  FileText,
  Settings
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-xl font-bold flex items-center">
            <FileText className="mr-2 h-6 w-6" />
            <span>Sammati</span>
          </Link>

          <div className="hidden md:flex space-x-1">
            <Button asChild variant="ghost" size="sm">
              <Link to="/" className="flex items-center">
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/create-proposal" className="flex items-center">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Proposal
              </Link>
            </Button>
            {currentUser?.role === UserRole.ADMIN && (
              <Button asChild variant="ghost" size="sm">
                <Link to="/manage-types" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Manage Types
                </Link>
              </Button>
            )}
          </div>
        </div>

        {currentUser ? (
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage
                      src={currentUser.avatar}
                      alt={currentUser.name}
                    />
                    <AvatarFallback>
                      {getInitials(currentUser.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div>{currentUser.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {currentUser.email}
                  </div>
                  <div className="text-xs font-normal text-muted-foreground mt-1">
                    Role: {currentUser.role}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/create-proposal")}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  <span>New Proposal</span>
                </DropdownMenuItem>
                {currentUser.role === UserRole.ADMIN && (
                  <DropdownMenuItem onClick={() => navigate("/manage-types")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Manage Types</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Button onClick={() => navigate("/login")}>Login</Button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
