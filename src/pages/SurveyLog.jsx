import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, getErrorMessage } from "../api/client";
import EmptyState from "../components/EmptyState.jsx";
import { useLanguage } from "../api/LanguageContext.jsx";
import { withHomeFallback } from "../utils/activityFallbacks.js";

const categorySteps = [
  { id: "transportation", labelKey: "school", titleKey: "schoolTransportation", single: true },
  { id: "home", labelKey: "homeCategory", titleKey: "homeActivity", single: true },
  { id: "energy", labelKey: "energy", titleKey: "energyActivity", single: false },
  { id: "consumption", labelKey: "consumption", titleKey: "consumptionActivity", single: false },
  { id: "waste", labelKey: "waste", titleKey: "wasteActivity", single: false },
  { id: "environment", labelKey: "environment", titleKey: "environmentActivity", single: false }
];

function otherKey(category) {
  return `${category}:other`;
}

export default function SurveyLog() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [activities, setActivities] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [selected, setSelected] = useState({});
  const [otherInputs, setOtherInputs] = useState({});
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/activities?lang=${language}`)
      .then((res) => setActivities(withHomeFallback(res.data.activities)))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [language]);

  const currentStep = categorySteps[stepIndex];
  const currentSelections = selected[currentStep.id] || [];
  const currentActivities = activities.filter((item) => item.category === currentStep.id);
  const currentHasOther = currentSelections.includes(otherKey(currentStep.id));
  const selectedCount = Object.values(selected).reduce((sum, items) => sum + items.length, 0);

  function toggleActivity(activityId) {
    setError("");
    setSelected((prev) => {
      const current = prev[currentStep.id] || [];
      const value = String(activityId);
      const next = currentStep.single
        ? [value]
        : current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value];
      return { ...prev, [currentStep.id]: next };
    });
  }

  function goNext() {
    if (stepIndex < categorySteps.length - 1) setStepIndex((index) => index + 1);
  }

  function goBack() {
    if (stepIndex > 0) setStepIndex((index) => index - 1);
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    const manualActivity = note.trim();

    const payloads = Object.entries(selected).flatMap(([category, values]) => (
      values.map((value) => {
        if (value === otherKey(category)) {
          const other = otherInputs[category]?.trim();
          return other ? { activity_id: null, other_activity: other, note: null } : null;
        }
        return { activity_id: Number(value), other_activity: null, note: null };
      }).filter(Boolean)
    ));

    if (manualActivity) {
      payloads.push({ activity_id: null, other_activity: manualActivity, note: null });
    }

    if (!payloads.length) {
      setError(t("surveySelectOne"));
      return;
    }

    setSaving(true);
    try {
      await Promise.all(payloads.map((payload) => api.post("/activity-logs", payload)));
      navigate("/tracker", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="page-loader">Loading survey...</div>;

  return (
    <main className="tracker-page">
      <section className="survey-shell">
        <header className="survey-topbar">
          <div>
            <h1>🌱 Carbon Tracker <span>{t("cuTracker")}</span></h1>
            <p>{t("trackerTagline")}</p>
          </div>
        </header>

        <div className="survey-tabs">
          {categorySteps.map((step, index) => (
            <button
              type="button"
              key={step.id}
              className={`survey-tab ${index === stepIndex ? "active" : ""}`}
              onClick={() => setStepIndex(index)}
            >
              {t(step.labelKey)}
            </button>
          ))}
        </div>

        <form className="survey-log-card" onSubmit={submit}>
          <div className="survey-log-head">
            <div>
              <h2>{t(currentStep.titleKey)}</h2>
              <p>◉ {currentStep.single ? t("singleChoiceHint") : t("multiChoiceHint")}</p>
            </div>
            <span className="survey-count">{selectedCount} {t("selected")}</span>
          </div>

          <div className="survey-options">
            {currentActivities.length ? currentActivities.map((activity) => {
              const isSelected = currentSelections.includes(String(activity.id));
              return (
                <button
                  type="button"
                  className={`survey-option ${isSelected ? "selected" : ""}`}
                  key={activity.displayKey || `${activity.category}:${activity.id}`}
                  onClick={() => toggleActivity(activity.id)}
                >
                  <span>{activity.display_name || activity.name}</span>
                  <strong>{Number(activity.carbon_value) > 0 ? "+" : ""}{activity.carbon_value} CU</strong>
                </button>
              );
            }) : <EmptyState>{t("noActivities")}</EmptyState>}

            <button
              type="button"
              className={`survey-option other-option ${currentHasOther ? "selected" : ""}`}
              onClick={() => toggleActivity(otherKey(currentStep.id))}
            >
              <span>{t("otherSurvey")}</span>
              <strong>{t("noCu")}</strong>
            </button>
          </div>

          {currentHasOther && (
            <input
              className="inline-input"
              required
              placeholder={t("manualActivity")}
              value={otherInputs[currentStep.id] || ""}
              onChange={(e) => setOtherInputs({ ...otherInputs, [currentStep.id]: e.target.value })}
            />
          )}

          <textarea className="inline-input" placeholder={t("noteOptional")} value={note} onChange={(e) => setNote(e.target.value)} />
          {error && <div className="form-error">{error}</div>}

          <div className="survey-actions">
            <button className="btn-secondary" type="button" onClick={goBack} disabled={stepIndex === 0}>{t("back")}</button>
            {stepIndex < categorySteps.length - 1 ? (
              <button className="survey-next" type="button" onClick={goNext}>{t("next")} --&gt;</button>
            ) : (
              <button className="survey-next" type="submit" disabled={saving}>{saving ? "..." : t("submitSurvey")}</button>
            )}
          </div>
        </form>
      </section>
    </main>
  );
}
