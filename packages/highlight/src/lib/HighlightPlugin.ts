import {
  type PluginConfig,
  type ToggleMarkPluginOptions,
  createTSlatePlugin,
} from '@udecode/plate-common';

export type HighlightConfig = PluginConfig<
  'highlight',
  ToggleMarkPluginOptions
>;

/**
 * Enables support for highlights, useful when reviewing content or highlighting
 * it for future reference.
 */
export const HighlightPlugin = createTSlatePlugin<HighlightConfig>({
  deserializeHtml: {
    rules: [
      {
        validNodeName: ['MARK'],
      },
    ],
  },
  isLeaf: true,
  key: 'highlight',
  options: {
    hotkey: 'mod+shift+h',
  },
});