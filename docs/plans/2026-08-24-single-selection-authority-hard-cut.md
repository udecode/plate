# Single selection authority hard cut

Objective:
Delete Plate's parallel block-selection subsystem and make Plite's editor
selection the sole state, command, mapping, focus, clipboard, and input authority
for one or many selected nodes. Finish the authority cut by making live node
selection writes path-native and reducing copied node-selection UI to one public
kit with no plugin-shaped public API or hidden DnD dependency.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-24-single-selection-authority-hard-cut.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- none

Mode:
- `standard`: this is a breaking API and ownership cut across Plite, Plate
  packages, copied UI, docs, browser behavior, and release metadata. No external
  editor comparison is needed to decide the owner.

Completion threshold:
- Binary readiness: one selection owner; every current concept has a delete,
  move, or keep verdict; every caller and public break has an adoption slice;
  native focus/input, mapping, serialization, clipboard, history,
  collaboration, and browser laws pass their exact proof gates; all stale public
  package, plugin, namespace, store, hook, command, and docs paths are gone.
- Follow-up readiness: `editor.update.selection.setNodes(paths)` and
  `tx.selection.setNodes(paths)` own live range derivation and validation; all
  eight production writers use that API; copied node-selection UI exports only
  `NodeSelectionKit`, renders without DnD, and teaches no public class protocol.

Verification surface:
- Live selection interfaces/protocol/state/query, Plite DOM/React input owners,
  `packages/selection/**`, Cursor, AI, Table, registry/docs consumers, manifests,
  and `tooling/e2e/node-selection.test.ts`.
- Best API review of one/many node construction, generic selection reads,
  deletion scope, and rejection of block-specific command verbs.
- Focused unit/type/browser rows, strict Plite handoff, authored stale-symbol
  sweeps, barrels, changesets, and CI-generated registry/template closure.

Constraints:
- The user accepted this exact plan and authorized full execution on
  2026-08-24. Do not pause between slices while a safe in-scope move remains.
- No aliases, deprecated exports, dual field shapes, runtime command bridges,
  or shadow selection stores.
- Preserve the common `SelectionApi.node(path, range)` call. Normalize its
  result to canonical `paths`; migrate direct reads of removed `.path`.
- Retain `SelectionApi.node(s)` for detached/static selection construction,
  codecs, protocol internals, and tests. Live editor callers must not assemble
  an aggregate range before writing node selection.
- Preserve native editable focus, IME, history, collaboration mapping, and
  persisted-selection correctness.
- A versioned persisted-selection decoder may migrate serialized v1 `path` to
  v2 `paths`. That is a serialized-data obligation, not a live API shim. New
  runtime values and encodings use only `paths`.
- `templates/**` and `apps/www/public/r/**` are CI-generated. Change their
  sources; do not hand edit their output.
- Current source is authoritative. Earlier plans and memory are leads only.
- Do not commit or push. Preserve the coordinator's frozen lint packet and all
  unrelated checkout bytes; report the exact owned files and proof at the next
  stable checkpoint.

Boundaries:
- In scope: Plite selection types/protocol/queries/commands/mapping/codecs;
  Plite DOM/React focus/input/clipboard; Plate type adoption; Cursor ownership;
  AI, DnD, table, column, math, menu, toolbar, docs, registry, packages,
  changesets, generated owners, and full `@platejs/selection` deletion.
- Owners: Plite owns selection and browser input law; `@platejs/cursor` owns
  cursor state/geometry; copied registry UI owns the one-consumer marquee and
  menu presentation; feature packages own product transforms but read generic
  editor selection.
- Non-goals: universal multi-cursor text editing, disjoint text insertion,
  public marquee machinery, renamed block-selection plugins, new Plate
  selection state, unrelated UX work, or external research.
- Direct Plite owners: `interfaces/selection.ts` owns the value;
  `core/selection-state.ts` stays the only state holder;
  `core/selection-protocol.ts` owns validation/mapping/codec/projections;
  `core/public-state.ts` owns reads/transactions; Plite DOM/React owns native
  projection, focus, input, clipboard, and browser proof.

Output budget strategy:
- Named owners and symbol-bounded caller counts were used. Generated and
  historical output was excluded from the authored inventory.

Blocked condition:
- Implementation stops only if a hard native-input or serialized-data law
  proves canonical multi-node `NodeSelection` cannot replace the shadow store.
  A failed implementation is not permission to restore the plugin; it triggers
  Plite owner repair.

Plate Plan state:
- status: completed
- phase: final_handoff
- next: none
- handoff: implementation and selection proof are complete; the unrelated root
  timing-budget debt is recorded exactly

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Complete package/class/plugin/namespace/store/bridge cut is explicit |
| Active goal and plan verified | yes | Active goal names this artifact and binary threshold |
| Current owners read | yes | Live owners and callers are recorded below |
| Best API target resolved | yes | Cardinality-aware `NodeSelection`; common one-node call preserved; no block commands or universal wrapper |
| Mode and execution boundary resolved | yes | Accepted one-shot execution; no slice pauses |

