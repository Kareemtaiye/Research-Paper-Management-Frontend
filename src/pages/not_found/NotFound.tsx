// src/pages/NotFoundPage.tsx
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const nav = useNavigate();

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#0a0a0f" }}
    >
      <div className="text-center space-y-4">
        <div className="text-6xl font-mono text-slate-700">404</div>
        <div className="text-sm font-medium text-slate-300">Page not found</div>
        <div className="text-xs text-slate-500">
          The page you're looking for doesn't exist.
        </div>
        <button
          onClick={() => nav("/")}
          className="text-xs px-4 py-2 rounded text-white mt-2"
          style={{ background: "#6366f1" }}
        >
          Back to dashboard
        </button>
      </div>
    </div>
  );
}
