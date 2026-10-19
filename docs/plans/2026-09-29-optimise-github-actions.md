---
review_scopes: []
review_basis: []
work_kind: implementation
---

# Optimise GitHub Actions

Status: Complete

Objective:
Measure Plate's GitHub Actions usage, remove the largest evidenced automatic waste that does not weaken required checks or shipping guarantees, and verify the workflow change locally.

Goal plan:
docs/plans/2026-09-29-optimise-github-actions.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- performance-observability (docs/plans/templates/packs/performance-observability.md)

Task source:
- User request, 2026-09-29: use `.agents/skills/optimise-github-actions` to optimize this repository.
- Technical method: `.agents/skills/optimise-github-actions/SKILL.md`.
- Lifecycle: `.agents/rules/task/references/workflow.md` and `.agents/skills/autogoal/SKILL.md`.

Completion threshold:
- A 14-day GitHub Actions baseline records runner minutes, monthly estimate, rounding loss, failed/cancelled minutes, workflow/event and job shares, run median/p90, and PR churn.
- Workflow triggers, concurrency, path filters, `needs` graphs, required checks, strictness, workflow tests, and release consumers are inspected before edits.
- Viable changes are ranked by conservative minute/time savings and risk; only a no-material-trade-off optimization is implemented.
- The changed workflow passes `actionlint`, its repository-owned regression test, focused Ultracite checks, and Agent Native Reviewer inspection.

Verification surface:
- GitHub API via `gh` and `.agents/skills/optimise-github-actions/scripts/measure.mjs`.
- `.github/workflows/**`, `tooling/scripts/ci-workflow.test.mjs`, release proof sources, and active GitHub rulesets.
- `actionlint` 1.7.12, Node's test runner, and focused Ultracite checks.

Constraints:
- Preserve required check names and every artifact/check needed to ship safely.
- Distinguish free public-repository runner time from billed private-repository cost.
- No commit, push, PR, ruleset mutation, release, or external message is authorized.
- Keep the installed optimization skill only under `.agents/skills`.

Boundaries:
- Audited all current GitHub Actions workflows and direct workflow/release consumers.
- Changed only the Plite workflow's generated-release-PR entry condition, its focused regression assertion, and this plan.
- Self-hosted runners, org settings, merge queue, branch rules, and intentional manual full-matrix semantics remain unchanged.

Timing:
- N/A: no deadline or minimum duration requested.

Blocked condition:
- N/A: GitHub read access and all required local proof were available.

Task state:
- current_phase: complete
- next: observe the next generated Changesets PR to obtain integrated zero-job proof if desired

Work Checklist:
- [x] User, skill, Task, Autogoal, and performance-pack obligations map to this plan.
- [x] Measured the 14-day baseline and retained raw rows at `/tmp/plate-actions-jobs.json` outside source control.
- [x] Inspected workflow triggers, concurrency, path filters, `needs` chains, required checks/strictness, workflow tests, release proof, caches, timeouts, matrices, runner multipliers, cancelled work, and job setup.
- [x] Ranked automatic, manual, failed, cancelled, and rounding waste by measured runner minutes and critical-path impact.
- [x] Estimated candidates against matched historical rows and rejected changes with material safety or user-intent trade-offs.
- [x] Added an upstream-generated-release-PR guard to the Plite proof-plan job; downstream browser jobs already depend on that job.
- [x] Added a focused existing-test assertion for the costly behavior and passed workflow lint/format checks.
- [x] Applied Agent Native Reviewer: the route, source owner, condition context, required-check boundary, proof, and handoff are coherent; no actionable finding remained.
- [x] Reconciled the original request and method checklist; evidence and exclusions are recorded below.
- [x] Performance adaptation: historical workflow/event/job/matrix/PR-branch cohorts replace synthetic load cohorts for GitHub Actions traffic.
- [x] Performance adaptation: runner setup and step timings replace warmed-process sampling for ephemeral hosted jobs.
- [x] Performance target prototype, database rules, and permanent budget overrides are N/A to this workflow condition change.
- [x] Performance comparison uses the same 14-day repository/event/job rows, Linux-minute billing model, and required-check/release constraints.
- [x] Performance fan-out inspection covered 4-way Chromium, manual Linux/WebKit matrices, build/merge jobs, repeated installs, caches, artifact dependencies, and required status contexts.
- [x] Evidence contains aggregate run/job metadata only; no credentials, headers, protected inputs, tenant/person identifiers, or repository payload contents were retained.

Baseline receipt:

- Repository: `udecode/plate`, public, GitHub organization plan `free`.
- Window: 14 days ending 2026-09-29.
- Raw artifact: `/tmp/plate-actions-jobs.json`, 2,349 rows, 661,398 bytes, SHA-256 `c5e37d44bafc642e2ef46384ff15f6eb05781c3ebcc2c2720aefd0017646e9f6`.
- 907 workflow runs; 1,487 jobs ran.
- 8,026 Linux-equivalent hosted-runner minutes; 17,199/month linear estimate.
- Job rounding added 1,280 minutes (16.0%); cancelled jobs used 711 minutes; failed jobs used 1,232 minutes.
- Plite manual dispatch: 5,354 minutes (66.7%), 18 runs on `next`, successful-run median 10.5 minutes and p90 11.8.
- Plite generated release PRs: 1,053 minutes (13.1%), 98 runs, 383 jobs. They were 100% of measured Plite PR runs; successful-run median 8.3 minutes and p90 9.5.
- Plite pushes: 626 minutes (7.8%), 39 runs; root CI pushes: 313 minutes (3.9%), 46 runs.
- PR churn: median 3 workflow runs per branch/workflow pair, maximum 110.

