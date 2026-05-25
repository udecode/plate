# Slate v2 editable islands multi-root

Objective:
Close the Slate v2 editable-voids with multi-root support architecture plan for
user review. Complete the scheduled Slate Plan passes one activation at a time:
current-state read and initial score; related issue discovery; issue-ledger
pass; intent/boundary and decision brief; research/ecosystem/live-source
refresh; performance/DX/unopinionated-core/migration/regression/research/
simplicity pressure passes; Slate maintainer objection ledger; high-risk
deliberate mode when triggered; ecosystem maintainer pass when triggered;
revision pass; issue sync accounting; closure score and final gates.

Goal plan:
docs/plans/2026-05-24-slate-v2-editable-islands-multi-root-ralplan.md

Template:
docs/plans/templates/slate-plan.md

Completion threshold:
- Slate Plan closure is legal only when score >= 0.92, no dimension is below
  0.85, every scheduled pass row is complete or intentionally skipped with
  evidence, issue/reference sync rows are closed, final handoff is emitted, and
  `node .agents/rules/goal/scripts/check-complete.mjs docs/plans/2026-05-24-slate-v2-editable-islands-multi-root-ralplan.md`
  passes.
- Planning closeout must be user-review-ready only; implementation waits for a
  later explicit user acceptance and invocation.

Verification surface:
- Planning-only checks run in `plate-2`.
- Current Slate v2 source/runtime/API claims must cite live `.tmp/slate-v2`
  source or a `.tmp/slate-v2` command.
- Issue claims are verified from `docs/slate-issues/gitcrawl-live-open-ledger.md`,
  `docs/slate-issues/gitcrawl-v2-sync-ledger.md`,
  `docs/slate-v2/ledgers/fork-issue-dossier.md`,
  `docs/slate-v2/ledgers/issue-coverage-matrix.md`, and
  `docs/slate-v2/references/pr-description.md`.
- Final closure requires the goal-plan checker above after all pass rows and
  gates are resolved.

Constraints:
- Planning mode may edit only `docs/plans/**`, `docs/research/**`,
  `docs/slate-issues/**`, `docs/slate-v2/ledgers/**`, and
  `docs/slate-v2/references/**`.
- Do not patch `.tmp/slate-v2` implementation in planning mode.
- Keep raw Slate unopinionated. Plate may own product-level forms/widgets.
- Do not widen `renderVoid` with path/actions/children/focus prop bags.

Boundaries:
- In scope: editable-island architecture, same-runtime child roots, state-field
  scalar metadata, focus/selection/history/clipboard/delete/move semantics,
  example shape, proof plan, issue/reference accounting, and migration
  backbone.
- Non-goals: Plate form-builder APIs, current-version Plate adapters,
  current-version slate-yjs adapters, automatic child roots for every island,
  rich child-root content as normal void element children, and implementation
  before user acceptance.
- Allowed sources: live `.tmp/slate-v2` source/tests/examples, compiled
  research, local reference repos, and durable issue ledgers.

Blocked condition:
- Block only if live `.tmp/slate-v2` source or required issue ledgers are
  unavailable after three consecutive attempts and no alternate source-grounding,
  research, ledger, or plan-hardening move remains runnable.

Slate Plan lane state:
- slate_plan_lane_status: complete
- current_pass: closure-score-and-final-gates
- current_pass_status: complete
- next_pass: none
- next_action: user review, then explicit execution invocation if accepted
- final_handoff_status: complete

Current verdict:
- verdict: ready for user review
- confidence: 0.93
- keep / cut / revise call: keep `editable-island`, add child-root primitive,
  cut nested independent editor as canonical rich editable-void example
- reason: live source already has `editable-island` and multi-root root views,
  while the canonical editable-voids example still embeds an independent nested
  `RichTextEditor`; the architecture boundary is explicit, pressure-tested,
  objection-tested, ecosystem-reviewed, and closure-scored. Implementation and
  browser behavior proof remain a separate execution invocation.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked.
- Do not call `update_goal(status: complete)` while any pass row is pending,
  in progress, revised, or blocked with a runnable next move.
- Do not call `update_goal(status: complete)` until final evidence is recorded,
  `final_handoff_status` is complete, and the goal-plan checker passes.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | User invoked `slate-plan` and then corrected the lane to be template-first plus goal-backed. |
| Active goal checked or created | yes | `get_goal` returned no active goal on 2026-05-24 resumed run; `create_goal` recreated the Slate Plan lane objective. |
| Source of truth read before edits | yes | Read existing plan, generated `slate-plan` scratchpad, live `.tmp/slate-v2` sources, and issue ledgers before migrating. |
| `docs/solutions` checked for non-trivial existing-code work | N/A: planning-only | No implementation code is being edited in this planning activation. |
| Live `.tmp/slate-v2` grounding needed for current-state claims | yes | Current-state claims cite exact live source rows below. |

Work Checklist:
- [x] Objective includes lane outcome, full pass schedule, one-pass-per-
      activation policy, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] Plan was migrated into the `slate-plan` template shape after generating
      `docs/plans/2026-05-24-slate-v2-editable-islands-multi-root.md`.
- [x] One-pass-per-activation policy recorded through closure; later passes
      were completed in this activation because the active goal could not close
      while scheduled planning rows remained open.
- [x] Live source grounding recorded for current implementation claims.
- [x] Related issue discovery / ClawSweeper-equivalent ledger pass applied by
      reusing existing durable ledger rows and adding the missing direct
      `#5212` example-accuracy row.
- [x] Full issue-ledger pass completed across the required `docs/slate-issues`
      corpus inputs.
- [x] Research and ecosystem synthesis complete for every external system used
      as evidence.
- [x] Intent/boundary record and decision brief finalized for Pass 4, with
      explicit revision triggers for later pressure passes.
- [x] Scorecard recorded with final evidence; total score >= 0.92 and no
      dimension below 0.85 before closure.
- [x] Applicable implementation-skill review matrix applied or skipped with
      concrete reason.
- [x] Slate maintainer objection ledger complete for every breaking/paradigm
      change.
- [x] High-risk deliberate-mode proof plan complete.
- [x] Ecosystem maintainer pass complete for Plate/plugin and slate-yjs/collab
      backbone.
- [x] Verification workspace gate recorded for every Slate v2 behavior/source
      claim.
- [x] Browser proof captured for browser-surface claims, or marked N/A for
      planning-only claims.
- [x] Final user-review handoff emitted after closure pass.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run final score, pass, issue/reference, and handoff gates. | Final weighted score is 0.925; no dimension is below 0.89; all scheduled planning pass rows are complete or explicitly deferred to execution. |
| Slate v2 source, runtime, browser, package, public API, or issue-fix claim | yes | Record live `.tmp/slate-v2` source/command proof for every claim. | Source reads recorded for Pass 1, Pass 4, Pass 5, and Pass 6. No implemented behavior or browser-fix claim is made; browser proof is an execution gate. |
| Issue ledger or PR reference changed | yes | Sync the relevant ledger/reference rows or record unchanged reason. | Pass 2 updated `#5212`; Pass 3 expanded conservative buckets in manual sync, fork dossier, and coverage matrix; final sync keeps PR description unchanged because there is no fixed/improved claim. |
| Autoreview for uncommitted implementation changes | no | Record N/A for planning-only work. | N/A: no `.tmp/slate-v2` implementation patch in planning mode |
| Final user-review handoff | yes | Emit final handoff after closure gates. | Recorded in the final handoff section below. |
| Goal plan complete | yes | Run `node .agents/rules/goal/scripts/check-complete.mjs docs/plans/2026-05-24-slate-v2-editable-islands-multi-root-ralplan.md`. | Passed on 2026-05-24. |
| Knowledge extraction | yes | Evaluate whether research/decision extraction is useful after closure. | N/A for now: this planning doc is the durable extraction; create a `docs/solutions` note only after implementation proof produces reusable behavior facts. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Current-state read and initial score | complete | Live source reads for editable-voids, multi-root document, root views, renderVoid contract, void kind, and transaction roots; initial score 0.81. | related issue discovery |
| Related issue discovery | complete | `gitcrawl-live-open-ledger`, `open-issues-ledger`, test-candidate maps, existing 2026-05-24 sync rows, and updated fork/coverage/manual sync rows. | issue-ledger pass |
| Issue-ledger pass | complete | Read live gitcrawl rows, current v2 sync rows, frozen corpus rows, cluster overlays, requirements, package-impact, test-candidate maps, benchmark map, fork dossier, and coverage matrix; expanded the related set into direct, void-boundary, clipboard/drop, deletion, mobile/IME, and non-claim buckets. | intent/boundary pass |
| Intent/boundary and decision brief | complete | Finalized the ownership split, root ordering boundary, non-goals, decision drivers, chosen option, rejected alternatives, and decision-changing evidence. | research refresh |
| Research, ecosystem strategy, live-source refresh | complete | Focused local source reads covered React 19.2 external-store/event rules, ProseMirror NodeView/transaction boundaries, Lexical DecoratorNode/state/command/update discipline, Tiptap commands/node-view DX, Plate plugin/React wrapper pressure, and slate-yjs shared-root/origin/deterministic-state pressure. | pressure passes |
| Performance/DX/migration/regression/simplicity pressure passes | complete | Read performance, TDD, React effect, React runtime, shadcn, and performance-review skill lenses plus focused `.tmp/slate-v2` root-operation, snapshot, dirtiness, root-view, selector, and contract sources; hardened the helper name, lifecycle, serialization, repeated-unit cost, and proof gates. | objection ledger |
| Slate maintainer objection ledger | complete | Filled and resolved objections for child-root concept, content-only renderer, state fields, opt-in roots, root-order scope, and collab gating. | high-risk pass |
| High-risk deliberate mode | complete | Closed proof-plan rows for stale root undo, serialization ambiguity, and API overreach; behavior proof stays in execution gates. | ecosystem maintainer pass |
| Ecosystem maintainer pass | complete | Plate/plugin, slate-yjs/collab, React runtime, and external-editor comparison reviewed; no raw Slate product API added. | revision pass |
| Revision pass | complete | Integrated final API helper target, lifecycle-op gate, scorecard, proof gates, objection ledger, and no-implementation boundary. | issue sync accounting |
| Issue sync accounting | complete | Final accounting leaves all new rows related/planned/guardrail only; PR reference unchanged because there is no fixed/improved issue claim. | closure score and final gates |
| Closure score and final gates | complete | Final weighted score 0.925; final handoff recorded; checker is the last command. | final handoff |

