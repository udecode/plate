# Normalization Usage Ledger

Scope command:

```bash
rg -n "(?:editor\\.tf\\.normalize|getCurrentRuntimeTransforms\\([^)]*\\)\\.normalize|(?:tx|editor\\.update|editor)\\.normalize|getEditorTransformRegistry\\([^)]*\\)\\.normalize)\\(" packages --glob '*.{ts,tsx,mts,cts}' --glob '!**/dist/**'
```

Initial calls: 58.

Final calls: 55 across 30 files.

Verdicts: 46 `explicit-normalizer-test`, 4 `lifecycle-option`, and 5
`semantic-dirty-path`.

No Plate feature package retains an unexplained full-root normalization call.

## Cut Or Narrowed

| Path | Initial behavior | Verdict | Evidence |
|---|---|---|---|
| `packages/date/src/lib/transforms/insertDate.ts` | Bare explicit full-root pass after inserting a date and spacer | `cut` | Removing it changed only physical adjacent-text grouping; Date package is 24/24 green with the real spacer/selection behavior intact. |
| `packages/suggestion/src/lib/transforms/insertFragmentSuggestion.ts` | Full-root pass after fragment insertion | `cut` | Suggestion package stays 101/101 green without it. |
| `packages/suggestion/src/lib/withSuggestion.ts` | Full-root pass in insert-text middleware | `cut` | Suggestion package stays 101/101 green; the owning insert transform handles the only path that needs local canonicalization. |
| `packages/suggestion/src/lib/transforms/acceptSuggestion.ts` | Full-root pass | `semantic-dirty-path` | Removing all explicit passes produced accept/reject leaf and stale-marker failures; `{ force: false }` restores 101/101 by normalizing only touched paths. |
| `packages/suggestion/src/lib/transforms/rejectSuggestion.ts` | Full-root pass | `semantic-dirty-path` | Dirty-path pass merges touched leaves and lets the suggestion normalizer remove stale base markers. |
| `packages/suggestion/src/lib/transforms/insertTextSuggestion.ts` | Full-root pass | `semantic-dirty-path` | Removing this call fragments repeated typing into identical suggestion leaves; `{ force: false }` preserves one suggestion segment. |
| `packages/suggestion/src/lib/transforms/deleteSuggestion.ts` | Full-root pass | `semantic-dirty-path` | Dirty-path pass preserves line-break deletion and adjacent-leaf cleanup; package remains 101/101 green. |
| `packages/plite/src/transforms-node/unwrap-nodes.ts` | Internal bare normalize, implicitly full-root, inside an unwrap loop | `semantic-dirty-path` | `{ force: false }` keeps all 29 focused unwrap fixtures green and avoids a root scan per unwrapped node. |

## Retained Calls

