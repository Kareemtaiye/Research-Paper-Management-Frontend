import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/context/ToastContext";
import { toastApiError } from "@/utils/apiError";
import axios from "axios";
import { AuthShell, ErrorState, SentState, Spinner } from "@/components/AuthShell";

const BASE_API_URL = import.meta.env.VITE_API_URL;

type State = "verifying" | "success" | "redirecting" | "error" | "resent";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [state, setState] = useState<State>(token ? "verifying" : "error");
  const [resending, setResending] = useState(false);

  const { toast } = useToast();
  const nav = useNavigate();
  const verifiedRef = useRef(false);

  const accessToken = localStorage.getItem("access_token");
  const isLoggedIn = !!accessToken;

  useEffect(() => {
    if (!token || verifiedRef.current) return;

    verifiedRef.current = true;
    verify(token);
  }, [token]);

  async function verify(t: string) {
    setState("verifying");

    try {
      await axios.post(`${BASE_API_URL}/auth/verify-email`, {
        token: t,
      });

      if (isLoggedIn) {
        setState("redirecting");

        setTimeout(() => {
          nav("/");
        }, 2000);

        return;
      }

      setState("success");
    } catch (err) {
      setState("error");

      toastApiError(err, toast, "Verification link is invalid or expired");
    }
  }

  async function resendVerification() {
    if (!isLoggedIn) {
      nav("/login");
      return;
    }

    setResending(true);

    try {
      await axios.post(
        `${BASE_API_URL}/auth/resend-verification`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      setState("resent");
      toast("Verification email sent", "success");
    } catch (err) {
      toastApiError(err, toast, "Failed to resend verification email");
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthShell>
      {state === "verifying" && (
        <div
          style={{
            textAlign: "center",
            padding: "24px 0",
          }}
        >
          <Spinner />

          <div
            style={{
              fontSize: 14,
              color: "#94a3b8",
              marginTop: 16,
            }}
          >
            Verifying your email…
          </div>
        </div>
      )}

      {state === "redirecting" && (
        <SentState
          title="Email verified"
          description="Your email has been verified successfully. Redirecting you to your dashboard…"
          disabled={true}
          action="Redirecting"
          onAction={() => {}}
          icon="✓"
          iconColor="#4ade80"
        />
      )}

      {state === "success" && (
        <SentState
          title="Email verified"
          description="Your email has been verified successfully. You can now access all features."
          action="Go to login"
          onAction={() => nav("/login")}
          icon="✓"
          iconColor="#4ade80"
        />
      )}

      {state === "error" && (
        <ErrorState
          title="Verification failed"
          description={
            isLoggedIn
              ? "This verification link is invalid or has expired. You can request a new one below."
              : "This verification link is invalid or has expired. Please log in to request a new verification email."
          }
          action={
            resending
              ? "Sending…"
              : isLoggedIn
                ? "Resend verification email"
                : "Go to login"
          }
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
