# Single selection authority hard cut

Objective:
Delete Plate's parallel block-selection subsystem and make Plite's editor
selection the sole state, command, mapping, focus, clipboard, and input authority
for one or many selected nodes.

Flow mode:
agent-led plan hardening

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
  collaboration, and browser laws have exact proof gates; implementation waits
  for explicit acceptance.

Verification surface:
- Live selection interfaces/protocol/state/query, Plite DOM/React input owners,
  `packages/selection/**`, Cursor, AI, Table, registry/docs consumers, manifests,
  and `tooling/e2e/block-selection.test.ts`.
- Best API review of one/many node construction, generic selection reads,
  deletion scope, and rejection of block-specific command verbs.
- Focused unit/type/browser rows, strict Plite handoff, authored stale-symbol
  sweeps, barrels, changesets, and CI-generated registry/template closure.

Constraints:
- Planning only until the user explicitly accepts this exact plan and invokes
  `plate-plan` against it.
- No aliases, deprecated exports, dual field shapes, runtime command bridges,
  or shadow selection stores.
- Preserve the common `SelectionApi.node(path, range)` call. Normalize its
  result to canonical `paths`; migrate direct reads of removed `.path`.
- Preserve native editable focus, IME, history, collaboration mapping, and
  persisted-selection correctness.
- A versioned persisted-selection decoder may migrate serialized v1 `path` to
  v2 `paths`. That is a serialized-data obligation, not a live API shim. New
  runtime values and encodings use only `paths`.
- `templates/**` and `apps/www/public/r/**` are CI-generated. Change their
  sources; do not hand edit their output.
