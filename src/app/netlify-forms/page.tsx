export const dynamic = "force-static";

export default function NetlifyForms() {
  return (
    <div style={{ display: "none" }}>
      <form name="quote" method="POST" data-netlify="true">
        <input type="hidden" name="form-name" value="quote" />
        <input name="product_id" />
        <input name="variant_sku" />
        <input name="product_label" />
        <input name="quantity" />
        <input name="name" />
        <input name="email" />
        <input name="company" />
        <textarea name="message" />
      </form>
    </div>
  );
}
