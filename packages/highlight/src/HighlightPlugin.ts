import {
  type ToggleMarkPluginOptions,
  createPlugin,
  onKeyDownToggleMark,
} from '@udecode/plate-common/server';

export const MARK_HIGHLIGHT = 'highlight';

/**
 * Enables support for highlights, useful when reviewing content or highlighting
 * it for future reference.
 */
export const HighlightPlugin = createPlugin<ToggleMarkPluginOptions>({
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
  key: MARK_HIGHLIGHT,
  options: {
    hotkey: 'mod+shift+h',
  },
});
