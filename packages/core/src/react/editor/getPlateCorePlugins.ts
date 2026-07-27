import { DOMPluginBase } from '../../lib';
import type { InferConfig, PlatePlugin } from '../plugin';
import { toPlatePlugin } from '../plugin/toPlatePlugin';
import { ParagraphPlugin } from '../plugins';
import { EventEditorPlugin } from '../plugins/event-editor/EventEditorPlugin';
import { NavigationFeedbackPlugin } from '../plugins/navigation-feedback/NavigationFeedbackPlugin';
import type { NavigationFeedbackConfig } from '../plugins/navigation-feedback/types';

const ReactDOMPlugin = (
  toPlatePlugin as unknown as (
    basePlugin: typeof DOMPluginBase,
    config: { key: string }
  ) => PlatePlugin<InferConfig<typeof DOMPluginBase>>
)(DOMPluginBase, { key: 'dom' });

export type PlateCorePlugins = readonly [
  PlatePlugin<InferConfig<typeof ReactDOMPlugin>>,
  PlatePlugin<InferConfig<typeof EventEditorPlugin>>,
  PlatePlugin<InferConfig<typeof NavigationFeedbackPlugin>>,
  PlatePlugin<InferConfig<typeof ParagraphPlugin>>,
];

export const getPlateCorePlugins = ({
  navigationFeedback,
}: {
  navigationFeedback?:
    | Partial<NavigationFeedbackConfig['initialState']>
    | boolean;
} = {}): PlateCorePlugins => [
  ReactDOMPlugin,
  EventEditorPlugin,
  (
    NavigationFeedbackPlugin.configure as (config: {
      enabled: boolean;
      initialState:
        | Partial<NavigationFeedbackConfig['initialState']>
        | undefined;
    }) => PlatePlugin<InferConfig<typeof NavigationFeedbackPlugin>>
  )({
    enabled: navigationFeedback !== false,
    initialState:
      typeof navigationFeedback === 'boolean' ? undefined : navigationFeedback,
  }),
  ParagraphPlugin,
];
