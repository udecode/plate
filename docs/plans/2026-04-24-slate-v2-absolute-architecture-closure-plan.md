---
date: 2026-04-24
topic: slate-v2-absolute-architecture-closure
status: active
depends_on:
  - docs/plans/2026-04-24-slate-v2-selection-caret-conformance-kernel-plan.md
  - docs/plans/2026-04-23-slate-v2-perfect-architecture-master-plan.md
  - docs/plans/2026-04-23-slate-v2-selection-fresh-editor-methods-architecture-plan.md
  - docs/research/decisions/slate-v2-data-model-first-react-perfect-runtime.md
  - docs/research/decisions/slate-v2-read-update-runtime-architecture.md
  - docs/research/systems/slate-v2-perfect-plan-steal-reject-defer-map.md
source_repos:
  - /Users/zbeyens/git/slate
  - /Users/zbeyens/git/lexical
  - /Users/zbeyens/git/prosemirror
  - /Users/zbeyens/git/tiptap
code_repo:
  - /Users/zbeyens/git/slate-v2
---

# Slate v2 Absolute Architecture Closure Plan

## Verdict

Do not pivot to a different editor.

Pivot harder into the final Slate v2 architecture and close the remaining
escape hatches:

```txt
Slate model + operations
Lexical-style editor.read / editor.update lifecycle
ProseMirror-style transaction and DOM-selection authority
Tiptap-style extension DX
React 19.2 live-read / dirty-commit runtime
Selection/Caret Conformance Kernel
Generated browser gauntlets as release gates
```

The current architecture direction is right. The remaining work is to remove
legacy mental models, make kernel authority impossible to bypass, broaden the
proof from scoped green to battle-tested, and close the exact platform/perf
caveats that still block an "absolute best" claim.

## Why This Plan Exists

The previous conformance-kernel lane is closed for its scoped Batch A-F target.
It proved a lot:

- model, DOM, DOM selection/caret, focus owner, commit metadata, kernel trace,
  repair policy, selection policy, and follow-up typing
- generated warm loops with iteration metadata and shrink candidates
- cross-browser rows for richtext, toolbar, inline, paste, composition, drop,
  shadow, void/internal-control, shell, and focused movement families
- integration, typecheck, lint, and React/core perf guardrails

That is real progress. It is not the same thing as final battle-tested
architecture.

Remaining blockers from the harsh review:

- public mutable fields still exist and keep stale-state habits alive
- `Transforms.*` still exists as a primary-looking API in examples/docs/tests
  unless hard-cut everywhere
- not every mutation path is guaranteed to flow through `editor.update`
- kernel ownership still needs an audit proving controllers cannot decide
  selection source, repair timing, or command target on their own
- generated warm-state gauntlets need broader state-space coverage and must be
  release-blocking for cursor claims
- semantic mobile rows do not prove raw native mobile keyboard, clipboard, and
  IME transport
- active-composition arrow movement is deferred
- huge-doc middle-block typing/select-then-type remains slower than legacy
  chunk-on in the React comparison

## Non-Negotiable Architecture

### Public Runtime

Primary public API:

```ts
editor.read(() => {
  editor.getSelection()
  editor.getChildren()
  editor.getMarks()
})

editor.update(() => {
  editor.unwrapNodes({ match: isList })
  editor.setNodes({ type: 'list-item' })
  editor.wrapNodes({ type: 'bulleted-list', children: [] })
})
```

Rules:

- `editor.update(fn)` is the only blessed write boundary.
- `editor.read(fn)` is the blessed coherent read boundary.
- primitive editor methods stay flexible and schema-agnostic.
- primitive methods use the transaction target when `at` is omitted.
- primitive methods with explicit `at` never import DOM selection.
- `tx.resolveTarget()` remains internal.
- extension methods are public DX, but they must compose through
  `editor.update`.
- optional chain API can exist later only as sugar over `editor.update`.

### Core Truth

- operations remain collaboration truth
- transactions remain local mutation boundary
- `EditorCommit` remains local runtime truth
- dirty paths, dirty runtime ids, dirty top-level ranges, operation classes,
  selection before/after, and commit tags are the render/history/collab facts
- history consumes commits/operations, not method override flow
- React consumes live reads and commit dirtiness, not full snapshot churn

### Browser Truth

Every browser path reduces to:

```txt
event
  -> event frame / epoch
  -> intent
  -> selection source
  -> target resolution
  -> editor.update / transaction
  -> operations
  -> EditorCommit
  -> repair decision
  -> trace
```

Exactly one owner decides that sequence: `EditableConformanceKernel`.

Controllers are workers:

- `InputRouter` classifies raw events only
- `SelectionReconciler` imports/exports model and DOM selection only
- `CaretEngine` computes movement only
- `MutationController` executes model changes through `editor.update` only
- `DOMRepairQueue` executes kernel-scheduled repairs only
- `BrowserHandle` is semantic proof transport only

## Hard Cuts

Cut from primary runtime, docs, examples, tests, and blessed extension patterns:

- public mutable `editor.selection`
- public mutable `editor.children`
- public mutable `editor.marks`
- public mutable `editor.operations`
- public `Transforms.*` as primary mutation API
- direct `editor.apply` as an extension point
- direct `editor.onChange` as an extension point
- app/plugin mutations outside `editor.update`
- command policy objects
- `ReactEditor.runCommand`
- required `focus().chain().run()` ceremony
- method monkeypatching outside `editor.extend`
- browser default structural editing as trusted state
- model-only tests for browser/caret claims
- DOM-only tests for model/editor claims
- semantic mobile rows presented as raw native mobile proof
- child-count chunking as primary product architecture
- callback-first `decorate` as primary overlay architecture

Compat may remain only as explicitly internal or scheduled deletion. Compat must
forward into the new runtime; it must not preserve an alternate write or
selection authority.

## Completion Target

This plan is complete only when all seven batches are closed or deferred with
exact rationale:

- public API hard cuts are complete in docs/examples/tests/type surface
- all implicit-selection mutations flow through `editor.update`
- the kernel authority audit proves no controller can bypass event-frame,
  selection-source, target, mutation, repair, or trace ownership
- generated warm-state gauntlets are broad, replayable, shrinking, and
  release-blocking for cursor claims
- raw native mobile keyboard/clipboard/IME proof is either green or explicitly
  outside the supported release claim with a named follow-up lane
- active-composition arrow movement is proved or explicitly unsupported
- huge-doc middle-block perf caveat is resolved without reviving child-count
  chunking, or accepted with benchmark-backed rationale
- `bun test:integration-local`, relevant package build/type/lint, and React/core
  perf gates pass
- `tmp/completion-check.md` is updated only when this becomes the active
  implementation lane

## Batch 1: Public API Hard Cut

Goal: remove stale-state API pressure from primary usage.

Work:

- inventory every public or React-facing use of:
  - `editor.selection`
  - `editor.children`
  - `editor.marks`
  - `editor.operations`
  - `Transforms.*`
  - `editor.apply`
  - `editor.onChange`
- classify each hit:
  - public docs/example/test usage to delete
  - internal storage needed by runtime
  - compat wrapper that must forward
  - test-only fixture that should be rewritten or isolated
- migrate primary examples to:
  - `editor.read`
  - `editor.update`
  - editor primitive methods
  - extension methods
- remove `Transforms.*` from primary docs/examples.
- remove direct public mutable-field reads from toolbar/app command logic.
- add contract tests that fail if docs/examples reintroduce primary
  `Transforms.*` imports or direct UI-command reads of public mutable fields.

Acceptance:

- no primary docs teach `Transforms.*`
- no primary examples use `Transforms.*` for user commands
- no React-facing toolbar/app command reads `editor.selection` directly
- remaining mutable field usage is explicitly internal/compat and documented
- compat wrappers forward into `editor.update` or internal runtime paths

Do not:

- delete internal storage before the replacement is green
- write dead-code tests whose only job is "old API absent" when a grep gate is
  clearer
- invent semantic methods for every node family

## Batch 2: Write Boundary Enforcement

Goal: prove `editor.update` is the only local write boundary.

Work:

- audit all primitive mutation methods:
  - `select`
  - `setNodes`
  - `wrapNodes`
  - `unwrapNodes`
  - `insertNodes`
  - `removeNodes`
  - `splitNodes`
  - `mergeNodes`
  - `moveNodes`
  - `insertText`
  - `delete`
  - `insertFragment`
  - `insertBreak`
- prove every primitive:
  - opens or joins one transaction
  - uses transaction target when `at` is omitted
  - never imports DOM when explicit `at` is provided
  - emits operation class metadata
  - records selection before/after
  - produces one `EditorCommit`
- add dev/test illegal-write detection for mutations outside `editor.update`
  where safe.
- keep internal compatibility writes only if they enter the same transaction
  runtime.

Acceptance:

- primitive runtime contract covers implicit target, explicit target, selection
  before/after, operation class, dirty ids/paths, and commit metadata
- direct mutation outside `editor.update` fails in dev/test or is classified as
  internal compat with forwarding
- history and React runtime observe the same commit truth

Do not:

- expose `tx.resolveTarget()` to plugin authors
- add command policy objects
- create a second transaction engine

## Batch 3: Extension Runtime Without Monkeypatching

Goal: keep Slate/Plate extension power without letting random method replacement
be the architecture.

Work:

- formalize `editor.extend({ name, methods, normalizers, schema, capabilities,
  handlers, commitListeners })`.
- ensure extension methods compose through `editor.update`.
- ensure extension methods can define custom node transforms with primitives,
  not a bloated core semantic method catalog.
- add conflict/dependency basics:
  - duplicate method names fail in dev/test unless explicitly composed
  - extension order is deterministic
  - dependencies are declared or rejected
- define the minimum replacement path for existing plugin method extensions.

Acceptance:

- custom todo/list/callout transforms can be written as extension methods over
  primitives
- extension methods do not touch DOM selection or repair directly
- extension methods can access `editor.read` / `editor.update` and commit
  metadata without reaching for mutable fields
- method composition is deterministic and test-covered

Do not:

- build full plugin marketplace polish
- solve every Plate migration helper in this batch
- revive method monkeypatching as the blessed path

## Batch 4: Kernel Authority Audit

Goal: prove the conformance kernel is the only browser authority.

Work:

- audit `slate-react` event paths for direct decisions around:
  - selection import
  - selection export
  - target source
  - focus owner
  - repair timing
  - browser default prevention
  - operation dispatch
  - trace emission
- move remaining decisions into `EditableConformanceKernel` results.
- make controllers return worker outputs, not side effects:
  - intent
  - imported selection
  - movement proposal
  - mutation proposal
  - repair request
- add dev/test assertions that fail when a controller schedules repair, imports
  DOM selection, exports DOM selection, or dispatches mutation outside a kernel
  frame.
- add trace snapshots for stale-frame cancellation and repair-induced
  `selectionchange` classification.

Acceptance:

- every browser event produces or joins one event frame
- every mutation commit carries frame id and intent metadata
- every repair request carries frame id and commit id
- stale repairs are cancelled before touching DOM
- repair-induced `selectionchange` cannot re-import as user intent
- no controller bypasses kernel-owned selection/repair/mutation decisions

Do not:

- restore the legacy monolithic `Editable`
- let "small helper" code schedule repairs directly
- treat green final DOM as enough if trace ownership lies

## Batch 5: Generated Gauntlet Release Gate

Goal: stop relying on hand-authored bug rows.

Work:

- make warm-state generated loops a reusable `slate-browser` primitive.
- require shrink/replay artifacts for generated failures:
  - seed
  - warm-up sequence
  - minimized action sequence
  - browser project
  - frame trace
  - model selection
  - DOM selection
  - visible DOM
  - focus owner
  - follow-up typing result
- expand generated families:
  - toolbar mark/block/list/align commands
  - primitive custom transforms
  - navigation chains
  - delete/backspace/range delete
  - paste/cut/drop
  - undo/redo
  - inline/void/zero-width/projection/decorated text
  - shadow DOM
  - shell/large-doc activation
  - nested editable/internal controls
  - composition lifecycle
  - mobile semantic fallback
- promote a stable subset to release-blocking CI.

Acceptance:

- generated failures can be replayed from a recorded artifact
- at least one release-blocking generated warm family runs across Chromium,
  Firefox, WebKit, and mobile where the claim is valid
- cursor claims require DOM selection/caret or follow-up typing proof
- browser rows assert model tree/text, model selection, visible DOM, DOM
  selection/caret where observable, focus owner, commit metadata, no illegal
  transition, and follow-up typing

Do not:

- count semantic handles as native proof
- add endless one-off rows instead of generator coverage
- accept model-only proof for browser editing claims

## Batch 6: Native Mobile And IME Transport

Goal: close or honestly scope native mobile keyboard, clipboard, and IME.

Work:

- split mobile proof into explicit claim classes:
  - semantic handle proof
  - Playwright mobile viewport proof
  - Android Chrome native keyboard proof
  - iOS Safari native keyboard proof
  - native clipboard proof
  - native IME/composition proof
- define which claim classes are required for release.
- add native rows where automation can honestly drive them:
  - plaintext typing
  - selection replacement
  - Backspace/Delete
  - toolbar command after native selection
  - paste plaintext
  - paste rich/html when supported
  - composition lifecycle
  - active-composition arrow movement or explicit unsupported classification
- record platform gaps as exact limitations, not silent skips.

Acceptance:

- mobile semantic rows are named semantic and never counted as raw native
- native mobile rows either pass or are explicitly outside the supported release
  claim
- active-composition arrow movement is proved, unsupported, or deferred with a
  separate owner and exact reason
- native clipboard support is classified by browser/platform and claim width

Do not:

- fake native mobile proof through semantic browser handles
- hide platform inability behind a skip without rationale
- block core architecture on automation that cannot currently drive a platform,
  if the release claim is narrowed honestly

## Batch 7: React Perf Closure Without Chunking

Goal: resolve the remaining huge-doc middle-block caveat without reviving the
old chunk-count architecture.

Work:

- reproduce and isolate the middle-block typing/select-then-type delta against
  legacy chunk-on.
- classify whether the cost is:
  - active island promotion
  - selection import/export
  - direct DOM sync fallback
  - commit allocation
  - dirty runtime-id indexing
  - React subscription breadth
  - projection/source invalidation
  - benchmark harness artifact
- test fixes that preserve architecture:
  - active-block promotion cache
  - narrower dirty top-level range propagation
  - cheaper commit allocation
  - incremental snapshot/index maintenance
  - direct-DOM sync capability fast path
  - selector subscription narrowing
- update perf docs with final accepted numbers and caveats.

Acceptance:

- v2 beats or matches legacy chunk-on for tracked huge-doc rows, or the
  remaining loss is quantified and accepted
- child-count chunking remains cut from product runtime
- React render-breadth guardrails stay green
- core observation and huge-document guardrails stay green
- no perf fix weakens selection/caret conformance proof

Do not:

- revive child-count chunking to win one benchmark row
- optimize by bypassing commit metadata
- make core React-first

## Batch 8: Final Docs, Research, And Release Claim

Goal: make the public story match the real architecture and proof.

Work:

- update primary docs to teach:
  - `editor.read`
  - `editor.update`
  - primitive methods
  - extension methods
  - commit-driven React runtime
  - projection sources
  - generated gauntlet proof expectations
- remove primary docs that teach:
  - `Transforms.*`
  - public mutable fields
  - `editor.apply` / `editor.onChange` as extension points
  - browser-default structural editing as trusted state
- update research and plan references if evidence changes.
- update completion ledger when implementation starts and when it closes.

Acceptance:

- public docs describe the latest state only, with no migration/changelog tone
- release claim clearly states:
  - what is proved across browsers
  - what is semantic-only
  - what is native mobile
  - what remains deferred
- `tmp/completion-check.md` is `done` only after all active implementation
  targets are closed

Do not:

- claim "regression-free" without generated release gates
- claim raw native mobile from semantic rows
- claim absolute perf if middle-block caveat remains unaccepted

## Driver Gates

Core:

```sh
bun test ./packages/slate/test/read-update-contract.ts --bail 1
bun test ./packages/slate/test/primitive-method-runtime-contract.ts --bail 1
bun test ./packages/slate/test/transaction-target-runtime-contract.ts --bail 1
bun test ./packages/slate/test/commit-metadata-contract.ts --bail 1
bun test ./packages/slate/test/bookmark-contract.ts --bail 1
bun test ./packages/slate-history --bail 1
bunx turbo build --filter=./packages/slate --filter=./packages/slate-history --force
bunx turbo typecheck --filter=./packages/slate --filter=./packages/slate-history --force
```

React/browser:

```sh
bun test ./packages/slate-react/test/editing-kernel-contract.ts ./packages/slate-react/test/selection-controller-contract.ts ./packages/slate-react/test/dom-repair-policy-contract.ts --bail 1
bun test ./packages/slate-react/test/target-runtime-contract.tsx --bail 1
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
bunx turbo build --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force
bunx turbo typecheck --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force
```

Browser release proof:

```sh
bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "selection|caret|toolbar|bold|heading|arrow|backspace|delete|warm|generated" --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/inlines.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/editable-voids.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/shadow-dom.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/paste-html.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --workers=4 --retries=0
bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --workers=4 --retries=0
bun test:integration-local
```

Perf:

```sh
bun run bench:react:rerender-breadth:local
REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
bun run bench:core:observation:compare:local
bun run bench:core:huge-document:compare:local
```

Always after code changes:

```sh
bun run lint:fix
bun run lint
```

## Execution Rules

- execute by tracer slices, not horizontal rewrite
- start with Batch 1 unless active user evidence points to a P0 kernel/native
  transport bug
- after every slice, update this plan with:
  - actions
  - commands
  - artifacts
  - evidence
  - failed probes
  - owner classification
  - rejected tactics
  - next move
- if this plan becomes active, set `tmp/completion-check.md` to `pending`
  before code work starts
- do not set `tmp/completion-check.md` to `done` until all active completion
  targets are met or exactly deferred

## Stop Rule

Stop only when:

- all batches are complete, or
- every remaining item is explicitly accepted/deferred with exact rationale, or
- no autonomous progress is possible and the exact missing evidence/user
  decision is named, or
- the user explicitly asks to pause

A pivot is not stop. A replan is not stop. A red browser lane is not stop.

## Initial Next Move

Start with Batch 1:

1. inventory mutable fields, `Transforms.*`, `editor.apply`, and
   `editor.onChange` usage in `../slate-v2`
2. classify every hit by public, example, test, internal runtime, or compat
3. add the first hard-cut contract for primary docs/examples
4. migrate the highest-signal example rows first
5. run focused docs/example grep gates and core public-surface tests

## Execution Ledger

### 2026-04-24 Activation: Batch 1 Public API Hard Cut

Actions:

- activated this plan as the current completion lane
- switched `tmp/completion-check.md` to `status: pending`
- confirmed Batch 1 starts with inventory/classification before broad edits

Commands:

- `sed -n '1,260p' docs/plans/2026-04-24-slate-v2-absolute-architecture-closure-plan.md`
- `sed -n '260,620p' docs/plans/2026-04-24-slate-v2-absolute-architecture-closure-plan.md`
- `sed -n '1,160p' tmp/completion-check.md`
- `sed -n '1,220p' package.json`

Artifacts:

- active plan: `docs/plans/2026-04-24-slate-v2-absolute-architecture-closure-plan.md`
- completion gate: `tmp/completion-check.md`

Evidence:

- the previous conformance-kernel lane is closed, but the absolute
  architecture closure lane is still open
- Batch 1 owner is stale public API pressure, not another local caret patch

Hypothesis:

- the first durable win is a reproducible inventory plus a focused gate that
  stops examples/docs from re-teaching `Transforms.*` and public mutable fields

Decision:

- start with Batch 1 inventory and public-surface gate

Owner classification:

- current owner: public API hard cut
- next likely owner after first green slice: write-boundary enforcement

Changed files:

- `docs/plans/2026-04-24-slate-v2-absolute-architecture-closure-plan.md`
- `tmp/completion-check.md`

Rejected tactics:

- do not start with broad internal runtime deletion before inventory
- do not reopen browser cursor patches before API pressure is classified

Next action:

- run stale API inventory in `/Users/zbeyens/git/slate-v2`

