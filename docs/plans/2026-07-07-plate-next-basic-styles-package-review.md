# plate-next basic-styles package review

Objective:
Review and migrate `packages/basic-styles` to the Plite-first Plate v2 shape, then close every package source/spec file at score 100 before moving to the next package.

Plate Next source:
- Prompt: `[$plate-next] next package`.
- Mode: package review.
- Package: `packages/basic-styles`.
- Rule: no next package until all package rows are score 100 or explicitly deferred.
- Boundary: package sources/specs, package manifest, smallest Plite owner gap, and `tooling/scripts/check-core.mjs`.
- Non-goals: no broad Plate migration, no docs/browser work, no compat aliases.

First checkpoint:
- Explicit requirements copied before closure: review the next package one-by-one, preserve type inference, avoid legacy Slate/Plate compatibility sludge, use direct one-shot Plite APIs, add the package to `check:core`, and stop with a package handoff.
- Manifest command: `rg --files packages/basic-styles/src | sort`.
- Expected row count: 26.
- Actual row count: 26.
- Missing row count: 0.
- Extra row count: 0.

Completion threshold:
- Close only when all 26 Basic Styles package rows are score 100, deleted transform owners are accounted for, stale API audits are clean, `check:core` includes Basic Styles, and focused package proof plus expanded `check:core` pass.

Verification surface:
- Package tests, package typecheck with Plite, package lint, package build, stale API audit, manifest count, and expanded `pnpm check:core`.

Constraints:
- Keep Plate as the product layer and Plite as the editor substrate.
- No public compat aliases, old Slate helpers, fake wrappers, bridge dumps, broad `any` casts, or test-only type cheating.
- Prefer direct one-shot Plite methods for single writes/reads.
- Preserve inline inference for plugin tx groups and callback APIs.
- Do not start the next package until this checklist closes.

Boundaries:
- Allowed: `packages/basic-styles`, named Plite node option types, `tooling/scripts/check-core.mjs`, lockfile, and this plan.
- Not touched: broad Plate package migration, docs/browser surfaces, package renames, runtime compatibility bridges.

Blocked condition:
- None. Basic Styles is closed.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | First checkpoint records package target, score gate, no-next-package stop condition, and proof surface. |
| Package manifest initialized | yes | `rg --files packages/basic-styles/src \| sort` produced 26 rows. |
| Scope limited | yes | Edits stayed in Basic Styles, smallest Plite option owner, check-core, lockfile, and plan. |
| Review target recorded | yes | Plate v2 over Plite, no legacy compatibility. |

Work Checklist:
- [x] First checkpoint copied the explicit prompt requirements and success criteria.
- [x] Mode classified as package review.
- [x] Package file checklist generated with one row per package source/spec file.
- [x] Stale Slate/Plate compatibility APIs removed from Basic Styles.
- [x] Plite option type gap patched in the Plite owner.
- [x] Direct one-shot tx groups used for mark and block style writes.
- [x] Package manifest imports direct owners and removes accidental Basic Nodes dependency.
- [x] `check:core` updated to include Basic Styles.
- [x] Package proof passed.
- [x] Expanded Core/Plite proof passed.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Manifest | complete | 26 package source/spec rows, zero missing/extra. |
| Migration | complete | `createBasePlugin` + `extendTx` owner migration, deleted transform owners accounted for. |
| Proof | complete | Focused package proof and `pnpm check:core` passed. |
| Handoff | complete | Changed files, risks, and next safety recorded. |

Package verdict:
- Verdict: closed.
- Confidence: 100.
- Keep / revert / quarantine: keep.
- Reason: package tests, typecheck, lint, build, source audit, and expanded `check:core` pass with Basic Styles included.

Migration decisions:
- `createSlatePlugin` / `createTSlatePlugin`: hard-cut to `createBasePlugin`.
- `extendTransforms`: hard-cut to typed `extendTx`.
- Font mark transforms: use `tx.marks.add(type, value)`, not `tx.marks.set(...)`.
- Block style transforms: inline typed tx groups in owner plugins; no separate one-use transform files.
- `BaseParagraphPlugin` in tests: import from `@platejs/core`; Basic Styles must not depend on Basic Nodes for Core paragraph semantics.
- Plite gap: named `NodeSetNodesOptions` / `NodeUnsetNodesOptions` option types belonged in Plite. Patched in Plite and reused by Basic Styles.

