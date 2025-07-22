"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 p-1 rounded-md bg-muted/50">
        <div className="w-4 h-4 bg-muted-foreground/20 rounded animate-pulse" />
      </div>
    );
  }

  const themes = [
    { value: "light", icon: Sun, label: "Clair" },
    { value: "dark", icon: Moon, label: "Sombre" },
    { value: "system", icon: Monitor, label: "Système" },
  ];

  return (
    <div className="flex items-center gap-1 p-1 rounded-md bg-muted/50 border border-border">
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`p-1 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-accent
            ${theme === value
              ? "bg-accent text-accent-foreground shadow"
              : "text-foreground/70 hover:text-foreground hover:bg-muted"
            }`}
          title={label}
          aria-label={label}
        >
          <Icon className="w-5 h-5" />
        </button>
      ))}
    </div>
  );
} 