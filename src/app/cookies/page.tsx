export const metadata = {
  title: "Cookies",
};

export default function CookiesPage() {
  return (
    <main className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
      <h1>Cookies</h1>

      <div style={{ marginTop: 16 }} className="muted">
        <p>
          Un cookie est un petit fichier enregistré sur votre appareil lors de la consultation d’un site. Il permet,
          par exemple, d’assurer le bon fonctionnement du site ou de mesurer son audience.
        </p>

        <h2 style={{ marginTop: 24 }}>Cookies strictement nécessaires</h2>
        <p>
          Le site peut utiliser des cookies indispensables au fonctionnement (ex : maintien de session, panier, sécurité,
          authentification). Ces cookies ne nécessitent pas de consentement.
        </p>

        <h2 style={{ marginTop: 24 }}>Mesure d’audience</h2>
        <p>
          Le site peut utiliser <strong>Google Analytics</strong> afin de mesurer l’audience et améliorer l’expérience.
          Selon la configuration, Google Analytics peut déposer des cookies/traceurs.
        </p>

        <h2 style={{ marginTop: 24 }}>Gérer vos préférences</h2>
        <p>
          Vous pouvez configurer votre navigateur pour bloquer ou supprimer les cookies. Attention : certaines
          fonctionnalités (connexion, panier, commande) peuvent ne plus fonctionner correctement si les cookies sont
          désactivés.
        </p>

        <h2 style={{ marginTop: 24 }}>Contact</h2>
        <p>
          Pour toute question :{" "}
          <a href="mailto:contact@ipp-imprimerie.fr">
            contact@ipp-imprimerie.fr
          </a>
          .
        </p>
      </div>
    </main>
  );
}
