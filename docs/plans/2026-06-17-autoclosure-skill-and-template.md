# autoclosure skill and template

Objective:
Create `autoclosure` as a repo-local post-merge/current-tree closure loop with its own autogoal template, routing, generated skill mirror, and audits.

Goal plan:
docs/plans/2026-06-17-autoclosure-skill-and-template.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: skill creation / topology
- id / link: current user request
- title: create `autoclosure` with dedicated autogoal template
- acceptance criteria: new source rule `.agents/rules/autoclosure.mdc`; new generated skill `.agents/skills/autoclosure/SKILL.md`; new template `docs/plans/templates/autoclosure.md`; routing from AGENTS/VISION/owner skills; no wrapper-only alias; `pnpm install`; source/generated/template audits; check-complete passes.

First checkpoint:
- Explicit requirements: create `autoclosure`; make it easy to remember instead of `auto post-merge until-clean`; own post-merge/current-tree closure; loop like `autoreview` until no accepted actionable findings; include its own autogoal template; preserve boundaries with `auto`, `maintainer`, `autoreview`, and `architecture-cleanup`; sync generated skill; verify active routing.
- Scope: agent rule, generated skill, plan template, routing docs/rules, this plan.
- Non-goals: no runtime package changes, no commit/PR, no public GitHub mutation, no replacing `auto`, no broad quality/perf loop.
- Stop conditions: source generation failure, unclear owner boundary requiring user taste, or active goal conflict. None present.

Timed checkpoint:
- requested duration: N/A.
- semantics: one-shot execution.
- initial confidence score: 0.72; concept was clear, but boundaries versus `auto` and `autoreview` needed proof.
- improvement loop: read adjacent owners, create source rule/template, route references, sync generated mirrors, instantiate smoke plan, run audits.
- final score / loop closure: 0.97 after generated skill, template smoke, routing, and boundary audits passed.

Completion threshold:
- `.agents/rules/autoclosure.mdc` exists and defines distinct post-merge/current-tree until-clean ownership.
- `docs/plans/templates/autoclosure.md` exists and enforces zero accepted actionable findings, rerun proof, clean pass count, and final ledgers.
- `.agents/skills/autoclosure/SKILL.md` is generated from the source rule.
- AGENTS, VISION, docs/vision, `auto`, `maintainer`, `architecture-cleanup`, and `plite-ar` route closure to `autoclosure`.
- `auto` no longer owns post-merge/current-tree closure as a primary lane.
- `pnpm install`, generated audits, template smoke failure, and `check-complete.mjs` pass.

Verification surface:
- `pnpm install` for generated skill sync.
- Generated skill audit: `name: autoclosure`, source pointer, `--template autoclosure`.
- Routing audit for `autoclosure`, post-merge/current-tree, and bad `auto` ownership patterns.
- Template smoke: instantiate `autoclosure` plan and verify unfinished plan fails `check-complete.mjs`; remove smoke artifact.
- Agent-native discoverability review.

Constraints:
- Edit source owners only; do not hand-edit generated skill mirrors.
- Keep `autoclosure` narrow: closure of already-landed/current-tree work.
- Keep `auto` broad: internal quality/perf/research loops.
- Keep `maintainer` public queue brain.
- Keep `autoreview` one review pass/review engine.
- No runtime code, package API, docs site content, public queue mutation, commit, or PR.

Boundaries:
- Source of truth: `.agents/rules/*.mdc`, `.agents/AGENTS.md`, root `VISION.md`, `docs/vision/*.md`, and `docs/plans/templates/*.md`.
- Allowed edit scope: new autoclosure rule/template/generated mirror, routing docs/rules, current plan.
- Browser surface: N/A; no app route.
- Tracker sync: N/A.
- Non-goals: runtime implementation, commit, PR, release, GitHub mutation.

Output budget strategy:
- Used focused `sed` and `rg`; avoided broad full-file dumps except relevant owner sections.
- Used generated-smoke and source audits instead of large diff output.
- Capped command output with tool budgets.

Blocked condition:
- Block only if existing owners made `autoclosure` a pure alias or if generation failed.
- No blocker occurred; it is distinct because it owns iterative closure of already-landed/current-tree work.

Task state:
- task_type: agent skill creation
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active_until_check_complete_passes

