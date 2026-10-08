# Slate: rendering and DOM

## Inline void rendering

- Legacy Slate's mentions example wraps the mention inline void in a `contentEditable={false}` span with a nested `contentEditable={false}` div, commented as stopping Chromium from interrupting IME when the cursor moves, and puts `children` before the label on macOS and after it elsewhere (`ianstormtaylor/slate@945a484d:site/examples/ts/mentions.tsx:263-285`). Plite's mentions example renders the mention body as a plain span through `renderVoid` (`apps/www/src/app/(app)/examples/plite/_examples/mentions.tsx:322-381`), and the 2026-06-14 run declined to copy the wrapper because its mention rows passed without it and the Firefox select-all crash was a keyboard-ownership bug. Source: `docs/plite/research/2026-06-14-firefox-inline-void-select-all-replacement/read-log.tsv:14`, `rejected-ledger.tsv:3`; the run's `README.md:59` and `shards/001-source-scan.md:15` write legacy Slate as `%%UPSTREAM_PLITE_CAP%%` (rename damage).
