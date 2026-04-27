import type { NextConfig } from "next";

// 走 GitHub Pages 部署时打开静态导出。
// 部署在子域 agent.forgeui.org 上，不需要 basePath 前缀；
// 仍保留 NEXT_PUBLIC_BASE_PATH 占位以便 lib/asset.ts 兼容。
const isGhPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: isGhPages ? "export" : undefined,
  images: { unoptimized: isGhPages },
  trailingSlash: isGhPages,
  env: {
    NEXT_PUBLIC_BASE_PATH: "",
  },
};

export default nextConfig;
