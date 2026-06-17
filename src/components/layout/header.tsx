"use client";

import { Shrink } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { GitHubIcon } from "@/components/icons";
import { site } from "@/site.config";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full glass">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5 font-semibold tracking-tight"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
            <Shrink className="h-4 w-4" />
          </div>
          <span className="text-sm transition-colors duration-300 group-hover:text-primary">Compress</span>
          <sup className="text-[9px] font-normal text-primary relative -top-1 drop-shadow-[0_0_6px_var(--primary)]">v{site.version}</sup>
        </Link>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <a
            href={site.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 w-12 items-center justify-center rounded-lg hover:bg-muted transition-colors"
          >
            <GitHubIcon className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}