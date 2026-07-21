# Wordgard Plite full architecture ledger

Objective:
Close the full Wordgard-to-Plite architecture ledger; done when every remaining
concept has a live-source verdict, adoption/proof, concrete slices, and the
goal-plan checker passes.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-07-18-wordgard-plite-full-architecture-ledger.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- none

Mode:
- `standard`

Completion threshold:
- Binary readiness: live claims sourced, one owner per responsibility, every
  decision resolved, every public break has adoption and proof, execution
  slices are concrete, conditional gates are resolved, and `check-complete`
  passes.

Verification surface:
- Live source audit of the original 59-row comparison against current Plite and
  `../wordgard` owners, with completed work removed from the runnable backlog.
- Focused export/caller/test/docs/benchmark searches for every proposed public
  break or runtime cut.
- `node .agents/skills/autogoal/scripts/check-complete.mjs
  docs/plans/2026-07-18-wordgard-plite-full-architecture-ledger.md`.

Constraints:
- Produce the actual full list: remaining steals, hard cuts, keeps, rejected
  Wordgard choices, completed rows, and evidence-gated deferrals. Do not stop at
  a top-five shortlist.
- Order runnable decisions by architectural dependency and leverage. Do not use
  numeric confidence scores or weighted caps.
- Planning only until the user explicitly accepts this exact plan and invokes
  `plite-plan` against it.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.

Boundaries:
- In scope: Plite document/change/transaction/schema/state/selection/runtime,
  DOM/input/codecs, React view layers, history, Yjs collaboration, layout,
  browser proof, public exports, and direct Plate adoption pressure identified
  by the Wordgard comparison.
- Source owners: `packages/plite`, `packages/plite-dom`,
  `packages/plite-react`, `packages/plite-history`, `packages/plite-layout`,
  `packages/browser`, `packages/yjs`, `apps/plite`, and the directly affected
  Plate packages/apps discovered by caller search.
- Non-goals: implementing substrate changes, importing Wordgard class identity
  or product UI, moving Plate product behavior into Plite, and generic editor
  research beyond the named local Wordgard donor.
- Direct Plate/collaboration adoption owners: current callers of operations,
  commands, schema/correction, DOM codecs, extensions, history, Yjs, and React
  projection APIs; exact packages will be recorded per break row.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Block only if the current checkout or `../wordgard` owner is unavailable, or
  if two incompatible product intentions remain after source/doctrine audit and
  require user choice. Do not block while a focused source/proof move remains.

