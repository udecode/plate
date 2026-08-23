# Re-enable valuable Oxlint rules

Objective:
Re-enable every valuable Oxlint rule category without semantic regressions; keep or revert each category from evidence, then pass the lint, type, test, policy, and root gates.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-22-re-enable-valuable-oxlint-rules.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- none

Major source:
- type: user request plus repository lint configuration
- id / link: `oxlint.config.ts`
- title: Re-enable valuable Oxlint rules
- decision to make: which currently disabled rules improve this repository enough to enable, configure, repair, or deliberately retain off
- decision criteria: semantic correctness, real defect prevention, honest type evidence, regression risk, structural ownership, and verified repository behavior; diagnostic count, churn, and style alone do not decide

Major lane:
- lane: framework/tooling migration
- output type: config and source repair with keep/revert ledger
- implementation expected: yes
- affected packages / surfaces: `oxlint.config.ts`, source and tests reported by each candidate rule, root lint/typecheck/test/check scripts
- dominant risk: behavior changes or type-evidence laundering performed only to silence lint

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.
- [x] Execute all candidate categories, but revert a category if source evidence changes the recommendation.
- [x] Never disable or retain a rule only because it reports many diagnostics, requires churn, or is stylistic.
- [x] Evaluate and record: `unicorn/no-this-assignment`, `unicorn/no-static-only-class`, `typescript/strict-boolean-expressions`, `typescript/no-unnecessary-type-parameters`, `typescript/no-unnecessary-condition`, `import/no-cycle`, `typescript/no-unsafe-return`, and `typescript/no-unsafe-assignment`.
- [x] Process one category at a time and verify before keeping it.
- [x] Choose among semantic repair, structural pattern override, narrow production invariant, global off, or full category revert from evidence.
- [x] Reject casts, fake contracts, assertion helpers, dummy callbacks, wrappers, memoization, concurrency changes, and architectural rewrites whose only purpose is lint.
- [x] Add no file-level disables, exact-file config overrides, or test-local suppressions; tests/tooling use shared structural patterns only when every match shares the reason.
- [x] Preserve `reportUnusedDisableDirectives` enforcement through the strict type-aware command.
- [x] Preserve unrelated changes; do not commit or push.
- [x] Final handoff must state kept and reverted categories, source repairs, exceptions and evidence, commands and timing, and any remaining risk.

Timed checkpoint:
- requested duration: none
- semantics: N/A: no duration requested
- initial confidence score: N/A: category pass/fail gates are stronger
- improvement loop: one category at a time; keep only after focused lint/type/test proof, otherwise repair or revert
- final score / loop closure: N/A: exact gate closure below

