// src/context/PapersContext.tsx
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react"
import axios from "axios"
import { Paper } from "@/types/Paper"
import { useToast } from "./ToastContext"
import { isUnauthorized, toastApiError } from "@/utils/apiError"

const BASE_API_URL = import.meta.env.VITE_API_URL

interface PapersContextType {
  papers: Paper[]
  recentPapers: Paper[]
  loading: boolean
  fetchAllPapers: () => Promise<void>
  fetchRecentPapers: () => Promise<void>
  updatePaper: (paperId: string, updates: Partial<Paper>) => void
  updateRecentPaper: (paperId: string, updates: Partial<Paper>) => void
}

const PapersContext = createContext<PapersContextType | null>(null)

export const PapersProvider = ({
  children,
  token,
}: {
  children: React.ReactNode
  token: string | null
}) => {
  const [papers, setPapers] = useState<Paper[]>([])
  const [recentPapers, setRecentPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const { toast } = useToast()

  const fetchAllPapers = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await axios.get(`${BASE_API_URL}/papers/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = res.data.data
      setPapers(data)
    } catch (err) {
      if (isUnauthorized(err)) {
        localStorage.removeItem("access_token")
        localStorage.removeItem("user_id")
        toast("Session expired. Please log in again", "error")
      } else {
        toastApiError(err, toast)
      }
    } finally {
      setLoading(false)
    }
  }, [token])

  // Update a single paper in state without refetching all
  // Used by WebSocket handler when paper_completed arrives
  const updatePaper = useCallback(
    (paperId: string, updates: Partial<Paper>) => {
      setPapers((prev) =>
        prev.map((p) => (p.id === paperId ? { ...p, ...updates } : p)),
      )
    },
    [],
  )

  const updateRecentPaper = useCallback(
    (paperId: string, updates: Partial<Paper>) => {
      setRecentPapers((prev) =>
        prev.map((p) => (p.id === paperId ? { ...p, ...updates } : p)),
      )
    },
    [],
  )

  useEffect(() => {
    if (!token) return
    fetchAllPapers()
  }, [fetchAllPapers])

  async function fetchRecentPapers() {
    setLoading(true)
    try {
      // Simulate an API call to fetch recent papers
      const res = await axios.get(`${BASE_API_URL}/papers/recent`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setRecentPapers(res.data.data.data)
    } catch (err) {
      if (isUnauthorized(err)) {
        localStorage.removeItem("access_token")
        localStorage.removeItem("user_id")
        toast("Session expired. Please log in again", "error")
      } else {
        toastApiError(err, toast)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) return
    fetchRecentPapers()
  }, [])

  return (
    <PapersContext.Provider
      value={{
        papers,
        recentPapers,
        loading,
        fetchAllPapers,
        fetchRecentPapers,
        updatePaper,
        updateRecentPaper,
      }}
    >
      {children}
    </PapersContext.Provider>
  )
}

export const usePapers = () => {
  const ctx = useContext(PapersContext)
  if (!ctx) throw new Error("usePapers must be used within PapersProvider")
  return ctx
}
