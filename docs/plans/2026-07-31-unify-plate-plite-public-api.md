# Unify Plate Plite public API

Objective:
Unify Plate/Plite public API across every accepted P0-P2 hard cut; done when adoption, type, test, browser, docs, release, and agent-native gates pass; plan docs/plans/2026-07-31-unify-plate-plite-public-api.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-31-unify-plate-plite-public-api.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- package-api (docs/plans/templates/packs/package-api.md)
- browser (docs/plans/templates/packs/browser.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Major source:
- type: user-directed accepted public-API migration
- id / link: current task; prior read-only audit and accepted full before/after examples
- title: Unify Plate and Plite public APIs
- decision to make: implementation only; the public target is accepted, including positional `define*(name, definition)` and every P0/P1/P2 cut from the audit
- decision criteria: one truthful Plite substrate, Plate-only policy on top, exact descriptor identity, no public compiler graph, no parallel APIs or aliases, exact inference without annotations/casts/`any`, source/docs/release/agent doctrine parity

Major lane:
- lane: mixed framework migration plus breaking public API
- output type: code-changing repo-wide hard cut with release, docs, browser, and agent-native proof
- implementation expected: yes; user explicitly said `go all`
- affected packages / surfaces: `packages/plite*`, `packages/core`, all published feature packages consuming plugin/extension APIs, `packages/plate`, `apps/www`, `content/docs`, current architecture docs, tests/type-tests/tooling, `.changeset`, `.agents/rules` and regenerated skills
- dominant risk: a cosmetic rename that leaves Plate schema/compiler ownership beside Plite, or a generic shortcut that silently introduces `any`, phantom capabilities, recursive declarations, incompatible duplicate-name law, runtime/history/schema regressions, or stale public examples

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A
- initial confidence score: N/A: exact adoption and proof gates are stronger than a subjective score
- improvement loop: execute dependency-ordered packets; after each packet run focused type/runtime proof and rescan the accepted ledger before widening adoption
- final score / loop closure: N/A: closure requires every ledger row and proof gate below

Completion threshold:
- Every accepted target from the full public before/after review is represented in `docs/plans/artifacts/unify-plate-plite-public-api/adoption-ledger.md` and marked implemented, kept, or explicitly rejected with source proof; zero accepted row remains pending.
- Public descriptor factories are solely `defineExtension(name, definition)`, `defineBasePlugin(name, definition)`, and `definePlatePlugin(name, definition)`; old factory names and object-form overloads have zero current source/test/docs/export consumers and no compatibility aliases.
- Plite extension/schema/plugin identities are nominal and immutable; divergent same-name descriptors reject consistently; public editor/plugin arrays reject raw objects and normalized/compiler definitions; generic editors expose no phantom `Record<string, any>` capabilities.
- Plate schemas lower through each plugin's native Plite extension; the root extension owns only root grammar/policy; state-field effects, lifecycle, portals, runtime/view ownership, schema predicates/property handles, HTML codecs, names/types, and React/History composition match the accepted target.
- Public barrels expose only accepted descriptors, definition extraction, portals, tuple-based editor types, and genuine author contracts; compiler accumulators, `Any*`/`Internal*` graphs, raw callbacks, and `__*` fields do not leak through public declarations.
- All source, tests, type-tests, packages, apps, EN/CN current docs, changesets, examples, tooling/adoption checkers, and packed/public fixtures use the sole final API.
- Every changed published package has one correct main-relative changeset; generated barrels are current; agent source rules and generated skills teach the accepted grammar.
- Focused package tests/typechecks, strict Plite handoff, Core/feature/app checks, MDX/docs checks, lint, adoption scans, autoreview, agent-native review, and representative Browser proof all pass with zero accepted actionable finding.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-31-unify-plate-plite-public-api.md`
  passes.

Verification surface:
- Source audit: accepted adoption ledger plus bounded zero-match scans for every removed symbol/call form, excluding historical changelogs and generated/build/cache/template output.
- Type/runtime: compile-only exact inference/negative tests; Plite extension/configuration/schema/history tests; Core plugin/configure/portal/schema/static tests; affected feature package tests.
- Commands: source-first affected package typechecks, `pnpm check:plite:dev` during iteration, `pnpm check:plite` at handoff, www package-integration/typecheck/docs checks, `pnpm brl`, `pnpm lint:fix`, and final repo check lanes selected from the live owners.
- Browser: standalone `/blocks/*-demo` routes covering core editing, Table, Markdown/AI integration, static/RSC-visible plugin components, history, and one schema-rich editor; inspect console/network.
- Release/agent: one changeset per public package from `main`; adoption checker; `pnpm install` regeneration; agent-native reviewer and final autoreview.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Implement every accepted P0/P1/P2 row; do not silently narrow `all` to naming-only work.
- Use positional `define*(name, definition)` as the only descriptor factory call shape; `name` is immutable descriptor identity and `type` remains optional serialized identity inside the definition object.
- Hard cut: no aliases, deprecations, compatibility overloads, tombstones, stale tests, fallback parsing, or public compiler escape hatches.
- Preserve serialized document types and data unless an accepted row explicitly changes descriptor `name`; do not redesign product UI or unrelated editor behavior.
- Preserve existing shared WIP outside the exact accepted migration; never revert unrelated changes or frozen behavior fixes.
- Type inference is mandatory: no callback annotations, casts, `any`, or exported structural `*Editor` capability patches as migration tools.
- Do not git add, commit, push, create a PR, switch branches, or mutate tracker state.

Boundaries:
- Source of truth: accepted before/after call sites; `VISION.md`, `docs/vision/common.md`, `docs/vision/plate.md`, `docs/vision/plite.md`; live public declarations/runtime/tests/docs; current audit artifacts; `.agents/rules` owners.
- Allowed edit scope: all current source/docs/tests/tooling/release/agent-rule files required to make the accepted API true; generated barrels and skills only through their owning generators. Never manually edit `templates/**`, registry build output, or generated skill mirrors.
- External sources: N/A: this is a repo-owned Plate/Plite API and runtime migration.
- Browser surface: current `apps/www` standalone block demos and any Plite browser rows owning changed runtime behavior.
- Tracker sync: N/A: no issue/PR source.
- Non-goals: compatibility support; unrelated package colocation; new UI; speculative capabilities; publishing/committing/PR creation; generated template edits.

Output budget strategy:
- Count/file-list searches first. Exclude `node_modules`, `dist`, `.next`, `.turbo`, generated registry output, templates, caches, historical changelogs, and old plans unless a release-baseline row needs them. Cap ordinary reads to owner slices; save exhaustive adoption inventories under the plan artifact directory and inspect bounded sections.

Blocked condition:
- Block only if three distinct owner-level inference/runtime designs fail the same non-negotiable contract, a live shared writer repeatedly overwrites an exact owner after coordination is exhausted, or mandatory Browser/build infrastructure remains unavailable after repo-prescribed reinstall/fallback paths. Ordinary breadth, failing tests with an identifiable owner, or migration volume are not blockers.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: completed
- next_phase: user handoff
- goal_status: complete

Current verdict:
- verdict: implemented; the accepted API is adopted across source, tests, docs, release artifacts, tooling, and agent rules without compatibility aliases
- confidence: high; package, declaration, runtime, strict Plite, docs, Browser, adoption, autoreview, and agent-native gates pass
- next owner: user or release maintainer for publication
- reason: every adoption-ledger row is resolved and all task-scoped verification is green; only unrelated root-wide lint debt remains

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-31-unify-plate-plite-public-api.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Every accepted P0/P1/P2 row, positional factory correction, `all`, hard-cut/no-alias boundary, proof surfaces, and handoff requirements are explicit above and in the checklist below |
| Timed checkpoint parsed | no | N/A: no duration requested |
| `major-task` loaded | yes | Full `.agents/skills/major-task/SKILL.md` read before source edits |
| Active goal checked or created | yes | No prior goal; active goal created for this exact plan |
| Source of truth read before analysis | yes | Prior full audit read root/detail Vision, public declarations/runtime/tests/docs, and current audit artifacts; live source will be refreshed per packet |
| Major lane selected | yes | Mixed framework migration plus breaking public API |
| Decision criteria stated | yes | Truthful ownership, sole grammar, inference, nominal identity, deletion value, docs/release parity, and proof listed above |
| Existing repo patterns / prior decisions checked | yes | Accepted audit and full before/after examples reconcile current Vision, Plite/Core owners, and prior configure/extend law |
| Helper stack selected | yes | `autogoal`, `major-task`, `hard-cut`, `changeset`, `docs-creator`; load `tdd`, `autoreview`, and `agent-native-reviewer` only at their execution gates |
| External research decision recorded | no | N/A: local stack owns the API and behavior |
| Implementation expectation recorded | yes | User said `go all`; one-shot implementation without another approval stop |
| Workspace authority selected | yes | `/Users/zbeyens/git/plate-2` shared current checkout |
| Branch / PR expectation decided | no | N/A: preserve shared checkout; no branch/PR/git publication authorized |
| Output budget strategy recorded | yes | Count/file-list first, owner slices, excluded generated/build/history trees, artifacted exhaustive inventories |
| Docs pack selected | yes | Current API docs, guides, migration pages, EN/CN examples, and source-backed reference parity are part of closure |
| `docs-creator` loaded | yes | Full `.agents/skills/docs-creator/SKILL.md` read before docs edits |
| Docs lane selected | yes | API reference plus guide/system and migration surfaces; current-state docs remain reference voice, changesets own migration prose |
| Target docs and nearest sibling docs read | yes | Audited and migrated current EN/CN docs plus nearest plugin, installation, migration, and example siblings after source stabilization; final checker covers 363 docs |
| Docs style doctrine read | yes | `docs-creator` source rules loaded; positional factory correction requires source-rule repair before regeneration |
| Documented source owner identified | yes | Plite extension/schema/runtime docs, Core plugin/editor docs, feature docs, and migration EN/CN pages map to their package owners |
| Package/API pack selected | yes | Public exports, package boundaries, declarations, changesets, and barrels all change |
| Public surface or package boundary identified | yes | `@platejs/plite*` substrate; `@platejs/core` Base/static layer; `@platejs/core/react`; feature packages; `platejs` facades |
| Release artifact path selected | yes | One `.changeset/*.md` per changed published package with a main-relative public delta; registry changelog only if registry-owned UI behavior changes independently |
| `changeset` skill loaded when `.changeset` is required | yes | Full changeset rules read; no forbidden `minor` for Plite/Core/platejs and one package per file |
| Barrel/export impact decision recorded | yes | Export names/files and public type visibility change; run `pnpm brl` after adoption |
| Browser pack selected | yes | Package/docs/app-facing migration requires representative Browser proof |
| Browser route / app surface identified | yes | Prefer standalone `/blocks/*-demo` routes for core editor, Table, Markdown/AI, static component, history, and schema-rich behavior |
| Browser tool decision recorded | yes | Use Browser first; no native Chrome-only behavior is expected unless clipboard/file-dialog proof becomes necessary |
| Console/network caveat policy recorded | yes | Record all console/network errors; do not dismiss new errors as noise without reproducing baseline/source ownership |
| Agent-native pack selected | yes | `best-api`, `docs-creator`, Plate/Plite Vision and related source rules must teach positional factories and final cuts |
| Agent-facing action surface identified | yes | Plugin/extension creation, schema/lifecycle/portal examples, hard-cut adoption, and package colocation guidance |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/*.mdc` and Vision; run `pnpm install`; never edit generated `.agents/skills/*/SKILL.md` directly |
| `agent-native-reviewer` loaded or waiver recorded | yes | Full skill loaded; capability review recorded in `docs/plans/artifacts/unify-plate-plite-public-api/agent-native-review.md` with no findings |

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
      benchmark, or plan. Evidence: completed Plate/Plite public audit and accepted full before/after surface.
- [x] Existing repo patterns, prior decisions, and nearby implementation
      constraints are recorded before external research. Evidence: Vision, live owner source, current audit artifacts, and configure/extend doctrine were reconciled.
- [x] External docs or source are used only where repo evidence does not settle
      the question, or N/A reason is recorded. N/A: repo-owned stack.
- [x] Options, recommendation, tradeoffs, blast radius, and rejection reasons
      are recorded in the accepted audit and public examples; this goal executes that target.
- [x] Facts, inference, and recommendation are separated in the accepted audit artifacts and this plan.
- [x] Review or pressure lenses are selected and completed. Evidence: final
      local `autoreview` returned zero findings and the agent-native review
      returned PASS with no finding.
- [x] If implementation happens, touched-surface packs cover docs, browser,
      package/API, or agent-native surfaces as needed.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Accepted/actionable review findings are fixed or explicitly rejected with
      evidence. Evidence: final autoreview and agent-native review found none.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded above.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed. Evidence: source adoption checker passed 4,205 files and docs contract checker passed 363 docs.
- [x] Docs pack: docs use current-state reference voice, while changesets alone own migration prose.
- [x] Docs pack: routes and previews were verified on live standalone/docs pages; content compilation passes.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded in the adoption ledger and changesets.
- [x] Package/API pack: the release artifact matrix was applied; 47 changed published packages are covered by package changesets.
- [x] Package/API pack: `changeset` was loaded and package/version/prose rules were applied.
- [x] Package/API pack: registry-only handling is N/A because this is a published package API migration, not a registry-only change.
- [x] Package/API pack: no-artifact handling is N/A because published package users see the hard cut.
- [x] Package/API pack: the no-compatibility hard-cut decision is explicit above and enforced by zero-match scans.
- [x] Package/API pack: source-first typechecks, declaration builds, package runtime tests, and strict Plite proof pass.
- [x] Package/API pack: `pnpm brl` passed 55/55 and release notes are current.
- [x] Browser pack: routes, interactions, and expected outcomes were recorded and exercised for collaboration, Table, and static/RSC rendering.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it. N/A: no native browser/OS behavior changed.
- [x] Browser pack: console and network errors were checked; target routes had zero console errors, and Table recorded 126 network events with zero failures or HTTP responses at or above 400.
- [x] Browser pack: collaboration final visual state was inspected in Browser; no native fallback was needed.
- [x] Agent-native pack: `.agents/rules/**` source owners were edited, not generated skill mirrors.
- [x] Agent-native pack: positional factories and final hard-cut actions are discoverable from the relevant rule and skill paths.
- [x] Agent-native pack: `pnpm install` regenerated rule-backed skill mirrors successfully.
- [x] Agent-native pack: final agent-native review passed with no accepted findings.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the repo audit, benchmark, review, prototype, or artifact check named in this plan | Adoption ledger has zero unresolved rows; source/docs/Plite contract checkers, package proof, Browser proof, autoreview, and agent-native review pass |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | Full Plate/Plite source audit and adoption ledger cover every accepted row and owner |
| Decision criteria closure | yes | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | Every P0/P1/P2/C row is implemented; intentional K rows are kept with evidence |
| Options / tradeoffs / rejection record | yes | Record viable options, chosen recommendation, and why alternatives lose | Accepted audit chose positional nominal descriptors, truthful Plite ownership, terminal configure, and no aliases; alternatives are recorded below |
| Review / pressure pass | yes | Run selected reviewer/lens or record N/A with reason | Final local autoreview: zero findings, correct patch, confidence 0.77; agent-native review: PASS |
| Review findings closure | yes | Fix or explicitly reject accepted/actionable findings and record closure proof | No actionable finding remained in either final review |
| External-source audit | no | Cite official/local clone/external sources when used, or record N/A | N/A: repository source owns the API and behavior |
| Implementation gates | yes | If code changed, close primary-template and touched-surface gates; otherwise N/A | All work checklist and docs/package/browser/agent-native packs are closed |
| Final handoff contract | yes | Record recommendation, evidence, caveats, residual risk, and next owner | Completed below |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent when files changed | Exact continuation surface passes Biome; root `pnpm lint:fix` is blocked by 229 errors and 10 warnings in unrelated pre-existing audit artifacts/scripts |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Broad inventories were counted or artifacted; ordinary output was capped |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-31-unify-plate-plite-public-api.md` | Final closeout command |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | Source adoption checker passed 4,205 files; docs contracts passed 363 docs; Plite docs checker passed |
| Docs links / routes / previews | yes | Verify leaf links, routes, anchors, and preview names or record N/A | Live collaboration, Table, and server-side routes rendered; docs content compilation passes |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | Passed with Fumadocs source generation |
| Plugin page specifics | yes | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | Docs creator rules applied across current EN/CN plugin docs and verified by docs contracts |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Zero-match hard-cut scans, public declaration builds, adoption checker, and 55/55 barrel generation pass |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published breaking package API/types/runtime migration |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | All 47 changed published packages are covered by existing changesets; forbidden version policy passes |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A: not registry-only |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: package users see the API hard cut |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Affected source graph 62/62; Core/History source graph 11/11; declaration builds pass; History 125/125; focused Core/list/Yjs 122 pass; strict Plite handoff passes |
| Barrel/export generation | yes | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | `pnpm brl`: 55/55 |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Collaboration sync/undo, Table schema rendering, and static/RSC rendering pass on live routes |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Zero target-route console errors; Table network capture had 126 events, zero failures, zero HTTP responses at or above 400 |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | Collaboration synchronized state was visually inspected; route and network evidence recorded below |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` completed and regenerated skills/resources from rule owners |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | Final positional factory and hard-cut grammar is present in source rules and generated skill entrypoints |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | PASS artifact with no findings |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | Accepted audit, Vision, live owners, docs, release and rule surfaces mapped | current-state map |
| Current-state map | completed | Adoption ledger covers every P0/P1/P2/C/K row | implementation |
| Options and recommendation | completed | User accepted complete before/after surface and positional factory form | review |
| Review / pressure pass | completed | Autoreview zero findings; agent-native review PASS | verification |
| Implementation or plan artifact | completed | Repo-wide hard cut adopted across product and support surfaces | verification |
| Verification | completed | Type, declaration, runtime, strict Plite, docs, release, Browser, lint-scope, and checker gates pass | closeout |
| Closeout | completed | Final handoff and caveat recorded | final response |

Findings:
- Plate duplicated Plite descriptor/schema/runtime concepts through parallel factories, compiler-facing types, and compatibility paths; those alternatives made public ownership and inference dishonest.
- Exact same-descriptor repetition must stay idempotent, while divergent descriptors with the same nominal name must reject; this preserves composition without silently accepting collisions.
- Capability widening belongs to `.extend`; `.configure` is terminal. Plate policy composes on native Plite extensions rather than re-declaring their substrate.
- Human descriptor `name` and serialized node `type` are different identities. `KEYS` owns names; `NODES` owns serialized types.
- History needed an owning HKT provider to keep generic value inference nameable in public declarations; a local editor capability patch would merely hide the type-design bug.
- Yjs external-store snapshots must be primitive/stable values; returning unstable composite snapshots breaks React subscription semantics.

Decisions and tradeoffs:
- Keep one public grammar: positional `defineExtension`, `defineBasePlugin`, `definePlatePlugin`, and `defineEditorSchema`; object-form factories, `create*Plugin`, and compatibility aliases lose because they create alternatives without capability.
- Keep Plate as an opinionated layer over Plite instead of reducing Plate features or duplicating Plite concepts. Superior shared primitives move downward; Plate-only policy stays upward.
- Keep static/RSC components on Base plugins directly; forcing React conversion for static rendering is false ownership.
- Keep idempotent exact descriptors and reject divergent same-name definitions; blanket latest-wins would conceal incompatible plugin definitions.
- Keep package changesets rather than a registry changelog because the user-visible delta is published package API/types/runtime behavior.

Implementation notes:
- Migrated public factories, plugin/extension composition, schema lowering, state/lifecycle/portal/runtime/view ownership, names/types, HTML codecs, History, React/static, and all consumers to the accepted grammar.
- Removed old exports, overloads, aliases, object-form calls, editor extension alternatives, public compiler graphs, and phantom capability defaults.
- Migrated source, type tests, runtime tests, apps/registry, benchmarks, EN/CN docs, changesets, checkers, barrels, package fixtures, and agent rules in the same hard cut.
- Added source/docs adoption enforcement so the rejected call shapes cannot drift back unnoticed.

Review fixes:
- Replaced an unnameable/manual History plugin type shape with the generic `HistoryExtensionTypeProvider` contract and verified Core/History declarations.
- Repaired Yjs external-store snapshots to stable primitive snapshots and verified live two-editor synchronization plus author-local undo.
- Curated static Core exports to avoid leaking plugin/compiler barrels and preserved direct Base static components.
- Final autoreview and agent-native review returned no remaining actionable finding.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Root `pnpm lint:fix` reports unrelated audit-artifact debt | 1 | Run exact changed-surface Biome and preserve unrelated WIP | Exact continuation files pass; recorded 229 errors and 10 warnings outside the migration scope |
| History declaration inference was not publicly nameable | 1 | Repair the generic owner instead of adding a manual plugin annotation | HKT provider contract; Core and History declaration builds pass |
| Yjs subscription snapshot was unstable | 1 | Use primitive external-store snapshots | Runtime tests and live collaboration Browser proof pass |

Verification evidence:
- Adoption/checkers: 103/103 checker tests; Plate schema adoption PASS across 4,205 files; docs contracts PASS across 363 docs; Plite docs checker PASS; hard-cut symbol scan has zero product hits.
- Types/builds: affected source-first graph 62/62; final Core/History graph 11/11; Core and History declaration builds pass; public contract builds 13/13.
- Runtime: History 125/125; focused Core/list/Yjs 122 pass; contract runners Node 133/133 and Bun 69/69; benchmark contract 43.
- Strict Plite: `pnpm check:plite` passed Chromium 698 with 6 intentional skips; focused package proof was also green.
- Docs/release: `pnpm --filter www build:source` passes; 47/47 changed published packages have changeset coverage; `pnpm brl` passes 55/55; `pnpm install` regenerated skills.
- Browser: collaboration sync and local undo pass with zero console errors; Table renders and records 126 network events with zero failures or error responses; server-side route renders rich static/RSC output with zero editable nodes and zero console errors.
- Review/lint: scoped Biome passes; final autoreview reports zero findings; agent-native review PASS. Root lint remains red only on unrelated existing audit scripts/artifacts.

Final handoff contract:
- Recommendation: ship the sole final Plate/Plite API; do not add compatibility aliases or reopen parallel descriptor/compiler shapes.
- Confidence: high.
- Evidence: every ledger row resolved; adoption, docs, release, type, declaration, runtime, Browser, autoreview, and agent-native gates pass.
- Tests / commands: exact evidence is listed above and in the adoption ledger.
- Browser proof: collaboration, Table, and static/RSC routes pass with clean target console/network state.
- PR / tracker: N/A; user did not authorize git publication or tracker mutation.
- Caveats: root-wide `pnpm lint:fix` still sees 229 errors and 10 warnings in unrelated existing audit artifacts/scripts; the exact changed continuation surface is clean.
- Next owner: user or release maintainer for commit/publication.

Timeline:
- 2026-07-31T21:32:11.345Z Major-task goal plan created.
- 2026-07-31 Plate/Plite factories, identity, schema/runtime ownership, type graph, History, static/React, apps, docs, release, tooling, and agent rules hard-cut to the accepted API.
- 2026-07-31 Source/type/runtime/docs/release/Browser/checker proof completed; final autoreview and agent-native review returned no findings.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete; ready for user handoff |
| Where am I going? | User or release maintainer publication |
| What is the goal? | Implement every accepted P0-P2 Plate/Plite public API hard cut with no aliases and complete adoption/proof |
| What have I learned? | See Findings |
| What have I done? | Implemented and verified the complete hard cut; see Timeline and Verification evidence |

Open risks:
- Root-wide lint debt outside this migration remains; it does not invalidate the exact changed-surface proof but should be handled by its audit-artifact owners.
- A repo-wide breaking API migration has unavoidable downstream migration cost; changesets and current docs describe the sole supported shape rather than keeping alternatives.
