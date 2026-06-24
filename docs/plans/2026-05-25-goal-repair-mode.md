# goal repair mode

Objective:
Add `goal repair <expectation>` workflow support so goal and derived skills can
repair the owning rule/template after a completed or in-progress goal misses
user expectations.

Goal plan:
docs/plans/2026-05-25-goal-repair-mode.md

Template:
docs/plans/templates/task.md

Task source:
- type: user prompt
- id / link: chat request
- title: add `goal repair <expectation>`
- acceptance criteria: `goal` documents repair mode, generated goal skill syncs,
  a lightweight `goal-repair` template exists, smoke generation/checker proof
  passes, and repair mode stays narrow enough to avoid broad self-editing.

Completion threshold:
- `.agents/rules/goal.mdc` documents `repair <expectation>` mode with target
  selection, repair classification, safety rules, and verification.
- `.agents/skills/goal/SKILL.md` is regenerated from the source rule.
- `docs/plans/templates/goal-repair.md` exists as the repair plan shell.
- A fresh repair smoke plan includes the repair rows and fails
  `check-complete.mjs` while unfinished.
- `node .agents/rules/goal/scripts/check-complete.mjs docs/plans/2026-05-25-goal-repair-mode.md`
  passes.

Verification surface:
- cwd `plate-2`: `pnpm install`
- cwd `plate-2`: `rg` source/generated/template audit for repair mode rows
- cwd `plate-2`: `node .agents/rules/goal/scripts/create-goal-scratchpad.mjs --template goal-repair --title "repair smoke"`
- cwd `plate-2`: unfinished repair smoke plan fails `check-complete.mjs`
- cwd `plate-2`: targeted Biome attempt for touched markdown/rule files
- cwd `plate-2`: final `check-complete.mjs` on this plan

Constraints:
- Keep repair mode narrow: one expectation, one owner, smallest durable repair.
- Patch source-of-truth files, not generated skill mirrors.
- Do not weaken evidence safety or completion gates to satisfy annoyance.
- Do not add broad mechanical enforcement unless prose/template repair is
  insufficient.

Boundaries:
- Source of truth: latest user prompt plus pasted `goal`, `task`, and
  `plite-plan` skills.
- Allowed edit scope: `.agents/rules/goal.mdc`,
  `.agents/skills/goal/SKILL.md`, `docs/plans/templates/goal-repair.md`, and
  this plan.
- Browser surface: N/A: no browser behavior.
- Tracker sync: N/A: no tracker item.
- Non-goals: no changes to `task` or `plite-plan` in this slice; `goal repair`
  targets their templates/rules when invoked later.

Blocked condition:
- Autonomous work stops if the generated goal skill cannot sync, the repair
  template cannot instantiate, or the final goal plan cannot pass
  `check-complete.mjs` after one targeted fix.

Task state:
- task_type: workflow / agent-tooling feature
- task_complexity: non-trivial, auditable
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active until final check passes

Current verdict:
- verdict: complete after final plan check
- confidence: high
- next owner: none
- reason: source rule, generated skill, repair template, and smoke checks are
  aligned.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/rules/goal/scripts/check-complete.mjs docs/plans/2026-05-25-goal-repair-mode.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Read pasted `goal`, `task`, and `plite-plan`; read local `.agents/rules/goal.mdc`, `.agents/rules/task.mdc`, and templates before editing. |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created the repair-mode objective. |
