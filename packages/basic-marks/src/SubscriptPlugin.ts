import {
  type ToggleMarkPluginOptions,
  createPlugin,
} from '@udecode/plate-common';
import { onKeyDownToggleMark } from '@udecode/plate-common/react';

export const MARK_SUBSCRIPT = 'subscript';

const MARK_SUPERSCRIPT = 'superscript';

/** Enables support for subscript formatting. */
export const SubscriptPlugin = createPlugin<
  'subscript',
  ToggleMarkPluginOptions
>({
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
