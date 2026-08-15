# verify current ci

Objective:
Verify the current checkout CI; done when every local CI-equivalent command has
an observed exit and each failure is classified.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-15-verify-current-ci.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- type: direct user request
- id / link: N/A: no issue or PR supplied
- title: Check whether all CI is green
- acceptance criteria: inspect current workflow/script owners; run the full
  local CI-equivalent verification with observed exits; report green only if
  every required row passes; classify every failure without changing source.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: no duration requested
- semantics: N/A
- initial confidence score: N/A: binary command exits are stronger evidence
- improvement loop: rerun only when a failure shape indicates local install
  corruption or a command prerequisite; do not patch product source.
- final score / loop closure: N/A: close from the exact CI matrix.

Completion threshold:
- Every current non-release GitHub Actions job or repo-owned aggregate CI script
  has a mapped local command or an explicit environment-only N/A row.
- `pnpm check` and `pnpm test:all`, plus any required CI command not covered by
  those aggregates, have observed exits in this checkout.
- Every nonzero exit is classified by exact command and first owning failure;
  no source fix is authorized by this verification-only request.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-15-verify-current-ci.md` passes.

Verification surface:
- `.github/workflows/*.yml`, root `package.json`, and owning scripts for the
  current CI matrix.
- Exact observed exits for `pnpm check`, `pnpm test:all`, and uncovered required
  workflow commands.
- A concise final pass/fail matrix; browser proof is N/A unless a workflow
  explicitly requires a locally reproducible browser job outside aggregates.

Constraints:
- Verification-only: do not repair failures or update product, test, docs,
  generated, registry, skill, package, or workflow source.
- Do not run release, publish, deployment, mutation, or credentialed jobs.
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: current root scripts and `.github/workflows` in
  `/Users/zbeyens/git/plate-2`.
- Allowed edit scope: this goal ledger only; command-generated ignored build
  output may be produced by normal verification.
- Browser surface: only CI-owned browser tests discovered in workflow/script
  mapping; no ad hoc UI QA.
- Browser strategy: use the repo-owned CI command, not manual Browser, when the
  workflow already owns automated browser proof.
- Tracker sync: N/A: no issue or PR supplied.
- Non-goals: no fixes, no commits, no PR, no workflow redesign, no release or
  deployment execution.

Output budget strategy:
- Read only workflow/script names first. Save long CI command output under
  `/tmp/plate-ci-*.log`, report exit codes and bounded tails, and never stream
  an unbounded full-suite log into the conversation.

Blocked condition:
- Block only if the same environment/tooling failure survives the one allowed
  `pnpm run reinstall` retry and prevents observing the required command exit;
  credentialed, release, deployment, and real-device-only jobs are classified
  as environment-only rather than executed.

Task state:
- task_type: verification/status
- task_complexity: normal
- current_phase: closeout
- current_phase_status: done
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: red; Plite package tests fail three deterministic contracts
- confidence: 100% for the locally reproducible CI matrix
- next owner: task
- reason: root CI, barrels, contracts, adopters, www integration, and Chromium
  pass; `pnpm check:plite` exits 1 at `pnpm plite:test`.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-15-verify-current-ci.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Check again whether all CI is green; observe every required exit and report exact failures. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | `testing` owns full-suite command selection; `autogoal` owns the auditable matrix. |
| Active goal checked or created | yes | New matching active goal created after confirming no active goal. |
| Source of truth read before edits | yes | No source edits are authorized; workflow/root-script audit precedes CI execution. |
| Tracker comments and attachments read | no | N/A: no tracker or attachment supplied. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: verification-only, no implementation diagnosis yet. |
| TDD decision before behavior change or bug fix | no | N/A: no behavior change or fix authorized. |
| Branch decision for code-changing task | no | N/A: no code change, commit, or PR. |
| Release artifact decision | no | N/A: verification-only. |
| Browser tool decision for browser surface | yes | Repo-owned automated browser CI commands take precedence; manual Browser is N/A unless workflow mapping exposes a gap. |
| PR expectation decision | no | N/A: user did not request a PR. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Long outputs go to bounded `/tmp/plate-ci-*.log` artifacts. |

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
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is N/A: no video supplied.
- [x] Nearby repo instructions read; no implementation pattern applies to a
      read-only CI verification.
- [x] Implementation boundary is N/A: this task will classify, not patch.
- [x] Release artifact requirement is N/A: verification-only.
- [x] Final handoff shape decided: CI matrix with exact command exits and first
      owning failure per red row.
- [x] Branch handling is N/A: no code change.
- [x] Local-env-rot retry policy recorded: use `pnpm run reinstall` once only
      for documented install-corruption signals, then rerun the exact command.
- [x] Workspace authority recorded: every proof command runs from
      `/Users/zbeyens/git/plate-2`.
- [x] High-risk change gate is N/A: no source mutation authorized.
- [x] P2 autoreview is N/A: no implementation patch in this verification task.
- [x] Agent-native review is N/A: no agent/tooling source change.
- [x] Output budget discipline recorded: broad command output is captured to
      `/tmp` and only bounded tails are read.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the mapped local CI commands | Complete: exact exits recorded below; verdict is red. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: no fix authorized; the three failures were rerun and reproduced. |
| Targeted behavior verification | no | Run focused test/proof for changed behavior or record N/A | N/A: verification-only; focused reruns classify the red contracts. |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: no source change; root and Plite typechecks nevertheless passed inside CI gates. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | `pnpm brl` exit 0; before/after fingerprints show no introduced drift. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: verification made no install-graph change. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: verification made no rule or skill change. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd | Every command ran in `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | no | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | N/A: no surface changed; CI-owned Chromium proof ran directly. |
| Browser final proof | yes | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | `pnpm --filter plite test:plite-browser:chromium` exit 0: 698 passed, 6 skipped. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no template path changed; template workflow is not triggered. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: verification-only. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: verification-only; registry CI skips while pending changesets exist. |
| Docs or content changed | no | Verify docs or record N/A | N/A: only this required goal ledger was updated. |
| High-risk mini gate | no | Record proof for high-risk changes or N/A | N/A: no implementation. |
| Agent-native review for agent/tooling changes | no | Run agent-native review or record N/A | N/A: no agent/tooling source change. |
| Local install corruption suspected | no | Reinstall once or record N/A | N/A: deterministic assertion failures, reproduced exactly; no corruption signature. |
| P2 autoreview for non-trivial implementation changes | no | Run P2 autoreview or record N/A | N/A: no implementation patch. |
| PR create or update | no | Run check before PR work | N/A: no PR requested. |
| Task-style PR body verified | no | Verify PR body | N/A: no PR. |
| PR proof image hosting | no | Host proof images or record N/A | N/A: no PR and no image proof. |
| Tracker sync-back | no | Sync tracker or record N/A | N/A: no tracker. |
| Final handoff contract | yes | Fill exact status and proof | Complete below. |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent | N/A: root `pnpm check` already ran lint read-only and passed; no source patch to fix. |
| Output budget discipline | yes | Verify bounded output | One initial workflow map exceeded the output budget; all subsequent suite output went to `/tmp` with bounded tails. |
| Timed checkpoint | no | Continue for requested duration or N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-15-verify-current-ci.md` | Passed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | workflow and package scripts mapped | verification |
| Implementation | done | N/A: verification-only; no source repairs authorized | verification |
| Verification | done | exact matrix and deterministic reruns recorded | closeout |
| PR / tracker sync | done | N/A: neither requested nor supplied | closeout |
| Closeout | done | final verdict and caveats recorded | final response |

Findings:
- Root CI is green: `pnpm check` exited 0 and ran lint, typecheck,
  `test:all`, and `test:slowest`.
- Strict Plite CI is red: `pnpm check:plite` exited 1 at `pnpm plite:test`
  after Plite typecheck passed. The package run was 1,435 pass / 3 fail.
- The exact failures are an internal export allowlist missing
  `getNodeKeyDOMValue` and `preserveCompiledSchemaPropertyIdentity`, one extra
  `@platejs/core` patch changeset in the per-package release contract, and a
  discarded structural transaction spec consuming a node-key allocation.
- Separate later rows pass: proof contracts, www integration typecheck,
  affected adopter typechecks, and Chromium browser proof.
- Registry validation is skipped by its own workflow while pending changesets
  exist. Template CI is not triggered because no `templates/**` path changed.
- GitHub changeset-label policy is server-context-only and was not executed.

Decisions and tradeoffs:
- Report red from the strict Plite gate even though the broader root aggregate
  passes; `pnpm check` does not cover this Plite package suite.
- Do not run `pnpm run reinstall`: all three failures are deterministic
  assertions and reproduce in focused runs, not dependency corruption.
- Do not patch failures because the user asked for CI status only.

Implementation notes:
- No product, package, test, registry, workflow, or skill source was edited.
- The only task edit is this goal ledger.

Review fixes:
- N/A: no implementation review or fixes were authorized.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial combined workflow/script map exceeded the output budget | 1 | Extract only job ids and command lines, then capture suites to `/tmp` | Resolved; no further unbounded output. |

Verification evidence:
- `pnpm check` -> exit 0. It includes root lint, typecheck, `test:all`, and
  `test:slowest`.
- `pnpm check:plite` -> exit 1. Typecheck exit 0; package tests 1,435 pass / 3
  fail; the aggregate stopped before contracts and browser.
- Focused rerun of public-import and transaction-spec files -> exit 1, 20 pass
  / 2 fail; both failures reproduced.
- Focused `runtime-contracts.test.ts` rerun -> exit 1, 751 pass / 1 fail; the
  changeset failure reproduced.
- `pnpm check:plite:contracts` -> exit 0.
- `pnpm --filter www exec tsc --noEmit -p tsconfig.package-integration.json`
  -> exit 0.
- `pnpm check:plite:adopters` -> exit 0.
- `pnpm --filter plite test:plite-browser:chromium` -> exit 0, 698 passed, 6
  skipped, 78 bounded batches.
- `pnpm brl` -> exit 0; tracked and untracked package fingerprints were
  identical before and after.
- Logs: `/tmp/plate-ci-check.log`, `/tmp/plate-ci-plite.log`,
  `/tmp/plate-ci-plite-contracts.log`, `/tmp/plate-ci-plite-www.log`,
  `/tmp/plate-ci-plite-adopters.log`, `/tmp/plate-ci-plite-browser.log`, and
  `/tmp/plate-ci-brl.log`.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: no issue or tracker supplied.
- Confidence line: 100% for the locally reproducible matrix; verdict is red.
- Flow table:
  - Reproduced: three deterministic Plite package-test failures; browser green.
  - Verified: root CI and every separately runnable later Plite row.
- Browser check: Chromium 698 passed, 6 skipped.
- Outcome: CI is not all green; only `pnpm check:plite` is red.
- Caveat: GitHub-only changeset label policy was mapped but cannot run locally;
  registry validation self-skips with pending changesets; template paths are
  unchanged.
- Design:
  - Chosen boundary: current checkout's non-release local CI equivalents.
  - Why not quick patch: this request authorizes status verification only.
  - Why not broader change: release/deploy/server-policy jobs need CI secrets or
    event context and do not affect the local red verdict.
- Verified: exact exits and focused reruns recorded above.
- PR body verified: N/A: no PR.

Task-style PR body contract:
- Preserve any existing `<!-- auto-release:start -->` block. If a changeset is
  part of the diff and repo policy expects auto release, include that block.
- Use the accepted kitcn PR #270 visual format. The body starts with an emoji
  issue/tracker/fix line, for example `🐛 Fixes #123` or `🐛 Fixes ➖ N/A`, then
  an emoji confidence line like `🟢 95-100% confidence`.
- Use this exact table header: `| Phase | 🧪 Tests | 🌐 Browser |`.
- Use `Reproduced` and `Verified` rows. Mark passing proof with `🟢`, repro or
  failing proof with `🔴`, and non-applicable cells with `➖ N/A`.
- Use bold emoji section headings: `**✅ Outcome**`, `**⚠️ Caveat**`,
  `**🏗️ Design**`, and `**🧪 Verified**`.
- Never include a line that links to the current PR itself. The current PR URL
  belongs in the final response, not in its own description.
- Do not replace this with a generic `Summary` / `Verification` PR body, an
  adaptive prose body from a git helper skill, plain `## Outcome` sections, or
  an unrelated generated badge footer unless the caller or repo template
  explicitly asks for it.
- Proof is `gh pr view --json body` output or a concise source-backed summary
  of that output.

Final handoff / sync:
- PR: N/A: no PR.
- Issue / tracker: N/A: no tracker.
- Browser proof: Chromium exit 0; 698 passed, 6 skipped.
- Caveats: exact Plite failures and environment-only workflow rows recorded.

Timeline:
- 2026-08-15T08:26:01.735Z Task goal plan created.
- 2026-08-15 Root CI, strict Plite CI, uncovered Plite rows, Chromium, barrels,
  and focused failure reruns completed.
- 2026-08-15 Autogoal completion checker passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete; ready to report. |
| Where am I going? | Final response. |
| What is the goal? | Verify whether every current local CI row is green. |
| What have I learned? | Root and browser are green; Plite package tests have three deterministic failures. |
| What have I done? | Mapped workflows, ran all local rows, reproduced failures, and recorded exact exits. |

Open risks:
- CI remains red until the three Plite contract failures are fixed. GitHub-only
  policy status still requires the actual PR event, but cannot reverse the
  already observed local failure.
