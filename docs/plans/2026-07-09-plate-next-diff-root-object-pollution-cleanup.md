# plate-next diff root object pollution cleanup

Objective:
Remove diff root editor pollution and repair `plate-next` so concrete
root-pollution fields in active scope are fixed before closeout.

Completion threshold:
- `withChangeTracking` does not write private tracking fields or methods onto
  the editor root.
- Diff behavior still passes package tests, typecheck, lint, and build.
- `plate-next` source and generated mirror require root-pollution findings to
  be fixed or routed as a named Plite/Plate gap.
- This plan passes `check-complete.mjs`.

Verification surface:
- `pnpm --filter @platejs/diff test`
- `pnpm turbo typecheck --filter=./packages/diff`
- `pnpm --filter @platejs/diff lint`
- `pnpm --filter @platejs/diff build`
- source audit for root-pollution fields in changed diff files
- source/generated skill mirror audit for `plate-next`

Constraints:
- Keep scope to `packages/diff`, `plate-next` source rule, generated mirror,
  and this plan.
- Do not broaden into other packages, docs, browser proof, or Core sweep.
- Preserve diff behavior and type inference.
- Do not add public compat aliases or editor-root bags.

Boundaries:
- Runtime files: `packages/diff/src/internal/utils/with-change-tracking.ts`,
  `packages/diff/src/internal/utils/with-change-tracking.spec.ts`,
  `packages/diff/src/internal/transforms/transformDiffTexts.ts`.
- Skill files: `.agents/rules/plate-next.mdc`,
  `.agents/skills/plate-next/SKILL.md`.
- Non-goals: public API redesign, all-package migration, browser route proof.

