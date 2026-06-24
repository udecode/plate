# plite plan skill topology

Objective:
Create Plite Plan skill topology; done when source/generated skill audits pass; plan docs/plans/2026-06-24-plite-plan-skill-topology.md.

Goal plan:
docs/plans/2026-06-24-plite-plan-skill-topology.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: chat instruction
- id / link: latest user `ok go` after recommendation to create `plite-plan`
  and retire `slate-plan`
- title: Plite Plan skill topology
- acceptance criteria: real `plite-plan` source rule/skill exists; `slate-plan`
  is retired as a router or removed from active routing; templates/routing stop
  pointing to stale Slate v2 planning; generated mirrors are synced; audits pass.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A: no duration requested
- initial confidence score: N/A: binary skill-topology repair
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- `plite-plan` source rule and generated skill exist and are discoverable.
- `slate-plan` no longer owns active Plite/Plate planning; it redirects to
  `plite-plan` for Plite substrate work and `plate-plan` for Plate product work.
- `docs/plans/templates/plite-plan.md` uses Plite naming/state, not stale
  Slate v2 lane state.
- Local routing references that should point to Plite planning are updated.
- Generated skill mirrors are synced with `pnpm install`.
- Source audits and check-complete pass.

Verification surface:
- Source audits with `rg` for stale `slate-plan` active-owner references.
- `pnpm install` for generated skill sync.
- Generated mirror audit for `.agents/skills/plite-plan/SKILL.md`.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-24-plite-plan-skill-topology.md`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `.agents/rules/*.mdc`, `docs/plans/templates/*.md`,
  generated `.agents/skills/**/SKILL.md` after `pnpm install`.
- Allowed edit scope: `.agents/rules/slate-plan.mdc`,
  `.agents/rules/plite-plan.mdc`, routing rules that reference stale
  `slate-plan`, `docs/plans/templates/plite-plan.md`, this plan.
- Browser surface: N/A.
- Browser strategy: N/A: agent skill topology only.
- Tracker sync: N/A.
- Non-goals: do not change runtime package code; do not run full app/browser
  proof; do not create commits/PRs.

Output budget strategy:
- Use focused `sed` reads and `rg` counts/short match lists. Avoid broad
  generated output dumps except generated mirror spot checks.

Blocked condition:
- Block only if `pnpm install` cannot regenerate skills or source audits reveal
  contradictory routing that requires a user decision.

Task state:
- task_type: agent-native skill topology repair
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: done
- confidence: high
- next owner: user review
- reason: source/generated skill topology is synced and audited.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-24-plite-plan-skill-topology.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | This patch copies every explicit requirement from the latest `ok go` context. |
| Timed checkpoint parsed | N/A: no duration requested | N/A |
| Skill analysis before edits | yes | Read `slate-plan`, `plate-plan`, `plite-plan` template, and `autogoal`. |
| Active goal checked or created | yes | `get_goal` returned none; created goal for this plan. |
| Source of truth read before edits | yes | `.agents/rules/slate-plan.mdc`, `.agents/rules/plate-plan.mdc`, templates read. |
| Tracker comments and attachments read | N/A: no tracker | N/A |
| Video transcript evidence required | N/A: no video | N/A |
| `docs/solutions` checked for non-trivial existing-code work | N/A: agent skill topology, no app code | N/A |
| TDD decision before behavior change or bug fix | N/A: no runtime behavior change | N/A |
| Branch decision for code-changing task | N/A: user is managing unstaged review state | no branch changes |
| Release artifact decision | N/A: no package release artifact | N/A |
| Browser tool decision for browser surface | N/A: no browser surface | N/A |
| PR expectation decision | N/A: no PR requested | N/A |
| Tracker sync expectation decision | N/A: no tracker | N/A |
| Output budget strategy recorded | yes | Focused reads/searches only. |
| Agent-native pack selected | yes | `agent-native` pack applied. |
| Agent-facing action surface identified | yes | `plite-plan` / `slate-plan` skill routing. |
| Source rule versus generated mirror boundary identified | yes | edit `.agents/rules/**`, run `pnpm install`; do not hand-edit generated mirrors. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded `.agents/skills/agent-native-reviewer/SKILL.md`; parity map closed below. |

Work Checklist:
- [x] Duration N/A: no timed checkpoint requested.
- [x] First checkpoint complete: explicit requirement was to execute the
      accepted recommendation: create real `plite-plan`, retire `slate-plan`
      as active owner, sync generated mirrors, and keep the change source-owned.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete in this plan.
- [x] Task source classified: chat `ok go`; agent-native skill topology repair;
      no browser surface; likely owners `.agents/rules/*`,
      `.agents/skills/*`, and `docs/plans/templates/*`.
- [x] Video evidence N/A: no video or screenshot in this task.
- [x] Nearby repo instructions and implementation patterns read:
      `.agents/AGENTS.md` source-owner rule, `autogoal`,
      `agent-native-reviewer`, `skill-creator`, `slate-plan`, `plate-plan`,
      and `plite-plan` template/source patterns.
- [x] Implementation fixes the ownership boundary: `plite-plan` is the active
      Plite planning owner; `slate-plan` is only a compatibility router.
- [x] Release artifact N/A: no package release/runtime code.
- [x] Final handoff shape decided: concise changed list, proof, deferred debt,
      and needs-attention.
- [x] Branch handling N/A: user is intentionally reviewing the full checkout as
      unstaged changes; no branch mutation done.
- [x] Local-env-rot retry policy N/A: no surprising repo-wide runtime failure.
- [x] Workspace authority recorded: all proof commands ran in
      `/Users/zbeyens/git/plate-2`.
- [x] High-risk note recorded: agent route topology changed; source/generated
      sync and agent-native review used as proof.
- [x] Autoreview target N/A: no runtime/app implementation; agent-native review
      is the relevant gate for `.agents/**`.
- [x] Agent-native review decision recorded: run the parity map below.
- [x] Output budget discipline followed: focused `sed`, `rg`, and validation
      commands only; one broad generated-skill rg was capped by file list.
- [x] Agent-native pack: source-of-truth rule files edited, not generated
      skill mirrors.
- [x] Agent-native pack: changed action is discoverable from
      `.agents/skills/plite-plan/SKILL.md`,
      `.agents/skills/slate-plan/SKILL.md`, and `plate-plan`.
- [x] Agent-native pack: generated mirrors synced with `pnpm install`.
- [x] Agent-native pack: accepted agent-native finding fixed:
      `plate-plan` now says Plite, not Slate, is the substrate owner.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `pnpm install` passed; generated mirror and stale-owner audits passed. |
| Bug reproduced before fix | N/A: no bug repro task | Record failing test/repro or N/A with reason | N/A |
| Targeted behavior verification | N/A: no runtime behavior changed | Run focused test/proof for changed behavior or record N/A | N/A |
| TypeScript or typed config changed | N/A: no TS/config code changed | Run relevant typecheck | N/A |
| Package exports or file layout changed | N/A: no package exports or source layout changed | Run `pnpm brl` before final verification and keep generated barrel updates | N/A |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` and relevant package checks | `pnpm install` passed and lockfile stayed up to date; prepare regenerated skills. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` passed; `.agents/skills/plite-plan/SKILL.md` exists and points to `.agents/rules/plite-plan.mdc`. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands ran in `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | N/A: no browser surface | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | N/A |
| Browser final proof | N/A: no browser surface | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | N/A |
| CI-controlled template output changed | N/A: no registry/template build output | Restore generated template output or record why it is intentionally kept | N/A |
| Package behavior or public API changed | N/A: no package behavior/API | Add a changeset or record why no changeset applies | N/A |
| Registry-only component work changed | N/A: no registry component | Update `docs/components/changelog.mdx` or record N/A | N/A |
| Docs or content changed | N/A: plan/template/agent rules only | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode: agents keep routing Plite plans to retired Slate lane. Proof: stale-owner rg plus generated mirror audit. Boundary: `plite-plan` owns substrate; `plate-plan` owns product. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Loaded `agent-native-reviewer`; parity map below; accepted `plate-plan` terminology gap fixed. |
| Local install corruption suspected | N/A: no local env rot signal | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A |
| Autoreview for non-trivial implementation changes | N/A: no app/runtime implementation | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | Agent-native review is the owning review gate for `.agents/**` source. |
| PR create or update | N/A: no PR requested | Run `check` before PR work and sync PR body to the task-style final handoff | N/A |
| Task-style PR body verified | N/A: no PR requested | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A |
| PR proof image hosting | N/A: no PR requested | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A |
| Tracker sync-back | N/A: no tracker | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | N/A: markdown/rule source only; no code lint surface | Run `pnpm lint:fix` or scoped equivalent | N/A |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Focused reads/searches only; no unbounded repo-wide output after the first capped generated-skill audit. |
| Timed checkpoint | N/A: no duration requested | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-24-plite-plan-skill-topology.md` | Final run pending after this plan update. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` passed; generated `plite-plan`, `slate-plan`, and `plate-plan` mirrors reflect source. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `.agents/skills/plite-plan/SKILL.md` exists; `slate-plan` mirror says retired router; `plate-plan` mirror says Plite/Plate. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Loaded and applied; no remaining P1/P2 findings for this packet. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read `autogoal`, `skill-creator`, `agent-native-reviewer`, `slate-plan`, `plate-plan`, and `plite-plan` source/template. | implementation |
| Implementation | complete | Added `.agents/rules/plite-plan.mdc`, retired `.agents/rules/slate-plan.mdc`, aligned `.agents/rules/plate-plan.mdc`, updated templates/routing refs. | verification |
| Verification | complete | `pnpm install`; generated mirror audits; stale `slate-plan` source audit; Plite/Plate terminology audit. | closeout |
| PR / tracker sync | N/A | no PR/tracker requested | final response |
| Closeout | complete | plan updated; final `check-complete` pending after this edit | final response |

Findings:
- Old `slate-plan` was still an active generated skill before sync; source
  replacement plus `pnpm install` converted it to a retired router.
- `plate-plan` still taught Slate as substrate owner; fixed to Plite/Plate so
  the new topology is not contradictory.

Decisions and tradeoffs:
- Keep `slate-plan` as a compatibility router instead of deleting it, because
  old prompts and stale generated references can still invoke it safely.
- Do not broaden this packet into renaming all `slate-*` worker skills or old
  command names; that is separate rename debt and would exceed the skill
  topology patch.

Implementation notes:
- Source files changed:
  `.agents/rules/plite-plan.mdc`, `.agents/rules/slate-plan.mdc`,
  `.agents/rules/plate-plan.mdc`, routing/template refs under
  `.agents/rules/**` and `docs/plans/templates/**`, generated mirrors from
  `pnpm install`, and this plan.

Review fixes:
- Agent-native accepted finding: Plate Plan still named Slate as substrate
  owner. Fixed to Plite across source and generated mirror.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `quick_validate.py` rejected Skiller-specific frontmatter keys | 1 | Use repo owner validator instead of system skill validator | `pnpm install` / Skiller apply is the owning validation; recorded mismatch, did not remove valid repo fields. |
| Initial `check-complete` failed pending generated rows | 1 | Close generated plan rows with evidence | This edit resolves the rows; rerun follows. |

Verification evidence:
- `pnpm install` in `/Users/zbeyens/git/plate-2` -> passed; Skiller apply
  completed.
- `rg -n "slate-plan|Slate Plan" .agents/rules .agents/AGENTS.md docs/plans/templates --glob '*.mdc' --glob '*.md'`
  -> only `.agents/rules/slate-plan.mdc` compatibility router remains.
- `rg -n "Slate|slate" .agents/rules/plate-plan.mdc .agents/skills/plate-plan/SKILL.md`
  -> no matches after the Plite/Plate boundary fix.
- Generated mirror audit:
  `.agents/skills/plite-plan/SKILL.md` has `name: plite-plan` and source
  `.agents/rules/plite-plan.mdc`; `.agents/skills/slate-plan/SKILL.md` says
  retired router; `.agents/skills/plate-plan/SKILL.md` says aligned with Plite.

Agent-native parity map:
| User action | Agent route | Source owner | Mirror/lock/doc | Proof | Status |
|---|---|---|---|---|---|
| Ask for Plite substrate plan | `plite-plan` | `.agents/rules/plite-plan.mdc` | `.agents/skills/plite-plan/SKILL.md` | generated mirror audit | pass |
| Use old Slate Plan prompt | `slate-plan` router | `.agents/rules/slate-plan.mdc` | `.agents/skills/slate-plan/SKILL.md` | router mirror audit | pass |
| Ask Plate product/API plan | `plate-plan` | `.agents/rules/plate-plan.mdc` | `.agents/skills/plate-plan/SKILL.md` | Plite/Plate terminology audit | pass |

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: no tracker.
- Confidence line: high; source/generated topology verified.
- Flow table:
  - Reproduced: N/A: topology change, no runtime bug
  - Verified: `pnpm install`, source audits, generated mirror audits
- Browser check: N/A: no browser surface.
- Outcome: `plite-plan` is a real generated skill; `slate-plan` is retired router.
- Caveat: broader `slate-*` worker/command renames remain outside this packet.
- Design:
  - Chosen boundary: Plite substrate planning in `plite-plan`; Plate product planning in `plate-plan`; old `slate-plan` redirects.
  - Why not quick patch: editing generated mirrors would rot on next sync.
  - Why not broader change: renaming all `slate-*` worker skills is separate topology work.
- Verified: see verification evidence.
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
- 2026-06-24T13:50:07.271Z Task goal plan created.
- 2026-06-24T13:56Z Added Plite Plan source rule and retired Slate Plan source rule.
- 2026-06-24T14:01Z Aligned Plate Plan to Plite/Plate terminology.
- 2026-06-24T14:03Z Ran `pnpm install`; Skiller regenerated mirrors successfully.
- 2026-06-24T14:05Z Ran source/generated audits and agent-native parity review.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Rerun `check-complete`, then complete the goal |
| What is the goal? | Create real Plite Plan topology and retire Slate Plan active ownership |
| What have I learned? | `plate-plan` needed Plite terminology too, not just a router change |
| What have I done? | Source rules patched, generated mirrors synced, audits recorded |

Open risks:
- Broader `slate-*` worker skill names and old command strings remain separate
  rename debt; intentionally not cut in this packet.
