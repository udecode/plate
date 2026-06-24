# kill dev browser skill

Objective:
Kill dev-browser skill; done when source/mirrors/dependencies are removed or rerouted and stale-reference audits pass.

Goal plan:
docs/plans/2026-06-18-kill-dev-browser-skill.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user request
- id / link: chat request on 2026-06-18
- title: Kill `dev-browser`
- acceptance criteria:
  - Delete the repo-local `dev-browser` skill source and generated mirror.
  - Remove `dev-browser` from normal routing because `AGENTS.md` owns Browser -> Chrome -> Computer.
  - Fix the `potion-yjs-dev-browser-test` dependency by rewriting it to current Browser/Chrome proof or deleting it if no longer useful.
  - Do not leave compatibility aliases, deprecated wrappers, or install instructions for `dev-browser`.
  - Run `pnpm install` after `.agents/rules/**` changes.
  - Audit `.agents/AGENTS.md`, `.agents/rules`, generated skills, and root `AGENTS.md` for stale `dev-browser` routing.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Captured requirements:
  - "kill" means hard delete, not deprecate.
  - Scope is current Plate checkout.
  - Browser ladder in `AGENTS.md` is the replacement owner.
  - The Potion Yjs dependency is the only known live dependency to remove or reroute.
  - Final proof must include generated mirror sync and stale-reference audit.

Timed checkpoint:
- requested duration: N/A
- semantics: no timed checkpoint requested
- initial confidence score: N/A
- improvement loop: delete/reroute/sync/audit
- final score / loop closure: pending final audit

Completion threshold:
- Done means `dev-browser` has no repo-local source skill, generated skill mirror, or normal route; the Potion Yjs oracle no longer depends on it; generated mirrors are synced; stale-reference audits either return no active matches or only archived historical docs with an explicit current-rule override.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-18-kill-dev-browser-skill.md` passes.

Verification surface:
- `pnpm install`
- `rg` stale-reference audit for `dev-browser`
- generated owner audit for `.agents/rules` -> `.agents/skills`
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-18-kill-dev-browser-skill.md`

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `.agents/AGENTS.md`, `.agents/rules/*.mdc`, generated `AGENTS.md`, generated `.agents/skills/**`.
- Allowed edit scope: `dev-browser` rule/mirror, `potion-yjs-dev-browser-test` rule/mirror, AGENTS generated output, this plan.
- Browser surface: N/A; agent workflow cleanup only.
- Browser strategy: Browser ladder remains source-owned in AGENTS. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A.
- Non-goals: no app runtime changes, no PR/commit/push, no new browser wrapper.

Output budget strategy:
- Use focused `rg -n "dev-browser|Dev Browser"` over `.agents/AGENTS.md`, `.agents/rules`, `.agents/skills`, `AGENTS.md`, and docs/plans if needed. Avoid broad generated-tree dumps.

Blocked condition:
- Block only if `pnpm install` cannot regenerate mirrors or if a live dependency requires a user decision instead of a Browser/Chrome/Computer rewrite.

Task state:
- task_type: agent workflow hard cut
- task_complexity: small
- current_phase: intake
- current_phase_status: in_progress
- next_phase: implementation
- goal_status: active

