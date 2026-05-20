import { useEffect, useState } from "react";
import { api, getErrorMessage } from "../api/client";
import EmptyState from "../components/EmptyState.jsx";
import { useLanguage } from "../api/LanguageContext.jsx";

const activeQuests = [
  {
    icon: "🚶",
    title: "🌱 First Green Step",
    description: "Log your first eco-action",
    requirement: 50,
    reward: 25
  },
  {
    icon: "💡",
    title: "💡 Energy Saver",
    description: "Save energy by turning off unused devices",
    requirement: 150,
    reward: 25
  },
  {
    icon: "♻️",
    title: "♻️ Plastic Free",
    description: "Avoid single-use plastics consistently",
    requirement: 300,
    reward: 25
  },
  {
    icon: "🌲",
    title: "🌳 Tree Guardian",
    description: "Support reforestation efforts",
    requirement: 500,
    reward: 25
  }
];

const defaultBadges = [
  { id: "default-green-thumb", name: "Green Thumb", description: "Earn 100 CU", icon: "🌿", requirement_value: 100 },
  { id: "default-recycling-guru", name: "Recycling Guru", description: "Earn 250 CU", icon: "♻️", requirement_value: 250 },
  { id: "default-earth-buddy", name: "Earth Buddy", description: "Earn 500 CU", icon: "🐼", requirement_value: 500 },
  { id: "default-climate-hero", name: "Climate Hero", description: "Earn 1000 CU", icon: "⚡", requirement_value: 1000 }
];

function rankFor(total) {
  if (total >= 1000) return { icon: "🏆", name: "Hero", nextName: "MAX LEVEL", nextTarget: 1000 };
  if (total >= 500) return { icon: "🌳", name: "Guardian", nextName: "Hero", nextTarget: 1000 };
  if (total >= 250) return { icon: "🌱", name: "Explorer", nextName: "Guardian", nextTarget: 500 };
  return { icon: "👤", name: "Guest", nextName: "Explorer", nextTarget: 250 };
}

