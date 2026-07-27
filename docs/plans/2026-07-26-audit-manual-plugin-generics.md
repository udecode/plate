# Audit manual plugin generics

Objective:
Audit manual plugin-contract generics; done when every package-source candidate is classified with migration guidance and zero package src edits; plan docs/plans/2026-07-26-audit-manual-plugin-generics.md.

Goal plan:
docs/plans/2026-07-26-audit-manual-plugin-generics.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:

- docs (docs/plans/templates/packs/docs.md)

Major source:

- type: user request plus current checkout
- id / link: N/A: no tracker item
- title: Audit manual plugin-builder generics
- decision to make: classify every explicit generic argument on Plate plugin
  builder, portal, update, and hook calls that manually supplies a plugin
  contract as migrate, keep, or test-only
- decision criteria: inferred builder output wins unless the generic owns a real exported input contract, recursion boundary, negative type proof, or irreducible Core inference gap

Major lane:

- lane: architecture or public API
- output type: source-backed audit
- implementation expected: no; review only
- affected packages / surfaces: `packages/**/src/**/*.{ts,tsx}` plus tests, type tests, apps, and docs only as evidence
- dominant risk: calling legitimate constructor config types or compile-only inference witnesses redundant, or missing multiline/chained builder generics

First checkpoint:

- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:

- requested duration: N/A: none requested
- semantics: N/A: no timed checkpoint
- initial confidence score: N/A: exhaustive counted threshold is stronger
- improvement loop: N/A: close when every candidate row is classified
- final score / loop closure: N/A: use candidate accounting and independent review

Completion threshold:

- Every explicit generic argument on Plate plugin builder, portal, update, and
  hook calls under `packages/**/src/**/*.{ts,tsx}` that manually supplies a
  plugin contract is enumerated and classified as migrate, keep, or
  test-only/non-production.
- Every migrate row has an exact file/line, current purpose, preferred inferred
  shape, and owning inference fix if direct removal would regress declarations.
- Every survivor has concrete proof that the generic is a real public/exported
  input contract, recursion boundary, negative type test, or current unavoidable
  Core inference owner.
