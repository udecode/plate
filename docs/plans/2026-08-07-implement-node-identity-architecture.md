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
- [ ] Add one changeset per changed published package relative to `main`, run
      barrels/API owners, focused package proofs, lint, P2 autoreview, and
      relevant browser demos.
- [ ] Keep physical-device testing deferred because no device-specific behavior
      is claimed; do not edit `templates/**`, publish, commit, push, or open a PR.
- [ ] Final handoff reports root cause/owners, final invariant/API, exact proof,
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
- current_phase: Targeted proof and final review
- current_phase_status: in_progress
- next_phase: Strict Plite, final P2 review, release/docs closure
- goal_status: active

Current verdict:
- verdict: keep the accepted two-layer identity architecture; repair its four
  remaining implementation defects without reopening the public API
- confidence: high in the design, not yet handoff-ready in implementation
- next owner: final cross-package proof and release/docs closure
- reason: all accepted Core/CLI owner findings are repaired and their focused
  tests/typechecks pass

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
- [ ] Current state is mapped before proposing a new architecture, migration,
      benchmark, or plan.
- [ ] Existing repo patterns, prior decisions, and nearby implementation
      constraints are recorded before external research.
- [ ] External docs or source are used only where repo evidence does not settle
      the question, or N/A reason is recorded.
- [ ] Options, recommendation, tradeoffs, blast radius, and rejection reasons
      are recorded.
- [ ] Facts, inference, and recommendation are separated.
- [ ] Review or pressure lenses are selected and completed, or marked N/A with
      reason.
- [ ] If implementation happens, touched-surface packs cover docs, browser,
      package/API, or agent-native surfaces as needed.
- [ ] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [ ] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [ ] Accepted/actionable review findings are fixed or explicitly rejected with
      evidence.
- [ ] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [ ] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [ ] Docs pack: docs use current-state reference voice, not changelog voice.
- [ ] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [ ] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [ ] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [ ] Browser pack: console and network errors are checked or explicitly out of scope.
- [ ] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [ ] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [ ] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [ ] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [ ] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [ ] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [ ] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [ ] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [ ] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Run the repo audit, benchmark, review, prototype, or artifact check named in this plan | pending |
| Current-state source audit | pending | Map current owner, boundaries, constraints, and affected surfaces | pending |
| Decision criteria closure | pending | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | pending |
| Options / tradeoffs / rejection record | pending | Record viable options, chosen recommendation, and why alternatives lose | pending |
| Review / pressure pass | pending | Run selected reviewer/lens or record N/A with reason | pending |
| Review findings closure | pending | Fix or explicitly reject accepted/actionable findings and record closure proof | pending |
| External-source audit | pending | Cite official/local clone/external sources when used, or record N/A | pending |
| Implementation gates | pending | If code changed, close primary-template and touched-surface gates; otherwise N/A | pending |
| Final handoff contract | pending | Record recommendation, evidence, caveats, residual risk, and next owner | pending |
| Final lint | pending | Run `pnpm lint:fix` or scoped equivalent when files changed | pending |
| Output budget discipline | pending | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | pending |
| Timed checkpoint | pending | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-07-implement-node-identity-architecture.md` | pending |
| Docs source-backed claim audit | pending | Verify docs claims against current source or record N/A | pending |
| Docs links / routes / previews | pending | Verify leaf links, routes, anchors, and preview names or record N/A | pending |
| Docs MDX/content parser | pending | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | pending |
| Plugin page specifics | pending | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | pending |
| Browser interaction proof | pending | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | pending |
| Browser console/network check | pending | Record console/network state or why it is not applicable | pending |
| Browser final proof artifact | pending | Record screenshot/trace/route/native proof or exact caveat | pending |
| Public API / package boundary proof | pending | Source-audit public API, exports, and package boundary impact | pending |
| Release artifact classification | pending | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | pending |
| Published package changeset | pending | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | pending |
| Registry changelog | pending | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | pending |
| No release artifact | pending | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | pending |
| Package typecheck/build/test | pending | Run owning package checks or record N/A with reason | pending |
| Barrel/export generation | pending | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | Accepted plan, full recommendation, Vision, and execution-owner skills read; execution contract captured. | Packet 1 |
| Current-state map | completed | Accepted source inventory/matrices remain the architecture baseline; live owner refresh occurs per packet. | Packet 1 |
| Options and recommendation | completed | User accepted the final two-layer architecture; no API fork remains. | Packet 1 |
| Review / pressure pass | completed | Prior editor-audit/best-api pressure pass accepted; implementation gets final P2 autoreview. | Packet 1 |
| Implementation or plan artifact | completed | Accepted RuntimeId/ElementId architecture, CLI generation, migrations, consumers, docs, and release artifacts implemented. | verification |
| Correctness convergence | completed | Core publication/static/ElementId and CLI watch/artifact findings repaired without changing the public design. | targeted proof |
| Verification | in_progress | Focused Core and CLI tests/typechecks pass; broad and strict gates remain. | closeout |
| Closeout | pending | | final response |

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
| None yet | 0 | | |

Verification evidence:
- `pnpm check:plite` passed before the latest low-level convergence fixes: 698
  passed, 6 skipped, 78 bounded batches. It must run again at final handoff.
- Plite focused architecture/schema/compiler proof passed after the latest
  fixes: 216 tests, 0 failures; compiler 37/37; Plite typecheck passed.
- Core focused ElementId/resolvePlugins/static proof passed after correctness
  repair: 69 tests, 204 assertions; full package/type-contract typecheck passed.
- CLI watch/config/artifact focused proof passed, including simulated process
  interruption recovery; CLI package typecheck passed. Full CLI test output is
  rerun once more during final targeted proof.
- Browser proof passed on `/blocks/playground` and
  `/examples/plite/tables`: live runtime IDs present, no `data-block-id`, typed
  interactions succeeded, and no console errors were observed.

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

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Targeted proof after closing every accepted Core/CLI correctness finding. |
| Where am I going? | Run strict Plite, one final bounded P2 review, and close release/docs/browser gates. |
| What is the goal? | Finish the accepted node-identity implementation without changing its public design. |
| What have I learned? | The architecture is sound; correctness required commit-time publication and journaled multi-file generation. |
| What have I done? | Implemented the architecture, migrated consumers/docs, repaired every accepted owner defect, and passed focused package proof. |

Open risks:
- Generated construction requiredness can reintroduce TS2589 if it leaks into
  routine capability graphs.
- Index maintenance must remain incremental and correct across named roots,
  history, schema reconfiguration, and collaboration.
- Broad raw `id` usage requires semantic classification; a text/property/domain
  ID must not be rewritten as node identity by name alone.
- A rejected transaction must never publish ElementId index state, and no
  root-aware consumer may reduce an identity to a bare path.
