---
title: Slate v2 should pursue data-model-first core with React-perfect runtime lanes
type: decision
status: accepted
updated: 2026-04-21
source_refs:
  - docs/analysis/editor-architecture-candidates.md
  - docs/plans/2026-04-21-slate-v2-data-model-first-react-perfect-runtime-plan.md
  - docs/research/sources/editor-architecture/prosemirror-mapped-overlays-and-bookmarks.md
  - docs/research/sources/editor-architecture/lexical-mark-store-and-decorator-split.md
  - docs/research/sources/editor-architecture/layout-measurement-and-ime-lanes.md
  - docs/research/sources/editor-architecture/service-channels-and-live-stores.md
  - docs/research/sources/editor-architecture/slate-v2-local-proof-substrate.md
  - docs/research/sources/editor-architecture/lexical-read-update-extension-runtime.md
  - docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md
  - docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md
  - docs/research/decisions/slate-v2-read-update-runtime-architecture.md
  - ../prosemirror/view/src/decoration.ts
  - ../prosemirror/state/src/selection.ts
  - ../lexical/packages/lexical/src/LexicalUpdates.ts
  - ../lexical/packages/lexical/src/LexicalReconciler.ts
  - ../vscode/src/vs/editor/common/viewModel/viewModelImpl.ts
  - ../pretext/README.md
  - ../premirror/README.md
  - ../db/README.md
  - ../db/packages/react-db/src/useLiveQuery.ts
  - ../edit-context/dev-design.md
related:
  - docs/research/systems/editor-architecture-landscape.md
  - docs/research/decisions/slate-v2-react-19-2-perf-architecture-vs-field.md
  - docs/research/decisions/slate-v2-source-scoped-overlay-invalidation.md
  - docs/slate-v2/references/architecture-contract.md
---

# Slate v2 should pursue data-model-first core with React-perfect runtime lanes

## Decision

Accept the architecture target:

- data-model-first core
- operation/collaboration-friendly model
- transaction-first local execution
- renderer-optimized live read and dirtiness APIs
- React-optimized `slate-react` runtime

Reject both weaker framings:

- "React-first core"
- "legacy-compatible shape at any perf cost"

The core should stop fighting React, but React must not define the core
ontology.

## Implementation Status

The active huge-doc runtime lane is complete under this decision.

Current proof:

- core exposes framework-neutral live reads, runtime id/path lookup,
  operation dirtiness, and last commit metadata
- `slate-react` uses an explicit DOM-owned plain text capability for the urgent
  active typing lane
- legacy `decorate` callbacks are represented only through the explicitly named
  `createSlateDecorateCompatSource` projection-source adapter; the final public
  `Editable` surface is projection-store first
- custom renderers, projections, empty/zero-width text, and composition fall
  back out of direct DOM sync
- shell activation is separate from selection unless the action intentionally
  places the caret
- shell-backed fragment paste stays model/fragment-owned, not browser-default
  DOM mutation
- child-count chunking is removed from the current `slate-react` product
  runtime; legacy chunking remains only in comparison fixtures
- Chromium browser proof covers active typing, custom render/projection
  fallback, IME composition, shell keyboard activation, shell-backed fragment
  paste, and undo after direct DOM sync
- `slate-dom` and `slate-react` build/typecheck are green

Remaining work belongs to broader release claim-width and example parity, not
this architecture lane.

## Why this is the right target

Ian's feedback is correct: Slate's durable advantage is the JSON-like document
model plus operation layer. That should stay at the top of the principles
stack.

The current huge-document perf work also proved that the old runtime shape is
not good enough:

- `Editor.getSnapshot()` is too expensive as an urgent render read.
- React commit per character is too expensive at 5000 blocks.
- child-count chunking only reduces mounted/reconciled surface; it does not
give a better editor architecture.

So the right move is not to make core React-shaped. The right move is to give
renderers better runtime primitives while preserving the model/operation
identity of Slate.

## Field evidence

### ProseMirror

Local evidence:

- `../prosemirror/view/src/decoration.ts`
- `../prosemirror/state/src/selection.ts`

Relevant lessons:

- overlays are mapped data, not render-time callback mush
- widgets have explicit side/selection behavior
- `SelectionBookmark` is a durable selection value that maps independently and
  resolves later

Slate v2 take:

- keep durable anchors separate from live handles
- expose mapped dirtiness and runtime identity below React
- do not flatten everything through one `decorate` callback

### Lexical

Local evidence:

- `../lexical/packages/lexical/src/LexicalUpdates.ts`
- `../lexical/packages/lexical/src/LexicalReconciler.ts`
- `../lexical/packages/lexical/src/nodes/LexicalDecoratorNode.ts`

Relevant lessons:

- dirty leaves/elements are core runtime data before rendering
- reconciliation receives explicit dirty sets
- decorator UI is a separate lane
- selection and DOM update are handled in the update lifecycle, not as random
  React side effects

Slate v2 take:

- add operation-derived dirty regions as first-class commit metadata
- treat React as a consumer of dirtiness, not the owner of dirtiness
- keep widget/decorator UI separate from text overlays

### VS Code

Local evidence:

- `../vscode/src/vs/editor/common/viewModel/viewModelImpl.ts`
- `../vscode/src/vscode-dts/vscode.d.ts`

Relevant lessons:

- serious editors split text model, view model, decorations, widgets, comments,
  and services
- visible-range and view-line projection are not the same thing as the text
  model

Slate v2 take:

- introduce a renderer-facing view/runtime layer instead of asking React
  components to directly rediscover everything from snapshots
- keep typed channels for decorations, annotations, and widgets

### Pretext / Premirror

Local evidence:

- `../pretext/README.md`
- `../premirror/README.md`

Relevant lessons:

- measurement/layout is derived from document truth
- hot layout work should use precomputed measured state, not DOM reflow
- paged/editor layout can be a dedicated composition lane

Slate v2 take:

- keep layout/pagination out of the core document model
- eventually add a layout lane, not another overlay hack

### TanStack DB

Local evidence:

- `../db/README.md`
- `../db/packages/react-db/src/useLiveQuery.ts`

Relevant lessons:

- normalized collections plus live queries are the right shape for reactive
  external metadata
- React subscriptions want stable store identity and snapshots

Slate v2 take:

- annotations/comments should prefer store/controller APIs, not render-time
  arrays
- overlay metadata does not need to live inside the editor tree

### EditContext

Local evidence:

- `../edit-context/dev-design.md`

Relevant lessons:

- text update, selection update, layout update, and IME formatting are distinct
  platform responsibilities
- composition is not ordinary decoration

Slate v2 take:

- direct DOM/text sync must have explicit IME/composition opt-outs
- accessibility and platform text services are part of the runtime contract, not
  secondary polish

## Target lane split

### Core model lane

Owns:

- JSON-like document tree
- operations
- selection
- marks
- refs/bookmarks
- transactions
- normalization
- dirty-region metadata

Does not own:

- React rendering
- DOM nodes
- shell UI
- browser clipboard transport

### Live runtime lane

Owns hot read APIs:

- current node by path
- current text by path
- current selection
- runtime id by path
- path by runtime id
- changed operations since index
- dirty regions from current transaction

These APIs are data-model/runtime APIs, not React APIs.

### Observer snapshot lane

Owns immutable snapshots for:

- external-store subscribers
- overlays
- devtools
- tests
- non-urgent app observation

Not allowed:

- urgent active text rendering
- ordinary keystroke DOM repair

### DOM-owned plain text lane

Owns direct text DOM sync only when it is explicitly safe:

- plain text op
- active mounted path
- not composing
- no custom renderers
- no decorations/projections on that text
- no zero-width/placeholder special case
- exactly one DOM string node
- accessible text remains equivalent

Everything else falls back to React rendering.

### React render lane

Owns:

- custom rendering
- decorations
- projections
- annotations/widgets
- structural edits
- IME/composition
- placeholder/zero-width
- accessibility-relevant markup

### Shell activation lane

Owns inactive region activation.

Activation must be separate from selection unless the user action intentionally
publishes a visible selection operation.

## Architecture guardrails

- Do not preserve `Editor.getSnapshot()` as the urgent hot read path.
- Do not make `slate` React-first.
- Do not call JSDOM perf proof browser editing proof.
- Do not silently bypass custom renderers, decorations, IME, rich paste, or
  accessibility to win a benchmark.
- Do not revive child-count chunking as the primary answer.

## Evidence ledger

| Corpus | Files inspected | Strongest evidence | Disposition |
| --- | --- | --- | --- |
| ProseMirror | `view/src/decoration.ts`, `state/src/selection.ts` | mapped decorations, widget side/selection specs, selection bookmarks | evidenced |
| Lexical | `LexicalUpdates.ts`, `LexicalReconciler.ts`, `LexicalDecoratorNode.ts` | dirty leaves/elements, explicit reconcile, decorator lane | evidenced |
| VS Code | `viewModelImpl.ts`, `vscode.d.ts` grep/read | text model vs view model, typed decoration/widget/comment surfaces | evidenced |
| Pretext / Premirror | `README.md` files | derived measurement/layout lane over document truth | evidenced |
| TanStack DB | `README.md`, `useLiveQuery.ts` | normalized live store plus React subscription posture | evidenced |
| EditContext | `dev-design.md` | text/selection/layout/IME responsibilities split by platform | evidenced |
| Slate v2 | current `slate`, `slate-react`, perf plan/context | proof that corridor + direct text lane wins measured huge-doc lanes | evidenced, with correctness hardening required |

## Current open risk

The performance architecture can be excellent, but only after the fast path is
made explicit and safe.

The next implementation should harden:

- DOM-owned plain text lane capability checks
- shell activation vs selection separation
- shell accessibility
- shell-backed rich paste
- core live read APIs
- operation dirtiness as commit metadata

Until those are done, the perf win is real but the editing/accessibility story
is not strong enough to call "perfect".
