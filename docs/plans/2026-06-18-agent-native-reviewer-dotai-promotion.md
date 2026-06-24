# agent-native reviewer dotai promotion

Objective:
Promote agent-native-reviewer to dotai and replace CE dependency here; done when dotai is validated/pushed and local locks/mirrors point to dotai.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-06-18-agent-native-reviewer-dotai-promotion.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user request
- id / link: current Codex thread
- title: Fork agent-native-reviewer into dotai and remove CE dependency
- acceptance criteria:
  - promote `agent-native-reviewer` into `/Users/zbeyens/git/dotai/skills/agent-native-reviewer/SKILL.md`;
  - rewrite it for generic repo/skill/tooling action parity, not CE app-only parity;
  - integrate with dotai-owned skills and workflows: `autogoal`, `sync-skills`, `sync-vision`, `resolve-pr-feedback`, `hard-cut`, `tdd`, and `diagnosing-bugs`;
  - update `/Users/zbeyens/git/dotai/README.md`;
  - run `/Users/zbeyens/git/dotai/scripts/validate-skills`;
  - commit and push dotai directly;
  - update `~/.agents/config.json` so `agent-native-reviewer` resolves from `udecode/dotai`;
  - install/refresh `agent-native-reviewer` from `udecode/dotai` in this repo;
  - remove the CE `agent-native-reviewer` source from `skiller-lock.json`;
  - run `pnpm install` in this repo to sync generated mirrors;
  - audit that local generated skill mirrors and lockfiles point to dotai, not `EveryInc/compound-engineering-plugin`.
  - codify Codex capability priority for agent-native proof/support:
    tests first, then Browser, then Chrome, then Computer Use.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: no timed checkpoint requested
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- Dotai contains a generic `agent-native-reviewer` skill source and README entry.
- Dotai validation passes and dotai commit is pushed.
- `~/.agents/config.json` maps `agent-native-reviewer` to `udecode/dotai`.
- This repo installs `agent-native-reviewer` through `skills-lock.json` from dotai.
- This repo no longer has `agent-native-reviewer` in `skiller-lock.json`.
- This repo generated mirrors for `agent-native-reviewer` are synced and no stale CE metadata remains.
- `pnpm install` passes in this repo.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-18-agent-native-reviewer-dotai-promotion.md` passes.

Verification surface:
- `/Users/zbeyens/git/dotai/scripts/validate-skills`
- dotai `git commit` and `git push`
- `node` JSON/source audits for `~/.agents/config.json`, `skills-lock.json`, and `skiller-lock.json`
- `npx skills add udecode/dotai --skill agent-native-reviewer --agent '*' -y`
- `pnpm install` in `/Users/zbeyens/git/plate-2`
- `rg` stale-reference audits for CE metadata and old reviewer text
- source audit that the installed reviewer includes the Codex capability
  priority: tests -> Browser -> Chrome -> Computer Use
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-18-agent-native-reviewer-dotai-promotion.md`

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `/Users/zbeyens/git/dotai/skills/agent-native-reviewer/SKILL.md` for the shared skill; local generated mirrors are installed output.
- Allowed edit scope: dotai skill source and README; `~/.agents/config.json`; this repo lockfiles/generated skill mirrors/goal plan from install/sync.
- Browser surface: N/A, no browser or app UI changed.
- Tracker sync: N/A, no issue/PR tracker action.
- Non-goals: no product code, no public package release, no PR, no Plate-specific policy inside dotai, no downstream repo commit unless explicitly required.

Output budget strategy:
- Read named skill/config files only; cap command output with `max_output_tokens`;
  use `rg` targeted stale-reference audits instead of broad dumps.

Blocked condition:
- Stop if dotai validation or Skills CLI install fails in a way that requires a
  dotai API/source decision not inferable from current files.

Task state:
- task_type: shared skill promotion
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active, ready for check-complete

