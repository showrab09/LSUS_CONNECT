import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent browsers from MIME-sniffing the content type
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Prevent the page from being embedded in an iframe (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // Stop sending the Referer header to cross-origin destinations
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Enforce HTTPS for 1 year, include subdomains
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Restrict browser features this site can use
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Content Security Policy
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js inline scripts + Supabase realtime
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // Tailwind inline styles
      "style-src 'self' 'unsafe-inline'",
      // Images: self, data URIs (base64 uploads), and Supabase storage
      "img-src 'self' data: blob: https://*.supabase.co",
      // API calls to Supabase and Resend
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "font-src 'self'",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
