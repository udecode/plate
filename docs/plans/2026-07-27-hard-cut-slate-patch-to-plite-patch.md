# hard cut slate patch to plite patch

Objective:
Hard-cut `slate-patch` into `plite-patch` and deduplicate public/local routing;
done when zero live route references remain, mirrors sync, and reviews pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-27-hard-cut-slate-patch-to-plite-patch.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: direct user acceptance
- id / link: N/A
- title: Hard-cut overlapping `slate-patch` and make Plite routing coherent
- acceptance criteria:
  - delete `slate-patch`; do not retain an alias, shim, or deprecated route;
  - create `plite-patch` as the sole local Plite regression worker;
  - keep public issue mutation out of `plite-patch`;
  - make `resolve-slate-issue` a thin public coordinator that delegates local
    repair and owns issue intake, Plate `next` PR, comment, and closure state;
  - route local regressions to `plite-patch`, one Slate issue to
    `resolve-slate-issue`, public queue work to `maintainer`, and broad/timed
    quality loops to `auto`;
  - replace obsolete Slate package/app/command ownership in changed active
    routes with current Plite owners;
  - update active AGENTS/rule references, regenerate mirrors with
    `pnpm install`, and prove no generated `slate-patch` skill remains;
  - close hard-cut, agent-native, and autoreview findings.

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
- initial confidence score: N/A
- improvement loop: inventory -> hard cut -> regenerate -> route audit -> review
- final score / loop closure: N/A

Completion threshold:
- Zero `slate-patch` references in the live agent control plane and no
  `.agents/skills/slate-patch` generated skill.
- Exactly one local implementation owner, `plite-patch`, with current Plite
  package/app commands and no public issue/PR/comment mutation.
- `resolve-slate-issue`, `maintainer`, `auto`, and AGENTS route public/local/
  broad work to the accepted owners without duplicating patch methodology.
