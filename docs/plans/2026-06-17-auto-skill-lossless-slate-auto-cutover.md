# auto skill lossless slate auto cutover

Objective:
Create unified `auto` skill and cut `slate-auto` losslessly, with source/generated/template/routing audits proving old Slate automation behavior remains and Plate/post-merge lanes are added.

Goal plan:
docs/plans/2026-06-17-auto-skill-lossless-slate-auto-cutover.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: skill topology cutover
- id / link: user request in current thread
- title: replace Slate-only `slate-auto` with unified `auto`
- acceptance criteria: create source `.agents/rules/auto.mdc`, create `docs/plans/templates/auto.md`, generate `.agents/skills/auto/SKILL.md`, delete old source/template/generated `slate-auto`, update active routing docs/rules, preserve old Slate automation sections, add Plate/shared/post-merge lanes, run sync and audits.

First checkpoint:
- Explicit requirements captured before implementation: cut out `slate-auto`; create/use `auto`; preserve old `slate-auto` behavior losslessly; broaden beyond Slate to Plate/shared/post-merge supervision; keep clear boundary with `maintainer`; do not change runtime packages; edit source rules/templates, not generated skills directly; sync generated mirrors with `pnpm install`; verify no active `slate-auto` references remain; final handoff lists changes and verification.
- Scope: agent skill/routing/docs/template cutover only.
- Non-goals: no package runtime edits, no GitHub/PR mutation, no commit, no broad Plate migration work.
- Stop condition: stop only if source-rule generation fails or a missing owner requires user taste; no such blocker occurred.

Timed checkpoint:
- requested duration: N/A; no timed run requested for this cutover.
- semantics: one complete lossless cutover loop.
- initial confidence score: 0.62 after reading old `slate-auto` and routing docs; risk was loss of Slate-specific command law.
- improvement loop: copy old source/template first, add lane-aware deltas, sync, audit active references, audit lossless anchors, run agent-native review.
- final score / loop closure: 0.96 after source/generated/template/routing/lossless audits passed.

Completion threshold:
- Done when `.agents/rules/auto.mdc` exists and preserves the old Slate automation sections while adding Plate/shared/post-merge lanes.
- Done when `.agents/rules/slate-auto.mdc`, `.agents/skills/slate-auto/SKILL.md`, and `docs/plans/templates/slate-auto.md` are gone.
- Done when `docs/plans/templates/auto.md` exists with lane and post-merge checkpoints.
- Done when `pnpm install` regenerates `.agents/skills/auto/SKILL.md`.
- Done when active routing docs/rules/templates/skills have no `slate-auto` references.
- Done when lossless-anchor audit confirms old core sections remain and new lane/template anchors exist.
- Done when agent-native review finds no discoverability/action parity gap.
- Done when `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-auto-skill-lossless-slate-auto-cutover.md` passes.

Verification surface:
- `pnpm install` for Skiller/generated mirror sync.
- Cutover path tests for source/generated/template presence and old path absence.
- Active-reference audit: `rg -n 'slate-auto|Slate Auto|\$slate-auto' .agents/AGENTS.md AGENTS.md VISION.md docs/vision .agents/rules docs/plans/templates .agents/skills --glob '*.md' --glob '*.mdc'`.
- Discoverability audit over `.agents/skills/auto/SKILL.md`, `.agents/rules/auto.mdc`, `docs/plans/templates/auto.md`, AGENTS, VISION, and docs/vision.
- Lossless-anchor audit comparing old source/template backup to new source/template before scratch backup removal.
- Agent-native review against skill discoverability and generated/source boundaries.

Constraints:
- Preserve existing user-facing behavior outside agent routing.
- Prefer durable source-owner cutover over wrapper compatibility.
- No commit, push, PR, or GitHub mutation.
- Do not edit generated `.agents/skills/**/SKILL.md` directly.
- Do not change runtime packages, app code, or public package API.
- Historical docs/plans are not rewritten; active source/routing/template/generated surfaces are cut over.

Boundaries:
- Source of truth: `.agents/rules/*.mdc`, `.agents/AGENTS.md`, root `VISION.md`, `docs/vision/*.md`, and `docs/plans/templates/*.md`.
- Allowed edit scope: agent rules, generated skill mirrors via `pnpm install`, AGENTS, VISION docs, plan templates, this goal plan.
- Browser surface: N/A; no app/docs route UI changed.
- Tracker sync: N/A; no public issue/PR mutation.
- Non-goals: runtime Plate/Slate changes, release work, migration execution, public queue automation, commit.

Output budget strategy:
- Use `rg -l`/focused `rg -n` for references instead of broad file dumps.
- Read only relevant routing/source sections after the old skill had already been loaded.
- Use a small lossless-anchor script rather than streaming both 1300-line rules.
- Cap command output with tool token budgets.

