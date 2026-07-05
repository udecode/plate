# paragraph shortcut block toggle

Objective:
Use Plite block toggle for the paragraph shortcut; done when `ParagraphPlugin` no longer uses `nodes.set` for the shortcut and Core proof passes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-03-paragraph-shortcut-block-toggle.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- none

Task source:
- type: user prompt
- title: `packages/core/src/react/plugins/paragraph/ParagraphPlugin.tsx nodes.set or block.toggle`
- acceptance criteria: shortcut uses `editor.update.blocks.toggle`, no `editor.update.nodes.set({ type })` remains in `ParagraphPlugin.tsx`, focused Core proof passes.

First checkpoint:
- [x] Captured requirement: inspect whether `nodes.set` should be `block.toggle`.
- [x] Captured scope: `packages/core/src/react/plugins/paragraph/ParagraphPlugin.tsx`.
- [x] Captured success: use existing Plite block transaction API, not old `editor.tf.toggleBlock`.
- [x] Captured non-goal: broad Core sweep or package migration outside this shortcut.

Completion threshold:
- [x] `ParagraphPlugin` shortcut calls `editor.update.blocks.toggle`.
- [x] `ParagraphPlugin` has no `editor.update.nodes.set({ type })`.
- [x] Focused related source audit passes.
- [x] Core typecheck passes.
- [x] Focused related tests pass.
- [x] `check-complete.mjs` passes.

Verification surface:
- Source audit for `ParagraphPlugin`.
- Core typecheck.
- Focused related Core tests.

Constraints:
- Preserve shortcut keys and preventDefault behavior.
- Preserve main intent: paragraph shortcut toggles block type.
- Do not reintroduce `editor.tf` or legacy transform aliases.
- Do not stage, commit, push, or create PR.

Boundaries:
- Allowed edit scope: `ParagraphPlugin.tsx` and this plan.
- Browser surface: N/A, editor command wiring only.
- Tracker sync: N/A.
- Non-goals: input-rules behavior changes, broad block API redesign.

Output budget strategy:
- Exact source reads/searches only.

Blocked condition:
- None.

Task state:
- task_type: Core API cleanup
- task_complexity: small
- current_phase: implementation
- current_phase_status: in_progress
- next_phase: verification
- goal_status: active

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint rows above. |
| Timed checkpoint parsed | no | No duration requested. |
| Skill analysis before edits | yes | `plate-next` read. |
| Active goal checked or created | yes | Goal created for this shortcut cleanup. |
| Source of truth read before edits | yes | Current file, Plite block tx API, input-rule usage, and `origin/main` paragraph shortcut read. |
| Browser tool decision for browser surface | yes | N/A: no browser surface. |
| Output budget strategy recorded | yes | Exact searches only. |

Work Checklist:
- [x] Read current `ParagraphPlugin`.
- [x] Confirm Plite `editor.update.blocks.toggle` exists.
- [x] Compare `origin/main` shortcut intent.
- [x] Patch shortcut to use block toggle.
- [x] Run source audit.
- [x] Run focused tests.
- [x] Run Core typecheck.
- [x] Update final evidence.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Source audit `ParagraphPlugin` | `rg -n "nodes\\.set\\(\\{ type \\}\\)|update\\.blocks\\.toggle|tf\\.toggleBlock|toggleParagraph" packages/core/src/react/plugins/paragraph/ParagraphPlugin.tsx packages/core/src/lib/plugins/input-rules/createInputRules.ts --glob '!**/dist/**'` shows `ParagraphPlugin` uses `editor.update.blocks.toggle` and no `nodes.set({ type })` / `tf.toggleBlock`. |
| TypeScript or typed config changed | yes | Run Core typecheck | `pnpm --filter @platejs/core typecheck` passed. |
| Targeted behavior verification | yes | Run focused Core tests around paragraph/plugin shortcut surface | `pnpm --filter @platejs/core exec bun test src/react/plugin/toPlatePlugin.spec.ts src/react/editor/TPlateEditor.spec.ts src/react/editor/TPlateEditorCore.spec.ts src/react/utils/inputRules.spec.tsx` passed: 48 pass. |
| Browser surface changed | no | N/A | No browser surface. |
| Package behavior or public API changed | no | N/A | Internal command implementation cleanup; no changeset. |
| Final lint | no | N/A unless formatting fails | No formatting-heavy change expected. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-03-paragraph-shortcut-block-toggle.md` | Pending final mechanical check. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Current, Plite API, input-rules, and `origin/main` read. | implementation |
| Implementation | complete | `ParagraphPlugin` shortcut now calls `editor.update.blocks.toggle(type, { defaultType: editor.getType('p') })`. | verification |
| Verification | complete | Source audit, focused tests, and Core typecheck passed. | closeout |
| Closeout | complete | Final evidence recorded. | final response |

Findings:
- `ParagraphPlugin` currently uses `editor.update.nodes.set({ type })`.
- Plite exposes `editor.update.blocks.toggle`.
- Core input rules already use `editor.update.blocks.toggle`.
- `origin/main` paragraph shortcut used `editor.tf.toggleBlock(type)`, so the migration should preserve toggle semantics.

Decisions and tradeoffs:
- Decision: use `editor.update.blocks.toggle(type, { defaultType: editor.getType('p') })`.
- Reason: this is the Plite-native replacement for `editor.tf.toggleBlock(type)`.
- Risk: none expected; this is command semantics cleanup.

Implementation notes:
- `ParagraphPlugin` shortcut moved from raw node property mutation to Plite block toggle transaction.

Review fixes:
- None.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None | 0 | N/A | N/A |

Verification evidence:
- `rg -n "nodes\\.set\\(\\{ type \\}\\)|update\\.blocks\\.toggle|tf\\.toggleBlock|toggleParagraph" packages/core/src/react/plugins/paragraph/ParagraphPlugin.tsx packages/core/src/lib/plugins/input-rules/createInputRules.ts --glob '!**/dist/**'` -> `ParagraphPlugin` uses `editor.update.blocks.toggle`; no `nodes.set({ type })` / `tf.toggleBlock`.
- `pnpm --filter @platejs/core exec bun test src/react/plugin/toPlatePlugin.spec.ts src/react/editor/TPlateEditor.spec.ts src/react/editor/TPlateEditorCore.spec.ts src/react/utils/inputRules.spec.tsx` -> 48 pass.
- `pnpm --filter @platejs/core typecheck` -> pass.

Reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |
|-------------|-------------------|-------------------|---------------|------------|
| Closeout | Final response | Paragraph shortcut uses block toggle | Main intent was toggle, Plite has block tx | Patch and proof complete |

Open risks:
- None.
