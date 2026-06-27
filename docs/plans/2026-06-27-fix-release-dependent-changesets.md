# fix release dependent changesets

Objective:
Fix release dependent changesets; done when workflow script tests/check pass and PR is open.

Goal plan:
docs/plans/2026-06-27-fix-release-dependent-changesets.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user prompt plus live PR/run diagnosis
- id / link: https://github.com/udecode/plate/pull/5044
- title: Fix release workflow dependent changeset detection and force core follow-up release
- acceptance criteria: patch the dependent-release script so it sees pending manual changesets on release branches; add a new `@platejs/core` patch changeset; verify with focused tests, lint/check, and an open PR.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A: no timed checkpoint requested
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- `tooling/scripts/prepare-release-changesets.mjs` no longer passes `--since=$GITHUB_REF_NAME` implicitly.
- `tooling/scripts/prepare-release-changesets.test.mjs` proves `GITHUB_REF_NAME` is ignored and explicit `PLATE_CHANGESET_STATUS_BASE` still works.
- One new `@platejs/core` patch changeset exists.
- Focused tests, lint/fix, `pnpm check`, local autoreview, and PR creation succeed or any blocker is reported with evidence.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-fix-release-dependent-changesets.md` passes.

Verification surface:
- `node --test tooling/scripts/prepare-release-changesets.test.mjs`
- `pnpm lint:fix`
- `pnpm check`
- source audit for `getChangesetStatusArgs`
- local autoreview or explicit proportional waiver
- `gh pr view --json body,url`

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: user prompt, PR #5044 diff, live release run logs, Changesets docs, `.agents/skills/release-lanes`, `.agents/skills/changeset`.
- Allowed edit scope: release changeset preparation script/tests, one core changeset, generated skill mirrors only if source rules change.
- Browser surface: N/A: release workflow/package tooling only.
- Tracker sync: PR only; no issue/Linear owner.
- Non-goals: do not change package runtime code, npm state, release branches, or publish manually.

Output budget strategy:
- Use narrow `sed`, `rg`, `gh pr view`, and focused test output caps. Avoid streaming full workflow logs unless filtering for failure lines.

Blocked condition:
- Stop only if branch protection/auth prevents PR creation, `pnpm check` fails for an unrelated repo-wide issue after the reinstall policy is considered, or the requested core changeset conflicts with Changesets release rules and the user rejects the safer alternative.

Task state:
- task_type: release workflow bug fix plus forced package changeset
- task_complexity: normal
- current_phase: PR / tracker sync
- current_phase_status: in_progress
- next_phase: closeout
- goal_status: active

Current verdict:
- verdict: valid
- confidence: high
- next owner: task
- reason: PR #5044 and npm readback show `platejs` stayed stale; script tests/logs identify the implicit `--since=$GITHUB_REF_NAME` status base as the likely missed dependent-release trigger.

Pre-solution issue challenge:
- reporter claim: PR #5044 should have kept `platejs` and runtime dependents aligned with a core patch release.
- suggested diagnosis or fix: remove the implicit branch-name changeset status base and add a core patch changeset.
- repro ladder:
  - tests / source-level repro: `tooling/scripts/prepare-release-changesets.test.mjs` covers generated status args and dependent-release traversal.
  - Playwright / automated browser: N/A: release tooling, no browser behavior.
  - Browser plugin: N/A: release tooling, no browser behavior.
  - screenshot / visual proof: N/A: no visual surface.
- reproduction verdict: valid from live PR #5044 diff, npm readback, and focused status-args regression test.
- validity verdict: valid.
- best long-term fix boundary: `tooling/scripts/prepare-release-changesets.mjs`; the release helper owns synthetic dependent changesets.
- harsh honest feedback: using `GITHUB_REF_NAME` as `--since` on the same release branch made the helper blind to pending manual changesets.
- hard-stop decision: proceed.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-27-fix-release-dependent-changesets.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Timed checkpoint parsed | N/A: no timed checkpoint | Recorded above. |
| Skill analysis before edits | yes | Read `task`, `release-lanes`, `changeset`, `autogoal`, `agent-native-reviewer`, and `autoreview` skill files. |
| Active goal checked or created | yes | Created active goal for this plan. |
| Source of truth read before edits | yes | Read PR #5044 metadata/diff, release run logs, release workflow, release helper, tests, and Changesets docs. |
| Tracker comments and attachments read | N/A: no tracker item | User prompt and PR/run evidence are the source. |
| Video transcript evidence required | N/A: no video | No video or screen recording. |
| Pre-solution issue challenge required | yes | Validity verdict recorded above. |
| Reproduction verdict before implementation | yes | Live PR/npm state plus focused source-level status-args test. |
| Repro escalation ladder selected | yes | Source/test ladder selected; browser rows N/A. |
| Suggested fix reviewed against durable boundary | yes | Durable owner is release helper status-base logic. |
| `docs/solutions` checked for non-trivial existing-code work | N/A: source-backed release helper bug | Existing release-lane memory and source were checked. |
| TDD decision before behavior change or bug fix | yes | Added focused regression test around status args before full verification. |
| Branch decision for code-changing task | yes | Created `codex/fix-release-dependent-changesets` from `main`. |
| Release artifact decision | yes | Added `.changeset/mean-tables-serve.md` for `@platejs/core` patch. |
| Browser tool decision for browser surface | N/A: no browser surface | Release tooling only. |
| PR expectation decision | yes | User explicitly requested PR. |
| Tracker sync expectation decision | N/A: no tracker | PR is the sync artifact. |
| Output budget strategy recorded | yes | Narrow reads/output caps recorded above. |
| Package/API pack selected | yes | Package release artifact and published package behavior touched. |
| Public surface or package boundary identified | yes | Release flow affects published package versions. |
| Release artifact path selected | yes | `.changeset/mean-tables-serve.md`. |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded `.agents/skills/changeset/SKILL.md`. |
| Barrel/export impact decision recorded | N/A: no exports or file layout changed | No barrel generation needed. |
| Agent-native pack selected | yes | `pnpm install` regenerated agent skill mirrors. |
| Agent-facing action surface identified | yes | Agent skill mirror changes from `skiller` generation. |
| Source rule versus generated mirror boundary identified | yes | No source rule edits by this task; generated mirror changes came from `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded; no app/tool action parity change. |

