// src/pages/SettingsPage.tsx
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { DangerAction, Field, Section, Toggle } from "@/components/Section";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/Button";
import Input from "@/components/Input";

const BASE_API_URL = import.meta.env.VITE_API_URL;

export default function Settings() {
  const { user, token, logout } = useAuth();
  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleUpdateProfile() {
    setSaving(true);
    try {
      await axios.patch(
        `${BASE_API_URL}/users/me`,
        { email },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMessage("Profile updated");
    } catch (err: any) {
      setMessage(err.response?.data?.detail ?? "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    setSaving(true);
    try {
      await axios.patch(
        `${BASE_API_URL}/users/me/password`,
        { current_password: currentPassword, new_password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMessage("Password changed");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setMessage(err.response?.data?.detail ?? "Failed to change password");
    } finally {
      setSaving(false);
    }
  }

  async function handleClearLibrary() {
    if (!confirm("Delete all papers and tasks? This cannot be undone.")) return;
    try {
      await axios.delete(`${BASE_API_URL}/users/me/library`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Library cleared");
    } catch (err: any) {
      setMessage(err.response?.data?.detail ?? "Failed to clear library");
    }
  }

  async function handleDeleteAccount() {
    if (!confirm("Permanently delete your account? This cannot be undone.")) return;
    try {
      await axios.delete(`${BASE_API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      logout();
    } catch (err: any) {
      setMessage(err.response?.data?.detail ?? "Failed to delete account");
    }
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Account and preferences" />

      <div className="px-8 py-6 space-y-6 max-w-xl">
        {message && (
          <div
            className="text-xs text-green-400 px-3 py-2 rounded"
            style={{
              background: "rgba(34,197,94,0.08)",
              border: "0.5px solid rgba(34,197,94,0.2)",
            }}
          >
            {message}
          </div>
        )}

        {/* Profile */}
        <Section title="Profile" subtitle="Update your email and role">
          <Field label="Email">
            <Input
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleUpdateProfile()}
            />
            {/* <input
              className="settings-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
            /> */}
          </Field>
          <Field label="Role">
            <Input value={user?.role ?? ""} disabled />
            {/* <input className="settings-input" value={user?.role ?? ""} disabled /> */}
          </Field>
          <Button onClick={handleUpdateProfile} disabled={saving}>
            Save changes
          </Button>
        </Section>

        {/* Password */}
        <Section title="Password" subtitle="Change your login password">
          <Field label="Current password">
            <Input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
            />
          </Field>
          <Field label="New password">
            <Input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Min. 8 characters"
            />
          </Field>
          <Button onClick={handleChangePassword} disabled={saving}>
            Update password
          </Button>
        </Section>

        {/* Notifications */}
        <Section title="Notifications" subtitle="Control how you receive updates">
          <Toggle
            label="Email on import complete"
            description="Receive an email via Resend when a paper finishes importing"
            defaultChecked={true}
          />
          <Toggle
            label="WebSocket auto-reconnect"
            description="Automatically reconnect if the real-time connection drops"
            defaultChecked={true}
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
  );
}
