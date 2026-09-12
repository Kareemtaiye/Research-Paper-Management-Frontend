// src/context/TasksContext.tsx
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import axios from "axios";
import { useWebSocket } from "@/hooks/websockets";
import { usePapers } from "./PapersContext";
import { useToast } from "./ToastContext";
import { toastApiError } from "@/utils/apiError";

const BASE_API_URL = import.meta.env.VITE_API_URL;

type TaskStatus = "processing" | "completed" | "failed" | "queued";

interface Task {
  id: string;
  task_id: string;
  task_type:
    | "fetch_paper_metadata"
    | "send_paper_notification"
    | "sync_paper_to_elasticsearch"
    | "remove_paper_from_elasticsearch";
  paper_id: string;
  paper_title: string;
  status: TaskStatus;
  stage_message: string;
  progress: number;
  stage?: string;
  started_at: string;
  duration: string;
  worker_name: string;
  result: string | { paper_id: string; title: string } | null;
  created_at: string;
  updated_at: string;
  completed_at: string;
}

interface TasksContextType {
  tasks: Task[];
  loading: boolean;
  fetchAllTasks: () => Promise<void>;
}

const TasksContext = createContext<TasksContextType | null>(null);

export const TasksProvider = ({
  children,
  token,
  userId,
}: {
  children: React.ReactNode;
  token: string | null;
  userId: string | null;
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const { updatePaper, updateRecentPaper } = usePapers();
  const { toast } = useToast();

  //   const token = localStorage.getItem("access_token");
  //   const userId = localStorage.getItem("user_id");

  const fetchAllTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_API_URL}/tasks`, {
        headers: { Authorization: `bearer ${token}` },
      });

      // console.log("Fetched tasks:", res.data.data);
      setTasks(res.data.data.data);
    } catch (err) {
      toastApiError(err, toast);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch on mount
  useEffect(() => {
    if (!token) return;
    fetchAllTasks();
  }, [fetchAllTasks]);

  // WebSocket handler
  const handleMessage = useCallback(
    (data: any) => {
      if (data.event === "task_update") {
        setTasks(prev => {
          const exists = prev.some(t => t.task_id === data.task_id);

          if (!exists) {
            return [
              {
                task_id: data.task_id,
                status: data.status,
                progress: data.progress ?? 0,
                stage_message: data.stage_message ?? null,
                worker_name: data.worker_name ?? null,
                task_type: data.task_type || "fetch_paper_metadata",
                paper_id: data.paper_id ?? null,
                created_at: new Date().toISOString(),
                completed_at: null,
                error: null,
                result: null,
              },
              ...prev,
            ];
          }

          return prev.map(task =>
            task.task_id === data.task_id ? { ...task, ...data } : task,
          );
        });
      }
      if (data.event === "paper_completed") {
        // Update the specific paper in state directly
        updatePaper(data.paper_id, {
          title: data.title,
          status: "completed",
          authors: data.authors,
          abstract: data.abstract,
          categories: data.categories,
          published_at: data.published_at,
        });

        updateRecentPaper(data.paper_id, {
          title: data.title,
          status: "completed",
          authors: data.authors,
          abstract: data.abstract,
          categories: data.categories,
          published_at: data.published_at,
        });
        toast(`Paper: ${data.title} import complete.`);

        fetchAllTasks();
      }
    },
    [updatePaper],
  );

  useWebSocket(userId, token, handleMessage);

  return (
    <TasksContext.Provider value={{ tasks, loading, fetchAllTasks }}>
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used within TasksProvider");
  return ctx;
};
