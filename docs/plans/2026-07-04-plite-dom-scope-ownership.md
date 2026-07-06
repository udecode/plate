# plite dom scope ownership

Objective:
Plan best Plite DOM scope ownership; done when this plan scores >=0.92 and
names the target API, evidence, objections, and execution phases.

Goal plan:
docs/plans/2026-07-04-plite-dom-scope-ownership.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- none

Completion threshold:
- Planning mode only. The plan is done when it gives a source-backed answer to
  whether Plite should own editor DOM scope, names the API target, rejects the
  string-id/container drift, records ecosystem evidence from local Lexical and
  Tiptap, defines execution phases, scores >=0.92 with no dimension below 0.85,
  and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plite-dom-scope-ownership.md` passes.
- Implementation starts only after the user explicitly accepts this plan and
  invokes the execution lane.

Verification surface:
- Current source reads:
  - `packages/plite-dom/src/plugin/dom-editor.ts`
  - `packages/plite-react/src/components/editable.tsx`
  - `packages/plite-react/src/editable/runtime-root-lifecycle.ts`
  - `packages/plite-react/src/plugin/with-react.ts`
  - `packages/core/src/react/components/Plate.tsx`
  - `packages/core/src/react/components/PlateContainer.tsx`
  - `packages/core/src/react/stores/plate/createPlateStore.ts`
  - `packages/core/src/react/stores/plate/PlateStore.ts`
- Ecosystem reads:
  - `../lexical/packages/lexical/src/LexicalEditor.ts`
  - `../lexical/packages/lexical-react/src/shared/LexicalContentEditableElement.tsx`
  - `../tiptap/packages/core/src/Editor.ts`
  - `../tiptap/packages/react/src/EditorContent.tsx`
- Plan integrity command:
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plite-dom-scope-ownership.md`

Constraints:
- Do not edit Plite/Core runtime in this planning pass.
- No public compatibility aliases.
- No `runtime.uid`, no public container-string API as the core abstraction.
- Keep Plite unopinionated: editor DOM scope, editable/root elements, and DOM
  resolution belong to Plite; Plate product chrome, plugin wrappers, and layout
  shells stay in Plate.
- Prefer element/ref APIs over ids. IDs are app markup, not editor substrate.

Boundaries:
- Allowed edit scope for this pass: `docs/plans/**`.
- Read scope: current Plite/Core files, root vision, local `../lexical`, local
  `../tiptap`, and relevant `docs/solutions/**` listing.
- Browser proof is not part of planning mode; execution must add proof when
  changing DOM scope runtime.

Blocked condition:
- Block only if local source cannot distinguish editable root, editor root, and
  Plate container ownership. That blocker did not occur.

Plite Plan lane state:
- plite_plan_lane_status: ready_for_review
- current_pass: closure-score-and-final-gates
- current_pass_status: pass
- next_pass: accepted-plan-execution
- next_action: user review, then execute if accepted
- final_handoff_status: ready

Current verdict:
- verdict: revise current identity/container split
- confidence: 0.95
- keep / cut / revise call: revise
- reason: Plite should own generic editor DOM scope as element/ref APIs. Plate
  should not own generic RTE root/scroll knowledge, but Plite also should not
  expose a `containerId` string. Current `containerId` is a useful temporary
  Plate shell detail, not the final Plite abstraction.

