import {
  createPluginFactory,
  onKeyDownToggleMark,
  ToggleMarkPlugin,
} from '@udecode/plate-core';

export const MARK_UNDERLINE = 'underline';

/**
 * Enables support for underline formatting.
 */
export const createUnderlinePlugin = createPluginFactory<ToggleMarkPlugin>({
  key: MARK_UNDERLINE,
  isLeaf: true,
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
  options: {
    hotkey: 'mod+u',
  },
  deserializeHtml: [
    { validNodeName: ['U'] },
    {
      validStyle: {
        textDecoration: 'underline',
      },
    },
  ],
});
