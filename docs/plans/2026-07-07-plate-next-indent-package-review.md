# plate-next indent package review

Objective:
Review and migrate `packages/indent` to the Plite-first Plate v2 shape, then close every package source/spec file at score 100 before moving to the next package.

Goal plan:
docs/plans/2026-07-07-plate-next-indent-package-review.md

Template:
docs/plans/templates/plate-next.md

Plate Next source:
- Prompt: `[$plate-next] next package`.
- Mode: package review.
- Package chosen: `packages/indent`.
- Reason: foundational package after Core, Utils, Basic Nodes, and Basic Styles; still uses `platejs` facade, `createTSlatePlugin`, `SlateEditor`, and `editor.tf`.
- Review target: best Plate v2 migration on top of Plite, no legacy compatibility.
- Stop condition: do not start the next package until all package source/spec rows are score 100 or explicitly deferred for user review.
- Final handoff: changed list, file checklist summary, verdict matrix, proof commands, old-name audit, Plite/Plate gaps, and next package block.

First checkpoint:
- Explicit requirements copied before implementation: next package autopick, package-by-package review, file checklist, score 100 gate, no compat sludge, preserve inline inference, update `check:core` if Core-adjacent, focused proof before closeout.
- Manifest command: `rg --files packages/indent/src | sort`.
- Expected source/spec row count: 15.
- Actual source/spec row count: 15.
- Missing row count: 0.
- Extra row count: 0.
- Package metadata reviewed separately: `packages/indent/package.json`.

Completion threshold:
- Close only when all 15 Indent source/spec rows are score 100, package metadata imports direct owners, stale API audit is clean, focused package proof passes, and either `check:core` includes Indent or this plan records why it should stay outside `check:core`.

Verification surface:
- Package tests, package typecheck, package lint, package build, barrels when exports change, stale API audit, source manifest count, and `check:core` if Indent becomes Core-adjacent.

Constraints:
- Keep Plate as product layer and Plite as editor substrate.
- No public compat aliases, old Slate helpers, fake wrappers, bridge dumps, broad `any` casts, or test-only type cheating.
- Prefer direct one-shot Plite methods for single writes/reads.
- Preserve inline inference for plugin tx groups and callback APIs.
- Transform-backed callbacks must use active `tx` when applicable.
- Do not start the next package until this checklist closes.

Boundaries:
- Allowed: `packages/indent`, smallest Plite/Core owner needed for a real blocker, `tooling/scripts/check-core.mjs` if Indent belongs in the shared gate, lockfile, and this plan.
- Not touched: broad Plate package migration, docs/browser surfaces, package renames, runtime compatibility bridges.

Blocked condition:
- None at start. If clean migration needs missing Plite substrate, record the exact Plite gap before local workaround.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | This plan records package target, score gate, no-next-package stop condition, and proof surface. |
| `plate-next` skill read | yes | `/Users/zbeyens/git/plate-2/.agents/skills/plate-next/SKILL.md` read before work. |
| Vision read | yes | `VISION.md`, `docs/vision/plate.md`, and `docs/vision/common.md` read before package edits. |
| Package manifest initialized | yes | `rg --files packages/indent/src \| sort` produced 15 rows. |
| Scope limited | yes | Scope frozen to Indent plus smallest owner gaps. |
| Review target recorded | yes | Plate v2 over Plite, no legacy compatibility. |

Work Checklist:
- [x] First checkpoint copied the explicit prompt requirements and success criteria.
- [x] Mode classified as package review.
- [x] Package file checklist generated with one row per package source/spec file.
- [x] Every package row is checked at score 100 or explicitly hard-cut with proof.
- [x] Stale Slate/Plate compatibility APIs removed from Indent.
- [x] Package metadata imports direct owners and removes `platejs` facade dependency where source no longer uses it.
- [x] Focused package proof passed.
- [x] `check:core` decision recorded and applied.
- [x] Final stale API audit is clean.
- [x] Autogoal completion checker passes.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Manifest | complete | 15 package source/spec rows, zero missing/extra. |
| Migration | complete | `BaseIndentPlugin` owns tx group + normalizer; thin transform wrappers were hard-cut. |
| Proof | complete | Focused package gates and `pnpm check:core` passed. |
| Handoff | complete | Checklist, verdicts, proof, and next package block recorded. |

