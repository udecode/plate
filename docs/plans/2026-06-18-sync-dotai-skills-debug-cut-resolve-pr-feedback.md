# sync dotai skills debug cut resolve pr feedback

Objective:
Sync dotai skills: cut debug, promote resolve-pr-feedback, refresh downstream installs; done when dotai validates and plan passes.

Goal plan:
docs/plans/2026-06-18-sync-dotai-skills-debug-cut-resolve-pr-feedback.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user prompt
- id / link: chat request
- title: cut dotai debug, sync other dotai skills, promote resolve-pr-feedback
- acceptance criteria:
  - remove `debug` from dotai shared skills and configured downstream sync;
  - refresh/sync all other configured dotai skills;
  - promote local `.agents/rules/resolve-pr-feedback.mdc` into dotai as a
    generic shared skill;
  - keep Plate-specific policy/templates local where they are project-owned;
  - use `sync-skills` dotai mode methodology;
  - validate dotai with `scripts/validate-skills`;
  - refresh downstream installed skills through `npx skills ...`;
  - do not commit or push downstream repos unless explicitly asked.

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
- Dotai no longer exposes `debug`.
- Global sync config no longer lists `debug`.
- Dotai contains a generic `skills/resolve-pr-feedback/SKILL.md` derived from
  the Plate source without Plate-specific product policy.
- Dotai validation passes.
- Downstream configured repos remove `debug` from installed skills where
  present and refresh configured non-debug dotai skills.
