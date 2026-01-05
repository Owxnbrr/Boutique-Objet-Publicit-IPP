"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./CookiePopup.module.css";

const KEY = "cookie_consent"; // "accepted" | "refused"

export default function CookiePopup() {
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(KEY);
    if (!consent) {
      const t = setTimeout(() => setOpen(true), 180); // laisse le temps au rendu => slide-in visible
      return () => clearTimeout(t);
    }
  }, []);

  const close = (value: "accepted" | "refused") => {
    localStorage.setItem(KEY, value);

    // anim de sortie
    setLeaving(true);
    setOpen(false);
    setTimeout(() => setLeaving(false), 450);
  };

  if (!open && !leaving) return null;

  return (
    <div
      className={[
        styles.banner,
        open ? styles.visible : "",
        leaving ? styles.hidden : "",
      ].join(" ")}
      role="dialog"
      aria-live="polite"
      aria-label="Consentement cookies"
    >
      <div className={styles.top}>
        <span className={styles.badge}>Cookies</span>
        <span className={styles.title}>Préférences</span>
      </div>

      <p className={styles.text}>
        Nous utilisons des cookies nécessaires au fonctionnement du site, et des cookies optionnels pour
        améliorer l’expérience.{" "}
        <Link className={styles.link} href="/cookies">
          En savoir plus
        </Link>
        .
      </p>

      <div className={styles.actions}>
        <button className={styles.btnGhost} onClick={() => close("refused")}>
          Refuser
        </button>
        <button className={styles.btnPrimary} onClick={() => close("accepted")}>
          Accepter
        </button>
      </div>
    </div>
  );
}
