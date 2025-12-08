export const dynamic = "force-static";

export default function NetlifyForms() {
  return (
    <div style={{ display: "none" }}>
      <form
        name="quote"
        method="POST"
        data-netlify="true"
        netlify-honeypot="bot-field"
      >
        <input type="hidden" name="form-name" value="quote" />

        <p hidden>
          <label>
            Don’t fill this out: <input name="bot-field" />
          </label>
        </p>

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
