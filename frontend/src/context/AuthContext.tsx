
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { saveLoginRecord } from "@/services/localStorageService";

interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role: "admin" | "user") => Promise<boolean>;
  logout: () => void;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Key for storing user data in localStorage
const USER_STORAGE_KEY = "news_hub_user";
const USERS_DB_KEY = "news_hub_users_db";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize or get users database from localStorage
  const getUsersDb = (): Record<string, { id: string, name: string, password: string, role: "admin" | "user" }> => {
    const usersDb = localStorage.getItem(USERS_DB_KEY);
    return usersDb ? JSON.parse(usersDb) : {};
  };

  const saveUsersDb = (db: Record<string, any>) => {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
  };

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user:", e);
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // Check if current user is admin
  const isAdmin = () => {
    return user?.role === "admin";
  };

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        toast({
          title: "Login failed",
          description: errorData?.message || "Invalid email or password",
          variant: "destructive",
        });
        return false;
      }

      const data = await response.json();
      
      // Assuming the API returns user data with id, email, name, role, and possibly a token
      const loggedInUser = {
        id: data.user?.id || data.id || `user_${Date.now()}`,
        email: data.user?.email || data.email || email,
        name: data.user?.name || data.name || email.split('@')[0],
        role: (data.user?.role || data.role || "user") as "admin" | "user"
      };
      
      setUser(loggedInUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
      
      // Store token if provided
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }
      
      // Save login record
      saveLoginRecord({
        userId: loggedInUser.id,
        email: loggedInUser.email,
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${loggedInUser.name}!`,
      });
      
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login error",
        description: "Unable to connect to the server. Please try again later.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (name: string, email: string, password: string, role: "admin" | "user" = "user"): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8080/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        toast({
          title: "Signup failed",
          description: errorData?.message || "Failed to create account",
          variant: "destructive",
        });
        return false;
      }

      const data = await response.json();
      
      // Assuming the API returns user data with id, email, name, role, and possibly a token
      const newUser = {
        id: data.user?.id || data.id || `user_${Date.now()}`,
        email: data.user?.email || data.email || email,
        name: data.user?.name || data.name || name,
        role: (data.user?.role || data.role || role) as "admin" | "user"
      };
      
      setUser(newUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      
      // Store token if provided
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }
      
      // Save login record for new signup
      saveLoginRecord({
        userId: newUser.id,
        email: newUser.email,
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "Signup successful",
        description: `Welcome, ${newUser.name}!`,
      });
      
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Signup error",
        description: "Unable to connect to the server. Please try again later.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, isAdmin }}>
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
