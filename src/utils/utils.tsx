export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function highlight(text: string, query: string): string {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(new RegExp(`(${escaped})`, "gi"), "<mark>$1</mark>");
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function exportCSV(papers: Paper[]) {
  const headers = [
    "arxiv_id",
    "title",
    "authors",
    "categories",
    "status",
    "citation_count",
    "created_at",
    "updated_at",
  ];
  const rows = papers.map(p => [
    p.arxiv_id,
    `"${p.title.replace(/"/g, '""')}"`,
    `"${p.authors.join("; ")}"`,
    `"${p.categories.join("; ")}"`,
    p.status,
    p.citation_count,
    p.created_at,
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
