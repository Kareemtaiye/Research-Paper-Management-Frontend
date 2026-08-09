export function Stat({
  label,
  value,
  sub,
  dot,
}: {
  label: string;
  value: string | number;
  sub?: string;
  dot?: string;
}) {
  return (
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
}
