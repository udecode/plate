import {
  type PluginConfig,
  type ToggleMarkPluginOptions,
  createTPlugin,
} from '@udecode/plate-common';
import { onKeyDownToggleMark } from '@udecode/plate-common/react';

export type HighlightConfig = PluginConfig<
  'highlight',
  ToggleMarkPluginOptions
>;

/**
 * Enables support for highlights, useful when reviewing content or highlighting
 * it for future reference.
 */
export const HighlightPlugin = createTPlugin<HighlightConfig>({
  deserializeHtml: {
    rules: [
      {
        validNodeName: ['MARK'],
      },
    ],
  },
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
  isLeaf: true,
  key: 'highlight',
  options: {
    hotkey: 'mod+shift+h',
  },
});
