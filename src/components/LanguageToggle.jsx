import { useLanguage } from "../api/LanguageContext.jsx";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="language-toggle" aria-label="Language selector">
      <button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>EN</button>
      <button className={language === "id" ? "active" : ""} onClick={() => setLanguage("id")}>ID</button>
    </div>
  );
}
