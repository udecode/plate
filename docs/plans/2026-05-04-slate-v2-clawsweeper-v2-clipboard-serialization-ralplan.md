---
date: 2026-05-04
topic: slate-v2-clawsweeper-v2-clipboard-serialization-ralplan
status: slate-ralplan-done
skill: slate-ralplan
bucket: v2-clipboard-serialization
source_plan: docs/plans/2026-05-04-slate-v2-full-issue-ledger-architecture-ralplan.md
---

# Slate v2 ClawSweeper `v2-clipboard-serialization` Ralplan

## Verdict

The next cluster is `v2-clipboard-serialization`.

Do not skip to core yet. The full issue-ledger order is input, DOM selection,
React runtime, clipboard/import-export, core, API/DX, then performance. Input
and React runtime are closed for their current local proof lanes. Clipboard is
the next honest browser/runtime boundary.

Hard take: clipboard is not "the HTML parser". That framing is how Slate gets a
browser junk drawer. The right target is narrower:

```txt
core fragment meaning
+ DOM DataTransfer transport
+ schema-safe internal payloads
+ app-owned rich HTML adapters
+ model-backed copy for DOM-incomplete ranges
+ cut/delete behavior that matches model selection
```

Current Slate Ralplan state: **done**. This pass selected the bucket, refreshed
live source owners, ran the ClawSweeper related-issue pass for representative
clipboard rows, synced the PR narrative and fork ledgers, and produced a first
RALPH execution slice.

## Intent And Boundary

Intent:

- turn the clipboard/serialization issue bucket into executable proof slices;
- keep raw Slate unopinionated while making DataTransfer behavior explicit;
- prevent malformed, foreign, or stale clipboard payloads from corrupting or
  crashing the editor;
- keep exact issue claims rare until the original repro is proven end to end.

Desired outcome:

- `slate` owns fragment extraction/insertion semantics;
- `slate-dom` owns browser clipboard transport, MIME keys, HTML scraping,
  plain-text fallback, DOM coverage policy, and payload validation;
- `slate-react` owns browser event delegation, cut/drop/paste dispatch, and DOM
  coverage materialization before editable browser interactions;
- examples own rich HTML policy such as links, strong, em, code, images, and
  product node schemas.

In scope:

- `../slate-v2/packages/slate/src` fragment extraction/insertion contracts;
- `../slate-v2/packages/slate-dom/src/plugin/dom-clipboard-runtime.ts`;
- `../slate-v2/packages/slate-react/src/editable/clipboard-input-strategy.ts`;
- `../slate-v2/packages/slate-dom/test/clipboard-boundary.ts`;
- `../slate-v2/packages/slate/test/clipboard-contract.ts`;
- focused browser rows only when copy, paste, cut, drag/drop, or external
  clipboard output is visible.

Non-goals:

- no generic Word/Google Docs/HTML serializer in raw Slate;
- no exact closure for external-editor copy/paste until browser proof checks
  the actual `text/html` and `text/plain` payloads;
- no table/list/void closure from unit tests alone when the original issue is a
  browser clipboard report;
- no migration back to public `editor.clipboard`.

Decision boundaries:

- Core decides what a Slate fragment is.
- DOM decides how that fragment crosses a browser clipboard.
- React delegates browser events to the DOM/core owners.
- Rich HTML import remains app-owned unless the issue exposes a raw Slate
  transport or model invariant.
- Invalid internal payloads fail closed and fall back to HTML/plain text where
  possible.
- Exact `Fixes #...` needs a current repro and focused proof.

Unresolved user-decision points:

- none for the next slice.

## Source-Backed Current State

- The full issue matrix lists `28` `v2-clipboard-serialization` rows, including
  #5630, #5616, #5429, #5328, #5233, #5151, #3857, #3801, #3557, #3486,
  #3469, #3155, #5089, #5005, #4906, #4888, #4857, #4810, #4806, #4802,
  #4716, #4613, #4567, #4542, #4440, #4104, #2694, and #1024.
- `docs/slate-issues/requirements-from-issues.md` routes clipboard and
  serialization pressure to explicit internal fragment format ownership,
  HTML/plain-text import/export boundaries, foreign-editor isolation, and
  configurable payload keys.
- `gitcrawl --json threads ianstormtaylor/slate --numbers
  5328,4857,5233,3486,4542,5151,4802,4806 --include-closed` confirms the
  representative rows are still open and current in the local gitcrawl corpus.
- `gitcrawl --json cluster-detail ianstormtaylor/slate --id 21` confirms #4802
  and #4806 are one active inline-void clipboard family.
- `../slate-v2/packages/slate-dom/src/plugin/dom-clipboard-runtime.ts:51`
  writes model-backed Slate fragments, `:69` exports DOM selection data, `:88`
  checks DOM coverage boundaries before copy, `:107` falls back to model-backed
  copy when DOM range export fails, `:183` runs extension-owned
  `dom.clipboard.insertData` handlers, and `:202` imports Slate fragment data.
