export interface Paper {
  id: string;
  owner_id?: string;
  title: string | null;
  content?: string | null; // notes field
  arxiv_url?: string | null;
  arxiv_id: string | null;
  authors: string[] | null;
  abstract: string | null;
  published_at?: string | null;
  categories: string[] | null;
  status: "pending" | "processing" | "completed" | "failed" | "queued";
  task_id?: string | null;
  progress?: number | null; // if you added this
  stage?: string | null; // if you added this
  stage_message?: string | null; // if you added this
  created_at: string;
  updated_at: string;
}

export type PaperStatus = "completed" | "processing" | "pending" | "failed" | "queued";