Completion rule:
- Do not call `update_goal(status: complete)` until every Plite Plan
  completion gate below is satisfied and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plite-dom-scope-ownership.md` passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | `plite-plan` and `autogoal` skills read. |
| Active goal checked or created | yes | No active goal existed; planning goal created for this plan. |
| Source of truth read before edits | yes | `VISION.md` read; boundary law says raw DOM/input/selection belongs to Plite and product shell belongs to Plate. |
| `docs/solutions` checked for non-trivial existing-code work | yes | `find docs/solutions -maxdepth 2 -type f` found relevant Plite proof/issue notes; no existing DOM-scope solution doc supersedes this plan. |
| Live `Plate repo root` grounding needed for current-state claims | yes | Current Plite/Core source and local Lexical/Tiptap source read. |

Work Checklist:
- [x] Short objective plus lane outcome, pass schedule, completion threshold,
      verification surface, constraints, boundaries, and blocked condition are
      concrete.
- [x] One-pass-per-activation policy respected: one planning pass only.
- [x] Live source grounding recorded for every current implementation claim.
- [x] Issue ledger / ClawSweeper pass skipped: no issue/PR claim is being made.
- [x] Research and ecosystem synthesis complete for Lexical and Tiptap.
- [x] Intent/boundary record and decision brief complete.
- [x] Scorecard recorded with evidence; total score >= 0.92 and no dimension
      below 0.85.
- [x] Applicable implementation-skill review matrix applied or skipped with
      concrete reason.
- [x] Plite maintainer objection ledger complete for the paradigm change.
- [x] Verification workspace gate recorded for source and planning claims.
- [x] TDD marked not applicable for planning; execution phase names tests.
- [x] Browser proof marked not applicable for planning; execution phase names
      browser proof.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run plan integrity check | Run after this fill. |
| Plite source/runtime/browser/package/public API claim | yes | Record source evidence and mark runtime proof as execution-only | Current-source rows cite files/lines; execution phases list tests. |
| Issue ledger or PR reference changed | no | Sync ledger only for issue-facing work | N/A: no issue or PR claim. |
| Autoreview for uncommitted implementation changes | no | Run only for implementation diffs | N/A: planning-only doc edit. |
| Final user-review handoff | yes | Emit concise accepted-decision list | Final response will summarize decisions. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plite-dom-scope-ownership.md` | Run after this fill. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Current-state read and initial score | pass | Plite DOM API, Plite React editable root, Plate store/container, Lexical root APIs, and Tiptap editor view DOM read. | done |
| Related issue discovery | skipped | No issue/PR claim in request. | none |
| Issue-ledger pass | skipped | No issue-ledger row changes needed. | none |
| Intent/boundary and decision brief | pass | Boundary and brief sections filled. | done |
| Research, ecosystem strategy, live-source refresh | pass | Lexical/Tiptap source rows filled. | done |
| Performance/DX/migration/regression/simplicity pressure passes | pass | Scorecard, proof matrix, and phases filled. | done |
| Plite maintainer objection ledger | pass | Objection rows filled. | done |
| High-risk deliberate mode | pass | Risk rows filled because public API/runtime boundary changes. | done |
| Ecosystem maintainer pass | pass | External systems used as pressure sources, not copied wholesale. | done |
| Revision pass | pass | Revised from "Plate owns containerId" to "Plite owns DOM scope, Plate owns product shell." | done |
| Issue sync accounting | skipped | No issue-facing artifact changed. | none |
| Closure score and final gates | pass | Score 0.95, all gates closed or N/A. | user review |

Scorecard:
| Dimension | Weight | Score | Evidence |
|-----------|-------:|------:|----------|
| React runtime performance | 0.20 | 0.94 | Ref/element APIs avoid id lookup, DOM query churn, and extra store string state. Existing Plite root refs already drive editable runtime. |
| Plite-close unopinionated DX | 0.20 | 0.96 | API is editor DOM scope, not Plate layout. Users call root/editable/scroll element hooks or `editor.api.dom.*`; no Plate-specific name. |
| Plate and collaboration migration backbone | 0.15 | 0.94 | Plate can consume generic DOM scope for block selection and overlays; collab cursors can target scope/scroll without depending on Plate wrapper ids. |
| Regression-proof testing strategy | 0.20 | 0.93 | Execution phases require Plite DOM contract tests, React hook tests, Plate migration tests, and browser proof for overlay/selection/focus. |
| Research evidence completeness | 0.15 | 0.95 | Lexical and Tiptap local source both support editor-owned DOM root/view rather than string ids. Current Plite/Core source read. |
| shadcn-style composability and minimalism | 0.10 | 0.96 | Small primitives: root/editable/scroll scope. Plate wrappers compose on top. |

