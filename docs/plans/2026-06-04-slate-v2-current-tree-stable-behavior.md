# slate-v2-current-tree-stable-behavior

Objective:
Close current Slate v2 work, prove stable editor behavior, strengthen selection
oracles, promote reusable slate-browser proof, and smoke huge-document behavior.

Goal plan:
docs/plans/2026-06-04-slate-v2-current-tree-stable-behavior.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user prompt / slate-automation
- id / link: current thread
- title: Slate v2 current-tree closure and stable behavior automation
- acceptance criteria:
  - current Slate v2 uncommitted work is coherent;
  - no stale dirty fixes, fake aliases, docs/API mismatch, or orphan tests;
  - stable editor behavior is swept across richtext, plaintext, markdown
    shortcuts, history, selection/navigation, editable voids, custom
    placeholder, and hidden/dom coverage;
  - selection tests catch native/visual regressions for drag, double-click,
    blank-space click, arrow nav, undo/redo, multi-leaf selection, and scrolling
    selection where those surfaces exist;
  - repeated browser proof patterns are promoted or queued for `slate-browser`;
  - mobile/raw-device proof gap is validated honestly, not replaced by
    Playwright viewport claims;
  - huge-document correctness smoke covers typing, Enter, paste/select-all,
    undo, navigation, and scroll stability without broad pagination architecture;
  - final handoff includes changed list, workflow slowdowns, needs-review items,
    stopping checkpoints, commands, and residual risks.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Completion threshold:
