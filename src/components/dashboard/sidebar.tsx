"use client";

import { useSidebar } from "./SidebarContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, User, Trash2, History, AlertTriangle, Home, Truck, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/store/auth-store-v2";
import { useIsAdmin, useIsCollector, useUserRole } from "@/store/auth-store-v2";
import { useUserDechets } from "@/hooks/use-dechets-api";
import { useUserSignalements } from "@/hooks/use-signalements-api";

export function Sidebar() {
  const { collapsed, setCollapsed } = useSidebar();
  const pathname = usePathname();
  const { logout } = useAuth();
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const isCollector = useIsCollector();
  const role = useUserRole();
  const { data: dechets } = useUserDechets();
  const { data: signalements } = useUserSignalements();

  // Filtrage par user connecté (sauf pour les collecteurs/admins)
  let dechetsFiltres = dechets || [];
  let signalementsFiltres = signalements || [];
  if (user && role !== 'COLLECTOR' && role !== 'ADMIN') {
    dechetsFiltres = dechetsFiltres.filter((d: any) => d.userId === user.id);
    signalementsFiltres = signalementsFiltres.filter((s: any) => s.userId === user.id);
  }
  const nonTraites = dechetsFiltres.filter((d: any) => d.statut !== "TRAITE" && d.statut !== "TERMINEE").length;
  const nonTraitesSignalements = signalementsFiltres.filter((s: any) => s.statut !== "TRAITE" && s.statut !== "TERMINEE").length;

  return (
    <aside
      className={`
        bg-background flex flex-col transition-all duration-300
        ${collapsed ? "md:w-16" : "md:w-64"}
        md:fixed md:top-0 md:left-0 md:z-30 md:h-screen md:border-r
        w-64
      `}
    >
      <div className="flex items-center justify-between px-2 py-3">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage 
                src={(user as any)?.photoUrl} 
                alt={user?.name || user?.email || "Photo de profil"}
              />
              <AvatarFallback>{user?.name?.[0] || user?.email?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">{user?.name || user?.email}</div>
              <div className="text-xs text-muted-foreground capitalize">{user?.role?.toLowerCase()}</div>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Déplier la barre" : "Réduire la barre"}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </Button>
      </div>
      <hr className="my-2 border-muted" />
      <nav className="flex flex-col gap-2 flex-1">
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-accent ${
            pathname === "/dashboard"
              ? "bg-accent text-accent-foreground"
              : "text-foreground/60 hover:text-foreground hover:bg-accent/10"
          }`}
        >
          <Home className="w-5 h-5" />
          {!collapsed && <span className="text-sm font-medium">Accueil</span>}
        </Link>
        <Link
          href="/dashboard/dechets"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-accent ${
            pathname === "/dashboard/dechets"
              ? "bg-accent text-accent-foreground"
              : "text-foreground/60 hover:text-foreground hover:bg-accent/10"
          }`}
        >
          <Trash2 className="w-5 h-5" />
          {!collapsed && (
            <span className="text-sm font-medium flex items-center gap-2">
              Mes déchets
              {nonTraites > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-700 rounded-full px-2 text-xs">{nonTraites}</span>
              )}
            </span>
          )}
        </Link>
        {role !== 'COLLECTOR' && (
          <Link
            href="/dashboard/signalements"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-accent ${
              pathname === "/dashboard/signalements"
                ? "bg-accent text-accent-foreground"
                : "text-foreground/60 hover:text-foreground hover:bg-accent/10"
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
            {!collapsed && (
              <span className="text-sm font-medium flex items-center gap-2">
                Signalements
                {nonTraitesSignalements > 0 && (
                  <span className="ml-2 bg-orange-100 text-orange-700 rounded-full px-2 text-xs">{nonTraitesSignalements}</span>
                )}
              </span>
            )}
          </Link>
        )}
        <Link
          href="/dashboard/historique"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-accent ${
            pathname === "/dashboard/historique"
              ? "bg-accent text-accent-foreground"
              : "text-foreground/60 hover:text-foreground hover:bg-accent/10"
          }`}
        >
          <History className="w-5 h-5" />
          {!collapsed && <span className="text-sm font-medium">Historique</span>}
        </Link>
        <hr className="my-4 border-muted" />
        {isAdmin && (
          <>
            <Link
              href="/dashboard/users"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-accent ${
                pathname === "/dashboard/users"
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground/60 hover:text-foreground hover:bg-accent/10"
              }`}
            >
              <User className="w-5 h-5" />
              {!collapsed && <span className="text-sm font-medium">Utilisateurs</span>}
            </Link>
            <Link
              href="/dashboard/collectes"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-accent ${
                pathname === "/dashboard/collectes"
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground/60 hover:text-foreground hover:bg-accent/10"
              }`}
            >
              <Truck className="w-5 h-5" />
              {!collapsed && <span className="text-sm font-medium">Collectes</span>}
            </Link>
            <Link
              href="/dashboard/rapports"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-accent ${
                pathname === "/dashboard/rapports"
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground/60 hover:text-foreground hover:bg-accent/10"
              }`}
            >
              <FileText className="w-5 h-5" />
              {!collapsed && <span className="text-sm font-medium">Rapports</span>}
            </Link>
          </>
        )}
        {isCollector && !isAdmin && (
          <Link
            href="/dashboard/collectes"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-accent ${
              pathname === "/dashboard/collectes"
                ? "bg-accent text-accent-foreground"
                : "text-foreground/60 hover:text-foreground hover:bg-accent/10"
            }`}
          >
            <Truck className="w-5 h-5" />
            {!collapsed && <span className="text-sm font-medium">Collectes</span>}
          </Link>
        )}
        <hr className="my-4 border-muted" />
        <Link
          href="/dashboard/profil"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-accent ${
            pathname === "/dashboard/profil"
              ? "bg-accent text-accent-foreground"
              : "text-foreground/60 hover:text-foreground hover:bg-accent/10"
          }`}
        >
          <User className="w-5 h-5" />
          {!collapsed && <span className="text-sm font-medium">Profil</span>}
        </Link>
      </nav>
      <div className="mt-auto mb-2 px-2">
        <Button
          variant="ghost"
          className="w-full flex items-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={logout}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Déconnexion</span>}
        </Button>
      </div>
    </aside>
  );
} 