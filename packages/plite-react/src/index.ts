// Components

// Utils
export type {
  PliteAnnotation,
  PliteAnnotationAnchor,
  PliteAnnotationProjectionData,
  PliteAnnotationRefreshOptions,
  PliteAnnotationSnapshot,
  PliteAnnotationStore,
  PliteAnnotationStoreMetrics,
  PliteAnnotationStoreOptions,
  PliteResolvedAnnotation,
} from './annotation-store';
export type {
  EditableDOMBeforeInputContext,
  EditableDOMBeforeInputHandler,
  EditableDOMStrategyCohort,
  EditableDOMStrategyDegradationMode,
  EditableDOMStrategyEffectiveType,
  EditableDOMStrategyMetrics,
  EditableDOMStrategyMetricsBase,
  EditableHandlerResult,
  EditableInputEventContext,
  EditableKeyDownContext,
  EditableKeyDownHandler,
} from './components/editable';
export { defaultScrollSelectionIntoView } from './components/editable';
export { EditableElement } from './components/editable-element';
export type {
  RenderLeafProps,
  RenderPlaceholderProps,
  RenderTextProps,
} from './components/editable-text';
export type {
  EditableDecorate,
  EditableDecoration,
  EditableDOMCoverageBoundaryMaterializePayload,
  EditableDOMCoverageBoundaryPlaceholderContext,
  EditableDOMCoverageBoundaryProps,
  EditableDOMCoverageBoundaryScope,
  EditableElementSlots,
  EditableProps,
  RenderElementProps,
  RenderVoidProps,
} from './components/editable-text-blocks';
export { Editable } from './components/editable-text-blocks';
export {
  Plite,
  type PliteCommitContext,
  type PliteProps,
  type PliteSelectionChangeContext,
  type PliteValueChangeContext,
} from './components/plite';
export { PliteElement } from './components/plite-element';
export { PliteLeaf } from './components/plite-leaf';
export { PlitePlaceholder } from './components/plite-placeholder';
export { PliteText } from './components/plite-text';
export type {
  PliteDecoration,
  PliteDecorationSource,
  PliteDecorationSourceOptions,
  PliteDecorationSourceReadContext,
  PliteRangeDecoration,
  PliteRangeDecorationSourceOptions,
} from './decoration-source';
export type {
  DOMStrategyOptions,
  DOMStrategyType,
  DOMStrategyVirtualizedLayout,
  VirtualizedPageLayoutItem,
  VirtualizedTopLevelLayoutItem,
} from './dom-strategy/create-segment-plan';
export type { DOMTextSyncOptions } from './dom-text-sync';
export {
  type EditorDecorationSelectorContext,
  type EditorDecorationSelectorOptions,
  useDecorationSelector,
} from './hooks/use-decoration-selector';
export { useDOMStrategyVirtualOffset } from './hooks/use-dom-strategy-virtual-offset';
export { useEditor } from './hooks/use-editor';
export { useEditorComposing } from './hooks/use-editor-composing';
export {
  useEditorEditableElement,
  useEditorRootElement,
  useEditorScrollElement,
  useEditorScrollElementRef,
} from './hooks/use-editor-dom-scope';
export { useEditorFocused } from './hooks/use-editor-focused';
export {
  EditorReadOnlyProvider,
  type EditorReadOnlyProviderProps,
  useEditorReadOnly,
  useOptionalEditorReadOnly,
} from './hooks/use-editor-read-only';
export {
  type EditorRuntimeStateSelectorOptions,
  useEditorRuntimeState,
} from './hooks/use-editor-runtime-state';
export { useEditorSelection } from './hooks/use-editor-selection';
export {
  type EditorSelectorOptions,
  type EditorStateSelectorOptions,
  useEditorSelector,
  useEditorState,
} from './hooks/use-editor-selector';
export {
  type EditorViewStateSelectorOptions,
  useEditorViewState,
} from './hooks/use-editor-view-state';
// Hooks
export { useElement, useOptionalElement } from './hooks/use-element';
export { useElementPath } from './hooks/use-element-path';
export {
  type UseElementSelectedMode,
  type UseElementSelectedOptions,
  useElementSelected,
} from './hooks/use-element-selected';
export {
  type EditorNodeSelectorContext,
  type EditorRuntimeSelectorOptions,
  type EditorTextSelectorContext,
  useNodeSelector,
  useTextSelector,
} from './hooks/use-node-selector';
export {
  type UsePliteAnnotationStoreOptions,
  usePliteAnnotationStore,
} from './hooks/use-plite-annotation-store';
export {
  usePliteAnnotation,
  usePliteAnnotations,
} from './hooks/use-plite-annotations';
export { usePliteChildRoot } from './hooks/use-plite-child-root';
export {
  type PliteContentRootController,
  type UsePliteContentRootOptions,
  usePliteContentRoot,
} from './hooks/use-plite-content-root';
export {
  type UsePliteDecorationSourceOptions,
  type UsePliteRangeDecorationSourceOptions,
  usePliteDecorationSource,
  usePliteRangeDecorationSource,
} from './hooks/use-plite-decoration-source';
export {
  type UsePliteEditorOptions,
  usePliteEditor,
} from './hooks/use-plite-editor';
export {
  type PliteHistoryController,
  type PliteHistoryFocusPolicy,
  type UsePliteHistoryOptions,
  usePliteHistory,
} from './hooks/use-plite-history';
export { usePliteNodeRef } from './hooks/use-plite-node-ref';
export {
  type PliteProjectionEntry,
  type PliteProjectionStore,
  usePliteProjectionEntries,
} from './hooks/use-plite-projection-entries';
export {
  type PliteRootChromeController,
  type UsePliteRootChromeOptions,
  usePliteRootChrome,
} from './hooks/use-plite-root-chrome';
export {
  type PliteCommandFocusPolicy,
  type PliteRootEditor,
  PliteRuntime,
  type PliteRuntimeProps,
  type PliteRuntimeStateSelectorOptions,
  type PliteRuntimeValue,
  type PliteCommandDispatcher,
  type UsePliteCommandOptions,
  type UsePliteRootEditorOptions,
  type UsePliteRootEffectOptions,
  type UsePliteRuntimeOptions,
  usePliteActiveEditor,
  usePliteActiveRoot,
  usePliteCommand,
  usePliteRootEditor,
  usePliteRootEffect,
  usePliteRootState,
  usePliteRuntime,
  usePliteRuntimeState,
} from './hooks/use-plite-runtime';
export {
  type UsePliteWidgetStoreOptions,
  usePliteWidgetStore,
} from './hooks/use-plite-widget-store';
export { usePliteWidget, usePliteWidgets } from './hooks/use-plite-widgets';
export {
  type StateFieldSetter,
  type UseStateFieldValueOptions,
  useSetStateField,
  useStateFieldValue,
} from './hooks/use-state-field';
// Plugin
export {
  type CreateReactEditorOptions,
  createReactEditor,
  type ReactApi,
  type ReactEditor,
  type ReactEditorOptions,
  react,
} from './plugin/with-react';
export type {
  PliteCustomSourceDirtiness,
  PliteProjection,
  PliteProjectionRefreshListener,
  PliteProjectionRefreshResult,
  PliteProjectionRuntimeScope,
  PliteProjectionSlice,
  PliteProjectionSource,
  PliteProjectionStoreMetrics,
  PliteProjectionStoreOptions,
  PliteProjectionStoreRefreshOptions,
  PliteRangeProjection,
  PliteSourceDirtiness,
  PliteSourceDirtinessClass,
  PliteSourceDirtinessContext,
} from './projection-store';
export { PliteReactUpdatePolicy } from './update-policy';
export type {
  PliteResolvedWidget,
  PliteWidget,
  PliteWidgetAnchor,
  PliteWidgetSnapshot,
  PliteWidgetStore,
  PliteWidgetStoreMetrics,
  PliteWidgetStoreOptions,
} from './widget-store';
export type {
  PliteViewSourceError,
  PliteViewSourceErrorSink,
  PliteViewSourceOptions,
  PliteViewSourcePhase,
  PliteViewSourceStatus,
} from './view-source';
