import { NavLink } from "react-router-dom";
import { useLanguage } from "../api/LanguageContext.jsx";
import LanguageToggle from "./LanguageToggle.jsx";

const links = [
  { to: "/", label: "Home", icon: "🏠", className: "home-link" },
  { to: "/tracker", label: "Go-Tracker", icon: "📊", className: "tracker-link" },
  { to: "/progress", label: "Progress", icon: "📈", className: "progress-link" },
  { to: "/rankings", label: "Rankings", icon: "🏆", className: "rankings-link" },
  { to: "/profile", label: "Profile", icon: "👤", className: "profile-link" }
];

export default function Navbar() {
  const { t } = useLanguage();
  return (
    <nav className="main-nav">
      <div className="nav-container">
        <NavLink to="/" className="logo">
          <span className="logo-icon">🌿✨</span>
          <span>Carbon-GoGoGOGO</span>
        </NavLink>
        <div className="nav-links">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) => `nav-link ${link.className} ${isActive ? "active" : ""}`}
            >
              <span>{link.icon}</span> {t(link.to === "/" ? "home" : link.to.slice(1))}
            </NavLink>
          ))}
        </div>
        <LanguageToggle />
      </div>
    </nav>
  );
}