### 2026-04-24 Slice 1: Richtext Public-Surface Guard

Actions:

- inventoried the first high-signal public example pair:
  `site/examples/ts/richtext.tsx` and `site/examples/js/richtext.jsx`
- added a focused public-surface contract that rejects stale API teaching in
  primary richtext examples
- proved the contract RED against `site/examples/js/richtext.jsx`
- migrated the JS richtext example from `Transforms.*`, raw `editor.selection`,
  and `onKeyDown` hotkey mutation to editor methods, `editor.getSelection()`,
  `editor.getMarks()`, and `onKeyCommand`

Commands:

- `bun test ./packages/slate/test/public-surface-contract.ts --bail 1`
- `sed -n '1,260p' site/examples/js/richtext.jsx`
- `sed -n '1,260p' site/examples/ts/richtext.tsx`
- `sed -n '260,520p' site/examples/ts/richtext.tsx`
- `bun test ./packages/slate/test/public-field-hard-cut-contract.ts --bail 1`
- `bun test ./packages/slate/test/read-update-contract.ts --bail 1`
- `bun test ./packages/slate/test/primitive-method-runtime-contract.ts --bail 1`

Artifacts:

- `../slate-v2/packages/slate/test/public-surface-contract.ts`
- `../slate-v2/site/examples/js/richtext.jsx`

Evidence:

- RED probe failed on `/\bTransforms\./` in
  `site/examples/js/richtext.jsx`
- GREEN: `bun test ./packages/slate/test/public-surface-contract.ts --bail 1`
  passed with 2 tests
- GREEN:
  `bun test ./packages/slate/test/public-field-hard-cut-contract.ts --bail 1`
  passed with 2 tests
- GREEN: `bun test ./packages/slate/test/read-update-contract.ts --bail 1`
  passed with 2 tests
- GREEN:
  `bun test ./packages/slate/test/primitive-method-runtime-contract.ts --bail 1`
  passed with 18 tests

Failed probes:

- `bun test ./packages/slate/test/public-surface-contract.ts --bail 1`
  initially failed because the JS richtext example still taught
  `Transforms.*`

Owner classification:

- current owner: public API hard cut
- completed sub-owner: primary richtext examples
- next owner: widen stale API inventory to remaining primary examples without
  touching internal transform fixtures

Rejected tactics:

- do not migrate every `Transforms.*` fixture under `packages/slate/test`
  in this slice; transform fixtures are compatibility/internal proof until
  the public surface is clean
- do not add semantic helper sprawl for richtext; the JS example follows the
  method-first primitives already used by TS richtext

Next action:

- widen the public-surface contract to the next primary examples/docs tier and
  migrate only rows that teach stale public API to app authors

### 2026-04-24 Slice 2: Public Examples Hard Cut

Actions:

- widened the public-surface guard from richtext to primary public examples
  that were still teaching stale mutation or mutable-state APIs
- migrated examples from `Transforms.*` to editor primitives and update
  grouping where the action is one user intent
- removed public example reads of stale mutable fields such as
  `editor.selection` and `editor.children`
- removed JS example method overrides that taught stale extension patterns:
  check-lists `deleteBackward`, markdown-shortcuts `insertText` /
  `deleteBackward`, and huge-document `editor.apply`
- aligned JS examples with the newer TS runtime shape where TS already used
  input rules, key-command handling, live selection reads, or subscription
  observation
- fixed `packages/slate/package.json` export-map typing by adding explicit
  `types` and `import` conditions for TypeScript bundler resolution

Commands:

- `rg -n "\bTransforms\.|\beditor\.(selection|children|marks|operations)\b|\beditor\.(apply|onChange)\s*=" site/examples docs --glob '!site/out/**' --glob '!site/.next/**'`
- `bun test ./packages/slate/test/public-surface-contract.ts --bail 1`
- `bun test ./packages/slate/test/public-field-hard-cut-contract.ts --bail 1`
- `bun test ./packages/slate/test/read-update-contract.ts --bail 1`
- `bun test ./packages/slate/test/primitive-method-runtime-contract.ts --bail 1`
- `bun install`
- `bunx turbo build --filter=./packages/slate --force`
- `bunx turbo typecheck --filter=./packages/slate --force`
- `bun run typecheck:site`
- `bun run lint:fix`
- `bun run lint`
- `bunx playwright test ./playwright/integration/examples/forced-layout.test.ts ./playwright/integration/examples/editable-voids.test.ts ./playwright/integration/examples/paste-html.test.ts ./playwright/integration/examples/check-lists.test.ts ./playwright/integration/examples/embeds.test.ts ./playwright/integration/examples/images.test.ts ./playwright/integration/examples/code-highlighting.test.ts ./playwright/integration/examples/inlines.test.ts ./playwright/integration/examples/mentions.test.ts ./playwright/integration/examples/markdown-shortcuts.test.ts ./playwright/integration/examples/review-comments.test.ts ./playwright/integration/examples/persistent-annotation-anchors.test.ts ./playwright/integration/examples/large-document-runtime.test.ts ./playwright/integration/examples/huge-document.test.ts --project=chromium --workers=4 --retries=0`

Artifacts:

- `../slate-v2/packages/slate/test/public-surface-contract.ts`
- `../slate-v2/packages/slate/package.json`
- `../slate-v2/site/examples/ts/richtext.tsx`
- `../slate-v2/site/examples/js/richtext.jsx`
- `../slate-v2/site/examples/ts/forced-layout.tsx`
- `../slate-v2/site/examples/js/forced-layout.jsx`
- `../slate-v2/site/examples/ts/editable-voids.tsx`
- `../slate-v2/site/examples/js/editable-voids.jsx`
- `../slate-v2/site/examples/ts/paste-html.tsx`
- `../slate-v2/site/examples/js/paste-html.jsx`
- `../slate-v2/site/examples/ts/check-lists.tsx`
- `../slate-v2/site/examples/js/check-lists.jsx`
- `../slate-v2/site/examples/ts/embeds.tsx`
- `../slate-v2/site/examples/js/embeds.jsx`
- `../slate-v2/site/examples/ts/images.tsx`
- `../slate-v2/site/examples/js/images.jsx`
- `../slate-v2/site/examples/ts/code-highlighting.tsx`
- `../slate-v2/site/examples/js/code-highlighting.jsx`
- `../slate-v2/site/examples/ts/inlines.tsx`
- `../slate-v2/site/examples/js/inlines.jsx`
- `../slate-v2/site/examples/ts/mentions.tsx`
- `../slate-v2/site/examples/js/mentions.jsx`
- `../slate-v2/site/examples/ts/markdown-shortcuts.tsx`
- `../slate-v2/site/examples/js/markdown-shortcuts.jsx`
- `../slate-v2/site/examples/ts/large-document-runtime.tsx`
- `../slate-v2/site/examples/ts/review-comments.tsx`
- `../slate-v2/site/examples/ts/persistent-annotation-anchors.tsx`
- `../slate-v2/site/examples/js/huge-document.jsx`

Evidence:

- public-surface guard passed with 26 tests
- direct stale public example inventory under `site/examples` returned no hits
- remaining stale-string hits are in `docs/general/changelog.md`, classified as
  historical changelog text rather than current docs/examples
- Slate package build passed
- Slate package typecheck passed with 2 successful tasks
- site typecheck passed after export-map typing fix
- lint fix passed after fixing the JS markdown shortcut syntax error caught by
  Biome
- lint passed
- Chromium affected-example proof passed with 56 tests

Failed probes:

- public-surface guard intentionally failed as each stale example family was
  added before migration
- `bun run typecheck:site` initially failed because TypeScript bundler
  resolution could not resolve package `slate` through the package export map
- `bun run lint:fix` initially failed on a real syntax error in the JS
  markdown-shortcuts migration; the error was fixed and lint reran green

Owner classification:

- completed owner: Batch 1 Public API Hard Cut for primary examples
- historical docs owner remains: `docs/general/changelog.md`, deferred until
  Batch 8 docs cleanup or changelog deletion decision
- next owner: Batch 2 Write Boundary Enforcement

Rejected tactics:

- do not rewrite internal transform fixtures in this public example slice
- do not introduce node-family semantic method sprawl; public examples use
  primitives plus `editor.update` where needed
- do not count Chromium example proof as release parity; cross-browser release
  proof remains a later gate

Next action:

- audit primitive mutation methods and extend write-boundary contracts for
  implicit target, explicit target, one transaction/commit, selection
  before/after, operation class, dirty paths/runtime ids, and history/React
  observation

### 2026-04-24 Slice 3: Write Boundary Contract Hardening

Actions:

- audited existing primitive method runtime, transaction target, commit
  metadata, and write-boundary contracts
- confirmed implicit target coverage already spans wrap/remove/split/insert
  text/set/unset/delete/fragment/unwrap/lift/move/merge/insert nodes/break and
  delete backward/forward/fragment
- added explicit-target breadth proof across select, setNodes, insertText,
  delete, insertFragment, insertNodes, removeNodes, wrapNodes, and unwrapNodes
- added multi-primitive `editor.update` proof that two primitive writes publish
  one commit with operation list, operation class, selection before/after, and
  dirty metadata
- classified direct primitive method calls outside `editor.update` as
  compatibility auto-transactions that forward into the same transaction
  runtime, not a separate write architecture

Commands:

- `sed -n '1,260p' packages/slate/test/primitive-method-runtime-contract.ts`
- `sed -n '1,260p' packages/slate/test/transaction-target-runtime-contract.ts`
- `sed -n '1,260p' packages/slate/test/commit-metadata-contract.ts`
- `sed -n '1,220p' packages/slate/test/write-boundary-contract.ts`
- `bun test ./packages/slate/test/transaction-target-runtime-contract.ts --bail 1`
- `bun test ./packages/slate/test/commit-metadata-contract.ts --bail 1`
- `bun test ./packages/slate/test/primitive-method-runtime-contract.ts --bail 1`
- `bun test ./packages/slate/test/write-boundary-contract.ts ./packages/slate/test/transaction-target-runtime-contract.ts ./packages/slate/test/commit-metadata-contract.ts ./packages/slate/test/primitive-method-runtime-contract.ts --bail 1`
- `bunx turbo build --filter=./packages/slate --force`
- `bunx turbo typecheck --filter=./packages/slate --force`
- `bun run lint:fix`
- `bun run lint`

Artifacts:

- `../slate-v2/packages/slate/test/transaction-target-runtime-contract.ts`
- `../slate-v2/packages/slate/test/commit-metadata-contract.ts`

Evidence:

- transaction target runtime contract passed with 5 tests
- commit metadata contract passed with 2 tests
- primitive method runtime contract passed with 18 tests
- combined Batch 2 focused contract passed with 26 tests across 4 files
- Slate package build passed
- Slate package typecheck passed with 2 successful tasks
- lint fix/check passed

Failed probes:

- none in this slice; the new contracts passed against the current runtime

Owner classification:

- completed owner: Batch 2 write-boundary proof for primitive target and
  commit grouping
- deferred owner: destructive failure for all direct primitive calls outside
  `editor.update`; current runtime keeps them as compatibility auto-transactions
  until public docs/type surface hard cut is complete
- next owner: Batch 3 extension runtime without monkeypatching

Rejected tactics:

- do not create a second transaction engine
- do not expose `tx.resolveTarget()` publicly
- do not break existing compatibility direct primitive calls in the same slice
  that hardens `editor.update`

Next action:

- audit `editor.extend`, extension method registration, duplicate method
  handling, commit listeners, and existing method monkeypatch surfaces

### 2026-04-24 Slice 4: Extension Runtime Without Monkeypatching

Actions:

- audited `editor.extend`, extension method registration, duplicate method
  handling, and public example method replacement patterns
- hardened extension method composition so duplicate extension methods require
  an explicit dependency on the previous owner
- added rollback coverage for failed extension registration so rejected
  extension attempts do not leave partial method/runtime state installed
- widened the public-surface guard to block direct example replacement of
  extension-sensitive editor methods such as `isVoid`, `isInline`,
  `insertData`, `normalizeNode`, `insertBreak`, and `getChunkSize`
- migrated public examples from direct method replacement to
  `defineEditorExtension` plus `editor.extend`
- moved the tables example from method replacement to `onKeyCommand`
  boundary handling
- moved huge-document chunk sizing into a named extension method provider
- kept `Transforms.*` and mutable public-field guards active while adding the
  extension monkeypatch guard

Commands:

- `bun test ./packages/slate/test/public-surface-contract.ts --bail 1`
- `rg -n "\beditor\.(isVoid|isInline|isElementReadOnly|isSelectable|markableVoid|insertData|insertText|deleteBackward|deleteForward|insertBreak|normalizeNode|getChunkSize)\s*=" site/examples/ts site/examples/js --glob '!site/out/**' --glob '!site/.next/**'`
- `bun test ./packages/slate/test/public-surface-contract.ts ./packages/slate/test/extension-methods-contract.ts ./packages/slate/test/extension-contract.ts --bail 1`
- `bun run typecheck:site`
- `bunx turbo build --filter=./packages/slate --force`
- `bunx turbo typecheck --filter=./packages/slate --force`
- `bun run lint:fix`
- `bun run lint`
- `bunx playwright test ./playwright/integration/examples/editable-voids.test.ts ./playwright/integration/examples/embeds.test.ts ./playwright/integration/examples/paste-html.test.ts ./playwright/integration/examples/images.test.ts ./playwright/integration/examples/inlines.test.ts ./playwright/integration/examples/mentions.test.ts ./playwright/integration/examples/forced-layout.test.ts ./playwright/integration/examples/large-document-runtime.test.ts ./playwright/integration/examples/tables.test.ts ./playwright/integration/examples/huge-document.test.ts --project=chromium --workers=4 --retries=0`

Artifacts:

- `../slate-v2/packages/slate/src/core/editor-extension.ts`
- `../slate-v2/packages/slate/test/extension-methods-contract.ts`
- `../slate-v2/packages/slate/test/public-surface-contract.ts`
- `../slate-v2/site/examples/ts/editable-voids.tsx`
- `../slate-v2/site/examples/js/editable-voids.jsx`
- `../slate-v2/site/examples/ts/embeds.tsx`
- `../slate-v2/site/examples/js/embeds.jsx`
- `../slate-v2/site/examples/ts/paste-html.tsx`
- `../slate-v2/site/examples/js/paste-html.jsx`
- `../slate-v2/site/examples/ts/images.tsx`
- `../slate-v2/site/examples/js/images.jsx`
- `../slate-v2/site/examples/ts/inlines.tsx`
- `../slate-v2/site/examples/js/inlines.jsx`
- `../slate-v2/site/examples/ts/mentions.tsx`
- `../slate-v2/site/examples/js/mentions.jsx`
- `../slate-v2/site/examples/ts/forced-layout.tsx`
- `../slate-v2/site/examples/js/forced-layout.jsx`
- `../slate-v2/site/examples/ts/large-document-runtime.tsx`
- `../slate-v2/site/examples/js/tables.jsx`
- `../slate-v2/site/examples/js/huge-document.jsx`

Evidence:

- public-surface guard passed with 43 tests after adding the extension
  monkeypatch guard
- direct example method-replacement scan returned no hits
- extension/public-surface focused contracts passed with 53 tests across
  3 files
- site typecheck passed after annotating the typed images `insertData`
  callback as `DataTransfer`
- Slate package build passed
- Slate package typecheck passed with 2 successful tasks
- lint fix/check passed after removing dead forced-layout destructuring
  bindings exposed by the migration
- Chromium affected-example proof passed with 50 tests across editable voids,
  embeds, paste HTML, images, inlines, mentions, forced layout, large-document
  runtime, tables, and huge document

Failed probes:

- public-surface guard intentionally failed when `js/tables` was added before
  migrating its direct `deleteBackward` / `deleteForward` / `insertBreak`
  replacement
- `bun run typecheck:site` failed once because the typed images extension
  callback left `data.files` iteration as `unknown`
- `bun run lint:fix` failed once on dead `node` bindings in forced-layout
  extension callbacks

Owner classification:

- completed owner: Batch 3 Extension Runtime Without Monkeypatching for public
  example and extension contract surface
- deferred owner: internal legacy method slots that remain runtime
  implementation details until the type-surface hard cut
- next owner: Batch 4 Kernel Authority Audit

Rejected tactics:

- do not relax the public-surface guard to preserve old example monkeypatches
- do not introduce semantic helper sprawl for tables or huge-doc chunking
- do not make `ReactEditor.runCommand` or command policy objects the extension
  migration path
- do not count Chromium example proof as release parity; cross-browser browser
  release proof remains a later gate

Next action:

- audit the editable kernel/controller code to prove event-frame ownership,
  selection source, target resolution, mutation execution, repair scheduling,
  and trace emission are decided by one authority rather than leaking across
  controllers

### 2026-04-24 Slice 5: Kernel Frame Timing Hardening

Actions:

- audited editable event paths for frame timing around selectionchange,
  DOM input repair, paste, cut, and drop
- moved `selectionchange` handling to begin an editable event frame before
  importing or preserving DOM selection
- added selectionchange ownership classification so native user changes remain
  native-owned while repair-induced and programmatic-export changes stay
  model-owned
- added a transition rejection for programmatic/repair-induced
  `selectionchange` traces that try to re-import as native intent
- threaded event frame ids through `repairDOMInput` so delayed input repair
  cancels before mutating selection or text if a newer event frame superseded it
- split frame start from trace record in `Editable` so paste, cut, and drop
  open their event frame before executing mutation workers, then record the
  command/trace after the worker returns
- added a pending-frame marker so trace recording can reuse only the frame
  opened for the current handler and cannot accidentally reuse a stale previous
  same-family frame

Commands:

- `bun test ./packages/slate-react/test/editing-kernel-contract.ts ./packages/slate-react/test/selection-controller-contract.ts ./packages/slate-react/test/dom-repair-policy-contract.ts --bail 1`
- `bunx turbo build --filter=./packages/slate-react --force`
- `bunx turbo typecheck --filter=./packages/slate-react --force`
- `bun run lint:fix`
- `bun run lint`
- `bunx playwright test ./playwright/integration/examples/richtext.test.ts ./playwright/integration/examples/paste-html.test.ts ./playwright/integration/examples/inlines.test.ts --project=chromium --grep "selectionchange|repair|paste|drop|cut|toolbar mark|warm toolbar|plain text paste" --workers=4 --retries=0`
- `bunx playwright test ./playwright/integration/examples/richtext.test.ts ./playwright/integration/examples/paste-html.test.ts ./playwright/integration/examples/inlines.test.ts --project=firefox --project=webkit --project=mobile --grep "selectionchange|repair|paste|drop|cut|toolbar mark|warm toolbar|plain text paste" --workers=4 --retries=0`

Artifacts:

- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/src/editable/editing-kernel.ts`
- `../slate-v2/packages/slate-react/src/editable/dom-repair-queue.ts`
- `../slate-v2/packages/slate-react/test/editing-kernel-contract.ts`

Evidence:

- kernel/selection/repair contracts passed with 22 tests and 50 assertions
- Slate React package build passed
- Slate React package typecheck passed with 2 successful tasks
- lint fix/check passed
- Chromium focused timing proof passed with 15 tests covering selectionchange,
  repair, paste, drop, cut, toolbar mark, warm toolbar, and plain text paste
- Firefox/WebKit/mobile focused timing proof passed with 45 tests over the same
  behavior family

Failed probes:

- Slate React typecheck initially failed because the selectionchange callback
  referenced `domRepairQueue` before that hook is created; the repair queue
  cancellation path was moved through a ref
- the initial trace-frame reuse approach was too loose because event frames are
  not globally ended; the final patch uses a pending-frame id so only the
  current handler's pre-opened frame can be reused

Owner classification:

- current owner remains: Batch 4 Kernel Authority Audit
- completed sub-owner: frame-first timing for selectionchange, DOM input repair,
  paste, cut, and drop
- remaining owner: direct mutation/import/export call-site classification and
  assertions for strategy/controller bypasses

Rejected tactics:

- do not classify Chromium-only timing proof as browser closure
- do not leave delayed DOM input repair without frame id cancellation
- do not reuse current event frames by event family alone; that reopens stale
  frame bugs because frames are not globally ended today

Next action:

- add a kernel-authority audit contract that inventories direct selection
  import/export, repair scheduling, and mutation dispatch call sites, then
  migrate or explicitly classify each remaining strategy/controller path

### 2026-04-24 Slice 6: Kernel Authority Audit Contract

Actions:

- added an executable kernel-authority inventory for Slate React editable
  runtime files
- froze allowed files/counts for event-frame creation and trace emission
- froze the remaining selection bridge inventory for
  `syncEditorSelectionFromDOM`, `syncEditableDOMSelectionToEditor`, and direct
  selection transforms
- froze the remaining mutation and repair inventory for direct model mutation,
  repair scheduling, and DOM input repair call sites
- kept this as an audit contract, not a completion claim; the current inventory
  is still too broad and must be burned down or explicitly classified in later
  Batch 4 slices

Commands:

- `bun test ./packages/slate-react/test/kernel-authority-audit-contract.ts --bail 1`
- `bun test ./packages/slate-react/test/kernel-authority-audit-contract.ts ./packages/slate-react/test/editing-kernel-contract.ts ./packages/slate-react/test/selection-controller-contract.ts ./packages/slate-react/test/dom-repair-policy-contract.ts --bail 1`
- `bunx turbo build --filter=./packages/slate-react --force`
- `bunx turbo typecheck --filter=./packages/slate-react --force`
- `bun run lint:fix`
- `bun run lint`

Artifacts:

- `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`

Evidence:

- kernel-authority audit contract passed with 3 tests and 6 assertions
- combined Batch 4 focused contracts passed with 25 tests and 56 assertions
- Slate React package build passed
- Slate React package typecheck passed with 2 successful tasks
- lint fix/check passed
- post-lint focused contract rerun passed with 25 tests and 56 assertions
- post-lint Slate React typecheck passed with 2 successful tasks

Failed probes:

- none; this slice intentionally froze the current inventory before burn-down

Owner classification:

- current owner remains: Batch 4 Kernel Authority Audit
- completed sub-owner: executable authority inventory guard
- remaining owner: burn down or explicitly classify the broad direct mutation,
  selection transform, and repair scheduling inventory captured by the audit
  contract

Rejected tactics:

- do not rely on prose inventory for authority ownership
- do not treat this audit as closure; it is a regression tripwire and burn-down
  ledger
- do not allow new editable strategy files to gain mutation/selection/repair
  authority without updating the audit contract and rationale

Next action:

- start burning down the highest-risk authority inventory: model mutations and
  repair requests in `model-input-strategy`, `keyboard-input-strategy`, and
  `clipboard-input-strategy` should return kernel/worker results where possible
  instead of scheduling repair or mutating directly

### 2026-04-24 Slice 7: BeforeInput Repair Authority Burn-Down

Actions:

- converted `applyModelOwnedBeforeInputOperation` from a worker that mutates
  and schedules repair to a worker that mutates and returns an
  `EditableRepairRequest`
- moved beforeinput repair application back to the `Editable` event owner via
  `requestEditableRepair(repair)`
- removed now-unused `domRepairQueue` and
  `preferModelSelectionForInputRef` inputs from the beforeinput model worker
- updated the kernel-authority audit inventory after `model-input-strategy`
  repair authority dropped from 7 direct repair call sites to 3

Commands:

- `bun test ./packages/slate-react/test/kernel-authority-audit-contract.ts --bail 1`
- `bun test ./packages/slate-react/test/kernel-authority-audit-contract.ts ./packages/slate-react/test/editing-kernel-contract.ts ./packages/slate-react/test/selection-controller-contract.ts ./packages/slate-react/test/dom-repair-policy-contract.ts ./packages/slate-react/test/target-runtime-contract.tsx ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`
- `bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- `bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- `bun run lint:fix`
- `bun run lint`
- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "selection|caret|toolbar|bold|heading|arrow|backspace|delete|warm|generated" --workers=4 --retries=0`

Artifacts:

- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/src/editable/model-input-strategy.ts`
- `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`

Evidence:

- kernel-authority audit first failed red because the repair inventory count
  dropped from 7 to 3 in `model-input-strategy`
- updated kernel-authority audit passed
- combined Slate React focused contracts passed with 28 tests and 66
  assertions
- Slate DOM + Slate React build passed with 2 successful tasks
- Slate DOM + Slate React typecheck passed with 4 successful tasks
- lint fix/check passed
- post-lint focused contract rerun passed with 28 tests and 66 assertions
- post-lint Slate DOM + Slate React typecheck passed with 4 successful tasks
- richtext cross-browser cursor/selection gate passed with 124 tests across
  Chromium, Firefox, WebKit, and mobile

Failed probes:

- kernel-authority audit intentionally failed on the old expected
  `model-input-strategy` repair count, proving the guard catches authority
  inventory changes

Owner classification:

- current owner remains: Batch 4 Kernel Authority Audit
- completed sub-owner: beforeinput model worker repair scheduling moved back to
  the event owner
- remaining owner: `keyboard-input-strategy` and `clipboard-input-strategy`
  still carry direct repair/mutation authority that should be reduced or
  explicitly classified

Rejected tactics:

- do not keep `requestRepair` inside every model worker as an easy callback
- do not call the worker-result extraction complete while clipboard and
  keyboard strategies still directly schedule repair and mutate selections
- do not treat cross-browser richtext proof as full Batch 4 closure; it proves
  this timing family only

Next action:

- continue the Batch 4 authority burn-down with `keyboard-input-strategy`:
  return repair requests for key-command/caret/select-all paths where possible
  while preserving current browser behavior and trace gates

### 2026-04-24 Slice 8: Keyboard Repair Authority Burn-Down

Actions:

- converted `applyEditableKeyDown` from a boolean-returning worker into a
  worker-result API with `{ handled, repair }`
- moved key-command repair application back to the `Editable` event owner via
  `requestEditableRepair(repair)`
- removed the direct `requestRepair(...)` call from
  `keyboard-input-strategy`
- kept the remaining `requestRepair` callback only for caret movement paths
  that still need a narrower extraction/classification pass
- updated the kernel-authority audit inventory after
  `keyboard-input-strategy` repair scheduling dropped from one direct repair
  call site to zero

Commands:

- `bun test ./packages/slate-react/test/kernel-authority-audit-contract.ts --bail 1`
- `bun test ./packages/slate-react/test/kernel-authority-audit-contract.ts ./packages/slate-react/test/editing-kernel-contract.ts ./packages/slate-react/test/selection-controller-contract.ts ./packages/slate-react/test/dom-repair-policy-contract.ts ./packages/slate-react/test/target-runtime-contract.tsx ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`
- `bun run lint:fix`
- `bun run lint`
- `bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "selection|caret|toolbar|bold|heading|arrow|backspace|delete|warm|generated" --workers=4 --retries=0`

Artifacts:

- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/src/editable/keyboard-input-strategy.ts`
- `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`

Evidence:

- kernel-authority audit first failed red because the repair inventory changed
  after `keyboard-input-strategy` stopped scheduling repair directly
- combined Slate React focused contracts passed with 28 tests and 66
  assertions
- lint fix/check passed with no fixes applied
- Slate DOM + Slate React typecheck passed with 4 successful tasks
- richtext cross-browser cursor/selection gate passed with 124 tests across
  Chromium, Firefox, WebKit, and mobile

Failed probes:

- kernel-authority audit intentionally failed on the old expected repair
  inventory, proving the guard catches strategy-owned repair changes

Owner classification:

- current owner remains: Batch 4 Kernel Authority Audit
- completed sub-owner: key-command repair scheduling moved back to the event
  owner
- remaining owner: clipboard and caret-movement paths still need burn-down or
  explicit classification; clipboard is the highest-risk next path because it
  owns mutation, selection deletion, fragment insertion, trace context, and
  repair scheduling together

Rejected tactics:

- do not keep making keyboard branches schedule their own repair as a
  convenience callback
- do not broaden semantic editor methods to hide timing debt
- do not treat a zero direct repair count in keyboard as full keyboard
  authority closure while caret movement still receives a repair callback

Next action:

- continue Batch 4 with `clipboard-input-strategy`: extract a worker-result
  shape for mutation/repair/trace where possible, or explicitly classify why a
  remaining clipboard-owned operation must stay inside the strategy

Checkpoint:

- verdict: keep course
- harsh take: keyboard repair extraction is a real authority reduction, but the
  clipboard path still smells like a mini-editor hiding inside a strategy
- why: the audit caught the repair inventory drop, all focused contracts are
  green, and cross-browser richtext proof stayed green across the highest-risk
  cursor rows
- risks: clipboard owns deletion, fragment insertion, selection restoration,
  trace context, and repair scheduling together, so extracting too much at once
  could hide a behavior regression
- earliest gates: safety is the kernel-authority audit contract; progress is
  the richtext paste/caret rows plus focused Slate React contracts
- next move: burn down `clipboard-input-strategy` authority by returning a
  result to the event owner where possible, with audit-driven red/green proof
- do-not-do list: do not patch one clipboard row at a time, do not expose
  target policies to users, and do not claim Batch 4 closure while clipboard
  still owns unclassified mutation/repair authority

### 2026-04-24 Slice 9: Clipboard Repair Authority Burn-Down

Actions:

- converted paste, cut, and drop workers to return
  `EditableClipboardResult` with `command`, optional `repair`, and optional
  shell-backed selection state changes
- moved clipboard repair scheduling back to the `Editable` event owner for
  cut selection deletion, shell-backed paste, plain paste fallback, and external
  drop focus repair
- moved shell-backed selection flag updates back to the `Editable` event owner
- updated the kernel-authority audit inventory after
  `clipboard-input-strategy` repair scheduling dropped from six direct repair
  call sites to zero
- kept clipboard mutation and selection transforms in the strategy for this
  slice; they are the next classification/burn-down target, not hidden debt

Commands:

- `bun test ./packages/slate-react/test/kernel-authority-audit-contract.ts --bail 1`
- `bun test ./packages/slate-react/test/kernel-authority-audit-contract.ts ./packages/slate-react/test/editing-kernel-contract.ts ./packages/slate-react/test/selection-controller-contract.ts ./packages/slate-react/test/dom-repair-policy-contract.ts ./packages/slate-react/test/target-runtime-contract.tsx ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`
- `bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- `bun run lint:fix`
- `bun run lint`
- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "selection|caret|toolbar|bold|heading|arrow|backspace|delete|warm|generated" --workers=4 --retries=0`

Artifacts:

- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/src/editable/clipboard-input-strategy.ts`
- `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`

Evidence:

- kernel-authority audit first failed red because the old expected
  `clipboard-input-strategy` repair count was six and the new count is zero
- combined Slate React focused contracts passed with 28 tests and 66
  assertions
- Slate DOM + Slate React typecheck passed with 4 successful tasks
- lint fix/check passed with no fixes applied
- richtext cross-browser cursor/selection gate passed with 124 tests across
  Chromium, Firefox, WebKit, and mobile

Failed probes:

- kernel-authority audit intentionally failed on the old clipboard repair
  inventory, proving the guard catches this authority movement

Owner classification:

- current owner remains: Batch 4 Kernel Authority Audit
- completed sub-owner: clipboard repair scheduling moved back to the event
  owner
- remaining owner: clipboard mutation and direct selection transforms still
  execute inside the clipboard strategy; caret movement still receives a repair
  callback; both need explicit classification or further extraction

Rejected tactics:

- do not move clipboard mutation horizontally without a red/green contract
- do not treat repair ownership as equivalent to mutation ownership
- do not bury shell-backed selection updates inside a worker when the event
  owner can apply the returned decision

Next action:

- classify the remaining Batch 4 authority inventory with executable rationale:
  which mutation/selection call sites are allowed worker execution, which must
  move to a central mutation/selection owner, and which need follow-up tests

Checkpoint:

- verdict: keep course
- harsh take: repair authority is now mostly in the right place, but mutation
  authority is still a mixed bag and the audit needs rationale, not just counts
- why: the repair count went down under RED/GREEN proof, browser cursor proof
  stayed cross-browser green, and the next risk is deciding which remaining
  mutation/selection sites are legitimate workers
- risks: moving clipboard mutations blindly can break paste/drop semantics
  across browsers; leaving them unclassified keeps the architecture claim
  weaker than the tests
- earliest gates: safety is the authority audit contract; progress is an
  executable classification table plus the richtext paste/drop/caret rows
- next move: upgrade the audit from raw counts to count-plus-rationale for the
  remaining mutation/selection/repair authority sites, then use it to pick the
  next extraction
- do-not-do list: do not chase another one-off cursor patch, do not expose
  command policy objects, and do not claim Batch 4 complete from green
  richtext rows alone

### 2026-04-24 Slice 10: Executable Authority Rationale

Actions:

- upgraded `kernel-authority-audit-contract.ts` from raw count snapshots to
  count-plus-rationale inventories
- attached an owner, rationale, and next classification to every audited
  event-frame, trace, selection bridge, selection transform, mutation, and
  repair call-site group
- classified remaining clipboard selection/mutation authority as `burn-down`
  instead of treating it as silently accepted
- classified central owners such as `Editable`, `MutationController`,
  `SelectionController`, `CaretEngine`, and `DOMRepairQueue` as explicit
  central owners or bridges

Commands:

- `bun test ./packages/slate-react/test/kernel-authority-audit-contract.ts --bail 1`
- `bun run lint:fix`
- `bun run lint`
- `bun test ./packages/slate-react/test/kernel-authority-audit-contract.ts ./packages/slate-react/test/editing-kernel-contract.ts ./packages/slate-react/test/selection-controller-contract.ts ./packages/slate-react/test/dom-repair-policy-contract.ts ./packages/slate-react/test/target-runtime-contract.tsx ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`

Artifacts:

- `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`

Evidence:

- authority audit passed with 3 tests and 12 assertions
- lint fix/check passed; Biome formatted the audit test file
- post-lint focused Batch 4 contract gate passed with 28 tests and 72
  assertions

Failed probes:

- none; this slice made the audit stricter without changing runtime behavior

Owner classification:

- current owner remains: Batch 4 Kernel Authority Audit
- completed sub-owner: executable rationale now travels with authority
  inventories
- remaining owner: all `burn-down` inventory entries need extraction,
  narrowing, or explicit acceptance before Batch 4 can close

Rejected tactics:

- do not keep authority counts without rationale
- do not treat `burn-down` entries as accepted debt
- do not move clipboard mutations before choosing a narrower red/green proof

Next action:

- use the executable rationale to pick the next burn-down owner:
  `input-router` repair/mutation callback is smaller and safer than clipboard
  mutation extraction, so remove or classify that router-owned authority next

Checkpoint:

- verdict: keep course
- harsh take: the audit is finally useful as architecture law, not just a
  snapshot, but the `burn-down` entries are still real debt
- why: every authority group now has an owner/rationale/next tag, focused
  contracts are green, and the next risky owner is visible instead of
  anecdotal
- risks: classifications can still rot if future edits update counts without
  challenging the rationale
- earliest gates: safety is the authority audit contract; progress is reducing
  one `burn-down` entry without changing browser behavior
- next move: inspect and reduce `input-router` mutation/repair authority before
  attempting the broader clipboard mutation move
- do-not-do list: do not jump straight into a clipboard rewrite, do not confuse
  rationale with acceptance, and do not close Batch 4 while `burn-down` entries
  remain

### 2026-04-24 Slice 11: Input Router Mutation Burn-Down

Actions:

- removed the direct `Editor.insertText` mutation from
  `useEditableReactBeforeInputHandler`
- routed React beforeinput fallback text through the existing
  `applyModelOwnedBeforeInputOperation` model-owned path in `Editable`
- kept DOM input repair routing in `input-router`, but reclassified it as an
  explicit bridge because the actual repair policy/execution is owned by the
  `Editable` callback and `DOMRepairQueue`
- updated the authority audit after `input-router` mutation count dropped from
  one to zero

Commands:

- `bun test ./packages/slate-react/test/kernel-authority-audit-contract.ts --bail 1`
- `bun test ./packages/slate-react/test/kernel-authority-audit-contract.ts ./packages/slate-react/test/editing-kernel-contract.ts ./packages/slate-react/test/selection-controller-contract.ts ./packages/slate-react/test/dom-repair-policy-contract.ts ./packages/slate-react/test/target-runtime-contract.tsx ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`
- `bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- `bun run lint:fix`
- `bun run lint`
- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "selection|caret|toolbar|bold|heading|arrow|backspace|delete|warm|generated" --workers=4 --retries=0`

Artifacts:

- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/src/editable/input-router.ts`
- `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`

Evidence:

- kernel-authority audit first failed red because the old expected
  `input-router` mutation count was one and the new count is zero
- combined Slate React focused contracts passed with 28 tests and 72
  assertions
- Slate DOM + Slate React typecheck passed with 4 successful tasks
- lint fix/check passed with no fixes applied
- richtext cross-browser cursor/selection gate passed with 124 tests across
  Chromium, Firefox, WebKit, and mobile

Failed probes:

- kernel-authority audit intentionally failed on the old input-router mutation
  inventory, proving the guard caught the authority reduction

Owner classification:

- current owner remains: Batch 4 Kernel Authority Audit
- completed sub-owner: input-router no longer performs model mutation
- remaining owner: `burn-down` entries are now concentrated in
  `clipboard-input-strategy`, `keyboard-input-strategy`, `model-input-strategy`,
  and `caret-engine`

Rejected tactics:

- do not leave React beforeinput fallback as a second mutation path
- do not remove DOM input repair routing just to make a count disappear; it is
  a bridge to the actual repair owner
- do not take on clipboard mutation extraction before choosing the smallest
  next burn-down owner

Next action:

- inspect `keyboard-input-strategy` and `model-input-strategy` remaining
  mutation/selection burn-down entries; pick the smaller extraction before
  tackling clipboard mutation

Checkpoint:

- verdict: keep course
- harsh take: the easy router debt is gone; the remaining debt is in real
  editing workers where careless extraction can break behavior
- why: model mutation now routes through the model-owned beforeinput path,
  focused contracts are green, and browser proof stayed cross-browser green
- risks: keyboard/model-input extraction can touch active cursor paths; clipboard
  extraction is broader and should wait
- earliest gates: safety is the authority audit contract plus focused Slate
  React contracts; progress is reducing one remaining `burn-down` count
- next move: inspect keyboard/model-input remaining call sites and burn down the
  smallest safe one
- do-not-do list: do not rewrite clipboard yet, do not remove repair routing for
  cosmetic counts, and do not stop while Batch 4 still has `burn-down` entries

### 2026-04-24 Slice 12: Keyboard Mutation And Selection Burn-Down

Actions:

- moved keyboard select-all selection execution through
  `applyEditableCommand({ kind: 'select-all' })`
- taught the mutation controller to execute `select-all` through its existing
  `Transforms.select` call path
- moved large-document printable key insertion through
  `applyEditableCommand({ kind: 'insert-text' })`
- removed the now-unused `Transforms` import from `keyboard-input-strategy`
- updated the authority audit after `keyboard-input-strategy` dropped out of
  the direct selection-transform and direct mutation inventories

Commands:

- `bun test ./packages/slate-react/test/kernel-authority-audit-contract.ts --bail 1`
- `bun test ./packages/slate-react/test/kernel-authority-audit-contract.ts ./packages/slate-react/test/editing-kernel-contract.ts ./packages/slate-react/test/selection-controller-contract.ts ./packages/slate-react/test/dom-repair-policy-contract.ts ./packages/slate-react/test/target-runtime-contract.tsx ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`
- `bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- `bun run lint:fix`
- `bun run lint`
- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "selection|caret|toolbar|bold|heading|arrow|backspace|delete|warm|generated" --workers=4 --retries=0`

Artifacts:

- `../slate-v2/packages/slate-react/src/editable/keyboard-input-strategy.ts`
- `../slate-v2/packages/slate-react/src/editable/mutation-controller.ts`
- `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`

Evidence:

- kernel-authority audit first failed red because keyboard no longer appeared
  in the direct selection-transform inventory
- combined Slate React focused contracts passed with 28 tests and 72
  assertions
- Slate DOM + Slate React typecheck passed with 4 successful tasks
- lint fix/check passed with no fixes applied
- richtext cross-browser cursor/selection gate passed with 124 tests across
  Chromium, Firefox, WebKit, and mobile