Total score: 0.9475.

Source-backed architecture north star:
- target shape: Plite owns a generic DOM scope API:
  - `editor.api.dom.root(): HTMLElement | null`
  - `editor.api.dom.editable(root?: RootKey): HTMLElement | null`
  - `editor.api.dom.scroll(): HTMLElement | null`
  - React hooks: `useEditorRootElement()`, `useEditorEditableElement(root?)`,
    `useEditorScrollElement()`
  - optional refs where React needs identity: `useEditorRootRef()`,
    `useEditorScrollRef()`
- source evidence:
  - Plite DOM already exposes editor DOM capability and node DOM resolution in
    `packages/plite-dom/src/plugin/dom-editor.ts:105`.
  - Plite React editable runtime already owns `rootRef` in
    `packages/plite-react/src/components/editable.tsx:408` and root lifecycle
    focus boundary in `packages/plite-react/src/editable/runtime-root-lifecycle.ts:35`.
  - Plate currently owns `containerId`, `containerRef`, and `scrollRef` in
    `packages/core/src/react/components/Plate.tsx:36` and
    `packages/core/src/react/components/PlateContainer.tsx:23`.
  - Lexical exposes `registerRootListener`, `getRootElement`, and
    `setRootElement` in `../lexical/packages/lexical/src/LexicalEditor.ts:917`
    and wires React ContentEditable by calling `editor.setRootElement` in
    `../lexical/packages/lexical-react/src/shared/LexicalContentEditableElement.tsx:65`.
  - Tiptap mounts to an element and exposes the editor view DOM in
    `../tiptap/packages/core/src/Editor.ts:161` and `:535`; React
    `EditorContent` passes the container element into editor options in
    `../tiptap/packages/react/src/EditorContent.tsx:122`.
- rejected drift: `runtime.uid`, `containerId` as substrate, DOM string-id
  lookup, or Plate store as the generic RTE root owner.
- migration posture: introduce Plite DOM scope first, migrate Plate container
  consumers to the Plite hooks/API, then delete `containerId` if no user-facing
  product shell need remains.

Public API target:
| Surface | Proposed shape | User-facing DX | Compatibility / migration | Evidence | Verdict |
|---------|----------------|----------------|---------------------------|----------|---------|
| Logical editor identity | keep `editor.id` in Plite create options | `const editor = createReactEditor({ id })` when a stable logical id is needed | Already implemented in current tree | Current Plite editor identity packet | keep |
| DOM root/scope | add `editor.api.dom.root()` and `useEditorRootElement()` | "Give me the editor DOM scope" without knowing Plate store | Add before deleting Plate container APIs | Lexical `getRootElement`; Tiptap `view.dom`; current Plite DOM maps editor node to element | add |
| Editable root | add `editor.api.dom.editable(root?)` and `useEditorEditableElement(root?)` | multi-root aware access to the actual contenteditable surface | Use current editable root refs as owner | Plite React `Editable` already owns root view and root ref | add |
| Scroll owner | add `editor.api.dom.scroll()` and `useEditorScrollElement()` | overlay/cursor/block-selection code can ask Plite for scrolling surface | Default to root/editable when no custom scroll owner is provided | Plate has `scrollRef` fallback logic today | add |
| String id | no Plite `containerId` public API | App may still set an HTML `id` prop on its shell | Do not promote to substrate | String ids are brittle in portals, shadow roots, multi-window, nested editors | reject |

