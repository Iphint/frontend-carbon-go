import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../api/LanguageContext.jsx";

const ecoFactsLibrary = [
  {
    emoji: "🌳",
    en: "Trees absorb up to 48 lbs of CO₂ per year — A single mature forest can clean the air for a whole neighborhood.",
    id: "Pohon dapat menyerap hingga 48 lbs CO₂ per tahun — satu hutan dewasa bisa membersihkan udara untuk satu lingkungan."
  },
  {
    emoji: "💧",
    en: "Turning off the tap while brushing teeth saves up to 8 gallons of water daily — that’s 2,920 gallons a year!",
    id: "Mematikan keran saat menyikat gigi menghemat hingga 8 galon air per hari — sekitar 2.920 galon setahun!"
  },
  {
    emoji: "♻️",
    en: "Recycling one glass jar saves enough energy to power a lightbulb for 4 hours.",
    id: "Mendaur ulang satu toples kaca menghemat energi yang cukup untuk menyalakan lampu selama 4 jam."
  },
  {
    emoji: "🚶",
    en: "Walking or biking 2 miles per day instead of driving prevents nearly 1,000 lbs of CO₂ emissions annually.",
    id: "Berjalan kaki atau bersepeda 2 mil per hari alih-alih berkendara dapat mencegah hampir 1.000 lbs emisi CO₂ per tahun."
  },
  {
    emoji: "🍃",
    en: "Plant-based diets reduce individual carbon footprints by up to 50% compared to heavy meat consumption.",
    id: "Pola makan nabati dapat mengurangi jejak karbon individu hingga 50% dibanding konsumsi daging yang tinggi."
  },
  {
    emoji: "🐝",
    en: "Bees pollinate 75% of global crops — protecting pollinators protects our food systems.",
    id: "Lebah menyerbuki 75% tanaman pangan global — melindungi penyerbuk berarti melindungi sistem pangan kita."
  },
  {
    emoji: "🌊",
    en: "Oceans absorb 30% of CO₂ emissions, but rising acidity threatens marine life — small changes help.",
    id: "Laut menyerap 30% emisi CO₂, tetapi peningkatan keasaman mengancam kehidupan laut — perubahan kecil tetap membantu."
  },
  {
    emoji: "⚡",
    en: "Switching to LED bulbs uses 75% less energy and lasts 25x longer than incandescent lighting.",
    id: "Beralih ke lampu LED memakai energi 75% lebih sedikit dan bertahan 25x lebih lama dari lampu pijar."
  },
  {
    emoji: "🧺",
    en: "Air-drying clothes just six times a year can reduce carbon footprint by 0.2 tons per household.",
    id: "Mengeringkan pakaian dengan udara hanya enam kali setahun dapat mengurangi jejak karbon 0,2 ton per rumah tangga."
  },
  {
    emoji: "🌻",
    en: "Urban green spaces reduce heat island effect and absorb stormwater — they cool cities naturally.",
    id: "Ruang hijau kota mengurangi efek pulau panas dan menyerap air hujan — kota jadi lebih sejuk secara alami."
  },
  {
    emoji: "🚲",
    en: "Cycling to work 3 days a week cuts personal transport emissions by 35% on average.",
    id: "Bersepeda ke tempat kerja 3 hari seminggu rata-rata memangkas emisi transportasi pribadi sebesar 35%."
  }
];

export default function Home() {
  const { language, t } = useLanguage();
  const [factRotation, setFactRotation] = useState({
    indexes: [0, 1, 2, 3],
    slot: 0,
    next: 4
  });
  const visibleFacts = useMemo(() => (
    factRotation.indexes.map((index) => ecoFactsLibrary[index])
  ), [factRotation.indexes]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setFactRotation((current) => {
        const indexes = [...current.indexes];
        indexes[current.slot] = current.next;

        return {
          indexes,
          slot: (current.slot + 1) % indexes.length,
          next: (current.next + 1) % ecoFactsLibrary.length
        };
      });
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
              <article className="fact-card rotating-fact-card" key={`${language}-${index}-${fact.en}`}>
                <div className="fact-emoji">{fact.emoji}</div>
                <p className="fact-text">{fact[language]}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
