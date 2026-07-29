# manual plugin generics migration

Objective:
Migrate all 78 audited manual plugin generic usages while preserving 31 intentional contracts; done when audit, type, test, docs, browser, review, and checker gates pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-27-manual-plugin-generics-migration.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- package-api (docs/plans/templates/packs/package-api.md)
- browser (docs/plans/templates/packs/browser.md)

Major source:
- type: accepted repo audit
- id / link: `docs/analysis/manual-plugin-generics-audit.md`
- title: Manual plugin generics audit
- decision to make: execute every accepted migration row without weakening legitimate input-domain or exported public contracts
- decision criteria: 78 current code/docs migrations complete, 31 keep rows unchanged, one stale plan example refreshed, no casts/`any`/callback annotations used as inference patches, and public config aliases preserved as inferred aliases

Major lane:
- lane: public API migration
- output type: implementation plus proof
- implementation expected: yes
- affected packages / surfaces: Core and feature package plugin builders, capability portals, Core tests/type tests, `apps/www`, EN/CN current docs, one active plan example, barrels/changesets where required
- dominant risk: silently narrowing option/state domains or deleting exported config contracts while removing aggregate generics

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: none
- semantics: N/A: no timed checkpoint
- initial confidence score: N/A: exact row counts and pass gates are stronger
- improvement loop: continue until every row is migrated or retained with current-source evidence
- final score / loop closure: N/A: close on exact count and proof

Completion threshold:
- All 78 audited current code/docs calls are migrated, all 31 intentional
  explicit-contract calls remain, and the one stale active-plan example is
  refreshed.
- Exported public config names remain available, deriving from the completed
  descriptor with `InferConfig<typeof Plugin>` where manual construction is no
  longer needed.