Failed probes:

- kernel-authority audit intentionally failed on the old keyboard selection
  inventory before the expected inventory was lowered

Owner classification:

- current owner remains: Batch 4 Kernel Authority Audit
- completed sub-owner: keyboard no longer owns audited direct model selection
  transforms or direct text insertion
- remaining owner: `applyEditableInput` still schedules repair directly;
  `model-input-strategy` still owns native DOM text reconciliation selection and
  text mutation; clipboard remains the broad mutation/selection owner

Rejected tactics:

- do not add a semantic keyboard API to hide direct mutation
- do not special-case select-all in the keyboard worker once the command
  executor can own it
- do not tackle clipboard mutation before the smaller input repair extraction

Next action:

- convert `applyEditableInput` to return repair requests to `Editable` instead
  of calling `requestRepair` directly, preserving native DOM text
  reconciliation behavior

Checkpoint:

- verdict: keep course
- harsh take: keyboard is no longer the structural leak; model-input repair is
  the next small leak before the bigger clipboard mutation problem
- why: keyboard direct audited mutation/selection counts are gone, focused
  contracts are green, and cross-browser cursor rows stayed green
- risks: input repair extraction touches DOM text reconciliation after native
  input, so it needs focused contracts and browser proof
- earliest gates: safety is the authority audit contract; progress is reducing
  `model-input-strategy` direct repair count
- next move: make `applyEditableInput` return repair intent and apply it in
  `Editable`
- do-not-do list: do not broaden the command API, do not patch cursor symptoms,
  and do not start clipboard mutation rewrite yet

### 2026-04-24 Slice 13: Model Input Repair Burn-Down

Actions:

- converted `applyEditableInput` to return `EditableInputResult` with repair
  requests instead of calling `requestRepair` directly
- moved application of input repair results to the `Editable` event owner
- preserved native DOM text reconciliation behavior for deferred operations,
  DOM/model text mismatch repair, and native history fallback
- updated the authority audit after `model-input-strategy` dropped out of the
  direct repair scheduling inventory

Commands:

- `bun test ./packages/slate-react/test/kernel-authority-audit-contract.ts --bail 1`
- `bun test ./packages/slate-react/test/kernel-authority-audit-contract.ts ./packages/slate-react/test/editing-kernel-contract.ts ./packages/slate-react/test/selection-controller-contract.ts ./packages/slate-react/test/dom-repair-policy-contract.ts ./packages/slate-react/test/target-runtime-contract.tsx ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`
- `bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- `bun run lint:fix`
- `bun run lint`
- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "selection|caret|toolbar|bold|heading|arrow|backspace|delete|warm|generated" --workers=4 --retries=0`

Artifacts:

- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/src/editable/model-input-strategy.ts`
- `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`

Evidence:

- kernel-authority audit first failed red because the old expected
  `model-input-strategy` repair count was three and the new count is zero
- combined Slate React focused contracts passed with 28 tests and 72
  assertions
- Slate DOM + Slate React typecheck passed with 4 successful tasks
- lint fix/check passed with no fixes applied
- richtext cross-browser cursor/selection gate passed with 124 tests across
  Chromium, Firefox, WebKit, and mobile

Failed probes:

- kernel-authority audit intentionally failed on the old model-input repair
  inventory, proving the guard caught the authority reduction

Owner classification:

- current owner remains: Batch 4 Kernel Authority Audit
- completed sub-owner: model-input strategy no longer schedules repair directly
- remaining owner: model-input still has direct selection and text insertion
  call sites during DOM text reconciliation; clipboard remains the broad
  mutation/selection owner; caret-engine owns movement repair callback

Rejected tactics:

- do not leave native input repair as a callback side effect
- do not change native DOM text reconciliation semantics while moving repair
  ownership
- do not touch clipboard mutation until the smaller model-input direct
  mutation/selection calls are burned down

Next action:

- route model-input direct `Transforms.select` and `Editor.insertText` calls
  through `applyEditableCommand` so mutation-controller owns those primitive
  operations

Checkpoint:

- verdict: keep course
- harsh take: model-input repair is cleaned up; model-input mutation is now the
  last small target before the ugly clipboard owner
- why: repair scheduling moved to `Editable`, focused contracts are green, and
  browser proof stayed green
- risks: model-input direct mutation replacement touches DOM text reconciliation
  and deferred native insert handling
- earliest gates: safety is the authority audit contract; progress is removing
  model-input direct mutation/selection entries
- next move: burn down model-input direct selection/text insertion through the
  command executor
- do-not-do list: do not skip browser proof for native input-adjacent edits, do
  not rewrite clipboard yet, and do not confuse repair ownership with mutation
  ownership

### 2026-04-24 Slice 14: Model Input Mutation And Selection Burn-Down

Actions:

- routed DOM text reconciliation selection through
  `applyEditableCommand({ kind: 'select' })`
- routed DOM text reconciliation text insertion through
  `applyEditableCommand({ kind: 'insert-text' })`
- routed deferred native insert operations through the same command executor
- removed the now-unused direct `Transforms` import from
  `model-input-strategy`
- updated the authority audit after `model-input-strategy` dropped out of the
  direct selection-transform and direct mutation inventories

Commands:

- `bun test ./packages/slate-react/test/kernel-authority-audit-contract.ts --bail 1`
- `bun test ./packages/slate-react/test/kernel-authority-audit-contract.ts ./packages/slate-react/test/editing-kernel-contract.ts ./packages/slate-react/test/selection-controller-contract.ts ./packages/slate-react/test/dom-repair-policy-contract.ts ./packages/slate-react/test/target-runtime-contract.tsx ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`
- `bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- `bun run lint:fix`
- `bun run lint`
- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "selection|caret|toolbar|bold|heading|arrow|backspace|delete|warm|generated" --workers=4 --retries=0`

Artifacts:

- `../slate-v2/packages/slate-react/src/editable/model-input-strategy.ts`
- `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`

Evidence:

- kernel-authority audit first failed red because the old expected
  `model-input-strategy` selection-transform count was one and the new count is
  zero
- combined Slate React focused contracts passed with 28 tests and 72
  assertions
- Slate DOM + Slate React typecheck passed with 4 successful tasks
- lint fix/check passed with no fixes applied
- richtext cross-browser cursor/selection gate passed with 124 tests across
  Chromium, Firefox, WebKit, and mobile

Failed probes:

- kernel-authority audit intentionally failed on the old model-input selection
  inventory before the expected inventory was lowered

Owner classification:

- current owner remains: Batch 4 Kernel Authority Audit
- completed sub-owner: model-input no longer owns audited direct model
  selection transforms, direct text insertion, or direct repair scheduling
- remaining owner: caret-engine still owns a repair callback; clipboard remains
  the broad mutation/selection owner

Rejected tactics:

- do not bypass the mutation controller for DOM reconciliation primitives
- do not change native DOM reconciliation semantics while moving authority
- do not start clipboard mutation extraction before removing the caret repair
  callback debt

Next action:

- convert `applyEditableCaretMovement` to return repair intent instead of
  calling `requestRepair`, then let keyboard apply that repair through its
  existing result path

Checkpoint:

- verdict: keep course
- harsh take: the small strategy leaks are nearly gone; caret repair is the last
  cheap one before clipboard becomes unavoidable
- why: model-input direct mutation/selection/repair counts are gone, contracts
  are green, and cross-browser cursor rows stayed green
- risks: caret movement touches the exact cursor bug family, so it needs
  focused movement/browser proof
- earliest gates: safety is authority audit plus focused Slate React contracts;
  progress is removing caret-engine repair callback authority
- next move: return repair intent from caret movement and apply it in keyboard
- do-not-do list: do not touch clipboard yet, do not weaken movement tests, and
  do not treat command routing as user-facing API bloat

### 2026-04-24 Slice 15: Caret Repair Callback Burn-Down

Actions:

- converted `applyEditableCaretMovement` from boolean-plus-callback behavior to
  `EditableCaretMovementResult`
- made caret movement return `sync-selection` repair intent instead of calling
  `requestRepair`
- removed the repair callback from the keyboard-to-caret path
- kept caret movement selection transforms in `CaretEngine`; those are
  classified as central movement authority, not worker leakage
- updated the authority audit after `caret-engine` dropped out of the direct
  repair scheduling inventory

Commands:

- `bun test ./packages/slate-react/test/kernel-authority-audit-contract.ts ./packages/slate-react/test/editing-kernel-contract.ts ./packages/slate-react/test/selection-controller-contract.ts ./packages/slate-react/test/dom-repair-policy-contract.ts ./packages/slate-react/test/target-runtime-contract.tsx ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`
- `bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- `bun run lint:fix`
- `bun run lint`
- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "selection|caret|toolbar|bold|heading|arrow|backspace|delete|warm|generated" --workers=4 --retries=0`
- `rg -n "next: 'burn-down'" packages/slate-react/test/kernel-authority-audit-contract.ts`

Artifacts:

- `../slate-v2/packages/slate-react/src/editable/caret-engine.ts`
- `../slate-v2/packages/slate-react/src/editable/keyboard-input-strategy.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`

Evidence:

- combined Slate React focused contracts passed with 28 tests and 72
  assertions
- Slate DOM + Slate React typecheck passed with 4 successful tasks
- lint fix/check passed with no fixes applied
- richtext cross-browser cursor/selection gate passed with 124 tests across
  Chromium, Firefox, WebKit, and mobile
- remaining audit `burn-down` entries are concentrated in clipboard selection
  and clipboard mutation inventory

Failed probes:

- none; the focused audit passed after removing the stale caret repair entry

Owner classification:

- current owner remains: Batch 4 Kernel Authority Audit
- completed sub-owner: caret movement no longer schedules repair directly
- remaining owner: clipboard still owns direct selection transforms and direct
  model mutations for cut/drop/paste

Rejected tactics:

- do not remove caret-engine selection transforms; movement is its central
  authority
- do not keep repair callbacks in worker paths when result objects already
  exist
- do not close Batch 4 while clipboard remains the only unclassified
  `burn-down` owner

Next action:

- reduce clipboard direct mutation/selection authority by routing obvious
  `select` and `insert-data` operations through `applyEditableCommand`, then
  decide whether the remaining cut/drop structural edits are legitimate
  clipboard-worker ownership or need a mutation-controller command

Checkpoint:

- verdict: keep course
- harsh take: the only remaining Batch 4 `burn-down` owner is clipboard; there
  is nowhere else to hide now
- why: keyboard, router, model-input, and caret repair/mutation leaks are gone;
  cross-browser cursor proof stayed green
- risks: clipboard structural edits are more behavior-sensitive than the small
  callback extractions
- earliest gates: safety is the authority audit contract; progress is reducing
  clipboard direct `select`/`insert-data` calls without changing paste/drop
  rows
- next move: route clipboard obvious select/insert-data primitives through the
  mutation controller and re-evaluate remaining structural cut/drop edits
- do-not-do list: do not call clipboard accepted before reducing obvious
  command-executor candidates, and do not make command APIs public to solve an
  internal authority problem

### 2026-04-24 Slice 16: Clipboard Authority Classification

Actions:

- routed clipboard `select` operations through
  `applyEditableCommand({ kind: 'select' })`
- routed clipboard `insert-data` operations through
  `applyEditableCommand({ kind: 'insert-data' })`
- routed cut `delete-fragment` through `applyEditableCommand`
- reduced `clipboard-input-strategy` audited direct mutation count from seven
  to three
- removed `clipboard-input-strategy` from the direct selection-transform
  inventory
- classified the remaining three direct clipboard mutations as
  clipboard-worker structural cleanup after event ownership, selection import,
  repair scheduling, and trace emission are owned by `Editable`
- verified there are no runtime `next: 'burn-down'` entries left in the
  authority audit

Commands:

- `bun test ./packages/slate-react/test/kernel-authority-audit-contract.ts --bail 1`
- `bun test ./packages/slate-react/test/kernel-authority-audit-contract.ts ./packages/slate-react/test/editing-kernel-contract.ts ./packages/slate-react/test/selection-controller-contract.ts ./packages/slate-react/test/dom-repair-policy-contract.ts ./packages/slate-react/test/target-runtime-contract.tsx ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`
- `bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- `rg -n "next: 'burn-down'" packages/slate-react/test/kernel-authority-audit-contract.ts`
- `bun run lint:fix`
- `bun run lint`
- post-lint `bun test ./packages/slate-react/test/kernel-authority-audit-contract.ts ./packages/slate-react/test/editing-kernel-contract.ts ./packages/slate-react/test/selection-controller-contract.ts ./packages/slate-react/test/dom-repair-policy-contract.ts ./packages/slate-react/test/target-runtime-contract.tsx ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`
- post-lint `bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "selection|caret|toolbar|bold|heading|arrow|backspace|delete|warm|generated" --workers=4 --retries=0`

Artifacts:

- `../slate-v2/packages/slate-react/src/editable/clipboard-input-strategy.ts`
- `../slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`

Evidence:

- kernel-authority audit first failed red when clipboard direct selection count
  dropped from four to zero
- kernel-authority audit then failed red when clipboard direct mutation count
  dropped from seven to four, then three after routing `delete-fragment`
  through the command executor
- focused Slate React contracts passed with 28 tests and 72 assertions
- Slate DOM + Slate React typecheck passed with 4 successful tasks
- `rg -n "next: 'burn-down'" ...` returned only the audit union type, no
  runtime authority entries
- lint fix/check passed; Biome formatted one file
- post-lint focused contracts passed with 28 tests and 72 assertions
- post-lint Slate DOM + Slate React typecheck passed with 4 successful tasks
- richtext cross-browser cursor/selection gate passed with 124 tests across
  Chromium, Firefox, WebKit, and mobile

Failed probes:

- kernel-authority audit intentionally failed on old clipboard selection and
  mutation inventory counts before expected inventories were lowered

Owner classification:

- completed owner: Batch 4 Kernel Authority Audit
- current owner moves to: Batch 5 Generated Gauntlet Release Gates
- remaining owner: generated gauntlet breadth/replay/shrink/release-blocking
  proof must be audited against current cursor claims

Rejected tactics:

- do not invent public command APIs for internal clipboard structural cleanup
- do not pretend remaining clipboard structural cleanup is mutation-controller
  owned; it is explicitly classified as clipboard-worker execution under the
  event/kernel owner
- do not call browser rows alone proof of Batch 4; the authority audit is the
  durable proof

Next action:

- start Batch 5 by auditing generated gauntlet infrastructure and release gate
  coverage against current cursor/caret claims, then add the smallest missing
  replay/shrink or command-family guard

Checkpoint:

- verdict: keep course
- harsh take: Batch 4 is finally real architecture work, not cursor whack-a-mole
- why: every remaining authority site has owner/rationale/next classification,
  runtime burn-down entries are gone, and cross-browser cursor proof stayed
  green
- risks: generated gauntlets may still be too narrow or too easy to bypass for
  future cursor claims
- earliest gates: safety is existing slate-browser core tests; progress is a
  generated gauntlet audit/contract that proves replay and shrink coverage are
  release-blocking
- next move: audit generated gauntlet infrastructure and add the smallest
  missing release-gate proof
- do-not-do list: do not stop at Batch 4, do not set completion-check done, and
  do not move to perf before Batch 5 coverage is made release-grade

### 2026-04-24 Slice 17: Generated Scenario Replay Artifact

Actions:

- added a replay artifact to generated Slate browser scenario results
- serialized replayable scenario steps with kind, label, warm-loop metadata, and
  non-function action payloads
- marked custom/function-backed steps as non-replayable instead of serializing
  functions into trace artifacts
- made the generated navigation typing gauntlet assert replayability and exact
  replay step labels/action payloads as part of the release gate

Commands:

- `bun run --cwd packages/slate-browser test:core --bail 1`
- `bunx turbo typecheck --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- `bun run lint:fix`
- `bun run lint`
- post-lint `bun run --cwd packages/slate-browser test:core --bail 1`
- post-lint `bunx turbo typecheck --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "selection|caret|toolbar|bold|heading|arrow|backspace|delete|warm|generated" --workers=4 --retries=0`

Artifacts:

- `../slate-v2/packages/slate-browser/src/playwright/index.ts`
- `../slate-v2/packages/slate-browser/test/core/scenario.test.ts`
- `../slate-v2/playwright/integration/examples/richtext.test.ts`

Evidence:

- slate-browser core tests passed with 17 tests and 27 assertions
- Slate Browser + Slate DOM + Slate React typecheck passed with 6 successful
  tasks
- lint fix/check passed; Biome formatted two files
- post-lint slate-browser core tests passed with 17 tests and 27 assertions
- post-lint Slate Browser + Slate DOM + Slate React typecheck passed with 6
  successful tasks
- richtext cross-browser generated/caret/cursor gate passed with 124 tests
  across Chromium, Firefox, WebKit, and mobile

Failed probes:

- none; the replay artifact was additive and all focused gates stayed green

Owner classification:

- current owner remains: Batch 5 Generated Gauntlet Release Gates
- completed sub-owner: top-level generated scenario results now carry replayable
  artifacts
- remaining owner: reduction/shrink candidates still carry labels only, so a
  minimized flaky cursor failure is not yet fully replayable

Rejected tactics:

- do not rely on trace-only artifacts for release debugging
- do not serialize functions into scenario artifacts
- do not claim shrink/replay closure while reduction candidates only expose
  `stepLabels`

Next action:

- extend reduction candidate summaries with replay artifacts, add core tests for
  replayable and non-replayable shrink candidates, then assert warm toolbar
  iteration candidates expose replayable payloads in the browser release gate

Checkpoint:

- verdict: keep course
- harsh take: replay without shrink replay is half a debugging story; it helps
  known failures but not flaky minimization
- why: generated top-level replay is green cross-browser, but current reduction
  summaries still force humans to reconstruct minimized scenarios from labels
- risks: adding replay payloads to every reduction candidate can bloat trace
  files, but cursor flakes need replay-first artifacts more than tiny JSON
- earliest gates: slate-browser core tests for replay summaries, then the
  existing richtext cross-browser generated/warm gate
- next move: add replay artifacts to reduction candidate summaries
- do-not-do list: do not widen to new behavior families yet, do not treat custom
  steps as replayable, and do not close Batch 5 before shrink artifacts are
  release-grade

### 2026-04-24 Slice 18: Replayable Shrink Candidate Artifacts

Actions:

- added replay artifacts to generated scenario reduction candidate summaries
- kept custom/function-backed steps non-replayable with function bodies stripped
  from artifacts
- replaced the warm toolbar gauntlet's opaque custom steps with typed scenario
  actions for root mousedown, toolbar button clicks, settle waits, and selected
  text assertions
- made the warm toolbar cross-browser release row assert top-level replayability
  and replayable iteration-level shrink candidate payloads

Commands:

- red `bun run --cwd packages/slate-browser test:core --bail 1`
- green `bun run --cwd packages/slate-browser test:core --bail 1`
- red `bun run --cwd packages/slate-browser test:core --bail 1` for warm
  toolbar replayability
- green `bun run --cwd packages/slate-browser test:core --bail 1`
- `bunx turbo typecheck --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- `bun run lint:fix`
- `bun run lint`
- post-lint `bun run --cwd packages/slate-browser test:core --bail 1`
- post-lint `bunx turbo typecheck --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "selection|caret|toolbar|bold|heading|arrow|backspace|delete|warm|generated" --workers=4 --retries=0`

Artifacts:

- `../slate-v2/packages/slate-browser/src/playwright/index.ts`
- `../slate-v2/packages/slate-browser/test/core/scenario.test.ts`
- `../slate-v2/playwright/integration/examples/richtext.test.ts`

Evidence:

- core test failed red when reduction summaries did not include `replay`
- core test passed after reduction summaries reused `createScenarioReplay`
- core test failed red when warm toolbar gauntlet still used custom function
  steps and `replay.replayable` was false
- core test passed after warm toolbar custom steps became typed replayable
  scenario actions
- slate-browser core tests passed with 18 tests and 29 assertions
- Slate Browser + Slate DOM + Slate React typecheck passed with 6 successful
  tasks
- lint fix/check passed; Biome formatted one file
- post-lint slate-browser core tests passed with 18 tests and 29 assertions
- post-lint Slate Browser + Slate DOM + Slate React typecheck passed with 6
  successful tasks
