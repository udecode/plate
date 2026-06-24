# Examples

This directory contains the Slate example source used by the local examples
site and Playwright integration suite.

Start with the stable editor examples:

- [Plain text](./ts/plaintext.tsx)
- [Rich text](./ts/richtext.tsx)
- [Markdown shortcuts](./ts/markdown-shortcuts.tsx)
- [Inlines](./ts/inlines.tsx)
- [Editable voids](./ts/editable-voids.tsx)
- [Images](./ts/images.tsx)
- [Tables](./ts/tables.tsx)
- [Paste HTML](./ts/paste-html.tsx)
- [Search highlighting](./ts/search-highlighting.tsx)
- [Code highlighting](./ts/code-highlighting.tsx)
- [Huge document](./ts/huge-document.tsx)

V2-specific examples cover document state, hidden DOM coverage, multi-root
documents, synced blocks, comment mode, async decorations, and persistent
annotation anchors.

Pagination is an alpha example. Treat it as research and proof infrastructure,
not the default editor path.

## Running Examples

Install dependencies and build the workspace when needed:

```text
bun install
bun run build
```

Start the examples server:

```text
bun dev
```

Open `http://localhost:3100` in your browser.

Focused browser proof uses the Playwright package script:

```text
bun run playwright playwright/integration/examples/richtext.test.ts --project=chromium
```