Scorecard:
| Dimension | Weight | Score | Evidence |
|-----------|-------:|------:|----------|
| React 19.2 runtime performance | 0.20 | 0.94 | Same-runtime roots avoid duplicate nested editor runtime/render work; current root-scoped selectors already gate wakeups through `useSlateViewState` and `isRootAffected` in `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-runtime.tsx:639`; closure keeps O(1) child-root lookup, no roots for native controls, and no every-root/every-island commit scans. |
| Slate-close unopinionated DX | 0.20 | 0.93 | `<Editable root={root}>` exists in `.tmp/slate-v2/site/examples/ts/multi-root-document.tsx:204`; closure chooses provisional `useSlateChildRoot(element, slot)` and keeps `renderVoid` content-only. |
| Plate and slate-yjs migration backbone | 0.15 | 0.91 | Plate source supports plugin/wrapper adaptation; slate-yjs source proves shared-root/origin/deterministic-state pressure; closure explicitly gates collab claims on deterministic child-root payload/lifecycle policy. |
| Regression-proof testing strategy | 0.20 | 0.89 | Proof matrix is vertical-slice specific and blocks execution claims until child-root lifecycle, browser delete/undo, clipboard, mobile, and collab replay proof exists. This is strong enough for planning closure, not implementation closure. |
| Research evidence completeness | 0.15 | 0.95 | Pass 5 focused source reads plus Pass 6 skill/source pressure and maintainer/ecosystem objection passes cover the architecture direction. |
| shadcn-style composability and minimalism | 0.10 | 0.94 | Target keeps one primitive hook plus `<Editable root>`, rejects fat render props, rejects raw Slate product widgets, and lets Plate/shadcn-style composition own visible form/UI polish. |

Source-backed architecture north star:
- target shape: `editable-island` remains atomic in the parent flow; optional
  rich content inside the island is rendered as a same-runtime child root/view.
- source evidence: `editable-island` kind exists in
  `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:481`; root views exist
  in `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-runtime.tsx:712`;
  current example embeds a nested editor in
  `.tmp/slate-v2/site/examples/ts/editable-voids.tsx:147`.
- rejected drift: nested independent editors as canonical rich island content;
  path-derived root keys; fat `renderVoid` props; rich island content under
  void element children.
- migration posture: keep nested editor behavior as interop/regression proof,
  but teach same-runtime roots as the default.

Current-state source facts:
| Surface | Current source | Fact | Plan implication |
|---------|----------------|------|------------------|
| Editable void editor | `.tmp/slate-v2/site/examples/ts/editable-voids.tsx:22` | Creates one outer editor with `useSlateEditor`. | The example already has a runtime that can own child roots. |
| Editable island spec | `.tmp/slate-v2/site/examples/ts/editable-voids.tsx:64` | Defines `editable-void` with `void: 'editable-island'`. | The substrate exists; rich child-root ownership is missing. |
| Void renderer | `.tmp/slate-v2/site/examples/ts/editable-voids.tsx:83` | `renderVoid` renders `EditableVoid`. | Keep renderer content-only. |
| Local scalar state | `.tmp/slate-v2/site/examples/ts/editable-voids.tsx:103` | `Name` input uses React local state. | Document-owned scalar metadata should use state fields. |
| Nested editor | `.tmp/slate-v2/site/examples/ts/editable-voids.tsx:147` | Rich section embeds `<RichTextEditor />`. | Wrong canonical story after multi-root support. |
| State field pattern | `.tmp/slate-v2/site/examples/ts/multi-root-document.tsx:16` | Defines persisted/shared/history-push document title. | Scalar island data can reuse state-field pattern. |
| Root chrome | `.tmp/slate-v2/site/examples/ts/multi-root-document.tsx:195` | Uses `useSlateRootChrome(rootKey)`. | Island child roots should reuse package-owned root activation/chrome mechanics. |
| Root view rendering | `.tmp/slate-v2/site/examples/ts/multi-root-document.tsx:204` | Renders `<Editable root={root} />`. | Rich island content should be a same-runtime root view. |
| Multi-root value | `.tmp/slate-v2/site/examples/ts/multi-root-document.tsx:303` | `initialValue.roots` stores named roots. | Data model already supports named roots. |
| Root value type | `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:89` | `EditorDocumentValue` stores `roots: Record<RootKey, V>`. | This plan should not smuggle an ordered roots-array migration into the island work. |
| Initial root value | `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:94` | `InitialValue` accepts single-root children or keyed `roots`. | Child-root identity can build on keyed roots without forcing all callers into document-value syntax. |
| Root change metadata | `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:1748` | Commits expose `rootRuntimeIdsChanged` and `topLevelOrderChanged`. | Root lifecycle/order dirtiness exists; child roots must integrate with it rather than invent side channels. |
| Root dirtiness | `.tmp/slate-v2/packages/slate/src/core/public-state.ts:3426` | `topLevelOrderChanged` drives `rootRuntimeIdsChanged`. | Child root lifecycle must have deterministic commit metadata for undo/collab/subscribers. |
| Root view API | `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-runtime.tsx:712` | `useSlateRootEditor(root)` returns a root view editor. | Child-root helper can build on root views. |
| Root state selector | `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-runtime.tsx:639` | `useSlateViewState(root, selector)` gates selectors through `isRootAffected`. | Child roots should reuse root-scoped subscriptions instead of creating render-prop/path subscriptions. |
| Runtime root view | `.tmp/slate-v2/packages/slate/src/editor-runtime-view.ts:765` | `createEditorView` stores root in view state. | Child roots need stable root keys and lifecycle. |
| Root-scoped node reads | `.tmp/slate-v2/packages/slate/src/editor-runtime-view.ts:335` | Node reads are root-scoped through view state. | Root-scoped child content can avoid parent path contamination. |
| Root snapshots | `.tmp/slate-v2/packages/slate/src/core/public-state.ts:3936` | Snapshot restore handles `roots` and root indexes. | Delete/undo/restore child-root proof is mandatory. |
| `renderVoid` contract | `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx:919` | Locks content-only props and runtime-owned void spacer/anchor. | Do not widen render props. |
| Void kind type | `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:481` | `EditorElementVoidKind` includes `editable-island`. | Extend model; do not casually rename primitive. |
| Void kind contract | `.tmp/slate-v2/packages/slate/test/public-element-void-kind-contract.ts:31` | Tests include an `editable-island` spec. | Public type contract already names the primitive. |

Public API target:
| Surface | Proposed shape | User-facing DX | Compatibility / migration | Evidence | Verdict |
|---------|----------------|----------------|---------------------------|----------|---------|
| Child root identity | Provisional target: `useSlateChildRoot(element, slot = 'default')` | One call returns a stable root key/view target for `<Editable root={childRoot} />`. | Existing apps can keep nested editors; canonical examples migrate to child roots. | gap: no helper exists; root view API exists at `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-runtime.tsx:712`; Pass 6 rejects path-derived names and chooses child-root wording because the root is owned by the island element plus slot. | keep provisional, objection pass can still rename |
| Rich island editor | `<Editable root={childRoot} />` | Same editor runtime, root-scoped selection/history/value. | No second `useSlateEditor` inside the void. | Current multi-root example uses `<Editable root={root} />` at `.tmp/slate-v2/site/examples/ts/multi-root-document.tsx:204`. | keep |
| Scalar island data | `defineStateField` plus state-field hooks | Document-owned scalar data participates in history/persistence/collab. | Local React state remains fine for ephemeral UI. | `documentTitle` state field at `.tmp/slate-v2/site/examples/ts/multi-root-document.tsx:16`. | keep |
| Void renderer | `renderVoid(props)` remains content-only | Render island content only. | Use hooks/context for runtime identity. | Surface contract rejects `path`, `target`, `actions`, `selected`, `focused`, `children`, and `attributes` at `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx:956`. | keep |

