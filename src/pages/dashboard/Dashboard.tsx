import Button from "@/components/Button";
import Input from "@/components/Input";
import PageHeader from "@/components/Pageheader";
import { Icon } from "@/ui/icons";
import { formatDate } from "@/utils/utils";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

const PAPERS: Paper[] = [
  {
    id: "1",
    arxiv_id: "2401.00001",
    title: "Attention Is All You Need: Revisited for Long-Context Transformers",
    authors: ["Ashish Vaswani", "Noam Shazeer", "Niki Parmar"],
    abstract:
      "We present a revised analysis of the transformer architecture with particular focus on attention mechanisms that scale to long-context sequences. Our experiments demonstrate that sparse attention patterns combined with rotary position embeddings yield significant improvements on benchmarks requiring understanding of documents exceeding 100k tokens.",
    categories: ["cs.LG", "cs.CL", "cs.AI"],
    status: "imported",
    created_at: "2024-01-15T09:23:11Z",
    updated_at: "2024-01-15T09:31:44Z",
    citation_count: 1482,
  },
  {
    id: "2",
    arxiv_id: "2402.11823",
    title: "Scaling Laws for Neural Language Models Under Distribution Shift",
    authors: ["Jared Kaplan", "Sam McCandlish", "Tom Henighan"],
    abstract:
      "We study how scaling laws for language models are affected when training and evaluation distributions diverge. Contrary to prior assumptions, we find that model capacity and data diversity interact non-linearly, with implications for efficient resource allocation in large-scale pretraining runs.",
    categories: ["cs.LG", "stat.ML"],
    status: "imported",
    created_at: "2024-02-20T14:11:05Z",
    updated_at: "2024-02-20T14:45:30Z",
    citation_count: 874,
  },
  {
    id: "3",
    arxiv_id: "2403.05421",
    title: "Retrieval-Augmented Generation with Structured Knowledge Graphs",
    authors: ["Patrick Lewis", "Ethan Perez", "Aleksandra Piktus"],
    abstract:
      "We propose KG-RAG, a framework that integrates structured knowledge graph traversal into the retrieval pipeline for generation models. By grounding retrieved contexts in ontological relationships, KG-RAG reduces hallucination rates by 34% on knowledge-intensive NLP benchmarks.",
    categories: ["cs.CL", "cs.IR", "cs.AI"],
    status: "processing",
    created_at: "2024-03-08T07:55:22Z",
    updated_at: "2024-03-08T08:01:17Z",
    citation_count: 312,
  },
  {
    id: "4",
    arxiv_id: "2403.09812",
    title: "Constitutional AI: Harmlessness from AI Feedback at Scale",
    authors: ["Amanda Askell", "Yuntao Bai", "Anna Chen"],
    abstract:
      "We introduce a scalable approach to training safe AI systems using AI-generated constitutional principles. Our method reduces the need for human labeling of harmful outputs while maintaining performance across standard capability benchmarks.",
    categories: ["cs.AI", "cs.CL"],
    status: "imported",
    created_at: "2024-03-12T16:44:00Z",
    updated_at: "2024-03-12T17:02:55Z",
    citation_count: 2091,
  },
  {
    id: "5",
    arxiv_id: "2404.03718",
    title: "Mixture of Experts: Dynamic Routing for Efficient Language Modeling",
    authors: ["William Fedus", "Barret Zoph", "Noam Shazeer"],
    abstract:
      "Sparse mixture-of-experts layers offer a path to scaling model capacity without proportional increases in compute. We analyze routing instabilities that emerge at scale and introduce a differentiable load balancing objective that yields more uniform expert utilization across diverse task distributions.",
    categories: ["cs.LG", "cs.CL"],
    status: "pending",
    created_at: "2024-04-05T11:22:18Z",
    updated_at: "2024-04-05T11:22:18Z",
    citation_count: 0,
  },
  {
    id: "6",
    arxiv_id: "2405.00192",
    title: "Reinforcement Learning from Human Feedback: An Empirical Analysis",
    authors: ["Long Ouyang", "Jeff Wu", "Xu Jiang"],
    abstract:
      "We conduct a systematic empirical study of RLHF across model scales from 1B to 70B parameters. Our analysis reveals that reward model quality dominates policy optimization choice, and that preference data diversity matters more than volume beyond a critical threshold.",
    categories: ["cs.LG", "cs.CL", "cs.AI"],
    status: "failed",
    created_at: "2024-05-01T08:30:00Z",
    updated_at: "2024-05-01T08:32:14Z",
    citation_count: 0,
  },
  {
    id: "7",
    arxiv_id: "2405.11234",
    title: "Vision Language Models for Scientific Figure Understanding",
    authors: ["Jean-Baptiste Alayrac", "Jeff Donahue", "Pauline Luc"],
    abstract:
      "Scientific documents present unique challenges for vision-language models due to specialized notation, domain-specific charts, and multi-modal reasoning requirements. We introduce SciVLM, a model trained on a curated corpus of 2.4M annotated scientific figures with structured captions.",
    categories: ["cs.CV", "cs.CL", "cs.AI"],
    status: "queued",
    created_at: "2024-05-14T13:07:45Z",
    updated_at: "2024-05-14T13:07:45Z",
    citation_count: 0,
  },
  {
    id: "8",
    arxiv_id: "2406.03921",
    title: "Speculative Decoding with Draft Model Ensembles",
    authors: ["Yaniv Leviathan", "Matan Kalman", "Yossi Matias"],
    abstract:
      "Speculative decoding accelerates inference by using a smaller draft model to propose token sequences verified by the target model. We extend this paradigm to ensembles of draft models selected adaptively based on prompt characteristics, achieving 3.1× speedup over standard decoding.",
    categories: ["cs.LG", "cs.CL"],
    status: "imported",
    created_at: "2024-06-06T10:15:33Z",
    updated_at: "2024-06-06T10:48:22Z",
    citation_count: 198,
  },
];

