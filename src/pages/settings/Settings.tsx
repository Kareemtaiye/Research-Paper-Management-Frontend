// src/pages/SettingsPage.tsx
import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import axios from "axios"
import { DangerAction, Field, Section, Toggle } from "@/components/Section"
import PageHeader from "@/components/PageHeader"
import Button from "@/components/Button"
import Input from "@/components/Input"
import { useToast } from "@/context/ToastContext"
import { toastApiError } from "@/utils/apiError"
import { usePreferences } from "@/hooks/usePreferences"

// const ReqBody = {

// }

const BASE_API_URL = import.meta.env.VITE_API_URL

export default function Settings() {
  const { user, token, logout, fetchMe } = useAuth()
  const [email, setEmail] = useState(user?.email ?? "")
  const [fullName, setFullName] = useState(user?.full_name ?? "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const { prefs, prefsaving, updatePreference } = usePreferences()
  console.log(prefsaving, prefs)

  const hasChanges = email !== user?.email || fullName !== user?.full_name
  async function handleUpdateProfile() {
    setSaving(true)
    try {
      const res = await axios.patch(
        `${BASE_API_URL}/user/me`,
        { email, full_name: fullName },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      toast(res.data.message || "Profile updated")
      fetchMe(token)
    } catch (err) {
      toastApiError(err, toast, "Failed to update")
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword() {
    setSaving(true)
    try {
      const res = await axios.patch(
        `${BASE_API_URL}/user/me/password`,
        { current_password: currentPassword, new_password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      toast(res.data.message || "Password changed")
      setCurrentPassword("")
      setNewPassword("")
    } catch (err) {
      toastApiError(err, toast, "Failed to change password")
    } finally {
      setSaving(false)
    }
  }

  async function handleClearLibrary() {
    if (!confirm("Delete all papers and tasks? This cannot be undone.")) return
    try {
      const res = await axios.delete(`${BASE_API_URL}/user/me/library`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast(res.data.message || "Library cleared")
    } catch (err) {
      toastApiError(err, toast, "Failed to clear library")
    }
  }

  async function handleDeleteAccount() {
    if (!confirm("Permanently delete your account? This cannot be undone."))
      return
    try {
      const res = await axios.delete(`${BASE_API_URL}/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      logout()
    } catch (err) {
      toastApiError(err, toast, "Failed to delete account")
    }
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Account and preferences" />

      <div className="px-8 py-6 space-y-6 max-w-xl">
        {/* Profile */}
        <Section title="Profile" subtitle="Update your email and role">
          <Field label="Email">
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUpdateProfile()}
            />
          </Field>
          <Field label="Full Name">
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUpdateProfile()}
            />
          </Field>
          <Field label="Role">
            <Input value={user?.role ?? ""} disabled />
            {/* <input className="settings-input" value={user?.role ?? ""} disabled /> */}
          </Field>
          <Button
            onClick={handleUpdateProfile}
            disabled={saving || !hasChanges}
          >
            Save changes
          </Button>
        </Section>

        {/* Password */}
        <Section title="Password" subtitle="Change your login password">
          <Field label="Current password">
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </Field>
          <Field label="New password">
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 8 characters"
            />
          </Field>
          <Button onClick={handleChangePassword} disabled={saving}>
            Update password
          </Button>
        </Section>

        {/* Notifications */}
        <Section
          title="Notifications"
          subtitle="Control how you receive updates"
        >
          <Toggle
            label="Email on import complete"
            description="Receive an email via Resend when a paper finishes importing"
            checked={prefs.email_on_import_complete}
            onChange={(val) =>
              updatePreference("email_on_import_complete", val)
            }
            disabled={prefsaving}
          />
          <Toggle
            label="WebSocket auto-reconnect"
            description="Automatically reconnect if the real-time connection drops"
            checked={prefs.websocket_auto_reconnect}
            onChange={(val) => {
              updatePreference("websocket_auto_reconnect", val)
              console.log("ARggg")
            }}
            disabled={prefsaving}
          />
        </Section>

        {/* Danger Zone */}
        <Section title="Danger zone" danger>
          <div className="space-y-3">
            <DangerAction
              label="Clear library"
              description="Permanently delete all papers and task history"
              buttonLabel="Clear library"
              onClick={handleClearLibrary}
            />
            <DangerAction
              label="Delete account"
              description="Permanently delete your account and all associated data"
              buttonLabel="Delete account"
              onClick={handleDeleteAccount}
            />
          </div>
        </Section>
      </div>
    </div>
  )
}