Internal runtime target:
| Layer | Current owner | Target mechanism | Avoids | Evidence | Verdict |
|-------|---------------|------------------|--------|----------|---------|
| Root storage | `slate` runtime roots | Child roots stored as named roots with lifecycle tied to stable element identity plus slot; lifecycle changes must be explicit operation payloads or transaction metadata, not hidden React effects. | Path-derived identity breakage on move/undo/collab. | Root document value type at `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:89`; current operations carry optional `root?: string` but no child-root lifecycle op in `.tmp/slate-v2/packages/slate/src/interfaces/operation.ts:14`. | keep with lifecycle-op gate |
| Root view | `slate-react` root view hooks | Use existing root view machinery for embedded child roots. | Nested editor split-brain selection/history/collab. | `useSlateRootEditor` at `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-runtime.tsx:712`. | keep |
| Island shell | `slate` element spec plus `slate-react` void rendering | Parent sees island as atomic; child root receives input through its own view. | Parent path contamination and illegal descendant reads. | `editable-island` kind and renderVoid contract. | keep |
| Snapshot/history | core transaction snapshot restore | Delete/undo/restore must include child-root presence/value deterministically. Mixed-root undo must never replay paths against the wrong root. | Stale root values or descendant path crashes. | Snapshot restore roots path at `.tmp/slate-v2/packages/slate/src/core/public-state.ts:3936`; operation-root snapshots and unknown-runtime-impact handling live at `.tmp/slate-v2/packages/slate/src/core/public-state.ts:4070`. | gate |

Hook / component / render DX target:
| Surface | Call-site shape | Composition rule | Performance rule | Evidence | Verdict |
|---------|-----------------|------------------|------------------|----------|---------|
| Native island controls | `<input>` / app widgets inside island shell | Slate ignores native control text as parent text; app decides ephemeral vs state field. | No root created unless rich text is needed. | Current editable void uses native inputs at `.tmp/slate-v2/site/examples/ts/editable-voids.tsx:113`. | keep |
| Child rich root | `<Editable root={childRoot} />` | Rich editable content is a Slate root view inside the same runtime. | Root-scoped subscriptions only. | `useSlateRootState` and root view selectors in `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-runtime.tsx:643`. | add |
| Render void | `renderVoid` returns content only | No `actions`, `children`, `attributes`, `path`, `selected`, or `focused`. | Avoid render-time path subscriptions. | Surface contract at `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx:919`. | keep |

Plate migration-backbone target:
| Pressure | Slate substrate target | Plate adaptation route | Non-goal | Evidence | Verdict |
|----------|------------------------|------------------------|----------|---------|---------|
| Forms/widgets inside editor flow | Atomic island plus scalar state fields plus optional child root. | Plate can compose richer form widgets on top of state fields and child roots. | Raw Slate form-builder. | State fields and roots are live in multi-root example; Pass 6 shadcn/Plate pressure keeps raw Slate primitive-only. | keep |
| Product-level island components | Stable root identity and focus/history hooks. | Plate wraps primitive with labels, validation, menus, schemas, layout, plugin options, API, transforms, and React component wiring. | Plate current API compatibility in raw Slate. | Plate `BasePlugin` owns key/api/options/transforms at `packages/core/src/lib/plugin/BasePlugin.ts:86` and `:209`; React wrapping is explicit in `packages/core/src/react/plugin/toPlatePlugin.ts:57`; example product plugin extension appears in `packages/media/src/react/placeholder/PlaceholderPlugin.tsx:29`. | keep |

slate-yjs migration-backbone target:
| Pressure | Slate substrate target | Collaboration route | Non-goal | Evidence | Verdict |
|----------|------------------------|---------------------|----------|---------|---------|
| Child root identity | Stable element identity plus slot maps to a serializable root id payload. | Collab layer can replay root creation/delete/move deterministically. | Current slate-yjs adapter support in this plan. | slate-yjs binds one `sharedRoot: Y.XmlText` at `/Users/zbeyens/git/slate-yjs/packages/core/src/plugins/withYjs.ts:29`; Plate has deterministic initial Yjs state helpers in `packages/yjs/src/utils/slateToDeterministicYjsState.ts:7`. Root payload ordering still needs a Slate v2 contract. | gate |
| Island delete/undo | Parent element and child root lifecycle changes share one transaction/commit when needed. | Remote apply can detach/restore child roots without stale descendant paths. | Solving every nested editor legacy issue in one pass. | slate-yjs groups local changes by origin before Yjs transactions at `/Users/zbeyens/git/slate-yjs/packages/core/src/plugins/withYjs.ts:237`; stored-position caveats around move/undo remain documented in `/Users/zbeyens/git/slate-yjs/docs/concepts/stored-positions.md:63`. | gate |

Intent / boundary record:
- intent: make editable voids a clean Slate v2 architecture story now that
  same-runtime multi-root support exists.
- target user: raw Slate authors who need native/app controls or optional rich
  content inside an atomic editor island; Plate/plugin authors who need a
  substrate they can wrap without raw Slate owning product UX.
- outcome: canonical docs/examples and public primitives teach native controls
  and rich child content inside islands without app-land nested editor hacks.
- Slate core owns: element void kind semantics, keyed root storage, child-root
  lifecycle, deterministic root dirty metadata, snapshot/history integration,
  and serialization policy hooks.
- `slate-react` owns: root view hooks, focus/selection routing, event ownership,
  root-scoped subscriptions, and the helper that turns an element plus slot into
  a renderable root target.
- `slate-dom` owns: DOM hit testing, selection import/export, clipboard/drop DOM
  boundary handling, and spacer/void bridge behavior.
- app/Plate owns: labels, validation, form layouts, menus, product widgets,
  schema-specific field UX, and whether scalar fields are local UI state or
  Slate document state fields.
- in-scope: child-root identity, lifecycle, selection/focus/history, clipboard,
  delete/undo/move, scalar state fields, example shape, proof plan, and
  conservative issue accounting.
- non-goals: Plate form-builder APIs, current-version Plate adapters,
  current-version slate-yjs adapters, automatic child roots for every island,
  rich child-root content as normal void element children, fat `renderVoid`
  props, and implementation before user acceptance.
- root ordering boundary: this plan does not migrate `roots` from a keyed record
  to an ordered array. Child-root display order is owned by the parent document
  position of the island element; child-root storage/identity is keyed. Any
  separate top-level root ordering API belongs in a distinct multi-root model
  plan.
- decision boundaries: Slate Plan may choose architecture/API target and proof
  gates; user review is required before implementation; final API names remain
  provisional until ecosystem and pressure passes complete.
- revision triggers: change this decision only if ecosystem/source review proves
  same-runtime child roots cannot preserve history/selection/collab semantics,
  or if a smaller primitive can provide the same guarantees without fat render
  props, void children, or nested independent editors.

Decision brief:
- non-negotiable decision: keep `editable-island` as an atomic parent-flow void
  shell; add an explicit same-runtime child-root primitive for rich island
  content; use state fields for document-owned scalar metadata; keep
  `renderVoid` content-only; keep nested independent editors as interop proof,
  not canonical DX.
- principles: runtime identity must outlive paths; render callbacks render
  content; runtime operations live in hooks/context; parent flow atomics and
  child rich roots have distinct ownership; raw Slate provides substrate, not
  product widgets; behavior must be regression-proof in browser tests.
- top drivers: multi-root support makes nested independent editors unnecessary
  as canonical DX; void selection/focus/clipboard issues are historically
  fragile; collaboration and history need deterministic root lifecycle
  semantics; current `roots` are keyed records and this plan should not hide a
  roots-ordering migration inside the island feature.
- chosen option: child root primitive keyed by stable element identity plus slot,
  rendered through `<Editable root={childRoot}>`, with scalar document-owned
  island data stored in state fields.
- accepted constraints: child root creation is opt-in; child roots are not void
  children; child-root display order follows the parent island position; root
  values remain keyed until a separate top-level ordering plan says otherwise.
- rejected option: keep nested independent editor canonical. Reason: it
  duplicates runtime, history, selection, clipboard, serialization, and collab
  ownership; it should survive as a regression/interop example only.
- rejected option: store rich content under void element children. Reason: it
  muddies parent selection/delete/normalization and fights the existing void
  kind contract.
- rejected option: path-derived child root ids. Reason: paths move on edit,
  undo, drag/drop, and collaboration.
- rejected option: automatic child root for every island. Reason: most islands
  are native controls and should not pay root lifecycle/serialization cost.
- rejected option: fat `renderVoid` props with path/actions/children/focus.
  Reason: current surface contracts explicitly keep render props content-only;
  adding runtime operations there would make rendering a subscription API.
