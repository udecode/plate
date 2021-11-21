import {
  createPluginFactory,
  onKeyDownToggleMark,
  ToggleMarkPlugin,
} from '@udecode/plate-core';

export const MARK_SUBSCRIPT = 'subscript';

/**
 * Enables support for subscript formatting.
 */
export const createSubscriptPlugin = createPluginFactory<ToggleMarkPlugin>({
  key: MARK_SUBSCRIPT,
  isLeaf: true,
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
  options: {
    hotkey: 'mod+.',
    clear: MARK_SUBSCRIPT,
  },
  deserializeHtml: [
    { validNodeName: ['SUB'] },
    {
      validStyle: {
        verticalAlign: 'sub',
      },
    },
  ],
});
