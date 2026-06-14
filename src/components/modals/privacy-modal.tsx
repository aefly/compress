"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function PrivacyModal() {
    return (
        <Dialog>
            <DialogTrigger className="hover:text-foreground transition-colors">
                Privacy
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Privacy Policy</DialogTitle>
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
                            Data Collection
                        </h3>
                        <p>
                            We collect nothing. No files, no cookies, no
                            analytics, no tracking.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h3 className="font-medium text-foreground">
                            Client-Side Only
                        </h3>
                        <p>
                            All compression runs in your browser. Your files
                            never leave your device.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h3 className="font-medium text-foreground">
                            Local Storage
                        </h3>
                        <p>
                            We only store your theme preference (light/dark
                            mode). That&rsquo;s it.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h3 className="font-medium text-foreground">
                            Open Source
                        </h3>
                        <p>
                            The project is open-source and hosted on{" "}
                            <a
                                href="https://github.com/aefly/compress"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary underline underline-offset-2"
                            >
                                GitHub
                            </a>
                            . You can contribute to this project to make it
                            better.
                        </p>
                    </section>
                </div>
            </DialogContent>
        </Dialog>
    );
}
