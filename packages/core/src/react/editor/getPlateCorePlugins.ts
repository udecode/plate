import { ParagraphPlugin, ReactPlugin } from '../plugins';
import { EventEditorPlugin } from '../plugins/event-editor/EventEditorPlugin';
import { NavigationFeedbackPlugin } from '../plugins/navigation-feedback/NavigationFeedbackPlugin';
import { SlateReactExtensionPlugin } from '../plugins/SlateReactExtensionPlugin';

export const getPlateCorePlugins = () => [
  SlateReactExtensionPlugin,
  ReactPlugin,
  EventEditorPlugin,
  NavigationFeedbackPlugin,
  ParagraphPlugin,
];
