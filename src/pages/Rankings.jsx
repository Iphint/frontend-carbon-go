import { useEffect, useState } from "react";
import { api, getErrorMessage } from "../api/client";
import { useLanguage } from "../api/LanguageContext.jsx";

export default function Rankings() {
  const { t } = useLanguage();
  const [rankings, setRankings] = useState([]);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const pageSize = 8;

  useEffect(() => {
    api.get("/rankings")
      .then((res) => setRankings(res.data.rankings))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  const totalPages = Math.max(1, Math.ceil(rankings.length / pageSize));
  const start = (page - 1) * pageSize;
  const visibleRankings = rankings.slice(start, start + pageSize);

  return (
    <main className="rankings-page">
      <div className="main-container">
        <section className="rank-hero">
          <h1>🏆 {t("rankTitle")}</h1>
          <div className="tagline">{t("rankSubtitle")}</div>
        </section>
        {error && <div className="form-error">{error}</div>}
        <section className="leaderboard-card">
          <div className="board-header"><span>{t("rank")}</span><span>{t("user")}</span><span>Total CU</span></div>
          <div className="board-rows">
            {visibleRankings.map((user, index) => (
              <div className="rank-row" key={user.id}>
                <div className={`rank-number ${start + index === 0 ? "gold" : start + index === 1 ? "silver" : start + index === 2 ? "bronze" : "normal-rank"}`}>#{start + index + 1}</div>
                <div className="user-block">
                  <div className="avatar">{(user.full_name || user.username || "?").slice(0, 1).toUpperCase()}</div>
                  <div>
                    <strong>{user.full_name || user.username}</strong>
                    <p>@{user.username}</p>
                  </div>
                </div>
                <div className="score-pill">{user.total_carbon} CU</div>
              </div>
            ))}
          </div>
          <div className="pagination-controls">
            <button type="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Prev</button>
            <span>Page {page} / {totalPages}</span>
            <button type="button" disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next</button>
          </div>
        </section>
      </div>
    </main>
  );
}
