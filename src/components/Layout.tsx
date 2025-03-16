
import React from "react";
import Navbar from "./Navbar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <motion.main 
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn("flex-1 container px-4 py-6 md:px-6 md:py-8 max-w-6xl mx-auto", className)}
      >
        {children}
      </motion.main>
    </div>
  );
};

export default Layout;