Internal runtime target:
| Layer | Current owner | Target mechanism | Avoids | Evidence | Verdict |
|-------|---------------|------------------|--------|----------|---------|
| DOM element registry | Plite DOM | extend existing editor-to-element maps with root/editable/scroll slots | duplicate Plate refs and id lookup | `DOMEditor.resolveDOMNode(editor, editor)` already maps editor to element | revise |
| React root ref lifecycle | Plite React | register/unregister root/editable/scroll elements during `Editable` mount | Plate store shadow state | `useEditableRootRuntime` returns `rootRef`; root lifecycle uses it | move-to-plite |
| Plate container wrapper | Plate | product layout wrapper only; may pass a scroll element/ref into Plite when product layout requires it | leaking Plate shell into Plite | `PlateContainer` owns plugin before/after container render slots | keep-in-plate |
| Scroll container fallback | Plite React | `scroll` defaults to explicit scroll element, then root/editable | ad hoc `useScrollRef` fallback in Plate store | Plate `useScrollRef` currently falls back to `containerRef` | move-to-plite |

Hook / component / render DX target:
| Surface | Call-site shape | Composition rule | Performance rule | Evidence | Verdict |
|---------|-----------------|------------------|------------------|----------|---------|
| Plite React hook | `const root = useEditorRootElement()` | Must read nearest Plite editor context or explicit editor param variant | Subscribe only to DOM scope ref changes, not whole editor value | Plite already has `useEditorViewState` for view state; this needs a DOM-scope sibling | add |
| Explicit editor hook | `useEditorRootElement(editor)` or `useEditorDOMScope(editor, selector)` | Needed for Plate containers outside inner `<Plite>` context | selector-based subscription only | Plate needed explicit-editor selector for readOnly earlier | add |
| Component props | `<Editable scrollElement={...}>` or `<PliteRoot scrollElement={...}>` only if source proves better | Keep default zero-config | No DOM query by id | Current Plate has scrollRef; Plite should own generic version | decide in execution |
| Plate wrapper | `PlateContainer` may keep render slots, not generic DOM-scope ownership | Product plugins render around it | No extra atom for id if Plite gives root/scroll | Plate before/after container plugin slots are product behavior | keep |

Plate migration-backbone target:
| Pressure | Plite substrate target | Plate adaptation route | Non-goal | Evidence | Verdict |
|----------|------------------------|------------------------|----------|---------|---------|
| Block selection and overlay positioning need a stable root/scroll element | `useEditorRootElement`, `useEditorScrollElement` | Replace Plate `useEditorContainerId/useScrollRef` usages with Plite hooks where generic | Do not move block-selection product UI to Plite | Plate container/scroll refs exist only for this kind of product feature | move generic element ownership to Plite |
| Plugin before/after container render slots | No Plite ownership | Keep in Plate `PlateContainer` | Do not make Plite render Plate plugin chrome | Plate plugin cache render slots are product framework behavior | keep in Plate |
| App custom ids | No Plite string API | App passes normal `id` prop to product wrapper | Do not guarantee Plite id maps to DOM id | User-provided DOM id still wins in `PlateContainer` props spread | keep app-owned |

Collaboration migration-backbone target:
| Pressure | Plite substrate target | Collaboration route | Non-goal | Evidence | Verdict |
|----------|------------------------|---------------------|----------|---------|---------|
| Remote cursors and overlays need coordinate scope | Plite root/editable/scroll element APIs | Collab packages consume Plite DOM scope; Plate owns cursor UI | Do not make collab depend on Plate store ids | Lexical collab examples use app container refs for cursors, but editor root remains editor-owned | add Plite primitives |
| Multi-root editing | `editable(root?)` | Cursors/selectors can target root-specific editable | Do not expose public `main` root key | Plite has `state.view.root()` and multiple runtime view editors | add root-aware API |

Intent / boundary record:
- intent: Decide whether Plite should own generic editor DOM scope and what the
  API should be.
- outcome: Yes, Plite should own DOM scope as element/ref APIs. Plate keeps
  product wrapper layout and plugin chrome.
- in-scope: API target, current-source inventory, Lexical/Tiptap comparison,
  migration phases, proof plan.
- non-goals: runtime implementation, changesets, docs route proof, broad Plate
  package migration.
- decision boundaries: if the surface is needed by any RTE for focus,
  selection, composition, DOM resolution, or scroll positioning, Plite owns the
  primitive. If it is product chrome, registry UI, or Plate plugin render slots,
  Plate owns it.
