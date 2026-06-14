"use client";

import { GitHubIcon } from "./header";
import { TermsModal } from "@/components/modals/terms-modal";
import { PrivacyModal } from "@/components/modals/privacy-modal";

export function Footer() {
  return (
    <footer className="border-t border-border/50 py-8">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-6 text-center">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <a
            href="https://github.com/aefly/compress"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <GitHubIcon className="h-3.5 w-3.5" />
            GitHub
          </a>
          <span className="text-border">·</span>
          <TermsModal />
          <span className="text-border">·</span>
          <PrivacyModal />
        </div>
        <p className="text-[11px] text-muted-foreground/50">
          All compression happens in your browser. No files are uploaded.
        </p>
      </div>
    </footer>
  );
}
