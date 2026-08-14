# Complete Slate audit planning handoff

Objective:
Complete Slate audit planning handoff; done when every relevant row is routed,
material dossiers and Best API verdicts are complete, and validators pass.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-08-14-complete-slate-audit-planning-handoff.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)

Major source:
- type: existing editor-audit and issue/test-harvest artifacts
- id / link: `slate-regression-proof-2026-08-14`
- title: Slate regression-proof audit at `ec793483ada7f7e21ebc82c2b3aa9ea674605ce3`
- decision to make: turn the completed source/test/issue audit into the
  decision-ready planning handoff required by `editor-audit`
- decision criteria: all 23 non-`invalid-skip` issue/PR rows and all strict
  matrix concepts close as keep, reject, evidence-backed defer, or one ordered
  packet; each P0-P3 packet has the eight-field dossier; unresolved public
  shapes pass `best-api`

Major lane:
- lane: architecture and public API, planning only
- output type: repaired audit conclusion, Best API review, material dossiers,
  and dependency-ordered packet handoff
- implementation expected: no; stop for user acceptance before `plite-plan`,
  `plate-plan`, `patch`, or runtime/package work
- affected packages / surfaces: `docs/editor-audits/**`,
  `docs/editor-issue-harvester/slate/**`,
  `docs/editor-test-harvester/slate/**`, and
  `docs/plans/artifacts/slate-regression-proof-audit/**`
- dominant risk: presenting a harvested inventory as complete while leaving
  public shapes, material debt, or tracker rows without an explicit route

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A; none requested
- semantics: N/A; artifact thresholds control completion
- initial confidence score: N/A; exact row and validator thresholds are stronger
- improvement loop: close coverage, pressure public shapes, validate artifacts
- final score / loop closure: N/A; record exact counts and zero unresolved rows

Completion threshold:
- All 23 non-`invalid-skip` changed/new Slate issue/PR rows have an exact route.
- Every strict-matrix concept has one terminal keep/reject/defer/packet route.
- Every accepted material P0-P3 candidate has all eight required dossier
  fields; non-material rows cannot masquerade as low-priority work.
- `best-api` gives one verdict for every unresolved public call shape, with
  exact imports/call sites, deletion impact, laws, proof, and next owner.
- The audit contains exact count-and-ID conclusions, strongest local keeps,
  rejected machinery, evidence gates, accepted shapes, invariants, ownership,
  adoption/deletion impact, dependency order, and per-packet routing.