- `pnpm install`, source/generated equality, active-route source audits,
  agent-native review, autoreview, changed-file hygiene, and the goal checker
  pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-27-hard-cut-slate-patch-to-plite-patch.md` passes.

Verification surface:
- Source/reference inventory across `.agents/AGENTS.md`, `.agents/rules/**`,
  generated agent mirrors, and root generated instructions.
- Root package/app script inventory for current Plite commands and paths.
- `pnpm install`, generated source/body comparison, no-old-skill directory
  check, `git diff --check`, agent-native capability map, scoped autoreview,
  and `check-complete.mjs`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `.agents/AGENTS.md` and `.agents/rules/*.mdc`; generated
  `AGENTS.md`, `CLAUDE.md`, and `.agents/skills/**` are outputs.
- Allowed edit scope: the accepted local/public/broad routing owners, active
  references required by the hard cut, this plan, and generated mirrors from
  `pnpm install`.
- Browser surface: N/A; agent workflow only.
- Browser strategy: N/A; no app-rendered behavior changes.
- Tracker sync: N/A; no live issue is being resolved.
- Non-goals: do not mutate runtime packages, resolve a Slate issue, create a
  PR/comment/commit/push, retain a `slate-patch` alias, or rewrite historical
  completed plans merely to erase old prose.

Output budget strategy:
- Start with `rg -l`/counts over active instruction roots; inspect only files
  with live route matches. Exclude historical plans, generated build trees,
  dependencies, and runtime source unless a live rule names them.

Blocked condition:
- Stop only if Skiller cannot remove the deleted generated skill after one
  current install attempt, or a live route proves the accepted public/local
  authority split is unsafe.

Task state:
- task_type: agent workflow topology hard cut
- task_complexity: non-trivial
- current_phase: closeout
- current_phase_status: done
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: accepted topology; duplicate worker must be removed
- confidence: high
- next owner: task
- reason: `resolve-slate-issue` and `slate-patch` duplicate local repair while
  `auto` routes into obsolete Slate package/app commands.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-27-hard-cut-slate-patch-to-plite-patch.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | All eight accepted topology requirements are recorded above. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Read `hard-cut`, `autogoal`, `agent-native-reviewer`, `autoreview`, and both overlapping skills. |
| Active goal checked or created | yes | No prior goal; active goal created with this plan path. |
| Source of truth read before edits | yes | Read source rules for `slate-patch`, `resolve-slate-issue`, `auto`, and `maintainer`; generated mirrors are not edit owners. |
| Tracker comments and attachments read | no | N/A: direct local workflow task. |
| Video transcript evidence required | no | N/A: no media. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: agent-routing hard cut; live source rules are the owner. |
| TDD decision before behavior change or bug fix | no | N/A: no runtime behavior change. |
| Branch decision for code-changing task | no | N/A: no git mutation requested; current work remains on `next`. |
| Release artifact decision | no | N/A: no package/runtime release surface. |
| Browser tool decision for browser surface | no | N/A: no rendered surface. |
| PR expectation decision | no | N/A: user requested local implementation only. |
| Tracker sync expectation decision | no | N/A: no tracker item. |
| Output budget strategy recorded | yes | Bounded active-owner inventory recorded above. |
| Agent-native pack selected | yes | Agent-native pack materialized into this plan. |
| Agent-facing action surface identified | yes | Local regression, public issue, public queue, and broad/timed quality routes are explicitly mapped. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**`/`.agents/AGENTS.md`; regenerate all mirrors. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded completely; capability map is a completion gate. |

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
- [x] Required video or screen-recording evidence is N/A: no media.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary: local repair belongs
      only to `plite-patch`; public lifecycle belongs only to
      `resolve-slate-issue`.
- [x] Release artifact requirement: N/A; no published package/runtime change.
- [x] Final handoff shape: local workflow hard-cut summary, proof, review, and
      unrelated lint caveat; PR/tracker fields are N/A.
- [x] Branch handling: N/A; no commit, push, branch, or PR requested.
- [x] Local-env-rot retry policy: N/A; no install corruption signal.
- [x] Workspace authority: all proof ran from
      `/Users/zbeyens/git/plate-2`.
- [x] High-risk note: the failure mode was routing agents into a deleted skill,
      dead commands, or public mutation from a local worker; source/mirror and
      capability-map proof cover it.
- [x] Autoreview target: dirty local checkout with an explicit file boundary.
- [x] Agent-native review completed for routing, skills, commands, generated
      mirrors, proof, and handoff.
- [x] Output budget discipline followed: bounded `rg`, targeted slices, and
      capped review output.
- [x] Agent-native pack: source-of-truth rule files were edited instead of generated skill mirrors.
- [x] Agent-native pack: all four changed actions are discoverable from AGENTS and skill text.
- [x] Agent-native pack: `pnpm install` synced `.agents/skills/**`,
      `.claude/skills/**`, root `AGENTS.md`, and `CLAUDE.md`.
- [x] Agent-native pack: all accepted review findings were fixed; final scoped
      autoreview is clean.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run all named source/mirror/review gates. | Hard-cut, dead-route, mirror-equality, capability-map, and diff-hygiene audits passed. |
| Bug reproduced before fix | no | N/A: agent topology correction. | Live-source inventory proved duplicate/dead routes. |
| Targeted behavior verification | yes | Prove all accepted routes. | Four-route agent-native capability map passed. |
| TypeScript or typed config changed | no | N/A: no typed source changed. | No TypeScript/config diff. |
| Package exports or file layout changed | no | N/A: no package public layout changed. | `pnpm brl` is not applicable. |
| Package manifests, lockfile, or install graph changed | yes | Regenerate from current install graph. | `pnpm install` passed; graph stayed current. |
| Agent rules or skills changed | yes | Regenerate and compare source/mirrors. | Install passed; all changed bodies compare equal. |
| Workspace authority proof | yes | Run proof in the owning checkout. | All commands ran in `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | no | N/A: workflow only. | No rendered behavior. |
| Browser final proof | no | N/A: no browser surface. | No Browser/Chrome proof needed. |
| CI-controlled template output changed | no | N/A: no CI `templates/**` output changed. | Only `docs/plans/templates/**` source templates changed. |
| Package behavior or public API changed | no | N/A: no package behavior/API. | No changeset needed. |
| Registry-only component work changed | no | N/A: no registry component. | No registry changelog needed. |
| Docs or content changed | yes | Source-audit incidental Vision/templates. | Routes and existing owner paths verified. |
| High-risk mini gate | yes | Prove agent route/authority/command contracts. | Failure modes and four-route proof recorded. |
| Agent-native review for agent/tooling changes | yes | Review capability map and close findings. | Map passed; routing ambiguity fixed. |
| Local install corruption suspected | no | N/A: no corruption signal. | Normal install/regeneration passed. |
| Autoreview for non-trivial implementation changes | yes | Run scoped local review until clean. | Five passes; final clean at 0.88 confidence. |
| PR create or update | no | N/A: no PR requested. | No git/public mutation. |
| Task-style PR body verified | no | N/A: no PR. | No PR body. |
| PR proof image hosting | no | N/A: no PR/browser proof. | No image hosting. |
| Tracker sync-back | no | N/A: no tracker item. | No tracker mutation. |
| Final handoff contract | yes | Fill all fields. | Filled below. |
| Final lint | yes | Run root lint and record scope. | `pnpm lint:fix` found 170 unrelated diagnostics and applied no fixes. |
| Output budget discipline | yes | Scope/cap searches and reviews. | One broad search was truncated; targeted discovery replaced it. |
| Timed checkpoint | no | N/A: no duration. | One-shot flow completed. |
| Goal plan complete | yes | Run completion checker. | Recorded after this ledger update. |
| Agent source / generated sync | yes | Install and compare mirrors. | Source/body plus agent/Claude comparisons passed. |
| Agent action discoverability | yes | Audit AGENTS and generated skills. | Four routes are explicit. |
| Agent-native review | yes | Close all capability gaps. | Four-route map passed with no unresolved gap. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | Current sources, paths, commands, and overlap inventoried. | implementation |
| Implementation | done | Hard cut, thin coordinator, routes, templates, and live command owners updated. | verification |
| Verification | done | Install, mirrors, audits, agent-native review, autoreview, and diff hygiene passed. | closeout |
| PR / tracker sync | N/A | No PR/tracker/public mutation requested. | final response |
| Closeout | done | Plan ledger complete; goal checker is final command. | final response |

Findings:
- `resolve-slate-issue` duplicates the local repair workflow and adds the valid
  public issue/PR/comment authority layer.
- `slate-patch` is the intended local worker but names removed Slate packages,
  apps, and commands.
- `auto` routes narrow bugs to `slate-patch` and repeats the removed Slate
  topology; `maintainer` already routes known public issues through
  `resolve-slate-issue`.
- `.agents/AGENTS.md`, `docs/vision/plite.md`, and current Plite plan templates
  already name `plite-patch`; the missing source rule is implementation drift.
- Eleven active rule/template owners reference `slate-patch`; generated
  `.agents/skills/slate-patch` and `.claude/skills/slate-patch` exist.
- Current runtime owners exist at `packages/plite*` and `apps/plite`; the old
  `packages/slate*`, `apps/slate`, and `check:slate` surfaces do not.

Decisions and tradeoffs:
- Hard rename instead of alias -> one discoverable local owner and no stale
  compatibility route.
- Keep `resolve-slate-issue` -> cross-repository public mutation is distinct
  ownership, but local patch mechanics move to `plite-patch`.
- Keep `auto` broad -> it routes narrow work and supervises multi-packet work;
  it must not become a second regression worker.

Implementation notes:
- Added `.agents/rules/plite-patch.mdc` as the sole local worker and deleted
  `.agents/rules/slate-patch.mdc`.
- Reduced `resolve-slate-issue` to intake/classification, worker evidence,
  root check, Plate `next` PR, issue update, and honest closure state.
- Updated AGENTS, Auto, maintainer, adjacent owners, Vision, and plan templates.
- Kept `slate-ar` and `slate-migration` as their real current skill names;
  templates use their current Plite template names.
- Regeneration deleted both old generated skill mirrors and created the new
  agent plus Claude mirrors.

Review fixes:
- Agent-native review: clarified the generic public issue route so one concrete
  Slate issue unambiguously selects `resolve-slate-issue`.
- Autoreview pass 1: replaced dead Slate proof commands and
  `packages/slate*` migration ownership.
- Autoreview pass 2: removed routes to nonexistent `plite-ar` and
  `plite-migration` skills while keeping their Plite plan templates.
- Autoreview pass 3: repaired AR/migration template invocations and the browser
  package filter.
- Autoreview pass 4: rejected the missing-Claude-mirror report as caused by the
  temporary review-bundle symlink omission, restored the mirror, and reran.
- Autoreview pass 5: clean, no accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| First mechanical replacement used zsh scalar expansion and passed newline-separated paths as one filename. | 1 | Use null-delimited `rg -0 | xargs -0`. | Fixed; zero old-name references proved. |
| Autoreview rejected an untracked generated Claude symlink. | 1 | Restore the link, locally exclude only that path from bundle collection, then inspect real filesystem state. | Final review clean; temporary exclude removed. |
| `pnpm lint:fix` found unrelated repo debt. | 1 | Preserve unrelated files and rely on scoped audits/diff hygiene. | 170 unrelated diagnostics, no fixes applied. |

Verification evidence:
- `pnpm install` passed after every source-rule repair; final regeneration
  succeeded.
- Hard-cut audit: zero active `slate-patch` files/references; old source and
  generated directories absent; new source plus both mirrors present.
- Dead-route audit: zero old Slate package/app/command/template paths in the
  active reviewed control plane.
- Source/generated body equality: 13 changed rule owners passed; agent and
  Claude skill mirrors compare equal.
- Agent-native map passed:
  local regression -> `plite-patch`;
  one Slate issue -> `resolve-slate-issue` -> worker packet;
  public queue -> `maintainer`;
  broad/timed quality -> `auto`.
- `git diff --check HEAD -- <scoped paths>` passed.
- Final scoped autoreview: clean, patch correct, confidence 0.88.
- `pnpm lint:fix`: failed on 170 unrelated architecture-audit diagnostics; no
  fixes applied.

Final handoff contract:
- PR line: N/A; no git/public mutation requested.
- Issue / tracker line: N/A; no live issue was resolved.
- Confidence line: high; source and generated control planes agree.
- Tests line: install, hard-cut/dead-route audits, 13 mirror comparisons,
  four-route agent-native map, diff hygiene, and clean autoreview.
- Browser line: N/A; no rendered surface changed.
- Outcome: one local worker, one public coordinator, explicit queue/broad routes.
- Caveat: root lint remains red on unrelated pre-existing audit artifacts.
- Design line: local repair and public delivery are separate owners.
- Verification line: all commands ran from `/Users/zbeyens/git/plate-2`.
- Confidence line: high; final scoped autoreview reports patch correct at 0.88.
- Flow table:
  - Reproduced: live source showed duplicate local repair and dead routes;
    browser N/A.
  - Verified: source/mirror, route, command, diff, and review gates passed;
    browser N/A.
- Browser check: N/A; no rendered surface.
- Outcome: hard cut complete with one local worker and one public coordinator.
- Caveat: root lint remains red on unrelated audit artifacts.
- Design:
  - Chosen boundary: `plite-patch` owns local repair;
    `resolve-slate-issue` owns public delivery.
  - Why not quick patch: renaming only the directory would preserve duplicated
    methodology and dead route/command references.
  - Why not broader change: `slate-ar` and `slate-migration` remain real live
    owners; renaming them is a separate hard cut.
- Verified: install, active-route audit, 13 mirror comparisons, capability map,
  diff hygiene, and clean scoped autoreview.
- PR body verified: N/A; no PR.

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
- PR: N/A; no PR requested.
- Issue / tracker: N/A; no public item in scope.
- Browser proof: N/A; no rendered surface.
- Caveats: root lint has 170 unrelated existing diagnostics; no fixes applied.

Timeline:
- 2026-07-27T12:15:13.347Z Task goal plan created.
- 2026-07-27T12:18Z Active control-plane inventory completed; doctrine already
  names `plite-patch`, implementation still exposes `slate-patch`.
- 2026-07-27T12:40Z Hard cut, routing, current commands/templates, mirrors, and
  review fixes completed.
- 2026-07-27T12:48Z Final scoped autoreview clean; lint caveat and handoff
  recorded.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Hard-cut `slate-patch` into `plite-patch` and separate local repair from public issue delivery. |
| What have I learned? | See Findings |
| What have I done? | See Implementation notes, Review fixes, and Verification evidence |

Open risks:
- None in scoped routing. Root lint has unrelated architecture-audit debt.
