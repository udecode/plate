# changeset changelog github fallback

Objective:
Fix release changelog GitHub fetch flake; done when fallback is tested, local release-version proof passes, rerun status is known, and plan check passes.

Goal plan:
docs/plans/2026-06-30-changeset-changelog-github-fallback.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- type: GitHub Actions job URL from user
- id / link: https://github.com/udecode/plate/actions/runs/28402211788/job/84156054337
- title: ReleaseOrVersionPR `Release and changelog` failure after PR #5045 merge
- acceptance criteria: identify the failing owner, rerun the failed workflow once, patch the durable release owner if rerun fails again, verify locally, and prepare a PR-ready fix.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- Failed job logs identify the exact release failure.
- `.changeset/changelog-config.js` does not abort release-version generation when GitHub metadata lookup fails.
- Tests cover the failed GitHub info path.
- Local `pnpm check` passes before PR creation.
- Rerun status is recorded.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-30-changeset-changelog-github-fallback.md` passes.

Verification surface:
- `gh run view` / job logs for run `28402211788`.
- `node --test .changeset/changelog-config.test.cjs`.
- `node --test tooling/scripts/release-workflow.test.mjs`.
- `pnpm lint:fix`, `git diff --check`, and `pnpm check`.
- PR body/readback after branch push.

Constraints:
- Keep release behavior unchanged when GitHub info lookup succeeds.
- Preserve existing changelog formatting: PR link suppresses commit link.
- Do not add a package changeset for release tooling only.
- Formal autoreview remains waived by the user's earlier instruction.

Boundaries:
- Source of truth: GitHub Actions logs and current release workflow/changelog config.
- Allowed edit scope: `.changeset/changelog-config.js`, `.changeset/changelog-config.test.cjs`, this plan, and PR metadata.
- Browser surface: N/A; release tooling only.
- Tracker sync: GitHub PR for the fix.
- Non-goals: changing Changesets dependency versions, release workflow redesign, or AI SDK package changes.

Output budget strategy:
- Use targeted job-log extracts from `/tmp/plate-job-*.log`; avoid streaming full logs after the initial accidental large log output.

Blocked condition:
- Stop only if local tests/checks fail in a way that requires a broader release-flow design choice, or if GitHub access cannot create/push the PR.

Task state:
- task_type: CI release workflow fix
- task_complexity: normal
- current_phase: verification
- current_phase_status: in_progress
- next_phase: PR
- goal_status: active

Current verdict:
- verdict: valid
- confidence: high
- next owner: current agent
- reason: the release job failed twice on the same GitHub GraphQL metadata fetch inside Changesets changelog generation.

Pre-solution issue challenge:
- reporter claim: merged PR caused a failing release job.
- suggested diagnosis or fix: N/A.
- repro ladder:
  - tests / source-level repro: job logs and mocked changelog tests cover the failing path.
  - Playwright / automated browser: N/A.
  - Browser plugin: N/A.
  - screenshot / visual proof: N/A.
- reproduction verdict: reproduced from Actions logs.
- validity verdict: valid.
- best long-term fix boundary: `.changeset/changelog-config.js`.
- harsh honest feedback: a network-close from GitHub should not brick release-version generation when deterministic PR/commit links are available.
- hard-stop decision: no hard stop.

Completion rule:
- Do not call `update_goal(status: complete)` until local verification, PR prep, and this plan checker pass.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Timed checkpoint parsed | N/A | No duration requested. |
| Skill analysis before edits | yes | Used `github:gh-fix-ci`; used autogoal because this is a verifiable CI fix. |
| Active goal checked or created | yes | `get_goal` returned none; active goal created for this CI fix. |
| Source of truth read before edits | yes | Read run/job metadata and logs for `28402211788` / `84156054337`. |
| Tracker comments and attachments read | N/A | Job URL only. |
| Video transcript evidence required | N/A | No video. |
| Pre-solution issue challenge required | yes | Job failure reproduced from Actions logs before patching. |
| Reproduction verdict before implementation | yes | Both original run and rerun failed in `pnpm ci:version`. |
| Repro escalation ladder selected | yes | Actions logs plus focused changelog tests; browser N/A. |
| Suggested fix reviewed against durable boundary | yes | Durable owner is changelog config, not one-off rerun. |
| `docs/solutions` checked for non-trivial existing-code work | N/A | Release logs and local owner were enough. |
| TDD decision before behavior change or bug fix | yes | Added regression tests for GitHub info failure fallback. |
| Branch decision for code-changing task | yes | Created `codex/fix-changeset-changelog-github-fallback` from `main`. |
| Release artifact decision | yes | No package changeset: release tooling only. |
| Browser tool decision for browser surface | N/A | No browser surface. |
| PR expectation decision | yes | Fix will be opened as a PR against `main`. |
| Tracker sync expectation decision | yes | PR body/final handoff are sync surfaces. |
| Output budget strategy recorded | yes | Targeted log extracts after initial large log fetch. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless explicitly marked hard stop. N/A: no duration requested.
- [x] Short objective plus outcome, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type, acceptance criteria, caveats, likely files/routes/packages, browser surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized XML, or marked N/A with reason.
- [x] Public failure claim challenged before implementation with a recorded verdict.
- [x] Repro escalation ladder followed for the relevant owner.
- [x] Hard-stop rule followed for bug/behavior claims.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary.
- [x] Release artifact requirement recorded.
- [x] Final handoff shape decided: PR link, CI root cause, tests, and caveat.
- [x] Branch handling recorded.
- [x] Local-env-rot retry policy recorded. N/A: failure is remote GitHub API response, reproduced on rerun.
- [x] Workspace authority recorded: local checks run in `/Users/zbeyens/git/plate`.
- [x] High-risk note recorded. Failure mode: release-version PR creation aborts on transient GitHub metadata fetch; proof plan: mocked fallback tests and root check.
- [x] Review/autoreview target selected. N/A: user cut autoreview earlier.
- [x] Agent-native review decision recorded. N/A: no agent instruction/tooling files.
- [x] Output budget discipline recorded and followed after initial oversized log output.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run log readback and local checks | Focused tests and release workflow tests passed; `pnpm check` to be recorded before PR. |
| Pre-solution issue challenge verdict | yes | Record failure and validity verdict | Original and rerun logs fail in `pnpm changeset version` with GitHub GraphQL premature close. |
| Repro escalation ladder | yes | Record relevant owner proof | Actions logs and mocked unit tests cover the release owner. |
| Bug reproduced before fix | yes | Record failing repro | Rerun job `84273207295` failed with the same `Invalid response body ... Premature close`. |
| Targeted behavior verification | yes | Run focused tests | `node --test .changeset/changelog-config.test.cjs` passed. |
| TypeScript or typed config changed | N/A | Run typecheck if changed | CommonJS release config and tests only. |
| Package exports or file layout changed | N/A | Run `pnpm brl` if needed | No package exports or file layout changed. |
| Package manifests, lockfile, or install graph changed | N/A | Run install if changed | No manifest/lockfile changes. |
| Agent rules or skills changed | N/A | Run skill sync if changed | No agent files changed. |
| Workspace authority proof | yes | Run checks in owning repo | `/Users/zbeyens/git/plate` commands recorded. |
| Browser surface changed | N/A | Capture browser proof or caveat | No browser surface. |
| Browser final proof | N/A | Attach browser proof or caveat | No browser surface. |
| CI-controlled template output changed | N/A | Restore or justify | No template output. |
| Package behavior or public API changed | N/A | Add changeset or reason | Release tooling only, not published package behavior. |
| User-visible registry output changed | N/A | Registry changelog if needed | No registry output. |
| Docs or content changed | N/A | Docs proof if needed | No docs/content. |
| High-risk mini gate | yes | Record failure mode and proof | Release PR generation fallback tested; successful GitHub metadata path remains unchanged. |
| Agent-native review for agent/tooling changes | N/A | Run agent review if needed | No agent/tooling changes. |
| Local install corruption suspected | N/A | Reinstall if suspected | Not local install corruption. |
| Autoreview for non-trivial implementation changes | N/A | Run or record reason | Waived per user's earlier "cut the autoreview". |
| PR create or update | yes | Run `check`, push branch, create PR | To be recorded after `pnpm check`. |
| Task-style PR body verified | yes | Verify PR body with `gh pr view --json body` | To be recorded after PR creation. |
| PR proof image hosting | N/A | Host proof image if needed | No images. |
| Tracker sync-back | N/A | Post tracker sync if needed | Job URL only; PR/final response enough. |
| Final handoff contract | yes | Fill final fields | Recorded below; PR URL to be added after creation. |
| Final lint | yes | Run `pnpm lint:fix` | Passed; fixed one file. |
| Output budget discipline | yes | Record accidental output and recovery | Full log output was accidentally large once; subsequent reads used `/tmp` log artifacts and focused `rg`/`tail`. |
| Timed checkpoint | N/A | Close timed loop | No duration requested. |
| Goal plan complete | yes | Run plan checker | To be recorded after full verification. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | GitHub run metadata and logs read | implementation done |
| Implementation | complete | Changelog fallback added with tests | verification |
| Verification | in_progress | Focused tests passed; root check pending | PR |
| PR / tracker sync | planned | Branch exists; PR pending root check | final response |
| Closeout | planned | Awaiting root check and plan checker | final response |

Findings:
- Original failed run `28402211788`, job `84156054337`, failed on `main` at `34fdca42f7`.
- `pnpm ci:version` failed inside `pnpm changeset version`.
- Changesets failed while generating changelog entries because `@changesets/get-github-info` received `Invalid response body while trying to fetch https://api.github.com/graphql: Premature close`.
- Manual rerun also failed with the same GraphQL premature-close error in job `84273207295`.
- The real changeset has no explicit `pr:` metadata, so the commit fallback path is required.

