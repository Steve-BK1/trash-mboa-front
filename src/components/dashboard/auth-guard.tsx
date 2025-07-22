"use client";
import { useAuth } from "@/store/auth-store-v2";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export function DashboardAuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirect("/login");
    }
  }, [isLoading, isAuthenticated]);

  return <>{children}</>;
} 