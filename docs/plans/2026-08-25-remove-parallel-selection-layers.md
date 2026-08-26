# Remove parallel selection layers

Objective:
Hard-cut Plate block/custom selection layers into Plite selection; done when
directional core NodeSelection replaces Table/custom selection, rejected APIs
have zero live references, and focused, strict, browser, doctrine, and review
gates pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-25-remove-parallel-selection-layers.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:

- none

Mode:

- `standard`

Completion threshold:

- All six original execution slices plus the accepted DnD/Table/AI closure
  packet are complete with recorded source, package, browser, doctrine,
  generated-output, and P1 review evidence.
- `selectionKinds`, `EditorSelectionSpec`, `TableCellSelection`, the removed
  `table-cell` selection kind, and deleted block-selection APIs have zero live
  source/docs/rule consumers outside intentional historical release records.
  The unrelated Plite Layout `table-cell` box kind remains valid.
- Directional NodeSelection preserves exact membership and anchor/focus through
  mapping, roots, history, collaboration, Table row/column expansion,
  clipboard, and DOM projection.
- The bounded census covers every `BlockSelectionPlugin`/block-selection and
  custom `selectionKinds` definition, export, production owner, table consumer,
  registry consumer, docs example, and behavior test in the current checkout.
- Table selection is traced from pointer/keyboard gesture through core selection
  state, selected-cell derivation, DOM projection, commands, history/mapping,
  and rendering. Expanding across one row and one column has current behavior
  evidence or an exact missing core law and proof row.
- Every public plugin, namespace, hook, store, custom selection kind, derived
  state layer, and adapter gets one `cut`, `inline/private`, `keep`, or
  `rearchitect` verdict. Every survivor names a hard law or independent current
  job.

Verification surface:

- Resolve one current 40-character `next` SHA and audit live source plus its
  uncommitted API migration; do not use another branch or historical release.
- Owner-scoped `rg` manifests for block-selection/custom-selection definitions,
  exports, package/registry composition, direct state reads/writes, table cell
  selection derivation, docs, and tests. Record counts and exclusions.
- Read the Plite selection protocol/public read implementation and every Plate
  selection adapter before deciding which layer can disappear.
- Run the smallest existing table/block-selection package tests and one real
  browser row/column drag proof when the current app route supports it.
- Run the final plan checker; execution proof commands are specified but not run
  as implementation proof during planning.

Constraints:

- The user accepted this exact plan with `go`; product, package, registry,
  documentation, doctrine-source, generated barrel/skill/registry, and focused
  proof edits inside the six slices are authorized.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.
- Prefer the maximum safe deletion cone. Current packages, plugins, custom kinds,
  hooks, stores, namespaces, tests, and migration cost do not earn survival.
- Preserve one authoritative editor selection, native selection/caret behavior,
  table rectangular cell semantics where they are real, mapping through edits,
  undo/history, copy/paste, collaboration, additional roots, and accessibility.
- The user specifically wants the complexity and bug surface removed, not moved
  behind a renamed plugin or facade.
- Do not commit, push, open a PR, change trackers, or edit CI-owned
  `templates/**`. Generated barrels, skills, and registry output are included
  only through their owning commands.

Boundaries:

- In scope: Plate block selection, custom selection kinds, table selection,
  selection UI/controller/store code, package and registry composition, public
  exports/docs, current behavior tests, and the Plite selection primitives they
  use or need.
- Source owners: Plite owns authoritative selection state/protocol/mapping and
  generic reads/updates; Table owns rectangular table semantics; registry/UI
  owns presentation and gestures only when no reusable headless DOM contract is
  proven.
- Non-goals: performance claims, serialized document changes, redesigning
  unrelated table transforms, compatibility, release, or GitHub mutation.
- Direct Plite boundary owners: selection protocol, installed `selectionKinds`,
  `NodeSelection`, `selection()`, `selection.ranges()`, `selection.nodes()`,
  transaction selection writes, DOM-range projection, anchors/mapping, history,
  and browser proof.

Output budget strategy:

- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:

- Block only if current table selection cannot be determined after source,
  focused tests, runnable demos, and Browser proof are exhausted, or a hard
  native/runtime law leaves two materially different targets that require the
  user's product decision.

Plate Plan state:

- status: complete
- phase: closure proved
- next: hand off the completed hard cut without Git or release mutation
- handoff: all accepted slices, the DnD/Table/AI closure packet, strict proof,
  Browser proof, stale scans, generated output, and P1 review are complete

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Full usage census, custom-selection census, Table derivation, row/column expansion proof, maximum layer cut, core authority, and planning-only boundary are recorded above |
| Active goal and plan verified | yes | Active goal names this exact plan and its binary owner/consumer plus table-column evidence threshold |
| Current owners read | yes | Read Plite selection protocol/interfaces/runtime, plugin compiler/registry, history/React/Yjs adapters, Table selection/plugin/DOM projection, former block-selection consumers, registry node-selection UI, docs, Vision, and owning rules on current `next` |
| Best API target resolved | yes | `best-api` verdict: delete extension-defined selection kinds and make the built-in node selection directional; do not retain a Table selection kind, plugin, store, or renamed facade |
| Mode and execution boundary resolved | yes | User accepted the exact checker-green plan with `go`; one-shot execution is authorized without commit, push, PR, tracker, or template mutation |

