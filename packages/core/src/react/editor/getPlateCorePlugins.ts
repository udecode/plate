import { ParagraphPlugin, ReactPlugin } from '../plugins';
import { EventEditorPlugin } from '../plugins/event-editor/EventEditorPlugin';
import { SlateReactExtensionPlugin } from '../plugins/SlateReactExtensionPlugin';

export const getPlateCorePlugins = () => [
  SlateReactExtensionPlugin,
  ReactPlugin,
  EventEditorPlugin,
  ParagraphPlugin,
];
