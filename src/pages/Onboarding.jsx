import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell.jsx";
import { api, getErrorMessage } from "../api/client";
import { useAuth } from "../api/AuthContext.jsx";
import { useLanguage } from "../api/LanguageContext.jsx";

export default function Onboarding() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { t } = useLanguage();
  const [form, setForm] = useState({
    full_name: "",
    address: "",
    gender: "",
    phone_number: "",
    bio: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/profile/onboarding", form);
      await auth.refreshMe();
      sessionStorage.setItem("carbon_show_guide", "1");
      navigate("/", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title={t("onboardingTitle")} subtitle={t("onboardingSubtitle")}>
      <form className="form-stack" onSubmit={submit}>
        <label>{t("fullName")}<input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></label>
        <label>{t("address")}<textarea required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label>
        <label>{t("gender")}
          <select required value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
            <option value="">Select gender</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </label>
        <label>{t("phone")}<input required value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} /></label>
        <label>{t("bio")}<textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></label>
        {error && <div className="form-error">{error}</div>}
        <button className="btn-primary" disabled={loading}>{loading ? "..." : t("finishOnboarding")}</button>
      </form>
    </AuthShell>
  );
}