Completion threshold:
- Every named rule category has a keep or revert decision backed by current diagnostics and source evidence; kept categories are green without laundering; safe lint fix is idempotent; fast and type-aware lint, relevant typechecks/tests, strict policy checker, and the repository root check pass, or a concrete pre-existing/unrelated blocker is evidenced.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-22-re-enable-valuable-oxlint-rules.md`
  passes.

Verification surface:
- Per-category Oxlint diagnostics saved outside the repository and inspected in bounded slices.
- `pnpm lint:fix`, `pnpm lint`, and `pnpm lint:type-aware`, repeated for idempotence.
- Focused package typechecks/tests for source repairs, then the repository root check.
- `node /Users/zbeyens/.codex/skills/oxlint/scripts/check-config-policy.mjs /Users/zbeyens/git/plate-2 --strict`.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Implementation is explicitly authorized.
- Preserve runtime behavior, public APIs, build integration, project restrictions, globals, ignores, and structural boundaries unless source evidence proves an owning repair.
- No lint laundering, unsafe casts, fake contracts, semantic rewrites, or broad suppression shortcuts.
- Do not commit or push.

Boundaries:
- Source of truth: user request, `oxlint.config.ts`, installed rule/preset source, current diagnostics, and affected implementation/tests.
- Allowed edit scope: lint configuration plus exact source/test owners required for a kept rule category; goal plan.
- External sources: N/A unless installed local source cannot settle rule semantics.
- Browser surface: conditional; only required if a retained source fix changes browser-observable behavior. Pure config/type/import cleanup records N/A.
- Tracker sync: N/A: no tracker request.
- Non-goals: React build integration migration, unrelated cleanup, dependency upgrades, commits, pushes, or registry generation.

Output budget strategy:
- Save JSON diagnostics under `/tmp`, summarize counts/rules/files with short scripts, inspect bounded source slices, and cap terminal output. Exclude generated/build/node_modules trees unless they own a named diagnostic.

Blocked condition:
- Stop only if the same external/tooling blocker recurs three times and no narrower command, repair, or category revert can preserve a verified checkout.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: none
- goal_status: complete

Current verdict:
- verdict: re-enable `unicorn/no-this-assignment` and `unicorn/no-static-only-class`; retain the other six candidate global offs
- confidence: high; current forced-rule diagnostics, policy audit, idempotence, and full root check are green
- next owner: none
- reason: rule value must survive current semantic evidence, not the earlier diagnostic count

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-22-re-enable-valuable-oxlint-rules.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint contains every current and inherited lint-policy requirement. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| `major-task` loaded | yes | Read `.agents/skills/major-task/SKILL.md` through EOF. |
| Active goal checked or created | yes | `get_goal` returned no active goal; create after this filled shell. |
| Source of truth read before analysis | yes | Read Oxlint skill and complete `rule-policy.json`; current config/source audit follows before edits. |
| Major lane selected | yes | Framework/tooling migration with code-changing execution. |
| Decision criteria stated | yes | Semantic value and evidence decide; count, churn, and style do not. |
| Existing repo patterns / prior decisions checked | yes | Prior current-checkout diagnostic artifacts and policy audit summarized; live config audit follows. |
| Helper stack selected | yes | Oxlint + Major Task + Autogoal only. |
| External research decision recorded | no | N/A: installed local rule/preset source is authoritative. |
| Implementation expectation recorded | yes | User said go; edits authorized. |
| Workspace authority selected | yes | `/Users/zbeyens/git/plate-2`; only root scripts own final evidence. |
| Branch / PR expectation decided | no | N/A: user requested neither branch nor PR; no commit/push. |
| Output budget strategy recorded | yes | JSON to `/tmp`, summarized counts and bounded slices. |

Work Checklist:
- [x] N/A: no duration requested.
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

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the repo audit, consume the Benchmark handoff, or run the review/prototype/artifact check named in this plan | Every candidate has a keep/revert row; policy, idempotent lint, build/typecheck/tests, and root check passed. |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | Forced-rule JSON under `/tmp`, categorized counts, installed schema, and representative source owners inspected. |
| Decision criteria closure | yes | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | Two zero-conflict rules enabled; six negative-sum/wrong-owner rules retained off for documented semantics. |
| Options / tradeoffs / rejection record | yes | Record viable options, chosen recommendation, and why alternatives lose | Decisions and tradeoffs records global enable, configured cycle trial, repair, structural override, and revert outcomes. |
| Review / pressure pass | no | Run selected reviewer/lens or record N/A with reason | N/A: Oxlint policy/laundering audit is the owning lens; final diff deletes only two unused exceptions and changes no runtime code. |
| Review findings closure | yes | Fix or explicitly reject accepted/actionable findings and record closure proof | Reverted the shallow cycle configuration after it demanded lint-only architecture; no other actionable finding remained. |
| External-source audit | no | Cite official/local clone/external sources when used, or record N/A | N/A: installed Oxlint schema and current repository source settled all semantics. |
| Implementation gates | yes | If code changed, close primary-template and touched-surface gates; otherwise N/A | Config-only change; no package API, runtime, browser, generated, docs product, or agent-native surface changed. |
| Final handoff contract | yes | Record recommendation, evidence, caveats, residual risk, and next owner | Completed below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent when files changed | Two targeted `ultracite fix` passes; two clean fast and typed checks. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | One generated-public `rg` spill is recorded; subsequent broad diagnostics were saved to `/tmp` and summarized. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-22-re-enable-valuable-oxlint-rules.md` | Passed on the final ledger. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Oxlint, rule policy, Autogoal, and Major Task read; requirement ledger filled | current-state map |
| Current-state map | complete | forced each named rule on the current checkout and inspected representative owners | options |
| Options and recommendation | complete | keep/revert ledger below | review |
| Review / pressure pass | complete | Oxlint rule policy and laundering audit applied; no separate reviewer needed for two config deletions | implementation decision |
| Implementation or plan artifact | complete | removed two unused global offs; reverted the shallow-cycle experiment | verification |
| Verification | complete | strict policy; doctor 6/6; idempotent lint; 60 builds/typechecks; fast/slow/slowest tests; root check green | closeout |
| Closeout | complete | final evidence and risk recorded; mechanical plan checker next | final response |

Findings:
- The shared policy treats `typescript/strict-boolean-expressions` as globally negative-sum by default because it can add coercion noise; Plate must prove real value to override that default.
- Previous current-checkout audit found zero diagnostics for both Unicorn candidates and large mixed diagnostic sets for strict booleans, unnecessary conditions, cycles, and unsafe-value rules. Counts set scope only.
- `unicorn/no-this-assignment`: zero current consumers; removing the exception restores preset ownership without source churn.
- `unicorn/no-static-only-class`: zero current consumers; removing the exception restores preset ownership without source churn.
- `typescript/strict-boolean-expressions`: 4,225 current reports. Even with nullable/`any` allowances, the remaining rule rejects intentional false/object sentinels such as `Descendant[] | false`; explicit coercion would add syntax without evidence.
- `typescript/no-unnecessary-type-parameters`: 29 current reports. Production cases are caller-selected type guards, phantom/variance witnesses, exact-type encodings, and the unresolved `useElement<T>()` typed-context API. Removing generics solely for lint would break inference or preserve the same unsafe cast with worse DX.
- `typescript/no-unnecessary-condition`: 1,648 current reports. Representative reports include raw Appium receipt validation, nullable DOM text, copied compatibility code, and published-JavaScript defenses whose declared types describe the desired state rather than untrusted runtime input.
- `import/no-cycle`: 671 default reports. A trial with `ignoreTypes: true, maxDepth: 1` still produced 18 direct cycles, including deliberate Markdown recursion and self-referential plugin/component owners. Oxlint offers no structural allowlist; satisfying it requires lint-only architecture rewrites or forbidden exact-file exceptions.
- `typescript/no-unsafe-return`: 1,183 current reports; after structural test/unchecked-JS/tooling boundaries, 147 production reports remain in deliberately erased editor/plugin registries. Return-site casts cannot restore the lost evidence.
- `typescript/no-unsafe-assignment`: 7,099 current reports; 4,336 tests, 2,088 unchecked JS, 197 tooling, and 478 production reports. Production concentration is again heterogeneous registry consumption, where casts would launder erasure.

