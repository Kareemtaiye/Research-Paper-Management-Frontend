import { Icon } from "@/ui/icons";
import Divider from "./Divider";
import WsIndicator from "./WsIndicator";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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

function Sidebar({ wsConnected }: { wsConnected: boolean }) {
  const [currPage, setCurrPage] = useState("dashboard");
  const nav = useNavigate();

  const runningTasks = TASKS.filter(
    t => t.status === "running" || t.status === "queued",
  ).length;

  const sideNav = [
    { id: "dashboard", label: "Dashboard", Icon: Icon.Dashboard },
    { id: "papers", label: "Papers", Icon: Icon.Papers, count: "PAPERS.length" },
    {
      id: "tasks",
      label: "Tasks",
      Icon: Icon.Tasks,
      count: runningTasks,
      countColor: runningTasks > 0 ? "bg-indigo-500/20 text-indigo-400" : undefined,
    },
    { id: "search", label: "Search", Icon: Icon.Search },
    { id: "metrics", label: "Metrics", Icon: Icon.Metrics },
  ];

  return (
    <aside
      className="fixed top-0 left-0 h-full flex flex-col"
      style={{
        width: 224,
        backgroundColor: "#0d0d14",
        borderRight: "0.5px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Logo */}
      <div
        className="px-5 py-4 flex items-center gap-3"
        style={{ borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}
      >
        <div
          className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "#6366f1" }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="white">
            <path d="M2 2h4v4H2zM8 2h4v4H8zM2 8h4v4H2zM8 8l2 4h2L10 8z" />
          </svg>
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-100">PaperBase</div>
          <div className="text-[10px] text-slate-600 font-mono">v2.4.1</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        <div className="text-[10px] font-medium text-slate-700 uppercase tracking-widest px-3 py-1.5 mb-1">
          Library
        </div>

        {sideNav.map(({ id, label, Icon: NavIcon, count, countColor }) => {
          const active =
            currPage === id || (currPage === "paper-detail" && id === "papers");
          return (
            <button
              key={id}
              onClick={() => {
                nav(`${id}`);
                setCurrPage(id);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all text-left cursor-pointer"
              style={{
                backgroundColor: active ? "rgba(99,102,241,0.1)" : "transparent",
                color: active ? "#a5b4fc" : "#64748b",
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "rgba(255,255,255,0.04)";
                  (e.currentTarget as HTMLElement).style.color = "#94a3b8";
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = active
                  ? "rgba(99,102,241,0.1)"
                  : "transparent";
                (e.currentTarget as HTMLElement).style.color = active
                  ? "#a5b4fc"
                  : "#64748b";
              }}
            >
              <NavIcon />
              <span className="flex-1">{label}</span>
              {count !== undefined && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${countColor || "bg-white/6 text-slate-600"}`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}

        <div className="text-[10px] font-medium text-slate-700 uppercase tracking-widest px-3 py-1.5 mt-3 mb-1">
          Account
        </div>
        {[{ id: "settings", label: "Settings", Icon: Icon.Settings }].map(
          ({ id, label, Icon: NavIcon }) => {
            const page = "";
            const active = page === id;
            return (
              <button
                key={id}
                // onClick={() => setPage(id)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all text-left cursor-pointer"
                style={{
                  backgroundColor: active ? "rgba(99,102,241,0.1)" : "transparent",
                  color: active ? "#a5b4fc" : "#64748b",
                }}
                onMouseEnter={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      "rgba(255,255,255,0.04)";
                    (e.currentTarget as HTMLElement).style.color = "#94a3b8";
                  }
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = active
                    ? "rgba(99,102,241,0.1)"
                    : "transparent";
                  (e.currentTarget as HTMLElement).style.color = active
                    ? "#a5b4fc"
                    : "#64748b";
                }}
              >
                <NavIcon />
                {label}
              </button>
            );
          },
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 space-y-2">
        <WsIndicator connected={wsConnected} />
        <Divider />
        <Link to="/login">
          <button
            // onClick={() => setPage("login")}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-slate-600 hover:text-slate-400 hover:bg-white/4 transition-all cursor-pointer"
          >
            <Icon.User />
            Sign out
          </button>
        </Link>
      </div>
    </aside>
  );
}

export default Sidebar;
