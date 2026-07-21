# wordgard plite rewrite comparison

Objective:
Close Wordgard-versus-Plite rewrite decisions; done when every substrate
responsibility has a sourced verdict and execution slice; plan
docs/plans/2026-07-16-wordgard-plite-rewrite-comparison.md.

## Implementation refresh (2026-07-18)

The five highest-ranked residuals from this comparison—lazy canonical commit
queries, bidirectional Yjs change translation, indexed bulk anchor rebasing,
generated change laws, and a bounded per-root DOM phase scheduler—are complete
in the live tree. Their current proof and benchmark ledger is
`docs/plans/2026-07-18-plite-canonical-change-architecture.md`; older slice
status below remains the historical execution record.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-07-16-wordgard-plite-rewrite-comparison.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- none

Mode:
- `deep`: the request is an exhaustive cross-runtime comparison that may justify
  model, operation, DOM, React, history, collaboration, browser, benchmark, and
  public API breaks.

Completion threshold:
- Binary readiness: live claims sourced, one owner per responsibility, every
  decision resolved, every public break has adoption and proof, execution
  slices are concrete, conditional gates are resolved, and `check-complete`
  passes.
- Every source/export/runtime responsibility in `../wordgard` and the Plite
  package family is mapped to exactly one concept row or explicit out-of-scope
  row; the source inventory has zero unclassified rows.
- Every concept states whether Wordgard is superior, inferior, equivalent, or
  incomparable, why, and whether Plite should keep, cut, rename, move, bridge,
  defer, or gate the architecture.
- The target answers what Plite should look like if rewritten from scratch,
  including large/breaking changes without compatibility constraints.

Verification surface:
- Source manifests, exports, package boundaries, public docs, core runtime,
  operation/model, transaction/normalization, selection, DOM/input/IME,
  React/view, history, collaboration, serialization, tests, examples,
  benchmarks, and browser proof in both local repositories.
- A classified source inventory under
  `docs/plans/artifacts/wordgard-plite-rewrite-comparison/` with zero missing or
  duplicate responsibility owners.
- Focused local behavior and benchmark commands only where static source cannot
  settle a decision; planning checker after all rows are resolved.

Constraints:
- Planning only until the user explicitly accepts this exact plan and invokes
  `plite-plan` against it.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.
- Treat Wordgard as a serious architecture donor, not as an API to imitate
  blindly; retain Plite where its semantics, extensibility, correctness, or
  ecosystem fit are better.
- Prefer the best long-term substrate even when it requires breaking APIs or a
  large rewrite; do not preserve compatibility for its own sake.
- Separate measured behavior, confirmed source facts, inference, and
  recommendation. Do not claim superiority from naming or code size alone.

Boundaries:
- In scope: the complete `../wordgard` editor substrate and the complete Plite
  substrate family: `packages/plite`, `plite-dom`, `plite-react`,
  `plite-history`, `plite-hyperscript`, `plite-layout`, `browser`, and `yjs`,
  plus their live docs/examples/tests/benchmarks and only direct Plate adoption
  pressure.
- Source owners: Wordgard local repository; Plite model/runtime packages;
  Plite DOM/React/history/collaboration/browser owners; current docs and proof.
- Non-goals: implementation, compatibility design, unrelated Plate product
  plugins/UI, generic Lexical/ProseMirror/Tiptap comparison, publication, or
  editing Wordgard.
- Direct adoption owners: every concrete caller listed in
  `docs/plans/artifacts/wordgard-plite-rewrite-comparison/adoption-inventory.md`,
  with `packages/core` owning Plate composition, `packages/yjs` owning
  collaboration, `apps/plite` owning browser proof, and `apps/www` owning live
  examples. TypeScript may expand the list; no caller may retain a shim.

Output budget strategy:
- Read named owners first; enumerate/count manifests before source reads; group
  by responsibility; exclude `node_modules`, build output, caches, generated
  artifacts, and large fixtures unless they are the proof owner; store the full
  classification under the plan artifact directory and inspect bounded slices
  instead of streaming exhaustive matches.

Blocked condition:
- Block only if a decision-changing Wordgard or Plite owner is unreadable, or a
  behavior/performance claim cannot be resolved from source or focused local
  execution after three distinct attempts. Do not block on breadth while
  another owner can be classified.

Plite Plan state:
- status: accepted; execution in progress
- phase: slice 0
- next: repair stale baseline runners, then slice 1
- handoff: first representation batch complete

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Exhaustive superior/inferior/equivalent comparison, donor extraction, breaking-change freedom, and from-scratch Plite target are copied above |
| Active goal and plan verified | yes | Goal `019f4d13-4361-7bf0-b28b-33494d78a4bd` names this exact plan |
| Current owners read | yes | Complete source/package/test/proof inventory in `docs/plans/artifacts/wordgard-plite-rewrite-comparison/source-inventory.md`; decision-changing files are cited there |
| Mode and execution boundary resolved | yes | Deep planning only; implementation requires explicit acceptance of this exact plan |

