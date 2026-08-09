import { Badge } from "@/components/Badge";
import Button from "@/components/Button";
import Divider from "@/components/Divider";
import { StatusChip } from "@/components/StatusChip";
import { Icon } from "@/ui/icons";
import { formatDate, formatTime } from "@/utils/utils";
import { useState } from "react";
import { useParams } from "react-router-dom";

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
  const queryParams = useParams();
  const paperId = queryParams.id;

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
}

export default PaperDetails;