Work Checklist:

- [x] Skill analysis: `plate-plan`, `best-api repair`, `hard-cut`, and
      `autogoal` apply; external editor research and performance benchmarking do
      not own this accepted local API migration.
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Every explicit user question has a direct source-backed answer in the
      plan: prior/current plugin consumers, all custom selections, Table's
      selected-cell derivation, and column expansion behavior.
- [x] Slice 1: directional built-in NodeSelection is implemented and proved
      across core, mapping, roots, history, React views, and Yjs.
- [x] Slice 2: Table stores only directional NodeSelection and preserves every
      focused row/column/merged-cell/inverted-selection behavior.
- [x] Slice 3: generic marks, Table slice projection, one Table selection read,
      convenience API deletion, and simplified DOM projection are complete.
- [x] Slice 4: custom selection compiler/runtime/types/tests are deleted with a
      zero-stale-symbol audit.
- [x] Slice 5: callers, docs, Vision, source rules, doctrine version,
      changesets, barrels, generated skills, and generated registry teach only
      the final architecture.
- [x] Slice 6: focused and strict package gates, rich Table and AI Browser
      proof, final diff/stale-symbol audit, and the allowed three-invocation P1
      review pass.
- [x] Closure packet: delete DnD `selectNodeEntries` and
      `getSelectedBlocks` wrappers; keep exact selection membership and call
      core selection updates directly without a second selection authority.
- [x] Closure packet: restore Table package `read.canMerge()` and
      `read.canSplit()` from the derived Table selection view, keep
      `disableMerge` as UI/store policy, and delete registry `getTablePlugin`,
      `getTableRead`, duplicated eligibility predicates, and selected-cell
      mapping glue.
- [x] Closure packet: make `getSelectedCellsBorders()` and
      `setCellBackground({ color })` derive the current Table selection in the
      package; hard-cut the public `selectedCells` option and prove current
      NodeSelection, merged-cell, and read-only behavior.
- [x] Closure packet: export one package-owned AI request-context contract;
      delete `use-chat.ts` Table/SelectionApi live-editor reconstruction; make
      fake streaming use the submitted `ctx.children`, `ctx.refs`, and
      `ctx.selection`; classify an empty exact NodeSelection as selected on the
      server.
- [x] Closure packet: audit affected docs, worker rules, generated mirrors,
      exports, registry source, tests, and changesets for stale teaching; run
      `pnpm install`, focused package/type/browser proof, final stale-symbol and
      diff audits, and the allowed changed-scope P1 review gate. Do not commit,
      push, open a PR, mutate trackers, or edit `templates/**`.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Execute every accepted slice and close every proof row | All original slices and the accepted DnD/Table/AI closure packet pass |
| Fresh source evidence | yes | Recheck decision-changing current claims before edits and at final audit | Final source, stale-symbol, generated-output, and diff audits are recorded below |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding | The accepted hard cut is implemented; the final P1 review reports no actionable finding |
| Conditional risk and adoption | yes | Complete runtime, history, collaboration, named-root, clipboard, docs, registry, doctrine, and browser gates | All assigned runtime, package, docs, registry, doctrine, and Browser rows pass |
| Verification recorded | yes | Replace planning baselines with fresh implementation proof | Fresh focused, strict, Browser, generation, and audit evidence is recorded below |
| Handoff prepared | yes | Record final ownership, breaks, proof, risks, and changed files | Current handoff records final ownership, hard breaks, green proof, and no open implementation blocker |
| P1 autoreview | yes | Run with `--max-priority P1`, fix accepted findings, and rerun within the invocation cap | Invocation 1 found backward AI endpoint loss and a live-state Table read; both were fixed with regression tests. Invocation 2 confirmed both and corrected Table's changeset to major. Invocation 3 is clean. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-25-remove-parallel-selection-layers.md` | Final checker passes after closure evidence is recorded |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Owners, consumers, docs, rules, and tests were inventoried at the fixed `next` SHA | Decision lock |
| Decide | complete | `best-api` hard-cut counterfactual resolved every selection concept | Proof and handoff |
| Execute slices 1-5 | complete | Core, Table, React, callers, docs, doctrine, changesets, barrels, and generated registry are migrated and proved | Closure |
| Prove and hand off | complete | Focused, strict, Browser, generated-output, diff, stale-symbol, and three-invocation P1 review gates pass | Final handoff |
| DnD/Table/AI closure packet | complete | DnD uses core reads/updates, Table policy lives in the package, and AI fallback consumes an immutable request snapshot | Final handoff |

Decision brief:

- outcome: Delete the already-obsolete block-selection package and the remaining
  extension-defined selection protocol. Table is the only production custom
  selection kind and does not justify that generic layer.
- chosen shape: Plite owns `TextSelection` and one directional built-in
  `NodeSelection`. Table writes exact selected cell nodes plus anchor/focus
  endpoints and derives its rectangle through one Table read API.
- strongest rejected alternative: Keeping `TableCellSelection`,
  `selectionKinds`, or a Table/Block selection plugin preserves a second state
  shape whose `cells` payload is already derived from the editor selection.
