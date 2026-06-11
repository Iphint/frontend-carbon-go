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
    if (!/^\d+$/.test(form.phone_number.trim())) {
      setError(t("phoneNumberDigitsOnly"));
      return;
    }
    setLoading(true);
    try {
      await api.post("/profile/onboarding", form);
      await auth.refreshMe();
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
            <option value="">{t("selectGender")}</option>
            <option value="female">{t("female")}</option>
            <option value="male">{t("male")}</option>
          </select>
        </label>
        <label>{t("phone")}<input required inputMode="numeric" pattern="[0-9]*" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value.replace(/\D/g, "") })} /></label>
        <label>{t("bio")}<textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></label>
        {error && <div className="form-error">{error}</div>}
        <button className="btn-primary" disabled={loading}>{loading ? "..." : t("finishOnboarding")}</button>
      </form>
    </AuthShell>
  );
}