- Current source is authoritative. Earlier plans and memory are leads only.

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
- status: ready_for_user_acceptance
- phase: prove_and_handoff_complete
- next: wait for exact-plan acceptance, then execute in order
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Complete package/class/plugin/namespace/store/bridge cut is explicit |
| Active goal and plan verified | yes | Active goal names this artifact and binary threshold |
| Current owners read | yes | Live owners and callers are recorded below |
| Best API target resolved | yes | Cardinality-aware `NodeSelection`; common one-node call preserved; no block commands or universal wrapper |
| Mode and execution boundary resolved | yes | Standard planning-only handoff |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one Best API verdict.
- [x] Every concept row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and the private UI adapter have complete answers.
- [x] Execution slices and focused proof are concrete.
- [x] Conditional work and final handoff are resolved.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve owner, target, adoption, deletion, risk, proof | Resolved below |
| Fresh source evidence | yes | Recheck decision-changing claims | Live Plite/Selection/Cursor/AI/Table/registry/docs/manifests/E2E read on 2026-08-24 |
| Best API review | yes | Resolve all P0/P1 findings | Resolved below |
| Conditional risk and adoption | yes | Resolve runtime/data/docs/browser/package/release work | Exact slices and proof rows below |
| Verification recorded | yes | Record planning proof and execution commands | Below |
| Handoff prepared | yes | State ownership, breaks, risks, proof, order | Below |
| P1 autoreview | no | Planning-only artifact; implementation review follows accepted edits | Scoped N/A |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-24-single-selection-authority-hard-cut.md` | Mandatory final planning proof |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Owner, package, caller, docs, and browser inventory | Decide |
| Decide | completed | Best API and concept ledger resolved | Prove and hand off |
| Prove and hand off | completed | Slices, proof, risks, and handoff prepared | User acceptance |

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
- writes: state changes only through `editor.update.selection.*` and
  `tx.selection.*`. Feature mutations compose `tx.selection.nodes()` with
  nodes/marks/text/slice APIs. Selection owns no duplicate/remove/indent/set/copy
  or paste verbs.
- strongest rejected alternative: a custom `block` kind removes the store but
  preserves a product-specific ontology and installation dependency for a job
  naturally owned by built-in node selection.
- consequence: `.path` reads break and the package disappears. The ordinary
  constructor call and single-node behavior remain.

## Best API verdict

```ts
editor.update.selection.set(SelectionApi.node(path, range));
editor.update.selection.set(SelectionApi.nodes(paths, aggregateRange));

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
| Plite owns selection | `VISION.md:38-45`; `docs/vision/plite.md:1-5,131-135` | only Plite state exercised by runtime/type tests | planned |
| A second authority exists | `BlockSelectionPlugin.tsx:72-138,653-739` | no store/tags/plugin hits | planned |
| Focus/input is duplicated | `BlockSelection.internal.tsx:85-123,266-365,367-542` | editable active; no shadow input; native/follow-up input green | planned |
| Multi-range protocol exists | `selection-protocol.ts:508-542,580-655`; `BaseTablePlugin.ts:171-175,2268-2315` | Table and generic projection tests green | planned |
| Generic predicates are incomplete | `public-state.ts:2254-2275`; `use-element-selected.ts:51-63` | one/many/nested membership and React rerender tests | planned |
| One-node call survives | `selection.ts:143-148` | compile fixture uses unchanged call and asserts `paths` | planned |
| Package cut is exhaustive | `packages/selection/package.json:28-53`; package barrels export all families | directory absent; import/symbol/build closure | planned |
| Cursor gets honest owner | Cursor owns geometry/types/hook; Selection owns plugin | Cursor export/type/unit/browser proof | planned |
| Browser law survives | `tooling/e2e/block-selection.test.ts:34-191` | replace shadow-focus assertion; add clipboard/delete/type/undo/follow-up | planned |
| Generated adopters close | app/root/AI/template manifests reference Selection | CI registry/template output has no dependency | planned |

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
pnpm --filter @platejs/ai test AIChatPlugin.submit.slow.ts
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
pnpm exec playwright test tooling/e2e/block-selection.test.ts --project=chromium
pnpm check
```

Browser proof uses the Browser plugin on `/blocks/playground` and must show:

1. Gutter drag selects exact model paths and paints non-zero geometry.
2. Native selection is empty, contenteditable owns focus, no shadow input exists.
3. Release retains selection; Arrow/Shift+Arrow preserve direction; Escape clears.
4. Copy/cut/paste/Delete/Backspace/type/undo/redo/follow-up typing are legal.
5. Menu, AI, DnD, nested blocks, columns, tables, and toolbar exclusion read the
   same selection and emit no runtime errors.

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

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Broad Plite queries overran useful output | 3 | exact owner reads and caller counts | evidence is file/symbol bounded |
| Guessed Table/public-state paths were stale | 1 | resolve with `rg --files` first | correct owners read |

Verification evidence:
- Live source audit completed on 2026-08-24.
- Best API resolved all P0/P1 target findings; no alternative remains.
- Mandatory checker in Completion Gates is the final planning proof.

Final handoff prepared:
- Owner/API: Plite `NodeSelection.paths`, `SelectionApi.node(s)`, and generic
  `editor.*.selection`.
- Breaks: delete Selection package/exports, `.path`, block/menu plugins/keys,
  namespace/store/hooks/shadow input/class/docs/deps/mocks; move Cursor; migrate
  every caller.
- Main risks: codec v1, path mapping/deletion, clipboard/replacement,
  focus/IME, nested/table behavior, and slow/generated adopters.
- Order: value -> mapping/query -> commands -> input -> Cursor -> packages ->
  copied UI -> deletion -> docs/release/generated -> browser/root closure.
- User attention: accept or reject the canonical `NodeSelection.paths` target.
  Package deletion alone is not a partial execution authorization.

Timeline:
- 2026-08-24T13:22:33.133Z plan created.
- 2026-08-24 live owners/callers/browser proof audited.
- 2026-08-24 Best API target and full hard-cut handoff locked.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Planning proof and handoff complete |
| Where am I going? | Wait for acceptance, then slices 1-10 |
| What is the goal? | One Plite selection authority; no selection package/block subsystem |
| What have I learned? | Multi-range protocol exists; built-in node cardinality and generic consumers are missing |
| What have I done? | Locked API, ownership, deletion, adoption, risks, proof, order |

Open risks:
- No unresolved planning decision. Implementation risks are gated above and do
  not justify preserving the package or plugin.
