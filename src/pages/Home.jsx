import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../api/LanguageContext.jsx";

const ecoFactsLibrary = [
  { emoji: "🌳", text: "Trees absorb up to 48 lbs of CO₂ per year — A single mature forest can clean the air for a whole neighborhood." },
  { emoji: "💧", text: "Turning off the tap while brushing teeth saves up to 8 gallons of water daily — that’s 2,920 gallons a year!" },
  { emoji: "♻️", text: "Recycling one glass jar saves enough energy to power a lightbulb for 4 hours." },
  { emoji: "🚶", text: "Walking or biking 2 miles per day instead of driving prevents nearly 1,000 lbs of CO₂ emissions annually." },
  { emoji: "🍃", text: "Plant-based diets reduce individual carbon footprints by up to 50% compared to heavy meat consumption." },
  { emoji: "🐝", text: "Bees pollinate 75% of global crops — protecting pollinators protects our food systems." },
  { emoji: "🌊", text: "Oceans absorb 30% of CO₂ emissions, but rising acidity threatens marine life — small changes help." },
  { emoji: "⚡", text: "Switching to LED bulbs uses 75% less energy and lasts 25x longer than incandescent lighting." },
  { emoji: "🧺", text: "Air-drying clothes just six times a year can reduce carbon footprint by 0.2 tons per household." },
  { emoji: "🌻", text: "Urban green spaces reduce heat island effect and absorb stormwater — they cool cities naturally." },
  { emoji: "🚲", text: "Cycling to work 3 days a week cuts personal transport emissions by 35% on average." }
];

export default function Home() {
  const { t } = useLanguage();
  const [factOffset, setFactOffset] = useState(0);
  const visibleFacts = useMemo(() => {
    return Array.from({ length: 4 }, (_, index) => {
      return ecoFactsLibrary[(factOffset + index) % ecoFactsLibrary.length];
    });
  }, [factOffset]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setFactOffset((current) => (current + 4) % ecoFactsLibrary.length);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <main>
      <section className="home-hero">
        <div className="hero-content">
          <h1>🌱 {t("homeTitle")}</h1>
          <p>🌍 {t("homeSubtitle")}</p>
          <Link className="start-btn" to="/tracker?guide=1">🌱 {t("startNow")} →</Link>
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
            {visibleFacts.map((fact, index) => (
              <article className="fact-card rotating-fact-card" key={`${factOffset}-${index}-${fact.text}`}>
                <div className="fact-emoji">{fact.emoji}</div>
                <p className="fact-text">{fact.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
