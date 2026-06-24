# sync plate plan methodology

Objective:
Sync plate-plan methodology with Plite; done when source rule, template,
mirror, and audits align.

Goal plan:
docs/plans/2026-06-22-sync-plate-plan-methodology.md

Template:
docs/plans/templates/task.md

Task source:
- type: user request
- id / link: local chat
- title: sync plate-plan methodology with slate-plan for Plate v2
- acceptance criteria: stale Plate editor-behavior-only framing removed; Plate
  v2 planning aligns with Plite methodology; breaking changes allowed for
  best architecture/DX/perf/testability; Plite/Plate boundary explicit; no API
  overlap; minimal breaking-change planning uses source-discovered conflict
  rows instead of hardcoded current API names.

First checkpoint:
- Captured before implementation: compare stale `plate-plan.mdc` to
  `plite-plan.mdc`; rewrite the source rule; add the missing Plate Plan
  template; update routing; regenerate generated mirrors; audit source and
  mirror language; do not implement Plate runtime migration in this task.

Completion threshold:
- `.agents/rules/plate-plan.mdc` is rewritten from stale editor-behavior-only
  planning into the Plate v2 architecture/API/boundary planning owner.
- Methodology is synced from `.agents/rules/slate-plan.mdc`: planning vs
  accepted-plan execution, autogoal lifecycle, score/pass gates, live-source
  grounding, objection ledger, pressure passes, proof gates, and final handoff.
- Plate v2 doctrine is explicit: breaking changes are allowed for best
  architecture, DX, performance, testability, and agent-maintainability.
- Plite/Plate boundary is explicit: Plite owns substrate/runtime/editor core;
  Plate owns product/plugin/UI/registry/app-level composition.
- No-overlap rule is explicit: Plate must not re-create or conflict with Plite
  APIs; Plite API wins unless a distinct Plate product owner is proven.
- The skill defines minimal breaking-change planning through source-discovered
  conflict rows instead of hardcoded current API names.
- A `docs/plans/templates/plate-plan.md` template exists and matches the new
  method.
- `.agents/AGENTS.md` routing points at Plate v2 API/boundary planning.
- `pnpm install` regenerates the generated `plate-plan` skill mirror.
- Source/mirror audits and `check-complete` pass.