Current verdict:
- verdict: proceed
- confidence: 90%
- next owner: hard-cut + agent-native-reviewer
- reason: `dev-browser` is a legacy wrapper and AGENTS already owns the browser proof ladder.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-18-kill-dev-browser-skill.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint records kill scope, replacement owner, Potion dependency, sync, audit |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Skill analysis before edits | yes | `autogoal`, `hard-cut`, and `agent-native-reviewer` read before edits |
| Active goal checked or created | yes | active goal created for this hard cut |
| Source of truth read before edits | yes | `.agents/rules/dev-browser.mdc` and `.agents/rules/potion-yjs-dev-browser-test.mdc` read |
| Tracker comments and attachments read | no | N/A: no tracker |
| Video transcript evidence required | no | N/A |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: no app code |
| TDD decision before behavior change or bug fix | no | N/A: no runtime behavior |
| Branch decision for code-changing task | no | N/A: no branch requested |
| Release artifact decision | no | N/A |
| Browser tool decision for browser surface | no | N/A: no browser proof surface |
| PR expectation decision | no | N/A: no PR requested |
| Tracker sync expectation decision | no | N/A |
| Output budget strategy recorded | yes | focused `rg`; no broad generated dumps |
| Agent-native pack selected | yes | `.agents/**` skill/rule surface changes |
| Agent-facing action surface identified | yes | `dev-browser`, Potion oracle, Browser/Chrome/Computer ladder |
| Source rule versus generated mirror boundary identified | yes | edit `.agents/rules/**`, run `pnpm install`, do not hand-edit generated mirrors |
| `agent-native-reviewer` loaded or waiver recorded | yes | reviewer read before edits |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; N/A: no duration requested.
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
      `<video-transcripts>` XML, or marked N/A: no video evidence.
- [x] Nearby repo instructions and implementation patterns read before edits:
      hard-cut, agent-native-reviewer, `dev-browser`, and Potion Yjs source
      rules.
- [x] Implementation fixes the right ownership boundary: deleted
      `dev-browser` and renamed/rebuilt the Potion Yjs oracle around the
      Browser/Chrome/Computer ladder.
- [x] Release artifact requirement recorded: N/A, agent workflow only.
- [x] Final handoff shape decided: changed files, proof, caveat.
- [x] Branch handling recorded for code-changing work: N/A, no branch requested.
- [x] Local-env-rot retry policy recorded: N/A, no surprising repo-wide failure.
- [x] Workspace authority recorded: all commands ran in
      `/Users/zbeyens/git/plate-2`.
- [x] High-risk note recorded: stale historical plans still mention old proof;
      they are archived evidence, not active routing.
- [x] Review/autoreview target selected from actual diff state: N/A for
      app-code autoreview; agent-native review is the owning gate.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: focused `rg`/owner audits.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed.
- [x] Agent-native pack: no accepted agent-native findings remain.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `pnpm install`; owner audit; active `rg` audit |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: hard-cut workflow cleanup |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | active stale-reference audit returned no matches |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: install graph unchanged; `pnpm install` still ran for Skiller |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` passed; Skiller apply completed |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd | cwd `/Users/zbeyens/git/plate-2` |
| Browser surface changed | no | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | N/A: no app/browser behavior changed |
| Browser final proof | no | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | N/A |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | source rule/mirror audit; no rendered docs surface |
| High-risk mini gate | yes | Record realistic failure mode, proof plan, and boundary | Risk: Potion oracle loses split-tab proof if Browser/Chrome lacks per-page offline. Mitigation: route tool limitation to `agent-browser-issue` instead of legacy fallback |
| Agent-native review for agent/tooling changes | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings | loaded; capability map below |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun exact failing command, or record N/A | N/A |
| Autoreview for non-trivial implementation changes | no | Run autoreview or record N/A | N/A: agent workflow hard cut, no app implementation |
| PR create or update | no | Run `check` before PR work and sync PR body | N/A: no PR requested |
| Task-style PR body verified | no | Verify PR body | N/A |
| PR proof image hosting | no | Replace local paths with hosted GitHub URLs or record N/A | N/A |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A |
| Final handoff contract | yes | Fill final handoff fields | final response includes changed list, proof, caveat |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent | N/A: no app code |
| Output budget discipline | yes | Verify no unbounded high-volume command output streamed | focused audits only |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed | N/A |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-18-kill-dev-browser-skill.md` | complete |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `potion-yjs-browser-test` source and generated mirror present; old mirrors absent |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `potion-yjs-browser-test` generated mirror references `.agents/rules/potion-yjs-browser-test.mdc` |
| Agent-native review | yes | Load reviewer and close accepted findings | pass; no accepted findings remain |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | `dev-browser`, Potion Yjs, hard-cut, autogoal, and agent-native sources read | implementation |
| Implementation | complete | deleted `dev-browser`; renamed/rebuilt Potion Yjs skill as `potion-yjs-browser-test` | verification |
| Verification | complete | `pnpm install`; owner audit; active stale-reference audit; source/mirror readback | closeout |
| PR / tracker sync | N/A | no PR/tracker requested | final response |
| Closeout | complete | plan updated; final check pending after evidence row | final response |