Decisions and tradeoffs:
- Keep both Unicorn preset rules enabled by deleting their obsolete global offs. Blast radius is config-only because the current repository has zero reports.
- Retain the six typed/cycle global offs. Each has a demonstrated semantic conflict or wrong-owner failure; diagnostic counts are recorded only to bound the audit.
- Reject the attempted shallow `import/no-cycle` configuration. Direct-cycle cleanup would be an architecture project, and several cycles are intentional recursive ownership rather than defects.
- Do not redesign `useElement<T>()`, public editor witnesses, registries, or module topology for this lint task.

Implementation notes:
- `oxlint.config.ts`: removed the explicit offs for `unicorn/no-this-assignment` and `unicorn/no-static-only-class`.
- No production, test, package API, browser behavior, dependency, or generated file changed.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |
| Broad `rg` crossed generated `apps/www/public/r/*.json` and produced truncated output | 1 | exclude generated/public paths and use exact diagnostics/source slices | all subsequent audits used `/tmp` JSON summaries and bounded reads |
| Shallow `import/no-cycle` trial still required lint-only architecture work | 1 | restore the evidence-backed global off | reverted before final gates |

Verification evidence:
- `pnpm exec ultracite doctor` -> 6 passed, 0 warnings, 0 failed; Ultracite 7.10.6, Oxlint 1.79.0, Oxfmt 0.64.0.
- Targeted `ultracite fix oxlint.config.ts` twice -> second run finished cleanly and changed nothing further.
- Warm `pnpm lint` -> 5.60s and 5.51s; both clean across 4,186 formatted files plus Oxlint.
- Warm `pnpm lint:type-aware` -> 38.40s and 39.92s; both clean with unused suppressions enforced as errors.
- `node /Users/zbeyens/.codex/skills/oxlint/scripts/check-config-policy.mjs /Users/zbeyens/git/plate-2 --strict` -> passed: no missing reason, forbidden reason, exact-file override, invalid directive, test directive, or unbounded directive violation; `lint:type-aware` recognized as atomic strict enforcement.
- `pnpm check` -> passed in 179.42s: lint, typed lint, 60 package builds, 60 package typechecks, 3,255 fast tests, 1,542 slow tests with 60 intentional skips, and slowest-suite budget gate.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-22-re-enable-valuable-oxlint-rules.md` -> complete.
- Browser -> N/A: only lint configuration and this execution ledger changed; no runtime or UI bytes changed.

Final handoff contract:
- Recommendation: keep the two Unicorn rules enabled; retain the other six evidence-backed offs.
- Confidence: high.
- Evidence: current forced diagnostics, representative source inspection, strict policy audit, idempotent lint, and complete root gate.
- Tests / commands: doctor, targeted safe fix twice, two warm fast/typed lint pairs, strict policy, and `pnpm check` all green.
- Browser proof: N/A: config-only behavior.
- PR / tracker: N/A: user requested no commit/push and supplied no tracker.
- Caveats: one pre-existing fast test is in the warning zone at 217.89ms but below the 1,000ms hard limit; unrelated to lint.
- Next owner: none for this task; any future `useElement<T>()`, registry-erasure, or cycle redesign must be an API/architecture task with its own proof.

Timeline:
- 2026-08-22T21:44:25.424Z Major-task goal plan created.
- 2026-08-22 Read all selected skills and the complete Oxlint rule policy; captured explicit requirements before implementation.
- 2026-08-23 Removed the two obsolete Unicorn global offs; forced and audited all six disputed categories; reverted the shallow cycle experiment.
- 2026-08-23 Strict policy passed; `pnpm check` passed in 179.42s; two clean warm lint timing pairs proved idempotence.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete; mechanical plan check next. |
| Where am I going? | Final handoff. |
| What is the goal? | Re-enable valuable rules without regression or laundering; revert categories that fail that bar. |
| What have I learned? | Only the two zero-consumer Unicorn exceptions lacked a current justification; the other six offs have concrete semantic or owner conflicts. |
| What have I done? | Re-enabled two rules, reverted the failed cycle experiment, audited every category, and passed all named gates. |

Open risks:
- No risk from the retained diff: it removes two unused config exceptions and changes no source behavior.
- Deferred architecture/API risks are intentionally outside this lint task: caller-selected `useElement<T>()`, heterogeneous registry erasure, and direct dependency cycles.
