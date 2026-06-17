import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { site, favicon } from "@/site.config";
import "./globals.css";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
    variable: "--font-jetbrains-mono",
    subsets: ["latin"],
    display: "swap",
});

export const metadata: Metadata = {
    metadataBase: new URL(site.url),
    title: site.title,
    description: site.description,
    keywords: site.keywords,
    authors: site.authors,
    alternates: {
        canonical: site.url,
    },
    icons: {
        icon: favicon,
        shortcut: favicon,
        apple: "/apple-touch-icon.png",
    },
    openGraph: {
        title: site.title,
        description: site.shortDescription,
        url: site.url,
        siteName: site.name,
        type: "website",
        locale: "en_US",
    },
    twitter: {
        card: "summary_large_image",
        title: site.title,
        description: site.shortDescription,
    },
    other: {
        "theme-color": site.themeColor,
    },
    manifest: "/site.webmanifest",
};

// Runs before React hydrates to:
// 1. Set --primary-source CSS variable from site.themeColor (needed for light/dark theming)
// 2. Apply the "dark" class if the user's preference is dark (prevents flash-of-wrong-theme)
// Uses `var` and no arrow functions for maximum compatibility (runs synchronously in <head>)
const themeScript = `
(function() {
  try {
    document.documentElement.style.setProperty('--primary-source', ${JSON.stringify(site.themeColor)});
    var t = localStorage.getItem('theme');
    if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  } catch(e) {}
})()
`;

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
            suppressHydrationWarning
        >
            <head>
                <script dangerouslySetInnerHTML={{ __html: themeScript }} />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "WebApplication",
                            name: site.name,
                            description: site.description,
                            url: site.url,
                            applicationCategory: "MultimediaApplication",
                            operatingSystem: "Any",
                            offers: {
                                "@type": "Offer",
                                price: "0",
                                priceCurrency: "USD",
                            },
                            featureList: [
                                "Client-side image compression",
                                "No file uploads required",
                                "100% private - files never leave your browser",
                                "Supports JPEG, PNG, WebP, GIF, BMP",
                            ],
                        }),
                    }}
                />
            </head>
            <body className="min-h-full flex flex-col dot-pattern">
                <ThemeProvider>
                    <Header />
                    <main className="flex-1">{children}</main>
                    <Footer />
                </ThemeProvider>
            </body>
        </html>
    );
}
