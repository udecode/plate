# CPU Profile

| Duration | Samples | Interval | Functions |
|----------|---------|----------|----------|
| 212.17s | 166449 | 1.0ms | 2009 |

**Top 10:** `nodeAtPath` 19.7%, `map` 7.5%, `freeze` 6.0%, `gc` 5.7%, `isFrozen` 5.6%, `(anonymous)` 5.2%, `(anonymous)` 5.0%, `getOwnPropertyDescriptor` 4.2%, `pathKey` 3.4%, `pathKey` 2.3%

## Hot Functions (Self Time)

| Self% | Self | Total% | Total | Function | Location |
|------:|-----:|-------:|------:|----------|----------|
| 19.7% | 41.92s | 19.7% | 41.92s | `nodeAtPath` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:261` |
| 7.5% | 15.94s | 100.0% | 242.52s | `map` | `[native code]` |
| 6.0% | 12.80s | 6.0% | 12.80s | `freeze` | `[native code]` |
| 5.7% | 12.14s | 5.7% | 12.14s | `gc` | `[native code]` |
| 5.6% | 11.99s | 5.6% | 11.99s | `isFrozen` | `[native code]` |
| 5.2% | 11.06s | 10.9% | 23.26s | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1164` |
| 5.0% | 10.71s | 5.0% | 10.74s | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1174` |
| 4.2% | 9.09s | 4.2% | 9.09s | `getOwnPropertyDescriptor` | `[native code]` |
| 3.4% | 7.38s | 3.4% | 7.38s | `pathKey` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:109` |
| 2.3% | 4.92s | 2.3% | 4.92s | `pathKey` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:112` |
| 2.0% | 4.31s | 2.0% | 4.31s | `getEditorJsonArrayItems` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:54` |
| 1.8% | 3.93s | 29.4% | 62.54s | `every` | `[native code]` |
| 1.8% | 3.91s | 1.8% | 3.91s | `get` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts:639` |
| 1.7% | 3.81s | 1.7% | 3.81s | `get` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts:612` |
| 1.2% | 2.74s | 1.2% | 2.74s | `arrayIteratorNextHelper` | `[native code]` |
| 1.1% | 2.41s | 1.1% | 2.41s | `entries` | `[native code]` |
| 1.1% | 2.40s | 49.4% | 104.83s | `filter` | `[native code]` |
| 1.0% | 2.23s | 1.0% | 2.23s | `copyDataProperties` | `[native code]` |
| 1.0% | 2.18s | 1.0% | 2.18s | `getEditorJsonRecordEntries` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:92` |
| 1.0% | 2.15s | 13.9% | 29.62s | `nodeText` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1109` |
| 0.9% | 2.05s | 0.9% | 2.05s | `nodeAtPath` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:264` |
| 0.9% | 2.00s | 0.9% | 2.00s | `join` | `[native code]` |
| 0.9% | 1.96s | 0.9% | 1.96s | `toString` | `[native code]` |
| 0.9% | 1.94s | 0.9% | 1.94s | `nodeAtPath` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:255` |
| 0.8% | 1.77s | 0.8% | 1.77s | `read` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts` |
| 0.7% | 1.58s | 0.7% | 1.58s | `isEditorJsonValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:123` |
| 0.6% | 1.40s | 0.9% | 1.99s | `flatMap` | `[native code]` |
| 0.6% | 1.31s | 0.6% | 1.31s | `Set` | `[native code]` |
| 0.6% | 1.28s | 14.5% | 30.78s | `forEach` | `[native code]` |
| 0.5% | 1.15s | 0.5% | 1.15s | `delete` | `[native code]` |
| 0.5% | 1.11s | 0.5% | 1.11s | `handleProxyGetTrapResult` | `[native code]` |
| 0.5% | 1.11s | 1.4% | 3.07s | `hasIntrinsicConstructor` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:25` |
| 0.4% | 951.1ms | 9.5% | 20.17s | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1169` |
| 0.4% | 888.4ms | 0.6% | 1.29s | `isEditorJsonValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:109` |
| 0.3% | 684.9ms | 0.3% | 723.7ms | `get` | `[native code]` |
| 0.3% | 655.3ms | 0.3% | 655.3ms | `cloneObject` | `[native code]` |
| 0.2% | 613.4ms | 0.2% | 613.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2674` |
| 0.2% | 613.4ms | 0.2% | 615.8ms | `canonicalizeDeclarativePropertyRecord` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1717` |
| 0.2% | 601.5ms | 3.9% | 8.36s | `sameNodeKind` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1124` |
| 0.2% | 569.6ms | 0.2% | 569.6ms | `push` | `[native code]` |
| 0.2% | 561.8ms | 22.7% | 48.22s | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1170` |
| 0.2% | 543.7ms | 0.2% | 543.7ms | `sameNodeKind` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts` |
| 0.2% | 517.6ms | 0.2% | 517.6ms | `values` | `[native code]` |
| 0.2% | 513.4ms | 4.5% | 9.59s | `performProxyObjectGet` | `[native code]` |
| 0.2% | 434.9ms | 1.4% | 3.04s | `getEditorJsonArrayItems` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:61` |
| 0.1% | 420.0ms | 0.1% | 420.0ms | `WeakSet` | `[native code]` |
| 0.1% | 376.6ms | 0.1% | 376.6ms | `normalizeTokens` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:337` |
| 0.1% | 374.8ms | 0.1% | 374.8ms | `flatIntoArray` | `[native code]` |
| 0.1% | 374.3ms | 0.1% | 374.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2609` |
| 0.1% | 374.1ms | 1.9% | 4.04s | `isDeepFrozenNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3120` |
| 0.1% | 346.6ms | 0.3% | 772.3ms | `toSchemaValidationLocation` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:380` |
| 0.1% | 323.1ms | 0.1% | 323.1ms | `getEditorJsonArrayItems` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:56` |
| 0.1% | 305.6ms | 0.1% | 305.6ms | `slice` | `[native code]` |
| 0.1% | 292.2ms | 0.1% | 292.2ms | `nodeAtPath` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:260` |
| 0.1% | 269.7ms | 0.1% | 269.7ms | `jsonEqual` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:140` |
| 0.1% | 267.2ms | 2.0% | 4.26s | `getEditorJsonRecordEntries` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:95` |
| 0.1% | 263.8ms | 0.1% | 265.0ms | `canonicalizeDeclarativePropertyRecord` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1574` |
| 0.1% | 247.7ms | 0.1% | 247.7ms | `set` | `[native code]` |
| 0.1% | 239.6ms | 0.3% | 813.1ms | `validateTextProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2460` |
| 0.1% | 229.3ms | 0.1% | 229.3ms | `jsonEqual` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:137` |
| 0.1% | 215.8ms | 0.1% | 215.8ms | `hasIntrinsicConstructor` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:24` |
| 0.1% | 212.4ms | 1.4% | 2.97s | `next` | `[native code]` |
| 0.0% | 204.7ms | 0.0% | 204.7ms | `nodeText` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1114` |
| 0.0% | 194.1ms | 0.3% | 832.9ms | `nodeProps` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:833` |
| 0.0% | 190.6ms | 0.0% | 191.9ms | `isText` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/text.ts:189` |
| 0.0% | 187.4ms | 0.0% | 188.8ms | `PreparedTokenSlice` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:500` |
| 0.0% | 172.6ms | 0.0% | 172.6ms | `fromEntries` | `[native code]` |
| 0.0% | 170.8ms | 0.0% | 170.8ms | `stringify` | `[native code]` |
| 0.0% | 158.1ms | 1.2% | 2.64s | `hasIntrinsicConstructor` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:20` |
| 0.0% | 156.8ms | 0.0% | 156.8ms | `visitOwnerDeclarations` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:621` |
| 0.0% | 155.7ms | 4.8% | 10.23s | `isEditorJsonValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:127` |
| 0.0% | 152.8ms | 0.0% | 152.8ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:879` |
| 0.0% | 146.8ms | 0.0% | 146.8ms | `getEditorJsonRecordEntries` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:101` |
| 0.0% | 142.9ms | 0.0% | 142.9ms | `canonicalizeDeclarativePropertyRecord` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1540` |
| 0.0% | 142.1ms | 0.0% | 148.3ms | `sort` | `[native code]` |
| 0.0% | 133.2ms | 1.0% | 2.21s | `isDeepFrozenNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3122` |
| 0.0% | 125.4ms | 0.1% | 285.0ms | `validateDeclarativeNodeProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2590` |
| 0.0% | 124.6ms | 0.4% | 905.5ms | `canonicalizeCompiledExclusiveTextProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:307` |
| 0.0% | 124.5ms | 0.4% | 904.2ms | `toCompiledTargetContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:693` |
| 0.0% | 122.3ms | 0.0% | 122.3ms | `fitClosedContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:547` |
| 0.0% | 122.1ms | 2.9% | 6.24s | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2670` |
| 0.0% | 118.8ms | 0.2% | 565.1ms | `performIteration` | `[native code]` |
| 0.0% | 113.4ms | 0.0% | 113.4ms | `createEntry` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:321` |
| 0.0% | 105.7ms | 0.0% | 105.7ms | `has` | `[native code]` |
| 0.0% | 104.5ms | 0.0% | 104.5ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:747` |
| 0.0% | 104.0ms | 0.0% | 104.0ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:76` |
| 0.0% | 96.6ms | 0.0% | 96.6ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:84` |
| 0.0% | 92.7ms | 0.0% | 139.3ms | `canonicalizeCompiledExclusiveTextProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:318` |
| 0.0% | 91.8ms | 12.0% | 25.55s | `isEditorJsonValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:131` |
| 0.0% | 90.6ms | 0.7% | 1.69s | `validateTextProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2464` |
| 0.0% | 87.1ms | 7.4% | 15.87s | `nodeText` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1121` |
| 0.0% | 86.4ms | 0.2% | 621.2ms | `bound get` | `[native code]` |
| 0.0% | 86.3ms | 0.0% | 127.0ms | `some` | `[native code]` |
| 0.0% | 77.4ms | 1.6% | 3.46s | `getEditorJsonRecordEntries` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:85` |
| 0.0% | 77.0ms | 0.7% | 1.64s | `canonicalizeDeclarativePropertyRecord` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1573` |
| 0.0% | 75.3ms | 0.0% | 75.3ms | `createTreeIndexChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:42` |
| 0.0% | 72.1ms | 0.2% | 553.7ms | `canonicalizeDeclarativePropertyRecord` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1725` |
| 0.0% | 70.9ms | 0.0% | 78.8ms | `fitClosedContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:604` |
| 0.0% | 68.8ms | 0.0% | 68.8ms | `structuredClone` | `[native code]` |
| 0.0% | 67.8ms | 0.0% | 68.9ms | `canonicalizeCompiledExclusiveTextProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:342` |
| 0.0% | 65.1ms | 0.0% | 65.1ms | `getDescendant` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:502` |
| 0.0% | 65.0ms | 0.2% | 563.0ms | `PreparedTokenSlice` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:501` |
| 0.0% | 64.1ms | 0.0% | 64.1ms | `structurallyEqual` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:246` |
| 0.0% | 63.5ms | 0.0% | 63.5ms | `structurallyEqual` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:249` |
| 0.0% | 63.5ms | 0.0% | 63.5ms | `canonicalizeDeclarativePropertyRecord` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1533` |
| 0.0% | 63.2ms | 0.9% | 2.02s | `validateDeclarativeNodeProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2546` |
| 0.0% | 62.9ms | 0.0% | 62.9ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1728` |
| 0.0% | 62.5ms | 0.0% | 132.2ms | `PreparedTokenSlice` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:504` |
| 0.0% | 61.7ms | 0.0% | 61.7ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1743` |
| 0.0% | 60.5ms | 0.0% | 60.5ms | `canonicalizeDeclarativePropertyRecord` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1570` |
| 0.0% | 60.0ms | 0.5% | 1.17s | `canonicalizeDeclarativePropertyRecord` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1651` |
| 0.0% | 59.6ms | 0.0% | 59.6ms | `getNodeKeyForNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:63` |
| 0.0% | 58.5ms | 0.0% | 119.3ms | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:121` |
| 0.0% | 57.6ms | 12.4% | 26.35s | `assertJsonValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:309` |
| 0.0% | 56.6ms | 0.4% | 860.2ms | `toSchemaValidationLocation` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:371` |
| 0.0% | 55.9ms | 0.0% | 67.7ms | `fitClosedContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:589` |
| 0.0% | 55.1ms | 0.0% | 55.1ms | `getEditorJsonArrayItems` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:67` |
| 0.0% | 54.7ms | 0.0% | 54.7ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:254` |
| 0.0% | 54.7ms | 0.0% | 176.6ms | `fitClosedContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:551` |
| 0.0% | 53.1ms | 0.5% | 1.20s | `isEditorJsonValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:142` |
| 0.0% | 52.5ms | 0.1% | 347.4ms | `bound values` | `[native code]` |
| 0.0% | 51.4ms | 0.0% | 51.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/provenance.ts:49` |
| 0.0% | 50.1ms | 11.9% | 25.25s | `isEditorJsonValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:139` |
| 0.0% | 49.8ms | 0.0% | 49.8ms | `toSchemaValidationLocation` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:378` |
| 0.0% | 47.9ms | 0.6% | 1.41s | `contentAllows` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1247` |
| 0.0% | 47.7ms | 0.0% | 47.7ms | `createTreeIndexChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:41` |
| 0.0% | 46.0ms | 0.1% | 289.1ms | `classifyRootChangeWithRuntimeCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:152` |
| 0.0% | 45.9ms | 0.0% | 45.9ms | `isPreparedTargetPath` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:979` |
| 0.0% | 45.6ms | 0.2% | 582.7ms | `toSchemaValidationLocation` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:379` |
| 0.0% | 45.6ms | 0.0% | 46.9ms | `materializeTokens` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:556` |
| 0.0% | 45.5ms | 0.2% | 544.5ms | `toSchemaValidationLocation` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:377` |
| 0.0% | 45.4ms | 2.2% | 4.78s | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:151` |
| 0.0% | 45.3ms | 0.0% | 45.3ms | `jsonEqual` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:124` |
| 0.0% | 45.0ms | 0.0% | 45.0ms | `groupRelocationCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:168` |
| 0.0% | 44.6ms | 0.0% | 44.6ms | `keyAt` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1591` |
| 0.0% | 44.5ms | 0.0% | 70.2ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1197` |
| 0.0% | 43.8ms | 6.9% | 14.65s | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2611` |
| 0.0% | 42.2ms | 0.0% | 42.2ms | `mapSnapshotIndexThroughChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1503` |
| 0.0% | 41.8ms | 0.5% | 1.13s | `openToken` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:300` |
| 0.0% | 41.3ms | 0.0% | 72.9ms | `visitOwnerDeclarations` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:617` |
| 0.0% | 41.3ms | 0.0% | 41.3ms | `allocateNodeKey` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:33` |
| 0.0% | 41.1ms | 0.0% | 41.1ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:139` |
| 0.0% | 40.4ms | 0.0% | 121.9ms | `findWrappingForContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:433` |
| 0.0% | 40.2ms | 0.0% | 40.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1808` |
| 0.0% | 39.6ms | 0.0% | 39.6ms | `structurallyEqual` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:226` |
| 0.0% | 39.4ms | 0.0% | 39.4ms | `fitClosedContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:595` |
| 0.0% | 38.7ms | 0.0% | 38.7ms | `get size` | `[native code]` |
| 0.0% | 38.6ms | 0.0% | 38.6ms | `tokenLength` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:182` |
| 0.0% | 38.4ms | 0.7% | 1.67s | `validateDeclarativeNodeProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2568` |
| 0.0% | 38.1ms | 0.5% | 1.06s | `cloneJson` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:154` |
| 0.0% | 37.3ms | 0.0% | 37.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:131` |
| 0.0% | 36.8ms | 0.1% | 218.1ms | `canonicalizeDeclarativePropertyRecord` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1569` |
| 0.0% | 36.8ms | 0.0% | 36.8ms | `fitClosedNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:475` |
| 0.0% | 36.4ms | 0.3% | 776.4ms | `validateTextProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2499` |
| 0.0% | 35.8ms | 0.0% | 151.1ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:183` |
| 0.0% | 34.6ms | 0.0% | 34.6ms | `at` | `[native code]` |
| 0.0% | 34.1ms | 0.1% | 422.7ms | `getTextProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2289` |
| 0.0% | 34.0ms | 0.5% | 1.15s | `canonicalizeDeclarativePropertyRecord` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1688` |
| 0.0% | 32.8ms | 0.5% | 1.19s | `canonicalizeDeclarativePropertyRecord` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1648` |
| 0.0% | 32.1ms | 0.0% | 32.1ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:284` |
| 0.0% | 31.8ms | 0.2% | 473.7ms | `classifyRootChangeWithRuntimeCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:166` |
| 0.0% | 31.7ms | 0.0% | 31.7ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1727` |
| 0.0% | 31.6ms | 0.0% | 41.0ms | `Map` | `[native code]` |
| 0.0% | 31.5ms | 0.0% | 49.2ms | `retainOrigin` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:447` |
| 0.0% | 30.3ms | 0.4% | 888.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2623` |
| 0.0% | 30.1ms | 0.0% | 30.1ms | `visitOwnerDeclarations` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts` |
| 0.0% | 30.0ms | 0.0% | 30.0ms | `WeakMap` | `[native code]` |
| 0.0% | 29.5ms | 0.0% | 29.5ms | `groupRelocationCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:167` |
| 0.0% | 29.5ms | 0.0% | 29.5ms | `isElement` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/element.ts:121` |
| 0.0% | 29.2ms | 0.0% | 29.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:374` |
| 0.0% | 29.0ms | 0.0% | 167.9ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1788` |
| 0.0% | 28.9ms | 0.0% | 28.9ms | `openToken` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:297` |
| 0.0% | 28.7ms | 0.0% | 150.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1746` |
| 0.0% | 28.6ms | 0.0% | 28.6ms | `get` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:262` |
| 0.0% | 28.6ms | 0.0% | 28.6ms | `validateDeclarativeChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2602` |
| 0.0% | 28.3ms | 0.0% | 114.6ms | `cache` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1476` |
| 0.0% | 27.3ms | 0.0% | 27.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:289` |
| 0.0% | 26.5ms | 0.0% | 26.5ms | `rootCanContain` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1845` |
| 0.0% | 26.4ms | 0.0% | 26.4ms | `replaceIndexedChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:303` |
| 0.0% | 26.1ms | 0.0% | 26.1ms | `createWrappedContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:352` |
| 0.0% | 26.1ms | 0.0% | 27.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1799` |
| 0.0% | 26.0ms | 0.0% | 63.4ms | `PreparedTokenSlice` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:502` |
| 0.0% | 26.0ms | 0.0% | 26.0ms | `classifyRootChangeWithRuntimeCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:162` |
| 0.0% | 26.0ms | 0.0% | 26.0ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1380` |
| 0.0% | 25.5ms | 0.0% | 26.6ms | `mixStructuralFingerprintString` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:90` |
| 0.0% | 25.3ms | 0.6% | 1.46s | `encode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:921` |
| 0.0% | 24.9ms | 0.0% | 24.9ms | `hasIntrinsicConstructor` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:23` |
| 0.0% | 24.9ms | 0.0% | 84.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:303` |
| 0.0% | 24.6ms | 0.0% | 24.6ms | `isRecursivelyValidated` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3550` |
| 0.0% | 24.4ms | 0.0% | 24.4ms | `fetch` | `[native code]` |
| 0.0% | 24.1ms | 0.0% | 24.1ms | `createTreeIndexNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:57` |
| 0.0% | 24.1ms | 0.0% | 137.2ms | `addOwnPath` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3479` |
| 0.0% | 23.9ms | 0.0% | 23.9ms | `claim` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1007` |
| 0.0% | 23.9ms | 0.4% | 956.4ms | `validateDeclarativeNodeProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2587` |
| 0.0% | 22.6ms | 0.0% | 43.2ms | `resolveCompiledSchemaProperty` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts:3146` |
| 0.0% | 22.5ms | 0.0% | 22.5ms | `fitDirectContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:329` |
| 0.0% | 22.4ms | 0.0% | 22.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts` |
| 0.0% | 22.4ms | 0.0% | 34.6ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3133` |
| 0.0% | 21.9ms | 0.1% | 237.2ms | `normalizeTokens` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:334` |
| 0.0% | 21.8ms | 0.0% | 25.5ms | `fitClosedNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:457` |
| 0.0% | 21.8ms | 0.0% | 29.5ms | `cache` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1498` |
| 0.0% | 21.6ms | 0.0% | 26.7ms | `canonicalizeDirectChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:197` |
| 0.0% | 21.6ms | 1.1% | 2.44s | `PreparedTokenSlice` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:489` |
| 0.0% | 21.6ms | 0.0% | 112.0ms | `bound has` | `[native code]` |
| 0.0% | 21.6ms | 0.0% | 21.6ms | `canonicalizeCompiledExclusiveTextProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:315` |
| 0.0% | 21.5ms | 0.0% | 123.8ms | `resolveCompiledSchemaProperty` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts:3145` |
| 0.0% | 21.5ms | 0.0% | 21.5ms | `normalizeTokens` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:323` |
| 0.0% | 21.3ms | 0.0% | 21.3ms | `keys` | `[native code]` |
| 0.0% | 21.0ms | 0.0% | 21.0ms | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:100` |
| 0.0% | 21.0ms | 0.0% | 21.0ms | `record` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/provenance.ts:65` |
| 0.0% | 20.5ms | 0.0% | 21.8ms | `classifyRootChangeWithRuntimeCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:161` |
| 0.0% | 20.5ms | 0.2% | 616.2ms | `flatIntoArrayWithCallback` | `[native code]` |
| 0.0% | 20.4ms | 0.0% | 20.4ms | `toReversed` | `[native code]` |
| 0.0% | 20.2ms | 0.0% | 30.5ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1147` |
| 0.0% | 20.0ms | 0.1% | 288.2ms | `validateSubtree` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3593` |
| 0.0% | 19.9ms | 0.3% | 679.2ms | `fitClosedContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:548` |
| 0.0% | 19.6ms | 0.0% | 19.6ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:96` |
| 0.0% | 19.5ms | 0.0% | 19.5ms | `groupRelocationCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:175` |
| 0.0% | 19.4ms | 0.0% | 162.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:154` |
| 0.0% | 19.1ms | 0.0% | 19.1ms | `join` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1109` |
| 0.0% | 19.1ms | 0.0% | 19.1ms | `getDescendant` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:503` |
| 0.0% | 19.0ms | 0.1% | 332.2ms | `deepFreeze` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:169` |
| 0.0% | 19.0ms | 0.0% | 19.0ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:967` |
| 0.0% | 18.9ms | 0.0% | 18.9ms | `canonicalizeInlineChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:142` |
| 0.0% | 18.8ms | 0.0% | 56.0ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:968` |
| 0.0% | 18.7ms | 0.0% | 51.9ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:237` |
| 0.0% | 18.7ms | 0.0% | 33.6ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3494` |
| 0.0% | 18.6ms | 0.0% | 18.6ms | `createEntry` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:317` |
| 0.0% | 18.6ms | 0.0% | 18.6ms | `validateDeclarativeNodeProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2556` |
| 0.0% | 18.6ms | 0.0% | 18.6ms | `fitClosedContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:609` |
| 0.0% | 18.5ms | 0.0% | 32.4ms | `cache` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1478` |
| 0.0% | 18.0ms | 0.0% | 18.0ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:178` |
| 0.0% | 18.0ms | 0.0% | 102.1ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1137` |
| 0.0% | 17.9ms | 0.1% | 242.2ms | `replaceIndexedChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:302` |
| 0.0% | 17.9ms | 0.7% | 1.69s | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:743` |
| 0.0% | 17.8ms | 0.1% | 224.3ms | `validateDeclarativeNodeProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2586` |
| 0.0% | 17.7ms | 0.7% | 1.63s | `encode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:938` |
| 0.0% | 17.6ms | 0.0% | 21.1ms | `validateDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3684` |
| 0.0% | 17.5ms | 0.6% | 1.34s | `visitOwnerDeclarations` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:606` |
| 0.0% | 17.3ms | 0.0% | 17.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1377` |
| 0.0% | 17.2ms | 0.0% | 17.2ms | `createWrappedContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:370` |
| 0.0% | 17.0ms | 0.5% | 1.15s | `readOwnerDeclaration` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:433` |
| 0.0% | 16.6ms | 0.1% | 305.2ms | `encode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:935` |
| 0.0% | 16.6ms | 0.0% | 16.6ms | `get` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:223` |
| 0.0% | 16.2ms | 0.0% | 164.4ms | `validateTextProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2402` |
| 0.0% | 16.1ms | 0.0% | 16.1ms | `pathKey` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:104` |
| 0.0% | 16.0ms | 0.0% | 16.0ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:119` |
| 0.0% | 16.0ms | 0.0% | 29.9ms | `visit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:628` |
| 0.0% | 15.7ms | 0.0% | 29.5ms | `canonicalizeInlineChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:117` |
| 0.0% | 15.4ms | 0.0% | 15.4ms | `claim` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1020` |
| 0.0% | 15.4ms | 0.0% | 15.4ms | `cache` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1497` |
| 0.0% | 15.1ms | 0.0% | 15.1ms | `appendNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:116` |
| 0.0% | 15.0ms | 0.0% | 15.0ms | `PreparedTokenSlice` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:479` |
| 0.0% | 15.0ms | 0.0% | 15.0ms | `claim` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1019` |
| 0.0% | 15.0ms | 0.0% | 15.0ms | `tokensEqual` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:188` |
| 0.0% | 14.9ms | 0.0% | 14.9ms | `closeToken` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:312` |
| 0.0% | 14.7ms | 0.0% | 26.4ms | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:139` |
| 0.0% | 14.3ms | 0.0% | 161.0ms | `validateDeclarativeNodeProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2558` |
| 0.0% | 14.1ms | 0.0% | 14.1ms | `collectRelocationCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:207` |
| 0.0% | 14.0ms | 0.0% | 14.0ms | `assignFreshNodeKey` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:175` |
| 0.0% | 14.0ms | 0.0% | 167.0ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2647` |
| 0.0% | 13.9ms | 0.0% | 13.9ms | `validateSubtree` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3614` |
| 0.0% | 13.6ms | 0.0% | 13.6ms | `addParentIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3476` |
| 0.0% | 13.5ms | 0.0% | 13.5ms | `concat` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:682` |
| 0.0% | 13.5ms | 0.0% | 13.5ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:142` |
| 0.0% | 13.3ms | 0.0% | 16.8ms | `appendNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:103` |
| 0.0% | 13.2ms | 11.3% | 24.03s | `validateDeclarativeChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2608` |
| 0.0% | 13.1ms | 0.0% | 13.1ms | `mixStructuralFingerprintString` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts` |
| 0.0% | 12.9ms | 0.0% | 12.9ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:131` |
| 0.0% | 12.8ms | 0.1% | 233.7ms | `openToken` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:301` |
| 0.0% | 12.5ms | 0.0% | 12.5ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:49` |
| 0.0% | 12.4ms | 0.0% | 58.0ms | `visitDeclarative` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2780` |
| 0.0% | 12.2ms | 2.5% | 5.33s | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:159` |
| 0.0% | 12.2ms | 1.6% | 3.47s | `validateDeclarativeNodeProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2554` |
| 0.0% | 12.1ms | 0.0% | 12.1ms | `canonicalizeDeclarativePropertyRecord` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1722` |
| 0.0% | 11.8ms | 0.0% | 11.8ms | `assertNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts` |
| 0.0% | 11.7ms | 0.0% | 11.7ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1740` |
| 0.0% | 11.7ms | 0.0% | 199.3ms | `fitClosedNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:460` |
| 0.0% | 11.6ms | 0.0% | 11.6ms | `toSchemaValidationLocation` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` |
| 0.0% | 11.5ms | 0.0% | 11.5ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:329` |
| 0.0% | 11.4ms | 0.0% | 11.4ms | `flat` | `[native code]` |
| 0.0% | 11.4ms | 0.0% | 31.5ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/provenance.ts:82` |
| 0.0% | 11.3ms | 0.0% | 189.3ms | `encode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:853` |
| 0.0% | 11.2ms | 0.6% | 1.30s | `validateDeclarativeRootContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2855` |
| 0.0% | 11.2ms | 0.0% | 11.2ms | `tokenLength` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts` |
| 0.0% | 10.5ms | 0.0% | 58.3ms | `validationContentAllows` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1257` |
| 0.0% | 10.5ms | 0.0% | 10.5ms | `validateContentIndexes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3407` |
| 0.0% | 10.4ms | 0.2% | 532.5ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:155` |
| 0.0% | 10.4ms | 49.3% | 104.75s | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1163` |
| 0.0% | 10.4ms | 0.0% | 18.0ms | `mapSnapshotIndexThroughChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1450` |
| 0.0% | 10.3ms | 0.1% | 245.1ms | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:129` |
| 0.0% | 10.3ms | 0.0% | 15.2ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:130` |
| 0.0% | 10.2ms | 2.7% | 5.75s | `validateDeclarativeNodeProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2582` |
| 0.0% | 10.1ms | 0.0% | 10.1ms | `collectRelocationCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:205` |
| 0.0% | 10.1ms | 0.0% | 18.5ms | `parseModule` | `[native code]` |
| 0.0% | 10.1ms | 0.0% | 10.1ms | `encodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:911` |
| 0.0% | 9.9ms | 0.0% | 9.9ms | `replaceIndexedChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:305` |
| 0.0% | 9.7ms | 0.0% | 9.7ms | `splice` | `[native code]` |
| 0.0% | 9.7ms | 0.0% | 9.7ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1136` |
| 0.0% | 9.5ms | 0.0% | 9.5ms | `keyAt` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts` |
| 0.0% | 9.5ms | 0.0% | 49.9ms | `materializeTokens` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:557` |
| 0.0% | 9.4ms | 0.3% | 845.2ms | `fitClosedNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:469` |
| 0.0% | 9.4ms | 0.0% | 20.0ms | `textFor` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:57` |
| 0.0% | 9.3ms | 0.0% | 44.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/provenance.ts:51` |
| 0.0% | 9.3ms | 0.0% | 9.3ms | `materializeTokens` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts` |
| 0.0% | 9.2ms | 0.7% | 1.49s | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1795` |
| 0.0% | 9.1ms | 0.0% | 9.1ms | `allContentAllowed` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:278` |
| 0.0% | 9.1ms | 0.7% | 1.68s | `PreparedTokenSlice` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:505` |
| 0.0% | 9.1ms | 0.0% | 89.4ms | `addRange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:896` |
| 0.0% | 9.1ms | 0.0% | 15.6ms | `getTransactionSpecContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:542` |
| 0.0% | 9.0ms | 0.0% | 29.5ms | `createWrappedContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:372` |
| 0.0% | 9.0ms | 0.0% | 9.0ms | `validateTextProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2505` |
| 0.0% | 9.0ms | 0.1% | 411.1ms | `canonicalizeDeclarativePropertyRecord` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1720` |
| 0.0% | 9.0ms | 0.0% | 9.0ms | `fitDirectContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:323` |
| 0.0% | 8.9ms | 0.0% | 10.3ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1195` |
| 0.0% | 8.9ms | 0.0% | 8.9ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:57` |
| 0.0% | 8.9ms | 0.1% | 273.9ms | `claim` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1021` |
| 0.0% | 8.8ms | 0.0% | 16.9ms | `getExtensionRegistry` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:597` |
| 0.0% | 8.7ms | 0.0% | 8.7ms | `Proxy` | `[native code]` |
| 0.0% | 8.6ms | 0.0% | 8.6ms | `snapshotEditorJsonValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:252` |
| 0.0% | 8.6ms | 0.1% | 248.1ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1762` |
| 0.0% | 8.6ms | 0.0% | 8.6ms | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:112` |
| 0.0% | 8.6ms | 0.0% | 8.6ms | `canonicalizeInlineChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:99` |
| 0.0% | 8.4ms | 0.0% | 8.4ms | `isElement` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/element.ts:123` |
| 0.0% | 8.4ms | 0.0% | 183.1ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:309` |
| 0.0% | 8.4ms | 0.0% | 77.4ms | `encode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:926` |
| 0.0% | 8.2ms | 0.0% | 8.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:232` |
| 0.0% | 8.2ms | 0.0% | 8.2ms | `getNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:53` |
| 0.0% | 8.2ms | 0.9% | 1.95s | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:742` |
| 0.0% | 8.1ms | 0.0% | 112.4ms | `canonicalizeDeclarativePropertyRecord` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1649` |
| 0.0% | 7.9ms | 0.0% | 7.9ms | `getNodeKeyForNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts` |
| 0.0% | 7.9ms | 0.0% | 13.4ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1153` |
| 0.0% | 7.9ms | 0.0% | 22.4ms | `isRecursivelyValidated` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3551` |
| 0.0% | 7.8ms | 0.0% | 7.8ms | `visit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:216` |
| 0.0% | 7.8ms | 0.5% | 1.25s | `openToken` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:291` |
| 0.0% | 7.7ms | 0.0% | 7.7ms | `resolveCompiledSchemaProperty` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts:3143` |
| 0.0% | 7.6ms | 0.2% | 568.7ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:232` |
| 0.0% | 7.6ms | 0.0% | 7.6ms | `canonicalizeInlineChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:156` |
| 0.0% | 7.6ms | 0.0% | 153.8ms | `cloneJson` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:149` |
| 0.0% | 7.5ms | 0.0% | 7.5ms | `openToken` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:305` |
| 0.0% | 7.5ms | 0.0% | 16.6ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:101` |
| 0.0% | 7.5ms | 0.0% | 7.5ms | `validateDeclarativeChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2606` |
| 0.0% | 7.4ms | 0.0% | 7.4ms | `hasInlineContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:89` |
| 0.0% | 7.4ms | 0.0% | 7.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:118` |
| 0.0% | 7.4ms | 0.0% | 49.8ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1784` |
| 0.0% | 7.4ms | 0.0% | 7.4ms | `deepFreeze` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/clone.ts:10` |
| 0.0% | 7.4ms | 0.0% | 99.3ms | `validateSubtree` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3588` |
| 0.0% | 7.3ms | 0.1% | 215.8ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3618` |
| 0.0% | 7.3ms | 0.0% | 7.3ms | `visitDeclarative` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2732` |
| 0.0% | 7.3ms | 0.0% | 7.3ms | `get` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts:599` |
| 0.0% | 7.3ms | 0.0% | 7.3ms | `addParentIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3475` |
| 0.0% | 7.2ms | 0.0% | 76.2ms | `visit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:218` |
| 0.0% | 7.1ms | 0.0% | 7.1ms | `classifyRootChangeWithRuntimeCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:151` |
| 0.0% | 7.0ms | 0.0% | 64.8ms | `encode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:868` |
| 0.0% | 6.9ms | 0.0% | 6.9ms | `repeat` | `[native code]` |
| 0.0% | 6.8ms | 0.0% | 6.8ms | `fitClosedNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:471` |
| 0.0% | 6.6ms | 0.0% | 54.0ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1148` |
| 0.0% | 6.6ms | 0.0% | 129.0ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:970` |
| 0.0% | 6.6ms | 0.0% | 6.6ms | `canonicalizeCompiledExclusiveTextProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:316` |
| 0.0% | 6.4ms | 0.0% | 11.7ms | `validateDeclarativeNodeProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2549` |
| 0.0% | 6.4ms | 0.0% | 6.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:485` |
| 0.0% | 6.3ms | 0.0% | 6.3ms | `replaceIndexedChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:306` |
| 0.0% | 6.3ms | 0.0% | 6.3ms | `assertNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:888` |
| 0.0% | 6.2ms | 0.0% | 6.2ms | `get` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:210` |
| 0.0% | 6.2ms | 0.0% | 6.2ms | `addRange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:898` |
| 0.0% | 6.2ms | 0.0% | 6.2ms | `get` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts:626` |
| 0.0% | 6.2ms | 0.0% | 6.2ms | `padStart` | `[native code]` |
| 0.0% | 6.2ms | 0.0% | 6.2ms | `textToken` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:318` |
| 0.0% | 6.1ms | 0.0% | 6.1ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1126` |
| 0.0% | 6.1ms | 0.0% | 47.0ms | `deepFreeze` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/clone.ts:11` |
| 0.0% | 6.1ms | 0.0% | 13.9ms | `fitClosedContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:578` |
| 0.0% | 6.0ms | 0.0% | 19.0ms | `getDeclarativeSchema` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:550` |
| 0.0% | 5.9ms | 0.0% | 40.2ms | `generatorResume` | `[native code]` |
| 0.0% | 5.9ms | 0.0% | 78.4ms | `encode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:915` |
| 0.0% | 5.8ms | 0.0% | 14.9ms | `hasOnlyKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:47` |
| 0.0% | 5.7ms | 0.0% | 6.9ms | `concat` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:683` |
| 0.0% | 5.7ms | 0.0% | 5.7ms | `encode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:856` |
| 0.0% | 5.7ms | 0.0% | 5.7ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:122` |
| 0.0% | 5.6ms | 0.0% | 34.5ms | `getNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:52` |
| 0.0% | 5.4ms | 0.0% | 134.8ms | `addRange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:889` |
| 0.0% | 5.4ms | 0.0% | 5.4ms | `setNodeKey` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:167` |
| 0.0% | 5.3ms | 0.0% | 6.4ms | `indexedAfter` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:200` |
| 0.0% | 5.3ms | 0.0% | 5.3ms | `defineSemanticUpdateMethod` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/semantic-update-method.ts:24` |
| 0.0% | 5.3ms | 0.0% | 5.3ms | `canonicalizeNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:243` |
| 0.0% | 5.3ms | 0.0% | 5.3ms | `claim` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1009` |
| 0.0% | 5.2ms | 0.0% | 5.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:184` |
| 0.0% | 5.2ms | 0.0% | 8.0ms | `setNodeKey` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:161` |
| 0.0% | 5.2ms | 0.0% | 5.2ms | `getLiveNodeKeyPrefix` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:28` |
| 0.0% | 5.2ms | 0.0% | 19.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:109` |
| 0.0% | 5.2ms | 0.0% | 5.2ms | `addSection` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:593` |
| 0.0% | 5.1ms | 0.0% | 5.1ms | `normalizeTokens` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:339` |
| 0.0% | 5.1ms | 0.0% | 30.4ms | `getInternalDocumentChangeEntries` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:538` |
| 0.0% | 5.1ms | 0.0% | 5.1ms | `getUpdateView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4862` |
| 0.0% | 5.1ms | 0.0% | 5.1ms | `mapPos` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2828` |
| 0.0% | 5.1ms | 0.0% | 42.9ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:100` |
| 0.0% | 5.1ms | 0.0% | 5.1ms | `mixStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts` |
| 0.0% | 5.0ms | 0.0% | 5.0ms | `moduleDeclarationInstantiation` | `[native code]` |
| 0.0% | 5.0ms | 0.0% | 55.5ms | `canonicalizeDeclarativeChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1808` |
| 0.0% | 5.0ms | 0.0% | 5.0ms | `equalValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:128` |
| 0.0% | 5.0ms | 0.0% | 5.0ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts` |
| 0.0% | 5.0ms | 0.0% | 5.0ms | `indexRecursivePath` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3568` |
| 0.0% | 5.0ms | 0.0% | 8.7ms | `find` | `[native code]` |
| 0.0% | 4.9ms | 0.0% | 4.9ms | `getUpdateView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4621` |
| 0.0% | 4.9ms | 0.0% | 4.9ms | `entry` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:899` |
| 0.0% | 4.9ms | 0.0% | 10.1ms | `nodeRange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:595` |
| 0.0% | 4.9ms | 0.0% | 4.9ms | `addParentIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3469` |
| 0.0% | 4.9ms | 0.0% | 4.9ms | `iterChangedRanges` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2790` |
| 0.0% | 4.8ms | 0.0% | 4.8ms | `canonicalizeDeclarativeChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` |
| 0.0% | 4.8ms | 0.2% | 612.1ms | `iterChangedRanges` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2812` |
| 0.0% | 4.8ms | 0.0% | 4.8ms | `isEditorJsonValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:119` |
| 0.0% | 4.7ms | 0.9% | 2.04s | `encodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:909` |
| 0.0% | 4.7ms | 0.2% | 459.6ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:336` |
| 0.0% | 4.7ms | 0.0% | 4.7ms | `getDescendant` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:499` |
| 0.0% | 4.7ms | 0.0% | 4.7ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:284` |
| 0.0% | 4.7ms | 0.0% | 77.4ms | `fitClosedContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:596` |
| 0.0% | 4.6ms | 0.0% | 4.6ms | `get` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:244` |
| 0.0% | 4.5ms | 0.0% | 13.9ms | `validateDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3576` |
| 0.0% | 4.3ms | 0.0% | 4.3ms | `assertNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:886` |
| 0.0% | 4.3ms | 0.0% | 4.3ms | `positionWasReplaced` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:559` |
| 0.0% | 4.3ms | 0.0% | 12.2ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1198` |
| 0.0% | 4.2ms | 0.0% | 4.2ms | `get` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:237` |
| 0.0% | 4.1ms | 0.0% | 4.1ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:135` |
| 0.0% | 4.1ms | 0.0% | 4.1ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts` |
| 0.0% | 4.1ms | 0.0% | 4.1ms | `assertNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:889` |
| 0.0% | 4.1ms | 0.0% | 4.1ms | `mixStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:84` |
| 0.0% | 4.0ms | 0.0% | 13.8ms | `materializeTokens` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:558` |
| 0.0% | 4.0ms | 0.0% | 4.0ms | `sliceMaterialized` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:785` |
| 0.0% | 4.0ms | 0.0% | 4.0ms | `visitDeclarative` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2778` |
| 0.0% | 4.0ms | 0.2% | 597.8ms | `visit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:634` |
| 0.0% | 3.9ms | 0.0% | 65.7ms | `encode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:873` |
| 0.0% | 3.9ms | 0.0% | 3.9ms | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:126` |
| 0.0% | 3.9ms | 0.0% | 3.9ms | `cacheIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:386` |
| 0.0% | 3.9ms | 0.0% | 6.6ms | `classifyRootChangeWithRuntimeCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:156` |
| 0.0% | 3.9ms | 0.0% | 154.0ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:975` |
| 0.0% | 3.9ms | 0.0% | 8.8ms | `advancePathStableSnapshotIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1782` |
| 0.0% | 3.9ms | 0.0% | 3.9ms | `addParentIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3474` |
| 0.0% | 3.9ms | 0.0% | 5.2ms | `constructCanonicalDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1093` |
| 0.0% | 3.9ms | 0.1% | 235.1ms | `hasOnlyKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:45` |
| 0.0% | 3.9ms | 0.0% | 21.8ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:218` |
| 0.0% | 3.8ms | 0.0% | 3.8ms | `compose` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1059` |
| 0.0% | 3.8ms | 0.0% | 3.8ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts` |
| 0.0% | 3.7ms | 0.0% | 26.8ms | `encode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:861` |
| 0.0% | 3.7ms | 0.0% | 12.3ms | `getDescendant` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:505` |
| 0.0% | 3.7ms | 0.0% | 3.7ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1162` |
| 0.0% | 3.7ms | 2.0% | 4.38s | `canonicalizeDeclarativeChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1741` |
| 0.0% | 3.7ms | 0.0% | 37.0ms | `classifyRootChangeWithRuntimeCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:155` |
| 0.0% | 3.7ms | 0.0% | 3.7ms | `seek` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:427` |
| 0.0% | 3.7ms | 0.0% | 3.7ms | `getExtensionRegistryStore` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts` |
| 0.0% | 3.7ms | 0.0% | 5.1ms | `reduce` | `[native code]` |
| 0.0% | 3.6ms | 0.0% | 3.6ms | `get` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:205` |
| 0.0% | 3.6ms | 0.0% | 3.6ms | `getElementAncestors` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:517` |
| 0.0% | 3.6ms | 0.0% | 29.5ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:221` |
| 0.0% | 3.5ms | 0.0% | 3.5ms | `getInternalDocumentChangeEntries` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:532` |
| 0.0% | 3.5ms | 0.0% | 3.5ms | `get` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts` |
| 0.0% | 3.5ms | 0.0% | 155.6ms | `visitDescendantPaths` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/provenance.ts:48` |
| 0.0% | 3.5ms | 0.0% | 3.5ms | `mapPos` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2827` |
| 0.0% | 3.4ms | 0.0% | 3.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:283` |
| 0.0% | 3.4ms | 0.0% | 3.4ms | `compileSliceFitter` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts` |
| 0.0% | 3.4ms | 0.0% | 3.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:183` |
| 0.0% | 3.4ms | 0.0% | 3.4ms | `isArray` | `[native code]` |
| 0.0% | 3.3ms | 0.0% | 3.3ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:208` |
| 0.0% | 3.1ms | 0.0% | 4.3ms | `validateDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3650` |
| 0.0% | 3.0ms | 0.0% | 5.7ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:287` |
| 0.0% | 3.0ms | 0.0% | 8.1ms | `rememberValidatedDocumentRoots` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3137` |
| 0.0% | 2.9ms | 0.0% | 2.9ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:307` |
| 0.0% | 2.9ms | 0.0% | 2.9ms | `tokensEqual` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:193` |
| 0.0% | 2.9ms | 0.0% | 2.9ms | `allocateNodeKey` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:32` |
| 0.0% | 2.9ms | 0.0% | 2.9ms | `getExtensionRegistryStore` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:580` |
| 0.0% | 2.8ms | 0.0% | 2.8ms | `visitDescendantPaths` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/provenance.ts:46` |
| 0.0% | 2.8ms | 0.0% | 3.9ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:118` |
| 0.0% | 2.8ms | 0.0% | 42.6ms | `collectProjectedRoots` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3210` |
| 0.0% | 2.8ms | 0.0% | 2.8ms | `claim` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1008` |
| 0.0% | 2.8ms | 0.0% | 2.8ms | `childBoundaryAt` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:108` |
| 0.0% | 2.8ms | 0.0% | 2.8ms | `indexRecursivePath` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` |
| 0.0% | 2.7ms | 79.1% | 167.96s | `(host)` | `[native code]` |
| 0.0% | 2.7ms | 0.0% | 2.7ms | `pathKey` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/provenance.ts:41` |
| 0.0% | 2.7ms | 0.0% | 49.0ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1785` |
| 0.0% | 2.7ms | 0.0% | 2.7ms | `clone` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:258` |
| 0.0% | 2.7ms | 0.0% | 2.7ms | `finalize` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:738` |
| 0.0% | 2.7ms | 0.0% | 2.7ms | `hasInRoot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:781` |
| 0.0% | 2.7ms | 0.0% | 3.8ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:119` |
| 0.0% | 2.7ms | 0.0% | 156.7ms | `validateDeclarativeRootContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2854` |
| 0.0% | 2.7ms | 0.0% | 2.7ms | `fit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts` |
| 0.0% | 2.7ms | 0.0% | 2.7ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1170` |
| 0.0% | 2.7ms | 0.1% | 259.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3492` |
| 0.0% | 2.6ms | 0.0% | 2.6ms | `replaceCanonicalChildWindow` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:813` |
| 0.0% | 2.6ms | 0.2% | 545.5ms | `groupRelocationCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:163` |
| 0.0% | 2.6ms | 0.0% | 71.5ms | `isInline` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3763` |
| 0.0% | 2.6ms | 0.0% | 2.6ms | `rawNodeAt` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:105` |
| 0.0% | 2.6ms | 0.0% | 2.6ms | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:123` |
| 0.0% | 2.6ms | 0.0% | 2.6ms | `composeSections` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:634` |
| 0.0% | 2.6ms | 0.0% | 10.3ms | `RootChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1382` |
| 0.0% | 2.6ms | 0.0% | 2.6ms | `advanceNextNodeKey` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:128` |
| 0.0% | 2.6ms | 0.0% | 2.6ms | `encodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:914` |
| 0.0% | 2.6ms | 0.0% | 2.6ms | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:103` |
| 0.0% | 2.6ms | 0.1% | 330.0ms | `canonicalizeNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:259` |
| 0.0% | 2.6ms | 0.0% | 15.1ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1152` |
| 0.0% | 2.6ms | 0.0% | 2.6ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1370` |
| 0.0% | 2.6ms | 0.0% | 2.6ms | `visit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:213` |
| 0.0% | 2.6ms | 0.0% | 2.6ms | `entry` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:900` |
| 0.0% | 2.6ms | 0.0% | 6.6ms | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7984` |
| 0.0% | 2.6ms | 0.0% | 2.6ms | `remember` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:540` |
| 0.0% | 2.6ms | 0.0% | 2.6ms | `applyTrustedCanonical` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:698` |
| 0.0% | 2.6ms | 0.0% | 2.6ms | `applyTrustedCanonical` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:725` |
| 0.0% | 2.5ms | 0.0% | 70.0ms | `async (anonymous)` | `[native code]` |
| 0.0% | 2.5ms | 0.0% | 2.5ms | `applyEditorUpdateTag` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/update-policy.ts:48` |
| 0.0% | 2.5ms | 91.6% | 194.29s | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7821` |
| 0.0% | 2.5ms | 0.0% | 2.5ms | `replaceCanonicalChildWindow` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:796` |
| 0.0% | 2.5ms | 0.0% | 2.5ms | `replacements` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2432` |
| 0.0% | 2.5ms | 0.0% | 2.5ms | `getEditorDocumentRoots` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:1847` |
| 0.0% | 2.5ms | 0.0% | 2.5ms | `visit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:638` |
| 0.0% | 2.5ms | 0.0% | 47.6ms | `validateDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3678` |
| 0.0% | 2.5ms | 0.0% | 2.5ms | `resolveExternalDocumentPoint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1469` |
| 0.0% | 2.5ms | 0.0% | 2.5ms | `PreparedTokenSlice` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts` |
| 0.0% | 2.5ms | 0.0% | 2.5ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:86` |
| 0.0% | 2.5ms | 0.1% | 350.2ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:229` |
| 0.0% | 2.5ms | 0.0% | 2.5ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:137` |
| 0.0% | 2.5ms | 0.0% | 5.1ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1742` |
| 0.0% | 2.5ms | 0.1% | 239.6ms | `structurallyEqual` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:232` |
| 0.0% | 2.5ms | 0.0% | 2.5ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:155` |
| 0.0% | 2.5ms | 0.0% | 2.5ms | `fitClosedNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:473` |
| 0.0% | 2.5ms | 0.0% | 2.5ms | `hasOwn` | `[native code]` |
| 0.0% | 2.5ms | 0.0% | 83.1ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1744` |
| 0.0% | 2.5ms | 0.0% | 3.5ms | `createEditorUpdateDraftContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7667` |
| 0.0% | 2.5ms | 0.2% | 439.7ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:134` |
| 0.0% | 2.5ms | 0.0% | 2.5ms | `replacements` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2434` |
| 0.0% | 2.5ms | 0.0% | 78.5ms | `visitDeclarative` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2733` |
| 0.0% | 2.5ms | 0.0% | 2.5ms | `DocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:737` |
| 0.0% | 2.4ms | 0.0% | 3.9ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:192` |
| 0.0% | 2.4ms | 0.0% | 2.4ms | `mapRelocatedPath` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:517` |
| 0.0% | 2.4ms | 0.0% | 6.5ms | `DocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:755` |
| 0.0% | 2.4ms | 0.0% | 2.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1745` |
| 0.0% | 2.4ms | 0.0% | 2.4ms | `isRecursivelyValidated` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3549` |
| 0.0% | 2.4ms | 0.0% | 2.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:3153` |
| 0.0% | 2.4ms | 0.0% | 2.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1150` |
| 0.0% | 2.4ms | 0.0% | 6.5ms | `isStrictPoint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:121` |
| 0.0% | 2.4ms | 0.0% | 2.4ms | `snapshotSliceContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:74` |
| 0.0% | 2.4ms | 0.0% | 37.5ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:332` |
| 0.0% | 2.4ms | 0.0% | 4.9ms | `getPendingSelectionMarks` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:367` |
| 0.0% | 2.4ms | 0.0% | 23.2ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1160` |
| 0.0% | 2.4ms | 0.0% | 2.4ms | `constructCanonicalDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1060` |
| 0.0% | 2.4ms | 0.0% | 2.4ms | `getDocumentRootProgram` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` |
| 0.0% | 2.4ms | 0.0% | 103.8ms | `addOwnPath` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3482` |
| 0.0% | 2.4ms | 0.0% | 41.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1755` |
| 0.0% | 2.4ms | 0.0% | 6.2ms | `isRange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/range.ts:200` |
| 0.0% | 2.4ms | 0.0% | 2.4ms | `rawNodeAt` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:106` |
| 0.0% | 2.3ms | 0.0% | 2.3ms | `defineProperty` | `[native code]` |
| 0.0% | 2.3ms | 0.0% | 2.3ms | `isRecursivelyValidated` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3555` |
| 0.0% | 2.3ms | 0.0% | 6.0ms | `mapPoint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:450` |
| 0.0% | 2.3ms | 0.0% | 101.8ms | `encode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:849` |
| 0.0% | 2.3ms | 0.0% | 2.3ms | `encode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:850` |
| 0.0% | 2.3ms | 0.0% | 2.3ms | `propertyChanges` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2459` |
| 0.0% | 2.3ms | 0.0% | 50.5ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:112` |
| 0.0% | 2.3ms | 0.0% | 15.0ms | `advancePathStableSnapshotIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1790` |
| 0.0% | 2.3ms | 0.0% | 2.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs` |
| 0.0% | 2.3ms | 0.0% | 11.8ms | `runRemoteChangesSeparately` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:241` |
| 0.0% | 2.3ms | 0.0% | 2.3ms | `getDescendant` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:346` |
| 0.0% | 2.3ms | 0.0% | 6.5ms | `normalizeSelectionRoot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-state.ts:24` |
| 0.0% | 2.3ms | 0.0% | 2.3ms | `next` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:546` |
| 0.0% | 2.3ms | 0.0% | 2.3ms | `validateContentIndexes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3406` |
| 0.0% | 2.3ms | 0.0% | 2.3ms | `collectProjectedRoots` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3207` |
| 0.0% | 2.3ms | 0.0% | 2.3ms | `getDocumentRootProgram` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:779` |
| 0.0% | 2.3ms | 0.0% | 2.3ms | `constructCanonicalDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:999` |
| 0.0% | 2.2ms | 0.0% | 2.2ms | `getUpdateView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4606` |
| 0.0% | 2.2ms | 0.0% | 2.2ms | `canonicalizeEditorExtension` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts` |
| 0.0% | 2.2ms | 0.0% | 4.5ms | `validateDeclarativeDocument` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3094` |
| 0.0% | 2.2ms | 0.1% | 251.0ms | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:137` |
| 0.0% | 2.2ms | 0.0% | 2.2ms | `canonicalizeDirectChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:190` |
| 0.0% | 2.2ms | 0.0% | 2.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` |
| 0.0% | 2.2ms | 0.0% | 84.7ms | `getCompiledElement` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:926` |
| 0.0% | 2.2ms | 0.0% | 10.4ms | `canonicalizeInlineChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:184` |
| 0.0% | 2.2ms | 0.0% | 32.6ms | `createTreeIndexNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:63` |
| 0.0% | 2.2ms | 0.0% | 2.2ms | `create` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1399` |
| 0.0% | 2.2ms | 0.0% | 19.6ms | `anonymous` | `[native code]` |
| 0.0% | 2.1ms | 0.0% | 2.1ms | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:105` |
| 0.0% | 2.1ms | 0.3% | 801.5ms | `validateDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3630` |
| 0.0% | 2.1ms | 0.0% | 2.1ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1192` |
| 0.0% | 2.1ms | 0.0% | 3.2ms | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7941` |
| 0.0% | 1.6ms | 0.0% | 10.3ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1193` |
| 0.0% | 1.5ms | 0.0% | 1.5ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts:615` |
| 0.0% | 1.5ms | 0.0% | 3.9ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:203` |
| 0.0% | 1.5ms | 0.0% | 4.1ms | `assertRemoteCommit` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:145` |
| 0.0% | 1.5ms | 0.0% | 1.5ms | `assertRemoteCommit` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:147` |
| 0.0% | 1.5ms | 0.0% | 1.5ms | `advancePathStableSnapshotIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1781` |
| 0.0% | 1.5ms | 0.0% | 143.3ms | `fromPreparedNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:614` |
| 0.0% | 1.5ms | 0.0% | 20.1ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:111` |
| 0.0% | 1.5ms | 0.0% | 1.5ms | `validateContentIndexes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` |
| 0.0% | 1.5ms | 0.0% | 1.5ms | `commit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts:674` |
| 0.0% | 1.5ms | 0.6% | 1.33s | `applyTransactionSpecDocumentChangeStep` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7391` |
| 0.0% | 1.5ms | 0.0% | 20.6ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:67` |
| 0.0% | 1.5ms | 0.0% | 1.5ms | `deepEquals` | `[native code]` |
| 0.0% | 1.5ms | 0.0% | 1.5ms | `guardTransactionValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts` |
| 0.0% | 1.5ms | 0.0% | 1.5ms | `commitAnchorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:447` |
| 0.0% | 1.5ms | 0.9% | 1.97s | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:247` |
| 0.0% | 1.5ms | 0.0% | 1.5ms | `constructCanonicalDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1049` |
| 0.0% | 1.5ms | 0.0% | 1.5ms | `assertSelectionSupported` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:676` |
| 0.0% | 1.5ms | 0.0% | 1.5ms | `areJsonValuesStructurallyEqual` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:181` |
| 0.0% | 1.5ms | 0.0% | 54.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5849` |
| 0.0% | 1.5ms | 0.0% | 1.5ms | `getOrphanedElementOwnedRoots` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` |
| 0.0% | 1.5ms | 0.8% | 1.70s | `materializeTokens` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:552` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `initializePublicState` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8709` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `getDeclarativeSchema` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `constructCanonicalDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1227` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `createEditorCommit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:997` |
| 0.0% | 1.4ms | 0.0% | 4.4ms | `orderPaths` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:867` |
| 0.0% | 1.4ms | 1.0% | 2.18s | `withText` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:861` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `compose` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1061` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:150` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `inheritDocumentChangeStepNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7210` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `sameNodeKind` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1127` |
| 0.0% | 1.4ms | 0.0% | 2.5ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1163` |
| 0.0% | 1.4ms | 0.0% | 121.1ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:71` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `cloneEditorJsonValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:229` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `applyTrustedCanonical` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:565` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `createEditorUpdateApi` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-lifecycle-api.ts` |
| 0.0% | 1.4ms | 0.0% | 2.9ms | `createEditorUpdateDraftContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7668` |
| 0.0% | 1.4ms | 0.0% | 4.0ms | `bound entries` | `[native code]` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `applyTrustedCanonical` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:628` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `assertSelectionSupported` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:709` |
| 0.0% | 1.4ms | 0.0% | 39.4ms | `addParentIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3471` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8045` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `visitDescendantPaths` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/provenance.ts:45` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `getDescendant` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:343` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `createDerivedBaseSchemaRecord` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `sliceMaterialized` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:789` |
| 0.0% | 1.4ms | 0.0% | 2.5ms | `addRange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:893` |
| 0.0% | 1.4ms | 1.1% | 2.48s | `applyIndexed` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2226` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:740` |
| 0.0% | 1.4ms | 0.0% | 3.6ms | `assertSelectionSupported` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:737` |
| 0.0% | 1.4ms | 0.0% | 2.9ms | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:131` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:123` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `applyTrustedCanonical` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `getSegmentRelocations` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:497` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `validateDeclarativeDocument` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3107` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `constructCanonicalDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts` |
| 0.0% | 1.4ms | 0.5% | 1.24s | `cloneFrozen` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:177` |
| 0.0% | 1.4ms | 0.0% | 2.5ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8019` |
| 0.0% | 1.4ms | 0.0% | 95.6ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1211` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1388` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `getExtensionRegistryStore` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:576` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `applyTrustedCanonical` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:705` |
| 0.0% | 1.4ms | 0.0% | 14.9ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:219` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:2180` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `replaceSnapshot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts` |
| 0.0% | 1.4ms | 0.0% | 25.1ms | `mapRange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:572` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `validateTextProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2391` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `compose` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1083` |
| 0.0% | 1.4ms | 0.1% | 222.4ms | `freezeRootClassification` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:302` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `materializeCandidate` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `openToken` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `apply` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:432` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `mergeRegistries` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:500` |
| 0.0% | 1.4ms | 0.0% | 2.5ms | `applyTrustedCanonical` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:622` |
| 0.0% | 1.4ms | 0.5% | 1.24s | `isArrayPrototype` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:37` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `replaceCanonicalChildWindow` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:890` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `getIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:1100` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `commitAnchorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:457` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:153` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `setCachedSnapshot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:920` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `hasInRoot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:773` |
| 0.0% | 1.4ms | 0.0% | 6.4ms | `applyDocumentChangeValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1260` |
| 0.0% | 1.4ms | 0.0% | 79.0ms | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8052` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-read-runtime.ts:322` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `assertExtensionPointIdentities` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:335` |
| 0.0% | 1.4ms | 0.0% | 2.8ms | `createInternalDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:570` |
| 0.0% | 1.4ms | 8.4% | 17.95s | `validateDeclarativeDocument` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3106` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `assertMappingLengths` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:403` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `mapExternalRootSelection` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `getLastCommit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts:455` |
| 0.0% | 1.4ms | 4.1% | 8.87s | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2258` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/history/history-extension.ts` |
| 0.0% | 1.4ms | 0.0% | 114.5ms | `getElementContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:931` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `getMutationRoot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts` |
| 0.0% | 1.4ms | 0.0% | 2.4ms | `inheritDocumentChangeStepNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7233` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `applyTransactionSpecContents` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `isPoint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/location.ts:62` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `createEditorDocumentValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:853` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `inheritDocumentChangeStepNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7318` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1417` |
| 0.0% | 1.4ms | 0.0% | 4.0ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1221` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `applyPreparedTransactionSpecChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5562` |
| 0.0% | 1.4ms | 0.0% | 2.5ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1184` |
| 0.0% | 1.4ms | 0.0% | 150.4ms | `classifyRootChangeWithRuntimeCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:224` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `createEditorSchema` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:546` |
| 0.0% | 1.4ms | 27.6% | 58.69s | `runRemoteChangesSeparately` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:240` |
| 0.0% | 1.4ms | 0.0% | 131.6ms | `constructCanonicalDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1205` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1493` |
| 0.0% | 1.4ms | 0.0% | 6.6ms | `apply` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:407` |
| 0.0% | 1.4ms | 0.6% | 1.43s | `finalizeTransactionRepresentation` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5389` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `finalizeExtensionRegistry` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `resolveExtensionOrder` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:373` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `SectionIterator` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:494` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:154` |
| 0.0% | 1.3ms | 0.0% | 2.7ms | `replaceCanonicalChildWindow` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:874` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `selectionPositionEquals` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6213` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `createEditorUpdateDraftContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7656` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `applyDocumentChangeValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1290` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1750` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6748` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `groupRelocationCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:169` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `isEditorExtension` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `comparePathsDeepestFirst` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:585` |
| 0.0% | 1.3ms | 0.0% | 40.4ms | `from` | `[native code]` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:47` |
| 0.0% | 1.3ms | 0.0% | 4.9ms | `validateDeclarativeDocument` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3041` |
| 0.0% | 1.3ms | 0.0% | 29.3ms | `advancePathStableSnapshotIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1792` |
| 0.0% | 1.3ms | 0.0% | 2.8ms | `DocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:761` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `createEditorCommit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:993` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `invert` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `addParentIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `next` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:545` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `getDescendant` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:347` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `compileEditorUpdatePolicy` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/update-policy.ts:72` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `getTransactionView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6435` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:355` |
| 0.0% | 1.3ms | 0.0% | 12.2ms | `snapshotEditorJsonValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:296` |
| 0.0% | 1.3ms | 0.0% | 2.6ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8021` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `measureConnectDisconnectHeap` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs` |
| 0.0% | 1.3ms | 0.0% | 18.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3488` |
| 0.0% | 1.3ms | 1.6% | 3.55s | `prepareFittedDocument` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1415` |
| 0.0% | 1.3ms | 0.0% | 2.5ms | `applyAnchorChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:292` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `pushUpdateTagContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/update-context.ts:20` |
| 0.0% | 1.3ms | 0.1% | 212.6ms | `isNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:167` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `applyTrustedCanonical` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:558` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `getCurrentRootSnapshot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6708` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `mergeCommandRegistries` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `createCallableGroup` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-lifecycle-api.ts:250` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `isPoint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/point.ts:88` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `commonSuffixLength` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `textFor` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs` |
| 0.0% | 1.3ms | 2.3% | 4.92s | `fromTokens` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:659` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `construct` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `applyTransactionSpecDocumentChangeStep` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7328` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `cache` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1477` |
| 0.0% | 1.3ms | 0.0% | 3.8ms | `composeSections` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:681` |
| 0.0% | 1.3ms | 0.0% | 9.8ms | `reconcileExclusiveElementOwnedRoots` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5410` |
| 0.0% | 1.3ms | 0.0% | 49.9ms | `classifyRootChangeWithRuntimeCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:164` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `assertEffectType` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `classifyDocumentRange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:61` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `mixStructuralFingerprintString` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:87` |
| 0.0% | 1.3ms | 0.2% | 635.5ms | `fit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1696` |
| 0.0% | 1.3ms | 0.0% | 2.5ms | `strict` | `node:assert:586` |
| 0.0% | 1.3ms | 0.0% | 9.8ms | `mapSnapshotIndexThroughChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1387` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `rootCanContain` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1844` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `encode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:872` |
| 0.0% | 1.3ms | 23.7% | 50.44s | `assertDocument` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3150` |
| 0.0% | 1.3ms | 0.0% | 2.7ms | `getChangeValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6749` |
| 0.0% | 1.3ms | 0.0% | 31.6ms | `classifyRootChangeWithRuntimeCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:159` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `createEditorUpdateDraftContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7640` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `finalizeCommandRegistry` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:259` |
| 0.0% | 1.3ms | 0.6% | 1.46s | `DocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:734` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:337` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `createTreeIndexChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:53` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `createEditorDocumentChangeBuilder` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6839` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `createEditorSchema` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `createEditorDocumentValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:843` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `getUpdateView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:3926` |
| 0.0% | 1.3ms | 0.0% | 2.6ms | `replaceCanonicalChildWindow` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:920` |
| 0.0% | 1.3ms | 0.0% | 2.7ms | `path` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/editor.ts:4650` |
| 0.0% | 1.3ms | 0.6% | 1.46s | `validateDeclarativeDocument` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3108` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `validateDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3622` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:124` |
| 0.0% | 1.3ms | 0.0% | 151.9ms | `classifyRootChangeWithRuntimeCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:219` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `isRange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/location.ts:66` |
| 0.0% | 1.3ms | 0.0% | 4.2ms | `compileEditorUpdatePolicy` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/update-policy.ts:84` |
| 0.0% | 1.3ms | 0.0% | 169.9ms | `collectRelocationCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:209` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `update` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-lifecycle-api.ts:411` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `apply` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:399` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `resolveMappedPoint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts:406` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `node` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts` |
| 0.0% | 1.3ms | 0.0% | 2.7ms | `isInTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:742` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `finalize` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2622` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `ChangeDraft` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:179` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `pathOf` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1699` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:81` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `materializeTokens` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:527` |
| 0.0% | 1.3ms | 0.0% | 12.5ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:238` |
| 0.0% | 1.3ms | 0.0% | 61.9ms | `classifyRootChangeWithRuntimeCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:176` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `updateIndexedNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:350` |
| 0.0% | 1.3ms | 0.0% | 23.6ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7988` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `mapPoint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:449` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `getDescendant` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:508` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `get empty` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:827` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `getStateView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:3102` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `continuityScore` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:942` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `validateDeclarativeDocument` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3048` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `encode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `applyInternal` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2541` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `protectedInlineSpacersFor` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1019` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `childBoundaryAt` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:122` |
| 0.0% | 1.2ms | 0.0% | 20.8ms | `collectRelocationCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:202` |
| 0.0% | 1.2ms | 0.0% | 7.8ms | `assertSelectionSupported` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:702` |
| 0.0% | 1.2ms | 0.0% | 7.8ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/provenance.ts:52` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `updateIndexedNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:447` |
| 0.0% | 1.2ms | 0.0% | 41.5ms | `validateDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3634` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `createEditorImplementation` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts` |
| 0.0% | 1.2ms | 0.0% | 3.6ms | `getValidationAuthority` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:555` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `node:fs/promises` | `node:fs/promises:2` |
| 0.0% | 1.2ms | 0.0% | 29.5ms | `claim` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1014` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `applyTransactionSpecDocumentChangeStep` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7343` |
| 0.0% | 1.2ms | 0.0% | 2.3ms | `internal:fs/streams` | `internal:fs/streams:2` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `mapPathForward` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:582` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `update` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-lifecycle-api.ts:422` |
| 0.0% | 1.2ms | 0.0% | 11.7ms | `reconcileExclusiveElementOwnedRoots` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5407` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `comparePaths` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:857` |
| 0.0% | 1.2ms | 0.0% | 24.9ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:114` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `isObject` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/is-object.ts:4` |
| 0.0% | 1.2ms | 0.0% | 44.2ms | `replaceCanonicalChildWindow` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:875` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `nodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `assertOwnJsonProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `isRecord` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:53` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `canonicalizeInlineChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:105` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `createEditorReadRuntime` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-read-runtime.ts` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `createPathStableMappingSegment` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:426` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:63` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:95` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `get` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts:596` |
| 0.0% | 1.2ms | 0.0% | 50.6ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:290` |
| 0.0% | 1.2ms | 0.0% | 3.9ms | `applyTransactionSpecDocumentChangeStep` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7401` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `sealElementOwnedRootIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:1085` |
| 0.0% | 1.2ms | 0.0% | 5.0ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1372` |
| 0.0% | 1.2ms | 0.0% | 2.5ms | `assertSelectionSupported` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:682` |
| 0.0% | 1.2ms | 0.3% | 844.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1780` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `getIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:1096` |
| 0.0% | 1.2ms | 0.0% | 2.7ms | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:132` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1084` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `invert` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2698` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `rawNodeAt` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:102` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7825` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `iterChangedRanges` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2791` |
| 0.0% | 1.2ms | 0.0% | 4.9ms | `validateDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3674` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `positionWasReplaced` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:558` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7795` |
| 0.0% | 1.2ms | 0.0% | 83.4ms | `jsonEqual` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:131` |
| 0.0% | 1.2ms | 0.0% | 6.3ms | `canonicalizeInlineChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:130` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `applyDocumentChangeValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1255` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `getUpdateView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4675` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:855` |
| 0.0% | 1.2ms | 0.0% | 13.3ms | `freezeReadonlySet` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:234` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `addChildWindow` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:786` |
| 0.0% | 1.2ms | 3.7% | 7.85s | `rememberValidatedDocumentRoots` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3133` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `replaceIndexedChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:286` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `addSection` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:594` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `getInternalDocumentChangeEntries` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:535` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7533` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `visitDeclarative` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `isPoint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/point.ts:90` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:200` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `findChildIndexAtPosition` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:78` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8082` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2376` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2672` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `getProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:885` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `isRecursivelyValidated` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3547` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `setNodeKey` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:160` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `construct` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6875` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `createExtensionRecord` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:370` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `innerOk` | `internal:assert/utils:9` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1054` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `valueRoot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:312` |
| 0.0% | 1.2ms | 0.0% | 165.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:98` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `createWrappedContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:354` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `visit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:1830` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7543` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:91` |
| 0.0% | 1.2ms | 0.0% | 4.0ms | `freezeIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:357` |
| 0.0% | 1.2ms | 0.0% | 2.5ms | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7834` |
| 0.0% | 1.2ms | 0.0% | 93.0ms | `visitDeclarative` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2772` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `writer` | `[native code]` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `addTouching` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:941` |
| 0.0% | 1.2ms | 0.0% | 5.7ms | `createEditorCommit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:1004` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `read` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-lifecycle-api.ts:214` |
| 0.0% | 1.2ms | 0.0% | 4.9ms | `constructCanonicalDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1042` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `groupRelocationCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:162` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `path` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-read-runtime.ts` |
| 0.0% | 1.2ms | 0.0% | 3.8ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1178` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `fit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1649` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts:438` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `Error` | `[native code]` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `appendNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:106` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `composeSections` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:606` |
| 0.0% | 1.2ms | 0.0% | 2.5ms | `sliceMaterialized` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:784` |
| 0.0% | 1.2ms | 0.0% | 8.7ms | `pushUpdateTagContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/update-context.ts:17` |
| 0.0% | 1.2ms | 0.3% | 733.1ms | `classifyRootChangeWithRuntimeCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:177` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `get tokens` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:523` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `closeScopedTransactionAnchors` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:603` |
| 0.0% | 1.2ms | 0.0% | 2.2ms | `applyIndexed` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2210` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `applyAnchorChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:317` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `getActiveAnchorState` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:80` |
| 0.0% | 1.2ms | 0.0% | 2.7ms | `createEditorDocumentValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:854` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:206` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `bind` | `[native code]` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `applyTransactionSpecDocumentChangeStep` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7409` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `isEditorJsonValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:122` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `enterEditorRead` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:754` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `applyCanonical` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts` |
| 0.0% | 1.1ms | 0.0% | 5.9ms | `setSelectionValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6140` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `normalizeEditorValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/initial-value.ts` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `openToken` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:293` |
| 0.0% | 1.1ms | 0.0% | 22.6ms | `paragraph` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:63` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3577` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `resolveLatestExtensionEntries` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts` |
| 0.0% | 1.1ms | 0.0% | 3.6ms | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:116` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `replacements` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts` |
| 0.0% | 1.1ms | 0.0% | 2.4ms | `sliceMaterialized` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:783` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `createCommitChanged` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:952` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `recordStats` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2570` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `canonicalizeNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:245` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `withInsertedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2736` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `getSelectionStateSelection` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-state.ts:11` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `isTextNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `fit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3008` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `fit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1650` |
| 0.0% | 1.1ms | 0.0% | 9.3ms | `mapPosition` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1169` |
| 0.0% | 1.1ms | 0.0% | 2.4ms | `mapSelectionThroughChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:891` |
| 0.0% | 1.1ms | 0.0% | 2.2ms | `fit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1762` |
| 0.0% | 1.1ms | 0.0% | 2.4ms | `childBoundaryAt` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:115` |
| 0.0% | 1.1ms | 0.0% | 100.8ms | `visitDeclarative` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2823` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `applyTransactionSpecDocumentChangeStep` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7334` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `createCommitChanged` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:404` |
| 0.0% | 1.1ms | 0.0% | 5.2ms | `validateDeclarativeDocument` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3068` |
| 0.0% | 1.1ms | 0.0% | 22.3ms | `applyTransactionSpecDocumentChangeStep` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7350` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:316` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `collect` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:80` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `validateDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3633` |
| 0.0% | 1.1ms | 0.0% | 3.8ms | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:115` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `addSection` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:583` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `replacements` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2450` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `apply` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:464` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `mapPoint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `fitDocument` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` |
| 0.0% | 1.1ms | 0.0% | 5.8ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:170` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `cleanup` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `finalizeTransactionSpecContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5441` |
| 0.0% | 1.1ms | 0.0% | 20.2ms | `addRange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:887` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:53` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `mapIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7273` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `positionAt` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `fit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1739` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `classifyRootChangeWithRuntimeCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:124` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `withEditorUpdateRoot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:715` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `get empty` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2022` |
| 0.0% | 1.1ms | 0.0% | 37.9ms | `classifyDocumentRange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:41` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `advanceNextNodeKey` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:129` |
| 0.0% | 1.1ms | 6.2% | 13.17s | `fitRoot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3225` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `compileEditorSchemaInternal` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts` |
| 0.0% | 1.1ms | 0.0% | 6.2ms | `constructCanonicalDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1004` |
| 0.0% | 1.1ms | 0.7% | 1.53s | `constructDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:766` |
| 0.0% | 1.1ms | 0.0% | 78.2ms | `validateDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3651` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `visit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:185` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `getTransactionView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6429` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `toSchemaValidationLocation` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:382` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1042` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `mergeRegistries` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:534` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `createCommitChanged` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:407` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `concat` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:675` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `getTransactionView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `advancePathStableSnapshotIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1825` |
| 0.0% | 1.1ms | 0.0% | 32.1ms | `constructCanonicalDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1147` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `applyDocumentChangeValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1257` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `reconcileChildrenStep` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `replace` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/editor.ts` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `getUpdateView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4653` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `nodeRangesTouching` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:182` |
| 0.0% | 1.1ms | 0.0% | 82.0ms | `allContentAllowed` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:280` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `createEditorUpdateDraftContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7644` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:523` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `validateCompleteExtensionGraph` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:1798` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `insertText` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/transforms-text/insert-text.ts` |
| 0.0% | 1.1ms | 0.0% | 9.2ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1183` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `isInteger` | `[native code]` |
| 0.0% | 1.1ms | 0.0% | 2.5ms | `withEditorRootChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5899` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `recordStats` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2568` |
| 0.0% | 1.1ms | 0.0% | 68.7ms | `getElementBehavior` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:954` |
| 0.0% | 1.1ms | 0.0% | 2.1ms | `validateDeclarativeDocument` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3031` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `getLastCommit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `applyTrustedCanonical` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:607` |
| 0.0% | 1.1ms | 0.0% | 18.2ms | `getElementContentRoots` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:959` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `recordFacetCommit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/facet.ts:176` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `visit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:210` |
| 0.0% | 1.1ms | 0.0% | 112.0ms | `PreparedTokenSlice` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:513` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8008` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `validateTextProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `fromValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts` |
| 0.0% | 1.1ms | 0.0% | 5.0ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:127` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8046` |
| 0.0% | 1.1ms | 0.0% | 4.0ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:365` |
| 0.0% | 1.1ms | 0.0% | 153.1ms | `nodeRangesTouching` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:224` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `cacheIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:390` |
| 0.0% | 1.1ms | 0.0% | 61.4ms | `deepFreeze` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:163` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `applyIndexed` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `applyTransactionSpecDocumentChangeStep` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7332` |
| 0.0% | 1.0ms | 0.0% | 74.5ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8112` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `syncImplicitTargetToCurrentSelection` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6362` |
| 0.0% | 1.0ms | 0.0% | 5.4ms | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:101` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `finalize` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:753` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `notifyListeners` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7493` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `pathKey` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `applyPreparedTransactionSpecChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `assertRemoteCommit` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:148` |
| 0.0% | 1.0ms | 26.3% | 55.84s | `applyDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7464` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `propertyChanges` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2458` |
| 0.0% | 1.0ms | 0.0% | 2.2ms | `classifyRootChangeWithRuntimeCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:157` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `getUpdateView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4757` |
| 0.0% | 1.0ms | 0.0% | 2.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3151` |
| 0.0% | 1.0ms | 0.0% | 22.6ms | `isText` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:194` |
| 0.0% | 1.0ms | 0.0% | 5.0ms | `DocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:750` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `buildConfiguredRegistry` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:2044` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `setCachedSnapshot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:921` |
| 0.0% | 1.0ms | 0.0% | 5.1ms | `validateSubtree` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3610` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `addParentIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3470` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `equalValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:151` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:114` |
| 0.0% | 1.0ms | 0.0% | 37.1ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:225` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `initializePublicState` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `getLastCommit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/editor.ts:4463` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `get done` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts` |
| 0.0% | 1.0ms | 0.0% | 18.3ms | `isStrictPoint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:118` |
| 0.0% | 1.0ms | 0.0% | 9.6ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:333` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `canonicalizeDirectChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:201` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `createEditorCommit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:1029` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `createEditorSchema` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2727` |
| 0.0% | 1.0ms | 0.0% | 5.7ms | `freezeRootClassification` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:283` |
| 0.0% | 1.0ms | 1.7% | 3.64s | `encodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:945` |
| 0.0% | 1.0ms | 0.0% | 194.4ms | `mapSnapshotIndexThroughChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1504` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `groupRelocationCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:174` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `applyDocumentChangeValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1278` |
| 0.0% | 1.0ms | 0.0% | 2.1ms | `ensureElementOwnedRootIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:764` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `edges` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/range.ts:107` |
| 0.0% | 1.0ms | 5.3% | 11.28s | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3169` |
| 0.0% | 1.0ms | 0.0% | 2.3ms | `empty` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1569` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `getElementOwnedRootIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:402` |
| 0.0% | 1.0ms | 0.0% | 2.3ms | `replaceCanonicalChildWindow` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:806` |
| 0.0% | 1.0ms | 0.0% | 8.6ms | `createCommitChanged` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:405` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `fork` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:235` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `prepareScopedEditorExtensionPublication` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:2599` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2117` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `stageFields` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `deepFreeze` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:162` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `classifyRootChangeWithRuntimeCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:121` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `materializeTokens` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:529` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `applyTrustedCanonical` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:566` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `guardTransactionValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:3861` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1763` |
| 0.0% | 1.0ms | 0.0% | 14.1ms | `validateSubtree` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3604` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `isElement` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/element.ts:132` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `get` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6711` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `getNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `rawNodeAt` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:109` |
| 0.0% | 1.0ms | 10.3% | 21.85s | `assertSchemaJsonValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2697` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `inheritDocumentChangeStepNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7216` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts` |
| 0.0% | 1.0ms | 0.0% | 2.4ms | `prepareCanonicalRootFit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:734` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `nodeRangesTouching` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:176` |
| 0.0% | 1.0ms | 0.0% | 3.5ms | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8050` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `seek` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:433` |
| 0.0% | 977us | 0.0% | 977us | `replacements` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2433` |
| 0.0% | 942us | 0.0% | 942us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:113` |
| 0.0% | 861us | 0.0% | 8.3ms | `freezeReadonlyMap` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:197` |

## Call Tree (Total Time)

| Total% | Total | Self% | Self | Function | Location |
|-------:|------:|------:|-----:|----------|----------|
| 100.0% | 242.52s | 7.5% | 15.94s | `map` | `[native code]` |
| 99.9% | 212.06s | 0.0% | 0us | `evaluate` | `[native code]` |
| 99.9% | 212.06s | 0.0% | 0us | `async asyncModuleEvaluation` | `[native code]` |
| 99.9% | 212.05s | 0.0% | 0us | `(module)` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:437` |
| 99.9% | 212.05s | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:437` |
| 91.6% | 194.29s | 0.0% | 2.5ms | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7821` |
| 79.1% | 167.96s | 0.0% | 2.7ms | `(host)` | `[native code]` |
| 79.1% | 167.90s | 0.0% | 0us | `update` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-lifecycle-api.ts:425` |
| 79.1% | 167.89s | 0.0% | 0us | `withUpdateTagContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:1725` |
| 78.2% | 165.90s | 0.0% | 0us | `measure` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:198` |
| 65.2% | 138.29s | 0.0% | 0us | `replaceSnapshot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8512` |
| 65.2% | 138.29s | 0.0% | 0us | `replaceTransformedSnapshot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8377` |
| 56.1% | 119.09s | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8454` |
| 56.1% | 119.09s | 0.0% | 0us | `createRootFitTransactionSpec` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8158` |
| 56.1% | 119.08s | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5676` |
| 56.1% | 119.08s | 0.0% | 0us | `buildTransactionSpec` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5675` |
| 56.1% | 119.08s | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8159` |
| 52.8% | 112.20s | 0.0% | 0us | `measureCohort` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:422` |
| 51.1% | 108.42s | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:320` |
| 51.0% | 108.30s | 0.0% | 0us | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7801` |
| 51.0% | 108.26s | 0.0% | 0us | `replace` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5120` |
| 51.0% | 108.26s | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:321` |
| 50.9% | 108.12s | 0.0% | 0us | `applyTransactionSpecDocumentChangeStep` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7354` |
| 50.9% | 108.10s | 0.0% | 0us | `inheritDocumentChangeStepNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7310` |
| 50.4% | 107.00s | 0.0% | 0us | `mapSnapshotIndexThroughChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1353` |
| 49.7% | 105.44s | 0.0% | 0us | `applyDocumentChangeStep` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6949` |
| 49.7% | 105.43s | 0.0% | 0us | `fit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3156` |
| 49.7% | 105.43s | 0.0% | 0us | `apply` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8161` |
| 49.4% | 104.83s | 1.1% | 2.40s | `filter` | `[native code]` |
| 49.3% | 104.75s | 0.0% | 10.4ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1163` |
| 29.4% | 62.54s | 1.8% | 3.93s | `every` | `[native code]` |
| 27.6% | 58.69s | 0.0% | 1.4ms | `runRemoteChangesSeparately` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:240` |
| 27.0% | 57.32s | 0.0% | 0us | `apply` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4597` |
| 26.3% | 55.84s | 0.0% | 1.0ms | `applyDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7464` |
| 23.7% | 50.44s | 0.0% | 1.3ms | `assertDocument` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3150` |
| 23.3% | 49.60s | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:240` |
| 22.7% | 48.30s | 0.0% | 0us | `applyCanonical` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:519` |
| 22.7% | 48.30s | 0.0% | 0us | `validate` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6898` |
| 22.7% | 48.22s | 0.2% | 561.8ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1170` |
| 19.7% | 41.92s | 19.7% | 41.92s | `nodeAtPath` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:261` |
| 19.3% | 41.09s | 0.0% | 0us | `measureCohort` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:417` |
| 19.3% | 41.09s | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:254` |
| 14.5% | 30.78s | 0.6% | 1.28s | `forEach` | `[native code]` |
| 14.1% | 30.03s | 0.0% | 0us | `createEditorWithDocument` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:88` |
| 14.1% | 30.03s | 0.0% | 0us | `replace` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/editor.ts:4679` |
| 14.1% | 30.03s | 0.0% | 0us | `replaceEditorSnapshot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/editor.ts:4376` |
| 13.9% | 29.62s | 1.0% | 2.15s | `nodeText` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1109` |
| 12.4% | 26.35s | 0.0% | 57.6ms | `assertJsonValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:309` |
| 12.0% | 25.55s | 0.0% | 91.8ms | `isEditorJsonValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:131` |
| 11.9% | 25.25s | 0.0% | 50.1ms | `isEditorJsonValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:139` |
| 11.3% | 24.03s | 0.0% | 13.2ms | `validateDeclarativeChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2608` |
| 10.9% | 23.26s | 5.2% | 11.06s | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1164` |
| 10.9% | 23.21s | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3181` |
| 10.8% | 23.11s | 0.0% | 0us | `measureCohort` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:400` |
| 10.3% | 21.85s | 0.0% | 1.0ms | `assertSchemaJsonValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2697` |
| 9.5% | 20.17s | 0.4% | 951.1ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1169` |
| 8.6% | 18.33s | 0.0% | 0us | `node` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:591` |
| 8.4% | 17.95s | 0.0% | 1.4ms | `validateDeclarativeDocument` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3106` |
| 7.7% | 16.51s | 0.0% | 0us | `measureCohort` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:424` |
| 7.4% | 15.87s | 0.0% | 87.1ms | `nodeText` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1121` |
| 6.9% | 14.71s | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8391` |
| 6.9% | 14.70s | 0.0% | 0us | `fitDocument` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3270` |
| 6.9% | 14.65s | 0.0% | 43.8ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2611` |
| 6.4% | 13.77s | 0.0% | 0us | `fit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3056` |
| 6.2% | 13.17s | 0.0% | 1.1ms | `fitRoot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3225` |
| 6.0% | 12.80s | 6.0% | 12.80s | `freeze` | `[native code]` |
| 5.8% | 12.45s | 0.0% | 0us | `applyInternal` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2585` |
| 5.7% | 12.14s | 0.0% | 0us | `forceGc` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:76` |
| 5.7% | 12.14s | 5.7% | 12.14s | `gc` | `[native code]` |
| 5.6% | 11.99s | 5.6% | 11.99s | `isFrozen` | `[native code]` |
| 5.3% | 11.28s | 0.0% | 1.0ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3169` |
| 5.0% | 10.74s | 5.0% | 10.71s | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1174` |
| 4.9% | 10.57s | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3153` |
| 4.8% | 10.31s | 0.0% | 0us | `sameNodeKind` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1125` |
| 4.8% | 10.23s | 0.0% | 155.7ms | `isEditorJsonValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:127` |
| 4.6% | 9.89s | 0.0% | 0us | `isEditorJsonValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:135` |
| 4.6% | 9.80s | 0.0% | 0us | `apply` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:410` |
| 4.5% | 9.59s | 0.2% | 513.4ms | `performProxyObjectGet` | `[native code]` |
| 4.4% | 9.53s | 0.0% | 0us | `fitDocumentInput` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3249` |
| 4.2% | 9.09s | 4.2% | 9.09s | `getOwnPropertyDescriptor` | `[native code]` |
| 4.1% | 8.87s | 0.0% | 0us | `applyIndexed` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2255` |
| 4.1% | 8.87s | 0.0% | 1.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2258` |
| 3.9% | 8.36s | 0.2% | 601.5ms | `sameNodeKind` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1124` |
| 3.7% | 7.85s | 0.0% | 1.2ms | `rememberValidatedDocumentRoots` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3133` |
| 3.4% | 7.38s | 3.4% | 7.38s | `pathKey` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:109` |
| 3.4% | 7.26s | 0.0% | 0us | `prepareFittedDocument` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1412` |
| 2.9% | 6.24s | 0.0% | 122.1ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2670` |
| 2.9% | 6.18s | 0.0% | 0us | `measureConnectDisconnectHeap` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:366` |
| 2.8% | 5.96s | 0.0% | 0us | `measureConnectDisconnectHeap` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:351` |
| 2.7% | 5.80s | 0.0% | 0us | `runRemoteChangeBatch` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:227` |
| 2.7% | 5.75s | 0.0% | 10.2ms | `validateDeclarativeNodeProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2582` |
| 2.5% | 5.48s | 0.0% | 0us | `runRemoteChangesSeparately` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:237` |
| 2.5% | 5.36s | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3190` |
| 2.5% | 5.33s | 0.0% | 12.2ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:159` |
| 2.3% | 4.92s | 2.3% | 4.92s | `pathKey` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:112` |
| 2.3% | 4.92s | 0.0% | 1.3ms | `fromTokens` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:659` |
| 2.2% | 4.78s | 0.0% | 45.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:151` |
| 2.1% | 4.63s | 0.0% | 0us | `isObjectPrototype` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:32` |
| 2.1% | 4.52s | 0.0% | 0us | `applyTrustedCanonical` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:717` |
| 2.1% | 4.52s | 0.0% | 0us | `adoptCanonicalBaseline` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6858` |
| 2.1% | 4.52s | 0.0% | 0us | `adoptDocumentBaseline` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3714` |
| 2.0% | 4.38s | 0.0% | 3.7ms | `canonicalizeDeclarativeChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1741` |
| 2.0% | 4.31s | 2.0% | 4.31s | `getEditorJsonArrayItems` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:54` |
| 2.0% | 4.26s | 0.1% | 267.2ms | `getEditorJsonRecordEntries` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:95` |
| 2.0% | 4.24s | 0.0% | 0us | `measureCohort` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:416` |
| 2.0% | 4.24s | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:249` |
| 1.9% | 4.21s | 0.0% | 0us | `measureCohort` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:415` |
| 1.9% | 4.15s | 0.0% | 0us | `measureCohort` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:423` |
| 1.9% | 4.04s | 0.1% | 374.1ms | `isDeepFrozenNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3120` |
| 1.8% | 3.93s | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:336` |
| 1.8% | 3.91s | 1.8% | 3.91s | `get` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts:639` |
| 1.8% | 3.89s | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:211` |
| 1.7% | 3.81s | 1.7% | 3.81s | `get` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts:612` |
| 1.7% | 3.77s | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:318` |
| 1.7% | 3.77s | 0.0% | 0us | `validateDeclarativeDocument` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3030` |
| 1.7% | 3.76s | 0.0% | 0us | `getDocumentOwnershipIndexes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:723` |
| 1.7% | 3.76s | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:724` |
| 1.7% | 3.76s | 0.0% | 0us | `measureConnectDisconnectHeap` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:353` |
| 1.7% | 3.71s | 0.0% | 0us | `measureCohort` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:421` |
| 1.7% | 3.64s | 0.0% | 1.0ms | `encodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:945` |
| 1.7% | 3.63s | 0.0% | 0us | `fitDocumentInput` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3253` |
| 1.6% | 3.55s | 0.0% | 1.3ms | `prepareFittedDocument` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1415` |
| 1.6% | 3.55s | 0.0% | 0us | `finalize` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:760` |
| 1.6% | 3.47s | 0.0% | 12.2ms | `validateDeclarativeNodeProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2554` |
| 1.6% | 3.46s | 0.0% | 77.4ms | `getEditorJsonRecordEntries` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:85` |
| 1.6% | 3.43s | 0.0% | 0us | `measureAnchors` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:267` |
| 1.5% | 3.32s | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:2958` |
| 1.5% | 3.32s | 0.0% | 0us | `fit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:2952` |
| 1.4% | 3.07s | 0.5% | 1.11s | `hasIntrinsicConstructor` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:25` |
| 1.4% | 3.04s | 0.2% | 434.9ms | `getEditorJsonArrayItems` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:61` |
| 1.4% | 2.97s | 0.1% | 212.4ms | `next` | `[native code]` |
| 1.3% | 2.95s | 0.0% | 0us | `encodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:948` |
| 1.3% | 2.94s | 0.0% | 0us | `prepareFittedDocument` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1420` |
| 1.2% | 2.74s | 1.2% | 2.74s | `arrayIteratorNextHelper` | `[native code]` |
| 1.2% | 2.70s | 0.0% | 0us | `applyTransactionSpec` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5767` |
| 1.2% | 2.70s | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8452` |
| 1.2% | 2.70s | 0.0% | 0us | `applyCanonical` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:514` |
| 1.2% | 2.70s | 0.0% | 0us | `applyTransactionSpecContents` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5606` |
| 1.2% | 2.70s | 0.0% | 0us | `applyPreparedTransactionSpecChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5589` |
| 1.2% | 2.65s | 0.0% | 0us | `fit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3002` |
| 1.2% | 2.64s | 0.0% | 158.1ms | `hasIntrinsicConstructor` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:20` |
| 1.2% | 2.56s | 0.0% | 0us | `getEditorJsonArrayItems` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:49` |
| 1.1% | 2.50s | 0.0% | 0us | `fit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:2864` |
| 1.1% | 2.48s | 0.0% | 1.4ms | `applyIndexed` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2226` |
| 1.1% | 2.44s | 0.0% | 21.6ms | `PreparedTokenSlice` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:489` |
| 1.1% | 2.41s | 1.1% | 2.41s | `entries` | `[native code]` |
| 1.1% | 2.36s | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:2862` |
| 1.1% | 2.36s | 0.0% | 0us | `getContentEndOffset` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1276` |
| 1.0% | 2.25s | 0.0% | 0us | `reconcileChildrenStep` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:3174` |
| 1.0% | 2.25s | 0.0% | 0us | `fromNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:602` |
| 1.0% | 2.23s | 1.0% | 2.23s | `copyDataProperties` | `[native code]` |
| 1.0% | 2.21s | 0.0% | 133.2ms | `isDeepFrozenNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3122` |
| 1.0% | 2.18s | 0.0% | 1.4ms | `withText` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:861` |
| 1.0% | 2.18s | 1.0% | 2.18s | `getEditorJsonRecordEntries` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:92` |
| 0.9% | 2.05s | 0.0% | 0us | `classify` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:364` |
| 0.9% | 2.05s | 0.9% | 2.05s | `nodeAtPath` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:264` |
| 0.9% | 2.04s | 0.0% | 4.7ms | `encodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:909` |
| 0.9% | 2.02s | 0.0% | 63.2ms | `validateDeclarativeNodeProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2546` |
| 0.9% | 2.02s | 0.0% | 0us | `rememberValidatedDocumentRoots` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3132` |
| 0.9% | 2.01s | 0.0% | 0us | `createEditorDocumentValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:874` |
| 0.9% | 2.00s | 0.9% | 2.00s | `join` | `[native code]` |
| 0.9% | 1.99s | 0.6% | 1.40s | `flatMap` | `[native code]` |
| 0.9% | 1.97s | 0.0% | 1.5ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:247` |
| 0.9% | 1.96s | 0.9% | 1.96s | `toString` | `[native code]` |
| 0.9% | 1.95s | 0.0% | 8.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:742` |
| 0.9% | 1.94s | 0.9% | 1.94s | `nodeAtPath` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:255` |
| 0.8% | 1.88s | 0.0% | 0us | `measureCohort` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:399` |
| 0.8% | 1.80s | 0.0% | 0us | `replaceIndexedChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:314` |
| 0.8% | 1.77s | 0.8% | 1.77s | `read` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts` |
| 0.8% | 1.76s | 0.0% | 0us | `isDeepFrozenNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3123` |
| 0.8% | 1.70s | 0.0% | 1.5ms | `materializeTokens` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:552` |
| 0.7% | 1.69s | 0.0% | 90.6ms | `validateTextProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2464` |
| 0.7% | 1.69s | 0.0% | 17.9ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:743` |
| 0.7% | 1.69s | 0.0% | 0us | `fromValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:518` |
| 0.7% | 1.68s | 0.0% | 9.1ms | `PreparedTokenSlice` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:505` |
| 0.7% | 1.67s | 0.0% | 38.4ms | `validateDeclarativeNodeProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2568` |
| 0.7% | 1.64s | 0.0% | 77.0ms | `canonicalizeDeclarativePropertyRecord` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1573` |
| 0.7% | 1.63s | 0.0% | 17.7ms | `encode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:938` |
| 0.7% | 1.58s | 0.7% | 1.58s | `isEditorJsonValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:123` |
| 0.7% | 1.53s | 0.0% | 1.1ms | `constructDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:766` |
| 0.7% | 1.53s | 0.0% | 0us | `createInternalDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:577` |
| 0.7% | 1.52s | 0.0% | 0us | `DocumentIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:487` |
| 0.7% | 1.49s | 0.0% | 0us | `constructCanonicalDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1099` |
| 0.7% | 1.49s | 0.0% | 9.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1795` |
| 0.6% | 1.48s | 0.0% | 0us | `applyDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7466` |
| 0.6% | 1.46s | 0.0% | 1.3ms | `DocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:734` |
| 0.6% | 1.46s | 0.0% | 1.3ms | `validateDeclarativeDocument` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3108` |
| 0.6% | 1.46s | 0.0% | 25.3ms | `encode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:921` |
| 0.6% | 1.43s | 0.0% | 0us | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7828` |
| 0.6% | 1.43s | 0.0% | 1.4ms | `finalizeTransactionRepresentation` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5389` |
| 0.6% | 1.43s | 0.0% | 0us | `validateConstructed` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6908` |
| 0.6% | 1.43s | 0.0% | 0us | `finalize` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:835` |
| 0.6% | 1.43s | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6909` |
| 0.6% | 1.41s | 0.0% | 47.9ms | `contentAllows` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1247` |
| 0.6% | 1.39s | 0.0% | 0us | `constructCanonicalDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1117` |
| 0.6% | 1.34s | 0.0% | 0us | `encode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:930` |
| 0.6% | 1.34s | 0.0% | 17.5ms | `visitOwnerDeclarations` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:606` |
| 0.6% | 1.33s | 0.0% | 1.5ms | `applyTransactionSpecDocumentChangeStep` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7391` |
| 0.6% | 1.32s | 0.0% | 0us | `isArrayPrototype` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:36` |
| 0.6% | 1.31s | 0.0% | 0us | `fitDocumentInput` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3258` |
| 0.6% | 1.31s | 0.6% | 1.31s | `Set` | `[native code]` |
| 0.6% | 1.30s | 0.0% | 0us | `fit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3003` |
| 0.6% | 1.30s | 0.0% | 11.2ms | `validateDeclarativeRootContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2855` |
| 0.6% | 1.29s | 0.4% | 888.4ms | `isEditorJsonValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:109` |
| 0.5% | 1.25s | 0.0% | 7.8ms | `openToken` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:291` |
| 0.5% | 1.24s | 0.0% | 1.4ms | `isArrayPrototype` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:37` |
| 0.5% | 1.24s | 0.0% | 1.4ms | `cloneFrozen` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:177` |
| 0.5% | 1.20s | 0.0% | 53.1ms | `isEditorJsonValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:142` |
| 0.5% | 1.20s | 0.0% | 0us | `remember` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:539` |
| 0.5% | 1.19s | 0.0% | 32.8ms | `canonicalizeDeclarativePropertyRecord` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1648` |
| 0.5% | 1.17s | 0.0% | 60.0ms | `canonicalizeDeclarativePropertyRecord` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1651` |
| 0.5% | 1.15s | 0.5% | 1.15s | `delete` | `[native code]` |
| 0.5% | 1.15s | 0.0% | 34.0ms | `canonicalizeDeclarativePropertyRecord` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1688` |
| 0.5% | 1.15s | 0.0% | 17.0ms | `readOwnerDeclaration` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:433` |
| 0.5% | 1.13s | 0.0% | 41.8ms | `openToken` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:300` |
| 0.5% | 1.11s | 0.5% | 1.11s | `handleProxyGetTrapResult` | `[native code]` |
| 0.5% | 1.10s | 0.0% | 0us | `setCurrentSelection` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6313` |
| 0.5% | 1.06s | 0.0% | 38.1ms | `cloneJson` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:154` |
| 0.4% | 963.9ms | 0.0% | 0us | `fit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1727` |
| 0.4% | 956.4ms | 0.0% | 23.9ms | `validateDeclarativeNodeProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2587` |
| 0.4% | 948.0ms | 0.0% | 0us | `snapshot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:224` |
| 0.4% | 946.9ms | 0.0% | 0us | `snapshotContentSlice` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:192` |
| 0.4% | 946.4ms | 0.0% | 0us | `snapshotSliceContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:83` |
| 0.4% | 924.4ms | 0.0% | 0us | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7816` |
| 0.4% | 921.7ms | 0.0% | 0us | `measureCohort` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:385` |
| 0.4% | 918.9ms | 0.0% | 0us | `compileRemoteChanges` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:130` |
| 0.4% | 918.9ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:131` |
| 0.4% | 913.8ms | 0.0% | 0us | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:990` |
| 0.4% | 913.8ms | 0.0% | 0us | `getRootChangeRelocations` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:341` |
| 0.4% | 913.8ms | 0.0% | 0us | `getSegmentRelocations` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:501` |
| 0.4% | 908.5ms | 0.0% | 0us | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8005` |
| 0.4% | 905.5ms | 0.0% | 124.6ms | `canonicalizeCompiledExclusiveTextProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:307` |
| 0.4% | 904.2ms | 0.0% | 124.5ms | `toCompiledTargetContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:693` |
| 0.4% | 891.4ms | 0.0% | 0us | `createEditorUpdateDraftContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7727` |
| 0.4% | 888.4ms | 0.0% | 30.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2623` |
| 0.4% | 885.4ms | 0.0% | 0us | `classify` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:374` |
| 0.4% | 868.0ms | 0.0% | 0us | `getCurrentRootSnapshot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6689` |
| 0.4% | 868.0ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6690` |
| 0.4% | 867.6ms | 0.0% | 0us | `runTrustedUpdate` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5886` |
| 0.4% | 860.2ms | 0.0% | 56.6ms | `toSchemaValidationLocation` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:371` |
| 0.3% | 845.2ms | 0.0% | 9.4ms | `fitClosedNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:469` |
| 0.3% | 844.4ms | 0.0% | 1.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1780` |
| 0.3% | 844.2ms | 0.0% | 0us | `closed` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:249` |
| 0.3% | 832.9ms | 0.0% | 194.1ms | `nodeProps` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:833` |
| 0.3% | 813.1ms | 0.1% | 239.6ms | `validateTextProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2460` |
| 0.3% | 801.5ms | 0.0% | 2.1ms | `validateDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3630` |
| 0.3% | 776.4ms | 0.0% | 36.4ms | `validateTextProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2499` |
| 0.3% | 772.3ms | 0.1% | 346.6ms | `toSchemaValidationLocation` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:380` |
| 0.3% | 754.5ms | 0.0% | 0us | `freezeRootClassification` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:276` |
| 0.3% | 749.9ms | 0.0% | 0us | `insertText` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:914` |
| 0.3% | 733.1ms | 0.0% | 1.2ms | `classifyRootChangeWithRuntimeCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:177` |
| 0.3% | 723.7ms | 0.3% | 684.9ms | `get` | `[native code]` |
| 0.3% | 679.2ms | 0.0% | 19.9ms | `fitClosedContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:548` |
| 0.3% | 655.3ms | 0.3% | 655.3ms | `cloneObject` | `[native code]` |
| 0.2% | 635.5ms | 0.0% | 1.3ms | `fit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1696` |
| 0.2% | 634.2ms | 0.0% | 0us | `fitClosedSliceInterior` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:665` |
| 0.2% | 631.2ms | 0.0% | 0us | `constructCanonicalDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1110` |
| 0.2% | 621.2ms | 0.0% | 86.4ms | `bound get` | `[native code]` |
| 0.2% | 621.0ms | 0.0% | 0us | `applyIndexed` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2273` |
| 0.2% | 616.2ms | 0.0% | 20.5ms | `flatIntoArrayWithCallback` | `[native code]` |
| 0.2% | 615.8ms | 0.2% | 613.4ms | `canonicalizeDeclarativePropertyRecord` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1717` |
| 0.2% | 613.4ms | 0.2% | 613.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2674` |
| 0.2% | 612.1ms | 0.0% | 4.8ms | `iterChangedRanges` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2812` |
| 0.2% | 603.9ms | 0.0% | 0us | `deriveRootRelocations` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:264` |
| 0.2% | 602.9ms | 0.0% | 0us | `extendEditor` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:2773` |
| 0.2% | 599.5ms | 0.0% | 0us | `canonicalizeRootChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:314` |
| 0.2% | 597.8ms | 0.0% | 4.0ms | `visit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:634` |
| 0.2% | 582.7ms | 0.0% | 45.6ms | `toSchemaValidationLocation` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:379` |
| 0.2% | 574.2ms | 0.0% | 0us | `measureConnectDisconnectHeap` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:355` |
| 0.2% | 569.6ms | 0.2% | 569.6ms | `push` | `[native code]` |
| 0.2% | 569.2ms | 0.0% | 0us | `withDecodedSplicedNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:683` |
| 0.2% | 568.7ms | 0.0% | 7.6ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:232` |
| 0.2% | 565.1ms | 0.0% | 118.8ms | `performIteration` | `[native code]` |
| 0.2% | 563.0ms | 0.0% | 65.0ms | `PreparedTokenSlice` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:501` |
| 0.2% | 553.7ms | 0.0% | 72.1ms | `canonicalizeDeclarativePropertyRecord` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1725` |
| 0.2% | 550.8ms | 0.0% | 0us | `createTreeIndexNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:64` |
| 0.2% | 545.5ms | 0.0% | 2.6ms | `groupRelocationCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:163` |
| 0.2% | 544.5ms | 0.0% | 45.5ms | `toSchemaValidationLocation` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:377` |
| 0.2% | 544.1ms | 0.0% | 0us | `materializeTokens` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:561` |
| 0.2% | 543.7ms | 0.2% | 543.7ms | `sameNodeKind` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts` |
| 0.2% | 532.5ms | 0.0% | 10.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:155` |
| 0.2% | 517.6ms | 0.2% | 517.6ms | `values` | `[native code]` |
| 0.2% | 502.6ms | 0.0% | 0us | `reconcileChildrenStep` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:3162` |
| 0.2% | 475.3ms | 0.0% | 0us | `encodeTrustedNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:876` |
| 0.2% | 473.7ms | 0.0% | 31.8ms | `classifyRootChangeWithRuntimeCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:166` |
| 0.2% | 460.5ms | 0.0% | 0us | `withSplicedNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:661` |
| 0.2% | 460.1ms | 0.0% | 0us | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7902` |
| 0.2% | 459.6ms | 0.0% | 4.7ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:336` |
| 0.2% | 456.2ms | 0.0% | 0us | `prepareRecordPublication` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:2165` |
| 0.2% | 456.2ms | 0.0% | 0us | `runWithEditorExtensionPublicationGuard` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:689` |
| 0.2% | 448.6ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:2203` |
| 0.2% | 439.7ms | 0.0% | 2.5ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:134` |
| 0.2% | 438.5ms | 0.0% | 0us | `buildConfiguredRegistry` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:1987` |
| 0.2% | 426.1ms | 0.0% | 0us | `fit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3150` |
| 0.2% | 426.1ms | 0.0% | 0us | `adopt` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:319` |
| 0.1% | 422.7ms | 0.0% | 34.1ms | `getTextProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2289` |
| 0.1% | 420.0ms | 0.1% | 420.0ms | `WeakSet` | `[native code]` |
| 0.1% | 411.1ms | 0.0% | 9.0ms | `canonicalizeDeclarativePropertyRecord` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1720` |
| 0.1% | 404.8ms | 0.0% | 0us | `freezeRootClassification` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:303` |
| 0.1% | 389.8ms | 0.0% | 0us | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7933` |
| 0.1% | 383.1ms | 0.0% | 0us | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1209` |
| 0.1% | 381.7ms | 0.0% | 0us | `validateDocument` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:2525` |
| 0.1% | 381.7ms | 0.0% | 0us | `validateCandidateDocument` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:2220` |
| 0.1% | 376.6ms | 0.1% | 376.6ms | `normalizeTokens` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:337` |
| 0.1% | 374.8ms | 0.1% | 374.8ms | `flatIntoArray` | `[native code]` |
| 0.1% | 374.3ms | 0.1% | 374.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2609` |
| 0.1% | 359.0ms | 0.0% | 0us | `validateDeclarativeNodeProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2555` |
| 0.1% | 350.2ms | 0.0% | 2.5ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:229` |
| 0.1% | 347.4ms | 0.0% | 52.5ms | `bound values` | `[native code]` |
| 0.1% | 335.6ms | 0.0% | 0us | `validateSubtree` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3595` |
| 0.1% | 332.2ms | 0.0% | 19.0ms | `deepFreeze` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:169` |
| 0.1% | 330.0ms | 0.0% | 2.6ms | `canonicalizeNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:259` |
| 0.1% | 328.0ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8457` |
| 0.1% | 326.2ms | 0.0% | 0us | `classifyDocumentRange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:82` |
| 0.1% | 325.8ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:330` |
| 0.1% | 323.1ms | 0.1% | 323.1ms | `getEditorJsonArrayItems` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:56` |
| 0.1% | 311.1ms | 0.0% | 0us | `validateDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3485` |
| 0.1% | 305.6ms | 0.1% | 305.6ms | `slice` | `[native code]` |
| 0.1% | 305.2ms | 0.0% | 16.6ms | `encode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:935` |
| 0.1% | 304.1ms | 0.0% | 0us | `runRemoteChangeBatch` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:229` |
| 0.1% | 301.5ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:82` |
| 0.1% | 296.5ms | 0.0% | 0us | `classifyDocumentRange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:67` |
| 0.1% | 294.5ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:214` |
| 0.1% | 292.2ms | 0.1% | 292.2ms | `nodeAtPath` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:260` |
| 0.1% | 289.1ms | 0.0% | 46.0ms | `classifyRootChangeWithRuntimeCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:152` |
| 0.1% | 288.2ms | 0.0% | 20.0ms | `validateSubtree` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3593` |
| 0.1% | 285.0ms | 0.0% | 125.4ms | `validateDeclarativeNodeProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2590` |
| 0.1% | 284.8ms | 0.0% | 0us | `encode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:865` |
| 0.1% | 273.9ms | 0.0% | 8.9ms | `claim` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1021` |
| 0.1% | 272.1ms | 0.0% | 0us | `measureAnchors` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:284` |
| 0.1% | 270.2ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1686` |
| 0.1% | 270.2ms | 0.0% | 0us | `fit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1685` |
| 0.1% | 270.2ms | 0.0% | 0us | `validateSliceVocabulary` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2826` |
| 0.1% | 269.7ms | 0.1% | 269.7ms | `jsonEqual` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:140` |
| 0.1% | 265.8ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:2787` |
| 0.1% | 265.0ms | 0.1% | 263.8ms | `canonicalizeDeclarativePropertyRecord` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1574` |
| 0.1% | 264.6ms | 0.0% | 0us | `cleanup` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:2429` |
| 0.1% | 264.1ms | 0.0% | 0us | `mapSnapshotIndexThroughChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1449` |
| 0.1% | 262.6ms | 0.0% | 0us | `collectChangedElementPaths` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:909` |
| 0.1% | 262.6ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:911` |
| 0.1% | 259.3ms | 0.0% | 2.7ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3492` |
| 0.1% | 251.0ms | 0.0% | 2.2ms | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:137` |
| 0.1% | 248.1ms | 0.0% | 8.6ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1762` |
| 0.1% | 247.7ms | 0.1% | 247.7ms | `set` | `[native code]` |
| 0.1% | 245.1ms | 0.0% | 10.3ms | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:129` |
| 0.1% | 242.2ms | 0.0% | 17.9ms | `replaceIndexedChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:302` |
| 0.1% | 239.6ms | 0.0% | 2.5ms | `structurallyEqual` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:232` |
| 0.1% | 237.2ms | 0.0% | 21.9ms | `normalizeTokens` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:334` |
| 0.1% | 236.7ms | 0.0% | 0us | `deriveRootRelocations` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:258` |
| 0.1% | 235.4ms | 0.0% | 0us | `setCurrentSelection` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6310` |
| 0.1% | 235.1ms | 0.0% | 3.9ms | `hasOnlyKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:45` |
| 0.1% | 234.6ms | 0.0% | 0us | `concat` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:696` |
| 0.1% | 233.7ms | 0.0% | 12.8ms | `openToken` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:301` |
| 0.1% | 233.2ms | 0.0% | 0us | `compose` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2654` |
| 0.1% | 229.3ms | 0.1% | 229.3ms | `jsonEqual` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:137` |
| 0.1% | 224.6ms | 0.0% | 0us | `snapshotSliceContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:81` |
| 0.1% | 224.3ms | 0.0% | 17.8ms | `validateDeclarativeNodeProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2586` |
| 0.1% | 224.1ms | 0.0% | 0us | `validateSubtree` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3617` |
| 0.1% | 222.4ms | 0.0% | 1.4ms | `freezeRootClassification` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:302` |
| 0.1% | 219.1ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:338` |
| 0.1% | 218.1ms | 0.0% | 36.8ms | `canonicalizeDeclarativePropertyRecord` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1569` |
| 0.1% | 215.8ms | 0.0% | 7.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3618` |
| 0.1% | 215.8ms | 0.1% | 215.8ms | `hasIntrinsicConstructor` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:24` |
| 0.1% | 212.6ms | 0.0% | 1.3ms | `isNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:167` |
| 0.0% | 211.6ms | 0.0% | 0us | `addSection` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:589` |
| 0.0% | 210.8ms | 0.0% | 0us | `createTreeIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:71` |
| 0.0% | 210.0ms | 0.0% | 0us | `applyCanonical` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:520` |
| 0.0% | 210.0ms | 0.0% | 0us | `assertCanonical` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6863` |
| 0.0% | 208.4ms | 0.0% | 0us | `compactMappingSegments` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:476` |
| 0.0% | 204.7ms | 0.0% | 204.7ms | `nodeText` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1114` |
| 0.0% | 199.3ms | 0.0% | 0us | `root` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:239` |
| 0.0% | 199.3ms | 0.0% | 11.7ms | `fitClosedNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:460` |
| 0.0% | 194.4ms | 0.0% | 1.0ms | `mapSnapshotIndexThroughChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1504` |
| 0.0% | 194.3ms | 0.0% | 0us | `assertSelectionSupported` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:704` |
| 0.0% | 191.9ms | 0.0% | 190.6ms | `isText` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/text.ts:189` |
| 0.0% | 190.6ms | 0.0% | 0us | `isText` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/node.ts:955` |
| 0.0% | 189.3ms | 0.0% | 11.3ms | `encode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:853` |
| 0.0% | 188.8ms | 0.0% | 187.4ms | `PreparedTokenSlice` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:500` |
| 0.0% | 188.7ms | 0.0% | 0us | `reconcileChildrenStep` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:3152` |
| 0.0% | 185.7ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2398` |
| 0.0% | 185.7ms | 0.0% | 0us | `applyIndexed` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2396` |
| 0.0% | 185.3ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:341` |
| 0.0% | 183.1ms | 0.0% | 8.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:309` |
| 0.0% | 176.6ms | 0.0% | 54.7ms | `fitClosedContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:551` |
| 0.0% | 175.6ms | 0.0% | 0us | `readOwnerDeclaration` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:436` |
| 0.0% | 172.6ms | 0.0% | 172.6ms | `fromEntries` | `[native code]` |
| 0.0% | 170.8ms | 0.0% | 170.8ms | `stringify` | `[native code]` |
| 0.0% | 170.6ms | 0.0% | 0us | `fit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:2990` |
| 0.0% | 169.9ms | 0.0% | 1.3ms | `collectRelocationCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:209` |
| 0.0% | 167.9ms | 0.0% | 29.0ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1788` |
| 0.0% | 167.0ms | 0.0% | 14.0ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2647` |
| 0.0% | 165.8ms | 0.0% | 0us | `fitDocumentInput` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3168` |
| 0.0% | 165.3ms | 0.0% | 1.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:98` |
| 0.0% | 164.4ms | 0.0% | 16.2ms | `validateTextProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2402` |
| 0.0% | 163.0ms | 0.0% | 0us | `encodeTrustedNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:878` |
| 0.0% | 162.6ms | 0.0% | 0us | `canonicalizeNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:250` |
| 0.0% | 162.3ms | 0.0% | 19.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:154` |
| 0.0% | 161.0ms | 0.0% | 14.3ms | `validateDeclarativeNodeProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2558` |
| 0.0% | 157.2ms | 0.0% | 0us | `reconcileChildrenStep` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:3180` |
| 0.0% | 156.8ms | 0.0% | 156.8ms | `visitOwnerDeclarations` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:621` |
| 0.0% | 156.7ms | 0.0% | 2.7ms | `validateDeclarativeRootContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2854` |
| 0.0% | 155.6ms | 0.0% | 3.5ms | `visitDescendantPaths` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/provenance.ts:48` |
| 0.0% | 154.6ms | 0.0% | 0us | `isDeepFrozenNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3121` |
| 0.0% | 154.0ms | 0.0% | 3.9ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:975` |
| 0.0% | 153.8ms | 0.0% | 7.6ms | `cloneJson` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:149` |
| 0.0% | 153.7ms | 0.0% | 0us | `jsonEqual` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:141` |
| 0.0% | 153.1ms | 0.0% | 1.1ms | `nodeRangesTouching` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:224` |
| 0.0% | 152.8ms | 0.0% | 152.8ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:879` |
| 0.0% | 151.9ms | 0.0% | 1.3ms | `classifyRootChangeWithRuntimeCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:219` |
| 0.0% | 151.6ms | 0.0% | 0us | `applyIndexed` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2392` |
| 0.0% | 151.6ms | 0.0% | 0us | `slice` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:879` |
| 0.0% | 151.1ms | 0.0% | 35.8ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:183` |
| 0.0% | 150.4ms | 0.0% | 28.7ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1746` |
| 0.0% | 150.4ms | 0.0% | 1.4ms | `classifyRootChangeWithRuntimeCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:224` |
| 0.0% | 148.7ms | 0.0% | 0us | `tokens` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:500` |
| 0.0% | 148.3ms | 0.0% | 0us | `cloneJson` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:153` |
| 0.0% | 148.3ms | 0.0% | 142.1ms | `sort` | `[native code]` |
| 0.0% | 146.8ms | 0.0% | 146.8ms | `getEditorJsonRecordEntries` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:101` |
| 0.0% | 144.8ms | 0.0% | 0us | `encodeContentSlice` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:456` |
| 0.0% | 144.8ms | 0.0% | 0us | `encodeContentSliceContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:436` |
| 0.0% | 144.8ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:2856` |
| 0.0% | 144.4ms | 0.0% | 0us | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:246` |
| 0.0% | 143.3ms | 0.0% | 1.5ms | `fromPreparedNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:614` |
| 0.0% | 142.9ms | 0.0% | 142.9ms | `canonicalizeDeclarativePropertyRecord` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1540` |
| 0.0% | 141.4ms | 0.0% | 0us | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:113` |
| 0.0% | 141.0ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8132` |
| 0.0% | 141.0ms | 0.0% | 0us | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8131` |
| 0.0% | 140.2ms | 0.0% | 0us | `reconcileChildrenStep` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:3181` |
| 0.0% | 139.3ms | 0.0% | 92.7ms | `canonicalizeCompiledExclusiveTextProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:318` |
| 0.0% | 137.2ms | 0.0% | 24.1ms | `addOwnPath` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3479` |
| 0.0% | 136.3ms | 0.0% | 0us | `notifyListeners` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7532` |
| 0.0% | 135.1ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7537` |
| 0.0% | 135.1ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:1219` |
| 0.0% | 134.8ms | 0.0% | 5.4ms | `addRange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:889` |
| 0.0% | 132.2ms | 0.0% | 62.5ms | `PreparedTokenSlice` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:504` |
| 0.0% | 132.1ms | 0.0% | 0us | `visit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:212` |
| 0.0% | 131.6ms | 0.0% | 1.4ms | `constructCanonicalDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1205` |
| 0.0% | 130.5ms | 0.0% | 0us | `get` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts:610` |
| 0.0% | 129.0ms | 0.0% | 6.6ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:970` |
| 0.0% | 127.0ms | 0.0% | 86.3ms | `some` | `[native code]` |
| 0.0% | 123.8ms | 0.0% | 21.5ms | `resolveCompiledSchemaProperty` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts:3145` |
| 0.0% | 122.3ms | 0.0% | 122.3ms | `fitClosedContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:547` |
| 0.0% | 121.9ms | 0.0% | 40.4ms | `findWrappingForContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:433` |
| 0.0% | 121.3ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:149` |
| 0.0% | 121.1ms | 0.0% | 1.4ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:71` |
| 0.0% | 119.3ms | 0.0% | 58.5ms | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:121` |
| 0.0% | 117.6ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1212` |
| 0.0% | 114.6ms | 0.0% | 28.3ms | `cache` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1476` |
| 0.0% | 114.5ms | 0.0% | 1.4ms | `getElementContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:931` |
| 0.0% | 113.4ms | 0.0% | 113.4ms | `createEntry` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:321` |
| 0.0% | 112.4ms | 0.0% | 8.1ms | `canonicalizeDeclarativePropertyRecord` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1649` |
| 0.0% | 112.0ms | 0.0% | 1.1ms | `PreparedTokenSlice` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:513` |
| 0.0% | 112.0ms | 0.0% | 21.6ms | `bound has` | `[native code]` |
| 0.0% | 110.5ms | 0.0% | 0us | `canonicalizeDirectChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:198` |
| 0.0% | 110.0ms | 0.0% | 0us | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:226` |
| 0.0% | 109.2ms | 0.0% | 0us | `applyTransactionSpecDocumentChangeStep` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7370` |
| 0.0% | 107.0ms | 0.0% | 0us | `composeSections` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:657` |
| 0.0% | 106.9ms | 0.0% | 0us | `composeSections` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:668` |
| 0.0% | 105.7ms | 0.0% | 105.7ms | `has` | `[native code]` |
| 0.0% | 104.9ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1392` |
| 0.0% | 104.9ms | 0.0% | 0us | `mapSnapshotIndexThroughChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1389` |
| 0.0% | 104.5ms | 0.0% | 104.5ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:747` |
| 0.0% | 104.0ms | 0.0% | 104.0ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:76` |
| 0.0% | 103.8ms | 0.0% | 2.4ms | `addOwnPath` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3482` |
| 0.0% | 103.4ms | 0.0% | 0us | `mapSnapshotIndexThroughChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1417` |
| 0.0% | 103.3ms | 0.0% | 0us | `visitOwnerDeclarations` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:616` |
| 0.0% | 102.1ms | 0.0% | 18.0ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1137` |
| 0.0% | 101.8ms | 0.0% | 2.3ms | `encode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:849` |
| 0.0% | 100.8ms | 0.0% | 1.1ms | `visitDeclarative` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2823` |
| 0.0% | 99.6ms | 0.0% | 0us | `commit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/history/history-extension.ts:537` |
| 0.0% | 99.3ms | 0.0% | 7.4ms | `validateSubtree` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3588` |
| 0.0% | 98.1ms | 0.0% | 0us | `fitDirectContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:324` |
| 0.0% | 96.6ms | 0.0% | 96.6ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:84` |
| 0.0% | 95.6ms | 0.0% | 1.4ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1211` |
| 0.0% | 93.0ms | 0.0% | 1.2ms | `visitDeclarative` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2772` |
| 0.0% | 89.4ms | 0.0% | 9.1ms | `addRange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:896` |
| 0.0% | 88.6ms | 0.0% | 0us | `assertNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:904` |
| 0.0% | 87.8ms | 0.0% | 0us | `apply` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:426` |
| 0.0% | 87.5ms | 0.0% | 0us | `canonicalizeNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:253` |
| 0.0% | 86.0ms | 0.0% | 0us | `structurallyEqual` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:250` |
| 0.0% | 84.7ms | 0.0% | 2.2ms | `getCompiledElement` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:926` |
| 0.0% | 84.3ms | 0.0% | 24.9ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:303` |
| 0.0% | 83.4ms | 0.0% | 1.2ms | `jsonEqual` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:131` |
| 0.0% | 83.1ms | 0.0% | 2.5ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1744` |
| 0.0% | 82.2ms | 0.0% | 0us | `replaceIndexedChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:313` |
| 0.0% | 82.0ms | 0.0% | 1.1ms | `allContentAllowed` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:280` |
| 0.0% | 79.5ms | 0.0% | 0us | `insertText` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:909` |
| 0.0% | 79.5ms | 0.0% | 0us | `getIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:1099` |
| 0.0% | 79.0ms | 0.0% | 1.4ms | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8052` |
| 0.0% | 79.0ms | 0.0% | 0us | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8109` |
| 0.0% | 78.8ms | 0.0% | 70.9ms | `fitClosedContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:604` |
| 0.0% | 78.5ms | 0.0% | 2.5ms | `visitDeclarative` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2733` |
| 0.0% | 78.4ms | 0.0% | 5.9ms | `encode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:915` |
| 0.0% | 78.2ms | 0.0% | 1.1ms | `validateDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3651` |
| 0.0% | 77.7ms | 0.0% | 0us | `canonicalizeDirectChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:225` |
| 0.0% | 77.4ms | 0.0% | 0us | `mapSnapshotIndexThroughChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1382` |
| 0.0% | 77.4ms | 0.0% | 8.4ms | `encode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:926` |
| 0.0% | 77.4ms | 0.0% | 4.7ms | `fitClosedContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:596` |
| 0.0% | 77.1ms | 0.0% | 0us | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:227` |
| 0.0% | 76.2ms | 0.0% | 7.2ms | `visit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:218` |
| 0.0% | 76.1ms | 0.0% | 0us | `mapSnapshotIndexThroughChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1377` |
| 0.0% | 75.3ms | 0.0% | 75.3ms | `createTreeIndexChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:42` |
| 0.0% | 74.6ms | 0.0% | 0us | `nodeRangesTouching` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:578` |
| 0.0% | 74.5ms | 0.0% | 0us | `freezeRootClassification` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:287` |
| 0.0% | 74.5ms | 0.0% | 1.0ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8112` |
| 0.0% | 72.9ms | 0.0% | 0us | `DocumentIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:491` |
| 0.0% | 72.9ms | 0.0% | 41.3ms | `visitOwnerDeclarations` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:617` |
| 0.0% | 72.3ms | 0.0% | 0us | `apply` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:485` |
| 0.0% | 71.5ms | 0.0% | 2.6ms | `isInline` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3763` |
| 0.0% | 71.5ms | 0.0% | 0us | `hasInlineContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:92` |
| 0.0% | 71.1ms | 0.0% | 0us | `DocumentIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:486` |
| 0.0% | 70.6ms | 0.0% | 0us | `fit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1655` |
| 0.0% | 70.6ms | 0.0% | 0us | `createRootFitPathProvenance` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/provenance.ts:81` |
| 0.0% | 70.2ms | 0.0% | 44.5ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1197` |
| 0.0% | 70.0ms | 0.0% | 2.5ms | `async (anonymous)` | `[native code]` |
| 0.0% | 69.6ms | 0.0% | 0us | `mapTo` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts:609` |
| 0.0% | 69.6ms | 0.0% | 0us | `change` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts:670` |
| 0.0% | 69.6ms | 0.0% | 0us | `notifyAnchorChanges` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:437` |
| 0.0% | 68.9ms | 0.0% | 67.8ms | `canonicalizeCompiledExclusiveTextProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:342` |
| 0.0% | 68.8ms | 0.0% | 68.8ms | `structuredClone` | `[native code]` |
| 0.0% | 68.7ms | 0.0% | 1.1ms | `getElementBehavior` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:954` |
| 0.0% | 68.6ms | 0.0% | 0us | `withEditorUpdateRoot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:718` |
| 0.0% | 67.7ms | 0.0% | 55.9ms | `fitClosedContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:589` |
| 0.0% | 67.1ms | 0.0% | 0us | `classifyDocumentRange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:44` |
| 0.0% | 65.9ms | 0.0% | 0us | `apply` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:441` |
| 0.0% | 65.7ms | 0.0% | 3.9ms | `encode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:873` |
| 0.0% | 65.1ms | 0.0% | 65.1ms | `getDescendant` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:502` |
| 0.0% | 64.8ms | 0.0% | 7.0ms | `encode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:868` |
| 0.0% | 64.1ms | 0.0% | 64.1ms | `structurallyEqual` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:246` |
| 0.0% | 63.9ms | 0.0% | 0us | `between` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1558` |
| 0.0% | 63.5ms | 0.0% | 63.5ms | `structurallyEqual` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:249` |
| 0.0% | 63.5ms | 0.0% | 63.5ms | `canonicalizeDeclarativePropertyRecord` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1533` |
| 0.0% | 63.4ms | 0.0% | 26.0ms | `PreparedTokenSlice` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:502` |
| 0.0% | 62.9ms | 0.0% | 62.9ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1728` |
| 0.0% | 62.8ms | 0.0% | 0us | `reconcileChildrenStep` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:3182` |
| 0.0% | 61.9ms | 0.0% | 1.3ms | `classifyRootChangeWithRuntimeCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:176` |
| 0.0% | 61.7ms | 0.0% | 61.7ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1743` |
| 0.0% | 61.4ms | 0.0% | 1.1ms | `deepFreeze` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:163` |
| 0.0% | 60.5ms | 0.0% | 60.5ms | `canonicalizeDeclarativePropertyRecord` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1570` |
| 0.0% | 60.4ms | 0.0% | 0us | `classifyRootChangeWithRuntimeCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:165` |
| 0.0% | 59.6ms | 0.0% | 59.6ms | `getNodeKeyForNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:63` |
| 0.0% | 58.5ms | 0.0% | 0us | `retainOrigin` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:449` |
| 0.0% | 58.4ms | 0.0% | 0us | `mapSelectionThroughChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:908` |
| 0.0% | 58.3ms | 0.0% | 10.5ms | `validationContentAllows` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1257` |
| 0.0% | 58.0ms | 0.0% | 12.4ms | `visitDeclarative` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2780` |
| 0.0% | 57.1ms | 0.0% | 0us | `link` | `[native code]` |
| 0.0% | 56.1ms | 0.0% | 0us | `validateDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3658` |
| 0.0% | 56.0ms | 0.0% | 18.8ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:968` |
| 0.0% | 55.5ms | 0.0% | 5.0ms | `canonicalizeDeclarativeChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1808` |
| 0.0% | 55.1ms | 0.0% | 55.1ms | `getEditorJsonArrayItems` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:67` |
| 0.0% | 54.7ms | 0.0% | 54.7ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:254` |
| 0.0% | 54.2ms | 0.0% | 1.5ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5849` |
| 0.0% | 54.0ms | 0.0% | 6.6ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1148` |
| 0.0% | 53.4ms | 0.0% | 0us | `resolveMappedPoint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts:467` |
| 0.0% | 53.4ms | 0.0% | 0us | `memoize` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:245` |
| 0.0% | 52.6ms | 0.0% | 0us | `applyIndexed` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2391` |
| 0.0% | 51.9ms | 0.0% | 18.7ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:237` |
| 0.0% | 51.7ms | 0.0% | 0us | `compose` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1093` |
| 0.0% | 51.6ms | 0.0% | 0us | `get` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:1033` |
| 0.0% | 51.4ms | 0.0% | 51.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/provenance.ts:49` |
| 0.0% | 50.6ms | 0.0% | 1.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:290` |
| 0.0% | 50.5ms | 0.0% | 0us | `sliceMaterialized` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:810` |
| 0.0% | 50.5ms | 0.0% | 2.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:112` |
| 0.0% | 49.9ms | 0.0% | 1.3ms | `classifyRootChangeWithRuntimeCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:164` |
| 0.0% | 49.9ms | 0.0% | 0us | `invoke` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-lifecycle-api.ts:405` |
| 0.0% | 49.9ms | 0.0% | 0us | `update` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-lifecycle-api.ts:418` |
| 0.0% | 49.9ms | 0.0% | 9.5ms | `materializeTokens` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:557` |
| 0.0% | 49.8ms | 0.0% | 49.8ms | `toSchemaValidationLocation` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:378` |
| 0.0% | 49.8ms | 0.0% | 7.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1784` |
| 0.0% | 49.8ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:73` |
| 0.0% | 49.2ms | 0.0% | 31.5ms | `retainOrigin` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:447` |
| 0.0% | 49.0ms | 0.0% | 2.7ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1785` |
| 0.0% | 47.9ms | 0.0% | 0us | `get` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:1034` |
| 0.0% | 47.7ms | 0.0% | 0us | `mapSelectionWithContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:840` |
| 0.0% | 47.7ms | 0.0% | 47.7ms | `createTreeIndexChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:41` |
| 0.0% | 47.6ms | 0.0% | 2.5ms | `validateDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3678` |
| 0.0% | 47.3ms | 0.0% | 0us | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1196` |
| 0.0% | 47.0ms | 0.0% | 6.1ms | `deepFreeze` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/clone.ts:11` |
| 0.0% | 46.9ms | 0.0% | 45.6ms | `materializeTokens` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:556` |
| 0.0% | 46.1ms | 0.0% | 0us | `fitDocumentInput` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3217` |
| 0.0% | 45.9ms | 0.0% | 45.9ms | `isPreparedTargetPath` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:979` |
| 0.0% | 45.3ms | 0.0% | 45.3ms | `jsonEqual` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:124` |
| 0.0% | 45.0ms | 0.0% | 45.0ms | `groupRelocationCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:168` |
| 0.0% | 44.6ms | 0.0% | 44.6ms | `keyAt` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1591` |
| 0.0% | 44.3ms | 0.0% | 9.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/provenance.ts:51` |
| 0.0% | 44.2ms | 0.0% | 0us | `assignFreshNodeKey` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:173` |
| 0.0% | 44.2ms | 0.0% | 1.2ms | `replaceCanonicalChildWindow` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:875` |
| 0.0% | 43.2ms | 0.0% | 22.6ms | `resolveCompiledSchemaProperty` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts:3146` |
| 0.0% | 42.9ms | 0.0% | 5.1ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:100` |
| 0.0% | 42.6ms | 0.0% | 2.8ms | `collectProjectedRoots` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3210` |
| 0.0% | 42.4ms | 0.0% | 0us | `mapTextOffset` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts:132` |
| 0.0% | 42.2ms | 0.0% | 42.2ms | `mapSnapshotIndexThroughChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1503` |
| 0.0% | 41.5ms | 0.0% | 1.2ms | `validateDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3634` |
| 0.0% | 41.3ms | 0.0% | 41.3ms | `allocateNodeKey` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:33` |
| 0.0% | 41.3ms | 0.0% | 2.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1755` |
| 0.0% | 41.1ms | 0.0% | 41.1ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:139` |
| 0.0% | 41.0ms | 0.0% | 31.6ms | `Map` | `[native code]` |
| 0.0% | 40.7ms | 0.0% | 0us | `mapSelectionThroughChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:911` |
| 0.0% | 40.4ms | 0.0% | 1.3ms | `from` | `[native code]` |
| 0.0% | 40.3ms | 0.0% | 0us | `collectRelocationCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:210` |
| 0.0% | 40.2ms | 0.0% | 40.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1808` |
| 0.0% | 40.2ms | 0.0% | 5.9ms | `generatorResume` | `[native code]` |
| 0.0% | 39.8ms | 0.0% | 0us | `mapSnapshotIndexThroughChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1453` |
| 0.0% | 39.6ms | 0.0% | 39.6ms | `structurallyEqual` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:226` |
| 0.0% | 39.4ms | 0.0% | 1.4ms | `addParentIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3471` |
| 0.0% | 39.4ms | 0.0% | 39.4ms | `fitClosedContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:595` |
| 0.0% | 39.3ms | 0.0% | 0us | `deriveRootRelocations` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:260` |
| 0.0% | 38.7ms | 0.0% | 38.7ms | `get size` | `[native code]` |
| 0.0% | 38.6ms | 0.0% | 38.6ms | `tokenLength` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:182` |
| 0.0% | 38.2ms | 0.0% | 0us | `mapSnapshotIndexThroughChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1380` |
| 0.0% | 37.9ms | 0.0% | 0us | `applyTrustedCanonical` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:686` |
| 0.0% | 37.9ms | 0.0% | 1.1ms | `classifyDocumentRange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:41` |
| 0.0% | 37.5ms | 0.0% | 0us | `fit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:2368` |
| 0.0% | 37.5ms | 0.0% | 2.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:332` |
| 0.0% | 37.3ms | 0.0% | 37.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:131` |
| 0.0% | 37.1ms | 0.0% | 1.0ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:225` |
| 0.0% | 37.0ms | 0.0% | 3.7ms | `classifyRootChangeWithRuntimeCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:155` |
| 0.0% | 36.8ms | 0.0% | 36.8ms | `fitClosedNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:475` |
| 0.0% | 35.8ms | 0.0% | 0us | `assignFreshNodeKey` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:176` |
| 0.0% | 35.4ms | 0.0% | 0us | `replaceCanonicalChildWindow` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:911` |
| 0.0% | 35.3ms | 0.0% | 0us | `applyInsertTextCommand` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/editor/insert-text.ts:139` |
| 0.0% | 35.3ms | 0.0% | 0us | `run` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/editor/insert-text.ts:86` |
| 0.0% | 35.3ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5110` |
| 0.0% | 34.7ms | 0.0% | 0us | `validateContentIndexes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3412` |
| 0.0% | 34.6ms | 0.0% | 22.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3133` |
| 0.0% | 34.6ms | 0.0% | 34.6ms | `at` | `[native code]` |
| 0.0% | 34.5ms | 0.0% | 5.6ms | `getNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:52` |
| 0.0% | 34.4ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8497` |
| 0.0% | 34.1ms | 0.0% | 0us | `classifyRootChangeWithRuntimeCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:149` |
| 0.0% | 33.9ms | 0.0% | 0us | `canonicalizeInlineChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:112` |
| 0.0% | 33.6ms | 0.0% | 18.7ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3494` |
| 0.0% | 32.6ms | 0.0% | 2.2ms | `createTreeIndexNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:63` |
| 0.0% | 32.6ms | 0.0% | 0us | `applyInsertText` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/transforms-text/insert-text.ts:408` |
| 0.0% | 32.6ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/editor/insert-text.ts:123` |
| 0.0% | 32.6ms | 0.0% | 0us | `overlappingRanges` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:145` |
| 0.0% | 32.4ms | 0.0% | 18.5ms | `cache` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1478` |
| 0.0% | 32.3ms | 0.0% | 0us | `deriveRootRelocations` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:257` |
| 0.0% | 32.1ms | 0.0% | 32.1ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:284` |
| 0.0% | 32.1ms | 0.0% | 1.1ms | `constructCanonicalDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1147` |
| 0.0% | 31.7ms | 0.0% | 31.7ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1727` |
| 0.0% | 31.6ms | 0.0% | 1.3ms | `classifyRootChangeWithRuntimeCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:159` |
| 0.0% | 31.5ms | 0.0% | 11.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/provenance.ts:82` |
| 0.0% | 30.9ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1148` |
| 0.0% | 30.7ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/provenance.ts:53` |
| 0.0% | 30.5ms | 0.0% | 20.2ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1147` |
| 0.0% | 30.4ms | 0.0% | 5.1ms | `getInternalDocumentChangeEntries` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:538` |
| 0.0% | 30.1ms | 0.0% | 30.1ms | `visitOwnerDeclarations` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts` |
| 0.0% | 30.1ms | 0.0% | 0us | `commit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/history/history-extension.ts:592` |
| 0.0% | 30.0ms | 0.0% | 30.0ms | `WeakMap` | `[native code]` |
| 0.0% | 29.9ms | 0.0% | 16.0ms | `visit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:628` |
| 0.0% | 29.5ms | 0.0% | 1.2ms | `claim` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1014` |
| 0.0% | 29.5ms | 0.0% | 9.0ms | `createWrappedContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:372` |
| 0.0% | 29.5ms | 0.0% | 15.7ms | `canonicalizeInlineChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:117` |
| 0.0% | 29.5ms | 0.0% | 29.5ms | `groupRelocationCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:167` |
| 0.0% | 29.5ms | 0.0% | 21.8ms | `cache` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1498` |
| 0.0% | 29.5ms | 0.0% | 3.6ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:221` |
| 0.0% | 29.5ms | 0.0% | 29.5ms | `isElement` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/element.ts:121` |
| 0.0% | 29.3ms | 0.0% | 1.3ms | `advancePathStableSnapshotIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1792` |
| 0.0% | 29.3ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8498` |
| 0.0% | 29.2ms | 0.0% | 29.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:374` |
| 0.0% | 28.9ms | 0.0% | 28.9ms | `openToken` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:297` |
| 0.0% | 28.6ms | 0.0% | 28.6ms | `get` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:262` |
| 0.0% | 28.6ms | 0.0% | 28.6ms | `validateDeclarativeChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2602` |
| 0.0% | 28.2ms | 0.0% | 0us | `measureConnectDisconnectHeap` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:361` |
| 0.0% | 27.7ms | 0.0% | 0us | `withExtensionPublicationRollback` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7770` |
| 0.0% | 27.3ms | 0.0% | 27.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:289` |
| 0.0% | 27.3ms | 0.0% | 26.1ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1799` |
| 0.0% | 27.3ms | 0.0% | 0us | `fit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1740` |
| 0.0% | 26.9ms | 0.0% | 0us | `compose` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2661` |
| 0.0% | 26.8ms | 0.0% | 3.7ms | `encode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:861` |
| 0.0% | 26.7ms | 0.0% | 21.6ms | `canonicalizeDirectChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:197` |
| 0.0% | 26.6ms | 0.0% | 25.5ms | `mixStructuralFingerprintString` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:90` |
| 0.0% | 26.6ms | 0.0% | 0us | `get` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts:637` |
| 0.0% | 26.5ms | 0.0% | 26.5ms | `rootCanContain` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1845` |
| 0.0% | 26.4ms | 0.0% | 26.4ms | `replaceIndexedChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:303` |
| 0.0% | 26.4ms | 0.0% | 14.7ms | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:139` |
| 0.0% | 26.1ms | 0.0% | 26.1ms | `createWrappedContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:352` |
| 0.0% | 26.0ms | 0.0% | 26.0ms | `classifyRootChangeWithRuntimeCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:162` |
| 0.0% | 26.0ms | 0.0% | 26.0ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1380` |
| 0.0% | 25.6ms | 0.0% | 0us | `(anonymous)` | `[native code]` |
| 0.0% | 25.5ms | 0.0% | 21.8ms | `fitClosedNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:457` |
| 0.0% | 25.1ms | 0.0% | 0us | `setCurrentSelection` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6316` |
| 0.0% | 25.1ms | 0.0% | 1.4ms | `mapRange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:572` |
| 0.0% | 25.0ms | 0.0% | 0us | `classifyDocumentRange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:62` |
| 0.0% | 24.9ms | 0.0% | 24.9ms | `hasIntrinsicConstructor` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:23` |
| 0.0% | 24.9ms | 0.0% | 1.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:114` |
| 0.0% | 24.7ms | 0.0% | 0us | `assertSelectionSupported` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:680` |
| 0.0% | 24.6ms | 0.0% | 24.6ms | `isRecursivelyValidated` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3550` |
| 0.0% | 24.5ms | 0.0% | 0us | `withNodeUpdates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:751` |
| 0.0% | 24.4ms | 0.0% | 0us | `requestSatisfyUtil` | `[native code]` |
| 0.0% | 24.4ms | 0.0% | 24.4ms | `fetch` | `[native code]` |
| 0.0% | 24.4ms | 0.0% | 0us | `requestFetch` | `[native code]` |
| 0.0% | 24.4ms | 0.0% | 0us | `requestInstantiate` | `[native code]` |
| 0.0% | 24.2ms | 0.0% | 0us | `validateDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3623` |
| 0.0% | 24.1ms | 0.0% | 24.1ms | `createTreeIndexNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:57` |
| 0.0% | 24.1ms | 0.0% | 0us | `fitClosedNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:485` |
| 0.0% | 23.9ms | 0.0% | 23.9ms | `claim` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1007` |
| 0.0% | 23.6ms | 0.0% | 1.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7988` |
| 0.0% | 23.6ms | 0.0% | 0us | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7987` |
| 0.0% | 23.5ms | 0.0% | 0us | `validateSubtree` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3613` |
| 0.0% | 23.5ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2651` |
| 0.0% | 23.3ms | 0.0% | 0us | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:148` |
| 0.0% | 23.2ms | 0.0% | 2.4ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1160` |
| 0.0% | 23.1ms | 0.0% | 0us | `createEditorWithDocument` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:86` |
| 0.0% | 22.9ms | 0.0% | 0us | `cloneEditorJsonValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:236` |
| 0.0% | 22.6ms | 0.0% | 0us | `mapRange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:577` |
| 0.0% | 22.6ms | 0.0% | 1.1ms | `paragraph` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:63` |
| 0.0% | 22.6ms | 0.0% | 1.0ms | `isText` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:194` |
| 0.0% | 22.5ms | 0.0% | 22.5ms | `fitDirectContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:329` |
| 0.0% | 22.4ms | 0.0% | 0us | `insertTextAtPoint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/transforms-text/insert-text.ts:150` |
| 0.0% | 22.4ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/transforms-text/insert-text.ts:387` |
| 0.0% | 22.4ms | 0.0% | 0us | `insertText` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/transforms-text/insert-text.ts:394` |
| 0.0% | 22.4ms | 0.0% | 7.9ms | `isRecursivelyValidated` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3551` |
| 0.0% | 22.4ms | 0.0% | 22.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts` |
| 0.0% | 22.3ms | 0.0% | 0us | `constructCanonicalDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1126` |
| 0.0% | 22.3ms | 0.0% | 1.1ms | `applyTransactionSpecDocumentChangeStep` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7350` |
| 0.0% | 21.8ms | 0.0% | 3.9ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:218` |
| 0.0% | 21.8ms | 0.0% | 20.5ms | `classifyRootChangeWithRuntimeCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:161` |
| 0.0% | 21.7ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:362` |
| 0.0% | 21.6ms | 0.0% | 21.6ms | `canonicalizeCompiledExclusiveTextProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:315` |
| 0.0% | 21.6ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:216` |
| 0.0% | 21.5ms | 0.0% | 21.5ms | `normalizeTokens` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:323` |
| 0.0% | 21.3ms | 0.0% | 21.3ms | `keys` | `[native code]` |
| 0.0% | 21.1ms | 0.0% | 17.6ms | `validateDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3684` |
| 0.0% | 21.0ms | 0.0% | 21.0ms | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:100` |
| 0.0% | 21.0ms | 0.0% | 21.0ms | `record` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/provenance.ts:65` |
| 0.0% | 20.8ms | 0.0% | 1.2ms | `collectRelocationCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:202` |
| 0.0% | 20.6ms | 0.0% | 1.5ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:67` |
| 0.0% | 20.6ms | 0.0% | 0us | `createEditorWithDocument` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:89` |
| 0.0% | 20.4ms | 0.0% | 20.4ms | `toReversed` | `[native code]` |
| 0.0% | 20.2ms | 0.0% | 1.1ms | `addRange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:887` |
| 0.0% | 20.2ms | 0.0% | 0us | `updateIndexedNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:452` |
| 0.0% | 20.1ms | 0.0% | 0us | `canonicalizeRootChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:320` |
| 0.0% | 20.1ms | 0.0% | 0us | `applyDocumentChangeWithIndexes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1305` |
| 0.0% | 20.1ms | 0.0% | 1.5ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:111` |
| 0.0% | 20.0ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8080` |
| 0.0% | 20.0ms | 0.0% | 9.4ms | `textFor` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:57` |
| 0.0% | 19.6ms | 0.0% | 2.2ms | `anonymous` | `[native code]` |
| 0.0% | 19.6ms | 0.0% | 0us | `mapSnapshotIndexThroughChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1379` |
| 0.0% | 19.6ms | 0.0% | 19.6ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:96` |
| 0.0% | 19.5ms | 0.0% | 19.5ms | `groupRelocationCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:175` |
| 0.0% | 19.3ms | 0.0% | 0us | `RootChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1381` |
| 0.0% | 19.3ms | 0.0% | 0us | `createEditorCommit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:1011` |
| 0.0% | 19.2ms | 0.0% | 5.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:109` |
| 0.0% | 19.1ms | 0.0% | 19.1ms | `join` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1109` |
| 0.0% | 19.1ms | 0.0% | 19.1ms | `getDescendant` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:503` |
| 0.0% | 19.0ms | 0.0% | 6.0ms | `getDeclarativeSchema` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:550` |
| 0.0% | 19.0ms | 0.0% | 19.0ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:967` |
| 0.0% | 18.9ms | 0.0% | 18.9ms | `canonicalizeInlineChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:142` |
| 0.0% | 18.8ms | 0.0% | 0us | `canonicalizeDirectChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:203` |
| 0.0% | 18.6ms | 0.0% | 18.6ms | `createEntry` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:317` |
| 0.0% | 18.6ms | 0.0% | 18.6ms | `validateDeclarativeNodeProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2556` |
| 0.0% | 18.6ms | 0.0% | 18.6ms | `fitClosedContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:609` |
| 0.0% | 18.5ms | 0.0% | 10.1ms | `parseModule` | `[native code]` |
| 0.0% | 18.3ms | 0.0% | 1.0ms | `isStrictPoint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:118` |
| 0.0% | 18.2ms | 0.0% | 1.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3488` |
| 0.0% | 18.2ms | 0.0% | 1.1ms | `getElementContentRoots` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:959` |
| 0.0% | 18.0ms | 0.0% | 18.0ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:178` |
| 0.0% | 18.0ms | 0.0% | 10.4ms | `mapSnapshotIndexThroughChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1450` |
| 0.0% | 18.0ms | 0.0% | 0us | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7827` |
| 0.0% | 17.9ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:158` |
| 0.0% | 17.7ms | 0.0% | 0us | `getCurrentRootSnapshot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6700` |
| 0.0% | 17.5ms | 0.0% | 0us | `mapSnapshotIndexThroughChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1376` |
| 0.0% | 17.3ms | 0.0% | 17.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1377` |
| 0.0% | 17.2ms | 0.0% | 17.2ms | `createWrappedContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:370` |
| 0.0% | 16.9ms | 0.0% | 8.8ms | `getExtensionRegistry` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:597` |
| 0.0% | 16.8ms | 0.0% | 13.3ms | `appendNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:103` |
| 0.0% | 16.6ms | 0.0% | 7.5ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:101` |
| 0.0% | 16.6ms | 0.0% | 16.6ms | `get` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:223` |
| 0.0% | 16.3ms | 0.0% | 0us | `applyBuiltDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6966` |
| 0.0% | 16.1ms | 0.0% | 16.1ms | `pathKey` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:104` |
| 0.0% | 16.1ms | 0.0% | 0us | `assertSelectionSupported` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:690` |
| 0.0% | 16.0ms | 0.0% | 16.0ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:119` |
| 0.0% | 15.8ms | 0.0% | 0us | `contentAllows` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1245` |
| 0.0% | 15.6ms | 0.0% | 9.1ms | `getTransactionSpecContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:542` |
| 0.0% | 15.5ms | 0.0% | 0us | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:127` |
| 0.0% | 15.4ms | 0.0% | 0us | `addOwnPath` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3480` |
| 0.0% | 15.4ms | 0.0% | 15.4ms | `claim` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1020` |
| 0.0% | 15.4ms | 0.0% | 15.4ms | `cache` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1497` |
| 0.0% | 15.2ms | 0.0% | 0us | `publishTransactionDraft` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7758` |
| 0.0% | 15.2ms | 0.0% | 0us | `setSelectionStateSelection` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-state.ts:72` |
| 0.0% | 15.2ms | 0.0% | 10.3ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:130` |
| 0.0% | 15.2ms | 0.0% | 0us | `getCurrentRootSnapshot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6699` |
| 0.0% | 15.1ms | 0.0% | 2.6ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1152` |
| 0.0% | 15.1ms | 0.0% | 0us | `assertSelectionSupported` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:707` |
| 0.0% | 15.1ms | 0.0% | 15.1ms | `appendNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:116` |
| 0.0% | 15.0ms | 0.0% | 15.0ms | `PreparedTokenSlice` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:479` |
| 0.0% | 15.0ms | 0.0% | 15.0ms | `claim` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1019` |
| 0.0% | 15.0ms | 0.0% | 0us | `createEditorCommit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:1000` |
| 0.0% | 15.0ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:217` |
| 0.0% | 15.0ms | 0.0% | 2.3ms | `advancePathStableSnapshotIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1790` |
| 0.0% | 15.0ms | 0.0% | 15.0ms | `tokensEqual` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:188` |
| 0.0% | 14.9ms | 0.0% | 14.9ms | `closeToken` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:312` |
| 0.0% | 14.9ms | 0.0% | 5.8ms | `hasOnlyKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:47` |
| 0.0% | 14.9ms | 0.0% | 1.4ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:219` |
| 0.0% | 14.8ms | 0.0% | 0us | `applyIndexed` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2402` |
| 0.0% | 14.7ms | 0.0% | 0us | `DocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:749` |
| 0.0% | 14.2ms | 0.0% | 0us | `reconcileChildrenStep` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:3148` |
| 0.0% | 14.1ms | 0.0% | 14.1ms | `collectRelocationCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:207` |
| 0.0% | 14.1ms | 0.0% | 1.0ms | `validateSubtree` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3604` |
| 0.0% | 14.0ms | 0.0% | 14.0ms | `assignFreshNodeKey` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:175` |
| 0.0% | 13.9ms | 0.0% | 6.1ms | `fitClosedContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:578` |
| 0.0% | 13.9ms | 0.0% | 13.9ms | `validateSubtree` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3614` |
| 0.0% | 13.9ms | 0.0% | 4.5ms | `validateDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3576` |
| 0.0% | 13.8ms | 0.0% | 4.0ms | `materializeTokens` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:558` |
| 0.0% | 13.6ms | 0.0% | 13.6ms | `addParentIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3476` |
| 0.0% | 13.5ms | 0.0% | 13.5ms | `concat` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:682` |
| 0.0% | 13.5ms | 0.0% | 0us | `reconcileExclusiveElementOwnedRoots` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5414` |
| 0.0% | 13.5ms | 0.0% | 13.5ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:142` |
| 0.0% | 13.4ms | 0.0% | 7.9ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1153` |
| 0.0% | 13.3ms | 0.0% | 1.2ms | `freezeReadonlySet` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:234` |
| 0.0% | 13.1ms | 0.0% | 13.1ms | `mixStructuralFingerprintString` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts` |
| 0.0% | 13.0ms | 0.0% | 0us | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8018` |
| 0.0% | 13.0ms | 0.0% | 0us | `setSelectionValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6135` |
| 0.0% | 13.0ms | 0.0% | 0us | `getRegistry` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:547` |
| 0.0% | 12.9ms | 0.0% | 0us | `claim` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1016` |
| 0.0% | 12.9ms | 0.0% | 12.9ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:131` |
| 0.0% | 12.9ms | 0.0% | 0us | `validateDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3579` |
| 0.0% | 12.7ms | 0.0% | 0us | `apply` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1180` |
| 0.0% | 12.7ms | 0.0% | 0us | `applyDocumentChangeValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1263` |
| 0.0% | 12.7ms | 0.0% | 0us | `isText` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:196` |
| 0.0% | 12.6ms | 0.0% | 0us | `deepFreeze` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/clone.ts:8` |
| 0.0% | 12.5ms | 0.0% | 12.5ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:49` |
| 0.0% | 12.5ms | 0.0% | 1.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:238` |
| 0.0% | 12.4ms | 0.0% | 0us | `between` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:789` |
| 0.0% | 12.3ms | 0.0% | 3.7ms | `getDescendant` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:505` |
| 0.0% | 12.2ms | 0.0% | 4.3ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1198` |
| 0.0% | 12.2ms | 0.0% | 1.3ms | `snapshotEditorJsonValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:296` |
| 0.0% | 12.1ms | 0.0% | 0us | `isText` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:197` |
| 0.0% | 12.1ms | 0.0% | 12.1ms | `canonicalizeDeclarativePropertyRecord` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1722` |
| 0.0% | 11.8ms | 0.0% | 11.8ms | `assertNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts` |
| 0.0% | 11.8ms | 0.0% | 2.3ms | `runRemoteChangesSeparately` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:241` |
| 0.0% | 11.7ms | 0.0% | 1.2ms | `reconcileExclusiveElementOwnedRoots` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5407` |
| 0.0% | 11.7ms | 0.0% | 11.7ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1740` |
| 0.0% | 11.7ms | 0.0% | 6.4ms | `validateDeclarativeNodeProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2549` |
| 0.0% | 11.6ms | 0.0% | 11.6ms | `toSchemaValidationLocation` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` |
| 0.0% | 11.5ms | 0.0% | 0us | `canonicalizeRootChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:329` |
| 0.0% | 11.5ms | 0.0% | 11.5ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:329` |
| 0.0% | 11.4ms | 0.0% | 11.4ms | `flat` | `[native code]` |
| 0.0% | 11.3ms | 0.0% | 0us | `DocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:729` |
| 0.0% | 11.3ms | 0.0% | 0us | `mapSnapshotIndexThroughChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1370` |
| 0.0% | 11.2ms | 0.0% | 11.2ms | `tokenLength` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts` |
| 0.0% | 11.2ms | 0.0% | 0us | `classifyDocumentRange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:81` |
| 0.0% | 11.2ms | 0.0% | 0us | `apply` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:458` |
| 0.0% | 11.0ms | 0.0% | 0us | `withoutPendingMarks` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6206` |
| 0.0% | 11.0ms | 0.0% | 0us | `collectRelocationCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:203` |
| 0.0% | 10.6ms | 0.0% | 0us | `mapPoint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:441` |
| 0.0% | 10.5ms | 0.0% | 0us | `addParentIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3468` |
| 0.0% | 10.5ms | 0.0% | 10.5ms | `validateContentIndexes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3407` |
| 0.0% | 10.4ms | 0.0% | 0us | `applyTrustedCanonical` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:692` |
| 0.0% | 10.4ms | 0.0% | 2.2ms | `canonicalizeInlineChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:184` |
| 0.0% | 10.3ms | 0.0% | 1.6ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1193` |
| 0.0% | 10.3ms | 0.0% | 8.9ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1195` |
| 0.0% | 10.3ms | 0.0% | 2.6ms | `RootChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1382` |
| 0.0% | 10.1ms | 0.0% | 0us | `freezeReadonlyMap` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:196` |
| 0.0% | 10.1ms | 0.0% | 10.1ms | `collectRelocationCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:205` |
| 0.0% | 10.1ms | 0.0% | 4.9ms | `nodeRange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:595` |
| 0.0% | 10.1ms | 0.0% | 0us | `withUpdateTagContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:1716` |
| 0.0% | 10.1ms | 0.0% | 0us | `getSelectionRanges` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:628` |
| 0.0% | 10.1ms | 0.0% | 10.1ms | `encodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:911` |
| 0.0% | 9.9ms | 0.0% | 9.9ms | `replaceIndexedChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:305` |
| 0.0% | 9.8ms | 0.0% | 1.3ms | `reconcileExclusiveElementOwnedRoots` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5410` |
| 0.0% | 9.8ms | 0.0% | 0us | `measureAnchors` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:270` |
| 0.0% | 9.8ms | 0.0% | 1.3ms | `mapSnapshotIndexThroughChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1387` |
| 0.0% | 9.7ms | 0.0% | 0us | `applyTransactionSpecDocumentChangeStep` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7410` |
| 0.0% | 9.7ms | 0.0% | 9.7ms | `splice` | `[native code]` |
| 0.0% | 9.7ms | 0.0% | 9.7ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1136` |
| 0.0% | 9.6ms | 0.0% | 1.0ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:333` |
| 0.0% | 9.5ms | 0.0% | 9.5ms | `keyAt` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts` |
| 0.0% | 9.3ms | 0.0% | 1.1ms | `mapPosition` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1169` |
| 0.0% | 9.3ms | 0.0% | 9.3ms | `materializeTokens` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts` |
| 0.0% | 9.2ms | 0.0% | 1.1ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1183` |
| 0.0% | 9.1ms | 0.0% | 9.1ms | `allContentAllowed` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:278` |
| 0.0% | 9.1ms | 0.0% | 0us | `replaceIndexedChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:293` |
| 0.0% | 9.0ms | 0.0% | 9.0ms | `validateTextProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2505` |
| 0.0% | 9.0ms | 0.0% | 0us | `mapSelectionWithContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:845` |
| 0.0% | 9.0ms | 0.0% | 9.0ms | `fitDirectContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:323` |
| 0.0% | 8.9ms | 0.0% | 8.9ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:57` |
| 0.0% | 8.8ms | 0.0% | 3.9ms | `advancePathStableSnapshotIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1782` |
| 0.0% | 8.7ms | 0.0% | 5.0ms | `find` | `[native code]` |
| 0.0% | 8.7ms | 0.0% | 8.7ms | `Proxy` | `[native code]` |
| 0.0% | 8.7ms | 0.0% | 1.2ms | `pushUpdateTagContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/update-context.ts:17` |
| 0.0% | 8.6ms | 0.0% | 1.0ms | `createCommitChanged` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:405` |
| 0.0% | 8.6ms | 0.0% | 8.6ms | `snapshotEditorJsonValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:252` |
| 0.0% | 8.6ms | 0.0% | 8.6ms | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:112` |
| 0.0% | 8.6ms | 0.0% | 0us | `createEditorWithDocument` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:85` |
| 0.0% | 8.6ms | 0.0% | 8.6ms | `canonicalizeInlineChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:99` |
| 0.0% | 8.5ms | 0.0% | 0us | `notifyAnchorChanges` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:407` |
| 0.0% | 8.5ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1209` |
| 0.0% | 8.5ms | 0.0% | 0us | `between` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:788` |
| 0.0% | 8.5ms | 0.0% | 0us | `resolveMappedPoint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts:400` |
| 0.0% | 8.4ms | 0.0% | 0us | `keyAt` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1590` |
| 0.0% | 8.4ms | 0.0% | 0us | `selectionPositionEquals` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6214` |
| 0.0% | 8.4ms | 0.0% | 8.4ms | `isElement` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/element.ts:123` |
| 0.0% | 8.3ms | 0.0% | 0us | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7829` |
| 0.0% | 8.3ms | 0.0% | 0us | `indexedAfter` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:199` |
| 0.0% | 8.3ms | 0.0% | 861us | `freezeReadonlyMap` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:197` |
| 0.0% | 8.2ms | 0.0% | 8.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:232` |
| 0.0% | 8.2ms | 0.0% | 0us | `mapPoint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:468` |
| 0.0% | 8.2ms | 0.0% | 8.2ms | `getNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:53` |
| 0.0% | 8.1ms | 0.0% | 3.0ms | `rememberValidatedDocumentRoots` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3137` |
| 0.0% | 8.0ms | 0.0% | 5.2ms | `setNodeKey` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:161` |
| 0.0% | 7.9ms | 0.0% | 0us | `concat` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:688` |
| 0.0% | 7.9ms | 0.0% | 7.9ms | `getNodeKeyForNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts` |
| 0.0% | 7.9ms | 0.0% | 0us | `apply` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:442` |
| 0.0% | 7.8ms | 0.0% | 0us | `validateDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3580` |
| 0.0% | 7.8ms | 0.0% | 1.2ms | `assertSelectionSupported` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:702` |
| 0.0% | 7.8ms | 0.0% | 1.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/provenance.ts:52` |
| 0.0% | 7.8ms | 0.0% | 0us | `createEditorImplementation` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts:670` |
| 0.0% | 7.8ms | 0.0% | 0us | `cloneFrozenEditorJsonValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:300` |
| 0.0% | 7.8ms | 0.0% | 7.8ms | `visit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:216` |
| 0.0% | 7.8ms | 0.0% | 0us | `addRange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:900` |
| 0.0% | 7.7ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:340` |
| 0.0% | 7.7ms | 0.0% | 7.7ms | `resolveCompiledSchemaProperty` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts:3143` |
| 0.0% | 7.7ms | 0.0% | 0us | `insertText` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/transforms-text/insert-text.ts:168` |
| 0.0% | 7.6ms | 0.0% | 7.6ms | `canonicalizeInlineChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:156` |
| 0.0% | 7.5ms | 0.0% | 7.5ms | `openToken` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:305` |
| 0.0% | 7.5ms | 0.0% | 0us | `classifyDocumentRange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:42` |
| 0.0% | 7.5ms | 0.0% | 7.5ms | `validateDeclarativeChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2606` |
| 0.0% | 7.4ms | 0.0% | 0us | `buildConfiguredRegistry` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:1975` |
| 0.0% | 7.4ms | 0.0% | 7.4ms | `hasInlineContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:89` |
| 0.0% | 7.4ms | 0.0% | 7.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:118` |
| 0.0% | 7.4ms | 0.0% | 7.4ms | `deepFreeze` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/clone.ts:10` |
| 0.0% | 7.3ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2620` |
| 0.0% | 7.3ms | 0.0% | 0us | `moduleEvaluation` | `[native code]` |
| 0.0% | 7.3ms | 0.0% | 7.3ms | `visitDeclarative` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2732` |
| 0.0% | 7.3ms | 0.0% | 7.3ms | `get` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts:599` |
| 0.0% | 7.3ms | 0.0% | 7.3ms | `addParentIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3475` |
| 0.0% | 7.2ms | 0.0% | 0us | `publicPoint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:125` |
| 0.0% | 7.2ms | 0.0% | 0us | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:999` |
| 0.0% | 7.1ms | 0.0% | 7.1ms | `classifyRootChangeWithRuntimeCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:151` |
| 0.0% | 7.0ms | 0.0% | 0us | `publishTransactionDraft` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7748` |
| 0.0% | 6.9ms | 0.0% | 6.9ms | `repeat` | `[native code]` |
| 0.0% | 6.9ms | 0.0% | 0us | `setNodeKey` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:168` |
| 0.0% | 6.9ms | 0.0% | 0us | `getStateFieldIdentityMap` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/state-fields.ts:25` |
| 0.0% | 6.9ms | 0.0% | 5.7ms | `concat` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:683` |
| 0.0% | 6.8ms | 0.0% | 6.8ms | `fitClosedNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:471` |
| 0.0% | 6.8ms | 0.0% | 0us | `createEditorUpdateDraftContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7652` |
| 0.0% | 6.8ms | 0.0% | 0us | `readEditor` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5816` |
| 0.0% | 6.7ms | 0.0% | 0us | `getCurrentSelection` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6191` |
| 0.0% | 6.6ms | 0.0% | 2.6ms | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7984` |
| 0.0% | 6.6ms | 0.0% | 6.6ms | `canonicalizeCompiledExclusiveTextProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:316` |
| 0.0% | 6.6ms | 0.0% | 1.4ms | `apply` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:407` |
| 0.0% | 6.6ms | 0.0% | 0us | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8106` |
| 0.0% | 6.6ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8107` |
| 0.0% | 6.6ms | 0.0% | 3.9ms | `classifyRootChangeWithRuntimeCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:156` |
| 0.0% | 6.5ms | 0.0% | 0us | `assertBuiltInSelection` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:68` |
| 0.0% | 6.5ms | 0.0% | 2.4ms | `DocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:755` |
| 0.0% | 6.5ms | 0.0% | 2.3ms | `normalizeSelectionRoot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-state.ts:24` |
| 0.0% | 6.5ms | 0.0% | 2.4ms | `isStrictPoint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:121` |
| 0.0% | 6.4ms | 0.0% | 1.4ms | `applyDocumentChangeValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1260` |
| 0.0% | 6.4ms | 0.0% | 0us | `replaceCanonicalChildWindow` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:888` |
| 0.0% | 6.4ms | 0.0% | 5.3ms | `indexedAfter` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:200` |
| 0.0% | 6.4ms | 0.0% | 0us | `classifyRootChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:233` |
| 0.0% | 6.4ms | 0.0% | 0us | `between` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:798` |
| 0.0% | 6.4ms | 0.0% | 6.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:485` |
| 0.0% | 6.4ms | 0.0% | 0us | `projectSelectionRange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:94` |
| 0.0% | 6.3ms | 0.0% | 6.3ms | `replaceIndexedChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:306` |
| 0.0% | 6.3ms | 0.0% | 1.2ms | `canonicalizeInlineChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:130` |
| 0.0% | 6.3ms | 0.0% | 0us | `applyTransactionSpecDocumentChangeStep` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7364` |
| 0.0% | 6.3ms | 0.0% | 0us | `getPublicSelection` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6302` |
| 0.0% | 6.3ms | 0.0% | 0us | `setNodeKey` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:169` |
| 0.0% | 6.3ms | 0.0% | 0us | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7871` |
| 0.0% | 6.3ms | 0.0% | 6.3ms | `assertNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:888` |
| 0.0% | 6.2ms | 0.0% | 6.2ms | `get` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:210` |
| 0.0% | 6.2ms | 0.0% | 1.1ms | `constructCanonicalDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1004` |
| 0.0% | 6.2ms | 0.0% | 6.2ms | `addRange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:898` |
| 0.0% | 6.2ms | 0.0% | 2.4ms | `isRange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/range.ts:200` |
| 0.0% | 6.2ms | 0.0% | 0us | `applyInternal` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2590` |
| 0.0% | 6.2ms | 0.0% | 6.2ms | `get` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts:626` |
| 0.0% | 6.2ms | 0.0% | 0us | `mapPoint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:427` |
| 0.0% | 6.2ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:2166` |
| 0.0% | 6.2ms | 0.0% | 6.2ms | `padStart` | `[native code]` |
| 0.0% | 6.2ms | 0.0% | 6.2ms | `textToken` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:318` |
| 0.0% | 6.1ms | 0.0% | 6.1ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1126` |
| 0.0% | 6.1ms | 0.0% | 0us | `classifyDocumentRange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:63` |
| 0.0% | 6.1ms | 0.0% | 0us | `applyBuiltDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6982` |
| 0.0% | 6.1ms | 0.0% | 0us | `classifyDocumentRange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:65` |
| 0.0% | 6.1ms | 0.0% | 0us | `setSelectionValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6148` |
| 0.0% | 6.1ms | 0.0% | 0us | `projectSelectionPoint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:88` |
| 0.0% | 6.0ms | 0.0% | 0us | `applyDocumentChangeValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1286` |
| 0.0% | 6.0ms | 0.0% | 2.3ms | `mapPoint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:450` |
| 0.0% | 6.0ms | 0.0% | 0us | `createEditorCommit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:1002` |
| 0.0% | 6.0ms | 0.0% | 0us | `advancePathStableSnapshotIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1784` |
| 0.0% | 5.9ms | 0.0% | 1.1ms | `setSelectionValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6140` |
| 0.0% | 5.9ms | 0.0% | 0us | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:954` |
| 0.0% | 5.9ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:956` |
| 0.0% | 5.9ms | 0.0% | 0us | `DocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:736` |
| 0.0% | 5.9ms | 0.0% | 0us | `textAt` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:633` |
| 0.0% | 5.8ms | 0.0% | 1.1ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:170` |
| 0.0% | 5.7ms | 0.0% | 1.0ms | `freezeRootClassification` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:283` |
| 0.0% | 5.7ms | 0.0% | 5.7ms | `encode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:856` |
| 0.0% | 5.7ms | 0.0% | 1.2ms | `createEditorCommit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:1004` |
| 0.0% | 5.7ms | 0.0% | 5.7ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:122` |
| 0.0% | 5.7ms | 0.0% | 0us | `DocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:730` |
| 0.0% | 5.7ms | 0.0% | 3.0ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:287` |
| 0.0% | 5.6ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:132` |
| 0.0% | 5.6ms | 0.0% | 0us | `mapPathForward` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:609` |
| 0.0% | 5.6ms | 0.0% | 0us | `mapTextOffset` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts:130` |
| 0.0% | 5.6ms | 0.0% | 0us | `applyTrustedCanonical` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:616` |
| 0.0% | 5.5ms | 0.0% | 0us | `applyTransactionSpecDocumentChangeStep` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7422` |
| 0.0% | 5.5ms | 0.0% | 0us | `recordFacetCommit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/facet.ts:169` |
| 0.0% | 5.4ms | 0.0% | 0us | `getTransactionSnapshot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:582` |
| 0.0% | 5.4ms | 0.0% | 1.0ms | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:101` |
| 0.0% | 5.4ms | 0.0% | 5.4ms | `setNodeKey` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:167` |
| 0.0% | 5.3ms | 0.0% | 0us | `applyRoot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:1081` |
| 0.0% | 5.3ms | 0.0% | 0us | `commit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/history/history-extension.ts:591` |
| 0.0% | 5.3ms | 0.0% | 0us | `normalizeSelectionRoot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-state.ts:30` |
| 0.0% | 5.3ms | 0.0% | 0us | `mapTextOffset` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts:139` |
| 0.0% | 5.3ms | 0.0% | 5.3ms | `defineSemanticUpdateMethod` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/semantic-update-method.ts:24` |
| 0.0% | 5.3ms | 0.0% | 0us | `freezeReadonlySet` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:235` |
| 0.0% | 5.3ms | 0.0% | 5.3ms | `canonicalizeNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:243` |
| 0.0% | 5.3ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:756` |
| 0.0% | 5.3ms | 0.0% | 5.3ms | `claim` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1009` |
| 0.0% | 5.2ms | 0.0% | 3.9ms | `constructCanonicalDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1093` |
| 0.0% | 5.2ms | 0.0% | 5.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:184` |
| 0.0% | 5.2ms | 0.0% | 0us | `create` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1467` |
| 0.0% | 5.2ms | 0.0% | 0us | `getValidationNodeType` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:363` |
| 0.0% | 5.2ms | 0.0% | 0us | `getChangeValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6750` |
| 0.0% | 5.2ms | 0.0% | 0us | `initializeBaseExtensionRegistry` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:663` |
| 0.0% | 5.2ms | 0.0% | 0us | `getExtensionRegistryStore` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:579` |
| 0.0% | 5.2ms | 0.0% | 0us | `createExtensionRegistryStore` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:570` |
| 0.0% | 5.2ms | 0.0% | 1.1ms | `validateDeclarativeDocument` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3068` |
| 0.0% | 5.2ms | 0.0% | 5.2ms | `getLiveNodeKeyPrefix` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:28` |
| 0.0% | 5.2ms | 0.0% | 0us | `between` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:787` |
| 0.0% | 5.2ms | 0.0% | 0us | `createInternalDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:569` |
| 0.0% | 5.2ms | 0.0% | 5.2ms | `addSection` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:593` |
| 0.0% | 5.1ms | 0.0% | 5.1ms | `normalizeTokens` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:339` |
| 0.0% | 5.1ms | 0.0% | 2.5ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1742` |
| 0.0% | 5.1ms | 0.0% | 0us | `replaceCanonicalChildWindow` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:804` |
| 0.0% | 5.1ms | 0.0% | 0us | `getUpdateView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:3948` |
| 0.0% | 5.1ms | 0.0% | 3.7ms | `reduce` | `[native code]` |
| 0.0% | 5.1ms | 0.0% | 0us | `advancePathStableSnapshotIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1807` |
| 0.0% | 5.1ms | 0.0% | 5.1ms | `getUpdateView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4862` |
| 0.0% | 5.1ms | 0.0% | 5.1ms | `mapPos` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2828` |
| 0.0% | 5.1ms | 0.0% | 1.0ms | `validateSubtree` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3610` |
| 0.0% | 5.1ms | 0.0% | 0us | `selectionPositionEquals` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6215` |
| 0.0% | 5.1ms | 0.0% | 5.1ms | `mixStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts` |
| 0.0% | 5.0ms | 0.0% | 0us | `async loadAndEvaluateModule` | `[native code]` |
| 0.0% | 5.0ms | 0.0% | 5.0ms | `moduleDeclarationInstantiation` | `[native code]` |
| 0.0% | 5.0ms | 0.0% | 0us | `linkAndEvaluateModule` | `[native code]` |
| 0.0% | 5.0ms | 0.0% | 0us | `mapSelectionThroughChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:875` |
| 0.0% | 5.0ms | 0.0% | 0us | `projectSelectionRange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:95` |
| 0.0% | 5.0ms | 0.0% | 5.0ms | `equalValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:128` |
| 0.0% | 5.0ms | 0.0% | 1.1ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:127` |
| 0.0% | 5.0ms | 0.0% | 5.0ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts` |
| 0.0% | 5.0ms | 0.0% | 5.0ms | `indexRecursivePath` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3568` |
| 0.0% | 5.0ms | 0.0% | 1.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1372` |
| 0.0% | 5.0ms | 0.0% | 1.0ms | `DocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:750` |
| 0.0% | 5.0ms | 0.0% | 0us | `createAnchor` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts:660` |
| 0.0% | 5.0ms | 0.0% | 0us | `applyTrustedCanonical` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:624` |
| 0.0% | 4.9ms | 0.0% | 2.4ms | `getPendingSelectionMarks` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:367` |
| 0.0% | 4.9ms | 0.0% | 1.3ms | `validateDeclarativeDocument` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3041` |
| 0.0% | 4.9ms | 0.0% | 4.9ms | `getUpdateView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4621` |
| 0.0% | 4.9ms | 0.0% | 0us | `classifyDocumentRange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:80` |
| 0.0% | 4.9ms | 0.0% | 4.9ms | `entry` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:899` |
| 0.0% | 4.9ms | 0.0% | 1.2ms | `validateDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3674` |
| 0.0% | 4.9ms | 0.0% | 0us | `createEditorCommit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:986` |
| 0.0% | 4.9ms | 0.0% | 1.2ms | `constructCanonicalDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1042` |
| 0.0% | 4.9ms | 0.0% | 4.9ms | `addParentIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3469` |
| 0.0% | 4.9ms | 0.0% | 4.9ms | `iterChangedRanges` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2790` |
| 0.0% | 4.8ms | 0.0% | 4.8ms | `canonicalizeDeclarativeChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` |
| 0.0% | 4.8ms | 0.0% | 0us | `fitDocument` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3318` |
| 0.0% | 4.8ms | 0.0% | 4.8ms | `isEditorJsonValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:119` |
| 0.0% | 4.8ms | 0.0% | 0us | `retainOrigin` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:448` |
| 0.0% | 4.7ms | 0.0% | 0us | `advancePathStableSnapshotIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1830` |
| 0.0% | 4.7ms | 0.0% | 0us | `between` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1561` |
| 0.0% | 4.7ms | 0.0% | 0us | `createStructurallyAlignedChanges` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1200` |
| 0.0% | 4.7ms | 0.0% | 0us | `movedNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2483` |
| 0.0% | 4.7ms | 0.0% | 4.7ms | `getDescendant` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:499` |
| 0.0% | 4.7ms | 0.0% | 4.7ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:284` |
| 0.0% | 4.6ms | 0.0% | 4.6ms | `get` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:244` |
| 0.0% | 4.6ms | 0.0% | 0us | `createEditorUpdateDraftContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7715` |
| 0.0% | 4.5ms | 0.0% | 2.2ms | `validateDeclarativeDocument` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3094` |
| 0.0% | 4.5ms | 0.0% | 0us | `applyIndexed` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2217` |
| 0.0% | 4.4ms | 0.0% | 0us | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8051` |
| 0.0% | 4.4ms | 0.0% | 1.4ms | `orderPaths` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:867` |
| 0.0% | 4.4ms | 0.0% | 0us | `createEditorUpdateDraftContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7729` |
| 0.0% | 4.4ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8117` |
| 0.0% | 4.4ms | 0.0% | 0us | `cloneEditorJsonValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:235` |
| 0.0% | 4.3ms | 0.0% | 0us | `overlappingRanges` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:146` |
| 0.0% | 4.3ms | 0.0% | 4.3ms | `assertNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:886` |
| 0.0% | 4.3ms | 0.0% | 4.3ms | `positionWasReplaced` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:559` |
| 0.0% | 4.3ms | 0.0% | 0us | `classifyRootChangeWithRuntimeCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:182` |
| 0.0% | 4.3ms | 0.0% | 3.1ms | `validateDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3650` |
| 0.0% | 4.2ms | 0.0% | 1.3ms | `compileEditorUpdatePolicy` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/update-policy.ts:84` |
| 0.0% | 4.2ms | 0.0% | 0us | `DocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:752` |
| 0.0% | 4.2ms | 0.0% | 4.2ms | `get` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:237` |
| 0.0% | 4.2ms | 0.0% | 0us | `isSelection` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:187` |
| 0.0% | 4.2ms | 0.0% | 0us | `indexConstructedRoot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:948` |
| 0.0% | 4.1ms | 0.0% | 4.1ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:135` |
| 0.0% | 4.1ms | 0.0% | 0us | `createEditorDocumentChangeBuilder` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6856` |
| 0.0% | 4.1ms | 0.0% | 0us | `path` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-read-runtime.ts:324` |
| 0.0% | 4.1ms | 0.0% | 0us | `composeSections` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:637` |
| 0.0% | 4.1ms | 0.0% | 4.1ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts` |
| 0.0% | 4.1ms | 0.0% | 0us | `applyTrustedCanonical` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:563` |
| 0.0% | 4.1ms | 0.0% | 4.1ms | `assertNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:889` |
| 0.0% | 4.1ms | 0.0% | 4.1ms | `mixStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:84` |
| 0.0% | 4.1ms | 0.0% | 1.5ms | `assertRemoteCommit` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:145` |
| 0.0% | 4.0ms | 0.0% | 4.0ms | `sliceMaterialized` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:785` |
| 0.0% | 4.0ms | 0.0% | 0us | `replaceCanonicalChildWindow` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:811` |
| 0.0% | 4.0ms | 0.0% | 0us | `between` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1556` |
| 0.0% | 4.0ms | 0.0% | 1.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1221` |
| 0.0% | 4.0ms | 0.0% | 0us | `buildTransactionSpec` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5679` |
| 0.0% | 4.0ms | 0.0% | 0us | `claim` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1004` |
| 0.0% | 4.0ms | 0.0% | 1.4ms | `bound entries` | `[native code]` |
| 0.0% | 4.0ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1176` |
| 0.0% | 4.0ms | 0.0% | 4.0ms | `visitDeclarative` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2778` |
| 0.0% | 4.0ms | 0.0% | 1.1ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:365` |
| 0.0% | 4.0ms | 0.0% | 1.2ms | `freezeIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:357` |
| 0.0% | 4.0ms | 0.0% | 0us | `getElementContentRoots` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:961` |
| 0.0% | 3.9ms | 0.0% | 1.2ms | `applyTransactionSpecDocumentChangeStep` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7401` |
| 0.0% | 3.9ms | 0.0% | 3.9ms | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:126` |
| 0.0% | 3.9ms | 0.0% | 1.5ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:203` |
| 0.0% | 3.9ms | 0.0% | 0us | `getUpdateView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4620` |
| 0.0% | 3.9ms | 0.0% | 0us | `node` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/editor/node.ts:14` |
| 0.0% | 3.9ms | 0.0% | 0us | `resolveSnapshotSelection` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8539` |
| 0.0% | 3.9ms | 0.0% | 0us | `resolveSnapshotPoint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8547` |
| 0.0% | 3.9ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8500` |
| 0.0% | 3.9ms | 0.0% | 3.9ms | `cacheIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:386` |
| 0.0% | 3.9ms | 0.0% | 2.4ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:192` |
| 0.0% | 3.9ms | 0.0% | 0us | `invert` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1197` |
| 0.0% | 3.9ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1200` |
| 0.0% | 3.9ms | 0.0% | 0us | `ChangeDraft` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:137` |
| 0.0% | 3.9ms | 0.0% | 2.8ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:118` |
| 0.0% | 3.9ms | 0.0% | 3.9ms | `addParentIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3474` |
| 0.0% | 3.9ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3017` |
| 0.0% | 3.9ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3018` |
| 0.0% | 3.9ms | 0.0% | 0us | `fit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3042` |
| 0.0% | 3.9ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:328` |
| 0.0% | 3.9ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1179` |
| 0.0% | 3.8ms | 0.0% | 1.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1178` |
| 0.0% | 3.8ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1151` |
| 0.0% | 3.8ms | 0.0% | 0us | `getStateView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:2999` |
| 0.0% | 3.8ms | 0.0% | 1.3ms | `composeSections` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:681` |
| 0.0% | 3.8ms | 0.0% | 2.7ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:119` |
| 0.0% | 3.8ms | 0.0% | 0us | `validateTextProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2398` |
| 0.0% | 3.8ms | 0.0% | 0us | `getSelectionRanges` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:603` |
| 0.0% | 3.8ms | 0.0% | 0us | `assertSelectionSupported` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:710` |
| 0.0% | 3.8ms | 0.0% | 3.8ms | `compose` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1059` |
| 0.0% | 3.8ms | 0.0% | 3.8ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts` |
| 0.0% | 3.8ms | 0.0% | 0us | `notifyAnchorChanges` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:424` |
| 0.0% | 3.8ms | 0.0% | 0us | `getAffectedAnchorListeners` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:379` |
| 0.0% | 3.8ms | 0.0% | 0us | `sealElementOwnedRootIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:1100` |
| 0.0% | 3.8ms | 0.0% | 1.1ms | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:115` |
| 0.0% | 3.7ms | 0.0% | 0us | `fit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3112` |
| 0.0% | 3.7ms | 0.0% | 0us | `createEditorImplementation` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts:438` |
| 0.0% | 3.7ms | 0.0% | 0us | `RootChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1387` |
| 0.0% | 3.7ms | 0.0% | 0us | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7980` |
| 0.0% | 3.7ms | 0.0% | 0us | `visit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:660` |
| 0.0% | 3.7ms | 0.0% | 0us | `createEditorImplementation` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts:674` |
| 0.0% | 3.7ms | 0.0% | 0us | `subscribeAnchorState` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:329` |
| 0.0% | 3.7ms | 0.0% | 0us | `getUpdateView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4691` |
| 0.0% | 3.7ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6753` |
| 0.0% | 3.7ms | 0.0% | 3.7ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1162` |
| 0.0% | 3.7ms | 0.0% | 0us | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8121` |
| 0.0% | 3.7ms | 0.0% | 0us | `get` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:235` |
| 0.0% | 3.7ms | 0.0% | 0us | `composeSections` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:632` |
| 0.0% | 3.7ms | 0.0% | 3.7ms | `seek` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:427` |
| 0.0% | 3.7ms | 0.0% | 3.7ms | `getExtensionRegistryStore` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts` |
| 0.0% | 3.6ms | 0.0% | 0us | `mapPoint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:475` |
| 0.0% | 3.6ms | 0.0% | 0us | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7976` |
| 0.0% | 3.6ms | 0.0% | 0us | `DocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:738` |
| 0.0% | 3.6ms | 0.0% | 3.6ms | `get` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:205` |
| 0.0% | 3.6ms | 0.0% | 0us | `createTransactionSpecContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5240` |
| 0.0% | 3.6ms | 0.0% | 0us | `buildTransactionSpec` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5669` |
| 0.0% | 3.6ms | 0.0% | 0us | `getUpdateView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5117` |
| 0.0% | 3.6ms | 0.0% | 0us | `applyInternal` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2549` |
| 0.0% | 3.6ms | 0.0% | 0us | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7820` |
| 0.0% | 3.6ms | 0.0% | 1.1ms | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:116` |
| 0.0% | 3.6ms | 0.0% | 3.6ms | `getElementAncestors` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:517` |
| 0.0% | 3.6ms | 0.0% | 1.4ms | `assertSelectionSupported` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:737` |
| 0.0% | 3.6ms | 0.0% | 0us | `assertRemoteCommit` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:143` |
| 0.0% | 3.6ms | 0.0% | 1.2ms | `getValidationAuthority` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:555` |
| 0.0% | 3.6ms | 0.0% | 0us | `rememberValidatedDocumentRoots` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3128` |
| 0.0% | 3.6ms | 0.0% | 0us | `constructCanonicalDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1196` |
| 0.0% | 3.6ms | 0.0% | 0us | `inheritDocumentChangeStepNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7221` |
| 0.0% | 3.5ms | 0.0% | 3.5ms | `getInternalDocumentChangeEntries` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:532` |
| 0.0% | 3.5ms | 0.0% | 2.5ms | `createEditorUpdateDraftContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7667` |
| 0.0% | 3.5ms | 0.0% | 3.5ms | `get` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts` |
| 0.0% | 3.5ms | 0.0% | 0us | `classifyRootChangeWithRuntimeCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:97` |
| 0.0% | 3.5ms | 0.0% | 0us | `deepFreeze` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/clone.ts:4` |
| 0.0% | 3.5ms | 0.0% | 1.0ms | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8050` |
| 0.0% | 3.5ms | 0.0% | 3.5ms | `mapPos` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2827` |
| 0.0% | 3.5ms | 0.0% | 0us | `collectProjectedRoots` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3213` |
| 0.0% | 3.4ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:130` |
| 0.0% | 3.4ms | 0.0% | 0us | `getOrphanedElementOwnedRoots` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1021` |
| 0.0% | 3.4ms | 0.0% | 3.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:283` |
| 0.0% | 3.4ms | 0.0% | 3.4ms | `compileSliceFitter` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts` |
| 0.0% | 3.4ms | 0.0% | 0us | `getCompiled` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3309` |
| 0.0% | 3.4ms | 0.0% | 0us | `mapPoint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:424` |
| 0.0% | 3.4ms | 0.0% | 3.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:183` |
| 0.0% | 3.4ms | 0.0% | 0us | `reconcileChildrenStep` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:3172` |
| 0.0% | 3.4ms | 0.0% | 3.4ms | `isArray` | `[native code]` |
| 0.0% | 3.4ms | 0.0% | 0us | `applyInternal` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2550` |
| 0.0% | 3.4ms | 0.0% | 0us | `createEditorImplementation` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts:679` |
| 0.0% | 3.3ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:450` |
| 0.0% | 3.3ms | 0.0% | 0us | `textAt` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:300` |
| 0.0% | 3.3ms | 0.0% | 3.3ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:208` |
| 0.0% | 3.2ms | 0.0% | 2.1ms | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7941` |
| 0.0% | 2.9ms | 0.0% | 2.9ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:307` |
| 0.0% | 2.9ms | 0.0% | 2.9ms | `tokensEqual` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:193` |
| 0.0% | 2.9ms | 0.0% | 1.4ms | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:131` |
| 0.0% | 2.9ms | 0.0% | 2.9ms | `allocateNodeKey` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:32` |
| 0.0% | 2.9ms | 0.0% | 1.4ms | `createEditorUpdateDraftContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7668` |
| 0.0% | 2.9ms | 0.0% | 2.9ms | `getExtensionRegistryStore` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:580` |
| 0.0% | 2.9ms | 0.0% | 0us | `sliceMaterialized` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:794` |
| 0.0% | 2.8ms | 0.0% | 0us | `getRootScopedSelection` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6622` |
| 0.0% | 2.8ms | 0.0% | 0us | `replaceCanonicalChildWindow` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:941` |
| 0.0% | 2.8ms | 0.0% | 0us | `get tokens` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:500` |
| 0.0% | 2.8ms | 0.0% | 1.3ms | `DocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:761` |
| 0.0% | 2.8ms | 0.0% | 2.8ms | `visitDescendantPaths` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/provenance.ts:46` |
| 0.0% | 2.8ms | 0.0% | 0us | `retainAddition` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1423` |
| 0.0% | 2.8ms | 0.0% | 0us | `mapSnapshotIndexThroughChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1447` |
| 0.0% | 2.8ms | 0.0% | 2.8ms | `claim` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1008` |
| 0.0% | 2.8ms | 0.0% | 1.4ms | `createInternalDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:570` |
| 0.0% | 2.8ms | 0.0% | 2.8ms | `childBoundaryAt` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:108` |
| 0.0% | 2.8ms | 0.0% | 2.8ms | `indexRecursivePath` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` |
| 0.0% | 2.8ms | 0.0% | 0us | `classifyRootChangeWithRuntimeCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:148` |
| 0.0% | 2.8ms | 0.0% | 0us | `addChildWindow` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:787` |
| 0.0% | 2.7ms | 0.0% | 0us | `compileRemoteChanges` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:116` |
| 0.0% | 2.7ms | 0.0% | 0us | `mapPathForward` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:604` |
| 0.0% | 2.7ms | 0.0% | 0us | `getUpdateView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4861` |
| 0.0% | 2.7ms | 0.0% | 1.3ms | `getChangeValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6749` |
| 0.0% | 2.7ms | 0.0% | 0us | `getChangeValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6748` |
| 0.0% | 2.7ms | 0.0% | 1.3ms | `replaceCanonicalChildWindow` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:874` |
| 0.0% | 2.7ms | 0.0% | 2.7ms | `pathKey` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/provenance.ts:41` |
| 0.0% | 2.7ms | 0.0% | 0us | `commit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:2464` |
| 0.0% | 2.7ms | 0.0% | 1.3ms | `isInTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:742` |
| 0.0% | 2.7ms | 0.0% | 1.2ms | `createEditorDocumentValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:854` |
| 0.0% | 2.7ms | 0.0% | 1.2ms | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:132` |
| 0.0% | 2.7ms | 0.0% | 2.7ms | `clone` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:258` |
| 0.0% | 2.7ms | 0.0% | 1.3ms | `path` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/editor.ts:4650` |
| 0.0% | 2.7ms | 0.0% | 2.7ms | `hasInRoot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:781` |
| 0.0% | 2.7ms | 0.0% | 2.7ms | `finalize` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:738` |
| 0.0% | 2.7ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/editor/insert-text.ts:100` |
| 0.0% | 2.7ms | 0.0% | 0us | `above` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/editor/above.ts:41` |
| 0.0% | 2.7ms | 0.0% | 0us | `transformImplicitTarget` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6380` |
| 0.0% | 2.7ms | 0.0% | 2.7ms | `fit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts` |
| 0.0% | 2.7ms | 0.0% | 2.7ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1170` |
| 0.0% | 2.7ms | 0.0% | 0us | `applyDocumentChangeValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1289` |
| 0.0% | 2.7ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8040` |
| 0.0% | 2.7ms | 0.0% | 0us | `constructCanonicalDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1040` |
| 0.0% | 2.7ms | 0.0% | 0us | `getChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:1797` |
| 0.0% | 2.7ms | 0.0% | 0us | `createEditorImplementation` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts:672` |
| 0.0% | 2.7ms | 0.0% | 0us | `recordFacetDraftDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/facet.ts:138` |
| 0.0% | 2.6ms | 0.0% | 2.6ms | `replaceCanonicalChildWindow` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:813` |
| 0.0% | 2.6ms | 0.0% | 0us | `rememberValidatedDocumentRoots` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3130` |
| 0.0% | 2.6ms | 0.0% | 0us | `apply` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:408` |
| 0.0% | 2.6ms | 0.0% | 0us | `DocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:753` |
| 0.0% | 2.6ms | 0.0% | 2.6ms | `rawNodeAt` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:105` |
| 0.0% | 2.6ms | 0.0% | 1.3ms | `replaceCanonicalChildWindow` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:920` |
| 0.0% | 2.6ms | 0.0% | 2.6ms | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:123` |
| 0.0% | 2.6ms | 0.0% | 2.6ms | `composeSections` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:634` |
| 0.0% | 2.6ms | 0.0% | 0us | `hasChangeListeners` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:1092` |
| 0.0% | 2.6ms | 0.0% | 2.6ms | `advanceNextNodeKey` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:128` |
| 0.0% | 2.6ms | 0.0% | 2.6ms | `encodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:914` |
| 0.0% | 2.6ms | 0.0% | 2.6ms | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:103` |
| 0.0% | 2.6ms | 0.0% | 0us | `assertSelectionSupported` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:747` |
| 0.0% | 2.6ms | 0.0% | 0us | `applyIndexed` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2188` |
| 0.0% | 2.6ms | 0.0% | 0us | `createAnchor` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts:195` |
| 0.0% | 2.6ms | 0.0% | 2.6ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1370` |
| 0.0% | 2.6ms | 0.0% | 1.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8021` |
| 0.0% | 2.6ms | 0.0% | 2.6ms | `visit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:213` |
| 0.0% | 2.6ms | 0.0% | 2.6ms | `entry` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:900` |
| 0.0% | 2.6ms | 0.0% | 2.6ms | `remember` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:540` |
| 0.0% | 2.6ms | 0.0% | 2.6ms | `applyTrustedCanonical` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:698` |
| 0.0% | 2.6ms | 0.0% | 2.6ms | `applyTrustedCanonical` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:725` |
| 0.0% | 2.5ms | 0.0% | 1.2ms | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7834` |
| 0.0% | 2.5ms | 0.0% | 0us | `collectRelocationCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:217` |
| 0.0% | 2.5ms | 0.0% | 0us | `initializeBaseExtensionRegistry` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:674` |
| 0.0% | 2.5ms | 0.0% | 1.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1163` |
| 0.0% | 2.5ms | 0.0% | 0us | `applyIndexed` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2214` |
| 0.0% | 2.5ms | 0.0% | 0us | `reduceEditorUpdateTags` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/update-policy.ts:64` |
| 0.0% | 2.5ms | 0.0% | 2.5ms | `applyEditorUpdateTag` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/update-policy.ts:48` |
| 0.0% | 2.5ms | 0.0% | 0us | `applyEditorUpdateTags` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/update-policy.ts:56` |
| 0.0% | 2.5ms | 0.0% | 1.3ms | `applyAnchorChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:292` |
| 0.0% | 2.5ms | 0.0% | 0us | `mapPathForward` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:610` |
| 0.0% | 2.5ms | 0.0% | 2.5ms | `replaceCanonicalChildWindow` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:796` |
| 0.0% | 2.5ms | 0.0% | 0us | `recordStats` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2571` |
| 0.0% | 2.5ms | 0.0% | 0us | `applyIndexed` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2155` |
| 0.0% | 2.5ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:210` |
| 0.0% | 2.5ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:729` |
| 0.0% | 2.5ms | 0.0% | 2.5ms | `replacements` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2432` |
| 0.0% | 2.5ms | 0.0% | 0us | `classifyRootChangeWithRuntimeCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:208` |
| 0.0% | 2.5ms | 0.0% | 2.5ms | `getEditorDocumentRoots` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:1847` |
| 0.0% | 2.5ms | 0.0% | 0us | `createCommitChanged` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:388` |
| 0.0% | 2.5ms | 0.0% | 2.5ms | `visit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:638` |
| 0.0% | 2.5ms | 0.0% | 2.5ms | `resolveExternalDocumentPoint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1469` |
| 0.0% | 2.5ms | 0.0% | 1.3ms | `strict` | `node:assert:586` |
| 0.0% | 2.5ms | 0.0% | 2.5ms | `PreparedTokenSlice` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts` |
| 0.0% | 2.5ms | 0.0% | 0us | `composeSections` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:605` |
| 0.0% | 2.5ms | 0.0% | 0us | `getUpdateView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5179` |
| 0.0% | 2.5ms | 0.0% | 2.5ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:86` |
| 0.0% | 2.5ms | 0.0% | 1.4ms | `addRange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:893` |
| 0.0% | 2.5ms | 0.0% | 2.5ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:137` |
| 0.0% | 2.5ms | 0.0% | 0us | `forwardOutput` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:536` |
| 0.0% | 2.5ms | 0.0% | 2.5ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:155` |
| 0.0% | 2.5ms | 0.0% | 2.5ms | `fitClosedNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:473` |
| 0.0% | 2.5ms | 0.0% | 0us | `applyTransactionSpecDocumentChangeStep` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7347` |
| 0.0% | 2.5ms | 0.0% | 2.5ms | `hasOwn` | `[native code]` |
| 0.0% | 2.5ms | 0.0% | 1.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8019` |
| 0.0% | 2.5ms | 0.0% | 0us | `resolveMappedPoint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts:397` |
| 0.0% | 2.5ms | 0.0% | 1.2ms | `assertSelectionSupported` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:682` |
| 0.0% | 2.5ms | 0.0% | 1.4ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1184` |
| 0.0% | 2.5ms | 0.0% | 0us | `diffChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1088` |
| 0.0% | 2.5ms | 0.0% | 0us | `currentEntry` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:337` |
| 0.0% | 2.5ms | 0.0% | 2.5ms | `replacements` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2434` |
| 0.0% | 2.5ms | 0.0% | 0us | `currentTextContaining` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:342` |
| 0.0% | 2.5ms | 0.0% | 0us | `textAt` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:302` |
| 0.0% | 2.5ms | 0.0% | 1.2ms | `sliceMaterialized` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:784` |
| 0.0% | 2.5ms | 0.0% | 1.1ms | `withEditorRootChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5899` |
| 0.0% | 2.5ms | 0.0% | 0us | `mergeRegistries` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:513` |
| 0.0% | 2.5ms | 0.0% | 0us | `hasContentRoots` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1013` |
| 0.0% | 2.5ms | 0.0% | 1.4ms | `applyTrustedCanonical` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:622` |
| 0.0% | 2.5ms | 0.0% | 0us | `withoutPendingMarks` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6208` |
| 0.0% | 2.5ms | 0.0% | 0us | `advanceNextNodeKey` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:126` |
| 0.0% | 2.5ms | 0.0% | 2.5ms | `DocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:737` |
| 0.0% | 2.5ms | 0.0% | 0us | `indexedAfter` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:202` |
| 0.0% | 2.4ms | 0.0% | 0us | `applyIndexed` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2152` |
| 0.0% | 2.4ms | 0.0% | 0us | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7873` |
| 0.0% | 2.4ms | 0.0% | 0us | `getCurrentChildrenRoot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:899` |
| 0.0% | 2.4ms | 0.0% | 2.4ms | `mapRelocatedPath` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:517` |
| 0.0% | 2.4ms | 0.0% | 0us | `addTouching` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:940` |
| 0.0% | 2.4ms | 0.0% | 0us | `validateDeclarativeDocument` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3044` |
| 0.0% | 2.4ms | 0.0% | 1.1ms | `mapSelectionThroughChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:891` |
| 0.0% | 2.4ms | 0.0% | 0us | `getCurrentRootSnapshot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6687` |
| 0.0% | 2.4ms | 0.0% | 0us | `applyTrustedCanonical` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:660` |
| 0.0% | 2.4ms | 0.0% | 0us | `constructCanonicalDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1041` |
| 0.0% | 2.4ms | 0.0% | 0us | `fit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:2938` |
| 0.0% | 2.4ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:1861` |
| 0.0% | 2.4ms | 0.0% | 2.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1745` |
| 0.0% | 2.4ms | 0.0% | 2.4ms | `isRecursivelyValidated` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3549` |
| 0.0% | 2.4ms | 0.0% | 2.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:3153` |
| 0.0% | 2.4ms | 0.0% | 1.4ms | `inheritDocumentChangeStepNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7233` |
| 0.0% | 2.4ms | 0.0% | 2.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1150` |
| 0.0% | 2.4ms | 0.0% | 2.4ms | `snapshotSliceContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:74` |
| 0.0% | 2.4ms | 0.0% | 0us | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7982` |
| 0.0% | 2.4ms | 0.0% | 2.4ms | `constructCanonicalDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1060` |
| 0.0% | 2.4ms | 0.0% | 0us | `createCommitChanged` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:387` |
| 0.0% | 2.4ms | 0.0% | 0us | `fit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1720` |
| 0.0% | 2.4ms | 0.0% | 2.4ms | `getDocumentRootProgram` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` |
| 0.0% | 2.4ms | 0.0% | 0us | `fit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3047` |
| 0.0% | 2.4ms | 0.0% | 1.0ms | `prepareCanonicalRootFit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:734` |
| 0.0% | 2.4ms | 0.0% | 0us | `measureAnchors` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:295` |
| 0.0% | 2.4ms | 0.0% | 0us | `getChangeValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6760` |
| 0.0% | 2.4ms | 0.0% | 2.4ms | `rawNodeAt` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:106` |
| 0.0% | 2.4ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1014` |
| 0.0% | 2.4ms | 0.0% | 1.1ms | `childBoundaryAt` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:115` |
| 0.0% | 2.4ms | 0.0% | 0us | `getUpdateView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4575` |
| 0.0% | 2.4ms | 0.0% | 0us | `claimSource` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:94` |
| 0.0% | 2.4ms | 0.0% | 1.1ms | `sliceMaterialized` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:783` |
| 0.0% | 2.3ms | 0.0% | 0us | `hideFromStack` | `internal:shared:19` |
| 0.0% | 2.3ms | 0.0% | 0us | `node:path` | `node:path:2` |
| 0.0% | 2.3ms | 0.0% | 2.3ms | `defineProperty` | `[native code]` |
| 0.0% | 2.3ms | 0.0% | 0us | `internal:validators` | `internal:validators:48` |
| 0.0% | 2.3ms | 0.0% | 2.3ms | `isRecursivelyValidated` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3555` |
| 0.0% | 2.3ms | 0.0% | 0us | `getElementOwnedRootIssues` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:1027` |
| 0.0% | 2.3ms | 0.0% | 1.2ms | `internal:fs/streams` | `internal:fs/streams:2` |
| 0.0% | 2.3ms | 0.0% | 0us | `get ReadStream` | `node:fs:578` |
| 0.0% | 2.3ms | 0.0% | 0us | `equalValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:152` |
| 0.0% | 2.3ms | 0.0% | 2.3ms | `encode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:850` |
| 0.0% | 2.3ms | 0.0% | 0us | `createEditorDocumentValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:855` |
| 0.0% | 2.3ms | 0.0% | 2.3ms | `propertyChanges` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2459` |
| 0.0% | 2.3ms | 0.0% | 0us | `classifyDocumentRange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:66` |
| 0.0% | 2.3ms | 0.0% | 0us | `publishInitialEditorExtensions` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts:211` |
| 0.0% | 2.3ms | 0.0% | 0us | `buildConfiguredRegistry` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:1913` |
| 0.0% | 2.3ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7287` |
| 0.0% | 2.3ms | 0.0% | 2.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs` |
| 0.0% | 2.3ms | 0.0% | 0us | `runRemoteChangeBatch` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:231` |
| 0.0% | 2.3ms | 0.0% | 0us | `recordFacetDraftDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/facet.ts:137` |
| 0.0% | 2.3ms | 0.0% | 2.3ms | `getDescendant` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:346` |
| 0.0% | 2.3ms | 0.0% | 1.0ms | `empty` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1569` |
| 0.0% | 2.3ms | 0.0% | 0us | `constructCanonicalDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1053` |
| 0.0% | 2.3ms | 0.0% | 0us | `assertSelectionSupported` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:726` |
| 0.0% | 2.3ms | 0.0% | 0us | `positionAt` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:613` |
| 0.0% | 2.3ms | 0.0% | 2.3ms | `next` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:546` |
| 0.0% | 2.3ms | 0.0% | 2.3ms | `validateContentIndexes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3406` |
| 0.0% | 2.3ms | 0.0% | 1.0ms | `replaceCanonicalChildWindow` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:806` |
| 0.0% | 2.3ms | 0.0% | 0us | `prepareFittedDocument` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1430` |
| 0.0% | 2.3ms | 0.0% | 0us | `node:assert` | `node:assert:588` |
| 0.0% | 2.3ms | 0.0% | 0us | `internal:assert/assertion_error` | `internal:assert/assertion_error:2` |
| 0.0% | 2.3ms | 0.0% | 0us | `node:assert/strict` | `node:assert/strict:3` |
| 0.0% | 2.3ms | 0.0% | 0us | `assign` | `[native code]` |
| 0.0% | 2.3ms | 0.0% | 0us | `get` | `node:assert:70` |
| 0.0% | 2.3ms | 0.0% | 0us | `loadAssertionError` | `node:assert:28` |
| 0.0% | 2.3ms | 0.0% | 2.3ms | `collectProjectedRoots` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3207` |
| 0.0% | 2.3ms | 0.0% | 2.3ms | `getDocumentRootProgram` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:779` |
| 0.0% | 2.3ms | 0.0% | 0us | `getRootContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:940` |
| 0.0% | 2.3ms | 0.0% | 2.3ms | `constructCanonicalDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:999` |
| 0.0% | 2.3ms | 0.0% | 0us | `claimSource` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:93` |
| 0.0% | 2.2ms | 0.0% | 2.2ms | `getUpdateView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4606` |
| 0.0% | 2.2ms | 0.0% | 2.2ms | `canonicalizeEditorExtension` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts` |
| 0.0% | 2.2ms | 0.0% | 1.0ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3151` |
| 0.0% | 2.2ms | 0.0% | 2.2ms | `canonicalizeDirectChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:190` |
| 0.0% | 2.2ms | 0.0% | 1.2ms | `applyIndexed` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2210` |
| 0.0% | 2.2ms | 0.0% | 2.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` |
| 0.0% | 2.2ms | 0.0% | 0us | `addTouching` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:943` |
| 0.0% | 2.2ms | 0.0% | 0us | `insertText` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:913` |
| 0.0% | 2.2ms | 0.0% | 0us | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:147` |
| 0.0% | 2.2ms | 0.0% | 0us | `normalizeSelectionRoot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-state.ts:62` |
| 0.0% | 2.2ms | 0.0% | 0us | `normalizePointRoot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-state.ts:53` |
| 0.0% | 2.2ms | 0.0% | 0us | `getUpdateView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5144` |
| 0.0% | 2.2ms | 0.0% | 1.1ms | `fit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1762` |
| 0.0% | 2.2ms | 0.0% | 1.0ms | `classifyRootChangeWithRuntimeCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:157` |
| 0.0% | 2.2ms | 0.0% | 2.2ms | `create` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1399` |
| 0.0% | 2.1ms | 0.0% | 1.1ms | `validateDeclarativeDocument` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3031` |
| 0.0% | 2.1ms | 0.0% | 2.1ms | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:105` |
| 0.0% | 2.1ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3058` |
| 0.0% | 2.1ms | 0.0% | 2.1ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1192` |
| 0.0% | 2.1ms | 0.0% | 0us | `compactMappingSegments` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:443` |
| 0.0% | 2.1ms | 0.0% | 1.0ms | `ensureElementOwnedRootIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:764` |
| 0.0% | 2.1ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:322` |
| 0.0% | 1.5ms | 0.0% | 1.5ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts:615` |
| 0.0% | 1.5ms | 0.0% | 0us | `compose` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1112` |
| 0.0% | 1.5ms | 0.0% | 1.5ms | `assertRemoteCommit` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:147` |
| 0.0% | 1.5ms | 0.0% | 0us | `mapPoint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:470` |
| 0.0% | 1.5ms | 0.0% | 1.5ms | `advancePathStableSnapshotIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1781` |
| 0.0% | 1.5ms | 0.0% | 1.5ms | `validateContentIndexes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` |
| 0.0% | 1.5ms | 0.0% | 0us | `commitAnchorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:458` |
| 0.0% | 1.5ms | 0.0% | 1.5ms | `commit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts:674` |
| 0.0% | 1.5ms | 0.0% | 1.5ms | `guardTransactionValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts` |
| 0.0% | 1.5ms | 0.0% | 0us | `assertRemoteCommit` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:146` |
| 0.0% | 1.5ms | 0.0% | 0us | `deepStrictEqual` | `node:assert:133` |
| 0.0% | 1.5ms | 0.0% | 1.5ms | `deepEquals` | `[native code]` |
| 0.0% | 1.5ms | 0.0% | 0us | `mapSelectionWithContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:861` |
| 0.0% | 1.5ms | 0.0% | 0us | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:998` |
| 0.0% | 1.5ms | 0.0% | 1.5ms | `commitAnchorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:447` |
| 0.0% | 1.5ms | 0.0% | 1.5ms | `constructCanonicalDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1049` |
| 0.0% | 1.5ms | 0.0% | 1.5ms | `assertSelectionSupported` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:676` |
| 0.0% | 1.5ms | 0.0% | 0us | `getUpdateView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5067` |
| 0.0% | 1.5ms | 0.0% | 1.5ms | `areJsonValuesStructurallyEqual` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:181` |
| 0.0% | 1.5ms | 0.0% | 0us | `finalizeTransactionSpecContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5465` |
| 0.0% | 1.5ms | 0.0% | 1.5ms | `getOrphanedElementOwnedRoots` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` |
| 0.0% | 1.5ms | 0.0% | 0us | `updateIndexedNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:418` |
| 0.0% | 1.5ms | 0.0% | 0us | `applyIndexed` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2157` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `getDeclarativeSchema` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `initializePublicState` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8709` |
| 0.0% | 1.4ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3178` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `constructCanonicalDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1227` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `createEditorCommit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:997` |
| 0.0% | 1.4ms | 0.0% | 0us | `buildConfiguredRegistry` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:1915` |
| 0.0% | 1.4ms | 0.0% | 0us | `createExtensionRegistry` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:179` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `compose` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1061` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:150` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `inheritDocumentChangeStepNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7210` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `sameNodeKind` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1127` |
| 0.0% | 1.4ms | 0.0% | 0us | `addRange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:899` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `cloneEditorJsonValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:229` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `createEditorUpdateApi` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-lifecycle-api.ts` |
| 0.0% | 1.4ms | 0.0% | 0us | `createEditorImplementation` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts:614` |
| 0.0% | 1.4ms | 0.0% | 0us | `fromPreparedNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:637` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `applyTrustedCanonical` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:565` |
| 0.0% | 1.4ms | 0.0% | 0us | `collectChangedElementPaths` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:917` |
| 0.0% | 1.4ms | 0.0% | 0us | `resolveMappedPoint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts:423` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `applyTrustedCanonical` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:628` |
| 0.0% | 1.4ms | 0.0% | 0us | `validateDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3427` |
| 0.0% | 1.4ms | 0.0% | 0us | `updateIndexedNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:395` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `assertSelectionSupported` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:709` |
| 0.0% | 1.4ms | 0.0% | 0us | `applyAnchorChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:272` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8045` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `getDescendant` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:343` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `visitDescendantPaths` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/provenance.ts:45` |
| 0.0% | 1.4ms | 0.0% | 0us | `(module)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-contribution-registry.ts:55` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `sliceMaterialized` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:789` |
| 0.0% | 1.4ms | 0.0% | 0us | `getEditorSchemaDeclarationKey` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts:1889` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `createDerivedBaseSchemaRecord` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts` |
| 0.0% | 1.4ms | 0.0% | 0us | `prepareEditorSchemaRecords` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts:1573` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:740` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:123` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts` |
| 0.0% | 1.4ms | 0.0% | 0us | `mapRelocatedPath` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:532` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `applyTrustedCanonical` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `getSegmentRelocations` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:497` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `validateDeclarativeDocument` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3107` |
| 0.0% | 1.4ms | 0.0% | 0us | `fit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:2984` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `constructCanonicalDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `getExtensionRegistryStore` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:576` |
| 0.0% | 1.4ms | 0.0% | 0us | `createEditorUpdateDraftContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7680` |
| 0.0% | 1.4ms | 0.0% | 0us | `createEditorFacetDraft` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/facet.ts:95` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1388` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `applyTrustedCanonical` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:705` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:2180` |
| 0.0% | 1.4ms | 0.0% | 0us | `getUpdateView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4652` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `replaceSnapshot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts` |
| 0.0% | 1.4ms | 0.0% | 0us | `publishConfiguredExtensionRegistry` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:717` |
| 0.0% | 1.4ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:202` |
| 0.0% | 1.4ms | 0.0% | 0us | `mergeRegistries` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:489` |
| 0.0% | 1.4ms | 0.0% | 0us | `createEditorUpdateDraftContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7654` |
| 0.0% | 1.4ms | 0.0% | 0us | `applyTransactionSpecContents` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5650` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `validateTextProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2391` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `compose` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1083` |
| 0.0% | 1.4ms | 0.0% | 0us | `deriveRootRelocations` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:271` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `materializeCandidate` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `openToken` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts` |
| 0.0% | 1.4ms | 0.0% | 0us | `DocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:762` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `apply` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:432` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `mergeRegistries` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:500` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `replaceCanonicalChildWindow` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:890` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `getIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:1100` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `commitAnchorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:457` |
| 0.0% | 1.4ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8025` |
| 0.0% | 1.4ms | 0.0% | 0us | `finalize` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:750` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:153` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `setCachedSnapshot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:920` |
| 0.0% | 1.4ms | 0.0% | 0us | `createEditorUpdateDraftContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7641` |
| 0.0% | 1.4ms | 0.0% | 0us | `getSnapshot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6523` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `hasInRoot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:773` |
| 0.0% | 1.4ms | 0.0% | 0us | `assertActive` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:3941` |
| 0.0% | 1.4ms | 0.0% | 0us | `runActive` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:3944` |
| 0.0% | 1.4ms | 0.0% | 0us | `getEditorTransactionDepth` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:748` |
| 0.0% | 1.4ms | 0.0% | 0us | `assertActiveTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:3835` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-read-runtime.ts:322` |
| 0.0% | 1.4ms | 0.0% | 0us | `mergeRegistries` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:478` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `assertExtensionPointIdentities` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:335` |
| 0.0% | 1.4ms | 0.0% | 0us | `advancePathStableSnapshotIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1779` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `assertMappingLengths` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:403` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `mapExternalRootSelection` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `getLastCommit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts:455` |
| 0.0% | 1.4ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:341` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/history/history-extension.ts` |
| 0.0% | 1.4ms | 0.0% | 0us | `getNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:913` |
| 0.0% | 1.4ms | 0.0% | 0us | `getSelectionNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:226` |
| 0.0% | 1.4ms | 0.0% | 0us | `getSelectionIds` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:751` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts` |
| 0.0% | 1.4ms | 0.0% | 0us | `visitOwnerDeclarations` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:605` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `getMutationRoot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts` |
| 0.0% | 1.4ms | 0.0% | 0us | `runTargetMutation` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:3968` |
| 0.0% | 1.4ms | 0.0% | 0us | `path` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/editor/path.ts:36` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `applyTransactionSpecContents` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `isPoint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/location.ts:62` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `createEditorDocumentValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:853` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `inheritDocumentChangeStepNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7318` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1417` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `applyPreparedTransactionSpecChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5562` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `createEditorSchema` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:546` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1493` |
| 0.0% | 1.4ms | 0.0% | 0us | `getCompiled` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3303` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `finalizeExtensionRegistry` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `resolveExtensionOrder` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts` |
| 0.0% | 1.4ms | 0.0% | 0us | `prepareScopedEditorExtensionPublication` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:2591` |
| 0.0% | 1.4ms | 0.0% | 0us | `advancePathStableSnapshotIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1811` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts` |
| 0.0% | 1.4ms | 0.0% | 1.4ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:373` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `SectionIterator` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:494` |
| 0.0% | 1.3ms | 0.0% | 0us | `indexConstructedRoot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:946` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:154` |
| 0.0% | 1.3ms | 0.0% | 0us | `getUpdateView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4595` |
| 0.0% | 1.3ms | 0.0% | 0us | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7833` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `selectionPositionEquals` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6213` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `createEditorUpdateDraftContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7656` |
| 0.0% | 1.3ms | 0.0% | 0us | `finalizeTransactionSpecContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5481` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `applyDocumentChangeValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1290` |
| 0.0% | 1.3ms | 0.0% | 0us | `enterEditorRootChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5984` |
| 0.0% | 1.3ms | 0.0% | 0us | `inheritDocumentChangeStepNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7320` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1750` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `groupRelocationCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:169` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6748` |
| 0.0% | 1.3ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8411` |
| 0.0% | 1.3ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:396` |
| 0.0% | 1.3ms | 0.0% | 0us | `expandExtensionInput` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:461` |
| 0.0% | 1.3ms | 0.0% | 0us | `prepareScopedEditorExtensionPublication` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:2543` |
| 0.0% | 1.3ms | 0.0% | 0us | `stripLocationRoots` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/internal/root-location.ts:181` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `isEditorExtension` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts` |
| 0.0% | 1.3ms | 0.0% | 0us | `getNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:908` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `comparePathsDeepestFirst` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:585` |
| 0.0% | 1.3ms | 0.0% | 0us | `RootChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1383` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:47` |
| 0.0% | 1.3ms | 0.0% | 0us | `get empty` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:833` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `createEditorCommit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:993` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `addParentIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` |
| 0.0% | 1.3ms | 0.0% | 0us | `createEditorDocumentChangeBuilder` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6894` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `invert` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts` |
| 0.0% | 1.3ms | 0.0% | 0us | `getUpdateView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4568` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `compileEditorUpdatePolicy` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/update-policy.ts:72` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `next` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:545` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `getDescendant` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:347` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `getTransactionView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6435` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:355` |
| 0.0% | 1.3ms | 0.0% | 0us | `applyRoot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:1082` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `measureConnectDisconnectHeap` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `pushUpdateTagContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/update-context.ts:20` |
| 0.0% | 1.3ms | 0.0% | 0us | `cloneFrozen` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/clone.ts:17` |
| 0.0% | 1.3ms | 0.0% | 0us | `getUpdateView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4584` |
| 0.0% | 1.3ms | 0.0% | 0us | `applyTransactionSpecDocumentChangeStep` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7377` |
| 0.0% | 1.3ms | 0.0% | 0us | `fitDocumentInput` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3171` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `applyTrustedCanonical` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:558` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `getCurrentRootSnapshot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6708` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `mergeCommandRegistries` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts` |
| 0.0% | 1.3ms | 0.0% | 0us | `createEditorImplementation` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts:607` |
| 0.0% | 1.3ms | 0.0% | 0us | `createEditorReadApi` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-lifecycle-api.ts:297` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `createCallableGroup` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-lifecycle-api.ts:250` |
| 0.0% | 1.3ms | 0.0% | 0us | `recordStats` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2572` |
| 0.0% | 1.3ms | 0.0% | 0us | `getEditorDocumentRoots` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:1832` |
| 0.0% | 1.3ms | 0.0% | 0us | `pointAt` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:262` |
| 0.0% | 1.3ms | 0.0% | 0us | `getProtectedInlineSpacerNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6814` |
| 0.0% | 1.3ms | 0.0% | 0us | `protectedInlineSpacersFor` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1022` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `isPoint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/point.ts:88` |
| 0.0% | 1.3ms | 0.0% | 0us | `between` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1550` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `commonSuffixLength` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `textFor` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs` |
| 0.0% | 1.3ms | 0.0% | 0us | `resolveExternalDocumentPoint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1464` |
| 0.0% | 1.3ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:1860` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `construct` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `applyTransactionSpecDocumentChangeStep` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7328` |
| 0.0% | 1.3ms | 0.0% | 0us | `advancePathStableSnapshotIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1814` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `cache` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1477` |
| 0.0% | 1.3ms | 0.0% | 0us | `notifyListeners` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7518` |
| 0.0% | 1.3ms | 0.0% | 0us | `registerEffectTypeInRegistry` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:874` |
| 0.0% | 1.3ms | 0.0% | 0us | `createEditorImplementation` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts:665` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `assertEffectType` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `classifyDocumentRange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:61` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `mixStructuralFingerprintString` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:87` |
| 0.0% | 1.3ms | 0.0% | 0us | `getRegisteredExtension` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:1495` |
| 0.0% | 1.3ms | 0.0% | 0us | `buildConfiguredRegistry` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:1924` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `rootCanContain` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1844` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `encode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:872` |
| 0.0% | 1.3ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1172` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `finalizeCommandRegistry` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:259` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `createEditorUpdateDraftContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7640` |
| 0.0% | 1.3ms | 0.0% | 0us | `buildConfiguredRegistry` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:1948` |
| 0.0% | 1.3ms | 0.0% | 0us | `finalizeExtensionRegistry` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:299` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:337` |
| 0.0% | 1.3ms | 0.0% | 0us | `applyIndexed` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2141` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `createTreeIndexChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:53` |
| 0.0% | 1.3ms | 0.0% | 0us | `invert` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2708` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `createEditorDocumentChangeBuilder` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6839` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `createEditorSchema` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` |
| 0.0% | 1.3ms | 0.0% | 0us | `mapSelectionWithContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:781` |
| 0.0% | 1.3ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1184` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `createEditorDocumentValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:843` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `getUpdateView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:3926` |
| 0.0% | 1.3ms | 0.0% | 0us | `assertNoMapConflicts` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:464` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:124` |
| 0.0% | 1.3ms | 0.0% | 0us | `mergeRegistries` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:484` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `validateDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3622` |
| 0.0% | 1.3ms | 0.0% | 0us | `shouldIgnoreTarget` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/editor/insert-text.ts:41` |
| 0.0% | 1.3ms | 0.0% | 0us | `above` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/editor/above.ts:58` |
| 0.0% | 1.3ms | 0.0% | 0us | `insertText` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/transforms-text/insert-text.ts:184` |
| 0.0% | 1.3ms | 0.0% | 0us | `isVoid` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3774` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `isRange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/location.ts:66` |
| 0.0% | 1.3ms | 0.0% | 0us | `rootedQueryGenerator` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-read-runtime.ts:120` |
| 0.0% | 1.3ms | 0.0% | 0us | `levels` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/editor/levels.ts:33` |
| 0.0% | 1.3ms | 0.0% | 0us | `path` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/editor/path.ts:23` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `update` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-lifecycle-api.ts:411` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `apply` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:399` |
| 0.0% | 1.3ms | 0.0% | 0us | `replaceCanonicalChildWindow` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:816` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `resolveMappedPoint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts:406` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `node` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts` |
| 0.0% | 1.3ms | 0.0% | 0us | `updateEditor` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5834` |
| 0.0% | 1.3ms | 0.0% | 0us | `replaceCanonicalChildWindow` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:838` |
| 0.0% | 1.3ms | 0.0% | 0us | `applyTrustedCanonical` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:701` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `finalize` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2622` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:81` |
| 0.0% | 1.3ms | 0.0% | 0us | `mapPoint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:472` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `ChangeDraft` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:179` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `pathOf` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1699` |
| 0.0% | 1.3ms | 0.0% | 0us | `cloneObject` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1725` |
| 0.0% | 1.3ms | 0.0% | 0us | `classify` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:352` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `materializeTokens` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:527` |
| 0.0% | 1.3ms | 0.0% | 0us | `publishConfiguredExtensionRegistry` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:730` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `updateIndexedNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:350` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `mapPoint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:449` |
| 0.0% | 1.3ms | 0.0% | 0us | `getUpdateView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5190` |
| 0.0% | 1.3ms | 0.0% | 1.3ms | `getDescendant` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:508` |
| 0.0% | 1.3ms | 0.0% | 0us | `advancePathStableSnapshotIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1798` |
| 0.0% | 1.2ms | 0.0% | 0us | `getRootContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:937` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `get empty` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:827` |
| 0.0% | 1.2ms | 0.0% | 0us | `mapSelectionThroughChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:873` |
| 0.0% | 1.2ms | 0.0% | 0us | `freezeMap` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:191` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `getStateView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:3102` |
| 0.0% | 1.2ms | 0.0% | 0us | `finalizeExtensionRegistry` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:298` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `continuityScore` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:942` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `encode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `validateDeclarativeDocument` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3048` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `applyInternal` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2541` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `protectedInlineSpacersFor` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1019` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `childBoundaryAt` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:122` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `updateIndexedNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:447` |
| 0.0% | 1.2ms | 0.0% | 0us | `createEditorImplementation` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts:486` |
| 0.0% | 1.2ms | 0.0% | 0us | `withNodeUpdates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:743` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `createEditorImplementation` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `node:fs/promises` | `node:fs/promises:2` |
| 0.0% | 1.2ms | 0.0% | 0us | `node:fs` | `node:fs:2` |
| 0.0% | 1.2ms | 0.0% | 0us | `recordFacetDraftDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/facet.ts:139` |
| 0.0% | 1.2ms | 0.0% | 0us | `prepare` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:266` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `applyTransactionSpecDocumentChangeStep` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7343` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `mapPathForward` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:582` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `update` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-lifecycle-api.ts:422` |
| 0.0% | 1.2ms | 0.0% | 0us | `ChangeDraft` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:176` |
| 0.0% | 1.2ms | 0.0% | 0us | `applyCanonical` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:511` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `comparePaths` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:857` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `isObject` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/is-object.ts:4` |
| 0.0% | 1.2ms | 0.0% | 0us | `getChangeValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6768` |
| 0.0% | 1.2ms | 0.0% | 0us | `addAnchorListener` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:150` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `nodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `isRecord` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:53` |
| 0.0% | 1.2ms | 0.0% | 0us | `subscribeAnchorState` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:331` |
| 0.0% | 1.2ms | 0.0% | 0us | `validateDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3638` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `assertOwnJsonProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` |
| 0.0% | 1.2ms | 0.0% | 0us | `indexAnchorListener` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:133` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `canonicalizeInlineChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:105` |
| 0.0% | 1.2ms | 0.0% | 0us | `advancePathStableSnapshotIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1813` |
| 0.0% | 1.2ms | 0.0% | 0us | `createEditorImplementation` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts:652` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `createEditorReadRuntime` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-read-runtime.ts` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `createPathStableMappingSegment` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:426` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:63` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `get` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts:596` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:95` |
| 0.0% | 1.2ms | 0.0% | 0us | `getEditorDocumentRoots` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:1819` |
| 0.0% | 1.2ms | 0.0% | 0us | `getUpdateView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4662` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `sealElementOwnedRootIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:1085` |
| 0.0% | 1.2ms | 0.0% | 0us | `validateDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3581` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `getIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:1096` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1084` |
| 0.0% | 1.2ms | 0.0% | 0us | `compose` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1084` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `invert` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2698` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `rawNodeAt` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:102` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7825` |
| 0.0% | 1.2ms | 0.0% | 0us | `getStructuralFingerprint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:108` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `iterChangedRanges` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2791` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `positionWasReplaced` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:558` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7795` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `applyDocumentChangeValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1255` |
| 0.0% | 1.2ms | 0.0% | 0us | `compose` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1055` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:855` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `getUpdateView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4675` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `addChildWindow` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:786` |
| 0.0% | 1.2ms | 0.0% | 0us | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7840` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `replaceIndexedChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:286` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `addSection` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:594` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `getInternalDocumentChangeEntries` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:535` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7533` |
| 0.0% | 1.2ms | 0.0% | 0us | `compactMappingSegments` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:436` |
| 0.0% | 1.2ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1167` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `visitDeclarative` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `isPoint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/point.ts:90` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:200` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `findChildIndexAtPosition` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:78` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8082` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2376` |
| 0.0% | 1.2ms | 0.0% | 0us | `applyIndexed` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2376` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2672` |
| 0.0% | 1.2ms | 0.0% | 0us | `getSelectionOnlySnapshot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6605` |
| 0.0% | 1.2ms | 0.0% | 0us | `mapInternalDocumentChangePosition` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:451` |
| 0.0% | 1.2ms | 0.0% | 0us | `getUpdateView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4600` |
| 0.0% | 1.2ms | 0.0% | 0us | `continuityScore` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:947` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `getProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:885` |
| 0.0% | 1.2ms | 0.0% | 0us | `getUpdateView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4115` |
| 0.0% | 1.2ms | 0.0% | 0us | `applyIndexed` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2370` |
| 0.0% | 1.2ms | 0.0% | 0us | `prepareScopedEditorExtensionPublication` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:2612` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `construct` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6875` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `setNodeKey` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:160` |
| 0.0% | 1.2ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:2659` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `createExtensionRecord` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `isRecursivelyValidated` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3547` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:370` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1054` |
| 0.0% | 1.2ms | 0.0% | 0us | `compose` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1054` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `innerOk` | `internal:assert/utils:9` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `valueRoot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:312` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `createWrappedContent` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:354` |
| 0.0% | 1.2ms | 0.0% | 0us | `validateCompleteExtensionGraph` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:1837` |
| 0.0% | 1.2ms | 0.0% | 0us | `between` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:781` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `visit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:1830` |
| 0.0% | 1.2ms | 0.0% | 0us | `notifyListeners` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7542` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:91` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7543` |
| 0.0% | 1.2ms | 0.0% | 0us | `applyInternal` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2563` |
| 0.0% | 1.2ms | 0.0% | 0us | `disposeTransactionSpecContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5343` |
| 0.0% | 1.2ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:194` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `addTouching` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:941` |
| 0.0% | 1.2ms | 0.0% | 0us | `internal:util/colors` | `internal:util/colors:24` |
| 0.0% | 1.2ms | 0.0% | 0us | `apply` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:449` |
| 0.0% | 1.2ms | 0.0% | 0us | `refresh` | `internal:util/colors:18` |
| 0.0% | 1.2ms | 0.0% | 0us | `WriteStream` | `internal:fs/streams:244` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `writer` | `[native code]` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `read` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-lifecycle-api.ts:214` |
| 0.0% | 1.2ms | 0.0% | 0us | `validateDeclarativeNodeProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2553` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `path` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-read-runtime.ts` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `groupRelocationCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:162` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `fit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1649` |
| 0.0% | 1.2ms | 0.0% | 0us | `mapExternalRootSelection` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1633` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts:438` |
| 0.0% | 1.2ms | 0.0% | 0us | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:195` |
| 0.0% | 1.2ms | 0.0% | 0us | `PreparedTokenSliceStructureError` | `[native code]` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `Error` | `[native code]` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `appendNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:106` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `composeSections` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:606` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `get tokens` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:523` |
| 0.0% | 1.2ms | 0.0% | 0us | `disposeTransactionSpecContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5336` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `closeScopedTransactionAnchors` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:603` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `applyAnchorChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:317` |
| 0.0% | 1.2ms | 0.0% | 0us | `notifyAnchorChanges` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:403` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `getActiveAnchorState` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:80` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `decodeNodes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:206` |
| 0.0% | 1.2ms | 0.0% | 0us | `compose` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1111` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `bind` | `[native code]` |
| 0.0% | 1.2ms | 0.0% | 0us | `compose` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1060` |
| 0.0% | 1.2ms | 0.0% | 1.2ms | `applyTransactionSpecDocumentChangeStep` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7409` |
| 0.0% | 1.1ms | 0.0% | 0us | `collectProjectedRoots` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3208` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `applyCanonical` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts` |
| 0.0% | 1.1ms | 0.0% | 0us | `readEditor` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5809` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `isEditorJsonValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:122` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `enterEditorRead` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:754` |
| 0.0% | 1.1ms | 0.0% | 0us | `initializePublicState` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8705` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `normalizeEditorValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/initial-value.ts` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `openToken` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:293` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `resolveLatestExtensionEntries` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts` |
| 0.0% | 1.1ms | 0.0% | 0us | `prepareScopedEditorExtensionPublication` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:2542` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3577` |
| 0.0% | 1.1ms | 0.0% | 0us | `constructCanonicalDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1059` |
| 0.0% | 1.1ms | 0.0% | 0us | `between` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1478` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `replacements` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `createCommitChanged` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:952` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `recordStats` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2570` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `canonicalizeNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:245` |
| 0.0% | 1.1ms | 0.0% | 0us | `compose` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1058` |
| 0.0% | 1.1ms | 0.0% | 0us | `diffNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1043` |
| 0.0% | 1.1ms | 0.0% | 0us | `text` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:665` |
| 0.0% | 1.1ms | 0.0% | 0us | `diffChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1183` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `withInsertedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2736` |
| 0.0% | 1.1ms | 0.0% | 0us | `bindDocumentChangeNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:599` |
| 0.0% | 1.1ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:603` |
| 0.0% | 1.1ms | 0.0% | 0us | `createFakeCollabAdapter` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:157` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `getSelectionStateSelection` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-state.ts:11` |
| 0.0% | 1.1ms | 0.0% | 0us | `measureConnectDisconnectHeap` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:354` |
| 0.0% | 1.1ms | 0.0% | 0us | `buildConfiguredRegistry` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:1960` |
| 0.0% | 1.1ms | 0.0% | 0us | `encode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:918` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `isTextNode` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts` |
| 0.0% | 1.1ms | 0.0% | 0us | `finalizeExtensionRegistry` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:316` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `fit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3008` |
| 0.0% | 1.1ms | 0.0% | 0us | `getElementOwnedRootKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:1022` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `fit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1650` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `createCommitChanged` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:404` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `applyTransactionSpecDocumentChangeStep` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7334` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `collect` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:80` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:316` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `validateDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3633` |
| 0.0% | 1.1ms | 0.0% | 0us | `replaceCanonicalChildWindow` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:809` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `replacements` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2450` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `addSection` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:583` |
| 0.0% | 1.1ms | 0.0% | 0us | `create` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1459` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `apply` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:464` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `mapPoint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `fitDocument` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `cleanup` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts` |
| 0.0% | 1.1ms | 0.0% | 0us | `getCurrentSelection` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6188` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `finalizeTransactionSpecContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5441` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `mapIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7273` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:53` |
| 0.0% | 1.1ms | 0.0% | 0us | `mapSelectionThroughChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:901` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `positionAt` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `fit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1739` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `classifyRootChangeWithRuntimeCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:124` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `withEditorUpdateRoot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:715` |
| 0.0% | 1.1ms | 0.0% | 0us | `compose` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1095` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `get empty` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2022` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `advanceNextNodeKey` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:129` |
| 0.0% | 1.1ms | 0.0% | 0us | `SectionIterator` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:497` |
| 0.0% | 1.1ms | 0.0% | 0us | `mergeCommandRegistries` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:374` |
| 0.0% | 1.1ms | 0.0% | 0us | `mapPoint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:413` |
| 0.0% | 1.1ms | 0.0% | 0us | `getDerivedBaseSchema` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-contribution-registry.ts:61` |
| 0.0% | 1.1ms | 0.0% | 0us | `createExtensionRegistry` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:174` |
| 0.0% | 1.1ms | 0.0% | 0us | `createEditorImplementation` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts:663` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `compileEditorSchemaInternal` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts` |
| 0.0% | 1.1ms | 0.0% | 0us | `createSchemaContributionRegistry` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-contribution-registry.ts:102` |
| 0.0% | 1.1ms | 0.0% | 0us | `createEditorUpdateDraftContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7693` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `visit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:185` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `getTransactionView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6429` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `toSchemaValidationLocation` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:382` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `mapChangedNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1042` |
| 0.0% | 1.1ms | 0.0% | 0us | `applyAnchorChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:311` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `mergeRegistries` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:534` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `createCommitChanged` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:407` |
| 0.0% | 1.1ms | 0.0% | 0us | `getPathByNodeKey` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:1977` |
| 0.0% | 1.1ms | 0.0% | 0us | `getPathByNodeKey` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts:456` |
| 0.0% | 1.1ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts:87` |
| 0.0% | 1.1ms | 0.0% | 0us | `runEditorTransaction` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7975` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `concat` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:675` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `getTransactionView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `advancePathStableSnapshotIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1825` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `applyDocumentChangeValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1257` |
| 0.0% | 1.1ms | 0.0% | 0us | `applyIndexed` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2172` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `replace` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/editor.ts` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `reconcileChildrenStep` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `getUpdateView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4653` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `nodeRangesTouching` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:182` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `createEditorUpdateDraftContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7644` |
| 0.0% | 1.1ms | 0.0% | 0us | `collect` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:90` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:523` |
| 0.0% | 1.1ms | 0.0% | 0us | `mapRelocatedPath` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:521` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `validateCompleteExtensionGraph` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:1798` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `insertText` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/transforms-text/insert-text.ts` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `isInteger` | `[native code]` |
| 0.0% | 1.1ms | 0.0% | 0us | `create` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1416` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `recordStats` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2568` |
| 0.0% | 1.1ms | 0.0% | 0us | `getChangeValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6747` |
| 0.0% | 1.1ms | 0.0% | 0us | `jsonEqual` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:126` |
| 0.0% | 1.1ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8421` |
| 0.0% | 1.1ms | 0.0% | 0us | `getProtectedInlineSpacerEntries` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:370` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `getLastCommit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `applyTrustedCanonical` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:607` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `recordFacetCommit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/facet.ts:176` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `visit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:210` |
| 0.0% | 1.1ms | 0.0% | 0us | `resolveMappedPoint` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts:424` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8008` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `validateTextProperties` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` |
| 0.0% | 1.1ms | 0.0% | 0us | `rememberValidatedDocumentRoots` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3140` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `fromValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts` |
| 0.0% | 1.1ms | 0.0% | 0us | `getUpdateView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5061` |
| 0.0% | 1.1ms | 0.0% | 0us | `internal:stream` | `internal:stream:2` |
| 0.0% | 1.1ms | 0.0% | 0us | `internal:streams/pipeline` | `internal:streams/pipeline:2` |
| 0.0% | 1.1ms | 0.0% | 0us | `node:stream` | `node:stream:2` |
| 0.0% | 1.1ms | 0.0% | 0us | `internal:streams/operators` | `internal:streams/operators:2` |
| 0.0% | 1.1ms | 0.0% | 0us | `internal:streams/compose` | `internal:streams/compose:2` |
| 0.0% | 1.1ms | 0.0% | 0us | `snapshotContentSlice` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:164` |
| 0.0% | 1.1ms | 0.0% | 0us | `normalizeSelectionRoot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-state.ts:46` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8046` |
| 0.0% | 1.1ms | 0.0% | 0us | `createEditorUpdateDraftContext` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7662` |
| 0.0% | 1.1ms | 0.0% | 0us | `applyTrustedCanonical` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:683` |
| 0.0% | 1.1ms | 0.0% | 1.1ms | `cacheIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:390` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `applyIndexed` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `applyTransactionSpecDocumentChangeStep` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7332` |
| 0.0% | 1.0ms | 0.0% | 0us | `createAnchor` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts:257` |
| 0.0% | 1.0ms | 0.0% | 0us | `getCurrentRuntimeIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:1699` |
| 0.0% | 1.0ms | 0.0% | 0us | `getNodeKey` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts:457` |
| 0.0% | 1.0ms | 0.0% | 0us | `createPointState` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts:157` |
| 0.0% | 1.0ms | 0.0% | 0us | `getSnapshot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6497` |
| 0.0% | 1.0ms | 0.0% | 0us | `getCachedSnapshot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:905` |
| 0.0% | 1.0ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts:82` |
| 0.0% | 1.0ms | 0.0% | 0us | `getNodeKey` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:1911` |
| 0.0% | 1.0ms | 0.0% | 0us | `applyTransactionSpecDocumentChangeStep` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7399` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `syncImplicitTargetToCurrentSelection` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6362` |
| 0.0% | 1.0ms | 0.0% | 0us | `decrementEditorTransactionDepth` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:780` |
| 0.0% | 1.0ms | 0.0% | 0us | `constructCanonicalDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:994` |
| 0.0% | 1.0ms | 0.0% | 0us | `fork` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:215` |
| 0.0% | 1.0ms | 0.0% | 0us | `applyAnchorChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:277` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `finalize` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:753` |
| 0.0% | 1.0ms | 0.0% | 0us | `applyIndexed` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2185` |
| 0.0% | 1.0ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:869` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `notifyListeners` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7493` |
| 0.0% | 1.0ms | 0.0% | 0us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:359` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `pathKey` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `applyPreparedTransactionSpecChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `assertRemoteCommit` | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:148` |
| 0.0% | 1.0ms | 0.0% | 0us | `diffChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1132` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `propertyChanges` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2458` |
| 0.0% | 1.0ms | 0.0% | 0us | `applyAnchorChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:282` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `getUpdateView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4757` |
| 0.0% | 1.0ms | 0.0% | 0us | `get empty` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:831` |
| 0.0% | 1.0ms | 0.0% | 0us | `apply` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:483` |
| 0.0% | 1.0ms | 0.0% | 0us | `fit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:2983` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `buildConfiguredRegistry` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:2044` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `setCachedSnapshot` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:921` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `addParentIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3470` |
| 0.0% | 1.0ms | 0.0% | 0us | `hasChangeListeners` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:1093` |
| 0.0% | 1.0ms | 0.0% | 0us | `getDocumentOwnershipIndexes` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:720` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `equalValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:151` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:114` |
| 0.0% | 1.0ms | 0.0% | 0us | `createCommitChanged` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:406` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `initializePublicState` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `get done` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `getLastCommit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/editor.ts:4463` |
| 0.0% | 1.0ms | 0.0% | 0us | `composeSections` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:610` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `canonicalizeDirectChildren` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:201` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `createEditorCommit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:1029` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `createEditorSchema` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2727` |
| 0.0% | 1.0ms | 0.0% | 0us | `fit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1774` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `edges` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/range.ts:107` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `applyDocumentChangeValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1278` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `groupRelocationCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:174` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `getElementOwnedRootIndex` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:402` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `fork` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:235` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2117` |
| 0.0% | 1.0ms | 0.0% | 0us | `applyIndexed` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2116` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `prepareScopedEditorExtensionPublication` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:2599` |
| 0.0% | 1.0ms | 0.0% | 0us | `getUpdateView` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5154` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `deepFreeze` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:162` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `stageFields` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts` |
| 0.0% | 1.0ms | 0.0% | 0us | `stage` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:2522` |
| 0.0% | 1.0ms | 0.0% | 0us | `publishInitialEditorExtensions` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts:221` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `classifyRootChangeWithRuntimeCandidates` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:121` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `materializeTokens` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:529` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `applyTrustedCanonical` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:566` |
| 0.0% | 1.0ms | 0.0% | 0us | `constructCanonicalDocumentChange` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1047` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `guardTransactionValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:3861` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1763` |
| 0.0% | 1.0ms | 0.0% | 0us | `createEditorDocumentValue` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:891` |
| 0.0% | 1.0ms | 0.0% | 0us | `compose` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1056` |
| 0.0% | 1.0ms | 0.0% | 0us | `prepare` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:278` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `isElement` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/element.ts:132` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `getNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `get` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6711` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `rawNodeAt` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:109` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `inheritDocumentChangeStepNodeKeys` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7216` |
| 0.0% | 1.0ms | 0.0% | 0us | `replaceCanonicalChildWindow` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:905` |
| 0.0% | 1.0ms | 0.0% | 0us | `notifyListeners` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7588` |
| 0.0% | 1.0ms | 0.0% | 0us | `classify` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:375` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `nodeRangesTouching` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:176` |
| 0.0% | 1.0ms | 0.0% | 0us | `fit` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1914` |
| 0.0% | 1.0ms | 0.0% | 1.0ms | `seek` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:433` |
| 0.0% | 977us | 0.0% | 977us | `replacements` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2433` |
| 0.0% | 942us | 0.0% | 942us | `(anonymous)` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:113` |
| 0.0% | 910us | 0.0% | 0us | `compactMappingSegments` | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:432` |

## Function Details

### `nodeAtPath`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:261` | Self: 19.7% (41.92s) | Total: 19.7% (41.92s) | Samples: 32928

**Called by:**
- `nodeText` (19689)
- `node` (13120)
- `map` (32)
- `mapChangedNodeKeys` (27)
- `mapChangedNodeKeys` (18)
- `mapChangedNodeKeys` (12)
- `addRange` (11)
- `collectRelocationCandidates` (7)
- `classifyRootChangeWithRuntimeCandidates` (3)
- `(anonymous)` (2)
- `advancePathStableSnapshotIndex` (2)
- `resolveMappedPoint` (1)
- `(anonymous)` (1)
- `(anonymous)` (1)
- `resolveMappedPoint` (1)
- `claim` (1)

### `map`
`[native code]` | Self: 7.5% (15.94s) | Total: 100.0% (242.52s) | Samples: 12514

**Called by:**
- `(module)` (166411)
- `nodeText` (12400)
- `canonicalizeDeclarativeChildren` (3439)
- `getDocumentOwnershipIndexes` (2942)
- `snapshotSliceContent` (734)
- `compileRemoteChanges` (726)
- `cloneJson` (478)
- `canonicalizeRootChildren` (473)
- `canonicalizeCompiledExclusiveTextProperties` (449)
- `createTreeIndexNode` (433)
- `(anonymous)` (358)
- `freezeRootClassification` (315)
- `classifyDocumentRange` (258)
- `(anonymous)` (255)
- `createTreeIndex` (161)
- `canonicalizeNode` (128)
- `cloneJson` (115)
- `mapSnapshotIndexThroughChange` (61)
- `mapTo` (55)
- `(anonymous)` (39)
- `mapSnapshotIndexThroughChange` (30)
- `cloneEditorJsonValue` (10)
- `validateSubtree` (9)
- `classifyDocumentRange` (5)
- `DocumentChange` (3)
- `invert` (3)
- `createCommitChanged` (2)
- `applyIndexed` (2)
- `currentEntry` (2)
- `compose` (1)
- `constructCanonicalDocumentChange` (1)
- `bindDocumentChangeNodeKeys` (1)
- `expandExtensionInput` (1)
- `fit` (1)
- `compose` (1)
- `getElementOwnedRootKeys` (1)
- `advancePathStableSnapshotIndex` (1)
- `recordFacetDraftDocumentChange` (1)
- `applyIndexed` (1)
- `recordStats` (1)

**Calls:**
- `(anonymous)` (166411)
- `(anonymous)` (2940)
- `read` (1398)
- `(anonymous)` (1169)
- `(anonymous)` (726)
- `(anonymous)` (664)
- `createTreeIndexNode` (433)
- `(anonymous)` (339)
- `canonicalizeDeclarativePropertyRecord` (320)
- `freeze` (270)
- `canonicalizeNode` (261)
- `(anonymous)` (239)
- `cloneFrozen` (236)
- `(anonymous)` (198)
- `(anonymous)` (143)
- `(anonymous)` (131)
- `(anonymous)` (130)
- `canonicalizeNode` (128)
- `(anonymous)` (128)
- `(anonymous)` (116)
- `canonicalizeDeclarativePropertyRecord` (103)
- `(anonymous)` (95)
- `canonicalizeDeclarativePropertyRecord` (88)
- `canonicalizeDeclarativePropertyRecord` (87)
- `(anonymous)` (72)
- `canonicalizeDeclarativePropertyRecord` (71)
- `canonicalizeNode` (69)
- `(anonymous)` (68)
- `(anonymous)` (65)
- `(anonymous)` (50)
- `canonicalizeDeclarativePropertyRecord` (42)
- `resolveMappedPoint` (42)
- `(anonymous)` (41)
- `(anonymous)` (39)
- `(anonymous)` (37)
- `canonicalizeDeclarativePropertyRecord` (36)
- `(anonymous)` (33)
- `(anonymous)` (32)
- `nodeAtPath` (32)
- `canonicalizeDeclarativePropertyRecord` (30)
- `createTreeIndexNode` (22)
- `(anonymous)` (21)
- `(anonymous)` (20)
- `(anonymous)` (20)
- `createTreeIndexNode` (19)
- `canonicalizeDeclarativePropertyRecord` (16)
- `(anonymous)` (16)
- `(anonymous)` (15)
- `(anonymous)` (15)
- `(anonymous)` (14)
- `canonicalizeDeclarativePropertyRecord` (10)
- `canonicalizeDeclarativePropertyRecord` (9)
- `(anonymous)` (9)
- `(anonymous)` (9)
- `resolveMappedPoint` (7)
- `(anonymous)` (5)
- `canonicalizeNode` (4)
- `canonicalizeDeclarativePropertyRecord` (4)
- `(anonymous)` (4)
- `(anonymous)` (4)
- `(anonymous)` (3)
- `(anonymous)` (3)
- `pathKey` (3)
- `(anonymous)` (3)
- `(anonymous)` (2)
- `deepFreeze` (2)
- `(anonymous)` (2)
- `resolveMappedPoint` (2)
- `resolveMappedPoint` (1)
- `(anonymous)` (1)
- `canonicalizeDeclarativePropertyRecord` (1)
- `(anonymous)` (1)
- `(anonymous)` (1)
- `canonicalizeNode` (1)
- `pathKey` (1)
- `(anonymous)` (1)
- `(anonymous)` (1)
- `(anonymous)` (1)
- `(anonymous)` (1)
- `(anonymous)` (1)
- `(anonymous)` (1)
- `resolveMappedPoint` (1)
- `(anonymous)` (1)
- `(anonymous)` (1)
- `resolveMappedPoint` (1)
- `(anonymous)` (1)

### `freeze`
`[native code]` | Self: 6.0% (12.80s) | Total: 6.0% (12.80s) | Samples: 10076

**Called by:**
- `replaceIndexedChildren` (1420)
- `PreparedTokenSlice` (1409)
- `PreparedTokenSlice` (1266)
- `materializeTokens` (842)
- `materializeTokens` (429)
- `classifyRootChangeWithRuntimeCandidates` (351)
- `map` (270)
- `openToken` (250)
- `fitClosedNode` (225)
- `encode` (223)
- `decodeNodes` (218)
- `claim` (209)
- `getStructuralFingerprint` (197)
- `freezeRootClassification` (173)
- `normalizeTokens` (170)
- `classifyRootChangeWithRuntimeCandidates` (164)
- `(anonymous)` (146)
- `encode` (144)
- `collectRelocationCandidates` (132)
- `encode` (127)
- `classifyRootChangeWithRuntimeCandidates` (115)
- `classifyRootChangeWithRuntimeCandidates` (113)
- `decodeNodes` (112)
- `snapshotContentSlice` (106)
- `PreparedTokenSlice` (87)
- `fit` (84)
- `cache` (67)
- `addOwnPath` (67)
- `addRange` (62)
- `decodeNodes` (61)
- `mapSnapshotIndexThroughChange` (61)
- `mapSnapshotIndexThroughChange` (57)
- `(anonymous)` (57)
- `decodeNodes` (52)
- `encode` (52)
- `deepFreeze` (50)
- `encode` (49)
- `encode` (48)
- `encode` (40)
- `classifyRootChangeWithRuntimeCandidates` (38)
- `addParentIndex` (31)
- `mapSnapshotIndexThroughChange` (30)
- `getStructuralFingerprint` (22)
- `decodeNodes` (21)
- `decodeNodes` (18)
- `deepFreeze` (18)
- `encode` (16)
- `RootChange` (16)
- `updateIndexedNodes` (16)
- `collectProjectedRoots` (11)
- `deepFreeze` (10)
- `freezeReadonlyMap` (8)
- `RootChange` (6)
- `addRange` (6)
- `publicPoint` (5)
- `projectSelectionPoint` (5)
- `DocumentIndex` (5)
- `validateDeclarativeDocument` (4)
- `freezeReadonlySet` (4)
- `createEditorCommit` (4)
- `getUpdateView` (3)
- `advancePathStableSnapshotIndex` (3)
- `getUpdateView` (3)
- `reconcileExclusiveElementOwnedRoots` (3)
- `getUpdateView` (3)
- `composeSections` (3)
- `sliceMaterialized` (2)
- `addChildWindow` (2)
- `recordStats` (2)
- `pushUpdateTagContext` (2)
- `sealElementOwnedRootIndex` (2)
- `getUpdateView` (2)
- `projectSelectionRange` (2)
- `getUpdateView` (2)
- `compileEditorUpdatePolicy` (2)
- `freezeIndex` (2)
- `getChangeValue` (2)
- `projectSelectionRange` (2)
- `mapPoint` (2)
- `getUpdateView` (1)
- `getChangeValue` (1)
- `advancePathStableSnapshotIndex` (1)
- `diffChildren` (1)
- `runEditorTransaction` (1)
- `inheritDocumentChangeStepNodeKeys` (1)
- `getUpdateView` (1)
- `DocumentChange` (1)
- `compactMappingSegments` (1)
- `assertSelectionSupported` (1)
- `getUpdateView` (1)
- `validateDeclarativeDocument` (1)
- `DocumentChange` (1)
- `prepareCanonicalRootFit` (1)
- `fromPreparedNodes` (1)
- `ChangeDraft` (1)
- `getUpdateView` (1)
- `DocumentChange` (1)
- `runEditorTransaction` (1)
- `finalizeTransactionSpecContext` (1)
- `validateDeclarativeDocument` (1)
- `getNodeKeys` (1)
- `setCurrentSelection` (1)
- `getUpdateView` (1)
- `applyAnchorChange` (1)
- `finalizeExtensionRegistry` (1)
- `getUpdateView` (1)
- `updateIndexedNodes` (1)
- `fitDocument` (1)
- `advancePathStableSnapshotIndex` (1)
- `apply` (1)
- `createEditorCommit` (1)
- `(anonymous)` (1)

### `gc`
`[native code]` | Self: 5.7% (12.14s) | Total: 5.7% (12.14s) | Samples: 9590

**Called by:**
- `forceGc` (9590)

### `isFrozen`
`[native code]` | Self: 5.6% (11.99s) | Total: 5.6% (11.99s) | Samples: 9415

**Called by:**
- `isDeepFrozenNode` (2877)
- `isDeepFrozenNode` (1628)
- `rememberValidatedDocumentRoots` (1591)
- `createEditorDocumentValue` (1581)
- `remember` (947)
- `(anonymous)` (686)
- `validateSubtree` (71)
- `DocumentIndex` (21)
- `validateSubtree` (11)
- `deepFreeze` (2)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1164` | Self: 5.2% (11.06s) | Total: 10.9% (23.26s) | Samples: 8698

**Called by:**
- `filter` (18279)

**Calls:**
- `pathKey` (5792)
- `pathKey` (3782)
- `pathKey` (7)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1174` | Self: 5.0% (10.71s) | Total: 5.0% (10.74s) | Samples: 8419

**Called by:**
- `filter` (8438)

**Calls:**
- `nodeText` (15)
- `join` (4)

### `getOwnPropertyDescriptor`
`[native code]` | Self: 4.2% (9.09s) | Total: 4.2% (9.09s) | Samples: 7128

**Called by:**
- `getEditorJsonRecordEntries` (3137)
- `getEditorJsonArrayItems` (2041)
- `hasIntrinsicConstructor` (1950)

### `pathKey`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:109` | Self: 3.4% (7.38s) | Total: 3.4% (7.38s) | Samples: 5816

**Called by:**
- `(anonymous)` (5792)
- `cache` (7)
- `mapChangedNodeKeys` (5)
- `mapSnapshotIndexThroughChange` (4)
- `map` (3)
- `mapChangedNodeKeys` (2)
- `cache` (2)
- `addRange` (1)

### `pathKey`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:112` | Self: 2.3% (4.92s) | Total: 2.3% (4.92s) | Samples: 3847

**Called by:**
- `(anonymous)` (3782)
- `mapChangedNodeKeys` (45)
- `keyAt` (7)
- `cache` (4)
- `cache` (4)
- `claim` (3)
- `mapChangedNodeKeys` (1)
- `map` (1)

### `getEditorJsonArrayItems`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:54` | Self: 2.0% (4.31s) | Total: 2.0% (4.31s) | Samples: 3373

**Called by:**
- `isEditorJsonValue` (3312)
- `snapshotSliceContent` (61)

### `every`
`[native code]` | Self: 1.8% (3.93s) | Total: 29.4% (62.54s) | Samples: 3094

**Called by:**
- `isEditorJsonValue` (19980)
- `isEditorJsonValue` (19792)
- `rememberValidatedDocumentRoots` (6164)
- `isDeepFrozenNode` (1384)
- `(anonymous)` (408)
- `canonicalizeDeclarativePropertyRecord` (377)
- `structurallyEqual` (189)
- `reconcileChildrenStep` (144)
- `jsonEqual` (118)
- `structurallyEqual` (69)
- `canonicalizeNode` (69)
- `allContentAllowed` (64)
- `jsonEqual` (63)
- `freezeRootClassification` (59)
- `canonicalizeDeclarativeChildren` (40)
- `(anonymous)` (39)
- `fit` (30)
- `fitClosedNode` (19)
- `every` (17)
- `canonicalizeRootChildren` (9)
- `hasOnlyKeys` (7)
- `canonicalizeInlineChildren` (6)
- `decodeNodes` (5)
- `fitDirectContent` (5)
- `freezeRootClassification` (4)
- `(anonymous)` (3)
- `isStrictPoint` (3)
- `(anonymous)` (3)
- `setSelectionValue` (2)
- `equalValue` (2)
- `isRange` (1)
- `cloneObject` (1)
- `applyIndexed` (1)
- `collect` (1)

**Calls:**
- `isEditorJsonValue` (11880)
- `isEditorJsonValue` (10509)
- `isEditorJsonValue` (7205)
- `isEditorJsonValue` (5876)
- `isDeepFrozenNode` (3169)
- `isDeepFrozenNode` (1728)
- `isDeepFrozenNode` (1382)
- `isEditorJsonValue` (1220)
- `isEditorJsonValue` (925)
- `isEditorJsonValue` (637)
- `jsonEqual` (210)
- `jsonEqual` (176)
- `isDeepFrozenNode` (120)
- `jsonEqual` (116)
- `structurallyEqual` (69)
- `jsonEqual` (63)
- `structurallyEqual` (55)
- `structurallyEqual` (51)
- `structurallyEqual` (51)
- `(anonymous)` (50)
- `(anonymous)` (44)
- `(anonymous)` (40)
- `jsonEqual` (36)
- `(anonymous)` (33)
- `structurallyEqual` (32)
- `(anonymous)` (32)
- `(anonymous)` (30)
- `(anonymous)` (27)
- `(anonymous)` (26)
- `(anonymous)` (25)
- `(anonymous)` (21)
- `rootCanContain` (21)
- `(anonymous)` (18)
- `every` (17)
- `(anonymous)` (14)
- `(anonymous)` (10)
- `(anonymous)` (10)
- `(anonymous)` (9)
- `(anonymous)` (6)
- `(anonymous)` (5)
- `(anonymous)` (4)
- `isEditorJsonValue` (4)
- `(anonymous)` (4)
- `(anonymous)` (4)
- `(anonymous)` (3)
- `(anonymous)` (3)
- `equalValue` (2)
- `(anonymous)` (2)
- `(anonymous)` (2)
- `jsonEqual` (1)
- `rootCanContain` (1)
- `(anonymous)` (1)
- `equalValue` (1)
- `(anonymous)` (1)
- `(anonymous)` (1)
- `(anonymous)` (1)
- `(anonymous)` (1)

### `get`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts:639` | Self: 1.8% (3.91s) | Total: 1.8% (3.91s) | Samples: 3067

**Called by:**
- `performProxyObjectGet` (3067)

### `get`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts:612` | Self: 1.7% (3.81s) | Total: 1.7% (3.81s) | Samples: 3006

**Called by:**
- `performProxyObjectGet` (3008)

**Calls:**
- `toCompiledTargetContext` (1)
- `toSchemaValidationLocation` (1)

### `arrayIteratorNextHelper`
`[native code]` | Self: 1.2% (2.74s) | Total: 1.2% (2.74s) | Samples: 2151

**Called by:**
- `next` (2153)
- `performIteration` (1)

**Calls:**
- `contentAllows` (2)
- `visitOwnerDeclarations` (1)

### `entries`
`[native code]` | Self: 1.1% (2.41s) | Total: 1.1% (2.41s) | Samples: 1893

**Called by:**
- `canonicalizeDeclarativePropertyRecord` (1231)
- `cloneJson` (328)
- `canonicalizeCompiledExclusiveTextProperties` (158)
- `validateTextProperties` (113)
- `visitDeclarative` (36)
- `visitDeclarative` (10)
- `cloneEditorJsonValue` (7)
- `rememberValidatedDocumentRoots` (2)
- `bound entries` (2)
- `getChangeValue` (1)
- `createEditorDocumentValue` (1)
- `validateDeclarativeDocument` (1)
- `getDocumentOwnershipIndexes` (1)
- `canonicalizeDeclarativePropertyRecord` (1)
- `performIteration` (1)

### `filter`
`[native code]` | Self: 1.1% (2.40s) | Total: 49.4% (104.83s) | Samples: 1891

**Called by:**
- `mapChangedNodeKeys` (82210)
- `(anonymous)` (15)
- `canonicalizeDirectChildren` (15)
- `canonicalizeInlineChildren` (11)
- `mapChangedNodeKeys` (8)
- `classifyDocumentRange` (6)
- `classifyDocumentRange` (5)
- `overlappingRanges` (4)
- `classifyDocumentRange` (4)
- `DocumentChange` (3)
- `createEditorDocumentValue` (2)
- `getChangeValue` (2)
- `getRegisteredExtension` (1)
- `getSelectionNodeKeys` (1)
- `replaceCanonicalChildWindow` (1)

**Calls:**
- `(anonymous)` (37859)
- `(anonymous)` (18279)
- `(anonymous)` (15805)
- `(anonymous)` (8438)
- `(anonymous)` (6)
- `(anonymous)` (3)
- `(anonymous)` (2)
- `(anonymous)` (1)
- `(anonymous)` (1)
- `(anonymous)` (1)
- `(anonymous)` (1)
- `isElement` (1)

### `copyDataProperties`
`[native code]` | Self: 1.0% (2.23s) | Total: 1.0% (2.23s) | Samples: 1743

**Called by:**
- `nodeProps` (502)
- `toSchemaValidationLocation` (422)
- `toSchemaValidationLocation` (330)
- `getTextProperties` (298)
- `openToken` (173)
- `applyDocumentChangeValue` (5)
- `createEditorCommit` (4)
- `normalizePointRoot` (2)
- `withoutPendingMarks` (2)
- `mapInternalDocumentChangePosition` (1)
- `createEditorDocumentValue` (1)
- `mapSelectionWithContext` (1)
- `stripLocationRoots` (1)
- `createEditorDocumentChangeBuilder` (1)

### `getEditorJsonRecordEntries`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:92` | Self: 1.0% (2.18s) | Total: 1.0% (2.18s) | Samples: 1714

**Called by:**
- `isEditorJsonValue` (1712)
- `(anonymous)` (2)

### `nodeText`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1109` | Self: 1.0% (2.15s) | Total: 13.9% (29.62s) | Samples: 1686

**Called by:**
- `(anonymous)` (23237)
- `(anonymous)` (15)
- `mapChangedNodeKeys` (3)

**Calls:**
- `nodeAtPath` (19689)
- `nodeAtPath` (1251)
- `nodeAtPath` (629)

### `nodeAtPath`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:264` | Self: 0.9% (2.05s) | Total: 0.9% (2.05s) | Samples: 1576

**Called by:**
- `node` (875)
- `nodeText` (629)
- `mapChangedNodeKeys` (68)
- `mapChangedNodeKeys` (2)
- `replaceCanonicalChildWindow` (2)

### `join`
`[native code]` | Self: 0.9% (2.00s) | Total: 0.9% (2.00s) | Samples: 1571

**Called by:**
- `(anonymous)` (1550)
- `(anonymous)` (13)
- `(anonymous)` (4)
- `decodeNodes` (3)
- `(anonymous)` (1)

### `toString`
`[native code]` | Self: 0.9% (1.96s) | Total: 0.9% (1.96s) | Samples: 1552

**Called by:**
- `hasIntrinsicConstructor` (1549)
- `validateDocumentChange` (3)

### `nodeAtPath`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:255` | Self: 0.9% (1.94s) | Total: 0.9% (1.94s) | Samples: 1514

**Called by:**
- `nodeText` (1251)
- `node` (258)
- `mapChangedNodeKeys` (3)
- `addRange` (1)
- `mapChangedNodeKeys` (1)

### `read`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts` | Self: 0.8% (1.77s) | Total: 0.8% (1.77s) | Samples: 1398

**Called by:**
- `map` (1398)

### `isEditorJsonValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:123` | Self: 0.7% (1.58s) | Total: 0.7% (1.58s) | Samples: 1248

**Called by:**
- `every` (1220)
- `assertJsonValue` (29)

**Calls:**
- `WeakSet` (1)

### `flatMap`
`[native code]` | Self: 0.6% (1.40s) | Total: 0.9% (1.99s) | Samples: 1096

**Called by:**
- `toSchemaValidationLocation` (620)
- `toCompiledTargetContext` (606)
- `classifyDocumentRange` (226)
- `classifyDocumentRange` (48)
- `canonicalizeInlineChildren` (27)
- `resolveCompiledSchemaProperty` (16)
- `getElementOwnedRootIssues` (2)

**Calls:**
- `flatIntoArrayWithCallback` (449)

### `Set`
`[native code]` | Self: 0.6% (1.31s) | Total: 0.6% (1.31s) | Samples: 1033

**Called by:**
- `validateDeclarativeNodeProperties` (736)
- `hasOnlyKeys` (183)
- `(anonymous)` (35)
- `(anonymous)` (31)
- `mapSnapshotIndexThroughChange` (15)
- `mapSnapshotIndexThroughChange` (13)
- `validateSubtree` (10)
- `freezeReadonlySet` (9)
- `constructCanonicalDocumentChange` (2)
- `createEditorUpdateDraftContext` (1)
- `compose` (1)
- `compose` (1)

**Calls:**
- `get` (2)
- `next` (1)
- `get` (1)

### `forEach`
`[native code]` | Self: 0.6% (1.28s) | Total: 14.5% (30.78s) | Samples: 1012

**Called by:**
- `validateDeclarativeChildren` (18759)
- `encodeNodes` (2877)
- `encode` (1063)
- `encodeTrustedNodes` (370)
- `encode` (226)
- `validateSliceVocabulary` (214)
- `validateSubtree` (177)
- `encodeTrustedNodes` (129)
- `visitDescendantPaths` (121)
- `visitDeclarative` (80)
- `assertNode` (69)
- `claimSource` (2)
- `(anonymous)` (1)

**Calls:**
- `(anonymous)` (11464)
- `(anonymous)` (4869)
- `encode` (1292)
- `encode` (1150)
- `encode` (1063)
- `(anonymous)` (695)
- `(anonymous)` (469)
- `(anonymous)` (289)
- `encode` (243)
- `encode` (226)
- `(anonymous)` (171)
- `encode` (148)
- `(anonymous)` (125)
- `(anonymous)` (121)
- `visitDeclarative` (81)
- `encode` (78)
- `visitDeclarative` (73)
- `visitDeclarative` (63)
- `encode` (61)
- `encode` (61)
- `encode` (51)
- `encode` (50)
- `visitDeclarative` (46)
- `(anonymous)` (41)
- `(anonymous)` (35)
- `(anonymous)` (25)
- `encode` (21)
- `(anonymous)` (17)
- `assertNode` (9)
- `visitDeclarative` (6)
- `(anonymous)` (6)
- `(anonymous)` (6)
- `encode` (5)
- `assertNode` (3)
- `visitDeclarative` (3)
- `encode` (2)
- `visitDeclarative` (1)
- `(anonymous)` (1)
- `encode` (1)
- `encode` (1)
- `encode` (1)
- `(anonymous)` (1)
- `(anonymous)` (1)
- `(anonymous)` (1)

### `delete`
`[native code]` | Self: 0.5% (1.15s) | Total: 0.5% (1.15s) | Samples: 910

**Called by:**
- `isEditorJsonValue` (909)
- `notifyListeners` (1)

### `handleProxyGetTrapResult`
`[native code]` | Self: 0.5% (1.11s) | Total: 0.5% (1.11s) | Samples: 876

**Called by:**
- `performProxyObjectGet` (875)
- `(anonymous)` (1)

### `hasIntrinsicConstructor`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:25` | Self: 0.5% (1.11s) | Total: 1.4% (3.07s) | Samples: 874

**Called by:**
- `isObjectPrototype` (1839)
- `isArrayPrototype` (584)

**Calls:**
- `toString` (1549)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1169` | Self: 0.4% (951.1ms) | Total: 9.5% (20.17s) | Samples: 751

**Called by:**
- `filter` (15805)

**Calls:**
- `sameNodeKind` (8067)
- `sameNodeKind` (6560)
- `sameNodeKind` (426)
- `sameNodeKind` (1)

### `isEditorJsonValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:109` | Self: 0.4% (888.4ms) | Total: 0.6% (1.29s) | Samples: 697

**Called by:**
- `every` (637)
- `assertJsonValue` (382)

**Calls:**
- `WeakSet` (322)

### `get`
`[native code]` | Self: 0.3% (684.9ms) | Total: 0.3% (723.7ms) | Samples: 535

**Called by:**
- `bound get` (418)
- `get` (101)
- `get` (21)
- `isRecursivelyValidated` (12)
- `getTransactionSpecContext` (5)
- `getStructuralFingerprint` (3)
- `get` (3)
- `applyIndexed` (1)
- `deriveRootRelocations` (1)

**Calls:**
- `get size` (30)

### `cloneObject`
`[native code]` | Self: 0.3% (655.3ms) | Total: 0.3% (655.3ms) | Samples: 510

**Called by:**
- `toSchemaValidationLocation` (388)
- `encode` (76)
- `decodeNodes` (11)
- `decodeNodes` (11)
- `decodeNodes` (11)
- `(anonymous)` (5)
- `(anonymous)` (3)
- `applyTransactionSpecDocumentChangeStep` (1)
- `(anonymous)` (1)
- `advancePathStableSnapshotIndex` (1)
- `sealElementOwnedRootIndex` (1)
- `applyDocumentChangeValue` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2674` | Self: 0.2% (613.4ms) | Total: 0.2% (613.4ms) | Samples: 469

**Called by:**
- `forEach` (469)

### `canonicalizeDeclarativePropertyRecord`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1717` | Self: 0.2% (613.4ms) | Total: 0.2% (615.8ms) | Samples: 482

**Called by:**
- `validateDeclarativeNodeProperties` (382)
- `(anonymous)` (60)
- `map` (42)

**Calls:**
- `keys` (2)

### `sameNodeKind`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1124` | Self: 0.2% (601.5ms) | Total: 3.9% (8.36s) | Samples: 475

**Called by:**
- `(anonymous)` (6560)

**Calls:**
- `node` (6085)

### `push`
`[native code]` | Self: 0.2% (569.6ms) | Total: 0.2% (569.6ms) | Samples: 446

**Called by:**
- `PreparedTokenSlice` (391)
- `materializeTokens` (32)
- `fitClosedContent` (8)
- `concat` (6)
- `fitClosedContent` (5)
- `visit` (3)
- `validateDocumentChange` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1170` | Self: 0.2% (561.8ms) | Total: 22.7% (48.22s) | Samples: 443

**Called by:**
- `filter` (37859)

**Calls:**
- `nodeText` (23237)
- `nodeText` (12454)
- `join` (1550)
- `nodeText` (160)
- `join` (15)

### `sameNodeKind`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts` | Self: 0.2% (543.7ms) | Total: 0.2% (543.7ms) | Samples: 426

**Called by:**
- `(anonymous)` (426)

### `values`
`[native code]` | Self: 0.2% (517.6ms) | Total: 0.2% (517.6ms) | Samples: 403

**Called by:**
- `bound values` (229)
- `deepFreeze` (153)
- `performIteration` (19)
- `collectProjectedRoots` (2)

### `performProxyObjectGet`
`[native code]` | Self: 0.2% (513.4ms) | Total: 4.5% (9.59s) | Samples: 406

**Called by:**
- `validateDeclarativeNodeProperties` (1203)
- `validateTextProperties` (1088)
- `contentAllows` (999)
- `canonicalizeDeclarativePropertyRecord` (803)
- `canonicalizeDeclarativePropertyRecord` (798)
- `readOwnerDeclaration` (781)
- `canonicalizeDeclarativePropertyRecord` (743)
- `(anonymous)` (175)
- `fitClosedNode` (139)
- `readOwnerDeclaration` (135)
- `validateDeclarativeNodeProperties` (123)
- `(anonymous)` (89)
- `getElementContent` (78)
- `canonicalizeDeclarativePropertyRecord` (75)
- `resolveCompiledSchemaProperty` (72)
- `visitDeclarative` (64)
- `getCompiledElement` (56)
- `validateDocumentChange` (41)
- `getInternalDocumentChangeEntries` (18)
- `performIteration` (13)
- `applyTrustedCanonical` (4)
- `DocumentChange` (3)
- `DocumentChange` (3)
- `getElementContentRoots` (3)
- `validateDeclarativeDocument` (3)
- `(anonymous)` (2)
- `indexedAfter` (2)
- `applyTrustedCanonical` (2)
- `mapPosition` (2)
- `(anonymous)` (2)
- `hasChangeListeners` (2)
- `getUpdateView` (2)
- `DocumentChange` (2)
- `get empty` (1)
- `indexedAfter` (1)
- `applyTrustedCanonical` (1)
- `constructCanonicalDocumentChange` (1)
- `hasContentRoots` (1)
- `mapPoint` (1)
- `hasChangeListeners` (1)
- `applyAnchorChange` (1)
- `getUpdateView` (1)
- `runEditorTransaction` (1)
- `get empty` (1)
- `assertNoMapConflicts` (1)

**Calls:**
- `get` (3067)
- `get` (3008)
- `handleProxyGetTrapResult` (875)
- `get` (101)
- `get` (21)
- `get` (16)
- `get` (13)
- `get` (6)
- `get` (5)
- `get` (3)
- `get` (3)
- `get` (3)
- `get` (3)
- `get` (3)
- `get` (2)
- `get` (1)
- `bind` (1)

### `getEditorJsonArrayItems`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:61` | Self: 0.2% (434.9ms) | Total: 1.4% (3.04s) | Samples: 341

**Called by:**
- `isEditorJsonValue` (2336)
- `snapshotSliceContent` (46)

**Calls:**
- `getOwnPropertyDescriptor` (2041)

### `WeakSet`
`[native code]` | Self: 0.1% (420.0ms) | Total: 0.1% (420.0ms) | Samples: 332

**Called by:**
- `isEditorJsonValue` (322)
- `snapshotEditorJsonValue` (9)
- `isEditorJsonValue` (1)

### `normalizeTokens`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:337` | Self: 0.1% (376.6ms) | Total: 0.1% (376.6ms) | Samples: 294

**Called by:**
- `PreparedTokenSlice` (294)

### `flatIntoArray`
`[native code]` | Self: 0.1% (374.8ms) | Total: 0.1% (374.8ms) | Samples: 288

**Called by:**
- `flatIntoArrayWithCallback` (288)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2609` | Self: 0.1% (374.3ms) | Total: 0.1% (374.3ms) | Samples: 289

**Called by:**
- `forEach` (289)

### `isDeepFrozenNode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3120` | Self: 0.1% (374.1ms) | Total: 1.9% (4.04s) | Samples: 296

**Called by:**
- `every` (3169)
- `(anonymous)` (4)

**Calls:**
- `isFrozen` (2877)

### `toSchemaValidationLocation`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:380` | Self: 0.1% (346.6ms) | Total: 0.3% (772.3ms) | Samples: 268

**Called by:**
- `validateDeclarativeNodeProperties` (412)
- `(anonymous)` (184)
- `get` (1)
- `(anonymous)` (1)

**Calls:**
- `copyDataProperties` (330)

### `getEditorJsonArrayItems`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:56` | Self: 0.1% (323.1ms) | Total: 0.1% (323.1ms) | Samples: 255

**Called by:**
- `isEditorJsonValue` (249)
- `snapshotSliceContent` (6)

### `slice`
`[native code]` | Self: 0.1% (305.6ms) | Total: 0.1% (305.6ms) | Samples: 240

**Called by:**
- `validateDeclarativeNodeProperties` (117)
- `(anonymous)` (94)
- `addOwnPath` (15)
- `reconcileChildrenStep` (11)
- `replaceCanonicalChildWindow` (1)
- `replaceCanonicalChildWindow` (1)
- `getProtectedInlineSpacerEntries` (1)

### `nodeAtPath`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:260` | Self: 0.1% (292.2ms) | Total: 0.1% (292.2ms) | Samples: 231

**Called by:**
- `node` (102)
- `addRange` (92)
- `mapChangedNodeKeys` (12)
- `collectRelocationCandidates` (11)
- `(anonymous)` (5)
- `classifyRootChangeWithRuntimeCandidates` (4)
- `advancePathStableSnapshotIndex` (2)
- `applyIndexed` (2)
- `mapChangedNodeKeys` (1)

### `jsonEqual`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:140` | Self: 0.1% (269.7ms) | Total: 0.1% (269.7ms) | Samples: 210

**Called by:**
- `every` (210)

### `getEditorJsonRecordEntries`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:95` | Self: 0.1% (267.2ms) | Total: 2.0% (4.26s) | Samples: 207

**Called by:**
- `isEditorJsonValue` (3308)
- `(anonymous)` (36)

**Calls:**
- `getOwnPropertyDescriptor` (3137)

### `canonicalizeDeclarativePropertyRecord`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1574` | Self: 0.1% (263.8ms) | Total: 0.1% (265.0ms) | Samples: 208

**Called by:**
- `validateDeclarativeNodeProperties` (141)
- `map` (36)
- `(anonymous)` (32)

**Calls:**
- `entries` (1)

### `set`
`[native code]` | Self: 0.1% (247.7ms) | Total: 0.1% (247.7ms) | Samples: 192

**Called by:**
- `mapChangedNodeKeys` (61)
- `PreparedTokenSlice` (56)
- `PreparedTokenSlice` (55)
- `getStructuralFingerprint` (9)
- `(anonymous)` (4)
- `mapSnapshotIndexThroughChange` (2)
- `withNodeUpdates` (1)
- `applyTrustedCanonical` (1)
- `applyAnchorChange` (1)
- `prepare` (1)
- `applyTrustedCanonical` (1)

### `validateTextProperties`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2460` | Self: 0.1% (239.6ms) | Total: 0.3% (813.1ms) | Samples: 187

**Called by:**
- `validateDeclarativeNodeProperties` (635)

**Calls:**
- `toCompiledTargetContext` (448)

### `jsonEqual`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:137` | Self: 0.1% (229.3ms) | Total: 0.1% (229.3ms) | Samples: 176

**Called by:**
- `every` (176)

### `hasIntrinsicConstructor`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:24` | Self: 0.1% (215.8ms) | Total: 0.1% (215.8ms) | Samples: 167

**Called by:**
- `isObjectPrototype` (133)
- `isArrayPrototype` (34)

### `next`
`[native code]` | Self: 0.1% (212.4ms) | Total: 1.4% (2.97s) | Samples: 169

**Called by:**
- `(anonymous)` (1528)
- `performIteration` (318)
- `canonicalizeDeclarativePropertyRecord` (145)
- `validateDeclarativeRootContent` (119)
- `(anonymous)` (114)
- `visitOwnerDeclarations` (81)
- `visit` (11)
- `canonicalizeDeclarativePropertyRecord` (4)
- `Map` (4)
- `canonicalizeInlineChildren` (4)
- `validateTextProperties` (3)
- `indexedAfter` (2)
- `(anonymous)` (1)
- `applyDocumentChangeValue` (1)
- `Set` (1)
- `validateDocumentChange` (1)

**Calls:**
- `arrayIteratorNextHelper` (2153)
- `generatorResume` (15)

### `nodeText`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1114` | Self: 0.0% (204.7ms) | Total: 0.0% (204.7ms) | Samples: 161

**Called by:**
- `(anonymous)` (160)
- `mapChangedNodeKeys` (1)

### `nodeProps`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:833` | Self: 0.0% (194.1ms) | Total: 0.3% (832.9ms) | Samples: 156

**Called by:**
- `encode` (214)
- `encode` (209)
- `(anonymous)` (145)
- `encode` (90)

**Calls:**
- `copyDataProperties` (502)

### `isText`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/text.ts:189` | Self: 0.0% (190.6ms) | Total: 0.0% (191.9ms) | Samples: 148

**Called by:**
- `isText` (148)
- `replaceCanonicalChildWindow` (1)

**Calls:**
- `isObject` (1)

### `PreparedTokenSlice`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:500` | Self: 0.0% (187.4ms) | Total: 0.0% (188.8ms) | Samples: 149

**Called by:**
- `fromTokens` (139)
- `concat` (10)
- `sliceMaterialized` (1)

**Calls:**
- `tokenLength` (1)

### `fromEntries`
`[native code]` | Self: 0.0% (172.6ms) | Total: 0.0% (172.6ms) | Samples: 137

**Called by:**
- `cloneJson` (118)
- `(anonymous)` (11)
- `cloneEditorJsonValue` (3)
- `cloneFrozen` (1)
- `createEditorUpdateDraftContext` (1)
- `decodeNodes` (1)
- `(anonymous)` (1)
- `createEditorUpdateDraftContext` (1)

### `stringify`
`[native code]` | Self: 0.0% (170.8ms) | Total: 0.0% (170.8ms) | Samples: 134

**Called by:**
- `classifyRootChangeWithRuntimeCandidates` (29)
- `classifyRootChangeWithRuntimeCandidates` (24)
- `addOwnPath` (21)
- `(anonymous)` (10)
- `collectRelocationCandidates` (9)
- `(anonymous)` (9)
- `(anonymous)` (8)
- `addParentIndex` (8)
- `measureCohort` (7)
- `measureCohort` (6)
- `applyIndexed` (2)
- `classifyRootChangeWithRuntimeCandidates` (1)

### `hasIntrinsicConstructor`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:20` | Self: 0.0% (158.1ms) | Total: 1.2% (2.64s) | Samples: 126

**Called by:**
- `isObjectPrototype` (1680)
- `isArrayPrototype` (396)

**Calls:**
- `getOwnPropertyDescriptor` (1950)

### `visitOwnerDeclarations`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:621` | Self: 0.0% (156.8ms) | Total: 0.0% (156.8ms) | Samples: 114

**Called by:**
- `(anonymous)` (114)

### `isEditorJsonValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:127` | Self: 0.0% (155.7ms) | Total: 4.8% (10.23s) | Samples: 119

**Called by:**
- `every` (5876)
- `assertJsonValue` (2133)

**Calls:**
- `getEditorJsonArrayItems` (3312)
- `getEditorJsonArrayItems` (2336)
- `getEditorJsonArrayItems` (1950)
- `getEditorJsonArrayItems` (249)
- `getEditorJsonArrayItems` (43)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:879` | Self: 0.0% (152.8ms) | Total: 0.0% (152.8ms) | Samples: 121

**Called by:**
- `forEach` (121)

### `getEditorJsonRecordEntries`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:101` | Self: 0.0% (146.8ms) | Total: 0.0% (146.8ms) | Samples: 113

**Called by:**
- `isEditorJsonValue` (108)
- `(anonymous)` (5)

### `canonicalizeDeclarativePropertyRecord`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1540` | Self: 0.0% (142.9ms) | Total: 0.0% (142.9ms) | Samples: 110

**Called by:**
- `validateDeclarativeNodeProperties` (92)
- `map` (10)
- `(anonymous)` (8)

### `sort`
`[native code]` | Self: 0.0% (142.1ms) | Total: 0.0% (148.3ms) | Samples: 112

**Called by:**
- `canonicalizeCompiledExclusiveTextProperties` (37)
- `getStructuralFingerprint` (33)
- `classifyDocumentRange` (20)
- `classifyDocumentRange` (9)
- `(anonymous)` (7)
- `validateDocumentChange` (3)
- `mapChangedNodeKeys` (2)
- `classifyDocumentRange` (2)
- `getChangeValue` (1)
- `canonicalizeCompiledExclusiveTextProperties` (1)
- `applyIndexed` (1)
- `mapChangedNodeKeys` (1)

**Calls:**
- `(anonymous)` (1)
- `(anonymous)` (1)
- `comparePaths` (1)
- `comparePathsDeepestFirst` (1)
- `(anonymous)` (1)

### `isDeepFrozenNode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3122` | Self: 0.0% (133.2ms) | Total: 1.0% (2.21s) | Samples: 103

**Called by:**
- `every` (1728)
- `(anonymous)` (3)

**Calls:**
- `isFrozen` (1628)

### `validateDeclarativeNodeProperties`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2590` | Self: 0.0% (125.4ms) | Total: 0.1% (285.0ms) | Samples: 98

**Called by:**
- `(anonymous)` (219)
- `validateSubtree` (2)

**Calls:**
- `performProxyObjectGet` (123)

### `canonicalizeCompiledExclusiveTextProperties`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:307` | Self: 0.0% (124.6ms) | Total: 0.4% (905.5ms) | Samples: 96

**Called by:**
- `validateTextProperties` (467)
- `canonicalizeDeclarativePropertyRecord` (236)

**Calls:**
- `map` (449)
- `entries` (158)

### `toCompiledTargetContext`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:693` | Self: 0.0% (124.5ms) | Total: 0.4% (904.2ms) | Samples: 96

**Called by:**
- `validateTextProperties` (448)
- `validateDeclarativeNodeProperties` (157)
- `(anonymous)` (63)
- `(anonymous)` (33)
- `get` (1)

**Calls:**
- `flatMap` (606)

### `fitClosedContent`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:547` | Self: 0.0% (122.3ms) | Total: 0.0% (122.3ms) | Samples: 96

**Called by:**
- `fitClosedNode` (85)
- `fit` (11)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2670` | Self: 0.0% (122.1ms) | Total: 2.9% (6.24s) | Samples: 94

**Called by:**
- `forEach` (4869)

**Calls:**
- `validateDeclarativeChildren` (4746)
- `validateDeclarativeChildren` (23)
- `validateDeclarativeChildren` (6)

### `performIteration`
`[native code]` | Self: 0.0% (118.8ms) | Total: 0.2% (565.1ms) | Samples: 94

**Called by:**
- `replaceIndexedChildren` (177)
- `decodeNodes` (95)
- `(anonymous)` (48)
- `mapChangedNodeKeys` (28)
- `(anonymous)` (27)
- `mapSnapshotIndexThroughChange` (7)
- `classifyRootChangeWithRuntimeCandidates` (6)
- `classifyRootChangeWithRuntimeCandidates` (5)
- `validateDocumentChange` (4)
- `createCommitChanged` (4)
- `applyTransactionSpecDocumentChangeStep` (4)
- `advancePathStableSnapshotIndex` (4)
- `constructCanonicalDocumentChange` (3)
- `(anonymous)` (3)
- `constructCanonicalDocumentChange` (3)
- `collectRelocationCandidates` (2)
- `pushUpdateTagContext` (2)
- `constructCanonicalDocumentChange` (2)
- `orderPaths` (2)
- `recordFacetDraftDocumentChange` (2)
- `createCommitChanged` (1)
- `compactMappingSegments` (1)
- `getPathByNodeKey` (1)
- `compose` (1)
- `mapSnapshotIndexThroughChange` (1)
- `compose` (1)
- `updateIndexedNodes` (1)
- `compose` (1)
- `notifyListeners` (1)
- `createEditorUpdateDraftContext` (1)
- `collectChangedElementPaths` (1)
- `recordFacetDraftDocumentChange` (1)
- `DocumentChange` (1)
- `mergeCommandRegistries` (1)
- `applyIndexed` (1)
- `finalize` (1)
- `compose` (1)
- `classify` (1)

**Calls:**
- `next` (318)
- `values` (19)
- `performProxyObjectGet` (13)
- `entries` (1)
- `arrayIteratorNextHelper` (1)

### `createEntry`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:321` | Self: 0.0% (113.4ms) | Total: 0.0% (113.4ms) | Samples: 88

**Called by:**
- `visit` (88)

### `has`
`[native code]` | Self: 0.0% (105.7ms) | Total: 0.0% (105.7ms) | Samples: 84

**Called by:**
- `bound has` (72)
- `mapChangedNodeKeys` (10)
- `mapChangedNodeKeys` (1)
- `mapChangedNodeKeys` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:747` | Self: 0.0% (104.5ms) | Total: 0.0% (104.5ms) | Samples: 80

**Called by:**
- `(anonymous)` (80)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:76` | Self: 0.0% (104.0ms) | Total: 0.0% (104.0ms) | Samples: 81

**Called by:**
- `flatIntoArrayWithCallback` (81)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:84` | Self: 0.0% (96.6ms) | Total: 0.0% (96.6ms) | Samples: 72

**Called by:**
- `map` (72)

### `canonicalizeCompiledExclusiveTextProperties`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:318` | Self: 0.0% (92.7ms) | Total: 0.0% (139.3ms) | Samples: 71

**Called by:**
- `validateTextProperties` (93)
- `canonicalizeDeclarativePropertyRecord` (15)

**Calls:**
- `sort` (37)

### `isEditorJsonValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:131` | Self: 0.0% (91.8ms) | Total: 12.0% (25.55s) | Samples: 72

**Called by:**
- `every` (11880)
- `assertJsonValue` (8172)

**Calls:**
- `every` (19980)

### `validateTextProperties`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2464` | Self: 0.0% (90.6ms) | Total: 0.7% (1.69s) | Samples: 69

**Called by:**
- `validateDeclarativeNodeProperties` (1327)

**Calls:**
- `performProxyObjectGet` (1088)
- `bound get` (106)
- `bound values` (61)
- `next` (3)

### `nodeText`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1121` | Self: 0.0% (87.1ms) | Total: 7.4% (15.87s) | Samples: 67

**Called by:**
- `(anonymous)` (12454)
- `mapChangedNodeKeys` (13)

**Calls:**
- `map` (12400)

### `bound get`
`[native code]` | Self: 0.0% (86.4ms) | Total: 0.2% (621.2ms) | Samples: 67

**Called by:**
- `canonicalizeDeclarativePropertyRecord` (111)
- `readOwnerDeclaration` (107)
- `validateTextProperties` (106)
- `validateDeclarativeNodeProperties` (93)
- `(anonymous)` (18)
- `fitClosedNode` (9)
- `getElementContent` (8)
- `visitDeclarative` (8)
- `resolveCompiledSchemaProperty` (8)
- `canonicalizeDeclarativePropertyRecord` (7)
- `getCompiledElement` (6)
- `validateDocumentChange` (4)

**Calls:**
- `get` (418)

### `some`
`[native code]` | Self: 0.0% (86.3ms) | Total: 0.0% (127.0ms) | Samples: 68

**Called by:**
- `(anonymous)` (30)
- `fit` (21)
- `constructCanonicalDocumentChange` (18)
- `(anonymous)` (7)
- `recordFacetCommit` (4)
- `classifyRootChangeWithRuntimeCandidates` (4)
- `decodeNodes` (4)
- `mapChangedNodeKeys` (3)
- `getOrphanedElementOwnedRoots` (2)
- `classifyRootChangeWithRuntimeCandidates` (2)
- `indexConstructedRoot` (2)
- `mapRelocatedPath` (1)
- `replaceCanonicalChildWindow` (1)
- `mapChangedNodeKeys` (1)

**Calls:**
- `(anonymous)` (9)
- `(anonymous)` (5)
- `(anonymous)` (4)
- `(anonymous)` (3)
- `hasInRoot` (2)
- `(anonymous)` (2)
- `(anonymous)` (2)
- `(anonymous)` (2)
- `(anonymous)` (1)
- `(anonymous)` (1)
- `hasInRoot` (1)

### `getEditorJsonRecordEntries`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:85` | Self: 0.0% (77.4ms) | Total: 1.6% (3.46s) | Samples: 61

**Called by:**
- `isEditorJsonValue` (2652)
- `(anonymous)` (86)

**Calls:**
- `isObjectPrototype` (2677)

### `canonicalizeDeclarativePropertyRecord`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1573` | Self: 0.0% (77.0ms) | Total: 0.7% (1.64s) | Samples: 62

**Called by:**
- `validateDeclarativeNodeProperties` (1042)
- `(anonymous)` (180)
- `map` (71)

**Calls:**
- `entries` (1231)

### `createTreeIndexChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:42` | Self: 0.0% (75.3ms) | Total: 0.0% (75.3ms) | Samples: 58

**Called by:**
- `replaceIndexedChildren` (49)
- `(anonymous)` (6)
- `fromPreparedNodes` (3)

### `canonicalizeDeclarativePropertyRecord`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1725` | Self: 0.0% (72.1ms) | Total: 0.2% (553.7ms) | Samples: 54

**Called by:**
- `validateDeclarativeNodeProperties` (347)
- `(anonymous)` (53)
- `map` (30)
- `(anonymous)` (1)

**Calls:**
- `every` (377)

### `fitClosedContent`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:604` | Self: 0.0% (70.9ms) | Total: 0.0% (78.8ms) | Samples: 56

**Called by:**
- `fit` (33)
- `fitClosedNode` (29)

**Calls:**
- `push` (5)
- `createWrappedContent` (1)

### `structuredClone`
`[native code]` | Self: 0.0% (68.8ms) | Total: 0.0% (68.8ms) | Samples: 55

**Called by:**
- `applyTransactionSpecDocumentChangeStep` (17)
- `setSelectionValue` (9)
- `getCurrentRootSnapshot` (8)
- `publishTransactionDraft` (6)
- `setSelectionValue` (4)
- `runEditorTransaction` (4)
- `createEditorUpdateDraftContext` (4)
- `runEditorTransaction` (2)
- `cloneFrozen` (1)

### `canonicalizeCompiledExclusiveTextProperties`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:342` | Self: 0.0% (67.8ms) | Total: 0.0% (68.9ms) | Samples: 53

**Called by:**
- `canonicalizeDeclarativePropertyRecord` (54)

**Calls:**
- `sort` (1)

### `getDescendant`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:502` | Self: 0.0% (65.1ms) | Total: 0.0% (65.1ms) | Samples: 50

**Called by:**
- `validateDocumentChange` (45)
- `validateDocumentChange` (5)

### `PreparedTokenSlice`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:501` | Self: 0.0% (65.0ms) | Total: 0.2% (563.0ms) | Samples: 51

**Called by:**
- `fromTokens` (434)
- `concat` (6)
- `sliceMaterialized` (2)

**Calls:**
- `push` (391)

### `structurallyEqual`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:246` | Self: 0.0% (64.1ms) | Total: 0.0% (64.1ms) | Samples: 51

**Called by:**
- `every` (51)

### `structurallyEqual`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:249` | Self: 0.0% (63.5ms) | Total: 0.0% (63.5ms) | Samples: 51

**Called by:**
- `every` (51)

### `canonicalizeDeclarativePropertyRecord`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1533` | Self: 0.0% (63.5ms) | Total: 0.0% (63.5ms) | Samples: 49

**Called by:**
- `(anonymous)` (17)
- `validateDeclarativeNodeProperties` (16)
- `map` (16)

### `validateDeclarativeNodeProperties`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2546` | Self: 0.0% (63.2ms) | Total: 0.9% (2.02s) | Samples: 51

**Called by:**
- `(anonymous)` (1520)
- `validateSubtree` (55)

**Calls:**
- `toSchemaValidationLocation` (564)
- `toSchemaValidationLocation` (412)
- `toSchemaValidationLocation` (316)
- `toSchemaValidationLocation` (209)
- `toSchemaValidationLocation` (23)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1728` | Self: 0.0% (62.9ms) | Total: 0.0% (62.9ms) | Samples: 50

**Called by:**
- `every` (50)

### `PreparedTokenSlice`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:504` | Self: 0.0% (62.5ms) | Total: 0.0% (132.2ms) | Samples: 50

**Called by:**
- `fromTokens` (105)

**Calls:**
- `set` (55)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1743` | Self: 0.0% (61.7ms) | Total: 0.0% (61.7ms) | Samples: 50

**Called by:**
- `map` (50)

### `canonicalizeDeclarativePropertyRecord`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1570` | Self: 0.0% (60.5ms) | Total: 0.0% (60.5ms) | Samples: 47

**Called by:**
- `validateDeclarativeNodeProperties` (33)
- `(anonymous)` (10)
- `map` (4)

### `canonicalizeDeclarativePropertyRecord`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1651` | Self: 0.0% (60.0ms) | Total: 0.5% (1.17s) | Samples: 48

**Called by:**
- `validateDeclarativeNodeProperties` (744)
- `(anonymous)` (99)
- `map` (87)

**Calls:**
- `performProxyObjectGet` (803)
- `bound values` (75)
- `next` (4)

### `getNodeKeyForNode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:63` | Self: 0.0% (59.6ms) | Total: 0.0% (59.6ms) | Samples: 42

**Called by:**
- `mapChangedNodeKeys` (32)
- `claim` (10)

### `getStructuralFingerprint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:121` | Self: 0.0% (58.5ms) | Total: 0.0% (119.3ms) | Samples: 45

**Called by:**
- `groupRelocationCandidates` (50)
- `getStructuralFingerprint` (42)

**Calls:**
- `sort` (33)
- `keys` (14)

### `assertJsonValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:309` | Self: 0.0% (57.6ms) | Total: 12.4% (26.35s) | Samples: 45

**Called by:**
- `assertSchemaJsonValue` (17141)
- `encodeNodes` (1596)
- `openToken` (988)
- `freezeRootClassification` (595)
- `validateSubtree` (212)
- `fitDocumentInput` (131)
- `assertSelectionSupported` (20)

**Calls:**
- `isEditorJsonValue` (9321)
- `isEditorJsonValue` (8172)
- `isEditorJsonValue` (2133)
- `isEditorJsonValue` (575)
- `isEditorJsonValue` (382)
- `isEditorJsonValue` (29)
- `isEditorJsonValue` (25)
- `isEditorJsonValue` (1)

### `toSchemaValidationLocation`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:371` | Self: 0.0% (56.6ms) | Total: 0.4% (860.2ms) | Samples: 46

**Called by:**
- `validateDeclarativeNodeProperties` (564)
- `(anonymous)` (102)

**Calls:**
- `flatMap` (620)

### `fitClosedContent`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:589` | Self: 0.0% (55.9ms) | Total: 0.0% (67.7ms) | Samples: 45

**Called by:**
- `fitClosedNode` (39)
- `fit` (14)

**Calls:**
- `push` (8)

### `getEditorJsonArrayItems`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:67` | Self: 0.0% (55.1ms) | Total: 0.0% (55.1ms) | Samples: 44

**Called by:**
- `isEditorJsonValue` (43)
- `snapshotSliceContent` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:254` | Self: 0.0% (54.7ms) | Total: 0.0% (54.7ms) | Samples: 44

**Called by:**
- `every` (44)

### `fitClosedContent`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:551` | Self: 0.0% (54.7ms) | Total: 0.0% (176.6ms) | Samples: 45

**Called by:**
- `fitClosedNode` (88)
- `fit` (52)

**Calls:**
- `findWrappingForContent` (95)

### `isEditorJsonValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:142` | Self: 0.0% (53.1ms) | Total: 0.5% (1.20s) | Samples: 41

**Called by:**
- `every` (925)
- `assertJsonValue` (25)

**Calls:**
- `delete` (909)

### `bound values`
`[native code]` | Self: 0.0% (52.5ms) | Total: 0.1% (347.4ms) | Samples: 41

**Called by:**
- `canonicalizeDeclarativePropertyRecord` (134)
- `canonicalizeDeclarativePropertyRecord` (75)
- `validateTextProperties` (61)

**Calls:**
- `values` (229)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/provenance.ts:49` | Self: 0.0% (51.4ms) | Total: 0.0% (51.4ms) | Samples: 41

**Called by:**
- `forEach` (41)

### `isEditorJsonValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:139` | Self: 0.0% (50.1ms) | Total: 11.9% (25.25s) | Samples: 38

**Called by:**
- `every` (10509)
- `assertJsonValue` (9321)

**Calls:**
- `every` (19792)

### `toSchemaValidationLocation`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:378` | Self: 0.0% (49.8ms) | Total: 0.0% (49.8ms) | Samples: 38

**Called by:**
- `validateDeclarativeNodeProperties` (23)
- `(anonymous)` (15)

### `contentAllows`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1247` | Self: 0.0% (47.9ms) | Total: 0.6% (1.41s) | Samples: 37

**Called by:**
- `validateDeclarativeRootContent` (1011)
- `findWrappingForContent` (59)
- `validationContentAllows` (35)
- `arrayIteratorNextHelper` (2)
- `(anonymous)` (1)

**Calls:**
- `performProxyObjectGet` (999)
- `bound has` (72)

### `createTreeIndexChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:41` | Self: 0.0% (47.7ms) | Total: 0.0% (47.7ms) | Samples: 33

**Called by:**
- `createTreeIndexNode` (20)
- `replaceIndexedChildren` (13)

### `classifyRootChangeWithRuntimeCandidates`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:152` | Self: 0.0% (46.0ms) | Total: 0.1% (289.1ms) | Samples: 36

**Called by:**
- `classify` (220)
- `apply` (7)
- `classifyRootChange` (2)

**Calls:**
- `freeze` (164)
- `stringify` (29)

### `isPreparedTargetPath`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:979` | Self: 0.0% (45.9ms) | Total: 0.0% (45.9ms) | Samples: 37

**Called by:**
- `mapChangedNodeKeys` (37)

### `toSchemaValidationLocation`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:379` | Self: 0.0% (45.6ms) | Total: 0.2% (582.7ms) | Samples: 37

**Called by:**
- `validateDeclarativeNodeProperties` (316)
- `(anonymous)` (143)

**Calls:**
- `copyDataProperties` (422)

### `materializeTokens`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:556` | Self: 0.0% (45.6ms) | Total: 0.0% (46.9ms) | Samples: 37

**Called by:**
- `getContentEndOffset` (38)

**Calls:**
- `tokenLength` (1)

### `toSchemaValidationLocation`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:377` | Self: 0.0% (45.5ms) | Total: 0.2% (544.5ms) | Samples: 37

**Called by:**
- `(anonymous)` (217)
- `validateDeclarativeNodeProperties` (209)

**Calls:**
- `cloneObject` (388)
- `cloneObject` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:151` | Self: 0.0% (45.4ms) | Total: 2.2% (4.78s) | Samples: 36

**Called by:**
- `decodeNodes` (3756)

**Calls:**
- `encodeNodes` (1699)
- `encodeNodes` (1037)
- `encodeNodes` (966)
- `encodeNodes` (8)
- `materializeTokens` (7)
- `encodeNodes` (2)
- `materializeTokens` (1)

### `jsonEqual`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:124` | Self: 0.0% (45.3ms) | Total: 0.0% (45.3ms) | Samples: 36

**Called by:**
- `every` (36)

### `groupRelocationCandidates`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:168` | Self: 0.0% (45.0ms) | Total: 0.0% (45.0ms) | Samples: 35

**Called by:**
- `deriveRootRelocations` (30)
- `deriveRootRelocations` (5)

### `keyAt`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1591` | Self: 0.0% (44.6ms) | Total: 0.0% (44.6ms) | Samples: 34

**Called by:**
- `mapChangedNodeKeys` (26)
- `advancePathStableSnapshotIndex` (6)
- `mapPoint` (1)
- `mapChangedNodeKeys` (1)

### `mapChangedNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1197` | Self: 0.0% (44.5ms) | Total: 0.0% (70.2ms) | Samples: 33

**Called by:**
- `mapSnapshotIndexThroughChange` (53)

**Calls:**
- `nodeAtPath` (18)
- `nodeAtPath` (2)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2611` | Self: 0.0% (43.8ms) | Total: 6.9% (14.65s) | Samples: 35

**Called by:**
- `forEach` (11464)

**Calls:**
- `validateDeclarativeNodeProperties` (4407)
- `validateDeclarativeNodeProperties` (2647)
- `validateDeclarativeNodeProperties` (1520)
- `validateDeclarativeNodeProperties` (1305)
- `validateDeclarativeNodeProperties` (748)
- `validateDeclarativeNodeProperties` (272)
- `validateDeclarativeNodeProperties` (219)
- `validateDeclarativeNodeProperties` (163)
- `validateDeclarativeNodeProperties` (124)
- `validateDeclarativeNodeProperties` (14)
- `validateDeclarativeNodeProperties` (9)
- `validateDeclarativeNodeProperties` (1)

### `mapSnapshotIndexThroughChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1503` | Self: 0.0% (42.2ms) | Total: 0.0% (42.2ms) | Samples: 33

**Called by:**
- `inheritDocumentChangeStepNodeKeys` (33)

### `openToken`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:300` | Self: 0.0% (41.8ms) | Total: 0.5% (1.13s) | Samples: 33

**Called by:**
- `encode` (384)
- `encode` (352)
- `decodeNodes` (160)

**Calls:**
- `cloneFrozen` (613)
- `freeze` (250)

### `visitOwnerDeclarations`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:617` | Self: 0.0% (41.3ms) | Total: 0.0% (72.9ms) | Samples: 32

**Called by:**
- `(anonymous)` (52)
- `(anonymous)` (1)
- `arrayIteratorNextHelper` (1)

**Calls:**
- `visitOwnerDeclarations` (21)
- `visitOwnerDeclarations` (1)

### `allocateNodeKey`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:33` | Self: 0.0% (41.3ms) | Total: 0.0% (41.3ms) | Samples: 32

**Called by:**
- `assignFreshNodeKey` (32)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:139` | Self: 0.0% (41.1ms) | Total: 0.0% (41.1ms) | Samples: 33

**Called by:**
- `every` (33)

### `findWrappingForContent`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:433` | Self: 0.0% (40.4ms) | Total: 0.0% (121.9ms) | Samples: 31

**Called by:**
- `fitClosedContent` (95)

**Calls:**
- `contentAllows` (59)
- `contentAllows` (5)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1808` | Self: 0.0% (40.2ms) | Total: 0.0% (40.2ms) | Samples: 32

**Called by:**
- `every` (32)

### `structurallyEqual`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:226` | Self: 0.0% (39.6ms) | Total: 0.0% (39.6ms) | Samples: 32

**Called by:**
- `every` (32)

### `fitClosedContent`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:595` | Self: 0.0% (39.4ms) | Total: 0.0% (39.4ms) | Samples: 31

**Called by:**
- `fitClosedNode` (26)
- `fit` (5)

### `get size`
`[native code]` | Self: 0.0% (38.7ms) | Total: 0.0% (38.7ms) | Samples: 30

**Called by:**
- `get` (30)

### `tokenLength`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:182` | Self: 0.0% (38.6ms) | Total: 0.0% (38.6ms) | Samples: 31

**Called by:**
- `PreparedTokenSlice` (22)
- `materializeTokens` (8)
- `materializeTokens` (1)

### `validateDeclarativeNodeProperties`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2568` | Self: 0.0% (38.4ms) | Total: 0.7% (1.67s) | Samples: 29

**Called by:**
- `(anonymous)` (1305)
- `validateSubtree` (20)

**Calls:**
- `performProxyObjectGet` (1203)
- `bound get` (93)

### `cloneJson`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:154` | Self: 0.0% (38.1ms) | Total: 0.5% (1.06s) | Samples: 30

**Called by:**
- `cloneFrozen` (664)
- `(anonymous)` (81)
- `decodeNodes` (73)
- `(anonymous)` (18)

**Calls:**
- `map` (478)
- `entries` (328)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:131` | Self: 0.0% (37.3ms) | Total: 0.0% (37.3ms) | Samples: 30

**Called by:**
- `every` (30)

### `canonicalizeDeclarativePropertyRecord`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1569` | Self: 0.0% (36.8ms) | Total: 0.1% (218.1ms) | Samples: 29

**Called by:**
- `validateDeclarativeNodeProperties` (150)
- `(anonymous)` (15)
- `map` (9)

**Calls:**
- `next` (145)

### `fitClosedNode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:475` | Self: 0.0% (36.8ms) | Total: 0.0% (36.8ms) | Samples: 29

**Called by:**
- `fitClosedContent` (16)
- `visit` (13)

### `validateTextProperties`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2499` | Self: 0.0% (36.4ms) | Total: 0.3% (776.4ms) | Samples: 28

**Called by:**
- `validateDeclarativeNodeProperties` (603)

**Calls:**
- `canonicalizeCompiledExclusiveTextProperties` (467)
- `canonicalizeCompiledExclusiveTextProperties` (93)
- `canonicalizeCompiledExclusiveTextProperties` (10)
- `canonicalizeCompiledExclusiveTextProperties` (5)

### `decodeNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:183` | Self: 0.0% (35.8ms) | Total: 0.0% (151.1ms) | Samples: 28

**Called by:**
- `(anonymous)` (118)

**Calls:**
- `cloneJson` (73)
- `cloneJson` (16)
- `fromEntries` (1)

### `at`
`[native code]` | Self: 0.0% (34.6ms) | Total: 0.0% (34.6ms) | Samples: 27

**Called by:**
- `addOwnPath` (12)
- `fitClosedContent` (6)
- `appendNode` (3)
- `advancePathStableSnapshotIndex` (1)
- `(anonymous)` (1)
- `compactMappingSegments` (1)
- `decodeNodes` (1)
- `(anonymous)` (1)
- `concat` (1)

### `getTextProperties`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2289` | Self: 0.0% (34.1ms) | Total: 0.1% (422.7ms) | Samples: 27

**Called by:**
- `validateDeclarativeNodeProperties` (274)
- `visitDeclarative` (51)

**Calls:**
- `copyDataProperties` (298)

### `canonicalizeDeclarativePropertyRecord`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1688` | Self: 0.0% (34.0ms) | Total: 0.5% (1.15s) | Samples: 27

**Called by:**
- `validateDeclarativeNodeProperties` (719)
- `map` (103)
- `(anonymous)` (82)

**Calls:**
- `performProxyObjectGet` (743)
- `bound values` (134)

### `canonicalizeDeclarativePropertyRecord`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1648` | Self: 0.0% (32.8ms) | Total: 0.5% (1.19s) | Samples: 25

**Called by:**
- `validateDeclarativeNodeProperties` (827)
- `(anonymous)` (107)

**Calls:**
- `performProxyObjectGet` (798)
- `bound get` (111)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:284` | Self: 0.0% (32.1ms) | Total: 0.0% (32.1ms) | Samples: 26

**Called by:**
- `every` (26)

### `classifyRootChangeWithRuntimeCandidates`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:166` | Self: 0.0% (31.8ms) | Total: 0.2% (473.7ms) | Samples: 25

**Called by:**
- `classify` (369)
- `apply` (5)
- `classifyRootChange` (2)

**Calls:**
- `freeze` (351)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1727` | Self: 0.0% (31.7ms) | Total: 0.0% (31.7ms) | Samples: 25

**Called by:**
- `every` (25)

### `Map`
`[native code]` | Self: 0.0% (31.6ms) | Total: 0.0% (41.0ms) | Samples: 24

**Called by:**
- `apply` (6)
- `getStateFieldIdentityMap` (5)
- `createInternalDocumentChange` (4)
- `applyTrustedCanonical` (3)
- `snapshotContentSlice` (1)
- `applyRoot` (1)
- `fit` (1)
- `constructCanonicalDocumentChange` (1)
- `classify` (1)
- `freezeMap` (1)
- `createInternalDocumentChange` (1)
- `constructCanonicalDocumentChange` (1)
- `createExtensionRegistry` (1)
- `between` (1)
- `applyAnchorChange` (1)
- `validateDeclarativeDocument` (1)
- `createEditorFacetDraft` (1)

**Calls:**
- `next` (4)
- `get` (3)

### `retainOrigin`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:447` | Self: 0.0% (31.5ms) | Total: 0.0% (49.2ms) | Samples: 24

**Called by:**
- `fitClosedContent` (25)
- `visit` (12)

**Calls:**
- `record` (13)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2623` | Self: 0.0% (30.3ms) | Total: 0.4% (888.4ms) | Samples: 24

**Called by:**
- `forEach` (695)

**Calls:**
- `toSchemaValidationLocation` (217)
- `toSchemaValidationLocation` (184)
- `toSchemaValidationLocation` (143)
- `toSchemaValidationLocation` (102)
- `toSchemaValidationLocation` (15)
- `toSchemaValidationLocation` (9)
- `toSchemaValidationLocation` (1)

### `visitOwnerDeclarations`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts` | Self: 0.0% (30.1ms) | Total: 0.0% (30.1ms) | Samples: 21

**Called by:**
- `visitOwnerDeclarations` (21)

### `WeakMap`
`[native code]` | Self: 0.0% (30.0ms) | Total: 0.0% (30.0ms) | Samples: 24

**Called by:**
- `getNodeKeys` (23)
- `(anonymous)` (1)

### `groupRelocationCandidates`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:167` | Self: 0.0% (29.5ms) | Total: 0.0% (29.5ms) | Samples: 23

**Called by:**
- `deriveRootRelocations` (21)
- `deriveRootRelocations` (2)

### `isElement`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/element.ts:121` | Self: 0.0% (29.5ms) | Total: 0.0% (29.5ms) | Samples: 23

**Called by:**
- `getDescendant` (7)
- `(anonymous)` (5)
- `validateDocumentChange` (3)
- `retainOrigin` (2)
- `canonicalizeDirectChildren` (2)
- `visitOwnerDeclarations` (1)
- `collectProjectedRoots` (1)
- `(anonymous)` (1)
- `filter` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:374` | Self: 0.0% (29.2ms) | Total: 0.0% (29.2ms) | Samples: 13

**Called by:**
- `flatIntoArrayWithCallback` (13)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1788` | Self: 0.0% (29.0ms) | Total: 0.0% (167.9ms) | Samples: 23

**Called by:**
- `map` (131)

**Calls:**
- `performProxyObjectGet` (89)
- `bound get` (18)
- `handleProxyGetTrapResult` (1)

### `openToken`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:297` | Self: 0.0% (28.9ms) | Total: 0.0% (28.9ms) | Samples: 22

**Called by:**
- `encode` (10)
- `encode` (10)
- `decodeNodes` (2)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1746` | Self: 0.0% (28.7ms) | Total: 0.0% (150.4ms) | Samples: 22

**Called by:**
- `map` (116)

**Calls:**
- `slice` (94)

### `get`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:262` | Self: 0.0% (28.6ms) | Total: 0.0% (28.6ms) | Samples: 18

**Called by:**
- `performProxyObjectGet` (16)
- `Set` (2)

### `validateDeclarativeChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2602` | Self: 0.0% (28.6ms) | Total: 0.0% (28.6ms) | Samples: 23

**Called by:**
- `(anonymous)` (23)

### `cache`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1476` | Self: 0.0% (28.3ms) | Total: 0.0% (114.6ms) | Samples: 22

**Called by:**
- `mapSnapshotIndexThroughChange` (89)

**Calls:**
- `freeze` (67)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:289` | Self: 0.0% (27.3ms) | Total: 0.0% (27.3ms) | Samples: 21

**Called by:**
- `every` (21)

### `rootCanContain`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1845` | Self: 0.0% (26.5ms) | Total: 0.0% (26.5ms) | Samples: 21

**Called by:**
- `every` (21)

### `replaceIndexedChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:303` | Self: 0.0% (26.4ms) | Total: 0.0% (26.4ms) | Samples: 21

**Called by:**
- `withText` (21)

### `createWrappedContent`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:352` | Self: 0.0% (26.1ms) | Total: 0.0% (26.1ms) | Samples: 20

**Called by:**
- `fitClosedContent` (20)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1799` | Self: 0.0% (26.1ms) | Total: 0.0% (27.3ms) | Samples: 20

**Called by:**
- `map` (21)

**Calls:**
- `canonicalizeDeclarativePropertyRecord` (1)

### `PreparedTokenSlice`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:502` | Self: 0.0% (26.0ms) | Total: 0.0% (63.4ms) | Samples: 20

**Called by:**
- `fromTokens` (46)
- `concat` (4)

**Calls:**
- `tokenLength` (22)
- `tokenLength` (8)

### `classifyRootChangeWithRuntimeCandidates`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:162` | Self: 0.0% (26.0ms) | Total: 0.0% (26.0ms) | Samples: 20

**Called by:**
- `classify` (20)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1380` | Self: 0.0% (26.0ms) | Total: 0.0% (26.0ms) | Samples: 20

**Called by:**
- `map` (20)

### `mixStructuralFingerprintString`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:90` | Self: 0.0% (25.5ms) | Total: 0.0% (26.6ms) | Samples: 20

**Called by:**
- `getStructuralFingerprint` (18)
- `getStructuralFingerprint` (2)
- `getStructuralFingerprint` (1)

**Calls:**
- `mixStructuralFingerprint` (1)

### `encode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:921` | Self: 0.0% (25.3ms) | Total: 0.6% (1.46s) | Samples: 20

**Called by:**
- `forEach` (1150)

**Calls:**
- `openToken` (384)
- `openToken` (363)
- `nodeProps` (214)
- `freeze` (127)
- `openToken` (26)
- `openToken` (10)
- `openToken` (5)
- `openToken` (1)

### `hasIntrinsicConstructor`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:23` | Self: 0.0% (24.9ms) | Total: 0.0% (24.9ms) | Samples: 19

**Called by:**
- `isArrayPrototype` (19)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:303` | Self: 0.0% (24.9ms) | Total: 0.0% (84.3ms) | Samples: 20

**Called by:**
- `map` (68)

**Calls:**
- `performIteration` (48)

### `isRecursivelyValidated`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3550` | Self: 0.0% (24.6ms) | Total: 0.0% (24.6ms) | Samples: 19

**Called by:**
- `validateDocumentChange` (15)
- `validateDocumentChange` (4)

### `fetch`
`[native code]` | Self: 0.0% (24.4ms) | Total: 0.0% (24.4ms) | Samples: 19

**Called by:**
- `requestFetch` (19)

### `createTreeIndexNode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:57` | Self: 0.0% (24.1ms) | Total: 0.0% (24.1ms) | Samples: 19

**Called by:**
- `map` (19)

### `addOwnPath`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3479` | Self: 0.0% (24.1ms) | Total: 0.0% (137.2ms) | Samples: 19

**Called by:**
- `(anonymous)` (107)

**Calls:**
- `freeze` (67)
- `stringify` (21)

### `claim`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1007` | Self: 0.0% (23.9ms) | Total: 0.0% (23.9ms) | Samples: 19

**Called by:**
- `mapChangedNodeKeys` (19)

### `validateDeclarativeNodeProperties`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2587` | Self: 0.0% (23.9ms) | Total: 0.4% (956.4ms) | Samples: 18

**Called by:**
- `(anonymous)` (748)
- `validateSubtree` (6)

**Calls:**
- `Set` (736)

### `resolveCompiledSchemaProperty`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts:3146` | Self: 0.0% (22.6ms) | Total: 0.0% (43.2ms) | Samples: 17

**Called by:**
- `(anonymous)` (33)

**Calls:**
- `flatMap` (16)

### `fitDirectContent`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:329` | Self: 0.0% (22.5ms) | Total: 0.0% (22.5ms) | Samples: 18

**Called by:**
- `fitClosedNode` (14)
- `fit` (4)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts` | Self: 0.0% (22.4ms) | Total: 0.0% (22.4ms) | Samples: 18

**Called by:**
- `every` (18)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3133` | Self: 0.0% (22.4ms) | Total: 0.0% (34.6ms) | Samples: 18

**Called by:**
- `every` (27)

**Calls:**
- `isDeepFrozenNode` (4)
- `isDeepFrozenNode` (3)
- `isDeepFrozenNode` (2)

### `normalizeTokens`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:334` | Self: 0.0% (21.9ms) | Total: 0.1% (237.2ms) | Samples: 17

**Called by:**
- `PreparedTokenSlice` (188)

**Calls:**
- `freeze` (170)
- `textToken` (1)

### `fitClosedNode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:457` | Self: 0.0% (21.8ms) | Total: 0.0% (25.5ms) | Samples: 18

**Called by:**
- `fitClosedContent` (16)
- `visit` (5)

**Calls:**
- `isText` (3)

### `cache`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1498` | Self: 0.0% (21.8ms) | Total: 0.0% (29.5ms) | Samples: 18

**Called by:**
- `mapSnapshotIndexThroughChange` (24)

**Calls:**
- `pathKey` (4)
- `pathKey` (2)

### `canonicalizeDirectChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:197` | Self: 0.0% (21.6ms) | Total: 0.0% (26.7ms) | Samples: 16

**Called by:**
- `canonicalizeNode` (19)
- `canonicalizeRootChildren` (1)

**Calls:**
- `isElement` (2)
- `isElement` (2)

### `PreparedTokenSlice`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:489` | Self: 0.0% (21.6ms) | Total: 1.1% (2.44s) | Samples: 17

**Called by:**
- `fromTokens` (1823)
- `concat` (87)
- `sliceMaterialized` (19)

**Calls:**
- `freeze` (1409)
- `normalizeTokens` (294)
- `normalizeTokens` (188)
- `normalizeTokens` (17)
- `normalizeTokens` (4)

### `bound has`
`[native code]` | Self: 0.0% (21.6ms) | Total: 0.0% (112.0ms) | Samples: 17

**Called by:**
- `contentAllows` (72)
- `(anonymous)` (17)

**Calls:**
- `has` (72)

### `canonicalizeCompiledExclusiveTextProperties`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:315` | Self: 0.0% (21.6ms) | Total: 0.0% (21.6ms) | Samples: 18

**Called by:**
- `validateTextProperties` (10)
- `canonicalizeDeclarativePropertyRecord` (8)

### `resolveCompiledSchemaProperty`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts:3145` | Self: 0.0% (21.5ms) | Total: 0.0% (123.8ms) | Samples: 18

**Called by:**
- `(anonymous)` (98)

**Calls:**
- `performProxyObjectGet` (72)
- `bound get` (8)

### `normalizeTokens`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:323` | Self: 0.0% (21.5ms) | Total: 0.0% (21.5ms) | Samples: 17

**Called by:**
- `PreparedTokenSlice` (17)

### `keys`
`[native code]` | Self: 0.0% (21.3ms) | Total: 0.0% (21.3ms) | Samples: 17

**Called by:**
- `getStructuralFingerprint` (14)
- `canonicalizeDeclarativePropertyRecord` (2)
- `(anonymous)` (1)

### `getStructuralFingerprint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:100` | Self: 0.0% (21.0ms) | Total: 0.0% (21.0ms) | Samples: 16

**Called by:**
- `getStructuralFingerprint` (11)
- `groupRelocationCandidates` (3)
- `getStructuralFingerprint` (2)

### `record`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/provenance.ts:65` | Self: 0.0% (21.0ms) | Total: 0.0% (21.0ms) | Samples: 16

**Called by:**
- `retainOrigin` (13)
- `(anonymous)` (3)

### `classifyRootChangeWithRuntimeCandidates`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:161` | Self: 0.0% (20.5ms) | Total: 0.0% (21.8ms) | Samples: 16

**Called by:**
- `classify` (16)
- `apply` (1)

**Calls:**
- `stringify` (1)

### `flatIntoArrayWithCallback`
`[native code]` | Self: 0.0% (20.5ms) | Total: 0.2% (616.2ms) | Samples: 16

**Called by:**
- `flatMap` (449)
- `mapSnapshotIndexThroughChange` (9)
- `classifyDocumentRange` (5)
- `(anonymous)` (3)
- `prepareScopedEditorExtensionPublication` (1)
- `prepareScopedEditorExtensionPublication` (1)

**Calls:**
- `flatIntoArray` (288)
- `(anonymous)` (81)
- `(anonymous)` (40)
- `(anonymous)` (13)
- `(anonymous)` (10)
- `(anonymous)` (7)
- `(anonymous)` (4)
- `(anonymous)` (3)
- `(anonymous)` (2)
- `(anonymous)` (1)
- `(anonymous)` (1)
- `(anonymous)` (1)
- `expandExtensionInput` (1)

### `toReversed`
`[native code]` | Self: 0.0% (20.4ms) | Total: 0.0% (20.4ms) | Samples: 16

**Called by:**
- `createWrappedContent` (16)

### `mapChangedNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1147` | Self: 0.0% (20.2ms) | Total: 0.0% (30.5ms) | Samples: 16

**Called by:**
- `mapSnapshotIndexThroughChange` (24)

**Calls:**
- `filter` (8)

### `validateSubtree`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3593` | Self: 0.0% (20.0ms) | Total: 0.1% (288.2ms) | Samples: 16

**Called by:**
- `validateDocumentChange` (182)
- `(anonymous)` (46)

**Calls:**
- `assertJsonValue` (212)

### `fitClosedContent`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:548` | Self: 0.0% (19.9ms) | Total: 0.3% (679.2ms) | Samples: 16

**Called by:**
- `fit` (491)
- `fitClosedNode` (42)

**Calls:**
- `fitClosedNode` (342)
- `fitClosedNode` (79)
- `retainOrigin` (26)
- `retainOrigin` (25)
- `fitClosedNode` (16)
- `fitClosedNode` (16)
- `fitClosedNode` (7)
- `fitClosedNode` (4)
- `retainOrigin` (2)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:96` | Self: 0.0% (19.6ms) | Total: 0.0% (19.6ms) | Samples: 15

**Called by:**
- `map` (15)

### `groupRelocationCandidates`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:175` | Self: 0.0% (19.5ms) | Total: 0.0% (19.5ms) | Samples: 15

**Called by:**
- `deriveRootRelocations` (13)
- `deriveRootRelocations` (2)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:154` | Self: 0.0% (19.4ms) | Total: 0.0% (162.3ms) | Samples: 15

**Called by:**
- `map` (128)

**Calls:**
- `cloneJson` (95)
- `cloneJson` (18)

### `join`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1109` | Self: 0.0% (19.1ms) | Total: 0.0% (19.1ms) | Samples: 15

**Called by:**
- `(anonymous)` (15)

### `getDescendant`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:503` | Self: 0.0% (19.1ms) | Total: 0.0% (19.1ms) | Samples: 15

**Called by:**
- `validateDocumentChange` (8)
- `validateDocumentChange` (7)

### `deepFreeze`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:169` | Self: 0.0% (19.0ms) | Total: 0.1% (332.2ms) | Samples: 15

**Called by:**
- `cloneFrozen` (194)
- `deepFreeze` (30)
- `commit` (14)
- `decodeNodes` (12)
- `decodeNodes` (8)
- `map` (2)

**Calls:**
- `values` (153)
- `freeze` (50)
- `deepFreeze` (41)
- `deepFreeze` (1)

### `mapChangedNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:967` | Self: 0.0% (19.0ms) | Total: 0.0% (19.0ms) | Samples: 15

**Called by:**
- `mapSnapshotIndexThroughChange` (15)

### `canonicalizeInlineChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:142` | Self: 0.0% (18.9ms) | Total: 0.0% (18.9ms) | Samples: 15

**Called by:**
- `canonicalizeNode` (13)
- `replaceCanonicalChildWindow` (2)

### `mapChangedNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:968` | Self: 0.0% (18.8ms) | Total: 0.0% (56.0ms) | Samples: 13

**Called by:**
- `mapSnapshotIndexThroughChange` (41)

**Calls:**
- `performIteration` (28)

### `decodeNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:237` | Self: 0.0% (18.7ms) | Total: 0.0% (51.9ms) | Samples: 14

**Called by:**
- `(anonymous)` (40)

**Calls:**
- `appendNode` (13)
- `appendNode` (12)
- `appendNode` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3494` | Self: 0.0% (18.7ms) | Total: 0.0% (33.6ms) | Samples: 15

**Called by:**
- `iterChangedRanges` (27)

**Calls:**
- `stringify` (8)
- `set` (4)

### `createEntry`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:317` | Self: 0.0% (18.6ms) | Total: 0.0% (18.6ms) | Samples: 15

**Called by:**
- `visit` (15)

### `validateDeclarativeNodeProperties`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2556` | Self: 0.0% (18.6ms) | Total: 0.0% (18.6ms) | Samples: 15

**Called by:**
- `(anonymous)` (14)
- `validateSubtree` (1)

### `fitClosedContent`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:609` | Self: 0.0% (18.6ms) | Total: 0.0% (18.6ms) | Samples: 14

**Called by:**
- `fitClosedNode` (14)

### `cache`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1478` | Self: 0.0% (18.5ms) | Total: 0.0% (32.4ms) | Samples: 15

**Called by:**
- `mapSnapshotIndexThroughChange` (26)

**Calls:**
- `pathKey` (7)
- `pathKey` (4)

### `decodeNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:178` | Self: 0.0% (18.0ms) | Total: 0.0% (18.0ms) | Samples: 14

**Called by:**
- `(anonymous)` (14)

### `mapChangedNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1137` | Self: 0.0% (18.0ms) | Total: 0.0% (102.1ms) | Samples: 14

**Called by:**
- `mapSnapshotIndexThroughChange` (75)

**Calls:**
- `getNodeKeyForNode` (32)
- `nodeAtPath` (27)
- `nodeAtPath` (1)
- `nodeAtPath` (1)

### `replaceIndexedChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:302` | Self: 0.0% (17.9ms) | Total: 0.1% (242.2ms) | Samples: 14

**Called by:**
- `withText` (191)

**Calls:**
- `performIteration` (177)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:743` | Self: 0.0% (17.9ms) | Total: 0.7% (1.69s) | Samples: 14

**Called by:**
- `(anonymous)` (1311)

**Calls:**
- `visitOwnerDeclarations` (1050)
- `visitOwnerDeclarations` (114)
- `visitOwnerDeclarations` (81)
- `visitOwnerDeclarations` (52)

### `validateDeclarativeNodeProperties`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2586` | Self: 0.0% (17.8ms) | Total: 0.1% (224.3ms) | Samples: 14

**Called by:**
- `(anonymous)` (163)
- `validateSubtree` (8)

**Calls:**
- `toCompiledTargetContext` (157)

### `encode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:938` | Self: 0.0% (17.7ms) | Total: 0.7% (1.63s) | Samples: 14

**Called by:**
- `forEach` (1292)

**Calls:**
- `openToken` (453)
- `openToken` (352)
- `nodeProps` (209)
- `freeze` (144)
- `openToken` (110)
- `openToken` (10)

### `validateDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3684` | Self: 0.0% (17.6ms) | Total: 0.0% (21.1ms) | Samples: 14

**Called by:**
- `(anonymous)` (17)

**Calls:**
- `toString` (3)

### `visitOwnerDeclarations`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:606` | Self: 0.0% (17.5ms) | Total: 0.6% (1.34s) | Samples: 14

**Called by:**
- `(anonymous)` (1050)

**Calls:**
- `readOwnerDeclaration` (901)
- `readOwnerDeclaration` (135)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1377` | Self: 0.0% (17.3ms) | Total: 0.0% (17.3ms) | Samples: 14

**Called by:**
- `map` (14)

### `createWrappedContent`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:370` | Self: 0.0% (17.2ms) | Total: 0.0% (17.2ms) | Samples: 14

**Called by:**
- `fitClosedContent` (14)

### `readOwnerDeclaration`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:433` | Self: 0.0% (17.0ms) | Total: 0.5% (1.15s) | Samples: 13

**Called by:**
- `visitOwnerDeclarations` (901)

**Calls:**
- `performProxyObjectGet` (781)
- `bound get` (107)

### `encode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:935` | Self: 0.0% (16.6ms) | Total: 0.1% (305.2ms) | Samples: 13

**Called by:**
- `forEach` (243)

**Calls:**
- `freeze` (223)
- `closeToken` (7)

### `get`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:223` | Self: 0.0% (16.6ms) | Total: 0.0% (16.6ms) | Samples: 13

**Called by:**
- `performProxyObjectGet` (13)

### `validateTextProperties`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2402` | Self: 0.0% (16.2ms) | Total: 0.0% (164.4ms) | Samples: 13

**Called by:**
- `validateDeclarativeNodeProperties` (126)

**Calls:**
- `entries` (113)

### `pathKey`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:104` | Self: 0.0% (16.1ms) | Total: 0.0% (16.1ms) | Samples: 13

**Called by:**
- `(anonymous)` (7)
- `mapChangedNodeKeys` (3)
- `addTouching` (2)
- `mapChangedNodeKeys` (1)

### `decodeNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:119` | Self: 0.0% (16.0ms) | Total: 0.0% (16.0ms) | Samples: 12

**Called by:**
- `(anonymous)` (12)

### `visit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:628` | Self: 0.0% (16.0ms) | Total: 0.0% (29.9ms) | Samples: 12

**Called by:**
- `fitClosedSliceInterior` (23)

**Calls:**
- `next` (11)

### `canonicalizeInlineChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:117` | Self: 0.0% (15.7ms) | Total: 0.0% (29.5ms) | Samples: 13

**Called by:**
- `canonicalizeNode` (24)

**Calls:**
- `filter` (11)

### `claim`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1020` | Self: 0.0% (15.4ms) | Total: 0.0% (15.4ms) | Samples: 12

**Called by:**
- `mapChangedNodeKeys` (12)

### `cache`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1497` | Self: 0.0% (15.4ms) | Total: 0.0% (15.4ms) | Samples: 11

**Called by:**
- `mapSnapshotIndexThroughChange` (11)

### `appendNode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:116` | Self: 0.0% (15.1ms) | Total: 0.0% (15.1ms) | Samples: 12

**Called by:**
- `decodeNodes` (12)

### `PreparedTokenSlice`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:479` | Self: 0.0% (15.0ms) | Total: 0.0% (15.0ms) | Samples: 12

**Called by:**
- `fromTokens` (12)

### `claim`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1019` | Self: 0.0% (15.0ms) | Total: 0.0% (15.0ms) | Samples: 11

**Called by:**
- `mapChangedNodeKeys` (11)

### `tokensEqual`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:188` | Self: 0.0% (15.0ms) | Total: 0.0% (15.0ms) | Samples: 12

**Called by:**
- `(anonymous)` (12)

### `closeToken`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:312` | Self: 0.0% (14.9ms) | Total: 0.0% (14.9ms) | Samples: 12

**Called by:**
- `encode` (7)
- `encode` (5)

### `getStructuralFingerprint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:139` | Self: 0.0% (14.7ms) | Total: 0.0% (26.4ms) | Samples: 11

**Called by:**
- `groupRelocationCandidates` (8)
- `getStructuralFingerprint` (6)
- `getStructuralFingerprint` (6)

**Calls:**
- `set` (9)

### `validateDeclarativeNodeProperties`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2558` | Self: 0.0% (14.3ms) | Total: 0.0% (161.0ms) | Samples: 11

**Called by:**
- `(anonymous)` (124)
- `validateSubtree` (4)

**Calls:**
- `slice` (117)

### `collectRelocationCandidates`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:207` | Self: 0.0% (14.1ms) | Total: 0.0% (14.1ms) | Samples: 12

**Called by:**
- `deriveRootRelocations` (11)
- `deriveRootRelocations` (1)

### `assignFreshNodeKey`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:175` | Self: 0.0% (14.0ms) | Total: 0.0% (14.0ms) | Samples: 11

**Called by:**
- `mapChangedNodeKeys` (11)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2647` | Self: 0.0% (14.0ms) | Total: 0.0% (167.0ms) | Samples: 11

**Called by:**
- `forEach` (125)

**Calls:**
- `next` (114)

### `validateSubtree`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3614` | Self: 0.0% (13.9ms) | Total: 0.0% (13.9ms) | Samples: 10

**Called by:**
- `validateDocumentChange` (10)

### `addParentIndex`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3476` | Self: 0.0% (13.6ms) | Total: 0.0% (13.6ms) | Samples: 11

**Called by:**
- `addOwnPath` (11)

### `concat`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:682` | Self: 0.0% (13.5ms) | Total: 0.0% (13.5ms) | Samples: 11

**Called by:**
- `addSection` (9)
- `applyIndexed` (2)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:142` | Self: 0.0% (13.5ms) | Total: 0.0% (13.5ms) | Samples: 10

**Called by:**
- `every` (10)

### `appendNode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:103` | Self: 0.0% (13.3ms) | Total: 0.0% (16.8ms) | Samples: 10

**Called by:**
- `decodeNodes` (13)

**Calls:**
- `at` (3)

### `validateDeclarativeChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2608` | Self: 0.0% (13.2ms) | Total: 11.3% (24.03s) | Samples: 10

**Called by:**
- `validateDeclarativeDocument` (14023)
- `(anonymous)` (4746)

**Calls:**
- `forEach` (18759)

### `mixStructuralFingerprintString`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts` | Self: 0.0% (13.1ms) | Total: 0.0% (13.1ms) | Samples: 10

**Called by:**
- `getStructuralFingerprint` (10)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:131` | Self: 0.0% (12.9ms) | Total: 0.0% (12.9ms) | Samples: 10

**Called by:**
- `every` (10)

### `openToken`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:301` | Self: 0.0% (12.8ms) | Total: 0.1% (233.7ms) | Samples: 10

**Called by:**
- `encode` (110)
- `decodeNodes` (47)
- `encode` (26)

**Calls:**
- `copyDataProperties` (173)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:49` | Self: 0.0% (12.5ms) | Total: 0.0% (12.5ms) | Samples: 10

**Called by:**
- `flatIntoArrayWithCallback` (10)

### `visitDeclarative`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2780` | Self: 0.0% (12.4ms) | Total: 0.0% (58.0ms) | Samples: 10

**Called by:**
- `forEach` (46)

**Calls:**
- `entries` (36)

### `decodeNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:159` | Self: 0.0% (12.2ms) | Total: 2.5% (5.33s) | Samples: 10

**Called by:**
- `(anonymous)` (4089)
- `(anonymous)` (96)

**Calls:**
- `(anonymous)` (3756)
- `(anonymous)` (412)
- `every` (5)
- `(anonymous)` (2)

### `validateDeclarativeNodeProperties`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2554` | Self: 0.0% (12.2ms) | Total: 1.6% (3.47s) | Samples: 10

**Called by:**
- `(anonymous)` (2647)
- `validateSubtree` (66)

**Calls:**
- `validateTextProperties` (1327)
- `validateTextProperties` (635)
- `validateTextProperties` (603)
- `validateTextProperties` (126)
- `validateTextProperties` (7)
- `validateTextProperties` (3)
- `validateTextProperties` (1)
- `validateTextProperties` (1)

### `canonicalizeDeclarativePropertyRecord`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1722` | Self: 0.0% (12.1ms) | Total: 0.0% (12.1ms) | Samples: 9

**Called by:**
- `validateDeclarativeNodeProperties` (8)
- `map` (1)

### `assertNode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts` | Self: 0.0% (11.8ms) | Total: 0.0% (11.8ms) | Samples: 9

**Called by:**
- `forEach` (9)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1740` | Self: 0.0% (11.7ms) | Total: 0.0% (11.7ms) | Samples: 9

**Called by:**
- `some` (9)

### `fitClosedNode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:460` | Self: 0.0% (11.7ms) | Total: 0.0% (199.3ms) | Samples: 9

**Called by:**
- `fitClosedContent` (79)
- `visit` (78)

**Calls:**
- `performProxyObjectGet` (139)
- `bound get` (9)

### `toSchemaValidationLocation`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` | Self: 0.0% (11.6ms) | Total: 0.0% (11.6ms) | Samples: 9

**Called by:**
- `(anonymous)` (9)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:329` | Self: 0.0% (11.5ms) | Total: 0.0% (11.5ms) | Samples: 9

**Called by:**
- `every` (9)

### `flat`
`[native code]` | Self: 0.0% (11.4ms) | Total: 0.0% (11.4ms) | Samples: 9

**Called by:**
- `classifyRootChangeWithRuntimeCandidates` (3)
- `addRange` (2)
- `classifyDocumentRange` (2)
- `(anonymous)` (1)
- `collectRelocationCandidates` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/provenance.ts:82` | Self: 0.0% (11.4ms) | Total: 0.0% (31.5ms) | Samples: 9

**Called by:**
- `(anonymous)` (24)

**Calls:**
- `join` (13)
- `pathKey` (2)

### `encode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:853` | Self: 0.0% (11.3ms) | Total: 0.0% (189.3ms) | Samples: 9

**Called by:**
- `forEach` (148)

**Calls:**
- `nodeProps` (90)
- `freeze` (49)

### `validateDeclarativeRootContent`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2855` | Self: 0.0% (11.2ms) | Total: 0.6% (1.30s) | Samples: 9

**Called by:**
- `validateDeclarativeDocument` (1022)
- `validateDeclarativeDocument` (1)

**Calls:**
- `contentAllows` (1011)
- `contentAllows` (3)

### `tokenLength`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts` | Self: 0.0% (11.2ms) | Total: 0.0% (11.2ms) | Samples: 9

**Called by:**
- `PreparedTokenSlice` (8)
- `PreparedTokenSlice` (1)

### `validationContentAllows`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1257` | Self: 0.0% (10.5ms) | Total: 0.0% (58.3ms) | Samples: 7

**Called by:**
- `validateContentIndexes` (28)
- `(anonymous)` (17)

**Calls:**
- `contentAllows` (35)
- `contentAllows` (3)

### `validateContentIndexes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3407` | Self: 0.0% (10.5ms) | Total: 0.0% (10.5ms) | Samples: 8

**Called by:**
- `validateDocumentChange` (7)
- `validateSubtree` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:155` | Self: 0.0% (10.4ms) | Total: 0.2% (532.5ms) | Samples: 4

**Called by:**
- `decodeNodes` (412)

**Calls:**
- `every` (408)

### `mapChangedNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1163` | Self: 0.0% (10.4ms) | Total: 49.3% (104.75s) | Samples: 8

**Called by:**
- `mapSnapshotIndexThroughChange` (82218)

**Calls:**
- `filter` (82210)

### `mapSnapshotIndexThroughChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1450` | Self: 0.0% (10.4ms) | Total: 0.0% (18.0ms) | Samples: 8

**Called by:**
- `inheritDocumentChangeStepNodeKeys` (14)

**Calls:**
- `pathKey` (4)
- `set` (2)

### `getStructuralFingerprint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:129` | Self: 0.0% (10.3ms) | Total: 0.1% (245.1ms) | Samples: 7

**Called by:**
- `groupRelocationCandidates` (156)
- `getStructuralFingerprint` (34)

**Calls:**
- `getStructuralFingerprint` (110)
- `freeze` (22)
- `getStructuralFingerprint` (18)
- `getStructuralFingerprint` (7)
- `getStructuralFingerprint` (6)
- `getStructuralFingerprint` (6)
- `getStructuralFingerprint` (3)
- `getStructuralFingerprint` (3)
- `getStructuralFingerprint` (2)
- `getStructuralFingerprint` (2)
- `getStructuralFingerprint` (1)
- `getStructuralFingerprint` (1)
- `getStructuralFingerprint` (1)
- `getStructuralFingerprint` (1)

### `decodeNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:130` | Self: 0.0% (10.3ms) | Total: 0.0% (15.2ms) | Samples: 8

**Called by:**
- `(anonymous)` (12)

**Calls:**
- `some` (4)

### `validateDeclarativeNodeProperties`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2582` | Self: 0.0% (10.2ms) | Total: 2.7% (5.75s) | Samples: 8

**Called by:**
- `(anonymous)` (4407)
- `validateSubtree` (102)

**Calls:**
- `canonicalizeDeclarativePropertyRecord` (1042)
- `canonicalizeDeclarativePropertyRecord` (827)
- `canonicalizeDeclarativePropertyRecord` (744)
- `canonicalizeDeclarativePropertyRecord` (719)
- `canonicalizeDeclarativePropertyRecord` (382)
- `canonicalizeDeclarativePropertyRecord` (347)
- `canonicalizeDeclarativePropertyRecord` (150)
- `canonicalizeDeclarativePropertyRecord` (141)
- `canonicalizeDeclarativePropertyRecord` (92)
- `canonicalizeDeclarativePropertyRecord` (33)
- `canonicalizeDeclarativePropertyRecord` (16)
- `canonicalizeDeclarativePropertyRecord` (8)

### `collectRelocationCandidates`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:205` | Self: 0.0% (10.1ms) | Total: 0.0% (10.1ms) | Samples: 8

**Called by:**
- `deriveRootRelocations` (8)

### `parseModule`
`[native code]` | Self: 0.0% (10.1ms) | Total: 0.0% (18.5ms) | Samples: 8

**Called by:**
- `async (anonymous)` (14)

**Calls:**
- `node:assert/strict` (2)
- `get ReadStream` (2)
- `node:fs` (1)
- `node:path` (1)

### `encodeNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:911` | Self: 0.0% (10.1ms) | Total: 0.0% (10.1ms) | Samples: 8

**Called by:**
- `(anonymous)` (8)

### `replaceIndexedChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:305` | Self: 0.0% (9.9ms) | Total: 0.0% (9.9ms) | Samples: 8

**Called by:**
- `withText` (8)

### `splice`
`[native code]` | Self: 0.0% (9.7ms) | Total: 0.0% (9.7ms) | Samples: 8

**Called by:**
- `(anonymous)` (7)
- `(anonymous)` (1)

### `mapChangedNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1136` | Self: 0.0% (9.7ms) | Total: 0.0% (9.7ms) | Samples: 6

**Called by:**
- `mapSnapshotIndexThroughChange` (6)

### `keyAt`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts` | Self: 0.0% (9.5ms) | Total: 0.0% (9.5ms) | Samples: 7

**Called by:**
- `mapChangedNodeKeys` (7)

### `materializeTokens`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:557` | Self: 0.0% (9.5ms) | Total: 0.0% (49.9ms) | Samples: 7

**Called by:**
- `getContentEndOffset` (39)

**Calls:**
- `push` (32)

### `fitClosedNode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:469` | Self: 0.0% (9.4ms) | Total: 0.3% (845.2ms) | Samples: 8

**Called by:**
- `fitClosedContent` (342)
- `visit` (321)

**Calls:**
- `freeze` (225)
- `fitClosedContent` (88)
- `fitClosedContent` (85)
- `fitClosedContent` (42)
- `fitClosedContent` (40)
- `fitClosedContent` (39)
- `fitDirectContent` (36)
- `fitClosedContent` (29)
- `fitClosedContent` (26)
- `fitClosedContent` (14)
- `fitDirectContent` (14)
- `fitClosedContent` (10)
- `fitDirectContent` (7)

### `textFor`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:57` | Self: 0.0% (9.4ms) | Total: 0.0% (20.0ms) | Samples: 7

**Called by:**
- `paragraph` (16)

**Calls:**
- `repeat` (6)
- `padStart` (3)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/provenance.ts:51` | Self: 0.0% (9.3ms) | Total: 0.0% (44.3ms) | Samples: 8

**Called by:**
- `forEach` (35)

**Calls:**
- `(anonymous)` (24)
- `(anonymous)` (3)

### `materializeTokens`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts` | Self: 0.0% (9.3ms) | Total: 0.0% (9.3ms) | Samples: 7

**Called by:**
- `(anonymous)` (7)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1795` | Self: 0.0% (9.2ms) | Total: 0.7% (1.49s) | Samples: 7

**Called by:**
- `map` (1169)

**Calls:**
- `canonicalizeDeclarativeChildren` (1140)
- `canonicalizeDeclarativeChildren` (18)
- `canonicalizeDeclarativeChildren` (4)

### `allContentAllowed`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:278` | Self: 0.0% (9.1ms) | Total: 0.0% (9.1ms) | Samples: 7

**Called by:**
- `fitDirectContent` (7)

### `PreparedTokenSlice`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:505` | Self: 0.0% (9.1ms) | Total: 0.7% (1.68s) | Samples: 7

**Called by:**
- `fromTokens` (1230)
- `concat` (80)
- `sliceMaterialized` (18)
- `text` (1)

**Calls:**
- `freeze` (1266)
- `set` (56)

### `addRange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:896` | Self: 0.0% (9.1ms) | Total: 0.0% (89.4ms) | Samples: 7

**Called by:**
- `(anonymous)` (69)

**Calls:**
- `freeze` (62)

### `getTransactionSpecContext`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:542` | Self: 0.0% (9.1ms) | Total: 0.0% (15.6ms) | Samples: 7

**Called by:**
- `getTransactionSnapshot` (4)
- `getChildren` (2)
- `getCurrentChildrenRoot` (2)
- `getEditorDocumentRoots` (1)
- `getEditorTransactionDepth` (1)
- `getCurrentSelection` (1)
- `decrementEditorTransactionDepth` (1)

**Calls:**
- `get` (5)

### `createWrappedContent`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:372` | Self: 0.0% (9.0ms) | Total: 0.0% (29.5ms) | Samples: 7

**Called by:**
- `fitClosedContent` (22)
- `fitClosedContent` (1)

**Calls:**
- `toReversed` (16)

### `validateTextProperties`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2505` | Self: 0.0% (9.0ms) | Total: 0.0% (9.0ms) | Samples: 7

**Called by:**
- `validateDeclarativeNodeProperties` (7)

### `canonicalizeDeclarativePropertyRecord`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1720` | Self: 0.0% (9.0ms) | Total: 0.1% (411.1ms) | Samples: 7

**Called by:**
- `map` (320)

**Calls:**
- `canonicalizeCompiledExclusiveTextProperties` (236)
- `canonicalizeCompiledExclusiveTextProperties` (54)
- `canonicalizeCompiledExclusiveTextProperties` (15)
- `canonicalizeCompiledExclusiveTextProperties` (8)

### `fitDirectContent`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:323` | Self: 0.0% (9.0ms) | Total: 0.0% (9.0ms) | Samples: 7

**Called by:**
- `fitClosedNode` (7)

### `mapChangedNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1195` | Self: 0.0% (8.9ms) | Total: 0.0% (10.3ms) | Samples: 7

**Called by:**
- `mapSnapshotIndexThroughChange` (8)

**Calls:**
- `has` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:57` | Self: 0.0% (8.9ms) | Total: 0.0% (8.9ms) | Samples: 7

**Called by:**
- `flatIntoArrayWithCallback` (7)

### `claim`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1021` | Self: 0.0% (8.9ms) | Total: 0.1% (273.9ms) | Samples: 7

**Called by:**
- `mapChangedNodeKeys` (216)

**Calls:**
- `freeze` (209)

### `getExtensionRegistry`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:597` | Self: 0.0% (8.8ms) | Total: 0.0% (16.9ms) | Samples: 7

**Called by:**
- `getRegistry` (10)
- `getStateView` (3)

**Calls:**
- `getExtensionRegistryStore` (3)
- `getExtensionRegistryStore` (2)
- `getExtensionRegistryStore` (1)

### `Proxy`
`[native code]` | Self: 0.0% (8.7ms) | Total: 0.0% (8.7ms) | Samples: 7

**Called by:**
- `freezeReadonlyMap` (6)
- `createEditorImplementation` (1)

### `snapshotEditorJsonValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:252` | Self: 0.0% (8.6ms) | Total: 0.0% (8.6ms) | Samples: 7

**Called by:**
- `(anonymous)` (7)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1762` | Self: 0.0% (8.6ms) | Total: 0.1% (248.1ms) | Samples: 6

**Called by:**
- `map` (198)

**Calls:**
- `performProxyObjectGet` (175)
- `bound has` (17)

### `getStructuralFingerprint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:112` | Self: 0.0% (8.6ms) | Total: 0.0% (8.6ms) | Samples: 7

**Called by:**
- `getStructuralFingerprint` (7)

### `canonicalizeInlineChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:99` | Self: 0.0% (8.6ms) | Total: 0.0% (8.6ms) | Samples: 7

**Called by:**
- `canonicalizeNode` (7)

### `isElement`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/element.ts:123` | Self: 0.0% (8.4ms) | Total: 0.0% (8.4ms) | Samples: 7

**Called by:**
- `canonicalizeDirectChildren` (2)
- `(anonymous)` (2)
- `retainOrigin` (1)
- `replaceCanonicalChildWindow` (1)
- `isInline` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:309` | Self: 0.0% (8.4ms) | Total: 0.0% (183.1ms) | Samples: 6

**Called by:**
- `map` (143)

**Calls:**
- `resolveCompiledSchemaProperty` (98)
- `resolveCompiledSchemaProperty` (33)
- `resolveCompiledSchemaProperty` (6)

### `encode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:926` | Self: 0.0% (8.4ms) | Total: 0.0% (77.4ms) | Samples: 7

**Called by:**
- `forEach` (61)

**Calls:**
- `freeze` (52)
- `textToken` (2)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:232` | Self: 0.0% (8.2ms) | Total: 0.0% (8.2ms) | Samples: 6

**Called by:**
- `every` (6)

### `getNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:53` | Self: 0.0% (8.2ms) | Total: 0.0% (8.2ms) | Samples: 6

**Called by:**
- `assignFreshNodeKey` (6)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:742` | Self: 0.0% (8.2ms) | Total: 0.9% (1.95s) | Samples: 7

**Called by:**
- `(anonymous)` (1536)

**Calls:**
- `next` (1528)
- `visitOwnerDeclarations` (1)

### `canonicalizeDeclarativePropertyRecord`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1649` | Self: 0.0% (8.1ms) | Total: 0.0% (112.4ms) | Samples: 6

**Called by:**
- `map` (88)

**Calls:**
- `performProxyObjectGet` (75)
- `bound get` (7)

### `getNodeKeyForNode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts` | Self: 0.0% (7.9ms) | Total: 0.0% (7.9ms) | Samples: 6

**Called by:**
- `mapChangedNodeKeys` (6)

### `mapChangedNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1153` | Self: 0.0% (7.9ms) | Total: 0.0% (13.4ms) | Samples: 6

**Called by:**
- `mapSnapshotIndexThroughChange` (10)

**Calls:**
- `some` (3)
- `has` (1)

### `isRecursivelyValidated`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3551` | Self: 0.0% (7.9ms) | Total: 0.0% (22.4ms) | Samples: 6

**Called by:**
- `validateDocumentChange` (15)
- `validateDocumentChange` (3)

**Calls:**
- `get` (12)

### `visit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:216` | Self: 0.0% (7.8ms) | Total: 0.0% (7.8ms) | Samples: 6

**Called by:**
- `nodeRangesTouching` (3)
- `visit` (3)

### `openToken`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:291` | Self: 0.0% (7.8ms) | Total: 0.5% (1.25s) | Samples: 6

**Called by:**
- `encode` (453)
- `encode` (363)
- `decodeNodes` (178)

**Calls:**
- `assertJsonValue` (988)

### `resolveCompiledSchemaProperty`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts:3143` | Self: 0.0% (7.7ms) | Total: 0.0% (7.7ms) | Samples: 6

**Called by:**
- `(anonymous)` (6)

### `decodeNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:232` | Self: 0.0% (7.6ms) | Total: 0.2% (568.7ms) | Samples: 6

**Called by:**
- `(anonymous)` (446)

**Calls:**
- `openToken` (178)
- `openToken` (160)
- `freeze` (52)
- `openToken` (47)
- `openToken` (2)
- `openToken` (1)

### `canonicalizeInlineChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:156` | Self: 0.0% (7.6ms) | Total: 0.0% (7.6ms) | Samples: 5

**Called by:**
- `canonicalizeNode` (4)
- `replaceCanonicalChildWindow` (1)

### `cloneJson`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:149` | Self: 0.0% (7.6ms) | Total: 0.0% (153.8ms) | Samples: 6

**Called by:**
- `(anonymous)` (95)
- `cloneFrozen` (23)
- `(anonymous)` (3)

**Calls:**
- `map` (115)

### `openToken`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:305` | Self: 0.0% (7.5ms) | Total: 0.0% (7.5ms) | Samples: 5

**Called by:**
- `encode` (5)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:101` | Self: 0.0% (7.5ms) | Total: 0.0% (16.6ms) | Samples: 6

**Called by:**
- `map` (9)
- `some` (4)

**Calls:**
- `some` (7)

### `validateDeclarativeChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2606` | Self: 0.0% (7.5ms) | Total: 0.0% (7.5ms) | Samples: 6

**Called by:**
- `(anonymous)` (6)

### `hasInlineContent`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:89` | Self: 0.0% (7.4ms) | Total: 0.0% (7.4ms) | Samples: 6

**Called by:**
- `canonicalizeDirectChildren` (6)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:118` | Self: 0.0% (7.4ms) | Total: 0.0% (7.4ms) | Samples: 6

**Called by:**
- `filter` (6)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1784` | Self: 0.0% (7.4ms) | Total: 0.0% (49.8ms) | Samples: 6

**Called by:**
- `map` (39)

**Calls:**
- `toCompiledTargetContext` (33)

### `deepFreeze`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/clone.ts:10` | Self: 0.0% (7.4ms) | Total: 0.0% (7.4ms) | Samples: 6

**Called by:**
- `deepFreeze` (5)
- `createEditorCommit` (1)

### `validateSubtree`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3588` | Self: 0.0% (7.4ms) | Total: 0.0% (99.3ms) | Samples: 6

**Called by:**
- `validateDocumentChange` (68)
- `(anonymous)` (9)

**Calls:**
- `isFrozen` (71)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3618` | Self: 0.0% (7.3ms) | Total: 0.1% (215.8ms) | Samples: 6

**Called by:**
- `forEach` (171)

**Calls:**
- `validateSubtree` (110)
- `validateSubtree` (46)
- `validateSubtree` (9)

### `visitDeclarative`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2732` | Self: 0.0% (7.3ms) | Total: 0.0% (7.3ms) | Samples: 6

**Called by:**
- `forEach` (6)

### `get`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts:599` | Self: 0.0% (7.3ms) | Total: 0.0% (7.3ms) | Samples: 6

**Called by:**
- `performProxyObjectGet` (6)

### `addParentIndex`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3475` | Self: 0.0% (7.3ms) | Total: 0.0% (7.3ms) | Samples: 6

**Called by:**
- `addOwnPath` (6)

### `visit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:218` | Self: 0.0% (7.2ms) | Total: 0.0% (76.2ms) | Samples: 6

**Called by:**
- `nodeRangesTouching` (60)

**Calls:**
- `visit` (49)
- `visit` (3)
- `visit` (1)
- `visit` (1)

### `classifyRootChangeWithRuntimeCandidates`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:151` | Self: 0.0% (7.1ms) | Total: 0.0% (7.1ms) | Samples: 5

**Called by:**
- `classify` (3)
- `apply` (2)

### `encode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:868` | Self: 0.0% (7.0ms) | Total: 0.0% (64.8ms) | Samples: 5

**Called by:**
- `forEach` (50)

**Calls:**
- `freeze` (40)
- `closeToken` (5)

### `repeat`
`[native code]` | Self: 0.0% (6.9ms) | Total: 0.0% (6.9ms) | Samples: 6

**Called by:**
- `textFor` (6)

### `fitClosedNode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:471` | Self: 0.0% (6.8ms) | Total: 0.0% (6.8ms) | Samples: 6

**Called by:**
- `fitClosedContent` (4)
- `visit` (2)

### `mapChangedNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1148` | Self: 0.0% (6.6ms) | Total: 0.0% (54.0ms) | Samples: 5

**Called by:**
- `mapSnapshotIndexThroughChange` (41)

**Calls:**
- `keyAt` (26)
- `keyAt` (7)
- `keyAt` (3)

### `mapChangedNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:970` | Self: 0.0% (6.6ms) | Total: 0.0% (129.0ms) | Samples: 5

**Called by:**
- `mapSnapshotIndexThroughChange` (100)

**Calls:**
- `nodeAtPath` (68)
- `nodeAtPath` (12)
- `nodeAtPath` (12)
- `nodeAtPath` (3)

### `canonicalizeCompiledExclusiveTextProperties`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:316` | Self: 0.0% (6.6ms) | Total: 0.0% (6.6ms) | Samples: 5

**Called by:**
- `validateTextProperties` (5)

### `validateDeclarativeNodeProperties`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2549` | Self: 0.0% (6.4ms) | Total: 0.0% (11.7ms) | Samples: 5

**Called by:**
- `(anonymous)` (9)

**Calls:**
- `getValidationNodeType` (4)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:485` | Self: 0.0% (6.4ms) | Total: 0.0% (6.4ms) | Samples: 5

**Called by:**
- `every` (5)

### `replaceIndexedChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:306` | Self: 0.0% (6.3ms) | Total: 0.0% (6.3ms) | Samples: 5

**Called by:**
- `withText` (5)

### `assertNode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:888` | Self: 0.0% (6.3ms) | Total: 0.0% (6.3ms) | Samples: 4

**Called by:**
- `forEach` (3)
- `encode` (1)

### `get`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:210` | Self: 0.0% (6.2ms) | Total: 0.0% (6.2ms) | Samples: 5

**Called by:**
- `Map` (3)
- `performProxyObjectGet` (2)

### `addRange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:898` | Self: 0.0% (6.2ms) | Total: 0.0% (6.2ms) | Samples: 5

**Called by:**
- `(anonymous)` (5)

### `get`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts:626` | Self: 0.0% (6.2ms) | Total: 0.0% (6.2ms) | Samples: 5

**Called by:**
- `performProxyObjectGet` (5)

### `padStart`
`[native code]` | Self: 0.0% (6.2ms) | Total: 0.0% (6.2ms) | Samples: 5

**Called by:**
- `textFor` (3)
- `(anonymous)` (2)

### `textToken`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:318` | Self: 0.0% (6.2ms) | Total: 0.0% (6.2ms) | Samples: 5

**Called by:**
- `encode` (2)
- `encode` (2)
- `normalizeTokens` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1126` | Self: 0.0% (6.1ms) | Total: 0.0% (6.1ms) | Samples: 5

**Called by:**
- `some` (5)

### `deepFreeze`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/clone.ts:11` | Self: 0.0% (6.1ms) | Total: 0.0% (47.0ms) | Samples: 5

**Called by:**
- `deepFreeze` (17)
- `getCurrentRootSnapshot` (10)
- `createEditorCommit` (6)
- `createEditorCommit` (4)
- `getSelectionOnlySnapshot` (1)

**Calls:**
- `deepFreeze` (17)
- `deepFreeze` (10)
- `deepFreeze` (5)
- `deepFreeze` (1)

### `fitClosedContent`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:578` | Self: 0.0% (6.1ms) | Total: 0.0% (13.9ms) | Samples: 5

**Called by:**
- `fitClosedNode` (10)
- `fit` (1)

**Calls:**
- `at` (6)

### `getDeclarativeSchema`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:550` | Self: 0.0% (6.0ms) | Total: 0.0% (19.0ms) | Samples: 5

**Called by:**
- `getElementContent` (4)
- `getCompiledElement` (3)
- `validateTextProperties` (3)
- `getValidationAuthority` (2)
- `getRootContent` (1)
- `hasContentRoots` (1)
- `indexConstructedRoot` (1)

**Calls:**
- `getRegistry` (10)

### `generatorResume`
`[native code]` | Self: 0.0% (5.9ms) | Total: 0.0% (40.2ms) | Samples: 5

**Called by:**
- `next` (15)
- `indexedAfter` (5)
- `apply` (4)
- `inheritDocumentChangeStepNodeKeys` (3)
- `applyDocumentChangeValue` (2)
- `prepare` (1)
- `rootedQueryGenerator` (1)
- `above` (1)

**Calls:**
- `getInternalDocumentChangeEntries` (24)
- `getInternalDocumentChangeEntries` (1)
- `levels` (1)
- `rootedQueryGenerator` (1)

### `encode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:915` | Self: 0.0% (5.9ms) | Total: 0.0% (78.4ms) | Samples: 5

**Called by:**
- `forEach` (61)

**Calls:**
- `assertNode` (55)
- `assertNode` (1)

### `hasOnlyKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:47` | Self: 0.0% (5.8ms) | Total: 0.0% (14.9ms) | Samples: 5

**Called by:**
- `isNode` (5)
- `isStrictPoint` (4)
- `isText` (3)

**Calls:**
- `every` (7)

### `concat`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:683` | Self: 0.0% (5.7ms) | Total: 0.0% (6.9ms) | Samples: 5

**Called by:**
- `addSection` (5)
- `applyIndexed` (1)

**Calls:**
- `at` (1)

### `encode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:856` | Self: 0.0% (5.7ms) | Total: 0.0% (5.7ms) | Samples: 5

**Called by:**
- `forEach` (5)

### `decodeNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:122` | Self: 0.0% (5.7ms) | Total: 0.0% (5.7ms) | Samples: 5

**Called by:**
- `(anonymous)` (5)

### `getNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:52` | Self: 0.0% (5.6ms) | Total: 0.0% (34.5ms) | Samples: 4

**Called by:**
- `assignFreshNodeKey` (22)
- `setNodeKey` (5)

**Calls:**
- `WeakMap` (23)

### `addRange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:889` | Self: 0.0% (5.4ms) | Total: 0.0% (134.8ms) | Samples: 4

**Called by:**
- `(anonymous)` (108)

**Calls:**
- `nodeAtPath` (92)
- `nodeAtPath` (11)
- `nodeAtPath` (1)

### `setNodeKey`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:167` | Self: 0.0% (5.4ms) | Total: 0.0% (5.4ms) | Samples: 4

**Called by:**
- `advancePathStableSnapshotIndex` (4)

### `indexedAfter`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:200` | Self: 0.0% (5.3ms) | Total: 0.0% (6.4ms) | Samples: 4

**Called by:**
- `reconcileExclusiveElementOwnedRoots` (5)

**Calls:**
- `performProxyObjectGet` (1)

### `defineSemanticUpdateMethod`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/semantic-update-method.ts:24` | Self: 0.0% (5.3ms) | Total: 0.0% (5.3ms) | Samples: 4

**Called by:**
- `getUpdateView` (1)
- `getUpdateView` (1)
- `getUpdateView` (1)
- `getUpdateView` (1)

### `canonicalizeNode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:243` | Self: 0.0% (5.3ms) | Total: 0.0% (5.3ms) | Samples: 4

**Called by:**
- `map` (4)

### `claim`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1009` | Self: 0.0% (5.3ms) | Total: 0.0% (5.3ms) | Samples: 4

**Called by:**
- `mapChangedNodeKeys` (4)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:184` | Self: 0.0% (5.2ms) | Total: 0.0% (5.2ms) | Samples: 4

**Called by:**
- `every` (4)

### `setNodeKey`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:161` | Self: 0.0% (5.2ms) | Total: 0.0% (8.0ms) | Samples: 4

**Called by:**
- `advancePathStableSnapshotIndex` (6)

**Calls:**
- `getLiveNodeKeyPrefix` (2)

### `getLiveNodeKeyPrefix`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:28` | Self: 0.0% (5.2ms) | Total: 0.0% (5.2ms) | Samples: 4

**Called by:**
- `advanceNextNodeKey` (2)
- `setNodeKey` (2)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:109` | Self: 0.0% (5.2ms) | Total: 0.0% (19.2ms) | Samples: 4

**Called by:**
- `map` (15)

**Calls:**
- `fromEntries` (11)

### `addSection`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:593` | Self: 0.0% (5.2ms) | Total: 0.0% (5.2ms) | Samples: 4

**Called by:**
- `composeSections` (3)
- `composeSections` (1)

### `normalizeTokens`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:339` | Self: 0.0% (5.1ms) | Total: 0.0% (5.1ms) | Samples: 4

**Called by:**
- `PreparedTokenSlice` (4)

### `getInternalDocumentChangeEntries`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:538` | Self: 0.0% (5.1ms) | Total: 0.0% (30.4ms) | Samples: 4

**Called by:**
- `generatorResume` (24)

**Calls:**
- `performProxyObjectGet` (18)
- `bound entries` (2)

### `getUpdateView`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4862` | Self: 0.0% (5.1ms) | Total: 0.0% (5.1ms) | Samples: 4

**Called by:**
- `(anonymous)` (4)

### `mapPos`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2828` | Self: 0.0% (5.1ms) | Total: 0.0% (5.1ms) | Samples: 4

**Called by:**
- `resolveMappedPoint` (3)
- `mapPoint` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:100` | Self: 0.0% (5.1ms) | Total: 0.0% (42.9ms) | Samples: 4

**Called by:**
- `map` (32)
- `some` (2)

**Calls:**
- `some` (30)

### `mixStructuralFingerprint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts` | Self: 0.0% (5.1ms) | Total: 0.0% (5.1ms) | Samples: 4

**Called by:**
- `getStructuralFingerprint` (2)
- `getStructuralFingerprint` (2)

### `moduleDeclarationInstantiation`
`[native code]` | Self: 0.0% (5.0ms) | Total: 0.0% (5.0ms) | Samples: 3

**Called by:**
- `link` (3)

### `canonicalizeDeclarativeChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1808` | Self: 0.0% (5.0ms) | Total: 0.0% (55.5ms) | Samples: 4

**Called by:**
- `(anonymous)` (18)
- `constructCanonicalDocumentChange` (15)
- `constructCanonicalDocumentChange` (11)

**Calls:**
- `every` (40)

### `equalValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:128` | Self: 0.0% (5.0ms) | Total: 0.0% (5.0ms) | Samples: 4

**Called by:**
- `every` (2)
- `setSelectionValue` (2)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts` | Self: 0.0% (5.0ms) | Total: 0.0% (5.0ms) | Samples: 4

**Called by:**
- `withExtensionPublicationRollback` (1)
- `filter` (1)
- `runEditorTransaction` (1)
- `runEditorTransaction` (1)

### `indexRecursivePath`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3568` | Self: 0.0% (5.0ms) | Total: 0.0% (5.0ms) | Samples: 4

**Called by:**
- `validateDocumentChange` (4)

### `find`
`[native code]` | Self: 0.0% (5.0ms) | Total: 0.0% (8.7ms) | Samples: 4

**Called by:**
- `getChangeValue` (4)
- `(anonymous)` (2)
- `(anonymous)` (1)

**Calls:**
- `(anonymous)` (3)

### `getUpdateView`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4621` | Self: 0.0% (4.9ms) | Total: 0.0% (4.9ms) | Samples: 4

**Called by:**
- `(anonymous)` (4)

### `entry`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:899` | Self: 0.0% (4.9ms) | Total: 0.0% (4.9ms) | Samples: 4

**Called by:**
- `nodeRange` (3)
- `positionAt` (1)

### `nodeRange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:595` | Self: 0.0% (4.9ms) | Total: 0.0% (10.1ms) | Samples: 4

**Called by:**
- `mapPoint` (3)
- `(anonymous)` (3)
- `mapPathForward` (2)

**Calls:**
- `entry` (3)
- `entry` (1)

### `addParentIndex`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3469` | Self: 0.0% (4.9ms) | Total: 0.0% (4.9ms) | Samples: 4

**Called by:**
- `addOwnPath` (4)

### `iterChangedRanges`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2790` | Self: 0.0% (4.9ms) | Total: 0.0% (4.9ms) | Samples: 4

**Called by:**
- `mapPoint` (3)
- `(anonymous)` (1)

### `canonicalizeDeclarativeChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` | Self: 0.0% (4.8ms) | Total: 0.0% (4.8ms) | Samples: 4

**Called by:**
- `(anonymous)` (4)

### `iterChangedRanges`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2812` | Self: 0.0% (4.8ms) | Total: 0.2% (612.1ms) | Samples: 4

**Called by:**
- `validateDocumentChange` (245)
- `collectChangedElementPaths` (207)
- `(anonymous)` (23)
- `mapChangedNodeKeys` (5)
- `applyInternal` (1)
- `mapPoint` (1)

**Calls:**
- `(anonymous)` (207)
- `(anonymous)` (204)
- `(anonymous)` (27)
- `(anonymous)` (14)
- `(anonymous)` (5)
- `(anonymous)` (3)
- `(anonymous)` (3)
- `(anonymous)` (3)
- `(anonymous)` (3)
- `(anonymous)` (2)
- `(anonymous)` (2)
- `(anonymous)` (2)
- `(anonymous)` (1)
- `(anonymous)` (1)
- `(anonymous)` (1)

### `isEditorJsonValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:119` | Self: 0.0% (4.8ms) | Total: 0.0% (4.8ms) | Samples: 4

**Called by:**
- `every` (4)

### `encodeNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:909` | Self: 0.0% (4.7ms) | Total: 0.9% (2.04s) | Samples: 4

**Called by:**
- `(anonymous)` (966)
- `fromNodes` (405)
- `DocumentIndex` (197)
- `tokens` (31)
- `get tokens` (1)

**Calls:**
- `assertJsonValue` (1596)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:336` | Self: 0.0% (4.7ms) | Total: 0.2% (459.6ms) | Samples: 4

**Called by:**
- `withDecodedSplicedNodes` (319)
- `withSplicedNodes` (43)

**Calls:**
- `map` (358)

### `getDescendant`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:499` | Self: 0.0% (4.7ms) | Total: 0.0% (4.7ms) | Samples: 4

**Called by:**
- `validateDocumentChange` (4)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:284` | Self: 0.0% (4.7ms) | Total: 0.0% (4.7ms) | Samples: 4

**Called by:**
- `every` (4)

### `fitClosedContent`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:596` | Self: 0.0% (4.7ms) | Total: 0.0% (77.4ms) | Samples: 4

**Called by:**
- `fitClosedNode` (40)
- `fit` (21)

**Calls:**
- `createWrappedContent` (22)
- `createWrappedContent` (20)
- `createWrappedContent` (14)
- `createWrappedContent` (1)

### `get`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:244` | Self: 0.0% (4.6ms) | Total: 0.0% (4.6ms) | Samples: 4

**Called by:**
- `performProxyObjectGet` (3)
- `Set` (1)

### `validateDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3576` | Self: 0.0% (4.5ms) | Total: 0.0% (13.9ms) | Samples: 3

**Called by:**
- `(anonymous)` (10)

**Calls:**
- `performIteration` (4)
- `sort` (3)

### `assertNode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:886` | Self: 0.0% (4.3ms) | Total: 0.0% (4.3ms) | Samples: 4

**Called by:**
- `decodeNodes` (4)

### `positionWasReplaced`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:559` | Self: 0.0% (4.3ms) | Total: 0.0% (4.3ms) | Samples: 3

**Called by:**
- `mapPathForward` (3)

### `mapChangedNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1198` | Self: 0.0% (4.3ms) | Total: 0.0% (12.2ms) | Samples: 3

**Called by:**
- `mapSnapshotIndexThroughChange` (9)

**Calls:**
- `getNodeKeyForNode` (6)

### `get`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:237` | Self: 0.0% (4.2ms) | Total: 0.0% (4.2ms) | Samples: 3

**Called by:**
- `performProxyObjectGet` (3)

### `decodeNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:135` | Self: 0.0% (4.1ms) | Total: 0.0% (4.1ms) | Samples: 3

**Called by:**
- `(anonymous)` (3)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts` | Self: 0.0% (4.1ms) | Total: 0.0% (4.1ms) | Samples: 3

**Called by:**
- `filter` (2)
- `some` (1)

### `assertNode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:889` | Self: 0.0% (4.1ms) | Total: 0.0% (4.1ms) | Samples: 3

**Called by:**
- `decodeNodes` (3)

### `mixStructuralFingerprint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:84` | Self: 0.0% (4.1ms) | Total: 0.0% (4.1ms) | Samples: 3

**Called by:**
- `getStructuralFingerprint` (1)
- `getStructuralFingerprint` (1)
- `mixStructuralFingerprintString` (1)

### `materializeTokens`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:558` | Self: 0.0% (4.0ms) | Total: 0.0% (13.8ms) | Samples: 3

**Called by:**
- `getContentEndOffset` (11)

**Calls:**
- `tokenLength` (8)

### `sliceMaterialized`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:785` | Self: 0.0% (4.0ms) | Total: 0.0% (4.0ms) | Samples: 3

**Called by:**
- `between` (3)

### `visitDeclarative`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2778` | Self: 0.0% (4.0ms) | Total: 0.0% (4.0ms) | Samples: 3

**Called by:**
- `forEach` (3)

### `visit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:634` | Self: 0.0% (4.0ms) | Total: 0.2% (597.8ms) | Samples: 3

**Called by:**
- `fitClosedSliceInterior` (470)

**Calls:**
- `fitClosedNode` (321)
- `fitClosedNode` (78)
- `retainOrigin` (20)
- `fitClosedNode` (13)
- `fitClosedNode` (12)
- `retainOrigin` (12)
- `fitClosedNode` (5)
- `fitClosedNode` (2)
- `fitClosedNode` (2)
- `retainOrigin` (2)

### `encode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:873` | Self: 0.0% (3.9ms) | Total: 0.0% (65.7ms) | Samples: 3

**Called by:**
- `forEach` (51)

**Calls:**
- `freeze` (48)

### `getStructuralFingerprint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:126` | Self: 0.0% (3.9ms) | Total: 0.0% (3.9ms) | Samples: 3

**Called by:**
- `getStructuralFingerprint` (3)

### `cacheIndex`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:386` | Self: 0.0% (3.9ms) | Total: 0.0% (3.9ms) | Samples: 3

**Called by:**
- `(anonymous)` (3)

### `classifyRootChangeWithRuntimeCandidates`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:156` | Self: 0.0% (3.9ms) | Total: 0.0% (6.6ms) | Samples: 3

**Called by:**
- `apply` (5)

**Calls:**
- `nodeRangesTouching` (2)

### `mapChangedNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:975` | Self: 0.0% (3.9ms) | Total: 0.0% (154.0ms) | Samples: 3

**Called by:**
- `mapSnapshotIndexThroughChange` (115)

**Calls:**
- `set` (61)
- `pathKey` (45)
- `pathKey` (5)
- `pathKey` (1)

### `advancePathStableSnapshotIndex`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1782` | Self: 0.0% (3.9ms) | Total: 0.0% (8.8ms) | Samples: 3

**Called by:**
- `inheritDocumentChangeStepNodeKeys` (7)

**Calls:**
- `performIteration` (4)

### `addParentIndex`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3474` | Self: 0.0% (3.9ms) | Total: 0.0% (3.9ms) | Samples: 3

**Called by:**
- `addOwnPath` (3)

### `constructCanonicalDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1093` | Self: 0.0% (3.9ms) | Total: 0.0% (5.2ms) | Samples: 3

**Called by:**
- `assertCanonical` (4)

**Calls:**
- `Map` (1)

### `hasOnlyKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:45` | Self: 0.0% (3.9ms) | Total: 0.1% (235.1ms) | Samples: 3

**Called by:**
- `isNode` (163)
- `isText` (13)
- `isStrictPoint` (10)

**Calls:**
- `Set` (183)

### `decodeNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:218` | Self: 0.0% (3.9ms) | Total: 0.0% (21.8ms) | Samples: 3

**Called by:**
- `(anonymous)` (17)

**Calls:**
- `cloneObject` (11)
- `join` (3)

### `compose`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1059` | Self: 0.0% (3.8ms) | Total: 0.0% (3.8ms) | Samples: 3

**Called by:**
- `apply` (3)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts` | Self: 0.0% (3.8ms) | Total: 0.0% (3.8ms) | Samples: 3

**Called by:**
- `every` (3)

### `encode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:861` | Self: 0.0% (3.7ms) | Total: 0.0% (26.8ms) | Samples: 3

**Called by:**
- `forEach` (21)

**Calls:**
- `freeze` (16)
- `textToken` (2)

### `getDescendant`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:505` | Self: 0.0% (3.7ms) | Total: 0.0% (12.3ms) | Samples: 3

**Called by:**
- `validateDocumentChange` (5)
- `validateDocumentChange` (4)
- `resolveExternalDocumentPoint` (1)

**Calls:**
- `isElement` (7)

### `mapChangedNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1162` | Self: 0.0% (3.7ms) | Total: 0.0% (3.7ms) | Samples: 3

**Called by:**
- `mapSnapshotIndexThroughChange` (3)

### `canonicalizeDeclarativeChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1741` | Self: 0.0% (3.7ms) | Total: 2.0% (4.38s) | Samples: 3

**Called by:**
- `constructCanonicalDocumentChange` (1165)
- `(anonymous)` (1140)
- `constructCanonicalDocumentChange` (1077)
- `replaceCanonicalChildWindow` (33)
- `replaceCanonicalChildWindow` (27)

**Calls:**
- `map` (3439)

### `classifyRootChangeWithRuntimeCandidates`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:155` | Self: 0.0% (3.7ms) | Total: 0.0% (37.0ms) | Samples: 3

**Called by:**
- `classify` (23)
- `apply` (7)

**Calls:**
- `nodeRangesTouching` (22)
- `flat` (3)
- `nodeRangesTouching` (2)

### `seek`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:427` | Self: 0.0% (3.7ms) | Total: 0.0% (3.7ms) | Samples: 3

**Called by:**
- `textAt` (2)
- `pointAt` (1)

### `getExtensionRegistryStore`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts` | Self: 0.0% (3.7ms) | Total: 0.0% (3.7ms) | Samples: 3

**Called by:**
- `getExtensionRegistry` (3)

### `reduce`
`[native code]` | Self: 0.0% (3.7ms) | Total: 0.0% (5.1ms) | Samples: 3

**Called by:**
- `RootChange` (3)
- `RootChange` (1)

**Calls:**
- `(anonymous)` (1)

### `get`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:205` | Self: 0.0% (3.6ms) | Total: 0.0% (3.6ms) | Samples: 3

**Called by:**
- `performProxyObjectGet` (3)

### `getElementAncestors`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:517` | Self: 0.0% (3.6ms) | Total: 0.0% (3.6ms) | Samples: 3

**Called by:**
- `validateDocumentChange` (3)

### `decodeNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:221` | Self: 0.0% (3.6ms) | Total: 0.0% (29.5ms) | Samples: 3

**Called by:**
- `(anonymous)` (24)

**Calls:**
- `assertNode` (14)
- `assertNode` (4)
- `assertNode` (3)

### `getInternalDocumentChangeEntries`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:532` | Self: 0.0% (3.5ms) | Total: 0.0% (3.5ms) | Samples: 3

**Called by:**
- `applyAnchorChange` (1)
- `applyDocumentChangeValue` (1)
- `recordFacetDraftDocumentChange` (1)

### `get`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts` | Self: 0.0% (3.5ms) | Total: 0.0% (3.5ms) | Samples: 3

**Called by:**
- `performProxyObjectGet` (3)

### `visitDescendantPaths`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/provenance.ts:48` | Self: 0.0% (3.5ms) | Total: 0.0% (155.6ms) | Samples: 3

**Called by:**
- `createRootFitPathProvenance` (56)
- `retainOrigin` (43)
- `(anonymous)` (25)

**Calls:**
- `forEach` (121)

### `mapPos`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2827` | Self: 0.0% (3.5ms) | Total: 0.0% (3.5ms) | Samples: 3

**Called by:**
- `resolveMappedPoint` (3)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:283` | Self: 0.0% (3.4ms) | Total: 0.0% (3.4ms) | Samples: 3

**Called by:**
- `every` (3)

### `compileSliceFitter`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts` | Self: 0.0% (3.4ms) | Total: 0.0% (3.4ms) | Samples: 3

**Called by:**
- `getCompiled` (3)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:183` | Self: 0.0% (3.4ms) | Total: 0.0% (3.4ms) | Samples: 3

**Called by:**
- `some` (3)

### `isArray`
`[native code]` | Self: 0.0% (3.4ms) | Total: 0.0% (3.4ms) | Samples: 3

**Called by:**
- `jsonEqual` (1)
- `addRange` (1)
- `getStructuralFingerprint` (1)

### `decodeNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:208` | Self: 0.0% (3.3ms) | Total: 0.0% (3.3ms) | Samples: 3

**Called by:**
- `(anonymous)` (3)

### `validateDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3650` | Self: 0.0% (3.1ms) | Total: 0.0% (4.3ms) | Samples: 3

**Called by:**
- `(anonymous)` (4)

**Calls:**
- `next` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:287` | Self: 0.0% (3.0ms) | Total: 0.0% (5.7ms) | Samples: 2

**Called by:**
- `every` (4)

**Calls:**
- `contentAllows` (1)
- `contentAllows` (1)

### `rememberValidatedDocumentRoots`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3137` | Self: 0.0% (3.0ms) | Total: 0.0% (8.1ms) | Samples: 2

**Called by:**
- `(anonymous)` (4)
- `adoptDocumentBaseline` (2)

**Calls:**
- `sealElementOwnedRootIndex` (3)
- `sealElementOwnedRootIndex` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:307` | Self: 0.0% (2.9ms) | Total: 0.0% (2.9ms) | Samples: 2

**Called by:**
- `map` (2)

### `tokensEqual`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:193` | Self: 0.0% (2.9ms) | Total: 0.0% (2.9ms) | Samples: 2

**Called by:**
- `(anonymous)` (2)

### `allocateNodeKey`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:32` | Self: 0.0% (2.9ms) | Total: 0.0% (2.9ms) | Samples: 2

**Called by:**
- `assignFreshNodeKey` (2)

### `getExtensionRegistryStore`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:580` | Self: 0.0% (2.9ms) | Total: 0.0% (2.9ms) | Samples: 2

**Called by:**
- `getExtensionRegistry` (2)

### `visitDescendantPaths`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/provenance.ts:46` | Self: 0.0% (2.8ms) | Total: 0.0% (2.8ms) | Samples: 2

**Called by:**
- `retainOrigin` (2)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:118` | Self: 0.0% (2.8ms) | Total: 0.0% (3.9ms) | Samples: 2

**Called by:**
- `ChangeDraft` (3)

**Calls:**
- `WeakMap` (1)

### `collectProjectedRoots`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3210` | Self: 0.0% (2.8ms) | Total: 0.0% (42.6ms) | Samples: 2

**Called by:**
- `fitDocumentInput` (32)

**Calls:**
- `getElementContentRoots` (14)
- `freeze` (11)
- `getElementContentRoots` (3)
- `values` (2)

### `claim`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1008` | Self: 0.0% (2.8ms) | Total: 0.0% (2.8ms) | Samples: 2

**Called by:**
- `mapChangedNodeKeys` (2)

### `childBoundaryAt`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:108` | Self: 0.0% (2.8ms) | Total: 0.0% (2.8ms) | Samples: 2

**Called by:**
- `applyIndexed` (1)
- `(anonymous)` (1)

### `indexRecursivePath`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` | Self: 0.0% (2.8ms) | Total: 0.0% (2.8ms) | Samples: 2

**Called by:**
- `validateDocumentChange` (2)

### `(host)`
`[native code]` | Self: 0.0% (2.7ms) | Total: 79.1% (167.96s) | Samples: 2

**Called by:**
- `(anonymous)` (85114)
- `runRemoteChangesSeparately` (45958)
- `runRemoteChangeBatch` (237)
- `measureAnchors` (212)
- `(anonymous)` (171)
- `measureConnectDisconnectHeap` (22)
- `(anonymous)` (17)
- `measureAnchors` (2)
- `(anonymous)` (1)

**Calls:**
- `update` (131688)
- `update` (39)
- `update` (1)
- `readEditor` (1)
- `readEditor` (1)
- `read` (1)
- `update` (1)

### `pathKey`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/provenance.ts:41` | Self: 0.0% (2.7ms) | Total: 0.0% (2.7ms) | Samples: 2

**Called by:**
- `(anonymous)` (2)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1785` | Self: 0.0% (2.7ms) | Total: 0.0% (49.0ms) | Samples: 2

**Called by:**
- `map` (37)

**Calls:**
- `Set` (35)

### `clone`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:258` | Self: 0.0% (2.7ms) | Total: 0.0% (2.7ms) | Samples: 2

**Called by:**
- `(anonymous)` (2)

### `finalize`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:738` | Self: 0.0% (2.7ms) | Total: 0.0% (2.7ms) | Samples: 2

**Called by:**
- `prepareFittedDocument` (1)
- `finalizeTransactionRepresentation` (1)

### `hasInRoot`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:781` | Self: 0.0% (2.7ms) | Total: 0.0% (2.7ms) | Samples: 2

**Called by:**
- `some` (2)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:119` | Self: 0.0% (2.7ms) | Total: 0.0% (3.8ms) | Samples: 2

**Called by:**
- `map` (3)

**Calls:**
- `find` (1)

### `validateDeclarativeRootContent`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2854` | Self: 0.0% (2.7ms) | Total: 0.0% (156.7ms) | Samples: 2

**Called by:**
- `validateDeclarativeDocument` (121)

**Calls:**
- `next` (119)

### `fit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts` | Self: 0.0% (2.7ms) | Total: 0.0% (2.7ms) | Samples: 2

**Called by:**
- `fitRoot` (2)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1170` | Self: 0.0% (2.7ms) | Total: 0.0% (2.7ms) | Samples: 2

**Called by:**
- `iterChangedRanges` (2)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3492` | Self: 0.0% (2.7ms) | Total: 0.1% (259.3ms) | Samples: 2

**Called by:**
- `iterChangedRanges` (204)

**Calls:**
- `addOwnPath` (107)
- `addOwnPath` (83)
- `addOwnPath` (12)

### `replaceCanonicalChildWindow`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:813` | Self: 0.0% (2.6ms) | Total: 0.0% (2.6ms) | Samples: 2

**Called by:**
- `(anonymous)` (2)

### `groupRelocationCandidates`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:163` | Self: 0.0% (2.6ms) | Total: 0.2% (545.5ms) | Samples: 2

**Called by:**
- `deriveRootRelocations` (403)
- `deriveRootRelocations` (22)

**Calls:**
- `getStructuralFingerprint` (190)
- `getStructuralFingerprint` (156)
- `getStructuralFingerprint` (50)
- `getStructuralFingerprint` (8)
- `getStructuralFingerprint` (4)
- `getStructuralFingerprint` (3)
- `getStructuralFingerprint` (3)
- `getStructuralFingerprint` (2)
- `getStructuralFingerprint` (2)
- `getStructuralFingerprint` (2)
- `getStructuralFingerprint` (1)
- `getStructuralFingerprint` (1)
- `getStructuralFingerprint` (1)

### `isInline`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3763` | Self: 0.0% (2.6ms) | Total: 0.0% (71.5ms) | Samples: 2

**Called by:**
- `hasInlineContent` (57)

**Calls:**
- `getElementBehavior` (54)
- `isElement` (1)

### `rawNodeAt`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:105` | Self: 0.0% (2.6ms) | Total: 0.0% (2.6ms) | Samples: 2

**Called by:**
- `mapPoint` (1)
- `mapPoint` (1)

### `getStructuralFingerprint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:123` | Self: 0.0% (2.6ms) | Total: 0.0% (2.6ms) | Samples: 2

**Called by:**
- `getStructuralFingerprint` (1)
- `groupRelocationCandidates` (1)

### `composeSections`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:634` | Self: 0.0% (2.6ms) | Total: 0.0% (2.6ms) | Samples: 2

**Called by:**
- `compose` (2)

### `RootChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1382` | Self: 0.0% (2.6ms) | Total: 0.0% (10.3ms) | Samples: 2

**Called by:**
- `compose` (5)
- `invert` (1)
- `empty` (1)
- `create` (1)

**Calls:**
- `freeze` (6)

### `advanceNextNodeKey`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:128` | Self: 0.0% (2.6ms) | Total: 0.0% (2.6ms) | Samples: 1

**Called by:**
- `setNodeKey` (1)

### `encodeNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:914` | Self: 0.0% (2.6ms) | Total: 0.0% (2.6ms) | Samples: 2

**Called by:**
- `(anonymous)` (2)

### `getStructuralFingerprint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:103` | Self: 0.0% (2.6ms) | Total: 0.0% (2.6ms) | Samples: 2

**Called by:**
- `groupRelocationCandidates` (2)

### `canonicalizeNode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:259` | Self: 0.0% (2.6ms) | Total: 0.1% (330.0ms) | Samples: 2

**Called by:**
- `map` (261)

**Calls:**
- `canonicalizeDirectChildren` (88)
- `canonicalizeDirectChildren` (62)
- `canonicalizeInlineChildren` (26)
- `canonicalizeInlineChildren` (24)
- `canonicalizeDirectChildren` (19)
- `canonicalizeInlineChildren` (13)
- `canonicalizeInlineChildren` (7)
- `canonicalizeInlineChildren` (7)
- `canonicalizeInlineChildren` (5)
- `canonicalizeInlineChildren` (4)
- `canonicalizeDirectChildren` (2)
- `canonicalizeDirectChildren` (1)
- `canonicalizeInlineChildren` (1)

### `mapChangedNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1152` | Self: 0.0% (2.6ms) | Total: 0.0% (15.1ms) | Samples: 2

**Called by:**
- `mapSnapshotIndexThroughChange` (12)

**Calls:**
- `has` (10)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1370` | Self: 0.0% (2.6ms) | Total: 0.0% (2.6ms) | Samples: 2

**Called by:**
- `flatIntoArrayWithCallback` (2)

### `visit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:213` | Self: 0.0% (2.6ms) | Total: 0.0% (2.6ms) | Samples: 2

**Called by:**
- `nodeRangesTouching` (1)
- `visit` (1)

### `entry`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:900` | Self: 0.0% (2.6ms) | Total: 0.0% (2.6ms) | Samples: 2

**Called by:**
- `nodeRange` (1)
- `positionAt` (1)

### `runEditorTransaction`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7984` | Self: 0.0% (2.6ms) | Total: 0.0% (6.6ms) | Samples: 2

**Called by:**
- `withUpdateTagContext` (3)
- `runTrustedUpdate` (2)

**Calls:**
- `withExtensionPublicationRollback` (3)

### `remember`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:540` | Self: 0.0% (2.6ms) | Total: 0.0% (2.6ms) | Samples: 2

**Called by:**
- `applyIndexed` (1)
- `mapTextOffset` (1)

### `applyTrustedCanonical`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:698` | Self: 0.0% (2.6ms) | Total: 0.0% (2.6ms) | Samples: 2

**Called by:**
- `applyDocumentChange` (2)

### `applyTrustedCanonical`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:725` | Self: 0.0% (2.6ms) | Total: 0.0% (2.6ms) | Samples: 2

**Called by:**
- `applyDocumentChange` (2)

### `async (anonymous)`
`[native code]` | Self: 0.0% (2.5ms) | Total: 0.0% (70.0ms) | Samples: 1

**Called by:**
- `requestInstantiate` (19)
- `async (anonymous)` (19)

**Calls:**
- `requestFetch` (19)
- `async (anonymous)` (19)
- `parseModule` (14)

### `applyEditorUpdateTag`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/update-policy.ts:48` | Self: 0.0% (2.5ms) | Total: 0.0% (2.5ms) | Samples: 2

**Called by:**
- `applyEditorUpdateTags` (2)

### `runEditorTransaction`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7821` | Self: 0.0% (2.5ms) | Total: 91.6% (194.29s) | Samples: 2

**Called by:**
- `withUpdateTagContext` (129909)
- `replaceTransformedSnapshot` (22463)
- `invoke` (29)

**Calls:**
- `(anonymous)` (84985)
- `(anonymous)` (38825)
- `(anonymous)` (10387)
- `(anonymous)` (9780)
- `apply` (6052)
- `(anonymous)` (2066)
- `(anonymous)` (204)
- `(anonymous)` (43)
- `(anonymous)` (24)
- `(anonymous)` (17)
- `(anonymous)` (12)
- `(anonymous)` (2)
- `(anonymous)` (1)
- `(anonymous)` (1)

### `replaceCanonicalChildWindow`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:796` | Self: 0.0% (2.5ms) | Total: 0.0% (2.5ms) | Samples: 2

**Called by:**
- `(anonymous)` (2)

### `replacements`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2432` | Self: 0.0% (2.5ms) | Total: 0.0% (2.5ms) | Samples: 2

**Called by:**
- `applyInternal` (1)
- `movedNode` (1)

### `getEditorDocumentRoots`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:1847` | Self: 0.0% (2.5ms) | Total: 0.0% (2.5ms) | Samples: 2

**Called by:**
- `getCurrentRootSnapshot` (1)
- `(anonymous)` (1)

### `visit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:638` | Self: 0.0% (2.5ms) | Total: 0.0% (2.5ms) | Samples: 2

**Called by:**
- `fitClosedSliceInterior` (2)

### `validateDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3678` | Self: 0.0% (2.5ms) | Total: 0.0% (47.6ms) | Samples: 2

**Called by:**
- `(anonymous)` (38)

**Calls:**
- `validateContentIndexes` (27)
- `validateContentIndexes` (7)
- `validateContentIndexes` (2)

### `resolveExternalDocumentPoint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1469` | Self: 0.0% (2.5ms) | Total: 0.0% (2.5ms) | Samples: 2

**Called by:**
- `(anonymous)` (2)

### `PreparedTokenSlice`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts` | Self: 0.0% (2.5ms) | Total: 0.0% (2.5ms) | Samples: 2

**Called by:**
- `fromTokens` (2)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:86` | Self: 0.0% (2.5ms) | Total: 0.0% (2.5ms) | Samples: 1

**Called by:**
- `map` (1)

### `decodeNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:229` | Self: 0.0% (2.5ms) | Total: 0.1% (350.2ms) | Samples: 2

**Called by:**
- `(anonymous)` (276)

**Calls:**
- `freeze` (218)
- `cloneFrozen` (44)
- `deepFreeze` (12)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:137` | Self: 0.0% (2.5ms) | Total: 0.0% (2.5ms) | Samples: 2

**Called by:**
- `decodeNodes` (2)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1742` | Self: 0.0% (2.5ms) | Total: 0.0% (5.1ms) | Samples: 2

**Called by:**
- `map` (4)

**Calls:**
- `isText` (2)

### `structurallyEqual`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:232` | Self: 0.0% (2.5ms) | Total: 0.1% (239.6ms) | Samples: 2

**Called by:**
- `fit` (136)
- `every` (55)

**Calls:**
- `every` (189)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:155` | Self: 0.0% (2.5ms) | Total: 0.0% (2.5ms) | Samples: 2

**Called by:**
- `every` (2)

### `fitClosedNode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:473` | Self: 0.0% (2.5ms) | Total: 0.0% (2.5ms) | Samples: 2

**Called by:**
- `visit` (2)

### `hasOwn`
`[native code]` | Self: 0.0% (2.5ms) | Total: 0.0% (2.5ms) | Samples: 2

**Called by:**
- `applyTransactionSpecDocumentChangeStep` (2)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1744` | Self: 0.0% (2.5ms) | Total: 0.0% (83.1ms) | Samples: 2

**Called by:**
- `map` (65)

**Calls:**
- `toCompiledTargetContext` (63)

### `createEditorUpdateDraftContext`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7667` | Self: 0.0% (2.5ms) | Total: 0.0% (3.5ms) | Samples: 2

**Called by:**
- `runEditorTransaction` (3)

**Calls:**
- `fromEntries` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:134` | Self: 0.0% (2.5ms) | Total: 0.2% (439.7ms) | Samples: 2

**Called by:**
- `map` (339)

**Calls:**
- `snapshotSliceContent` (170)
- `snapshotSliceContent` (108)
- `freeze` (57)
- `snapshotSliceContent` (2)

### `replacements`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2434` | Self: 0.0% (2.5ms) | Total: 0.0% (2.5ms) | Samples: 2

**Called by:**
- `applyInternal` (1)
- `movedNode` (1)

### `visitDeclarative`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2733` | Self: 0.0% (2.5ms) | Total: 0.0% (78.5ms) | Samples: 2

**Called by:**
- `forEach` (63)

**Calls:**
- `getTextProperties` (51)
- `entries` (10)

### `DocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:737` | Self: 0.0% (2.5ms) | Total: 0.0% (2.5ms) | Samples: 2

**Called by:**
- `constructDocumentChange` (2)

### `decodeNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:192` | Self: 0.0% (2.4ms) | Total: 0.0% (3.9ms) | Samples: 2

**Called by:**
- `(anonymous)` (3)

**Calls:**
- `at` (1)

### `mapRelocatedPath`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:517` | Self: 0.0% (2.4ms) | Total: 0.0% (2.4ms) | Samples: 2

**Called by:**
- `mapChangedNodeKeys` (1)
- `mapPathForward` (1)

### `DocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:755` | Self: 0.0% (2.4ms) | Total: 0.0% (6.5ms) | Samples: 2

**Called by:**
- `constructDocumentChange` (5)

**Calls:**
- `performProxyObjectGet` (3)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1745` | Self: 0.0% (2.4ms) | Total: 0.0% (2.4ms) | Samples: 2

**Called by:**
- `map` (2)

### `isRecursivelyValidated`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3549` | Self: 0.0% (2.4ms) | Total: 0.0% (2.4ms) | Samples: 2

**Called by:**
- `validateDocumentChange` (2)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:3153` | Self: 0.0% (2.4ms) | Total: 0.0% (2.4ms) | Samples: 2

**Called by:**
- `every` (2)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1150` | Self: 0.0% (2.4ms) | Total: 0.0% (2.4ms) | Samples: 2

**Called by:**
- `iterChangedRanges` (2)

### `isStrictPoint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:121` | Self: 0.0% (2.4ms) | Total: 0.0% (6.5ms) | Samples: 2

**Called by:**
- `isText` (3)
- `isText` (2)

**Calls:**
- `every` (3)

### `snapshotSliceContent`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:74` | Self: 0.0% (2.4ms) | Total: 0.0% (2.4ms) | Samples: 2

**Called by:**
- `(anonymous)` (2)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:332` | Self: 0.0% (2.4ms) | Total: 0.0% (37.5ms) | Samples: 2

**Called by:**
- `withDecodedSplicedNodes` (29)
- `withSplicedNodes` (1)

**Calls:**
- `performIteration` (27)
- `splice` (1)

### `getPendingSelectionMarks`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:367` | Self: 0.0% (2.4ms) | Total: 0.0% (4.9ms) | Samples: 2

**Called by:**
- `createCommitChanged` (2)
- `createCommitChanged` (2)

**Calls:**
- `isText` (2)

### `mapChangedNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1160` | Self: 0.0% (2.4ms) | Total: 0.0% (23.2ms) | Samples: 2

**Called by:**
- `mapSnapshotIndexThroughChange` (19)

**Calls:**
- `nodeText` (13)
- `nodeText` (3)
- `nodeText` (1)

### `constructCanonicalDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1060` | Self: 0.0% (2.4ms) | Total: 0.0% (2.4ms) | Samples: 2

**Called by:**
- `assertCanonical` (2)

### `getDocumentRootProgram`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` | Self: 0.0% (2.4ms) | Total: 0.0% (2.4ms) | Samples: 2

**Called by:**
- `fit` (2)

### `addOwnPath`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3482` | Self: 0.0% (2.4ms) | Total: 0.0% (103.8ms) | Samples: 2

**Called by:**
- `(anonymous)` (83)

**Calls:**
- `addParentIndex` (32)
- `slice` (15)
- `addParentIndex` (11)
- `addParentIndex` (8)
- `addParentIndex` (6)
- `addParentIndex` (4)
- `addParentIndex` (3)
- `addParentIndex` (1)
- `addParentIndex` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1755` | Self: 0.0% (2.4ms) | Total: 0.0% (41.3ms) | Samples: 2

**Called by:**
- `map` (33)

**Calls:**
- `Set` (31)

### `isRange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/range.ts:200` | Self: 0.0% (2.4ms) | Total: 0.0% (6.2ms) | Samples: 2

**Called by:**
- `assertSelectionSupported` (3)
- `mapSelectionThroughChange` (1)
- `normalizeSelectionRoot` (1)

**Calls:**
- `every` (1)
- `isPoint` (1)
- `isPoint` (1)

### `rawNodeAt`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:106` | Self: 0.0% (2.4ms) | Total: 0.0% (2.4ms) | Samples: 2

**Called by:**
- `mapPoint` (2)

### `defineProperty`
`[native code]` | Self: 0.0% (2.3ms) | Total: 0.0% (2.3ms) | Samples: 1

**Called by:**
- `hideFromStack` (1)

### `isRecursivelyValidated`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3555` | Self: 0.0% (2.3ms) | Total: 0.0% (2.3ms) | Samples: 2

**Called by:**
- `validateDocumentChange` (2)

### `mapPoint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:450` | Self: 0.0% (2.3ms) | Total: 0.0% (6.0ms) | Samples: 2

**Called by:**
- `mapRange` (5)

**Calls:**
- `rawNodeAt` (2)
- `rawNodeAt` (1)

### `encode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:849` | Self: 0.0% (2.3ms) | Total: 0.0% (101.8ms) | Samples: 2

**Called by:**
- `forEach` (78)

**Calls:**
- `cloneObject` (76)

### `encode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:850` | Self: 0.0% (2.3ms) | Total: 0.0% (2.3ms) | Samples: 2

**Called by:**
- `forEach` (2)

### `propertyChanges`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2459` | Self: 0.0% (2.3ms) | Total: 0.0% (2.3ms) | Samples: 2

**Called by:**
- `applyInternal` (2)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:112` | Self: 0.0% (2.3ms) | Total: 0.0% (50.5ms) | Samples: 2

**Called by:**
- `map` (41)

**Calls:**
- `map` (39)

### `advancePathStableSnapshotIndex`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1790` | Self: 0.0% (2.3ms) | Total: 0.0% (15.0ms) | Samples: 2

**Called by:**
- `inheritDocumentChangeStepNodeKeys` (12)

**Calls:**
- `keyAt` (6)
- `keyAt` (4)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs` | Self: 0.0% (2.3ms) | Total: 0.0% (2.3ms) | Samples: 2

**Called by:**
- `from` (1)
- `measureCohort` (1)

### `runRemoteChangesSeparately`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:241` | Self: 0.0% (2.3ms) | Total: 0.0% (11.8ms) | Samples: 2

**Called by:**
- `(anonymous)` (6)
- `measureCohort` (3)

**Calls:**
- `assertRemoteCommit` (2)
- `assertRemoteCommit` (2)
- `assertRemoteCommit` (1)
- `assertRemoteCommit` (1)
- `assertRemoteCommit` (1)

### `getDescendant`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:346` | Self: 0.0% (2.3ms) | Total: 0.0% (2.3ms) | Samples: 2

**Called by:**
- `replaceCanonicalChildWindow` (2)

### `normalizeSelectionRoot`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-state.ts:24` | Self: 0.0% (2.3ms) | Total: 0.0% (6.5ms) | Samples: 2

**Called by:**
- `setSelectionStateSelection` (5)

**Calls:**
- `cloneEditorJsonValue` (3)

### `next`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:546` | Self: 0.0% (2.3ms) | Total: 0.0% (2.3ms) | Samples: 2

**Called by:**
- `forwardOutput` (1)
- `SectionIterator` (1)

### `validateContentIndexes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3406` | Self: 0.0% (2.3ms) | Total: 0.0% (2.3ms) | Samples: 2

**Called by:**
- `validateDocumentChange` (2)

### `collectProjectedRoots`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3207` | Self: 0.0% (2.3ms) | Total: 0.0% (2.3ms) | Samples: 2

**Called by:**
- `collectProjectedRoots` (2)

### `getDocumentRootProgram`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:779` | Self: 0.0% (2.3ms) | Total: 0.0% (2.3ms) | Samples: 2

**Called by:**
- `getRootContent` (2)

### `constructCanonicalDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:999` | Self: 0.0% (2.3ms) | Total: 0.0% (2.3ms) | Samples: 2

**Called by:**
- `finalize` (1)
- `assertCanonical` (1)

### `getUpdateView`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4606` | Self: 0.0% (2.2ms) | Total: 0.0% (2.2ms) | Samples: 2

**Called by:**
- `(anonymous)` (2)

### `canonicalizeEditorExtension`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts` | Self: 0.0% (2.2ms) | Total: 0.0% (2.2ms) | Samples: 2

**Called by:**
- `createFakeCollabAdapter` (1)
- `createEditorWithDocument` (1)

### `validateDeclarativeDocument`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3094` | Self: 0.0% (2.2ms) | Total: 0.0% (4.5ms) | Samples: 2

**Called by:**
- `(anonymous)` (4)

**Calls:**
- `validateDeclarativeRootContent` (1)
- `entries` (1)

### `getStructuralFingerprint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:137` | Self: 0.0% (2.2ms) | Total: 0.1% (251.0ms) | Samples: 2

**Called by:**
- `groupRelocationCandidates` (190)
- `getStructuralFingerprint` (6)
- `getStructuralFingerprint` (3)

**Calls:**
- `freeze` (197)

### `canonicalizeDirectChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:190` | Self: 0.0% (2.2ms) | Total: 0.0% (2.2ms) | Samples: 2

**Called by:**
- `canonicalizeNode` (2)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` | Self: 0.0% (2.2ms) | Total: 0.0% (2.2ms) | Samples: 2

**Called by:**
- `forEach` (1)
- `every` (1)

### `getCompiledElement`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:926` | Self: 0.0% (2.2ms) | Total: 0.0% (84.7ms) | Samples: 2

**Called by:**
- `getElementBehavior` (54)
- `getElementContentRoots` (13)

**Calls:**
- `performProxyObjectGet` (56)
- `bound get` (6)
- `getDeclarativeSchema` (3)

### `canonicalizeInlineChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:184` | Self: 0.0% (2.2ms) | Total: 0.0% (10.4ms) | Samples: 2

**Called by:**
- `canonicalizeNode` (7)
- `replaceCanonicalChildWindow` (1)

**Calls:**
- `every` (6)

### `createTreeIndexNode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:63` | Self: 0.0% (2.2ms) | Total: 0.0% (32.6ms) | Samples: 2

**Called by:**
- `map` (22)

**Calls:**
- `createTreeIndexChildren` (20)

### `create`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1399` | Self: 0.0% (2.2ms) | Total: 0.0% (2.2ms) | Samples: 2

**Called by:**
- `reconcileChildrenStep` (1)
- `insertText` (1)

### `anonymous`
`[native code]` | Self: 0.0% (2.2ms) | Total: 0.0% (19.6ms) | Samples: 2

**Called by:**
- `internal:assert/assertion_error` (2)
- `loadAssertionError` (2)
- `get ReadStream` (2)
- `node:assert/strict` (2)
- `node:stream` (1)
- `node:path` (1)
- `internal:streams/pipeline` (1)
- `internal:stream` (1)
- `internal:streams/compose` (1)
- `node:fs` (1)
- `internal:fs/streams` (1)
- `internal:streams/operators` (1)

**Calls:**
- `internal:assert/assertion_error` (2)
- `internal:fs/streams` (2)
- `node:assert` (2)
- `internal:util/colors` (1)
- `node:stream` (1)
- `node:fs/promises` (1)
- `internal:streams/operators` (1)
- `internal:validators` (1)
- `internal:streams/pipeline` (1)
- `internal:stream` (1)
- `internal:streams/compose` (1)

### `getStructuralFingerprint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:105` | Self: 0.0% (2.1ms) | Total: 0.0% (2.1ms) | Samples: 2

**Called by:**
- `getStructuralFingerprint` (1)
- `groupRelocationCandidates` (1)

### `validateDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3630` | Self: 0.0% (2.1ms) | Total: 0.3% (801.5ms) | Samples: 2

**Called by:**
- `(anonymous)` (633)

**Calls:**
- `validateSubtree` (182)
- `validateSubtree` (177)
- `validateSubtree` (156)
- `validateSubtree` (68)
- `validateSubtree` (19)
- `validateSubtree` (12)
- `validateSubtree` (10)
- `validateSubtree` (4)
- `getElementAncestors` (3)

### `mapChangedNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1192` | Self: 0.0% (2.1ms) | Total: 0.0% (2.1ms) | Samples: 2

**Called by:**
- `mapSnapshotIndexThroughChange` (2)

### `runEditorTransaction`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7941` | Self: 0.0% (2.1ms) | Total: 0.0% (3.2ms) | Samples: 2

**Called by:**
- `withUpdateTagContext` (2)
- `runTrustedUpdate` (1)

**Calls:**
- `decrementEditorTransactionDepth` (1)

### `mapChangedNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1193` | Self: 0.0% (1.6ms) | Total: 0.0% (10.3ms) | Samples: 1

**Called by:**
- `mapSnapshotIndexThroughChange` (8)

**Calls:**
- `pathKey` (3)
- `pathKey` (2)
- `pathKey` (1)
- `pathKey` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts:615` | Self: 0.0% (1.5ms) | Total: 0.0% (1.5ms) | Samples: 1

**Called by:**
- `update` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:203` | Self: 0.0% (1.5ms) | Total: 0.0% (3.9ms) | Samples: 1

**Called by:**
- `filter` (3)

**Calls:**
- `isElement` (2)

### `assertRemoteCommit`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:145` | Self: 0.0% (1.5ms) | Total: 0.0% (4.1ms) | Samples: 1

**Called by:**
- `runRemoteChangesSeparately` (2)
- `runRemoteChangeBatch` (1)

**Calls:**
- `strict` (2)

### `assertRemoteCommit`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:147` | Self: 0.0% (1.5ms) | Total: 0.0% (1.5ms) | Samples: 1

**Called by:**
- `runRemoteChangesSeparately` (1)

### `advancePathStableSnapshotIndex`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1781` | Self: 0.0% (1.5ms) | Total: 0.0% (1.5ms) | Samples: 1

**Called by:**
- `inheritDocumentChangeStepNodeKeys` (1)

### `fromPreparedNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:614` | Self: 0.0% (1.5ms) | Total: 0.0% (143.3ms) | Samples: 1

**Called by:**
- `encodeContentSliceContent` (113)

**Calls:**
- `createTreeIndex` (109)
- `createTreeIndexChildren` (3)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:111` | Self: 0.0% (1.5ms) | Total: 0.0% (20.1ms) | Samples: 1

**Called by:**
- `map` (16)

**Calls:**
- `filter` (15)

### `validateContentIndexes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` | Self: 0.0% (1.5ms) | Total: 0.0% (1.5ms) | Samples: 1

**Called by:**
- `validateSubtree` (1)

### `commit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts:674` | Self: 0.0% (1.5ms) | Total: 0.0% (1.5ms) | Samples: 1

**Called by:**
- `commitAnchorTransaction` (1)

### `applyTransactionSpecDocumentChangeStep`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7391` | Self: 0.0% (1.5ms) | Total: 0.6% (1.33s) | Samples: 1

**Called by:**
- `applyDocumentChange` (990)
- `applyDocumentChangeStep` (34)
- `applyPreparedTransactionSpecChange` (27)

**Calls:**
- `setCurrentSelection` (844)
- `setCurrentSelection` (186)
- `setCurrentSelection` (20)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:67` | Self: 0.0% (1.5ms) | Total: 0.0% (20.6ms) | Samples: 1

**Called by:**
- `from` (16)

**Calls:**
- `paragraph` (15)

### `deepEquals`
`[native code]` | Self: 0.0% (1.5ms) | Total: 0.0% (1.5ms) | Samples: 1

**Called by:**
- `deepStrictEqual` (1)

### `guardTransactionValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts` | Self: 0.0% (1.5ms) | Total: 0.0% (1.5ms) | Samples: 1

**Called by:**
- `getUpdateView` (1)

### `commitAnchorTransaction`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:447` | Self: 0.0% (1.5ms) | Total: 0.0% (1.5ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `decodeNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:247` | Self: 0.0% (1.5ms) | Total: 0.9% (1.97s) | Samples: 1

**Called by:**
- `(anonymous)` (1519)
- `(anonymous)` (38)

**Calls:**
- `fromTokens` (1556)

### `constructCanonicalDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1049` | Self: 0.0% (1.5ms) | Total: 0.0% (1.5ms) | Samples: 1

**Called by:**
- `assertCanonical` (1)

### `assertSelectionSupported`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:676` | Self: 0.0% (1.5ms) | Total: 0.0% (1.5ms) | Samples: 1

**Called by:**
- `mapSelectionThroughChange` (1)

### `areJsonValuesStructurallyEqual`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:181` | Self: 0.0% (1.5ms) | Total: 0.0% (1.5ms) | Samples: 1

**Called by:**
- `finalizeTransactionSpecContext` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5849` | Self: 0.0% (1.5ms) | Total: 0.0% (54.2ms) | Samples: 1

**Called by:**
- `runEditorTransaction` (43)

**Calls:**
- `getUpdateView` (4)
- `getUpdateView` (4)
- `getUpdateView` (3)
- `getUpdateView` (3)
- `getUpdateView` (3)
- `getUpdateView` (2)
- `getUpdateView` (2)
- `getUpdateView` (2)
- `getUpdateView` (2)
- `getUpdateView` (1)
- `getUpdateView` (1)
- `getUpdateView` (1)
- `getUpdateView` (1)
- `getUpdateView` (1)
- `getUpdateView` (1)
- `getUpdateView` (1)
- `getUpdateView` (1)
- `getUpdateView` (1)
- `getUpdateView` (1)
- `getUpdateView` (1)
- `getUpdateView` (1)
- `getUpdateView` (1)
- `getUpdateView` (1)
- `getUpdateView` (1)
- `getUpdateView` (1)
- `getUpdateView` (1)

### `getOrphanedElementOwnedRoots`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` | Self: 0.0% (1.5ms) | Total: 0.0% (1.5ms) | Samples: 1

**Called by:**
- `reconcileExclusiveElementOwnedRoots` (1)

### `materializeTokens`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:552` | Self: 0.0% (1.5ms) | Total: 0.8% (1.70s) | Samples: 1

**Called by:**
- `getContentEndOffset` (1341)
- `applyIndexed` (1)

**Calls:**
- `freeze` (842)
- `encodeTrustedNodes` (370)
- `encodeTrustedNodes` (129)

### `initializePublicState`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8709` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `createEditorImplementation` (1)

### `getDeclarativeSchema`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `constructCanonicalDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1227` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `assertCanonical` (1)

### `createEditorCommit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:997` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `runEditorTransaction` (1)

### `orderPaths`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:867` | Self: 0.0% (1.4ms) | Total: 0.0% (4.4ms) | Samples: 1

**Called by:**
- `mapChangedNodeKeys` (3)

**Calls:**
- `performIteration` (2)

### `withText`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:861` | Self: 0.0% (1.4ms) | Total: 1.0% (2.18s) | Samples: 1

**Called by:**
- `applyIndexed` (1319)
- `insertText` (399)

**Calls:**
- `replaceIndexedChildren` (1420)
- `replaceIndexedChildren` (191)
- `replaceIndexedChildren` (63)
- `replaceIndexedChildren` (21)
- `replaceIndexedChildren` (8)
- `replaceIndexedChildren` (7)
- `replaceIndexedChildren` (5)
- `updateIndexedNode` (1)
- `replaceIndexedChildren` (1)

### `compose`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1061` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `apply` (1)

### `getStructuralFingerprint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:150` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `getStructuralFingerprint` (1)

### `inheritDocumentChangeStepNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7210` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `applyTransactionSpecDocumentChangeStep` (1)

### `sameNodeKind`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1127` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1163` | Self: 0.0% (1.4ms) | Total: 0.0% (2.5ms) | Samples: 1

**Called by:**
- `iterChangedRanges` (2)

**Calls:**
- `nodeRangesTouching` (1)

### `decodeNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:71` | Self: 0.0% (1.4ms) | Total: 0.0% (121.1ms) | Samples: 1

**Called by:**
- `(anonymous)` (93)
- `(anonymous)` (3)

**Calls:**
- `performIteration` (95)

### `cloneEditorJsonValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:229` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `applyTrustedCanonical`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:565` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `applyDocumentChange` (1)

### `createEditorUpdateApi`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-lifecycle-api.ts` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `createEditorImplementation` (1)

### `createEditorUpdateDraftContext`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7668` | Self: 0.0% (1.4ms) | Total: 0.0% (2.9ms) | Samples: 1

**Called by:**
- `runEditorTransaction` (2)

**Calls:**
- `performIteration` (1)

### `bound entries`
`[native code]` | Self: 0.0% (1.4ms) | Total: 0.0% (4.0ms) | Samples: 1

**Called by:**
- `getInternalDocumentChangeEntries` (2)
- `validateDocumentChange` (1)

**Calls:**
- `entries` (2)

### `applyTrustedCanonical`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:628` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `applyDocumentChange` (1)

### `assertSelectionSupported`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:709` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `setCurrentSelection` (1)

### `addParentIndex`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3471` | Self: 0.0% (1.4ms) | Total: 0.0% (39.4ms) | Samples: 1

**Called by:**
- `addOwnPath` (32)

**Calls:**
- `freeze` (31)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8045` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `runEditorTransaction` (1)

### `visitDescendantPaths`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/provenance.ts:45` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `retainOrigin` (1)

### `getDescendant`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:343` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `replaceCanonicalChildWindow` (1)

### `createDerivedBaseSchemaRecord`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `prepareEditorSchemaRecords` (1)

### `sliceMaterialized`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:789` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `between` (1)

### `addRange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:893` | Self: 0.0% (1.4ms) | Total: 0.0% (2.5ms) | Samples: 1

**Called by:**
- `(anonymous)` (2)

**Calls:**
- `isArray` (1)

### `applyIndexed`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2226` | Self: 0.0% (1.4ms) | Total: 1.1% (2.48s) | Samples: 1

**Called by:**
- `applyInternal` (1951)

**Calls:**
- `withText` (1319)
- `remember` (630)
- `remember` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:740` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `assertSelectionSupported`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:737` | Self: 0.0% (1.4ms) | Total: 0.0% (3.6ms) | Samples: 1

**Called by:**
- `setCurrentSelection` (2)
- `mapSelectionThroughChange` (1)

**Calls:**
- `isText` (1)
- `isText` (1)

### `getStructuralFingerprint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:131` | Self: 0.0% (1.4ms) | Total: 0.0% (2.9ms) | Samples: 1

**Called by:**
- `groupRelocationCandidates` (2)

**Calls:**
- `mixStructuralFingerprint` (1)

### `decodeNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:123` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `every` (1)

### `applyTrustedCanonical`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `applyDocumentChange` (1)

### `getSegmentRelocations`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:497` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `mapRelocatedPath` (1)

### `validateDeclarativeDocument`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3107` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `constructCanonicalDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `finalize` (1)

### `cloneFrozen`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:177` | Self: 0.0% (1.4ms) | Total: 0.5% (1.24s) | Samples: 1

**Called by:**
- `openToken` (613)
- `map` (236)
- `decodeNodes` (57)
- `decodeNodes` (44)
- `DocumentIndex` (22)
- `(anonymous)` (2)

**Calls:**
- `cloneJson` (664)
- `deepFreeze` (194)
- `cloneJson` (91)
- `cloneJson` (23)
- `fromEntries` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8019` | Self: 0.0% (1.4ms) | Total: 0.0% (2.5ms) | Samples: 1

**Called by:**
- `runEditorTransaction` (2)

**Calls:**
- `setCachedSnapshot` (1)

### `mapChangedNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1211` | Self: 0.0% (1.4ms) | Total: 0.0% (95.6ms) | Samples: 1

**Called by:**
- `mapSnapshotIndexThroughChange` (74)

**Calls:**
- `assignFreshNodeKey` (34)
- `assignFreshNodeKey` (28)
- `assignFreshNodeKey` (11)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1388` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `reduce` (1)

### `getExtensionRegistryStore`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:576` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `getExtensionRegistry` (1)

### `applyTrustedCanonical`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:705` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `applyDocumentChange` (1)

### `decodeNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:219` | Self: 0.0% (1.4ms) | Total: 0.0% (14.9ms) | Samples: 1

**Called by:**
- `(anonymous)` (12)

**Calls:**
- `cloneObject` (11)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:2180` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `runWithEditorExtensionPublicationGuard` (1)

### `replaceSnapshot`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `replaceEditorSnapshot` (1)

### `mapRange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:572` | Self: 0.0% (1.4ms) | Total: 0.0% (25.1ms) | Samples: 1

**Called by:**
- `mapSelectionWithContext` (20)

**Calls:**
- `mapPoint` (5)
- `mapPoint` (4)
- `mapPoint` (3)
- `mapPoint` (2)
- `mapPoint` (2)
- `mapPoint` (1)
- `mapPoint` (1)
- `mapPoint` (1)

### `validateTextProperties`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2391` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `validateDeclarativeNodeProperties` (1)

### `compose`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1083` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `apply` (1)

### `freezeRootClassification`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:302` | Self: 0.0% (1.4ms) | Total: 0.1% (222.4ms) | Samples: 1

**Called by:**
- `DocumentChange` (174)

**Calls:**
- `freeze` (173)

### `materializeCandidate`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `fit` (1)

### `openToken`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `decodeNodes` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `map` (1)

### `apply`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:432` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `applyCanonical` (1)

### `mergeRegistries`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:500` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `initializeBaseExtensionRegistry` (1)

### `applyTrustedCanonical`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:622` | Self: 0.0% (1.4ms) | Total: 0.0% (2.5ms) | Samples: 1

**Called by:**
- `applyDocumentChange` (2)

**Calls:**
- `set` (1)

### `isArrayPrototype`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:37` | Self: 0.0% (1.4ms) | Total: 0.5% (1.24s) | Samples: 1

**Called by:**
- `getEditorJsonArrayItems` (975)

**Calls:**
- `isObjectPrototype` (974)

### `replaceCanonicalChildWindow`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:890` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `getIndex`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:1100` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `apply` (1)

### `commitAnchorTransaction`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:457` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `getStructuralFingerprint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:153` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `getStructuralFingerprint` (1)

### `setCachedSnapshot`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:920` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `getSnapshot` (1)

### `hasInRoot`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:773` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `some` (1)

### `applyDocumentChangeValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1260` | Self: 0.0% (1.4ms) | Total: 0.0% (6.4ms) | Samples: 1

**Called by:**
- `applyDocumentChangeWithIndexes` (5)

**Calls:**
- `generatorResume` (2)
- `next` (1)
- `getInternalDocumentChangeEntries` (1)

### `runEditorTransaction`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8052` | Self: 0.0% (1.4ms) | Total: 0.0% (79.0ms) | Samples: 1

**Called by:**
- `withUpdateTagContext` (59)
- `replaceTransformedSnapshot` (3)
- `runTrustedUpdate` (1)

**Calls:**
- `(anonymous)` (16)
- `createEditorCommit` (16)
- `createEditorCommit` (11)
- `createEditorCommit` (5)
- `createEditorCommit` (5)
- `createEditorCommit` (4)
- `(anonymous)` (1)
- `createEditorCommit` (1)
- `(anonymous)` (1)
- `createEditorCommit` (1)
- `createEditorCommit` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-read-runtime.ts:322` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `path` (1)

### `assertExtensionPointIdentities`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:335` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `mergeRegistries` (1)

### `createInternalDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:570` | Self: 0.0% (1.4ms) | Total: 0.0% (2.8ms) | Samples: 1

**Called by:**
- `assertCanonical` (1)
- `apply` (1)

**Calls:**
- `Map` (1)

### `validateDeclarativeDocument`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3106` | Self: 0.0% (1.4ms) | Total: 8.4% (17.95s) | Samples: 1

**Called by:**
- `(anonymous)` (14024)

**Calls:**
- `validateDeclarativeChildren` (14023)

### `assertMappingLengths`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:403` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `advancePathStableSnapshotIndex` (1)

### `mapExternalRootSelection`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `fit` (1)

### `getLastCommit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts:455` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `assertRemoteCommit` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2258` | Self: 0.0% (1.4ms) | Total: 4.1% (8.87s) | Samples: 1

**Called by:**
- `applyIndexed` (6977)

**Calls:**
- `decodeNodes` (4089)
- `decodeNodes` (1519)
- `decodeNodes` (446)
- `decodeNodes` (276)
- `decodeNodes` (118)
- `decodeNodes` (109)
- `decodeNodes` (93)
- `decodeNodes` (86)
- `decodeNodes` (61)
- `decodeNodes` (40)
- `decodeNodes` (30)
- `decodeNodes` (24)
- `decodeNodes` (17)
- `decodeNodes` (14)
- `decodeNodes` (12)
- `decodeNodes` (12)
- `decodeNodes` (12)
- `decodeNodes` (5)
- `decodeNodes` (3)
- `decodeNodes` (3)
- `decodeNodes` (3)
- `decodeNodes` (1)
- `decodeNodes` (1)
- `decodeNodes` (1)
- `decodeNodes` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/history/history-extension.ts` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `readEditor` (1)

### `getElementContent`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:931` | Self: 0.0% (1.4ms) | Total: 0.0% (114.5ms) | Samples: 1

**Called by:**
- `canonicalizeDirectChildren` (88)
- `replaceCanonicalChildWindow` (3)

**Calls:**
- `performProxyObjectGet` (78)
- `bound get` (8)
- `getDeclarativeSchema` (4)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `filter` (1)

### `getMutationRoot`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `runTargetMutation` (1)

### `inheritDocumentChangeStepNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7233` | Self: 0.0% (1.4ms) | Total: 0.0% (2.4ms) | Samples: 1

**Called by:**
- `applyTransactionSpecDocumentChangeStep` (2)

**Calls:**
- `get` (1)

### `applyTransactionSpecContents`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `applyTransactionSpec` (1)

### `isPoint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/location.ts:62` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `path` (1)

### `createEditorDocumentValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:853` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `createEditorUpdateDraftContext` (1)

### `inheritDocumentChangeStepNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7318` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `applyTransactionSpecDocumentChangeStep` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1417` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `prepareFittedDocument` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1221` | Self: 0.0% (1.4ms) | Total: 0.0% (4.0ms) | Samples: 1

**Called by:**
- `constructCanonicalDocumentChange` (3)

**Calls:**
- `protectedInlineSpacersFor` (1)
- `protectedInlineSpacersFor` (1)

### `applyPreparedTransactionSpecChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5562` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `applyTransactionSpecContents` (1)

### `mapChangedNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1184` | Self: 0.0% (1.4ms) | Total: 0.0% (2.5ms) | Samples: 1

**Called by:**
- `mapSnapshotIndexThroughChange` (2)

**Calls:**
- `keyAt` (1)

### `classifyRootChangeWithRuntimeCandidates`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:224` | Self: 0.0% (1.4ms) | Total: 0.0% (150.4ms) | Samples: 1

**Called by:**
- `classify` (118)
- `apply` (2)

**Calls:**
- `freeze` (113)
- `performIteration` (6)

### `createEditorSchema`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:546` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `createEditorImplementation` (1)

### `runRemoteChangesSeparately`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:240` | Self: 0.0% (1.4ms) | Total: 27.6% (58.69s) | Samples: 1

**Called by:**
- `(anonymous)` (29229)
- `measureCohort` (16730)

**Calls:**
- `(host)` (45958)

### `constructCanonicalDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1205` | Self: 0.0% (1.4ms) | Total: 0.0% (131.6ms) | Samples: 1

**Called by:**
- `assertCanonical` (101)

**Calls:**
- `(anonymous)` (90)
- `(anonymous)` (7)
- `(anonymous)` (3)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1493` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `getCompiled` (1)

### `apply`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:407` | Self: 0.0% (1.4ms) | Total: 0.0% (6.6ms) | Samples: 1

**Called by:**
- `applyCanonical` (4)
- `(anonymous)` (1)

**Calls:**
- `generatorResume` (4)

### `finalizeTransactionRepresentation`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5389` | Self: 0.0% (1.4ms) | Total: 0.6% (1.43s) | Samples: 1

**Called by:**
- `runEditorTransaction` (1133)

**Calls:**
- `finalize` (1130)
- `finalize` (1)
- `finalize` (1)

### `finalizeExtensionRegistry`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `createEditorImplementation` (1)

### `resolveExtensionOrder`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `prepareScopedEditorExtensionPublication` (1)

### `getStructuralFingerprint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `getStructuralFingerprint` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:373` | Self: 0.0% (1.4ms) | Total: 0.0% (1.4ms) | Samples: 1

**Called by:**
- `replaceIndexedChildren` (1)

### `SectionIterator`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:494` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `composeSections` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:154` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `every` (1)

### `replaceCanonicalChildWindow`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:874` | Self: 0.0% (1.3ms) | Total: 0.0% (2.7ms) | Samples: 1

**Called by:**
- `(anonymous)` (2)

**Calls:**
- `slice` (1)

### `selectionPositionEquals`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6213` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `createEditorUpdateDraftContext`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7656` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `runEditorTransaction` (1)

### `applyDocumentChangeValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1290` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `applyDocumentChangeWithIndexes` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1750` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `map` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6748` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `filter` (1)

### `groupRelocationCandidates`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:169` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `deriveRootRelocations` (1)

### `isEditorExtension`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `comparePathsDeepestFirst`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:585` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `sort` (1)

### `from`
`[native code]` | Self: 0.0% (1.3ms) | Total: 0.0% (40.4ms) | Samples: 1

**Called by:**
- `createEditorWithDocument` (16)
- `measureAnchors` (8)
- `(anonymous)` (2)
- `from` (2)
- `compileRemoteChanges` (2)
- `diffChildren` (2)

**Calls:**
- `(anonymous)` (16)
- `createAnchor` (4)
- `paragraph` (3)
- `createAnchor` (2)
- `from` (2)
- `createAnchor` (1)
- `continuityScore` (1)
- `(anonymous)` (1)
- `continuityScore` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:47` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `every` (1)

### `validateDeclarativeDocument`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3041` | Self: 0.0% (1.3ms) | Total: 0.0% (4.9ms) | Samples: 1

**Called by:**
- `(anonymous)` (4)

**Calls:**
- `getElementOwnedRootIssues` (2)
- `freeze` (1)

### `advancePathStableSnapshotIndex`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1792` | Self: 0.0% (1.3ms) | Total: 0.0% (29.3ms) | Samples: 1

**Called by:**
- `inheritDocumentChangeStepNodeKeys` (21)

**Calls:**
- `setNodeKey` (6)
- `setNodeKey` (5)
- `setNodeKey` (4)
- `setNodeKey` (4)
- `setNodeKey` (1)

### `DocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:761` | Self: 0.0% (1.3ms) | Total: 0.0% (2.8ms) | Samples: 1

**Called by:**
- `constructDocumentChange` (2)

**Calls:**
- `freeze` (1)

### `createEditorCommit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:993` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `runEditorTransaction` (1)

### `invert`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `addParentIndex`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `addOwnPath` (1)

### `next`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:545` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `forwardOutput` (1)

### `getDescendant`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:347` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `replaceCanonicalChildWindow` (1)

### `compileEditorUpdatePolicy`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/update-policy.ts:72` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `update` (1)

### `getTransactionView`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6435` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `runEditorTransaction` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:355` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `replaceIndexedChildren` (1)

### `snapshotEditorJsonValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:296` | Self: 0.0% (1.3ms) | Total: 0.0% (12.2ms) | Samples: 1

**Called by:**
- `(anonymous)` (10)

**Calls:**
- `WeakSet` (9)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8021` | Self: 0.0% (1.3ms) | Total: 0.0% (2.6ms) | Samples: 1

**Called by:**
- `runEditorTransaction` (2)

**Calls:**
- `keys` (1)

### `measureConnectDisconnectHeap`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `measureCohort` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3488` | Self: 0.0% (1.3ms) | Total: 0.0% (18.2ms) | Samples: 1

**Called by:**
- `iterChangedRanges` (14)

**Calls:**
- `nodeRangesTouching` (12)
- `flat` (1)

### `prepareFittedDocument`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1415` | Self: 0.0% (1.3ms) | Total: 1.6% (3.55s) | Samples: 1

**Called by:**
- `fit` (2796)

**Calls:**
- `finalize` (2790)
- `(anonymous)` (1)
- `finalize` (1)
- `finalize` (1)
- `finalize` (1)
- `finalize` (1)

### `applyAnchorChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:292` | Self: 0.0% (1.3ms) | Total: 0.0% (2.5ms) | Samples: 1

**Called by:**
- `notifyAnchorChanges` (2)

**Calls:**
- `performProxyObjectGet` (1)

### `pushUpdateTagContext`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/update-context.ts:20` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `withUpdateTagContext` (1)

### `isNode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:167` | Self: 0.0% (1.3ms) | Total: 0.1% (212.6ms) | Samples: 1

**Called by:**
- `root` (159)
- `normalizeSelectionRoot` (4)
- `getSelectionRanges` (3)
- `assertSelectionSupported` (2)
- `mapSelectionWithContext` (1)

**Calls:**
- `hasOnlyKeys` (163)
- `hasOnlyKeys` (5)

### `applyTrustedCanonical`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:558` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `applyDocumentChange` (1)

### `getCurrentRootSnapshot`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6708` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `runEditorTransaction` (1)

### `mergeCommandRegistries`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `mergeRegistries` (1)

### `createCallableGroup`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-lifecycle-api.ts:250` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `createEditorReadApi` (1)

### `isPoint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/point.ts:88` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `isRange` (1)

### `commonSuffixLength`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `between` (1)

### `textFor`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `paragraph` (1)

### `fromTokens`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:659` | Self: 0.0% (1.3ms) | Total: 2.3% (4.92s) | Samples: 1

**Called by:**
- `encodeNodes` (2324)
- `decodeNodes` (1556)

**Calls:**
- `PreparedTokenSlice` (1823)
- `PreparedTokenSlice` (1230)
- `PreparedTokenSlice` (434)
- `PreparedTokenSlice` (139)
- `PreparedTokenSlice` (105)
- `PreparedTokenSlice` (88)
- `PreparedTokenSlice` (46)
- `PreparedTokenSlice` (12)
- `PreparedTokenSlice` (2)

### `construct`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `finalize` (1)

### `applyTransactionSpecDocumentChangeStep`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7328` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `applyDocumentChange` (1)

### `cache`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1477` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `mapSnapshotIndexThroughChange` (1)

### `composeSections`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:681` | Self: 0.0% (1.3ms) | Total: 0.0% (3.8ms) | Samples: 1

**Called by:**
- `compose` (3)

**Calls:**
- `forwardOutput` (2)

### `reconcileExclusiveElementOwnedRoots`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5410` | Self: 0.0% (1.3ms) | Total: 0.0% (9.8ms) | Samples: 1

**Called by:**
- `runEditorTransaction` (4)
- `runEditorTransaction` (2)
- `runEditorTransaction` (1)
- `runEditorTransaction` (1)

**Calls:**
- `getOrphanedElementOwnedRoots` (3)
- `freeze` (3)
- `getOrphanedElementOwnedRoots` (1)

### `classifyRootChangeWithRuntimeCandidates`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:164` | Self: 0.0% (1.3ms) | Total: 0.0% (49.9ms) | Samples: 1

**Called by:**
- `classify` (39)

**Calls:**
- `freeze` (38)

### `assertEffectType`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `registerEffectTypeInRegistry` (1)

### `classifyDocumentRange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:61` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `classifyRootChangeWithRuntimeCandidates` (1)

### `mixStructuralFingerprintString`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:87` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `getStructuralFingerprint` (1)

### `fit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1696` | Self: 0.0% (1.3ms) | Total: 0.2% (635.5ms) | Samples: 1

**Called by:**
- `fitRoot` (330)
- `(anonymous)` (169)

**Calls:**
- `fitClosedSliceInterior` (498)

### `strict`
`node:assert:586` | Self: 0.0% (1.3ms) | Total: 0.0% (2.5ms) | Samples: 1

**Called by:**
- `assertRemoteCommit` (2)

**Calls:**
- `innerOk` (1)

### `mapSnapshotIndexThroughChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1387` | Self: 0.0% (1.3ms) | Total: 0.0% (9.8ms) | Samples: 1

**Called by:**
- `inheritDocumentChangeStepNodeKeys` (8)

**Calls:**
- `performIteration` (7)

### `rootCanContain`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1844` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `every` (1)

### `encode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:872` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `forEach` (1)

### `assertDocument`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3150` | Self: 0.0% (1.3ms) | Total: 23.7% (50.44s) | Samples: 1

**Called by:**
- `validate` (37809)
- `fitDocumentInput` (1041)
- `buildConfiguredRegistry` (343)
- `validateCandidateDocument` (301)

**Calls:**
- `(anonymous)` (18133)
- `(anonymous)` (8839)
- `(anonymous)` (8304)
- `(anonymous)` (4214)
- `(anonymous)` (2)
- `(anonymous)` (1)

### `getChangeValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6749` | Self: 0.0% (1.3ms) | Total: 0.0% (2.7ms) | Samples: 1

**Called by:**
- `createEditorUpdateDraftContext` (1)
- `reconcileExclusiveElementOwnedRoots` (1)

**Calls:**
- `sort` (1)

### `classifyRootChangeWithRuntimeCandidates`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:159` | Self: 0.0% (1.3ms) | Total: 0.0% (31.6ms) | Samples: 1

**Called by:**
- `classify` (24)
- `apply` (1)

**Calls:**
- `stringify` (24)

### `createEditorUpdateDraftContext`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7640` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `runEditorTransaction` (1)

### `finalizeCommandRegistry`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:259` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `finalizeExtensionRegistry` (1)

### `DocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:734` | Self: 0.0% (1.3ms) | Total: 0.6% (1.46s) | Samples: 1

**Called by:**
- `constructDocumentChange` (1150)

**Calls:**
- `freezeRootClassification` (595)
- `freezeRootClassification` (315)
- `freezeRootClassification` (174)
- `freezeRootClassification` (59)
- `freezeRootClassification` (5)
- `freeze` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:337` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `map` (1)

### `createTreeIndexChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:53` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `replaceIndexedChildren` (1)

### `createEditorDocumentChangeBuilder`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6839` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `createEditorUpdateDraftContext` (1)

### `createEditorSchema`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `createEditorImplementation` (1)

### `createEditorDocumentValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:843` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `setCurrentSelection` (1)

### `getUpdateView`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:3926` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `replaceCanonicalChildWindow`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:920` | Self: 0.0% (1.3ms) | Total: 0.0% (2.6ms) | Samples: 1

**Called by:**
- `(anonymous)` (2)

**Calls:**
- `some` (1)

### `path`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/editor.ts:4650` | Self: 0.0% (1.3ms) | Total: 0.0% (2.7ms) | Samples: 1

**Called by:**
- `above` (1)
- `node` (1)

**Calls:**
- `path` (1)

### `validateDeclarativeDocument`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3108` | Self: 0.0% (1.3ms) | Total: 0.6% (1.46s) | Samples: 1

**Called by:**
- `(anonymous)` (1144)

**Calls:**
- `validateDeclarativeRootContent` (1022)
- `validateDeclarativeRootContent` (121)

### `validateDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3622` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `getStructuralFingerprint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:124` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `groupRelocationCandidates` (1)

### `classifyRootChangeWithRuntimeCandidates`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:219` | Self: 0.0% (1.3ms) | Total: 0.0% (151.9ms) | Samples: 1

**Called by:**
- `classify` (119)
- `apply` (2)

**Calls:**
- `freeze` (115)
- `performIteration` (5)

### `isRange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/location.ts:66` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `path` (1)

### `compileEditorUpdatePolicy`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/update-policy.ts:84` | Self: 0.0% (1.3ms) | Total: 0.0% (4.2ms) | Samples: 1

**Called by:**
- `update` (3)

**Calls:**
- `freeze` (2)

### `collectRelocationCandidates`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:209` | Self: 0.0% (1.3ms) | Total: 0.0% (169.9ms) | Samples: 1

**Called by:**
- `deriveRootRelocations` (113)
- `deriveRootRelocations` (20)

**Calls:**
- `freeze` (132)

### `update`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-lifecycle-api.ts:411` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `(host)` (1)

### `apply`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:399` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `applyCanonical` (1)

### `resolveMappedPoint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts:406` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `map` (1)

### `node`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `advancePathStableSnapshotIndex` (1)

### `isInTransaction`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:742` | Self: 0.0% (1.3ms) | Total: 0.0% (2.7ms) | Samples: 1

**Called by:**
- `assertActiveTransaction` (1)
- `updateEditor` (1)

**Calls:**
- `getEditorTransactionDepth` (1)

### `finalize`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `prepareFittedDocument` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2622` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `forEach` (1)

### `ChangeDraft`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:179` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `createEditorDocumentChangeBuilder` (1)

### `pathOf`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1699` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `mapPoint` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:81` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `sort` (1)

### `materializeTokens`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:527` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `sliceMaterialized` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:238` | Self: 0.0% (1.3ms) | Total: 0.0% (12.5ms) | Samples: 1

**Called by:**
- `map` (9)

**Calls:**
- `cloneEditorJsonValue` (4)
- `cloneEditorJsonValue` (3)
- `cloneEditorJsonValue` (1)

### `classifyRootChangeWithRuntimeCandidates`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:176` | Self: 0.0% (1.3ms) | Total: 0.0% (61.9ms) | Samples: 1

**Called by:**
- `classify` (32)
- `apply` (17)

**Calls:**
- `classifyDocumentRange` (26)
- `classifyDocumentRange` (13)
- `classifyDocumentRange` (2)
- `classifyDocumentRange` (2)
- `classifyDocumentRange` (1)
- `classifyDocumentRange` (1)
- `classifyDocumentRange` (1)
- `classifyDocumentRange` (1)
- `classifyDocumentRange` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `publishConfiguredExtensionRegistry` (1)

### `updateIndexedNode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:350` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `withText` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7988` | Self: 0.0% (1.3ms) | Total: 0.0% (23.6ms) | Samples: 1

**Called by:**
- `withExtensionPublicationRollback` (19)

**Calls:**
- `publishTransactionDraft` (12)
- `publishTransactionDraft` (6)

### `mapPoint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:449` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `mapRange` (1)

### `getDescendant`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:508` | Self: 0.0% (1.3ms) | Total: 0.0% (1.3ms) | Samples: 1

**Called by:**
- `validateDocumentChange` (1)

### `get empty`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:827` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `mapSelectionThroughChange` (1)

### `getStateView`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:3102` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `getUpdateView` (1)

### `continuityScore`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:942` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `from` (1)

### `validateDeclarativeDocument`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3048` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `encode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `forEach` (1)

### `applyInternal`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2541` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `apply` (1)

### `protectedInlineSpacersFor`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1019` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `childBoundaryAt`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:122` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `applyIndexed` (1)

### `collectRelocationCandidates`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:202` | Self: 0.0% (1.2ms) | Total: 0.0% (20.8ms) | Samples: 1

**Called by:**
- `deriveRootRelocations` (14)
- `deriveRootRelocations` (2)

**Calls:**
- `nodeRangesTouching` (9)
- `nodeRangesTouching` (5)
- `flat` (1)

### `assertSelectionSupported`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:702` | Self: 0.0% (1.2ms) | Total: 0.0% (7.8ms) | Samples: 1

**Called by:**
- `setCurrentSelection` (3)
- `mapSelectionThroughChange` (3)

**Calls:**
- `assertBuiltInSelection` (5)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/provenance.ts:52` | Self: 0.0% (1.2ms) | Total: 0.0% (7.8ms) | Samples: 1

**Called by:**
- `forEach` (6)

**Calls:**
- `isElement` (5)

### `updateIndexedNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:447` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `withNodeUpdates` (1)

### `validateDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3634` | Self: 0.0% (1.2ms) | Total: 0.0% (41.5ms) | Samples: 1

**Called by:**
- `(anonymous)` (33)

**Calls:**
- `isRecursivelyValidated` (15)
- `isRecursivelyValidated` (15)
- `isRecursivelyValidated` (2)

### `createEditorImplementation`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `createEditorWithDocument` (1)

### `getValidationAuthority`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:555` | Self: 0.0% (1.2ms) | Total: 0.0% (3.6ms) | Samples: 1

**Called by:**
- `rememberValidatedDocumentRoots` (3)

**Calls:**
- `getDeclarativeSchema` (2)

### `node:fs/promises`
`node:fs/promises:2` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `anonymous` (1)

### `claim`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1014` | Self: 0.0% (1.2ms) | Total: 0.0% (29.5ms) | Samples: 1

**Called by:**
- `mapChangedNodeKeys` (23)

**Calls:**
- `node` (21)
- `nodeAtPath` (1)

### `applyTransactionSpecDocumentChangeStep`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7343` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `applyDocumentChange` (1)

### `internal:fs/streams`
`internal:fs/streams:2` | Self: 0.0% (1.2ms) | Total: 0.0% (2.3ms) | Samples: 1

**Called by:**
- `anonymous` (2)

**Calls:**
- `anonymous` (1)

### `mapPathForward`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:582` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `update`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-lifecycle-api.ts:422` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `(host)` (1)

### `reconcileExclusiveElementOwnedRoots`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5407` | Self: 0.0% (1.2ms) | Total: 0.0% (11.7ms) | Samples: 1

**Called by:**
- `runEditorTransaction` (7)
- `runEditorTransaction` (1)
- `runEditorTransaction` (1)

**Calls:**
- `getChangeValue` (4)
- `getChangeValue` (2)
- `getChangeValue` (1)
- `getChangeValue` (1)

### `comparePaths`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:857` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `sort` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:114` | Self: 0.0% (1.2ms) | Total: 0.0% (24.9ms) | Samples: 1

**Called by:**
- `map` (20)

**Calls:**
- `snapshotEditorJsonValue` (10)
- `snapshotEditorJsonValue` (7)
- `clone` (2)

### `isObject`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/is-object.ts:4` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `isText` (1)

### `replaceCanonicalChildWindow`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:875` | Self: 0.0% (1.2ms) | Total: 0.0% (44.2ms) | Samples: 1

**Called by:**
- `(anonymous)` (34)

**Calls:**
- `canonicalizeDeclarativeChildren` (33)

### `nodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `indexAnchorListener` (1)

### `assertOwnJsonProperties`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `validateDocumentChange` (1)

### `isRecord`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:53` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `assertSelectionSupported` (1)

### `canonicalizeInlineChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:105` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `canonicalizeNode` (1)

### `createEditorReadRuntime`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-read-runtime.ts` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `createEditorImplementation` (1)

### `createPathStableMappingSegment`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:426` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `compactMappingSegments` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:63` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `map` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:95` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `forEach` (1)

### `get`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts:596` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `performProxyObjectGet` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:290` | Self: 0.0% (1.2ms) | Total: 0.0% (50.6ms) | Samples: 1

**Called by:**
- `every` (40)

**Calls:**
- `every` (39)

### `applyTransactionSpecDocumentChangeStep`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7401` | Self: 0.0% (1.2ms) | Total: 0.0% (3.9ms) | Samples: 1

**Called by:**
- `applyDocumentChange` (3)

**Calls:**
- `transformImplicitTarget` (2)

### `sealElementOwnedRootIndex`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:1085` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `rememberValidatedDocumentRoots` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1372` | Self: 0.0% (1.2ms) | Total: 0.0% (5.0ms) | Samples: 1

**Called by:**
- `flatIntoArrayWithCallback` (4)

**Calls:**
- `mapPathForward` (1)
- `mapPathForward` (1)
- `mapPathForward` (1)

### `assertSelectionSupported`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:682` | Self: 0.0% (1.2ms) | Total: 0.0% (2.5ms) | Samples: 1

**Called by:**
- `mapSelectionThroughChange` (2)

**Calls:**
- `isRecord` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1780` | Self: 0.0% (1.2ms) | Total: 0.3% (844.4ms) | Samples: 1

**Called by:**
- `map` (664)

**Calls:**
- `canonicalizeDeclarativePropertyRecord` (180)
- `canonicalizeDeclarativePropertyRecord` (107)
- `canonicalizeDeclarativePropertyRecord` (99)
- `canonicalizeDeclarativePropertyRecord` (82)
- `canonicalizeDeclarativePropertyRecord` (60)
- `canonicalizeDeclarativePropertyRecord` (53)
- `canonicalizeDeclarativePropertyRecord` (32)
- `canonicalizeDeclarativePropertyRecord` (17)
- `canonicalizeDeclarativePropertyRecord` (15)
- `canonicalizeDeclarativePropertyRecord` (10)
- `canonicalizeDeclarativePropertyRecord` (8)

### `getIndex`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:1096` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `apply` (1)

### `getStructuralFingerprint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:132` | Self: 0.0% (1.2ms) | Total: 0.0% (2.7ms) | Samples: 1

**Called by:**
- `groupRelocationCandidates` (2)

**Calls:**
- `mixStructuralFingerprint` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1084` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `map` (1)

### `invert`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2698` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `rawNodeAt`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:102` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `mapPoint` (1)

### `runEditorTransaction`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7825` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `withUpdateTagContext` (1)

### `iterChangedRanges`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2791` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `mapPoint` (1)

### `validateDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3674` | Self: 0.0% (1.2ms) | Total: 0.0% (4.9ms) | Samples: 1

**Called by:**
- `(anonymous)` (4)

**Calls:**
- `isElement` (3)

### `positionWasReplaced`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:558` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `mapPathForward` (1)

### `runEditorTransaction`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7795` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `withUpdateTagContext` (1)

### `jsonEqual`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:131` | Self: 0.0% (1.2ms) | Total: 0.0% (83.4ms) | Samples: 1

**Called by:**
- `every` (63)
- `between` (1)

**Calls:**
- `every` (63)

### `canonicalizeInlineChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:130` | Self: 0.0% (1.2ms) | Total: 0.0% (6.3ms) | Samples: 1

**Called by:**
- `canonicalizeNode` (5)

**Calls:**
- `next` (4)

### `applyDocumentChangeValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1255` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `applyDocumentChangeWithIndexes` (1)

### `getUpdateView`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4675` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:855` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `filter` (1)

### `freezeReadonlySet`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:234` | Self: 0.0% (1.2ms) | Total: 0.0% (13.3ms) | Samples: 1

**Called by:**
- `DocumentChange` (8)
- `DocumentChange` (2)

**Calls:**
- `Set` (9)

### `addChildWindow`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:786` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `rememberValidatedDocumentRoots`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3133` | Self: 0.0% (1.2ms) | Total: 3.7% (7.85s) | Samples: 1

**Called by:**
- `(anonymous)` (3385)
- `adoptDocumentBaseline` (2780)

**Calls:**
- `every` (6164)

### `replaceIndexedChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:286` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `withText` (1)

### `addSection`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:594` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `composeSections` (1)

### `getInternalDocumentChangeEntries`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:535` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `generatorResume` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7533` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `notifyListeners` (1)

### `visitDeclarative`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `forEach` (1)

### `isPoint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/point.ts:90` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `isRange` (1)

### `decodeNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:200` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `findChildIndexAtPosition`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:78` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `childBoundaryAt` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8082` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `runEditorTransaction` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2376` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `map` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2672` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `forEach` (1)

### `getProperties`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:885` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `continuityScore` (1)

### `isRecursivelyValidated`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3547` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `validateDocumentChange` (1)

### `setNodeKey`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:160` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `advancePathStableSnapshotIndex` (1)

### `construct`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6875` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `finalize` (1)

### `createExtensionRecord`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:370` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `replaceIndexedChildren` (1)

### `innerOk`
`internal:assert/utils:9` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `strict` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1054` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `map` (1)

### `valueRoot`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:312` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `applyDocumentChangeValue` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:98` | Self: 0.0% (1.2ms) | Total: 0.0% (165.3ms) | Samples: 1

**Called by:**
- `map` (130)

**Calls:**
- `getEditorJsonRecordEntries` (86)
- `getEditorJsonRecordEntries` (36)
- `getEditorJsonRecordEntries` (5)
- `getEditorJsonRecordEntries` (2)

### `createWrappedContent`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:354` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `fitClosedContent` (1)

### `visit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:1830` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `validateCompleteExtensionGraph` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7543` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `notifyListeners` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:91` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `map` (1)

### `freezeIndex`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:357` | Self: 0.0% (1.2ms) | Total: 0.0% (4.0ms) | Samples: 1

**Called by:**
- `(anonymous)` (3)

**Calls:**
- `freeze` (2)

### `runEditorTransaction`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7834` | Self: 0.0% (1.2ms) | Total: 0.0% (2.5ms) | Samples: 1

**Called by:**
- `withUpdateTagContext` (2)

**Calls:**
- `get empty` (1)

### `visitDeclarative`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2772` | Self: 0.0% (1.2ms) | Total: 0.0% (93.0ms) | Samples: 1

**Called by:**
- `forEach` (73)

**Calls:**
- `performProxyObjectGet` (64)
- `bound get` (8)

### `writer`
`[native code]` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `WriteStream` (1)

### `addTouching`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:941` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `createEditorCommit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:1004` | Self: 0.0% (1.2ms) | Total: 0.0% (5.7ms) | Samples: 1

**Called by:**
- `runEditorTransaction` (5)

**Calls:**
- `freeze` (4)

### `read`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-lifecycle-api.ts:214` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `(host)` (1)

### `constructCanonicalDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1042` | Self: 0.0% (1.2ms) | Total: 0.0% (4.9ms) | Samples: 1

**Called by:**
- `assertCanonical` (4)

**Calls:**
- `performIteration` (3)

### `groupRelocationCandidates`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:162` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `deriveRootRelocations` (1)

### `path`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-read-runtime.ts` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `node` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1178` | Self: 0.0% (1.2ms) | Total: 0.0% (3.8ms) | Samples: 1

**Called by:**
- `iterChangedRanges` (3)

**Calls:**
- `nodeAtPath` (2)

### `fit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1649` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts:438` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `mapExternalRootSelection` (1)

### `Error`
`[native code]` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `PreparedTokenSliceStructureError` (1)

### `appendNode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:106` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `decodeNodes` (1)

### `composeSections`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:606` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `compose` (1)

### `sliceMaterialized`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:784` | Self: 0.0% (1.2ms) | Total: 0.0% (2.5ms) | Samples: 1

**Called by:**
- `between` (2)

**Calls:**
- `materializeTokens` (1)

### `pushUpdateTagContext`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/update-context.ts:17` | Self: 0.0% (1.2ms) | Total: 0.0% (8.7ms) | Samples: 1

**Called by:**
- `withUpdateTagContext` (7)

**Calls:**
- `freeze` (2)
- `performIteration` (2)
- `reduceEditorUpdateTags` (2)

### `classifyRootChangeWithRuntimeCandidates`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:177` | Self: 0.0% (1.2ms) | Total: 0.3% (733.1ms) | Samples: 1

**Called by:**
- `classify` (562)
- `apply` (10)

**Calls:**
- `classifyDocumentRange` (245)
- `classifyDocumentRange` (205)
- `classifyDocumentRange` (47)
- `classifyDocumentRange` (28)
- `classifyDocumentRange` (18)
- `classifyDocumentRange` (8)
- `classifyDocumentRange` (6)
- `classifyDocumentRange` (4)
- `classifyDocumentRange` (4)
- `classifyDocumentRange` (4)
- `classifyDocumentRange` (2)

### `get tokens`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:523` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `sliceMaterialized` (1)

### `closeScopedTransactionAnchors`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:603` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `disposeTransactionSpecContext` (1)

### `applyIndexed`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2210` | Self: 0.0% (1.2ms) | Total: 0.0% (2.2ms) | Samples: 1

**Called by:**
- `applyInternal` (2)

**Calls:**
- `every` (1)

### `applyAnchorChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:317` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `notifyAnchorChanges` (1)

### `getActiveAnchorState`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:80` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `notifyAnchorChanges` (1)

### `createEditorDocumentValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:854` | Self: 0.0% (1.2ms) | Total: 0.0% (2.7ms) | Samples: 1

**Called by:**
- `createEditorUpdateDraftContext` (1)
- `setCurrentSelection` (1)

**Calls:**
- `entries` (1)

### `decodeNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:206` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `bind`
`[native code]` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `performProxyObjectGet` (1)

### `applyTransactionSpecDocumentChangeStep`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7409` | Self: 0.0% (1.2ms) | Total: 0.0% (1.2ms) | Samples: 1

**Called by:**
- `applyDocumentChange` (1)

### `isEditorJsonValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:122` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `assertJsonValue` (1)

### `enterEditorRead`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:754` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `readEditor` (1)

### `applyCanonical`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `applyDocumentChange` (1)

### `setSelectionValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6140` | Self: 0.0% (1.1ms) | Total: 0.0% (5.9ms) | Samples: 1

**Called by:**
- `setCurrentSelection` (5)

**Calls:**
- `structuredClone` (4)

### `normalizeEditorValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/initial-value.ts` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `initializePublicState` (1)

### `openToken`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:293` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `encode` (1)

### `paragraph`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:63` | Self: 0.0% (1.1ms) | Total: 0.0% (22.6ms) | Samples: 1

**Called by:**
- `(anonymous)` (15)
- `from` (3)

**Calls:**
- `textFor` (16)
- `textFor` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3577` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `sort` (1)

### `resolveLatestExtensionEntries`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `prepareScopedEditorExtensionPublication` (1)

### `getStructuralFingerprint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:116` | Self: 0.0% (1.1ms) | Total: 0.0% (3.6ms) | Samples: 1

**Called by:**
- `getStructuralFingerprint` (3)

**Calls:**
- `mixStructuralFingerprint` (2)

### `replacements`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `movedNode` (1)

### `sliceMaterialized`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:783` | Self: 0.0% (1.1ms) | Total: 0.0% (2.4ms) | Samples: 1

**Called by:**
- `between` (2)

**Calls:**
- `get tokens` (1)

### `createCommitChanged`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:952` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `createEditorCommit` (1)

### `recordStats`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2570` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `applyInternal` (1)

### `canonicalizeNode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:245` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `map` (1)

### `withInsertedNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2736` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `getSelectionStateSelection`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-state.ts:11` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `getCurrentSelection` (1)

### `isTextNode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `encode` (1)

### `fit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3008` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `fit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1650` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `mapPosition`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1169` | Self: 0.0% (1.1ms) | Total: 0.0% (9.3ms) | Samples: 1

**Called by:**
- `mapPoint` (2)
- `resolveMappedPoint` (1)

**Calls:**
- `performProxyObjectGet` (2)

### `mapSelectionThroughChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:891` | Self: 0.0% (1.1ms) | Total: 0.0% (2.4ms) | Samples: 1

**Called by:**
- `applyTransactionSpecDocumentChangeStep` (2)

**Calls:**
- `isRange` (1)

### `fit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1762` | Self: 0.0% (1.1ms) | Total: 0.0% (2.2ms) | Samples: 1

**Called by:**
- `(anonymous)` (2)

**Calls:**
- `(anonymous)` (1)

### `childBoundaryAt`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:115` | Self: 0.0% (1.1ms) | Total: 0.0% (2.4ms) | Samples: 1

**Called by:**
- `(anonymous)` (2)

**Calls:**
- `findChildIndexAtPosition` (1)

### `visitDeclarative`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2823` | Self: 0.0% (1.1ms) | Total: 0.0% (100.8ms) | Samples: 1

**Called by:**
- `forEach` (81)

**Calls:**
- `forEach` (80)

### `applyTransactionSpecDocumentChangeStep`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7334` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `applyDocumentChange` (1)

### `createCommitChanged`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:404` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `createEditorCommit` (1)

### `validateDeclarativeDocument`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3068` | Self: 0.0% (1.1ms) | Total: 0.0% (5.2ms) | Samples: 1

**Called by:**
- `(anonymous)` (4)

**Calls:**
- `performProxyObjectGet` (3)

### `applyTransactionSpecDocumentChangeStep`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7350` | Self: 0.0% (1.1ms) | Total: 0.0% (22.3ms) | Samples: 1

**Called by:**
- `applyDocumentChange` (18)

**Calls:**
- `structuredClone` (17)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:316` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `map` (1)

### `collect`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:80` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `claimSource` (1)

### `validateDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3633` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `getStructuralFingerprint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:115` | Self: 0.0% (1.1ms) | Total: 0.0% (3.8ms) | Samples: 1

**Called by:**
- `getStructuralFingerprint` (3)

**Calls:**
- `mixStructuralFingerprint` (2)

### `addSection`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:583` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `create` (1)

### `replacements`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2450` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `movedNode` (1)

### `apply`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:464` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `prepareFittedDocument` (1)

### `mapPoint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `mapRange` (1)

### `fitDocument`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `decodeNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:170` | Self: 0.0% (1.1ms) | Total: 0.0% (5.8ms) | Samples: 1

**Called by:**
- `(anonymous)` (5)

**Calls:**
- `claimSource` (2)
- `claimSource` (2)

### `cleanup`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `finalizeTransactionSpecContext`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5441` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `buildTransactionSpec` (1)

### `addRange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:887` | Self: 0.0% (1.1ms) | Total: 0.0% (20.2ms) | Samples: 1

**Called by:**
- `(anonymous)` (16)

**Calls:**
- `nodeRangesTouching` (13)
- `flat` (2)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:53` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `every` (1)

### `mapIndex`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7273` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `inheritDocumentChangeStepNodeKeys` (1)

### `positionAt`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `mapSelectionThroughChange` (1)

### `fit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1739` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `fitRoot` (1)

### `classifyRootChangeWithRuntimeCandidates`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:124` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `apply` (1)

### `withEditorUpdateRoot`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:715` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `get empty`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2022` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `compose` (1)

### `classifyDocumentRange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:41` | Self: 0.0% (1.1ms) | Total: 0.0% (37.9ms) | Samples: 1

**Called by:**
- `classifyRootChangeWithRuntimeCandidates` (28)
- `classifyRootChangeWithRuntimeCandidates` (2)

**Calls:**
- `nodeRangesTouching` (26)
- `flat` (2)
- `nodeRangesTouching` (1)

### `advanceNextNodeKey`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:129` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `setNodeKey` (1)

### `fitRoot`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3225` | Self: 0.0% (1.1ms) | Total: 6.2% (13.17s) | Samples: 1

**Called by:**
- `fitDocumentInput` (7524)
- `fitDocumentInput` (2847)

**Calls:**
- `fit` (5526)
- `fit` (1491)
- `fit` (1365)
- `fit` (509)
- `closed` (439)
- `fit` (336)
- `fit` (330)
- `fit` (150)
- `fit` (136)
- `snapshot` (40)
- `fit` (19)
- `fit` (16)
- `fit` (2)
- `fit` (2)
- `fit` (2)
- `fit` (2)
- `fit` (1)
- `fit` (1)
- `fit` (1)
- `fit` (1)
- `fit` (1)

### `compileEditorSchemaInternal`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `getDerivedBaseSchema` (1)

### `constructCanonicalDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1004` | Self: 0.0% (1.1ms) | Total: 0.0% (6.2ms) | Samples: 1

**Called by:**
- `assertCanonical` (5)

**Calls:**
- `performIteration` (3)
- `map` (1)

### `constructDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:766` | Self: 0.0% (1.1ms) | Total: 0.7% (1.53s) | Samples: 1

**Called by:**
- `createInternalDocumentChange` (1200)
- `classify` (1)
- `apply` (1)

**Calls:**
- `DocumentChange` (1150)
- `DocumentChange` (11)
- `DocumentChange` (9)
- `DocumentChange` (5)
- `DocumentChange` (5)
- `DocumentChange` (4)
- `DocumentChange` (4)
- `DocumentChange` (3)
- `DocumentChange` (3)
- `DocumentChange` (2)
- `DocumentChange` (2)
- `DocumentChange` (2)
- `DocumentChange` (1)

### `validateDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3651` | Self: 0.0% (1.1ms) | Total: 0.0% (78.2ms) | Samples: 1

**Called by:**
- `(anonymous)` (61)

**Calls:**
- `getDescendant` (45)
- `getDescendant` (7)
- `getDescendant` (4)
- `getDescendant` (4)

### `visit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:185` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `nodeRangesTouching` (1)

### `getTransactionView`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6429` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `runEditorTransaction` (1)

### `toSchemaValidationLocation`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:382` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `mapChangedNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1042` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `mapSnapshotIndexThroughChange` (1)

### `mergeRegistries`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:534` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `createExtensionRegistryStore` (1)

### `createCommitChanged`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:407` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `createEditorCommit` (1)

### `concat`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:675` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `addSection` (1)

### `getTransactionView`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `runEditorTransaction` (1)

### `advancePathStableSnapshotIndex`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1825` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `inheritDocumentChangeStepNodeKeys` (1)

### `constructCanonicalDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1147` | Self: 0.0% (1.1ms) | Total: 0.0% (32.1ms) | Samples: 1

**Called by:**
- `assertCanonical` (25)

**Calls:**
- `(anonymous)` (24)

### `applyDocumentChangeValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1257` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `applyDocumentChangeWithIndexes` (1)

### `reconcileChildrenStep`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `replace`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/editor.ts` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `createEditorWithDocument` (1)

### `getUpdateView`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4653` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `nodeRangesTouching`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:182` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `classifyDocumentRange` (1)

### `allContentAllowed`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:280` | Self: 0.0% (1.1ms) | Total: 0.0% (82.0ms) | Samples: 1

**Called by:**
- `fitDirectContent` (65)

**Calls:**
- `every` (64)

### `createEditorUpdateDraftContext`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7644` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `runEditorTransaction` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:523` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `some` (1)

### `validateCompleteExtensionGraph`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:1798` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `buildConfiguredRegistry` (1)

### `insertText`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/transforms-text/insert-text.ts` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `applyInsertText` (1)

### `mapChangedNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1183` | Self: 0.0% (1.1ms) | Total: 0.0% (9.2ms) | Samples: 1

**Called by:**
- `mapSnapshotIndexThroughChange` (7)

**Calls:**
- `mapPathForward` (3)
- `mapPathForward` (1)
- `mapRelocatedPath` (1)
- `mapRelocatedPath` (1)

### `isInteger`
`[native code]` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `create` (1)

### `withEditorRootChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5899` | Self: 0.0% (1.1ms) | Total: 0.0% (2.5ms) | Samples: 1

**Called by:**
- `resolveMappedPoint` (1)
- `setCurrentSelection` (1)

**Calls:**
- `enterEditorRootChildren` (1)

### `recordStats`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2568` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `applyInternal` (1)

### `getElementBehavior`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:954` | Self: 0.0% (1.1ms) | Total: 0.0% (68.7ms) | Samples: 1

**Called by:**
- `isInline` (54)
- `isVoid` (1)

**Calls:**
- `getCompiledElement` (54)

### `validateDeclarativeDocument`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3031` | Self: 0.0% (1.1ms) | Total: 0.0% (2.1ms) | Samples: 1

**Called by:**
- `(anonymous)` (2)

**Calls:**
- `Map` (1)

### `getLastCommit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `assertRemoteCommit` (1)

### `applyTrustedCanonical`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:607` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `applyDocumentChange` (1)

### `getElementContentRoots`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:959` | Self: 0.0% (1.1ms) | Total: 0.0% (18.2ms) | Samples: 1

**Called by:**
- `collectProjectedRoots` (14)

**Calls:**
- `getCompiledElement` (13)

### `recordFacetCommit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/facet.ts:176` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `visit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:210` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `visit` (1)

### `PreparedTokenSlice`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:513` | Self: 0.0% (1.1ms) | Total: 0.0% (112.0ms) | Samples: 1

**Called by:**
- `fromTokens` (88)

**Calls:**
- `freeze` (87)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8008` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `runEditorTransaction` (1)

### `validateTextProperties`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `validateDeclarativeNodeProperties` (1)

### `fromValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `rememberValidatedDocumentRoots` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:127` | Self: 0.0% (1.1ms) | Total: 0.0% (5.0ms) | Samples: 1

**Called by:**
- `map` (4)

**Calls:**
- `cloneObject` (3)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8046` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `runEditorTransaction` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:365` | Self: 0.0% (1.1ms) | Total: 0.0% (4.0ms) | Samples: 1

**Called by:**
- `replaceIndexedChildren` (3)

**Calls:**
- `cloneFrozen` (2)

### `nodeRangesTouching`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:224` | Self: 0.0% (1.1ms) | Total: 0.0% (153.1ms) | Samples: 1

**Called by:**
- `nodeRangesTouching` (57)
- `classifyDocumentRange` (26)
- `addRange` (13)
- `(anonymous)` (12)
- `collectRelocationCandidates` (5)
- `classifyRootChangeWithRuntimeCandidates` (2)
- `addTouching` (2)
- `(anonymous)` (1)
- `applyIndexed` (1)
- `overlappingRanges` (1)

**Calls:**
- `visit` (60)
- `visit` (54)
- `visit` (3)
- `visit` (1)
- `visit` (1)

### `cacheIndex`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:390` | Self: 0.0% (1.1ms) | Total: 0.0% (1.1ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `deepFreeze`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:163` | Self: 0.0% (1.1ms) | Total: 0.0% (61.4ms) | Samples: 1

**Called by:**
- `deepFreeze` (41)
- `DocumentIndex` (8)

**Calls:**
- `deepFreeze` (30)
- `freeze` (18)

### `applyIndexed`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `applyInternal` (1)

### `applyTransactionSpecDocumentChangeStep`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7332` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `applyDocumentChange` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8112` | Self: 0.0% (1.0ms) | Total: 0.0% (74.5ms) | Samples: 1

**Called by:**
- `runEditorTransaction` (59)

**Calls:**
- `notifyAnchorChanges` (55)
- `notifyAnchorChanges` (3)

### `syncImplicitTargetToCurrentSelection`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6362` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `applyTransactionSpecDocumentChangeStep` (1)

### `getStructuralFingerprint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:101` | Self: 0.0% (1.0ms) | Total: 0.0% (5.4ms) | Samples: 1

**Called by:**
- `groupRelocationCandidates` (3)
- `getStructuralFingerprint` (1)

**Calls:**
- `get` (3)

### `finalize`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:753` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `prepareFittedDocument` (1)

### `notifyListeners`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7493` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `pathKey`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `mapChangedNodeKeys` (1)

### `applyPreparedTransactionSpecChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `applyTransactionSpecContents` (1)

### `assertRemoteCommit`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:148` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `runRemoteChangesSeparately` (1)

### `applyDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7464` | Self: 0.0% (1.0ms) | Total: 26.3% (55.84s) | Samples: 1

**Called by:**
- `apply` (43716)

**Calls:**
- `applyCanonical` (37809)
- `applyTrustedCanonical` (3554)
- `applyCanonical` (2122)
- `applyCanonical` (163)
- `applyTrustedCanonical` (30)
- `applyTrustedCanonical` (7)
- `applyTrustedCanonical` (4)
- `applyTrustedCanonical` (4)
- `applyTrustedCanonical` (3)
- `applyTrustedCanonical` (2)
- `applyTrustedCanonical` (2)
- `applyTrustedCanonical` (2)
- `applyTrustedCanonical` (2)
- `applyTrustedCanonical` (1)
- `applyTrustedCanonical` (1)
- `applyTrustedCanonical` (1)
- `applyTrustedCanonical` (1)
- `applyTrustedCanonical` (1)
- `applyTrustedCanonical` (1)
- `applyCanonical` (1)
- `applyTrustedCanonical` (1)
- `applyTrustedCanonical` (1)
- `applyTrustedCanonical` (1)
- `applyCanonical` (1)

### `propertyChanges`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2458` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `applyInternal` (1)

### `classifyRootChangeWithRuntimeCandidates`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:157` | Self: 0.0% (1.0ms) | Total: 0.0% (2.2ms) | Samples: 1

**Called by:**
- `apply` (2)

**Calls:**
- `nodeRangesTouching` (1)

### `getUpdateView`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4757` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3151` | Self: 0.0% (1.0ms) | Total: 0.0% (2.2ms) | Samples: 1

**Called by:**
- `assertDocument` (2)

**Calls:**
- `toSchemaValidationLocation` (1)

### `isText`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:194` | Self: 0.0% (1.0ms) | Total: 0.0% (22.6ms) | Samples: 1

**Called by:**
- `assertSelectionSupported` (6)
- `withoutPendingMarks` (4)
- `mapSelectionWithContext` (2)
- `getPendingSelectionMarks` (2)
- `assertBuiltInSelection` (1)
- `assertSelectionSupported` (1)
- `isSelection` (1)

**Calls:**
- `hasOnlyKeys` (13)
- `hasOnlyKeys` (3)

### `DocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:750` | Self: 0.0% (1.0ms) | Total: 0.0% (5.0ms) | Samples: 1

**Called by:**
- `constructDocumentChange` (4)

**Calls:**
- `freezeReadonlySet` (2)
- `freezeReadonlySet` (1)

### `buildConfiguredRegistry`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:2044` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `setCachedSnapshot`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:921` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `validateSubtree`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3610` | Self: 0.0% (1.0ms) | Total: 0.0% (5.1ms) | Samples: 1

**Called by:**
- `validateDocumentChange` (4)

**Calls:**
- `validateContentIndexes` (1)
- `validateContentIndexes` (1)
- `validateContentIndexes` (1)

### `addParentIndex`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3470` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `addOwnPath` (1)

### `equalValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:151` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `setSelectionValue` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:114` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `flatIntoArrayWithCallback` (1)

### `decodeNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:225` | Self: 0.0% (1.0ms) | Total: 0.0% (37.1ms) | Samples: 1

**Called by:**
- `(anonymous)` (30)

**Calls:**
- `freeze` (18)
- `cloneObject` (11)

### `initializePublicState`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `createEditorImplementation` (1)

### `getLastCommit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/editor.ts:4463` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `assertRemoteCommit` (1)

### `get done`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `composeSections` (1)

### `isStrictPoint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:118` | Self: 0.0% (1.0ms) | Total: 0.0% (18.3ms) | Samples: 1

**Called by:**
- `isText` (8)
- `isText` (7)

**Calls:**
- `hasOnlyKeys` (10)
- `hasOnlyKeys` (4)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:333` | Self: 0.0% (1.0ms) | Total: 0.0% (9.6ms) | Samples: 1

**Called by:**
- `withDecodedSplicedNodes` (7)
- `withSplicedNodes` (1)

**Calls:**
- `splice` (7)

### `canonicalizeDirectChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:201` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `canonicalizeNode` (1)

### `createEditorCommit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:1029` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `runEditorTransaction` (1)

### `createEditorSchema`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2727` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `createEditorImplementation` (1)

### `freezeRootClassification`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:283` | Self: 0.0% (1.0ms) | Total: 0.0% (5.7ms) | Samples: 1

**Called by:**
- `DocumentChange` (5)

**Calls:**
- `every` (4)

### `encodeNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:945` | Self: 0.0% (1.0ms) | Total: 1.7% (3.64s) | Samples: 1

**Called by:**
- `(anonymous)` (1699)
- `fromNodes` (712)
- `DocumentIndex` (424)
- `tokens` (43)

**Calls:**
- `forEach` (2877)

### `mapSnapshotIndexThroughChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1504` | Self: 0.0% (1.0ms) | Total: 0.0% (194.4ms) | Samples: 1

**Called by:**
- `inheritDocumentChangeStepNodeKeys` (152)

**Calls:**
- `cache` (89)
- `cache` (26)
- `cache` (24)
- `cache` (11)
- `cache` (1)

### `groupRelocationCandidates`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:174` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `deriveRootRelocations` (1)

### `applyDocumentChangeValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1278` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `applyDocumentChangeWithIndexes` (1)

### `ensureElementOwnedRootIndex`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:764` | Self: 0.0% (1.0ms) | Total: 0.0% (2.1ms) | Samples: 1

**Called by:**
- `(anonymous)` (2)

**Calls:**
- `getElementOwnedRootIndex` (1)

### `edges`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/range.ts:107` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `fit` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3169` | Self: 0.0% (1.0ms) | Total: 5.3% (11.28s) | Samples: 1

**Called by:**
- `assertDocument` (8839)

**Calls:**
- `assertSchemaJsonValue` (8838)

### `empty`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1569` | Self: 0.0% (1.0ms) | Total: 0.0% (2.3ms) | Samples: 1

**Called by:**
- `constructCanonicalDocumentChange` (2)

**Calls:**
- `RootChange` (1)

### `getElementOwnedRootIndex`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:402` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `ensureElementOwnedRootIndex` (1)

### `replaceCanonicalChildWindow`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:806` | Self: 0.0% (1.0ms) | Total: 0.0% (2.3ms) | Samples: 1

**Called by:**
- `(anonymous)` (2)

**Calls:**
- `isText` (1)

### `createCommitChanged`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:405` | Self: 0.0% (1.0ms) | Total: 0.0% (8.6ms) | Samples: 1

**Called by:**
- `createEditorCommit` (7)

**Calls:**
- `performIteration` (4)
- `map` (2)

### `fork`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:235` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `prepareScopedEditorExtensionPublication`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:2599` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `runEditorTransaction` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2117` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `sort` (1)

### `stageFields`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `stage` (1)

### `deepFreeze`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:162` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `deepFreeze` (1)

### `classifyRootChangeWithRuntimeCandidates`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:121` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `apply` (1)

### `materializeTokens`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:529` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `(anonymous)` (1)

### `applyTrustedCanonical`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:566` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `applyDocumentChange` (1)

### `guardTransactionValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:3861` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `getUpdateView` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1763` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `fit` (1)

### `validateSubtree`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3604` | Self: 0.0% (1.0ms) | Total: 0.0% (14.1ms) | Samples: 1

**Called by:**
- `validateDocumentChange` (12)

**Calls:**
- `isFrozen` (11)

### `isElement`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/element.ts:132` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `retainOrigin` (1)

### `get`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6711` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `inheritDocumentChangeStepNodeKeys` (1)

### `getNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `getAffectedAnchorListeners` (1)

### `rawNodeAt`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:109` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `mapPoint` (1)

### `assertSchemaJsonValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2697` | Self: 0.0% (1.0ms) | Total: 10.3% (21.85s) | Samples: 1

**Called by:**
- `(anonymous)` (8838)
- `(anonymous)` (8304)

**Calls:**
- `assertJsonValue` (17141)

### `inheritDocumentChangeStepNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7216` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `applyTransactionSpecDocumentChangeStep` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `fit` (1)

### `prepareCanonicalRootFit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:734` | Self: 0.0% (1.0ms) | Total: 0.0% (2.4ms) | Samples: 1

**Called by:**
- `fit` (2)

**Calls:**
- `freeze` (1)

### `nodeRangesTouching`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:176` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `nodeRangesTouching` (1)

### `runEditorTransaction`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8050` | Self: 0.0% (1.0ms) | Total: 0.0% (3.5ms) | Samples: 1

**Called by:**
- `withUpdateTagContext` (3)

**Calls:**
- `structuredClone` (2)

### `seek`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:433` | Self: 0.0% (1.0ms) | Total: 0.0% (1.0ms) | Samples: 1

**Called by:**
- `textAt` (1)

### `replacements`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2433` | Self: 0.0% (977us) | Total: 0.0% (977us) | Samples: 1

**Called by:**
- `applyInternal` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:113` | Self: 0.0% (942us) | Total: 0.0% (942us) | Samples: 1

**Called by:**
- `flatIntoArrayWithCallback` (1)

### `freezeReadonlyMap`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:197` | Self: 0.0% (861us) | Total: 0.0% (8.3ms) | Samples: 1

**Called by:**
- `DocumentChange` (5)
- `DocumentChange` (2)

**Calls:**
- `Proxy` (6)

### `getEditorTransactionDepth`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:748` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `isInTransaction` (1)

**Calls:**
- `getTransactionSpecContext` (1)

### `getAffectedAnchorListeners`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:379` | Self: 0.0% (0us) | Total: 0.0% (3.8ms) | Samples: 0

**Called by:**
- `notifyAnchorChanges` (3)

**Calls:**
- `getNodeKeys` (1)
- `getNodeKeys` (1)
- `getNodeKeys` (1)

### `validateDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3581` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `push` (1)

### `getProtectedInlineSpacerEntries`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:370` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `slice` (1)

### `constructCanonicalDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1059` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `assertCanonical` (1)

**Calls:**
- `movedNode` (1)

### `canonicalizeNode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:253` | Self: 0.0% (0us) | Total: 0.0% (87.5ms) | Samples: 0

**Called by:**
- `map` (69)

**Calls:**
- `every` (69)

### `mergeRegistries`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:489` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `publishConfiguredExtensionRegistry` (1)

**Calls:**
- `(anonymous)` (1)

### `mapSelectionWithContext`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:861` | Self: 0.0% (0us) | Total: 0.0% (1.5ms) | Samples: 0

**Called by:**
- `mapSelectionThroughChange` (1)

**Calls:**
- `copyDataProperties` (1)

### `getProtectedInlineSpacerNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6814` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `protectedInlineSpacersFor` (1)

**Calls:**
- `getTransactionSnapshot` (1)

### `mapRelocatedPath`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:532` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `mapPathForward` (1)

**Calls:**
- `getSegmentRelocations` (1)

### `applyTransactionSpecDocumentChangeStep`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7354` | Self: 0.0% (0us) | Total: 50.9% (108.12s) | Samples: 0

**Called by:**
- `applyDocumentChangeStep` (82731)
- `applyPreparedTransactionSpecChange` (2065)
- `applyDocumentChange` (42)

**Calls:**
- `inheritDocumentChangeStepNodeKeys` (84829)
- `inheritDocumentChangeStepNodeKeys` (3)
- `inheritDocumentChangeStepNodeKeys` (2)
- `inheritDocumentChangeStepNodeKeys` (1)
- `inheritDocumentChangeStepNodeKeys` (1)
- `inheritDocumentChangeStepNodeKeys` (1)
- `inheritDocumentChangeStepNodeKeys` (1)

### `classifyDocumentRange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:44` | Self: 0.0% (0us) | Total: 0.0% (67.1ms) | Samples: 0

**Called by:**
- `classifyRootChangeWithRuntimeCandidates` (47)
- `classifyRootChangeWithRuntimeCandidates` (1)

**Calls:**
- `flatMap` (48)

### `compose`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1056` | Self: 0.0% (0us) | Total: 0.0% (1.0ms) | Samples: 0

**Called by:**
- `apply` (1)

**Calls:**
- `performIteration` (1)

### `createEditorReadApi`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-lifecycle-api.ts:297` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `createEditorImplementation` (1)

**Calls:**
- `createCallableGroup` (1)

### `mapSelectionThroughChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:911` | Self: 0.0% (0us) | Total: 0.0% (40.7ms) | Samples: 0

**Called by:**
- `applyTransactionSpecDocumentChangeStep` (33)

**Calls:**
- `assertSelectionSupported` (8)
- `assertSelectionSupported` (8)
- `assertSelectionSupported` (3)
- `assertSelectionSupported` (3)
- `assertSelectionSupported` (2)
- `assertSelectionSupported` (2)
- `assertSelectionSupported` (2)
- `assertSelectionSupported` (2)
- `assertSelectionSupported` (1)
- `assertSelectionSupported` (1)
- `assertSelectionSupported` (1)

### `deriveRootRelocations`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:257` | Self: 0.0% (0us) | Total: 0.0% (32.3ms) | Samples: 0

**Called by:**
- `getRootChangeRelocations` (25)

**Calls:**
- `collectRelocationCandidates` (20)
- `collectRelocationCandidates` (2)
- `collectRelocationCandidates` (2)
- `collectRelocationCandidates` (1)

### `getElementOwnedRootKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:1022` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `validateDeclarativeDocument` (1)

**Calls:**
- `map` (1)

### `textAt`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:300` | Self: 0.0% (0us) | Total: 0.0% (3.3ms) | Samples: 0

**Called by:**
- `textAt` (3)

**Calls:**
- `seek` (2)
- `seek` (1)

### `createExtensionRegistry`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:174` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `createEditorImplementation` (1)

**Calls:**
- `createSchemaContributionRegistry` (1)

### `DocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:736` | Self: 0.0% (0us) | Total: 0.0% (5.9ms) | Samples: 0

**Called by:**
- `constructDocumentChange` (5)

**Calls:**
- `freezeReadonlyMap` (3)
- `freezeReadonlyMap` (2)

### `recordStats`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2571` | Self: 0.0% (0us) | Total: 0.0% (2.5ms) | Samples: 0

**Called by:**
- `applyInternal` (2)

**Calls:**
- `freeze` (2)

### `replaceSnapshot`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8512` | Self: 0.0% (0us) | Total: 65.2% (138.29s) | Samples: 0

**Called by:**
- `replace` (84985)
- `replaceEditorSnapshot` (23578)

**Calls:**
- `replaceTransformedSnapshot` (108563)

### `prepareFittedDocument`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1420` | Self: 0.0% (0us) | Total: 1.3% (2.94s) | Samples: 0

**Called by:**
- `fit` (2321)

**Calls:**
- `classify` (1623)
- `classify` (696)
- `classify` (1)
- `classify` (1)

### `getCurrentRootSnapshot`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6700` | Self: 0.0% (0us) | Total: 0.0% (17.7ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (13)

**Calls:**
- `structuredClone` (8)
- `getCurrentSelection` (5)

### `get`
`node:assert:70` | Self: 0.0% (0us) | Total: 0.0% (2.3ms) | Samples: 0

**Called by:**
- `assign` (2)

**Calls:**
- `loadAssertionError` (2)

### `prepareFittedDocument`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1412` | Self: 0.0% (0us) | Total: 3.4% (7.26s) | Samples: 0

**Called by:**
- `fit` (5706)

**Calls:**
- `apply` (5699)
- `apply` (3)
- `apply` (1)
- `apply` (1)
- `apply` (1)
- `apply` (1)

### `runRemoteChangeBatch`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:229` | Self: 0.0% (0us) | Total: 0.1% (304.1ms) | Samples: 0

**Called by:**
- `(anonymous)` (161)
- `measureCohort` (76)

**Calls:**
- `(host)` (237)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1176` | Self: 0.0% (0us) | Total: 0.0% (4.0ms) | Samples: 0

**Called by:**
- `iterChangedRanges` (3)

**Calls:**
- `addChildWindow` (2)
- `addChildWindow` (1)

### `applyIndexed`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2116` | Self: 0.0% (0us) | Total: 0.0% (1.0ms) | Samples: 0

**Called by:**
- `applyInternal` (1)

**Calls:**
- `sort` (1)

### `classifyRootChangeWithRuntimeCandidates`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:148` | Self: 0.0% (0us) | Total: 0.0% (2.8ms) | Samples: 0

**Called by:**
- `classify` (2)

**Calls:**
- `overlappingRanges` (2)

### `validateDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3580` | Self: 0.0% (0us) | Total: 0.0% (7.8ms) | Samples: 0

**Called by:**
- `(anonymous)` (6)

**Calls:**
- `indexRecursivePath` (4)
- `indexRecursivePath` (2)

### `classify`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:375` | Self: 0.0% (0us) | Total: 0.0% (1.0ms) | Samples: 0

**Called by:**
- `prepareFittedDocument` (1)

**Calls:**
- `Map` (1)

### `createEditorImplementation`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts:486` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `createEditorWithDocument` (1)

**Calls:**
- `Proxy` (1)

### `subscribeAnchorState`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:331` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `createAnchor` (1)

**Calls:**
- `addAnchorListener` (1)

### `compose`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2654` | Self: 0.0% (0us) | Total: 0.1% (233.2ms) | Samples: 0

**Called by:**
- `compactMappingSegments` (166)
- `compose` (20)

**Calls:**
- `composeSections` (86)
- `composeSections` (85)
- `composeSections` (3)
- `composeSections` (3)
- `composeSections` (3)
- `composeSections` (2)
- `composeSections` (2)
- `composeSections` (1)
- `composeSections` (1)

### `getSelectionRanges`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:603` | Self: 0.0% (0us) | Total: 0.0% (3.8ms) | Samples: 0

**Called by:**
- `assertSelectionSupported` (3)

**Calls:**
- `isNode` (3)

### `indexedAfter`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:199` | Self: 0.0% (0us) | Total: 0.0% (8.3ms) | Samples: 0

**Called by:**
- `reconcileExclusiveElementOwnedRoots` (4)
- `runEditorTransaction` (3)

**Calls:**
- `generatorResume` (5)
- `next` (2)

### `fitClosedNode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:485` | Self: 0.0% (0us) | Total: 0.0% (24.1ms) | Samples: 0

**Called by:**
- `visit` (12)
- `fitClosedContent` (7)

**Calls:**
- `every` (19)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1392` | Self: 0.0% (0us) | Total: 0.0% (104.9ms) | Samples: 0

**Called by:**
- `mapSnapshotIndexThroughChange` (84)

**Calls:**
- `compactMappingSegments` (84)

### `prepareRecordPublication`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:2165` | Self: 0.0% (0us) | Total: 0.2% (456.2ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (356)
- `publishInitialEditorExtensions` (1)

**Calls:**
- `runWithEditorExtensionPublicationGuard` (357)

### `assertRemoteCommit`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:143` | Self: 0.0% (0us) | Total: 0.0% (3.6ms) | Samples: 0

**Called by:**
- `runRemoteChangesSeparately` (2)
- `runRemoteChangeBatch` (1)

**Calls:**
- `getLastCommit` (1)
- `getLastCommit` (1)
- `getLastCommit` (1)

### `fit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1685` | Self: 0.0% (0us) | Total: 0.1% (270.2ms) | Samples: 0

**Called by:**
- `fitRoot` (150)
- `(anonymous)` (64)

**Calls:**
- `(anonymous)` (214)

### `replaceCanonicalChildWindow`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:811` | Self: 0.0% (0us) | Total: 0.0% (4.0ms) | Samples: 0

**Called by:**
- `(anonymous)` (3)

**Calls:**
- `getElementContent` (3)

### `createEditorDocumentChangeBuilder`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6856` | Self: 0.0% (0us) | Total: 0.0% (4.1ms) | Samples: 0

**Called by:**
- `createEditorUpdateDraftContext` (3)

**Calls:**
- `ChangeDraft` (2)
- `ChangeDraft` (1)

### `runEditorTransaction`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7801` | Self: 0.0% (0us) | Total: 51.0% (108.30s) | Samples: 0

**Called by:**
- `replaceTransformedSnapshot` (84985)
- `run` (28)

**Calls:**
- `(anonymous)` (83700)
- `(anonymous)` (1198)
- `(anonymous)` (53)
- `(anonymous)` (31)
- `(anonymous)` (26)
- `(anonymous)` (3)
- `(anonymous)` (2)

### `createTreeIndexNode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:64` | Self: 0.0% (0us) | Total: 0.2% (550.8ms) | Samples: 0

**Called by:**
- `map` (433)

**Calls:**
- `map` (433)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:956` | Self: 0.0% (0us) | Total: 0.0% (5.9ms) | Samples: 0

**Called by:**
- `iterChangedRanges` (5)

**Calls:**
- `addTouching` (2)
- `addTouching` (2)
- `addTouching` (1)

### `diffChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1088` | Self: 0.0% (0us) | Total: 0.0% (2.5ms) | Samples: 0

**Called by:**
- `createStructurallyAlignedChanges` (2)

**Calls:**
- `from` (2)

### `getUpdateView`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4620` | Self: 0.0% (0us) | Total: 0.0% (3.9ms) | Samples: 0

**Called by:**
- `(anonymous)` (3)

**Calls:**
- `freeze` (3)

### `mapSnapshotIndexThroughChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1453` | Self: 0.0% (0us) | Total: 0.0% (39.8ms) | Samples: 0

**Called by:**
- `inheritDocumentChangeStepNodeKeys` (31)

**Calls:**
- `freeze` (30)
- `performIteration` (1)

### `addChildWindow`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:787` | Self: 0.0% (0us) | Total: 0.0% (2.8ms) | Samples: 0

**Called by:**
- `(anonymous)` (2)

**Calls:**
- `freeze` (2)

### `applyBuiltDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6966` | Self: 0.0% (0us) | Total: 0.0% (16.3ms) | Samples: 0

**Called by:**
- `insertTextAtPoint` (13)

**Calls:**
- `insertText` (9)
- `apply` (2)
- `insertText` (1)
- `apply` (1)

### `hideFromStack`
`internal:shared:19` | Self: 0.0% (0us) | Total: 0.0% (2.3ms) | Samples: 0

**Called by:**
- `internal:validators` (1)

**Calls:**
- `defineProperty` (1)

### `isArrayPrototype`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:36` | Self: 0.0% (0us) | Total: 0.6% (1.32s) | Samples: 0

**Called by:**
- `getEditorJsonArrayItems` (1033)

**Calls:**
- `hasIntrinsicConstructor` (584)
- `hasIntrinsicConstructor` (396)
- `hasIntrinsicConstructor` (34)
- `hasIntrinsicConstructor` (19)

### `mapTextOffset`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts:130` | Self: 0.0% (0us) | Total: 0.0% (5.6ms) | Samples: 0

**Called by:**
- `memoize` (4)

**Calls:**
- `fromValue` (4)

### `mapSelectionThroughChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:873` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `applyTransactionSpecDocumentChangeStep` (1)

**Calls:**
- `get empty` (1)

### `getUpdateView`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5179` | Self: 0.0% (0us) | Total: 0.0% (2.5ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)
- `(anonymous)` (1)

**Calls:**
- `guardTransactionValue` (1)
- `guardTransactionValue` (1)

### `create`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1459` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `insertText` (1)

**Calls:**
- `addSection` (1)

### `createFakeCollabAdapter`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:157` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `measureConnectDisconnectHeap` (1)

**Calls:**
- `canonicalizeEditorExtension` (1)

### `getUpdateView`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4691` | Self: 0.0% (0us) | Total: 0.0% (3.7ms) | Samples: 0

**Called by:**
- `(anonymous)` (3)

**Calls:**
- `freeze` (3)

### `validateDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3579` | Self: 0.0% (0us) | Total: 0.0% (12.9ms) | Samples: 0

**Called by:**
- `(anonymous)` (10)

**Calls:**
- `isRecursivelyValidated` (4)
- `isRecursivelyValidated` (3)
- `isRecursivelyValidated` (2)
- `isRecursivelyValidated` (1)

### `RootChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1381` | Self: 0.0% (0us) | Total: 0.0% (19.3ms) | Samples: 0

**Called by:**
- `compose` (14)
- `create` (2)

**Calls:**
- `freeze` (16)

### `fit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3150` | Self: 0.0% (0us) | Total: 0.2% (426.1ms) | Samples: 0

**Called by:**
- `fitRoot` (336)

**Calls:**
- `adopt` (336)

### `classifyDocumentRange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:65` | Self: 0.0% (0us) | Total: 0.0% (6.1ms) | Samples: 0

**Called by:**
- `classifyRootChangeWithRuntimeCandidates` (4)
- `classifyRootChangeWithRuntimeCandidates` (1)

**Calls:**
- `filter` (5)

### `validateDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3638` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `assertOwnJsonProperties` (1)

### `mapSnapshotIndexThroughChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1380` | Self: 0.0% (0us) | Total: 0.0% (38.2ms) | Samples: 0

**Called by:**
- `inheritDocumentChangeStepNodeKeys` (30)

**Calls:**
- `map` (30)

### `resolveSnapshotPoint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8547` | Self: 0.0% (0us) | Total: 0.0% (3.9ms) | Samples: 0

**Called by:**
- `resolveSnapshotSelection` (3)

**Calls:**
- `node` (3)

### `commit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:2464` | Self: 0.0% (0us) | Total: 0.0% (2.7ms) | Samples: 0

**Called by:**
- `withExtensionPublicationRollback` (2)

**Calls:**
- `publishConfiguredExtensionRegistry` (1)
- `publishConfiguredExtensionRegistry` (1)

### `createEditorImplementation`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts:670` | Self: 0.0% (0us) | Total: 0.0% (7.8ms) | Samples: 0

**Called by:**
- `createEditorWithDocument` (4)
- `createEditorWithDocument` (2)

**Calls:**
- `initializeBaseExtensionRegistry` (4)
- `initializeBaseExtensionRegistry` (2)

### `commit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/history/history-extension.ts:537` | Self: 0.0% (0us) | Total: 0.0% (99.6ms) | Samples: 0

**Called by:**
- `(anonymous)` (77)

**Calls:**
- `get` (40)
- `get` (37)

### `measureCohort`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:421` | Self: 0.0% (0us) | Total: 1.7% (3.71s) | Samples: 0

**Called by:**
- `(anonymous)` (2927)

**Calls:**
- `measureAnchors` (2705)
- `measureAnchors` (212)
- `measureAnchors` (8)
- `measureAnchors` (2)

### `createEditorDocumentValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:891` | Self: 0.0% (0us) | Total: 0.0% (1.0ms) | Samples: 0

**Called by:**
- `setCurrentSelection` (1)

**Calls:**
- `copyDataProperties` (1)

### `applyIndexed`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2217` | Self: 0.0% (0us) | Total: 0.0% (4.5ms) | Samples: 0

**Called by:**
- `applyInternal` (4)

**Calls:**
- `textAt` (4)

### `visit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:212` | Self: 0.0% (0us) | Total: 0.0% (132.1ms) | Samples: 0

**Called by:**
- `nodeRangesTouching` (54)
- `visit` (49)

**Calls:**
- `createEntry` (88)
- `createEntry` (15)

### `getRootScopedSelection`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6622` | Self: 0.0% (0us) | Total: 0.0% (2.8ms) | Samples: 0

**Called by:**
- `getCurrentRootSnapshot` (2)

**Calls:**
- `cloneFrozenEditorJsonValue` (2)

### `fit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1720` | Self: 0.0% (0us) | Total: 0.0% (2.4ms) | Samples: 0

**Called by:**
- `fitRoot` (2)

**Calls:**
- `getDocumentRootProgram` (2)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3190` | Self: 0.0% (0us) | Total: 2.5% (5.36s) | Samples: 0

**Called by:**
- `assertDocument` (4214)

**Calls:**
- `rememberValidatedDocumentRoots` (3385)
- `rememberValidatedDocumentRoots` (821)
- `rememberValidatedDocumentRoots` (4)
- `rememberValidatedDocumentRoots` (3)
- `rememberValidatedDocumentRoots` (1)

### `claimSource`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:93` | Self: 0.0% (0us) | Total: 0.0% (2.3ms) | Samples: 0

**Called by:**
- `decodeNodes` (2)

**Calls:**
- `collect` (1)
- `collect` (1)

### `async loadAndEvaluateModule`
`[native code]` | Self: 0.0% (0us) | Total: 0.0% (5.0ms) | Samples: 0

**Calls:**
- `linkAndEvaluateModule` (3)

### `retainOrigin`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:449` | Self: 0.0% (0us) | Total: 0.0% (58.5ms) | Samples: 0

**Called by:**
- `fitClosedContent` (26)
- `visit` (20)

**Calls:**
- `visitDescendantPaths` (43)
- `visitDescendantPaths` (2)
- `visitDescendantPaths` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5676` | Self: 0.0% (0us) | Total: 56.1% (119.08s) | Samples: 0

**Called by:**
- `buildTransactionSpec` (93474)

**Calls:**
- `(anonymous)` (93471)
- `getUpdateView` (1)
- `getUpdateView` (1)
- `getUpdateView` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8421` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (1)

**Calls:**
- `getProtectedInlineSpacerEntries` (1)

### `canonicalizeDirectChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:225` | Self: 0.0% (0us) | Total: 0.0% (77.7ms) | Samples: 0

**Called by:**
- `canonicalizeNode` (62)

**Calls:**
- `hasInlineContent` (56)
- `hasInlineContent` (6)

### `freezeRootClassification`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:287` | Self: 0.0% (0us) | Total: 0.0% (74.5ms) | Samples: 0

**Called by:**
- `DocumentChange` (59)

**Calls:**
- `every` (59)

### `enterEditorRootChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5984` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `withEditorRootChildren` (1)

**Calls:**
- `getCurrentChildrenRoot` (1)

### `applyIndexed`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2152` | Self: 0.0% (0us) | Total: 0.0% (2.4ms) | Samples: 0

**Called by:**
- `applyInternal` (2)

**Calls:**
- `nodeAtPath` (2)

### `getCachedSnapshot`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:905` | Self: 0.0% (0us) | Total: 0.0% (1.0ms) | Samples: 0

**Called by:**
- `getSnapshot` (1)

**Calls:**
- `getCurrentChildrenRoot` (1)

### `mapPoint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:472` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `mapRange` (1)

**Calls:**
- `pathOf` (1)

### `measureCohort`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:422` | Self: 0.0% (0us) | Total: 52.8% (112.20s) | Samples: 0

**Called by:**
- `(anonymous)` (88075)

**Calls:**
- `measure` (88075)

### `advanceNextNodeKey`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:126` | Self: 0.0% (0us) | Total: 0.0% (2.5ms) | Samples: 0

**Called by:**
- `setNodeKey` (2)

**Calls:**
- `getLiveNodeKeyPrefix` (2)

### `classifyDocumentRange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:67` | Self: 0.0% (0us) | Total: 0.1% (296.5ms) | Samples: 0

**Called by:**
- `classifyRootChangeWithRuntimeCandidates` (205)
- `classifyRootChangeWithRuntimeCandidates` (26)

**Calls:**
- `flatMap` (226)
- `flatIntoArrayWithCallback` (5)

### `between`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:788` | Self: 0.0% (0us) | Total: 0.0% (8.5ms) | Samples: 0

**Called by:**
- `mapTextOffset` (7)

**Calls:**
- `fromValue` (5)
- `remember` (2)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7287` | Self: 0.0% (0us) | Total: 0.0% (2.3ms) | Samples: 0

**Called by:**
- `inheritDocumentChangeStepNodeKeys` (2)

**Calls:**
- `performProxyObjectGet` (2)

### `assertSelectionSupported`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:680` | Self: 0.0% (0us) | Total: 0.0% (24.7ms) | Samples: 0

**Called by:**
- `setCurrentSelection` (12)
- `mapSelectionThroughChange` (8)

**Calls:**
- `assertJsonValue` (20)

### `assertRemoteCommit`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:146` | Self: 0.0% (0us) | Total: 0.0% (1.5ms) | Samples: 0

**Called by:**
- `runRemoteChangesSeparately` (1)

**Calls:**
- `deepStrictEqual` (1)

### `async asyncModuleEvaluation`
`[native code]` | Self: 0.0% (0us) | Total: 99.9% (212.06s) | Samples: 0

**Calls:**
- `evaluate` (166411)
- `moduleEvaluation` (1)

### `mapSnapshotIndexThroughChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1447` | Self: 0.0% (0us) | Total: 0.0% (2.8ms) | Samples: 0

**Called by:**
- `inheritDocumentChangeStepNodeKeys` (2)

**Calls:**
- `retainAddition` (2)

### `createEditorUpdateDraftContext`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7715` | Self: 0.0% (0us) | Total: 0.0% (4.6ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (4)

**Calls:**
- `structuredClone` (4)

### `DocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:753` | Self: 0.0% (0us) | Total: 0.0% (2.6ms) | Samples: 0

**Called by:**
- `constructDocumentChange` (2)

**Calls:**
- `performProxyObjectGet` (2)

### `DocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:752` | Self: 0.0% (0us) | Total: 0.0% (4.2ms) | Samples: 0

**Called by:**
- `constructDocumentChange` (3)

**Calls:**
- `performProxyObjectGet` (3)

### `mapPathForward`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:609` | Self: 0.0% (0us) | Total: 0.0% (5.6ms) | Samples: 0

**Called by:**
- `mapChangedNodeKeys` (3)
- `(anonymous)` (1)

**Calls:**
- `positionWasReplaced` (3)
- `positionWasReplaced` (1)

### `classifyRootChangeWithRuntimeCandidates`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:165` | Self: 0.0% (0us) | Total: 0.0% (60.4ms) | Samples: 0

**Called by:**
- `classify` (46)
- `apply` (2)

**Calls:**
- `node` (41)
- `nodeAtPath` (4)
- `nodeAtPath` (3)

### `resolveMappedPoint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts:397` | Self: 0.0% (0us) | Total: 0.0% (2.5ms) | Samples: 0

**Called by:**
- `map` (2)

**Calls:**
- `withEditorRootChildren` (1)
- `(anonymous)` (1)

### `expandExtensionInput`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:461` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `flatIntoArrayWithCallback` (1)

**Calls:**
- `map` (1)

### `recordFacetCommit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/facet.ts:169` | Self: 0.0% (0us) | Total: 0.0% (5.5ms) | Samples: 0

**Called by:**
- `(anonymous)` (4)

**Calls:**
- `some` (4)

### `runEditorTransaction`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8121` | Self: 0.0% (0us) | Total: 0.0% (3.7ms) | Samples: 0

**Called by:**
- `withUpdateTagContext` (3)

**Calls:**
- `hasChangeListeners` (2)
- `hasChangeListeners` (1)

### `updateEditor`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5834` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `update` (1)

**Calls:**
- `isInTransaction` (1)

### `withDecodedSplicedNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:683` | Self: 0.0% (0us) | Total: 0.2% (569.2ms) | Samples: 0

**Called by:**
- `applyIndexed` (440)
- `applyIndexed` (9)

**Calls:**
- `(anonymous)` (319)
- `(anonymous)` (90)
- `(anonymous)` (29)
- `(anonymous)` (7)
- `(anonymous)` (3)
- `(anonymous)` (1)

### `prepareScopedEditorExtensionPublication`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:2543` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (1)

**Calls:**
- `flatIntoArrayWithCallback` (1)

### `getUpdateView`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4575` | Self: 0.0% (0us) | Total: 0.0% (2.4ms) | Samples: 0

**Called by:**
- `(anonymous)` (2)

**Calls:**
- `freeze` (2)

### `constructCanonicalDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1041` | Self: 0.0% (0us) | Total: 0.0% (2.4ms) | Samples: 0

**Called by:**
- `finalize` (1)
- `assertCanonical` (1)

**Calls:**
- `performIteration` (2)

### `replaceIndexedChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:313` | Self: 0.0% (0us) | Total: 0.0% (82.2ms) | Samples: 0

**Called by:**
- `withText` (63)

**Calls:**
- `createTreeIndexChildren` (49)
- `createTreeIndexChildren` (13)
- `createTreeIndexChildren` (1)

### `classify`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:374` | Self: 0.0% (0us) | Total: 0.4% (885.4ms) | Samples: 0

**Called by:**
- `prepareFittedDocument` (696)

**Calls:**
- `createInternalDocumentChange` (695)
- `constructDocumentChange` (1)

### `insertTextAtPoint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/transforms-text/insert-text.ts:150` | Self: 0.0% (0us) | Total: 0.0% (22.4ms) | Samples: 0

**Called by:**
- `(anonymous)` (18)

**Calls:**
- `applyBuiltDocumentChange` (13)
- `applyBuiltDocumentChange` (5)

### `finalizeTransactionSpecContext`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5481` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `buildTransactionSpec` (1)

**Calls:**
- `freeze` (1)

### `sameNodeKind`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1125` | Self: 0.0% (0us) | Total: 4.8% (10.31s) | Samples: 0

**Called by:**
- `(anonymous)` (8067)

**Calls:**
- `node` (8067)

### `fit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:2983` | Self: 0.0% (0us) | Total: 0.0% (1.0ms) | Samples: 0

**Called by:**
- `fitRoot` (1)

**Calls:**
- `createInternalDocumentChange` (1)

### `getNodeKey`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts:457` | Self: 0.0% (0us) | Total: 0.0% (1.0ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `getNodeKey` (1)

### `node`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/editor/node.ts:14` | Self: 0.0% (0us) | Total: 0.0% (3.9ms) | Samples: 0

**Called by:**
- `resolveSnapshotPoint` (3)

**Calls:**
- `path` (1)
- `path` (1)
- `path` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1148` | Self: 0.0% (0us) | Total: 0.0% (30.9ms) | Samples: 0

**Called by:**
- `constructCanonicalDocumentChange` (24)

**Calls:**
- `iterChangedRanges` (23)
- `iterChangedRanges` (1)

### `assertBuiltInSelection`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:68` | Self: 0.0% (0us) | Total: 0.0% (6.5ms) | Samples: 0

**Called by:**
- `assertSelectionSupported` (5)

**Calls:**
- `isText` (3)
- `isText` (1)
- `isText` (1)

### `applyInsertTextCommand`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/editor/insert-text.ts:139` | Self: 0.0% (0us) | Total: 0.0% (35.3ms) | Samples: 0

**Called by:**
- `(anonymous)` (28)

**Calls:**
- `run` (28)

### `currentTextContaining`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:342` | Self: 0.0% (0us) | Total: 0.0% (2.5ms) | Samples: 0

**Called by:**
- `textAt` (2)

**Calls:**
- `currentEntry` (2)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8497` | Self: 0.0% (0us) | Total: 0.0% (34.4ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (24)
- `runEditorTransaction` (3)

**Calls:**
- `withEditorUpdateRoot` (26)
- `withEditorUpdateRoot` (1)

### `reconcileChildrenStep`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:3152` | Self: 0.0% (0us) | Total: 0.0% (188.7ms) | Samples: 0

**Called by:**
- `(anonymous)` (144)

**Calls:**
- `every` (144)

### `getChangeValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6748` | Self: 0.0% (0us) | Total: 0.0% (2.7ms) | Samples: 0

**Called by:**
- `reconcileExclusiveElementOwnedRoots` (2)

**Calls:**
- `filter` (2)

### `withSplicedNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:661` | Self: 0.0% (0us) | Total: 0.2% (460.5ms) | Samples: 0

**Called by:**
- `reconcileChildrenStep` (361)

**Calls:**
- `(anonymous)` (255)
- `(anonymous)` (56)
- `(anonymous)` (43)
- `(anonymous)` (3)
- `(anonymous)` (2)
- `(anonymous)` (1)
- `(anonymous)` (1)

### `getUpdateView`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:3948` | Self: 0.0% (0us) | Total: 0.0% (5.1ms) | Samples: 0

**Called by:**
- `(anonymous)` (2)
- `applyTransactionSpecContents` (1)
- `(anonymous)` (1)

**Calls:**
- `getStateView` (3)
- `getStateView` (1)

### `getDocumentOwnershipIndexes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:720` | Self: 0.0% (0us) | Total: 0.0% (1.0ms) | Samples: 0

**Called by:**
- `validateDeclarativeDocument` (1)

**Calls:**
- `entries` (1)

### `publishTransactionDraft`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7758` | Self: 0.0% (0us) | Total: 0.0% (15.2ms) | Samples: 0

**Called by:**
- `(anonymous)` (12)

**Calls:**
- `setSelectionStateSelection` (12)

### `withNodeUpdates`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:743` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `applyInternal` (1)

**Calls:**
- `set` (1)

### `mapSnapshotIndexThroughChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1379` | Self: 0.0% (0us) | Total: 0.0% (19.6ms) | Samples: 0

**Called by:**
- `inheritDocumentChangeStepNodeKeys` (15)

**Calls:**
- `Set` (15)

### `createEditorDocumentValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:874` | Self: 0.0% (0us) | Total: 0.9% (2.01s) | Samples: 0

**Called by:**
- `setCurrentSelection` (857)
- `createEditorUpdateDraftContext` (694)
- `runEditorTransaction` (7)
- `buildConfiguredRegistry` (6)
- `getPublicSelection` (5)
- `readEditor` (4)
- `subscribeAnchorState` (3)
- `createTransactionSpecContext` (3)
- `createAnchor` (2)

**Calls:**
- `isFrozen` (1581)

### `memoize`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:245` | Self: 0.0% (0us) | Total: 0.0% (53.4ms) | Samples: 0

**Called by:**
- `resolveMappedPoint` (42)

**Calls:**
- `mapTextOffset` (34)
- `mapTextOffset` (4)
- `mapTextOffset` (4)

### `DocumentIndex`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:486` | Self: 0.0% (0us) | Total: 0.0% (71.1ms) | Samples: 0

**Called by:**
- `fromValue` (56)

**Calls:**
- `cloneFrozen` (22)
- `isFrozen` (21)
- `deepFreeze` (8)
- `freeze` (5)

### `reconcileChildrenStep`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:3172` | Self: 0.0% (0us) | Total: 0.0% (3.4ms) | Samples: 0

**Called by:**
- `(anonymous)` (3)

**Calls:**
- `create` (2)
- `create` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:321` | Self: 0.0% (0us) | Total: 51.0% (108.26s) | Samples: 0

**Called by:**
- `runEditorTransaction` (84985)

**Calls:**
- `replace` (84985)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1200` | Self: 0.0% (0us) | Total: 0.0% (3.9ms) | Samples: 0

**Called by:**
- `map` (3)

**Calls:**
- `invert` (1)
- `invert` (1)
- `invert` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3018` | Self: 0.0% (0us) | Total: 0.0% (3.9ms) | Samples: 0

**Called by:**
- `flatIntoArrayWithCallback` (3)

**Calls:**
- `resolveExternalDocumentPoint` (2)
- `resolveExternalDocumentPoint` (1)

### `keyAt`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1590` | Self: 0.0% (0us) | Total: 0.0% (8.4ms) | Samples: 0

**Called by:**
- `advancePathStableSnapshotIndex` (4)
- `mapChangedNodeKeys` (3)

**Calls:**
- `pathKey` (7)

### `createEditorImplementation`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts:672` | Self: 0.0% (0us) | Total: 0.0% (2.7ms) | Samples: 0

**Called by:**
- `createEditorWithDocument` (2)

**Calls:**
- `finalizeExtensionRegistry` (1)
- `finalizeExtensionRegistry` (1)

### `compactMappingSegments`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:432` | Self: 0.0% (0us) | Total: 0.0% (910us) | Samples: 0

**Called by:**
- `advancePathStableSnapshotIndex` (1)

**Calls:**
- `performIteration` (1)

### `update`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-lifecycle-api.ts:418` | Self: 0.0% (0us) | Total: 0.0% (49.9ms) | Samples: 0

**Called by:**
- `(host)` (39)

**Calls:**
- `invoke` (39)

### `createAnchor`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts:195` | Self: 0.0% (0us) | Total: 0.0% (2.6ms) | Samples: 0

**Called by:**
- `from` (2)

**Calls:**
- `createEditorDocumentValue` (2)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:729` | Self: 0.0% (0us) | Total: 0.0% (2.5ms) | Samples: 0

**Called by:**
- `(anonymous)` (2)

**Calls:**
- `padStart` (2)

### `fitDocument`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3270` | Self: 0.0% (0us) | Total: 6.9% (14.70s) | Samples: 0

**Called by:**
- `(anonymous)` (11580)

**Calls:**
- `fitDocumentInput` (7524)
- `fitDocumentInput` (2847)
- `fitDocumentInput` (1041)
- `fitDocumentInput` (131)
- `fitDocumentInput` (35)
- `freeze` (1)
- `fitDocumentInput` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7537` | Self: 0.0% (0us) | Total: 0.0% (135.1ms) | Samples: 0

**Called by:**
- `notifyListeners` (105)

**Calls:**
- `(anonymous)` (105)

### `decodeNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:226` | Self: 0.0% (0us) | Total: 0.0% (110.0ms) | Samples: 0

**Called by:**
- `(anonymous)` (86)

**Calls:**
- `cloneFrozen` (57)
- `freeze` (21)
- `deepFreeze` (8)

### `jsonEqual`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:141` | Self: 0.0% (0us) | Total: 0.0% (153.7ms) | Samples: 0

**Called by:**
- `every` (116)
- `(anonymous)` (2)

**Calls:**
- `every` (118)

### `mapChangedNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:998` | Self: 0.0% (0us) | Total: 0.0% (1.5ms) | Samples: 0

**Called by:**
- `mapSnapshotIndexThroughChange` (1)

**Calls:**
- `sort` (1)

### `runEditorTransaction`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7980` | Self: 0.0% (0us) | Total: 0.0% (3.7ms) | Samples: 0

**Called by:**
- `withUpdateTagContext` (2)
- `runTrustedUpdate` (1)

**Calls:**
- `indexedAfter` (3)

### `measureCohort`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:400` | Self: 0.0% (0us) | Total: 10.8% (23.11s) | Samples: 0

**Called by:**
- `(anonymous)` (18151)

**Calls:**
- `runRemoteChangesSeparately` (16730)
- `runRemoteChangesSeparately` (1411)
- `stringify` (7)
- `runRemoteChangesSeparately` (3)

### `node:assert/strict`
`node:assert/strict:3` | Self: 0.0% (0us) | Total: 0.0% (2.3ms) | Samples: 0

**Called by:**
- `parseModule` (2)

**Calls:**
- `anonymous` (2)

### `applyDocumentChangeValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1286` | Self: 0.0% (0us) | Total: 0.0% (6.0ms) | Samples: 0

**Called by:**
- `applyDocumentChangeWithIndexes` (5)

**Calls:**
- `copyDataProperties` (5)

### `getUpdateView`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4662` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `defineSemanticUpdateMethod` (1)

### `validateDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3427` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `bound entries` (1)

### `getChangeValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6768` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (1)

**Calls:**
- `freeze` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8132` | Self: 0.0% (0us) | Total: 0.0% (141.0ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (110)

**Calls:**
- `notifyListeners` (106)
- `notifyListeners` (1)
- `notifyListeners` (1)
- `notifyListeners` (1)
- `notifyListeners` (1)

### `runEditorTransaction`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7833` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `withUpdateTagContext` (1)

**Calls:**
- `getTransactionSnapshot` (1)

### `updateIndexedNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:452` | Self: 0.0% (0us) | Total: 0.0% (20.2ms) | Samples: 0

**Called by:**
- `withNodeUpdates` (16)

**Calls:**
- `freeze` (16)

### `createEditorWithDocument`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:86` | Self: 0.0% (0us) | Total: 0.0% (23.1ms) | Samples: 0

**Called by:**
- `runRemoteChangeBatch` (8)
- `(anonymous)` (3)
- `runRemoteChangesSeparately` (3)
- `measureConnectDisconnectHeap` (3)
- `(anonymous)` (1)

**Calls:**
- `createEditorImplementation` (4)
- `createEditorImplementation` (3)
- `createEditorImplementation` (3)
- `createEditorImplementation` (2)
- `createEditorImplementation` (1)
- `createEditorImplementation` (1)
- `createEditorImplementation` (1)
- `createEditorImplementation` (1)
- `createEditorImplementation` (1)
- `createEditorImplementation` (1)

### `freezeReadonlySet`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:235` | Self: 0.0% (0us) | Total: 0.0% (5.3ms) | Samples: 0

**Called by:**
- `DocumentChange` (3)
- `DocumentChange` (1)

**Calls:**
- `freeze` (4)

### `requestSatisfyUtil`
`[native code]` | Self: 0.0% (0us) | Total: 0.0% (24.4ms) | Samples: 0

**Called by:**
- `(anonymous)` (19)

**Calls:**
- `requestInstantiate` (19)

### `mapSelectionThroughChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:908` | Self: 0.0% (0us) | Total: 0.0% (58.4ms) | Samples: 0

**Called by:**
- `applyTransactionSpecDocumentChangeStep` (41)

**Calls:**
- `mapSelectionWithContext` (33)
- `mapSelectionWithContext` (6)
- `mapSelectionWithContext` (1)
- `mapSelectionWithContext` (1)

### `fitDocumentInput`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3217` | Self: 0.0% (0us) | Total: 0.0% (46.1ms) | Samples: 0

**Called by:**
- `fitDocument` (35)

**Calls:**
- `collectProjectedRoots` (32)
- `collectProjectedRoots` (3)

### `measureAnchors`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:295` | Self: 0.0% (0us) | Total: 0.0% (2.4ms) | Samples: 0

**Called by:**
- `measureCohort` (2)

**Calls:**
- `(host)` (2)

### `compose`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1055` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `apply` (1)

**Calls:**
- `performIteration` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:211` | Self: 0.0% (0us) | Total: 1.8% (3.89s) | Samples: 0

**Called by:**
- `measure` (3051)

**Calls:**
- `createEditorWithDocument` (3048)
- `createEditorWithDocument` (2)
- `createEditorWithDocument` (1)

### `projectSelectionRange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:95` | Self: 0.0% (0us) | Total: 0.0% (5.0ms) | Samples: 0

**Called by:**
- `getSelectionRanges` (4)

**Calls:**
- `projectSelectionPoint` (2)
- `freeze` (2)

### `commit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/history/history-extension.ts:591` | Self: 0.0% (0us) | Total: 0.0% (5.3ms) | Samples: 0

**Called by:**
- `(anonymous)` (4)

**Calls:**
- `readEditor` (4)

### `getUpdateView`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4595` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `freeze` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1151` | Self: 0.0% (0us) | Total: 0.0% (3.8ms) | Samples: 0

**Called by:**
- `iterChangedRanges` (3)

**Calls:**
- `childBoundaryAt` (2)
- `childBoundaryAt` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2651` | Self: 0.0% (0us) | Total: 0.0% (23.5ms) | Samples: 0

**Called by:**
- `forEach` (17)

**Calls:**
- `validationContentAllows` (17)

### `cloneEditorJsonValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:236` | Self: 0.0% (0us) | Total: 0.0% (22.9ms) | Samples: 0

**Called by:**
- `cloneFrozenEditorJsonValue` (6)
- `getCurrentSelection` (4)
- `(anonymous)` (4)
- `normalizeSelectionRoot` (3)

**Calls:**
- `map` (10)
- `entries` (7)

### `slice`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:879` | Self: 0.0% (0us) | Total: 0.0% (151.6ms) | Samples: 0

**Called by:**
- `applyIndexed` (118)

**Calls:**
- `tokens` (116)
- `get tokens` (2)

### `cleanup`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:2429` | Self: 0.0% (0us) | Total: 0.1% (264.6ms) | Samples: 0

**Called by:**
- `(anonymous)` (209)

**Calls:**
- `runTrustedUpdate` (209)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:158` | Self: 0.0% (0us) | Total: 0.0% (17.9ms) | Samples: 0

**Called by:**
- `every` (14)

**Calls:**
- `tokensEqual` (12)
- `tokensEqual` (2)

### `buildConfiguredRegistry`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:1948` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `finalizeExtensionRegistry` (1)

### `applyTransactionSpecDocumentChangeStep`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7347` | Self: 0.0% (0us) | Total: 0.0% (2.5ms) | Samples: 0

**Called by:**
- `applyDocumentChange` (2)

**Calls:**
- `hasOwn` (2)

### `snapshotSliceContent`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:81` | Self: 0.0% (0us) | Total: 0.1% (224.6ms) | Samples: 0

**Called by:**
- `(anonymous)` (108)
- `snapshotContentSlice` (65)

**Calls:**
- `getEditorJsonArrayItems` (61)
- `getEditorJsonArrayItems` (59)
- `getEditorJsonArrayItems` (46)
- `getEditorJsonArrayItems` (6)
- `getEditorJsonArrayItems` (1)

### `get empty`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:831` | Self: 0.0% (0us) | Total: 0.0% (1.0ms) | Samples: 0

**Called by:**
- `apply` (1)

**Calls:**
- `performProxyObjectGet` (1)

### `finalize`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:760` | Self: 0.0% (0us) | Total: 1.6% (3.55s) | Samples: 0

**Called by:**
- `prepareFittedDocument` (2790)
- `finalizeTransactionRepresentation` (1)

**Calls:**
- `constructCanonicalDocumentChange` (1176)
- `constructCanonicalDocumentChange` (1092)
- `constructCanonicalDocumentChange` (498)
- `constructCanonicalDocumentChange` (18)
- `createInternalDocumentChange` (2)
- `constructCanonicalDocumentChange` (1)
- `construct` (1)
- `constructCanonicalDocumentChange` (1)
- `construct` (1)
- `constructCanonicalDocumentChange` (1)

### `buildTransactionSpec`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5669` | Self: 0.0% (0us) | Total: 0.0% (3.6ms) | Samples: 0

**Called by:**
- `createRootFitTransactionSpec` (3)

**Calls:**
- `createTransactionSpecContext` (3)

### `reconcileExclusiveElementOwnedRoots`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5414` | Self: 0.0% (0us) | Total: 0.0% (13.5ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (5)
- `runEditorTransaction` (3)
- `runEditorTransaction` (3)

**Calls:**
- `indexedAfter` (5)
- `indexedAfter` (4)
- `indexedAfter` (2)

### `applyInternal`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2549` | Self: 0.0% (0us) | Total: 0.0% (3.6ms) | Samples: 0

**Called by:**
- `apply` (3)

**Calls:**
- `replacements` (1)
- `replacements` (1)
- `replacements` (1)

### `measureAnchors`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:284` | Self: 0.0% (0us) | Total: 0.1% (272.1ms) | Samples: 0

**Called by:**
- `measureCohort` (212)

**Calls:**
- `(host)` (212)

### `fitDocumentInput`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3253` | Self: 0.0% (0us) | Total: 1.7% (3.63s) | Samples: 0

**Called by:**
- `fitDocument` (2847)

**Calls:**
- `fitRoot` (2847)

### `createPointState`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts:157` | Self: 0.0% (0us) | Total: 0.0% (1.0ms) | Samples: 0

**Called by:**
- `createAnchor` (1)

**Calls:**
- `(anonymous)` (1)

### `prepareScopedEditorExtensionPublication`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:2542` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (1)

**Calls:**
- `resolveLatestExtensionEntries` (1)

### `hasChangeListeners`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:1093` | Self: 0.0% (0us) | Total: 0.0% (1.0ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (1)

**Calls:**
- `performProxyObjectGet` (1)

### `runEditorTransaction`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8106` | Self: 0.0% (0us) | Total: 0.0% (6.6ms) | Samples: 0

**Called by:**
- `withUpdateTagContext` (4)
- `replaceTransformedSnapshot` (1)

**Calls:**
- `(anonymous)` (5)

### `replace`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5120` | Self: 0.0% (0us) | Total: 51.0% (108.26s) | Samples: 0

**Called by:**
- `(anonymous)` (84985)

**Calls:**
- `replaceSnapshot` (84985)

### `applyIndexed`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2188` | Self: 0.0% (0us) | Total: 0.0% (2.6ms) | Samples: 0

**Called by:**
- `applyInternal` (2)

**Calls:**
- `childBoundaryAt` (1)
- `childBoundaryAt` (1)

### `mapPoint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:424` | Self: 0.0% (0us) | Total: 0.0% (3.4ms) | Samples: 0

**Called by:**
- `mapRange` (2)
- `mapRange` (1)

**Calls:**
- `nodeRange` (3)

### `createEditorImplementation`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts:679` | Self: 0.0% (0us) | Total: 0.0% (3.4ms) | Samples: 0

**Called by:**
- `createEditorWithDocument` (3)

**Calls:**
- `publishInitialEditorExtensions` (2)
- `publishInitialEditorExtensions` (1)

### `applyTransactionSpecDocumentChangeStep`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7377` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `applyDocumentChange` (1)

**Calls:**
- `cloneObject` (1)

### `stripLocationRoots`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/internal/root-location.ts:181` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `copyDataProperties` (1)

### `createExtensionRegistry`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:179` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `buildConfiguredRegistry` (1)

**Calls:**
- `Map` (1)

### `replace`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/editor.ts:4679` | Self: 0.0% (0us) | Total: 14.1% (30.03s) | Samples: 0

**Called by:**
- `createEditorWithDocument` (23579)

**Calls:**
- `replaceEditorSnapshot` (23579)

### `disposeTransactionSpecContext`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5343` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (1)

**Calls:**
- `(anonymous)` (1)

### `loadAssertionError`
`node:assert:28` | Self: 0.0% (0us) | Total: 0.0% (2.3ms) | Samples: 0

**Called by:**
- `get` (2)

**Calls:**
- `anonymous` (2)

### `insertText`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:914` | Self: 0.0% (0us) | Total: 0.3% (749.9ms) | Samples: 0

**Called by:**
- `(anonymous)` (584)
- `applyBuiltDocumentChange` (9)

**Calls:**
- `withText` (399)
- `remember` (194)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts:82` | Self: 0.0% (0us) | Total: 0.0% (1.0ms) | Samples: 0

**Called by:**
- `createPointState` (1)

**Calls:**
- `getNodeKey` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:214` | Self: 0.0% (0us) | Total: 0.1% (294.5ms) | Samples: 0

**Called by:**
- `measure` (230)

**Calls:**
- `extendEditor` (230)

### `getCurrentRootSnapshot`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6687` | Self: 0.0% (0us) | Total: 0.0% (2.4ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (2)

**Calls:**
- `getEditorDocumentRoots` (1)
- `getEditorDocumentRoots` (1)

### `indexAnchorListener`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:133` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `addAnchorListener` (1)

**Calls:**
- `nodeKeys` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:202` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `mergeRegistries` (1)

**Calls:**
- `forEach` (1)

### `fromNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:602` | Self: 0.0% (0us) | Total: 1.0% (2.25s) | Samples: 0

**Called by:**
- `reconcileChildrenStep` (1784)

**Calls:**
- `encodeNodes` (712)
- `encodeNodes` (667)
- `encodeNodes` (405)

### `visitOwnerDeclarations`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:605` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `visitOwnerDeclarations` (1)

**Calls:**
- `isElement` (1)

### `get empty`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:833` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (1)

**Calls:**
- `performProxyObjectGet` (1)

### `getCurrentChildrenRoot`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:899` | Self: 0.0% (0us) | Total: 0.0% (2.4ms) | Samples: 0

**Called by:**
- `getCachedSnapshot` (1)
- `enterEditorRootChildren` (1)

**Calls:**
- `getTransactionSpecContext` (2)

### `PreparedTokenSliceStructureError`
`[native code]` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `decodeNodes` (1)

**Calls:**
- `Error` (1)

### `runEditorTransaction`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8051` | Self: 0.0% (0us) | Total: 0.0% (4.4ms) | Samples: 0

**Called by:**
- `withUpdateTagContext` (4)

**Calls:**
- `structuredClone` (4)

### `collectRelocationCandidates`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:210` | Self: 0.0% (0us) | Total: 0.0% (40.3ms) | Samples: 0

**Called by:**
- `deriveRootRelocations` (32)

**Calls:**
- `node` (14)
- `nodeAtPath` (11)
- `nodeAtPath` (7)

### `moduleEvaluation`
`[native code]` | Self: 0.0% (0us) | Total: 0.0% (7.3ms) | Samples: 0

**Called by:**
- `moduleEvaluation` (4)
- `async asyncModuleEvaluation` (1)

**Calls:**
- `moduleEvaluation` (4)
- `evaluate` (1)

### `validateCandidateDocument`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:2220` | Self: 0.0% (0us) | Total: 0.1% (381.7ms) | Samples: 0

**Called by:**
- `validateDocument` (301)

**Calls:**
- `assertDocument` (301)

### `setSelectionValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6135` | Self: 0.0% (0us) | Total: 0.0% (13.0ms) | Samples: 0

**Called by:**
- `setCurrentSelection` (10)

**Calls:**
- `structuredClone` (9)
- `getCurrentSelection` (1)

### `applyTrustedCanonical`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:624` | Self: 0.0% (0us) | Total: 0.0% (5.0ms) | Samples: 0

**Called by:**
- `applyDocumentChange` (4)

**Calls:**
- `performProxyObjectGet` (4)

### `insertText`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:909` | Self: 0.0% (0us) | Total: 0.0% (79.5ms) | Samples: 0

**Called by:**
- `(anonymous)` (62)

**Calls:**
- `getIndex` (62)

### `getStateView`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:2999` | Self: 0.0% (0us) | Total: 0.0% (3.8ms) | Samples: 0

**Called by:**
- `getUpdateView` (3)

**Calls:**
- `getExtensionRegistry` (3)

### `measureCohort`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:415` | Self: 0.0% (0us) | Total: 1.9% (4.21s) | Samples: 0

**Called by:**
- `(anonymous)` (3298)

**Calls:**
- `measure` (3298)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:240` | Self: 0.0% (0us) | Total: 23.3% (49.60s) | Samples: 0

**Called by:**
- `runEditorTransaction` (38825)

**Calls:**
- `apply` (38825)

### `collectChangedElementPaths`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:909` | Self: 0.0% (0us) | Total: 0.1% (262.6ms) | Samples: 0

**Called by:**
- `mapSnapshotIndexThroughChange` (207)

**Calls:**
- `iterChangedRanges` (207)

### `constructCanonicalDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1053` | Self: 0.0% (0us) | Total: 0.0% (2.3ms) | Samples: 0

**Called by:**
- `assertCanonical` (2)

**Calls:**
- `empty` (2)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:318` | Self: 0.0% (0us) | Total: 1.7% (3.77s) | Samples: 0

**Called by:**
- `measure` (2961)

**Calls:**
- `createEditorWithDocument` (2956)
- `createEditorWithDocument` (3)
- `createEditorWithDocument` (2)

### `createEditorUpdateDraftContext`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7729` | Self: 0.0% (0us) | Total: 0.0% (4.4ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (3)

**Calls:**
- `getStateFieldIdentityMap` (3)

### `notifyListeners`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7588` | Self: 0.0% (0us) | Total: 0.0% (1.0ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `delete` (1)

### `runEditorTransaction`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8018` | Self: 0.0% (0us) | Total: 0.0% (13.0ms) | Samples: 0

**Called by:**
- `withUpdateTagContext` (8)
- `replaceTransformedSnapshot` (2)

**Calls:**
- `(anonymous)` (2)
- `(anonymous)` (2)
- `(anonymous)` (2)
- `(anonymous)` (1)
- `(anonymous)` (1)
- `(anonymous)` (1)
- `(anonymous)` (1)

### `validateDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3485` | Self: 0.0% (0us) | Total: 0.1% (311.1ms) | Samples: 0

**Called by:**
- `(anonymous)` (245)

**Calls:**
- `iterChangedRanges` (245)

### `freezeRootClassification`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:276` | Self: 0.0% (0us) | Total: 0.3% (754.5ms) | Samples: 0

**Called by:**
- `DocumentChange` (595)

**Calls:**
- `assertJsonValue` (595)

### `indexConstructedRoot`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:946` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `applyTrustedCanonical` (1)

**Calls:**
- `getDeclarativeSchema` (1)

### `replaceCanonicalChildWindow`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:941` | Self: 0.0% (0us) | Total: 0.0% (2.8ms) | Samples: 0

**Called by:**
- `(anonymous)` (2)

**Calls:**
- `nodeAtPath` (2)

### `reconcileChildrenStep`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:3174` | Self: 0.0% (0us) | Total: 1.0% (2.25s) | Samples: 0

**Called by:**
- `(anonymous)` (1784)

**Calls:**
- `fromNodes` (1784)

### `assertSelectionSupported`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:707` | Self: 0.0% (0us) | Total: 0.0% (15.1ms) | Samples: 0

**Called by:**
- `setCurrentSelection` (9)
- `mapSelectionThroughChange` (3)

**Calls:**
- `getSelectionRanges` (8)
- `getSelectionRanges` (3)
- `freeze` (1)

### `validateContentIndexes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3412` | Self: 0.0% (0us) | Total: 0.0% (34.7ms) | Samples: 0

**Called by:**
- `validateDocumentChange` (27)
- `validateSubtree` (1)

**Calls:**
- `validationContentAllows` (28)

### `validateDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3658` | Self: 0.0% (0us) | Total: 0.0% (56.1ms) | Samples: 0

**Called by:**
- `(anonymous)` (45)

**Calls:**
- `performProxyObjectGet` (41)
- `bound get` (4)

### `notifyAnchorChanges`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:424` | Self: 0.0% (0us) | Total: 0.0% (3.8ms) | Samples: 0

**Called by:**
- `(anonymous)` (3)

**Calls:**
- `getAffectedAnchorListeners` (3)

### `update`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-lifecycle-api.ts:425` | Self: 0.0% (0us) | Total: 79.1% (167.90s) | Samples: 0

**Called by:**
- `(host)` (131688)

**Calls:**
- `withUpdateTagContext` (131674)
- `withUpdateTagContext` (8)
- `compileEditorUpdatePolicy` (3)
- `(anonymous)` (1)
- `updateEditor` (1)
- `compileEditorUpdatePolicy` (1)

### `reconcileChildrenStep`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:3181` | Self: 0.0% (0us) | Total: 0.0% (140.2ms) | Samples: 0

**Called by:**
- `(anonymous)` (111)

**Calls:**
- `fromValue` (111)

### `readOwnerDeclaration`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:436` | Self: 0.0% (0us) | Total: 0.0% (175.6ms) | Samples: 0

**Called by:**
- `visitOwnerDeclarations` (135)

**Calls:**
- `performProxyObjectGet` (135)

### `reconcileChildrenStep`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:3148` | Self: 0.0% (0us) | Total: 0.0% (14.2ms) | Samples: 0

**Called by:**
- `(anonymous)` (11)

**Calls:**
- `slice` (11)

### `deriveRootRelocations`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:260` | Self: 0.0% (0us) | Total: 0.0% (39.3ms) | Samples: 0

**Called by:**
- `getRootChangeRelocations` (31)

**Calls:**
- `groupRelocationCandidates` (22)
- `groupRelocationCandidates` (5)
- `groupRelocationCandidates` (2)
- `groupRelocationCandidates` (2)

### `apply`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:483` | Self: 0.0% (0us) | Total: 0.0% (1.0ms) | Samples: 0

**Called by:**
- `prepareFittedDocument` (1)

**Calls:**
- `get empty` (1)

### `applyTrustedCanonical`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:616` | Self: 0.0% (0us) | Total: 0.0% (5.6ms) | Samples: 0

**Called by:**
- `applyDocumentChange` (4)

**Calls:**
- `indexConstructedRoot` (3)
- `indexConstructedRoot` (1)

### `setCurrentSelection`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6313` | Self: 0.0% (0us) | Total: 0.5% (1.10s) | Samples: 0

**Called by:**
- `applyTransactionSpecDocumentChangeStep` (844)
- `(anonymous)` (23)

**Calls:**
- `createEditorDocumentValue` (857)
- `createEditorDocumentValue` (2)
- `(anonymous)` (2)
- `createEditorDocumentValue` (1)
- `freeze` (1)
- `withEditorRootChildren` (1)
- `createEditorDocumentValue` (1)
- `createEditorDocumentValue` (1)
- `(anonymous)` (1)

### `fit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3042` | Self: 0.0% (0us) | Total: 0.0% (3.9ms) | Samples: 0

**Called by:**
- `(anonymous)` (3)

**Calls:**
- `(anonymous)` (3)

### `protectedInlineSpacersFor`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1022` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `getProtectedInlineSpacerNodes` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1686` | Self: 0.0% (0us) | Total: 0.1% (270.2ms) | Samples: 0

**Called by:**
- `fit` (214)

**Calls:**
- `validateSliceVocabulary` (214)

### `getChangeValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6760` | Self: 0.0% (0us) | Total: 0.0% (2.4ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (2)

**Calls:**
- `freeze` (2)

### `getChangeValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6750` | Self: 0.0% (0us) | Total: 0.0% (5.2ms) | Samples: 0

**Called by:**
- `reconcileExclusiveElementOwnedRoots` (4)

**Calls:**
- `find` (4)

### `deriveRootRelocations`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:271` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `getRootChangeRelocations` (1)

**Calls:**
- `get` (1)

### `internal:stream`
`internal:stream:2` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `anonymous` (1)

**Calls:**
- `anonymous` (1)

### `getSnapshot`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6497` | Self: 0.0% (0us) | Total: 0.0% (1.0ms) | Samples: 0

**Called by:**
- `getCurrentRuntimeIndex` (1)

**Calls:**
- `getCachedSnapshot` (1)

### `compose`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1058` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `apply` (1)

**Calls:**
- `Set` (1)

### `constructCanonicalDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1117` | Self: 0.0% (0us) | Total: 0.6% (1.39s) | Samples: 0

**Called by:**
- `finalize` (1092)

**Calls:**
- `canonicalizeDeclarativeChildren` (1077)
- `canonicalizeDeclarativeChildren` (15)

### `isVoid`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3774` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `levels` (1)

**Calls:**
- `getElementBehavior` (1)

### `deepFreeze`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/clone.ts:4` | Self: 0.0% (0us) | Total: 0.0% (3.5ms) | Samples: 0

**Called by:**
- `deepFreeze` (1)
- `createEditorCommit` (1)

**Calls:**
- `isFrozen` (2)

### `replaceCanonicalChildWindow`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:804` | Self: 0.0% (0us) | Total: 0.0% (5.1ms) | Samples: 0

**Called by:**
- `(anonymous)` (4)

**Calls:**
- `getDescendant` (2)
- `getDescendant` (1)
- `getDescendant` (1)

### `validateSliceVocabulary`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2826` | Self: 0.0% (0us) | Total: 0.1% (270.2ms) | Samples: 0

**Called by:**
- `(anonymous)` (214)

**Calls:**
- `forEach` (214)

### `runEditorTransaction`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7816` | Self: 0.0% (0us) | Total: 0.4% (924.4ms) | Samples: 0

**Called by:**
- `withUpdateTagContext` (708)
- `runTrustedUpdate` (8)
- `invoke` (4)
- `replaceTransformedSnapshot` (1)

**Calls:**
- `createEditorUpdateDraftContext` (696)
- `createEditorUpdateDraftContext` (5)
- `createEditorUpdateDraftContext` (4)
- `createEditorUpdateDraftContext` (3)
- `createEditorUpdateDraftContext` (3)
- `createEditorUpdateDraftContext` (2)
- `createEditorUpdateDraftContext` (1)
- `createEditorUpdateDraftContext` (1)
- `createEditorUpdateDraftContext` (1)
- `createEditorUpdateDraftContext` (1)
- `createEditorUpdateDraftContext` (1)
- `createEditorUpdateDraftContext` (1)
- `createEditorUpdateDraftContext` (1)
- `createEditorUpdateDraftContext` (1)

### `internal:util/colors`
`internal:util/colors:24` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `anonymous` (1)

**Calls:**
- `refresh` (1)

### `fit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3003` | Self: 0.0% (0us) | Total: 0.6% (1.30s) | Samples: 0

**Called by:**
- `(anonymous)` (1019)

**Calls:**
- `fromValue` (1008)
- `remember` (11)

### `applyDocumentChangeStep`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6949` | Self: 0.0% (0us) | Total: 49.7% (105.44s) | Samples: 0

**Called by:**
- `apply` (82760)
- `applyBuiltDocumentChange` (5)

**Calls:**
- `applyTransactionSpecDocumentChangeStep` (82731)
- `applyTransactionSpecDocumentChangeStep` (34)

### `apply`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:426` | Self: 0.0% (0us) | Total: 0.0% (87.8ms) | Samples: 0

**Called by:**
- `applyCanonical` (62)
- `(anonymous)` (6)
- `applyBuiltDocumentChange` (2)

**Calls:**
- `classifyRootChangeWithRuntimeCandidates` (17)
- `classifyRootChangeWithRuntimeCandidates` (10)
- `classifyRootChangeWithRuntimeCandidates` (7)
- `classifyRootChangeWithRuntimeCandidates` (7)
- `classifyRootChangeWithRuntimeCandidates` (5)
- `classifyRootChangeWithRuntimeCandidates` (5)
- `classifyRootChangeWithRuntimeCandidates` (2)
- `classifyRootChangeWithRuntimeCandidates` (2)
- `classifyRootChangeWithRuntimeCandidates` (2)
- `classifyRootChangeWithRuntimeCandidates` (2)
- `classifyRootChangeWithRuntimeCandidates` (2)
- `classifyRootChangeWithRuntimeCandidates` (2)
- `classifyRootChangeWithRuntimeCandidates` (2)
- `classifyRootChangeWithRuntimeCandidates` (1)
- `classifyRootChangeWithRuntimeCandidates` (1)
- `classifyRootChangeWithRuntimeCandidates` (1)
- `classifyRootChangeWithRuntimeCandidates` (1)
- `classifyRootChangeWithRuntimeCandidates` (1)

### `assertNode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:904` | Self: 0.0% (0us) | Total: 0.0% (88.6ms) | Samples: 0

**Called by:**
- `encode` (55)
- `decodeNodes` (14)

**Calls:**
- `forEach` (69)

### `advancePathStableSnapshotIndex`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1784` | Self: 0.0% (0us) | Total: 0.0% (6.0ms) | Samples: 0

**Called by:**
- `inheritDocumentChangeStepNodeKeys` (5)

**Calls:**
- `nodeAtPath` (2)
- `nodeAtPath` (2)
- `node` (1)

### `classifyRootChangeWithRuntimeCandidates`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:97` | Self: 0.0% (0us) | Total: 0.0% (3.5ms) | Samples: 0

**Called by:**
- `apply` (2)
- `classifyRootChange` (1)

**Calls:**
- `movedNode` (3)

### `isText`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:196` | Self: 0.0% (0us) | Total: 0.0% (12.7ms) | Samples: 0

**Called by:**
- `mapSelectionWithContext` (5)
- `withoutPendingMarks` (2)
- `assertSelectionSupported` (1)
- `assertSelectionSupported` (1)
- `assertBuiltInSelection` (1)

**Calls:**
- `isStrictPoint` (7)
- `isStrictPoint` (3)

### `rememberValidatedDocumentRoots`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3128` | Self: 0.0% (0us) | Total: 0.0% (3.6ms) | Samples: 0

**Called by:**
- `(anonymous)` (3)

**Calls:**
- `getValidationAuthority` (3)

### `deriveRootRelocations`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:264` | Self: 0.0% (0us) | Total: 0.2% (603.9ms) | Samples: 0

**Called by:**
- `getRootChangeRelocations` (470)

**Calls:**
- `groupRelocationCandidates` (403)
- `groupRelocationCandidates` (30)
- `groupRelocationCandidates` (21)
- `groupRelocationCandidates` (13)
- `groupRelocationCandidates` (1)
- `groupRelocationCandidates` (1)
- `groupRelocationCandidates` (1)

### `runEditorTransaction`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7829` | Self: 0.0% (0us) | Total: 0.0% (8.3ms) | Samples: 0

**Called by:**
- `withUpdateTagContext` (7)

**Calls:**
- `reconcileExclusiveElementOwnedRoots` (4)
- `reconcileExclusiveElementOwnedRoots` (3)

### `recordFacetDraftDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/facet.ts:139` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `applyTransactionSpecDocumentChangeStep` (1)

**Calls:**
- `performIteration` (1)

### `getUpdateView`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5190` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `freeze` (1)

### `apply`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:441` | Self: 0.0% (0us) | Total: 0.0% (65.9ms) | Samples: 0

**Called by:**
- `applyCanonical` (39)
- `(anonymous)` (8)
- `applyBuiltDocumentChange` (1)
- `prepareFittedDocument` (1)

**Calls:**
- `createInternalDocumentChange` (47)
- `createInternalDocumentChange` (1)
- `constructDocumentChange` (1)

### `measureCohort`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:417` | Self: 0.0% (0us) | Total: 19.3% (41.09s) | Samples: 0

**Called by:**
- `(anonymous)` (32145)

**Calls:**
- `measure` (32144)
- `(anonymous)` (1)

### `internal:validators`
`internal:validators:48` | Self: 0.0% (0us) | Total: 0.0% (2.3ms) | Samples: 0

**Called by:**
- `anonymous` (1)

**Calls:**
- `hideFromStack` (1)

### `fit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1774` | Self: 0.0% (0us) | Total: 0.0% (1.0ms) | Samples: 0

**Called by:**
- `fitRoot` (1)

**Calls:**
- `edges` (1)

### `deriveRootRelocations`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:258` | Self: 0.0% (0us) | Total: 0.1% (236.7ms) | Samples: 0

**Called by:**
- `getRootChangeRelocations` (187)

**Calls:**
- `collectRelocationCandidates` (113)
- `collectRelocationCandidates` (32)
- `collectRelocationCandidates` (14)
- `collectRelocationCandidates` (11)
- `collectRelocationCandidates` (8)
- `collectRelocationCandidates` (7)
- `collectRelocationCandidates` (2)

### `setNodeKey`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:168` | Self: 0.0% (0us) | Total: 0.0% (6.9ms) | Samples: 0

**Called by:**
- `advancePathStableSnapshotIndex` (5)

**Calls:**
- `getNodeKeys` (5)

### `notifyAnchorChanges`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:437` | Self: 0.0% (0us) | Total: 0.0% (69.6ms) | Samples: 0

**Called by:**
- `(anonymous)` (55)

**Calls:**
- `change` (55)

### `visitOwnerDeclarations`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:616` | Self: 0.0% (0us) | Total: 0.0% (103.3ms) | Samples: 0

**Called by:**
- `(anonymous)` (81)

**Calls:**
- `next` (81)

### `getEditorSchemaDeclarationKey`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts:1889` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `(module)` (1)

**Calls:**
- `prepareEditorSchemaRecords` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1209` | Self: 0.0% (0us) | Total: 0.0% (8.5ms) | Samples: 0

**Called by:**
- `constructCanonicalDocumentChange` (7)

**Calls:**
- `sort` (7)

### `fit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3156` | Self: 0.0% (0us) | Total: 49.7% (105.43s) | Samples: 0

**Called by:**
- `(anonymous)` (82760)

**Calls:**
- `apply` (82760)

### `DocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:730` | Self: 0.0% (0us) | Total: 0.0% (5.7ms) | Samples: 0

**Called by:**
- `constructDocumentChange` (4)

**Calls:**
- `filter` (3)
- `performIteration` (1)

### `fromPreparedNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:637` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `encodeContentSliceContent` (1)

**Calls:**
- `freeze` (1)

### `fitDirectContent`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:324` | Self: 0.0% (0us) | Total: 0.0% (98.1ms) | Samples: 0

**Called by:**
- `fit` (41)
- `fitClosedNode` (36)

**Calls:**
- `allContentAllowed` (65)
- `allContentAllowed` (7)
- `every` (5)

### `insertText`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/transforms-text/insert-text.ts:168` | Self: 0.0% (0us) | Total: 0.0% (7.7ms) | Samples: 0

**Called by:**
- `applyInsertText` (6)

**Calls:**
- `getPublicSelection` (5)
- `projectSelectionRange` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:2856` | Self: 0.0% (0us) | Total: 0.0% (144.8ms) | Samples: 0

**Called by:**
- `fit` (114)

**Calls:**
- `encodeContentSlice` (114)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5110` | Self: 0.0% (0us) | Total: 0.0% (35.3ms) | Samples: 0

**Called by:**
- `withEditorUpdateRoot` (28)

**Calls:**
- `applyInsertTextCommand` (28)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8391` | Self: 0.0% (0us) | Total: 6.9% (14.71s) | Samples: 0

**Called by:**
- `runEditorTransaction` (10387)
- `runEditorTransaction` (1198)

**Calls:**
- `fitDocument` (11580)
- `fitDocument` (4)
- `fitDocument` (1)

### `getUpdateView`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4861` | Self: 0.0% (0us) | Total: 0.0% (2.7ms) | Samples: 0

**Called by:**
- `(anonymous)` (2)

**Calls:**
- `freeze` (2)

### `applyRoot`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:1082` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `Map` (1)

### `fork`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:215` | Self: 0.0% (0us) | Total: 0.0% (1.0ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `ChangeDraft` (1)

### `finalizeTransactionSpecContext`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5465` | Self: 0.0% (0us) | Total: 0.0% (1.5ms) | Samples: 0

**Called by:**
- `buildTransactionSpec` (1)

**Calls:**
- `areJsonValuesStructurallyEqual` (1)

### `createEditorUpdateDraftContext`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7693` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (1)

**Calls:**
- `Set` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:362` | Self: 0.0% (0us) | Total: 0.0% (21.7ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (17)

**Calls:**
- `withEditorUpdateRoot` (16)
- `runTargetMutation` (1)

### `cloneEditorJsonValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:235` | Self: 0.0% (0us) | Total: 0.0% (4.4ms) | Samples: 0

**Called by:**
- `(anonymous)` (3)

**Calls:**
- `fromEntries` (3)

### `mapSnapshotIndexThroughChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1417` | Self: 0.0% (0us) | Total: 0.0% (103.4ms) | Samples: 0

**Called by:**
- `inheritDocumentChangeStepNodeKeys` (82)

**Calls:**
- `compactMappingSegments` (82)

### `reconcileChildrenStep`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:3180` | Self: 0.0% (0us) | Total: 0.0% (157.2ms) | Samples: 0

**Called by:**
- `(anonymous)` (124)

**Calls:**
- `fromValue` (124)

### `hasInlineContent`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:92` | Self: 0.0% (0us) | Total: 0.0% (71.5ms) | Samples: 0

**Called by:**
- `canonicalizeDirectChildren` (56)
- `replaceCanonicalChildWindow` (1)

**Calls:**
- `isInline` (57)

### `applyTrustedCanonical`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:686` | Self: 0.0% (0us) | Total: 0.0% (37.9ms) | Samples: 0

**Called by:**
- `applyDocumentChange` (30)

**Calls:**
- `createInternalDocumentChange` (27)
- `createInternalDocumentChange` (3)

### `claimSource`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:94` | Self: 0.0% (0us) | Total: 0.0% (2.4ms) | Samples: 0

**Called by:**
- `decodeNodes` (2)

**Calls:**
- `forEach` (2)

### `readEditor`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5809` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `(host)` (1)

**Calls:**
- `enterEditorRead` (1)

### `getCompiled`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3303` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `fitDocument` (1)

**Calls:**
- `(anonymous)` (1)

### `between`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1478` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `between` (1)

**Calls:**
- `jsonEqual` (1)

### `stage`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:2522` | Self: 0.0% (0us) | Total: 0.0% (1.0ms) | Samples: 0

**Called by:**
- `publishInitialEditorExtensions` (1)

**Calls:**
- `stageFields` (1)

### `prepare`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:266` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `prepareFittedDocument` (1)

**Calls:**
- `generatorResume` (1)

### `apply`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:442` | Self: 0.0% (0us) | Total: 0.0% (7.9ms) | Samples: 0

**Called by:**
- `applyCanonical` (5)
- `prepareFittedDocument` (1)

**Calls:**
- `Map` (6)

### `validateSubtree`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3613` | Self: 0.0% (0us) | Total: 0.0% (23.5ms) | Samples: 0

**Called by:**
- `validateDocumentChange` (19)

**Calls:**
- `Set` (10)
- `map` (9)

### `rootedQueryGenerator`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-read-runtime.ts:120` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `generatorResume` (1)

**Calls:**
- `generatorResume` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:2659` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `flatIntoArrayWithCallback` (1)

**Calls:**
- `createExtensionRecord` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8117` | Self: 0.0% (0us) | Total: 0.0% (4.4ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (3)

**Calls:**
- `commitAnchorTransaction` (1)
- `commitAnchorTransaction` (1)
- `commitAnchorTransaction` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2398` | Self: 0.0% (0us) | Total: 0.0% (185.7ms) | Samples: 0

**Called by:**
- `applyIndexed` (145)

**Calls:**
- `decodeNodes` (96)
- `decodeNodes` (38)
- `decodeNodes` (5)
- `decodeNodes` (3)
- `decodeNodes` (3)

### `(module)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-contribution-registry.ts:55` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `evaluate` (1)

**Calls:**
- `getEditorSchemaDeclarationKey` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8025` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (1)

**Calls:**
- `next` (1)

### `assertSelectionSupported`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:690` | Self: 0.0% (0us) | Total: 0.0% (16.1ms) | Samples: 0

**Called by:**
- `mapSelectionThroughChange` (8)
- `setCurrentSelection` (4)

**Calls:**
- `isText` (6)
- `isSelection` (3)
- `isText` (2)
- `isText` (1)

### `measureConnectDisconnectHeap`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:354` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `measureCohort` (1)

**Calls:**
- `createFakeCollabAdapter` (1)

### `fitDocumentInput`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3258` | Self: 0.0% (0us) | Total: 0.6% (1.31s) | Samples: 0

**Called by:**
- `fitDocument` (1041)

**Calls:**
- `assertDocument` (1041)

### `internal:streams/operators`
`internal:streams/operators:2` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `anonymous` (1)

**Calls:**
- `anonymous` (1)

### `classifyDocumentRange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:80` | Self: 0.0% (0us) | Total: 0.0% (4.9ms) | Samples: 0

**Called by:**
- `classifyRootChangeWithRuntimeCandidates` (4)

**Calls:**
- `filter` (4)

### `isEditorJsonValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:135` | Self: 0.0% (0us) | Total: 4.6% (9.89s) | Samples: 0

**Called by:**
- `every` (7205)
- `assertJsonValue` (575)

**Calls:**
- `getEditorJsonRecordEntries` (3308)
- `getEditorJsonRecordEntries` (2652)
- `getEditorJsonRecordEntries` (1712)
- `getEditorJsonRecordEntries` (108)

### `sealElementOwnedRootIndex`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:1100` | Self: 0.0% (0us) | Total: 0.0% (3.8ms) | Samples: 0

**Called by:**
- `rememberValidatedDocumentRoots` (3)

**Calls:**
- `freeze` (2)
- `cloneObject` (1)

### `pointAt`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:262` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `mapTextOffset` (1)

**Calls:**
- `seek` (1)

### `publicPoint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:125` | Self: 0.0% (0us) | Total: 0.0% (7.2ms) | Samples: 0

**Called by:**
- `mapPoint` (4)
- `mapRange` (1)

**Calls:**
- `freeze` (5)

### `rememberValidatedDocumentRoots`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3130` | Self: 0.0% (0us) | Total: 0.0% (2.6ms) | Samples: 0

**Called by:**
- `adoptDocumentBaseline` (1)
- `(anonymous)` (1)

**Calls:**
- `entries` (2)

### `getRootChangeRelocations`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:341` | Self: 0.0% (0us) | Total: 0.4% (913.8ms) | Samples: 0

**Called by:**
- `getSegmentRelocations` (714)

**Calls:**
- `deriveRootRelocations` (470)
- `deriveRootRelocations` (187)
- `deriveRootRelocations` (31)
- `deriveRootRelocations` (25)
- `deriveRootRelocations` (1)

### `withUpdateTagContext`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:1716` | Self: 0.0% (0us) | Total: 0.0% (10.1ms) | Samples: 0

**Called by:**
- `update` (8)

**Calls:**
- `pushUpdateTagContext` (7)
- `pushUpdateTagContext` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3181` | Self: 0.0% (0us) | Total: 10.9% (23.21s) | Samples: 0

**Called by:**
- `assertDocument` (18133)

**Calls:**
- `validateDeclarativeDocument` (14024)
- `validateDeclarativeDocument` (2947)
- `validateDeclarativeDocument` (1144)
- `validateDeclarativeDocument` (4)
- `validateDeclarativeDocument` (4)
- `validateDeclarativeDocument` (4)
- `validateDeclarativeDocument` (2)
- `validateDeclarativeDocument` (2)
- `validateDeclarativeDocument` (1)
- `validateDeclarativeDocument` (1)

### `applyAnchorChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:272` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `notifyAnchorChanges` (1)

**Calls:**
- `Map` (1)

### `applyIndexed`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2273` | Self: 0.0% (0us) | Total: 0.2% (621.0ms) | Samples: 0

**Called by:**
- `applyInternal` (491)

**Calls:**
- `withDecodedSplicedNodes` (440)
- `remember` (51)

### `validateDeclarativeNodeProperties`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2555` | Self: 0.0% (0us) | Total: 0.1% (359.0ms) | Samples: 0

**Called by:**
- `(anonymous)` (272)
- `validateSubtree` (2)

**Calls:**
- `getTextProperties` (274)

### `getUpdateView`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5154` | Self: 0.0% (0us) | Total: 0.0% (1.0ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `performProxyObjectGet` (1)

### `constructCanonicalDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1196` | Self: 0.0% (0us) | Total: 0.0% (3.6ms) | Samples: 0

**Called by:**
- `assertCanonical` (3)

**Calls:**
- `getRootContent` (2)
- `getRootContent` (1)

### `transformImplicitTarget`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6380` | Self: 0.0% (0us) | Total: 0.0% (2.7ms) | Samples: 0

**Called by:**
- `applyTransactionSpecDocumentChangeStep` (2)

**Calls:**
- `getTransactionSnapshot` (2)

### `mapSelectionWithContext`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:840` | Self: 0.0% (0us) | Total: 0.0% (47.7ms) | Samples: 0

**Called by:**
- `mapSelectionThroughChange` (33)

**Calls:**
- `mapRange` (20)
- `mapRange` (13)

### `applyIndexed`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2370` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `applyInternal` (1)

**Calls:**
- `nodeRangesTouching` (1)

### `freezeMap`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:191` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `finalizeExtensionRegistry` (1)

**Calls:**
- `Map` (1)

### `getUpdateView`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4115` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `defineSemanticUpdateMethod` (1)

### `remember`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:539` | Self: 0.0% (0us) | Total: 0.5% (1.20s) | Samples: 0

**Called by:**
- `applyIndexed` (630)
- `insertText` (194)
- `applyIndexed` (51)
- `reconcileChildrenStep` (33)
- `fromValue` (13)
- `fit` (11)
- `applyInternal` (9)
- `applyIndexed` (3)
- `between` (2)
- `getIndex` (1)

**Calls:**
- `isFrozen` (947)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:328` | Self: 0.0% (0us) | Total: 0.0% (3.9ms) | Samples: 0

**Called by:**
- `withSplicedNodes` (2)
- `withDecodedSplicedNodes` (1)

**Calls:**
- `performIteration` (3)

### `applyIndexed`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2402` | Self: 0.0% (0us) | Total: 0.0% (14.8ms) | Samples: 0

**Called by:**
- `applyInternal` (12)

**Calls:**
- `withDecodedSplicedNodes` (9)
- `remember` (3)

### `claim`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1016` | Self: 0.0% (0us) | Total: 0.0% (12.9ms) | Samples: 0

**Called by:**
- `mapChangedNodeKeys` (10)

**Calls:**
- `getNodeKeyForNode` (10)

### `node:stream`
`node:stream:2` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `anonymous` (1)

**Calls:**
- `anonymous` (1)

### `getTransactionSnapshot`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:582` | Self: 0.0% (0us) | Total: 0.0% (5.4ms) | Samples: 0

**Called by:**
- `transformImplicitTarget` (2)
- `runEditorTransaction` (1)
- `getProtectedInlineSpacerNodes` (1)

**Calls:**
- `getTransactionSpecContext` (4)

### `mapPoint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:413` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `mapRange` (1)

**Calls:**
- `performProxyObjectGet` (1)

### `createEditorUpdateDraftContext`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7727` | Self: 0.0% (0us) | Total: 0.4% (891.4ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (696)

**Calls:**
- `createEditorDocumentValue` (694)
- `createEditorDocumentValue` (1)
- `createEditorDocumentValue` (1)

### `jsonEqual`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:126` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `every` (1)

**Calls:**
- `isArray` (1)

### `between`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1561` | Self: 0.0% (0us) | Total: 0.0% (4.7ms) | Samples: 0

**Called by:**
- `between` (4)

**Calls:**
- `createStructurallyAlignedChanges` (4)

### `isSelection`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:187` | Self: 0.0% (0us) | Total: 0.0% (4.2ms) | Samples: 0

**Called by:**
- `assertSelectionSupported` (3)

**Calls:**
- `isText` (2)
- `isText` (1)

### `get`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts:637` | Self: 0.0% (0us) | Total: 0.0% (26.6ms) | Samples: 0

**Called by:**
- `performProxyObjectGet` (21)

**Calls:**
- `get` (21)

### `createAnchor`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts:257` | Self: 0.0% (0us) | Total: 0.0% (1.0ms) | Samples: 0

**Called by:**
- `from` (1)

**Calls:**
- `createPointState` (1)

### `collectChangedElementPaths`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:917` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `mapSnapshotIndexThroughChange` (1)

**Calls:**
- `performIteration` (1)

### `compactMappingSegments`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:436` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `advancePathStableSnapshotIndex` (1)

**Calls:**
- `at` (1)

### `mapChangedNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:999` | Self: 0.0% (0us) | Total: 0.0% (7.2ms) | Samples: 0

**Called by:**
- `mapSnapshotIndexThroughChange` (5)

**Calls:**
- `orderPaths` (3)
- `sort` (2)

### `getContentEndOffset`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1276` | Self: 0.0% (0us) | Total: 1.1% (2.36s) | Samples: 0

**Called by:**
- `(anonymous)` (1858)

**Calls:**
- `materializeTokens` (1341)
- `materializeTokens` (429)
- `materializeTokens` (39)
- `materializeTokens` (38)
- `materializeTokens` (11)

### `compose`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1054` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `apply` (1)

**Calls:**
- `map` (1)

### `continuityScore`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:947` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `from` (1)

**Calls:**
- `getProperties` (1)

### `fitClosedSliceInterior`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:665` | Self: 0.0% (0us) | Total: 0.2% (634.2ms) | Samples: 0

**Called by:**
- `fit` (498)

**Calls:**
- `visit` (470)
- `visit` (23)
- `visit` (3)
- `visit` (2)

### `validateDeclarativeNodeProperties`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2553` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `isText` (1)

### `snapshotContentSlice`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:192` | Self: 0.0% (0us) | Total: 0.4% (946.9ms) | Samples: 0

**Called by:**
- `snapshot` (735)

**Calls:**
- `snapshotSliceContent` (564)
- `freeze` (106)
- `snapshotSliceContent` (65)

### `isDeepFrozenNode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3123` | Self: 0.0% (0us) | Total: 0.8% (1.76s) | Samples: 0

**Called by:**
- `every` (1382)
- `(anonymous)` (2)

**Calls:**
- `every` (1384)

### `notifyAnchorChanges`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:407` | Self: 0.0% (0us) | Total: 0.0% (8.5ms) | Samples: 0

**Called by:**
- `applyTransactionSpecDocumentChangeStep` (7)

**Calls:**
- `applyAnchorChange` (2)
- `applyAnchorChange` (1)
- `applyAnchorChange` (1)
- `applyAnchorChange` (1)
- `applyAnchorChange` (1)
- `applyAnchorChange` (1)

### `measureConnectDisconnectHeap`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:353` | Self: 0.0% (0us) | Total: 1.7% (3.76s) | Samples: 0

**Called by:**
- `measureCohort` (2943)

**Calls:**
- `createEditorWithDocument` (2938)
- `createEditorWithDocument` (3)
- `createEditorWithDocument` (2)

### `getPathByNodeKey`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts:456` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `getPathByNodeKey` (1)

### `recordFacetDraftDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/facet.ts:137` | Self: 0.0% (0us) | Total: 0.0% (2.3ms) | Samples: 0

**Called by:**
- `applyTransactionSpecDocumentChangeStep` (2)

**Calls:**
- `getInternalDocumentChangeEntries` (1)
- `map` (1)

### `applyTransactionSpecDocumentChangeStep`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7422` | Self: 0.0% (0us) | Total: 0.0% (5.5ms) | Samples: 0

**Called by:**
- `applyDocumentChange` (4)

**Calls:**
- `performIteration` (4)

### `classifyDocumentRange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:66` | Self: 0.0% (0us) | Total: 0.0% (2.3ms) | Samples: 0

**Called by:**
- `classifyRootChangeWithRuntimeCandidates` (2)

**Calls:**
- `sort` (2)

### `link`
`[native code]` | Self: 0.0% (0us) | Total: 0.0% (57.1ms) | Samples: 0

**Called by:**
- `link` (24)
- `linkAndEvaluateModule` (3)

**Calls:**
- `link` (24)
- `moduleDeclarationInstantiation` (3)

### `apply`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:485` | Self: 0.0% (0us) | Total: 0.0% (72.3ms) | Samples: 0

**Called by:**
- `(anonymous)` (58)

**Calls:**
- `compose` (42)
- `compose` (3)
- `createInternalDocumentChange` (2)
- `compose` (1)
- `compose` (1)
- `compose` (1)
- `compose` (1)
- `compose` (1)
- `compose` (1)
- `compose` (1)
- `compose` (1)
- `compose` (1)
- `compose` (1)
- `compose` (1)

### `createEditorImplementation`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts:665` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `createEditorWithDocument` (1)

**Calls:**
- `registerEffectTypeInRegistry` (1)

### `getExtensionRegistryStore`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:579` | Self: 0.0% (0us) | Total: 0.0% (5.2ms) | Samples: 0

**Called by:**
- `initializeBaseExtensionRegistry` (4)

**Calls:**
- `createExtensionRegistryStore` (4)

### `validateConstructed`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6908` | Self: 0.0% (0us) | Total: 0.6% (1.43s) | Samples: 0

**Called by:**
- `finalize` (1130)

**Calls:**
- `(anonymous)` (1130)

### `createEditorDocumentValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:855` | Self: 0.0% (0us) | Total: 0.0% (2.3ms) | Samples: 0

**Called by:**
- `setCurrentSelection` (2)

**Calls:**
- `filter` (2)

### `assertSelectionSupported`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:710` | Self: 0.0% (0us) | Total: 0.0% (3.8ms) | Samples: 0

**Called by:**
- `mapSelectionThroughChange` (2)
- `setCurrentSelection` (1)

**Calls:**
- `isRange` (3)

### `createEditorImplementation`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts:607` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `createEditorWithDocument` (1)

**Calls:**
- `createEditorReadApi` (1)

### `constructCanonicalDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:994` | Self: 0.0% (0us) | Total: 0.0% (1.0ms) | Samples: 0

**Called by:**
- `assertCanonical` (1)

**Calls:**
- `Map` (1)

### `between`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:787` | Self: 0.0% (0us) | Total: 0.0% (5.2ms) | Samples: 0

**Called by:**
- `mapTextOffset` (4)

**Calls:**
- `fromValue` (4)

### `snapshotContentSlice`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:164` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `snapshot` (1)

**Calls:**
- `Map` (1)

### `composeSections`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:668` | Self: 0.0% (0us) | Total: 0.0% (106.9ms) | Samples: 0

**Called by:**
- `compose` (85)

**Calls:**
- `addSection` (85)

### `applyTrustedCanonical`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:683` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `applyDocumentChange` (1)

**Calls:**
- `set` (1)

### `finalizeExtensionRegistry`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:316` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `buildConfiguredRegistry` (1)

**Calls:**
- `freeze` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts:87` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `resolveMappedPoint` (1)

**Calls:**
- `getPathByNodeKey` (1)

### `buildTransactionSpec`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5675` | Self: 0.0% (0us) | Total: 56.1% (119.08s) | Samples: 0

**Called by:**
- `createRootFitTransactionSpec` (93474)

**Calls:**
- `(anonymous)` (93474)

### `mapSnapshotIndexThroughChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1382` | Self: 0.0% (0us) | Total: 0.0% (77.4ms) | Samples: 0

**Called by:**
- `inheritDocumentChangeStepNodeKeys` (61)

**Calls:**
- `freeze` (61)

### `composeSections`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:657` | Self: 0.0% (0us) | Total: 0.0% (107.0ms) | Samples: 0

**Called by:**
- `compose` (86)

**Calls:**
- `addSection` (84)
- `addSection` (1)
- `addSection` (1)

### `replaceCanonicalChildWindow`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:905` | Self: 0.0% (0us) | Total: 0.0% (1.0ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `filter` (1)

### `assertActiveTransaction`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:3835` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `assertActive` (1)

**Calls:**
- `isInTransaction` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:82` | Self: 0.0% (0us) | Total: 0.1% (301.5ms) | Samples: 0

**Called by:**
- `map` (239)

**Calls:**
- `nodeProps` (145)
- `node` (93)
- `nodeAtPath` (1)

### `encodeContentSliceContent`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:436` | Self: 0.0% (0us) | Total: 0.0% (144.8ms) | Samples: 0

**Called by:**
- `encodeContentSlice` (114)

**Calls:**
- `fromPreparedNodes` (113)
- `fromPreparedNodes` (1)

### `reconcileChildrenStep`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:3162` | Self: 0.0% (0us) | Total: 0.2% (502.6ms) | Samples: 0

**Called by:**
- `(anonymous)` (394)

**Calls:**
- `withSplicedNodes` (361)
- `remember` (33)

### `applyDocumentChangeWithIndexes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1305` | Self: 0.0% (0us) | Total: 0.0% (20.1ms) | Samples: 0

**Called by:**
- `apply` (8)
- `applyTrustedCanonical` (7)

**Calls:**
- `applyDocumentChangeValue` (5)
- `applyDocumentChangeValue` (5)
- `applyDocumentChangeValue` (1)
- `applyDocumentChangeValue` (1)
- `applyDocumentChangeValue` (1)
- `applyDocumentChangeValue` (1)
- `applyDocumentChangeValue` (1)

### `diffChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1183` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `createStructurallyAlignedChanges` (1)

**Calls:**
- `diffNode` (1)

### `buildConfiguredRegistry`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:1913` | Self: 0.0% (0us) | Total: 0.0% (2.3ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)
- `(anonymous)` (1)

**Calls:**
- `validateCompleteExtensionGraph` (1)
- `validateCompleteExtensionGraph` (1)

### `getStateFieldIdentityMap`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/state-fields.ts:25` | Self: 0.0% (0us) | Total: 0.0% (6.9ms) | Samples: 0

**Called by:**
- `createEditorUpdateDraftContext` (3)
- `(anonymous)` (2)

**Calls:**
- `Map` (5)

### `encode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:930` | Self: 0.0% (0us) | Total: 0.6% (1.34s) | Samples: 0

**Called by:**
- `forEach` (1063)

**Calls:**
- `forEach` (1063)

### `retainAddition`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1423` | Self: 0.0% (0us) | Total: 0.0% (2.8ms) | Samples: 0

**Called by:**
- `mapSnapshotIndexThroughChange` (2)

**Calls:**
- `mapPathForward` (1)
- `mapPathForward` (1)

### `createStructurallyAlignedChanges`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1200` | Self: 0.0% (0us) | Total: 0.0% (4.7ms) | Samples: 0

**Called by:**
- `between` (4)

**Calls:**
- `diffChildren` (2)
- `diffChildren` (1)
- `diffChildren` (1)

### `movedNode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2483` | Self: 0.0% (0us) | Total: 0.0% (4.7ms) | Samples: 0

**Called by:**
- `classifyRootChangeWithRuntimeCandidates` (3)
- `constructCanonicalDocumentChange` (1)

**Calls:**
- `replacements` (1)
- `replacements` (1)
- `replacements` (1)
- `replacements` (1)

### `collectProjectedRoots`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3213` | Self: 0.0% (0us) | Total: 0.0% (3.5ms) | Samples: 0

**Called by:**
- `fitDocumentInput` (3)

**Calls:**
- `collectProjectedRoots` (2)
- `collectProjectedRoots` (1)

### `constructCanonicalDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1126` | Self: 0.0% (0us) | Total: 0.0% (22.3ms) | Samples: 0

**Called by:**
- `finalize` (18)

**Calls:**
- `some` (18)

### `getSelectionOnlySnapshot`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6605` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (1)

**Calls:**
- `deepFreeze` (1)

### `DocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:729` | Self: 0.0% (0us) | Total: 0.0% (11.3ms) | Samples: 0

**Called by:**
- `constructDocumentChange` (9)

**Calls:**
- `freezeReadonlyMap` (5)
- `freezeReadonlyMap` (4)

### `buildConfiguredRegistry`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:1975` | Self: 0.0% (0us) | Total: 0.0% (7.4ms) | Samples: 0

**Called by:**
- `(anonymous)` (6)

**Calls:**
- `createEditorDocumentValue` (6)

### `mapSelectionThroughChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:875` | Self: 0.0% (0us) | Total: 0.0% (5.0ms) | Samples: 0

**Called by:**
- `applyTransactionSpecDocumentChangeStep` (4)

**Calls:**
- `root` (4)

### `advancePathStableSnapshotIndex`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1814` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `inheritDocumentChangeStepNodeKeys` (1)

**Calls:**
- `map` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:340` | Self: 0.0% (0us) | Total: 0.0% (7.7ms) | Samples: 0

**Called by:**
- `withSplicedNodes` (3)
- `withDecodedSplicedNodes` (3)

**Calls:**
- `createTreeIndexChildren` (6)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:341` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `measure` (1)

**Calls:**
- `(host)` (1)

### `validateDocument`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:2525` | Self: 0.0% (0us) | Total: 0.1% (381.7ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (301)

**Calls:**
- `validateCandidateDocument` (301)

### `getSnapshot`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6523` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `createEditorUpdateDraftContext` (1)

**Calls:**
- `setCachedSnapshot` (1)

### `constructCanonicalDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1099` | Self: 0.0% (0us) | Total: 0.7% (1.49s) | Samples: 0

**Called by:**
- `finalize` (1176)

**Calls:**
- `canonicalizeDeclarativeChildren` (1165)
- `canonicalizeDeclarativeChildren` (11)

### `applyIndexed`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2155` | Self: 0.0% (0us) | Total: 0.0% (2.5ms) | Samples: 0

**Called by:**
- `applyInternal` (2)

**Calls:**
- `stringify` (2)

### `replaceCanonicalChildWindow`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:816` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `slice` (1)

### `getEditorDocumentRoots`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:1819` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `getCurrentRootSnapshot` (1)

**Calls:**
- `getTransactionSpecContext` (1)

### `above`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/editor/above.ts:58` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `insertText` (1)

**Calls:**
- `generatorResume` (1)

### `(module)`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:437` | Self: 0.0% (0us) | Total: 99.9% (212.05s) | Samples: 0

**Called by:**
- `evaluate` (166411)

**Calls:**
- `map` (166411)

### `measure`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:198` | Self: 0.0% (0us) | Total: 78.2% (165.90s) | Samples: 0

**Called by:**
- `measureCohort` (88075)
- `measureCohort` (32144)
- `measureCohort` (3337)
- `measureCohort` (3298)
- `measureCohort` (3255)

**Calls:**
- `(anonymous)` (85114)
- `(anonymous)` (32144)
- `(anonymous)` (3337)
- `(anonymous)` (3083)
- `(anonymous)` (3051)
- `(anonymous)` (2961)
- `(anonymous)` (230)
- `(anonymous)` (171)
- `(anonymous)` (17)
- `(anonymous)` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:336` | Self: 0.0% (0us) | Total: 1.8% (3.93s) | Samples: 0

**Called by:**
- `measure` (3083)

**Calls:**
- `createEditorWithDocument` (3074)
- `createEditorWithDocument` (7)
- `createEditorWithDocument` (2)

### `between`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1550` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `between` (1)

**Calls:**
- `commonSuffixLength` (1)

### `measureCohort`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:423` | Self: 0.0% (0us) | Total: 1.9% (4.15s) | Samples: 0

**Called by:**
- `(anonymous)` (3255)

**Calls:**
- `measure` (3255)

### `replaceTransformedSnapshot`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8377` | Self: 0.0% (0us) | Total: 65.2% (138.29s) | Samples: 0

**Called by:**
- `replaceSnapshot` (108563)

**Calls:**
- `runEditorTransaction` (84985)
- `runEditorTransaction` (22463)
- `runEditorTransaction` (1007)
- `runEditorTransaction` (79)
- `runEditorTransaction` (20)
- `runEditorTransaction` (3)
- `runEditorTransaction` (2)
- `runEditorTransaction` (1)
- `runEditorTransaction` (1)
- `runEditorTransaction` (1)
- `runEditorTransaction` (1)

### `classifyRootChangeWithRuntimeCandidates`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:182` | Self: 0.0% (0us) | Total: 0.0% (4.3ms) | Samples: 0

**Called by:**
- `classify` (3)
- `apply` (1)

**Calls:**
- `some` (4)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1172` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `iterChangedRanges` (1)

**Calls:**
- `at` (1)

### `composeSections`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:632` | Self: 0.0% (0us) | Total: 0.0% (3.7ms) | Samples: 0

**Called by:**
- `compose` (3)

**Calls:**
- `freeze` (3)

### `mergeRegistries`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:478` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `createExtensionRegistryStore` (1)

**Calls:**
- `assertExtensionPointIdentities` (1)

### `isText`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/node.ts:955` | Self: 0.0% (0us) | Total: 0.0% (190.6ms) | Samples: 0

**Called by:**
- `isDeepFrozenNode` (120)
- `contentAllows` (12)
- `(anonymous)` (6)
- `getValidationNodeType` (4)
- `fitClosedNode` (3)
- `(anonymous)` (2)
- `validateDeclarativeNodeProperties` (1)

**Calls:**
- `isText` (148)

### `runEditorTransaction`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7828` | Self: 0.0% (0us) | Total: 0.6% (1.43s) | Samples: 0

**Called by:**
- `replaceTransformedSnapshot` (1007)
- `withUpdateTagContext` (124)
- `invoke` (2)

**Calls:**
- `finalizeTransactionRepresentation` (1133)

### `getChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:1797` | Self: 0.0% (0us) | Total: 0.0% (2.7ms) | Samples: 0

**Called by:**
- `getEditorDocumentRoots` (1)
- `(anonymous)` (1)

**Calls:**
- `getTransactionSpecContext` (2)

### `cloneObject`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1725` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `toSchemaValidationLocation` (1)

**Calls:**
- `every` (1)

### `createEditorWithDocument`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:89` | Self: 0.0% (0us) | Total: 0.0% (20.6ms) | Samples: 0

**Called by:**
- `runRemoteChangeBatch` (4)
- `(anonymous)` (2)
- `(anonymous)` (2)
- `(anonymous)` (2)
- `runRemoteChangesSeparately` (2)
- `measureAnchors` (2)
- `measureConnectDisconnectHeap` (2)

**Calls:**
- `from` (16)

### `invert`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2708` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `RootChange` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:2958` | Self: 0.0% (0us) | Total: 1.5% (3.32s) | Samples: 0

**Called by:**
- `fit` (2621)

**Calls:**
- `reconcileChildrenStep` (1784)
- `reconcileChildrenStep` (394)
- `reconcileChildrenStep` (144)
- `reconcileChildrenStep` (124)
- `reconcileChildrenStep` (111)
- `reconcileChildrenStep` (49)
- `reconcileChildrenStep` (11)
- `reconcileChildrenStep` (3)
- `reconcileChildrenStep` (1)

### `claim`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1004` | Self: 0.0% (0us) | Total: 0.0% (4.0ms) | Samples: 0

**Called by:**
- `mapChangedNodeKeys` (3)

**Calls:**
- `pathKey` (3)

### `mapInternalDocumentChangePosition`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:451` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `mapPoint` (1)

**Calls:**
- `copyDataProperties` (1)

### `getEditorDocumentRoots`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:1832` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `getChildren` (1)

### `getSelectionIds`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:751` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `getNodeKeys` (1)

**Calls:**
- `getSelectionNodeKeys` (1)

### `buildConfiguredRegistry`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:1960` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `finalizeExtensionRegistry` (1)

### `runRemoteChangesSeparately`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:237` | Self: 0.0% (0us) | Total: 2.5% (5.48s) | Samples: 0

**Called by:**
- `(anonymous)` (2900)
- `measureCohort` (1411)

**Calls:**
- `createEditorWithDocument` (4306)
- `createEditorWithDocument` (3)
- `createEditorWithDocument` (2)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/editor/insert-text.ts:123` | Self: 0.0% (0us) | Total: 0.0% (32.6ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (26)

**Calls:**
- `applyInsertText` (26)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:911` | Self: 0.0% (0us) | Total: 0.1% (262.6ms) | Samples: 0

**Called by:**
- `iterChangedRanges` (207)

**Calls:**
- `addRange` (108)
- `addRange` (69)
- `addRange` (16)
- `addRange` (6)
- `addRange` (5)
- `addRange` (2)
- `addRange` (1)

### `between`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:798` | Self: 0.0% (0us) | Total: 0.0% (6.4ms) | Samples: 0

**Called by:**
- `mapTextOffset` (5)

**Calls:**
- `classifyRootChange` (5)

### `encodeTrustedNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:878` | Self: 0.0% (0us) | Total: 0.0% (163.0ms) | Samples: 0

**Called by:**
- `materializeTokens` (129)

**Calls:**
- `forEach` (129)

### `hasChangeListeners`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:1092` | Self: 0.0% (0us) | Total: 0.0% (2.6ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (2)

**Calls:**
- `performProxyObjectGet` (2)

### `applyDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7466` | Self: 0.0% (0us) | Total: 0.6% (1.48s) | Samples: 0

**Called by:**
- `apply` (1160)

**Calls:**
- `applyTransactionSpecDocumentChangeStep` (990)
- `applyTransactionSpecDocumentChangeStep` (82)
- `applyTransactionSpecDocumentChangeStep` (42)
- `applyTransactionSpecDocumentChangeStep` (18)
- `applyTransactionSpecDocumentChangeStep` (8)
- `applyTransactionSpecDocumentChangeStep` (5)
- `applyTransactionSpecDocumentChangeStep` (4)
- `applyTransactionSpecDocumentChangeStep` (3)
- `applyTransactionSpecDocumentChangeStep` (2)
- `applyTransactionSpecDocumentChangeStep` (1)
- `applyTransactionSpecDocumentChangeStep` (1)
- `applyTransactionSpecDocumentChangeStep` (1)
- `applyTransactionSpecDocumentChangeStep` (1)
- `applyTransactionSpecDocumentChangeStep` (1)
- `applyTransactionSpecDocumentChangeStep` (1)

### `encodeNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:948` | Self: 0.0% (0us) | Total: 1.3% (2.95s) | Samples: 0

**Called by:**
- `(anonymous)` (1037)
- `fromNodes` (667)
- `DocumentIndex` (577)
- `tokens` (42)
- `get tokens` (1)

**Calls:**
- `fromTokens` (2324)

### `concat`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:688` | Self: 0.0% (0us) | Total: 0.0% (7.9ms) | Samples: 0

**Called by:**
- `addSection` (4)
- `applyIndexed` (2)

**Calls:**
- `push` (6)

### `mapRelocatedPath`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:521` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `mapChangedNodeKeys` (1)

**Calls:**
- `some` (1)

### `resolveMappedPoint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts:423` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `map` (1)

**Calls:**
- `nodeAtPath` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:450` | Self: 0.0% (0us) | Total: 0.0% (3.3ms) | Samples: 0

**Called by:**
- `(anonymous)` (3)

**Calls:**
- `record` (3)

### `validateTextProperties`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2398` | Self: 0.0% (0us) | Total: 0.0% (3.8ms) | Samples: 0

**Called by:**
- `validateDeclarativeNodeProperties` (3)

**Calls:**
- `getDeclarativeSchema` (3)

### `mapPoint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:468` | Self: 0.0% (0us) | Total: 0.0% (8.2ms) | Samples: 0

**Called by:**
- `mapRange` (3)
- `mapRange` (3)

**Calls:**
- `publicPoint` (4)
- `freeze` (2)

### `RootChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1387` | Self: 0.0% (0us) | Total: 0.0% (3.7ms) | Samples: 0

**Called by:**
- `compose` (2)
- `create` (1)

**Calls:**
- `reduce` (3)

### `createEditorCommit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:986` | Self: 0.0% (0us) | Total: 0.0% (4.9ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (4)

**Calls:**
- `copyDataProperties` (4)

### `applyRoot`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:1081` | Self: 0.0% (0us) | Total: 0.0% (5.3ms) | Samples: 0

**Called by:**
- `(anonymous)` (4)

**Calls:**
- `createInternalDocumentChange` (4)

### `decodeNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:227` | Self: 0.0% (0us) | Total: 0.0% (77.1ms) | Samples: 0

**Called by:**
- `(anonymous)` (61)

**Calls:**
- `freeze` (61)

### `apply`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:408` | Self: 0.0% (0us) | Total: 0.0% (2.6ms) | Samples: 0

**Called by:**
- `applyCanonical` (2)

**Calls:**
- `getIndex` (1)
- `getIndex` (1)

### `fit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3047` | Self: 0.0% (0us) | Total: 0.0% (2.4ms) | Samples: 0

**Called by:**
- `fitRoot` (2)

**Calls:**
- `prepareCanonicalRootFit` (2)

### `registerEffectTypeInRegistry`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:874` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `createEditorImplementation` (1)

**Calls:**
- `assertEffectType` (1)

### `positionAt`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:613` | Self: 0.0% (0us) | Total: 0.0% (2.3ms) | Samples: 0

**Called by:**
- `assertSelectionSupported` (2)

**Calls:**
- `entry` (1)
- `entry` (1)

### `getNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:908` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `getAffectedAnchorListeners` (1)

**Calls:**
- `freeze` (1)

### `applyTransactionSpecContents`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5606` | Self: 0.0% (0us) | Total: 1.2% (2.70s) | Samples: 0

**Called by:**
- `applyTransactionSpec` (2095)

**Calls:**
- `applyPreparedTransactionSpecChange` (2093)
- `applyPreparedTransactionSpecChange` (1)
- `applyPreparedTransactionSpecChange` (1)

### `validateSubtree`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3617` | Self: 0.0% (0us) | Total: 0.1% (224.1ms) | Samples: 0

**Called by:**
- `validateDocumentChange` (177)

**Calls:**
- `forEach` (177)

### `runEditorTransaction`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7975` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `withUpdateTagContext` (1)

**Calls:**
- `freeze` (1)

### `measureConnectDisconnectHeap`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:355` | Self: 0.0% (0us) | Total: 0.2% (574.2ms) | Samples: 0

**Called by:**
- `measureCohort` (453)

**Calls:**
- `extendEditor` (243)
- `(anonymous)` (210)

### `getStructuralFingerprint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:127` | Self: 0.0% (0us) | Total: 0.0% (15.5ms) | Samples: 0

**Called by:**
- `getStructuralFingerprint` (8)
- `groupRelocationCandidates` (4)

**Calls:**
- `mixStructuralFingerprintString` (10)
- `mixStructuralFingerprintString` (1)
- `mixStructuralFingerprintString` (1)

### `overlappingRanges`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:145` | Self: 0.0% (0us) | Total: 0.0% (32.6ms) | Samples: 0

**Called by:**
- `classifyRootChangeWithRuntimeCandidates` (23)
- `classifyRootChangeWithRuntimeCandidates` (2)

**Calls:**
- `nodeRangesTouching` (24)
- `nodeRangesTouching` (1)

### `requestFetch`
`[native code]` | Self: 0.0% (0us) | Total: 0.0% (24.4ms) | Samples: 0

**Called by:**
- `async (anonymous)` (19)

**Calls:**
- `fetch` (19)

### `validateDeclarativeDocument`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3030` | Self: 0.0% (0us) | Total: 1.7% (3.77s) | Samples: 0

**Called by:**
- `(anonymous)` (2947)

**Calls:**
- `getDocumentOwnershipIndexes` (2942)
- `freeze` (4)
- `getDocumentOwnershipIndexes` (1)

### `levels`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/editor/levels.ts:33` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `generatorResume` (1)

**Calls:**
- `isVoid` (1)

### `collectRelocationCandidates`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:203` | Self: 0.0% (0us) | Total: 0.0% (11.0ms) | Samples: 0

**Called by:**
- `deriveRootRelocations` (7)
- `deriveRootRelocations` (2)

**Calls:**
- `stringify` (9)

### `closed`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:249` | Self: 0.0% (0us) | Total: 0.3% (844.2ms) | Samples: 0

**Called by:**
- `fitRoot` (439)
- `(anonymous)` (214)

**Calls:**
- `snapshot` (653)

### `compose`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1112` | Self: 0.0% (0us) | Total: 0.0% (1.5ms) | Samples: 0

**Called by:**
- `apply` (1)

**Calls:**
- `performIteration` (1)

### `composeSections`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:610` | Self: 0.0% (0us) | Total: 0.0% (1.0ms) | Samples: 0

**Called by:**
- `compose` (1)

**Calls:**
- `get done` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8454` | Self: 0.0% (0us) | Total: 56.1% (119.09s) | Samples: 0

**Called by:**
- `runEditorTransaction` (83700)
- `runEditorTransaction` (9780)

**Calls:**
- `createRootFitTransactionSpec` (93480)

### `commit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/history/history-extension.ts:592` | Self: 0.0% (0us) | Total: 0.0% (30.1ms) | Samples: 0

**Called by:**
- `(anonymous)` (24)

**Calls:**
- `deepFreeze` (14)
- `apply` (10)

### `resolveExternalDocumentPoint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1464` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `getDescendant` (1)

### `finalize`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:835` | Self: 0.0% (0us) | Total: 0.6% (1.43s) | Samples: 0

**Called by:**
- `finalizeTransactionRepresentation` (1130)

**Calls:**
- `validateConstructed` (1130)

### `mapPoint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:475` | Self: 0.0% (0us) | Total: 0.0% (3.6ms) | Samples: 0

**Called by:**
- `mapRange` (2)
- `mapRange` (1)

**Calls:**
- `rawNodeAt` (1)
- `rawNodeAt` (1)
- `rawNodeAt` (1)

### `measureCohort`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:416` | Self: 0.0% (0us) | Total: 2.0% (4.24s) | Samples: 0

**Called by:**
- `(anonymous)` (3337)

**Calls:**
- `measure` (3337)

### `updateIndexedNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:395` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `withNodeUpdates` (1)

**Calls:**
- `performIteration` (1)

### `getRootContent`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:937` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `constructCanonicalDocumentChange` (1)

**Calls:**
- `getDeclarativeSchema` (1)

### `measureConnectDisconnectHeap`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:366` | Self: 0.0% (0us) | Total: 2.9% (6.18s) | Samples: 0

**Called by:**
- `measureCohort` (4879)

**Calls:**
- `forceGc` (4879)

### `mapChangedNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:954` | Self: 0.0% (0us) | Total: 0.0% (5.9ms) | Samples: 0

**Called by:**
- `mapSnapshotIndexThroughChange` (5)

**Calls:**
- `iterChangedRanges` (5)

### `compactMappingSegments`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:443` | Self: 0.0% (0us) | Total: 0.0% (2.1ms) | Samples: 0

**Called by:**
- `advancePathStableSnapshotIndex` (2)

**Calls:**
- `createPathStableMappingSegment` (1)
- `freeze` (1)

### `invoke`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-lifecycle-api.ts:405` | Self: 0.0% (0us) | Total: 0.0% (49.9ms) | Samples: 0

**Called by:**
- `update` (39)

**Calls:**
- `runEditorTransaction` (29)
- `runEditorTransaction` (4)
- `runEditorTransaction` (4)
- `runEditorTransaction` (2)

### `fit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3112` | Self: 0.0% (0us) | Total: 0.0% (3.7ms) | Samples: 0

**Called by:**
- `(anonymous)` (3)

**Calls:**
- `mapExternalRootSelection` (1)
- `mapExternalRootSelection` (1)
- `mapSelectionWithContext` (1)

### `getCurrentRootSnapshot`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6689` | Self: 0.0% (0us) | Total: 0.4% (868.0ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (686)

**Calls:**
- `(anonymous)` (686)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8107` | Self: 0.0% (0us) | Total: 0.0% (6.6ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (5)

**Calls:**
- `recordFacetCommit` (4)
- `recordFacetCommit` (1)

### `mergeRegistries`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:484` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `createExtensionRegistryStore` (1)

**Calls:**
- `assertNoMapConflicts` (1)

### `getIndex`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:1099` | Self: 0.0% (0us) | Total: 0.0% (79.5ms) | Samples: 0

**Called by:**
- `insertText` (62)

**Calls:**
- `fromValue` (61)
- `remember` (1)

### `prepareFittedDocument`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1430` | Self: 0.0% (0us) | Total: 0.0% (2.3ms) | Samples: 0

**Called by:**
- `fit` (2)

**Calls:**
- `prepare` (1)
- `prepare` (1)

### `ChangeDraft`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:137` | Self: 0.0% (0us) | Total: 0.0% (3.9ms) | Samples: 0

**Called by:**
- `createEditorDocumentChangeBuilder` (2)
- `fork` (1)

**Calls:**
- `(anonymous)` (3)

### `fit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3002` | Self: 0.0% (0us) | Total: 1.2% (2.65s) | Samples: 0

**Called by:**
- `(anonymous)` (2090)

**Calls:**
- `applyInternal` (2090)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:396` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `map` (1)

**Calls:**
- `isEditorExtension` (1)

### `cloneFrozen`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/clone.ts:17` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `fitDocumentInput` (1)

**Calls:**
- `structuredClone` (1)

### `withEditorUpdateRoot`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:718` | Self: 0.0% (0us) | Total: 0.0% (68.6ms) | Samples: 0

**Called by:**
- `(anonymous)` (26)
- `(anonymous)` (16)
- `(anonymous)` (12)

**Calls:**
- `(anonymous)` (28)
- `(anonymous)` (23)
- `(anonymous)` (3)

### `createEditorCommit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:1000` | Self: 0.0% (0us) | Total: 0.0% (15.0ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (11)

**Calls:**
- `deepFreeze` (6)
- `cloneFrozenEditorJsonValue` (3)
- `deepFreeze` (1)
- `deepFreeze` (1)

### `assertNoMapConflicts`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:464` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `mergeRegistries` (1)

**Calls:**
- `performProxyObjectGet` (1)

### `prepareScopedEditorExtensionPublication`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:2591` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (1)

**Calls:**
- `resolveExtensionOrder` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8080` | Self: 0.0% (0us) | Total: 0.0% (20.0ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (16)

**Calls:**
- `selectionPositionEquals` (7)
- `selectionPositionEquals` (4)
- `every` (3)
- `equalValue` (1)
- `selectionPositionEquals` (1)

### `applyIndexed`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2392` | Self: 0.0% (0us) | Total: 0.0% (151.6ms) | Samples: 0

**Called by:**
- `applyInternal` (118)

**Calls:**
- `slice` (118)

### `adopt`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:319` | Self: 0.0% (0us) | Total: 0.2% (426.1ms) | Samples: 0

**Called by:**
- `fit` (336)

**Calls:**
- `createInternalDocumentChange` (336)

### `isText`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:197` | Self: 0.0% (0us) | Total: 0.0% (12.1ms) | Samples: 0

**Called by:**
- `assertBuiltInSelection` (3)
- `withoutPendingMarks` (3)
- `assertSelectionSupported` (2)
- `isSelection` (2)

**Calls:**
- `isStrictPoint` (8)
- `isStrictPoint` (2)

### `DocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:749` | Self: 0.0% (0us) | Total: 0.0% (14.7ms) | Samples: 0

**Called by:**
- `constructDocumentChange` (11)

**Calls:**
- `freezeReadonlySet` (8)
- `freezeReadonlySet` (3)

### `publishInitialEditorExtensions`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts:221` | Self: 0.0% (0us) | Total: 0.0% (1.0ms) | Samples: 0

**Called by:**
- `createEditorImplementation` (1)

**Calls:**
- `stage` (1)

### `insertText`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/transforms-text/insert-text.ts:394` | Self: 0.0% (0us) | Total: 0.0% (22.4ms) | Samples: 0

**Called by:**
- `applyInsertText` (18)

**Calls:**
- `(anonymous)` (18)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:2203` | Self: 0.0% (0us) | Total: 0.2% (448.6ms) | Samples: 0

**Called by:**
- `runWithEditorExtensionPublicationGuard` (351)

**Calls:**
- `buildConfiguredRegistry` (343)
- `buildConfiguredRegistry` (6)
- `buildConfiguredRegistry` (1)
- `buildConfiguredRegistry` (1)

### `applyAnchorChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:282` | Self: 0.0% (0us) | Total: 0.0% (1.0ms) | Samples: 0

**Called by:**
- `notifyAnchorChanges` (1)

**Calls:**
- `set` (1)

### `assertSelectionSupported`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:747` | Self: 0.0% (0us) | Total: 0.0% (2.6ms) | Samples: 0

**Called by:**
- `mapSelectionThroughChange` (2)

**Calls:**
- `isNode` (2)

### `runEditorTransaction`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8109` | Self: 0.0% (0us) | Total: 0.0% (79.0ms) | Samples: 0

**Called by:**
- `withUpdateTagContext` (62)

**Calls:**
- `(anonymous)` (59)
- `(anonymous)` (3)

### `commitAnchorTransaction`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:458` | Self: 0.0% (0us) | Total: 0.0% (1.5ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `commit` (1)

### `fit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:2984` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `fitRoot` (1)

**Calls:**
- `Map` (1)

### `readEditor`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5816` | Self: 0.0% (0us) | Total: 0.0% (6.8ms) | Samples: 0

**Called by:**
- `commit` (4)
- `(host)` (1)

**Calls:**
- `createEditorDocumentValue` (4)
- `(anonymous)` (1)

### `getSelectionNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:226` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `getSelectionIds` (1)

**Calls:**
- `filter` (1)

### `initializeBaseExtensionRegistry`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:663` | Self: 0.0% (0us) | Total: 0.0% (5.2ms) | Samples: 0

**Called by:**
- `createEditorImplementation` (4)

**Calls:**
- `getExtensionRegistryStore` (4)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:1219` | Self: 0.0% (0us) | Total: 0.0% (135.1ms) | Samples: 0

**Called by:**
- `(anonymous)` (105)

**Calls:**
- `commit` (77)
- `commit` (24)
- `commit` (4)

### `fitDocumentInput`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3249` | Self: 0.0% (0us) | Total: 4.4% (9.53s) | Samples: 0

**Called by:**
- `fitDocument` (7524)

**Calls:**
- `fitRoot` (7524)

### `isObjectPrototype`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:32` | Self: 0.0% (0us) | Total: 2.1% (4.63s) | Samples: 0

**Called by:**
- `getEditorJsonRecordEntries` (2677)
- `isArrayPrototype` (974)
- `getEditorJsonArrayItems` (1)

**Calls:**
- `hasIntrinsicConstructor` (1839)
- `hasIntrinsicConstructor` (1680)
- `hasIntrinsicConstructor` (133)

### `overlappingRanges`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:146` | Self: 0.0% (0us) | Total: 0.0% (4.3ms) | Samples: 0

**Called by:**
- `classifyRootChangeWithRuntimeCandidates` (4)

**Calls:**
- `filter` (4)

### `mapTo`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts:609` | Self: 0.0% (0us) | Total: 0.0% (69.6ms) | Samples: 0

**Called by:**
- `change` (55)

**Calls:**
- `map` (55)

### `applyAnchorChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:277` | Self: 0.0% (0us) | Total: 0.0% (1.0ms) | Samples: 0

**Called by:**
- `notifyAnchorChanges` (1)

**Calls:**
- `getInternalDocumentChangeEntries` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8500` | Self: 0.0% (0us) | Total: 0.0% (3.9ms) | Samples: 0

**Called by:**
- `withEditorUpdateRoot` (3)

**Calls:**
- `resolveSnapshotSelection` (3)

### `fit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:2368` | Self: 0.0% (0us) | Total: 0.0% (37.5ms) | Samples: 0

**Called by:**
- `fitRoot` (19)
- `(anonymous)` (11)

**Calls:**
- `every` (30)

### `collectRelocationCandidates`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:217` | Self: 0.0% (0us) | Total: 0.0% (2.5ms) | Samples: 0

**Called by:**
- `deriveRootRelocations` (2)

**Calls:**
- `performIteration` (2)

### `encodeContentSlice`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:456` | Self: 0.0% (0us) | Total: 0.0% (144.8ms) | Samples: 0

**Called by:**
- `(anonymous)` (114)

**Calls:**
- `encodeContentSliceContent` (114)

### `createEditorImplementation`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts:438` | Self: 0.0% (0us) | Total: 0.0% (3.7ms) | Samples: 0

**Called by:**
- `createEditorWithDocument` (3)

**Calls:**
- `createEditorSchema` (1)
- `createEditorSchema` (1)
- `createEditorSchema` (1)

### `runEditorTransaction`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7902` | Self: 0.0% (0us) | Total: 0.2% (460.1ms) | Samples: 0

**Called by:**
- `runTrustedUpdate` (360)

**Calls:**
- `prepareRecordPublication` (356)
- `prepareScopedEditorExtensionPublication` (1)
- `prepareScopedEditorExtensionPublication` (1)
- `prepareScopedEditorExtensionPublication` (1)
- `prepareScopedEditorExtensionPublication` (1)

### `encode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:865` | Self: 0.0% (0us) | Total: 0.1% (284.8ms) | Samples: 0

**Called by:**
- `forEach` (226)

**Calls:**
- `forEach` (226)

### `finalize`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:750` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `prepareFittedDocument` (1)

**Calls:**
- `performIteration` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:194` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `disposeTransactionSpecContext` (1)

**Calls:**
- `at` (1)

### `notifyAnchorChanges`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:403` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `applyTransactionSpecDocumentChangeStep` (1)

**Calls:**
- `getActiveAnchorState` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1212` | Self: 0.0% (0us) | Total: 0.0% (117.6ms) | Samples: 0

**Called by:**
- `constructCanonicalDocumentChange` (90)

**Calls:**
- `replaceCanonicalChildWindow` (34)
- `replaceCanonicalChildWindow` (27)
- `replaceCanonicalChildWindow` (5)
- `replaceCanonicalChildWindow` (4)
- `replaceCanonicalChildWindow` (3)
- `replaceCanonicalChildWindow` (2)
- `replaceCanonicalChildWindow` (2)
- `replaceCanonicalChildWindow` (2)
- `replaceCanonicalChildWindow` (2)
- `replaceCanonicalChildWindow` (2)
- `replaceCanonicalChildWindow` (2)
- `replaceCanonicalChildWindow` (1)
- `replaceCanonicalChildWindow` (1)
- `replaceCanonicalChildWindow` (1)
- `replaceCanonicalChildWindow` (1)
- `replaceCanonicalChildWindow` (1)

### `freezeReadonlyMap`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:196` | Self: 0.0% (0us) | Total: 0.0% (10.1ms) | Samples: 0

**Called by:**
- `DocumentChange` (4)
- `DocumentChange` (3)
- `apply` (1)

**Calls:**
- `freeze` (8)

### `canonicalizeDirectChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:198` | Self: 0.0% (0us) | Total: 0.0% (110.5ms) | Samples: 0

**Called by:**
- `canonicalizeNode` (88)

**Calls:**
- `getElementContent` (88)

### `structurallyEqual`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:250` | Self: 0.0% (0us) | Total: 0.0% (86.0ms) | Samples: 0

**Called by:**
- `every` (69)

**Calls:**
- `every` (69)

### `recordFacetDraftDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/facet.ts:138` | Self: 0.0% (0us) | Total: 0.0% (2.7ms) | Samples: 0

**Called by:**
- `applyTransactionSpecDocumentChangeStep` (2)

**Calls:**
- `performIteration` (2)

### `textAt`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:302` | Self: 0.0% (0us) | Total: 0.0% (2.5ms) | Samples: 0

**Called by:**
- `textAt` (2)

**Calls:**
- `currentTextContaining` (2)

### `advancePathStableSnapshotIndex`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1811` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `inheritDocumentChangeStepNodeKeys` (1)

**Calls:**
- `cloneObject` (1)

### `withoutPendingMarks`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6208` | Self: 0.0% (0us) | Total: 0.0% (2.5ms) | Samples: 0

**Called by:**
- `selectionPositionEquals` (2)

**Calls:**
- `copyDataProperties` (2)

### `applyCanonical`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:520` | Self: 0.0% (0us) | Total: 0.0% (210.0ms) | Samples: 0

**Called by:**
- `applyDocumentChange` (163)

**Calls:**
- `assertCanonical` (163)

### `fit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1727` | Self: 0.0% (0us) | Total: 0.4% (963.9ms) | Samples: 0

**Called by:**
- `fitRoot` (509)
- `(anonymous)` (248)

**Calls:**
- `fitClosedContent` (491)
- `freeze` (84)
- `fitClosedContent` (52)
- `fitDirectContent` (41)
- `fitClosedContent` (33)
- `fitClosedContent` (21)
- `fitClosedContent` (14)
- `fitClosedContent` (11)
- `fitClosedContent` (5)
- `fitDirectContent` (4)
- `fitClosedContent` (1)

### `prepareEditorSchemaRecords`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts:1573` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `getEditorSchemaDeclarationKey` (1)

**Calls:**
- `createDerivedBaseSchemaRecord` (1)

### `applyIndexed`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2396` | Self: 0.0% (0us) | Total: 0.0% (185.7ms) | Samples: 0

**Called by:**
- `applyInternal` (145)

**Calls:**
- `(anonymous)` (145)

### `decrementEditorTransactionDepth`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:780` | Self: 0.0% (0us) | Total: 0.0% (1.0ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (1)

**Calls:**
- `getTransactionSpecContext` (1)

### `getUpdateView`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5061` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `freeze` (1)

### `createEditorCommit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:1002` | Self: 0.0% (0us) | Total: 0.0% (6.0ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (5)

**Calls:**
- `deepFreeze` (4)
- `cloneFrozenEditorJsonValue` (1)

### `reduceEditorUpdateTags`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/update-policy.ts:64` | Self: 0.0% (0us) | Total: 0.0% (2.5ms) | Samples: 0

**Called by:**
- `pushUpdateTagContext` (2)

**Calls:**
- `applyEditorUpdateTags` (2)

### `forceGc`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:76` | Self: 0.0% (0us) | Total: 5.7% (12.14s) | Samples: 0

**Called by:**
- `measureConnectDisconnectHeap` (4879)
- `measureConnectDisconnectHeap` (4711)

**Calls:**
- `gc` (9590)

### `advancePathStableSnapshotIndex`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1779` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `inheritDocumentChangeStepNodeKeys` (1)

**Calls:**
- `assertMappingLengths` (1)

### `create`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1467` | Self: 0.0% (0us) | Total: 0.0% (5.2ms) | Samples: 0

**Called by:**
- `reconcileChildrenStep` (2)
- `between` (2)

**Calls:**
- `RootChange` (2)
- `RootChange` (1)
- `RootChange` (1)

### `canonicalizeInlineChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:112` | Self: 0.0% (0us) | Total: 0.0% (33.9ms) | Samples: 0

**Called by:**
- `canonicalizeNode` (26)
- `replaceCanonicalChildWindow` (1)

**Calls:**
- `flatMap` (27)

### `normalizeSelectionRoot`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-state.ts:30` | Self: 0.0% (0us) | Total: 0.0% (5.3ms) | Samples: 0

**Called by:**
- `setSelectionStateSelection` (4)

**Calls:**
- `isNode` (4)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1014` | Self: 0.0% (0us) | Total: 0.0% (2.4ms) | Samples: 0

**Called by:**
- `some` (2)

**Calls:**
- `performProxyObjectGet` (2)

### `applyInternal`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2585` | Self: 0.0% (0us) | Total: 5.8% (12.45s) | Samples: 0

**Called by:**
- `apply` (7689)
- `fit` (2090)
- `applyDocumentChangeValue` (8)

**Calls:**
- `applyIndexed` (6977)
- `applyIndexed` (1951)
- `applyIndexed` (491)
- `applyIndexed` (145)
- `applyIndexed` (118)
- `applyIndexed` (42)
- `withNodeUpdates` (19)
- `applyIndexed` (12)
- `remember` (9)
- `applyIndexed` (4)
- `applyIndexed` (2)
- `applyIndexed` (2)
- `applyIndexed` (2)
- `applyIndexed` (2)
- `applyIndexed` (2)
- `applyIndexed` (1)
- `withNodeUpdates` (1)
- `applyIndexed` (1)
- `applyIndexed` (1)
- `applyIndexed` (1)
- `applyIndexed` (1)
- `applyIndexed` (1)
- `applyIndexed` (1)
- `applyIndexed` (1)

### `getStructuralFingerprint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:113` | Self: 0.0% (0us) | Total: 0.0% (141.4ms) | Samples: 0

**Called by:**
- `getStructuralFingerprint` (110)

**Calls:**
- `getStructuralFingerprint` (42)
- `getStructuralFingerprint` (34)
- `getStructuralFingerprint` (11)
- `getStructuralFingerprint` (8)
- `getStructuralFingerprint` (6)
- `getStructuralFingerprint` (3)
- `getStructuralFingerprint` (3)
- `getStructuralFingerprint` (1)
- `getStructuralFingerprint` (1)
- `getStructuralFingerprint` (1)

### `deepFreeze`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/clone.ts:8` | Self: 0.0% (0us) | Total: 0.0% (12.6ms) | Samples: 0

**Called by:**
- `deepFreeze` (10)

**Calls:**
- `freeze` (10)

### `materializeTokens`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:561` | Self: 0.0% (0us) | Total: 0.2% (544.1ms) | Samples: 0

**Called by:**
- `getContentEndOffset` (429)

**Calls:**
- `freeze` (429)

### `assertSelectionSupported`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:704` | Self: 0.0% (0us) | Total: 0.0% (194.3ms) | Samples: 0

**Called by:**
- `setCurrentSelection` (154)
- `mapSelectionThroughChange` (1)

**Calls:**
- `root` (155)

### `applyIndexed`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2141` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `applyInternal` (1)

**Calls:**
- `textAt` (1)

### `mapPoint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:441` | Self: 0.0% (0us) | Total: 0.0% (10.6ms) | Samples: 0

**Called by:**
- `mapRange` (4)

**Calls:**
- `mapPosition` (2)
- `mapInternalDocumentChangePosition` (1)
- `mapPos` (1)

### `contentAllows`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1245` | Self: 0.0% (0us) | Total: 0.0% (15.8ms) | Samples: 0

**Called by:**
- `findWrappingForContent` (5)
- `validateDeclarativeRootContent` (3)
- `validationContentAllows` (3)
- `(anonymous)` (1)

**Calls:**
- `isText` (12)

### `get`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:1033` | Self: 0.0% (0us) | Total: 0.0% (51.6ms) | Samples: 0

**Called by:**
- `commit` (40)

**Calls:**
- `createInternalDocumentChange` (39)
- `bindDocumentChangeNodeKeys` (1)

### `createEditorUpdateDraftContext`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7652` | Self: 0.0% (0us) | Total: 0.0% (6.8ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (5)

**Calls:**
- `createEditorDocumentChangeBuilder` (3)
- `createEditorDocumentChangeBuilder` (1)
- `createEditorDocumentChangeBuilder` (1)

### `tokens`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:500` | Self: 0.0% (0us) | Total: 0.0% (148.7ms) | Samples: 0

**Called by:**
- `slice` (116)

**Calls:**
- `encodeNodes` (43)
- `encodeNodes` (42)
- `encodeNodes` (31)

### `getRegisteredExtension`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:1495` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `buildConfiguredRegistry` (1)

**Calls:**
- `filter` (1)

### `finalizeExtensionRegistry`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:298` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `createEditorImplementation` (1)

**Calls:**
- `freezeMap` (1)

### `mapChangedNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1209` | Self: 0.0% (0us) | Total: 0.1% (383.1ms) | Samples: 0

**Called by:**
- `mapSnapshotIndexThroughChange` (300)

**Calls:**
- `claim` (216)
- `claim` (23)
- `claim` (19)
- `claim` (12)
- `claim` (11)
- `claim` (10)
- `claim` (4)
- `claim` (3)
- `claim` (2)

### `cloneJson`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:153` | Self: 0.0% (0us) | Total: 0.0% (148.3ms) | Samples: 0

**Called by:**
- `cloneFrozen` (91)
- `decodeNodes` (16)
- `(anonymous)` (11)

**Calls:**
- `fromEntries` (118)

### `applyInternal`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2590` | Self: 0.0% (0us) | Total: 0.0% (6.2ms) | Samples: 0

**Called by:**
- `apply` (4)
- `applyDocumentChangeValue` (1)

**Calls:**
- `recordStats` (2)
- `recordStats` (1)
- `recordStats` (1)
- `recordStats` (1)

### `currentEntry`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:337` | Self: 0.0% (0us) | Total: 0.0% (2.5ms) | Samples: 0

**Called by:**
- `currentTextContaining` (2)

**Calls:**
- `map` (2)

### `mapSnapshotIndexThroughChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1376` | Self: 0.0% (0us) | Total: 0.0% (17.5ms) | Samples: 0

**Called by:**
- `inheritDocumentChangeStepNodeKeys` (13)

**Calls:**
- `Set` (13)

### `get ReadStream`
`node:fs:578` | Self: 0.0% (0us) | Total: 0.0% (2.3ms) | Samples: 0

**Called by:**
- `parseModule` (2)

**Calls:**
- `anonymous` (2)

### `applyTrustedCanonical`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:717` | Self: 0.0% (0us) | Total: 2.1% (4.52s) | Samples: 0

**Called by:**
- `applyDocumentChange` (3554)

**Calls:**
- `adoptCanonicalBaseline` (3554)

### `indexConstructedRoot`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:948` | Self: 0.0% (0us) | Total: 0.0% (4.2ms) | Samples: 0

**Called by:**
- `applyTrustedCanonical` (3)

**Calls:**
- `some` (2)
- `hasContentRoots` (1)

### `apply`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:410` | Self: 0.0% (0us) | Total: 4.6% (9.80s) | Samples: 0

**Called by:**
- `prepareFittedDocument` (5699)
- `applyCanonical` (2002)

**Calls:**
- `applyInternal` (7689)
- `applyInternal` (4)
- `applyInternal` (3)
- `applyInternal` (3)
- `applyInternal` (1)
- `applyInternal` (1)

### `projectSelectionPoint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:88` | Self: 0.0% (0us) | Total: 0.0% (6.1ms) | Samples: 0

**Called by:**
- `projectSelectionRange` (3)
- `projectSelectionRange` (2)

**Calls:**
- `freeze` (5)

### `setCurrentSelection`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6316` | Self: 0.0% (0us) | Total: 0.0% (25.1ms) | Samples: 0

**Called by:**
- `applyTransactionSpecDocumentChangeStep` (20)

**Calls:**
- `setSelectionValue` (10)
- `setSelectionValue` (5)
- `setSelectionValue` (5)

### `getUpdateView`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4584` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `defineSemanticUpdateMethod` (1)

### `runWithEditorExtensionPublicationGuard`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:689` | Self: 0.0% (0us) | Total: 0.2% (456.2ms) | Samples: 0

**Called by:**
- `prepareRecordPublication` (357)

**Calls:**
- `(anonymous)` (351)
- `(anonymous)` (5)
- `(anonymous)` (1)

### `mapSnapshotIndexThroughChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1353` | Self: 0.0% (0us) | Total: 50.4% (107.00s) | Samples: 0

**Called by:**
- `inheritDocumentChangeStepNodeKeys` (83963)

**Calls:**
- `mapChangedNodeKeys` (82218)
- `mapChangedNodeKeys` (714)
- `mapChangedNodeKeys` (300)
- `mapChangedNodeKeys` (115)
- `mapChangedNodeKeys` (100)
- `mapChangedNodeKeys` (75)
- `mapChangedNodeKeys` (74)
- `freeze` (57)
- `mapChangedNodeKeys` (53)
- `mapChangedNodeKeys` (41)
- `mapChangedNodeKeys` (41)
- `mapChangedNodeKeys` (38)
- `mapChangedNodeKeys` (24)
- `mapChangedNodeKeys` (19)
- `mapChangedNodeKeys` (15)
- `mapChangedNodeKeys` (12)
- `mapChangedNodeKeys` (10)
- `mapChangedNodeKeys` (9)
- `mapChangedNodeKeys` (8)
- `mapChangedNodeKeys` (8)
- `mapChangedNodeKeys` (7)
- `mapChangedNodeKeys` (6)
- `mapChangedNodeKeys` (5)
- `mapChangedNodeKeys` (5)
- `mapChangedNodeKeys` (3)
- `mapChangedNodeKeys` (2)
- `mapChangedNodeKeys` (2)
- `mapChangedNodeKeys` (1)
- `mapChangedNodeKeys` (1)

### `applyTransactionSpecContents`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5650` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `applyTransactionSpec` (1)

**Calls:**
- `getUpdateView` (1)

### `apply`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:458` | Self: 0.0% (0us) | Total: 0.0% (11.2ms) | Samples: 0

**Called by:**
- `applyCanonical` (5)
- `prepareFittedDocument` (3)
- `(anonymous)` (1)

**Calls:**
- `applyDocumentChangeWithIndexes` (8)
- `freeze` (1)

### `advancePathStableSnapshotIndex`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1798` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `inheritDocumentChangeStepNodeKeys` (1)

**Calls:**
- `at` (1)

### `addRange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:899` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `pathKey` (1)

### `buildConfiguredRegistry`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:1987` | Self: 0.0% (0us) | Total: 0.2% (438.5ms) | Samples: 0

**Called by:**
- `(anonymous)` (343)

**Calls:**
- `assertDocument` (343)

### `replaceEditorSnapshot`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/editor.ts:4376` | Self: 0.0% (0us) | Total: 14.1% (30.03s) | Samples: 0

**Called by:**
- `replace` (23579)

**Calls:**
- `replaceSnapshot` (23578)
- `replaceSnapshot` (1)

### `getElementContentRoots`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:961` | Self: 0.0% (0us) | Total: 0.0% (4.0ms) | Samples: 0

**Called by:**
- `collectProjectedRoots` (3)

**Calls:**
- `performProxyObjectGet` (3)

### `applyIndexed`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2172` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `applyInternal` (1)

**Calls:**
- `performIteration` (1)

### `applyInternal`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2563` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `apply` (1)

**Calls:**
- `iterChangedRanges` (1)

### `runEditorTransaction`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7982` | Self: 0.0% (0us) | Total: 0.0% (2.4ms) | Samples: 0

**Called by:**
- `withUpdateTagContext` (2)

**Calls:**
- `disposeTransactionSpecContext` (1)
- `disposeTransactionSpecContext` (1)

### `(anonymous)`
`[native code]` | Self: 0.0% (0us) | Total: 0.0% (25.6ms) | Samples: 0

**Called by:**
- `refresh` (1)

**Calls:**
- `requestSatisfyUtil` (19)
- `WriteStream` (1)

### `getOrphanedElementOwnedRoots`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1021` | Self: 0.0% (0us) | Total: 0.0% (3.4ms) | Samples: 0

**Called by:**
- `reconcileExclusiveElementOwnedRoots` (3)

**Calls:**
- `some` (2)
- `hasContentRoots` (1)

### `disposeTransactionSpecContext`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5336` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (1)

**Calls:**
- `closeScopedTransactionAnchors` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1167` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `iterChangedRanges` (1)

**Calls:**
- `join` (1)

### `ChangeDraft`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:176` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `applyCanonical` (1)

**Calls:**
- `freeze` (1)

### `getSegmentRelocations`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:501` | Self: 0.0% (0us) | Total: 0.4% (913.8ms) | Samples: 0

**Called by:**
- `mapChangedNodeKeys` (714)

**Calls:**
- `getRootChangeRelocations` (714)

### `nodeRangesTouching`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:578` | Self: 0.0% (0us) | Total: 0.0% (74.6ms) | Samples: 0

**Called by:**
- `overlappingRanges` (24)
- `classifyRootChangeWithRuntimeCandidates` (22)
- `collectRelocationCandidates` (9)
- `classifyRootChangeWithRuntimeCandidates` (2)
- `classifyRootChangeWithRuntimeCandidates` (1)

**Calls:**
- `nodeRangesTouching` (57)
- `nodeRangesTouching` (1)

### `selectionPositionEquals`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6214` | Self: 0.0% (0us) | Total: 0.0% (8.4ms) | Samples: 0

**Called by:**
- `(anonymous)` (7)

**Calls:**
- `withoutPendingMarks` (5)
- `withoutPendingMarks` (2)

### `assignFreshNodeKey`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:176` | Self: 0.0% (0us) | Total: 0.0% (35.8ms) | Samples: 0

**Called by:**
- `mapChangedNodeKeys` (28)

**Calls:**
- `getNodeKeys` (22)
- `getNodeKeys` (6)

### `applyCanonical`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:514` | Self: 0.0% (0us) | Total: 1.2% (2.70s) | Samples: 0

**Called by:**
- `applyDocumentChange` (2122)

**Calls:**
- `apply` (2002)
- `apply` (62)
- `apply` (39)
- `apply` (5)
- `apply` (5)
- `apply` (4)
- `apply` (2)
- `apply` (1)
- `apply` (1)
- `apply` (1)

### `getStructuralFingerprint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:147` | Self: 0.0% (0us) | Total: 0.0% (2.2ms) | Samples: 0

**Called by:**
- `getStructuralFingerprint` (2)

**Calls:**
- `mixStructuralFingerprintString` (2)

### `textAt`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:633` | Self: 0.0% (0us) | Total: 0.0% (5.9ms) | Samples: 0

**Called by:**
- `applyIndexed` (4)
- `applyIndexed` (1)

**Calls:**
- `textAt` (3)
- `textAt` (2)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:131` | Self: 0.0% (0us) | Total: 0.4% (918.9ms) | Samples: 0

**Called by:**
- `map` (726)

**Calls:**
- `insertText` (584)
- `insertText` (62)
- `apply` (58)
- `apply` (8)
- `apply` (6)
- `applyRoot` (4)
- `applyRoot` (1)
- `insertText` (1)
- `apply` (1)
- `apply` (1)

### `path`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-read-runtime.ts:324` | Self: 0.0% (0us) | Total: 0.0% (4.1ms) | Samples: 0

**Called by:**
- `above` (1)
- `path` (1)
- `node` (1)

**Calls:**
- `path` (1)
- `(anonymous)` (1)
- `path` (1)

### `createExtensionRegistryStore`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:570` | Self: 0.0% (0us) | Total: 0.0% (5.2ms) | Samples: 0

**Called by:**
- `getExtensionRegistryStore` (4)

**Calls:**
- `mergeRegistries` (1)
- `mergeRegistries` (1)
- `mergeRegistries` (1)
- `mergeRegistries` (1)

### `advancePathStableSnapshotIndex`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1830` | Self: 0.0% (0us) | Total: 0.0% (4.7ms) | Samples: 0

**Called by:**
- `inheritDocumentChangeStepNodeKeys` (4)

**Calls:**
- `compactMappingSegments` (2)
- `compactMappingSegments` (1)
- `freeze` (1)

### `addTouching`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:940` | Self: 0.0% (0us) | Total: 0.0% (2.4ms) | Samples: 0

**Called by:**
- `(anonymous)` (2)

**Calls:**
- `nodeRangesTouching` (2)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:603` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `map` (1)

**Calls:**
- `withInsertedNodeKeys` (1)

### `canonicalizeNode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:250` | Self: 0.0% (0us) | Total: 0.0% (162.6ms) | Samples: 0

**Called by:**
- `map` (128)

**Calls:**
- `map` (128)

### `fit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:2990` | Self: 0.0% (0us) | Total: 0.0% (170.6ms) | Samples: 0

**Called by:**
- `fitRoot` (136)

**Calls:**
- `structurallyEqual` (136)

### `SectionIterator`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:497` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `composeSections` (1)

**Calls:**
- `next` (1)

### `measureConnectDisconnectHeap`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:361` | Self: 0.0% (0us) | Total: 0.0% (28.2ms) | Samples: 0

**Called by:**
- `measureCohort` (22)

**Calls:**
- `(host)` (22)

### `getNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:913` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `getAffectedAnchorListeners` (1)

**Calls:**
- `getSelectionIds` (1)

### `applyIndexed`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2157` | Self: 0.0% (0us) | Total: 0.0% (1.5ms) | Samples: 0

**Called by:**
- `applyInternal` (1)

**Calls:**
- `materializeTokens` (1)

### `setNodeKey`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:169` | Self: 0.0% (0us) | Total: 0.0% (6.3ms) | Samples: 0

**Called by:**
- `advancePathStableSnapshotIndex` (4)

**Calls:**
- `advanceNextNodeKey` (2)
- `advanceNextNodeKey` (1)
- `advanceNextNodeKey` (1)

### `compose`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1060` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `apply` (1)

**Calls:**
- `performIteration` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:210` | Self: 0.0% (0us) | Total: 0.0% (2.5ms) | Samples: 0

**Called by:**
- `some` (2)

**Calls:**
- `jsonEqual` (2)

### `between`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:789` | Self: 0.0% (0us) | Total: 0.0% (12.4ms) | Samples: 0

**Called by:**
- `mapTextOffset` (10)

**Calls:**
- `between` (4)
- `between` (3)
- `between` (1)
- `between` (1)
- `between` (1)

### `canonicalizeDirectChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:203` | Self: 0.0% (0us) | Total: 0.0% (18.8ms) | Samples: 0

**Called by:**
- `canonicalizeRootChildren` (15)

**Calls:**
- `filter` (15)

### `runEditorTransaction`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7976` | Self: 0.0% (0us) | Total: 0.0% (3.6ms) | Samples: 0

**Called by:**
- `withUpdateTagContext` (3)

**Calls:**
- `getChangeValue` (2)
- `getChangeValue` (1)

### `text`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:665` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `diffNode` (1)

**Calls:**
- `PreparedTokenSlice` (1)

### `linkAndEvaluateModule`
`[native code]` | Self: 0.0% (0us) | Total: 0.0% (5.0ms) | Samples: 0

**Called by:**
- `async loadAndEvaluateModule` (3)

**Calls:**
- `link` (3)

### `apply`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1180` | Self: 0.0% (0us) | Total: 0.0% (12.7ms) | Samples: 0

**Called by:**
- `commit` (10)

**Calls:**
- `applyDocumentChangeValue` (10)

### `applyDocumentChangeValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1263` | Self: 0.0% (0us) | Total: 0.0% (12.7ms) | Samples: 0

**Called by:**
- `apply` (10)

**Calls:**
- `applyInternal` (8)
- `valueRoot` (1)
- `applyInternal` (1)

### `assign`
`[native code]` | Self: 0.0% (0us) | Total: 0.0% (2.3ms) | Samples: 0

**Called by:**
- `node:assert` (2)

**Calls:**
- `get` (2)

### `createEditorUpdateDraftContext`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7680` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (1)

**Calls:**
- `createEditorFacetDraft` (1)

### `assertSelectionSupported`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:726` | Self: 0.0% (0us) | Total: 0.0% (2.3ms) | Samples: 0

**Called by:**
- `mapSelectionThroughChange` (2)

**Calls:**
- `positionAt` (2)

### `notifyListeners`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7542` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `(anonymous)` (1)

### `between`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1556` | Self: 0.0% (0us) | Total: 0.0% (4.0ms) | Samples: 0

**Called by:**
- `between` (3)

**Calls:**
- `create` (2)
- `create` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:341` | Self: 0.0% (0us) | Total: 0.0% (185.3ms) | Samples: 0

**Called by:**
- `withDecodedSplicedNodes` (90)
- `withSplicedNodes` (56)

**Calls:**
- `freeze` (146)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3178` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `assertDocument` (1)

**Calls:**
- `getDeclarativeSchema` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:130` | Self: 0.0% (0us) | Total: 0.0% (3.4ms) | Samples: 0

**Called by:**
- `map` (3)

**Calls:**
- `find` (2)
- `fromEntries` (1)

### `advancePathStableSnapshotIndex`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1807` | Self: 0.0% (0us) | Total: 0.0% (5.1ms) | Samples: 0

**Called by:**
- `inheritDocumentChangeStepNodeKeys` (4)

**Calls:**
- `freeze` (3)
- `compactMappingSegments` (1)

### `applyTransactionSpecDocumentChangeStep`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7410` | Self: 0.0% (0us) | Total: 0.0% (9.7ms) | Samples: 0

**Called by:**
- `applyDocumentChange` (8)

**Calls:**
- `notifyAnchorChanges` (7)
- `notifyAnchorChanges` (1)

### `compose`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1095` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `apply` (1)

**Calls:**
- `get empty` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:724` | Self: 0.0% (0us) | Total: 1.7% (3.76s) | Samples: 0

**Called by:**
- `map` (2940)

**Calls:**
- `(anonymous)` (1536)
- `(anonymous)` (1311)
- `(anonymous)` (80)
- `(anonymous)` (4)
- `cacheIndex` (3)
- `ensureElementOwnedRootIndex` (2)
- `(anonymous)` (2)
- `(anonymous)` (1)
- `cacheIndex` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6909` | Self: 0.0% (0us) | Total: 0.6% (1.43s) | Samples: 0

**Called by:**
- `validateConstructed` (1130)

**Calls:**
- `validateDocumentChange` (633)
- `validateDocumentChange` (245)
- `validateDocumentChange` (61)
- `validateDocumentChange` (45)
- `validateDocumentChange` (38)
- `validateDocumentChange` (33)
- `validateDocumentChange` (19)
- `validateDocumentChange` (17)
- `validateDocumentChange` (10)
- `validateDocumentChange` (10)
- `validateDocumentChange` (6)
- `validateDocumentChange` (4)
- `validateDocumentChange` (4)
- `validateDocumentChange` (1)
- `validateDocumentChange` (1)
- `validateDocumentChange` (1)
- `validateDocumentChange` (1)
- `validateDocumentChange` (1)

### `mapSelectionWithContext`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:781` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `mapSelectionThroughChange` (1)

**Calls:**
- `isNode` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:322` | Self: 0.0% (0us) | Total: 0.0% (2.1ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (2)

**Calls:**
- `from` (2)

### `createInternalDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:577` | Self: 0.0% (0us) | Total: 0.7% (1.53s) | Samples: 0

**Called by:**
- `classify` (695)
- `adopt` (336)
- `apply` (47)
- `get` (39)
- `get` (34)
- `applyTrustedCanonical` (27)
- `assertCanonical` (7)
- `mapTextOffset` (6)
- `applyRoot` (4)
- `finalize` (2)
- `apply` (2)
- `fit` (1)

**Calls:**
- `constructDocumentChange` (1200)

### `between`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1558` | Self: 0.0% (0us) | Total: 0.0% (63.9ms) | Samples: 0

**Called by:**
- `reconcileChildrenStep` (49)
- `between` (1)

**Calls:**
- `sliceMaterialized` (40)
- `sliceMaterialized` (3)
- `sliceMaterialized` (2)
- `sliceMaterialized` (2)
- `sliceMaterialized` (2)
- `sliceMaterialized` (1)

### `classifyDocumentRange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:63` | Self: 0.0% (0us) | Total: 0.0% (6.1ms) | Samples: 0

**Called by:**
- `classifyRootChangeWithRuntimeCandidates` (4)
- `classifyRootChangeWithRuntimeCandidates` (1)

**Calls:**
- `map` (5)

### `fit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3056` | Self: 0.0% (0us) | Total: 6.4% (13.77s) | Samples: 0

**Called by:**
- `fitRoot` (5526)
- `(anonymous)` (5301)

**Calls:**
- `prepareFittedDocument` (5706)
- `prepareFittedDocument` (2796)
- `prepareFittedDocument` (2321)
- `(anonymous)` (2)
- `prepareFittedDocument` (2)

### `measureCohort`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:399` | Self: 0.0% (0us) | Total: 0.8% (1.88s) | Samples: 0

**Called by:**
- `(anonymous)` (1485)

**Calls:**
- `runRemoteChangeBatch` (1402)
- `runRemoteChangeBatch` (76)
- `stringify` (6)
- `runRemoteChangeBatch` (1)

### `applyEditorUpdateTags`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/update-policy.ts:56` | Self: 0.0% (0us) | Total: 0.0% (2.5ms) | Samples: 0

**Called by:**
- `reduceEditorUpdateTags` (2)

**Calls:**
- `applyEditorUpdateTag` (2)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/provenance.ts:53` | Self: 0.0% (0us) | Total: 0.0% (30.7ms) | Samples: 0

**Called by:**
- `forEach` (25)

**Calls:**
- `visitDescendantPaths` (25)

### `run`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/editor/insert-text.ts:86` | Self: 0.0% (0us) | Total: 0.0% (35.3ms) | Samples: 0

**Called by:**
- `applyInsertTextCommand` (28)

**Calls:**
- `runEditorTransaction` (28)

### `fitDocumentInput`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3171` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `fitDocument` (1)

**Calls:**
- `cloneFrozen` (1)

### `mapExternalRootSelection`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1633` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `fit` (1)

**Calls:**
- `(anonymous)` (1)

### `constructCanonicalDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1110` | Self: 0.0% (0us) | Total: 0.2% (631.2ms) | Samples: 0

**Called by:**
- `finalize` (498)

**Calls:**
- `canonicalizeRootChildren` (473)
- `canonicalizeRootChildren` (16)
- `canonicalizeRootChildren` (9)

### `retainOrigin`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:448` | Self: 0.0% (0us) | Total: 0.0% (4.8ms) | Samples: 0

**Called by:**
- `fitClosedContent` (2)
- `visit` (2)

**Calls:**
- `isElement` (2)
- `isElement` (1)
- `isElement` (1)

### `publishConfiguredExtensionRegistry`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:717` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `commit` (1)

**Calls:**
- `mergeRegistries` (1)

### `node:assert`
`node:assert:588` | Self: 0.0% (0us) | Total: 0.0% (2.3ms) | Samples: 0

**Called by:**
- `anonymous` (2)

**Calls:**
- `assign` (2)

### `replaceCanonicalChildWindow`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:809` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `isElement` (1)

### `applyCanonical`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:511` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `applyDocumentChange` (1)

**Calls:**
- `ChangeDraft` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8498` | Self: 0.0% (0us) | Total: 0.0% (29.3ms) | Samples: 0

**Called by:**
- `withEditorUpdateRoot` (23)

**Calls:**
- `setCurrentSelection` (23)

### `encodeTrustedNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:876` | Self: 0.0% (0us) | Total: 0.2% (475.3ms) | Samples: 0

**Called by:**
- `materializeTokens` (370)

**Calls:**
- `forEach` (370)

### `hasContentRoots`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:1013` | Self: 0.0% (0us) | Total: 0.0% (2.5ms) | Samples: 0

**Called by:**
- `getOrphanedElementOwnedRoots` (1)
- `indexConstructedRoot` (1)

**Calls:**
- `performProxyObjectGet` (1)
- `getDeclarativeSchema` (1)

### `composeSections`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:605` | Self: 0.0% (0us) | Total: 0.0% (2.5ms) | Samples: 0

**Called by:**
- `compose` (2)

**Calls:**
- `SectionIterator` (1)
- `SectionIterator` (1)

### `resolveSnapshotSelection`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8539` | Self: 0.0% (0us) | Total: 0.0% (3.9ms) | Samples: 0

**Called by:**
- `(anonymous)` (3)

**Calls:**
- `resolveSnapshotPoint` (3)

### `createCommitChanged`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:406` | Self: 0.0% (0us) | Total: 0.0% (1.0ms) | Samples: 0

**Called by:**
- `createEditorCommit` (1)

**Calls:**
- `performIteration` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8452` | Self: 0.0% (0us) | Total: 1.2% (2.70s) | Samples: 0

**Called by:**
- `runEditorTransaction` (2066)
- `runEditorTransaction` (31)

**Calls:**
- `applyTransactionSpec` (2097)

### `buildTransactionSpec`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5679` | Self: 0.0% (0us) | Total: 0.0% (4.0ms) | Samples: 0

**Called by:**
- `createRootFitTransactionSpec` (3)

**Calls:**
- `finalizeTransactionSpecContext` (1)
- `finalizeTransactionSpecContext` (1)
- `finalizeTransactionSpecContext` (1)

### `compose`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1093` | Self: 0.0% (0us) | Total: 0.0% (51.7ms) | Samples: 0

**Called by:**
- `apply` (42)

**Calls:**
- `compose` (22)
- `compose` (20)

### `classifyRootChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:233` | Self: 0.0% (0us) | Total: 0.0% (6.4ms) | Samples: 0

**Called by:**
- `between` (5)

**Calls:**
- `classifyRootChangeWithRuntimeCandidates` (2)
- `classifyRootChangeWithRuntimeCandidates` (2)
- `classifyRootChangeWithRuntimeCandidates` (1)

### `runRemoteChangeBatch`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:227` | Self: 0.0% (0us) | Total: 2.7% (5.80s) | Samples: 0

**Called by:**
- `(anonymous)` (3165)
- `measureCohort` (1402)

**Calls:**
- `createEditorWithDocument` (4555)
- `createEditorWithDocument` (8)
- `createEditorWithDocument` (4)

### `mapSnapshotIndexThroughChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1370` | Self: 0.0% (0us) | Total: 0.0% (11.3ms) | Samples: 0

**Called by:**
- `inheritDocumentChangeStepNodeKeys` (9)

**Calls:**
- `flatIntoArrayWithCallback` (9)

### `getUpdateView`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5117` | Self: 0.0% (0us) | Total: 0.0% (3.6ms) | Samples: 0

**Called by:**
- `(anonymous)` (3)

**Calls:**
- `freeze` (3)

### `inheritDocumentChangeStepNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7221` | Self: 0.0% (0us) | Total: 0.0% (3.6ms) | Samples: 0

**Called by:**
- `applyTransactionSpecDocumentChangeStep` (3)

**Calls:**
- `generatorResume` (3)

### `createEditorDocumentChangeBuilder`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6894` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `createEditorUpdateDraftContext` (1)

**Calls:**
- `copyDataProperties` (1)

### `fitDocumentInput`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3168` | Self: 0.0% (0us) | Total: 0.0% (165.8ms) | Samples: 0

**Called by:**
- `fitDocument` (131)

**Calls:**
- `assertJsonValue` (131)

### `DocumentIndex`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:491` | Self: 0.0% (0us) | Total: 0.0% (72.9ms) | Samples: 0

**Called by:**
- `fromValue` (52)

**Calls:**
- `createTreeIndex` (52)

### `publishConfiguredExtensionRegistry`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:730` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `commit` (1)

**Calls:**
- `(anonymous)` (1)

### `projectSelectionRange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:94` | Self: 0.0% (0us) | Total: 0.0% (6.4ms) | Samples: 0

**Called by:**
- `getSelectionRanges` (4)
- `insertText` (1)

**Calls:**
- `projectSelectionPoint` (3)
- `freeze` (2)

### `getRootContent`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:940` | Self: 0.0% (0us) | Total: 0.0% (2.3ms) | Samples: 0

**Called by:**
- `constructCanonicalDocumentChange` (2)

**Calls:**
- `getDocumentRootProgram` (2)

### `resolveMappedPoint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts:424` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `map` (1)

**Calls:**
- `nodeAtPath` (1)

### `node:path`
`node:path:2` | Self: 0.0% (0us) | Total: 0.0% (2.3ms) | Samples: 0

**Called by:**
- `parseModule` (1)

**Calls:**
- `anonymous` (1)

### `measureCohort`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:385` | Self: 0.0% (0us) | Total: 0.4% (921.7ms) | Samples: 0

**Called by:**
- `(anonymous)` (728)

**Calls:**
- `compileRemoteChanges` (726)
- `compileRemoteChanges` (2)

### `applyTransactionSpecDocumentChangeStep`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7364` | Self: 0.0% (0us) | Total: 0.0% (6.3ms) | Samples: 0

**Called by:**
- `applyDocumentChange` (5)

**Calls:**
- `recordFacetDraftDocumentChange` (2)
- `recordFacetDraftDocumentChange` (2)
- `recordFacetDraftDocumentChange` (1)

### `applyPreparedTransactionSpecChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5589` | Self: 0.0% (0us) | Total: 1.2% (2.70s) | Samples: 0

**Called by:**
- `applyTransactionSpecContents` (2093)

**Calls:**
- `applyTransactionSpecDocumentChangeStep` (2065)
- `applyTransactionSpecDocumentChangeStep` (27)
- `applyTransactionSpecDocumentChangeStep` (1)

### `mapSnapshotIndexThroughChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1377` | Self: 0.0% (0us) | Total: 0.0% (76.1ms) | Samples: 0

**Called by:**
- `inheritDocumentChangeStepNodeKeys` (61)

**Calls:**
- `map` (61)

### `root`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:239` | Self: 0.0% (0us) | Total: 0.0% (199.3ms) | Samples: 0

**Called by:**
- `assertSelectionSupported` (155)
- `mapSelectionThroughChange` (4)

**Calls:**
- `isNode` (159)

### `evaluate`
`[native code]` | Self: 0.0% (0us) | Total: 99.9% (212.06s) | Samples: 0

**Called by:**
- `async asyncModuleEvaluation` (166411)
- `moduleEvaluation` (1)

**Calls:**
- `(module)` (166411)
- `(module)` (1)

### `subscribeAnchorState`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:329` | Self: 0.0% (0us) | Total: 0.0% (3.7ms) | Samples: 0

**Called by:**
- `createAnchor` (3)

**Calls:**
- `createEditorDocumentValue` (3)

### `node`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:591` | Self: 0.0% (0us) | Total: 8.6% (18.33s) | Samples: 0

**Called by:**
- `sameNodeKind` (8067)
- `sameNodeKind` (6085)
- `(anonymous)` (93)
- `classifyRootChangeWithRuntimeCandidates` (41)
- `(anonymous)` (34)
- `claim` (21)
- `collectRelocationCandidates` (14)

**Calls:**
- `nodeAtPath` (13120)
- `nodeAtPath` (875)
- `nodeAtPath` (258)
- `nodeAtPath` (102)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3017` | Self: 0.0% (0us) | Total: 0.0% (3.9ms) | Samples: 0

**Called by:**
- `fit` (3)

**Calls:**
- `flatIntoArrayWithCallback` (3)

### `DocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:762` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `constructDocumentChange` (1)

**Calls:**
- `freeze` (1)

### `get`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:235` | Self: 0.0% (0us) | Total: 0.0% (3.7ms) | Samples: 0

**Called by:**
- `performProxyObjectGet` (3)

**Calls:**
- `get` (3)

### `collectProjectedRoots`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3208` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `collectProjectedRoots` (1)

**Calls:**
- `isElement` (1)

### `between`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:781` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `mapTextOffset` (1)

**Calls:**
- `Map` (1)

### `cloneFrozenEditorJsonValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:300` | Self: 0.0% (0us) | Total: 0.0% (7.8ms) | Samples: 0

**Called by:**
- `createEditorCommit` (3)
- `getRootScopedSelection` (2)
- `createEditorCommit` (1)

**Calls:**
- `cloneEditorJsonValue` (6)

### `path`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/editor/path.ts:23` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `path` (1)

**Calls:**
- `isRange` (1)

### `mapSelectionThroughChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:901` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `applyTransactionSpecDocumentChangeStep` (1)

**Calls:**
- `positionAt` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8457` | Self: 0.0% (0us) | Total: 0.1% (328.0ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (204)
- `runEditorTransaction` (53)

**Calls:**
- `closed` (214)
- `snapshot` (43)

### `applyIndexed`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2376` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `applyInternal` (1)

**Calls:**
- `map` (1)

### `getCurrentSelection`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6191` | Self: 0.0% (0us) | Total: 0.0% (6.7ms) | Samples: 0

**Called by:**
- `getCurrentRootSnapshot` (5)

**Calls:**
- `cloneEditorJsonValue` (4)
- `getSelectionStateSelection` (1)

### `diffChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1132` | Self: 0.0% (0us) | Total: 0.0% (1.0ms) | Samples: 0

**Called by:**
- `createStructurallyAlignedChanges` (1)

**Calls:**
- `freeze` (1)

### `getUpdateView`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5144` | Self: 0.0% (0us) | Total: 0.0% (2.2ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)
- `(anonymous)` (1)

**Calls:**
- `performProxyObjectGet` (2)

### `snapshot`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:224` | Self: 0.0% (0us) | Total: 0.4% (948.0ms) | Samples: 0

**Called by:**
- `closed` (653)
- `(anonymous)` (43)
- `fitRoot` (40)

**Calls:**
- `snapshotContentSlice` (735)
- `snapshotContentSlice` (1)

### `canonicalizeRootChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:314` | Self: 0.0% (0us) | Total: 0.2% (599.5ms) | Samples: 0

**Called by:**
- `constructCanonicalDocumentChange` (473)

**Calls:**
- `map` (473)

### `classify`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:364` | Self: 0.0% (0us) | Total: 0.9% (2.05s) | Samples: 0

**Called by:**
- `prepareFittedDocument` (1623)

**Calls:**
- `classifyRootChangeWithRuntimeCandidates` (562)
- `classifyRootChangeWithRuntimeCandidates` (369)
- `classifyRootChangeWithRuntimeCandidates` (220)
- `classifyRootChangeWithRuntimeCandidates` (119)
- `classifyRootChangeWithRuntimeCandidates` (118)
- `classifyRootChangeWithRuntimeCandidates` (46)
- `classifyRootChangeWithRuntimeCandidates` (39)
- `classifyRootChangeWithRuntimeCandidates` (32)
- `classifyRootChangeWithRuntimeCandidates` (25)
- `classifyRootChangeWithRuntimeCandidates` (24)
- `classifyRootChangeWithRuntimeCandidates` (23)
- `classifyRootChangeWithRuntimeCandidates` (20)
- `classifyRootChangeWithRuntimeCandidates` (16)
- `classifyRootChangeWithRuntimeCandidates` (3)
- `classifyRootChangeWithRuntimeCandidates` (3)
- `classifyRootChangeWithRuntimeCandidates` (2)
- `classifyRootChangeWithRuntimeCandidates` (2)

### `WriteStream`
`internal:fs/streams:244` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `writer` (1)

### `constructCanonicalDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1047` | Self: 0.0% (0us) | Total: 0.0% (1.0ms) | Samples: 0

**Called by:**
- `assertCanonical` (1)

**Calls:**
- `performProxyObjectGet` (1)

### `normalizeSelectionRoot`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-state.ts:46` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `setSelectionStateSelection` (1)

**Calls:**
- `isRange` (1)

### `mapRange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:577` | Self: 0.0% (0us) | Total: 0.0% (22.6ms) | Samples: 0

**Called by:**
- `mapSelectionWithContext` (13)

**Calls:**
- `mapPoint` (4)
- `mapPoint` (3)
- `mapPoint` (1)
- `mapPoint` (1)
- `mapPoint` (1)
- `mapPoint` (1)
- `publicPoint` (1)
- `mapPoint` (1)

### `notifyListeners`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7518` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `performIteration` (1)

### `getUpdateView`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4600` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `freeze` (1)

### `createEditorImplementation`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts:652` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `createEditorWithDocument` (1)

**Calls:**
- `createEditorReadRuntime` (1)

### `mapPoint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:427` | Self: 0.0% (0us) | Total: 0.0% (6.2ms) | Samples: 0

**Called by:**
- `mapRange` (4)
- `mapRange` (1)

**Calls:**
- `iterChangedRanges` (3)
- `iterChangedRanges` (1)
- `iterChangedRanges` (1)

### `assertActive`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:3941` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `runActive` (1)

**Calls:**
- `assertActiveTransaction` (1)

### `measureConnectDisconnectHeap`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:351` | Self: 0.0% (0us) | Total: 2.8% (5.96s) | Samples: 0

**Called by:**
- `measureCohort` (4711)

**Calls:**
- `forceGc` (4711)

### `applyTransactionSpecDocumentChangeStep`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7370` | Self: 0.0% (0us) | Total: 0.0% (109.2ms) | Samples: 0

**Called by:**
- `applyDocumentChange` (82)

**Calls:**
- `mapSelectionThroughChange` (41)
- `mapSelectionThroughChange` (33)
- `mapSelectionThroughChange` (4)
- `mapSelectionThroughChange` (2)
- `mapSelectionThroughChange` (1)
- `mapSelectionThroughChange` (1)

### `runEditorTransaction`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8005` | Self: 0.0% (0us) | Total: 0.4% (908.5ms) | Samples: 0

**Called by:**
- `withUpdateTagContext` (692)
- `replaceTransformedSnapshot` (20)
- `invoke` (4)
- `runTrustedUpdate` (1)

**Calls:**
- `getCurrentRootSnapshot` (686)
- `getCurrentRootSnapshot` (13)
- `getCurrentRootSnapshot` (12)
- `getCurrentRootSnapshot` (2)
- `(anonymous)` (1)
- `getSelectionOnlySnapshot` (1)
- `freeze` (1)
- `getCurrentRootSnapshot` (1)

### `fit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:2864` | Self: 0.0% (0us) | Total: 1.1% (2.50s) | Samples: 0

**Called by:**
- `fitRoot` (1491)
- `(anonymous)` (481)

**Calls:**
- `(anonymous)` (1858)
- `(anonymous)` (114)

### `replaceIndexedChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:293` | Self: 0.0% (0us) | Total: 0.0% (9.1ms) | Samples: 0

**Called by:**
- `withText` (7)

**Calls:**
- `(anonymous)` (3)
- `(anonymous)` (1)
- `(anonymous)` (1)
- `(anonymous)` (1)
- `(anonymous)` (1)

### `classifyDocumentRange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:82` | Self: 0.0% (0us) | Total: 0.1% (326.2ms) | Samples: 0

**Called by:**
- `classifyRootChangeWithRuntimeCandidates` (245)
- `classifyRootChangeWithRuntimeCandidates` (13)

**Calls:**
- `map` (258)

### `composeSections`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:637` | Self: 0.0% (0us) | Total: 0.0% (4.1ms) | Samples: 0

**Called by:**
- `compose` (3)

**Calls:**
- `addSection` (3)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/editor/insert-text.ts:100` | Self: 0.0% (0us) | Total: 0.0% (2.7ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (2)

**Calls:**
- `shouldIgnoreTarget` (1)
- `above` (1)

### `path`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/editor/path.ts:36` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `path` (1)

**Calls:**
- `isPoint` (1)

### `getRegistry`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:547` | Self: 0.0% (0us) | Total: 0.0% (13.0ms) | Samples: 0

**Called by:**
- `getDeclarativeSchema` (10)

**Calls:**
- `getExtensionRegistry` (10)

### `createEditorCommit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:1011` | Self: 0.0% (0us) | Total: 0.0% (19.3ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (16)

**Calls:**
- `createCommitChanged` (7)
- `createCommitChanged` (2)
- `createCommitChanged` (2)
- `createCommitChanged` (1)
- `createCommitChanged` (1)
- `freeze` (1)
- `createCommitChanged` (1)
- `createCommitChanged` (1)

### `reconcileChildrenStep`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:3182` | Self: 0.0% (0us) | Total: 0.0% (62.8ms) | Samples: 0

**Called by:**
- `(anonymous)` (49)

**Calls:**
- `between` (49)

### `normalizePointRoot`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-state.ts:53` | Self: 0.0% (0us) | Total: 0.0% (2.2ms) | Samples: 0

**Called by:**
- `normalizeSelectionRoot` (2)

**Calls:**
- `copyDataProperties` (2)

### `createEditorUpdateDraftContext`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7654` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (1)

**Calls:**
- `getChangeValue` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1184` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `iterChangedRanges` (1)

**Calls:**
- `isElement` (1)

### `updateIndexedNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:418` | Self: 0.0% (0us) | Total: 0.0% (1.5ms) | Samples: 0

**Called by:**
- `withNodeUpdates` (1)

**Calls:**
- `freeze` (1)

### `compose`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1111` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `apply` (1)

**Calls:**
- `Set` (1)

### `addAnchorListener`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:150` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `subscribeAnchorState` (1)

**Calls:**
- `indexAnchorListener` (1)

### `getPublicSelection`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6302` | Self: 0.0% (0us) | Total: 0.0% (6.3ms) | Samples: 0

**Called by:**
- `insertText` (5)

**Calls:**
- `createEditorDocumentValue` (5)

### `internal:assert/assertion_error`
`internal:assert/assertion_error:2` | Self: 0.0% (0us) | Total: 0.0% (2.3ms) | Samples: 0

**Called by:**
- `anonymous` (2)

**Calls:**
- `anonymous` (2)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:216` | Self: 0.0% (0us) | Total: 0.0% (21.6ms) | Samples: 0

**Called by:**
- `measure` (17)

**Calls:**
- `(host)` (17)

### `createEditorWithDocument`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:85` | Self: 0.0% (0us) | Total: 0.0% (8.6ms) | Samples: 0

**Called by:**
- `(anonymous)` (7)

**Calls:**
- `createEditorImplementation` (3)
- `createEditorImplementation` (2)
- `canonicalizeEditorExtension` (1)
- `createEditorImplementation` (1)

### `createTransactionSpecContext`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5240` | Self: 0.0% (0us) | Total: 0.0% (3.6ms) | Samples: 0

**Called by:**
- `buildTransactionSpec` (3)

**Calls:**
- `createEditorDocumentValue` (3)

### `change`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts:670` | Self: 0.0% (0us) | Total: 0.0% (69.6ms) | Samples: 0

**Called by:**
- `notifyAnchorChanges` (55)

**Calls:**
- `mapTo` (55)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1179` | Self: 0.0% (0us) | Total: 0.0% (3.9ms) | Samples: 0

**Called by:**
- `iterChangedRanges` (3)

**Calls:**
- `nodeRange` (3)

### `initializePublicState`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8705` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `createEditorImplementation` (1)

**Calls:**
- `normalizeEditorValue` (1)

### `buildConfiguredRegistry`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:1915` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `createExtensionRegistry` (1)

### `getPathByNodeKey`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:1977` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `getPathByNodeKey` (1)

**Calls:**
- `performIteration` (1)

### `addSection`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:589` | Self: 0.0% (0us) | Total: 0.0% (211.6ms) | Samples: 0

**Called by:**
- `composeSections` (85)
- `composeSections` (84)

**Calls:**
- `concat` (150)
- `concat` (9)
- `concat` (5)
- `concat` (4)
- `concat` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:320` | Self: 0.0% (0us) | Total: 51.1% (108.42s) | Samples: 0

**Called by:**
- `measure` (85114)

**Calls:**
- `(host)` (85114)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:437` | Self: 0.0% (0us) | Total: 99.9% (212.05s) | Samples: 0

**Called by:**
- `map` (166411)

**Calls:**
- `measureCohort` (88075)
- `measureCohort` (32145)
- `measureCohort` (18151)
- `measureCohort` (13010)
- `measureCohort` (3337)
- `measureCohort` (3298)
- `measureCohort` (3255)
- `measureCohort` (2927)
- `measureCohort` (1485)
- `measureCohort` (728)

### `replaceIndexedChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:314` | Self: 0.0% (0us) | Total: 0.8% (1.80s) | Samples: 0

**Called by:**
- `withText` (1420)

**Calls:**
- `freeze` (1420)

### `runActive`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:3944` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `apply` (1)

**Calls:**
- `assertActive` (1)

### `fit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1655` | Self: 0.0% (0us) | Total: 0.0% (70.6ms) | Samples: 0

**Called by:**
- `(anonymous)` (56)

**Calls:**
- `createRootFitPathProvenance` (56)

### `classify`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:352` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `prepareFittedDocument` (1)

**Calls:**
- `performIteration` (1)

### `getDerivedBaseSchema`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-contribution-registry.ts:61` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `createSchemaContributionRegistry` (1)

**Calls:**
- `compileEditorSchemaInternal` (1)

### `applyTrustedCanonical`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:563` | Self: 0.0% (0us) | Total: 0.0% (4.1ms) | Samples: 0

**Called by:**
- `applyDocumentChange` (3)

**Calls:**
- `Map` (3)

### `recordStats`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2572` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `applyInternal` (1)

**Calls:**
- `map` (1)

### `runEditorTransaction`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8131` | Self: 0.0% (0us) | Total: 0.0% (141.0ms) | Samples: 0

**Called by:**
- `replaceTransformedSnapshot` (79)
- `withUpdateTagContext` (31)

**Calls:**
- `(anonymous)` (110)

### `compileRemoteChanges`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:116` | Self: 0.0% (0us) | Total: 0.0% (2.7ms) | Samples: 0

**Called by:**
- `measureCohort` (2)

**Calls:**
- `from` (2)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6690` | Self: 0.0% (0us) | Total: 0.4% (868.0ms) | Samples: 0

**Called by:**
- `getCurrentRootSnapshot` (686)

**Calls:**
- `isFrozen` (686)

### `getUpdateView`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4652` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `freeze` (1)

### `prepareScopedEditorExtensionPublication`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:2612` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `publishInitialEditorExtensions` (1)

**Calls:**
- `flatIntoArrayWithCallback` (1)

### `createRootFitTransactionSpec`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8158` | Self: 0.0% (0us) | Total: 56.1% (119.09s) | Samples: 0

**Called by:**
- `(anonymous)` (93480)

**Calls:**
- `buildTransactionSpec` (93474)
- `buildTransactionSpec` (3)
- `buildTransactionSpec` (3)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8040` | Self: 0.0% (0us) | Total: 0.0% (2.7ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (2)

**Calls:**
- `getEditorDocumentRoots` (1)
- `getEditorDocumentRoots` (1)

### `fitDocument`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3318` | Self: 0.0% (0us) | Total: 0.0% (4.8ms) | Samples: 0

**Called by:**
- `(anonymous)` (4)

**Calls:**
- `getCompiled` (3)
- `getCompiled` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:149` | Self: 0.0% (0us) | Total: 0.0% (121.3ms) | Samples: 0

**Called by:**
- `map` (95)

**Calls:**
- `cloneJson` (81)
- `cloneJson` (11)
- `cloneJson` (3)

### `setSelectionStateSelection`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-state.ts:72` | Self: 0.0% (0us) | Total: 0.0% (15.2ms) | Samples: 0

**Called by:**
- `publishTransactionDraft` (12)

**Calls:**
- `normalizeSelectionRoot` (5)
- `normalizeSelectionRoot` (4)
- `normalizeSelectionRoot` (2)
- `normalizeSelectionRoot` (1)

### `node:fs`
`node:fs:2` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `parseModule` (1)

**Calls:**
- `anonymous` (1)

### `createSchemaContributionRegistry`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-contribution-registry.ts:102` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `createExtensionRegistry` (1)

**Calls:**
- `getDerivedBaseSchema` (1)

### `fit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:2938` | Self: 0.0% (0us) | Total: 0.0% (2.4ms) | Samples: 0

**Called by:**
- `fitRoot` (2)

**Calls:**
- `(anonymous)` (1)
- `materializeCandidate` (1)

### `applyBuiltDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6982` | Self: 0.0% (0us) | Total: 0.0% (6.1ms) | Samples: 0

**Called by:**
- `insertTextAtPoint` (5)

**Calls:**
- `applyDocumentChangeStep` (5)

### `withExtensionPublicationRollback`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7770` | Self: 0.0% (0us) | Total: 0.0% (27.7ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (19)
- `runEditorTransaction` (3)

**Calls:**
- `(anonymous)` (19)
- `commit` (2)
- `(anonymous)` (1)

### `createEditorImplementation`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts:663` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `createEditorWithDocument` (1)

**Calls:**
- `createExtensionRegistry` (1)

### `invert`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1197` | Self: 0.0% (0us) | Total: 0.0% (3.9ms) | Samples: 0

**Called by:**
- `get` (3)

**Calls:**
- `map` (3)

### `apply`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4597` | Self: 0.0% (0us) | Total: 27.0% (57.32s) | Samples: 0

**Called by:**
- `(anonymous)` (38825)
- `runEditorTransaction` (6052)

**Calls:**
- `applyDocumentChange` (43716)
- `applyDocumentChange` (1160)
- `runActive` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:249` | Self: 0.0% (0us) | Total: 2.0% (4.24s) | Samples: 0

**Called by:**
- `measure` (3337)

**Calls:**
- `runRemoteChangeBatch` (3165)
- `runRemoteChangeBatch` (161)
- `stringify` (10)
- `runRemoteChangeBatch` (1)

### `canonicalizeRootChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:329` | Self: 0.0% (0us) | Total: 0.0% (11.5ms) | Samples: 0

**Called by:**
- `constructCanonicalDocumentChange` (9)

**Calls:**
- `every` (9)

### `getNodeKey`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:1911` | Self: 0.0% (0us) | Total: 0.0% (1.0ms) | Samples: 0

**Called by:**
- `getNodeKey` (1)

**Calls:**
- `getCurrentRuntimeIndex` (1)

### `bindDocumentChangeNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:599` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `get` (1)

**Calls:**
- `map` (1)

### `fit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1740` | Self: 0.0% (0us) | Total: 0.0% (27.3ms) | Samples: 0

**Called by:**
- `fitRoot` (16)
- `(anonymous)` (5)

**Calls:**
- `some` (21)

### `refresh`
`internal:util/colors:18` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `internal:util/colors` (1)

**Calls:**
- `(anonymous)` (1)

### `applyTrustedCanonical`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:701` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `applyDocumentChange` (1)

**Calls:**
- `performProxyObjectGet` (1)

### `finalizeExtensionRegistry`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:299` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `buildConfiguredRegistry` (1)

**Calls:**
- `finalizeCommandRegistry` (1)

### `apply`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:449` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `applyCanonical` (1)

**Calls:**
- `freezeReadonlyMap` (1)

### `runEditorTransaction`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7840` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `withUpdateTagContext` (1)

**Calls:**
- `performProxyObjectGet` (1)

### `runEditorTransaction`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7871` | Self: 0.0% (0us) | Total: 0.0% (6.3ms) | Samples: 0

**Called by:**
- `withUpdateTagContext` (4)
- `replaceTransformedSnapshot` (1)

**Calls:**
- `reconcileExclusiveElementOwnedRoots` (3)
- `reconcileExclusiveElementOwnedRoots` (1)
- `reconcileExclusiveElementOwnedRoots` (1)

### `canonicalizeRootChildren`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:320` | Self: 0.0% (0us) | Total: 0.0% (20.1ms) | Samples: 0

**Called by:**
- `constructCanonicalDocumentChange` (16)

**Calls:**
- `canonicalizeDirectChildren` (15)
- `canonicalizeDirectChildren` (1)

### `runEditorTransaction`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7827` | Self: 0.0% (0us) | Total: 0.0% (18.0ms) | Samples: 0

**Called by:**
- `withUpdateTagContext` (13)
- `replaceTransformedSnapshot` (1)

**Calls:**
- `reconcileExclusiveElementOwnedRoots` (7)
- `reconcileExclusiveElementOwnedRoots` (5)
- `reconcileExclusiveElementOwnedRoots` (2)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:2787` | Self: 0.0% (0us) | Total: 0.1% (265.8ms) | Samples: 0

**Called by:**
- `measureConnectDisconnectHeap` (210)

**Calls:**
- `cleanup` (209)
- `cleanup` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3058` | Self: 0.0% (0us) | Total: 0.0% (2.1ms) | Samples: 0

**Called by:**
- `fit` (2)

**Calls:**
- `fork` (1)
- `fork` (1)

### `getCurrentSelection`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6188` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `setSelectionValue` (1)

**Calls:**
- `getTransactionSpecContext` (1)

### `createTreeIndex`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts:71` | Self: 0.0% (0us) | Total: 0.0% (210.8ms) | Samples: 0

**Called by:**
- `fromPreparedNodes` (109)
- `DocumentIndex` (52)

**Calls:**
- `map` (161)

### `sliceMaterialized`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:794` | Self: 0.0% (0us) | Total: 0.0% (2.9ms) | Samples: 0

**Called by:**
- `between` (2)

**Calls:**
- `freeze` (2)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:338` | Self: 0.0% (0us) | Total: 0.1% (219.1ms) | Samples: 0

**Called by:**
- `measure` (171)

**Calls:**
- `(host)` (171)

### `createEditorImplementation`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts:674` | Self: 0.0% (0us) | Total: 0.0% (3.7ms) | Samples: 0

**Called by:**
- `createEditorWithDocument` (3)

**Calls:**
- `initializePublicState` (1)
- `initializePublicState` (1)
- `initializePublicState` (1)

### `fromValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:518` | Self: 0.0% (0us) | Total: 0.7% (1.69s) | Samples: 0

**Called by:**
- `fit` (1008)
- `reconcileChildrenStep` (124)
- `reconcileChildrenStep` (111)
- `getIndex` (61)
- `between` (5)
- `between` (4)
- `mapTextOffset` (4)
- `mapTextOffset` (2)

**Calls:**
- `DocumentIndex` (1198)
- `DocumentIndex` (56)
- `DocumentIndex` (52)
- `remember` (13)

### `applyCanonical`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:519` | Self: 0.0% (0us) | Total: 22.7% (48.30s) | Samples: 0

**Called by:**
- `applyDocumentChange` (37809)

**Calls:**
- `validate` (37809)

### `validateDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3623` | Self: 0.0% (0us) | Total: 0.0% (24.2ms) | Samples: 0

**Called by:**
- `(anonymous)` (19)

**Calls:**
- `getDescendant` (8)
- `getDescendant` (5)
- `getDescendant` (5)
- `getDescendant` (1)

### `addParentIndex`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3468` | Self: 0.0% (0us) | Total: 0.0% (10.5ms) | Samples: 0

**Called by:**
- `addOwnPath` (8)

**Calls:**
- `stringify` (8)

### `compose`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2661` | Self: 0.0% (0us) | Total: 0.0% (26.9ms) | Samples: 0

**Called by:**
- `compose` (22)

**Calls:**
- `RootChange` (14)
- `RootChange` (5)
- `RootChange` (2)
- `RootChange` (1)

### `publishTransactionDraft`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7748` | Self: 0.0% (0us) | Total: 0.0% (7.0ms) | Samples: 0

**Called by:**
- `(anonymous)` (6)

**Calls:**
- `structuredClone` (6)

### `fit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:2952` | Self: 0.0% (0us) | Total: 1.5% (3.32s) | Samples: 0

**Called by:**
- `fitRoot` (1365)
- `(anonymous)` (1256)

**Calls:**
- `(anonymous)` (2621)

### `extendEditor`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:2773` | Self: 0.0% (0us) | Total: 0.2% (602.9ms) | Samples: 0

**Called by:**
- `measureConnectDisconnectHeap` (243)
- `(anonymous)` (230)

**Calls:**
- `runTrustedUpdate` (473)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:2166` | Self: 0.0% (0us) | Total: 0.0% (6.2ms) | Samples: 0

**Called by:**
- `runWithEditorExtensionPublicationGuard` (5)

**Calls:**
- `buildConfiguredRegistry` (1)
- `buildConfiguredRegistry` (1)
- `buildConfiguredRegistry` (1)
- `buildConfiguredRegistry` (1)
- `buildConfiguredRegistry` (1)

### `runEditorTransaction`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7820` | Self: 0.0% (0us) | Total: 0.0% (3.6ms) | Samples: 0

**Called by:**
- `withUpdateTagContext` (3)

**Calls:**
- `getTransactionView` (1)
- `getTransactionView` (1)
- `getTransactionView` (1)

### `DocumentIndex`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:487` | Self: 0.0% (0us) | Total: 0.7% (1.52s) | Samples: 0

**Called by:**
- `fromValue` (1198)

**Calls:**
- `encodeNodes` (577)
- `encodeNodes` (424)
- `encodeNodes` (197)

### `fit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:1914` | Self: 0.0% (0us) | Total: 0.0% (1.0ms) | Samples: 0

**Called by:**
- `fitRoot` (1)

**Calls:**
- `map` (1)

### `addRange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:900` | Self: 0.0% (0us) | Total: 0.0% (7.8ms) | Samples: 0

**Called by:**
- `(anonymous)` (6)

**Calls:**
- `freeze` (6)

### `applyInternal`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2550` | Self: 0.0% (0us) | Total: 0.0% (3.4ms) | Samples: 0

**Called by:**
- `apply` (3)

**Calls:**
- `propertyChanges` (2)
- `propertyChanges` (1)

### `applyIndexed`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2391` | Self: 0.0% (0us) | Total: 0.0% (52.6ms) | Samples: 0

**Called by:**
- `applyInternal` (42)

**Calls:**
- `concat` (37)
- `concat` (2)
- `concat` (2)
- `concat` (1)

### `inheritDocumentChangeStepNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7320` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `applyTransactionSpecDocumentChangeStep` (1)

**Calls:**
- `freeze` (1)

### `requestInstantiate`
`[native code]` | Self: 0.0% (0us) | Total: 0.0% (24.4ms) | Samples: 0

**Called by:**
- `requestSatisfyUtil` (19)

**Calls:**
- `async (anonymous)` (19)

### `createAnchor`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts:660` | Self: 0.0% (0us) | Total: 0.0% (5.0ms) | Samples: 0

**Called by:**
- `from` (4)

**Calls:**
- `subscribeAnchorState` (3)
- `subscribeAnchorState` (1)

### `getStructuralFingerprint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:148` | Self: 0.0% (0us) | Total: 0.0% (23.3ms) | Samples: 0

**Called by:**
- `getStructuralFingerprint` (18)

**Calls:**
- `mixStructuralFingerprintString` (18)

### `setSelectionValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6148` | Self: 0.0% (0us) | Total: 0.0% (6.1ms) | Samples: 0

**Called by:**
- `setCurrentSelection` (5)

**Calls:**
- `every` (2)
- `equalValue` (2)
- `equalValue` (1)

### `classifyDocumentRange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:81` | Self: 0.0% (0us) | Total: 0.0% (11.2ms) | Samples: 0

**Called by:**
- `classifyRootChangeWithRuntimeCandidates` (8)
- `classifyRootChangeWithRuntimeCandidates` (1)

**Calls:**
- `sort` (9)

### `getUpdateView`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:4568` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `freeze` (1)

### `inheritDocumentChangeStepNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7310` | Self: 0.0% (0us) | Total: 50.9% (108.10s) | Samples: 0

**Called by:**
- `applyTransactionSpecDocumentChangeStep` (84829)

**Calls:**
- `mapSnapshotIndexThroughChange` (83963)
- `mapSnapshotIndexThroughChange` (208)
- `mapSnapshotIndexThroughChange` (152)
- `mapSnapshotIndexThroughChange` (84)
- `mapSnapshotIndexThroughChange` (82)
- `mapSnapshotIndexThroughChange` (61)
- `mapSnapshotIndexThroughChange` (61)
- `mapSnapshotIndexThroughChange` (33)
- `mapSnapshotIndexThroughChange` (31)
- `mapSnapshotIndexThroughChange` (30)
- `advancePathStableSnapshotIndex` (21)
- `mapSnapshotIndexThroughChange` (15)
- `mapSnapshotIndexThroughChange` (14)
- `mapSnapshotIndexThroughChange` (13)
- `advancePathStableSnapshotIndex` (12)
- `mapSnapshotIndexThroughChange` (9)
- `mapSnapshotIndexThroughChange` (8)
- `advancePathStableSnapshotIndex` (7)
- `advancePathStableSnapshotIndex` (5)
- `advancePathStableSnapshotIndex` (4)
- `advancePathStableSnapshotIndex` (4)
- `mapSnapshotIndexThroughChange` (2)
- `(anonymous)` (2)
- `advancePathStableSnapshotIndex` (1)
- `advancePathStableSnapshotIndex` (1)
- `advancePathStableSnapshotIndex` (1)
- `advancePathStableSnapshotIndex` (1)
- `advancePathStableSnapshotIndex` (1)
- `advancePathStableSnapshotIndex` (1)
- `mapIndex` (1)
- `advancePathStableSnapshotIndex` (1)

### `applyTrustedCanonical`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:660` | Self: 0.0% (0us) | Total: 0.0% (2.4ms) | Samples: 0

**Called by:**
- `applyDocumentChange` (2)

**Calls:**
- `performProxyObjectGet` (2)

### `createCommitChanged`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:388` | Self: 0.0% (0us) | Total: 0.0% (2.5ms) | Samples: 0

**Called by:**
- `createEditorCommit` (2)

**Calls:**
- `getPendingSelectionMarks` (2)

### `applyTransactionSpecDocumentChangeStep`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7399` | Self: 0.0% (0us) | Total: 0.0% (1.0ms) | Samples: 0

**Called by:**
- `applyPreparedTransactionSpecChange` (1)

**Calls:**
- `syncImplicitTargetToCurrentSelection` (1)

### `runEditorTransaction`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7873` | Self: 0.0% (0us) | Total: 0.0% (2.4ms) | Samples: 0

**Called by:**
- `withUpdateTagContext` (2)

**Calls:**
- `reconcileExclusiveElementOwnedRoots` (1)
- `reconcileExclusiveElementOwnedRoots` (1)

### `validateSubtree`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3595` | Self: 0.0% (0us) | Total: 0.1% (335.6ms) | Samples: 0

**Called by:**
- `validateDocumentChange` (156)
- `(anonymous)` (110)

**Calls:**
- `validateDeclarativeNodeProperties` (102)
- `validateDeclarativeNodeProperties` (66)
- `validateDeclarativeNodeProperties` (55)
- `validateDeclarativeNodeProperties` (20)
- `validateDeclarativeNodeProperties` (8)
- `validateDeclarativeNodeProperties` (6)
- `validateDeclarativeNodeProperties` (4)
- `validateDeclarativeNodeProperties` (2)
- `validateDeclarativeNodeProperties` (2)
- `validateDeclarativeNodeProperties` (1)

### `withoutPendingMarks`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6206` | Self: 0.0% (0us) | Total: 0.0% (11.0ms) | Samples: 0

**Called by:**
- `selectionPositionEquals` (5)
- `selectionPositionEquals` (4)

**Calls:**
- `isText` (4)
- `isText` (3)
- `isText` (2)

### `DocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:738` | Self: 0.0% (0us) | Total: 0.0% (3.6ms) | Samples: 0

**Called by:**
- `constructDocumentChange` (3)

**Calls:**
- `map` (3)

### `mapPoint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:470` | Self: 0.0% (0us) | Total: 0.0% (1.5ms) | Samples: 0

**Called by:**
- `mapRange` (1)

**Calls:**
- `keyAt` (1)

### `createEditorUpdateDraftContext`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7662` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (1)

**Calls:**
- `fromEntries` (1)

### `createEditorWithDocument`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:88` | Self: 0.0% (0us) | Total: 14.1% (30.03s) | Samples: 0

**Called by:**
- `runRemoteChangeBatch` (4555)
- `runRemoteChangesSeparately` (4306)
- `(anonymous)` (3074)
- `(anonymous)` (3048)
- `(anonymous)` (2956)
- `measureConnectDisconnectHeap` (2938)
- `measureAnchors` (2703)

**Calls:**
- `replace` (23579)
- `replace` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:330` | Self: 0.0% (0us) | Total: 0.1% (325.8ms) | Samples: 0

**Called by:**
- `withSplicedNodes` (255)

**Calls:**
- `map` (255)

### `applyAnchorChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts:311` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `notifyAnchorChanges` (1)

**Calls:**
- `freeze` (1)

### `diffNode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1043` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `diffChildren` (1)

**Calls:**
- `text` (1)

### `applyIndexed`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2185` | Self: 0.0% (0us) | Total: 0.0% (1.0ms) | Samples: 0

**Called by:**
- `applyInternal` (1)

**Calls:**
- `get` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/transforms-text/insert-text.ts:387` | Self: 0.0% (0us) | Total: 0.0% (22.4ms) | Samples: 0

**Called by:**
- `insertText` (18)

**Calls:**
- `insertTextAtPoint` (18)

### `createCommitChanged`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:387` | Self: 0.0% (0us) | Total: 0.0% (2.4ms) | Samples: 0

**Called by:**
- `createEditorCommit` (2)

**Calls:**
- `getPendingSelectionMarks` (2)

### `assignFreshNodeKey`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts:173` | Self: 0.0% (0us) | Total: 0.0% (44.2ms) | Samples: 0

**Called by:**
- `mapChangedNodeKeys` (34)

**Calls:**
- `allocateNodeKey` (32)
- `allocateNodeKey` (2)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8159` | Self: 0.0% (0us) | Total: 56.1% (119.08s) | Samples: 0

**Called by:**
- `(anonymous)` (93471)

**Calls:**
- `fit` (82760)
- `fit` (5301)
- `fit` (2090)
- `fit` (1256)
- `fit` (1019)
- `fit` (481)
- `fit` (248)
- `fit` (169)
- `fit` (64)
- `fit` (56)
- `fit` (11)
- `fit` (5)
- `fit` (3)
- `fit` (3)
- `fit` (2)
- `fit` (1)
- `fit` (1)
- `fit` (1)

### `forwardOutput`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:536` | Self: 0.0% (0us) | Total: 0.0% (2.5ms) | Samples: 0

**Called by:**
- `composeSections` (2)

**Calls:**
- `next` (1)
- `next` (1)

### `runRemoteChangeBatch`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:231` | Self: 0.0% (0us) | Total: 0.0% (2.3ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)
- `measureCohort` (1)

**Calls:**
- `assertRemoteCommit` (1)
- `assertRemoteCommit` (1)

### `decodeNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:195` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `PreparedTokenSliceStructureError` (1)

### `getElementOwnedRootIssues`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:1027` | Self: 0.0% (0us) | Total: 0.0% (2.3ms) | Samples: 0

**Called by:**
- `validateDeclarativeDocument` (2)

**Calls:**
- `flatMap` (2)

### `mapSnapshotIndexThroughChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1389` | Self: 0.0% (0us) | Total: 0.0% (104.9ms) | Samples: 0

**Called by:**
- `inheritDocumentChangeStepNodeKeys` (84)

**Calls:**
- `(anonymous)` (84)

### `rememberValidatedDocumentRoots`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3132` | Self: 0.0% (0us) | Total: 0.9% (2.02s) | Samples: 0

**Called by:**
- `(anonymous)` (821)
- `adoptDocumentBaseline` (770)

**Calls:**
- `isFrozen` (1591)

### `selectionPositionEquals`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6215` | Self: 0.0% (0us) | Total: 0.0% (5.1ms) | Samples: 0

**Called by:**
- `(anonymous)` (4)

**Calls:**
- `withoutPendingMarks` (4)

### `measureAnchors`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:270` | Self: 0.0% (0us) | Total: 0.0% (9.8ms) | Samples: 0

**Called by:**
- `measureCohort` (8)

**Calls:**
- `from` (8)

### `runTargetMutation`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:3968` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `getMutationRoot` (1)

### `classifyRootChangeWithRuntimeCandidates`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:149` | Self: 0.0% (0us) | Total: 0.0% (34.1ms) | Samples: 0

**Called by:**
- `classify` (25)
- `apply` (2)

**Calls:**
- `overlappingRanges` (23)
- `overlappingRanges` (4)

### `deepStrictEqual`
`node:assert:133` | Self: 0.0% (0us) | Total: 0.0% (1.5ms) | Samples: 0

**Called by:**
- `assertRemoteCommit` (1)

**Calls:**
- `deepEquals` (1)

### `adoptCanonicalBaseline`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6858` | Self: 0.0% (0us) | Total: 2.1% (4.52s) | Samples: 0

**Called by:**
- `applyTrustedCanonical` (3554)

**Calls:**
- `adoptDocumentBaseline` (3554)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:132` | Self: 0.0% (0us) | Total: 0.0% (5.6ms) | Samples: 0

**Called by:**
- `map` (5)

**Calls:**
- `cloneObject` (5)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3153` | Self: 0.0% (0us) | Total: 4.9% (10.57s) | Samples: 0

**Called by:**
- `assertDocument` (8304)

**Calls:**
- `assertSchemaJsonValue` (8304)

### `classifyRootChangeWithRuntimeCandidates`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:208` | Self: 0.0% (0us) | Total: 0.0% (2.5ms) | Samples: 0

**Called by:**
- `classify` (2)

**Calls:**
- `some` (2)

### `resolveMappedPoint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts:467` | Self: 0.0% (0us) | Total: 0.0% (53.4ms) | Samples: 0

**Called by:**
- `map` (42)

**Calls:**
- `memoize` (42)

### `mapChangedNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:990` | Self: 0.0% (0us) | Total: 0.4% (913.8ms) | Samples: 0

**Called by:**
- `mapSnapshotIndexThroughChange` (714)

**Calls:**
- `getSegmentRelocations` (714)

### `createEditorFacetDraft`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/facet.ts:95` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `createEditorUpdateDraftContext` (1)

**Calls:**
- `Map` (1)

### `getStructuralFingerprint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts:108` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `getStructuralFingerprint` (1)

**Calls:**
- `isArray` (1)

### `getChangeValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6747` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `reconcileExclusiveElementOwnedRoots` (1)

**Calls:**
- `entries` (1)

### `sliceMaterialized`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:810` | Self: 0.0% (0us) | Total: 0.0% (50.5ms) | Samples: 0

**Called by:**
- `between` (40)

**Calls:**
- `PreparedTokenSlice` (19)
- `PreparedTokenSlice` (18)
- `PreparedTokenSlice` (2)
- `PreparedTokenSlice` (1)

### `equalValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts:152` | Self: 0.0% (0us) | Total: 0.0% (2.3ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)
- `every` (1)

**Calls:**
- `every` (2)

### `mapTextOffset`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts:139` | Self: 0.0% (0us) | Total: 0.0% (5.3ms) | Samples: 0

**Called by:**
- `memoize` (4)

**Calls:**
- `fromValue` (2)
- `pointAt` (1)
- `remember` (1)

### `replaceCanonicalChildWindow`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:911` | Self: 0.0% (0us) | Total: 0.0% (35.4ms) | Samples: 0

**Called by:**
- `(anonymous)` (27)

**Calls:**
- `canonicalizeDeclarativeChildren` (27)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:1861` | Self: 0.0% (0us) | Total: 0.0% (2.4ms) | Samples: 0

**Called by:**
- `setCurrentSelection` (2)

**Calls:**
- `getStateFieldIdentityMap` (2)

### `compactMappingSegments`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:476` | Self: 0.0% (0us) | Total: 0.0% (208.4ms) | Samples: 0

**Called by:**
- `(anonymous)` (84)
- `mapSnapshotIndexThroughChange` (82)

**Calls:**
- `compose` (166)

### `addTouching`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:943` | Self: 0.0% (0us) | Total: 0.0% (2.2ms) | Samples: 0

**Called by:**
- `(anonymous)` (2)

**Calls:**
- `pathKey` (2)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:1860` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `setCurrentSelection` (1)

**Calls:**
- `getChildren` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:2862` | Self: 0.0% (0us) | Total: 1.1% (2.36s) | Samples: 0

**Called by:**
- `fit` (1858)

**Calls:**
- `getContentEndOffset` (1858)

### `visit`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:660` | Self: 0.0% (0us) | Total: 0.0% (3.7ms) | Samples: 0

**Called by:**
- `fitClosedSliceInterior` (3)

**Calls:**
- `push` (3)

### `validate`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6898` | Self: 0.0% (0us) | Total: 22.7% (48.30s) | Samples: 0

**Called by:**
- `applyCanonical` (37809)

**Calls:**
- `assertDocument` (37809)

### `mergeCommandRegistries`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:374` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `mergeRegistries` (1)

**Calls:**
- `performIteration` (1)

### `advancePathStableSnapshotIndex`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1813` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `inheritDocumentChangeStepNodeKeys` (1)

**Calls:**
- `freeze` (1)

### `get`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts:610` | Self: 0.0% (0us) | Total: 0.0% (130.5ms) | Samples: 0

**Called by:**
- `performProxyObjectGet` (101)

**Calls:**
- `get` (101)

### `notifyListeners`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7532` | Self: 0.0% (0us) | Total: 0.0% (136.3ms) | Samples: 0

**Called by:**
- `(anonymous)` (106)

**Calls:**
- `(anonymous)` (105)
- `(anonymous)` (1)

### `validateDeclarativeDocument`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3044` | Self: 0.0% (0us) | Total: 0.0% (2.4ms) | Samples: 0

**Called by:**
- `(anonymous)` (2)

**Calls:**
- `getElementOwnedRootKeys` (1)
- `freeze` (1)

### `replaceCanonicalChildWindow`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:838` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `hasInlineContent` (1)

### `mapTextOffset`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts:132` | Self: 0.0% (0us) | Total: 0.0% (42.4ms) | Samples: 0

**Called by:**
- `memoize` (34)

**Calls:**
- `between` (10)
- `between` (7)
- `createInternalDocumentChange` (6)
- `between` (5)
- `between` (4)
- `createInternalDocumentChange` (1)
- `between` (1)

### `get`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts:1034` | Self: 0.0% (0us) | Total: 0.0% (47.9ms) | Samples: 0

**Called by:**
- `commit` (37)

**Calls:**
- `createInternalDocumentChange` (34)
- `invert` (3)

### `create`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1416` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `between` (1)

**Calls:**
- `isInteger` (1)

### `getDocumentOwnershipIndexes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:723` | Self: 0.0% (0us) | Total: 1.7% (3.76s) | Samples: 0

**Called by:**
- `validateDeclarativeDocument` (2942)

**Calls:**
- `map` (2942)

### `indexedAfter`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:202` | Self: 0.0% (0us) | Total: 0.0% (2.5ms) | Samples: 0

**Called by:**
- `reconcileExclusiveElementOwnedRoots` (2)

**Calls:**
- `performProxyObjectGet` (2)

### `runEditorTransaction`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7987` | Self: 0.0% (0us) | Total: 0.0% (23.6ms) | Samples: 0

**Called by:**
- `withUpdateTagContext` (19)

**Calls:**
- `withExtensionPublicationRollback` (19)

### `buildConfiguredRegistry`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:1924` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `getRegisteredExtension` (1)

### `internal:streams/compose`
`internal:streams/compose:2` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `anonymous` (1)

**Calls:**
- `anonymous` (1)

### `getCompiled`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts:3309` | Self: 0.0% (0us) | Total: 0.0% (3.4ms) | Samples: 0

**Called by:**
- `fitDocument` (3)

**Calls:**
- `compileSliceFitter` (3)

### `mapChangedNodeKeys`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1196` | Self: 0.0% (0us) | Total: 0.0% (47.3ms) | Samples: 0

**Called by:**
- `mapSnapshotIndexThroughChange` (38)

**Calls:**
- `isPreparedTargetPath` (37)
- `some` (1)

### `collect`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:90` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `claimSource` (1)

**Calls:**
- `every` (1)

### `validateCompleteExtensionGraph`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts:1837` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `buildConfiguredRegistry` (1)

**Calls:**
- `visit` (1)

### `getSelectionRanges`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:628` | Self: 0.0% (0us) | Total: 0.0% (10.1ms) | Samples: 0

**Called by:**
- `assertSelectionSupported` (8)

**Calls:**
- `projectSelectionRange` (4)
- `projectSelectionRange` (4)

### `getEditorJsonArrayItems`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts:49` | Self: 0.0% (0us) | Total: 1.2% (2.56s) | Samples: 0

**Called by:**
- `isEditorJsonValue` (1950)
- `snapshotSliceContent` (59)

**Calls:**
- `isArrayPrototype` (1033)
- `isArrayPrototype` (975)
- `isObjectPrototype` (1)

### `compileRemoteChanges`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:130` | Self: 0.0% (0us) | Total: 0.4% (918.9ms) | Samples: 0

**Called by:**
- `measureCohort` (726)

**Calls:**
- `map` (726)

### `measureCohort`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:424` | Self: 0.0% (0us) | Total: 7.7% (16.51s) | Samples: 0

**Called by:**
- `(anonymous)` (13010)

**Calls:**
- `measureConnectDisconnectHeap` (4879)
- `measureConnectDisconnectHeap` (4711)
- `measureConnectDisconnectHeap` (2943)
- `measureConnectDisconnectHeap` (453)
- `measureConnectDisconnectHeap` (22)
- `measureConnectDisconnectHeap` (1)
- `measureConnectDisconnectHeap` (1)

### `insertText`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/transforms-text/insert-text.ts:184` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `applyInsertText` (1)

**Calls:**
- `above` (1)

### `get tokens`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:500` | Self: 0.0% (0us) | Total: 0.0% (2.8ms) | Samples: 0

**Called by:**
- `slice` (2)

**Calls:**
- `encodeNodes` (1)
- `encodeNodes` (1)

### `rememberValidatedDocumentRoots`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3140` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `adoptDocumentBaseline` (1)

**Calls:**
- `fromValue` (1)

### `applyInsertText`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/transforms-text/insert-text.ts:408` | Self: 0.0% (0us) | Total: 0.0% (32.6ms) | Samples: 0

**Called by:**
- `(anonymous)` (26)

**Calls:**
- `insertText` (18)
- `insertText` (6)
- `insertText` (1)
- `insertText` (1)

### `prepare`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:278` | Self: 0.0% (0us) | Total: 0.0% (1.0ms) | Samples: 0

**Called by:**
- `prepareFittedDocument` (1)

**Calls:**
- `set` (1)

### `adoptDocumentBaseline`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3714` | Self: 0.0% (0us) | Total: 2.1% (4.52s) | Samples: 0

**Called by:**
- `adoptCanonicalBaseline` (3554)

**Calls:**
- `rememberValidatedDocumentRoots` (2780)
- `rememberValidatedDocumentRoots` (770)
- `rememberValidatedDocumentRoots` (2)
- `rememberValidatedDocumentRoots` (1)
- `rememberValidatedDocumentRoots` (1)

### `isDeepFrozenNode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3121` | Self: 0.0% (0us) | Total: 0.0% (154.6ms) | Samples: 0

**Called by:**
- `every` (120)

**Calls:**
- `isText` (120)

### `compose`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1084` | Self: 0.0% (0us) | Total: 0.0% (1.2ms) | Samples: 0

**Called by:**
- `apply` (1)

**Calls:**
- `map` (1)

### `applyDocumentChangeValue`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:1289` | Self: 0.0% (0us) | Total: 0.0% (2.7ms) | Samples: 0

**Called by:**
- `applyDocumentChangeWithIndexes` (1)

**Calls:**
- `cloneObject` (1)

### `normalizeSelectionRoot`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-state.ts:62` | Self: 0.0% (0us) | Total: 0.0% (2.2ms) | Samples: 0

**Called by:**
- `setSelectionStateSelection` (2)

**Calls:**
- `normalizePointRoot` (2)

### `mapPathForward`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:610` | Self: 0.0% (0us) | Total: 0.0% (2.5ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)
- `retainAddition` (1)

**Calls:**
- `mapRelocatedPath` (1)
- `mapRelocatedPath` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6753` | Self: 0.0% (0us) | Total: 0.0% (3.7ms) | Samples: 0

**Called by:**
- `find` (3)

**Calls:**
- `every` (3)

### `createInternalDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:569` | Self: 0.0% (0us) | Total: 0.0% (5.2ms) | Samples: 0

**Called by:**
- `applyTrustedCanonical` (3)
- `mapTextOffset` (1)

**Calls:**
- `Map` (4)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:217` | Self: 0.0% (0us) | Total: 0.0% (15.0ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (12)

**Calls:**
- `withEditorUpdateRoot` (12)

### `classifyDocumentRange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:42` | Self: 0.0% (0us) | Total: 0.0% (7.5ms) | Samples: 0

**Called by:**
- `classifyRootChangeWithRuntimeCandidates` (6)

**Calls:**
- `filter` (6)

### `applyTransactionSpec`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5767` | Self: 0.0% (0us) | Total: 1.2% (2.70s) | Samples: 0

**Called by:**
- `(anonymous)` (2097)

**Calls:**
- `applyTransactionSpecContents` (2095)
- `applyTransactionSpecContents` (1)
- `applyTransactionSpecContents` (1)

### `encode`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:918` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `forEach` (1)

**Calls:**
- `isTextNode` (1)

### `snapshotSliceContent`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts:83` | Self: 0.0% (0us) | Total: 0.4% (946.4ms) | Samples: 0

**Called by:**
- `snapshotContentSlice` (564)
- `(anonymous)` (170)

**Calls:**
- `map` (734)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:869` | Self: 0.0% (0us) | Total: 0.0% (1.0ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `cloneObject` (1)

### `initializeBaseExtensionRegistry`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:674` | Self: 0.0% (0us) | Total: 0.0% (2.5ms) | Samples: 0

**Called by:**
- `createEditorImplementation` (2)

**Calls:**
- `mergeRegistries` (1)
- `mergeRegistries` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:73` | Self: 0.0% (0us) | Total: 0.0% (49.8ms) | Samples: 0

**Called by:**
- `flatIntoArrayWithCallback` (40)

**Calls:**
- `node` (34)
- `nodeAtPath` (5)
- `nodeAtPath` (1)

### `assertCanonical`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6863` | Self: 0.0% (0us) | Total: 0.0% (210.0ms) | Samples: 0

**Called by:**
- `applyCanonical` (163)

**Calls:**
- `constructCanonicalDocumentChange` (101)
- `constructCanonicalDocumentChange` (25)
- `createInternalDocumentChange` (7)
- `constructCanonicalDocumentChange` (5)
- `constructCanonicalDocumentChange` (4)
- `constructCanonicalDocumentChange` (4)
- `constructCanonicalDocumentChange` (3)
- `constructCanonicalDocumentChange` (2)
- `constructCanonicalDocumentChange` (2)
- `constructCanonicalDocumentChange` (2)
- `constructCanonicalDocumentChange` (1)
- `constructCanonicalDocumentChange` (1)
- `createInternalDocumentChange` (1)
- `constructCanonicalDocumentChange` (1)
- `constructCanonicalDocumentChange` (1)
- `constructCanonicalDocumentChange` (1)
- `constructCanonicalDocumentChange` (1)
- `constructCanonicalDocumentChange` (1)

### `mapPathForward`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:604` | Self: 0.0% (0us) | Total: 0.0% (2.7ms) | Samples: 0

**Called by:**
- `mapChangedNodeKeys` (1)
- `retainAddition` (1)

**Calls:**
- `nodeRange` (2)

### `RootChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:1383` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `compose` (1)

**Calls:**
- `reduce` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:254` | Self: 0.0% (0us) | Total: 19.3% (41.09s) | Samples: 0

**Called by:**
- `measure` (32144)

**Calls:**
- `runRemoteChangesSeparately` (29229)
- `runRemoteChangesSeparately` (2900)
- `stringify` (9)
- `runRemoteChangesSeparately` (6)

### `freezeRootClassification`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts:303` | Self: 0.0% (0us) | Total: 0.1% (404.8ms) | Samples: 0

**Called by:**
- `DocumentChange` (315)

**Calls:**
- `map` (315)

### `constructCanonicalDocumentChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:1040` | Self: 0.0% (0us) | Total: 0.0% (2.7ms) | Samples: 0

**Called by:**
- `assertCanonical` (2)

**Calls:**
- `Set` (2)

### `resolveMappedPoint`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts:400` | Self: 0.0% (0us) | Total: 0.0% (8.5ms) | Samples: 0

**Called by:**
- `map` (7)

**Calls:**
- `mapPos` (3)
- `mapPos` (3)
- `mapPosition` (1)

### `measureAnchors`
`/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs:267` | Self: 0.0% (0us) | Total: 1.6% (3.43s) | Samples: 0

**Called by:**
- `measureCohort` (2705)

**Calls:**
- `createEditorWithDocument` (2703)
- `createEditorWithDocument` (2)

### `mergeRegistries`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts:513` | Self: 0.0% (0us) | Total: 0.0% (2.5ms) | Samples: 0

**Called by:**
- `initializeBaseExtensionRegistry` (1)
- `createExtensionRegistryStore` (1)

**Calls:**
- `mergeCommandRegistries` (1)
- `mergeCommandRegistries` (1)

### `getCurrentRootSnapshot`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6699` | Self: 0.0% (0us) | Total: 0.0% (15.2ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (12)

**Calls:**
- `deepFreeze` (10)
- `getRootScopedSelection` (2)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts:756` | Self: 0.0% (0us) | Total: 0.0% (5.3ms) | Samples: 0

**Called by:**
- `(anonymous)` (4)

**Calls:**
- `freezeIndex` (3)
- `freeze` (1)

### `publishInitialEditorExtensions`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts:211` | Self: 0.0% (0us) | Total: 0.0% (2.3ms) | Samples: 0

**Called by:**
- `createEditorImplementation` (2)

**Calls:**
- `prepareScopedEditorExtensionPublication` (1)
- `prepareRecordPublication` (1)

### `applyIndexed`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2214` | Self: 0.0% (0us) | Total: 0.0% (2.5ms) | Samples: 0

**Called by:**
- `applyInternal` (2)

**Calls:**
- `map` (2)

### `runTrustedUpdate`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5886` | Self: 0.0% (0us) | Total: 0.4% (867.6ms) | Samples: 0

**Called by:**
- `extendEditor` (473)
- `cleanup` (209)

**Calls:**
- `runEditorTransaction` (360)
- `runEditorTransaction` (308)
- `runEditorTransaction` (8)
- `runEditorTransaction` (2)
- `runEditorTransaction` (1)
- `runEditorTransaction` (1)
- `runEditorTransaction` (1)
- `runEditorTransaction` (1)

### `withNodeUpdates`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:751` | Self: 0.0% (0us) | Total: 0.0% (24.5ms) | Samples: 0

**Called by:**
- `applyInternal` (19)

**Calls:**
- `updateIndexedNodes` (16)
- `updateIndexedNodes` (1)
- `updateIndexedNodes` (1)
- `updateIndexedNodes` (1)

### `mapSnapshotIndexThroughChange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts:1449` | Self: 0.0% (0us) | Total: 0.1% (264.1ms) | Samples: 0

**Called by:**
- `inheritDocumentChangeStepNodeKeys` (208)

**Calls:**
- `collectChangedElementPaths` (207)
- `collectChangedElementPaths` (1)

### `applyIndexed`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts:2255` | Self: 0.0% (0us) | Total: 4.1% (8.87s) | Samples: 0

**Called by:**
- `applyInternal` (6977)

**Calls:**
- `(anonymous)` (6977)

### `shouldIgnoreTarget`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/editor/insert-text.ts:41` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `above` (1)

### `createRootFitPathProvenance`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/provenance.ts:81` | Self: 0.0% (0us) | Total: 0.0% (70.6ms) | Samples: 0

**Called by:**
- `fit` (56)

**Calls:**
- `visitDescendantPaths` (56)

### `runEditorTransaction`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7933` | Self: 0.0% (0us) | Total: 0.1% (389.8ms) | Samples: 0

**Called by:**
- `runTrustedUpdate` (308)

**Calls:**
- `validateDocument` (301)
- `createEditorDocumentValue` (7)

### `getUpdateView`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:5067` | Self: 0.0% (0us) | Total: 0.0% (1.5ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)

**Calls:**
- `defineSemanticUpdateMethod` (1)

### `insertText`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:913` | Self: 0.0% (0us) | Total: 0.0% (2.2ms) | Samples: 0

**Called by:**
- `(anonymous)` (1)
- `applyBuiltDocumentChange` (1)

**Calls:**
- `create` (1)
- `create` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:359` | Self: 0.0% (0us) | Total: 0.0% (1.0ms) | Samples: 0

**Called by:**
- `replaceIndexedChildren` (1)

**Calls:**
- `(anonymous)` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8411` | Self: 0.0% (0us) | Total: 0.0% (1.3ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (1)

**Calls:**
- `stripLocationRoots` (1)

### `setCurrentSelection`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:6310` | Self: 0.0% (0us) | Total: 0.1% (235.4ms) | Samples: 0

**Called by:**
- `applyTransactionSpecDocumentChangeStep` (186)

**Calls:**
- `assertSelectionSupported` (154)
- `assertSelectionSupported` (12)
- `assertSelectionSupported` (9)
- `assertSelectionSupported` (4)
- `assertSelectionSupported` (3)
- `assertSelectionSupported` (2)
- `assertSelectionSupported` (1)
- `assertSelectionSupported` (1)

### `apply`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:8161` | Self: 0.0% (0us) | Total: 49.7% (105.43s) | Samples: 0

**Called by:**
- `fit` (82760)

**Calls:**
- `applyDocumentChangeStep` (82760)

### `above`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/editor/above.ts:41` | Self: 0.0% (0us) | Total: 0.0% (2.7ms) | Samples: 0

**Called by:**
- `shouldIgnoreTarget` (1)
- `(anonymous)` (1)

**Calls:**
- `path` (1)
- `path` (1)

### `mapSelectionWithContext`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts:845` | Self: 0.0% (0us) | Total: 0.0% (9.0ms) | Samples: 0

**Called by:**
- `mapSelectionThroughChange` (6)
- `fit` (1)

**Calls:**
- `isText` (5)
- `isText` (2)

### `addOwnPath`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:3480` | Self: 0.0% (0us) | Total: 0.0% (15.4ms) | Samples: 0

**Called by:**
- `(anonymous)` (12)

**Calls:**
- `at` (12)

### `applyTrustedCanonical`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts:692` | Self: 0.0% (0us) | Total: 0.0% (10.4ms) | Samples: 0

**Called by:**
- `applyDocumentChange` (7)

**Calls:**
- `applyDocumentChangeWithIndexes` (7)

### `createEditorImplementation`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts:614` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `createEditorWithDocument` (1)

**Calls:**
- `createEditorUpdateApi` (1)

### `createEditorUpdateDraftContext`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:7641` | Self: 0.0% (0us) | Total: 0.0% (1.4ms) | Samples: 0

**Called by:**
- `runEditorTransaction` (1)

**Calls:**
- `getSnapshot` (1)

### `internal:streams/pipeline`
`internal:streams/pipeline:2` | Self: 0.0% (0us) | Total: 0.0% (1.1ms) | Samples: 0

**Called by:**
- `anonymous` (1)

**Calls:**
- `anonymous` (1)

### `replaceCanonicalChildWindow`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts:888` | Self: 0.0% (0us) | Total: 0.0% (6.4ms) | Samples: 0

**Called by:**
- `(anonymous)` (5)

**Calls:**
- `canonicalizeInlineChildren` (2)
- `canonicalizeInlineChildren` (1)
- `canonicalizeInlineChildren` (1)
- `canonicalizeInlineChildren` (1)

### `getCurrentRuntimeIndex`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:1699` | Self: 0.0% (0us) | Total: 0.0% (1.0ms) | Samples: 0

**Called by:**
- `getNodeKey` (1)

**Calls:**
- `getSnapshot` (1)

### `(anonymous)`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:2620` | Self: 0.0% (0us) | Total: 0.0% (7.3ms) | Samples: 0

**Called by:**
- `forEach` (6)

**Calls:**
- `isText` (6)

### `withUpdateTagContext`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts:1725` | Self: 0.0% (0us) | Total: 79.1% (167.89s) | Samples: 0

**Called by:**
- `update` (131674)

**Calls:**
- `runEditorTransaction` (129909)
- `runEditorTransaction` (708)
- `runEditorTransaction` (692)
- `runEditorTransaction` (124)
- `runEditorTransaction` (62)
- `runEditorTransaction` (59)
- `runEditorTransaction` (31)
- `runEditorTransaction` (19)
- `runEditorTransaction` (13)
- `runEditorTransaction` (8)
- `runEditorTransaction` (7)
- `runEditorTransaction` (4)
- `runEditorTransaction` (4)
- `runEditorTransaction` (4)
- `runEditorTransaction` (3)
- `runEditorTransaction` (3)
- `runEditorTransaction` (3)
- `runEditorTransaction` (3)
- `runEditorTransaction` (3)
- `runEditorTransaction` (2)
- `runEditorTransaction` (2)
- `runEditorTransaction` (2)
- `runEditorTransaction` (2)
- `runEditorTransaction` (2)
- `runEditorTransaction` (1)
- `runEditorTransaction` (1)
- `runEditorTransaction` (1)
- `runEditorTransaction` (1)
- `runEditorTransaction` (1)

### `concat`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts:696` | Self: 0.0% (0us) | Total: 0.1% (234.6ms) | Samples: 0

**Called by:**
- `addSection` (150)
- `applyIndexed` (37)

**Calls:**
- `PreparedTokenSlice` (87)
- `PreparedTokenSlice` (80)
- `PreparedTokenSlice` (10)
- `PreparedTokenSlice` (6)
- `PreparedTokenSlice` (4)

### `decodeNodes`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts:246` | Self: 0.0% (0us) | Total: 0.0% (144.4ms) | Samples: 0

**Called by:**
- `(anonymous)` (109)
- `(anonymous)` (3)

**Calls:**
- `freeze` (112)

### `getValidationNodeType`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts:363` | Self: 0.0% (0us) | Total: 0.0% (5.2ms) | Samples: 0

**Called by:**
- `validateDeclarativeNodeProperties` (4)

**Calls:**
- `isText` (4)

### `classifyDocumentRange`
`/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts:62` | Self: 0.0% (0us) | Total: 0.0% (25.0ms) | Samples: 0

**Called by:**
- `classifyRootChangeWithRuntimeCandidates` (18)
- `classifyRootChangeWithRuntimeCandidates` (2)

**Calls:**
- `sort` (20)

## Files

| Self% | Self | File |
|------:|-----:|------|
| 43.2% | 91.81s | `[native code]` |
| 21.9% | 46.56s | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-index.ts` |
| 19.6% | 41.62s | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/snapshot-index.ts` |
| 5.8% | 12.31s | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/value-codec.ts` |
| 3.6% | 7.80s | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/schema-compiler.ts` |
| 2.8% | 6.06s | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-schema.ts` |
| 1.0% | 2.27s | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/tokens.ts` |
| 0.3% | 814.5ms | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/compiled-slice-fitter.ts` |
| 0.1% | 404.7ms | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/element-owned-root-index.ts` |
| 0.1% | 318.7ms | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/resolved-token-cursor.ts` |
| 0.1% | 315.7ms | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/mapping.ts` |
| 0.1% | 284.6ms | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/classification.ts` |
| 0.1% | 238.1ms | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/representation.ts` |
| 0.0% | 190.6ms | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/text.ts` |
| 0.0% | 160.8ms | `/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/node-keys.ts` |
| 0.0% | 157.2ms | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/content-slice.ts` |
| 0.0% | 136.5ms | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/public-state.ts` |
| 0.0% | 129.7ms | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/document-change.ts` |
| 0.0% | 105.2ms | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/slice-fit/provenance.ts` |
| 0.0% | 80.1ms | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/root-change.ts` |
| 0.0% | 41.0ms | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/change/builder.ts` |
| 0.0% | 38.9ms | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/element.ts` |
| 0.0% | 36.9ms | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/extension-registry.ts` |
| 0.0% | 29.7ms | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/selection.ts` |
| 0.0% | 25.1ms | `/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/core/current/collab-readiness.mjs` |
| 0.0% | 23.1ms | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-protocol.ts` |
| 0.0% | 18.7ms | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/commit.ts` |
| 0.0% | 16.9ms | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-extension.ts` |
| 0.0% | 13.5ms | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/clone.ts` |
| 0.0% | 6.7ms | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor-state.ts` |
| 0.0% | 6.6ms | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-lifecycle-api.ts` |
| 0.0% | 6.6ms | `/Users/zbeyens/git/plate-2/packages/plitejs/src/create-editor.ts` |
| 0.0% | 5.3ms | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/semantic-update-method.ts` |
| 0.0% | 5.2ms | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/update-policy.ts` |
| 0.0% | 4.1ms | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/anchor.ts` |
| 0.0% | 3.9ms | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/editor-read-runtime.ts` |
| 0.0% | 3.5ms | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/editor.ts` |
| 0.0% | 3.5ms | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/selection-state.ts` |
| 0.0% | 3.4ms | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/range.ts` |
| 0.0% | 2.7ms | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/location.ts` |
| 0.0% | 2.5ms | `/Users/zbeyens/git/plate-2/packages/plitejs/src/interfaces/point.ts` |
| 0.0% | 2.5ms | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/update-context.ts` |
| 0.0% | 1.4ms | `/Users/zbeyens/git/plate-2/packages/plitejs/src/history/history-extension.ts` |
| 0.0% | 1.3ms | `node:assert` |
| 0.0% | 1.2ms | `node:fs/promises` |
| 0.0% | 1.2ms | `internal:fs/streams` |
| 0.0% | 1.2ms | `/Users/zbeyens/git/plate-2/packages/plitejs/src/utils/is-object.ts` |
| 0.0% | 1.2ms | `internal:assert/utils` |
| 0.0% | 1.1ms | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/initial-value.ts` |
| 0.0% | 1.1ms | `/Users/zbeyens/git/plate-2/packages/plitejs/src/transforms-text/insert-text.ts` |
| 0.0% | 1.1ms | `/Users/zbeyens/git/plate-2/packages/plitejs/src/core/facet.ts` |