Plite Plan state:
- status: ready
- phase: prove-and-hand-off
- next: user acceptance before execution
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Full-list, no-shortlist, Plite-plan-style, planning-only requirements recorded above |
| Active goal and plan verified | yes | Active goal points to this generated `plite-plan` shell |
| Current owners read | yes | `VISION.md`, `docs/vision/plite.md`, the 60-row comparison, canonical-change execution ledger, and live transaction/schema/state/selection/DOM/React/history/Yjs owners audited |
| Mode and execution boundary resolved | yes | Standard agent-led plan hardening; no implementation before exact-plan acceptance |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports/behavior claims cite live source.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and the temporary private intent bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] All 60 original comparison rows map to one current concept verdict.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | pass | Resolve every readiness condition | 26 concept rows cover all 60 source rows; breaks, owners, adoption, proof, and execution order are resolved |
| Fresh source evidence | pass | Recheck decision-changing current claims | Live owners cited in the decision ledger and verification evidence; old plan prose used only as history |
| Conditional risk and adoption | pass | Complete triggered risk/browser/benchmark/provenance work or give one scoped N/A reason | Model/runtime/DOM/React/history/Yjs risks and execution proof are concrete; provenance is scoped N/A below |
| Verification recorded | pass | Record fresh planning proof and exact execution gates | Source audits, caller owners, line counts, and accepted-execution commands recorded below |
| Handoff prepared | pass | Prepare concise ownership, breaks, proof, risks, and execution order | Final handoff section and dependency-ordered backlog are complete |
| Autoreview | N/A: planning only | Run for implementation changes or record planning-only N/A | No substrate implementation; accepted-plan execution must run `autoreview` after source changes |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-18-wordgard-plite-full-architecture-ledger.md` | Checker exits 0 after final source evidence and handoff closure |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Doctrine, original comparison, completed ledgers, and current owners read | Decide |
| Decide | completed | 26 concept verdicts cover all 60 original rows | Prove and hand off |
| Prove and hand off | completed | Slices, proof, risks, and handoff prepared | User acceptance |

Decision brief:
- outcome: one exhaustive concept ledger and dependency-ordered execution
  backlog, including completed, kept, rejected, and deferred rows.
- chosen shape: retain Plite's JSON/React/multi-root/package strengths while
  hard-cutting any remaining operation-era engine truth and stealing only
  Wordgard mechanisms that improve the substrate.
- strongest rejected alternative: preserve the completed rewrite ledger as
  authoritative without rechecking live engine ownership.
- consequence: source may reopen rows previously marked complete when the
  implementation still carries the rejected machinery.

Runnable backlog, in dependency order:
| Order | Work | Included concept rows | Verdict | Stop condition |
| ---: | --- | --- | --- | --- |
| 1 | Native immutable change transaction and semantic-intent split | D2, D7, D8 | `cut` | No operation-first write path, public operation middleware, or operation-derived commit construction remains |
| 2 | Compiled schema, fitted slices, canonical leaf construction, and change-range correction | D4 | `cut` | External values validate; insert/paste/replace produce schema-valid drafts without representation normalizer loops |
| 3 | Pure typed command specifications | D12 | `cut` | Core commands return `false \| TransactionSpec`; no implicit update or mutable transaction parameter is required |
| 4 | Transactional immutable extension configuration | D10 | `cut` | Slot reconfiguration publishes one compiled config revision atomically; setup/cleanup cannot expose half-installed state |
| 5 | Schema-linked host codec registry | D15 | `move` | HTML/Markdown/clipboard codecs are declarative in host owners and feed fitted slices; core stays DOM-free |
| 6 | One private mapped-view-store kernel plus view fault boundaries | D13, D18 | `cut` / `move` | Decorations, annotations, and widgets keep distinct public contracts but share mapping, invalidation, fan-out, lifecycle, metrics, and isolated provider failure handling |
| 7 | Versioned field/effect/history persistence | D9, D19 | `gate` | Registered codecs validate persisted/shared state and `History` can round-trip canonical batches without runtime object identity |
| 8 | Cross-owner hard cut and deletion closure | D20, D22, D24, D25 | `gate` | Plate/Yjs/DOM/React/history callers, exports, fixtures, docs, examples, benchmarks, and browser proof teach only the final architecture |
| — | Optional first-party imperative DOM renderer | D26 | `defer` | No execution until a real non-React consumer and parity/performance target exist after rows 1-8 close |

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D1. Public JSON model, tree vocabulary, properties | Plain frozen `{ type, children, ...props }` values remain the public/storage model; state snapshots expose plain JSON (`interfaces/element.ts`, `core/public-state.ts:453-485`) | Preserve JSON `Element`/`Text`, arbitrary typed properties, and no live `Plot`/`Leaf`/mark classes | `packages/plite` | Plite's representation is simpler, serializable, agent-readable, and Plate-compatible | No break; schema work adopts validation around the same values | Package type fixtures, JSON round trips, docs examples | Accidentally importing Wordgard class identity or mark ontology | `keep` |
| D2. Published snapshots and native transaction truth | Published snapshots are frozen and structurally share nodes, but `EditorTransaction.apply(Operation)`, `.operations`, operation middleware, mutable draft state, snapshot restore, and `DocumentChange.fromIntents` still define the normal engine path (`interfaces/editor.ts:1565-1575`; `core/public-state.ts:4837-5069`) | One `TransactionSpec`/`DocumentChangeBuilder` owns document, selection, effects, annotations, and state; transforms edit it directly; abort discards it | `packages/plite` core/runtime | Current architecture maintains two write truths and pays operation replay, operation-count caches, path-stable special cases, and rollback machinery | Break operation consumers in Plite DOM/React/history/Yjs and Plate `ai`, `browser`, `caption`, `code-block`, `core`, `diff`, `footnote`, `list`, `table`; update `docs/plite` and `apps/www` Plite examples | Transaction atomic/no-op/nested laws, core transform corpus, selection/anchor/history/Yjs/browser proof, transaction benchmark, zero old-symbol audit | Selection mapping order, runtime identity transfer, semantic middleware loss | `cut` |
| D3. Coordinates, paths, anchors, runtime IDs | Root-aware token indexes, `editor.anchor`/`tx.anchor`, custom mapping, snapshot paths, and runtime IDs exist (`core/document-change.ts:3261-3327`; `core/anchor.ts:173-710`) | Keep paths for snapshot queries, anchors for live identity, and runtime IDs for React; make the D2 change builder their only mapping source | `packages/plite`, `plite-dom`, `plite-react` | This hybrid is better than Wordgard's public raw offsets and better than Slate-style live refs | Internal mapping adoption in D2; no return to path/point/range refs | Anchor contracts/benchmark, custom selection mapping, hidden/multi-root browser rows | Reintroducing commit-batched anchor mapping or path identity | `keep` |
| D4. Schema membership, grammar, fitting, construction, canonicalization, correction | Element specs validate known properties, but unknown specs pass, containment/default lookup scans live registrations, `fit` wraps children one at a time, and representation correction mutates in fixed-point loops; correction paths prefer operations when available (`core/editor-schema.ts:185-333`, `:360-412`; `core/correction.ts:58-182`; `editor/correct-document.ts:29-165`) | Compile membership/property/containment/default/wrapping tables per config revision; implement open fitted slices; canonicalize adjacent/empty leaf runs during change construction; use canonical changed ranges for semantic corrections | `packages/plite`; Plate node specs remain in their packages | This is Wordgard's strongest remaining idea and the prerequisite for reliable codecs/paste | Adopt element specs/corrections in Plate `ai`, `basic-nodes`, `code-block`, `comment`, `indent`, `layout`, `list*`, `suggestion`, `table`, `tag`; update examples/docs | Generated grammar/fitting/deserialization/correction laws, full transform fixtures, paste/table/void/IME browser rows, normalization benchmark | Rejecting legitimate app nodes, lossy paste, correction cycles, table/void regressions | `cut` |
| D5. Multi-root document/runtime | Root-aware values, changes, selections, history, React views, DOM ownership, Yjs and browser proof are live | Preserve implicit primary root and atomic additional-root changes | Plite core/DOM/React/history/Yjs/layout | Wordgard has no donor advantage here | No break beyond D2/D4 internals | Multi-root algebra, selection/history/Yjs and browser matrix | Accidentally exposing public `main` or allowing cross-root selection | `keep` |
| D6. Change algebra, serialization, pairwise rebase | `ChangeSet`/`DocumentChange` apply, compose, invert, map, serialize, changed ranges, corrections, and pairwise transform are implemented and generated laws exist (`core/document-change.ts:1944-2553`, `:2842-3357`) | Preserve the algebra; remove only intent reconstruction; keep pairwise transform for history/testing/optional adapters, not a central-OT product | `packages/plite` | The useful Wordgard algebra is already stolen | D2 rewires transform production; history/Yjs remain consumers | `document-change.test.ts`, generated laws, root lifecycle/serialization tests | Expanding pairwise laws into an unsupported multi-peer ordering claim | `keep` |
| D7. Semantic intents and operation middleware | `EditorIntent` is exactly `Readonly<Operation>` and public operation middleware can rewrite execution (`interfaces/editor.ts:1644-1675`, `:2210-2235`; `src/index.ts:108-127`) | Define optional semantic intents independently from the engine mutation type; high-level transforms may attach them, commits validate them against canonical changes, and adapters may ignore them | `packages/plite`; direct consumers `plite-history`, `yjs`, Plate change listeners | Move/merge/split semantics help adapters, but an operation stream must not remain a second truth | Yjs change-first lowering; history grouping uses intent categories or annotations; Plate listeners consume commit/change queries | Intent replay/hash validation, change-only fallback, zero public operation middleware/export audit | Losing adapter optimization or letting hints silently define correctness | `cut` |
| D8. Selection mapping inside writes | Extensible selections map through `DocumentChange`, but normal text selection still maps operation-by-operation in `core/apply.ts:49-185` | Map selection, anchors, effects, and implicit targets through the active canonical incremental change owned by D2 | `packages/plite`, DOM/React selection owners | One map law removes category-specific operation transforms | Adopt text/node/custom selections and DOM selection import/export | Selection affinity/deletion/move/root laws plus browser caret/follow-up typing | Mapping only the final composed change can alter per-step deletion association; preserve incremental change order | `cut` |
| D9. Annotations, effects, state fields, facets | Typed update annotations, mappable/invertible effects, reducer fields, persisted meta, and explicit dependency-aware facets exist (`core/transaction-values.ts:7-61`; `core/state-field.ts:15-40`; `core/facet.ts:109-220`) | Keep them. Preserve explicit named dependencies rather than Wordgard's automatic read tracking; add versioned codecs only in D19 | `packages/plite` | Plite now has the useful mechanism with better structural typing and predictability | No public break until D19; Yjs shared effects retain keyed descriptors | Field/effect/facet contracts, history/Yjs effect proof | Automatic dependency magic would hide invalidation and hurt agent DX | `keep` |
| D10. Dynamic configuration | Named extension slots exist, but `slot.reconfigure(editor, input)` immediately calls `extendEditor`; registry cleanup/install happens outside transaction publication (`core/extension-slot.ts:37-72`; `core/editor-extension.ts:742-794`) | Keep `defineExtensionSlot` for declaration; replace direct mutation with `tx.extensions.reconfigure(slot, input)` and one compiled immutable configuration revision; run setup/cleanup after successful publication | `packages/plite`; adopters in `plite-layout`, `plite-react`, `yjs`, Plate presets | Current API calls an operation atomic without being atomic | Sweep slot/config callers, extension docs/examples, type inference fixtures | Failed install rollback, dependency/conflict/precedence tests, schema/facet revision tests, React runtime reconfiguration | Half-installed config, cleanup ordering, React reading mixed revisions | `cut` |
| D11. Extension typing and namespaces | Named structural `state`, `tx`, direct-update, dependencies/conflicts and capability groups are strongly typed | Preserve structural names and inference; never adopt class/`instanceof` extension identity or flattened anonymous arrays | `packages/plite`, all Plate extensions | Plite is already superior | D2/D10/D12 must preserve inference | Compile-time contracts and direct Plate typecheck | Weakening types to imitate Wordgard | `keep` |
| D12. Commands | Typed tags, priority and `next` exist, but handlers return boolean, receive a live mutable transaction, and `execute` secretly starts `editor.update` (`core/command-registry.ts:35-58`, `:93-170`) | Core/default command: read-only state to `false \| TransactionSpec`; dispatcher applies specs; imperative commands are explicit DOM/Plate handlers; preserve priority and `next` | `packages/plite`, `plite-history`; future Plate command adopters | Pure commands are testable without an editor view and compose with D2 | Migrate history undo/redo and core transform command middleware; update exports/docs/type fixtures | Pure command unit tests, dispatch/priority/next contracts, history/browser keyboard proof | Side-effect commands misclassified as pure; handler delegation semantics | `cut` |
| D13. Extension failure policy | Core setup/transactions abort and restore correctly; optional React projection/annotation/widget providers generally rethrow unexpected failures and have no common error sink (`core/editor-extension.ts:626-655`; `plite-react/src/annotation-store.ts:284-293`) | Core/schema/correction failures abort. Optional view-layer sources report through a typed error sink, deactivate only the failing source, and remain diagnosable/retryable | `packages/plite-react`, optional DOM view providers | Wordgard's view isolation is useful only outside correctness-owning core | Integrate with D18 public source IDs and metrics; docs explain fault boundary | Throwing source/provider tests, sibling-layer survival, retry/remount, console/error-sink proof | Hiding corrupting core failures or silently swallowing app bugs | `move` |
| D14. Selection extensibility, affinity, goal column, live anchors | Plain discriminated selection kinds, module augmentation/registered mapping, node/text selections, affinity/goal column, and root-aware anchors are implemented (`interfaces/selection.ts:6-35`; `core/selection-protocol.ts:32-223`) | Preserve; keep physical bidi/geometry in DOM and table selection in Plate | Plite core/DOM/React; Plate table | The accepted hybrid is cleaner than Wordgard subclasses | No new break; D2 maps through canonical changes only | Custom selection serialization/map laws, table/browser rows | Pulling table/product selection logic into core | `keep` |
| D15. HTML/Markdown/clipboard codecs | `plite-dom` owns capable clipboard transport, but MIME/JSON/HTML/plain-text encoding and parsing are hardwired; no codec registry exists (`plugin/dom-clipboard-runtime.ts:74-124`; zero `EditorCodec`/`defineCodec` source matches) | Define typed host codecs keyed by format and element/property spec; parse returns a fitted slice; allow multiple codecs per semantic type; keep core DOM-free and low-level clipboard transport | `packages/plite-dom`; registrations in Plate `basic-nodes`, `code-block`, `list`, `media`, `table`, `markdown`, `docx*`; React clipboard input | Steal Wordgard declarative parse/serialize laws without coupling schema to DOM | Update package serializers/deserializers, clipboard docs/examples and browser fixtures | HTML/Markdown round trips, unknown/invalid input fitting, copy/cut/paste browser matrix, large payload benchmark | Codec precedence conflicts, lossy fallback, DOM dependency leakage into core | `move` |
| D16. Renderer, DOM mapping, input/IME, React, hidden DOM, roots, layout | Plite's React-first runtime, DOM mapping, native input/IME/mobile handling, hidden/projected/virtualized coverage, multi-root editing and layout subsystem exceed Wordgard | Preserve owners and behavior; consume D2/D4/D15 outputs without changing public React ontology | `plite-dom`, `plite-react`, `browser`, `plite-layout`, `apps/plite` | Wordgard's tile renderer is not a Plate replacement | Internal adoption only; no product behavior migration into core | Existing focused package/browser/huge-document/pagination/mobile-viewport proof | Using architecture cleanup as an excuse to rewrite proven input code | `keep` |
| D17. Incremental invalidation, phase scheduling, subscriptions | Lazy `commit.changed` queries, runtime-ID selectors, external-store subscriptions, and bounded per-root DOM scheduling are implemented | Preserve and point every remaining invalidation path at canonical changes; no eager impact object or new scheduler | Plite core/React/DOM | The previous five-packet execution genuinely closed these mechanisms | D2/D18 delete remaining operation/store duplication | Render/fan-out benchmarks, scheduler contracts, browser matrix | Under-invalidation after deleting intent-derived shortcuts | `keep` |
| D18. Decorations, annotations, widgets | Three correct public lanes exist, but projection (878 lines), annotation (952), widget (424), and near-duplicate React projector hooks independently own mapping, diff, listeners, lifecycle and metrics (`plite-react/src/*-store.ts`; hooks `use-plite-{annotation,widget}-store.tsx`) | Keep distinct public Decoration/Annotation/Widget contracts; introduce one private generic mapped-store kernel and thin adapters, not one public mega-layer API | `packages/plite-react` | The execution ledger overclaimed internal unification; live source still duplicates the substrate | Preserve current public hooks/store types where clean; hard-cut only duplicated internals unless a smaller public break improves consistency | Snapshot parity, per-ID/runtime fan-out, source dirtiness, metrics, unmount/remount, annotation-backed widgets, React/browser proof | Generic abstraction erases lane semantics or causes global recompute | `cut` |
| D19. History and persisted state serialization | History stores inverse `DocumentChange` and mapped effects, but lives in a `WeakMap`; `History.isHistory` requires live class instances; fields persist raw meta without validation codecs (`plite-history/src/history-state.ts:5-27`; `history.ts:11-50`; `core/public-state.ts:453-485`) | Add versioned keyed codecs for persisted/shared fields and effects; expose validated `History.toJSON/fromJSON` using `DocumentChange` JSON and registered selection/effect kinds; unsupported effect persistence fails explicitly | `packages/plite`, `plite-history`; Yjs shared effect registry | Canonical batches are already serializable; object identity should not block reload/replay diagnostics | History API/docs/tests, Yjs effect descriptors, state-field examples | Round-trip history/effect tests, schema/version rejection, undo/redo after reload and remote rebase | Pretending every arbitrary effect is serializable; stale schema versions | `gate` |
| D20. Collaboration | Incremental bidirectional Yjs/`DocumentChange`, provider lifecycle, offline behavior, awareness, split history and shared effects exist; Yjs still uses operation intents as a verified optimization (`yjs/core/controller.ts:106-147`, `:330-421`) | Keep Yjs and change-first correctness; adopt D7 semantic hints or generic change lowering; do not import Wordgard central-authority OT | `packages/yjs`, Plite adapters/apps | Plite is superior as a collaboration product | D2/D7 migration plus Yjs docs/tests/benchmarks | Provider/convergence/offline/undo/awareness/shared-effect/browser proof | Identity/perf regression when operation fast path disappears | `keep` |
| D21. Tables, built-in schema and product UI | Plate owns table schema/commands/paste/UI and all product nodes, panels, menus, dialogs, tooltips and phrases | Keep generic selection/correction/fitting primitives in Plite; reject Wordgard product bundles in substrate | Plate table/basic nodes/UI packages | Bundled capability is the wrong boundary, not a missing Plite feature | D4/D14 primitives adopted by Plate; no Plite UI work | Plate table/custom-selection/paste proof | Polluting core to chase feature-count parity | `keep` |
| D22. Fixtures, algebra/browser proof, benchmarks | Plite hyperscript, broad fixtures, generated laws, multi-engine browser proof and benchmark registry are stronger; operation-era fixture assumptions remain until D2 | Preserve proof infrastructure; migrate fixtures to final transaction/schema APIs and add slice/config/codec/view/history rows | `plite-hyperscript`, Plite tests, `apps/plite`, benchmark targets | Wordgard contributes test shapes, not a stronger harness | All changed owners; `apps/plite` continues sourcing examples from `apps/www` | Focused proof per slice, `pnpm check:plite`, closure browser matrix and benchmark target checks | Green legacy tests masking obsolete architecture | `keep` |
| D23. Package boundaries and dependency footprint | Core/DOM/React/history/layout/browser/Yjs/hyperscript are separate and core remains dependency-light | Preserve dependency direction; add no table, React, DOM or product dependency to core | Package manifests/exports | Plite is superior | Codec/view/history work stays in owning packages; barrels/changesets follow public breaks | Package graph audit, source-first typechecks, public import smoke | Convenience imports create cycles or DOM leakage | `keep` |
| D24. Docs and architecture contract | Vision teaches canonical `DocumentChange`, but completed execution prose overclaims a fully native immutable engine and unified view layers while live source remains operation-first/duplicated | Treat old ledgers as history; after each hard cut, update `VISION.md`, `docs/vision/plite.md`, `docs/plite/**`, migration/current API docs, and examples to describe only live truth | Docs/vision owners plus package docs | Source/docs contradiction is architecture debt, not wording debt | Every public break row owns docs/examples; no changelog voice or compatibility teaching | Source-to-doc symbol audit, docs build/source parity, example typecheck/routes | Updating prose before source and repeating the overclaim | `gate` |
| D25. Semantic density and deletion | Current scoped production source is 106,655 lines versus Wordgard's 22,611; the gap is not itself proof, but operation reconstruction and three view-store kernels are concrete duplication | Every accepted slice carries a deletion ledger: old writer, mapper, classifier, normalizer, store kernel, export, fixture and doc path must disappear before the replacement counts as landed | All touched owners | Layering new abstractions beside old machinery would repeat the failed rewrite | Closure sweeps across Plite and direct Plate/Yjs adopters | File/symbol zero-match audits, line/benchmark deltas used diagnostically, full proof | Cosmetic deletion that moves complexity or weakens behavior | `gate` |
| D26. Non-React imperative renderer | Core/DOM layering permits one, but no first-party projector or named consumer exists; React is the reference host | Defer an optional thin `plite-dom/view` projector until rows 1-8 close and a real consumer supplies behavior/parity/perf acceptance criteria | Future `plite-dom` owner | Building it now adds surface instead of deleting current debt | None until a consumer exists | Future dual-renderer behavior and benchmark plan | Architecture tourism and a permanent second renderer to maintain | `defer` |

Original comparison coverage:
| # | Original surface | Current concept / verdict |
| ---: | --- | --- |
| 1 | Public document representation | D1 `keep` |
| 2 | Published immutability | D2 `cut` remaining engine machinery |
| 3 | Tree vocabulary | D1 `keep` |
| 4 | Canonical coordinates | D3 `keep` implemented hybrid |
| 5 | Structural path queries | D3 `keep` |
| 6 | Runtime node identity | D3 `keep` |
| 7 | Adjacent text canonicalization | D4 `cut` normalizer ownership |
| 8 | Marks and arbitrary properties | D1 `keep` |
| 9 | Registered node/mark membership | D4 `cut` permissive unknown membership |
| 10 | Parent/child grammar | D4 `cut` dynamic scans |
| 11 | Defaults, wrapping, fitting | D4 `cut` shallow fitter |
| 12 | Construction/deserialization validation | D4 `cut` permissive boundary |
| 13 | Normalization/correction scheduling | D4 `cut` operation-first queue |
| 14 | Multi-root documents | D5 `keep` |
| 15 | Canonical document delta | D2 `cut` remaining operation truth |
| 16 | Composition, inversion, mapping | D6 `keep` implemented |
| 17 | Concurrent transform/rebase | D6 `keep` pairwise only |
| 18 | Serialized changes | D6 `keep` core; D19 `gate` history/effects |
| 19 | Dirty-region derivation | D17 `keep` implemented lazy queries |
| 20 | Semantic operation interoperability | D7 `cut` operation alias; keep derived hints |
| 21 | Native transaction model | D2 `cut` |
| 22 | Atomic failure behavior | D2 `cut` rollback machinery; preserve behavior |
| 23 | Selection mapping inside edits | D8 `cut` per-operation mapping |
| 24 | Metadata, effects, annotations | D9 `keep` implemented |
| 25 | Persistent state fields | D9 `keep`; D19 `gate` codecs |
| 26 | Derived facets | D9 `keep` explicit dependencies; reject automatic tracking |
| 27 | Dynamic configuration | D10 `cut` immediate mutation |
| 28 | Extension type/DX | D11 `keep` |
| 29 | Commands | D12 `cut` imperative/implicit update |
| 30 | Extension failure policy | D13 `move` optional view failures |
| 31 | Selection extensibility | D14 `keep` implemented |
| 32 | Affinity, goal column, bidi | D14 `keep` implemented split |
| 33 | Live refs/bookmarks | D3/D14 `keep` anchor replacement implemented |
| 34 | HTML parsing/serialization | D15 `move` to host codecs |
| 35 | Clipboard | D15/D16 `keep` transport, adopt fitter/codecs |
| 36 | Rendering architecture | D16 `keep` React reference renderer |
| 37 | Incremental view invalidation | D17 `keep`; D18 `cut` duplicated stores |
| 38 | DOM read/write scheduling | D17 `keep` implemented |
| 39 | DOM/model mapping | D16 `keep` |
| 40 | Decorations, annotations, widgets | D18 `cut` internal duplication, keep public lanes |
| 41 | Input, IME, mobile | D16 `keep` |
| 42 | React integration | D16 `keep` |
| 43 | Subscription model | D17 `keep` |
| 44 | Hidden/virtualized/projected DOM | D16 `keep` |
| 45 | Multi-root DOM editing | D16 `keep` |
| 46 | Pagination/layout | D16 `keep` |
| 47 | History architecture | D19 `gate` serialization; canonical inverse core kept |
| 48 | Collaboration product | D20 `keep` Yjs |
| 49 | Tables | D21 `keep` Plate boundary |
| 50 | Built-in rich-text schema | D21 `keep` Plite unopinionated; reject bundle |
| 51 | Product UI/i18n | D21 `keep` Plate boundary; reject adoption |
| 52 | Fixture construction | D22 `keep` and migrate |
| 53 | Package boundaries | D23 `keep` |
| 54 | Dependency footprint | D23 `keep` |
| 55 | Core behavior tests | D22 `keep` generated laws implemented |
| 56 | Browser proof | D22 `keep` |
| 57 | Benchmarks | D22 `keep` |
| 58 | Documentation/architecture contract | D24 `gate` truth after source |
| 59 | Semantic density/maintainability | D25 `gate` deletion per slice |
| 60 | Non-React portability | D26 `defer` renderer; keep layering |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 0. Baseline and bridge boundary | Plite core + benchmark/test owners | Freeze behavior/benchmark baselines; enumerate every operation writer/middleware/consumer; allow one private `legacyIntent` adapter only during slices 1-2 | Accepted exact plan | Bridge is non-public, named, and has zero-match deletion gate; current tests/targets green | Core package, transaction/selection/normalization/history/Yjs targets and source audit |
| 1. Native transaction core | `packages/plite` | Add `TransactionSpec`/builder; move direct change, selection, effects, annotations, roots and state into one draft; discard on abort | Slice 0 | Normal writes and direct changes share one builder; commit/inverse derived once | Transaction/change laws, typecheck, package tests, transaction benchmark |
| 2. Operation hard cut | Plite plus DOM/React/history/Yjs and named Plate adopters | Migrate transforms/middleware/adapters; separate semantic hints; delete public operation transaction/middleware and private bridge | Slice 1 | Zero engine/public operation truth; Yjs/history/Plate compile against final surface | Zero-match audits, full transform corpus, anchor/selection/history/Yjs tests, focused browser editing |
| 3. Compiled schema and fitter | Plite core + direct Plate node/table adopters | Compile schema/config tables; validate boundaries; fit slices; canonicalize leaf runs; change-range corrections only | Slice 2 | Insert/paste/replace/deserialization yield valid canonical drafts without representation repair loops | Generated grammar/fitting/correction laws, fixtures, paste/table/void/IME browser proof, normalization benchmark |
| 4. Pure commands | Plite core/history | Return transaction specs from pure commands; keep explicit imperative edges, priority and `next` | Slices 1-2 | No implicit update in core commands; history undo/redo are pure | Command/type/history tests and keyboard browser proof |
| 5. Atomic configuration | Plite extension runtime + layout/React/Yjs adopters | Transactional slot effect, immutable compiled config revision, post-publication setup/cleanup | Slices 1 and 3 | No direct `slot.reconfigure(editor, ...)`; failure exposes no partial registry | Dependency/conflict/precedence/facet/schema/reconfiguration tests and React runtime smoke |
| 6. Host codecs | `plite-dom` + Plate codec registrations | Declarative codec registry, fitted parsed slices, serializer precedence, clipboard integration | Slice 3 | Core remains DOM-free; hardwired feature serializers adopt registered codecs | Codec/HTML/Markdown/clipboard tests, browser copy/paste matrix, payload benchmark |
| 7. Mapped view substrate and failure isolation | `plite-react` | Private generic mapping/diff/subscription/lifecycle kernel; thin decoration/annotation/widget adapters; error sink | Slice 2, scheduler remains green | Duplicate kernels/hooks deleted; public lane semantics and fine-grained fan-out preserved | Store parity/fan-out/metrics/error tests, React suite, affected browser routes/benchmarks |
| 8. Persistence codecs | Plite state/effects + history + Yjs descriptors | Versioned field/effect codecs and validated history JSON | Slices 1, 4, 5 | Reloaded history/state can undo/redo and rejects unknown versions/types explicitly | Round-trip/version/remote-rebase tests, package typechecks |
| 9. Adoption, docs, deletion and closure | All touched owners | Sweep callers/exports/fixtures/docs/examples/changesets; benchmark and browser closure; remove stale plan claims | Slices 1-8 | One public/current architecture, no bridge or stale teaching, every deletion row closed | `pnpm check:plite`, applicable package/Yjs/www checks, lint, barrels, docs parity, browser matrix, benchmark targets, autoreview, checker |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Operation-first transaction truth remains | Public `EditorTransaction.apply/operations`, operation middleware, 45 scoped production `Operation` files, and commit reconstruction in `public-state.ts` | Zero old exports/writers/middleware/reconstruction; full core/adopter proof | ready for accepted execution |
| Schema is not yet compiled or a real slice fitter | Dynamic spec scans, unknown specs pass validation, per-child wrapping, operation-first correction paths | Generated schema/fitting laws plus Plate paste/table/void/browser proof | ready for accepted execution |
| Pure command semantics are absent | Boolean handlers receive mutable `tx`; implicit update branch is live | Pure state-to-spec tests, dispatch/history/keyboard proof | ready for accepted execution |
| Reconfiguration is not transactionally atomic | `extension-slot.ts:69-70` directly extends the editor | Config publication/setup/cleanup failure tests | ready for accepted execution |
| Declarative multi-format codecs are absent | No codec API matches; 631-line hardwired DOM clipboard runtime | Codec round trips and browser clipboard proof | ready for accepted execution |
| View-store substrate is still duplicated | 2,254 lines across projection/annotation/widget stores plus duplicate projector hooks | Store parity/fan-out metrics and source deletion audit | ready for accepted execution |
| History is canonical but runtime-only | WeakMap storage and live `DocumentChange` instance checks | Versioned round-trip and undo/redo/rebase proof | ready for accepted execution |
| Plite strengths remain protected | Live anchors/selections/algebra/facets/Yjs/scheduler/React/multi-root/layout owners verified | Focused packages, daily check, browser matrix and benchmark targets after each relevant slice | ready for accepted execution |
| Full list is exhaustive | Coverage table maps all 60 original rows to 26 current concepts | Re-audit comparison rows after execution; no unmapped row | ready for accepted execution |

Conditional evidence:
- High-risk scenarios:
  1. Native changes preserve final JSON but map selection/anchors differently
     from required per-step association. Require incremental change-order laws,
     deletion/move/root cases, native selection and follow-up typing.
  2. Schema fitting accepts unit laws but damages HTML paste, tables, voids,
     inline spacing, IME, or unknown application nodes. Require direct Plate
     adoption plus browser copy/paste/IME proof before deleting correction
     fallbacks.
  3. Removing semantic operations makes Yjs/history correct but materially
     slower or loses move identity. Keep change-first correctness, benchmark
     generic lowering, and allow only replay-validated semantic hints.
  4. Transactional configuration publishes mixed schema/facet/React revisions
     or leaks cleanup after failed setup. Require atomic revision and failure
     tests before cutting direct reconfiguration.
  5. Generic view-store code reduces lines but globalizes recompute/subscriber
     wakeups. Gate on current fan-out metrics and lane-specific parity.
- External research: scoped to the named live `../wordgard` donor; no web or
  generic editor thesis is needed because local mechanisms and Plite owners
  settle every decision.
- Issue/PR provenance: N/A: private local architecture comparison, no public
  issue, PR, or claim intake.
- Browser/benchmark/docs/release/behavior-law owners: browser proof applies in
  slices 2, 3, 4, 5, 6, 7 and closure; perf proof applies to transaction,
  normalization, view fan-out, clipboard and Yjs; docs/changesets apply to every
  public break; release/publish is N/A unless separately authorized.

Findings:
- Root doctrine requires canonical `DocumentChange` truth, derived operations,
  Plite/Plate ownership, current-checkout authority, and browser proof for
  browser claims.
- The original comparison contains 60, not 59, decision surfaces. All 60 are
  covered above; none is hidden in a generic “later” bucket.
- Published snapshots, `DocumentChange` algebra/serialization, anchors,
  extensible selections, typed effects/fields/facets, lazy commit queries,
  generated laws, Yjs change bridging, DOM scheduling, React/multi-root/layout,
  package proof and browser infrastructure are real completed strengths.
- The central rewrite is incomplete: public operation execution and middleware
  remain, and commits still reconstruct canonical changes from operations.
- Schema validation returns early for unknown element specs; containment and
  wrapping scan live registrations; fitting is per-child; correction still
  prefers operation paths and representation loops.
- Commands are typed but imperative. Extension slots are named but mutate the
  registry immediately. DOM codecs are hardwired. React overlay public lanes
  are sound but their private store kernels are duplicated.
- Core/history state uses canonical changes and effects, but durable history and
  validated versioned field/effect serialization are absent.
- Scoped current production source totals 106,655 lines versus Wordgard's
  22,611. This is diagnostic only; the deletion gates target proven duplicate
  owners, not arbitrary line-count reduction.

Decisions and tradeoffs:
- Do not clone Wordgard. Keep Plite JSON, paths for queries, runtime IDs,
  extension typing, React, DOM coverage, multi-root, layout, Yjs, packages,
  browser proof and benchmarks.
- Do not keep operations as a public “useful interoperability” escape hatch.
  Keep semantic intent as independently typed, optional, replay-validated
  metadata; otherwise dual truth survives under a nicer comment.
- Do not add automatic facet dependency tracking. Explicit named dependencies
  are more predictable for performance, debugging, and agents.
- Do not expose one public `ViewLayer` mega-API. Unify the private mapped-store
  machinery while preserving Decoration, Annotation and Widget semantics.
- Do not build an imperative renderer while deletion work remains and no
  consumer exists.
- One temporary private legacy-intent bridge is allowed only during accepted
  execution slices 1-2. Owner: `packages/plite` transaction migration. It is
  non-public; deletion trigger is migration of all transform writers; removal
  gate is zero bridge/old-writer matches before slice 3.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| One combined test/source search produced oversized output | 1 | Split subsequent reads by exact owner and bounded line range | No evidence lost; later audits used exact files/ranges and counts |

Verification evidence:
- Source audit: original comparison contains exactly 60 source rows; coverage
  table maps 60/60 to current concepts.
- Source audit: `interfaces/editor.ts:1565-1575`, `:1644-1675`,
  `:2210-2235`, `core/public-state.ts:4837-5069`, and `core/apply.ts:32-187`
  prove the operation-first transaction path. Scoped Plite/DOM/React/history/Yjs
  production search finds 45 files importing or naming `Operation`.
- Source audit: `editor-schema.ts:185-333`, `:360-412`,
  `correction.ts:58-182`, and `editor/correct-document.ts:29-165` prove the
  remaining schema/fitting/correction gap.
- Source audit: `command-registry.ts:35-58`, `:93-170`,
  `extension-slot.ts:37-72`, `dom-clipboard-runtime.ts:74-124`, and zero codec
  declaration matches prove command/config/codec gaps.
- Source audit: projection/annotation/widget stores total 2,254 lines and their
  hooks repeat projector/lifecycle logic; public lanes remain distinct by
  doctrine.
- Source audit: `plite-history/history-state.ts:5-27`, `history.ts:11-50`, and
  `public-state.ts:453-485` prove canonical but runtime-only/raw persistence.
- Source audit: live `../wordgard` schema, commands, configuration, shapes,
  history and view plugin failure owners confirm the mechanisms being accepted
  or rejected.
- Mechanical proof: the coverage-section audit reports 60 rows, the decision
  ledger reports 26 concept rows, no unresolved placeholders remain, and
  `check-complete.mjs` exits 0 for this plan.

Final handoff prepared:
- Ownership and target API/runtime: 26 concept decisions, eight runnable slices
  plus closure, and one evidence-gated renderer defer are recorded.
- Public breaks and Plate/collaboration adoption: operation transaction/
  middleware, command, config, schema, codec and persistence breaks name their
  direct Plite/Plate/Yjs owners and no compatibility path.
- Applicable browser/benchmark/docs/provenance decisions: exact claim classes
  are assigned; public provenance and release are scoped N/A.
- Proof and execution risks: five realistic high-risk scenarios and focused
  gates are recorded.
- Execution order and user attention: accept this exact plan before any source
  implementation; execute slices 0-9 in order and leave D26 deferred.

Timeline:
- 2026-07-18T22:03:10.696Z Plite Plan created.
- 2026-07-19 Requirements, scope, flow mode, verification surface, and hard
  planning boundary recorded before exhaustive owner audit.
- 2026-07-19 Live transaction/schema/state/selection/DOM/React/history/Yjs and
  Wordgard donor owners audited; stale completion claims reopened.
- 2026-07-19 All 60 original rows mapped to 26 current decisions; execution,
  adoption, proof, risk, deletion, and handoff rows resolved.
- 2026-07-19 Final source/placeholder audits and `check-complete.mjs` passed.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Plan ready for user review |
| Where am I going? | Accepted-plan execution only after explicit invocation against this path |
| What is the goal? | Produce the complete live-source Wordgard-to-Plite decision ledger and execution order |
| What have I learned? | Eight runnable architecture/closure slices remain; the rest are explicit keeps, rejections, or one defer |
| What have I done? | Covered 60/60 original rows with live evidence, owners, adoption, proof, risks, and verdicts |

Open risks:
- Accepted execution is a major public/runtime break. Its highest risks are
  per-step selection semantics, identity/performance loss without operation
  fast paths, destructive schema fitting around paste/table/void/IME, mixed
  configuration revisions, and view-layer over-generalization. Each has a
  focused slice gate above; none is an unresolved planning decision.
