import {
  createPluginFactory,
  findHtmlParentElement,
  onKeyDownToggleMark,
  ToggleMarkPlugin,
} from '@udecode/plate-core';

export const MARK_CODE = 'code';

/**
 * Enables support for code formatting
 */
export const createCodePlugin = createPluginFactory<ToggleMarkPlugin>({
  key: MARK_CODE,
  isLeaf: true,
  deserializeHtml: [
    {
      validNodeName: ['CODE'],
      query: (el) => !findHtmlParentElement(el, 'PRE'),
    },
    {
      validStyle: {
        wordWrap: 'break-word',
      },
    },
    {
      validStyle: {
        fontFamily: 'Consolas',
      },
    },
  ],
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
  options: {
    hotkey: 'mod+e',
  },
});
