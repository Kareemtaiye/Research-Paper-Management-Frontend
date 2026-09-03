// src/context/AuthContext.tsx
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BASE_API_URL = import.meta.env.VITE_API_URL;

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  websocketConnected: boolean;
  setWebsocketConnected: (connected: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    // lazy initializer — reads localStorage once on mount
    return localStorage.getItem("access_token") || "null";
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [websocketConnected, setWebsocketConnected] = useState<boolean>(false);
  const navigate = useNavigate();

  const fetchMe = useCallback(async (accessToken: string) => {
    try {
      const res = await axios.get(`${BASE_API_URL}/user/me`, {
        headers: { Authorization: `bearer ${accessToken}` },
      });

      setUser(res.data);
      localStorage.setItem("user_id", res.data.id);
    } catch (err: any) {
      // Don't navigate — just clear token and let ProtectedRoute handle it
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_id");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount — if token exists, fetch user
  useEffect(() => {
    if (token) {
      fetchMe(token);
    } else {
      setLoading(false);
    }
  }, [token, fetchMe]);

  const login = useCallback(
    async (email: string, password: string) => {
      const formdata = new FormData();
      formdata.append("username", email);
      formdata.append("password", password);

      const res = await axios.post(`${BASE_API_URL}/auth/token`, formdata);

      console.log("Login response:", res);
      const accessToken = res.data.access_token;
      localStorage.setItem("access_token", accessToken);
      setToken(accessToken);
      await fetchMe(accessToken);
      navigate("/");
    },
    [fetchMe, navigate],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_id");
    setToken(null);
    setUser(null);
  }, [navigate]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        websocketConnected,
        setWebsocketConnected,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
