# Node selection exact membership hard cut

Objective:
Make Plite `NodeSelection` exact-membership-only; done when every caller uses
the canonical owner and focused, strict, browser, stale-symbol, review, and
plan gates pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-24-node-selection-exact-membership-hard-cut.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- none

Mode:
- `standard`: the accepted target is a breaking Plite selection-model and API
  migration with Plate, React, DOM, registry, docs, and browser adoption.

Completion threshold:
- `NodeSelection` contains exact structural membership only: no aggregate
  `Range`, anchor/focus, or direction source of truth.
- Canonical membership removes duplicates and descendants of selected
  ancestors once, before persistence or mutation.
- Plite queries and compatible transforms target exactly selected nodes or
  projected ranges; disjoint selection never includes an unselected middle
  node.
- Live selection writers accept the smallest honest collection of `Path`,
  `NodeKey`, or live descendant targets, resolve in the active state/root, and
  treat empty input as clear.
- Every production adapter, package, registry component, test, doc, export, and
  generated owner uses the surviving contract; every accepted local helper and
  fake public noun is deleted or localized.
- Focused package/type/browser proof, strict Plite proof, stale-symbol sweeps,
  applicable registry/barrel/changeset checks, P1 autoreview, and the final
  goal checker pass with no unresolved verified P0/P1 finding.

Verification surface:
- `packages/plite/src/interfaces/selection.ts`, selection protocol/state,
  public state, node/mark/slice transforms, mapping/codecs, and their unit/type
  contracts.
- `packages/plite-react` selection hooks and native editable behavior;
  `packages/core`, AI, Indent, Cursor, Table, and copied registry consumers.
- Exact disjoint, ancestor/descendant, empty-node, named-root, replacement,
  clipboard, deletion, undo, focus, and follow-up input proof.
- Source sweeps for the rejected aggregate-range contract, redundant path
  packers/ancestor filters, direct node-key DOM parsing, dead public aliases,
  and stale teaching.
- `pnpm check:plite:dev`, `pnpm check:plite`, focused Chromium node-selection
  proof, applicable package typechecks/tests, barrels, registry generation,
  changeset status, and P1 autoreview.

Constraints:
- The user accepted the exact target in the preceding audit and said `go` on
  2026-08-25. Execute continuously while a safe in-scope move remains.
- Plite is the only generic selection authority. Do not create Plate Core
  selection state, a `blockSelection` namespace, a public node-selection
  plugin, `SelectionArea`, or another selection package.
- No public compatibility aliases, overload shims, dual payloads, deprecated
  fields, or hidden aggregate-range reconstruction.
- Preserve text selection's normal single `Range`; do not invent universal
  multi-cursor text editing or disjoint text insertion.
- Keep feature-specific selection law such as Table's rectangular kind and
  app-owned pointer/render policy in their existing owners.
- Keep `CursorOverlayPlugin` in `@platejs/cursor`; only localize dead cursor
  constants/types and simplify fake string typing where source proves it safe.
- Preserve native focus, IME, clipboard, history, collaboration mapping,
  named-root ownership, serialized-data decoding, and follow-up typing.
- `templates/**` is CI-owned. `apps/www/public/r/**` and other generated
  registry output are generator-owned; never edit them by hand.
- Do not commit or push. Preserve unrelated checkout bytes.

Boundaries:
- In scope: Plite selection payload/protocol/queries/writes/transforms; Plite
  React subscription target; DOM resolution reuse; Core, AI, Indent, Cursor,
  Table, registry UI, docs, tests, changesets, barrels, and doctrine adoption.
- Source owners: Plite owns structural membership, projections, mapping,
  selection reads/writes, and exact transform targeting; Plite React owns the
  reusable selection subscription; existing DOM APIs own node resolution.
- Plate adoption: feature packages retain domain transforms and consume exact
  Plite targets; copied registry UI retains marquee geometry, presentation,
  and kit wiring without owning membership.
- Non-goals: universal multi-range text selection, product-specific block
  commands in Plite, a public marquee/controller API, Plate Core promotion,
  Table-kind flattening, registry visual redesign, or unrelated cleanup.

Output budget strategy:
- Read exact owners and symbol-bounded consumers first. Count files/matches
  before printing; exclude generated mirrors, templates, history, build output,
  and `node_modules` from authored stale sweeps. Cap broad command output and
  inspect failing owner slices instead of streaming full logs.

