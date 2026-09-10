# Plite persistent anchor history recovery for Comments

Current execution status: blocked on separate shared Plite integration.
The 80/80 Chromium and 50/50 renderer receipts below describe their recorded
source, not the current checkout: shared Editable owners changed afterward.
Resume requires stable shared source and successful full gates; takeover of
the unrelated integration work has not been authorized.

Objective:

Repair persistent Plite anchors so an anchor that exists before a saved edit
round-trips to its exact geometry through undo and redo. Adopt that law in
Plate Comments so character insertion, partial deletion, complete deletion,
replacement, overlap, and repeated history never delete a thread or silently
detach it from the document.

Completion threshold:

- Planning is complete when the current failure is reproduced, the root owner
  and public API are resolved, the target runtime passes a pre-acceptance scale
  probe, every execution slice has binary proof, and Autogoal's plan checker
  passes.
- Implementation is complete only when the production Plite path passes the
  deterministic matrix, seeded stress oracle, frozen benchmark budgets, package
  checks, and five retry-free Browser replays on the final code state.

Verification surface:

- Plite anchor construction and mapping in
  `packages/plitejs/src/core/anchor.ts` and indexed publication in
  `packages/plitejs/src/core/anchor-state.ts`.
- Plite history ownership in
  `packages/plitejs/src/history/history-extension.ts` and
  `packages/plitejs/src/history/history-state.ts`.
- Plate Comments policy and projection in
  `packages/platejs/src/react/features/comments/CommentsPlugin.ts`.
- Copied Discussion presentation in
  `apps/www/src/registry/components/editor/discussion.tsx`.
- The existing Plite imperative and React text renderers, whose overlapping
  attributes and update lifetimes failed the final regression corpus.
- Unit, property, slow-soak, package, registry, docs, and Browser coverage
  named in the proof matrix below.
- The executable benchmark and two receipts under
  `docs/plans/artifacts/plite-comment-anchor-edit-and-history/`.

Constraints:

- The user accepted this exact plan on 2026-09-03. This pass executes slices
  1 through 7 without changing the approved public call shape or scope.
- Plite owns canonical location mapping and history recovery. Plate may choose
  the Comments policy and presentation, but it may not build a second mapper or
  history stack.
- Application-owned threads, messages, users, permissions, persistence, and
  collaboration remain outside editor and plugin state.
- The public `editor.anchor`, `createCommentsPlugin`, and Comments scoped API
  call shapes stay unchanged. There is no policy option that lets a Comments
  consumer select the destructive behavior.
- Complete deletion may collapse a comment range, because no text remains to
  paint. It must not delete the thread, snap the comment onto unrelated text,
  or position Floating Discussion at the viewport origin.
- Existing overlap, combined Comment/Suggestion Discussion, reply, resolve,
  read-only projection, floating presentation, and follow-up typing behavior
  remain intact.
- No compatibility alias, zero-width leaf renderer, hidden text marker, copied
  range in the application channel, or production telemetry is allowed.

Boundaries:

- In scope: persistent `editor.anchor` Path, Point, and Range values with
  `deletion: "nearest"`; saved local batches; automatic and explicit history
  grouping; undo, redo, branch replacement, history skips, remote mappings,
  release, named roots, overlap, and scale.
- In scope for Plate: Comments uses durable nearest anchors; collapsed comments
  remain reachable through the existing block Discussion trigger; Floating
  Discussion uses that trigger when a text range has no usable DOM rectangle.
- In scope for proof: character insertion at start/inside/end, partial and full
  deletion, replacement, paste, forward/backward ranges, emoji, multi-text-node
  ranges, overlapping ranges, ten undo/redo cycles, and seeded mixed traces.
- Cross-block grouping after an anchor moves to another top-level block is not
  redesigned in this packet. A Browser split/merge smoke is a stop gate: stale
  group ownership requires a separate Plate Discussion subscription plan
  rather than a hidden history workaround.
- Non-goals: Comments visual redesign, sidebar restoration, thread-history
  undo, Suggestions semantics, serialized durable anchors, commit, push, PR,
  or release.

Blocked condition:

Implementation stops if exact recovery requires public history payloads,
application thread snapshots, a global scan of all live anchors for a local
edit, or a production result outside the frozen latency or memory budgets.
Browser inability to exercise native input after one focused environment repair
also blocks a fixed claim; package-only green checks are not a substitute.

Mode:

- One-shot `deep` execution, with performance-observability, browser, and
  package/API proof packs.
- Primary owner: `plite-plan`.
- Plate adoption owner: `plate-plan`.
- Public-shape verdict: `best-api`.
- Execution lifecycle: active Autogoal, test-first product work, and exact
  benchmark/browser closure against this plan.

Linked plans:

- `docs/plans/2026-09-03-comments-render-bounded-regression.md` owns the
  final-verification regressions in displayed comment-body rendering and
  overlapping-decoration parity across the two existing Plite renderers.

Output Budget Strategy:

- Keep the plan as the durable ledger and summarize command output into binary
  evidence rows instead of pasting full logs.
- Run one vertical red/green behavior slice at a time. Preserve only failing
  seeds, minimal traces, benchmark JSON, screenshots, and final command totals.
- Read large source owners in bounded chunks and use targeted searches for
  call sites. Do not dump generated registry output or full package logs.
- If implementation evidence no longer fits this plan cleanly, split only a
  genuinely independent owner into a linked child plan; do not fragment this
  single anchor/history repair by test type.

Harsh verdict:

The previous Comments architecture made the wrong lifetime choice and failed to
test it. It hardcoded `deletion: "drop"` in the accepted design, which permits a
normal edit to destroy the only live range. Switching that one string to
`nearest` is still not a fix: Plite cannot invert lossy anchor mapping, so undo
restores text while leaving the anchor collapsed or shifted. A Plate-only patch
would camouflage a broken editor primitive and fail again in the next feature.

This is one Plite runtime repair with a thin Plate adoption. No new plugin,
public helper, renderer lane, or application store earns its keep.

## Current failure

Stable case ID: `COMMENTS-ANCHOR-LAST-CHAR-HISTORY`.

Live planning reproduction on `/blocks/discussion-demo`:

1. Create a comment on the single character `T` at the start of `This`.
2. Press Backspace at offset 1.
3. The text becomes `his`; the inline comment mark count becomes zero.
4. The application thread remains present and the block trigger count remains
   correct, proving that the thread store did not delete the entity.
5. Floating Discussion resolves a collapsed DOM range and jumps to `(0, 0)`.
6. Undo restores `T`, but the inline mark remains absent.
7. Redo removes `T`; the thread remains reachable only through the block
   Discussion trigger.

