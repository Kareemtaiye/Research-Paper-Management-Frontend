type TaskStatus = "processing" | "completed" | "failed" | "queued";

export function TaskStatusChip({ status }: { status: TaskStatus }) {
  const map: Record<TaskStatus, { label: string; color: string; dot: string }> = {
    processing: {
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
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${map[status]?.color || ""}`}
      style={{ borderWidth: "0.5px" }}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${map[status]?.dot || ""}`} />
      {map[status]?.label || "-"}
    </span>
  );
}