- consequence: This is a major beta API break. Table row/column behavior stays;
  extension-defined selection kinds and persisted beta `table-cell` selection
  envelopes do not. Document table nodes and content remain unchanged.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `@platejs/selection`, `BlockSelectionPlugin`, `SelectionArea`, store, hooks | A deleted package in the current diff formerly held selected block ids, marquee state, and UI actions | No package, plugin, store, selection namespace, or compatibility export | Plite for state; registry for DOM gesture UI | Core node selection already owns exact multi-node state; the old layer duplicated authority | Finish stale export/package/docs/changelog sweeps; retain the existing deletion | Zero live source consumers outside release metadata; core-selection adopters compile and behavior tests pass | Registry UI could accidentally recreate state ownership | cut |
| Former block-selection consumers | AI/block menu/DnD read or mutated selected blocks; column/math/table hid controls during marquee; Table rendered whole-node overlays | AI/menu/DnD use core selection reads/updates; local UI gesture state controls visibility; Table uses core node membership | Respective package/registry owners | None needs an editor selection plugin | Audit AI prompt/replace/restore, block menu, DnD, column, math, and Table call sites and delete stale imports | Package tests plus registry Browser flows | Behavior may survive while a stale private adapter remains | rearchitect |
| Registry `NodeSelectionKit` and marquee/overlay components | DOM hit-testing, pointer gesture state, render injection, and `selection.setNodes` writes | Keep registry-local as presentation/controller code with no selected-node store | `apps/www` registry UI | Headless Plite cannot own DOM hit-testing or copied UI styling; this is not an authority | Rename only if its public teaching falsely implies a plugin; do not promote it without a proven headless job | Standalone block demos, drag and keyboard selection, no duplicate state search | UI state may drift into a second selected-node cache | keep |
| `SelectionValue` extension union and `selectionKinds` | Generic compiler/runtime registry supports arbitrary range-shaped kinds with codecs, mapping, marks, DOM range, ranges, validation, and slices | Built-in `TextSelection | NodeSelection` only; delete `EditorSelectionSpec`, plugin declaration/compiler/registry/runtime support, exports, tests, and docs | Plite | One production kind cannot justify eleven generic source owners and public doctrine | Remove declarations from core/Plite plugin definitions and migrate/delete synthetic extension tests | Plite public-import, compiler, history, mapping, and source typechecks; zero `selectionKinds` outside historical release text | Hidden third-party beta consumers break intentionally | cut |
| Built-in `NodeSelection` | Canonical exact paths and optional root; input order is discarded, so origin/direction cannot survive | Add required internal `anchorPath` and `focusPath`, both exact selected members; codec v4; built-in v3 decode synthesizes canonical endpoints | Plite | Rectangular expansion/contraction needs a stable origin and active edge; a plain path set is insufficient | Update all constructors, mapping, history, React view/root adapters, Yjs, replace-children, and fourteen production reconstruction sites | Forward/backward, deletion, move, root, history, persistence, collaboration, and reconstruction tests | Wrong endpoint fallback can reverse contraction after deletion | rearchitect |
| `selection.setNodes` / `SelectionApi.nodes` | Exact targets only | Public `setNodes(targets, { anchor, focus })`; low-level `SelectionApi.nodes(paths, { anchorPath, focusPath, root })`; omitted endpoints deterministically use canonical first/last | Plite | Ordinary callers stay terse; directional callers state intent without another selection type | Update transaction/view wrappers and infer target types; Table supplies gesture endpoints | Compile-time inference plus runtime target/member/root validation tests | Node targets can disappear while being resolved | rearchitect |
| `editor.read.selection()` | Returns `Range | null`; for node selection it currently projects only the first exact node range | Return one directed representative range spanning node endpoints; callers never assert `kind` | Plite | The common single-range read remains simple while exact multi-selection stays under dedicated reads | Audit consumers that assumed first canonical node; use `.nodes()` or `.ranges()` where exactness matters | Plite selection read contracts and consumer stale-shape scan | Representative range includes intervening content for disjoint nodes and must never be used as membership | rearchitect |
| `selection.nodes()`, `.ranges()`, `.contains()` | Core exact multi-node reads | Keep as the only generic multi-selection reads; `.ranges()` remains one exact range per selected node | Plite | These already express exact multi-selection without Table or block namespaces | Migrate all duplicated block/Table membership helpers | Transform, marks, AI, DnD, menu, Table, and root tests | Callers may incorrectly use representative `selection()` for exact membership | keep |
| `TableCellSelection` and `cells` payload | `Range & { kind: 'table-cell'; cells: Range[] }` duplicates a derived rectangle and installs the sole production custom spec | No Table selection type or codec; write built-in directional node selection of exact cells | Table writes; Plite stores/maps | `readTableSelection` already derives cells, keys, bounds, spans, table, and endpoints from editor selection | Remove codec/validator/map/ranges/DOM/marks/slice spec and internal semantic getter | Full Table unit/slow/browser matrix; zero `table-cell` and production `selectionKinds` | Blind use of today's unordered NodeSelection would break inverted contraction | cut |
| Table rectangle derivation | `readTableSelection` compiles the grid from selection endpoints and closes bounds over row/col spans | Expose one `editor.plugin(TablePlugin).read.selection(at?)` view; keep grid/span logic private | Table | Rectangle/span geometry is a real Table job, not generic core selection | Consolidate current internal view and callers; return anchor, focus, bounds, exact cell entries, table, complete/valid state | Row, column, merged-cell, inverted, named-root, and cache tests | Cache keys must include every state input affecting projection | rearchitect |
| Table selection convenience API | Multiple getters for grids, selected cells/keys/tables, bounding boxes, and membership | Delete or privatize; use core `.nodes()`/`.contains()` for generic membership and the sole Table selection view for geometry | Table | The wrappers duplicate either core selection or one derived view | Migrate registry Table and AI/chat/cursor consumers; stale export sweep | Public import/typecheck and exact-symbol search | One obscure consumer may depend on a convenience export | cut |
| Table keyboard/pointer updates | Table computes cell endpoint ranges and constructs `TableCellSelection` | Keep Table gesture/navigation logic; call core `setNodes(cells, { anchor, focus })` | Table | Grid navigation and merged-cell closure are Table behavior | Migrate mouseup, Shift-arrow, select-all, row/column actions, delete/paste/drop paths | Existing focused 38-test suite plus new node-selection assertions and Browser gestures | Native selection may flash if pointer lifecycle order changes | rearchitect |
| Selected-cell DOM projection | Hook projects selected attributes and suppresses the caret for the custom DOM range | Keep one renderer hook that diffs exact selected cells; remove hidden caret-color bookkeeping because node selection has no DOM range | Table React | Custom cell renderers need centralized incremental DOM attributes; this is presentation, not state | Consume core node keys or Table view only | Enter/leave diff, unmount, root, focus, and no-native-selection browser checks | Renderer remounts can leave stale attributes | keep and simplify |
| Marks across selected cells | Table custom selection spec intersects marks across every cell range | Generic Plite node-selection marks intersect exact `selection.ranges()` | Plite | This behavior applies to every exact multi-node selection | Move law and tests to Plite; delete Table spec branch | Mixed/equal marks across disjoint nodes, voids, roots | Large selections could regress read cost | rearchitect |
| Clipboard/slice projection | Table custom selection spec turns selected cells into a valid table slice; generic NodeSelection yields bare nodes | Make `editorReads.slice.get` addressable by existing read middleware; Table projects selected cells into a table-shaped slice; export consumes projected `get` | Plite pipeline; Table projection | Table-shaped clipboard content is a real feature law but not a selection-state law | Route direct slice and clipboard export through one projected read; delete selection-spec slice | Copy/cut/paste single cell, rectangle, merged cells, roots, and external HTML | A second export-only path could bypass projection | rearchitect |
| Persistence and migration | Built-in node codec v3; custom kinds own codecs | Node codec v4 with v3 decode; no runtime decoder for beta-only `table-cell` envelopes | Plite | Built-in state needs deterministic migration; the rejected extension protocol must actually disappear | Update snapshots/history/Yjs fixtures; document the major beta break in changeset, not runtime code | v3-to-v4 node decode and v4 roundtrip; explicit rejection of `table-cell`; document content unchanged | Restored beta sessions lose ephemeral selection/history position | cut custom compatibility; migrate built-in |
| Vision, rules, skills, docs, changesets, registry release entry | Current doctrine teaches `selectionKinds`; four unshipped changesets and API docs repeat it | Teach built-in text/node selection only and Table-derived geometry; rewrite current unshipped release text to final behavior | Vision, `best-api`, `plate-next`, plugin/docs owners | Leaving doctrine stale will regenerate the deleted abstraction | Update source rules only, add closed-selection doctrine 109 and representative-range correction 110, run `pnpm install`, update smallest Vision owners/docs/changesets/changelog, barrels, registry output | Source/mirror parity, doctrine validator, zero stale examples, docs checks, `pnpm brl`, registry build | Generated mirrors or registry output can hide stale teaching | rearchitect |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Directional core node selection | Plite, Plite React, history, Yjs | Add endpoints and update constructor, public update call, representative range, validation, codec, mapping, roots, view adapters, history/collaboration, and every reconstruction site | Current exact path-set NodeSelection and its focused contracts are green | Built-in node selection is the only exact multi-node state and preserves direction through all lifecycles | Focused Plite selection/mapping/root/history/React/Yjs tests; source-first typechecks for `@platejs/plite`, `@platejs/plite-react`, `@platejs/plite-history`, and `@platejs/yjs` |
| 2. Table state migration | Table | Replace every `TableCellSelection` creation/read with directional core node selection; keep grid/span derivation and gestures | Slice 1 public API is stable | Pointer, Shift-arrow, select-all, row, and column flows store no Table selection payload | Full `@platejs/table` tests including `BaseTablePlugin.selection.spec.tsx`, `TablePlugin.onKeyDown.spec.tsx`, `useTableSelectionDOM.spec.tsx`, and the slow mapping suite |
| 3. Projection and public API cut | Plite and Table | Promote generic node marks, route slice projection through `editorReads.slice.get`, expose one Table selection view, cut convenience reads, simplify DOM projection | Table state uses NodeSelection | Marks, clipboard, and Table UI consume core exact nodes plus one Table-derived view | Marks/slice/clipboard tests, Table API typecheck, public import smoke, zero removed symbols in live source |
| 4. Delete custom-selection infrastructure | Core and Plite | Remove `selectionKinds`, specs, compiler/registry/runtime types, generic protocol branches, exports, and synthetic kind tests | Table no longer registers a kind | `SelectionValue` contains built-ins only and no runtime can install another kind | Core/Plite tests and typechecks, `rg` zero scan for production `selectionKinds`, `EditorSelectionSpec`, and `table-cell` |
| 5. Adopt and teach final architecture | AI, registry, docs, Vision, skills, release artifacts | Migrate consumers; preserve selection-package deletion; update source rules, doctrine version, docs, four current changesets, changelog, barrels, and generated registry/mirrors | Public code target is final | No stale import, wrapper, old example, or doctrine remains | `pnpm brl`; `pnpm install`; skill parity/version validators; docs checks; `pnpm --filter www build:registry`; affected source-first typechecks |
| 6. Closure | Cross-owner | Run development then strict Plite gates, real Browser Table flows, and P1 review | Slices 1-5 pass focused proof | All behavior laws pass and review has no P0/P1 finding within the allowed invocation cap | `pnpm check:plite:dev`; `pnpm check:plite`; focused `/blocks/table-demo` Browser matrix; P1 `autoreview`; final stale-symbol and diff audit |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Block selection had a second state/plugin authority | HEAD package sources contain plugin/store/hooks/SelectionArea; current diff deletes all 21 package files; current live source count is zero | Zero live package/export/import references; AI/menu/DnD/registry consumers use core selection | pass |
| Former consumers are understood | AI, block menu, and DnD used selected blocks; column/math/table used marquee visibility; Table also used whole-node overlay | Consumer compilation, package proof, registry generation, and Browser flows pass | pass |
| Table was the only production custom selection kind | Owner-scoped scan found only `BaseTablePlugin.ts` declaring the `table-cell` selection kind; other declarations were synthetic protocol tests | Zero production `selectionKinds`, `EditorSelectionSpec`, or unsupported-kind branches | pass |
| Selected cells are derived | `packages/table/src/lib/internal/selection.ts` reads endpoints, compiles grid, closes spans, and derives anchors, entries, keys, bounds, and membership | `cells` payload deleted; 262 Table tests pass using core exact nodes | pass |
| Row and column expansion work | Planning suite covered horizontal/vertical expansion, repeated origin, full rectangle, and inverted contraction | Full Table suite, 11 focused Chromium rows, and in-app 2x2 expansion proof pass | pass |
| Custom mapping defect is removed | Planning slow run failed named-root persisted-cell mapping at `assertTableCellSelection(selection)` | Built-in NodeSelection mapping/root/history/Yjs proof and strict suite pass | pass |
| Plain Slate `Range` cannot represent a column rectangle | A linear range between cells also covers intervening document content; exact cell membership is already a path set | Browser reports only intended cell keys while native DOM range count remains zero | pass |
| Directional NodeSelection preserves Table intent | Planning NodeSelection canonicalized paths and lost origin/active edge | Forward/backward expansion, endpoint mapping, and strict browser proof pass with explicit endpoints | pass |
| Table UI behavior is browser-proven | Planning route initially failed on a closed-schema `id` error | Rich demo renders; selection, contraction, clipboard, typing, undo, native selection, and runtime-error checks pass | pass |
| Singular selection reads and predicates agree | The first implementation returned a representative node range from `selection()` but kept node-kind branches in `isCollapsed()`, `isExpanded()`, and block predicates | Core and named-root tests prove every generic predicate observes the same representative range; exact membership remains plural-only | pass |
| Exact node selection survives DnD | Making nonempty node selection range-expanded exposed a DnD hover path that collapsed the exact selection before drag | DnD collapses only expanded text/range selection when `.nodes()` is empty; its 34-test suite includes exact multi-node preservation | pass |
| No document migration is needed | Table node content/schema is independent from ephemeral selection envelopes | Document content stays unchanged; v3 NodeSelection decodes to v4; beta `table-cell` envelopes reject | pass |

