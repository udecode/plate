import type { NavigationFeedbackConfig } from '../../lib/plugins/navigation-feedback';

import { ParagraphPlugin, ReactPlugin } from '../plugins';
import { EventEditorPlugin } from '../plugins/event-editor/EventEditorPlugin';
import { NavigationFeedbackPlugin } from '../plugins/navigation-feedback/NavigationFeedbackPlugin';
import { SlateReactExtensionPlugin } from '../plugins/SlateReactExtensionPlugin';

export const getPlateCorePlugins = ({
  navigationFeedback,
}: {
  navigationFeedback?: NavigationFeedbackConfig['options'] | boolean;
} = {}) => [
  SlateReactExtensionPlugin,
  ReactPlugin,
  EventEditorPlugin,
  NavigationFeedbackPlugin.configure({
    enabled: navigationFeedback !== false,
    options:
      typeof navigationFeedback === 'boolean' ? undefined : navigationFeedback,
  }),
  ParagraphPlugin,
];
