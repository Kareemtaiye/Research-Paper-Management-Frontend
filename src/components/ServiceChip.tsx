export function ServiceChip({ status, color }: { status: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border text-green-400 bg-green-400/8 border-green-400/20"
      style={{ borderWidth: "0.5px" }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
      {status}
    </span>
  );
}
