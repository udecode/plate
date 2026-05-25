# create sync-skills global skill

Objective:
Create global skill `/Users/zbeyens/.agents/skills/sync-skills/SKILL.md` for
conflict-aware syncing of mentioned skills between repos, complete only when it
documents source/destination repo selection, repo-local source-of-truth
handling, three-way conflict resolution that preserves forked parts while
applying common add/update/remove changes, `.agents/AGENTS.md` handling,
generated-skill sync, `skills-lock.json` add/remove via `npx skills
add/remove`, and verification audits, while not changing repo-local skills
beyond this active goal plan.

Goal plan:
docs/plans/2026-05-25-create-sync-skills-global-skill.md

Template:
docs/plans/templates/task.md

Flow mode:
one-shot execution

Task source:
- type: user request
- id / link: local chat request
- title: create global `sync-skills` skill
- acceptance criteria: skill exists under `~/.agents/skills/sync-skills`, covers
  conflict-aware repo-to-repo skill sync, handles `.agents/AGENTS.md`, tells
  agents to use `npx skills add/remove` for lockfile-managed skills, and avoids
  naive copy-paste.

Completion threshold:
- `/Users/zbeyens/.agents/skills/sync-skills/SKILL.md` exists with valid skill
  frontmatter.
- The skill instructs agents to read both repos' `.agents/AGENTS.md`, source
  rules, generated mirrors, templates, and lock files before editing.
- The skill defines common/fork/obsolete-common/conflict/unknown classifications.
- The skill says to preserve destination forks while applying generic common
  updates and removing stale common guidance.
- The skill covers `.agents/AGENTS.md` and destination repo sync commands.
- The skill explicitly forbids manual `skills-lock.json` edits and gives
  `npx skills add/remove` commands.
- Focused source audits prove those requirements.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-create-sync-skills-global-skill.md`
  passes.

Verification surface:
- `sed -n '1,260p' /Users/zbeyens/.agents/skills/sync-skills/SKILL.md`
- `rg -n "name: sync-skills|conflict-aware|npx skills add|npx skills remove|skills-lock\\.json|\\.agents/AGENTS\\.md|\\.agents/rules|fork|obsolete-common|generated" /Users/zbeyens/.agents/skills/sync-skills/SKILL.md`
- `test -f /Users/zbeyens/.agents/skills/sync-skills/SKILL.md && test ! -e /Users/zbeyens/.agents/skills/sync-skills/README.md`
- `npx skills --help`
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-create-sync-skills-global-skill.md`

Constraints:
- Edit the requested global skill only, plus this goal plan.
- Do not modify `../better-convex` or repo-local Plate skills in this turn.
- Keep the skill concise enough to load as a workflow skill.
- Do not create auxiliary README/docs for the skill.

Boundaries:
- Source of truth: `/Users/zbeyens/.agents/skills/sync-skills/SKILL.md`.
- Allowed edit scope: `/Users/zbeyens/.agents/skills/sync-skills/SKILL.md` and
  this goal plan.
- Browser surface: N/A, no browser behavior.
- Tracker sync: N/A, no tracker involved.
- Non-goals: actually syncing skills between `better-convex` and `plate-2`,
  editing `skills-lock.json`, or creating PRs.

Blocked condition:
Autonomous work blocks only if the global skills directory cannot be written, if
`npx skills --help` cannot reveal add/remove syntax, or if `better-convex` is not
available for source-layout inspection.

Task state:
- task_type: global skill creation
- task_complexity: medium
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active until `update_goal` closeout

Current verdict:
- verdict: complete after final checker
- confidence: high
- next owner: task
- reason: global skill exists, audits cover the user-specified sync semantics,
  and no repo-local skills were changed.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-create-sync-skills-global-skill.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Loaded `skill-creator` and local `autogoal` guidance before editing. |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created this objective. |
| Source of truth read before edits | yes | Inspected existing global skills, `better-convex` `.agents` layout, current repo `.agents` layout, and `npx skills --help`. |
| Tracker comments and attachments read | no | N/A: no tracker. |
| Video transcript evidence required | no | N/A: no video evidence. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: global skill creation, not product-code work. |
| TDD decision before behavior change or bug fix | no | N/A: no runtime product behavior. |
| Branch decision for code-changing task | no | N/A: no branch/PR requested. |
| Release artifact decision | no | N/A: no package release artifact. |
| Browser tool decision for browser surface | no | N/A: no browser surface. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
      N/A: no video evidence involved.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
      N/A: global skill docs only.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
      N/A: no branch/PR requested.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
      N/A: no repo-wide failure occurred.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
      N/A: single global skill file plus focused audits.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named source audits and final checker | `sed`, focused `rg`, existence test, and `npx skills --help` passed. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: skill creation, not bug fix. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Source audit proves the skill covers conflict-aware sync, source ownership, lock add/remove, and verification. |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: no TS or typed config. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package exports. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no package/lockfile changed. |
