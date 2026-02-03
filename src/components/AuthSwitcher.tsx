"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";

type Mode = "login" | "register";

export default function AuthSwitcher({ mode: initial = "login" as Mode }) {
  const [mode, setMode] = useState<Mode>(initial);
  const containerRef = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [remail, setRemail] = useState("");
  const [rpass, setRpass] = useState("");

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const router = useRouter();
  const params = useSearchParams();

  function toggleMode() {
    setErr(null);
    setInfo(null);
    setMode((m) => (m === "login" ? "register" : "login"));
  }

  function makeRipple(e: React.MouseEvent<HTMLButtonElement>) {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const span = document.createElement("span");
    span.className = "as-ripple";
    const size = Math.max(rect.width, rect.height);
    span.style.width = span.style.height = `${size}px`;
    span.style.left = `${e.clientX - rect.left - size / 2}px`;
    span.style.top = `${e.clientY - rect.top - size / 2}px`;
    target.appendChild(span);
    setTimeout(() => span.remove(), 600);
  }

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setErr(null);
    setInfo(null);

    if (!email.trim() || !password) {
      setErr("Merci de renseigner email et mot de passe.");
      return;
    }

    setBusy(true);
    const sb = supabaseBrowser();
    const { error } = await sb.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);

    if (error) {
      setErr(error.message);
      return;
    }

    const next = params.get("redirectedFrom") || "/dashboard";
    router.replace(next);
    router.refresh();
  }

  async function onRegister(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setErr(null);
    setInfo(null);

    if (!name.trim() || !remail.trim() || !rpass) {
      setErr("Merci de renseigner nom, email et mot de passe.");
      return;
    }
    if (rpass.length < 6) {
      setErr("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setBusy(true);
    const sb = supabaseBrowser();
    const { data, error } = await sb.auth.signUp({
      email: remail.trim(),
      password: rpass,
      options: {
        data: { full_name: name.trim() },
      },
    });
    setBusy(false);

    if (error) {
      setErr(error.message);
      return;
    }

    if (data.session) {
      const next = params.get("redirectedFrom") || "/dashboard";
      router.replace(next);
      router.refresh();
    } else {
      setInfo(
        "Compte créé ! Vérifie ta boîte mail pour confirmer ton adresse avant de te connecter."
      );
    }
  }

  return (
    <section className="auth">
      <div
        ref={containerRef}
        className={`auth-switcher panel ${mode === "register" ? "is-register" : "is-login"}`}
      >
        <button
          aria-label={mode === "login" ? "Passer à l'inscription" : "Revenir à la connexion"}
          className={`as-toggle ${mode === "register" ? "active" : ""}`}    
          type="button"
          onClick={toggleMode}
        >
          <span className="shape" />
        </button>

        <div className="as-pane as-login">
          <header className="auth-header">
            <h1 className="h1">Connexion</h1>
            <p className="muted">Accédez à votre espace client IPP.</p>
          </header>

          <form onSubmit={onLogin} className="form" noValidate>
            <label className={`as-field ${email ? "filled" : ""}`}>
              <span className="as-label">Email</span>
              <input
                className="input"
                type="email"
                autoComplete="email"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <span className="as-spin" />
            </label>

            <label className={`as-field ${password ? "filled" : ""}`}>
              <span className="as-label">Mot de passe</span>
              <input
                className="input"
                type="password"
                autoComplete="current-password"
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="as-spin" />
            </label>

            <button
              className="btn btn-primary btn-md as-ripple-host"
              type="submit"
              disabled={busy}
              onClick={makeRipple}
            >
              {busy ? "Connexion..." : "Connexion"}
            </button>

            {err && <p className="error" role="alert">{err}</p>}
            {info && <p className="text-accent" role="status">{info}</p>}
          </form>

          <div className="auth-actions">
            <span className="muted account-toogle">Pas encore de compte ?</span>
            <button type="button" className="btn btn-outline btn-sm" onClick={toggleMode}>
              Créer un compte
            </button>
          </div>

          <div className="as-links">
            <Link href="/forgot" className="text-accent">Mot de passe oublié ?</Link>
          </div>
        </div>

        <div className="as-pane as-register">
          <header className="auth-header">
            <h1 className="h1">Créer un compte</h1>
            <p className="muted">Rejoignez IPP pour accéder à votre espace client.</p>
          </header>

          <form onSubmit={onRegister} className="form" noValidate>
            <label className={`as-field ${name ? "filled" : ""}`}>
              <span className="as-label">Nom</span>
              <input
                className="input"
                type="text"
                placeholder=" "
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <span className="as-spin" />
            </label>

            <label className={`as-field ${remail ? "filled" : ""}`}>
              <span className="as-label">Email</span>
              <input
                className="input"
                type="email"
                autoComplete="email"
                placeholder=" "
                value={remail}
                onChange={(e) => setRemail(e.target.value)}
                required
              />
              <span className="as-spin" />
            </label>

            <label className={`as-field ${rpass ? "filled" : ""}`}>
              <span className="as-label">Mot de passe</span>
              <input
                className="input"
                type="password"
                autoComplete="new-password"
                placeholder=" "
                value={rpass}
                onChange={(e) => setRpass(e.target.value)}
                required
                minLength={6}
              />
              <span className="as-spin" />
            </label>

            <button
              className="btn btn-primary btn-md as-ripple-host"
              type="submit"
              disabled={busy}
              onClick={makeRipple}
            >
              {busy ? "Création..." : "Créer mon compte"}
            </button>

            {err && <p className="error" role="alert">{err}</p>}
            {info && <p className="text-accent" role="status">{info}</p>}
          </form>

          <div className="auth-actions">
            <button type="button" className="btn btn-outline btn-sm" onClick={toggleMode}>
              J’ai déjà un compte
            </button>
            <button type="button" className="btn btn-outline btn-sm" onClick={toggleMode}>
              Me connecter
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