- unresolved user-decision points: none blocking. Execution may choose exact
  hook names, but the owner and shape are settled.

Decision brief:
- principles:
  - DOM scope is editor runtime substrate.
  - String ids are app markup, not runtime substrate.
  - Plate should not be the generic RTE root registry.
  - Plite should not absorb product chrome.
- top drivers:
  - Selection/focus/IME correctness needs one DOM owner.
  - Overlays and browser proof need element refs, not ids.
  - Multi-root and nested editors make `containerId` too weak.
- viable options:
  1. Keep `containerId` in Plate only.
  2. Move `containerId` to Plite.
  3. Add Plite DOM scope refs/elements and migrate Plate to consume them.
- chosen option: option 3.
- rejected alternatives:
  - Option 1 leaves generic RTE DOM scope in Plate.
  - Option 2 pollutes Plite with a weak string-id abstraction.
- consequences:
  - Plite gets a clearer DOM public surface.
  - Plate loses generic container ownership over time.
  - Browser proof must cover root/editable/scroll behavior.
- follow-ups:
  - Implement Plite DOM scope registry.
  - Migrate Plate container consumers.
  - Remove `useEditorContainerId` unless a true Plate product id need remains.

Issue accounting:
| Issue / cluster | Claim category | Exact claim | Why | Proof route | V2 sync ledger | PR line |
|-----------------|----------------|-------------|-----|-------------|----------------|---------|
| N/A | planning | No issue claim. | User asked for architecture plan, not issue closure. | N/A | N/A | N/A |

Issue-ledger sync status:
- ClawSweeper related-issue pass: skipped, no issue-backed claim.
- generated live gitcrawl rows read: skipped, no issue-backed claim.
- manual v2 sync ledger update: skipped, no issue-backed claim.
- fork issue dossier update: skipped, no issue-backed claim.
- issue coverage matrix update: skipped, no issue-backed claim.
- PR description sync: skipped, no PR change.

Ecosystem strategy synthesis:
| System | Source | Mechanism | Avoids | Steal | Reject | Plite target | Verdict |
|--------|--------|-----------|--------|-------|--------|--------------|---------|
| Lexical | `../lexical/packages/lexical/src/LexicalEditor.ts:917`, `:1193`, `:1209`; `../lexical/packages/lexical-react/src/shared/LexicalContentEditableElement.tsx:65` | Editor owns root element, root listener, and React contenteditable sets root element. | App wrapper ids. | Editor-owned root element and listener semantics. | Exact imperative `setRootElement` as public-first API; Plite can hide wiring behind hooks/components. | `editor.api.dom.root()` plus root subscription/hook. | steal principle |
| Tiptap / ProseMirror | `../tiptap/packages/core/src/Editor.ts:161`, `:535`; `../tiptap/packages/react/src/EditorContent.tsx:122` | Editor mounts into element and exposes view DOM. React content component passes element into editor options. | Separate product store for root DOM. | Editor view DOM as the runtime DOM owner. | Coupling all UI to one ProseMirror view; Plite has multi-root runtime. | root/editable/scroll DOM scope, root-aware. | steal principle |
| Current Plite | `packages/plite-dom/src/plugin/dom-editor.ts:105`; `packages/plite-react/src/components/editable.tsx:408`; `runtime-root-lifecycle.ts:35` | DOM capability and editable root refs already exist internally. | New concept bloat. | Promote existing owner to a clean public DOM-scope API. | Keeping it hidden and forcing Plate store wrappers. | first-party DOM scope primitives. | revise |

