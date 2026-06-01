# docs creator rule update

Objective:
Update the Plate `docs-creator` source rule with the recent docs-shape
learnings, regenerate the generated skill copy, and verify agents can discover
the new guidance from the skill they actually read.

Goal plan:
docs/plans/2026-05-31-docs-creator-rule-update.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user request
- id / link: current thread
- title: Make `docs-creator` more comprehensive from recent docs edits
- acceptance criteria: update source rule rather than generated skill directly;
  include gap review, concept-vs-reference, behavior/runtime docs, navigation,
  and sync guidance; run `pnpm install`; verify generated skill copy.

Completion threshold:
- `.agents/rules/docs-creator.mdc` contains the new guidance, `pnpm install`
  regenerates `.agents/skills/docs-creator/SKILL.md`, and source/skill both
  expose the new sections.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-05-31-docs-creator-rule-update.md` passes.

Verification surface:
- Source audit: `.agents/rules/docs-creator.mdc`.
- Generated mirror audit: `.agents/skills/docs-creator/SKILL.md`.
- Sync command: `pnpm install`.
- Discoverability check: `rg -n "Source Of Truth|Gap Review And Page Topology|Behavior / Runtime Concept|Navigation And Routing|pnpm install" .agents/rules/docs-creator.mdc .agents/skills/docs-creator/SKILL.md`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `.agents/rules/docs-creator.mdc`.
- Allowed edit scope: `.agents/rules/docs-creator.mdc`, generated skill output,
  and this plan.
- Browser surface: none.
- Tracker sync: none.
- Non-goals: no PR/commit, no broad docs rewrite, no unrelated skill cleanup.

Output budget strategy:
- Searches were scoped to exact rule/skill/memory terms and capped with
  `max_output_tokens`.

Blocked condition:
- Block only if source rule is missing, `pnpm install` fails, generated skill
  does not include the source changes, or agent-native review finds an accepted
  actionability issue.

Task state:
- task_type: agent-native rule update
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: complete
- confidence: high
- next owner: user
- reason: source rule updated, generated skill synced, and discoverability check
  passed.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-05-31-docs-creator-rule-update.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | `docs-creator`, `autogoal`, and `agent-native-reviewer` skill text read. |
| Active goal checked or created | yes | Active goal created for docs-creator rule update. |
| Source of truth read before edits | yes | `.agents/rules/docs-creator.mdc` read. |
| Tracker comments and attachments read | yes | N/A: no tracker. |
| Video transcript evidence required | yes | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | yes | N/A: agent rule update, not product-code task. |
| TDD decision before behavior change or bug fix | yes | N/A: no runtime behavior change. |
| Branch decision for code-changing task | yes | N/A: no branch requested. |
| Release artifact decision | yes | N/A: no package/API release artifact. |
| Browser tool decision for browser surface | yes | N/A: no browser surface. |
| PR expectation decision | yes | N/A: no PR requested. |
| Tracker sync expectation decision | yes | N/A: no tracker. |
| Output budget strategy recorded | yes | Scoped/capped searches only. |
| Agent-native pack selected | yes | Plan created with agent-native pack. |
| Agent-facing action surface identified | yes | `docs-creator` skill/rule text. |
| Source rule versus generated mirror boundary identified | yes | Source is `.agents/rules/docs-creator.mdc`; SKILL is generated. |
| `agent-native-reviewer` loaded or waiver recorded | yes | `.agents/skills/agent-native-reviewer/SKILL.md` loaded; no accepted findings. |

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
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `pnpm install` passed; source/generated rg check passed. |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | N/A: instruction improvement. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | `rg` confirmed sections in both source and generated skill. |
| TypeScript or typed config changed | yes | Run relevant typecheck | N/A: markdown rule text only. |
| Package exports or file layout changed | yes | Run `pnpm brl` before final verification and keep generated barrel updates | N/A. |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` and relevant package checks | `pnpm install` passed. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` passed; generated `SKILL.md` contains new sections. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands run in `/Users/zbeyens/git/plate`. |
| Browser surface changed | yes | Capture Browser Use proof or record explicit waiver/blocker | N/A: no browser surface. |
| Browser final proof | yes | Attach screenshot or exact browser verification caveat when browser proof applies | N/A. |
| CI-controlled template output changed | yes | Restore generated template output or record why it is intentionally kept | N/A: generated skill output is expected from source rule sync. |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | N/A: no package/API change. |
| Registry-only component work changed | yes | Update `docs/components/changelog.mdx` or record N/A | N/A. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A: agent instruction rule, not public docs content. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode: agents patch generated `SKILL.md` directly or miss nav/concept guidance. Proof: source rule plus generated skill both include new guidance. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Loaded; no accepted findings. Discoverability verified in generated skill. |
| Local install corruption suspected | yes | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no env-rot failure. |
| Autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | N/A: targeted agent-native review and source/generated sync proof cover this instruction-only change. |
| PR create or update | yes | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested. |
| Task-style PR body verified | yes | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR. |
| PR proof image hosting | yes | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A. |
| Tracker sync-back | yes | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | Scoped equivalent: source/generated text verification after `pnpm install`. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Scoped/capped output only. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-05-31-docs-creator-rule-update.md` | ready to run. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | Passed. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `SKILL.md` contains new sections. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Loaded; no accepted findings. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | source rule and relevant skills read | implementation |
| Implementation | complete | source rule patched | verification |
| Verification | complete | `pnpm install`; generated skill rg check | closeout |
| PR / tracker sync | complete | N/A: no PR/tracker requested | final response |
| Closeout | complete | plan finalized | final response |

