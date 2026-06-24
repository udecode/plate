# autogoal-first-checkpoint-templates

Objective:
Update autogoal templates so prompt requirements become the first checkpoint locally and in dotai.

Goal plan:
docs/plans/2026-06-03-autogoal-first-checkpoint-templates.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)
- docs (docs/plans/templates/packs/docs.md)

Task source:
- type: user prompt
- id / link: chat
- title: update autogoal first-checkpoint templates locally and in dotai
- acceptance criteria:
  - every local autogoal template in Plate has a first checkpoint requiring
    prompt requirement extraction before work starts
  - dotai canonical autogoal templates get the same generic rule
  - dotai autogoal validation passes
  - downstream installed autogoal copies are refreshed through Skills CLI, not
    hand-edited
  - generated mirrors/synced files are verified
  - final handoff reports local changes, dotai validation/commit/push result,
    downstream update commands, preserved forks/conflicts, and verification

Completion threshold:
- Local Plate autogoal templates and dotai canonical autogoal templates place
  prompt requirement extraction as the first checkpoint/checklist item.
- Dotai validation passes and changed scripts, if any, pass syntax checks.
- Dotai sync flow follows `sync-skills`: patch dotai source first, validate,
  commit/push dotai when required by the skill, then refresh downstream repos
  with `npx skills update autogoal --project -y` or equivalent.
