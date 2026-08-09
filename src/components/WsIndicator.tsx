import { Icon } from "@/ui/icons";

function WsIndicator({ connected }: { connected: boolean }) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-md"
      style={{
        backgroundColor: connected ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)",
      }}
    >
      <Icon.WS />
      <span className="text-xs text-slate-500">WebSocket</span>
      <span
        className={`w-1.5 h-1.5 rounded-full ml-auto ws-pulse ${connected ? "bg-green-400" : "bg-red-400"}`}
      />
    </div>
  );
}

export default WsIndicator;
