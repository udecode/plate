import { DOMPluginBase } from '../../lib';
import type { InferConfig, PlatePlugin } from '../plugin';
import { toPlatePlugin } from '../plugin/toPlatePlugin';
import { ParagraphPlugin } from '../plugins';
import { EventEditorPlugin } from '../plugins/event-editor/EventEditorPlugin';
import { NavigationFeedbackPlugin } from '../plugins/navigation-feedback/NavigationFeedbackPlugin';
import type { NavigationFeedbackConfig } from '../plugins/navigation-feedback/types';

const ReactDOMPlugin = toPlatePlugin(DOMPluginBase, { key: 'dom' });

export type PlateCorePlugins = readonly [
  PlatePlugin<InferConfig<typeof ReactDOMPlugin>>,
  PlatePlugin<InferConfig<typeof EventEditorPlugin>>,
  PlatePlugin<InferConfig<typeof NavigationFeedbackPlugin>>,
  PlatePlugin<InferConfig<typeof ParagraphPlugin>>,
];

export const getPlateCorePlugins = ({
  navigationFeedback,
}: {
  navigationFeedback?: Partial<NavigationFeedbackConfig['options']> | boolean;
} = {}): PlateCorePlugins => [
  ReactDOMPlugin,
  EventEditorPlugin,
  NavigationFeedbackPlugin.configure({
    enabled: navigationFeedback !== false,
    options:
      typeof navigationFeedback === 'boolean' ? undefined : navigationFeedback,
  }),
  ParagraphPlugin,
];
