import { BrowserRouter, Route, Routes } from "react-router-dom";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Papers from "./pages/papers/Paper";
import Shell from "@/layouts/Shell";
import PaperDetails from "./pages/papers/PaperDetails";
import { Tasks } from "./pages/tasks/Task";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

import Settings from "./pages/settings/Settings";
import { Metrics } from "./pages/metrics/Metrics";
import Search from "./pages/Search/Search";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Shell />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="papers" element={<Papers />} />
            <Route path="papers/:id" element={<PaperDetails />} />
            {/* fghj */}
            <Route path="search" element={<Search />} />
            {/* fghj */}
            <Route path="tasks" element={<Tasks />} />
            <Route path="settings" element={<Settings />} />
            <Route path="metrics" element={<Metrics />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
