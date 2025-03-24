
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "../utils/types";

// Updated users from the image data
const DEMO_USERS: User[] = [
  {
    id: "user1",
    name: "Registrar",
    email: "registrar@chanakyauniversity.edu.in",
    role: UserRole.REGISTRAR,
    avatar: "https://i.pravatar.cc/150?img=1"
  },
  {
    id: "user2",
    name: "Registrar Office",
    email: "registraroffice@chanakyauniversity.edu.in",
    role: UserRole.ADMIN,
    avatar: "https://i.pravatar.cc/150?img=2"
  },
  {
    id: "user3",
    name: "Ruchiket",
    email: "ruchiket@chanakyauniversity.edu.in",
    role: UserRole.USER,
    avatar: "https://i.pravatar.cc/150?img=3"
  },
  {
    id: "user4",
    name: "Shiva",
    email: "shiva@chanakyauniversity.edu.in",
    role: UserRole.USER,
    avatar: "https://i.pravatar.cc/150?img=4"
  },
  {
    id: "user5",
    name: "Nandani",
    email: "nandani@chanakyauniversity.edu.in",
    role: UserRole.USER,
    avatar: "https://i.pravatar.cc/150?img=5"
  },
  {
    id: "user6",
    name: "Samanvitha",
    email: "samanvitha@chanakyauniversity.edu.in",
    role: UserRole.USER,
    avatar: "https://i.pravatar.cc/150?img=6"
  },
  {
    id: "user7",
    name: "Finance Office",
    email: "financeoffice@chanakyauniversity.edu.in",
    role: UserRole.APPROVER,
    avatar: "https://i.pravatar.cc/150?img=7"
  },
  {
    id: "user8",
    name: "Admin Office",
    email: "adminoffice@chanakyauniversity.edu.in",
    role: UserRole.APPROVER,
    avatar: "https://i.pravatar.cc/150?img=8"
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

  // Modified to check for a logged-in user, but not auto-login
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
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
