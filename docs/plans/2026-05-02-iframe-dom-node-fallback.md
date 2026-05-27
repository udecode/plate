# Iframe DOM Node Fallback

## Goal

Fix `Cannot resolve a Slate node from DOM node: [object HTMLParagraphElement]` when clicking inside `/examples/iframe`.

## Current Take

This is not the DOM coverage boundary feature failing. The iframe paragraph is mounted DOM, but `DOMEditor.toSlateNode` can lose or miss the `ELEMENT_TO_NODE` weak-map entry. The fallback should use Slate-owned mounted metadata (`data-slate-path`) only when the DOM node is inside the editor and the path still exists.

## Plan

1. Reproduce the iframe click crash in the browser and capture console evidence.
2. Add a regression for `toSlateNode` recovering from a mounted element with `data-slate-path` but no weak-map entry.
3. Patch the DOM bridge fallback without accepting arbitrary foreign DOM.
4. Verify focused tests, package checks, lint, and browser click behavior.

## Verification

- Done: `bun test ./test/bridge.test.ts` in
  `/Users/zbeyens/git/slate-v2/packages/slate-dom`.
- Done: `bun --filter slate-react test:vitest -- test/rendered-dom-shape-contract.test.tsx`
  in `/Users/zbeyens/git/slate-v2`.
- Done: `bun --filter slate-dom typecheck`.
- Done: `bun --filter slate-react typecheck`.
- Done: `bun lint:fix`.
- Done: `dev-browser --connect http://127.0.0.1:9222` against
  `http://localhost:3100/examples/iframe`: iframe Slate paragraphs/text spans
  expose `data-slate-path` and clicking the first paragraph produces no page or
  console errors.
- Done: `bun run completion-check` in `/Users/zbeyens/git/plate-2`.
- Note: full `pnpm lint:fix` in `/Users/zbeyens/git/plate-2` is blocked by
  existing benchmark/tooling diagnostics unrelated to this docs-side checkpoint;
  Biome ignores the touched markdown plan/solution files.
