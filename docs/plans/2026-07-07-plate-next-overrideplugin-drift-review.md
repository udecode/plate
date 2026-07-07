# plate-next OverridePlugin drift review

Objective:
Review `packages/core/src/lib/plugins/override/OverridePlugin.ts` for drift against `origin/main` owner behavior and fix only real drift.

Completion threshold:
- [x] Current file read and compared to `origin/main` owner files.
- [x] Drift score recorded.
- [x] Real drift fixed or explicitly deferred.
- [x] Focused proof and `check:core` pass.
- [x] Final handoff can state whether the file is clean.

Verification surface:
- current `packages/core/src/lib/plugins/override/OverridePlugin.ts`
- `origin/main:packages/core/src/lib/plugins/override/OverridePlugin.ts`
- `origin/main:packages/core/src/lib/plugins/override/withBreakRules.ts`
- `origin/main:packages/core/src/lib/plugins/override/withDeleteRules.ts`
- `origin/main:packages/core/src/lib/plugins/override/withMergeRules.ts`
- `origin/main:packages/core/src/lib/plugins/override/withNormalizeRules.ts`
- focused Core and Basic Nodes tests
- `pnpm check:core`

Constraints:
- Use `origin/main` as evidence, not as final API target.
- Do not reintroduce split `with*Rules` files; the user accepted inline owner shape.
- No compatibility shims, bridges, `editor.tf`, `as any`, or `as never`.
- Keep scope to the override owner unless a direct bug requires a related sweep.

Boundaries:
- In scope: `OverridePlugin.ts`, override owner proof, this plan.
- Out of scope: broad Core package migration, naming pass, docs/browser proof.

Blocked condition:
- None hit. If a missing Plite/Plate primitive had been needed, this would stop for `plite-plan` or `plate-plan`.

First checkpoint:
- [x] Target: `packages/core/src/lib/plugins/override/OverridePlugin.ts`.
- [x] Skill: `plate-next` named-file review mode.
- [x] Scope: one file plus directly related override owner proof.
- [x] Stop condition: stop if a Plite/Plate API gap is found.
- [x] Deliverables: verdict, score, gaps, fixes, proof.

Review result:
- [x] Read current `OverridePlugin.ts`.
- [x] Compared with `origin/main:packages/core/src/lib/plugins/override/OverridePlugin.ts`.
- [x] Compared with old owner helpers: `withBreakRules.ts`, `withDeleteRules.ts`, `withMergeRules.ts`, `withNormalizeRules.ts`.
- [x] Audited smells: `as any`, `as never`, `defineEditorExtension`, `editor.tf`, helper split leftovers, runtime bridge names, one-line callback boilerplate.
- [x] Ran focused proof.
- [x] Ran `pnpm check:core`.

Work Checklist:
- [x] Read `plate-next` guidance.
- [x] Create/update autogoal plan.
- [x] Compare current implementation to main owner evidence.
- [x] Identify partial-context `rules.match` drift.
- [x] Patch drift with `getEditorPlugin(editor, plugin)`.
- [x] Remove stale casts.
- [x] Run focused proof.
- [x] Run `pnpm check:core`.
- [x] Record final verdict.

Finding:
- There was real drift: `rules.match` was called with a partial handcrafted context hidden behind `as never`.
- Main passed full plugin context via `...ctx`; the Plite migration must pass the same source-owned context through `getEditorPlugin(editor, plugin)`.
- Two stale casts were also removed: `state.root(root as never)` and `editor.read.text.string(path as never)`.
- Operation replay casts were replaced with `satisfies Operation`.

Changed files:
- `packages/core/src/lib/plugins/override/OverridePlugin.ts`
- `docs/plans/2026-07-07-plate-next-overrideplugin-drift-review.md`

Review matrix:
| Path / API | Score | Verdict | Evidence | Next |
|---|---:|---|---|---|
| `OverridePlugin.ts` | 100 | clean after fix | full `rules.match` context restored, no `as any`/`as never`, Plite-native extension owner retained | keep |
| split `with*Rules` helpers | 100 | intentionally deleted | user accepted inline owner shape; zero references remain | keep deleted |
| merge operation replay | 100 | clean enough | replay operations are checked with `satisfies Operation` | keep |

Gap ledger:
| Gap type | Decision |
|---|---|
| Plite gap | none found |
| Plate gap | none found |

Related sweep:
| Query / method | Result |
|---|---|
| `rg "as any|as never|defineEditorExtension|editor.update\\(|withBreakRules|withDeleteRules|withMergeRules|withNormalizeRules|currentRuntimeBridge|RuntimeBridge|editor.tf|plugin.transforms|extendTransforms" packages/core/src/lib/plugins/override/...` | no matches |
| override directory file audit | only `OverridePlugin.ts`, `OverridePlugin.spec.tsx`, `index.ts` |

Verification:
- `pnpm --filter @platejs/core exec tsc --noEmit --pretty false` -> pass
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/override/OverridePlugin.spec.tsx src/lib/editor/withPlite.spec.ts` -> 30 pass
- `pnpm --filter @platejs/basic-nodes exec bun test src/lib/BaseBlockquotePlugin.spec.ts` -> 7 pass
- `pnpm check:core` -> pass

Phase / pass table:
| Phase | Status | Evidence | Next |
|---|---|---|---|
| Source review | complete | main owner files and current file compared | none |
| Drift fix | complete | full `rules.match` context restored | none |
| Proof | complete | focused tests and `pnpm check:core` pass | none |

Verification evidence:
- Fresh final evidence: `pnpm check:core` passed after the patch.
- Fresh final evidence: override smell audit returned no matches.
- Fresh final evidence: override directory contains only `OverridePlugin.ts`, `OverridePlugin.spec.tsx`, and `index.ts`.

Reboot status:
| Where am I? | Where am I going? | What is the goal? | What learned? | What done? |
|---|---|---|---|---|
| done | final handoff | verify no drift in `OverridePlugin.ts` | partial `rules.match` context was real drift | fixed and proved |

Open risks:
- None for this file after current accepted inline shape.

Needs attention:
- None. The only taste tradeoff is accepted: `OverridePlugin.ts` is larger because the split `with*Rules` helpers were inlined.

Final verdict:
After the fix, I would call `OverridePlugin.ts` no-drift for the current accepted shape.
