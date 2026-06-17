/**
 * Site-wide configuration
 *
 * All values here are read at build time. To change them at runtime,
 * either edit this file or rebuild the app
 */
export const site = {
    // Global
    name: "Compress",
    version: "0.1.1",

    // SEO
    title: "Compress — Privacy-First Image Compression",
    description:
        "Compress images entirely in your browser. No uploads, no server, full privacy. Supports JPEG, PNG, WebP, GIF, BMP, and more.",
    shortDescription:
        "Compress images entirely in your browser. No uploads, no server, full privacy.",
    url: "https://compress.ntcp.cloud",
    authors: [{ name: "aefly" }],
    keywords: [
        "image compression",
        "compress images",
        "privacy",
        "client-side",
        "open-source",
        "browser",
        "JPEG",
        "JPG",
        "PNG",
        "WebP",
        "GIF",
        "BMP",
    ],

    // Theme
    /** Primary accent color (hex). Used directly in light mode; lightened 40% for dark mode via color-mix() */
    themeColor: "#7c3aed",

    // Favicon
    /** Custom favicon path (e.g. "/my-icon.png"). Leave empty to use the default "/favicon/svg" */
    favicon: "",

    // Links
    githubUrl: "https://github.com/aefly/compress",
};

/** Falls back to the default SVG when site.favicon is empty */
const DEFAULT_FAVICON = "/favicon.svg";

export const favicon = site.favicon || DEFAULT_FAVICON;