- Gap: `../slate-v2/packages/slate-dom/src/plugin/dom-clipboard-runtime.ts:211`
  decodes and parses the embedded fragment payload directly. A malformed or
  foreign `data-slate-fragment` can still throw before the fallback path has a
  chance to handle plain text or app-owned HTML.
- `../slate-v2/packages/slate-dom/test/clipboard-boundary.ts:186` proves DOM
  clipboard APIs stay under `editor.dom.clipboard`, `:196` proves selected
  fragment round-trip and target replacement, `:241` proves custom MIME keys,
  `:282` proves embedded HTML fragment fallback, `:316` proves plain-text
  fallback, `:338` proves decorated DOM export strips render-only wrappers,
  `:367` proves multiline plain text preserves target block type, and `:401`
  proves expanded selection replacement with every pasted line.
- `../slate-v2/packages/slate/test/clipboard-contract.ts:18` proves core
  fragment extraction and insertion, including mixed inline extraction and
  expanded replacement.
- `../slate-v2/packages/slate-react/src/editable/clipboard-input-strategy.ts:157`
  delegates copy to `editor.dom.clipboard.writeSelection`, `:181` writes and
  deletes expanded cut selections, `:141` materializes DOM coverage paste
  targets, and `:288` delegates paste to `editor.dom.clipboard.insertData`.
- `../slate-v2/packages/slate-react/src/plugin/with-react.ts:17` exposes
  `withReact(editor, clipboardFormatKey?)`, preserving value generics and
  passing the format key to `withDOM`.

Current-state read result:

- already done in live source: the package boundary is correct. `slate` owns
  fragment semantics, `slate-dom` owns DataTransfer transport, and `slate-react`
  delegates events.
- done in Slice 5: custom clipboard format keys use options objects, isolate
  both MIME payloads and embedded HTML fallback fragments, and carry public
  docs/type proof for the #5233/#3486 family.
- already represented but not exact-closed: #4802/#4806 inline void clipboard
  behavior, #4542 pasted wrapper unit shape, #4857 foreign HTML select-all
  paste, and #5328 text-node
  `data-slate-fragment` false positives.
- improved but not exact-closed: #5151 rich fragment insertion preserves the
  receiving text-block type for the selected single-block replacement case.
- closed in Slice 1: invalid internal payloads fail closed instead of blocking
  safe fallback behavior.

## Decision Brief

Principles:

- Clipboard payloads are trust boundaries.
- Core fragment operations must not know browser clipboard mechanics.
- DOM clipboard code must not invent document schema policy.
- React event handlers should stay dispatchers, not clipboard engines.
- Exact claims need browser proof when the issue is browser-visible.

Drivers:

