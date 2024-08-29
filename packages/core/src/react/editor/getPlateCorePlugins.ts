import { ParagraphPlugin, ReactPlugin } from '../plugins';
import { PlateApiPlugin } from '../plugins/PlateApiPlugin';
import { SlateReactNextPlugin } from '../plugins/SlateReactNextPlugin';
import { EventEditorPlugin } from '../plugins/event-editor/EventEditorPlugin';

export const getPlateCorePlugins = () => [
  SlateReactNextPlugin,
  ReactPlugin,
  EventEditorPlugin,
  PlateApiPlugin,
  ParagraphPlugin,
];
