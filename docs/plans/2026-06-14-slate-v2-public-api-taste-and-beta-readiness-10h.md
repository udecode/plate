# Slate v2 public API taste and beta readiness

Objective:
Automate Slate v2 API taste and beta readiness; done when the active
beta-readiness loops, queued taste checkpoints, proof packets, and plan gates
close.

Goal plan:
docs/plans/2026-06-14-slate-v2-public-api-taste-and-beta-readiness-10h.md

Template:
docs/plans/templates/slate-auto.md

Primary template:
docs/plans/templates/slate-auto.md

Applied packs:

- none

Automation source:

- type: user-invoked `slate-auto`
- prompt / link: "continue asking those questions and slate-auto for 10h";
  updated by user to remove the 10h constraint and finish the full active loops
  so Slate v2 is ready for beta-public review.
- surface / route / package: `.tmp/slate-v2` public API, docs, examples,
  stable editor behavior proofs, and supervisor workflow; pagination deferred
  unless explicitly requested.
- invocation mode: beta-readiness loop
- minimum runtime / deadline: N/A; removed by user on 2026-06-15. Finish active
  loops to keep/revert/quarantine, then close with beta-public review evidence.
- completion threshold summary: finish the active API/DX/docs/proof loops needed
  for beta-public review, continue asking queued API taste questions, use
  answers to update `vision` when reusable, and keep running safe
  proof/audit/repair packets while unresolved beta-readiness gaps remain.

First checkpoint:

- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable rows: scope, non-goals, timing,
  stop conditions, deliverables, final handoff sections, verification surfaces,
  and success criteria.
- The initial checkpoint list is only the seed. After every loop, the
  supervisor must reconcile this plan against new evidence and may add, update,
  split, merge, retire, remove, reprioritize, or reopen checkpoints.
- Do not continue into implementation until first extraction is complete or
  explicitly marked N/A with reason.

Extracted requirements:

- Continue the public API/taste question batch from the previous `grill-me`
  lane.
- Start a `slate-auto` timed loop; later user update removes the 10h minimum
  and replaces it with beta-public readiness closure.
- Use `autogoal` and put every explicit requirement, scope boundary, timing
  constraint, stop condition, deliverable, and final-handoff section in this
  plan before durable work.
- Use `vision`; if a stopping checkpoint exposes missing reusable
  taste, record the raw answer here and patch the north-star source rule before
  treating the loop as ready.
- Do not wait for taste answers when safe work remains; queue soft checkpoints
  and keep progressing on source/docs/proof/workflow owners.
- Do not do release, publish, changeset, PR, or commit work.
- Do not enter pagination unless explicitly requested; defer pagination-shaped
  findings with owner `slate-plan`.
- Final handoff must include changed list, workflow slowdowns, needs-your-
  attention, stopping checkpoints, commands/proof, residual risks, and next
  owner.

Queued API/taste questions:

1. Keep `useSlateEditor` as the canonical editor factory/front door.
2. Keep no `<Slate initialValue>` prop; initial value belongs to editor
   creation.
3. Keep `onChange`, `onValueChange`, and `onSelectionChange` as separate
   callbacks.
4. Keep `editor.subscribeCommit(...)` as the low-level commit bridge.
5. Keep `useSlateRootChrome`, `useSlateContentRoot`, and
   `useSlateChildRoot` as public root composition hooks.
6. Keep advanced `Editable` props, but treat `layout` as expert/experimental
   and proof-gated.
7. Keep `EditableDOMCoverageBoundary*` public, but docs must be brutally clear
   about what it does.
8. Keep annotation/widget projector APIs as Slate-native overlay primitives.
9. Keep weak maps hard-cut from public roots; internals only.
10. Keep Slate React docs discoverable for public render primitives and advanced
    helper hooks, but do not document every low-level metrics/options type as a
    first-class concept.
11. Keep projection-store runtime machinery out of the public Slate React root
    export surface; apps should use decoration/range-decoration sources,
    annotations, widgets, and projection-entry reads instead.
12. Keep `EditableElement` public for documented DOM-coverage/custom-shell
    examples, but keep text-rendering internals (`EditableText`, `TextString`,
    `ZeroWidthString`) out of the root export surface.
13. Keep annotation/widget hooks and types public, but keep raw
    `createSlateAnnotationStore` and `createSlateWidgetStore` constructors out
    of the root runtime export surface.
14. Keep decoration source hooks/types public, but keep raw
    `createDecorationSource`, `createRangeDecorationSource`,
    `composeDecorationSources`, and `DefaultPlaceholder` out of the root runtime
    export surface. Keep `defaultScrollSelectionIntoView` public for wrapping
    and sibling layout integration.
15. Round 29: keep strict package export/type smoke in the fast package-DX gate,
    keep package import/type smoke beta-blocking but private-alpha only, and
    decide whether raw expert props/internal bridge policy need the same exact
    positive export-list treatment as root runtime exports.
16. Round 30: keep `skipLibCheck: false` in the fast package-DX gate, accept
    topological sibling `dist` artifacts as the declaration-build dependency,
    and decide whether `slate-react` default history typing should keep the
    local structural fallback plus augmentation-aware precision or type-import
    `slate-history` explicitly.
17. Round 33: keep public TS/JS docs snippets free of `any` by default; only
    allow explicit payload escape-hatch snippets if a future API doc proves the
    need.

Completion threshold:

- The current packet is verified, reverted, or quarantined, and every required
  beta-readiness checkpoint row is complete, explicitly deferred with owner, or
  N/A with evidence.
- Queued taste questions are answered and consolidated when the user replies,
  or remain in the final stopping-checkpoint table with a recommendation.
- Safe API/docs/proof/workflow packets have been run until no higher-value
  autonomous beta-readiness checkpoint remains in the active loop.
- Closure is legal only when required behavior, visual/native selection,
  package/API, mobile/raw-device claim-width, huge-document, docs/skill repair,
  changed-list, review-attention, stopping-checkpoint, workflow-slowdown, and
  final handoff rows are complete, explicitly deferred, or N/A with evidence,
  and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-14-slate-v2-public-api-taste-and-beta-readiness-10h.md`
  passes.

Verification surface:

- Source audits: focused `rg`/file reads over `.tmp/slate-v2` public API exports,
  Slate React hooks/components, docs, examples, and proof specs.
- Package/API proof: focused Bun package tests or typecheck commands for touched
  Slate v2 package surfaces.
- Browser proof: in-app Browser or Playwright only for routes touched by a
  behavior/visual claim.
- Selection/visual proof: model selection, native `window.getSelection()`, DOM
  endpoints/caret geometry, screenshot/pixel evidence when visible behavior is
  in scope.
- Benchmark proof: `METRIC` output and before/latest/best rows only when a
  perf packet is opened.
- Mobile proof: raw-device claims deferred by default; viewport/semantic mobile
  proof must be scoped and labeled.
- Skill proof: if `.agents/rules/**` changes, run `pnpm install`, mirror audit,
  and agent-native review.
- Final proof: `node .agents/skills/autogoal/scripts/check-complete.mjs
docs/plans/2026-06-14-slate-v2-public-api-taste-and-beta-readiness-10h.md`.

Constraints:

- Slate v2 private alpha by default: no release, publish, changeset, PR, or
  branch readiness unless the prompt explicitly asks.
- Run Slate v2 behavior commands from `.tmp/slate-v2`; parent repo commands
  prove plans, docs, skills, and templates only.
- Behavior proof beats perf. Native/visual proof beats model-only selection.
- No hidden debounce or fake stress fixture wins.
- No broad pagination/virtualization architecture unless the prompt or a
  stopping checkpoint routes to `slate-plan`.
- Do not patch Plate when the run is scoped to Slate v2.

Boundaries:

- Source of truth: `.tmp/slate-v2` source/docs/tests for Slate v2 behavior/API;
  `.agents/rules/**` for skill policy; `docs/plans/**` for this run.
- Allowed edit scope: `.tmp/slate-v2/**`, `docs/plans/**`,
  `docs/slate-v2/**`, `docs/research/**`, and `.agents/rules/**` only when
  the active packet proves ownership.
- Browser surfaces: local Slate v2 examples only when a route is named or
  obvious from the packet.
- Package/API surfaces: Slate v2 public exports, Slate React runtime hooks,
  root composition, annotations/widgets, DOM coverage boundaries, examples,
  and docs.
- Agent/skill surfaces: `slate-auto`, `vision`, `slate-browser`,
  `autogoal`, or owned helper scripts when workflow misses repeat.
- Docs/research surfaces: run-specific plan rows first; durable docs only for
  accepted reusable decisions.
- Non-goals: release/publish/PR/commit readiness, pagination architecture,
  Plate runtime work, raw-device mobile claims, and broad external issue ledgers
  unless a later checkpoint explicitly routes them.

Blocked condition:

- Hard stop only if no autonomous safe checkpoint remains, a required user-only
  taste decision blocks the next move, raw device/browser access is required for
  the claim, or the same real blocker repeats after distinct attempts.
- Do not block while a safe alternate checkpoint remains runnable. In timed or
  batch mode, queue soft questions for final handoff.
- Do not hand off because the obvious backlog looks empty. Enter supervision
  mode and infer the next checkpoint from `vision`, current evidence,
  weak proofs, benchmark gaps, API/docs mismatch, issue/test harvest gaps, and
  workflow slowdowns.

Automation state:

- surface: `.tmp/slate-v2` public API taste, beta readiness, docs/proof/workflow
- mode: timed batch loop
- minimum_runtime: 10h active runtime
- target_deadline: 2026-06-15T10:16:39+0200
- checkpoint_policy: dynamic_supervisor
- supervision_mode: available_when_timed_backlog_is_empty
- current_loop: 185
- current_checkpoint: final-full-browser-proof-and-flake-triage
- current_checkpoint_status: complete
- next_checkpoint: final-check-complete-and-handoff
- goal_status: active

Current verdict:

- latest_packet: final full-browser proof passed with four retry-recovered flakes isolated as non-reproducible under focused retries-off repeats.
- verdict: Strict public package declaration smoke is now a fast package-DX gate with `paths: {}`, Node/React ambient types only, and `skipLibCheck: false`; fast gate is green after package declaration build policy and source type-boundary repairs. Public current-state wording rescan is clean; public example complexity triage has no new patch need; review anchors are backed by focused proof commands; beta review attention is capped and ranked to five grouped decisions; huge-document browser-trace metric smoke is healthy after correctness and visual proof; huge-document visual/scrollbar and correctness smoke are green across desktop browsers; screenshot-backed visual/native selection smoke is green; cross-browser native-selection slice and stable Chromium editor behavior smoke are green; public docs markdown link oracles strip fenced code and validate reference-style link definitions; release-discipline is green after the package-DX guard family; docs proof map now anchors package import paths, export targets, build entries, README casing, public docs/example import specifiers, and package import smoke; package README casing, public docs/examples import specifiers, package export maps, target shapes, build-entry alignment, and package import smoke are guarded across all seven Slate v2 packages; Slate Layout root and React subpath runtime exports, Slate Browser public subpaths, Slate History, Slate Hyperscript, Slate DOM, and Slate React runtime exports are exact-guarded; public docs/examples have a current-state wording guard against compatibility/migration/deprecated/legacy posture; the `slate/internal` bridge has an exact classified sibling importer guard; public root value exports are exact and documented/classified; root `isObject`, `getCharacterDistance`, and `getWordDistance` leaks are hard-cut; sibling packages use `slate/internal` for internal helpers; public root editor type export coverage is source-backed; public extension type docs name the important extension/schema/middleware exported type groups; public extension authoring docs show all three core authoring helpers; public transform concept now matches the fuller transaction reference; full transaction API docs completeness is green; `tx.nodes.insertMany` alias hard cut is green; transaction transform docs now name source-backed options and reject false fragment-delete options; package README case-sensitive proof repair, Slate React README factory classification, TypeScript concept useSlateEditor cleanup, Slate History package README React front-door cleanup, React-owned docs useSlateEditor cleanup, hard-cut symbol leakage classification scan, projection-store public summary wording hard cut, post-type-docs release discipline, Slate core public type group docs, Slate DOM public type group docs, Slate Browser subpath proof API docs contract, scoped latest-state public-doc wording audit, static API docs parity, Slate core runtime/view docs coverage, Slate DOM grouped root utility docs coverage, stable package README export docs, Slate Browser subpath-only hard cut, sibling package pure-alias hard cut, all-package pure-alias guard, Slate React public render/helper docs coverage, root type export docs classification, default scroll helper docs, projection/text/overlay/decoration root runtime hard cuts, public/runtime alias hard cut, and durable pure-alias guard are green after accumulated API hard cuts
- confidence: high for current desktop behavior/API/docs/package-boundary/example-DX state
- next owner: slate-auto closeout; future proof-harness owner for full-matrix server/artifact race hardening
- keep / revert / quarantine call: keep stable behavior, cross-browser, visual proof, huge-document smoke, focused metric, alias/hard-cut, docs/readme, and fast-gate packets
- reason: The slate-browser package-scripts contract now checks every direct value and type export in `src/playwright/index.ts`. Added source JSDoc for the 102 direct exported Playwright type declarations, replaced the partial critical-type list with an exhaustive scanner, rebuilt declarations, verified representative emitted Playwright type docs, and full `bun check` passed.

Completion rule:

- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add
  `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-14-slate-v2-public-api-taste-and-beta-readiness-10h.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | slate-auto | complete | P0 | Copy prompt requirements and read north-star before implementation. | Requirement rows complete. | seed -> closed at final beta-readiness closeout |
| queued-api-taste-round-3 | slate-auto / vision | queued | P0 | Continue questions without blocking safe work. | User answer captured, questions carried to final handoff, or north-star patched if reusable. | added loop 0 |
| queued-api-taste-round-7 | slate-auto / vision | queued | P0 | Keep package docs/proof boundaries explicit while asking taste questions in batches. | User answer captured, questions carried to final handoff, or north-star patched if reusable. | added loop 40 |
| queued-api-taste-round-8 | slate-auto / vision | complete | P0 | Runtime/root hook names should match the public mental model before beta. | User approved the root-name hard cut; no reusable north-star patch needed beyond existing no-alias/root-public taste. | added loop 41 -> approved by user |
| queued-api-taste-round-9 | slate-auto / vision | queued | P1 | Keep state-field hook names tied to the core `defineStateField` term. | User approves keep-as-is or requests namespaced Slate hook names. | added loop 43 |
| queued-api-taste-round-10 | slate-auto / vision | queued | P1 | Keep editor creator and context-reader hooks distinct without overlong names. | User approves keep-as-is or requests a context-reader rename. | added loop 44 |
| queued-api-taste-round-11 | slate-auto / vision | complete | P1 | Low-level overlay hook names should describe returned data, not internal substrate. | User approved the projection-entry hard cut. | added loop 45 -> approved by user |
| queued-api-taste-round-12 | slate-auto / vision | complete | P1 | Focus-policy values should use one dialect across history and command hooks. | User approved `preserve`. | added loop 47 -> approved by user |
| queued-api-taste-round-13 | slate-auto / vision | complete | P1 | Raw `Editable` layout hooks should say they belong to DOM strategy, while product wrappers may keep domain names. | User approved `domStrategyLayout` / `EditableDOMStrategyLayout`. | added loop 49 -> approved by user |
| queued-api-taste-round-14 | slate-auto / vision | queued | P2 | Raw `Editable` event props should stay DOM/rendering focused, not become a command registry. | User approves `onKeyDown`, `onDOMBeforeInput`, and no `onCommand`, or requests a different raw-event naming policy. | added loop 51 |
| queued-api-taste-round-15 | slate-auto / vision | queued | P2 | Render-prop type ownership should have one public owner and no stale duplicate shapes. | User approves deleting duplicate internal exports, or asks to expose a separate DOM-root render-prop surface. | added loop 53 |
| queued-api-taste-round-16 | slate-auto / vision | queued | P2 | Provider-level projection props should stay limited to shared editor projection sources; widget stores are hook-owned. | User approves no `widgetStore` provider prop, or requests provider-owned widget store wiring. | added loop 55 |
| queued-api-taste-round-17 | slate-auto / vision | queued | P2 | Annotation/widget hooks should keep store creation distinct from snapshot/item reads. | User approves current names and provider/default-store split, or requests a different hook naming scheme. | added loop 57 |
| queued-api-taste-round-18 | slate-auto / vision | queued | P2 | `SlateChange` should stay a React callback detail type, not become the core command or commit API. | User approves `SlateChange` as the short callback payload name, or requests a more literal name such as `SlateRootChange`. | added loop 61 |
| queued-api-taste-round-19 | slate-auto / vision | queued | P1 | Core commit APIs should use `EditorCommit` / `EditorCommitClass` directly instead of duplicate snapshot/change/listener aliases. | User approves removing `SnapshotChange`, `SnapshotChangeClass`, `OperationClass`, and `CommitListener`, while keeping `SnapshotListener` for snapshot subscriptions. | added loop 63, updated loop 65 |
| queued-api-taste-round-20 | slate-auto / vision | queued | P1 | Pure public/internal type aliases should be removed unless they preserve Slate-compatible augmentation names or add real semantic shape. | User approves removing `EditorApplyOperationsOptions`, `EditorCommandResult`, `UseSlateRootEditorOptions` as a `Pick` alias, `SlateAnnotationStoreRefreshOptions`, `RuntimeAndroidInputManager`, and `DOMCoverageSelfBoundaryProps`, while leaving Slate-compatible base aliases alone. | added loop 66, updated loops 67-68 |
| queued-api-taste-round-21 | slate-auto / vision | queued | P2 | Slate React docs should make exported render primitives and advanced helper hooks findable without becoming a type dump. | User approves naming public primitives/hooks while grouping low-level metrics/options types, or requests exhaustive docs for every exported type. | added loop 73 |
| queued-api-taste-round-22 | slate-auto / vision | complete | P1 | Projection-store runtime values are implementation machinery; root exports should expose decoration/annotation/widget/runtime hooks instead. | User approved removing `createSlateProjectionStore` and `isSlateSourceDirty` from root runtime exports. | added loop 74 -> approved by user |
| queued-api-taste-round-23 | slate-auto / vision | complete | P1 | Slate React should expose stable custom-shell primitives, not low-level text rendering internals. | User approved keeping `EditableElement` public while removing `EditableText`, `TextString`, and `ZeroWidthString` from root runtime exports. | added loop 75 -> approved by user |
| queued-api-taste-round-24 | slate-auto / vision | complete | P1 | Raw annotation/widget store constructors duplicate hook-owned overlay APIs. | User approved removing `createSlateAnnotationStore` and `createSlateWidgetStore` from root runtime exports while keeping hooks and types public. | added loop 76 -> approved by user |
| queued-api-taste-round-25 | slate-auto / vision | complete | P1 | Raw decoration constructors duplicate hook-owned decoration APIs; `defaultScrollSelectionIntoView` is a different integration helper. | User approved removing raw decoration constructors and `DefaultPlaceholder` from root runtime exports while keeping `defaultScrollSelectionIntoView` public. | added loop 77 -> approved by user |
| queued-api-taste-round-26 | slate-auto / vision | complete | P1 | Transaction helper aliases should not survive the no-alias policy. | User approved cutting `tx.nodes.insertMany` because it was only a duplicate of `tx.nodes.insert`. | added loop 99, implemented loop 100 -> approved by user |
| queued-api-taste-round-27 | slate-auto / vision | queued | P2 | Package-DX guard posture should match beta-review taste: exact package maps/targets/build entries, package import smoke in the fast gate, public docs barred from `/internal`, and README casing guarded. | User approves this package-DX proof posture or requests a lighter/stricter fast-gate shape. | added loop 120 |
| queued-api-taste-round-28 | slate-auto / vision | queued | P2 | Beta review order should match taste now that API/docs/behavior proof is green. | User approves review order: public root exports, React root hooks, raw `Editable` expert props, transaction API, package import paths, examples, then long-doc behavior/perf; also approves keeping `slate-layout` proof-gated/experimental unless pagination is explicitly requested. | added loop 128 |
| queued-api-taste-round-29 | slate-auto / vision | queued | P1 | Package export/type smoke is now strict enough to catch real package-DX misses; taste should decide whether this remains a fast-gate expectation and how far exact export-list treatment should extend. | User approves strict package export/type smoke in the fast package-DX gate, confirms private-alpha wording only, and decides whether raw expert props/internal bridge policy need positive exact export-list treatment. | added loop 135 |
| queued-api-taste-round-30 | slate-auto / vision | queued | P1 | Strict declaration proof introduced package-build policy and default-history typing taste decisions. | User approves `skipLibCheck: false`, topological sibling-dist declaration builds, and the `slate-react` history fallback/type-coupling choice. | added loop 144 |
| queued-api-taste-round-31 | slate-auto / vision | queued | P1 | The no-alias docs guard tightened public Markdown while leaving internal proof/test wording and third-party implementation fields alone. | User approves public Markdown banning "alias" API wording, internal proof/test names being allowed to say "alias" when proving hard-cuts, and sibling-dist declaration builds versus source-first declaration surgery. | added loop 146 |
| queued-api-taste-round-32 | slate-auto / vision | queued | P1 | Predicate input hard cut leaves arbitrary payload APIs alone while moving public checkers from `any` to `unknown`. | User approves `unknown` for all public predicate/checker inputs, docs avoiding `any` except deliberate payload escape hatches, and whether `slate-browser` Playwright helper types deserve a separate JSDoc/DX pass. | added loop 148 |
| queued-api-taste-round-33 | slate-auto / vision | queued | P1 | Public docs snippets should model strong types even when implementation source still has deliberate generic/payload `any` zones. | User approves public TS/JS Markdown snippets staying `any`-free by default, with future explicit payload escape-hatch exceptions only when proven. | added loop 155 |
| strict-public-package-declaration-gate | slate-auto | complete | P0 | Package import smoke must prove real consumer declaration artifacts, not source-path aliases or `skipLibCheck` masking. | `bun --filter ./packages/slate typecheck`, `bun --filter ./packages/slate-react typecheck`, `bun --filter ./packages/slate-layout typecheck`, package builds, and `bun check` passed with `test/tsconfig.public-package-types.json` using `paths: {}` and `skipLibCheck: false`. | added/completed loop 143 |
| package-declaration-build-order-clean-proof | slate-auto | complete | P0 | The strict dts policy maps package imports to built declarations, so the intended root package build must work from clean package artifacts. | `bunx turbo --filter "./packages/*" clean`, `bun build:packages`, and `bun check` passed. | added/completed loop 144 |
| declaration-build-path-map-guard | slate-auto | complete | P0 | New package exports/subpaths must update the declaration-build path map or strict package type smoke can drift. | Public-surface contract derives expected dts paths from package export `types` targets; focused proof passed 781 tests and `bun check` passed. | added/completed loop 145 |
| public-api-no-alias-doc-wording-guard | slate-auto | complete | P0 | Public docs must describe current type/API names, not teach alias vocabulary. | Replaced Slate DOM public docs/README "primitive aliases" wording, added a Markdown-only public alias wording guard, and passed focused scan, public-surface contract, site typecheck, and `bun check`. | added/completed loop 146 |
| public-markdown-code-fence-parse-guard | slate-auto | complete | P0 | Public docs snippets should be syntactically valid, especially TSX examples that readers paste directly. | Added a public Markdown code-fence parser guard, fixed two Slate React provider snippets, verified 319 JS/TS fences parse, and passed public-surface contract, site typecheck, and `bun check`. | added/completed loop 147 |
| public-markdown-code-fence-no-any-guard | slate-auto | complete | P1 | Public docs snippets should not teach `any` unless a deliberate payload escape hatch is explicitly approved. | Added no-`any` proof to public TS/JS Markdown code fences; public-surface contract passed 941 tests and `bun check` passed. | added/completed loop 155 |
| public-predicate-unknown-input-hard-cut | slate-auto | complete | P0 | Type predicates validate untrusted values, so public API/docs should expose `unknown` inputs instead of `any`. | Updated core predicate interfaces/implementations/docs, Slate DOM guards, Slate History `isHistory`, `isObject`, and public-surface guards; rebuilt package declarations; strict package type smoke and `bun check` passed. | added/completed loop 148 |
| post-api-hard-cut-release-discipline-and-browser-proof | slate-auto | complete | P1 | After public API/signature hard cuts, release-discipline and slate-browser proof infrastructure should still be coherent. | `bun test:release-discipline` passed 985 tests and `bun --filter slate-browser test:core` passed 77 tests; slate-browser README/subpath contracts already cover the needed API boundary. | added/completed loop 149 |
| post-predicate-hard-cut-stable-browser-slice | slate-auto / slate-ar-stabilize | complete | P1 | Runtime predicate boundary cleanup should not regress stable editor behavior. | Focused Chromium Playwright slice passed 4/4 across editable voids, markdown shortcuts, plaintext undo caret restore, and richtext undo selected-delete. | added/completed loop 150 |
| public-package-unknown-predicate-type-smoke | slate-auto | complete | P0 | Source/docs guards are not enough; built package declarations must expose the unknown predicate boundary to consumers. | Added declaration-level type assertions to `public-package-types-smoke.ts`; strict package smoke, Slate typecheck, public-surface contract, and `bun check` passed. | added/completed loop 151 |
| public-api-contract-audit | slate-auto | complete | P0 | Verify approved/current public API shape is coherent after alias hard-cut. | Exact source/docs/tests audited; mismatches fixed, deferred, or queued for taste. Final proof: strict package type smoke, public-surface contracts, slate-browser subpath contracts, declaration rebuild, and `bun check` passed. | updated loop 1 -> closed at final beta-readiness closeout |
| docs-api-drift-audit | docs-creator / slate-auto | complete | P0 | Public docs must describe latest clean API only. | Stale alias/migration/changelog prose is guarded in public Markdown, public docs import paths are allowlisted, package docs are source-checked, and latest `bun check` passed. | updated loop 1 -> closed at final beta-readiness closeout |
| beta-review-priority-list | slate-auto | complete | P0 | User asked to keep reviewing riskiest beta surfaces by priority. | Needs-your-attention table ranks the highest-value review anchors. | completed loop 129 |
| status | slate-auto | complete | P0 | Read active plan, latest prompt, source status, and current evidence. | Current state recorded in reboot status and verification evidence; user removed the 10h constraint and requested beta-readiness closure. | seed -> closed at final beta-readiness closeout |
| gap-scan | slate-auto | complete | P0 | Identify behavior, visual, API, test, metric, docs, skill, and workflow gaps. | Gaps routed through API/docs hard cuts, package-DX smoke, browser/huge-doc proof, slate-browser JSDoc/export proof, and review-attention rows. | seed -> closed at final beta-readiness closeout |
| behavior-proof | slate-ar-stabilize | complete | P0 | Prove stable editor behavior before perf. | Stable Chromium sweep, Firefox/WebKit native-selection slice, and focused post-API Chromium rows passed. | seed -> closed at final beta-readiness closeout |
| oracle-repair | slate-patch / tdd | complete | P0 | Add missing native/visual/model oracles for found gaps. | Added/kept public-surface, surface-contract, package import/type smoke, markdown code-fence/link/no-alias, exact export-map, and slate-browser direct-export/JSDoc guards; all verified. | seed -> closed at final beta-readiness closeout |
| visual-proof | Browser / Playwright | complete | P0 | Prove visible editor behavior and native selection. | Visual/native selection smoke passed 27 desktop tests with screenshots; huge-doc visual/scrollbar rows passed 14 tests with one scoped Firefox skip. | seed -> closed at final beta-readiness closeout |
| slate-browser-promotion | slate-browser | complete | P1 | Promote repeated browser proof into reusable API/helper. | Existing screenshot/selection helpers kept; package-scripts now guards all public subpaths, transports, direct Playwright exports, and direct Playwright JSDoc. | seed -> closed at final beta-readiness closeout |
| mobile-claim-width | slate-auto | complete | P1 | Separate raw-device proof from viewport proof. | Raw mobile proof explicitly deferred; no raw-device claim made. | seed -> closed at final beta-readiness closeout |
| huge-document-smoke | slate-ar-stabilize | complete | P1 | Smoke huge-doc correctness without broad architecture work. | Huge-doc correctness rows passed 15 tests; browser trace passed with p95 type-to-paint 26.5ms and select-to-paint 55.9ms. | seed -> closed at final beta-readiness closeout |
| perf-packet | slate-ar-fast / slate-ar-perf | complete | P2 | Optimize only after correctness is green. | No new optimization packet required for this beta-readiness closeout; browser-trace metrics were green and pagination remains explicit opt-in. | seed -> N/A for runtime patch, closed at final beta-readiness closeout |
| supervision-mode | slate-auto | complete | P0 while beta-readiness gaps remain | If backlog looks empty before beta readiness is proven, predict next useful checkpoint from north-star and evidence. | User removed the timebox; final supervision pass closed the remaining plan/review/accounting gates instead of starting a new unrelated packet. | updated after user removed 10h constraint -> closed |
| consolidation | slate-auto | complete | P1 | Move accepted reusable decisions to durable docs/rules. | Run-specific decisions consolidated into this plan and docs proof-map; no `.agents/rules/**` change was needed in this closeout pass. | seed -> closed |
| final-handoff | slate-auto | complete | P0 | Emit changed list, review attention, queued checkpoints, commands, residual risks. | Final handoff contract filled below; `check-complete` is the last mechanical gate. | seed -> closed |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | initial template rows | plan creation | starter topology only | completed |
| 0 | add | queued-api-taste-round-3, public-api-contract-audit, docs-api-drift-audit, beta-review-priority-list | latest user request + prior question queue | required by "continue asking those questions" and beta readiness loop | active |
| 1 | update | status, public-api-contract-audit, docs-api-drift-audit | read-first docs + live source audit | stale prior plans are routing context only; current source/docs must prove current API taste | opened docs clarity packet |
| 2 | update | public-api-contract-audit, docs-api-drift-audit | front-door docs/source audit | `useSlateEditor` is the canonical React-owned editor front door, but first walkthrough/setup/provider docs still led with `createReactEditor` + `useState` | promoted `useSlateEditor` in front-door docs and kept `createReactEditor` as lower-level |
| 3 | update | public-api-contract-audit, docs-api-drift-audit | walkthrough lane audit | Walkthroughs 02-05 still repeated old `useState(() => createReactEditor(...))` snippets, so the tutorial path contradicted the canonical hook. | promoted `useSlateEditor` across core walkthroughs and added a docs contract |
| 4 | update | public-api-contract-audit, docs-api-drift-audit | subscription docs audit | `<Slate>` docs blurred snapshot subscribers and commit-level replay/instrumentation by listing operation replay under `subscribe`. | clarified `subscribe` vs `subscribeCommit` and added a docs contract |
| 5 | update | public-api-contract-audit, docs-api-drift-audit, workflow-slowdown-review | runtime/root hook docs audit | Hook docs named runtime/root hooks but omitted key option contracts; first proof used the wrong script and then a brittle line-wrap assertion. | documented real options, fixed assertion, logged command pitfall |
| 6 | no-change | public-api-contract-audit, docs-api-drift-audit | stale alias and primitive-write scan | Active public docs/source/examples are guarded and clean; remaining stale hook names live in historical changelogs and test guards. | no deletion packet; keep escape-hatch classification |
| 7 | update | behavior-proof, visual-proof, mobile-claim-width | stable Chromium example sweep | `bun run playwright` over seven stable example specs passed 225 tests with 6 scoped skips. Skips were mobile semantic / WebKit-specific rows, not Chromium failures. | keep Chromium behavior packet; next run a Firefox/WebKit-focused slice instead of rerunning the same proof |
| 8 | update | behavior-proof, visual-proof, mobile-claim-width | Firefox/WebKit native-selection slice | Focused slice passed 28 tests with 2 Firefox skips that were explicitly WebKit-only composition rows. | keep cross-browser packet; move to visual-proof gap scan and raw-device claim-width ledger |
| 9 | update | visual-proof, slate-browser-promotion, mobile-claim-width, huge-document-smoke | dedicated visual native selection smoke | Existing `visual-native-selection-smoke.test.ts` and `slate-browser` screenshot helpers already own the desktop visual double-highlight lane. Visual smoke passed across Chromium, Firefox, and WebKit with screenshot artifacts. | keep visual packet; no new helper needed; mark raw-device mobile as deferred-by-policy and move to huge-document smoke |
| 10 | update | huge-document-smoke, visual-proof | huge-doc correctness smoke | Focused staged + virtualized correctness rows passed across Chromium, Firefox, and WebKit. | keep correctness smoke; add a visual/scrollbar huge-doc slice because prior user-visible bugs lived there |
| 11 | update | huge-document-smoke, visual-proof, perf-packet | huge-doc visual/scrollbar slice | Staged projected Shift+Down, virtualized row stacking, native scrollbar drag buffering, autoscroll, and blank-gap drag passed across desktop with one scoped Firefox skip. | keep huge-doc visual packet; correctness is green enough to enter benchmark honesty/perf-gate scan |
| 12 | update | perf-packet, workflow-slowdown-review | focused huge-doc browser-trace metric packet | Browser-trace benchmark emits p95 type/select/click/DOM/long-task/listener/selector/select-all-delete metrics. Small staged+virtualized 5k packet passed with no long tasks and bounded DOM. | keep metric baseline; no optimization patch opened; noisy `rg` scan over generated `site/out` logged as workflow miss |
| 13 | update | public-api-contract-audit, docs-api-drift-audit, queued-api-taste-round-5 | release-discipline hard-cut audit | `bun test:release-discipline` caught one unclassified `editor.selection` fixture string in `keyboard-oracle-audit.test.ts`; this was proof-harness inventory, not public API. After classifying it, release-discipline passed and public docs/source scan found no stale alias/migration prose. | keep inventory repair; ask Round 5 taste checkpoint; proceed to docs/readme beta review |
| 86 | no-change | docs-api-drift-audit, workflow-slowdown-review | scoped latest-state wording scan | Broad parent/docs scan was invalid because it streamed unrelated parent docs and run plans. Re-ran only `.tmp/slate-v2` public docs/READMEs and found only legitimate domain prose in plugin removal and normalizing operations. | keep no-change packet; repair command shape by using owner path allowlists and count-first scans |
| 87 | update | public-api-contract-audit, docs-api-drift-audit | Slate Browser subpath proof API docs | Export/docs scan showed `slate-browser/core` and `/browser` README labels were too vague after the root alias hard cut. | named proof-contract and DOM snapshot helpers in the package README and guarded the shape with `test/core/package-scripts.test.ts` |
| 88 | update | public-api-contract-audit, docs-api-drift-audit | Slate DOM public type group docs | Export/docs scan showed Slate DOM values were named, but public type families for framework authors were invisible. | added grouped type docs to package/site docs and extended `packages/slate-dom/test/public-surface-contract.ts` |
| 89 | update | public-api-contract-audit, docs-api-drift-audit | Slate core public type group docs | Export/docs scan showed advanced core type exports were mostly invisible outside source/JSDoc. | added grouped type docs to package/site docs and extended `packages/slate/test/public-surface-contract.ts` |
| 90 | no-change | public-api-contract-audit, release-discipline | release-discipline rerun | Public docs/API contract edits should not weaken hard-cut/public-field/escape-hatch/write-boundary/release script guards. | `bun test:release-discipline` passed 687 tests |
| 91 | update | docs-api-drift-audit, public-api-contract-audit | projection-store public summary wording | Root and Slate React front-door summaries still said `projection stores` after raw projection-store constructors were cut from public root exports. | replaced public-summary wording with projection infrastructure/sources/decoration sources and verified remaining store wording is internal/negative guard only |
| 92 | no-change | public-api-contract-audit, docs-api-drift-audit | hard-cut symbol leakage classification | Scan for recently cut public names found no public docs/examples leak. | classified remaining hits as internal implementations, internal benchmark imports, historical changelogs, or negative guard tests |
| 93 | update | docs-api-drift-audit, public-api-contract-audit | React rendering docs front-door cleanup | `docs/concepts/09-rendering.md` still normalized `useState(() => createReactEditor(...))` in normal React-owned docs. | promoted the concept doc to `useSlateEditor({ initialValue })`, guarded the shape in Slate React surface contract, and passed focused proof plus `bun check` |
| 94 | update | docs-api-drift-audit, public-api-contract-audit | History React setup docs front-door cleanup | `history-extension-setup.md` still taught `createReactEditor` for React-owned history setup even though `useSlateEditor` installs history by default and accepts extension overrides. | rewrote React setup docs to `useSlateEditor`, added a history contract, verified normal docs no longer show direct factories outside low-level setup/reference docs, and passed focused proof plus `bun check` |
| 95 | update | docs-api-drift-audit, public-api-contract-audit, workflow-slowdown-review | Slate History package README React front-door cleanup | Package README still said `createReactEditor` installs history by default, which contradicted the current React docs posture. First root Bun test command hit the known ignored `*.test.*` path filter. | changed package README to `useSlateEditor`, added a package-local guard, reran from package cwd, passed site typecheck and `bun check`, and logged the command-shape miss |
| 96 | update | docs-api-drift-audit, public-api-contract-audit | TypeScript concept React front-door cleanup | `docs/concepts/12-typescript.md` still taught React value generics through `createReactEditor` plus `useState`. | changed the concept page to `useSlateEditor<CustomValue>`, added a Slate React docs guard, classified remaining factory mentions as owner/reference docs, and passed focused proof plus `bun check` |
| 97 | update | docs-api-drift-audit, public-api-contract-audit | Slate React README factory classification | Slate React README owns `createReactEditor`, but the paragraph after Start Here could still read as normal app setup. | classified `createReactEditor` as the lower-level factory for outside-React ownership or same-lifetime custom hooks, guarded the README wording, and passed focused proof plus `bun check` |
| 98 | update | docs-api-drift-audit, public-api-contract-audit, workflow-slowdown-review | Package README case-sensitive proof repair | Package docs and contracts mixed `README.md` paths with actual `Readme.md` files, which passes on macOS but can fail or skip coverage on case-sensitive CI. | switched affected tests/docs to actual casing, widened central public-doc collection to `README.md` and `Readme.md`, corrected proof-map path casing and projection wording, and passed focused proof plus `bun check` |
| 99 | update/add | docs-api-drift-audit, public-api-contract-audit, workflow-slowdown-review, queued-api-taste-round-26 | Transaction transform docs source-backed options | `docs/api/transforms.md` summarized `options?` while source exposes method-specific transaction options; it also falsely documented `tx.fragment.delete` with `hanging` / `voids`. Audit surfaced `tx.nodes.insertMany` as an alias-shaped helper. | documented source-backed transaction options, added public-surface docs/source guards, passed focused proof plus `bun check`, and queued `tx.nodes.insertMany` alias audit/cut |
| 100 | update | public-api-contract-audit, docs-api-drift-audit, queued-api-taste-round-26 | `tx.nodes.insertMany` alias hard cut | `tx.nodes.insertMany` had no distinct semantics from `tx.nodes.insert`; both accepted one or many nodes and forwarded to `transforms.insertNodes`. | removed the transaction type/runtime/view alias, switched pagination and rooted dirty-path proof to `tx.nodes.insert`, added a public-surface guard rejecting alias leaks, passed focused proof/package/site typechecks/scoped scan/`bun check` |
| 101 | update | docs-api-drift-audit, public-api-contract-audit | Transaction API docs completeness | The transform API page documented command-like transform groups but omitted other public write groups on `EditorCoreUpdateTransaction`: value/root/state-field/state-patch/normalization helpers. | documented the missing transaction groups, added a complete transaction-method docs/source guard, and passed focused public-surface proof plus `bun check` |
| 102 | update | docs-api-drift-audit, public-api-contract-audit | Public transform concept cross-page consistency | The concept transforms page still listed the old narrow transaction group set after the API reference grew into a complete transaction-helper reference. | updated concept docs to name the fuller transaction groups and link the API reference; guarded the concept anchors; passed focused public-surface proof plus `bun check` |
| 103 | update | docs-api-drift-audit, public-api-contract-audit | Public extension authoring helper docs | Slate package/library extension authoring snippets named `defineEditorExtension` and `elementProperty` but omitted `defineStateField`, even though it is a first-class root authoring helper. | documented all three root authoring helpers together, extended the package docs/source guard, and passed focused public-surface proof plus `bun check` |
| 104 | update | docs-api-drift-audit, public-api-contract-audit | Public extension type export docs | Slate package/library docs grouped only a small subset of extension/schema/middleware exported types, leaving major authoring and middleware types source-only. | expanded grouped type docs in `docs/libraries/slate.md` and `packages/slate/Readme.md`, extended the public-surface guard, and passed focused public-surface proof plus `bun check` |
| 105 | update | docs-api-drift-audit, public-api-contract-audit, workflow-slowdown-review | Public root type export coverage contract | Root editor type exports could drift because docs were checked by a hand-curated docs list instead of source-backed export enumeration. | added a source-backed export parser/classification contract for `packages/slate/src/index.ts`; focused proof passed after regex repair; `bun check` passed after one formatter repair |
| 14 | update | docs-api-drift-audit, beta-review-priority-list | docs/readme wording scan | Two walkthrough closers used `You now have...` phrasing. They were not API bugs, but they read like tutorial/migration narration instead of current reference state. | keep docs cleanup; site typecheck passed; docs/package README alias/deprecated/migration scan is clean |
| 15 | update | current-tree/status, final-lint-check | current-tree fast gate | After docs and contract inventory edits, `bun check` passed. | keep fast gate; continue because safe beta-readiness checkpoints remain available |
| 16 | update | docs-api-drift-audit, beta-review-priority-list, workflow-slowdown-review | public example/source-comment DX scan | Example page had a sloppy debug comment, and three source comments used `COMPAT`, `hacks`, or `for now` language that weakens beta-review confidence even when behavior is correct. | keep wording cleanup; remaining scan hits are real `dirty*` API/domain terms plus proof-audit regex/test fixture strings; rerun fast gate because source files changed after loop 15 |
| 17 | update | current-tree/status, final-lint-check, beta-review-priority-list | post-example fast gate | Source-comment cleanup changed package files after the previous fast gate. | `bun check` passed; proceed to package export/docs anchor scan |
| 18 | update | docs-api-drift-audit, beta-review-priority-list, public-api-contract-audit | package export/docs anchor scan | `slate` and `slate-dom` are public packages but only had package READMEs, not site library navigation pages. | added thin current-state `docs/libraries/slate.md` and `docs/libraries/slate-dom.md`, linked them from `docs/Summary.md`, and added contract coverage; next audit public `./internal` subpath claim width |
| 19 | update | public-api-contract-audit, docs-api-drift-audit | internal subpath export risk audit | `slate` and `slate-dom` expose `./internal` subpaths because sibling runtime packages import them, but public docs must not make those app API. | documented `/internal` as sibling-package-only in Slate and Slate DOM library pages; public-surface and Slate React surface contracts passed |
| 20 | update | public-api-contract-audit, workflow-slowdown-review, queued-api-taste-round-6 | package peer/version coherence audit | `slate-history` and `slate-hyperscript` import `slate/internal` from source but still allowed `slate >=0.114.3`. | tightened their `slate` peer floor to `>=0.124.2`; added a source-import-based peer-floor contract; fixed a false positive by excluding package-local `node_modules` from the scan; public-surface contract and package typecheck passed |
| 21 | update | beta-review-priority-list, public-api-contract-audit, docs-api-drift-audit | public example complexity scan | Public example files are large in a few places, and one direct `createReactEditor` call could undermine the `useSlateEditor` canonical path. | kept `huge-document` direct factory as an explicit remount/control exception; added a contract; public-surface and site typecheck passed; remaining smell scan hit is the guarded exception |
| 22 | update | docs-api-drift-audit, beta-review-priority-list | docs proof-map and beta-review anchors | New core package docs and current React setup taste need to be represented in the proof map, or future docs edits will drift. | added proof-map rows for Slate core and Slate DOM library docs, updated React setup row to lead with `useSlateEditor`, added contract coverage; public-surface and site typecheck passed |
| 23 | update | current-tree/status, final-lint-check, workflow-slowdown-review | post-package/docs fast gate | Package manifests, docs, and public-surface contracts changed after the last full gate. | first `bun check` failed on Biome wrapping in the contract; after applying formatter shape, `bun check` passed; continue timed supervision with API navigation coverage |
| 24 | update | docs-api-drift-audit, beta-review-priority-list | API navigation coverage scan | `docs/api/locations/bookmark.md` existed but was not linked from Summary. | added the Bookmark nav link and a Summary coverage contract for every API leaf page; public-surface and site typecheck passed |
| 25 | update | public-api-contract-audit, current-tree/status | release-discipline rerun after public-surface edits | Public docs, package manifests, and hard-cut contracts changed after the earlier release-discipline run. | `bun test:release-discipline` passed 665 tests; continue timed supervision with root export docs claim audit |
| 26 | update | public-api-contract-audit, docs-api-drift-audit | root export docs claim audit | Newly added Slate and Slate DOM package docs should claim only real root exports. | added source-level export assertions for `createEditor`, `defineEditorExtension`, `elementProperty`, `DOMCoverage`, and `Hotkeys`; public-surface and package typecheck passed |
| 27 | update | docs-api-drift-audit, beta-review-priority-list, visual-proof, workflow-slowdown-review | example badge hard-cut + rendered nav proof | `new` badges age immediately and read like changelog UI, not current-state example navigation. | removed the `new` badge kind and all `new` example badges, kept Pagination `alpha`, added static and rendered nav proof; logged broad `rg`/Browser-tool misses |
| 28 | update | docs-api-drift-audit, public-api-contract-audit, beta-review-priority-list | package README runtime/root hook DX | `slate-react` package README documented real generic hooks but did not name the approved multi-root/runtime hook family. | README now names `useSlateRuntimeState`, `useSlateViewState`, `useSlateRootEditor`, `useSlateActiveEditor`, `useSlateCommandCallback`, and `useSlateViewEffect`; surface contract and package typecheck passed |
| 29 | update | docs-api-drift-audit, public-api-contract-audit, beta-review-priority-list | public docs runtime/root hook crosslink | The site Slate React landing page linked Hooks but hid the runtime/root hook family in the description. | Library README now routes readers to editor state, runtime state, root views, runtime/root hooks, and widget hooks; surface contract, site typecheck, and package typecheck passed |
| 30 | update | docs-api-drift-audit, public-api-contract-audit, workflow-slowdown-review | package README public-doc guard | Package READMEs are public API docs but were outside the public docs guard set. | Added package `README.md` files to public docs guardrails while excluding generated/vendor folders; first attempt wrongly included changelogs, then narrowed to README-only; public-surface and package typecheck passed |
| 31 | no-change | docs-api-drift-audit, public-api-contract-audit | state/tx public language clean scan | After package README guard expansion, verify public docs are not teaching stale primitive writes, mutable editor fields, old hook aliases, or internal snapshot APIs. | Targeted `rg` scans had no matches and public-surface passed 637 tests |
| 32 | update | visual-proof, public-api-contract-audit, workflow-slowdown-review | browser proof orphan spec audit | Route coverage was one-directional: every route had proof, but specs that were not routes were not classified. | Deleted orphan `select.test.ts`, moved its toolbar assertion into the richtext triple-click proof, and added a reverse coverage contract for route/alias/utility specs |
| 33 | update | current-tree/status, final-lint-check, workflow-slowdown-review | post-browser-proof fast gate | Docs, package READMEs, contracts, example nav, and browser proof files changed after the last full gate. | First `bun check` failed on one Biome formatting issue in `ExampleLayout.tsx`; formatter shape applied; rerun passed |
| 34 | update | docs-api-drift-audit, public-api-contract-audit | docs proof-map coverage | New package README guardrails, runtime/root hook docs, example navigation proof, visual screenshot proof, and reverse browser proof coverage needed durable proof-map anchors. | Added proof-map rows and source assertions; public-surface, site typecheck, and package typecheck passed |
| 35 | update | docs-api-drift-audit, public-api-contract-audit, workflow-slowdown-review | package README export claim guard | Site library pages had source assertions for root exports, but package READMEs did not. | Slate and Slate DOM README claims are now asserted against source; Slate DOM README imports `DOMCoverage` and `Hotkeys`; public-surface and package typecheck passed |
| 36 | update | docs-api-drift-audit, public-api-contract-audit | package subpath README boundary guard | Package exports include stable subpaths; READMEs should document public subpaths or explicitly bound sibling-only internal bridges. | Added `/internal` boundary wording to Slate and Slate DOM package READMEs; contract now checks exported subpaths for Slate, Slate DOM, Slate Browser, and Slate Layout; public-surface and package typecheck passed |
| 37 | update | docs-api-drift-audit, public-api-contract-audit | root README quickstart front-door repair | Root README still taught `useState(() => createReactEditor(...))` even though the approved React-owned front door is `useSlateEditor`. | Root README quickstart now imports and uses `useSlateEditor`; public-surface and package typecheck passed |
| 38 | update | docs-api-drift-audit, public-api-contract-audit, workflow-slowdown-review | root README package table guard | Root README package-role table is a high-review surface and should not drift from current package ownership. | Added exact package-role assertions and stale wording guard; public-surface and package typecheck passed |
| 39 | update | public-api-contract-audit, current-tree/status | release-discipline rerun after README/docs guards | Public-surface, package README, subpath, and browser proof contracts changed after the prior release-discipline run. | `bun test:release-discipline` passed 683 tests |
| 40 | update | current-tree/status, oracle-repair, queued-api-taste-round-7, workflow-slowdown-review | full fast gate after README/docs guards | `bun check` first failed on formatter wrapping, then on a stale `slate-dom` README oracle expecting only `DOMCoverage` while the README correctly imports `DOMCoverage, Hotkeys`. | formatter and package oracle repaired; `bun check` passed; Round 7 package proof taste queued; proceed to runtime/root hook name audit |
| 41 | update | public-api-contract-audit, docs-api-drift-audit, queued-api-taste-round-8 | runtime/root hook name hard cut | Public docs justified `view` mainly because `useSlateViewState` and `useSlateViewEffect` existed, but callers pass roots and the adjacent APIs already say root. | hard-renamed to `useSlateRootState` and `useSlateRootEffect`; updated docs, examples, exports, tests, and public guardrails; focused package proof passed |
| 42 | update | current-tree/status, workflow-slowdown-review | post-root-hook-rename fast gate | Public API rename touched source, docs, examples, and tests; focused proof is not enough for a root export hard cut. | first `bun check` failed on import order/formatting only; formatter shape applied; rerun passed; proceed to state-field hook naming audit |
| 43 | no-change | public-api-contract-audit, docs-api-drift-audit, queued-api-taste-round-9 | state-field hook name audit | `useStateFieldValue` and `useSetStateField` are scoped by the `defineStateField` core concept, and docs/proof-map already anchor state fields. | keep current names; record Round 9 taste checkpoint; proceed to `useEditor` / `useSlateEditor` naming collision audit |
| 44 | update | docs-api-drift-audit, public-api-contract-audit, queued-api-taste-round-10 | editor creator/context hook name audit | `useEditor` could look too close to `useSlateEditor`, but the existing split is useful: creator vs provider-reader. | kept names, added docs sentence explaining the split, and guarded it in Slate React surface contract; proceed to overlay hook name audit |
| 45 | update | public-api-contract-audit, docs-api-drift-audit, queued-api-taste-round-11 | projection-entry hook name hard cut | `useSlateProjections(runtimeId)` was public but undocumented and hid that it returns projected entries for one runtime id. | hard-renamed to `useSlateProjectionEntries`, renamed the source file, documented it as low-level, and guarded old-name removal; focused proof passed |
| 46 | update | current-tree/status, workflow-slowdown-review | post-projection-entry-rename fast gate | Public export rename touched source, tests, docs, and benchmark scripts; focused proof is not enough. | first `bun check` failed on benchmark formatter wrapping only; formatter shape applied; rerun passed; proceed to history hook focus-policy audit |
| 47 | update | public-api-contract-audit, docs-api-drift-audit, queued-api-taste-round-12 | history focus-policy value hard cut | History used `focusPolicy: 'preserve-dom'` while command callbacks used `focus: 'preserve'` for the same public idea. | hard-renamed history policy value to `preserve`; updated docs, example, tests, and surface guard; focused proof passed |
| 48 | update | current-tree/status, workflow-slowdown-review | post-history-focus-policy fast gate | Public option-value hard cut touched source, docs, examples, and tests. | clean old-value scan shows only a negative guard; `bun check` passed; proceed to editable DOM strategy prop audit |
| 49 | update | public-api-contract-audit, docs-api-drift-audit, queued-api-taste-round-13 | editable DOM strategy layout prop hard cut | Raw `Editable layout` was too generic for an expert prop that only feeds DOM strategy virtualized top-level/page items. | hard-renamed to `domStrategyLayout` and `EditableDOMStrategyLayout`; kept `PagedEditable layout` as the page-layout wrapper API; focused proof passed |
| 50 | update | current-tree/status, workflow-slowdown-review | post-editable-dom-strategy-layout fast gate | Public prop/type hard cut touched Slate React, Slate Layout, docs, example, and tests. | first typecheck caught stale `slate-layout` wrapper dependency; first fast gate caught formatter-only prop/order issues; repairs applied; `bun check` passed |
| 51 | update | public-api-contract-audit, docs-api-drift-audit, queued-api-taste-round-14 | editable event-prop docs contract | Event prop shape looked coherent, but docs could blur React `onBeforeInput` with raw native `onDOMBeforeInput`. | kept API names, added docs sentence and surface guard for the distinction; focused proof passed |
| 52 | update | current-tree/status, workflow-slowdown-review | post-editable-event-props fast gate | Docs/test contract changed after loop 50. | first focused contract assertion was too exact for markdown wrapping; stabilized assertion; `bun check` passed |
| 53 | update | public-api-contract-audit, docs-api-drift-audit, queued-api-taste-round-15 | render-prop stale interface cleanup | `components/editable.tsx` still exported old `RenderElementProps`, `RenderLeafProps`, and `RenderTextProps` interfaces even though root exports use current owners. | deleted stale duplicate interfaces, added a guard against their return, and kept current render prop owners unchanged |
| 54 | update | current-tree/status, workflow-slowdown-review | post-render-prop-stale-interface fast gate | Source/test contract changed after stale render-prop interface removal. | first fast gate failed on import formatting only; targeted Biome write fixed it; `bun check` passed |
| 55 | update | public-api-contract-audit, docs-api-drift-audit, queued-api-taste-round-16 | provider projection/widget prop boundary | Docs talked about widget stores near provider-owned projection sources, which could imply a nonexistent `widgetStore` prop. | kept provider props as-is, documented widget stores as hook-owned, and added type/docs guard that `Slate` does not expose `widgetStore` |
| 56 | update | current-tree/status, workflow-slowdown-review | post-provider-projection-props fast gate | Provider projection docs and surface contract changed after loop 54. | first focused contract assertion was too exact for markdown wrapping; stabilized assertion; `bun check` passed |
| 57 | no-change | public-api-contract-audit, docs-api-drift-audit, queued-api-taste-round-17 | annotation/widget hook surface audit | Store creation hooks, plural/singular read hooks, provider-backed annotations, and explicit widget stores already match the desired public model. | no code/docs change; proceed to hard-cut release-discipline rerun because multiple public API hard cuts landed after the previous release-discipline proof |
| 58 | update | public-api-contract-audit, current-tree/status | release-discipline rerun after API hard cuts | Multiple public hard cuts landed after the previous release-discipline proof, so stale aliases/escape hatches needed the hard-cut guard again. | `bun test:release-discipline` passed 683 tests |
| 59 | no-change | public-api-contract-audit, docs-api-drift-audit | stale public-name scan after API hard cuts | Removed hook/option/type/prop names should not remain in current public docs/source/examples outside explicit negative guards. | `rg` scan found old names only in negative guards and legitimate `widgetStore` variable/docs examples; raw `<Editable layout=` scan returned no matches |
| 60 | update | docs-api-drift-audit, public-api-contract-audit | docs proof-map API hard-cut anchors | Reviewers need one proof-map row for the hard-cut API surfaces instead of rediscovering source/test ownership from scattered contracts. | Added proof-map rows for root terminology/projection-entry/focus-policy, raw Editable DOM strategy layout, and provider projection/widget-store boundary; public-surface passed 639 tests; site typecheck passed |
| 61 | update | public-api-contract-audit, docs-api-drift-audit, queued-api-taste-round-18, workflow-slowdown-review | Slate change callback boundary | `SlateChange` is exported and shown early, but docs needed a sharper boundary so it does not look like the core command/commit model. | Kept the API name, documented it as React callback detail for the provider root, added type/docs guards, and passed public-surface, Slate React surface, site typecheck, and package typecheck |
| 62 | update | current-tree/status, workflow-slowdown-review | post-change-callback-boundary fast gate | Docs and contract files changed after loop 60, so focused proof was not enough. | First `bun check` failed on Biome wrapping in `surface-contract.tsx`; targeted formatter write fixed it; rerun passed lint, package/site/root typechecks, Bun package tests, slate-layout tests, and Slate React Vitest |
| 63 | update | public-api-contract-audit, docs-api-drift-audit, queued-api-taste-round-19, workflow-slowdown-review | core commit alias hard cut | `SnapshotChange = EditorCommit`, `SnapshotChangeClass`, and `OperationClass = SnapshotChangeClass` were fake duplicate public names after the command/change audit. | Replaced current usage with `EditorCommit` / `EditorCommitClass`, removed alias exports, fixed editor docs listener names, added guards, and passed public-surface, release-discipline, package typecheck, and site typecheck |
| 64 | update | current-tree/status, workflow-slowdown-review | post-core-commit-alias-hard-cut fast gate | Public type hard cut touched core, React, history, layout, docs, and tests; focused proof was not enough. | First full gate failed on import ordering after mechanical rewrite; Biome fixed touched files; rerun `bun check` passed |
| 65 | update | public-api-contract-audit, current-tree/status, workflow-slowdown-review | commit listener internal alias hard cut | `CommitListener` was an internal duplicate name for `(commit: EditorCommit) => void` in the same commit API lane. | Removed the alias, inlined commit listener function types, extended the no-alias guard, and reran public-surface, package/site typechecks, and `bun check` green |
| 66 | update | public-api-contract-audit, queued-api-taste-round-20 | public/runtime alias hard cut | Pure aliases remained after the core commit cleanup: `EditorApplyOperationsOptions = EditorUpdateOptions`, `SlateAnnotationStoreRefreshOptions = SlateAnnotationRefreshOptions`, and `RuntimeAndroidInputManager = AndroidInputManager`. | Removed the aliases, replaced usages with owner types, added core/React surface guards, and passed focused guards, package/site typechecks, and `bun check` |
| 67 | update | public-api-contract-audit, queued-api-taste-round-20, workflow-slowdown-review | command result and DOM coverage alias hard cut | `EditorCommandResult = boolean` and `DOMCoverageSelfBoundaryProps = DOMCoverageBoundaryBaseProps` were additional pure aliases in the same class. | Removed both aliases, inlined `boolean` and base props, added guards, fixed a mechanical rewrite miss, and passed focused guards, package/site typechecks, and `bun check` |
| 68 | update | public-api-contract-audit, queued-api-taste-round-20 | root editor options alias hard cut | `UseSlateRootEditorOptions = Pick<EditorViewOptions, 'readOnly'>` made a public hook option depend on a hidden `Pick` alias. | Replaced it with an explicit `{ readOnly?: boolean }` shape, added a React surface guard, and passed focused React guard, package/site typechecks, and `bun check` |
| 69 | update | public-api-contract-audit, workflow-slowdown-review | pure type alias allowlist guard | Manual alias scans would be repeated and lossy unless the remaining aliases are classified in code. | Added a public-surface contract that scans Slate and Slate React source for one-line pure aliases and fails on unclassified names; first calibration surfaced generic node/text helper aliases, then the guard passed and `bun check` passed |
| 70 | update | public-api-contract-audit | internal view terminology public boundary guard | Internal `SlateViewBoundary*` and `useSlateViewSelection*` names still exist, but should not leak into the public Slate React root API after the root terminology hard cut. | Added a Slate React surface guard that rejects `SlateViewBoundary` / `useSlateViewSelection` in `src/index.ts`; focused React guard and `bun check` passed |
| 71 | update | docs-api-drift-audit, public-api-contract-audit | operation docs replace-children coverage | Operation docs mentioned `replace_children` in root lifecycle prose but omitted `ReplaceChildrenOperation` from the operation types page and current `OperationApi.is*` helper coverage was incomplete. | Added current-state operation docs and a public-surface contract for `ReplaceChildrenOperation` plus every current check helper; public-surface, site typecheck, and `bun check` passed |
| 72 | update | docs-api-drift-audit, public-api-contract-audit | static API docs source parity | Source-vs-doc compare showed Element docs missing `isElementProps`, Node docs missing `findTextRanges` and type guards, and Text docs missing `isTextProps`. | Added the missing docs and a generic public-surface contract that compares Element/Node/Operation/Path/Point/Range/Text interface methods to API docs headings; public-surface, site typecheck, and `bun check` passed |
| 73 | update | docs-api-drift-audit, public-api-contract-audit | Slate React public export docs coverage | Export scan showed public render primitives and advanced helper hooks were exported but not named in README/hook docs. | Added docs for `SlateElement`, `SlateText`, `SlateLeaf`, `SlatePlaceholder`, `useSlateNodeRef`, `useDOMStrategyVirtualOffset`, and `useSlateRangeDecorationSource`; React surface contract, package/site typechecks, and `bun check` passed |
| 73 | add | queued-api-taste-round-21 | Slate React export docs coverage | The docs policy intentionally names public primitives/hooks while avoiding exhaustive low-level type prose. | queued for final handoff; continue safe audit work |
| 74 | update | public-api-contract-audit | projection store root runtime hard cut | `createSlateProjectionStore` and `isSlateSourceDirty` were root runtime exports even though docs and examples steer app code to decoration/annotation/widget APIs. | Removed those runtime values from `slate-react` root exports, retargeted internal tests/benchmarks to the source module, added a runtime root guard, and passed focused tests, typechecks, and `bun check`. |
| 74 | add | queued-api-taste-round-22 | projection store root runtime hard cut | This is a real public API shape choice, not just a docs fix. | queued for review; continue safe audit work |
| 75 | update | public-api-contract-audit | text rendering root runtime hard cut | `EditableText`, `TextString`, and `ZeroWidthString` were root exports used only by internals/tests, while `EditableElement` is documented and used by public examples. | Removed text internals from root exports, retargeted tests to component modules, added a runtime root guard, and passed focused tests, typechecks, and `bun check`. |
| 75 | add | queued-api-taste-round-23 | text rendering root runtime hard cut | This is a public render primitive boundary decision. | queued for review; continue safe audit work |
| 76 | update | public-api-contract-audit | overlay store constructor root runtime hard cut | `createSlateAnnotationStore` and `createSlateWidgetStore` were root exports used by hooks/tests, while docs teach `useSlateAnnotationStore` and `useSlateWidgetStore`. | Removed raw store constructors from root exports, retargeted tests to source modules, added a runtime root guard, and passed focused tests, typechecks, and `bun check`. |
| 76 | add | queued-api-taste-round-24 | overlay store constructor root runtime hard cut | This is an overlay API boundary decision. | queued for review; continue safe audit work |
| 77 | update | public-api-contract-audit | decoration source root runtime hard cut | Raw decoration source constructors/composer and `DefaultPlaceholder` were root exports, while docs teach hooks and custom placeholder renderers. | Removed these runtime values from root exports, retargeted internal tests/benchmark imports, kept `defaultScrollSelectionIntoView`, added root guards, and passed focused tests, typechecks, and `bun check`. |
| 77 | add | queued-api-taste-round-25 | decoration source root runtime hard cut | This is a decoration/scroll API boundary decision. | queued for review; continue safe audit work |
| 78 | update | docs-api-drift-audit, public-api-contract-audit | default scroll helper docs coverage | Value-export inventory showed `defaultScrollSelectionIntoView` as the only remaining public runtime value missing docs/examples coverage. | Documented it under `Editable.scrollSelectionIntoView`, added a docs guard, and passed focused React surface, package/site typechecks, and `bun check`. |
| 79 | update | docs-api-drift-audit, public-api-contract-audit | root type export docs classification | Root type export scan showed many option/context/metrics/structural type names are intentionally not prose-documented one by one after Round 21 docs policy. | Added a React surface contract that compares root type exports to Slate React docs and requires every undocumented type export to be explicitly classified. Focused surface, package/site typechecks, and `bun check` passed. |
| 80 | update | docs-api-drift-audit, public-api-contract-audit | Slate core runtime/view docs coverage | Core value-export scan showed `createEditorRuntime` and `createEditorView` were real root exports but undocumented. | Documented them in Slate library docs and package README as framework/runtime multi-root APIs, added public-surface guards, and passed focused public-surface, package/site typechecks, and `bun check`. |
| 81 | update | docs-api-drift-audit, public-api-contract-audit, workflow-slowdown-review | Slate DOM grouped root utility docs | Slate DOM root docs named only `DOMCoverage` / `Hotkeys` while the root exports intentional DOM, diff, environment, keyboard, and decoration utility groups; broad scan repeated generated-output noise. | Documented grouped utility exports in Slate DOM library docs and package README, added a package public-surface guard, passed focused proof/typechecks/`bun check`, and logged the generated-output scan miss. |
| 82 | update | docs-api-drift-audit, public-api-contract-audit, workflow-slowdown-review | Stable package README export docs | Slate History and Slate Hyperscript READMEs omitted small root exports that are intentional public API. | Documented `History.isHistory`, hyperscript creator exports, added package-local README contracts with discoverable `*.test.ts` names, passed package-directory proof and `bun check`, and logged the direct Bun file-filter pitfall. |
| 83 | update | public-api-contract-audit, docs-api-drift-audit | Slate Browser root alias hard cut | `slate-browser` root was only an aggregate alias over `core` and `browser`, while README/docs already frame owned subpaths as the stable proof surface. | Removed the root export map, root build entry, root TS path aliases, and `src/index.ts`; added a subpath-only package guard; passed no-root-import scan, public-surface, Slate Browser core proof, package build, typechecks, and `bun check`. |
| 84 | update | public-api-contract-audit | Sibling package pure-alias hard cut | Pure alias guard previously covered only Slate core and Slate React. | Scanned sibling package source, removed/converted pure aliases in Slate Browser, Slate DOM, and Slate Layout, verified no sibling pure aliases remain, and passed focused owner proofs plus `bun check`. |
| 85 | update | public-api-contract-audit | All-package pure-alias guard | The previous durable guard would not catch a new sibling package pure alias. | Widened the pure-alias public-surface guard to Slate Browser, Slate DOM, Slate History, Slate Hyperscript, and Slate Layout source folders; public-surface, package typecheck, and `bun check` passed. |
| 106 | update | public-api-contract-audit, docs-api-drift-audit, workflow-slowdown-review | Public root value export coverage audit | Root value scan showed `isObject`, `getCharacterDistance`, and `getWordDistance` were leaking from the Slate public root without app-facing docs. | Removed root `./text-units` and `./utils/is-object` exports, moved sibling usage to `slate/internal`, added an exact root value export guard, rebuilt touched packages to refresh stale dist, passed focused proof and `bun check`, and logged stale-dist / broad-dist-scan slowdowns. |
| 107 | update | public-api-contract-audit, workflow-slowdown-review | Public sibling internal import bridge guard | Moving low-level utilities behind `slate/internal` makes the sibling bridge more important; the previous contract checked peer floors but not the exact importer set. | Added an exact classified importer guard for `slate/internal`; first run failed by exposing existing Slate DOM/React bridge users, then the real list was classified and focused proof plus `bun check` passed. |
| 108 | update | public-api-contract-audit, docs-api-drift-audit | Public compat/alias wording and source audit | Public docs/examples should not explain current APIs through compatibility, legacy, migration, deprecation, or previous-version framing. | Replaced the one public example `COMPAT` comment, added a current-state wording guard for public docs/examples, classified internal browser/platform `COMPAT` comments as implementation notes, and passed focused proof plus `bun check`. |
| 109 | update | public-api-contract-audit | Slate React root runtime export exactness audit | Recent React root hard cuts had negative guards, but no single positive list proving the exact runtime root value surface. | Added `expectedSlateReactRuntimeRootExports` and a root runtime `Object.keys(SlateReact).sort()` contract; focused React proof, package/site typechecks, and `bun check` passed. |
| 110 | update | public-api-contract-audit | Slate DOM root runtime export exactness audit | Slate DOM had grouped docs and negative guards, but no exact positive runtime root value list. | Added `expectedSlateDOMRuntimeRootExports` and a root runtime `Object.keys(SlateDOM).sort()` contract; focused DOM proof, package/site typechecks, and `bun check` passed. |
| 111 | update | public-api-contract-audit | Stable sibling root export exactness audit | History and Hyperscript package docs named root exports, but there was no exact runtime root value guard. | Added exact root runtime export guards to package README contracts for `slate-history` and `slate-hyperscript`; focused package-local tests, package/site typechecks, and `bun check` passed. |
| 112 | update | public-api-contract-audit | Slate Browser subpath runtime export exactness audit | After the Slate Browser root aggregate hard cut, exactness belongs on the remaining public subpaths. | Added exact runtime export guards for `core`, `browser`, `playwright`, and `transports` in the package core contract; focused Slate Browser core proof, package/site typechecks, and `bun check` passed. |
| 113 | update | public-api-contract-audit | Slate Layout root runtime export exactness audit | Slate Layout had an experimental proof-gated package contract, but no exact positive runtime list for its public root and React subpath. | Added exact runtime export guards for `slate-layout` and `slate-layout/react`; focused Slate Layout package proof, package/site typechecks, and `bun check` passed. |
| 114 | update | public-api-contract-audit | Package export-map drift audit | Existing subpath docs guard proved only selected package paths, so a surprise package export path could appear without failing proof. | Added an exact export-map contract for all seven Slate v2 packages; focused public-surface proof, package/site typechecks, and `bun check` passed. |
| 115 | update | public-api-contract-audit | Package export target-shape audit | Exact import paths still would not catch wrong target shape, accidental root `main` fields, or missing `types`/`import`/`default` entries. | Extended the exact package contract to assert `main`, `module`, `types`, and each export target object for all seven Slate v2 packages; focused public-surface proof, package/site typechecks, and `bun check` passed. |
| 116 | update | public-api-contract-audit, workflow-slowdown-review | Package build-entry target-match audit | Exact export target strings still would not prove that tsdown config/source entry ownership matches the target topology. | Added a source/config-backed guard that maps export targets to build entries, checks source entry files exist, and validates package-local vs shared tsdown build scripts; focused public-surface proof, package/site typechecks, and `bun check` passed after formatter-only repair. |
| 117 | update | public-api-contract-audit, workflow-slowdown-review | Public package import smoke | Export maps and build entries were guarded, but package-name resolution could still fail because of stale dist or target mismatch. | Added a package import smoke test for every allowed package/subpath and the negative `slate-browser` root import; package-local smoke, root package sweep, package/site typechecks, and `bun check` passed. |
| 118 | update | public-api-contract-audit, workflow-slowdown-review | Public import specifier allowlist audit | Public docs/examples could still teach invalid package paths even when package maps and smoke tests were correct. | Added a public docs/example import-specifier allowlist derived from exact package exports, excluding `/internal`; first broad scan was invalid and logged, then focused proof, package/site typechecks, and `bun check` passed after formatter-only repair. |
| 119 | update | public-api-contract-audit, workflow-slowdown-review | Package README duplicate-casing audit | A custom scan appeared to show both `README.md` and `Readme.md` per package, but that was a case-insensitive filesystem trap. | Added a directory-entry based guard that requires exactly one deliberate package README casing per Slate v2 package; focused public-surface proof, package/site typechecks, and `bun check` passed. |
| 120 | update/add | docs-api-drift-audit, public-api-contract-audit, queued-api-taste-round-27 | Docs proof-map package-DX guard coverage | New package export/import/README guards should be discoverable from the docs proof map, not only buried in test files. | Added proof-map row for package import paths, export targets, build entries, README casing, public docs/example import specifiers, and package import smoke; extended proof-map guard; focused proof, site/package typechecks, and `bun check` passed. |
| 121 | no-change | public-api-contract-audit, release-discipline | Post package-DX release-discipline rerun | Central package export/import/docs guards changed public-surface contracts, so hard-cut and release-discipline gates needed a rerun. | `bun test:release-discipline` passed 823 tests. This is private-alpha proof only, not a release/publish signal. |
| 122 | update | docs-api-drift-audit, public-api-contract-audit, workflow-slowdown-review | Public doc link target audit | A one-off markdown link scan falsely treated `[documentTitle.key]: 'Untitled'` inside a code block as a reference definition. | Patched the central markdown link oracle to strip fenced code and validate reference-style link definitions; focused proof and `bun check` passed after fixing a helper refactor mistake and one formatter-only wrap. |
| 123 | update | behavior-proof, visual-proof | Post API hard-cut stable behavior smoke | Many API/docs/oracle packets landed after the earlier behavior sweep; the supervisor should not rely on source tests alone. | Stable Chromium example smoke over richtext, plaintext, markdown shortcuts, hidden content, DOM coverage, editable voids, and placeholder passed 225 tests with 6 scoped skips. |
| 124 | update | behavior-proof, visual-proof | Post API cross-browser native-selection slice | Chromium passing is not enough for platform-risk selection rows. | Focused Firefox/WebKit native-selection slice passed 22 tests with 2 scoped Firefox skips for WebKit-only composition rows. |
| 125 | update | visual-proof, behavior-proof | Post API visual native-selection smoke | Selection can be model-correct but visibly wrong, especially double-highlight regressions. | Screenshot-backed visual/native selection smoke passed 27 tests across Chromium, Firefox, and WebKit. |
| 126 | update | huge-document-smoke, behavior-proof | Post API huge-document correctness smoke | Huge-document behavior was the historically fragile lane and needed fresh proof after API/docs/oracle packets. | Focused staged/virtualized huge-doc correctness smoke passed 15 tests across Chromium, Firefox, and WebKit. |
| 127 | update | huge-document-smoke, visual-proof | Post API huge-document visual/scrollbar slice | Prior huge-document failures were visible scrollbar, projection, autoscroll, and blank-gap selection bugs. | Focused huge-doc visual/scrollbar slice passed 14 tests with 1 scoped Firefox skip. |
| 128 | no-change | perf-packet, huge-document-smoke | Post API huge-document browser-trace metric smoke | Correctness and visual huge-doc proof were green, so a small metric smoke could check for obvious perf regressions. | 5k staged+virtualized browser trace stayed bounded: max type-to-paint p95 26.5ms, select-to-paint p95 55.9ms, click-to-paint p95 23.7ms, DOM p95 325, long tasks 0ms; no optimization packet opened. |
| 129 | update/add | beta-review-priority-list, queued-api-taste-round-28 | Beta review priority and taste queue refresh | The needs-your-attention table had more than five rows and scattered related hard cuts. | Capped review attention to five grouped items and queued Round 28 for package-DX strictness, `slate-layout` proof-gated posture, and beta review order. |
| 130 | update | beta-review-priority-list, public-api-contract-audit | Public API root export review anchor audit | Review attention should name focused proof commands so beta review can be targeted. | Added review-anchor proof commands and reran React surface, Slate Layout, public-surface, import-smoke, and release-discipline proofs green. |
| 131 | no-change | beta-review-priority-list, docs-api-drift-audit | Public example complexity triage refresh | User asked to prioritize example complexity review for beta readiness. | Line-count and API-shape triage found no patch need: pagination is alpha/deferred, huge-document is route-owned/proved, and normal examples use `useSlateEditor`. |
| 132 | no-change | docs-api-drift-audit | Public docs current-state wording rescan | Many docs and review tables changed, so latest-state wording needed a scoped rescan. | Scoped scan found only legitimate normalizing prose and token alias data; no public changelog/migration/compat/deprecated API wording patch needed. |
| 133 | no-change | current-tree/status, final-lint-check | Final fast gate after plan and oracle edits | Central markdown-link oracle changed and many proof packets ran after it. | `bun check` passed: lint, package/site/root typechecks, 1250 Bun tests, 49 Slate Layout tests, and 821 Slate React Vitest tests. |
| 134 | update/add | public-api-contract-audit, package-api-proof, workflow-slowdown-review | Public package TypeScript type-resolution smoke | Runtime package import smoke existed, but a TypeScript-only consumer proof for all public package/subpath import types was missing. | Added `test/public-package-types-smoke.ts` and `test/tsconfig.public-package-types.json`, wired it into `packages/slate` typecheck, repaired JSX/type config and lint shape, then `bun --filter ./packages/slate typecheck` and `bun check` passed. |
| 135 | reopen/update/add | public-api-contract-audit, package-api-proof, workflow-slowdown-review, queued-api-taste-round-29 | Public package export/type resolution honesty repair | Loop 134 still inherited repo `paths`, so it proved source-path import types rather than package export/type metadata. | Overrode `paths` to `{}` in the smoke tsconfig; strict proof first failed because root devDependencies omitted `slate-layout`; added `slate-layout: workspace:*`, ran `bun install`, then strict `bunx tsc`, package typecheck, and `bun check` passed; queued Round 29 taste checkpoint. |
| 136 | update | docs-api-drift-audit, public-api-contract-audit | Package-DX proof-map type-smoke anchor | The docs proof map named package import smoke but not the new strict TypeScript export/type smoke, so reviewers would miss the stronger package-DX gate. | Added proof-map references to `public-package-types-smoke.ts` and `tsconfig.public-package-types.json`; public-surface contract, site typecheck, and `bun check` passed. |
| 137 | update | public-api-contract-audit, package-api-proof | Public package named declaration smoke | `typeof import('pkg')` proves packages resolve and declarations parse, but it does not prove named declaration exports used by docs/runtime smoke exist. | Added named declaration references for the public runtime import-smoke names across Slate, Slate DOM/internal, Slate React, Slate History, Slate Hyperscript, Slate Layout/react, and Slate Browser subpaths; strict `bunx tsc`, package typecheck, and `bun check` passed. |
| 138 | update | public-api-contract-audit, package-api-proof, workflow-slowdown-review | Slate Browser root negative type-resolution smoke | Runtime import smoke asserted `slate-browser` root import fails, but the TypeScript smoke did not assert the same subpath-only boundary. | Added a `@ts-expect-error` negative root import guard, repaired the unused type alias lint shape with an underscore prefix, then Slate package typecheck and `bun check` passed. |
| 139 | update | public-api-contract-audit, package-api-proof | Internal bridge runtime export exactness | `slate/internal` and `slate-dom/internal` are sibling-only bridges; smoke-testing a couple names would let bridge exports creep invisibly. | Added exact runtime export lists for both internal subpaths to `public-package-import-smoke.test.ts`; package-local smoke passed 15 tests / 27 expects and `bun check` passed. |
| 140 | update | public-api-contract-audit, package-api-proof, workflow-slowdown-review | Public package named type declaration smoke | Named runtime exports were covered, but package declaration files could still miss public type exports used by core docs, raw `Editable` expert props, hooks, overlays, DOM bridge, and layout APIs. | Added representative named type references to `public-package-types-smoke.ts`; first strict run failed because `slate-react` dist lacked `EditableDOMStrategyLayout`; rebuilt `slate-react`, then strict `bunx tsc`, Slate package typecheck, and `bun check` passed. |
| 143 | update/add | public-api-contract-audit, package-api-proof, workflow-slowdown-review, strict-public-package-declaration-gate | Strict public package declaration gate | The public package type smoke still used Bun ambient types and `skipLibCheck: true`; an ad-hoc `skipLibCheck: false` probe exposed duplicate Slate augmentation bundles across `slate-history`, `slate-react`, and `slate-layout/react`. | Added a declaration-build tsconfig that resolves package imports through built `dist` declarations, repaired `slate-react` inferred public type leaks, made the public package type smoke strict with Node/React types only, rebuilt package declarations, anchored the stricter gate in the docs proof map, and passed focused package/public-surface typechecks plus `bun check`. |
| 144 | update/add | package-declaration-build-order-clean-proof, package-api-proof, workflow-slowdown-review, queued-api-taste-round-30 | Clean package build proof after strict dts policy | Mapping dts imports to sibling package `dist` could have made the build order fragile. | Cleaned package artifacts with `bunx turbo --filter "./packages/*" clean`, rebuilt with `bun build:packages`, reran `bun check`, and queued Round 30 for the accepted build-policy/taste decision. |
| 145 | update/add | declaration-build-path-map-guard, package-api-proof | Declaration build path-map guard | `config/typescript/tsconfig.dts.json` was a new hand-maintained path map and could drift from package export `types` targets. | Added a public-surface contract that derives expected dts paths from `expectedPublicPackageExportTargets`; focused proof passed 781 tests and `bun check` passed. |
| 146 | update/add | public-api-no-alias-doc-wording-guard, docs-api-drift-audit, workflow-slowdown-review | Public docs no-alias wording guard | Slate DOM public docs/READMEs still described DOM primitive type names as aliases, and the first guard attempt was too broad for implementation code. | Changed public wording to "type names", split the guard so alias wording is banned in public Markdown only, and passed focused no-alias scan, public-surface contract, site typecheck, and `bun check`. |
| 147 | update/add | public-markdown-code-fence-parse-guard, docs-api-drift-audit, workflow-slowdown-review | Public Markdown code-fence parse guard | Public docs code fences could have invalid TSX while passing import/link scans. A probe found two Slate React provider snippets missing semicolon boundaries before top-level JSX. | Fixed the snippets, added a parser guard for public Markdown JS/TS fences, verified 319 fences parse with zero failures, and passed public-surface contract, site typecheck, and `bun check`. |
| 148 | update/add | public-predicate-unknown-input-hard-cut, public-api-contract-audit, docs-api-drift-audit, workflow-slowdown-review, queued-api-taste-round-32 | Public predicate input hard cut | Public checker APIs and docs still used `any` for untrusted values, which weakens beta DX and agent-facing signatures. | Changed core/DOM/history predicate inputs and docs to `unknown`, strengthened `isObject` as a type guard, added public-surface drift guards, rebuilt package declarations, ran strict public package type smoke, and passed `bun check`; queued Round 32 for payload-vs-predicate taste. |
| 149 | no-change | release-discipline, slate-browser-api-proof | Post API-hard-cut release discipline and slate-browser contract proof | Public API type changes and package declaration rebuilds could have broken hard-cut/release-discipline or slate-browser proof infrastructure. | `bun test:release-discipline` passed 985 tests; `bun --filter slate-browser test:core` passed 77 tests. No slate-browser patch needed because README/subpath proof is already explicit. |
| 150 | no-change | behavior-proof, post-predicate-hard-cut-stable-browser-slice | Stable behavior smoke after predicate hard cut | `isObject` and predicate source changed runtime code, so focused editor behavior proof was needed even though package tests were green. | Focused Chromium Playwright slice passed 4/4 for editable void child-root keyboard navigation, markdown shortcut undo/redo, plaintext undo caret restore, and richtext selected-delete undo. |
| 151 | update/add | public-package-unknown-predicate-type-smoke, package-api-proof | Public package unknown predicate type smoke | The predicate hard cut changed source and docs, but built declarations also need to prove package consumers see `unknown`, not `any`. | Added declaration-level `IsAny` / first-argument assertions for core, DOM, and history predicate inputs; strict public package type smoke, Slate package typecheck, public-surface contract, and `bun check` passed. |
| 141 | no-change | public-api-contract-audit, release-discipline | Post package-DX release-discipline rerun | Package-boundary oracles changed after the last release-discipline run, so hard-cut/public-field/escape-hatch/release-script guards needed a quick rerun. | `bun test:release-discipline` passed 823 tests. Private-alpha proof only; no release/publish authorization claim. |
| 142 | update | public-api-contract-audit, package-api-proof | Root workspace package link guard | Type smoke caught missing `slate-layout` root package resolution, but a stale local symlink could hide future root `package.json` drift. | Added public-surface guard that root `devDependencies` link every public Slate v2 package with `workspace:*`; focused public-surface passed 780 tests and `bun check` passed. |

Mutation rules:

- Add a checkpoint when a new failure, missing oracle, missing metric, API smell,
  visual proof gap, workflow slowdown, taste gap, or owner gap appears.
- Update a checkpoint when evidence changes its scope, priority, owner, command,
  exit rule, or proof surface.
- Split a checkpoint when it hides multiple owners or one prompt would become
  too large.
- Merge checkpoints when overlap confuses routing or two rows always close
  together.
- Retire or remove checkpoints that are stale, superseded, irrelevant,
  duplicated, or contradicted by current evidence. Record the reason in the
  mutation ledger.
- Reopen a closed checkpoint when new evidence invalidates its proof.
- Reprioritize after every loop. The next checkpoint is chosen from current
  evidence, not from the original row order.
- The supervisor is not stuck on this template or the initial prompt plan. The
  user's latest request, `vision`, and current source evidence outrank
  stale plan rows.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint extracted prompt requirements and queued questions. |
| `slate-auto` source rule read | yes | `.agents/skills/slate-auto/SKILL.md` read through line 1320. |
| `vision` read as checkpoint zero | yes | `.agents/skills/vision/SKILL.md` read through line 573. |
| Active goal checked or created | yes | `get_goal` returned null before plan creation; `create_goal` created active goal `019ec5d3-3735-7003-b139-6ad6c2e57546`. |
| Invocation mode and timebox recorded | yes | Beta-readiness loop; 10h minimum removed by user on 2026-06-15. |
| Dynamic checkpoint policy accepted | yes | Checkpoint mutation rules and supervision-mode row recorded. |
| Source of truth and allowed workspaces recorded | yes | Boundaries section filled. |
| Output budget strategy recorded | yes | Work checklist requires capped scans/artifacts; broad output forbidden. |
| Private-alpha release/PR boundary recorded | yes | Constraints and non-goals record no release/publish/PR/commit. |
| Browser proof strategy recorded | yes | Verification surface records in-app Browser/Playwright claim width. |
| Package/API proof strategy recorded | yes | Verification surface records source audit plus focused package/type tests. |
| Mobile/raw-device claim-width policy recorded | yes | Raw-device claims deferred by default; scoped proof only. |
| Skill repair authority and source-rule boundary recorded | yes | Boundaries and verification surface record `.agents/rules/**` + `pnpm install`. |

Work Checklist:

- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation. Evidence:
      checkpoint-zero extraction above.
- [x] Short objective, completion threshold, verification surface, constraints,
      boundaries, and blocked condition are concrete.
      Evidence: top-level plan sections filled.
- [x] Invocation mode, removed runtime/deadline, stop-question policy, remaining
      backlog ladder, and supervision-mode fallback are recorded. Evidence:
      Automation state and Stop Rules.
- [x] Checkpoint supervisor table has been reconciled at least once after the
      initial seed. Evidence: loop 0 mutation added API/docs/beta-review rows.
- [x] Each loop ends with a checkpoint mutation decision: add, update, split,
      merge, retire, remove, reopen, reprioritize, or no-change with reason.
      Evidence: checkpoint mutation ledger records loop mutations; final
      closeout mutates stale timebox/checklist/gate rows to beta-readiness
      closure.
- [x] Current-tree/status packet recorded before new runtime patches.
      Evidence: loop 15 `bun check` passed, and loop 16 records the next
      source-comment packet before another code/API packet opens.
- [x] Behavior proof packet recorded for every in-scope stable editor family or
      explicitly skipped/deferred with reason.
- [x] Visual/native selection proof packet recorded for browser-visible
      selection/editing risks or explicitly scoped.
- [x] Missing oracle packets are written, kept, reverted, quarantined, or
      deferred with owner and proof command.
      Evidence: package import/type smoke, exact export-map/build-entry guards,
      public docs import/no-alias/code-fence/link guards, Slate React surface
      contracts, Slate DOM package contracts, and slate-browser subpath/JSDoc
      contracts were kept with focused proof and full `bun check`.
- [x] Repeated browser proof patterns are promoted to `slate-browser` or queued
      with reason.
- [x] Mobile/raw-device proof is run or the claim width is explicitly limited;
      Playwright viewport proof is not recorded as raw-device proof.
- [x] Huge-document correctness smoke is run or deferred with owner and reason.
- [x] Perf packet runs only after correctness is green, or is marked N/A for
      this run.
- [x] Package/API hard cuts, aliases, exports, and docs/API consistency are
      audited when in scope.
- [x] Docs/north-star/rule consolidation is applied when a reusable decision is
      accepted, or marked N/A.
      Evidence: run-specific public API/DX decisions are consolidated in this
      plan and `.tmp/slate-v2/docs/general/docs-proof-map.md`; N/A for
      `.agents/rules/**` because no new recurring skill miss was found in the
      closeout pass.
- [x] Workflow slowdowns are logged and avoidable repeats are repaired in the
      owner skill/script/gate.
      Evidence: workflow slowdown ledger records command-shape misses,
      generated-output scans, formatter retries, stale dist/declaration
      artifacts, and package-local test path quirks with repair decisions.
- [x] Packet ledger contains one row per proof, bug fix, oracle, benchmark,
      docs, or skill packet.
      Evidence: packet ledger includes proof/API/docs/oracle/benchmark rows
      through the slate-browser direct-export JSDoc pass.
- [x] Changed list is current and includes only this run.
      Evidence: changed list below is grouped by code/API, tests/oracles,
      docs/examples, package boundaries, workflow, metrics, and
      reverted/quarantined packets.
- [x] Needs-your-attention list is ranked and capped at five items.
- [x] Stopping checkpoints are queued or marked none.
      Evidence: stopping checkpoints are the review-attention/taste rows below;
      no blocking question prevents beta-readiness review.
- [x] Autoreview/review gate is run for non-trivial implementation diffs or
      marked N/A with reason.
      Evidence: `.agents/skills/autoreview/scripts/autoreview --mode local`
      reported no accepted/actionable findings.
- [x] Agent-native review is run for `.agents/**`, commands, skills, hooks, or
      prompt/tooling changes, or marked N/A with reason.
      Evidence: N/A: this closeout pass did not change `.agents/**`, commands,
      skills, prompts, or user-action tooling; agent-native-reviewer skill was
      loaded earlier for the applicability check.
- [x] Output budget discipline is followed: broad scans are capped or written
      to artifacts instead of streamed. Evidence: after the noisy `site/out`
      scan miss, follow-up wording scans exclude generated output and use
      capped tool output.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands/artifacts named in this plan | Stable behavior, visual/native, huge-doc, package/API, slate-browser, release-discipline-private-alpha, strict package type smoke, declaration build, and `bun check` evidence recorded below. |
| Dynamic checkpoint reconciliation | yes | Prove the plan was updated from evidence and not frozen to the initial seed | User removed the 10h completion gate; final closeout changed stale timebox/pending rows to beta-readiness closure and kept taste rows queued only as review attention. |
| Workspace authority proof | yes | Record cwd/tool for each Slate v2, parent-docs, skill, browser, package, or benchmark proof | All runtime/package/browser commands are recorded with `.tmp/slate-v2` or package cwd; parent repo plan is the only parent-docs artifact touched in closeout. |
| Behavior gates | yes | Run focused stable behavior proof or record scoped defer rows | Chromium stable sweep passed 225 / 6 scoped skips; Firefox/WebKit native-selection slice passed 22 or 28 rows depending slice; focused post-API Chromium behavior rows passed 4/4. |
| Visual/native selection proof | yes | Record Browser/Playwright/native-selection evidence or scoped blocker | Visual/native smoke passed 27 desktop tests with screenshots and double-highlight assertions; huge-doc visual/scrollbar slice passed 14 tests / 1 scoped Firefox skip. |
| Missing oracle repair | yes | Add/verify/revert/quarantine oracle packets or record owner defer | Kept public-surface, Slate React surface, Slate DOM, package import/type smoke, markdown code-fence/link/no-alias, exact export-map/build-entry, and slate-browser direct-export/JSDoc guards. |
| `slate-browser` promotion | yes | Add/verify helper/API or record queue/defer reason | Existing proof helpers kept; package-scripts now guards `core`, `browser`, `playwright`, `transports`, direct Playwright value/type exports, transports, and direct export JSDoc. |
| Mobile/raw-device claim width | yes | Run raw-device proof or record that only scoped viewport/browser proof is available | Raw-device proof deferred by policy; no raw mobile claim made. |
| Huge-document correctness smoke | yes | Run focused huge-document behavior smoke or record owner defer | Correctness rows passed 15 tests; visual/scrollbar rows passed 14 tests / 1 scoped Firefox skip; browser trace passed with select-all/delete undo restore. |
| Package/API proof | yes | Source-audit and run package/type/test proof when package/API changed, otherwise N/A | Strict public package type smoke with `paths: {}` and `skipLibCheck: false`, runtime import smoke, package builds, source/docs export guards, and `bun check` passed. |
| Skill/rule sync | N/A | Run `pnpm install` and mirror audit when `.agents/rules/**` changed, otherwise N/A | No `.agents/rules/**` or generated skill mirror changed in this closeout pass. |
| Changed list / review attention / stopping checkpoints | yes | Fill final handoff ledgers from current packet evidence | Changed list, needs-your-attention, final handoff contract, and residual-risk rows are filled below. |
| Final lint/check | yes | Run scoped lint/check or record why no code changed | Latest recorded `.tmp/slate-v2` `bun check` passed after slate-browser direct-export/JSDoc and declaration proof. |
| Workflow slowdown review | yes | Log slow steps and repair avoidable recurring slowdown, otherwise N/A | Workflow slowdown ledger records command/path/output-budget pitfalls and repair decisions. |
| Agent-native review for agent/tooling changes | N/A | Load `agent-native-reviewer` and close accepted findings, or N/A | N/A: no `.agents/**`, command, skill, prompt, or user-action tooling changes in the final closeout pass. |
| Autoreview for non-trivial implementation changes | yes | Load `autoreview` and close accepted/actionable findings, or N/A for no implementation diff | `.agents/skills/autoreview/scripts/autoreview --mode local` returned clean: no accepted/actionable findings. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-14-slate-v2-public-api-taste-and-beta-readiness-10h.md` | Run after this final plan accounting patch. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | complete | prompt requirements, queued taste questions, timebox, stop rules, proof surfaces, boundaries, and dynamic checkpoint mutations recorded | status |
| Status and current-tree closure | complete | read recent plans, API hard-cut docs, state/tx decision, overlay decision, slate-browser API/proof docs, selection coverage, and live source/API surfaces without git status | gap scan |
| Gap scan and scenario matrix | complete | concrete gaps routed and closed across installing walkthrough, root hooks, transaction/API docs, no-alias policy, package-DX, browser proof, huge-doc proof, slate-browser JSDoc/API, and review-attention rows | behavior proof |
| Behavior proof | complete | Chromium stable examples passed: 225 passed / 6 scoped skips; Firefox/WebKit native-selection slice passed 28 / 2 scoped Firefox skips. | visual proof gap scan |
| Oracle repair | complete | Missing-oracle packets added source/docs/package/browser guards and passed focused proof plus `bun check`. | visual proof |
| Visual/native proof | complete | `visual-native-selection-smoke.test.ts` passed 27 desktop tests and attached focused screenshots for caret/highlight/void/inline/table selection proof | slate-browser promotion |
| slate-browser promotion | complete | Existing `slate-browser/playwright` helpers already provide screenshot attachment and selection-contract/double-highlight assertions; no duplicate helper added | mobile claim width |
| Mobile/raw-device claim width | complete | Raw mobile/device claims deferred by policy; viewport/mobile semantic rows are not counted as raw-device proof | huge-document smoke |
| Huge-document correctness smoke | complete | Focused huge-document correctness and visual/scrollbar rows passed across desktop projects, with one scoped Firefox blank-gap skip. | perf/API/docs as needed |
| Perf/API/docs/skill packets as needed | complete | API/docs/package-DX packets kept; browser-trace metric smoke green; skill/rule sync N/A because no source-rule change in final pass. | consolidation |
| Consolidation and review | complete | Final changed list, workflow slowdowns, needs-attention, residual risks, autoreview result, and queued taste checkpoints recorded. | final handoff |
| Final handoff and goal-plan check | complete | Final handoff contract filled; `check-complete` is the last mechanical gate before `update_goal`. | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| `bun --filter ./packages/slate-react test:vitest test/surface-contract.tsx` | slate-auto command selection | <1m | Script include only matches `test/**/*.test.{ts,tsx}`; `surface-contract.tsx` is a Bun-file contract. | No product evidence; command failed before tests ran. | Use `bun test ./packages/slate-react/test/surface-contract.tsx` for this file; recorded here. |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| slate-browser-firefox-double-click-proof-repair | 183 | slate-auto / slate-browser | Firefox intermittently failed the native word-selection row because the helper's double-click proof used `mouse.click({ clickCount: 2 })`; diagnostics showed native/model/displayed selection collapsed at offset 18 instead of selecting `text`. | `.tmp/slate-v2/packages/slate-browser/src/playwright/index.ts`; focused no-retry Firefox hammers; `bun --filter ./packages/slate-browser typecheck`; `bun --filter ./packages/slate-browser test:core`; cross-browser focused row. | Pre-patch Firefox 1/8 failed; timing-only patch still failed 1/24; final `mouse.dblclick()` repair passed Firefox 24/24 plus Chromium/WebKit 4/4 each. | keep | No further patch; rerun full gate only when requested or when another integration failure appears. |
| public-package-unknown-predicate-type-smoke | 151 | slate-auto / package API proof | Source/docs can say predicates accept unknown while built declarations still leak `any`. | `.tmp/slate-v2/packages/slate/test/public-package-types-smoke.ts`; strict package type smoke; Slate typecheck; public-surface contract; `bun check` | Package declaration/type proof, no browser surface. | keep | Continue timed supervision. |
| post-predicate-hard-cut-stable-browser-slice | 150 | slate-auto / slate-ar-stabilize | Runtime predicate boundary cleanup could regress stable editor behavior even if type/unit gates pass. | Focused Chromium Playwright grep across `richtext`, `plaintext`, `markdown-shortcuts`, and `editable-voids` | Chromium 4/4 passed: editable void child-root keyboard navigation, markdown shortcut undo/redo, plaintext undo caret restore, richtext selected-delete undo. | keep/no-change | Continue timed supervision. |
| post-api-hard-cut-release-discipline-and-browser-proof | 149 | slate-auto / release-discipline / slate-browser | Public API type hard cuts can silently break hard-cut release discipline or proof infrastructure contracts. | `bun test:release-discipline`; `bun --filter slate-browser test:core`; slate-browser README/subpath contract read | Release-discipline source contracts and slate-browser package/core contracts, no browser app surface. | keep/no-change | Continue timed supervision; do not call this release readiness. |
| public-predicate-unknown-input-hard-cut | 148 | slate-auto / API DX | Public guard/checker APIs still accepted `any` even though they validate untrusted values; docs repeated that weaker signature. | Core predicate source/docs, Slate DOM DOM guards, Slate History `isHistory`, `isObject`, public-surface guard, package declaration rebuild; focused package typechecks; strict package type smoke; `bun check` | Source/docs/type contract, no browser surface. | keep | Continue timed supervision; leave payload `any` APIs for explicit taste/API-design review. |
| public-markdown-code-fence-parse-guard | 147 | slate-auto / docs | Public docs snippets can have invalid TSX while link/import/code-word scans stay green. | `.tmp/slate-v2/docs/libraries/slate-react/slate.md`; `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; independent Node/TypeScript code-fence probe; `bun test ./packages/slate/test/public-surface-contract.ts`; `bun typecheck:site`; `bun check` | Source/docs syntax contract, no browser surface. | keep | Continue timed supervision; next packet should prefer API/doc proof with current review value. |
| public-api-no-alias-doc-wording-guard | 146 | slate-auto / docs | Public docs still used "alias" language for Slate DOM primitive type names, weakening the no-alias API taste. | `.tmp/slate-v2/docs/libraries/slate-dom.md`; `.tmp/slate-v2/packages/slate-dom/README.md`; `.tmp/slate-v2/packages/slate-dom/Readme.md`; `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; focused public docs scan; `bun test ./packages/slate/test/public-surface-contract.ts`; `bun typecheck:site`; `bun check` | Source/docs contract, no browser surface. | keep | Continue supervision-mode packet selection until beta readiness is proven. |
| initial-value-docs-clarity | 1 | slate-auto / docs | Installing walkthrough could still read as if `<Slate>` owns initial value at mount time. | `.tmp/slate-v2/docs/walkthroughs/01-installing-slate.md`; `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; `bun test ./packages/slate/test/public-surface-contract.ts`; `bun typecheck:site` | Source/docs contract, no browser surface. | keep | Continue API/docs audit. |
| use-slate-editor-front-door | 2 | slate-auto / docs | Front-door docs and setup page led with `createReactEditor` + `useState` even though examples and intended React DX use `useSlateEditor`. | `.tmp/slate-v2/docs/walkthroughs/01-installing-slate.md`; `.tmp/slate-v2/docs/libraries/slate-react/README.md`; `.tmp/slate-v2/docs/libraries/slate-react/react-editor-setup.md`; `.tmp/slate-v2/docs/libraries/slate-react/slate.md`; public surface contract; site typecheck | Source/docs contract, no browser surface. | keep | Continue API/docs consistency audit. |
| walkthrough-use-slate-editor-canonical | 3 | slate-auto / docs | Core walkthroughs after install still taught `useState(() => createReactEditor(...))`, making `useSlateEditor` look optional instead of canonical for React-owned editors. | `.tmp/slate-v2/docs/walkthroughs/02-adding-event-handlers.md`; `03-defining-custom-elements.md`; `04-applying-custom-formatting.md`; `05-executing-commands.md`; public surface contract; site typecheck | Source/docs contract, no browser surface. | keep | Audit `subscribe` / runtime hook docs next. |
| subscribe-commit-doc-split | 4 | slate-auto / docs | `<Slate>` docs listed operation replay under `editor.subscribe(...)`, weakening the intended split with `editor.subscribeCommit(...)`. | `.tmp/slate-v2/docs/libraries/slate-react/slate.md`; public surface contract; site typecheck | Source/docs contract, no browser surface. | keep | Audit runtime/root hook docs next. |
| runtime-root-hook-dense-docs | 5 | slate-auto / docs | Runtime/root hook docs listed names but did not document shared selector options, `readOnly`, `root`, `deps`, or command focus default. | `.tmp/slate-v2/docs/libraries/slate-react/hooks.md`; `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`; `bun test ./packages/slate-react/test/surface-contract.tsx`; `bun typecheck:site` | Source/docs contract, no browser surface. | keep | Continue public API/docs consistency audit. |
| stable-examples-chromium-behavior | 7 | slate-auto / slate-ar-stabilize | Stable/current features need real behavior proof after API/docs packets, not only package type/tests. | `bun run playwright playwright/integration/examples/richtext.test.ts playwright/integration/examples/plaintext.test.ts playwright/integration/examples/markdown-shortcuts.test.ts playwright/integration/examples/hidden-content-blocks.test.ts playwright/integration/examples/dom-coverage-boundaries.test.ts playwright/integration/examples/editable-voids.test.ts playwright/integration/examples/placeholder.test.ts --project=chromium` | Chromium: 225 passed, 6 scoped skips. Covered richtext, plaintext, markdown shortcuts, history/undo-redo, selection/navigation, editable voids, custom placeholder, hidden content, DOM coverage boundaries, IME, paste, copy/cut, toolbar, scrollable caret, triple-click, margin click, and generated gauntlets. | keep | Run Firefox/WebKit-focused behavior slice for browser-risk coverage. |
| firefox-webkit-native-selection-slice | 8 | slate-auto / slate-ar-stabilize | Desktop behavior proof should include non-Chromium native selection and WebKit composition quirks, but not rerun a broad soak. | `bun run playwright playwright/integration/examples/richtext.test.ts playwright/integration/examples/plaintext.test.ts playwright/integration/examples/hidden-content-blocks.test.ts playwright/integration/examples/editable-voids.test.ts playwright/integration/examples/placeholder.test.ts --project=firefox --project=webkit -g '...'` | Firefox/WebKit: 28 passed, 2 Firefox skips for WebKit-only compositionend rows. Covered vertical editable-void selection, hidden block vertical selection, placeholder native text exclusion, plaintext Shift+click/Shift+Arrow/undo, richtext ArrowDown+ArrowRight, line extension, triple-click, right-margin click, undo, and WebKit compositionend deletes. | keep | Scan visual-proof gaps and mobile/raw claim width. |
| desktop-visual-native-selection-smoke | 9 | slate-auto / slate-browser | Visible selection bugs like double highlight and stale caret need screenshot-backed proof, not only model/native selected-text assertions. | `bun run playwright playwright/integration/examples/visual-native-selection-smoke.test.ts --project=chromium --project=firefox --project=webkit` | 27 passed. Attached screenshots for collapsed caret, multi-leaf highlight, backward keyboard selection, placeholder caret, hidden DOM boundary drag/double-highlight, adjacent void image selection, inline triple-click, inline link drag, and table cell drag. | keep | Huge-document correctness smoke next; do not add duplicate slate-browser helper. |
| huge-document-desktop-correctness-smoke | 10 | slate-auto / slate-ar-stabilize | Huge documents are the riskiest prior behavior lane; smoke must cover staged + virtualized typing, Enter, paste, select-all/delete, undo, navigation, and scroll stability. | Chromium: `bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium -g <correctness rows>`; Firefox/WebKit: same rows with `--project=firefox --project=webkit` | Chromium 5 passed; Firefox/WebKit 10 passed. Covered staged middle-block edit/undo/Enter/scroll, staged+virtualized Shift up/down, staged+virtualized select-all delete typing undo, huge select-all paste undo restore, and virtualized 5k typing/undo/arrows/Enter/scroll. | keep | Add visual/scrollbar slice before perf. |
| huge-document-desktop-visual-scrollbar-slice | 11 | slate-auto / slate-ar-stabilize | Prior huge-doc regressions were visible: double/projection highlight, scrollbar/row stacking, drag buffering, autoscroll, and blank-gap selection. | Chromium: `bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium -g <visual/scrollbar rows>`; Firefox/WebKit: same rows with `--project=firefox --project=webkit` | Chromium 5 passed; Firefox/WebKit 9 passed / 1 scoped Firefox skip. Covered staged 10k repeated Shift+Down projected selection, virtualized row stacking, native scrollbar drag buffering before repaint, downward drag autoscroll, and blank-gap drag selection. | keep | Enter benchmark honesty/perf-gate scan; do not optimize without metric target. |
| huge-document-browser-trace-baseline | 12 | slate-auto / slate-ar-perf | After correctness is green, run an honest small metric packet before deciding whether optimization is needed. | `SLATE_BROWSER_TRACE_SKIP_BUILD=1 SLATE_BROWSER_TRACE_SURFACES=stagedActiveDOMGroup,virtualized SLATE_BROWSER_TRACE_BLOCKS=5000 SLATE_BROWSER_TRACE_ITERATIONS=2 SLATE_BROWSER_TRACE_TYPE_OPS=5 SLATE_BROWSER_TRACE_SELECT_ALL_DELETE=1 SLATE_BROWSER_TRACE_RUN_LABEL=slate-auto-2026-06-15-smoke bun run bench:react:huge-document:browser-trace:local` | Max p95: type-to-paint 26.8ms, select-to-paint 56.3ms, selection-ready 27ms, click-to-paint 23.7ms, interaction-sequence-to-paint 232.3ms, burst-to-paint/op 6.42ms, DOM nodes 331, heap 16.31MB, long-task max/total 0ms. Select-all delete follow-up: staged type-after-delete-to-paint 37.6ms, virtualized 36.4ms, undo restored=1 both. | keep | Public API alias/hard-cut audit next; no perf patch warranted by this smoke. |
| release-discipline-hard-cut-audit | 13 | slate-auto / hard-cut | Alias and escape-hatch hard cuts must be proven by the release discipline gate, not vibes. | First `bun test:release-discipline` failed on unclassified `packages/slate-browser/test/core/keyboard-oracle-audit.test.ts` fixture text `editor.selection`; patched `escape-hatch-inventory-contract.ts`; reran `bun test:release-discipline`; scanned public docs/source for alias/deprecated/migration prose. | 647 passed, 0 failed. Public docs/source scan found only legitimate code comments, token aliases, release-proof contract id, and slate-browser proof handles. | keep | Continue docs/readme beta review. |
| docs-readme-current-state-wording | 14 | slate-auto / docs | Public docs should describe the current API, not sound like a migration walkthrough or generated closeout. | Edited `docs/walkthroughs/06-saving-to-a-database.md` and `docs/walkthroughs/07-enabling-collaborative-editing.md`; ran `bun typecheck:site`; reran docs/package README wording scan for alias/deprecated/migration/old-new language. | Site typecheck passed. Wording scan returned no matches in audited docs/package READMEs. | keep | Run current-tree fast gate after all docs/test edits. |
| current-tree-fast-gate | 15 | slate-auto | Current edited tree must be coherent before opening another packet. | `bun check` | Passed: lint, all package/site/root typechecks, 1228 Bun tests / 91 skips, 48 slate-layout tests, and 810 slate-react Vitest tests. | keep | Public example DX scan next. |
| public-example-source-comment-dx | 16 | slate-auto | Beta review should not trip over sloppy generated comments or stale-sounding source wording even when the API is coherent. | `.tmp/slate-v2/site/pages/examples/[example].tsx`; `.tmp/slate-v2/packages/slate-react/src/components/editable.tsx`; `.tmp/slate-v2/packages/slate-react/src/editable/model-input-strategy.ts`; `.tmp/slate-v2/packages/slate-react/src/editable/native-input-strategy.ts`; `bun typecheck:site`; capped slop-word scan excluding `site/out` | Site typecheck passed. Slop-word scan returns only legitimate `dirty*` API/domain terms, a proof-audit forbidden-word regex, and a contract fixture string. | keep | Rerun `bun check`; then scan exported package/doc anchors. |
| post-example-fast-gate | 17 | slate-auto | The tree must stay coherent after source-comment cleanup before another package/docs packet opens. | `bun check` | Passed: lint, package/site/root typechecks, Bun package tests, slate-layout tests, and slate-react Vitest. | keep | Scan package export maps and docs anchors. |
| public-package-library-docs | 18 | slate-auto / docs | Public package exports should have an obvious docs navigation entry, not only npm package READMEs. | `.tmp/slate-v2/docs/libraries/slate.md`; `.tmp/slate-v2/docs/libraries/slate-dom.md`; `.tmp/slate-v2/docs/Summary.md`; `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; `bun test ./packages/slate/test/public-surface-contract.ts`; `bun typecheck:site`; wording scan | Focused public-surface contract passed 616 tests; site typecheck passed; new docs wording scan is clean. | keep | Audit `./internal` public subpaths. |
| internal-subpath-boundary-docs | 19 | slate-auto / package API | Public package exports include `./internal`, but apps should not treat those subpaths as public API. | `.tmp/slate-v2/docs/libraries/slate.md`; `.tmp/slate-v2/docs/libraries/slate-dom.md`; `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`; `bun test ./packages/slate/test/public-surface-contract.ts`; `bun typecheck:site`; `bun test ./packages/slate-react/test/surface-contract.tsx` | Public-surface passed 616 tests, site typecheck passed, Slate React surface contract passed 38 tests / 222 expects. | keep | Audit package peer/version coherence. |
| sibling-runtime-peer-floor-contract | 20 | slate-auto / package API | Any public sibling package importing `slate/internal` must require the matching runtime floor; otherwise package managers can install an incompatible core runtime. | `.tmp/slate-v2/packages/slate-history/package.json`; `.tmp/slate-v2/packages/slate-hyperscript/package.json`; `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; `bun test ./packages/slate/test/public-surface-contract.ts`; `bun typecheck:packages` | First contract run failed because the scan included package-local `node_modules`; after excluding `node_modules`, public-surface passed 618 tests and package typecheck passed. | keep | Scan public examples by complexity and beta review priority. |
| public-example-factory-exception-contract | 21 | slate-auto / example DX | Normal public examples should teach `useSlateEditor`; direct `createReactEditor` should not spread from benchmark/control surfaces. | `.tmp/slate-v2/site/examples/ts/huge-document.tsx`; `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; example smell scan; `bun test ./packages/slate/test/public-surface-contract.ts`; `bun typecheck:site` | Public-surface passed 619 tests; site typecheck passed; smell scan only finds the guarded `huge-document` direct factory. | keep | Scan docs proof map and beta review anchors. |
| docs-proof-map-current-api | 22 | slate-auto / docs | Docs proof map must represent the core package docs, DOM package docs, and current React-owned setup path. | `.tmp/slate-v2/docs/general/docs-proof-map.md`; `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; `bun test ./packages/slate/test/public-surface-contract.ts`; `bun typecheck:site` | Public-surface passed 620 tests; site typecheck passed. | keep | Run a full fast gate after package/docs/contracts edits. |
| post-package-docs-fast-gate | 23 | slate-auto | Current tree must be coherent after manifest/docs/contract edits. | `bun check` | Failed once on Biome wrapping in `public-surface-contract.ts`, then passed after applying exact format. | keep | Repair API Summary coverage. |
| api-summary-coverage-contract | 24 | slate-auto / docs | Every API leaf page should be visible in Summary navigation. | `.tmp/slate-v2/docs/Summary.md`; `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; `bun test ./packages/slate/test/public-surface-contract.ts`; `bun typecheck:site` | Public-surface passed 621 tests; site typecheck passed. | keep | Rerun release-discipline after public-surface edits. |
| release-discipline-rerun | 25 | slate-auto / hard-cut | Hard-cut and public-surface gates should be green after package/docs/contracts edits. | `bun test:release-discipline` | Passed 665 tests. | keep | Audit root export docs claims. |
| root-export-doc-claim-guard | 26 | slate-auto / package API | New package docs should not mention root exports that do not exist. | `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; `.tmp/slate-v2/packages/slate/src/index.ts`; `.tmp/slate-v2/packages/slate-dom/src/index.ts`; `bun test ./packages/slate/test/public-surface-contract.ts`; `bun typecheck:packages` | Public-surface passed 621 tests; package typecheck passed. | keep | Audit example `new` badges. |
| example-navigation-current-state-badges | 27 | slate-auto / example DX | Example navigation should not advertise stale `new` badges; only explicitly deferred/experimental surfaces get current-state labels. | `.tmp/slate-v2/site/constants/examples.ts`; `.tmp/slate-v2/site/components/ExampleLayout.tsx`; `.tmp/slate-v2/site/public/index.css`; `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; `.tmp/slate-v2/playwright/integration/examples/example-navigation.test.ts`; `bun test ./packages/slate/test/public-surface-contract.ts`; `bun typecheck:site`; `bun run playwright playwright/integration/examples/example-navigation.test.ts --project=chromium` | Public-surface passed 622 tests, site typecheck passed, and Chromium rendered-nav proof passed. The menu renders exactly one `Alpha` badge on Pagination, no `New` text, no `.example-badge-new`, and no badge on Comment Mode. | keep | Scan package README/public DX next. |
| slate-react-readme-runtime-hook-family | 28 | slate-auto / package DX | Package README should expose the approved runtime/root hook family, not only generic editor hooks. | `.tmp/slate-v2/packages/slate-react/README.md`; `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`; `bun test ./packages/slate-react/test/surface-contract.tsx`; `bun typecheck:packages` | Surface contract passed 39 tests / 230 expects; package typecheck passed 7 packages. | keep | Scan site docs crosslinks for the same hook-family path. |
| slate-react-docs-runtime-hook-crosslink | 29 | slate-auto / docs DX | Site docs landing page should route users to runtime/root hooks with the same clarity as package README. | `.tmp/slate-v2/docs/libraries/slate-react/README.md`; `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`; `bun test ./packages/slate-react/test/surface-contract.tsx`; `bun typecheck:site`; `bun typecheck:packages` | Surface contract passed 40 tests / 233 expects; site typecheck passed; package typecheck passed 7 packages. | keep | Scan public docs for stale state/write-language around `state` and `tx`. |
| public-package-readme-doc-guard | 30 | slate-auto / docs DX | Package READMEs should be protected by the same public documentation checks as site docs. | `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; first `bun test ./packages/slate/test/public-surface-contract.ts` failed on package changelog inclusion; narrowed scan to package `README.md`; reran `bun test ./packages/slate/test/public-surface-contract.ts`; `bun typecheck:packages` | Public-surface passed 637 tests; package typecheck passed 7 packages. | keep | Run a clean state/tx language scan over guarded docs. |
| public-state-tx-language-clean-scan | 31 | slate-auto / docs DX | The approved API posture is `editor.read(...)`, `editor.update(...)`, `state.*`, and `tx.*`; stale primitive writes and old React hook names should have zero public matches. | Targeted `rg` scans over `docs`, `packages/*/README.md`, and `site/examples/ts`, excluding generated/historical files; `bun test ./packages/slate/test/public-surface-contract.ts` | No stale direct-write/mutable-field/snapshot/old-hook matches; public-surface passed 637 tests. | keep | Audit browser proof coverage for visible examples. |
| example-browser-proof-orphan-audit | 32 | slate-auto / browser proof | Browser proof contracts should catch both missing route specs and orphan specs that are not route-, alias-, or utility-owned. | `.tmp/slate-v2/playwright/integration/examples/richtext.test.ts`; deleted `.tmp/slate-v2/playwright/integration/examples/select.test.ts`; `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; `bun test ./packages/slate/test/public-surface-contract.ts`; `bun run playwright playwright/integration/examples/richtext.test.ts --project=chromium -g "selects the current block on browser triple click"`; `bun typecheck:packages` | Public-surface passed 637 tests; focused richtext browser proof passed 1 Chromium test; package typecheck passed 7 packages. | keep | Audit utility specs for clear ownership/comments. |
| post-browser-proof-fast-gate | 33 | slate-auto | Current edited tree must be coherent after the README/docs/proof/contract packets. | First `bun check` failed on Biome formatting in `site/components/ExampleLayout.tsx`; applied formatter output; reran `bun check` | Passed lint, package/site/root typechecks, 1228 Bun tests / 91 skips, 48 slate-layout tests, and 812 slate-react Vitest tests. | keep | Audit proof-map coverage for new guard/doc surfaces. |
| public-docs-proof-map-coverage | 34 | slate-auto / docs DX | The proof map must tell reviewers where package README, hook-family, example navigation, visual screenshot, and browser coverage claims are guarded. | `.tmp/slate-v2/docs/general/docs-proof-map.md`; `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; `bun test ./packages/slate/test/public-surface-contract.ts`; `bun typecheck:site`; `bun typecheck:packages` | Public-surface passed 637 tests; site typecheck passed; package typecheck passed 7 packages. | keep | Audit public API export table/docs mismatch. |
| public-package-readme-export-claim-guard | 35 | slate-auto / package DX | Package READMEs should not claim unguarded root exports. | `.tmp/slate-v2/packages/slate-dom/README.md`; `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; `bun test ./packages/slate/test/public-surface-contract.ts`; `bun typecheck:packages` | Public-surface passed 637 tests; package typecheck passed 7 packages. | keep | Audit package subpath README coverage. |
| package-subpath-readme-boundary-guard | 36 | slate-auto / package DX | Exported package subpaths need visible README ownership. | `.tmp/slate-v2/packages/slate/README.md`; `.tmp/slate-v2/packages/slate-dom/README.md`; `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; `bun test ./packages/slate/test/public-surface-contract.ts`; `bun typecheck:packages` | Public-surface passed 638 tests; package typecheck passed 7 packages. | keep | Audit package quickstart/install shape. |
| root-readme-use-slate-editor-quickstart | 37 | slate-auto / docs DX | The repository README quickstart is the most visible API sample and must use the same React front door as the walkthroughs. | `.tmp/slate-v2/Readme.md`; `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; `bun test ./packages/slate/test/public-surface-contract.ts`; `bun typecheck:packages` | Public-surface passed 638 tests; package typecheck passed 7 packages. | keep | Audit root README package table. |
| root-readme-package-table-guard | 38 | slate-auto / docs DX | Root README package table should stay current and precise because it is likely the first public review surface. | `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; `bun test ./packages/slate/test/public-surface-contract.ts`; `bun typecheck:packages` | Public-surface passed 639 tests; package typecheck passed 7 packages. | keep | Run docs link and stale-wording gate after public README edits. |
| post-readme-release-discipline-rerun | 39 | slate-auto / hard-cut | Release-discipline should be rerun after public-surface contract changes. | `bun test:release-discipline` | Passed 683 tests. | keep | Run full fast gate after README/docs edits. |
| full-fast-gate-after-readme-docs | 40 | slate-auto / oracle repair | Current tree must be coherent after README/docs/public-surface guard edits, and package-local oracles must agree with package README claims. | `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; `.tmp/slate-v2/packages/slate-dom/test/public-surface-contract.ts`; `bun check` | First `bun check` failed on Biome wrapping in `public-surface-contract.ts`; second failed on stale Slate DOM package contract expecting `import { DOMCoverage }` while README imports `DOMCoverage, Hotkeys`; after both repairs, `bun check` passed: lint, package/site/root typechecks, 1228 Bun tests / 91 skips, 48 slate-layout tests, and 812 slate-react Vitest tests. | keep | Audit runtime/root hook names and docs taste next. |
| runtime-root-hook-name-hard-cut | 41 | slate-auto / API taste | `useSlateViewState` and `useSlateViewEffect` expose internal vocabulary; public callers pass roots and adjacent APIs are root-named. | `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-runtime.tsx`; `.tmp/slate-v2/packages/slate-react/src/index.ts`; `.tmp/slate-v2/packages/slate-react/Readme.md`; `.tmp/slate-v2/docs/libraries/slate-react/hooks.md`; `.tmp/slate-v2/docs/concepts/13-roots.md`; `.tmp/slate-v2/site/examples/ts/multi-root-document.tsx`; Slate React tests; public-surface guard; `bun test ./packages/slate/test/public-surface-contract.ts`; `cd packages/slate-react && bun test:vitest`; `bun typecheck:packages`; `bun typecheck:site` | Public-surface passed 639 tests, Slate React Vitest passed 59 files / 812 tests, all seven packages typechecked, and site typecheck passed. Old hook names remain only in negative assertions. | keep | Run full fast gate, then audit state-field hook names. |
| post-root-hook-rename-fast-gate | 42 | slate-auto | Full tree must stay coherent after a public root export hard cut. | `bun check` | First run failed on Biome import order/formatting only; rerun passed lint, package/site/root typechecks, 1228 Bun tests / 91 skips, 48 slate-layout tests, and 812 Slate React Vitest tests. | keep | Audit state-field hook names next. |
| state-field-hook-name-audit | 43 | slate-auto / API taste | `useStateFieldValue` / `useSetStateField` might look generic, but they directly mirror `defineStateField` and the docs already frame them as document state controls. | `.tmp/slate-v2/packages/slate-react/src/hooks/use-state-field.ts`; `.tmp/slate-v2/docs/libraries/slate-react/hooks.md`; `.tmp/slate-v2/docs/concepts/14-document-state.md`; `.tmp/slate-v2/docs/general/docs-proof-map.md`; `rg` source/docs audit | No source changes. Docs proof map already ties state fields to `defineStateField`, document persistence, `document-state` example, and state-field contracts. | keep/no-change | Audit `useEditor` / `useSlateEditor` naming collision next. |
| editor-context-hook-name-audit | 44 | slate-auto / API taste | `useEditor` and `useSlateEditor` are close, but one reads the current provider editor and the other creates an owned editor. | `.tmp/slate-v2/docs/libraries/slate-react/hooks.md`; `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`; `bun test ./packages/slate-react/test/surface-contract.tsx`; `bun typecheck:site` | Surface contract passed 40 tests / 240 expects, and site typecheck passed. | keep | Audit overlay hook names next. |
| projection-entry-hook-name-hard-cut | 45 | slate-auto / API taste | Public `useSlateProjections` was low-level and undocumented; the name did not say it returns projection entries for one runtime id. | `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-projection-entries.tsx`; `.tmp/slate-v2/packages/slate-react/src/index.ts`; `.tmp/slate-v2/packages/slate-react/src/components/editable-text.tsx`; `.tmp/slate-v2/docs/libraries/slate-react/hooks.md`; benchmark scripts; Slate React tests; `rg` old-name scan; `bun test ./packages/slate-react/test/surface-contract.tsx`; `bun typecheck:packages`; `bun typecheck:site`; `cd packages/slate-react && bun test:vitest` | Old name remains only in a negative export guard; public-surface passed 40 tests / 244 expects, packages typechecked, site typecheck passed, and Slate React Vitest passed 59 files / 812 tests. | keep | Run full fast gate, then audit history hook focus-policy names. |
| post-projection-entry-rename-fast-gate | 46 | slate-auto | Full tree must stay coherent after the projection-entry export hard cut. | `bun check` | First run failed on one benchmark line wrap; rerun passed lint, package/site/root typechecks, 1228 Bun tests / 91 skips, 48 slate-layout tests, and 812 Slate React Vitest tests. | keep | Audit history hook focus-policy names next. |
| history-focus-policy-value-hard-cut | 47 | slate-auto / API taste | History used `focusPolicy: 'preserve-dom'` while command callbacks used `focus: 'preserve'` for the same public idea. | `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-history.ts`; `.tmp/slate-v2/docs/libraries/slate-react/hooks.md`; `.tmp/slate-v2/site/examples/ts/multi-root-document.tsx`; `.tmp/slate-v2/packages/slate-react/test/use-slate-history.test.tsx`; `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`; old-value source/docs scan; `bun test ./packages/slate-react/test/surface-contract.tsx`; `bun typecheck:packages`; `bun typecheck:site`; `cd packages/slate-react && bun test:vitest` | Surface contract passed 40 tests / 246 expects; packages typechecked; site typecheck passed; Slate React Vitest passed 59 files / 812 tests; old `preserve-dom` value remains only in a negative guard. | keep | Run full fast gate, then audit Editable DOM strategy props. |
| post-history-focus-policy-fast-gate | 48 | slate-auto | Full tree must stay coherent after a public option-value hard cut. | `bun check` | Passed lint, package/site/root typechecks, 1228 Bun tests / 91 skips, 48 slate-layout tests, and 812 Slate React Vitest tests. | keep | Audit Editable DOM strategy props next. |
| editable-dom-strategy-layout-prop-hard-cut | 49 | slate-auto / API taste | Raw `Editable layout` sounded like generic product layout, but the prop only supplies DOM strategy virtualized layout items. | `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`; `.tmp/slate-v2/packages/slate-react/src/index.ts`; `.tmp/slate-v2/packages/slate-layout/src/react.tsx`; `.tmp/slate-v2/docs/libraries/slate-react/editable.md`; `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`; DOM strategy tests; pagination example call site; old-name scan; `bun test ./packages/slate-react/test/surface-contract.tsx`; `bun typecheck:packages`; `bun typecheck:site`; `cd packages/slate-react && bun test:vitest`; `bun --filter ./packages/slate-layout test` | Raw `Editable` old prop/type remain only in negative guards; `PagedEditable layout` remains as page-layout wrapper API; surface contract passed 40 tests / 252 expects; packages and site typechecked; Slate React Vitest passed 59 files / 812 tests; Slate Layout tests passed 48. | keep | Run full fast gate, then audit raw Editable event-handler props. |
| post-editable-dom-strategy-layout-fast-gate | 50 | slate-auto | Full tree must stay coherent after the raw Editable prop/type hard cut. | `bun check` | First run failed on formatter-only ordering after the hard cut; targeted Biome write fixed the touched files; rerun passed lint, package/site/root typechecks, 1228 Bun tests / 91 skips, 48 slate-layout tests, and 812 Slate React Vitest tests. | keep | Audit raw Editable event-handler props next. |
| editable-event-props-doc-contract | 51 | slate-auto / API docs | `onBeforeInput` and `onDOMBeforeInput` are both public props; docs should make the React event vs native `InputEvent` split unmistakable. | `.tmp/slate-v2/docs/libraries/slate-react/editable.md`; `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`; `bun test ./packages/slate-react/test/surface-contract.tsx`; `bun typecheck:site` | API names kept as-is; surface contract passed 40 tests / 255 expects; site typecheck passed. | keep | Run fast gate after docs/contract edit. |
| post-editable-event-props-fast-gate | 52 | slate-auto | Full tree must stay coherent after the event-prop docs contract edit. | `bun check` | Passed lint, package/site/root typechecks, 1228 Bun tests / 91 skips, 48 slate-layout tests, and 812 Slate React Vitest tests. | keep | Audit render-prop surface shape next. |
| render-prop-stale-interface-cleanup | 53 | slate-auto / API cleanup | `components/editable.tsx` exported stale render-prop interfaces that no root export used; keeping them made source truth ambiguous. | `.tmp/slate-v2/packages/slate-react/src/components/editable.tsx`; `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`; render-prop source audit; `bun test ./packages/slate-react/test/surface-contract.tsx`; `bun typecheck:packages` | Deleted duplicate old interfaces; current root render-prop types stay owned by `editable-text-blocks` / `editable-text`; surface contract passed 40 tests / 256 expects; packages typechecked. | keep | Run fast gate after source/test cleanup. |
| post-render-prop-stale-interface-fast-gate | 54 | slate-auto | Full tree must stay coherent after deleting stale render-prop interfaces. | `bun check` | First run failed on import formatting only; targeted Biome write fixed `editable.tsx`; rerun passed lint, package/site/root typechecks, 1228 Bun tests / 91 skips, 48 slate-layout tests, and 812 Slate React Vitest tests. | keep | Audit Slate provider projection props next. |
| provider-projection-widget-prop-boundary | 55 | slate-auto / API docs | `Slate` provider props should make clear that widgets are hook-owned, not provider-owned. | `.tmp/slate-v2/packages/slate-react/src/components/slate.tsx`; `.tmp/slate-v2/docs/libraries/slate-react/slate.md`; `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`; `bun test ./packages/slate-react/test/surface-contract.tsx`; `bun typecheck:site` | Kept `annotationStore` and `decorationSources`; added docs and type guard that `widgetStore` is not a `Slate` prop; surface contract passed 40 tests / 258 expects; site typecheck passed. | keep | Run fast gate after docs/contract update. |
| post-provider-projection-props-fast-gate | 56 | slate-auto | Full tree must stay coherent after provider projection docs/contract update. | `bun check` | Passed lint, package/site/root typechecks, 1228 Bun tests / 91 skips, 48 slate-layout tests, and 812 Slate React Vitest tests. | keep | Audit annotation/widget hook surface next. |
| annotation-widget-hook-surface-audit | 57 | slate-auto / API taste | Annotation/widget hook names could be over-abstract or provider-confusing after projection docs changes. | `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-annotation-store.tsx`; `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-annotations.tsx`; `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-widget-store.tsx`; `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-widgets.tsx`; `.tmp/slate-v2/docs/libraries/slate-react/hooks.md`; `.tmp/slate-v2/docs/libraries/slate-react/annotations.md`; `.tmp/slate-v2/packages/slate-react/src/index.ts`; `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx` | Names already separate store creation from reads: `useSlateAnnotationStore`, `useSlateAnnotations`, `useSlateAnnotation`, `useSlateWidgetStore`, `useSlateWidgets`, `useSlateWidget`. Annotation reads can default to provider store; widget reads require explicit store. | keep/no-change | Rerun hard-cut release discipline after accumulated API changes. |
| post-api-hard-cut-release-discipline-rerun | 58 | slate-auto / hard-cut | Accumulated public API hard cuts should pass release-discipline inventory and stale-alias guards. | `bun test:release-discipline` | Passed 683 tests. | keep | Run stale public-name scan for the new hard-cut names. |
| stale-public-name-scan-after-api-hard-cuts | 59 | slate-auto / hard-cut | New public hard cuts should not leave stale names in current public source/docs/examples. | `rg -n 'useSlateViewState|useSlateViewEffect|useSlateProjections|preserve-dom|EditableLayout|renderingStrategy|onRenderingStrategy|widgetStore' ...`; `rg -n '<Editable[^\\n>]*\\blayout=' ...` | Old names appear only in negative guards; `widgetStore` appears in legitimate hook-owned variable/docs/test examples; raw `<Editable layout=` has no current matches. | keep/no-change | Add proof-map anchors for the hard-cut surfaces. |
| docs-proof-map-api-hard-cut-anchors | 60 | slate-auto / docs DX | The docs proof map should point reviewers to the current hard-cut API proof owners. | `.tmp/slate-v2/docs/general/docs-proof-map.md`; `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; `bun test ./packages/slate/test/public-surface-contract.ts`; `bun typecheck:site` | Added proof-map rows for root terminology/projection-entry/focus-policy, raw Editable DOM strategy layout, and provider projection/widget-store boundary. Public-surface passed 639 tests; site typecheck passed. | keep | Audit Slate change and command surface next. |
| slate-change-callback-boundary | 61 | slate-auto / API docs | `SlateChange` should read as React callback detail, not a competing command or commit API. | `.tmp/slate-v2/docs/libraries/slate-react/slate.md`; `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`; `bun test ./packages/slate/test/public-surface-contract.ts`; `bun test ./packages/slate-react/test/surface-contract.tsx`; `bun typecheck:site`; `bun typecheck:packages` | Kept `SlateChange`; docs now say it is React callback detail for the provider root and direct infrastructure to `editor.subscribeCommit`. Public-surface passed 639 tests; Slate React surface passed 40 tests / 258 expects; site and package typechecks passed. | keep | Run fast gate after docs/test edits. |
| post-change-callback-boundary-fast-gate | 62 | slate-auto | Current tree must stay coherent after `SlateChange` docs/type guard edits. | `bun check` | First run failed on Biome wrapping in `surface-contract.tsx`; formatter applied; rerun passed lint, package/site/root typechecks, 1228 Bun tests / 91 skips, 48 slate-layout tests, and 812 Slate React Vitest tests. | keep | Audit public type export names next. |
| core-commit-alias-hard-cut | 63 | slate-auto / hard-cut | Core public types should not expose duplicate names for the same commit concept. | Core/React/history/layout source rewrite; `.tmp/slate-v2/docs/api/nodes/editor.md`; `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; `rg` old alias scan; `bun test ./packages/slate/test/public-surface-contract.ts`; `bun test:release-discipline`; `bun typecheck:packages`; `bun typecheck:site` | Removed `SnapshotChange`, `SnapshotChangeClass`, and `OperationClass` aliases; usage now imports `EditorCommit` / `EditorCommitClass`; editor docs show `SnapshotListener` and `(commit: EditorCommit) => void`. Public-surface passed 640 tests, release-discipline passed 684 tests, package/site typechecks passed, stale alias scan hits only negative guards. | keep | Run full fast gate after source-wide hard cut. |
| post-core-commit-alias-hard-cut-fast-gate | 64 | slate-auto | Full tree must stay coherent after source-wide public alias hard cut. | `bun check` | First run failed on import ordering only; Biome fixed 19 touched files; rerun passed lint, package/site/root typechecks, 1228 Bun tests / 91 skips, 48 slate-layout tests, and 812 Slate React Vitest tests. | keep | Continue public type export-name audit. |
| commit-listener-internal-alias-hard-cut | 65 | slate-auto / hard-cut | Internal commit subscriber code should not keep a one-line alias after the public commit aliases were removed. | `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts`; `.tmp/slate-v2/packages/slate/src/core/editor-runtime.ts`; `.tmp/slate-v2/packages/slate/src/core/public-state.ts`; `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; old alias scan; `bun test ./packages/slate/test/public-surface-contract.ts`; `bun typecheck:packages`; `bun typecheck:site`; `bun check` | Removed `CommitListener`, inlined `(commit: EditorCommit<V>) => void`, and added guard coverage. Old alias scan hits only negative guards; public-surface passed 640 tests; package/site typechecks passed; `bun check` passed. | keep | Continue public type export-name audit. |
| public-runtime-alias-hard-cut | 66 | slate-auto / hard-cut | Public and runtime internals still had pure one-name aliases that added no semantic shape. | `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts`; `.tmp/slate-v2/packages/slate/src/index.ts`; `.tmp/slate-v2/packages/slate-react/src/annotation-store.ts`; `.tmp/slate-v2/packages/slate-react/src/index.ts`; `.tmp/slate-v2/packages/slate-react/src/editable/runtime-android-engine.ts`; `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`; old alias scan; `bun test ./packages/slate/test/public-surface-contract.ts`; `bun test ./packages/slate-react/test/surface-contract.tsx`; `bun typecheck:packages`; `bun typecheck:site`; `bun check` | Removed `EditorApplyOperationsOptions`, `SlateAnnotationStoreRefreshOptions`, and `RuntimeAndroidInputManager`; usages now reference `EditorUpdateOptions`, `SlateAnnotationRefreshOptions`, and `AndroidInputManager` directly. Old-alias scan hits only negative guards; focused guards, package/site typechecks, and `bun check` passed. | keep | Continue public type export-name audit, but preserve Slate-compatible base aliases unless a stronger owner proves removal. |
| command-result-dom-coverage-alias-hard-cut | 67 | slate-auto / hard-cut | More pure aliases remained after loop 66: a boolean command-result wrapper and a self-boundary props wrapper. | `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts`; `.tmp/slate-v2/packages/slate/src/core/command-registry.ts`; `.tmp/slate-v2/packages/slate/src/core/editor-extension.ts`; `.tmp/slate-v2/packages/slate/src/core/transform-middleware.ts`; `.tmp/slate-v2/packages/slate-react/src/components/dom-coverage-boundary.tsx`; `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`; old alias scan; `bun test ./packages/slate/test/public-surface-contract.ts`; `bun test ./packages/slate-react/test/surface-contract.tsx`; `bun typecheck:packages`; `bun typecheck:site`; `bun check` | Removed `EditorCommandResult` and `DOMCoverageSelfBoundaryProps`; command middleware now returns literal `boolean`, self-boundary props use the private base props type directly, and old names hit only negative guards. Focused guards, package/site typechecks, and `bun check` passed. | keep | Continue public type export-name audit with owner-file replacements for primitive aliases. |
| root-editor-options-alias-hard-cut | 68 | slate-auto / hard-cut | Public hook option types should expose their shape directly instead of a hidden `Pick` over `EditorViewOptions`. | `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-runtime.tsx`; `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`; `bun test ./packages/slate-react/test/surface-contract.tsx`; `bun typecheck:packages`; `bun typecheck:site`; `bun check` | Replaced `UseSlateRootEditorOptions = Pick<EditorViewOptions, 'readOnly'>` with an explicit object containing `readOnly?: boolean`; React surface contract guards against the old `Pick`; focused guard, package/site typechecks, and `bun check` passed. | keep | Add durable pure-alias allowlist guard before more manual alias scanning. |
| pure-type-alias-allowlist-guard | 69 | slate-auto / hard-cut | Alias cleanup needs a durable fail-fast guard so new pure aliases require explicit classification. | `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; first focused guard failure; `bun test ./packages/slate/test/public-surface-contract.ts`; `bun check` | Added a pure-alias scanner allowlist over `packages/slate/src` and `packages/slate-react/src`; first run surfaced remaining generic node/text helper aliases, then passed 641 public-surface tests. `bun check` passed. | keep | Continue public type export-name audit; future aliases must be classified or cut. |
| internal-view-terminology-public-boundary-guard | 70 | slate-auto / API boundary | Internal view-selection/projection code may keep local `view` vocabulary, but public root exports should not expose it. | `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`; `bun test ./packages/slate-react/test/surface-contract.tsx`; `bun check` | Added a package-index guard against `SlateViewBoundary` and `useSlateViewSelection` leakage; focused guard passed 41 tests / 265 expects; `bun check` passed. | keep | Continue public API/docs audit. |
| operation-docs-replace-children-coverage | 71 | slate-auto / docs API | Operation docs must list every current operation subtype and check helper that source exposes. | `.tmp/slate-v2/docs/api/operations/README.md`; `.tmp/slate-v2/docs/api/operations/operation.md`; `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; `bun test ./packages/slate/test/public-surface-contract.ts`; `bun typecheck:site`; `bun check` | Added `ReplaceChildrenOperation` to operation subtype docs and BaseOperation docs; added missing OperationApi check helper docs for insert/merge/move/remove/replace/set/split operations; public-surface passed 642 tests, site typecheck passed, and `bun check` passed. | keep | Continue docs/API drift audit. |
| static-api-docs-source-parity | 72 | slate-auto / docs API | Static API docs should not drift from source interface methods. | `.tmp/slate-v2/docs/api/nodes/element.md`; `.tmp/slate-v2/docs/api/nodes/node.md`; `.tmp/slate-v2/docs/api/nodes/text.md`; `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; `bun test ./packages/slate/test/public-surface-contract.ts`; `bun typecheck:site`; `bun check` | Added missing Element, Node, and Text static method docs and a generic source-vs-doc method parity guard for Element/Node/Operation/Path/Point/Range/Text. Public-surface passed 643 tests, site typecheck passed, and `bun check` passed. | keep | Continue docs/API drift audit with method parity now automated. |
| slate-react-public-export-docs-coverage | 73 | slate-auto / docs API | Exported Slate React render primitives and helper hooks should be discoverable without reading `src/index.ts`. | `.tmp/slate-v2/docs/libraries/slate-react/README.md`; `.tmp/slate-v2/docs/libraries/slate-react/hooks.md`; `.tmp/slate-v2/packages/slate-react/README.md`; `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`; `bun test ./packages/slate-react/test/surface-contract.tsx`; `bun typecheck:packages`; `bun typecheck:site`; `bun check` | Added current-state docs for `SlateElement`, `SlateText`, `SlateLeaf`, `SlatePlaceholder`, `useSlateNodeRef`, `useDOMStrategyVirtualOffset`, `useSlateRangeDecorationSource`, and `SlateRangeDecorationSourceOptions`. React surface contract passed 42 tests / 283 expects; package/site typechecks and `bun check` passed. | keep | Continue export/docs drift audit, but avoid documenting every low-level metric/options type one by one. |
| projection-store-root-runtime-hard-cut | 74 | slate-auto / API hard cut | Low-level projection-store runtime values should not be app-facing root exports when public overlay APIs already exist. | `.tmp/slate-v2/packages/slate-react/src/index.ts`; `.tmp/slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx`; `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`; `.tmp/slate-v2/scripts/benchmarks/browser/react/rerender-breadth.tsx`; `bun test ./packages/slate-react/test/surface-contract.tsx`; `bun test ./packages/slate-react/test/projections-and-selection-contract.tsx`; `bun typecheck:packages`; `bun typecheck:site`; `bun check` | Removed `createSlateProjectionStore` and `isSlateSourceDirty` from root runtime exports, kept projection types exported for public option/source shapes, and retargeted internal proof/benchmark code to `src/projection-store`. Surface contract passed 43 tests / 285 expects, projection contract passed 25 tests / 98 expects, package/site typechecks passed, and `bun check` passed. | keep | Continue public export/docs drift audit. |
| text-rendering-root-runtime-hard-cut | 75 | slate-auto / API hard cut | Text-rendering internals should not be app-facing root exports, but the documented `EditableElement` shell should remain public. | `.tmp/slate-v2/packages/slate-react/src/index.ts`; `.tmp/slate-v2/packages/slate-react/test/primitives-contract.tsx`; `.tmp/slate-v2/packages/slate-react/test/render-profiler-contract.test.tsx`; `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`; `bun test ./packages/slate-react/test/surface-contract.tsx`; `bun test ./packages/slate-react/test/primitives-contract.tsx`; `bunx vitest run --config ./vitest.config.mjs test/render-profiler-contract.test.tsx`; `bun typecheck:packages`; `bun typecheck:site`; `bun check` | Removed `EditableText`, `TextString`, and `ZeroWidthString` from root runtime exports. Internal tests import component modules directly. Surface contract passed 44 tests / 288 expects, primitives contract passed 9 tests / 23 expects, render-profiler Vitest passed 2 tests, package/site typechecks passed, and `bun check` passed. | keep | Continue public export/docs drift audit. |
| overlay-store-constructor-root-runtime-hard-cut | 76 | slate-auto / API hard cut | Raw annotation/widget store constructors should not compete with hook-owned overlay APIs. | `.tmp/slate-v2/packages/slate-react/src/index.ts`; `.tmp/slate-v2/packages/slate-react/test/annotation-store-contract.tsx`; `.tmp/slate-v2/packages/slate-react/test/widget-layer-contract.tsx`; `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`; `bun test ./packages/slate-react/test/surface-contract.tsx`; `bun test ./packages/slate-react/test/annotation-store-contract.tsx`; `bun test ./packages/slate-react/test/widget-layer-contract.tsx`; `bun typecheck:packages`; `bun typecheck:site`; `bun check` | Removed `createSlateAnnotationStore` and `createSlateWidgetStore` from root runtime exports, kept annotation/widget types and hooks public, and retargeted internal tests to `src/annotation-store` / `src/widget-store`. Surface contract passed 45 tests / 290 expects, annotation-store contract passed 14 tests / 76 expects, widget contract passed 6 tests / 22 expects, package/site typechecks passed, and `bun check` passed. | keep | Continue public export/docs drift audit. |
| decoration-source-root-runtime-hard-cut | 77 | slate-auto / API hard cut | Raw decoration constructors/composer should not compete with hook-owned decoration APIs; default placeholder is internal renderer detail. | `.tmp/slate-v2/packages/slate-react/src/index.ts`; `.tmp/slate-v2/packages/slate-react/test/app-owned-customization.tsx`; `.tmp/slate-v2/packages/slate-react/test/dom-strategy-and-scroll.tsx`; `.tmp/slate-v2/packages/slate-react/test/projections-and-selection-contract.tsx`; `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`; `.tmp/slate-v2/scripts/benchmarks/browser/react/huge-document-overlays.tsx`; `bun test ./packages/slate-react/test/surface-contract.tsx`; `bun test ./packages/slate-react/test/projections-and-selection-contract.tsx`; `bun test ./packages/slate-react/test/app-owned-customization.tsx`; `bunx vitest run --config ./vitest.config.mjs test/dom-strategy-and-scroll.test.tsx`; `bun typecheck:packages`; `bun typecheck:site`; `bun check` | Removed `DefaultPlaceholder`, `composeDecorationSources`, `createDecorationSource`, and `createRangeDecorationSource` from root runtime exports, kept their public types plus `useSlateDecorationSource` / `useSlateRangeDecorationSource`, and kept `defaultScrollSelectionIntoView`. Surface contract passed 46 tests / 294 expects, projection contract passed 25 tests, app-owned customization passed 8 tests, DOM strategy wrapper passed 51 Vitest tests, package/site typechecks passed, and `bun check` passed. | keep | Continue public export/docs drift audit. |
| default-scroll-helper-docs-coverage | 78 | slate-auto / docs API | The one remaining low-level `slate-react` runtime helper kept public should be documented. | `.tmp/slate-v2/docs/libraries/slate-react/editable.md`; `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`; `bun test ./packages/slate-react/test/surface-contract.tsx`; `bun typecheck:packages`; `bun typecheck:site`; `bun check` | Documented `defaultScrollSelectionIntoView` as the default for `Editable.scrollSelectionIntoView` and as the helper to import when custom scrolling wraps the default behavior. Surface contract passed 46 tests / 295 expects, package/site typechecks passed, and `bun check` passed. | keep | Continue public export/docs drift audit. |
| root-type-export-docs-classification | 79 | slate-auto / docs API | Type exports should not silently grow undocumented API surface; grouped option/context/metrics types should be intentionally classified. | `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`; `bun test ./packages/slate-react/test/surface-contract.tsx`; `bun typecheck:packages`; `bun typecheck:site`; `bun check` | Added `documentedAsGroupedRootTypeExports` and a root type export parser/guard. Focused surface contract passed 47 tests / 296 expects, package/site typechecks passed, and `bun check` passed. | keep | Continue public export/docs drift audit. |
| slate-core-runtime-view-docs-coverage | 80 | slate-auto / docs API | Core multi-root runtime/view constructors are public sibling-runtime APIs and need current-state docs. | `.tmp/slate-v2/docs/libraries/slate.md`; `.tmp/slate-v2/packages/slate/README.md`; `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; `bun test ./packages/slate/test/public-surface-contract.ts`; `bun typecheck:packages`; `bun typecheck:site`; `bun check` | Added `createEditorRuntime` / `createEditorView` docs in Slate library docs and package README. Public-surface passed 643 tests, package/site typechecks passed, and `bun check` passed. | keep | Continue public export/docs drift audit. |
| slate-dom-grouped-root-utility-docs | 81 | slate-auto / docs API | Slate DOM root utility exports should be discoverable by group without forcing users to read `src/index.ts`. | `.tmp/slate-v2/docs/libraries/slate-dom.md`; `.tmp/slate-v2/packages/slate-dom/README.md`; `.tmp/slate-v2/packages/slate-dom/test/public-surface-contract.ts`; `bun test ./packages/slate-dom/test/public-surface-contract.ts`; `bun typecheck:packages`; `bun typecheck:site`; `bun check` | Added grouped docs for DOM bridge, DOM coverage, keyboard/click, DOM utilities, text-diff utilities, environment flags, decoration helpers, and `SlateDOMResolutionError`; Slate DOM public-surface passed 14 tests, package/site typechecks passed, and `bun check` passed. | keep | Continue package export/docs drift audit. |
| stable-package-readme-export-docs | 82 | slate-auto / docs API | Stable small package READMEs should name their complete intentional root surfaces. | `.tmp/slate-v2/packages/slate-history/README.md`; `.tmp/slate-v2/packages/slate-history/test/package-readme-contract.test.ts`; `.tmp/slate-v2/packages/slate-hyperscript/README.md`; `.tmp/slate-v2/docs/libraries/slate-hyperscript.md`; `.tmp/slate-v2/packages/slate-hyperscript/test/package-readme-contract.test.ts`; `bun test ./packages/slate-history/test ./packages/slate-hyperscript/test`; `bun typecheck:packages`; `bun typecheck:site`; `bun check` | Added History validator and hyperscript creator docs plus package-local README guards. Package-directory proof passed 48 tests across 2 files; package/site typechecks passed; `bun check` passed with 1231 Bun tests / 91 skips across 26 files, 48 slate-layout tests, and 819 Slate React Vitest tests. | keep | Continue package export/docs drift audit. |
| slate-browser-root-alias-hard-cut | 83 | slate-auto / API hard cut | The root `slate-browser` entrypoint was an aggregate alias over owned subpaths. | `.tmp/slate-v2/packages/slate-browser/package.json`; `.tmp/slate-v2/packages/slate-browser/tsdown.config.mts`; `.tmp/slate-v2/config/typescript/tsconfig.json`; `.tmp/slate-v2/site/tsconfig.json`; `.tmp/slate-v2/packages/slate-browser/test/core/package-scripts.test.ts`; `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; no-root-import scan; `bun test ./packages/slate/test/public-surface-contract.ts`; `bun --filter slate-browser test:core`; `bun --filter slate-browser build`; `bun typecheck:packages`; `bun typecheck:site`; `bun typecheck:root`; `bun check` | Removed root `.` export/main/module/types/build/path mappings and deleted `src/index.ts`. Public-surface passed 643 tests, Slate Browser core passed 75 tests, build/typechecks passed, and `bun check` passed with 1232 Bun tests / 91 skips, 48 slate-layout tests, and 819 Slate React Vitest tests. | keep | Continue package export/docs drift audit. |
| sibling-package-pure-alias-hard-cut | 84 | slate-auto / API hard cut | Sibling packages still had exported pure aliases after core/React cleanup. | `.tmp/slate-v2/packages/slate-browser/src/core/proof.ts`; `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-editor.ts`; `.tmp/slate-v2/packages/slate-layout/src/index.ts`; `.tmp/slate-v2/packages/slate-layout/src/react.tsx`; `.tmp/slate-v2/packages/slate-layout/test/page-layout-contract.test.ts`; sibling alias scanner; `bun --filter slate-browser test:core`; `bun --filter ./packages/slate-layout test`; `bun test ./packages/slate-dom/test/public-surface-contract.ts`; `bun typecheck:packages`; `bun check` | Converted Slate Browser proof result aliases into explicit exported shapes, replaced `evaluatePlaceholderInput` value alias with a wrapper, converted `DOMApi` / `DOMClipboardApi` into interfaces, removed `SlateLayout`, `SlateLayoutSnapshot`, and `PagedEditablePageLayoutMode`, and updated consumers to `SlatePageLayout*` names. Sibling alias scanner reports no pure aliases; focused proofs, package typecheck, and `bun check` passed. | keep | Continue public API/docs drift audit. |
| all-package-pure-alias-guard | 85 | slate-auto / oracle repair | Alias cleanup should fail on any Slate v2 package source folder, not only core and React. | `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; `bun test ./packages/slate/test/public-surface-contract.ts`; `bun typecheck:packages`; `bun check` | Widened the pure-alias guard to scan `slate-browser`, `slate-dom`, `slate-history`, `slate-hyperscript`, and `slate-layout` source folders. Public-surface passed 643 tests, packages typechecked, and `bun check` passed. | keep | Continue public API/docs drift audit. |
| scoped-latest-state-public-docs-wording-audit | 86 | slate-auto / docs API | The previous broad wording scan was noisy and included parent repo docs plus generated/run artifacts; latest-state docs audit needs owner-scoped proof. | `rg -n -i <latest-state wording pattern> docs/libraries docs/api docs/concepts docs/walkthroughs docs/general packages/*/README.md Readme.md --count`; focused reads of `docs/concepts/08-plugins.md` and `docs/concepts/11-normalizing.md` | Count-first scan returned only `docs/concepts/08-plugins.md:1` and `docs/concepts/11-normalizing.md:3`; focused reads show legitimate domain prose about removing extensions/nodes/properties, not changelog/migration/API alias wording. | keep no-change | Continue public export/docs type drift audit with scoped commands only. |
| slate-browser-subpath-readme-proof-api-contract | 87 | slate-auto / docs API | After the root `slate-browser` alias was removed, the package README should make each kept subpath's proof API explicit enough for agents. | `.tmp/slate-v2/packages/slate-browser/README.md`; `.tmp/slate-v2/packages/slate-browser/test/core/package-scripts.test.ts`; `bun --filter slate-browser test:core`; `bun check` | README now names core selection serializers, IME/placeholder classifiers, release-proof artifact helpers, first-party parity contracts, plugin proof contracts, debug snapshot parsers, browser DOM selection snapshots, and zero-width inspection. Focused core suite passed 76 tests after one assertion correction; `bun check` passed. | keep | Continue public export/docs type drift audit; do not expand `slate-layout`/pagination docs unless explicitly routed. |
| slate-dom-public-type-group-docs | 88 | slate-auto / docs API | `slate-dom` root docs should anchor public type groups for framework/runtime authors without becoming a generated type dump. | `.tmp/slate-v2/packages/slate-dom/README.md`; `.tmp/slate-v2/docs/libraries/slate-dom.md`; `.tmp/slate-v2/packages/slate-dom/test/public-surface-contract.ts`; `bun test ./packages/slate-dom/test/public-surface-contract.ts && bun typecheck:site`; `bun check` | Package/site docs now group DOM bridge API types, DOM coverage policies/results, DOM primitive aliases, hotkey types, and text-diff types. Slate DOM public-surface passed 14 tests, site typecheck passed, and `bun check` passed. | keep | Continue API/docs drift audit; keep app-facing Slate DOM docs routed through Slate React by default. |
| slate-core-public-type-group-docs | 89 | slate-auto / docs API | `slate` root docs should anchor advanced public type groups without turning the core library docs into a generated export dump. | `.tmp/slate-v2/packages/slate/README.md`; `.tmp/slate-v2/docs/libraries/slate.md`; `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; `bun test ./packages/slate/test/public-surface-contract.ts && bun typecheck:site`; `bun check` | Package/site docs now group editor/value/root identity, runtime/view/snapshot/commit, read/update, extension/schema, middleware, and debug type families. Public-surface passed 643 tests, site typecheck passed, and `bun check` passed. | keep | Continue API/docs drift audit; do not document every low-level core type one by one. |
| post-type-docs-release-discipline-rerun | 90 | slate-auto / release discipline | Release-discipline should stay green after the public type/docs packets, but it is not a release signal in private alpha. | `bun test:release-discipline` | Passed 687 tests across public-surface, hard-cut, escape-hatch, write-boundary, leaf lifecycle, selection rebase, compat alias, editor foundation, benchmark/release script, and rendered DOM shape contracts. | keep no-change | Continue beta-review surface gap scan. |
| projection-store-public-summary-wording-hard-cut | 91 | slate-auto / docs API | Public summaries should not advertise raw projection stores after raw projection-store constructors were cut from public root exports. | `.tmp/slate-v2/Readme.md`; `.tmp/slate-v2/packages/slate-react/README.md`; `.tmp/slate-v2/docs/libraries/slate-react/README.md`; `.tmp/slate-v2/docs/walkthroughs/09-performance.md`; `.tmp/slate-v2/docs/libraries/slate-react/hooks.md`; `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; projection-store wording scan; `bun test ./packages/slate/test/public-surface-contract.ts ./packages/slate-react/test/surface-contract.tsx && bun typecheck:site`; `bun check` | Public front-door docs now say projection infrastructure, projection sources, or decoration sources. Wording scan hits only internal/negative guard tests. Focused public-surface/Slate React proof passed 690 tests, site typecheck passed, and `bun check` passed. | keep | Continue beta-review surface gap scan. |
| hard-cut-symbol-leakage-classification-scan | 92 | slate-auto / docs API | Recent hard-cut symbols should not leak into public docs/examples, but internal implementation owners and negative guards may keep exact names. | scoped `rg` for `useSlateViewState`, `useSlateProjections`, `preserve-dom`, raw store constructors, text rendering internals, commit aliases, and smaller alias names across public docs/source, excluding generated artifacts and tests where possible | No public docs/examples leak found. Remaining hits are implementation definitions/calls, benchmark scripts importing internal modules, historical changelogs, or negative/public-surface guard tests. | keep no-change | Continue beta-review surface gap scan. |
| react-rendering-doc-use-slate-editor-cleanup | 93 | slate-auto / docs API | Normal React-owned rendering docs should not teach direct editor factory state when `useSlateEditor` is the front door. | `.tmp/slate-v2/docs/concepts/09-rendering.md`; `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`; `bun test ./packages/slate-react/test/surface-contract.tsx && bun typecheck:site`; `bun check` | Rendering docs now import and use `useSlateEditor({ initialValue })`; the React surface contract rejects `createReactEditor` and `useState(() => ...)` in this concept doc. Focused proof, site typecheck, and `bun check` passed. | keep | Continue scanning normal docs for raw factory leakage while preserving low-level setup/reference exceptions. |
| history-setup-doc-use-slate-editor-cleanup | 94 | slate-auto / docs API | React history setup docs should show `useSlateEditor` for extension overrides, while core setup can still show `createEditor`. | `.tmp/slate-v2/docs/libraries/slate-history/history-extension-setup.md`; `.tmp/slate-v2/packages/slate-history/test/history-contract.ts`; normal-doc raw-factory scan excluding low-level React editor setup/reference pages; `bun test ./packages/slate-history/test/history-contract.ts ./packages/slate-react/test/surface-contract.tsx && bun typecheck:site`; `bun check` | The React snippet now uses `useSlateEditor({ extensions: [history({ enabled: false })], initialValue })`; the core snippet still uses `createEditor`. Normal docs scan found no direct `createReactEditor` / `useState` factory usage outside the explicit low-level React editor setup/reference pages. Focused history + React contracts, site typecheck, and `bun check` passed. | keep | Continue public export/docs type drift audit. |
| slate-history-package-readme-react-front-door-cleanup | 95 | slate-auto / docs API | Public package README still named `createReactEditor` as the default history installer after React-owned docs moved to `useSlateEditor`. | `.tmp/slate-v2/packages/slate-history/Readme.md`; `.tmp/slate-v2/packages/slate-history/test/package-readme-contract.test.ts`; `cd packages/slate-history && bun test ./test/package-readme-contract.test.ts && cd ../.. && bun typecheck:site`; `bun check` | Package README now says `useSlateEditor` installs history by default for Slate React editors; the package README contract rejects `createReactEditor`. Focused package proof, site typecheck, and `bun check` passed. | keep | Continue public export/docs type drift audit. |
| typescript-concept-use-slate-editor-cleanup | 96 | slate-auto / docs API | TypeScript concept docs still used `createReactEditor` and `useState` as the React value-generic example, making the low-level factory look like normal app setup. | `.tmp/slate-v2/docs/concepts/12-typescript.md`; `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`; scoped stale factory scan; `bun test ./packages/slate-react/test/surface-contract.tsx && bun typecheck:site`; `bun check` | TypeScript docs now use `useSlateEditor<CustomValue>` for React editor generics and annotated initial values. React surface contract rejects `createReactEditor` and `useState(() => ...)` in the concept page. Scoped scan leaves only Slate React owner/reference docs and explicit outside-React factory guidance. Focused proof, site typecheck, and `bun check` passed. | keep | Continue public export/docs drift audit. |
| slate-react-readme-factory-classification | 97 | slate-auto / docs API | Slate React README should keep `createReactEditor` findable but classify it as lower-level so Start Here remains `useSlateEditor` / `Slate` / `Editable`. | `.tmp/slate-v2/packages/slate-react/Readme.md`; `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`; `bun test ./packages/slate-react/test/surface-contract.tsx && bun typecheck:site`; `bun check` | Package README now says `createReactEditor` is the lower-level factory for outside React component ownership or same-lifetime custom hooks. React surface contract guards the classification. Focused proof, site typecheck, and `bun check` passed. | keep | Continue public export/docs drift audit. |
| package-readme-case-sensitive-proof-repair | 98 | slate-auto / oracle repair | Package README proof read wrong-cased paths for `Readme.md` packages, and central public-doc scans collected only `README.md`. | `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`; `.tmp/slate-v2/packages/slate-history/test/package-readme-contract.test.ts`; `.tmp/slate-v2/packages/slate-hyperscript/test/package-readme-contract.test.ts`; `.tmp/slate-v2/docs/general/docs-proof-map.md`; focused public-surface/React/History/Hyperscript proof; `bun check` | Tests now read `packages/slate/Readme.md`, `packages/slate-react/Readme.md`, `packages/slate-history/Readme.md`, and `packages/slate-hyperscript/Readme.md` with exact casing. Central public-doc collection includes both README casing styles. Proof map uses exact paths and says projection infrastructure. Focused proof and `bun check` passed. | keep | Continue public export/docs drift audit. |
| transaction-transform-docs-source-backed-options | 99 | slate-auto / docs API | Transform docs were too abstract and had at least one false option set: `tx.fragment.delete` documented `hanging` and `voids`, but source only exposes `at` and `direction`. | `.tmp/slate-v2/docs/api/transforms.md`; `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; `bun test ./packages/slate/test/public-surface-contract.ts && bun typecheck:site`; `bun check` | Docs now list source-backed options for node, fragment, text, and selection transaction methods, document break/deleteBackward/deleteForward helpers, and guard option tokens against owner source files. Focused proof passed 664 tests plus site typecheck; `bun check` passed. | keep | Audit and cut `tx.nodes.insertMany` if it is only an alias. |
| tx-nodes-insert-many-alias-hard-cut | 100 | slate-auto / hard-cut | The transaction surface exposed both `tx.nodes.insert` and `tx.nodes.insertMany` for the same one-or-many node insertion semantics. | `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts`; `.tmp/slate-v2/packages/slate/src/core/public-state.ts`; `.tmp/slate-v2/packages/slate/src/editor-runtime-view.ts`; `.tmp/slate-v2/site/examples/ts/pagination.tsx`; `.tmp/slate-v2/packages/slate/test/editor-runtime-view-contract.ts`; `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; focused proof/typechecks; scoped alias scan; `bun check` | `insertMany` is removed from transaction types/runtime/view wrappers and public examples. `tx.nodes.insert` now owns single and multi-node insertion. Public-surface guard rejects alias leaks in transaction source plus docs/examples. Focused proof passed 718 tests; package/site typechecks and `bun check` passed; scoped alias scan returned zero matches. | keep | Audit full transaction docs completeness next. |
| transaction-api-docs-completeness-audit | 101 | slate-auto / docs API | `docs/api/transforms.md` should act as the current transaction-helper reference, but it omitted full-document/root/state-field/normalization write groups. | `.tmp/slate-v2/docs/api/transforms.md`; `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; `bun test ./packages/slate/test/public-surface-contract.ts && bun typecheck:site`; `bun check` | Docs now cover `tx.value.replace`, `tx.roots.create/replace/delete`, `tx.setField`, `tx.statePatches.replay`, `tx.normalize`, and `tx.withoutNormalizing`. The contract checks each core transaction method against source. Focused proof passed 666 tests plus site typecheck; `bun check` passed. | keep | Audit cross-page public API consistency next. |
| public-api-docs-cross-page-consistency-audit | 102 | slate-auto / docs API | The concept transform overview should not contradict or undercut the complete transaction API reference. | `.tmp/slate-v2/docs/concepts/04-transforms.md`; `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; `bun test ./packages/slate/test/public-surface-contract.ts && bun typecheck:site`; `bun check` | Concept docs now list fragment, break, value/root, state-field/state-patch, and normalization transaction groups and link to `docs/api/transforms.md`. Public-surface guard covers those anchors. Focused proof passed 666 tests plus site typecheck; `bun check` passed. | keep | Audit public extension API docs next. |
| public-extension-api-docs-surface-audit | 103 | slate-auto / docs API | Core package docs should expose the same root authoring helper set that the package exports. | `.tmp/slate-v2/docs/libraries/slate.md`; `.tmp/slate-v2/packages/slate/Readme.md`; `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; `bun test ./packages/slate/test/public-surface-contract.ts && bun typecheck:site`; `bun check` | Package and library docs now import `defineEditorExtension`, `defineStateField`, and `elementProperty` together. Public-surface guard checks docs and root exports. Focused proof passed 666 tests plus site typecheck; `bun check` passed. | keep | Audit extension type export docs next. |
| public-extension-type-export-docs-audit | 104 | slate-auto / docs API | Core package docs should not hide public extension/schema/middleware type families that framework and extension authors need to understand. | `.tmp/slate-v2/docs/libraries/slate.md`; `.tmp/slate-v2/packages/slate/Readme.md`; `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; `bun test ./packages/slate/test/public-surface-contract.ts && bun typecheck:site`; `bun check` | Package and library docs now group extension inputs/setup outputs/runtime state/groups/operations, element behavior/content-root/property/void metadata, state-field value input, transform/query middleware maps/results, and operation apply handlers. Focused proof passed 666 tests plus site typecheck; `bun check` passed. | keep | Add a root type-export coverage contract so docs/classification cannot drift from `packages/slate/src/index.ts`. |
| public-root-type-export-coverage-contract | 105 | slate-auto / docs API | Root editor type exports should be source-backed: every explicit `./interfaces/editor` type export must be documented or deliberately classified. | `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; `.tmp/slate-v2/packages/slate/src/index.ts`; `bun test ./packages/slate/test/public-surface-contract.ts && bun typecheck:site`; `bun check` | The contract now parses `packages/slate/src/index.ts`, checks docs coverage, and requires a reason for every deliberately grouped low-level type. Focused proof passed 667 tests plus site typecheck; `bun check` passed after one formatter repair. | keep | Audit root value export coverage next. |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| public API docs | Slate React installing walkthrough / `slate` public-surface contract | `bun test ./packages/slate/test/public-surface-contract.ts` | N/A | passed 601 tests | Site typecheck passed; continue source/docs audit. |
| public API docs | Slate React front-door docs / `slate` public-surface contract | `bun test ./packages/slate/test/public-surface-contract.ts` | N/A | passed 601 tests | Site typecheck passed; continue source/docs audit. |
| public API docs | Slate React walkthrough front-door docs / `slate` public-surface contract | `bun test ./packages/slate/test/public-surface-contract.ts && bun typecheck:site` | N/A | passed 602 tests and site typecheck | Continue subscribe/root hook docs audit. |
| public API docs | Slate React subscription split / `slate` public-surface contract | `bun test ./packages/slate/test/public-surface-contract.ts && bun typecheck:site` | N/A | passed 603 tests and site typecheck | Continue runtime/root hook docs audit. |
| public API docs | Slate React runtime/root hook docs / `slate-react` surface contract | `bun test ./packages/slate-react/test/surface-contract.tsx && bun typecheck:site` | N/A | passed 38 tests / 222 expects and site typecheck | Continue public API/docs consistency audit. |
| stable examples | `richtext`, `plaintext`, `markdown-shortcuts`, `hidden-content-blocks`, `dom-coverage-boundaries`, `editable-voids`, `placeholder` | `bun run playwright ... --project=chromium` | Chromium | 225 passed, 6 scoped skips | Run Firefox/WebKit-focused slice; do not rerun identical Chromium sweep unless source changes. |
| stable examples native-selection slice | `richtext`, `plaintext`, `hidden-content-blocks`, `editable-voids`, `placeholder` | `bun run playwright ... --project=firefox --project=webkit -g <native-selection/platform-risk rows>` | Firefox + WebKit | 28 passed, 2 scoped Firefox skips | Proceed to visual-proof gap scan. |
| visual native selection smoke | `richtext`, `plaintext`, `custom-placeholder`, `dom-coverage-boundaries`, `images`, `inlines`, `tables` | `bun run playwright playwright/integration/examples/visual-native-selection-smoke.test.ts --project=chromium --project=firefox --project=webkit` | Chromium + Firefox + WebKit | 27 passed with screenshot artifacts | Proceed to huge-document correctness smoke. |
| huge-document correctness smoke | `huge-document` staged + virtualized | focused `huge-document.test.ts` correctness grep | Chromium + Firefox + WebKit | 15 passed | Proceed to huge-document visual/scrollbar slice. |
| huge-document visual/scrollbar slice | `huge-document` staged + virtualized | focused `huge-document.test.ts` visual/scrollbar grep | Chromium + Firefox + WebKit | 14 passed, 1 scoped Firefox skip | Proceed to benchmark honesty/perf-gate scan. |
| huge-document metric baseline | `huge-document` staged + virtualized | `bench:react:huge-document:browser-trace:local` with 5k blocks, 2 iterations, 5 type ops, select-all/delete enabled | Chromium browser trace | passed; wrote JSON artifact | Proceed to API alias/hard-cut audit. |
| release discipline | public API/hard-cut/escape-hatch/write-boundary/benchmark script contracts | `bun test:release-discipline` | N/A | failed once, then 647 passed after inventory classification | Proceed to docs/readme beta review. |
| docs/readme current-state wording | docs/libraries, docs/walkthroughs, package READMEs | `bun typecheck:site` plus focused `rg` wording scan | N/A | passed; scan clean | Proceed to current-tree fast gate. |
| current-tree fast gate | Slate v2 edited tree | `bun check` | N/A | passed | Continue timed supervision; public example DX scan next. |
| post-API hard-cut stable behavior smoke | `richtext`, `plaintext`, `markdown-shortcuts`, `hidden-content-blocks`, `dom-coverage-boundaries`, `editable-voids`, `placeholder` | `bun run playwright ... --project=chromium` | Chromium | 225 passed, 6 scoped skips | Follow with Firefox/WebKit native-selection slice. |
| post-API cross-browser native-selection slice | `richtext`, `plaintext`, `hidden-content-blocks`, `editable-voids`, `placeholder` | `bun run playwright ... --project=firefox --project=webkit -g <native-selection rows>` | Firefox + WebKit | 22 passed, 2 scoped Firefox skips | Follow with screenshot-backed visual/native selection smoke. |
| post-API visual native-selection smoke | `richtext`, `plaintext`, `custom-placeholder`, `dom-coverage-boundaries`, `images`, `inlines`, `tables` | `bun run playwright playwright/integration/examples/visual-native-selection-smoke.test.ts --project=chromium --project=firefox --project=webkit` | Chromium + Firefox + WebKit | 27 passed | Follow with huge-document correctness smoke. |
| post-API huge-document correctness smoke | `huge-document` staged + virtualized | `bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium --project=firefox --project=webkit -g <correctness rows>` | Chromium + Firefox + WebKit | 15 passed | Follow with huge-document visual/scrollbar slice. |
| post-API huge-document visual/scrollbar slice | `huge-document` staged + virtualized | `bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium --project=firefox --project=webkit -g <visual/scrollbar rows>` | Chromium + Firefox + WebKit | 14 passed, 1 scoped Firefox skip | Follow with browser-trace metric smoke. |
| example navigation current-state badges | examples nav / `richtext` route | `bun run playwright playwright/integration/examples/example-navigation.test.ts --project=chromium` | Chromium | passed 1 test | Keep rendered UI guard with static metadata contract. |
| richtext triple-click toolbar assertion | `richtext` | `bun run playwright playwright/integration/examples/richtext.test.ts --project=chromium -g "selects the current block on browser triple click"` | Chromium | passed 1 test | Orphan `select.test.ts` assertion folded into route-owned proof. |
| public-root-value-export-coverage-audit | Slate root package + sibling packages | exact dist/source root export check, touched package builds, `bun test ./packages/slate/test/public-surface-contract.ts ./packages/slate/test/text-units-contract.ts && bun typecheck:packages && bun typecheck:site`, `bun check` | N/A | passed: root exports exact, no forbidden text-unit/object root leaks, sibling dist imports `isObject` from `slate/internal`, 681 focused tests, seven package typechecks, site typecheck, full fast gate | Proceed to public sibling internal import bridge guard. |
| public-sibling-internal-import-bridge-guard | Slate sibling package source | `bun test ./packages/slate/test/public-surface-contract.ts && bun typecheck:packages && bun typecheck:site`, `bun check` | N/A | first focused run failed until Slate DOM/React bridge users were classified; rerun passed 668 focused tests, seven package typechecks, site typecheck, and full fast gate | Proceed to compat/alias wording and source audit. |
| public-compat-alias-wording-and-source-audit | public docs/examples + public-surface guard | count-first wording scan, `bun test ./packages/slate/test/public-surface-contract.ts && bun typecheck:packages && bun typecheck:site`, `bun check` | N/A | passed: one public example `COMPAT` comment rewritten, public current-state wording guard added, 776 focused tests, seven package typechecks, site typecheck, and full fast gate | Proceed to Slate React root runtime export exactness audit. |
| slate-react-root-runtime-export-exactness-audit | Slate React root runtime API | `bun test ./packages/slate-react/test/surface-contract.tsx && bun typecheck:packages && bun typecheck:site`, `bun check` | N/A | passed: exact `Object.keys(SlateReact).sort()` root runtime export guard, 49 focused surface tests / 306 expects, seven package typechecks, site typecheck, full fast gate with 821 Slate React Vitest tests | Proceed to Slate DOM root runtime export exactness audit. |
| slate-dom-root-runtime-export-exactness-audit | Slate DOM root runtime API | `bun test ./packages/slate-dom/test/public-surface-contract.ts && bun typecheck:packages && bun typecheck:site`, `bun check` | N/A | passed: exact `Object.keys(SlateDOM).sort()` root runtime export guard, 15 focused DOM tests, seven package typechecks, site typecheck, full fast gate with 1234 Bun tests and 821 Slate React Vitest tests | Proceed to stable sibling root export exactness audit. |
| stable-sibling-root-export-exactness-audit | Slate History + Slate Hyperscript root APIs | package-local README contracts, `bun typecheck:packages && bun typecheck:site`, `bun check` | N/A | passed: exact History and Hyperscript runtime root export guards, two focused tests per package, seven package typechecks, site typecheck, full fast gate with 1236 Bun tests and 821 Slate React Vitest tests | Proceed to Slate Browser subpath runtime export exactness audit. |
| slate-browser-subpath-runtime-export-exactness-audit | Slate Browser explicit subpaths | `bun --filter ./packages/slate-browser test:core && bun typecheck:packages && bun typecheck:site`, `bun check` | N/A | passed: exact runtime export guards for `core`, `browser`, `playwright`, and `transports`, 77 Slate Browser core tests / 242 expects, seven package typechecks, site typecheck, full fast gate with 1237 Bun tests and 821 Slate React Vitest tests | Proceed to Slate Layout root runtime export exactness audit. |
| slate-layout-root-runtime-export-exactness-audit | Slate Layout root + React subpath API | `bun --filter ./packages/slate-layout test`, `bun typecheck:packages`, `bun typecheck:site`, `bun check` | N/A | passed: exact runtime export guards for `slate-layout` and `slate-layout/react`, 49 Slate Layout tests / 169 expects, seven package typechecks, site typecheck, full fast gate with 1237 Bun tests, 49 Slate Layout tests, and 821 Slate React Vitest tests | Proceed to package export-map drift audit without expanding pagination architecture. |
| package-export-map-drift-audit | All Slate v2 package import paths | `bun test ./packages/slate/test/public-surface-contract.ts`, `bun typecheck:packages`, `bun typecheck:site`, `bun check` | N/A | passed: exact package export maps are guarded for `slate`, `slate-react`, `slate-dom`, `slate-history`, `slate-hyperscript`, `slate-layout`, and `slate-browser`; focused public-surface passed 776 tests, package/site typechecks passed, and full fast gate passed with 1237 Bun tests, 49 Slate Layout tests, and 821 Slate React Vitest tests | Proceed to package export target-shape audit. |
| package-export-target-shape-audit | All Slate v2 package export targets | `bun test ./packages/slate/test/public-surface-contract.ts`, `bun typecheck:packages`, `bun typecheck:site`, `bun check` | N/A | passed: exact `main`, `module`, `types`, and `exports` target shapes are guarded for all seven Slate v2 packages; focused public-surface passed 776 tests, package/site typechecks passed, and full fast gate passed with 1237 Bun tests, 49 Slate Layout tests, and 821 Slate React Vitest tests | Proceed to package build-entry target-match audit. |
| package-build-entry-target-match-audit | Package export targets + tsdown entries | `bun test ./packages/slate/test/public-surface-contract.ts`, `bun typecheck:packages`, `bun typecheck:site`, `bun check` | N/A | passed: export targets are mapped to expected build entries, source entry files exist, shared-config packages are root-only, and package-local tsdown configs include the expected entries; focused public-surface passed 777 tests, package/site typechecks passed, and full fast gate passed after formatter-only repair with 1237 Bun tests, 49 Slate Layout tests, and 821 Slate React Vitest tests | Proceed to public package import smoke. |
| public-package-import-smoke | All allowed public package/subpath imports | package-local import smoke, `bun test ./packages/slate/test`, `bun typecheck:packages`, `bun typecheck:site`, `bun check` | N/A | passed: every allowed package/subpath import loads through package resolution, `slate-browser` root import fails as intended, package-local smoke passed 13 tests after expectation correction, root Slate test sweep passed 976 tests, and full fast gate passed with 1250 Bun tests, 49 Slate Layout tests, and 821 Slate React Vitest tests | Proceed to public import specifier allowlist audit. |
| public-import-specifier-allowlist-audit | Public docs, package READMEs, root README, and site examples | `bun test ./packages/slate/test/public-surface-contract.ts`, `bun typecheck:packages`, `bun typecheck:site`, `bun check` | N/A | passed: public import specifiers are derived from exact package exports with `/internal` excluded; current public docs/examples use only `slate`, `slate-react`, `slate-dom`, `slate-history`, `slate-hyperscript`, `slate-layout`, `slate-layout/react`, and `slate-browser/playwright`; focused proof passed 778 tests, package/site typechecks passed, and fast gate passed after formatter-only repair with 1250 Bun tests, 49 Slate Layout tests, and 821 Slate React Vitest tests | Proceed to package README duplicate-casing audit. |
| package-readme-duplicate-casing-audit | Package README files | `bun test ./packages/slate/test/public-surface-contract.ts`, `bun typecheck:packages`, `bun typecheck:site`, `bun check` | N/A | passed: directory-entry guard confirms each package has exactly one deliberate README casing; focused public-surface passed 779 tests, package/site typechecks passed, and full fast gate passed with 1250 Bun tests, 49 Slate Layout tests, and 821 Slate React Vitest tests | Proceed to docs proof-map package-DX guard coverage. |
| docs-proof-map-package-dx-guard-coverage | Package-DX proof-map row | `bun test ./packages/slate/test/public-surface-contract.ts`, `bun typecheck:site`, `bun typecheck:packages`, `bun check` | N/A | passed: docs proof map now points reviewers to package path, export target, build entry, README casing, public import specifier, and package import smoke guards; focused public-surface passed 779 tests, site/package typechecks passed, and full fast gate passed with 1250 Bun tests, 49 Slate Layout tests, and 821 Slate React Vitest tests | Proceed to post package-DX release-discipline rerun. |
| post-package-dx-release-discipline-rerun | Public API/hard-cut/release discipline | `bun test:release-discipline` | N/A | passed: 823 tests across public-surface, hard-cut, escape-hatch, write-boundary, leaf lifecycle, selection rebase, compat alias, editor foundation, benchmark/release script, and rendered DOM shape contracts | Proceed to public doc link target audit. |
| public-doc-link-target-audit | Public markdown files | `bun test ./packages/slate/test/public-surface-contract.ts`, `bun check` | N/A | passed: markdown link oracle strips fenced code and validates reference-style link definitions; focused public-surface passed 779 tests, and full fast gate passed after formatter-only repair with 1250 Bun tests, 49 Slate Layout tests, and 821 Slate React Vitest tests | Proceed to post API hard-cut stable behavior smoke. |
| post-api-hardcut-stable-behavior-smoke | Stable/current example behavior | `bun run playwright playwright/integration/examples/richtext.test.ts playwright/integration/examples/plaintext.test.ts playwright/integration/examples/markdown-shortcuts.test.ts playwright/integration/examples/hidden-content-blocks.test.ts playwright/integration/examples/dom-coverage-boundaries.test.ts playwright/integration/examples/editable-voids.test.ts playwright/integration/examples/placeholder.test.ts --project=chromium` | Chromium | passed: 225 tests with 6 scoped skips after building `slate-browser` and serving the static example site | Proceed to Firefox/WebKit native-selection slice. |
| post-api-cross-browser-native-selection-slice | Platform-risk native selection rows | `bun run playwright playwright/integration/examples/richtext.test.ts playwright/integration/examples/plaintext.test.ts playwright/integration/examples/hidden-content-blocks.test.ts playwright/integration/examples/editable-voids.test.ts playwright/integration/examples/placeholder.test.ts --project=firefox --project=webkit -g <native-selection rows>` | Firefox + WebKit | passed: 22 tests with 2 scoped Firefox skips for WebKit-only composition rows | Proceed to screenshot-backed visual/native selection smoke. |
| post-api-visual-native-selection-smoke | Screenshot-backed visual selection | `bun run playwright playwright/integration/examples/visual-native-selection-smoke.test.ts --project=chromium --project=firefox --project=webkit` | Chromium + Firefox + WebKit | passed: 27 tests with screenshot artifacts and double-highlight assertions | Proceed to huge-document correctness smoke. |
| post-api-huge-document-correctness-smoke | Huge-document staged + virtualized behavior | `bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium --project=firefox --project=webkit -g <correctness rows>` | Chromium + Firefox + WebKit | passed: 15 tests covering staged edit/undo/Enter/scroll, Shift+ArrowUp/Down, select-all delete/typing/undo, paste/undo restore, and virtualized 5k typing/nav/scroll | Proceed to huge-document visual/scrollbar slice. |
| post-api-huge-document-visual-scrollbar-slice | Huge-document visual/scrollbar behavior | `bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium --project=firefox --project=webkit -g <visual/scrollbar rows>` | Chromium + Firefox + WebKit | passed: 14 tests with 1 scoped Firefox skip covering projected selection, row stacking, scrollbar drag buffering, drag autoscroll, and blank-gap selection | Proceed to browser-trace metric smoke. |
| post-api-huge-document-browser-trace-metric-smoke | Huge-document staged + virtualized metrics | `SLATE_BROWSER_TRACE_SKIP_BUILD=1 SLATE_BROWSER_TRACE_SURFACES=stagedActiveDOMGroup,virtualized SLATE_BROWSER_TRACE_BLOCKS=5000 SLATE_BROWSER_TRACE_ITERATIONS=2 SLATE_BROWSER_TRACE_TYPE_OPS=5 SLATE_BROWSER_TRACE_SELECT_ALL_DELETE=1 SLATE_BROWSER_TRACE_RUN_LABEL=slate-auto-2026-06-15-post-api-smoke bun run bench:react:huge-document:browser-trace:local` | Chromium browser trace | passed: max p95 type-to-paint 26.5ms, select-to-paint 55.9ms, selection-ready 25.1ms, click-to-paint 23.7ms, DOM nodes 325, heap 16.31MB, long tasks 0ms, select-all/delete undo restored | Refresh beta-review priorities and queued taste checkpoints. |
| public-api-root-export-review-anchor-audit | Beta review anchors | React surface, Slate Layout, public-surface, package import smoke, and release-discipline focused commands | N/A | passed: React surface 49 tests, Slate Layout 49 tests, public-surface 779 tests, package import smoke 13 tests, release-discipline 823 tests | Proceed to public example complexity triage refresh. |
| public-example-complexity-triage-refresh | Public examples | line-count triage, direct factory scan, example metadata scan | N/A | no-change: `pagination.tsx` is the only giant public example and remains alpha/deferred; `huge-document.tsx` is route-owned/proved with a guarded direct factory exception; normal examples use `useSlateEditor` | Proceed to public docs current-state wording rescan. |
| public-docs-current-state-wording-rescan | Public docs, package READMEs, root README, and examples | scoped `rg` wording scan excluding changelogs/generated output and deferred pagination/huge-doc lanes | N/A | no-change: hits are legitimate normalizing `removed` prose and token `alias` data, not stale API/migration wording | Proceed to final fast gate after plan and oracle edits. |
| final-fast-gate-after-plan-and-oracle-edits | Current Slate v2 tree | `bun check` | N/A | passed: lint, package/site/root typechecks, 1250 Bun tests / 91 skips, 49 Slate Layout tests / 169 expects, and 821 Slate React Vitest tests | Enter supervision-mode next packet selection because beta-readiness gaps remained. |
| public-package-export-type-resolution-smoke | All allowed public package/subpath TypeScript imports through package metadata | `bunx tsc --project test/tsconfig.public-package-types.json --noEmit`, `bun --filter ./packages/slate typecheck`, `bun check` | N/A | passed: smoke tsconfig overrides `paths` to `{}` so `typeof import(...)` resolves package export/type metadata for `slate`, `slate/internal`, `slate-react`, `slate-dom`, `slate-dom/internal`, `slate-history`, `slate-hyperscript`, `slate-layout`, `slate-layout/react`, and all `slate-browser/*` public subpaths; first strict proof caught missing root `slate-layout` workspace dependency, then full fast gate passed | Continue timed supervision; choose next non-duplicate packet. |
| package-dx-proof-map-type-smoke-anchor | Docs proof map package-DX row | `bun test ./packages/slate/test/public-surface-contract.ts && bun typecheck:site`, `bun check` | N/A | passed: proof map names runtime import smoke, strict TypeScript export/type smoke, and its tsconfig; focused public-surface passed 779 tests, site typecheck and full fast gate passed | Continue timed supervision; choose next non-duplicate packet. |
| public-package-named-declaration-smoke | Key public named exports through package declaration files | `bunx tsc --project test/tsconfig.public-package-types.json --noEmit`, `bun --filter ./packages/slate typecheck`, `bun check` | N/A | passed: strict type smoke now references the same representative public names used by the runtime import smoke, catching missing declaration named exports as well as broken module resolution | Continue timed supervision; choose next non-duplicate packet. |
| slate-browser-root-negative-type-resolution-smoke | `slate-browser` subpath-only package boundary | `bun --filter ./packages/slate typecheck`, `bun check` | N/A | passed: TypeScript smoke now expects root `slate-browser` import to fail while public subpaths resolve; lint/type/full fast gate passed after the negative alias was made lint-safe | Continue timed supervision; choose next non-duplicate packet. |
| internal-bridge-runtime-export-exactness | `slate/internal` and `slate-dom/internal` sibling-only bridge runtime exports | `packages/slate`: `bun test ./test/public-package-import-smoke.test.ts`, `.tmp/slate-v2`: `bun check` | N/A | passed: exact runtime export lists now guard both internal bridges; package-local smoke passed 15 tests / 27 expects and full fast gate passed with 1252 Bun tests / 91 skips | Continue timed supervision; choose next non-duplicate packet. |
| public-package-named-type-declaration-smoke | Representative public type exports through package declaration files | `packages/slate`: `bunx tsc --project test/tsconfig.public-package-types.json --noEmit`; `.tmp/slate-v2`: `bun --filter ./packages/slate-react build`, `bun --filter ./packages/slate typecheck`, `bun check` | N/A | passed: smoke covers core editor/location types, Slate DOM bridge types, Slate Layout layout types, and Slate React raw `Editable` expert prop/hook/overlay types; first strict run caught stale `slate-react` declarations, targeted build fixed them, and full fast gate passed | Continue timed supervision; choose next non-duplicate packet. |
| post-package-dx-release-discipline-rerun | Release discipline after package-DX oracle upgrades | `bun test:release-discipline` | N/A | passed: 823 tests across public-surface, hard-cut, escape-hatch, write-boundary, leaf lifecycle, selection rebase, compat alias, editor foundation, benchmark/release script, and rendered DOM shape contracts | Continue timed supervision; choose next non-duplicate packet. |
| root-workspace-package-link-guard | Root `package.json` workspace links for package smoke tests | `bun test ./packages/slate/test/public-surface-contract.ts`, `bun check` | N/A | passed: root `devDependencies` must include `slate`, `slate-browser`, `slate-dom`, `slate-history`, `slate-hyperscript`, `slate-layout`, and `slate-react` as `workspace:*`; focused public-surface passed 780 tests and full fast gate passed | Continue timed supervision; choose next non-duplicate packet. |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| stable examples Chromium sweep | Model selection asserted across richtext/plaintext generated gauntlets, toolbar edits, triple-click, margin click, hidden boundary ranges, placeholder, editable void child roots, undo/redo, paste/cut/copy, and beforeinput traces. | Native selected text asserted for placeholder exclusion, plaintext copy/cut, hidden model-backed copy, wrapped paragraph copy, selected-heading replacement, and selection import/export paths. | DOM endpoint/caret/geometry asserted by scrollable caret, visual caret after insertion, right-margin click at multi-leaf text end, line extension sync, word movement sync, editable void native-owned input ranges, and DOM coverage boundaries. | Playwright Chromium proof; no screenshot artifact needed because specs assert browser-visible/native/DOM behavior directly. | passed; follow with Firefox/WebKit slice because skipped rows include platform-specific/mobile semantics. |
| Firefox/WebKit native-selection slice | Model selection asserted for hidden block vertical materialization, editable-void vertical movement, plaintext Shift selection and undo, richtext line extension, triple-click block selection, and selected-range undo. | Native selected text asserted by placeholder exclusion and browser-owned selection gestures in Firefox/WebKit. | DOM endpoint/caret/geometry asserted by line extension, right-margin click, ArrowDown+ArrowRight, and WebKit compositionend delete rows. | Playwright Firefox/WebKit proof; no screenshot artifact needed for these rows because specs assert native/DOM behavior directly. | passed; visual screenshot proof still only needed for explicitly visual regressions such as double highlight/scrollbar lanes. |
| Desktop visual native selection smoke | Model selection asserted for each visual route. | Native selected text and displayed selection asserted with `assertSlateBrowserSelectionContract` and `noDoubleSelectionHighlight`. | DOM endpoints/caret geometry asserted through selection contract and route-specific harness calls. | Screenshot artifacts attached under `.tmp/slate-v2/test-results/**/richtext-multi-leaf-selection.png`, `hidden-dom-boundary-drag-selection.png`, `plaintext-backward-selection.png`, `custom-placeholder-collapsed-caret.png`, `images-adjacent-void-selected.png`, `inlines-triple-click-paragraph-selection.png`, `inlines-link-drag-selection.png`, and `tables-human-cell-drag-selection.png`. | passed on Chromium, Firefox, and WebKit. |
| Huge-document visual/scrollbar slice | Model selection asserted for staged/virtualized large-doc rows. | Native selection asserted for projected Shift+Down and drag selection rows; Firefox blank-gap native-gesture limitation explicitly skipped by the spec. | DOM row stacking, scroll bounds, caret visibility, and scrollbar drag buffering asserted by `huge-document.test.ts`. | Playwright desktop proof; screenshots are not attached in these rows, but the specs assert visual row geometry and projected/native selection state. | passed on Chromium, Firefox, and WebKit except one scoped Firefox blank-gap skip. |

slate-browser promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| visual selection screenshots and double-highlight assertions | `visual-native-selection-smoke.test.ts`, stable selection specs | Existing `attachSlateBrowserSelectionScreenshot` and `assertSlateBrowserSelectionContract` / `noDoubleSelectionHighlight` helpers | `bun run playwright playwright/integration/examples/visual-native-selection-smoke.test.ts --project=chromium --project=firefox --project=webkit` | keep existing helper surface; no duplicate helper added |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| raw mobile/device proof | deferred | none | no raw device lane active in this run | Do not claim raw mobile proof. Desktop and Playwright viewport/semantic rows remain separate from Appium/real-device proof. |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| huge-document staged/virtualized | typing, Enter, paste, select-all/delete, undo, Shift+ArrowUp/Down, scroll, scrollbar drag | model value/selection, native selection where applicable, visual row geometry, scroll buffering, browser-trace metrics | Playwright huge-document correctness/visual slices; `bench:react:huge-document:browser-trace:local` | passed with one scoped Firefox blank-gap skip; no broad architecture/pagination packet opened |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| Firefox double-click flaky row hammer | slate-auto / slate-browser | several focused no-retry hammers plus build/server startup | First helper repair only added retry spacing and diagnostics; the real proof primitive still used `mouse.click({ clickCount: 2 })`, which Firefox sometimes collapsed to a caret click. One run was also contaminated by a concurrent managed Playwright process. | Pre-patch 1/8 failure; diagnostic failure showed native/model/displayed selection collapsed at offset 18; final isolated Firefox 24/24 passed after switching to `mouse.dblclick()`. | Keep helper repair; use isolated managed Playwright lanes for focused flakes and log concurrent managed runs as invalid proof contamination. |
| Stable example Chromium sweep | slate-auto | ~1.3m test runtime plus Next build/server startup | Broad browser proof has fixed webServer/setup cost. | 225 passed / 6 skipped behavior proof. | No repair; command choice was correct (`bun run playwright` builds `slate-browser` before Playwright). Reuse existing server cache when possible, and switch to focused browser slice next. |
| Firefox/WebKit slice | slate-auto | ~24.5s test runtime plus Next build/server startup | Focused cross-browser proof still pays build/server startup. | 28 passed / 2 scoped Firefox skips. | Keep focused grep slices for platform-risk proof; avoid full all-browser soak unless source changes or a browser-specific failure appears. |
| Visual-proof scan | slate-auto | tiny | Bad scan path: `.tmp/slate-v2/docs/slate-browser` does not exist. | Search still surfaced the owned `visual-native-selection-smoke` spec and slate-browser helpers. | Use real paths: `.tmp/slate-v2/packages/slate-browser/**`, `.tmp/slate-v2/playwright/**`, `.tmp/slate-v2/docs/libraries/slate-react/**`. |
| Visual native selection smoke | slate-auto | 18.6s test runtime plus Next build/server startup | Correct proof lane, fixed server startup cost. | 27 passed and screenshots attached. | Keep; no helper repair needed. |
| Huge-document correctness smoke | slate-auto | 11.6s Chromium + 18.0s Firefox/WebKit runtime plus Next build/server startup | Focused grep was enough; no broad huge-doc soak needed for this checkpoint. | 15 passed. | Keep focused rows as smoke gate; broaden only after source changes or perf packet. |
| Huge-document visual/scrollbar slice | slate-auto | 11.5s Chromium + 16.5s Firefox/WebKit runtime plus Next build/server startup | Focused visual rows cover prior user-visible regressions without running all huge-doc rows. | 14 passed / 1 scoped Firefox skip. | Keep; next perf packet must use metrics, not visual rows as performance proof. |
| Benchmark discovery scan | slate-auto | noisy | `rg` included generated `site/out`, producing massive minified output. | It still identified benchmark scripts, but wasted output budget. | In future benchmark scans, exclude generated output: `-g '!site/out/**' -g '!tmp/**'`. |
| Huge-document browser-trace baseline | slate-auto | 8.9s runtime after skipping site build | Good packet shape; no source patch needed. | METRIC rows for p95 typing/selection/click/DOM/long-task/listener/selector/select-all-delete. | Keep baseline; optimize only if a later target/regression exceeds taste thresholds. |
| Release-discipline first run | slate-auto | <1s | Useful failure: unclassified proof-audit fixture string. | One inventory rule added; rerun passed. | Keep; this proves the hard-cut gate is alive. |
| Current-tree fast gate | slate-auto | ~34s | Expected full fast gate after docs/test edits. | `bun check` passed. | Keep; no repair. |
| Public example/source-comment scan | slate-auto | small | Initial broad generated-output scan was already repaired by excluding `site/out`; this packet stayed focused. | One example comment and three source comments cleaned; follow-up scan scoped to source/docs/examples. | Keep; no skill repair needed. |
| Post-example fast gate | slate-auto | ~40s | Expected after source-comment edits touched package files. | `bun check` passed. | Keep; no repair. |
| Package export/docs scan | slate-auto | small | JSON export scan showed docs navigation gap for public `slate` and `slate-dom` packages. | Added docs pages and contract proof. | Keep; no skill repair needed. |
| Internal subpath boundary | slate-auto | small | Not a runtime slowdown; it is an API claim-width gap. | Docs warn that `/internal` is reserved for sibling packages, and contracts still ban internal import examples from public docs. | Keep; no skill repair needed. |
| Peer-floor contract first run | slate-auto | small | Contract scanned package-local `node_modules` and falsely attributed vendored Slate React/DOM internals to `slate-layout`. | Added `!relativePath.includes('/node_modules/')` to the source scan; rerun passed. | Keep repair in contract; no skill repair needed. |
| Example complexity scan | slate-auto | small | Large examples are expected for huge-doc/pagination, but factory-path drift needed a guard. | Added a specific huge-doc remount/control exception. | Keep; pagination remains deferred unless explicitly requested. |
| Docs proof-map scan | slate-auto | small | Proof map lagged behind the current docs/API front door. | Added core package, DOM package, and `useSlateEditor` setup anchors. | Keep; no skill repair needed. |
| Post-package/docs fast gate | slate-auto | ~26s plus one quick formatting retry | Formatter found long lines introduced by contract edits. | Applied formatter shape and reran `bun check` green. | Keep; no skill repair needed. |
| Full browser matrix managed-server race | slate-auto / test harness | two failed full-gate attempts before dedicated server proof | Playwright webServer reuse on port 3101 cascaded `ERR_CONNECTION_REFUSED`; the server could answer `curl` before and after, but the managed integration run still lost its server lifecycle. | Dedicated `PORT=3199 node ./scripts/serve-playwright.mjs` plus `PLAYWRIGHT_BASE_URL=http://localhost:3199 bun run playwright playwright/integration` completed the full matrix. | For closure-quality local full browser proof, prefer a fresh dedicated server and explicit `PLAYWRIGHT_BASE_URL`; treat 3101 `ERR_CONNECTION_REFUSED` cascades as harness lifecycle first, not product code. |
| Full matrix retry flakes | slate-auto / test harness | 15.0m full matrix plus focused repeats | Four tests recovered on retry in the full matrix; accepting retry-green alone would hide weak proof. | Full matrix: 2010 passed, 562 skipped, 4 flaky. Focused retries-off repeats: shadow DOM Chromium 16/16, forced-layout Firefox 12/12, visual-native inline-link Firefox 20/20. | Keep product code; log as non-reproducible focused flake and route future work to harness/artifact hardening if repeated. |
| Firefox native double-click helper repair | slate-auto / slate-browser | focused repeat isolation plus full-matrix reproof | The earlier `doubleClickTextOffset` helper could report success while native selected text was empty in Firefox. | Pre-repair focused Firefox native-word toolbar row failed 2/8; final focused row passed 12/12 and then passed in Chromium, Firefox, and WebKit full matrix. | Keep helper repair: `selectedText` expectation retries native double-click and fails with model/native/displayed selection diagnostics. |
| API Summary coverage | slate-auto | small | One existing API page was orphaned from Summary. | Added Bookmark link plus coverage contract. | Keep; no skill repair needed. |
| Release discipline rerun | slate-auto | ~1.6s | Correct guard after public-surface edits. | 665 tests passed. | Keep; no skill repair needed. |
| Root export claim audit | slate-auto | small | Source-level assertion prevents docs claiming unexported package symbols. | Added source export assertions. | Keep; no skill repair needed. |
| Example badge scan | slate-auto | noisy | A broad `rg` included nonexistent path names and generated `site/out`, dumping minified output. | Re-ran a scoped source scan and added direct static/rendered proof. | Repair at plan level: use owned paths only and always exclude `site/out`, `node_modules`, build outputs, and generated artifacts for UI/docs scans. |
| In-app Browser discovery for example badge UI | slate-auto | small blocker | Tool discovery did not expose a callable in-app Browser tool in this turn. | Fell back to repo Playwright rendered-nav proof. | Record blocker honestly; use Playwright when Browser is unavailable, but do not claim in-app Browser proof. |
| Example navigation rendered proof | slate-auto | ~10s plus Next build/server startup | UI route proof pays local webServer cost. | 1 Chromium rendered-nav test passed. | Keep focused Playwright route proof; no broader soak needed for a metadata badge edit. |
| Package README doc guard first attempt | slate-auto | small | `collectMarkdownFiles(packages)` included package changelogs, which are historical and intentionally contain old names. | Public-surface failed on changelog-only old API strings, then passed after narrowing to package `README.md` files. | Keep the README guard and exclude changelogs from current-state public-doc checks. |
| Orphan browser proof cleanup | slate-auto | small | Route coverage contract did not catch non-route specs. | Deleted `select.test.ts`, added reverse route/alias/utility-spec guard, and reran focused richtext proof. | Keep; utility specs must stay explicitly classified. |
| Post-browser-proof fast gate | slate-auto | ~24s plus one quick formatting retry | Biome found line wrapping introduced in the example badge component. | Applied formatter shape and reran `bun check` green. | Keep; no skill repair needed. |
| Public export audit shell scan | slate-auto | noisy | An `rg` pattern contained unescaped backticks, so zsh treated API names as command substitutions. | Switched to source/file contracts instead of brittle shell regex for the export-claim audit. | Repair at plan level: quote markdown backticks safely or use Node/file assertions for docs API-name audits. |
| Root README package-table scan | slate-auto | noisy | Repeated the same shell mistake with backticks inside an `rg` pattern. | Added file-based package-table assertions instead. | Repair stands: avoid shell regex for markdown code-span audits; use Node/file assertions. |
| Latest-state wording scan after compaction | slate-auto | noisy | First resumed scan included parent `docs/**`, Slate v2 run plans, issue ledgers, and draft/research artifacts, so it could not prove public docs state. | Re-ran a count-first scan only over `.tmp/slate-v2/docs/{libraries,api,concepts,walkthroughs,general}`, `.tmp/slate-v2/packages/*/README.md`, and `.tmp/slate-v2/Readme.md`; only legitimate domain prose remained. | Repair at plan level: for public-doc wording audits, start with owner allowlists and `--count`; exclude plans, research, issue ledgers, drafts, generated output, parent docs, and changelogs. |
| Slate Browser README contract first run | slate-auto | tiny useful failure | The first assertion banned the phrase `pure selection helpers` even after the README listed the concrete helpers; that was stricter than the docs goal. | `bun --filter slate-browser test:core` failed once in `package-scripts.test.ts`, then passed after removing the over-broad negative assertion. | Keep concrete positive symbol checks; avoid policing harmless wording once the docs name the actual API. |
| Full fast gate after README/docs | slate-auto | ~48s plus two quick repairs | Fast gate caught one formatter wrap and one stale Slate DOM package oracle after the broader public-surface guard had passed. | `bun check` now passes, and `packages/slate-dom/test/public-surface-contract.ts` matches the current README import claim. | Keep the gate; package-local README contracts are still useful because they catch narrower package drift than the global public-surface guard. |
| Bun direct path filter for React contract files | slate-auto | small | `bun test ./packages/slate-react/test/*.test.tsx` direct filters did not match Vitest-owned files cleanly, while the package suite owns those contracts. | Switched to `cd packages/slate-react && bun test:vitest` plus direct public-surface Bun contract. | Use package Vitest for Slate React runtime/provider contracts; use direct Bun paths only for known Bun-file contracts such as `surface-contract.tsx`. |
| Strict declaration probe | slate-auto | medium | Running `skipLibCheck: false` with inherited Bun ambient types produced noisy Bun/Node conflicts before the real package declaration bug. A direct `compilerOptions.paths = {}` dts experiment also failed because it made dependent package builds read core source/private names. | Re-ran with Node/React ambient types only, then fixed the real owner with a declaration-build tsconfig plus explicit public `slate-react` type boundaries. | Keep: for package-DX declaration probes, strip Bun ambient types first and avoid broad dts config changes until a single-package build proves the owner. |
| Post-root-hook-rename fast gate | slate-auto | ~38s plus formatting retry | Manual public API rename changed export ordering and line wrapping. | `bun check` failed on Biome import/order formatting, then passed after exact formatting repair. | Keep full fast gate after public root-export hard cuts. |
| Post-projection-entry-rename fast gate | slate-auto | ~24s plus formatting retry | Manual public API rename touched benchmark scripts that lint still owns. | `bun check` failed on one benchmark line wrap, then passed after exact formatting repair. | Include benchmark scripts in hard-cut search/format proof whenever exported hooks are used by benchmark lanes. |
| History focus-policy shell scan | slate-auto | small | An `rg` pattern with markdown backticks triggered zsh command substitution while checking docs/API text. | Switched to single-quoted/file-backed scans; old `preserve-dom` value is absent outside the negative guard. | Use `rg -F` or Node/file assertions for markdown code-span and option-value audits. |
| Post-history-focus-policy fast gate | slate-auto | expected full gate | Public option-value hard cut touched source, docs, examples, and tests. | `bun check` passed after the history focus-policy hard cut. | Keep full fast gate after public option-value hard cuts. |
| Editable prop audit first scan | slate-auto | noisy | Initial `rg` over broad Slate React test/docs roots streamed too many DOM strategy matches. | Switched to exact owner files and call-site scans; prop hard cut still completed. | Start API prop audits from owner source plus known public contract files, then widen only to dependent package call sites. |
| Editable DOM strategy layout typecheck | slate-auto | small useful failure | Focused typecheck caught stale `slate-layout` wrapper dependency after raw `Editable` prop rename. | Updated `slate-layout/react` to pass `domStrategyLayout` internally while keeping `PagedEditable layout` public. | Keep package typecheck immediately after exported prop/type hard cuts. |
| Post-editable-dom-strategy-layout fast gate | slate-auto | ~30s plus formatter retry | Manual prop rename changed JSX prop ordering and export ordering. | First `bun check` failed on formatter-only issues; targeted Biome write on touched files; rerun passed. | Keep full fast gate after public prop/type hard cuts. |
| Editable event-prop docs assertion | slate-auto | small | First contract assertion matched a wrapped markdown sentence too exactly. | Changed to stable phrase fragments; focused contract passed. | Use phrase-fragment assertions for docs paragraphs that formatter/wrapping can split. |
| Post-editable-event-props fast gate | slate-auto | expected full gate | Docs and surface contract changed after loop 50. | `bun check` passed. | Keep full fast gate after public docs/contract edits inside API cleanup. |
| Post-render-prop-stale-interface fast gate | slate-auto | ~30s plus formatter retry | Removing dead exported interfaces made the `slate` import collapse to one line. | First `bun check` failed on import formatting only; targeted Biome write fixed it; rerun passed. | Keep formatter pass after deleting public-ish type declarations. |
| Provider projection docs assertion | slate-auto | small | First contract assertion matched a wrapped markdown sentence too exactly. | Changed to stable fragments; focused contract passed. | Use phrase-fragment assertions for docs paragraphs that formatter/wrapping can split. |
| Post-provider-projection-props fast gate | slate-auto | expected full gate | Docs and surface contract changed after provider projection boundary clarification. | `bun check` passed. | Keep full fast gate after public docs/contract edits inside API cleanup. |
| Broad command/change surface scan | slate-auto | noisy | `rg` over commands/change terms across packages/docs/examples streamed thousands of matches into chat. | It surfaced the owner files, but wasted output budget. | Treat broad API terms like `command`, `change`, and `tx` as owner-file audits first; use `rg -l` or exact docs/test files before any `rg -n` line stream. |
| Slate DOM root import scan | slate-auto | noisy repeat | A broad `rg` over `slate-dom` imports included generated `site/out` and dumped minified chunks. | It still identified owner files, but wasted output budget and repeated a known generated-output failure. | For package/docs scans, hard-exclude generated paths first: `site/out/**`, `dist/**`, `node_modules/**`, `.next/**`, and large benchmark output artifacts. |
| Stable package docs scan | slate-auto | noisy repeat | A broad `rg` over history/hyperscript fixtures streamed thousands of fixture matches. | It found the owner docs/tests but wasted output budget. | Start small package API audits from `src/index.ts`, package README, library docs, and package-local contract files; only widen into fixtures with an exact symbol and an output cap. |
| Bun focused README contract filter | slate-auto | command mismatch | Direct `bun test ./packages/.../package-readme-contract.test.ts` did not match test files and suggested recursive `././` prefixes that still failed. | Package-directory proof `bun test ./packages/slate-history/test ./packages/slate-hyperscript/test` picked up the `*.test.ts` contracts and passed; `bun check` counted 26 Bun test files. | For new package-local Bun contracts, use discoverable `*.test.ts` names and verify through the package directory sweep, not direct multi-file filters. |
| Post-change-callback-boundary fast gate | slate-auto | expected full gate | Type/docs guards changed after focused proof. | First `bun check` failed on formatter wrapping only; formatter write fixed `surface-contract.tsx`; rerun passed. | Keep full fast gate after public callback/type boundary edits. |
| Mechanical alias rewrite first attempt | slate-auto | tiny command-shape miss | `files=$(rg -l ...)` did not split into argv under zsh, so Perl received one newline-containing filename. | No file changes; command failed before rewrite. | Use `rg -l -0 ... | xargs -0` for multi-file mechanical rewrites in zsh. |
| Core commit alias hard-cut typecheck | slate-auto | small useful failure | Mechanical rewrite duplicated `EditorCommit` imports in three core files. | Package/site typecheck caught duplicate identifiers before final gate. | Keep focused typecheck immediately after mechanical public type rewrites. |
| Post-core-commit-alias hard-cut fast gate | slate-auto | expected full gate | Source-wide type-name rewrite disturbed import ordering across packages. | Biome fixed imports; rerun `bun check` passed. | Keep full fast gate after source-wide public alias hard cuts. |
| Command result alias rewrite | slate-auto | small mechanical miss | Replacing `EditorCommandResult` with `boolean` also rewrote the imported type name and briefly produced `export type boolean = boolean`. | Manual cleanup removed the bogus type/imports; guards, typechecks, and `bun check` passed. | Avoid blind type-name rewrites for aliases whose target is a primitive. Patch the alias stub first, then use focused owner-file replacements. |
| Pure alias allowlist calibration | slate-auto | useful first-run failure | The first guard run caught generic node/text helper aliases that the shell scan had not listed. | Classified the remaining Slate-compatible helper aliases explicitly; focused guard and `bun check` passed. | Prefer the file-backed guard over ad hoc shell scans for future alias policy. |
| React contract path filter | slate-auto | small command mismatch | `bun test ./packages/slate-react/test/render-profiler-contract.test.tsx` did not match a Vitest-only test file and suggested recursive `././` prefixes. | Ran `bunx vitest run --config ./vitest.config.mjs test/render-profiler-contract.test.tsx` from `packages/slate-react`; focused proof passed. | Use Vitest directly for focused `packages/slate-react/test/**/*.test.tsx` contracts unless they are already known Bun lanes. |
| Shared Vitest wrapper contract | slate-auto | small command mismatch | `dom-strategy-and-scroll.tsx` has Vitest globals but is included through `dom-strategy-and-scroll.test.tsx`; direct Bun and direct Vitest path runs fail for different reasons. | Ran `bunx vitest run --config ./vitest.config.mjs test/dom-strategy-and-scroll.test.tsx`; wrapper proof passed 51 tests. | For Slate React shared contract modules, run the `.test.tsx` wrapper under Vitest, not the shared `.tsx` file directly. |
| Slate History package README focused test path | slate-auto | small command mismatch | Root `bun test ./packages/slate-history/test/package-readme-contract.test.ts` did not match because the repo Bun config ignores package `*.test.*` entries from the root filter. | Ran `bun test ./test/package-readme-contract.test.ts` from `packages/slate-history`; focused proof passed, then site typecheck and `bun check` passed. | For package-local Bun `*.test.*` README contracts, run from the package cwd instead of root path filters. |
| Transform source path probe | slate-auto | tiny command mismatch | Tried `packages/slate/src/interfaces/transforms.ts`, but transform interfaces are split under `packages/slate/src/interfaces/transforms/{general,text,node,selection}.ts`. | Re-read the split owner files and patched docs/contracts from them. | Start transform audits from the split owner directory, not a guessed aggregate file. |
| Transform docs regex assertion | slate-auto | tiny lint/syntax repair | First docs-source contract used a bad escaped-backtick regex, then a string-concat regex that Biome rejected. | Focused proof caught the syntax issue; `bun check` caught the lint-only concat issue; final escaped template literal passed. | Use `new RegExp(\`\\\`${escapeRegExp(option)}\\\\??\`)`for markdown code-span token assertions. |
| Root type export parser first run | slate-auto | tiny test/format repair | First source-backed type export parser over-escaped the named export block, then`bun check`caught one formatter-only line wrap in the classification list. | Focused proof failed before the regex repair, then passed 667 tests plus site typecheck;`bun check`passed after formatter shape. | Keep the source-backed parser. For future export contracts, prove the parser on the target source before adding broader assertions, then run the full fast gate after formatting-sensitive tables/lists. |
| Public root hard-cut stale package dist | slate-auto / package builds | small but blocking | After source removed root`isObject`, Bun test preload still loaded stale `slate-history`/`slate-hyperscript`dist that imported`isObject`from`slate`. | Rebuilt touched packages with `bun --filter ./packages/slate build && bun --filter ./packages/slate-history build && bun --filter ./packages/slate-hyperscript build`; dist root check then passed. | Source hard cuts that affect package-name imports need touched package builds or a source-first test setup before trusting package-name preload failures. |
| Broad dist scan during root export audit | slate-auto | noisy repeat | A broad `rg`over dist artifacts streamed huge generated output while checking forbidden root leaks. | Switched to a small Bun file-read/import check over exact dist files and recorded exact key/import results. | Never scan`dist`with line output in automation. Use exact files plus`--count`, `-l`, or a small script that prints structured summary only. |
| Post-root-value-export fast gate | slate-auto | expected full gate plus one formatter repair | Root export hard cut changed imports in touched Slate core files. | First `bun check`failed on Biome import ordering in`interfaces/element.ts`; manual import-order repair fixed it; rerun passed full fast gate. | Keep full fast gate after public root export changes. |
| Sibling internal bridge first scan | slate-auto | noisy | Initial `rg -n "slate/internal|/internal|internal"`over packages/docs pulled in every test fixture and many unrelated internal prose hits. | It revealed enough to choose the owner contract but wasted output budget. | For internal bridge audits, start from`public-surface-contract.ts`bridge sections and source-import allowlists; use structured file lists instead of broad line output. |
| Sibling internal bridge classifier first run | slate-auto | useful failure | The first allowlist only included history/hyperscript and missed existing Slate DOM/React sibling bridge users. | Focused public-surface proof failed with exact missing importer list; classified the real current list and reran green. | Keep the exact classifier; it prevents future bridge drift from being invisible. |
| Compat/alias wording source scan | slate-auto | acceptable count-first scan | Count-first scan showed one public example`COMPAT`comment plus many internal browser/platform`COMPAT`implementation comments. | Public example was cleaned; public docs/examples now have a current-state wording guard; internal runtime comments were classified as platform behavior notes. | Do not churn browser workaround comments in an API docs packet. If internal`COMPAT`wording becomes a taste issue, run a separate runtime-comment cleanup packet with behavior tests. |
| Package build-entry target-match fast gate | slate-auto | tiny formatter retry | The new shared-config build-script assertion exceeded formatter width. | First`bun check`failed on Biome wrapping only; exact wrap repair made the rerun pass. | Keep the fast gate after central contract edits; formatter-only retries are acceptable but should be logged. |
| Public package import smoke direct root filter | slate-auto | small command mismatch | Root`bun test ./packages/slate/test/public-package-import-smoke.test.ts`did not match the package-local`_.test.ts`file. | Running from`packages/slate`picked up the file; root package-folder sweep and`bun check`also included it. | For direct package-local Bun tests, prefer package cwd or folder sweep; keep the known path-filter quirk in mind. |
| Public package import smoke first expectation | slate-auto | useful first-run failure | The new smoke expected`withDOM`from`slate-dom/internal`, but the current intentional internal bridge exports `installDOM`instead. | Corrected the smoke expectation and reran package-local proof green. | Keep import smoke assertions tied to current actual package surface, not guessed internals. |
| Public import-specifier first scan | slate-auto | noisy invalid scan | The first import-specifier scan included`packages/\*\*`recursively, so it pulled source/tests and regex strings from contracts instead of public docs/examples only. | Re-ran with the real public allowlist: root README, docs, package READMEs, and site examples. | Never include package source/test folders in public-doc import audits. Start from public markdown and example files only. |
| Public import-specifier fast gate | slate-auto | tiny formatter retry | The new import-specifier helper/assertion needed formatter line wrapping. | First`bun check`failed on Biome wrapping only; exact wrap repair made the rerun pass. | Keep fast gate after central contract edits. |
| Package README casing scan | slate-auto | small filesystem trap | A custom scan used`existsSync`for both`README.md`and`Readme.md`; on the case-insensitive local filesystem, that made one file look like two. | `find`showed one actual README per package, and a directory-entry guard now proves casing exactly. | Use`readdirSync`entries for casing audits, not`existsSync`probes. |
| Public doc link scan false positive | slate-auto | small oracle repair | A one-off reference-link scan treated`[documentTitle.key]: 'Untitled'`inside a fenced code block as a markdown reference definition. | The central public-surface markdown link contract now strips fenced code before scanning and checks reference-style definitions directly. | Markdown/link scans must strip fenced code before interpreting link syntax. |
| Public doc link helper refactor | slate-auto | tiny test-code repair | Moving link checks into a helper left a`continue`inside a non-loop function. | Focused public-surface test failed before any product assertion ran; replacing it with`return`made the contract pass. | Keep focused proof immediately after test helper refactors. |
| Public doc link fast gate | slate-auto | tiny formatter retry | The new`stripFencedCodeBlocks`helper exceeded Biome's preferred one-line shape. | First`bun check`failed on formatter output only; exact wrap repair made the rerun pass. | Keep fast gate after central contract edits. |
| Public package type-resolution smoke command shape | slate-auto | small command/config repair | Direct`tsc --project ...`was not on shell PATH from the package cwd, and the first type-smoke config inherited JSX settings that were wrong for source-path React imports. | Switched to the package typecheck path /`bunx tsc`, added `jsx: react-jsx`plus React types to the smoke tsconfig, fixed lint/format shape, and reran`bun --filter ./packages/slate typecheck`plus`bun check`green. | Use package scripts or`bunx tsc`for direct TS proof; TypeScript public package smoke that resolves source TSX needs the same JSX/type environment as consumer docs. |
| Public package type-resolution smoke honesty repair | slate-auto | useful false-proof repair | Loop 134 inherited repo`paths`, so it could pass while package export/type metadata was broken. After `paths: {}`it failed on missing`slate-layout`package resolution. | Added the missing root`slate-layout: workspace:_`devDependency, ran`bun install`, and reran strict `bunx tsc`, Slate package typecheck, and `bun check`green. | Package-DX type smoke must disable monorepo`paths`when the claim is package export/type resolution. Source-path type smoke is not enough for beta package review. |
| Public named type declaration smoke caught stale package declarations | slate-auto | useful artifact drift | Source exported`EditableDOMStrategyLayout`, but `slate-react/dist/index.d.ts`did not, so a package consumer would miss a documented raw`Editable`expert type. | Targeted`bun --filter ./packages/slate-react build`regenerated package declarations; strict package type smoke, package typecheck, and`bun check` passed. | Artifact-facing package-DX proof can require a targeted package build. Do not downgrade it to source-first when the claim is package export declarations. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `packages/slate-browser/src/playwright/index.ts` now uses Playwright `mouse.dblclick()` for double-click proof gestures instead of `mouse.click({ clickCount: 2 })`, keeping Firefox native word-selection proof stable. Earlier `editable.tsx`, `model-input-strategy.ts`, and `native-input-strategy.ts` source comments now describe the current strategy plainly instead of using `COMPAT`, `hacks`, or `for now` wording. |
| tests/oracles/browser proof | Firefox native word-selection toolbar proof was hammered without retries: pre-patch 1/8 failed, timing-only diagnostic patch still failed 1/24, final `mouse.dblclick()` repair passed Firefox 24/24 and Chromium/WebKit 4/4 each. `public-surface-contract.ts` now positively asserts the installing walkthrough teaches `useSlateEditor` as the React-owned editor front door, keeps `<Slate>` free of `initialValue`, guards core walkthroughs/setup docs against drifting away from `useSlateEditor`, and documents `subscribe` / `subscribeCommit` as different integration hooks. `surface-contract.tsx` now guards runtime/root hook option docs. `escape-hatch-inventory-contract.ts` now classifies `slate-browser` keyboard-oracle proof-audit fixture text. `packages/slate-dom/test/public-surface-contract.ts` now expects the current README import of `DOMCoverage` and `Hotkeys`. |
| benchmarks/metrics/targets | No benchmark target files changed in the final closeout. Huge-document browser-trace metrics were recorded as proof only: max p95 type-to-paint 26.5ms, select-to-paint 55.9ms, selection-ready 25.1ms, click-to-paint 23.7ms, DOM nodes 325, long-task max/total 0ms. |
| examples/docs | `01-installing-slate.md`, walkthroughs 02-05, `react-editor-setup.md`, `slate.md`, and Slate React README now teach `useSlateEditor` as the first React editor creation path; `createReactEditor` remains the lower-level factory. `slate.md` now separates `editor.subscribe` snapshot persistence from `editor.subscribeCommit` commit-level adapters/replay/instrumentation. `hooks.md` now documents selector options, root editor `readOnly`, view-effect `root`/`deps`, and command callback `root`/`focus` defaults. `06-saving-to-a-database.md` and `07-enabling-collaborative-editing.md` use current-state reference language instead of `You now have...` closers. `site/pages/examples/[example].tsx` now has a useful SSR/debugging comment instead of `No idea how any of this works.` |
| package docs/navigation | `docs/libraries/slate.md` and `docs/libraries/slate-dom.md` now give core and DOM packages first-class library navigation entries. `docs/Summary.md` links both pages. |
| package/API boundaries | Slate and Slate DOM library docs now state `/internal` subpaths are reserved for sibling Slate packages in this repo, while external apps/plugins/framework adapters should use root exports. |
| package peer boundaries | `slate-history` and `slate-hyperscript` now require `slate >=0.124.2` because they import the package-private Slate bridge. `public-surface-contract.ts` now derives this from actual source imports and excludes package-local `node_modules`. |
| example/API teaching | `huge-document.tsx` now explains its direct factory exception. `public-surface-contract.ts` ensures normal public examples do not start using direct `createReactEditor`. |
| docs proof map | `docs/general/docs-proof-map.md` now maps the core Slate package docs, Slate DOM package docs, and `useSlateEditor` setup path to source/test proof. |
| docs navigation | `docs/Summary.md` now links Bookmark under Location Types. `public-surface-contract.ts` now checks every API leaf page is listed in Summary. |
| operation docs | `docs/api/operations/README.md` now documents `ReplaceChildrenOperation` and includes it in `BaseOperation`; `docs/api/operations/operation.md` now lists the current insert/merge/move/remove/replace/set/split check helpers. `public-surface-contract.ts` guards both docs pages. |
| static API docs | `docs/api/nodes/element.md`, `docs/api/nodes/node.md`, and `docs/api/nodes/text.md` now include missing source-backed static methods. `public-surface-contract.ts` now compares Element, Node, Operation, Path, Point, Range, and Text source interface methods to their API docs headings. |
| transaction transform docs | `docs/api/transforms.md` now documents source-backed `tx.nodes`, `tx.fragment`, `tx.text`, `tx.selection`, and `tx.break` method options. `public-surface-contract.ts` now guards the transaction transform docs against source option drift and rejects the old false `tx.fragment.delete` `hanging` / `voids` wording. |
| transaction helper alias hard cut | `tx.nodes.insertMany` was removed from `EditorTransactionNodesApi`, the core update transaction, the rooted editor transaction wrapper, pagination example calls, and the rooted dirty-path contract. `tx.nodes.insert` now owns both single-node and multi-node insertion, with a public-surface guard rejecting `insertMany` leaks. |
| transaction API completeness | `docs/api/transforms.md` now documents the non-transform write groups on the update transaction: `tx.value.replace`, `tx.roots.create/replace/delete`, `tx.setField`, `tx.statePatches.replay`, `tx.normalize`, and `tx.withoutNormalizing`. `public-surface-contract.ts` now guards the complete core transaction method set against source/docs drift. |
| transform concept cross-page consistency | `docs/concepts/04-transforms.md` now names the fuller transaction group set and links to `docs/api/transforms.md`; `public-surface-contract.ts` guards those concept-page anchors. |
| extension authoring helper docs | `docs/libraries/slate.md` and `packages/slate/Readme.md` now import `defineEditorExtension`, `defineStateField`, and `elementProperty` together as the core authoring helper set. `public-surface-contract.ts` guards the docs and root exports. |
| extension type docs | `docs/libraries/slate.md` and `packages/slate/Readme.md` now group public extension/schema/middleware type families beyond the small original subset: extension inputs/setup/runtime/groups/operations, element behavior/content-root/property/void metadata, state-field value input, transform/query middleware maps/results, and operation apply handlers. `public-surface-contract.ts` guards those names. |
| root editor type export classifier | `public-surface-contract.ts` now parses explicit root editor type exports from `packages/slate/src/index.ts` and requires each one to be documented in Slate package/library docs or deliberately classified with a reason. |
| root value export hard cut | `packages/slate/src/index.ts` no longer exports `./text-units` or `./utils/is-object`; `getCharacterDistance`, `getWordDistance`, and `isObject` are not Slate public root values. `public-surface-contract.ts` now asserts the exact intended root value export set. |
| sibling internal utility bridge | Slate core internals import `isObject` from source, while `slate-history` and `slate-hyperscript` import it from `slate/internal`. `packages/slate/src/internal/index.ts` exports `isObject` for sibling-package use. |
| sibling internal import classifier | `public-surface-contract.ts` now classifies the exact current `slate/internal` source importers across Slate DOM, Slate React, Slate History, and Slate Hyperscript with a reason for each importer. New bridge users must be added deliberately. |
| public current-state wording guard | `public-surface-contract.ts` now rejects compatibility, migration, deprecated, legacy, and previous-version framing from public docs/examples. `site/examples/ts/paste-html-import.ts` now describes the Google Docs `<b>` behavior without `COMPAT` wording. |
| Slate React exact root runtime guard | `packages/slate-react/test/surface-contract.tsx` now asserts the exact runtime values exported from the Slate React root. This positive guard backs the projection/text/overlay/decoration/hook alias hard cuts. |
| Slate DOM exact root runtime guard | `packages/slate-dom/test/public-surface-contract.ts` now asserts the exact runtime values exported from the Slate DOM root. This positive guard backs the grouped DOM docs and internal DOM namespace hard cuts. |
| Stable sibling exact root guards | `packages/slate-history/test/package-readme-contract.test.ts` and `packages/slate-hyperscript/test/package-readme-contract.test.ts` now assert exact root runtime exports for the small sibling packages. |
| Slate Browser exact subpath guards | `packages/slate-browser/test/core/package-scripts.test.ts` now asserts exact runtime exports for `slate-browser/core`, `slate-browser/browser`, `slate-browser/playwright`, and `slate-browser/transports`. |
| Slate Layout exact root/subpath guards | `packages/slate-layout/test/page-layout-contract.test.ts` now asserts exact runtime exports for `slate-layout` and `slate-layout/react`. This is a package-boundary oracle only; runtime behavior did not change. |
| package export-map guard | `packages/slate/test/public-surface-contract.ts` now asserts the exact public export map for every Slate v2 package: `slate`, `slate-react`, `slate-dom`, `slate-history`, `slate-hyperscript`, `slate-layout`, and `slate-browser`. This catches surprise import paths before docs or runtime guards drift. |
| package export target-shape guard | `packages/slate/test/public-surface-contract.ts` now asserts exact `main`, `module`, `types`, and `exports` target objects for every Slate v2 package. This catches wrong declaration/runtime targets and accidental root metadata, especially for subpath-only `slate-browser`. |
| package build-entry target guard | `packages/slate/test/public-surface-contract.ts` now maps every public package export target to an expected build entry, checks entry source files exist, and distinguishes package-local tsdown configs from shared root-only tsdown config users. |
| public package import smoke | `packages/slate/test/public-package-import-smoke.test.ts` now imports every allowed package/subpath through package resolution and asserts `slate-browser` root import stays unavailable. This catches stale dist and package-map mismatches. |
| public package export/type-resolution smoke | `packages/slate/test/public-package-types-smoke.ts` and `test/tsconfig.public-package-types.json` now type-resolve every allowed public package/subpath import through TypeScript with `paths: {}` so the proof uses package export/type metadata rather than monorepo source aliases. The `packages/slate` typecheck script runs it so runtime import smoke is not the only package-DX proof. |
| root workspace package links | Root `package.json` now declares `slate-layout: workspace:*` alongside the other public Slate v2 workspace packages so package consumers and smoke tests can resolve it through root `node_modules`. |
| docs proof-map package-DX type smoke | `docs/general/docs-proof-map.md` now maps package import paths, export targets, build entries, README casing, public docs/example import specifiers, runtime import smoke, and TypeScript export/type resolution to the source contract and smoke files. |
| named package declaration smoke | `public-package-types-smoke.ts` now references representative named declaration exports for every allowed public package/subpath, matching the runtime import smoke names so stale declaration exports fail TypeScript before beta review. |
| slate-browser root negative type guard | `public-package-types-smoke.ts` now mirrors the runtime smoke by asserting `slate-browser` has no root type-resolution entry while `slate-browser/browser`, `core`, `playwright`, and `transports` remain available. |
| internal bridge runtime export guard | `public-package-import-smoke.test.ts` now exact-guards the runtime export keys for `slate/internal` and `slate-dom/internal`, so sibling-only bridge growth is deliberate instead of invisible. |
| public named type declaration smoke | `public-package-types-smoke.ts` now references representative public type exports for core, DOM, React raw `Editable`/hook/overlay, and layout APIs through package declarations. `slate-react` package declarations were rebuilt after the smoke caught stale `EditableDOMStrategyLayout` declarations. |
| root workspace package link guard | `public-surface-contract.ts` now requires root `package.json` to link every public Slate v2 package with `workspace:*`, preventing stale local `node_modules` symlinks from hiding package-resolution drift. |
| public import-specifier allowlist | `packages/slate/test/public-surface-contract.ts` now derives allowed public import specifiers from package exports, excludes `/internal`, and scans public docs/package READMEs/root README/site examples so docs cannot teach invalid package paths. |
| package README casing guard | `packages/slate/test/public-surface-contract.ts` now asserts the deliberate README filename casing for every Slate v2 package using directory entries, so duplicate or accidental casing drift fails on any filesystem. |
| docs proof-map package-DX row | `docs/general/docs-proof-map.md` now maps package import paths, export targets, build entries, README casing, public docs/example import specifiers, and package import smoke to `public-surface-contract.ts` and `public-package-import-smoke.test.ts`. |
| public markdown link oracle | `packages/slate/test/public-surface-contract.ts` now strips fenced code before markdown link/anchor scans and validates reference-style link definitions, so docs code samples do not create false link failures while real broken local links still fail. |
| Slate core public docs | `docs/libraries/slate.md` and `packages/slate/Readme.md` now name `isEditor` as the public editor guard and describe middleware/debug exports as APIs instead of type-only exports. |
| package export docs | `public-surface-contract.ts` now checks the new Slate and Slate DOM library docs against actual root export source. |
| example metadata/UI | `site/constants/examples.ts`, `site/components/ExampleLayout.tsx`, and `site/public/index.css` now expose only the `alpha` example badge. `public-surface-contract.ts` guards the metadata/style hard-cut, and `example-navigation.test.ts` proves the rendered examples menu shows only Pagination `Alpha` with no `New` badge. |
| package README DX | `packages/slate-react/README.md` now starts with the current React path and names the runtime/root hook family for multi-root editors and external chrome. `surface-contract.tsx` guards that README against reverting to old or incomplete hook posture. |
| runtime/root hook API names | `useSlateViewState` and `useSlateViewEffect` were hard-renamed to `useSlateRootState` and `useSlateRootEffect` with no aliases. Slate React exports, package README, library docs, root concepts docs, multi-root example, runtime/provider tests, and public-surface guardrails now use root terminology. |
| core commit API names | `SnapshotChange`, `SnapshotChangeClass`, `OperationClass`, and internal `CommitListener` were hard-cut. Core, React, history, and layout internals now use `EditorCommit` / `EditorCommitClass`; commit subscribers use inline `(commit: EditorCommit) => void` function types; editor docs show `SnapshotListener` only for snapshot subscriptions. |
| public/runtime alias cleanup | `EditorApplyOperationsOptions`, `EditorCommandResult`, `UseSlateRootEditorOptions` as a `Pick`, `SlateAnnotationStoreRefreshOptions`, internal `RuntimeAndroidInputManager`, and `DOMCoverageSelfBoundaryProps` were hard-cut. Source now uses `EditorUpdateOptions`, literal `boolean`, an explicit root-editor options object, `SlateAnnotationRefreshOptions`, `AndroidInputManager`, and the private DOM coverage base props type directly; core and React surface contracts guard the removals. |
| projection-store runtime exports | `createSlateProjectionStore` and `isSlateSourceDirty` were removed from `slate-react` root runtime exports. Internal tests and benchmark code import `src/projection-store` directly; projection types that public options/sources reference remain exported. `surface-contract.tsx` guards the root runtime cut. |
| text rendering runtime exports | `EditableText`, `TextString`, and `ZeroWidthString` were removed from `slate-react` root runtime exports. `EditableElement` stays public because docs/examples use it for custom DOM coverage shells. Internal tests import component modules directly, and `surface-contract.tsx` guards the cut. |
| overlay store runtime exports | `createSlateAnnotationStore` and `createSlateWidgetStore` were removed from `slate-react` root runtime exports. Hooks and types stay public; internal tests import `src/annotation-store` and `src/widget-store` directly. |
| decoration runtime exports | `DefaultPlaceholder`, `composeDecorationSources`, `createDecorationSource`, and `createRangeDecorationSource` were removed from `slate-react` root runtime exports. Hook APIs and public types stay exported; `defaultScrollSelectionIntoView` remains public for scroll behavior wrapping and sibling layout integration. |
| scroll helper docs | `docs/libraries/slate-react/editable.md` now documents `defaultScrollSelectionIntoView` as the default for `Editable.scrollSelectionIntoView` and the helper to import when wrapping default scroll behavior. |
| root type docs guard | `surface-contract.tsx` now parses `slate-react` root type exports and requires every type that is not named in Slate React docs/package README to be explicitly classified in `documentedAsGroupedRootTypeExports`. |
| Slate core runtime/view docs | `docs/libraries/slate.md` and `packages/slate/README.md` now document `createEditorRuntime` and `createEditorView` as framework/runtime multi-root APIs. `public-surface-contract.ts` guards the root exports and docs coverage. |
| Slate DOM grouped utility docs | `docs/libraries/slate-dom.md` and `packages/slate-dom/README.md` now group the intentional root exports for DOM bridge installation, DOM coverage, hotkeys/clicks, DOM helpers, text-diff helpers, environment flags, decoration helpers, and `SlateDOMResolutionError`; `packages/slate-dom/test/public-surface-contract.ts` guards the docs coverage. |
| Stable package README export docs | `packages/slate-history/README.md` now names `History.isHistory`; `packages/slate-hyperscript/README.md` and `docs/libraries/slate-hyperscript.md` now name `jsx`, `createHyperscript`, `createEditor`, `createText`, `HyperscriptCreators`, and `HyperscriptShorthands`. Package-local README contracts guard both surfaces. |
| Slate Browser root alias hard cut | `slate-browser` no longer exposes a root aggregate entrypoint. `package.json`, tsdown, root/site TS path aliases, and `src/index.ts` now keep callers on `slate-browser/core`, `slate-browser/browser`, `slate-browser/playwright`, or `slate-browser/transports`; package-local and central guards cover the subpath-only shape. |
| sibling package alias hard cut | Sibling package source no longer exports pure one-name type aliases. Slate Browser proof evaluations now use explicit shapes, `evaluatePlaceholderInput` is a wrapper, Slate DOM API names are interfaces, and Slate Layout consumers use `SlatePageLayout*` types directly. |
| all-package alias guard | `packages/slate/test/public-surface-contract.ts` now scans every Slate v2 package source folder for exported pure aliases, not only Slate core and Slate React. |
| alias policy guard | `public-surface-contract.ts` now scans Slate and Slate React source for one-line pure type aliases and requires each remaining alias to be classified. Remaining allowlisted aliases are Slate-compatible node/text/range/custom-type helpers, semantic string ids, operation classification helpers, or internal projection-boundary wrappers. |
| internal view terminology boundary | `surface-contract.tsx` now guards that internal `SlateViewBoundary*` / `useSlateViewSelection*` names do not leak through the Slate React root export surface. |
| editor hook docs | `docs/libraries/slate-react/hooks.md` now explicitly says `useSlateEditor` creates an editor and `useEditor` reads the provider editor. `surface-contract.tsx` guards that distinction. |
| projection-entry hook API name | `useSlateProjections` was hard-renamed to `useSlateProjectionEntries` with no alias. The source file, exports, internal consumers, annotation/projection tests, benchmark scripts, and hooks docs now use the entry-specific name. |
| history focus-policy value | `useSlateHistory({ focusPolicy: 'preserve-dom' })` was hard-renamed to `focusPolicy: 'preserve'` with no alias. Source, docs, multi-root example, history tests, and surface guard now use the shared preserve wording. |
| Editable DOM strategy layout API | Raw `<Editable layout={...}>` / `EditableLayout` was hard-renamed to `<Editable domStrategyLayout={...}>` / `EditableDOMStrategyLayout` with no alias. `slate-layout` still exposes `PagedEditable layout` as its page-layout product API and passes the value to raw Editable internally. |
| Editable event-prop docs | `docs/libraries/slate-react/editable.md` now distinguishes React `onBeforeInput` from raw native `onDOMBeforeInput`; `surface-contract.tsx` guards that event-prop docs split. No event-prop API changed. |
| render-prop type cleanup | Stale duplicate `RenderElementProps`, `RenderLeafProps`, and `RenderTextProps` exports were removed from `components/editable.tsx`. Current public render-prop types remain owned by `editable-text-blocks` and `editable-text`; `surface-contract.tsx` guards against the old duplicates returning. |
| Slate provider projection docs | `docs/libraries/slate-react/slate.md` now says widget stores are hook-owned and `Slate` does not take a `widgetStore` prop. `surface-contract.tsx` guards both the docs sentence and type surface. |
| Slate callback change boundary | `docs/libraries/slate-react/slate.md` now frames `SlateChange` as React callback detail for the provider root and routes infrastructure that needs every raw commit to `editor.subscribeCommit`. |
| docs landing DX | `docs/libraries/slate-react/README.md` now routes readers from the landing page to runtime state, roots, runtime/root hooks, and widget hooks instead of burying that under generic hook wording. |
| Slate React export docs | `docs/libraries/slate-react/README.md`, `docs/libraries/slate-react/hooks.md`, and `packages/slate-react/README.md` now name `SlateElement`, `SlateText`, `SlateLeaf`, `SlatePlaceholder`, `useSlateNodeRef`, `useDOMStrategyVirtualOffset`, and `useSlateRangeDecorationSource`. `surface-contract.tsx` guards those names and the `SlateRangeDecorationSourceOptions` hook docs coverage. |
| public doc guardrails | `public-surface-contract.ts` now includes package `README.md` files in public documentation checks, guards the `SlateChange` callback-detail docs boundary, and skips generated/vendor folders during recursive scans. Changelogs stay historical-only and are not treated as latest-state docs. |
| browser proof coverage | `select.test.ts` was removed as an orphan route proof; its quote-button assertion now lives in the route-owned richtext triple-click spec. `public-surface-contract.ts` now rejects orphan browser specs unless they are route-owned, alias-owned, or explicit utility proofs. |
| proof map | `docs/general/docs-proof-map.md` now anchors package README guardrails, runtime/root hook routing, hard-cut API proof owners, raw Editable DOM strategy layout, provider/widget-store boundaries, example route proof coverage, example navigation metadata, and visual/native selection screenshot proof. |
| package README export claims | `packages/slate-dom/README.md` now imports both `DOMCoverage` and `Hotkeys`; `public-surface-contract.ts` asserts Slate and Slate DOM package README root-export claims against source exports. |
| slate-dom type docs | `packages/slate-dom/README.md` and `docs/libraries/slate-dom.md` now group public type exports for DOM bridge APIs, DOM coverage policies/results, DOM primitive aliases, hotkey types, and text-diff types; `packages/slate-dom/test/public-surface-contract.ts` guards those anchors. |
| slate core type docs | `packages/slate/README.md` and `docs/libraries/slate.md` now group public type exports for core editor/value/runtime/commit/read-update/extension/middleware/debug families; `packages/slate/test/public-surface-contract.ts` guards those anchors. |
| projection wording | Root README, Slate React README, Slate React library README, performance walkthrough, and hook docs now use projection infrastructure/sources or decoration sources for public summaries; raw projection-store wording remains only in internal/negative guard tests. |
| package subpath docs | `packages/slate/README.md` and `packages/slate-dom/README.md` now mark `/internal` as sibling-package-only. `public-surface-contract.ts` checks exported subpaths for Slate, Slate DOM, Slate Browser, and Slate Layout against README coverage. |
| slate-browser package docs | `packages/slate-browser/README.md` now explicitly names `core` proof classifiers/release artifacts/plugin contracts and `browser` DOM snapshot helpers. `packages/slate-browser/test/core/package-scripts.test.ts` guards the README against drifting back to vague subpath labels. |
| root README quickstart | `Readme.md` now imports `useSlateEditor` and seeds the editor through `useSlateEditor<CustomValue>({ initialValue })`; `public-surface-contract.ts` guards the root README against drifting back to `useState(() => createReactEditor(...))`. |
| root README package table | `public-surface-contract.ts` now asserts every package row in `Readme.md` and rejects migration/deprecated wording there. |
| React-owned docs front door | `docs/concepts/09-rendering.md` and `docs/libraries/slate-history/history-extension-setup.md` now teach React-owned editor setup through `useSlateEditor`; direct `createReactEditor` remains only in explicit low-level React editor setup/reference docs and huge-document control surfaces. Slate React and History contracts guard the current docs shape. |
| Slate History package README | `packages/slate-history/Readme.md` now says `useSlateEditor` installs history by default for Slate React editors; `packages/slate-history/test/package-readme-contract.test.ts` guards the package README against drifting back to `createReactEditor`. |
| TypeScript concept docs | `docs/concepts/12-typescript.md` now teaches React value generics and annotated initial values through `useSlateEditor<CustomValue>` instead of `createReactEditor` plus `useState`; `packages/slate-react/test/surface-contract.tsx` guards that concept page. |
| Slate React package README | `packages/slate-react/Readme.md` keeps `createReactEditor` public and findable, but classifies it as the lower-level factory for outside React component ownership or same-lifetime custom hooks. |
| Package README path casing | `packages/slate/test/public-surface-contract.ts`, `packages/slate-react/test/surface-contract.tsx`, `packages/slate-history/test/package-readme-contract.test.ts`, and `packages/slate-hyperscript/test/package-readme-contract.test.ts` now read actual `Readme.md` filenames where the package uses that casing. The central public-doc collection now includes both `README.md` and `Readme.md`. |
| Proof map path casing | `docs/general/docs-proof-map.md` now points at exact package README casing and uses `projection infrastructure` instead of `projection stores` for the public overlay row. |
| skills/workflow | Active plan now records the resumed-scan workflow repair: latest-state public-doc wording audits must use `.tmp/slate-v2` owner allowlists, count-first scans, and explicit exclusions for plans/research/issues/drafts/generated output/parent docs/changelogs. |
| reverted/quarantined packets | No active runtime packet remains quarantined. Speculative/incorrect proof attempts were repaired in tests/contracts and rerun; no dirty half-patch is intentionally left outside the kept current tree. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Runtime/root hook hard rename | Public API changed from `useSlateViewState` / `useSlateViewEffect` to `useSlateRootState` / `useSlateRootEffect` with no aliases. | `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-runtime.tsx`; `.tmp/slate-v2/docs/libraries/slate-react/hooks.md`; `.tmp/slate-v2/site/examples/ts/multi-root-document.tsx` | Approved by user; keep root names. |
| 2 | Projection/root export boundary hard cuts | Public root no longer exports `useSlateProjections`, raw projection-store constructors, raw overlay store constructors, raw decoration constructors, `DefaultPlaceholder`, or text-rendering internals; public API keeps hooks, types, `EditableElement`, `defaultScrollSelectionIntoView`, and `useSlateProjectionEntries`. | `.tmp/slate-v2/packages/slate-react/src/index.ts`; `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-projection-entries.tsx`; `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`; `.tmp/slate-v2/docs/libraries/slate-react/hooks.md`; `.tmp/slate-v2/docs/libraries/slate-react/editable.md` | Approved by user; keep app-facing hooks/types and custom-shell primitives, raw stores/text DOM internals private. |
| 3 | Raw Editable expert prop naming | Raw `Editable` prop/type changed from `layout` / `EditableLayout` to `domStrategyLayout` / `EditableDOMStrategyLayout`; `PagedEditable layout` stayed as the wrapper API. | `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`; `.tmp/slate-v2/packages/slate-layout/src/react.tsx`; `.tmp/slate-v2/docs/libraries/slate-react/editable.md` | Approved by user; keep explicit raw name and wrapper split. |
| 4 | Alias and transaction hard cuts | Removed duplicate commit/change names, smaller pure aliases, sibling-package pure aliases, and `tx.nodes.insertMany`; kept Slate-compatible augmentation aliases such as `Range = BaseRange`. | `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts`; `.tmp/slate-v2/packages/slate/src/core/public-state.ts`; `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx`; `.tmp/slate-v2/docs/api/transforms.md` | Approved by user; keep no fake aliases and preserve Slate-compatible base aliases. |
| 5 | Package-DX and beta proof posture | Fast/current proof is strict: exact package export maps, target shapes, build entries, import smoke, public docs import allowlist, README casing, private-alpha release-discipline, and `slate-layout` documented as proof-gated/experimental. | `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`; `.tmp/slate-v2/packages/slate/test/public-package-import-smoke.test.ts`; `.tmp/slate-v2/docs/general/docs-proof-map.md`; `.tmp/slate-v2/packages/slate-layout/test/page-layout-contract.test.ts` | Approved by user; keep strict package-DX guards and `slate-layout` experimental unless pagination is explicitly requested. |

Review anchor proof commands:
| Review item | Focused proof |
|-------------|---------------|
| Runtime/root hook hard rename | `.tmp/slate-v2`: `bun test ./packages/slate-react/test/surface-contract.tsx` |
| Projection/root export boundary hard cuts | `.tmp/slate-v2`: `bun test ./packages/slate-react/test/surface-contract.tsx` |
| Raw Editable expert prop naming | `.tmp/slate-v2`: `bun test ./packages/slate-react/test/surface-contract.tsx && bun --filter ./packages/slate-layout test` |
| Alias and transaction hard cuts | `.tmp/slate-v2`: `bun test:release-discipline` |
| Package-DX and beta proof posture | `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts && cd packages/slate && bun test ./test/public-package-import-smoke.test.ts` |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| round-3-api-taste | soft taste | Keep `useSlateEditor`, no `<Slate initialValue>`, separate change callbacks, `subscribeCommit`, root hooks, expert `layout`, DOM coverage boundaries, annotation/widget projector APIs, and weak maps internal-only. | Confirms current public API taste before deeper cleanup. | API hard-cuts that would rename/remove those surfaces. | Docs/source proof, stale wording cleanup, contract audits. | Approve all unless a name feels wrong. | Queued in checkpoint zero. |
| round-4-api-taste | soft taste | Keep provider-root `onChange` value, `subscribe` vs `subscribeCommit` split, local-only `Editable.decorate`, provider-owned overlay inputs, `renderSegment`, runtime-only `<Slate root>`, `tx.*` public writes, and short real package READMEs. | Confirms docs/API explanation layer after live source audit. | Public API removals or naming changes tied to these decisions. | Docs/source audits and contract repairs that reinforce current behavior. | Approve all unless docs should teach a different primary path. | User-facing Round 4 prompt in current thread. |
| round-5-api-beta-taste | soft taste | Keep `slate-browser` proof-infra public but not app API; core namespaces low-level while docs push `read/update` + `state/tx`; old names only in changelogs; `Editable` DOM strategy expert-only; raw mobile deferred; benchmark scripts visible; screenshot artifacts not checked-in snapshots; private-alpha framing until explicit release ask. | Confirms beta-readiness taste after release-discipline and visual/perf proof. | Public docs packaging, DOM strategy docs, mobile claims, and benchmark/readme framing. | Docs/readme review and safe proof packets. | Approve all 8; revisit DOM strategy doc visibility if it feels too public. | Queued during loop 13. |
| round-6-package-boundary-taste | soft taste | Keep core Slate and Slate DOM as first-class site library docs, keep `/internal` exported only as sibling-package bridge, and tighten any package importing that bridge to the current runtime peer floor. | Confirms package-boundary taste after export/docs and peer-floor audit. | Removing internal subpaths or loosening package floors. | Docs/package coherence and public-surface contract repairs. | Approve all 3. | Queued during loop 20. |
| round-7-package-proof-taste | soft taste | Keep package READMEs short current-state API docs, keep `/internal` sibling-package-only, classify non-route browser specs as utility proof, and document package subpaths only when users should import them. | Confirms package proof boundaries after README, route-proof, and subpath guardrails. | Broader package docs, subpath exposure, or browser proof topology changes. | Contract/readme/proof-map repairs and fast gates. | Approve all 4. | Queued during loop 40. |
| round-8-runtime-root-hook-name-taste | review taste | Hard-renamed `useSlateViewState` / `useSlateViewEffect` to `useSlateRootState` / `useSlateRootEffect` with no aliases. | Public callers pass roots; `view` was internal vocabulary and conflicted with adjacent root-named hooks. | Reverting or renaming these APIs again. | API/docs/examples/tests/fast-gate proof after the hard cut. | Approved by user; keep root names. | Implemented during loops 41-42; approved. |
| round-9-state-field-hook-name-taste | soft taste | Keep `useStateFieldValue` and `useSetStateField` as-is. | These names pair directly with `defineStateField`; `Slate` prefix would add length without adding meaning. | Renaming state-field hooks. | Docs/proof-map/source audit only; no patch. | Approve keep-as-is. | Queued during loop 43. |
| round-10-editor-hook-name-taste | soft taste | Keep `useSlateEditor` for editor creation and `useEditor` for reading the provider editor. | The pair is close but useful; `useSlateEditorContext` would be noisy. | Renaming `useEditor`. | Docs clarity patch and surface-contract proof. | Approve keep-as-is. | Queued during loop 44. |
| round-11-projection-entry-hook-name-taste | review taste | Hard-renamed `useSlateProjections` to `useSlateProjectionEntries` with no alias. | The hook returns projected entries for one runtime id; the old name hid the return shape and was undocumented. | Reverting or renaming this low-level hook again. | Docs/source/tests/benchmark/fast-gate proof after hard cut. | Approved by user; keep `useSlateProjectionEntries`. | Implemented during loops 45-46; approved. |
| round-12-history-focus-policy-taste | review taste | Hard-renamed `useSlateHistory({ focusPolicy: 'preserve-dom' })` to `focusPolicy: 'preserve'` with no alias. | History and command hooks should share the same public wording for preserving focus. | Reverting or renaming this option value again. | Source/docs/example/tests/fast-gate proof after hard cut. | Approved by user; keep `preserve`. | Implemented during loops 47-48; approved. |
| round-13-editable-dom-strategy-layout-taste | review taste | Hard-renamed raw `Editable layout` / `EditableLayout` to `domStrategyLayout` / `EditableDOMStrategyLayout` with no alias. | Raw `Editable` should not expose generic layout vocabulary for a DOM-strategy-only expert hook. | Reverting or renaming this raw prop/type again. | Source/docs/tests/slate-layout wrapper/fast-gate proof after hard cut. | Approved by user; keep `domStrategyLayout` and `PagedEditable layout` split. | Implemented during loops 49-50; approved. |
| round-14-editable-event-prop-taste | soft taste | Keep raw `Editable onKeyDown` for one-surface UI hotkeys, keep `onDOMBeforeInput` for native `InputEvent`, and keep `onCommand` out. | Model behavior belongs in extension transforms; raw Editable stays focused on rendering and DOM events. | Renaming event props or adding an Editable command registry. | Docs clarity patch and fast-gate proof. | Approve keep-as-is. | Queued during loops 51-52. |
| round-15-render-prop-type-owner-taste | soft taste | Removed duplicate render-prop type exports from the low-level DOM-root file. | One public owner beats stale source-local type aliases that docs/root exports do not use. | Reintroducing a separate DOM-root render-prop type surface. | Source cleanup, surface guard, package typecheck, and fast-gate proof. | Approve deletion. | Queued during loops 53-54. |
| round-16-provider-widget-prop-taste | soft taste | Keep `widgetStore` out of `<Slate>` provider props; widget stores are created and read through hooks. | `Slate` should own shared projection sources only where the provider needs to distribute them. | Adding provider-owned widget store wiring. | Docs clarity patch, type guard, and fast-gate proof. | Approve keep-as-is. | Queued during loops 55-56. |
| round-17-annotation-widget-hook-taste | soft taste | Keep annotation/widget hook names and default-store behavior as-is: annotation reads may use provider store; widget reads take an explicit widget store. | Store creation vs snapshot/item reads are already clear, and implicit widget provider state would bloat `<Slate>`. | Renaming annotation/widget hooks or adding provider-backed widget reads. | Source/docs/export/contract audit; no patch. | Approve keep-as-is. | Queued during loop 57. |
| round-18-slate-change-name-taste | soft taste | Keep `SlateChange` as the short React callback payload type for `<Slate>` callbacks. | It carries root value plus commit/snapshot flags for React UI; lower-level infrastructure already has `EditorCommit` and `editor.subscribeCommit`. | Renaming `SlateChange` or making it the primary command/commit API. | Docs/type guard and focused package proof. | Approve keep-as-is unless you want the more literal `SlateRootChange`. | Queued during loop 61. |
| round-19-core-commit-alias-taste | review taste | Removed `SnapshotChange`, `SnapshotChangeClass`, `OperationClass`, and internal `CommitListener`; use `EditorCommit`, `EditorCommitClass`, and inline commit listener function types directly. | The aliases named the same commit concept twice and made React `SlateChange` vs core change/commit vocabulary muddier. | Reintroducing the aliases or renaming `SnapshotListener`. | Source-wide rewrite, docs correction, hard-cut guards, release-discipline, package/site typechecks, and full fast gate. | Approve no-alias shape; keep `SnapshotListener` because it subscribes to snapshots. | Queued during loops 63-65. |
| round-20-public-runtime-alias-taste | review taste | Removed `EditorApplyOperationsOptions`, `EditorCommandResult`, `UseSlateRootEditorOptions` as a `Pick`, `SlateAnnotationStoreRefreshOptions`, internal `RuntimeAndroidInputManager`, and `DOMCoverageSelfBoundaryProps`; kept Slate-compatible base aliases such as `Range = BaseRange`, `Point = BasePoint`, `Element = BaseElement`, and `Text = BaseText`. | The removed aliases added no meaning; the Slate-compatible base names are part of the public/custom-types mental model and cutting them would be a much bigger API decision. | Reintroducing the removed aliases or flattening the Slate-compatible base aliases. | Source cleanup, source scan, core/React surface guards, package/site typechecks, and full fast gate. | Approve removing fake duplicate names while preserving Slate-compatible augmentation aliases. | Queued during loops 66-68. |
| round-21-react-export-docs-taste | soft taste | Keep docs strategy where public render primitives and advanced helper hooks are named, but low-level metrics/options types are grouped by the API that uses them. | Docs stay discoverable without becoming a generated export dump. | Exhaustively documenting every exported Slate React type. | Docs/README coverage and React surface guard. | Approve this docs policy unless you want every exported type surfaced individually. | Queued during loop 73. |
| round-22-projection-store-root-runtime-taste | review taste | Removed `createSlateProjectionStore` and `isSlateSourceDirty` from the `slate-react` root runtime exports. | Apps already have decoration/range-decoration sources, annotations, widgets, and projection-entry reads; exposing raw store construction made the root API more internal than docs allowed. | Reintroducing the raw projection-store runtime values as public root exports. | Internal tests/benchmarks now import the implementation directly; root export guard and full fast gate passed. | Approved by user; keep raw projection-store values private. | Queued during loop 74; approved. |
| round-23-text-rendering-root-runtime-taste | review taste | Removed `EditableText`, `TextString`, and `ZeroWidthString` from the `slate-react` root runtime exports, while keeping `EditableElement`. | `EditableElement` is a documented public custom-shell helper; the text components are Slate React internals for string and zero-width DOM. | Reintroducing raw text rendering internals as public root exports. | Primitive/render-profiler tests import internals directly; root export guard and full fast gate passed. | Approved by user; keep custom-shell public and text DOM internals private. | Queued during loop 75; approved. |
| round-24-overlay-store-constructor-taste | review taste | Removed `createSlateAnnotationStore` and `createSlateWidgetStore` from the `slate-react` root runtime exports. | The hook APIs own store lifecycle for apps; raw constructors are implementation/test machinery unless we deliberately expose expert non-hook stores. | Reintroducing raw store constructors as public root exports. | Annotation/widget contracts import internals directly; root export guard and full fast gate passed. | Approved by user; keep hook-first overlay API. | Queued during loop 76; approved. |
| round-25-decoration-constructor-taste | review taste | Removed `DefaultPlaceholder`, `composeDecorationSources`, `createDecorationSource`, and `createRangeDecorationSource` from the `slate-react` root runtime exports; kept `defaultScrollSelectionIntoView`. | The hook APIs own decoration source lifecycle for apps; custom placeholders can render their own DOM, while scroll behavior is useful to wrap and is used by `slate-layout`. | Reintroducing raw decoration constructors or default placeholder as public root exports. | Decoration/projection/DOM strategy contracts import internals directly; root export guard and full fast gate passed. | Approved by user; keep hook-first decoration APIs and only the scroll-default helper public. | Queued during loop 77; approved. |
| round-26-transaction-helper-alias-taste | soft taste | Treat `tx.nodes.insertMany` as an alias-shaped helper and cut it if it only duplicates `tx.nodes.insert`. | The user approved alias hard-cuts, and transaction docs should not normalize duplicate helper names. | Keeping a separate bulk insert helper name without distinct semantics. | Source/type/test audit proved no distinct semantics; hard cut completed. | Approved by user; keep `tx.nodes.insert` only. | Queued during loop 99; approved and implemented. |

Findings:

- Read-first docs confirm current API posture: `useSlateEditor` / editor
  creation owns initial value, `<Slate>` owns provider/root callbacks,
  `state`/`tx` owns normal read/write API, projections own durable overlays,
  and raw-device/mobile plus pagination remain scoped/deferred unless named.
- Live `slate-react` source confirms current Round 3 behavior for
  `useSlateEditor`, separate `onChange` / `onValueChange` /
  `onSelectionChange`, runtime/root hooks, DOM coverage boundary types, and
  annotation/widget exports.
- Public installing walkthrough had a wording bug: it could imply
  `initialValue` seeds when `<Slate>` mounts. The source API seeds when the
  editor is created.
- Slate React front-door docs were inconsistent: most examples already used
  `useSlateEditor`, but the installing walkthrough, setup page, and provider
  page still taught `useState(() => createReactEditor(...))` first.
- Core walkthroughs 02-05 had the same stale factory pattern. The command
  extension walkthrough can use `useSlateEditor({ extensions, initialValue })`
  directly.
- `<Slate>` docs listed operation replay under `editor.subscribe(...)`; current
  docs should reserve replay/instrumentation language for
  `editor.subscribeCommit(...)`.
- Runtime/root hook docs had source-backed API names but sparse option docs.
  The source exposes selector `deps`/`equalityFn`/`shouldUpdate`/`deferred`,
  root-editor `readOnly`, view-effect `root`/`deps`, and command callback
  `root`/`focus` with default `preserve`.
- Stale legacy hook names from the alias scan are confined to
  `packages/*/CHANGELOG.md` historical files and guard tests. The escape-hatch
  inventory explicitly classifies package changelogs as historical-only, and
  package manifests ship only `dist/`.

Decisions and tradeoffs:

- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Quoted `rg` pattern with backticks caused a zsh unmatched-quote failure | 1 | Use simpler single-quoted or file-scoped searches | Resolved by targeted file reads and follow-up focused source/doc audit. |
| Used `test:vitest` for `surface-contract.tsx` even though the script only includes `*.test.tsx` files | 1 | Use direct `bun test ./packages/slate-react/test/surface-contract.tsx` | Resolved; direct Bun contract passed. |
| Hook-doc assertion matched across markdown line wrapping too exactly | 1 | Assert a stable phrase instead of the full wrapped sentence | Resolved; contract passed after assertion fix. |
| zsh glob for `.tmp/slate-v2/packages/*/.npmignore` failed when no file matched | 1 | Use `find` for optional files instead of unguarded globs | Resolved; `find` confirmed real changelog files and no package `.npmignore` evidence needed. |
| `bun check` failed on formatter output in `public-surface-contract.ts` | 2 | Apply formatter's exact wrap shape manually, then rerun full fast gate | Resolved; `bun check` passed after formatting fixes. |
| `bun check` failed on stale package-local Slate DOM README oracle | 1 | Update the package-local contract to match the accepted README import claim instead of weakening the README | Resolved; `bun check` passed after `packages/slate-dom/test/public-surface-contract.ts` expected `DOMCoverage, Hotkeys`. |
| Bun direct filters did not match Slate React Vitest-owned contract files | 1 | Run `cd packages/slate-react && bun test:vitest` for package React contracts; keep direct Bun paths for known Bun contracts | Resolved; Slate React Vitest passed 59 files / 812 tests. |
| `bun check` failed on import order/formatting after root-hook rename | 1 | Apply Biome's import/order and wrapping output, then rerun full fast gate | Resolved; `bun check` passed after formatting repair. |
| Backtick-containing `rg` patterns caused shell command substitution during markdown/API audits | 2 | Use `rg -F` with single quotes or Node/file assertions for code-span and option-value checks | Resolved for history policy by using safe literal scans and source contracts; recorded as reusable workflow slowdown. |
| Broad `Editable` prop scan streamed too many DOM-strategy test matches | 1 | Switch to owner source, docs, surface contract, and exact dependent call-site scans | Resolved; hard cut completed and workflow slowdown recorded. |
| Strict package declaration probe first used Bun ambient types and hid the real error under Bun/Node conflicts | 1 | Re-run with `--types node,react,react-dom` or encode those types in the smoke tsconfig | Resolved; `test/tsconfig.public-package-types.json` now uses Node/React ambient types only with `skipLibCheck: false`. |
| Dts `compilerOptions.paths = {}` experiment made dependent package declaration builds read private core/source names | 1 | Use a declaration-build tsconfig that maps public package imports to built `dist` declarations, then fix source type leaks explicitly | Resolved; package declaration builds, focused typechecks, and `bun check` passed. |
| `bun typecheck:packages` failed after raw `Editable` prop rename because `slate-layout` still imported `EditableLayout` and passed `layout` to raw `Editable` | 1 | Patch dependent wrapper boundary, preserving `PagedEditable layout` as product API | Resolved; package/site typechecks, slate-layout tests, and `bun check` passed. |
| `bun check` failed on formatter-only ordering after `domStrategyLayout` rename | 1 | Run targeted Biome write on touched files, then rerun `bun check` | Resolved; `bun check` passed. |
| Event-prop docs contract matched a wrapped markdown sentence too exactly | 1 | Assert stable fragments instead of a full wrapped sentence | Resolved; focused contract and `bun check` passed. |
| `bun check` failed on import formatting after deleting stale render-prop interfaces | 1 | Run targeted Biome write on the touched source file | Resolved; `bun check` passed. |
| Provider projection docs contract matched a wrapped markdown sentence too exactly | 1 | Assert stable fragments instead of a full wrapped sentence | Resolved; focused contract and `bun check` passed. |
| Broad latest-state wording scan after compaction included unrelated parent/run artifacts | 1 | Re-run only owned public docs/READMEs with count-first output and focused reads for hits | Resolved; scoped scan found only legitimate domain uses of `removed` in plugin/normalizing docs. |
| Slate Browser README contract banned a harmless phrase after concrete symbols were listed | 1 | Keep positive symbol checks and remove the over-broad negative wording assertion | Resolved; `bun --filter slate-browser test:core` passed on rerun. |
| Alias wording guard first scanned public example implementation code and caught Prism `token.alias` | 1 | Keep alias wording ban on public Markdown/docs only; leave implementation fields to source/API export guards | Resolved; public-surface contract passed 850 tests and `bun check` passed. |
| Shell `rg` scan for fenced code used raw backticks and hit zsh unmatched-quote behavior | 1 | Use Node/file parsing for Markdown code fences and avoid shell regexes that contain raw fence syntax | Resolved; parser probe found the two real TSX snippet failures. |
| First `bun check` after code-fence guard failed on helper lint/formatting | 2 | Apply Biome-compatible helper shape, then rerun focused contract and full fast gate | Resolved; focused public-surface contract and `bun check` passed. |
| First predicate-input hard-cut typecheck failed on `unknown` narrowing spots | 1 | Keep the rewrite, add explicit object/numeric/DOM narrowing, and rerun focused package typechecks | Resolved; Slate, Slate DOM, and Slate History typechecks passed. |
| Strict public package type smoke was first run from repo root with a package-local config path | 1 | Run package-local smoke commands from `packages/slate` or use the full config path | Resolved; rerun from `packages/slate` passed. |
| First `bun check` after predicate-input hard cut failed on formatter-only wrapping | 1 | Apply Biome wrapping exactly and rerun full gate | Resolved; `bun check` passed. |
| First declaration-level predicate-input smoke could tolerate `never` if first-argument extraction failed | 1 | Add `ExpectTrue`, `IsNever`, and `IsAny` checks so proof fails on `any` or failed extraction | Resolved; strict package type smoke and `bun check` passed after the proof repair. |
| First `bun check` after strengthening the type smoke failed on large formatter-only wrapping | 1 | Format the single touched smoke file with Biome instead of hand-wrapping dozens of type rows | Resolved; strict smoke, Slate typecheck, and `bun check` passed. |

Verification evidence:

- `.tmp/slate-v2/packages/slate`: `bunx tsc --project
test/tsconfig.public-package-types.json --noEmit --skipLibCheck false --types
node,react,react-dom` -> passed after adding declaration-level unknown
  predicate input assertions.
- `.tmp/slate-v2`: `bun --filter ./packages/slate typecheck` -> passed after
  adding the public package unknown predicate type smoke.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> passed 941 tests after the package type-smoke guard addition.
- `.tmp/slate-v2`: `bun check` -> passed after the declaration-level unknown
  predicate smoke.
- `.tmp/slate-v2`: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run
playwright playwright/integration/examples/richtext.test.ts
playwright/integration/examples/plaintext.test.ts
playwright/integration/examples/markdown-shortcuts.test.ts
playwright/integration/examples/editable-voids.test.ts --project=chromium -g
"undo restores deleted selected text|keyboard undo restores caret after
middle-line typing|creates current markdown shortcuts and can undo and redo a
heading shortcut|moves across editable void child-root boundaries with
keyboard"` -> passed 4 tests.
- `.tmp/slate-v2`: `bun test:release-discipline` -> passed 985 tests after the
  predicate-input API hard cut. Private-alpha proof only, not release/publish.
- `.tmp/slate-v2`: `bun --filter slate-browser test:core` -> passed 77 tests,
  including package subpath runtime exactness, README subpath proof APIs,
  keyboard oracle audit, scenario helpers, native event trace helpers, and
  selection snapshot helpers.
- `.tmp/slate-v2`: predicate-only drift scan for `value: any` / `props: any`
  in public checker source/docs -> no matches; remaining `editor.ts` `value:
any` hits are mark payload APIs and deliberately outside this packet.
- `.tmp/slate-v2`: `bun --filter ./packages/slate typecheck`, `bun --filter
./packages/slate-dom typecheck`, and `bun --filter ./packages/slate-history
typecheck` -> passed after explicit unknown-boundary narrowing.
- `.tmp/slate-v2`: `bun build:packages` -> passed and regenerated package
  declarations after public source type changes.
- `.tmp/slate-v2/packages/slate`: `bunx tsc --project
test/tsconfig.public-package-types.json --noEmit --skipLibCheck false --types
node,react,react-dom` -> passed after package declaration rebuild.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> passed 941 tests after predicate input guards.
- `.tmp/slate-v2`: `bun check` -> passed after predicate input hard cut,
  declaration rebuild, and formatter repair.
- `.tmp/slate-v2`: independent Node/TypeScript public Markdown code-fence
  probe -> 319 JS/TS fences, zero parse failures after fixing two Slate React
  provider snippets.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> passed 919 tests after adding the code-fence parser guard.
- `.tmp/slate-v2`: `bun typecheck:site` -> passed after fixing the Slate React
  docs snippets.
- `.tmp/slate-v2`: `bun check` -> passed after the code-fence guard, covering
  lint, package/site/root typechecks, 1252 Bun tests / 91 skips, 49 Slate
  Layout tests, and 821 Slate React Vitest tests.
- `.tmp/slate-v2`: focused public docs/README scan for
  `alias|aliases|compat|deprecated|legacy|migration|previously|now supports|old API|new API`
  -> no matches after the Slate DOM docs wording patch.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> passed 850 tests after adding the public Markdown no-alias wording guard.
- `.tmp/slate-v2`: `bun typecheck:site` -> passed after the public docs wording
  patch.
- `.tmp/slate-v2`: `bun check` -> passed after the public no-alias docs guard,
  covering lint, package/site/root typechecks, 1252 Bun tests / 91 skips, 49
  Slate Layout tests, and 821 Slate React Vitest tests.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> passed 780 tests after adding the root workspace package link guard.
- `.tmp/slate-v2`: `bun check` -> passed after the root workspace package link
  guard, covering lint, package/site/root typechecks, 1252 Bun tests / 91
  skips, 49 Slate Layout tests / 169 expects, and 821 Slate React Vitest tests.
- `.tmp/slate-v2`: `bun test:release-discipline` -> passed 823 tests after the
  package-DX oracle upgrades. This remains private-alpha proof only, not
  release/publish authorization.
- `.tmp/slate-v2/packages/slate`: first strict run after adding
  representative public type declarations failed because
  `slate-react/dist/index.d.ts` had no exported `EditableDOMStrategyLayout`.
- `.tmp/slate-v2`: `bun --filter ./packages/slate-react build` -> passed and
  regenerated the affected package declaration artifacts.
- `.tmp/slate-v2/packages/slate`: `bunx tsc --project
test/tsconfig.public-package-types.json --noEmit` -> passed after rebuilding
  `slate-react`.
- `.tmp/slate-v2`: `bun --filter ./packages/slate typecheck && bun check` ->
  passed after the named public type declaration smoke, covering lint,
  package/site/root typechecks, 1252 Bun tests / 91 skips, 49 Slate Layout
  tests / 169 expects, and 821 Slate React Vitest tests.
- `.tmp/slate-v2/packages/slate`: `bun test
./test/public-package-import-smoke.test.ts` -> passed 15 tests / 27 expects
  after adding exact runtime export guards for `slate/internal` and
  `slate-dom/internal`.
- `.tmp/slate-v2`: `bun check` -> passed after the internal bridge exactness
  guard, covering lint, package/site/root typechecks, 1252 Bun tests / 91
  skips, 49 Slate Layout tests / 169 expects, and 821 Slate React Vitest tests.
- `.tmp/slate-v2/packages/slate`: `public-package-types-smoke.ts` now mirrors
  the runtime smoke by asserting root `slate-browser` type resolution fails
  with `@ts-expect-error`, while all public `slate-browser/*` subpaths resolve.
- `.tmp/slate-v2`: first `bun check` after the negative root guard failed on
  Biome unused-type-alias lint for `SlateBrowserRootModule`; prefixing the
  alias with `_` made the intentional negative guard lint-safe.
- `.tmp/slate-v2`: `bun --filter ./packages/slate typecheck && bun check` ->
  passed after the negative root type-resolution guard, covering lint,
  package/site/root typechecks, 1250 Bun tests / 91 skips, 49 Slate Layout
  tests / 169 expects, and 821 Slate React Vitest tests.
- `.tmp/slate-v2/packages/slate`: `public-package-types-smoke.ts` now
  references representative named declaration exports for every allowed public
  package/subpath, aligned with the runtime import-smoke names.
- `.tmp/slate-v2/packages/slate`: `bunx tsc --project
test/tsconfig.public-package-types.json --noEmit` -> passed after adding
  named declaration export references.
- `.tmp/slate-v2`: `bun --filter ./packages/slate typecheck` -> passed after
  adding named declaration export references.
- `.tmp/slate-v2`: `bun check` -> passed after adding named declaration export
  references, covering lint, package/site/root typechecks, 1250 Bun tests / 91
  skips, 49 Slate Layout tests / 169 expects, and 821 Slate React Vitest tests.
- `.tmp/slate-v2`: `docs/general/docs-proof-map.md` now anchors package import
  paths, export targets, build entries, README casing, public docs/example
  import specifiers, runtime import smoke, and TypeScript export/type
  resolution to `public-surface-contract.ts`,
  `public-package-import-smoke.test.ts`,
  `public-package-types-smoke.ts`, and
  `tsconfig.public-package-types.json`.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts
&& bun typecheck:site` -> passed after the proof-map type-smoke anchor:
  779 public-surface tests plus site typecheck.
- `.tmp/slate-v2`: `bun check` -> passed after the proof-map type-smoke
  anchor, covering lint, package/site/root typechecks, 1250 Bun tests / 91
  skips, 49 Slate Layout tests / 169 expects, and 821 Slate React Vitest tests.
- `.tmp/slate-v2/packages/slate`: after setting
  `compilerOptions.paths` to `{}` in
  `test/tsconfig.public-package-types.json`, strict package export/type
  resolution initially failed on `slate-layout` and `slate-layout/react`.
  Root `node_modules` linked the other Slate packages but not `slate-layout`.
- `.tmp/slate-v2`: root `package.json` now declares
  `slate-layout: workspace:*`; `bun install` completed and saved the lockfile
  with no package changes reported.
- `.tmp/slate-v2/packages/slate`: `bunx tsc --project
test/tsconfig.public-package-types.json --noEmit` -> passed with
  `paths: {}`, proving the public package/subpath import types resolve through
  package export/type metadata instead of repo source aliases.
- `.tmp/slate-v2`: `bun --filter ./packages/slate typecheck` -> passed after
  the strict package export/type smoke repair.
- `.tmp/slate-v2`: `bun check` -> passed after the strict package export/type
  smoke repair, covering lint, package/site/root typechecks, 1250 Bun tests /
  91 skips, 49 Slate Layout tests / 169 expects, and 821 Slate React Vitest
  tests.
- `.tmp/slate-v2/packages/slate`: direct `tsc --project
test/tsconfig.public-package-types.json --noEmit` was not available on shell
  PATH; `bunx tsc --project test/tsconfig.public-package-types.json --noEmit`
  initially exposed missing React JSX/type config for source-path package
  imports, then passed after the smoke tsconfig set `jsx: react-jsx` and React
  types.
- `.tmp/slate-v2`: `bun --filter ./packages/slate typecheck` -> passed after
  adding `test/public-package-types-smoke.ts` and wiring
  `test/tsconfig.public-package-types.json` into the package typecheck script.
- `.tmp/slate-v2`: first `bun check` after the public package type-resolution
  smoke failed on lint/format only (`noUnusedVariables` for the type parameter
  and JSON wrapping); after exact cleanup, `bun check` passed, covering lint,
  package/site/root typechecks, 1250 Bun tests / 91 skips, 49 Slate Layout
  tests / 169 expects, and 821 Slate React Vitest tests.
- `.tmp/slate-v2`: `bun check` -> passed after the markdown-link oracle and
  proof-plan updates, covering lint, package/site/root typechecks, 1250 Bun
  tests / 91 skips, 49 Slate Layout tests / 169 expects, and 821 Slate React
  Vitest tests.
- `.tmp/slate-v2`: scoped latest-state wording scan over root README, docs,
  package READMEs, and examples found only legitimate hits:
  `docs/concepts/08-plugins.md` plugin removal prose,
  `docs/concepts/11-normalizing.md` normalizer removal/null-operation prose,
  and `site/examples/ts/utils/normalize-tokens.ts` token `alias` data.
- `.tmp/slate-v2`: `rg --files site/examples/ts | xargs wc -l | sort -nr
| head -25` -> top examples: `pagination.tsx` 2095 lines, `code-highlighting.tsx`
  831, `huge-document.tsx` 773, `mentions.tsx` 738, `comment-mode.tsx` 674. `site/constants/examples.ts` keeps only Pagination marked `alpha`, and
  public-surface contract guards the normal-example direct-factory exception
  to `huge-document.tsx`.
- `.tmp/slate-v2`: review-anchor proofs passed:
  `bun test ./packages/slate-react/test/surface-contract.tsx` -> 49 tests /
  306 expects; `bun --filter ./packages/slate-layout test` -> 49 tests / 169
  expects; `bun test ./packages/slate/test/public-surface-contract.ts` -> 779
  tests; `packages/slate`: `bun test ./test/public-package-import-smoke.test.ts`
  -> 13 tests / 25 expects; `.tmp/slate-v2`: `bun test:release-discipline`
  -> 823 tests.
- `.tmp/slate-v2`: `SLATE_BROWSER_TRACE_SKIP_BUILD=1
SLATE_BROWSER_TRACE_SURFACES=stagedActiveDOMGroup,virtualized
SLATE_BROWSER_TRACE_BLOCKS=5000 SLATE_BROWSER_TRACE_ITERATIONS=2
SLATE_BROWSER_TRACE_TYPE_OPS=5 SLATE_BROWSER_TRACE_SELECT_ALL_DELETE=1
SLATE_BROWSER_TRACE_RUN_LABEL=slate-auto-2026-06-15-post-api-smoke bun run
bench:react:huge-document:browser-trace:local` -> passed. Max p95:
  type-to-paint 26.5ms, select-to-paint 55.9ms, selection-ready 25.1ms,
  click-to-paint 23.7ms, DOM nodes 325, heap 16.31MB, long-task max/total 0ms.
  Select-all/delete undo restored on staged and virtualized surfaces.
- `.tmp/slate-v2`: `bun run playwright
playwright/integration/examples/huge-document.test.ts --project=chromium
--project=firefox --project=webkit -g <visual/scrollbar rows>` -> passed
  14 tests with 1 scoped Firefox skip, covering staged 10k projected
  Shift+ArrowDown, virtualized row stacking, native scrollbar drag buffering,
  downward drag autoscroll, and blank-gap selection.
- `.tmp/slate-v2`: `bun run playwright
playwright/integration/examples/huge-document.test.ts --project=chromium
--project=firefox --project=webkit -g <correctness rows>` -> passed 15
  tests covering staged middle-block editing/undo/Enter/scroll,
  staged+virtualized Shift+ArrowUp/Down, select-all delete/typing/undo,
  huge select-all paste/undo restore, and virtualized 5k
  typing/undo/arrows/Enter/scroll.
- `.tmp/slate-v2`: `bun run playwright
playwright/integration/examples/visual-native-selection-smoke.test.ts
--project=chromium --project=firefox --project=webkit` -> passed 27 tests
  with screenshot artifacts and hidden-boundary double-highlight assertions.
- `.tmp/slate-v2`: `bun run playwright playwright/integration/examples/richtext.test.ts
playwright/integration/examples/plaintext.test.ts
playwright/integration/examples/hidden-content-blocks.test.ts
playwright/integration/examples/editable-voids.test.ts
playwright/integration/examples/placeholder.test.ts --project=firefox
--project=webkit -g <native-selection rows>` -> passed 22 tests with 2
  scoped Firefox skips for WebKit-only composition rows.
- `.tmp/slate-v2`: `bun run playwright playwright/integration/examples/richtext.test.ts
playwright/integration/examples/plaintext.test.ts
playwright/integration/examples/markdown-shortcuts.test.ts
playwright/integration/examples/hidden-content-blocks.test.ts
playwright/integration/examples/dom-coverage-boundaries.test.ts
playwright/integration/examples/editable-voids.test.ts
playwright/integration/examples/placeholder.test.ts --project=chromium` ->
  passed 225 tests with 6 scoped skips after building `slate-browser` and
  serving the static examples site.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> passed 779 tests after the markdown link oracle learned to strip fenced
  code and validate reference-style link definitions.
- `.tmp/slate-v2`: first `bun check` after the markdown link oracle failed on
  Biome's preferred one-line helper formatting; after exact wrap repair,
  `bun check` passed, covering lint, package/site/root typechecks, 1250 Bun
  tests / 91 skips, 49 Slate Layout tests, and 821 Slate React Vitest tests.
- `.tmp/slate-v2`: `bun test:release-discipline` -> passed 823 tests after
  package-DX export/import/docs guard additions. This is private-alpha proof,
  not release/publish authorization.
- `.tmp/slate-v2`: `docs/general/docs-proof-map.md` now has a dedicated row for
  package import paths, export targets, build entries, README casing, public
  docs/example import specifiers, and package import smoke.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> passed 779 tests after adding the package-DX proof-map row and guard
  assertions.
- `.tmp/slate-v2`: `bun typecheck:site` and `bun typecheck:packages` -> passed
  after the proof-map update.
- `.tmp/slate-v2`: `bun check` -> passed after the proof-map package-DX row,
  covering lint, package/site/root typechecks, 1250 Bun tests / 91 skips, 49
  Slate Layout tests, and 821 Slate React Vitest tests.
- `.tmp/slate-v2`: `find packages -maxdepth 2 -name 'README.md' -o -name
'Readme.md'` showed one actual package README per package. A separate
  `existsSync` probe falsely reported both casings on the local
  case-insensitive filesystem.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> passed 779 tests after adding the package README casing guard.
- `.tmp/slate-v2`: `bun typecheck:packages` and `bun typecheck:site` -> passed
  after adding the package README casing guard.
- `.tmp/slate-v2`: `bun check` -> passed after the package README casing guard,
  covering lint, package/site/root typechecks, 1250 Bun tests / 91 skips, 49
  Slate Layout tests, and 821 Slate React Vitest tests.
- `.tmp/slate-v2`: first public import-specifier scan was invalid because it
  included recursive `packages/**` source/test files; re-run limited to root
  README, docs, package READMEs, and site examples showed current public import
  specifiers: `slate`, `slate-react`, `slate-dom`, `slate-history`,
  `slate-hyperscript`, `slate-layout`, `slate-layout/react`, and
  `slate-browser/playwright`.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> passed 778 tests after adding the public import-specifier allowlist.
- `.tmp/slate-v2`: `bun typecheck:packages` and `bun typecheck:site` -> passed
  after adding the public import-specifier allowlist.
- `.tmp/slate-v2`: first `bun check` failed on Biome wrapping in
  `packages/slate/test/public-surface-contract.ts`; after exact wrapping
  repair, `bun check` passed, covering lint, package/site/root typechecks,
  1250 Bun tests / 91 skips, 49 Slate Layout tests, and 821 Slate React Vitest
  tests.
- `.tmp/slate-v2`: one-off package import smoke loaded `slate`,
  `slate/internal`, `slate-react`, `slate-dom`, `slate-dom/internal`,
  `slate-history`, `slate-hyperscript`, `slate-layout`,
  `slate-layout/react`, `slate-browser/core`, `slate-browser/browser`,
  `slate-browser/playwright`, and `slate-browser/transports`; `slate-browser`
  root import failed as intended.
- `.tmp/slate-v2/packages/slate`: first direct smoke run failed because
  `slate-dom/internal` exports `installDOM`, not `withDOM`; after correction,
  `bun test ./test/public-package-import-smoke.test.ts` passed 13 tests / 25
  expects.
- `.tmp/slate-v2`: `bun test ./packages/slate/test` -> passed 976 tests / 91
  skips after adding the package import smoke to the default Slate package
  test folder.
- `.tmp/slate-v2`: `bun typecheck:packages` and `bun typecheck:site` -> passed
  after adding the package import smoke.
- `.tmp/slate-v2`: `bun check` -> passed after the public package import
  smoke, covering lint, package/site/root typechecks, 1250 Bun tests / 91
  skips, 49 Slate Layout tests, and 821 Slate React Vitest tests.
- `.tmp/slate-v2`: source/config audit showed package-local tsdown entries for
  `slate`, `slate-dom`, `slate-layout`, and `slate-browser`; shared
  `../../config/tsdown.config.mts` owns root-only builds for `slate-react`,
  `slate-history`, and `slate-hyperscript`.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> passed 777 tests after adding export-target-to-build-entry/source-file
  guards.
- `.tmp/slate-v2`: `bun typecheck:packages` and `bun typecheck:site` -> passed
  after the package build-entry target-match guard.
- `.tmp/slate-v2`: first `bun check` failed on Biome wrapping in
  `packages/slate/test/public-surface-contract.ts`; after exact wrapping
  repair, `bun check` passed, covering lint, package/site/root typechecks,
  1237 Bun tests / 91 skips, 49 Slate Layout tests, and 821 Slate React Vitest
  tests.
- `.tmp/slate-v2`: structured package target inventory showed current
  `main` / `module` / `types` metadata and export target objects. Root packages
  use `./dist/index.{js,d.ts}` with `types`, `import`, and `default`; Slate
  and Slate DOM expose `./internal`; Slate Layout exposes `./react`; Slate
  Browser stays subpath-only with `types` and `default` targets and no root
  `main`, `module`, or `types`.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> passed 776 tests after adding the exact all-package export target-shape
  guard.
- `.tmp/slate-v2`: `bun typecheck:packages` and `bun typecheck:site` -> passed
  after the exact package export target-shape guard.
- `.tmp/slate-v2`: `bun check` -> passed after the package export
  target-shape guard, covering lint, package/site/root typechecks, 1237 Bun
  tests / 91 skips, 49 Slate Layout tests, and 821 Slate React Vitest tests.
- `.tmp/slate-v2`: structured package export-map inventory showed current
  public paths: `slate` -> `.`, `./internal`; `slate-react` -> `.`; `slate-dom`
  -> `.`, `./internal`; `slate-history` -> `.`; `slate-hyperscript` -> `.`;
  `slate-layout` -> `.`, `./react`; `slate-browser` -> `./browser`,
  `./core`, `./playwright`, `./transports`.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> passed 776 tests after adding the exact all-package export-map guard.
- `.tmp/slate-v2`: `bun typecheck:packages` and `bun typecheck:site` -> passed
  after the exact package export-map guard.
- `.tmp/slate-v2`: `bun check` -> passed after the package export-map guard,
  covering lint, package/site/root typechecks, 1237 Bun tests / 91 skips, 49
  Slate Layout tests, and 821 Slate React Vitest tests.
- `.tmp/slate-v2`: source import of `packages/slate-layout/src/index.ts` and
  `packages/slate-layout/src/react.tsx` showed the exact runtime value lists
  used for the new Slate Layout contract: 14 root values and 7 React subpath
  values.
- `.tmp/slate-v2`: `bun --filter ./packages/slate-layout test` -> passed 49
  Slate Layout tests / 169 expects after adding exact runtime export guards.
- `.tmp/slate-v2`: `bun typecheck:packages` and `bun typecheck:site` -> passed
  after the Slate Layout exact export guard.
- `.tmp/slate-v2`: `bun check` -> passed after the Slate Layout exact root and
  React subpath runtime guards, covering lint, package/site/root typechecks,
  1237 Bun tests / 91 skips, 49 Slate Layout tests, and 821 Slate React Vitest
  tests.
- `.tmp/slate-v2`: source import of `packages/slate-browser/src/core`,
  `browser`, `playwright`, and `transports` showed the exact runtime subpath
  value lists used for the new Slate Browser contract.
- `.tmp/slate-v2`: `bun --filter ./packages/slate-browser test:core && bun
typecheck:packages && bun typecheck:site` -> passed 77 Slate Browser core
  tests / 242 expects, seven package typechecks, and site typecheck.
- `.tmp/slate-v2`: `bun check` -> passed after Slate Browser subpath exact
  guards, covering lint, package/site/root typechecks, 1237 Bun tests / 91
  skips, 48 slate-layout tests, and 821 Slate React Vitest tests.
- `.tmp/slate-v2`: source import of `packages/slate-history/src/index.ts` and
  `packages/slate-hyperscript/src/index.ts` showed compact runtime root values:
  History exports `History`, `history`; Hyperscript exports `createEditor`,
  `createHyperscript`, `createText`, `jsx`.
- `.tmp/slate-v2`: `(cd packages/slate-history && bun test
./test/package-readme-contract.test.ts) && (cd packages/slate-hyperscript &&
bun test ./test/package-readme-contract.test.ts) && bun typecheck:packages &&
bun typecheck:site` -> passed two focused tests per package, seven package
  typechecks, and site typecheck.
- `.tmp/slate-v2`: `bun check` -> passed after stable sibling exact root
  guards, covering lint, package/site/root typechecks, 1236 Bun tests / 91
  skips, 48 slate-layout tests, and 821 Slate React Vitest tests.
- `.tmp/slate-v2`: `bun - <<'BUN' import * as SlateDOM from
'./packages/slate-dom/src/index.ts'; console.log(Object.keys(SlateDOM).sort())`
  -> source import showed the compact Slate DOM root runtime value surface used
  for the exact guard.
- `.tmp/slate-v2`: `bun test ./packages/slate-dom/test/public-surface-contract.ts
&& bun typecheck:packages && bun typecheck:site` -> passed 15 Slate DOM
  public-surface tests, seven package typechecks, and site typecheck after
  adding the exact root runtime export guard.
- `.tmp/slate-v2`: `bun check` -> passed after the Slate DOM exact root
  runtime export guard, covering lint, package/site/root typechecks, 1234 Bun
  tests / 91 skips, 48 slate-layout tests, and 821 Slate React Vitest tests.
- `.tmp/slate-v2`: `bun - <<'BUN' import * as SlateReact from
'./packages/slate-react/src/index.ts'; console.log(Object.keys(SlateReact).sort())`
  -> source import showed the compact root runtime value surface used for the
  exact guard.
- `.tmp/slate-v2`: `bun test ./packages/slate-react/test/surface-contract.tsx
&& bun typecheck:packages && bun typecheck:site` -> passed 49 Slate React
  surface tests / 306 expects, seven package typechecks, and site typecheck
  after adding the exact root runtime export guard.
- `.tmp/slate-v2`: `bun check` -> passed after the Slate React exact root
  runtime export guard, covering lint, package/site/root typechecks, 1233 Bun
  tests / 91 skips, 48 slate-layout tests, and 821 Slate React Vitest tests.
- `.tmp/slate-v2`: count-first
  `rg --count-matches -i "\\b(compat|compatibility|legacy|alias|deprecated|deprecation|backward|backwards|migration|migrate|previously|removed)\\b" docs packages site/examples ...`
  and focused public-docs/examples scan -> found one public example `COMPAT`
  comment; other public hits were legitimate editor terms such as backward
  ranges, removed nodes, or Prism token aliases.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts
&& bun typecheck:packages && bun typecheck:site` -> passed 776
  public-surface tests, seven package typechecks, and site typecheck after the
  public current-state wording guard.
- `.tmp/slate-v2`: `bun check` -> passed after public wording cleanup,
  covering lint, package/site/root typechecks, 1233 Bun tests / 91 skips, 48
  slate-layout tests, and 820 Slate React Vitest tests.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts
&& bun typecheck:packages && bun typecheck:site` -> first failed because the
  new `slate/internal` importer allowlist only included History/Hyperscript and
  missed existing Slate DOM/React importers; after classifying the real
  importer list, rerun passed 668 public-surface tests, seven package
  typechecks, and site typecheck.
- `.tmp/slate-v2`: `bun check` -> passed after the sibling internal importer
  classifier, covering lint, package/site/root typechecks, 1233 Bun tests / 91
  skips, 48 slate-layout tests, and 820 Slate React Vitest tests.
- `.tmp/slate-v2`: exact dist/source root export check via Bun file-read/import
  script -> passed: Slate root exports exactly
  `ElementApi`, `LocationApi`, `NodeApi`, `OperationApi`, `PathApi`,
  `PathRefApi`, `PointApi`, `PointRefApi`, `RangeApi`, `RangeRefApi`,
  `SpanApi`, `TextApi`, `createEditor`, `createEditorRuntime`,
  `createEditorView`, `defineEditorExtension`, `defineStateField`,
  `elementProperty`, `isEditor`, and `setDebugValueScrubber`; forbidden
  `getCharacterDistance`, `getWordDistance`, and `isObject` absent from
  runtime/types; sibling dist imports `isObject` from `slate/internal`.
- `.tmp/slate-v2`: `bun --filter ./packages/slate build && bun --filter
./packages/slate-history build && bun --filter ./packages/slate-hyperscript
build` -> passed after source root hard cut so package-name preload consumed
  current dist instead of stale root imports.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts
./packages/slate/test/text-units-contract.ts && bun typecheck:packages && bun
typecheck:site` -> passed 681 focused tests, seven package typechecks, and
  site typecheck.
- `.tmp/slate-v2`: `bun check` -> first failed on one Biome import-order issue
  in `packages/slate/src/interfaces/element.ts`, then passed after targeted
  import-order repair, covering lint, package/site/root typechecks, 1233 Bun
  tests / 91 skips, 48 slate-layout tests, and 820 Slate React Vitest tests.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts
&& bun typecheck:site` -> first failed on an over-escaped named-export
  parser, then passed 667 public-surface tests and site typecheck after the
  regex repair.
- `.tmp/slate-v2`: `bun check` -> first failed on one formatter-only row in
  `public-surface-contract.ts`, then passed after manual formatting, covering
  lint, package/site/root typechecks, 1233 Bun tests / 91 skips, 48
  slate-layout tests, and 820 Slate React Vitest tests.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts
&& bun typecheck:site` -> passed 666 public-surface tests and site typecheck
  after expanding Slate package extension/schema/middleware type docs.
- `.tmp/slate-v2`: `bun check` -> passed after extension type docs coverage,
  covering lint, package/site/root typechecks, 1233 Bun tests / 91 skips, 48
  slate-layout tests, and 820 Slate React Vitest tests.
- `.tmp/slate-v2`: focused package README case-sensitive proof
  (`bun test ./packages/slate/test/public-surface-contract.ts &&
bun test ./packages/slate-react/test/surface-contract.tsx &&
(cd packages/slate-history && bun test ./test/package-readme-contract.test.ts) &&
(cd packages/slate-hyperscript && bun test ./test/package-readme-contract.test.ts) &&
bun typecheck:site`) -> passed 663 public-surface tests, 48 Slate React
  surface tests / 305 expects, both package README contracts, and site
  typecheck.
- `.tmp/slate-v2`: `bun check` -> passed after package README casing and proof
  map repair, covering lint, package/site/root typechecks, 1233 Bun tests / 91
  skips, 48 slate-layout tests, and 820 Slate React Vitest tests.
- `.tmp/slate-v2`: `bun test ./packages/slate-react/test/surface-contract.tsx
&& bun typecheck:site` -> passed 48 Slate React surface tests / 305 expects
  and site typecheck after Slate React package README classified
  `createReactEditor` as the lower-level factory.
- `.tmp/slate-v2`: `bun check` -> passed after Slate React package README
  classification, covering lint, package/site/root typechecks, 1233 Bun tests
  / 91 skips, 48 slate-layout tests, and 820 Slate React Vitest tests.
- `.tmp/slate-v2`: scoped stale React factory scan over package READMEs,
  `docs/libraries`, `docs/concepts`, `docs/walkthroughs`, and `Readme.md`
  excluding explicit low-level React editor setup/reference pages -> remaining
  `createReactEditor` matches are only the Slate React package owner README and
  `docs/libraries/slate-react/slate.md` outside-React-lifetime guidance.
- `.tmp/slate-v2`: `bun test ./packages/slate-react/test/surface-contract.tsx
&& bun typecheck:site` -> passed 48 Slate React surface tests / 303 expects
  and site typecheck after TypeScript concept docs switched to
  `useSlateEditor`.
- `.tmp/slate-v2`: `bun check` -> passed after TypeScript concept docs cleanup,
  covering lint, package/site/root typechecks, 1233 Bun tests / 91 skips, 48
  slate-layout tests, and 820 Slate React Vitest tests.
- `.tmp/slate-v2/packages/slate-history`: `bun test ./test/package-readme-contract.test.ts
&& cd ../.. && bun typecheck:site` -> passed the Slate History package
  README contract and site typecheck after replacing the public README's
  React-default wording with `useSlateEditor`.
- `.tmp/slate-v2`: `bun check` -> passed after Slate History package README
  cleanup, covering lint, package/site/root typechecks, 1233 Bun tests / 91
  skips, 48 slate-layout tests, and 819 Slate React Vitest tests.
- `.tmp/slate-v2`: normal-doc raw factory scan
  (`docs/concepts/09-rendering.md`, `docs/walkthroughs`, `docs/libraries/slate-react`,
  `docs/libraries/slate-history`, excluding explicit low-level
  `react-editor.md` / `react-editor-setup.md`) -> no direct
  `createReactEditor(...)` or `useState(() => createReactEditor(...))` matches.
- `.tmp/slate-v2`: `bun test ./packages/slate-history/test/history-contract.ts
./packages/slate-react/test/surface-contract.tsx && bun typecheck:site` ->
  passed 97 focused docs/API tests and site typecheck after History React setup
  switched to `useSlateEditor`.
- `.tmp/slate-v2`: `bun check` -> passed after History React setup cleanup,
  covering lint, package/site/root typechecks, 1233 Bun tests / 91 skips, 48
  slate-layout tests, and 819 Slate React Vitest tests.
- `.tmp/slate-v2`: `bun test ./packages/slate-react/test/surface-contract.tsx
&& bun typecheck:site` -> passed 47 Slate React surface tests / 299 expects
  and site typecheck after Rendering concept docs switched to `useSlateEditor`.
- `.tmp/slate-v2`: `bun check` -> passed after Rendering concept docs cleanup,
  covering lint, package/site/root typechecks, 1233 Bun tests / 91 skips, 48
  slate-layout tests, and 819 Slate React Vitest tests.
- `.tmp/slate-v2`: hard-cut symbol leakage scan for removed public names ->
  no public docs/examples leak; remaining hits classified as internal
  implementation, internal benchmark import, historical changelog, or
  negative/public-surface guard tests.
- `.tmp/slate-v2`: projection-store wording scan over public docs/READMEs plus
  Slate React surface contract -> remaining matches only internal/negative
  guard tests.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts
./packages/slate-react/test/surface-contract.tsx && bun typecheck:site` ->
  passed 690 focused public docs/API tests and site typecheck after projection
  wording cleanup.
- `.tmp/slate-v2`: `bun check` -> passed after projection wording cleanup,
  covering lint, package/site/root typechecks, 1233 Bun tests / 91 skips, 48
  slate-layout tests, and 819 Slate React Vitest tests.
- `.tmp/slate-v2`: `bun test:release-discipline` -> passed 687 tests after
  core/DOM/Browser public docs/API contract edits.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts
&& bun typecheck:site` -> passed 643 public-surface tests and site typecheck
  after Slate core grouped public type docs.
- `.tmp/slate-v2`: `bun check` -> passed after Slate core type docs/contract
  edits, covering lint, package/site/root typechecks, 1233 Bun tests / 91
  skips, 48 slate-layout tests, and 819 Slate React Vitest tests.
- `.tmp/slate-v2`: `bun test ./packages/slate-dom/test/public-surface-contract.ts
&& bun typecheck:site` -> passed 14 Slate DOM public-surface tests and site
  typecheck after grouped public type docs.
- `.tmp/slate-v2`: `bun check` -> passed after Slate DOM type docs/contract
  edits, covering lint, package/site/root typechecks, 1233 Bun tests / 91
  skips, 48 slate-layout tests, and 819 Slate React Vitest tests.
- `.tmp/slate-v2`: `bun --filter slate-browser test:core` -> first failed on
  an over-strict README negative wording assertion, then passed 76 tests / 241
  expects after the contract was corrected.
- `.tmp/slate-v2`: `bun check` -> passed after Slate Browser README/contract
  edits, covering lint, package/site/root typechecks, 1233 Bun tests / 91
  skips, 48 slate-layout tests, and 819 Slate React Vitest tests.
- `.tmp/slate-v2`: scoped latest-state public docs/README wording scan
  (`docs/libraries`, `docs/api`, `docs/concepts`, `docs/walkthroughs`,
  `docs/general`, `packages/*/README.md`, `Readme.md`) -> only
  `docs/concepts/08-plugins.md` and `docs/concepts/11-normalizing.md` matched;
  focused reads classified all hits as domain prose about removing
  extensions/nodes/properties, not changelog, migration, alias, deprecated, or
  old/new API wording.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts
&& bun typecheck:site` -> passed 664 public-surface tests and site typecheck
  after transaction transform docs/source option guard.
- `.tmp/slate-v2`: `bun check` -> first failed on a lint-only string-concat
  regex in `packages/slate/test/public-surface-contract.ts`, then passed after
  the escaped template-literal repair, covering lint, package/site/root
  typechecks, 1233 Bun tests / 91 skips, 48 slate-layout tests, and 820 Slate
  React Vitest tests.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts
./packages/slate/test/editor-runtime-view-contract.ts &&
bun typecheck:packages && bun typecheck:site` -> passed 718 tests, all seven
  package typechecks, and site typecheck after the `tx.nodes.insertMany` alias
  hard cut.
- `.tmp/slate-v2`: scoped `insertMany` / `nodes.insertMany` scan over Slate
  source, docs, examples, and READMEs -> no matches after alias hard cut.
- `.tmp/slate-v2`: `bun check` -> passed after the `tx.nodes.insertMany`
  alias hard cut, covering lint, package/site/root typechecks, 1233 Bun tests /
  91 skips, 48 slate-layout tests, and 820 Slate React Vitest tests.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts
&& bun typecheck:site` -> passed 666 public-surface tests and site typecheck
  after the transaction API docs completeness guard.
- `.tmp/slate-v2`: `bun check` -> passed after transaction API docs
  completeness, covering lint, package/site/root typechecks, 1233 Bun tests /
  91 skips, 48 slate-layout tests, and 820 Slate React Vitest tests.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts
&& bun typecheck:site` -> passed 666 public-surface tests and site typecheck
  after the transform concept cross-page consistency guard.
- `.tmp/slate-v2`: `bun check` -> passed after transform concept cross-page
  consistency, covering lint, package/site/root typechecks, 1233 Bun tests /
  91 skips, 48 slate-layout tests, and 820 Slate React Vitest tests.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts
&& bun typecheck:site` -> passed 666 public-surface tests and site typecheck
  after extension authoring helper docs coverage.
- `.tmp/slate-v2`: `bun check` -> passed after extension authoring helper docs
  coverage, covering lint, package/site/root typechecks, 1233 Bun tests / 91
  skips, 48 slate-layout tests, and 820 Slate React Vitest tests.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> passed 601 tests before and after the `useSlateEditor` docs promotion.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> passed 602 tests after the walkthrough guard was added.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> passed 603 tests after the subscription split guard was added.
- `.tmp/slate-v2`: `bun test ./packages/slate-react/test/surface-contract.tsx`
  -> passed 38 tests / 222 expects after hook option docs and guard update.
- `.tmp/slate-v2`: `bun typecheck:site` -> passed before and after the
  `useSlateEditor` docs promotion, subscription split, and hook docs packet.
- `.tmp/slate-v2`: `bun check` -> passed after one formatting fix. It covered
  lint, all package/site/root typechecks, 1228 Bun tests with 91 skips, 48
  slate-layout tests, and 810 slate-react Vitest tests.
- `.tmp/slate-v2`: `bun run playwright playwright/integration/examples/richtext.test.ts playwright/integration/examples/plaintext.test.ts playwright/integration/examples/markdown-shortcuts.test.ts playwright/integration/examples/hidden-content-blocks.test.ts playwright/integration/examples/dom-coverage-boundaries.test.ts playwright/integration/examples/editable-voids.test.ts playwright/integration/examples/placeholder.test.ts --project=chromium`
  -> passed 225 tests with 6 scoped skips.
- `.tmp/slate-v2`: `bun run playwright playwright/integration/examples/richtext.test.ts playwright/integration/examples/plaintext.test.ts playwright/integration/examples/hidden-content-blocks.test.ts playwright/integration/examples/editable-voids.test.ts playwright/integration/examples/placeholder.test.ts --project=firefox --project=webkit -g <native-selection/platform-risk rows>`
  -> passed 28 tests with 2 scoped Firefox skips for WebKit-only compositionend rows.
- `.tmp/slate-v2`: `bun run playwright playwright/integration/examples/visual-native-selection-smoke.test.ts --project=chromium --project=firefox --project=webkit`
  -> passed 27 tests and attached focused visual screenshots.
- `.tmp/slate-v2`: focused huge-document correctness smoke in Chromium,
  Firefox, and WebKit -> passed 15 tests.
- `.tmp/slate-v2`: focused huge-document visual/scrollbar smoke in Chromium,
  Firefox, and WebKit -> passed 14 tests with 1 scoped Firefox blank-gap skip.
- `.tmp/slate-v2`: focused huge-document browser-trace baseline ->
  `react_huge_doc_type_to_paint_p95_ms=26.8`,
  `select_to_paint_p95_ms=56.3`, `click_to_paint_p95_ms=23.7`,
  `dom_nodes_p95=331`, `long_task_total_p95_ms=0`,
  staged `type_after_delete_to_paint_ms=37.6`, virtualized
  `type_after_delete_to_paint_ms=36.4`, undo restored for both.
- `.tmp/slate-v2`: `bun test:release-discipline` -> failed once on an
  unclassified proof-audit fixture string, then passed 647 tests after the
  inventory rule patch.
- `.tmp/slate-v2`: `bun typecheck:site` -> passed after docs wording cleanup.
- `.tmp/slate-v2`: docs/package README wording scan for alias/deprecated/
  migration/old-new language -> no matches in audited public docs.
- `.tmp/slate-v2`: `bun check` -> passed after current docs/test edits.
- `.tmp/slate-v2`: `bun typecheck:site` -> passed after example-page DX
  comment cleanup.
- `.tmp/slate-v2`: capped source/docs/examples scan for generated/sloppy
  comment terms -> remaining hits are legitimate `dirty*` API/domain terms,
  a proof-audit forbidden-word regex, and one contract fixture string.
- `.tmp/slate-v2`: `bun check` -> passed after source-comment cleanup.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> passed 616 tests after adding Slate and Slate DOM library docs.
- `.tmp/slate-v2`: `bun typecheck:site` -> passed after adding Slate and
  Slate DOM library docs.
- `.tmp/slate-v2`: new-doc wording scan for migration/deprecated/legacy
  phrasing -> no hits in new docs; existing hits are contract-test guard text.
- `.tmp/slate-v2`: `bun test ./packages/slate-react/test/surface-contract.tsx`
  -> passed 38 tests / 222 expects after internal subpath boundary docs.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> failed once on a `node_modules` scan false positive, then passed 618
  tests after excluding package-local installs.
- `.tmp/slate-v2`: `bun typecheck:packages` -> passed after tightening
  `slate-history` and `slate-hyperscript` peer floors.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> passed 619 tests after adding the public-example factory exception guard.
- `.tmp/slate-v2`: `bun typecheck:site` -> passed after huge-document comment
  and public-surface contract update.
- `.tmp/slate-v2`: public example smell scan -> only remaining hit is the
  guarded `huge-document` `createReactEditor({ initialValue })` exception.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> passed 620 tests after proof-map anchor updates.
- `.tmp/slate-v2`: `bun typecheck:site` -> passed after proof-map anchor
  updates.
- `.tmp/slate-v2`: `bun check` -> failed once on Biome formatting in
  `public-surface-contract.ts`, then passed after formatting repair.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> passed 621 tests after API Summary coverage repair.
- `.tmp/slate-v2`: `bun typecheck:site` -> passed after API Summary coverage
  repair.
- `.tmp/slate-v2`: `bun test:release-discipline` -> passed 665 tests after
  public-surface/package-boundary edits.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> passed 621 tests after source-level root export docs assertions.
- `.tmp/slate-v2`: `bun typecheck:packages` -> passed after root export docs
  assertions.
- `.tmp/slate-v2`: `bun run playwright playwright/integration/examples/example-navigation.test.ts --project=chromium`
  -> passed 1 rendered-nav test after the example badge hard-cut.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> passed 622 tests after adding the example badge metadata contract.
- `.tmp/slate-v2`: `bun typecheck:site` -> passed after example badge UI and
  rendered-nav proof changes.
- `.tmp/slate-v2`: `bun test ./packages/slate-react/test/surface-contract.tsx`
  -> passed 39 tests / 230 expects after Slate React package README runtime
  hook-family guard.
- `.tmp/slate-v2`: `bun typecheck:packages` -> passed after Slate React package
  README and surface-contract update.
- `.tmp/slate-v2`: `bun test ./packages/slate-react/test/surface-contract.tsx`
  -> passed 40 tests / 233 expects after Slate React docs landing hook-family
  crosslink guard.
- `.tmp/slate-v2`: `bun typecheck:site` -> passed after Slate React docs
  landing hook-family wording.
- `.tmp/slate-v2`: `bun typecheck:packages` -> passed after Slate React docs
  landing and surface-contract update.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> first failed when package changelogs were accidentally included, then
  passed 637 tests after narrowing the public package doc guard to README files.
- `.tmp/slate-v2`: `bun typecheck:packages` -> passed after public package
  README doc-guard update.
- `.tmp/slate-v2`: targeted state/write/hook stale-shape scans over `docs`,
  `packages/*/README.md`, and `site/examples/ts` -> no matches outside scoped
  proof harness APIs.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> passed 637 tests after clean public state/tx language scan.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> passed 637 tests after adding reverse browser proof coverage and deleting
  orphan `select.test.ts`.
- `.tmp/slate-v2`: `bun run playwright playwright/integration/examples/richtext.test.ts --project=chromium -g "selects the current block on browser triple click"`
  -> passed 1 test after folding the quote-button assertion into richtext.
- `.tmp/slate-v2`: `bun typecheck:packages` -> passed after browser proof
  coverage contract update.
- `.tmp/slate-v2`: `bun check` -> first failed on Biome formatting in
  `site/components/ExampleLayout.tsx`, then passed after formatting repair.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> passed 637 tests after proof-map coverage anchors.
- `.tmp/slate-v2`: `bun typecheck:site` -> passed after proof-map update.
- `.tmp/slate-v2`: `bun typecheck:packages` -> passed after proof-map contract
  update.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> passed 637 tests after package README export-claim assertions.
- `.tmp/slate-v2`: `bun typecheck:packages` -> passed after Slate DOM README
  and public-surface update.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> passed 638 tests after package subpath README boundary guard.
- `.tmp/slate-v2`: `bun typecheck:packages` -> passed after package subpath
  README and public-surface updates.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> passed 638 tests after root README quickstart repair.
- `.tmp/slate-v2`: `bun typecheck:packages` -> passed after root README guard
  update.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> passed 639 tests after root README package-table guard.
- `.tmp/slate-v2`: `bun typecheck:packages` -> passed after package-table
  contract update.
- `.tmp/slate-v2`: `bun test:release-discipline` -> passed 683 tests after
  README/docs/public-surface updates.
- `.tmp/slate-v2`: `bun check` -> first failed on Biome formatting in
  `packages/slate/test/public-surface-contract.ts`, then failed on stale
  Slate DOM README oracle, then passed after both repairs.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> passed 639 tests after adding old `useSlateView*` public-doc/example
  guards and root-hook rename coverage.
- `.tmp/slate-v2/packages/slate-react`: `bun test:vitest` -> passed 59 files /
  812 tests after hard-renaming runtime/root hooks.
- `.tmp/slate-v2`: `bun typecheck:packages` -> passed all seven packages after
  root-hook export rename.
- `.tmp/slate-v2`: `bun typecheck:site` -> passed after updating the
  multi-root example to `useSlateRootState`.
- `.tmp/slate-v2`: `bun check` -> first failed on import order/formatting after
  the root-hook rename, then passed after formatting repair.
- `.tmp/slate-v2`: `bun test ./packages/slate-react/test/surface-contract.tsx`
  -> passed 40 tests / 240 expects after adding the `useSlateEditor` creator vs
  `useEditor` provider-reader docs guard.
- `.tmp/slate-v2`: `bun typecheck:site` -> passed after editor hook docs
  clarity patch.
- `.tmp/slate-v2`: old-name scan for `useSlateProjections` / old source file
  path -> only remaining current hit is a negative export guard.
- `.tmp/slate-v2`: `bun test ./packages/slate-react/test/surface-contract.tsx`
  -> passed 40 tests / 244 expects after projection-entry rename and docs guard.
- `.tmp/slate-v2`: `bun typecheck:packages` -> passed all seven packages after
  projection-entry hook rename.
- `.tmp/slate-v2`: `bun typecheck:site` -> passed after projection-entry docs.
- `.tmp/slate-v2/packages/slate-react`: `bun test:vitest` -> passed 59 files /
  812 tests after projection-entry rename.
- `.tmp/slate-v2`: `bun check` -> first failed on one benchmark line wrap, then
  passed after formatting repair.
- `.tmp/slate-v2`: `bun test ./packages/slate-react/test/surface-contract.tsx`
  -> passed 40 tests / 246 expects after history focus-policy hard cut.
- `.tmp/slate-v2`: `bun typecheck:packages` -> passed all seven packages after
  history focus-policy hard cut.
- `.tmp/slate-v2`: `bun typecheck:site` -> passed after history focus-policy
  docs/example update.
- `.tmp/slate-v2/packages/slate-react`: `bun test:vitest` -> passed 59 files /
  812 tests after history focus-policy hard cut.
- `.tmp/slate-v2`: old-value scan for `preserve-dom` -> only remaining current
  hit is a negative guard in `surface-contract.tsx`.
- `.tmp/slate-v2`: `bun check` -> passed after history focus-policy hard cut.
- `.tmp/slate-v2`: raw Editable layout API scan -> old `EditableLayout`,
  `layout?: EditableLayout`, and raw `<Editable layout=` remain only in negative
  guards or `PagedEditable` wrapper call sites.
- `.tmp/slate-v2`: `bun test ./packages/slate-react/test/surface-contract.tsx`
  -> passed 40 tests / 252 expects after raw Editable `domStrategyLayout`
  hard cut.
- `.tmp/slate-v2`: `bun typecheck:packages` -> initially failed on stale
  `slate-layout` wrapper import/prop, then passed all seven packages after the
  wrapper boundary repair.
- `.tmp/slate-v2`: `bun typecheck:site` -> initially failed through the same
  `slate-layout` wrapper and example prop mismatch, then passed after the
  wrapper boundary repair.
- `.tmp/slate-v2/packages/slate-react`: `bun test:vitest` -> passed 59 files /
  812 tests after raw Editable `domStrategyLayout` hard cut.
- `.tmp/slate-v2`: `bun --filter ./packages/slate-layout test` -> passed 48
  tests after the wrapper boundary repair.
- `.tmp/slate-v2`: `bun check` -> first failed on formatter-only prop/export
  ordering after `domStrategyLayout` rename, then passed after targeted Biome
  formatting.
- `.tmp/slate-v2`: `bun test ./packages/slate-react/test/surface-contract.tsx`
  -> first failed on an over-exact wrapped docs assertion, then passed 40 tests
  / 255 expects after the event-prop docs guard was stabilized.
- `.tmp/slate-v2`: `bun typecheck:site` -> passed after event-prop docs update.
- `.tmp/slate-v2`: `bun check` -> passed after event-prop docs contract update.
- `.tmp/slate-v2`: render-prop source audit -> package root exports current
  `RenderElementProps` from `editable-text-blocks`, and current
  `RenderLeafProps` / `RenderTextProps` from `editable-text`; duplicate old
  exports in `components/editable.tsx` had no source/test references.
- `.tmp/slate-v2`: `bun test ./packages/slate-react/test/surface-contract.tsx`
  -> passed 40 tests / 256 expects after stale render-prop interface cleanup.
- `.tmp/slate-v2`: `bun typecheck:packages` -> passed after stale render-prop
  interface cleanup.
- `.tmp/slate-v2`: `bun check` -> first failed on import formatting after stale
  render-prop interface cleanup, then passed after targeted Biome formatting.
- `.tmp/slate-v2`: `bun test ./packages/slate-react/test/surface-contract.tsx`
  -> first failed on an over-exact wrapped provider docs assertion, then passed
  40 tests / 258 expects after stabilizing the widget-provider guard.
- `.tmp/slate-v2`: `bun typecheck:site` -> passed after provider projection docs
  update.
- `.tmp/slate-v2`: `bun check` -> passed after provider projection docs/contract
  update.
- `.tmp/slate-v2`: annotation/widget hook source/docs/export audit -> current
  hook names and provider/default behavior are coherent; no code or docs change.
- `.tmp/slate-v2`: `bun test:release-discipline` -> passed 683 tests after
  accumulated API hard cuts.
- `.tmp/slate-v2`: stale public-name scan for `useSlateViewState`,
  `useSlateViewEffect`, `useSlateProjections`, `preserve-dom`,
  `EditableLayout`, `renderingStrategy`, `onRenderingStrategy`, `widgetStore`,
  and raw `<Editable layout=` -> no actionable current hits outside negative
  guards and legitimate hook-owned widget-store examples.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> passed 639 tests after proof-map hard-cut anchors.
- `.tmp/slate-v2`: `bun typecheck:site` -> passed after proof-map hard-cut
  anchors.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> passed 639 tests after `SlateChange` callback-boundary docs guard.
- `.tmp/slate-v2`: `bun test ./packages/slate-react/test/surface-contract.tsx`
  -> passed 40 tests / 258 expects after `SlateChange` type-boundary guard.
- `.tmp/slate-v2`: `bun typecheck:site` -> passed after `SlateChange` docs
  update.
- `.tmp/slate-v2`: `bun typecheck:packages` -> passed all seven packages after
  `SlateChange` type/docs guard.
- `.tmp/slate-v2`: `bun check` -> first failed on Biome wrapping in
  `packages/slate-react/test/surface-contract.tsx`, then passed after targeted
  formatter write.
- `.tmp/slate-v2`: old alias scan for `SnapshotChange`,
  `SnapshotChangeClass`, and `OperationClass` -> remaining hits only in the
  negative public-surface guard.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> passed 640 tests after core commit alias hard cut and docs listener-name
  correction.
- `.tmp/slate-v2`: `bun test:release-discipline` -> passed 684 tests after
  core commit alias hard cut.
- `.tmp/slate-v2`: `bun typecheck:packages` -> first failed on duplicate
  `EditorCommit` imports from the mechanical rewrite, then passed after
  duplicate import removal.
- `.tmp/slate-v2`: `bun typecheck:site` -> first failed on the same duplicate
  imports, then passed after duplicate import removal.
- `.tmp/slate-v2`: `bun check` -> first failed on import ordering after the
  source-wide alias rewrite, then passed after Biome formatted touched files.
- `.tmp/slate-v2`: old alias scan for `CommitListener`, `SnapshotChange`,
  `SnapshotChangeClass`, and `OperationClass` -> remaining hits only in the
  negative public-surface guard.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> passed 640 tests after removing the internal `CommitListener` alias.
- `.tmp/slate-v2`: `bun typecheck:packages` and `bun typecheck:site` -> passed
  after the inline commit listener function-type cleanup.
- `.tmp/slate-v2`: `bun check` -> passed after the `CommitListener` alias hard
  cut.
- `.tmp/slate-v2`: alias scan for `EditorApplyOperationsOptions`,
  `SlateAnnotationStoreRefreshOptions`, and `RuntimeAndroidInputManager` ->
  remaining hits only in negative public-surface / Slate React surface guards.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> passed 640 tests after the public core alias cleanup.
- `.tmp/slate-v2`: `bun test ./packages/slate-react/test/surface-contract.tsx`
  -> passed 41 tests / 261 expects after the React alias cleanup.
- `.tmp/slate-v2`: `bun typecheck:packages` and `bun typecheck:site` -> passed
  after replacing the public/runtime aliases with owner types.
- `.tmp/slate-v2`: `bun check` -> passed after the public/runtime alias
  cleanup, covering lint, package/site/root typechecks, 1228 Bun tests / 91
  skips, 48 slate-layout tests, and 813 Slate React Vitest tests.
- `.tmp/slate-v2`: alias scan for `EditorCommandResult`,
  `DOMCoverageSelfBoundaryProps`, `type boolean = boolean`,
  `type EditorApplyOperationsOptions`, `type SlateAnnotationStoreRefreshOptions`,
  and `type RuntimeAndroidInputManager` -> remaining hits only in negative
  public-surface / Slate React surface guards.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> passed 640 tests after command-result alias cleanup.
- `.tmp/slate-v2`: `bun test ./packages/slate-react/test/surface-contract.tsx`
  -> passed 41 tests / 262 expects after DOM coverage self-boundary props alias cleanup.
- `.tmp/slate-v2`: `bun typecheck:packages` and `bun typecheck:site` -> passed
  after inlining command result booleans and DOM coverage base props.
- `.tmp/slate-v2`: `bun check` -> passed after command result / DOM coverage
  alias cleanup, covering lint, package/site/root typechecks, 1228 Bun tests /
  91 skips, 48 slate-layout tests, and 813 Slate React Vitest tests.
- `.tmp/slate-v2`: `bun test ./packages/slate-react/test/surface-contract.tsx`
  -> passed 41 tests / 264 expects after replacing the
  `UseSlateRootEditorOptions` `Pick` alias with an explicit shape.
- `.tmp/slate-v2`: `bun typecheck:packages` and `bun typecheck:site` -> passed
  after the root-editor options alias cleanup.
- `.tmp/slate-v2`: `bun check` -> passed after the root-editor options alias
  cleanup, covering lint, package/site/root typechecks, 1228 Bun tests / 91
  skips, 48 slate-layout tests, and 813 Slate React Vitest tests.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> first failed because the new pure-alias allowlist caught generic node/text
  helper aliases; after classification, passed 641 tests.
- `.tmp/slate-v2`: `bun check` -> passed after adding the pure-alias allowlist
  guard, covering lint, package/site/root typechecks, 1228 Bun tests / 91
  skips, 48 slate-layout tests, and 813 Slate React Vitest tests.
- `.tmp/slate-v2`: `bun test ./packages/slate-react/test/surface-contract.tsx`
  -> passed 41 tests / 265 expects after adding the public root-export guard
  against internal `SlateViewBoundary` / `useSlateViewSelection` leakage.
- `.tmp/slate-v2`: `bun check` -> passed after the internal-view public
  boundary guard, covering lint, package/site/root typechecks, 1228 Bun tests /
  91 skips, 48 slate-layout tests, and 813 Slate React Vitest tests.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> passed 642 tests after adding operation docs coverage for
  `ReplaceChildrenOperation` and all current `OperationApi.is*` check helpers.
- `.tmp/slate-v2`: `bun typecheck:site` -> passed after operation docs updates.
- `.tmp/slate-v2`: `bun check` -> passed after operation docs coverage,
  covering lint, package/site/root typechecks, 1228 Bun tests / 91 skips, 48
  slate-layout tests, and 813 Slate React Vitest tests.
- `.tmp/slate-v2`: source-vs-doc static API compare initially found missing
  docs for `ElementApi.isElementProps`, `NodeApi.findTextRanges`,
  `NodeApi.isAncestor`, `NodeApi.isEditor`, `NodeApi.isElement`,
  `NodeApi.isText`, and `TextApi.isTextProps`.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/public-surface-contract.ts`
  -> passed 643 tests after adding missing Element/Node/Text docs and the
  generic static API method parity contract.
- `.tmp/slate-v2`: `bun typecheck:site` -> passed after static API docs updates.
- `.tmp/slate-v2`: `bun check` -> passed after static API docs parity,
  covering lint, package/site/root typechecks, 1228 Bun tests / 91 skips, 48
  slate-layout tests, and 813 Slate React Vitest tests.

Final handoff contract:

- Goal plan: `docs/plans/2026-06-14-slate-v2-public-api-taste-and-beta-readiness-10h.md`; the old `10h` filename is historical, not the active stop rule.
- Surface and route/package: Slate v2 public API/docs/package-DX plus stable editor behavior, visual/native selection, huge-document staged/virtualized smoke, and `slate-browser` proof API docs.
- Invocation mode, removed timebox, loop/checkpoint count: beta-readiness loop; user removed the 10h constraint; ledger records 170+ checkpoint/packet rows and closes on beta-readiness evidence instead of wall-clock duration.
- Behavior gates and visual proof: Chromium stable sweep passed 225 / 6 scoped skips; Firefox/WebKit native-selection slice passed; visual/native smoke passed 27 desktop tests with screenshots and double-highlight assertions; huge-doc correctness/visual rows passed with one scoped Firefox skip.
- Primary metric baseline/latest/best and stop reason: latest huge-doc browser-trace proof max p95 type-to-paint 26.5ms, select-to-paint 55.9ms, selection-ready 25.1ms, click-to-paint 23.7ms, DOM nodes 325, long-task max/total 0ms; stop reason is beta-readiness gates closed, not timebox expiration.
- Bugs fixed and oracles added: Firefox double-click word-selection proof now uses a stable native `mouse.dblclick()` helper path; public API alias hard cuts, root/runtime hook hard renames, transaction helper cleanup, package export/import/type-resolution smoke, public docs no-alias/code-fence/link/import guards, exact package export-map/build-entry guards, and slate-browser direct-export/JSDoc guards.
- Benchmark/skill/docs repairs: browser-trace metrics kept as proof; docs proof-map updated; no `.agents/rules/**` sync needed in final closeout.
- Workflow slowdowns and repairs: command/path/output-budget pitfalls are logged above, including Bun package-local test filters, zsh/backtick scans, generated-output scans, stale dist/declaration artifacts, formatter-only retries, and exact repair rules.
- Changed list: grouped changed-list table above is the current concise list for this run.
- Needs your attention: the five-item table above is now an approved review map, not an open taste blocker; skim those anchors first in PR diff review.
- Stopping checkpoints to unblock: none blocking beta-readiness. Previously open API/DX review rows were approved by the user; older soft taste rows remain historical queue entries, not blockers.
- Accepted deferrals and residual risks: raw mobile/device proof is deferred; no release/publish/PR/commit performed; pagination architecture remains explicit opt-in; the current new risk was the Firefox double-click proof flake and it is repaired/verified.
- Next owner: `autoreview`/commit only when explicitly requested; `slate-auto` can resume if review finds a concrete gap.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final beta-readiness closeout after autoreview reported no actionable findings and the remaining plan gates were reconciled to evidence. |
| Where am I going? | Run `check-complete`; if it passes, mark the active goal complete and hand off the review list. |
| What is the goal? | Automate Slate v2 API taste and beta readiness, with queued taste checkpoints and proof packets closed honestly. |
| What have I learned? | Package-DX proof must include package metadata guards too; stale local symlinks should not be able to hide a missing root workspace dependency. |
| What have I done? | Added docs proof-map coverage for package-DX guards, package README casing guard, public import-specifier allowlist, public package import smoke, strict TypeScript public package export/type-resolution smoke with named runtime/type declaration references and `slate-browser` root negative guard, root workspace package link guard, exact internal bridge runtime export guards, exact package export map/target/build-entry guards, exact runtime export guards, current-state wording/internal-bridge guards, leaked Slate root value and alias hard cuts, fenced-code-safe public markdown link oracle, release discipline private-alpha proof, stable Chromium behavior proof, Firefox/WebKit native-selection proof, visual/native screenshot proof, huge-document correctness/visual/metric proof, slate-browser direct-export/JSDoc proof, capped review-attention table, focused review-anchor proofs, example complexity triage, scoped current-state wording scan, final fast gates, autoreview, and final plan-gate reconciliation. |
| What changed in the checkpoint plan? | Removed the old timebox as a completion condition, closed stale pending/in-progress rows with concrete evidence, marked raw mobile and skill sync as scoped/N/A, filled final handoff rows, and kept taste questions as review attention rather than blockers. |

Timeline:

- 2026-06-14T22:18:20.053Z Goal plan created.
- 2026-06-15T00:19:00+0200 Checkpoint zero filled: prompt
  requirements, queued questions, boundaries, timebox, stop rules, proof
  surfaces, and dynamic checkpoint mutations recorded.
- 2026-06-15T00:19:41+0200 Active autogoal created:
  `019ec5d3-3735-7003-b139-6ad6c2e57546`.
- 2026-06-15T00:29:00+0200 Kept packet `initial-value-docs-clarity` after
  public-surface contract and site typecheck passed.
- 2026-06-15T00:36:00+0200 Kept packet `use-slate-editor-front-door` after
  public-surface contract and site typecheck passed.
- 2026-06-15T00:43:00+0200 Kept packet
  `walkthrough-use-slate-editor-canonical` after public-surface contract and
  site typecheck passed.
- 2026-06-15T00:50:00+0200 Kept packet `subscribe-commit-doc-split` after
  public-surface contract and site typecheck passed.
- 2026-06-15T00:59:00+0200 Kept packet `runtime-root-hook-dense-docs` after
  direct Bun surface contract and site typecheck passed.
- 2026-06-15T01:06:00+0200 Fast gate closed after formatting fix:
  `.tmp/slate-v2` `bun check` passed.
- 2026-06-15T00:38:00+0200 Kept packet
  `stable-examples-chromium-behavior`: Chromium stable behavior sweep passed
  225 tests with 6 scoped skips.
- 2026-06-15T00:40:00+0200 Kept packet
  `firefox-webkit-native-selection-slice`: focused cross-browser behavior proof
  passed 28 tests with 2 scoped Firefox skips.
- 2026-06-15T00:41:00+0200 Kept packet
  `desktop-visual-native-selection-smoke`: desktop visual/native selection proof
  passed 27 tests across Chromium, Firefox, and WebKit with screenshot
  artifacts.
- 2026-06-15T00:42:00+0200 Kept packet
  `huge-document-desktop-correctness-smoke`: focused staged/virtualized huge-doc
  correctness proof passed 15 tests across desktop browsers.
- 2026-06-15T00:43:00+0200 Kept packet
  `huge-document-desktop-visual-scrollbar-slice`: focused projected-selection,
  scrollbar, row-stacking, autoscroll, and blank-gap proof passed 14 tests with
  1 scoped Firefox skip.
- 2026-06-15T00:45:00+0200 Kept packet
  `huge-document-browser-trace-baseline`: focused staged+virtualized 5k metric
  baseline wrote p95/DOM/long-task/listener/selector/select-all-delete metrics.
- 2026-06-15T00:46:00+0200 Kept packet
  `release-discipline-hard-cut-audit`: one proof-inventory classification
  repair, then release-discipline passed 647 tests.
- 2026-06-15T00:47:00+0200 Kept packet
  `docs-readme-current-state-wording`: two walkthrough closers rewritten, site
  typecheck passed, and public docs/package README wording scan is clean.
- 2026-06-15T00:52:00+0200 Kept packet `current-tree-fast-gate`:
  `.tmp/slate-v2` `bun check` passed.
- 2026-06-15T00:55:00+0200 Kept packet
  `public-example-source-comment-dx`: example-page debug comment and
  stale-sounding source comments cleaned; site typecheck passed; slop-word scan
  is scoped and clean apart from legitimate domain/test-audit terms.
- 2026-06-15T00:57:00+0200 Kept packet `post-example-fast-gate`:
  `.tmp/slate-v2` `bun check` passed after source-comment cleanup.
- 2026-06-15T01:03:00+0200 Kept packet `public-package-library-docs`:
  Slate and Slate DOM library pages added, docs summary linked, public-surface
  contract passed 616 tests, and site typecheck passed.
- 2026-06-15T01:07:00+0200 Kept packet `internal-subpath-boundary-docs`:
  `/internal` subpaths documented as sibling-package-only bridges; public
  docs/test guard passed, site typecheck passed, and Slate React surface
  contract passed.
- 2026-06-15T01:13:00+0200 Kept packet `sibling-runtime-peer-floor-contract`:
  `slate-history` and `slate-hyperscript` peer floors tightened to
  `slate >=0.124.2`; source-import peer-floor contract added; rerun passed 618
  public-surface tests and package typecheck passed.
- 2026-06-15T01:20:00+0200 Kept packet
  `public-example-factory-exception-contract`: huge-document direct factory
  documented as a remount/control exception; public-surface passed 619 tests,
  site typecheck passed, and example smell scan only finds the guarded exception.
- 2026-06-15T01:24:00+0200 Kept packet `docs-proof-map-current-api`:
  proof map updated for Slate core docs, Slate DOM docs, and `useSlateEditor`
  setup; public-surface passed 620 tests and site typecheck passed.
- 2026-06-15T01:09:00+0200 Kept packet `post-package-docs-fast-gate`:
  `.tmp/slate-v2` `bun check` passed after one Biome formatting retry.
- 2026-06-15T01:12:00+0200 Kept packet `api-summary-coverage-contract`:
  Bookmark added to Summary; public-surface passed 621 tests and site typecheck
  passed.
- 2026-06-15T01:14:00+0200 Kept packet `release-discipline-rerun`:
  release-discipline guard passed 665 tests after public-surface edits.
- 2026-06-15T01:18:00+0200 Kept packet `root-export-doc-claim-guard`:
  new Slate and Slate DOM docs are now source-guarded against actual root
  exports; public-surface and package typecheck passed.
- 2026-06-15T01:31:00+0200 Kept packet
  `example-navigation-current-state-badges`: `new` example badges removed,
  static contract passed 622 tests, site typecheck passed, and Chromium
  rendered-nav proof passed.
- 2026-06-15T01:39:00+0200 Kept packet
  `slate-react-readme-runtime-hook-family`: Slate React package README now names
  the approved runtime/root hook family; surface contract and package typecheck
  passed.
- 2026-06-15T01:46:00+0200 Kept packet
  `slate-react-docs-runtime-hook-crosslink`: Slate React docs landing page now
  routes runtime/root hooks clearly; surface contract, site typecheck, and
  package typecheck passed.
- 2026-06-15T01:54:00+0200 Kept packet
  `public-package-readme-doc-guard`: package README files now participate in
  public documentation guardrails; first changelog-scope false positive
  repaired; public-surface and package typecheck passed.
- 2026-06-15T01:59:00+0200 Kept no-change packet
  `public-state-tx-language-clean-scan`: stale public write/snapshot/hook scans
  returned no matches, and public-surface passed 637 tests.
- 2026-06-15T02:08:00+0200 Kept packet
  `example-browser-proof-orphan-audit`: removed orphan `select.test.ts`, folded
  its assertion into richtext, added reverse browser proof coverage, and passed
  public-surface, focused richtext browser proof, and package typecheck.
- 2026-06-15T02:18:00+0200 Kept packet `post-browser-proof-fast-gate`:
  `.tmp/slate-v2` `bun check` passed after one Biome formatting repair.
- 2026-06-15T02:24:00+0200 Kept packet
  `public-docs-proof-map-coverage`: proof map now anchors package README,
  runtime/root hook, example route coverage, navigation metadata, and visual
  screenshot proof; public-surface, site typecheck, and package typecheck passed.
- 2026-06-15T02:32:00+0200 Kept packet
  `public-package-readme-export-claim-guard`: package README export examples
  now include Slate DOM `Hotkeys` and are asserted by public-surface; package
  typecheck passed.
- 2026-06-15T02:39:00+0200 Kept packet
  `package-subpath-readme-boundary-guard`: package README subpath boundaries
  are documented and guarded; public-surface passed 638 tests and package
  typecheck passed.
- 2026-06-15T02:46:00+0200 Kept packet
  `root-readme-use-slate-editor-quickstart`: root README quickstart now uses
  `useSlateEditor`; public-surface and package typecheck passed.
- 2026-06-15T02:51:00+0200 Kept packet
  `root-readme-package-table-guard`: root README package-role table is now
  source-guarded; public-surface passed 639 tests and package typecheck passed.
- 2026-06-15T02:54:00+0200 Kept packet
  `post-readme-release-discipline-rerun`: release-discipline passed 683 tests.
- 2026-06-15T03:02:00+0200 Kept packet
  `full-fast-gate-after-readme-docs`: `bun check` passed after one formatter
  repair and one stale Slate DOM README oracle repair.
- 2026-06-15T03:11:00+0200 Kept packet
  `runtime-root-hook-name-hard-cut`: `useSlateViewState` and
  `useSlateViewEffect` hard-renamed to root terminology with focused
  public-surface, Slate React Vitest, package typecheck, and site typecheck
  proof.
- 2026-06-15T04:29:00+0200 Kept no-change packet
  `stale-public-name-scan-after-api-hard-cuts`: old public names remain only in
  negative guards and legitimate hook-owned widget-store examples; raw
  `<Editable layout=` has no current matches.
- 2026-06-15T04:35:00+0200 Kept packet
  `docs-proof-map-api-hard-cut-anchors`: proof map now anchors root
  terminology, projection-entry reads, focus preserve values, raw Editable DOM
  strategy layout, and provider/widget-store boundaries; public-surface passed
  639 tests and site typecheck passed.
- 2026-06-15T04:48:00+0200 Kept packet
  `slate-change-callback-boundary`: `SlateChange` remains the short React
  callback payload type; docs now route raw commit infrastructure to
  `editor.subscribeCommit`; public-surface, Slate React surface, site
  typecheck, and package typecheck passed.
- 2026-06-15T04:55:00+0200 Kept packet
  `post-change-callback-boundary-fast-gate`: `bun check` passed after one
  formatter-only repair in `surface-contract.tsx`.
- 2026-06-15T05:12:00+0200 Kept packet
  `core-commit-alias-hard-cut`: `SnapshotChange`, `SnapshotChangeClass`, and
  `OperationClass` removed; code uses `EditorCommit` / `EditorCommitClass`;
  editor docs listener names corrected; public-surface, release-discipline,
  package typecheck, and site typecheck passed.
- 2026-06-15T05:18:00+0200 Kept packet
  `post-core-commit-alias-hard-cut-fast-gate`: `bun check` passed after import
  ordering was repaired with Biome on touched files.
- 2026-06-15T05:24:00+0200 Kept packet
  `commit-listener-internal-alias-hard-cut`: internal `CommitListener` removed,
  commit listener function types inlined, old-alias scan hit only negative
  guards, and public-surface, package/site typechecks, plus `bun check` passed.
- 2026-06-15T05:31:00+0200 Kept packet
  `public-runtime-alias-hard-cut`: `EditorApplyOperationsOptions`,
  `SlateAnnotationStoreRefreshOptions`, and `RuntimeAndroidInputManager`
  removed; owner types used directly; focused guards, package/site typechecks,
  and `bun check` passed.
- 2026-06-15T05:39:00+0200 Kept packet
  `command-result-dom-coverage-alias-hard-cut`: `EditorCommandResult` and
  `DOMCoverageSelfBoundaryProps` removed; literal `boolean` and private base
  props used directly; focused guards, package/site typechecks, and `bun check`
  passed.
- 2026-06-15T05:46:00+0200 Kept packet
  `root-editor-options-alias-hard-cut`: `UseSlateRootEditorOptions` now exposes
  an explicit `{ readOnly?: boolean }` shape instead of a `Pick` alias; focused
  React guard, package/site typechecks, and `bun check` passed.
- 2026-06-15T05:53:00+0200 Kept packet
  `pure-type-alias-allowlist-guard`: public-surface now scans Slate and Slate
  React source for one-line pure type aliases and requires explicit
  classification; first calibration caught generic node/text helpers, then 641
  public-surface tests and `bun check` passed.
- 2026-06-15T06:00:00+0200 Kept packet
  `internal-view-terminology-public-boundary-guard`: internal view-selection
  names are guarded against Slate React root export leakage; focused React
  surface contract and `bun check` passed.
- 2026-06-15T06:06:00+0200 Kept packet
  `operation-docs-replace-children-coverage`: operation docs now include
  `ReplaceChildrenOperation`, BaseOperation membership, and current insert /
  merge / move / remove / replace / set / split check helpers; public-surface,
  site typecheck, and `bun check` passed.
- 2026-06-15T06:13:00+0200 Kept packet
  `static-api-docs-source-parity`: Element, Node, and Text docs gained missing
  static methods, and public-surface now compares static API docs against
  source interfaces; public-surface, site typecheck, and `bun check` passed.
- 2026-06-15T03:11:27+0200 Kept packet
  `slate-react-public-export-docs-coverage`: Slate React README/hook docs now
  name public render primitives and advanced helper hooks; React surface
  contract passed 42 tests / 283 expects, package/site typechecks passed, and
  `bun check` passed.
- 2026-06-15T03:15:51+0200 Kept packet
  `projection-store-root-runtime-hard-cut`: removed `createSlateProjectionStore`
  and `isSlateSourceDirty` from `slate-react` root runtime exports, retargeted
  internal tests/benchmark to the implementation module, and passed focused
  React contracts, package/site typechecks, and `bun check`.
- 2026-06-15T03:19:20+0200 Kept packet
  `text-rendering-root-runtime-hard-cut`: removed `EditableText`,
  `TextString`, and `ZeroWidthString` from `slate-react` root runtime exports,
  kept `EditableElement` public, retargeted internal tests, and passed focused
  contracts, package/site typechecks, and `bun check`.
- 2026-06-15T03:22:37+0200 Kept packet
  `overlay-store-constructor-root-runtime-hard-cut`: removed
  `createSlateAnnotationStore` and `createSlateWidgetStore` from root runtime
  exports, retargeted internal contracts, and passed focused overlay tests,
  package/site typechecks, and `bun check`.
- 2026-06-15T03:26:31+0200 Kept packet
  `decoration-source-root-runtime-hard-cut`: removed raw decoration constructors
  and `DefaultPlaceholder` from root runtime exports, kept
  `defaultScrollSelectionIntoView`, retargeted internal proof, and passed
  focused contracts, package/site typechecks, and `bun check`.
- 2026-06-15T03:29:27+0200 Kept packet
  `default-scroll-helper-docs-coverage`: documented
  `defaultScrollSelectionIntoView` under `Editable.scrollSelectionIntoView`,
  added a React docs guard, and passed focused surface proof, package/site
  typechecks, and `bun check`.
- 2026-06-15T03:33:00+0200 Kept packet
  `root-type-export-docs-classification`: added a Slate React root type export
  docs/classification guard; focused surface proof, package/site typechecks,
  and `bun check` passed.
- 2026-06-15T03:35:26+0200 Kept packet
  `slate-core-runtime-view-docs-coverage`: documented
  `createEditorRuntime` and `createEditorView` in Slate library docs and
  package README, added public-surface guards, and passed focused
  public-surface proof, package/site typechecks, and `bun check`.
- 2026-06-15T03:40:26+0200 Kept packet
  `slate-dom-grouped-root-utility-docs`: documented grouped Slate DOM root
  utility exports in library docs and package README, added a package
  public-surface guard, and passed focused Slate DOM public-surface proof,
  package/site typechecks, and `bun check`.
- 2026-06-15T03:47:30+0200 Kept packet
  `stable-package-readme-export-docs`: documented `History.isHistory` and
  hyperscript creator exports, added package-local README contracts with
  discoverable `*.test.ts` names, and passed package-directory proof,
  package/site typechecks, and `bun check`.
- 2026-06-15T03:52:47+0200 Kept packet
  `slate-browser-root-alias-hard-cut`: removed the root aggregate
  `slate-browser` entrypoint, kept owned subpaths, added package/central
  guards, and passed no-root-import scan, Slate Browser core proof, package
  build, typechecks, and `bun check`.
- 2026-06-15T03:57:25+0200 Kept packet
  `sibling-package-pure-alias-hard-cut`: removed/converted exported pure
  aliases in Slate Browser, Slate DOM, and Slate Layout, verified the sibling
  alias scanner is clean, and passed focused owner proofs, package typecheck,
  and `bun check`.
- 2026-06-15T03:59:39+0200 Kept packet
  `all-package-pure-alias-guard`: widened the public-surface pure-alias guard
  to every Slate v2 package source folder and passed public-surface, package
  typecheck, and `bun check`.
- 2026-06-15T04:02:14+0200 Kept no-change packet
  `scoped-latest-state-public-docs-wording-audit`: repaired the resumed
  wording scan shape after it included parent/run artifacts, re-ran only
  `.tmp/slate-v2` public docs/READMEs with count-first output, and classified
  the two hit files as legitimate domain prose rather than stale API wording.
- 2026-06-15T04:07:21+0200 Kept packet
  `slate-browser-subpath-readme-proof-api-contract`: documented concrete
  `slate-browser/core` proof contracts and `slate-browser/browser` DOM
  snapshot helpers, added a package-local README contract, passed
  `bun --filter slate-browser test:core` after one over-strict assertion
  correction, and passed `bun check`.
- 2026-06-15T04:10:27+0200 Kept packet `slate-dom-public-type-group-docs`:
  documented Slate DOM public type groups in package/site docs, extended the
  package public-surface contract, passed focused Slate DOM proof plus site
  typecheck, and passed `bun check`.
- 2026-06-15T04:13:53+0200 Kept packet `slate-core-public-type-group-docs`:
  documented Slate core public type groups in package/site docs, extended the
  core public-surface contract, passed focused public-surface proof plus site
  typecheck, and passed `bun check`.
- 2026-06-15T04:16:00+0200 Kept no-change packet
  `post-type-docs-release-discipline-rerun`: `bun test:release-discipline`
  passed 687 tests after core/DOM/Browser public docs/API contract edits.
- 2026-06-15T04:19:26+0200 Kept packet
  `projection-store-public-summary-wording-hard-cut`: changed front-door docs
  from projection-store wording to projection infrastructure/sources/decoration
  sources, verified remaining store wording is internal/negative guard-only,
  passed focused public-surface/Slate React proof plus site typecheck, and
  passed `bun check`.
- 2026-06-15T04:21:17+0200 Kept no-change packet
  `hard-cut-symbol-leakage-classification-scan`: scanned recently cut public
  names and classified remaining hits as internal implementation, internal
  benchmark import, changelog history, or negative guard tests.
- 2026-06-15T04:25:49+0200 Kept packet
  `react-rendering-doc-use-slate-editor-cleanup`: Rendering concept docs now
  teach `useSlateEditor` for React-owned editor setup; focused React surface
  proof, site typecheck, and `bun check` passed.
- 2026-06-15T04:25:49+0200 Kept packet
  `history-setup-doc-use-slate-editor-cleanup`: History React setup docs now
  teach `useSlateEditor` with extension overrides; normal-doc direct-factory
  scan, focused History + React contracts, site typecheck, and `bun check`
  passed.
- 2026-06-15T04:33:09+0200 Kept packet
  `slate-history-package-readme-react-front-door-cleanup`: Slate History
  package README now says `useSlateEditor` installs history by default for
  Slate React editors; package-local README contract, site typecheck, and
  `bun check` passed.
- 2026-06-15T04:37:21+0200 Kept packet
  `typescript-concept-use-slate-editor-cleanup`: TypeScript concept docs now
  teach React value generics through `useSlateEditor<CustomValue>`; React
  surface contract, site typecheck, scoped stale-factory scan, and `bun check`
  passed.
- 2026-06-15T04:41:19+0200 Kept packet
  `slate-react-readme-factory-classification`: Slate React package README now
  classifies `createReactEditor` as the lower-level factory for outside React
  ownership or same-lifetime custom hooks; focused proof, site typecheck, and
  `bun check` passed.
- 2026-06-15T04:46:09+0200 Kept packet
  `package-readme-case-sensitive-proof-repair`: central public-doc scans and
  package README contracts now use exact `Readme.md` casing where needed;
  proof map paths and projection wording were corrected; focused proof and
  `bun check` passed.
- 2026-06-15T04:55:28+0200 Kept packet
  `transaction-transform-docs-source-backed-options`: transform API docs now
  list source-backed transaction method options, corrected false
  `tx.fragment.delete` option docs, added a public-surface docs/source guard,
  and passed focused proof plus `bun check`.
- 2026-06-15T05:01:32+0200 Kept packet
  `tx-nodes-insert-many-alias-hard-cut`: removed duplicate `tx.nodes.insertMany`
  from transaction types/runtime/view wrappers and public call sites, added a
  leak guard, and passed focused proof, scoped scan, typechecks, and `bun check`.
- 2026-06-15T05:05:48+0200 Kept packet
  `transaction-api-docs-completeness-audit`: documented value/root/state-field,
  state-patch, and normalization transaction helpers, added complete
  transaction-method docs/source proof, and passed focused proof plus `bun check`.
- 2026-06-15T05:09:30+0200 Kept packet
  `public-api-docs-cross-page-consistency-audit`: updated the Transform concept
  overview to name the fuller transaction groups and link to the API reference,
  guarded the anchors, and passed focused proof plus `bun check`.
- 2026-06-15T05:13:22+0200 Kept packet
  `public-extension-api-docs-surface-audit`: package/library docs now show
  `defineEditorExtension`, `defineStateField`, and `elementProperty` together,
  with source/doc guards and `bun check` green.
- 2026-06-15T03:14:00+0200 Kept packet
  `post-root-hook-rename-fast-gate`: `.tmp/slate-v2` `bun check` passed after
  one Biome import-order/formatting repair.
- 2026-06-15T03:18:00+0200 Kept no-change packet
  `state-field-hook-name-audit`: `useStateFieldValue` and
  `useSetStateField` stay as-is because they directly pair with
  `defineStateField`.
- 2026-06-15T03:22:00+0200 Kept packet
  `editor-context-hook-name-audit`: `useSlateEditor` remains the creator hook
  and `useEditor` remains the provider-reader hook; docs clarify the split and
  focused proof passed.
- 2026-06-15T03:32:00+0200 Kept packet
  `projection-entry-hook-name-hard-cut`: `useSlateProjections` hard-renamed to
  `useSlateProjectionEntries`; focused docs/source/tests/package/site proof
  passed.
- 2026-06-15T03:35:00+0200 Kept packet
  `post-projection-entry-rename-fast-gate`: `.tmp/slate-v2` `bun check`
  passed after one benchmark formatter repair.
- 2026-06-15T03:42:00+0200 Kept packet
  `history-focus-policy-value-hard-cut`: `focusPolicy: 'preserve-dom'`
  hard-renamed to `focusPolicy: 'preserve'`; focused docs/source/tests/package
  and site proof passed.
- 2026-06-15T03:45:00+0200 Kept packet
  `post-history-focus-policy-fast-gate`: `.tmp/slate-v2` `bun check` passed.
- 2026-06-15T03:56:00+0200 Kept packet
  `editable-dom-strategy-layout-prop-hard-cut`: raw `Editable layout` /
  `EditableLayout` hard-renamed to `domStrategyLayout` /
  `EditableDOMStrategyLayout`; `PagedEditable layout` kept as wrapper API;
  focused proof passed.
- 2026-06-15T04:02:00+0200 Kept packet
  `post-editable-dom-strategy-layout-fast-gate`: `.tmp/slate-v2` `bun check`
  passed after targeted formatter repair.
- 2026-06-15T04:08:00+0200 Kept packet
  `editable-event-props-doc-contract`: kept event-prop API shape and clarified
  `onBeforeInput` vs `onDOMBeforeInput`; focused docs contract and site
  typecheck passed.
- 2026-06-15T04:12:00+0200 Kept packet
  `post-editable-event-props-fast-gate`: `.tmp/slate-v2` `bun check` passed.
- 2026-06-15T04:20:00+0200 Kept packet
  `render-prop-stale-interface-cleanup`: deleted duplicate old render-prop
  interfaces from `editable.tsx`; focused surface contract and package
  typecheck passed.
- 2026-06-15T04:25:00+0200 Kept packet
  `post-render-prop-stale-interface-fast-gate`: `.tmp/slate-v2` `bun check`
  passed after targeted import formatting.
- 2026-06-15T04:31:00+0200 Kept packet
  `provider-projection-widget-prop-boundary`: documented widget stores as
  hook-owned and guarded that `Slate` has no `widgetStore` prop.
- 2026-06-15T04:36:00+0200 Kept packet
  `post-provider-projection-props-fast-gate`: `.tmp/slate-v2` `bun check`
  passed.
- 2026-06-15T04:40:00+0200 Kept no-change packet
  `annotation-widget-hook-surface-audit`: annotation/widget hook naming and
  provider/default split kept as-is after source/docs/export audit.
- 2026-06-15T04:42:00+0200 Kept packet
  `post-api-hard-cut-release-discipline-rerun`: release-discipline passed 683
  tests.
- 2026-06-15T05:18:30+0200 Kept packet
  `public-extension-type-export-docs-audit`: Slate package docs now group
  public extension/schema/middleware type families; focused public-surface
  proof, site typecheck, and `bun check` passed.
- 2026-06-15T05:24:00+0200 Kept packet
  `public-root-type-export-coverage-contract`: `public-surface-contract.ts`
  now parses explicit root editor type exports and requires docs coverage or
  deliberate classification; focused proof and `bun check` passed after parser
  and formatter repair.
- 2026-06-15T05:36:03+0200 Kept packet
  `public-root-value-export-coverage-audit`: removed leaked Slate root
  text-unit/object utility exports, routed sibling package `isObject` usage
  through `slate/internal`, added an exact root value export guard, rebuilt
  touched packages to refresh dist, and passed exact export proof, focused
  public/text-unit tests, package/site typechecks, and `bun check`.
- 2026-06-15T05:40:57+0200 Kept packet
  `public-sibling-internal-import-bridge-guard`: classified exact
  `slate/internal` source importers across Slate DOM, Slate React, Slate
  History, and Slate Hyperscript; first focused proof failed with missing
  importer rows, then passed after classifying the real list; `bun check`
  passed.
- 2026-06-15T05:44:53+0200 Kept packet
  `public-compat-alias-wording-and-source-audit`: replaced the lone public
  example `COMPAT` comment, added a current-state wording guard for public
  docs/examples, classified internal browser/platform `COMPAT` comments as a
  separate runtime-comment cleanup lane, and passed focused proof plus
  `bun check`.
- 2026-06-15T05:48:36+0200 Kept packet
  `slate-react-root-runtime-export-exactness-audit`: added an exact
  `Object.keys(SlateReact).sort()` root runtime export guard in
  `surface-contract.tsx`, then passed focused React surface proof, package/site
  typechecks, and `bun check`.
- 2026-06-15T05:51:30+0200 Kept packet
  `slate-dom-root-runtime-export-exactness-audit`: added an exact
  `Object.keys(SlateDOM).sort()` root runtime export guard in the Slate DOM
  public-surface contract, then passed focused DOM proof, package/site
  typechecks, and `bun check`.
- 2026-06-15T05:54:23+0200 Kept packet
  `stable-sibling-root-export-exactness-audit`: added exact root runtime export
  guards to Slate History and Slate Hyperscript package README contracts, then
  passed focused package-local tests, package/site typechecks, and `bun check`.
- 2026-06-15T05:57:46+0200 Kept packet
  `slate-browser-subpath-runtime-export-exactness-audit`: added exact runtime
  export guards for `slate-browser/core`, `slate-browser/browser`,
  `slate-browser/playwright`, and `slate-browser/transports`; passed Slate
  Browser core proof, package/site typechecks, and `bun check`.
- 2026-06-15T06:04:26+0200 Kept packet
  `slate-layout-root-runtime-export-exactness-audit`: added exact runtime
  export guards for `slate-layout` and `slate-layout/react`; passed Slate
  Layout package proof, package/site typechecks, and `bun check`.
- 2026-06-15T06:08:05+0200 Kept packet
  `package-export-map-drift-audit`: added exact all-package export-map guard
  for current Slate v2 import paths; passed public-surface proof,
  package/site typechecks, and `bun check`.
- 2026-06-15T06:11:28+0200 Kept packet
  `package-export-target-shape-audit`: added exact all-package target-shape
  guard for package `main`, `module`, `types`, and `exports` objects; passed
  public-surface proof, package/site typechecks, and `bun check`.
- 2026-06-15T06:15:05+0200 Kept packet
  `package-build-entry-target-match-audit`: added export-target to build-entry
  source/config guard; focused proof and typechecks passed, first `bun check`
  caught formatter wrapping, and rerun `bun check` passed.
- 2026-06-15T06:19:32+0200 Kept packet
  `public-package-import-smoke`: added package-resolution smoke for every
  allowed package/subpath and negative `slate-browser` root import; first
  expectation was corrected, then package-local smoke, package sweep,
  typechecks, and `bun check` passed.
- 2026-06-15T06:23:05+0200 Kept packet
  `public-import-specifier-allowlist-audit`: added public docs/examples
  import-specifier allowlist derived from package exports and excluding
  `/internal`; first scan was invalid and rerun scoped, focused proof and
  typechecks passed, first `bun check` caught formatter wrapping, and rerun
  `bun check` passed.
- 2026-06-15T06:26:31+0200 Kept packet
  `package-readme-duplicate-casing-audit`: found no real duplicate README
  files, repaired the case-insensitive scan trap with a directory-entry casing
  guard, then passed focused proof, package/site typechecks, and `bun check`.
- 2026-06-15T06:29:04+0200 Kept packet
  `docs-proof-map-package-dx-guard-coverage`: documented package path, export
  target, build entry, README casing, public import-specifier, and import-smoke
  proof ownership in the docs proof map; focused proof, site/package
  typechecks, and `bun check` passed.
- 2026-06-15T06:31:18+0200 Kept no-change packet
  `post-package-dx-release-discipline-rerun`: `bun test:release-discipline`
  passed 823 tests after package-DX guard additions; Slate v2 remains private
  alpha, so this is not a release signal.
- 2026-06-15T06:36:16+0200 Kept packet `public-doc-link-target-audit`:
  markdown link oracle now strips fenced code and checks reference-style link
  definitions; focused public-surface proof and `bun check` passed after a
  helper-refactor fix and formatter-only repair.
- 2026-06-15T06:39:29+0200 Kept packet
  `post-api-hardcut-stable-behavior-smoke`: stable Chromium examples passed 225
  tests with 6 scoped skips across richtext, plaintext, markdown shortcuts,
  hidden content, DOM coverage, editable voids, and placeholder.
- 2026-06-15T06:41:31+0200 Kept packet
  `post-api-cross-browser-native-selection-slice`: focused Firefox/WebKit
  native-selection rows passed 22 tests with 2 scoped Firefox skips for
  WebKit-only composition rows.
- 2026-06-15T06:43:28+0200 Kept packet
  `post-api-visual-native-selection-smoke`: screenshot-backed visual/native
  selection smoke passed 27 tests across Chromium, Firefox, and WebKit,
  including hidden-boundary double-highlight assertions.
- 2026-06-15T06:45:45+0200 Kept packet
  `post-api-huge-document-correctness-smoke`: staged and virtualized
  huge-document correctness smoke passed 15 tests across Chromium, Firefox, and
  WebKit.
- 2026-06-15T06:48:00+0200 Kept packet
  `post-api-huge-document-visual-scrollbar-slice`: huge-document projected
  selection, virtualized row stacking, scrollbar drag buffering, autoscroll,
  and blank-gap selection passed 14 tests with 1 scoped Firefox skip.
- 2026-06-15T06:50:17+0200 Kept no-change packet
  `post-api-huge-document-browser-trace-metric-smoke`: 5k staged+virtualized
  browser trace stayed bounded with max type-to-paint p95 26.5ms,
  select-to-paint p95 55.9ms, DOM p95 325, and long tasks 0ms.
- 2026-06-15T06:50:17+0200 Updated packet
  `beta-review-priority-and-taste-queue-refresh`: capped needs-your-attention
  to five grouped review decisions and queued Round 28 for package-DX
  strictness, `slate-layout` proof-gated posture, and beta review order.
- 2026-06-15T06:55:03+0200 Kept packet
  `public-api-root-export-review-anchor-audit`: review-anchor focused proofs
  passed: React surface, Slate Layout, public-surface, package import smoke,
  and release-discipline.
- 2026-06-15T06:56:27+0200 Kept no-change packet
  `public-example-complexity-triage-refresh`: line-count and API-shape triage
  found no example patch need; Pagination stays alpha/deferred and Huge
  Document is route-owned/proved.
- 2026-06-15T06:57:48+0200 Kept no-change packet
  `public-docs-current-state-wording-rescan`: scoped wording scan found no
  public migration/compat/deprecated API language; hits were normalizing prose
  or token alias data.
- 2026-06-15T06:59:26+0200 Kept no-change packet
  `final-fast-gate-after-plan-and-oracle-edits`: `bun check` passed after the
  markdown-link oracle and proof-plan updates.
- 2026-06-15T07:09:00+0200 Kept packet
  `public-package-type-resolution-smoke`: added TypeScript-only package import
  resolution proof for all allowed public package/subpath imports; focused
  Slate package typecheck and full `bun check` passed after JSX/types and
  lint/format repair.
- 2026-06-15T07:13:00+0200 Reopened and kept packet
  `public-package-export-type-resolution-smoke`: disabled repo `paths` in the
  smoke tsconfig, caught missing root `slate-layout` workspace resolution,
  added the root workspace dependency, and reran strict `bunx tsc`, package
  typecheck, and full `bun check` green.
- 2026-06-15T07:16:00+0200 Kept packet
  `package-dx-proof-map-type-smoke-anchor`: docs proof map now points package-DX
  reviewers at the strict TypeScript export/type smoke and tsconfig; focused
  public-surface proof, site typecheck, and full `bun check` passed.
- 2026-06-15T07:19:00+0200 Kept packet
  `public-package-named-declaration-smoke`: strict package type smoke now
  references representative named declaration exports for all allowed public
  package/subpath imports; strict `bunx tsc`, Slate package typecheck, and full
  `bun check` passed.
- 2026-06-15T07:21:00+0200 Kept packet
  `slate-browser-root-negative-type-resolution-smoke`: strict package type
  smoke now expects root `slate-browser` type resolution to fail while public
  subpaths resolve; first lint run disliked an unused negative alias, then
  Slate package typecheck and full `bun check` passed after `_` prefix repair.
- 2026-06-15T07:24:00+0200 Kept packet
  `internal-bridge-runtime-export-exactness`: package import smoke now exact
  guards runtime export keys for `slate/internal` and `slate-dom/internal`;
  package-local smoke passed 15 tests / 27 expects and full `bun check` passed.
- 2026-06-15T07:29:00+0200 Kept packet
  `public-package-named-type-declaration-smoke`: strict package type smoke now
  references representative public type declarations; first run caught stale
  `slate-react` declarations for `EditableDOMStrategyLayout`, targeted
  `slate-react` build fixed it, and full `bun check` passed.
- 2026-06-15T07:30:00+0200 Kept no-change packet
  `post-package-dx-release-discipline-rerun`: `bun test:release-discipline`
  passed 823 tests after the package-boundary oracle upgrades.
- 2026-06-15T07:34:00+0200 Kept packet
  `root-workspace-package-link-guard`: public-surface contract now requires
  root `package.json` to link every public Slate v2 workspace package; focused
  public-surface passed 780 tests and full `bun check` passed.
- 2026-06-15T07:45:00+0200 Kept packet
  `strict-public-package-declaration-gate`: public package type smoke now uses
  consumer-like package resolution with `paths: {}`, Node/React ambient types
  only, and `skipLibCheck: false`; added declaration-build tsconfig for package
  dist resolution, repaired `slate-react` inferred public type leaks, rebuilt
  package declarations, anchored the stricter gate in the docs proof map, and
  passed focused package/public-surface typechecks plus full `bun check`.
- 2026-06-15T07:50:00+0200 Kept packet
  `package-declaration-build-order-clean-proof`: cleaned all package `dist`
  artifacts with Turbo, rebuilt packages through the root topological
  `build:packages` lane, and reran full `bun check` green. This keeps the
  strict dts policy and records the intended build lane.
- 2026-06-15T07:54:00+0200 Kept packet
  `declaration-build-path-map-guard`: public-surface contract now derives the
  declaration-build path map from package export `types` targets, preventing
  future package/subpath exports from bypassing the strict package type smoke;
  focused proof passed 781 tests and full `bun check` passed.
- 2026-06-15T08:23:07+0200 Kept packet
  `public-package-root-runtime-exact-import-smoke`: package import smoke now
  exact-guards the built `slate` root runtime export list, matching the source
  root exactness contract at consumer import level. The root-level Bun path
  filter missed the file twice, so the stable focused command is package-local:
  `cd .tmp/slate-v2/packages/slate && bun test ./test/public-package-import-smoke.test.ts`.
  Focused package-local smoke passed 15 tests, public-surface contract passed
  941 tests, and full `.tmp/slate-v2` `bun check` passed.
- 2026-06-15T08:25:54+0200 Kept packet
  `all-public-package-runtime-exact-import-smoke`: replaced sample public
  package import checks with exact consumer-level runtime export expectations
  for every public Slate v2 package/subpath specifier. Focused package-local
  smoke passed 14 tests, and full `.tmp/slate-v2` `bun check` passed.
- 2026-06-15T08:28:00+0200 Kept packet
  `public-package-runtime-import-coverage-guard`: package import smoke now
  reads public package export maps and requires every non-internal public
  package specifier to have exact runtime import proof. Focused package-local
  smoke passed 15 tests; first full check caught formatter wrapping, then
  rerun full `.tmp/slate-v2` `bun check` passed.
- 2026-06-15T08:29:38+0200 Kept packet
  `public-markdown-code-fence-no-any-guard`: public TS/JS Markdown code fences
  now fail if they teach `any`; ordinary prose can still use the word. A quick
  ad hoc extractor accidentally read a directory, so the durable guard was
  added to the existing public-surface Markdown code-fence helper instead.
  Focused public-surface contract passed 941 tests and full `.tmp/slate-v2`
  `bun check` passed.
- 2026-06-15T08:31:44+0200 Kept packet
  `public-markdown-guard-scope-widening`: Markdown code-fence parsing,
  no-`any`, and internal-import boundary checks now use the full
  `publicMarkdownFiles` inventory, including the top-level README and
  `docs/general`. Focused public-surface contract passed 950 tests; first full
  check caught formatter wrapping, then rerun full `.tmp/slate-v2` `bun check`
  passed.
- 2026-06-15T08:33:08+0200 Kept packet
  `docs-proof-map-markdown-snippet-oracle-anchor`: docs proof map now names the
  public Markdown TS/JS snippet oracle for parseability, no-`any`, and
  internal-import boundaries. Focused public-surface contract, site typecheck,
  and full `.tmp/slate-v2` `bun check` passed.
- 2026-06-15T08:36:15+0200 Kept no-change packet
  `post-api-docs-stable-chromium-behavior-sweep`: focused Chromium Playwright
  sweep passed 225 tests with 6 scoped skips across richtext, plaintext,
  markdown shortcuts, editable voids, custom placeholder, hidden content, and
  DOM coverage boundaries. Command built `slate-browser`, built/served the site,
  and completed in 2.4m.
- 2026-06-15T08:37:10+0200 Kept no-change packet
  `post-api-docs-cross-browser-visual-native-selection-smoke`:
  screenshot-backed visual/native selection smoke passed 27 tests across
  Chromium, Firefox, and WebKit after building `slate-browser` and the site.
- 2026-06-15T08:39:42+0200 Kept no-change packet
  `post-api-docs-huge-document-cross-browser-sweep`: huge-document staged,
  auto, and virtualized behavior proof passed 90 tests with 3 scoped skips
  across Chromium, Firefox, and WebKit, including Shift+Arrow, select-all
  delete, paste, undo/redo, scroll stability, virtualized scrollbar/drag, and
  20k materialization rows. Command built `slate-browser`, built/served the
  site, and completed in 2.1m.
- 2026-06-15T08:40:31+0200 Kept no-change packet
  `post-api-docs-huge-document-browser-trace-metric-smoke`: browser trace
  metrics stayed bounded: overall type-to-paint p95 16.5ms, staged
  type-to-paint p95 15.3ms, overall select-to-paint p95 56.4ms, staged
  select-to-paint p95 54.9ms, long tasks 0ms, DOM p95 944 auto / 325 staged.
  Artifact:
  `.tmp/slate-v2/tmp/slate-react-huge-document-browser-trace-benchmark-surfaces-defaultAuto-stagedActiveDOMGroup-blocks-5000-iters-3-ops-10-after-delete-type-after-delete-text-after-200k-delete-run-2026-06-15T06-40-02.497Z.json`.
- 2026-06-15T08:41:13+0200 Kept no-change packet
  `runtime-root-hook-name-audit`: public docs and package README still name the
  runtime/root hook family, public guards ban removed `useSlateViewState` /
  `useSlateViewEffect`, and remaining `SlateView*` names are internal
  projected-selection primitives. Slate React surface contract passed 49 tests.
  Workflow slowdown: first hook-name `rg` was too broad and streamed internal
  selection implementation/test matches; future hook-name audits should start
  from docs, root exports, and surface-contract rows before widening.
- 2026-06-15T08:43:40+0200 Kept packet
  `public-alias-wording-drift-repair`: replaced the docs proof-map phrase
  "aliases" with "route mappings" and widened the public no-alias wording
  guard to the full public Markdown inventory. Public docs alias scan is clean,
  focused public/alias/React surface contracts passed 1003 tests, site
  typecheck passed, and full `.tmp/slate-v2` `bun check` passed.
- 2026-06-15T08:46:02+0200 Kept packet
  `public-runtime-root-hook-jsdoc-dx-pass`: source JSDoc for `useSlateEditor`,
  `useSlateRuntimeState`, `useSlateRootState`, `useSlateRootEditor`,
  `useSlateRootEffect`, and `useSlateCommandCallback` now explains React
  ownership, one-shot `initialValue`, root scoping, update skipping, mounted DOM
  timing, and focus policy. Slate React typecheck, focused public/React surface
  contracts, and full `.tmp/slate-v2` `bun check` passed.
- 2026-06-15T08:48:38+0200 Kept packet
  `public-state-field-hook-jsdoc-dx-pass`: source JSDoc for
  `useStateFieldValue` and `useSetStateField` now explains dirty-key
  subscriptions, document-state control usage, `editor.update` writes, and
  default DOM-selection preservation. Initial patch duplicated
  `useStateFieldValue`; self-review caught and removed the duplicate before
  tests. Slate React typecheck, focused public/React surface contracts, and
  full `.tmp/slate-v2` `bun check` passed.
- 2026-06-15T08:49:51+0200 Kept packet
  `public-hook-jsdoc-declaration-artifact-refresh`: rebuilt all package
  declaration artifacts after the hook JSDoc DX changes so package consumers
  see the updated hover docs. `bun build:packages`, strict public package type
  smoke, and full `.tmp/slate-v2` `bun check` passed.
- 2026-06-15T08:52:20+0200 Kept packet
  `public-hook-jsdoc-regression-contract`: Slate React surface contract now
  guards key public hook source JSDoc concepts for `useSlateEditor`,
  runtime/root hooks, and state-field hooks. Focused public/React surface
  contracts, Slate React typecheck, and full `.tmp/slate-v2` `bun check`
  passed.
- 2026-06-15T08:52:50+0200 Kept no-change packet
  `post-hook-jsdoc-release-discipline-guard`: `bun test:release-discipline`
  passed 998 tests after public hook JSDoc and contract updates. This is
  private-alpha proof only, not release/publish authorization.
- 2026-06-15T08:53:25+0200 Kept no-change packet
  `public-hook-jsdoc-declaration-content-proof`: verified
  `packages/slate-react/dist/index.d.ts` contains the new public hover docs for
  `useSlateEditor`, runtime/root hooks, and state-field hooks. Workflow
  slowdown: first probes assumed per-hook `dist/hooks/*` declaration files, but
  tsdown emits a flattened declaration bundle.
- 2026-06-15T08:57:28+0200 Kept packet
  `public-history-hook-jsdoc-dx-pass`: source JSDoc for `useSlateHistory` now
  explains active/fixed root behavior, `canUndo` / `canRedo`, shortcut wiring,
  and `focusPolicy`. Slate React surface contract now guards those source
  concepts; `bun build:packages` refreshed declaration artifacts; strict public
  package type smoke, full `.tmp/slate-v2` `bun check`, and flattened
  declaration bundle inspection passed.
- 2026-06-15T09:01:10+0200 Kept packet
  `public-hook-jsdoc-coverage-guard`: all public Slate React `use*` exports now
  require immediate source JSDoc through the surface contract. Added missing
  hover docs for decoration selectors, editor/node/text selectors, annotation
  stores, node refs, projection entries, and runtime creation/lookup. Focused
  Slate React surface contract, Slate React typecheck, `bun build:packages`,
  strict public package type smoke, declaration bundle inspection, and full
  `.tmp/slate-v2` `bun check` passed.
- 2026-06-15T09:04:17+0200 Kept packet
  `public-component-jsdoc-coverage-guard`: direct public Slate React component
  and component-like value exports now require immediate source JSDoc through
  the surface contract. Added missing hover docs for `Editable`,
  `EditableElement`, `SlateElement`, `SlateLeaf`, `SlatePlaceholder`,
  `SlateText`, and `SlateRuntime`. Focused Slate React surface contract, Slate
  React typecheck, `bun build:packages`, strict public package type smoke,
  declaration bundle inspection, and full `.tmp/slate-v2` `bun check` passed.
- 2026-06-15T09:08:48+0200 Kept packet
  `public-type-jsdoc-coverage-guard`: all 40 direct public Slate React type
  exports now require immediate source JSDoc through the surface contract.
  Added hover docs for provider props/change payloads, selector options,
  node/runtime contexts, root chrome/content controllers, decoration/history
  options, runtime/root command types, annotation/widget projectors, and React
  editor option/API types. Focused Slate React surface contract, Slate React
  typecheck, `bun build:packages`, strict public package type smoke,
  declaration bundle inspection, and full `.tmp/slate-v2` `bun check` passed.
  Workflow slowdown: a declaration `rg` pattern with backticks was initially
  double-quoted, so zsh tried to execute `createReactEditor`; reran with
  single quotes.
- 2026-06-15T09:12:21+0200 Kept packet
  `slate-core-explicit-root-jsdoc-guard`: explicit public `slate` root exports
  now require immediate source JSDoc through the core public-surface contract.
  Added docs for `createEditor`, `isEditor`, `createEditorRuntime`,
  `createEditorView`, `DebugValueScrubber`, and `setDebugValueScrubber`.
  Focused core public-surface contract, Slate package typecheck,
  `bun build:packages`, strict public package type smoke, emitted declaration
  chunk inspection, and full `.tmp/slate-v2` `bun check` passed. Workflow
  slowdown: core `dist/index.d.ts` is only a re-export shim; JSDoc proof lives
  in the emitted `packages/slate/dist/index-*.d.ts` chunk.
- 2026-06-15T09:15:40+0200 Kept packet
  `slate-dom-explicit-root-jsdoc-guard`: explicit public `slate-dom` root
  exports now require immediate source JSDoc through the DOM public-surface
  contract. Added docs for `SlateDOMResolutionError`, `dom`, `TRIPLE_CLICK`,
  `applyStringDiff`, environment flags, and `Hotkeys`. Focused DOM
  public-surface contract, Slate DOM typecheck, `bun build:packages`, strict
  public package type smoke, emitted declaration inspection, and full
  `.tmp/slate-v2` `bun check` passed. Workflow slowdown: root-level Bun path
  filters missed `packages/slate-dom/test/public-surface-contract.test.ts`;
  package-local `cd packages/slate-dom && bun test
./test/public-surface-contract.test.ts` is the stable focused command.
- 2026-06-15T09:19:00+0200 Kept packet
  `slate-browser-browser-subpath-jsdoc-guard`: `slate-browser/browser`
  runtime helper exports now require immediate source JSDoc through the package
  scripts contract. Added docs for `takeDOMSelectionSnapshot`,
  `takeEditorSelectionSnapshot`, and `inspectZeroWidthPlaceholder`. Focused
  package-scripts contract, Slate Browser typecheck, `bun build:packages`,
  strict public package type smoke, emitted declaration inspection, and full
  `.tmp/slate-v2` `bun check` passed. Deferred checkpoint: the much larger
  `slate-browser/core` and `slate-browser/playwright` helper/type hover-doc
  backlog remains open; do not claim full slate-browser hover-doc closure yet.
- 2026-06-15T09:20:22+0200 Kept no-change packet
  `slate-browser-core-subpath-jsdoc-guard-audit`: reran the core subpath
  value-export JSDoc audit and found no missing docs for the 21 re-exported
  runtime values. Existing package-scripts contract already scans re-export
  blocks for `browser`, `core`, `playwright`, and `transports`; the remaining
  slate-browser hover-doc backlog is direct declarations inside
  `src/playwright/index.ts`, not `core`.
- 2026-06-15T09:23:30+0200 Kept packet
  `slate-browser-playwright-value-jsdoc-guard`: direct value exports in
  `slate-browser/playwright` now require immediate source JSDoc through the
  package-scripts contract. Added hover docs for 49 runtime helpers: render
  profiler bridges, scenario/gauntlet factories, kernel trace checks,
  reduction/replay helpers, runtime error and clipboard helpers, selection and
  native-event snapshots, selection contract assertions, harness creation,
  render-state snapshots, and example openers. Focused package-scripts
  contract, Slate Browser typecheck, `bun build:packages`, strict public
  package type smoke, emitted declaration inspection, and full `.tmp/slate-v2`
  `bun check` passed. Deferred checkpoint: direct Playwright type-export hover
  docs are still not fully audited.
- 2026-06-15T09:26:48+0200 Kept packet
  `slate-browser-playwright-critical-type-jsdoc-guard`: critical direct
  `slate-browser/playwright` type exports now require source JSDoc through a
  named package-scripts guard. Added hover docs for high-use options, results,
  snapshots, expectations, scenario metadata/reduction/replay, harness,
  selection contract, and caret visibility types. Focused package-scripts
  contract, Slate Browser typecheck, `bun build:packages`, strict public
  package type smoke, emitted declaration inspection, and full `.tmp/slate-v2`
  `bun check` passed. Deferred checkpoint: lower-level direct Playwright
  trace/kernel type exports remain partially undocumented and should be handled
  in a separate packet if beta-DX review wants exhaustive slate-browser type
  hover docs.
- 2026-06-15T09:30:49+0200 Kept packet
  `slate-browser-transport-jsdoc-guard`: wildcard-exported
  `slate-browser/transports` declarations now require immediate source JSDoc
  through the package-scripts contract. Added docs for mobile transport
  ids/platforms/claims, proof capability matrix helpers, mobile surfaces and
  descriptors, URL builder, agent-browser defaults/batch builder, and Appium
  defaults/session descriptor builders. Focused package-scripts contract, Slate
  Browser typecheck, `bun build:packages`, strict public package type smoke,
  emitted declaration inspection, and full `.tmp/slate-v2` `bun check` passed
  after a formatter-only repair.
- 2026-06-15T09:36:40+0200 Kept packet
  `slate-browser-playwright-direct-type-jsdoc-exhaustive-guard`: every direct
  value and type export in `slate-browser/playwright` now requires immediate
  source JSDoc through the package-scripts contract. Added source docs for the
  102 remaining direct exported Playwright types, replaced the partial
  critical-type list with an exhaustive scanner, verified 151 direct exports /
  0 missing by audit, rebuilt declarations, inspected emitted Playwright
  declaration docs, and full `.tmp/slate-v2` `bun check` passed.
- 2026-06-15T09:38:12+0200 Kept no-change packet
  `post-jsdoc-release-discipline-guard`: release-discipline guard passed 999
  tests. This is private-alpha proof only; no release, publish, PR, changeset,
  or commit action was taken.
- 2026-06-15T09:41:02+0200 Kept no-change packet
  `post-jsdoc-stable-editor-behavior-sweep`: stable Chromium behavior sweep
  passed 225 tests with 6 scoped skips across richtext, plaintext, markdown
  shortcuts, editable voids, custom placeholder, hidden content, and DOM
  coverage boundaries.
- 2026-06-15T09:42:04+0200 Kept no-change packet
  `post-jsdoc-cross-browser-visual-native-smoke`: screenshot/native-selection
  smoke passed 27 tests across Chromium, Firefox, and WebKit.
- 2026-06-15T09:44:41+0200 Kept no-change packet
  `post-jsdoc-huge-document-cross-browser-sweep`: huge-document staged, auto,
  and virtualized behavior proof passed 90 tests with 3 scoped skips across
  Chromium, Firefox, and WebKit, covering Shift+ArrowUp/Down, select-all
  delete, typing, paste, undo/redo, scroll stability, virtualized scrollbar
  jumps, and native scrollbar drag buffering.
- 2026-06-15T09:46:19+0200 Kept no-change packet
  `post-jsdoc-huge-document-browser-trace-metric-smoke`: browser trace metrics
  stayed bounded: overall type-to-paint p95 18.1ms, overall select-to-paint p95
  55.4ms, selection ready p95 28ms, materialized select-to-paint p95 50.4ms,
  click-to-paint p95 29.7ms, burst-to-paint per op p95 3.93ms, model
  type-to-paint p95 39.3ms, DOM nodes p95 944 auto / 325 staged, heap p95
  18.41MB auto / 16.31MB staged, long tasks 0ms. Artifact:
  `.tmp/slate-v2/tmp/slate-react-huge-document-browser-trace-benchmark-surfaces-defaultAuto-stagedActiveDOMGroup-blocks-5000-iters-3-ops-10-after-delete-type-after-delete-text-after-200k-delete-run-2026-06-15T07-37-50.467Z.json`.
- 2026-06-15T09:55:36+0200 Kept packet
  `firefox-native-double-click-helper-repair`: full gate exposed a Firefox
  native double-click flake in the richtext toolbar native-word selection row.
  `doubleClickTextOffset` now accepts `selectedText`, retries the native
  double-click with spacing, and fails with native/model/displayed selection
  diagnostics instead of letting an empty native word selection pass silently.
  Focused proof before repair failed 2/8; final focused Firefox proof passed
  12/12; focused pagination projected-word proof passed 2/2; Slate Browser
  typecheck, package scripts, and full `.tmp/slate-v2` `bun check` passed.
- 2026-06-15T10:18:55+0200 Kept no-change packet
  `final-full-browser-proof-dedicated-server`: managed `bun check:full`
  completed fast checks and release-proof guards but hit a local Playwright
  webServer reuse race on port 3101 during full integration. A fresh dedicated
  server on port 3199 proved the full matrix with explicit
  `PLAYWRIGHT_BASE_URL`: 2010 passed, 562 skipped, 4 retry-recovered flakes,
  exit 0 in 15.0m. Huge-document staged, auto, and virtualized rows stayed
  green across Chromium, Firefox, WebKit, and scoped Playwright mobile rows.
- 2026-06-15T10:22:48+0200 Kept no-change packet
  `final-full-matrix-flake-isolation`: every retry-recovered full-matrix flake
  was repeated with retries disabled on the same dedicated server. Shadow DOM
  Chromium rows passed 16/16, forced-layout Firefox row passed 12/12, and
  visual-native inline-link Firefox row passed 20/20. Verdict: no product patch;
  log as harness/artifact/full-matrix flake debt if it repeats.

Open risks:

- Raw mobile/device proof remains deferred until a real device lane exists; do not market raw mobile coverage from Playwright viewport or desktop browser evidence.
- No release, publish, PR, or commit was performed. This is beta-readiness evidence for review, not a release action.
- Pagination architecture remains explicit opt-in and was not reopened in this closeout.
- API/DX taste review rows ranked above were approved by the user; they remain review anchors, not blockers.
- `bun check:full` as a single local command remains susceptible to Playwright
  webServer lifecycle races; closure proof used the equivalent decomposed gate:
  `bun check`, `bun test:release-proof`, and full integration against a fresh
  dedicated server.