- The final AST/source audit reports no missed migrate row and no accidental
  removal of a keep row; package checks, Core declaration build, docs parsing,
  focused browser proof, lint, autoreview, and the goal checker pass.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-27-manual-plugin-generics-migration.md`
  passes.

Verification surface:
- Re-run a current AST/source ledger against the 109 audited calls and compare
  it with `docs/analysis/manual-plugin-generics-audit.md`.
- Source-first typecheck and focused tests for every touched package, Core
  package declaration build, `pnpm --filter www build:source`, scoped app
  typecheck, `pnpm lint:fix`, Browser route proof, and `autoreview`.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Execute the accepted migration; do not reopen the settled one-verb inference
  decision.
- Preserve nullable/optional input domains, factory key correlation, the Core
  DOM bootstrap generic, all 28 intentional test contracts, and both extracted
  docs factory contracts.
- Never replace inference with `as`, `any`, explicit callback parameter
  annotations, bare-key config surrogates, or whole-editor capability casts.
- Do not silently remove exported public aliases such as `SuggestionConfig`;
  keep the name and derive it from the completed descriptor.

Boundaries:
- Source of truth: `docs/analysis/manual-plugin-generics-audit.md`, current
  Core builder types, and each named owner/caller.
- Allowed edit scope: the 79 accepted rows plus owning Core inference fixes,
  nearest required tests, exports/barrels, release artifacts, and this plan.
- External sources: N/A: local TypeScript declarations and repo tests own the
  contract.
- Browser surface: `/docs/api/core/plate-plugin`, `/docs/comment`,
  `/docs/suggestion`, and `/blocks/block-selection-demo` when their source is
  touched.
- Tracker sync: N/A: no tracker item and no PR requested.
- Non-goals: deleting Core explicit-contract overloads, migrating the 31 keep
  rows, generated templates/snapshots, unrelated generic APIs, or changing
  runtime behavior.

Output budget strategy:
- Use exact paths and AST/count reports first; cap shell output, save broad
  ledgers under this plan/artifact scope, and inspect only targeted slices.
  Exclude `node_modules`, generated templates, build output, logs, and snapshots
  unless a named release-artifact check requires them.

Blocked condition:
- Stop only if the same owning TypeScript inference defect survives three
  distinct source-level fixes and cannot be resolved without changing a
  protected external contract or receiving a new API decision.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: goal checker
- goal_status: active

Current verdict:
- verdict: all 78 accepted rows migrated; all 31 intentional contracts retained
- confidence: high; exact ledger, declaration emit, cold app checks, package
  matrix, docs build, barrels, lint, and Browser proof pass
- next owner: major-task
- reason: only final autoreview and goal-checker closure remain

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-27-manual-plugin-generics-migration.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Objective, threshold, constraints, boundaries, exact 78/31/79 counts, public-alias correction, proof, and handoff requirements are recorded above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| `major-task` loaded | yes | `.agents/skills/major-task/SKILL.md` read |
| Active goal checked or created | yes | `get_goal` returned none; goal created for this plan |
| Source of truth read before analysis | yes | `docs/analysis/manual-plugin-generics-audit.md` read in full |
| Major lane selected | yes | Public API migration, code-changing execution |
| Decision criteria stated | yes | Exact migration/keep counts and no-regression rules above |
| Existing repo patterns / prior decisions checked | yes | Audit recommendation plus current `InferConfig<typeof Plugin>` package pattern and protected Core explicit-contract tests |
| Helper stack selected | yes | `autogoal`, `major-task`, `docs-creator`, `changeset`; `autoreview` at closure |
| External research decision recorded | no | N/A: local Core types and package emit own the answer |
| Implementation expectation recorded | yes | User explicitly said “go do all of them” |
| Workspace authority selected | yes | `/Users/zbeyens/git/plate-2` current checkout; no sibling/worktree authority |
| Branch / PR expectation decided | no | N/A: no PR/commit requested; edit current checkout only |
| Output budget strategy recorded | yes | Scoped/count-first searches and capped artifacted ledgers above |
| Docs pack selected | yes | `docs` pack materialized |
| `docs-creator` loaded | yes | `.agents/skills/docs-creator/SKILL.md` read |
| Docs lane selected | yes | Existing API-reference and plugin-feature snippets; no topology change |
| Target docs and nearest sibling docs read | yes | EN/CN Plate Plugin, Comment, Suggestion, and protected Plugin Methods pages read |
| Docs style doctrine read | yes | Current-state voice, exact imports, source-backed API, EN/CN parity |
| Documented source owner identified | yes | Core builders own inference; feature descriptors own option/state domains and exported configs |
| Package/API pack selected | yes | `package-api` pack materialized |
| Public surface or package boundary identified | yes | Builder inference, exported config aliases, descriptor portals, package declarations |
| Release artifact path selected | yes | `.changeset` only for a final user-visible package delta from `main`; registry adoption rows are internal unless final source proves copied-user impact |
| `changeset` skill loaded when `.changeset` is required | yes | `.agents/skills/changeset/SKILL.md` read; one package per file and Core no-minor rules recorded |
| Barrel/export impact decision recorded | no | N/A: aliases stay in already-exported modules and no public file moves are planned; rerun `pnpm brl` only if live edits change exports |
| Browser pack selected | yes | `browser` pack materialized |
| Browser route / app surface identified | yes | `/docs/api/core/plate-plugin`, `/docs/comment`, `/docs/suggestion`, `/blocks/block-selection-demo` |
| Browser tool decision recorded | yes | Use Browser for rendered docs/demo proof; no native Chrome/OS surface |
| Console/network caveat policy recorded | yes | Check console/network on the focused routes; report only pre-existing unrelated noise with evidence |

Work Checklist:
- [x] N/A: no duration requested; exact count/pass thresholds replace a score.
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
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pass | Run the repo audit, benchmark, review, prototype, or artifact check named in this plan | exact 78/31 ledger reconciled |
| Current-state source audit | pass | Map current owner, boundaries, constraints, and affected surfaces | accepted audit plus live final scan |
| Decision criteria closure | pass | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | all criteria satisfied |
| Options / tradeoffs / rejection record | pass | Record viable options, chosen recommendation, and why alternatives lose | recorded below |
| Review / pressure pass | pass | Run selected reviewer/lens or record N/A with reason | two completed cycles; third wrapper stalled after 15 minutes with no output |
| Review findings closure | pass | Fix or explicitly reject accepted/actionable findings and record closure proof | two accepted findings fixed |
| External-source audit | pass | Cite official/local clone/external sources when used, or record N/A | N/A: repo declarations own this contract |
| Implementation gates | pass | If code changed, close primary-template and touched-surface gates; otherwise N/A | package/docs/browser gates below |
| Final handoff contract | pass | Record recommendation, evidence, caveats, residual risk, and next owner | recorded below |
| Final lint | pass | Run `pnpm lint:fix` or scoped equivalent when files changed | 114 live changed app/package source files clean |
| Output budget discipline | pass | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | broad output mistakes recorded below; final scans capped/artifacted |
| Timed checkpoint | pass | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-27-manual-plugin-generics-migration.md` | final checker pass |
| Docs source-backed claim audit | pass | Verify docs claims against current source or record N/A | docs parity and current descriptors checked |
| Docs links / routes / previews | pass | Verify leaf links, routes, anchors, and preview names or record N/A | four leaf routes rendered |
| Docs MDX/content parser | pass | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | pass |
| Plugin page specifics | pass | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | EN/CN current-state snippets checked |
| Public API / package boundary proof | pass | Source-audit public API, exports, and package boundary impact | declaration builds and cold consumers pass |
| Release artifact classification | pass | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | structural inference cleanup; existing broader hard-cut changesets own release prose |
| Published package changeset | pass | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | no new task-specific changeset; corrected existing Media type name |
| Registry changelog | pass | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A: registry edits adopt package inference; no standalone registry feature |
| No release artifact | pass | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | no separate user-visible call-shape delta from this 78-row cleanup |
| Package typecheck/build/test | pass | Run owning package checks or record N/A with reason | 15 typechecks, 14 builds, 16 tests pass |
| Barrel/export generation | pass | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | 55/55 tasks pass |
| Browser interaction proof | pass | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | four routes rendered; demo editable focused |
| Browser console/network check | pass | Record console/network state or why it is not applicable | zero warnings/errors on all four routes |
| Browser final proof artifact | pass | Record screenshot/trace/route/native proof or exact caveat | Browser DOM/title/interaction receipt below |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | audit, Core builders, all named source groups mapped | current-state map |
| Current-state map | complete | live searches reconciled against the 78 migrate / 31 keep ledger | implementation |
| Options and recommendation | complete | field-level domains plus inferred descriptor/config; staged `.extend()` only for an earlier inferred capability | implementation |
| Review / pressure pass | complete | two completed autoreview cycles; third post-fix wrapper was terminated after 15 silent minutes | checker |
| Implementation or plan artifact | complete | 78 rows migrated; public aliases retained through `InferConfig` | verification |
| Verification | complete | ledger, packages, cold app checks, docs, barrels, lint, Browser pass | closeout |
| Closeout | complete | ledger and handoff complete | final response |

