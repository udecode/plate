import {
  type ToggleMarkPluginOptions,
  createSlatePlugin,
  findHtmlParentElement,
} from '@udecode/plate-common';
import { onKeyDownToggleMark } from '@udecode/plate-common/react';

/** Enables support for code formatting */
export const CodePlugin = createSlatePlugin<'code', ToggleMarkPluginOptions>({
  deserializeHtml: {
    query({ element }) {
      const blockAbove = findHtmlParentElement(element, 'P');

      if (blockAbove?.style.fontFamily === 'Consolas') return false;

      return !findHtmlParentElement(element, 'PRE');
    },
    rules: [
      {
        validNodeName: ['CODE'],
      },
      {
        validStyle: {
          fontFamily: 'Consolas',
        },
      },
    ],
  },
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
  isLeaf: true,
  key: 'code',
  options: {
    hotkey: 'mod+e',
  },
});