Initial package file checklist:
- [x] `packages/indent/src/index.ts` - score 100; verdict `main-parity-cleanup`; owner Indent package barrel; evidence `pnpm --filter @platejs/indent brl`, `pnpm check:core`; next none.
- [x] `packages/indent/src/lib/BaseIndentPlugin.spec.ts` - score 100; verdict `main-parity-cleanup`; owner Indent package tests; evidence tx group, tab/untab, and injected prop contract tests pass; next none.
- [x] `packages/indent/src/lib/BaseIndentPlugin.ts` - score 100; verdict `main-parity-cleanup`; owner Indent base plugin; evidence old `withIndent` behavior folded into plugin tx group + normalizer with block-only matching; next none.
- [x] `packages/indent/src/lib/IndentRuntimePlugin.spec.ts` - score 100; verdict `justify-new-proof-tooling`; owner Indent runtime proof; evidence normalization cap/unset runtime tests pass; next none.
- [x] `packages/indent/src/lib/index.ts` - score 100; verdict `hard-cut`; owner Indent package barrel; evidence transform wrapper export removed and `brl` passed; next none.
- [x] `packages/indent/src/lib/transforms/indent.ts` - score 100; verdict `hard-cut`; owner replaced by `editor.update.indent.increase`; evidence stale API audit clean; next none.
- [x] `packages/indent/src/lib/transforms/index.ts` - score 100; verdict `hard-cut`; owner replaced by `BaseIndentPlugin` tx group export; evidence source manifest has no transform files; next none.
- [x] `packages/indent/src/lib/transforms/outdent.ts` - score 100; verdict `hard-cut`; owner replaced by `editor.update.indent.decrease`; evidence stale API audit clean; next none.
- [x] `packages/indent/src/lib/transforms/setIndent.spec.ts` - score 100; verdict `hard-cut`; owner replaced by `BaseIndentPlugin.spec.ts` tx group tests; evidence package tests pass; next none.
- [x] `packages/indent/src/lib/transforms/setIndent.ts` - score 100; verdict `hard-cut`; owner replaced by `editor.update.indent.set`; evidence package tests pass; next none.
- [x] `packages/indent/src/react/IndentPlugin.tsx` - score 100; verdict `main-parity-cleanup`; owner React adapter; evidence direct `@platejs/core/react` import and package build pass; next none.
- [x] `packages/indent/src/react/hooks/index.ts` - score 100; verdict `main-parity-cleanup`; owner React hooks barrel; evidence `brl` pass; next none.
- [x] `packages/indent/src/react/hooks/useIndentButton.ts` - score 100; verdict `main-parity-cleanup`; owner Indent hook; evidence typed editor ref uses `InferPluginConfig<typeof BaseIndentPlugin>` and typecheck passes; next none.
- [x] `packages/indent/src/react/hooks/useOutdentButton.ts` - score 100; verdict `main-parity-cleanup`; owner Indent hook; evidence typed editor ref uses `InferPluginConfig<typeof BaseIndentPlugin>` and typecheck passes; next none.
- [x] `packages/indent/src/react/index.ts` - score 100; verdict `main-parity-cleanup`; owner React barrel; evidence `brl` pass; next none.

Initial stale API audit:
- `rg -n "from ['\\\"]platejs|from ['\\\"]@platejs|createSlate|createTSlate|createSlatePlugin|createBasePlugin|extendTransforms|extendTx|editor\\.tf|editor\\.update|editor\\.read|getTransforms|SlateEditor|BasePlugin<|PlatePlugin<| as any|: any|\\bany\\b|useNodePath|useEditorSelector|useEditorValue|useElementSelector|useEditorReadOnly" packages/indent --glob '*.{ts,tsx,json}' --glob '!**/dist/**'`
- Findings: `platejs` facade imports, `createTSlatePlugin`, `SlateEditor`, `editor.tf`, direct callback `editor.update/read`, local `any` in specs.

