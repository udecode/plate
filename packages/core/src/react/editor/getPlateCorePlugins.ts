import { DOMPluginBase, type CorePlugin } from '../../lib';
import type { InferConfig, PlatePlugin } from '../plugin';
import { toPlatePlugin } from '../plugin/toPlatePlugin';
import { ParagraphPlugin } from '../plugins';
import { EventEditorPlugin } from '../plugins/event-editor/EventEditorPlugin';
import { NavigationFeedbackPlugin } from '../plugins/navigation-feedback/NavigationFeedbackPlugin';
import type { NavigationFeedbackPluginState } from '../plugins/navigation-feedback/types';

const ReactDOMPlugin = toPlatePlugin(DOMPluginBase, { key: 'dom' });

export type PlateCorePlugins = readonly [
  PlatePlugin<InferConfig<typeof ReactDOMPlugin>>,
  PlatePlugin<InferConfig<typeof EventEditorPlugin>>,
  PlatePlugin<InferConfig<typeof NavigationFeedbackPlugin>>,
  PlatePlugin<InferConfig<typeof ParagraphPlugin>>,
];

export type PlateCorePlugin =
  | CorePlugin
  | InferConfig<typeof EventEditorPlugin>
  | InferConfig<typeof NavigationFeedbackPlugin>
  | InferConfig<typeof ParagraphPlugin>
  | InferConfig<typeof ReactDOMPlugin>;

export const getPlateCorePlugins = ({
  navigationFeedback,
}: {
  navigationFeedback?: Partial<NavigationFeedbackPluginState> | boolean;
} = {}): PlateCorePlugins => [
  ReactDOMPlugin,
  EventEditorPlugin,
  NavigationFeedbackPlugin.configure({
    enabled: navigationFeedback !== false,
    initialState:
      typeof navigationFeedback === 'boolean' ? undefined : navigationFeedback,
  }),
  ParagraphPlugin,
];
