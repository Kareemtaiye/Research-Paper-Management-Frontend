import Sidebar from "@/components/Sidebar";
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

export function Shell() {
  const [wsConnected, setWsConnected] = useState(true);
  const location = useLocation();

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#0a0a0f" }}>
      <Sidebar wsConnected={wsConnected} />
      <main className="flex-1 overflow-auto" style={{ marginLeft: 224 }}>
        <Outlet /> {/* renders the matched child route */}
      </main>
    </div>
  );
}
