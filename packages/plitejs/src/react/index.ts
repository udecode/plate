export * from '..';

// Components

// Utils
export type {
  Annotation,
  AnnotationAnchor,
  AnnotationChange,
  AnnotationRefreshOptions,
  AnnotationSnapshot,
  AnnotationStore,
  AnnotationStoreMetrics,
  AnnotationStoreOptions,
  ResolvedAnnotation,
} from '../annotations';
export type {
  EditableDOMBeforeInputContext,
  EditableDOMBeforeInputHandler,
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
  EditorRoot,
  type CommitContext,
  type EditorRootProps,
  type SelectionChangeContext,
  type ValueChangeContext,
} from './components/plite';
export { EditorElement } from './components/plite-element';
export { EditorLeaf } from './components/plite-leaf';
export { EditorPlaceholder } from './components/plite-placeholder';
export { EditorText } from './components/plite-text';
export type {
  DecorationAttributes,
  Decoration,
  DecorationRefresh,
  DecorationSource,
} from './decoration-source';
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
  type UseAnnotationStoreOptions,
  useAnnotationStore,
} from './hooks/use-plite-annotation-store';
export {
  AnnotationProvider,
  useAnnotation,
  useAnnotations,
} from './hooks/use-plite-annotations';
export { useChildRoot } from './hooks/use-plite-child-root';
export {
  type ContentRootController,
  type UseContentRootOptions,
  useContentRoot,
} from './hooks/use-plite-content-root';
export { type UseEditorOptions, useEditor } from './hooks/use-editor';
export { useClaimEditableDOMCommit } from './hooks/use-claim-editable-dom-commit';
export {
  type DOMTextSyncRendererCapabilityContext,
  setDOMTextSyncRendererCapability,
} from './dom-text-sync';
export {
  type EditorHistoryController,
  type EditorHistoryFocusPolicy,
  type UseEditorHistoryOptions,
  useEditorHistory,
} from './hooks/use-plite-history';
export {
  type RootChromeController,
  type UseRootChromeOptions,
  useRootChrome,
} from './hooks/use-plite-root-chrome';
export {
  type CommandFocusPolicy,
  type RootEditor,
  type RuntimeStateSelectorOptions,
  type CommandDispatcher,
  type UseCommandOptions,
  type UseRootEditorOptions,
  type UseRootEffectOptions,
  useActiveEditor,
  useActiveRoot,
  useCommand,
  useRootEditor,
  useRootEffect,
  useRootState,
  useRuntimeState,
} from './hooks/use-plite-runtime';
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
  type ReactPluginOptions,
  type ReactPlugin,
  react,
} from './plugin/with-react';
export { ReactUpdatePolicy } from './update-policy';
export type { RangeGeometry, ViewportRect } from './range-geometry';
export type {
  ViewSourceError,
  ViewSourceErrorSink,
  ViewSourceOptions,
  ViewSourcePhase,
  ViewSourceStatus,
} from '../internal/view/view-source';