Blocked condition:
- Stop only if a hard native-input, mapping, serialized-data, or installed-kind
  law proves exact-membership-only node selection cannot preserve correctness,
  or the same external/tooling blocker recurs through the goal-tool threshold
  with no autonomous alternative. A failing test triggers owner repair, not
  restoration of duplicate selection authority.

Plite Plan state:
- status: complete
- phase: completed
- next: none
- handoff: complete

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Every accepted cut, survivor, non-goal, proof boundary, and no-commit constraint is materialized above |
| Active goal and plan verified | yes | One-shot execution goal points to this exact plan |
| Current owners read | yes | Accepted full-diff audit read Plite selection/protocol/state/transforms and every ranked production consumer; fresh re-read precedes edits |
| Best API target resolved | yes | Exact path/root structural membership; derived ranges only; flexible live-target writer; no Plate Core or new plugin/namespace |
| Mode and execution boundary resolved | yes | User said `go`; standard one-shot accepted-plan execution |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Refresh current API/docs/tests/exports/behavior claims against live source before the first product edit.
- [x] Reusable public call shape has one accepted `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks have complete adoption/deletion answers; no private bridge is accepted.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Implement exact-membership payload, canonicalization, projections, mapping, codecs, and behavior predicates.
- [x] Implement exact implicit node/range targeting and consolidate internal structural replacement behavior without a new public API.
- [x] Widen the live writer to honest `Path`/`NodeKey`/node targets with empty-clear semantics and migrate every production packer.
- [x] Widen the existing Plite React hook target and delete the Table-local duplicate subscription.
- [x] Reuse Plite DOM node resolution and delete direct `data-plite-node-key` parsing in copied UI.
- [x] Delete/localize accepted dead aliases, filters, helpers, cursor type theater, stale exports, tests, and teaching.
- [x] Run automatic `best-api repair`, update only durable Plite Vision/API doctrine, audit affected workers, run `pnpm install`, and prove mirrors/stale teaching.
- [x] Add current-behavior tests and changesets; run focused, strict, browser, generated-owner, barrel, and applicable checker inputs.
- [x] Obtain one P1 autoreview result. An exact 331-file task-only review rerun completed four chunks with zero P0/P1 findings.
- [x] Record exact evidence, owned files, remaining risk, and final handoff.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every runtime and type readiness condition | Strict Plite passed all four stages in 444142ms; final NodeSelection receipt passed five repeats |
| Fresh source evidence | yes | Recheck decision-changing current claims | Final authored sweep has no rejected selection owner or direct node-key parser; `packages/selection` is absent |
| Best API review | yes | Resolve the reusable public call shape | Exact paths plus optional root is the sole structural payload; ranges are projections; no alias, plugin, namespace, or Plate Core owner survived |
| Conditional risk and adoption | yes | Complete triggered browser and adopter proof | Named roots, Table rectangular selection, AI, Yjs, clipboard, delete, undo, typing, and navigation passed focused and strict proof; Benchmark and public provenance are N/A |
| Verification recorded | yes | Record fresh execution gates | Package, strict Chromium, registry, barrel, changeset, stale-symbol, lint, and exact unrelated blocker evidence is below |
| Handoff prepared | yes | Prepare ownership, breaks, proof, risks, and execution order | Implementation, adoption, proof, review resolution, and unrelated checkout limits are recorded below |
| P1 autoreview | yes | Run with `--max-priority P1` within the three-invocation cap | Exact task-only scope matched 331/331 checkout files; the final four-chunk rerun reported zero P0/P1 findings and `patch is correct` |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-24-node-selection-exact-membership-hard-cut.md` | Passed after the final evidence update |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Accepted audit, current owners, and constraints materialized | Decide |
| Decide | completed | Best API target and deletion cone accepted by `go` | Accepted-plan execution |
| Accepted-plan execution | completed | Slices 1-5 implemented across Plite, React, DOM, Plate adopters, registry UI, docs, doctrine, and release artifacts | Prove and hand off |
| Prove and hand off | completed | Runtime/type/browser/stale-symbol proof is green; exact task-only P1 review completed four clean chunks | Goal closure |

Decision brief:
- outcome: finish the single-authority cut by removing the second truth inside
  Plite's own `NodeSelection` and the boilerplate it forces above the kernel.
- chosen shape: structural selection stores only canonical exact membership and
  optional root; selection-kind protocol derives ranges and behavior. Live
  writers resolve `Path`, `NodeKey`, or live-node collections atomically.