- `packages/**/src/**/*.{ts,tsx}` remains byte-for-byte untouched by this audit.
- The durable report is `docs/analysis/manual-plugin-generics-audit.md`.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-26-audit-manual-plugin-generics.md`
  passes.

Verification surface:

- Counted `rg` and Babel-AST queries over package source, with manual source
  reads of every candidate. TypeScript 7 exposes version metadata only through
  the root JS package, so Babel is the repository-owned parser fallback.
- Cross-check against tests/type tests and Core builder definitions.
- Independent read-only review of the final candidate ledger.
- Artifact: `docs/analysis/manual-plugin-generics-audit.md`.

Constraints:

- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Do not execute implementation unless this major goal explicitly includes it.
- Do not edit any file under `packages/**`.
- Do not add casts, callback annotations for builder context, or manual helper
  aliases as migration recommendations.

Boundaries:

- Source of truth: live package source, Core builder generics, package type tests,
  root `VISION.md`, `docs/vision/common.md`, `docs/vision/plate.md`, and
  `.agents/skills/best-api/SKILL.md`.
- Allowed edit scope: this plan and `docs/analysis/manual-plugin-generics-audit.md`.
- External sources: N/A: repo-owned API and current checkout settle the question.
- Browser surface: N/A: static type/API audit only.
- Tracker sync: N/A: no tracker source.
- Non-goals: no package source migration, no Core type change, no docs/API
  adoption, no changeset, no tests or generated barrel edits.

Output budget strategy:

- Count and list filenames first; save broad match ledgers under `/tmp`; inspect
  candidates in bounded slices; exclude `node_modules`, `dist`, generated
  output, templates, coverage, and build artifacts.

Blocked condition:

- Stop only if current source cannot be parsed or the builder owner cannot
  distinguish inferred output from required explicit input after three distinct
  source/type investigations; report the exact ambiguous rows.

Major state:

- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:

- verdict: migrate 78 current calls, keep 31 deliberate contracts; one active
  plan adds one migration row
- confidence: high
- next owner: `plate-plan` / Core plugin typing before package adoption
- reason: every live builder/capability generic is counted and classified in
  `docs/analysis/manual-plugin-generics-audit.md`

Completion rule:

- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-26-audit-manual-plugin-generics.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Scope, non-goal, deliverable, threshold, and no-package-src boundary copied above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| `major-task` loaded | yes | `.agents/skills/major-task/SKILL.md` read completely |
| Active goal checked or created | yes | `get_goal` returned no active goal; creation follows this filled shell |
| Source of truth read before analysis | yes | `VISION.md`, `docs/vision/common.md`, `docs/vision/plate.md`, and `best-api` read |
| Major lane selected | yes | Architecture/public API, analytical only |
| Decision criteria stated | yes | Migrate/keep/test-only criteria recorded above |
| Existing repo patterns / prior decisions checked | yes | Vision and memory quick pass reaffirm inferred-builder-output doctrine |
| Helper stack selected | yes | `best-api`, `major-task`, `autogoal`; `docs-creator` only for artifact hygiene |
| External research decision recorded | no | N/A: repo-owned authoring API |
| Implementation expectation recorded | yes | No implementation or package source edits |
| Workspace authority selected | yes | `/Users/zbeyens/git/plate-2` current checkout |
| Branch / PR expectation decided | no | N/A: analytical task; no git operation |
| Output budget strategy recorded | yes | Count-first and `/tmp` ledger strategy above |
| Docs pack selected | yes | Internal audit artifact is supporting evidence |
| `docs-creator` loaded | yes | `.agents/skills/docs-creator/SKILL.md` read completely |
| Docs lane selected | yes | Internal spec/law audit, not public product docs |
| Target docs and nearest sibling docs read | yes | Final target read after creation; `docs/analysis/best-api-review.md` read as the nearest API-audit owner |
| Docs style doctrine read | yes | Generated skill and `.agents/rules/docs-creator.mdc` read |
| Documented source owner identified | yes | Core plugin builder plus each package plugin declaration |

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
      the question, or N/A reason is recorded. N/A: local Core types, tests,
      source, Vision, and current docs settle the question.
- [x] Options, recommendation, tradeoffs, blast radius, and rejection reasons
      are recorded.
- [x] Facts, inference, and recommendation are separated.
- [x] Review or pressure lenses are selected and completed, or marked N/A with
      reason.
- [x] If implementation happens, touched-surface packs cover docs, browser,
      package/API, or agent-native surfaces as needed. N/A: analytical audit;
      only this plan and the internal report changed.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Accepted/actionable review findings are fixed or explicitly rejected with
      evidence.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner
      are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform,
      demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are
      marked N/A with reason. N/A: internal report contains no web routes,
      anchors, or preview links.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the repo audit, benchmark, review, prototype, or artifact check named in this plan | 109 current calls classified; one active-plan row classified |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | 21 production builders, 12 production capability ferries, 54 package tests/type tests, 22 app/current-doc calls |
| Decision criteria closure | yes | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | 78 current migrations, 31 survivors, every survivor names its independent contract |
| Options / tradeoffs / rejection record | yes | Record viable options, chosen recommendation, and why alternatives lose | Report separates remove, reshape, and keep; rejects casts and blind removal |
| Review / pressure pass | yes | Run selected reviewer/lens or record N/A with reason | Independent report review returned CLEAN after corrections |
| Review findings closure | yes | Fix or explicitly reject accepted/actionable findings and record closure proof | Generated-file counts, three test rows, Navigation hook name, and Media proof corrected; one test-proof objection rejected with source evidence |
| External-source audit | no | Cite official/local clone/external sources when used, or record N/A | N/A: repository-owned API |
| Implementation gates | no | If code changed, close primary-template and touched-surface gates; otherwise N/A | N/A: no package implementation |
| Final handoff contract | yes | Record recommendation, evidence, caveats, residual risk, and next owner | Recorded below |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent when files changed | `pnpm exec prettier --check` passed both audit Markdown files; full lint is disproportionate and could rewrite forbidden package source |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Count-first scans and capped reads; one broad AST result truncated, then replaced with targeted counted queries |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-26-audit-manual-plugin-generics.md` | Final closeout command recorded in verification evidence |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | Exact callsites re-read; AST/lexical totals reconcile |
| Docs links / routes / previews | no | Verify leaf links, routes, anchors, and preview names or record N/A | N/A: no leaf links/routes/previews |
| Docs MDX/content parser | no | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | N/A: no MDX/content edit |
| Plugin page specifics | no | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | N/A: internal audit, not a plugin page |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | requirements, skills, Vision, and goal shell read | current-state map |
| Current-state map | complete | AST plus lexical manifests and exact source reads | options |
| Options and recommendation | complete | remove/reshape/keep model and ordered migration in report | review |
| Review / pressure pass | complete | Independent source/report review; first pass produced five P1 corrections, final pass CLEAN | implementation decision |
| Implementation or plan artifact | complete | `docs/analysis/manual-plugin-generics-audit.md`; no package source edit | verification |
| Verification | complete | final AST/lexical counts, formatting, Media declaration probe, and clean reviewer | closeout |
| Closeout | complete | report and exact residual checker caveat recorded | final response |

Findings:

- Package code contains 75 actual builder generics: 21 production and 54
  tests/type tests.
- Production package source contains exactly 12 adjacent capability ferries;
  all should migrate to real descriptor/context inference.
- Current apps/docs contain 22 relevant calls: 20 migrate or reshape and two
  extracted-factory contracts stay.
- The production migration set is not one mechanical deletion: output shadows
  can disappear immediately, while real nullable/optional option domains need
  a checked field-level Core authoring path.
- `createBasePlugin<DomConfig>` remains the sole production builder survivor
  because live Core bootstrap derivation otherwise cycles or emits unusable
  declarations.

Decisions and tradeoffs:

- Chosen: infer output, type domain inputs where owned, derive final config.
- Chosen: keep the explicit portable-contract overload and its deliberate type
  tests.
- Rejected: delete every generic indiscriminately; this loses absent/nullable
  option domains.
- Rejected: replace config generics with `as`, `any`, callback annotations, or
  one-use output aliases.
- Rejected: preserve full aggregate configs merely because one option domain
  needs a type.

Implementation notes:

- No package/app/content source implementation was authorized or performed.
- Allowed edits are this plan and
  `docs/analysis/manual-plugin-generics-audit.md`.

Review fixes:

- Accepted: remove generated `dist` contamination from scan counts. Final
  parser coverage is 1,754 package-source files and 1,289 production files.
- Accepted: move `getEditorPlugin.spec.ts:21,59` and
  `createBasePlugin.typed.spec.ts:14` from permanent proof to migration. Final
  test split is 26 migrate / 28 keep after the concurrent plugin-store test
  consolidation.
- Accepted: correct Navigation Feedback from `useEditorPluginOption` to the
  live `useEditorPluginStore` call.
- Accepted: narrow Media proof to the isolated current factory after a fresh
  Core build and required state-API rename; do not claim full Media package
  emit.
- Accepted: correct the current Toggle ferry to `usePluginStore` and the Core
  constructor/adapter overload count to 14.
- Rejected: move `pluginExtensionMerge.spec.ts:44` to migration. That test's
  explicit purpose is contextual typing of a root API implementation from an
  externally declared contract, so it remains one honest explicit-path proof.
- Final independent re-review: CLEAN.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Root TypeScript 7 package exposes version metadata but not the parser API expected by the first scanner | 1 | Use repository-owned Babel parser | Final non-generated package-source scan parsed 1,754/1,754 files |
| Initial `rg` glob was rooted as `src/**` and returned zero package rows | 1 | Use `packages/**/src/**` | Lexical and AST builder totals reconcile |
| First broad AST diagnostic exceeded direct output budget and truncated | 1 | Split by builder, capability, app/docs, and test families | Every final family is counted separately in the report |
| First reviewer found generated `dist` pollution in delegated scan counts | 1 | Re-run through `rg --files`, which honors generated-file exclusions | 1,754/1,754 package source and 1,289 production files parsed, zero failures |
| First reviewer challenged historical Media emit evidence | 1 | Rebuild current Core and use an isolated package-local factory shadow | TS7 and `tsdown` declaration emit pass for the inferred factory; full Media baseline caveat recorded |
| Schema adoption checker reported `NodeIdPlugin.ts:694` runtime `initialState` access | 1 | Preserve no-package-source boundary and classify the unrelated live WIP failure | Audit artifact does not depend on this checker; exact failure recorded |
| First goal-checker run found the intentionally open review/verification rows | 1 | Finish review and close every plan gate | Final checker rerun follows this update |
| Concurrent Core store migration replaced three `usePluginOption` generic test calls with one `usePluginStore` proof and removed one legacy store fixture | 1 | Re-run the final AST manifest against the live snapshot | Package builder total is 75: 21 production and 54 tests/type tests |
| Final parallel shell wrapper over-escaped app/docs, plan, and snapshot patterns | 1 | Re-run the literal shell patterns without nested escaping | Exact results are 22 app/docs calls, one active-plan call excluding this audit's evidence mention, and a non-empty source hash |
| Final capability classifier compared a relative Core path with an absolute-path suffix | 1 | Match the exact relative path and exclude `*.slow.*` alongside tests | Exact result is 28 targeted calls: 12 migrations and 16 legitimate boundaries across 1,289 production files |

Verification evidence:

- `/Users/zbeyens/git/plate-2`: Babel package-source builder scan: 1,754/1,754
  parsed, 58 source-tree builder calls, zero parse failures.
- `/Users/zbeyens/git/plate-2`: full package builder audit: 75 actual calls,
  split 21 production / 54 tests and type tests.
- `/Users/zbeyens/git/plate-2`: capability AST scan: 1,289 production files,
  28 targeted calls, exactly 12 plugin-contract ferries and 16 legitimate
  editor/value boundaries.
- `/Users/zbeyens/git/plate-2`: app/current-content scan: 22 relevant calls.
- `/Users/zbeyens/git/plate-2`: active-plan scan: one stale
  `BaseLinkPluginDefinition` `.extend<T>` call.
- `/Users/zbeyens/git/plate-2`: independently reviewed package-source
  snapshot:
  `sha256:8ea2f9c31a0304abf6d5b762ce3ceff23fb0dc926eb38b0127f9187cd1e117bd`.
- Fresh current Core build passed. An isolated Media factory shadow using the
  required `initialState`/`store` names passed TS7 and `tsdown` declaration
  emit without its inner output generic; the exact key-correlated return stayed
  finite and contained no `any`. Full Media emit is independently blocked by
  its unfinished Core state-API adoption. DOM base config removal exposed Core
  derivation cycles.
- `pnpm exec prettier --check
docs/analysis/manual-plugin-generics-audit.md
docs/plans/2026-07-26-audit-manual-plugin-generics.md` passed.
- Independent corrected-artifact review returned CLEAN.
- `node tooling/scripts/check-plate-schema-adoption.mjs` ran and stopped on
  unrelated live `NodeIdPlugin.ts:694` state-factory access; no package source
  repair is authorized in this audit.
- `node .agents/skills/autogoal/scripts/check-complete.mjs
docs/plans/2026-07-26-audit-manual-plugin-generics.md` passed.

Final handoff contract:

- Recommendation: remove output shadow generics first; add one field-level
  option-domain authoring path; migrate option-heavy constructors second; keep
  only external/bootstrap/proof generics.
- Confidence: high; exact counted inventory plus independent lane audits.
- Evidence: `docs/analysis/manual-plugin-generics-audit.md`.
- Tests / commands: static AST/lexical audit, scoped formatting, and goal
  checker passed.
- Browser proof: N/A; type/API review with no runtime or UI change.
- PR / tracker: N/A; no git/tracker operation requested.
- Caveats: line numbers follow the live shared checkout; package adoption must
  rebuild Core first and prove declaration emit.
- Next owner: `plate-plan` for Core option-domain authoring and ordered package
  adoption.

Timeline:

- 2026-07-26T21:07:30.597Z Major-task goal plan created.
- 2026-07-26 Requirements captured; analytical-only scope and zero package-src edits locked.
- 2026-07-26 Builder, capability, app/docs, and test manifests reconciled.
- 2026-07-26 Durable report written; independent artifact review started.
- 2026-07-26 Generated-file contamination and three test classifications
  corrected; Media proof refreshed against current Core.
- 2026-07-26 Independent corrected-artifact review returned CLEAN.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Hand off the migration ledger |
| What is the goal? | Produce an exhaustive migration ledger without package source edits |
| What have I learned? | Output generics are debt; option-domain, external-factory, bootstrap, and explicit-proof generics need different treatment |
| What have I done? | Classified 109 current calls plus one active-plan row and wrote the report |

Open risks:

- Actual migration can expose declaration-emit inference bugs; those belong to
  Core rather than package-local shadow types.
- The shared tree is mid-`initialState`/`store` adoption, so line numbers and
  package buildability can move; the final manifest reflects the snapshot
  audited here.
