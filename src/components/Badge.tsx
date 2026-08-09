export function Badge({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex px-1.5 py-0.5 rounded text-xs font-mono text-slate-400 bg-white/4 border border-white/6 ${className}`}
      style={{ borderWidth: "0.5px" }}
    >
      {children}
    </span>
  );
}