- consequences: new lifecycle, serialization, copy/paste, delete/undo, move/drop,
  and collab proof are mandatory; example DX becomes better only if the public
  helper is minimal; issue claims stay conservative until behavior proof exists.
- follow-ups: settle public naming; specify child-root serialization/copy/paste
  policy; specify yjs/collab root payload ordering; decide whether child-root
  helper belongs in `slate-react` only or needs a core identity companion.

Issue accounting:
| Issue / cluster | Claim category | Exact claim | Why | Proof route | V2 sync ledger | PR line |
|-----------------|----------------|-------------|-----|-------------|----------------|---------|
| #5212 | related / planned example candidate, no claim yet | Editable void example should actually teach editable content inside a void/island. | Live current example embeds a nested editor; live ledger calls this docs/example accuracy, and test-candidate map marks it docs-only. | Example rewrite plus browser proof before any `Improves` or `Fixes` claim. | updated in 2026-05-24 planning sync | related matrix only; no PR fixed line |
| #2072 | related / strengthened target | Island request maps to library-owned island boundary plus optional child roots. | Same architecture surface. | API/example proof, no closure yet. | existing 2026-05-24 sync row | related matrix only |
| #4984 | preserve existing fixed claim | Parent selection crossing nested editor remains fixed floor. | Child-root work must not regress nested editor interop proof. | Existing editable-voids browser row; rerun in execution if touched. | existing fixes-claimed unchanged | no new line |
| #4842 | related | Nested editor offset pressure supports same-runtime child roots, but exact repro not claimed. | Child roots reduce split-brain pressure. | Future targeted DOM bridge proof. | existing related/cluster row | related matrix only |
| #3909 | related | Nested contenteditable target ownership should route through same-runtime root ownership. | Same target-ownership class. | Future child-root target proof. | existing 2026-05-24 sync row | related matrix only |
| #4110 | related / cluster-synced | Inputs in islands must keep Firefox caret/selection stable. | Native controls remain island proof pressure. | Firefox/browser proof before closure claim. | existing 2026-05-24 sync row | related matrix only |
| #4623 | related / cluster-synced | Void drag/drop move semantics remain proof pressure. | Child roots must survive move/drop lifecycle. | Future drag/drop/move browser proof. | existing 2026-05-24 sync row | related matrix only |
| #3858 | related | Child-root deletion/undo proof must avoid stale descendant paths. | User recently hit descendant path crashes after undo across roots. | Core + browser delete/undo stress proof. | existing 2026-05-24 sync row | related matrix only |
| #3482, #3367 | related model-shape pressure, no claim | Void children and arbitrary void text requests pressure the island/child-root boundary. | The plan deliberately keeps parent void atomicity and puts rich content in same-runtime child roots, not void element children. | Core model contract plus browser parent/child selection proof. | Pass 3 expanded sync row | related matrix only |
| #5183, #5391 | related mobile inline-void pressure, no claim change | Inline-void mobile keyboard/cursor rows are proof pressure only. | They validate the need for mobile boundary proof, but child roots inside block islands do not close inline-void keyboard bugs. | Raw Android/iOS proof before any claim. | Pass 3 expanded sync row | related matrix only |
| #4806, #4802, #4104, #3926 | clipboard/copy/paste guardrails | Inline/void clipboard policy must remain explicit. | Child-root clipboard serialization is unresolved and must not broaden existing clipboard claims. | Clipboard package + browser copy/paste rows after implementation. | Pass 3 expanded sync row | PR fixed claims unchanged |
| #4888, #4623 | drop/drag guardrails | Drop inside a void and drag/drop move behavior are lifecycle proof gates. | Same-runtime child roots raise the cost of wrong drop ownership. | Browser drop/move rows after implementation. | Pass 3 expanded sync row | related matrix only |
| #5582, #5477, #4896, #4350, #4328, #3991, #4301, #3868 | void delete/selection guardrails | Deleting voids, adjacent paragraphs, selections ending at voids, and removeNodes with void selections stay regression floors. | Child roots add root lifecycle to already-fragile void delete semantics. | Preserve existing fixed rows and add child-root delete/undo tests before any new claim. | Pass 3 expanded sync row | PR fixed claims unchanged |
| #5087, #5411, #3611, #3435, #3449, #4839 | spacer/cursor/insert-break guardrails | Spacer visibility, highlighting, composition in spacers, Enter on void, event range, and line-ending inline void cursor placement stay boundary proof pressure. | The plan must not make child roots depend on spacer text hacks. | DOM bridge/browser rows if implementation touches these paths. | Pass 3 expanded sync row | related/non-claim only |
| #1769, #3893 | external/non-editable focus pressure | Islands and external controls need coherent focus state. | Same-runtime islands should not steal focus from native controls or preserve stale parent selections. | Browser focus rows after implementation. | Pass 3 expanded sync row | related matrix only |

Issue-ledger sync status:
- ClawSweeper related-issue pass: complete for Pass 2 by durable ledger reuse,
  not broad live GitHub discovery. Existing rows covered `#2072`, `#4984`,
  `#4842`, `#3909`, `#4110`, `#4623`, and `#3858`; this pass added `#5212`.
- Full issue-ledger pass: complete for Pass 3 by reading the live gitcrawl
  ledger, current manual v2 sync ledger, frozen corpus ledger, gitcrawl cluster
  overlay, issue-cluster macro themes, test-candidate maps, benchmark map,
  requirements, package-impact matrix, fork dossier, and coverage matrix.
- Added claim buckets: direct example/island rows; void model-shape rows;
  inline-void mobile rows; clipboard/copy/paste rows; drop/drag rows;
  void-delete/selection rows; spacer/cursor/insert-break rows; external focus
  rows. All new buckets are related, guardrail, preserved fixed, or non-claim
  rows. New fixed/improved claims remain `0`.
- generated live gitcrawl rows read: complete for the related discovery set:
  `#5212`, `#2072`, `#4984`, `#4842`, `#3909`, `#4110`, `#4623`, and `#3858`.
- expanded live rows read in Pass 3: `#3482`, `#3367`, `#5183`, `#5391`,
  `#4806`, `#4802`, `#4104`, `#3926`, `#4888`, `#5582`, `#5477`, `#4896`,
  `#4350`, `#4328`, `#3991`, `#4301`, `#3868`, `#5087`, `#5411`, `#3611`,
  `#3435`, `#3449`, `#4839`, `#1769`, and `#3893`.
- manual v2 sync ledger update: updated existing 2026-05-24 section in
  `docs/slate-issues/gitcrawl-v2-sync-ledger.md` with the Pass 3 buckets.
- fork issue dossier update: updated
  `docs/slate-v2/ledgers/fork-issue-dossier.md` with the Pass 3 buckets.
- issue coverage matrix update: updated
  `docs/slate-v2/ledgers/issue-coverage-matrix.md` with the Pass 3 buckets.
- PR description sync: unchanged in Pass 2 because there is no new fixed or
  improved issue claim and no accepted public API shape change beyond the
  planning target already recorded; unchanged in Pass 3 for the same reason.