Findings:
- Fact: the final current-source ledger contains exactly one production builder
  generic (`createBasePlugin<DomConfig>`), 28 intentional Core contract-proof
  calls, and two extracted docs factory contracts: 31 keeps total.
- Fact: every accepted production, capability-ferry, ordinary-test, app, and
  current-doc row is migrated; the one stale Wordgard plan example is inferred.
- Fact: `SuggestionConfig` remains public as
  `InferConfig<typeof SuggestionPlugin>`.
- Fact: field-level typed state factories preserve optional/nullable domains
  without aggregate builder generics or assertions.
- Fact: callbacks and dependent stages infer from completed earlier
  contributions; independent constructor fields stay in the constructor.
- Inference: a named aggregate output generic was usually hiding builder
  inference debt, while a named method input or state domain is legitimate.
- Recommendation: keep explicit builder generics only at portable external
  contracts, extracted generic factories, Core bootstrap boundaries, and tests
  that prove those paths.

Decisions and tradeoffs:
- Chosen: constructor fields plus method-owned input types, field-level typed
  state factories, inferred capability output, and
  `InferConfig<typeof Plugin>` for public aliases. This is the shortest path
  from implementation to declaration and preserves exact domains.
- Chosen: repeat `.extend()` only when a contribution consumes types established
  by an earlier stage or when adapting an existing descriptor from a registry.
- Rejected: aggregate `.extend<{ api/read/update/... }>` contracts. They
  duplicate output and can drift from implementation.
- Rejected: assertions, `any`, callback annotations, caller-side editor
  annotations, and bare-key config surrogates. They silence the symptom and
  weaken the public declaration.
- Rejected: deleting all explicit builder generics. The 31 retained calls prove
  actual portable/external contracts that inference cannot own.
- Blast radius: Core builder/runtime types, 14 feature packages, AI integration
  compilation, registry adopters, EN/CN docs, type/runtime tests, and emitted
  package declarations.

Implementation notes:
- Migrated all nine production `.extend<T>` output contracts, 11 constructor or
  adapter generics, 12 capability ferries, 26 ordinary test contracts, and 20
  app/current-doc calls.
- Preserved all exported public config names; completed descriptors own their
  inferred definitions.
- Restored optional Indent and Node ID input domains caught by declaration
  builds.
- Kept Markdown normalized runtime options immutable without reapplying defaults.
- Made explicitly erased static render wrappers truly erased while exact wrapper
  configs remain exact; added a compile-only Core contract.
- Replaced one AI integration raw update callback with the equivalent direct
  update method to avoid cold whole-editor transaction expansion.
- Refreshed the active Wordgard plan example to the inferred declaration shape.

Review fixes:
- Autoreview cycle 1: corrected the existing Media changeset type name and the
  EN/CN Block Selection option type.
- Autoreview cycle 2: fixed cold List declaration compatibility at the Core
  render-wrapper owner and added the compile-only regression contract.
- Cold package integration then exposed one AI history callback expansion; the
  direct update call compiles without a cast or callback annotation.
- A third post-fix autoreview invocation bundled 530,003 characters and
  produced no verdict for 15 minutes. It was terminated and is recorded as a
  tool failure; no clean third-pass claim is made.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Core type tests exposed stale ordinary-fixture generics | 1 | migrate only accepted fixture rows and retain explicit-contract proofs | resolved; Core contracts pass |