Conditional evidence:

- High-risk scenarios: applies. Directional endpoint deletion/move, merged-cell
  closure, inverted contraction, named roots, undo/redo, history persistence,
  Yjs mapping, clipboard shape, native caret/selection, IME, drag/drop, and large
  cell-set projection each have an owner and proof row above.
- External research: inapplicable. This is a deletion/adoption decision over a
  current local API whose literal owners and behavior tests are available.
- Issue/PR provenance: inapplicable. The user requested a local architecture
  hard cut; no public issue or PR claim is being judged or mutated.
- Docs/registry/browser/release/behavior-law owners: applies. Slice 5 owns
  current teaching and generated registry output; Slice 6 owns real Browser and
  release-quality proof. No release or GitHub mutation is authorized.

Findings:

- `BlockSelectionPlugin` was not Table's multi-cell engine. It was a separate
  block-selection authority used by AI, block menu, and DnD; Table only consumed
  marquee visibility and whole-node overlay state from it.
- Table multi-cell selection is the sole production custom selection kind. Its
  `cells` ranges are cached/serialized derived data, not the source of table
  geometry.
- Table derives its rectangle from the editor selection's anchor/focus cells,
  then closes the rectangle over row/column spans. The vertical and horizontal
  keyboard behavior is already covered by focused tests.