Current verdict:
- verdict: complete after final checker
- confidence: high
- next owner: user commit decision for plate-2 local changes
- reason: dotai source is validated and pushed; local lock/mirror source now points to dotai; CE reviewer source removed.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-18-agent-native-reviewer-dotai-promotion.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | acceptance criteria, capability ladder, boundaries, verification, and non-goals copied before implementation |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | read `sync-skills`, `autogoal`, current `agent-native-reviewer`, and dotai README/AGENTS |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created active goal for this plan |
| Source of truth read before edits | yes | read current generated reviewer and dotai shared-skill docs |
| Tracker comments and attachments read | no | N/A: no tracker target |
| Video transcript evidence required | no | N/A: no video evidence |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: skill ownership change, no product implementation |
| TDD decision before behavior change or bug fix | no | N/A: no runtime behavior change |
| Branch decision for code-changing task | no | N/A: no branch or PR requested; dotai commit required by sync-skills dotai mode |
| Release artifact decision | no | N/A: no package release artifact |
| Browser tool decision for browser surface | no | N/A: no browser surface |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A: no tracker target |
| Output budget strategy recorded | yes | targeted reads/audits only; capped command output |
| Agent-native pack selected | yes | `--with agent-native` used |
| Agent-facing action surface identified | yes | shared skill routing/action-parity review surface |
| Source rule versus generated mirror boundary identified | yes | dotai `skills/**` is source; local `.agents/skills/**`/`.claude/skills/**` are installed mirrors |
| `agent-native-reviewer` loaded or waiver recorded | yes | loaded current CE-generated reviewer before edits |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation. Evidence: Task source, boundaries, completion threshold, and verification surface filled before edits.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete. Evidence: sections above.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer. Evidence: Task source and Boundaries sections.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason. N/A: no video/screen evidence.
- [x] Nearby repo instructions and implementation patterns read before edits. Evidence: read dotai `AGENTS.md`, dotai README, `sync-skills`, `autogoal`, and current generated reviewer.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason. Evidence: shared skill promoted to dotai; local generated mirrors installed from `skills-lock.json`.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason. N/A: skill/docs workflow change, no package release.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable. Evidence: final handoff section below; PR/tracker N/A.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason. N/A: no branch/PR requested; dotai direct commit/push required by dotai mode.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason. N/A: no surprising install/test failure.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior. Evidence: dotai validation in `/Users/zbeyens/git/dotai`; downstream install/sync in `/Users/zbeyens/git/plate-2`.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason. Evidence: agent-action/skill surface changed; failure modes recorded in Decisions.
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason. N/A: no product/runtime implementation; skill source validated and agent-native audited.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling. Evidence: accepted findings were CE source ownership gap and missing Codex capability ladder; both fixed.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context. Evidence: targeted reads and `rg` audits only.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors. Evidence: edited dotai `skills/agent-native-reviewer/SKILL.md`; local mirrors installed through Skills CLI.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text. Evidence: generated `.agents/skills/agent-native-reviewer/SKILL.md` includes source ownership, dotai integrations, and Codex capability ladder.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded. Evidence: no `.agents/rules/**` source changed; installed external skill via `npx skills add`; `pnpm install` passed.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason. Evidence: accepted CE ownership and capability ladder gaps fixed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | dotai `scripts/validate-skills` passed; dotai pushed `c5b3414`; local `npx skills add` and `pnpm install` passed; lock/mirror audits passed |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: no bug fix |
| Targeted behavior verification | no | Run focused test/proof for changed behavior or record N/A | N/A: no runtime behavior change |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: markdown/JSON lock/config only |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package exports |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` and relevant package checks | `pnpm install` passed in `/Users/zbeyens/git/plate-2`; no package checks needed for skill lock change |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` passed; generated `.agents` and `.claude` skill mirrors contain dotai skill |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | dotai validation in `/Users/zbeyens/git/dotai`; install/sync/audit in `/Users/zbeyens/git/plate-2` |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: no browser surface |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A: no browser surface |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: no package API |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A: dotai README/skill docs only, validated by dotai skill validator |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risk: generated mirrors could revert to CE source. Proof: skiller lock empty, skills lock dotai, `rg` stale audit clean after `pnpm install` |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Loaded reviewer; accepted findings were missing source/generated ownership and Codex capability ladder; both fixed |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no corruption signal |
| Autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | N/A: no product/runtime implementation; skill source validated and agent-native audited |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | final handoff section filled |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent | N/A: markdown/lock/config skill install; dotai validator is the owning lint |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | targeted command output used; one local diff command surfaced pre-existing unrelated diffs and was narrowed afterward |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-18-agent-native-reviewer-dotai-promotion.md` | pending final checker |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | no `.agents/rules/**` changed; external skill installed via Skills CLI; `pnpm install` passed |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `rg` found capability ladder and dotai integrations in `.agents/skills` and `.claude/skills` |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | loaded generated reviewer after install; no remaining accepted findings |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | read required skills, dotai docs, and current reviewer | implementation |
| Implementation | complete | added dotai source, README entry, global config source, local install, and skiller lock cleanup | verification |
| Verification | complete | validation/sync/audits passed | closeout |
| PR / tracker sync | complete | N/A: no PR/tracker requested | final response |
| Closeout | complete | final checker ready | final response |

Findings:
- Current reviewer was still CE-owned generated output and did not understand repo-maintenance parity well enough.
- Old reviewer did not encode Codex capability priority. Tests should be first, then Browser, then Chrome, then Computer Use.
- Local full diff contains pre-existing unrelated skill/docs/package changes. This run narrowed audits to dotai source, config, skill locks, generated reviewer mirrors, and this plan.

Decisions and tradeoffs:
- Promoted to dotai instead of keeping a repo-local fork because this is generic shared workflow behavior.
- Kept Plate-specific policy out of dotai; dotai skill names integrations and generic proof rules only.
- Used Skills CLI install for generated mirrors instead of hand-editing local `.agents/skills/**`.
- Left downstream configured repos untouched this run; current request targeted this repo's CE dependency. `~/.agents/config.json` is updated so future sync knows dotai owns the skill.

Implementation notes:
- Added `/Users/zbeyens/git/dotai/skills/agent-native-reviewer/SKILL.md`.
- Updated `/Users/zbeyens/git/dotai/README.md`.
- Dotai commit pushed: `c5b3414 Add agent-native reviewer skill`.
- Updated `/Users/zbeyens/.agents/config.json` skill source: `agent-native-reviewer -> udecode/dotai`.
- Ran `npx skills add udecode/dotai --skill agent-native-reviewer --agent '*' -y` in this repo.
- Removed `agent-native-reviewer` from `skiller-lock.json` by making skiller lock empty.

Review fixes:
- Accepted: source/generated boundary missing from old reviewer -> fixed with source ownership section.
- Accepted: Codex proof capability order missing -> fixed with Codex Capability Ladder.
- Rejected: keep CE reviewer source -> rejected because it keeps stale external ownership and weaker local integration.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `/Users/zbeyens/git/dotai`: `scripts/validate-skills` -> `skills ok`.
- `/Users/zbeyens/git/dotai`: `git commit -m "Add agent-native reviewer skill" && git push` -> pushed `c5b3414` to `main`.
- `/Users/zbeyens/git/plate-2`: `npx skills add udecode/dotai --skill agent-native-reviewer --agent '*' -y` -> installed generated mirrors.
- `/Users/zbeyens/git/plate-2`: `pnpm install` -> passed; Skiller apply and MDX postinstall completed.
- `/Users/zbeyens/git/plate-2`: JSON audit -> `skills-lock agent-native-reviewer` source is `udecode/dotai`; `skiller-lock agent-native-reviewer` is `null`; global config source is `udecode/dotai`.
- `/Users/zbeyens/git/plate-2`: stale audit for `EveryInc/compound-engineering-plugin`, old CE source path, old title, old frontmatter tool metadata -> no matches in `skiller-lock.json`, `skills-lock.json`, or generated reviewer mirrors.
- `/Users/zbeyens/git/plate-2`: capability ladder/source audit -> generated `.agents` and `.claude` reviewer mirrors include Codex Capability Ladder and dotai integrations.
- `/Users/zbeyens/.agents/config.json`: JSON parse -> `config json ok`.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker target.
- Confidence line: high; shared source validated and local install audited.
- Flow table:
  - Reproduced: N/A, no bug repro.
  - Verified: dotai validator passed; local install/sync/audits passed; browser N/A.
- Browser check: N/A, no browser surface.
- Outcome: dotai now owns `agent-native-reviewer`; local repo consumes it from `skills-lock.json`; CE skiller dependency is gone.
- Caveat: local checkout still has many unrelated pre-existing diffs; this run only claims the files/evidence named here.
- Design:
  - Chosen boundary: dotai shared skill source, local installed mirror.
  - Why not quick patch: editing local generated `SKILL.md` would be overwritten and would not fix shared ownership.
  - Why not broader change: downstream configured repos were not asked for this turn; config now makes future sync unambiguous.
- Verified: `scripts/validate-skills`, `npx skills add`, `pnpm install`, JSON audits, stale `rg` audits.
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
- PR: N/A
- Issue / tracker: N/A
- Browser proof: N/A
- Caveats: unrelated pre-existing local diffs remain outside this run's claim.

Timeline:
- 2026-06-18T13:32:06.475Z Task goal plan created.
- 2026-06-18 Dotai `agent-native-reviewer` source added and README updated.
- 2026-06-18 Dotai validation passed.
- 2026-06-18 Dotai commit `c5b3414` pushed to `main`.
- 2026-06-18 Global config updated to map `agent-native-reviewer` to `udecode/dotai`.
- 2026-06-18 Local repo installed `agent-native-reviewer` from dotai and removed CE skiller source.
- 2026-06-18 Local `pnpm install` and lock/mirror audits passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Run final autogoal checker, mark goal complete, hand off |
| What is the goal? | Promote `agent-native-reviewer` to dotai and replace CE dependency here |
| What have I learned? | CE reviewer was too UI-centric; dotai version needs source ownership and Codex capability ladder |
| What have I done? | Dotai source/README added and pushed; local config/locks/mirrors synced to dotai |

Open risks:
- None for this run's scope.
