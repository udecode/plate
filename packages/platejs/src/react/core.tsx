/** @platejs-curated-entrypoint */

export * from '../core';
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
  RenderTextProps,
  RenderVoidProps,
  PliteDecorationAttributes,
  PliteDecoration,
  PliteDecorationRefresh,
  PliteDecorationSource,
  DOMStrategyOptions,
  DOMStrategyType,
  DOMStrategyVirtualizedLayout,
  VirtualizedPageLayoutItem,
  VirtualizedTopLevelLayoutItem,
  PliteHistoryController,
  PliteHistoryFocusPolicy,
  UseElementSelectedMode,
  UseElementSelectedOptions,
  EditorRuntimeStateSelectorOptions,
  EditorViewStateSelectorOptions,
  UsePliteAnnotationStoreOptions,
  PliteContentRootController,
  UsePliteContentRootOptions,
  UsePliteHistoryOptions,
  PliteRootChromeController,
  UsePliteRootChromeOptions,
  PliteRootEditor,
  PliteRuntimeStateSelectorOptions,
  UsePliteRootEditorOptions,
  UsePliteWidgetStoreOptions,
  StateFieldSetter,
  UseStateFieldValueOptions,
  ReactApi,
  ReactExtensionOptions,
  ReactExtension,
  PliteResolvedWidget,
  PliteViewportRect,
  PliteWidget,
  PliteWidgetGeometry,
  PliteWidgetSnapshot,
  PliteWidgetStore,
  PliteWidgetStoreMetrics,
  PliteWidgetStoreOptions,
  PliteWidgetTarget,
  UsePliteWidgetGeometryOptions,
  UseSelectionGeometryOptions,
  PliteViewSourceError,
  PliteViewSourceErrorSink,
  PliteViewSourceOptions,
  PliteViewSourcePhase,
  PliteViewSourceStatus,
} from './plite-react';
export {
  PliteAnnotationProvider,
  useDOMStrategyVirtualOffset,
  useEditorRootElement,
  useEditorRuntimeState,
  useEditorScrollElement,
  useEditorViewState,
  useElementPath,
  useElementSelected,
  usePliteAnnotationStore,
  usePliteAnnotation,
  usePliteAnnotations,
  usePliteChildRoot,
  usePliteContentRoot,
  usePliteHistory,
  usePliteRootChrome,
  usePliteActiveEditor,
  usePliteActiveRoot,
  usePliteRootEditor,
  usePliteRootState,
  usePliteRuntimeState,
  usePliteWidgetStore,
  usePliteWidget,
  usePliteWidgetGeometry,
  usePliteWidgetIds,
  usePliteWidgets,
  useSelectionGeometry,
  useSetStateField,
  useStateFieldValue,
  react,
  PliteReactUpdatePolicy,
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
  PlateElement,
  PlateText,
  PlateLeaf,
  type PlateElementProps,
  type PlateNodeProps,
  type PlateHTMLProps,
  type PlateTextProps,
  type PlateLeafProps,
} from './components/plate-nodes';
export type { Editor } from './editor/Editor';
export { useCreateEditor } from './editor/useCreateEditor';
export { useStaticEditor } from './editor/useStaticEditor';
export { createEditor, type CreateEditorOptions } from './editor/withPlate';
export type { DOMHandler, DOMHandlers } from './plugin/DOMHandlers';
export type { KeyboardHandler } from './plugin/KeyboardHandler';
export type {
  ConfiguredPlatePlugin,
  ContainerSiblingProps,
  Decorate,
  EditableSiblingComponent,
  EditableSiblingProps,
  InjectNodeProps,
  LeafNodeProps,
  NodeProps,
  OnNodeChange,
  OnTextChange,
  PlatePlugin,
  PlatePluginConfiguration,
  PlatePluginContext,
  PlatePluginDefinitionInput,
  PlatePluginExtendInput,
  PlatePluginOn,
  PlatePluginPortal,
  PlateViewElementAttributeEntry,
  PlateViewElementAttributes,
  PrepareDocument,
  RenderNodeWrapper,
  RenderNodeWrapperConfig,
  RenderNodeWrapperDescriptor,
  RenderNodeWrapperFunction,
  RenderNodeWrapperProps,
  Shortcut,
  Shortcuts,
  TextNodeProps,
  TransformOptions,
  UseViewElementAttributes,
} from './plugin/PlatePlugin';
export { definePlatePlugin } from './plugin/definePlatePlugin';
export { toPlatePlugin } from './plugin/toPlatePlugin';
export { useFocusedLast } from './stores/plate-controller/useFocusedLast';
export * from './plugins/navigation-feedback/index';
export * from './plugins/paragraph/index';
export * from './stores/element/useElement';
export * from './stores/element/useElementSelector';
export * from './stores/element/usePath';
export { PlateController } from './components/PlateController';
export { EditorProvider } from './components/EditorProvider';
export {
  useEditor,
  useEditorComposing,
  useEditorFocused,
  useEditorReadOnly,
  useEditorContainerRef,
  useEditorHasSelection,
  useEditorId,
  useEditorMounted,
  useEditorSelection,
  useEditorState,
  useEditorValue,
  useOptionalEditor,
} from './stores/plate/useEditor';
export type { UseEditorStateOptions } from './stores/plate/useEditor';
export * from './stores/plate/useEditorPlugin';
export * from './stores/plate/useEditorSelector';
export {
  usePluginStore,
  useEditorPluginStore,
} from './stores/plate/usePluginStore';
export * from './utils/index';
