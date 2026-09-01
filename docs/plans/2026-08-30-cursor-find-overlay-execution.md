# cursor find overlay execution

Objective:
Implement the corrected cursor/find/overlay architecture; done when API cuts,
package tests, browser proof, and stale-surface gates pass; plan
docs/plans/2026-08-30-cursor-find-overlay-execution.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-30-cursor-find-overlay-execution.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:

- package-api (docs/plans/templates/packs/package-api.md)
- docs (docs/plans/templates/packs/docs.md)
- browser (docs/plans/templates/packs/browser.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Major source:

- type: accepted local architecture plan plus the user's explicit `go`
- id / link: `docs/plans/2026-08-30-cursor-find-overlay-architecture.md`
- title: cursor/find/overlay architecture hard cut with corrected Plate plugin API
- decision to make: execute the accepted lifetime split while replacing the
  plan's raw normal Plate wiring with semantic plugin lowering and domain reads
- decision criteria: no new public overlay/projection/view layer; no normal
  caller-managed source/renderer/store plumbing; exact Plite lifetime owners;
  narrow Yjs and geometry invalidation; SSR/multi-view correctness; complete
  caller/export/docs/release adoption; focused and browser proof

Major lane:

- lane: architecture/public API migration in active code-changing execution
- output type: corrected plan, implemented public/runtime cut, registry adoption,
  current-state teaching, release artifacts, and proof
- implementation expected: yes; explicitly authorized by the user's `go`
- affected packages / surfaces: `plitejs/react`, `platejs/react`,
  `platejs/yjs/react`, the current cursor/find-replace/floating entrypoints,
  copied editor registry UI, app examples, public docs/API metadata, entrypoint
  DAG/Turbo state, tests, changesets, and affected agent doctrine
- dominant risk: preserving Plite runtime correctness while hiding its exact
  carriers from the normal Plate path without inventing another public layer

First checkpoint:

- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

## Post-closeout exact-view correction (2026-08-31)

The implementation below closed against the earlier accepted target. Two later
API reviews found that registry plugin state and a controlled boolean both
duplicated focus state already observable by the exact Editable. The durable
replacement is:

```tsx
<Editable />
<button data-plite-keep-selection-visible="" type="button">
  Edit link
</button>
```

`plitejs/react` owns exact-view expanded/collapsed paint over the live canonical
selection. `platejs/react` inherits that behavior. Copied `Editor` owns
`data-plite-keep-selection-visible`, marker placement, exclusions, and styles.
`SelectionRetentionPlugin`, `SelectionRetentionKit`, and the independent
registry item are deletion targets. No public prop or state carrier exists. The
view behavior never copies a Range or mutates model/DOM selection, input,
history, clipboard, collaboration, or private projected view selection.

The old package, registry, unit, and browser evidence remains an honest receipt
for the implementation that ran; it is not proof of this corrected target.
Product implementation and proof are tracked by
`docs/plans/2026-08-31-native-inactive-selection-focus-marker.md`. Every later
boolean-prop instruction in this historical receipt is superseded.

Follow-up vertical slices:

1. Add the Plite React marker protocol, neutral DOM hooks, exact-view renderer, and raw
   Plite tests for expanded/collapsed, backward/RTL, roots, multi-view,
   multi-editor, SSR/unmounted/virtualized, native-paint deduplication, and
   input/history/clipboard non-interference.
2. Prove `PlateContent` inherits the behavior without a second Plate API or
   plugin and add Plate React type/runtime coverage.
3. Place markers in copied `Editor`; delete the retention
   plugin/kit/item, metadata/install docs, and obsolete tests; keep product
   exclusions/styles and behavior demo coverage.
4. Regenerate barrels/registry outputs, add package and registry release
   artifacts, rerun focused package/browser proof, and audit zero stale
   retention-plugin teaching.

Timed checkpoint:

- requested duration: none
- semantics: N/A: no duration or hard stop was requested
- initial confidence score: N/A: completion is binary and proof-gated
- improvement loop: implement one vertical slice, run focused proof, repair the
  owning boundary, then continue; never paper over a failed owner with aliases
- final score / loop closure: N/A: every threshold row below must pass

Completion threshold:

- The corrected API target is reconciled into the accepted architecture plan
  with no contradictory normal-path source/store/renderer examples.
- Plite keeps Decoration, Annotation, and Widget as the only lifetime owners;
  selection geometry has one direct domain read and the private exact-Editable
  scheduler preserves null SSR snapshots and view-local geometry.
- Plate's existing plugin surface is the normal projection author: transient
  decoration data needs no persisted schema mark, plugin-store changes do not
  require consumer `refreshDecorations()`, and plugin render slots receive the
  exact local Editable/container refs.
- Registry Find installs through its app-owned kit; inactive selection is the
  exact Editable boolean proxied by `PlateContent`, with activation/styles in
  copied `Editor`. Existing `YjsPlugin` owns remote-cursor adaptation; normal
  consumers do not install a retention plugin or construct selection carriers.
- `platejs/cursor/react`, `platejs/find-replace`, and
  `platejs/floating/react` are hard-cut with zero live callers, exports, docs,
  generated API entries, tests, mocks, or compatibility aliases.
- Focused package/type/unit/SSR/browser/stress proof passes for every changed
  owner, browser-native selection/paint rows pass 5/5 warm runs, and package
  entrypoint, barrel, packed-consumer, stale-symbol, docs, changeset, doctrine,
  and P1 review gates close.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-30-cursor-find-overlay-execution.md`
  passes.

Verification surface:

- Source audit of the accepted plan, current plugin compiler, Plite
  Decoration/Widget runtime, Yjs awareness adapter, entrypoint DAG, registry
  consumers, docs, mocks, fixtures, and generated API metadata.
- Focused source-first typechecks and unit/type/SSR tests for each changed
  package owner, followed by required barrel/entrypoint/package checks.
- Browser proof on the standalone registry demo routes for Find, retained
  selection, remote collaboration cursors, floating toolbar, and floating link;
  native selection/paint rows require 5/5 retry-free warm runs.
- Stale-surface `rg` audits, changesets, best-api doctrine/source-mirror parity,
  agent-native review, P1 autoreview, and the final autogoal checker.

Constraints:

- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- This goal explicitly includes implementation.
- Keep Plite headless/React boundaries, exact Editable ownership, SSR safety,
  native selection, document/history purity, and Yjs one-resolution/cache laws.
- No compatibility aliases, dual signatures, public projection registries,
  `OverlayPlugin`, `ViewPlugin`, `ProjectionPlugin`, `YjsCursorPlugin`, public
  package `FindPlugin`, or package/registry `SelectionRetentionPlugin`/kit.
- Preserve app-owned product visuals and direct `@floating-ui/react` policy.
- Do not edit generated registry or template files by hand.

Boundaries:

- Source of truth: current checkout plus the accepted architecture plan, root
  and Plate/Plite Vision, current tests/examples, and canonical entrypoint DAG.
- Allowed edit scope: the named Plate/Plite/Yjs/runtime, registry, docs,
  generated-by-command API/barrel/entrypoint outputs, changesets, accepted plan,
  execution plan, and smallest affected `.agents/rules`/Vision owners.
- External sources: N/A unless a live implementation ambiguity survives repo
  evidence; the prior research artifact already settled external precedent.
- Browser surface: current Find, collaboration, floating toolbar, link, and
  inactive-selection behavior through copied `Editor` and its behavior demo.
- Tracker sync: N/A: no issue or PR is the source; no commit/push/PR requested.
- Non-goals: Replace, comments/suggestions redesign, generic overlay/product UI
  framework, persisted data changes, unrelated package cleanup, or publication.

Output budget strategy:

- Use exact owner files and bounded `rg` queries; exclude `templates/**`,
  generated registry JSON, `dist`, `node_modules`, `.next`, `.turbo`, coverage,
  logs, and plan history unless they are the named proof owner. Count/file-list
  before reading bodies, cap command output, and save broad manifests to an
  artifact before inspecting slices.

Blocked condition:

- Stop only after the same external/tooling/access blocker recurs three goal
  turns and no smaller owner, focused proof, or safe implementation path remains;
  otherwise repair failed checks and continue. No design decision is open.

Major state:

- task_type: major
- task_complexity: major
- current_phase: post-closeout API correction
- current_phase_status: complete
- next_phase: native marker execution tracked by the 2026-08-31 goal
- goal_status: historical execution complete; corrected implementation in progress

Current verdict:

- verdict: keep Find in its registry kit and remote cursors under `YjsPlugin`,
  but hard-cut the retention plugin/kit/item. Make marker-driven inactive paint
  native to the exact Plite Editable; `PlateContent` inherits it and copied
  `Editor` owns marker placement and styles.
- confidence: accepted after source-backed `best-api` correction; final runtime
  and browser proof lives in the current execution goal.
- next owner: `docs/plans/2026-08-31-native-inactive-selection-focus-marker.md`.
- reason: the old lifetime split is correct, but registry plugin state still
  gives a mounted-view rendering decision the wrong editor-global owner.

Completion rule:

- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-30-cursor-find-overlay-execution.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Objective, thresholds, constraints, boundaries, non-goals, proof, and handoff are materialized above. |
| Timed checkpoint parsed | no | N/A: no duration or hard stop requested. |
| `major-task` loaded | yes | Read `.agents/skills/major-task/SKILL.md` before execution planning. |
| Active goal checked or created | yes | `get_goal` returned null; `create_goal` created this one-shot execution goal. |
| Source of truth read before analysis | yes | Accepted plan, Vision, plugin compiler, Find/Yjs/Floating callers, and Plite projection owners were read during the accepted API review. |
| Major lane selected | yes | Code-changing architecture/public API migration. |
| Decision criteria stated | yes | Recorded under Major source and Completion threshold. |
| Existing repo patterns / prior decisions checked | yes | Accepted architecture plan and current compiler/source callers are the primary evidence. |
| Helper stack selected | yes | `autogoal`, `plate-plan`, `major-task`, and `best-api`; slice workers load only when active. |
| External research decision recorded | no | N/A: prior compiled research settled precedent; current execution starts repo-first. |
| Implementation expectation recorded | yes | User explicitly said `go`; implementation is in scope. |
| Workspace authority selected | yes | `/Users/zbeyens/git/plate-2`; current checkout is authoritative. |
| Branch / PR expectation decided | no | N/A: no commit, push, or PR requested; use current checkout as-is. |
| Output budget strategy recorded | yes | Exact-owner reads, exclusions, count-first search, and output caps are stated above. |
| Package/API pack selected | yes | `package-api` is materialized. |
| Public surface or package boundary identified | yes | Plite/Plate React facade, Yjs React entry, and three removed Plate entrypoints. |
| Release artifact path selected | yes | Major changesets for `plitejs` and `platejs`; registry changelog only for copied UI behavior. |
| `changeset` skill loaded when `.changeset` is required | yes | Required and scheduled before the first release artifact edit. |
| Barrel/export impact decision recorded | yes | Public exports/files change; `pnpm brl` is mandatory before final verification. |
| Docs pack selected | yes | `docs` is materialized. |
| `docs-creator` loaded | yes | Required and scheduled before current-state docs editing. |
| Docs lane selected | yes | Current-state API/lifetime docs plus generated API metadata; no migration prose outside release artifacts. |
| Target docs and nearest sibling docs read | yes | Exact targets are discovered after the stale-import inventory; current plan and Vision are already read. |
| Docs style doctrine read | yes | Root docs rules and `docs-creator` are required before docs edits. |
| Documented source owner identified | yes | Plite/Plate public types, package entrypoint DAG, and registry source are canonical. |
| Browser pack selected | yes | `browser` is materialized. |
| Browser route / app surface identified | yes | Standalone Find/collaboration/floating/link/retention demos under `apps/www`. |
| Browser tool decision recorded | yes | Use in-app Browser; no native Chrome-only workflow is expected. |
| Console/network caveat policy recorded | yes | Record both on final fresh-route proof; unrelated dev noise is classified, not ignored. |
| Observable browser case captured | no | N/A: architecture migration, not report-backed issue; exact route/action/outcome rows are added before each browser replay. |
| Agent-native pack selected | yes | `agent-native` is materialized because best-api/worker doctrine must be repaired. |
| Agent-facing action surface identified | yes | `.agents/rules/best-api.mdc` and only affected worker rules; generated mirrors follow `pnpm install`. |
| Source rule versus generated mirror boundary identified | yes | `.agents/rules/**` is source; `.agents/skills/**` is generated and never hand-edited. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Required before closeout; load when doctrine diff is ready. |

Work Checklist:

- [x] N/A: no duration requested; no timed score loop applies.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Major source records source type, id/link, title, decision type, expected
      outcome, decision criteria, likely files/packages/surfaces, browser
      surface, and highest-leverage owner.
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested.
- [x] Current state is mapped before proposing a new architecture, migration,
      benchmark, or plan.
- [x] Existing repo patterns, prior decisions, and nearby implementation
      constraints are recorded before external research.
- [x] External docs or source are used only where repo evidence does not settle
      the question, or N/A reason is recorded. N/A: the accepted plan already
      compiled external research; execution uses current repo owners.
- [x] Options, recommendation, tradeoffs, blast radius, and rejection reasons
      are recorded.
- [x] Facts, inference, and recommendation are separated in the accepted plan
      and corrected API review; execution evidence remains distinct below.
- [x] Review or pressure lenses are selected and completed, or marked N/A with
      reason. `best-api` completed the hard-cut and public-shape pressure pass;
      implementation gets a final P1 review.
- [x] If implementation happens, touched-surface packs cover docs, browser,
      package/API, or agent-native surfaces as needed.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context. Two misses are recorded below with bounded recovery.
- [x] Accepted review findings are closed. Strict Chromium exposed the collapsed
      Yjs decoration text leak and the stale scroll oracle; both were repaired
      and the complete strict gate passed. Agent-native review found one stale
      `CursorOverlayPlugin` precedent; it now points to `YjsPlugin`.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: the major `platejs`/`plitejs` delta is recorded in
      `.changeset/transient-editor-geometry.md`; copied registry behavior is
      recorded in the 2026-08-31 transient-editor-geometry changelog.
- [x] Package/API pack: `changeset` was loaded before authoring; both package
      rows are `major`, with no forbidden `minor` release.
- [x] Package/API pack: `registry-changelog` owns the copied Find, retention,
      floating, link, and remote-cursor release entry.
- [x] Package/API pack: N/A for a no-artifact decision because both published
      packages and copied registry users have visible deltas.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: `pnpm check:plite` passed all package, tooling,
      release-artifact, and Chromium proof; focused Plate/Plite/app type, unit,
      lint, and browser checks are recorded below.
- [x] Package/API pack: `pnpm brl`, entrypoint generation, API docs, registry
      generation, and entrypoint-size artifacts were generated and checked.
- [x] Docs pack: current-state Plite lifetime, geometry, Yjs, Find, selection
      retention, and removed-entrypoint docs are tied to the live source owners.
- [x] Docs pack: every named API/import/route was audited against source and
      generated API/entrypoint metadata; retired paths have zero live matches.
- [x] Docs pack: public reference pages use current-state voice; change-focused
      prose appears only in the changeset and registry changelog.
- [x] Docs pack: `pnpm --filter www build:source` passed, proving MDX parsing
      and current leaf routes.
- [x] Docs pack: Unslop file audits returned zero findings on the newly written
      Find, retention, lifetime, Yjs, and changelog prose. Signals on older
      neighboring headings were outside this edit and left intact.
- [x] Docs pack: package law, copied-source policy, runtime behavior, and repo
      generation details remain separated.
- [x] Browser pack: exact standalone routes and expected state were recorded for
      Find, retention, collaboration, floating toolbar, and link.
- [x] Browser pack: in-app Browser supplied final manual proof. Chrome was tried
      only while Next dev rejected `127.0.0.1` chunk requests under its
      allowed-origin policy; `localhost` removed that proof-origin mismatch
      without a product change.
- [x] Browser pack: every final `localhost` route reported zero product
      warnings/errors. Server logs classify the earlier six 403 responses as
      Next dev cross-origin blocks for `127.0.0.1`; curl returned 200 without
      the browser origin headers.
- [x] Browser pack: N/A for a screenshot because no pixel-equivalence claim is
      made; DOM, native selection, rendered-range, and exact browser-test proof
      inspect the required outcomes directly.
- [x] Browser pack: N/A for reporter pixel controls and red-before-green exact
      replay because this is an architecture migration, not a reported visual
      defect.
- [x] Browser pack: a fresh dev process and fresh route navigations proved Find
      1/1, one retained-selection paint span, one remote selection with clean
      peer text, and two toolbars after native selection.
- [x] Browser pack: N/A for a clean pushed-ref runtime. The implementation is an
      uncommitted local checkout on HEAD `377a77a537971b793a4ddbb34cc13797fdfeee15`;
      no commit, push, or release was requested.
- [x] Browser pack: the exact native-selection/browser suite passed 5/5 for all
      five routes, retry-free; strict Plite Chromium passed 710 tests with eight
      intentional skips.
- [x] Browser pack: proof uses shipped source and generated-by-command outputs,
      with no temporary aliases, route bypasses, or hand-edited generated files.
- [x] Agent-native pack: only `.agents/rules/**` source and Vision owners were
      edited; generated `.agents/skills/**` files came from `pnpm install`.
- [x] Agent-native pack: `best-api`, `plate-plugin-creator`, `plate-ui`, and
      Plate Next v127 expose the new route and hard-cut law.
- [x] Agent-native pack: exact skill/resource parity, Plate Next validation,
      and all 14 version-script tests pass.
- [x] Agent-native pack: the sole finding, a retired `CursorOverlayPlugin`
      example, was replaced with the live `YjsPlugin` owner in source and mirror.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the named package/browser/stale/doctrine gates | `pnpm check:plite`, focused www browser 5/5, stale scans, and doctrine validation pass. |
| Current-state source audit | yes | Map owners and boundaries | Plite lifetimes, Plate lowering, Yjs, registry kits, exports, docs, and generated metadata audited. |
| Decision criteria closure | yes | Close every target law | Existing plugin compiler improved; one Plite geometry read added; no new public view layer. |
| Options / tradeoffs / rejection record | yes | Record the hard-cut choice | Public overlay/view/plugin layers rejected in Decisions and tradeoffs. |
| Review / pressure pass | yes | Run API and agent pressure | `best-api` and agent-native review complete. P1 `autoreview` is N/A because the current branch is `next`, where repo policy forbids it. |
| Review findings closure | yes | Fix accepted findings | FEFF leak, scroll oracle, entrypoint test coupling, and stale agent precedent closed. |
| External-source audit | no | N/A | Accepted research already compiled external evidence; execution required no new external claim. |
| Implementation gates | yes | Close all touched packs | Package/API, docs, browser, release, and agent-native rows are complete. |
| Final handoff contract | yes | Record outcome and limits | Filled below. |
| Final lint | yes | Run scoped equivalent | Three scoped Ultracite code passes are green across 57 files; MDX parser and Unslop cover docs. |
| Output budget discipline | yes | Record misses and recovery | Two oversized outputs and shell-pattern misses are logged; all later probes were bounded and filtered. |
| Timed checkpoint | no | N/A | No duration requested. |
| Goal plan complete | yes | Run final checker | Final checker runs after this ledger update. |
| Public API / package boundary proof | yes | Audit exports and consumers | Entrypoint DAG/Turbo, package builds/types, API manifest, packed consumer, and stale-path scans pass. |
| Release artifact classification | yes | Classify package and registry deltas | Major Plate/Plite package delta plus copied registry behavior. |
| Published package changeset | yes | Add package release artifact | `.changeset/transient-editor-geometry.md` records major `platejs` and `plitejs` changes. |
| Registry changelog | yes | Add copied-source artifact | 2026-08-31 transient-editor-geometry manifest and MDX entry validate through registry generation. |
| No release artifact | no | N/A | User-visible package and registry changes require artifacts. |
| Package typecheck/build/test | yes | Run owning checks | Strict Plite gate, Plate/Plite focused tests, www typecheck, and packed builds pass. |
| Barrel/export generation | yes | Run generators | `pnpm brl`, entrypoint generation, API docs, and size artifacts pass. |
| Docs source-backed claim audit | yes | Audit against owners | New APIs and hard cuts match source, entrypoints, registry names, and generated API metadata. |
| Required Unslop pass | yes | Audit stabilized prose | Zero findings on newly authored pages and changelog; literals/claims unchanged. |
| Requirements disclosure | yes | Separate law by owner | Package, registry, runtime, and repo generation responsibilities remain explicit. |
| Docs links / routes / previews | yes | Verify leaves | MDX source build and standalone demo routes pass. |
| Docs MDX/content parser | yes | Run parser | `pnpm --filter www build:source` exits zero. |
| Plugin page specifics | yes | Apply current-state kit/manual rules | Find, retention, and Yjs pages teach copied kit or existing plugin ownership without retired imports. |
| Browser interaction proof | yes | Exercise all five routes | Fresh in-app Browser replay on `localhost` passes. |
| Browser console/network check | yes | Inspect final route errors | Zero warnings/errors on final routes; earlier 403s are classified as Next dev allowed-origin blocks for `127.0.0.1`. |
| Browser final proof artifact | yes | Record actions and outcomes | Browser DOM/selection evidence plus exact automated Chromium test receipt recorded below. |
| Exact case replay | no | N/A | Architecture migration, not report-backed behavior. |
| Final ref and fingerprints | no | N/A | Local uncommitted checkout at HEAD `377a77a537971b793a4ddbb34cc13797fdfeee15`; no pushed ref or issue-owned fingerprint claim. |
| Clean final runtime | no | N/A | No commit/push/release requested; final language is local implementation, not shipped/fixed status. |
| Retry-free stability | yes | Run warm native browser rows | Five target routes pass 5/5 retry-free; strict Chromium passes 710 with eight intentional skips. |
| Agent source / generated sync | yes | Regenerate and compare | `pnpm install`, byte-equal resource mirror, version validation, and 14 tests pass. |
| Agent action discoverability | yes | Audit routes | `best-api`, `plate-plugin-creator`, `plate-ui`, and Plate Next v127 teach the final law. |
| Agent-native review | yes | Build capability map and close gaps | Pass after replacing the retired direct-plugin example with `YjsPlugin`. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | accepted plan, live source review, and this execution contract | contract correction |
| Contract correction | complete | accepted plan reconciled to plugin/kit normal path; stale raw-composition audit leaves only explicit advanced/historical references | Plite substrate |
| Plite substrate | complete | Widget target/availability hard cut, canonical store editor, stable ids hook, exact-ref generic and selection geometry, shared viewport coordinator, SSR null snapshot; focused React test/type/lint green | Plate plugin lowering |
| Plate plugin lowering | complete | one hook-owned Plite source per installed decorator; owning-store invalidation; schema-free leaf lowering; exact sibling refs; static slot exclusion; focused test/type/lint green | Yjs adaptation |
| Yjs adaptation | complete | one shared relative-selection cache; stable ids/item/geometry reads; collapsed cursors stay out of leaf decorations; expanded paint and caret geometry pass | registry migration |
| Registry and entrypoint hard cut | complete | Find/retention kits, direct Floating UI, Yjs slots; three package subpaths and all live callers removed | docs/release/doctrine |
| Docs, release, and doctrine | complete | current-state docs, major changeset, registry changelog, Vision, Plate Next v127, and generated mirrors validate | verification |
| Verification | complete | strict package gate, 5/5 focused browser rows, fresh Browser replay, lint, docs, stale scans, and agent-native proof pass | closeout |
| Closeout | complete | final ledger has no unresolved finding; `autoreview` explicitly N/A on `next` | final response |

Findings:

- The accepted plan correctly splits Decoration, Annotation, and Widget but
  incorrectly labels raw source/renderer/store assembly as the normal Plate API.
- Plate already owns semantic `decorate`, `render.leaf`, and Editable sibling
  slots; the current Find demo's manual `refreshDecorations()` exposes the
  missing compiler invalidation contract.
- The current Yjs overlay duplicates geometry/listener work; the existing Yjs
  owner must feed one private cache into domain reads and normal registry UI.
- The architecture plan's normative call sites, proof rows, phase rows, and
  handoff now agree: Plate lowers plugin contributions privately; raw carrier
  props survive only as advanced escape paths.

Decisions and tradeoffs:

- Improve the existing Plate plugin compiler; reject a public
  overlay/projection/view layer -> fewer public concepts and one normal path ->
  internal compiler complexity must preserve narrow source invalidation.
- Add one Plite selection-geometry domain read -> current toolbar/link jobs stop
  constructing singleton Widget carriers -> raw Widget APIs remain advanced.
- Keep Find registry-local; promote inactive-selection mechanics to the exact
  Editable while copied `Editor` owns policy; keep Yjs under existing
  `YjsPlugin` -> no fake retention plugin/kit authority.

Implementation notes:

- Plite Widget descriptors use `target`; resolved widgets expose logical
  `available`, including collapsed selections. Every store exposes its
  canonical `editor`.
- `usePliteWidgetIds` subscribes to the frozen ordered-id snapshot without
  rerendering for data-only updates.
- `usePliteWidgetGeometry` validates one exact connected Editable, returns
  immutable viewport rectangles, and shares scroll/resize/visual-viewport/root
  observation per editor and document. `useSelectionGeometry` hides the
  singleton selection Widget from normal callers.
- Plate recursively assembles one hook-owned Decoration source per installed
  decorator before mounting the Plite provider. Plugin store updates refresh
  only their owning source, while projected node buckets wake only when their
  data changes. Transient `render.leaf` activation uses private source metadata
  and requires no persisted mark.
- Editable and container sibling slots receive their exact local refs.
  `PlateStatic` omits both dynamic Editable sibling slots.

Review fixes:

- Strict Chromium found `U+FEFF` in peer text because collapsed Yjs cursors were
  lowered into leaf decorations. `YjsPlugin` now decorates expanded remote
  selections only; caret geometry stays in the overlay. Focused Yjs tests and
  the complete Chromium run pass with clean peer text.
- The full browser run exposed a stale scroll assertion that expected a fixed
  overlay's caret-local viewport rectangle not to move. The oracle now proves
  the caret moves by the actual scroll delta while the fixed overlay remains
  fixed; focused and full runs pass.
- A Yjs test initially imported the public static pipe and polluted the
  entrypoint DAG. It now invokes the compiled plugin decoration contract through
  the internal test owner; focused tests and all 17 entrypoint-Turbo rows pass.
- Agent-native review found one deleted direct-plugin example in the plugin
  authoring audit. Source and generated resource now point to `YjsPlugin`, and
  Plate Next v127 records the migration law.

Agent-native capability map:
| User action | Agent route | Source owner | Mirror / doctrine | Proof | Status |
|-------------|-------------|--------------|-------------------|-------|--------|
| Choose a transient editor lifetime | `best-api` | `.agents/rules/best-api.mdc` | generated Best API skill, Plate Next v127 | version validation and stale-name audit | pass |
| Author transient Plate paint | `plate-plugin-creator` | `.agents/rules/plate-plugin-creator.mdc` | generated skill and live Yjs precedent | exact mirror/resource parity | pass |
| Position copied Plate UI | `plate-ui` | `.agents/rules/plate-ui.mdc` | generated Plate UI skill | Browser geometry routes and scoped lint | pass |
| Audit adoption after hard cuts | `plate-next` | `.agents/rules/plate-next.mdc` | `versions.json` v127 | 14 version tests and registry validation | pass |

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Shell interpreted backticks inside a double-quoted `rg` command | 1 | Use single-quoted patterns or argument arrays with no shell interpolation | Corrected; no repository mutation occurred |
| One combined plan read exceeded the useful output window | 1 | Read and patch one bounded normative range at a time | Corrected; continuing with narrow ranges |
| Combined two shell reads with `&&` despite the output-discipline rule | 1 | Run independent reads through separate tool calls | Corrected; no repository mutation occurred |
| One multi-hunk architecture-plan patch missed exact context | 1 | Split the edit into bounded hunks after an exact numbered read | Corrected; all intended replacements applied |
| One execution-state patch omitted the list prefixes in its expected context | 1 | Read the exact bounded block, then patch the literal lines | Corrected; phase state now matches the phase table |
| A Node diagnostic could not resolve the test runner's transitive `happy-dom` package | 1 | Prove DOM Range behavior inside the existing Vitest environment instead | Corrected with deterministic public-hook geometry tests |
| One scheduler source read used `;` to combine bounded ranges | 1 | Keep each source range in its own tool call | Corrected; later reads use independent calls |
| Two later bounded source reads were again combined in one shell command | 2 | Use one command per file or parallel independent tool calls | Corrected; implementation reads returned to independent calls |
| One oversized multi-file patch targeted `Plate.tsx` twice | 1 | Split new-file and per-owner edits into separate patches | Corrected; no partial patch applied |
| Guessed a nonexistent `typecheck:package-tests` package script | 1 | Read the package scripts, then invoke the entrypoint runner's exact test-typecheck mode | Corrected; strict package/type/release checks pass |
| Combined Bun registry specs shared global module mocks | 1 | Run each registry owner in an isolated Bun process | Corrected; Find 3/3, retention 3/3, floating 4/4, widget-floating 1/1, collaboration 4/4 |
| Collapsed Yjs decoration leaked `U+FEFF` into peer text | 1 | Separate expanded selection paint from caret geometry | Corrected; focused Yjs and full Chromium proof pass |
| Public static helper import polluted the entrypoint DAG in one test | 1 | Exercise the compiled internal plugin contract directly | Corrected; 8/8 focused tests and 17/17 entrypoint-Turbo rows pass |
| Full Chromium exposed a stale fixed-overlay scroll oracle | 1 | Assert viewport movement from the measured scroll delta | Corrected; focused row and full strict run pass |
| Browser on `127.0.0.1` received six Next dev cross-origin 403 chunk responses | 1 | Read server diagnostics and replay through the canonical `localhost` origin | Corrected for proof; all five in-app Browser routes hydrate with zero product errors |
| One CDP event probe emitted an oversized response list | 1 | Filter events in the browser session before emitting | Corrected; the next probe emitted only the six failed assets |
| Scoped Ultracite accepted MD formatting but ignored MDX lint inputs | 1 | Use the MDX source parser plus Unslop audits for docs | Corrected; `build:source` passes and new prose has zero findings |

Verification evidence:

- Contract correction: bounded stale-phrase audit found no remaining normative
  app-root Find/Yjs source or renderer composition and zero live
  `useYjsRemoteCursorWidgetStore` references.
- Plite red/green: canonical `store.editor` failed then passed; ordered ids
  failed initial publication then passed membership/data locality; selection
  geometry failed as `null`, then passed expanded, collapsed, viewport-scroll,
  foreign-editor rejection, and SSR-null cases; node Widget geometry passed.
- Plite focused proof: `widget-layer-contract.test.tsx` 19/19;
  `widget-layer-contract` plus `view-source-fault-boundary` 21/21 before the
  final node row; `typecheck:entrypoint:react` and `lint:entrypoint:react` pass.
- Plate red/green: plugin-store repaint and owning-source isolation failed on
  the legacy callback path, then passed through private per-plugin source
  lowering. Exact sibling-ref and static-slot-exclusion rows failed, then
  passed after truthful ref props and dynamic-only static behavior.
- Plate focused proof: `PlateContent.spec.tsx` plus `PlateStatic.spec.tsx`
  32/32; React and static entrypoint typechecks pass; React entrypoint lint
  passes.
- Yjs focused proof: `BaseYjsPlugin.api.spec.ts` passes 8/8, including collapsed
  no-decoration and expanded selection decoration; Yjs package/runtime/type
  contracts pass inside the strict gate.
- Registry units pass in isolated processes: Find 3/3, selection retention 3/3,
  floating toolbar 4/4, widget-floating 1/1, and collaboration 4/4. The combined
  process was rejected because Bun module mocks are global across these files.
- `pnpm --filter www typecheck` passes. Three scoped Ultracite runs pass on 57
  task code/test files. The task-owned public docs format cleanly; MDX parsing is
  proved by `pnpm --filter www build:source`.
- Registry/API generation passes: `pnpm --filter www build:registry`,
  `pnpm --filter www rd`, API-doc generation, entrypoint generation,
  entrypoint-size generation, and `pnpm brl`. Registry output reports 367
  canonical items and 15 overlays.
- Entrypoint proof passes: the focused Turbo contract is 17/17; retired
  `platejs/cursor/react`, `platejs/find-replace`, and
  `platejs/floating/react` paths are absent from package exports, live docs,
  API metadata, callers, fixtures, mocks, and agent rules.
- The retained `useYjsRemoteCursorDecorationSource` is deliberate lower-level
  Yjs API: it exists only in its owner, type tests, and advanced Yjs docs, with
  zero registry callers. `useYjsRemoteCursorOverlayPositions` is gone.
- `pnpm check:plite` passes: 86 typechecks, 134 package-test tasks, 221 tooling
  contracts, 25 benchmark contracts, public package builds/types, and Chromium
  710 passed with eight intentional skips across 79 retry-free batches.
- Focused browser proof passes 5/5 for retention, Find, Yjs collaboration,
  floating toolbar, and link Enter behavior.
- Fresh in-app Browser proof on `http://localhost:3000`: Find reports 1 of 1
  with one active match; selection retention renders one retained paint span;
  Yjs renders one remote selection and two caret hosts while Lin's text contains
  no sentinel; floating toolbar exposes a second toolbar after native selection;
  link exposes its selection toolbar. Final route logs contain zero product
  warnings or errors.
- Agent doctrine passes: `pnpm install`, byte-equal resource mirror, Plate Next
  v127 registry validation, and all 14 version tests. Retired API/rule names have
  zero live matches outside historical migration/release/plan records.

Final handoff contract:

- Recommendation: keep the implemented split. Improve Plate's existing plugin
  compiler and one Plite geometry domain read; add no public view/overlay layer.
- Confidence: high for the local checkout; strict package and browser gates pass.
- Evidence: source ownership, hard-cut scans, public/package generators,
  release artifacts, doctrine parity, and fresh runtime proof are recorded above.
- Tests / commands: `pnpm check:plite`; focused Plate/Plite/Yjs/registry units;
  www typecheck; 5/5 browser suite; scoped lint; registry/API/barrel/docs builds;
  stale scans; Plate Next validation/tests; final goal checker.
- Browser proof: fresh in-app Browser session on all five standalone demo routes,
  plus exact automated Chromium behavior and retry-free strict batches.
- PR / tracker: N/A; no issue, commit, push, PR, or release was requested.
- Caveats: the recorded result is an uncommitted local checkout on `next` and
  proves the historical registry-kit target only. Current marker-driven proof
  belongs to the 2026-08-31 execution goal. P1 `autoreview` was N/A because
  repo policy forbids running it on `next`.
- Next owner: the native marker execution goal, including `plate-ui` registry
  adoption/deletion proof.

Timeline:

- 2026-08-30T20:02:56.045Z Major-task goal plan created.
- 2026-08-30 Goal created after the user's explicit `go`; requirements and
  corrected API target materialized before runtime edits.
- 2026-08-31 Post-closeout API correction recorded. Historical proof remains a
  receipt; marker-driven exact-view implementation is tracked separately.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Historical execution is closed; marker-driven exact-view implementation is active in the 2026-08-31 goal. |
| Where am I going? | Finish Plite lifecycle behavior, registry deletion/adoption, doctrine, release artifacts, and browser proof. |
| What is the goal? | Preserve the completed historical receipt while making the corrected target and remaining implementation unmistakable. |
| What have I learned? | The lifetime split survives, but inactive-selection mechanics belong to the exact Editable rather than registry plugin state. |
| What have I done? | Recorded the corrected API, deletion cone, follow-up slices, proof matrix, and honest boundary around prior evidence. |

Open risks:

- This historical plan does not prove the marker-driven inactive-selection
  target; the current execution goal owns that proof.
- Publication risk remains intentionally open: the checkout is uncommitted and
  has no pushed-ref or clean-release proof because the user did not request it.
- The advanced `useYjsRemoteCursorDecorationSource` stays public for deliberate
  lower-level consumers; registry and ordinary Plate docs do not teach it as the
  normal integration path.
