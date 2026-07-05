import { DOMPluginBase } from '../../lib';
import { toPlatePlugin } from '../plugin/toPlatePlugin';
import { ParagraphPlugin } from '../plugins';
import { EventEditorPlugin } from '../plugins/event-editor/EventEditorPlugin';
import { NavigationFeedbackPlugin } from '../plugins/navigation-feedback/NavigationFeedbackPlugin';
import type { NavigationFeedbackConfig } from '../plugins/navigation-feedback/types';
import { EditableMetadataPlugin } from './internal/EditableMetadataPlugin';

const ReactDOMPlugin = toPlatePlugin(DOMPluginBase, { key: 'dom' });

export const getPlateCorePlugins = ({
  navigationFeedback,
}: {
  navigationFeedback?: Partial<NavigationFeedbackConfig['options']> | boolean;
} = {}) => [
  ReactDOMPlugin,
  EditableMetadataPlugin,
  EventEditorPlugin,
  NavigationFeedbackPlugin.configure({
    enabled: navigationFeedback !== false,
    options:
      typeof navigationFeedback === 'boolean' ? undefined : navigationFeedback,
  }),
  ParagraphPlugin,
];
