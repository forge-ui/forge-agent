import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Forge Agent",
  description: "AI Agent 产品壳 · Next.js 16 + Tailwind v4 + @forge-ui-official/core",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
