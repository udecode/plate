import {
  type ToggleMarkPluginOptions,
  createPlugin,
  onKeyDownToggleMark,
} from '@udecode/plate-common/server';

export const MARK_SUPERSCRIPT = 'superscript';

const MARK_SUBSCRIPT = 'subscript';

/** Enables support for superscript formatting. */
export const SuperscriptPlugin = createPlugin<ToggleMarkPluginOptions>({
  deserializeHtml: {
    rules: [
      { validNodeName: ['SUP'] },
      {
        validStyle: {
          verticalAlign: 'super',
        },
      },
    ],
  },
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
  isLeaf: true,
  key: MARK_SUPERSCRIPT,
  options: {
    clear: MARK_SUBSCRIPT,
    hotkey: 'mod+.',
  },
});