- richtext cross-browser generated/caret/cursor gate passed with 124 tests
  across Chromium, Firefox, WebKit, and mobile

Failed probes:

- intentional RED failures captured the missing reduction replay payload and
  the non-replayable warm toolbar custom-step path before the fixes

Owner classification:

- current owner remains: Batch 5 Generated Gauntlet Release Gates
- completed sub-owner: generated scenario top-level results and warm-loop
  reduction candidates now expose replayable artifacts
- remaining owner: command-family breadth and replay/shrink release gating must
  still be audited beyond the current richtext warm/navigation rows

Rejected tactics:

- do not keep generated cursor gauntlets dependent on opaque `custom` callbacks
  when a typed action can express the same user-path step
- do not serialize functions into replay artifacts
- do not call Batch 5 complete from one replayable warm-row family

Next action:

- audit generated gauntlet command-family coverage against the Batch 5 release
  claim and add the next missing replayable row or contract for an unproved
  family instead of expanding the harness blindly

Checkpoint:

- verdict: keep course
- harsh take: this fixed the artifact problem for the hottest warm cursor row,
  but Batch 5 still needs breadth proof, not just better JSON
- why: replay and shrink candidates are now real for the warm toolbar row and
  stayed green cross-browser; the remaining risk is unproved generated-family
  breadth
- risks: command families with paste/composition/drop/shadow may still include
  custom steps or narrower semantic handles that make failure reproduction
  weaker than the release claim
- earliest gates: a generated-family coverage audit over scenario helpers and
  richtext release rows, followed by focused replayable-row additions where the
  audit finds gaps
- next move: inventory generated gauntlet helpers/rows and classify which are
  replayable, shrinking, command-family covering, and release-blocking
- do-not-do list: do not jump to mobile/native deep proof yet, do not run full
  integration as a substitute for the coverage audit, and do not revive
  one-off example rows as the primary proof

### 2026-04-24 Slice 19: Generated Command-Family Replayability

Actions:

- audited generated scenario helpers and richtext release rows for custom
  callback usage and replay assertions
- added a core contract that generated command-family helper outputs are
  replayable
- added typed scenario actions for internal-control fill, IME composition,
  shell activation, toolbar test-id clicks, root mousedown, settle waits, and
  selected-text assertions
- converted generated helper families away from opaque `custom` callbacks where
  a typed action exists
- added richtext release-row replay assertions for mixed editing, mobile
  semantic editing, mark typing, mark-click typing, and toolbar mark-click
  generated rows

Commands:

- red `bun run --cwd packages/slate-browser test:core --bail 1`
- green `bun run --cwd packages/slate-browser test:core --bail 1`
- `bunx turbo typecheck --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- `bun run lint:fix`
- `bun run lint`
- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "selection|caret|toolbar|bold|heading|arrow|backspace|delete|warm|generated" --workers=4 --retries=0`
- `rg -n "kind: 'custom'|kind: \"custom\"" packages/slate-browser/src/playwright/index.ts playwright/integration/examples/richtext.test.ts packages/slate-browser/test/core/scenario.test.ts`
- `rg -n "createSlateBrowser.*Gauntlet|replay\\.replayable|reductionCandidates" playwright/integration/examples/richtext.test.ts packages/slate-browser/test/core/scenario.test.ts`

Artifacts:

- `../slate-v2/packages/slate-browser/src/playwright/index.ts`
- `../slate-v2/packages/slate-browser/test/core/scenario.test.ts`
- `../slate-v2/playwright/integration/examples/richtext.test.ts`

Evidence:

- core test failed red while generated command-family helpers still produced
  non-replayable custom steps
- slate-browser core tests passed with 19 tests and 35 assertions after typed
  scenario actions replaced helper-level custom callbacks
- Slate Browser + Slate DOM + Slate React typecheck passed with 6 successful
  tasks
- lint fix/check passed with no fixes applied
- richtext cross-browser generated/caret/cursor gate passed with 124 tests
  across Chromium, Firefox, WebKit, and mobile
- `rg` shows generated helper code no longer emits `custom`; remaining custom
  usage is the explicit custom step type, core tests that prove non-replayable
  custom handling, and hand-authored one-off richtext scenarios

Failed probes:

- intentional RED failure proved the generated helper replayability contract
  was missing before the typed action conversion

Owner classification:

- current owner remains: Batch 5 Generated Gauntlet Release Gates
- completed sub-owner: generated helper families used for command/caret rows
  now produce replayable steps and release rows assert replayability
- remaining owner: hand-authored one-off scenarios still use custom callbacks;
  they need classification as either non-release diagnostics or conversion into
  generated replayable helpers if they carry cursor release claims

Rejected tactics:

- do not mark opaque callback steps replayable
- do not delete the custom step escape hatch; it is still useful for diagnostics
  and for proving non-replayable artifacts are labeled honestly
- do not leave generated release helpers depending on custom callbacks

Next action:

- classify the remaining hand-authored richtext `custom` scenario rows and
  convert any cursor/caret release-claim row into typed replayable actions or a
  generated helper

Checkpoint:

- verdict: keep course
- harsh take: generated helpers are no longer the weak link; hand-authored
  diagnostic rows are now the likely source of hidden non-replayable cursor
  proof
- why: generated helper families are replayable and cross-browser green, but
  one-off scenarios still contain custom callbacks around navigation, command
  metadata, and repair trace probes
- risks: converting every diagnostic custom row can overfit the harness; the
  right move is to convert only rows that support release cursor claims
- earliest gates: `rg` custom inventory plus targeted richtext replay
  assertions on converted rows
- next move: classify remaining custom richtext scenario rows by release claim
  vs diagnostic-only and convert the release-claim rows first
- do-not-do list: do not waste time converting test-only custom fixtures, do not
  remove diagnostic custom support, and do not claim Batch 5 complete until the
  release-claim custom rows are addressed or explicitly deferred

### 2026-04-24 Slice 20: Native Word Toolbar Replayability

Actions:

- added a replayability assertion to the native word selection toolbar
  mark-click cursor row
- confirmed the row failed red because it still used custom callback steps
- added a typed `assertLastCommit` scenario action
- replaced the row's toolbar-click and commit-assert custom callbacks with
  typed replayable steps

Commands:

- red `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "native word selection toolbar mark" --workers=1 --retries=0`
- green `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "native word selection toolbar mark" --workers=1 --retries=0`
- `bun run --cwd packages/slate-browser test:core --bail 1`
- `bunx turbo typecheck --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- `bun run lint:fix`
- `bun run lint`
- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "selection|caret|toolbar|bold|heading|arrow|backspace|delete|warm|generated" --workers=4 --retries=0`
- `rg -n "kind: 'custom'|kind: \"custom\"" playwright/integration/examples/richtext.test.ts packages/slate-browser/src/playwright/index.ts packages/slate-browser/test/core/scenario.test.ts`

Artifacts:

- `../slate-v2/packages/slate-browser/src/playwright/index.ts`
- `../slate-v2/playwright/integration/examples/richtext.test.ts`

Evidence:

- targeted Chromium row failed red with `result.replay.replayable` false
- targeted Chromium row passed after converting the row to typed replayable
  scenario steps
- slate-browser core tests passed with 19 tests and 35 assertions
- Slate Browser + Slate DOM + Slate React typecheck passed with 6 successful
  tasks
- lint fix/check passed with no fixes applied
- richtext cross-browser generated/caret/cursor gate passed with 124 tests
  across Chromium, Firefox, WebKit, and mobile
- remaining richtext custom rows are navigation-mutation and diagnostic command
  metadata / selectionchange / repair scenarios, not the native word toolbar
  cursor row

Failed probes:

- intentional RED failure proved the native word toolbar cursor row was still a
  non-replayable release-claim proof before conversion

Owner classification:

- current owner remains: Batch 5 Generated Gauntlet Release Gates
- completed sub-owner: native word selection toolbar mark-click cursor proof is
  replayable
- remaining owner: navigation-mutation one-off row still carries cursor
  release-claim behavior through custom callbacks; diagnostic metadata/repair
  custom rows need either conversion or explicit diagnostic-only classification

Rejected tactics:

- do not leave cursor release rows as custom callback blobs
- do not convert every diagnostic row before cursor claim rows
- do not hide non-replayable behavior behind a passing model/DOM assertion

Next action:

- convert or split the navigation-mutation one-off cursor scenario into typed
  replayable scenario actions; then classify remaining metadata/repair custom
  rows as diagnostic or convert them if they gate release claims

Checkpoint:

- verdict: keep course
- harsh take: every cursor release row left as a callback blob is a future
  “works on CI, impossible to replay locally” bug report
- why: the native word toolbar row now fails red on replay debt and passes after
  typed action conversion; the same standard should apply to the remaining
  navigation/mutation cursor gauntlet
- risks: the navigation-mutation row has compound custom steps; splitting it
  may reveal real timing assumptions currently hidden in one callback
- earliest gates: targeted Chromium replayability RED/GREEN for the row, then
  slate-browser core/type/lint and the richtext cross-browser gate
- next move: make the navigation-mutation cursor scenario replayable or split
  it into generated typed steps
- do-not-do list: do not convert diagnostics first, do not delete the row to
  make replay debt disappear, and do not call Batch 5 complete while that row is
  non-replayable

### 2026-04-24 Slice 21: Navigation Mutation Replayability

Actions:

- added a replayability assertion to the navigation/mutation cursor gauntlet
- confirmed it failed red while the row was three opaque custom callback blobs
- split navigation, typing, delete, caret, and model assertions into typed
  scenario actions
- added typed `rootClick`, `assertSelectionLocation`, `assertModelText`, and
  native undo support
- discovered that native browser undo cannot tolerate trace snapshots between
  the typed character and the undo hotkey in this row
- replaced the undo tail with typed atomic `typeThenUndo`, preserving the old
  timing discipline while keeping the artifact replayable

Commands:

- red `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "navigation and mutation chained" --workers=1 --retries=0`
- failed intermediate `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "navigation and mutation chained" --workers=1 --retries=0` after splitting undo into separate steps; native undo no longer fired after trace snapshots
- green `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "navigation and mutation chained" --workers=1 --retries=0`
- `bun run --cwd packages/slate-browser test:core --bail 1`
- `bunx turbo typecheck --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- failed `bun run lint:fix` on duplicate inline Mac regex
- `bun run lint:fix`
- `bun run lint`
- post-lint `bun run --cwd packages/slate-browser test:core --bail 1`
- post-lint `bunx turbo typecheck --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "selection|caret|toolbar|bold|heading|arrow|backspace|delete|warm|generated" --workers=4 --retries=0`
- `rg -n "kind: 'custom'|kind: \"custom\"" playwright/integration/examples/richtext.test.ts packages/slate-browser/src/playwright/index.ts packages/slate-browser/test/core/scenario.test.ts`

Artifacts:

- `../slate-v2/packages/slate-browser/src/playwright/index.ts`
- `../slate-v2/playwright/integration/examples/richtext.test.ts`

Evidence:

- targeted Chromium row failed red while non-replayable
- targeted Chromium row failed again when trace snapshots split native undo
  from the typed edit; this proved the old callback was hiding a browser undo
  timing constraint
- targeted Chromium row passed after `typeThenUndo` made the timing constraint
  explicit and replayable
- slate-browser core tests passed with 19 tests and 35 assertions
- Slate Browser + Slate DOM + Slate React typecheck passed with 6 successful
  tasks
- lint fix/check passed after replacing inline Mac regex checks with
  `navigator.userAgent.includes('Mac OS X')`
- post-lint slate-browser core tests passed with 19 tests and 35 assertions
- post-lint Slate Browser + Slate DOM + Slate React typecheck passed with 6
  successful tasks
- richtext cross-browser generated/caret/cursor gate passed with 124 tests
  across Chromium, Firefox, WebKit, and mobile
- remaining richtext custom rows are diagnostic command metadata and
  selectionchange/repair probes

Failed probes:

- splitting native undo into separate typed `type`, `assert`, `undo`, and
  follow-up assert steps failed because the scenario trace snapshot changed the
  browser undo timing
- lint failed on inline regex literals inside `page.evaluate`

Owner classification:

- current owner remains: Batch 5 Generated Gauntlet Release Gates
- completed sub-owner: navigation/mutation cursor gauntlet is replayable and
  records the native undo timing constraint as typed harness law
- remaining owner: diagnostic custom rows need explicit classification; if they
  remain diagnostic-only, Batch 5 can move from replayability to breadth/release
  gate closure

Rejected tactics:

- do not split native undo across trace snapshots when the browser undo stack is
  the behavior under proof
- do not revert to `custom`; use typed atomic steps when browser timing demands
  an atomic replay unit
- do not treat diagnostic custom rows as release cursor proof without
  converting them

Next action:

- classify the remaining command-metadata and selectionchange/repair custom
  rows as diagnostic-only or convert them if their assertions are part of the
  release cursor claim; then update Batch 5 status toward completion/defer

Checkpoint:

- verdict: keep course
- harsh take: the harness was not just missing replay; it was hiding timing
  constraints in callback blobs
- why: the native undo split failed until the harness encoded the timing as a
  typed atomic action; that is the right architecture for hostile browser
  editing tests
- risks: overusing atomic typed steps can reduce shrink granularity, so they
  should be reserved for browser-timing units that cannot survive per-step
  trace snapshots
- earliest gates: custom inventory classification plus targeted conversion or
  explicit diagnostic-only deferral for the remaining four richtext custom rows
- next move: classify the remaining diagnostic custom rows and decide whether
  Batch 5 can close with explicit diagnostic-only exceptions
- do-not-do list: do not convert custom test fixtures, do not weaken the
  replayability assertions, and do not pretend semantic mobile rows are raw
  native mobile proof

### 2026-04-24 Slice 22: Diagnostic Replayability And Handle-Wait Stability

Actions:

- added typed diagnostic scenario actions for command metadata and
  selectionchange/repair assertions
- converted the remaining richtext diagnostic command-metadata and
  selectionchange/repair rows from `custom` callbacks to typed replayable steps
- confirmed richtext no longer contains `custom` scenario rows; the remaining
  `custom` hits are the custom step type and core tests that prove custom steps
  are honestly non-replayable
- caught a full-gate Chromium flake where the harness accepted a temporarily
  missing browser handle as a successful model-selection wait
- fixed `waitForHandleSelection` so a missing handle is not success; the harness
  now keeps waiting or fails instead of proceeding with fake model selection

Commands:

- red `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "records core command metadata|records selectionchange and repair" --workers=1 --retries=0`
- green `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "records core command metadata|records selectionchange and repair" --workers=1 --retries=0`
- `rg -n "kind: 'custom'|kind: \"custom\"" packages/slate-browser/src/playwright/index.ts playwright/integration/examples/richtext.test.ts packages/slate-browser/test/core/scenario.test.ts`
- failed `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "selection|caret|toolbar|bold|heading|arrow|backspace|delete|warm|generated" --workers=4 --retries=0`
- green targeted rerun before the harness fix: `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "generated navigation and typing|generated mixed editing|Backspace at selected text end" --workers=1 --retries=0`
- green targeted pressure rerun before the harness fix: `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "generated navigation and typing|generated mixed editing|Backspace at selected text end" --workers=4 --retries=0`
- green targeted pressure rerun after the harness fix: `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "generated navigation and typing|generated mixed editing|Backspace at selected text end" --workers=4 --retries=0`
- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "selection|caret|toolbar|bold|heading|arrow|backspace|delete|warm|generated" --workers=4 --retries=0`
- `bun run --cwd packages/slate-browser test:core --bail 1`
- `bunx turbo build --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- `bunx turbo typecheck --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- `bun run lint:fix`
- `bun run lint`

Artifacts:

- `../slate-v2/packages/slate-browser/src/playwright/index.ts`
- `../slate-v2/playwright/integration/examples/richtext.test.ts`

Evidence:

- diagnostic rows failed red on replayability before typed-step conversion and
  passed after conversion
- `rg` custom inventory now returns only:
  - `packages/slate-browser/src/playwright/index.ts` custom step type
  - `packages/slate-browser/test/core/scenario.test.ts` non-replayable custom
    fixtures
  - no `playwright/integration/examples/richtext.test.ts` custom rows
- full richtext cross-browser gate first failed with two Chromium generated
  rows receiving `null` model selection after select and one Chromium
  Backspace row timing out waiting for a DOM range
- the same three Chromium rows passed targeted with one worker and under
  targeted worker pressure, proving the product behavior was not the immediate
  owner
- harness audit found `waitForHandleSelection` treated a missing handle as
  success; that was a false wait success under full-gate load
- after fixing the missing-handle wait, the targeted pressure rerun passed
- final richtext cross-browser generated/caret/cursor gate passed with 124
  tests across Chromium, Firefox, WebKit, and mobile
- slate-browser core tests passed with 19 tests and 35 assertions
- Slate Browser + Slate DOM + Slate React build passed with 3 successful tasks
- Slate Browser + Slate DOM + Slate React typecheck passed with 6 successful
  tasks
- lint fix/check passed with no fixes applied

Failed probes:

- full richtext gate failed before the handle-wait fix with two generated
  Chromium `null` selection failures and one Backspace DOM-range timeout
- the failure was not accepted as flake debt; it identified a harness wait
  correctness bug

Owner classification:

- completed owner: Batch 5 Generated Gauntlet Release Gates
- generated cursor/caret release rows are replayable, shrink summaries carry
  replay artifacts, and the cross-browser release gate is green
- remaining owner moves to: Batch 6 Native Mobile And IME Transport
- remaining risk: semantic mobile proof is still not raw native mobile keyboard,
  clipboard, or IME proof

Rejected tactics:

- do not mark missing browser handles as successful waits
- do not accept the full-gate failure as generic local flake
- do not keep richtext release rows as opaque callbacks
- do not count semantic mobile rows as raw native mobile proof

Next action:

- start Batch 6 by classifying current mobile/IME proof into semantic handle,
  Playwright mobile viewport, Android Chrome native keyboard, iOS Safari native
  keyboard, native clipboard, and native IME/composition claim classes; then
  add or hard-scope the smallest missing release claim row

Checkpoint:

- verdict: keep course
- harsh take: Batch 5 was not done until the harness stopped lying about handle
  readiness; replayable artifacts are worthless if the wait layer can fake a
  model selection
- why: the gate now fails on real behavior instead of transient handle absence,
  richtext release rows no longer hide callback blobs, and the full
  cross-browser gate is green
- risks: Batch 6 may expose automation limits rather than product bugs; those
  must become explicit release-claim boundaries, not skips
- earliest gates: mobile/IME claim inventory plus the smallest focused native
  transport proof or explicit unsupported/deferred classification
- next move: classify native mobile/IME transport claim width and add the first
  missing Batch 6 proof/defer entry
- do-not-do list: do not fake native mobile with semantic handles, do not reopen
  Batch 5 unless a generated gate regresses, and do not move to perf before
  mobile/IME scope is honest

### 2026-04-24 Slice 23: Transport Claim Hygiene

Actions:

- added transport-claim classification to generated scenario metadata
- classified Playwright mobile proof separately from raw native mobile proof
- classified semantic handles separately from native keyboard/clipboard/IME
  proof
- asserted transport claims in richtext, paste/drop, and large-document
  composition generated rows
- fixed the claim classifier so mobile synthetic `DataTransfer` drop rows stay
  synthetic-datatransfer proof instead of being upgraded to generic mobile
  viewport proof
- corrected the navigation/mutation text-path assertions from element path
  `[0]` to text path `[0, 0]`

Commands:

- `bun run --cwd packages/slate-browser test:core --bail 1`
- failed prebuild targeted Playwright probe where scenario metadata still lacked
  the built `claim` field
- `bunx turbo build --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=mobile --grep "generated navigation and typing|generated mixed editing|mobile semantic editing|generated mark typing|navigation and mutation chained" --workers=2 --retries=0`
- failed `bunx playwright test ./playwright/integration/examples/paste-html.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "generated clipboard paste|generated drop data" --workers=4 --retries=0`
- `bunx playwright test ./playwright/integration/examples/paste-html.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "generated clipboard paste|generated drop data" --workers=4 --retries=0`
- `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "generated composition" --workers=4 --retries=0`
- `bunx turbo typecheck --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- `bun run lint:fix`
- `bun run lint`
- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "selection|caret|toolbar|bold|heading|arrow|backspace|delete|warm|generated" --workers=4 --retries=0`
- inventory probe `rg -n "appium|android|ios|safari|mobile native|native mobile|real device|imeSetComposition|composition|clipboard|native-keyboard|native.*mobile" packages playwright docs config site scripts --glob '!**/dist/**' --glob '!**/node_modules/**'`
- failed inventory probe including nonexistent `src` path

