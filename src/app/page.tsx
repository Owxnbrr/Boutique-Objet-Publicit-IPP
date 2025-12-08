import Link from 'next/link';
import Bento from '../components/Bento';

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div>
            <h1 className="hero-title">
              Objets pub & goodies <span className="hero-sub">personnalisés</span>
            </h1>
            <p className="muted" style={{ maxWidth: 580 }}>
              Commandez vos cadeaux d’affaires et textiles personnalisés en quelques clics.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 16, marginBottom:16 }}>
              <Link className="btn btn-primary" href="/catalog">Voir le catalogue</Link>
              <Link className="btn btn-ghost" href="#devis">Demander un devis</Link>
            </div>

            {/* logos confiance */}
            <div className="trust">
              <div className="trust-logos">
                <span className="badge">Paiement sécurisé</span>
                <span className="badge">14 jours retour</span>
                <span className="badge">Suivi de commande</span>
              </div>
              <span className="trust-note muted">Chiffrement TLS • Données protégées</span>
            </div>
          </div>

          <div className="hero-card">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="panel"><div className="h2">+270 nouveautés</div><p className="muted">Sélection 2025</p></div>
              <div className="panel"><div className="h2">72h – 10j</div><p className="muted">Délais de prod</p></div>
              <div className="panel"><div className="h2">MOQ souples</div><p className="muted">Dès 25–100 pièces</p></div>
              <div className="panel"><div className="h2">Support dédié</div><p className="muted">BAT & suivi</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* BENTO PRODUITS */}
      <Bento />

      {/* AVANTAGES */}
      <section className="feature-grid">
        <div className="feature">
          <div className="h2">Prix transparents</div>
          <p className="muted">Devis précis, pas de frais cachés.</p>
        </div>
        <div className="feature">
          <div className="h2">Qualité contrôlée</div>
          <p className="muted">BAT, contrôle visuel & test d’impression avant lancement.</p>
        </div>
        <div className="feature">
          <div className="h2">Délais maîtrisés</div>
          <p className="muted">Production standard 5–10j, express possible selon références.</p>
        </div>
        <div className="feature">
          <div className="h2">Accompagnement</div>
          <p className="muted">Un interlocuteur unique du brief à la livraison.</p>
        </div>
      </section>

      {/* CTA DEVIS */}
      <section id="devis" style={{ marginTop: 36 }}>
        <div className="panel" style={{ display:'grid', gap:10 }}>
          <div className="h2">Un projet ? Parlons-en.</div>
          <p className="muted">Donnez-nous une quantité, une deadline et une idée — on s’occupe du reste.</p>
          <div style={{ display:'flex', gap:10 }}>
            <a className="btn btn-primary" href="/catalog">Parcourir le catalogue</a>
            <a className="btn btn-ghost" href="/product/DEMO">Demander un devis</a>
            
          </div>
        </div>
      </section>
    </>
  );
}
