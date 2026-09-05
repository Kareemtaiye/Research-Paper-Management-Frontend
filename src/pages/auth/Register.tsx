import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Divider from "@/components/Divider";
import { useToast } from "@/context/ToastContext";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const nav = useNavigate();

  type UserRegData = {
    email: string;
    created_at: string;
    id: string;
    role: string;
  };

  let registeredUser: UserRegData;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !password) {
      toast("All fields are required.", "warning");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API_BASE_URL}/auth/register`, {
        email,
        password,
      });

      console.log(res.data.data);
      registeredUser = res.data.data;
      console.log(registeredUser);
      toast("Registration successful", "success");
      nav("/dashboard");
    } catch (err: any) {
      if (err.code === "ERR_NETWORK") {
        toast("You don't have internet connection", "error");
      }

      if (err.response) {
        toast(
          err?.response.data.message ||
            "An error occured, try reloading the page and try again",
          "error",
        );
      }

      if (err.response.data.code === 500) {
        toast("Something went wrong, please try again later", "error");
      }
    } finally {
      setLoading(false);
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
            <h2 className="text-base font-semibold text-slate-100">Create an account</h2>
            <p className="text-xs text-slate-500 mt-1">
              Start managing your research library.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">Full name</label>
              <Input
                placeholder="Ada Lovelace"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
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
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <Button variant="primary" className="w-full mt-1" disabled={loading}>
              {loading ? (
                <>
                  <span className="w-3 h-3 rounded-full border border-white/30 border-t-white animate-spin" />
                  Creating account…
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <Divider />

          <p className="text-xs text-center text-slate-600">
            Already have an account?{" "}
            <button
              onClick={() => nav("/login")}
              className="text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
            >
              Sign in
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

export default Register;
