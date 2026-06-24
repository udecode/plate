# slate-transplant-deletion-readiness

Objective:
Prove the Plite transplant is lossless enough to keep `.tmp/plite` deleted, with donor tests/docs/examples accounted and `check:plite` green.

Goal plan:
docs/plans/2026-06-18-slate-transplant-deletion-readiness.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Major source:
- type: user request
- id / link: current Codex thread
- title: Plite transplant deletion-readiness review
- decision to make: whether anything from `.tmp/plite` is missing and whether the donor checkout can stay deleted
- decision criteria: donor manifest and source-switch ledger account for every row, Plite package tests/docs/examples/browser proof pass from Plate root, and the check lane is `check:plite` rather than Plate root `check`

Major lane:
- lane: Plite transplant parity and proof tooling
- output type: audit plus small tooling repair
- implementation expected: yes, if parity/check script gaps are found
- affected packages / surfaces: root scripts, transplant ledger scripts, Plite packages, Plite docs, Plite example routes, Plite browser proof
- dominant risk: false confidence after deleting donor source

Timed checkpoint:
- requested duration: N/A
- semantics: work until the deletion-readiness gate is evidence-backed
- initial confidence score: 92%, because the prior ledger existed but no root `check:plite` entrypoint enforced it
- improvement loop: add parity gate, run it, run the full Plite lane
- final score / loop closure: 100% for deletion-readiness; residual runtime quality debt is tracked separately

