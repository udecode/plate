import { definePlugin, DOMPlugin } from '../../lib';
import { plateDOMPlugin } from '../../lib/plugins/dom/plateDOMPlugin.internal';
import { react, type ReactPlugin as RuntimeReactPlugin } from '../plite-react';
import { toReactPlugin } from '../plugin/toReactPlugin';
import { ParagraphPlugin } from '../plugins';
import { NavigationFeedbackPlugin } from '../plugins/navigation-feedback/NavigationFeedbackPlugin';
import type { NavigationFeedbackPluginState } from '../plugins/navigation-feedback/types';

const ReactDOMPlugin = toReactPlugin(DOMPlugin);
const plateReactPlugin: RuntimeReactPlugin = react({
  dom: plateDOMPlugin,
});
const ReactPlugin = toReactPlugin(
  definePlugin('react', {
    dependencies: [DOMPlugin],
  }).extend<RuntimeReactPlugin>(plateReactPlugin)
);

export type ReactCorePlugins = readonly [
  typeof ReactDOMPlugin,
  typeof ReactPlugin,
  ReturnType<typeof NavigationFeedbackPlugin.configure>,
  typeof ParagraphPlugin,
];

export const getPlateCorePlugins = ({
  navigationFeedback,
}: {
  navigationFeedback?: Partial<NavigationFeedbackPluginState> | boolean;
} = {}): ReactCorePlugins => [
  ReactDOMPlugin,
  ReactPlugin,
  NavigationFeedbackPlugin.configure({
    enabled: navigationFeedback !== false,
    initialState:
      typeof navigationFeedback === 'boolean' ? undefined : navigationFeedback,
  }),
  ParagraphPlugin,
];