- Plate generated mirrors are synced when source rules changed; installed
  dotai skill copies are not hand-edited.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-autogoal-first-checkpoint-templates.md` passes.

Verification surface:
- `rg` audits for the new first-checkpoint language in local
  `docs/plans/templates/**`, `.agents/skills/autogoal/assets/templates/**`,
  dotai `skills/autogoal/assets/templates/**`, and installed downstream copies.
- `/Users/zbeyens/git/dotai/scripts/validate-skills`.
- `node --check` for changed `.mjs` scripts if any.
- destination repo sync commands named by AGENTS, including `pnpm install` for
  Plate when `.agents/AGENTS.md` or `.agents/rules/**` changes.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-autogoal-first-checkpoint-templates.md`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: local Plate templates under `docs/plans/templates/**` and
  installed autogoal assets; dotai canonical `skills/autogoal/**`.
- Allowed edit scope: autogoal templates, autogoal skill guidance only if
  needed, AGENTS guidance already touched by previous prompt, generated sync
  outputs from approved commands.
- Browser surface: N/A, no app UI changed.
- Tracker sync: N/A, no issue/PR requested.
- Non-goals: no repo product code changes, no project-owned template deletion,
  no broad rewrite of `sync-skills`, no hand-editing installed dotai copies.

Output budget strategy:
- Use targeted `rg --files`, `sed`, and narrow `rg` audits. Cap command output
  and do not stream full templates unless needed for patch context.

Blocked condition:
- Block only if dotai validation fails in a way that needs a user-owned
  decision, Skills CLI cannot update downstream repos, or dotai push is rejected
  by credentials/remote state.

Task state:
- task_type: agent workflow / template sync
- task_complexity: normal
- current_phase: first checkpoint requirements capture
- current_phase_status: complete
- next_phase: implementation
- goal_status: active

Current verdict:
- verdict: proceed
- confidence: high
- next owner: sync-skills + autogoal
- reason: scope is explicit and source ownership is known

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-autogoal-first-checkpoint-templates.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements extracted as first checkpoint | yes | acceptance criteria above copied before template edits |
| Skill analysis before edits | yes | `sync-skills` prompt body, `autogoal` skill, local AGENTS, memory notes |
| Active goal checked or created | yes | active goal created for this plan |
| Source of truth read before edits | yes | local/dotai AGENTS and template inventory before edits |
| Tracker comments and attachments read | N/A | no tracker |
| Video transcript evidence required | N/A | no video |
| `docs/solutions` checked for non-trivial existing-code work | N/A | template sync, not product code |
| TDD decision before behavior change or bug fix | N/A | no runtime behavior change |
| Branch decision for code-changing task | N/A | user did not ask for branch |
| Release artifact decision | N/A | no package release |
| Browser tool decision for browser surface | N/A | no browser surface |
| PR expectation decision | N/A | no PR requested |
| Tracker sync expectation decision | N/A | no tracker |
| Output budget strategy recorded | yes | targeted reads/rg only |
| Agent-native pack selected | yes | templates/skills/AGENTS guidance touched |
| Agent-facing action surface identified | yes | autogoal plan templates and skill assets |
| Source rule versus generated mirror boundary identified | yes | local source templates and dotai source patched; generated mirrors only via commands |
| `agent-native-reviewer` loaded or waiver recorded | yes | `.agents/skills/agent-native-reviewer/SKILL.md` loaded; no accepted findings |
| Docs pack selected | yes | docs/plans templates touched |
| `docs-creator` loaded | N/A | not public docs prose |
| Docs lane selected | yes | internal plan template docs |
| Target docs and nearest sibling docs read | yes | local and dotai autogoal templates inventoried before patch |
| Docs style doctrine read | N/A | internal template contract |
| Documented source owner identified | yes | Plate local templates and dotai `skills/autogoal/**` |

Work Checklist:
- [x] Prompt requirements copied into the plan as first checkpoint before
      template edits.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] Local Plate autogoal templates patched.
- [x] Dotai canonical autogoal templates patched.
- [x] Dotai autogoal validated and committed/pushed per `sync-skills` dotai mode.
- [x] Downstream repos refreshed through Skills CLI without deleting
      project-owned templates.
- [x] Generated/synced copies verified by `rg`.
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
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | dotai validation passed; sync and rg audits recorded below |
| Bug reproduced before fix | N/A: template workflow repair | Record failing test/repro or N/A with reason | no runtime bug |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | `rg` proves first-checkpoint language in local, dotai, and downstream templates |
| TypeScript or typed config changed | N/A: markdown/template only | Run relevant typecheck | no typed code changed |
| Package exports or file layout changed | N/A: no package exports | Run `pnpm brl` before final verification and keep generated barrel updates | no barrels affected |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` and relevant package checks | Plate `pnpm install` completed after generated rule sync |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` synced generated skill mirrors; `rg` audit passed |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | dotai validation ran in `/Users/zbeyens/git/dotai`; Plate audits ran in `/Users/zbeyens/git/plate-2` |
| Browser surface changed | N/A: no browser surface | Capture Browser Use proof or record explicit waiver/blocker | template/skill sync only |
| Browser final proof | N/A: no browser surface | Attach screenshot or exact browser verification caveat when browser proof applies | no UI route changed |
| CI-controlled template output changed | N/A: project-owned plan templates intentionally changed | Restore generated template output or record why it is intentionally kept | downstream project-owned templates preserved by seed-only init |
| Package behavior or public API changed | N/A: no package public API | Add a changeset or record why no changeset applies | no changeset |
| Registry-only component work changed | N/A: no registry component work | Update `docs/components/changelog.mdx` or record N/A | no registry work |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | internal `docs/plans/templates/**` updated and audited by `rg` |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | agent workflow risk handled by source-first dotai patch, Skills CLI sync, generated mirror audit |
| Agent-native review for agent/tooling changes | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | reviewer loaded; no accepted findings |
| Local install corruption suspected | N/A: no install corruption signal | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | no retry needed |
| Autoreview for non-trivial implementation changes | N/A | Template copy/sync task; agent-native review and validation are the relevant gates | N/A |
| PR create or update | N/A: no PR requested | Run `check` before PR work and sync PR body to the task-style final handoff | no PR |
| Task-style PR body verified | N/A: no PR requested | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | no PR body |
| PR proof image hosting | N/A: no PR requested | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | no proof image |
| Tracker sync-back | N/A: no tracker | Post concise issue/Linear sync after PR exists, or record N/A/blocker | no tracker |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | final handoff fields filled below |
| Final lint | N/A | no app/package source lint target beyond validation/sync | N/A |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | commands scoped with `sed`, `rg`, and capped output |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-autogoal-first-checkpoint-templates.md` | run after this closure update |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | generated skill mirrors verified by `rg`; Plate `pnpm install` also ran after latest rule patch |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `.agents/skills/autogoal/SKILL.md` exposes requirement checkpoint rule |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | reviewer loaded; no accepted findings |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | claims are template/source ownership claims verified by file audits |
| Docs links / routes / previews | N/A: no docs links/routes/previews | Verify leaf links, routes, anchors, and preview names or record N/A | no rendered docs |
| Docs MDX/content parser | N/A: no MDX content changed | Run `pnpm --filter www build:contentlayer` for MDX/content changes, or record N/A | no contentlayer docs |
| Plugin page specifics | N/A: no plugin page | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | no plugin page |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | plan created; requirements captured first | implementation complete |
| Implementation | complete | local and dotai autogoal templates patched; downstream copies refreshed | verification complete |
| Verification | complete | dotai validation, Skills CLI sync, `rg` audits, `git diff --check` | closeout |
| PR / tracker sync | N/A | no PR/tracker requested | final response |
| Closeout | complete | check-complete runs after closure update | final response |

Findings:
- Autogoal templates were missing an explicit first checkpoint that forces prompt requirements into the plan before implementation.

Decisions and tradeoffs:
- Source-first sync: patch dotai canonical autogoal and local Plate templates, then refresh installed mirrors through Skills CLI.
- Preserve downstream project-owned plan templates; do not let seed-only init overwrite local forks.

Implementation notes:
- Local Plate templates updated: `docs/plans/templates/{goal,task,docs,major-task,goal-repair}.md`.
- Dotai canonical autogoal updated and pushed: commit `5d5a90d fix autogoal requirement checkpoint`.
- Downstream installs refreshed with `npx skills update autogoal --project -y` in Plate-2, better-convex, plate, and informed-fe-v3.

Review fixes:
- Agent-native review loaded; no accepted findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `/Users/zbeyens/git/dotai/scripts/validate-skills`: passed, `skills ok`.
- `/Users/zbeyens/git/dotai git diff --check`: passed before commit.
- Dotai commit/push: `5d5a90d fix autogoal requirement checkpoint`, pushed `main` from `8b8f24b` to `5d5a90d`.
- `npx skills update autogoal --project -y`: ran in `/Users/zbeyens/git/plate-2`, `/Users/zbeyens/git/better-convex`, `/Users/zbeyens/git/plate`, and `/Users/zbeyens/git/informed-fe-v3`; each updated autogoal and printed the same non-fatal deleted-skill warning.
- `node .agents/skills/autogoal/scripts/init-templates.mjs`: ran in those four repos; all project-owned templates were kept.
- `rg "First checkpoint:|Prompt requirements captured before work|First checkpoint complete|Codex output can compact"`: passed for Plate local templates plus `.agents` and `.claude` autogoal mirrors.
- Downstream `rg` audits passed for `.agents/skills/autogoal/**` and `.claude/skills/autogoal/**` in better-convex, plate, and informed-fe-v3.
- `skills-lock.json` autogoal source/hash in all four repos: `udecode/dotai 962dc01ee23c13f3c2f9f4205f8734028a2ce9af6a7708c0bf4364fcf4dbfbb5`.
- `/Users/zbeyens/git/plate-2 git diff --check`: passed.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker.
- Confidence line: high.
- Flow table:
  - Reproduced: N/A, workflow/template gap from prompt.
  - Verified: dotai validation, sync commands, rg audits, diff checks.
- Browser check: N/A, no browser surface.
- Outcome: autogoal templates now require prompt-requirement extraction as the first checkpoint locally, canonically in dotai, and in installed mirrors.
- Caveat: Skills CLI printed a non-fatal deleted-skill warning while still updating autogoal.
- Design:
  - Chosen boundary: dotai canonical source plus local Plate plan templates.
  - Why not quick patch: hand-editing installed mirrors would drift from source of truth.
  - Why not broader change: pack templates were additive rows, not standalone primary goal plans.
- Verified: commands above.
- PR body verified: N/A, no PR.

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
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A.
- Caveats: Skills CLI deleted-skill warning was non-fatal; downstream project-owned templates were preserved.

Timeline:
- 2026-06-03T15:33:31.605Z Task goal plan created.
- 2026-06-03: Local Plate autogoal templates patched.
- 2026-06-03: Dotai canonical autogoal patched, validated, committed, and pushed.
- 2026-06-03: Installed autogoal copies refreshed in Plate-2, better-convex, plate, and informed-fe-v3.
- 2026-06-03: Generated mirrors and downstream installs audited with `rg`.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final response after check-complete and goal completion |
| What is the goal? | Update autogoal templates so prompt requirements are first checkpoint locally and in dotai |
| What have I learned? | Autogoal needed explicit anti-compaction requirement extraction in every primary template |
| What have I done? | See Timeline and Verification evidence |

Open risks:
- None for the template sync. The unrelated latest slate-automation repair was handled as a separate scoped skill patch because this active goal had a different objective.
