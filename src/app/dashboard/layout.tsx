"use client";
import { ReactNode, useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardAuthGuard } from "@/components/dashboard/auth-guard";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { SidebarProvider, useSidebar } from "@/components/dashboard/SidebarContext";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SidebarProvider>
      <SidebarLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
        {children}
      </SidebarLayout>
    </SidebarProvider>
  );
}

function SidebarLayout({ children, sidebarOpen, setSidebarOpen }: { children: ReactNode, sidebarOpen: boolean, setSidebarOpen: (open: boolean) => void }) {
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen flex bg-muted">
      {/* Sidebar desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      {/* Sidebar mobile (overlay) */}
      <div className="block md:hidden">
        {sidebarOpen && (
          <div className="fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="fixed left-0 top-0 h-full w-64 bg-background border-r border-border">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <span className="text-lg font-semibold">Menu</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <Sidebar />
            </div>
          </div>
        )}
      </div>
      {/* Contenu principal */}
      <main className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? "md:ml-16" : "md:ml-64"}`}>
        {/* Header mobile avec bouton menu */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-background">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <span className="text-lg font-semibold">Trash Mboa</span>
          <div className="w-10" /> {/* Spacer pour centrer le titre */}
        </div>
        {/* Contenu */}
        <div className="flex-1 p-4 md:p-8 lg:p-12">
          <DashboardAuthGuard>
            {children}
          </DashboardAuthGuard>
        </div>
      </main>
    </div>
  );
} 