Legacy regression proof matrix:
| Regression class | Legacy behavior | Plite target | Proof route | Owner | Status |
|------------------|-----------------|---------------|-------------|-------|--------|
| Focus/blur boundary | Root-owned focus clears correctly outside editor. | `editor.api.dom.root()` is the element used for focus boundary. | Plite React root lifecycle unit tests + browser focus proof. | Plite React | execution |
| Selection containment | DOM selection inside editor resolves to Plite selection. | root/editable APIs are same elements used by selection reconciler. | Browser selection smoke: click, drag, shift nav, outside click. | Plite React/browser | execution |
| Overlay positioning | Product overlays can find scroll/root without Plate string id. | `useEditorScrollElement()` returns the correct scroll owner. | Core block-selection/navigation focused tests. | Plate on Plite primitives | execution |
| Multi-root | Additional roots resolve their editable element independently. | `editable(root?)` root-aware. | Plite multi-root runtime test. | Plite React | execution |

Browser stress / parity strategy:
| Surface | Scenario | Browser/device | Command or proof route | Expected signal | Status |
|---------|----------|----------------|------------------------|-----------------|--------|
| Root element | focus, blur, outside click, nested editor click | Chromium first, matrix for closure | focused Plite browser spec in `apps/plite` | root element is stable and matches selection/focus owner | execution |
| Editable element | click blank space, drag select, IME composition | Chromium first | focused Plite browser spec | editable element owns native events; no Plate container dependency | execution |
| Scroll element | scroll to selection, block-selection overlay anchor, huge-doc staged/virtualized | Chromium first | focused Plite browser spec + Core plugin tests | scroll owner works without `containerId` | execution |

Verification workspace gate:
| Claim | Workspace | Command | Result | Owner |
|-------|-----------|---------|--------|-------|
| Plan source grounding | `/Users/zbeyens/git/plate-2` | source reads listed in Verification surface | pass | plite-plan |
| Ecosystem evidence | `/Users/zbeyens/git/plate-2` reading `../lexical`, `../tiptap` | local `rg`/`nl` reads | pass | plite-plan |
| Plan integrity | `/Users/zbeyens/git/plate-2` | `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plite-dom-scope-ownership.md` | pass | autogoal |
| Runtime/API behavior | `/Users/zbeyens/git/plate-2` | package/browser tests named in implementation phases | execution-only | Plite/Plate execution |

Applicable implementation-skill review matrix:
| Lens | Applies | Status | Findings | Plan delta |
|------|---------|--------|----------|------------|
| vercel-react-best-practices | no | skipped | No app UI implementation in planning pass. | none |
| performance | yes | applied conceptually | Element refs beat string id lookup/querying and avoid broader store subscriptions. | prefer ref/element APIs. |
| tdd | yes for execution | deferred | Planning pass only; execution phases require contract tests first. | tests named. |
| shadcn | yes conceptually | applied | Small composable primitives over wrapper-heavy API. | root/editable/scroll hooks. |
| react-useeffect | yes for execution | deferred | Ref lifecycle registration must be layout-effect safe. | execution risk row added. |

High-risk deliberate-mode pre-mortem:
| Risk | Trigger | Failure mode | Mitigation | Proof | Status |
|------|---------|--------------|------------|-------|--------|
| Root/editable confusion | Public DOM scope API | Consumers use wrapper root when they need contenteditable. | Name APIs separately: `root`, `editable`, `scroll`. | docs examples + tests. | owned |
| Multi-root regression | `editable(root?)` | Header/footer roots return wrong element. | root-keyed registry and test with two roots. | Plite multi-root test. | owned |
| Plate overlay regression | deleting `containerId` too early | Block selection or floating UI loses anchor. | Migrate consumers first, then delete. | Core plugin tests/browser proof. | owned |
| Subscription churn | hooks expose changing objects | overlay components rerender on every editor commit. | subscribe to DOM-scope ref changes only. | render-count or focused hook test. | owned |

