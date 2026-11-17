import { definePlugin, DOMPlugin, TransferPlugin } from '../../lib';
import { plateDOMPlugin } from '../../lib/plugins/dom/plateDOMPlugin.internal';
import { react, type ReactPlugin as RuntimeReactPlugin } from '../plite-react';
import { toReactPlugin } from '../plugin/toReactPlugin';
import { ParagraphPlugin } from '../plugins';
import { NavigationFeedbackPlugin } from '../plugins/navigation-feedback/NavigationFeedbackPlugin';

const ReactDOMPlugin = toReactPlugin(DOMPlugin);
const plateReactPlugin: RuntimeReactPlugin = react({
  dom: plateDOMPlugin,
});
const ReactPlugin = toReactPlugin(
  definePlugin('react', {
    dependencies: [DOMPlugin, TransferPlugin],
  }).extend<RuntimeReactPlugin>(plateReactPlugin)
);

export type ReactCorePlugins = readonly [
  typeof ReactDOMPlugin,
  typeof ReactPlugin,
  typeof NavigationFeedbackPlugin,
  typeof ParagraphPlugin,
];

export const getPlateCorePlugins = (): ReactCorePlugins => [
  ReactDOMPlugin,
  ReactPlugin,
  NavigationFeedbackPlugin,
  ParagraphPlugin,
];
