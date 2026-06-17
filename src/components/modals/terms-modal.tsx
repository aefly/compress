"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function TermsModal() {
    return (
        <Dialog>
            <DialogTrigger className="hover:text-foreground transition-colors">
                Terms
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Terms of Service</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                    <p>
                        <strong className="text-foreground">
                            Last updated:
                        </strong>{" "}
                        June 2026
                    </p>

                    <section className="space-y-2">
                        <h3 className="font-medium text-foreground">
                            Free & Open Source
                        </h3>
                        <p>
                            Compress is free, open-source (MIT license),
                            requires no sign-up, and has no usage limits.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h3 className="font-medium text-foreground">
                            Your Privacy
                        </h3>
                        <p>
                            All processing happens in your browser. No files are
                            uploaded. No data is collected or stored.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h3 className="font-medium text-foreground">
                            Your Files
                        </h3>
                        <p>
                            You own your files. We claim no rights. Everything
                            is deleted when you close the page.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h3 className="font-medium text-foreground">
                            No Warranties
                        </h3>
                        <p>
                            Provided &ldquo;as is&rdquo;. We don&rsquo;t
                            guarantee specific results or uninterrupted service.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h3 className="font-medium text-foreground">
                            Liability
                        </h3>
                        <p>
                            We are not liable for any damages. Use at your own
                            risk. Keep backups.
                        </p>
                    </section>
                </div>
            </DialogContent>
        </Dialog>
    );
}