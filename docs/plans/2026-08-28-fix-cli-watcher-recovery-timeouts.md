# Fix CLI watcher recovery timeouts

Objective:
Fix the two CLI watcher recovery timeouts; done when both isolated tests pass 5
consecutive runs and CLI/Core gates pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-28-fix-cli-watcher-recovery-timeouts.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- type: direct user request
- id / link: N/A
- title: Fix two existing CLI file-watcher timeouts
- acceptance criteria: both named tests stop timing out at 60 seconds, pass in
  isolation for 5 consecutive runs, and pass in the owning CLI and Core gates

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: no timed checkpoint requested
- initial confidence score: N/A; exact pass counts are stronger
- improvement loop: reproduce, distinguish watcher hypotheses, patch owner,
  rerun exact cases, then owning gates
- final score / loop closure: N/A; close on exact verification threshold

Completion threshold:
- `recovers when the editor module is recreated` passes 5 consecutive isolated
  runs with no retry and no timeout.
- `ignores unrelated files while waiting for a missing deep dependency` passes
  5 consecutive isolated runs with no retry and no timeout.
- The full `packages/cli/test/generate.test.ts`, `@platejs/cli` test lane, and
  `pnpm check:core` pass on the final code.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-28-fix-cli-watcher-recovery-timeouts.md` passes.

Verification surface:
- Focused Bun test-name runs for the two exact tests.
- Full CLI generator spec and `@platejs/cli` package tests.
- Scoped CLI typecheck/lint and repository `pnpm check:core`.
- Source audit confirming temporary diagnosis instrumentation is removed.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: the user request, the two existing red tests in
  `packages/cli/test/generate.test.ts`, and the watcher implementation they
  exercise.
- Allowed edit scope: `packages/cli` watcher/generator implementation and its
  directly owned tests; this plan only outside that scope.
- Browser surface: N/A; filesystem watcher behavior is Node/Bun tooling.
- Browser strategy: N/A; no browser-visible behavior.
- Tracker sync: N/A; no tracker item.
- Non-goals: increasing the 60-second timeout, adding sleeps/retries, weakening
  assertions, changing editor generation semantics, or touching public package
  API/export shape.

Output budget strategy:
- Read only the two test blocks, watcher owner, and direct helpers. Cap test
  output and use focused test-name filters before any aggregate gate.

Blocked condition:
- Block only if the timeout persists after three distinct source-backed watcher
  fixes and no further hypothesis can be falsified locally. Ordinary failing
  tests are not blockers.

Task state:
- task_type: tooling bug
- task_complexity: non-trivial
- current_phase: closeout
- current_phase_status: complete
- next_phase: none
- goal_status: complete

Current verdict:
- verdict: fixed; both watcher recovery paths complete in about two seconds
  instead of timing out at 60 seconds
- confidence: high; exact isolated stress, full spec, package, typecheck, lint,
  and Core gates pass
- next owner: none
- reason: the watcher retains its last-good graph for a missing entry and does
  not create redundant Chokidar roots for recursively observed directories

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-28-fix-cli-watcher-recovery-timeouts.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact two-test repair, no timeout paper-over, and pass thresholds recorded |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | `task`, `autogoal`, `testing`, and `tdd` loaded; no browser/package/docs pack applies |
| Active goal checked or created | yes | Goal created with this plan path and exact pass threshold |
| Source of truth read before edits | yes | Read both red tests, `packages/cli/src/watch.ts`, neighboring watcher tests, and the prior TS7 watcher plan |
| Tracker comments and attachments read | no | N/A: direct user request |
| Video transcript evidence required | no | N/A: no recording |
| `docs/solutions` checked for non-trivial existing-code work | yes | No matching solution; prior `docs/plans/2026-08-12-plate-cli-typescript-7-codegen.md` establishes one controller, missing-dependency recovery, coalescing, and disposal contracts |
| TDD decision before behavior change or bug fix | yes | Existing two tests are the red behavior contracts; fix implementation before changing assertions |
| Branch decision for code-changing task | yes | Work in the current checkout; no branch/PR requested |
| Release artifact decision | yes | N/A: internal test reliability/implementation repair with no published API or feature delta; re-evaluate if package behavior changes |
| Browser tool decision for browser surface | no | N/A: filesystem watcher tooling |
| PR expectation decision | no | N/A: user did not request PR/commit/push |
| Tracker sync expectation decision | no | N/A: no tracker item |
| Output budget strategy recorded | yes | Exact source reads and focused test filters first; aggregate output capped |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/P1 autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Both tests passed five isolated runs; full spec, package, and Core gates passed |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | Both exact isolated tests timed out at 60 seconds before the patch |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Five isolated passes per test plus a final combined pass |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm turbo typecheck --filter=./packages/cli` passed |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no export or file-layout change |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no dependency metadata changed |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no agent source changed |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | CLI tests ran in `packages/cli`; package/Core gates ran at repository root |
| Browser surface changed | no | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | N/A: Node filesystem watcher only |
| Browser final proof | no | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | N/A: no browser surface |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no template output touched |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | N/A: `@platejs/cli` does not exist on `main`; main-relative changeset policy forbids branch-only release notes |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: no registry work |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A: only this execution plan changed |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risk: a skipped root could miss a later dependency; actual-root bookkeeping, unwatch cleanup, watcher corpus, and Core proof cover it |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent/tool instruction surface changed |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: deterministic source-level watcher race, not install corruption |
| P1 autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P1` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>`; fix and rerun within the hard cap of three helper invocations for one unchanged scope, then stop and report any remaining accepted/actionable findings; use P2 or P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | N/A: repository policy forbids `autoreview` on `next`; final diff received direct source review plus full proof |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: user did not request a PR |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR or browser proof |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker item |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | Final `pnpm --filter @platejs/cli lint:fix` passed, followed by focused tests/typecheck |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | One oversized trace recorded; instrumentation removed and later output capped |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-28-fix-cli-watcher-recovery-timeouts.md` | All acceptance and handoff fields complete; checker is the final command |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | exact tests, watcher owner, Chokidar 4 source, and prior plan read | implementation |
| Implementation | complete | repaired last-good graph retention and actual-root bookkeeping | verification |
| Verification | complete | exact stress, 66-test spec, 84-test package lane, typecheck, lint, and Core pass | closeout |
| PR / tracker sync | complete | N/A: neither requested nor attached | final response |
| Closeout | complete | plan, source audit, and final completion checker complete | final response |

Findings:
- Both existing tests reproduce the exact 60-second timeout in isolation.
- `watchEditors` watches the entry directory and nearest existing ancestors for
  missing sources, then dynamically refreshes targets after regeneration.
- The failure contracts are distinct but share one owner: re-adding a deleted
  entry and creating a previously missing deep import must both produce a
  regeneration event without reacting to unrelated files.
- Falsifiable hypotheses: Chokidar cached an ignored missing subtree; dynamic
  ancestor replacement loses the first add; the logical missing source is
  dropped during failed rediscovery; or the queued run loses a follow-up event.
- Chokidar 4.0.3 treats every dynamic `watcher.add()` as another initial crawl.
  With `ignoreInitial: true`, a dependency created during that crawl can be
  recorded without emitting the `add` event that triggers regeneration.
- Failed regeneration for a deleted entry also replaces its last-good source
  graph with broad attempted discovery, producing unnecessary dynamic watch
  roots while the test is waiting to recreate the entry.

Decisions and tradeoffs:
- Keep the existing tests unchanged during diagnosis. Longer timeouts, sleeps,
  retries, and weaker assertions would hide the watcher bug.
- Preserve the last-good source graph while the entry itself is absent. There
  is no new module graph to discover until that entry returns.
- Treat directories reached by Chokidar's existing recursive root as observed,
  and do not add them again as independent roots. Keep `watchedTargets` as the
  actual explicit root set so later unwatch decisions remain accurate.

Implementation notes:
- Repair `packages/cli/src/watch.ts`; public APIs and existing test contracts
  stay unchanged.
- Missing entry failures retain the last successful dependency graph until the
  entry returns.
- Directories discovered through an active recursive root are tracked as
  observed. They are not added as fresh Chokidar roots, and observation state
  is cleared when an actual root or directory disappears.

Review fixes:
- Direct source review found stale observed-directory state after an explicit
  root is unwatched. `forgetObservedDirectory` clears that subtree for both
  `unwatch` and `unlinkDir`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Env-gated watcher trace printed the entire source-target graph | 1 | Narrow source inspection to Chokidar's add/ignoreInitial path and remove instrumentation | Temporary tracing removed; subsequent commands are output-capped |
| First completion check found the Closeout phase still marked in progress | 1 | Mark the already-finished phase complete and rerun the same checker | Plan status aligned with completed proof |

Verification evidence:
- Before fix: each named test timed out at 60 seconds in an exact isolated run.
- Focused stress: each named test passed 5 consecutive isolated runs without
  retries; runs completed in 1.8-2.0 seconds.
- Final combined focused run: 2 passed, 0 failed in 4.41 seconds.
- Full generator spec: 66 passed, 0 failed in 90.71 seconds.
- Package lane: `pnpm --filter @platejs/cli test` passed 84 tests.
- Typecheck: `pnpm turbo typecheck --filter=./packages/cli` passed.
- Final scoped format/lint fix passed; the final focused tests and typecheck
  passed afterward.
- Core: `pnpm check:core` passed, including the uncached CLI batch with both
  repaired watcher tests.
- Source audit: no temporary diagnosis instrumentation remains; `git diff
  --check` passed for the owned source and plan.

Final handoff contract:
- PR line: N/A; no PR requested
- Issue / tracker line: N/A; direct user request
- Confidence line: high; isolated stress and exact Core failure lane are green
- Flow table:
  - Reproduced: both exact tests timed out at 60 seconds; browser N/A
  - Verified: exact, spec, package, typecheck, lint, and Core green; browser N/A
- Browser check: N/A; Node filesystem watcher behavior
- Outcome: recreated entries and newly created deep dependencies trigger their
  first regeneration event without a redundant Chokidar crawl.
- Caveat: none known; release note intentionally omitted because the package
  has no `main` baseline.
- Design:
  - Chosen boundary: the shared watch-root controller in `watchEditors`
  - Why not quick patch: longer waits or retries leave the swallowed event bug
  - Why not broader change: generation/session APIs are correct and unchanged
- Verified: all completion-threshold commands passed
- PR body verified: N/A; no PR

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
- PR: N/A; no PR requested
- Issue / tracker: N/A; direct user request
- Browser proof: N/A; Node filesystem watcher only
- Caveats: none known

Timeline:
- 2026-08-28T21:09:02.506Z Task goal plan created.
- 2026-08-28: Reproduced both exact 60-second timeouts and audited the watcher
  controller plus prior watcher architecture plan.
- 2026-08-28: Confirmed Chokidar 4 suppresses add events during redundant
  `ignoreInitial` crawls; repaired actual-root bookkeeping and missing-entry
  recovery.
- 2026-08-28: Passed five isolated runs per case, the 66-test generator spec,
  84-test package lane, CLI typecheck/lint, and `pnpm check:core`.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final user handoff |
| What is the goal? | Fix both CLI watcher recovery timeouts without retries or longer timeouts |
| What have I learned? | See Findings |
| What have I done? | Repaired watcher roots and passed every named gate; see Timeline |

Open risks:
- None known. The watcher corpus covers missing entry, missing deep import,
  initial failure, alias, JavaScript, tsconfig, multi-editor, and startup races.
