import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useLanguage } from "../api/LanguageContext.jsx";

const scaleRows = [
  [5, "Very High Positive (very eco-friendly)", "Sangat Positif Tinggi (sangat ramah lingkungan)"],
  [4, "High Positive", "Positif Tinggi"],
  [3, "Moderate Positive", "Positif Sedang"],
  [2, "Light Positive", "Positif Ringan"],
  [1, "Small Positive", "Positif Kecil"],
  [0, "Neutral", "Netral"],
  [-1, "Small Negative", "Negatif Kecil"],
  [-2, "Light Negative", "Negatif Ringan"],
  [-3, "Moderate Negative", "Negatif Sedang"],
  [-4, "High Negative", "Negatif Tinggi"],
  [-5, "Very High Negative", "Sangat Negatif Tinggi"]
];

export default function CarbonGuide() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, t } = useLanguage();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const shouldOpenFromUrl = new URLSearchParams(location.search).get("guide") === "1";
    if (shouldOpenFromUrl || sessionStorage.getItem("carbon_show_guide") === "1") {
      setOpen(true);
      sessionStorage.removeItem("carbon_show_guide");
      if (shouldOpenFromUrl) navigate("/tracker", { replace: true });
    }
  }, [location.search, navigate]);

  function jakartaDay(value) {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date(value));
  }

  async function hasActivityToday() {
    const today = jakartaDay(new Date());
    const { data } = await api.get(`/activity-logs/me?lang=${language}`);
    return data.logs.some((log) => jakartaDay(log.created_at) === today);
  }

  async function startTracking() {
    setOpen(false);
    try {
      navigate(await hasActivityToday() ? "/tracker" : "/survey");
    } catch {
      navigate("/survey");
    }
  }

  return (
    <>
      <button className="guide-fab" type="button" onClick={() => setOpen(true)} aria-label={t("openGuide")}>
        📘
      </button>

      {open && (
        <div className="guide-overlay" role="dialog" aria-modal="true" aria-labelledby="carbon-guide-title">
          <section className="guide-card">
            <div className="guide-heading">
              <span className="guide-accent" />
              <span className="guide-book">📘</span>
              <h2 id="carbon-guide-title">{t("guideTitle")}</h2>
            </div>

            <p><strong>{t("assessmentBasis")}</strong> {t("assessmentText")}</p>
            <p><strong>{t("researchNote")}</strong> {t("researchText")}</p>

            <h3>📊 {t("carbonScale")}</h3>
            <div className="guide-table-wrap">
              <table className="guide-table">
                <thead>
                  <tr>
                    <th>{t("cuValue")}</th>
                    <th>{t("impactCategory")}</th>
                  </tr>
                </thead>
                <tbody>
                  {scaleRows.map(([value, en, id]) => (
                    <tr key={value}>
                      <td>{value > 0 ? `+${value}` : value}</td>
                      <td>{language === "id" ? id : en}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="guide-tip">💡 <strong>{t("tip")}</strong> {t("guideTip")}</p>
            <button className="guide-start-btn" type="button" onClick={startTracking}>
              {t("guideButton")} →
            </button>
          </section>
        </div>
      )}
    </>
  );
}
