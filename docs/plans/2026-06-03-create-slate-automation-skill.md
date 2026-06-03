# create slate automation skill

Objective:
Create slate-automation skill; done when source rule is added, generated skill syncs, and agent-native audit passes; plan docs/plans/2026-06-03-create-slate-automation-skill.md.

Goal plan:
docs/plans/2026-06-03-create-slate-automation-skill.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: chat request
- id / link: current thread
- title: Create `slate-automation` overnight supervisor skill
- acceptance criteria: source rule exists; generated skill exists; no runtime-question policy is explicit; skill repair authority is explicit; Browser/Playwright vision proof and docs consolidation are included; generated mirror is synced and audited.

Completion threshold:
- `.agents/rules/slate-automation.mdc` exists and defines the supervisor contract.
- `pnpm install` generates `.agents/skills/slate-automation/SKILL.md`.
- Source audit proves no runtime questions, self-grill, skill repair, vision proof, and decision consolidation survived generation.
- Agent-native audit has no accepted/actionable findings.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-create-slate-automation-skill.md` passes.

Verification surface:
- `pnpm install`
- `test -f .agents/skills/slate-automation/SKILL.md`
- `rg` source audit across `.agents/rules/slate-automation.mdc` and generated `SKILL.md`
- agent-native source audit

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `.agents/rules/slate-automation.mdc`; generated mirror is `.agents/skills/slate-automation/SKILL.md`.
- Allowed edit scope: `.agents/rules/slate-automation.mdc`, generated skill mirror from `pnpm install`, this goal plan.
- Browser surface: N/A for creating the skill; the skill itself requires Browser/Playwright/screenshot proof when browser surfaces are in scope.
- Tracker sync: N/A.
- Non-goals: do not run the new overnight automation loop; do not commit/push/PR.

Output budget strategy:
- Use focused reads and `rg` probes only; do not stream all generated skills.

Blocked condition:
- Block only if `pnpm install` cannot generate the skill mirror and no local source fix is available.

Task state:
- task_type: agent workflow skill creation
- task_complexity: normal
- current_phase: closeout
- current_phase_status: done
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: done
- confidence: high
- next owner: final response
- reason: source rule and generated skill exist; mirror sync and source audit passed.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-create-slate-automation-skill.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Loaded `skill-creator`, `autogoal`, and `agent-native-reviewer`; previous audit read Slate skill owners. |
| Active goal checked or created | yes | `get_goal` returned none; created implementation goal. |
| Source of truth read before edits | yes | Source owner is `.agents/rules/*.mdc`; audit plan and current rules were read before edit. |
| Tracker comments and attachments read | no | N/A: chat-driven skill creation. |
| Video transcript evidence required | no | N/A: no media evidence needed. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: agent workflow skill creation; prior memory audit covered Slate AR boundaries. |
| TDD decision before behavior change or bug fix | no | N/A: no runtime behavior bug fix. |
| Branch decision for code-changing task | no | N/A: no branch/PR requested. |
| Release artifact decision | no | N/A: no package release artifact. |
| Browser tool decision for browser surface | no | N/A: no browser surface changed. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker sync requested. |
| Output budget strategy recorded | yes | Focused reads and `rg` probes only. |
| Agent-native pack selected | yes | Applied `agent-native`. |
| Agent-facing action surface identified | yes | `slate-automation` skill command. |
| Source rule versus generated mirror boundary identified | yes | `.agents/rules/slate-automation.mdc` is source; `.agents/skills/slate-automation/SKILL.md` is generated mirror. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded reviewer; source audit has no findings. |

Work Checklist:
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
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `pnpm install`, generated file existence check, `rg` source audit, agent-native audit passed. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: skill creation, not runtime bug fix. |
| Targeted behavior verification | no | Run focused test/proof for changed behavior or record N/A | N/A: no runtime behavior changed. |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: markdown skill rule only. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package exports. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | `pnpm install` ran for skill sync; no package graph change expected. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` passed and generated `.agents/skills/slate-automation/SKILL.md`. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All proof ran in `/Users/zbeyens/git/plate-2`, the skill source workspace. |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: skill text only; skill itself defines Browser proof policy. |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: no package release. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Skill source and private plan changed; source audit verifies claims. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risk: supervisor could pause too much or hide specialist ownership. Proof: `No Runtime Questions`, `Cadence`, and `Authority` sections preserve boundaries. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Loaded reviewer; no findings. Command is discoverable and can repair the same workflow actions a human operator would perform. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no corruption signal. |
| Autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | N/A: agent rule text only; agent-native audit is the relevant review. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled for skill creation. |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent | N/A: markdown-only skill rule; `pnpm install` was the required generator/sync. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Focused reads and capped output only. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-create-slate-automation-skill.md` | Passed after repairing stale template rows. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` passed; generated `.agents/skills/slate-automation/SKILL.md` exists and points to `.agents/rules/slate-automation.mdc`. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | Metadata exposes `name: slate-automation` and description/argument hint. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Loaded reviewer; PASS, no findings. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | created plan; loaded skill-creator and agent-native reviewer; prior audit read Slate skill owners | complete |
| Implementation | complete | added `.agents/rules/slate-automation.mdc`; ran `pnpm install` to generate mirror | complete |
| Verification | complete | generated file exists; source audit found required sections in source and mirror | complete |
| PR / tracker sync | complete | N/A: no PR/tracker requested | complete |
| Closeout | complete | final response pending | final response |

Findings:
- The source-of-truth boundary is `.agents/rules/slate-automation.mdc`; generated `.agents/skills/slate-automation/SKILL.md` includes metadata `name: slate-automation` and `skiller.source`.
- `slate-automation` explicitly does not ask routine runtime questions. It self-grills from code/docs/tests/Browser/Playwright/benchmarks and stops only for true authority boundaries.
- The skill has explicit authority to repair skill source rules for proven workflow misses, then run `pnpm install` and verify generated mirrors.
- Vision proof is first-class: Browser, screenshots, Playwright geometry, and human-like editor journeys are required when browser-visible surfaces are touched.
- Decision consolidation is a late-phase owner so accepted decisions move into active plans, `docs/slate-v2/**`, `docs/research/**`, or `.agents/rules/**` instead of being lost in chat.

Decisions and tradeoffs:
- Kept `slate-automation` as a supervisor, not another perf/patch/planning specialist.
- Kept no-runtime-questions policy. The supervisor self-grills and records a blocker only for real authority boundaries.
- Accepted user boundary: skill-rule repair is allowed for proven workflow misses.
- Did not create bundled scripts. The skill is routing/procedure policy; existing tools and specialist skills own execution.

Implementation notes:
- Added `.agents/rules/slate-automation.mdc`.
- Ran `pnpm install`, which generated `.agents/skills/slate-automation/SKILL.md`.

Review fixes:
- Agent-native review: PASS, no findings. The action is discoverable as a skill and can perform the same source-rule repair workflow a human operator would perform manually.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Goal checker failed on missing `Goal plan complete` evidence, stale reboot status, and open risks. | 1 | Fill stale rows and rerun checker. | Resolved; rerun passed. |

Verification evidence:
- `pnpm install` passed in `/Users/zbeyens/git/plate-2`.
- `test -f .agents/skills/slate-automation/SKILL.md` passed.
- `sed -n '1,260p' .agents/skills/slate-automation/SKILL.md` confirmed generated metadata and content.
- `rg -n "No Runtime Questions|self-grills|Allowed skill repair|Vision Proof|Decision Consolidation|pnpm install|Do not hand-edit generated|status -> gap scan" .agents/rules/slate-automation.mdc .agents/skills/slate-automation/SKILL.md` found required source and mirror sections.
- `rg -n "slate-automation" .agents/skills .agents/rules .agents/AGENTS.md AGENTS.md` confirmed source and generated skill discovery.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-create-slate-automation-skill.md` passed.

Final handoff contract:
- PR line: N/A
- Issue / tracker line: N/A
- Confidence line: high
- Flow table:
  - Reproduced: N/A, skill creation
  - Verified: source/generator audit passed; browser N/A
- Browser check: N/A, no browser surface changed
- Outcome: `slate-automation` skill created and generated
- Caveat: the skill has not been used on a real overnight loop yet
- Design:
  - Chosen boundary: supervisor skill that routes specialists and repairs workflow sources
  - Why not quick patch: patching `slate-ar-perfect` would bloat a broad shortcut
  - Why not broader change: no need to rewrite all Slate AR skills; supervisor can route and repair them
- Verified: `pnpm install`, generated file existence, source/mirror `rg`, agent-native audit
- PR body verified: N/A

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
- PR: N/A
- Issue / tracker: N/A
- Browser proof: N/A
- Caveats: skill has not yet run on a real overnight target.

Timeline:
- 2026-06-03T10:54:01.069Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final response |
| What is the goal? | Create `slate-automation` and verify source/generated skill sync |
| What have I learned? | Supervisor belongs in a new skill; it must not pause per loop, and it may repair skill rules for proven workflow misses |
| What have I done? | Added source rule, ran `pnpm install`, verified generated mirror, and ran agent-native audit |

Open risks:
- The skill has not yet been exercised on a live overnight automation target.