Findings:
- `dev-browser` was a repo-local legacy browser wrapper that duplicated the Browser/Chrome/Computer ladder.
- `potion-yjs-dev-browser-test` was the only live active dependency and also had a stale name.
- Historical `docs/plans/**` still mention old `dev-browser` proof; those are archived audit trails, not active routes.

Decisions and tradeoffs:
- Deleted the `dev-browser` skill instead of keeping a "use only explicitly" wrapper.
- Renamed/rebuilt the Potion Yjs oracle to `potion-yjs-browser-test` instead of deleting it, because the Potion reference workflow is still useful.
- Did not rewrite historical plans; changing old evidence would be misleading.

Implementation notes:
- Deleted `.agents/rules/dev-browser.mdc`.
- Deleted `.agents/rules/potion-yjs-dev-browser-test.mdc`.
- Added `.agents/rules/potion-yjs-browser-test.mdc`.
- Removed stale generated mirrors under `.agents/skills` and `.claude/skills`.
- Ran `pnpm install` to regenerate the new Potion skill mirror.

Review fixes:
- Agent-native review pass: source owner is `.agents/rules/potion-yjs-browser-test.mdc`, generated mirror exists, old mirrors are absent, proof commands are recorded.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `pnpm install` in `/Users/zbeyens/git/plate-2` -> passed; Skiller apply completed.
- Owner audit in `/Users/zbeyens/git/plate-2` -> `{ "skills": 57, "rules": 42, "locked": 15, "unowned": [], "ruleMissing": [], "wanted": { "dev-browser": false, "potion-yjs-dev-browser-test": false, "potion-yjs-browser-test": true } }`.
- Active stale-reference audit in `/Users/zbeyens/git/plate-2` over `.agents/AGENTS.md`, `.agents/rules`, `AGENTS.md`, `.agents/skills`, `.claude/skills` -> no matches for `dev-browser`, `Dev Browser`, or `potion-yjs-dev-browser-test`.
- Source/mirror readback -> `.agents/rules/potion-yjs-browser-test.mdc` and `.agents/skills/potion-yjs-browser-test/SKILL.md` both route to Browser/Chrome/Computer and do not mention `dev-browser`.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-18-kill-dev-browser-skill.md` -> complete.

Final handoff contract:
- PR line: N/A
- Issue / tracker line: N/A
- Confidence line: high
- Flow table:
  - Reproduced: tests pending, browser pending
  - Verified: tests pending, browser pending
- Browser check: N/A, no app/browser behavior changed.
- Outcome: `dev-browser` killed; Potion Yjs oracle rerouted to Browser/Chrome.
- Caveat: historical plans still mention old `dev-browser` proof as archival evidence.
- Design:
  - Chosen boundary: source rules plus generated mirrors.
  - Why not quick patch: a "do not use dev-browser" wrapper would keep the stale route alive.
  - Why not broader change: Browser/Chrome/Computer ladder already owns the general policy.
- Verified: `pnpm install`, owner audit, active stale-reference audit, source/mirror readback.
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
- PR: pending
- Issue / tracker: pending
- Browser proof: pending
- Caveats: pending

Timeline:
- 2026-06-18T14:05:02.511Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final response after final check |
| What is the goal? | Kill `dev-browser` and reroute/remove dependencies |
| What have I learned? | Potion Yjs was the only active dependency; historical plans are archival only |
| What have I done? | Deleted old source/mirrors, added Browser/Chrome Potion skill, synced, audited |

Open risks:
- None blocking. Tool limitation risk is documented in the Potion skill: if Browser/Chrome cannot isolate one tab offline, route to `agent-browser-issue` instead of reviving legacy tooling.
