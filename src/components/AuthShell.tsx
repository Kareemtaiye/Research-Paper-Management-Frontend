export const AuthShell = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0a0a0f",
      padding: "24px 16px",
    }}
  >
    <div
      style={{
        width: 400,
        background: "#111118",
        border: "0.5px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: 32,
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          justifyContent: "center",
        }}
      >
        <div
          className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "#6366f1" }}
        >
          <svg width="18" height="18" viewBox="0 0 14 14" fill="white">
            <path d="M2 2h4v4H2zM8 2h4v4H8zM2 8h4v4H2zM8 8l2 4h2L10 8z" />
          </svg>
        </div>
        <span style={{ fontSize: 14, fontWeight: 500, color: "#e2e8f0" }}>PaperBase</span>
      </div>

      {children}
    </div>
  </div>
);

export const AuthHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div style={{ textAlign: "center" }}>
    <div style={{ fontSize: 16, fontWeight: 500, color: "#e2e8f0" }}>{title}</div>
    {subtitle && (
      <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>{subtitle}</div>
    )}
  </div>
);

export const AuthField = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <label style={{ fontSize: 12, color: "#94a3b8" }}>{label}</label>
    {children}
  </div>
);

export const AuthInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    style={{
      background: "rgba(255,255,255,0.03)",
      border: "0.5px solid rgba(255,255,255,0.08)",
      borderRadius: 8,
      padding: "9px 12px",
      color: "#e2e8f0",
      fontSize: 13,
      outline: "none",
      width: "100%",
      ...props.style,
    }}
    onFocus={e => {
      e.target.style.borderColor = "rgba(99,102,241,0.5)";
      props.onFocus?.(e);
    }}
    onBlur={e => {
      e.target.style.borderColor = "rgba(255,255,255,0.08)";
      props.onBlur?.(e);
    }}
  />
);

export const AuthButton = ({
  children,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    disabled={disabled}
    style={{
      width: "100%",
      padding: "10px 0",
      borderRadius: 8,
      background: "#6366f1",
      border: "none",
      color: "#fff",
      fontSize: 13,
      fontWeight: 500,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      transition: "opacity .15s",
    }}
  >
    {children}
  </button>
);

export const SentState = ({
  title,
  description,
  action,
  onAction,
  icon = "✉",
  iconColor = "#818cf8",
}: {
  title: string;
  description: string;
  action: string;
  onAction: () => void;
  icon?: string;
  iconColor?: string;
}) => (
  <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 16 }}>
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: "50%",
        background: `${iconColor}18`,
        border: `0.5px solid ${iconColor}33`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 22,
        margin: "0 auto",
        color: iconColor,
      }}
    >
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 15, fontWeight: 500, color: "#e2e8f0" }}>{title}</div>
      <div style={{ fontSize: 13, color: "#475569", marginTop: 6, lineHeight: 1.6 }}>
        {description}
      </div>
    </div>
    <AuthButton onClick={onAction}>{action}</AuthButton>
  </div>
);

export const ErrorState = ({
  title,
  description,
  action,
  onAction,
  disabled,
}: {
  title: string;
  description: string;
  action: string;
  onAction: () => void;
  disabled?: boolean;
}) => (
  <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 16 }}>
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: "50%",
        background: "rgba(239,68,68,0.08)",
        border: "0.5px solid rgba(239,68,68,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 22,
        margin: "0 auto",
        color: "#f87171",
      }}
    >
      ✕
    </div>
    <div>
      <div style={{ fontSize: 15, fontWeight: 500, color: "#e2e8f0" }}>{title}</div>
      <div style={{ fontSize: 13, color: "#475569", marginTop: 6, lineHeight: 1.6 }}>
        {description}
      </div>
    </div>
    <AuthButton onClick={onAction} disabled={disabled}>
      {action}
    </AuthButton>
  </div>
);

export const Spinner = () => (
  <div
    style={{
      width: 32,
      height: 32,
      border: "2px solid rgba(255,255,255,0.08)",
      borderTopColor: "#6366f1",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
      margin: "0 auto",
    }}
  >
    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
  </div>
);