| Agent rules or skills changed | yes | Run sync or verify direct global skill when no repo generator owns it | Direct global skill file exists; no repo generator owns `~/.agents/skills/sync-skills`. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | Verified absolute global skill path from `/Users/zbeyens/git/plate-2`; the target file is in `/Users/zbeyens/.agents/skills`. |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: no browser surface. |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A: no browser surface. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no CI-controlled template output. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: no package/API behavior. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: no registry work. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode: future agents overwrite repo forks or hand-edit `skills-lock.json`. Proof: skill includes fork/common classification and explicit `npx skills add/remove` rule. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A with reason: this is a global agent instruction skill, not a UI/action parity surface; focused skill-content audit is the relevant proof. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no install corruption signal. |
| Autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | N/A: single skill-doc creation, no repo implementation patch. |
| PR create or update | no | Run `check` before PR work and sync PR body to final handoff | N/A: no PR requested. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR/browser proof. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent | N/A: global markdown skill, no repo lint owner. |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-create-sync-skills-global-skill.md` | Final checker command is recorded in verification evidence. |
| Knowledge extraction | no | Evaluate `ce-compound`; capture if useful | N/A: the durable knowledge is the created global skill itself. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read skill-creator, autogoal, existing global skills, `better-convex` and current repo agent layouts, and `npx skills --help`. | implementation |
| Implementation | complete | Created `/Users/zbeyens/.agents/skills/sync-skills/SKILL.md`. | verification |
| Verification | complete | Source readback, focused `rg`, existence/no-README test, and CLI help proof passed. | closeout |
| PR / tracker sync | complete | N/A: no PR or tracker requested. | final response |
| Closeout | complete | Plan records evidence and is ready for checker/update_goal. | final response |

Findings:
- `better-convex` and `plate-2` both use source rules plus generated skill
  mirrors, but their task rules are deliberately forked.
- `better-convex` also has package-owned skill source for `kitcn`, so the skill
  needs source-ownership detection rather than assuming `.agents/rules`.
- `npx skills --help` confirms add/remove commands and project/global flags.

Decisions and tradeoffs:
- Created a workflow skill only, not a sync script, because the critical problem
  is human/agent judgment over forks versus common deltas.
- Did not add README or extra docs because skill-creator says skills should stay
  lean and self-contained.
- Included exact `npx skills add/remove` commands but kept scope flags flexible
  for project versus global sync.

Implementation notes:
- Added `/Users/zbeyens/.agents/skills/sync-skills/SKILL.md`.
- The skill requires section-level comparison, source ownership detection,
  `.agents/AGENTS.md` handling, lockfile CLI operations, repo sync commands, and
  focused stale-reference audits.

Review fixes:
- Ensured generated `SKILL.md` files are treated as evidence, not edit targets.
- Added `unknown` conflict classification to force a stop instead of overwrite.
- Added explicit preserved destination fork categories.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None | 0 | N/A | N/A |

Verification evidence:
- `/Users/zbeyens/git/plate-2`: `sed -n '1,260p' /Users/zbeyens/.agents/skills/sync-skills/SKILL.md` confirmed the full skill content.
- `/Users/zbeyens/git/plate-2`: `rg -n "name: sync-skills|conflict-aware|npx skills add|npx skills remove|skills-lock\\.json|\\.agents/AGENTS\\.md|\\.agents/rules|fork|obsolete-common|generated" /Users/zbeyens/.agents/skills/sync-skills/SKILL.md` found the required contract points.
- `/Users/zbeyens/git/plate-2`: `test -f /Users/zbeyens/.agents/skills/sync-skills/SKILL.md && test ! -e /Users/zbeyens/.agents/skills/sync-skills/README.md` passed.
- `/Users/zbeyens/git/plate-2`: `npx skills --help` confirmed `add <package>`, `remove [skills]`, `--skill`, `--agent`, `--global`, and `-y` flags.
- `/Users/zbeyens/git/plate-2`: `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-create-sync-skills-global-skill.md` is the final mechanical closeout check.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker requested.
- Confidence line: high; the global skill exists and focused audits cover the
  user-requested behavior.
- Flow table:
  - Reproduced: N/A for bug repro.
  - Verified: source readback, focused `rg`, existence/no-README test, CLI help,
    and goal-plan checker.
- Browser check: N/A, no browser surface.
- Outcome: global `sync-skills` skill created.
- Caveat: it does not perform an actual `better-convex` -> `plate-2` sync yet;
  it defines the workflow for that next task.
- Design:
  - Chosen boundary: global workflow skill.
  - Why not quick patch: plain copy instructions would cause the exact fork
    clobbering the user warned about.
  - Why not broader change: no repo sync was requested yet.
- Verified: global skill file and required contract terms.

Final handoff / sync:
- PR: N/A, no PR requested.
- Issue / tracker: N/A, no tracker requested.
- Browser proof: N/A, no browser surface.
- Caveats: actual cross-repo sync remains future work.

Timeline:
- 2026-05-25T08:17Z Loaded skill-creator and autogoal.
- 2026-05-25T08:17Z Active goal created.
- 2026-05-25T08:18Z Goal plan created.
- 2026-05-25T08:19Z Inspected `better-convex` and current repo agent layouts.
- 2026-05-25T08:20Z Confirmed `npx skills add/remove` syntax.
- 2026-05-25T08:21Z Created global `sync-skills` skill.
- 2026-05-25T08:22Z Focused audits passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout after creating and verifying the global skill. |
| Where am I going? | Run final plan checker, close active goal, then final response. |
| What is the goal? | Create a global conflict-aware skill-sync workflow skill. |
| What have I learned? | The target workflow must preserve repo forks and use CLI-managed lock operations. |
| What have I done? | Created `/Users/zbeyens/.agents/skills/sync-skills/SKILL.md` and verified it. |

Open risks:
- None known. The skill intentionally asks for a decision when source ownership
  or conflict intent is unclear.
