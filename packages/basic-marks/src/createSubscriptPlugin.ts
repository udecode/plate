import {
  type ToggleMarkPlugin,
  createPluginFactory,
  onKeyDownToggleMark,
} from '@udecode/plate-common/server';

export const MARK_SUBSCRIPT = 'subscript';

const MARK_SUPERSCRIPT = 'superscript';

/** Enables support for subscript formatting. */
export const createSubscriptPlugin = createPluginFactory<ToggleMarkPlugin>({
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
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
  isLeaf: true,
  key: MARK_SUBSCRIPT,
  options: {
    clear: MARK_SUPERSCRIPT,
    hotkey: 'mod+,',
  },
});
