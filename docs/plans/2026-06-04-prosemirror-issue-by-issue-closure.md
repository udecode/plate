# ProseMirror Issue By Issue Closure

Objective:
Process ProseMirror issue closure rows one by one from `#1` to the last issue, reopening prior mass defers and closing only with exact proof, verified tests, invalid skips, or real blockers.

Goal plan:
docs/plans/2026-06-04-prosemirror-issue-by-issue-closure.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user-requested Slate automation issue-by-issue closure loop
- id / link: `.tmp/editor-issue-harvester/prosemirror/full/issue-closure-ledger.tsv`
- title: ProseMirror all-issues closure ledger, full issue-by-issue loop
- acceptance criteria:
  - start from `.tmp/editor-issue-harvester/prosemirror/full/issue-closure-ledger.tsv`
  - process issues in ascending issue number order until the last issue
  - every relevant issue needs its own checkmark
  - cluster/matrix coverage is routing only, never closure
  - for each issue: read title/body/classification; decide skip vs relevant; if irrelevant mark `invalid-skip` with concrete reason; if relevant search exact Slate v2 / Plate coverage; if exact coverage exists link file:line/test name and run focused command; if no coverage exists write the smallest correct regression/contract/browser test; run focused verification; update `issue-closure-overrides.json`; regenerate ledger; move next
  - use autogoal checkpoints aggressively: one checkpoint per complex/runtime issue or one per 10 trivial skip/covered issues
  - do not stop after a batch summary
  - continue until all ledger rows are checked, a real blocker prevents progress, or commit is explicitly needed
  - final handoff must include issues checked, tests written, existing tests linked, skips/deferred with reasons, remaining unchecked count, next issue number, changed files, commands run, and anything needing attention

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Completion threshold:
- Prior mass `deferred-with-owner` rows from the earlier broad pass are reopened to `needs-test-audit` before this loop.
- The loop processes rows in ascending issue number order from the first unchecked row.
- A relevant row is closed only by:
  - exact existing Slate v2 / Plate coverage linked to file:line and test name, with focused command passing;
  - a newly written smallest correct Slate v2 / Plate regression/contract/browser test, with focused command passing;
  - `invalid-skip` with concrete non-portable/support/product reason; or
  - a genuine blocker/defer with reason when proof cannot be created safely in the current run.