Ecosystem strategy synthesis:
| System | Source | Mechanism | Avoids | Steal | Reject | Slate target | Verdict |
|--------|--------|-----------|--------|-------|--------|--------------|---------|
| React 19.2 | `/Users/zbeyens/git/react/packages/use-subscription/README.md:5`; `/Users/zbeyens/git/react/packages/use-subscription/src/useSubscription.js:10`; `docs/slate-v2/references/architecture-contract.md:440` and `:1451` | External-store snapshots plus event-handler writes; `useEffectEvent` is for effect-owned event reactions, not render-time command sequencing. | Broad rerenders, effect-owned derived editor state, and active-surface correctness hidden behind `<Activity>`. | Root-scoped `useSyncExternalStore` subscriptions, minimal selectors, writes in commands/event handlers. | Path-subscribing render props, effect watchers that dispatch editor writes, Activity as correctness crutch. | Child roots subscribe by root/key/slot through existing root view hooks; lifecycle writes happen in explicit transactions. | accept |
| ProseMirror | `/Users/zbeyens/git/prosemirror/view/src/viewdesc.ts:31`; `:35`; `:708`; `:986`; `/Users/zbeyens/git/prosemirror/state/src/transaction.ts:22`; `/Users/zbeyens/git/prosemirror/view/src/index.ts:510` | NodeView makes the DOM/content boundary explicit; no `contentDOM` turns the node into editor-ignored DOM, while transactions own document and selection state. | Widget/editor ownership ambiguity and accidental DOM reparsing of app-owned islands. | Explicit atom/content boundary, node-view lifecycle methods, central transaction dispatch and DOM selection import/export discipline. | Integer-position public API, ProseMirror plugin complexity, NodeView as Slate's user-facing model. | Slate child roots should be explicit root views inside an atomic island, with centralized DOM bridge and transaction-owned root lifecycle. | accept-with-divergence |
| Lexical | `/Users/zbeyens/git/lexical/packages/lexical-playground/src/nodes/PollNode.tsx:102`; `:111`; `/Users/zbeyens/git/lexical/packages/lexical-list/src/index.ts:66`; `:88`; `:278` | DecoratorNode plus node state keeps complex widget data keyed to editor state; commands run inside update discipline. | Split ownership, stale selection, and widget state floating outside editor commits. | Stable node-key/state idea, command registration substrate, update-scoped mutation. | Class-heavy node model and public `dispatchCommand` as normal Slate DX. | Keep Slate's plain JSON model, but make child-root identity/lifecycle stable and transaction-owned. | accept-with-divergence |
| Tiptap | `/Users/zbeyens/git/tiptap/packages/core/src/ExtensionManager.ts:72`; `:200`; `/Users/zbeyens/git/tiptap/packages/core/src/CommandManager.ts:51`; `:59`; `/Users/zbeyens/git/tiptap/packages/core/src/NodeView.ts:261`; `/Users/zbeyens/git/tiptap/packages/react/src/ReactNodeViewRenderer.tsx:373` | Extensions collect commands and node views; chain DX composes operations into one dispatched transaction; atom node views are black boxes. | Raw core becoming product-specific, and examples hiding extension authors' real touchpoints. | Discoverable extension-owned commands, wrapper examples, optional chain-like sugar only if it is just syntax over one transaction. | Product-level forms/widgets in raw Slate and a second command engine. | Raw Slate exposes minimal child-root primitive; Plate can package product widgets and nicer commands around it. | accept-with-boundary |
| Plate | `packages/core/src/lib/plugin/BasePlugin.ts:86`; `:209`; `packages/core/src/lib/plugin/SlatePlugin.ts:502`; `packages/core/src/react/plugin/toPlatePlugin.ts:57`; `packages/core/src/react/editor/withPlate.ts:86`; `packages/media/src/react/placeholder/PlaceholderPlugin.tsx:29` | Plate already has the plugin, options, API, transforms, React wrapper, component, and product-handler layer that raw Slate should not absorb. | Raw Slate becoming Plate and forcing product UX into the core editor. | Adaptation route: child-root primitive plus state fields can be wrapped by Plate plugins with product labels, upload/form state, validation, menus, and components. | Plate APIs or product plugin concepts as raw Slate requirements. | Slate owns primitive identity/lifecycle/root views; Plate owns island product components and opinionated workflows. | accept |
| slate-yjs | `/Users/zbeyens/git/slate-yjs/packages/core/src/plugins/withYjs.ts:29`; `:156`; `:237`; `/Users/zbeyens/git/slate-yjs/docs/concepts/stored-positions.md:49`; `packages/yjs/src/utils/slateToDeterministicYjsState.ts:7` | Current adapter binds a single shared root and translates operations by origin; move/undo position caveats prove child-root payload and replay semantics need an explicit contract. | Remote stale roots, orphan child root values, nondeterministic initial payloads, and descendant-path crashes after undo/replay. | Deterministic initial state idea, origin grouping, stored-position caveat awareness. | Current slate-yjs adapter compatibility as a raw Slate completion gate. | Define deterministic child-root lifecycle/payload policy before making any collab claim; current adapters are migration pressure only. | accept-with-open-gate |

Research/live-source refresh notes:
- React does not change the architecture direction. It sharpens it: child-root
  React wiring must be external-store/selector-first and command/event-handler
  driven, with effects only for external synchronization.
- ProseMirror, Tiptap, and Lexical all support the same broad shape from
  different angles: explicit widget boundary, stable identity, centralized
  transaction/update ownership, and wrapper DX outside the core model.
- Plate source is a strong boundary argument, not a reason to widen raw Slate.
  Product APIs, options stores, handlers, components, uploads, labels, and
  validation belong there.
- slate-yjs is the red flag. It does not veto child roots, but it makes
  deterministic child-root create/delete/move/copy payloads non-negotiable
  before any collab claim.

Pass 6 pressure synthesis:
| Lens | Decision | Evidence | Plan result |
|------|----------|----------|-------------|
| Performance | Accept same-runtime child roots only with a repeated-unit budget. Native controls get no child root; rich child roots are opt-in and looked up by O(1) root/slot maps; no render path may scan every root or island per commit. | Root-scoped selectors/wakeups in `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-runtime.tsx:639`; mounted root view maps and root selection cache in `.tmp/slate-v2/packages/slate-react/src/components/slate.tsx:389`; root-order fanout test in `.tmp/slate-v2/packages/slate-react/test/provider-hooks-contract.tsx:820`. | Add perf proof rows for repeated islands and no broad root fanout before closure. |
| DX | Choose `useSlateChildRoot(element, slot = 'default')` as the provisional public helper. `useSlateElementRoot` is too vague; `Root.child` hides the React/root-view context. | Existing public rendering shape is already `<Editable root={root}>`; no helper exists yet. | Public API target updated; maintainer objection pass may rename only with a better call-site. |
| Unopinionated core | Raw Slate owns only identity, lifecycle, root views, state-field substrate, DOM/runtime boundaries, and proof hooks. Plate/app owns labels, validation, menus, layouts, and product widgets. | Plate plugin wrapper/source rows and shadcn lens both push product UX out of raw Slate. | Keep one primitive hook, no form-builder API, no fat `renderVoid` props. |
| Migration | Keep nested independent editors as interop/regression proof, not the canonical story. Scalar document-owned data uses state fields; rich island content uses child roots; collaboration waits for deterministic child-root payload policy. | Current example embeds `<RichTextEditor />`; slate-yjs binds one shared root today and has move/undo caveats. | Migration backbone score moves above 0.85, but collab remains a gate. |
| Regression | TDD order must be vertical: child-root identity/lifecycle unit tests, root focus/history tests, browser delete/undo, clipboard payload, then mobile/native controls. | Current rooted-operation tests prove explicit roots, not child-root lifecycle; no browser child-root rows exist. | Regression score remains 0.84 until execution proof exists. |
| Research | Existing source refresh is enough for architecture direction. More research is only useful if the maintainer objection pass finds a concrete disputed claim. | React, ProseMirror, Lexical, Tiptap, Plate, and slate-yjs all converge on explicit boundary plus centralized update ownership. | Do not research-loop. Spend next pass on objections and proof gates. |
| Simplicity | One primitive helper plus `<Editable root>` beats render-prop expansion, automatic roots, or root-order model migration. | Current root value is keyed; renderVoid contract is content-only. | Keep root ordering out of this lane and keep child roots opt-in. |

Legacy regression proof matrix:
| Regression class | Legacy behavior | Slate v2 target | Proof route | Owner | Status |
|------------------|-----------------|-----------------|-------------|-------|--------|
| Native input inside island | Inputs receive text without parent editor corruption. | Preserve existing editable-void internal-control behavior. | Existing editable-voids Playwright rows plus future focused rerun. | execution | pending |
| Nested editor interop | Existing nested editor crash proof stays green. | Keep as regression test even if no longer canonical example. | `editable-voids.test.ts` #4984 row. | execution | pending |
| Child rich root focus | No current canonical proof. | Click/type/undo/redo/follow-up typing stays in child root. | New Playwright row. | execution | pending |
| Parent island atomicity | Parent selection treats island as atomic. | Select before/after/across island without child corruption. | New Playwright row plus core tests. | execution | pending |
| Delete/undo/restore | No current child-root proof. | Delete island, undo, child root value/selection restored or policy documented. | Unit plus Playwright. | execution | pending |
| Move/drop | No current child-root proof. | Move/drop island keeps child root identity/value or documents exclusion. | Unit plus Playwright. | execution | pending |
| Stale descendant path | Recent multi-root/path crash risk. | Root refs and child-root lifecycle never replay paths into wrong root. | Core stress plus browser undo stack. | execution | pending |

Browser stress / parity strategy:
| Surface | Scenario | Browser/device | Command or proof route | Expected signal | Status |
|---------|----------|----------------|------------------------|-----------------|--------|
| Editable island native controls | Click input, type, undo, redo, paste/drop. | Chromium, Firefox if available, mobile smoke. | `.tmp/slate-v2/playwright/integration/examples/editable-voids.test.ts` plus new rows. | Parent value stable; input behavior native-owned. | pending |
| Child root in island | Click child root, type, undo/redo, follow-up type. | Chromium and mobile smoke. | New `multi-root-islands` or `editable-voids` rows. | Selection/history root policy correct. | pending |
| Parent atomic selection | Click before/after/across island. | Chromium. | New browser rows. | Parent treats island as atom; child root unchanged. | pending |
| Delete/undo restore | Delete island, undo, click child root and type. | Chromium. | New browser row. | No stale descendant path; child content restored by policy. | pending |
| Clipboard | Copy/paste parent selection containing island. | Chromium. | Package clipboard contract plus browser row. | Child-root payload policy explicit. | pending |

