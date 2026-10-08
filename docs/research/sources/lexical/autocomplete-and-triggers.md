# Lexical: autocomplete and triggers

## Autolink

- **AutoLinks e2e.** `AutoLinks.spec.mjs` covers the autolink plugin: URL and email matching, delimiter tokenization, invalid URL grammar, unlinking and relinking, an unlinked autolink that stays unlinked, emoji shortcodes next to links, font and style rows, and pasting a single URL. Only the paste row is editor behavior; the matching grammar is link-plugin policy. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:800`, extracted on 2026-05-09 from an unpinned Lexical checkout. Limit: row families only, not rerun.
