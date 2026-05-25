# skill diet first prune

Objective:
Prune the approved first-pass repo-local skill clutter so `task` owns a concise
Skill Diet rule, dead generic/source skills and generated mirrors are gone,
stale lock entries are cleaned after CLI attempts, Skiller syncs mirrors, live
source instructions no longer route agents to removed skills, lint passes, and
the autogoal completion checker passes.

Goal plan:
docs/plans/2026-05-25-skill-diet-first-prune.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: chat approval
- id / link: user approved the first skill-diet prune after the earlier repo
  skill scan and cut/collapse/keep recommendation.
- title: Skill diet first prune
- acceptance criteria: add Skill Diet to `task`; remove approved dead/generic
  source rules and generated mirrors; remove stale `planning-with-files` and
  `codex-review` lock entries through the skill CLI first; sync generated
  mirrors; audit removed files and live refs; run lint; complete this plan.

Completion threshold:
- `.agents/rules/task.mdc` contains a concise Skill Diet rule and
  `.agents/skills/task/SKILL.md` reflects it after Skiller sync.
- Approved dead source rules are removed:
  `create-app-design`, `update-app-design`, `create-tech-stack`,
  `update-tech-stack`, `translate`, `lint`, and `sync-testing-skill`.
- Approved generated/stale skill directories are removed:
  `coding-tutor`, `onboarding`, the three file-task skills,
  `git-clean-gone-branches`, `git-worktree`, `planning-with-files`,
  `codex-review`, and CE ceremony skills.
- `ce:compound` is also removed because keeping it without
  `ce:compound-refresh` leaves a broken CE island.
- `skills-lock.json` no longer contains removed skills after CLI attempts and
  recorded evidence.
- `.agents/rules/**`, `.agents/AGENTS.md`, `AGENTS.md`,
  `docs/plans/templates/**`, and `skills-lock.json` contain no live route to
  the removed skills.