The same model-level case fails with `deletion: "nearest"`: `[0, 1]` maps to
`[0, 0]` after deletion and to `[1, 1]` after undo instead of returning to
`[0, 1]`. Partial start and end deletions also drift on undo. Therefore the
destructive Plate option and the non-invertible Plite history behavior are two
distinct defects.

The planning browser session used the local tree based on ref
`a6afd55c30e97c74fe895d1ad005ca75413110f3`. It is red-state diagnostic
evidence, not final-ref proof.

## Source diagnosis

| Fact | Live source | Consequence |
| --- | --- | --- |
| Comments creates inward, dropping anchors | `packages/platejs/src/react/features/comments/CommentsPlugin.ts:241-247` | Deleting the tracked content may permanently resolve the anchor to `null`. |
| Comments does not paint a collapsed intersection | `packages/platejs/src/react/features/comments/CommentsPlugin.ts:284-307` | A fully deleted range correctly has no fake inline highlight. Reachability must come from Discussion. |
| Plite publicly distinguishes `drop` and `nearest` | `packages/plitejs/src/core/anchor.ts:38-66` | Comments can choose durable behavior without adding API. |
| `drop` maps through tracked deleted content | `packages/plitejs/src/core/anchor.ts:190-192` | The current Comments policy is explicitly destructive. |
| Endpoint association is recalculated from the current range | `packages/plitejs/src/core/anchor.ts:591-607` and `packages/plitejs/src/core/change/range-association.ts:3-14` | Once an expanded range collapses, ordinary inverse mapping lacks enough information to reconstruct its former endpoints. |
| Plite already indexes affected live anchors | `packages/plitejs/src/core/anchor-state.ts:354-460` | Recovery capture can stay proportional to affected anchors rather than total anchors. |
| History already owns private branches and mapping journals | `packages/plitejs/src/history/history-state.ts:22-53` and `:231-334` | Runtime recovery belongs beside branch metadata, not in public `Batch`, History JSON, or Plate. |
| Undo/redo is explicitly tagged before history completion | `packages/plitejs/src/history/history-extension.ts:194-265` and `:542-590` | The selected branch recovery can be staged before anchor publication and moved atomically with the branch. |
| Discussion accepts collapsed ranges but returns an empty DOM rectangle | `apps/www/src/registry/components/editor/discussion.tsx:450-496` | The floating popup has a presentation fallback bug independent of thread lifetime. |
| Editable text intentionally emits no zero-length segment | `packages/plitejs/src/react/components/editable-text.tsx:259-285` | Adding a zero-width comment leaf would corrupt the renderer model and is rejected. |
| The earlier accepted plan specified `drop` | `docs/plans/2026-08-31-hard-cut-comments-ownership.md:376-382` | The prior proof matrix missed destructive edits and history; this plan supersedes that policy only. |

## Best API verdict

Public call shape score: **9.5/10 and keep it**. Runtime behavior score today:
**4/10**. Target runtime behavior score: **9.5/10** after exact history and
product proof.

The public code remains:

```ts
const commentsPlugin = createCommentsPlugin({ anchors: channel.anchors });
const anchor = editor.plugin(commentsPlugin).api.createAnchor(range);
```

The only Plate policy change is private:

```ts
editor.anchor(range, {
  association: 'inward',
  deletion: 'nearest',
});
```

No consumer option is added. Comments are durable annotations; exposing
`deletion`, `association`, or history recovery here would let consumers select
the broken product model. Low-level Plite callers retain both deletion policies
for genuinely ephemeral and durable jobs.

Hard-cut counterfactuals:

| Candidate | Verdict | Reason |
| --- | --- | --- |
| Fix only Plate with a range cache | delete | It duplicates canonical mapping and cannot compose with history, roots, or collaboration. |
| Put range snapshots in `CommentsChannel` | delete | It moves editor geometry into application data and creates two authorities. |
| Add a Comments history option or recovery callback | delete | There is one correct durable-comments law and no independent consumer choice. |
| Render zero-width decorated leaves | delete | No text exists to paint; this would add a second renderer path for one broken state. |
| Snap a deleted comment onto neighboring text | delete | It falsely claims that unrelated text was commented. |
| Add a Widget just for collapsed comments | delete | The existing per-block Discussion trigger already owns reachable out-of-flow UI. |
| Keep `drop` and resurrect it on undo | delete | `drop` is intentionally irreversible; resurrection would contradict its contract. |
| Private Plite branch recovery for `nearest` anchors | keep | Only history has the information and lifetime required to invert a lossy edit exactly. |

## Target runtime law

1. Ordinary canonical mapping remains authoritative between edits.
2. A persistent `nearest` anchor that exists before a saved local history batch
   records exact before and after geometry for that batch when it is in the
   affected-anchor set.
3. Undo restores the recorded before geometry. Redo restores the recorded after
   geometry. Ten or one hundred cycles produce no drift.
4. Automatic and explicit history grouping compose one record: the earliest
   before value and latest after value survive for each runtime anchor ID.
5. An anchor created after the original edit has no record in that batch and
   maps normally through undo/redo.
6. Released anchors are never held by recovery metadata. Raw numeric IDs may
   remain until branch pruning, but they cannot retain an anchor or application
   object and are ignored when no live registry entry exists.
7. `drop` anchors keep their existing ordinary lossy mapping and never receive
   exact history recovery. A text-range endpoint may collapse rather than
   become `null`; undo must not resurrect its former geometry.
8. Transaction-local `tx.anchor` values never enter history recovery.
9. History skips and remote changes transform both sides of branch recovery
   through the existing branch mapping journal. They do not create a parallel
   recovery stack.
10. Replacing or restoring History JSON clears private runtime recovery. Runtime
    anchor identity is intentionally not serialized.
11. A full deletion leaves a `nearest` range collapsed at the canonical
    position. Undo restores its exact former range; redo collapses it again.
12. A strict interior insertion expands an existing range. Inward boundary
    insertions remain outside it. Partial deletion contracts it. Canonical full
    replacement attaches to the replacement span and history round-trips both
    states exactly.

## Private design

The design adds no public type. Internally:

- `anchor-state.ts` assigns each persistent anchor a monotonic runtime ID and
  indexes that ID beside the existing listener. The registry owns no additional
  strong reference beyond the already-live listener.
- The existing transaction checkpoint captures the exact before value. Commit
  capture adds the exact after value only for affected persistent `nearest`
  anchors.
- Recovery values are encoded as compact root-local document positions plus
  kind, direction/mode flags, and runtime ID. The target upper bound is 28 bytes
  per affected anchor per retained batch. Do not allocate one object graph per
  anchor snapshot.
- A private recovery packet is associated with the immutable history branch,
  never the public `Batch`. Every branch constructor, clip, merge, resolve,
  mapping, undo/redo transfer, redo discard, schema reset, and clear operation
  preserves or releases it with the owning branch.
