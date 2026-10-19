# audit all plugin extend stages

Objective:
Audit every plugin-authoring `.extend()` in source, tests, examples, and docs;
done when all matches are classified as constructor-eligible or justified and
coverage counts reconcile.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-07-25-audit-all-plugin-extend-stages.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Major source:
- type: user prompt plus current repository
- id / link: N/A
- title: audit all plugin `.extend()` stages
- decision to make: identify every plugin-authoring `.extend()` that can move
  into its constructor and every stage that has a real prior-stage,
  imported-descriptor, reusable-factory, or proof-only justification
- decision criteria: every lexical match is classified or explicitly excluded;
  source, tests/examples, and docs counts reconcile; every survivor names its
  dependency or owner reason

Major lane:
- lane: architecture / public API audit
- output type: exhaustive source-backed classification and recommendation
- implementation expected: no; audit only
- affected packages / surfaces: repository TypeScript/TSX and MD/MDX plugin
  authoring call sites, excluding generated/build/vendor/history output
- dominant risk: confusing ordinary object `.extend()` calls with Plate plugin
  authoring or missing multiline/callback forms

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: none
- semantics: N/A
- initial confidence score: N/A; coverage is count-based
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- 100% of in-scope `.extend()` lexical matches classified into constructor,
  justified stage, non-plugin API, generated/example-only duplicate, or false
  positive; counts reconcile by source/tests/examples/docs; complete
  constructor-eligible and survivor lists are reported.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-25-audit-all-plugin-extend-stages.md`
  passes.

Verification surface:
- Counted `rg` manifest over tracked source/docs with noisy generated/vendor
  paths excluded, AST-aware or bounded-context inspection of every candidate,
  and a second independent search for `.extend<...>(` / multiline variants.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Do not execute implementation unless this major goal explicitly includes it.
- Do not edit product source or user-facing docs.
- Judge context access alone as insufficient for staging; constructor callbacks
  already receive the authoring context.
- Keep `.extend()` only for imported/prebuilt descriptor adaptation, shared
  factories unavailable to the constructor, or earlier-stage inferred types.

Boundaries:
- Source of truth: current tracked repository source, docs, tests, and examples.
- Allowed edit scope: this audit plan only.
- External sources: N/A; local API ownership settles the question.
- Browser surface: N/A; analytical source audit.
- Tracker sync: N/A.
- Non-goals: implementation, API redesign, changesets, barrels, browser proof,
  and non-Plate `.extend()` APIs.

Output budget strategy:
- Count and save candidate manifests under a temporary directory first. Inspect
  filenames and bounded context slices rather than streaming whole files.
  Exclude node_modules, dist, build, coverage, .next, .turbo, templates, and
  generated artifacts. Cap command output and partition by source/tests/docs.

Blocked condition:
- Stop only if syntax cannot be classified from local source after direct owner
  inspection or if concurrent edits make the counted manifest unstable across
  two consecutive snapshots.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: Production and public docs are constructor-clean. Ten non-production
  authoring call sites and three loaded agent-teaching blocks remain
  constructor-eligible or contradictory.
- confidence: high
- next owner: user decides whether to apply constructor migrations
- reason: the live source checker, a Babel AST call manifest, and an
  independent literal-token manifest reconcile; every production survivor has
  an exact dependency/adaptation owner.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-25-audit-all-plugin-extend-stages.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Audit all plugin-authoring `.extend()` in repository source and docs; report constructor candidates and justified survivors; audit only |
| Timed checkpoint parsed | no | N/A: no duration requested |
| `major-task` loaded | yes | `.agents/skills/major-task/SKILL.md` read completely |
| Active goal checked or created | yes | Goal created for this exact exhaustive audit |
| Source of truth read before analysis | yes | `VISION.md`, `docs/vision/common.md`, `docs/vision/plate.md`, Core authoring types, and current best-api rule |
| Major lane selected | yes | Architecture / public API audit |
| Decision criteria stated | yes | Count reconciliation plus one classification and owner reason per in-scope match |
| Existing repo patterns / prior decisions checked | yes | Vision constructor/staging doctrine and prior builder inference memory checked |
| Helper stack selected | yes | `best-api`, `autogoal`, `major-task`; no external reviewers or subagents |
| External research decision recorded | no | N/A: local source owns the API |
| Implementation expectation recorded | yes | Analytical only; no product/docs implementation |
| Workspace authority selected | yes | `/Users/zbeyens/git/plate-2` current checkout |
| Branch / PR expectation decided | no | N/A: analytical audit; no git publication |
| Output budget strategy recorded | yes | Count-first temporary manifest, bounded context reads, generated/vendor exclusions |
| Package/API pack selected | yes | Public plugin authoring API is the audited surface |
| Public surface or package boundary identified | yes | `createBasePlugin` / `createPlatePlugin` authoring and teaching call sites |
| Release artifact path selected | no | N/A: audit plan only, no published user-visible delta |
| `changeset` skill loaded when `.changeset` is required | no | N/A: no package implementation |
| Barrel/export impact decision recorded | no | N/A: no exports changed |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration.
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
      the question, or N/A reason is recorded. N/A: local Core and callers
      settle the authoring contract.
- [x] Options, recommendation, tradeoffs, blast radius, and rejection reasons
      are recorded.
- [x] Facts, inference, and recommendation are separated.
- [x] Review or pressure lenses are selected and completed, or marked N/A with
      reason.
- [x] If implementation happens, touched-surface packs cover docs, browser,
      package/API, or agent-native surfaces as needed. N/A: audit only.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Accepted/actionable review findings are fixed or explicitly rejected with
      evidence. N/A: no implementation authorized; all candidates are handed
      off explicitly.
- [x] Package/API pack: public API, package boundary, export, and
      release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: N/A because the
      only edit is the internal audit plan.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its
      package/version/prose rules. N/A: no package changes.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack
      instead of adding a package changeset. N/A: no registry changes.
- [x] Package/API pack: no-artifact decision: analytical plan only; no
      published package user-visible delta.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is
      explicit when public shape changes. N/A: audit recommends candidates but
      changes no public shape.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or
      marked N/A. N/A: source audit only.
- [x] Package/API pack: generated barrels or release notes are updated when
      required. N/A: no export or release-note changes.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the repo audit, benchmark, review, prototype, or artifact check named in this plan | 4,699-file source audit passed; 563 executable calls and 1,223 textual tokens classified |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | 35 production plugin calls, 23 public-doc plugin examples, test/proof and agent-teaching surfaces classified |
| Decision criteria closure | yes | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | Every in-scope production and current-doc call has a decision; ten non-production call-site candidates and three prose repairs named |
| Options / tradeoffs / rejection record | yes | Record viable options, chosen recommendation, and why alternatives lose | Constructor for independent contributions; keep stages for prior types, resolved config, imported descriptors, shared factories, and proof-specific contracts |
| Review / pressure pass | yes | Run selected reviewer/lens or record N/A with reason | Independent AST, literal-token, checker-allowlist, and public-doc passes agree |
| Review findings closure | yes | Fix or explicitly reject accepted/actionable findings and record closure proof | Audit-only handoff; candidates preserved and reported rather than silently edited |
| External-source audit | no | Cite official/local clone/external sources when used, or record N/A | N/A: local Core types, doctrine, checker, and callers settle the decision |
| Implementation gates | no | If code changed, close primary-template and touched-surface gates; otherwise N/A | N/A: no product or public-doc implementation |
| Final handoff contract | yes | Record recommendation, evidence, caveats, residual risk, and next owner | Recorded below |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent when files changed | N/A: Biome explicitly ignores `docs/plans/**`; scoped check processed zero files |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Count-first manifests and bounded slices used; one initial combined Vision read truncated, then each required file was reread separately |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-25-audit-all-plugin-extend-stages.md` | Final invocation passed after all evidence and statuses were closed |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Audit only; no public types, exports, or package boundaries changed |
| Release artifact classification | no | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | N/A: internal audit plan only |
| Published package changeset | no | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | N/A: no package delta |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A: no registry change |
| No release artifact | yes | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | Internal analytical plan only; no published user-visible delta |
| Package typecheck/build/test | no | Run owning package checks or record N/A with reason | N/A: no package code changed; checker regression suite passed 24/24 |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no exports or files moved |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Skills, Vision, Core types, prior audit, and checker read | current-state map |
| Current-state map | complete | Literal and AST manifests plus public docs and agent guidance | recommendation |
| Options and recommendation | complete | Constructor-first rule applied to every candidate class | review |
| Review / pressure pass | complete | Independent checker, AST, token, and context review | verification |
| Implementation or plan artifact | complete | Audit plan updated; implementation intentionally N/A | verification |
| Verification | complete | Source audit passed; checker tests 24/24 | closeout |
| Closeout | complete | Scoped lint N/A by configured ignore; goal checker passed | final response |

Findings:
- Fact: the repository checker passed across 4,699 source and documentation
  files, excluding CI-generated registry output and templates.
- Fact: the literal manifest contains 1,223 `.extend` tokens: 585 packages, 5
  apps, 36 tooling, 9 benchmarks, 52 public content, 51 agent guidance, 483
  internal docs, and 2 other. Internal plans/research and historical migration
  prose are not current plugin teaching surfaces.
- Fact: Babel parsed 563 executable `.extend()` calls across TypeScript and
  JavaScript: 53 production calls, 505 test/proof calls, and 5 benchmark calls.
- Fact: production contains 35 Plate plugin-authoring calls and 18 unrelated
  APIs (`state.transaction.extend`, DOM `Selection.extend`, Zod, and
  `expect.extend`). All 35 plugin calls are justified: 18 exact direct-creator
  stages consume earlier types/resolved configuration or share one lexical
  factory; 17 adapt imported/prebuilt/factory descriptors or implement the
  conversion boundary.
- Fact: current public content contains 23 executable Plate plugin examples.
  All are justified: linked shortcuts depend on prior API/update methods,
  later updates consume prior capabilities, or the example adapts an imported
  descriptor. Plite `editor.extend` and v48 historical migration examples are
  different/excluded surfaces.
- Finding: five ordinary non-Core test/benchmark call sites are
  constructor-eligible:
  `packages/ai/src/lib/utils/getMarkdown.spec.tsx:61`,
  `packages/ai/src/lib/utils/replacePlaceholders.spec.tsx:61`,
  `packages/selection/src/react/BlockMenuPlugin.spec.tsx:13`,
  `packages/table/src/react/TablePlugin.navigation.spec.tsx:82`, and
  `benchmarks/slate-v2/donor/core/current/clipboard-large-payload.mjs:241`.
- Finding: five examples in
  `.agents/skills/plate-plugin-creator/rules/typing.md` are
  constructor-eligible at lines 20, 127, 159, 248, and 253. The dependent
  stages at lines 133 and 147, extracted-factory stage at 104, and negative
  example at 195 remain valid.
- Finding: three loaded teaching blocks contradict constructor-first doctrine:
  `.agents/skills/plate-plugin-creator/rules/typing.md:91`,
  `.agents/skills/plate-plugin-creator/rules/creation-flow.md:78`, and the
  source-owned `.agents/rules/plate-next.mdc:257` block mirrored into the
  generated Plate Next skill.
- Fact: 173 direct-creator stages live in tests. Four are the feature-fixture
  candidates above; the remaining 169 intentionally prove builder merging,
  repeated-stage inference, codec compilation, shortcut validation,
  configuration ordering, conversion, dependency projection, or negative
  contracts. Tests of Plite `editor.extend` and transaction extension are
  excluded as different APIs.

Decisions and tradeoffs:
- Keep all 35 production calls. Moving any direct survivor to its constructor
  would lose a prior inferred method/shortcut contract, resolved consumer
  configuration, imported descriptor ownership, or shared lexical factory.
- Keep all 23 current public-doc examples. They teach real staging or imported
  adaptation rather than context access alone.
- Move the ten non-production authoring candidates into their constructors in
  a follow-up cleanup; this removes false teaching without changing product
  behavior.
- Repair the three agent-teaching blocks at their source owners and regenerate
  skills. Do not edit generated `SKILL.md` copies directly.
- Do not rewrite historical plans, changelogs, v48 migration snapshots, Plite
  `editor.extend`, transaction extension, DOM selection, Zod, or test matcher
  APIs.

Implementation notes:
- None yet.

Review fixes:
- Rejected the prior plan's broad claim that every tracked call was already
  classified: its enforcement is deliberately production-only and missed
  ordinary fixtures plus loaded reference examples.
- Corrected the initial regex gap for generic `.extend<{...}>` calls by adding
  the Babel AST manifest and a literal-token cross-check.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial regex omitted generic `.extend<{...}>` calls | 1 | Parse executable source with Babel AST and cross-check literal tokens | Resolved: 563 AST calls plus 1,223-token manifest |
| Scoped Biome check ignored the audit plan | 1 | Record the configured docs-plan exclusion instead of running a root autofix for one analytical file | Resolved: lint gate N/A |

Verification evidence:
- `node tooling/scripts/check-plate-schema-adoption.mjs --audit` in
  `/Users/zbeyens/git/plate-2` -> passed across 4,699 files.
- `bun test tooling/scripts/check-plate-schema-adoption.test.mjs` in
  `/Users/zbeyens/git/plate-2` -> 24 passed, 0 failed.
- Babel AST manifest -> 563 executable calls; direct creator count 192 across
  45 files; production classification 35 plugin and 18 unrelated calls.
- Literal `rg -n '\\.extend\\b'` manifest -> 1,223 tokens; public content 52,
  agent guidance 51; multiline/generic calls covered.
- `pnpm exec biome check
  docs/plans/2026-07-25-audit-all-plugin-extend-stages.md` -> configured ignore;
  zero files processed, so scoped lint is N/A.

Final handoff contract:
- Recommendation: keep production and public docs; migrate the ten
  non-production call sites and repair three agent-teaching blocks.
- Confidence: high.
- Evidence: 4,699-file checker, 563-call AST manifest, 1,223-token textual
  manifest, public-doc and agent-guidance context audit.
- Tests / commands: source audit passed; checker regression suite 24/24.
- Browser proof: N/A; no product, app, package, or public-content change.
- PR / tracker: N/A.
- Caveats: internal historical plans and migration/changelog snapshots were
  counted but intentionally excluded from current teaching decisions.
- Next owner: `plate-plugin-creator` execution plus agent-native repair if the
  user asks to apply the cleanup.

Timeline:
- 2026-07-25T22:52:04.985Z Major-task goal plan created.
- 2026-07-26T00:00:00.000Z Read doctrine, Core authoring types, prior audit,
  and checker allowlist.
- 2026-07-26T00:05:00.000Z Materialized literal and AST manifests; corrected
  the generic-call gap in the initial regex.
- 2026-07-26T00:10:00.000Z Classified production, public docs, tests/proofs,
  benchmarks, and loaded agent guidance.
- 2026-07-26T00:15:00.000Z Source audit and 24/24 checker tests passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final scoped lint and goal-plan check |
| Where am I going? | Concise exhaustive audit handoff |
| What is the goal? | Classify every plugin-authoring `.extend()` and reconcile coverage |
| What have I learned? | Production and public docs are clean; ten non-production calls and three agent blocks remain |
| What have I done? | Completed source, AST, textual, docs, guidance, and checker passes |

Open risks:
- The ten candidates are source-audit recommendations, not compiled migration
  proof; implementation should run focused type/tests because explicit fixture
  generics may expose a Core inference regression.