- strongest rejected alternative: retain an aggregate `Range` as direction or
  compatibility metadata. It can contradict membership, drives envelope-based
  mutation, and makes structural predicates depend on text content.
- consequence: public `NodeSelection` construction and `setNodes` inputs break;
  callers, tests, codecs, docs, and generated declarations migrate in one cut.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Node-selection value | `Range & { kind: 'node'; paths; root? }` | `{ kind: 'node'; paths; root? }` | Plite selection interface/protocol | Range and paths are contradictory authorities | constructors, codecs, state, docs, types | invalid contradictory fixture; codec/map/query tests | persisted v2 payload migration | rearchitect |
| Canonical membership | sort + exact dedupe | sort, exact dedupe, and drop descendants of selected ancestors | Plite selection protocol | prevents duplicate content/mutation once | delete four caller filters | nested selection/slice tests | path/root ordering | rearchitect |
| Range projection | raw selection doubles as aggregate envelope | protocol derives per-member ranges only where a range job exists | Plite selection kind | exact membership must not imply a continuous span | reads, marks, input, clipboard, replacement | disjoint nodes never include middle | operations that require one insertion point | rearchitect |
| Structural predicates | projected text ranges define collapsed/expanded | structural kind has explicit semantics independent of text content | Plite public state | empty/populated node content cannot define selection cardinality | AI/input/hook callers | empty and populated node tests | generic callers assuming Range | rearchitect |
| Implicit node targeting | first-to-last envelope or caller loops | exact selected nodes/ranges for compatible reads and transforms | Plite nodes/transactions | removes duplicated fan-out and skipped-middle bugs | block menu, indent, marks, nodes | disjoint action tests | transform semantics that require one point | rearchitect |
| Live writer | non-empty `Path` tuple | readonly `Path | NodeKey | Descendant` targets; empty clears | Plite selection update | resolution/canonicalization belongs in active state/root | AI, DnD, registry, tests | inference + deleted/moved/foreign-key tests | mixed roots/foreign keys | rearchitect |
| React selection hook | `Path` only | existing hook accepts `Path | NodeKey` | Plite React | stable-key subscription is a reusable adapter job | delete Table duplicate | hook/table tests | subscription invalidation | extend |
| DOM target resolution | registry parses `data-plite-node-key` | reuse `editor.api.dom.resolvePliteNode` | Plite DOM API | one DOM identity decoder | node selection and block menu | component/browser tests | stale/unowned DOM | reuse |
| Replacement implementation | parallel text/slice structural planners | one internal exact-membership planner | Plite editor commands | public API does not need implementation taxonomy | commands, marks, slice | replacement/delete/copy tests | ordering and rollback | merge |
| Public/local tail | alias types, one-use constants, fake string union, packers and filters | delete or localize at current owner | Plite/Cursor/registry | no independent current job | exports and callers | zero authored hits + types | hidden consumer | cut |
| Registry kit and feature kinds | private node-selection UI descriptor; Table rectangular kind; Cursor plugin | keep in current owners | Registry/Table/Cursor | independent pointer/render, grid, and cursor jobs remain | only call-shape adoption | focused owner proof | accidental owner migration | keep |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Payload and protocol | Plite interfaces/selection protocol | remove aggregate range, canonicalize membership, map/codec/project exact paths, define structural predicates | fresh source refresh | one runtime payload and coherent protocol | focused protocol/state/type tests |
| 2. Exact queries and transforms | Plite reads/commands/node/mark/slice owners | remove envelope targeting, use exact projections, merge internal replacement paths | slice 1 green | no compatible core operation needs caller fan-out | command/transform/slice tests |
| 3. Writer and adopters | Plite state plus Core/AI/Indent/Table/registry | broaden inferred writer target, migrate packers/loops, preserve roots and keys | slice 2 green | all live writers use one resolver | package types and focused owner tests |
| 4. React/DOM/UI cleanup | Plite React and copied registry | widen hook, delete Table duplicate, reuse DOM resolver, delete accepted UI helpers/types | slice 3 green | UI owns only geometry/presentation | component tests and browser route |
| 5. Teaching/release/doctrine | docs, changesets, barrels, generated owners, source rules | latest-state docs, changesets, `best-api repair`, worker audit, regeneration | slices 1-4 green | no stale contract remains | stale sweeps, install, barrels, registry checks |
| 6. Closure | Plite/Plate proof owners | strict Plite, focused Chromium, root-proportional checks, P1 autoreview and repairs | slices 1-5 green | every required gate green or exact unrelated blocker recorded | command receipts and final checker |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Aggregate range is a second authority | live `NodeSelection` intersection plus separately validated range/paths | live value cannot represent anchor/focus; private versioned decoders canonicalize persisted legacy payloads | passed |
| Canonical membership prevents duplicate ancestors | four caller filters and slice duplication path | protocol, writer, node, slice, and transform tests prove exact dedupe and descendant removal | passed |
| Disjoint selection stays disjoint | current first-to-last node query and UI fan-out | exact query, node transform, mark, list, AI, Table, media, and registry tests passed | passed |
| Structural predicates ignore node text | current range-derived collapsed/expanded reads | structural predicate tests cover empty and populated selected nodes | passed |
| Live targets resolve atomically | five path tuple packers and AI key-resolution helpers | path, key, node, moved/deleted, foreign-key, empty-clear, and named-root contracts passed | passed |
| UI has no second identity decoder | direct dataset casts in node-selection and block-menu | copied UI uses the DOM owner; authored sweep found no direct `data-plite-node-key` parse | passed |
| Native editing remains legal | prior node-selection Chromium lane | final five-repeat receipt and strict 710-test Chromium corpus passed focus, copy, type, delete, undo, and navigation | passed |
| Public teaching matches one authority | accepted audit of exports/docs | Vision, worker doctrine, current docs, registry changelog, 24 changeset files, mirrors, and stale authored sweep agree | passed |

