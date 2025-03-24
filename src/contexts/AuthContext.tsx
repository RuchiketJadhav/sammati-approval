
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "../utils/types";

// Sample users for demonstration
const DEMO_USERS: User[] = [
  {
    id: "user1",
    name: "John Doe",
    email: "john@example.com",
    role: UserRole.USER,
    avatar: "https://i.pravatar.cc/150?img=1"
  },
  {
    id: "user2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: UserRole.SUPERIOR,
    avatar: "https://i.pravatar.cc/150?img=2"
  },
  {
    id: "user3",
    name: "Alex Johnson",
    email: "alex@example.com",
    role: UserRole.ADMIN,
    avatar: "https://i.pravatar.cc/150?img=3"
  },
  {
    id: "user4",
    name: "Sarah Williams",
    email: "sarah@example.com",
    role: UserRole.SUPERIOR,
    avatar: "https://i.pravatar.cc/150?img=4"
  },
  {
    id: "user5",
    name: "Michael Brown",
    email: "michael@example.com",
    role: UserRole.APPROVER,
    avatar: "https://i.pravatar.cc/150?img=5"
  },
  {
    id: "user6",
    name: "Emily Davis",
    email: "emily@example.com",
    role: UserRole.APPROVER,
    avatar: "https://i.pravatar.cc/150?img=6"
  },
  {
    id: "user7",
    name: "Robert Miller",
    email: "robert@example.com",
    role: UserRole.REGISTRAR,
    avatar: "https://i.pravatar.cc/150?img=7"
  }
];

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (userId: string) => void;
  logout: () => void;
  getSuperiors: () => User[];
  getAdmins: () => User[];
  getApprovers: () => User[];
  getRegistrars: () => User[];
  getUserById: (id: string) => User | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users] = useState<User[]>(DEMO_USERS);

  // Auto-login the first user for demo purposes
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    } else {
      login("user1");
    }
  }, []);

  const login = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem("currentUser", JSON.stringify(user));
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  const getSuperiors = () => {
    return users.filter(user => user.role === UserRole.SUPERIOR);
  };

  const getAdmins = () => {
    return users.filter(user => user.role === UserRole.ADMIN);
  };
  
  const getApprovers = () => {
    return users.filter(user => user.role === UserRole.APPROVER);
  };
  
  const getRegistrars = () => {
    return users.filter(user => user.role === UserRole.REGISTRAR);
  };

  const getUserById = (id: string) => {
    return users.find(user => user.id === id);
  };

  return (
    <AuthContext.Provider 
      value={{
        currentUser,
        users,
        login,
        logout,
        getSuperiors,
        getAdmins,
        getApprovers,
        getRegistrars,
        getUserById
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
