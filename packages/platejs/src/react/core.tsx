/** @platejs-curated-entrypoint */

export * from '../core';
export type {
  Annotation,
  AnnotationAnchor,
  AnnotationChange,
  AnnotationRefreshOptions,
  AnnotationSnapshot,
  AnnotationStore,
  AnnotationStoreOptions,
  OwnedAnnotationStore,
  ResolvedAnnotation,
  EditableHandlerResult,
  EditableHistoryReplayEvent,
  EditableHistoryReplayResult,
  EditableDropResult,
  EditablePasteResult,
  RenderPlaceholderProps,
  EditableDOMCoverageBoundaryMaterializePayload,
  EditableDOMCoverageBoundaryPlaceholderContext,
  EditableDOMCoverageBoundaryProps,
  EditableDOMCoverageBoundaryScope,
  EditableElementSlots,
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
  RenderElementProps,
  RenderLeafProps,
  RenderTextHostProps,
  RenderTextPieceProps,
  RenderTextProps,
  RenderVoidProps,
  DecorationAttributes,
  Decoration,
  DecorationRefresh,
  DecorationSource,
  EditorHistoryController,
  EditorHistoryFocusPolicy,
  UseElementSelectedMode,
  UseElementSelectedOptions,
  EditorRuntimeStateSelectorOptions,
  EditorRootAreas,
  EditorSelectorDependencies,
  EditorSelectorDependency,
  EditorViewStateSelectorOptions,
  UseAnnotationStoreOptions,
  ContentRootController,
  UseContentRootOptions,
  UseEditorHistoryOptions,
  RootChromeController,
  UseRootChromeOptions,
  RuntimeStateSelectorOptions,
  UseRootEditorOptions,
  StateFieldSetter,
  ReactApi,
  ReactPluginOptions,
  ReactPlugin as RuntimeReactPlugin,
  RangeGeometry,
  RangeRects,
  TypedText,
  TypedTextListener,
  ViewportRect,
  UseEditableClipOptions,
  UseSelectionGeometryOptions,
  ViewSourceError,
  ViewSourceErrorSink,
  ViewSourceOptions,
  ViewSourcePhase,
  ViewSourceStatus,
} from './plite-react';
export {
  useEditorRootAreas,
  useEditorRootElement,
  useEditorRuntimeState,
  useEditorScrollElement,
  useEditorScrollElementRef,
  useEditorViewState,
  useElementPath,
  useElementSelected,
  useAnnotationStore,
  useAnnotation,
  useAnnotations,
  useChildRoot,
  useContentRoot,
  useDropIndicator,
  installBrowserHandle,
  useRootChrome,
  useRootState,
  useRuntimeState,
  useEditableClip,
  useSelectionGeometry,
  react,
  ReactUpdatePolicy,
} from './plite-react';
export {
  useComposedRef,
  useIsomorphicLayoutEffect,
} from './internal/react-helpers';
export * from './components/NodeSelection';
export * from './components/Plate';
export * from './components/PlateContainer';
export * from './components/PlateContent';
export * from './components/PlateView';
export {
  EditorElement,
  EditorText,
  EditorLeaf,
  type EditorElementProps,
  type EditorNodeProps,
  type EditorHTMLProps,
  type EditorTextProps,
  type EditorLeafProps,
} from './components/plate-nodes';
export type { Editor, EditorReference } from './editor/Editor';
export { useCreateEditor } from './editor/useCreateEditor';
export { createEditor, type CreateEditorOptions } from './editor/withPlate';
export type { DOMHandler, DOMHandlers } from './plugin/DOMHandlers';
export type { KeyboardHandler } from './plugin/KeyboardHandler';
export type {
  ConfiguredPlugin,
  ContainerSiblingProps,
  Decorate,
  EditableSiblingComponent,
  EditableSiblingProps,
  InjectNodeProps,
  NodeAttributes,
  OnNodeChange,
  OnTextChange,
  PluginConfiguration,
  PluginApiContext,
  PluginContext,
  PluginExtendInput,
  PluginOn,
  ViewElementAttributeEntry,
  ViewElementAttributes,
  RenderNodeWrapper,
  RenderNodeWrapperConfig,
  RenderNodeWrapperDescriptor,
  RenderNodeWrapperFunction,
  RenderNodeWrapperProps,
  Shortcut,
  Shortcuts,
  TransformOptions,
  UseViewElementAttributes,
  WrapContentProps,
  WrapRootProps,
} from './plugin/PlatePlugin';
export { definePlugin } from './plugin/definePlugin';
export { toReactPlugin } from './plugin/toReactPlugin';
export { useFocusedLast } from './stores/plate-controller/useFocusedLast';
export * from './plugins/navigation-feedback/index';
export * from './plugins/paragraph/index';
export * from './stores/element/useElement';
export * from './stores/element/useElementSelector';
export * from './stores/element/usePath';
export { EditorController } from './components/PlateController';
export { EditorProvider } from './components/EditorProvider';
export {
  useEditor,
  useEditorComposing,
  useEditorFocused,
  useModelEditor,
  useEditorReadOnly,
  useEditableRef,
  useEditorContainerRef,
  useEditorHasSelection,
  useEditorId,
  useEditorMounted,
  useEditorSelection,
  useEditorState,
  useEditorValue,
  useOptionalEditor,
  useRootEditor,
  useSetStateField,
  useStateFieldValue,
} from './stores/plate/useEditor';
export type {
  UseEditorStateOptions,
  UseStateFieldValueOptions,
} from './stores/plate/useEditor';
export * from './stores/plate/useEditorHistory';
export * from './stores/plate/useEditorSelector';
export {
  usePluginStore,
  useEditorPluginStore,
} from './stores/plate/usePluginStore';
export { useViewStore } from './stores/plate/useViewStore';
export * from './utils/index';
