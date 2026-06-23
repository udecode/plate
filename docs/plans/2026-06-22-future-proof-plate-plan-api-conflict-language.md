# future proof plate plan api conflict language

Objective:
Future-proof plate-plan API conflict language; done when stale concrete API
examples are removed from rule/template/mirror and audits pass.

Goal plan:
docs/plans/2026-06-22-future-proof-plate-plan-api-conflict-language.md

Template:
docs/plans/templates/task.md

Task source:
- type: user correction
- id / link: local chat
- title: remove current-specific API names from Plate Plan methodology
- acceptance criteria: Plate Plan stays generic and future-proof; conflict
  ledger is source-discovered; generated mirror updated; no exact stale API
  examples remain in Plate Plan rule/template/mirror/planning artifacts.

First checkpoint:
- Captured before implementation: remove the current-specific API names from
  durable Plate Plan methodology because those names are transitional and should
  not define future Plate v2 planning.

Completion threshold:
- `.agents/rules/plate-plan.mdc` describes generic source-discovered conflict
  surfaces instead of hardcoded current API names.
- `docs/plans/templates/plate-plan.md` asks future plans to discover conflict
  rows from live source.
- Prior closeout plan wording no longer preserves the current-specific names.
- `pnpm install` regenerates `.agents/skills/plate-plan/SKILL.md`.
- Negative audit finds no stale concrete API names in Plate Plan source,
  template, mirror, AGENTS routing, or the prior plan artifact.
- Positive audit finds generic source-discovered conflict language.

Verification surface:
- `pnpm install`
- Negative audit for the stale concrete API names across Plate Plan surfaces.
- Positive audit for `source-discovered`, `runtime accessors`, product command
  surfaces, plugin extension points, legacy substrate bridges, Plite/Plate
  boundary, and minimal breaking language.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-future-proof-plate-plan-api-conflict-language.md`

Constraints:
- Do not hand-edit generated skill mirrors.
- Keep Plate Plan generic and future-proof.
- Do not remove the conflict-ledger requirement; make it source-discovered.
- Do not implement Plate runtime/API migration in this task.

Boundaries:
- Source of truth: `.agents/rules/plate-plan.mdc`,
  `docs/plans/templates/plate-plan.md`, generated
  `.agents/skills/plate-plan/SKILL.md`, and the prior closeout plan artifact.
- Edit scope used: `.agents/rules/plate-plan.mdc`,
  `docs/plans/templates/plate-plan.md`,
  `docs/plans/2026-06-22-sync-plate-plan-methodology.md`, generated mirrors
  from `pnpm install`, and this plan.
- Browser surface: N/A.
- Tracker sync: N/A.
- Non-goals: runtime migration, final Plate API design, or public docs copy.

Output budget strategy:
- Used scoped `rg` audits and bounded mirror reads.

Blocked condition:
- Block only if generated skill sync fails after source-rule edits. It did not.

Task state:
- task_type: agent-methodology repair
- task_complexity: small
- current_phase: closeout
- current_phase_status: done
- goal_status: ready_to_complete

Current verdict:
- verdict: done
- confidence: high
- next owner: future `plate-plan` runs should discover concrete conflict rows
  from current source.
- reason: stale names are gone from durable Plate Plan methodology surfaces.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint records future-proof requirement and no current-specific API names. |
| Timed checkpoint parsed | no | No duration requested. |
| Skill analysis before edits | yes | Audited exact stale names before patching. |
| Active goal checked or created | yes | `get_goal` found no active goal; created this one. |
| Source of truth read before edits | yes | Audited Plate Plan source/template/mirror/AGENTS and prior plan artifact. |
| Tracker comments and attachments read | no | No tracker or attachments. |
| Video transcript evidence required | no | No video. |
| docs/solutions checked for non-trivial existing-code work | no | Methodology docs only. |
| TDD decision before behavior change or bug fix | no | No product behavior changed. |
| Branch decision for code-changing task | no | No branch/PR requested. |
| Release artifact decision | no | No package release artifact changed. |
| Browser tool decision for browser surface | no | No browser surface. |
| PR expectation decision | no | No PR requested. |
| Tracker sync expectation decision | no | No tracker. |
| Output budget strategy recorded | yes | Scoped audits and bounded reads only. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement and scope
      boundary copied before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with acceptance criteria.
- [x] Nearby implementation patterns read by auditing current Plate Plan
      surfaces.
- [x] Implementation fixes the right ownership boundary: source rule/template,
      then generated mirror.
- [x] Release artifact requirement recorded as N/A; no package release change.
- [x] Final handoff shape decided: changed list, proof, and caveat.
- [x] Branch handling recorded as N/A; no branch or PR requested.
- [x] Workspace authority recorded: commands run from Plate repo root.
- [x] High-risk note recorded: methodology wording only, no runtime API change.
- [x] Review/autoreview target selected as N/A; no runtime implementation
      change.
- [x] Agent-native review decision recorded by source-rule regeneration and
      mirror audit.
- [x] Output budget discipline recorded and followed.
- [x] Stale concrete API names removed from Plate Plan rule/template/mirror
      surfaces.
- [x] Source-discovered conflict ledger language preserved.
- [x] Generated skill mirror updated by `pnpm install`, not manual edits.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run generation and audits | `pnpm install`; negative and positive audits. |
| Bug reproduced before fix | no | N/A | Methodology correction, not runtime bug. |
| Targeted behavior verification | no | N/A | No product behavior changed. |
| TypeScript or typed config changed | no | N/A | Markdown/source rules only. |
| Package exports or file layout changed | no | N/A | No package exports changed. |
| Package manifests, lockfile, or install graph changed | no | N/A | `pnpm install` passed with lockfile up to date. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | Generated Plate Plan mirror contains generic conflict language. |
| Workspace authority proof | yes | Run verification in owning repo | Commands ran in `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | no | N/A | No browser surface. |
| Browser final proof | no | N/A | No browser surface. |
| CI-controlled template output changed | no | N/A | Source plan template only. |
| Package behavior or public API changed | no | N/A | Methodology only. |
| Registry-only component work changed | no | N/A | No registry work. |
| Docs or content changed | yes | Verify source-backed claims | `rg` audits over source, template, mirror, AGENTS, and prior plan artifact. |
| High-risk mini gate | yes | Record failure mode and proof | Risk: durable method fossilizes removed APIs; proof: negative stale-name audit. |
| Agent-native review for agent/tooling changes | yes | Source owner, regenerate, audit | Done. |
| Local install corruption suspected | no | N/A | No signal. |
| Autoreview for non-trivial implementation changes | no | N/A | No runtime implementation change. |
| PR create or update | no | N/A | No PR. |
| Task-style PR body verified | no | N/A | No PR. |
| PR proof image hosting | no | N/A | No PR. |
| Tracker sync-back | no | N/A | No tracker. |
| Final handoff contract | yes | Include changed files and proof | Final response will do this. |
| Final lint | no | N/A | Markdown/source-rule only. |
| Output budget discipline | yes | Verify scoped output | No unbounded output. |
| Timed checkpoint | no | N/A | No duration requested. |
| Goal plan complete | yes | Run `check-complete` | Final command below. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | Exact stale-name audit before patching. | implementation done |
| Implementation | done | Patched source rule, template, prior plan; regenerated mirror. | verification done |
| Verification | done | `pnpm install`; negative and positive audits; mirror read. | closeout done |
| PR / tracker sync | skipped | No PR/tracker requested. | closeout done |
| Closeout | done | This plan records gates and evidence. | final response |

