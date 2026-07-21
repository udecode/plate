# Plate Next Strict Bridge Repair Summary

## Scope

- Repaired the original `42` rows from `docs/plans/artifacts/2026-06-28-plate-next-strict-bridge-rescore/strict-core-score-ledger.tsv` with `confidence_score_100 < 75`.
- Current manifest counts used for this closure:
  - `packages/core/src`: `385` TypeScript files
  - `packages/core/type-tests`: `5` TypeScript files
  - `packages/plite/src`: `174` TypeScript files
  - scoped total: `564`
- Final repair ledger: `strict-repair-ledger.tsv`

## Closure

- Unresolved rows below `75`: `0`
- Forbidden bridge route: deleted
- Exact forbidden-name audit: zero matches for `currentRuntimeBridge`, `getCurrentRuntimeCommands`, `installCurrentRuntime`, `editor.tf`, `plugin.transforms`, `extendTransforms`, `getTransforms`, and `getPluginApi`.
- Remaining low-confidence-adjacent item: `packages/core/src/internal/editor/runtimeTxExtensions.ts` is intentionally kept as the small Plate tx-group-to-Plite-extension boundary, not a product-logic bridge. It is scored `85`, capped away from `100` because it is still private adapter code.

## Proof

- `pnpm --filter @platejs/core exec bun test src/lib/plugins/input-rules/createTextSubstitutionInputRule.spec.ts src/lib/plugins/node-id/NodeIdPlugin.spec.tsx src/lib/plugins/affinity/AffinityPlugin.spec.ts src/lib/plugins/plite-extension/PliteExtensionPlugin.spec.tsx src/react/plugins/PliteReactExtensionPlugin.spec.tsx src/lib/editor/extendBaseEditor.spec.ts src/lib/plugin/createBasePlugin.spec.ts src/react/plugin/createPlatePlugin.spec.ts`
  - `101 pass`, `0 fail`
- `pnpm check:core`
  - Core + Plite typecheck pass
  - Core spec typecheck pass
  - Core type contracts pass
  - Core lint pass
  - Plite lint pass
  - Core tests: `117` spec files, all batches pass
  - Plite tests: `1008 pass`, `85 skip`, `0 fail`

## Main-Parity Notes

- Restored Core plugin order to match main shape: `InputRulesPlugin`, `OverridePlugin`, `ParserPlugin`.
- Did not rename established owners.
- Did not create a replacement bridge.
- Moved behavior back to existing owners:
  - `InputRulesPlugin`
  - `NodeIdPlugin`
  - `AffinityPlugin`
  - `PliteExtensionPlugin`
  - `PliteReactExtensionPlugin`