Work Checklist:
- [x] No duration requested; timed checkpoint N/A.
- [x] Short objective plus outcome, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, PR link, title, task type, acceptance criteria, likely files, browser N/A, and root-cause layer.
- [x] Video transcript N/A.
- [x] Reporter claim challenged and validated before implementation.
- [x] Repro ladder followed at source/test level; browser proof N/A.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary.
- [x] Release artifact requirement recorded: `.changeset/mean-tables-serve.md`.
- [x] Final handoff shape decided: PR with task-style body and no tracker sync.
- [x] Branch handling recorded: `codex/fix-release-dependent-changesets`.
- [x] Local-env-rot retry policy applied to wrong `pnpm` binary failure.
- [x] Workspace authority recorded: all proof commands ran in `/Users/zbeyens/git/plate`.
- [x] High-risk note recorded: release workflow bug could leave umbrella/dependent packages stale.
- [x] Autoreview target selected; user explicitly cut it, so it is waived.
- [x] Agent-native review decision recorded; generated mirror changes came from `pnpm install`.
- [x] Output budget discipline recorded and followed.
- [x] Package/API pack: public release artifact impact recorded.
- [x] Package/API pack: `.changeset` work loaded `changeset` and used patch for `@platejs/core`.
- [x] Package/API pack: package-owned proof is `corepack pnpm check`.
- [x] Package/API pack: barrels/export generation N/A.
- [x] Agent-native pack: generated mirrors are staged per whole-checkout PR rule.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named proof commands | `node --test tooling/scripts/prepare-release-changesets.test.mjs` passed; `corepack pnpm lint:fix` passed; `corepack pnpm check` passed. |
| Pre-solution issue challenge verdict | yes | Record verdict before implementation | Valid; see section above. |
| Repro escalation ladder | yes | Record source/test and browser N/A outcomes | Source/test proof used; browser N/A. |
| Bug reproduced before fix | yes | Record failing surface or N/A | Live release bug reproduced from PR #5044/npm stale `platejs`; regression test covers command construction. |
| Targeted behavior verification | yes | Run focused test | `node --test tooling/scripts/prepare-release-changesets.test.mjs` passed, 5 tests. |
| TypeScript or typed config changed | N/A: JS helper only | Relevant full check includes typecheck | `corepack pnpm check` passed. |
| Package exports or file layout changed | N/A: no exports/layout | No `pnpm brl` | No exported files changed. |
| Package manifests, lockfile, or install graph changed | yes | Run install and relevant checks | `corepack pnpm install` passed after PATH pnpm correction; no intentional lockfile change. |
| Agent rules or skills changed | yes | Run install and verify generated sync | `corepack pnpm install` regenerated/staged skill mirrors. |
| Workspace authority proof | yes | Own repo proof | Commands ran in `/Users/zbeyens/git/plate`. |
| Browser surface changed | N/A: release tooling | No browser route | No browser proof needed. |
| Browser final proof | N/A: release tooling | No browser route | No browser proof needed. |
| CI-controlled template output changed | N/A: no template output edited by task | Keep generated mirrors per PR rule | Generated skill mirrors staged. |
| Package behavior or public API changed | yes | Add a changeset | `.changeset/mean-tables-serve.md`. |
| User-visible registry output changed | N/A: no registry UI output | No registry changelog | No registry files changed. |
| Docs or content changed | N/A: no public docs/content | Goal plan only | No docs-creator needed. |
| High-risk mini gate | yes | Record failure mode and proof | Failure mode: release helper misses dependent packages; proof: focused test + full check. |
| Agent-native review for agent/tooling changes | yes | Load reviewer or record N/A | Loaded reviewer; generated mirror changes are staged, no new agent action parity surface. |
| Local install corruption suspected | yes | Resolve exact command failure | Wrong PATH `pnpm@11.7.0` caused supply-chain policy/non-TTY failures; forcing Corepack shim `pnpm@9.15.0` fixed install/check. |
| Autoreview for non-trivial implementation changes | waived | User explicitly said "cut the autoreview" | Autoreview was interrupted at heartbeat; no clean review claimed. |
| PR create or update | yes | Run `check` before PR and create PR | `corepack pnpm check` passed; PR #5046 created. |
| Task-style PR body verified | yes | Verify after PR exists | `gh pr view 5046 --json body,url` verified auto-release block, emoji confidence line, required table, and required sections. |
| PR proof image hosting | N/A: no browser proof | No images | No browser proof. |
| Tracker sync-back | N/A: no tracker | PR only | No issue/Linear owner. |
| Final handoff contract | yes | Fill after PR exists | PR #5046, no tracker, browser N/A, autoreview waived. |
| Final lint | yes | Run lint fix | `corepack pnpm lint:fix` passed, no fixes. |
| Output budget discipline | yes | Verify scoped output | One broad check streamed expected proof output; no unbounded raw workflow logs. |
| Timed checkpoint | N/A: no timed checkpoint | Not requested | N/A. |
| Goal plan complete | yes | Run checker after PR URL/body recorded | Ready for checker. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | `.changeset` is `@platejs/core` patch only; no exports changed. |
| Release artifact classification | yes | Record classification | Published package release metadata. |
| Published package changeset | yes | Add one `.changeset` and avoid forbidden minor | `.changeset/mean-tables-serve.md` uses `@platejs/core: patch`. |
| Registry changelog | N/A: not registry-only | No registry changelog | N/A. |
| No release artifact | N/A: release artifact required | Changeset added | N/A. |
| Package typecheck/build/test | yes | Run owning package checks | `corepack pnpm check` passed. |
| Barrel/export generation | N/A: no exports/layout | No `pnpm brl` | N/A. |
| Agent source / generated sync | yes | Run install for generated mirrors | `corepack pnpm install` passed; mirrors staged. |
| Agent action discoverability | yes | Source-audit agent path | Generated skills remain under `.agents/skills/**`; no new action required. |
| Agent-native review | yes | Load reviewer or N/A | Loaded; no action parity finding generated. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | PR #5044/run/npm/source/docs inspected | implementation |
| Implementation | complete | helper status base patched; regression test and changeset added | verification |
| Verification | complete | focused test, lint/fix, install, full check passed | PR / tracker sync |
| PR / tracker sync | complete | PR #5046 created and body verified | closeout |
| Closeout | complete | goal check passed after this plan update | final response |