Current verdict:
- verdict: keep
- confidence: 0.97
- next owner: autoclosure
- reason: source/generated/template/routing/boundary audits pass.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-autoclosure-skill-and-template.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint records skill name, own template, until-clean semantics, boundaries, sync, and audit requirements. |
| Timed checkpoint parsed | N/A | No duration requested. |
| Skill analysis before edits | yes | Read `autogoal`, `skill-creator`, `auto`, `autoreview`, `maintainer`, `architecture-cleanup`, and template helpers. |
| Active goal checked or created | yes | No active goal existed; created autoclosure skill/template goal. |
| Source of truth read before edits | yes | Read adjacent source rules/templates and AGENTS/VISION routing. |
| Tracker comments and attachments read | N/A | No tracker. |
| Video transcript evidence required | N/A | No video. |
| `docs/solutions` checked for non-trivial existing-code work | N/A | Skill topology work; source owners read directly. |
| TDD decision before behavior change or bug fix | N/A | No runtime behavior change. |
| Branch decision for code-changing task | N/A | No branch/commit/PR requested. |
| Release artifact decision | N/A | No package release artifact. |
| Browser tool decision for browser surface | N/A | No browser surface changed. |
| PR expectation decision | N/A | No PR requested. |
| Tracker sync expectation decision | N/A | No tracker sync. |
| Output budget strategy recorded | yes | Output budget strategy block filled. |
| Docs pack selected | yes | Docs pack applied because VISION/docs/AGENTS routing changed. |
| `docs-creator` loaded | N/A | Routing doctrine edits, not public docs page prose. |
| Docs lane selected | yes | VISION/common/slate/plate and AGENTS routing. |
| Target docs and nearest sibling docs read | yes | Read VISION/docs/vision relevant routing sections. |
| Docs style doctrine read | yes | Root AGENTS docs rule present and applied. |
| Documented source owner identified | yes | `.agents/rules/autoclosure.mdc` and `docs/plans/templates/autoclosure.md`. |
| Agent-native pack selected | yes | Agent-native pack applied because skills/rules changed. |
| Agent-facing action surface identified | yes | Skill invocation, AGENTS routing, generated SKILL, template. |
| Source rule versus generated mirror boundary identified | yes | Edited source rules/templates; generated mirrors synced by `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded reviewer and checked discoverability/action parity. |

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
| Named verification threshold | yes | Run sync/audit/template checks | `pnpm install`; generated skill audit; routing audit; template smoke. |
| Bug reproduced before fix | N/A | No runtime bug fix | Skill creation only. |
| Targeted behavior verification | N/A | No runtime behavior changed | Skill behavior verified by generated/routing/template audits. |
| TypeScript or typed config changed | N/A | No TS/config changed | Not applicable. |
| Package exports or file layout changed | N/A | No package exports/layout changed | Not applicable. |
| Package manifests, lockfile, or install graph changed | yes | Run install/sync | `pnpm install` completed successfully. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | Generated `.agents/skills/autoclosure/SKILL.md` points to `.agents/rules/autoclosure.mdc`. |
| Workspace authority proof | yes | Run verification in owning repo | All verification ran in `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | N/A | No browser surface changed | Not applicable. |
| Browser final proof | N/A | No browser route changed | Not applicable. |
| CI-controlled template output changed | N/A | No registry template output touched | Agent plan template only. |
| Package behavior or public API changed | N/A | No package behavior/API changed | No changeset. |
| Registry-only component work changed | N/A | No registry component work | Not applicable. |
| Docs or content changed | yes | Verify routing docs source-backed | AGENTS/VISION/docs/vision routes match generated skill and source rule. |
| High-risk mini gate | yes | Record failure mode and proof | Risk was wrapper overlap with `auto`/`autoreview`; boundary audits pass. |
| Agent-native review for agent/tooling changes | yes | Load reviewer and close findings | Loaded; no discoverability/action parity gap found. |
| Local install corruption suspected | N/A | No install corruption signals | Not applicable. |
| Autoreview for non-trivial implementation changes | N/A | Not run | Deterministic source/generated/template audits fit this agent-routing change; no runtime implementation diff. |
| PR create or update | N/A | No PR requested | Not applicable. |
| Task-style PR body verified | N/A | No PR body | Not applicable. |
| PR proof image hosting | N/A | No PR/browser image | Not applicable. |
| Tracker sync-back | N/A | No tracker | Not applicable. |
| Final handoff contract | yes | Fill final handoff fields | Final handoff contract completed. |
| Final lint | N/A | No code lint needed | Markdown/rule sync verified by `pnpm install` and audits. |
| Output budget discipline | yes | Verify scoped output | Used focused command output; template smoke output was bounded and expected. |
| Timed checkpoint | N/A | No duration requested | One complete skill/template loop. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-autoclosure-skill-and-template.md` | To run after this update. |
| Docs source-backed claim audit | yes | Verify docs claims against source | Routing docs match generated skill and owner rules. |
| Docs links / routes / previews | N/A | No links/routes/previews changed | Not applicable. |
| Docs MDX/content parser | N/A | No MDX/content changed | Not applicable. |
| Plugin page specifics | N/A | No plugin page changed | Not applicable. |
| Agent source / generated sync | yes | Run `pnpm install` when rules changed | Passed twice after source edits. |
| Agent action discoverability | yes | Source-audit skill route | `autoclosure` appears in AGENTS and generated skill frontmatter. |
| Agent-native review | yes | Load reviewer and close findings | Loaded; no accepted findings. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read autogoal, skill-creator, adjacent owners, routing docs, and template helper. | implementation |
| Implementation | complete | Added autoclosure source rule/template; routed AGENTS/VISION/owner rules; updated auto handoff boundary. | verification |
| Verification | complete | `pnpm install`; generated skill audit; template smoke expected failure; routing/boundary audits. | closeout |
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
- `pnpm install` completed successfully after source edits and regenerated skills.
- Generated skill audit passed: `.agents/skills/autoclosure/SKILL.md` exists with `name: autoclosure`, source pointer, and `--template autoclosure`.
- Template smoke passed: instantiated `docs/plans/2026-06-17-autoclosure-template-smoke.md`, unfinished plan failed `check-complete.mjs`, then smoke artifact was removed.
- Routing audit passed: AGENTS, VISION, docs/vision, `auto`, `maintainer`, `architecture-cleanup`, and `plite-ar` route post-merge/current-tree until-clean closure to `autoclosure`.
- Boundary audit passed: no bad `auto` primary ownership for post-merge/current-tree closure remains; `auto` only delegates that lane.
- Agent-native review loaded; no discoverability/action parity gap found.

Final handoff contract:
- Goal plan: docs/plans/2026-06-17-autoclosure-skill-and-template.md
- Surface and route/package: agent skill routing and goal template.
- Invocation mode: one-shot execution.
- Changed list: new `autoclosure` source rule, generated skill, plan template, AGENTS/VISION/docs/vision routing, owner rule boundaries, current plan.
- Verification: `pnpm install`, generated audit, routing audit, boundary audit, template smoke expected failure, check-complete pending.
- Browser check: N/A.
- Outcome: `autoclosure` is now the memorable post-merge/current-tree until-clean entrypoint.
- Caveat: Current session skill list may refresh next turn; files on disk are generated.
- Design: `autoclosure` owns already-applied work closure; `auto` owns broad quality loops; `maintainer` owns public queue; `autoreview` remains one review pass.
- Needs attention: none beyond reviewing the new boundary if you want different naming later.
- Stopping checkpoints: none.
- Next owner: `autoclosure`.

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
- Browser proof: N/A.
- Caveats: Current tool skill list may refresh next turn; generated skill exists on disk.

Timeline:
- 2026-06-17T10:48:49.809Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout after autoclosure source/template/generation/routing audits. |
| Where am I going? | Run check-complete, mark goal complete, final handoff. |
| What is the goal? | Create `autoclosure` with own template and route post-merge/current-tree until-clean closure to it. |
| What have I learned? | The lane is distinct: it closes already-applied work, while `auto` explores broad quality and `autoreview` reviews once. |
| What have I done? | Added source rule/template/generated skill, patched routing docs/rules, synced, and audited. |

Open risks:
- Current session skill metadata may not include `autoclosure` until the next tool-context refresh, but generated files exist on disk.
- Historical plans may still use older closure wording; active routing and source owners are updated.