Artifacts:

- `../slate-v2/packages/slate-browser/src/playwright/index.ts`
- `../slate-v2/packages/slate-browser/test/core/scenario.test.ts`
- `../slate-v2/playwright/integration/examples/richtext.test.ts`
- `../slate-v2/playwright/integration/examples/paste-html.test.ts`
- `../slate-v2/playwright/integration/examples/large-document-runtime.test.ts`

Evidence:

- slate-browser core tests passed with 20 tests and 40 assertions
- Slate Browser + Slate DOM + Slate React build passed with 3 successful tasks
- targeted richtext claim rows passed with 10 tests across Chromium and mobile
- paste/drop claim rows passed with 8 tests across Chromium, Firefox, WebKit,
  and mobile after the classifier fix
- composition claim rows passed with 4 tests across Chromium, Firefox, WebKit,
  and mobile
- Slate Browser + Slate DOM + Slate React typecheck passed with 6 successful
  tasks
- lint fix/check passed with no fixes applied
- full richtext cross-browser generated/caret/cursor gate passed with 124 tests
  after metadata claim changes
- local source inventory found existing Appium Android, Appium iOS, and
  agent-browser iOS transport descriptors, but the current Playwright
  integration release rows still exercise Playwright mobile viewport,
  semantic-handle, synthetic composition, or synthetic DataTransfer claims

Failed probes:

- Playwright rows run before rebuilding touched package output missed the new
  scenario metadata `claim`; this re-confirms build-before-browser-proof for
  `slate-browser` subpath consumers
- mobile synthetic drop initially classified as generic mobile viewport proof;
  the classifier now checks synthetic DataTransfer before mobile fallback
- the navigation/mutation row expected an element path where the helper returns
  a text path
- a broad mobile inventory grep included nonexistent `src`, which polluted the
  probe with an rg path error; subsequent inventory should target existing
  repo roots only

Owner classification:

- current owner remains: Batch 6 Native Mobile And IME Transport
- completed sub-owner: generated Playwright scenario rows now carry honest
  transport claim metadata and assert it in release rows
- remaining owner: raw native Android/iOS keyboard, native mobile clipboard,
  and raw mobile IME/composition are still not release-proved by the Playwright
  mobile project
- remaining owner: Appium/agent-browser descriptor scaffolding exists, but it
  is not yet wired into the generated release gate or completion target

Rejected tactics:

- do not count semantic handles as native mobile proof
- do not count Playwright mobile viewport emulation as Android/iOS native
  keyboard proof
- do not treat synthetic composition or synthetic DataTransfer as raw native
  IME/clipboard proof
- do not rerun Playwright rows against stale built package output after editing
  `slate-browser`

Next action:

- turn the raw-native mobile gap into an executable proof-scope contract:
  inventory the existing Appium/agent-browser transport descriptors, classify
  which scenario families they can cover, and either wire the smallest release
  gate or record the exact unsupported/deferred native-device claim boundary

Checkpoint:

- verdict: keep course
- harsh take: mobile proof was still too easy to overclaim; without explicit
  claim metadata, a green Pixel 5 Playwright row can be mistaken for Android or
  iOS native transport proof
- why: the release rows now say what they actually prove, and the remaining
  native-device gap is explicit instead of hidden behind a broad `mobile`
  project name
- risks: Appium/agent-browser scaffolding may be enough for targeted raw-device
  proof, but it is not a routine local gate; if we wire it blindly, the release
  lane becomes hostage to unavailable devices
- earliest gates: slate-browser core claim classifier tests, targeted
  richtext/paste/composition claim rows, and a source inventory proving whether
  raw-device automation exists
- next move: define the native-device proof matrix from the existing
  `packages/slate-browser/src/transports/**` descriptors and decide whether
  Batch 6 closes by adding one runnable raw-device gate or by narrowing the
  release claim with exact unsupported transport rows
- do-not-do list: do not invent fake native-mobile claims, do not add a device
  gate that cannot run in normal local/CI environments, and do not move to
  perf while mobile/IME claim language remains ambiguous

### 2026-04-24 Slice 24: Native Device Proof Scope Contract

Actions:

- added a red/green transport proof-scope contract for browser-mobile transport
  descriptors
- added `classifyBrowserMobileTransportProof(...)` and
  `getBrowserMobileTransportProofMatrix()` to `slate-browser/transports`
- classified Appium Android and Appium iOS as automated direct
  device-browser input/IME-commit proof candidates
- classified agent-browser iOS as automated proxy evidence that cannot close a
  release gate by itself
- kept native mobile clipboard, human soft keyboard, glide typing, and voice
  input outside the current automated release claim
- documented the same boundary in the `slate-browser` README

Commands:

- red `bun run --cwd packages/slate-browser test:core --bail 1`
- green `bun run --cwd packages/slate-browser test:core --bail 1`
- `bunx turbo build --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- `bunx turbo typecheck --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- `bun run lint:fix`
- `bun run lint`
- post-lint `bun run --cwd packages/slate-browser test:core --bail 1`
- post-lint `bunx turbo typecheck --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force`

Artifacts:

- `../slate-v2/packages/slate-browser/src/transports/contracts.ts`
- `../slate-v2/packages/slate-browser/test/core/proof.test.ts`
- `../slate-v2/packages/slate-browser/README.md`

Evidence:

- core test failed red before the transport proof-scope classifier existed
- core test passed with 21 tests and 44 assertions after implementation
- Slate Browser + Slate DOM + Slate React build passed with 3 successful tasks
- Slate Browser + Slate DOM + Slate React typecheck passed with 6 successful
  tasks
- lint fix/check passed; Biome formatted one touched file
- post-lint core test passed with 21 tests and 44 assertions
- post-lint Slate Browser + Slate DOM + Slate React typecheck passed with 6
  successful tasks

Failed probes:

- the first core test run failed on missing
  `classifyBrowserMobileTransportProof`, which was the intended RED contract

Owner classification:

- completed owner: Batch 6 Native Mobile And IME Transport
- completed sub-owner: generated Playwright rows carry explicit semantic,
  native-desktop, synthetic, and mobile-viewport/handle claim metadata
- completed sub-owner: direct device-browser mobile proof candidates are
  represented by Appium transport descriptors and executable proof-scope
  classification
- accepted limitation: agent-browser iOS remains proxy evidence, not a release
  gate
- accepted limitation: native mobile clipboard, human soft keyboard, glide
  typing, and voice input are outside the current automated release claim
- remaining owner moves to: Batch 7 React Perf Caveat

Rejected tactics:

- do not wire Appium into the normal release gate without available device
  infrastructure
- do not let the `mobile` Playwright project imply Android/iOS native transport
- do not use agent-browser proxy output as a release-quality native-device gate
- do not broaden Batch 6 into a full mobile product testing program

Next action:

- start Batch 7 by reading the current React/core perf caveats, rerunning the
  focused perf guardrails if needed, and deciding whether the huge-doc
  middle-block caveat is resolved, accepted with benchmark evidence, or needs a
  targeted architecture fix that does not revive child-count chunking

Checkpoint:

- verdict: keep course
- harsh take: Batch 6 closes only because the claim got narrower and executable;
  pretending we have human keyboard, glide, voice, or mobile clipboard proof
  would be fake confidence
- why: local repeatable gates now prove the classification boundary, and the
  code has explicit direct-device vs proxy vs unsupported categories
- risks: raw Appium device-browser rows still need a real device lane before
  making broader native-mobile release claims
- earliest gates: React rerender breadth, React huge-document legacy compare,
  core observation compare, and core huge-document compare
- next move: execute Batch 7 perf caveat review and guardrails
- do-not-do list: do not revive child-count chunking, do not optimize before
  reading the latest caveat evidence, and do not treat a benchmark win as a
  browser-editing correctness claim

### 2026-04-24 Slice 25: React Huge-Doc Perf Caveat Closure

Actions:

- reproduced the React rerender breadth benchmark crash after lint converted the
  `React` import in `EditableDOMRoot` to a type-only import
- kept the import lint-stable by making the outer `ReadOnlyContext.Provider`
  creation use the runtime `React.createElement(...)` binding
- reran the React rerender breadth guardrail after lint to prove the Bun/browser
  benchmark source path no longer throws `React is not defined`
- reran the default 5000-block huge-document compare with `activeRadius: 0`
  so the durable artifact matches the current accepted corridor
- kept `activeRadius: 0` as the default and rejected radius-1 as a default
  pivot
- accepted the direct middle-block shell typing caveat with benchmark evidence:
  direct typing into an unpromoted shelled middle block is not the user editing
  corridor; activation/promotion before typing is the corridor that must stay
  fast

Commands:

- failed `bun run bench:react:rerender-breadth:local` before this slice with
  `ReferenceError: React is not defined`
- failed `bun run lint:fix && bun run lint` once on a redundant fragment after
  the first `React.createElement(...)` patch
- green `bun run lint:fix && bun run lint`
- green `bun run bench:react:rerender-breadth:local`
- green `bunx turbo build --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- green `bunx turbo typecheck --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- green `REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local`
- green `bun test ./packages/slate-react/test/large-doc-and-scroll.tsx --bail 1`

Artifacts:

- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/tmp/react-rerender-breadth-local.json`
- `../slate-v2/packages/slate-react/tmp/huge-document-legacy-compare-local.json`

Evidence:

- lint fix/check passed and preserved the runtime `React` import
- rerender breadth stayed scoped:
  - selection broad renders: `0`
  - left/right block renders: `0`
  - selection renders: `0`
  - many-leaf sibling renders: `0`
  - deep ancestor renders: `0`
- default huge-document compare used `activeRadius: 0`, `blocks: 5000`,
  `iterations: 5`, and `typeOps: 10`
- v2 ready mean: `10.67ms` vs legacy chunk-on `347.05ms`
- v2 start-block type mean: `5.22ms` vs legacy chunk-on `36.29ms`
- v2 start-block select-then-type mean: `1.02ms` vs legacy chunk-on `35.20ms`
- v2 middle-block type mean: `49.04ms` vs legacy chunk-on `31.73ms`
- v2 middle-block select-then-type mean: `46.49ms` vs legacy chunk-on
  `31.77ms`
- v2 middle-block promote-then-type mean: `9.53ms` vs legacy chunk-on
  `33.22ms`
- v2 replace-full-document mean: `19.88ms` vs legacy chunk-on `118.77ms`
- v2 insert-fragment full-document mean: `20.32ms` vs legacy chunk-on
  `105.68ms`
- focused large-doc React contract passed with 15 tests and 49 assertions
- Slate DOM + Slate React build passed with 2 successful tasks
- Slate DOM + Slate React typecheck passed with 4 successful tasks

Failed probes:

- lint rejected the first `React.createElement(...)` patch because it wrapped a
  single provider child in an unnecessary fragment
- exploratory `REACT_HUGE_COMPARE_ACTIVE_RADIUS=1` evidence did not justify a
  default switch; radius 1 narrowed one direct middle-block path in one run, but
  the current plan intentionally uses active radius 0 and activation/promotion
  as the user corridor

Owner classification:

- completed owner: Batch 7 React Perf Caveat
- accepted limitation: model-only middle-block type/select-then-type into a
  shelled block remains slower than legacy chunk-on in the benchmark harness
- accepted rationale: the user editing corridor is promote/activate then type,
  which beats legacy chunk-on while preserving the no-child-count-chunking
  architecture
- preserved guardrail: direct DOM sync, live reads, dirty commits, shell
  activation, and React fallback remain the runtime path; child-count chunking
  stays dead
- remaining owner moves to: Batch 8 Final Docs, Research, And Release Claims

Rejected tactics:

- do not revive child-count chunking to win a synthetic direct middle-shell row
- do not switch the default active radius from 0 based on an exploratory run
- do not count model-only shell typing as the user-facing large-document editing
  corridor
- do not treat benchmark wins as browser editing correctness proof

Next action:

- start Batch 8 by aligning docs/research/release claim language with the final
  architecture: public API hard cuts, `editor.read`/`editor.update`,
  extension-method runtime, kernel authority, generated gauntlets, scoped mobile
  proof, and the accepted huge-doc perf caveat

Checkpoint:

- verdict: keep course
- harsh take: the perf story is strong, but only if we stop pretending every
  benchmark row is the same product path; the direct unpromoted shell row is a
  caveat, not a reason to resurrect chunking
- why: the real user corridor and all broad React render guardrails are green,
  and the remaining slower row is explicitly scoped to a model-only shell path
- risks: Batch 8 can still overclaim if release docs flatten scoped mobile proof
  or the huge-doc caveat into blanket correctness/perf claims
- earliest gates: docs/research claim greps, completion-check state, and final
  `bun test:integration-local` plus package build/type/lint/perf guardrails
- next move: execute Batch 8 docs/research/release-claim alignment
- do-not-do list: do not write migration/changelog prose, do not overclaim
  native mobile, do not hide the middle-shell caveat, and do not revive
  `Transforms.*`, mutable editor fields, or child-count chunking in docs

### 2026-04-24 Slice 26: Final Docs And Release Claim Alignment

Actions:

- added a canonical Slate v2 absolute architecture release claim doc
- updated the `docs/slate-v2` front door to read that claim first
- updated release readiness to reflect the read/update lifecycle, primitive
  method DX, extension methods, generated gauntlets, scoped mobile proof, and
  accepted huge-doc caveat
- updated the replacement gates scoreboard to classify read/update runtime,
  generated browser gauntlets, scoped mobile proof, and huge-doc caveat status
- updated the final API hard-cuts status so stale public fields, direct
  apply/onChange replacement, `Transforms.*`, `decorate`, and child-count
  chunking are not presented as primary public surfaces
- updated the proof ledger so final closure depends on same-turn gates rather
  than more package/runtime architecture debate
- patched the architecture contract front matter and public API sections so the
  primary path teaches `editor.read`, `editor.update`, primitive editor methods,
  extension methods, and commit subscribers instead of the older retrofit API

Commands:

- `sed -n '492,560p' docs/plans/2026-04-24-slate-v2-absolute-architecture-closure-plan.md`
- `sed -n '1,260p' docs/slate-v2/overview.md`
- `sed -n '1,280p' docs/slate-v2/master-roadmap.md`
- `sed -n '1,260p' docs/slate-v2/release-readiness-decision.md`
- `sed -n '1,260p' docs/slate-v2/replacement-gates-scoreboard.md`
- `sed -n '1,260p' docs/slate-v2/final-api-hard-cuts-status.md`
- `sed -n '1,300p' docs/slate-v2/references/architecture-contract.md`
- `sed -n '1,320p' docs/slate-v2/true-slate-rc-proof-ledger.md`
- `rg -n "Transforms\\.|editor\\.(selection|children|marks|operations)|editor\\.apply|editor\\.onChange" docs/slate-v2/overview.md docs/slate-v2/absolute-architecture-release-claim.md docs/slate-v2/release-readiness-decision.md docs/slate-v2/replacement-gates-scoreboard.md docs/slate-v2/final-api-hard-cuts-status.md docs/slate-v2/references/architecture-contract.md docs/slate-v2/true-slate-rc-proof-ledger.md`
- `rg -n "compatibility mirrors kept through RC|editor\\.children survives|editor\\.selection survives|Editor\\.apply\\(editor|first shelled-block activation|same-path open rows|mixed rows still include|proved in Chromium|Chromium-only closure" docs/slate-v2 docs/research/decisions docs/research/systems --glob '!**/ledgers/**'`

Artifacts:

- `docs/slate-v2/absolute-architecture-release-claim.md`
- `docs/slate-v2/overview.md`
- `docs/slate-v2/master-roadmap.md`
- `docs/slate-v2/release-readiness-decision.md`
- `docs/slate-v2/replacement-gates-scoreboard.md`
- `docs/slate-v2/final-api-hard-cuts-status.md`
- `docs/slate-v2/true-slate-rc-proof-ledger.md`
- `docs/slate-v2/references/architecture-contract.md`
- `docs/slate-v2/slate-react-perf-loop-context.md`

Evidence:

- stale-danger grep returned no hits for the old RC mirror claim, old
  first-activation claim, same-path-open claim, mixed-row-open claim, or
  Chromium-only/proved-in-Chromium overclaim phrases
- focused public-surface grep only returns negative hard-cut statements in the
  current front-door docs
- the canonical release claim now states:
  - Slate model + operations
  - `editor.read` / `editor.update`
  - primitive editor methods
  - extension methods
  - `EditorCommit`
  - generated browser gauntlets
  - scoped mobile/native transport proof
  - accepted huge-doc middle-shell caveat
  - child-count chunking stays dead

Failed probes:

- no docs probe failed in this slice

Owner classification:

- completed owner: Batch 8 Final Docs, Research, And Release Claims
- completed sub-owner: primary docs have a canonical release-claim entry point
- completed sub-owner: dangerous old release-claim phrases are gone from the
  current `docs/slate-v2` and `docs/research` surfaces outside ledger archives
- remaining owner: final same-turn verification and completion-check closure

Rejected tactics:

- do not hide old architecture-contract drift by leaving it above the final
  release claim in the read order
- do not delete all historical reference text just to silence grep; rewrite the
  primary guidance and leave negative hard-cut mentions explicit
- do not mark RC ready from docs alone

Next action:

- run the final integration, package build/typecheck, lint, and perf guardrails
  required by the active completion target; then update
  `tmp/completion-check.md` to `done` only if every required gate passes or to
  `blocked` only with exact missing evidence

Checkpoint:

- verdict: keep course
- harsh take: the architecture claim is finally coherent on paper; until the
  final gates run in the same closeout slice, it is still not closure
- why: docs now match the built system and proof boundaries instead of teaching
  the older retrofit API, but release readiness is a verification claim
- risks: final `bun test:integration-local` can still expose browser/example
  drift; docs cannot paper over that
- earliest gates: `bun test:integration-local`, focused core/React/browser
  contract suites, package build/typecheck, lint, and React/core perf guardrails
- next move: execute final verification gates
- do-not-do list: do not set completion-check to done before final gates, do
  not call `bun completion-check` while status is pending, and do not downgrade
  failures into prose unless they are explicitly accepted/deferred

### 2026-04-24 Slice 27: Final Verification And Completion Closure

Actions:

- ran final focused package/kernel/browser contracts
- ran package build and fixed the filtered Turbo typecheck race by making
  `typecheck` depend on dependent package builds through `^build`
- fixed the site `code-highlighting` example matcher type so Next/Turbopack can
  typecheck the example under TypeScript 6
- reran lint, root build, package typecheck, full integration, targeted flaky
  reruns, and core perf guardrails
- accepted the remaining integration flake debt as load-only Firefox
  `page.goto` timeouts because the full suite passed with retries and the exact
  rows passed with `--retries=0` in a focused one-worker run

Commands:

- green `bun test ./packages/slate/test/read-update-contract.ts ./packages/slate/test/primitive-method-runtime-contract.ts ./packages/slate/test/transaction-target-runtime-contract.ts ./packages/slate/test/commit-metadata-contract.ts ./packages/slate/test/bookmark-contract.ts --bail 1`
- green `bun test ./packages/slate-history --bail 1`
- green `bun test ./packages/slate-react/test/editing-kernel-contract.ts ./packages/slate-react/test/selection-controller-contract.ts ./packages/slate-react/test/dom-repair-policy-contract.ts ./packages/slate-react/test/target-runtime-contract.tsx ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`
- green `bun run --cwd packages/slate-browser test:core --bail 1`
- green `bunx turbo build --filter=./packages/slate --filter=./packages/slate-history --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- failed `bunx turbo typecheck --filter=./packages/slate --filter=./packages/slate-history --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force` before the Turbo dependency-order fix
- failed `bun run build` once on the `code-highlighting` implicit `any` matcher
- green `bun run build`
- green package-local sequential typechecks while diagnosing the Turbo race
- green post-fix `bunx turbo typecheck --filter=./packages/slate --filter=./packages/slate-history --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force`
- green `bun run lint:fix`
- green `bun run lint`
- green `bun test:integration-local`
- green `bunx playwright test ./playwright/integration/examples/large-document-runtime.test.ts --project=firefox --grep "commits IME composition|preserves Slate fragment paste over shell-backed selection|selects void content" --workers=1 --retries=0`
- green `bun run bench:react:rerender-breadth:local`
- green `REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local`
- green `bun run bench:core:observation:compare:local`
- green `bun run bench:core:huge-document:compare:local`

