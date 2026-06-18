// Components

// Utils
export type {
  SlateAnnotation,
  SlateAnnotationAnchor,
  SlateAnnotationProjectionData,
  SlateAnnotationRefreshOptions,
  SlateAnnotationSnapshot,
  SlateAnnotationStore,
  SlateAnnotationStoreMetrics,
  SlateResolvedAnnotation,
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
  EditableDOMStrategyLayout,
  EditableElementSlots,
  EditableProps,
  RenderElementProps,
  RenderVoidProps,
} from './components/editable-text-blocks';
export { Editable } from './components/editable-text-blocks';
export { Slate, type SlateChange, type SlateProps } from './components/slate';
export { SlateElement } from './components/slate-element';
export { SlateLeaf } from './components/slate-leaf';
export { SlatePlaceholder } from './components/slate-placeholder';
export { SlateText } from './components/slate-text';
export type {
  SlateDecoration,
  SlateDecorationSource,
  SlateDecorationSourceOptions,
  SlateDecorationSourceReadContext,
  SlateRangeDecoration,
  SlateRangeDecorationSourceOptions,
} from './decoration-source';
export type {
  DOMStrategyOptions,
  DOMStrategyType,
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
export { useEditorFocused } from './hooks/use-editor-focused';
export { useEditorReadOnly } from './hooks/use-editor-read-only';
export { useEditorSelection } from './hooks/use-editor-selection';
export {
  type EditorSelectorOptions,
  type EditorStateSelectorOptions,
  useEditorSelector,
  useEditorState,
} from './hooks/use-editor-selector';
// Hooks
export { useElement } from './hooks/use-element';
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
  type SlateAnnotationStoreProjector,
  useSlateAnnotationStore,
} from './hooks/use-slate-annotation-store';
export {
  useSlateAnnotation,
  useSlateAnnotations,
} from './hooks/use-slate-annotations';
export { useSlateChildRoot } from './hooks/use-slate-child-root';
export {
  type SlateContentRootController,
  type UseSlateContentRootOptions,
  useSlateContentRoot,
} from './hooks/use-slate-content-root';
export {
  type UseSlateDecorationSourceOptions,
  type UseSlateRangeDecorationSourceOptions,
  useSlateDecorationSource,
  useSlateRangeDecorationSource,
} from './hooks/use-slate-decoration-source';
export {
  type UseSlateEditorOptions,
  useSlateEditor,
} from './hooks/use-slate-editor';
export {
  type SlateHistoryController,
  type SlateHistoryFocusPolicy,
  type UseSlateHistoryOptions,
  useSlateHistory,
} from './hooks/use-slate-history';
export { useSlateNodeRef } from './hooks/use-slate-node-ref';
export {
  type SlateProjectionEntry,
  type SlateProjectionStore,
  useSlateProjectionEntries,
} from './hooks/use-slate-projection-entries';
export {
  type SlateRootChromeController,
  type UseSlateRootChromeOptions,
  useSlateRootChrome,
} from './hooks/use-slate-root-chrome';
export {
  type SlateCommandFocusPolicy,
  type SlateRootEditor,
  SlateRuntime,
  type SlateRuntimeProps,
  type SlateRuntimeStateSelectorOptions,
  type SlateRuntimeValue,
  type UseSlateCommandCallbackOptions,
  type UseSlateRootEditorOptions,
  type UseSlateRootEffectOptions,
  type UseSlateRuntimeOptions,
  useSlateActiveEditor,
  useSlateActiveRoot,
  useSlateCommandCallback,
  useSlateRootEditor,
  useSlateRootEffect,
  useSlateRootState,
  useSlateRuntime,
  useSlateRuntimeState,
} from './hooks/use-slate-runtime';
export {
  type SlateWidgetStoreProjector,
  useSlateWidgetStore,
} from './hooks/use-slate-widget-store';
export { useSlateWidget, useSlateWidgets } from './hooks/use-slate-widgets';
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
  SlateCustomSourceDirtiness,
  SlateProjection,
  SlateProjectionRefreshListener,
  SlateProjectionRefreshResult,
  SlateProjectionRuntimeScope,
  SlateProjectionSlice,
  SlateProjectionSource,
  SlateProjectionStoreMetrics,
  SlateProjectionStoreOptions,
  SlateProjectionStoreRefreshOptions,
  SlateRangeProjection,
  SlateSourceDirtiness,
  SlateSourceDirtinessClass,
  SlateSourceDirtinessContext,
} from './projection-store';
export type {
  SlateResolvedWidget,
  SlateWidget,
  SlateWidgetAnchor,
  SlateWidgetSnapshot,
  SlateWidgetStore,
  SlateWidgetStoreMetrics,
} from './widget-store';
