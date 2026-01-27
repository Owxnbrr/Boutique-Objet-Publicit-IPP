import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez IPPCom pour un devis de goodies personnalisés : réponse rapide, accompagnement et livraison en France.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
      <h1>Contact</h1>

      <div style={{ marginTop: 16 }} className="muted">
        <p>Pour toute question ou demande, vous pouvez nous contacter par email :</p>

        <p style={{ marginTop: 12 }}>
          <a className="contact-email" href="mailto:contact@ipp-imprimerie.fr">
            contact@ipp-imprimerie.fr
          </a>
        </p>


        <p style={{ marginTop: 24 }}>
          Téléphone : 03 22 78 01 25
        </p>

        <p style={{ marginTop: 24 }}>
          Adresse : 6 rue Dupuy, Montdidier
        </p>
        </div>
        <form action="" method="post">
          <h2 style={{ marginTop: 32 }}>Formulaire de contact</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16, maxWidth: 480 }}>
            <label>
              Nom :
              <input type="text" name="name" required style={{ width: '100%', padding: 8, marginTop: 4 }} />
            </label>
            <label>
              Email :
              <input type="email" name="email" required style={{ width: '100%', padding: 8, marginTop: 4 }} />
            </label>
            <label>
              Message :
              <textarea name="message" required style={{ width: '100%', padding: 8, marginTop: 4 }} rows={4}></textarea>
            </label>
            <button type="submit" className="btn btn-primary">Envoyer</button>
          </div>
        </form>
    </main>
  );
}
