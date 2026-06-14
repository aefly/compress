import { ImageResponse } from "next/og";
import { site } from "@/site.config";

export const alt = site.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const tags = [
  {
    label: "No Uploads",
    icon: [
      ["path", { d: "M12 3v12" }],
      ["path", { d: "m17 8-5-5-5 5" }],
      ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }],
    ],
  },
  {
    label: "100% Private",
    icon: [
      [
        "path",
        {
          d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
        },
      ],
    ],
  },
  {
    label: "Open Source",
    icon: [
      ["path", { d: "m16 18 6-6-6-6" }],
      ["path", { d: "m8 6-6 6 6 6" }],
    ],
  },
];

function SvgIcon({
  paths,
  size = 16,
  color = "#a78bfa",
}: {
  paths: [string, Record<string, string>][];
  size?: number;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      {paths.map(([Tag, attrs], i) => (
        <Tag key={i} {...attrs} />
      ))}
    </svg>
  );
}

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#09090b",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 12,
              background: "rgba(124, 58, 237, 0.15)",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#a78bfa"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="m15 15 6 6m-6-6v4.8m0-4.8h4.8" />
              <path d="M9 19.8V15m0 0H4.2M9 15l-6 6" />
              <path d="M15 4.2V9m0 0h4.8M15 9l6-6" />
              <path d="M9 4.2V9m0 0H4.2M9 9 3 3" />
            </svg>
          </div>
          <span
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "#fafafa",
              letterSpacing: "-0.02em",
            }}
          >
            Compress
          </span>
        </div>

        <span
          style={{
            fontSize: 24,
            color: "#a1a1aa",
            fontWeight: 400,
          }}
        >
          Privacy-First Image Compression
        </span>

        <div
          style={{
            display: "flex",
            gap: 32,
            marginTop: 48,
          }}
        >
          {tags.map((tag) => (
            <div
              key={tag.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid rgba(124, 58, 237, 0.2)",
                background: "rgba(124, 58, 237, 0.05)",
                fontSize: 16,
                color: "#a78bfa",
                fontWeight: 500,
              }}
            >
              <SvgIcon paths={tag.icon as [string, Record<string, string>][]} />
              {tag.label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