Work Checklist:
- [x] Every explicit requirement, scope boundary, non-goal, stop condition,
      deliverable, verification surface, and handoff requirement is captured
      before broad exploration.
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Both repository manifests are exhaustive and every relevant file/module
      is classified into one responsibility or an explicit exclusion.
- [x] Every responsibility records Wordgard as superior, inferior, equivalent,
      or incomparable with source-backed reasons.
- [x] The from-scratch target is explicit even where it breaks Plite APIs,
      operations, package boundaries, runtime contracts, or adoption code.
- [x] Current API/docs/tests/exports/behavior claims cite live source.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | Decision ledger, execution slices, proof matrix, and adoption inventory are resolved |
| Fresh source evidence | yes | Recheck decision-changing current claims | Local Wordgard and Plite owners inspected on 2026-07-17; anchors recorded in the inventory and matrix |
| Conditional risk and adoption | yes | Complete triggered risk/browser/benchmark/provenance work or give one scoped N/A reason | Benchmark and browser gates are explicit; external/provenance work is scoped N/A below; hard-cut callers have named owners |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Source inventory, 60-row comparison, adoption inventory, execution slices, and proof matrix recorded; final checker command below |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Decision brief, target contract, hard cuts, adoption inventory, and ordered slices below |
| Autoreview | no | Planning-only documents; no implementation diff exists to review | N/A for this planning turn; execution must run `autoreview` before handoff |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-16-wordgard-plite-rewrite-comparison.md` | Final completion command recorded and rerun after state closure |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Full 74-file Wordgard and 459-file Plite production inventories; package/test/docs/proof owners classified | Decide |
| Decide | completed | 59 source-backed comparison rows and hard-cut adoption ledger | Prove and hand off |
| Prove and hand off | completed | Execution/proof matrices and final handoff prepared | User review |

Decision brief:
- outcome: Rewrite Plite's engine around a Wordgard-inspired immutable change
  algebra while retaining Plite's JSON model, stable runtime identity, typed
  extension DX, multi-root contract, React runtime, Yjs collaboration, package
  boundaries, and proof corpus.
- chosen shape: A compiled-schema, immutable JSON snapshot engine with private
  root token indexes; root-aware `ChangeSet`/`DocumentChange` as the one
  canonical delta; typed anchors and extensible selections; native transaction
  fields/facets/effects/annotations; changed-range correction; compact commits;
  derived semantic intents for adapters only.
- strongest rejected alternative: A wholesale Wordgard fork. It would gain the
  right change law but regress plain JSON, stable identity, React composition,
  multi-root editing, hidden/virtualized DOM, layout, Yjs, packaging, browser
  proof, and Plate ownership. Also rejected: adding `ChangeSet` beside current
  operation mutation, because two truths would increase rather than delete
  complexity.
- consequence: This deliberately breaks current operation truth, public live
  refs, closed `Range | null` selection, state-patch replay, per-operation
  normalizers, and the wide eager `EditorCommit`. The implementation must
  migrate all concrete callers and delete the old engine in the same program;
  no compatibility mode survives release.

Target contract:

```ts
type DocumentChange = ReadonlyMap<RootKey, ChangeSet>;

type EditorCommit<V extends Value> = {
  before: EditorSnapshot<V>;
  after: EditorSnapshot<V>;
  changes: DocumentChange;
  intents: readonly EditorIntent<V>[]; // derived, never canonical
  selectionBefore: Selection;
  selectionAfter: Selection;
  effects: readonly Effect<unknown>[];
  annotations: readonly Annotation<unknown>[];
  impact: EditorImpactIndex; // lazy changed-range/runtime-id queries
};