- The strict matrix, JSON/link checks, focused artifact checks, lint, and this
  goal-plan checker pass with zero unresolved routing rows.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-14-complete-slate-audit-planning-handoff.md`
  passes.

Verification surface:
- Artifacts: `audit-report.md`, `planning-handoff.md`,
  `public-api-review.md`, `material-dossiers.md`, manifest, matrix, and receipt
  under `docs/plans/artifacts/slate-regression-proof-audit/`.
- Source audit: current Plite/Plate public types, exports, implementation,
  production call sites, tests, Vision doctrine, and the registered local Slate
  checkout at the immutable audited commit.
- Mechanical proof: strict concept-matrix validator, JSON parsers, artifact-link
  checks, exact tracker-routing count check, `pnpm lint:fix`, and this plan's
  `check-complete.mjs`.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Do not execute implementation unless this major goal explicitly includes it.

Boundaries:
- Source of truth: current repo source and Vision, registered local Slate source
  at `ec793483ada7f7e21ebc82c2b3aa9ea674605ce3`, and the completed current
  issue/test ledgers; older plans are leads only.
- Allowed edit scope: the existing Slate audit artifacts, audit registry,
  current issue/test report links when closure needs it, and this plan.
- External sources: no new web research; GitHub facts come from the already
  refreshed durable tracker ledger and local Slate checkout.
- Browser surface: N/A; this is planning-only and changes no runtime/UI surface.
- Tracker sync: read-only; no GitHub comments, issue changes, PRs, or cursor
  advancement unless an owning proof is rerun successfully.
- Non-goals: runtime/package implementation, layer-plan execution, benchmark
  implementation, branch/commit/push/PR, or public GitHub mutation.

Output budget strategy:
- Read exact source files and bounded `rg` matches only; use JSON/TSV queries for
  tracker counts; cap shell output; keep complete mappings in artifacts instead
  of streaming generated ledgers; exclude dependency/build/generated trees.

Blocked condition:
- Stop only if the registered Slate source moved or became dirty, an artifact
  cannot be reconciled to its immutable cursor, or source evidence cannot settle
  a public shape without a product decision. Evidence-backed implementation or
  device gates remain explicit defers and do not block the planning handoff.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: completed
- next_phase: user acceptance
- goal_status: complete

Current verdict:
- verdict: the previous audit stopped before its mandatory planning handoff;
  the repaired artifact accepts one P1 equality packet and rejects a Slate
  delta mega plan
- confidence: high; source, matrix, tracker, Best API, focused tests, and the
  registered transaction benchmark agree
- next owner: user acceptance, then `plite-plan` for `EQ-P1` only
- reason: all 54 tracker rows and all 16 atomic concepts have terminal routes;
  no other candidate has both material value and adequate evidence

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-14-complete-slate-audit-planning-handoff.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User requires the existing editor audit to always end in a plan; `Go` authorizes artifact repair, not runtime implementation. Exact thresholds and non-goals are above. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| `major-task` loaded | yes | `.agents/skills/major-task/SKILL.md` read completely. |
| Active goal checked or created | yes | `get_goal` returned null; active goal created with this plan path. |
| Source of truth read before analysis | yes | Existing audit, manifest, matrix, receipt, registry, and current issue/test harvest were completed and verified in the immediately preceding audit run; current source re-audit remains a work row. |
| Major lane selected | yes | Architecture/public-API planning only. |
| Decision criteria stated | yes | Exact 23-row, concept, dossier, Best API, and validator thresholds above. |
| Existing repo patterns / prior decisions checked | yes | Current audit artifacts and prior Slate review doctrine were checked; live source remains authoritative. |
| Helper stack selected | yes | `editor-audit` primary, `best-api` public-shape lens, `autogoal` lifecycle, `major-task` plan shell, `docs-creator` artifact prose. |
| External research decision recorded | no | N/A: refreshed local/durable evidence is sufficient; no new web claims. |
| Implementation expectation recorded | yes | No product implementation or layer plan under this goal. |
| Workspace authority selected | yes | `/Users/zbeyens/git/plate-2` owns local artifacts and Plite/Plate source; registered local Slate checkout owns donor evidence. |
| Branch / PR expectation decided | no | N/A: no branch, commit, push, PR, or tracker mutation. |
| Output budget strategy recorded | yes | Exact-file reads, capped searches, JSON/TSV counts, generated mappings saved to artifacts. |
| Docs pack selected | yes | Supporting docs artifact work under the major-task primary template. |
| `docs-creator` loaded | yes | `.agents/skills/docs-creator/SKILL.md` read completely. |
| Docs lane selected | yes | Spec/law/behavior audit artifact. |
| Target docs and nearest sibling docs read | yes | Target audit/report, manifest/matrix/receipt, issue report, and test-harvest reports are the owning neighborhood. |
| Docs style doctrine read | yes | `docs-creator` technical prose and spec/law lane rules loaded. |
| Documented source owner identified | yes | `editor-audit` owns the decision artifact; `best-api` owns public call-shape verdicts. |

Work Checklist:
- [x] N/A: no duration was requested; artifact thresholds replace a confidence score.
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
- [x] N/A: no new external research; the refreshed local Slate checkout and
      durable GitHub ledger are sufficient authorities.
- [x] Options, recommendation, tradeoffs, blast radius, and rejection reasons
      are recorded.
- [x] Facts, inference, and recommendation are separated.
- [x] Review or pressure lenses are selected and completed, or marked N/A with
      reason.
- [x] N/A: no product implementation; docs pack covers the changed audit artifacts.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Output budget discipline recorded and followed so far: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Accepted/actionable review findings are fixed or explicitly rejected with
      evidence.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links and anchors target real leaf artifacts; N/A for routes and previews because no product docs or UI changed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the repo audit, benchmark, review, prototype, or artifact check named in this plan | Strict matrix is 16/16 with zero integrity errors; tracker ledger is 54/54 with zero unchecked; routing check is 23 relevant plus 31 skips with zero unowned. |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | `audit-report.md`, matrix rows, API review, and material dossier name the current Slate, Plite, Plate, test, and planning owners. |
| Decision criteria closure | yes | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | One P1 packet, 12 keep-local routes, 1 reject-reference route, 9 evidence-backed defers, and 31 inspected skips close all rows. |
| Options / tradeoffs / rejection record | yes | Record viable options, chosen recommendation, and why alternatives lose | `planning-handoff.md` records the accepted equality packet, strongest local mechanisms, rejected donor machinery, and six defer gate families. |
| Review / pressure pass | yes | Run selected reviewer/lens or record N/A with reason | Direct document review checked coherence, feasibility, scope, product fit, strongest objection, and proof gaps; `best-api` pressure closed #6003, #6083, and #6091. |
| Review findings closure | yes | Fix or explicitly reject accepted/actionable findings and record closure proof | Added four missing atomic concepts, fresh batching proof, exact tracker routes, one eight-field dossier, and terminal public-shape verdicts. |
| External-source audit | no | Cite official/local clone/external sources when used, or record N/A | N/A: no new external research; the clean registered local Slate checkout and refreshed durable tracker ledger own every reference claim. |
| Implementation gates | yes | If code changed, close primary-template and touched-surface gates; otherwise N/A | The only executable change is the matrix generator; regeneration plus the strict validator proves its 16-row output. N/A for package, browser, changeset, and runtime gates. |
| Final handoff contract | yes | Record recommendation, evidence, caveats, residual risk, and next owner | Recorded below and in `planning-handoff.md`; the next action is explicit user acceptance, then `plite-plan` for `EQ-P1` only. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent when files changed | `pnpm lint:fix` passed: 4,107 files checked, 15 pre-existing oversized-file warnings, zero errors. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | One benchmark emitted large sample arrays and hit the tool cap; the error table records the recovery, and all later reads used bounded `jq` projections. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration was requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-14-complete-slate-audit-planning-handoff.md` | This row is resolved by the final passing checker recorded in Verification evidence. |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | Public calls, internal owners, production consumer, tests, donor source, and line-level evidence are recorded in `public-api-review.md` and `material-dossiers.md`. |
| Docs links / routes / previews | yes | Verify leaf links, routes, anchors, and preview names or record N/A | Local Markdown link check passed across the four audit conclusion artifacts with zero broken paths; anchors were manually matched to owning headings. N/A for routes/previews. |
| Docs MDX/content parser | no | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | N/A: only internal Markdown/JSON/MJS audit artifacts changed; no `content/**` or MDX source changed. |
| Plugin page specifics | no | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | N/A: no plugin page changed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | Immutable cursor, harvested inventories, Vision owners, and current source inspected | Current-state map |
| Current-state map | completed | 54 tracker rows, 16 concepts, API owners, local proof, and one material gap mapped | Options |
| Options and recommendation | completed | One P1 packet selected; donor API, batching, fixture, and speculative ref machinery rejected or deferred | Review |
| Review / pressure pass | completed | Best API review and direct document pressure pass closed every finding | Plan artifact |
| Implementation or plan artifact | completed | Planning handoff, material dossier, API review, report, manifest/matrix, registry, and receipt repaired | Verification |
| Verification | completed | Strict validator, tracker classifier, focused tests, benchmark, route/JSON/link checks, and lint passed | Closeout |
| Closeout | completed | Audit stops at acceptance; no product implementation, layer plan, GitHub mutation, or git operation performed | User acceptance |