Work Checklist:
- [x] Accepted outcome, scope, non-goals, constraints, owners, and API target are concrete.
- [x] Implement canonical `NodeSelection.paths`, constructors, validation, mapping, codec, and generic queries.
- [x] Make Plite commands, React/DOM focus, input, clipboard, and selection hooks multi-node aware.
- [x] Move Cursor overlay ownership to `@platejs/cursor` with no block-store dependency.
- [x] Migrate Core, AI, Table, Utils, copied registry UI, examples, mocks, and package metadata.
- [x] Delete `@platejs/selection`, block/menu plugins and keys, `SelectionArea`, shadow input, command tags, exports, dependencies, tests, and docs.
- [x] Write required package changesets and registry changelog source from the final user-visible delta to `main`.
- [x] Run `best-api repair`: update affected doctrine and worker sources, run `pnpm install`, and prove generated mirror parity and zero stale teaching.
- [x] Run focused package/type/lint/barrel/stale-symbol proof, strict Plite
  checks, Browser/Chromium behavior proof, root check, and P1 autoreview. Every
  selection lane is green; root correctness is green and its separate aggregate
  timing audit is recorded as proof debt; the three-invocation review cap was
  honored.
- [x] Record actual evidence, exact owned files, remaining risks, final handoff,
  and pass the goal-plan checker.
- [x] Add `editor.update.selection.setNodes(paths)` and
  `tx.selection.setNodes(paths)` with a non-empty path contract, current-state
  resolution, canonical ordering/deduplication, atomic aggregate-range
  derivation, and fail-closed invalid-path behavior.
- [x] Migrate the eight production writers in AI and copied registry UI from
  manual `ranges.fromEntries` plus `SelectionApi.node(s)` construction.
- [x] Keep `SelectionApi.node(s)` only as the detached/static/protocol escape
  hatch and update Plite and node-selection docs to teach `setNodes` for live
  editor writes.
- [x] Reduce `node-selection.tsx` from four public exports to
  `NodeSelectionKit` only; keep its descriptor and overlay private, remove CVA,
  remove the public `plite-selectable` class protocol, and delete DnD store
  access.
- [x] Replace Table's imported node-selection variant with a local reused class
  constant and remove the registry item's DnD/CVA dependencies.
- [x] Replace duplicate mouse/touch marquee plumbing with document-scoped
  Pointer Events. Exact stepped Chromium proof rejected pointer capture because
  it suppressed live pointer-move selection before pointerup.
- [x] Add standalone render proof without DnD, coexistence proof with DnD, and
  focused Chromium proof for mouse/touch-or-pointer selection, paint, focus,
  clipboard, replacement, deletion, undo, and navigation.
- [x] Add the package changeset and registry changelog/source metadata, rebuild
  generated registry output on `next`, run Best API repair/stale-teaching audit,
  P1 autoreview, strict checks, final checker, and freeze writes without commit
  or push. Changesets, changelog, direct registry generation, repair, stale
  audit, strict Plite, exact P1 repairs, and final checker are complete.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve owner, target, adoption, deletion, risk, proof | Resolved below |
| Fresh source evidence | yes | Recheck decision-changing claims after edits | Final source, package, generated-item, and stale-symbol sweeps passed |
| Best API repair | yes | Repair affected doctrine/worker sources and prove mirrors | Hard-cut law is repo-wide; stale worker examples were repaired; `pnpm install` synced mirrors |
| Conditional risk and adoption | yes | Close runtime/data/docs/browser/package/release work | All listed owners, including named-root Core and AI mutation, are proven |
| Verification recorded | yes | Record actual commands, Browser proof, and source audits | Recorded below with counts and proof boundaries |
| Handoff prepared | yes | State ownership, breaks, risks, proof, owned files, and order | Stable review-cap checkpoint below; no commit or push |
| P1 autoreview | yes | Run final implementation review with `--max-priority P1` | Three-invocation cap honored; every verified finding was repaired with exact red/green proof and direct source review; no fourth invocation or clean-review claim |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-24-single-selection-authority-hard-cut.md` | Final resolved plan passes the mandatory checker |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Owner, package, caller, docs, and browser inventory | Decide |
| Decide | completed | Best API and concept ledger resolved | Prove and hand off |
| Accepted-plan execution | completed | Slices 1-10 implemented; package and parallel authority deleted | Prove and hand off |
| Prove and hand off | completed | Focused, strict Plite, Browser, Chromium, stale, generated, exact P1 repair, and root correctness evidence recorded; root timing debt is explicit | None |
| Follow-up API/UI hard cut | completed | API/UI hard cut, strict Plite, browser proof, root-aware reads, Core block mutation, and AI replacement preserve named-root identity | None |

## Decision brief

- outcome: delete `@platejs/selection`; use Plite selection for structural
  one-node and multi-node selection.
- chosen shape: change `NodeSelection` from singular `path` to non-empty,
  deduplicated, document-ordered `paths`. Keep `kind: 'node'` and aggregate
  `Range` anchor/focus. Keep `SelectionApi.node(path, range)` for one; add
  `SelectionApi.nodes(paths, range)` for many. Both return the same shape.
- reads: `editor.read.selection()` remains the selected value or `null`;
  `ranges()` projects each selected node; `nodes(options?)` returns deduplicated
  selected entries; `contains` and `intersects` evaluate all projections.
- writes: live node selection uses `editor.update.selection.setNodes(paths)` or
  `tx.selection.setNodes(paths)`. These methods resolve paths and derive the
  aggregate range inside the same active state/transaction. Generic detached
  state construction may use `SelectionApi.node(s)`. Feature mutations compose
  `tx.selection.nodes()` with nodes/marks/text/slice APIs. Selection owns no
  duplicate/remove/indent/set/copy or paste verbs.
- strongest rejected alternative: a custom `block` kind removes the store but
  preserves a product-specific ontology and installation dependency for a job
  naturally owned by built-in node selection.
- consequence: `.path` reads break and the package disappears. The ordinary
  constructor call and single-node behavior remain.

## Best API verdict

```ts
editor.update.selection.setNodes([path]);
editor.update.selection.setNodes(paths);
editor.update((tx) => {
  tx.selection.setNodes(paths);
});