- Before a historic update publishes anchors, the History extension stages the
  selected branch packet. Anchor publication performs normal mapping, then
  applies exact recovery inside the same anchor transaction before subscribers
  observe the commit. The History commit handler moves the packet to the other
  branch with the inverted batch.
- Applying recovery reconstructs the public value, internal point/path state,
  stable node keys, and listener index against the current document. Updating
  only the returned range would make the next edit drift and is forbidden.
- `getHistory()` and History JSON expose the same public values as today. Private
  recovery survives internal branch materialization but is omitted from public
  snapshots and codecs.
- Existing `observeAnchorStateWork` test diagnostics gain recovery-entry and
  recovery-byte counters. They contain counts only; no text, paths, thread IDs,
  or application data enters telemetry.

The key invariant is atomicity: no subscriber may observe the wrong mapped
range between ordinary mapping and historic recovery.

## Plate adoption

- Change `createAnchor` in `CommentsPlugin.ts` from `drop` to `nearest`.
- Keep `decorate` unchanged: a collapsed range has no inline text segment.
- Keep thread ownership and all Comments public methods unchanged.
- In copied `discussion.tsx`, register each mounted block trigger privately in
  the existing Discussion store and unregister it on unmount.
- When the active comment DOM range has no rectangle with non-zero width or
  height, resolve the active item's block and return that trigger's rectangle
  from the existing virtual anchor. Never return `(0, 0)` while a mounted block
  trigger exists.
- Subscribe the open popover to the active comment's range through the existing
  editor runtime selector, limited to the active ID. Do not rescan every thread
  on every commit.
- Preserve the combined suggestion/comment ordering and exact current card
  design. This packet changes lifetime and fallback positioning, not styling.

## Scale contract

User-facing operations: one saved edit, undo, and redo. Current owners are
Plite anchor publication plus Plite History. The proposed incremental owner is
compact recovery capture/application inside those same phases.

Frozen cohorts:

| Cohort | Nodes | Live anchors | Affected anchors | Purpose |
| --- | ---: | ---: | ---: | --- |
| Normal overlap | 1 | 10 | 10 | Typical overlapping review thread. |
| Large distributed | 1,000 | 1,000 | 1 | Proves a local edit does not scan all anchors. |
| Stress distributed | 10,000 | 10,000 | 1 | Exposes total-anchor fan-out. |
| Pathological overlap | 1 | 10,000 | 10,000 | Measures the unavoidable all-affected ceiling. |

Frozen budgets, declared before target measurement:

- Target warm p95 for each edit, undo, and redo cohort is at most 100 ms.
- Target warm p95 is also at most
  `max(current p95 * 1.25, current p95 + 5 ms)` for the matched lane.
- Recovery work visits no more than the existing affected-anchor set.
- Compact payload is at most 28 bytes per affected anchor per retained batch.
- At history depth 100, the raw pathological recovery payload is at most 28 MB.
  Released anchors and discarded/pruned branches retain no object references.
- First-action cold time is recorded as a diagnostic, not used to loosen a warm
  gate. The two planning runs ranged from 5.2 ms to 132.0 ms; the 132.0 ms
  single-shot stress redo is inconclusive and is not accepted as a target
  claim. The production rerun must resolve it with repeated cold samples.

Pre-acceptance command:

```sh
bun docs/plans/artifacts/plite-comment-anchor-edit-and-history/benchmark-anchor-history-recovery.ts \
  --output=docs/plans/artifacts/plite-comment-anchor-edit-and-history/benchmark-anchor-history-recovery-final.json
```

The command was repeated into
`benchmark-anchor-history-recovery-final-repeat.json` without changing cohorts
or budgets.

Pre-acceptance result:

| Receipt | Highest target warm p95 | Pathological edit / undo / redo p95 | Correctness | Budget |
| --- | ---: | --- | --- | --- |
| `benchmark-anchor-history-recovery-final.json` | 81.091 ms | 30.165 / 28.262 / 28.537 ms | current nearest fails; prototype exact | all 12 comparisons pass |
| `benchmark-anchor-history-recovery-final-repeat.json` | 79.156 ms | 29.547 / 31.104 / 33.197 ms | current nearest fails; prototype exact | all 12 comparisons pass |

The prototype applies the compact journal around the real current Plite
edit/history path. It proves the owner and upper-bound bookkeeping are viable;
it is not production correctness proof.

Production execution replaced that prototype with the actual branch recovery
path and kept every budget unchanged:

| Receipt | Highest target warm p95 | Pathological edit / undo / redo p95 | Grouped-edit p95 / relative cap | Correctness | Budget |
| --- | ---: | --- | --- | --- | --- |
| `benchmark-anchor-history-recovery-final.json` | 79.604 ms | 9.774 / 9.353 / 10.611 ms | 22.930 / 26.102 ms | exact | all 12 comparisons pass |
| `benchmark-anchor-history-recovery-final-repeat.json` | 59.114 ms | 8.075 / 14.275 / 9.023 ms | 20.639 / 25.739 ms | exact | all 12 comparisons pass |

Both receipts retain exactly 1,000,000 compact records at the depth probe:
28,000,000 bytes for 10,000 affected anchors across 100 batches. Releasing the
anchors before the next commit records zero visited anchors, entries, and
bytes. Each receipt includes five cold samples per lane and the same SHA-256
fingerprints for all production owners, tests, and the benchmark harness.

## Stress and correctness matrix

Deterministic table cases:

| Dimension | Cases | Required result |
| --- | --- | --- |
| Anchor kind | Path, Point, forward Range, backward Range | Every live `nearest` anchor returns to exact before/after values. |
| Text edit | insert start/inside/end; delete start/middle/end/all; replace; paste | Ordinary mapping follows association; history is exact. |
| Text shape | ASCII, emoji/grapheme, marks, inline boundary, two text nodes | No invalid point, path, direction flip, or drift. |
| History | push, automatic merge, explicit merge, skip, branch after undo, clear, restore | Recovery follows the owning branch and is discarded with it. |
| Structure | split, merge, move, remove/restore node; named root | Core anchors remain valid and exact through history. |
| Lifetime | release before undo; create after edit; abort transaction; editor cleanup | No resurrection, retained listener, or stale ID collision. |
| Multiplicity | disjoint, nested, identical, and 10,000 overlapping anchors | Correct values and affected-only work. |
| Repetition | ten and one hundred undo/redo cycles | Zero endpoint drift and stable record count. |
| Collaboration | skipped/remote mapping before undo and before redo | Branch recovery is transformed by the existing mapping journal. |

Seeded property oracle:

- Add a fixed-seed `fast-check` model that generates insert, delete, replace,
  split, merge, undo, redo, release, and create-anchor operations.
- Compare every live anchor with a reference model after each operation.
- Persist the seed and shrunk trace on failure so the exact case replays in a
  focused test.
