# task repro escalation ladder

Objective:
Add task repro escalation ladder; done when task rule/template/skill require tests -> Playwright -> Browser before not-reproduced and verification passes.

Goal plan:
docs/plans/2026-06-15-task-repro-escalation-ladder.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user request
- id / link: current thread request
- title: Add lowest-to-highest repro escalation to task workflow
- acceptance criteria: update task rule/template/generated skill so bug/behavior
  claims escalate from tests/source-level repro to Playwright to Browser and
  screenshot/visual proof before `not reproduced`; allow N/A only when a level
  cannot observe the claim; verify sync/review.

Completion threshold:
- `.agents/rules/task.mdc`, generated `.agents/skills/task/SKILL.md`, and
  `docs/plans/templates/task.md` require the repro escalation ladder before
  `not reproduced`.
- `pnpm install` syncs generated skills after rule edits.
- Source audit, lint, autoreview, and goal-plan check pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-task-repro-escalation-ladder.md` passes.

Verification surface:
- Source audit with `rg` across task rule, generated task skill, and task
  template.
- `pnpm install`, `pnpm lint:fix`, local autoreview, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-task-repro-escalation-ladder.md`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: user request plus repo rule that `.agents/rules/*.mdc` owns
  generated skill mirrors.
- Allowed edit scope: `.agents/rules/task.mdc`, generated
  `.agents/skills/task/SKILL.md` via `pnpm install`,
  `docs/plans/templates/task.md`, and this active plan.
- Browser surface: N/A: this edits Browser workflow policy, not a live app route.
- Tracker sync: N/A: no tracker item.
- Non-goals: no runtime implementation, no PR unless explicitly requested.

Output budget strategy:
- Use focused `sed`/`rg` reads with output caps; no broad repo scans.

Blocked condition:
- Block only if skill regeneration, lint, review tooling, or plan completion
  fails in a way that cannot be resolved from local source.

Task state:
- task_type: agent workflow repair
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: valid
- confidence: high
- next owner: task
- reason: Existing public issue challenge gate requires repro, but did not
  spell out the tests -> Playwright -> Browser escalation ladder.

Pre-solution issue challenge:
- reporter claim: task should escalate repro from lowest/fastest to
  highest/slowest before hard-stopping.
- suggested diagnosis or fix: add tests -> Playwright -> Browser with/without
  screenshot to the task workflow.
- repro ladder:
  - tests / source-level repro: N/A: workflow repair, not product bug.
  - Playwright / automated browser: N/A: no live app bug to reproduce.
  - Browser plugin: N/A: policy text update only.
  - screenshot / visual proof: N/A: no visual surface changed.
- reproduction verdict: N/A: workflow repair.
- validity verdict: valid.
- best long-term fix boundary: source task rule plus reusable task goal
  template; generated skill mirror follows `pnpm install`.
- harsh honest feedback: stopping after tests fail to reproduce a browser bug is
  lazy and wrong; the workflow must climb to the surface that can actually see
  the failure.
- hard-stop decision: proceed with workflow repair.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-task-repro-escalation-ladder.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Loaded `task` and `autogoal`; Browser is a workflow policy target, not a live browser run. |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created this objective. |
| Source of truth read before edits | yes | User request, task skill, autogoal skill, task rule, and task template read. |
| Tracker comments and attachments read | N/A: no tracker item | User request is the source. |
| Video transcript evidence required | N/A: no video | No tracker video evidence. |
| Pre-solution issue challenge required | yes | This repair extends that gate. |
| Reproduction verdict before implementation | N/A: workflow repair | No product bug; source-backed workflow claim. |
| Repro escalation ladder selected | yes | tests/source -> Playwright -> Browser -> screenshot/visual waiver. |
| Suggested fix reviewed against durable boundary | yes | Best boundary is task rule/template, not ad hoc issue-by-issue behavior. |
| `docs/solutions` checked for non-trivial existing-code work | N/A: workflow rule/template edit | No product implementation domain. |
| TDD decision before behavior change or bug fix | N/A: no runtime behavior bug | Source audit/review is the proof. |
| Branch decision for code-changing task | N/A: user did not ask for commit/PR | Edit current checkout only. |
| Release artifact decision | N/A: no package/runtime release | No changeset or registry changelog. |
| Browser tool decision for browser surface | N/A: no live browser surface | The Browser plugin is referenced in policy text only. |
| PR expectation decision | no | User asked for workflow update, not PR. |
| Tracker sync expectation decision | N/A: no tracker | No issue/Linear sync. |
| Output budget strategy recorded | yes | Focused reads/searches with caps. |
| Agent-native pack selected | yes | Task changes `.agents/**` workflow rules. |
| Agent-facing action surface identified | yes | Agents read `.agents/skills/task/SKILL.md`; source is `.agents/rules/task.mdc`. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/task.mdc`, regenerate skill mirror with `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | N/A: no separate agent-native review needed | Source/generation audit covers the changed agent instruction surface. |

