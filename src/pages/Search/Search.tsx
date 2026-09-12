// src/pages/SearchPage.tsx
import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/context/ToastContext"
import { toastApiError } from "@/utils/apiError"
import axios from "axios"
import Button from "@/components/Button"
import { Icon } from "@/ui/icons"
import PageHeader from "@/components/PageHeader"

const BASE_API_URL = import.meta.env.VITE_API_URL

interface SearchResult {
  id: string
  title: string
  arxiv_id: string
  authors: string[]
  categories: string[]
  status: string
  title_headline: string
  abstract_headline: string
}

function highlight(text: string, query: string) {
  if (!query.trim()) return text
  const re = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi",
  )
  return text.replace(
    re,
    '<mark class="bg-indigo-500/20 text-indigo-300 rounded px-0.5">$1</mark>',
  )
}

export default function Search() {
  const [inputVal, setInputVal] = useState("")
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { token } = useAuth()
  const { toast } = useToast()
  const nav = useNavigate()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  async function doSearch(q: string) {
    if (!q.trim()) return
    setQuery(q)
    setLoading(true)
    setSearched(true)
    try {
      const res = await axios.get(`${BASE_API_URL}/papers/search`, {
        params: { q, limit: 20 },
        headers: { Authorization: `Bearer ${token}` },
      })
      setResults(res.data.data.data)
      setTotal(res.data.data.total)

      console.log(results)
    } catch (err) {
      toastApiError(err, toast)
      setResults([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const Badge = ({ children }: { children: React.ReactNode }) => (
    <span
      className="inline-flex px-1.5 py-0.5 rounded text-xs font-mono text-slate-400"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "0.5px solid rgba(255,255,255,0.06)",
      }}
    >
      {children}
    </span>
  )

  const getMatchLocations = (result: SearchResult): string[] => {
    const locs: string[] = []
    if (result.title_headline?.includes("<mark>")) locs.push("title")
    if (result.abstract_headline?.includes("<mark>")) locs.push("abstract")
    return locs
  }

  return (
    <div>
      <PageHeader
        title="Search"
        subtitle="Full-text search across all imported papers"
      />

      <div className="px-8 py-6">
        {/* Search input */}
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
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doSearch(inputVal)}
            />
          </div>
          <Button onClick={() => doSearch(inputVal)} disabled={loading}>
            {loading ? "Searching…" : "Search"}
          </Button>
        </div>

        {/* Initial state */}
        {!searched && (
          <div className="text-center py-20">
            <div className="text-sm text-slate-600">
              Enter a query to search your papers
            </div>
            <div className="text-xs text-slate-700 mt-1">
              Searches titles, abstracts, and authors
            </div>
          </div>
        )}

        {/* No results */}
        {searched && !loading && results.length === 0 && (
          <div className="text-center py-20">
            <div className="text-sm text-slate-600">
              No results for <span className="text-slate-400">"{query}"</span>
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-slate-600 mb-4">
              {total} result{total !== 1 ? "s" : ""} for{" "}
              <span className="text-slate-400">"{query}"</span>
            </div>

            {results.map((result) => (
              <div
                key={result.id}
                onClick={() => nav(`/papers/${result.id}`)}
                className="rounded-lg border p-5 cursor-pointer transition-all"
                style={{
                  backgroundColor: "#111118",
                  borderColor: "rgba(255,255,255,0.06)",
                  borderWidth: "0.5px",
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLElement).style.backgroundColor =
                    "#141420"
                  ;(e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(99,102,241,0.2)"
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLElement).style.backgroundColor =
                    "#111118"
                  ;(e.currentTarget as HTMLElement).style.borderColor =
                    "rgba(255,255,255,0.06)"
                }}
              >
                {/* Title */}
                <div
                  className="text-sm font-medium text-slate-200 leading-snug mb-2"
                  dangerouslySetInnerHTML={{
                    __html: highlight(
                      result.title_headline || result.title,
                      query,
                    ),
                  }}
                />

                {/* Meta */}
                <div className="text-xs text-slate-500 mb-2 font-mono">
                  {result.arxiv_id} · {result.authors?.slice(0, 2).join(", ")}
                  {result.authors?.length > 2 ? " et al." : ""}
                </div>

                {/* Abstract snippet */}
                {result.abstract_headline && (
                  <div
                    className="text-xs text-slate-500 leading-relaxed mb-3"
                    dangerouslySetInnerHTML={{
                      __html: highlight(result.abstract_headline, query),
                    }}
                  />
                )}

                {/* Categories + match location */}
                <div className="flex items-center gap-2 flex-wrap">
                  {result.categories
                    ?.slice(0, 3)
                    .map((c) => <Badge key={c}>{c}</Badge>)}
                  <span className="ml-auto text-[10px] text-slate-600">
                    {getMatchLocations(result).map((loc) => (
                      <span key={loc} className="ml-1">
                        match in {loc}
                      </span>
                    ))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