- Completion is legal only when unchecked relevant count is `0`, or a real blocker is recorded with remaining count and next issue number.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-04-prosemirror-issue-by-issue-closure.md` passes.

Verification surface:
- Issue source: `.tmp/editor-issue-harvester/prosemirror/full/issues-all-with-bodies.json`.
- Classification source: `.tmp/editor-issue-harvester/prosemirror/full/classified-issues.json`.
- Override source: `.tmp/editor-issue-harvester/prosemirror/full/issue-closure-overrides.json`.
- Ledger source: `.tmp/editor-issue-harvester/prosemirror/full/issue-closure-ledger.tsv`.
- Ledger regeneration: `node .tmp/editor-issue-harvester/prosemirror/full/build-closure-ledger.mjs`.
- Per-issue proof: focused Slate v2 / Plate command recorded in the override and handoff.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `slate-automation`, `slate-north-star`, `editor-test-harvester`, `clawsweeper`, ProseMirror issue artifacts, current `.tmp/slate-v2` tests/source, and Plate coverage when exact coverage exists.
- Allowed edit scope: `.tmp/editor-issue-harvester/prosemirror/full/**`, this plan, and new/updated focused Slate v2 tests/oracles when a relevant issue lacks exact coverage. Plate rows may be searched for exact coverage; do not patch Plate unless the row truly belongs there and the test is the smallest correct owner.
- Browser surface: focused Playwright routes in `.tmp/slate-v2` or exact Plate proof when used.
- Tracker sync: N/A: no GitHub mutations requested.
- Non-goals: no cluster-level closure; no fake coverage; no broad architecture rewrite from issue titles; no commits/PRs unless explicitly requested.

Output budget strategy:
- Write per-issue checkpoints to `.tmp/editor-issue-harvester/prosemirror/full/checkpoints/`.
- Print only batch counts, focused proof output, and next issue pointers.
- Do not stream issue bodies or broad `rg "test("` dumps into chat; save broad discovery to artifacts when needed.

Blocked condition:
- Block only if a row requires a proof surface that cannot be created safely without broad architecture/API choice, raw device/browser access, external credential, destructive cleanup, or explicit commit authority, and no safe next issue can be processed.

Task state:
- task_type: external issue closure loop with test/oracle repair
- task_complexity: major
- current_phase: issue-by-issue implementation
- current_phase_status: in_progress
- next_phase: implementation
- goal_status: active

Current verdict:
- verdict: pending
- confidence: in_progress
- next owner: process issue `#345`
- reason: strict issue-by-issue loop is active; latest checkpoint closed through `#342` with ledger regenerated and `848` relevant rows still unchecked.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-04-prosemirror-issue-by-issue-closure.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | This plan captures ledger path, ascending order, per-issue 10-step loop, autogoal checkpoint cadence, no batch-summary stop, completion/blocked rules, and final handoff sections. |
| Skill analysis before edits | yes | `slate-automation` provided by user; `autogoal`, `editor-test-harvester`, `clawsweeper`, and `slate-north-star` used from current session context. |
| Active goal checked or created | yes | Created active goal for ProseMirror issue-by-issue closure. |
| Source of truth read before edits | yes | Existing ProseMirror issue ledger and issue body/classification artifacts exist under `.tmp/editor-issue-harvester/prosemirror/full`. |
| Tracker comments and attachments read | N/A | GitHub issue bodies/comments already fetched to scratch artifact; no tracker mutation. |
| Video transcript evidence required | N/A | No video input. |
| `docs/solutions` checked for non-trivial existing-code work | pending | Check only when an issue requires runtime/test patch with prior-solution risk. |
| TDD decision before behavior change or bug fix | yes | Missing exact coverage means write the smallest correct regression/contract/browser test first, then verify. |
| Branch decision for code-changing task | N/A | Stay on current checkout; no branch work requested. |
| Release artifact decision | N/A | Slate v2 private alpha; no release/publish/changeset/PR requested. |
| Browser tool decision for browser surface | yes | Use focused `.tmp/slate-v2` Playwright commands for browser behavior rows. |
| PR expectation decision | N/A | No PR requested. |
| Tracker sync expectation decision | N/A | No GitHub issue comments/labels requested. |
| Output budget strategy recorded | yes | Per-issue checkpoints/artifacts, capped chat output. |
| Browser pack selected | pending | pending |
| Browser route / app surface identified | pending | pending |
| Browser tool decision recorded | pending | pending |
| Console/network caveat policy recorded | pending | pending |
| Package/API pack selected | pending | pending |
| Public surface or package boundary identified | pending | pending |
| Release artifact path selected | pending | Choose one: `.changeset`, registry changelog, or `N/A: no published user-visible delta` |
| `changeset` skill loaded when `.changeset` is required | pending | pending |
| Barrel/export impact decision recorded | pending | pending |
| Agent-native pack selected | pending | pending |
| Agent-facing action surface identified | pending | pending |
| Source rule versus generated mirror boundary identified | pending | pending |
| `agent-native-reviewer` loaded or waiver recorded | pending | pending |

Work Checklist:
- [ ] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [ ] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [ ] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [ ] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [ ] Nearby repo instructions and implementation patterns read before edits.
- [ ] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [ ] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [ ] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [ ] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [ ] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
- [ ] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [ ] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [ ] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [ ] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [ ] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [ ] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [ ] Browser pack: browser proof uses the repo-approved browser tool or records a blocker/waiver.
- [ ] Browser pack: console and network errors are checked or explicitly out of scope.
- [ ] Browser pack: screenshot, trace, or exact verification caveat is ready for final handoff.
- [ ] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [ ] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [ ] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [ ] Package/API pack: registry-only work updates `docs/components/changelog.mdx` instead of adding a package changeset.
- [ ] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [ ] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [ ] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [ ] Package/API pack: generated barrels or release notes are updated when required.
- [ ] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [ ] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [ ] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [ ] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Run the command, proof, source audit, or artifact check named in this plan | pending |
| Bug reproduced before fix | pending | Record failing test/repro or N/A with reason | pending |
| Targeted behavior verification | pending | Run focused test/proof for changed behavior or record N/A | pending |
| TypeScript or typed config changed | pending | Run relevant typecheck | pending |
| Package exports or file layout changed | pending | Run `pnpm brl` before final verification and keep generated barrel updates | pending |
| Package manifests, lockfile, or install graph changed | pending | Run `pnpm install` and relevant package checks | pending |
| Agent rules or skills changed | pending | Run `pnpm install` and verify generated skill sync | pending |
| Workspace authority proof | pending | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | pending |
| Browser surface changed | pending | Capture Browser Use proof or record explicit waiver/blocker | pending |
| Browser final proof | pending | Attach screenshot or exact browser verification caveat when browser proof applies | pending |
| CI-controlled template output changed | pending | Restore generated template output or record why it is intentionally kept | pending |
| Package behavior or public API changed | pending | Add a changeset or record why no changeset applies | pending |
| Registry-only component work changed | pending | Update `docs/components/changelog.mdx` or record N/A | pending |
| Docs or content changed | pending | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | pending |
| High-risk mini gate | pending | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | pending |
| Agent-native review for agent/tooling changes | pending | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | pending |
| Local install corruption suspected | pending | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | pending |
| Autoreview for non-trivial implementation changes | pending | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | pending |
| PR create or update | pending | Run `check` before PR work and sync PR body to the task-style final handoff | pending |
| Task-style PR body verified | pending | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | pending |
| PR proof image hosting | pending | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | pending |
| Tracker sync-back | pending | Post concise issue/Linear sync after PR exists, or record N/A/blocker | pending |
| Final handoff contract | pending | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | pending |
| Final lint | pending | Run `pnpm lint:fix` or scoped equivalent | pending |
| Output budget discipline | pending | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-04-prosemirror-issue-by-issue-closure.md` | pending |
| Browser interaction proof | pending | Exercise the target route/interaction with the approved browser tool or record blocker | pending |
| Browser console/network check | pending | Record console/network state or why it is not applicable | pending |
| Browser final proof artifact | pending | Record screenshot/trace/route proof or exact caveat | pending |
| Public API / package boundary proof | pending | Source-audit public API, exports, and package boundary impact | pending |
| Release artifact classification | pending | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | pending |
| Published package changeset | pending | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/slate`, `@platejs/core`, or `platejs` | pending |
| Registry changelog | pending | If the change is registry-only under `apps/www/src/registry/**`, update `docs/components/changelog.mdx` and do not add a package changeset | pending |
| No release artifact | pending | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | pending |
| Package typecheck/build/test | pending | Run owning package checks or record N/A with reason | pending |
| Barrel/export generation | pending | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | pending |
| Agent source / generated sync | pending | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | pending |
| Agent action discoverability | pending | Source-audit the skill/rule path an agent will read | pending |
| Agent-native review | pending | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | in_progress | created plan | implementation |
| Implementation | pending | | verification |
| Verification | pending | | closeout |
| PR / tracker sync | pending | | final response |
| Closeout | pending | | final response |

Findings:
- None yet.

Decisions and tradeoffs:
- None yet.

Implementation notes:
- Checkpoints written through `#85` under `.tmp/editor-issue-harvester/prosemirror/full/checkpoints/`.
- New focused Slate-v2 tests added for PageDown scroll stability, toolbar collapsed-link insertion, multi-code-unit beforeinput deletion, repeated external drops, and rich HTML whitespace paste.
- Checkpoint `#86`-`#126` added focused tests for list-start Enter, click-to-collapse selection, triple-click through read-only inline content, multi-paragraph typing replacement, and surrogate-pair word delete.
- Runtime fix: expanded text insertion over fully selected sibling blocks now replaces those blocks with inserted text while preserving following blocks; select-all deletion still leaves an editable block.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- Ledger regenerated after `#86`-`#126`: `uncheckedRelevant: 956`; next unchecked relevant issue is `#127`.
- Focused proof commands are recorded per checked issue in `.tmp/editor-issue-harvester/prosemirror/full/issue-closure-overrides.json`.

Final handoff contract:
- PR line: pending
- Issue / tracker line: pending
- Confidence line: pending
- Flow table:
  - Reproduced: tests pending, browser pending
  - Verified: tests pending, browser pending
- Browser check: pending
- Outcome: pending
- Caveat: pending
- Design:
  - Chosen boundary: pending
  - Why not quick patch: pending
  - Why not broader change: pending
- Verified: pending
- PR body verified: pending

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
- PR: pending
- Issue / tracker: pending
- Browser proof: pending
- Caveats: pending

Timeline:
- 2026-06-04T05:34:23.941Z Task goal plan created.
- 2026-06-04 strict ProseMirror ledger loop closed checked rows through `#85`, regenerated the ledger, and wrote checkpoint `.tmp/editor-issue-harvester/prosemirror/full/checkpoints/issues-0063-0085.md`.
- 2026-06-04 strict ProseMirror ledger loop closed checked rows through `#126`, regenerated the ledger, and wrote checkpoint `.tmp/editor-issue-harvester/prosemirror/full/checkpoints/issues-0086-0126.md`.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake and source read |
| Where am I going? | Implementation, verification, PR/tracker sync, closeout |
| What is the goal? | TODO: Fill from Objective |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Pending.
