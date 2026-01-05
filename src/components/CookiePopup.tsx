"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "cookie_consent"; // "accepted" | "refused"

export default function CookiePopup() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const consent = window.localStorage.getItem(KEY);
    if (!consent) {
      setMounted(true);
      const t = window.setTimeout(() => setVisible(true), 200);
      return () => window.clearTimeout(t);
    }
  }, []);

  const choose = (value: "accepted" | "refused") => {
    window.localStorage.setItem(KEY, value);

    // anim sortie
    setClosing(true);
    setVisible(false);
    window.setTimeout(() => setMounted(false), 450);
  };

  if (!mounted) return null;

  return (
    <div
      className={[
        "cookiePopup",
        visible ? "is-visible" : "",
        closing ? "is-hidden" : "",
      ].join(" ")}
      role="dialog"
      aria-live="polite"
      aria-label="Consentement cookies"
    >
      <p className="cookiePopup__text">
        Nous utilisons des cookies pour améliorer votre expérience.{" "}
        <Link className="cookiePopup__link" href="/cookies">
          En savoir plus
        </Link>
        .
      </p>

      <div className="cookiePopup__actions">
        <button
          className="cookiePopup__btn cookiePopup__btn--secondary"
          onClick={() => choose("refused")}
        >
          Refuser
        </button>
        <button
          className="cookiePopup__btn cookiePopup__btn--primary"
          onClick={() => choose("accepted")}
        >
          Accepter
        </button>
      </div>
    </div>
  );
}