- A plain `Range` is insufficient for a selected column because it is linear.
  Built-in `NodeSelection` is the correct exact set, but it needs explicit
  anchor/focus paths before it can preserve reverse expansion and contraction.
- The custom protocol creates far more code than its single user warrants and
  its named-root persistence test currently fails. Keeping it is the riskier
  choice.
- Registry `NodeSelectionKit` is not another selection authority. It is DOM
  gesture and overlay code that writes Plite selection directly; it survives
  only at that presentation boundary.
- `selection()` and generic range predicates must tell the same story. The
  initial implementation violated that law by returning an expanded
  representative NodeSelection range while `isExpanded()` still returned
  false through a kind branch.
- Exact membership and range expansion are intentionally different facts. A
  selected empty node has one exact member but a collapsed representative
  range. AI therefore needs its exact-node signal as well as range expansion;
  DnD must preserve exact nodes instead of collapsing them as generic expanded
  text.

Decisions and tradeoffs:

- Hard-cut `selectionKinds` and `TableCellSelection`; do not rename either.
- Keep only built-in text and node selection state in Plite. Make node selection
  directional instead of inventing a Table payload.
- Keep `editor.read.selection()` as the common `Range | null` read. Its node
  projection is representative, never exact membership. Exact consumers use
  `.nodes()`, `.ranges()`, or `.contains()`.