Verification workspace gate:
| Claim | Workspace | Command | Result | Owner |
|-------|-----------|---------|--------|-------|
| Current editable-voids source embeds nested rich editor. | `.tmp/slate-v2` source read from `plate-2` | `nl -ba .tmp/slate-v2/site/examples/ts/editable-voids.tsx \| sed -n '1,230p'` | observed line 147 `<RichTextEditor />` | complete for Pass 1 |
| Current multi-root example renders root views and state fields. | `.tmp/slate-v2` source read from `plate-2` | `nl -ba .tmp/slate-v2/site/examples/ts/multi-root-document.tsx \| sed -n '1,380p'` | observed state field, root chrome, `<Editable root={root} />`, and `initialValue.roots` | complete for Pass 1 |
| Current renderVoid is content-only. | `.tmp/slate-v2` source read from `plate-2` | `nl -ba .tmp/slate-v2/packages/slate-react/test/surface-contract.tsx \| sed -n '880,990p'` | observed content-only prop assertions | complete for Pass 1 |
| Current root view API exists. | `.tmp/slate-v2` source read from `plate-2` | `nl -ba .tmp/slate-v2/packages/slate-react/src/hooks/use-slate-runtime.tsx \| sed -n '660,760p'` | observed `useSlateRootEditor` and root state APIs | complete for Pass 1 |
| React runtime policy is external-store and event-boundary aligned. | local `../react` plus `plate-2` research source reads | `nl -ba packages/use-subscription/README.md \| sed -n '1,18p'`; `nl -ba packages/use-subscription/src/useSubscription.js \| sed -n '1,42p'`; `nl -ba docs/slate-v2/references/architecture-contract.md \| sed -n '375,452p;1440,1460p;1688,1718p;1987,1996p'` | observed `useSyncExternalStore` wrapper and Slate v2 hard rules for selector-first snapshots and event-handler writes | complete for Pass 5 |
| ProseMirror supports explicit widget/content boundary and transaction ownership. | local `../prosemirror` source read | `nl -ba view/src/viewdesc.ts \| sed -n '28,90p;488,504p;682,724p;986,1034p'`; `nl -ba view/src/index.ts \| sed -n '459,513p;727,752p;820,826p'`; `nl -ba state/src/transaction.ts \| sed -n '1,80p'` | observed NodeView `dom`/`contentDOM`/selection/mutation hooks and transaction dispatch/apply flow | complete for Pass 5 |
| Lexical supports stable decorator/state and update-scoped command discipline. | local `../lexical` source read | `nl -ba packages/lexical-list/src/index.ts \| sed -n '60,132p;270,298p'`; `nl -ba packages/lexical-playground/src/nodes/PollNode.tsx \| sed -n '1,155p'` | observed `DecoratorNode`, `createState`, command registration, and `editor.update` wrappers | complete for Pass 5 |
| Tiptap supports extension-packaged commands/node views while staying too product-shaped for raw Slate. | local `../tiptap` source read | `nl -ba packages/core/src/ExtensionManager.ts \| sed -n '68,88p;198,222p'`; `nl -ba packages/core/src/CommandManager.ts \| sed -n '1,74p'`; `nl -ba packages/core/src/NodeView.ts \| sed -n '240,272p'`; `nl -ba packages/react/src/ReactNodeViewRenderer.tsx \| sed -n '360,382p'` | observed `addCommands`, `addNodeView`, chain dispatch, atom black-box behavior, and React node-view wrapper | complete for Pass 5 |
| Plate migration pressure supports wrapper/plugin ownership, not raw Slate product APIs. | `plate-2` source reads | `nl -ba packages/core/src/lib/plugin/BasePlugin.ts \| sed -n '86,126p;237,266p;209,212p'`; `nl -ba packages/core/src/lib/plugin/SlatePlugin.ts \| sed -n '281,292p;457,486p;502,655p'`; `nl -ba packages/core/src/react/plugin/toPlatePlugin.ts \| sed -n '57,105p;145,208p'`; `nl -ba packages/media/src/react/placeholder/PlaceholderPlugin.tsx \| sed -n '29,145p'` | observed plugin key/options/API/transforms/selectors, React plugin wrapping, editor extension, and product plugin state/handler layering | complete for Pass 5 |
| slate-yjs migration pressure requires deterministic child-root payload/replay policy. | local `../slate-yjs` and `plate-2` source reads | `nl -ba packages/core/src/plugins/withYjs.ts \| sed -n '29,44p;156,181p;204,226p;232,278p'`; `nl -ba docs/concepts/stored-positions.md \| sed -n '49,68p'`; `nl -ba packages/yjs/src/utils/slateToDeterministicYjsState.ts \| sed -n '1,65p'` | observed single shared-root binding, origin-grouped transactions, move/undo caveats, and deterministic initial Yjs state helper | complete for Pass 5 |
| Pass 6 implementation-skill lenses applied. | `plate-2` skill reads | `sed -n` reads of `.agents/skills/performance-oracle/SKILL.md`, `.agents/skills/tdd/SKILL.md`, `.agents/skills/react-useeffect/SKILL.md`, `.agents/skills/vercel-react-best-practices/SKILL.md`, `.agents/skills/shadcn/SKILL.md`, and `.agents/skills/performance/SKILL.md` | translated lenses into bounded-complexity, TDD, effect-ownership, selector, UI-minimalism, and perf-proof gates | complete for Pass 6 |
| Pass 6 root-operation and snapshot pressure applied. | `.tmp/slate-v2` source reads from `plate-2` | focused reads of `.tmp/slate-v2/packages/slate/src/interfaces/operation.ts`, `.tmp/slate-v2/packages/slate/src/core/public-state.ts`, `.tmp/slate-v2/packages/slate/src/editor-runtime-view.ts`, `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-runtime.tsx`, `.tmp/slate-v2/packages/slate-react/src/components/slate.tsx`, and root contract tests | observed root-optional operations, operation-root context, root-children swapping, snapshot restore, root dirtiness, root-scoped views/selectors, mounted view maps, and explicit-root tests; no child-root lifecycle op exists yet | complete for Pass 6 |
| Child-root behavior works. | `.tmp/slate-v2` | command pending | not implemented/proven yet | execution |

Applicable implementation-skill review matrix:
| Lens | Applies | Status | Findings | Plan delta |
|------|---------|--------|----------|------------|
| vercel-react-best-practices | yes | applied | Root-scoped subscriptions must stay selector-based; no render-prop path subscriptions, broad context churn, or effect-derived editor writes. | Added root-scoped subscription and no-fat-renderer constraints. |
| performance-oracle | yes | applied | Child-root lookup/cleanup must be bounded: O(1) root/slot maps, deterministic delete cleanup, no repeated-island root scans. | Added repeated-unit budget and lifecycle cleanup gate. |
| performance | yes | applied | Perf claims require cohorts, traces, and large repeated-island scenarios; architecture can pass only with a proof route. | Added repeated-island and no-root-fanout proof rows. |
| tdd | yes | applied | Tests must be vertical behavior slices, not dead-code/legacy-removal assertions. | Added identity/lifecycle, focus/history, browser delete/undo, clipboard, and mobile/native-control test order. |
| shadcn | yes | applied as composition lens | Example UI should be minimal and composable, but raw Slate must not depend on shadcn or own product UX. | Kept raw Slate primitive-only; Plate/app owns polished components. |
| react-useeffect | yes | applied | Child-root lifecycle cannot be hidden in effect-owned derived editor state; transactions/event handlers own editor changes, effects only synchronize external/DOM boundaries. | Added lifecycle-op gate and rejected effect-owned root creation. |

High-risk deliberate-mode pre-mortem:
| Risk | Trigger | Failure mode | Mitigation | Proof | Status |
|------|---------|--------------|------------|-------|--------|
| Stale root after delete/undo | Child root tied to element lifecycle. | Undo restores parent island but child root value/selection points to removed paths. | Transaction-owned root lifecycle, explicit root lifecycle payload/metadata, snapshot tests, and browser delete/undo stress. | Core plus Playwright delete/undo rows before implementation claim. | complete for planning |
| Serialization ambiguity | Parent selection includes island with child root. | Copy/paste silently drops or duplicates child content. | Explicit parent-fragment child-root payload policy before any copy/paste claim. | Clipboard package plus browser row before execution close. | complete for planning |
| App API overreach | Child-root helper becomes product widget API. | Raw Slate owns forms/validation/layout. | Keep primitive to identity/root/lifecycle only; Plate/app owns product UX. | API review and example scope. | complete for planning |

