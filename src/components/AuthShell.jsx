import LanguageToggle from "./LanguageToggle.jsx";

export default function AuthShell({ title, subtitle, children }) {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-tools"><LanguageToggle /></div>
        <a href="/" className="logo auth-logo">
          <span className="logo-icon">🌿✨</span>
          <span>Carbon-Go</span>
        </a>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {children}
      </section>
    </main>
  );
}
