import { createContext, useContext, useState } from "react";
import api from "../api/axios.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("studysync_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const persistUser = (data) => {
    localStorage.setItem("studysync_user", JSON.stringify(data));
    setUser(data);
  };

  const register = async (name, email, password) => {
    setAuthError("");
    setAuthLoading(true);
    try {
      const { data } = await api.post("/auth/register", { name, email, password });
      persistUser(data);
      return true;
    } catch (error) {
      setAuthError(error.response?.data?.message || "Registration failed. Please try again.");
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  const login = async (email, password) => {
    setAuthError("");
    setAuthLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      persistUser(data);
      return true;
    } catch (error) {
      setAuthError(error.response?.data?.message || "Login failed. Please try again.");
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("studysync_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout, authError, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
