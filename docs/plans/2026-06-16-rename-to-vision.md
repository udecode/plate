# rename legacy Slate taste profile to vision

Objective:
Create `vision` as the unified doctrine skill; done when source rules, generated skill, references, and sync proof are updated.

Goal plan:
docs/plans/2026-06-16-rename-to-vision.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user instruction
- id / link: current chat
- title: Create unified `vision` skill from the legacy Slate taste profile
- acceptance criteria: `vision` skill exists, carries Common/Slate/Plate sections, absorbs current Slate taste rules and Plate north-star doctrine, source references route to `vision`, generated mirrors are synced, no manual generated skill edits.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Completion threshold:
- Source-owned `vision` skill replaces the legacy Slate taste profile as the agent taste
  and routing profile, contains Common/Slate/Plate sections, references from
  active source rules/templates use `vision`, generated skills are synced, and
  source audits prove no active source-rule dependency on the legacy profile
  remains.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-rename-to-vision.md` passes.

Verification surface:
- `pnpm install` syncs generated `.agents/skills/**`.
- Source audits with `rg` over `.agents/rules`, `.agents/AGENTS.md`, and
  `docs/plans/templates` for old doctrine names and `vision`.
- Generated mirror audit with `rg` over `.agents/skills/vision/SKILL.md`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `.agents/rules/*.mdc`, `.agents/AGENTS.md`,
  `docs/plans/templates/*`, generated mirrors after `pnpm install`.
- Allowed edit scope: agent rules, generated mirrors via sync, goal plan.
- Browser surface: N/A.
- Tracker sync: N/A.
- Non-goals: do not create root `VISION.md` in this pass; do not patch Slate
  runtime; do not hand-edit generated `.agents/skills/**/SKILL.md`; do not keep
  a legacy compatibility wrapper.

Output budget strategy:
- Use targeted `rg -l`/`rg -n` over `.agents/rules`, `.agents/AGENTS.md`, and
  `docs/plans/templates`; avoid old historical `docs/plans/**` rewrites except
  this active plan.

Blocked condition:
- Block only if `pnpm install` cannot regenerate skills or source references
  expose an unclear owner decision between keeping `north-star` and `vision`.

Task state:
- task_type: agent-native skill topology rename
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: implement hard rename to `vision` and route Slate/Plate/Common
  doctrine through it
- confidence: high
- next owner: source-rule patch
- reason: user explicitly wants `vision` first from the legacy Slate taste
  profile, with common/slate/plate sections.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-rename-to-vision.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Requirements captured in plan before source edits. |
| Skill analysis before edits | yes | Read `autogoal`, the legacy Slate taste profile, Plate doctrine source, and `agent-native-reviewer`; source refs mapped. |
| Active goal checked or created | yes | `get_goal` returned none; active goal created. |
| Source of truth read before edits | yes | Legacy Slate taste source, Plate doctrine source, `slate-auto`, `slate-migration`, `plate-plugin-creator`, `.agents/AGENTS.md` refs audited. |
| Tracker comments and attachments read | no | N/A: no tracker. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: skill topology rename, no runtime behavior. |
| TDD decision before behavior change or bug fix | no | N/A: no product behavior change. |
| Branch decision for code-changing task | no | N/A: user did not ask branch/PR. |
| Release artifact decision | no | N/A: agent skill docs only. |
| Browser tool decision for browser surface | no | N/A: no browser surface. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Targeted source/template audits only; historical plans excluded. One bad broad audit attempt is recorded below. |
| Agent-native pack selected | yes | Skill/rule action surface changed. |
| Agent-facing action surface identified | yes | `$vision`, `slate-auto` checkpoint zero, `slate-migration`, Plate plugin doctrine routing. |
| Source rule versus generated mirror boundary identified | yes | Edited `.agents/rules/**`; ran `pnpm install`; no generated skill was hand-edited. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded `.agents/skills/agent-native-reviewer/SKILL.md`; no user-action parity gap because this is a skill routing surface, not app UI. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Explicit requirements captured: create `vision` first; start by renaming
      the legacy Slate taste profile; include Slate taste content and Plate content;
      structure as three big sections: Common, Slate, Plate; support future
      unified Plate repo while preserving clear Slate package/docs and Plate
      package/docs boundaries.
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
- [x] Output budget discipline recorded and followed after the first miss:
      broad searches are scoped, capped, counted, or artifacted instead of
      streamed into goal context.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `pnpm install`, literal old-name audits, generated mirror existence check, and skill list audit completed in `/Users/zbeyens/git/plate-2`. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: this is a skill rename/topology task, not a runtime bug. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Verified generated `vision` skill exists and active source references route to `vision`. |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: Markdown/rule files only. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package exports or source file layout changed. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | `pnpm install` ran anyway for Skiller sync; lockfile reported up to date. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` generated `.agents/skills/vision/SKILL.md`; old generated doctrine names absent from `.agents/skills`. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All proof ran in `/Users/zbeyens/git/plate-2`, the owning repo for `.agents`. |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: no browser/UI route changed. |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A: no browser-visible behavior. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: plan templates are source inputs, not CI-generated registry output. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: agent skill docs only. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: no registry component work. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Source-backed skill docs changed; verified generated mirror and active references. No public docs page changed. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode: stale old doctrine owner causes wrong skill routing. Proof: old-name audits empty; new generated `vision` exists; routing refs updated. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Loaded reviewer. Finding: no missing app UI parity; action surface is agent-readable through `$vision`, `.agents/AGENTS.md`, `slate-auto`, `slate-migration`, and `plate-plugin-creator`. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no install-corruption failure shape. |
| Autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | N/A: source-rule rename and generated mirror sync only; agent-native review covered action-surface risk. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: PR not requested. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `Fixes ...`, `95-100% confidence`, `Phase / Tests / Browser` table, and bold Outcome/Caveat/Design/Verified sections | N/A: no PR. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR/browser proof. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent | N/A: no TS/JS/source lint surface changed; `pnpm install`/Skiller sync is the relevant verification. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | One accidental double-quoted `rg` miss streamed broad output; recorded and recovered with fixed-string audits. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-rename-to-vision.md` | Run after this plan update. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` passed; `.agents/skills/vision/SKILL.md` exists; old generated names absent. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `.agents/AGENTS.md` lists `vision`; generated `vision` has metadata source `.agents/rules/vision.mdc`; slate/plate owner rules link to `vision`. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Manual agent-native pass complete; no parity finding requiring further patch. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Plan created; old source rules and Plate doctrine source read. | implementation |
| Implementation | complete | Added `.agents/rules/vision.mdc`; removed old source doctrine owners; updated active source references. | verification |
| Verification | complete | `pnpm install` plus literal audits and generated mirror checks passed. | closeout |
| PR / tracker sync | skipped | N/A: no PR/tracker requested. | final response |
| Closeout | complete | Plan evidence recorded; completion script is final gate. | final response |

Findings:
- Legacy Slate taste and Plate doctrine were overlapping doctrine owners. Keeping
  both would make future routing worse.
- The durable owner should be `vision`, with Common/Slate/Plate sections and
  explicit Slate-vs-Plate boundary law.
- Active source references should use `vision`; historical old plans are not
  rewritten.

Decisions and tradeoffs:
- Hard-cut old doctrine source rules. No alias
  wrapper, because aliases are exactly the stale routing debt this task is
  removing.
- Root `VISION.md` is deferred. The skill already says to read it when it
  exists, but this pass only creates the agent skill owner.
- `vision` is agent execution taste; a future root `VISION.md` is public
  contributor fit.

Implementation notes:
- Added `.agents/rules/vision.mdc`.
- Removed legacy doctrine source files after merging their content into
  `.agents/rules/vision.mdc`.
- Updated `.agents/rules/slate-auto.mdc`, `.agents/rules/slate-migration.mdc`,
  `.agents/rules/plate-plugin-creator.mdc`, `.agents/rules/continue.mdc`,
  `.agents/AGENTS.md`, `docs/plans/templates/slate-auto.md`, and
  `docs/plans/templates/slate-migration.md`.
- Ran `pnpm install` so `.agents/skills/vision/SKILL.md` and other generated
  mirrors are regenerated by Skiller.

Review fixes:
- Fixed stale `[north-star](../vision/SKILL.md)` link label to `vision`.
- Fixed stale plain `north-star` wording in `docs/plans/templates/slate-auto.md`.
- Fixed stale generic `north-star claim` wording in `.agents/rules/continue.mdc`
  and regenerated `.agents/skills/continue/SKILL.md`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Double-quoted `rg` audit pattern contained backticks, causing shell command substitution and huge output | 1 | Use `rg -F` fixed-string searches or single-quoted patterns per literal | Corrected follow-up audits use fixed-string commands; source skill already carries this command-pitfall rule. |

Verification evidence:
- `pnpm install` in `/Users/zbeyens/git/plate-2` passed; Skiller apply
  completed successfully and fumadocs-mdx generated.
- Old doctrine-name audits over `.agents/rules`, `.agents/skills`,
  `.agents/AGENTS.md`, and `docs/plans/templates` returned no matches.
- `rg -n -F 'north-star' .agents/rules .agents/skills .agents/AGENTS.md docs/plans/templates`
  returned no matches.
- `test -f .agents/skills/vision/SKILL.md` passed.
- `find .agents/skills -maxdepth 2 -name SKILL.md` listed
  `.agents/skills/vision/SKILL.md` and no legacy doctrine
  generated skill path.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker.
- Confidence line: High for source/generator sync; no runtime claim made.
- Flow table:
  - Reproduced: N/A, no runtime bug.
  - Verified: `pnpm install`, old-name audits, generated mirror existence.
- Browser check: N/A, no browser surface.
- Outcome: `vision` is now the unified Common/Slate/Plate doctrine skill and
  old doctrine names are cut from active source/generated agent surfaces.
- Caveat: root `VISION.md` is not created in this pass; the skill is ready to
  defer to it when it exists.
- Design:
  - Chosen boundary: `.agents/rules/vision.mdc` as source; generated
    `.agents/skills/vision/SKILL.md` via `pnpm install`.
  - Why not quick patch: replacing only references would leave duplicate
    doctrine owners.
  - Why not broader change: root public `VISION.md` belongs to the next pass;
    this task was explicitly "vision first" from the legacy profile.
- Verified: source references, generated mirror, old-name absence.
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
- Caveats: root `VISION.md` still needs a future public/contributor pass.

Timeline:
- 2026-06-16T08:48:37.065Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete; final completion script remains. |
| Where am I going? | Run `check-complete`, mark active goal complete, final response. |
| What is the goal? | Rename Slate/Plate doctrine owner to `vision` and cut old active names. |
| What have I learned? | Duplicate doctrine owners create routing ambiguity; `vision` should own Common/Slate/Plate taste. |
| What have I done? | Added `vision`, removed old source owners, updated active refs, synced generated skills, audited old names. |

Open risks:
- None for runtime/package behavior. Remaining known follow-up is a separate
  public root `VISION.md` pass when desired.