Artifacts:

- `../slate-v2/turbo.json`
- `../slate-v2/site/examples/ts/code-highlighting.tsx`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-browser/src/transports/contracts.ts`
- `../slate-v2/packages/slate-browser/test/core/proof.test.ts`
- `../slate-v2/packages/slate-browser/README.md`
- final benchmark artifacts under `../slate-v2/packages/slate-react/tmp/**`
- final Playwright artifacts under `../slate-v2/test-results/**`

Evidence:

- core contracts passed: 35 tests across five files
- slate-history passed: 14 pass, 1 skip
- React/kernel contracts passed: 25 tests, 60 assertions
- slate-browser core passed: 21 tests, 44 assertions
- package build passed: 5 successful tasks
- root build passed: package build plus Next/Turbopack build/export
- final filtered package typecheck passed: 11 successful tasks
- lint fix/check passed with no remaining fixes
- `bun test:integration-local` passed with 525 passed and 3 flaky Firefox
  large-document rows; the flakes were initial `page.goto` timeouts under full
  parallel load and all passed on retry
- focused no-retry rerun of the exact flaky Firefox rows passed: 3 passed
- React rerender breadth passed with zero broad/sibling/ancestor rerenders in
  the critical rows
- React 5000-block huge-doc compare passed with `activeRadius: 0`; v2
  `middleBlockPromoteThenTypeMs` mean was `9.53ms` vs legacy chunk-on
  `33.22ms`
- core observation compare passed; current won nodes-at-root and positions
  lanes, with `readChildrenLengthAfterEachMs` at `+0.36ms`
- core huge-document compare passed; current won middle typing, replace, and
  fragment lanes, with bounded start/select-all deltas

Failed probes:

- filtered Turbo typecheck failed because `slate-history` started while
  `slate/dist` was empty; root cause was `typecheck.dependsOn` missing
  `^build`
- root build caught a real TypeScript 6 matcher type issue in
  `site/examples/ts/code-highlighting.tsx`
- full integration reported three Firefox load flakes, all passing on retry and
  passing in an exact no-retry focused rerun

Owner classification:

- completed owner: final same-turn verification and completion-check closure
- accepted limitation: 3 full-suite Firefox load flakes remain accepted flake
  debt, not skipped debt; exact rows pass with no retries outside full-suite
  load pressure
- accepted limitation: native mobile clipboard, human soft keyboard, glide
  typing, and voice input remain outside the automated release claim
- accepted limitation: direct model-only typing into an unpromoted middle shell
  remains a benchmark caveat; promoted middle-block typing is the user corridor
  and is green

Rejected tactics:

- do not accept a broken Turbo typecheck race when a one-line dependency-order
  fix makes the required gate deterministic
- do not mark full-suite flakes as product failures when the exact rows pass
  without retries in focused proof
- do not broaden mobile proof beyond the classified transport claims

Next action:

- set `tmp/completion-check.md` to `done` and run `bun completion-check`

Checkpoint:

- verdict: stop
- harsh take: the plan is closeable, not perfect; remaining mobile human-input
  proof and full-suite load flakes are explicitly scoped instead of hidden
- why: every active architecture owner is implemented, documented, or scoped,
  and the same-turn gates required for this closure passed
- risks: future device-lab claims still need real Appium/device execution, and
  full-suite Firefox load timeouts can return if the runner gets slower
- earliest gates: `bun completion-check` after the completion file flips to
  `done`
- next move: run completion-check
- do-not-do list: do not reopen perf or browser architecture in this lane
  unless completion-check exposes a real blocker

## 2026-04-24 Public Mutable-State Hard Cut Slice

Actions:

- removed public `children`, `selection`, `marks`, and `operations` from the
  Slate `BaseEditor` type and from `createEditor()` runtime initialization
- removed read-only public-field mirrors from `core/public-state.ts`; internal
  state is seeded directly and read through accessor methods
- updated root-aware traversal and mutation helpers so the editor root uses
  `Editor.getChildren(editor)` instead of root `.children`
- migrated Slate core tests, legacy fixture expectations, and fixture runner
  snapshots away from JSX editor `.children` / `.selection` mirrors
- updated stale docs text that still taught `Transforms.*` and `editor.children`

Commands:

- `bun test ./packages/slate/test/public-surface-contract.ts ./packages/slate/test/public-field-hard-cut-contract.ts ./packages/slate/test/escape-hatch-inventory-contract.ts ./packages/slate/test/write-boundary-contract.ts ./packages/slate/test/surface-contract.ts ./packages/slate/test/snapshot-contract.ts ./packages/slate/test/interfaces-contract.ts ./packages/slate/test/clipboard-contract.ts ./packages/slate/test/accessor-transaction.test.ts ./packages/slate/test/read-update-contract.ts ./packages/slate/test/primitive-method-runtime-contract.ts ./packages/slate/test/transaction-target-runtime-contract.ts ./packages/slate/test/commit-metadata-contract.ts ./packages/slate/test/bookmark-contract.ts --bail 1`
- `bun test ./packages/slate/test --bail 1`
- `bunx turbo build --filter=./packages/slate --force`
- `bunx turbo typecheck --filter=./packages/slate --force`
- `bun run lint:fix`
- `bun run lint`
- `rg -n "editor\\.(selection|children|marks|operations)" packages/slate/src packages/slate/test --glob '!**/dist/**'`
- `rg -n "\\bTransforms\\.|\\beditor\\.(selection|children|marks|operations)\\b|\\beditor\\.(apply|onChange)\\s*=" site/examples docs --glob '!site/out/**' --glob '!site/.next/**'`

Evidence:

- focused Slate contracts passed with 300 tests
- full Slate legacy fixture runner passed with 1015 pass and 94 skip
- `packages/slate` build passed
- `packages/slate` typecheck passed
- lint fix/check passed with no remaining fixes after final docs cut
- source/test grep for `editor.children`, `editor.selection`, `editor.marks`,
  and `editor.operations` returned no matches in `packages/slate/src` and
  `packages/slate/test`
- docs/examples grep for `Transforms.*`, public mutable fields, and direct
  `editor.apply` / `editor.onChange` extension points returned no matches

Hypothesis:

- public stale-state pressure is now cut at the runtime/type/docs level instead
  of discouraged by convention
- remaining broader architecture work should continue through new explicit
  owners, not by reopening public mutable fields as compatibility mirrors

Decision:

- keep the hard cut; do not add read-only compatibility fields back to `Editor`

Owner classification:

- completed owner: Batch 1 public mutable-state hard cut
- remaining owner: broader browser/device/runtime closure outside this slice

Changed files:

- `../slate-v2/packages/slate/src/interfaces/editor.ts`
- `../slate-v2/packages/slate/src/create-editor.ts`
- `../slate-v2/packages/slate/src/core/public-state.ts`
- `../slate-v2/packages/slate/src/editor/is-editor.ts`
- `../slate-v2/packages/slate/src/editor/next.ts`
- `../slate-v2/packages/slate/src/editor/previous.ts`
- `../slate-v2/packages/slate/src/interfaces/node.ts`
- `../slate-v2/packages/slate/src/interfaces/transforms/general.ts`
- `../slate-v2/packages/slate/src/transforms-node/insert-nodes.ts`
- `../slate-v2/packages/slate/src/transforms-node/lift-nodes.ts`
- `../slate-v2/packages/slate/src/transforms-node/merge-nodes.ts`
- `../slate-v2/packages/slate/src/transforms-node/move-nodes.ts`
- `../slate-v2/packages/slate/src/transforms-node/unwrap-nodes.ts`
- `../slate-v2/packages/slate/src/transforms-text/insert-fragment.ts`
- `../slate-v2/packages/slate/src/core/get-fragment.ts`
- `../slate-v2/packages/slate/src/utils/modify.ts`
- `../slate-v2/packages/slate/test/**`
- `../slate-v2/docs/general/changelog.md`
- `tmp/completion-check.md`
- `docs/plans/2026-04-24-slate-v2-absolute-architecture-closure-plan.md`

Rejected tactics:

- no public read-only mirrors for deleted fields
- no committed-snapshot reads to replace root traversal during live operations
- no semantic helper bloat; primitive methods and accessors remain the public
  shape

Next action:

- run `bun completion-check`

Checkpoint:

- verdict: stop
- harsh take: this is the right cut; stale public fields were training users
  and tests to read poisoned state
- why: the runtime/type/docs surface no longer exposes or teaches the stale
  fields, and root traversal has an internal accessor path
- risks: broad browser correctness still depends on the conformance/kernel
  owners; this slice only closes public mutable-state pressure
- earliest gates: `bun completion-check`
- next move: run completion-check
- do-not-do list: do not restore `editor.children`, `editor.selection`,
  `editor.marks`, or `editor.operations` as public compatibility fields

## 2026-04-25 Direct Apply / OnChange Hard Cut Slice

Actions:

- removed `onChange` from the core `BaseEditor` runtime/type surface
- sealed instance `editor.apply` so plugins/tests cannot replace it as an
  extension point
- added `editor.applyOperations(...)` as the explicit operation import/replay
  API
- added operation middleware registration through `editor.extend(...)` so DOM
  runtime operation interception composes through the extension registry instead
  of monkeypatching `editor.apply`
- migrated `slate-dom` operation interception from direct `apply` replacement
  to operation middleware
- moved React `<Slate onChange>` prop dispatch onto snapshot/commit
  subscription instead of `editor.onChange`
- migrated history undo/redo and history fixtures away from direct public
  editor mirrors and direct instance apply
- updated React editable, composition, clipboard, selection, and Android paths
  away from deleted `editor.selection` / `editor.marks` mirrors
- added a focused hard-cut contract for sealed `apply`, absent `onChange`,
  `applyOperations`, and subscriber/commit-listener ordering
- updated escape-hatch inventory counts downward for the cut surfaces

Commands:

- `bun test ./packages/slate/test/apply-onchange-hard-cut-contract.ts --bail 1`
- `bun test ./packages/slate/test/apply-onchange-hard-cut-contract.ts ./packages/slate/test/extension-contract.ts ./packages/slate/test/surface-contract.ts ./packages/slate/test/snapshot-contract.ts ./packages/slate/test/transaction-contract.ts ./packages/slate/test/escape-hatch-inventory-contract.ts --bail 1`
- `bun test ./packages/slate/test --bail 1`
- `bun test ./packages/slate-history --bail 1`
- `bun test ./packages/slate-history/test/history-contract.ts ./packages/slate-history/test/integrity-contract.ts --bail 1`
- `bun test ./packages/slate-react/test/editing-kernel-contract.ts ./packages/slate-react/test/selection-controller-contract.ts ./packages/slate-react/test/dom-repair-policy-contract.ts ./packages/slate-react/test/target-runtime-contract.tsx ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`
- `bunx turbo build --filter=./packages/slate --filter=./packages/slate-dom --filter=./packages/slate-react --filter=./packages/slate-history --force`
- `bunx turbo typecheck --filter=./packages/slate --filter=./packages/slate-dom --filter=./packages/slate-react --filter=./packages/slate-history --force`
- `bun run lint:fix`
- `bun run lint`
- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "selection|caret|toolbar|bold|heading|arrow|backspace|delete|warm|generated" --workers=4 --retries=0`
- `rg -n "editor\\.onChange\\b|\\.onChange\\s*=|editor\\.apply\\s*=" packages/slate packages/slate-dom packages/slate-react packages/slate-history --glob '!**/dist/**' --glob '!**/CHANGELOG.md'`

Evidence:

- hard-cut contract passed with 4 focused assertions
- focused Slate contracts passed with 234 tests
- full Slate test entry passed with 1015 pass and 94 skip
- history package entry passed with 14 pass and 1 skip
- focused history contracts passed with 20 tests
- focused React editable contracts passed with 28 tests and 63 expects
- build passed for `slate`, `slate-dom`, `slate-react`, and `slate-history`
- typecheck passed for `slate`, `slate-dom`, `slate-react`, and
  `slate-history`
- `lint:fix` formatted 5 files, then `lint` passed with no fixes applied
- focused richtext browser rows passed across Chromium, Firefox, WebKit, and
  mobile projects with 124 tests
- source grep found no remaining `editor.onChange` assignment or
  `editor.apply =` replacement outside the hard-cut contract

Hypothesis:

- `editor.apply` and `editor.onChange` are no longer viable extension points,
  so plugin/runtime interception has one explicit path: operation middleware
  plus commit subscribers

Decision:

- keep `Editor.apply` / readonly instance `editor.apply` as low-level operation
  machinery, but never as the extension mechanism
- use `editor.applyOperations(...)` for explicit operation replay/import
- use `editor.extend({ operationMiddlewares })` for operation interception
- use `Editor.subscribe` / `Editor.registerCommitListener` for observation

Owner classification:

- completed owner: direct `editor.apply` / `editor.onChange` hard cut
- remaining owner: broader absolute architecture closure batches outside this
  slice

Changed files:

- `../slate-v2/packages/slate/src/interfaces/editor.ts`
- `../slate-v2/packages/slate/src/create-editor.ts`
- `../slate-v2/packages/slate/src/core/editor-extension.ts`
- `../slate-v2/packages/slate/src/core/extension-registry.ts`
- `../slate-v2/packages/slate/src/core/public-state.ts`
- `../slate-v2/packages/slate/src/editor/is-editor.ts`
- `../slate-v2/packages/slate/test/apply-onchange-hard-cut-contract.ts`
- `../slate-v2/packages/slate/test/escape-hatch-inventory-contract.ts`
- `../slate-v2/packages/slate/test/extension-contract.ts`
- `../slate-v2/packages/slate/test/snapshot-contract.ts`
- `../slate-v2/packages/slate/test/surface-contract.ts`
- `../slate-v2/packages/slate/test/transaction-contract.ts`
- `../slate-v2/packages/slate-dom/src/plugin/dom-editor.ts`
- `../slate-v2/packages/slate-dom/src/plugin/with-dom.ts`
- `../slate-v2/packages/slate-dom/src/utils/range-list.ts`
- `../slate-v2/packages/slate-dom/src/utils/weak-maps.ts`
- `../slate-v2/packages/slate-dom/src/index.ts`
- `../slate-v2/packages/slate-history/src/with-history.ts`
- `../slate-v2/packages/slate-history/test/index.spec.ts`
- `../slate-v2/packages/slate-history/test/integrity-contract.ts`
- `../slate-v2/packages/slate-react/src/components/editable.tsx`
- `../slate-v2/packages/slate-react/src/components/slate.tsx`
- `../slate-v2/packages/slate-react/src/editable/clipboard-input-strategy.ts`
- `../slate-v2/packages/slate-react/src/editable/composition-state.ts`
- `../slate-v2/packages/slate-react/src/editable/selection-reconciler.ts`
- `../slate-v2/packages/slate-react/src/hooks/android-input-manager/android-input-manager.ts`
- `docs/solutions/developer-experience/2026-04-19-slate-public-single-op-writes-should-use-editor-apply-and-keep-onchange-behind-subscribers.md`
- `tmp/completion-check.md`
- `docs/plans/2026-04-24-slate-v2-absolute-architecture-closure-plan.md`

Rejected tactics:

- no `editor.onChange` compatibility shim
- no plugin monkeypatching of `editor.apply`
- no command policy object or `runCommand` ceremony
- no restoration of public `editor.selection` / `editor.marks` mirrors to fix
  React fallout

Next action:

- run `bun completion-check`

Checkpoint:

- verdict: stop
- harsh take: `editor.apply`/`onChange` as extension points were legacy
  footguns; keeping them replaceable would undermine the update/commit runtime
- why: low-level operation replay, interception, and observation now have named
  APIs with green package/type/lint gates
- risks: direct `editor.apply(...)` still exists as readonly low-level
  machinery; future batches should continue moving tests and docs toward
  `editor.update(...)` and `editor.applyOperations(...)`
- earliest gates: `bun completion-check`
- next move: run completion-check
- do-not-do list: do not reintroduce `editor.onChange`, writable
  `editor.apply`, or method monkeypatching as compatibility escape hatches

## 2026-04-25 Transforms Namespace Hard Cut Slice

Actions:

- reactivated this plan for the stricter `Transforms.*` hard cut
- switched `tmp/completion-check.md` back to `status: pending`
- reloaded prior solution notes and classified the 2026-04-09 transform
  namespace solution as stale for the current architecture
- confirmed the open problem: docs/examples were already cleaned, but internals,
  fixtures, and contract tests still make `Transforms.*` look like a first-class
  API

Commands:

- `sed -n '1,240p' docs/plans/2026-04-24-slate-v2-absolute-architecture-closure-plan.md`
- `sed -n '1,220p' tmp/completion-check.md`
- `rg -n "Transforms|transform namespace|editor\\.update|Public API|Hard Cut|mutable|completion" docs/plans/2026-04-24-slate-v2-absolute-architecture-closure-plan.md docs/research/decisions/slate-v2-read-update-runtime-architecture.md docs/research/systems/slate-v2-perfect-plan-steal-reject-defer-map.md tmp/completion-check.md`
- `rg -n "title:.*(transform|slate|api)|tags:.*(transform|slate|api)|module:.*(slate|editor)" docs/solutions --glob '*.md' -i`

Evidence:

- `tmp/completion-check.md` is pending for this active owner
- previous completion ledger explicitly says `Transforms.*` was only reduced in
  selected paths, not fully cut
- previous solution doc restored transform namespaces as thin sugar; that is no
  longer compatible with the final `editor.update` / primitive-method public
  runtime target

Hypothesis:

- cutting the namespace from the public export and migrating call sites will
  prevent tests and internals from keeping legacy free-function mutation as the
  default mental model

Decision:

- remove the public namespace instead of preserving it as compatibility sugar
- keep transform implementation modules only as implementation detail when they
  are still the cleanest owner for primitive method internals
- migrate tests and fixtures to editor primitives unless a legacy fixture is
  intentionally quarantined with an exact deletion rationale

Owner classification:

- active owner: `Transforms.*` namespace hard cut
- source owner: `../slate-v2/packages/slate/**`
- dependent owners: `../slate-v2/packages/slate-history/**`,
  `../slate-v2/packages/slate-react/**`, and legacy fixtures that import from
  `slate`

Changed files:

- `tmp/completion-check.md`
- `docs/plans/2026-04-24-slate-v2-absolute-architecture-closure-plan.md`

Rejected tactics:

- no compatibility alias
- no docs-only cleanup
- no semantic helper bloat such as adding core `toggleList` just to avoid
  primitive composition
- no public `tx.resolveTarget()` or command policy object

Next action:

- add a RED public-surface contract that proves Slate no longer exports
  `Transforms`, then remove the export and migrate the runtime/test fallout

Checkpoint:

- verdict: keep course
- harsh take: `Transforms.*` surviving in contracts and fixtures keeps the old
  API alive even if docs are clean; that is zombie architecture, not hard cut
- why: editor methods plus `editor.update` are the chosen public runtime, so
  free-function mutation namespaces should not remain public
- risks: broad fixture churn can hide real transform behavior regressions if
  done mechanically without focused gates
- earliest gates: public-surface contract, surface contract, and source grep
- next move: inspect public exports and add the RED contract
- do-not-do list: do not reintroduce `Transforms` as a compat shim, and do not
  delete transform implementation internals before the editor primitive path is
  green

Closure actions:

- added a RED public surface contract proving `slate` must not export
  `Transforms`, `GeneralTransforms`, `NodeTransforms`, `SelectionTransforms`, or
  `TextTransforms`
- removed the root transform namespace export from `interfaces/index.ts`
- deleted the transform-family namespace object export file
- renamed transform-family interface types to implementation-local method names:
  `OperationTransformMethods`, `NodeMutationMethods`,
  `SelectionMutationMethods`, and `TextMutationMethods`
