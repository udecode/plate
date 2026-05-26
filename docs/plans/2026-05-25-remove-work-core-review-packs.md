# remove work-core review packs

Objective:
Remove the generic `work-core` and `review` goal packs from plate-2 and
better-convex. Keep only surface packs, move useful core/review gates into the
primary templates and relevant skill rules, regenerate generated mirrors, and
prove both repos have no live source/generated references to the deleted pack
interface.

Goal plan:
docs/plans/2026-05-25-remove-work-core-review-packs.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user request
- id / link: chat request on 2026-05-25
- title: get rid of work-core/review packs in both repos
- acceptance criteria: delete both packs in plate-2 and better-convex; remove
  `--with work-core`, `--with review`, `work-core pack`, `review pack`, and
  deleted-pack file refs from source/generated agent docs; preserve the useful
  gates inside primary templates; sync generated mirrors; run targeted lint and
  stale-reference audits.

Completion threshold:
- The task is complete when `/Users/zbeyens/git/plate-2` and
  `/Users/zbeyens/git/better-convex` have only `agent-native`, `browser`,
  `docs`, and `package-api` packs; source rules/templates and generated skill
  mirrors contain no live references to `work-core`/`review` pack usage; install
  sync and lint pass in both repos; and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-remove-work-core-review-packs.md`
  passes.

Verification surface:
- Source/generated stale-reference audits in both repos with `rg`.
- Pack-directory audits in both repos with `find docs/plans/templates/packs`.
- Mirror sync with `pnpm install` in plate-2 and `bun install` in better-convex.
- Lint with `pnpm lint:fix` in plate-2 and `bun lint:fix` in better-convex.
- Goal completion check in plate-2.

Constraints:
- Preserve repo-specific wording and package-manager commands.
- Edit `.agents/rules/**` and plan templates as source; generated `SKILL.md`
  mirrors must come from install sync.
- Keep the architecture simple: packs are surface add-ons only.
- No PR, commit, push, tracker sync, or browser proof for this local rule/template
  cleanup.

Boundaries:
- Source of truth: user request plus `.agents/rules/**` and
  `docs/plans/templates/**` in both repos.
- Allowed edit scope: autogoal/task/major-task/docs-creator rules, autogoal
  README, plan templates, generated mirrors from install sync, and deleted pack
  fragments.
- Browser surface: N/A; no browser-facing code changed.
- Tracker sync: N/A; no issue or Linear item.
- Non-goals: no skill diet cuts beyond `work-core`/`review` packs, no PR, no
  package behavior changes.

Blocked condition:
- Blocked only if source/generated sync could not be run in either repo, or if
  stale deleted-pack refs remained in live source/generated files after repair.

Task state:
- task_type: agent-template cleanup
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active until completion check passes

Current verdict:
- verdict: complete after final check
- confidence: high
- next owner: final response
- reason: both repos are synced, linted, and stale-reference audits are clean.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-remove-work-core-review-packs.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Used `sync-skills`, `autogoal`, and `task`; scoped to source rule/template sync in both repos. |
| Active goal checked or created | yes | Created active goal for deleting packs, syncing mirrors, linting, and stale-reference audits. |
| Source of truth read before edits | yes | Read current source refs in plate-2 and better-convex with `rg` plus relevant rule/template snippets. |
| Tracker comments and attachments read | N/A | No tracker source. |
| Video transcript evidence required | N/A | No video or screen recording. |
| `docs/solutions` checked for non-trivial existing-code work | N/A | Agent-template cleanup, not product code behavior. |
| TDD decision before behavior change or bug fix | N/A | No runtime behavior or bug fix. |
| Branch decision for code-changing task | N/A | User asked local cleanup only; no PR/commit/branch requested. |
| Release artifact decision | N/A | No package behavior, exports, or release note surface. |
| Browser tool decision for browser surface | N/A | No browser surface changed. |
| PR expectation decision | yes | No PR requested for this task. |
| Tracker sync expectation decision | N/A | No tracker. |
| Agent-native pack selected | yes | Plan created with `--with agent-native`. |
| Agent-facing action surface identified | yes | Goal composition rules, task/major-task intake, docs-creator major docs example, and plan templates. |
| Source rule versus generated mirror boundary identified | yes | Edited `.agents/rules/**` and `docs/plans/templates/**`; generated `.agents/skills/**` came from install sync. |
| `agent-native-reviewer` loaded or waiver recorded | N/A | Skipped proportional review swarm; stale-reference audit plus generated-sync proof directly tests this narrow rule/template change. |

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
| Named verification threshold | yes | Run the named sync, lint, pack-directory, and stale-reference audits in both repos | Satisfied by verification evidence below. |
| Bug reproduced before fix | N/A | Record failing test/repro or N/A with reason | No bug fix. |
| Targeted behavior verification | yes | Prove source/generated references and pack directories match intended architecture | `rg` audits clean; `find` shows only four surface packs in both repos. |
| TypeScript or typed config changed | N/A | Run relevant typecheck | Markdown/rule/template changes only. |
| Package exports or file layout changed | N/A | Run `pnpm brl` before final verification and keep generated barrel updates | No package exports or barrels changed. |
| Package manifests, lockfile, or install graph changed | yes | Run install and relevant package checks | `pnpm install` in plate-2 and `bun install` in better-convex completed and regenerated mirrors. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | plate-2 `pnpm install` ran Skiller successfully; better-convex `bun install` ran kitcn sync and Skiller successfully. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands were run in `/Users/zbeyens/git/plate-2` or `/Users/zbeyens/git/better-convex` as appropriate. |
| Browser surface changed | N/A | Capture Browser Use proof or record explicit waiver/blocker | No browser surface. |
| Browser final proof | N/A | Attach screenshot or exact browser verification caveat when browser proof applies | No browser surface. |
| CI-controlled template output changed | N/A | Restore generated template output or record why it is intentionally kept | No CI-controlled app template output touched. |
| Package behavior or public API changed | N/A | Add a changeset or record why no changeset applies | No published package behavior changed. |
| Registry-only component work changed | N/A | Update `docs/components/changelog.mdx` or record N/A | No registry component work. |
| Docs or content changed | N/A | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Agent rule/template docs only. |
| High-risk mini gate | yes | Record realistic failure mode, proof plan, and why the chosen boundary is right | Failure mode: deleted pack refs survive in generated skills; proof: source/generated `rg` clean in both repos; boundary: primary templates now own core/review gates. |
| Agent-native review for agent/tooling changes | N/A | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Waived for proportionality; exact stale-ref, pack-dir, install-sync, and lint audits cover this narrow cleanup. |
| Local install corruption suspected | N/A | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | No suspicious env failure. |
| Autoreview for non-trivial implementation changes | N/A | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | No code implementation; targeted audits are the meaningful proof. |
| PR create or update | N/A | Run `check` before PR work and sync PR body to final handoff | No PR requested. |
| PR proof image hosting | N/A | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | No PR/browser proof. |
| Tracker sync-back | N/A | Post concise issue/Linear sync after PR exists, or record N/A/blocker | No tracker. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | plate-2 `pnpm lint:fix` checked 3419 files with no fixes; better-convex `bun lint:fix` checked 856 files with no fixes. |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-remove-work-core-review-packs.md` | Run after this closeout save; final response reports result. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | plate-2 `pnpm install` and better-convex `bun install` completed Skiller sync. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `rg` found no stale deleted-pack usage in source or generated agent docs. |
| Agent-native review | N/A | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Waived for proportionality; targeted source/generated audits are exact for this task. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Initial `rg` found deleted-pack refs in source rules, generated mirrors, and pack files. | implementation |
| Implementation | complete | Deleted both pack files in both repos; moved core/review gates into primary templates and rules. | verification |
| Verification | complete | Install sync, lint, stale-reference audit, and pack-directory audit passed in both repos. | closeout |
| PR / tracker sync | N/A | No PR/tracker requested. | final response |
| Closeout | complete | Plan filled; completion check runs after save. | final response |

Findings:
- `work-core` was a generic hygiene pack; its useful pieces belong in the
  `major-task` primary template.
- `review` was a generic closeout pack; review closure belongs in primary task
  and major-task gates, while specific review skills stay conditional.
- Both repos had the same stale composition shape, so the right fix was a
  structural sync instead of a local rename.

Decisions and tradeoffs:
- Deleted generic packs instead of leaving aliases; aliases would keep the bad
  mental model alive.
- Kept only touched-surface packs: `agent-native`, `browser`, `docs`,
  `package-api`.
- Added review-finding closure and workspace/branch expectation directly to
  `major-task` templates where the old `work-core`/`review` gates had real
  value.
- Waived autoreview/agent-native-reviewer because the exact failure mode is
  stale source/generated references, and the audits test that directly.

Implementation notes:
- plate-2 source updates: `.agents/rules/autogoal.mdc`,
  `.agents/rules/autogoal/README.md`, `.agents/rules/task.mdc`,
  `.agents/rules/major-task.mdc`, `.agents/rules/docs-creator.mdc`,
  `docs/plans/templates/major-task.md`.
- better-convex source updates: `.agents/rules/autogoal.mdc`,
  `.agents/rules/autogoal/README.md`, `.agents/rules/task.mdc`,
  `.agents/rules/major-task.mdc`, `docs/plans/templates/major-task.md`.
- Deleted in both repos:
  `docs/plans/templates/packs/review.md` and
  `docs/plans/templates/packs/work-core.md`.
- Generated mirrors were refreshed by install commands, not hand-edited.

Review fixes:
- N/A; no external review pass run. Targeted stale-reference and sync audits
  are the closeout pressure for this exact cleanup.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None | 0 | N/A | N/A |

Verification evidence:
- `/Users/zbeyens/git/plate-2`: `pnpm install` completed Skiller apply.
- `/Users/zbeyens/git/better-convex`: `bun install` completed kitcn sync and
  Skiller apply.
- `/Users/zbeyens/git/plate-2`: `pnpm lint:fix` checked 3419 files with no
  fixes.
- `/Users/zbeyens/git/better-convex`: `bun lint:fix` checked 856 files with no
  fixes.
- Both repos: `rg -n 'work-core|review pack|--with review|--with work-core|packs/review|packs/work-core' .agents/AGENTS.md AGENTS.md .agents/rules docs/plans/templates .agents/skills .claude || true`
  produced no matches.
- Both repos: `find docs/plans/templates/packs -maxdepth 1 -type f -print |
  sort` lists only `agent-native.md`, `browser.md`, `docs.md`, and
  `package-api.md`.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker.
- Confidence line: high; stale-reference audits and generated sync passed in
  both repos.
- Flow table:
  - Reproduced: source audit found the stale pack interface before edits.
  - Verified: install, lint, pack-directory audit, and source/generated stale-ref
    audit passed in both repos.
- Browser check: N/A.
- Outcome: `work-core` and `review` packs are gone; their useful checks live in
  primary templates/rules.
- Caveat: no full repo `check` was run because this is agent markdown/template
  cleanup and the targeted checks cover the changed surface.
- Design:
  - Chosen boundary: primary templates own core/review gates; packs only cover
    optional touched surfaces.
  - Why not quick patch: deleting only files would leave stale generated/source
    instructions.
  - Why not broader change: the remaining four packs map to real optional
    touched surfaces and should stay composable.
- Verified: see Verification evidence.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A.
- Caveats: no full repo `check`.

Timeline:
- 2026-05-25T11:52:54.964Z Task goal plan created.
- 2026-05-25 Source refs audited in both repos.
- 2026-05-25 Source rules/templates patched and deleted pack files removed in
  both repos.
- 2026-05-25 Generated mirrors synced by install in both repos.
- 2026-05-25 Lint and stale-reference audits passed in both repos.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout after verification |
| Where am I going? | Run completion check, mark goal complete, final response |
| What is the goal? | Remove `work-core` and `review` packs from both repos and fold useful gates into primary templates |
| What have I learned? | Generic packs created the wrong composability model; primary templates are the right home for core/review gates |
| What have I done? | Deleted packs, updated source rules/templates, synced generated mirrors, linted and audited both repos |

Open risks:
- None for the requested scope. The remaining risk is ordinary human preference
  on exact rule wording, not a stale-pack architecture issue.
