import Button from "@/components/Button";
import Input from "@/components/Input";
import PageHeader from "@/components/Pageheader";
import { Stat } from "@/components/Stat";
import { StatusChip } from "@/components/StatusChip";
import { Paper } from "@/types/Paper";
import { Icon, IconSpin } from "@/ui/icons";
import { formatDate } from "@/utils/utils";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_API_URL } from "../papers/Paper";
import axios from "axios";

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

function Dashboard() {
  /* Beginning changes */
  const [recentPapers, setRecentPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const token = JSON.parse(localStorage.getItem("token") || "null");

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
    } catch (err) {
      console.error("Failed to fetch recent papers:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRecentPapers();
  }, []);

  /* End changes */
  const [arxivInput, setArxivInput] = useState("");
  const [importing, setImporting] = useState(false);

  const nav = useNavigate();
  const completed = recentPapers?.filter(p => p.status === "completed").length;
  const processing = recentPapers?.filter(
    p => p.status === "processing" || p.status === "queued",
  ).length;
  const failed = recentPapers?.filter(p => p.status === "failed").length;
  const activeTasks = TASKS.filter(t => t.status === "running");

  const handleImport = () => {
    if (!arxivInput.trim()) return;
    setImporting(true);
    setTimeout(() => {
      setImporting(false);
      setArxivInput("");
    }, 2200);
  };

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
            sub={`${loading ? "..." : Math.round((completed / recentPapers.length) * 100)}% success rate`}
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
                  onKeyDown={e => e.key === "Enter" && handleImport()}
                />
              </div>
              <Button
                variant="primary"
                className="w-full"
                onClick={handleImport}
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
                        style={{ height: 2, backgroundColor: "rgba(255,255,255,0.06)" }}
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
