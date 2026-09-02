export const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value: number }[];
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-md px-3 py-2 text-xs font-mono"
      style={{
        backgroundColor: "#1a1a24",
        border: "0.5px solid rgba(255,255,255,0.1)",
        color: "#e2e8f0",
      }}
    >
      {payload[0].value} req/min
    </div>
  );
};