| Calls | Path | Verdict | Owner / invariant |
|---:|---|---|---|
| 1 | `packages/core/src/lib/editor/withPlite.ts` | `lifecycle-option` | `shouldNormalizeEditor` explicitly promises a full initial-value normalization pass. |
| 1 | `packages/plite/src/core/editor-lifecycle-api.ts` | `lifecycle-option` | Public `editor.update.normalize` forwards caller-supplied options into the active transaction. |
| 1 | `packages/plite/src/interfaces/editor.ts` | `lifecycle-option` | Low-level editor static API forwards explicit normalization options to the transform registry. |
| 1 | `packages/plite/src/core/public-state.ts` | `lifecycle-option` | Transaction closeout runs implicit operation-aware normalization with `explicit: false`. |
| 1 | `packages/plite/src/transforms-node/unwrap-nodes.ts` | `semantic-dirty-path` | The unwrap loop needs touched-path canonicalization before processing subsequent live refs. |
| 1 | `packages/suggestion/src/lib/transforms/acceptSuggestion.ts` | `semantic-dirty-path` | Canonicalize touched suggestion leaves and cleanup after acceptance. |
| 1 | `packages/suggestion/src/lib/transforms/rejectSuggestion.ts` | `semantic-dirty-path` | Canonicalize touched leaves and remove stale suggestion markers after rejection. |
| 1 | `packages/suggestion/src/lib/transforms/insertTextSuggestion.ts` | `semantic-dirty-path` | Prevent one identical suggestion leaf per typed segment. |
| 1 | `packages/suggestion/src/lib/transforms/deleteSuggestion.ts` | `semantic-dirty-path` | Settle touched deletion/line-break suggestion paths. |
| 2 | `packages/basic-nodes/src/lib/BaseBlockquotePlugin.spec.ts` | `explicit-normalizer-test` | Invalid blockquote fixtures explicitly exercise the blockquote normalizer. |
| 1 | `packages/code-block/src/lib/withNormalizeCodeBlock.spec.tsx` | `explicit-normalizer-test` | Invalid code-block fixture explicitly exercises its normalizer. |
| 1 | `packages/comment/src/lib/BaseCommentPlugin.spec.ts` | `explicit-normalizer-test` | Stray comment flags are an intentionally invalid fixture. |
| 2 | `packages/indent/src/lib/IndentRuntimePlugin.spec.ts` | `explicit-normalizer-test` | Explicitly tests indent clamping and invalid-target cleanup. |
| 4 | `packages/layout/src/lib/ColumnRuntimePlugin.spec.ts` | `explicit-normalizer-test` | Invalid column structures explicitly exercise the column normalizer. |
| 2 | `packages/link/src/lib/BaseLinkRuntimePlugin.spec.ts` | `explicit-normalizer-test` | Invalid link placement explicitly exercises link normalization. |
| 1 | `packages/link/src/lib/LinkRules.spec.tsx` | `explicit-normalizer-test` | Explicit post-edit link-rule fixture normalization. |
| 1 | `packages/link/src/lib/withLink.spec.tsx` | `explicit-normalizer-test` | Explicit zero-width link normalization; `force: true` is now stated. |
| 1 | `packages/platejs/src/features/list/src/lib/withNormalizeList.spec.tsx` | `explicit-normalizer-test` | List normalizer fixture helper. |
| 1 | `packages/list/src/lib/normalizers/normalizeListStart.slow.tsx` | `explicit-normalizer-test` | Slow idempotence fixture verifies an already-normalized tree stays referentially stable. |
| 1 | `packages/plite/test/generic-extension-namespace-contract.ts` | `explicit-normalizer-test` | Compile-time rejection proves normalizer transactions cannot recursively normalize. |
| 1 | `packages/plite/test/transforms/normalization/set_node.tsx` | `explicit-normalizer-test` | Low-level normalization fixture explicitly invokes the static editor surface. |
| 3 | `packages/suggestion/src/lib/withSuggestion.spec.tsx` | `explicit-normalizer-test` | Invalid suggestion metadata fixtures explicitly exercise the suggestion normalizer. |
| 7 | `packages/table/src/lib/withNormalizeTable.spec.tsx` | `explicit-normalizer-test` | Invalid table fixtures explicitly exercise table normalization. |
| 1 | `packages/tag/src/react/TagPlugin.spec.tsx` | `explicit-normalizer-test` | Duplicate-tag fixture explicitly exercises tag normalization. |
| 1 | `packages/utils/src/lib/plugins/__tests__/normalizeRoot.ts` | `explicit-normalizer-test` | Shared invalid-root fixture helper; callback is grouped because empty value replacement and normalization are one setup action. |
| 3 | `packages/utils/src/lib/plugins/normalize-types/NormalizeTypesRuntimePlugin.spec.ts` | `explicit-normalizer-test` | Explicit path/type normalization fixtures. |
| 4 | `packages/utils/src/lib/plugins/single-block/SingleBlockPlugin.spec.tsx` | `explicit-normalizer-test` | Explicit multi-block-to-single-block fixtures. |
| 2 | `packages/utils/src/lib/plugins/single-block/SingleBlockRuntimePlugin.spec.ts` | `explicit-normalizer-test` | Runtime single-block and single-line invalid fixtures. |
| 3 | `packages/utils/src/lib/plugins/single-block/SingleLinePlugin.spec.tsx` | `explicit-normalizer-test` | Explicit block merge and line-break filtering fixtures. |
| 4 | `packages/utils/src/lib/plugins/trailing-block/TrailingBlockRuntimePlugin.spec.ts` | `explicit-normalizer-test` | Explicit missing/invalid trailing-block fixtures. |

## API Shape Cleanup

- Eight single-operation test callbacks now use
  `editor.update.normalize(...)` directly.
- Ten legacy test calls no longer use `editor.tf.normalize` or the runtime
  transform bridge for normalization.
- Final audit has zero `editor.tf.normalize(...)` and zero
  `getCurrentRuntimeTransforms(editor).normalize(...)` calls.

## Proof Limits

Date, Suggestion, and focused Plite unwrap behavior are green. Full tests for
Layout, Tag, Link, Legacy list model, List, and Table remain blocked by their
existing unfinished Plate migration: removed `createSlate*` exports, deleted
runtime bridge modules, and other old API references fail before the changed
normalizer fixtures execute. No reported error points at the replacement
`editor.update.normalize(...)` calls.
