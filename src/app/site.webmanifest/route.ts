import { NextResponse } from "next/server";
import { site, favicon } from "@/site.config";

function getIconType(path: string): string {
    if (path.endsWith(".svg")) return "image/svg+xml";
    if (path.endsWith(".png")) return "image/png";
    if (path.endsWith(".ico")) return "image/x-icon";
    return "image/svg+xml";
}

export async function GET() {
    const manifest = {
        name: site.title,
        short_name: site.name,
        description: site.shortDescription,
        start_url: "/",
        display: "standalone",
        background_color: "#09090b",
        theme_color: site.themeColor,
        icons: favicon.endsWith(".svg")
            ? [
                  { src: favicon, sizes: "any", type: "image/svg+xml" },
              ]
            : [
                  { src: favicon, sizes: "192x192", type: getIconType(favicon) },
                  { src: favicon, sizes: "512x512", type: getIconType(favicon) },
              ],
    };

    return NextResponse.json(manifest, {
        headers: {
            "Cache-Control": "public, max-age=3600",
        },
    });
}