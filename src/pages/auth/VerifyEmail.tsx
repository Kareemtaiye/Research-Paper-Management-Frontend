import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/context/ToastContext";
import axios from "axios";
import { AuthShell, ErrorState, SentState, Spinner } from "@/components/AuthShell";

const BASE_API_URL = import.meta.env.VITE_API_URL;

type State = "verifying" | "success" | "error" | "resent";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState<State>(token ? "verifying" : "error");
  const [resending, setResending] = useState(false);
  const { toast } = useToast();
  const nav = useNavigate();

  // Auto-verify on mount if token present
  useEffect(() => {
    if (!token) return;
    verify(token);
  }, [token]);

  async function verify(t: string) {
    setState("verifying");
    try {
      await axios.post(`${BASE_API_URL}/auth/verify-email`, { token: t });
      setState("success");
    } catch (err: any) {
      setState("error");
    }
  }

  async function resendVerification() {
    setResending(true);
    try {
      const accessToken = localStorage.getItem("access_token");
      await axios.post(
        `${BASE_API_URL}/auth/resend-verification`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      setState("resent");
      toast("Verification email sent", "success");
    } catch (err: any) {
      toast(err.response?.data?.detail ?? "Failed to resend verification email", "error");
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthShell>
      {state === "verifying" && (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <Spinner />
          <div style={{ fontSize: 14, color: "#94a3b8", marginTop: 16 }}>
            Verifying your email…
          </div>
        </div>
      )}

      {state === "success" && (
        <SentState
          title="Email verified"
          description="Your email has been verified successfully. You can now access all features."
          action="Go to dashboard"
          onAction={() => nav("/")}
          icon="✓"
          iconColor="#4ade80"
        />
      )}

      {state === "error" && (
        <ErrorState
          title="Verification failed"
          description="This verification link is invalid or has expired. Request a new one below."
          action={resending ? "Sending…" : "Resend verification email"}
          onAction={resendVerification}
          disabled={resending}
        />
      )}

      {state === "resent" && (
        <SentState
          title="Email sent"
          description="A new verification link has been sent to your email address. Check your inbox."
          action="Back to dashboard"
          onAction={() => nav("/")}
        />
      )}
    </AuthShell>
  );
}
