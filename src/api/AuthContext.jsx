import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "./client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
      setProfile(data.profile);
      return data;
    } catch {
      setUser(null);
      setProfile(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMe();
  }, []);

  const value = useMemo(() => ({
    user,
    profile,
    loading,
    onboardingComplete: Boolean(profile),
    refreshMe,
    async login(payload) {
      const { data } = await api.post("/auth/login", payload);
      setUser(data.user);
      await refreshMe();
      return data;
    },
    async register(payload) {
      return api.post("/auth/register", payload);
    },
    async logout() {
      await api.post("/auth/logout");
      setUser(null);
      setProfile(null);
    }
  }), [user, profile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
