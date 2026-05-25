import { useEffect, useState } from "react";
import { api, getErrorMessage } from "../api/client";
import EmptyState from "../components/EmptyState.jsx";
import { useLanguage } from "../api/LanguageContext.jsx";
import { useAuth } from "../api/AuthContext.jsx";

const rankMeta = {
  Guest: { icon: "👤", index: 0, nextName: "Explorer" },
  Explorer: { icon: "🌱", index: 1, nextName: "Guardian" },
  Guardian: { icon: "🌳", index: 2, nextName: "Hero" },
  Hero: { icon: "🏆", index: 3, nextName: "MAX LEVEL" }
};

const rankTranslationKeys = {
  Guest: "guestRank",
  Explorer: "explorerRank",
  Guardian: "guardianRank",
  Hero: "heroRank"
};

export default function Progress() {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [data, setData] = useState(null);
  const [rankLog, setRankLog] = useState([]);
  const [showRankLog, setShowRankLog] = useState(false);
  const [confettiRank, setConfettiRank] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get(`/progress/me?lang=${language}`), api.get(`/progress/rank-log?lang=${language}`)])
      .then(([progressRes, rankRes]) => {
        setData(progressRes.data);
        setRankLog(rankRes.data.rankLog);
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, [language]);

  useEffect(() => {
    if (!user?.id || !rankLog.length) return;
    const latest = rankLog[rankLog.length - 1];
    const seenKey = `carbon_user_${user.id}_seen_rank_${latest.id}`;
    if (latest.rank_name !== "Guest" && localStorage.getItem(seenKey) !== "true") {
      localStorage.setItem(seenKey, "true");
      setConfettiRank(latest.rank_name);
      window.setTimeout(() => setConfettiRank(""), 2800);
    }
  }, [user?.id, rankLog]);

  if (error) return <div className="form-error">{error}</div>;
  if (!data) return <div className="page-loader">Loading progress...</div>;

  const totalCarbon = Number(data.totalCarbon);
  const rank = { name: data.currentRank || "Guest", ...(rankMeta[data.currentRank] || rankMeta.Guest) };
  const completedBadges = data.badges.filter((badge) => Number(badge.is_completed) === 1);
  const completedMilestones = data.milestones.filter((milestone) => Number(milestone.is_completed) === 1);
  const questCount = Number(data.rankCounts?.questCount || 0);
  const formatRankDate = (value) => new Date(value).toLocaleDateString(language === "id" ? "id-ID" : "en-US", {
    day: "numeric",
    month: "numeric",
    year: "numeric"
  });
  const getRankLabel = (name) => t(rankTranslationKeys[name] || name);
  const nextRankLabel = rank.name === "Hero" ? t("maxLevel") : getRankLabel(rank.nextName);
  const nextRankTarget = Math.min(rank.index + 1, 3);
  const rankProgress = rank.name === "Hero" ? 100 : Math.round((
    Math.min(questCount, nextRankTarget) +
    Math.min(completedBadges.length, nextRankTarget) +
    Math.min(completedMilestones.length, nextRankTarget)
  ) / (nextRankTarget * 3) * 100);
  const activeQuests = (data.quests || []).slice(0, 4).map((quest) => {
    const requirement = Number(quest.requirement_value || 0);
    return {
      ...quest,
      requirement,
      isUnlocked: Number(quest.is_completed) === 1 || totalCarbon >= requirement,
      remaining: Math.max(0, requirement - totalCarbon)
    };
  });

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
          <div className="rank-name">{getRankLabel(rank.name)}</div>
          <div className="rank-description">{rank.name === "Hero" ? t("maxLevel") : t("startEcoJourney")}</div>
          {rank.name !== "Hero" && <div className="rank-next">🎯 {rankProgress}% {t("toReachRank")} {nextRankLabel}</div>}
          <div className="progress-track"><div className="progress-fill" style={{ width: `${rankProgress}%` }} /></div>
          <div className="journey-stats"><span>🌍 {t("journey")}</span><span>{rankProgress}%</span></div>
          <div className="rank-action-row">
            <button className="rank-log-btn" onClick={() => setShowRankLog(true)}>↻ {t("viewRankLog")}</button>
          </div>
          <div className="rank-helper">
            ✪ {t("rankProgressHint")}
          </div>
        </section>

        {confettiRank && (
          <div className="confetti-layer" aria-hidden="true">
            {Array.from({ length: 36 }, (_, index) => <span key={index} style={{ "--i": index }} />)}
            <strong>Rank Up: {confettiRank}</strong>
          </div>
        )}

        <h2 className="section-title progress-section-title">🏁 {t("milestones")} <span>→ {t("milestoneBasis")}</span></h2>
        <div className="card-grid progress-card-grid">
          {data.milestones.length ? data.milestones.map((item) => (
            <article className={`card ${item.is_completed ? "unlocked" : "locked"}`} key={item.id}>
              <div className="card-icon">{item.is_completed ? "✅" : "🌱"}</div>
              <h3>{item.name}</h3>
              <p>{item.description.replace("Journey Points", "CU").replace("journey points", "CU")}</p>
              <span className="badge">{item.is_completed ? "✅ UNLOCKED" : `🔒 Need ${Math.max(0, Number(item.target_value) - totalCarbon)} CU`}</span>
            </article>
          )) : <EmptyState>Empty achievements.</EmptyState>}
        </div>

        <h2 className="section-title progress-section-title">🏅 {t("badges")} <span>{t("badgeProof")}</span></h2>
        <div className="card-grid progress-card-grid">
          {data.badges.length ? data.badges.map((badge) => (
            <article className={`card ${badge.is_completed ? "unlocked" : "locked"}`} key={badge.id}>
              <div className="card-icon">{badge.is_completed ? badge.icon : "🔒"}</div>
              <h3>{badge.name}</h3>
              <p>{badge.description.replace("Eco Points", "CU")}</p>
              <span className="badge">{badge.is_completed ? "🏅 EARNED" : `⌛ Need ${Math.max(0, Number(badge.requirement_value) - totalCarbon)} CU`}</span>
            </article>
          )) : <EmptyState>{t("noBadges")}</EmptyState>}
        </div>

        <h2 className="section-title progress-section-title">📝 {t("activeQuests")} <span>{t("questHint")}</span></h2>
        <div className="card-grid progress-card-grid active-quest-grid">
          {activeQuests.length ? activeQuests.map((quest) => (
            <article className={`card quest-card ${quest.isUnlocked ? "unlocked" : "locked"}`} key={quest.id}>
              <div className="card-icon">{quest.isUnlocked ? quest.icon : "🔒"}</div>
              <h3>{quest.name}</h3>
              <p>{quest.description}</p>
              <p className="quest-reward">🎯 {t("reward")}: +{quest.reward} journey points</p>
              <p className="quest-requires">💥 {t("requires")}: {quest.requirement} CU | {t("youHave")}: {totalCarbon} CU</p>
              <span className="badge">{quest.isUnlocked ? `✅ ${t("completed")}` : `🔒 ${t("need")} ${quest.remaining} CU`}</span>
            </article>
          )) : <EmptyState>{t("noActivities")}</EmptyState>}
        </div>
        <p className="progress-footnote">🧭 {t("progressFootnote")}</p>
      </div>

      {showRankLog && (
        <div className="rank-log-modal">
          <div className="rank-log-content">
            <div className="rank-log-header">
              <h3>🏆 {t("rankJourney")}</h3>
            </div>
            <div className="rank-log-list">
              {rankLog.length ? rankLog.map((item) => (
                <div className="rank-entry" key={item.id}>
                  <div className="rank-entry-icon">{rankMeta[item.rank_name]?.icon || "🏅"}</div>
                  <div className="rank-entry-main">
                    <strong>{getRankLabel(item.rank_name)}</strong>
                    <div className="rank-entry-date">{t("achievedOn")} {formatRankDate(item.earned_at)}</div>
                  </div>
                  <span className="rank-entry-check" aria-hidden="true">✓</span>
                </div>
              )) : <EmptyState>{t("noRankChanges")}</EmptyState>}
            </div>
            <button className="rank-exit-btn" type="button" onClick={() => setShowRankLog(false)}>{t("close")}</button>
          </div>
        </div>
      )}
    </main>
  );
}
