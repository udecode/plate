# Slate v2 Pretext Pagination Virtualization Feedback

Objective:
Close the Slate Plan lane for the virtualization / pagination feedback before
user review. The plan must cover Pretext as the layout engine, current
`canvas.measureText()` determinism limits, cross-platform line-break drift,
opt-in authoritative page-break snapshots for collab/export fidelity, page-level
virtualization when pagination is enabled, Tiptap pagination edge cases for
tables/images/font variability/padding, Slate v2 public API/runtime proof gates,
issue/reference accounting, score deltas, maintainer objections, and final
handoff.

Goal plan:
docs/plans/2026-05-25-slate-v2-pretext-pagination-virtualization-feedback.md

Template:
docs/plans/templates/slate-plan.md

Primary template:
docs/plans/templates/slate-plan.md

Applied packs:
- slate-plan

Completion threshold:
- Score >= 0.92, no dimension below 0.85.
- Every pass row complete or intentionally skipped with evidence.
- Related issue accounting closed against live/current ledgers.
- Final handoff emitted and no runnable plan-hardening action remains.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-slate-v2-pretext-pagination-virtualization-feedback.md` passes.

Verification surface:
- Planning artifacts in `plate-2`: this plan, related issue ledgers, research
  notes if updated, and completion check.
- Slate v2 source/API/runtime claims must cite live `.tmp/slate-v2` source reads
  or a `.tmp/slate-v2` command.
- Browser/runtime behavior claims require `.tmp/slate-v2` browser proof in a
  later pass. This pass records source evidence only.

Constraints:
- Planning mode only. Do not patch `.tmp/slate-v2` implementation.
- Allowed edit scope: `docs/plans/**`, `docs/research/**`,
  `docs/slate-issues/**`, `docs/slate-v2/ledgers/**`,
  `docs/slate-v2/references/**`.
- Keep Slate core Pretext-free. Layout is optional derived view data.
- Do not claim headless deterministic pagination until the measurement layer is
  actually headless and cross-platform-stable.

Boundaries:
- Local source of truth: `.tmp/slate-v2`, `../pretext`, existing plan/ledger
  artifacts.
- External sources: Cyrus Radfar Pretext article, local `../tiptap-docs` Pages
  docs, official Tiptap Pages docs, and Romik Makavana Tiptap pagination article
  URL, read only as evidence.
- GitHub Pretext source was read from local `../pretext`, not browsed.

Blocked condition:
- Block only if the same external source or workspace access failure prevents
  issue discovery, source grounding, score closure, or final verification for
  three consecutive activations.
- Do not use blocked while another research, ledger, objection, scoring, or
  plan-hardening move remains runnable.

Slate Plan lane state:
- slate_plan_lane_status: complete
- current_pass: Closure score and final gates
- current_pass_status: complete
- next_pass: none
- next_action: none
- final_handoff_status: complete

Current verdict:
- verdict: ready for user review
- confidence: 0.94 for planning readiness; implementation/browser proof remains
  execution-gated
- keep / cut / revise call:
  - Keep Pretext as the default `slate-layout` engine.
  - Cut any language that implies Pretext gives cross-client/server page-break
    determinism today.
  - Revise pagination virtualization: paged mode virtualizes pages/spreads first,
    not top-level blocks.
  - Add an opt-in authoritative page-break snapshot channel for strict collab and
    export fidelity.
  - Keep block virtualization for continuous/pathological documents, fed by
    layout when available.
- reason: current Slate v2 already has page snapshots, fragments, projections,
  Pretext-backed line layout, state fields, and TanStack-backed top-level
  virtualization, but those pieces are wired in the wrong repeated unit for
  paged documents and the determinism contract is currently too optimistic.
  Maintainer pressure keeps the plan but narrows ownership: raw Slate exposes
  substrate, `slate-layout` exposes derived layout and provider protocols,
  React owns DOM materialization, and apps/Plate own product UI and export
  policy. The ecosystem maintainer pass confirms there is no strategy reversal:
  Tiptap is negative evidence for CSS pagination, Premirror supports derived
  layout fragments, TanStack stays an internal range engine, and DOMCoverage
  stays Slate-owned browser-policy infrastructure. The revision pass locks the
  public beta direction: `pageView` replaces scattered page display props,
  `domStrategy` remains the only public incomplete-DOM switch, page virtualization
  is internal to `PagedEditable`, `measurementProfile` is metadata not a required
  user knob, and `pageBreaks` stays opt-in strict-fidelity metadata. High-risk
  pressure keeps implementation claims gated until the missing release proofs
  exist; adjacent tests are good evidence, not final proof. Issue sync accounting
  confirms the final API/proof wording changes no fixed/improved issue counts
  and is now reflected in the v2 sync ledger, coverage matrix, fork dossier, and
  PR reference. The closure pass verified the score threshold, pass table,
  planning-only verification surface, issue/reference sync, final handoff, and
  no-runnable-planning-work state.

Completion rule:
- Do not call `update_goal(status: complete)` while any pass/checklist/gate
  remains pending.
- Goal completion is legal only in the closure score/final gates pass.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | `slate-plan` skill read before plan edit |
| Active goal checked or created | yes | active goal objective matches this lane |
| Source of truth read before edits | yes | `.tmp/slate-v2`, `../pretext`, prior plans, issue ledgers, external articles read |
| `docs/solutions` checked for non-trivial existing-code work | yes | `rg` found no directly reusable solution note |
| Live `.tmp/slate-v2` grounding needed for current-state claims | yes | source reads recorded below |

Work Checklist:
- [x] Objective includes lane outcome, pass schedule, one-pass-per-activation
      policy, completion threshold, verification surface, constraints,
      boundaries, and blocked condition.
- [x] One-pass-per-activation policy respected: this activation closes only the
      Closure score and final gates pass.
- [x] Live source grounding recorded for current implementation claims.
- [x] Issue ledger / ClawSweeper pass applied: gitcrawl-v2 sync ledger, issue
      coverage matrix, and fork dossier updated; PR reference inspected and left
      unchanged because this planning pass adds no fixed/improved claims.
- [x] Research and ecosystem synthesis complete for every external system used
      as evidence in this pass.
- [x] Intent/boundary record and decision brief complete.
- [x] Scorecard recorded with evidence; total score >= 0.92 and no dimension
      below 0.85 before closure.
- [x] Applicable implementation-skill review matrix applied or skipped with
      concrete reason.
- [x] Slate maintainer objection ledger complete.
- [x] Verification workspace gate recorded for every Slate v2 source, runtime,
      browser, package, public API, or issue-fix claim.
- [x] TDD marked N/A for this pass: no implementation or behavior proof edited.
- [x] Browser proof marked N/A for this pass: source-only planning pass.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run final plan completion check in closure pass | Closure pass audited all scheduled passes, raised final weighted score to 0.92, and runs `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-slate-v2-pretext-pagination-virtualization-feedback.md` as the final checker. |
| Slate v2 source/runtime/browser/API claim | yes | Record live `.tmp/slate-v2` source/commands | Current-state claims are source-confirmed in the verification workspace gate; behavior/browser/API implementation proofs are recorded as future execution gates, and this planning lane makes no implementation or issue-fix claim. |
| Issue ledger or PR reference changed | yes | Sync manual rows; inspect PR reference for claim-count drift | `docs/slate-issues/gitcrawl-v2-sync-ledger.md`, `docs/slate-v2/ledgers/issue-coverage-matrix.md`, `docs/slate-v2/ledgers/fork-issue-dossier.md`, and `docs/slate-v2/references/pr-description.md` synced to final API/proof wording; fixed/improved claim counts unchanged |
| Autoreview for implementation changes | no | N/A planning-only | no `.tmp/slate-v2` implementation patch |
| Final user-review handoff | yes | Emit final handoff or keep next pass | Final user-review handoff recorded below; final response should summarize it. |
| Goal plan complete | yes | Run check-complete | `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-slate-v2-pretext-pagination-virtualization-feedback.md` passed in closure. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Current-state read and initial score | complete | this plan; live source/research rows below | related issue discovery |
| Related issue discovery | complete | live open ledger, v2 sync ledger, issue coverage matrix, fork dossier, PR reference, benchmark map, and frozen ledger read for related surface | issue-ledger pass |
| Issue-ledger pass | complete | gitcrawl-v2 sync ledger, issue coverage matrix, and fork dossier updated; PR reference no-change decision recorded | intent/boundary pass |
| Intent/boundary and decision brief | complete | owner boundaries, non-goals, decision rules, option matrix, chosen architecture, and consequences recorded | research refresh |
| Research, ecosystem strategy, live-source refresh | complete | compiled research page added; Pretext local source, Pretext research log, current Slate v2 source, Premirror source, TanStack source page, Cyrus article, local/official Tiptap Pages docs, and Medium access status recorded | pressure passes |
| Performance/DX/migration/regression/simplicity pressure passes | complete | pressure matrix recorded; public `pageVirtualization` cut for now; `domStrategy` remains the public degraded-DOM switch; authoritative breaks split into read/write roles; proof gates sharpened | objection ledger |
| Slate maintainer objection ledger | complete | maintainer persona objections recorded with keep/cut/revise decisions; API ownership narrowed; read/write page-break authority, provider protocol boundary, missing-DOM caveat, and example split hardened | high-risk pass |
| High-risk deliberate mode | complete | failure-mode table expanded; source/test evidence recorded for page mount planning, page-break authority, table/media split protocol, DOMCoverage, clipboard, IME, browser-find, and command gates; adjacent proof vs missing final proof separated | ecosystem maintainer pass |
| Ecosystem maintainer pass | complete | Pretext/Premirror/TanStack/Tiptap/DOMCoverage/GitHub large-surface keep-reject decisions rechecked against the high-risk queue; no strategy reversal, but Tiptap CSS pagination is a harder reject | revision pass |
| Revision pass | complete | final public API target, internal runtime target, proof queue, and issue-sync impact revised from ecosystem decisions; no new fixed/improved issue claims added | issue sync accounting |
| Issue sync accounting | complete | v2 sync ledger, issue coverage matrix, fork dossier, and PR reference updated/verified against final API target; no new fixed/improved issue claims | closure score and final gates |
| Closure score and final gates | complete | Closure audit verified the score threshold, all scheduled pass rows, issue/reference sync, planning-only workspace gate, TDD/browser N/A reasons, final handoff, reboot status, open risks, and no remaining planning pass. | final handoff |

Scorecard:
| Dimension | Weight | Score | Evidence |
|-----------|-------:|------:|----------|
| React 19.2 runtime performance | 0.20 | 0.90 | final plan isolates the runtime change to internal page/spread mounting behind virtualized `domStrategy`, keeps TanStack internal, and makes mounted page count/edit latency proof a release gate instead of a public API bet |
| Slate-close unopinionated DX | 0.20 | 0.93 | final plan leaves users with `useSlateLayout`, `PagedEditable`, `pageView`, `domStrategy`, and optional `pageBreaks`; no public TanStack, Pretext cache, `pageVirtualization`, or TableKit mechanism leaks |
| Plate and slate-yjs migration backbone | 0.15 | 0.92 | final plan keeps `pageBreaks` opt-in and state-field-shaped with read/write authority, profile/hash invalidation, writer identity, history-skip expectations, and export-reader proof before any collab/export claim |
| Regression-proof testing strategy | 0.20 | 0.93 | final plan maps every risky claim to explicit execution proof: page mount count, selected/promoted/composing retention, stale breaks, table/media/BFC/content rects, DOMCoverage copy/find/a11y caveats, canonical DX, and issue non-claim gates |
| Research evidence completeness | 0.15 | 0.94 | final plan has local Pretext source/research, external Pretext article, local/official Tiptap docs, Premirror source, TanStack/GitHub research, live Slate v2 source reads, issue ledgers, PR reference sync, maintainer objections, and ecosystem pass |
| shadcn-style composability and minimalism | 0.10 | 0.93 | final plan keeps one layout hook, one paged component, one `pageView` object, one `domStrategy` switch, metadata-only profiles, and provider/split extension points instead of product UI/API expansion |

Current weighted score after closure score and final gates: 0.92.

Source-backed architecture north star:
- target shape: `slate-layout` owns derived layout snapshots, page fragments,
  page-break snapshots, and optional measurement profiles; `slate-react` owns DOM
  materialization, page/block mount plans, selection, clipboard, IME, a11y, and
  browser proof.
- source evidence: `.tmp/slate-v2/packages/slate-layout/src/index.ts:236` defines
  snapshots with blocks/fragments/pages; `:277` defines engine boundary; `:1349`
  starts the Pretext page engine; `:1698` paginates measured blocks into
  fragments/pages.
- rejected drift: do not make `slate` core depend on Pretext, do not make
  virtualized mode default, and do not persist local page breaks by default.
- migration posture: layout settings can be shared/persisted document metadata;
  page-break snapshots are opt-in shared metadata with a profile hash and
  invalidation rules.

Public API target:
| Surface | Proposed shape | User-facing DX | Compatibility / migration | Evidence | Verdict |
|---------|----------------|----------------|---------------------------|----------|---------|
| continuous layout | `<Editable layout={layout} domStrategy="auto" />` | one optional layout object, no Pretext imports in React | compatible with no-layout editors | current `EditableProps` already accepts `layout`; current `EditableLayout` is narrow | keep/revise protocol |
| paged layout | `<PagedEditable layout={layout} domStrategy="staged" pageView={{ mode: 'single' \| 'spread', gap: 24 }} />` | page options grouped as page view, not scattered props | replace current `pageLayoutMode`/`pageGap` before beta | current `PagedEditableProps` exposes `pageLayoutMode` and `pageGap` | revise |
| page virtualization | internal behavior when `PagedEditable` receives virtualized `domStrategy` and page count crosses threshold | paged docs virtualize pages/spreads first without another public mode knob | keep TanStack internal; no public item/range/page-virtualization API | current `PagedEditable` feeds block items and renders all pages | final target |
| block virtualization | `<Editable domStrategy={{ type: 'virtualized', threshold, overscan, estimatedBlockSize }} />` | explicit stress/pathological mode for continuous docs | unchanged from current public object-only posture | current `DOMStrategyOptions` object-only virtualized mode | keep |
| measurement profile | snapshot metadata, not a required call-site prop | strict users see why a snapshot is accepted or stale without configuring a font engine | generated from engine/browser/font/typography/page settings; apps may add a stable font-set id later | Pretext source shows canvas/profile sensitivity | add metadata |
| authoritative breaks | optional `pageBreaks` source supplied to `useSlateLayout` | strict users can share accepted breaks for collab/export | default remains local derived layout and never writes shared breaks | state fields support shared/persisted/history-skipped metadata | add |

Authoritative page-break snapshot sketch:

```tsx
const pageBreaks = defineStateField<SlatePageBreakSnapshot>({
  key: 'layout.pageBreaks',
  collab: 'shared',
  history: 'skip',
  initial: () => null,
  persist: true,
})

const layout = useSlateLayout(editor, {
  page: pageSettings,
  pageBreaks: {
    mode: 'write',
    source: pageBreaks,
  },
  typography,
})
```

Rules:
- default mode is local derived layout, no shared page-break writes.
- authoritative mode stores page/fragment break decisions, not rendered DOM.
- `mode: 'read'` consumes accepted breaks for strict view/export; `mode:
  'write'` is reserved for the chosen client/server authority. Do not make every
  peer a writer.
- snapshots include engine id, measurement profile, font set id, typography hash,
  page settings hash, document version/range, and invalidation reason.
- peers may recompute locally for speed, but strict rendering/export reads the
  accepted snapshot when the profile matches.
- if profile/hash mismatches, the snapshot is stale and must not be silently used.
- `measurementProfile` is produced by the layout engine and stored in snapshots;
  users should not have to configure a browser/font engine to get ordinary
  pagination.
- write mode requires explicit writer identity and must use history-skipped
  derived updates. Read mode is the default strict-consumer shape.

Internal runtime target:
| Layer | Current owner | Target mechanism | Avoids | Evidence | Verdict |
|-------|---------------|------------------|--------|----------|---------|
| text measurement | Pretext via `slate-layout` | `prepare()` cached widths, `layout()` hot arithmetic | DOM reflow measurement | `../pretext/src/layout.ts:668`, `:696` | keep with caveat |
| measurement profile | absent/publicly implicit | opaque snapshot metadata: engine, browser/canvas/headless, font set, correction policy | fake deterministic export claims and user-facing font-engine knobs | `../pretext/src/measurement.ts:36` requires canvas; `:74` computes profile knobs | add metadata |
| page composition | `slate-layout` | fragments/pages plus split policy | page nodes in editor value | `.tmp/slate-v2/packages/slate-layout/src/index.ts:1698` | keep/revise |
| page virtualization | none yet | virtualizer item = page/spread rect with mounted page ranges and retained active pages | block-item churn in paged mode | `.tmp/slate-v2/packages/slate-layout/src/react.tsx:185` maps block items; `:219` maps all pages | add |
| continuous virtualization | `slate-react` | top-level/block/fragment items from layout | guessed heights as primary model | `use-virtualized-root-plan.ts:212` consumes top-level ids | keep |
| strict collab/export | absent | optional shared page-break snapshot | drift across OS/browser clients | Pretext research + external article | add |
| provider split protocol | generic box/split vocabulary exists | provider boxes for table/media/BFC-like content with intrinsic sizes and split rules | product-specific raw Slate TableKit | `.tmp/slate-v2/packages/slate-layout/src/index.ts:105` and `:113` define box kinds and split policies | add |

Hook / component / render DX target:
| Surface | Call-site shape | Composition rule | Performance rule | Evidence | Verdict |
|---------|-----------------|------------------|------------------|----------|---------|
| `useSlateLayout` | `useSlateLayout(editor, { page?, typography?, pageBreaks? })` | one layout source for continuous and paged consumers | memoized derived store; dirty range later | current hook exists | keep/revise |
| `PagedEditable` | `layout`, `domStrategy`, `pageView` | page UI wraps editable overlay | page/spread repeated unit when virtualized | current component renders all page surfaces | revise |
| `EditableLayout` protocol | current `getVirtualizedTopLevelItems` plus internal page/spread mount items | continuous docs can keep top-level items; paged docs must not force pages through the block API | page/spread item generation happens in `PagedEditable`, not user code | current protocol returns top-level items only | revise |
| canonical example | `pagination-basic` style route: `useSlateLayout` + `PagedEditable` only | users see the actual API before the proof harness | no debug/table/stress controls in first teaching surface | current example is a heavy proof surface | add |

Revision pass:
Pass verdict:
- The final public shape should be boring: `useSlateLayout`, `PagedEditable`,
  `pageView`, `domStrategy`, optional `pageBreaks`. Anything else is machinery.
- `pageVirtualization` is cut as public API. In paged mode, virtualized
  `domStrategy` means "I accept incomplete DOM"; `PagedEditable` decides the
  page/spread mount plan internally.
- `measurementProfile` is not a call-site feature. It is snapshot metadata used
  for stale detection and authoritative break validation.
- The `EditableLayout` bridge must grow internally, but users should not write
  virtualizer item adapters. `PagedEditable` owns page/spread items.
- The Tiptap lesson lands in tests and provider protocols, not in public
  pagination props.

Revision API decisions:
| Decision | Final call | Why | Proof owner |
|----------|------------|-----|-------------|
| `pageView` | replace `pageLayoutMode` and `pageGap` before beta | one grouped display object is easier to teach and avoids prop sprawl | docs/example smoke |
| `pageVirtualization` | no public prop | duplicates `domStrategy` and leaks mount policy | API review and type tests |
| paged virtualized unit | internal page/spread items | page surfaces are the repeated visual unit | package page-mount contract plus browser mounted-page count |
| `measurementProfile` | snapshot metadata | strict fidelity needs stale detection, not a user-facing browser engine | stale snapshot tests |
| `pageBreaks` | optional strict-fidelity source with read/write modes | collaboration/export need authority without turning local breaks into document truth | shared-state replay, history-skip, stale rejection, export read |
| split protocol | generic provider boxes/split policies | tables/images/BFCs need real split behavior without raw Slate shipping a product TableKit | table/media package fixtures |
| missing DOM | explicit degraded mode until proof | native find/a11y parity is false for unmounted pages | paged DOMCoverage browser rows and manual a11y lane |

Revision proof deltas:
| Surface | Required revision proof | Blocks closeout |
|---------|-------------------------|-----------------|
| API target | type/API review proves no `pageVirtualization` prop and `pageView` groups page display settings | yes |
| page mount plan | package test proves page/spread items, mounted page count, selected/promoted/composing retention, and no all-page surface render | yes |
| strict breaks | tests prove read mode does not write, write mode is elected/history-skipped, stale profile rejects, shared patch replay is compact, and export reads accepted breaks | yes |
| table/media providers | fixtures cover BFC-like containers, page content rect/padding, oversized image, table row split, merged cells, nested tables, and extension breakage risks | yes |
| missing DOM | browser rows prove copy/select-all/materialization and document native-find/a11y caveats | yes for parity claim |
| canonical DX | a basic example route shows only `useSlateLayout` + `PagedEditable`; proof harness remains separate | yes for user-review handoff |

Revision issue-sync impact:
- No new `Fixes #...` or `Improves #...` claim is justified by this revision.
- #5944 stays related/issue-reviewed until page-boundary flicker, caret mapping,
  and page-break stability browser proof lands.
- #790 stays proof-route backlog until mounted-page/block-count, edit latency,
  scroll, DOMCoverage, and native behavior proof lands.
- #2793/#2572 stay release guards for missing-DOM/native-equivalence language.
- The next pass only needs to verify and, if needed, align ledger wording with
  the final API target: no public `pageVirtualization`, `pageView`, metadata-only
  `measurementProfile`, opt-in `pageBreaks`, and provider/split protocol.

Intent / boundary record:
- intent: accept the feedback as architecture pressure, not as a footnote. The
  long-term call is Pretext-backed derived layout, page/spread virtualization for
  paged mode, and an opt-in authority channel for users who need export/collab
  page-break fidelity.
- outcome: the plan should let implementation proceed without reopening the
  core question of "block virtualizer plus page chrome" vs "page mount plan".
  Paged mode uses a page/spread mount plan; continuous mode may still use
  block/fragment virtualization.
- in-scope:
  - `slate-layout` measurement profiles, page snapshots, fragments, split
    policy protocols, and optional authoritative page-break snapshot shape.
  - `slate-react` DOM materialization, retained active pages, IME/selection/a11y
    behavior, clipboard behavior, and page-level virtualizer integration.
  - public API naming for `layout`, `pageView`, and `domStrategy`; page
    virtualization is internal behavior behind virtualized `domStrategy`.
  - proof routes for line-break drift, table/image splits, padding/content rects,
    mixed font metrics, collab/export authority, and missing-DOM accessibility.
  - issue non-claim posture for pagination, virtualization, a11y, and large-doc
    benchmarks.
- non-goals:
  - implementation in this planning pass.
  - claiming same page breaks across OS/browser/server while Pretext measurement
    still depends on canvas.
  - persisting local page breaks as default document truth.
  - exposing TanStack Virtual, Pretext internals, or measurement-cache plumbing
    as the main Slate API.
  - making virtualization default for ordinary editors.
  - putting product export policy, page toolbar UI, or Plate-specific document
    editor behavior into raw Slate.
  - solving all table layout inside raw Slate; the target is a provider/split
    protocol that table/media plugins can satisfy.
- owner boundaries:

| Owner | Owns | Must not own |
|-------|------|--------------|
| `slate` core | document value, paths, operations, selections, history semantics, state-field substrate | Pretext dependency, page DOM, virtualizer ranges, product export rules |
| `slate-layout` | derived layout snapshots, pages/fragments, measurement profiles, split-policy protocols, optional page-break snapshot schema | browser DOM mounting, React selection repair, persisted default page truth |
| `slate-react` | DOM materialization, page/block mount plans, active editing retention, clipboard/IME/selection/a11y proof | layout measurement authority, collab persistence policy, app-specific page UI |
| collaboration/export layer | authoritative writer choice, persistence, export replay, server/client trust policy | default local editing semantics for every editor |
| Plate/apps | product page UI, document-editor presets, export product decisions | raw Slate core contracts |

- decision boundaries:
  - If a datum is required to edit the document, it belongs to core.
  - If it can be recomputed from document + layout settings, it is derived
    layout, not document value.
  - If two clients can validly compute different breaks, strict consumers need
    an explicit authority; Slate must not pretend local layout is universal.
  - If a page is the repeated visual unit, virtualization uses pages/spreads
    first. Blocks remain the continuous-editor unit.
  - If an API requires users to understand TanStack or Pretext internals, it is
    the wrong public DX.
- unresolved user-decision points: none before issue sync. Revision pass decides
  `pageVirtualization` is internal behavior behind virtualized `domStrategy`.
  Exact provider type names can be finalized during implementation, but the
  architecture is fixed: generic box providers and split policies, no raw Slate
  product TableKit.

Decision brief:
- principles:
  1. Layout is derived, versioned, and profile-aware; document value is not page
     geometry.
  2. Page mode's repeated unit is page/spread, not block.
  3. Strict fidelity needs an authority; local recompute is not enough until
     measurement is truly headless/deterministic.
  4. Missing DOM stays explicit and measured.
  5. Public DX should say "layout and page view", not "virtualizer cache and
     Pretext measurement internals."
- top drivers:
  - Pretext's hot path is excellent, but `prepare()` is not headless today.
  - Current paged mode already has pages/fragments, so block virtualization is
    the wrong abstraction for pagination.
  - Tiptap's failures are mostly split-policy, box-model, and nested structure
    failures, not just "needs faster measurement."
  - Live collaboration and export cannot share hand-wavy page breaks. They need
    either same-profile local layout or a recorded authority.
- viable options:

| Option | Decision | Why |
|--------|----------|-----|
| Keep current block virtualization under `PagedEditable` | reject | it virtualizes the wrong unit and still leaves page surfaces as a separate rendering problem |
| Make page breaks document truth by default | reject | it turns browser/font drift into user data and creates noisy collaboration/history state |
| Wait for a future fully headless Pretext before designing the API | reject | it blocks useful same-browser pagination and hides the authority extension point users will need anyway |
| Server-only pagination authority | reject as default, keep as opt-in writer | too heavy for normal editing and bad offline DX, but valid for strict export/compliance flows |
| Page-level virtualization plus optional authoritative snapshots | choose | matches the visual unit, preserves Slate's document model, admits current measurement limits, and leaves a clean strict-fidelity path |

- chosen architecture:
  - `useSlateLayout` creates a derived, profile-aware layout snapshot.
  - `PagedEditable` consumes page/spread mount items, not block items, when
    pagination is enabled.
  - active/selected/composing pages are retained even when outside the viewport.
  - `pageBreaks` is an optional shared state field with profile/hash/version
    metadata; default mode never writes page breaks.
  - export/collab strict mode reads accepted breaks only when the profile is
    valid, and falls back to recompute/stale handling when it is not.
- consequences:
  - `PagedEditable` needs a page mount plan.
  - `EditableLayout` needs a richer protocol than top-level items.
  - Export/collab docs must distinguish local layout from authoritative layout.
  - Page virtualization proof must include selection, IME, clipboard, screen
    reader/missing-DOM risk, and page-boundary editing, not only scroll FPS.
  - Table/image correctness needs box-provider and split-policy tests, not just
    text measurement tests.
- follow-ups:
  - issue-sync accounting and closure passes.

Issue accounting:
| Issue / cluster | Claim category | Exact claim | Why | Proof route | V2 sync ledger | PR line |
|-----------------|----------------|-------------|-----|-------------|----------------|---------|
| #5944 stable per-line pagination | related, issue-reviewed | no fix/improves claim | plan targets pagination but lacks page-boundary browser proof | pagination browser rows for flicker/caret/page breaks | synced | no change needed |
| #790 dynamic rendering | related, proof-route backlog | no fix/improves claim | virtualization target is relevant but not proven | mount/edit/scroll benchmark, DOM coverage, native behavior proof | synced | no change needed |
| #5924 structural DOM exclusion | not claimed, unchanged | no fix/improves claim | page frames/debug/table structure should route through DOM coverage and mount policy, not a public ignore-cursor API | structural page/table frame DOM bridge proof | synced | no change needed |
| #2051 rerender breadth | guardrail | preserve existing performance guardrail | layout subscriptions must not widen invalidation | rerender breadth benchmark | synced | no change needed |
| #5131 selection subscription rerenders | not claimed, guardrail | preserve broad-hook non-claim | layout/page consumers must not make broad editor hooks worse | selector/block-slice locality benchmark | synced | no change needed |
| #4141 nested rerender breadth | improves-claimed, unchanged | preserve existing improves only | layout invalidation must keep ancestor/sibling rerender breadth local | nested rerender breadth benchmark | synced | no change needed |
| #2793 screen readers | release guard, cluster-synced | no fix/improves claim | page/block virtualization can hide DOM from assistive tech | screen-reader/virtual focus browser proof before native equivalence claim | synced | no change needed |
| #2572 a11y | release guard | no claim | virtualized/page-missing DOM affects screen readers | a11y/native surface complete proof | synced | no change needed |
| #3892 custom surfaces | policy non-claim | no claim | raw Slate substrate helps, product surfaces remain app-owned | docs/API only | synced | no change needed |
| #5945 large plaintext paste | improves-claimed, unchanged | preserve existing improves only | layout/virtualization plan must not promote paste performance to fix closure | existing 10,000-line benchmark plus browser artifact if ever promoted | synced | no change needed |
| #4056 large copy/paste | improves-claimed, unchanged | preserve existing improves only | large-document paste/copy claim remains clipboard/operation-owned, not pagination-owned | populated copy/paste benchmark plus historical browser repro if ever promoted | synced | no change needed |
| #5992 huge cut | improves-claimed, unchanged | preserve existing improves only | large-document cut claim remains operation/benchmark-owned, not virtualizer-owned | 50,000-block benchmark plus maintainer acceptance if ever promoted | synced | no change needed |

Related issue discovery pass:
- sources read:
  - `docs/slate-issues/gitcrawl-live-open-ledger.md`
  - `docs/slate-issues/gitcrawl-v2-sync-ledger.md`
  - `docs/slate-v2/ledgers/issue-coverage-matrix.md`
  - `docs/slate-v2/ledgers/fork-issue-dossier.md`
  - `docs/slate-v2/references/pr-description.md`
  - `docs/slate-issues/benchmark-candidate-map.md`
  - `docs/slate-issues/open-issues-ledger.md`
- live open rows:
  - #5992, #5945, #5944, #5924, #5131, #4141, #4056, #3892,
    #2793, #2572, #2051, and #790 are all present in the current
    generated live ledger.
- current classification:
  - #5944 is the only direct pagination issue. Keep it related and
    issue-reviewed until page-boundary flicker/caret mapping has current browser
    proof.
  - #790 is the direct dynamic rendering / virtualization issue. Keep it related
    proof-route backlog until mount/edit/scroll benchmark, DOM coverage, and
    browser native-behavior proof exist.
  - #5924 is adjacent because page/table/debug structural DOM exists around the
    editor. Keep it not claimed; DOM coverage and mount policy are the answer,
    not a new ignore-cursor public API from this plan.
  - #4141, #5131, and #2051 are invalidation/subscription guardrails. Layout
    snapshots and page virtualization must not widen rerender breadth.
  - #2793 is the stronger screen-reader guard for missing-DOM modes. #2572 stays
    accessibility/docs pressure, but #2793 is the row that blocks native
    equivalence claims for virtualized pages.
  - #5945, #4056, and #5992 stay owned by large-document operation/clipboard
    benchmarks. This pagination plan must not promote their existing
    `Improves` rows.
- discovery decision:
  - no new `Fixes #...` claims.
  - no new `Improves #...` claims.
  - manual sync ledgers now record the #2793 addition and this plan's no-claim
    posture.

Issue-ledger sync status:
- ClawSweeper related-issue pass: complete
- generated live gitcrawl rows read: complete for the current related surface
- manual v2 sync ledger update: complete and revised to final API/proof wording in
  `docs/slate-issues/gitcrawl-v2-sync-ledger.md`
- fork issue dossier update: complete and revised to final API/proof wording in
  `docs/slate-v2/ledgers/fork-issue-dossier.md`
- issue coverage matrix update: complete and revised to final API/proof wording in
  `docs/slate-v2/ledgers/issue-coverage-matrix.md`
- PR description sync: complete in `docs/slate-v2/references/pr-description.md`;
  planning target wording added, fixed/improved claim counts unchanged

Issue sync accounting pass:
Pass verdict:
- The final API/proof revision changes planning wording, not issue claim status.
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md`,
  `docs/slate-v2/ledgers/issue-coverage-matrix.md`,
  `docs/slate-v2/ledgers/fork-issue-dossier.md`, and
  `docs/slate-v2/references/pr-description.md` now agree on the final target:
  no public `pageVirtualization`, `pageView` for page display settings,
  metadata-only `measurementProfile`, opt-in `pageBreaks`, internal page/spread
  virtualization behind virtualized `domStrategy`, and generic provider/split
  protocols for table/media/BFC pagination.
- Claim count remains zero for this plan: no new `Fixes #...` and no new
  `Improves #...`.

Issue sync accounting decisions:
| Surface | Final accounting | Reason |
|---------|------------------|--------|
| #5944 | related, issue-reviewed, no claim | needs page-boundary flicker, caret mapping, and page-break stability browser proof |
| #790 | related proof-route backlog, no claim | needs mounted-count, mount/edit/scroll, DOMCoverage, and native behavior proof |
| #5924 | not claimed | answer is DOMCoverage, mount policy, and provider/split protocols, not public ignore-cursor API |
| #2793/#2572 | release guards | missing-DOM page virtualization cannot claim native screen-reader/a11y parity without proof or explicit degraded docs |
| #4141/#5131/#2051 | guardrails unchanged | layout/page consumers must not widen rerender breadth or subscriptions |
| #5945/#4056/#5992 | existing `Improves` unchanged | large-document operation/clipboard claims stay owned by existing benchmark rows |
| PR reference | planning target synced, no claim-count change | public target wording belongs in PR narrative, but no issue status changed |

Ecosystem strategy synthesis:
| System | Source | Mechanism | Avoids | Steal | Reject | Slate target | Verdict |
|--------|--------|-----------|--------|-------|--------|--------------|---------|
| Pretext | local `../pretext`, Cyrus article, compiled source page | prepare once, hot layout arithmetic, profile-sensitive measurement | DOM layout thrash | layout/profile split and serialized prepared-data direction | claiming full headless determinism today | profile-aware layout engine plus optional authoritative breaks | agree/revise |
| Premirror | local `../premirror` | snapshot -> measure -> compose -> render | page nodes as document truth | derived layout pipeline and page chrome outside content | ProseMirror position model | Slate path/root/run/fragment mapping | agree |
| TanStack Virtual | current Slate + research note | headless range engine | owning editor semantics | page/block range engine internally; latest upstream iOS/perf work is useful implementation fuel | public TanStack API | internal page/block adapter | agree |
| Tiptap pagination failures | local `../tiptap-docs`, official Tiptap Pages docs, user-provided Medium summary | exposes CSS-float/BFC limits, oversized non-splittable blocks, table-kit specialization, figures, and padding/content-height traps | naive top-level node paging | failure taxonomy, split-policy tests, box-model tests | CSS-float page layout, product-specific raw Slate TableKit, "move whole block" fallback | line/row/avoid/intrinsic split policies | agree as negative evidence |
| DOMCoverage | current Slate v2 source and Playwright rows | records intentionally hidden ranges with copy/find/selection policy | pretending missing DOM has native parity | policy boundary and materialization contract | making virtualization a layout-only concern | Slate-owned browser-policy layer for page virtualized mode | agree with caveat |
| GitHub large-surface virtualization | compiled TanStack/GitHub research | reduce repeated-unit cost before virtualizing p95+ surfaces | premature virtualization as architecture | sequence: simplify rows, delegate events, O(1) maps, then virtualize tail | default incomplete DOM without editor policy | performance discipline for page/surface budget | agree |

Ecosystem maintainer pass:
Pass verdict:
- No ecosystem source changes the target architecture. The right move is still
  Pretext for layout, Premirror's derived-fragment shape, TanStack as an
  internal range engine, DOMCoverage as Slate-owned browser policy, and Tiptap
  as a warning label.
- The user feedback is correct and worth making sharper: Tiptap's public Pages
  docs say the CSS-float model breaks on BFC-style blocks and proposes caps or
  manual node splitting. That is exactly the failure mode Slate must avoid.
- The pushback is also important: this is not an argument against pagination or
  page-level virtualization. It is an argument against making CSS page gaps,
  product TableKits, or semantic manual splits the substrate.

Ecosystem final keep/reject decisions:
| Source | Keep | Reject | Plan consequence |
|--------|------|--------|------------------|
| Pretext | `prepare()`/`layout()` split, profile-sensitive measurement, hot arithmetic layout | same-breaks claim across browser/server/client profiles today | `measurementProfile` and optional authoritative page-break snapshots stay required |
| Premirror | document state separate from composed pages/fragments; page chrome outside editable content | PM position model and page nodes as document truth | Slate uses roots/paths/runs/fragments and keeps pagination derived |
| TanStack Virtual | visible range, measured sizes, retained index/range extension, future iOS/perf improvements | public virtualizer API or exposing TanStack knobs | use an internal page/spread adapter in paged mode; upgrade is an execution task, not public API design |
| Tiptap Pages | limitation taxonomy for BFCs, tables, figures, styled containers, padding/content rects, export, and extension breakage | CSS floats, `--page-max-height` as a correctness fix, manual semantic splitting, product-specific raw Slate TableKit | provider/split-policy protocol plus table/media/page-boundary tests |
| DOMCoverage | explicit missing-DOM copy/find/selection policy and materialization hooks | native browser-find/a11y parity claims before paged proof | page-virtualized mode must document degraded behavior until browser proof lands |
| GitHub large-surface virtualization | optimize repeated units first, virtualize the tail, measure p95+ pressure | virtualize before reducing row/page surface cost | page/surface budget and mounted-page-count proof become release gates |

Tiptap-specific correction:
- The official limitations page and local source now make the CSS trick look
  worse, not better. If a block cannot split because it creates a BFC, `max-height`
  is not real pagination; it is a content authoring constraint wearing a layout
  hat.
- Manual node splitting is also not acceptable as a raw Slate answer because it
  mutates document semantics to satisfy a view problem.
- PagesTableKit is useful proof that tables need special split logic. It is not
  a model for raw Slate; raw Slate should expose a generic box provider and split
  policy, while table/media packages provide table-specific behavior.

Ecosystem pass deltas:
- Strengthened the Tiptap row from "negative evidence" to "hard reject the
  CSS-float mechanism; steal only its failure taxonomy."
- Added DOMCoverage as an explicit ecosystem strategy row so virtualization does
  not get treated as layout-only.
- Added the GitHub large-surface sequence as performance discipline: reduce
  repeated-unit cost first, then virtualize the large tail.
- Kept the TanStack upgrade note as implementation fuel only. The public API
  still must not expose TanStack's option model.
- Left issue/PR fixed-claim counts unchanged; this pass changes planning
  confidence, not fixed issue scope.

Research, ecosystem strategy, and live-source refresh pass:
- compiled research artifact:
  - `docs/research/sources/editor-architecture/pretext-pagination-page-virtualization.md`
    added and indexed from the editor-architecture README and research index.
- local Pretext source refresh:
  - `../pretext/src/measurement.ts:36` still creates an OffscreenCanvas or DOM
    canvas context.
  - `../pretext/src/measurement.ts:49` still throws without canvas access.
  - `../pretext/src/measurement.ts:61` still calls `ctx.measureText(seg).width`.
  - `../pretext/src/measurement.ts:74` now makes browser engine profile knobs
    explicit, which strengthens the plan's measurement-profile requirement.
  - `../pretext/src/layout.ts:668` keeps `prepare()` as the segment measurement
    and cache phase.
  - `../pretext/src/layout.ts:696` keeps `layout()` arithmetic-only on cached
    widths.
- local Pretext research refresh:
  - `../pretext/RESEARCH.md:55` records `system-ui` canvas/DOM font-resolution
    mismatch.
  - `../pretext/RESEARCH.md:131` records emoji canvas/DOM width discrepancy.
  - `../pretext/RESEARCH.md:142` treats the HarfBuzz headless probe as useful
    research, not runtime direction.
  - `../pretext/RESEARCH.md:156` keeps final parity work in `prepare()` /
    browser diagnostics / small browser-specific tolerance, while `layout()`
    stays arithmetic-only.
- external Pretext refresh:
  - Cyrus Radfar article fetched 2026-05-25:
    https://cyrusradfar.com/thoughts/pretext-beyond-the-browser
  - the article supports the same split: portable hot layout is plausible, but
    initial measurement still depends on `canvas.measureText()` and matching
    browser font metrics outside the browser is hard work.
- current Slate v2 source refresh:
  - `.tmp/slate-v2/packages/slate-layout/src/index.ts:105` has box kinds for
    block, code line, image, table, table cell, and thematic break.
  - `.tmp/slate-v2/packages/slate-layout/src/index.ts:113` already names
    `avoid`, `line`, `page`, and `row` split policy vocabulary.
  - `.tmp/slate-v2/packages/slate-layout/src/index.ts:236` has blocks,
    fragments, page, pages, root, settings, and version in snapshots.
  - `.tmp/slate-v2/packages/slate-layout/src/index.ts:1349` still uses the
    Pretext page layout engine.
  - `.tmp/slate-v2/packages/slate-layout/src/react.tsx:185` still maps projected
    blocks into top-level virtualized layout items.
  - `.tmp/slate-v2/packages/slate-layout/src/react.tsx:219` still renders all
    page surfaces.
  - `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:548`
    still exposes only `getVirtualizedTopLevelItems`.
  - `.tmp/slate-v2/packages/slate-react/src/dom-strategy/use-virtualized-root-plan.ts:95`
    retains selected/promoted top-level indexes through the range extractor.
- Premirror refresh:
  - `../premirror/README.md:14` describes measured snapshot -> deterministic
    layout with pages, frames, line boxes, and placed runs.
  - `../premirror/docs/milestone-1-implementation-plan.md:20` keeps a single
    contenteditable root and renders visual pagination from composed output.
  - `../premirror/docs/milestone-1-implementation-plan.md:22` represents page
    splits as layout fragments, not ProseMirror node splits.
- Tiptap refresh:
  - the Medium article URL currently returns a Cloudflare challenge to curl, so
    the plan treats the user's summary as review context, not independently
    refreshed text.
  - local `../tiptap-docs/src/content/pages/core-concepts/limitations.mdx:17`
    says Tiptap Pages uses CSS floats around page gaps; BFC blocks such as
    tables, figures, and styled containers cannot split across pages and can
    break pagination when too large.
  - local `../tiptap-docs/src/content/pages/core-concepts/limitations.mdx:18`
    uses `max-height` / `--page-max-height` as a mitigation for non-splittable
    blocks.
  - local `../tiptap-docs/src/content/pages/core-concepts/limitations.mdx:19`
    suggests manual node splitting and warns it changes document structure and
    may affect semantics.
  - local `../tiptap-docs/src/content/pages/guides/table-with-pages.mdx:16`
    says table pagination needs `@tiptap-pro/extension-pages-tablekit` because
    table behavior and layout were heavily modified to split across pages.
  - local `../tiptap-docs/src/content/pages/guides/table-with-pages.mdx:52`
    warns the open-source TableKit is not compatible with Pages layout; `:63`
    warns extension authors can break the splitting logic.
  - official Tiptap Pages limitations fetched 2026-05-25:
    https://tiptap.dev/docs/pages/core-concepts/limitations
  - official Tiptap Pages table guide fetched 2026-05-25:
    https://tiptap.dev/docs/pages/guides/table-with-pages
  - current Tiptap docs validate the core pressure but not the mechanism:
    steal the failure taxonomy; reject the CSS-float/page-gap pagination model.
- pass decision:
  - keep Pretext.
  - add profile-aware layout vocabulary.
  - keep page-level virtualization as the paged-mode repeated unit.
  - do not expose TanStack, Pretext measurement caches, or Tiptap-style product
    table kits as raw Slate public API.
  - do not copy Tiptap's CSS-float pagination trick.
  - require provider/split-policy tests for table/media and page content rects.

Performance/DX/migration/regression/simplicity pressure pass:
- pressure verdict:
  - the architecture survives, but the public API needed a cut: no public
    `pageVirtualization` prop before beta.
  - `domStrategy` is already the public "I accept incomplete DOM" switch.
    `PagedEditable` should internally choose a page/spread mount plan when that
    strategy is virtualized.
  - authoritative breaks need read/write authority roles; a blanket
    read-write peer mode is too noisy for collaboration.
  - Tiptap Pages is useful as warning material, not as a model: the local docs
    confirm the CSS-float/BFC approach forces max-height hacks, manual semantic
    splits, and specialized table layout.
- performance pressure:

| Claim under pressure | Failure mode | Pressure result | Plan delta |
|----------------------|--------------|-----------------|------------|
| Paged mode should virtualize pages/spreads | Page surfaces still all render if only blocks are virtualized | confirmed by `.tmp/slate-v2/packages/slate-layout/src/react.tsx:185` and `:219` | add page/spread mount plan inside `PagedEditable` |
| Keep TanStack internal | Public TanStack knobs become editor contract | existing research keeps TanStack limited to visible index range, size, overscan, retained indexes | keep `domStrategy` public; no virtualizer item API |
| Retain active editing targets | Page virtualizer unmounts caret/IME page | current top-level virtualizer retains selected/promoted indexes at `use-virtualized-root-plan.ts:95`; page plan must add selected/promoted/composing page retention | proof gate for selection, IME, and composition |
| Profile-aware layout is enough for strict users | Local recompute still drifts across profiles | not enough for export/collab strict mode | require optional authoritative snapshot |

- DX pressure:

| Surface | Pressure result | Reason |
|---------|-----------------|--------|
| `pageVirtualization` prop | cut for now | one more mode knob leaks implementation; `domStrategy` already says whether incomplete DOM is allowed |
| `pageLayoutMode` / `pageGap` | replace with `pageView` before beta | current separate props in `PagedEditableProps` are small but not the clean long-term shape |
| pagination example | split canonical DX from proof harness | current example owns tables/images/debug/projection/toolbar code; it is useful proof, not best first-read DX |
| `pageBreaks` option | keep advanced, role-based | strict consumers need it; ordinary editors should never see it |
| Tiptap-style pagination controls | reject | CSS-float page gaps, `max-height`, and manual node splitting are not Slate-quality primitives |

- migration pressure:

| Migration axis | Required posture | Reason |
|----------------|------------------|--------|
| existing no-layout editors | no API change | `layout` remains optional |
| current paged example | rename/reshape before beta | `pageView` avoids long-term scattered page props |
| Plate document editor | Plate can wrap page UI and export policy | raw Slate should expose substrate only |
| slate-yjs / collaboration | page settings can be shared; breaks are opt-in shared metadata | default local page breaks would create noisy remote updates |
| export | reads accepted breaks only when profile/hash matches | prevents silent stale export |

- regression pressure:

| Risk | Required proof before implementation closure |
|------|---------------------------------------------|
| page-boundary editing | browser row: type/delete/selection across page fragments |
| page virtualizer retention | browser row: scroll away while selection/composition target is retained |
| clipboard/select-all | browser row: model-backed copy includes unmounted pages or degraded behavior is explicit |
| screen readers/browser find | #2793/#2572 guard: no native-equivalence claim while offscreen pages are missing |
| table/media | unit + browser rows for row split, merged cell, nested table, oversized image, and content rect |
| CSS-float/BFC traps | fixture rows for BFC-like boxes, figures, styled containers, and oversized non-splittable content |
| cross-profile drift | deterministic compare across at least two browser/font profiles, or explicit profile-gated stale result |
| authoritative breaks | state-field replay and stale-profile invalidation tests |

- simplicity pressure:
  - keep one public layout hook: `useSlateLayout(editor, options)`.
  - keep one paged component: `PagedEditable`.
  - keep one public incomplete-DOM switch: `domStrategy`.
  - keep one page-view grouping: `pageView`.
  - keep `pageBreaks` advanced and optional.
  - use Tiptap Pages as a failure taxonomy only.
  - do not copy Tiptap's CSS-float/page-gap pagination model.
  - do not add a Tiptap-like TableKit to raw Slate; add provider/split protocol
    and let table/media packages satisfy it.
- implementation-skill pressure:
  - performance-oracle: applied. The hot loop is not React rendering; the risk
    is wrong repeated unit and page-surface overmounting.
  - performance: applied. Benchmark must count mounted pages/surfaces and edit
    latency, not only scroll range math.
  - vercel-react-best-practices: skipped for this planning pass; no React code
    edited, but execution must review effect dependencies and external-store
    subscriptions in `useSlateLayout` / `PagedEditable`.
  - react-useeffect: skipped for this planning pass; same reason.
  - tdd: N/A for planning, but proof gates are now test-shaped.
  - shadcn: skipped; no UI implementation and raw Slate public API is the issue.
- pass decision:
  - chosen public beta target:

```tsx
const layout = useSlateLayout(editor, {
  page,
  pageBreaks: strictMode
    ? { mode: 'read', source: pageBreaks }
    : undefined,
  typography,
})

<PagedEditable
  domStrategy={{ type: 'virtualized', estimatedBlockSize: 48, overscan: 3, threshold: 80 }}
  layout={layout}
  pageView={{ gap: 24, mode: 'single' }}
/>
```

  - `PagedEditable` may internally virtualize pages/spreads first when paged and
    virtualized. Block virtualization remains the continuous-editor repeated
    unit.

Legacy regression proof matrix:
| Regression class | Legacy behavior | Slate v2 target | Proof route | Owner | Status |
|------------------|-----------------|-----------------|-------------|-------|--------|
| paragraph at page boundary | editable paragraph keeps text/caret stable | line-fragment split with stable caret mapping | pagination Playwright page-boundary rows | slate-layout/slate-react | pending |
| table split / merged cells | tables do not overlap footer/page padding | row/span-aware table box provider | table fixture with merged cells and page boundary | layout + table plugin | pending |
| image/void block | intrinsic media stays in content frame | avoid/intrinsic box with measured size | image/void pagination browser row | layout + app resolver | pending |
| mixed font sizes | line height follows run metrics | line-owned max metrics, not one block lineHeight | unit + browser rich-inline row | slate-layout | pending |
| padding/page frame | no blank spacer hacks | page content rect and block box model | debug frame browser row | slate-layout | partial |
| strict export/collab | screen/export match when required | authoritative page-break snapshot | shared state + export fixture | slate-layout/slate-yjs/app | pending |

Browser stress / parity strategy:
| Surface | Scenario | Browser/device | Command or proof route | Expected signal | Status |
|---------|----------|----------------|------------------------|-----------------|--------|
| pagination page virtualization | 500+ pages, scroll middle, type | Chromium first, then WebKit/Firefox | `.tmp/slate-v2` pagination Playwright grep | only visible/retained pages mounted, typing stable | pending |
| cross-platform drift | same doc/font/page settings on multiple profiles | Chromium/WebKit/Firefox, macOS/Linux | deterministic snapshot compare | drift recorded or profile-gated | pending |
| authoritative breaks | peer/export reads accepted breaks | unit + browser | state field replay + export proof | matching page breaks when profile valid | pending |
| table/image edge cases | table split, merged cell, image near boundary | Chromium | pagination fixture | no overlap, no lost content | pending |
| missing-DOM a11y | page virtualization with offscreen pages missing | screen-reader-capable browser/manual lane | #2793/#2572 release guard row | no native-equivalence claim until assistive-tech behavior is proven or documented as degraded | pending |

Verification workspace gate:
| Claim | Workspace | Command / source | Result | Owner |
|-------|-----------|------------------|--------|-------|
| Pretext prepare uses canvas; layout hot path is arithmetic | `../pretext` | `nl -ba ../pretext/src/layout.ts`; `nl -ba ../pretext/src/measurement.ts` | source-confirmed | current pass |
| Pretext has documented font/profile drift | `../pretext` | `nl -ba ../pretext/RESEARCH.md` | source-confirmed | current pass |
| Slate layout has pages/fragments/snapshots and Pretext engine | `.tmp/slate-v2` | `nl -ba packages/slate-layout/src/index.ts` | source-confirmed | current pass |
| Current paged editable feeds block layout items and renders all page surfaces | `.tmp/slate-v2` | `nl -ba packages/slate-layout/src/react.tsx` | source-confirmed | current pass |
| Current virtualized plan is top-level id/index based | `.tmp/slate-v2` | `nl -ba packages/slate-react/src/dom-strategy/use-virtualized-root-plan.ts` | source-confirmed | current pass |
| Current example keeps page settings in shared state | `.tmp/slate-v2` | `nl -ba site/examples/ts/pagination.tsx` | source-confirmed | current pass |
| Issue-ledger no-claim posture synced | `plate-2` | `rg -n "Pretext Pagination / Page Virtualization Feedback" docs/slate-issues/gitcrawl-v2-sync-ledger.md docs/slate-v2/ledgers/issue-coverage-matrix.md docs/slate-v2/ledgers/fork-issue-dossier.md` | artifact-confirmed | issue-ledger pass |
| PR reference did not need claim sync | `plate-2` | `rg -n "#5944|#2793|#790|page virtualization" docs/slate-v2/references/pr-description.md` | no matching PR-claim rows; no change needed | issue-ledger pass |
| Intent/boundary and decision brief hardened | `plate-2` | `rg -n "owner boundaries|Page-level virtualization plus optional authoritative snapshots|Server-only pagination authority|chosen architecture" docs/plans/2026-05-25-slate-v2-pretext-pagination-virtualization-feedback.md` | artifact-confirmed | intent/boundary pass |
| Compiled Pretext pagination research added | `plate-2` | `rg -n "Pretext Pagination And Page Virtualization|Current Conclusion|Tiptap Pagination Lessons" docs/research/sources/editor-architecture/pretext-pagination-page-virtualization.md` | artifact-confirmed | research pass |
| Research indexes updated | `plate-2` | `rg -n "pretext-pagination-page-virtualization" docs/research/sources/editor-architecture/README.md docs/research/index.md docs/research/log.md` | artifact-confirmed | research pass |
| Current Pretext headless/profile facts refreshed | `../pretext` | `nl -ba ../pretext/src/measurement.ts`; `nl -ba ../pretext/src/layout.ts`; `nl -ba ../pretext/RESEARCH.md` | source-confirmed | research pass |
| Current Slate v2 paged/virtualization facts refreshed | `.tmp/slate-v2` | `nl -ba packages/slate-layout/src/index.ts`; `nl -ba packages/slate-layout/src/react.tsx`; `nl -ba packages/slate-react/src/components/editable-text-blocks.tsx`; `nl -ba packages/slate-react/src/dom-strategy/use-virtualized-root-plan.ts` | source-confirmed | research pass |
| Current Tiptap Pages docs fetched | `plate-2` | `curl -L https://tiptap.dev/docs/pages/core-concepts/limitations`; `curl -L https://tiptap.dev/docs/pages/guides/table-with-pages` | official-doc evidence extracted | research pass |
| Local Tiptap Pages docs read | `../tiptap-docs` | `nl -ba src/content/pages/core-concepts/limitations.mdx`; `nl -ba src/content/pages/guides/table-with-pages.mdx` | source-confirmed negative evidence: CSS floats, BFC split limits, max-height/manual split mitigations, specialized TableKit | pressure pass |
| Medium article current access status | `plate-2` | `curl -L https://romik-mk.medium.com/tiptap-pagination-problems-solutions-31f1a0b51e08` | Cloudflare challenge; user summary retained as review context | research pass |
| Pressure pass source checks | `.tmp/slate-v2` + `plate-2` | `nl -ba .tmp/slate-v2/site/examples/ts/pagination.tsx`; `nl -ba .tmp/slate-v2/packages/slate-layout/src/react.tsx`; `nl -ba .tmp/slate-v2/packages/slate-react/src/dom-strategy/use-virtualized-root-plan.ts`; `nl -ba docs/research/sources/editor-architecture/tanstack-virtual-and-github-large-surface-virtualization.md` | source-confirmed pressure points for API/DX/perf proof | pressure pass |
| Pressure pass artifact recorded | `plate-2` | `rg -n "Performance/DX/migration/regression/simplicity pressure pass|pageVirtualization|chosen public beta target" docs/plans/2026-05-25-slate-v2-pretext-pagination-virtualization-feedback.md` | artifact-confirmed | pressure pass |
| Maintainer objection source checks | `.tmp/slate-v2` + `plate-2` | `nl -ba .tmp/slate-v2/packages/slate-layout/src/index.ts`; `nl -ba .tmp/slate-v2/packages/slate-layout/src/react.tsx`; `nl -ba .tmp/slate-v2/packages/slate-react/src/dom-strategy/use-virtualized-root-plan.ts`; `nl -ba .tmp/slate-v2/packages/slate-react/src/components/dom-coverage-boundary.tsx`; `nl -ba .tmp/slate-v2/packages/slate/src/interfaces/editor.ts`; `nl -ba .tmp/slate-v2/packages/slate/src/core/public-state.ts`; `nl -ba .tmp/slate-v2/site/examples/ts/pagination.tsx` | source-confirmed ownership, state-field, DOM coverage, current paged rendering, and example DX objections | maintainer objection pass |
| Maintainer objection artifact recorded | `plate-2` | `rg -n "Slate maintainer objection ledger|Pass verdict|Default shared page-break writes|raw Slate product TableKit|Maintainer objection source checks" docs/plans/2026-05-25-slate-v2-pretext-pagination-virtualization-feedback.md` | artifact-confirmed | maintainer objection pass |
| High-risk source and test checks | `.tmp/slate-v2` + `plate-2` | `rg -n "pagination|paged|page layout|page-break|virtualized|DOMCoverage|a11y|clipboard|composition|select all|find" .tmp/slate-v2/packages .tmp/slate-v2/site -g '*.{test,ts,tsx,json}'`; `nl -ba .tmp/slate-v2/package.json`; `nl -ba .tmp/slate-v2/packages/slate-layout/test/page-layout-contract.test.ts`; `nl -ba .tmp/slate-v2/packages/slate-react/test/dom-strategy-and-scroll.tsx`; `nl -ba .tmp/slate-v2/playwright/integration/examples/pagination.test.ts`; `nl -ba .tmp/slate-v2/playwright/integration/examples/dom-coverage-boundaries.test.ts` | source-confirmed adjacent proof and missing final proof for high-risk rows | high-risk pass |
| High-risk artifact recorded | `plate-2` | `rg -n "High-risk deliberate-mode pre-mortem|High-risk proof queue|wrong paged virtualization unit|authoritative break state churn|release gate too weak" docs/plans/2026-05-25-slate-v2-pretext-pagination-virtualization-feedback.md` | artifact-confirmed | high-risk pass |
| Ecosystem maintainer source checks | `.tmp/slate-v2`, `plate-2`, sibling repos, official docs | `nl -ba ../pretext/src/measurement.ts`; `nl -ba ../pretext/src/layout.ts`; `nl -ba ../pretext/RESEARCH.md`; `nl -ba ../premirror/README.md`; `nl -ba ../premirror/docs/milestone-1-implementation-plan.md`; `nl -ba ../tiptap-docs/src/content/pages/core-concepts/limitations.mdx`; `nl -ba ../tiptap-docs/src/content/pages/guides/table-with-pages.mdx`; `curl -L https://tiptap.dev/docs/pages/core-concepts/limitations`; `curl -L https://tiptap.dev/docs/pages/guides/table-with-pages`; `nl -ba docs/research/sources/editor-architecture/tanstack-virtual-and-github-large-surface-virtualization.md`; `nl -ba .tmp/slate-v2/packages/slate-react/src/components/dom-coverage-boundary.tsx`; `nl -ba .tmp/slate-v2/packages/slate-react/src/dom-strategy/use-virtualized-root-plan.ts`; `nl -ba .tmp/slate-v2/packages/slate-layout/src/react.tsx`; `nl -ba .tmp/slate-v2/packages/slate-layout/src/index.ts` | source-confirmed ecosystem keep/reject decisions; official Tiptap docs match local Pages limitation source | ecosystem maintainer pass |
| Ecosystem maintainer artifact recorded | `plate-2` | `rg -n "Ecosystem maintainer pass|Ecosystem final keep/reject decisions|Tiptap-specific correction|DOMCoverage|GitHub large-surface|Current weighted score after ecosystem" docs/plans/2026-05-25-slate-v2-pretext-pagination-virtualization-feedback.md` | artifact-confirmed | ecosystem maintainer pass |
| Revision source checks | `.tmp/slate-v2` + `plate-2` | `rg -n "type PagedEditableProps|pageLayoutMode|pageGap|useSlateLayout|type EditableLayout|getVirtualizedTopLevelItems" .tmp/slate-v2/packages/slate-layout/src/react.tsx .tmp/slate-v2/packages/slate-react/src`; `rg -n "DOMStrategy|virtualized|estimatedBlockSize|threshold|overscan" .tmp/slate-v2/packages/slate-react/src .tmp/slate-v2/packages/slate-dom/src`; `rg -n "defineStateField|history: 'skip'|collab: 'shared'|persist: true|EditorStateField" .tmp/slate-v2/packages/slate .tmp/slate-v2/packages/slate-history`; `rg -n "Pretext Pagination / Page Virtualization Feedback|#5944|#2793|#790|page virtualization|page-break|pagination" docs/slate-issues/gitcrawl-v2-sync-ledger.md docs/slate-v2/ledgers/issue-coverage-matrix.md docs/slate-v2/ledgers/fork-issue-dossier.md docs/slate-v2/references/pr-description.md` | source-confirmed final API/proof revision and no new fixed/improved claim basis | revision pass |
| Revision artifact recorded | `plate-2` | `rg -n "Revision pass:|Revision API decisions|Revision proof deltas|Revision issue-sync impact|Current weighted score after revision|pageVirtualization|pageView" docs/plans/2026-05-25-slate-v2-pretext-pagination-virtualization-feedback.md` | artifact-confirmed | revision pass |
| Issue sync accounting source checks | `plate-2` | `nl -ba docs/slate-issues/gitcrawl-v2-sync-ledger.md`; `nl -ba docs/slate-v2/ledgers/issue-coverage-matrix.md`; `nl -ba docs/slate-v2/ledgers/fork-issue-dossier.md`; `nl -ba docs/slate-v2/references/pr-description.md`; `rg -n "pageView|measurementProfile|pageVirtualization|provider/split|pageBreaks|Pretext Pagination / Page Virtualization Feedback" docs/slate-issues/gitcrawl-v2-sync-ledger.md docs/slate-v2/ledgers/issue-coverage-matrix.md docs/slate-v2/ledgers/fork-issue-dossier.md docs/slate-v2/references/pr-description.md` | source-confirmed stale ledger wording, then synced final API/proof target with zero claim-count change | issue sync accounting |
| Issue sync accounting artifact recorded | `plate-2` | `rg -n "Issue sync accounting pass|Issue sync accounting decisions|Current weighted score after issue sync|planning target wording added|fixed/improved claim counts unchanged" docs/plans/2026-05-25-slate-v2-pretext-pagination-virtualization-feedback.md docs/slate-issues/gitcrawl-v2-sync-ledger.md docs/slate-v2/ledgers/issue-coverage-matrix.md docs/slate-v2/ledgers/fork-issue-dossier.md docs/slate-v2/references/pr-description.md` | artifact-confirmed | issue sync accounting |
| Closure source checks | `plate-2` | `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-slate-v2-pretext-pagination-virtualization-feedback.md`; `rg -n "slate_plan_lane_status:|next_pass:|final_handoff_status:|Closure score and final gates|Final completion gates|Final user-review handoff|Open risks" docs/plans/2026-05-25-slate-v2-pretext-pagination-virtualization-feedback.md` | final checker passed and closure state search confirmed `next_pass: none`, `next_action: none`, and final handoff complete | closure score and final gates |

Final completion gates:
| Gate | Status | Evidence |
|------|--------|----------|
| score >= 0.92 and no dimension below 0.85 | pass | Final weighted score is 0.92; lowest dimension is 0.90. |
| all scheduled pass rows complete | pass | Phase/pass table rows from current-state through closure are complete. |
| issue/reference sync closed | pass | v2 sync ledger, issue coverage matrix, fork dossier, and PR reference all name the final API/proof target; fixed/improved claim counts unchanged. |
| live source grounding complete | pass | Verification workspace gate records live `.tmp/slate-v2`, sibling repo, local Tiptap docs, official Tiptap docs, and plan/ledger artifact reads for every current-state claim. |
| behavior/browser proof scoped honestly | pass | The plan records behavior/browser proof as execution gates and makes no implementation, native-parity, issue-fix, or release-quality browser claim in planning mode. |
| TDD/browser proof | pass | N/A for planning-only closeout; required unit/browser rows are named before any accepted implementation or issue claim. |
| autoreview clean or N/A | pass | N/A: this pass changed planning, research, ledger, and PR-reference artifacts only; no `.tmp/slate-v2` implementation changed. |
| final handoff emitted | pass | Final user-review handoff is recorded below and will be summarized in the final response. |
| no runnable planning work remains | pass | `next_pass: none`, `next_action: none`, and all scheduled Slate Plan passes are complete. |
| `check-complete` passes | pass | Final checker result recorded under Verification evidence. |

Applicable implementation-skill review matrix:
| Lens | Applies | Status | Findings | Plan delta |
|------|---------|--------|----------|------------|
| vercel-react-best-practices | later | skipped planning pass | no React code edited; execution must review `useSlateLayout`/`PagedEditable` subscriptions and effects | execution proof gate |
| performance-oracle | yes | applied | wrong repeated unit and page-surface overmounting are the real hot-path risks | page/spread mount plan; no public virtualizer API |
| performance | yes | applied | benchmark must count mounted pages/surfaces and edit latency, not only range math | browser/page-count proof row |
| tdd | later | N/A planning pass | no implementation edited | unit/browser proof rows planned |
| shadcn | no | skipped | no UI implementation; API minimalism handled in pressure pass | public `pageVirtualization` cut |
| react-useeffect | later | skipped planning pass | no React code edited; execution must review effect dependencies | execution proof gate |

High-risk deliberate-mode pre-mortem:
Pass verdict:
- Adjacent proof is strong enough to keep the direction, not strong enough to
  call the plan ready.
- The riskiest gap is not Pretext. It is the missing page/spread mount-plan
  contract inside `PagedEditable`: current code still feeds block layout items
  to `Editable` and renders every page surface.
- The second riskiest gap is authoritative break authority. The state-field
  substrate exists, but the page-break snapshot API, writer election, stale
  profile invalidation, and history/collab semantics do not.
- The third riskiest gap is truth-in-advertising for missing DOM. DOMCoverage has
  model-backed clipboard/find policies and materialization hooks, but paged
  virtualized mode still needs its own browser rows before any native-parity
  claim.

| Risk | Trigger | Failure mode | Current evidence | Mitigation / target | Required proof | Closure blocker |
|------|---------|--------------|------------------|---------------------|----------------|-----------------|
| fake deterministic pagination | docs/API imply server/client equality | collab peers/export disagree by font/browser/profile | Pretext still depends on canvas/profile facts; `createSlateLayout` stays usable without browser canvas only through the generic non-engine path in `.tmp/slate-v2/packages/slate-layout/test/page-layout-contract.test.ts:289` | expose profile-aware layout; no same-breaks claim by default; strict mode reads authoritative snapshots | cross-profile snapshot compare plus stale-profile rejection tests | yes: final docs/API cannot imply deterministic cross-client page breaks |
| wrong paged virtualization unit | virtualized paged mode keeps block repeated unit | all page surfaces render, scroll math and page chrome stay O(page count) | `PagedEditable` maps projection blocks into `getVirtualizedTopLevelItems` at `.tmp/slate-v2/packages/slate-layout/src/react.tsx:185` and renders pages at `:219`; virtualizer accepts top-level runtime ids at `.tmp/slate-v2/packages/slate-react/src/dom-strategy/use-virtualized-root-plan.ts:212` | internal page/spread mount plan behind virtualized `domStrategy`; no public `pageVirtualization` | package test for page mount items; Playwright row with 500+ pages proving visible/retained pages only | yes |
| active editing page unmounted | selection or IME target is outside visible page range | lost caret, swallowed composition, or wrong insertion page | virtualized root plan retains selected/promoted top-level indexes at `.tmp/slate-v2/packages/slate-react/src/dom-strategy/use-virtualized-root-plan.ts:95`; partial-DOM composition guard exists in `.tmp/slate-v2/packages/slate-react/test/dom-strategy-and-scroll.tsx:1654` | retain visible, selected, promoted, and composing pages; no promotion during composition | browser row: start composition, scroll page away, commit text; selection and inserted text stay correct | yes |
| authoritative break state churn | many peers write derived page-break snapshots | noisy collab updates, undo pollution, stale exports | state fields support `collab`/`history` policy at `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:105`; history-skip state fields are proven at `.tmp/slate-v2/packages/slate-history/test/document-state-history-contract.ts:123`; compact shared patches are proven at `:243` | read-mostly by default; one elected writer; profile hash; dirty range; debounce; history-skip derived writes | package tests for read/write modes, stale profile, writer id, history-skip, shared patch replay | yes |
| stale authoritative breaks accepted | document/font/page settings change after snapshot | export/collab replays wrong page breaks | no current `pageBreaks` API exists; plan only sketches it | snapshot key includes doc version, root, page settings, typography profile, engine id/version, writer id | stale rejection tests and export-reader fixture | yes |
| table/media split lies | table/image/BFC-like blocks treated as text blocks | overlap footer, lose content, or corrupt semantics | box kinds and split policies exist at `.tmp/slate-v2/packages/slate-layout/src/index.ts:105`; structured-box extraction tests cover image/table/table-cell at `.tmp/slate-v2/packages/slate-layout/test/page-layout-contract.test.ts:652`; avoid-split movement is tested at `:808` | provider protocol for table/media/intrinsic boxes; no raw Slate product TableKit | package fixtures for merged cells, nested table, row span, oversized image, and BFC-like container; browser page-boundary rows | yes |
| missing-DOM native parity lie | virtualized pages are missing from DOM | browser find/a11y/copy claims overpromise | DOMCoverage defaults `findPolicy` to `not-native-until-mounted`; Playwright proves hidden content stays out of native find until materialized at `.tmp/slate-v2/playwright/integration/examples/dom-coverage-boundaries.test.ts:77`; model-backed hidden copy is proven at `:142` and select-all at `:161` | document degraded mode; keep model-backed copy; materialize on selection/programmatic access | paged virtualized rows for browser find caveat, select-all/copy, and screen-reader/manual lane | yes for native-parity claim, no for alpha degraded mode |
| canonical DX rots into proof harness | example remains the only public teaching surface | users copy debug/table/projection code as API | current example renders `PagedEditable` only inside a heavy proof surface at `.tmp/slate-v2/site/examples/ts/pagination.tsx:796` | split `pagination-basic`/canonical from stress/proof harness | docs/example review plus browser smoke on canonical route | yes for user-review-ready docs |
| release gate too weak | only package tests run | browser/runtime failures escape | root scripts define `check`, `check:full`, integration, release-proof, persistent soak, and Playwright gates at `.tmp/slate-v2/package.json:33` | execution closure names focused package tests, pagination Playwright rows, then `bun check` or `bun check:full` depending claim strength | recorded command results from `.tmp/slate-v2`, not `plate-2` | yes before implementation release claim |

High-risk proof queue:
| Queue item | Owner | Minimum proof before execution close | Current adjacent proof | Missing final proof |
|------------|-------|--------------------------------------|------------------------|---------------------|
| page/spread mount plan | `slate-react` + `slate-layout/react` | unit contract for mount item generation and Playwright 500+ page scroll/type row | top-level virtualizer and pagination browser rows exist | page-level repeated unit, mounted page count, selected/promoted/composing page retention |
| authoritative breaks | `slate-layout` + app/collab bridge | package tests for read/write authority, stale profile, history-skip, shared replay, export read | state-field history/collab substrate exists | actual `pageBreaks` API and replay semantics |
| provider split protocol | `slate-layout` + table/media packages | package fixtures for row/span/intrinsic/avoid splits plus browser table/image boundary rows | generic box kinds and avoid/page split tests exist | merged-cell, nested-table, oversized-media, BFC-like provider fixtures |
| missing DOM policy | `slate-react` + browser proof | Playwright rows for paged virtualized find/copy/select-all/IME/a11y caveat | DOMCoverage examples prove hidden find/copy/IME pieces | page-virtualized route proof and manual screen-reader lane |
| canonical DX split | docs/examples | basic example shows `useSlateLayout` + `PagedEditable`; proof harness keeps debug UI | current proof harness exercises rich cases | simple route/docs call site and smoke test |

Slate maintainer objection ledger:
Pass verdict:
- The architecture survives maintainer pressure, but only if the API stays
  brutally small and the ownership boundaries stay explicit.
- The biggest correction is page-break authority: strict snapshots are read-only
  for most peers; only a chosen writer writes derived break metadata, and those
  writes must be profile-hashed, stale-safe, and history-skipped by default.
- The second correction is table/media scope: raw `slate-layout` defines a
  provider/split protocol, not a Tiptap-style product TableKit.
- The third correction is runtime honesty: virtualized paged mode is a degraded
  DOM mode until browser find, clipboard, IME, and assistive-tech proof says
  otherwise.

| Persona | Objection | Evidence | Decision | Proof / adoption answer | Verdict |
|---------|-----------|----------|----------|--------------------------|---------|
| raw Slate maintainer | Pagination and authoritative page breaks smell like document-editor product scope | `slate-layout` lives outside core; `SlatePageLayoutSnapshot` is derived data at `.tmp/slate-v2/packages/slate-layout/src/index.ts:236`; state fields are optional extensions at `.tmp/slate-v2/packages/slate/src/core/state-field.ts:7` | keep layout outside `slate`; no core Pretext dependency; no default page-break persistence | docs must state core owns document operations, layout owns derived views, apps own document-product policy | keep |
| raw Slate maintainer | `pageBreaks` can become hidden document truth | state fields can be shared/history-controlled at `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:105`; shared/history fields without patch hooks are guarded at `.tmp/slate-v2/packages/slate/src/core/public-state.ts:397` | keep as opt-in metadata only; default local layout never writes it | strict mode reads accepted breaks; writer mode requires profile hash, range dirtying, writer identity, and history-skip derived writes | revise |
| layout maintainer | Measurement profiles can balloon into a second browser engine | Pretext availability still checks canvas at `.tmp/slate-v2/packages/slate-layout/src/index.ts:361`; Pretext engine caches prepared text at `:1349` | keep a small opaque `measurementProfile`, not a public font engine | no same-breaks-across-server claim until Pretext has a true headless measurement contract | keep |
| layout maintainer | Table/image providers could make raw layout opinionated | current box vocabulary is generic: `image`, `table`, `table-cell`, and split policies at `.tmp/slate-v2/packages/slate-layout/src/index.ts:105` | define minimal provider protocol; do not ship a raw Slate product TableKit | table/media packages provide row/span/intrinsic sizing and split policy; proof harness owns pathological fixtures | revise |
| React/runtime maintainer | Page virtualization can break selection, IME, and editing if it unmounts the active page | current virtualizer retains selected/promoted top-level indexes at `.tmp/slate-v2/packages/slate-react/src/dom-strategy/use-virtualized-root-plan.ts:95`; `PagedEditable` still maps block items and renders all page surfaces at `.tmp/slate-v2/packages/slate-layout/src/react.tsx:185` and `:219` | move paged virtualized repeated unit to pages/spreads internally | page mount plan must retain visible, selected, promoted, and composing pages; browser proof must type/compose while scrolling away | keep with proof |
| React/runtime maintainer | `useSlateLayout` depends on object identity and can relayout too often | hook refreshes on `options.typography` and `options.root` at `.tmp/slate-v2/packages/slate-layout/src/react.tsx:67`; example memoizes typography at `.tmp/slate-v2/site/examples/ts/pagination.tsx:386` | keep hook shape; docs/examples must memoize stable typography/page config | execution pass reviews effect dependencies and external-store subscription stability | keep |
| accessibility maintainer | Missing DOM cannot claim native browser find or assistive-tech parity | DOMCoverage defaults find policy to `not-native-until-mounted` at `.tmp/slate-v2/packages/slate-react/src/components/dom-coverage-boundary.tsx:36`; materialization handler exists for virtualized boundaries at `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:1600` | keep virtualized mode explicit and degraded until proof | release notes/docs must avoid native-equivalence claims; browser/a11y proof rows are release gates | keep with caveat |
| clipboard/browser maintainer | Offscreen pages may corrupt copy/select-all semantics | DOMCoverage range defaults copy policy to `include-model` at `.tmp/slate-v2/packages/slate-react/src/components/dom-coverage-boundary.tsx:36`; self-boundary defaults exclude at `:110` | keep model-backed copy policy, but prove it in paged mode | proof row: select all/copy across unmounted pages, plus explicit degraded browser-find behavior | keep with proof |
| collab/export maintainer | Multiple clients writing authoritative breaks will churn shared state and history | current example shows shared persisted page settings at `.tmp/slate-v2/site/examples/ts/pagination.tsx:41`; collab patches filter only shared fields at `.tmp/slate-v2/packages/slate/src/core/public-state.ts:540` | only an elected/authoritative writer writes page-break snapshots | readers use `mode: 'read'`; writer uses `mode: 'write'`, profile hash, source id, debounce, and history-skip metadata | revise |
| Plate adopter | The current pagination example is too much for DX | example owns DOM strategy controls, layout projection, debug frames, page UI, tables/images, and toolbar state around `.tmp/slate-v2/site/examples/ts/pagination.tsx:375` and renders `PagedEditable` at `:796` | split canonical example from proof harness | canonical example shows `useSlateLayout` + `PagedEditable`; proof harness keeps debug/table/image/browser rows | revise |
| ecosystem reviewer | Tiptap Pages ships something; rejecting its CSS trick may ignore working product evidence | local Tiptap docs say CSS floats cannot split BFC blocks and suggest max-height/manual node splitting; table guide requires a specialized pro TableKit | steal failures, reject mechanism | use BFC/table/figure/content-rect rows as tests for Slate provider protocol | reject mechanism |

Hard cuts and rejected alternatives:
| Option / API | Keep / cut / reject | Why | Migration cost | Evidence | Follow-up |
|--------------|---------------------|-----|----------------|----------|-----------|
| Paged block virtualization as primary | reject | wrong repeated unit; all page surfaces still render | medium | current `PagedEditable` block item protocol | page mount plan |
| Persist page breaks by default | reject | local/browser drift would corrupt ordinary editing metadata | high | Pretext drift evidence | opt-in authority |
| Claim Pretext headless today | cut | `prepare()` needs canvas | low | Pretext source | profile docs |
| TanStack public API | reject | leaks list virtualizer into editor API | low | existing plans | internal adapter |
| Public `pageVirtualization` prop | cut for beta | duplicates `domStrategy` and leaks page mount policy | low | pressure pass | internal page/spread mount plan |
| Tiptap CSS-float page layout | reject | makes BFC/splitting limitations part of the editor substrate | medium | local Tiptap docs | provider/split-policy protocol |
| Default shared page-break writes | reject | derived browser layout would churn collaboration and undo stacks | high | state-field collab/history policy and Pretext drift evidence | read-only default; elected writer only |
| Raw Slate product TableKit | reject | table pagination policy belongs to table/media providers and product packages | medium | maintainer objection pass and Tiptap TableKit negative evidence | minimal provider protocol |

Plan deltas from review:
- Added explicit Pretext determinism caveat.
- Added page-level virtualization as the paged-mode target.
- Added opt-in authoritative page-break snapshot extension point.
- Added Tiptap edge-case rows for paragraph splitting, tables, images, font
  variability, and padding.
- Kept Pretext as the right call; the revision is about contracts and repeated
  units, not about abandoning Pretext.
- Added related issue discovery and manual ledger sync classification for
  #5944, #790, #5924, #4141, #5131, #2051, #2793, #2572, #3892, #5945,
  #4056, and #5992.
- Added #2793 as the sharper screen-reader release guard for page/block
  virtualization.
- Hardened the intent/boundary pass into an owner-boundary contract and option
  matrix: raw Slate owns document/state; layout owns derived profiles/pages;
  React owns DOM mounting; collab/export owns authority; Plate/apps own product
  UI.
- Rejected server-only pagination authority as a default while keeping it as an
  opt-in writer for strict export/compliance flows.
- Cut public `pageVirtualization` before beta. `domStrategy` remains the public
  incomplete-DOM switch; paged mode chooses page/spread mount items internally.
- Split authoritative page-break snapshots into read/write authority roles to
  avoid every peer writing layout metadata.
- Added pushback on Tiptap Pages: its docs are negative evidence for CSS-float
  pagination, max-height hacks, manual semantic splits, and specialized table
  layout. Slate should steal the failure taxonomy, not the mechanism.
- Completed the maintainer objection ledger. The result keeps the architecture
  but narrows the public contract: strict breaks are read-mostly/elected-writer
  metadata, table/media logic is provider-owned, virtualized paged DOM stays
  explicit/degraded until browser proof, and examples split canonical DX from
  stress harness.
- Completed high-risk deliberate mode. Adjacent tests keep the direction alive,
  but the final proof queue is explicit: page/spread mount plan, authoritative
  break authority, provider split protocol, paged missing-DOM policy, canonical
  DX split, and `.tmp/slate-v2` release gates.

Open questions and decision-changing evidence:
| Question | Why it matters | Evidence needed | Owner | Status |
|----------|----------------|-----------------|-------|--------|
| Can Pretext ship a stable headless measurement layer soon enough for beta? | affects profile/API wording | local upstream source/release evidence | research pass | answered for current plan: no current headless runtime contract |
| Should `pageVirtualization` be public or internal auto behavior? | affects DX | API pressure pass and example review | DX pass | answered: internal behavior behind virtualized `domStrategy` |
| How much table layout belongs in raw `slate-layout` vs app/plugin providers? | affects unopinionated Slate boundary | maintainer objection pass | objection pass | answered: raw `slate-layout` defines provider/split-policy protocol only; table/media packages own row/span/intrinsic behavior |

Implementation phases with owners:
| Phase | Owner | Scope | Entry criteria | Exit criteria | Verification |
|-------|-------|-------|----------------|----------------|--------------|
| 1 | slate-plan execution mode | introduce page/spread mount-plan protocol with retained visible/selected/promoted/composing pages | user accepts plan | source compiles, unit tests cover protocol and mounted page count | package tests |
| 2 | slate-layout | measurement profile + optional page-break snapshot API with read/write authority roles | phase 1 green | snapshot invalidation/profile/writer/history-skip/shared-replay tests green | package tests |
| 3 | slate-react | page-level virtualizer inside `PagedEditable` behind virtualized `domStrategy` | phases 1-2 green | page scroll/type/composition/select-all/copy proof green | Playwright |
| 4 | layout/table/media | provider/split-policy hardening for table/media/BFC-like boxes | phase 3 green | merged-cell, nested-table, oversized-media, and page-boundary rows green | unit + browser |
| 5 | docs/examples | split canonical pagination DX from proof harness | behavior proof green | canonical example shows call-site first; proof harness keeps debug/stress UI | browser proof |

Fast driver gates:
| Gate | Cwd | Command / artifact | Proves | Status |
|------|-----|--------------------|--------|--------|
| planning artifact check | plate-2 | `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-slate-v2-pretext-pagination-virtualization-feedback.md` | final plan integrity | passed in closure |
| Slate v2 package proof | .tmp/slate-v2 | `bun --filter ./packages/slate-layout test`; `cd packages/slate-react && bun test:vitest`; targeted `slate-history` state-field rows when page-break metadata is implemented | source/API behavior | pending execution |
| Slate v2 browser proof | .tmp/slate-v2 | `playwright test playwright/integration/examples/pagination.test.ts --project=chromium`; paged virtualized follow-up rows; `playwright test playwright/integration/examples/dom-coverage-boundaries.test.ts --project=chromium` | paged editing/page virtualization/missing-DOM policy | pending execution |
| Slate v2 release proof | .tmp/slate-v2 | `bun check`, escalating to `bun check:full` only for release-quality browser claims | whole touched surface | pending execution |

Final user-review handoff outline:
- accepted plan items: Pretext default layout engine, page/spread virtualization
  for paged mode, block/fragment virtualization for continuous/pathological docs,
  opt-in `pageBreaks`, metadata-only `measurementProfile`, provider/split
  protocols for table/media/BFC content, and explicit missing-DOM caveats.
- before / after API shape: replace scattered page display props with
  `pageView`; keep virtualized `domStrategy` as the only public incomplete-DOM
  switch; cut public `pageVirtualization`.
- hard cuts: no cross-client/server page-break determinism claim today, no
  CSS-float pagination model, no raw Slate product TableKit, no exposed TanStack
  or Pretext cache API, and no native-equivalence claim for unmounted pages.
- issue claims and non-claims: no new `Fixes #...`; no new `Improves #...`;
  #5944, #790, #2793/#2572, #5924, rerender guardrails, and large-doc rows remain
  proof-gated.
- proof gates: page/spread mount contract, mounted-count/edit-latency proof,
  authoritative break replay/stale checks, table/media fixtures, DOMCoverage
  browser rows, canonical example split, and `.tmp/slate-v2` release commands.
- accepted-plan execution handoff: implementation starts only after explicit user
  acceptance and a new execution-shaped `slate-plan` invocation naming this plan.

Final completion gates:
| Gate | Required evidence | Status |
|------|-------------------|--------|
| score >= 0.92 and no dimension below 0.85 | scorecard rows cite evidence | pass |
| all pass rows complete or skipped with evidence | phase/pass table closed | pass |
| issue/reference sync closed | issue-ledger sync status closed | pass |
| live source grounding complete | source-backed rows cite current owners | pass |
| workspace verification recorded | verification workspace gate closed | pass |
| autoreview clean or N/A | N/A for planning-only, required if execution patches code | pass |
| final handoff emitted or lane remains pending | final handoff recorded; next pass none | pass |
| `check-complete` passes | check-complete command | pass |

Findings:
- Pretext is the right engine because it splits one-time preparation from
  hot-path arithmetic layout.
- Pretext is not fully headless today because measurement still requires
  OffscreenCanvas or DOM canvas.
- Current Slate v2 already has the right raw ingredients: page settings,
  fragments, pages, projections, Pretext engine, `PagedEditable`, state fields,
  and virtualized DOM strategy.
- Current paged virtualization shape is wrong for long-term architecture:
  `PagedEditable` feeds block geometry into `Editable` and renders every page
  surface.
- The feedback's authoritative-source idea is the correct strict-fidelity
  extension point. Make it opt-in, shared state, profile-hashed, and stale-safe.
- Related issue discovery found no basis for new fixed or improved issue claims.
- #2793 should be treated as a release guard for virtualized/missing-DOM modes;
  #2572 is too broad/docs-shaped to carry that alone.

Decisions and tradeoffs:
- Decision: paged mode virtualizes pages/spreads first.
- Decision: continuous/pathological mode may virtualize top-level blocks or
  layout fragments.
- Decision: strict collab/export reads an authoritative page-break snapshot when
  supplied and valid.
- Tradeoff: more API vocabulary, but it prevents the worse mistake: pretending
  local browser layout is document truth.

External/browser findings:
- Cyrus Radfar article, read 2026-05-25:
  https://cyrusradfar.com/thoughts/pretext-beyond-the-browser
  - Pretext improves virtual scrolling by predicting variable text heights before
    rendering.
  - Server/CI use cases are plausible because the hot path is arithmetic.
  - The catch is still `prepare()`: measurement depends on `canvas.measureText()`
    unless a matching headless/native measurement layer exists.
- Romik Makavana Tiptap article, attempted 2026-05-25:
  https://romik-mk.medium.com/tiptap-pagination-problems-solutions-31f1a0b51e08
  - curl returned a Cloudflare challenge, so this remains user-summary context.
  - Paragraph breaks fail when inline widths/font sizes/line heights/emoji/inline
    nodes vary.
  - Tables fail around row splitting, merged cells, nested structures, and footer
    overlap.
  - Padding/blank spacer hacks lose lines and corrupt page geometry.
- Local Tiptap Pages docs, read 2026-05-25 from `../tiptap-docs`:
  - Pages limitations use CSS floats around page gaps; BFC blocks such as tables,
    figures, and styled containers cannot split and can break pagination.
  - the documented mitigations are `max-height`/`--page-max-height` and manual
    node splitting, which is exactly why Slate should not copy the mechanism.
  - the table guide requires a Pages-specific TableKit with heavily modified
    behavior/layout and warns the open-source TableKit is incompatible.

Source evidence:
- `../pretext/RESEARCH.md:20` says the goal is expensive text work once in
  `prepare()` and arithmetic-only `layout()`.
- `../pretext/RESEARCH.md:55` documents `system-ui` canvas/DOM resolution
  mismatch on macOS and recommends named fonts for accuracy.
- `../pretext/RESEARCH.md:131` documents emoji canvas/DOM discrepancy.
- `../pretext/RESEARCH.md:142` says the HarfBuzz headless probe was useful but
  not runtime direction.
- `../pretext/src/measurement.ts:36` requires OffscreenCanvas or DOM canvas and
  throws without one.
- `../pretext/src/measurement.ts:61` calls `ctx.measureText(seg).width`.
- `.tmp/slate-v2/packages/slate-layout/src/index.ts:113` already has split
  policy vocabulary: `avoid`, `line`, `page`, `row`.
- `.tmp/slate-v2/packages/slate-layout/src/index.ts:236` defines the page layout
  snapshot with blocks, fragments, pages, root, settings, and version.
- `.tmp/slate-v2/packages/slate-layout/src/index.ts:1349` implements the
  Pretext page layout engine.
- `.tmp/slate-v2/packages/slate-layout/src/react.tsx:185` maps projection blocks
  into top-level virtualized items.
- `.tmp/slate-v2/packages/slate-layout/src/react.tsx:219` renders all page
  surfaces.
- `.tmp/slate-v2/packages/slate-react/src/dom-strategy/use-virtualized-root-plan.ts:212`
  consumes top-level runtime ids and block layout items.
- `.tmp/slate-v2/site/examples/ts/pagination.tsx:41` keeps page settings in a
  shared, persisted state field.
- `docs/research/sources/editor-architecture/pretext-pagination-page-virtualization.md`
  records the current Pretext / page virtualization / Tiptap Pages research
  synthesis.
- local and official Tiptap Pages docs read/fetched 2026-05-25 record CSS-float
  page gaps, oversized non-splittable BFC blocks, max-height/manual split
  mitigations, figures, and specialized table extensions as current pagination
  constraints.

Timeline:
- 2026-05-25: Slate Plan goal created for virtualization/pagination feedback.
- 2026-05-25: Current-state pass completed with local Pretext source, external
  article evidence, live `.tmp/slate-v2` source, existing plan/ledger evidence,
  and initial score.
- 2026-05-25: Related issue discovery completed from live/current ledgers. No
  new fixed/improved claims found; #2793 added as screen-reader release guard.
- 2026-05-25: Issue-ledger pass completed. Manual sync rows were appended to
  gitcrawl-v2 sync ledger, issue coverage matrix, and fork dossier; PR
  reference was inspected and left unchanged because this plan adds no
  fixed/improved claims.
- 2026-05-25: Intent/boundary and decision brief pass completed. The plan now
  has owner boundaries, non-goals, decision rules, option matrix, chosen
  architecture, consequences, and next research owner.
- 2026-05-25: Research, ecosystem strategy, and live-source refresh pass
  completed. Added a compiled research source page, refreshed current Pretext
  and Slate v2 source lines, fetched Cyrus, read local/official Tiptap Pages
  docs, and recorded the Medium current-access caveat.
- 2026-05-25: Performance/DX/migration/regression/simplicity pressure pass
  completed. Cut public `pageVirtualization`, kept `domStrategy` as the public
  incomplete-DOM switch, split authoritative page-break roles, and sharpened
  package/browser/a11y/IME/clipboard/table/media proof gates. Applied the
  Tiptap correction: use Pages as negative evidence, not as a CSS-float model to
  steal.
- 2026-05-25: Slate maintainer objection ledger completed. Kept the architecture
  but narrowed the public contract: no core Pretext dependency, no default
  shared page-break writes, no raw Slate product TableKit, no native-equivalence
  claim for missing DOM, and no proof-harness complexity in canonical DX.
- 2026-05-25: High-risk deliberate mode completed. Expanded the pre-mortem into
  release-blocking failure rows, separated adjacent proof from missing final
  proof, and named package/browser/release gates for every risky claim.
- 2026-05-25: Ecosystem maintainer pass completed. Confirmed no strategy
  reversal; hardened Tiptap Pages into negative evidence against CSS-float
  pagination, added DOMCoverage and GitHub large-surface rows to the ecosystem
  strategy table, and kept TanStack upgrades as implementation fuel only.
- 2026-05-25: Revision pass completed. Locked the public beta target around
  `pageView`, virtualized `domStrategy`, internal page/spread virtualization,
  metadata-only measurement profiles, opt-in `pageBreaks`, generic provider
  split policies, and no new fixed/improved issue claims.
- 2026-05-25: Issue sync accounting completed. Synced final API/proof wording
  into the v2 sync ledger, issue coverage matrix, fork dossier, and PR reference;
  fixed/improved claim counts remain unchanged.

Verification evidence:
- Active goal: `get_goal` returned the matching Slate Plan objective for this
  virtualization/pagination feedback lane.
- Skill gate: `.agents/skills/slate-plan/SKILL.md` was read in this closure pass;
  closure is legal because all previous scheduled pass rows were already complete.
- Planning artifact gate: this plan records current-state source reads,
  ecosystem research, issue/reference accounting, maintainer objections, high-risk
  proof gates, final API revision, issue sync accounting, scorecard, and handoff.
- Behavior/browser proof boundary: no Slate v2 tests or browser proof were run in
  this planning closure because this lane does not change implementation or claim
  behavior. The plan names the exact package/browser proof gates required before
  accepted implementation, release-quality browser claims, or issue closure.
- Final checker: `node .agents/rules/autogoal/scripts/check-complete.mjs
  docs/plans/2026-05-25-slate-v2-pretext-pagination-virtualization-feedback.md`
  returned `[autogoal] complete:
  docs/plans/2026-05-25-slate-v2-pretext-pagination-virtualization-feedback.md`.

Final user-review handoff:
- Recommended architecture: keep Pretext as the default `slate-layout` engine,
  but state the measurement contract honestly. `prepare()` still depends on
  canvas/browser/font profile behavior, so cross-client/server page-break
  determinism is not a default promise.
- Public API target: `useSlateLayout`, `PagedEditable`, `pageView`,
  virtualized `domStrategy`, and optional `pageBreaks`. Cut public
  `pageVirtualization`; do not expose TanStack, Pretext caches, or product
  TableKit mechanics.
- Runtime target: paged mode virtualizes pages/spreads first; continuous or
  pathological documents can keep block/fragment virtualization.
- Strict fidelity: `pageBreaks` is opt-in metadata with read/write authority,
  measurement/profile hashes, stale rejection, writer identity, history-skip
  derived writes, and export-reader proof.
- Tiptap lesson: steal the failure taxonomy for BFC blocks, tables, figures,
  styled containers, oversized media, padding/content rects, extension breakage,
  export, and collab. Reject CSS-float pagination, max-height correctness hacks,
  manual semantic splitting, and raw Slate product TableKit.
- Issue posture: no new `Fixes #...` and no new `Improves #...`. #5944, #790,
  #2793/#2572, #5924, rerender guardrails, and large-doc rows remain proof-gated
  exactly as recorded.
- Execution boundary: implementation begins only after explicit user acceptance
  and a new execution-shaped `slate-plan` invocation naming this plan. Execution
  must run focused package tests and pagination/DOMCoverage browser rows from
  `.tmp/slate-v2` before any release or issue-closure claim.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closure score and final gates complete |
| Where am I going? | User review; execution starts only after explicit acceptance |
| What is the goal? | Closed: the plan is ready for user review |
| What have I learned? | Feedback is correct; Pretext is still right but not headless-stable today; page mode needs internal page/spread virtualization; public `pageVirtualization` is extra API noise; authoritative page breaks need explicit writer authority; Tiptap Pages is stronger negative evidence against CSS-float pagination; DOMCoverage must remain a browser-policy layer; `measurementProfile` should be metadata, not a user-facing engine knob; issue ledgers can stay no-claim because the plan is architecture/proof-gate work, not an implementation fix |
| What have I done? | Closed the plan with current-state evidence, target direction, related issue classifications, manual issue-ledger sync, hardened owner/decision boundary, compiled research page, refreshed source/doc evidence, Tiptap pushback, pressure-pass cuts, maintainer objection decisions, high-risk proof gates, final ecosystem keep/reject decisions, final API/proof revision decisions, final issue/PR accounting sync, final score, and final handoff |

Open risks:
- None for planning closure. Implementation risks remain intentionally
  execution-gated: page/spread mount planning, authoritative break replay,
  provider/split fixtures, missing-DOM browser proof, canonical example split, and
  release command proof.
