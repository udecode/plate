---
date: 2026-04-06
topic: slate-v2-html-formatting-phase8
status: complete
---

# Slate v2 HTML Formatting Phase 8 Batch

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

Land the next Phase 8 batch from
`docs/slate-v2/package-end-state-roadmap.md`:

- widen the current app-owned `paste-html` surface conservatively
- keep the behavior on the `slate-react` runtime seam
- prove it in browser lanes

## Constraints

- no legacy plugin-override resurrection
- no fake “full HTML parity” claim
- no lower-layer churn unless the proof exposes a real gap
- prefer explicit app-owned inline element shapes over broad runtime mark
  support unless forced

## Likely First Slice

- support a small explicit formatting set:
  - `strong`
  - `em`
  - `code`
- preserve current paragraph + link support
- prove browser paste behavior through the existing `paste-html` example

## Evidence

- current `paste-html` surface only deserializes paragraphs and links
- current `EditableBlocks` seam already supports app-owned inline rendering via
  `renderElement`
- current `EditableBlocks` `renderSegment` does not carry text-node mark data,
  so mark-style rendering is not the obvious minimal seam
- legacy `../slate/site/examples/ts/paste-html.tsx` proves the broader semantic
  reference, but the v2 slice should stay narrower and explicit

## Progress

- loaded `task`, `planning-with-files`, `learnings-researcher`, `tdd`, and
  `react`
- checked `../slate-v2` for deeper AGENTS/CLAUDE files: none found
- read current `paste-html` example, runtime seam, browser test, and legacy
  Slate example
- read clipboard-boundary learning:
  `docs/solutions/logic-errors/2026-04-03-slate-v2-clipboard-boundary-proof-must-split-fragment-semantics-and-dom-transport.md`
- wrote the first red browser test for explicit `strong` / `em` / `code`
  support in `playwright/integration/examples/paste-html.test.ts`
- proved the red through the maintained local browser runner
- implemented the minimal seam:
  - parse `strong` / `em` / `code` into explicit inline elements
  - keep the behavior app-owned in the example layer
  - let links carry inline descendants instead of flattening to plain text
- synced the Phase 8 / compatibility docs to the newly proved subset
- verification green:
  - browser proof on port `3010`:
    `bash ./scripts/run-slate-browser-local.sh 3010 /examples/paste-html "yarn build:slate-browser:playwright && yarn exec playwright test playwright/integration/examples/paste-html.test.ts --project=chromium --workers=1"`
  - `yarn tsc:examples`
  - `yarn eslint site/examples/ts/components/link-utils.tsx site/examples/ts/components/paste-html-surface.tsx playwright/integration/examples/paste-html.test.ts`
  - `yarn prettier --check ...` on changed `slate-v2` files
  - `pnpm exec prettier --check ...` on changed `plate-2` docs
- caveat:
  - the JS example mirrors in `site/examples/js/**` follow an existing
    semicolon-heavy generated style that currently fails targeted repo ESLint
    even outside this slice, so lint evidence is intentionally scoped to the
    TS/example/test path that backs the proved behavior
