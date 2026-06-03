# enhance slate automation autogoal checkpoints

Objective:
Enhance slate-automation checkpoint model; done when autogoal slicing, learning, skill topology, and docs ingestion rules sync; plan docs/plans/2026-06-03-enhance-slate-automation-autogoal-checkpoints.md.

Goal plan:
docs/plans/2026-06-03-enhance-slate-automation-autogoal-checkpoints.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: chat request
- id / link: current thread
- title: Make `slate-automation` abuse autogoal checkpoints and learn from workflow mistakes
- acceptance criteria: source rule says long work is split into autogoal checkpoints; supervisor can update/create/merge/remove Slate skills with evidence; learning loop classifies misses and repairs owners; docs ingestion/consolidation is explicit; generated skill mirror syncs.

Completion threshold:
- `.agents/rules/slate-automation.mdc` includes autogoal checkpointing as the anti-compaction model.
- The skill defines topology authority for update/create/merge/remove of `slate-*` skills with evidence gates.
- The skill defines learning-loop classification and repair routing.
- The skill defines docs/decision ingestion and consolidation.
- Generated `.agents/skills/slate-automation/SKILL.md` mirrors the source.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-enhance-slate-automation-autogoal-checkpoints.md` passes.

Verification surface:
- `pnpm install`
- `rg` source/mirror audit for checkpoint, topology, learning, taste, and docs ingestion sections.
- Goal plan completion checker.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `.agents/rules/slate-automation.mdc`; generated mirror is `.agents/skills/slate-automation/SKILL.md`.
- Allowed edit scope: `.agents/rules/slate-automation.mdc`, generated mirror via `pnpm install`, this goal plan.
- Browser surface: N/A; skill text only.
- Tracker sync: N/A.
- Non-goals: do not run a real overnight automation loop; do not commit/push/PR.

Output budget strategy:
- Focused `sed` and `rg`; no full generated skill dumps except the one generated target skill.

Blocked condition:
- Block only if skill sync fails and no local source repair is available.

Task state:
- task_type: agent workflow skill update
- task_complexity: normal
- current_phase: closeout
- current_phase_status: done
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: done
- confidence: high
- next owner: final response
- reason: source and generated skill now encode checkpoint sharding, topology authority, learning loop, taste profile, and docs ingestion.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-enhance-slate-automation-autogoal-checkpoints.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Loaded `autogoal`; used `skill-creator` principles and current `slate-automation` source. |
| Active goal checked or created | yes | `get_goal` returned none; created this checkpoint goal. |
| Source of truth read before edits | yes | Read `.agents/rules/slate-automation.mdc`. |
| Tracker comments and attachments read | no | N/A: chat-driven skill update. |
| Video transcript evidence required | no | N/A: no media evidence. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: agent workflow rule update; memory and current skill source were enough. |
| TDD decision before behavior change or bug fix | no | N/A: no runtime behavior change. |
| Branch decision for code-changing task | no | N/A: no branch/PR requested. |
| Release artifact decision | no | N/A: no package release artifact. |
| Browser tool decision for browser surface | no | N/A: no browser surface changed. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker sync. |
| Output budget strategy recorded | yes | Focused reads and `rg`; no broad dumps. |
| Agent-native pack selected | yes | Applied `agent-native`. |
| Agent-facing action surface identified | yes | `slate-automation` skill. |
| Source rule versus generated mirror boundary identified | yes | Source is `.agents/rules/slate-automation.mdc`; mirror is `.agents/skills/slate-automation/SKILL.md`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Waiver: prior reviewer was loaded for this skill; this update preserves action parity and expands agent authority with explicit evidence gates. |

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
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `pnpm install` passed; `rg` source/mirror audit found all new sections. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: skill policy update, not runtime bug fix. |
| Targeted behavior verification | no | Run focused test/proof for changed behavior or record N/A | N/A: no Slate runtime behavior changed. |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: markdown skill rule only. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package exports. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | `pnpm install` ran for skill sync; no package graph change expected. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` passed; generated mirror contains new sections. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | Commands ran in `/Users/zbeyens/git/plate-2`, the skill source workspace. |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: no browser surface changed. |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: no package release. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Skill source and private plan changed; source/mirror audit verifies claims. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risk: excessive autonomy could mutate skill topology badly. Mitigation: topology changes require repeated-miss evidence, source patch, sync, mirror audit, agent-native review, and plan row. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Waiver: this expands agent-native capability; no parity gap found because skill exposes the same supervisor repairs a human would perform. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no corruption signal. |
| Autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | N/A: agent rule text only; agent-native/source audit is the relevant review. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled for skill update. |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent | N/A: markdown-only skill rule; `pnpm install` was required sync. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Focused output only. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-enhance-slate-automation-autogoal-checkpoints.md` | Passed after repairing the missing evidence row. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` passed; generated mirror has new checkpoint/topology/learning/docs sections. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `.agents/skills/slate-automation/SKILL.md` metadata remains present. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Waived with source audit: capability is discoverable and expands agent-native repair authority with evidence gates. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | read current `slate-automation` source and skill-creator guidance | complete |
| Implementation | complete | patched `.agents/rules/slate-automation.mdc`; ran `pnpm install` | complete |
| Verification | complete | source/mirror `rg` audit passed | complete |
| PR / tracker sync | complete | N/A: no PR/tracker requested | complete |
| Closeout | complete | final response pending | final response |

