export const metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <main className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
      <h1>Contact</h1>

      <div style={{ marginTop: 16 }} className="muted">
        <p>Pour toute question ou demande, vous pouvez nous contacter par email :</p>

        <p style={{ marginTop: 12 }}>
          <a href="mailto:contact@ipp-imprimerie.fr">
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
    </main>
  );
}
