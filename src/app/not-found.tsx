import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
      <p className="muted">Erreur 404</p>
      <h1 style={{ marginTop: 8 }}>Page introuvable</h1>
      <p className="muted" style={{ marginTop: 12 }}>
        Le lien est incorrect ou la page n’existe plus.
      </p>

        <div className="cta-links">
            <Link className="btn-link" href="/">Retour à l’accueil</Link>
            <Link className="btn-link btn-link--ghost" href="/catalog">Voir le catalogue</Link>
        </div>
    </main>
  );
}