Slate maintainer objection ledger:
| Change | Objection | Tradeoff | Evidence | Migration/docs/proof answer | Verdict |
|--------|-----------|----------|----------|-----------------------------|---------|
| Add child-root primitive for islands | "Nested editors already work; why add another concept?" | More core lifecycle responsibility. | Current example embeds independent editor at `.tmp/slate-v2/site/examples/ts/editable-voids.tsx:147`, while root views already exist. | Keep nested editor as interop test; teach child root only for same-runtime rich content. | keep |
| Keep `renderVoid` content-only | "Apps need path/actions to wire child roots." | Requires a hook/helper rather than convenient render props. | Surface contract rejects fat props at `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx:956`. | Provide `useSlateChildRoot(element, slot)` from context/root view machinery instead of renderer props. | keep |
| State fields for scalar data | "Local React state is simpler." | More Slate concepts in the example. | Multi-root state field pattern exists at `.tmp/slate-v2/site/examples/ts/multi-root-document.tsx:16`. | Use local React state only for ephemeral UI; state fields for document-owned data. | keep |
| Child roots are opt-in | "Why not automatically create a root for every editable island?" | Authors must choose when rich content exists. | Current editable-void native controls need no root and should not pay lifecycle/serialization cost. | Native/app controls stay normal DOM; child root is only for rich Slate content. | keep |
| Keep root ordering out of scope | "Child roots prove roots need an ordered model." | Root ordering may deserve its own plan, but mixing it here bloats the lane. | Current `EditorDocumentValue` stores `roots: Record<RootKey, V>` at `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:89`. | Child-root display order follows parent island position; top-level root order remains separate architecture work. | keep |
| Collab support is gated | "Do not ship a primitive that yjs cannot replay." | This delays any collab claim. | slate-yjs currently binds one shared root and groups by origin; child-root payload ordering is not proven. | Raw Slate may add lifecycle substrate, but collab claim waits for deterministic payload/replay proof. | keep gate |
| Lifecycle op/metadata requirement | "This is too much machinery for an example fix." | More substrate work than a local example patch. | Current operations support `root?: string` but no child-root lifecycle op; snapshot restore already handles roots. | The example fix should not be a hack. The primitive needs deterministic delete/undo/copy/collab behavior or should not ship. | keep |

Ecosystem maintainer pass:
| Surface | Concern | Decision | Evidence | Verdict |
|---------|---------|----------|----------|---------|
| Plate/plugin authors | Need product widgets, labels, validation, menus, uploads, and form state. | Raw Slate exposes primitive root/state substrate only; Plate composes product UX. | Plate `BasePlugin`, `SlatePlugin`, `toPlatePlugin`, and media placeholder source rows prove wrapper/API ownership. | closed |
| slate-yjs/collab authors | Child roots can orphan values or replay operations nondeterministically. | No current slate-yjs compatibility claim. Define deterministic child-root create/delete/move/copy payload before collab close. | slate-yjs single shared-root binding, origin grouping, stored-position caveats, and deterministic initial-state helper rows. | closed as gated |
| React runtime authors | Child roots can cause broad rerenders or effect-owned editor writes. | Root-scoped external-store selectors plus event/transaction-owned writes only. | `useSlateViewState`/`isRootAffected`, React `useSyncExternalStore`, and React effect skill lens. | closed |
| External editor comparison | ProseMirror/Lexical/Tiptap offer node views, decorators, commands, and chain DX. | Steal explicit boundary and stable identity; reject their product-shaped public models for raw Slate. | Pass 5 source rows across ProseMirror, Lexical, and Tiptap. | closed |

Revision pass:
- Public helper target is `useSlateChildRoot(element, slot = 'default')`.
- Root lifecycle must be represented in core operation payloads or transaction
  metadata, not hidden in React effects.
- Browser behavior proof is deferred because this plan does not implement
  child roots.
- Issue accounting stays conservative: related/planned/guardrail only, no new
  `Fixes` or `Improves` claim.
- Scorecard is closure-scored for planning quality, not implementation proof.

Hard cuts and rejected alternatives:
| Option / API | Keep / cut / reject | Why | Migration cost | Evidence | Follow-up |
|--------------|---------------------|-----|----------------|----------|-----------|
| Nested independent editor as canonical editable-void rich-content example | reject | Duplicates runtime/history/collab/serialization and hides multi-root support. | Existing example rewrite. | Current nested editor at `.tmp/slate-v2/site/examples/ts/editable-voids.tsx:147`. | Keep regression interop row. |
| Rich child content as `element.children` under a void | reject | Void semantics and child rich descendants fight parent selection/delete/normalization. | Avoided by root model. | `editable-island` is still a void kind. | Need proof rows. |
| Path-derived child root ids | reject | Paths move under editing/collab. | Need stable id/slot primitive. | Runtime id APIs exist, but exact child-root API is gap. | Provisional public helper is `useSlateChildRoot(element, slot)`. |
| Automatic child root for every island | reject | Most islands are native controls; roots cost lifecycle and serialization work. | Apps opt into child roots. | Current native controls need no root. | Keep helper opt-in. |
| Fat `renderVoid` props | reject | Violates content-only contract and render performance model. | Use hooks/context. | Surface contract cited above. | Keep tests. |

Plan deltas from review:
- Migrated the active plan into the `slate-plan` template shape after generating
  `docs/plans/2026-05-24-slate-v2-editable-islands-multi-root.md`.
- Preserved the canonical goal plan path
  `docs/plans/2026-05-24-slate-v2-editable-islands-multi-root-ralplan.md`.
- Revised lane state from an execution-looking `ready-for-ralph` note to a
  pending Slate Plan lane.
- Lowered initial confidence from 0.86 to 0.81 because closure requires
  ecosystem synthesis, ledger proof, pass closure, objection handling, and final
  gates.
- Completed related issue discovery without broad live GitHub discovery; reused
  durable ledgers and added the missing `#5212` row.
- Kept `#5212` conservative: related/planned example candidate only, no
  `Fixes`/`Improves` claim until implementation and proof.

Open questions and decision-changing evidence:
| Question | Why it matters | Evidence needed | Owner | Status |
|----------|----------------|-----------------|-------|--------|
| What is the public helper name? | Naming decides DX and migration story. | API pressure from existing root hooks, Plate, Tiptap/ProseMirror/Lexical comparison. | slate-plan | provisional target: `useSlateChildRoot(element, slot)`; maintainer objection pass can still rename |
| Are child roots serialized inside parent fragment payloads by default? | Clipboard/collab semantics depend on this. | Clipboard issue ledger, current serializer source, ecosystem comparison. | execution | deferred gate: define explicit payload policy before implementation claim |
| How are child roots keyed across copy/paste and collab? | Runtime id plus slot may not be sufficient across duplicated islands. | Core operation/root identity source review and slate-yjs pressure pass. | execution | deferred gate: duplicated islands need deterministic root id remap policy |
| Does #5212 become an improved/fixed claim after example rewrite? | Related discovery moved it into the plan, but current evidence is docs/example-only and no implementation proof exists. | Example rewrite and browser/example proof. | execution/final sync | deferred gate: remains related/planned until proof exists |

Implementation phases with owners:
| Phase | Owner | Scope | Entry criteria | Exit criteria | Verification |
|-------|-------|-------|----------------|---------------|--------------|
| API naming and runtime substrate | future execution | Child-root primitive and lifecycle. | Closed plan accepted by user. | Unit contracts pass. | `.tmp/slate-v2` package tests |
| Example rewrite | future execution | Canonical editable island example with native controls, state fields, child root. | API substrate available. | Example usable and source docs updated. | Playwright focused rows |
| Regression proof | future execution | Existing nested-editor/internal-control rows plus new child-root rows. | Example compiled. | Focus/selection/history/clipboard/delete/move rows pass. | Playwright Chromium/mobile/Firefox as applicable |
| Ledger/reference sync | future execution or final planning | Update fixed/improved/related claims conservatively. | Proof results known. | PR reference and ledgers current. | text checks and closure check |

Fast driver gates:
| Gate | Cwd | Command / artifact | Proves | Status |
|------|-----|--------------------|--------|--------|
| template scratchpad creation | plate-2 | `node .agents/rules/goal/scripts/create-goal-scratchpad.mjs --template slate-plan --title "Slate v2 editable islands multi-root"` | A fresh `slate-plan` shell was generated and used for migration. | complete |
| current source read | plate-2 | `nl -ba .tmp/slate-v2/site/examples/ts/editable-voids.tsx \| sed -n '1,230p'` | Current editable-voids example shape. | complete |
| current multi-root source read | plate-2 | `nl -ba .tmp/slate-v2/site/examples/ts/multi-root-document.tsx \| sed -n '1,380p'` | Current root/state-field example shape. | complete |
| render contract read | plate-2 | `nl -ba .tmp/slate-v2/packages/slate-react/test/surface-contract.tsx \| sed -n '880,990p'` | `renderVoid` content-only contract. | complete |
| issue-ledger pass | plate-2 | `rg`/`sed` reads across `docs/slate-issues/**`, `docs/slate-v2/ledgers/**`, plus ledger updates in this plan and the issue matrices | Full issue corpus accounting for editable islands and void-boundary pressure. | complete |
| intent/boundary decision pass | plate-2 | `nl -ba .tmp/slate-v2/packages/slate/src/interfaces/editor.ts \| sed -n '80,108p;470,486p;1740,1752p'`; `nl -ba .tmp/slate-v2/packages/slate/src/core/public-state.ts \| sed -n '536,595p;1428,1450p;3418,3452p'`; `nl -ba .tmp/slate-v2/packages/slate-react/src/hooks/use-slate-runtime.tsx \| sed -n '630,748p'`; `nl -ba .tmp/slate-v2/packages/slate-react/test/surface-contract.tsx \| sed -n '919,964p'` | Roots are keyed records, root dirtiness metadata exists, root-scoped view subscriptions exist, and `renderVoid` stays content-only. | complete |
| research/ecosystem source refresh | plate-2 plus local sibling repos | focused `nl`/`rg` reads in `../react`, `../prosemirror`, `../lexical`, `../tiptap`, `../slate-yjs`, `packages/core`, `packages/media`, and `packages/yjs` | External systems support explicit boundary, selector, transaction/update, plugin wrapper, and deterministic-collab pressure; none justify a fat raw Slate renderer API. | complete |
| pressure-pass bundle | plate-2 plus `.tmp/slate-v2` source reads | skill-lens reads plus focused source reads in Slate v2 operation, transaction, snapshot, root-view, selector, Slate provider, and root contract tests | Performance, DX, migration, regression, research, and simplicity pressure applied; provisional API helper selected; unresolved behavior proof stays gated. | complete |
| Slate v2 behavior check | .tmp/slate-v2 | focused package/browser commands after implementation accepted | Child-root behavior. | deferred to execution; N/A for planning closure |
| goal closure check | plate-2 | `node .agents/rules/goal/scripts/check-complete.mjs docs/plans/2026-05-24-slate-v2-editable-islands-multi-root-ralplan.md` | Plan closure. | complete |

