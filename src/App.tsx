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
import { ErrorBoundary } from "./components/ErrorBoundary";
import NotFound from "./pages/not_found/NotFound";
import { ToastProvider } from "./context/ToastContext";

import ForgotPassword from "@/pages/auth/ForgetPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import VerifyEmail from "@/pages/auth/VerifyEmail";

export default function App() {
  return (
    <BrowserRouter basename="/rpm">
      <ErrorBoundary>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
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
                <Route path="search" element={<Search />} />
                <Route path="tasks" element={<Tasks />} />
                {/* <Route path="settings" element={<Settings />} /> */}
                <Route path="settings" element={<Settings />} />
                <Route path="metrics" element={<Metrics />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
