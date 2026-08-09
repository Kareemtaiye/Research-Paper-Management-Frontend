import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";

const API_BASE_URL = "http://localhost/api/v1";

// ─── Types ────────────────────────────────────────────────────────────────────

type Page =
  | "dashboard"
  | "papers"
  | "paper-detail"
  | "search"
  | "metrics"
  | "tasks"
  | "settings"
  | "login"
  | "register";

type PaperStatus = "imported" | "processing" | "pending" | "failed" | "queued";

type TaskStatus = "running" | "completed" | "failed" | "queued";

interface Paper {
  id: string;
  arxiv_id: string;
  title: string;
  authors: string[];
  abstract: string;
  categories: string[];
  status: PaperStatus;
  imported_at: string;
  updated_at: string;
  citation_count: number;
}

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

// ─── Mock Data ────────────────────────────────────────────────────────────────

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
    imported_at: "2024-01-15T09:23:11Z",
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
    imported_at: "2024-02-20T14:11:05Z",
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
    imported_at: "2024-03-08T07:55:22Z",
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
    imported_at: "2024-03-12T16:44:00Z",
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
    imported_at: "2024-04-05T11:22:18Z",
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
    imported_at: "2024-05-01T08:30:00Z",
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
    imported_at: "2024-05-14T13:07:45Z",
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
    imported_at: "2024-06-06T10:15:33Z",
    updated_at: "2024-06-06T10:48:22Z",
    citation_count: 198,
  },
];

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

// Recharts timeline data — 60 points (minutes ago)
const TIMELINE_DATA = Array.from({ length: 60 }, (_, i) => {
  const minutesAgo = 59 - i;
  let v: number;
  if (minutesAgo > 22 && minutesAgo < 32) {
    const center = 27;
    v =
      80 +
      Math.round(
        100 * Math.exp(-Math.pow(minutesAgo - center, 2) / 20) + (Math.random() * 10 - 5),
      );
  } else if (minutesAgo <= 10) {
    v = 130 + Math.round(Math.random() * 20 - 5);
  } else {
    v = 75 + Math.round(Math.random() * 18 - 9);
  }
  return {
    t:
      minutesAgo === 0
        ? "now"
        : minutesAgo === 59
          ? "60m"
          : minutesAgo % 15 === 0
            ? `${minutesAgo}m`
            : "",
    v: Math.max(10, v),
    minutesAgo,
  };
});

const ENDPOINT_DATA = [
  { endpoint: "GET /papers", count: 891, pct: 90 },
  { endpoint: "POST /import/arxiv", count: 342, pct: 35 },
  { endpoint: "GET /search", count: 276, pct: 28 },
  { endpoint: "POST /auth/login", count: 178, pct: 18 },
  { endpoint: "GET /tasks/{id}", count: 94, pct: 10 },
];

const SERVICES = [
  { name: "FastAPI app", icon: "⚡", status: "Healthy", color: "green" },
  { name: "PostgreSQL", icon: "🐘", status: "Healthy", color: "green" },
  { name: "Redis", icon: "⛃", status: "Healthy", color: "green" },
  { name: "Elasticsearch", icon: "🔍", status: "Healthy", color: "green" },
  { name: "Resend (email)", icon: "✉", status: "Healthy", color: "green" },
  { name: "Celery workers", icon: "⚙", status: "3 active", color: "green" },
  { name: "Nginx gateway", icon: "🌐", status: "Healthy", color: "green" },
];

// ─── Utilities ────────────────────────────────────────────────────────────────

