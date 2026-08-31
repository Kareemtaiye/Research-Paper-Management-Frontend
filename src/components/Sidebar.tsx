import { Icon } from "@/ui/icons";
import Divider from "./Divider";
import WsIndicator from "./WsIndicator";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { usePapers } from "@/context/PapersContext";
import { useTasks } from "@/context/TasksContext";

function Sidebar({ onLogout, user }: { onLogout: () => void; user: any }) {
  const [currPage, setCurrPage] = useState("dashboard");
  const { websocketConnected } = useAuth();
  const nav = useNavigate();
  const { papers } = usePapers();
  const { tasks } = useTasks();

  const runningTasks = tasks.filter(
    t => t.status === "processing" || t.status === "queued",
  ).length;

  const sideNav = [
    { id: "dashboard", label: "Dashboard", Icon: Icon.Dashboard },
    { id: "papers", label: "Papers", Icon: Icon.Papers, count: papers.length },
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
        <WsIndicator connected={websocketConnected} />
        <Divider />
        <Link to="/login">
          <button
            onClick={() => onLogout()}
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