- migrated package source, fixtures, and contract tests from `Transforms.*` calls
  to editor primitive methods or `editor.applyOperations(...)`
- replaced `GeneralTransforms.applyBatch(...)` and
  `GeneralTransforms.transform(...)` contract coverage with editor operation
  replay coverage
- added `applyInsertText` as an implementation-local helper so semantic
  `editor.insertText(...)` no longer recurses through itself after the namespace
  cut
- fixed explicit-`at` insert semantics so explicit target insertion does not
  consume active marks, and read-only/void collapsed targets are ignored before
  opening a transaction
- updated docs import examples and the docs summary labels away from
  `Transforms`
- added a major changeset for removing the public `Transforms` namespace
- refreshed the stale developer-experience solution doc that previously
  recommended keeping transform namespaces as thin sugar

Commands:

- `bun test ./packages/slate/test/public-surface-contract.ts --bail 1`
- `bun test ./packages/slate/test/public-surface-contract.ts ./packages/slate/test/surface-contract.ts ./packages/slate/test/escape-hatch-inventory-contract.ts --bail 1`
- `bun test ./packages/slate/test/transaction-contract.ts ./packages/slate/test/accessor-transaction.test.ts ./packages/slate/test/snapshot-contract.ts --bail 1`
- `SLATE_FIXTURE_FILTER='transforms/insertText/voids-false/read-only-inline' bun test ./packages/slate/test/index.spec.ts --bail 1`
- `bun test ./packages/slate/test --bail 1`
- `bun test ./packages/slate-history --bail 1`
- `bun test ./packages/slate-react/test/editing-kernel-contract.ts ./packages/slate-react/test/selection-controller-contract.ts ./packages/slate-react/test/dom-repair-policy-contract.ts ./packages/slate-react/test/target-runtime-contract.tsx ./packages/slate-react/test/dom-text-sync-contract.ts ./packages/slate-react/test/kernel-authority-audit-contract.ts --bail 1`
- `bunx turbo build --filter=./packages/slate --filter=./packages/slate-dom --filter=./packages/slate-react --filter=./packages/slate-history --force`
- `bunx turbo typecheck --filter=./packages/slate --filter=./packages/slate-dom --filter=./packages/slate-react --filter=./packages/slate-history --force`
- `bun run lint:fix`
- `bun run lint`
- `rg -n "\\bTransforms\\." packages site docs playwright --glob '!**/dist/**' --glob '!**/CHANGELOG.md' --glob '!site/out/**' --glob '!site/.next/**' --glob '!docs/general/changelog.md'`
- `rg -n "\\bTransforms\\b|\\b(GeneralTransforms|NodeTransforms|SelectionTransforms|TextTransforms)\\b" packages/slate/src packages/slate/test packages/slate-history packages/slate-react packages/slate-dom site/examples docs --glob '!**/dist/**' --glob '!**/CHANGELOG.md' --glob '!site/out/**' --glob '!site/.next/**' --glob '!docs/general/changelog.md'`
- `bun completion-check`

Evidence:

- RED public surface contract failed before the cut because `Transforms` was
  still exported
- public surface contract now passes with 44 assertions
- focused surface and escape-hatch contracts pass with 55 assertions
- focused transaction/snapshot contracts pass with 213 assertions
- the read-only inline insertText fixture passes after the semantic recursion
  fix
- full Slate test entry passes with 1015 assertions and 94 skips
- Slate history package passes with 14 assertions and 1 skip
- focused React editing/selection/repair/target/kernel contracts pass with 31
  tests and 75 expects
- build passes for `slate`, `slate-dom`, `slate-react`, and `slate-history`
- typecheck passes for `slate`, `slate-dom`, `slate-react`, and
  `slate-history`
- lint passes after `lint:fix`
- `Transforms.*` call-site grep is clean outside excluded generated/changelog
  output
- transform namespace grep only finds negative assertions in
  `packages/slate/test/public-surface-contract.ts`
- `bun completion-check` passes for `tmp/completion-check.md`

Hypothesis:

- the public/runtime/test mental model is now editor primitive methods under the
  `editor.update` write boundary; transform implementation modules may remain as
  private organization, but the free-function namespace is no longer a public or
  test-facing API

Decision:

- stop preserving `Transforms.*` as compatibility scaffolding
- keep editor primitive methods flexible enough for custom node types instead of
  replacing transform composition with semantic method bloat
- keep low-level operation replay explicit through `editor.applyOperations(...)`
  in tests that need exact operation coverage

Owner classification:

- completed owner: `Transforms.*` namespace hard cut
- remaining owner: broader absolute architecture closure batches outside this
  slice, especially `editor.update` enforcement, browser gauntlets, mobile/IME
  proof, and core perf cleanup

Changed files:

- `../slate-v2/.changeset/remove-transforms-namespace.md`
- `../slate-v2/docs/Summary.md`
- `../slate-v2/docs/walkthroughs/03-defining-custom-elements.md`
- `../slate-v2/docs/walkthroughs/07-enabling-collaborative-editing.md`
- `../slate-v2/packages/slate/src/core/apply.ts`
- `../slate-v2/packages/slate/src/editor/insert-text.ts`
- `../slate-v2/packages/slate/src/interfaces/editor.ts`
- `../slate-v2/packages/slate/src/interfaces/index.ts`
- `../slate-v2/packages/slate/src/interfaces/transforms/general.ts`
- `../slate-v2/packages/slate/src/interfaces/transforms/index.ts`
- `../slate-v2/packages/slate/src/interfaces/transforms/node.ts`
- `../slate-v2/packages/slate/src/interfaces/transforms/selection.ts`
- `../slate-v2/packages/slate/src/interfaces/transforms/text.ts`
- `../slate-v2/packages/slate/src/transforms-text/insert-text.ts`
- `../slate-v2/packages/slate/test/public-surface-contract.ts`
- `../slate-v2/packages/slate/test/surface-contract.ts`
- `../slate-v2/packages/slate/test/escape-hatch-inventory-contract.ts`
- package source, fixture, and contract-test call sites migrated mechanically
  from `Transforms.*` to editor primitives
- `docs/solutions/developer-experience/2026-04-09-slate-transform-namespaces-should-stay-thin-sugar-over-the-current-engine.md`
- `tmp/completion-check.md`
- `docs/plans/2026-04-24-slate-v2-absolute-architecture-closure-plan.md`

Rejected tactics:

- no public compatibility alias for `Transforms`
- no command policy object or public `tx.resolveTarget()` to replace
  transforms
- no semantic helper explosion such as adding core `toggleList` just to avoid
  primitive composition
- no deleting the remaining implementation modules merely because their folder
  name contains `transforms`

Next action:

- mark `tmp/completion-check.md` done for this slice and run
  `bun completion-check`

Checkpoint:

- verdict: stop
- harsh take: keeping `Transforms.*` in fixtures and contracts was not harmless;
  it taught contributors the old runtime even after docs moved on
- why: the public export is gone, test/runtime call sites use editor primitives,
  focused packages build/typecheck/lint, and grep proves the namespace is not
  still being used as a caller-facing API
- risks: legacy fixture directory names still include `transforms`, and private
  implementation files still live under transform folders; that is acceptable
  only as implementation organization, not API direction
- earliest gates: `bun completion-check`
- next move: run completion-check
- do-not-do list: do not restore `Transforms`, do not add broad semantic method
  bloat, and do not use test-only transform wrappers as migration scaffolding

## 2026-04-25 Primitive Auto-Transaction Hard Cut Slice

Actions:

- reactivated this plan for the primitive auto-transaction hard cut
- moved `tmp/completion-check.md` back to `status: pending`
- grounded the decision in the local Lexical source/docs:
  `editor.update(...)` is the write boundary, Lexical state helpers error
  outside update/read, and only named command dispatch opens an implicit update
- classified Slate v2 primitive auto-transactions as legacy compatibility, not
  final architecture

Commands:

- `rg -n "slate-v2|read/update|editor.update|completion-check|hard cut" /Users/zbeyens/.codex/memories/MEMORY.md`
- `rg -n "auto.?transaction|compatibility auto|write boundary|editor\\.update|read-update" docs/solutions docs/plans docs/research tmp/completion-check.md --glob '*.md'`
- `rg -n "auto.?transaction|compatibility auto|write boundary|editor\\.update|withTransaction|applyOperations" ../slate-v2/packages/slate/src ../slate-v2/packages/slate/test ../slate-v2/docs --glob '!**/dist/**'`
- `sed -n '1,220p' ../slate-v2/packages/slate/test/write-boundary-contract.ts`
- `sed -n '1,1240p' ../slate-v2/packages/slate/src/core/public-state.ts`

Evidence:

- `../slate-v2/packages/slate/test/write-boundary-contract.ts` still has a
  contract named `keeps direct primitive calls as compatibility
  auto-transactions`
- `../slate-v2/packages/slate/src/core/public-state.ts` only rejects direct
  primitive writes from inside `editor.read`, not from ordinary userland
- docs already mostly teach `editor.update(...)`, so the remaining gap is
  runtime enforcement and fixture/test migration

Hypothesis:

- killing primitive auto-transactions will remove the hidden local write
  boundary and make target freshness/history grouping depend on exactly one
  public write lifecycle

Decision:

- primitive document/selection writes outside `editor.update(...)` should throw
- `editor.applyOperations(...)` remains the explicit import/replay writer
- internal normalization/runtime paths must use explicit internal transaction
  authority, not userland-style primitive auto-transactions

Owner classification:

- active owner: primitive auto-transaction hard cut
- source owner: `../slate-v2/packages/slate/src/core/public-state.ts`
- dependent owners: Slate tests/fixtures and any React/history codepaths that
  relied on implicit primitive transactions

Rejected tactics:

- no warning-only dev mode
- no compatibility flag
- no public command-policy object
- no semantic method bloat to avoid primitive composition

Next action:

- flip `write-boundary-contract.ts` RED so direct primitive calls outside
  `editor.update(...)` must throw, then enforce the runtime guard

Checkpoint:

- verdict: keep course
- harsh take: primitive auto-transactions are legacy softness; they keep the
  system from having one honest write boundary
- why: Lexical only permits implicit updates through named command dispatch,
  while Slate v2's chosen DX is primitive composition inside `editor.update`
- risks: broad test fallout from old fixtures that depended on direct writes
- earliest gates: `bun test ./packages/slate/test/write-boundary-contract.ts --bail 1`
- next move: flip the RED contract
- do-not-do list: do not keep primitive auto-transactions as migration
  scaffolding, and do not expose `tx.resolveTarget()` to userland

## 2026-04-25 Primitive Auto-Transaction Hard Cut Closure

Actions:

- enforced `editor.update(...)` as the only public primitive write boundary
- kept `editor.applyOperations(...)` as the explicit import/replay writer
- kept command-like helpers intentionally opening the update boundary instead
  of preserving global primitive auto-transactions
- moved React/DOM runtime write paths to explicit update boundaries
- migrated public/docs/examples/tests and benchmark scripts away from
  `Transforms.*`
- kept `Slate.Transforms` only as a dynamic fallback inside legacy cross-repo
  benchmark runners
- updated the escape-hatch inventory counts after the primitive usage burn-down
- updated the package README wording and changeset for the public hard cut

Commands:

- `bun test ./packages/slate/test/write-boundary-contract.ts ./packages/slate/test/read-update-contract.ts ./packages/slate/test/primitive-method-runtime-contract.ts --bail 1`
- `bun test ./packages/slate/test/public-surface-contract.ts ./packages/slate/test/escape-hatch-inventory-contract.ts --bail 1`
- `bun test ./packages/slate-react/test/editing-kernel-contract.ts ./packages/slate-react/test/selection-controller-contract.ts ./packages/slate-react/test/dom-repair-policy-contract.ts --bail 1`
- `bunx turbo build --filter=./packages/slate --filter=./packages/slate-dom --filter=./packages/slate-react --filter=./packages/slate-history --force`
- `bunx turbo typecheck --filter=./packages/slate --filter=./packages/slate-dom --filter=./packages/slate-react --filter=./packages/slate-history --force`
- `bun run lint:fix`
- `bun run lint`
- `bun run bench:core:huge-document:compare:local`
- `bun run bench:core:observation:compare:local`
- `bun run bench:core:normalization:compare:local`
- `bun run bench:core:text-selection:local`
- `bun run bench:core:transaction:local`
- `bun run bench:core:editor-store:local`
- `bun run bench:core:normalization:local`
- `bun run bench:core:query-ref-observation:local`
- `bun run bench:core:node-transforms:local`
- `bun run bench:core:refs-projection:local`
- `bun run bench:react:rerender-breadth:local`
- `REACT_HUGE_DOC_BLOCKS=200 REACT_HUGE_DOC_BENCH_ITERATIONS=2 bun run bench:react:huge-document-overlays:local`
- `REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local`
- `bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "selection|caret|toolbar|bold|heading|arrow|backspace|delete|warm|generated" --workers=4 --retries=0`
- `bun test:integration-local`

Evidence:

- direct primitive writes outside `editor.update(...)` throw
- primitive writes inside `editor.update(...)` still compose through commits
- `editor.applyOperations(...)` remains the explicit operation replay path
- `Transforms.*` has no remaining public/docs/examples/runtime benchmark usage
- richtext selection/caret/browser toolbar rows passed across Chromium,
  Firefox, WebKit, and mobile projects: 124 passed
- full integration passed: 528 passed
- build, typecheck, lint, and edited benchmark scripts passed

Hypothesis:

- forcing all primitive writes through one public update lifecycle removes the
  hidden write boundary that kept stale selection and history grouping bugs
  alive

Decision:

- primitive auto-transactions are removed as a public behavior
- compatibility write softness is not kept behind a flag
- legacy benchmark fallback may use legacy `Slate.Transforms` only to compare
  against `../slate`

Owner classification:

- active owner closed: primitive auto-transaction hard cut
- remaining owner: broader architecture closure batches, not this slice

Rejected tactics:

- no warning-only mode
- no compatibility flag
- no public `tx.resolveTarget()`
- no global `executeCommand` auto-update fallback
- no restoring `Transforms` as a public namespace

Next action:

- run `bun completion-check`

Checkpoint:

- verdict: stop
- harsh take: primitive auto-transactions were legacy softness; keeping them
  would have undermined the whole `editor.update(...)` architecture
- why: the hard cut is enforced at runtime, public docs/examples are clean,
  browser integration is green, and perf scripts now speak the current runtime
- risks: core read-after-write observation is still slower than legacy and
  remains a separate perf debt; mobile proof is still semantic harness proof,
  not raw-device IME proof
- earliest gates: `bun completion-check`
- next move: run completion-check
- do-not-do list: do not revive primitive auto-transactions, do not re-export
  `Transforms`, and do not treat legacy benchmark fallbacks as user-facing API

## 2026-04-25 Release-Proof Hardening Closure

Actions:

- added `slate-browser` release-proof artifact helpers for raw mobile/device,
  persistent-browser soak, and ongoing release-discipline claims
- added focused `slate-browser` proof tests that reject semantic/proxy mobile
  evidence for raw device claims
- added a scoped mobile proof script that keeps current release claims honest
  and a raw mode that requires Appium-backed Android/iOS artifacts before
  claiming native keyboard, clipboard, or IME proof
- added a persistent-profile browser soak runner for the richtext warm
  toolbar/caret scenario, backed by replayable `slate-browser` scenario steps
- wired `check:full` to run release-proof gates and persistent-browser soak
  before `bun test:integration-local`
- expanded the public-surface contract so every primary `site/examples` TS/TSX
  and JS/JSX file is scanned, not only a handpicked subset
- migrated stale public example reads in hovering-toolbar and tables from
  `editor.selection` to `editor.getSelection()`
- updated `.agents/AGENTS.md` and synced root `AGENTS.md` so future agents do
  not use Playwright mobile viewport or semantic handles as raw-device proof

Commands:

- `command -v adb`
- `command -v appium`
- `command -v xcrun`
- `adb devices`
- `xcrun simctl list devices booted`
- `xcrun simctl list devices available`
- `appium driver list --installed`
- `pnpm install`
- `bun --filter slate-browser test:proof`
- `bun test:release-discipline`
- `bun test:mobile-device-proof`
- `bun test:release-proof`
- `SLATE_BROWSER_SOAK_ITERATIONS=2 bun test:persistent-soak`
- `bunx turbo build --filter=./packages/slate-browser --force`
- `bunx turbo typecheck --filter=./packages/slate-browser --force`
- `bun run lint:fix`
- `bun run lint`

Evidence:

- `bun test:release-proof` passed:
  - release discipline: 129 passed
  - `slate-browser` release/scenario proof: 17 passed, 37 expects
  - scoped mobile proof: semantic/proxy rows cannot satisfy raw mobile IME or
    clipboard claims
- `SLATE_BROWSER_SOAK_ITERATIONS=2 bun test:persistent-soak` passed and wrote
  `../slate-v2/test-results/release-proof/persistent-browser-soak.json`
- `bunx turbo build --filter=./packages/slate-browser --force` passed
- `bunx turbo typecheck --filter=./packages/slate-browser --force` passed
- `bun run lint:fix` and `bun run lint` passed
- local device probe found `adb`, `appium`, and `xcrun`, but no attached Android
  device and no booted iOS simulator/device during this slice

Hypothesis:

- release claims should be enforced as typed artifacts, not inferred from green
  Playwright rows; this prevents viewport/mobile-handle proof from being
  accidentally promoted to raw native device proof

Decision:

- raw Android/iOS keyboard, clipboard, and IME proof is not claimed without
  direct Appium/device artifacts
- persistent-browser soak is now a release gate in `check:full`
- ongoing release discipline is now guarded by a dynamic public-surface scan
  over primary examples plus the existing hard-cut contracts
- `test:mobile-device-proof:raw` is an explicit device-lab gate, not part of
  ordinary local `check:full`, because machines without raw devices would fail
  honestly

Owner classification:

- active owner closed: release-proof hardening for raw-device overclaim,
  persistent-browser soak, and ongoing public API discipline
- remaining owner: actual raw Android/iOS device-lab artifact capture, when a
  machine with attached/booted devices is available

Changed files:

- `../slate-v2/package.json`
- `../slate-v2/packages/slate-browser/package.json`
- `../slate-v2/packages/slate-browser/src/core/index.ts`
- `../slate-v2/packages/slate-browser/src/core/release-proof.ts`
- `../slate-v2/packages/slate-browser/test/core/release-proof.test.ts`
- `../slate-v2/packages/slate/test/public-surface-contract.ts`
- `../slate-v2/scripts/proof/mobile-device-proof.mjs`
- `../slate-v2/scripts/proof/persistent-browser-soak.mjs`
- `../slate-v2/site/examples/js/hovering-toolbar.jsx`
- `../slate-v2/site/examples/ts/hovering-toolbar.tsx`
- `../slate-v2/site/examples/ts/tables.tsx`
- `.agents/AGENTS.md`
- `AGENTS.md`
- `tmp/completion-check.md`
- `docs/plans/2026-04-24-slate-v2-absolute-architecture-closure-plan.md`

Rejected tactics:

- no pretending Playwright mobile viewport proves native mobile keyboard,
  clipboard, or IME behavior
- no adding raw Appium proof to ordinary local `check:full`
- no fixed handpicked example allowlist for stale public API guards
- no model-only or DOM-only proof for cursor/caret release claims

Next action:

- mark `tmp/completion-check.md` done for this release-proof slice and run
  `bun completion-check`

Checkpoint:

- verdict: stop
- harsh take: raw device proof cannot be conjured from a laptop with no
  attached/booted devices; the correct fix is to make overclaiming impossible
  and require direct artifacts for the raw-device lane
- why: scoped release proof, persistent-profile soak, dynamic public-surface
  discipline, build, typecheck, and lint are green
- risks: actual Android/iOS raw-device artifacts still need a device-lab run;
  until then the release claim must stay scoped
- earliest gates: `bun completion-check`
- next move: run completion-check
- do-not-do list: do not mark semantic mobile rows as raw proof, do not remove
  persistent soak from `check:full`, and do not let primary examples reintroduce
  mutable fields or `Transforms.*`