editor.read((state) => state.nodes.block());
editor.update(
  (tx) => {
    const target = tx.anchor(tx.selection.requireText().focus);
    tx.text.insert('hello');
    tx.effects.emit(scrollIntoView.of(target));
  },
  { history: 'merge', origin: 'input' }
);
```

Engine laws:

1. Plain JSON is the public/storage document; committed snapshots are frozen,
   structurally shared values.
2. Each root has a private token/position/identity index. Paths describe one
   snapshot; anchors survive changes.
3. `DocumentChange` is the only document mutation truth and must support
   apply, compose, invert, map, transform, serialize, correct, and changed-range
   iteration.
4. A transaction owns one draft, selection, fields, effects, annotations, and
   correction debt; it publishes exactly one snapshot/commit or nothing.
5. Semantic intents are validated derived data for Yjs, middleware, and
   diagnostics. Replaying them must hash to the commit's `after` snapshot.
6. Schema fitting handles structural validity at change construction;
   query-scoped corrections handle plugin invariants to a diagnosed fixed point.
7. React, DOM, history, Yjs, layout, and Plate consume commits. None defines or
   mutates core document truth.
8. Every new algebra/index path must delete the operation-era transformer or
   eager impact path it replaces before the slice closes.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Public model | Mutable transaction tree; immutable published snapshots; plain JSON | Frozen structurally shared JSON snapshot with private indexes | `packages/plite` | Preserve Plite interoperability while taking Wordgard immutability | Core constructors, fixtures, external value replacement | Equality, freeze, sharing, serialization, controlled-value tests | Accidental mutation assumptions | **Keep JSON; rewrite storage** |
| Schema | Behavior/property registry; structural law deferred to normalizers | Required compiled node/property/content schema assembled from extensions | `packages/plite` + `packages/core` | Wordgard proves containment/default/wrapping/fitting belong in the model | Plate plugin element specs become schema contributions | Invalid JSON, content grammar, defaults, wrapping, paste-fit corpus | Dynamic plugin configuration | **Adopt Wordgard law, not classes** |
| Coordinates and identity | Paths/points plus runtime IDs; refs transform per operation | Snapshot paths + root-aware positions/anchors + preserved runtime IDs | `packages/plite` | One mapping law without losing structural query DX or React identity | Ref callers in adoption inventory | Anchor affinity/deletion/move/property/multi-root fuzz tests | Token index cost and API churn | **Hybrid: Wordgard mapping + Plite identity** |
| Canonical delta | Mutable operation stream, then inferred commit | `DocumentChange` of root `ChangeSet`s; derived semantic intents | `packages/plite` | One algebra removes repeated transformation and impact inference | Operation callers and Yjs adapter | Apply/compose/invert/map/transform/correct laws and intent replay hash | Largest architecture break | **Hard cut operation truth** |
| Transaction/commit | Snapshot mutable state, apply ops, normalize, rollback, infer wide commit | Native draft and compact before/after/change/effect commit | `packages/plite` | Current engine is admitted retrofit (`architecture-contract.md:121-150`) | All update/commit subscribers | Atomic abort, nested update, one-publication, no-op tests | Commit consumer breadth | **Rewrite** |
| State/config | Keyed state patches and extension registries | Reducer fields, derived facets, mapped effects, annotations, named reconfigurable slots | `packages/plite` | Wordgard is more coherent; Plite typing remains better | `packages/ai`, examples, extension setup | Field serialization/history/collab/reconfigure/type inference tests | Overgeneralized facet machinery | **Adopt narrowly, structurally typed** |
| Commands | Typed priority/next dispatch with imperative tx handlers | Typed pure `false | TransactionSpec` default plus edge imperative handlers | `packages/plite`, `packages/core` | Wordgard's purity is testable; Plite's dispatch typing is better | Core command registrations and Plate command bridges | Headless command corpus and handler order tests | UI commands need side effects | **Merge strengths** |
| Selection | `Range | null`, path refs/bookmarks, DOM special cases | Discriminated text/node/cell/custom selection protocol and mapped anchors | `packages/plite`, DOM/React, table/selection packages | Wordgard supports real custom selections and logical affinity | Selection owners in adoption inventory | Serialization/map/bidi/goal/multi-range/table/browser tests | Massive typing/DOM blast radius | **Breaking adoption** |
| Normalization | Dirty paths and repeated per-op node normalizers | Schema fit plus changed-range correction queue with convergence diagnostics | `packages/plite`, plugin correction owners | Wordgard schedules by changed region and composes repair into the transaction | Core/selection/suggestion/apps normalizers | Structural corpus, correction order, cycle/cap, table/list fuzz | Different repair order can change behavior | **Rewrite and delete old loop** |
| HTML/codecs | Mostly host/plugin-owned clipboard parsing; no compiled core codec | Optional schema-linked HTML/Markdown/clipboard codecs in `plite-dom` | `packages/plite-dom`; Plate serializers | Pull Wordgard declarative parse/serialize without DOM in core | Paste HTML, serialization, docx/markdown owners only when codecs apply | Round-trip/lossy/fitted paste browser corpus | Coupling schema to presentation | **Adopt as optional DOM layer** |
| View invalidation | Wide eager commit impact plus projection/annotation/widget stores | Changed-range/runtime-ID impact index and one mapped view-layer protocol | `packages/plite-react` | Wordgard directly drives tiles/decorations from change sections | React stores/hooks/examples | Fanout, rerender, overlay, async decoration benchmarks/tests | Under-invalidating projected DOM | **Rewrite consumer side** |
| DOM scheduler/mapping | React/DOM controllers own timing; robust coverage/multi-root mapping | Explicit read/write/post-selection scheduler over anchor/token mapping | `packages/plite-dom`, `packages/plite-react` | Pull Wordgard phases; keep Plite coverage laws | Editable/input/selection/repair controllers | Browser route and matrix model/DOM/caret/IME proof | React commit coordination | **Adopt scheduler, keep contracts** |
| Input/IME | Large proven React input/composition/repair kernel | Same behavior consuming compact immutable commits | `packages/plite-react` | Wordgard is not better proven here | Internal controller simplification only | Existing input, composition, Android, clipboard, mutation corpus | Temptation to rewrite proven browser logic | **Keep behavior; simplify after substrate** |
| History | Operation/state-patch stacks and root-aware replay | Inverse changes, mapped effects, starting selection, annotation grouping | `packages/plite-history` | Wordgard history is much smaller because algebra owns mapping | History API/examples/tests | Undo/redo/group/skip/remote/multi-root/state retention benchmarks | Memory retention of slices/snapshots | **Rewrite** |
| Collaboration | Yjs operation adapter, provider/awareness/relative selections/history | Preserve Yjs features; translate canonical changes both directions | `packages/yjs` | Wordgard OT is not a production replacement | Yjs core/react callers and examples | Two-client convergence, offline/provider, awareness, undo, split-history, benchmark | Granular lowering and remote identity | **Keep Yjs; replace adapter substrate** |
| Multi-root/layout | Root-scoped reads/writes/selection/history/React and derived paged layout | Same contracts over root changes/anchors | Core, React, history, Yjs, layout | Plite is clearly stronger | Multi-root and pagination examples/tests | Atomic multi-root, focus, selection, pagination/virtualization matrix | Cross-root commit ordering | **Keep and rebase** |
| Product plugins/UI | Plate owns nodes, tables, menus, dialogs, i18n | Same boundary; only generic selection/schema/correction primitives move down | `packages/core` and product packages | Wordgard bundles useful features in the wrong layer for Plate | Table gains core selection kind; other UI stays Plate | Package-boundary import checks and product tests | Scope creep | **Reject Wordgard bundling** |
| Proof/release | Broad Plite tests/browser/benchmarks; no Wordgard benchmark | Preserve corpus, add algebra fuzz and dual-engine benchmark, hard cut once green | `packages/browser`, `apps/plite`, benchmarks, docs | Wordgard performance is unmeasured; architecture must earn adoption | All scoped packages/apps/docs | Commands in proof matrix | Long migration could leave dual engine | **Gate and delete, never ship dual mode** |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 0. Lock corpus and prototype gate | `packages/plite/test`, `benchmarks/slate-v2`, `apps/plite` | Add model-independent behavior vectors for current transforms, selection, normalization, history, multi-root, Yjs; implement an unexported JSON token-index/`ChangeSet` prototype and fair current-vs-prototype runners | Exact plan accepted | Prototype passes algebra/behavior vectors; current and prototype artifacts record time/memory/index cost; representation choice is frozen; prototype is either promoted into slice 1 or deleted | Focused unit/property tests; current transaction/normalization/history/text-selection/Yjs benchmarks; no public export or runtime flag |
| 1. Immutable snapshot, token index, compiled schema | `packages/plite` | Frozen structurally shared JSON roots, private root token/path/runtime-ID indexes, typed schema/content/property DSL, validation/defaults/wrapping/fitting | Slice 0 correctness and non-catastrophic benchmark gate passes | External values validate; reads use snapshots; moves/property edits preserve identity; all roots index consistently; old mutable snapshot/index owners scheduled for deletion | Model/schema/index fuzz; source-first typecheck; serialization and multi-root tests |
| 2. Canonical change, native transaction, compact commit | `packages/plite` | Production `ChangeSet`/`DocumentChange`, draft transaction, derived intents, before/after commit, atomic abort, lazy impact | Slice 1 model law stable | Every public write lowers into one document change; no partial publication; derived intents replay to identical hash; old live operation mutation, rollback replay, and eager commit builder deleted | Apply/compose/invert/map/transform/correct laws; nested/no-op/abort tests; transaction and huge-document benchmarks |
| 3. Fields, facets, effects, annotations, slots, commands | `packages/plite`, `packages/core`, `packages/ai` | Reducer fields, memoized typed facets, mapped effects, update annotations, named reconfiguration slots, pure typed command specs | Slice 2 commit stable | State-patch users migrated; history/collab policies expressed as effects/annotations; reconfiguration is atomic; command defaults run headlessly; no anonymous class-identity extension values | State/facet/effect/reconfigure/command tests, type inference fixtures, AI state adoption tests |
| 4. Anchors and extensible selections | `packages/plite`, `packages/plite-dom`, `packages/plite-react`, named Plate callers | Root-aware anchors with affinity/deletion policy; text/node/cell/custom selection protocol; active marks and goal column | Slice 2 mapping stable; slice 3 extension registry available | All live refs and closed-selection callers in adoption inventory migrated; path/point/range ref APIs deleted; selection serialization and DOM bridge support registered kinds | Mapping fuzz; selection/unit tests; table/cursor/selection packages; Browser text/node/cell/multi-root selection rows |
| 5. Schema fitting and changed-range correction | `packages/plite`, `packages/core`, `packages/list-classic`, `packages/table`, correction callers | Canonical leaf joins, fit/correct at change creation, query/event correction declarations, deterministic fixed-point queue with cycle diagnostics | Slices 1, 2, and 4 stable | Built-in and plugin invariants no longer rely on per-op dirty-path normalization; all legacy normalizer registrations/calls deleted | Existing normalization fixtures, generated malformed-tree fuzz, list/table correction corpus, normalization benchmark |
| 6. Inverse-change history | `packages/plite-history` | History entries as inverse changes + selection + inverted effects; grouping/skip/remote/root policies as annotations | Slices 2-5 stable | Operation replay/state-patch history deleted; public undo/redo behavior and serialization preserved across roots and selection kinds | Full history tests, retained-memory and history benchmarks, browser undo/redo rows |
| 7. DOM codecs, mapping, scheduler, and view layers | `packages/plite-dom`, `packages/plite-react` stores | Schema-linked codecs, anchor-to-DOM mapping, explicit read/write/post-selection phases, one change-mapped projection/annotation/widget protocol | Anchors/selections and compact commit stable | Paste/serialize/DOM mapping consume new law; duplicated eager store impact paths deleted; DOM-free core boundary remains | DOM tests; paste-html, shadow-dom, iframe, decorations, hidden-content routes; fanout/overlay benchmarks |
| 8. React/input adoption | `packages/plite-react`, `apps/plite`, `apps/www` examples | Snapshot selectors, Editable, selection bridge, input/composition/repair controllers consume new commits; retain coverage/virtualization/runtime IDs | Slice 7 contracts stable | One React publication per transaction; no render from drafts; existing input/IME/coverage behavior green; obsolete operation/timing controllers deleted only with proof | React suite; `pnpm check:plite`; Browser richtext/huge-document/dom-coverage routes; render and huge-document benchmarks |
| 9. Yjs, multi-root, and layout adoption | `packages/yjs`, `packages/plite-layout`, multi-root/pagination examples | Bidirectional Yjs change adapter, provider/awareness/relative selections/history; root changes; layout invalidation by changed ranges/anchors | Slices 2, 4, 6, and 8 stable | Yjs convergence/offline/provider behavior preserved; multi-root commits atomic; pagination/virtualization consumes new impact law | Yjs tests/benchmark; multi-root, yjs-collaboration, pagination Browser rows; layout tests; browser matrix |
| 10. Plate hard cut, docs, and release closure | All owners in adoption inventory; `packages/core`; docs | Migrate remaining callers, delete legacy exports/files/flags, update VISION/architecture/current docs/examples, changeset, barrels | All substrate slices green | Zero legacy call sites or dual-engine code; all packages/apps source-first clean; docs teach only new API; release proof green | `rg` deletion audit, `pnpm brl` if exports move, `pnpm typecheck`, `pnpm lint:fix`, `pnpm check:plite`, `pnpm check:plite:browser-matrix`, applicable benchmarks, Browser hand-check, `autoreview`, `pnpm check` before PR |

Slice 0 execution status (2026-07-17):
- Representation gate complete; overall slice 0 remains in progress because its
  inherited transaction/normalization/history/text-selection/Yjs runners still
  import removed `packages/slate` or `@platejs/slate` owners.
- Private prototype: `packages/plite/test/prototypes/json-change-set.ts`; tests:
  `packages/plite/test/json-change-set-prototype.test.ts`; benchmark artifact:
  `docs/plans/artifacts/wordgard-plite-rewrite-comparison/changeset-prototype-benchmark.json`.
- Promote immutable section pairs, canonical replay, and the persistent JSON
  tree index into slice 1. Reject flat full-document token materialization and
  any non-serialized operation sidecar.
- Proof: 14 prototype tests, 62 current-law tests, full 51-test Plite suite,
  source-first typecheck, scoped lint, and autoreview pass. The latest three-run
  gate has a 1.59x worst local transaction ratio and 1.50x worst serialized
  replay ratio, both below the accepted 2x ceiling.
- The promotion threshold is the per-lane median across 40 iterations in each
  run. Independently sampled sub-millisecond p75/p95/p99/max values remain
  visible diagnostics; p99 is effectively the maximum at this sample count and
  is not a stable cross-runtime ratio.
- No production export, runtime flag, compatibility path, package changeset,
  barrel change, or browser surface exists. Schema `correct`/fit proof belongs
  to slices 1 and 5 because slice 0 has no compiled schema to correct against.
- Next: repair or replace the stale current baseline runners, then enter slice
  1 with the representation decision frozen.

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| One change law can replace repeated operation mapping | Wordgard `ChangeSet` owns apply/compose/invert/transform/map/changed ranges; Plite maps refs/dirty/commit/history separately | Property tests: apply-compose equality; inverse round-trip; concurrent transform convergence; anchor mapping; serialized replay | representation gate passed; production adoption remains slice 2 |
| JSON can support the token algebra without Wordgard classes | Wordgard algebra operates on token slices; Plite JSON and stable runtime IDs are independent strengths | Prototype over representative nodes/props/text/moves/multi-root; before/after JSON parity and identity-transfer tests | passed in private prototype; production index remains slice 1 |
| Performance is acceptable | Wordgard has no benchmark, so no superiority claim is made | Three repeat artifacts for transaction execution, normalization, text selection, history, huge document; no metric worse than current target budget and no >2x regression without an accepted documented reason | representation transaction/replay passed; full slice-0 baseline pending stale-runner repair |
| Schema/correction preserves behavior | Wordgard validates/fits and schedules changed-range corrections; Plite corpus owns current outcomes | Current normalization corpus plus malformed-tree property generation, paste/list/table cases, convergence/cycle tests | required in slices 1 and 5 |
| Transactions are atomic and publish once | Target removes live mutation/rollback replay | Abort/nested/no-op/multi-root/selection/effect tests; exactly one snapshot/commit notification | required in slice 2 |
| State/extensions remain agent- and human-friendly | Plite named `api/state/tx` typing is retained; Wordgard reducers/facets/effects added | Compile-time inference fixtures, duplicate-name/dependency/conflict/reconfigure tests, no callback parameter annotations needed | required in slice 3 |
| All location values map through one mechanism | Target anchors replace three ref types and bookmarks use codecs | Mapping fuzz across insert/delete/move/split/merge/property/remote changes and all affinities/deletion policies | required in slice 4 |
| Selection is genuinely extensible | Wordgard cell selection proves the missing abstraction | Text/node/cell/custom serialization, mapping, replace ranges, DOM projection, table paste, bidi/goal-column proof | required in slice 4 |
| History is simpler without losing policy | Wordgard history architecture plus Plite root/state policies | Existing history suite, selection-kind/mapped-effect/multi-root additions, retained-memory and history benchmarks | required in slice 6 |
| DOM codecs remain outside core | Target places codecs in `plite-dom` | Package import/dependency checks; Node-only core tests; HTML round-trip/lossy/fitted paste tests | required in slice 7 |
| React rerenders remain local | Plite selectors/runtime IDs retained; impact derives from changed ranges | Selector fanout, rerender breadth, overlays, async decorations, 5,000-block traces; one publication per commit | required in slice 8 |
| Input/IME behavior does not regress | Plite current corpus and browser matrix are stronger than Wordgard | `pnpm check:plite`; focused Chromium composition/Android/clipboard/mutation rows; closure browser matrix | required in slice 8 and closure |
| Hidden/virtualized/multi-root DOM remains correct | Plite owns capabilities Wordgard lacks | Browser routes `/examples/plite/dom-coverage-boundaries`, `/huge-document`, `/multi-root-document`; model/DOM/caret/materialization assertions | required in slices 8-9 |
| Yjs remains production-grade | Plite Yjs is retained, only adapter truth changes | Two-client convergence, provider lifecycle/offline reconnect, awareness/relative selection, undo/split history, collaboration benchmark and example | required in slice 9 |
| Pagination remains derived | Current `plite-layout` boundary is retained | Layout unit tests; pagination selection/edit/virtualization/browser and benchmark rows | required in slice 9 |
| Hard cut is complete | Adoption inventory names current callers and deletion targets | Zero legacy `*Ref`, operation-truth, state-patch replay, closed-selection alias, old normalizer, dual-runtime exports/flags; full source-first typecheck | required in slice 10 |
| Public docs match only the final architecture | Current operation-truth doctrine conflicts with chosen target | Update `VISION.md`, `docs/vision/plite.md`, architecture contract, agent start, migration/API docs, examples, and changeset in the cut slice; docs checks green | required in slice 10 |

Conditional evidence:
- High-risk scenarios: canonical JSON token indexing, identity transfer, anchor
  mapping, selection-kind DOM projection, correction convergence, React
  invalidation, Yjs lowering, multi-root atomicity, and history retention are
  explicitly gated in slices 0-10 and the proof matrix.
- External research: N/A for this decision. The requested donor is the local
  `../wordgard` checkout and both live codebases were available. No external
  claim is needed to choose the architecture. Execution may use external
  research only if the prototype exposes a specific unresolved algorithm law.
- Issue/PR provenance: N/A. This is not issue- or PR-backed work and no public
  claim is being triaged.
- Browser owner: `apps/plite` and `packages/browser`; focused Browser checks on
  richtext, DOM coverage, huge document, multi-root, pagination, tables,
  paste-html, and Yjs, followed by `check:plite` and the closure matrix.
- Benchmark owner: existing target registry plus a new current-vs-change-engine
  target created in slice 0; no performance verdict is allowed before it runs.
- Docs/release owner: `VISION.md`, `docs/vision/plite.md`, Plite architecture/API
  docs, `apps/www` examples, package changesets, and public exports in slice 10.
- Behavior-law owner: existing package and `apps/plite` tests plus new algebra,
  schema, anchor, selection, correction, and intent-replay property suites.

Findings:
- Wordgard's decisive advantage is not its API names or smaller repository. It
  is that one `ChangeSet` is reused as document delta, position map, inverse,
  composition unit, OT transform, correction scan, selection/effect mapper,
  history entry, collaboration payload, decoration map, and view invalidation.
- Plite's largest architectural debt is the opposite: one operation is
  separately interpreted by path/point/range refs, bookmarks, implicit target,
  dirty paths, normalization, snapshots, commit classes, runtime-ID impact,
  React stores, history, and Yjs. `public-state.ts` rollback/commit construction
  makes the cost visible; `EditorCommit` exposes the resulting fanout.
- Wordgard also has the better schema law, selection protocol, transaction
  effects/annotations, reducer fields, facets, compartments, pure commands,
  changed-range corrections, and inverse-change history.
- Wordgard is materially worse for Plate where Plite has invested: plain JSON,
  stable runtime IDs, structural extension typing, package separation,
  multi-root, React 19.2, hidden/virtualized DOM, layout, Yjs, browser proof, and
  benchmarks.
- Wordgard's tables, menus, dialogs, schema bundles, and phrases are useful
  features but bad Plite owners. Pulling them into core would make the substrate
  less coherent.
- Wordgard itself remains unbenchmarked, but the private Plite JSON adaptation
  passed its representation transaction and canonical replay gate. Broader
  current-runtime baseline coverage remains unresolved until the stale slice-0
  runners are repaired.
- Current Plite doctrine already states that the retrofit is not the engine it
  would choose from zero, but it still declares operations collaboration truth.
  This plan intentionally goes further: changes become truth and operations
  become derived adapter intent. That doctrine change belongs in the accepted
  hard-cut slice, not as an undocumented implementation drift.

Decisions and tradeoffs:
- **Do not fork Wordgard.** Port laws and test vectors into Plite's vocabulary.
- **Do not keep two engines.** A private prototype may coexist only until the
  slice-0 gate. Production adoption deletes the old mutation path slice by
  slice; no public flag, compatibility runtime, or dual commit remains.
- **Keep JSON, add strict schema.** This sacrifices Wordgard's class-level type
  narrowing but preserves the ecosystem. Compiled schema descriptors recover
  validation/content correctness without live class instances.
- **Use positions for mapping, paths for querying.** Raw numeric positions are
  not the user-facing universal API; opaque root-aware anchors prevent root and
  affinity mistakes while paths stay excellent static addresses.
- **Keep runtime IDs outside JSON.** The change/index layer must transfer
  identity through moves and property edits so React does not regress.
- **Require schema registration.** Permissive unknown nodes are rejected in the
  from-scratch target. A deliberately explicit unsafe/test schema may exist,
  but it is not the production default or a migration shim.
- **Keep Yjs, not Wordgard collab.** `ChangeSet.transform` is valuable algebra
  and enables an OT adapter, but it does not replace offline CRDT/provider/
  awareness/history behavior.
- **Keep React and Plite browser law.** Wordgard tiles inspire invalidation and
  an optional imperative projector; they do not replace Plate's React host.
- **Split failure policy.** Core failures abort atomically; view-only providers
  may be isolated/deactivated with diagnostics. Silent core continuation is
  forbidden.
- **Make deletion measurable.** The migration is unsuccessful if the new
  algebra merely sits under the old eager impact/ref/normalizer machinery.

Review fixes:
- Corrected the tempting but false conclusion that Wordgard is globally
  superior: it wins the engine algebra, while Plite wins the host/runtime and
  production-proof layers.
- Rejected a direct `Plot`/`Leaf` transplant in favor of a private token index
  over frozen JSON.
- Rejected a `ChangeSet` sidecar beside canonical operations; semantic intents
  are explicitly derived and replay-validated.
- Added repo-wide hard-cut caller ownership instead of deferring migration to
  compiler fallout.
- Made performance conditional on a fair prototype benchmark because Wordgard
  ships no benchmark evidence.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Package-manifest inspection used bare relative `require` paths | 1 | Prefix manifest paths with `./` | Resolved; all scoped package dependencies/exports inspected |
| Initial normalize source lookup used the old folder path | 1 | Read live manifest tree and use `packages/plite/src/core/normalize-node.ts` | Resolved; current normalizer inspected |

Verification evidence:
- Static source audit completed against both local checkouts on 2026-07-17.
- `source-inventory.md` classifies 74/74 Wordgard and 459/459 scoped Plite
  production files plus package/test/docs/example/benchmark owners.
- `comparison-matrix.md` contains 60 sourced responsibility rows with explicit
  ratings and rewrite verdicts.
- `adoption-inventory.md` owns current hard-cut callers for refs, operations,
  selections, normalizers, state patches, and commit consumers.
- No Wordgard runtime/test result or performance claim is asserted: its
  `node_modules` is absent and it has no benchmark suite. Execution proof is
  intentionally gated rather than fabricated.
- Planning checker command:
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-16-wordgard-plite-rewrite-comparison.md`.
- Planning checker result: `[autogoal] complete` on 2026-07-17.
- First execution batch: private JSON `ChangeSet` representation gate passes;
  see `docs/plans/2026-07-17-wordgard-changeset-prototype-batch.md` and its
  benchmark artifact. Overall slice 0 remains open on stale baseline runners.

