# Implement node identity architecture

Objective:
Close the accepted node identity implementation without changing its public
design; done when the four remaining owner defects, targeted checks, strict
Plite, P2 review, release/docs gates, and the goal checker pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-07-implement-node-identity-architecture.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)

Major source:
- type: accepted local architecture audit and explicit user execution request
- id / link:
  `docs/plans/artifacts/node-identity-architecture-audit/final-recommendation.md`
- title: Final node identity recommendation
- decision to make: N/A; the user accepted the architecture and explicitly
  authorized full execution
- decision criteria: implement every ordered packet, hard cut every rejected
  surface, migrate every named consumer class, and close every named proof gate

Major lane:
- lane: accepted architecture and public API migration
- output type: source, tests, migration helper/codemod, docs, changesets, barrels,
  and browser proof
- implementation expected: yes, full one-shot execution
- affected packages / surfaces: Plite runtime/schema/compiler/public types;
  Core plugin/runtime/React; selection, DnD, toggle, AI, media, table, Markdown,
  TOC; registry kits/demos; docs; release artifacts
- dominant risk: accidentally making persisted IDs generic runtime targets,
  leaking schema grammar into routine capabilities, or retaining a compatibility
  path that preserves the old confused identity law

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Execution contract:

- [x] Brand editor-scoped, non-serialized `RuntimeId` and keep IDs on every
      descendant, including text.
- [x] Hard-cut `runtime.idAt/pathOf` to `runtime.id/path`; arbitrary strings are
      rejected and `RuntimeId` is accepted by every generic `NodeTarget`
      resolver/read/update family.
- [x] Preserve root isolation, move continuity, removal invalidation, immutable
      copy continuity, and absence from serialized values, slices, history, and
      Yjs payloads.
- [x] Add schema property `copy: 'drop' | 'preserve'`, narrow generated string
      values, optional construction input, required canonical output, stable
      fingerprint semantics, and closed application property-key overrides.
- [x] Keep schema typing shallow enough that the large EditorKit fixture does
      not hit TS2589.
- [x] Replace `NodeIdPlugin` with explicit Core-exported `ElementIdPlugin` and
      remove it from `getCorePlugins()`.
- [x] Give `ElementIdPlugin` exactly one state option, `generateId`, defaulting
      to full-length `nanoid()`; cover every element including inline and never
      text.
- [x] Implement the fixed persisted-ID lifecycle: generate before local
      publication; preserve valid load/move/allowed type change/remote insert;
      regenerate split copy/duplicate/paste; merge keeps the survivor; reject
      explicit duplicates precisely.
- [x] Build one incremental document-wide persisted-ID to `RuntimeId` index
      across primary and named roots and keep it correct through insert, remove,
      move, rejected ID changes, undo, redo, and schema reconfiguration.
- [x] Expose only `ElementIdPlugin.read.id(element)` and `.read.entry(id)` plus
      generic node updates; never accept persisted strings as `NodeTarget`.
- [x] Export pure editor-free `migrateElementIds`, preserving valid strings,
      filling missing IDs, reporting duplicates, accepting the same generator,
      and requiring explicit numeric-ID conversion policy.
- [x] Delete without aliases: `NodeIdPlugin`, `nodeId`, its state/definition/
      update types, `IdElement`, `normalizeNodeId`, all seven old policy knobs,
      hidden `_id`, number IDs, Core default installation, `idAt`, `pathOf`, and
      session-feature `element.id` access.
- [x] Migrate session-only selection, DnD, toggle, AI, media, table, and
      React/DOM consumers to `RuntimeId`; cross-editor DnD carries its source
      editor with the runtime ID.
- [x] Keep `data-plite-runtime-id`; remove unconditional Core `data-block-id`.
- [x] Make Markdown, TOC, database/block registry kits, and external-reference
      owners explicitly install/use `ElementIdPlugin` through semantic compiled
      property APIs, including physical-key override coverage.
- [x] Add current-state docs for runtime versus persisted identity and the
      authoritative one-time migration; no changelog voice.
- [x] Add a codemod for the public plugin/type/runtime API hard cuts where the
      repository's migration tooling supports it. N/A: the pure
      `migrateElementIds` boundary is the authoritative migration because raw
      persisted values cannot be migrated safely by a source codemod.
- [x] Add one changeset per changed published package relative to `main`, run
      barrels/API owners, focused package proofs, lint, P2 autoreview, and
      relevant browser demos. Changeset status has no forbidden minor release;
      barrels, package, browser, lint, and review proof is below.
