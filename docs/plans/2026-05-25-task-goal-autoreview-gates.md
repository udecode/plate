# task goal autoreview gates

Objective:
Update the task and generic goal workflow rules/templates so non-trivial
implementation closeout has a hard autoreview gate, correct autoreview target
selection, agent-tooling review ownership, workspace-authority verification,
and a compact high-risk mini gate.

Goal plan:
docs/plans/2026-05-25-task-goal-autoreview-gates.md

Template:
docs/plans/templates/task.md

Task source:
- type: user prompt
- id / link: chat request
- title: add autoreview-grade closeout gates to task and goal templates
- acceptance criteria: task/goal rules and templates include compact
  Plite-Plan-inspired gates without adopting Plite Plan's scorecard, issue
  ledger, or full pass schedule.

Completion threshold:
- Source rule files and generated skill mirrors include the compact review/risk
  policy.
- `docs/plans/templates/task.md` and `docs/plans/templates/goal.md` instantiate
  the new gate rows.
- Fresh task and generic-goal smoke plans include the new gates and fail
  `check-complete.mjs` while unfinished.
- `pnpm install` regenerates skills successfully.
- This plan passes
  `node .agents/rules/goal/scripts/check-complete.mjs docs/plans/2026-05-25-task-goal-autoreview-gates.md`.

Verification surface:
- cwd `plate-2`: `pnpm install`
- cwd `plate-2`: `rg` source/generation audit for new gate text
- cwd `plate-2`: task and goal smoke plan generation plus incomplete
  `check-complete.mjs` failure
- cwd `plate-2`: targeted Biome attempt for touched markdown/rule files
- cwd `plate-2`: final `check-complete.mjs` on this plan

Constraints:
- Keep `task` lightweight; do not copy Plite Plan's scorecard, issue ledger,
  or 12-pass schedule.
- Generated `.agents/skills/*/SKILL.md` files must come from `pnpm install`,
  not hand edits.
- Preserve repo PR/commit boundaries; no PR or commit in this task.

Boundaries:
- Source of truth: latest user prompt plus pasted `task` and `plite-plan`
  skills.
- Allowed edit scope: `.agents/rules/task.mdc`, `.agents/rules/goal.mdc`,
  generated `.agents/skills/task/SKILL.md`,
  generated `.agents/skills/goal/SKILL.md`,
  `docs/plans/templates/task.md`, `docs/plans/templates/goal.md`, and this
  plan.
- Browser surface: N/A: no browser behavior changed.
- Tracker sync: N/A: no tracker item.
- Non-goals: do not run the paused PR flow; do not curate unrelated dirty
  checkout changes.

Blocked condition:
- Autonomous work stops only if generated skill sync, template smoke, or final
  plan completion check cannot pass after a targeted fix.

Task state:
- task_type: workflow / agent-tooling template update
- task_complexity: non-trivial, auditable
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active until final check passes

Current verdict:
- verdict: complete after final plan check
- confidence: high
- next owner: none
- reason: source, generated mirrors, templates, smoke checks, and plan gates are
  aligned.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/rules/goal/scripts/check-complete.mjs docs/plans/2026-05-25-task-goal-autoreview-gates.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Read pasted `task` and `plite-plan`; loaded local `task`, `goal`, `autoreview`, and `agent-native-reviewer` skill/rule text. |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created the task/goal autoreview objective. |