Findings:
- One prompt per huge loop is lower quality than autogoal checkpoints because output gets compacted and loses judgment context.
- `slate-automation` now treats autogoal as memory, checkpoint, anti-compaction strategy, and quality gate.
- The supervisor now has explicit topology authority to update/create/merge/remove `slate-*` skills when evidence proves overlap, missing ownership, or stale routing.
- The supervisor now classifies every failed attempt before continuing: runtime bug, missing oracle, missing metric, lying metric, weak visual proof, stale docs, bad API, wrong specialist owner, missing/overlapping skill, or too-large prompt.
- The supervisor now has a taste profile and docs ingestion protocol so it can act more like the user's judgment without embedding raw chat history in the skill body.

Decisions and tradeoffs:
- Added explicit checkpoint sharding instead of telling agents to "keep going" in one prompt.
- Added topology freedom with evidence gates rather than unlimited skill mutation.
- Added docs ingestion and consolidation as a procedure, not a giant hardcoded doc dump in the skill.
- Kept the generated skill body under control; no bundled reference docs were added yet because the north-star doc should be created after accepted decisions are consolidated.

Implementation notes:
- Patched `.agents/rules/slate-automation.mdc`.
- Ran `pnpm install`, generating `.agents/skills/slate-automation/SKILL.md`.

Review fixes:
- Agent-native/source audit: PASS. The skill exposes and constrains the new agent authority directly.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Goal checker failed because `Goal plan complete` had no evidence. | 1 | Fill the self-referential row and rerun checker. | Resolved; rerun passed. |

Verification evidence:
- `pnpm install` passed in `/Users/zbeyens/git/plate-2`.
- `rg -n "Autogoal Checkpoint Model|Split long work|Allowed topology changes|Learning Loop|Taste Profile|At the start of a long run|too-large prompt|one focused checkpoint" .agents/rules/slate-automation.mdc .agents/skills/slate-automation/SKILL.md` found all required source and mirror sections.
- `sed -n '1,340p' .agents/skills/slate-automation/SKILL.md` confirmed generated mirror content.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-enhance-slate-automation-autogoal-checkpoints.md` passed.

Final handoff contract:
- PR line: N/A
- Issue / tracker line: N/A
- Confidence line: high
- Flow table:
  - Reproduced: N/A, skill policy update
  - Verified: source/mirror audit passed; browser N/A
- Browser check: N/A, no browser surface changed
- Outcome: `slate-automation` now abuses autogoal checkpoints and can repair skill topology with evidence.
- Caveat: the new checkpoint model has not yet been exercised on a real overnight run.
- Design:
  - Chosen boundary: supervisor owns checkpoint cadence and topology repair; specialists still own patch/perf/plan/gate execution.
  - Why not quick patch: just saying "use autogoal more" would not prevent future compaction/output-budget failures.
  - Why not broader change: no need to rewrite every Slate skill now; supervisor can mutate topology only when evidence proves it.
- Verified: `pnpm install`, generated mirror audit, source/mirror `rg`
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
- Caveats: first real `slate-automation` run will be the practical validation.

Timeline:
- 2026-06-03T11:04:56.440Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final response |
| What is the goal? | Enhance `slate-automation` with autogoal checkpointing, learning, topology repair, and docs ingestion |
| What have I learned? | Long supervisor loops should be checkpointed through autogoal instead of depending on compacted output |
| What have I done? | Patched source rule, synced generated skill, verified required sections |

Open risks:
- First real overnight `slate-automation` run may reveal cadence gaps that should self-repair the skill.
