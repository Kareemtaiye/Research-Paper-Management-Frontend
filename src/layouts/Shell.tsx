// src/components/layout/Shell.tsx
import { Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { TasksProvider } from "@/context/TasksContext";
// import { PapersProvider } from "@/context/PapersContext";
import Sidebar from "@/components/Sidebar";
import { PapersProvider } from "@/context/PapersContext";
import { FeedbackWidget } from "@/components/FeedbackWidget";

const Shell = () => {
  const { user, token, logout } = useAuth();

  return (
    <PapersProvider token={token}>
      <TasksProvider token={token} userId={user?.id ?? null}>
        <div className="flex min-h-screen" style={{ background: "#0a0a0f" }}>
          <Sidebar user={user} onLogout={logout} />
          <main className="flex-1 overflow-auto" style={{ marginLeft: 224 }}>
            <Outlet />
          </main>
          <FeedbackWidget />
        </div>
      </TasksProvider>
    </PapersProvider>
  );
};

export default Shell;
