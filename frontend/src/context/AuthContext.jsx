import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../api/authService";

const AuthContext = createContext(null);
const STORAGE_KEY = "capture-app:user";
const CREDENTIALS_KEY = "capture-app:credentials";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username, password) => {
    const data = await authService.login(username, password);
    const sessionUser = { userId: data.userId, username: data.username };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser));
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify({ username, password }));
    setUser(sessionUser);
    return sessionUser;
  };

  const register = async (username, password) => {
    await authService.register(username, password);
    return login(username, password);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CREDENTIALS_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans un <AuthProvider>");
  return ctx;
}
