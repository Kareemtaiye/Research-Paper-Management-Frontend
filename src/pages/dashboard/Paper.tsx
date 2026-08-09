import Button from "@/components/Button";
import Input from "@/components/Input";
import { Icon } from "@/ui/icons";
import { useMemo, useState } from "react";

const PAPERS = [
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

function Papers() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaperStatus | "all">("all");
  const [catFilter, setCatFilter] = useState("all");
  const [page, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"imported_at" | "citation_count" | "title">(
    "imported_at",
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [exporting, setExporting] = useState(false);
  const perPage = 5;

  type PaperStatus = "imported" | "processing" | "pending" | "failed" | "queued";

  const statuses: (PaperStatus | "all")[] = [
    "all",
    "imported",
    "processing",
    "pending",
    "queued",
    "failed",
  ];
  const allCats = [
    "all",
    ...Array.from(new Set(PAPERS.flatMap(p => p.categories))).sort(),
  ];

  const filtered = useMemo(() => {
    let res = PAPERS;
    if (search) {
      const q = search.toLowerCase();
      res = res.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.authors.some(a => a.toLowerCase().includes(q)) ||
          p.arxiv_id.includes(q),
      );
    }
    if (statusFilter !== "all") res = res.filter(p => p.status === statusFilter);
    if (catFilter !== "all") res = res.filter(p => p.categories.includes(catFilter));
    return [...res].sort((a, b) => {
      const av =
        sortBy === "title"
          ? a[sortBy]
          : sortBy === "citation_count"
            ? a[sortBy]
            : new Date(a[sortBy]).getTime();
      const bv =
        sortBy === "title"
          ? b[sortBy]
          : sortBy === "citation_count"
            ? b[sortBy]
            : new Date(b[sortBy]).getTime();
      if (typeof av === "string" && typeof bv === "string")
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === "asc"
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number);
    });
  }, [search, statusFilter, catFilter, sortBy, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(col);
      setSortDir("desc");
    }
  };
  const SortIcon = ({ col }: { col: typeof sortBy }) => (
    <span className="ml-0.5 opacity-40">
      {sortBy === col ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
    </span>
  );

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      exportCSV(filtered);
      setExporting(false);
    }, 400);
  };

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

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div>
      <PageHeader
        title="Papers"
        subtitle={`${filtered.length} of ${PAPERS.length} papers`}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={exporting || filtered.length === 0}
          >
            {exporting ? (
              <span className="w-3 h-3 rounded-full border border-white/30 border-t-white animate-spin" />
            ) : (
              <Icon.Download />
            )}
            Export CSV
          </Button>
        }
      />
      <div className="px-8 py-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
              <Icon.Search />
            </div>
            <Input
              placeholder="Search papers…"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value as PaperStatus | "all");
              setCurrentPage(1);
            }}
            className="text-sm rounded-md px-3 py-2 text-slate-300 outline-none cursor-pointer"
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              border: "0.5px solid rgba(255,255,255,0.08)",
            }}
          >
            {statuses.map(s => (
              <option key={s} value={s} style={{ backgroundColor: "#1a1a24" }}>
                {s === "all" ? "All statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={catFilter}
            onChange={e => {
              setCatFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-sm rounded-md px-3 py-2 text-slate-300 outline-none cursor-pointer"
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              border: "0.5px solid rgba(255,255,255,0.08)",
            }}
          >
            {allCats.map(c => (
              <option key={c} value={c} style={{ backgroundColor: "#1a1a24" }}>
                {c === "all" ? "All categories" : c}
              </option>
            ))}
          </select>
          <span className="text-xs text-slate-600 ml-1">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

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
                <th className="px-5 py-3 text-left text-[10px] font-medium text-slate-600 uppercase tracking-wider">
                  ArXiv ID
                </th>
                <th
                  className="px-5 py-3 text-left text-[10px] font-medium text-slate-600 uppercase tracking-wider cursor-pointer hover:text-slate-400"
                  onClick={() => toggleSort("title")}
                >
                  Title <SortIcon col="title" />
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-medium text-slate-600 uppercase tracking-wider">
                  Authors
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-medium text-slate-600 uppercase tracking-wider">
                  Categories
                </th>
                <th className="px-5 py-3 text-left text-[10px] font-medium text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th
                  className="px-5 py-3 text-left text-[10px] font-medium text-slate-600 uppercase tracking-wider cursor-pointer hover:text-slate-400"
                  onClick={() => toggleSort("citation_count")}
                >
                  Citations <SortIcon col="citation_count" />
                </th>
                <th
                  className="px-5 py-3 text-left text-[10px] font-medium text-slate-600 uppercase tracking-wider cursor-pointer hover:text-slate-400"
                  onClick={() => toggleSort("imported_at")}
                >
                  Imported <SortIcon col="imported_at" />
                </th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-sm text-slate-600"
                  >
                    No papers match your filters.
                  </td>
                </tr>
              ) : (
                paged.map((paper, i) => (
                  <tr
                    key={paper.id}
                    onClick={() => {
                      //   setDetailId(paper.id);
                      //   setPage("paper-detail");
                    }}
                    className="cursor-pointer group transition-colors"
                    style={{
                      borderBottom:
                        i < paged.length - 1
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
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-slate-500">
                        {paper.arxiv_id}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 max-w-[240px]">
                      <div className="text-sm text-slate-300 line-clamp-1 group-hover:text-slate-100 transition-colors">
                        {paper.title}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 max-w-[150px]">
                      <div className="text-xs text-slate-500 line-clamp-1">
                        {paper.authors.slice(0, 2).join(", ")}
                        {paper.authors.length > 2 ? " et al." : ""}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1">
                        {paper.categories.slice(0, 2).map(c => (
                          <Badge key={c}>{c}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusChip status={paper.status} />
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 font-mono tabular-nums">
                      {paper.citation_count > 0
                        ? paper.citation_count.toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">
                      {formatDate(paper.imported_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div
              className="px-5 py-3 flex items-center justify-between"
              style={{
                borderTop: "0.5px solid rgba(255,255,255,0.06)",
                backgroundColor: "rgba(255,255,255,0.01)",
              }}
            >
              <span className="text-xs text-slate-600">
                {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of{" "}
                {filtered.length}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  ←
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <Button
                    key={n}
                    variant={n === page ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(n)}
                  >
                    {n}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  →
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Papers;