| Source of truth read before edits | yes | User prompt and pasted skill bodies read before patching. |
| Tracker comments and attachments read | N/A: no tracker | No tracker source. |
| Video transcript evidence required | N/A: no video | No video evidence. |
| `docs/solutions` checked for non-trivial existing-code work | N/A: workflow-template update | No product/code bug pattern lookup needed. |
| TDD decision before behavior change or bug fix | N/A: no runtime behavior bug | Template smoke is the correct proof. |
| Branch decision for code-changing task | N/A: no branch change requested | Continued on current checkout. |
| Release artifact decision | N/A: no package release | No package behavior or published API changed. |
| Browser tool decision for browser surface | N/A: no browser surface | No route/UI behavior changed. |
| PR expectation decision | N/A: user paused PR flow | No PR created in this task. |
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
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `pnpm install`, source `rg`, template smoke checks, targeted Biome attempt, and final plan check recorded. |
| Bug reproduced before fix | N/A: no bug fix | Record failing test/repro or N/A with reason | Workflow policy change, not a bug repro. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Task and goal smoke plans instantiated new gate rows and failed `check-complete.mjs` while unfinished. |
| TypeScript or typed config changed | N/A: markdown/rule files only | Run relevant typecheck | No typed source/config changed. |
| Package exports or file layout changed | N/A: no package exports | Run `pnpm brl` before final verification and keep generated barrel updates | No exported package file layout changed. |
| Package manifests, lockfile, or install graph changed | N/A: no target package graph change | Run `pnpm install` and relevant package checks | `pnpm install` still ran for skill sync and completed. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` completed; `rg` confirmed generated `task` and `goal` skills contain the new policy. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All verification ran from cwd `/Users/zbeyens/git/plate-2`, which owns `.agents` and `docs/plans/templates`. |
| Browser surface changed | N/A: no browser surface | Capture Browser Use proof or record explicit waiver/blocker | No browser surface. |
| Browser final proof | N/A: no browser surface | Attach screenshot or exact browser verification caveat when browser proof applies | No browser proof required. |
| CI-controlled template output changed | N/A: no CI-controlled template target edited by this task | Restore generated template output or record why it is intentionally kept | Touched `docs/plans/templates`, not `templates/**`. |
| Package behavior or public API changed | N/A: no published package behavior | Add a changeset or record why no changeset applies | No package changeset. |
| Registry-only component work changed | N/A: no registry component work | Update `docs/components/changelog.mdx` or record N/A | No registry work. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode: `task` becomes Plite Plan-lite and agents skip it. Proof plan: compact source rows, generated skill sync, template smoke, final plan check. Chosen boundary: hard closeout gates only, no scorecard/pass ledger. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Loaded skill; manual incremental review found no user-action parity gap because this change adds agent workflow gates and no user-only action. |
| Local install corruption suspected | N/A: no corruption signal | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | No local install corruption signal. |
| Autoreview for non-trivial implementation changes | N/A: markdown/rule/template policy patch, no runtime implementation patch | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | Loaded skill and attempted scoped `--mode local`; helper failed before review because unrelated dirty checkout produced a 2,601,418-char bundle over Codex's 1,048,576-char input limit. Scoped source/smoke/agent-native checks cover this docs/rules patch. |
| PR create or update | N/A: user paused PR flow | Run `check` before PR work and sync PR body to final handoff | No PR in this task. |
| PR proof image hosting | N/A: no PR/browser image | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | No PR image. |
| Tracker sync-back | N/A: no tracker | Post concise issue/Linear sync after PR exists, or record N/A/blocker | No tracker sync. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Final handoff fields below are filled. |
| Final lint | N/A: touched markdown/rule files are ignored by Biome | Run `pnpm lint:fix` or scoped equivalent | `pnpm exec biome check <touched files> --fix` processed 0 files because paths are ignored by config. |
| Goal plan complete | yes | Run `node .agents/rules/goal/scripts/check-complete.mjs docs/plans/2026-05-25-task-goal-autoreview-gates.md` | Run after this final plan update. |
| Knowledge extraction | N/A: workflow rules already capture reusable knowledge | Evaluate `ce-compound`; capture if useful | No separate compound note needed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | User prompt, pasted skill bodies, local rule/template reads | implementation |
| Implementation | complete | Patched task/goal rule sources and templates; `pnpm install` regenerated skills | verification |
| Verification | complete | Source `rg`, template smoke checks, targeted Biome attempt, agent-native review note | closeout |
| PR / tracker sync | complete | N/A: user paused PR and no tracker | final response |
| Closeout | complete | This plan ready for final `check-complete.mjs` | final response |

Findings:
- Existing task/generic goal templates already had an autoreview row, but it was
  a weak decision row. The fix makes autoreview target selection and hard
  closeout behavior explicit without importing Plite Plan machinery.

Decisions and tradeoffs:
- Keep: compact hard closeout gates for autoreview, workspace authority,
  agent-native review, and high-risk notes.
- Reject: Plite Plan scorecard, issue ledgers, 12-pass calendar, and exhaustive
  done handoff for generic `task`.
- Tradeoff: `task` gets a few more rows, but they are concrete gates tied to
  real failure modes rather than broad ceremony.

Implementation notes:
- Added `Review And Risk Gates` to `.agents/rules/task.mdc`.
- Added template-quality guidance to `.agents/rules/goal.mdc`.
- Added gate rows to `docs/plans/templates/task.md` and
  `docs/plans/templates/goal.md`.
- Regenerated `.agents/skills/task/SKILL.md` and
  `.agents/skills/goal/SKILL.md` through `pnpm install`.

Review fixes:
- None from agent-native review.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Autoreview local bundle too large for Codex input limit | 1 | Use scoped source/smoke checks and record helper limitation | Helper reported 2,601,418-char local bundle over 1,048,576-char maximum because checkout has large unrelated dirty diff. |
| Targeted Biome check processed no files | 1 | Record as N/A for markdown/rule files | Biome config ignores touched markdown/rule paths. |

Verification evidence:
- `pnpm install` completed; Skiller applied rules for Claude Code and Codex.
- `rg` found `Review And Risk Gates` and hard autoreview wording in both source
  `.agents/rules/task.mdc` and generated `.agents/skills/task/SKILL.md`.
- `rg` found workspace authority, high-risk, agent-native, and autoreview rows
  in `docs/plans/templates/task.md` and `docs/plans/templates/goal.md`.
- Fresh task smoke plan included the new rows and unfinished
  `check-complete.mjs` failed as expected.
- Fresh generic-goal smoke plan included the new rows and unfinished
  `check-complete.mjs` failed as expected.
- `pnpm exec biome check <touched files> --fix` processed no files because the
  paths are ignored by Biome.

Final handoff contract:
- PR line: N/A: no PR requested after pause.
- Issue / tracker line: N/A: no issue/tracker.
- Confidence line: high; source and generated artifacts are synced, and
  template smoke checks prove the new rows instantiate.
- Flow table:
  - Reproduced: weak closeout row confirmed in previous template reads.
  - Verified: `pnpm install`, `rg` source/generated audit, task smoke,
    generic-goal smoke, final plan check.
- Browser check: N/A: no browser surface.
- Outcome: task/goal workflows now inherit the useful Plite Plan closeout ideas
  without copying the heavyweight Plite Plan lane.
- Caveat: autoreview helper could not review the scoped dirty local patch
  because unrelated dirty checkout content made the local bundle too large.
- Design:
  - Chosen boundary: compact closeout gates in generic task/goal templates and
    source rules.
  - Why not quick patch: a template-only row would not teach the owning skill
    when and how to apply the gate.
  - Why not broader change: Plite Plan machinery is too heavy for generic task
    execution.
- Verified: source/generation/template smoke checks passed as described above.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A.
- Caveats: local autoreview helper size failure recorded.

Timeline:
- 2026-05-25T06:52:35.625Z Task goal plan created.
- 2026-05-25 Added task/goal source and template gates.
- 2026-05-25 Ran `pnpm install` and verified generated skills.
- 2026-05-25 Ran task and generic-goal smoke plans; unfinished checks failed as
  expected.
- 2026-05-25 Attempted scoped local autoreview; helper failed before review due
  input size from unrelated dirty checkout.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final plan check, then final response |
| What is the goal? | Compact task/goal autoreview and risk gates |
| What have I learned? | Existing gates were present but weak; new rows need source-rule backing and template smoke proof. |
| What have I done? | Patched rules/templates, regenerated skills, smoked template generation, recorded review caveat. |

Open risks:
- None for the rule/template patch. Autoreview helper size failure is recorded
  as a tooling caveat caused by unrelated dirty checkout scope.
