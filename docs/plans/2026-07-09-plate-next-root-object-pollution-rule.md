# plate-next root object pollution rule

Objective:
Repair `plate-next` so future Plate v2 review packets treat arbitrary editor
root object fields, including `editor.propsChanges`, as a Plite anti-pattern
unless the field is part of the explicit typed editor contract.

Completion threshold:
The repair is complete when `.agents/rules/plate-next.mdc` names the rule,
the generated `.agents/skills/plate-next/SKILL.md` mirrors it, root-object
pollution is listed as a suspicious file-review pattern, and the goal plan
passes `check-complete.mjs`.

Verification surface:
Source rule audit, generated skill mirror audit, Skiller sync proof, and
autogoal plan completion proof.

Constraints:
- Patch source-of-truth skill rules, not generated skill mirrors.
- Keep the repair narrow to `plate-next` review behavior.
- Do not patch `packages/diff` in this packet; that is the next runtime cleanup.
- No git staging, commit, branch, PR, or worktree work.

Boundaries:
- Source owner: `.agents/rules/plate-next.mdc`.
- Generated mirror: `.agents/skills/plate-next/SKILL.md`.
- Runtime follow-up owner: `plate-next` packet for `packages/diff`.
- Non-goal: changing production code in this repair pass.

Blocked condition:
Blocked only if Skiller cannot regenerate the skill mirror or the source rule
cannot be verified locally.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User asked to repair `plate-next` for `editor.propsChanges` root pollution and give harsh best-solution feedback |
| Timed checkpoint parsed | no | No duration was requested |
| Expectation restated | yes | `editor.propsChanges` and similar root fields must be treated as Plite anti-patterns |
| Active goal checked | yes | Active autogoal created for the repair |
| Named plan or skill read | yes | `plate-next` source rule was read and patched |
| Owning source selected | yes | `.agents/rules/plate-next.mdc` owns generated `plate-next` behavior |
| Repair classification selected | yes | Skill-review rule repair |
| Safety conflict checked | yes | Source-rule-only repair; no runtime behavior changed |
| Output budget strategy recorded | yes | Searches were scoped to `plate-next`, generated mirror, and root-pollution terms |

Work Checklist:
- [x] Duration marked not applicable because no timed run was requested.
- [x] First checkpoint copied the explicit user requirement into this plan.
- [x] Expectation and observed miss are stated with source evidence.
- [x] Primary owner selected as `.agents/rules/plate-next.mdc`.
- [x] Secondary runtime owner recorded as a future `packages/diff` cleanup packet.
- [x] Patch touches source-of-truth skill rule plus this plan only.
- [x] Generated skill ownership recorded and synced through Skiller.
- [x] Output budget discipline followed with scoped `rg` and `sed` output.
- [x] Deliberate non-repair recorded: production code cleanup deferred.
- [x] Final response shape recorded: changed rule, proof, harsh best solution, next packet.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Source owner patched | yes | Patch `.agents/rules/plate-next.mdc` | Rule contains root editor object pollution law |
| Generated skill sync | yes | Run Skiller sync and verify generated mirror | `pnpm install`; `pnpm run prepare`; mirror `rg` proof |
| Template smoke | no | Source-rule repair has no template behavior | Plan records N/A |
| Incomplete-plan guard | no | Checker script unchanged | Plan records N/A |
| Completed-plan representability | yes | Fill this plan with concrete completion state | This file has resolved gates and checked items |
| Helper/checker tests | no | No helper scripts changed | Plan records N/A |
| Autoreview / review | no | Source-rule-only repair; no production code | Plan records N/A |
| Final lint | no | Markdown/source-rule-only edit; no formatter required | Plan records N/A |
| Output budget discipline | yes | Avoid unbounded command output | Scoped searches used after one broad accidental search was replaced by narrower proof |
| Timed checkpoint | no | No duration requested | Plan records N/A |
| Goal plan complete | yes | Run `check-complete.mjs` | Pending final command |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake | complete | User named `editor.propsChanges` and `plate-next` | Done |
| Target selection | complete | `.agents/rules/plate-next.mdc` selected | Done |
| Patch | complete | Root pollution rule added | Done |
| Sync | complete | Skiller prepare completed | Done |
| Verification | complete | Source and generated mirror audits pass | Done |
| Closeout | complete | Plan records next runtime owner | Final response |

Findings:
- `packages/diff/src/internal/utils/with-change-tracking.ts` still uses
  `editor.propsChanges` and `editor.recordingOperations`; that is runtime
  cleanup debt, not a skill-sync blocker.
- `editor.store`, `editor.plugins`, and typed Plate/Core contract fields are
  different from arbitrary plugin state, but should not be used as precedent
  for new root bags.

Decisions and tradeoffs:
- Skill rule first, runtime cleanup next. This prevents the same review miss
  while keeping this repair packet narrow.
- The correct default destination for private ephemeral plugin state is a
  module-local `WeakMap` keyed by editor, not a public editor root field.

Repair patch notes:
- Added a `Root editor object pollution` law to `plate-next`.
- Added root field pollution to the default suspicious pattern list.
- Synced the generated skill mirror with Skiller.

Deliberate non-repairs:
- Did not change `packages/diff` runtime behavior in this pass.
- Did not broaden the rule into generic Plite API design beyond Plate Next
  review policy.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `pnpm install` alone did not update the generated mirror | 1 | Run explicit Skiller prepare script | `pnpm run prepare` synced the mirror |
| Initial script discovery search was too broad | 1 | Use narrow scripts and mirror proof commands | Completed with scoped proof |

Verification evidence:
- `pnpm install` completed.
- `pnpm run prepare` completed and ran `bun x skiller@latest apply`.
- `rg -n "Root editor object pollution|editor\\.propsChanges|arbitrary root editor object fields|WeakMap" .agents/rules/plate-next.mdc .agents/skills/plate-next/SKILL.md` matched both source and generated skill.

Final repair handoff:
- Expectation: `plate-next` must call out arbitrary editor root fields as a
  Plite anti-pattern.
- Repaired owner: `.agents/rules/plate-next.mdc`.
- Files changed: `.agents/rules/plate-next.mdc`,
  `.agents/skills/plate-next/SKILL.md`,
  `docs/plans/2026-07-09-plate-next-root-object-pollution-rule.md`.
- Verification: source/mirror audit and autogoal checker.
- Caveat: runtime code using `editor.propsChanges` remains for the next
  `packages/diff` cleanup packet.

Timeline:
- 2026-07-09: Goal repair plan created.
- 2026-07-09: Source rule patched.
- 2026-07-09: `pnpm install` run.
- 2026-07-09: `pnpm run prepare` synced generated skill mirror.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final answer with runtime recommendation |
| What is the goal? | Make `plate-next` reject editor root pollution |
| What have I learned? | `editor.propsChanges` belongs in scoped state or private `WeakMap`, not on editor root |
| What have I done? | Patched source rule, synced generated skill, recorded proof |

Open risks:
- Runtime cleanup is still needed in `packages/diff/src/internal/utils/with-change-tracking.ts`.