- Done when current `.tmp/slate-v2` work is audited, focused behavior/browser
  proof has been run, safe oracle/helper fixes are kept or weak packets are
  reverted/quarantined, mobile/raw-device claim width is explicit, huge-document
  smoke is recorded, and the final handoff sections are filled.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-04-slate-v2-current-tree-stable-behavior.md` passes.

Verification surface:
- `.tmp/slate-v2` source/diff audit for current-tree closure.
- Focused Bun/package tests for package/API and selection/oracle changes.
- Focused Playwright examples from `.tmp/slate-v2` for stable editor behavior.
- In-app Browser or Playwright route proof for visible editor behavior where a
  local route is available.
- `slate-browser` source/API audit when helper promotion is touched.
- Mobile/raw-device proof command if available; otherwise an explicit scoped
  blocker that viewport proof is not raw-device proof.
- Huge-document route smoke with behavior assertions, not broad perf or
  pagination architecture.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: live `.tmp/slate-v2` source/tests plus
  `docs/slate-v2/agent-start.md`, `slate-north-star`, and this active plan.
- Allowed edit scope: `.tmp/slate-v2` runtime/tests/docs/proof helpers and
  parent `docs/**` plan/proof artifacts. Agent-rule edits only if the loop
  itself proves a recurring workflow miss.
- Browser surface: stable Slate example routes and huge-document smoke on the
  local dev server.
- Tracker sync: N/A: no issue/PR/tracker requested.
- Non-goals: no release/publish/changeset/PR readiness; no broad experimental
  pagination/virtualization architecture; no Plate package edits; no perf-only
  optimization packet before behavior proof.

Output budget strategy:
- Use focused `rg`, curated file lists, focused Playwright greps, and command
  output caps. Write broad evidence into this plan or artifacts instead of
  streaming full test inventories into chat.

Blocked condition:
- Block only for destructive git/commit/PR authority, unavailable raw mobile
  device lane after scoped proof is recorded, or an unsafe API/runtime fork that
  requires user taste not covered by `slate-north-star` and has no safe
  alternate owner.

Task state:
- task_type: automation / behavior-proof / oracle-repair
- task_complexity: major
- current_phase: intake
- current_phase_status: in_progress
- next_phase: implementation
- goal_status: active

Current verdict:
- verdict: active
- confidence: scoped: requirement extraction complete, implementation pending
- next owner: current-tree closure
- reason: prompt requires auditing existing Slate v2 work before new behavior
  packets.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-04-slate-v2-current-tree-stable-behavior.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance criteria above copy the latest prompt scope, non-goals, verification surfaces, and handoff sections. |
| Skill analysis before edits | yes | Read `slate-automation`, `slate-north-star`, `autogoal`, and `docs/slate-v2/agent-start.md`. |
| Active goal checked or created | yes | Created thread goal `019e6aa0-8ace-7e73-b0e9-166d6fbc4a30`. |
| Source of truth read before edits | yes | `docs/slate-v2/agent-start.md`, `slate-north-star`, and live `.tmp/slate-v2` root listed. |
| Tracker comments and attachments read | N/A | No tracker issue or attachment in this prompt. |
| Video transcript evidence required | N/A | No video attached to this prompt. |
| `docs/solutions` checked for non-trivial existing-code work | N/A | This is current Slate v2 live-tree proof, not solution lookup. |
| TDD decision before behavior change or bug fix | yes | Add/repair tests before runtime changes when a new behavior bug/oracle gap is found. |
| Branch decision for code-changing task | N/A | User wants to stay on v2/current checkout; no branch work requested. |
| Release artifact decision | N/A | Slate v2 private alpha; no release/publish/changeset/PR readiness requested. |
| Browser tool decision for browser surface | yes | Use in-app Browser for visual smoke when route is running; use Playwright for replayable assertions. |
| PR expectation decision | N/A | No PR requested. |
| Tracker sync expectation decision | N/A | No tracker sync requested. |
| Output budget strategy recorded | yes | Focused commands and capped output; broad evidence goes to plan/artifacts. |
| Browser pack selected | yes | Stable routes plus huge-document smoke. |
| Browser route / app surface identified | yes | `richtext`, `plaintext`, `markdown-shortcuts`, `editable-voids`, `custom-placeholder`, `hidden-content-blocks`/DOM coverage, `huge-document`. |
| Browser tool decision recorded | yes | Browser visual proof where available, Playwright for behavior assertions. |
| Console/network caveat policy recorded | yes | Check console/network for route proof or record blocker. |
| Package/API pack selected | yes | Current-tree closure includes package/API alias and contract audit. |
| Public surface or package boundary identified | yes | `.tmp/slate-v2/packages/slate`, `slate-react`, and `slate-browser` as touched/likely surfaces. |
| Release artifact path selected | N/A | Private alpha, no published user-visible delta flow requested. |
| `changeset` skill loaded when `.changeset` is required | N/A | No changeset authority in this run. |
| Barrel/export impact decision recorded | pending | Audit current diff before deciding. |
| Agent-native pack selected | yes | Automation may repair workflow rules only if a recurring miss is proven. |
| Agent-facing action surface identified | yes | `slate-automation`, `slate-browser` proof helper docs/API, and `slate-north-star` taste gaps. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**`, not generated `.agents/skills/**`, if skill repair is needed. |
| `agent-native-reviewer` loaded or waiver recorded | pending | Load only if agent-rule changes become necessary. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
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
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-04-slate-v2-current-tree-stable-behavior.md` | pending |
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
- None yet.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- Pending.

Slate automation ledger:

Packet ledger:
| Packet | Owner | Hypothesis / failure signature | Files / commands | Proof | Decision | Next |
|--------|-------|--------------------------------|------------------|-------|----------|------|
| P0 | requirement extraction | Prompt constraints must be durable before implementation to avoid compaction misses. | This plan; `slate-north-star`; `slate-automation`; `docs/slate-v2/agent-start.md` | Requirement rows filled before current-tree audit. | keep | Current-tree closure |

Workflow slowdowns:
| Step / command | Owner | Why slow | Evidence | Repair decision |
|----------------|-------|----------|----------|-----------------|
| none yet | N/A | N/A | N/A | N/A |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | none yet |
| tests/oracles/browser proof | none yet |
| benchmarks/metrics/targets | none |
| examples/docs | `docs/plans/2026-06-04-slate-v2-current-tree-stable-behavior.md` created/filled |
| skills/workflow | none yet |
| reverted/quarantined packets | none yet |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Raw mobile proof claim width | Playwright mobile viewport cannot prove raw device keyboard/IME/clipboard behavior. | Mobile/raw-device packet | Inspect if unavailable; accept scoped claim only. |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| none yet | N/A | N/A | N/A | N/A | N/A | N/A | N/A |

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
- 2026-06-04T19:29:10.317Z Task goal plan created.

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
