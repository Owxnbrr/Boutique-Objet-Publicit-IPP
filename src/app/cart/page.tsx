import CartClient from './CartClient';

export default function CartPage() {
  return (
    <section className="container">
      <h1 className="h1">Votre panier</h1>
      <CartClient />
    </section>
  );
}