Blocked condition:
Blocked only if callers outside diff require direct public access to the old
tracking arrays or root flags.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User asked to go and repair the skill after `editor.propsChanges` was called out |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` and source rule were read |
| Active goal checked or created | yes | Active goal created for runtime cleanup plus skill repair |
| Mode classified | yes | Named runtime packet plus source-rule repair |
| Broad Core sweep checked | yes | N/A: target is diff utility, not Core sweep |
| Package review checked | yes | N/A: focused utility cleanup, not full package checklist |
| Output budget strategy recorded | yes | Used targeted `sed` and `rg`, capped outputs |

Work Checklist:
- [x] First checkpoint copied target, scope, non-goals, proof, and stop rules.
- [x] Callers for `withChangeTracking` were searched.
- [x] Root private fields were removed from the editor shape.
- [x] `withChangeTracking` was changed to return a session object with
      `editor`, `applyOperation`, and `commitChangesToDiffs`.
- [x] Private arrays and recording flag live in local session state.
- [x] `transformDiffTexts` uses the session object instead of editor-root
      methods.
- [x] Tests assert the old private fields and methods are absent from the
      editor root.
- [x] `plate-next` source rule was repaired.
- [x] Generated `plate-next` mirror was synced with Skiller.
- [x] Focused package proof passed.
- [x] Source audits passed.
- [x] No browser proof run; N/A because this is internal package logic and
      skill text.
- [x] Final handoff includes changed list, proof, and next risk.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run focused diff package proof | test/typecheck/lint/build passed |
| Best Plate v2 recommendation | yes | Record current shape and rejected alternative | Session object kept; editor-root bags rejected |
| Plite/Plate gap ledger | yes | Record blocker or N/A | N/A: no Plite gap; local session state fits this algorithm |
| Related scoped sweep after correction | yes | Search root-pollution terms in active diff files | root-field audit returned no matches |
| Package/API proof | yes | Run focused package commands | diff test/typecheck/lint/build passed |
| Shared Core gate coverage | no | Core gate not touched | N/A: diff is not in `check:core` |
| Non-Core package error triage | no | Classify external failures if present | N/A: proof stayed in diff package |
| Source audit | yes | Audit root pollution and skill mirror text | `rg` audits passed |
| Rename ledger | no | No rename proposed | N/A |
| Extracted-file inventory | no | No extracted/new owner files created | N/A |
| Autoreview / review | no | Source-backed focused packet with package proof | N/A: no separate review requested |
| Final lint/check | yes | Run package lint | `pnpm --filter @platejs/diff lint` passed |
| Changed list / top drift / needs attention | yes | Fill final handoff rows | Recorded below |
| Goal plan complete | yes | Run `check-complete.mjs` | Pending final command |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake | complete | User named root pollution and skill repair | Done |
| Source map | complete | `rg` found only diff callers/tests for private tracking fields | Done |
| Runtime patch | complete | session object replaces editor-root state/methods | Done |
| Skill repair | complete | source rule plus generated mirror updated | Done |
| Verification | complete | diff proof and audits passed | Done |
| Closeout | complete | plan ready for final checker | Final response |

Review matrix:
| Target | Verdict | Owner | Evidence | Next |
|--------|---------|-------|----------|------|
| `with-change-tracking.ts` root fields | main-parity-cleanup | diff internal utility | no root writes remain; tests pass | keep |
| `transformDiffTexts.ts` caller | main-parity-cleanup | diff transform | calls session methods, not editor-root methods | keep |
| `plate-next` rule | workflow repair | `.agents/rules/plate-next.mdc` | generated mirror contains new rule | keep |

Related scoped sweep:
| Query | Scope | Matches | Patched | Deferred |
|-------|-------|---------|---------|----------|
| `ChangeTrackingEditor|withChangeTracking|applyOperation|commitChangesToDiffs|propsChanges|recordingOperations` | `packages/diff` | only diff utility, transform, and spec | all active root uses patched | none |
| `editor\\.(propsChanges|recordingOperations|insertedTexts|removedTexts|applyOperation|commitChangesToDiffs)` | changed diff files | 0 | N/A | none |

Findings:
- `withChangeTracking` is internal to diff; no public package API needs the old
  root fields.
- A session/controller object is cleaner than `WeakMap` here because the
  tracking lifecycle is created and consumed inside one algorithm.
- `WeakMap` remains the right fallback when private state must be associated
  with an editor across independent calls.

Decisions and tradeoffs:
- Rejected keeping `applyOperation` and `commitChangesToDiffs` on the editor
  root. They were also root pollution, just less ugly than the arrays.
- Kept the old helper owner and migrated the implementation inside it; no
  rename or owner churn.

Changed list:
| Area | Files |
|------|-------|
| code/runtime/API | `packages/diff/src/internal/utils/with-change-tracking.ts`, `packages/diff/src/internal/transforms/transformDiffTexts.ts` |
| tests/proof | `packages/diff/src/internal/utils/with-change-tracking.spec.ts` |
| docs/templates/skills | `.agents/rules/plate-next.mdc`, `.agents/skills/plate-next/SKILL.md`, this plan |
| reverted/quarantined packets | none |

Verification evidence:
- `pnpm install` passed.
- `pnpm run prepare` passed and regenerated skill mirrors.
- `pnpm --filter @platejs/diff test` passed: 62 tests.
- `pnpm turbo typecheck --filter=./packages/diff` passed.
- `pnpm --filter @platejs/diff lint` passed.
- `pnpm --filter @platejs/diff build` passed.
- Root-field audit for `editor.propsChanges`, `editor.recordingOperations`,
  `editor.insertedTexts`, `editor.removedTexts`, `editor.applyOperation`, and
  `editor.commitChangesToDiffs` returned no matches in changed diff files.
- Skill mirror audit found the root-pollution rule in both source and generated
  `plate-next`.

Final handoff:
- target surface and mode: focused diff utility cleanup plus `plate-next`
  workflow repair.
- files/APIs reviewed: `withChangeTracking`, `transformDiffTexts`, root
  pollution skill rule.
- best Plate v2 recommendation: use returned session/controller objects for
  local algorithm state; use `WeakMap` only when private state must span
  independent editor calls.
- verdict matrix summary: all reviewed rows are kept after cleanup.
- Plite/Plate gaps or blockers: none.
- related scoped sweep query/active scope/matches/patched/deferred: recorded
  above, no deferred rows.
- out-of-scope matches discovered: none relevant.
- changes made: recorded above.
- tests/proof commands: recorded above.
- old compatibility names audited: root field names audited.
- needs attention: none for this packet.
- next best Plate Next packet: continue package-by-package review; use this
  pattern for any other root-object plugin state.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final answer |
| What is the goal? | Remove diff root editor pollution and repair recurrence rule |
| What have I learned? | Session object beats editor-root state for this diff algorithm |
| What have I done? | Runtime cleanup, test update, skill repair, focused proof |

Open risks:
- Other packages may still have root-object pollution, but none were in the
  active scope of this packet.