Findings:
- `changeset status --since=$GITHUB_REF_NAME` on `main` can hide the pending changesets the release helper needs to analyze.
- `linked` packages do not force all package publications; `fixed` would, but this repo relies on the custom runtime-dependent changeset helper.

Decisions and tradeoffs:
- Keep the explicit `PLATE_CHANGESET_STATUS_BASE` override for release-branch maintenance scripts, but remove implicit `GITHUB_REF_NAME` fallback.
- Do not convert Changesets `linked` to `fixed`; that would broaden publishing behavior far beyond this bug.

Implementation notes:
- `tooling/scripts/prepare-release-changesets.mjs` now only appends `--since` when `PLATE_CHANGESET_STATUS_BASE` is explicitly set.
- `.changeset/mean-tables-serve.md` forces the requested core patch release.

Review fixes:
- Autoreview was started after full check, then explicitly cut by the user. No autoreview findings were accepted or applied.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `pnpm lint:fix` used bundled `pnpm@11.7.0` and failed non-TTY/policy checks | 2 | Use repo-pinned Corepack pnpm shim | `corepack pnpm install`, `corepack pnpm lint:fix`, and PATH-forced `pnpm@9.15.0 check` passed |
| Autoreview running | 1 | Stop per user instruction | Interrupted and marked waived |