Final handoff prepared:
- Ownership and target API/runtime: immutable JSON snapshot + compiled schema +
  root `ChangeSet` + anchors/selections + typed transaction extensions, owned by
  the existing Plite package boundaries.
- Public breaks and Plate/collaboration adoption: hard cuts and all current
  owner groups are recorded in `adoption-inventory.md`; Yjs is retained behind
  a new adapter.
- Applicable browser/benchmark/docs/provenance decisions: Browser and benchmark
  gates are concrete; current doctrine is updated only during accepted
  execution; external/issue provenance is scoped N/A.
- Proof and execution risks: token indexing, identity transfer, mapping,
  correction convergence, React invalidation, and Yjs lowering each have an
  explicit proof owner and gate.
- Execution order and user attention: accept/reject the one core decision—make
  `DocumentChange` truth and operations derived. Once accepted, slices 0-10 are
  ordered to prototype, adopt, delete, and close without shipping dual mode.

Timeline:
- 2026-07-16T23:56:05.282Z Plite Plan created.
- 2026-07-17 Wordgard production/test/tooling/export surface inventoried.
- 2026-07-17 Plite core/DOM/React/history/layout/browser/Yjs source and proof
  surfaces inventoried.
- 2026-07-17 Exhaustive comparison, target architecture, hard-cut adoption,
  execution slices, and proof gates resolved.
