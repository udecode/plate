# Playground Template

A Next.js template with [Plate](https://platejs.org/) AI, plugins and components.

## Features

- Next.js 16
- [Plate](https://platejs.org/) editor
- [shadcn/ui](https://ui.shadcn.com/)
- [MCP](https://platejs.org/docs/components/mcp)

## Requirements

- Node.js 20+
- bun

## Installation

Choose one of these methods:

### 1. Using CLI (Recommended)

```bash
npx shadcn@latest add @plate/editor-ai
```

### 2. Using Template

[Use this template](https://github.com/udecode/plate-playground-template/generate), then install dependencies:

```bash
bun install
```

## Development

Copy the example env file:

```bash
cp .env.example .env.local
```

Configure `.env.local`:

- `UPLOADTHING_TOKEN` – UploadThing API key ([get one here](https://uploadthing.com/dashboard))

Enter your own [AI Gateway key](https://vercel.com/ai-gateway) in the editor settings to use AI. The example API routes use the caller's key.

Uploads work in local development. Before enabling production uploads, replace the development check in `src/lib/uploadthing.ts` with your application's session and permission checks. Add per-user upload limits.

If your application uses a shared server AI credential, authorize each request and enforce per-user usage limits before calling the provider. Keep server credentials out of client code.

Start the development server:

```bash
bun dev
```

Visit http://localhost:3000/editor to see the editor in action.
