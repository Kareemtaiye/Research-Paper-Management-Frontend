import Divider from "@/components/Divider";
import Button from "@/components/Button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Input from "@/components/Input";
import { useAuth } from "@/context/AuthContext";

function Login() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const nav = useNavigate();

  // type UserLoginData = {
  //   email: string;
  //   created_at: string;
  //   id: string;
  //   role: string;
  // };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("All fields are required.");
      return;
    }

    try {
      const res = await login(email, password);
      // LoginUser = res;
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#0a0a0f" }}
    >
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div
            className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "#6366f1" }}
          >
            <svg width="18" height="18" viewBox="0 0 14 14" fill="white">
              <path d="M2 2h4v4H2zM8 2h4v4H8zM2 8h4v4H2zM8 8l2 4h2L10 8z" />
            </svg>
          </div>
          <span className="text-base font-semibold text-slate-100">PaperBase</span>
        </div>

        <div
          className="rounded-xl border p-8 space-y-5"
          style={{
            backgroundColor: "#111118",
            borderColor: "rgba(255,255,255,0.06)",
            borderWidth: "0.5px",
          }}
        >
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              Sign in to your account
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Welcome back. Enter your credentials to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">Email address</label>
              <Input
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-slate-500">Password</label>
                <button
                  type="button"
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <div
                className="text-xs text-red-400 bg-red-400/8 border border-red-400/15 rounded-md px-3 py-2"
                style={{ borderWidth: "0.5px" }}
              >
                {error}
              </div>
            )}
            <Button variant="primary" className="w-full mt-1" disabled={loading}>
              {loading ? (
                <>
                  <span className="w-3 h-3 rounded-full border border-white/30 border-t-white animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <Divider />

          <p className="text-xs text-center text-slate-600">
            Don't have an account?{" "}
            <button
              onClick={() => nav("/register")}
              className="text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
            >
              Sign up
            </button>
          </p>
        </div>

        <p className="text-center text-[11px] text-slate-700 mt-5">
          PaperBase v2.4.1 · Research Paper Management API
        </p>
      </div>
    </div>
  );
}

export default Login;