Package file checklist:
- [x] `packages/basic-styles/src/index.ts` - score 100; barrel-only, no drift.
- [x] `packages/basic-styles/src/lib/BaseFontBackgroundColorPlugin.spec.ts` - score 100; parser + typed tx proof.
- [x] `packages/basic-styles/src/lib/BaseFontBackgroundColorPlugin.ts` - score 100; `createBasePlugin`, inferred tx, `tx.marks.add`.
- [x] `packages/basic-styles/src/lib/BaseFontColorPlugin.spec.ts` - score 100; parser + typed tx proof.
- [x] `packages/basic-styles/src/lib/BaseFontColorPlugin.ts` - score 100; `createBasePlugin`, inferred tx, `tx.marks.add`.
- [x] `packages/basic-styles/src/lib/BaseFontFamilyPlugin.spec.ts` - score 100; parser + typed tx proof.
- [x] `packages/basic-styles/src/lib/BaseFontFamilyPlugin.ts` - score 100; `createBasePlugin`, inferred tx, `tx.marks.add`.
- [x] `packages/basic-styles/src/lib/BaseFontSizePlugin.spec.ts` - score 100; parser + typed tx proof.
- [x] `packages/basic-styles/src/lib/BaseFontSizePlugin.ts` - score 100; `createBasePlugin`, inferred tx, `tx.marks.add`.
- [x] `packages/basic-styles/src/lib/BaseFontWeightPlugin.spec.ts` - score 100; parser + typed tx proof.
- [x] `packages/basic-styles/src/lib/BaseFontWeightPlugin.ts` - score 100; `createBasePlugin`, inferred tx, `tx.marks.add`.
- [x] `packages/basic-styles/src/lib/BaseLineHeightPlugin.spec.ts` - score 100; injected block contract + parse + typed tx proof.
- [x] `packages/basic-styles/src/lib/BaseLineHeightPlugin.ts` - score 100; typed `tx.nodes.set/unset` owner, no transform helper.
- [x] `packages/basic-styles/src/lib/BaseTextAlignPlugin.spec.ts` - score 100; injected block contract + parse + typed tx proof.
- [x] `packages/basic-styles/src/lib/BaseTextAlignPlugin.ts` - score 100; typed `tx.nodes.set/unset` owner, no transform helper.
- [x] `packages/basic-styles/src/lib/BaseTextIndentPlugin.spec.ts` - score 100; option formatting + typed tx proof.
- [x] `packages/basic-styles/src/lib/BaseTextIndentPlugin.ts` - score 100; real option config, typed tx, no empty config or cast.
- [x] `packages/basic-styles/src/lib/index.ts` - score 100; exports current owner plugins/utils.
- [x] `packages/basic-styles/src/lib/utils/index.ts` - score 100; utility barrel only.
- [x] `packages/basic-styles/src/lib/utils/toUnitLess.spec.ts` - score 100; unchanged utility proof.
- [x] `packages/basic-styles/src/lib/utils/toUnitLess.ts` - score 100; unchanged utility.
- [x] `packages/basic-styles/src/react/FontPlugin.tsx` - score 100; imports `toPlatePlugin` from `@platejs/core/react`.
- [x] `packages/basic-styles/src/react/LineHeightPlugin.tsx` - score 100; imports `toPlatePlugin` from `@platejs/core/react`.
- [x] `packages/basic-styles/src/react/TextAlignPlugin.tsx` - score 100; imports `toPlatePlugin` from `@platejs/core/react`.
- [x] `packages/basic-styles/src/react/TextIndentPlugin.tsx` - score 100; imports `toPlatePlugin` from `@platejs/core/react`.
- [x] `packages/basic-styles/src/react/index.ts` - score 100; barrel-only, no drift.

Deleted origin-main transform owners:
- [x] `packages/basic-styles/src/lib/transforms/setAlign.ts` - merged into `BaseTextAlignPlugin.ts`; one-use owner, no public alias kept.
- [x] `packages/basic-styles/src/lib/transforms/setAlign.spec.tsx` - covered by `BaseTextAlignPlugin.spec.ts`.
- [x] `packages/basic-styles/src/lib/transforms/setLineHeight.ts` - merged into `BaseLineHeightPlugin.ts`; one-use owner, no public alias kept.
- [x] `packages/basic-styles/src/lib/transforms/setLineHeight.spec.tsx` - covered by `BaseLineHeightPlugin.spec.ts`.
- [x] `packages/basic-styles/src/lib/transforms/index.ts` - deleted with the transform folder.