export default function Progress() {
  const { language, t } = useLanguage();
  const [data, setData] = useState(null);
  const [rankLog, setRankLog] = useState([]);
  const [showRankLog, setShowRankLog] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get(`/progress/me?lang=${language}`), api.get(`/progress/rank-log?lang=${language}`)])
      .then(([progressRes, rankRes]) => {
        setData(progressRes.data);
        setRankLog(rankRes.data.rankLog);
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, [language]);

  if (error) return <div className="form-error">{error}</div>;
  if (!data) return <div className="page-loader">Loading progress...</div>;

  const totalCarbon = Number(data.totalCarbon);
  const rank = rankFor(totalCarbon);
  const journeyWidth = Math.max(0, Math.min(100, (Math.max(totalCarbon, 0) / 1000) * 100));
  const nextRankPercent = rank.nextTarget
    ? Math.min(100, Math.round((Math.max(totalCarbon, 0) / rank.nextTarget) * 100))
    : 100;
  const todayCarbon = Number(data.todayCarbon || 0);
  const journeyPoints = Number(data.journeyPoints);
  const badges = data.badges.length ? data.badges : defaultBadges.map((badge) => ({
    ...badge,
    progress_value: totalCarbon,
    is_completed: totalCarbon >= badge.requirement_value
  }));

  return (
    <main className="progress-page">
      <div className="main-container">
        <section className="carbon-stats">
          {t("progressUnits")}
          <div className={`carbon-score ${Number(data.totalCarbon) >= 0 ? "carbon-score-positive" : "carbon-score-negative"}`}>{data.totalCarbon}</div>
          <small>{t("earned")}</small>
        </section>

        <section className="journey-section">
          <div className="rank-icon">{rank.icon}</div>
          <div className="rank-name">{rank.name}</div>
          <div className="rank-description">{rank.name === "Hero" ? "MAX LEVEL" : "Start your eco-journey by earning Carbon Units!"}</div>
          {rank.name !== "Hero" && <div className="rank-next">🎯 {nextRankPercent}% to reach {rank.nextName}</div>}
          <div className="progress-track"><div className="progress-fill" style={{ width: `${journeyWidth}%` }} /></div>
          <div className="journey-stats"><span>🌍 {t("journey")}</span><span>{Math.round(journeyWidth)}%</span></div>
          <button className="rank-log-btn" onClick={() => setShowRankLog(true)}>{t("viewRankLog")}</button>
          <div className="rank-helper">ⓘ Complete quests and earn Carbon Units to advance to the next rank!</div>
        </section>

        <h2 className="section-title progress-section-title">🏁 {t("milestones")} <span>→ {t("milestoneBasis")}</span></h2>
        <div className="card-grid progress-card-grid">
          {data.milestones.map((item) => (
            <article className={`card ${item.is_completed ? "unlocked" : "locked"}`} key={item.id}>
              <div className="card-icon">{item.is_completed ? "✅" : "🌱"}</div>
              <h3>{item.name}</h3>
              <p>{item.description.replace("Journey Points", "CU").replace("journey points", "CU")}</p>
              <span className="badge">{item.is_completed ? "✅ UNLOCKED" : `🔒 Need ${Math.max(0, Number(item.target_value) - totalCarbon)} CU`}</span>
            </article>
          ))}
        </div>

        <h2 className="section-title progress-section-title">🏅 {t("badges")} <span>{t("badgeProof")}</span></h2>
        <div className="card-grid progress-card-grid">
          {badges.map((badge) => (
            <article className={`card ${badge.is_completed ? "unlocked" : "locked"}`} key={badge.id}>
              <div className="card-icon">{badge.is_completed ? badge.icon : "🔒"}</div>
              <h3>{badge.name}</h3>
              <p>{badge.description.replace("Eco Points", "CU")}</p>
              <span className="badge">{badge.is_completed ? "🏅 EARNED" : `⌛ Need ${Math.max(0, Number(badge.requirement_value) - totalCarbon)} CU`}</span>
            </article>
          ))}
        </div>

        <h2 className="section-title progress-section-title">📝 {t("activeQuests")} <span>{t("questHint")}</span></h2>
        <div className="card-grid progress-card-grid">
          {activeQuests.map((quest) => {
            const completed = todayCarbon >= quest.requirement;
            return (
              <article className={`card quest-card ${completed ? "unlocked" : "locked"}`} key={quest.title}>
                <div className="card-icon">{quest.icon}</div>
                <h3>{quest.title}</h3>
                <p>{quest.description}</p>
                <p className="quest-reward">🎯 Reward: +{quest.reward} journey points</p>
                <p className="quest-requires">💥 Requires: {quest.requirement} CU today | You have: {todayCarbon} CU today</p>
                <span className="badge">{completed ? "✅ Completed" : `🔒 Need ${Math.max(0, quest.requirement - todayCarbon)} CU`}</span>
              </article>
            );
          })}
        </div>
        <p className="progress-footnote">🧭 {t("progressFootnote")}</p>
      </div>

      {showRankLog && (
        <div className="rank-log-modal">
          <div className="rank-log-content">
            <div className="rank-log-header">
              <h3>{t("viewRankLog")}</h3>
              <button className="rank-exit-btn" type="button" onClick={() => setShowRankLog(false)}>Exit</button>
            </div>
            {rankLog.length ? rankLog.map((item) => (
              <div className="rank-entry" key={item.id}>
                <div className="rank-entry-icon">{Number(item.carbon_value) >= 0 ? "🌱" : "⚠️"}</div>
                <div>
                  <strong>{item.rank_after}</strong>
                  <div className="rank-entry-date">{item.activity_name} · total {item.total_after} CU</div>
                </div>
              </div>
            )) : <EmptyState>No rank changes yet.</EmptyState>}
          </div>
        </div>
      )}
    </main>
  );
}
