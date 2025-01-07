import { ParagraphPlugin, ReactPlugin } from '../plugins';
import { SlateReactExtensionPlugin } from '../plugins/SlateReactExtensionPlugin';
import { EventEditorPlugin } from '../plugins/event-editor/EventEditorPlugin';

export const getPlateCorePlugins = () => [
  SlateReactExtensionPlugin,
  ReactPlugin,
  EventEditorPlugin,
  ParagraphPlugin,
];