- Extend `history-soak-contract.slow.ts` with anchor values, valid-location
  checks, no-drift cycles, and record/listener cardinality assertions.
- Do not accept a soak that only proves document equality; the current suite is
  green while this bug exists.

Browser matrix on `/blocks/discussion-demo`:

| Case | Action | Required end state |
| --- | --- | --- |
| Last character | Comment one character; delete; undo; redo | Delete keeps thread and block count; undo restores exact highlight; redo returns to collapsed reachable thread. |
| Interior edit | Insert and delete inside two overlapping comments | Both highlights map correctly and clicking overlap opens both cards in current order. |
| Boundary edit | Type immediately before and after an inward range | New boundary text is excluded and thread remains attached. |
| Replacement | Replace all commented text and undo/redo | Replacement remains attached; history restores each exact state. |
| Follow-up input | Reply before and after delete/undo/redo, then type in editor | Reply state, focus, caret, and editor input remain usable. |
| Collapsed popup | Open a fully deleted comment | Popup anchors to its block trigger, never the viewport origin. |
| Mixed Discussion | Exercise an attached suggestion comment and ordinary comment | Combined Discussion semantics and card design remain unchanged. |
| Structural smoke | Split and merge a block containing an active comment | Comment and suggestion groups follow their owning blocks through both edits. |

The final last-character, overlap, collapsed-popup, focus, and follow-up-input
cases run five times without retries in Chromium. Browser proof records model,
DOM, caret/focus, popup rectangle, block count, thread count, console errors,
and a final screenshot after the interaction. `/docs/comment` and
`/view/editor-ai` receive smoke replays to reject demo and layout regressions.

## Execution slices

| Slice | Owner | Product scope | Entry | Exit | Required proof |
| --- | --- | --- | --- | --- | --- |
| 1. Red contracts | Plite tests, Plate Comments tests, Browser spec | Add exact failing model, property seed, and product case before runtime edits. | Current green suite plus reproduced live failure. | New focused cases fail for the diagnosed reasons. | Failure messages show range drift/thread paint/popup origin, not fixture errors. |
| 2. Atomic Plite recovery | Plite core and history | Runtime IDs, compact packets, branch composition/mapping, staged atomic restore, counters, cleanup. | Slice 1 is red. | All deterministic and property cases pass without public API or codec changes. | Focused Bun tests, React annotation tests, slow soak, typecheck, public types. |
| 3. Plate policy | `platejs/comments/react` | Hardcode `nearest`; keep scoped API and Decoration behavior. | Plite exact recovery is green. | Package Comments cases pass for partial/full edits and overlaps. | `test:partition:comments-react` and `typecheck:partition:comments-react`. |
| 4. Discussion fallback | Copied registry Discussion | Register block triggers, reactive active range, valid virtual rectangle; preserve design. | Collapsed thread is durable. | Collapsed active comment opens at its block trigger; no new presentation. | Focused component tests and Browser matrix. |
| 5. Production scale | Benchmark owner | Replace proxy lane with actual recovery and add repeated cold sampling. | Production implementation complete. | Both unchanged-budget receipts pass twice; counters and heap/cardinality are bounded. | Script receipts, source hashes, current/target correctness guards. |
| 6. Docs and release artifacts | Docs/package/registry owners | Teach exact nearest-history behavior; add package changesets and registry changelog. | Behavior and API are final. | Current-state docs match source in English and Chinese. | Docs checks, two patch changesets, registry changelog check. |
| 7. Final closure | Plite/Plate/WWW | Generate registry output, run focused and full checks, fresh Browser process. | All prior slices green. | No P1 review finding and all final proof is fresh. | Commands below plus 5/5 browser ledger. |

Implementation file targets:

- `packages/plitejs/src/core/anchor.ts`
- `packages/plitejs/src/core/anchor-state.ts`
- the smallest private internal export owner required by History
- `packages/plitejs/src/history/history-state.ts`
- `packages/plitejs/src/history/history-extension.ts`
- `packages/plitejs/test/anchor-contract.ts`
- `packages/plitejs/test/range-anchor-contract.ts`
- a focused history-anchor contract under `packages/plitejs/test/history/`
- `packages/plitejs/test/history/history-soak-contract.slow.ts`
- `packages/plitejs/test/react/annotation-store-contract.tsx`
- `packages/platejs/src/react/features/comments/CommentsPlugin.ts`
- `packages/platejs/src/react/features/comments/CommentsPlugin.spec.tsx`
- `apps/www/src/registry/components/editor/discussion.tsx`
- its focused component test and `apps/www/tests/browser/comment.spec.ts`
- current Plite anchor docs and Comments/Discussion docs in both locales
- generated registry output only through `pnpm --filter www build:registry`

No public barrel change is planned. If implementation adds a file under a
generated export tree or changes an export, run `pnpm brl` and include its
generated output; otherwise record the source audit proving no impact.

## Exact execution proof

Focused commands:

```sh
bun test --preload ./config/plite-source-test-setup.ts \
  ./packages/plitejs/test/anchor-contract.ts \
  ./packages/plitejs/test/range-anchor-contract.ts \
  ./packages/plitejs/test/history/document-state-history-contract.ts \
  ./packages/plitejs/test/history/anchor-history-contract.ts
pnpm --filter plitejs exec vitest run --config ./vitest.config.mjs \
  test/react/annotation-store-contract.test.tsx
pnpm --filter platejs test:partition:comments-react
pnpm --filter platejs typecheck:partition:comments-react
pnpm --filter plitejs typecheck
```

Slow, package, and browser commands:

```sh
bun test --preload ./config/plite-source-test-setup.ts \
  ./packages/plitejs/test/history/history-soak-contract.slow.ts
pnpm check:plite:dev
pnpm check:plite
pnpm --filter www build:registry
pnpm --filter www test:www-browser:chromium \
  tests/browser/comment.spec.ts
pnpm check
```

The Browser command runs against a fresh relevant dev server. Final evidence
must include the exact ref and SHA-256 fingerprints for product source, tests,
fixtures, and benchmark harness. Local uncommitted execution may be called a
candidate only; fixed/completed wording requires a fresh clean process at the
final pushed ref or immutable CI artifact.

Release artifacts:

- One patch changeset for `plitejs`: persistent nearest anchors round-trip
  exactly through saved history.
- One patch changeset for `platejs`: Comments keep durable anchors through
  destructive text edits.
- One registry changelog entry for the Discussion collapsed-range fallback.
- Load and follow `changeset`, `registry-changelog`, and `docs-creator` during
  execution. No version minor bump is allowed for these core packages.

## Decision ledger