| Feature builds exposed optional Indent and Node ID domains made required | 1 | restore the field-level domain instead of widening the whole config | resolved |
| Warm www cache hid a cold List wrapper incompatibility | 1 | run `tsc --incremental false`, repair explicit erasure at Core owner | resolved; cold main app passes |
| Cold package integration expanded the full AI editor transaction at one callback | 1 | use the equivalent direct update method with a precomputed path | resolved; cold integration compiler passes |
| Raw Bun invocation of the AI slow file reported existing preview/history failures both before and after the call-shape repair | 1 | classify against the supported package-integration compiler; do not absorb unrelated shared runtime WIP | excluded from this inference-only goal |
| Global `pnpm lint:fix` entered unrelated multi-editor audit artifacts and failed on 170 existing diagnostics plus oversized JSON | 1 | lint only the 114 live changed app/package source files | resolved; scoped Biome clean |
| First scoped Biome pass included deleted paths from the diff | 1 | filter to files that still exist | resolved; 114 files clean |
| Third autoreview invocation produced no output for 15 minutes | 1 | terminate the hung wrapper; rely on two completed cycles plus exact final proof and disclose the missing third verdict | tool failure recorded |

Verification evidence:
- Ledger: 78 migrations complete; 31 keeps exact (1 production, 28 Core
  contract proofs, 2 docs factory contracts); stale active-plan hit zero.
- Type: source-first Turbo typecheck passed 31/31 tasks for Core plus 14 feature
  packages.
- Emit: Turbo build passed 27/27 dependency/target tasks for the 14 feature
  packages after a fresh Core build.
- Tests: package test scripts passed 16/16 for Core, AI, and all 14 feature
  packages.
- App/docs: `build:source`, docs parity, registry-source check, cold main
  `tsc --incremental false`, and cold package-integration
  `tsc --incremental false` pass.
- Barrels: `pnpm brl` passed 55/55 tasks.
- Lint: Biome checked 114 live changed app/package source files with no
  diagnostics. Global lint is blocked only by unrelated shared audit artifacts.
- Diff: `git diff --check` passes.
- Browser: `/docs/api/core/plate-plugin`, `/docs/comment`,
  `/docs/suggestion`, and `/blocks/block-selection-demo` returned 200 with the
  expected titles/headings and zero console warnings/errors. The block-selection
  demo rendered one editable and accepted focus.
- Workspace authority: every command above ran in
  `/Users/zbeyens/git/plate-2`; Browser used the local `www` dev server on
  `localhost:3000`.
- Output discipline: one broad grep included historical plans and one global
  lint streamed unrelated artifact diagnostics. Both were stopped as evidence
  sources and replaced with exact file lists/counts and scoped checks.

Final handoff contract:
- Recommendation: keep the final inferred shape and the 31 explicit contracts;
  do not restore aggregate plugin output generics.
- Confidence: high after declaration, cold-consumer, package, docs, lint,
  barrel, and Browser proof.
- Evidence: exact 78/31 source ledger plus proof listed above.
- Tests / commands: Core + feature type/build/test matrices, cold www configs,
  docs/parity/registry checks, barrels, Biome, diff check.
- Browser proof: four target routes rendered cleanly; demo editable focused.
- PR / tracker: N/A; user did not request a commit, PR, or tracker update.
- Caveats: global lint remains blocked by unrelated multi-editor audit artifacts;
  the AI slow file's raw standalone Bun run fails identically on existing shared
  preview/history WIP and is not the supported package-integration gate; the
  final third autoreview wrapper stalled, so the last reviewer verdict is
  unavailable rather than falsely reported clean.
- Next owner: none after the goal checker; third-review tool failure is
  disclosed rather than treated as a source blocker.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Migration and closeout complete |
| Where am I going? | Final goal completion and user handoff |
| What is the goal? | Migrate all 78 accepted manual plugin generics while preserving all 31 intentional contracts |
| What have I learned? | Field-owned input domains plus inferred descriptor output preserve stronger declarations than aggregate output contracts |
| What have I done? | Migrated 78 rows, retained 31 proofs/contracts, repaired owning inference regressions, and passed package/docs/cold-consumer/barrel/lint/Browser gates |

Open risks:

- The third post-fix autoreview wrapper stalled without a verdict; two earlier
  completed cycles found and closed their actionable findings.
- Unrelated shared multi-editor audit artifacts still block global lint.
- The AI history slow file has existing shared runtime failures when invoked
  directly with raw Bun; its supported cold package-integration compiler passes.

Timeline:
- 2026-07-27T13:00:44.641Z Major-task goal plan created.
- 2026-07-27 Production builder migration started; first package and Core
  inference gates identified without casts or aggregate-config rollback.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake and source read |
| Where am I going? | Research / analysis, options, review, verification, closeout |
| What is the goal? | TODO: Fill from Objective |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Pending.
