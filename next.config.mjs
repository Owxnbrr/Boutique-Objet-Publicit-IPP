/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "images.unsplash.com",
      "via.placeholder.com",
      "data.cdn-andapresent.com"
    ],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // ⚠️ Stripe.js
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              // Dev HMR + Stripe API/telemetry
              "connect-src 'self' https: ws: wss: https://api.stripe.com https://m.stripe.network https://r.stripe.com",
              // iframes Stripe
              "frame-src 'self' https: https://js.stripe.com",
              "base-uri 'self'",
              "form-action 'self' https:"
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