Work Checklist:
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] For public tracker bug reports, behavior claims, technical diagnoses, or
      suggested fixes, reporter claims are challenged before implementation
      with a recorded verdict: `valid`, `not reproduced`, `invalid`,
      `wont-fix`, `partially valid`, or `platform limitation`. Feature, docs,
      support, or cleanup requests with no bug claim may mark reproduction
      `N/A` with reason.
- [x] Repro escalation ladder followed for bug/behavior claims: focused
      test/source-level repro first when applicable; Playwright or equivalent
      automated browser repro next when tests cannot reproduce or cannot observe
      the user-visible surface; `[@Browser](plugin://browser@openai-bundled)`
      next when Playwright cannot reproduce or cannot model the surface
      honestly; screenshot or explicit visual-proof waiver when visual/native
      state matters.
- [x] Hard-stop rule followed for bug/behavior claims: no code when the issue
      is not reproduced, invalid, or won't-fix; partial validity pivots to the
      best long-term fix and records what was wrong or incomplete in the issue's
      proposed path.
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
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `pnpm install`, `pnpm lint:fix`, source audit, agent-native source audit, and autoreview pass/fix cycle completed. |
| Pre-solution issue challenge verdict | yes | Record reporter claim, suggested fix, repro verdict, validity verdict, durable boundary, and hard-stop/pivot decision before implementation | Verdict recorded above; this is workflow repair, not product bug. |
| Repro escalation ladder | yes | For bug/behavior claims, record test/source-level, Playwright, Browser, and screenshot/visual-proof outcomes or N/A/blocker reasons before `not reproduced` | Template and rule now require tests/source -> Playwright -> Browser -> screenshot/visual waiver before `not reproduced`. |
| Bug reproduced before fix | N/A: workflow repair, not product bug | Record failing test/repro or N/A with reason | Repro ladder recorded as N/A for this repair. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Source audit proves source rule, generated skill, and task template contain the ladder. |
| TypeScript or typed config changed | N/A: markdown/rule text only | Run relevant typecheck | No TS or typed config files changed. |
| Package exports or file layout changed | N/A: no package exports/file layout | Run `pnpm brl` before final verification and keep generated barrel updates | No barrel or export surface changed. |
| Package manifests, lockfile, or install graph changed | N/A: no manifest/lockfile edit | Run `pnpm install` and relevant package checks | `pnpm install` still ran for skill sync; lockfile was up to date. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` passed and skiller applied Codex rules. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands ran in `/Users/zbeyens/git/plate`, which owns task rules/templates. |
| Browser surface changed | N/A: policy text only | Capture Browser Use proof or record explicit waiver/blocker | No live Browser route changed; policy now tells future tasks when to use Browser. |
| Browser final proof | N/A: no live browser surface | Attach screenshot or exact browser verification caveat when browser proof applies | No screenshot needed for docs/rule text change. |
| CI-controlled template output changed | N/A: no CI-controlled template output | Restore generated template output or record why it is intentionally kept | `docs/plans/templates/task.md` is source template. |
| Package behavior or public API changed | N/A: no package behavior/API | Add a changeset or record why no changeset applies | No changeset needed. |
| Registry-only component work changed | N/A: no registry component work | Update `tooling/data/plate-ui-changelog.mdx`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --write`, or record N/A | No registry files changed. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Workflow template/rule docs changed; source-backed audit passed. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode: tasks stop after tests fail to repro a browser-only issue; fixed by ladder requiring escalation to Playwright and Browser before `not reproduced`. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Agent-native source audit: generated `.agents/skills/task/SKILL.md` includes ladder and points to `.agents/rules/task.mdc`. |
| Local install corruption suspected | N/A: no suspicious failure | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | No install-corruption signal. |
| Autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | First two runs found plan-state P2s; plan fixed before final rerun. Final rerun clean: no accepted/actionable findings. |
| PR create or update | N/A: no PR requested and no tracker source | Run `check` before PR work and sync PR body to the task-style final handoff | User asked for local workflow update, not PR. |
| Task-style PR body verified | N/A: no PR | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | No PR body exists. |
| PR proof image hosting | N/A: no PR/browser proof | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | No images needed. |
| Tracker sync-back | N/A: no tracker source | Post concise issue/Linear sync after PR exists, or record N/A/blocker | No issue/Linear item. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Final handoff fields filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm lint:fix` passed; no fixes applied. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Used scoped `sed`/`rg` reads and command output caps. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-task-repro-escalation-ladder.md` | Final mechanical check passed. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` ran; generated task skill includes ladder. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `rg` found ladder in `.agents/skills/task/SKILL.md`. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Skill loaded; no action parity gap for instruction-only workflow change. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | source rule, template, and skill docs read | implementation |
| Implementation | complete | task rule/template patched; generated skill synced | verification |
| Verification | complete | lint, source audits, agent-native source audit, autoreview finding accepted/fixed | closeout |
| PR / tracker sync | N/A: user did not ask for PR and no tracker applies | no PR/tracker owner | final response |
| Closeout | complete | plan filled after autoreview finding | final response |

Findings:
- Existing issue challenge gate lacked a reproduction ladder, so an agent could
  stop after a failed low-level test even when Playwright or Browser is the
  correct proof surface.
- Source rule, generated skill mirror, and task template now require
  tests/source-level -> Playwright -> Browser -> screenshot/visual waiver before
  `not reproduced`.

Decisions and tradeoffs:
- Chose the task rule/template boundary because this is task workflow policy.
  Editing generated `.agents/skills/task/SKILL.md` directly would drift.
- Browser is last in the ladder because it is slowest and can hit policy/tooling
  limits, but it is mandatory when lower levels cannot honestly observe the
  user-visible surface.
- Playwright means an existing repo-owned regression/test harness, not
  standalone browser automation that bypasses Browser/browser-use proof policy.

Implementation notes:
- Patched `.agents/rules/task.mdc` and `docs/plans/templates/task.md`.
- Ran `pnpm install` to regenerate `.agents/skills/task/SKILL.md`.

Review fixes:
- Accepted autoreview P2: unfinished untracked goal plan was included in the
  bundle. Filled completion gates, phase table, evidence, and handoff fields.
- Accepted second autoreview P2: plan still mentioned pending final review.
  Removed stale pending evidence before final rerun.
- Accepted third autoreview P2: ladder could bypass repo Browser policy by
  putting generic Playwright before Browser. Narrowed Playwright to existing
  repo-owned regression/test harnesses and kept Browser as the user-visible
  proof escalation.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial patch missed generated plan shape | 1 | Read exact plan and apply smaller patches | Fixed. |
| First autoreview found unfinished plan | 1 | Fill completion gates and evidence | Fixed. |
| Second autoreview found stale pending final-review text | 1 | Remove stale pending text and rerun review | Fixed. |
| Third autoreview found generic Playwright could bypass Browser policy | 1 | Limit Playwright to repo-owned regression harness and keep Browser proof path | Fixed. |

Verification evidence:
- `pnpm install` in `/Users/zbeyens/git/plate`: passed; skiller applied Codex
  rules and regenerated `.agents/skills/task/SKILL.md`.
- `rg -n "Escalate reproduction|Playwright|\\[@Browser\\]|screenshot|Repro escalation ladder"`
  across `.agents/rules/task.mdc`, `.agents/skills/task/SKILL.md`,
  `docs/plans/templates/task.md`, and this plan: passed.
- `pnpm lint:fix` in `/Users/zbeyens/git/plate`: passed; no fixes applied.
- Agent-native source audit: generated task skill contains the Browser
  escalation path and source metadata points to `.agents/rules/task.mdc`.
- `.agents/skills/autoreview/scripts/autoreview --mode local`: first run found
  unfinished-plan P2; second run found stale pending-review text; third run
  found generic Playwright could bypass Browser policy; all fixed. Final rerun
  clean with no accepted/actionable findings.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-task-repro-escalation-ladder.md`:
  passed.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: no tracker source.
