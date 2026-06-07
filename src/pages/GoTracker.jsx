import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, getErrorMessage } from "../api/client";
import EmptyState from "../components/EmptyState.jsx";
import StatCard from "../components/StatCard.jsx";
import { useLanguage } from "../api/LanguageContext.jsx";
import { useAuth } from "../api/AuthContext.jsx";
import CarbonGuide from "../components/CarbonGuide.jsx";
import {
  hasLogForToday,
  hasSeenTrackerGuide,
  isDailySurveyCompletedLocally,
  markTrackerGuideSeen
} from "../utils/surveyStatus.js";

const filters = ["all", "transportation", "energy", "consumption", "waste", "environment"];

function categoryLabel(category, t) {
  if (!category) return "";
  return t(category);
}

export default function GoTracker() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [activities, setActivities] = useState([]);
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("all");
  const [activityId, setActivityId] = useState("");
  const [other, setOther] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);
  const [gateChecking, setGateChecking] = useState(true);

  async function checkTrackerGate() {
    if (!user?.id) return;

    if (!hasSeenTrackerGuide(user.id)) {
      setGuideOpen(true);
      setGateChecking(false);
      return;
    }

    try {
      const { data } = await api.get(`/activity-logs/me?lang=${language}`);
      const completedToday = isDailySurveyCompletedLocally(user.id) || hasLogForToday(data.logs);
      if (!completedToday) {
        navigate("/survey", { replace: true });
        return;
      }
    } catch {
      navigate("/survey", { replace: true });
      return;
    }

    setGateChecking(false);
  }

  async function load() {
    setLoading(true);
    try {
      const [activityRes, logRes] = await Promise.all([
        api.get(`/activities?lang=${language}`),
        api.get(`/activity-logs/me?lang=${language}`)
      ]);
      setActivities(activityRes.data.activities);
      setLogs(logRes.data.logs);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [language]);

  useEffect(() => {
    checkTrackerGate();
  }, [user?.id, language]);

  async function completeGuide() {
    markTrackerGuideSeen(user.id);
    setGuideOpen(false);
    setGateChecking(true);
    await checkTrackerGate();
  }

  const selectedActivity = activities.find((item) => String(item.id) === String(activityId));
  const filteredActivities = filter === "all" ? activities : activities.filter((item) => item.category === filter);
  const total = useMemo(() => logs.reduce((sum, log) => sum + Number(log.carbon_value), 0), [logs]);
  const good = logs.filter((log) => Number(log.carbon_value) > 0).length;
  const bad = logs.filter((log) => Number(log.carbon_value) < 0).length;

  async function submit(e) {
    e.preventDefault();
    setError("");
    const manualActivity = note.trim();
    try {
      const payloads = [];
      if (activityId) {
        payloads.push({
          activity_id: activityId === "other" ? null : Number(activityId),
          other_activity: activityId === "other" ? other : null,
          note: null
        });
      }
      if (manualActivity) {
        payloads.push({ activity_id: null, other_activity: manualActivity, note: null });
      }
      await Promise.all(payloads.map((payload) => api.post("/activity-logs", payload)));
      setActivityId("");
      setOther("");
      setNote("");
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (loading || gateChecking) return (
    <>
      <CarbonGuide open={guideOpen} onComplete={completeGuide} />
      <div className="page-loader">Loading tracker...</div>
    </>
  );

  return (
    <main className="tracker-page">
      <CarbonGuide open={guideOpen} onComplete={completeGuide} />
      {!guideOpen && (
        <button className="guide-fab" type="button" onClick={() => setGuideOpen(true)} aria-label={t("openGuide")} title={t("openGuide")}>
          📘
        </button>
      )}
      <section className="survey-container dashboard-container visible">
        <div className="dashboard-header">
          <h2>🧭 {t("trackerTitle")}</h2>
        </div>
        <div className="dashboard-content">
          <form className="log-panel" onSubmit={submit}>
            <h3>📌 {t("logNew")}</h3>
            <div className="filter-chips">
              {filters.map((item) => (
                <button type="button" key={item} className={`filter-chip ${filter === item ? "active" : ""}`} onClick={() => setFilter(item)}>
                  {item === "all" ? t("all") : t(item)}
                </button>
              ))}
            </div>
            <div className="activities-list">
              {filteredActivities.map((activity) => (
                <button
                  type="button"
                  className={`activity-card ${String(activity.id) === String(activityId) ? "selected" : ""}`}
                  key={activity.displayKey || `${activity.category}:${activity.id}`}
                  onClick={() => setActivityId(String(activity.id))}
                >
                  <span className="activity-name">{activity.display_name || activity.name}</span>
                  <span className="activity-meta">{categoryLabel(activity.category, t)} · {activity.carbon_value > 0 ? "+" : ""}{activity.carbon_value} CU</span>
                  <span className="activity-feedback">💬 {activity.feedback}</span>
                </button>
              ))}
            </div>
            <div className="other-activity-wrap">
              <button type="button" className={`activity-card ${activityId === "other" ? "selected" : ""}`} onClick={() => setActivityId("other")}>
                <span className="activity-name">{t("other")}</span>
                <span className="activity-meta">custom · 0 CU</span>
              </button>
            </div>
            {activityId === "other" && <input className="inline-input" required={!note.trim()} placeholder={t("manualActivity")} value={other} onChange={(e) => setOther(e.target.value)} />}
            <textarea className="inline-input" placeholder={t("noteOptional")} value={note} onChange={(e) => setNote(e.target.value)} />
            <div id="dashPreview">{selectedActivity ? `${selectedActivity.display_name || selectedActivity.name} (${selectedActivity.carbon_value} CU) · ${selectedActivity.feedback}` : activityId === "other" ? `${t("other")} · ${t("neutral")} 0 CU` : t("noSelected")}</div>
            {error && <div className="form-error">{error}</div>}
            <button className="log-btn" disabled={!activityId && !note.trim()}>➕ {t("logSelected")}</button>
          </form>

          <div className="stats-panel">
            <div className="accumulator-card">
              <div>{t("totalCu")}</div>
              <div className="accumulator-score">{total >= 0 ? "+" : ""}{total}</div>
              <div className="neutral-badge">{total > 0 ? t("positive") : total < 0 ? t("negative") : t("neutral")}</div>
            </div>
            <div className="stats-grid">
              <StatCard label={t("totalActivities")} value={logs.length} />
              <StatCard label={t("goodActions")} value={good} />
              <StatCard label={t("badActions")} value={bad} />
              <StatCard label={t("ecoRatio")} value={`${logs.length ? Math.round((good / logs.length) * 100) : 0}%`} />
            </div>
            <h3>📋 {t("activityLog")}</h3>
            <div className="log-list">
              {logs.length ? logs.slice(0, 8).map((log) => (
                <div className="log-entry" key={log.id}>
                  <strong>{log.activity_name || log.other_activity || "Other"}</strong>
                  <span>{Number(log.carbon_value) > 0 ? "+" : ""}{log.carbon_value} CU</span>
                  <small className="feedback-solution">💬 {log.feedback || (Number(log.carbon_value) === 0 ? t("neutral") : "")}</small>
                  {log.note && <small className="log-note">📝 {log.note}</small>}
                </div>
              )) : <EmptyState>{t("noActivities")}</EmptyState>}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
