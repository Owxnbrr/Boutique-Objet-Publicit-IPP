export const metadata = {
  title: "Conditions Générales de Vente",
};

export default function CGVPage() {
  return (
    <main className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
      <h1>Conditions Générales de Vente (CGV)</h1>

      <div style={{ marginTop: 16 }} className="muted">
        <p>
          Les présentes Conditions Générales de Vente s’appliquent à toute commande passée sur le site IPPCom, ainsi
          qu’aux demandes de devis. En commandant, le client accepte sans réserve les présentes CGV.
        </p>

        <h2 style={{ marginTop: 24 }}>1. Vendeur</h2>
        <p>
          <strong>IPPCom</strong> — 6 rue Dupuy, Montidier
          <br />
          Contact :{" "}
          <a href="mailto:contact@ipp-imprimerie.fr">
            contact@ipp-imprimerie.fr
          </a>
        </p>

        <h2 style={{ marginTop: 24 }}>2. Produits</h2>
        <p>
          Les produits présentés sont des goodies et supports pouvant être personnalisés. Les visuels et descriptions
          sont fournis à titre indicatif. En cas de personnalisation, le rendu peut varier selon les contraintes
          techniques (impression, colorimétrie, supports).
        </p>

        <h2 style={{ marginTop: 24 }}>3. Devis</h2>
        <p>
          Certaines demandes peuvent faire l’objet d’un devis. Le devis précise les quantités, délais, modalités et prix.
          Le devis est valable pour la durée indiquée (à défaut : 30 jours).
        </p>

        <h2 style={{ marginTop: 24 }}>4. Prix</h2>
        <p>
          Les prix affichés sont en euros. Les frais éventuels (livraison, options) sont indiqués avant validation
          définitive de la commande.
        </p>

        <h2 style={{ marginTop: 24 }}>5. Commande</h2>
        <p>
          La commande est confirmée après validation du panier et paiement (si achat en ligne), ou après acceptation du
          devis. IPPCom se réserve le droit de refuser ou d’annuler une commande en cas de litige, fraude suspectée ou
          informations incomplètes.
        </p>

        <h2 style={{ marginTop: 24 }}>6. Paiement</h2>
        <p>
          Le paiement en ligne est géré via <strong>Stripe</strong>. Les moyens de paiement disponibles sont ceux
          proposés au moment du paiement.
        </p>

        <h2 style={{ marginTop: 24 }}>7. Délais de production et livraison</h2>
        <p>
          Les délais annoncés sont indicatifs et peuvent varier selon la personnalisation, les quantités et la
          disponibilité. À titre indicatif, les délais sont généralement compris entre <strong>72h et 10 jours</strong>.
        </p>

        <h2 style={{ marginTop: 24 }}>8. Droit de rétractation</h2>
        <p>
          Conformément à la réglementation, le consommateur dispose en principe d’un délai de <strong>14 jours</strong>{" "}
          pour se rétracter à compter de la réception du produit.
        </p>
        <p>
          <strong>Exception importante :</strong> le droit de rétractation ne s’applique pas aux produits personnalisés
          ou confectionnés selon les spécifications du client.
        </p>

        <h2 style={{ marginTop: 24 }}>9. Retours et remboursements</h2>
        <p>
          En cas de produit non personnalisé éligible, le retour doit être effectué dans son état d’origine. Les frais
          de retour peuvent rester à la charge du client (sauf erreur de IPPCom ou produit défectueux).
        </p>

        <h2 style={{ marginTop: 24 }}>10. Garanties</h2>
        <p>
          Le client bénéficie des garanties légales de conformité et contre les vices cachés, conformément aux
          dispositions légales en vigueur.
        </p>

        <h2 style={{ marginTop: 24 }}>11. Responsabilité</h2>
        <p>
          IPPCom ne saurait être tenue responsable des dommages indirects. La responsabilité est limitée au montant de la
          commande, sauf dispositions légales contraires.
        </p>

        <h2 style={{ marginTop: 24 }}>12. Données personnelles</h2>
        <p>
          Les données personnelles sont traitées conformément à la{" "}
          <a href="/confidentialite">politique de confidentialité</a>.
        </p>

        <h2 style={{ marginTop: 24 }}>13. Droit applicable</h2>
        <p>
          Les présentes CGV sont soumises au droit français. La zone de vente est limitée à la{" "}
          <strong>France</strong>.
        </p>
      </div>
    </main>
  );
}
