import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/context/ToastContext"
import { isNetworkError, isServerError, toastApiError } from "@/utils/apiError"
import axios from "axios"
import {
  AuthButton,
  AuthField,
  AuthHeader,
  AuthInput,
  AuthShell,
  SentState,
} from "@/components/AuthShell"

const BASE_API_URL = import.meta.env.VITE_API_URL

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const { toast } = useToast()
  const nav = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) {
      toast("Enter your email address", "warning")
      return
    }
    setSubmitting(true)
    try {
      await axios.post(`${BASE_API_URL}/auth/forgot-password`, { email })
      setSent(true)
    } catch (err) {
      if (isNetworkError(err) || isServerError(err)) {
        toastApiError(err, toast)
        return
      }
      // Always show success for API errors — don't reveal if email exists
      setSent(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell>
      {!sent ? (
        <>
          <AuthHeader
            title="Forgot password"
            subtitle="Enter your email and we'll send you a reset link"
          />

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <AuthField label="Email">
              <AuthInput
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </AuthField>

            <AuthButton type="submit" disabled={submitting}>
              {submitting ? "Sending…" : "Send reset link"}
            </AuthButton>
          </form>

          <div style={{ textAlign: "center", fontSize: 13, color: "#475569" }}>
            Remember your password?{" "}
            <span
              onClick={() => nav("/login")}
              style={{ color: "#818cf8", cursor: "pointer" }}
            >
              Sign in
            </span>
          </div>
        </>
      ) : (
        <SentState
          title="Check your email"
          description={`We sent a password reset link to ${email}. The link expires in 1 hour.`}
          action="Back to sign in"
          onAction={() => nav("/login")}
        />
      )}
    </AuthShell>
  )
}