type PaperStatus = "imported" | "processing" | "pending" | "failed" | "queued";

const StatusChip = ({ status }: { status: PaperStatus }) => {
  const map: Record<PaperStatus, { label: string; color: string; dot: string }> = {
    imported: {
      label: "Imported",
      color: "text-green-400 bg-green-400/8 border-green-400/20",
      dot: "bg-green-400",
    },
    processing: {
      label: "Processing",
      color: "text-blue-400 bg-blue-400/8 border-blue-400/20",
      dot: "bg-blue-400",
    },
    pending: {
      label: "Pending",
      color: "text-amber-400 bg-amber-400/8 border-amber-400/20",
      dot: "bg-amber-400",
    },
    queued: {
      label: "Queued",
      color: "text-slate-400 bg-slate-400/8 border-slate-400/20",
      dot: "bg-slate-400",
    },
    failed: {
      label: "Failed",
      color: "text-red-400 bg-red-400/8 border-red-400/20",
      dot: "bg-red-400",
    },
  };
  const { label, color, dot } = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${color}`}
      style={{ borderWidth: "0.5px" }}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
};

const Stat = ({
  label,
  value,
  sub,
  dot,
}: {
  label: string;
  value: string | number;
  sub?: string;
  dot?: string;
}) => (
  <div
    className="p-5 rounded-lg border"
    style={{
      backgroundColor: "#111118",
      borderColor: "rgba(255,255,255,0.06)",
      borderWidth: "0.5px",
    }}
  >
    <div className="text-xs text-slate-500 mb-2 uppercase tracking-widest font-medium">
      {label}
    </div>
    <div className="text-2xl font-semibold text-slate-100 tabular-nums">{value}</div>
    {sub && (
      <div className="flex items-center gap-1.5 mt-1.5">
        {dot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
        <span className="text-xs text-slate-500">{sub}</span>
      </div>
    )}
  </div>
);

function Dashboard() {
  const [arxivInput, setArxivInput] = useState("");
  const [importing, setImporting] = useState(false);
  const nav = useNavigate();
  const imported = PAPERS.filter(p => p.status === "imported").length;
  const processing = PAPERS.filter(
    p => p.status === "processing" || p.status === "queued",
  ).length;
  const totalCitations = PAPERS.reduce((sum, p) => sum + p.citation_count, 0);
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
          <Button size="sm" variant="outline" onClick={() => nav("papers")}>
            View all papers
          </Button>
        }
      />
      <div className="px-8 py-6 space-y-5">
        <div className="grid grid-cols-4 gap-3">
          <Stat label="Total Papers" value={PAPERS.length} sub="across all statuses" />
          <Stat
            label="Imported"
            value={imported}
            sub={`${Math.round((imported / PAPERS.length) * 100)}% success rate`}
          />
          <Stat label="Processing" value={processing} sub="in queue or active" />
          <Stat
            label="Citations Indexed"
            value={totalCitations.toLocaleString()}
            sub="across all papers"
          />
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
                onClick={() => nav("papers")}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                View all →
              </button>
            </div>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "0.5px solid rgba(255,255,255,0.04)" }}>
                  {["ArXiv ID", "Title", "Status", "Imported"].map(h => (
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
                {PAPERS.slice(0, 6).map((paper, i) => (
                  <tr
                    key={paper.id}
                    onClick={() => nav(`/papers/${paper.id}`)}
                    className="cursor-pointer group transition-colors"
                    style={{
                      borderBottom: i < 5 ? "0.5px solid rgba(255,255,255,0.04)" : "none",
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
                ))}
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
                  onClick={() => nav("papers")}
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