| Surface | Current | Target | Owner | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Comments deletion policy | `drop` | hardcoded `nearest` | Plate Comments | one internal line | package + Browser | collapsed state has no inline paint | change |
| History inversion | ordinary remapping only | exact private branch recovery | Plite History | all persistent nearest anchors | matrix + property + soak | atomic ordering and branch mapping | change |
| Recovery storage | absent | compact private branch packet | Plite History state | branch constructors and lifecycle | bytes/cardinality tests | retained memory at pathological depth | change |
| Anchor lookup | listener sets and node-key index | same index plus runtime ID | Plite anchor state | affected listeners only | 1/1,000/10,000 cohorts | accidental global scan | extend |
| Public anchor API | deletion and association options | unchanged | Plite | none | public types/docs | semantic behavior correction | keep |
| Comments public API | factory plus scoped methods | unchanged | Plate | none | type inference tests | consumer option creep | keep |
| Collapsed inline paint | absent | absent | Plate Decoration/Plite renderer | none | DOM negative assertion | fake zero-width marker | keep |
| Collapsed popup position | empty viewport rect | block-trigger fallback | copied Discussion | private trigger registry | component + Browser | stale DOM node | change |
| Thread data | application channel | unchanged | application | none | reply/resolve/thread assertions | duplicate range authority | keep |
| Cross-block regrouping | unproven after structure edits | stable node-key groups follow live anchor/review ranges | Plate Discussion | no new owner | split/merge Browser smoke | hidden scope expansion | passed |
| Trigger accessibility label | live ordinal read from render-time `renderPath` | stable “this block” label | copied Discussion | remove the unstable ordinal | split/merge Browser smoke | path-wide subscription fan-out | change |

## Proof matrix

| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| The bug is a Plite substrate failure | nearest model case restores `[1,1]`, not `[0,1]` | 70 focused core/history contracts pass | verified |
| Plate also chose a destructive policy | `CommentsPlugin.ts:241-247` uses `drop` | 11 Comments package assertions pass with `nearest` | verified |
| Thread storage does not delete the entity | live thread and block count survived deletion | 80/80 final Browser cases keep edit, reply, resolve, and trigger behavior | verified |
| No new public API is needed | existing factory and anchor options express the call | strict public types and zero export change pass | verified |
| Recovery can scale | both 10k feasibility receipts passed | both production receipts pass all 12 comparisons | verified |
| Distributed work is local | 10k live / 1 affected target stayed under the frozen gate | visited/recovered counter equals the affected set | verified |
| Pathological memory is bounded | prototype was 280 KB per 10k-affected batch and 28 MB at depth 100 | production records exactly 28 MB and zero work after release | verified |
| Collapsed comments remain reachable | existing block trigger retained count | component fallback plus repeated Browser geometry pass | verified |
| Current unrelated contracts are green | baseline suites passed | Comments proof passes; latest strict Plite stops in two focus fixtures after the shared DOM runtime change, and root lint stops in concurrent DOM/schema files | blocked on shared Plite integration |

Start Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Requirements captured | yes | Character insertion/deletion, undo/redo, harsh ownership review, stress coverage, and planning-only boundary are explicit above. |
| Current owners read | yes | Anchor, anchor-state, range association, History, Comments, Discussion, renderer, docs, and focused tests were traced from live source. |
| Best API resolved | yes | Keep the existing public calls; add no option, helper, plugin, or renderer lane. |
| Runtime scale applies | yes | Every saved document edit maps affected persistent anchors and history may retain 100 batches. |
| Pre-acceptance probe | yes | Two matched real-Plite/prototype receipts pass all 12 warm comparisons each. |
| Correctness guard | yes | Current nearest behavior fails exact history; prototype before/after restore passes. |
| Browser case | yes | `COMMENTS-ANCHOR-LAST-CHAR-HISTORY` reproduced thread survival, paint loss, history drift, and popup origin. |
| Package boundary | yes | Published `plitejs` anchor behavior, published `platejs/comments/react`, and copied registry Discussion all change behavior. |
| Release artifacts | yes | Two patch changesets plus one registry changelog entry are required. |
| Barrel impact | no planned impact | No public export is added; execution audits and runs `pnpm brl` only if exported topology changes. |
| Production detector | test-only | Extend count-only anchor work diagnostics; no production telemetry or content payload. |
| Execution authority | yes | The user said `ok go` on 2026-09-03 after reviewing this plan. |

Work Checklist:

- [x] Captured every explicit requirement and stop condition.
- [x] Diagnosed the exact model, history, Plate policy, and presentation failures.
- [x] Assigned one owner to canonical mapping, history, product policy, UI, and application data.
- [x] Ran the hard-cut counterfactual and rejected all duplicate public/runtime layers.
- [x] Resolved the public API to one unchanged call shape.
- [x] Defined exact ordinary-edit and history laws, including collapse and release.
- [x] Defined branch merge, skip, remote mapping, clear, restore, and cleanup behavior.
- [x] Fixed normal, large, stress, and pathological benchmark cohorts and budgets.
- [x] Ran two pre-acceptance receipts with edit, undo, redo, cold diagnostics, bytes, and correctness.
- [x] Defined deterministic, property, soak, package, Browser, and regression proof.
- [x] Preserved application-owned threads and current Discussion product semantics.
- [x] Classified package changesets, registry changelog, docs, generated registry, and barrel impact.
- [x] Recorded the exact execution order, commands, and blocking gates.
- [x] Recorded failed harness attempts without treating them as product evidence.
- [x] Prepared and approved the execution handoff before product work began.

Implementation Work Checklist:

- [x] Add and observe the focused red exact-history anchor contract.
- [x] Implement affected-only persistent-nearest recovery in Plite core and History.
- [x] Pass Path, Point, forward/backward Range, grouping, branch, skip, remote,
  release, clear, restore, named-root, and repeated-cycle contracts.
- [x] Add and pass the fixed-seed property oracle and slow anchor/history soak.
- [x] Switch Plate Comments from destructive `drop` anchors to durable `nearest`
  anchors without changing its public API or collapsed-decoration behavior.
- [x] Make Floating Discussion use the owning block trigger for a collapsed
  active comment without changing the current card design or combined ordering.
- [x] Pass focused Plite, Plite React, Plate Comments, and registry component tests.
- [x] Rerun the frozen production scale cohorts twice, including repeated cold
  samples, affected-only counters, recovery bytes, and depth/cardinality bounds.
- [x] Add two patch changesets, the registry changelog row, and current-state
  English and Chinese docs through their owning workflows.
- [x] Generate registry output and pass `check:plite:dev`, strict `check:plite`,
  registry build, and focused Browser proof.
- [x] Correct lost overlapping attributes and fallback-renderer update
  lifetimes, using the same DOM contract for both existing renderer modes.
- [ ] Pass final full `pnpm check` and strict Plite proof after the last
  renderer edit; current shared Plite integration failures block closure.
- [x] Refresh both scale receipts after the final browser-test setup change;
  all 13 recorded production/test/harness fingerprints match the current files.
