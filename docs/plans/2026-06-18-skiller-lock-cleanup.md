# skiller lock cleanup

Objective:
Clean skiller lock; done when stale CE lenses are removed, routes rewired, sync/audits pass; plan docs/plans/2026-06-18-skiller-lock-cleanup.md.

Goal plan:
docs/plans/2026-06-18-skiller-lock-cleanup.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user prompt
- id / link: chat request
- title: clean skiller-lock after CE skill cleanup
- acceptance criteria:
  - remove stale or overlapping old `EveryInc/compound-engineering-plugin`
    entries from `skiller-lock.json`;
  - remove generated `.agents/skills/**` and `.claude/skills/**` mirrors for
    those removed entries;
  - keep only explicit reviewer/proof lenses that still have a durable source
    route and no better local owner;
  - rewire source rules/templates before deleting a referenced skill;
  - do not remove current owners such as `auto`, `maintainer`, `autoclosure`,
    `architecture-cleanup`, `plite-research`, `performance`, `tdd`, or
    `agent-native-reviewer`;
  - run `pnpm install` to regenerate mirrors and audit that no dangling
    removed-skill references remain.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A, no duration requested
- semantics: N/A
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- `skiller-lock.json` keeps only `agent-native-reviewer` from the old
  `EveryInc/compound-engineering-plugin` lens set, unless audit proves another
  explicit no-better-owner keeper is required.
- Removed skiller entries have no generated `.agents/skills/<name>/SKILL.md` or
  `.claude/skills/<name>/SKILL.md` mirrors.
- Source rules/templates no longer route to removed skiller names; references
  are replaced with current owners such as `architecture-cleanup`,
  `plite-research`, `performance`, `autoreview`, `grill-with-docs`, `tdd`, or
  direct source/history reads.
- `pnpm install` passes and final audits pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-18-skiller-lock-cleanup.md` passes.

Verification surface:
- `pnpm install`
- Node audit of `skiller-lock.json` keep/remove set plus generated mirrors
- `rg` audit across `.agents/AGENTS.md`, `.agents/rules`, root `AGENTS.md`, and
  `docs/plans/templates` for removed skill names
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-18-skiller-lock-cleanup.md`

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `skiller-lock.json`, `.agents/rules/*.mdc`,
  `docs/plans/templates/**`, and generated `.agents/skills/**` /
  `.claude/skills/**` mirrors after sync.
- Allowed edit scope: skill topology metadata, source guidance that names old
  CE lenses, generated mirrors for removed locks, and this goal plan.
- Browser surface: N/A, no app/browser UI changed.
- Tracker sync: N/A, no issue/PR tracker mutation requested.
- Non-goals: no downstream repo cleanup in this pass, no package/runtime code,
  no PR, no release, no wholesale skill rewrite.

Output budget strategy:
- Scope audits to named removed skills and agent source paths. Exclude
  references folders for stale-name searches unless a path is the named source.
  Use Node summaries for lock/generated state instead of streaming all skill
  bodies.

Blocked condition:
- Stop if a removed CE skill still has no current local owner and the right
  replacement would change workflow semantics enough to need user choice.

Task state:
- task_type: agent skill topology cleanup
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: valid
- confidence: high
- next owner: sync-skills
- reason: user accepted the harsh recommendation to purge stale/overlapping
  `skiller-lock.json` CE entries; source routing and generated mirrors now
  match the cleaned lock.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-18-skiller-lock-cleanup.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance criteria above lists remove stale CE locks, remove mirrors, rewire routes first, keep current owners, run sync/audit. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Read `sync-skills`, `autogoal`, `.agents/skiller.toml`, current lock inventory, and source references. |