- `pnpm install`, `pnpm lint:fix`, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-skill-diet-first-prune.md`
  pass.

Verification surface:
- `npx skills remove ... -y` attempts for approved generated skills and CE
  names.
- `pnpm install` Skiller sync output.
- `find` audit over `.agents/rules`, `.agents/skills`, and `.claude/skills`
  for removed skill paths.
- `rg` audit over live source rules, root agent instructions,
  `docs/plans/templates`, and `skills-lock.json` for removed skill refs.
- `rg` audit proving generated `task` mirrors the Skill Diet rule.
- `npx skills list --json` project-skill inventory after removal.
- `pnpm lint:fix`.
- Scoped review over the changed workflow files, with the autoreview helper
  input-limit failure recorded below.

Constraints:
- Do not run `git status`.
- Do not create a PR, commit, push, or branch; none was requested.
- Edit source rules and templates first; regenerate generated mirrors with
  `pnpm install`.
- Do not edit generated `SKILL.md` mirrors directly.
- Use the CLI first for installed skill removal.
- Keep this to the approved first prune; do not perform the later collapse list
  such as `components`, `react-useeffect`, or `performance-oracle`.

Boundaries:
- Source of truth: the approved skill-diet cut list from the chat plus
  `.agents/rules/task.mdc`, `.agents/rules/major-task.mdc`,
  `docs/plans/templates/**`, and `skills-lock.json`.
- Allowed edit scope: approved skill/rule removals, stale Claude skill links,
  Skill Diet wording, stale CE route cleanup, plan templates that referenced
  removed CE compounding, generated mirrors through Skiller, and this goal
  plan.
- Browser surface: N/A because this is an agent workflow cleanup.
- Tracker sync: N/A because no tracker item exists.
- Non-goals: PR creation, package/runtime behavior, package changesets,
  browser verification, and second-pass skill collapse.

Blocked condition:
The task would block only if the skill CLI could not remove installed skill
files and no safe source-backed cleanup path remained, or if Skiller failed to
regenerate mirrors after source-rule edits.

Task state:
- task_type: agent workflow cleanup
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready to complete

Current verdict:
- verdict: complete after final checker run
- confidence: high
- next owner: none
- reason: source rules, templates, generated mirrors, and lock state now agree
  on the first skill-diet prune.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-skill-diet-first-prune.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Used the approved first-prune list from the earlier skill scan and loaded `autogoal` plus `task`. |
| Active goal checked or created | yes | `get_goal` showed the active prune goal for this file. |
| Source of truth read before edits | yes | Read `task`, `autogoal`, current source rules, templates, and lockfile before final cleanup. |
| Tracker comments and attachments read | no | N/A: chat-only workflow task. |
| Video transcript evidence required | no | N/A: no video evidence. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: no product-code behavior; prior memory/source context covered docs-skill ownership. |
| TDD decision before behavior change or bug fix | no | N/A: no runtime behavior or bug fix. |
| Branch decision for code-changing task | no | N/A: no branch action requested and repo instruction says no proactive branch hygiene. |
| Release artifact decision | no | N/A: no package behavior or published package change. |
| Browser tool decision for browser surface | no | N/A: no browser surface. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Agent-native pack selected | yes | Plan created with `--with agent-native` because `.agents/**`, `.claude/**`, skills, and agent instructions changed. |
| Agent-facing action surface identified | yes | The changed action surface is skill selection, goal-template gates, and generated skill discovery. |
| Source rule versus generated mirror boundary identified | yes | `.agents/rules/*.mdc` and `docs/plans/templates/**` are source; `.agents/skills/**` and `.claude/skills/**` are generated/linked outputs. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded `.agents/skills/agent-native-reviewer/SKILL.md`; scoped review found no broken agent action route after audits. |

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
- [x] Release artifact requirement recorded: N/A because no package release
      surface changed.
- [x] Final handoff shape decided: concise final with removed-skill outcome,
      verification, and caveats; no PR/tracker sync.
- [x] Branch handling recorded for code-changing work: N/A because no branch
      action was requested.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      N/A because no install-corruption signal occurred.
- [x] Workspace authority recorded: all proof commands ran in
      `/Users/zbeyens/git/plate-2`.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, with helper failure and scoped substitute recorded.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Agent-native pack: source-of-truth rule files are edited instead of
      generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the
      skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**`
      changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or
      explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run removal commands, sync, audits, lint, and checker | Removal commands, sync, audits, and lint passed; checker is the final mechanical command. |
| Bug reproduced before fix | no | Record N/A with reason | N/A: no bug fix. |
| Targeted behavior verification | yes | Run focused source/generated audits | `find` found no removed skill paths; `rg` found no live removed-skill refs in source rules/templates/lock. |
| TypeScript or typed config changed | no | Record N/A with reason | N/A: no TS or typed config changed. |
| Package exports or file layout changed | no | Record N/A with reason | N/A: no package exports or public file layout changed. |
| Package manifests, lockfile, or install graph changed | no | Record N/A with reason | N/A: `skills-lock.json` changed, not the package manager lockfile or install graph. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` ran Skiller successfully; generated `task` contains `Skill Diet`. |
| Workspace authority proof | yes | Run verification in owning repo | All commands ran in `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: no UI/browser surface. |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A: no browser route. |
| CI-controlled template output changed | no | Restore generated template output or record why intentionally kept | N/A: no `templates/**` output changed; `docs/plans/templates/**` are workflow source templates. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: no package behavior/API delta. |
| Registry-only component work changed | no | Update registry changelog or record N/A | N/A: no registry component work. |
| Docs or content changed | yes | Verify source-backed claims, links, examples, and rendered output or record N/A | Workflow markdown templates changed; source audit verifies they no longer reference removed `ce-compound`. |
| High-risk mini gate | yes | Record failure mode, proof plan, and boundary | Failure mode: agents load removed skills or stale locks reinstall clutter. Proof: path/ref audits plus Skiller sync. Boundary: source rules/templates and lockfile, not generated mirrors. |
| Agent-native review for agent/tooling changes | yes | Load reviewer and close accepted/actionable findings | Loaded reviewer; scoped review found the action discoverable and no accepted/actionable finding. |
| Local install corruption suspected | no | Run reinstall once or record N/A | N/A: no local corruption signal. |
| Autoreview for non-trivial implementation changes | limited | Run helper or record blocker/substitute | Helper failed because local bundle was 2,800,049 chars over the 1,048,576 cap; scoped diff/source audit found no accepted/actionable issue. |
| PR create or update | no | Run `check` before PR work and sync PR body to final handoff | N/A: no PR requested. |
| PR proof image hosting | no | Host PR proof images or record N/A | N/A: no PR proof image. |
| Tracker sync-back | no | Post issue/Linear sync or record N/A | N/A: no tracker. |
| Final handoff contract | yes | Fill final handoff fields | Filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm lint:fix` passed; Biome checked 3419 files, no fixes applied. |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-skill-diet-first-prune.md` | Passed with `[autogoal] complete`. |
| Knowledge extraction | no | Record N/A with reason | N/A: `ce-compound` was intentionally removed and templates no longer include this gate. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` passed and Skiller applied Claude Code plus Codex outputs. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `task` and generated `task/SKILL.md` expose Skill Diet; `major-task` no longer routes to CE planning. |
| Agent-native review | yes | Load reviewer and close findings | Reviewer loaded; no scoped finding after source/generated audits. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read task/autogoal, source rules, templates, lockfile, and approval context. | implementation |
| Implementation | complete | Added Skill Diet, removed approved skills/rules, removed CE routes, cleaned lock after CLI evidence. | verification |
| Verification | complete | Sync, audits, inventory, lint, and scoped review completed. | closeout |
| PR / tracker sync | complete | N/A: no PR or tracker requested. | final response |
| Closeout | complete | Plan filled; final checker and goal close follow. | final response |

Findings:
- The first CLI removal command deleted generated skill directories but did not
  clean `skills-lock.json`.
- Colon CE names did not remove through `--skill ce:...`; directory-style
  names such as `ce-brainstorm` worked.
- `ce:compound` should not survive alone because its workflow references the
  removed refresh skill family.
- `task` and `major-task` still routed to CE skills after removal; source rules
  needed cleanup before sync.
- A stale `.claude/skills/planning-with-files` symlink remained after its target
  disappeared.

Decisions and tradeoffs:
- Added Skill Diet to `task`, not `autogoal`, because this is task skill-loading
  policy rather than goal lifecycle policy.
- Removed `ce:compound` as part of the first prune because the remaining CE
  island was broken and contrary to the approved CE ceremony cut.
- Removed `Knowledge extraction` rows from goal templates instead of pointing
  them at a deleted skill.
- Manually cleaned `skills-lock.json` only after the CLI paths were tried and
  their failure mode was recorded.
- Did not perform second-pass collapses such as folding `components` into
  `plate-ui` or `performance-oracle` into `performance`.

Implementation notes:
- Updated `.agents/rules/task.mdc` with `## Skill Diet`.
- Updated `.agents/rules/major-task.mdc` to use the active major-task goal plan
  instead of `ce:plan`, and clarification/collaborative planning instead of
  `ce:brainstorm`.
- Removed approved source rule files:
  `.agents/rules/create-app-design.mdc`,
  `.agents/rules/update-app-design.mdc`,
  `.agents/rules/create-tech-stack.mdc`,
  `.agents/rules/update-tech-stack.mdc`,
  `.agents/rules/translate.mdc`, `.agents/rules/lint.mdc`, and
  `.agents/rules/sync-testing-skill.mdc`.
- Removed CE compounding rows from `docs/plans/templates/{task,goal,docs,slate-plan}.md`.
- Cleaned removed skill entries from `skills-lock.json`.
- Ran `pnpm install` to regenerate `.agents/skills/**` and `.claude/skills/**`.

Review fixes:
- Agent-native review: source/generated boundary is explicit; generated mirrors
  were synced; skill discovery no longer advertises removed routes.
- Autoreview helper: attempted but blocked by checkout-wide bundle size; scoped
  review used the target diff and source/ref audits instead.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `npx skills remove` with non-CE names removed files but left `skills-lock.json` entries | 1 | Try CE names and then inspect lock manually | Lock cleanup was done manually after CLI evidence. |
| `npx skills remove --skill ce:...` found no matches | 1 | Use generated directory names such as `ce-brainstorm` | Directory-style CE removal succeeded. |
| `apply_patch` could not delete dangling `.claude/skills/planning-with-files` symlink | 1 | Remove the symlink itself with `unlink` | Stale symlink removed. |
| Autoreview helper local review exceeded Codex input cap | 1 | Use scoped diff/source audit over changed workflow files | Recorded helper failure and completed scoped review. |

Verification evidence:
- The first `npx skills remove ... -y` command targeted the approved non-CE
  generated skills, CE colon names, `planning-with-files`, and `codex-review`;
  it removed 7 skills but left lock entries.
- `npx skills remove --skill ce:brainstorm --skill ce:ideate --skill ce:work --skill ce:plan --skill ce:review --skill ce:compound-refresh -y` found no colon-name matches.
- `npx skills remove ce-brainstorm ce-ideate ce-work ce-plan ce-review ce-compound-refresh -y` removed 6 CE skills.
- `npx skills remove ce-compound -y` removed 1 additional CE skill.
- `pnpm install` passed and Skiller applied Claude Code plus Codex outputs.
- Path audit over `.agents/rules`, `.agents/skills`, and `.claude/skills`
  found no removed skill paths.
- Live source ref audit over `skills-lock.json`, `.agents/AGENTS.md`,
  `AGENTS.md`, `.agents/rules`, and `docs/plans/templates` found no removed
  skill refs.
- Generated mirror audit found `Skill Diet` in `.agents/skills/task/SKILL.md`
  and no removed CE/planning refs in generated `task` or `major-task`.
- Counts after prune: 64 generated project `SKILL.md` files and 31 source
  `.agents/rules/*.mdc` files.
- `npx skills list --json` listed project skills without the removed skill
  names.
- `pnpm lint:fix` passed; Biome checked 3419 files and applied no fixes.
- Autoreview helper failed before review with input cap error:
  2,800,049 chars vs 1,048,576 max. Scoped diff/source audit found no accepted
  issue.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-skill-diet-first-prune.md`
  passed with `[autogoal] complete`.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker.
- Confidence line: high.
- Flow table:
  - Reproduced: N/A, no runtime bug.
  - Verified: CLI removal evidence, Skiller sync, path/ref audits, inventory,
    lint, scoped review, checker.
- Browser check: N/A, no browser surface.
- Outcome: first skill-diet prune completed and source/generated skill
  instructions agree.
- Caveat: full autoreview helper could not review the checkout-wide dirty diff
  because the bundle exceeded the Codex input cap; scoped review covered this
  slice.
- Design:
  - Chosen boundary: `task` owns skill diet and live source rules/templates own
    agent workflow routes.
  - Why not quick patch: deleting directories without source/lock/template
    cleanup would leave agents routed to dead skills.
  - Why not broader change: second-pass collapse/cut work was intentionally
    left for a separate decision.
- Verified: removal commands, `pnpm install`, audits, `npx skills list --json`,
  `pnpm lint:fix`, and final checker.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A.
- Caveats: autoreview helper input cap on checkout-wide dirty diff; no runtime
  package/browser proof applies.

Timeline:
- 2026-05-25T11:25:51Z Task goal plan created.
- 2026-05-25T11:27:00Z Added Skill Diet and removed approved source rules.
- 2026-05-25T11:28:00Z Ran skill CLI removals; recorded lock-cleanup caveat.
- 2026-05-25T11:30:00Z Removed stale CE routes, `ce-compound`, and old
  compounding template gates.
- 2026-05-25T11:31:00Z Ran `pnpm install` and source/generated audits.
- 2026-05-25T11:32:00Z Ran lint and attempted autoreview; scoped review used
  after helper input cap failure.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Run final checker, close goal, final response |
| What is the goal? | Complete the approved first skill-diet prune with source/generated/lock consistency |
| What have I learned? | The CLI removes generated skill files but can leave stale lock entries; source rules and plan templates must be cleaned too |
| What have I done? | Added Skill Diet, removed dead skills/rules, cleaned stale refs, synced mirrors, audited, linted, and scoped-reviewed |

Open risks:
- The broader skill-collapse list remains intentionally undone; this plan only
  completes the approved first prune.
- Full checkout-wide autoreview remains blocked by unrelated dirty diff size,
  so the review evidence is scoped to this slice.