Findings:
- `docs-creator` needed explicit topology guidance: gap review, concept-vs-reference
  decisions, behavior/runtime concept pages, and docs nav routing.

Decisions and tradeoffs:
- Edited `.agents/rules/docs-creator.mdc`, not generated `SKILL.md`.
- Regenerated via `pnpm install`.
- Kept the update focused to docs-authoring guidance; did not broaden into
  unrelated agent tooling policy.

Implementation notes:
- Added `Source Of Truth`.
- Added `Gap Review And Page Topology`.
- Added `Navigation And Routing`.
- Added `Behavior / Runtime Concept`.
- Expanded workflow, ownership, guide/system, and verification checklist.

Review fixes:
- None.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `pnpm install`: passed; skiller applied Claude/Codex rules and fumadocs ran.
- `rg -n "Source Of Truth|Gap Review And Page Topology|Behavior / Runtime Concept|Navigation And Routing|pnpm install" .agents/rules/docs-creator.mdc .agents/skills/docs-creator/SKILL.md`: passed.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A.
- Confidence line: high.
- Flow table:
  - Reproduced: N/A, instruction update.
  - Verified: `pnpm install`, generated skill audit.
- Browser check: N/A.
- Outcome: `docs-creator` rule and generated skill now include the new guidance.
- Caveat: no PR/commit created.
- Design:
  - Chosen boundary: source rule plus generated mirror.
  - Why not quick patch: generated `SKILL.md` is not source of truth.
  - Why not broader change: user asked for `docs-creator` only.
- Verified: source/generated section audit after sync.
- PR body verified: N/A.

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
- Caveats: no commit/stage/PR.

Timeline:
- 2026-05-31T19:49:07.885Z Task goal plan created.
- 2026-05-31T19:50Z Patched `.agents/rules/docs-creator.mdc`.
- 2026-05-31T19:51Z Ran `pnpm install`; generated skill sync succeeded.
- 2026-05-31T19:51Z Verified new sections in source rule and generated skill.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final response |
| What is the goal? | Make `docs-creator` more comprehensive and synced |
| What have I learned? | The missing guidance was page topology and runtime concept docs |
| What have I done? | See Timeline |

Open risks:
- Low: no external review helper was run; this was an instruction-only update
  verified through source/generated sync and agent-native source audit.
