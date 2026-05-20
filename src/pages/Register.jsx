import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import AuthShell from "../components/AuthShell.jsx";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../api/AuthContext.jsx";
import { useLanguage } from "../api/LanguageContext.jsx";

export default function Register() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { t } = useLanguage();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await auth.register(form);
      navigate("/login", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title={t("registerTitle")} subtitle={t("registerSubtitle")}>
      <form className="form-stack" onSubmit={submit}>
        <label>{t("username")}<input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></label>
        <label>{t("email")}<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label>{t("password")}<input required type="password" minLength="8" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
        {error && <div className="form-error">{error}</div>}
        <button className="btn-primary" disabled={loading}>{loading ? `${t("register")}...` : t("register")}</button>
      </form>
      <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
    </AuthShell>
  );
}
