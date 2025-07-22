"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LogIn, User, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/store/auth-store-v2";
import { useRouter } from "next/navigation";

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      setTimeout(() => {
        router.push("/");
      }, 1200); // Laisse le toast s'afficher avant la redirection
    } catch (e) {
      // Optionnel : gestion d'erreur locale
    }
  };

  return (
    <header className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8 py-4 sm:py-6 relative z-20 bg-background/80 backdrop-blur-xl border-b border-border/50 w-full">
      <div className="flex items-center gap-3 mb-2 sm:mb-0">
        <span className="text-xl font-semibold tracking-tight text-foreground">Trash Mboa</span>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        <nav className="flex gap-6 sm:gap-10 text-sm font-medium text-foreground/80 mb-2 sm:mb-0">
          <a href="#features" className="hover:text-foreground transition-colors duration-200">Fonctionnalités</a>
          <a href="#about" className="hover:text-foreground transition-colors duration-200">À propos</a>
          <a href="#impact" className="hover:text-foreground transition-colors duration-200">Impact</a>
          <a href="#contact" className="hover:text-foreground transition-colors duration-200">Contact</a>
        </nav>
        <ThemeToggle />
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-accent/10 rounded-full">
              <User className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground">
                {user?.name || 'Utilisateur'}
              </span>
              <ChevronDown className="w-3 h-3 text-foreground/60" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-foreground/60 hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-foreground/80 hover:text-foreground"
              >
                <span><LogIn className="w-4 h-4 mr-2" />Connexion</span>
              </Button>
            </Link>
            <Link href="/register">
              <Button
                asChild
                size="sm"
                className="bg-accent hover:bg-accent/90"
              >
                <span>Inscription</span>
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
} 