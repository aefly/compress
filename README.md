<img src="./.img/banner.png" alt="Banner" />

<h1 align="center">Compress</h1>

<p align="center"><strong>Privacy-First Image Compression</strong></p>

<p align="center">
  <a href="https://compress.ntcp.cloud">Live Demo</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000.svg?style=flat&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/shadcn/ui-000000.svg?style=flat&logo=shadcn/ui&logoColor=white" alt="shadcn/ui" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-06B6D4.svg?style=flat&logo=Tailwind-CSS&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=flat&logo=TypeScript&logoColor=white" alt="TypeScript" />
</p>

---

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#commands">Commands</a> •
  <a href="#license">License</a>
</p>

---

# Overview

Compress is a web application that compresses images directly in the browser.
All processing happens client-side — no files are ever uploaded to a server.
This guarantees complete privacy for the user.

## Features

- **100% Client-Side** — Files never leave the browser. Zero server uploads.
- **Multiple Formats** — JPG, JPEG, PNG, WebP, GIF, and BMP (max 50 MB per file).
- **Batch Processing** — Compress up to 10 files at once.
- **Before/After Comparison** — Compare compressed and original images side by side.

## Tech Stack

| Layer         | Choice                                                     |
| ------------- | ---------------------------------------------------------- |
| Framework     | Next.js (App Router)                                       |
| UI Components | shadcn/ui                                                  |
| Styling       | Tailwind CSS v4                                            |
| Language      | TypeScript                                                 |
| Compression   | Canvas (JPEG/WebP/BMP), upng-js (PNG), gifsicle-wasm (GIF) |

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
git clone https://github.com/aefly/compress.git
cd compress
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Commands

| Command             | Description              |
| ------------------- | ------------------------ |
| `npm run dev`       | Start development server |
| `npm run build`     | Production build         |
| `npm run start`     | Serve production build   |
| `npm run lint`      | Run ESLint               |
| `npm run typecheck` | Run TypeScript checks    |
| `npm run test`      | Run tests                |

## License

This project is under the [MIT License](./LICENSE).