Decisions and tradeoffs:
- Keep GitHub metadata lookup when it succeeds.
- On lookup failure, fall back to deterministic PR and commit links from changeset metadata instead of aborting release.
- Do not change `ci:version` or wrap the whole Changesets action; the narrower owner is the changelog generator that calls GitHub metadata.

Implementation notes:
- Added `createFallbackLinks` and `readGithubLinks` to `.changeset/changelog-config.js`.
- Added tests for PR metadata fallback and commit fallback when `@changesets/get-github-info` throws.

Review fixes:
- Adjusted the PR fallback test after it caught existing changelog behavior: when a PR link exists, commit links are intentionally suppressed.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Full `gh run view --log` streamed too much output | 1 | Save job logs to `/tmp` and inspect focused slices | Used `/tmp/plate-job-*.log` with `rg` and `tail`. |
| Rerun failed workflow | 1 | Patch changelog fallback instead of relying on rerun | Rerun reproduced the same failure. |

Verification evidence:
- `/Users/zbeyens/git/plate`: `gh run view 28402211788 --repo udecode/plate` showed original failure and rerun failure.
- `/Users/zbeyens/git/plate`: `node --test .changeset/changelog-config.test.cjs` passed, 3 tests.
- `/Users/zbeyens/git/plate`: `node --test tooling/scripts/release-workflow.test.mjs` passed, 21 tests.
- `/Users/zbeyens/git/plate`: `pnpm lint:fix` passed and formatted one file.
- `/Users/zbeyens/git/plate`: `git diff --check` passed.
- `/Users/zbeyens/git/plate`: `pnpm check` pending before PR.