| Active goal checked or created | yes | `get_goal` returned none; created this goal. |
| Source of truth read before edits | yes | Read `skiller-lock.json`, generated mirror inventory, source references, and relevant current-owner rules. |
| Tracker comments and attachments read | no | N/A: no tracker source. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: agent topology cleanup, not product-code task. |
| TDD decision before behavior change or bug fix | no | N/A: no runtime behavior change. |
| Branch decision for code-changing task | no | N/A: no commit/PR requested. |
| Release artifact decision | no | N/A: no package release artifact. |
| Browser tool decision for browser surface | no | N/A: no browser surface. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker mutation. |
| Output budget strategy recorded | yes | Audits are scoped to lock/generated state and named source-reference files. |
| Agent-native pack selected | yes | This changes agent skills and routing. |
| Agent-facing action surface identified | yes | `skiller-lock.json`, generated skills, and source rules/templates are the action surface. |
| Source rule versus generated mirror boundary identified | yes | Source rules/templates are edited; generated skill mirrors are deleted/synced, not hand-edited. |
| `agent-native-reviewer` loaded or waiver recorded | no | Waiver: this task preserves `agent-native-reviewer`; sync-skills plus lock/generated/source audits are the governing review. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason. N/A: no video.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason. N/A: no package release artifact.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason. N/A: no branch/commit requested.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason. N/A: no env-rot failure.
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
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `pnpm install` passed; lock/generated/source audits passed. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: skill topology cleanup, not a bug fix. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Node audit proves only `agent-native-reviewer` remains from CE and removed mirrors are gone. |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: no TS/config type surface changed. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package exports/barrels. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A for package manifests; ran `pnpm install` because agent generation changed. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` ran Skiller apply successfully. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All audits ran in `/Users/zbeyens/git/plate-2`, the owning repo for this `skiller-lock.json`. |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: no browser surface. |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A: no browser surface. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no CI-controlled templates. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: no package public API. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: no registry component. |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A: no product docs/content; only agent workflow docs. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risk: deleting a referenced skill creates broken routing. Proof: source audit found no removed names in rules/templates/AGENTS. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Waiver: `sync-skills` methodology plus lock/generated/source audits are the direct review; `agent-native-reviewer` was preserved. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no install-corruption failure. |
| Autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | N/A: no product implementation; topology sync verified by audits. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR/browser proof. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent | N/A: no lintable product code; JSON parse and sync/audits are the proof. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Searches were scoped to named skills and agent/source paths. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-18-skiller-lock-cleanup.md` | Final closeout command follows this evidence write. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` passed and generated mirrors match lock. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | Current rules point to existing owners; removed generated skills are gone; `agent-native-reviewer` still exists. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Waiver: the cleanup preserves the agent-native reviewer and verifies routing mechanically. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | read sync-skills, autogoal, skiller config, lock inventory, and references | implementation complete |
| Implementation | complete | rewired source rules/templates; removed 19 stale CE lock entries and mirrors | verification complete |
| Verification | complete | `pnpm install`, lock/generated audit, source audit, JSON parse all passed | closeout |
| PR / tracker sync | n/a | no PR/tracker requested | final response |
| Closeout | complete | final checker command follows | final response |

Findings:
- `adversarial-document-reviewer` was stale lock trash: present in `skiller-lock.json`, absent from generated `.agents`/`.claude` mirrors.
- The old CE reviewer/research lenses were mostly kept alive by routing lists, not by durable ownership.
- `agent-native-reviewer` is still a legitimate proof gate in templates and source rules, so it stays for now.
- `performance-oracle` overlapped with the repo-local `performance` skill and was collapsed into `performance`.

Decisions and tradeoffs:
- Keep only `agent-native-reviewer` from the old `EveryInc/compound-engineering-plugin` skiller set.
- Replace generic CE research/review names with current owners: direct prior-doc/source search, `research-wiki`, `plite-research`, `architecture-cleanup`, `performance`, `grill-with-docs`, `autoreview`, and `tdd`.
- Do not remove `agent-native-reviewer` until there is a better local/dotai owner for agent-action parity review.

Implementation notes:
- Patched `.agents/rules/major-task.mdc` to stop routing to the old CE reviewer/research stack.
- Patched `.agents/rules/task.mdc` to replace `learnings-researcher` and `framework-docs-researcher` with direct source/doc lookup rules.
- Patched `.agents/rules/auto.mdc` to replace `best-practices-researcher` and `repo-research-analyst` with `research-wiki`, `docs-creator`, direct source/docs audit, or package owner.
- Patched `.agents/rules/performance.mdc`, `.agents/rules/slate-plan.mdc`, `.agents/rules/plate-plan.mdc`, and `docs/plans/templates/slate-plan.md` to use `performance`, not `performance-oracle`.
- Removed 19 stale CE entries from `skiller-lock.json` and deleted their generated mirrors under `.agents/skills` and `.claude/skills`.

Review fixes:
- Merged duplicate `performance` rows created by the mechanical `performance-oracle` rename.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Large combined `performance-oracle` patch missed exact context | 1 | Use exact small patches plus mechanical rename, then audit duplicates | All `performance-oracle` references removed and duplicate rows merged. |

Verification evidence:
- `pnpm install` in `/Users/zbeyens/git/plate-2` passed and ran Skiller apply.
- Node audit: CE entries in `skiller-lock.json` are exactly `agent-native-reviewer`; removed lock rows and generated mirrors are absent; `agent-native-reviewer` generated mirrors exist.
- Source audit: no removed CE skill names remain in `.agents/AGENTS.md`, `.agents/rules`, root `AGENTS.md`, `docs/plans/templates`, or `skiller-lock.json`.
- Generated-tree audit: no removed CE skill names remain under `.agents/skills` or `.claude/skills`.
- JSON parse audit passed for `skiller-lock.json` and `skills-lock.json`.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker requested.
- Confidence line: high; lock/generated/source audits passed.
- Flow table:
  - Reproduced: N/A, no runtime bug.
  - Verified: `pnpm install`, lock/generated/source audits, JSON parse.
- Browser check: N/A, no browser surface.
- Outcome: `skiller-lock.json` now keeps only `agent-native-reviewer` from the old CE set; stale generated CE mirrors and source routes are gone.
- Caveat: `agent-native-reviewer` is still CE-sourced; keep it only until we promote/fork a better local/dotai owner.
- Design:
  - Chosen boundary: source rules route to current local owners; `skiller-lock.json` only keeps generated external lenses that are still explicitly needed.
  - Why not quick patch: deleting lock rows without rewiring source rules would leave dangling instructions.
  - Why not broader change: replacing `agent-native-reviewer` properly needs a dedicated owner/fork decision, not a silent delete.
- Verified: lock/generated/source audits pass.
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
- Caveats: `agent-native-reviewer` remains CE-sourced intentionally.

Timeline:
- 2026-06-18T13:13:58.786Z Task goal plan created.
- 2026-06-18 Source references rewired from stale CE lenses to current owners.
- 2026-06-18 Removed 19 CE lock entries and generated mirrors.
- 2026-06-18 Ran `pnpm install` and final audits.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout after passing audits |
| Where am I going? | Run check-complete, then final response |
| What is the goal? | Clean `skiller-lock.json` by removing stale CE lenses without dangling source routes |
| What have I learned? | The old CE set was mostly routing-list inertia; `agent-native-reviewer` is the only still-needed CE lens |
| What have I done? | See Timeline and Verification evidence |

Open risks:
- `agent-native-reviewer` remains sourced from `EveryInc/compound-engineering-plugin`. That is acceptable now because it is still a named proof gate, but it is the next candidate to fork/promote if we want zero CE dependency.
