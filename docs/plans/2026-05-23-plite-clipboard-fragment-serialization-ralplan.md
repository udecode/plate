---
date: 2026-05-23
topic: plite-clipboard-fragment-serialization-ralplan
status: ralph-execution-done
skill: slate-ralplan
bucket: v2-clipboard-serialization
source_items: "#4802, #4806, #4056, #5089"
---

# Plite Clipboard / Fragment Serialization Ralplan

## Verdict

Do not rewrite the clipboard architecture.

The current split is the right long-term shape:

```txt
slate:
  fragment extraction, fragment insertion, selection/resulting model shape

plite-dom:
  DataTransfer, internal MIME keys, embedded HTML fragment fallback,
  malformed payload rejection, plain-text fallback, DOM coverage policy

slate-react:
  copy/cut/paste/drop event routing, DOM coverage materialization,
  model-owned caret repair

apps:
  product HTML/image/table/link paste policy through typed clipboard handlers
```

What changed in the Ralph execution: `#4806` is now justified as fixed by
browser clipboard proof. `#4802` still stays `Improves` because the proof covers
an external contenteditable target, not a named third-party editor. `#4056`
still stays `Improves`, but its benchmark owner is repaired and fresh again.

## Intent And Boundary

Intent:

- confirm the best architecture for clipboard and Plite fragment transport;
- keep rich text standard support app/extensibility-owned instead of baking a
  product HTML parser into raw Plite;
- turn the remaining proof gaps into a Ralph-ready execution lane;
- avoid promoting issue claims from old artifacts or headless tests alone.

In scope:

- `packages/plite/src/transforms-text/insert-fragment.ts`
- `packages/plite/test/clipboard-contract.ts`
- `packages/plite-dom/src/plugin/dom-clipboard-runtime.ts`
- `packages/plite-dom/test/clipboard-boundary.ts`
- `packages/plite-react/src/editable/clipboard-input-strategy.ts`
- focused React/Vitest DOM coverage tests when DOM strategy affects copy/paste
- focused Playwright/browser proof only for browser-visible clipboard claims
- issue ledgers and PR claim text only when proof changes

Out of scope:

- no generic Markdown/HTML/table serializer in raw `slate`;
- no exact inter-editor closure for `#4802` without inspecting browser clipboard
  output;
- no exact full-book/browser closure for `#4056` from a headless benchmark;
- no public raw `editor.clipboard` namespace;
- no broad fragment non-merging policy claim for `#3155`.

## Current State

Source-backed facts:

- `slate` owns the model side. `insert-fragment.ts` fits single text-block
  fragments into active text blocks, preserves multi-block separation in the
  middle of paragraphs, handles top-level block replacement, nested text-block
  replacement, and structural block insertion through one logical operation
  where the fast paths apply.
- `plite-dom` owns the trust boundary. `dom-clipboard-runtime.ts` writes
  `application/${clipboardFormatKey}`, `text/html`, and `text/plain`; it also
  accepts keyed embedded HTML fragments, rejects malformed internal payloads,
  and falls back to plain text.
- `plite-react` is correctly thin. `clipboard-input-strategy.ts` prevents
  default where needed, materializes DOM coverage boundaries, calls
  `editor.api.clipboard.writeSelection` / `insertData`, and requests caret
  repair after model-owned cut/paste/drop.
- The public API shape is acceptable: low-level clipboard remains
  `editor.api.clipboard`, and app-specific paste behavior uses extension
  capability `clipboard.insertData(data, { editor, next })`.

Fresh verification from this pass:

```bash
cd Plate repo root
bun test ./packages/plite/test/clipboard-contract.ts \
  ./packages/plite-dom/test/clipboard-boundary.ts \
  ./packages/plite-react/test/dom-coverage-native-bridge-contract.test.ts
# 56 pass, 0 fail

cd packages/plite-react
bun test:vitest test/dom-strategy-and-scroll.test.tsx \
  test/dom-coverage-native-bridge-contract.test.ts
# 2 files passed, 47 tests passed
```

Fresh Ralph execution proof:

```bash
cd Plate repo root
bun run bench:core:clipboard-large-payload:local
# passed with issueTargetsEnabled: false

PLITE_CLIPBOARD_BENCH_ISSUE_TARGETS=1 bun run bench:core:clipboard-large-payload:local
# passed with issueTargetsEnabled: true

PLAYWRIGHT_RETRIES=0 bunx playwright test \
  playwright/integration/examples/mentions.test.ts \
  --project=chromium --workers=1 --grep "mention"
# 13 passed

cd packages/plite-react
bun test:vitest test/dom-strategy-and-scroll.test.tsx \
  test/dom-coverage-native-bridge-contract.test.ts
# 2 files passed, 47 tests passed
```

The refreshed issue-target benchmark records `49.35ms` for copying 10,000
populated blocks and `235.22ms` for pasting 10,000 plaintext lines into a
10,000-block populated editor, each through one logical operation.

## Issue Accounting

