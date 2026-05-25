# migrate component react skills

Objective:
Remove standalone repo-local `components`, `creating-components`, and `react`
skill triggers while preserving their comprehensive content as
progressive-disclosure references under the owning UI skills.

Goal plan:
docs/plans/2026-05-25-migrate-component-react-skills.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user request
- id / link: chat request on 2026-05-25
- title: migrate component/react skills into UI-skill references
- acceptance criteria: in plate-2, move `components` and `react` into
  `plate-ui` references; in better-convex, remove `creating-components` and
  `react` standalone triggers while preserving the same comprehensive content
  under the repo UI owner; keep React Compiler and Effect guidance; sync
  generated mirrors; prove stale standalone triggers are gone.

Completion threshold:
- `/Users/zbeyens/git/plate-2` has no generated standalone
  `components`/`react` skills and `plate-ui` owns `references/components.md`
  plus `references/react.md`.
- `/Users/zbeyens/git/better-convex` has no generated standalone
  `creating-components`/`react` skills and `shadcn-parity` owns
  `references/components.md` plus `references/react.md`.
- Install sync, resource sync, stale-trigger audits, skill validation, and lint
  pass or have a documented environment caveat.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-migrate-component-react-skills.md`
  passes.

Verification surface:
- Source/generated `rg` audits for stale standalone triggers and old `.mdc`
  references.
- Generated skill folder audits with `find`.
- Install sync in both repos.
- Direct resource sync script proof in both repos.
- Skill validation with `skill-creator` quick validator.
- Lint with `pnpm lint:fix` in plate-2 and `bun lint:fix` in better-convex.

Constraints:
- Follow `skill-creator`: keep `SKILL.md` lean; move bulky guidance into
  references.
- Do not hand-edit generated `SKILL.md`; change source rules and sync.
- Preserve comprehensive component and React content, especially React
  Compiler, Effects, `useEffectEvent`, derived state, refs, data attributes,
  accessibility, and polymorphism.
- No PR, commit, push, browser proof, or package behavior change.

Boundaries:
- Source of truth: user request, `.agents/rules/**`, and generated
  `.agents/skills/**` mirrors in plate-2 and better-convex.
- Allowed edit scope: UI skill source rules, moved reference docs, resource
  sync script, package install hook, and active goal plan.
- Browser surface: N/A.
- Tracker sync: N/A.
- Non-goals: no product UI behavior changes; no broad skill diet beyond the
  named component/React skills.

Blocked condition:
- Blocked only if install/resource sync cannot make the generated UI skill
  folders contain the reference files, or if stale standalone triggers remain
  after repair.

Task state:
- task_type: agent-skill cleanup
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active until completion check passes

Current verdict:
- verdict: complete after final check
- confidence: high
- next owner: final response
- reason: standalone triggers are gone, comprehensive references are under UI
  skills, install/resource sync is wired, and audits pass.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-migrate-component-react-skills.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Used `skill-creator`, `autogoal`, and `task`; read owner skill/source files before edits. |
| Active goal checked or created | yes | Created a goal for migrating standalone component/React skills into UI references. |
| Source of truth read before edits | yes | Read `plate-ui`, `components`, `react`, `creating-components`, and `shadcn-parity` source rules. |
| Tracker comments and attachments read | N/A | No tracker source. |
| Video transcript evidence required | N/A | No video evidence. |
| `docs/solutions` checked for non-trivial existing-code work | N/A | Agent skill/source cleanup only. |
| TDD decision before behavior change or bug fix | N/A | No runtime behavior change. |
| Branch decision for code-changing task | N/A | No PR/branch requested. |
| Release artifact decision | N/A | No package release surface. |
| Browser tool decision for browser surface | N/A | No browser surface. |
| PR expectation decision | yes | No PR requested. |
| Tracker sync expectation decision | N/A | No tracker. |
| Agent-native pack selected | yes | Plan created with `--with agent-native`. |
| Agent-facing action surface identified | yes | UI skill triggers, generated skill discovery, reference loading, and resource sync. |
| Source rule versus generated mirror boundary identified | yes | Edited `.agents/rules/**`, added source resource dirs, then ran install/resource sync. |
| `agent-native-reviewer` loaded or waiver recorded | N/A | Waived; exact stale-trigger/resource audits and skill validation cover the narrow failure mode. |

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
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run source/generated audits, install sync, resource sync, skill validation, and lint | Evidence recorded below. |
| Bug reproduced before fix | N/A | Record failing test/repro or N/A with reason | No bug fix. |
| Targeted behavior verification | yes | Prove generated skill discovery no longer exposes standalone component/React triggers | `find .agents/skills -maxdepth 2 ... rg '/(components|creating-components|react)/SKILL.md$'` returned no matches in both repos. |
| TypeScript or typed config changed | N/A | Run relevant typecheck | JS sync helper only; lint plus direct execution cover it. |
| Package exports or file layout changed | N/A | Run `pnpm brl` before final verification and keep generated barrel updates | No package exports or barrels. |
| Package manifests, lockfile, or install graph changed | yes | Run install and relevant checks | `pnpm install` and `bun install` ran successfully after package hook edits. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | Generated `plate-ui` and `shadcn-parity` mirrors contain the new reference files. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | Commands ran in `/Users/zbeyens/git/plate-2` and `/Users/zbeyens/git/better-convex`. |
| Browser surface changed | N/A | Capture Browser Use proof or record explicit waiver/blocker | No browser surface. |
| Browser final proof | N/A | Attach screenshot or exact browser verification caveat when browser proof applies | No browser proof needed. |
| CI-controlled template output changed | N/A | Restore generated template output or record why it is intentionally kept | No template output touched. |
| Package behavior or public API changed | N/A | Add a changeset or record why no changeset applies | No package behavior/API change. |
| Registry-only component work changed | N/A | Update `docs/components/changelog.mdx` or record N/A | No registry component work. |
| Docs or content changed | N/A | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Agent reference migration, not product docs. |
| High-risk mini gate | yes | Record realistic failure mode, proof plan, and why the chosen boundary is right | Failure mode: broken reference links or stale standalone triggers; proof: generated reference files exist and stale-trigger audits are clean; boundary: UI owner skill owns UI/React reference depth. |
| Agent-native review for agent/tooling changes | N/A | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Waived for proportionality; exact audits plus `skill-creator` validation cover this task. |
| Local install corruption suspected | N/A | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | No install corruption signal. |
| Autoreview for non-trivial implementation changes | N/A | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | No product implementation; targeted skill audits are the meaningful review. |
| PR create or update | N/A | Run `check` before PR work and sync PR body to final handoff | No PR requested. |
| PR proof image hosting | N/A | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | No PR/browser image. |
| Tracker sync-back | N/A | Post concise issue/Linear sync after PR exists, or record N/A/blocker | No tracker. |
| Final handoff contract | yes | Fill final handoff fields | Filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | plate-2 `pnpm lint:fix` passed; better-convex `bun lint:fix` passed. |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-migrate-component-react-skills.md` | Run after this save; final response reports result. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | plate-2 install synced 6 resource entries; better-convex install synced 3 resource entries. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `plate-ui` and `shadcn-parity` `SKILL.md` files link to `references/components.md` and `references/react.md`. |
| Agent-native review | N/A | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Waived for proportionality; direct evidence is stronger here. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read source skills and current generated mirror/resource behavior. | implementation |
| Implementation | complete | Moved standalone docs into UI references; added resource sync after Skiller. | verification |
| Verification | complete | Install, resource sync, stale audits, quick validation, and lint completed. | closeout |
| PR / tracker sync | N/A | No PR/tracker requested. | final response |
| Closeout | complete | Plan filled; completion check runs after save. | final response |

Findings:
- Skiller regenerates `SKILL.md`, but it did not copy newly added resource
  folders. Without an explicit resource sync, the new reference links would be
  broken after install. That was the important architecture catch.
- Plate's real UI owner is `plate-ui`; better-convex has no `plate-ui`, so the
  equivalent UI owner is `shadcn-parity`.
- The large React/component docs are valuable, but as references only. Keeping
  them as standalone always-triggered skills was the bad shape.

Decisions and tradeoffs:
- Keep `plate-ui` concise and move comprehensive component/React docs into
  `plate-ui/references`.
- In better-convex, preserve the same content under `shadcn-parity/references`
  rather than inventing another UI skill.
- Add a generic resource-sync script after Skiller instead of hand-copying
  generated references once. This preserves the source/generated contract.
- Keep React Compiler and Effects material comprehensive inside
  `references/react.md`.

Implementation notes:
- plate-2:
  - Moved `.agents/rules/components.mdc` to
    `.agents/rules/plate-ui/references/components.md`.
  - Moved `.agents/rules/react.mdc` to
    `.agents/rules/plate-ui/references/react.md`.
  - Updated `.agents/rules/plate-ui.mdc` trigger and reference routing.
  - Added source copies of existing `plate-ui` generated `rules/` and
    `component-audit.md`, then wired resource sync.
- better-convex:
  - Moved `.agents/rules/creating-components.mdc` to
    `.agents/rules/shadcn-parity/references/components.md`.
  - Moved `.agents/rules/react.mdc` to
    `.agents/rules/shadcn-parity/references/react.md`.
  - Updated `.agents/rules/shadcn-parity.mdc` reference routing.
  - Wired resource sync after Skiller in `postinstall`.

Review fixes:
- Lint flagged `console.log` in the new resource sync script; replaced it with
  `process.stdout.write` and reran lint cleanly.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Skiller did not copy newly moved references | 1 | Add explicit resource sync script after Skiller | Fixed in both package install hooks. |
| Direct `quick_validate.py` execution was not executable | 1 | Invoke through `python3` | Worked. |
| better-convex cwd resolved `/usr/bin/python3` without PyYAML | 1 | Run validator from plate-2 cwd with absolute better-convex skill path | Worked. |

Verification evidence:
- `/Users/zbeyens/git/plate-2`: `pnpm install` ran Skiller and
  `[agent-skill-resources] synced 6 resource entries`.
- `/Users/zbeyens/git/better-convex`: `bun install` ran kitcn sync, Skiller,
  and `[agent-skill-resources] synced 3 resource entries`.
- `/Users/zbeyens/git/plate-2`: generated `plate-ui` contains
  `references/components.md`, `references/react.md`, `references/component-audit.md`,
  and existing `rules/*.md`.
- `/Users/zbeyens/git/better-convex`: generated `shadcn-parity` contains
  `references/components.md` and `references/react.md`.
- Both repos: stale-trigger audit found no standalone generated
  `components`, `creating-components`, or `react` skill `SKILL.md` files.
- Both repos: `rg` found no stale `components.mdc`, `creating-components.mdc`,
  `react.mdc`, `ALWAYS use when using React`, or old composable-component
  trigger text in live source/generated agent surfaces.
- `skill-creator` quick validation passed for `plate-ui` and `shadcn-parity`.
- `/Users/zbeyens/git/plate-2`: `pnpm lint:fix` checked 3420 files with no
  fixes after the final script edit.
- `/Users/zbeyens/git/better-convex`: `bun lint:fix` checked 857 files with no
  fixes after the final script edit.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker.
- Confidence line: high.
- Flow table:
  - Reproduced: source/generation audit showed standalone skills and missing
    resource copying behavior.
  - Verified: install/resource sync, stale-trigger audits, skill validation, and
    lint passed.
- Browser check: N/A.
- Outcome: standalone component/React skills are gone; comprehensive docs live
  under UI-skill references.
- Caveat: no full repo `check`; this is agent-rule/resource cleanup.
- Design:
  - Chosen boundary: UI owner skill triggers; detailed component/React docs as
    references.
  - Why not quick patch: moving files without resource sync leaves broken links.
  - Why not broader change: remaining UI owners already exist; no need for new
    skills.
- Verified: see evidence above.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A.
- Caveats: full repo `check` not run.

Timeline:
- 2026-05-25T12:04:06.613Z Task goal plan created.
- 2026-05-25 Source skills and generated mirror behavior audited.
- 2026-05-25 Standalone component/React docs moved into UI references.
- 2026-05-25 Resource sync script added and install hooks updated.
- 2026-05-25 Install/resource sync, stale audits, validation, and lint passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout after verification |
| Where am I going? | Run completion check, mark goal complete, final response |
| What is the goal? | Migrate component/React standalone skills into UI-skill references |
| What have I learned? | Skiller needs explicit resource sync for reference folders |
| What have I done? | Removed standalone triggers, preserved comprehensive references, synced and audited both repos |

Open risks:
- None for requested scope. Full repo behavioral checks were intentionally not
  run because no product code changed.