Findings:
- The existing audit is current and mechanically valid, but its conclusion does
  not yet satisfy `editor-audit`'s mandatory planning-handoff output contract.
- The workflow doctrine is already correct. The repair owner is the current
  audit artifact plus this goal plan, not `.agents/rules/editor-audit.mdc`.
- The completed issue delta contains 54 rows: 31 `invalid-skip` and 23 relevant
  rows (`covered`, `deferred`, or `needs-repro`) that require exact terminal
  planning routes.
- Four material decision boundaries were missing from the old 12-row matrix:
  explicit unset, transaction batching, selection origin, and mobile IME.
- Recursive nested-array equality is the only source-confirmed local behavior
  gap. Its public observer already has the ideal shape.
- Current Plite batching passed its registered strict benchmark, so closed/open
  Slate batching proposals do not earn a packet.

Decisions and tradeoffs:
- Use one ordered planning handoff, not a mega implementation plan. Material
  accepted work gets dossiers; weak evidence stays visibly deferred.
- Review public shapes with `best-api` before naming a layer-plan owner.
- Keep the current audit target and immutable cursor; repair coverage/conclusion
  rather than re-harvesting unchanged upstream state.
- Accept `EQ-P1` only: recursively compare JSON array members inside Plite's
  private equality owner while keeping `TextApi.equals` unchanged.
- Reject null-as-delete and editor augmentation. Explicit `nodes.unset` and
  descriptor-owned semantic commands are smaller, typed, and already proven.
- Defer native no-op and mobile IME claims until the exact browser/raw-device
  substrate is reproduced. Evidence gates beat speculative architecture.
- Reject a mega plan because fifteen concepts need no accepted implementation;
  bundling them would hide the one real gap and manufacture migration work.

Implementation notes:
- No runtime or package implementation was authorized or performed.
- The audit generator and registered artifacts were repaired together. The
  registry cursor remains the exact Slate commit
  `ec793483ada7f7e21ebc82c2b3aa9ea674605ce3`.
- `planning-handoff.md` is the terminal packet map; `material-dossiers.md`
  contains the one accepted P1 dossier; `public-api-review.md` closes public
  call-shape pressure.

Review fixes:
- Coherence: collapsed all material work into one packet and made every other
  row terminal instead of leaving a loose recommendation list.
