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

- `AI_GATEWAY_API_KEY` – AI Gateway API key ([get one here](https://vercel.com/ai-gateway))
- `UPLOADTHING_TOKEN` – UploadThing API key ([get one here](https://uploadthing.com/dashboard))

Start the development server:

```bash
bun dev
```

Visit http://localhost:3000/editor to see the editor in action.
