import { Badge } from "@/components/Badge";
import Button from "@/components/Button";
import Divider from "@/components/Divider";
import { StatusChip } from "@/components/StatusChip";
import { Icon, IconSpin } from "@/ui/icons";
import { formatDate, formatTime } from "@/utils/utils";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Paper } from "@/types/Paper";
import { useAuth } from "@/context/AuthContext";

const BASE_API_URL = import.meta.env.VITE_API_URL;

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

function PaperDetails() {
  const [loading, setLoading] = useState<boolean>(false);
  const [paper, setPaper] = useState<Paper>({});
  const { token } = useAuth();

  const queryParams = useParams();
  const paperId = queryParams.id;

  //   const paper = PAPERS.find(p => p.id === paperId) || PAPERS[0];

  const [copied, setCopied] = useState(false);
  const copy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  async function fetchPaperDetails() {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_API_URL}/papers/${paperId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPaper(res.data.data);
    } catch (err: any) {
      console.log("Err:", err.response.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(function () {
    fetchPaperDetails();
  }, []);

  {
    if (loading)
      return (
        <div className="w-full h-full flex justify-center items-center">
          <span className={loading ? "animate-spin" : ""}>
            <IconSpin size={20} />
          </span>
        </div>
      );
  }

  return (
    <div>
      <div
        className="px-8 py-3 flex items-center gap-2 text-xs text-slate-600"
        style={{ borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}
      >
        <button
          onClick={() => ""}
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
          <div className="text-sm text-slate-500">{paper.authors?.join(", ")}</div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-1.5">
              {paper.categories?.map(c => (
                <Badge key={c}>{c}</Badge>
              ))}
            </div>
            <div className="h-3 w-px bg-white/10" />
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs text-slate-500">{paper.arxiv_id}</span>
              <button
                onClick={() => copy(paper.arxiv_id || "")}
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
                  value: `${formatDate(paper.created_at)} · ${formatTime(paper.created_at)}`,
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
                  value: `${paper.authors?.length} author${paper.authors?.length !== 1 ? "s" : ""}`,
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
}

export default PaperDetails;
