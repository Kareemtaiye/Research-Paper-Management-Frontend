// src/context/AuthContext.tsx
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ToastContext";
import { isUnauthorized, toastApiError } from "@/utils/apiError";

const BASE_API_URL = import.meta.env.VITE_API_URL;

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  email_verified: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  websocketConnected: boolean;
  setWebsocketConnected: (connected: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  fetchMe: (accessToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    // lazy initializer — reads localStorage once on mount
    return localStorage.getItem("access_token") || null;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [websocketConnected, setWebsocketConnected] = useState<boolean>(false);
  const navigate = useNavigate();

  const { toast } = useToast();

  const fetchMe = useCallback(async (accessToken: string) => {
    try {
      const res = await axios.get(`${BASE_API_URL}/user/me`, {
        headers: { Authorization: `bearer ${accessToken}` },
      });

      setUser(res.data);
      localStorage.setItem("user_id", res.data.id);
    } catch (err) {
      if (isUnauthorized(err)) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_id");
        setToken(null);
        setUser(null);
        navigate("/login");
      } else {
        toastApiError(err, toast, "Failed to load user");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount — if token exists, fetch user
  useEffect(() => {
    if (token && token !== "null") {
      fetchMe(token);
    } else {
      setLoading(false);
    }
  }, [token, fetchMe]);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const formdata = new FormData();
        formdata.append("username", email);
        formdata.append("password", password);

        const res = await axios.post(`${BASE_API_URL}/auth/token`, formdata, {
          withCredentials: true,
        });

        const accessToken = res.data.access_token;
        localStorage.setItem("access_token", accessToken);
        setToken(accessToken);
        await fetchMe(accessToken);
        navigate("/");
      } catch (err) {
        toastApiError(err, toast);
      } finally {
        setLoading(false);
      }
    },
    [fetchMe, navigate],
  );

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${BASE_API_URL}/auth/logout`,
        {},
        { withCredentials: true, headers: { Authorization: `bearer ${token}` } },
      );

      localStorage.removeItem("access_token");
      localStorage.removeItem("user_id");
      setToken(null);
      setUser(null);
    } catch (err) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_id");
      setToken(null);
      setUser(null);

      if (isUnauthorized(err)) {
        navigate("/login");
      } else {
        toastApiError(err, toast);
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  return (
    <AuthContext.Provider
      value={{
        user,
        fetchMe,
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
