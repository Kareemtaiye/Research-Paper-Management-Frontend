// src/components/ErrorBoundary.tsx
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: "#0a0a0f" }}
        >
          <div className="text-center space-y-4 max-w-md px-6">
            <div className="text-4xl font-mono text-slate-600">500</div>
            <div className="text-sm font-medium text-slate-300">Something went wrong</div>
            <div
              className="text-xs text-slate-500 font-mono"
              style={{ wordBreak: "break-all" }}
            >
              {this.state.error?.message}
            </div>
            <button
              onClick={() => (window.location.href = "/")}
              className="text-xs px-4 py-2 rounded text-white"
              style={{ background: "#6366f1" }}
            >
              Back to dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