- 2026-07-17 User accepted execution; private section-algebra/persistent-index
  batch passed and the flat token materializer was rejected.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Slice 0 execution: representation gate complete, baseline repair open |
| Where am I going? | Repair current baseline runners, then slice 1 |
| What is the goal? | Decide the best from-scratch Plite architecture by exhaustively comparing local Wordgard and Plite, with every difference, break, owner, and proof resolved |
| What have I learned? | Wordgard should donate the engine algebra; Plite should keep the host/runtime ecosystem |
| What have I done? | Inventoried both systems, chose the target, built slices 0-10, and closed the first private representation gate |

Open risks:
- A sectioned change algebra over plain JSON may need a different token/index
  representation than Wordgard's class tree; slice 0 is a real architecture
  gate, not ceremony.
- Runtime ID transfer across replacements/moves must be law-driven or React
  locality will regress even if document behavior is correct.
- Extensible selections magnify DOM, table, clipboard, history, and Yjs scope;
  narrowing helpers and type inference must be designed before mass adoption.
- Changed-range correction can loop when plugins fight. The target requires
  stable ordering, deduplication, cycle diagnostics, and a hard cap.
- Yjs may need semantic lowering for efficient granular updates. Derived
  intents are allowed only with replay/hash proof to avoid a second truth.
- A long migration invites dual-engine sludge. Each slice has a deletion exit
  gate; release is blocked while any public flag/shim or old mutation path
  remains.