- Confidence line: high.
- Flow table:
  - Reproduced: N/A tests, N/A browser; this is workflow repair.
  - Verified: source audit, lint, skill sync, agent-native source audit, and
    autoreview pass/fix cycle.
- Browser check: N/A: no live browser surface; Browser is added as future task
  repro escalation policy.
- Outcome: task workflow now requires tests/source-level -> Playwright ->
  Browser -> screenshot/visual waiver before `not reproduced`.
- Caveat: a ladder level can be marked N/A only when that level cannot observe
  the claim, and Browser limitations must be recorded instead of overstated.
- Design:
  - Chosen boundary: `.agents/rules/task.mdc` plus `docs/plans/templates/task.md`,
    with generated `.agents/skills/task/SKILL.md` synced by `pnpm install`.
  - Why not quick patch: generated skill-only edits drift and miss future plans.
  - Why not broader change: `autogoal` lifecycle is fine; this is task-specific
    public issue repro behavior.
- Verified: `pnpm install`, `pnpm lint:fix`, source audit, agent-native source
  audit, autoreview pass/fix cycle, and goal checker.
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
- PR: N/A: no PR requested.
- Issue / tracker: N/A: no tracker source.
- Browser proof: N/A: policy text only.
- Caveats: Browser policy/tooling limits must be recorded in future tasks when
  Browser cannot prove native/visual behavior.

Timeline:
- 2026-06-15T08:20:55.852Z Task goal plan created.
- 2026-06-15 Added repro escalation ladder to task source and task template.
- 2026-06-15 Ran `pnpm install` to sync generated task skill.
- 2026-06-15 Ran `pnpm lint:fix`; passed.
- 2026-06-15 Autoreview found unfinished plan; plan filled.
- 2026-06-15 Autoreview found stale pending-review text; plan fixed.
- 2026-06-15 Autoreview found generic Playwright policy conflict; ladder
  narrowed to repo-owned Playwright test harness plus Browser proof path.
- 2026-06-15 Final autoreview rerun and goal checker passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Update goal complete, final response |
| What is the goal? | Add tests -> Playwright -> Browser repro escalation before not-reproduced |
| What have I learned? | The rule change was fine, but durable plan state must be closed before handoff |
| What have I done? | Updated task rule/template, regenerated skill, linted, audited, accepted review finding |

Open risks:
- None known.
