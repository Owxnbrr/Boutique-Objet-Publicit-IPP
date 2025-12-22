export const metadata = {
  title: "Politique de confidentialité",
};

export default function ConfidentialitePage() {
  return (
    <main className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
      <h1>Politique de confidentialité</h1>

      <div style={{ marginTop: 16 }} className="muted">
        <p>
          Cette politique explique comment IPPCom collecte, utilise et protège vos données personnelles lors de
          l’utilisation du site.
        </p>

        <h2 style={{ marginTop: 24 }}>Responsable de traitement</h2>
        <p>
          <strong>IPPCom</strong> — 6 rue Dupuy, Montidier
          <br />
          Contact :{" "}
          <a href="mailto:contact@ipp-imprimerie.fr">
            contact@ipp-imprimerie.fr
          </a>
        </p>

        <h2 style={{ marginTop: 24 }}>Données collectées</h2>
        <p>Selon votre utilisation, nous pouvons collecter :</p>
        <ul>
          <li>Identité : nom, prénom</li>
          <li>Contact : email, téléphone</li>
          <li>Compte : informations liées à l’authentification (via Supabase)</li>
          <li>Commande : panier, historique de commande, informations nécessaires à la facturation et au suivi</li>
          <li>Devis : informations transmises lors d’une demande de devis</li>
          <li>Mesure d’audience : données liées à Google Analytics (si activé)</li>
        </ul>

        <h2 style={{ marginTop: 24 }}>Finalités</h2>
        <ul>
          <li>Création et gestion de votre compte</li>
          <li>Gestion du panier, des commandes, du paiement et du suivi</li>
          <li>Gestion des demandes de devis</li>
          <li>Support et échanges liés à votre demande</li>
          <li>Amélioration du site et mesure d’audience (Google Analytics)</li>
          <li>Sécurité et prévention de la fraude</li>
        </ul>

        <h2 style={{ marginTop: 24 }}>Bases légales</h2>
        <ul>
          <li>Exécution du contrat (commande / devis / gestion de compte)</li>
          <li>Obligations légales (facturation, comptabilité si applicable)</li>
          <li>Intérêt légitime (sécurité, amélioration du service)</li>
          <li>Consentement (mesure d’audience selon configuration / cookies)</li>
        </ul>

        <h2 style={{ marginTop: 24 }}>Sous-traitants et services tiers</h2>
        <ul>
          <li>
            <strong>Supabase</strong> : authentification et base de données (gestion compte, données applicatives)
          </li>
          <li>
            <strong>Stripe</strong> : traitement des paiements
          </li>
          <li>
            <strong>Google Analytics</strong> : mesure d’audience (si activé)
          </li>
        </ul>

        <h2 style={{ marginTop: 24 }}>Durée de conservation</h2>
        <p>
          Nous conservons vos données pendant une durée maximale de <strong>3 ans</strong>, sauf obligation légale ou
          nécessité liée à l’exécution d’un contrat (ex. suivi de commande, facturation).
        </p>

        <h2 style={{ marginTop: 24 }}>Sécurité</h2>
        <p>
          Nous mettons en place des mesures techniques et organisationnelles pour protéger vos données (accès limité,
          sécurisation des échanges, etc.).
        </p>

        <h2 style={{ marginTop: 24 }}>Vos droits</h2>
        <p>
          Conformément au RGPD, vous disposez de droits d’accès, de rectification, d’effacement, d’opposition, de
          limitation et de portabilité de vos données.
        </p>
        <p>
          Pour exercer vos droits :{" "}
          <a href="mailto:contact@ipp-imprimerie.fr">
            contact@ipp-imprimerie.fr
          </a>
          .
        </p>

        <h2 style={{ marginTop: 24 }}>Réclamation</h2>
        <p>
          Si vous estimez, après nous avoir contactés, que vos droits ne sont pas respectés, vous pouvez introduire une
          réclamation auprès de la CNIL.
        </p>
      </div>
    </main>
  );
}
