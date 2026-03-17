"use client";

import { useAuth } from "@/lib/auth-context";
import { useLayoutEffect } from "react";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const me = useAuth();

  useLayoutEffect(() => {
    if (me.profile && me.profile?.roles[0] !== "admin") {
      window.location.href = `/dashboard/${me.profile.roles[0]}`;
    }
  }, [me]);

  return <>{children}</>;
}
