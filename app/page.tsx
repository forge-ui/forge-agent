"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_APP_SLUG } from "./_mock/apps";

export default function RootRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace(`/${DEFAULT_APP_SLUG}/chat`);
  }, [router]);
  return null;
}