- [ ] Refresh five retry-free Browser replays plus `/docs/comment` and
  `/view/editor-ai` smokes after shared Editable source stabilizes. The recorded
  passing runs are historical after the post-proof source changes.
- [x] Run the Best API repair audit, reaffirm existing Vision doctrine, and
  prove no stale worker teaching or public export drift.

Completion Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Binary plan readiness | yes | Every decision has one target, owner, adoption path, proof, and failure condition. |
| Fresh source evidence | yes | All decision-changing claims were re-read from the current checkout. |
| Best API review | yes | Public calls and exports remain unchanged; wrong policy is private. |
| Pre-acceptance scale proof | yes | Both final receipts accept the owner under frozen budgets. |
| Production scale rerun | passed | Two refreshed actual-path receipts pass all 12 comparisons, grouped edits, and depth/release bounds; every recorded source fingerprint matches. |
| Correctness coverage | source replay required | 73 core/history/soak and 11 Plate Comments tests passed. The 80/80 Chromium and 50/50 DOM receipts passed on their recorded inputs; shared Editable source changed afterward and requires replay. |
| Package proof | blocked outside Comments | Full root check passed before the shared DOM/schema migration; current 85 Plite typecheck tasks pass. Strict React proof has 1,122 passing tests and two failing focus fixtures; root lint stops on concurrent DOM/schema changes. |
| Release proof | passed | Two patch changesets, registry changelog, bilingual current-state docs, and generated registry output validate. |
| Planning review | yes | Harsh verdict, strongest rejected alternatives, risk caps, and one final architecture are recorded. |
| P1 autoreview | not applicable on this checkout | Repo policy forbids `autoreview` on `next`; direct source review, exact tests, Browser proof, and `pnpm check` own closure. |
| Goal plan checker | incomplete | Executed: final closure remains in progress; the linked Regression plan correctly remains incomplete on strict/root integration gates. |
| Handoff | yes | The final section states ownership, target, evidence, risk, and the remaining external gate. |

Phase / pass table:

| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Exact Browser and model failures plus live source ownership trace. | None. |
| Decide | complete | Plite private branch recovery and unchanged public API selected. | None. |
| Prove architecture | complete | Two 10k edit/undo/redo feasibility receipts pass frozen budgets. | None. |
| Prepare execution | complete | Slices, tests, commands, release artifacts, and blockers are concrete. | None. |
| Product implementation | complete | Exact private recovery, Plate adoption, Discussion fallback, docs, and release artifacts are implemented. | None. |
| Final closure | in_progress | Prior Comments and renderer receipts passed; shared source changed afterward. Benchmark inputs remain unchanged. | Complete the shared Plite integration outside Comments, refresh source-bound proof, rerun repository/strict gates, and close both plans. |

## Conditional evidence

- External research is not required: this is a reproduced local runtime law
  with complete source ownership and an executable target probe.
- Public issue/PR provenance is not applicable: the report is local and no
  public mutation is requested.
- Vision already assigns persistent anchors and history to Plite and keeps
  application comment entities outside plugin state. No Vision edit is needed.
- Cross-block Discussion regrouping passed the named structural smoke. The
  smoke exposed only a stale ordinal derived from render-time `renderPath`.
  The trigger uses a stable “this block” label instead of adding a path-wide
  subscription.

## Error attempts

| Attempt | Count | Correction | Result |
| --- | ---: | --- | --- |
| First benchmark paired one-entry and 10k-entry lanes with unstable ordering | 1 | Shared one editor, alternated lane order, averaged repeated actions, then repeated the entire receipt | Two stable accepting receipts. |
| Initial focused Bun command passed a React test through the non-React preload | 1 | Routed React contracts through the package Vitest runner | 1,118 React tests passed. |
| Bun paths without `./` were parsed as unmatched name filters | 1 | Re-ran with explicit relative paths | 39 focused Plite tests passed. |
| Initial production depth probe included unreclaimed setup allocations | 1 | Forced collection before and after the measured history depth | Raw recovery stays exactly at the frozen 28 MB bound. |
| First seeded model built history with no active selection | 1 | Gave the generated edit an explicit root location | The deterministic seed replays the intended state transitions. |
| Structural Browser smoke expected live block ordinals from `renderPath` | 1 | Verified the groups were correct, then removed the unstable ordinal instead of subscribing every shifted block | Split and merge keep comment and suggestion groups correct with stable labels. |
| New remote structural range, Path, and child-boundary cases exposed identity misses | 2 | Mapped skipped moves by unchanged source-node identity and taught boundary Paths to follow their unchanged parent | All focused history contracts pass. |
| First 35-case Browser replay relied on stale post-composer selection | 1 | Physically placed and verified the caret, then asserted exact editor text instead of a permissive substring | Full deletion passed 10/10 alone and the complete destructive matrix passed 35/35. |
| One production receipt ran beside another session's Playwright workers | 1 | Kept the frozen cap, recorded its 24.675 ms versus 24.429 ms grouped-edit miss, then required two uncontended full reruns | Both final receipts pass every unchanged absolute and relative budget. |
| Root lint/check reached unrelated text-flow files | 5 | Ran scoped formatting plus root typecheck and `test:all` independently; did not rewrite another session's work | Scoped lint and all typechecks pass; global lint remains red across 47 external files while the owning task is active. |
| Final root `test:all` found a concurrent code-block export mismatch | 1 | Traced `BaseCodeLinePlugin` consumers to its mid-refactor owner and kept Comments scope isolated | 676 fast and 187 primary slow tests pass; five unrelated registry slow files fail at module load. |
| Final render-bounded case reported two text renders after an app-only reply | 1 | Traced every profiler owner and identified the two displayed nested comment-body editors; rejected the proposed Plite memo patch | Static body rendering restores zero editor-text work without changing Plite or public API. |
| AI browser cases lost setup-only selection | 2 | Replaced an unclaimed multi-event pointer setup with deterministic native keyboard selection, waited for seeded client state, and closed the prior popover | The affected pair passes 20/20 with retry zero. |
| `www` typecheck OOM was initially attributed to static comment bodies | 4 controls | Compared cold static and plain versions under the same Node 22 runtime with incremental state disabled | Static rendering adds only 275 types, 7,008 instantiations, and under 1 MB to the existing 8.56 GB graph; exact `www` typecheck passes with a 12 GB heap. |
| Final 16-case browser replay shared the checkout with active code-block writers | 1 revoked run | Captured Next's module-not-found overlay while the migrations barrel and targets changed, froze Comments bytes, and enforced Regression's no-shared-host-writer law | No product attempt increment; full count restarts on a quiescent, restarted host. |
| Frozen Comments corpus lost one overlapping ID before edits | 1 red run | The imperative renderer merged independent attributes onto one span; preserve one ordered wrapper per decoration | Frozen 11/16 red became 16/16 green; the final shared DOM contract covers both renderers. |
| Fallback renderer failed the shared update contract | unit red | React mutations were unclaimed and the decorated-to-plain transition read stale props; reuse the existing commit-claim hook and live-text reader | Both renderer modes pass attribute refresh, text insertion/deletion, ten history cycles, full deletion/undo, and source removal/reappearance. |
| Root generated entrypoint state was stale | 1 | Regenerated from the canonical entrypoint manifest without changing product behavior | 17/17 generator tests and the complete root `pnpm check` passed. |
| Strict browser source watcher detected `editor-schema.ts` changing after unit 58 | 1 revoked run | Preserved passing package stages; invalidated browser proof instead of claiming a mixed-source pass | Strict rerun required after the shared DOM/schema migration settles. |
| Shared DOM/schema migration left consumers behind | integration gate | Runtime-field, clipboard, example, and immediate-JSDoc mismatches were corrected in shared source; regenerate API references from that source | The DOM public-surface contract passes 16/16. Strict proof then stops in two focus fixtures; root lint reports 19 formatting files and 15 diagnostics outside this Comments patch. |