- Feasibility: kept `EQ-P1` inside one private utility with no public migration.
- Scope: excluded runtime implementation, layer-plan execution, UI work, and
  public GitHub mutation.
- Product fit: preserved Plite's JSON-native model, typed mutation verbs,
  semantic command owner, and transaction laws.
- Strongest objection: array recursion could regress a hot equality path. The
  dossier therefore requires shallow p95 and finite nested-scaling proof.
- Proof gaps: native no-op and mobile IME remain closed behind exact browser or
  raw-device gates; #6003 remains closed until atomized.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Fresh transaction benchmark printed full sample arrays before the tool cap truncated them | 1 | Read only the generated JSON summary fields with `jq`; never stream the benchmark body again | Benchmark passed; concise ratios and publication count will be recorded in the receipt. |

Verification evidence:
- Slate authority: clean `../slate-audit` `main` at exact `origin/main`
  `ec793483ada7f7e21ebc82c2b3aa9ea674605ce3`.
- Strict matrix validator: 16 concepts, 16 rows, one P1, zero duplicate,
  grouped, missing, unknown, canned, or unresolved cells.
- Tracker classifier: 54 total, 7 issues, 47 PRs, 33 new, 21 materially
  updated; 12 covered, 7 deferred, 4 needs-repro, 31 invalid-skip.
- Planning-route check: 23 unique relevant rows, 31 unique skips, zero missing,
  extra, or unowned rows.
- Transaction benchmark: 200 iterations over 8 blocks; mixed-batch median ratio
  `0.7142857142857143`, p95 ratio `0.8284023668639053`, one batched publication
  versus five separate publications, snapshot parity enforced.
- Focused property mutation proof: 2 passed, 21 filtered, 0 failed.
- Artifact checks: four JSON files parsed; four conclusion docs have zero
  broken local Markdown paths.
- Lint: `pnpm lint:fix` passed over 4,107 files with 15 oversized-file warnings
  and zero errors.
- Goal checker: final passing command recorded after this plan update.

Final handoff contract:
- Recommendation: accept `EQ-P1` as the only implementation-planning candidate;
  do not create a Slate-delta mega plan.
- Confidence: high for the planning verdict; the one implementation candidate
  still needs its named layer plan and proof before any fix claim.
- Evidence: immutable Slate cursor, exhaustive test inventory, complete tracker
  delta, 16-row strict matrix, Best API review, material dossier, focused local
  tests, and measured transaction proof.
- Tests / commands: strict matrix validator, tracker classifier, source checkout
  assertion, transaction benchmark, focused set/unset tests, route check, JSON
  parse, local-link check, lint, and goal checker.
- Browser proof: N/A for this planning-only artifact; existing browser rows are
  cited only for covered behaviors. Native/mobile claims remain deferred.
- PR / tracker: no PR, comment, issue mutation, commit, push, or cursor sync was
  performed in this planning repair.
- Caveats: the audit does not transplant all 1,254 upstream identities; open
  PRs can change; raw-device behavior is still unproved; #6003 is non-atomic.
- Next owner: explicit user acceptance, then `plite-plan` for `EQ-P1` only.

Timeline:
- 2026-08-14T12:19:43.948Z Major-task goal plan created.
- 2026-08-14 Active goal created; requirements, boundaries, helper stack, and
  exact closure thresholds recorded before artifact edits.
- 2026-08-14 Strict matrix expanded from 12 to 16 atomic concepts and passed.
- 2026-08-14 Best API review rejected donor API changes; one P1 material
  dossier and exact 54-row planning closure added.
- 2026-08-14 Focused tests, transaction benchmark, route/JSON/link checks, and
  lint passed; audit stopped at user acceptance.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Planning audit closeout |
| Where am I going? | User acceptance, then a separate `plite-plan` only if authorized |
| What is the goal? | Complete the missing editor-audit planning handoff and stop for acceptance. |
| What have I learned? | The doctrine was correct; the artifact missed four concepts and its mandatory packet handoff. Only nested-array equality is material. |
| What have I done? | Closed all 54 tracker rows and 16 concepts, settled public shapes, wrote the P1 dossier, validated proof, and stopped before implementation. |

Open risks:
- `EQ-P1` is planning evidence, not implementation proof. Its recursive JSON
  law, property/fuzz suite, and hot-path budget remain for `plite-plan` and the
  later execution owner.
- #6084 and #6096 remain open and can change; Android/iPhone/Firefox Android
  behavior remains unproved without the raw-device lane.
- The tracker cursor is a checked-at timestamp. A future sync must hydrate rows
  whose `updated_at` advances.
- #6003 remains deliberately unplanned until it is split into atomic public API
  questions.
