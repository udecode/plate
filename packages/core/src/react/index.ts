/** @platejs-curated-entrypoint */

export * from './plite-react';
export * from './components/Plate';
export * from './components/PlateContainer';
export * from './components/PlateContent';
export * from './components/NodeSelection';
export * from './components/PlateRoot';
export * from './components/PlateView';
export * from './components/plate-nodes';
export type { PlateEditor, PlateEditorReference } from './editor/PlateEditor';
export {
  getPlateCorePlugins,
  type PlateCorePlugin,
  type PlateCorePlugins,
} from './editor/getPlateCorePlugins';
export { usePlateEditor } from './editor/usePlateEditor';
export { usePlateViewEditor } from './editor/usePlateViewEditor';
export {
  createPlateEditor,
  type CreatePlateEditorOptions,
} from './editor/withPlate';
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
  RenderNodeWrapper,
  RenderNodeWrapperConfig,
  RenderNodeWrapperDescriptor,
  RenderNodeWrapperFunction,
  RenderNodeWrapperProps,
  ResolvedPlatePlugin,
  Shortcut,
  Shortcuts,
  TextNodeProps,
  PrepareDocument,
  TransformOptions,
  UseHooks,
  ValidatedPlateShortcuts,
} from './plugin/PlatePlugin';
export { definePlatePlugin } from './plugin/definePlatePlugin';
export { omitPluginContext } from './plugin/omitPluginContext';
export { toPlatePlugin } from './plugin/toPlatePlugin';
export * from './plugins/navigation-feedback/index';
export * from './plugins/paragraph/index';
export * from './stores/element/useElement';
export * from './stores/element/useElementSelector';
export * from './stores/element/usePath';
export * from './stores/plate/useEditorPlugin';
export * from './stores/plate/useEditorSelector';
export * from './stores/plate/usePluginStore';

export { EventEditorPlugin } from './plugins/event-editor/EventEditorPlugin';
export {
  useEventEditorValue,
  useEventPlateId,
  useFocusedLast,
} from './plugins/event-editor/useEventEditor';
export {
  PlateController,
  usePlateControllerExists,
  usePlateControllerLocalStore,
  usePlateControllerStore,
} from './stores/plate-controller/plateControllerStore';
export {
  useActiveEditor,
  useEditor,
  useEditorId,
  useEditorMounted,
  useEditorSelection,
  useEditorState,
  useEditorValue,
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