Blocked condition:
- Block only if Skiller cannot generate `auto`, active routing cannot remove `slate-auto`, or old Slate automation sections cannot be preserved.
- No blocker occurred.

Task state:
- task_type: agent-skill topology cutover
- task_complexity: medium-high because routing and generated mirrors changed
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active_until_check_complete_passes

Current verdict:
- verdict: keep
- confidence: 0.96
- next owner: auto
- reason: source/generated/template/routing/lossless audits pass; no active `slate-auto` references remain in active surfaces.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-auto-skill-lossless-slate-auto-cutover.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint block lists cutover, lossless, Plate/shared/post-merge, sync, audit, and no-runtime boundaries. |
| Timed checkpoint parsed | N/A | No duration requested. |
| Skill analysis before edits | yes | Read `vision`, old generated `slate-auto`, `autogoal`, AGENTS routing, old source/template, and reference list. |
| Active goal checked or created | yes | Created active goal for auto skill lossless cutover. |
| Source of truth read before edits | yes | Used source `.agents/rules/slate-auto.mdc`, `.agents/AGENTS.md`, VISION, docs/vision, and template. |
| Tracker comments and attachments read | N/A | No tracker item. |
| Video transcript evidence required | N/A | No video evidence. |
| `docs/solutions` checked for non-trivial existing-code work | N/A | Agent routing cutover; existing source owners were read directly. |
| TDD decision before behavior change or bug fix | N/A | No runtime behavior bug or package code change. |
| Branch decision for code-changing task | N/A | No branch/commit/PR requested. |
| Release artifact decision | N/A | No package release artifact. |
| Browser tool decision for browser surface | N/A | No app/content/package browser surface changed. |
| PR expectation decision | N/A | No PR requested. |
| Tracker sync expectation decision | N/A | No tracker sync. |
| Output budget strategy recorded | yes | Output budget strategy block filled. |
| Docs pack selected | yes | Docs pack applied by plan helper because VISION/docs routing changed. |
| `docs-creator` loaded | N/A | Not public docs prose; routing doctrine edits only. |
| Docs lane selected | yes | VISION/common/slate/plate routing doctrine. |
| Target docs and nearest sibling docs read | yes | Read VISION and docs/vision/common/slate/plate relevant sections. |
| Docs style doctrine read | yes | Root AGENTS/docs rule already in prompt and source AGENTS. |
| Documented source owner identified | yes | `.agents/rules/auto.mdc` plus AGENTS/VISION/docs/vision/template owners. |
| Agent-native pack selected | yes | Agent-native pack applied by plan helper. |
| Agent-facing action surface identified | yes | User-facing skill discovery/routing through AGENTS and generated `.agents/skills/auto/SKILL.md`. |
| Source rule versus generated mirror boundary identified | yes | Edited source rules/templates; generated mirrors synced by `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded reviewer skill and checked discoverability/action parity for routing cutover. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded.
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
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named sync/audit/lossless checks | `pnpm install`; cutover path test; active-reference audit; discoverability audit; lossless-anchor audit. |
| Bug reproduced before fix | N/A | No runtime bug fix | Agent routing cutover only. |
| Targeted behavior verification | N/A | No runtime behavior changed | Skill behavior verified by source/generated routing audits. |
| TypeScript or typed config changed | N/A | No TS/config code changed | Not applicable. |
| Package exports or file layout changed | N/A | No package exports/layout changed | Not applicable. |
| Package manifests, lockfile, or install graph changed | yes | Run install/sync | `pnpm install` completed successfully; lockfile already up to date. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `.agents/skills/auto/SKILL.md` generated from `.agents/rules/auto.mdc`; old generated `slate-auto` absent. |
| Workspace authority proof | yes | Run verification in parent repo agent workspace | All commands ran in `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | N/A | No browser surface changed | No app/content/package UI edited. |
| Browser final proof | N/A | No browser proof needed | Agent docs/rules only. |
| CI-controlled template output changed | N/A | No CI-controlled templates touched | Plan templates are agent templates, not registry output. |
| Package behavior or public API changed | N/A | No package behavior/API changed | No changeset. |
| Registry-only component work changed | N/A | No registry component work | Not applicable. |
| Docs or content changed | yes | Verify source-backed routing docs | Active-reference and discoverability audits include AGENTS, VISION, docs/vision. |
| High-risk mini gate | yes | Record realistic failure mode and proof plan | Risk was losing Slate-specific command law or hiding Plate route; lossless-anchor and lane audits passed. |
| Agent-native review for agent/tooling changes | yes | Load reviewer and close findings | Reviewer loaded; no discoverability/action parity gap found. |
| Local install corruption suspected | N/A | No install corruption signals | Not applicable. |
| Autoreview for non-trivial implementation changes | N/A | Review gate not run | Agent-source cutover verified by deterministic source/generated/lossless audits; no runtime implementation diff. |
| PR create or update | N/A | No PR requested | Not applicable. |
| Task-style PR body verified | N/A | No PR body | Not applicable. |
| PR proof image hosting | N/A | No PR/browser proof image | Not applicable. |
| Tracker sync-back | N/A | No tracker | Not applicable. |
| Final handoff contract | yes | Fill final handoff fields | Final handoff contract block completed. |
| Final lint | N/A | No code lint needed | Markdown/rule sync verified through `pnpm install` and source audits. |
| Output budget discipline | yes | Verify scoped command output | Used focused `sed`, `rg`, and small Node audits; no broad unbounded stream. |
| Timed checkpoint | N/A | No duration requested | One complete cutover loop. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-auto-skill-lossless-slate-auto-cutover.md` | To run after this update. |
| Docs source-backed claim audit | yes | Verify docs claims against current source | AGENTS/VISION/docs/vision routes match generated `auto` skill. |
| Docs links / routes / previews | N/A | No docs links/routes/previews changed | Not applicable. |
| Docs MDX/content parser | N/A | No MDX/content changed | Not applicable. |
| Plugin page specifics | N/A | No plugin page changed | Not applicable. |
| Agent source / generated sync | yes | Run `pnpm install` and verify generated mirrors | Passed. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `auto` present in AGENTS and generated skill frontmatter. |
| Agent-native review | yes | Load reviewer and close findings | Loaded; no accepted findings. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read old source/generated skill, autogoal, AGENTS, VISION, docs/vision, old template, active reference list. | implementation |
| Implementation | complete | Created `auto` source/template, added lanes/post-merge, updated routing docs/rules, deleted old source/template. | verification |
| Verification | complete | `pnpm install`, cutover path test, active-reference audit, discoverability audit, lossless-anchor audit. | closeout |
| PR / tracker sync | N/A | No PR/tracker requested. | final response |
| Closeout | complete | Plan updated for check-complete. | final response |

Findings:
- None yet.

Decisions and tradeoffs:
- None yet.

Implementation notes:
- None yet.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `pnpm install` completed successfully and Skiller applied rules for Codex/Claude.
- Cutover path test passed: `auto` source/template/generated skill exist; old `slate-auto` source/template/generated skill paths do not exist.
- Active-reference audit passed with no `slate-auto`, `Slate Auto`, or `$slate-auto` matches in AGENTS, VISION, docs/vision, .agents/rules, docs/plans/templates, or .agents/skills.
- Discoverability audit found `name: auto`, source pointer, `Lane Routing`, Plate lane, shared editor lane, `--template auto`, and post-merge checkpoint anchors.
- Lossless-anchor audit passed: old core rule sections remain; new lane/template anchors exist; new rule/template line counts are larger than old.
- Agent-native review loaded; no action/discoverability parity gap found.

Final handoff contract:
- Goal plan: docs/plans/2026-06-17-auto-skill-lossless-slate-auto-cutover.md
- Surface and route/package: agent routing and skill topology.
- Invocation mode, elapsed/minimum runtime, loop/checkpoint count: one full cutover loop, no timed minimum.
- Behavior gates and visual proof: N/A, no runtime behavior/browser surface changed.
- Primary metric baseline/latest/best and stop reason: N/A, skill topology only.
- Bugs fixed and oracles added: N/A.
- Benchmark/skill/docs repairs: created unified `auto`, deleted `slate-auto`, updated routing docs/rules/templates, generated mirrors.
- Workflow slowdowns and repairs: no avoidable repeated slowdown; used scoped audits to avoid streaming old/new 1300-line rules.
- Changed list: agent rules/templates/generated skills, AGENTS, VISION, docs/vision, this plan.
- Needs your attention: review `.agents/rules/auto.mdc` lane model if you want to tune Plate-vs-Slate boundaries later.
- Stopping checkpoints to unblock: none.
- Accepted deferrals and residual risks: historical old plans may still mention `slate-auto`; active routing/source surfaces do not.
- Next owner: `auto`.

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
- PR: N/A, no PR requested.
- Issue / tracker: N/A.
- Browser proof: N/A, no browser surface changed.
- Caveats: active tool context may show stale skill list until next turn, but generated files are cut over.

Timeline:
- 2026-06-17T10:32:29.395Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout after source/generated cutover. |
| Where am I going? | Run check-complete, mark goal complete, final handoff. |
| What is the goal? | Unified `auto` replaces `slate-auto` losslessly and adds Plate/shared/post-merge supervision. |
| What have I learned? | Old Slate automation law fits as a Slate lane inside a broader internal supervisor. |
| What have I done? | Added `auto`, removed `slate-auto`, updated routing docs/rules/templates, synced generated mirrors, audited references. |

Open risks:
- Historical docs/plans outside active routing may still mention `slate-auto`; not rewritten because they are archive/history, not live skill discovery.
- Current session skill list may still show `slate-auto` until the tool context refreshes; generated files on disk are cut over.