Conditional evidence:
- High-risk scenarios: disjoint sibling selection must not mutate/copy the
  middle sibling; ancestor+descendant input must canonicalize without duplicate
  output; empty/populated and named-root node selection must preserve focus,
  mapping, replacement, deletion, undo, and follow-up typing.
- External research: N/A; the accepted full-diff audit and live local owners
  resolve the API/runtime target.
- Issue/PR provenance: N/A; user-directed local architecture work with no
  public GitHub mutation.
- Browser: applicable because native focus, selection projection, clipboard,
  replacement, deletion, undo, and navigation change.
- Benchmark: N/A unless focused gesture/editing proof shows a regression; no
  performance claim is part of the target.
- Docs/release/behavior law: applicable for latest-state docs, changesets,
  selection contracts, generated owners, and doctrine repair.

Findings:
- The preceding exhaustive diff audit classified 747 changed/untracked paths,
  scanned 96 authored runtime/tooling sources, and traced 510 generated
  registry mirrors to authored owners.
- `NodeSelection` stores only canonical nonempty `paths`, `kind: 'node'`, and
  an optional named root. `SelectionApi.ranges` derives one range per member.
- `editor.read.selection.nodes()` and compatible node transforms consume exact
  members. Disjoint selection never expands through an unselected middle node.
- `editor.update.selection.setNodes` resolves paths, node keys, and live nodes
  in the active root; an empty collection clears selection.
- Plite React owns the reusable node-selection subscription. Plite DOM owns
  DOM-to-node identity. Table retains only its independent rectangular law.
- The hard cut deleted `@platejs/selection`, `BlockSelectionPlugin`,
  `SelectionArea`, the `blockSelection` namespace, and a public
  `NodeSelectionPlugin`. The copied `NodeSelectionKit` is private UI wiring.
- A strict failure exposed browser-handle root leakage, not a Plite selection
  bug. The handle now serializes text and node selection local to its attached
  root while the canonical runtime retains named-root ownership.
- `tooling/scripts/check-plite.mjs` duplicated the package dependency graph and
  omitted Browser's new Plite edge. Strict definitions now derive dependencies
  from package manifests; the redundant graph-copy test is gone.

Decisions and tradeoffs:
- Direction is not retained on structural selection without a proven current
  job. Pointer UI may keep transient gesture direction privately.
- Operations that truthfully need one insertion point must define or reject
  structural multi-selection explicitly; they may not silently use an envelope.
- `SelectionApi.node(s)` may survive only if detached/static construction still
  has independent jobs after payload removal; its signature hard-breaks to
  membership/root inputs rather than accepting a range.
- `NodeSelectionKit`, Table selection, Cursor overlay, and registry variants
  survive for their independent owners. No Plate Core selection API is added.

Review fixes:
- Preserved Table's registered rectangular range payload instead of flattening
  all selection kinds into generic text or node selection.