- Preserve built-in NodeSelection v3 decode because Plite owns that serialized
  contract. Reject beta-only `table-cell` envelopes because preserving them
  would retain the removed extension protocol. This loses ephemeral restored
  selection/history position, not document content.
- Keep Table's rectangle/span geometry, navigation updates, slice projection,
  and incremental DOM attributes. Those are genuine Table behavior. Remove
  every state or convenience layer around them.
- Keep registry gesture components local. Promotion to core would wrongly make
  headless Plite own browser hit-testing and styling.

Review fixes:

- Hard-cut review rejected the initial tempting swap to today's NodeSelection:
  its canonical path set loses gesture direction. The target adds only the two
  endpoint paths needed by Table and other directional multi-node consumers.
- API review consolidated Table selection reads into one derived view and core
  exact-node reads instead of preserving convenience wrappers.
- Final P1 source audit removed the last kind-specific generic predicate
  behavior: `selection()`, `isCollapsed()`, `isExpanded()`, and block predicates
  all inspect one representative range in normal and named-root views.
- The same audit found and fixed a real DnD regression: hover no longer
  collapses an exact multi-node selection merely because its representative
  range is expanded. The AI exact-node OR remains because empty selected nodes
  prove it is semantic, not boilerplate.
- Closure review found that backward AI NodeSelection endpoints were not
  persisted across reload/regenerate. Request snapshots and stored AI node
  snapshots now retain anchor/focus identity and fail closed when an endpoint
  disappears.
- Closure review found that Table slice middleware read live editor selection
  instead of the invoking transaction snapshot. Table projection now derives
  exclusively from the supplied state, with a regression test that deliberately
  disagrees with the live editor.
- The second closure review correctly rejected a patch Table changeset for the
  public API removals. Table and AI changesets are major. The third and final
  allowed P1 invocation is clean.

Review scope baseline:

- Request: hard-cut every parallel block/custom/Table selection authority and
  keep one core Plite selection authority.
- Violated invariant: exact multi-node state, direction, mapping, history, and
  collaboration belonged to multiple plugin-defined state shapes instead of
  one built-in selection protocol.
- Target: current `next` checkout at the source cursor below, including its
  accepted uncommitted migration; no commit, push, PR, tracker, release, or
  `templates/**` mutation.
- Intended behavior: directional built-in NodeSelection owns exact membership;
  Table derives rectangular geometry and clipboard projection; registry code
  owns DOM gestures and rendering only.
- Owner boundary: Plite selection protocol/reads/updates, Table geometry and
  slice projection, Plite React DOM/clipboard routing, current API teaching,
  and the stable node identity passed through read middleware.
- Relevant siblings: mapping, named roots, history, Yjs, selection marks,
  React views, Table keyboard/pointer/clipboard/DOM projection, AI/DnD/menu
  consumers, registry demos, docs, changesets, barrels, and generated skills.
- Public and product contracts: hard break for extension-defined selection
  kinds and beta `table-cell` envelopes; preserve document content, native
  caret/selection behavior, exact selected cells, row/column expansion,
  undo/redo, collaboration, clipboard shape, and callback inference.
- Scope governor: unrelated accumulated checkout drift is review context, not
  authority to broaden this migration; only P0/P1 findings on this invariant or
  owner-boundary neighborhood are implementation blockers.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Used `rg -E`, which this `rg` interpreted as encoding | 1 | Use grouped default regex syntax | Census rerun successfully |