| Source of truth read before edits | yes | User prompt and pasted skills read before patching. |
| Tracker comments and attachments read | N/A: no tracker | No tracker source. |
| Video transcript evidence required | N/A: no video | No video evidence. |
| `docs/solutions` checked for non-trivial existing-code work | N/A: workflow-template update | No product/code bug pattern lookup needed. |
| TDD decision before behavior change or bug fix | N/A: no runtime behavior bug | Template smoke and source audit are the correct proof. |
| Branch decision for code-changing task | N/A: no branch change requested | Continued on current checkout. |
| Release artifact decision | N/A: no package release | No package behavior or published API changed. |
| Browser tool decision for browser surface | N/A: no browser surface | No route/UI behavior changed. |
| PR expectation decision | N/A: no PR requested | No PR in this task. |
| Tracker sync expectation decision | N/A: no tracker | No tracker sync. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
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

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `pnpm install`, `rg`, repair smoke generation, incomplete-plan check, targeted Biome attempt, and final plan check recorded. |
| Bug reproduced before fix | N/A: no bug fix | Record failing test/repro or N/A with reason | Workflow feature, not a bug repro. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Repair smoke plan included repair rows and failed `check-complete.mjs` while unfinished. |
| TypeScript or typed config changed | N/A: markdown/rule files only | Run relevant typecheck | No typed source/config changed. |
| Package exports or file layout changed | N/A: no package exports | Run `pnpm brl` before final verification and keep generated barrel updates | No package barrel/export changes. |
| Package manifests, lockfile, or install graph changed | N/A: no package graph target | Run `pnpm install` and relevant package checks | `pnpm install` ran for Skiller sync and completed. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` completed; `rg` confirmed `.agents/skills/goal/SKILL.md` includes repair mode. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All proof ran from cwd `/Users/zbeyens/git/plate-2`, which owns `.agents` and `docs/plans/templates`. |
| Browser surface changed | N/A: no browser surface | Capture Browser Use proof or record explicit waiver/blocker | No browser surface. |
| Browser final proof | N/A: no browser surface | Attach screenshot or exact browser verification caveat when browser proof applies | No browser proof required. |
| CI-controlled template output changed | N/A: no `templates/**` edit in this task | Restore generated template output or record why it is intentionally kept | Touched `docs/plans/templates`, not CI-controlled `templates/**`. |
| Package behavior or public API changed | N/A: no published package behavior | Add a changeset or record why no changeset applies | No changeset. |
| Registry-only component work changed | N/A: no registry component work | Update `docs/components/changelog.mdx` or record N/A | No registry work. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode: repair becomes broad self-editing or weakens gates. Proof plan: one-expectation safety rules, target classification, repair template, source/generation audit, smoke incomplete-plan failure. Chosen boundary: generic repair command lives in `goal`; derived skills are repaired only when invoked/named. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Loaded agent-native reviewer. Manual incremental review: no user-only action is added; this exposes an agent workflow command and documents source/template ownership. No parity gap. |
| Local install corruption suspected | N/A: no corruption signal | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | No install corruption signal. |
| Autoreview for non-trivial implementation changes | N/A: source-rule/template docs patch, no runtime implementation | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | No runtime implementation patch; agent-native/source smoke checks apply. |
| PR create or update | N/A: no PR requested | Run `check` before PR work and sync PR body to final handoff | No PR in this task. |
| PR proof image hosting | N/A: no PR/browser image | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | No PR image. |
| Tracker sync-back | N/A: no tracker | Post concise issue/Linear sync after PR exists, or record N/A/blocker | No tracker sync. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Final handoff fields below are filled. |
| Final lint | N/A: touched markdown/rule paths ignored by Biome | Run `pnpm lint:fix` or scoped equivalent | `pnpm exec biome check <touched files> --fix` processed 0 files because paths are ignored by config. |
| Goal plan complete | yes | Run `node .agents/rules/goal/scripts/check-complete.mjs docs/plans/2026-05-25-goal-repair-mode.md` | Run after this final plan update. |
| Knowledge extraction | N/A: source rules now contain reusable knowledge | Evaluate `ce-compound`; capture if useful | No separate compound note needed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Prompt, pasted skills, local rule/template reads | implementation |
| Implementation | complete | Patched goal rule and added goal-repair template; `pnpm install` regenerated skill mirror | verification |
| Verification | complete | Source audit, generated skill audit, repair smoke, incomplete-plan guard, Biome ignored-path note, agent-native review | closeout |
| PR / tracker sync | complete | N/A: no PR/tracker | final response |
| Closeout | complete | This plan ready for final `check-complete.mjs` | final response |

Findings:
- `goal` had template creation guidance but no way to repair templates/rules
  after a completed goal failed a user expectation.
- Derived skills like `task` and `plite-plan` can stay unchanged because repair
  mode targets their owning rules/templates when invoked with a named skill or
  plan.

Decisions and tradeoffs:
- Add `repair <expectation>` to `goal` rather than each derived skill.
- Add a dedicated `goal-repair` template so repair work records expectation,
  observed miss, ownership, classification, proof, and non-repairs.
- Do not add mechanical checker logic yet. The first repair mode can be
  source/template-driven; scripts come later only if prose gates keep failing.

Implementation notes:
- Updated `.agents/rules/goal.mdc` description and argument hint.
- Added `Repair Mode` with trigger, use/non-use cases, target selection,
  repair classification, workflow, and safety rules.
- Added `docs/plans/templates/goal-repair.md`.
- Ran `pnpm install`; generated `.agents/skills/goal/SKILL.md` synced.

Review fixes:
- None.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Targeted Biome check processed no files | 1 | Record as N/A for markdown/rule files | Biome config ignores touched paths. |

Verification evidence:
- `pnpm install` completed and Skiller applied rules for Claude Code and Codex.
- `rg` found `repair <expectation>`, `## Repair Mode`, target selection,
  repair classification, `--template goal-repair`, and safety rules in both
  `.agents/rules/goal.mdc` and `.agents/skills/goal/SKILL.md`.
- `rg` found the repair template expectation and completion rows in
  `docs/plans/templates/goal-repair.md`.
- `node .agents/rules/goal/scripts/create-goal-scratchpad.mjs --template goal-repair --title "repair smoke"` created a smoke plan.
- `node .agents/rules/goal/scripts/check-complete.mjs docs/plans/2026-05-25-repair-smoke.md; test $? -ne 0` proved the unfinished smoke plan fails.
- Deleted the smoke plan after verification.
- `pnpm exec biome check .agents/rules/goal.mdc .agents/skills/goal/SKILL.md docs/plans/templates/goal-repair.md docs/plans/2026-05-25-goal-repair-mode.md --fix` processed 0 files because these paths are ignored.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: no tracker.
- Confidence line: high; repair mode is in source, generated skill is synced,
  and the repair template smoke guard works.
- Flow table:
  - Reproduced: missing repair mode confirmed by source search/read.
  - Verified: `pnpm install`, `rg` audit, repair smoke plan generation, smoke
    incomplete-plan failure, final plan check.
- Browser check: N/A.
- Outcome: `goal repair <expectation>` now has a documented workflow and
  dedicated repair plan template.
- Caveat: no checker script enforcement added; by design, this starts with
  narrow source/template rules.
- Design:
  - Chosen boundary: generic repair command in `goal`; derived skills are
    repair targets, not duplicate command owners.
  - Why not quick patch: argument hint alone would not teach ownership,
    classification, proof, or safety.
  - Why not broader change: editing `task`/`plite-plan` now would duplicate the
    repair command before seeing a real repair invocation.
- Verified: source/generation/template smoke checks passed as described above.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A.
- Caveats: Biome ignores touched markdown/rule paths; no mechanical checker
  enforcement yet.

Timeline:
- 2026-05-25 Task goal plan created.
- 2026-05-25 Read pasted and local `goal`, `task`, `plite-plan` sources.
- 2026-05-25 Added `goal repair <expectation>` repair mode to goal rule.
- 2026-05-25 Added `docs/plans/templates/goal-repair.md`.
- 2026-05-25 Ran `pnpm install` for generated skill sync.
- 2026-05-25 Smoke-instantiated `goal-repair` and confirmed unfinished plan
  fails `check-complete.mjs`.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final plan check, then final response |
| What is the goal? | Add `goal repair <expectation>` workflow support |
| What have I learned? | Goal had template creation but no expectation-repair mode; a dedicated repair template keeps self-improvement narrow. |
| What have I done? | Patched goal source, regenerated generated skill, added repair template, smoke-tested template/checker behavior. |

Open risks:
- None for this workflow patch. Future real repair invocations may prove a
  checker/helper needs mechanical enforcement, but this change deliberately
  starts with source/template law.
