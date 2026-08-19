# standalone regression skill

Objective:
Create the standalone Regression skill linked from `auto regression`; done when
source rule, reference, template, validator, routing, generated mirrors,
focused tests, forward test, and agent-native review pass.

Goal plan:
docs/plans/2026-08-17-auto-regression-methodology.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Major source:
- type: direct user request plus evidence from the stopped rewrite-harness pilot
- id / link: current conversation; reusable owner is `auto`, not the pilot plan
- title: Final self-improving regression methodology
- decision to make: create a durable master workflow without duplicating the
  existing `auto` supervisor or `patch` one-bug owner
- decision criteria: discoverable routing, route readiness, atomic cases,
  honest reproduction, regression fix delegation, proof closure,
  keep/revert/quarantine, mechanical ledger validation, canonical goal gates,
  and a mandatory methodology delta after every packet

Major lane:
- lane: agent workflow architecture and implementation
- output type: standalone `regression` skill plus bundled methodology,
  template, validator, and `auto regression` routing
- implementation expected: yes; source rules/resources only, then generated mirror sync
- affected packages / surfaces: `.agents/rules/regression.mdc`, Regression
  references/scripts, `.agents/rules/auto.mdc`,
  `docs/plans/templates/regression.md`, `.agents/rules/patch.mdc`,
  `.agents/AGENTS.md`, generated skill mirrors, focused rule/script/template tests
- dominant risk: creating a duplicate wrapper instead of a distinct owner,
  freezing one pilot into doctrine,
  or shipping prose that cannot detect false-green plans and stale proof hosts

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: no timebox
- initial confidence score: N/A; binary artifact and forward-test gates apply
- improvement loop: implement, sync, validate, forward-test with a fresh worker,
  repair accepted findings, then rerun agent-native review
- final score / loop closure: N/A; all required gates must pass

Completion threshold:
- `regression` is one discoverable standalone master skill;
  `auto regression` routes into it without retaining duplicate methodology;
  `patch` remains the sole one-bug repair worker.
- The methodology is reusable and contains no pilot-specific route, case,
  blocker, file list, or result.
- Every run owns route/host readiness, case identity/provenance, risk and test
  decision, reproduction, owner classification, red proof when possible,
  delegated fix, focused/browser verification, stability proof, packet
  decision, and methodology self-repair/no-change evidence.
- A dedicated `regression` template keeps every required completion item
  in canonical Work Checklist and Completion Gates sections.
- A deterministic validator rejects malformed, duplicate, unscored, stale, or
  completion-ineligible regression-ledger rows and has focused tests.