- Made text-only plugin commands use `primaryRange()` and made command
  interceptors defer when projecting the first selected node would lose exact
  multi-selection.
- Defined caret exit for multi-node selection in both directions while keeping
  the independent single keyboard-selectable-owner rule.
- Kept browser harness snapshots root-local after adding NodeSelection support.
- Removed stale public-type negative assertions for documented
  `selection.setNodes([])` clear semantics.
- Deleted the manual Plite-family dependency graph in favor of manifest-derived
  dependencies.
- Falsified the review's named-root transform claims by tracing the public
  transaction root owner and adding explicit remove, merge, move, wrap, unwrap,
  and lift contracts. All 16 rooted transaction tests passed.
- Falsified the Yjs nullability claim against the nullable generic `Selection`
  alias and added a remote `selection: null` runtime contract.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Table registered selection kind was flattened | 1 | Preserve the feature-owned raw registered kind and project only through its protocol | Focused Table suite and strict Plite passed |
| Cold NodeSelection demo hydrated after the first test action | 1 | Wait two animation frames in the focused test before marquee input | Five-repeat final receipt passed |
| ArrowDown from multi-node selection entered the last node | 1 | Exit after the final selected node, except the proven single keyboard-selectable-owner rule | Focused caret contracts and 1099 Plite React tests passed |
| Browser handle leaked named-root fields into root-local snapshots | 1 | Strip owner roots only at the test/browser adapter boundary | Two focused Chromium rows and the full 710-test corpus passed |
| Public type smoke rejected valid empty-clear input | 1 | Delete only the stale negative assertions | `pnpm plite:public-types` and strict contracts passed |
| Whole-diff P1 review rejected an unrelated 956KB manifest | 1 | Temporarily exclude only unrelated untracked review inputs | No review result; local excludes restored |
| Whole-diff P1 review rejected a secret-like shared-diff value | 2 | Stop at the three-invocation cap and construct an immutable task-only review scope | TruffleHog was clean; the exact task-only scope removed unrelated preflight noise |
| Task-only P1 review alleged named-root loss and Yjs null rejection | 3 | Trace the public owner and generic alias, then add direct runtime contracts | All claims falsified; focused tests/typechecks passed and the four-chunk rerun was clean |

Verification evidence:
- Final strict gate: `pnpm check:plite` passed in 444142ms. Typecheck passed in
  6931ms, package tests in 41245ms, contracts in 20723ms, and Chromium in
  375242ms. Chromium reported 710 passed, 8 skipped, and 79 bounded batches.
- Package proof included 1513 Plite tests, 1099 Plite React tests, Browser's
  106 Bun and 11 Vitest tests, and focused adopter suites for Core, Yjs, AI,
  Table, code block, lists, media, and suggestion.
- The final review-resolution proof added six explicit named-root
  `NodeSelection` transform rows. The rooted transaction file passed 16/16,
  the Yjs adapter file passed 3/3 including remote null clearing, and both
  modified package typechecks passed.
- All 54 modified-package typechecks passed across 93 tasks. The strict
  nine-package source-first typecheck also passed.
- Focused named-root replay passed both formerly failing editable-void rows.
  The browser-handle unit contract passed 12 tests.
- Final regression receipt:
  `node-selection-marquee`, attempt 3, completed, five Chromium repeats, exit
  0 in 11269ms, dirty ref `168a4490e2ccf90dd9b1bd3230fb2f528460caa2`,
  input fingerprint
  `sha256:933b1e9b4924a3c2c6d1f4c4d673535cc1e6bc6c09b6dfb94786cc3a7db34c2b`,
  receipt fingerprint
  `sha256:b676791a30ec412d716bf02637d0a15bcb6cb253aaf0610aea4a608e61d6ba15`.
- In-app Browser proof selected two disjoint blocks and passed focus,
  clipboard, follow-up typing, deletion, undo, and arrow navigation on
  `/blocks/node-selection-demo`.
- `pnpm --filter www build:registry` and `pnpm brl` passed. Generated registry
  output was produced only by its owner.
- `pnpm changeset status --since=main` passed. Twenty-four
  `single-selection-authority-*` changeset files cover the affected published
  packages; nine are indexed and fifteen remain untracked in the shared
  checkout. No commit or push was performed.
- `pnpm install` regenerated source/mirror doctrine after the Best API rule and
  Plite Vision update. Current docs passed the selected Unslop audit.