Verification surface:
- `pnpm install`
- `sed -n '1,220p' .agents/skills/plate-plan/SKILL.md`
- `rg -n "Plate v2|Plite/Plate|minimal breaking|source-discovered|runtime accessors|plugin extension points|planning mode|Execution mode" .agents/rules/plate-plan.mdc .agents/skills/plate-plan/SKILL.md docs/plans/templates/plate-plan.md .agents/AGENTS.md AGENTS.md`
- `rg -n "description: Define or update Plate editor-behavior|This is the Plate editor-behavior planning|editor-behavior planning and law workflow|markdown-editing-spec|markdown-standards|markdown-parity-matrix" .agents/rules/plate-plan.mdc .agents/skills/plate-plan/SKILL.md docs/plans/templates/plate-plan.md .agents/AGENTS.md AGENTS.md`
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-sync-plate-plan-methodology.md`

Constraints:
- Do not hand-edit `.agents/skills/plate-plan/SKILL.md`; update source rules
  and regenerate.
- Preserve useful Plate editor-behavior law machinery as a sub-surface, not the
  center of the skill.
- Do not implement Plate v2 runtime migration or design every final Plate API in
  this task.
- Do not create PRs, comments, commits, or pushes.

Boundaries:
- Source of truth: `.agents/rules/plate-plan.mdc`,
  `.agents/rules/slate-plan.mdc`, root `VISION.md`, `.agents/AGENTS.md`, and
  plan templates.
- Edit scope used: `.agents/rules/plate-plan.mdc`,
  `docs/plans/templates/plate-plan.md`, `.agents/AGENTS.md`, generated mirrors
  from `pnpm install`, root `AGENTS.md` from generation, and this plan.
- Browser surface: N/A, agent methodology docs only.
- Tracker sync: N/A.
- Non-goals: runtime migration, final API implementation, public compat aliases,
  generated mirror hand edits.

Output budget strategy:
- Read bounded source chunks and used scoped `rg` audits. No broad unbounded
  command output was streamed.

Blocked condition:
- Block only if source rule generation breaks after `pnpm install` and the
  failing generator cannot be repaired inside this task. It did not block.

Task state:
- task_type: agent-methodology update
- task_complexity: medium
- current_phase: closeout
- current_phase_status: done
- goal_status: ready_to_complete

Current verdict:
- verdict: done
- confidence: high
- next owner: Plate Plan execution only when the user invokes it for a concrete
  Plate v2 API/boundary plan.
- reason: source rule, template, generated mirror, and routing audits align.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint lists stale-vs-Plite sync, Plate v2 alignment, breaking-change authority, Plite/Plate boundary, no API overlap, and conflict APIs. |
| Timed checkpoint parsed | no | User gave no duration. |
| Skill analysis before edits | yes | Read generated `plate-plan` skill, source `plate-plan.mdc`, source `plite-plan.mdc`, and `plite-plan` template. |
| Active goal checked or created | yes | `get_goal` returned no active goal; created this goal. |
| Source of truth read before edits | yes | Read source rules and AGENTS routing before edits. |
| Tracker comments and attachments read | no | No tracker or attachment surface. |
| Video transcript evidence required | no | No video input. |
| docs/solutions checked for non-trivial existing-code work | no | Agent methodology docs only; no runtime code change. |
| TDD decision before behavior change or bug fix | no | No product behavior change. |
| Branch decision for code-changing task | no | No branch/PR requested. |
| Release artifact decision | no | No package release artifact changed. |
| Browser tool decision for browser surface | no | No browser surface. |
| PR expectation decision | no | No PR requested. |
| Tracker sync expectation decision | no | No tracker requested. |
| Output budget strategy recorded | yes | Scoped command/read strategy recorded above. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, stop condition, deliverable, verification surface, and success
      criterion is copied into this plan before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with acceptance criteria and non-goals.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary: source rule and
      template, not generated mirror prose.
- [x] Release artifact requirement recorded as N/A; no package release change.
- [x] Final handoff shape decided: changed list, proof, and next owner.
- [x] Branch handling recorded as N/A; no branch or PR requested.
- [x] Workspace authority recorded: verification runs from Plate repo root.
- [x] High-risk note recorded: public API planning methodology changed, but no
      runtime API implementation changed.
- [x] Review/autoreview target selected as N/A; methodology docs only.
- [x] Agent-native review decision recorded by using source-rule regeneration
      and mirror audit.
- [x] Output budget discipline recorded and followed.
- [x] Plate Plan source rule synced to Plite Plan methodology without leaving it
      as an editor-behavior-only skill.
- [x] Plate v2 API conflict planning is explicit and source-discovered, without
      hardcoded current API names.
- [x] Plite/Plate boundary and no-overlap doctrine are explicit.
- [x] Plate Plan template exists and matches the source rule.
- [x] Generated skill mirror updated by `pnpm install`, not manual edits.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run generation and audits | `pnpm install` passed; source/mirror/template audits passed. |
| Bug reproduced before fix | no | N/A | Skill drift, not runtime bug. |
| Targeted behavior verification | no | N/A | No product behavior changed. |
| TypeScript or typed config changed | no | N/A | Markdown/source rules only. |
| Package exports or file layout changed | no | N/A | No package exports changed. |
| Package manifests, lockfile, or install graph changed | no | N/A | `pnpm install` passed with lockfile up to date. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` regenerated `plate-plan` mirror from `.agents/rules/plate-plan.mdc`. |
| Workspace authority proof | yes | Verify from Plate repo root | All commands ran in `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | no | N/A | No app/browser route changed. |
| Browser final proof | no | N/A | No browser surface. |
| CI-controlled template output changed | no | N/A | Added source plan template, not CI output. |
| Package behavior or public API changed | no | N/A | Planning methodology only. |
| Registry-only component work changed | no | N/A | No registry work. |
| Docs or content changed | yes | Verify source-backed claims and generated skill route | `rg` audits across source, template, mirror, AGENTS docs. |
| High-risk mini gate | yes | Record failure mode and proof plan | Risk: stale skill could preserve API conflict debt; proof: source/mirror audits and template row requirements. |
| Agent-native review for agent/tooling changes | yes | Use source owner, regenerate, mirror audit | Source `.mdc` edited; generated mirror audited. |
| Local install corruption suspected | no | N/A | No install-corruption signal. |
| Autoreview for non-trivial implementation changes | no | N/A | No runtime implementation change; source-rule audit is the relevant proof. |
| PR create or update | no | N/A | No PR requested. |
| Task-style PR body verified | no | N/A | No PR. |
| PR proof image hosting | no | N/A | No PR proof image. |
| Tracker sync-back | no | N/A | No tracker. |
| Final handoff contract | yes | Include changed files, proof, caveat, next owner | Final response will include concise closeout. |
| Final lint | no | N/A | Markdown/source-rule only; no lint owner. |
| Output budget discipline | yes | Verify scoped output | Used bounded reads and scoped `rg`. |
| Timed checkpoint | no | N/A | No duration requested. |
| Goal plan complete | yes | Run `check-complete` | Final command below. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | Read stale `plate-plan`, current `plite-plan`, AGENTS routing, and template state. | implementation done |
| Implementation | done | Rewrote source rule, added template, updated AGENTS routing, regenerated mirror. | verification done |
| Verification | done | `pnpm install`; source/mirror/template `rg` audits. | closeout done |
| PR / tracker sync | skipped | No PR/tracker requested. | closeout done |
| Closeout | done | This plan records gates and final evidence. | final response |

Findings:
- `plate-plan.mdc` was centered on markdown/editor-behavior law and lacked the
  Plite-style planning/execution split, API conflict ledger, and Plate v2
  boundary doctrine.
- No `docs/plans/templates/plate-plan.md` existed, so future Plate Plan runs had
  no durable template.
- AGENTS routing still described `plate-plan` as editor-behavior law.

Decisions and tradeoffs:
- Replaced the source rule instead of editing it in place because the old center
  of gravity was wrong.
- Kept editor-behavior law as a sub-output for touched behavior surfaces.
- Added source-discovered conflict rows for Plate runtime/plugin/bridge
  surfaces that may overlap with Plite.
- Did not implement Plate runtime/API migration in this task.

Implementation notes:
- Changed `.agents/rules/plate-plan.mdc`.
- Added `docs/plans/templates/plate-plan.md`.
- Updated `.agents/AGENTS.md`.
- Ran `pnpm install`, which regenerated `.agents/skills/plate-plan/SKILL.md`
  and root `AGENTS.md`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Missing `docs/plans/templates/plate-plan.md` during initial read | 1 | Add the template as part of the sync | Added template. |

Verification evidence:
- `pnpm install` passed.
- Generated skill mirror begins with the new Plate v2 architecture/API
  description and `metadata.skiller.source: .agents/rules/plate-plan.mdc`.
- Positive audit found Plate v2, Plite/Plate boundary, minimal breaking-change,
  conflict API, and planning/execution language in source, generated mirror,
  template, and AGENTS docs.
- Negative audit for stale editor-behavior-only framing returned no matches.

Final handoff contract:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A, no browser surface.
- Caveats: this defines the planning skill and template; it does not yet execute
  the actual Plate v2 API conflict plan.
- Outcome: `plate-plan` is now the Plate v2 API/boundary planning owner.
- Verified: `pnpm install`, mirror inspection, positive and negative `rg`
  audits, and `check-complete`.

Timeline:
- 2026-06-22T09:53:01.677Z Task goal plan created.
- Rewrote `.agents/rules/plate-plan.mdc`.
- Added `docs/plans/templates/plate-plan.md`.
- Updated `.agents/AGENTS.md`.
- Ran `pnpm install`.
- Audited generated mirror and stale language.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete. |
| Where am I going? | Final response after `check-complete`. |
| What is the goal? | Sync `plate-plan` with Plite methodology for Plate v2 API/boundary planning. |
| What have I learned? | The old skill was too behavior-law-specific and lacked the Plate v2 conflict-planning machinery. |
| What have I done? | Rewrote source rule, added template, updated routing, regenerated and audited mirror. |

Open risks:
- None for the skill sync. The actual Plate v2 API decisions still need a
  dedicated `plate-plan` run.
