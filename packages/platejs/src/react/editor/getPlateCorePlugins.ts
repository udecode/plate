import {
  defineBasePlugin,
  DOMPlugin,
  type CorePluginDefinition,
  type DefinitionOf,
} from '../../lib';
import { plateDOMExtension } from '../../lib/plugins/dom/plateDOMExtension.internal';
import { react, type ReactExtension } from '../plite-react';
import { toPlatePlugin } from '../plugin/toPlatePlugin';
import { ParagraphPlugin } from '../plugins';
import { EventEditorPlugin } from '../plugins/event-editor/EventEditorPlugin';
import { NavigationFeedbackPlugin } from '../plugins/navigation-feedback/NavigationFeedbackPlugin';
import type { NavigationFeedbackPluginState } from '../plugins/navigation-feedback/types';

const ReactDOMPlugin = toPlatePlugin(DOMPlugin);
const plateReactExtension: ReactExtension = react({
  dom: plateDOMExtension,
});
const ReactPlugin = toPlatePlugin(
  defineBasePlugin('react', {
    dependencies: [DOMPlugin],
  }).extend<ReactExtension>(plateReactExtension)
);

export type PlateCorePlugins = readonly [
  typeof ReactDOMPlugin,
  typeof ReactPlugin,
  typeof EventEditorPlugin,
  ReturnType<typeof NavigationFeedbackPlugin.configure>,
  typeof ParagraphPlugin,
];

export type PlateCorePlugin =
  | CorePluginDefinition
  | DefinitionOf<typeof EventEditorPlugin>
  | DefinitionOf<typeof NavigationFeedbackPlugin>
  | DefinitionOf<typeof ParagraphPlugin>
  | DefinitionOf<typeof ReactPlugin>
  | DefinitionOf<typeof ReactDOMPlugin>;

export const getPlateCorePlugins = ({
  navigationFeedback,
}: {
  navigationFeedback?: Partial<NavigationFeedbackPluginState> | boolean;
} = {}): PlateCorePlugins => [
  ReactDOMPlugin,
  ReactPlugin,
  EventEditorPlugin,
  NavigationFeedbackPlugin.configure({
    enabled: navigationFeedback !== false,
    initialState:
      typeof navigationFeedback === 'boolean' ? undefined : navigationFeedback,
  }),
  ParagraphPlugin,
];
