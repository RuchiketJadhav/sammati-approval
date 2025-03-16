
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { CheckSquare, Menu, X, User, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

const Navbar: React.FC = () => {
  const { currentUser, logout, users, login } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/" },
    { name: "New Proposal", path: "/create-proposal" },
    { name: "Profile", path: "/profile" },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/70 backdrop-blur-md">
      <div className="container flex h-16 items-center px-4">
        <div className="flex items-center space-x-2">
          <CheckSquare className="h-6 w-6" />
          <span className="text-lg font-medium">ApprovalFlow</span>
        </div>

        {/* Desktop navigation */}
        <nav className="mx-6 hidden md:flex items-center space-x-4 lg:space-x-6 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary/90",
                location.pathname === item.path
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Mobile menu button */}
        <div className="flex-1 flex justify-end md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 p-0"
            onClick={toggleMobileMenu}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* User menu */}
        <div className="ml-auto flex items-center space-x-4">
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={currentUser.avatar}
                      alt={currentUser.name}
                    />
                    <AvatarFallback>
                      {currentUser.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{currentUser.name}</DropdownMenuLabel>
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  {currentUser.role}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Log in</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
          )}
        </div>
      </div>

      {/* Mobile navigation menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-background border-b"
          >
            <div className="px-4 py-5 flex flex-col space-y-4">
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMobileMenu}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "text-base font-medium py-2 transition-colors",
                    location.pathname === item.path
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
