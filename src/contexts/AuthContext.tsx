
import React, { createContext, useState, useContext, ReactNode } from "react";
import { useToast } from "@/components/ui/use-toast";

// Define user roles
export type UserRole = "resident" | "official" | "admin";

// Define user type
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  area?: string;
}

// Define auth context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole, area?: string) => Promise<void>;
  logout: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo (in a real app, this would come from backend)
const MOCK_USERS: User[] = [
  { id: "1", name: "John Resident", email: "resident@example.com", role: "resident", area: "Independence Layout" },
  { id: "2", name: "Mary Official", email: "official@example.com", role: "official" },
  { id: "3", name: "Admin User", email: "admin@example.com", role: "admin" },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  
  // Check if there's a stored user in localStorage on initial load
  React.useEffect(() => {
    const storedUser = localStorage.getItem("waste-watch-user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // In a real app, you'd make an API call here
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const foundUser = MOCK_USERS.find(u => u.email === email);
        
        if (foundUser && password === "password") { // Simple check for demo
          setUser(foundUser);
          localStorage.setItem("waste-watch-user", JSON.stringify(foundUser));
          toast({
            title: "Login successful",
            description: `Welcome back, ${foundUser.name}!`,
          });
          resolve();
        } else {
          toast({
            title: "Login failed",
            description: "Invalid email or password",
            variant: "destructive",
          });
          reject(new Error("Invalid credentials"));
        }
      }, 1000); // Simulate network delay
    });
  };

  const signup = async (name: string, email: string, password: string, role: UserRole, area?: string) => {
    // In a real app, you'd make an API call here
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const existingUser = MOCK_USERS.find(u => u.email === email);
        
        if (existingUser) {
          toast({
            title: "Signup failed",
            description: "Email already in use",
            variant: "destructive",
          });
          reject(new Error("Email already in use"));
          return;
        }
        
        // Create new user
        const newUser: User = {
          id: `${MOCK_USERS.length + 1}`,
          name,
          email,
          role,
          area,
        };
        
        // In a real app, we'd save this to a database
        MOCK_USERS.push(newUser);
        
        // Auto-login after signup
        setUser(newUser);
        localStorage.setItem("waste-watch-user", JSON.stringify(newUser));
        
        toast({
          title: "Signup successful",
          description: `Welcome to Enugu Waste Watch, ${name}!`,
        });
        resolve();
      }, 1000); // Simulate network delay
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("waste-watch-user");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