Package metadata:
- `packages/indent/package.json` imports direct owners only.
- Removed `platejs` dependency because no package source imports the user-facing umbrella.
- Added direct runtime dependencies: `@platejs/core`, `@platejs/plite`, `@platejs/utils`.
- React remains peer dependency because the package exposes React hooks/plugin entrypoint.
- `pnpm install` was run after package manifest changes.

Related sweeps:
- Stale API audit:
  `rg -n "from ['\\\"]platejs|createTSlatePlugin|SlateEditor|editor\\.tf|withIndent|setIndent\\(|\\bindent\\(|\\boutdent\\(" packages/indent/src packages/indent/package.json --glob '!**/dist/**'`
  - match count: 0.
  - patched count: all old Indent package matches removed.
  - deferred count: 0.
- Final active source manifest:
  `rg --files packages/indent/src | sort`
  - active row count: 10.
  - hard-cut wrapper row count: 5.
- Direct dependency audit:
  `rg -n "@platejs/(core|plite|utils)|react-compiler-runtime|['\\\"]platejs['\\\"]" packages/indent/src packages/indent/package.json --glob '!**/dist/**'`
  - source imports match direct owner packages.
  - no `platejs` facade import remains.
- Shared gate owner:
  `tooling/scripts/check-core.mjs` now includes Indent typecheck, lint, and package tests.

Current verdict:
- verdict: keep.
- confidence: 100.
- next owner: plate-next.
- keep / revert / quarantine call: keep.
- reason: Indent now has direct package imports, Plite tx group commands, normalizer proof, stale API audit clean, and `check:core` coverage.

Verification evidence:
- `pnpm install` - passed after package manifest changes.
- `pnpm --filter @platejs/indent test` - 5 pass.
- `pnpm turbo typecheck --filter=./packages/indent` - passed.
- `pnpm --filter @platejs/indent lint` - passed.
- `pnpm --filter @platejs/indent build` - passed.
- `pnpm --filter @platejs/indent brl` - passed.
- `node --check tooling/scripts/check-core.mjs` - passed.
- `pnpm check:core` - passed with Indent included.

Reboot status:
- Closed. The next `plate-next next package` can pick the next package.

Open risks:
- None for Indent.

Final handoff packet:
- Changed files:
  - `packages/indent/package.json`
  - `packages/indent/src/lib/BaseIndentPlugin.ts`
  - `packages/indent/src/lib/BaseIndentPlugin.spec.ts`
  - `packages/indent/src/lib/IndentRuntimePlugin.spec.ts`
  - `packages/indent/src/lib/index.ts`
  - `packages/indent/src/lib/transforms/indent.ts`
  - `packages/indent/src/lib/transforms/index.ts`
  - `packages/indent/src/lib/transforms/outdent.ts`
  - `packages/indent/src/lib/transforms/setIndent.spec.ts`
  - `packages/indent/src/lib/transforms/setIndent.ts`
  - `packages/indent/src/react/IndentPlugin.tsx`
  - `packages/indent/src/react/hooks/useIndentButton.ts`
  - `packages/indent/src/react/hooks/useOutdentButton.ts`
  - `tooling/scripts/check-core.mjs`
- Verdict matrix:
  - `main-parity-cleanup`: active plugin, React adapter, hooks, barrels, tests.
  - `hard-cut`: thin transform helper exports and their wrapper spec.
  - `justify-new-proof-tooling`: runtime normalizer spec.
  - `move-to-plite`: none.
  - `Plite gap`: none.
  - `Plate gap`: none.
  - `private-bridge`: none.
  - `defer-with-owner`: none.
- Needs user review:
  - The only taste call is the hard-cut of public transform helper files in favor of `editor.update.indent.*`; this matches the no-compat direction.
- Next package block:
  - Indent is closed. Next package may start only with a new package checklist.