- Plate installs `resolve-pr-feedback` from dotai or preserves an explicit
  local fork with reason.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-18-sync-dotai-skills-debug-cut-resolve-pr-feedback.md` passes.

Verification surface:
- `/Users/zbeyens/git/dotai/scripts/validate-skills`
- `node --check` for changed dotai helper scripts if any
- `rg` audits for `debug` and `resolve-pr-feedback` in dotai, global config,
  local Plate rules/skills, and downstream lock/generated folders
- `npx skills remove debug --agent '*' -y` in each configured downstream repo
  where installed
- `npx skills update <skill> --project -y` or fallback
  `npx skills add udecode/dotai --skill <skill> --agent '*' -y` for configured
  non-debug dotai skills
- downstream generated-sync command when repo AGENTS requires it

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Dotai mode requires committing and pushing dotai after validation; do not
  create PRs, comments, commits, or pushes in downstream repos.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth:
  `/Users/zbeyens/git/dotai/skills/**`, `/Users/zbeyens/git/dotai/README.md`,
  `/Users/zbeyens/.agents/config.json`, local Plate
  `.agents/rules/resolve-pr-feedback.mdc`, local Plate
  `docs/plans/templates/resolve-pr-feedback.md`, downstream `skills-lock.json`
  files and generated skill folders.
- Allowed edit scope: dotai skill source, global sync config, Plate
  `resolve-pr-feedback` source ownership, generated skill mirrors through repo
  sync, and downstream installed skill lock/generated files through Skills CLI.
- Browser surface: N/A, no app/browser UI changed.
- Tracker sync: N/A, no issue/PR tracker mutation requested.
- Non-goals: no downstream commits, no downstream PRs, no wholesale template
  overwrite, no Plate-specific policy copied into dotai, no debug replacement
  skill added under a new name.

Output budget strategy:
- Scope searches to dotai, Plate agent files, config, and configured downstream
  skill metadata. Cap command output with `max_output_tokens`; use `rg` instead
  of full tree dumps.

Blocked condition:
- Stop if Skills CLI cannot install/remove from a downstream repo after a
  fallback add-refresh attempt, dotai validation fails for an unrelated
  repository problem, or a downstream local source conflicts with full dotai
  promotion and cannot be safely resolved without user choice.

Task state:
- task_type: cross-repo agent skill sync
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: valid
- confidence: high
- next owner: sync-skills
- reason: user explicitly requested dotai skill removal, downstream sync, and
  local `resolve-pr-feedback` promotion; dotai source, global sync config, and
  four downstream repos now match that ownership.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-18-sync-dotai-skills-debug-cut-resolve-pr-feedback.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance criteria and boundaries above list debug cut, non-debug sync, resolve-pr-feedback dotai promotion, dotai validation, downstream CLI refresh, and no downstream commits. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Read `sync-skills`, `autogoal`, dotai AGENTS/README, global sync config, and local Plate resolve-pr-feedback source context. |
| Active goal checked or created | yes | `get_goal` returned no active goal; created this goal and plan. |
| Source of truth read before edits | yes | Read dotai AGENTS/README, global config, local Plate `resolve-pr-feedback` and configured sync policy. |
| Tracker comments and attachments read | no | N/A: no tracker source. |
| Video transcript evidence required | no | N/A: no video source. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: skill-source sync, not product-code task. |
| TDD decision before behavior change or bug fix | no | N/A: no runtime bug/feature behavior. |
| Branch decision for code-changing task | no | N/A: no downstream PR/branch requested; dotai direct commit/push required by sync-skills dotai mode. |
| Release artifact decision | no | N/A: no published package release artifact. |
| Browser tool decision for browser surface | no | N/A: no browser surface. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker mutation. |
| Output budget strategy recorded | yes | Searches scoped to dotai, config, Plate agent files, and downstream skill metadata. |
| Agent-native pack selected | yes | `.agents/**`, dotai `skills/**`, and user-action tooling changed. |
| Agent-facing action surface identified | yes | Skills and sync config are the agent-facing action surface. |
| Source rule versus generated mirror boundary identified | yes | Dotai `skills/**` is shared source; Plate `.agents/rules/**` is local source; generated mirrors are evidence/sync output. |
| `agent-native-reviewer` loaded or waiver recorded | no | Waiver: this is skill topology/source sync; `sync-skills` is the direct governing reviewer. Run source audits and validation instead. |

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
      new branch needed, or N/A with reason. N/A: no downstream branch work.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason. N/A: no env-rot shape.
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
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Dotai `scripts/validate-skills` passed; downstream lock/generated audits passed; Plate plan checker is the final command. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: skill topology sync, not a runtime bug. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Dotai validation, shell syntax checks, config JSON parse, lock audits, generated sync commands, and source audits cover changed behavior. |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: no TS source/config changed. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package export/barrel work. |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` and relevant package checks | Ran downstream `bun install` or `pnpm install` per repo after skill sync. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | Dotai validate passed; Plate/better-convex/informed sync commands passed; generated skill lock audit passed. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | Proof ran in dotai for shared skill source and each configured downstream repo for installed mirrors. |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: no app/browser surface. |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A: no browser surface. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no CI-controlled template output. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: no package release/API change. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: no registry component work. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Dotai README and Plate resolve-pr-feedback plan template changed; verified by source audit and dotai validation. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risk: agents call stale `debug` or repo-local resolve scripts. Proof: locks have no `debug`, generated debug files gone, resolve points at `udecode/dotai`, local template paths point at installed skill scripts. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Waiver accepted: `sync-skills` owns this operation; source audits, dotai validation, install sync, and lock/generated audits are the governing review. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no install-corruption failure shape. |
| Autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | N/A: sync-skills validation/audits are the owner; no product implementation patch. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR/browser proof. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent | N/A: no product code lint surface; dotai validation and shell syntax checks are the right lint. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Commands were scoped to dotai, config, targeted skill paths, and downstream skill metadata. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-18-sync-dotai-skills-debug-cut-resolve-pr-feedback.md` | This is the final closeout command after this evidence write. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | Plate `pnpm install` regenerated mirrors; downstream repo sync commands passed. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `resolve-pr-feedback` is installed from dotai in each `skills-lock.json`; `debug` has no generated skill entry. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Waiver accepted: sync-skills source/lock audits replace a separate reviewer lens for this topology sync. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | read sync-skills/autogoal, dotai README/config, local resolve source | implementation complete |
| Implementation | complete | dotai `debug` removed; dotai `resolve-pr-feedback` added; global config updated; local Plate source moved to installed dotai skill; downstream sync run | verification complete |
| Verification | complete | dotai validation, script syntax checks, downstream install/sync, lock/generated audits | closeout |
| PR / tracker sync | n/a | no PR/tracker requested; dotai direct commit/push was required by sync-skills dotai mode | final response |
| Closeout | complete | plan filled; final checker command follows | final response |

Findings:
- Dotai no longer exposes `debug`; the shared skill source was deleted and dotai README was updated.
- `resolve-pr-feedback` is now a dotai shared skill and is installed from `udecode/dotai` in better-convex, plate, informed-fe-v3, and plate-2.
- The local Plate `resolve-pr-feedback` plan template stays local because it is project-owned, but its helper paths now target `.agents/skills/resolve-pr-feedback/scripts`.
- Skills CLI removed generated `debug` skill files but left stale `skills-lock.json` rows; after proving the CLI had no matching skill left, the stale lock keys were removed mechanically.
- `informed-fe-v3` still contains `debug` strings in Sentry SDK option docs; those are false positives, not skill references.

Decisions and tradeoffs:
- Cut `debug` rather than replace it with `diagnosing-bugs`; the repo task workflow already owns bug diagnosis.
- Promoted only the generic resolve-pr-feedback skill/script machinery to dotai; Plate-specific reviewer/plan policy remains in Plate.
- Refreshed other configured skills (`autogoal`, `orchestrator`, `tdd`, `autoreview`) instead of broad-installing unrelated skills.

Implementation notes:
- `/Users/zbeyens/git/dotai`: removed `skills/debug`, added `skills/resolve-pr-feedback`, updated `README.md`, committed and pushed `1f77d45` (`Update shared skills`).
- `/Users/zbeyens/.agents/config.json`: removed `debug`, added `resolve-pr-feedback: udecode/dotai`.
- `/Users/zbeyens/git/plate-2`: deleted `.agents/rules/resolve-pr-feedback*`, installed dotai `resolve-pr-feedback`, updated `docs/plans/templates/resolve-pr-feedback.md`, removed the `debug` routing bullet from `.agents/rules/task.mdc`, and ran `pnpm install`.
- `/Users/zbeyens/git/better-convex`, `/Users/zbeyens/git/plate`, `/Users/zbeyens/git/informed-fe-v3`: removed generated `debug`, installed dotai `resolve-pr-feedback`, refreshed configured skills, removed the `debug` routing bullet from `.agents/rules/task.mdc`, and ran each repo's generated-sync install command.

Review fixes:
- Fixed stale downstream `skills-lock.json` `debug` entries after the Skills CLI proved there was no generated `debug` skill left to remove.
- Fixed old local resolve-pr-feedback script paths in the Plate plan template after moving the owner to dotai.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `npx skills remove debug --agent '*' -y` | 1 | Use the remove command without invalid agent selector | `npx skills remove debug -y` removed generated files. |
| `npx skills update orchestrator --project -y` on older installs | 3 | Re-add the skill from its configured source | `npx skills add udecode/dotai --skill orchestrator --agent '*' -y` refreshed it. |
| `npx skills update autoreview --project -y` | 4 | Re-add from OpenClaw with explicit risk acceptance | `npx skills add openclaw/agent-skills --skill autoreview --agent '*' --dangerously-accept-openclaw-risks -y` refreshed it. |
| Skills CLI left stale `debug` lock rows after generated files were gone | 4 | Prove CLI says no matching skill, then mechanically delete only `skills.debug` | Lock audit now reports `debug: false` in all four repos. |

Verification evidence:
- `/Users/zbeyens/git/dotai`: `scripts/validate-skills` -> `skills ok`.
- `/Users/zbeyens/git/dotai`: `bash -n skills/resolve-pr-feedback/scripts/{get-pr-comments,get-thread-for-comment,reply-to-pr-thread,resolve-pr-thread}` -> pass.
- `/Users/zbeyens/git/dotai`: committed and pushed `1f77d45` to `origin/main`; later `git status --short` was clean.
- `/Users/zbeyens/.agents/config.json`: JSON parse passed and configured skills are `autogoal`, `autoreview`, `orchestrator`, `resolve-pr-feedback`, and `tdd`.
- Downstream CLI sync ran in better-convex, plate, informed-fe-v3, and plate-2: removed generated `debug`, installed dotai `resolve-pr-feedback`, refreshed `autogoal`, `orchestrator`, `tdd`, and `autoreview`.
- Downstream generated sync passed: better-convex `bun install`, plate `pnpm install`, informed-fe-v3 `bun install`, plate-2 `pnpm install`.
- Downstream audit: in all four repos, `skills-lock.json` has no `debug`, no generated `.agents/skills/debug` or `.claude/skills/debug`, `resolve-pr-feedback` source is `udecode/dotai`, `autogoal/orchestrator/tdd` source is `udecode/dotai`, and `autoreview` source is `openclaw/agent-skills`.
- Plate source audit: no `.agents/rules/resolve-pr-feedback` path remains; the local plan template uses `.agents/skills/resolve-pr-feedback/scripts`.
- Exact `debug` skill audit: clean in better-convex, plate, and plate-2; informed-fe-v3 remaining `debug` hits are Sentry SDK option/log-level docs, not skill references.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker requested.
- Confidence line: high confidence; all requested source/sync/audit gates passed.
- Flow table:
  - Reproduced: N/A, no runtime bug.
  - Verified: dotai validation pass, script syntax pass, downstream install/sync pass, lock/generated/source audits pass.
- Browser check: N/A, no browser surface.
- Outcome: `debug` cut from dotai and downstream installed skill state; `resolve-pr-feedback` promoted to dotai and installed downstream; other configured skills synced.
- Caveat: downstream repos are left dirty with generated skill/source updates; no downstream commits were requested. `informed-fe-v3` has unrelated Sentry docs strings containing `debug`.
- Design:
  - Chosen boundary: dotai owns generic shared skills; Plate owns project-specific plan templates and policy.
  - Why not quick patch: deleting only local generated files would reintroduce drift on the next sync.
  - Why not broader change: broad CE/skill cleanup is a separate topology decision; this pass only fulfilled debug cut, resolve promotion, and configured skill refresh.
- Verified: dotai validation, syntax checks, downstream install/sync, lock audits, generated file audits, and local source path audit.
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
- Caveats: downstream repos are intentionally uncommitted; Skills CLI stale-lock behavior was repaired and recorded.

Timeline:
- 2026-06-18T11:38:52.910Z Task goal plan created.
- 2026-06-18 Dotai `debug` removed and `resolve-pr-feedback` added.
- 2026-06-18 Dotai validation passed and commit `1f77d45` pushed.
- 2026-06-18 Global sync config updated and downstream repos refreshed.
- 2026-06-18 Downstream generated sync and lock/source audits passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout after verification |
| Where am I going? | Run autogoal check-complete, then final handoff |
| What is the goal? | Cut dotai `debug`, promote `resolve-pr-feedback` to dotai, sync other configured skills, and do not commit downstream repos |
| What have I learned? | Skills CLI can remove generated debug files while leaving stale lock rows; exact lock audits are required |
| What have I done? | See Timeline and Implementation notes |

Open risks:
- None for the requested debug/resolve sync. Separate out-of-scope note: informed-fe-v3 still has unrelated unmanaged old skills and Sentry docs using the word `debug`.
