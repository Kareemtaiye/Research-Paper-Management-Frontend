import PageHeader from "@/components/PageHeader";
import { Stat } from "@/components/Stat";
import { TaskStatusChip } from "@/components/TaskStatusChip";
import { Icon, IconSpin } from "@/ui/icons";
import axios from "axios";
import { useEffect, useState } from "react";

function formatDuration(createdAt: string, completedAt: string | null): string {
  if (!completedAt) {
    // still running — show elapsed time
    const elapsed = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
    return elapsed >= 60
      ? `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`
      : `${elapsed}s`;
  }

  const duration = Math.floor(
    (new Date(completedAt).getTime() - new Date(createdAt).getTime()) / 1000,
  );

  return duration >= 60
    ? `${Math.floor(duration / 60)}m ${duration % 60}s`
    : `${duration}s`;
}

// Task ID: show first 8 chars
// const shortTaskId = task.task_id.substring(0, 8) + "…";

// // Worker: remove "celery@" prefix, truncate hash
// const workerDisplay = task.worker_name?.replace("celery@", "").substring(0, 12) + "…";

type TaskStatus = "running" | "completed" | "failed" | "queued";

export const BASE_API_URL = "http://localhost/api/v1";

interface Task {
  id: string;
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
  started_at: string;
  duration: string;
  worker_name: string;
  result: string;
  created_at: string;
  updated_at: string;
  completed_at: string;
}

const TASK_TYPE_LABELS: Record<Task["task_type"], string> = {
  fetch_paper_metadata: "Import",
  send_paper_notification: "Email",
  sync_paper_to_elasticsearch: "Index",
  remove_paper_from_elasticsearch: "De-index",
};

export function Tasks() {
  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  const [loading, setLoading] = useState<boolean>(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const statuses: (TaskStatus | "all")[] = [
    "all",
    "running",
    "queued",
    "completed",
    "failed",
  ];

  const token = JSON.parse(localStorage.getItem("token") || "");
  const filtered = filter === "all" ? tasks : tasks.filter(t => t.status === filter);
  const running = tasks.filter(t => t.status === "running").length;
  const queued = tasks.filter(t => t.status === "queued").length;
  const completed = tasks.filter(t => t.status === "completed").length;
  const failed = tasks.filter(t => t.status === "failed").length;

  async function fetchAllTaksk() {
    setLoading(true);
    const res = await axios.get(`${BASE_API_URL}/tasks`, {
      headers: {
        Authorization: `bearer ${token}`,
      },
    });
    setTasks(res.data.data.data);
    try {
    } catch (err: any) {
      console.log("Err:", err.response.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(function () {
    fetchAllTaksk();
  }, []);

  return (
    <div>
      <PageHeader
        title="Tasks"
        subtitle={`${tasks.length} total · ${running} running · ${queued} queued`}
      />
      <div className="px-8 py-5 space-y-5">
        {/* Summary row */}
        <div className="grid grid-cols-4 gap-3">
          <Stat
            label="Running"
            value={running}
            dot="bg-blue-400 ws-pulse"
            sub="active workers"
          />
          <Stat
            label="Queued"
            value={queued}
            dot="bg-slate-400"
            sub="waiting for worker"
          />
          <Stat
            label="Completed"
            value={completed}
            dot="bg-green-400"
            sub="in this session"
          />
          <Stat label="Failed" value={failed} dot="bg-red-400" sub="require attention" />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className="px-3 py-1.5 rounded text-xs font-medium transition-all cursor-pointer"
              style={{
                backgroundColor: filter === s ? "rgba(99,102,241,0.15)" : "transparent",
                color: filter === s ? "#a5b4fc" : "#475569",
                border:
                  filter === s
                    ? "0.5px solid rgba(99,102,241,0.3)"
                    : "0.5px solid transparent",
              }}
            >
              {s === "all"
                ? `All (${tasks.length})`
                : `${s.charAt(0).toUpperCase() + s.slice(1)} (${tasks.filter(t => t.status === s).length})`}
            </button>
          ))}
        </div>

        {/* Task table */}
        <div
          className="rounded-lg border overflow-hidden"
          style={{
            backgroundColor: "#111118",
            borderColor: "rgba(255,255,255,0.06)",
            borderWidth: "0.5px",
          }}
        >
          <table className="w-full">
            <thead>
              <tr
                style={{
                  borderBottom: "0.5px solid rgba(255,255,255,0.06)",
                  backgroundColor: "rgba(255,255,255,0.015)",
                }}
              >
                {[
                  "Task ID(No.)",
                  "Type",
                  "Paper",
                  "Status",
                  "Stage",
                  "Progress",
                  "Duration",
                  "Worker",
                ].map(h => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[10px] font-medium text-slate-600 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className={`px-5 py-6 text-center text-xs text-slate-600`}
                  >
                    Loading tasks...
                    <span
                      className={
                        loading ? "animate-spin text-white absolute top-30 left-115" : ""
                      }
                    >
                      <IconSpin size={20} />
                    </span>
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-6 text-center text-xs text-slate-600"
                  >
                    No tasks found
                  </td>
                </tr>
              ) : (
                filtered.map((task, i) => (
                  <tr
                    key={task.id}
                    className="transition-colors"
                    style={{
                      borderBottom:
                        i < filtered.length - 1
                          ? "0.5px solid rgba(255,255,255,0.04)"
                          : "none",
                    }}
                    onMouseEnter={e =>
                      ((e.currentTarget as HTMLElement).style.backgroundColor =
                        "rgba(255,255,255,0.02)")
                    }
                    onMouseLeave={e =>
                      ((e.currentTarget as HTMLElement).style.backgroundColor =
                        "transparent")
                    }
                  >
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-[11px] text-slate-500">
                        {`task-${String(i + 1).padStart(3, "00")}`}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className="inline-flex px-1.5 py-0.5 rounded text-[11px] font-mono text-slate-400 bg-white/4 border border-white/6"
                        style={{ borderWidth: "0.5px" }}
                      >
                        {TASK_TYPE_LABELS[task.task_type]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 max-w-[200px]">
                      <div className="text-xs text-slate-400 line-clamp-1">
                        {task.result && JSON.parse(task.result).title !== null
                          ? JSON.parse(task.result).title
                          : "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <TaskStatusChip status={task.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-slate-500 font-mono">
                        {task.stage_message}
                      </span>
                      {task.status === "failed" && (
                        <button className="ml-2 text-[10px] text-indigo-400 hover:text-indigo-300 cursor-pointer inline-flex items-center gap-1">
                          <Icon.Retry />
                          Retry
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {task.progress > 0 ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-16 rounded-full overflow-hidden"
                            style={{
                              height: 2,
                              backgroundColor: "rgba(255,255,255,0.06)",
                            }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${task.progress}%`,
                                backgroundColor:
                                  task.status === "failed" ? "#ef4444" : "#6366f1",
                              }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-slate-600 tabular-nums">
                            {task.progress}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-slate-600 font-mono">
                        {formatDuration(task.created_at, task.completed_at)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[11px] font-mono text-slate-600">
                        {task.worker_name?.replace("celery@", "cel@").substring(0, 12) +
                          "…"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