| Broad docs scan included generated/harvester noise | 1 | Restrict scans to literal owners and live docs/rules | Exact custom-selection teaching owners isolated |
| Bun slow-test path without `./` did not match the nonstandard filename | 1 | Pass `./packages/table/src/lib/BaseTablePlugin.selection.slow.tsx` | Suite ran and exposed the 20/1 result |
| Used zsh readonly variable name `status` in the port probe | 1 | Rename the shell variable | Port and route checks completed |
| Browser binding initially pointed at an unavailable tab | 1 | Follow Browser recovery and select the current in-app tab | Correct demo opened; its schema error was captured and the tab closed |
| Opened the dev route through `127.0.0.1`, so Next blocked hydration chunks | 1 | Use the server's allowed `localhost` origin and rerun the same browser actions | Hydrated demo selected the exact 2x2 cell rectangle with zero runtime errors |
| A broad formatter introduced unrelated quote churn | 1 | Run the repository formatter only on the owned files and inspect the narrow diff | Product files returned to repository format without retaining formatter noise |
| Initial AI DTO typing treated exact node selection as a `Range` | 1 | Split representative `selection` from exact directional `nodeSelection` in the request contract | Package and www typechecks pass without server-side kind assertions |
| The first fake Table stream marked the last cell finished instead of applying it | 1 | Stream every cell update as `streaming`, then emit a separate terminal event | Browser proof updates both selected cells and restores the exact two-cell selection |
| The first review regression patch hit the wrong repeated fixture | 1 | Target the named backward-selection test and rerun it red before the fix | The endpoint-loss test failed before the fix and passes after it |
| Table transaction proof initially referenced plugin state absent from the narrow state type | 1 | Move snapshot-only projection into a private helper over the supplied editor state | Table source-first typecheck and transaction mismatch regression pass |
| `oxfmt` ignored the plan directory and reported no target file | 1 | Keep the manually wrapped Markdown and use the owning completion checker plus diff whitespace audit | The completion checker and `git diff HEAD --check` pass |

Verification evidence:

- Current source cursor: branch `next`, commit
  `168a4490e2ccf90dd9b1bd3230fb2f528460caa2`, plus the user's shared
  uncommitted migration and the accumulated shared checkout.
- Directional built-in NodeSelection uses required `anchorPath` and
  `focusPath`, codec v4 with v3 decode, exact `.nodes()` and `.ranges()`, and a
  representative `selection(): Range | null`. Mapping, roots, history, Yjs,
  React views, replacement, and reconstruction contracts pass.
- Table stores only directional NodeSelection, exposes one
  `TablePlugin.read.selection(at?)` geometry view, and projects table-shaped
  clipboard slices through `editorReads.slice.get`. Its full package run is 262
  passing tests.
- DnD has no local selection wrappers: exact membership uses
  `editor.read.selection.nodes()`, mutation uses
  `editor.update.selection.setNodes()`, and block enumeration uses
  `editor.read.nodes.blocks()`.
- Table owns `read.canMerge()` and `read.canSplit()`. Border reads and
  `setCellBackground({ color })` derive selected cells inside the package;
  registry plugin/read wrappers, duplicated predicates, selected-cell mapping,
  and the public `selectedCells` write option are gone.
- AI owns `AIChatRequestContext`: `selection` is the representative
  `Range | null`, while `nodeSelection` carries exact paths and directional
  endpoints. The server resolver reconstructs selection without caller kind
  assertions. Fake transport consumes submitted children, refs, and selection,
  and backward endpoints survive reload/regenerate.
- Final source review aligned every generic selection predicate with the
  representative range in both runtime views. Focused Plite selection/runtime
  proof passes 789 tests. The empty-node row independently proves collapsed
  representative range plus one exact selected node.
- AI prompt proof passes 80 tests and distinguishes exact selected nodes from
  expanded representative ranges. DnD proof passes 34 tests and preserves exact
  node selection while dragging.
- Plite React is 75 files and 1,102 passing tests. Native node-selection
  clipboard capture is routed at the editor root and its focused Chromium row
  passes.
- The stable selectable-node middleware passes `nodeKey` from the runtime owner
  instead of asking stale nodes for live paths. Toggle has 11 passing tests,
  including detached-node identity, and Plite/Toggle source-first typechecks
  pass.
- Focused Chromium proof: 11 Table rows pass and the node-selection row passes.
  Hydrated in-app Browser proof on `http://localhost:3000/blocks/table-demo`
  selected exactly
  `[Heading, '', Image, Yes]` after Shift+Down then Shift+Right, kept focus in
  the editor, reported a collapsed native selection with zero DOM ranges, and
  produced zero runtime errors.
- Closure Browser proof on `/blocks/table-demo` selects two cells, applies
  background and border changes to both, merges 16 cells to 15 with `colspan=2`,
  and splits back to 16 through package-owned eligibility reads. Browser proof
  on `/blocks/editor-ai` selects `✅` and `Paid Extension`, streams an update to
  both cells, and preserves an exact selected count of two.
- Six closure-focused AI/Table files pass 69 tests with 135 expectations.
  Source-first AI/Table typecheck passes 39 tasks; www typecheck passes 59
  tasks.
