import { ParagraphPlugin, ReactPlugin } from '../plugins';
import { SlateReactNextPlugin } from '../plugins/SlateReactNextPlugin';
import { EventEditorPlugin } from '../plugins/event-editor/EventEditorPlugin';

export const getPlateCorePlugins = () => [
  SlateReactNextPlugin,
  ReactPlugin,
  EventEditorPlugin,
  ParagraphPlugin,
];