- [x] Keep physical-device testing deferred because no device-specific behavior
      is claimed; do not edit `templates/**`, publish, commit, push, or open a PR.
- [x] Final handoff reports root cause/owners, final invariant/API, exact proof,
      hard cuts, migration, remaining risk, and goal-tool usage.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A; completion is gate-based
- initial confidence score: N/A; binary packet and proof gates are stronger
- improvement loop: implement one vertical slice, prove it, update the ledger,
  then move to the next owner
- final score / loop closure: N/A; close only when every required row passes

Completion threshold:
- Every execution-contract row is complete; no rejected public symbol or raw
  session `element.id` use remains; Plite/Core and all changed consumer package
  checks pass; focused runtime/schema/collaboration/browser proofs pass; docs,
  changesets, migration tooling, barrels, lint, P2 autoreview, and the goal
  checker pass.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-07-implement-node-identity-architecture.md`
  passes.

Verification surface:
- Compile-only Plite/Core type tests; Plite runtime/schema/history/Yjs tests;
  Core ElementId lifecycle/index tests; focused consumer package tests;
  `pnpm check:plite:dev` during iteration and `pnpm check:plite` at handoff;
  source-first typechecks for every modified package; stale-symbol and raw-ID
  source audits; `pnpm brl`; docs source/parser checks; registry demo Browser
  interactions with console/network inspection; `pnpm lint:fix`; P2
  `autoreview`; changeset validation; autogoal checker.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Execute the accepted architecture without reopening unrelated API decisions.
- No compatibility aliases, dual signatures, runtime shims, hidden fallback
  identity, or docs for the old shape.
- Preserve paths and anchors as distinct structural/text concepts.
- Keep RuntimeId private to one editor runtime and persisted element IDs explicit.
- Generated schema behavior stays narrow; no general callback pipeline.
- Keep ordinary capability inference shallow and exact; no `any`, casts, or
  explicit callback annotations as type repairs.
- Follow owner-first plugin colocation and constructor-first inference.

Boundaries:
- Source of truth: current checkout plus the accepted recommendation and its
  source inventory/matrices.
- Allowed edit scope: owning Plite/Core/feature packages, tests/type tests,
  registry source, content docs, migration tooling, changesets, generated
  barrels/API artifacts, vision only if implementation changes durable doctrine,
  and this plan.
- External sources: N/A; the accepted audit already closed Lexical,
  ProseMirror, and Wordgard comparison from clean local clones.
- Browser surface: standalone registry demos for selection, DnD, toggle, media,
  table, and AI where available.
- Tracker sync: N/A; no issue/PR source and no public mutation authorized.
- Non-goals: replacing paths/anchors, serializing RuntimeId, persisted text IDs,
  a new element-ID package, general schema callback stages, physical-device
  claims, template edits, publishing, git staging/commit/push/PR.

Output budget strategy:
- Read exact owners and bounded ranges; use `rg --files-with-matches`, counts,
  and package-scoped searches before printing matches; cap command output;
  exclude generated/build/vendor trees; save any large audit to the existing
  artifact folder and inspect slices.

Blocked condition:
- Stop only if three distinct owner-level attempts prove that the accepted API
  cannot preserve runtime/schema correctness or TypeScript depth without a new
  user-visible design decision, or if required browser/package infrastructure
  remains unavailable after the repository's documented recovery path.

Major state:
- task_type: major
- task_complexity: major
- current_phase: Closeout
- current_phase_status: completed
- next_phase: Final handoff
- goal_status: complete

Current verdict:
- verdict: ship the accepted two-layer identity architecture; every accepted
  owner defect and required proof gate is closed without reopening the API
- confidence: high
- next owner: none
- reason: focused owners, affected source-first proof, strict Plite, public
  declaration builds, docs, browser, release, lint, and review gates pass

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-07-implement-node-identity-architecture.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Execution contract copies every accepted packet, hard cut, proof, boundary, and handoff requirement. |
| Timed checkpoint parsed | yes | N/A: no duration requested; binary gates control completion. |
| `major-task` loaded | yes | Read completely before implementation. |
| Active goal checked or created | yes | New goal created for this accepted-plan execution. |
| Source of truth read before analysis | yes | Accepted audit plan and full final recommendation re-read. |
| Major lane selected | yes | Accepted architecture/public API migration. |
| Decision criteria stated | yes | Completion threshold and execution contract above. |
| Existing repo patterns / prior decisions checked | yes | Accepted audit inventory/matrices plus root and Plite/Plate Vision re-read. |
| Helper stack selected | yes | `autogoal`, `major-task`, `plite-plan`, `plate-plan`, `plate-plugin-creator`, `tdd`, `docs-creator`, `changeset`, Browser; P2 `autoreview` at closeout. |
| External research decision recorded | yes | N/A: clean local reference audit already accepted; no decision remains. |
| Implementation expectation recorded | yes | Full execution explicitly authorized by the user. |
| Workspace authority selected | yes | `/Users/zbeyens/git/plate-2`; current checkout owns all implementation proof. |
| Branch / PR expectation decided | yes | No branch change, staging, commit, push, PR, or tracker mutation requested. |
| Output budget strategy recorded | yes | Exact/counted/capped reads and searches recorded above. |
| Docs pack selected | yes | Supporting guide/reference and migration docs are required. |
| `docs-creator` loaded | yes | Read completely before docs work. |
| Docs lane selected | yes | Guide/runtime concept plus API/migration reference. |
| Target docs and nearest sibling docs read | yes | Deferred within the docs packet before writing; no docs writing starts earlier. |
| Docs style doctrine read | yes | Full `docs-creator` rules read. |
| Documented source owner identified | yes | Plite runtime/schema and Core `ElementIdPlugin`; exact pages selected after source ships. |
| Browser pack selected | yes | Required by package/app source changes. |
| Browser route / app surface identified | yes | Standalone selection, DnD, toggle, media, table, and AI registry demos where routes exist. |
| Browser tool decision recorded | yes | In-app Browser for ordinary app QA; no native Chrome/OS behavior claimed. |
| Console/network caveat policy recorded | yes | Inspect both; record unrelated existing noise explicitly. |
| Package/API pack selected | yes | Runtime, schema, Core, package consumers, exports, and hard cuts are public. |
| Public surface or package boundary identified | yes | `@platejs/plite`, `@platejs/core`, affected feature packages, umbrella exports. |
| Release artifact path selected | yes | One `.changeset/*.md` per changed published package relative to `main`; registry changelog only if registry-only user-facing source changes require it. |
| `changeset` skill loaded when `.changeset` is required | yes | Read completely before release work. |
| Barrel/export impact decision recorded | yes | Public files/symbols change; run `pnpm brl`. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Major source records source type, id/link, title, decision type, expected
      outcome, decision criteria, likely files/packages/surfaces, browser
      surface, and highest-leverage owner.
- [x] Current state is mapped before proposing a new architecture, migration,
      benchmark, or plan.
- [x] Existing repo patterns, prior decisions, and nearby implementation
      constraints are recorded before external research.
- [x] External docs or source are used only where repo evidence does not settle
      the question, or N/A reason is recorded.
- [x] Options, recommendation, tradeoffs, blast radius, and rejection reasons
      are recorded.
- [x] Facts, inference, and recommendation are separated.
- [x] Review or pressure lenses are selected and completed, or marked N/A with
      reason.
- [x] If implementation happens, touched-surface packs cover docs, browser,
      package/API, or agent-native surfaces as needed.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Accepted/actionable review findings are fixed or explicitly rejected with
      evidence.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`. N/A: this is a published breaking API/runtime change.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the named proof | Strict Plite: 1,432 unit tests; Chromium: 698 passed, 6 expected skips; post-fix affected proof and contracts passed. |
| Current-state source audit | yes | Map owners and boundaries | Accepted local audit plus live owner refresh for every packet. |
| Decision criteria closure | yes | Close every criterion | Execution contract is fully checked; no public-design exception. |
| Options / tradeoffs / rejection record | yes | Record chosen and rejected shapes | RuntimeId, path, anchor, and persisted ID remain separate; compatibility and serialized RuntimeId rejected. |
| Review / pressure pass | yes | Run P2 review | P2 convergence review completed; accepted findings are listed below. |
| Review findings closure | yes | Fix or reject findings | All owner defects fixed; unreachable array-property compatibility finding rejected and branch deleted. |
| External-source audit | yes | Record source authority | N/A: accepted clean local-clone audit settled the decision. |
| Implementation gates | yes | Close touched-surface packs | Source, types, runtime, docs, browser, release, and ledger closed. |
| Final handoff contract | yes | Record outcome and caveats | Recorded below; device testing alone remains explicitly deferred. |
| Final lint | yes | Run `pnpm lint:fix` | Passed; only known oversized audit-manifest warnings. |
| Output budget discipline | yes | Keep proof bounded | Focused reads and capped output used; one broad hard-cut search exposed historical generated changelog text and was narrowed. |
| Timed checkpoint | yes | Record N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run the autogoal checker | Passed. |
| Docs source-backed claim audit | yes | Verify current APIs | Docs were migrated against shipped RuntimeId/ElementId owners. |
| Docs links / routes / previews | yes | Verify targets | `www build:source` passed; named standalone demo routes rendered. |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` | Passed. |
| Plugin page specifics | yes | Apply current-state docs rules | Plugin pages use current API/reference voice. |
| Browser interaction proof | yes | Exercise affected routes | `/blocks/playground` and `/examples/plite/tables` interactions passed. |
| Browser console/network check | yes | Inspect errors | No console errors; no identity-related network failures. |
| Browser final proof artifact | yes | Record route proof | Runtime IDs present; zero `data-block-id`; typed interactions succeeded. |
| Public API / package boundary proof | yes | Audit exports and declarations | `pnpm brl` 56/56; public declaration contracts and Media downstream build passed. |
| Release artifact classification | yes | Classify delta | Published breaking API/runtime/type change plus registry adoption. |
| Published package changeset | yes | Validate changesets | `pnpm changeset status` passed; no forbidden minor for Plite/Core/platejs. |
| Registry changelog | yes | Record registry delta | Existing registry changelog entries cover the user-facing registry adoption. |
| No release artifact | yes | Record N/A | N/A: published users see a breaking delta. |
| Package typecheck/build/test | yes | Run owning checks | Affected source-first graph, Plite/Core/CLI/Media owners, and public builds passed. |
| Barrel/export generation | yes | Run `pnpm brl` | Passed 56/56. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | Accepted plan, full recommendation, Vision, and execution-owner skills read; execution contract captured. | Packet 1 |
| Current-state map | completed | Accepted source inventory/matrices remain the architecture baseline; live owner refresh occurs per packet. | Packet 1 |
| Options and recommendation | completed | User accepted the final two-layer architecture; no API fork remains. | Packet 1 |
| Review / pressure pass | completed | Prior editor-audit/best-api pressure pass accepted; implementation gets final P2 autoreview. | Packet 1 |
| Implementation or plan artifact | completed | Accepted RuntimeId/ElementId architecture, CLI generation, migrations, consumers, docs, and release artifacts implemented. | verification |
| Correctness convergence | completed | Core publication/static/ElementId and CLI watch/artifact findings repaired without changing the public design. | targeted proof |
| Verification | completed | Strict Plite, affected source-first proof, contracts, package builds/tests, docs, browser, lint, barrels, and changesets pass. | closeout |
| Closeout | completed | Final ledger and checker close the active goal. | final response |

Findings:
- The accepted audit is current to today's checkout and names all required
  owners; implementation will refresh each owner before modifying it.
- Device testing is explicitly deferred; browser proof covers only claimed
  desktop/runtime behavior.
- The RuntimeId/ElementId split survived the correctness review. The accepted
  findings were implementation defects in Core publication/static rendering,
  ElementId commit atomicity, and CLI watch/artifact transactions.
- Array-form plugin properties were rejected as dead hidden compatibility, not
  promoted into a second public schema declaration shape; keyed property maps
  remain the sole plugin API.

Decisions and tradeoffs:
- Keep Plite RuntimeId, structural paths, text anchors, and persisted element
  IDs as four distinct jobs.
- Hard cut instead of compatibility; migration exists only at the authoritative
  persistence boundary.
- Runtime IDs use the existing editor-scoped counter; persisted IDs use
  configurable string generation.

Implementation notes:
- Execute vertical packets in dependency order and use public behavior/type
  tests before each implementation slice.

Review fixes:
- Plite P2 convergence review closed twenty runtime/schema/compiler findings,
  including root-aware RuntimeId lookup, schema-copy validation, generated
  canonical requirements, named-root updates, and stable property identity.
- Core/CLI convergence findings are closed: compiled primary mark keys publish
  consistently; static RuntimeIds retain named-root context; ElementId state
  publishes only after commit; failed and initial CLI generations retain source
  dependencies; tsconfig/extends/project-reference files are watched; generated
  artifacts use a recoverable journal across process interruption.
- A follow-up review's array-property finding was resolved by deleting the
  unreachable array branch because `PluginSchemaDeclaration` accepts only the
  local-ID property map.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Strict Plite first exposed named-root RuntimeId lookup gaps | 1 | Repair the public-state owner and add named-root coverage | Fixed in `public-state.ts`; focused and strict proof pass. |
| Root legacy artifact build exposed unrelated schema declaration drift in basic-styles, table, and Markdown | 2 | Stop widening this goal; revert experimental tsdown/plugin-generic rewrites and keep source-first proof authoritative | All experiments reverted. This separate declaration-build architecture is not a node-identity defect. |
| Media declaration emit could not name the private RuntimeId unique-symbol brand | 1 | Make the brand publicly nameable without weakening opacity | RuntimeId uses a readonly string-literal brand; Plite and Media build/type/test proof pass. |
| Scoped Biome check processed no plan files | 1 | Use the repository-wide lint result plus `git diff --check` and the goal checker | Plan files are intentionally ignored by Biome; applicable checks pass. |

Verification evidence:
- Strict `pnpm check:plite` passed: Plite 1,432/1,432; Chromium 698 passed,
  6 expected skips, 78 bounded batches; all Plite-family typechecks, tests,
  runner contracts, and public package builds passed.
- Post-brand affected `pnpm check:plite:dev` passed its full source-first graph,
  package tests, Plite 1,432/1,432, table 243/243, Markdown 190/190, AI 68/68,
  Media 86/86, Browser core 107/107, and www package-integration typecheck.
- The recovered contracts tail passed separately: 133/133 runner/tooling
  contracts, 69/69 benchmark/schema contracts, 43 benchmark targets, and
  13/13 public-type build owners.
- Core final proof passed 91/91 focused tests plus full package and type-contract
  typechecks.
- CLI final proof passed 21/21 tests, typecheck, lint, build, and executable
  smoke; compilation is isolated in a worker so TypeScript/esbuild state is not
  retained across generations.
- RuntimeId declaration proof passed Plite typecheck/build and Media
  typecheck/build, 86/86 Media tests, and Media lint.
- `pnpm --filter www build:source`, `pnpm brl` (56/56), changeset status,
  hard-cut production search, `git diff --check`, and `pnpm lint:fix` passed.
- Browser proof passed on `/blocks/playground` and
  `/examples/plite/tables`: live runtime IDs present, no `data-block-id`, typed
  interactions succeeded, and no console errors were observed.
- Root `pnpm typecheck` is not a closure gate. Its legacy artifact-build lane
  still exposes pre-existing schema declaration drift in basic-styles, table,
  and Markdown; the source-first graph and node-identity artifact owners pass.

Final handoff contract:
- Recommendation: report the implemented two-layer identity law and final APIs.
- Confidence: only state after all source, type, runtime, docs, browser, release,
  and review gates close.
- Evidence: exact package commands, source audits, browser routes, changesets,
  barrels, and goal checker.
- Tests / commands: every named owner plus strict Plite handoff.
- Browser proof: selection, DnD, toggle, media, table, and AI routes where real.
- PR / tracker: N/A; no mutation authorized.
- Caveats: physical-device testing remains deferred; any infrastructure blocker
  is stated without weakening source/runtime claims.
- Next owner: none when complete.

Timeline:
- 2026-08-07T11:42:29.660Z Major-task goal plan created.
- 2026-08-07: accepted recommendation and owner doctrine re-read; one-shot goal
  created; full execution contract and proof boundaries materialized.
- 2026-08-07: user paused the long closure run. The running P2 review was
  stopped after it completed and reported four actionable findings.
- 2026-08-07: user authorized the narrower correctness-first direction and
  requested a fresh active goal; public API decisions remain frozen.
- 2026-08-07: repaired all accepted Core publication/static/ElementId findings
  and CLI failed-generation, config dependency, and crash-recovery findings;
  rejected hidden array-form plugin properties in favor of the sole typed map.
- 2026-08-07: strict Plite, post-fix affected proof, contracts, public builds,
  docs, browser, changesets, barrels, lint, and declaration consumers passed;
  unrelated legacy package-build experiments were reverted.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout after every accepted correctness and proof gate passed. |
| Where am I going? | Final goal checker and handoff. |
| What is the goal? | Finish the accepted node-identity implementation without changing its public design. |
| What have I learned? | The architecture is sound; correctness required commit-time publication and journaled multi-file generation. |
| What have I done? | Implemented the architecture, migrated consumers/docs, repaired every accepted owner defect, and passed strict cross-package proof. |

Open risks:
- Generated construction requiredness can reintroduce TS2589 if it leaks into
  routine capability graphs.
- Index maintenance must remain incremental and correct across named roots,
  history, schema reconfiguration, and collaboration.
- Broad raw `id` usage requires semantic classification; a text/property/domain
  ID must not be rewritten as node identity by name alone.
- A rejected transaction must never publish ElementId index state, and no
  root-aware consumer may reduce an identity to a bare path.