function highlight(text: string, query: string): string {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(new RegExp(`(${escaped})`, "gi"), "<mark>$1</mark>");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function exportCSV(papers: Paper[]) {
  const headers = [
    "arxiv_id",
    "title",
    "authors",
    "categories",
    "status",
    "citation_count",
    "imported_at",
    "updated_at",
  ];
  const rows = papers.map(p => [
    p.arxiv_id,
    `"${p.title.replace(/"/g, '""')}"`,
    `"${p.authors.join("; ")}"`,
    `"${p.categories.join("; ")}"`,
    p.status,
    p.citation_count,
    p.imported_at,
    p.updated_at,
  ]);
  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `papers-export-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Design Atoms ─────────────────────────────────────────────────────────────

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

const TaskStatusChip = ({ status }: { status: TaskStatus }) => {
  const map: Record<TaskStatus, { label: string; color: string; dot: string }> = {
    running: {
      label: "Running",
      color: "text-blue-400 bg-blue-400/8 border-blue-400/20",
      dot: "bg-blue-400 ws-pulse",
    },
    completed: {
      label: "Completed",
      color: "text-green-400 bg-green-400/8 border-green-400/20",
      dot: "bg-green-400",
    },
    failed: {
      label: "Failed",
      color: "text-red-400 bg-red-400/8 border-red-400/20",
      dot: "bg-red-400",
    },
    queued: {
      label: "Queued",
      color: "text-slate-400 bg-slate-400/8 border-slate-400/20",
      dot: "bg-slate-400",
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

const ServiceChip = ({ status, color }: { status: string; color: string }) => (
  <span
    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border text-green-400 bg-green-400/8 border-green-400/20"
    style={{ borderWidth: "0.5px" }}
  >
    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
    {status}
  </span>
);

const Badge = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <span
    className={`inline-flex px-1.5 py-0.5 rounded text-xs font-mono text-slate-400 bg-white/4 border border-white/6 ${className}`}
    style={{ borderWidth: "0.5px" }}
  >
    {children}
  </span>
);

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
// ─── Layout Shell ─────────────────────────────────────────────────────────────

import { Outlet, useNavigate, useLocation } from "react-router-dom";

const Shell = () => {
  const [wsConnected, setWsConnected] = useState(true);
  const location = useLocation();

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#0a0a0f" }}>
      <Sidebar wsConnected={wsConnected} />
      <main className="flex-1 overflow-auto" style={{ marginLeft: 224 }}>
        <Outlet /> {/* renders the matched child route */}
      </main>
    </div>
  );
};

// ─── Page Header ──────────────────────────────────────────────────────────────

const PageHeader = ({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) => (
  <div
    className="px-8 py-5 flex items-center justify-between"
    style={{ borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}
  >
    <div>
      <h1 className="text-sm font-semibold text-slate-100">{title}</h1>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

// ─── Paper Detail Page ────────────────────────────────────────────────────────

const TIMELINE_EVENTS = [
  {
    ts: "09:23:11",
    event: "Import requested",
    detail: "ArXiv ID queued for processing",
    status: "done",
  },
  {
    ts: "09:23:14",
    event: "Metadata fetched",
    detail: "Title, authors, abstract retrieved from ArXiv API",
    status: "done",
  },
  {
    ts: "09:23:21",
    event: "PDF downloaded",
    detail: "1.4 MB · 24 pages · arxiv.pdf",
    status: "done",
  },
  {
    ts: "09:28:05",
    event: "Text extraction",
    detail: "pdfplumber extracted 18,432 tokens",
    status: "done",
  },
  {
    ts: "09:29:17",
    event: "Citation parsing",
    detail: "47 references identified and resolved",
    status: "done",
  },
  {
    ts: "09:31:44",
    event: "Indexed",
    detail: "Full-text index built · embedding stored in pgvector",
    status: "done",
  },
];

const PaperDetailPage = ({
  paperId,
  setPage,
}: {
  paperId: string;
  setPage: (p: Page) => void;
}) => {
  const paper = PAPERS.find(p => p.id === paperId) || PAPERS[0];
  const [copied, setCopied] = useState(false);
  const copy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div>
      <div
        className="px-8 py-3 flex items-center gap-2 text-xs text-slate-600"
        style={{ borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}
      >
        <button
          onClick={() => setPage("papers")}
          className="hover:text-slate-400 transition-colors cursor-pointer"
        >
          Papers
        </button>
        <Icon.ChevronRight />
        <span className="text-slate-500 font-mono">{paper.arxiv_id}</span>
      </div>
      <div className="px-8 py-6 max-w-4xl">
        <div className="space-y-3 mb-6">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-xl font-semibold text-slate-100 leading-snug">
              {paper.title}
            </h1>
            <StatusChip status={paper.status} />
          </div>
          <div className="text-sm text-slate-500">{paper.authors.join(", ")}</div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-1.5">
              {paper.categories.map(c => (
                <Badge key={c}>{c}</Badge>
              ))}
            </div>
            <div className="h-3 w-px bg-white/10" />
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs text-slate-500">{paper.arxiv_id}</span>
              <button
                onClick={() => copy(paper.arxiv_id)}
                className="text-slate-600 hover:text-slate-400 transition-colors cursor-pointer"
              >
                <Icon.Copy />
              </button>
              {copied && <span className="text-[10px] text-indigo-400">Copied</span>}
            </div>
            <div className="h-3 w-px bg-white/10" />
            <a
              href={`https://arxiv.org/abs/${paper.arxiv_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              arxiv.org <Icon.External />
            </a>
          </div>
        </div>
        <Divider />
        <div className="grid grid-cols-3 gap-6 mt-6">
          <div className="col-span-2 space-y-5">
            <div
              className="rounded-lg border p-5"
              style={{
                backgroundColor: "#111118",
                borderColor: "rgba(255,255,255,0.06)",
                borderWidth: "0.5px",
              }}
            >
              <div className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-3">
                Abstract
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{paper.abstract}</p>
            </div>
            <div
              className="rounded-lg border p-5"
              style={{
                backgroundColor: "#111118",
                borderColor: "rgba(255,255,255,0.06)",
                borderWidth: "0.5px",
              }}
            >
              <div className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-4">
                Import Timeline
              </div>
              {TIMELINE_EVENTS.map((ev, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center" style={{ minWidth: 16 }}>
                    <div
                      className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                      style={{
                        backgroundColor: "#22c55e",
                        boxShadow: "0 0 0 3px rgba(34,197,94,0.1)",
                      }}
                    />
                    {i < TIMELINE_EVENTS.length - 1 && (
                      <div
                        className="flex-1 w-px mt-1"
                        style={{
                          backgroundColor: "rgba(255,255,255,0.06)",
                          minHeight: 24,
                        }}
                      />
                    )}
                  </div>
                  <div className="pb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-slate-300 font-medium">
                        {ev.event}
                      </span>
                      <span className="font-mono text-[10px] text-slate-600">
                        {ev.ts}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{ev.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div
              className="rounded-lg border p-4 space-y-3"
              style={{
                backgroundColor: "#111118",
                borderColor: "rgba(255,255,255,0.06)",
                borderWidth: "0.5px",
              }}
            >
              <div className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
                Metadata
              </div>
              {[
                {
                  label: "Imported",
                  value: `${formatDate(paper.imported_at)} · ${formatTime(paper.imported_at)}`,
                },
                {
                  label: "Updated",
                  value: `${formatDate(paper.updated_at)} · ${formatTime(paper.updated_at)}`,
                },
                {
                  label: "Citations",
                  value:
                    paper.citation_count > 0
                      ? paper.citation_count.toLocaleString()
                      : "None indexed",
                },
                {
                  label: "Authors",
                  value: `${paper.authors.length} author${paper.authors.length !== 1 ? "s" : ""}`,
                },
              ].map(({ label, value }) => (
                <div key={label} className="space-y-0.5">
                  <div className="text-[11px] text-slate-600">{label}</div>
                  <div className="text-xs text-slate-400 font-mono">{value}</div>
                </div>
              ))}
            </div>
            <div
              className="rounded-lg border p-4 space-y-2"
              style={{
                backgroundColor: "#111118",
                borderColor: "rgba(255,255,255,0.06)",
                borderWidth: "0.5px",
              }}
            >
              <div className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-3">
                Actions
              </div>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Icon.Import />
                Re-import
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Icon.Search />
                Find similar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Search Page ──────────────────────────────────────────────────────────────

const SearchPage = ({
  setPage,
  setDetailId,
}: {
  setPage: (p: Page) => void;
  setDetailId: (id: string) => void;
}) => {
  const [query, setQuery] = useState("");
  const [inputVal, setInputVal] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return PAPERS.filter(
      p =>
        p.title.toLowerCase().includes(q) ||
        p.abstract.toLowerCase().includes(q) ||
        p.authors.some(a => a.toLowerCase().includes(q)) ||
        p.categories.some(c => c.toLowerCase().includes(q)),
    ).map(p => {
      let matchIn: string = "title";
      if (p.title.toLowerCase().includes(q)) matchIn = "title";
      else if (p.authors.some(a => a.toLowerCase().includes(q))) matchIn = "author";
      else if (p.categories.some(c => c.toLowerCase().includes(q))) matchIn = "category";
      else matchIn = "abstract";
      const snippetSrc = matchIn === "abstract" ? p.abstract : p.title;
      const idx = snippetSrc.toLowerCase().indexOf(q);
      const start = Math.max(0, idx - 80),
        end = Math.min(snippetSrc.length, idx + query.length + 120);
      const snippet =
        (start > 0 ? "…" : "") +
        snippetSrc.slice(start, end) +
        (end < snippetSrc.length ? "…" : "");
      return { paper: p, matchIn, snippet };
    });
  }, [query]);

  return (
    <div>
      <PageHeader title="Search" subtitle="Full-text search across all imported papers" />
      <div className="px-8 py-6">
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1 max-w-xl">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
              <Icon.Search />
            </div>
            <input
              ref={inputRef}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-md text-slate-200 placeholder-slate-600 outline-none transition-colors"
              style={{
                backgroundColor: "#111118",
                border: "0.5px solid rgba(255,255,255,0.08)",
              }}
              placeholder="Search titles, abstracts, authors…"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === "Enter" && setQuery(inputVal)}
            />
          </div>
          <Button onClick={() => setQuery(inputVal)}>Search</Button>
        </div>
        {query === "" ? (
          <div className="text-center py-20">
            <div className="text-sm text-slate-600">
              Enter a query to search {PAPERS.length} papers
            </div>
            <div className="text-xs text-slate-700 mt-1">
              Searches titles, abstracts, and authors
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-sm text-slate-600">
              No results for <span className="text-slate-400">"{query}"</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-xs text-slate-600 mb-4">
              {results.length} result{results.length !== 1 ? "s" : ""} for{" "}
              <span className="text-slate-400">"{query}"</span>
            </div>
            {results.map(({ paper, matchIn, snippet }) => (
              <div
                key={paper.id}
                onClick={() => {
                  setDetailId(paper.id);
                  setPage("paper-detail");
                }}
                className="rounded-lg border p-5 cursor-pointer group transition-all"
                style={{
                  backgroundColor: "#111118",
                  borderColor: "rgba(255,255,255,0.06)",
                  borderWidth: "0.5px",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "#141420";
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(99,102,241,0.2)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "#111118";
                  (e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(255,255,255,0.06)";
                }}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div
                    className="text-sm font-medium text-slate-200 leading-snug"
                    dangerouslySetInnerHTML={{ __html: highlight(paper.title, query) }}
                  />
                  <StatusChip status={paper.status} />
                </div>
                <div className="text-xs text-slate-500 mb-2 font-mono">
                  {paper.arxiv_id} · {paper.authors.slice(0, 2).join(", ")}
                  {paper.authors.length > 2 ? " et al." : ""}
                </div>
                <div
                  className="text-xs text-slate-500 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: highlight(snippet, query) }}
                />
                <div className="flex items-center gap-2 mt-3">
                  {paper.categories.map(c => (
                    <Badge key={c}>{c}</Badge>
                  ))}
                  <span className="ml-auto text-[10px] text-slate-600">
                    match in {matchIn}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Tasks Page ───────────────────────────────────────────────────────────────

const TASK_TYPE_LABELS: Record<Task["type"], string> = {
  import: "Import",
  index: "Index",
  citation: "Citations",
  embed: "Embed",
  pdf: "PDF",
};

const TasksPage = () => {
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
};

// ─── Metrics Page ─────────────────────────────────────────────────────────────

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value: number }[];
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-md px-3 py-2 text-xs font-mono"
      style={{
        backgroundColor: "#1a1a24",
        border: "0.5px solid rgba(255,255,255,0.1)",
        color: "#e2e8f0",
      }}
    >
      {payload[0].value} req/min
    </div>
  );
};

const MetricsPage = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState("just now");

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setLastRefreshed("just now");
    }, 900);
  }, []);

  const maxCount = Math.max(...ENDPOINT_DATA.map(e => e.count));

  return (
    <div>
      <PageHeader
        title="Metrics"
        subtitle="Prometheus + Grafana observability layer"
        actions={
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-600">Updated {lastRefreshed}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <span className={refreshing ? "animate-spin" : ""}>
                <Icon.Refresh />
              </span>
              Refresh
            </Button>
          </div>
        }
      />

      <div className="px-8 py-6 space-y-5">
        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-3">
          <Stat label="Requests / min" value="142" dot="bg-green-400" sub="Normal" />
          <Stat label="P95 Latency" value="48ms" dot="bg-green-400" sub="Healthy" />
          <Stat
            label="Error Rate"
            value="0.3%"
            dot="bg-green-400"
            sub="Below threshold"
          />
          <Stat
            label="Active Workers"
            value="3"
            dot="bg-green-400"
            sub="Celery healthy"
          />
        </div>

        {/* Two-column row */}
        <div className="grid grid-cols-3 gap-4">
          {/* Endpoint bar chart */}
          <div
            className="col-span-2 rounded-lg border p-5"
            style={{
              backgroundColor: "#111118",
              borderColor: "rgba(255,255,255,0.06)",
              borderWidth: "0.5px",
            }}
          >
            <div className="text-xs font-medium text-slate-400 mb-5">
              Requests by endpoint
            </div>
            <div className="space-y-3">
              {ENDPOINT_DATA.map(({ endpoint, count, pct }) => (
                <div key={endpoint} className="flex items-center gap-3">
                  <div
                    className="text-xs text-slate-500 font-mono text-right flex-shrink-0"
                    style={{ width: 160 }}
                  >
                    {endpoint}
                  </div>
                  <div
                    className="flex-1 rounded-full overflow-hidden"
                    style={{ height: 6, backgroundColor: "rgba(255,255,255,0.05)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(count / maxCount) * 100}%`,
                        backgroundColor: "#6366f1",
                        opacity: 0.85 + (count / maxCount) * 0.15,
                      }}
                    />
                  </div>
                  <div
                    className="text-xs font-mono tabular-nums text-slate-500 text-right flex-shrink-0"
                    style={{ width: 48 }}
                  >
                    {count.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System health */}
          <div
            className="rounded-lg border p-5"
            style={{
              backgroundColor: "#111118",
              borderColor: "rgba(255,255,255,0.06)",
              borderWidth: "0.5px",
            }}
          >
            <div className="text-xs font-medium text-slate-400 mb-4">System health</div>
            <div className="space-y-2.5">
              {SERVICES.map(svc => (
                <div
                  key={svc.name}
                  className="flex items-center justify-between gap-3"
                  style={{
                    borderBottom: "0.5px solid rgba(255,255,255,0.04)",
                    paddingBottom: 10,
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="text-sm flex-shrink-0"
                      style={{ fontFamily: "system-ui" }}
                    >
                      {svc.icon}
                    </span>
                    <span className="text-xs text-slate-400 truncate">{svc.name}</span>
                  </div>
                  <ServiceChip status={svc.status} color={svc.color} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline chart */}
        <div
          className="rounded-lg border p-5"
          style={{
            backgroundColor: "#111118",
            borderColor: "rgba(255,255,255,0.06)",
            borderWidth: "0.5px",
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-xs font-medium text-slate-400">Request timeline</div>
              <div className="text-[11px] text-slate-600 mt-0.5">
                Requests per minute · last 60 minutes
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-0.5 rounded-full"
                style={{ backgroundColor: "#6366f1" }}
              />
              <span className="text-[11px] text-slate-600">req/min</span>
            </div>
          </div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={TIMELINE_DATA}
                margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
              >
                <CartesianGrid
                  horizontal={true}
                  vertical={false}
                  stroke="rgba(255,255,255,0.04)"
                  strokeDasharray="0"
                />
                <XAxis
                  dataKey="t"
                  tick={{
                    fill: "#475569",
                    fontSize: 10,
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                />
                <YAxis
                  domain={[0, 200]}
                  tick={{
                    fill: "#475569",
                    fontSize: 10,
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                  ticks={[0, 50, 100, 150, 200]}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }}
                />
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="#6366f1"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3, fill: "#6366f1", strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Settings Page ────────────────────────────────────────────────────────────

const Toggle = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <button
    onClick={() => onChange(!checked)}
    className="relative rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0"
    style={{
      width: 32,
      height: 18,
      backgroundColor: checked ? "#6366f1" : "rgba(255,255,255,0.1)",
      border: "0.5px solid rgba(255,255,255,0.1)",
    }}
  >
    <span
      className="absolute top-0.5 rounded-full transition-transform duration-200"
      style={{
        width: 14,
        height: 14,
        backgroundColor: "white",
        transform: `translateX(${checked ? 15 : 1}px)`,
        opacity: checked ? 1 : 0.6,
      }}
    />
  </button>
);

const SectionCard = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <div
    className="rounded-lg border overflow-hidden"
    style={{
      backgroundColor: "#111118",
      borderColor: "rgba(255,255,255,0.06)",
      borderWidth: "0.5px",
    }}
  >
    <div
      className="px-5 py-4"
      style={{ borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}
    >
      <div className="text-sm font-medium text-slate-200">{title}</div>
      {subtitle && <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>}
    </div>
    <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
      {children}
    </div>
  </div>
);

const SettingRow = ({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <div className="px-5 py-4 flex items-center justify-between gap-6">
    <div>
      <div className="text-sm text-slate-300">{label}</div>
      {description && <div className="text-xs text-slate-600 mt-0.5">{description}</div>}
    </div>
    <div className="flex-shrink-0">{children}</div>
  </div>
);

const SettingsPage = () => {
  const [webhookEnabled, setWebhookEnabled] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(false);
  const [autoEmbed, setAutoEmbed] = useState(true);
  const [autoCite, setAutoCite] = useState(true);
  const [dedupe, setDedupe] = useState(true);
  const [wsReconnect, setWsReconnect] = useState(true);
  const [retentionDays, setRetentionDays] = useState("90");
  const [rateLimit, setRateLimit] = useState("60");
  const [apiKey] = useState("pb_live_k9x2mf…4a8c");
  const [keyCopied, setKeyCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  const copyKey = () => {
    navigator.clipboard.writeText("pb_live_k9x2mf_full_key_4a8c").catch(() => {});
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 1500);
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="API configuration, integrations, and preferences"
        actions={
          <Button variant="primary" size="sm" onClick={handleSave}>
            {saved ? "✓ Saved" : "Save changes"}
          </Button>
        }
      />
      <div className="px-8 py-6 max-w-2xl space-y-5">
        {/* API */}
        <SectionCard title="API" subtitle="Credentials and rate limiting">
          <SettingRow
            label="API Key"
            description="Use this key to authenticate requests to the PaperBase API"
          >
            <div className="flex items-center gap-2">
              <span
                className="font-mono text-xs text-slate-400 bg-white/4 px-2.5 py-1.5 rounded border"
                style={{ borderColor: "rgba(255,255,255,0.06)", borderWidth: "0.5px" }}
              >
                {apiKey}
              </span>
              <button
                onClick={copyKey}
                className="text-slate-600 hover:text-slate-400 transition-colors cursor-pointer p-1"
              >
                <Icon.Copy />
              </button>
              {keyCopied && <span className="text-[10px] text-indigo-400">Copied</span>}
            </div>
          </SettingRow>
          <SettingRow
            label="Rate limit"
            description="Maximum API requests per minute per key"
          >
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={rateLimit}
                onChange={e => setRateLimit(e.target.value)}
                className="w-16 text-center text-sm font-mono text-slate-200 rounded-md py-1 outline-none"
                style={{
                  backgroundColor: "rgba(255,255,255,0.06)",
                  border: "0.5px solid rgba(255,255,255,0.1)",
                }}
              />
              <span className="text-xs text-slate-600">req/min</span>
            </div>
          </SettingRow>
        </SectionCard>

        {/* Import */}
        <SectionCard
          title="Import pipeline"
          subtitle="Behavior when papers are imported via the API"
        >
          <SettingRow
            label="Auto-embed on import"
            description="Generate and store sentence embeddings in pgvector automatically"
          >
            <Toggle checked={autoEmbed} onChange={setAutoEmbed} />
          </SettingRow>
          <SettingRow
            label="Auto-parse citations"
            description="Extract and resolve references from PDF text"
          >
            <Toggle checked={autoCite} onChange={setAutoCite} />
          </SettingRow>
          <SettingRow
            label="Deduplicate by ArXiv ID"
            description="Skip import if the paper already exists in the database"
          >
            <Toggle checked={dedupe} onChange={setDedupe} />
          </SettingRow>
        </SectionCard>

        {/* Notifications */}
        <SectionCard
          title="Notifications"
          subtitle="Where to send import and error events"
        >
          <SettingRow
            label="Webhook on import complete"
            description="POST to your configured endpoint when a paper finishes importing"
          >
            <Toggle checked={webhookEnabled} onChange={setWebhookEnabled} />
          </SettingRow>
          {webhookEnabled && (
            <SettingRow label="Webhook URL" description="">
              <input
                type="url"
                placeholder="https://hooks.example.com/paperbase"
                className="text-sm text-slate-300 placeholder-slate-600 rounded-md px-3 py-1.5 outline-none"
                style={{
                  width: 260,
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "0.5px solid rgba(255,255,255,0.08)",
                }}
              />
            </SettingRow>
          )}
          <SettingRow
            label="Email on task failure"
            description="Send an email via Resend when a Celery task fails"
          >
            <Toggle checked={emailNotifs} onChange={setEmailNotifs} />
          </SettingRow>
        </SectionCard>

        {/* WebSocket */}
        <SectionCard title="WebSocket" subtitle="Real-time task status streaming">
          <SettingRow
            label="Auto-reconnect"
            description="Attempt to reconnect automatically if the WebSocket connection drops"
          >
            <Toggle checked={wsReconnect} onChange={setWsReconnect} />
          </SettingRow>
        </SectionCard>

        {/* Data */}
        <SectionCard title="Data retention" subtitle="Storage and cleanup policies">
          <SettingRow
            label="Task log retention"
            description="Delete completed task records older than this many days"
          >
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={retentionDays}
                onChange={e => setRetentionDays(e.target.value)}
                className="w-16 text-center text-sm font-mono text-slate-200 rounded-md py-1 outline-none"
                style={{
                  backgroundColor: "rgba(255,255,255,0.06)",
                  border: "0.5px solid rgba(255,255,255,0.1)",
                }}
              />
              <span className="text-xs text-slate-600">days</span>
            </div>
          </SettingRow>
          <div className="px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-red-400">Danger zone</div>
                <div className="text-xs text-slate-600 mt-0.5">
                  Permanently delete all papers and task history
                </div>
              </div>
              <button
                className="px-3 py-1.5 rounded text-xs font-medium cursor-pointer transition-colors text-red-400 border"
                style={{
                  borderColor: "rgba(239,68,68,0.2)",
                  borderWidth: "0.5px",
                  backgroundColor: "rgba(239,68,68,0.05)",
                }}
                onMouseEnter={e =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor =
                    "rgba(239,68,68,0.1)")
                }
                onMouseLeave={e =>
                  ((e.currentTarget as HTMLElement).style.backgroundColor =
                    "rgba(239,68,68,0.05)")
                }
              >
                Clear library
              </button>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

// ─── App Root ─────────────────────────────────────────────────────────────────

import { BrowserRouter, Route, Routes } from "react-router-dom";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/dashboard/Dashboard";
import Papers from "./pages/dashboard/Paper";
import Button from "./components/Button";
import { Icon } from "./ui/icons";
import Input from "./components/Input";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/login" element={<AuthPage mode="login" />} /> */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Shell />}>
          <Route index path="dashboard" element={<Dashboard />} />
          <Route path="papers" element={<Papers />} />
          {/*
          <Route path="papers" element={<PapersPage />} />
          <Route path="papers/:id" element={<PaperDetailPage />} />
          <Route path="search" element={<SearchPage />} /> */}
          <Route path="tasks" element={<TasksPage />} />
          <Route path="metrics" element={<MetricsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
