export type CookieCategory = "necessary" | "preferences" | "analytics" | "marketing";

export type ConsentV1 = {
  version: 1;
  categories: Record<CookieCategory, boolean>;
  updatedAt: string; // ISO
};

const STORAGE_KEY = "cookie_consent_v1";
const COOKIE_NAME = "cookie_consent";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 180; // 180 jours

const defaultCategories: ConsentV1["categories"] = {
  necessary: true,
  preferences: false,
  analytics: false,
  marketing: false,
};

export function readConsent(): ConsentV1 | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as ConsentV1;
    if (parsed?.version !== 1 || !parsed?.categories) return null;

    // force nécessaire
    parsed.categories.necessary = true;
    return parsed;
  } catch {
    return null;
  }
}

export function writeConsent(categories: Partial<ConsentV1["categories"]>): ConsentV1 {
  if (typeof window === "undefined") {
    // ne devrait pas arriver côté client-only
    return { version: 1, categories: { ...defaultCategories }, updatedAt: new Date().toISOString() };
  }

  const consent: ConsentV1 = {
    version: 1,
    categories: {
      ...defaultCategories,
      ...categories,
      necessary: true,
    },
    updatedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));

  // cookie lisible partout (si un jour tu veux le lire côté serveur)
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(consent))}` +
    `; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax${secure}`;

  // event pour que d'autres composants réagissent
  window.dispatchEvent(new CustomEvent("cookie-consent-updated", { detail: consent }));

  return consent;
}

export function hasConsent(): boolean {
  return !!readConsent();
}

export function isAllowed(category: CookieCategory): boolean {
  const consent = readConsent();
  if (!consent) return category === "necessary";
  return !!consent.categories[category];
}

export function resetConsent() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent("cookie-consent-updated", { detail: null }));
}