Verification evidence:

- Focused Plite core/history: 70 passed, including 31 exact anchor-history
  contracts and two generated state models.
- Plite React annotation wrapper: 12 passed. Plate Comments: 11 passed.
  Discussion component fallback: 1 passed. Slow anchor/history soak: 3 passed.
- Earlier strict checkpoint: 85 typecheck tasks, 134 package-test tasks, 232
  tooling contracts, 25 benchmark contracts, and 711 Chromium cases passed
  with 8 fixture-declared skips. This is historical evidence, not a green
  claim for the later shared DOM/schema migration.
- Final Comments Browser receipt: all 16 cases pass five times, 80/80 with
  retry zero. This includes overlap, full deletion/history, interior edits,
  inward boundaries, replacement, split/merge, reply/resolve, app-only render
  containment, AI review, layouts, and bilingual docs.
- Final both-mode DOM receipt: 50/50 tests pass across five fresh processes;
  its 46-input digest exactly matches the complete Browser receipt.
- The final refresh after shared DOM adoption passes 80/80 Chromium cases in
  4.1 minutes and 50/50 DOM cases. Both receipts bind digest
  `sha256:2f8450f63ab1e2e8550684c448640be37c779c8fa392737c88637f232980a6f4`;
  the browser command names the exact Discussion route and starts on a fresh
  host after the latest recorded input.
- Fresh Browser: `/blocks/discussion-demo`, `/docs/comment`, and
  `/view/editor-ai` render; the docs example exposes two triggers, the AI view
  shows two comments plus three suggestions, toolbar/editor widths match, and
  the browser error log is empty.
- Refreshed benchmark receipt 1: all 12 comparisons pass; highest target warm
  p95 is 79.604 ms. Grouped edit is 22.930 ms under a 26.102 ms relative cap.
- Refreshed benchmark receipt 2: all 12 comparisons pass; highest target warm
  p95 is 59.114 ms. Grouped edit is 20.639 ms under a 25.739 ms relative cap.
- Both receipts record exactly 28,000,000 recovery bytes at depth 100 and zero
  recovery work after anchor release. Their source fingerprint maps are equal
  and pin ref `a6afd55c30e97c74fe895d1ad005ca75413110f3` plus all 13 production,
  test, and harness files. Receipt SHA-256 values are
  `76f7a5fde3ad2e354419a242c6572827e2850f7573723d803fef55c1349180b7`
  and `53a9f6aeb8241e77b15b577f2c73cce98db9cb0e64c602d298c9f48d7a6c6dd7`.
- Final live Browser screenshots have SHA-256 values
  `30761408c1968348ec8b9bd8848bb15f2b30a1d94dd1002b843eb47f14685cfb`
  for `discussion-demo-final.png` and
  `acb30b75c33a23d6bb4c6e4fc415a9600ba6ab17adf8fcebcf57487f9c5118d7`
  for `editor-ai-final.png`.
- Registry generation, docs source parity, registry changelog parity, scoped
  ordinary/type-aware lint, whitespace checks, root typecheck, 676 fast tests,
  and 187 primary slow tests pass.
- The complete root check passed with a 12 GB heap before later shared-source
  changes. The latest strict rerun passes all 85 typecheck tasks and 1,122
  React tests, but two fixtures in
  `packages/plitejs/test/react/focus-plite-editable-contract.test.ts:104`
  and `:127` fail during DOM coverage initialization with
  `Editor runtime has not been initialized`. Root lint reports 19 formatting
  files and 15 diagnostics in concurrent DOM/schema owners. The earlier
  clipboard, example, and JSDoc blockers have been adopted in shared source.
  Logs: `/tmp/comments-proof.tQejMB/strict-plite-current.log` and
  `/tmp/comments-proof.tQejMB/root-check-current.log`.
- Registry generation briefly invalidated the dev server's cached registry
  import. The final proof host was restarted after generation and shared
  source changes. Live `/view/editor-ai` opens all five combined items with
  both seeded comment replies; its screenshot is refreshed above.
- Current www typecheck passes all five tasks in 3 minutes 4 seconds with a
  12 GB heap, including editor/API reference, docs, registry, and route checks.
  Log: `/tmp/comments-proof.tQejMB/www-typecheck-current.log`.
  No default-heap cold www typecheck is claimed.

The earlier Comments ownership plan is historical evidence and is not
sufficient for this repair.

## Browser proof receipt

| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| COMMENTS-ANCHOR-LAST-CHAR-HISTORY | 2 | candidate-local | "/usr/bin/env" "PLAYWRIGHT_BASE_URL=http://localhost:3000/blocks/discussion-demo" "pnpm" "--filter" "www" "test:www-browser:chromium" "tests/browser/comment.spec.ts" "--repeat-each=5" | pass: exit 0 in 247628ms | dirty:a6afd55c30e97c74fe895d1ad005ca75413110f3 | sha256:2f8450f63ab1e2e8550684c448640be37c779c8fa392737c88637f232980a6f4 | 46 | apps/www/playwright.config.ts,apps/www/src/components/site-registry/floating-popover.tsx,apps/www/src/components/site-registry/provider.tsx,apps/www/src/registry/bases/base/floating-popover.tsx,apps/www/src/registry/bases/radix/floating-popover.tsx,apps/www/src/registry/components/editor/basic-marks-static.tsx,apps/www/src/registry/components/editor/comment-toolbar-button.tsx,apps/www/src/registry/components/editor/comment.tsx,apps/www/src/registry/components/editor/discussion.tsx,apps/www/src/registry/components/editor/editor.tsx,apps/www/src/registry/components/editor/plugins-static.ts,apps/www/src/registry/components/editor/plugins.ts,apps/www/src/registry/components/editor/suggestion.tsx,apps/www/src/registry/examples/discussion-demo.tsx,apps/www/src/registry/examples/values/suggestion-value.tsx,apps/www/tests/browser/comment.spec.ts,apps/www/tsconfig.json,config/plite-source-test-setup.ts,packages/platejs/src/react/features/comments/CommentsPlugin.ts,packages/plitejs/src/core/anchor-state.ts,packages/plitejs/src/core/anchor.ts,packages/plitejs/src/core/editor-schema.ts,packages/plitejs/src/dom/plugin/dom-editor.ts,packages/plitejs/src/dom/plugin/dom-integrity-observer.ts,packages/plitejs/src/dom/plugin/dom-root-runtime.ts,packages/plitejs/src/history/history-extension.ts,packages/plitejs/src/history/history-state.ts,packages/plitejs/src/react/components/editable-text-blocks.tsx,packages/plitejs/src/react/components/editable-text-flow.tsx,packages/plitejs/src/react/components/editable-text.tsx,packages/plitejs/src/react/components/editable.tsx,packages/plitejs/src/react/components/plite-element.tsx,packages/plitejs/src/react/components/plite-leaf.tsx,packages/plitejs/src/react/components/plite-spacer.tsx,packages/plitejs/src/react/components/plite-text.tsx,packages/plitejs/src/react/components/plite-void-shell.tsx,packages/plitejs/src/react/decoration-context.tsx,packages/plitejs/src/react/decoration-source.ts,packages/plitejs/src/react/editable/root-selector-sources.ts,packages/plitejs/src/react/editable/runtime-live-state.ts,packages/plitejs/src/react/hooks/use-claim-editable-dom-commit.ts,packages/plitejs/src/react/render-profiler.ts,packages/plitejs/test/react/decoration-rendering-contract.test.tsx,packages/plitejs/test/react/editable-text-flow.test.ts,packages/plitejs/vitest.config.mjs,packages/test/src/playwright/render-profiler.ts | pid:60186;started:2026-09-03T13:11:15.000Z;base-url:http://localhost:3000/blocks/discussion-demo;browser:Chromium | 2026-09-03T13:09:03.719Z | 2026-09-03T13:12:00.486Z | 2026-09-03T13:16:08.116Z | 0 | sha256:c03dce80318d69ccee1421e12a58014acdb0872e13d387fc76a0f3702b33eb37 |

## Final handoff

- Ownership: Plite History and persistent anchors own exact recovery; Plate
  Comments chooses nearest; copied Discussion owns collapsed popup placement.
- Public API: unchanged. No plugin, helper, store, renderer path, or consumer
  policy is added.
- Runtime: compact affected-only branch recovery; atomic before observers;
  private and non-serialized.
- Product result: partial edits stay attached; complete deletion keeps the
  thread reachable without lying about highlighted text; undo/redo is exact.
- Scale: production passes twice at 10k distributed, 10k overlap, grouped
  history, and depth 100 under the frozen budgets.
- Evidence: final receipts pin every owner and test by SHA-256. Browser
  screenshots are `discussion-demo-final.png` and `editor-ai-final.png` in the
  artifact directory.
- Remaining gate: finish the separate shared Plite integration, then rerun
  root/strict checks and both completion validators. This patch does not
  authorize changes to that migration's unrelated fixtures and examples.

Reboot status:

| Question | Answer |
| --- | --- |
| Where am I? | Goal blocked on shared Plite integration. Comments implementation remains local, but its browser/renderer receipts require refresh after shared Editable changes. |
| Where am I going? | Finish the separate shared Plite integration, then rerun the repository gates and completion validators. |
| What is the governing invariant? | A saved batch and its persistent nearest anchors undo and redo as one exact runtime fact. |
| What was rejected? | Every Plate-only mapper, public option, duplicate store, zero-width renderer, and neighbor-snap workaround. |
| What proves readiness? | Exact model/state stress, strict Plite, repeated Browser proof, two production scale receipts, and source fingerprints. |

Open risks:

- Final completion is blocked by shared Plite focus fixtures and lint,
  not by a failing Comments assertion. Their owning migration must complete
  before the repository-wide gates and plan can close.
- No Git commit, push, PR, integration, or release is authorized or claimed.

## Continuation audit

2026-09-03 13:26 UTC:

- Previous goal turn: progress. It produced fresh 80/80 Chromium and 50/50
  renderer receipts and passed www typecheck after shared DOM adoption.
- Automatic continuation 1: the remaining integration gates did not advance.
  The focused focus contract still returns 6 pass / 2 fail. Its helper at
  `packages/plitejs/test/react/focus-plite-editable-contract.test.ts:68`
  casts a DOM element into an editor; DOM coverage initialization needs a real
  editor runtime. This is separate fixture adoption, not comment-anchor loss.
- Root lint revalidation returns 24 formatting files and 38 diagnostics,
  including additional external-text work outside the Comments boundary.
  Logs: `/tmp/comments-proof.tQejMB/focus-continuation-1.log` and
  `/tmp/comments-proof.tQejMB/lint-continuation-1.log`.
- The current 46-input browser/DOM digest still matches the final receipts.
  Both accepting benchmark receipts still match all 13 recorded inputs.
- Blocking condition occurrence 2 across goal turns: separate shared Plite
  integration remains incomplete, and takeover authorization has not arrived.
  Keep the full goal active. Do not weaken gates or edit those unrelated
  fixtures, runtime features, and examples to manufacture closure.

Automatic continuation 2, 2026-09-03 13:29 UTC:

- Previous continuation: no progress toward closing the remaining gates;
  source checks and failure revalidation did not resolve the scope blocker.
- Focus revalidation still returns 6 pass / 2 fail with the same uninitialized
  runtime error. Root lint returns 26 formatting files and 41 diagnostics.
  Both commands finished with exit 1. Logs:
  `/tmp/comments-proof.tQejMB/focus-continuation-2.log` and
  `/tmp/comments-proof.tQejMB/lint-continuation-2.log`.
- Shared `editable-text-blocks.tsx` and `editable.tsx` changed after the final
  browser receipt ended at 13:16:08 UTC. The observed 46-input digest is
  `sha256:9a565f9716e035451e65d1e6b4ba99775dd948d431db5428ea80f680229325e3`,
  not the recorded `sha256:2f8450f63ab1e2e8550684c448640be37c779c8fa392737c88637f232980a6f4`.
  Preserve the receipts as historical evidence; they do not certify these
  newer shared renderer bytes.
- Blocking condition occurrence 3 across consecutive goal turns. Mark the
  goal blocked, not complete. No authorized product repair remains in this
  packet that can close the unrelated integration gates or stabilize another
  writer's shared source. Resume after that integration is finished or the
  user explicitly authorizes taking it over; keep every original gate.
