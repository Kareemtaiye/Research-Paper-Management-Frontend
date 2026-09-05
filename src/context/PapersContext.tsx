// src/context/PapersContext.tsx
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import axios from "axios";
import { Paper } from "@/types/Paper";
import { useToast } from "./ToastContext";

const BASE_API_URL = import.meta.env.VITE_API_URL;

interface PapersContextType {
  papers: Paper[];
  recentPapers: Paper[];
  loading: boolean;
  page: number;
  perPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  fetchAllPapers: () => Promise<void>;
  fetchRecentPapers: () => Promise<void>;
  updatePaper: (paperId: string, updates: Partial<Paper>) => void;
  updateRecentPaper: (paperId: string, updates: Partial<Paper>) => void;
}

const PapersContext = createContext<PapersContextType | null>(null);

export const PapersProvider = ({
  children,
  token,
}: {
  children: React.ReactNode;
  token: string | null;
}) => {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [recentPapers, setRecentPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setCurrentPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(5);
  const [totalPages, setTotalPages] = useState<number>(0);
  const { toast } = useToast();
  const fetchAllPapers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_API_URL}/papers/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPapers(res.data.data.data);
      setCurrentPage(res.data.data.page);
      setPerPage(res.data.data.per_page);
      setTotalPages(res.data.data.total);
    } catch (err: any) {
      console.error("Failed to fetch papers:", err.response?.data);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Update a single paper in state without refetching all
  // Used by WebSocket handler when paper_completed arrives
  const updatePaper = useCallback((paperId: string, updates: Partial<Paper>) => {
    setPapers(prev => prev.map(p => (p.id === paperId ? { ...p, ...updates } : p)));
  }, []);

  const updateRecentPaper = useCallback((paperId: string, updates: Partial<Paper>) => {
    setRecentPapers(prev => prev.map(p => (p.id === paperId ? { ...p, ...updates } : p)));
  }, []);

  useEffect(() => {
    fetchAllPapers();
  }, [fetchAllPapers]);

  async function fetchRecentPapers() {
    setLoading(true);
    try {
      // Simulate an API call to fetch recent papers
      const res = await axios.get(`${BASE_API_URL}/papers/recent`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRecentPapers(res.data.data.data);
    } catch (err: any) {
      if (err.code === "ERR_NETWORK") {
        toast("You don't have internet connection", "error");
      }

      if (err.response) {
        toast(
          err?.response.data.message ||
            "An error occured, try reloading the page and try again",
          "error",
        );
      }

      if (err.response.data.code === 500) {
        toast("Something went wrong, please try again later", "error");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRecentPapers();
  }, []);

  return (
    <PapersContext.Provider
      value={{
        papers,
        recentPapers,
        loading,
        page,
        perPage,
        totalPages,
        setCurrentPage,
        fetchAllPapers,
        fetchRecentPapers,
        updatePaper,
        updateRecentPaper,
      }}
    >
      {children}
    </PapersContext.Provider>
  );
};

export const usePapers = () => {
  const ctx = useContext(PapersContext);
  if (!ctx) throw new Error("usePapers must be used within PapersProvider");
  return ctx;
};