- `pnpm check:plite:dev` passes in 113,741 ms. Strict `pnpm check:plite`
  passes typecheck, package tests, contracts, and Chromium with 710 passes, 8
  skips, 79 bounded batches, and a 384,546 ms total duration.
- `pnpm brl` passes 56/56. `pnpm --filter www api-reference` regenerates the
  public API manifest, and `pnpm --filter www build:registry` emits 380 canonical
  payloads and 15 overlays. Docs/API reference checks, registry changelog
  invariants, changeset status, package schema adoption, Plate Next v110, and
  source/generated skill parity pass.
- The www production build compiles, then an unrelated existing Chinese Plite
  History route fails prerender because `TooltipProvider` is absent. This does
  not affect the runnable selection routes or required Plite gates.
- Final live scans find zero `selectionKinds`, `EditorSelectionSpec`,
  `TableCellSelection`, `BlockSelectionPlugin`, `SelectionArea`,
  `useBlockSelection`, `@platejs/selection`, or `NodeSelectionKit` consumers in
  current packages, registry source, docs, rules, manifests, or lockfile.
  Remaining hits are immutable doctrine/release/migration history. The live
  Plite Layout `kind: 'table-cell'` is a page-layout box discriminator, not an
  editor selection kind.
- Closure source scans find zero DnD/Table registry wrappers, zero Table live
  editor selection reads inside transaction middleware, and zero Table,
  SelectionApi, or selected-cell reconstruction imports in `use-chat.ts`.
  Generated `dnd.json`, `table.json`, `use-chat.json`, `ai-api.json`, and
  `editor-ai.json` have the same final API shape. DnD direct core calls, Table
  package eligibility reads, and the AI request snapshot are present.
- Plate Next doctrine v110 validates with 43 active and 3 retired packages;
  source/generated resources are exact and all 14 doctrine-version tests pass.
- `pnpm changeset status` passes and classifies both `@platejs/ai` and
  `@platejs/table` as major. `git diff HEAD --check` passes across the shared
  checkout.
- Changed-scope P1 autoreview used all three allowed invocations. Its two code
  findings and one release finding were fixed and narrowly proved; the final
  invocation reports no accepted or actionable P0/P1 finding.
- The final autogoal checker passes with every accepted checkpoint closed.

Current handoff:

- Ownership and final API: Plite owns one directional exact-node selection;
  Table owns one derived rectangle view and its grid behavior; registry owns DOM
  gestures and overlays only.
- Public breaks and adoption: `@platejs/selection`, `selectionKinds`,
  `EditorSelectionSpec`, `TableCellSelection`, Table selection convenience
  reads, and every stale live export/example are gone. No alias or runtime
  bridge survives.
- Runtime/package/docs/browser closure: endpoint mapping, named roots,
  history/Yjs, marks, clipboard shape, native selection, renderer cleanup,
  aligned generic predicates, empty-node exact membership, DnD preservation,
  Table row/column geometry, generated barrels/registry, source-generated
  skills, changesets, and the rich Table demo pass their assigned proof.
- Closure packet: DnD uses direct core selection calls; Table owns reusable
  eligibility, border, and background behavior; AI request snapshots own all
  server/fallback selection context and preserve exact direction.
- Open item: none. Product code is frozen; no commit, push, PR, tracker,
  release, or template mutation occurred.

Timeline:

- 2026-08-25T17:25:44.574Z Plate Plan created.
- 2026-08-25 Prompt requirements and hard-cut completion threshold captured
  before the owner census.
- 2026-08-25 Block/plugin consumers, all custom-kind owners, Table derivation,
  current behavior, API target, deletion cone, and proof gates resolved.
- 2026-08-25 User accepted the exact plan with `go`; one-shot execution goal
  created and Slices 1-6 reopened for implementation evidence.
- 2026-08-26 Slices 1-5 and every product/runtime proof row completed. The first
  mixed-checkout review input was rejected by security preflight, so review was
  narrowed to the coherent changed-source bundle without generated payloads.
- 2026-08-26 Source review fixed representative-range predicate drift and DnD
  exact-selection collapse, then reran focused, strict, and Browser proof.
- 2026-08-26 User accepted the full DnD/Table/AI cleanup. A new one-shot goal
  reopened this plan, and the exact deletion, package-promotion, request-context,
  proof, and no-GitHub-mutation requirements were captured before product edits.
- 2026-08-26 DnD wrappers, Table registry policy, selected-cell write plumbing,
  and AI live-editor fallback reconstruction were removed. Focused, source-first,
  generated registry, Browser, development, strict, diff, stale-symbol, and P1
  gates passed; the plan returned to complete.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Complete hard cut and DnD/Table/AI closure packet |
| Where am I going? | Final handoff with no Git or release mutation |
| What is the goal? | Delete parallel Plate selection machinery unless a hard law or independent current job proves it must survive |
| What have I learned? | See Findings |
| What have I done? | Completed the original hard cut, removed the remaining DnD/Table/AI glue, and passed every accepted proof and review gate |

Open risks:

- Persisted beta `table-cell` selection/history envelopes intentionally reject;
  document content is unaffected.
- This is intentionally major API work: extension-defined selection kinds,
  Table convenience reads, and the `selectedCells` write option have no
  compatibility aliases.
