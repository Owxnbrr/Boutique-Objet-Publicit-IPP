"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { readConsent, writeConsent, type CookieCategory } from "@/lib/cookieConsent";

type CategoriesState = Record<CookieCategory, boolean>;

const ALL_TRUE: CategoriesState = {
  necessary: true,
  preferences: true,
  analytics: true,
  marketing: true,
};

const ALL_FALSE: CategoriesState = {
  necessary: true,
  preferences: false,
  analytics: false,
  marketing: false,
};

export default function CookieConsent() {
  const [ready, setReady] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);

  const [categories, setCategories] = useState<CategoriesState>(ALL_FALSE);

  const lastFocusRef = useRef<HTMLElement | null>(null);
  const firstModalBtnRef = useRef<HTMLButtonElement | null>(null);

  // init
  useEffect(() => {
    const consent = readConsent();
    setReady(true);

    if (!consent) {
      setCategories(ALL_FALSE);
      // petit délai pour l’animation slide-in
      const t = window.setTimeout(() => setBannerVisible(true), 180);
      return () => window.clearTimeout(t);
    } else {
      setCategories(consent.categories);
      setBannerVisible(false);
    }
  }, []);

  // ESC to close modal
  useEffect(() => {
    if (!prefsOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePrefs();
      // mini focus-trap
      if (e.key === "Tab") {
        const modal = document.getElementById("cookieModal");
        if (!modal) return;

        const focusables = modal.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [prefsOpen]);

  const canRender = ready;

  const acceptAll = () => {
    writeConsent(ALL_TRUE);
    setBannerVisible(false);
    setPrefsOpen(false);
  };

  const refuseAll = () => {
    writeConsent(ALL_FALSE);
    setBannerVisible(false);
    setPrefsOpen(false);
  };

  const savePrefs = () => {
    writeConsent(categories);
    setBannerVisible(false);
    setPrefsOpen(false);
  };

  const openPrefs = () => {
    lastFocusRef.current = document.activeElement as HTMLElement;
    setPrefsOpen(true);
    // focus
    setTimeout(() => firstModalBtnRef.current?.focus(), 0);
  };

  const closePrefs = () => {
    setPrefsOpen(false);
    // restore focus
    setTimeout(() => lastFocusRef.current?.focus?.(), 0);
  };

  const toggle = (key: CookieCategory) => {
    if (key === "necessary") return;
    setCategories((prev) => ({ ...prev, [key]: !prev[key], necessary: true }));
  };

  const summary = useMemo(() => {
    const enabled = Object.entries(categories)
      .filter(([k, v]) => k !== "necessary" && v)
      .map(([k]) => k);
    return enabled.length ? enabled.join(", ") : "aucun (hors nécessaires)";
  }, [categories]);

  if (!canRender) return null;

  return (
    <>
      {/* Banner bottom-right */}
      {bannerVisible && !prefsOpen && (
        <div className="cookieBanner is-visible" role="dialog" aria-live="polite" aria-label="Consentement cookies">
          <div className="cookieBanner__top">
            <div className="cookieBanner__badge">Cookies</div>
            <div className="cookieBanner__title">Votre confidentialité</div>
          </div>

          <p className="cookieBanner__text">
            Nous utilisons des cookies nécessaires au fonctionnement du site, et (optionnellement) des cookies
            de mesure d’audience et marketing.{" "}
            <Link className="cookieBanner__link" href="/cookies">
              En savoir plus
            </Link>
            .
          </p>

          <div className="cookieBanner__actions">
            <button className="cookieBtn cookieBtn--ghost" onClick={refuseAll}>
              Tout refuser
            </button>
            <button className="cookieBtn cookieBtn--soft" onClick={openPrefs}>
              Personnaliser
            </button>
            <button className="cookieBtn cookieBtn--primary" onClick={acceptAll}>
              Tout accepter
            </button>
          </div>
        </div>
      )}

      {/* Reopen (optionnel mais pro) */}
      {!bannerVisible && (
        <button
          className="cookieReopen"
          type="button"
          onClick={() => {
            const consent = readConsent();
            setCategories(consent?.categories ?? ALL_FALSE);
            openPrefs();
          }}
          aria-label="Gérer les cookies"
          title="Gérer les cookies"
        >
          ⚙︎
        </button>
      )}

      {/* Modal preferences */}
      {prefsOpen && (
        <div className="cookieModalOverlay" role="presentation" onMouseDown={closePrefs}>
          <div
            id="cookieModal"
            className="cookieModal"
            role="dialog"
            aria-modal="true"
            aria-label="Préférences cookies"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="cookieModal__header">
              <div>
                <div className="cookieModal__kicker">Préférences</div>
                <h2 className="cookieModal__title">Gérer les cookies</h2>
                <p className="cookieModal__subtitle">
                  Choisissez quels cookies optionnels vous acceptez. Les cookies nécessaires sont toujours actifs.
                </p>
              </div>
              <button className="cookieIconBtn" onClick={closePrefs} aria-label="Fermer">
                ✕
              </button>
            </div>

            <div className="cookieModal__content">
              <CookieRow
                title="Nécessaires"
                desc="Indispensables au fonctionnement du site (sécurité, navigation, etc.)."
                checked={true}
                disabled
                onChange={() => {}}
              />
              <CookieRow
                title="Préférences"
                desc="Permet de mémoriser vos choix (langue, affichage, etc.)."
                checked={categories.preferences}
                onChange={() => toggle("preferences")}
              />
              <CookieRow
                title="Mesure d’audience"
                desc="Aide à comprendre l’utilisation du site pour améliorer les performances."
                checked={categories.analytics}
                onChange={() => toggle("analytics")}
              />
              <CookieRow
                title="Marketing"
                desc="Permet de personnaliser la publicité et mesurer l’efficacité des campagnes."
                checked={categories.marketing}
                onChange={() => toggle("marketing")}
              />

              <div className="cookieModal__hint">
                <span className="cookieModal__hintLabel">Sélection actuelle :</span>{" "}
                <span className="cookieModal__hintValue">{summary}</span>
              </div>
            </div>

            <div className="cookieModal__footer">
              <button ref={firstModalBtnRef} className="cookieBtn cookieBtn--ghost" onClick={refuseAll}>
                Tout refuser
              </button>
              <button className="cookieBtn cookieBtn--soft" onClick={acceptAll}>
                Tout accepter
              </button>
              <button className="cookieBtn cookieBtn--primary" onClick={savePrefs}>
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CookieRow({
  title,
  desc,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}) {
  return (
    <div className="cookieRow">
      <div className="cookieRow__text">
        <div className="cookieRow__title">{title}</div>
        <div className="cookieRow__desc">{desc}</div>
      </div>

      <label className={`cookieSwitch ${disabled ? "is-disabled" : ""}`} aria-label={title}>
        <input type="checkbox" checked={checked} disabled={disabled} onChange={onChange} />
        <span className="cookieSwitch__track" aria-hidden="true" />
        <span className="cookieSwitch__thumb" aria-hidden="true" />
      </label>
    </div>
  );
}