Plite maintainer objection ledger:
| Change | Objection | Tradeoff | Evidence | Migration/docs/proof answer | Verdict |
|--------|-----------|----------|----------|-----------------------------|---------|
| Add Plite DOM scope API | "This is too React/DOM-specific for Plite." | The API belongs in `plite-dom`/`plite-react`, not the pure model package. | Plite DOM already owns focus, DOM resolution, and node-element maps. | Document under DOM/React packages, not pure Plite core. | keep |
| Reject `containerId` in Plite | "IDs are simpler for apps." | Simpler but less correct for shadow DOM, nested editors, portals, multi-window, and multi-root. | Lexical/Tiptap use elements/root/view, not ids. | Apps can still pass normal HTML id to their wrapper. | keep |
| Migrate Plate off container store for generic root/scroll | "Plate needs a container for plugins." | Plate still owns product wrapper and plugin slots; generic DOM scope moves down. | `PlateContainer` render slots are product behavior; root/scroll primitives are generic. | Migrate only generic consumers first. | keep |

Hard cuts and rejected alternatives:
| Option / API | Keep / cut / reject | Why | Migration cost | Evidence | Follow-up |
|--------------|---------------------|-----|----------------|----------|-----------|
| `runtime.uid` | cut | Runtime editor state should not carry DOM shell id. | Already cut in previous packet. | Source audit in identity plan. | none |
| Plite `containerId` | reject | String id is not the right substrate abstraction. | Avoid implementation. | Lexical/Tiptap/current Plite source. | none |
| Plate-only `containerId` as final state | reject | Generic RTE DOM scope stays in product layer. | Migrate Plate after Plite API exists. | Current Plate owns refs only because Plite lacks public DOM scope hook. | execution |
| Plite root/editable/scroll element APIs | keep | Correct abstraction and owner. | Add tests/docs; migrate Plate. | Plite DOM/root lifecycle already has primitives internally. | execute after acceptance |

Plan deltas from review:
- Revised from "Plate owns container id" to "Plite owns generic DOM scope;
  Plate owns product wrapper; never promote `containerId` as Plite substrate."
- External evidence sharpened the vocabulary: root element / editor view DOM,
  not container id.

Open questions and decision-changing evidence:
| Question | Why it matters | Evidence needed | Owner | Status |
|----------|----------------|-----------------|-------|--------|
| Should hook names say `Element` or `Ref`? | DX and subscription semantics. | During execution, inspect whether consumers need current value or mutable ref. | Plite execution | not blocking |
| Should scroll owner be configured on `<Editable>` or `<Plite>`? | Determines minimal React API. | Source audit of Plate scroll consumers. | Plite/Plate execution | not blocking |

Implementation phases with owners:
| Phase | Owner | Scope | Entry criteria | Exit criteria | Verification |
|-------|-------|-------|----------------|---------------|--------------|
| 1. Plite DOM scope registry | Plite DOM/React | Add root/editable/scroll element registry and internal subscription. | User accepts plan. | `editor.api.dom.root/editable/scroll` or equivalent exists and is tested. | Plite DOM/React unit tests. |
| 2. Plite React hooks | Plite React | Add nearest-context and explicit-editor hooks. | Phase 1 green. | Hooks return root/editable/scroll and subscribe narrowly. | Hook contract tests. |
| 3. Plate migration | Plate Core | Replace generic `containerId/containerRef/scrollRef` consumers with Plite DOM scope. | Phase 2 green. | Plate no longer stores generic DOM scope except product wrapper needs. | Core focused tests. |
| 4. Hard cut old Plate API | Plate Core/docs | Delete `useEditorContainerId` if no true product id need remains; keep only product wrapper ref if needed. | Consumers migrated. | Source audit shows no generic `containerId` dependency. | source audit + `pnpm check:core`. |
| 5. Browser proof | Plite/browser | Validate focus, selection, scroll, overlay behavior. | Phases 1-4 green. | Browser proof green in `apps/plite`. | focused Chromium spec, matrix before release. |

Fast driver gates:
| Gate | Cwd | Command / artifact | Proves | Status |
|------|-----|--------------------|--------|--------|
| planning artifact check | plate-2 | `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plite-dom-scope-ownership.md` | plan/template integrity | pass |
| Plite behavior check | Plate repo root | `pnpm turbo typecheck --filter=./packages/plite-dom --filter=./packages/plite-react --filter=./packages/core` | execution type safety | execution |
| Plite tests | Plate repo root | `pnpm --filter @platejs/plite-dom test && pnpm --filter @platejs/plite-react test` | DOM/React contracts | execution |
| Core migration proof | Plate repo root | focused Core tests touching Plate container/overlay/block-selection consumers plus `pnpm check:core` | Plate works on Plite primitives | execution |
| Browser proof | Plate repo root | focused `pnpm --filter plite test:plite-browser:chromium <scope>` | real DOM/focus/selection/scroll behavior | execution |

