import { defineBasePlugin, DOMPlugin } from '../../lib';
import { plateDOMExtension } from '../../lib/plugins/dom/plateDOMExtension.internal';
import { react, type ReactExtension } from '../plite-react';
import { toPlatePlugin } from '../plugin/toPlatePlugin';
import { ParagraphPlugin } from '../plugins';
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
  ReturnType<typeof NavigationFeedbackPlugin.configure>,
  typeof ParagraphPlugin,
];

export const getPlateCorePlugins = ({
  navigationFeedback,
}: {
  navigationFeedback?: Partial<NavigationFeedbackPluginState> | boolean;
} = {}): PlateCorePlugins => [
  ReactDOMPlugin,
  ReactPlugin,
  NavigationFeedbackPlugin.configure({
    enabled: navigationFeedback !== false,
    initialState:
      typeof navigationFeedback === 'boolean' ? undefined : navigationFeedback,
  }),
  ParagraphPlugin,
];
