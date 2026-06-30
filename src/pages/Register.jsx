import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import AuthShell from "../components/AuthShell.jsx";
import PasswordField from "../components/PasswordField.jsx";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../api/AuthContext.jsx";
import { useLanguage } from "../api/LanguageContext.jsx";

const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;

export default function Register() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { t } = useLanguage();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function validateUsername(value) {
    if (value && !USERNAME_PATTERN.test(value)) {
      return t("usernamePatternError");
    }
    return "";
  }

  async function submit(e) {
    e.preventDefault();
    setError("");

    const usernameError = validateUsername(form.username);
    if (usernameError) {
      setError(usernameError);
      return;
    }

    setLoading(true);
    try {
      await auth.register(form);
      navigate("/login", { replace: true });
    } catch (err) {
      const msg = getErrorMessage(err);
      if (msg && msg.toLowerCase().includes("username")) {
        setError(t("usernameExists"));
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title={t("registerTitle")} subtitle={t("registerSubtitle")}>
      <form className="form-stack" onSubmit={submit}>
        <label>{t("username")}
          <input
            required
            pattern="[a-zA-Z0-9_]+"
            title={t("usernamePatternError")}
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        </label>
        <label>{t("email")}<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <PasswordField label={t("password")} minLength="8" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error && <div className="form-error">{error}</div>}
        <button className="btn-primary" disabled={loading}>{loading ? `${t("register")}...` : t("register")}</button>
      </form>
      <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
    </AuthShell>
  );
}
