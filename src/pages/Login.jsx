import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import AuthShell from "../components/AuthShell.jsx";
import PasswordField from "../components/PasswordField.jsx";
import { getErrorMessage, api } from "../api/client";
import { useAuth } from "../api/AuthContext.jsx";
import { useLanguage } from "../api/LanguageContext.jsx";

export default function Login() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { t, language } = useLanguage();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotForm, setForgotForm] = useState({ username: "", email: "", code: "", newPassword: "", confirmPassword: "" });
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await auth.login(form);
      navigate(data.onboardingComplete ? "/" : "/onboarding", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleSendCode() {
    setForgotError("");
    setForgotSuccess("");
    if (!forgotForm.username || !forgotForm.email) {
      setForgotError("Username and email are required");
      return;
    }
    setForgotLoading(true);
    try {
      await api.post("/auth/forgot-password", { username: forgotForm.username, email: forgotForm.email });
      setForgotSuccess(t("codeSent"));
      setForgotStep(2);
    } catch (err) {
      setForgotError(getErrorMessage(err));
    } finally {
      setForgotLoading(false);
    }
  }

  async function handleVerifyCode() {
    setForgotError("");
    setForgotSuccess("");
    if (!forgotForm.code) {
      setForgotError(t("codeRequired"));
      return;
    }
    setForgotLoading(true);
    try {
      await api.post("/auth/verify-reset-code", { email: forgotForm.email, code: forgotForm.code });
      setForgotStep(3);
    } catch (err) {
      setForgotError(getErrorMessage(err));
    } finally {
      setForgotLoading(false);
    }
  }

  async function handleResetPassword() {
    setForgotError("");
    setForgotSuccess("");
    if (forgotForm.newPassword.length < 8) {
      setForgotError(t("passwordMinLength"));
      return;
    }
    if (forgotForm.newPassword !== forgotForm.confirmPassword) {
      setForgotError(t("passwordsDoNotMatch"));
      return;
    }
    setForgotLoading(true);
    try {
      await api.post("/auth/reset-password", { email: forgotForm.email, code: forgotForm.code, newPassword: forgotForm.newPassword });
      setForgotSuccess(t("passwordResetSuccess"));
      setForgotStep(4);
    } catch (err) {
      setForgotError(getErrorMessage(err));
    } finally {
      setForgotLoading(false);
    }
  }

  function closeForgotModal() {
    setShowForgot(false);
    setForgotStep(1);
    setForgotForm({ username: "", email: "", code: "", newPassword: "", confirmPassword: "" });
    setForgotError("");
    setForgotSuccess("");
  }

  return (
    <AuthShell title={t("loginTitle")} subtitle={t("loginSubtitle")}>
      <form className="form-stack" onSubmit={submit}>
        <label>{t("username")}<input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></label>
        <div>
          <PasswordField label={t("password")} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button type="button" className="forgot-password-link" onClick={() => setShowForgot(true)}>
            {t("forgotPassword")}
          </button>
        </div>
        {error && <div className="form-error">{error}</div>}
        <button className="btn-primary" disabled={loading}>{loading ? `${t("login")}...` : t("login")}</button>
      </form>
      <p className="auth-switch">{t("newHere")} <Link to="/register">{t("createAccount")}</Link></p>

      {showForgot && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeForgotModal()}>
          <div className="auth-card forgot-modal">
            <button type="button" className="modal-close" onClick={closeForgotModal}>&times;</button>
            <h3>{t("forgotPasswordTitle")}</h3>

            {forgotStep === 1 && (
              <>
                <p className="forgot-desc">{t("forgotPasswordDesc")}</p>
                <div className="form-stack">
                  <label>{t("username")}<input required value={forgotForm.username} onChange={(e) => setForgotForm({ ...forgotForm, username: e.target.value })} /></label>
                  <label>{t("email")}<input required type="email" value={forgotForm.email} onChange={(e) => setForgotForm({ ...forgotForm, email: e.target.value })} /></label>
                  {forgotError && <div className="form-error">{forgotError}</div>}
                  <button className="btn-primary" onClick={handleSendCode} disabled={forgotLoading}>
                    {forgotLoading ? `${t("sendCode")}...` : t("sendCode")}
                  </button>
                </div>
              </>
            )}

            {forgotStep === 2 && (
              <>
                <p className="forgot-desc">{t("verifyCodeDesc")}</p>
                <p className="forgot-success">{forgotSuccess}</p>
                <div className="form-stack">
                  <label>{t("code")}<input required value={forgotForm.code} onChange={(e) => setForgotForm({ ...forgotForm, code: e.target.value })} placeholder="123456" maxLength={6} /></label>
                  {forgotError && <div className="form-error">{forgotError}</div>}
                  <button className="btn-primary" onClick={handleVerifyCode} disabled={forgotLoading}>
                    {forgotLoading ? `${t("verifyCode")}...` : t("verifyCode")}
                  </button>
                </div>
              </>
            )}

            {forgotStep === 3 && (
              <>
                <p className="forgot-desc">{t("resetPassword")}</p>
                <div className="form-stack">
                  <PasswordField label={t("newPassword")} minLength="8" value={forgotForm.newPassword} onChange={(e) => setForgotForm({ ...forgotForm, newPassword: e.target.value })} />
                  <PasswordField label={t("confirmPassword")} minLength="8" value={forgotForm.confirmPassword} onChange={(e) => setForgotForm({ ...forgotForm, confirmPassword: e.target.value })} />
                  {forgotError && <div className="form-error">{forgotError}</div>}
                  <button className="btn-primary" onClick={handleResetPassword} disabled={forgotLoading}>
                    {forgotLoading ? `${t("confirmReset")}...` : t("confirmReset")}
                  </button>
                </div>
              </>
            )}

            {forgotStep === 4 && (
              <>
                <p className="forgot-success">{forgotSuccess}</p>
                <button className="btn-primary" onClick={closeForgotModal}>{t("login")}</button>
              </>
            )}
          </div>
        </div>
      )}
    </AuthShell>
  );
}
