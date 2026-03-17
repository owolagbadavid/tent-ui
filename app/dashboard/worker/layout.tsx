"use client";

import { useAuth } from "@/lib/auth-context";
import React, { useLayoutEffect } from "react";

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const me = useAuth();

  useLayoutEffect(() => {
    if (me.profile && me.profile?.roles[0] !== "worker") {
      window.location.href = `/dashboard/${me.profile.roles[0]}`;
    }
  }, [me]);

  return <>{children}</>;
};

export default Layout;
