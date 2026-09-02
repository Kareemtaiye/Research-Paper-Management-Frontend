import { useState } from "react";

export const Section = ({
  title,
  subtitle,
  children,
  danger = false,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  danger?: boolean;
}) => (
  <div
    className="rounded-lg p-5 space-y-4"
    style={{
      background: "#111118",
      border: `0.5px solid ${danger ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)"}`,
    }}
  >
    <div>
      <h2 className={`text-sm font-medium ${danger ? "text-red-400" : "text-slate-200"}`}>
        {title}
      </h2>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
);

export const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <label className="text-xs text-slate-400">{label}</label>
    {children}
  </div>
);

export const Toggle = ({
  label,
  description,
  defaultChecked,
}: {
  label: string;
  description: string;
  defaultChecked?: boolean;
}) => {
  const [checked, setChecked] = useState<boolean>(defaultChecked ?? false);
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-sm text-slate-300">{label}</div>
        <div className="text-xs text-slate-500 mt-0.5">{description}</div>
      </div>
      <button
        onClick={() => setChecked(c => !c)}
        className="relative flex-shrink-0 w-9 h-5 rounded-full transition-colors cursor-pointer"
        style={{
          background: checked ? "#6366f1" : "rgba(255,255,255,0.08)",
          border: "0.5px solid rgba(255,255,255,0.1)",
        }}
      >
        <span
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
          style={{ transform: checked ? "translateX(16px)" : "translateX(2px)" }}
        />
      </button>
    </div>
  );
};

export const DangerAction = ({
  label,
  description,
  buttonLabel,
  onClick,
}: {
  label: string;
  description: string;
  buttonLabel: string;
  onClick: () => void;
}) => (
  <div className="flex items-center justify-between gap-4">
    <div>
      <div className="text-sm text-slate-300">{label}</div>
      <div className="text-xs text-slate-500 mt-0.5">{description}</div>
    </div>
    <button
      onClick={onClick}
      className="text-xs px-3 py-1.5 rounded text-red-400 transition-colors flex-shrink-0 cursor-pointer"
      style={{
        background: "rgba(239,68,68,0.08)",
        border: "0.5px solid rgba(239,68,68,0.2)",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.15)")}
      onMouseLeave={e => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
    >
      {buttonLabel}
    </button>
  </div>
);
