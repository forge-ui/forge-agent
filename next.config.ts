import type { NextConfig } from "next";

// 走 GitHub Pages 部署时打开静态导出。
// 部署在子域 agent.forgeui.org 上，不需要 basePath 前缀；
// 仍保留 NEXT_PUBLIC_BASE_PATH 占位以便 lib/asset.ts 兼容。
const isGhPages = process.env.GITHUB_PAGES === "true";
const isProd = process.env.NODE_ENV === "production";
const umoOrigin = process.env.NEXT_PUBLIC_UMO_ORIGIN?.replace(/\/$/, "");

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https: ws: wss:",
  "worker-src 'self' blob:",
  `frame-src 'self' blob: https: ${umoOrigin ?? ""} https://codesandbox.io https://*.codesandbox.io`,
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const umoAssetHeaders = [
  { key: "Access-Control-Allow-Origin", value: "*" },
  { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self' data: blob:",
      "script-src 'self' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https: ws: wss:",
    ].join("; "),
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
];

const nextConfig: NextConfig = {
  output: isGhPages ? "export" : undefined,
  images: { unoptimized: isGhPages },
  trailingSlash: isGhPages,
  env: {
    NEXT_PUBLIC_BASE_PATH: "",
  },
  async headers() {
    if (isGhPages) return [];
    const headers = [
      {
        source: "/umo/:path*",
        headers: umoAssetHeaders,
      },
    ];
    if (!isProd) return headers;
    return [
      ...headers,
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
