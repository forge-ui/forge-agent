import { type ReactNode } from "react";
import { apps } from "@/app/_mock/apps";

export function generateStaticParams() {
  return apps.map((a) => ({ appId: a.slug }));
}

export default function AppIdLayout({ children }: { children: ReactNode }) {
  return children;
}
