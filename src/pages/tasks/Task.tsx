import PageHeader from "@/components/Pageheader";
import { Stat } from "@/components/Stat";
import { TaskStatusChip } from "@/components/TaskStatusChip";
import { Icon } from "@/ui/icons";
import { useState } from "react";
type TaskStatus = "running" | "completed" | "failed" | "queued";

interface Task {
  id: string;
  type: "import" | "index" | "citation" | "embed" | "pdf";
  paper_id: string;
  paper_title: string;
  status: TaskStatus;
  step: string;
  progress: number;
  started_at: string;
  duration: string;
  worker: string;
}

const TASKS: Task[] = [
  {
    id: "task-001",
    type: "import",
    paper_id: "3",
    paper_title: "Retrieval-Augmented Generation with Structured Knowledge Graphs",
    status: "running",
    step: "Extracting citations",
    progress: 62,
    started_at: "2024-06-06T10:46:00Z",
    duration: "2m 14s",
    worker: "celery@worker-1",
  },
  {
    id: "task-002",
    type: "pdf",
    paper_id: "7",
    paper_title: "Vision Language Models for Scientific Figure Understanding",
    status: "running",
    step: "Parsing PDF metadata",
    progress: 14,
    started_at: "2024-06-06T10:47:13Z",
    duration: "47s",
    worker: "celery@worker-2",
  },
  {
    id: "task-003",
    type: "embed",
    paper_id: "5",
    paper_title: "Mixture of Experts: Dynamic Routing for Efficient Language Modeling",
    status: "queued",
    step: "Waiting for worker",
    progress: 0,
    started_at: "2024-06-06T10:47:55Z",
    duration: "—",
    worker: "—",
  },
  {
    id: "task-004",
    type: "index",
    paper_id: "8",
    paper_title: "Speculative Decoding with Draft Model Ensembles",
    status: "completed",
    step: "Full-text index built",
    progress: 100,
    started_at: "2024-06-06T09:58:10Z",
    duration: "1m 43s",
    worker: "celery@worker-1",
  },
  {
    id: "task-005",
    type: "citation",
    paper_id: "2",
    paper_title: "Scaling Laws for Neural Language Models Under Distribution Shift",
    status: "completed",
    step: "47 references parsed",
    progress: 100,
    started_at: "2024-06-06T09:31:05Z",
    duration: "58s",
    worker: "celery@worker-3",
  },
  {
    id: "task-006",
    type: "import",
    paper_id: "6",
    paper_title: "Reinforcement Learning from Human Feedback: An Empirical Analysis",
    status: "failed",
    step: "PDF download failed: 403 Forbidden",
    progress: 18,
    started_at: "2024-06-06T08:30:01Z",
    duration: "2m 14s",
    worker: "celery@worker-2",
  },
  {
    id: "task-007",
    type: "embed",
    paper_id: "4",
    paper_title: "Constitutional AI: Harmlessness from AI Feedback at Scale",
    status: "completed",
    step: "Embeddings stored in pgvector",
    progress: 100,
    started_at: "2024-06-06T08:12:30Z",
    duration: "3m 02s",
    worker: "celery@worker-1",
  },
  {
    id: "task-008",
    type: "pdf",
    paper_id: "1",
    paper_title: "Attention Is All You Need: Revisited for Long-Context Transformers",
    status: "completed",
    step: "Text extracted · 18,432 tokens",
    progress: 100,
    started_at: "2024-06-05T17:44:11Z",
    duration: "1m 07s",
    worker: "celery@worker-3",
  },
];

const TASK_TYPE_LABELS: Record<Task["type"], string> = {
  import: "Import",
  index: "Index",
  citation: "Citations",
  embed: "Embed",
  pdf: "PDF",
};

export function Tasks() {
  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  const statuses: (TaskStatus | "all")[] = [
    "all",
    "running",
    "queued",
    "completed",
    "failed",
  ];

  const filtered = filter === "all" ? TASKS : TASKS.filter(t => t.status === filter);
  const running = TASKS.filter(t => t.status === "running").length;
  const queued = TASKS.filter(t => t.status === "queued").length;
  const completed = TASKS.filter(t => t.status === "completed").length;
  const failed = TASKS.filter(t => t.status === "failed").length;

  return (
    <div>
      <PageHeader
        title="Tasks"
        subtitle={`${TASKS.length} total · ${running} running · ${queued} queued`}
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
                ? `All (${TASKS.length})`
                : `${s.charAt(0).toUpperCase() + s.slice(1)} (${TASKS.filter(t => t.status === s).length})`}
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
                  "Task ID",
                  "Type",
                  "Paper",
                  "Status",
                  "Step",
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
              {filtered.map((task, i) => (
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
                      {task.id}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className="inline-flex px-1.5 py-0.5 rounded text-[11px] font-mono text-slate-400 bg-white/4 border border-white/6"
                      style={{ borderWidth: "0.5px" }}
                    >
                      {TASK_TYPE_LABELS[task.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 max-w-[200px]">
                    <div className="text-xs text-slate-400 line-clamp-1">
                      {task.paper_title}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <TaskStatusChip status={task.status} />
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs text-slate-500 font-mono">{task.step}</span>
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
                          style={{ height: 2, backgroundColor: "rgba(255,255,255,0.06)" }}
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
                      {task.duration}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-[11px] font-mono text-slate-600">
                      {task.worker}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