const blocks = editor.read.selection.nodes({
  match: (node) => editor.read.schema.isBlock(node),
});
const selected = editor.read.selection.contains(element);
```

- **P0 — delete the second authority.** `selectedKeys`, `anchorKey`, command
  interception, preservation tags, shadow focus, and native-selection clearing
  duplicate editor selection.
- **P0 — reject a universal selection-list wrapper.** It forces undefined
  multi-text insertion/composition/native laws with no caller. The proven job is
  multiple nodes; evolve `NodeSelection`.
- **P1 — one output shape.** Runtime uses only `.paths`; no optional `.path`,
  getter, alias, or dual encoder.
- **P1 — commands stay with real owners.** Selection owns locations. Nodes own
  duplicate/remove/set/indent, marks own formatting, slice/DOM owns clipboard,
  and input owns keys.
- **P1 — keep custom kinds.** Table-cell selection already uses Plite state and
  protocol. Single authority does not mean single kind.
- **P1 — no public marquee.** `SelectionArea` has one production consumer. Keep
  only a minimal private copied-UI pointer adapter.
- **P1 — no node-selection plugin concept.** `NodeSelectionKit` is copied UI
  composition only. Its inline descriptor is private render wiring, not public
  state, commands, or an independently named plugin API.
- **P1 — no hidden DnD contract.** The standalone kit must render without
  `DndPlugin`; drag visibility policy belongs to DnD composition, not selection.
- **P1 — no class/variant protocol.** A private data marker locates selectable
  DOM nodes. The overlay and Table styling own literal classes locally.

## Decision ledger

| Surface | Current | Target / owner | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| State | Plite state plus plugin `selectedKeys` | Plite state only | Replace every key-store read/write | state/mapping tests; zero stale hits | hidden direct store caller | hard cut |
| Value | `NodeSelection.path` plus Range | Plite `paths` non-empty tuple plus directional aggregate Range | migrate direct field reads; keep one-node constructor; add many constructor | validation/type/equality/codec tests | dual shape | replace |
| Queries | projected `ranges`, but predicates inspect top-level range | all predicates use projected ranges; `selection.nodes()` returns exact/deduped entries | replace block reads/selectors/hook | one/many/nested/deleted query tests | ancestor overlap | repair |
| Writes | block add/delete/set/clear/move/shift/selectAll | `selection.set/clear/move`; UI computes gesture paths | migrate by intent | transaction/keyboard tests | lost direction | replace |
| Feature transforms | block duplicate/remove/paste/indent/set APIs | feature code reads `tx.selection.nodes()` and calls generic owners | migrate AI/menu/DnD/math/table/column | focused feature tests | mutation order | compose |
| Command wrappers | plugin wraps mark/node/select commands and tags commits | commands consume projected ranges/nodes; no tags | delete wrappers | command tests | overlapping ranges | delete |
| Mapping/history/collab | one path maps; keys survive separately | map/dedupe/sort/drop every path; null only when none survive | extend protocol and stress contracts | op/undo/redo/collab tests | stale paths | extend |
| Persistence | codec v1 writes singular path | codec v2 writes paths; v1 decode migrates only at persistence boundary | codec migration | v1 fixture, v2 round-trip, malformed rejection | saved-data loss | migrate |
| Focus/input | editor deselected; shadow input focused; selectionchange and double-rAF | editable focus; model-only node selection has no native range; Plite input handles it | delete shadow machinery | browser focus/native/IME/follow-up input | IME regression | rearchitect |
| Clipboard | manual block HTML/text/fragment and removal | Plite slice/DOM exports selected nodes; exact paths replace once | Table owns table projection | MIME/empty/nested/table/cut/paste tests | disjoint slice | rearchitect |
| `SelectionArea` | public 1,431-line general class | delete; private minimal marquee geometry in copied UI | port only proven gesture/autoscroll behavior | component + geometry E2E | renamed clone | delete |
| Gesture state | plugin mixes drag state and membership | local React context holds only rectangle/drag flag/eligibility | table/column/DnD use private gesture context only | subscription tests | state leaks to commands | privatize |
| Block plugin/namespace | public store/API/read/update/commands/render | no plugin or portal | delete exports/keys/mocks/kits/docs/tests/deps | zero authored symbol hits | renamed facade | delete |
| Block menu | package store mutates selected keys | copied menu owns open/position React state and sets editor selection | delete plugin/key | menu component/browser tests | focus restoration | inline/delete |
| Cursor | plugin in Selection; hook/geometry in Cursor; listens to block store | full cursor surface in `@platejs/cursor`; reacts to canonical selection/focus | change imports; AI stops manual cursor control where selection suffices | cursor tests/build/browser | stale overlay | move |
| Table-cell kind | custom multi-range selection with codec/map/ranges | keep feature-specific kind in same Plite state | only shared query adoption | existing Table suite | flattening grid law | keep |
| AI | package depends on Selection and store | read `selection.nodes`; write `selection.set`; remove dependency | submit/replace/chat/focus migration | AI tests | after-commit replacement | migrate |
| Registry | DnD/math/table/column/menu/chat/examples/mocks import plugin | generic selection plus private gesture context | exhaustive authored migration | component tests/www typecheck/E2E | missed slow/mock file | migrate |
| Package | Selection publishes root and `/react`; root/app/AI/template depend on it | delete directory/dependencies/paths/lock/checks; move Cursor; export APIs from owners | barrels/manifests/metadata/generated-source adoption | type/build/pack/stale sweep | generated lag | delete |
| Keys | blockSelection/blockMenu/cursorOverlay constants | remove block keys; keep cursor key with Cursor owner | migrate literals/mocks | exact key sweep | copied stale literal | cut/move |
| Docs/generated | docs teach install/options/store/shadow/plugin APIs | teach editor node selection and copied UI; CI updates generated artifacts | English/Chinese/docs/API/registry/release sources | docs/changeset/CI freshness | stale generated dependency | rewrite |

## Execution slices

| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Value and codec | Plite interfaces/protocol | `paths`, constructors, validation, equality, codec v2/v1 migration | accepted plan | one runtime shape; invalid/duplicate/cross-root paths fail | selection protocol/codec/type tests |
| 2. Mapping and queries | Plite protocol/public state | map/dedupe/sort/drop; ranges/predicates/nodes projection | slice 1 green | operation mapping and membership obey one/many law | rebase/collab/query contracts |
| 3. Commands/transforms | Plite commands | replace top-level assumptions with projected ranges/nodes; reverse-order mutation and dedupe | slice 2 green | marks/node/select commands need no wrapper | marks/nodes/delete/insert tests |
| 4. Focus/input/clipboard | Plite React/DOM | model-only selection, editable focus, navigation, delete/type/copy/cut/paste/IME/slice | slice 3 green | no shadow listener/input/rAF; one legal transaction | editing-kernel/controller/clipboard tests |
| 5. Cursor | Cursor | move plugin/tests, remove block subscription | slice 2 stable | Cursor owns exports and selection/focus observation | cursor tests/type/build |
| 6. Package adopters | Core/AI/Table/Utils | type inference, direct path reads, AI store calls, shared Table predicates, keys/deps | slices 2–5 green | no package consumer imports Selection/block keys | focused package tests/types |
| 7. Copied UI | www registry | private small marquee; local menu/gesture state; migrate overlays/DnD/table/column/math/AI/chat/examples/slow mocks | slice 6 green | selected blocks always derive from editor selection | component tests/www typecheck |
| 8. Package deletion | package/release | delete directory/exports/specs/docs/deps/paths/lock/checks and obsolete clipboard dep | slices 5–7 green | package absent and zero authored stale hits | barrels/stale sweep/types |
| 9. Docs/release/generated owners | Docs/registry/release | latest-state docs; breaking changesets for surviving packages; registry sources; CI regeneration | slice 8 green | no taught old API; CI output has no dependency | docs/changeset/registry/template CI |
| 10. Browser/closure | Plite browser/Plate UI | drag/keys/focus/clipboard/AI/menu/DnD/table/undo/follow-up input | slices 1–9 green | all proof rows and P1 autoreview/root checks green | Browser + Chromium E2E + strict checks |

Order is binding. Do not delete the package before Plite input and Cursor are
green; do not retain it after adopters migrate.

## Proof matrix

| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Plite owns selection | `VISION.md:38-45`; `docs/vision/plite.md:1-5,131-135` | Selection protocol, state, command, input, and browser tests use only Plite state | complete |
| A second authority existed | `BlockSelectionPlugin.tsx:72-138,653-739` | Package absent; authored sweep finds no store, tag, plugin, namespace, or key | complete |
| Focus/input was duplicated | `BlockSelection.internal.tsx:85-123,266-365,367-542` | Editable remains focused, native range count is zero, no shadow input exists, mouse/touch/type/delete/undo pass | complete |
| Multi-range protocol exists | `selection-protocol.ts:508-542,580-655`; Table custom kind | 19 selection-protocol tests plus 26 Table selection tests pass | complete |
| Generic predicates were incomplete | `public-state.ts:2254-2275`; `use-element-selected.ts:51-63` | Exact one/many projections, membership, hook, caret, and browser-handle tests pass | complete |
| One-node call survives | `selection.ts:143-148` | `SelectionApi.node` still compiles and returns canonical `paths`; `nodes` covers many | complete |
| Package cut is exhaustive | Deleted package barrels and manifest | Directory absent; barrels, builds, package checks, lockfile, and stale sweep pass | complete |
| Cursor gets honest owner | Cursor already owned geometry and hooks | Cursor plugin, tests, package export, and 19-test suite moved to `@platejs/cursor` | complete |
| Browser law survives | Replaced block-selection E2E | Chromium proves exact mouse and touch paths, paint, focus, zero native ranges, clipboard, type/delete/undo/navigation | complete |
| Generated adopters close | Registry and package manifests referenced Selection | Registry build passes; current aggregate exposes `node-selection` once and `block-selection` zero times | complete |

## Exact execution verification

```bash
pnpm turbo typecheck \
  --filter=./packages/plite \
  --filter=./packages/plite-dom \
  --filter=./packages/plite-react \
  --filter=./packages/core \
  --filter=./packages/cursor \
  --filter=./packages/ai \
  --filter=./packages/table
