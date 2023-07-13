import {
  createPluginFactory,
  onKeyDownToggleMark,
  ToggleMarkPlugin,
} from '@udecode/plate-common';

export const MARK_SUBSCRIPT = 'subscript';
const MARK_SUPERSCRIPT = 'superscript';

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
    hotkey: 'mod+,',
    clear: MARK_SUPERSCRIPT,
  },
  deserializeHtml: {
    rules: [
      { validNodeName: ['SUB'] },
      {
        validStyle: {
          verticalAlign: 'sub',
        },
      },
    ],
  },
});
