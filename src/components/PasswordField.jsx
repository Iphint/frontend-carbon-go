import { useState } from "react";

function EyeIcon({ hidden }) {
  if (hidden) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 3l18 18" />
        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
        <path d="M9.8 5.2A9.8 9.8 0 0 1 12 5c5 0 8.5 4 10 7a13.6 13.6 0 0 1-3.1 4" />
        <path d="M6.6 6.6A13.7 13.7 0 0 0 2 12c1.5 3 5 7 10 7a9.7 9.7 0 0 0 4.1-.9" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function PasswordField({ label, value, onChange, minLength }) {
  const [visible, setVisible] = useState(false);

  return (
    <label>
      {label}
      <span className="password-field">
        <input
          required
          type={visible ? "text" : "password"}
          minLength={minLength}
          value={value}
          onChange={onChange}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          <EyeIcon hidden={visible} />
        </button>
      </span>
    </label>
  );
}
