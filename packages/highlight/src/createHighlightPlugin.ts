import {
  ToggleMarkPlugin,
  createPluginFactory,
  onKeyDownToggleMark,
} from '@udecode/plate-common';

export const MARK_HIGHLIGHT = 'highlight';

/**
 * Enables support for highlights, useful when reviewing
 * content or highlighting it for future reference.
 */
export const createHighlightPlugin = createPluginFactory<ToggleMarkPlugin>({
  key: MARK_HIGHLIGHT,
  isLeaf: true,
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
  deserializeHtml: {
    rules: [
      {
        validNodeName: ['MARK'],
      },
    ],
  },
  options: {
    hotkey: 'mod+shift+h',
  },
});
