export * from '..';

// Components

// Utils
export type {
  PliteAnnotation,
  PliteAnnotationAnchor,
  PliteAnnotationChange,
  PliteAnnotationRefreshOptions,
  PliteAnnotationSnapshot,
  PliteAnnotationStore,
  PliteAnnotationStoreMetrics,
  PliteAnnotationStoreOptions,
  PliteResolvedAnnotation,
} from '../annotations';
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
export type {
  RenderLeafProps,
  RenderPlaceholderProps,
  RenderTextProps,
} from './components/editable-text';
export type {
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
export type {
  ExternalTextActions,
  ExternalTextAdapter,
  ExternalTextChange,
  ExternalTextDecoration,
  ExternalTextDispatchResult,
  ExternalTextOptions,
  ExternalTextSelection,
  ExternalTextSelectionState,
  ExternalTextState,
  ExternalTextView,
} from './external-text';
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
  PliteDecorationAttributes,
  PliteDecoration,
  PliteDecorationRefresh,
  PliteDecorationSource,
} from './decoration-source';
export type {
  DOMStrategyOptions,
  DOMStrategyType,
  DOMStrategyVirtualizedLayout,
  VirtualizedPageLayoutItem,
  VirtualizedTopLevelLayoutItem,
} from './dom-strategy/create-segment-plan';
export { useDOMStrategyVirtualOffset } from './hooks/use-dom-strategy-virtual-offset';
export {
  useEditorContext,
  useOptionalEditorContext,
} from './hooks/use-editor-context';
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
  PliteAnnotationProvider,
  usePliteAnnotation,
  usePliteAnnotations,
} from './hooks/use-plite-annotations';
export { usePliteChildRoot } from './hooks/use-plite-child-root';
export {
  type PliteContentRootController,
  type UsePliteContentRootOptions,
  usePliteContentRoot,
} from './hooks/use-plite-content-root';
export { type UseEditorOptions, useEditor } from './hooks/use-editor';
export { useClaimEditableDOMCommit } from './hooks/use-claim-editable-dom-commit';
export {
  type DOMTextSyncRendererCapabilityContext,
  setDOMTextSyncRendererCapability,
} from './dom-text-sync';
export {
  type PliteHistoryController,
  type PliteHistoryFocusPolicy,
  type UsePliteHistoryOptions,
  usePliteHistory,
} from './hooks/use-plite-history';
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
export {
  type UsePliteWidgetGeometryOptions,
  usePliteWidgetGeometry,
} from './hooks/use-plite-widget-geometry';
export {
  usePliteWidget,
  usePliteWidgetIds,
  usePliteWidgets,
} from './hooks/use-plite-widgets';
export {
  type UseSelectionGeometryOptions,
  useSelectionGeometry,
} from './hooks/use-selection-geometry';
export {
  type StateFieldSetter,
  type UseStateFieldValueOptions,
  useSetStateField,
  useStateFieldValue,
} from './hooks/use-state-field';
// Plugin
export {
  type CreateEditorOptions,
  createEditor,
  type Editor,
  type ReactApi,
  type ReactExtensionOptions,
  type ReactExtension,
  react,
} from './plugin/with-react';
export { PliteReactUpdatePolicy } from './update-policy';
export type {
  PliteResolvedWidget,
  PliteWidget,
  PliteWidgetSnapshot,
  PliteWidgetStore,
  PliteWidgetStoreMetrics,
  PliteWidgetStoreOptions,
  PliteWidgetTarget,
} from './widget-store';
export type { PliteViewportRect, PliteWidgetGeometry } from './widget-geometry';
export type {
  PliteViewSourceError,
  PliteViewSourceErrorSink,
  PliteViewSourceOptions,
  PliteViewSourcePhase,
  PliteViewSourceStatus,
} from '../internal/view/view-source';