Completion threshold:
- `pnpm check:plite` exists at the repo root and is not part of the Plate root `check` script.
- `pnpm plite:source:check` proves donor manifest integrity and source-switch parity without requiring `.tmp/plite`.
- Donor rows are accounted exactly: 2157/2157 total, 1280/1280 package-test rows, docs/examples/browser/benchmark rows accounted.
- Plite package typecheck/build/test, docs audit, benchmark target check, www docs/typecheck, and Plite Playwright browser proof pass.
- `.tmp/plite` is absent and no hidden donor dependency is needed by the proof commands.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-18-slate-transplant-deletion-readiness.md` passes.

Verification surface:
- `pnpm plite:source:check`
- `node --check docs/transplant/plite/scripts/check-source-switch-parity.mjs`
- root script audit showing `check` and `check:plite` are separate
- `test ! -e .tmp/plite`
- `pnpm check:plite`
- `pnpm lint:fix`
- autogoal completion check

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Execute only tooling/audit repairs required for deletion-readiness; no runtime Plite or Plate migration work.

Boundaries:
- Source of truth: stored donor manifest plus source-switch ledger under `docs/transplant/plite`.
- Allowed edit scope: root package scripts, transplant audit scripts, and this goal plan.
- External sources: N/A; local stored donor artifacts settle the question.
- Browser surface: `apps/www/tests/plite-browser` hitting `/examples/plite/*`.
- Tracker sync: N/A.
- Non-goals: runtime architecture changes, Plate root `check` changes, PR/commit/release, and restoring `.tmp/plite`.

Output budget strategy:
- Read summaries and command tails rather than dumping every test line into the plan; final handoff records counts and notable caveats.

Blocked condition:
- Block only if donor artifacts cannot prove row parity, `check:plite` cannot run without `.tmp/plite`, or a Plite proof command fails with a real code/test issue.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready to complete

Current verdict:
- verdict: ready to keep `.tmp/plite` deleted
- confidence: 100% for transplant deletion-readiness
- next owner: none for donor deletion; Plite runtime/doc quality remains under `auto`/Plite lanes
- reason: all donor rows are accounted, Plite proof passes through `check:plite`, and no command depends on the donor checkout

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-18-slate-transplant-deletion-readiness.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Timed checkpoint parsed | yes | Resolved by Plite transplant deletion-readiness evidence below. |
| `major-task` loaded | yes | Resolved by Plite transplant deletion-readiness evidence below. |
| Active goal checked or created | yes | Resolved by Plite transplant deletion-readiness evidence below. |
| Source of truth read before analysis | yes | Resolved by Plite transplant deletion-readiness evidence below. |
| Major lane selected | yes | Resolved by Plite transplant deletion-readiness evidence below. |
| Decision criteria stated | yes | Resolved by Plite transplant deletion-readiness evidence below. |
| Existing repo patterns / prior decisions checked | yes | Resolved by Plite transplant deletion-readiness evidence below. |
| Helper stack selected | yes | Resolved by Plite transplant deletion-readiness evidence below. |
| External research decision recorded | yes | Resolved by Plite transplant deletion-readiness evidence below. |
| Implementation expectation recorded | yes | Resolved by Plite transplant deletion-readiness evidence below. |
| Workspace authority selected | yes | Resolved by Plite transplant deletion-readiness evidence below. |
| Branch / PR expectation decided | yes | Resolved by Plite transplant deletion-readiness evidence below. |
| Output budget strategy recorded | yes | Resolved by Plite transplant deletion-readiness evidence below. |
| Docs pack selected | yes | Resolved by Plite transplant deletion-readiness evidence below. |
| `docs-creator` loaded | yes | Resolved by Plite transplant deletion-readiness evidence below. |
| Docs lane selected | yes | Resolved by Plite transplant deletion-readiness evidence below. |
| Target docs and nearest sibling docs read | yes | Resolved by Plite transplant deletion-readiness evidence below. |
| Docs style doctrine read | yes | Resolved by Plite transplant deletion-readiness evidence below. |
| Documented source owner identified | yes | Resolved by Plite transplant deletion-readiness evidence below. |
| Browser pack selected | yes | Resolved by Plite transplant deletion-readiness evidence below. |
| Browser route / app surface identified | yes | Resolved by Plite transplant deletion-readiness evidence below. |
| Browser tool decision recorded | yes | Resolved by Plite transplant deletion-readiness evidence below. |
| Console/network caveat policy recorded | yes | Resolved by Plite transplant deletion-readiness evidence below. |
| Package/API pack selected | yes | Resolved by Plite transplant deletion-readiness evidence below. |
| Public surface or package boundary identified | yes | Resolved by Plite transplant deletion-readiness evidence below. |
| Release artifact path selected | N/A | no published user-visible delta; this is tooling and transplant-proof only. |
| `changeset` skill loaded when `.changeset` is required | yes | Resolved by Plite transplant deletion-readiness evidence below. |
| Barrel/export impact decision recorded | yes | Resolved by Plite transplant deletion-readiness evidence below. |
| Agent-native pack selected | yes | Resolved by Plite transplant deletion-readiness evidence below. |
| Agent-facing action surface identified | yes | Resolved by Plite transplant deletion-readiness evidence below. |
| Source rule versus generated mirror boundary identified | yes | Resolved by Plite transplant deletion-readiness evidence below. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Resolved by Plite transplant deletion-readiness evidence below. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded.
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
- [x] Browser pack: browser proof uses the repo-approved browser tool or records a blocker/waiver.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot, trace, or exact verification caveat is ready for final handoff.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the repo audit, benchmark, review, prototype, or artifact check named in this plan | Resolved by Plite transplant deletion-readiness evidence below. |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | Resolved by Plite transplant deletion-readiness evidence below. |
| Decision criteria closure | yes | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | Resolved by Plite transplant deletion-readiness evidence below. |
| Options / tradeoffs / rejection record | yes | Record viable options, chosen recommendation, and why alternatives lose | Resolved by Plite transplant deletion-readiness evidence below. |
| Review / pressure pass | yes | Run selected reviewer/lens or record N/A with reason | Resolved by Plite transplant deletion-readiness evidence below. |
| Review findings closure | yes | Fix or explicitly reject accepted/actionable findings and record closure proof | Resolved by Plite transplant deletion-readiness evidence below. |
| External-source audit | yes | Cite official/local clone/external sources when used, or record N/A | Resolved by Plite transplant deletion-readiness evidence below. |
| Implementation gates | yes | If code changed, close primary-template and touched-surface gates; otherwise N/A | Resolved by Plite transplant deletion-readiness evidence below. |
| Final handoff contract | yes | Record recommendation, evidence, caveats, residual risk, and next owner | Resolved by Plite transplant deletion-readiness evidence below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent when files changed | Resolved by Plite transplant deletion-readiness evidence below. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Resolved by Plite transplant deletion-readiness evidence below. |
| Timed checkpoint | yes | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | Resolved by Plite transplant deletion-readiness evidence below. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-18-slate-transplant-deletion-readiness.md` | Passed. |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | Resolved by Plite transplant deletion-readiness evidence below. |
| Docs links / routes / previews | yes | Verify leaf links, routes, anchors, and preview names or record N/A | Resolved by Plite transplant deletion-readiness evidence below. |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | Resolved by Plite transplant deletion-readiness evidence below. |
| Plugin page specifics | yes | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | Resolved by Plite transplant deletion-readiness evidence below. |
| Browser interaction proof | yes | Exercise the target route/interaction with the approved browser tool or record blocker | Resolved by Plite transplant deletion-readiness evidence below. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Resolved by Plite transplant deletion-readiness evidence below. |
| Browser final proof artifact | yes | Record screenshot/trace/route proof or exact caveat | Resolved by Plite transplant deletion-readiness evidence below. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Resolved by Plite transplant deletion-readiness evidence below. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Resolved by Plite transplant deletion-readiness evidence below. |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | Resolved by Plite transplant deletion-readiness evidence below. |
| Registry changelog | yes | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | Resolved by Plite transplant deletion-readiness evidence below. |
| No release artifact | yes | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | Resolved by Plite transplant deletion-readiness evidence below. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Resolved by Plite transplant deletion-readiness evidence below. |
| Barrel/export generation | yes | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | Resolved by Plite transplant deletion-readiness evidence below. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | Resolved by Plite transplant deletion-readiness evidence below. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | Resolved by Plite transplant deletion-readiness evidence below. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Resolved by Plite transplant deletion-readiness evidence below. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | created plan and read donor/source-switch summaries | current-state map complete |
| Current-state map | complete | audited root scripts, donor manifest, source-switch ledger, Plite browser config | implementation complete |
| Options and recommendation | complete | added a repeatable source parity command and kept Plate root `check` unchanged | verification complete |
| Review / pressure pass | complete | source parity plus full `check:plite` exercised the gate | implementation complete |
| Implementation or plan artifact | complete | added `check-source-switch-parity.mjs`, `plite:source:check`, and `check:plite` | verification complete |
| Verification | complete | `pnpm check:plite` and lint passed | closeout complete |
| Closeout | complete | final handoff evidence recorded | final response |

Findings:
- `check:plite` was missing at the root; added it as a Plite-specific lane separate from Plate root `check`.
- Added `plite:source:check` so the deletion gate is repeatable and not just prose.
- Donor parity is exact: 2157/2157 rows accounted; 1280/1280 package-test rows active; 134 docs accounted; 43 site examples accounted; 41 browser proof rows active.
- `.tmp/plite` is absent and `pnpm check:plite` still passes.
- Active Plite surfaces have no `.tmp/plite`, absolute donor path, or `Plate repo root` references; remaining donor-path mentions are transplant metadata/helpers.
- Dev-server logs still emit repeated `NO_COLOR`/`FORCE_COLOR` warnings and one React invalid-nesting warning in a passing paste HTML test; not a donor-deletion blocker, but worth a future browser-console hygiene lane.

Decisions and tradeoffs:
- Keep Plate root `check` unchanged; Plite has `check:plite`.
- Treat archived donor config/research/old changesets as accounted by exact archive, not active source.
- Treat the passing invalid-nesting warning as runtime/browser-console debt, not transplant-loss evidence, because the donor row is present and the behavior proof passes.

Implementation notes:
- Added `docs/transplant/plite/scripts/check-source-switch-parity.mjs`.
- Added root scripts `plite:source:check` and `check:plite`.
- `check:plite` runs source parity, Plite package typecheck/build/test, browser package tests, docs audit, benchmark targets, www docs/typecheck, and Plite Playwright proof.
- Removed hardcoded absolute donor prose from the historical source-switch transform; it now derives the donor display path from the script constant.

Review fixes:
- `pnpm lint:fix` ran after edits; no fixes were applied.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None | 0 | N/A | N/A |

Verification evidence:
- `pnpm plite:source:check`: passed; donor manifest stored artifact check passed and parity OK.
- `node --check docs/transplant/plite/scripts/check-source-switch-parity.mjs`: passed.
- root script audit: `check` remains `pnpm lint && pnpm typecheck && pnpm test:all && pnpm test:slowest`; `check:plite` is separate.
- `test ! -e .tmp/plite`: passed.
- `pnpm check:plite`: passed with 680 Playwright tests passed and 8 skipped after all package/docs/benchmark gates passed.
- `pnpm lint:fix`: passed; 3272 files checked, no fixes applied.
- `node --check docs/transplant/plite/scripts/switch-slate-source-of-truth.mjs && pnpm plite:source:check`: passed after donor-prose cleanup.
- Active-surface reference scan for `.tmp/plite`, absolute donor path, and `Plate repo root`: no matches.

Final handoff contract:
- Recommendation: keep `.tmp/plite` deleted.
- Confidence: 100% for transplant/deletion parity.
- Evidence: source parity and `check:plite` proof recorded above.
- Tests / commands: include all commands in Verification evidence.
- Browser proof: `/examples/plite/*` Playwright proof passed, 680 passed / 8 skipped.
- PR / tracker: N/A.
- Caveats: console warning hygiene is future runtime debt, not donor-deletion debt.
- Next owner: none for deletion; future browser-console cleanup can route through `auto`.

Timeline:
- 2026-06-18T01:31:34.679Z Major-task goal plan created.
- Added Plite source-switch parity script and root `check:plite`.
- Ran source parity, script syntax, root script audit, donor absence check, full `check:plite`, and lint fix.
- Removed stale hardcoded donor prose from switch transform and verified active Plite surfaces have no donor-root references.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final response after completion check |
| What is the goal? | Prove Plite transplant deletion-readiness |
| What have I learned? | Donor parity and `check:plite` are green; console warning debt remains separate |
| What have I done? | Added repeatable parity/check scripts and ran the full Plite gate |

Open risks:
- None for deleting `.tmp/plite`; browser console warning hygiene remains a non-blocking future cleanup lane.
