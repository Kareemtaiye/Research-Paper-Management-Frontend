import Button from "@/components/Button";
import Input from "@/components/Input";
import PageHeader from "@/components/PageHeader";
import { Stat } from "@/components/Stat";
import { StatusChip } from "@/components/StatusChip";
import { Icon, IconSpin } from "@/ui/icons";
import { formatDate } from "@/utils/utils";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTasks } from "@/context/TasksContext";
import { usePapers } from "@/context/PapersContext";
import { useToast } from "@/context/ToastContext";
import { toastApiError } from "@/utils/apiError";

const BASE_API_URL = import.meta.env.VITE_API_URL;

function Dashboard() {
  /* Beginning changes */
  const { tasks } = useTasks();
  const { recentPapers, loading, fetchAllPapers, fetchRecentPapers } = usePapers();

  const token = localStorage.getItem("access_token") || "null";

  useEffect(() => {
    fetchRecentPapers();
  }, []);

  /* End changes */
  const [arxivInput, setArxivInput] = useState("");
  const [importing, setImporting] = useState(false);

  const { toast } = useToast();

  const nav = useNavigate();
  const completed = recentPapers?.filter(p => p.status === "completed").length;
  const processing = recentPapers?.filter(
    p => p.status === "processing" || p.status === "queued" || p.status == "pending",
  ).length;
  const failed = recentPapers?.filter(p => p.status === "failed").length;
  const activeTasks = tasks.filter(t => t.status === "running");

  async function handleArxivImport() {
    if (!arxivInput.trim()) return;
    setImporting(true);

    try {
      const res = await axios.post(
        `${BASE_API_URL}/papers-import/import/arxiv`,
        { arxiv_url: arxivInput },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // setRecentPapers(res.data.data.data);
      fetchRecentPapers();
      fetchAllPapers();
      toast("Paper import started", "success");
    } catch (err) {
      toastApiError(err, toast);
    } finally {
      setImporting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your research paper library"
        actions={
          <Button size="sm" variant="outline" onClick={() => nav("/papers")}>
            View all papers
          </Button>
        }
      />
      <div className="px-8 py-6 space-y-5">
        <div className="grid grid-cols-4 gap-3">
          <Stat
            label="Total Papers"
            value={loading ? "..." : recentPapers.length}
            sub="across all statuses"
          />
          <Stat
            label="completed"
            value={loading ? "..." : completed}
            sub={`${
              loading ? "..." : Math.round((completed / recentPapers.length) * 100)
            }% success rate`}
          />
          <Stat
            label="Processing"
            value={loading ? "..." : processing}
            sub="in queue or active"
          />
          <Stat label="Failed" value={loading ? "..." : failed} sub="across all papers" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div
            className="col-span-2 rounded-lg border overflow-hidden"
            style={{
              backgroundColor: "#111118",
              borderColor: "rgba(255,255,255,0.06)",
              borderWidth: "0.5px",
            }}
          >
            <div
              className="px-5 py-3 flex items-center justify-between"
              style={{ borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}
            >
              <span className="text-xs font-medium text-slate-400">Recent Papers</span>
              <button
                onClick={() => nav("/papers")}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                View all →
              </button>
            </div>
            <table className={`w-full ${loading ? "relative" : ""}`}>
              <thead>
                <tr style={{ borderBottom: "0.5px solid rgba(255,255,255,0.04)" }}>
                  {["ArXiv ID", "Title", "Status", "completed"].map(h => (
                    <th
                      key={h}
                      className="px-5 py-2.5 text-left text-[10px] font-medium text-slate-600 uppercase tracking-wider"
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
                      Loading recent papers...
                      <span
                        className={
                          loading
                            ? "animate-spin text-white absolute top-30 left-115"
                            : ""
                        }
                      >
                        <IconSpin size={20} />
                      </span>
                    </td>
                  </tr>
                ) : recentPapers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-6 text-center text-xs text-slate-600"
                    >
                      No recent papers found
                    </td>
                  </tr>
                ) : (
                  recentPapers?.map((paper, i) => (
                    <tr
                      key={paper.id}
                      onClick={() => nav(`/papers/${paper.id}`)}
                      className="cursor-pointer group transition-colors"
                      style={{
                        borderBottom:
                          i < 5 ? "0.5px solid rgba(255,255,255,0.04)" : "none",
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
                      <td className="px-5 py-3">
                        <span className="font-mono text-xs text-slate-500">
                          {paper.arxiv_id}
                        </span>
                      </td>
                      <td className="px-5 py-3 max-w-xs">
                        <span className="text-sm text-slate-300 line-clamp-1 group-hover:text-slate-100 transition-colors">
                          {paper.title}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <StatusChip status={paper.status} />
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-600">
                        {formatDate(paper.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="space-y-4">
            {/* Import panel */}
            <div
              className="rounded-lg border p-5 space-y-3"
              style={{
                backgroundColor: "#111118",
                borderColor: "rgba(255,255,255,0.06)",
                borderWidth: "0.5px",
              }}
            >
              <div className="text-xs font-medium text-slate-400">Import Paper</div>
              <div>
                <label className="text-[11px] text-slate-600 mb-1.5 block">
                  ArXiv ID or URL
                </label>
                <Input
                  placeholder="2401.00001 or arxiv.org/abs/..."
                  value={arxivInput}
                  onChange={e => setArxivInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleArxivImport()}
                />
              </div>
              <Button
                variant="primary"
                className="w-full"
                onClick={handleArxivImport}
                disabled={importing || !arxivInput.trim()}
              >
                {importing ? (
                  <>
                    <span className="w-3 h-3 rounded-full border border-white/30 border-t-white animate-spin" />
                    Importing…
                  </>
                ) : (
                  <>
                    <Icon.Import />
                    Import Paper
                  </>
                )}
              </Button>
            </div>
            {/* Active tasks */}
            <div
              className="rounded-lg border overflow-hidden"
              style={{
                backgroundColor: "#111118",
                borderColor: "rgba(255,255,255,0.06)",
                borderWidth: "0.5px",
              }}
            >
              <div
                className="px-4 py-3 flex items-center justify-between"
                style={{ borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}
              >
                <span className="text-xs font-medium text-slate-400">Active Tasks</span>
                <button
                  onClick={() => nav("/papers")}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  View all →
                </button>
              </div>
              {activeTasks.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-slate-600">
                  No active tasks
                </div>
              ) : (
                <div
                  className="divide-y"
                  style={{ borderColor: "rgba(255,255,255,0.04)" }}
                >
                  {activeTasks.map(task => (
                    <div key={task.id} className="px-4 py-3 space-y-2">
                      <div className="text-xs text-slate-400 line-clamp-1">
                        {task.paper_title}
                      </div>
                      <div className="text-[11px] text-slate-600 font-mono">
                        {task.step}
                      </div>
                      <div
                        className="w-full rounded-full overflow-hidden"
                        style={{
                          height: 2,
                          backgroundColor: "rgba(255,255,255,0.06)",
                        }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${task.progress}%`,
                            backgroundColor: "#6366f1",
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-600">
                        <span>{task.progress}%</span>
                        <span>{task.worker}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