Findings:
- The first Plate Plan rewrite was too concrete: it named current transitional
  APIs instead of requiring live-source discovery.
- The right durable rule is to require conflict ledgers by surface category and
  live source evidence.

Decisions and tradeoffs:
- Removed hardcoded current names from durable planning methodology.
- Kept generic conflict categories so the skill still forces real API conflict
  review.
- Left actual runtime/API decisions to a future Plate Plan run.

Implementation notes:
- Patched `.agents/rules/plate-plan.mdc`.
- Patched `docs/plans/templates/plate-plan.md`.
- Patched `docs/plans/2026-06-22-sync-plate-plan-methodology.md`.
- Ran `pnpm install` to regenerate `.agents/skills/plate-plan/SKILL.md` and
  root agent files.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None | 0 | | |

Verification evidence:
- `pnpm install` passed.
- Negative audit for stale concrete API names across Plate Plan rule/template,
  generated mirror, AGENTS routing, and prior plan artifact returned no matches.
- Positive audit found generic source-discovered conflict language in source,
  template, mirror, and routing.
- Generated mirror read confirms the API conflict law is source-discovered.

Final handoff contract:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A.
- Caveat: this only repairs methodology wording; it does not decide or migrate
  Plate runtime APIs.
- Outcome: Plate Plan now stays future-proof and source-discovered.
- Verified: `pnpm install`, negative stale-name audit, positive generic-language
  audit, mirror read, and `check-complete`.

Timeline:
- 2026-06-22 goal plan created.
- Audited stale names.
- Patched source/template/prior plan.
- Regenerated mirrors.
- Verified audits.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete. |
| Where am I going? | Final response after `check-complete`. |
| What is the goal? | Future-proof Plate Plan API conflict language. |
| What have I learned? | The rule should discover conflict surfaces from live source, not encode transitional names. |
| What have I done? | Removed concrete names, kept generic source-discovered conflict ledger requirements, regenerated and audited. |

Open risks:
- None for this methodology repair.
