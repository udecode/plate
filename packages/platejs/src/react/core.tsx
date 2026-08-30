/** @platejs-curated-entrypoint */

export * from '../core';
export * from './plite-react';
export * from './hotkeys';
export {
  useComposedRef,
  useIsomorphicLayoutEffect,
} from './internal/react-helpers';
export { EditableElement } from 'plitejs/react';
export type {
  RenderElementProps,
  RenderLeafProps,
  RenderTextProps,
  RenderVoidProps,
} from 'plitejs/react';
export * from './components/NodeSelection';
export * from './components/Plate';
export * from './components/PlateContainer';
export * from './components/PlateContent';
export * from './components/PlateRoot';
export * from './components/PlateView';
export * from './components/plate-nodes';
export type { Editor } from './editor/Editor';
export {
  getPlateCorePlugins,
  type PlateCorePlugin,
  type PlateCorePlugins,
} from './editor/getPlateCorePlugins';
export { useCreateEditor } from './editor/useCreateEditor';
export { useStaticEditor } from './editor/useStaticEditor';
export { createEditor, type CreateEditorOptions } from './editor/withPlate';
export type {
  DOMHandler,
  DOMHandlerProp,
  DOMHandlers,
} from './plugin/DOMHandlers';
export type { KeyboardHandler } from './plugin/KeyboardHandler';
export type {
  ConfiguredPlatePlugin,
  Decorate,
  EditableSiblingComponent,
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
  PlateShortcutRecord,
  PrepareDocument,
  RenderNodeWrapper,
  RenderNodeWrapperConfig,
  RenderNodeWrapperDescriptor,
  RenderNodeWrapperFunction,
  RenderNodeWrapperProps,
  ResolvedPlatePlugin,
  Shortcut,
  Shortcuts,
  TextNodeProps,
  TransformOptions,
  UseHooks,
  ValidatedPlateShortcuts,
} from './plugin/PlatePlugin';
export { definePlatePlugin } from './plugin/definePlatePlugin';
export { omitPluginContext } from './plugin/omitPluginContext';
export { toPlatePlugin } from './plugin/toPlatePlugin';
export { EventEditorPlugin } from './plugins/event-editor/EventEditorPlugin';
export {
  useEventEditorValue,
  useEventPlateId,
  useFocusedLast,
} from './plugins/event-editor/useEventEditor';
export * from './plugins/navigation-feedback/index';
export * from './plugins/paragraph/index';
export * from './stores/element/useElement';
export * from './stores/element/useElementSelector';
export * from './stores/element/usePath';
export {
  PlateController,
  usePlateControllerExists,
  usePlateControllerLocalStore,
  usePlateControllerStore,
} from './stores/plate-controller/plateControllerStore';
export {
  useEditor,
  useEditorId,
  useEditorMounted,
  useEditorSelection,
  useEditorState,
  useEditorValue,
  useOptionalEditor,
  usePlateSet,
  usePlateState,
  usePlateStore,
  usePlateValue,
} from './stores/plate/createPlateStore';
export type {
  PlateStore,
  UseEditorOptions,
  UseEditorStateOptions,
} from './stores/plate/createPlateStore';
export * from './stores/plate/useEditorPlugin';
export * from './stores/plate/useEditorSelector';
export * from './stores/plate/usePluginStore';
export * from './utils/index';

export * from './components/EditorRefEffect';
export * from './components/PlateControllerEffect';
export * from './libs/index';
export * from './plugins/event-editor/EventEditorStore';
export {
  BLUR_EDITOR_EVENT,
  FOCUS_EDITOR_EVENT,
  getEventPlateId,
} from './plugins/event-editor/EventEditorStore';
export { useFocusEditorEvents } from './plugins/event-editor/useEventEditor';
export * from './stores/element/useElementStore';
export type * from './stores/plate/PlateStore';
export * from './stores/plate-controller/plateControllerStore';
export * from './utils/index';
export { BelowRootNodes } from './utils/pluginRenderElement';
export { createPluginContext } from './plugin/createPluginContext.internal';