- The issue matrix routes `28` rows into this bucket.
- Gitcrawl representative rows show three distinct pressure types: schema-safe
  internal formats (#5233/#3486), malformed/foreign HTML payloads (#5328/#4857),
  and inline void/export behavior (#4802/#4806).
- Prior solution notes say the durable split is core fragment meaning, DOM
  transport, and React delegation.
- Current live source mostly matches that split, so the first slice should fix
  the sharp import gap rather than redraw architecture.

Options:

| Option | Verdict | Why |
| --- | --- | --- |
| Put a generic HTML serializer/deserializer in raw Slate | reject | That turns raw Slate into product policy and will still fail real Word/Docs cases. |
| Keep trusting `data-slate-fragment` | reject | Clipboard data is foreign input. A regex hit is not proof of a valid Slate fragment. |
| Remove embedded HTML fragments and rely only on custom MIME | reject | Safari/cross-browser flows need the HTML carrier. |
| Keep `editor.dom.clipboard` plus fail-closed payload validation | choose | Matches live source and fixes the real trust-boundary gap. |
| Public `editor.clipboard` namespace | reject | The existing test explicitly proves clipboard is a DOM host capability, not a core editor namespace. |

Chosen shape:

```txt
copy/cut:
  model selection -> fragment
  DOM coverage policy decides native DOM export vs model-backed export
  DataTransfer receives custom application/<format-key>, text/html, text/plain

paste/drop:
  extension-owned dom.clipboard.insertData handlers first
  safe internal fragment decode/validate next
  app-owned HTML handlers when registered
  plain-text fallback last
```

Consequences:

- The next implementation slice should be a failing test for malformed or
  foreign `data-slate-fragment`, then a fail-closed import helper.
- `withReact(editor, clipboardFormatKey?)` can stay as the current minimal API;
  a future options object is an API/DX topic, not required for this fix.
- #5233/#3486 move to `Fixes` after Slice 5 keyed embedded-fragment proof.
  #4569 also moves to `Fixes` because the current `insertData` docs now state
  capability order and fallback behavior.

## Issue Accounting

Reviewed with ClawSweeper:

| Issue | Current classification | Decision |
| --- | --- | --- |
| #5328 | cluster-synced | First execution slice. Malformed or text-node `data-slate-fragment` must fail closed. |
| #4857 | cluster-synced | Same trust-boundary family, but exact NYTimes/select-all repro needs browser proof before `Fixes`. |
| #5233 | fixes-claimed | Slice 5 proves custom fragment format keys isolate MIME payloads and embedded HTML fallback fragments. |
| #3486 | fixes-claimed | Older duplicate-family wording for custom `setData` id; covered with #5233. |
| #4542 | cluster-synced | Fragment insertion shape and empty-block behavior need separate model/browser proof. |
| #5151 | improves-claimed | Rich fragment target-block preservation is covered for the selected single text-block replacement case; exact browser repro closure is not claimed. |
| #4802 | improves-claimed | Selected inline void export keeps the Slate fragment payload without assuming block-void spacer DOM; no external-editor closure without browser payload proof. |
| #4806 | improves-claimed | Selected inline void copy/paste/cut ordering is covered through the DOM clipboard contract; exact browser repro closure is not claimed. |

New fixed issue claims from Slice 5:

- Fixes #5233
- Fixes #3486
- Fixes #4569

The PR auto-close count is now `6`:

- Fixes #6013
- Fixes #5605
- Fixes #5709
- Fixes #5233
- Fixes #3486
- Fixes #4569

## Execution Plan

### Slice 1: Fail-Closed Internal Fragment Import

Owner:

- `../slate-v2/packages/slate-dom/src/plugin/dom-clipboard-runtime.ts`
- `../slate-v2/packages/slate-dom/test/clipboard-boundary.ts`

Goal:

- malformed base64, malformed URI payloads, invalid JSON, non-array JSON, and
  text-node false-positive `data-slate-fragment` payloads must not throw;
- if plain text exists, paste plain text;
- if no fallback data exists, return `false` without mutating the document.

Representative issues:

- #5328
- #4857
- #5233/#3486 as schema-boundary pressure

Tests first:

```bash
bun test packages/slate-dom/test/clipboard-boundary.ts
```

Acceptance:

- red tests prove current direct decode/parse throws or consumes bad data;
- green tests prove fallback behavior;
- no exact issue claim added until browser proof replays the original repro.

### Slice 2: Fragment Insertion Shape And Selection Placement

Owner:

- `../slate-v2/packages/slate/test/clipboard-contract.ts`
- `../slate-v2/packages/slate-dom/test/clipboard-boundary.ts`
- focused browser rows for rich-text paste when needed

Goal:

- preserve target block type where v2 policy says the target owns the block;
- avoid importing unnecessary wrapper context when only selected text should
  land;
- assert real post-paste selection, not just tree shape.

Representative issues:

- #5151
- #4542
- #5429
- #5089
- #3155

### Slice 3: Inline Void Copy/Cut/Paste

Owner:

- `../slate-v2/packages/slate-react/src/editable/clipboard-input-strategy.ts`
- mentions/inlines browser examples

Goal:

- copy/cut selected inline voids without losing the model fragment;
- keep external `text/plain`/`text/html` output deterministic;
- do not claim Google Docs/Notes parity unless the exported payload itself is
  inspected.

Representative issues:

- #4802
- #4806
- #4104
- #5005

### Slice 4: Structural Cut/Delete

Owner:

- `../slate-v2/packages/slate-react/src/editable/clipboard-input-strategy.ts`
- `../slate-v2/packages/slate/src` delete/fragment contracts

Goal:

- cut expanded structural selections by writing data first, deleting once, and
  repairing model/DOM selection deterministically;
- list/table rows need exact shape tests before any auto-close claim.

Representative issues:

- #3857
- #3801
- #3469
- #4716
- #2694

### Slice 5: API And Extension Surface

Owner:

- `withReact(editor, options?)`
- `withDOM(editor, options?)`
- `dom.clipboard.insertData` capabilities
- JSDoc and examples

Goal:

- keep low-level clipboard on `editor.dom.clipboard`;
- hard-cut the positional custom format argument before it fossilizes;
- make custom fragment format keys isolate both MIME payloads and embedded HTML
  fallback fragments;
- document custom format key and extension-owned rich HTML/image handling;
- do not add a product parser to `slate-dom`.

Representative issues:

- #5233
- #3486
- #4569
- #3557
- #4613
- #4440
- #1024

### Slice 5 Slate Ralplan Review: API And Extension Surface

Status: complete for current-state, decision brief, implementation, docs, and
focused verification.

Verdict: revise Slice 5 before `ralph`. The current direction is right, but
the old `withReact(editor, clipboardFormatKey?)` signature should not survive
the v2 cut. A lone positional string is cramped API design: it solves one issue
while reserving no sane place for later React/DOM adapter options.

Hard cut target:

```ts
type DOMEditorOptions = {
  /**
   * Bare DataTransfer subtype used for Slate's internal fragment payload.
   * Slate writes and reads `application/${clipboardFormatKey}`.
   */
  clipboardFormatKey?: string
}

type ReactEditorOptions = DOMEditorOptions

withDOM(editor, options?: DOMEditorOptions)
withReact(editor, options?: ReactEditorOptions)
```

No compatibility overload for `withReact(editor, 'x-proof-fragment')`. Common
usage stays unchanged:

```ts
withReact(createEditor())
```

Custom usage becomes explicit:

```ts
withReact(createEditor(), { clipboardFormatKey: 'x-proof-fragment' })
```

Pre-Slice-5 live source evidence:

- `../slate-v2/packages/slate-react/src/plugin/with-react.ts:17` still exposes
  `clipboardFormatKey?: string`.
- `../slate-v2/packages/slate-dom/src/plugin/with-dom.ts:37` still takes the
  same positional string and forwards it to the DOM clipboard runtime.
- `../slate-v2/packages/slate-dom/src/plugin/dom-clipboard-runtime.ts:35`
  stores the key in a WeakMap; `:82` writes
  `application/${clipboardFormatKey}`; `:247` reads that MIME key.
- `../slate-v2/packages/slate-dom/src/plugin/dom-clipboard-runtime.ts:249`
  still falls back to unkeyed embedded HTML `data-slate-fragment`.
- `../slate-v2/packages/slate-dom/test/clipboard-boundary.ts:386` proves the
  custom MIME payload path, but did not prove cross-schema safety before Slice
  5 because the embedded HTML fallback was still unkeyed.

Critical correction from the review pass:

`#5233` was not just docs. The custom MIME key was custom, but `text/html`
still carried `data-slate-fragment` without a format marker. A receiving
default editor could still import schema-private JSON through the HTML fallback.
Slice 5 keys the embedded fallback too.

Target embedded-fragment rule:

- write `data-slate-fragment` plus a fragment-format marker, for example
  `data-slate-fragment-format="x-proof-fragment"`;
- accept an embedded fragment when its marker equals the editor's configured
  `clipboardFormatKey`;
- accept an unmarked embedded fragment only for the default
  `x-slate-fragment` key, preserving default Slate-to-Slate paste;
- reject mismatched embedded fragments and fall back to extension handlers or
  plain text.

Extension surface target:

- keep low-level methods on `editor.dom.clipboard`;
- export a public handler type from `slate-dom`, not from the private runtime
  file:

```ts
type DOMClipboardInsertDataHandler = (
  editor: DOMEditor,
  data: DataTransfer
) => boolean | void
```

- keep app-owned rich HTML/image parsing behind the existing
  `dom.clipboard.insertData` capability;
- do not add a raw Slate table/image/product HTML parser;
- document that handlers return `true` to stop the default Slate fragment/text
  fallback.

Issue accounting from this pass:

| Issue | Status for Slice 5 | Reason |
| --- | --- | --- |
| #5233 | `Fixes` | Exact ask is custom fragment format isolation; Slice 5 covers options API plus keyed HTML fallback proof. |
| #3486 | `Fixes` with #5233 | Older custom `setData` id request; same root requirement. |
| #1024 | `Improves` | MIME identity discussion maps to keyed payloads and keyed embedded fragments, but not a full document MIME system. |
| #4613 | `Improves` | Existing `dom.clipboard.insertData` capability is now publicly typed and documented, but broad override closure is not claimed. |
| #4569 | `Fixes` | Docs now state `insertData` capability order, handler return semantics, and fallback behavior. |
| #4440 | `Related`, not fixed | Output customization for plain text/HTML needs a later `writeSelection`/serializer capability. Do not cram it into Slice 5. |
| #3557 | `Related`, not fixed | General method overriding is handled by v2 extension/transform APIs, not clipboard-specific enough for this slice. |

Decision brief:

- Principle 1: Slate core stays schema-agnostic; app parsers own rich foreign
  HTML.
- Principle 2: DOM clipboard transport is a trust boundary; no unkeyed internal
  fragment should bypass a custom key.
- Principle 3: Public adapter options use objects, not one-off positional
  parameters.
- Principle 4: Extension hooks need public types and examples, not private
  runtime imports.

Rejected alternatives:

- Keep positional string: rejected because it blocks future adapter options and
  hides intent at call sites.
- Add `editor.clipboard`: rejected because the low-level DOM transport belongs
  under `editor.dom.clipboard`.
- Add raw Slate HTML/table/image parsing: rejected because it would turn Slate
  into an opinionated schema parser.
- Claim #4440 now: rejected because current API has input customization, not
  output serializer customization.

Implementation acceptance criteria:

- a failing proof that a default editor does not import a custom-key source
  through embedded HTML fallback;
- a passing proof that default-key editors still round-trip existing embedded
  fragments;
- `withReact` and `withDOM` use options objects with preserved value generics;
- all examples/docs/tests use `{ clipboardFormatKey }`;
- no public `editor.clipboard` namespace appears;
- `DOMClipboardInsertDataHandler` is exported from a public `slate-dom` surface;
- images and paste-html examples type their handlers without `unknown`;
- issue ledgers move #5233/#3486 only after proof, not before.

Score for this pass:

- React/runtime performance: 0.88. Options object is startup-only; no hot-path
  overhead expected; package/site typechecks are green.
- Slate-close DX: 0.91. `withReact(createEditor())` remains tiny; custom key
  call becomes self-documenting.
- Migration-backbone shape: 0.87. Extension-owned paste parsing remains in
  capability space; output customization is explicitly kept out of this slice.
- Regression-proof testing: 0.90. Focused tests prove custom MIME, matching
  custom-key embedded HTML import, and default-key rejection of custom-key
  embedded HTML fallback.
- Research/issue evidence: 0.90. `gitcrawl` checked #5233, #3486, #1024,
  #4613, #4569, #4440, and #3557.
- Composability/minimalism: 0.91. The API stays small and the public handler
  type is exported from `slate-dom`.

Total: 0.90. Slice 5 is complete; next pass is large payload performance.

Slice 5 implementation evidence:

- hard-cut positional `withReact(editor, clipboardFormatKey?)` and
  `withDOM(editor, clipboardFormatKey?)` to options-object APIs;
- keyed embedded HTML fallback fragments with `data-slate-fragment-format`;
- preserved default-key unmarked embedded fragment compatibility;
- exported `DOMClipboardInsertDataHandler` from public `slate-dom`;
- typed images, paste-html, and rendering-strategy-runtime example handlers;
- documented `clipboardFormatKey`, capability order, handler return semantics,
  and app-owned rich HTML fallback policy;
- verified with focused DOM clipboard tests and package/site typechecks.

### Slice 6: Large Payload Performance

Owner:

- `../slate-v2/scripts/benchmarks/core/current/clipboard-large-payload.mjs`
- `../slate-v2/scripts/benchmarks/slate/5945-large-plaintext-paste.mjs`
- `../slate-v2/scripts/benchmarks/README.md`
- `../slate-v2/package.json`
- optional browser stress row only after the headless lane identifies the hot
  path

Goal:

- large paste/copy/cut gets benchmark proof before any performance claim;
- split transport, decode, text splitting, fragment insertion, and cut/delete
  costs instead of timing one opaque "paste is slow" blob;
- keep the clipboard trust-boundary architecture intact.

Representative issues:

- #4056
- #5945
- #5992

Hard cut:

- no generic HTML importer in raw Slate;
- no virtualization claim as the answer to paste/cut latency;
- no `Fixes #4056`, `Fixes #5945`, or `Fixes #5992` until the benchmark lane
  reproduces the original workload and shows an accepted improvement.

Current source evidence:

- `../slate-v2/package.json` has benchmark commands for core, React, history,
  and #6038, but no clipboard large-payload command.
- `../slate-v2/scripts/benchmarks/README.md` says new lanes belong under
  `scripts/benchmarks/**`, artifacts belong in `.tmp/`, and public `bench:*`
  command names are the contract.
- `../slate-v2/packages/slate-dom/src/plugin/dom-clipboard-runtime.ts` currently
  pays clipboard costs in these places: model-backed fragment `JSON.stringify`
  and `btoa`, DOM range `cloneContents`, temporary `div.innerHTML`, plain text
  extraction, `decodeURIComponent`/`atob`/`JSON.parse`, `text.split`, per-line
  `insertText`, and fragment insertion.
- `../slate-v2/packages/slate/src/transforms-text/insert-fragment.ts` currently
  walks fragment nodes, builds `starts`/`middles`/`ends`, splits, inserts, and
  normalizes. That is likely correct architecture; Slice 6 must measure it
  before changing it.
- `docs/slate-issues/benchmark-candidate-map.md` already marks #5945 as
  `ready-now`, #5992 as `ready-with-minor-setup`, and #4056 as
  `ready-with-minor-setup`.
- `gitcrawl threads ianstormtaylor/slate --numbers 4056,5945,5992
  --include-closed --json` confirms all three rows are open in the local live
  corpus.

Benchmark cohorts:

| Cohort | Payload/document shape | Purpose |
| --- | --- | --- |
| small | 10 lines/blocks | catch fixed overhead and correctness drift |
| normal | 100 lines/blocks | default editor sanity |
| large | 1,000 lines/blocks | first real #5945-like pressure |
| stress | 10,000 lines/blocks | exact generated #5945 workload |
| pathological | 50,000 existing blocks plus two-node cut | #5992-shaped huge-document cut |

Required lanes:

| Lane | Measures | Issue pressure |
| --- | --- | --- |
| `plainTextSplitMs` | `text/plain` newline split and line-count scaling | #5945, #4056 |
| `plainTextInsertMs` | public insert-data path for many newline blocks | #5945, #4056 |
| `fragmentEncodeMs` | model-backed fragment JSON/base64/text/html payload creation | #4056, #5992 |
| `fragmentDecodeMs` | custom MIME and embedded HTML fragment decode/parse | #4056 |
| `fragmentInsertMs` | core fragment insertion into selected range | #5945, #4056 |
| `cutTwoBlocksMs` | copy payload creation plus selected range delete in huge document | #5992 |
| `fullSelectionCopyMs` | model-backed copy for large selected text | #4056 |

Metrics:

- p50/p95/max wall time per lane;
- payload byte size for `text/plain`, `text/html`, and
  `application/${clipboardFormatKey}`;
- fragment node count and inserted block count;
- operation count and commit count where available;
- heap delta when the runtime can expose it cheaply;
- artifact path: `../slate-v2/tmp/slate-clipboard-large-payload-benchmark.json`.

Decision rule:

- First execution pass adds the benchmark and records baseline only.
- Second execution pass may optimize exactly the hottest measured lane.
- Optimizations must keep #4056/#5945/#5992 classified as `Not claimed` until
  the benchmark row reproduces the original workload and the improvement is
  documented.
- If the measured hot path is core insertion/normalization, fix `slate`.
- If the measured hot path is DOM transport/encode/decode, fix `slate-dom`.
- If the measured hot path only appears in mounted browser rendering, add a
  separate browser stress row before touching React rendering strategy.

Candidate implementation moves after baseline:

- avoid repeated transform-registry lookups inside large plain-text insertion;
- batch plain-text insert lines under one editor transaction;
- avoid temporary DOM/`innerHTML` work for model-backed copy when DOM coverage
  already proves the selection is model-owned;
- keep `split`/insert behavior current unless the benchmark proves it is the
  bottleneck.

Performance review:

- applicability: applied.
- Vercel rules used: `js-combine-iterations`, `js-length-check-first`,
  `js-set-map-lookups`, `js-cache-property-access` only after baseline points
  to a repeated JavaScript loop.
- extra performance rules used: cohort segmentation, repeated-unit budget,
  interaction matrix, memory/DOM tagging, editor native behavior proof.
- repeated unit: pasted line/block, selected copied block, fragment node, and
  DataTransfer payload.
- degradation contract: none in Slice 6. Benchmarking and local optimization
  must preserve normal clipboard semantics.
- browser proof: not required for baseline; required before claiming native
  clipboard/browser-visible improvement.

Fast gates:

```bash
cd ../slate-v2
bun run bench:slate:5945:local
bun test ./packages/slate-dom/test/clipboard-boundary.ts
bun test ./packages/slate/test/clipboard-contract.ts
bun --filter slate-dom typecheck
bun --filter slate-react typecheck
bun lint:fix
```

Broader gate only if browser-visible behavior changes:

```bash
cd ../slate-v2
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/stress/generated-editing.test.ts -g "paste-normalize-undo" --project=chromium
```

Baseline execution result:

- Benchmark source:
  `../slate-v2/scripts/benchmarks/core/current/clipboard-large-payload.mjs`.
- Stable command: `bun run bench:slate:5945:local`.
- Artifact:
  `../slate-v2/tmp/slate-clipboard-large-payload-benchmark.json`.
- Default local baseline is intentionally bounded: 2,000 pasted lines and
  10,000 existing blocks for cut. The exact issue-size gate remains available
  through
  `SLATE_CLIPBOARD_BENCH_STRESS_LINES=10000 SLATE_CLIPBOARD_BENCH_HUGE_CUT_BLOCKS=50000`.
- First exact-size attempt with 10,000 pasted lines and 50,000 cut blocks did
  not finish after roughly 150 seconds, so keeping that as the default command
  would make the iteration gate useless.
- Latest bounded baseline after the kept hot-loop cleanup: 1,000-line plain
  text insert mean `930.39ms`, 1,000-node fragment insert mean `1196.83ms`,
  full selection copy mean `1.65ms`, and plain split mean `0.03ms`.
- Latest bounded stress baseline after the kept hot-loop cleanup: 2,000-line
  plain text insert mean `3545.36ms`, 2,000-node fragment insert mean
  `4615.83ms`, full selection copy mean `5.25ms`, and plain split mean
  `0.05ms`.
- Latest 10,000-block two-node cut baseline: `368.96ms`.
- Rejected candidate: converting multiline plain-text paste into a prebuilt
  fragment worsened the bounded lane (`1000` lines around `1316ms`, `2000`
  lines around `5412ms`) because `insertFragment` is slower than the existing
  split/insert path for this payload. The candidate was removed.
- Kept cleanup: cache the transform registry once inside the multiline
  plain-text loop. This is a low-risk repeated-lookup cleanup, not a claimed
  issue fix.

Baseline verdict:

- The hot path is not newline splitting, fragment encode/decode, or
  model-backed copy.
- The next slice should optimize block insertion/normalization cost in the
  public clipboard insert path. Avoiding repeated transform-registry lookup is
  done; the remaining owner is the split/insert operation count and
  normalization cost.
- #4056, #5945, and #5992 remain `Not claimed` because this slice recorded a
  bounded benchmark plus one cleanup, not an accepted issue-size improvement.

## Proof Gates

First slice gates:

```bash
cd ../slate-v2
bun test packages/slate-dom/test/clipboard-boundary.ts
bun --filter slate-dom typecheck
bun lint:fix
```

Broader gates when the touched behavior expands:

```bash
cd ../slate-v2
bun test packages/slate/test/clipboard-contract.ts
bun --filter slate-react test:vitest -- dom-coverage-native-bridge-contract
bun --filter slate-react test:vitest -- editing-kernel-contract
bun test:integration-local --grep "richtext|highlighted-text|rendering-strategy-runtime|mentions|inlines"
```

Use browser proof only when the slice changes browser-visible copy/paste/cut
behavior. Use benchmark proof before large-paste performance claims.

## Objections And Answers

### "Should malformed `data-slate-fragment` just be ignored?"

Yes, unless the valid custom MIME payload is present. Clipboard import is a
trust boundary. Bad embedded fragments should never throw or block plain-text
fallback.

### "Is custom `clipboardFormatKey` enough for #5233?"

Mostly, but do not auto-close yet. The live API exists, but the exact issue
asked for safe cross-schema behavior. We need public docs/JSDoc plus proof that
only the configured MIME key is treated as authoritative.

### "Should rich HTML paste move into `slate-dom`?"

No. `slate-dom` should carry data across the browser boundary. Apps decide how
to map foreign HTML into their schema.

### "Can model-backed copy surprise users?"

Yes. That is still safer than stale DOM. Model-backed copy must be explicit in
policy and proof.

### "Can we claim inline void copy/paste now?"

Only as `Improves`. The focused DOM contract now proves selected inline void
copy/paste/cut ordering and fragment preservation. Exact `Fixes` still needs
browser replay of #4802/#4806 and exported payload inspection.

## Plan Deltas

Added in this pass:

- selected `v2-clipboard-serialization` as the next bucket;
- refreshed live `slate-dom`, `slate-react`, and `slate` clipboard owners;
- reviewed representative live gitcrawl rows for malformed fragments, custom
  MIME keys, empty-block paste shape, and inline void copy/paste;
- synced PR narrative with a dedicated clipboard/import-export boundary;
- added issue-ledger rows for reviewed clipboard issues;
- set first RALPH target to fail-closed internal fragment import.

Dropped:

- broad "HTML paste support" as a raw Slate goal;
- exact issue closure for inline void, table/list, and external-editor rows
  without browser proof.

Unchanged:

- exact fixed issue claims remain #6013, #5605, and #5709;
- DOM coverage boundaries still own model-backed copy/paste when DOM is
  incomplete.

## Implementation-Skill Notes

- `clawsweeper`: applied. Related issue pass ran through the active issue
  matrix, live gitcrawl representative threads, and fork ledger updates.
- `planning-with-files`: applied through `docs/plans`, checkpoint, and
  `.tmp/continue.md`.
- `learnings-researcher`: applied. Relevant solution notes confirm the split:
  core fragment meaning, DOM transport, React delegation, app-owned rich HTML.
  The expected `docs/solutions/patterns/critical-patterns.md` file is absent in
  this repo.
- `tdd`: applied through Slice 1 malformed-fragment tests and Slice 2 rich
  fragment target-block preservation tests.
- `performance`: applied for Slice 6 planning. The next slice must add a
  benchmark lane before any large paste/copy/cut performance claim.

## Ralph Execution Ledger

| Pass | Status | Owner | Evidence | Next |
| --- | --- | --- | --- | --- |
| `fail-closed-internal-fragment-import` | complete | `../slate-v2/packages/slate-dom` clipboard runtime | Added focused malformed-fragment tests in `../slate-v2/packages/slate-dom/test/clipboard-boundary.ts`; added safe fragment decode/parse in `../slate-v2/packages/slate-dom/src/plugin/dom-clipboard-runtime.ts`; verified with focused clipboard test, `slate-dom` typecheck, and lint fix. | Continue with Slice 2: fragment insertion shape and selection placement. |
| `fragment-insertion-shape-and-selection-placement` | complete for #5151-shaped slice | `../slate-v2/packages/slate` fragment insertion | Added focused core and DOM clipboard tests proving a rich single text-block fragment preserves the receiving text-block type and post-insert selection; implemented the selected target-block ownership path in `../slate-v2/packages/slate/src/transforms-text/insert-fragment.ts`; #5151 moved to `Improves`; fixed issue claims unchanged. | Continue with Slice 3: inline void copy/cut/paste. |
| `inline-void-copy-cut-paste` | complete for package-level DOM proof | `../slate-v2/packages/slate-dom` clipboard runtime | Added a selected inline void clipboard regression proving no block-void spacer DOM assumption, preserved Slate fragment payload, FEFF-free external text output, paste round-trip, and cut-shaped delete ordering; implemented a safe attachment fallback in `../slate-v2/packages/slate-dom/src/plugin/dom-clipboard-runtime.ts`; #4802/#4806 moved to `Improves`; fixed issue claims unchanged. | Continue with Slice 4: structural cut/delete. |
| `structural-cut-delete` | complete for package-level model/React proof | `../slate-v2/packages/slate-react` clipboard cut dispatch and `../slate-v2/packages/slate` fragment/delete contracts | Added a selected block void cut regression proving model-backed clipboard data, single void removal, and model-owned DOM repair; added core list-fragment/delete proofs for whole-list wrapper extraction and deletion across a list without orphan `list-item`; #3857/#3801/#3469 moved to `Improves`; #4716 remains `Related`; #2694 remains `Not claimed`. | Continue with Slice 5: API and extension surface. |
| `api-and-extension-surface-ralplan` | complete for current-state and decision brief | `../slate-v2/packages/slate-react/src/plugin/with-react.ts`, `../slate-v2/packages/slate-dom/src/plugin/with-dom.ts`, `../slate-v2/packages/slate-dom/src/plugin/dom-clipboard-runtime.ts` | Pre-Slice-5 source showed custom MIME support existed, but the positional string API was weak and embedded HTML fallback was unkeyed. Plan target changed to `withReact(editor, options?)` / `withDOM(editor, options?)`, keyed embedded fragments, public insertData handler type, and docs/example proof. | Slice 5 executed; keep as planning evidence. |
| `api-and-extension-surface` | complete | `../slate-v2/packages/slate-dom`, `../slate-v2/packages/slate-react`, `../slate-v2/site/examples`, `../slate-v2/docs/libraries/slate-react` | Added focused custom-key embedded HTML acceptance/rejection tests; hard-cut `withReact`/`withDOM` to options objects; keyed embedded HTML fallback fragments; exported `DOMClipboardInsertDataHandler`; typed rich HTML/image example handlers; synced docs and issue claims. #5233/#3486/#4569 moved to `Fixes`; #1024/#4613 moved to `Improves`; #4440/#3557 remain `Related`. | Continue with Slice 6: large payload performance. |
| `large-payload-performance-ralplan` | complete for benchmark-first plan | `../slate-v2/scripts/benchmarks`, `../slate-v2/packages/slate-dom`, `../slate-v2/packages/slate` | Current source has no large clipboard payload benchmark command. Plan now defines cohorts, lanes, metrics, artifact path, no-claim policy, and fast gates for #4056/#5945/#5992. | RALPH should execute Slice 6 baseline benchmark. |
| `large-payload-performance-baseline` | complete for bounded local baseline plus one cleanup | `../slate-v2/scripts/benchmarks/core/current/clipboard-large-payload.mjs`, `../slate-v2/scripts/benchmarks/slate/5945-large-plaintext-paste.mjs`, `../slate-v2/package.json`, `../slate-v2/packages/slate-dom/src/plugin/dom-clipboard-runtime.ts` | Added benchmark command and artifact. Latest bounded run shows insertion still dominates: 2,000-line plain text insert mean `3545.36ms`, 2,000-node fragment insert mean `4615.83ms`, full selection copy mean `5.25ms`, split mean `0.05ms`, and 10,000-block two-node cut mean `368.96ms`. Exact issue-size gate stays env-controlled because the first 10,000-line/50,000-block attempt exceeded roughly 150s. Rejected fragment-materialization candidate because it worsened the lane; kept transform-registry caching only. | Continue with deeper split/insert normalization optimization; fixed issue claims unchanged. |

## Readiness Score

- corpus accounting: 0.93
- live-source grounding: 0.94
- architecture direction: 0.92
- exact issue closure proof: 0.46 after Slice 5 added three fixed claims
- execution readiness for RALPH slice 6: 0.93

Verdict: keep executing the clipboard program. Slice 6 is now ready for RALPH:
add the large clipboard payload benchmark first, record baseline, and optimize
only the measured bottleneck.
