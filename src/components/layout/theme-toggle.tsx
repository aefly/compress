/**
 * Theme toggle button
 *
 * Uses `resolvedTheme` from next-themes (not just `theme`) so that when
 * the theme is set to "system", the icon correctly reflects whether the
 * user's OS preference is dark or light
 */
"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useSyncExternalStore } from "react";

/** Returns false during SSR and true after hydration to avoid mismatch */
function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const isDark = mounted && (resolvedTheme === "dark" || theme === "dark");

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className="size-12"
    >
      <div className="relative h-4 w-4">
        <Sun
          className={`theme-toggle-icon absolute inset-0 h-4 w-4 ${
            isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
          }`}
        />
        <Moon
          className={`theme-toggle-icon absolute inset-0 h-4 w-4 ${
            isDark ? "-rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
          }`}
        />
      </div>
    </Button>
  );
}