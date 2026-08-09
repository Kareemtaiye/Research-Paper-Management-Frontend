import React from "react";

function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div
      className="px-8 py-5 flex items-center justify-between"
      style={{ borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}
    >
      <div>
        <h1 className="text-sm font-semibold text-slate-100">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export default PageHeader;