- Source and generated mirrors match after `pnpm install`; rule/resource tests,
  template smoke, fresh forward test, agent-native review, and final
  `check-complete` pass.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-17-auto-regression-methodology.md`
  passes.

Verification surface:
- Source audit proving no new overlapping skill folder and correct
  `auto`/`patch` routing.
- Focused Node tests for the regression-ledger validator.
- An unfinished generated/smoke regression plan must fail `check-complete`;
  a completed fixture must pass without editing the template.
- `pnpm install` plus source/generated `rg` and file parity audits.
- Fresh Sol worker forward-test on a generic regression request without pilot
  conclusions or expected answer.
- Agent-native review and P2 autoreview of the actual current diff.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Implementation is explicitly authorized.
- Do not duplicate `auto` or `patch`; standalone `regression` must own the
  distinct master ledger/methodology job and Auto must route rather than copy.
- Do not put the prior pilot plan, route, case, blocker, or result in reusable
  skill content.
- Do not hand-edit `.agents/skills/**/SKILL.md`; change source rules/resources
  and run `pnpm install`.
- Do not change product/runtime behavior, public APIs, examples, or registry
  generated output.
- Keep the main `auto` body compact; load the detailed regression methodology
  only when regression mode runs.

Boundaries:
- Source of truth: `.agents/rules/auto.mdc`, `.agents/rules/patch.mdc`,
  `.agents/AGENTS.md`, autogoal template contract, current generated mirrors,
  and the user's latest methodology requirements.
- Allowed edit scope: source rules/resources, one project template, validator
  tests, generated agent mirrors/sync metadata produced by `pnpm install`, and
  this plan.
- External sources: N/A; repo evidence settles ownership and workflow.
- Browser surface: no product Browser proof; forward test may reason from a
  synthetic/local regression packet without changing product code.
- Tracker sync: N/A.
- Non-goals: product bug repair, broad case harvest, release/PR work, a new
  public package, pilot continuation, or frozen product taste in the skill.

Output budget strategy:
- Read exact rule/template/script owners. Count/search filenames before
  printing broad matches. Cap generated mirror audits to affected skills and
  save forward-test evidence in the plan instead of streaming transcripts.

Blocked condition:
- Block only if source-to-mirror generation cannot preserve the new mode or a
  fresh worker proves the method cannot route/verify a regression without
  duplicating `patch`. Repair source/template/script failures before blocking.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: review-rerun-blocked
- next_phase: rerun final P2 autoreview and fresh-worker forward test after account usage resets
- goal_status: active; implementation/deterministic proof complete, independent review gates blocked externally
- implementation_child: `01a00f38-7bc7-76d0-bae1-9745feb6f5d2`
  (`auto regression methodology implementation`), Sol-high, local checkout,
  no worktree, archived after implementation handoff
- forward_test_child: `01a00f52-ea85-7ef2-ab22-7fcbd05ba1ea`
  (`forward test auto regression`), Sol-medium, rejected before execution by
  the account-wide Codex usage limit, archived

Current verdict:
- verdict: create standalone `regression`; keep `auto` as a route only
- confidence: source-backed
- next owner: one durable Sol-high implementation task, then fresh forward-test task
- reason: the user explicitly requires a separate master owner; moving the
  method avoids duplicate Auto/Regression implementations while `patch` keeps
  one-case ownership

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-17-auto-regression-methodology.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Every explicit requirement and non-goal is recorded above. |
| Timed checkpoint parsed | N/A | No duration requested. |
| `major-task` loaded | yes | Read completely before implementation routing. |
| Active goal checked or created | yes | `create_goal` attached this implementation task to this plan. |
| Source of truth read before analysis | yes | Read full `skill-creator`, `auto`, `patch`, `agent-native-reviewer`, root routing, and current templates/resources. |
| Major lane selected | yes | Agent workflow architecture plus implementation. |
| Decision criteria stated | yes | Completion threshold above. |
| Existing repo patterns / prior decisions checked | yes | `regression` owns the distinct master methodology, `auto` routes, and `patch` owns one bug; duplicate implementations are forbidden. |
| Helper stack selected | yes | `skill-creator`, `major-task`, `agent-native-reviewer`, autogoal plan/template, P2 autoreview after implementation. |
| External research decision recorded | N/A | Repo evidence settles the design. |
| Implementation expectation recorded | yes | Source rules/reference/template/validator/tests plus mirror sync. |
| Workspace authority selected | yes | `/Users/zbeyens/git/plate-2`, current checkout as-is. |
| Branch / PR expectation decided | N/A | No commit, push, branch, or PR requested. |
| Output budget strategy recorded | yes | Exact-owner reads and capped audits only. |
| Agent-native pack selected | yes | Skill, routing, template, and command behavior change. |
| Agent-facing action surface identified | yes | Direct `regression <bug|surface|corpus>` plus ergonomic `auto regression ...` routing. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**`; `pnpm install` regenerates `.agents/skills/**`; never hand-edit mirrors. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Read completely; final parity map required. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; N/A: no duration was requested.
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
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | blocked | Deterministic proof passes; rerun final clean P2 review and fresh-worker exercise | Both Codex review routes reached the account usage limit until 2026-08-20 05:29. |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | Regression/Auto/Patch ownership, resource sync owner, canonical template, and generated mirrors audited. |
| Decision criteria closure | blocked | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | Deterministic criteria pass; the required clean P2 rerun and fresh-worker exercise are externally unavailable. |
| Options / tradeoffs / rejection record | yes | Record viable options, chosen recommendation, and why alternatives lose | Standalone Regression chosen by user correction; duplicate Auto implementation, broad Patch supervisor, and frozen run facts rejected. |
| Review / pressure pass | yes | Run selected reviewer/lens or record N/A with reason | P2 review returned five actionable findings; agent-native review passed after fixes. |
| Review findings closure | yes | Fix or explicitly reject accepted/actionable findings and record closure proof | All five P2 findings accepted and fixed; standalone extraction hardening passes 18 focused tests. |
| External-source audit | N/A | Cite official/local clone/external sources when used, or record N/A | Repo sources settle the workflow; no external claims used. |
| Implementation gates | yes | If code changed, close primary-template and touched-surface gates; otherwise N/A | Source scripts, template smoke, sync, mirror parity, routing, and no-pilot audits pass. |
| Final handoff contract | yes | Record recommendation, evidence, caveats, residual risk, and next owner | Recorded below with exact fresh-worker prompt. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent when files changed | Scoped Biome write/check passed on all changed executable scripts. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Reads/searches stayed exact/capped; review bundle was narrowed to an 81 KB focused patch. |
| Timed checkpoint | N/A | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | No duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-17-auto-regression-methodology.md` | pending |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | Final `pnpm install`, resource `--check`, body comparisons, and Codex/Claude resource comparisons pass. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | Direct Regression skill, Auto route, Patch handoff, template, validator, and generated resources are discoverable. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | PASS; capability map below has no remaining gap. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Governing skills and accepted plan read. | current-state map |
| Current-state map | complete | Auto supervisor and Patch one-case ownership confirmed; frozen pilot-plan dependency found in Patch. | options |
| Options and recommendation | complete | User correction chose standalone Regression; Auto is routing only and Patch remains the worker. | implementation |
| Review / pressure pass | blocked | Five P2 findings fixed; agent-native PASS; clean P2 rerun and fresh-worker forward test blocked by account usage limit. | rerun after reset |
| Implementation or plan artifact | complete | Source rule/reference/template/validator/tests/routing and resource sync implemented. | verification |
| Verification | complete | 18 validator tests, standalone template fail/pass smoke, final mirror parity, old-resource removal, and no-pilot audits pass. | closeout |
| Closeout | blocked | Final evidence and handoff recorded; clean P2 rerun unavailable until usage reset. | rerun P2 |

Findings:
- `patch` currently points at the prior pilot plan by filename. The generic
  normalized-case contract must replace that frozen dependency.
- Regression needs a compact entrypoint plus one detailed reference; Auto must
  not retain the same method.
- Skiller copies rule bodies but bundled resources require the repo-owned
  `sync-resources.mjs` list. The initial regeneration exposed the missing
  reference/script mirror; the sync owner now includes all Regression
  resources and `--check` reports exact parity.

Decisions and tradeoffs:
- Create standalone `regression`, move the reference/scripts/template into its
  ownership, route `auto regression` to it, and keep `patch` as the only
  one-case code worker.
- Put the 21-column ledger contract in a reusable validator plus tests, not in
  prose alone.
- Keep the validator parameterized by ledger path, expected ref, and completion
  requirement. It checks mechanical eligibility; source/runtime proof remains
  the authority for behavior truth.
- Reject duplicate Auto/Regression implementations, embedding the full
  methodology in either entrypoint, expanding `patch` into a master ledger
  writer, or freezing a prior case into reusable content.

Implementation notes:
- Added standalone `regression <bug|surface|corpus>` ownership and
  `auto regression ...` routing while keeping Auto compact.
- Added reusable source reference, 21-column TSV validator, 18 Node tests,
  canonical autogoal template, normalized Patch handoff, root routing, and
  deterministic source-resource sync.

Review fixes:
- [P2] `candidate-local` could leak into the validator `status` field ->
  accepted; Patch now distinguishes public claim wording from ledger status.
- [P2] completion did not require `--expected-ref` -> accepted; completion now
  fails without the exact expected ref.
- [P2] completion had no selected-case boundary -> accepted; repeatable
  `--selected-case` is required and missing IDs fail.
- [P2] one valid digest could hide malformed fingerprint entries -> accepted;
  the manifest now requires every `<path>@sha256:<64hex>` entry and exact
  repeated `--owned-file` parity for selected cases.
- [P2] template taught `no-test`/`defer` shorthand rejected by the validator ->
  accepted; template uses the exact decision vocabulary.
- Follow-up hardening: completion eligibility is false without all completion
  inputs; weak provenance, traversal/absolute paths, duplicate/stray owned-file
  declarations, and selected inventory boundaries have focused tests.
- Standalone extraction hardening: `--require-complete` accepts only selected
  `kept` rows. Blocked, deferred, reverted, and quarantined cases cannot become
  goal completion.
- Final P2 rerun -> no result; Codex returned an account usage-limit error.
- Agent-native review -> PASS; no accepted findings remain.
- Fresh-worker forward test -> no result; the new Sol-medium task failed before
  its first assistant action with the same account-wide usage limit.
- Oracle fallback -> unavailable: local binary absent; `npx` browser engine had
  no ChatGPT cookies; API engine reported zero remaining credits. No fallback
  verdict is claimed.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Final clean P2 autoreview hits Codex account usage limit | 4 | Retry the same Codex Sol/high review after 2026-08-20 05:29; do not switch model for a rate-limit failure. | First review produced five findings and all were fixed; final clean result unavailable. |
| Fresh Sol-medium forward-test task hits the same account usage limit | 1 | Retry the exact generic task after reset. | No worker reasoning or artifact was produced. |
| Oracle independent-review fallbacks are unavailable | 3 | Retry only when an authenticated browser or API credits exist. | Binary missing recovered through `npx`; browser had no cookies; API had no credits. |
| Three double-quoted `rg` patterns contained Markdown backticks and invoked `auto` in the shell. | 3 | Use fixed-string or single-quoted patterns without embedded shell syntax. | Recovered with exact source reads; no files changed by the failed commands. |

Verification evidence:
- `node --test .agents/rules/regression/scripts/validate-ledger.test.mjs`
  in `/Users/zbeyens/git/plate-2` -> master rerun 18/18 pass.
- Untouched instantiated `regression` template -> `check-complete.mjs`
  exit 1 with unresolved checklist/gates/phases; mechanically completed fixture
  -> exit 0; temporary plan removed.
- `pnpm install` -> Skiller apply and required resource sync pass.
- Old Auto-owned regression resources and `auto-regression` template are gone;
  standalone Regression source/Codex/Claude resources exist at the new owner.
- Standalone extraction final `pnpm install` -> generated
  `.agents/skills/regression/**`, `.claude/skills/regression/**`, root
  `AGENTS.md`, and routing mirrors successfully.
- `node .agents/rules/plate-next/scripts/sync-resources.mjs --check` -> exact.
- `node --test .agents/rules/plate-next/scripts/version.test.mjs` -> master
  rerun 10/10 pass, including exact generated doctrine resources/bodies.
- Body/resource parity audit -> Regression, Auto, and Patch bodies exact;
  Regression reference, validator, and tests exact in Codex and Claude mirrors.
- `pnpm exec biome check ...` on changed scripts -> pass.
- Master `cmp` audit -> Regression reference, validator, and validator tests are exact
  across source, Codex mirror, and Claude mirror.
- Standalone completion hardening -> 18/18 tests; `blocked`, `deferred`,
  `reverted`, and `quarantined` selected rows all fail `--require-complete`.
- Renamed `regression` template smoke -> untouched instance fails; mechanically
  completed fixture passes; temporary artifact removed.
- Master no-pilot audit and scoped `git diff --check` -> pass with no match or
  whitespace error.
- Focused P2 autoreview (`gpt-5.6-sol`, high, `--max-priority P2`) -> five
  findings accepted and repaired; 14/14 parallel tests passed on the first fix
  pass. Final rerun blocked by the account usage limit, not reported clean.
- Agent-native capability audit -> PASS across route, source owner,
  mirror/discoverability, proof, and handoff.
- Final `check-complete.mjs` -> exit 1 only because the `Goal plan complete`
  gate remains intentionally pending until a clean P2 rerun exists.
- Master rerun of `check-complete.mjs` confirms the same single unresolved gate;
  no deterministic implementation row regressed.
- Post-extraction `check-complete.mjs` again fails only on the intentionally
  unresolved final goal-plan evidence gate.

Final handoff contract:
- Recommendation: keep the standalone Regression skill and Auto route; rerun
  only the final focused P2/forward-test gates after usage resets.
- Confidence: high on deterministic contracts and ownership; no clean final
  reviewer verdict due external quota.
- Evidence: source tests, template smoke, resource sync/parity, discoverability,
  no-pilot/no-duplicate audit, first P2 findings fixed, agent-native PASS.
- Tests / commands: recorded above.
- Browser proof: N/A; no product/runtime/browser surface changed.
- PR / tracker: N/A; no commit, push, PR, or public mutation authorized.
- Caveats: final clean P2 rerun and independent fresh-worker exercise remain.
- Next owner: same P2 reviewer and exact archived forward-test prompt after quota reset.

Agent-native capability map:
| User action | Agent route | Source owner | Mirror / doc | Proof | Status |
|-------------|-------------|--------------|--------------|-------|--------|
| Start a regression loop | direct `regression` or `auto regression` route | `.agents/rules/regression.mdc`, `.agents/rules/auto.mdc` | Regression/Auto mirrors and root `AGENTS.md` | routing `rg` and body parity | pass |
| Load detailed method | Regression reference link | `.agents/rules/regression/references/methodology.md` | Codex/Claude Regression references | `cmp` parity and no-pilot audit | pass |
| Create the runtime plan | autogoal helper with `regression` | `docs/plans/templates/regression.md` | instantiated plan | unfinished fail and completed pass smoke | pass |
| Validate the 21-column ledger | generated Regression validator command | `.agents/rules/regression/scripts/validate-ledger.mjs` | Codex/Claude Regression scripts | 18 Node tests and resource `--check` | pass |
| Repair one normalized case | `patch` delegation | `.agents/rules/patch.mdc` | `.agents/skills/patch/SKILL.md` | body parity and handoff source audit | pass |
| Regenerate mirrors | `pnpm install` | `.agents/rules/**` plus resource sync list | `.agents/skills/**`, `.claude/skills/**`, root `AGENTS.md` | install, body compare, `cmp`, sync `--check` | pass |

Recommended independent forward-test prompt:
```txt
Independently use the installed `regression` skill on a generic invented editor regression or small corpus. Do not use any historical case, route, blocker, or conclusion, and do not modify product/runtime code. Start only from `.agents/skills/regression/SKILL.md`; verify `auto regression` routes to the same owner without duplicate methodology. Use a disposable ledger and an instantiated `regression` plan to test current-source/proof-host readiness, atomic case identity and provenance, risk arithmetic, exact test-decision vocabulary, smallest-probe routing, one normalized `patch` handoff, selected-case completion boundaries, expected-ref and owned-file fingerprint enforcement, canonical autogoal gates, honest claim width, and the mandatory methodology delta. Try to produce false greens and stale-host mistakes. Report every gap with the owning source file and focused proof; otherwise return a capability map and the exact commands that passed. Remove all disposable artifacts before handoff.
```

Timeline:
- 2026-08-17T10:13:57.104Z Major-task goal plan created.
- 2026-08-17 Active goal attached; requirements and owner boundary rechecked.
- 2026-08-17 Source mode/reference/template/validator/tests/Patch/routing implemented.
- 2026-08-17 Template smoke failed unfinished, passed completed, and was removed.
- 2026-08-17 Resource-sync miss repaired; final regeneration and parity audit passed.
- 2026-08-17 User required a separate skill. Methodology, validator, tests, and
  template moved to standalone Regression; Auto became routing-only; obsolete
  Auto resources were removed; mirrors and 18 tests passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout with one external review blocker |
| Where am I going? | Rerun the same focused P2 review after quota reset |
| What is the goal? | Implement standalone Regression, link Auto routing, and preserve one-case Patch ownership. |
| What have I learned? | P2 exposed five false-green/contract mismatches; all are fixed, and agent-native parity passes. |
| What have I done? | Implemented, regenerated, tested, smoke-checked, source-audited, P2-reviewed/fixed, and agent-native-reviewed the workflow. |

Open risks:
- Final focused P2 rerun has no clean result because the Codex account hit its
  usage limit until 2026-08-20 05:29. Do not call the review clean.
- The required independent fresh-worker forward test was dispatched but failed
  before execution on the same account-wide usage limit. No forward-test pass
  is claimed.