Related sweeps:
- [x] Package stale API audit:
  `rg -n "createSlate|createTSlate|createSlatePlugin|SlateEditor|editor\\.tf|extendTransforms|getTransforms|from 'platejs|from \\\"platejs| as any|: any|\\bany\\b|setLineHeight|setAlign|BaseParagraphPlugin.*basic-nodes|marks\\.set\\(" packages/basic-styles/src packages/basic-styles/package.json --glob '*.{ts,tsx,json}'`
  returned no matches.
- [x] Package manifest audit: removed `platejs` and accidental `@platejs/basic-nodes`; package now depends on direct owners.
- [x] `check:core` coverage: added Basic Styles typecheck, lint, and tests to `tooling/scripts/check-core.mjs`.

Changed files:
- `packages/basic-styles/package.json`
- `packages/basic-styles/src/lib/BaseFontBackgroundColorPlugin.ts`
- `packages/basic-styles/src/lib/BaseFontBackgroundColorPlugin.spec.ts`
- `packages/basic-styles/src/lib/BaseFontColorPlugin.ts`
- `packages/basic-styles/src/lib/BaseFontColorPlugin.spec.ts`
- `packages/basic-styles/src/lib/BaseFontFamilyPlugin.ts`
- `packages/basic-styles/src/lib/BaseFontFamilyPlugin.spec.ts`
- `packages/basic-styles/src/lib/BaseFontSizePlugin.ts`
- `packages/basic-styles/src/lib/BaseFontSizePlugin.spec.ts`
- `packages/basic-styles/src/lib/BaseFontWeightPlugin.ts`
- `packages/basic-styles/src/lib/BaseFontWeightPlugin.spec.ts`
- `packages/basic-styles/src/lib/BaseLineHeightPlugin.ts`
- `packages/basic-styles/src/lib/BaseLineHeightPlugin.spec.ts`
- `packages/basic-styles/src/lib/BaseTextAlignPlugin.ts`
- `packages/basic-styles/src/lib/BaseTextAlignPlugin.spec.ts`
- `packages/basic-styles/src/lib/BaseTextIndentPlugin.ts`
- `packages/basic-styles/src/lib/BaseTextIndentPlugin.spec.ts`
- `packages/basic-styles/src/react/FontPlugin.tsx`
- `packages/basic-styles/src/react/LineHeightPlugin.tsx`
- `packages/basic-styles/src/react/TextAlignPlugin.tsx`
- `packages/basic-styles/src/react/TextIndentPlugin.tsx`
- `packages/plite/src/interfaces/editor.ts`
- `packages/plite/src/interfaces/transforms/node.ts`
- `tooling/scripts/check-core.mjs`
- `pnpm-lock.yaml`
- this plan

Verification:
- [x] `pnpm install`
- [x] `pnpm --filter @platejs/basic-styles test` - 22 pass.
- [x] `pnpm turbo typecheck --filter=./packages/basic-styles --filter=./packages/plite` - pass.
- [x] `pnpm --filter @platejs/basic-styles lint` - pass.
- [x] `pnpm --filter @platejs/basic-styles build` - pass.
- [x] `pnpm --filter @platejs/basic-styles brl` - pass.
- [x] `pnpm check:core` - pass with Core, Plite, Utils, Basic Nodes, and Basic Styles.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Every package row score 100 | yes | 26/26 rows checked, no deferred rows. |
| Deleted owners accounted | yes | `setAlign`, `setLineHeight`, specs, and transform barrel mapped to owner plugin specs. |
| No stale API strings | yes | Stale API audit returned no matches. |
| Core-adjacent gate updated | yes | `tooling/scripts/check-core.mjs` includes Basic Styles typecheck, lint, and tests. |
| Proof green | yes | Package proof and `pnpm check:core` passed. |

Verification evidence:
- Fresh final evidence recorded on 2026-07-07: `pnpm --filter @platejs/basic-styles test`, `pnpm turbo typecheck --filter=./packages/basic-styles --filter=./packages/plite`, `pnpm --filter @platejs/basic-styles lint`, `pnpm --filter @platejs/basic-styles build`, `pnpm --filter @platejs/basic-styles brl`, stale API audit, and `pnpm check:core` all passed.

Reboot status:
- Current as of this run. Resume from the next package only after the user asks or redirects.

Open risks:
- None.

Needs attention:
- None for Basic Styles.

Next safety:
- Next best package: continue foundational packages after Basic Styles. Use the same package-review gate and update `check:core` only when the package is Core-adjacent.

Autogoal close:
- Completion checker is the final command for this plan.