pnpm --filter @platejs/plite test selection-protocol.test.ts
pnpm --filter @platejs/plite-react test editing-kernel-contract.ts
pnpm --filter @platejs/cursor test
pnpm test:slow packages/ai/src/react/AIChatPlugin.submit.slow.ts
pnpm --filter @platejs/table test BaseTablePlugin.selection.spec.tsx
pnpm --dir apps/www typecheck
pnpm lint:fix
pnpm brl
test ! -e packages/selection
! rg -n \
  'SelectionArea|BlockSelectionPlugin|BlockMenuPlugin|blockSelection|selectedKeys|plite-shadow-input|@platejs/selection' \
  packages apps content tooling package.json pnpm-lock.yaml \
  --glob '!apps/www/public/r/**' \
  --glob '!apps/www/src/generated/**' \
  --glob '!templates/**'
pnpm check:plite:dev
pnpm check:plite
PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm exec playwright test \
  --config tooling/config/playwright.config.ts \
  tooling/e2e/node-selection.test.ts \
  --project=chromium
pnpm check
```

Browser proof used the Browser plugin and Chromium on
`/blocks/node-selection-demo` and showed:

1. Gutter drag selects exact model paths and paints non-zero geometry.
2. Native selection is empty, contenteditable owns focus, no shadow input exists.
3. Mouse and touch gesture completion retain the same exact paths.
4. Copy, type replacement, Delete, undo, and ArrowDown remain model-owned.
5. AI, DnD, table, column, math, menu, and toolbar consumers compile and pass
   focused owner tests against the same selection.

## Conditional evidence

- High risk: applicable. Mapping, codec migration, focus/native selection, IME,
  clipboard MIME, nested ordering, empty-root deletion, table export, DnD, AI,
  undo/redo, collaboration, and follow-up input are gated above.
- External research: not applicable; local canonical ownership and callers
  decide this plan.
- Issue/PR provenance: not applicable; this is user-directed architecture, not
  a public delivery claim.
- Docs/registry/browser/release/behavior law: applicable in slices 4, 7, 9, 10.
- Performance: private marquee rAF-batches geometry and avoids per-node editor
  subscriptions. Current/main benchmark is required only if its focused
  long-document gesture row regresses.

## Findings

- `@platejs/selection` is a junk drawer: a 1,431-line general DOM selector, a
  958-line command/state plugin, a 542-line shadow-input adapter, menu state,
  and cursor state whose geometry already lives elsewhere.
- `selectedKeys` is the defect. Moving the package without deleting that store
  preserves the architecture bug.
- The premise that editor selection cannot express multiple ranges is stale.
  Plite's protocol and Table's production kind already do. The missing pieces
  are cardinality-aware built-in node selection and generic consumers.
- Predicates, React equality, element selection, commands, and input still
  assume the top-level range or one path. Those are the real Plite repairs.
- Cursor is misplaced, not selection behavior. Block menu state needs only local
  React ownership.
- The E2E proves the wrong focus owner by requiring `.plite-shadow-input`; its
  geometry/native-selection/toolbar/release/navigation/error checks remain good.

## Decisions and tradeoffs

- Plite, not Plate Core, owns multi-node selection. Core ownership would create
  a second ontology and translation layer.
- Evolve `NodeSelection`, not a `BlockSelection` kind or universal wrapper.
- Keep aggregate Range for fixed anchor/active focus direction; `paths` records
  exact membership. They are distinct truths.
- Keep Table's custom kind because rectangular grid law is feature-specific.
- Allow only transient gesture rectangle/drag state outside Plite. Membership,
  focus, input, clipboard, and commands never leave Plite.
- Delete the package in the same execution; a later cleanup phase would leave
  the obsolete authority available.

Review fixes:
- Replaced the earlier soft custom block-kind target with cardinality-aware
  built-in `NodeSelection`.
- Expanded the cut through the package, menu, cursor, keys, command wrappers,
  focus workaround, dependencies, docs, registry, and generated owners.
- Kept v1 decode only for persisted-data law; no live compatibility survives.
- Fixed P1 AI mode ownership: a selected empty node defaults to chat even when
  its projected aggregate range is collapsed.
- Fixed P1 touch parity: the private marquee handles non-passive touch
  start/move/end/cancel and shares the exact mouse gesture commit path.
- Rejected one P1 beforeinput suggestion. Desktop keydown deliberately
  suppresses Enter and soft-break while a node selection is active. Applying
  `insert-break` to a multi-node selection would use its aggregate range and
  could mutate nodes outside discontiguous exact `paths`. Mobile beforeinput
  keeps the same no-op instead of inventing unsafe semantics.
- Fixed the final Core P1: `setNodes`, `blocks.insertAfter`, and both wrapped
  and unwrapped `blocks.toggle` paths retain `selection.anchor.root` through
  resolution, reads, and mutation.
- Fixed the final AI P1: insertion and replacement track stable node keys,
  resolve inserted blocks in their owner root, select them, and remove the old
  keyed blocks without reusing root-relative paths after root loss.
- Direct source review after the mandated review cap found and fixed the
  wrapper-active precheck that still ran outside the mutation root. Exact
  named-root wrap and unwrap tests cover it. No fourth autoreview was run.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Broad Plite queries overran useful output | 3 | exact owner reads and caller counts | evidence is file/symbol bounded |
| Guessed Table/public-state paths were stale | 1 | resolve with `rg --files` first | correct owners read |
| Root check found deleted Selection in `check-core.mjs` | 1 | remove the stale package inventory row | six runner contracts and the initial full root check passed |
| Final broad rerun timed out one unrelated floating-toolbar test at its 5-second limit | 1 | replay the exact file directly | 2/2 passed in 0.96 seconds; no product edit |
| Cold Next dev route emitted an unrelated prerender warning | 1 | rerun behavior against the warm route without weakening assertions | Chromium selection E2E passed; warning remains owned by `block-preview-page.tsx`/`rehype-utils.ts` |
| Local P1 review bundle hit oversized generated output and an unrelated deleted walkthrough credential heuristic | 2 | build an external exact selection snapshot | complete 885-894 KB bundles reviewed in three passes |
| Pointer capture prevented live stepped marquee updates | 1 | keep one document-scoped Pointer Events listener tree without capture | focused Chromium E2E passed twice at 2.3 seconds |
| Standard `pnpm --filter www build:registry` crashed in the inherited shadcn ESM/CJS bridge | 2 | invoke the exact generator through Node's native `tsx` loader | `node --import tsx ./scripts/build-registry.mts` regenerated output; `node-selection.json` has one export and no DnD/CVA/capture |
| Root check exposed a stale `AIMenu` slow-test selection mock | 1 | replace the manual constructor mock with `setNodes` | exact slow contract passed 3/3 |
| Root type-aware lint found a mixed bare/cleanup return in shared `floating-popover.tsx` | 1 | make the no-op effect branch explicitly return `undefined` | focused formatting passed and the next root type-aware lint completed |
| Root slow suite found a shared footnote test inspecting a portal through `view.container` | 2 | query the rendered picker by accessible role across the render base element | exact file passed 19/19 and the aggregate slow suite passed it 19/19 |
| Root fast-suite budget exceeded 20 seconds | 4 | stop after stable correctness and exact timing evidence; do not weaken the threshold or reshuffle tests | every run passed all 3,219 tests; current final totals were 34,027.84 ms, 26,016.33 ms, and 33,737.11 ms, so the timing audit is external proof debt |
| First follow-up P1 review claimed view ranges used an independent selection | 1 | falsify against `ViewState` and named-root range/contains proof | rejected; the exact contract passed before any source fix |
| Second follow-up P1 review found base `selection.nodes()` resolving a header path in main | 1 | scope exact-path reads to `selection.anchor.root` | red returned `body`; green returned `header`; 768 state/runtime tests passed |
| Third follow-up P1 review found Core and AI named-root mutations losing root identity | 1 | honor the review cap; add exact regressions, repair the owners, and close with direct source review | Core base writes/toggles and AI replacement passed exact named-root red/green proof; no verified P1 is unresolved |

Verification evidence:
- Live source audit and final direct source review completed on 2026-08-24.
  Every production `SelectionApi.isNode`/`.paths` mutation path was checked for
  root retention. The review found and fixed the last wrapper-active precheck
  outside the named mutation root.
- Exact Core regressions failed before repair and passed after repair for base
  `selection.setNodes`, named-root `blocks.insertAfter`, named-root
  `blocks.toggle`, and named-root wrapper unwrap. The full public-state contract
  passed 36/36; strict Plite later exercised all 1,512 Plite tests.
- Exact AI named-root replacement failed before repair and passed after the
  stable-key insertion/removal rewrite. `AIChatPlugin.suggestions.spec.ts`
  passed 13/13; the actions and submit slow contracts passed 5/5 and 4/4.
- `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/ai`
  passed all 39 tasks. Focused Ultracite checks passed for every final Core, AI,
  test, and shared root-check repair file.
- `pnpm check:plite:dev` passed all six stages in 208,699 ms, including 53
  package typechecks, AI and Plite React package suites, runner contracts, and
  three Chromium smoke rows.
- The first strict rerun was invalidated when `pnpm-lock.yaml` changed during
  Chromium proof; it had no product failure. The stable rerun of
  `pnpm check:plite` passed all four stages in 450,665 ms: 710 Chromium rows
  passed, 8 skipped, with every Plite package, public type, test, build, and
  runner contract green.
- The final `pnpm check` passed formatting, type-aware lint, two 59-package
  build passes, all 59 package typechecks, 3,219/3,219 fast tests, every isolated
  fast shard, and 1,550 slow tests with 60 intentional skips. The shared
  footnote portal row passed 19/19 in both exact and aggregate proof.
- Root closure is red only at `pnpm test:slowest`: all 3,219 correctness tests
  passed on each attempt, while the machine-sensitive aggregate total measured
  34,027.84 ms in the root run and 26,016.33 ms / 33,737.11 ms in two exact
  replays against a 20,000 ms budget. No threshold, test topology, or product
  code was changed to manufacture green.
- Earlier focused proof remains current: Plite selection protocol 19/19; Plite
  React browser-handle/caret/keyboard-selection 19/19; Cursor 19/19; Table
  selection 26/26; node-selection and media-image registry 6/6.
- `pnpm brl` passed all 56 packages. Registry changelog validation passed all
  80 events. `pnpm changeset status` passed.
- `pnpm --filter www build:registry` passed. Current root registry items contain
  one `node-selection` and zero `block-selection`; old names remain only in
  historical migration/release content.
- Browser inspection and exact Chromium E2E passed on
  `/blocks/node-selection-demo`: paths `0` and `1`, painted marquee, editable
  focus, zero native ranges, clipboard fragment/plain text, type replacement,
  delete, undo, ArrowDown, and touch gesture parity.
- Final authored sweep found no `SelectionArea`, selection/menu plugins,
  `blockSelection`, `selectedKeys`, shadow input, Selection package import, or
  singular node-selection `.path`. `packages/selection` is absent.
- Follow-up P1 review used
  `.agents/skills/autoreview/scripts/autoreview --mode local --max-priority P1`
  on a 135-149 KB exact selection snapshot. Invocation 1 produced one false
  view-range finding, rejected by reachable-state and exact named-root proof.
  Invocation 2 found and fixed the base-editor named-root `selection.nodes()`
  defect. Invocation 3 found two verified P1s: Core node-selection block
  transforms and AI block replacement reused root-relative paths after losing
  their selection root. Both were repaired under exact red/green tests, then
  checked directly. The cap was honored; no fourth invocation or clean-review
  claim was made, and no verified P1 is unresolved.

## Owned file checkpoint

Task-owned authored changes are exactly:

- `.agents/rules/patch.mdc`,
  `.agents/rules/plate-next/rules/review-law.md`,
  `.agents/rules/plate-plugin-creator/references/plugin-authoring-audit.md`, and
  their matching `.agents/skills/**` mirrors.
- `.changeset/{fix-default-selection-area-class,nested-cursor-focus,paint-block-selection-marquee,react-19-compiler-runtime,selection-plite-runtime,single-selection-authority,tidy-block-selection-drag}.md`.
- `packages/selection/**` as deletions; `packages/cursor/{package.json,src/**}`;
  `packages/ai/{package.json,src/react/AIChatPlugin*}`; and
  `packages/utils/src/lib/plate-keys.ts`.
- `packages/plite/src/{core/editor-commands.ts,core/get-content-slice.ts,core/public-state.ts,core/selection-protocol.ts,editor-runtime-view.ts,editor/add-mark.ts,editor/delete-backward.ts,editor/remove-mark.ts,index.ts,interfaces/editor.ts,interfaces/selection.ts,transforms-node/remove-nodes.ts,transforms-node/replace-children.ts,transforms-node/set-nodes.ts}`
  plus the changed contracts under `packages/plite/test/**`.
- `packages/plite-dom/src/plugin/host-codec.ts`; the changed selection/input
  owners under `packages/plite-react/src/{editable,hooks}/**`; and
  `packages/plite-react/test/{browser-handle-contract.test.ts,caret-engine-contract.test.ts,keyboard-selectable-selection.test.tsx}`.
- The selection-owned changed files under `apps/www/src/registry/**`, plus
  changes in `apps/www/{api-reference.config.json,package.json,tsconfig.json}`,
  `apps/www/src/{__registry__,__tests__/package-integration/core-runtime,app/(app)/examples/plite/_examples,app/dev/table-perf,components/command-menu-dialog.tsx,config/docs-icons.tsx,i18n/getI18nValues.ts}`.
- The AI, block-menu, cursor-overlay, block-selection, node-selection, metadata,
  and Plite selection docs changed under `content/docs/**`.
- `package.json`, `pnpm-lock.yaml`,
  `tooling/e2e/node-selection.test.ts`, and
  `tooling/scripts/{check-core.mjs,check-plate-schema-adoption.mjs,check-plate-schema-adoption.test.mjs,check-plite.mjs}`.
- This plan file.

Shared-overlap files are `apps/www/package.json`, `pnpm-lock.yaml`, and generated
`apps/www/{public/r,src/generated}/**`: selection hunks/output coexist with the
shadcn packet. Do not discard either side. The shadcn plans/run artifacts,
registry preset-build scripts, raw mobile proof changes, and
`tooling/plite/donor/proof/mobile-device-scenarios.json` are not owned by this
plan. The coordinator is authorized to stage the entire checkout as-is.

The follow-up API/UI packet additionally owns:

- `.changeset/single-selection-authority-{ai,core,cursor,plate,plite-dom,plite-react,plite,table,utils}.md`;
- `apps/www/src/registry/components/editor/{ai-menu.slow,ai-menu,block-menu,dnd,math,node-selection.spec,node-selection,table}.tsx` and `apps/www/src/registry/registry-features.ts`;
- `packages/plite/src/{core/public-state.ts,editor-runtime-view.ts,interfaces/editor.ts}` and `packages/plite/test/{public-package-types-smoke.ts,state-tx-public-api-contract.ts,transforms-contract.ts}`;
- `packages/ai/src/react/{AIChatPlugin.ts,AIChatPlugin.suggestions.spec.ts}`, the node-selection English/Chinese
  docs, Plite selection/transforms docs, registry changelog source/output,
  `tooling/e2e/node-selection.test.ts`, generated `node-selection` registry
  items, and this plan.

Shared root-check repairs, kept separate from selection ownership:

- `apps/www/src/registry/bases/base/editor/floating-popover.tsx`: explicit
  no-op effect return required by type-aware lint.
- `apps/www/src/registry/components/editor/footnote.slow.tsx`: portal-aware
  accessible picker assertions; exact and aggregate proof pass 19/19.
- `apps/www/src/registry/changelog/entries/2026-08-24-support-radix-base-registry.mdx`:
  formatting only, required before the root gate could continue.

Final handoff prepared:
- Owner/API: Plite `NodeSelection.paths`, `SelectionApi.node(s)`, and generic
  `editor.*.selection`.
- Breaks: Selection package/exports, `.path`, block/menu plugins/keys,
  namespace/store/hooks/shadow input/class/docs/deps/mocks; move Cursor; migrate
  every caller.
- Proven follow-up: path-native writer API, eight writer migrations, one-export
  DnD-free copied UI, Browser/Chromium behavior, strict Plite, and the
  root-aware `selection.nodes()` read, Core block mutation, and AI replacement
  repairs.
- Review proof: all verified P1 findings are repaired with exact tests and
  direct source review. The three-invocation cap was honored without a fourth
  run or a clean-review claim.
- Root proof: formatting, lint, builds, types, and all correctness suites are
  green. Only the independent aggregate timing budget is red, with exact
  26,016.33-34,027.84 ms measurements against 20,000 ms.
- Remaining external warning: the block demo route logs the pre-existing Next
  uncached-prerender warning. Selection behavior is green on the same route.
- Freeze: no further repo writes after the completion-checker receipt. No
  commit or push was performed.

Timeline:
- 2026-08-24T13:22:33.133Z plan created.
- 2026-08-24 live owners/callers/browser proof audited.
- 2026-08-24 Best API target and full hard-cut handoff locked.
- 2026-08-24 exact plan accepted; one-shot execution goal created; slice 1 started.
- 2026-08-24 slices 1-10 implemented; Selection package and parallel authority deleted.
- 2026-08-24 strict Plite, generated registry, Browser, Chromium, stale, and P1
  review execution completed; root correctness passed and aggregate timing debt
  was recorded.
- 2026-08-24 follow-up path-native API and one-export UI implemented; final
  strict Plite passed; the two final named-root mutation P1s were repaired with
  exact red/green proof and direct source review after the review cap.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Final implementation handoff; selection architecture and behavior are complete |
| Where am I going? | No selection work is queued; the checkout is frozen after the plan checker |
| What is the goal? | One Plite selection authority; no selection package/block subsystem |
| What have I learned? | Node-selection paths are root-relative; every read and mutation must retain the selection root until the operation completes |
| What have I done? | Deleted the parallel authority, shipped the path-native API/UI cut, repaired every verified named-root defect, and proved strict Plite plus all root correctness suites |

Open risks:
- Root `pnpm check` is not fully green: `pnpm test:slowest` passes all 3,219
  tests but exceeds the 20,000 ms aggregate timing budget on this machine. The
  final measured range is 26,016.33-34,027.84 ms.
- Standard registry generation remains blocked by the inherited shadcn ESM/CJS
  launcher failure; the exact native-loader generator passed and refreshed the
  selection item.
- Historical migrations and release records intentionally retain old names.
- The unrelated Next dev prerender warning remains outside this cut.
