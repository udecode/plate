# Core Legacy Import Groups

Historical snapshot. Use `core-remaining-legacy-boundaries.md` plus the current
scanner ledgers for authoritative current state.

| Class | Count |
|---|---:|
| editor-contract | 28 |
| legacy-runtime-api | 22 |
| current-v2 | 1 |
| runtime-bootstrap | 14 |
| type-only | 6 |

| File | Class | Imports |
|---|---|---|
| `packages/core/src/internal/plugin/resolvePlugins.ts` | runtime-bootstrap | value:assignLegacyApi, value:assignLegacyTransforms, value:syncLegacyMethods |
| `packages/core/src/lib/editor/SlateEditor.ts` | editor-contract | type:EditorApi, type:EditorBase, type:EditorTransforms, type:TRange, type:Value |
| `packages/core/src/lib/editor/withSlate.spec.ts` | runtime-bootstrap | type:Value, value:createEditor |
| `packages/core/src/lib/editor/withSlate.ts` | runtime-bootstrap | type:Editor, type:TSelection, type:Value, value:createEditor |
| `packages/core/src/lib/plugin/BasePlugin.ts` | editor-contract | type:EditorApi, type:EditorTransforms, type:TElement, type:TText |
| `packages/core/src/lib/plugin/SlatePlugin.ts` | editor-contract | type:DecoratedRange, type:Descendant, type:EditorApi, type:EditorTransforms, type:NodeEntry, type:NodeOperation, type:Path, type:TElement, type:TextOperation, type:TText, type:Value |
| `packages/core/src/lib/plugins/HistoryPlugin.ts` | runtime-bootstrap | value:withHistory |
| `packages/core/src/lib/plugins/ParserPlugin.spec.ts` | runtime-bootstrap | value:createEditor |
| `packages/core/src/lib/plugins/affinity/AffinityPlugin.ts` | legacy-runtime-api | type:Path, type:TText, value:ElementApi, value:NodeApi, value:TextApi |
| `packages/core/src/lib/plugins/affinity/queries/getEdgeNodes.ts` | legacy-runtime-api | type:TElement, type:TText, value:ElementApi, value:NodeApi, value:PathApi |
| `packages/core/src/lib/plugins/affinity/queries/getMarkBoundaryAffinity.ts` | legacy-runtime-api | type:TElement, type:TText, value:IS_FIREFOX, value:NodeApi |
| `packages/core/src/lib/plugins/affinity/queries/isNodeAffinity.ts` | legacy-runtime-api | type:TElement, type:TText, value:ElementApi, value:NodeApi |
| `packages/core/src/lib/plugins/affinity/transforms/setAffinitySelection.ts` | legacy-runtime-api | value:ElementApi, value:NodeApi |
| `packages/core/src/lib/plugins/affinity/types.ts` | type-only | type:TElement, type:TText |
| `packages/core/src/lib/plugins/chunking/ChunkingPlugin.ts` | legacy-runtime-api | type:Ancestor, value:NodeApi |
| `packages/core/src/lib/plugins/chunking/withChunking.ts` | type-only | type:Ancestor |
| `packages/core/src/lib/plugins/dom/DOMPlugin.ts` | editor-contract | type:Operation, type:ScrollIntoViewOptions, type:TRange |
| `packages/core/src/lib/plugins/dom/withScrolling.ts` | type-only | type:ScrollIntoViewOptions |
| `packages/core/src/lib/plugins/input-rules/types.ts` | editor-contract | type:InsertTextOptions, type:NodeEntry, type:Path, type:Point, type:TRange |
| `packages/core/src/lib/plugins/navigation-feedback/NavigationFeedbackPlugin.ts` | legacy-runtime-api | value:PathApi |
| `packages/core/src/lib/plugins/navigation-feedback/transforms/flashTarget.ts` | legacy-runtime-api | value:NodeApi |
| `packages/core/src/lib/plugins/navigation-feedback/types.ts` | editor-contract | type:Path, type:PathRef, type:Point, type:TRange |
| `packages/core/src/lib/plugins/node-id/NodeIdPlugin.ts` | editor-contract | type:Descendant, type:Value, value:ElementApi |
| `packages/core/src/lib/plugins/node-id/normalizeStaticValue.spec.ts` | editor-contract | type:Value |
| `packages/core/src/lib/plugins/node-id/normalizeStaticValue.ts` | editor-contract | type:Value |
| `packages/core/src/lib/plugins/node-id/withNodeId.ts` | legacy-runtime-api | type:Descendant, type:NodeEntry, type:NodeProps, type:TNode, value:NodeApi |
| `packages/core/src/lib/plugins/override/withBreakRules.ts` | legacy-runtime-api | value:PathApi |
| `packages/core/src/lib/plugins/override/withDeleteRules.ts` | legacy-runtime-api | value:PointApi, value:RangeApi |
| `packages/core/src/lib/plugins/override/withMergeRules.ts` | legacy-runtime-api | type:Path, type:TElement, value:ElementApi, value:PathApi, value:TextApi |
| `packages/core/src/lib/plugins/override/withNormalizeRules.ts` | legacy-runtime-api | value:ElementApi |
| `packages/core/src/lib/plugins/slate-extension/SlateExtensionPlugin.ts` | current-v2 | type:Descendant, type:Element, type:NodeOperation, type:Text, type:TextOperation, value:NodeApi, value:OperationApi, value:PathApi |
| `packages/core/src/lib/plugins/slate-extension/transforms/init.spec.ts` | editor-contract | type:TSelection |
| `packages/core/src/lib/plugins/slate-extension/transforms/init.ts` | editor-contract | type:EditorTransforms, type:TSelection, type:Value |
| `packages/core/src/lib/plugins/slate-extension/transforms/insertExitBreak.ts` | legacy-runtime-api | type:EditorAboveOptions, value:combineMatchOptions, value:PathApi |
| `packages/core/src/lib/plugins/slate-extension/transforms/liftBlock.ts` | legacy-runtime-api | type:EditorAboveOptions, value:combineMatchOptions |
| `packages/core/src/lib/plugins/slate-extension/transforms/resetBlock.ts` | legacy-runtime-api | type:Path, value:NodeApi |
| `packages/core/src/lib/plugins/slate-extension/transforms/setValue.ts` | editor-contract | type:Descendant, type:EditorTransforms, type:Value |
| `packages/core/src/lib/types/EditableProps.ts` | editor-contract | type:DOMRange, type:Editor, type:NodeEntry, type:TRange |
| `packages/core/src/lib/utils/applyDeepToNodes.ts` | legacy-runtime-api | type:NodeEntry, type:NodeOf, type:Path, type:TNode, value:NodeApi |
| `packages/core/src/lib/utils/defaultsDeepToNodes.ts` | type-only | type:TNode |
| `packages/core/src/lib/utils/getInjectMatch.ts` | legacy-runtime-api | type:Path, type:TNode, value:ElementApi |
| `packages/core/src/lib/utils/hotkeys.ts` | editor-contract | type:Editor |
| `packages/core/src/lib/utils/isType.spec.tsx` | runtime-bootstrap | value:createEditor |
| `packages/core/src/lib/utils/mergeDeepToNodes.spec.ts` | runtime-bootstrap | value:ElementApi, value:NodeApi, value:createEditor |
| `packages/core/src/lib/utils/mergeDeepToNodes.ts` | type-only | type:TNode |
| `packages/core/src/react/__tests__/createPlateTestEditor.ts` | editor-contract | type:Value |
| `packages/core/src/react/components/Plate.slow.tsx` | editor-contract | type:Value |
| `packages/core/src/react/editor/PlateEditor.ts` | editor-contract | type:DescendantIn, type:EditorApi, type:EditorTransforms, type:Operation, type:Value |
| `packages/core/src/react/editor/TPlateEditor.spec.ts` | runtime-bootstrap | type:Value, value:createEditor |
| `packages/core/src/react/editor/TPlateEditorCore.spec.ts` | editor-contract | type:Value |
| `packages/core/src/react/editor/usePlateEditor.ts` | editor-contract | type:Value |
| `packages/core/src/react/editor/usePlateViewEditor.ts` | editor-contract | type:Value |
| `packages/core/src/react/editor/withPlate.ts` | runtime-bootstrap | type:Editor, type:Value, value:createEditor |
| `packages/core/src/react/hooks/useNodePath.ts` | type-only | type:TNode |
| `packages/core/src/react/hooks/useSlateProps.spec.tsx` | editor-contract | type:TRange |
| `packages/core/src/react/hooks/useSlateProps.ts` | editor-contract | type:Value |
| `packages/core/src/react/plugin/PlatePlugin.ts` | editor-contract | type:DecoratedRange, type:Descendant, type:EditorApi, type:EditorTransforms, type:NodeEntry, type:NodeOperation, type:Path, type:TElement, type:TextOperation, type:TText, type:Value |
| `packages/core/src/react/plugins/navigation-feedback/useNavigationHighlight.ts` | legacy-runtime-api | type:Path, value:PathApi, type:TElement, type:TText |
| `packages/core/src/react/plugins/react/ReactPlugin.spec.ts` | runtime-bootstrap | type:LegacyEditorMethods |
| `packages/core/src/react/stores/element/useElementStore.tsx` | legacy-runtime-api | type:ElementEntry, type:Path, type:TElement, value:PathApi |
| `packages/core/src/react/stores/plate/PlateStore.ts` | editor-contract | type:Descendant, type:NodeEntry, type:NodeOperation, type:TextOperation, type:TRange, type:TSelection, type:ValueOf |
| `packages/core/src/react/stores/plate/createPlateStore.spec.tsx` | editor-contract | type:TRange |
| `packages/core/src/react/utils/createPlateFallbackEditor.ts` | runtime-bootstrap | type:LegacyEditorMethods |
| `packages/core/src/react/utils/pipeOnChange.spec.ts` | runtime-bootstrap | value:createEditor |
| `packages/core/src/react/utils/pipeOnChange.ts` | editor-contract | type:Value |
| `packages/core/src/react/utils/pipeRenderLeaf.tsx` | legacy-runtime-api | value:NodeApi |
| `packages/core/src/react/utils/pluginRenderLeaf.tsx` | legacy-runtime-api | value:NodeApi |
| `packages/core/src/static/components/PlateStatic.tsx` | editor-contract | type:DecoratedRange, type:Descendant, type:NodeEntry, type:Path, type:TElement, type:TText, type:Value, value:ElementApi, value:isElementDecorationsEqual, value:isTextDecorationsEqual, value:RangeApi, value:TextApi |
| `packages/core/src/static/editor/withStatic.spec.tsx` | runtime-bootstrap | type:Value, value:createEditor |
| `packages/core/src/static/editor/withStatic.tsx` | runtime-bootstrap | type:Editor, type:Value, value:createEditor |
| `packages/core/src/static/utils/pipeDecorate.ts` | editor-contract | type:NodeEntry, type:TRange |