| Issue | Current Status | Decision |
| --- | --- | --- |
| `#5089` | `Fixes` | Keep. Current core and DOM clipboard tests prove multi-block fragment paste into the middle of a paragraph preserves block separation. |
| `#4802` | `Improves` | Keep. Browser proof covers deterministic native clipboard payload and an external contenteditable target, but not a named third-party editor. |
| `#4806` | `Fixes` | Promote. Browser proof covers selected inline void copy, paste, cut, payload, one mention removal, and model-owned caret repair. |
| `#4056` | `Improves` | Keep. Fresh issue-target benchmark is green; exact full-book/browser closure remains open. |
| `#5233` / `#3486` | `Fixes` | Keep. Custom fragment keys isolate MIME and embedded HTML fallback. |
| `#5328` | `Improves` | Keep. Malformed internal fragments fail closed, but exact browser repro closure still needs browser proof. |
| `#4542` | `Related` | Keep. Empty-block wrapper import behavior is broader than the fixed `#5089` shape. |
| `#3155` | `Related` | Keep. Broad fragment non-merging policy is not closed by one insertion-shape proof. |

Ledger note: `docs/plite-issues/gitcrawl-recluster-map.md` still says this
singleton sweep needs exact proof. This pass confirms that is still true for
`#4802`, `#4806`, and `#4056`; `#5089` already has a later fixed row in the fork
dossier and coverage matrix.

## Architecture Decision

Keep these boundaries:

- `Editor.getFragment` / `Editor.insertFragment` are model contracts.
- `editor.api.clipboard` is a DOM-host capability installed by `dom()` /
  `withReact`, not a raw core namespace.
- `clipboard.insertData` extension handlers are input hooks. They can own
  product HTML/image/table policy, but they do not own internal Plite fragment
  serialization.
- DOM coverage copy/paste is part of the clipboard boundary because staged,
  hidden, and future virtualized regions still need model-backed clipboard data.
- Plain text full-document or empty-block paste can keep optimized fast paths,
  but rich fragments must stay on the normal Plite fragment path.

Rejected:

- raw Plite importing arbitrary `text/html`;
- DOM clipboard code deciding schema-specific rich text policy;
- React event handlers containing serialization semantics;
- issue closure from old benchmark JSON when the benchmark command no longer
  runs against current source.

## Scorecard

| Dimension | Score | Reason |
| --- | ---: | --- |
| React runtime performance | 0.91 | React routing is thin and browser inline-void clipboard proof now exists. |
| Plite-close DX | 0.89 | `dom({ clipboardFormatKey })`, `editor.api.clipboard`, and extension `clipboard.insertData` are clean enough. No public `editor.clipboard`. |
| Plate / slate-yjs backbone | 0.86 | Fragment insertion uses deterministic model operations; adapter-specific lowering remains outside this lane. |
| Regression-proof testing | 0.91 | Core/DOM/React proof, Chromium clipboard proof, root typecheck, lint, and refreshed benchmark proof are green. |
| Research evidence completeness | 0.84 | Cache-first ledgers, previous plans, live source, and focused tests were read. No new external editor research was needed for this proof lane. |
| API composability | 0.90 | App-owned handlers give product policy room without polluting raw Plite, and the browser proof exercises the public example path. |

Total: `0.90`.

This is high enough to call the lane closed without redesigning the
architecture.

## Ralph Execution Result

Completed:

- repaired `benchmarks/plite/donor/core/current/clipboard-large-payload.mjs`
  to use current `dom()` extension installation;
- added Chromium browser proof in
  `apps/www/tests/plite-browser/donor/examples/mentions.test.ts`;
- verified selected inline void native clipboard `text/html`, `text/plain`, and
  embedded Plite fragment;
- verified no FEFF or neighboring text leakage;
- verified external contenteditable paste visibility for `#4802` evidence;
- verified Plite round-trip paste plus cut with one mention `remove_node` and
  model-owned caret repair for `#4806`;
- refreshed the #4056 issue-target benchmark artifact;
- synced coverage matrix, fork dossier, PR reference, gitcrawl sync ledger, and
  recluster map.

## Pass State

| Pass | Status | Evidence | Next |
| --- | --- | --- | --- |
| Current-state read | complete | Read prior clipboard plans, recluster map, PR reference, fork dossier, coverage matrix, live source, and focused tests. | Related issue proof audit |
| Issue accounting | complete | Confirmed `#5089/#4806` fixed, `#4802/#4056` improved. | Closed |
| Verification sample | complete | Focused core/DOM/React contracts, Chromium proof, lint, root typecheck, and benchmarks green. | Closed |
| Architecture review | complete | Kept core/DOM/React/app split; no rewrite recommended. | Closed |
| Ralph handoff | complete | Benchmark harness repaired, browser proof added, focused gates green, issue accounting synced. | Closed |

## Completion Gates

This lane is `done` because:

- the benchmark command runs against current `dom()` source;
- inline void browser clipboard payload proof exists for `#4802` / `#4806`;
- focused package, DOM, React, Chromium, lint, and root typecheck gates pass;
- `#4806` promotion and `#4056` evidence refresh are synced across coverage
  matrix, fork dossier, PR reference, gitcrawl sync ledger, and recluster map.
