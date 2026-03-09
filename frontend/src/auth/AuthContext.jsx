import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getCsrfCookie,
  login as loginRequest,
  logout as logoutRequest,
  me,
  register as registerRequest,
} from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        await getCsrfCookie();
        const currentUser = await me();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    await getCsrfCookie();
    const loggedInUser = await loginRequest(email, password);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (email, password, teamName) => {
    await getCsrfCookie();
    const newUser = await registerRequest(email, password, teamName);
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    await getCsrfCookie();
    await logoutRequest();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      authLoading,
      login,
      register,
      logout,
      setUser,
    }),
    [user, authLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}