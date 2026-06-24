# Iframe DOM Node Fallback

## Goal

Fix `Cannot resolve a Plite node from DOM node: [object HTMLParagraphElement]` when clicking inside `/examples/iframe`.

## Current Take

This is not the DOM coverage boundary feature failing. The iframe paragraph is mounted DOM, but `DOMEditor.toPliteNode` can lose or miss the `ELEMENT_TO_NODE` weak-map entry. The fallback should use Plite-owned mounted metadata (`data-plite-path`) only when the DOM node is inside the editor and the path still exists.

## Plan

1. Reproduce the iframe click crash in the browser and capture console evidence.
2. Add a regression for `toPliteNode` recovering from a mounted element with `data-plite-path` but no weak-map entry.
3. Patch the DOM bridge fallback without accepting arbitrary foreign DOM.
4. Verify focused tests, package checks, lint, and browser click behavior.

## Verification

- Done: `bun test ./test/bridge.test.ts` in
  `/Users/zbeyens/git/plite/packages/plite-dom`.
- Done: `bun --filter plite-react test:vitest -- test/rendered-dom-shape-contract.test.tsx`
  in `/Users/zbeyens/git/plite`.
- Done: `bun --filter plite-dom typecheck`.
- Done: `bun --filter plite-react typecheck`.
- Done: `bun lint:fix`.
- Done: `dev-browser --connect http://127.0.0.1:9222` against
  `http://localhost:3100/examples/iframe`: iframe Plite paragraphs/text spans
  expose `data-plite-path` and clicking the first paragraph produces no page or
  console errors.
- Done: `bun run completion-check` in `/Users/zbeyens/git/plate-2`.
- Note: full `pnpm lint:fix` in `/Users/zbeyens/git/plate-2` is blocked by
  existing benchmark/tooling diagnostics unrelated to this docs-side checkpoint;
  Biome ignores the touched markdown plan/solution files.