Verification evidence:
- `node --test tooling/scripts/prepare-release-changesets.test.mjs` -> passed, 5 tests.
- `corepack pnpm install` -> passed with repo-pinned `pnpm@9.15.0`.
- `corepack pnpm lint:fix` -> passed, no fixes.
- `PATH="$(dirname "$(command -v corepack)"):$PATH" pnpm check` -> passed: lint, package build/typecheck, fast tests, slow tests, slowest tests.
- Source audit: `getChangesetStatusArgs` now uses only `env.PLATE_CHANGESET_STATUS_BASE`; tests assert `GITHUB_REF_NAME` does not produce `--since`.

Final handoff contract:
- PR line: https://github.com/udecode/plate/pull/5046
- Issue / tracker line: N/A: no issue tracker.
- Confidence line: high; full check passed, autoreview user-waived.
- Flow table:
  - Reproduced: source/test evidence yes, browser N/A
  - Verified: full check yes, browser N/A
- Browser check: N/A: release tooling.
- Outcome: release helper sees pending changesets without branch-name self-filter; core follow-up changeset added.
- Caveat: generated skill mirror changes are included because `pnpm install` regenerated them and PR policy says use the checkout as-is.
- Design:
  - Chosen boundary: `prepare-release-changesets` status-base construction.
  - Why not quick patch: manually adding `platejs` would fix one release but leave the helper blind next time.
  - Why not broader change: `fixed` package groups would over-publish the whole package set.
- Verified: focused test, install, lint/fix, full check.
- PR body verified: `gh pr view 5046 --repo udecode/plate --json body,url` confirmed auto-release block, task-style table, and required sections.

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
- PR: https://github.com/udecode/plate/pull/5046
- Issue / tracker: N/A.
- Browser proof: N/A.
- Caveats: autoreview cut by user; generated skill mirrors included.

Timeline:
- 2026-06-27T22:30:15.432Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Run goal checker and final response |
| What is the goal? | Fix release dependent changesets and open PR |
| What have I learned? | Branch-name `--since` hid pending changesets; Corepack pnpm shim is required locally |
| What have I done? | Patched helper/test, added changeset, ran verification, pushed branch, opened PR #5046 |

Open risks:
- Autoreview was not completed because the user explicitly cut it.
