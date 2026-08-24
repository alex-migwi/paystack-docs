# Paystack API Documentation Portal

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Markdoc](https://img.shields.io/badge/Markdoc-0.5.0-FF4088?style=flat-square)](https://markdoc.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

An enterprise-grade, self-documenting developer portal for the Paystack API. Built with Next.js 16 (App Router), React 19, Stripe Markdoc, and TypeScript, this application compiles enriched OpenAPI 3.0 specifications into an interactive, multi-language API documentation portal with zero spec drift.

---

## Key Features

- **Interactive API Explorer**:
  - Test endpoints directly from the browser with live HTTP request execution.
  - Automatic parameter resolution supporting `path`, `query`, `header`, `body`, and complex `allOf` schema compositions.
  - Secure local storage state management for secret keys and custom request headers.
- **12-Language Code Snippets**:
  - Dynamic snippet rendering across 12 languages and tools: `cURL`, `Node.js`, `Python`, `PHP`, `Ruby`, `Go`, `Java`, `C#`, `Swift`, `Kotlin`, `Rust`, and `Paystack CLI`.
- **Markdoc Enriched Overlays**:
  - Custom overlay system (`docs/overlays/*.md`) powered by Markdoc that allows injecting rich developer guides, architectural notes, and custom callouts onto spec-generated pages without modifying the central OpenAPI schema.
- **Decoupled Zero-Drift Spec Sync**:
  - Event-driven sync pipeline (`sync-enriched-spec.yml`) triggered via GitHub `repository_dispatch` from `paystack-spec-enriched`.
  - Automatic spec parsing, schema normalization, and static site generation for 170+ operations.

---

## Architecture Overview

```
┌──────────────────────────────────────┐
│       paystack-spec-enriched         │
│   (Builds paystack-enriched.json)    │
└──────────────────────────────────────┘
                   │
                   ▼ (GitHub repository_dispatch)
┌──────────────────────────────────────┐
│            paystack-docs             │
│   (.github/workflows/sync-spec.yml)  │
└──────────────────────────────────────┘
                   │
                   ├──► 1. `scripts/fetch-enriched-spec.js` (Downloads latest spec)
                   ├──► 2. `scripts/compile-openapi.js` (Generates public/paystack.json)
                   └──► 3. `next build` (SSG Build for 170+ endpoints & Markdoc overlays)
```

---

## Repository Structure

```
paystack-docs/
├── app/                      # Next.js App Router (Layouts, API Explorer routes, documentation pages)
├── components/               # UI Component Library
│   ├── ApiExplorer.tsx       # Main interactive API runner & request builder
│   ├── api-explorer/         # Sub-components (CodeSampleTabs, ResponseViewer, SecretKeyInput)
│   ├── MarkdownRenderer.tsx  # Dynamic Markdoc document engine
│   ├── MarkdocComponents.tsx # Custom UI nodes (Callouts, CodeBlocks, Badges)
│   └── SidebarNav.tsx        # Responsive API navigation tree
├── docs/                     # Documentation assets & guides
│   ├── DISPATCH_GUIDE.md     # Decoupled webhook dispatch integration guide
│   └── overlays/             # Markdown documentation overlays per endpoint operation
├── lib/                      # Core Utilities & Schemas
│   └── openapi.ts            # OpenAPI schema loader, parameter resolver, & snippet parser
├── markdoc/                  # Markdoc setup & custom tags configuration
│   ├── config.ts
│   └── tags/
├── public/                   # Static compiled assets
│   ├── paystack.json         # Processed OpenAPI 3.0 specification
│   └── spec-manifest.json    # Spec version metadata & operation counts
├── scripts/                  # Automated Spec Processing Pipelines
│   ├── fetch-enriched-spec.js# Downloads latest spec artifact from paystack-spec-enriched
│   ├── compile-openapi.js    # Pre-compiles & validates OpenAPI schema
│   └── generate-doc-stubs.js # Generates initial Markdoc overlay stubs for endpoints
└── .github/workflows/        # CI/CD Workflows
    ├── sync-enriched-spec.yml# Listens for repository_dispatch events
    └── sync-openapi.yml      # Scheduled/manual spec synchronization
```

---

## Getting Started

### Prerequisites

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Alex-Muturi/paystack-docs.git
   cd paystack-docs
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Synchronize & Compile OpenAPI Specification**:
   ```bash
   npm run sync-spec
   ```
   *This fetches `paystack-enriched.json` and compiles it into `public/paystack.json`.*

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to explore the API portal.

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server on `http://localhost:3000` |
| `npm run sync-spec` | Fetches the latest enriched OpenAPI spec and compiles it for the web app |
| `npm run compile-spec` | Pre-compiles and validates local OpenAPI specification schemas |
| `npm run generate-stubs`| Scans OpenAPI operations and generates missing Markdoc documentation overlay stubs |
| `npm run build` | Runs spec sync pipeline and compiles production bundle |
| `npm run start` | Starts the production Next.js server |
| `npm run lint` | Runs ESLint checks across the codebase |

---

## Decoupled Workflow & Dispatch

This documentation portal is decoupled from the OpenAPI specification source repository. When `paystack-spec-enriched` updates:

1. A `repository_dispatch` webhook triggers `.github/workflows/sync-enriched-spec.yml`.
2. The workflow automatically downloads the compiled `paystack-enriched.json`.
3. The spec compilation pipeline runs to produce an updated `public/paystack.json`.
4. Production site builds and deploys zero-drift documentation automatically.

For detailed dispatch setup instructions, consult [`docs/DISPATCH_GUIDE.md`](./docs/DISPATCH_GUIDE.md).

---

## License & Assessment Notice

This repository was created by Alex Muturi as part of the technical assessment for the DevEx Lead position at Paystack.

This project is licensed under the [Candidate Assessment License](LICENSE) strictly for candidate evaluation and review purposes. All rights to production deployment, commercial usage, or integration into Paystack/Stripe products are reserved pending employment or licensing agreements.