Final user-review handoff:
- recommended architecture: keep `editable-island` as an atomic parent-flow
  void shell; add opt-in same-runtime child roots for rich island content.
- public API target: `useSlateChildRoot(element, slot = 'default')` returns the
  root target for `<Editable root={childRoot} />`.
- scalar metadata: document-owned scalar fields use state fields; ephemeral app
  UI can stay local React state.
- render contract: keep `renderVoid` content-only. No path/actions/focus/child
  prop bag.
- runtime rule: child-root lifecycle must be core operation payload or
  transaction metadata, not React effect-owned derived state.
- performance rule: no root for native controls, O(1) root/slot lookup, no
  every-root/every-island commit scans.
- migration rule: nested independent editors stay as interop/regression proof,
  not canonical rich editable-island DX.
- collab rule: no slate-yjs/current-collab claim until deterministic child-root
  create/delete/move/copy payload and replay policy is proven.
- issue accounting: `#5212` is related/planned example work only; no new
  `Fixes` or `Improves` line is legal before implementation and browser proof.

Findings:
- Live `.tmp/slate-v2` source already has an `editable-island` void kind and
  multi-root root view machinery.
- The canonical editable-voids example still embeds an independent nested
  `RichTextEditor` for rich content.
- Durable issue ledgers already covered the island/nested-editor surface but
  missed direct `#5212` example-accuracy accounting before Pass 2.

Timeline:
- 2026-05-24: created/recreated active goal for the Slate Plan lane after goal
  tool state returned no active goal.
- 2026-05-24: generated `docs/plans/2026-05-24-slate-v2-editable-islands-multi-root.md`
  from the `slate-plan` template.
- 2026-05-24: migrated existing evidence into canonical plan path
  `docs/plans/2026-05-24-slate-v2-editable-islands-multi-root-ralplan.md`.
- 2026-05-24: completed Pass 1 current-state read, Pass 2 related issue
  discovery, Pass 3 full issue-ledger pass, and Pass 4 intent/boundary and
  decision brief.
- 2026-05-24: completed Pass 5 research/ecosystem/live-source refresh from
  focused React, ProseMirror, Lexical, Tiptap, Plate, and slate-yjs source
  reads; next pass is the performance/DX/migration/regression/research/
  simplicity pressure-pass bundle.
- 2026-05-24: completed Pass 6 pressure-pass bundle with implementation-skill
  lenses and focused Slate v2 root-operation/snapshot/selector source reads;
  next pass is the Slate maintainer objection ledger.

Decisions and tradeoffs:
- Keep `editable-island` as raw Slate substrate, not a Plate form abstraction.
- Add a same-runtime child-root primitive for rich island content; do not make
  nested independent editors the canonical rich-content example.
- Keep `renderVoid` content-only despite convenience pressure, because current
  surface tests deliberately reject path/action/focus prop bags.
- Treat `#5212` as related/planned example candidate only until implementation
  and proof justify a stronger claim.
- Keep the root ordering question out of this lane: child-root display order
  follows parent island position, while root values remain keyed records unless
  a separate multi-root model plan changes that contract.
- Keep child-root implementation scope primitive: Slate owns lifecycle,
  identity, root views, and DOM/runtime boundaries; Plate/app code owns product
  widgets and form UX.

Review fixes:
- User correction accepted: the active plan should start from the `slate-plan`
  template and migrate existing evidence into it rather than retrofitting a
  short Ralplan note.
- Extra generated scratchpad is a temporary template source and should not be
  the durable plan of record.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|------:|---------------------|------------|
| Retrofitted plan before template-first migration | 1 | Generate `slate-plan` scratchpad and migrate evidence into canonical plan. | resolved in this file |

Verification evidence:
- Template source: `docs/plans/2026-05-24-slate-v2-editable-islands-multi-root.md`
  was generated by `create-goal-scratchpad.mjs --template slate-plan`.
- Canonical plan path: `docs/plans/2026-05-24-slate-v2-editable-islands-multi-root-ralplan.md`
  now records the template sections, pass table, scorecard, issue accounting,
  source facts, and closure gates.
- Pass 2 ledger updates: `docs/slate-issues/gitcrawl-v2-sync-ledger.md`,
  `docs/slate-v2/ledgers/fork-issue-dossier.md`, and
  `docs/slate-v2/ledgers/issue-coverage-matrix.md` include `#5212` as
  related/planned example candidate with no fixed/improved claim.
- Pass 3 ledger updates: the same three ledgers include conservative buckets
  for model-shape, mobile inline-void, clipboard, drop/drag,
  void-delete/selection, spacer/cursor/insert-break, and external-focus
  pressure, still with no fixed/improved claim.
- Pass 4 decision evidence: live `.tmp/slate-v2` reads confirmed keyed root
  values in `interfaces/editor.ts:89`, root change metadata in
  `interfaces/editor.ts:1748`, root dirtiness handling in
  `core/public-state.ts:3426`, root-scoped selectors/views in
  `use-slate-runtime.tsx:639` and `:712`, and content-only `renderVoid` in
  `surface-contract.tsx:956`.
- Pass 5 ecosystem evidence: local source reads confirmed React external-store
  selector pressure, ProseMirror NodeView/transaction boundary discipline,
  Lexical DecoratorNode/state/update discipline, Tiptap command/node-view DX,
  Plate plugin/wrapper ownership, and slate-yjs shared-root/origin/determinism
  pressure. Conclusion: child roots stay the right raw Slate primitive; collab
  payload/replay policy is the main unresolved architecture gate.
- Pass 6 pressure evidence: implementation-skill reads and live Slate v2 source
  reads confirmed the plan needs O(1) child-root lookup, no roots for native
  controls, no broad root fanout, lifecycle operations/metadata rather than
  hidden React effects, vertical TDD proof, primitive-only raw Slate UI, and a
  provisional `useSlateChildRoot(element, slot)` helper.
- Closure evidence: maintainer objections, high-risk pre-mortem, ecosystem
  maintainer pass, revision pass, issue sync accounting, scorecard, and final
  handoff are complete for planning. Implementation/browser proof is explicitly
  deferred to a later accepted execution lane.
- Goal checker evidence: `node .agents/rules/goal/scripts/check-complete.mjs docs/plans/2026-05-24-slate-v2-editable-islands-multi-root-ralplan.md`
  passed on 2026-05-24.

Reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |
|-------------|-------------------|-------------------|---------------|------------|
| Plan closure complete, implementation not started. | User review, then explicit execution invocation if accepted. | Close the editable-islands multi-root Slate Plan for user review, not implementation. | Same-runtime child roots are still the right target; root ordering must not be smuggled into this lane; Slate owns substrate and Plate/app owns product widgets; collab/root payload replay is the dangerous unresolved part; the provisional public helper is `useSlateChildRoot(element, slot)`. | Recreated active goal, generated template shell, migrated evidence, preserved pass state, added `#5212`, expanded issue-ledger accounting, finalized intent/boundary, completed ecosystem synthesis, pressure passes, maintainer objections, high-risk plan, ecosystem maintainer pass, revision, issue sync, score, and handoff. |

Open risks:
- Child-root API naming may still be wrong after ecosystem pressure.
- Child-root serialization and collaboration ordering are unresolved.
- No implementation/browser proof exists yet for child roots inside islands.
- The expanded issue family may make the plan look larger than the actual
  implementation slice; keep execution scoped to child-root architecture and
  proof gates.
- Root ordering pressure can derail the lane; keep this plan to child-root
  identity/lifecycle and handle top-level ordered roots separately if needed.

Final completion gates:
- final_handoff_status: complete
- final_handoff: emitted in this plan
- next_pass: none
- next_action: user review, then explicit execution invocation if accepted
- final_score: 0.925
- browser_proof: N/A for planning-only closeout; required before behavior or
  issue-fix claims in execution
- issue_claim_sync: complete; no new fixed/improved claims