- Authored stale sweep returned no `SelectionArea`, `BlockSelectionPlugin`,
  `blockSelection`, `@platejs/selection`, or `NodeSelectionPlugin`; the deleted
  `packages/selection` directory is absent. Historical migrations, release
  indexes, generated registry output, and planning records were excluded.
- Copied node-selection and block-menu UI contain no direct
  `data-plite-node-key` parser.
- Whole-checkout `git diff --check` reports only unrelated trailing whitespace
  in `docs/sync/shadcn/dashboard.html` at lines 1173 and 1273.
- The package-integration www typecheck reaches only four unrelated Base UI
  errors: unsupported `onOpenAutoFocus` and its implicit callback parameter in
  `column.tsx` line 173 and `font-size-toolbar-button.tsx` line 130.
- Whole-diff review exhausted its unchanged-scope cap in preflight on unrelated
  oversized and secret-like shared-checkout inputs. Temporary
  `.git/info/exclude` entries were removed.
- A detached task-only review checkout overlaid every selection-authority file
  from the live checkout and proved 331/331 byte parity. Its first pass raised
  three P1 claims; direct owner/type inspection and new regression contracts
  falsified all three. The final `--max-priority P1` rerun completed four of
  four chunks with zero findings and `patch is correct` at 0.94 confidence.
- Final `check-complete.mjs` passed with every checklist item, completion gate,
  phase, verification record, reboot state, and open risk resolved.

Final handoff prepared:
- Ownership and target API/runtime: Plite is the only generic selection owner;
  exact membership is live truth and ranges are derived.
- Public breaks and Plate/collaboration adoption: the selection package and
  plugin/namespace API are deleted; Plate adopters, Yjs codecs, React/DOM,
  Browser, Table, copied UI, docs, and releases use the surviving contract.
- Applicable browser/Benchmark/docs/provenance decisions: browser and docs
  proof apply and passed; Benchmark and public issue provenance are N/A.
- Proof and execution risks: runtime and task-only P1 proof are green. Private
  legacy decoding and unrelated whole-www errors remain explicitly bounded.
- Execution order and user attention: no implementation or proof step remains;
  do not commit or push without separate authority.

Timeline:
- 2026-08-24T22:22:21.001Z Plite Plan created.
- 2026-08-25 user accepted the exact-membership hard cut with `go`; one-shot
  execution goal created and every explicit target/gate materialized before
  product edits.
- 2026-08-25 exact owner/caller/test refresh completed; no decision-changing
  drift invalidated the accepted target.
- 2026-08-25 slices 1-5 completed: exact membership, projections, transforms,
  writers, React/DOM adapters, Plate adopters, package deletion, copied UI,
  docs, doctrine, registry output, barrels, and changesets.
- 2026-08-25 strict proof first found a real named-root browser-snapshot
  regression. The adapter was repaired and both focused rows passed.
- 2026-08-25 final strict proof passed all stages and the final NodeSelection
  receipt passed five consecutive Chromium runs.
- 2026-08-25 three whole-diff P1 attempts ended during unrelated shared-diff
  preflight. A detached exact task scope then proved 330/330 initial byte parity.
- 2026-08-25 the first task-only review raised three P1 claims. Six named-root
  transform contracts and one nullable Yjs contract passed, both packages
  typechecked, and the refreshed scope proved 331/331 byte parity.
- 2026-08-25 the final task-only P1 rerun completed four clean chunks with zero
  findings and marked the patch correct.
- 2026-08-25 the final goal-plan checker passed.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Implementation, adoption, runtime proof, and P1 review are complete |
| Where am I going? | Goal closure and handoff |
| What is the goal? | One exact-membership-only Plite structural selection authority |
| What have I learned? | Exact membership removes caller fan-out; named-root ownership must be stripped only at root-local browser snapshot boundaries |
| What have I done? | Deleted the duplicate authority, migrated all adopters, repaired strict regressions, and passed package, browser, and task-only P1 proof |

Open risks:
- Private versioned decoders intentionally accept legacy serialized payloads
  and immediately canonicalize them. They are the only retained old-shape
  knowledge and remain required by serialized-data law.
- Whole-www closure is obscured by four unrelated Base UI type errors and two
  unrelated generated-dashboard whitespace errors. Strict Plite and focused
  package/browser gates do not include those failures.
- The shared checkout may change after this handoff. The final focused receipt
  binds nine live input files; any edit to them invalidates that receipt.
