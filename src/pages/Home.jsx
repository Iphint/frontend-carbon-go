import { useLanguage } from "../api/LanguageContext.jsx";

const facts = [
  ["🌳", "A single mature tree can absorb around 22 kg of CO2 each year."],
  ["🚲", "Choosing a bicycle for short trips can turn daily commuting into a zero-emission habit."],
  ["💧", "Saving water also saves the energy needed to pump, heat, and clean it."],
  ["♻️", "Reusing items usually saves more carbon than recycling them later."]
];

export default function Home() {
  const { t } = useLanguage();
  return (
    <main>
      <section className="home-hero">
        <div className="hero-content">
          <h1>🌱 {t("homeTitle")}</h1>
          <p>🌍 {t("homeSubtitle")}</p>
          <a className="start-btn" href="/tracker">🌱 {t("startNow")} →</a>
        </div>
      </section>

      <section className="nature-showcase">
        <div className="showcase-inner">
          <div className="nature-card">
            <img src="https://i.pinimg.com/1200x/b9/31/9b/b9319b1ee88ea02c0995028f94262026.jpg" alt="Lush green forest path" />
          </div>
          <div className="nature-text">
            <h3>🌲 {t("forestTitle")}</h3>
            <p>🌿 {t("forestDesc")}</p>
          </div>
          <div className="nature-card">
            <img src="https://i.pinimg.com/736x/4f/08/24/4f0824854eede7d0178db3fa5d89cc1b.jpg" alt="Mystical foggy forest with rich greenery" />
          </div>
        </div>
      </section>

      <section className="facts-area">
        <div className="facts-wrapper">
          <div className="section-head">
            <h2>🌎✨ {t("planetPulse")}</h2>
            <p>💚 {t("didYouKnow")}</p>
          </div>
          <div className="facts-grid">
            {facts.map(([emoji, text]) => (
              <article className="fact-card" key={text}>
                <div className="fact-emoji">{emoji}</div>
                <p className="fact-text">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
