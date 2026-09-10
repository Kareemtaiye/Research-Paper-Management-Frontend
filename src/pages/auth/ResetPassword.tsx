import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/context/ToastContext";
import axios from "axios";
import {
  AuthButton,
  AuthField,
  AuthHeader,
  AuthInput,
  AuthShell,
  ErrorState,
  SentState,
} from "@/components/AuthShell";
import { PasswordStrength } from "@/components/PasswordStrength";

const BASE_API_URL = import.meta.env.VITE_API_URL;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const { toast } = useToast();
  const nav = useNavigate();

  // No token in URL — invalid link
  if (!token) {
    return (
      <AuthShell>
        <ErrorState
          title="Invalid reset link"
          description="This password reset link is invalid or has expired. Request a new one."
          action="Request new link"
          onAction={() => nav("/forgot-password")}
        />
      </AuthShell>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 8) {
      toast("Password must be at least 8 characters", "warning");
      return;
    }
    if (password !== confirm) {
      toast("Passwords do not match", "warning");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${BASE_API_URL}/auth/reset-password?token=${token}`, {
        new_password: password,
      });
      setDone(true);
    } catch (err: any) {
      toast(err.response?.data?.detail ?? "Reset link is invalid or expired", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell>
      {!done ? (
        <>
          <AuthHeader
            title="Reset password"
            subtitle="Choose a new password for your account"
          />

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <AuthField label="New password">
              <AuthInput
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
              />
            </AuthField>

            <AuthField label="Confirm password">
              <AuthInput
                type="password"
                placeholder="Repeat your new password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
              />
              {confirm && password !== confirm && (
                <span style={{ fontSize: 11, color: "#f87171", marginTop: 4 }}>
                  Passwords do not match
                </span>
              )}
            </AuthField>

            {/* Password strength indicator */}
            <PasswordStrength password={password} />

            <AuthButton
              type="submit"
              disabled={submitting || password !== confirm || password.length < 8}
            >
              {submitting ? "Resetting…" : "Reset password"}
            </AuthButton>
          </form>
        </>
      ) : (
        <SentState
          title="Password reset"
          description="Your password has been reset successfully. Sign in with your new password."
          action="Sign in"
          onAction={() => nav("/login")}
        />
      )}
    </AuthShell>
  );
}
