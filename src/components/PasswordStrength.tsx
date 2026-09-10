export const PasswordStrength = ({ password }: { password: string }) => {
  if (!password) return null;

  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
    { label: "Special character", pass: /[^A-Za-z0-9]/.test(password) },
  ];

  const score = checks.filter(c => c.pass).length;
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][score];
  const strengthColor = ["", "#f87171", "#fbbf24", "#818cf8", "#4ade80"][score];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {/* Bar */}
      <div style={{ display: "flex", gap: 4 }}>
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background: i <= score ? strengthColor : "rgba(255,255,255,0.06)",
              transition: "background .2s",
            }}
          />
        ))}
      </div>

      {/* Checks */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px" }}>
        {checks.map(c => (
          <span
            key={c.label}
            style={{
              fontSize: 11,
              color: c.pass ? "#4ade80" : "#475569",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span>{c.pass ? "✓" : "○"}</span>
            {c.label}
          </span>
        ))}
      </div>

      {password.length >= 3 && (
        <span style={{ fontSize: 11, color: strengthColor }}>{strengthLabel}</span>
      )}
    </div>
  );
};
