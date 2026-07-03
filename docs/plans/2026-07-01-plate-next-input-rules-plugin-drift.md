# plate-next input rules plugin drift

Objective:
Review and repair `InputRulesPlugin` drift so input-rule execution stays in its owner, uses Plite extension slots, and keeps main-style inline readability.

Completion threshold:
`InputRulesPlugin` has no old `createTSlatePlugin`/`overrideEditor`/`editor.tf` path, does not delegate to a bridge, preserves inline per-operation rule execution, and focused Core input-rule proof passes.

Verification surface:
Focused Core input-rule tests, Core typecheck, Core lint, and exact source audits for old compatibility names plus temporary migration helper names.

Constraints:
Named-file `plate-next` review. Scope is `packages/core/src/lib/plugins/input-rules/internal/InputRulesPlugin.ts` plus directly relevant Core input-rule tests. No broad Core sweep, no feature-package cleanup, no legacy compatibility aliases.

Boundaries:
Allowed edits: InputRulesPlugin implementation and `packages/core/src/react/utils/inputRules.spec.tsx` proof rows. Out of scope: non-Core packages still using old APIs, full Plate package migration, docs/browser proof.

Blocked condition:
None.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt captured | yes | User asked if `InputRulesPlugin.ts` git diff was good and to repair drift. |
| Plate-next read | yes | `.agents/skills/plate-next/SKILL.md` read. |
| Vision read | yes | `VISION.md`, `docs/vision/plate.md`, `docs/vision/common.md` read. |
| Mode classified | yes | Named Core file review packet, not broad Core sweep. |
| Extracted-file inventory | yes | `git ls-files --others --exclude-standard packages/core/src/lib/plugins/input-rules packages/core/type-tests` -> no rows. |

Work Checklist:
- [x] Compare current `InputRulesPlugin.ts` to `origin/main`.
- [x] Check for bridge delegation or displaced input-rule execution.
- [x] Restore main-style helper names and inline per-operation execution where safe.
- [x] Keep required Plite migration: `createBasePlugin().extendExtension(...)`, `editor.runtime.inputRules`, `editor.read`, and `editor.update`.
- [x] Add runtime proof for `insertBreak` and `insertData`, not only `insertText`.
- [x] Run focused tests, typecheck, lint, and exact source audits.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| InputRulesPlugin drift repair | done | Inline owner execution restored; no bridge/old API audit matches; focused proof green. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/plugins/input-rules/internal/InputRulesPlugin.ts` | 1 | main-parity-cleanup | Core input rules | Required Plite extension migration remains; temporary helper extraction and rename drift removed. | keep |
| `packages/core/src/react/utils/inputRules.spec.tsx` | 0 | justify-new-proof-tooling | Core input rules | Added missing `insertBreak` and `insertData` runtime rows. | keep |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test src/react/utils/inputRules.spec.tsx src/lib/plugins/input-rules src/internal/plugin/resolvePlugin.spec.ts src/internal/plugin/resolvePlugins.spec.tsx` -> 67 pass.
- `pnpm --filter @platejs/core typecheck` -> pass.
- `pnpm --filter @platejs/core lint` -> pass.
- `rg -n "createTSlatePlugin|overrideEditor|executeInsert.*InputRules|insertDataWithInputRules|currentRuntimeBridge|editor\\.meta\\.inputRules|editor\\.tf|editor\\.transforms|plugin\\.transforms" packages/core/src/lib/plugins/input-rules/internal/InputRulesPlugin.ts packages/core/src/internal/plugin packages/core/src/lib/plugins/input-rules -g '*.ts' -g '*.tsx'` -> no matches.
- `rg -n "createSelectionInputRuleContext|isInputRuleTriggerMatch" packages/core/src/lib/plugins/input-rules packages/core/src/internal/plugin -g '*.ts' -g '*.tsx'` -> no matches.

Open risks:
The remaining diff is real Plite migration, not accidental drift: old `overrideEditor`/`tf` cannot stay. Non-Core packages with old APIs are separate migration owners.

Reboot status:
Complete. If reopened, start from `InputRulesPlugin.ts` plus `inputRules.spec.tsx` runtime rows.
