// src/hooks/usePreferences.ts
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

const BASE_API_URL = import.meta.env.VITE_API_URL;

interface Preferences {
  email_on_import_complete: boolean;
  websocket_auto_reconnect: boolean;
}

const DEFAULTS: Preferences = {
  email_on_import_complete: true,
  websocket_auto_reconnect: true,
};

export const usePreferences = () => {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [prefsaving, setPrefSaving] = useState(false);
  const { token } = useAuth();

  const fetchPreferences = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_API_URL}/user/me/preferences`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPrefs(res.data.data);
    } catch {
      setPrefs(DEFAULTS);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const updatePreference = useCallback(
    async (key: keyof Preferences, value: boolean) => {
      console.log(key, value);
      if (!token) return;
      // Optimistic update
      setPrefs(prev => ({ ...prev, [key]: value }));
      setPrefSaving(true);
      try {
        await axios.patch(
          `${BASE_API_URL}/user/me/preferences`,
          { [key]: value },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } catch {
        // Revert on failure
        setPrefs(prev => ({ ...prev, [key]: !value }));
      } finally {
        setPrefSaving(false);
      }
    },
    [token],
  );

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return { prefs, loading, prefsaving, updatePreference };
};