Final handoff contract:
- PR line: pending PR creation.
- Issue / tracker line: failed job URL and rerun status.
- Confidence line: high after root check.
- Flow table:
  - Reproduced: GitHub Actions logs, browser N/A.
  - Verified: focused tests, release workflow tests, root check, browser N/A.
- Browser check: N/A.
- Outcome: release changelog generation falls back instead of failing on GitHub metadata fetch errors.
- Caveat: existing failed main run still needs the fix merged and release workflow rerun.
- Design:
  - Chosen boundary: `.changeset/changelog-config.js`.
  - Why not quick patch: rerun failed again with same GraphQL error.
  - Why not broader change: no need to change Changesets action or workflow layout.
- Verified: focused tests and diff check passed; root check pending.
- PR body verified: pending.

Task-style PR body contract:
- Use task-style PR body after root `check` passes.

Final handoff / sync:
- PR: pending.
- Issue / tracker: GitHub Actions run `28402211788`.
- Browser proof: N/A.
- Caveats: failed main run requires merge plus rerun.

Timeline:
- 2026-06-30T11:00Z Read original job metadata and logs.
- 2026-06-30T11:00Z Reran failed workflow.
- 2026-06-30T11:01Z Rerun failed with same GraphQL metadata error.
- 2026-06-30T11:05Z Added changelog fallback and regression tests.
- 2026-06-30T11:08Z Focused tests and release workflow tests passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Verification before PR. |
| Where am I going? | Run root check, create PR, verify PR body, close goal. |
| What is the goal? | Make release changelog generation resilient to GitHub metadata fetch failures. |
| What have I learned? | The failure is reproducible in Actions rerun and owned by `.changeset/changelog-config.js`. |
| What have I done? | Patched fallback behavior, added tests, reran the failed workflow once, and ran focused checks. |

Open risks:
- The current failed `main` run cannot pass until the fix lands and the release workflow is rerun.
