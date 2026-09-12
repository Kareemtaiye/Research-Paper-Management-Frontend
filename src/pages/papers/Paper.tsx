import { Badge } from "@/components/Badge";
import Button from "@/components/Button";
import Input from "@/components/Input";
import PageHeader from "@/components/PageHeader";
import { StatusChip } from "@/components/StatusChip";
import { usePapers } from "@/context/PapersContext";
import { PaperStatus } from "@/types/Paper";
import { Icon, IconSpin } from "@/ui/icons";
import { exportCSV, formatDate } from "@/utils/utils";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function Papers() {
  const { loading, fetchAllPapers, updatePaper, papers } = usePapers();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaperStatus | "all">("all");
  const [catFilter, setCatFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"created_at" | "citation_count" | "title">(
    "created_at",
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [exporting, setExporting] = useState(false);
  const nav = useNavigate();

  const [page, setPage] = useState(1);
  const PER_PAGE = 6;

  useEffect(function () {
    fetchAllPapers();
  }, []);

  const statuses: (PaperStatus | "all")[] = [
    "all",
    "completed",
    "processing",
    "pending",
    "queued",
    "failed",
  ];
  const allCats = [
    "all",
    ...Array.from(new Set(papers.flatMap(p => p.categories))).sort(),
  ];

  const filtered = useMemo(() => {
    let res = papers;
    if (search) {
      const q = search.toLowerCase();
      res = res.filter(
        p =>
          p.title?.toLowerCase().includes(q) ||
          p.authors?.some(a => a.toLowerCase().includes(q)) ||
          p.arxiv_id?.includes(q),
      );
    }

    if (statusFilter !== "all") res = res.filter(p => p.status === statusFilter);
    if (catFilter !== "all") res = res.filter(p => p.categories?.includes(catFilter));
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
  }, [papers, search, statusFilter, catFilter, sortBy, sortDir]);

  // Compute pagination locally
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, catFilter]);

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

  return (
    <div>
      <PageHeader
        title="Papers"
        subtitle={`${filtered.length} of ${papers.length} papers`}
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
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value as PaperStatus | "all");
              setPage(1);
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
              setPage(1);
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
                  onClick={() => toggleSort("created_at")}
                >
                  Imported <SortIcon col="created_at" />
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  {/* FIX: colSpan changed from 4 to 8 to cover all headings */}
                  <td
                    colSpan={8}
                    className={`px-5 py-6 text-center text-xs text-slate-600 ${loading ? "h-28 relative" : ""}`}
                  >
                    <p className={loading ? "absolute bottom-[25%] left-[44%]" : ""}>
                      Loading papers...
                    </p>
                    <span
                      className={
                        loading
                          ? "animate-spin text-white absolute bottom-[50%] left-[46%]"
                          : ""
                      }
                    >
                      <IconSpin size={20} />
                    </span>
                  </td>
                </tr>
              ) : paged.length === 0 ? (
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
                    onClick={() => nav(`/papers/${paper.id}`)}
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
                        {paper.authors?.slice(0, 2).join(", ")}
                        {paper.authors?.length > 2 ? " et al." : ""}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1">
                        {paper.categories?.slice(0, 2).map(c => (
                          <Badge key={c}>{c}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusChip status={paper.status} />
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 font-mono tabular-nums">
                      —
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">
                      {formatDate(paper.created_at)}
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
                {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)}{" "}
                of {filtered.length}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  ←
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <Button
                    key={n}
                    variant={n === page ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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