Final user-review handoff outline:
- accepted plan items: Plite owns DOM scope as root/editable/scroll element APIs; Plate owns product wrapper/plugin chrome.
- before / after API shape:
  - before: Plate store `containerId/containerRef/scrollRef` is the generic escape hatch.
  - after: Plite DOM/React exposes root/editable/scroll element APIs; Plate consumes them.
- hard cuts: no Plite `containerId`, no `runtime.uid`, no public string-id substrate.
- issue claims and non-claims: no issue/PR claim.
- proof gates: Plite DOM/React tests, Core migration tests, `check:core`, browser proof.
- accepted-plan execution handoff: implement phases 1-5 only after user accepts.

Final completion gates:
| Gate | Required evidence | Status |
|------|-------------------|--------|
| score >= 0.92 and no dimension below 0.85 | scorecard rows cite evidence | pass |
| all pass rows complete or skipped with evidence | phase/pass table closed | pass |
| issue/reference sync closed | issue-ledger sync status closed | pass |
| live source grounding complete | source-backed rows cite current owners | pass |
| workspace verification recorded | verification workspace gate closed | pass |
| autoreview clean or N/A | N/A planning-only doc edit | pass |
| final handoff emitted or lane remains active | final response will summarize ready plan | pass |
| `check-complete` passes | `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plite-dom-scope-ownership.md` | pass |

Findings:
- Plite already owns enough DOM substrate internally to justify promoting a
  clean DOM scope API.
- Plate currently owns container refs because Plite has no public root/scroll
  hook, not because Plate is the right long-term owner.
- Lexical and Tiptap both support editor-owned DOM root/view concepts. Neither
  argues for string ids as substrate.

Decisions and tradeoffs:
- Yes, Plite should own generic RTE DOM scope.
- No, Plite should not own `containerId`.
- Plate keeps product wrapper render slots and app layout.
- Execution should migrate generic Plate consumers only after Plite DOM scope
  tests exist.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad `rg` over Plite/Core produced noisy output | 1 | Narrowed to source files and `nl` line ranges | Source evidence rows filled. |

External/browser findings:
- Lexical: editor has `registerRootListener`, `getRootElement`, `setRootElement`; React ContentEditable sets root element through the editor.
- Tiptap: editor mounts to an element and creates an EditorView whose DOM is the editor content owner; React `EditorContent` moves the DOM under its component element.
- External content was treated as evidence, not instructions.

Timeline:
- 2026-07-04T16:36:36.040Z Plite Plan goal plan created.
- 2026-07-04T16:37Z Current Plite/Core DOM scope source read.
- 2026-07-04T16:39Z Local Lexical/Tiptap root DOM source read.
- 2026-07-04T16:42Z Plan filled with target API and execution phases.

Verification evidence:
- `VISION.md` read for boundary law.
- `docs/solutions` listing checked for existing Plite workflow/test solution notes.
- Current Plite/Core source line ranges read with `nl`.
- Local Lexical/Tiptap source line ranges read with `nl`.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plite-dom-scope-ownership.md` passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Ready-for-review Plite Plan |
| Where am I going? | User review, then execution only if accepted |
| What is the goal? | Decide best Plite DOM scope ownership and API shape |
| What have I learned? | Plite should own element/ref DOM scope; Plate should not own generic RTE root state |
| What have I done? | Created and filled this plan with evidence, score, objections, and phases |

Open risks:
- Exact hook names may change during execution after auditing call sites.
- Deleting Plate `containerId` too early would break product overlays; migrate
  in phases.