Decisions and tradeoffs:

| Decision | Chosen result | Evidence and reason |
| --- | --- | --- |
| Generated release PRs | Skip Plite proof before browser fan-out | Saves 1,053 minutes/14 days (~2,256/month) and 8–9 minutes per successful bot synchronization. Root CI and Registry already exempt upstream `changeset-release/*` PRs; release workflow owns generated metadata and release proof. |
| Manual full browser matrix | Keep | It dominates the sample at 5,354 minutes, but all 18 runs were explicitly dispatched on `next`; no evidence makes intentional cross-browser proof waste. |
| Push CI and Plite | Keep | Strict required-status enforcement is off. The push lanes consumed 939 minutes but caught real merged-state failures; deleting them would weaken protection. |
| Small PR policy jobs | Keep separate | `CI` and `Verify changeset policy` are required contexts; the changeset checkbox has a different write-permission/event security boundary. Merging them is not a free rounding win. |

Completion Gates:

| Gate | Applies | Result | Evidence |
| --- | --- | --- | --- |
| Measured baseline | yes | pass | Skill measurement report and raw receipt above |
| Required-check safety | yes | pass | Main ruleset requires `CI` and `Vercel`; next requires `CI` and `Verify changeset policy`; both have `strict_required_status_checks_policy: false`; Plite CI is not required |
| Conservative estimate | yes | pass | 98 generated release PR runs account for exactly 1,053 measured minutes; monthly estimate uses `30 / 14` |
| User selection | yes | pass | User authorized optimization; implementation applies only the no-material-trade-off cut and leaves the two material trade-offs unchanged |
| Workflow implementation | yes | pass | `.github/workflows/plite-ci.yml` skips only upstream generated Changesets PRs before downstream fan-out; forks and ordinary PRs still run |
| Workflow syntax | yes | pass | `/tmp/plate-actionlint.qBz33r/actionlint .github/workflows/plite-ci.yml` with actionlint 1.7.12 |
| Repository-owned regression | yes | pass | `node --test tooling/scripts/ci-workflow.test.mjs`: 4/4 tests pass |
| Formatting/lint | yes | pass | `pnpm exec ultracite check .github/workflows/plite-ci.yml tooling/scripts/ci-workflow.test.mjs` |
| Agent Native Reviewer | yes | pass | Direct action/source/route/proof audit found no unresolved discovery, ownership, permission, or proof defect |
| Production-path rerun | no | N/A | No push/PR publication was authorized. Historical replay supplies the estimate; realized savings require later GitHub Actions observations. |
| Publication | no | N/A | No commit, push, PR, ruleset mutation, or release authorized |

Verification evidence:

- `actionlint` accepted the changed workflow with no diagnostics.
- The focused Node test passes all four workflow assertions, including the generated-release-PR guard.
- Focused Ultracite check reports both changed workflow/test files correctly formatted with no lint finding.
- Source review confirms the job condition keeps `workflow_dispatch`, pushes, ordinary upstream PRs, and fork PRs enabled; only upstream heads beginning `changeset-release/` skip.
- Downstream browser jobs already depend on `proof-plan`, so its skip prevents build, Chromium shards, and coverage fan-out without new state.

Findings and remaining work:

- GitHub API reads timed out twice. A temporary retry/cache wrapper completed the same installed measurement script without changing repository tooling.
- Manual dispatch consumed the majority of runner-equivalent minutes, but changing an explicitly invoked full verification matrix without product intent would be false optimization.
- Root push CI failed 36 of 46 runs and Plite push failed 18 of 39 in the sample. Logs show real lint/type-aware and browser failures, so those lanes remain evidence-bearing rather than removable duplication.
- Actual post-change runner savings are unverified until this local change is published and a generated release PR synchronizes.

Final handoff:

- Outcome and owning fix: generated Changesets PRs no longer enter Plite browser fan-out; the focused workflow regression test owns the invariant.
- Proof and limits: local syntax/test/lint/review proof passes; integrated Actions behavior and realized savings are not claimed.
- Local / integrated / published state: local only; not committed or published.
- Next action or completion: complete locally; publication remains outside current authority.

Timeline:

- 2026-09-29T10:25:34.664Z Plan created.
- 2026-09-29 Skill install scope corrected to `.agents/skills` only.
- 2026-09-29 Baseline, rulesets, workflow graph, tests, and release consumers inspected.
- 2026-09-29 Generated release PR optimization implemented and locally verified.

Open risks:

- Historical replay estimates but cannot prove future traffic or realized savings.
- A future release process that puts source changes on `changeset-release/*` would invalidate the exemption and must update this guard/test.

Start Gates:

| Gate | Applies | Result | Evidence |
| --- | --- | --- | --- |
| Performance pack selected | yes | pass | CI optimization changes runner use and wait time |
| Operation and owner identified | yes | pass | `udecode/plate` GitHub Actions; workflow owner `.github/workflows/plite-ci.yml` |
| Scale variables and cohorts fixed | yes | pass | workflow, event, job, matrix fan-out, PR branch, billed minutes, median/p90 |
| Budget fixed before target | yes | pass | Minimize measured runner minutes without weakening required checks or explicit verification semantics |
| Baseline and target probe selected | yes | pass | 14-day skill measurement plus exact generated-release-PR replay |
| Correctness guard selected | yes | pass | active rulesets, release owner inspection, `actionlint`, and `ci-workflow.test.mjs` |
| Production detector recorded | yes | pass | GitHub Actions API; no protected payloads retained |
