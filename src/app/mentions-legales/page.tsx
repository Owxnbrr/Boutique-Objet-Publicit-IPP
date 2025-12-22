export const metadata = {
  title: "Mentions légales",
};

export default function MentionsLegalesPage() {
  return (
    <main className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
      <h1>Mentions légales</h1>

      <div style={{ marginTop: 16 }} className="muted">
        <p>
          Conformément aux dispositions légales en vigueur, vous trouverez ci-dessous les informations relatives à
          l’éditeur et à l’hébergement du site.
        </p>

        <h2 style={{ marginTop: 24 }}>Éditeur du site</h2>
        <p>
          <strong>IPPCom</strong>
          <br />
          6 rue Dupuy, Montidier
          <br />
          Email :{" "}
          <a href="mailto:contact@ipp-imprimerie.fr">
            contact@ipp-imprimerie.fr
          </a>
          <br />
          Directeur de publication : Bucheton Noah
        </p>

        <h2 style={{ marginTop: 24 }}>Hébergement</h2>
        <p>
          Le site est hébergé par <strong>Netlify, Inc.</strong>
        </p>

        <h2 style={{ marginTop: 24 }}>Propriété intellectuelle</h2>
        <p>
          L’ensemble des contenus (textes, images, logos, éléments graphiques, code) présents sur ce site est protégé
          par le droit d’auteur et/ou le droit des marques. Toute reproduction, représentation, modification ou
          adaptation, totale ou partielle, est interdite sans autorisation préalable.
        </p>

        <h2 style={{ marginTop: 24 }}>Responsabilité</h2>
        <p>
          IPPCom s’efforce d’assurer l’exactitude et la mise à jour des informations diffusées sur le site, mais ne peut
          garantir l’absence d’erreurs. L’utilisateur est seul responsable de l’utilisation qu’il fait du site.
        </p>

        <h2 style={{ marginTop: 24 }}>Contact</h2>
        <p>
          Pour toute question, vous pouvez nous contacter à l’adresse :{" "}
          <a href="mailto:contact@ipp-imprimerie.fr">
            contact@ipp-imprimerie.fr
          </a>
          .
        </p>
      </div>
    </main>
  );
}
