"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <span className="text-sm font-medium">Tent &mdash; {profile?.roles[0] ?? ""}</span>
        <button
          onClick={() => logout().then(() => router.replace("/auth"))}
          className="text-sm underline"
        >
          Logout
        </button>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
