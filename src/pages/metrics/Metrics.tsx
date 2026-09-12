import PageHeader from "@/components/PageHeader";
import { useCallback, useState } from "react";
import Button from "@/components/Button";
import { Stat } from "@/components/Stat";
import { Icon } from "@/ui/icons";
import { ServiceChip } from "@/components/ServiceChip";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CustomTooltip } from "@/components/CustomTooltip";

const TIMELINE_DATA = Array.from({ length: 60 }, (_, i) => {
  const minutesAgo = 59 - i;
  let v: number;
  if (minutesAgo > 22 && minutesAgo < 32) {
    const center = 27;
    v =
      80 +
      Math.round(
        100 * Math.exp(-Math.pow(minutesAgo - center, 2) / 20) + (Math.random() * 10 - 5),
      );
  } else if (minutesAgo <= 10) {
    v = 130 + Math.round(Math.random() * 20 - 5);
  } else {
    v = 75 + Math.round(Math.random() * 18 - 9);
  }
  return {
    t:
      minutesAgo === 0
        ? "now"
        : minutesAgo === 59
          ? "60m"
          : minutesAgo % 15 === 0
            ? `${minutesAgo}m`
            : "",
    v: Math.max(10, v),
    minutesAgo,
  };
});

const ENDPOINT_DATA = [
  { endpoint: "GET /papers", count: 891, pct: 90 },
  { endpoint: "POST /import/arxiv", count: 342, pct: 35 },
  { endpoint: "GET /search", count: 276, pct: 28 },
  { endpoint: "POST /auth/login", count: 178, pct: 18 },
  { endpoint: "GET /tasks/{id}", count: 94, pct: 10 },
];

const SERVICES = [
  { name: "FastAPI app", icon: "", status: "Healthy", color: "green" },
  { name: "PostgreSQL", icon: "", status: "Healthy", color: "green" },
  { name: "Redis", icon: "", status: "Healthy", color: "green" },
  { name: "Resend (email)", icon: "", status: "Healthy", color: "green" },
  { name: "Celery workers", icon: "", status: "3 active", color: "green" },
  { name: "Nginx gateway", icon: "", status: "Healthy", color: "green" },
];

export function Metrics() {
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState("just now");

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setLastRefreshed("just now");
    }, 900);
  }, []);

  const maxCount = Math.max(...ENDPOINT_DATA.map(e => e.count));

  return (
    <div>
      <PageHeader
        title="Metrics"
        subtitle="Prometheus + Grafana observability layer"
        actions={
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-600">Updated {lastRefreshed}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <span className={refreshing ? "animate-spin" : ""}>
                <Icon.Refresh />
              </span>
              Refresh
            </Button>
          </div>
        }
      />

      <div className="px-8 py-6 space-y-5">
        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-3">
          <Stat label="Requests / min" value="142" dot="bg-green-400" sub="Normal" />
          <Stat label="P95 Latency" value="48ms" dot="bg-green-400" sub="Healthy" />
          <Stat
            label="Error Rate"
            value="0.3%"
            dot="bg-green-400"
            sub="Below threshold"
          />
          <Stat
            label="Active Workers"
            value="3"
            dot="bg-green-400"
            sub="Celery healthy"
          />
        </div>

        {/* Two-column row */}
        <div className="grid grid-cols-3 gap-4">
          {/* Endpoint bar chart */}
          <div
            className="col-span-2 rounded-lg border p-5"
            style={{
              backgroundColor: "#111118",
              borderColor: "rgba(255,255,255,0.06)",
              borderWidth: "0.5px",
            }}
          >
            <div className="text-xs font-medium text-slate-400 mb-5">
              Requests by endpoint
            </div>
            <div className="space-y-3">
              {ENDPOINT_DATA.map(({ endpoint, count, pct }) => (
                <div key={endpoint} className="flex items-center gap-3">
                  <div
                    className="text-xs text-slate-500 font-mono text-right flex-shrink-0"
                    style={{ width: 160 }}
                  >
                    {endpoint}
                  </div>
                  <div
                    className="flex-1 rounded-full overflow-hidden"
                    style={{ height: 6, backgroundColor: "rgba(255,255,255,0.05)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(count / maxCount) * 100}%`,
                        backgroundColor: "#6366f1",
                        opacity: 0.85 + (count / maxCount) * 0.15,
                      }}
                    />
                  </div>
                  <div
                    className="text-xs font-mono tabular-nums text-slate-500 text-right flex-shrink-0"
                    style={{ width: 48 }}
                  >
                    {count.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System health */}
          <div
            className="rounded-lg border p-5"
            style={{
              backgroundColor: "#111118",
              borderColor: "rgba(255,255,255,0.06)",
              borderWidth: "0.5px",
            }}
          >
            <div className="text-xs font-medium text-slate-400 mb-4">System health</div>
            <div className="space-y-2.5">
              {SERVICES.map(svc => (
                <div
                  key={svc.name}
                  className="flex items-center justify-between gap-3"
                  style={{
                    borderBottom: "0.5px solid rgba(255,255,255,0.04)",
                    paddingBottom: 10,
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="text-sm flex-shrink-0"
                      style={{ fontFamily: "system-ui" }}
                    >
                      {svc.icon}
                    </span>
                    <span className="text-xs text-slate-400 truncate">{svc.name}</span>
                  </div>
                  <ServiceChip status={svc.status} color={svc.color} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline chart */}
        <div
          className="rounded-lg border p-5"
          style={{
            backgroundColor: "#111118",
            borderColor: "rgba(255,255,255,0.06)",
            borderWidth: "0.5px",
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-xs font-medium text-slate-400">Request timeline</div>
              <div className="text-[11px] text-slate-600 mt-0.5">
                Requests per minute · last 60 minutes
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-0.5 rounded-full"
                style={{ backgroundColor: "#6366f1" }}
              />
              <span className="text-[11px] text-slate-600">req/min</span>
            </div>
          </div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={TIMELINE_DATA}
                margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
              >
                <CartesianGrid
                  horizontal={true}
                  vertical={false}
                  stroke="rgba(255,255,255,0.04)"
                  strokeDasharray="0"
                />
                <XAxis
                  dataKey="t"
                  tick={{
                    fill: "#475569",
                    fontSize: 10,
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                />
                <YAxis
                  domain={[0, 200]}
                  tick={{
                    fill: "#475569",
                    fontSize: 10,
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                  ticks={[0, 50, 100, 150, 200]}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }}
                />
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="#6366f1"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3, fill: "#6366f1", strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
