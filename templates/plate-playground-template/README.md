# Playground Template

A Next.js 15 template with [Plate](https://platejs.org/) AI, plugins and components.

## Features

- Next.js 15 App Directory
- [Plate](https://platejs.org/) editor
- [shadcn/ui](https://ui.shadcn.com/)

## Installation

Choose one of these methods:

### 1. Using CLI (Recommended)

```bash
npx shadcx@latest init -u https://platejs.org/r
```

```bash
npx shadcx@latest add editor-ai -r plate
```

### 2. Using Template

[Use this template](https://github.com/plate-editor/plate-template/generate), then install dependencies:

```bash
pnpm install
```

## Development

Copy the example env file:

```bash
cp .env.example .env.local
```

Configure `.env.local`:

- `OPENAI_API_KEY` – OpenAI API key ([get one here](https://platform.openai.com/account/api-keys))

Start the development server:

```bash
pnpm dev
```

Visit http://localhost:3000/editor to see the editor in action.
